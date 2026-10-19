// notes/python/py_threading.js — Threads & the GIL
Object.assign(TOPIC_CONTENT, {
  "py_threading": `<main>
<h1>Threads &amp; the GIL</h1>
  <div class="where"><span>Python</span><span>Advanced Python</span><span>Concurrency</span><span>Threads &amp; the GIL</span></div>
  <p class="lead">A thread lets one part of your program wait while another part keeps going. This note builds threads up one need at a time on the QuickBite running example: start two threads and trace them on a timeline, fetch 20 menus in 0.2 s instead of 4 s, then discover the limit (4 threads do not plan routes any faster) and the reason for it, the <strong>GIL</strong>. Sharing memory between threads then brings its own bugs, so we reproduce a race condition, look inside <code>counter += 1</code> with <code>dis</code>, and fix it with locks, before meeting deadlock, semaphores, events, queues and the thread pool you will actually use day to day. Every block of code was run and its real output is shown under it; timings vary from run to run, so read them as ratios.</p>

  <h2 id="th-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 150" width="640">
    <defs><marker id="th-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="200" y="8" width="240" height="30" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="28" text-anchor="middle" font-size="12">Concurrency in Python: the map</text>
    <line x1="320" y1="38" x2="110" y2="70" stroke="currentColor" stroke-opacity="0.45"/>
    <line x1="320" y1="38" x2="320" y2="70" stroke="currentColor" stroke-opacity="0.45"/>
    <line x1="320" y1="38" x2="530" y2="70" stroke="currentColor" stroke-opacity="0.45"/>
    <rect x="20" y="70" width="180" height="34" rx="6" class="fg sg" stroke-width="2.5"/><text x="110" y="92" text-anchor="middle" font-size="12" font-weight="700">Threads &amp; the GIL</text>
    <rect x="230" y="70" width="180" height="34" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="92" text-anchor="middle" font-size="12">Processes</text>
    <rect x="440" y="70" width="180" height="34" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="530" y="92" text-anchor="middle" font-size="12">asyncio</text>
    <line x1="200" y1="87" x2="226" y2="87" stroke="currentColor" marker-end="url(#th-a0)"/>
    <line x1="410" y1="87" x2="436" y2="87" stroke="currentColor" marker-end="url(#th-a0)"/>
    <text x="215" y="125" class="tm" font-size="11">GIL limit → processes</text>
    <text x="420" y="125" class="tm" font-size="11">thread cost → asyncio</text>
  </svg><figcaption>The Concurrency group. You are on the green note, the first child. Its two weaknesses each start the next note: the GIL (threads cannot compute in parallel) leads to Processes; the cost of threads and their shared-memory bugs lead to asyncio.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="py_concurrency">Concurrency in Python: the map</a></b><span>The map showed that QuickBite's 20 menu requests spend 4.0 s waiting with the CPU idle (I/O-bound), and that route planning keeps the CPU busy (CPU-bound). It promised that threads overlap waits but cannot speed up calculation. You also know <code>with</code> blocks from <a class="xref" data-note="py_context">Context Managers</a>; locks use them.</span></li>
    <li><b>This note adds: threads and how to share safely</b><span>What a thread is, <code>start</code>/<code>join</code>, the GIL (why it exists, when it is released, free-threaded builds), race conditions, <code>Lock</code>, <code>RLock</code>, deadlock, <code>Semaphore</code>, <code>Event</code>, <code>queue.Queue</code>, <code>ThreadPoolExecutor</code>, and the thread-safety traps.</span></li>
    <li><b>Leads to: <a class="xref" data-note="py_multiprocessing">Processes</a></b><span>Threads cannot run Python calculations on several cores at once. Processes can, at a price. After that, <a class="xref" data-note="py_asyncio">asyncio</a> overlaps waits without threads at all, and uses <code>asyncio.to_thread</code> (built on this note's thread pool) for code that blocks.</span></li>
  </ol>

  <h2 id="th-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each idea answers the question above it; its weakness raises the next question. Numbers come from the running example: 20 restaurants, 0.2 s per menu request, 100 dishes in total; 4 riders whose best routes cost 40, 36, 35, 36.</p>
  <ol class="story">
    <li><b>A thread</b><span>Q: how can the program send request 2 while request 1 is still waiting? → Start a thread: a second line of execution in the same program. Two requests: 0.4 s instead of 0.6 s. Does it scale to all 20?</span></li>
    <li><b>Twenty threads</b><span>Q: can every request wait at once? → 20 threads: 100 dishes in 0.20 s instead of 4.00 s. Then why not use threads for the route plans too?</span></li>
    <li><b>The GIL</b><span>Q: why are 4 threads no faster at route planning? → CPython lets only one thread at a time run Python bytecode; it is released while waiting, not while computing. So threads are for waiting. But if they share memory, can they step on each other?</span></li>
    <li><b>Race condition</b><span>Q: what happens when 4 threads add to one counter? → <code>dis</code> shows "add 1" is read, add, write; a switch between read and write loses updates: 800,000 additions, only 440,000 to 730,000 counted, different every run. How do we stop the interleaving?</span></li>
    <li><b>Lock (and RLock)</b><span>Q: how do we make read-add-write one step? → <code>with lock:</code> lets one thread in at a time: exactly 800,000. <code>RLock</code> lets the same thread re-enter. But two locks can trap two threads…</span></li>
    <li><b>Deadlock</b><span>Q: what if each thread holds the lock the other needs? → Both wait forever, no error. Fix: one lock order everywhere, timeouts. Locks guard data; what about limiting how many threads do something, or signalling "ready"?</span></li>
    <li><b>Semaphore, Event</b><span>Q: how do we allow at most 3 requests at a time, or make one thread wait for another's signal? → <code>Semaphore(3)</code>: 20 menus in 7 rounds ≈ 1.4 s; <code>Event</code>: the planner waits for "menus ready". Can threads avoid sharing variables altogether?</span></li>
    <li><b>queue.Queue</b><span>Q: how do threads hand work to each other safely? → Producers put, consumers get; the queue does the locking. 5 fetchers + 1 tallier: 100 dishes, no lock in our code. Must we create and join threads by hand every time?</span></li>
    <li><b>ThreadPoolExecutor</b><span>Q: is there a ready-made pool? → <code>map</code> (input order) and <code>submit</code> + <code>as_completed</code> (finish order, errors one by one); 5 workers → 0.8 s, 20 → 0.2 s. What else goes wrong with threads?</span></li>
    <li><b>Thread-safety traps</b><span>Q: what are the silent failures? → Exceptions in threads do not reach <code>main</code>; check-then-act fetches the same menu 4 times; threads cannot be killed; and the GIL never made your code safe.</span></li>
  </ol>

  <h2 id="th-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Threads &amp; the GIL</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Threads</div>
        <ul>
          <li>Line of execution inside one process; <b>shared memory</b></li>
          <li><code>Thread(target=f, args=(…,))</code> → <code>start()</code> → <code>join()</code></li>
          <li>Return value is discarded: write results to a shared slot</li>
          <li>OS decides who runs when: output order varies</li>
          <li>💡 cooks sharing one kitchen</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">GIL</div>
        <ul>
          <li>One thread runs Python bytecode at a time (CPython)</li>
          <li>Protects reference counts; keeps single-thread code fast</li>
          <li><b>Released</b>: I/O, <code>sleep</code>, most numpy/C work</li>
          <li>Menus 4.0 → 0.2 s; routes 1.39 → 1.70 s (no gain)</li>
          <li>Free-threaded build 3.13t (experimental), 3.14t (supported, opt-in)</li>
          <li>💡 one microphone on stage</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Races</div>
        <ul>
          <li><code>x += 1</code> = LOAD, BINARY_OP, STORE</li>
          <li>Switch between read and write → lost update</li>
          <li>800,000 → ≈ 440k–730k, different each run</li>
          <li>Check-then-act: same fetch done 4 times</li>
          <li>GIL ≠ thread safety</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Sync tools</div>
        <ul>
          <li><code>Lock</code> — one at a time; <code>with lock:</code></li>
          <li><code>RLock</code> — same thread may re-enter</li>
          <li><code>Semaphore(n)</code> — at most n inside</li>
          <li><code>Event</code> — <code>set()</code> / <code>wait()</code> flag</li>
          <li><code>Condition</code> — wait until notified</li>
          <li><code>queue.Queue</code> — safe hand-off; poison pill <code>None</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Deadlock</div>
        <ul>
          <li>A holds L1 wants L2; B holds L2 wants L1 → hang</li>
          <li>Same thread re-taking a plain <code>Lock</code> → hang</li>
          <li>Fix: one lock order, <code>acquire(timeout=)</code>, RLock, queues</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">ThreadPoolExecutor</div>
        <ul>
          <li><code>map</code> → input order; first error re-raised</li>
          <li><code>submit</code> → Future; <code>as_completed</code> → finish order</li>
          <li><code>max_workers</code> = how many waits overlap</li>
          <li>20 menus: 1 worker 4.0 s, 5 → 0.8 s, 20 → 0.2 s</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="th-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="th-what"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What a Thread Is</span><span class="rm-sub">start and join, traced</span></div></div>
      <div class="rm-item rm-done" data-target="th-twenty"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Twenty Menus at Once</span><span class="rm-sub">4.0 s → 0.2 s</span></div></div>
      <div class="rm-item rm-done" data-target="th-gil"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The GIL</span><span class="rm-sub">Why routes don't speed up</span></div></div>
      <div class="rm-item rm-done" data-target="th-race"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Race Conditions</span><span class="rm-sub">Lost updates, seen with dis</span></div></div>
      <div class="rm-item rm-done" data-target="th-lock"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Lock and RLock</span><span class="rm-sub">One thread at a time</span></div></div>
      <div class="rm-item rm-done" data-target="th-dead"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Deadlock</span><span class="rm-sub">Traced and fixed</span></div></div>
      <div class="rm-item rm-done" data-target="th-signal"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Semaphore and Event</span><span class="rm-sub">Limits and signals</span></div></div>
      <div class="rm-item rm-done" data-target="th-queue"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Producer–Consumer</span><span class="rm-sub">queue.Queue</span></div></div>
      <div class="rm-item rm-done" data-target="th-pool"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">ThreadPoolExecutor</span><span class="rm-sub">The everyday API</span></div></div>
      <div class="rm-item rm-done" data-target="th-safe"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Thread-Safety Traps</span><span class="rm-sub">Silent failures</span></div></div>
      <div class="rm-item rm-done" data-target="th-connect"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One table, one picture</span></div></div>
      <div class="rm-item rm-done" data-target="th-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Symptoms and fixes</span></div></div>
      <div class="rm-item rm-done" data-target="th-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="th-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview and connection checks</span></div></div>
    </div>
  </div>

  <h2 id="th-what"><span class="num">01</span>What a Thread Is</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>QuickBite's sequential run sends request 1, then sits idle for 0.2 s, then sends request 2. How can a Python program send request 2 <em>while</em> request 1 is still waiting, when Python runs one line after another?</p>
  </div>
  <h3>The running example, again</h3>
  <p>If you came here from the map, you have this file already. If not: save it as <code>quickbite.py</code>. <code>fetch_menu(rid)</code> waits 0.2 s (a simulated network request) and returns a menu; <code>route_cost(stops)</code> tries every order of a rider's stops and returns the shortest distance (pure calculation). The 20 menus hold 100 dishes; the 4 riders' best routes cost 40, 36, 35, 36.</p>
  <div class="fx" data-lang="py">"""quickbite.py: the running example shared by all four Concurrency notes."""
import asyncio, time, itertools

RESTAURANTS = [f"R{i:02d}" for i in range(1, 21)]   # 20 restaurants: R01 ... R20
LATENCY = 0.2                                      # every menu request waits 0.2 s

def fetch_menu(rid):
    """I/O-bound: pretend network call. 0.2 s of pure waiting, then a small menu."""
    time.sleep(LATENCY)                            # the restaurant's server is "thinking"
    return {"id": rid, "dishes": 3 + int(rid[1:]) % 5}

async def fetch_menu_async(rid):
    """The same request written for asyncio: the wait is an await, not a sleep."""
    await asyncio.sleep(LATENCY)                   # pause here; the event loop runs others
    return {"id": rid, "dishes": 3 + int(rid[1:]) % 5}

def dist(a, b):
    """Blocks walked between two points on the city grid (Manhattan distance)."""
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def route_cost(stops, depot=(0, 0)):
    """CPU-bound: try every order of the stops, return the shortest total distance."""
    best = None
    for order in itertools.permutations(stops):
        cost, here = 0, depot
        for stop in order:
            cost += dist(here, stop)
            here = stop
        if best is None or cost &lt; best:
            best = cost
    return best

def make_rider(seed, n=9):
    """One rider's batch of n drop-off points, generated the same way every run."""
    return [((seed * 7 + i * 5) % 11, (seed * 3 + i * 7) % 13) for i in range(n)]

RIDERS = [make_rider(s) for s in range(1, 5)]      # 4 riders, 9 stops each</div>
  <h3>The idea in plain words</h3>
  <p>A normal program has one <strong>thread</strong>: one "finger" running down the code, line by line. You can ask Python to start a second finger on a different function. Now there are two lines of execution inside the same program. When one of them reaches a wait (like <code>time.sleep</code> or a network call), the operating system lets the other run. Both fingers point into the same memory: the same variables, the same dicts.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Cooks in one kitchen. Each cook follows their own recipe (their own thread), but they share one fridge and one counter (memory). While one cook waits for water to boil, another chops. Sharing is effortless, because everything is right there; but two cooks grabbing the same bowl at the same moment is a mess (section 04).</p></div>
  <h3>Three calls: Thread, start, join</h3>
  <ul>
    <li><code>threading.Thread(target=worker, args=("R01", 0.2))</code> creates a thread object that <em>will</em> run <code>worker("R01", 0.2)</code>. Note <code>target=worker</code> without brackets: we hand over the function, not its result. <code>args</code> is a tuple, so one argument is written <code>args=("R01",)</code>.</li>
    <li><code>.start()</code> begins running it in the background and returns immediately.</li>
    <li><code>.join()</code> makes the caller wait until that thread has finished.</li>
  </ul>
  <p>Two threads, two restaurants. R01's kitchen is slow today (an extra 0.2 s before its 0.2 s request), R02 is normal. A thread throws away its function's return value, so each thread stores its menu in a shared dict. Every line is printed with the time since the start and the thread's name.</p>
  <div class="fx" data-lang="py">import sys, threading, time
from quickbite import fetch_menu

T0 = time.perf_counter()
def log(msg):                                  # one write per line, so lines never mix
    sys.stdout.write(f"{time.perf_counter() - T0:.1f}s  [{threading.current_thread().name:&lt;10}] {msg}\\n")

results = {}                                   # threads share this dict with main
def worker(rid, extra):
    log(f"{rid} request sent")
    time.sleep(extra)                          # R01's kitchen is slower today
    results[rid] = fetch_menu(rid)             # a thread throws its return value away, so store it
    log(f"{rid} menu received")

a = threading.Thread(target=worker, args=("R01", 0.2), name="thread-A")
b = threading.Thread(target=worker, args=("R02", 0.0), name="thread-B")
a.start(); b.start()                           # both begin now; start() returns at once
log(f"both started, {threading.active_count()} threads alive")
a.join(); b.join()                             # wait until both have finished
log(f"joined: {results}")</div>
  <div class="fx" data-lang="text">0.0s  [thread-A  ] R01 request sent
0.0s  [thread-B  ] R02 request sent
0.0s  [MainThread] both started, 3 threads alive
0.2s  [thread-B  ] R02 menu received
0.4s  [thread-A  ] R01 menu received
0.4s  [MainThread] joined: {'R02': {'id': 'R02', 'dishes': 5}, 'R01': {'id': 'R01', 'dishes': 4}}</div>
  <h3>Traced by hand</h3>
  <table class="tbl"><caption>The timeline (MainThread is the thread every program starts with)</caption>
    <tr><th>Time</th><th>MainThread</th><th>thread-A (R01, slow)</th><th>thread-B (R02)</th></tr>
    <tr><td>0.0 s</td><td><code>a.start()</code>, <code>b.start()</code>, prints "both started, 3 threads alive", then waits in <code>a.join()</code></td><td>prints "request sent", sleeps 0.2 s (slow kitchen)</td><td>prints "request sent", <code>fetch_menu</code> waits 0.2 s</td></tr>
    <tr><td>0.2 s</td><td>still waiting in <code>a.join()</code></td><td>starts <code>fetch_menu</code>: another 0.2 s</td><td>stores R02's menu, prints "received", <strong>ends</strong></td></tr>
    <tr><td>0.4 s</td><td><code>a.join()</code> returns; <code>b.join()</code> returns at once (B already ended); prints results</td><td>stores R01's menu, prints "received", <strong>ends</strong></td><td></td></tr>
  </table>
  <p>Total 0.4 s. One after another it would have been 0.4 (R01) + 0.2 (R02) = 0.6 s; B's whole request happened during A's wait. Notice three things in the output. "both started" is printed while both requests are still waiting, because <code>start()</code> does not wait. "3 threads alive" counts MainThread, A and B. And the dict lists R02 first, because B finished first. Run it a few times and the first three lines can come out in a different order: <strong>the operating system decides which thread runs when</strong>. That unpredictability is the root of every problem in this note. (The <code>log</code> function writes each line with one <code>sys.stdout.write</code> call; with <code>print</code>, the text and the newline are two separate writes, and lines from two threads can mix on one line.)</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>thread</strong> is an independent sequence of execution inside a process, scheduled by the operating system. All threads of a process share its memory (global variables, objects on the heap); each has its own call stack (its own local variables). <code>start()</code> launches it; <code>join()</code> waits for it to end. A <strong>daemon</strong> thread (<code>daemon=True</code>) does not keep the program alive: Python exits without waiting for it.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Writing <code>Thread(target=worker("R01", 0.2))</code>. The brackets <em>call</em> <code>worker</code> right now, in the main thread, and pass its result (<code>None</code>) as the target. The work happens sequentially and the thread does nothing. Pass the function and its arguments separately.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Twenty Menus at Once.</b> Two requests overlapped. Does the same trick work for all 20, and how do we collect 20 results cleanly?</div>

  <h2 id="th-twenty"><span class="num">02</span>Twenty Menus at Once</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>If 2 threads saved 0.2 s, can 20 threads make all 20 requests wait at the same time, so the whole job takes about one wait?</p>
  </div>
  <p>Plan: one thread per restaurant. To collect results without threads interfering, give each thread its own slot in a list: thread <code>i</code> writes only <code>menus[i]</code>. Start all 20, then join all 20.</p>
  <div class="fx" data-lang="py">import threading, time
from quickbite import RESTAURANTS, fetch_menu

menus = [None] * len(RESTAURANTS)              # one slot per restaurant
def worker(i, rid):
    menus[i] = fetch_menu(rid)                 # each thread writes only its own slot

t = time.perf_counter()
threads = [threading.Thread(target=worker, args=(i, r)) for i, r in enumerate(RESTAURANTS)]
for th in threads: th.start()
for th in threads: th.join()
print(f"20 threads: {sum(m['dishes'] for m in menus)} dishes in {time.perf_counter() - t:.2f}s")</div>
  <div class="fx" data-lang="text">20 threads: 100 dishes in 0.20s</div>
  <p>100 dishes, the hand answer, in 0.20 s instead of 4.00 s: 20× faster. All twenty 0.2 s waits happened during the same 0.2 s. The two loops matter: <em>first</em> start every thread, <em>then</em> join every thread. If you wrote <code>th.start(); th.join()</code> inside one loop, each thread would finish before the next started, and you would be back to 4 s.</p>
  <figure class="viz"><svg viewBox="0 0 560 130" width="560">
    <text x="10" y="18" class="tm">20 threads (5 shown): each sends, then waits; the waits overlap</text>
    <text x="10" y="42">R01</text><rect x="60" y="32" width="4" height="12" class="fb sb"/><rect x="64" y="32" width="200" height="12" class="fs"/>
    <text x="10" y="60">R02</text><rect x="62" y="50" width="4" height="12" class="fb sb"/><rect x="66" y="50" width="200" height="12" class="fs"/>
    <text x="10" y="78">R03</text><rect x="64" y="68" width="4" height="12" class="fb sb"/><rect x="68" y="68" width="200" height="12" class="fs"/>
    <text x="10" y="96">…</text>
    <text x="10" y="114">R20</text><rect x="68" y="104" width="4" height="12" class="fb sb"/><rect x="72" y="104" width="200" height="12" class="fs"/>
    <text x="290" y="72" class="tg">all done after ≈ one wait (0.2 s)</text>
    <text x="290" y="90" class="tm">sequential: 20 waits end to end = 4.0 s</text>
  </svg><figcaption>Each row is one thread. The tiny blue bit is the work of sending the request; the long grey bar is the wait. Because the waits run side by side, the job ends after roughly one wait, not twenty.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span><p>Ordering from 20 restaurants: instead of phoning one, waiting on hold, then phoning the next, you give 20 friends one phone each and they all wait on hold at the same time.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>For I/O-bound work, the time with <em>n</em> threads is roughly <strong>⌈tasks / n⌉ × (time per wait)</strong>: 20 tasks, 20 threads → 1 × 0.2 s; 20 tasks, 5 threads → 4 × 0.2 = 0.8 s (measured in section 09).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>One thread per task does not scale to 10,000 tasks: each thread reserves memory for its stack and the operating system has to schedule all of them. Use a pool with a fixed number of threads (section 09), or asyncio for very many waits (<a class="xref" data-note="py_asyncio">asyncio</a>).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: The GIL.</b> Threads made the waiting job 20× faster. QuickBite's other job, route planning, is calculation. Will 4 threads plan 4 routes 4× faster?</div>

  <h2 id="th-gil"><span class="num">03</span>The GIL</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>This machine has 4 cores. Four threads, each planning one rider's route, should finish in a quarter of the time. Do they?</p>
  </div>
  <div class="fx" data-lang="py">import threading, time
from quickbite import RIDERS, route_cost

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
  <div class="fx" data-lang="text">sequential: [40, 36, 35, 36] in 1.39s
4 threads:  [40, 36, 35, 36] in 1.70s</div>
  <p>No speed-up at all: 4 threads took about as long as doing the riders one after another (here even a little longer). Same answers, no gain. The reason is a design decision inside CPython, the normal Python interpreter.</p>
  <h3>Why the lock exists</h3>
  <p>Python frees memory by <strong>reference counting</strong>: every object carries a counter of how many names and containers point at it, and when the counter reaches zero the object is deleted. You can see the counter:</p>
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
  <p><code>sys.getrefcount</code> reports one more than you might expect, because passing <code>menu</code> to the function creates a temporary reference: 1 (the name <code>menu</code>) + 1 (the argument) = 2. <code>alias = menu</code> adds one (3); <code>del alias</code> removes it (2). Every assignment, every function call, every list append changes such counters, millions of times a second.</p>
  <p>Now imagine two threads changing the same counter at the same instant: both read 2, both write 3, and one increment is lost. The count is now too low, so the object could be freed while still in use, and the program crashes. Rather than putting a small lock on every object (slow), CPython puts <strong>one big lock around the whole interpreter</strong>: the Global Interpreter Lock. A thread must hold it to run Python bytecode. So at any instant only one thread is running Python code, however many cores you have.</p>
  <h3>When the GIL is released</h3>
  <p>The good news: a thread lets go of the GIL whenever it starts waiting (network, files, <code>time.sleep</code>) and whenever it enters long-running C code that does not touch Python objects (most numpy, pandas and PyTorch heavy lifting, hashing, compression). That is why the 20 menu requests overlapped perfectly: each thread held the GIL for a moment to send its request, then released it while waiting. A thread that is computing in pure Python, like <code>route_cost</code>, holds it; CPython forces it to offer the lock to others every <strong>switch interval</strong> (0.005 s, printed above), so computing threads take turns instead of running together.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A singing competition with one microphone. Only the singer holding the mic can sing, however many singers are on stage. A singer who goes backstage for water (waiting for I/O) hands the mic over, so the breaks overlap with other people's singing. Two singers who both just want to sing (computing) can only alternate. numpy is a singer who brought their own speaker: they can perform without the shared mic.</p></div>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
    <text x="10" y="18" class="tm">CPU-bound (routes): threads take turns</text>
    <text x="10" y="45">T1</text><text x="10" y="75">T2</text>
    <rect x="40" y="33" width="50" height="16" class="fb sb"/><rect x="90" y="33" width="50" height="16" fill="none" stroke="currentColor" opacity="0.4"/>
    <rect x="140" y="33" width="50" height="16" class="fb sb"/><rect x="190" y="33" width="50" height="16" fill="none" stroke="currentColor" opacity="0.4"/>
    <rect x="40" y="63" width="50" height="16" fill="none" stroke="currentColor" opacity="0.4"/><rect x="90" y="63" width="50" height="16" class="ft st"/>
    <rect x="140" y="63" width="50" height="16" fill="none" stroke="currentColor" opacity="0.4"/><rect x="190" y="63" width="50" height="16" class="ft st"/>
    <text x="40" y="105" class="tr">total = T1 + T2 → no speed-up</text>
    <text x="300" y="18" class="tm">I/O-bound (menus): wait without the GIL</text>
    <text x="300" y="45">T1</text><text x="300" y="75">T2</text>
    <rect x="330" y="33" width="25" height="16" class="fb sb"/><rect x="355" y="33" width="150" height="16" class="fs"/>
    <rect x="355" y="63" width="25" height="16" class="ft st"/><rect x="380" y="63" width="150" height="16" class="fs"/>
    <text x="330" y="105" class="tg">T2 runs while T1 waits → overlap</text>
    <rect x="40" y="122" width="12" height="12" class="fb sb"/><text x="58" y="132" class="tm">holds GIL</text>
    <rect x="140" y="122" width="12" height="12" fill="none" stroke="currentColor" opacity="0.4"/><text x="158" y="132" class="tm">wants GIL</text>
    <rect x="320" y="122" width="12" height="12" class="fs"/><text x="338" y="132" class="tm">waiting (GIL free)</text>
  </svg><figcaption>Left: two computing threads. Only one holds the lock (filled box) while the other waits for it (empty box), so they alternate and the total is the sum, plus a little for handing the lock back and forth. Right: two waiting threads. Each holds the lock only briefly, then waits without it, so the waits overlap.</figcaption></figure>
  <h3>Free-threaded Python (no GIL)</h3>
  <p>Since Python 3.13 there is a separate, optional build of CPython without the GIL, usually installed as <code>python3.13t</code> (PEP 703). In 3.13 it is labelled experimental; from 3.14 it is officially supported but still not the default. In that build, threads really can run Python code on several cores at once, so the route-planning threads above would speed up. The costs, stated honestly: single-threaded code runs somewhat slower in that build (noticeably in 3.13, less in 3.14), and C extension modules have to be built and marked for it; importing one that is not causes the GIL to be switched back on, with a warning. Races (next section) become <em>more</em> likely, not less. You can check which build you are on with <code>sys._is_gil_enabled()</code>; on the normal build used for this note it printed <code>True</code>, so we could not measure the free-threaded build here.</p>
  <div class="callout def"><span class="label">Definition</span><p>The <strong>GIL</strong> (Global Interpreter Lock) is a mutex in CPython that allows only one thread to execute Python bytecode at a time. It protects the interpreter's internal state, mainly reference counts. It is <strong>released</strong> during blocking I/O, <code>time.sleep</code> and many C-level operations; it is <strong>held</strong> during pure-Python computation (offered to other threads every <code>sys.getswitchinterval()</code> seconds). Consequence: threads speed up I/O-bound work, not CPU-bound pure-Python work. Other interpreters differ (PyPy has a GIL too; Jython and IronPython do not).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"The GIL makes my code thread-safe." No. It protects the interpreter's internals, not your logic. A thread can be switched out between any two bytecodes of <em>your</em> code, so updating your own shared variable can still go wrong. That is the next section.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Race Conditions.</b> So threads are for waiting. But all threads share memory, and a thread can be paused at almost any point. What happens when several threads update the same variable?</div>

  <h2 id="th-race"><span class="num">04</span>Race Conditions</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>QuickBite counts menu views in one global variable, and 4 threads each record 200,000 views. The answer should be 800,000. Is it?</p>
  </div>
  <h3>What "add 1" really is</h3>
  <p><code>views += 1</code> looks like one step. Python's <code>dis</code> module shows the bytecode, the small instructions the interpreter really runs:</p>
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
  <p>Four instructions do the work: <code>LOAD_GLOBAL</code> <strong>reads</strong> the current value of <code>views</code> onto a stack, <code>LOAD_CONST</code> pushes 1, <code>BINARY_OP (+=)</code> <strong>computes</strong> the sum, <code>STORE_GLOBAL</code> <strong>writes</strong> it back. (<code>RESUME</code> and <code>RETURN_CONST</code> are function housekeeping.) If the thread is switched out after the read but before the write, another thread can read the same old value.</p>
  <table class="tbl out"><caption>How one update gets lost (views starts at 5)</caption>
    <tr><th>Step</th><th>Thread 1</th><th>Thread 2</th><th>views in memory</th></tr>
    <tr><td>1</td><td>LOAD: reads 5</td><td></td><td>5</td></tr>
    <tr><td>2</td><td>(switched out)</td><td>LOAD: reads 5</td><td>5</td></tr>
    <tr><td>3</td><td></td><td>add, STORE: writes 6</td><td>6</td></tr>
    <tr><td>4</td><td>add, STORE: writes 6</td><td></td><td>6 (should be 7)</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 520 120" width="520">
    <text x="10" y="20">T1</text><text x="10" y="70">T2</text>
    <rect x="40" y="6" width="110" height="22" rx="4" class="fb sb"/><text x="48" y="22">read 5</text>
    <rect x="260" y="6" width="110" height="22" rx="4" class="fb sb"/><text x="268" y="22">write 6</text>
    <rect x="150" y="56" width="110" height="22" rx="4" class="ft st"/><text x="158" y="72">read 5, write 6</text>
    <text x="40" y="108" class="tr">two increments, views only +1 → one update lost</text>
  </svg><figcaption>The table as a timeline. T2 reads before T1 has written, so both write 6.</figcaption></figure>
  <h3>Seen for real</h3>
  <p>The code runs the counter two ways. <code>record_unsafe</code> does the read and the write with a function call in between (<code>views = plus_one(views)</code>), which is exactly what real code looks like (validate, log, then write). <code>record_bare</code> uses <code>views += 1</code>.</p>
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
  <div class="fx" data-lang="text">unsafe: 731173 / 800000
unsafe: 443088 / 800000
unsafe: 634560 / 800000
bare += : 800000 / 800000</div>
  <p>The unsafe version lost between about 70,000 and 360,000 updates, a <em>different</em> number every run. That is what makes races nasty: they may pass every test on your laptop and fail in production under load. The bare <code>+=</code> happened to give 800,000 on this Python 3.13 build. That is an implementation detail, not a guarantee: CPython only switches threads at certain points (such as function calls and loop jumps), and there is none between <code>LOAD_GLOBAL</code> and <code>STORE_GLOBAL</code> here. Other versions, the free-threaded build or slightly different code (like the function call) break it. Treat every read-modify-write of shared data as unsafe.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Two cashiers updating one paper tally. Both glance at it ("5"), both serve a customer, both cross it out and write "6". Two sales, one recorded. Nobody did anything wrong individually; the problem is the gap between reading and writing.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>race condition</strong> is a bug where the result depends on the timing of threads. The code that touches shared data is the <strong>critical section</strong>. An operation that cannot be interrupted halfway is <strong>atomic</strong>; <code>x += 1</code> on shared data is <em>not</em> atomic (read, compute, write).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"I ran it ten times and it was always right." Races depend on timing, which depends on machine load, Python version and the exact code. Absence of evidence is not evidence of absence; reason about the code, not the test runs.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Lock and RLock.</b> The bug is the gap between read and write. How do we make the whole read-add-write happen as one step that no other thread can interrupt?</div>

  <h2 id="th-lock"><span class="num">05</span>Lock and RLock</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How do we make sure that while one thread is between reading and writing <code>views</code>, no other thread can touch it?</p>
  </div>
  <p>A <strong>lock</strong> is a token only one thread can hold. <code>lock.acquire()</code> takes it (waiting if someone else has it); <code>lock.release()</code> gives it back. A lock is also a context manager (see <a class="xref" data-note="py_context">Context Managers</a>): <code>with lock:</code> acquires on entry and releases on exit, <em>even if the block raises</em>, so you can never forget the release.</p>
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
  <div class="fx" data-lang="text">with lock: 800000 / 800000 in 0.20s
lock is free again: True</div>
  <p>Exactly 800,000 this time, every time. With the lock, the read-add-write became one indivisible step: thread 2 waits at <code>with lock:</code> until thread 1 has written. <code>lock.locked()</code> confirms that after the threads finished the lock was free again, because every <code>with</code> released it. The price is that the critical section now runs one thread at a time, and every acquire/release costs a little, so keep locked blocks short.</p>
  <table class="tbl out"><caption>The same interleaving as section 04, with the lock</caption>
    <tr><th>Step</th><th>Thread 1</th><th>Thread 2</th><th>views</th></tr>
    <tr><td>1</td><td>acquires lock, reads 5</td><td></td><td>5</td></tr>
    <tr><td>2</td><td>(switched out, still holds lock)</td><td>tries to acquire: <strong>waits</strong></td><td>5</td></tr>
    <tr><td>3</td><td>writes 6, releases</td><td></td><td>6</td></tr>
    <tr><td>4</td><td></td><td>acquires, reads 6, writes 7, releases</td><td>7 ✓</td></tr>
  </table>
  <h3>RLock: when the same thread needs the lock twice</h3>
  <p>A plain <code>Lock</code> does not know who holds it. If the thread holding it asks again, it waits for itself, forever. This happens naturally when one locked method calls another. <code>DishTally.add_menu</code> takes the lock, then calls <code>add</code>, which takes it again. The code runs each version in a daemon thread and gives it 1 second.</p>
  <div class="fx" data-lang="py">import threading

class DishTally:
    def __init__(self, lock):
        self.total = 0
        self.lock = lock
    def add(self, n):
        with self.lock:
            self.total += n
    def add_menu(self, menu):
        with self.lock:                        # holds the lock ...
            self.add(menu["dishes"])           # ... and add() asks for it again

def try_it(lock):
    tally = DishTally(lock)
    t = threading.Thread(target=tally.add_menu, args=({"id": "R01", "dishes": 4},), daemon=True)
    t.start(); t.join(timeout=1)               # wait at most 1 s
    return "stuck forever (deadlocked itself)" if t.is_alive() else f"total = {tally.total}"

print("Lock :", try_it(threading.Lock()))
print("RLock:", try_it(threading.RLock()))</div>
  <div class="fx" data-lang="text">Lock : stuck forever (deadlocked itself)
RLock: total = 4</div>
  <p>With <code>Lock</code>, the thread was still alive after 1 second: it deadlocked on itself (because it is a daemon thread, the program could still exit). An <code>RLock</code> (re-entrant lock) remembers its owner and counts how many times that owner acquired it; the owner can enter again, and the lock is really free only after the same number of releases.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A lock is the single key to a storeroom: whoever has it goes in, everyone else queues at the door. An RLock is a key with your name on it: if you are already inside and need to open an inner door with the same key, you can.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Lock</strong> (mutex, "mutual exclusion"): at most one holder; any thread may release it; re-acquiring by the holder blocks. <strong>RLock</strong>: may be acquired repeatedly by the thread that holds it; must be released as many times. Both support <code>with</code>, <code>acquire(timeout=…)</code> (returns <code>False</code> if it gave up) and <code>acquire(blocking=False)</code>. When a whole function must run under a lock, the <code>with lock:</code> can be packaged as a decorator (a <code>@synchronized</code> wrapper; see <a class="xref" data-note="py_decorators">Closures &amp; Decorators</a>).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Holding a lock while doing slow work, such as <code>with lock: menu = fetch_menu(rid)</code>. Every other thread waits 0.2 s per request and your 20 threads become sequential again. Do the slow work outside, then lock only the shared update.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Deadlock.</b> An RLock fixed one thread waiting for itself. What happens when two threads each hold one lock and wait for the other's?</div>

  <h2 id="th-dead"><span class="num">06</span>Deadlock</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>QuickBite has two locks: one around the menus, one around the riders. One thread updates a menu and then a rider; another plans a rider and then reads a menu. Can that go wrong even though each lock is used correctly?</p>
  </div>
  <p>Thread A takes <code>menu_lock</code>, then wants <code>rider_lock</code>. At the same moment thread B takes <code>rider_lock</code>, then wants <code>menu_lock</code>. Each waits for the other to let go. Neither ever does. There is no error message: the program just hangs.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Two cars meet in the middle of a one-lane bridge, from opposite ends. Each driver waits for the other to reverse. Nobody does. The fix is a traffic rule everyone follows: always enter from the north side first (one fixed lock order).</p></div>
  <figure class="viz"><svg viewBox="0 0 440 130" width="440">
    <defs><marker id="th-ah1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="20" y="20" width="130" height="34" rx="6" class="fb sb"/><text x="30" y="42">menu-updater</text>
    <rect x="290" y="20" width="130" height="34" rx="6" class="ft st"/><text x="300" y="42">rider-planner</text>
    <rect x="20" y="86" width="130" height="30" rx="6" class="fs"/><text x="45" y="106">menu_lock</text>
    <rect x="290" y="86" width="130" height="30" rx="6" class="fs"/><text x="318" y="106">rider_lock</text>
    <line x1="85" y1="86" x2="85" y2="56" stroke="currentColor" stroke-width="2" marker-end="url(#th-ah1)"/><text x="92" y="76" class="tm">holds</text>
    <line x1="355" y1="86" x2="355" y2="56" stroke="currentColor" stroke-width="2" marker-end="url(#th-ah1)"/><text x="362" y="76" class="tm">holds</text>
    <line x1="150" y1="44" x2="288" y2="98" class="sr" stroke-width="2" stroke-dasharray="5 3" marker-end="url(#th-ah1)"/>
    <line x1="290" y1="44" x2="152" y2="98" class="sr" stroke-width="2" stroke-dasharray="5 3" marker-end="url(#th-ah1)"/>
    <text x="220" y="124" class="tr" text-anchor="middle">wants</text>
  </svg><figcaption>Solid arrows: each thread holds the lock below it. Dashed red arrows: each wants the lock the other holds. The circle can never break by itself.</figcaption></figure>
  <h3>Traced by hand</h3>
  <table class="tbl"><caption>Opposite lock orders</caption>
    <tr><th>Time</th><th>menu-updater</th><th>rider-planner</th></tr>
    <tr><td>0.0 s</td><td>takes <code>menu_lock</code>, sleeps 0.1 s</td><td>takes <code>rider_lock</code>, sleeps 0.1 s</td></tr>
    <tr><td>0.1 s</td><td>asks for <code>rider_lock</code>: held by planner → waits</td><td>asks for <code>menu_lock</code>: held by updater → waits</td></tr>
    <tr><td>1.1 s</td><td>timeout: gives up, releases <code>menu_lock</code></td><td>gets <code>menu_lock</code> → done</td></tr>
  </table>
  <p>The code builds exactly this, but uses <code>acquire(timeout=1)</code> instead of a plain <code>with</code>, so one thread gives up after a second instead of hanging the demo forever. Then it repeats with both threads taking the locks in the same order.</p>
  <div class="fx" data-lang="py">import threading, time
menu_lock, rider_lock = threading.Lock(), threading.Lock()

def worker(name, first, second):
    with first:
        time.sleep(0.1)                        # let the other thread grab its first lock
        if second.acquire(timeout=1):          # a plain 'with second:' would hang forever
            second.release(); print(name, "done")
        else:
            print(name, "gave up after 1 s: deadlock")

a = threading.Thread(target=worker, args=("menu-updater ", menu_lock, rider_lock))
b = threading.Thread(target=worker, args=("rider-planner", rider_lock, menu_lock))   # opposite order!
a.start(); b.start(); a.join(); b.join()

print("-- same order everywhere --")
a = threading.Thread(target=worker, args=("menu-updater ", menu_lock, rider_lock))
b = threading.Thread(target=worker, args=("rider-planner", menu_lock, rider_lock))   # same order
a.start(); b.start(); a.join(); b.join()</div>
  <div class="fx" data-lang="text">menu-updater  gave up after 1 s: deadlock
rider-planner done
-- same order everywhere --
menu-updater  done
rider-planner done</div>
  <p>First pair: the circle formed; after 1 s the updater's timeout fired, it gave up and released <code>menu_lock</code>, which let the planner finish. (On another run it may be the planner that gives up; timing decides.) Second pair: both take <code>menu_lock</code> first, so whoever gets it second simply waits its turn, and a circle cannot form.</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>deadlock</strong> is a state where each thread in a group waits for a resource held by another thread in the group, so none can proceed. It needs a <strong>circular wait</strong>; imposing one global order on lock acquisition makes a circle impossible.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Deadlock fixes, best first: one lock order everywhere → <code>acquire(timeout=…)</code> with a clear error → never hold a lock while doing slow I/O or calling unknown code → replace shared state with a <code>queue.Queue</code> so threads pass messages instead of sharing variables (section 08).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Semaphore and Event.</b> Locks answer "one at a time". Two other everyday needs are different: "at most 3 at a time" (the restaurant API's limit) and "wait until another thread says go".</div>

  <h2 id="th-signal"><span class="num">07</span>Semaphore and Event</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The restaurants' menu API allows only 3 requests at once; 20 simultaneous requests would get QuickBite blocked. And the route planner should not start until the menus are in. A lock does neither. What does?</p>
  </div>
  <h3>Semaphore: a lock with n keys</h3>
  <p>A <strong>semaphore</strong> holds a counter. <code>acquire</code> (or entering <code>with sem:</code>) decrements it, waiting while it is 0; <code>release</code> increments it. <code>Semaphore(3)</code> lets at most 3 threads inside at once. Below, 20 pool threads fetch the 20 menus, but the semaphore admits only 3 at a time; the code also records the peak number inside (protected by its own small lock, since <code>inside</code> is shared).</p>
  <div class="fx" data-lang="py">import threading, time
from concurrent.futures import ThreadPoolExecutor
from quickbite import RESTAURANTS, fetch_menu

api_slots = threading.Semaphore(3)             # the menu API allows 3 requests at once
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
  <p>By hand: 20 requests, 3 at a time → ⌈20 / 3⌉ = 7 rounds × 0.2 s = 1.4 s, and that is what we measured. The peak never exceeded 3. Still 100 dishes.</p>
  <h3>Event: "go" from one thread to others</h3>
  <p>An <strong>Event</strong> is a flag that starts as False. <code>wait()</code> blocks until it is True; <code>set()</code> makes it True and wakes every waiting thread. Here the planner waits for the fetcher to report that the first 5 menus are in.</p>
  <div class="fx" data-lang="py">import threading, time
from quickbite import RESTAURANTS, fetch_menu

menus_ready = threading.Event()                # a flag that starts False
menus = {}

def planner():
    print("planner: waiting for menus ...")
    menus_ready.wait()                         # sleeps until someone calls set()
    print(f"planner: go! {len(menus)} menus, {sum(m['dishes'] for m in menus.values())} dishes")

def fetcher():
    for rid in RESTAURANTS[:5]:
        menus[rid] = fetch_menu(rid)
    print("fetcher: first 5 menus in, setting the event")
    menus_ready.set()                          # wakes every waiting thread

p = threading.Thread(target=planner); f = threading.Thread(target=fetcher)
p.start(); time.sleep(0.05); f.start()
p.join(); f.join()
print("is_set:", menus_ready.is_set())</div>
  <div class="fx" data-lang="text">planner: waiting for menus ...
fetcher: first 5 menus in, setting the event
planner: go! 5 menus, 25 dishes
is_set: True</div>
  <p>The planner started first and printed "waiting", then slept inside <code>wait()</code> using no CPU. When the fetcher had 5 menus (4 + 5 + 6 + 7 + 3 = 25 dishes) it called <code>set()</code>, and the planner woke up immediately.</p>
  <table class="tbl"><caption>The synchronisation toolbox</caption>
    <tr><th>Primitive</th><th>What it does</th><th>QuickBite use</th></tr>
    <tr><td><code>Lock</code></td><td>one thread at a time</td><td>the shared views counter</td></tr>
    <tr><td><code>RLock</code></td><td>the holder may re-enter</td><td><code>add_menu</code> calling <code>add</code></td></tr>
    <tr><td><code>Semaphore(n)</code></td><td>at most n threads inside</td><td>API allows 3 requests at once</td></tr>
    <tr><td><code>Event</code></td><td><code>set()</code> / <code>wait()</code> flag</td><td>"menus ready, start planning"</td></tr>
    <tr><td><code>Condition</code></td><td>wait until notified, with a lock</td><td>hand-built producer–consumer (usually use a Queue instead)</td></tr>
    <tr><td><code>queue.Queue</code></td><td>thread-safe first-in-first-out line</td><td>next section</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>A semaphore is a car park with 3 spaces and a barrier: a car enters only when a space is free. An Event is the starter's pistol: runners stand still until it fires, then all go at once.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Semaphore(n)</strong>: a counter-based lock admitting up to n holders. (<code>BoundedSemaphore</code> additionally raises an error if released more often than acquired.) <strong>Event</strong>: a boolean flag with <code>set</code>, <code>clear</code>, <code>is_set</code> and a blocking <code>wait(timeout=None)</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Using <code>while not ready: pass</code> (a "busy wait") instead of an Event. It burns a full core doing nothing and, because it holds the GIL, slows down the thread it is waiting for.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Producer–Consumer.</b> Every tool so far protects shared variables. Can threads cooperate without sharing variables at all, just by handing each other work?</div>

  <h2 id="th-queue"><span class="num">08</span>Producer–Consumer with queue.Queue</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Locks are easy to forget and easy to deadlock. Is there a way for threads to pass results to each other where the safety is built in?</p>
  </div>
  <p><code>queue.Queue</code> is a first-in-first-out line that many threads can use at once: <code>put(item)</code> adds to the back, <code>get()</code> takes from the front and <em>waits</em> if the line is empty. All the locking is inside the queue. The classic pattern: <strong>producers</strong> put work or results in, <strong>consumers</strong> take them out. Here 5 fetcher threads take restaurant IDs from a <code>todo</code> queue and put menus on a <code>done</code> queue; one tallier thread is the only one that adds up dishes, so <code>total</code> needs no lock. To stop the fetchers we put one <code>None</code> per fetcher on <code>todo</code>: a "poison pill" that means "no more work, exit".</p>
  <div class="fx" data-lang="py">import threading, queue, time
from quickbite import RESTAURANTS, fetch_menu

todo, done = queue.Queue(), queue.Queue()      # thread-safe first-in-first-out lines
for rid in RESTAURANTS:
    todo.put(rid)

def fetcher():                                 # PRODUCER of menus
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
  <p>100 dishes, and not a single lock in our code. 5 fetchers → 4 rounds of 0.2 s = 0.8 s. Why it is safe: no variable is touched by two threads. <code>total</code> lives only in the tallier; menus travel through <code>done</code>; IDs through <code>todo</code>. The pills go in <em>after</em> the 20 IDs, so every fetcher finishes real work first, then meets exactly one <code>None</code> and exits.</p>
  <div class="flow"><span>todo: R01 … R20, None ×5</span><span>5 fetcher threads</span><span>done: 20 menus</span><span>1 tallier → 100</span></div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A restaurant pass: cooks put finished plates on the counter, waiters take them away. Cooks and waiters never touch each other's hands; the counter is the only meeting point, and it handles the order.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>queue.Queue</strong>: a thread-safe FIFO. <code>put</code>, <code>get</code> (blocking by default, optional <code>timeout</code>), <code>Queue(maxsize=n)</code> makes <code>put</code> wait when full (back-pressure), and <code>task_done()</code> + <code>join()</code> let a producer wait until every item has been processed. <code>LifoQueue</code> and <code>PriorityQueue</code> are variants.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Forgetting the poison pills (or sending fewer than there are consumers): the remaining threads wait in <code>get()</code> forever and <code>join()</code> never returns. One pill per consumer, after the real work.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: ThreadPoolExecutor.</b> Creating threads, slots, queues and pills by hand is a lot of code for "run this function on these inputs with 5 threads". Is there a ready-made version?</div>

  <h2 id="th-pool"><span class="num">09</span>ThreadPoolExecutor: the Everyday API</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How do we run <code>fetch_menu</code> over 20 restaurants with a fixed number of threads, collect the return values, and handle one restaurant failing, without writing any of the plumbing?</p>
  </div>
  <p><code>concurrent.futures.ThreadPoolExecutor</code> is the queue-plus-workers pattern of section 08, packaged. It keeps a fixed pool of worker threads and hands them jobs. Inside a <code>with</code> block, <code>ex.map(fn, items)</code> works like the built-in <code>map</code> but runs the calls in the pool; leaving the block waits for every job. Below, the same 20 menus with 1, 5 and 20 workers.</p>
  <div class="fx" data-lang="py">import time
from concurrent.futures import ThreadPoolExecutor
from quickbite import RESTAURANTS, fetch_menu

for workers in (1, 5, 20):
    t = time.perf_counter()
    with ThreadPoolExecutor(max_workers=workers) as ex:
        menus = list(ex.map(fetch_menu, RESTAURANTS))      # results in INPUT order
    print(f"max_workers={workers:2}: {sum(m['dishes'] for m in menus)} dishes, "
          f"first {menus[0]['id']}, last {menus[-1]['id']}, {time.perf_counter() - t:.2f}s")</div>
  <div class="fx" data-lang="text">max_workers= 1: 100 dishes, first R01, last R20, 4.01s
max_workers= 5: 100 dishes, first R01, last R20, 0.80s
max_workers=20: 100 dishes, first R01, last R20, 0.21s</div>
  <p>The formula from section 02 holds: 1 worker = 20 rounds = 4.0 s; 5 workers = 4 rounds = 0.8 s; 20 workers = 1 round = 0.2 s. <code>map</code> returns results in <strong>input</strong> order (first R01, last R20) whatever order they finished in, and return values come back for free, no shared slots needed.</p>
  <h3>submit, Futures and as_completed</h3>
  <p><code>ex.submit(fn, *args)</code> starts one job and immediately returns a <strong>Future</strong>: a receipt you can later exchange for the result (or the error). <code>as_completed(futures)</code> hands the receipts back in the order the jobs <strong>finish</strong>. Here three restaurants answer at different speeds and R13 fails.</p>
  <div class="fx" data-lang="py">import time
from concurrent.futures import ThreadPoolExecutor, as_completed

def fetch_menu_v2(rid, secs):                 # restaurants answer at different speeds
    time.sleep(secs)
    if rid == "R13":
        raise ConnectionError("R13 kitchen closed")
    return {"id": rid, "dishes": 3 + int(rid[1:]) % 5}

jobs = {"R01": 0.3, "R02": 0.1, "R13": 0.2}
with ThreadPoolExecutor(max_workers=3) as ex:
    futures = {ex.submit(fetch_menu_v2, rid, s): rid for rid, s in jobs.items()}
    print("submitted in this order:", list(futures.values()))
    for fut in as_completed(futures):          # yields futures as they FINISH
        try:
            print("got", fut.result())
        except ConnectionError as e:
            print(futures[fut], "failed:", e)</div>
  <div class="fx" data-lang="text">submitted in this order: ['R01', 'R02', 'R13']
got {'id': 'R02', 'dishes': 5}
R13 failed: R13 kitchen closed
got {'id': 'R01', 'dishes': 4}</div>
  <p>Submitted R01, R02, R13; finished R02 (0.1 s), R13 (0.2 s), R01 (0.3 s). <code>fut.result()</code> returns the value, or re-raises the exception that happened inside the worker thread, so the R13 failure was caught and handled on its own without losing the other two. The <code>futures</code> dict maps each receipt back to its restaurant for the error message.</p>
  <table class="tbl">
    <tr><th></th><th><code>ex.map(fn, items)</code></th><th><code>submit</code> + <code>as_completed</code></th></tr>
    <tr><td>Result order</td><td>input order</td><td>finish order</td></tr>
    <tr><td>An error</td><td>re-raised when you reach that result; later results are lost to that loop</td><td>handled per future with <code>try</code></td></tr>
    <tr><td>Use when</td><td>same function, uniform inputs, all must succeed</td><td>process fast results first, tolerate failures, different functions</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>A dry cleaner. You hand in three shirts and get three tickets (futures). <code>map</code> is collecting them in the order you handed them in; <code>as_completed</code> is collecting each as soon as the counter calls its number.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>ThreadPoolExecutor(max_workers=n)</strong>: a pool of n reusable threads. <strong>Future</strong>: an object representing a pending result; <code>result(timeout=None)</code>, <code>exception()</code>, <code>done()</code>, <code>cancel()</code>, <code>add_done_callback()</code>. The default <code>max_workers</code> is <code>min(32, os.cpu_count() + 4)</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Using <code>ThreadPoolExecutor</code> for CPU-bound work and expecting a speed-up: the GIL still applies. The same interface with processes is <code>ProcessPoolExecutor</code> (<a class="xref" data-note="py_multiprocessing">Processes</a>), which is exactly why the two share an API.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Thread-Safety Traps.</b> The pool hides the plumbing, but not the ways threads fail silently. What are they?</div>

  <h2 id="th-safe"><span class="num">10</span>Thread-Safety Traps</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Our code now uses locks and pools. Which failures still slip through without any obvious error?</p>
  </div>
  <h3>1. An exception in a plain Thread does not reach main</h3>
  <p>With a raw <code>Thread</code>, an exception inside the target is printed to stderr by <code>threading.excepthook</code>, the thread dies, and <code>join()</code> returns normally. Main carries on as if nothing happened:</p>
  <div class="fx" data-lang="py">import threading
from quickbite import fetch_menu

menus = {}
def worker(rid):
    if rid == "R13":
        raise ConnectionError("R13 kitchen closed")
    menus[rid] = fetch_menu(rid)

ts = [threading.Thread(target=worker, args=(r,)) for r in ("R12", "R13")]
for t in ts: t.start()
for t in ts: t.join()
print("main carries on, menus:", list(menus))</div>
  <div class="fx" data-lang="text">Exception in thread Thread-2 (worker):
Traceback (most recent call last):
  File "/usr/lib/python3.13/threading.py", line 1044, in _bootstrap_inner
    self.run()
    ~~~~~~~~^^
  File "/usr/lib/python3.13/threading.py", line 995, in run
    self._target(*self._args, **self._kwargs)
    ~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "blk_thread_exc.py", line 7, in worker
    raise ConnectionError("R13 kitchen closed")
ConnectionError: R13 kitchen closed
main carries on, menus: ['R12']</div>
  <p>The traceback was printed, but main continued with only R12's menu, and nothing in main's code knew R13 failed. Fixes: use a pool and call <code>future.result()</code> (which re-raises, section 09), or catch exceptions inside the target and record them.</p>
  <h3>2. Check-then-act</h3>
  <p>A menu cache: "if it is not cached, fetch it and store it". With threads, all four can pass the check before any of them stores:</p>
  <div class="fx" data-lang="py">import threading, time

calls = 0
cache = {}
def slow_fetch(rid):
    global calls
    calls += 1
    time.sleep(0.05)
    return {"id": rid}

def get_menu(rid):                             # check ... then act
    if rid not in cache:
        cache[rid] = slow_fetch(rid)
    return cache[rid]

ts = [threading.Thread(target=get_menu, args=("R07",)) for _ in range(4)]
for t in ts: t.start()
for t in ts: t.join()
print("no lock  : slow_fetch called", calls, "times for one restaurant")

calls = 0; cache.clear(); lock = threading.Lock()
def get_menu_safe(rid):
    with lock:                                 # check and act as one step
        if rid not in cache:
            cache[rid] = slow_fetch(rid)
        return cache[rid]
ts = [threading.Thread(target=get_menu_safe, args=("R07",)) for _ in range(4)]
for t in ts: t.start()
for t in ts: t.join()
print("with lock: slow_fetch called", calls, "time")</div>
  <div class="fx" data-lang="text">no lock  : slow_fetch called 4 times for one restaurant
with lock: slow_fetch called 1 time</div>
  <p>Four calls to the slow fetch for one restaurant, because the gap between <code>if rid not in cache</code> and <code>cache[rid] = …</code> is a 0.05 s request. Holding a lock across check and act makes it one step: one call. (A single <code>dict</code> or <code>list</code> operation like <code>d[k] = v</code> or <code>lst.append(x)</code> is safe in CPython; a <em>sequence</em> of them is not.)</p>
  <h3>3. More traps worth knowing</h3>
  <ul>
    <li><strong>Threads cannot be killed.</strong> There is no <code>thread.stop()</code>. Give long-running threads a stop <code>Event</code> they check, or make them daemons.</li>
    <li><strong>Non-thread-safe objects.</strong> Some libraries' clients, connections and generators must not be used from two threads at once (a generator raises <code>ValueError: generator already executing</code>). Give each thread its own (<code>threading.local()</code>) or protect it with a lock.</li>
    <li><strong>Too many threads.</strong> Thousands of threads waste memory and scheduling time; use a pool, or asyncio.</li>
    <li><strong>Mutable defaults and globals shared by accident.</strong> Anything at module level is shared by every thread.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span><p>Four cooks each check the fridge, see no stock, and each go to the market for the same ingredient. One note on the fridge door ("I'm going", the lock) would have saved three trips.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>Code is <strong>thread-safe</strong> if it behaves correctly when called from several threads at once, whatever the interleaving. The usual techniques: no shared mutable state (each thread its own data, combine at the end), immutable data, queues, or locks around every compound operation on shared state.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Assuming a test suite will catch races. They appear under load and timing you rarely reproduce. Review every piece of state two threads can reach and ask "what if a switch happens here?", and stress-test with many threads and repetitions (testing and debugging tools are in <a class="xref" data-note="py_testing">Testing &amp; Debugging</a>).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> We have many tools. How do they fit together, and which question does each answer on QuickBite?</div>

  <h2 id="th-connect"><span class="num">11</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Are threads, the GIL, races, locks, semaphores, events, queues and pools separate topics, or one story?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 280" width="680">
    <defs><marker id="th-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="250" y="8" width="180" height="40" rx="6" class="fb sb"/><text x="340" y="26" text-anchor="middle" font-size="12">thread</text><text x="340" y="41" text-anchor="middle" class="tm" font-size="10">start / join, shared memory</text>
    <line x1="290" y1="48" x2="140" y2="86" stroke="currentColor" marker-end="url(#th-a9)"/>
    <line x1="340" y1="48" x2="340" y2="86" stroke="currentColor" marker-end="url(#th-a9)"/>
    <line x1="390" y1="48" x2="540" y2="86" stroke="currentColor" marker-end="url(#th-a9)"/>
    <rect x="50" y="88" width="180" height="40" rx="6" class="fg sg"/><text x="140" y="106" text-anchor="middle" font-size="12">I/O overlaps</text><text x="140" y="121" text-anchor="middle" class="tm" font-size="10">GIL released: menus 0.2 s</text>
    <rect x="250" y="88" width="180" height="40" rx="6" class="fr sr"/><text x="340" y="106" text-anchor="middle" font-size="12">GIL</text><text x="340" y="121" text-anchor="middle" class="tm" font-size="10">CPU work: no speed-up</text>
    <rect x="450" y="88" width="180" height="40" rx="6" class="fr sr"/><text x="540" y="106" text-anchor="middle" font-size="12">race conditions</text><text x="540" y="121" text-anchor="middle" class="tm" font-size="10">lost updates</text>
    <line x1="340" y1="128" x2="340" y2="250" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#th-a9)"/>
    <line x1="500" y1="128" x2="420" y2="170" stroke="currentColor" marker-end="url(#th-a9)"/>
    <line x1="540" y1="128" x2="540" y2="170" stroke="currentColor" marker-end="url(#th-a9)"/>
    <rect x="360" y="172" width="120" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="420" y="190" text-anchor="middle" font-size="12">Lock / RLock</text><text x="420" y="205" text-anchor="middle" class="tm" font-size="10">→ deadlock risk</text>
    <rect x="490" y="172" width="180" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="580" y="190" text-anchor="middle" font-size="12">Semaphore · Event · Queue</text><text x="580" y="205" text-anchor="middle" class="tm" font-size="10">limits, signals, hand-off</text>
    <line x1="140" y1="128" x2="140" y2="170" stroke="currentColor" marker-end="url(#th-a9)"/>
    <line x1="580" y1="212" x2="240" y2="190" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#th-a9)"/>
    <rect x="50" y="172" width="190" height="40" rx="6" class="ft st"/><text x="145" y="190" text-anchor="middle" font-size="12">ThreadPoolExecutor</text><text x="145" y="205" text-anchor="middle" class="tm" font-size="10">queue + workers, packaged</text>
    <rect x="250" y="252" width="200" height="24" rx="6" class="fv"/><text x="350" y="269" text-anchor="middle" font-size="11">→ Processes (own GIL each)</text>
  </svg><figcaption>A thread has three consequences. Waiting threads release the GIL, so I/O overlaps (green), which the thread pool packages. Computing threads are held back by the GIL, which leads to the next note (Processes). Shared memory allows races, fixed by locks (which can deadlock) or by the higher-level tools, whose Queue is what the pool is built on.</figcaption></figure>
  <table class="tbl"><caption>Every concept on QuickBite</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>On the running example</th><th>When to use</th></tr>
    <tr><td>Thread</td><td>OS thread in one process</td><td>can request 2 start while 1 waits?</td><td>R01 + R02: 0.4 s not 0.6 s</td><td>I/O-bound work</td></tr>
    <tr><td>Many threads</td><td>start all, then join all</td><td>can all 20 waits overlap?</td><td>100 dishes, 4.00 → 0.20 s</td><td>tens of waits</td></tr>
    <tr><td>GIL</td><td>one interpreter lock (refcounts)</td><td>why no gain on routes?</td><td>1.39 s vs 1.70 s with 4 threads</td><td>know it; use processes for CPU</td></tr>
    <tr><td>Race condition</td><td>shared data + read-modify-write</td><td>why is the count wrong?</td><td>800,000 → ≈ 440k–730k</td><td>(a bug to prevent)</td></tr>
    <tr><td>Lock</td><td>one-holder token, <code>with lock:</code></td><td>how to make read-add-write atomic?</td><td>exactly 800,000</td><td>compound updates of shared data</td></tr>
    <tr><td>RLock</td><td>lock + owner + count</td><td>same thread needs the lock twice?</td><td>Lock stuck, RLock total = 4</td><td>locked methods calling each other</td></tr>
    <tr><td>Deadlock</td><td>two locks, opposite order</td><td>why does it hang?</td><td>updater gave up after 1 s</td><td>(prevent: one lock order)</td></tr>
    <tr><td>Semaphore</td><td>counter lock</td><td>at most n at once?</td><td>peak 3, 7 rounds ≈ 1.4 s</td><td>rate/connection limits</td></tr>
    <tr><td>Event</td><td>shared flag + wait</td><td>wait for a signal?</td><td>planner waits for 5 menus (25 dishes)</td><td>"ready", "stop"</td></tr>
    <tr><td>Queue</td><td>FIFO with internal locks</td><td>hand-off without shared variables?</td><td>5 fetchers + tallier: 100, 0.8 s</td><td>pipelines, workers</td></tr>
    <tr><td>ThreadPoolExecutor</td><td>queue + worker threads + futures</td><td>no plumbing?</td><td>1 → 4.0 s, 5 → 0.8 s, 20 → 0.2 s</td><td>the default for I/O work</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p><strong>A thread buys concurrency for waiting work, because waiting releases the GIL; it cannot buy parallelism for Python calculation, because computing holds the GIL; and because threads share memory, every shared update needs a lock or, better, a queue, which is exactly what a thread pool is built from.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The traps of this note in one place, with their symptoms.</div>

  <h2 id="th-traps"><span class="num">12</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>When threaded code misbehaves, which symptom points to which mistake?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: threads for CPU-bound Python</span><p>4 threads plan routes as slowly as 1 (1.39 s vs 1.70 s). Use processes, or vectorise with numpy.</p></div>
  <div class="callout trap"><span class="label">Trap: <code>target=f()</code> instead of <code>target=f</code></span><p>The function runs immediately in the main thread; the thread does nothing.</p></div>
  <div class="callout trap"><span class="label">Trap: start and join in the same loop</span><p><code>for t in ts: t.start(); t.join()</code> runs the threads one after another. Start all, then join all.</p></div>
  <div class="callout trap"><span class="label">Trap: shared data without a lock</span><p><code>views = views + 1</code>, <code>d[k] = d.get(k, 0) + 1</code>, <code>if k not in cache: cache[k] = …</code> from several threads lose updates or duplicate work. Lock the compound operation, or give each thread its own data and combine at the end.</p></div>
  <div class="callout trap"><span class="label">Trap: slow work inside the lock</span><p>Holding a lock during a request serialises all threads. Lock only the shared update.</p></div>
  <div class="callout trap"><span class="label">Trap: locks taken in different orders / plain Lock re-acquired</span><p>The program hangs with no error. One global lock order, timeouts, <code>RLock</code> for re-entry, queues instead of locks.</p></div>
  <div class="callout trap"><span class="label">Trap: exceptions lost in threads</span><p>Raw threads print the traceback and die; main never knows. Use a pool and <code>future.result()</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: missing poison pills</span><p>Consumers wait forever in <code>queue.get()</code>. One <code>None</code> per consumer.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="py_multiprocessing">Processes</a>.</b> Threads cannot plan QuickBite's routes faster because of the GIL. Processes have one GIL each. How do we use them, and what do they cost?</div>

  <h2 id="th-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The note on one page. Running example: <code>fetch_menu</code> waits 0.2 s (20 restaurants, 100 dishes); <code>route_cost</code> tries every order of 9 stops (4 riders: 40, 36, 35, 36).</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>Answer in one line</th></tr>
    <tr><td>Thread</td><td>send request 2 while 1 waits?</td><td><code>Thread(target=f, args=(…,))</code>, <code>start()</code>, <code>join()</code>; 0.6 → 0.4 s</td></tr>
    <tr><td>20 threads</td><td>all waits at once?</td><td>start all, then join all: 4.00 → 0.20 s</td></tr>
    <tr><td>GIL</td><td>why no gain on routes?</td><td>one thread runs bytecode at a time; released on I/O, held while computing</td></tr>
    <tr><td>Race</td><td>why is the count wrong?</td><td>read-modify-write interleaves: 800,000 → 440,000–730,000</td></tr>
    <tr><td>Lock / RLock</td><td>make it atomic?</td><td><code>with lock:</code>; RLock lets the holder re-enter</td></tr>
    <tr><td>Deadlock</td><td>why does it hang?</td><td>circular wait; fix with one lock order or timeouts</td></tr>
    <tr><td>Semaphore / Event</td><td>limit n, or signal?</td><td><code>Semaphore(3)</code>: 7 rounds ≈ 1.4 s; <code>Event.set()</code> / <code>wait()</code></td></tr>
    <tr><td>Queue</td><td>hand-off without sharing?</td><td>producers <code>put</code>, consumers <code>get</code>, <code>None</code> pills</td></tr>
    <tr><td>ThreadPoolExecutor</td><td>no plumbing?</td><td><code>map</code> input order; <code>submit</code> + <code>as_completed</code> finish order</td></tr>
    <tr><td>Traps</td><td>silent failures?</td><td>lost exceptions, check-then-act, no kill, GIL ≠ safety</td></tr>
  </table>
  <h3>Definitions and formulas</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td>Thread</td><td>a line of execution inside a process; shares memory, own stack</td></tr>
    <tr><td>GIL</td><td>CPython mutex: one thread executes Python bytecode at a time; protects reference counts; switch interval 0.005 s</td></tr>
    <tr><td>I/O time with n threads</td><td>≈ ⌈tasks / n⌉ × wait. 20 tasks × 0.2 s: n = 1 → 4.0 s, 5 → 0.8 s, 20 → 0.2 s, semaphore 3 → 1.4 s</td></tr>
    <tr><td>Race condition</td><td>result depends on thread timing; critical section = code touching shared state</td></tr>
    <tr><td>Atomic</td><td>cannot be interrupted halfway; <code>x += 1</code> is LOAD, BINARY_OP, STORE: not atomic</td></tr>
    <tr><td>Deadlock</td><td>each thread waits for a lock another holds, in a circle</td></tr>
    <tr><td>Future</td><td>receipt for a pending result; <code>result()</code> returns it or re-raises</td></tr>
    <tr><td>Free-threaded build</td><td><code>python3.13t</code> (experimental) / 3.14t (supported, opt-in): no GIL; slower single thread; extensions must support it</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Use threads</b><p>Waiting work with ordinary blocking libraries: APIs, files, databases, S3; tens to hundreds of tasks; via <code>ThreadPoolExecutor</code>.</p><small>menus 4.0 → 0.2 s</small></div>
    <div><b>Do not use threads</b><p>Pure-Python calculation (the GIL), or tens of thousands of connections (use asyncio).</p><small>routes: no gain</small></div>
    <div><b>Sharing data</b><p>Prefer no sharing → queues → locks, in that order. Keep locked blocks short; one lock order.</p><small>800,000 only with a lock</small></div>
    <div><b>Errors</b><p>Collect results through futures so exceptions re-raise in the caller.</p><small>raw threads lose them</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p><code>target=f()</code>; start and join in one loop; unlocked read-modify-write or check-then-act; slow work inside a lock; opposite lock orders; plain Lock re-acquired; missing poison pills; exceptions swallowed by raw threads; believing the GIL makes code thread-safe.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>20 requests of 0.2 s with <code>max_workers=5</code>?</td><td>4 rounds ≈ 0.8 s</td></tr>
    <tr><td>Which three bytecode steps make <code>views += 1</code> unsafe?</td><td>LOAD_GLOBAL (read), BINARY_OP (add), STORE_GLOBAL (write)</td></tr>
    <tr><td>What does the GIL protect?</td><td>the interpreter's internals, mainly reference counts, not your data</td></tr>
    <tr><td>Thread holds a plain Lock and calls a method that takes it again. Result?</td><td>it waits for itself forever; use RLock</td></tr>
    <tr><td><code>map</code> vs <code>as_completed</code> order?</td><td>input order vs finish order</td></tr>
  </table>

  <h2 id="th-qa"><span class="num">13</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the GIL and when does it matter?</summary><div class="qa-body">A CPython lock that lets one thread execute Python bytecode at a time; it protects reference counting. It matters for CPU-bound pure-Python threads (no speed-up: routes 1.39 s alone vs 1.70 s with 4 threads). It barely matters for I/O-bound threads (released while waiting: menus 4.0 → 0.2 s) or numpy-heavy code (C code releases it).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a race condition and how do you prevent it?</summary><div class="qa-body">A bug whose result depends on thread timing: two threads read 5, both write 6, one increment lost. Prevent it with a lock around the whole read-modify-write (<code>with lock:</code> releases even on exceptions), or avoid sharing: each thread keeps its own data and results flow through a <code>queue.Queue</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is <code>counter += 1</code> atomic in Python?</summary><div class="qa-body">No. <code>dis</code> shows LOAD, BINARY_OP, STORE. On some CPython versions a bare <code>+=</code> in a tight loop happens to give the right total because thread switches only occur at certain instructions, but that is an implementation detail; any call between read and write, another version, or the free-threaded build loses updates.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Lock vs RLock?</summary><div class="qa-body">A Lock has no owner; if the holder acquires it again it blocks forever. An RLock records its owning thread and a count, so the owner can re-enter (e.g. a locked method calling another locked method) and must release as many times as it acquired.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a deadlock and how do you prevent it?</summary><div class="qa-body">A circular wait: A holds L1 and wants L2 while B holds L2 and wants L1. Prevent it with a single global lock order, <code>acquire(timeout=…)</code>, not holding locks during slow work, or queues instead of shared state.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Semaphore vs Lock?</summary><div class="qa-body">A lock admits one thread; a <code>Semaphore(n)</code> admits up to n. Use a semaphore to respect a limit such as "at most 3 concurrent API requests" (20 requests → 7 rounds ≈ 1.4 s).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>executor.map</code> vs <code>submit</code> + <code>as_completed</code>?</summary><div class="qa-body"><code>map</code> returns results in input order and re-raises the first exception when you reach it. <code>submit</code> returns Futures; <code>as_completed</code> yields them as they finish, so you can handle fast results first and each failure separately.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does a thread pool not need locks for results, when raw threads did?</summary><div class="qa-body">Each job's return value travels back through its own Future (built on a queue and a condition internally), so no two threads write the same variable. With raw threads we had to give each thread its own list slot or a lock.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the GIL not protect your own counter?</summary><div class="qa-body">The GIL guarantees that a single bytecode instruction is not interleaved with another thread's, not that a sequence of instructions (read, add, write) runs together. A switch between your LOAD and your STORE is allowed, and that is exactly where updates are lost.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you hold the lock during the 0.2 s fetch?</summary><div class="qa-body">The lock serialises the requests: only one thread can be waiting on the network at a time, so 20 threads take 20 × 0.2 = 4 s, exactly the sequential time. The whole point of threads (overlapping waits) is lost. Fetch outside the lock, then lock only the update.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does this note lead to Processes and to asyncio?</summary><div class="qa-body">The GIL stops threads from computing in parallel, so CPU work needs separate processes with their own GILs. And threads cost memory and need locks for shared data; asyncio overlaps waits on a single thread with no OS switching, so shared data is only changed at <code>await</code> points, and it falls back on a thread pool (<code>asyncio.to_thread</code>) for blocking code.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is free-threaded Python, and should you use it?</summary><div class="qa-body">An optional CPython build without the GIL (PEP 703): experimental as <code>python3.13t</code>, officially supported from 3.14 but not the default. Threads can then compute in parallel. Costs: somewhat slower single-threaded code, and every C extension must support it (otherwise the GIL is re-enabled). Races become more likely. Worth testing for CPU-heavy threaded code whose dependencies support it; processes remain the portable answer today.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your threaded downloader sometimes returns fewer files than expected and never shows an error. Where do you look?</summary><div class="qa-body">At exceptions inside raw threads (printed to stderr and swallowed: switch to a pool and call <code>result()</code>), at shared lists or dicts updated with compound operations without a lock, and at check-then-act logic around a shared cache or "seen" set.</div></details>
</main>
`
});
