// notes/python/py_context.js — Context Managers
Object.assign(TOPIC_CONTENT, {
  "py_context": `<main>
<h1>Context Managers</h1>
  <div class="where"><span>Python</span><span>Advanced Python</span><span>Advanced Python Functions</span><span>Context Managers</span></div>
  <p class="lead">Files must be closed, locks released, database transactions committed or rolled back, and temporary settings put back, <em>even when something goes wrong in the middle</em>. The <code>with</code> statement is Python's guarantee of that. This note builds it from the bug it fixes: an error that skips the <code>close()</code> line, then <code>try/finally</code>, then <code>with</code> taken apart into the two methods it calls, <code>__enter__</code> and <code>__exit__</code>, then the shortcut <code>@contextmanager</code>, which turns a generator into a context manager and so ties this note to the two before it. The running example is Chai Corner's order log again, and every piece of code was run with its real output shown.</p>

  <h2 id="pc-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 170" width="640">
    <defs><marker id="pc-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="230" y="8" width="180" height="30" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="28" text-anchor="middle" font-size="12">Advanced Python Functions: map</text>
    <line x1="320" y1="38" x2="110" y2="70" stroke="currentColor" stroke-opacity="0.45"/>
    <line x1="320" y1="38" x2="320" y2="70" stroke="currentColor" stroke-opacity="0.45"/>
    <line x1="320" y1="38" x2="530" y2="70" stroke="currentColor" stroke-opacity="0.45"/>
    <rect x="20" y="70" width="180" height="34" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="110" y="92" text-anchor="middle" font-size="12">Iterators &amp; Generators</text>
    <rect x="230" y="70" width="180" height="34" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="92" text-anchor="middle" font-size="12">Closures &amp; Decorators</text>
    <rect x="440" y="70" width="180" height="34" rx="6" class="fg sg" stroke-width="2.5"/><text x="530" y="92" text-anchor="middle" font-size="12" font-weight="700">Context Managers</text>
    <path d="M110,104 Q300,170 520,110" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#pc-a0)"/>
    <path d="M320,104 Q420,140 510,108" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#pc-a0)"/>
    <text x="250" y="162" text-anchor="middle" class="tm" font-size="11">generator (yield) + decorator = @contextmanager</text>
  </svg><figcaption>The Advanced Python Functions group. You are on the green note, the last of the three. Both siblings feed into it: @contextmanager is a decorator that turns a generator into a context manager.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="py_io">Exceptions, Files &amp; Packages</a>, <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a> and <a class="xref" data-note="py_decorators">Closures &amp; Decorators</a></b><span>You know <code>try/except/finally</code> and <code>open()</code>; you know a generator pauses at <code>yield</code> and runs its <code>finally</code> when closed; you know a decorator wraps before/after code around a whole function call. Left open: how do you wrap setup and guaranteed cleanup around a <em>block</em> of lines, not a whole function? The group map, <a class="xref" data-note="py_advanced">Advanced Python Functions: the map</a>, introduced the Chai Corner log.</span></li>
    <li><b>This note adds: guaranteed cleanup</b><span>The leak problem, <code>try/finally</code>, the <code>with</code> statement desugared, <code>__enter__</code>/<code>__exit__</code> and the three exception arguments, suppressing errors by returning <code>True</code>, <code>@contextmanager</code> (and how it works inside), <code>ExitStack</code>, and real uses: files, locks, database transactions, timers, temporary settings.</span></li>
    <li><b>Leads to: <a class="xref" data-note="py_concurrency">Concurrency &amp; Async</a> and <a class="xref" data-note="py_testing">Testing &amp; Debugging</a></b><span><code>with lock:</code> protects shared data between threads, and <code>async with</code> is the asynchronous version. In tests, <code>pytest.raises</code>, <code>mock.patch</code> and yield-fixtures are context managers. Database code (<a class="xref" data-note="sql_transactions">Transactions</a>) and PyTorch's <code>torch.no_grad()</code> (<a class="xref" data-note="dl_pytorch">PyTorch</a>) use the same pattern.</span></li>
  </ol>

  <h2 id="pc-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each idea answers the question above it, and its weakness raises the next question. Running example: the Chai Corner log, whose junk line "till restarted" makes a strict parser raise <code>ValueError</code>.</p>
  <ol class="story">
    <li><b>The leak</b><span>Q: what happens to an open file when an error jumps past <code>f.close()</code>? → It stays open (<code>f.closed</code> is <code>False</code>; 1000 failed requests leak 1000 handles). We need cleanup that runs on every way out…</span></li>
    <li><b>try/finally</b><span>Q: how do we make cleanup unconditional? → Put it in <code>finally</code>. Correct, but four extra lines at every use, and easy to forget. Can the cleanup be packaged with the resource?</span></li>
    <li><b>The with statement</b><span>Q: can one line give the same guarantee? → <code>with open(p) as f:</code> closes the file even when the block raises. But what does <code>with</code> actually call, and can our own objects work with it?</span></li>
    <li><b><code>__enter__</code> / <code>__exit__</code></b><span>Q: what is the protocol? → <code>__enter__</code> runs first and its return value goes to <code>as</code>; <code>__exit__(exc_type, exc, tb)</code> runs on every exit: normal end, <code>return</code>, or exception (all <code>None</code> if no error). What does <code>__exit__</code>'s return value do?</span></li>
    <li><b>Suppressing errors</b><span>Q: can a context manager handle the error itself? → Return <code>True</code> and the error is swallowed: <code>suppress(ValueError)</code> skips bad lines and still totals ₹225. But a manager that swallows everything hides a typo (total 60 instead of 195)… and writing a class each time is heavy.</span></li>
    <li><b>@contextmanager</b><span>Q: is there a shorter way? → A generator: code before <code>yield</code> = enter, the body runs while it is paused, <code>finally</code> = exit. It is built from the two previous notes (a decorator wrapping a generator). Transaction: COMMIT 4 rows, or ROLLBACK with the ledger unchanged. But what if the number of resources is only known at run time?</span></li>
    <li><b>ExitStack</b><span>Q: how do we open a list of files safely? → <code>ExitStack</code> enters any number and closes them in reverse (week total ₹485); if the third fails to open, the first two are still closed. Where else is this used?</span></li>
    <li><b>Real uses</b><span>Q: what else needs guaranteed cleanup? → Locks (40,000 sales from 4 threads, none lost), DB transactions (commit/rollback), timers, temporary settings (GST 18% just for one block), captured output, working directory, decimal precision.</span></li>
    <li><b>Traps</b><span>Q: what goes wrong? → <code>yield</code> without <code>try/finally</code> skips cleanup; <code>__exit__</code> returning <code>True</code> hides bugs; <code>with conn:</code> in sqlite3 does not close the connection; a lazy generator escaping its <code>with</code>.</span></li>
  </ol>

  <h2 id="pc-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Context Managers</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The problem</div>
        <ul>
          <li>Error between open and close → <code>close()</code> skipped</li>
          <li>Our log: ValueError at "till restarted", total so far 195, file still open</li>
          <li>1000 failures → 1000 leaked handles (limit per process is finite)</li>
          <li>Fix 1: <code>try/finally</code>; Fix 2: <code>with</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The protocol</div>
        <ul>
          <li><code>with m as x:</code> → <code>x = m.__enter__()</code>, body, <code>m.__exit__(…)</code></li>
          <li><code>__exit__(exc_type, exc, tb)</code>: all <code>None</code> on success</li>
          <li>Runs on normal end, <code>return</code>, <code>break</code>, exception</li>
          <li>Return <b>True</b> = swallow; False/None = re-raise</li>
          <li>💡 a library book with automatic return</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">@contextmanager</div>
        <ul>
          <li>Before <code>yield</code> = enter; yielded value → <code>as</code></li>
          <li>Body runs while the generator is paused at <code>yield</code></li>
          <li>Body's error is thrown in <em>at</em> the <code>yield</code></li>
          <li><code>finally</code> = exit; ⚠ no try/finally → cleanup skipped</li>
          <li>Built from a generator + a decorator; also usable as <code>@timer(...)</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Many resources</div>
        <ul>
          <li><code>with a() as x, b() as y:</code> for a fixed few</li>
          <li><b>ExitStack</b>: <code>enter_context</code> in a loop, <code>callback</code></li>
          <li>Closes in reverse order: wed, tue, mon</li>
          <li>Failure halfway → the already-opened ones are closed</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Real uses</div>
        <ul>
          <li>Files · <code>with lock:</code> · <code>with conn:</code> (commit/rollback)</li>
          <li>Timers · temporary settings · <code>redirect_stdout</code> · <code>chdir</code> · <code>localcontext</code></li>
          <li><code>suppress(Error)</code> · <code>torch.no_grad()</code> · <code>mlflow.start_run()</code></li>
          <li><code>pytest.raises</code>, <code>mock.patch</code></li>
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
      <div class="rm-item rm-done" data-target="pc-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="pc-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Problem</span><span class="rm-sub">Cleanup that doesn't happen</span></div></div>
      <div class="rm-item rm-done" data-target="pc-with"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">try/finally and with</span><span class="rm-sub">with, desugared</span></div></div>
      <div class="rm-item rm-done" data-target="pc-protocol"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">__enter__ and __exit__</span><span class="rm-sub">Writing your own</span></div></div>
      <div class="rm-item rm-done" data-target="pc-suppress"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Swallowing Errors</span><span class="rm-sub">What __exit__ returns</span></div></div>
      <div class="rm-item rm-done" data-target="pc-cm"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">@contextmanager</span><span class="rm-sub">A generator as a with-block</span></div></div>
      <div class="rm-item rm-done" data-target="pc-exitstack"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">ExitStack</span><span class="rm-sub">Any number of resources</span></div></div>
      <div class="rm-item rm-done" data-target="pc-real"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Real Uses</span><span class="rm-sub">Locks, DB, settings, stdlib</span></div></div>
      <div class="rm-item rm-done" data-target="pc-connect"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="pc-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Skipped cleanup, hidden bugs</span></div></div>
      <div class="rm-item rm-done" data-target="pc-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="pc-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="pc-why"><span class="num">01</span>The Problem: Cleanup That Doesn't Happen</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Our code opens the order log, works through it, and closes it. What happens to the open file if an error is raised halfway through, before the <code>close()</code> line?</p>
  </div>
  <p>The running example is the same six-line log as in the sibling notes. <code>read_orders</code> is the careful generator from <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>; it skips the comment and the junk line and totals ₹225.</p>
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
  <table class="tbl out"><caption>Trace of the strict parser</caption>
    <tr><th>Line</th><th>Content</th><th>What happens</th><th>total</th></tr>
    <tr><td>1</td><td># Chai Corner…</td><td>skipped</td><td>0</td></tr>
    <tr><td>2–4</td><td>chai, samosa, cold coffee</td><td>parsed: +60, +45, +90</td><td>195</td></tr>
    <tr><td>5</td><td>till restarted</td><td><code>split(",")</code> gives 1 part; unpacking into 4 names raises <code>ValueError</code></td><td>195</td></tr>
    <tr><td>—</td><td><code>f.close()</code></td><td><strong>skipped</strong>: the exception jumped straight to <code>except</code></td><td>—</td></tr>
  </table>
  <p>The error handler ran, but the file was left open. One leaked file handle is harmless. A till server that hits the bad line on every request is not:</p>
  <div class="fx" data-lang="py">import os, resource

def open_handles():
    return len(os.listdir("/proc/self/fd"))   # Linux: one entry per open file

before = open_handles()
kept = []
for _ in range(1000):                          # 1000 requests to a long-running till server
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
  <div class="callout anlg"><span class="label">Analogy</span><p>Borrowing a book from a library. If you must remember to return it yourself, then on the day an emergency calls you away, the book stays out. A library with an automatic return gate is different: whatever happens while you read, the moment you walk out of the door the book is returned. That gate is what we want for files.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>resource</strong> is anything acquired from the operating system or another system that must be released: file handles, sockets, locks, database connections and transactions, temporary changes to global settings. A <strong>resource leak</strong> is acquiring without a guaranteed release.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"Python's garbage collector closes it eventually." In CPython a file is closed when its last reference disappears, but any lingering reference (a list, a traceback, a closure) keeps it open, and other Python implementations collect much later. Never rely on it for cleanup.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: try/finally and with.</b> We need a <code>close()</code> that runs however the block ends: success, error, or <code>return</code>. What Python construct guarantees that?</div>

  <h2 id="pc-with"><span class="num">02</span>try/finally and the with Statement</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How do we make the cleanup line unconditional, and can it be done without wrapping every single use of a file in four extra lines?</p>
  </div>
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
  <h3>What with actually does</h3>
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
  <div class="bridge"><b>What this still can't tell us → next: Writing __enter__ and __exit__.</b> Files already have these two methods. To give our own resources (a log reader, a timer) the same guarantee, we write the methods ourselves. What exactly arrives in <code>__exit__</code>'s three arguments?</div>

  <h2 id="pc-protocol"><span class="num">03</span>__enter__ and __exit__: Writing Your Own</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How do we make our own object usable with <code>with</code>, and how does its cleanup code find out whether the block succeeded or failed, and with which error?</p>
  </div>
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
  <h3>A timer as a context manager</h3>
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
  <div class="bridge"><b>What this still can't tell us → next: Swallowing Errors.</b> Every <code>__exit__</code> so far returned <code>False</code>. The expansion in section 02 showed that a true return value stops the error. When is that useful, and when is it dangerous?</div>

  <h2 id="pc-suppress"><span class="num">04</span>Swallowing Errors: What __exit__ Returns</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Sometimes an error is expected and harmless: a junk line in the log should just be skipped. Can a context manager decide that an error is handled, so the program carries on?</p>
  </div>
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
  <h3>The danger: swallowing everything</h3>
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
  <div class="bridge"><b>What this still can't tell us → next: @contextmanager.</b> Every context manager so far was a class with two methods and some <code>self.</code> attributes just to carry state from enter to exit. "Do X before, Y after, even on error" sounds like it should take a few lines. Is there a shorter way?</div>

  <h2 id="pc-cm"><span class="num">05</span>@contextmanager: A Generator as a Context Manager</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A context manager needs to run some code, pause while the <code>with</code> body runs, then resume to clean up, keeping its local variables in between. Have we met a function that can pause and resume with its variables kept?</p>
  </div>
  <p>Yes: a generator (<a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>). A generator runs up to <code>yield</code>, pauses with its locals intact, and resumes later, and its <code>finally</code> runs even if it is closed or thrown an exception. That is exactly the shape of a context manager. <code>contextlib.contextmanager</code> is a decorator (<a class="xref" data-note="py_decorators">Closures &amp; Decorators</a>) that turns such a generator function into a context-manager factory.</p>
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
  <h3>How it works inside</h3>
  <p>Nothing magic: <code>@contextmanager</code> returns an object whose <code>__enter__</code> calls <code>next(gen)</code> (run to the <code>yield</code>), and whose <code>__exit__</code> either calls <code>next(gen)</code> again (no error: run the rest; the generator must then finish) or calls <code>gen.throw(exc)</code> (error: raise it at the <code>yield</code>). Here is a simplified version, built from the two earlier notes, working on its own:</p>
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
  <h3>Commit or roll back: a transaction</h3>
  <p>Because the body's error arrives at the <code>yield</code>, the generator can react to success and failure differently, with <code>try/except/else/finally</code> around the <code>yield</code>. Chai Corner records each day's sales into a ledger, all or nothing:</p>
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
  <h3>Bonus: the same object works as a decorator</h3>
  <p>Objects made by <code>@contextmanager</code> are also decorators (they inherit from <code>contextlib.ContextDecorator</code>): <code>@timer("…")</code> wraps every call of a function in <code>with timer("…"):</code>. The two siblings meet in one line.</p>
  <div class="fx" data-lang="py">@timer("nightly report")                       # a @contextmanager object also works as a decorator
def nightly_report():
    return sum(o["qty"] * o["price"] for o in read_orders("orders.log"))

print(nightly_report())</div>
  <div class="fx" data-lang="text">[nightly report] start
[nightly report] took 0.0001s
225</div>
  <div class="callout def"><span class="label">Definition</span><p><code>@contextlib.contextmanager</code> turns a generator function that yields exactly once into a factory of context managers. Code before the <code>yield</code> runs on enter, the yielded value is bound by <code>as</code>, an exception in the body is re-raised inside the generator at the <code>yield</code>, and code after it (ideally in <code>finally</code>) runs on exit. If the generator catches the exception and does not re-raise, it is suppressed.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: ExitStack.</b> One <code>with</code> handles one resource; <code>with a() as x, b() as y:</code> handles a fixed few. A week of logs is a list of paths known only at run time. How do we open all of them and guarantee every one is closed?</div>

  <h2 id="pc-exitstack"><span class="num">06</span>ExitStack: Any Number of Resources</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We want to open Monday's, Tuesday's and Wednesday's logs together. The number of files comes from a list. We cannot write a variable number of nested <code>with</code> lines. And if the third file fails to open, the first two must still be closed.</p>
  </div>
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
  <div class="bridge"><b>What this still can't tell us → next: Real Uses.</b> We have the full toolkit: classes, <code>@contextmanager</code>, <code>suppress</code>, <code>ExitStack</code>. Where does guaranteed cleanup matter beyond files?</div>

  <h2 id="pc-real"><span class="num">07</span>Real Uses: Locks, Transactions, Settings</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Files are one resource. What other "acquire, use, release" pairs does real code have, and which standard tools already speak the <code>with</code> protocol?</p>
  </div>
  <h3>Locks</h3>
  <p>Four till threads record masala chai sales into one shared dict. <code>sold[...] += 1</code> is a read, an add and a write; two threads can interleave and lose a sale. A lock lets one thread at a time through, and <code>with lock:</code> guarantees it is released even if the body raises (a lock left held makes every other thread wait forever). See <a class="xref" data-note="py_concurrency">Concurrency &amp; Async</a>.</p>
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
  <p>A <code>sqlite3</code> connection is a context manager whose <code>__exit__</code> commits on success and rolls back on an exception: our <code>transaction</code> from section 05, for real.</p>
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
  <p>During festival week the GST rate for one report is different. Changing a global and "remembering to change it back" fails the moment the report raises. A context manager saves the old values on enter and restores them in <code>finally</code>.</p>
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
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> We have seen the problem, the statement, the protocol, the shortcut and the uses. How do they fit together, and with the two sibling notes?</div>

  <h2 id="pc-connect"><span class="num">08</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Is a context manager a new idea, or a combination of things we already know: <code>try/finally</code>, dunder protocols, generators and decorators?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 300" width="680">
    <defs><marker id="pc-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="20" y="10" width="190" height="44" rx="6" class="fr sr"/><text x="115" y="29" text-anchor="middle" font-size="12">leak: close() skipped</text><text x="115" y="45" text-anchor="middle" class="tm" font-size="10">error at "till restarted"</text>
    <line x1="210" y1="32" x2="248" y2="32" stroke="currentColor" marker-end="url(#pc-a9)"/>
    <rect x="250" y="10" width="170" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="335" y="29" text-anchor="middle" font-size="12">try / finally</text><text x="335" y="45" text-anchor="middle" class="tm" font-size="10">cleanup on every path</text>
    <line x1="420" y1="32" x2="458" y2="32" stroke="currentColor" marker-end="url(#pc-a9)"/>
    <rect x="460" y="10" width="200" height="44" rx="6" class="fb sb"/><text x="560" y="29" text-anchor="middle" font-size="12">with + __enter__/__exit__</text><text x="560" y="45" text-anchor="middle" class="tm" font-size="10">try/finally packaged in the object</text>
    <line x1="560" y1="54" x2="560" y2="92" stroke="currentColor" marker-end="url(#pc-a9)"/>
    <rect x="460" y="94" width="200" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="560" y="113" text-anchor="middle" font-size="12">__exit__ returns True</text><text x="560" y="129" text-anchor="middle" class="tm" font-size="10">suppress: still ₹225</text>
    <rect x="20" y="94" width="190" height="44" rx="6" class="ft st"/><text x="115" y="113" text-anchor="middle" font-size="12">generator (yield, finally)</text><text x="115" y="129" text-anchor="middle" class="tm" font-size="10">Iterators &amp; Generators</text>
    <rect x="20" y="160" width="190" height="44" rx="6" class="ft st"/><text x="115" y="179" text-anchor="middle" font-size="12">decorator (f = d(f))</text><text x="115" y="195" text-anchor="middle" class="tm" font-size="10">Closures &amp; Decorators</text>
    <line x1="210" y1="116" x2="258" y2="160" stroke="currentColor" marker-end="url(#pc-a9)"/>
    <line x1="210" y1="182" x2="258" y2="182" stroke="currentColor" marker-end="url(#pc-a9)"/>
    <line x1="460" y1="40" x2="380" y2="160" stroke="currentColor" marker-end="url(#pc-a9)"/>
    <rect x="260" y="160" width="190" height="44" rx="6" class="fg sg"/><text x="355" y="179" text-anchor="middle" font-size="12">@contextmanager</text><text x="355" y="195" text-anchor="middle" class="tm" font-size="10">enter → yield → finally</text>
    <line x1="355" y1="204" x2="355" y2="240" stroke="currentColor" marker-end="url(#pc-a9)"/>
    <rect x="200" y="242" width="310" height="44" rx="6" class="fg sg"/><text x="355" y="261" text-anchor="middle" font-size="12">ExitStack + real uses</text><text x="355" y="277" text-anchor="middle" class="tm" font-size="10">files · locks · transactions · timers · settings</text>
  </svg><figcaption>The leak forces try/finally; with packages try/finally inside the resource object through two dunder methods; a true return from __exit__ adds suppression. From the side, the two sibling notes supply a generator (pause at yield, finally on exit) and a decorator (wrap and replace), and together they make @contextmanager. ExitStack and every real use are built on top.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the same Chai Corner log</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>On the running example</th><th>When to use</th></tr>
    <tr><td>Resource leak</td><td>an exception skipping <code>close()</code></td><td>why do we need any of this?</td><td>total 195, <code>f.closed</code> False; 1000 handles</td><td>recognising the bug</td></tr>
    <tr><td><code>try/finally</code></td><td>exceptions</td><td>how to run cleanup on every path?</td><td>closed? True</td><td>one-off cleanup without a manager</td></tr>
    <tr><td><code>with</code> statement</td><td><code>try/except/else</code> + two dunder calls</td><td>can cleanup be one line?</td><td><code>with open(...)</code>: closed? True</td><td>every file, lock, connection</td></tr>
    <tr><td><code>__enter__</code>/<code>__exit__</code></td><td>the protocol</td><td>how do my objects support <code>with</code>?</td><td>OpenLog: exit got <code>ValueError</code>, still closed</td><td>managers with rich state</td></tr>
    <tr><td>Suppression</td><td><code>__exit__</code> returning True</td><td>can the manager handle the error?</td><td>suppress loop: ₹225; SwallowAll: 60 (bug hidden)</td><td>expected, harmless errors only</td></tr>
    <tr><td><code>@contextmanager</code></td><td>generator + decorator</td><td>shorter way to write one?</td><td>transaction: COMMIT 4 rows / ROLLBACK 3</td><td>most custom managers</td></tr>
    <tr><td>ExitStack</td><td>a stack of exits</td><td>a run-time number of resources?</td><td>week ₹485, closes wed, tue, mon</td><td>lists of files/connections</td></tr>
    <tr><td>Real uses</td><td>all of the above</td><td>where else?</td><td>40,000 sales; <code>(4, 225)</code> after rollback; GST 18% → 5%</td><td>locks, DB, settings, tests</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>a context manager is <code>try/finally</code> packaged inside an object, so that <code>with</code> can guarantee its cleanup on every exit path; and since a generator paused at <code>yield</code> inside <code>try/finally</code> already has that shape, <code>@contextmanager</code> builds one from a generator.</strong> Compare the group: <code>for</code> calls <code>__iter__</code>/<code>__next__</code>, <code>@</code> calls your decorator, <code>with</code> calls <code>__enter__</code>/<code>__exit__</code>: three pieces of syntax that call your code at the right moments.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> Guaranteed cleanup is only guaranteed if the manager itself is written correctly. Here are the ways it is not.</div>

  <h2 id="pc-traps"><span class="num">09</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which mistakes break the guarantee or hide errors, and how does each look on our log?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: @contextmanager without try/finally</span>
    <p>The body's exception is raised at the <code>yield</code>, so code after it is skipped (<code>['open']</code>, no "close"). Put cleanup in <code>finally</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: __exit__ that always returns True</span>
    <p>Hides every bug in the block: a <code>NameError</code> typo gave total 60 instead of 195 with no message. Return <code>True</code> only for specific expected types; use <code>suppress(SpecificError)</code>.</p>
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
  <div class="bridge"><b>What this still can't tell us → next: back to the map.</b> That completes the group. <a class="xref" data-note="py_advanced">Advanced Python Functions: the map</a> shows the three notes side by side on the Chai Corner program; next in the course, <a class="xref" data-note="py_concurrency">Concurrency &amp; Async</a> uses <code>with lock:</code>, <code>async with</code> and generator-style coroutines.</div>

  <h2 id="pc-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: Chai Corner's Monday log, six lines; a strict parser raises <code>ValueError</code> at line 5 ("till restarted") after totalling 195; the four valid orders total ₹225. Tuesday ₹110, Wednesday ₹150, week ₹485.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On our log</th><th>Weakness → next</th></tr>
    <tr><td>Leak</td><td>what if an error skips close()?</td><td>closed? False; 1000 handles</td><td>need unconditional cleanup</td></tr>
    <tr><td>try/finally</td><td>cleanup on every path?</td><td>closed? True</td><td>must be written at every use</td></tr>
    <tr><td>with</td><td>cleanup in one line?</td><td>closed? True</td><td>what does it call?</td></tr>
    <tr><td><code>__enter__</code>/<code>__exit__</code></td><td>the protocol</td><td>exit gets <code>ValueError</code></td><td>what does the return value do?</td></tr>
    <tr><td>Suppression</td><td>handle the error inside?</td><td>suppress: ₹225; swallow-all: 60</td><td>classes are verbose</td></tr>
    <tr><td>@contextmanager</td><td>shorter way?</td><td>COMMIT 4 / ROLLBACK 3</td><td>variable number of resources?</td></tr>
    <tr><td>ExitStack</td><td>many resources?</td><td>₹485; closes in reverse</td><td>where else?</td></tr>
    <tr><td>Real uses</td><td>locks, DB, settings</td><td>40,000; (4, 225); 265.5 → 236.25</td><td>traps</td></tr>
  </table>
  <h3>Definitions and "formulas"</h3>
  <table class="tbl">
    <tr><th>Written</th><th>Means exactly</th><th>Notes</th></tr>
    <tr><td><code>with m as x: body</code></td><td><code>x = m.__enter__()</code>; <code>try: body</code>; <code>except BaseException as e: if not m.__exit__(type(e), e, e.__traceback__): raise</code>; <code>else: m.__exit__(None, None, None)</code></td><td><code>__exit__</code> runs on every exit path</td></tr>
    <tr><td><code>__exit__(exc_type, exc, tb)</code></td><td>exception class, object, traceback</td><td>all <code>None</code> on success</td></tr>
    <tr><td><code>__exit__</code> returns</td><td>true → suppress; false/None → re-raise</td><td>only suppress what you expect</td></tr>
    <tr><td><code>@contextmanager</code> generator</td><td>before <code>yield</code> = enter; yielded value = <code>as</code>; after (in <code>finally</code>) = exit</td><td>exactly one yield; errors arrive at the yield</td></tr>
    <tr><td>Inside <code>@contextmanager</code></td><td>enter = <code>next(gen)</code>; exit = <code>next(gen)</code> or <code>gen.throw(exc)</code></td><td>generator + decorator</td></tr>
    <tr><td><code>with a() as x, b() as y:</code></td><td>nested: b exits before a</td><td>fixed number of managers</td></tr>
    <tr><td><code>ExitStack</code></td><td><code>enter_context(cm)</code>, <code>callback(fn)</code>; exits in reverse</td><td>run-time number of managers</td></tr>
    <tr><td><code>suppress(E)</code></td><td><code>__exit__</code> returns True for E</td><td>keep the block tiny</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Use with</b><p>Every file, lock, connection, transaction, temporary setting: anything acquired that must be released.</p><small>never bare open()/acquire()</small></div>
    <div><b>Use @contextmanager</b><p>Most custom managers: setup, yield, cleanup in <code>finally</code>.</p><small>exactly one yield</small></div>
    <div><b>Use a class</b><p>When the manager needs methods or attributes used after the block (<code>t.elapsed</code>), or is reused/reentrant.</p><small>__enter__ returns self</small></div>
    <div><b>Use ExitStack</b><p>A list of resources known at run time, or optional resources.</p><small>closes in reverse</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p><code>yield</code> without <code>try/finally</code>; <code>__exit__</code> always <code>True</code>; yield twice / never; sqlite3 <code>with conn:</code> does not close; lazy generator escaping a <code>with</code>; list of opens without ExitStack; long blocks under locks; <code>__exit__</code> not called if <code>__enter__</code> raises.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>What does <code>__exit__</code> receive when the block succeeds?</td><td><code>None, None, None</code></td></tr>
    <tr><td><code>__exit__</code> returns <code>True</code> after a <code>KeyError</code>. What happens?</td><td>The error is swallowed; execution continues after the <code>with</code> (rest of the block skipped)</td></tr>
    <tr><td>In a <code>@contextmanager</code>, where does the body's exception appear?</td><td>At the <code>yield</code> line inside the generator</td></tr>
    <tr><td>ExitStack entered mon, tue, wed. Close order?</td><td>wed, tue, mon</td></tr>
    <tr><td>Does <code>with sqlite3.connect(...) as conn:</code> close the connection?</td><td>No: it commits or rolls back the transaction only</td></tr>
  </table>

  <h2 id="pc-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why use <code>with open(...)</code> instead of <code>open</code> + <code>close</code>?</summary><div class="qa-body">An exception between open and close skips the <code>close()</code> (our strict parser left the log open after a <code>ValueError</code> at line 5). <code>with</code> calls <code>__exit__</code>, which closes the file, on every exit path: normal end, <code>return</code>, <code>break</code> or exception.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>__exit__</code> receive and what does its return value mean?</summary><div class="qa-body">Exception type, value and traceback, all <code>None</code> if the block succeeded. Returning a truthy value suppresses the exception; <code>False</code>/<code>None</code> lets it continue. It runs on every exit path.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write <code>with</code> as plain Python.</summary><div class="qa-body"><code>x = m.__enter__()</code>, then <code>try:</code> body; <code>except BaseException as e:</code> if <code>not m.__exit__(type(e), e, e.__traceback__)</code>: <code>raise</code>; <code>else: m.__exit__(None, None, None)</code>. (Python looks up <code>__enter__</code>/<code>__exit__</code> on the type, before entering.) Section 02 ran both forms with identical output.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write a context manager that temporarily changes the working directory.</summary><div class="qa-body"><div class="fx" data-lang="py">@contextmanager
def cd(path):
    old = os.getcwd()
    os.chdir(path)
    try:
        yield
    finally:
        os.chdir(old)       # restored even if the body raises</div>(Python 3.11+ ships this as <code>contextlib.chdir</code>, used in section 07.)</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why is <code>@contextmanager</code> built on a generator?</summary><div class="qa-body">A context manager must run setup, pause while the body runs (keeping its state), then resume for cleanup, even on error. A generator already pauses at <code>yield</code> with its locals kept, can be resumed with <code>next</code> or have an exception thrown in with <code>throw</code>, and runs its <code>finally</code> either way. <code>__enter__</code> = <code>next(gen)</code>; <code>__exit__</code> = <code>next(gen)</code> or <code>gen.throw(exc)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is <code>@contextmanager</code> a decorator, and what does it return?</summary><div class="qa-body">It takes a generator function and returns a new function (a closure over it, with <code>functools.wraps</code>). Calling that function creates the generator and wraps it in a context-manager object. So <code>timer("x")</code> gives an object with <code>__enter__</code>/<code>__exit__</code>; that object is also a <code>ContextDecorator</code>, so <code>@timer("x")</code> works on functions too.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: decorator or context manager for timing?</summary><div class="qa-body">A decorator when you always want to time a whole function (every call, no code changes at call sites). A context manager when you want to time a specific block inside a function, or only some calls. A <code>@contextmanager</code> timer can do both.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip <code>try/finally</code> around the <code>yield</code>?</summary><div class="qa-body">When the body raises, <code>@contextmanager</code> throws the exception into the generator at the <code>yield</code>. With no <code>try</code> there, it propagates straight out of the generator and the cleanup after <code>yield</code> never runs (<code>['open']</code> in section 05). The guarantee that was the whole point is lost.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you return <code>True</code> from <code>__exit__</code>?</summary><div class="qa-body">Only for an expected, harmless exception type that should be handled by the manager, e.g. <code>suppress(FileNotFoundError)</code> around deleting a file that may not exist, or skipping a junk line. Always check the type; never swallow everything (the <code>NameError</code> typo example).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you manage a variable number of resources?</summary><div class="qa-body"><code>contextlib.ExitStack</code>: <code>stack.enter_context(cm)</code> in a loop. On exit all are closed in reverse order, and if entering one fails, the ones already entered are still closed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is <code>__exit__</code> called if <code>__enter__</code> raises?</summary><div class="qa-body">No. The <code>with</code> block never started, so there is nothing to exit. A manager whose <code>__enter__</code> acquires two things must clean up the first itself if acquiring the second fails (or use an <code>ExitStack</code> inside).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>with lock:</code> give you over <code>lock.acquire()</code>/<code>lock.release()</code>?</summary><div class="qa-body">The release happens even if the body raises. A lock left held after an exception blocks every other thread forever (a deadlock). Four threads × 10,000 increments under <code>with lock:</code> gave exactly 40,000.</div></details>
</main>
`
});
