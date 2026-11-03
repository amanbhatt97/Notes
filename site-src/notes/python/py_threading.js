// notes/python/py_threading.js — Threads & the GIL
Object.assign(TOPIC_CONTENT, {
  "py_threading": `<main>
<h1>Threads &amp; the GIL</h1>
  <div class="where"><span>Python</span><span>Advanced Python</span><span>Concurrency</span><span>Threads &amp; the GIL</span></div>
  <p class="lead">A thread is a second line of execution inside the same process, sharing all of its memory. It lets your program make the next network or disk call while an earlier one is still waiting, so 20 API calls that take 4 s one after another can finish in about 0.2 s. In CPython, threads do not speed up pure-Python calculation, because the Global Interpreter Lock (GIL) lets only one thread run bytecode at a time. And because threads share memory, unsynchronised updates silently lose data (race conditions), which is what <code>Lock</code>, <code>RLock</code>, <code>Semaphore</code>, <code>Event</code> and <code>queue.Queue</code> are for. In practice you use threads through <code>ThreadPoolExecutor</code>: parallel S3 or REST downloads, database calls with blocking drivers, I/O prefetching in data pipelines. Code was run on CPython 3.13 (standard build, GIL enabled) on 4 cores; timings vary between runs and are approximate.</p>

  <h2 id="th-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Threads &amp; the GIL</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Threads</div>
        <ul>
          <li>Line of execution inside one process; <b>shared memory</b>, own stack</li>
          <li><code>Thread(target=f, args=(…,))</code> → <code>start()</code> → <code>join()</code></li>
          <li>Return value is discarded: store results somewhere</li>
          <li>OS decides when threads switch: order varies</li>
          <li><code>daemon=True</code>: does not keep the program alive</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">GIL</div>
        <ul>
          <li>One thread runs Python bytecode at a time (CPython)</li>
          <li>Protects reference counts</li>
          <li><b>Released</b>: blocking I/O, <code>sleep</code>, most numpy/C work</li>
          <li><b>Held</b>: pure-Python CPU work; handed over every 5 ms</li>
          <li>Free-threaded build: <code>python3.13t</code>, 3.14t</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Races</div>
        <ul>
          <li><code>x += 1</code> = LOAD, BINARY_OP, STORE: not atomic</li>
          <li>Switch between read and write → lost update</li>
          <li>Check-then-act: duplicate work</li>
          <li>GIL ≠ thread safety</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Sync primitives</div>
        <ul>
          <li><code>Lock</code>: one holder; <code>with lock:</code></li>
          <li><code>RLock</code>: holder may re-enter</li>
          <li><code>Semaphore(n)</code>: at most n inside</li>
          <li><code>Event</code>: <code>set()</code> / <code>wait()</code></li>
          <li><code>Condition</code>: wait until notified</li>
          <li><code>queue.Queue</code>: thread-safe hand-off</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Deadlock</div>
        <ul>
          <li>Circular wait on two locks → hang, no error</li>
          <li>Plain <code>Lock</code> re-acquired by holder → hang</li>
          <li>Fix: one lock order, <code>acquire(timeout=)</code>, RLock, queues</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">ThreadPoolExecutor</div>
        <ul>
          <li><code>map</code>: input order; first error re-raised</li>
          <li><code>submit</code> → Future; <code>as_completed</code>: finish order</li>
          <li>I/O time ≈ ⌈tasks / workers⌉ × wait</li>
          <li>Default <code>min(32, cpu_count + 4)</code> workers</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="th-what"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Starting Threads: threading.Thread and join()</span><span class="rm-sub">start, join, shared memory</span></div></div>
      <div class="rm-item rm-done" data-target="th-twenty"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Overlapping I/O with Many Threads</span><span class="rm-sub">20 waits in one wait's time</span></div></div>
      <div class="rm-item rm-done" data-target="th-gil"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The GIL and CPU-bound Threads</span><span class="rm-sub">Refcounts, release rules, free-threading</span></div></div>
      <div class="rm-item rm-done" data-target="th-race"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Race Conditions and Atomicity</span><span class="rm-sub">Lost updates, seen with dis</span></div></div>
      <div class="rm-item rm-done" data-target="th-lock"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Lock and RLock</span><span class="rm-sub">Mutual exclusion, re-entrancy</span></div></div>
      <div class="rm-item rm-done" data-target="th-dead"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Deadlock</span><span class="rm-sub">Circular wait and lock ordering</span></div></div>
      <div class="rm-item rm-done" data-target="th-signal"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Semaphore and Event</span><span class="rm-sub">Concurrency limits and signals</span></div></div>
      <div class="rm-item rm-done" data-target="th-queue"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Producer–Consumer with queue.Queue</span><span class="rm-sub">put, get, poison pills</span></div></div>
      <div class="rm-item rm-done" data-target="th-pool"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">ThreadPoolExecutor and Futures</span><span class="rm-sub">map, submit, as_completed</span></div></div>
      <div class="rm-item rm-done" data-target="th-safe"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Thread-Safety Pitfalls</span><span class="rm-sub">Lost exceptions, check-then-act, local</span></div></div>
      <div class="rm-item rm-done" data-target="th-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Symptom and fix</span></div></div>
      <div class="rm-item rm-done" data-target="th-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">API, GIL rules, primitives</span></div></div>
      <div class="rm-item rm-done" data-target="th-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">GIL, races, locks, pools</span></div></div>
    </div>
  </div>

  <h2 id="th-what"><span class="num">01</span>Starting Threads: threading.Thread and join()</h2>
  <p>A normal program has one thread, the main thread, executing one statement after another. <code>threading.Thread</code> starts another one on a function of your choice. Both run inside the same process and see the same globals and objects; each has its own call stack and local variables. When one thread blocks on I/O, the operating system runs another. The examples use a small helper module; the I/O call is simulated with <code>time.sleep</code>, which from the program's point of view behaves like a network request (the thread sits idle until the "reply" arrives).</p>
  <div class="fx" data-lang="py">"""workload.py: one simulated I/O-bound job and one real CPU-bound job."""
import asyncio, itertools, time

RESTAURANTS = [f"R{i:02d}" for i in range(1, 21)]   # 20 IDs: R01 ... R20
LATENCY = 0.2                                      # every request waits 0.2 s

def fetch_menu(rid):
    """I/O-bound: a blocking 'network call'. 0.2 s of waiting, then a small dict."""
    time.sleep(LATENCY)
    return {"id": rid, "dishes": 3 + int(rid[1:]) % 5}

async def fetch_menu_async(rid):
    """The same call written for asyncio: the wait is awaited, not slept."""
    await asyncio.sleep(LATENCY)
    return {"id": rid, "dishes": 3 + int(rid[1:]) % 5}

def route_cost(stops, depot=(0, 0)):
    """CPU-bound: brute-force the shortest Manhattan path through all stops."""
    best = None
    for order in itertools.permutations(stops):    # 9 stops -&gt; 362,880 orders
        cost, here = 0, depot
        for x, y in order:
            cost += abs(here[0] - x) + abs(here[1] - y)
            here = (x, y)
        if best is None or cost &lt; best:
            best = cost
    return best

# 4 batches of 9 points each, generated deterministically
RIDERS = [[((s * 7 + i * 5) % 11, (s * 3 + i * 7) % 13) for i in range(9)] for s in range(1, 5)]</div>
  <p>Three calls do everything:</p>
  <ul>
    <li><code>threading.Thread(target=worker, args=("R01", 0.2))</code> creates a thread object that <em>will</em> run <code>worker("R01", 0.2)</code>. Pass the function itself (no brackets); <code>args</code> is a tuple, so a single argument is <code>args=("R01",)</code>.</li>
    <li><code>.start()</code> begins running it and returns immediately.</li>
    <li><code>.join()</code> blocks the caller until that thread has finished.</li>
  </ul>
  <p>Below, thread A's call is made 0.2 s slower than thread B's. A thread throws away its function's return value, so each thread stores its result in a shared dict. Every line is printed with the elapsed time and the thread's name.</p>
  <div class="fx" data-lang="py">import sys, threading, time
from workload import fetch_menu

T0 = time.perf_counter()
def log(msg):                                  # one write per line, so lines never mix
    sys.stdout.write(f"{time.perf_counter() - T0:.1f}s  [{threading.current_thread().name:&lt;10}] {msg}\\n")

results = {}                                   # threads share this dict with main
def worker(rid, extra):
    log(f"{rid} request sent")
    time.sleep(extra)                          # make A's call 0.2 s slower
    results[rid] = fetch_menu(rid)             # a thread discards its return value, so store it
    log(f"{rid} reply received")

a = threading.Thread(target=worker, args=("R01", 0.2), name="thread-A")
b = threading.Thread(target=worker, args=("R02", 0.0), name="thread-B")
a.start(); b.start()                           # both begin now; start() returns at once
log(f"both started, {threading.active_count()} threads alive")
a.join(); b.join()                             # wait until both have finished
log(f"joined: {results}")</div>
  <div class="fx" data-lang="text">0.0s  [thread-A  ] R01 request sent
0.0s  [thread-B  ] R02 request sent
0.0s  [MainThread] both started, 3 threads alive
0.2s  [thread-B  ] R02 reply received
0.4s  [thread-A  ] R01 reply received
0.4s  [MainThread] joined: {'R02': {'id': 'R02', 'dishes': 5}, 'R01': {'id': 'R01', 'dishes': 4}}</div>
  <table class="tbl"><caption>The timeline</caption>
    <tr><th>Time</th><th>MainThread</th><th>thread-A (0.4 s of waiting)</th><th>thread-B (0.2 s)</th></tr>
    <tr><td>0.0 s</td><td>starts A and B, prints "3 threads alive", blocks in <code>a.join()</code></td><td>sends, sleeps 0.2 s</td><td>sends, <code>fetch_menu</code> waits 0.2 s</td></tr>
    <tr><td>0.2 s</td><td>still in <code>a.join()</code></td><td><code>fetch_menu</code>: another 0.2 s</td><td>stores its result, <strong>ends</strong></td></tr>
    <tr><td>0.4 s</td><td><code>a.join()</code> returns; <code>b.join()</code> returns at once</td><td>stores its result, <strong>ends</strong></td><td></td></tr>
  </table>
  <p>Total 0.4 s instead of 0.4 + 0.2 = 0.6 s sequentially: B's whole call happened during A's wait. "both started" printed while both calls were still waiting, because <code>start()</code> does not wait; "3 threads alive" counts MainThread, A and B; the dict lists R02 first because B finished first. Run it several times and the first three lines can come out in a different order, because <strong>the OS decides which thread runs when</strong>. (Each line is written with a single <code>sys.stdout.write</code>; with <code>print</code>, the text and the newline are separate writes and lines from two threads can interleave.)</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>thread</strong> is an independent sequence of execution inside a process, scheduled by the OS. All threads of a process share its memory (globals, heap objects); each has its own call stack. <code>start()</code> launches it, <code>join(timeout=None)</code> waits for it, <code>is_alive()</code> reports whether it is running. A <strong>daemon</strong> thread (<code>daemon=True</code>) does not keep the interpreter alive: Python exits without waiting for it. You can also subclass <code>Thread</code> and override <code>run()</code>, but passing <code>target</code> is more common.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>Thread(target=worker("R01", 0.2))</code>. The brackets call <code>worker</code> immediately in the main thread and pass its return value (<code>None</code>) as the target. The work runs sequentially and the thread does nothing.</p></div>

  <h2 id="th-twenty"><span class="num">02</span>Overlapping I/O with Many Threads</h2>
  <p>Threads pay off when many calls each spend most of their time waiting. Start one thread per call, give each its own slot in a results list so no two threads write the same place, start all of them, then join all of them.</p>
  <div class="fx" data-lang="py">import threading, time
from workload import RESTAURANTS, fetch_menu

menus = [None] * len(RESTAURANTS)              # one slot per call
def worker(i, rid):
    menus[i] = fetch_menu(rid)                 # each thread writes only its own slot

t = time.perf_counter()
threads = [threading.Thread(target=worker, args=(i, r)) for i, r in enumerate(RESTAURANTS)]
for th in threads: th.start()                  # start ALL first ...
for th in threads: th.join()                   # ... then join all
print(f"20 threads: {sum(m['dishes'] for m in menus)} dishes in {time.perf_counter() - t:.2f}s")</div>
  <div class="fx" data-lang="text">20 threads: 100 dishes in 0.20s</div>
  <p>The same result as the sequential loop (100), in 0.20 s instead of 4.00 s: all twenty 0.2 s waits overlapped. The two separate loops matter. <code>th.start(); th.join()</code> inside one loop would finish each thread before starting the next, and you would be back to 4 s.</p>
  <figure class="viz"><svg viewBox="0 0 560 130" width="560">
    <text x="10" y="18" class="tm">20 threads (4 shown): each sends, then waits; the waits overlap</text>
    <text x="10" y="42">T1</text><rect x="60" y="32" width="4" height="12" class="fb sb"/><rect x="64" y="32" width="200" height="12" class="fs"/>
    <text x="10" y="60">T2</text><rect x="62" y="50" width="4" height="12" class="fb sb"/><rect x="66" y="50" width="200" height="12" class="fs"/>
    <text x="10" y="78">T3</text><rect x="64" y="68" width="4" height="12" class="fb sb"/><rect x="68" y="68" width="200" height="12" class="fs"/>
    <text x="10" y="96">…</text>
    <text x="10" y="114">T20</text><rect x="68" y="104" width="4" height="12" class="fb sb"/><rect x="72" y="104" width="200" height="12" class="fs"/>
    <text x="290" y="72" class="tg">all done after ≈ one wait (0.2 s)</text>
    <text x="290" y="90" class="tm">sequential: 20 waits end to end = 4.0 s</text>
  </svg><figcaption>Each row is one thread: a tiny piece of work (blue) to send the request, then a long wait (grey) during which the thread does not hold the GIL. The waits run side by side, so the job ends after roughly one wait.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span><p>For I/O-bound work with <em>n</em> threads, time ≈ <strong>⌈tasks / n⌉ × time per wait</strong>: 20 tasks, 20 threads → 0.2 s; 20 tasks, 5 threads → 4 × 0.2 = 0.8 s (measured in section 09).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>One thread per task does not scale to 10,000 tasks: every thread has its own stack and the OS has to schedule all of them. Use a pool with a fixed number of threads (section 09), or asyncio for very many concurrent waits (<a class="xref" data-note="py_asyncio">asyncio</a>).</p></div>

  <h2 id="th-gil"><span class="num">03</span>The GIL and CPU-bound Threads</h2>
  <p>On a 4-core machine you might expect 4 threads running 4 independent calculations to finish in a quarter of the time. On standard CPython they do not:</p>
  <div class="fx" data-lang="py">import threading, time
from workload import RIDERS, route_cost

t = time.perf_counter()
costs = [route_cost(s) for s in RIDERS]
print(f"sequential: {costs} in {time.perf_counter() - t:.2f}s")

costs = [None] * 4
def worker(i):
    costs[i] = route_cost(RIDERS[i])
t = time.perf_counter()
threads = [threading.Thread(target=worker, args=(i,)) for i in range(4)]
for th in threads: th.start()
for th in threads: th.join()
print(f"4 threads:  {costs} in {time.perf_counter() - t:.2f}s")</div>
  <div class="fx" data-lang="text">sequential: [40, 36, 35, 36] in 1.10s
4 threads:  [40, 36, 35, 36] in 1.12s</div>
  <p>Same answers, no speed-up (on some runs threads are slightly slower, from handing the lock back and forth). The cause is the Global Interpreter Lock.</p>
  <h3>Why the GIL exists: reference counting</h3>
  <p>CPython frees memory by <strong>reference counting</strong>: every object stores how many references point to it, and is deallocated when the count reaches zero. You can read the counter:</p>
  <div class="fx" data-lang="py">import sys
menu = {"id": "R01", "dishes": 4}
print("references to menu:", sys.getrefcount(menu))    # +1 for the call's own argument
alias = menu
print("after alias = menu:", sys.getrefcount(menu))
del alias
print("after del alias:   ", sys.getrefcount(menu))
print("switch interval:", sys.getswitchinterval(), "s")
print("GIL enabled in this build:", sys._is_gil_enabled())</div>
  <div class="fx" data-lang="text">references to menu: 2
after alias = menu: 3
after del alias:    2
switch interval: 0.005 s
GIL enabled in this build: True</div>
  <p><code>getrefcount</code> reports one extra for its own argument: 1 (the name) + 1 = 2. <code>alias = menu</code> adds one; <code>del alias</code> removes it. These counters change on almost every assignment, call and container operation. If two threads incremented the same count simultaneously, both could read 2 and write 3, the count would end up too low, and the object could be freed while still in use. Instead of a lock per object (slow, and deadlock-prone), CPython uses <strong>one lock around the interpreter</strong>. A thread must hold it to execute Python bytecode, so only one thread runs Python code at any instant.</p>
  <h3>When the GIL is released</h3>
  <p>A thread releases the GIL when it blocks on I/O (sockets, files, <code>time.sleep</code>, DB drivers) and when it enters long-running C code that does not touch Python objects (most heavy numpy, pandas and PyTorch operations, <code>hashlib</code>, <code>zlib</code>). That is why 20 waiting threads overlapped perfectly in section 02. A thread computing in pure Python holds it; the interpreter forces it to offer the lock to others every <strong>switch interval</strong> (5 ms), so CPU-bound threads take turns rather than run together.</p>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
    <text x="10" y="18" class="tm">CPU-bound: threads take turns</text>
    <text x="10" y="45">T1</text><text x="10" y="75">T2</text>
    <rect x="40" y="33" width="50" height="16" class="fb sb"/><rect x="90" y="33" width="50" height="16" fill="none" stroke="currentColor" opacity="0.4"/>
    <rect x="140" y="33" width="50" height="16" class="fb sb"/><rect x="190" y="33" width="50" height="16" fill="none" stroke="currentColor" opacity="0.4"/>
    <rect x="40" y="63" width="50" height="16" fill="none" stroke="currentColor" opacity="0.4"/><rect x="90" y="63" width="50" height="16" class="ft st"/>
    <rect x="140" y="63" width="50" height="16" fill="none" stroke="currentColor" opacity="0.4"/><rect x="190" y="63" width="50" height="16" class="ft st"/>
    <text x="40" y="105" class="tr">total = T1 + T2 → no speed-up</text>
    <text x="300" y="18" class="tm">I/O-bound: wait without the GIL</text>
    <text x="300" y="45">T1</text><text x="300" y="75">T2</text>
    <rect x="330" y="33" width="25" height="16" class="fb sb"/><rect x="355" y="33" width="150" height="16" class="fs"/>
    <rect x="355" y="63" width="25" height="16" class="ft st"/><rect x="380" y="63" width="150" height="16" class="fs"/>
    <text x="330" y="105" class="tg">T2 runs while T1 waits → overlap</text>
    <rect x="40" y="122" width="12" height="12" class="fb sb"/><text x="58" y="132" class="tm">holds GIL</text>
    <rect x="140" y="122" width="12" height="12" fill="none" stroke="currentColor" opacity="0.4"/><text x="158" y="132" class="tm">wants GIL</text>
    <rect x="320" y="122" width="12" height="12" class="fs"/><text x="338" y="132" class="tm">waiting (GIL free)</text>
  </svg><figcaption>Left: two computing threads; only one holds the lock while the other waits for it, so the total is the sum. Right: two waiting threads; each holds the lock briefly, then waits without it, so the waits overlap.</figcaption></figure>
  <h3>Free-threaded Python (PEP 703)</h3>
  <p>Since Python 3.13 there is a separate, optional CPython build without the GIL, usually installed as <code>python3.13t</code>. It is experimental in 3.13 and officially supported, but not the default, from 3.14. On it, CPU-bound threads like the ones above do run on several cores. The costs: single-threaded code is somewhat slower (noticeably in 3.13, less in 3.14); C extensions must be built for it and declare support, and importing one that has not re-enables the GIL with a warning; and races in your own code become more likely, not less. <code>sys._is_gil_enabled()</code> tells you which mode you are running in. It printed <code>True</code> above, so the free-threaded build was not measured here.</p>
  <div class="callout def"><span class="label">Definition</span><p>The <strong>GIL</strong> is a mutex in CPython that allows one thread per process to execute Python bytecode at a time. It protects interpreter state, mainly reference counts. <strong>Released</strong> during blocking I/O, <code>time.sleep</code> and many C-level operations; <strong>held</strong> during pure-Python computation (offered to other threads every <code>sys.getswitchinterval()</code> seconds). Consequence: threads speed up I/O-bound work, not CPU-bound pure-Python work. PyPy also has a GIL; Jython and IronPython do not.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"The GIL makes my code thread-safe." It protects the interpreter's internals, not your logic. A thread can be switched out between any two bytecodes of your code, so read-modify-write sequences on shared data still break (next section).</p></div>

  <h2 id="th-race"><span class="num">04</span>Race Conditions and Atomicity</h2>
  <p>Because threads share memory and can be switched at almost any point, two threads updating the same variable can interleave and lose updates. The result depends on timing, which is what makes these bugs intermittent.</p>
  <h3>What <code>+= 1</code> compiles to</h3>
  <div class="fx" data-lang="py">import dis
views = 0
def record_view():
    global views
    views += 1
dis.dis(record_view)</div>
  <div class="fx" data-lang="text">  3           RESUME                   0

  5           LOAD_GLOBAL              0 (views)
              LOAD_CONST               1 (1)
              BINARY_OP               13 (+=)
              STORE_GLOBAL             0 (views)
              RETURN_CONST             0 (None)</div>
  <p><code>LOAD_GLOBAL</code> <strong>reads</strong> <code>views</code>, <code>BINARY_OP</code> <strong>computes</strong> the sum, <code>STORE_GLOBAL</code> <strong>writes</strong> it back. A switch after the read and before the write lets another thread read the same old value.</p>
  <table class="tbl out"><caption>How one update is lost (views starts at 5)</caption>
    <tr><th>Step</th><th>Thread 1</th><th>Thread 2</th><th>views in memory</th></tr>
    <tr><td>1</td><td>LOAD: reads 5</td><td></td><td>5</td></tr>
    <tr><td>2</td><td>(switched out)</td><td>LOAD: reads 5</td><td>5</td></tr>
    <tr><td>3</td><td></td><td>add, STORE: writes 6</td><td>6</td></tr>
    <tr><td>4</td><td>add, STORE: writes 6</td><td></td><td>6 (should be 7)</td></tr>
  </table>
  <h3>Reproducing it</h3>
  <p><code>record_unsafe</code> puts a function call between the read and the write (<code>views = plus_one(views)</code>), which is what real code looks like (validate, log, then write). <code>record_bare</code> uses <code>views += 1</code>. Four threads each add 200,000.</p>
  <div class="fx" data-lang="py">import threading

views = 0
def plus_one(x):                               # any extra step between read and write
    return x + 1

def record_unsafe(n):
    global views
    for _ in range(n):
        views = plus_one(views)                # READ views ... call ... WRITE views

def record_bare(n):
    global views
    for _ in range(n):
        views += 1                             # the same three steps, written short

def run(fn, n=200_000, k=4):
    global views
    views = 0
    ts = [threading.Thread(target=fn, args=(n,)) for _ in range(k)]
    for t in ts: t.start()
    for t in ts: t.join()
    return views

for _ in range(3):
    print("unsafe:", run(record_unsafe), "/ 800000")
print("bare += :", run(record_bare), "/ 800000")</div>
  <div class="fx" data-lang="text">unsafe: 707794 / 800000
unsafe: 800000 / 800000
unsafe: 691245 / 800000
bare += : 800000 / 800000</div>
  <p>The unsafe version lost about 90,000–110,000 updates in two runs and was correct by luck in the third. That is the nature of a race: a test can pass and the code is still wrong. The bare <code>+=</code> happened to give 800,000 on this 3.13 build because CPython only checks for a thread switch at certain points (calls, backward jumps), and there is none between this <code>LOAD_GLOBAL</code> and <code>STORE_GLOBAL</code>. That is an implementation detail, not a guarantee: another version, the free-threaded build, or any call in between breaks it. Treat every read-modify-write of shared data as unsafe.</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>race condition</strong> is a bug whose result depends on the relative timing of threads. The code that touches shared mutable state is the <strong>critical section</strong>. An <strong>atomic</strong> operation cannot be observed half-done; <code>x += 1</code> on shared data is not atomic. In CPython, a single built-in operation such as <code>list.append(x)</code> or <code>d[k] = v</code> is effectively atomic, but a sequence of them is not.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"I ran it ten times and it was always right." Races depend on load, Python version and exact code. Reason about the interleavings rather than trusting test runs.</p></div>

  <h2 id="th-lock"><span class="num">05</span>Lock and RLock</h2>
  <p>A <strong>lock</strong> (mutex) makes a critical section run one thread at a time. <code>acquire()</code> takes it, waiting if another thread holds it; <code>release()</code> gives it back. A lock is a context manager (<a class="xref" data-note="py_context">Context Managers</a>): <code>with lock:</code> releases on exit even if the block raises.</p>
  <div class="fx" data-lang="py">import threading, time

views = 0
lock = threading.Lock()
def plus_one(x):
    return x + 1

def record_safe(n):
    global views
    for _ in range(n):
        with lock:                             # only one thread at a time in here
            views = plus_one(views)

def run(fn, n=200_000, k=4):
    global views
    views = 0
    ts = [threading.Thread(target=fn, args=(n,)) for _ in range(k)]
    t = time.perf_counter()
    for th in ts: th.start()
    for th in ts: th.join()
    return views, time.perf_counter() - t

v, secs = run(record_safe)
print(f"with lock: {v} / 800000 in {secs:.2f}s")
print("lock is free again:", not lock.locked())</div>
  <div class="fx" data-lang="text">with lock: 800000 / 800000 in 0.10s
lock is free again: True</div>
  <p>Exactly 800,000, every run. Read, add and write now happen as one indivisible step from the other threads' point of view. The price: the critical section is serialised and each acquire/release costs a little, so keep locked blocks short.</p>
  <h3>RLock: re-entrant locking</h3>
  <p>A plain <code>Lock</code> has no owner. If the thread holding it tries to acquire it again, it waits for itself forever. That happens naturally when one locked method calls another locked method. Each version below runs in a daemon thread with a 1 s join timeout.</p>
  <div class="fx" data-lang="py">import threading

class Tally:
    def __init__(self, lock):
        self.total = 0
        self.lock = lock
    def add(self, n):
        with self.lock:
            self.total += n
    def add_record(self, record):
        with self.lock:                        # holds the lock ...
            self.add(record["dishes"])         # ... and add() asks for it again

def try_it(lock):
    tally = Tally(lock)
    t = threading.Thread(target=tally.add_record, args=({"id": "R01", "dishes": 4},), daemon=True)
    t.start(); t.join(timeout=1)               # wait at most 1 s
    return "stuck forever (deadlocked itself)" if t.is_alive() else f"total = {tally.total}"

print("Lock :", try_it(threading.Lock()))
print("RLock:", try_it(threading.RLock()))</div>
  <div class="fx" data-lang="text">Lock : stuck forever (deadlocked itself)
RLock: total = 4</div>
  <p>With <code>Lock</code> the thread was still alive after 1 s: it had deadlocked on itself (being a daemon, it did not stop the program exiting). An <code>RLock</code> records its owning thread and a recursion count; the owner may acquire it again, and it is released only after the same number of releases.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Lock</strong>: at most one holder; re-acquiring by the holder blocks; any thread may release it. <strong>RLock</strong>: may be acquired repeatedly by its owner; must be released as many times; only the owner may release it. Both support <code>with</code>, <code>acquire(timeout=…)</code> (returns <code>False</code> on timeout) and <code>acquire(blocking=False)</code>. A <code>with lock:</code> around a whole function can be packaged as a decorator (<a class="xref" data-note="py_decorators">Closures &amp; Decorators</a>).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Holding a lock during slow work: <code>with lock: data = fetch_menu(rid)</code>. Every other thread queues behind each 0.2 s call and 20 threads become sequential again. Do the slow work outside; lock only the shared update.</p></div>

  <h2 id="th-dead"><span class="num">06</span>Deadlock</h2>
  <p>A deadlock happens when threads wait for each other in a circle. Thread 1 holds lock A and waits for lock B; thread 2 holds B and waits for A. Neither can proceed, and there is no error: the program just hangs.</p>
  <figure class="viz"><svg viewBox="0 0 440 130" width="440">
    <defs><marker id="th-ah1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="20" y="20" width="130" height="34" rx="6" class="fb sb"/><text x="50" y="42">worker-1</text>
    <rect x="290" y="20" width="130" height="34" rx="6" class="ft st"/><text x="320" y="42">worker-2</text>
    <rect x="20" y="86" width="130" height="30" rx="6" class="fs"/><text x="55" y="106">lock_a</text>
    <rect x="290" y="86" width="130" height="30" rx="6" class="fs"/><text x="325" y="106">lock_b</text>
    <line x1="85" y1="86" x2="85" y2="56" stroke="currentColor" stroke-width="2" marker-end="url(#th-ah1)"/><text x="92" y="76" class="tm">holds</text>
    <line x1="355" y1="86" x2="355" y2="56" stroke="currentColor" stroke-width="2" marker-end="url(#th-ah1)"/><text x="362" y="76" class="tm">holds</text>
    <line x1="150" y1="44" x2="288" y2="98" class="sr" stroke-width="2" stroke-dasharray="5 3" marker-end="url(#th-ah1)"/>
    <line x1="290" y1="44" x2="152" y2="98" class="sr" stroke-width="2" stroke-dasharray="5 3" marker-end="url(#th-ah1)"/>
    <text x="220" y="124" class="tr" text-anchor="middle">wants</text>
  </svg><figcaption>Solid arrows: each thread holds the lock below it. Dashed arrows: each wants the lock the other holds. The cycle cannot break by itself.</figcaption></figure>
  <p>The code builds exactly this, using <code>acquire(timeout=1)</code> so one thread gives up instead of hanging the demo, then repeats with both threads taking the locks in the same order.</p>
  <div class="fx" data-lang="py">import threading, time
lock_a, lock_b = threading.Lock(), threading.Lock()

def worker(name, first, second):
    with first:
        time.sleep(0.1)                        # let the other thread grab its first lock
        if second.acquire(timeout=1):          # a plain 'with second:' would hang forever
            second.release(); print(name, "done")
        else:
            print(name, "gave up after 1 s: deadlock")

a = threading.Thread(target=worker, args=("worker-1", lock_a, lock_b))
b = threading.Thread(target=worker, args=("worker-2", lock_b, lock_a))   # opposite order!
a.start(); b.start(); a.join(); b.join()

print("-- same order everywhere --")
a = threading.Thread(target=worker, args=("worker-1", lock_a, lock_b))
b = threading.Thread(target=worker, args=("worker-2", lock_a, lock_b))   # same order
a.start(); b.start(); a.join(); b.join()</div>
  <div class="fx" data-lang="text">worker-1 gave up after 1 s: deadlock
worker-2 done
-- same order everywhere --
worker-1 done
worker-2 done</div>
  <p>First pair: the cycle formed; after 1 s worker-1's timeout fired, it released <code>lock_a</code>, and worker-2 could finish (on another run the roles may swap). Second pair: both take <code>lock_a</code> first, so the second thread simply waits its turn and no cycle can form.</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>deadlock</strong> is a state in which each thread of a group waits for a resource held by another member, so none can proceed. It requires a <strong>circular wait</strong>. Prevention, best first: one global lock-acquisition order; never hold a lock while doing slow I/O or calling unknown code; <code>acquire(timeout=…)</code> with a clear error; replace shared state with queues (section 08).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A deadlock gives no traceback. If a threaded program hangs, dump every thread's stack (<code>faulthandler.dump_traceback_later</code>, or <code>py-spy dump --pid</code>) and look for threads blocked in <code>acquire</code>.</p></div>

  <h2 id="th-signal"><span class="num">07</span>Semaphore and Event</h2>
  <p>Locks answer "one at a time". Two other everyday needs are "at most n at a time" (an API's concurrency limit, a connection pool) and "wait until another thread says go".</p>
  <h3>Semaphore: at most n holders</h3>
  <p>A semaphore holds a counter: <code>acquire</code> (or entering <code>with sem:</code>) decrements it and waits while it is 0; <code>release</code> increments it. Below, 20 pool threads make 20 calls, but <code>Semaphore(3)</code> lets only 3 inside at once. The peak is tracked under its own small lock because <code>inside</code> is shared.</p>
  <div class="fx" data-lang="py">import threading, time
from concurrent.futures import ThreadPoolExecutor
from workload import RESTAURANTS, fetch_menu

api_slots = threading.Semaphore(3)             # the API allows 3 requests at once
inside = peak = 0
count_lock = threading.Lock()

def polite_fetch(rid):
    global inside, peak
    with api_slots:                            # wait here if 3 are already inside
        with count_lock:
            inside += 1; peak = max(peak, inside)
        menu = fetch_menu(rid)
        with count_lock:
            inside -= 1
    return menu

t = time.perf_counter()
with ThreadPoolExecutor(max_workers=20) as ex:
    menus = list(ex.map(polite_fetch, RESTAURANTS))
print(f"{sum(m['dishes'] for m in menus)} dishes, peak inside = {peak}, {time.perf_counter() - t:.2f}s")</div>
  <div class="fx" data-lang="text">100 dishes, peak inside = 3, 1.41s</div>
  <p>⌈20 / 3⌉ = 7 rounds × 0.2 s = 1.4 s, as measured, and the peak never exceeded 3.</p>
  <h3>Event: a one-way signal</h3>
  <p>An <strong>Event</strong> is a flag that starts False. <code>wait()</code> blocks until it is True; <code>set()</code> makes it True and wakes every waiter. Here a consumer waits until a producer has the first 5 results.</p>
  <div class="fx" data-lang="py">import threading, time
from workload import RESTAURANTS, fetch_menu

data_ready = threading.Event()                 # a flag that starts False
menus = {}

def consumer():
    print("consumer: waiting for data ...")
    data_ready.wait()                          # sleeps until someone calls set()
    print(f"consumer: go! {len(menus)} results, {sum(m['dishes'] for m in menus.values())} dishes")

def producer():
    for rid in RESTAURANTS[:5]:
        menus[rid] = fetch_menu(rid)
    print("producer: first 5 results in, setting the event")
    data_ready.set()                           # wakes every waiting thread

c = threading.Thread(target=consumer); p = threading.Thread(target=producer)
c.start(); time.sleep(0.05); p.start()
c.join(); p.join()
print("is_set:", data_ready.is_set())</div>
  <div class="fx" data-lang="text">consumer: waiting for data ...
producer: first 5 results in, setting the event
consumer: go! 5 results, 25 dishes
is_set: True</div>
  <p>The consumer slept inside <code>wait()</code> using no CPU until <code>set()</code>, then woke at once. A common use is a stop flag: a long-running thread loops <code>while not stop.is_set():</code> and the main thread calls <code>stop.set()</code> to shut it down cleanly.</p>
  <table class="tbl"><caption>The synchronisation primitives</caption>
    <tr><th>Primitive</th><th>What it does</th><th>Typical use</th></tr>
    <tr><td><code>Lock</code></td><td>one holder at a time</td><td>protect a shared counter or dict update</td></tr>
    <tr><td><code>RLock</code></td><td>the holder may re-enter</td><td>locked methods that call each other</td></tr>
    <tr><td><code>Semaphore(n)</code> / <code>BoundedSemaphore(n)</code></td><td>at most n holders (Bounded raises if over-released)</td><td>API rate or connection limits</td></tr>
    <tr><td><code>Event</code></td><td><code>set()</code> / <code>clear()</code> / <code>wait()</code> flag</td><td>"ready", "stop"</td></tr>
    <tr><td><code>Condition</code></td><td><code>wait()</code> until another thread calls <code>notify()</code>, with a lock</td><td>custom producer–consumer (usually use a Queue instead)</td></tr>
    <tr><td><code>Barrier(n)</code></td><td>n threads wait until all have arrived</td><td>phased computations</td></tr>
    <tr><td><code>queue.Queue</code></td><td>thread-safe FIFO</td><td>hand work between threads (next section)</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span><p>A busy wait, <code>while not ready: pass</code>, instead of an Event. It burns a full core and, because it holds the GIL, slows the very thread it is waiting for.</p></div>

  <h2 id="th-queue"><span class="num">08</span>Producer–Consumer with queue.Queue</h2>
  <p>Locks are easy to forget and easy to deadlock. <code>queue.Queue</code> lets threads cooperate without sharing variables at all: <code>put(item)</code> adds to the back, <code>get()</code> takes from the front and blocks while the queue is empty, and all the locking is inside the queue. Below, 5 fetcher threads take IDs from <code>todo</code> and put results on <code>done</code>; one tallier thread is the only one that touches <code>total</code>, so it needs no lock. One <code>None</code> per fetcher (a <strong>poison pill</strong>) tells each to exit.</p>
  <div class="fx" data-lang="py">import threading, queue, time
from workload import RESTAURANTS, fetch_menu

todo, done = queue.Queue(), queue.Queue()      # thread-safe FIFO queues
for rid in RESTAURANTS:
    todo.put(rid)

def fetcher():                                 # PRODUCER of results
    while True:
        rid = todo.get()
        if rid is None:                        # poison pill: time to stop
            break
        done.put(fetch_menu(rid))

def tallier(n):                                # CONSUMER: the only thread that touches total
    total = 0
    for _ in range(n):
        total += done.get()["dishes"]
    print("tallier: total dishes =", total)

t = time.perf_counter()
workers = [threading.Thread(target=fetcher) for _ in range(5)]
tally = threading.Thread(target=tallier, args=(len(RESTAURANTS),))
for w in workers: w.start()
tally.start()
for _ in workers: todo.put(None)               # one pill per fetcher
for w in workers: w.join()
tally.join()
print(f"5 fetchers + 1 tallier: {time.perf_counter() - t:.2f}s")</div>
  <div class="fx" data-lang="text">tallier: total dishes = 100
5 fetchers + 1 tallier: 0.80s</div>
  <p>Correct total, no lock in our code, and 5 workers → 4 rounds × 0.2 s = 0.8 s. No variable is touched by two threads: IDs travel through <code>todo</code>, results through <code>done</code>, and <code>total</code> lives only in the tallier. The pills are queued after the 20 IDs, so every fetcher does real work first and then meets exactly one <code>None</code>.</p>
  <div class="flow"><span>todo: 20 IDs, None ×5</span><span>5 fetcher threads</span><span>done: 20 results</span><span>1 tallier → 100</span></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>queue.Queue(maxsize=0)</strong>: thread-safe FIFO. <code>put</code> / <code>get</code> block by default (optional <code>timeout</code>); <code>maxsize=n</code> makes <code>put</code> block when full (back-pressure on fast producers); <code>task_done()</code> + <code>join()</code> let a producer wait until every item has been processed. Variants: <code>LifoQueue</code>, <code>PriorityQueue</code>, <code>SimpleQueue</code>. This is <strong>message passing</strong>: share data by handing it over, not by sharing variables.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Too few poison pills: the remaining consumers wait in <code>get()</code> forever and <code>join()</code> never returns. One pill per consumer, after the real work.</p></div>

  <h2 id="th-pool"><span class="num">09</span>ThreadPoolExecutor and Futures</h2>
  <p><code>concurrent.futures.ThreadPoolExecutor</code> is the queue-plus-workers pattern of section 08, packaged: a fixed pool of reusable threads, a job queue, and return values (and exceptions) delivered back to the caller. It is how threads are normally used in application code. Inside a <code>with</code> block, <code>ex.map(fn, items)</code> works like the built-in <code>map</code> but runs the calls in the pool; leaving the block waits for every job.</p>
  <div class="fx" data-lang="py">import time
from concurrent.futures import ThreadPoolExecutor
from workload import RESTAURANTS, fetch_menu

for workers in (1, 5, 20):
    t = time.perf_counter()
    with ThreadPoolExecutor(max_workers=workers) as ex:
        menus = list(ex.map(fetch_menu, RESTAURANTS))      # results in INPUT order
    print(f"max_workers={workers:2}: {sum(m['dishes'] for m in menus)} dishes, "
          f"first {menus[0]['id']}, last {menus[-1]['id']}, {time.perf_counter() - t:.2f}s")</div>
  <div class="fx" data-lang="text">max_workers= 1: 100 dishes, first R01, last R20, 4.01s
max_workers= 5: 100 dishes, first R01, last R20, 0.80s
max_workers=20: 100 dishes, first R01, last R20, 0.21s</div>
  <p>The formula holds: 1 worker = 20 rounds ≈ 4.0 s, 5 = 4 rounds ≈ 0.8 s, 20 = 1 round ≈ 0.2 s. <code>map</code> returns results in <strong>input</strong> order whatever order they finished in, and return values come back without shared slots.</p>
  <h3>submit, Future and as_completed</h3>
  <p><code>ex.submit(fn, *args)</code> schedules one call and immediately returns a <strong>Future</strong>, a handle you later exchange for the result or the exception. <code>as_completed(futures)</code> yields them in the order they <strong>finish</strong>. Below, three calls take different times and one fails.</p>
  <div class="fx" data-lang="py">import time
from concurrent.futures import ThreadPoolExecutor, as_completed

def fetch_v2(rid, secs):                       # calls take different times; one fails
    time.sleep(secs)
    if rid == "R13":
        raise ConnectionError("R13 unavailable")
    return {"id": rid, "dishes": 3 + int(rid[1:]) % 5}

jobs = {"R01": 0.3, "R02": 0.1, "R13": 0.2}
with ThreadPoolExecutor(max_workers=3) as ex:
    futures = {ex.submit(fetch_v2, rid, s): rid for rid, s in jobs.items()}
    print("submitted in this order:", list(futures.values()))
    for fut in as_completed(futures):          # yields futures as they FINISH
        try:
            print("got", fut.result())
        except ConnectionError as e:
            print(futures[fut], "failed:", e)</div>
  <div class="fx" data-lang="text">submitted in this order: ['R01', 'R02', 'R13']
got {'id': 'R02', 'dishes': 5}
R13 failed: R13 unavailable
got {'id': 'R01', 'dishes': 4}</div>
  <p>Finish order was R02 (0.1 s), R13 (0.2 s), R01 (0.3 s). <code>fut.result()</code> re-raised the exception from the worker thread in the caller, so the failure was handled on its own without losing the other results. The dict maps each future back to its input for the error message.</p>
  <table class="tbl">
    <tr><th></th><th><code>ex.map(fn, items)</code></th><th><code>submit</code> + <code>as_completed</code></th></tr>
    <tr><td>Result order</td><td>input order</td><td>finish order</td></tr>
    <tr><td>An exception</td><td>re-raised when you reach that result; the rest of the loop is lost</td><td>handled per future with <code>try</code></td></tr>
    <tr><td>Use when</td><td>one function, uniform inputs, all must succeed</td><td>process results as they arrive, tolerate failures, mixed functions</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>ThreadPoolExecutor(max_workers=n)</strong>: a pool of n reusable threads; default <code>min(32, os.cpu_count() + 4)</code>. <strong>Future</strong>: <code>result(timeout=None)</code>, <code>exception()</code>, <code>done()</code>, <code>cancel()</code> (only before it starts), <code>add_done_callback(fn)</code>. <code>ex.shutdown(wait=True, cancel_futures=False)</code> is what leaving the <code>with</code> block calls.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Expecting <code>ThreadPoolExecutor</code> to speed up CPU-bound Python: the GIL still applies. The same interface with processes is <code>ProcessPoolExecutor</code> (<a class="xref" data-note="py_multiprocessing">Processes</a>), which is why the two share an API.</p></div>

  <h2 id="th-safe"><span class="num">10</span>Thread-Safety Pitfalls</h2>
  <p>Pools and locks remove the plumbing, not the failure modes that produce no obvious error.</p>
  <h3>Exceptions in raw threads do not reach the caller</h3>
  <p>With a raw <code>Thread</code>, an exception in the target is printed to stderr by <code>threading.excepthook</code>, the thread dies, and <code>join()</code> returns normally:</p>
  <div class="fx" data-lang="py">import threading
from workload import fetch_menu

menus = {}
def worker(rid):
    if rid == "R13":
        raise ConnectionError("R13 unavailable")
    menus[rid] = fetch_menu(rid)

ts = [threading.Thread(target=worker, args=(r,)) for r in ("R12", "R13")]
for t in ts: t.start()
for t in ts: t.join()
print("main carries on, results:", list(menus))</div>
  <div class="fx" data-lang="text">Exception in thread Thread-2 (worker):
Traceback (most recent call last):
  File "/usr/local/lib/python3.13/threading.py", line 1044, in _bootstrap_inner
    self.run()
    ~~~~~~~~^^
  File "/usr/local/lib/python3.13/threading.py", line 995, in run
    self._target(*self._args, **self._kwargs)
    ~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "thread_exc.py", line 7, in worker
    raise ConnectionError("R13 unavailable")
ConnectionError: R13 unavailable
main carries on, results: ['R12']</div>
  <p>(Script path shortened.) The traceback appeared, but main continued with one result and nothing in its code knew about the failure. Fix: use a pool and call <code>future.result()</code>, which re-raises, or catch exceptions inside the target and record them.</p>
  <h3>Check-then-act</h3>
  <p>"If the key is not cached, fetch and store it" is two steps. Four threads can all pass the check before any of them stores:</p>
  <div class="fx" data-lang="py">import threading, time

calls = 0
cache = {}
def slow_fetch(key):
    global calls
    calls += 1
    time.sleep(0.05)
    return {"id": key}

def get(key):                                  # check ... then act
    if key not in cache:
        cache[key] = slow_fetch(key)
    return cache[key]

ts = [threading.Thread(target=get, args=("R07",)) for _ in range(4)]
for t in ts: t.start()
for t in ts: t.join()
print("no lock  : slow_fetch called", calls, "times for one key")

calls = 0; cache.clear(); lock = threading.Lock()
def get_safe(key):
    with lock:                                 # check and act as one step
        if key not in cache:
            cache[key] = slow_fetch(key)
        return cache[key]
ts = [threading.Thread(target=get_safe, args=("R07",)) for _ in range(4)]
for t in ts: t.start()
for t in ts: t.join()
print("with lock: slow_fetch called", calls, "time")</div>
  <div class="fx" data-lang="text">no lock  : slow_fetch called 4 times for one key
with lock: slow_fetch called 1 time</div>
  <p>Without the lock the expensive call ran 4 times for one key; holding a lock across check and act makes it run once. (Here the lock also serialises different keys; a per-key lock or <code>functools.lru_cache</code> plus a lock around misses are common refinements.)</p>
  <h3>threading.local: per-thread state</h3>
  <p>Some objects must not be shared between threads, such as many DB connections, HTTP sessions and generators. <code>threading.local()</code> gives each thread its own attribute namespace:</p>
  <div class="fx" data-lang="py">import threading

local = threading.local()                      # each thread sees its own attributes
results = {}

def worker(name):
    local.conn = f"connection-for-{name}"      # e.g. one DB connection per thread
    results[name] = local.conn

ts = [threading.Thread(target=worker, args=(n,)) for n in ("t1", "t2")]
for t in ts: t.start()
for t in ts: t.join()
print(results)
print("main thread has conn?", hasattr(local, "conn"))</div>
  <div class="fx" data-lang="text">{'t1': 'connection-for-t1', 't2': 'connection-for-t2'}
main thread has conn? False</div>
  <h3>Other facts worth knowing</h3>
  <ul>
    <li><strong>Threads cannot be killed.</strong> There is no <code>thread.stop()</code>. Give long-running threads a stop <code>Event</code> to check, or make them daemons.</li>
    <li><strong>Non-thread-safe objects.</strong> A generator used from two threads raises <code>ValueError: generator already executing</code>; many client libraries document that a client must not be shared. Use <code>threading.local()</code> or a lock.</li>
    <li><strong>Module-level state is shared.</strong> Globals, class attributes and mutable default arguments are visible to every thread.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span><p>Code is <strong>thread-safe</strong> if it behaves correctly when called from several threads at once, under any interleaving. Techniques, best first: no shared mutable state (each thread its own data, combine at the end), immutable data, queues, then locks around every compound operation on shared state.</p></div>

  <h2 id="th-traps"><span class="num">11</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: threads for CPU-bound Python</span><p>4 threads run 4 calculations no faster than 1. Use processes, or vectorise with numpy.</p></div>
  <div class="callout trap"><span class="label">Trap: <code>target=f()</code> instead of <code>target=f</code></span><p>The function runs immediately in the main thread; the thread does nothing.</p></div>
  <div class="callout trap"><span class="label">Trap: start and join in the same loop</span><p><code>for t in ts: t.start(); t.join()</code> runs the threads one after another. Start all, then join all.</p></div>
  <div class="callout trap"><span class="label">Trap: shared data without a lock</span><p><code>x = x + 1</code>, <code>d[k] = d.get(k, 0) + 1</code>, <code>if k not in cache: cache[k] = …</code> from several threads lose updates or duplicate work. Lock the compound operation, or give each thread its own data.</p></div>
  <div class="callout trap"><span class="label">Trap: slow work inside the lock</span><p>Holding a lock during I/O serialises all threads. Lock only the shared update.</p></div>
  <div class="callout trap"><span class="label">Trap: inconsistent lock order / re-acquiring a plain Lock</span><p>The program hangs with no error. One global lock order, timeouts, <code>RLock</code> for re-entry, queues instead of locks.</p></div>
  <div class="callout trap"><span class="label">Trap: exceptions lost in raw threads</span><p>The traceback is printed, the thread dies, main never knows. Use a pool and <code>future.result()</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: missing poison pills</span><p>Consumers block in <code>queue.get()</code> forever. One pill per consumer.</p></div>

  <h2 id="th-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Creating threads</h3>
  <div class="fx" data-lang="py">t = threading.Thread(target=f, args=(x,), name="w1", daemon=False)
t.start()          # returns immediately
t.join(timeout)    # wait; then check t.is_alive()
threading.current_thread().name, threading.active_count()</div>
  <ul>
    <li>Shared memory, own stack; the return value of <code>target</code> is discarded.</li>
    <li>Start all, then join all. Daemon threads die with the interpreter.</li>
    <li>I/O time with n threads ≈ ⌈tasks / n⌉ × wait (20 × 0.2 s: n = 1 → 4.0 s, 5 → 0.8 s, 20 → 0.2 s).</li>
  </ul>
  <h3>The GIL</h3>
  <ul>
    <li>One thread executes Python bytecode at a time per CPython process; protects reference counts.</li>
    <li>Released: blocking I/O, <code>sleep</code>, most numpy/pandas/hashlib/zlib C code. Held: pure-Python CPU work, offered every <code>sys.getswitchinterval()</code> = 0.005 s.</li>
    <li>CPU-bound threads: no speed-up (≈ 1.1 s sequential vs ≈ 1.1 s with 4 threads here).</li>
    <li>Free-threaded build (PEP 703): <code>python3.13t</code> experimental, 3.14t supported but opt-in; <code>sys._is_gil_enabled()</code>; slower single-thread; extensions must opt in.</li>
    <li>The GIL is not thread safety for your code.</li>
  </ul>
  <h3>Races</h3>
  <ul>
    <li><code>x += 1</code> = <code>LOAD</code>, <code>BINARY_OP</code>, <code>STORE</code>: not atomic.</li>
    <li>Single built-in ops (<code>list.append</code>, <code>d[k] = v</code>) are effectively atomic in CPython; sequences are not.</li>
    <li>Check-then-act on a shared cache duplicates work; lock check and act together.</li>
  </ul>
  <h3>Synchronisation primitives</h3>
  <table class="tbl">
    <tr><th>Primitive</th><th>Key API</th><th>Use</th></tr>
    <tr><td><code>Lock</code></td><td><code>with lock:</code>, <code>acquire(timeout=)</code>, <code>locked()</code></td><td>one at a time</td></tr>
    <tr><td><code>RLock</code></td><td>same, re-entrant for the owner</td><td>nested locked calls</td></tr>
    <tr><td><code>Semaphore(n)</code></td><td><code>with sem:</code></td><td>at most n inside</td></tr>
    <tr><td><code>Event</code></td><td><code>set</code>, <code>clear</code>, <code>is_set</code>, <code>wait(timeout)</code></td><td>signals, stop flags</td></tr>
    <tr><td><code>Condition</code></td><td><code>wait</code>, <code>notify</code>, <code>notify_all</code></td><td>custom coordination</td></tr>
    <tr><td><code>queue.Queue</code></td><td><code>put</code>, <code>get</code>, <code>maxsize</code>, <code>task_done</code>/<code>join</code></td><td>producer–consumer</td></tr>
    <tr><td><code>threading.local()</code></td><td>attribute per thread</td><td>per-thread connections</td></tr>
  </table>
  <h3>Deadlock</h3>
  <ul>
    <li>Circular wait; no error, just a hang.</li>
    <li>Prevent: one lock order, no slow work under a lock, timeouts, queues instead of shared state.</li>
  </ul>
  <h3>ThreadPoolExecutor</h3>
  <div class="fx" data-lang="py">with ThreadPoolExecutor(max_workers=20) as ex:
    out = list(ex.map(fetch, ids))                  # input order
    futs = {ex.submit(fetch, i): i for i in ids}
    for f in as_completed(futs):                    # finish order
        try: f.result()
        except Exception as e: log(futs[f], e)</div>
  <ul>
    <li>Default workers <code>min(32, cpu_count + 4)</code>.</li>
    <li><code>result()</code> re-raises the worker's exception in the caller.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li><code>target=f()</code> calls f immediately.</li>
    <li>Raw thread exceptions are printed and swallowed.</li>
    <li>Threads cannot be killed: use a stop Event.</li>
    <li>Holding a lock during I/O removes all concurrency.</li>
    <li>One thread per task does not scale to thousands: pool or asyncio.</li>
  </ul>

  <h2 id="th-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a thread, and how is it different from a process?</summary><div class="qa-body">A thread is a sequence of execution inside a process; all threads of a process share its memory and each has its own stack. A process has its own address space, and in Python its own interpreter and GIL. Threads are cheap to create and share data trivially but need synchronisation; processes are isolated, can run Python in parallel, but cost more to start and must pickle data to communicate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the GIL?</summary><div class="qa-body">The Global Interpreter Lock is a mutex in CPython that lets only one thread per process execute Python bytecode at a time. It exists mainly to make reference counting safe without per-object locks. It is released during blocking I/O and in many C extensions, so threads help I/O-bound work but not CPU-bound pure-Python work.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>If Python has a GIL, why use threads at all?</summary><div class="qa-body">Because most real waiting releases the GIL. Network calls, disk reads, DB queries and <code>time.sleep</code> all release it, so many threads can be waiting at once: 20 calls of 0.2 s took 4.0 s sequentially and 0.2 s with 20 threads. Heavy numpy and other C code also release it and can run in parallel across threads.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why don't threads speed up a CPU-bound pure-Python function?</summary><div class="qa-body">Only the thread holding the GIL can execute bytecode; a computing thread holds it and hands it over every switch interval (5 ms), so threads take turns on one core's worth of Python execution. Total time is the same as sequential, sometimes worse because of lock hand-offs. Use a process pool, vectorise, or a free-threaded build.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is <code>counter += 1</code> thread-safe in Python?</summary><div class="qa-body">No. <code>dis</code> shows it is a load, an add and a store; a thread switch between load and store loses an update. A bare <code>+=</code> in a tight loop sometimes gives the right total on a particular CPython version because switches happen only at certain instructions, but that is an implementation detail. Protect it with a lock, or use per-thread counters and sum them at the end.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does the GIL make Python code thread-safe?</summary><div class="qa-body">No. It guarantees that individual bytecode instructions (and therefore single built-in operations like <code>list.append</code>) do not interleave, not that a sequence of them runs as a unit. Read-modify-write and check-then-act sequences on shared data still need locks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a race condition? Give an example.</summary><div class="qa-body">A bug whose outcome depends on thread timing. Example: two threads both read a counter as 5, both write 6, and one increment is lost. Another: two threads both find a key missing from a cache and both perform the expensive fetch. Fix with a lock around the compound operation, or avoid shared mutable state.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Lock vs RLock?</summary><div class="qa-body">A <code>Lock</code> has no owner: if the holding thread acquires it again it blocks forever. An <code>RLock</code> records its owner and a count, so the owner can re-acquire it (for example, a locked method calling another locked method) and must release it the same number of times. Only the owner may release an RLock.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a deadlock, and how do you prevent one?</summary><div class="qa-body">A circular wait: thread 1 holds lock A and waits for B while thread 2 holds B and waits for A. Prevent it by acquiring locks in one global order, not holding locks during slow I/O or callbacks, using <code>acquire(timeout=…)</code>, and preferring queues to shared state. To diagnose a hang, dump all thread stacks (<code>faulthandler</code>, <code>py-spy dump</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Semaphore vs Lock?</summary><div class="qa-body">A lock admits one holder; <code>Semaphore(n)</code> admits up to n. Use a semaphore to enforce a limit such as "at most 3 concurrent API requests" or a pool of n connections. <code>BoundedSemaphore</code> additionally raises if released more times than acquired, which catches bugs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does <code>queue.Queue</code> help with thread safety?</summary><div class="qa-body">It is a FIFO with its own internal lock and conditions, so producers <code>put</code> and consumers <code>get</code> safely without any locking in your code. Data is handed over rather than shared, which removes most races. <code>maxsize</code> adds back-pressure; poison pills or <code>task_done()</code>/<code>join()</code> handle shutdown.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you return a value from a thread?</summary><div class="qa-body">A raw <code>Thread</code> discards the target's return value, so you write it to a shared structure (a per-thread slot, a queue) or subclass <code>Thread</code> to store it. The idiomatic way is <code>ThreadPoolExecutor</code>: <code>submit</code> returns a Future whose <code>result()</code> gives the value or re-raises the exception.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>executor.map</code> vs <code>submit</code> + <code>as_completed</code>?</summary><div class="qa-body"><code>map</code> yields results in input order and re-raises the first exception when you reach it. <code>submit</code> returns one Future per call and <code>as_completed</code> yields them in finish order, so you can process fast results first and handle each failure separately.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many threads should a ThreadPoolExecutor have?</summary><div class="qa-body">For I/O-bound work, enough to cover the waits you want overlapped, bounded by what the remote service, connection pool and memory allow: often tens, sometimes a few hundred. Time ≈ ⌈tasks / workers⌉ × latency. The default is <code>min(32, cpu_count + 4)</code>. For CPU-bound pure Python more threads do not help at all.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens to an exception raised inside a thread?</summary><div class="qa-body">With a raw <code>Thread</code>, <code>threading.excepthook</code> prints the traceback to stderr, the thread ends, and <code>join()</code> returns normally, so the caller never sees it. With an executor, the exception is stored in the Future and re-raised by <code>result()</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you stop a running thread?</summary><div class="qa-body">You cannot kill it from outside in Python. Design it to stop: pass a <code>threading.Event</code> it checks in its loop (and use <code>event.wait(timeout)</code> instead of <code>sleep</code> so it wakes promptly), or send a poison pill through its queue. Daemon threads are abandoned at interpreter exit, without cleanup.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a daemon thread?</summary><div class="qa-body">A thread created with <code>daemon=True</code>. The interpreter exits when only daemon threads remain, without waiting for them or running their cleanup. Use it for background helpers (heartbeats, monitors) whose abrupt end is harmless; not for work that must finish, such as writing files.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print, and why might it vary? <code>for _ in range(4): Thread(target=lambda: print("hi", end=""), daemon=False).start()</code></summary><div class="qa-body">It prints <code>hihihihi</code> in some order. Each thread prints the same text, so the visible result looks the same, but the order in which threads run is chosen by the OS. With different messages, or with <code>print</code> that writes text and newline separately, outputs from different threads can interleave or appear in any order.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is free-threaded Python, and should you use it?</summary><div class="qa-body">An optional CPython build without the GIL (PEP 703): experimental as <code>python3.13t</code>, officially supported but not the default from 3.14. Threads can then run Python code in parallel. Costs: somewhat slower single-threaded code, and every C extension must support it, otherwise the GIL is re-enabled at import. Races become more likely. It is worth benchmarking for CPU-heavy threaded code whose dependencies support it; processes remain the portable answer.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your threaded downloader sometimes returns fewer files than expected and shows no error. Where do you look?</summary><div class="qa-body">Exceptions in raw threads (printed and swallowed: switch to a pool and call <code>result()</code>), shared lists or dicts updated with compound operations without a lock, check-then-act around a "seen" set or cache, and a non-thread-safe client shared between threads (give each thread its own via <code>threading.local</code>).</div></details>
</main>
`
});
