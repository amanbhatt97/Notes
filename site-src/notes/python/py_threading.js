// notes/python/py_threading.js — Threads & the GIL
Object.assign(TOPIC_CONTENT, {
  "py_threading": `<main>
<h1>Threads &amp; the GIL</h1>
  <div class="where"><span>Python</span><span>Advanced Python</span><span>Concurrency</span><span>Threads &amp; the GIL</span></div>
  <p class="lead">A thread is a second worker inside your program that can make progress while the first one is stuck waiting. Threads are Python's simplest way to stop wasting time on waiting: twenty network requests that take 4 seconds one after another can finish in about 0.2 seconds when twenty threads wait for them together. They come with two catches that every Python developer must understand. Because of the Global Interpreter Lock (GIL), threads do not make pure-Python calculations faster; and because threads share memory, two threads updating the same data can silently corrupt it, which is what locks, semaphores, events and queues exist to prevent. This page builds all of that up step by step using the same food-delivery app as <a class="xref" data-note="py_concurrency">Concurrency vs Parallelism</a>: fetching menus from 20 restaurants (a waiting job) and planning routes for 4 riders (a computing job). In real work you meet threads in parallel downloads from APIs and cloud storage, database calls with ordinary drivers, and background loading in data pipelines. The code was run on CPython 3.13 (standard build, GIL enabled) on a 4-core machine; timings vary from run to run and are approximate.</p>

  <h2 id="th-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Threads &amp; the GIL</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Threads</div>
        <ul>
          <li>Extra workers inside one process, sharing its memory</li>
          <li><code>Thread(target=f, args=(x,))</code> → <code>start()</code> → <code>join()</code></li>
          <li>Great for waiting: time ≈ ⌈tasks ÷ threads⌉ × one wait</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The GIL</div>
        <ul>
          <li>One thread runs Python code at a time</li>
          <li>Released while waiting; held while computing</li>
          <li>So no speed-up for pure-Python calculation</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Sharing safely</div>
        <ul>
          <li><b>Race condition</b>: <code>x += 1</code> is read, add, write</li>
          <li><code>Lock</code> / <code>RLock</code>: one thread at a time</li>
          <li><b>Deadlock</b>: threads waiting for each other in a circle</li>
          <li><code>Semaphore(n)</code>, <code>Event</code>, <code>queue.Queue</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">In practice</div>
        <ul>
          <li><code>ThreadPoolExecutor</code>: <code>map</code> and <code>submit</code></li>
          <li><code>future.result()</code> re-raises the thread's error</li>
          <li>Hand data over with queues instead of sharing it</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="th-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Threads Exist</span><span class="rm-sub">a program that spends its time waiting</span></div></div>
      <div class="rm-item rm-done" data-target="th-start"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Starting Threads: start() and join()</span><span class="rm-sub">two requests waiting side by side</span></div></div>
      <div class="rm-item rm-done" data-target="th-many"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Many Threads for Many Waits</span><span class="rm-sub">20 waits in the time of one</span></div></div>
      <div class="rm-item rm-done" data-target="th-gil"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The GIL</span><span class="rm-sub">why computing threads take turns</span></div></div>
      <div class="rm-item rm-done" data-target="th-race"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Race Conditions</span><span class="rm-sub">how shared data loses updates</span></div></div>
      <div class="rm-item rm-done" data-target="th-lock"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Locks: Lock and RLock</span><span class="rm-sub">one thread at a time</span></div></div>
      <div class="rm-item rm-done" data-target="th-dead"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Deadlock</span><span class="rm-sub">threads waiting for each other forever</span></div></div>
      <div class="rm-item rm-done" data-target="th-signal"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Semaphore and Event</span><span class="rm-sub">"at most n" and "wait for my signal"</span></div></div>
      <div class="rm-item rm-done" data-target="th-queue"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Producer–Consumer with queue.Queue</span><span class="rm-sub">hand data over instead of sharing it</span></div></div>
      <div class="rm-item rm-done" data-target="th-pool"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">ThreadPoolExecutor and Futures</span><span class="rm-sub">how threads are used in real code</span></div></div>
      <div class="rm-item rm-done" data-target="th-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">target=f(), lost errors, check-then-act</span></div></div>
      <div class="rm-item rm-done" data-target="th-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">API, GIL rules, primitives</span></div></div>
      <div class="rm-item rm-done" data-target="th-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">GIL, races, locks, pools</span></div></div>
    </div>
  </div>

  <h2 id="th-why"><span class="num">01</span>Why Threads Exist</h2>
  <p>Every Python program starts with exactly one <strong>thread</strong>: one sequence of instructions being carried out, one statement after another. It is called the <strong>main thread</strong>. As long as there is only one thread, the program can only ever be doing one thing, and if that thing is waiting, the whole program waits.</p>
  <p>Our food-delivery app needs the menus of 20 restaurants. Each restaurant's server takes 0.2 seconds to reply. Here is the helper module used throughout this page (the same one used on the other concurrency pages). <code>fetch_menu</code> simulates the network request with <code>time.sleep(0.2)</code>, which from the program's point of view is exactly like waiting for a reply: the program stops and does nothing until the time is up. <code>route_cost</code> is a real calculation that finds a rider's shortest route by trying all 362,880 orders of 9 drop-off points; we will need it when we meet the GIL.</p>
  <div class="fx" data-lang="py">"""workload.py: the food-delivery app's two slow jobs."""
import asyncio, itertools, time

RESTAURANTS = [f"R{i:02d}" for i in range(1, 21)]   # 20 restaurant IDs: R01 ... R20
LATENCY = 0.2                                      # each restaurant's server takes 0.2 s to reply

def fetch_menu(rid):
    """Waiting job: ask one restaurant for its menu (simulated with sleep)."""
    time.sleep(LATENCY)                            # the program just waits here
    return {"id": rid, "dishes": 3 + int(rid[1:]) % 5}

async def fetch_menu_async(rid):
    """The same request written for asyncio (used on the asyncio page)."""
    await asyncio.sleep(LATENCY)
    return {"id": rid, "dishes": 3 + int(rid[1:]) % 5}

def route_cost(stops, depot=(0, 0)):
    """Computing job: try every order of the stops, return the shortest distance."""
    best = None
    for order in itertools.permutations(stops):    # 9 stops -&gt; 362,880 orders to try
        cost, here = 0, depot
        for x, y in order:
            cost += abs(here[0] - x) + abs(here[1] - y)
            here = (x, y)
        if best is None or cost &lt; best:
            best = cost
    return best

# 4 riders, each with 9 drop-off points on a city grid
RIDERS = [[((s * 7 + i * 5) % 11, (s * 3 + i * 7) % 13) for i in range(9)] for s in range(1, 5)]

if __name__ == "__main__":
    t = time.perf_counter()
    print(fetch_menu("R01"), f"in {time.perf_counter() - t:.2f}s")
    t = time.perf_counter()
    print("rider 1 best route:", route_cost(RIDERS[0]), f"in {time.perf_counter() - t:.2f}s")</div>
  <div class="fx" data-lang="text">{'id': 'R01', 'dishes': 4} in 0.20s
rider 1 best route: 40 in 0.34s</div>
  <p>Now let us fetch all twenty menus the obvious way, one after another:</p>
  <div class="fx" data-lang="py">import time
from workload import RESTAURANTS, fetch_menu

t = time.perf_counter()
menus = [fetch_menu(r) for r in RESTAURANTS]          # one request at a time
print(f"one at a time: {sum(m['dishes'] for m in menus)} dishes in {time.perf_counter() - t:.2f}s")</div>
  <div class="fx" data-lang="text">one at a time: 100 dishes in 4.00s</div>
  <p>Four seconds, and the computer was idle for almost all of it, because each request spent nearly its whole 0.2 seconds waiting for a reply. This is like a waiter who takes one table's order, walks it to the kitchen, and then stands at the kitchen door until that dish is ready before even looking at the next table. Nothing about the waiter is slow; the waiting is the problem.</p>
  <p>A thread is the fix. A process (a running program, with its own memory) can contain several threads, and each thread is an independent worker that runs its own sequence of instructions. All threads in a process share the same memory, so they can all see the same variables, but each has its own record of which function it is in and its own local variables. The operating system's <strong>scheduler</strong> decides which thread runs at each moment, and, crucially, when one thread is blocked waiting for the network or the disk, the scheduler simply runs another one. So if each of the twenty requests has its own thread, all twenty can be waiting at the same time. In the restaurant, it is like having twenty waiters who can each stand at the kitchen door for one table: the waits happen side by side instead of one after another.</p>

  <h2 id="th-start"><span class="num">02</span>Starting Threads: start() and join()</h2>
  <p>The <code>threading</code> module needs just three calls to run a function in a new thread. <code>threading.Thread(target=worker, args=("R01", 0.2))</code> creates a thread object that <em>will</em> run <code>worker("R01", 0.2)</code>. Notice that you pass the function itself, without brackets, and its arguments separately as a tuple (a single argument is written <code>args=("R01",)</code> with a trailing comma). Calling <code>.start()</code> tells the operating system to begin running that thread, and it returns immediately, without waiting for the function to finish. Calling <code>.join()</code> does the opposite: it makes the calling thread stop and wait until that thread has finished.</p>
  <p>To see exactly what happens and when, the program below starts two threads that each fetch one menu. Thread A's request is made 0.2 seconds slower than thread B's, so we can tell them apart. Every line is printed with the time since the start and the name of the thread that printed it. One more detail: a thread throws away its function's return value, so each worker stores its result in a dictionary that all threads share.</p>
  <div class="fx" data-lang="py">import sys, threading, time
from workload import fetch_menu

T0 = time.perf_counter()
def log(msg):                                  # one write per line, so lines never mix
    sys.stdout.write(f"{time.perf_counter() - T0:.1f}s  [{threading.current_thread().name:&lt;10}] {msg}\\n")

results = {}                                   # the threads share this dict with the main thread
def worker(rid, extra):
    log(f"{rid} request sent")
    time.sleep(extra)                          # make A's request 0.2 s slower than B's
    results[rid] = fetch_menu(rid)             # a thread throws away return values, so store it
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
  <p>Read the output as a timeline. At 0.0 s, both threads sent their requests, and the main thread had already reported "both started", because <code>start()</code> does not wait. <code>threading.active_count()</code> said 3, counting the main thread plus A and B. The main thread then called <code>a.join()</code> and went to sleep until A finished. At 0.2 s, B's reply arrived and B stored its menu and ended. At 0.4 s, A's reply arrived; A ended, so <code>a.join()</code> returned, and <code>b.join()</code> returned straight away because B had already finished. The dictionary lists R02 first simply because B stored its result first.</p>
  <table class="tbl"><caption>The same run as a timeline</caption>
    <tr><th>Time</th><th>MainThread</th><th>thread-A (0.4 s of waiting)</th><th>thread-B (0.2 s)</th></tr>
    <tr><td>0.0 s</td><td>starts A and B, prints, waits in <code>a.join()</code></td><td>sends, waits</td><td>sends, waits</td></tr>
    <tr><td>0.2 s</td><td>still waiting</td><td>still waiting</td><td>stores its result, <strong>ends</strong></td></tr>
    <tr><td>0.4 s</td><td><code>a.join()</code> and <code>b.join()</code> return</td><td>stores its result, <strong>ends</strong></td><td></td></tr>
  </table>
  <p>The total was 0.4 seconds, not 0.4 + 0.2 = 0.6 seconds, because B's entire request happened while A was waiting. If you run the program several times, the first three lines may appear in a different order, because the operating system decides which thread runs when, and you cannot control that. (Each line is written with a single <code>sys.stdout.write</code> call; with <code>print</code>, the text and the newline are written separately, and lines from two threads can get mixed together.)</p>
  <p>Two more facts complete the picture. A thread created with <code>daemon=True</code> is a <strong>daemon thread</strong>: Python will exit without waiting for it, which suits background helpers whose sudden end does no harm. And you can also create a thread by subclassing <code>Thread</code> and overriding its <code>run()</code> method, but passing <code>target</code> is far more common.</p>

  <h2 id="th-many"><span class="num">03</span>Many Threads for Many Waits</h2>
  <p>Two threads saved 0.2 seconds. The real payoff comes when there are many requests, each spending most of its time waiting. The pattern is: create one thread per request, give each thread its own slot in a results list so that no two threads ever write to the same place, start all the threads, and then join all of them.</p>
  <div class="fx" data-lang="py">import threading, time
from workload import RESTAURANTS, fetch_menu

menus = [None] * len(RESTAURANTS)              # one slot per request
def worker(i, rid):
    menus[i] = fetch_menu(rid)                 # each thread writes only its own slot

t = time.perf_counter()
threads = [threading.Thread(target=worker, args=(i, r)) for i, r in enumerate(RESTAURANTS)]
for th in threads: th.start()                  # start ALL of them first ...
for th in threads: th.join()                   # ... then wait for all of them
print(f"20 threads: {sum(m['dishes'] for m in menus)} dishes in {time.perf_counter() - t:.2f}s")</div>
  <div class="fx" data-lang="text">20 threads: 100 dishes in 0.20s</div>
  <p>The same 100 dishes as the sequential version, but in about 0.2 seconds instead of 4: all twenty waits happened at the same time. Pay attention to the two separate loops at the end. It is tempting to write <code>th.start(); th.join()</code> in a single loop, but that starts a thread and immediately waits for it to finish before starting the next one, which puts you straight back at 4 seconds.</p>
  <figure class="viz"><svg viewBox="0 0 560 130" width="560">
    <text x="10" y="18" class="tm">20 threads (4 shown): each sends, then waits; the waits overlap</text>
    <text x="10" y="42">T1</text><rect x="60" y="32" width="4" height="12" class="fb sb"/><rect x="64" y="32" width="200" height="12" class="fs"/>
    <text x="10" y="60">T2</text><rect x="62" y="50" width="4" height="12" class="fb sb"/><rect x="66" y="50" width="200" height="12" class="fs"/>
    <text x="10" y="78">T3</text><rect x="64" y="68" width="4" height="12" class="fb sb"/><rect x="68" y="68" width="200" height="12" class="fs"/>
    <text x="10" y="96">…</text>
    <text x="10" y="114">T20</text><rect x="68" y="104" width="4" height="12" class="fb sb"/><rect x="72" y="104" width="200" height="12" class="fs"/>
    <text x="290" y="72" class="tg">all done after ≈ one wait (0.2 s)</text>
    <text x="290" y="90" class="tm">one at a time: 20 waits end to end = 4.0 s</text>
  </svg><figcaption>Each row is one thread: a tiny piece of work (blue) to send the request, then a long wait (grey). The waits run side by side, so the whole job ends after roughly one wait.</figcaption></figure>
  <p>The figure shows why this works so well. Each thread needs the CPU for only a sliver of time, to build the request and to read the reply. The rest is waiting, and waiting needs no CPU at all, so one core can look after all twenty threads. This gives a handy rule for waiting jobs: with <em>n</em> threads, the time is roughly <strong>⌈tasks ÷ n⌉ × the time of one wait</strong>, where ⌈ ⌉ means "round up". Twenty tasks with twenty threads is one round, about 0.2 seconds; twenty tasks with five threads would be four rounds, about 0.8 seconds.</p>
  <p>One thread per task does not scale forever, though. Each thread is an operating-system object with its own memory for its stack of function calls, and the operating system must keep track of all of them, so ten thousand threads is too many. For large numbers of tasks you use a <em>pool</em> with a fixed number of threads (section 10), or asyncio, which can handle thousands of waits on a single thread (<a class="xref" data-note="py_asyncio">asyncio</a>).</p>

  <h2 id="th-gil"><span class="num">04</span>The GIL</h2>
  <p>If threads worked so well for waiting, surely four threads can also do four calculations at once on a 4-core machine? Let us try it with the route-planning job, computing the four riders' routes first one at a time and then in four threads:</p>
  <div class="fx" data-lang="py">import threading, time
from workload import RIDERS, route_cost

t = time.perf_counter()
costs = [route_cost(s) for s in RIDERS]
print(f"one at a time: {costs} in {time.perf_counter() - t:.2f}s")

costs = [None] * 4
def worker(i):
    costs[i] = route_cost(RIDERS[i])
t = time.perf_counter()
threads = [threading.Thread(target=worker, args=(i,)) for i in range(4)]
for th in threads: th.start()
for th in threads: th.join()
print(f"4 threads:     {costs} in {time.perf_counter() - t:.2f}s")</div>
  <div class="fx" data-lang="text">one at a time: [40, 36, 35, 36] in 0.97s
4 threads:     [40, 36, 35, 36] in 1.06s</div>
  <p>The answers are identical, and the time is not better at all; often it is slightly worse. Four threads on four cores did the work no faster than one. The reason is the <strong>Global Interpreter Lock</strong>, or <strong>GIL</strong>.</p>
  <p>A <strong>lock</strong> is an object that only one thread can hold at a time; any other thread that wants it has to wait until it is released. The standard Python interpreter, CPython, has one special lock, the GIL, and its rule is that a thread must hold the GIL in order to run Python code. There is one GIL per process, so only one thread in a process can be running Python code at any moment, however many cores the machine has. Imagine a kitchen with one recipe book, where nobody may cook without reading from it. Four cooks can be in the kitchen, but only the one holding the book is actually cooking. A cook who is just waiting for the oven can put the book down for someone else, but a cook who is busy chopping keeps hold of it.</p>
  <p>Why build such a restriction into the language? It comes from how CPython manages memory. Every object keeps a <strong>reference count</strong>: a number saying how many names, list slots and other places currently refer to it. When the count reaches zero, nothing can use the object any more, and CPython frees its memory. You can see the counter for yourself:</p>
  <div class="fx" data-lang="py">import sys
menu = {"id": "R01", "dishes": 4}
print("references to menu:", sys.getrefcount(menu))    # +1 for getrefcount's own argument
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
  <p><code>sys.getrefcount</code> always reports one extra reference for its own argument, so the starting value 2 means "the name <code>menu</code>, plus the function call". Creating <code>alias</code> raised it to 3, and deleting <code>alias</code> brought it back to 2. These counters change on almost every assignment, function call and list operation. Now imagine two threads changing the same counter at the same moment: both read 2, both write 3, and the count ends up one too low. Later it could reach zero while something is still using the object, which would crash the interpreter. Rather than putting a lock on every single object, which would be slow and could cause threads to block each other, CPython puts one lock around the whole interpreter. That keeps single-threaded code fast and makes C extensions simpler to write, at the cost of running only one thread's Python code at a time.</p>
  <p>The GIL is not held all the time, though, and that is what makes threads useful. A thread releases the GIL whenever it makes a blocking I/O call, such as a network request, a file read, a database query or <code>time.sleep</code>, and it takes it back when the call returns. That is why twenty waiting threads overlapped perfectly in section 03: while they wait, none of them needs the GIL. Many C libraries also release it while doing heavy work that does not touch Python objects, including most of numpy, pandas and PyTorch, <code>hashlib</code> and <code>zlib</code>. A thread computing in pure Python, on the other hand, keeps the GIL. To stop it hogging the interpreter forever, CPython asks it to let go every <strong>switch interval</strong>, which the output above shows is 0.005 seconds, so that another thread can have a turn. Computing threads therefore take turns rather than run together.</p>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
    <text x="10" y="18" class="tm">Computing: threads take turns</text>
    <text x="10" y="45">T1</text><text x="10" y="75">T2</text>
    <rect x="40" y="33" width="50" height="16" class="fb sb"/><rect x="90" y="33" width="50" height="16" fill="none" stroke="currentColor" opacity="0.4"/>
    <rect x="140" y="33" width="50" height="16" class="fb sb"/><rect x="190" y="33" width="50" height="16" fill="none" stroke="currentColor" opacity="0.4"/>
    <rect x="40" y="63" width="50" height="16" fill="none" stroke="currentColor" opacity="0.4"/><rect x="90" y="63" width="50" height="16" class="ft st"/>
    <rect x="140" y="63" width="50" height="16" fill="none" stroke="currentColor" opacity="0.4"/><rect x="190" y="63" width="50" height="16" class="ft st"/>
    <text x="40" y="105" class="tr">total = T1 + T2 → no speed-up</text>
    <text x="300" y="18" class="tm">Waiting: wait without the GIL</text>
    <text x="300" y="45">T1</text><text x="300" y="75">T2</text>
    <rect x="330" y="33" width="25" height="16" class="fb sb"/><rect x="355" y="33" width="150" height="16" class="fs"/>
    <rect x="355" y="63" width="25" height="16" class="ft st"/><rect x="380" y="63" width="150" height="16" class="fs"/>
    <text x="330" y="105" class="tg">T2 runs while T1 waits → overlap</text>
    <rect x="40" y="122" width="12" height="12" class="fb sb"/><text x="58" y="132" class="tm">holds GIL</text>
    <rect x="140" y="122" width="12" height="12" fill="none" stroke="currentColor" opacity="0.4"/><text x="158" y="132" class="tm">wants GIL</text>
    <rect x="320" y="122" width="12" height="12" class="fs"/><text x="338" y="132" class="tm">waiting (GIL free)</text>
  </svg><figcaption>Left: two computing threads. Only one holds the GIL; the other waits for it, then they swap, so the total time is the sum of both. Right: two waiting threads. Each holds the GIL only briefly to send its request, then waits without it, so the waits overlap.</figcaption></figure>
  <p>The practical rule follows: <strong>threads speed up waiting, not pure-Python computing</strong>. For computing, use separate processes, each with its own interpreter and its own GIL (<a class="xref" data-note="py_multiprocessing">Processes</a>), or move the work into numpy.</p>
  <p>This is slowly changing. Since Python 3.13 there is an optional second build of CPython without the GIL, defined by PEP 703 and called the <strong>free-threaded</strong> build, usually installed as <code>python3.13t</code>. It was experimental in 3.13 and is officially supported, but still not the default, from 3.14. On it, computing threads like the ones above really do run on several cores. The costs are that single-threaded code is somewhat slower, C extensions must be rebuilt and declare that they support it (importing one that has not switches the GIL back on), and the data-sharing bugs in the next section become more likely, not less. <code>sys._is_gil_enabled()</code> tells you which mode you are in; it printed <code>True</code> above, so everything on this page was measured with the GIL.</p>
  <p>Finally, a warning that leads straight into the next section: the GIL protects the interpreter's own internals, not <em>your</em> data. It does not make your code safe to run from several threads.</p>

  <h2 id="th-race"><span class="num">05</span>Race Conditions</h2>
  <p>Threads share memory, and the operating system can switch from one thread to another at almost any moment. Put those two facts together and you get a new kind of bug. Suppose the app counts how many times menus are viewed, and several threads add to the same counter. The line <code>views += 1</code> looks like a single step, but Python's <code>dis</code> module, which shows the low-level instructions (called <strong>bytecode</strong>) that the interpreter actually runs, reveals that it is not:</p>
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
  <p>There are three separate steps. <code>LOAD_GLOBAL</code> <strong>reads</strong> the current value of <code>views</code>; <code>BINARY_OP</code> <strong>computes</strong> the new value; <code>STORE_GLOBAL</code> <strong>writes</strong> it back. If the operating system switches threads after one thread has read the value but before it has written the new one, another thread can read the same old value. Here is how an update gets lost, step by step:</p>
  <table class="tbl"><caption>How one update is lost (views starts at 5)</caption>
    <tr><th>Step</th><th>Thread 1</th><th>Thread 2</th><th>views in memory</th></tr>
    <tr><td>1</td><td>reads 5</td><td></td><td>5</td></tr>
    <tr><td>2</td><td>(switched out)</td><td>reads 5</td><td>5</td></tr>
    <tr><td>3</td><td></td><td>adds 1, writes 6</td><td>6</td></tr>
    <tr><td>4</td><td>adds 1, writes 6</td><td></td><td>6 (should be 7)</td></tr>
  </table>
  <p>It is like two shop assistants updating the same stock sheet. Both look at the sheet and see 5 boxes, both sell one, and both write down 4. One sale has vanished. Neither assistant made a mistake on their own; the problem is that their read-then-write steps overlapped.</p>
  <p>This kind of bug is called a <strong>race condition</strong>: a bug whose result depends on the exact timing of threads, as if they were racing each other. To reproduce it reliably, the code below puts a small function call between the read and the write, which is what real code often looks like (read a value, check or log it, then write it). Four threads each record 200,000 views, so the correct total is 800,000. The test runs four times:</p>
  <div class="fx" data-lang="py">import threading

views = 0
def plus_one(x):                               # any extra step between reading and writing
    return x + 1

def record_views(n):
    global views
    for _ in range(n):
        views = plus_one(views)                # READ views ... call ... WRITE views

def run(n=200_000, k=4):
    global views
    views = 0
    ts = [threading.Thread(target=record_views, args=(n,)) for _ in range(k)]
    for t in ts: t.start()
    for t in ts: t.join()
    return views

for _ in range(4):
    print("4 threads x 200,000 views:", run(), "/ 800000")</div>
  <div class="fx" data-lang="text">4 threads x 200,000 views: 709219 / 800000
4 threads x 200,000 views: 800000 / 800000
4 threads x 200,000 views: 695056 / 800000
4 threads x 200,000 views: 574421 / 800000</div>
  <p>Look at how the totals differ. Some runs lose tens of thousands of updates, by a different amount each time, while others come out exactly right purely by luck. That is what makes race conditions so dangerous: the code can pass every test and still be wrong, then fail in production under a different load. You might also find that a bare <code>views += 1</code> in a tight loop happens to give the right total on some CPython versions. That is only because this interpreter happens not to switch threads at that exact point; it is an implementation detail, not a promise, and it breaks on other versions, on the free-threaded build, or as soon as any function call is added. Treat every read-modify-write of shared data as unsafe.</p>
  <p>Some vocabulary is useful here. A piece of code that touches shared data and must not be interleaved with other threads is called a <strong>critical section</strong>. An operation is <strong>atomic</strong> if no other thread can ever see it half-finished. In CPython, a single built-in operation such as <code>my_list.append(x)</code> or <code>my_dict[key] = value</code> is effectively atomic, but any sequence of steps, such as read-add-write, is not. Making a sequence behave as if it were atomic is the job of a lock.</p>

  <h2 id="th-lock"><span class="num">06</span>Locks: Lock and RLock</h2>
  <p>A <strong>lock</strong>, also called a <strong>mutex</strong> (short for mutual exclusion), ensures that only one thread at a time can be inside a critical section. Think of a single-occupancy bathroom with a key on a hook: to go in you take the key, and anyone else who arrives has to wait until you come out and hang it back up. In Python, <code>lock.acquire()</code> takes the key, waiting if another thread has it, and <code>lock.release()</code> gives it back. In practice you almost always write <code>with lock:</code>, which acquires the lock at the start of the block and releases it at the end, even if the block raises an exception. (The <code>with</code> statement is explained in <a class="xref" data-note="py_context">Context Managers</a>.) Here is the race from the previous section with a lock around the read-modify-write:</p>
  <div class="fx" data-lang="py">import threading, time

views = 0
lock = threading.Lock()
def plus_one(x):
    return x + 1

def record_views(n):
    global views
    for _ in range(n):
        with lock:                             # only one thread at a time gets past here
            views = plus_one(views)

ts = [threading.Thread(target=record_views, args=(200_000,)) for _ in range(4)]
t = time.perf_counter()
for th in ts: th.start()
for th in ts: th.join()
print(f"with a lock: {views} / 800000 in {time.perf_counter() - t:.2f}s")
print("lock is free again:", not lock.locked())</div>
  <div class="fx" data-lang="text">with a lock: 800000 / 800000 in 0.11s
lock is free again: True</div>
  <p>Exactly 800,000, every run. While one thread is between reading and writing <code>views</code>, every other thread is waiting at <code>with lock:</code>, so from their point of view the read, add and write happen as one indivisible step. The price is that the locked code runs one thread at a time and each acquire and release costs a little, so locked sections should be kept as short as possible. In particular, never do slow work such as a network request while holding a lock: every other thread would queue behind it, and twenty threads would become sequential again. Do the slow work first, then lock only the shared update.</p>
  <p>A plain <code>Lock</code> has one surprising property: it does not remember which thread holds it. If the thread that holds it tries to acquire it again, it simply waits, for itself, forever. That happens quite naturally when one method that takes a lock calls another method that takes the same lock. The demo below runs each version in a daemon thread and gives it one second, so that the stuck version does not hang the whole program:</p>
  <div class="fx" data-lang="py">import threading

class Tally:
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
    tally = Tally(lock)
    t = threading.Thread(target=tally.add_menu, args=({"id": "R01", "dishes": 4},), daemon=True)
    t.start(); t.join(timeout=1)               # give it at most 1 s
    return "stuck forever (waiting for itself)" if t.is_alive() else f"total = {tally.total}"

print("Lock :", try_it(threading.Lock()))
print("RLock:", try_it(threading.RLock()))</div>
  <div class="fx" data-lang="text">Lock : stuck forever (waiting for itself)
RLock: total = 4</div>
  <p>With a plain <code>Lock</code>, the thread was still alive after one second: <code>add_menu</code> held the lock, called <code>add</code>, and <code>add</code> waited for a lock that would never be released. This is a <strong>self-deadlock</strong>. An <code>RLock</code>, or <strong>re-entrant lock</strong>, solves it by remembering which thread owns it and how many times that thread has acquired it. The owner may acquire it again without waiting, and the lock is only really released after the same number of releases. Use <code>RLock</code> when locked methods call each other; use a plain <code>Lock</code> otherwise, because it is slightly faster and its stricter behaviour catches design mistakes.</p>
  <p>Both kinds of lock also support <code>acquire(timeout=1)</code>, which gives up after the given number of seconds and returns <code>False</code>, and <code>acquire(blocking=False)</code>, which returns immediately. A <code>with lock:</code> wrapped around a whole function can be packaged as a decorator (<a class="xref" data-note="py_decorators">Closures &amp; Decorators</a>).</p>

  <h2 id="th-dead"><span class="num">07</span>Deadlock</h2>
  <p>Locks solve races but bring a new danger. Suppose thread 1 holds lock A and needs lock B, while thread 2 holds lock B and needs lock A. Each waits for the other to let go, and neither ever will. This is a <strong>deadlock</strong>: a group of threads each waiting for something another member of the group holds, in a circle that can never break. Picture two cars meeting on a single-lane bridge from opposite ends; each is waiting for the other to reverse. The program does not crash or raise an error; it just stops making progress and hangs.</p>
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
  </svg><figcaption>Solid arrows: each thread holds the lock below it. Dashed arrows: each wants the lock the other holds. The circle cannot break by itself.</figcaption></figure>
  <p>The code below builds exactly this situation. Each worker takes its first lock, pauses briefly so the other worker has time to take its first lock too, and then tries for its second. To stop the demo hanging forever, the second lock is requested with a one-second timeout. The first pair of workers takes the locks in opposite orders; the second pair takes them in the same order.</p>
  <div class="fx" data-lang="py">import threading, time
lock_a, lock_b = threading.Lock(), threading.Lock()

def worker(name, first, second):
    with first:
        time.sleep(0.1)                        # give the other thread time to grab its first lock
        if second.acquire(timeout=1):          # a plain 'with second:' would wait forever
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
  <p>In the first pair, the circle formed: worker-1 held <code>lock_a</code> and wanted <code>lock_b</code>, worker-2 held <code>lock_b</code> and wanted <code>lock_a</code>. After one second worker-1's timeout fired, it gave up and released <code>lock_a</code>, which finally let worker-2 finish. (On another run the two roles may be swapped.) In the second pair, both workers take <code>lock_a</code> first, so whichever arrives second simply waits for the first to finish completely, and no circle can ever form.</p>
  <p>That gives the main rule for preventing deadlocks: <strong>every thread acquires locks in the same order</strong>. Other good habits are not holding a lock while doing slow work or calling code you do not control, using <code>acquire(timeout=…)</code> so a deadlock becomes a clear error rather than a silent hang, and, best of all, avoiding shared data altogether by passing work through queues (section 09). If a threaded program does hang, you can print every thread's current position with <code>faulthandler.dump_traceback_later</code> or the external tool <code>py-spy dump --pid</code>, and look for threads stuck in <code>acquire</code>.</p>

  <h2 id="th-signal"><span class="num">08</span>Semaphore and Event</h2>
  <p>A lock answers the question "may I go in? only if nobody else is in there". Two other questions come up all the time in threaded programs: "may I go in? only if fewer than <em>n</em> others are in there", and "may I continue? only once another thread tells me to". The <code>threading</code> module has a tool for each.</p>
  <p>Many real APIs limit how many requests one client may have in flight at once, and a database connection pool has only so many connections. A <strong>semaphore</strong> enforces a limit like that. It holds a counter that starts at <em>n</em>: acquiring it (by entering <code>with sem:</code>) decreases the counter, waiting first if it is already 0, and releasing it increases the counter again. A good picture is a car park with a sign showing free spaces: cars may enter while the number is above zero, and when it reaches zero, the next car waits at the barrier until someone leaves. Below, 20 threads each want to fetch a menu, but the restaurant API allows only 3 requests at a time. The code also tracks the peak number of threads inside; that count is itself shared data, so it gets its own small lock.</p>
  <div class="fx" data-lang="py">import threading, time
from workload import RESTAURANTS, fetch_menu

api_slots = threading.Semaphore(3)             # the restaurant API allows 3 requests at once
inside = peak = 0
count_lock = threading.Lock()

def polite_fetch(rid):
    global inside, peak
    with api_slots:                            # wait here while 3 are already inside
        with count_lock:
            inside += 1; peak = max(peak, inside)
        menu = fetch_menu(rid)
        with count_lock:
            inside -= 1
    return menu

t = time.perf_counter()
threads = [threading.Thread(target=polite_fetch, args=(r,)) for r in RESTAURANTS]
for th in threads: th.start()
for th in threads: th.join()
print(f"20 threads, Semaphore(3): peak inside = {peak}, {time.perf_counter() - t:.2f}s")</div>
  <div class="fx" data-lang="text">20 threads, Semaphore(3): peak inside = 3, 1.41s</div>
  <p>The peak never went above 3, and the time matches the rule from section 03: 20 requests in groups of 3 is ⌈20 ÷ 3⌉ = 7 rounds of 0.2 seconds, about 1.4 seconds. The semaphore traded some speed for staying within the API's limit. (<code>BoundedSemaphore</code> works the same way but raises an error if it is released more times than it was acquired, which catches bugs.)</p>
  <p>The second need is a signal. An <strong>Event</strong> is a flag that starts as false. Any thread can call <code>event.wait()</code>, which sleeps until the flag becomes true; any thread can call <code>event.set()</code>, which makes it true and wakes every waiting thread at once. It works like a starting pistol: the runners stand still on the line until it fires, and then all of them go. Here a reporter thread waits until a fetcher thread has collected the first five menus:</p>
  <div class="fx" data-lang="py">import threading, time
from workload import RESTAURANTS, fetch_menu

data_ready = threading.Event()                 # a flag that starts as False
menus = {}

def reporter():
    print("reporter: waiting for data ...")
    data_ready.wait()                          # sleeps until someone calls set()
    print(f"reporter: go! {len(menus)} menus, {sum(m['dishes'] for m in menus.values())} dishes")

def fetcher():
    for rid in RESTAURANTS[:5]:
        menus[rid] = fetch_menu(rid)
    print("fetcher: first 5 menus in, setting the event")
    data_ready.set()                           # wakes every waiting thread

r = threading.Thread(target=reporter); f = threading.Thread(target=fetcher)
r.start(); time.sleep(0.05); f.start()
r.join(); f.join()
print("is_set:", data_ready.is_set())</div>
  <div class="fx" data-lang="text">reporter: waiting for data ...
fetcher: first 5 menus in, setting the event
reporter: go! 5 menus, 25 dishes
is_set: True</div>
  <p>The reporter started first and went to sleep inside <code>wait()</code>, using no CPU at all. As soon as the fetcher called <code>set()</code>, the reporter woke up and found the five menus ready. A very common use of an Event is a stop signal: a long-running background thread loops on <code>while not stop.is_set():</code>, and the main thread calls <code>stop.set()</code> when it is time to shut down cleanly. This matters because Python has no way to forcibly kill a thread from outside. The wrong way to wait for a signal is a <strong>busy wait</strong>, <code>while not ready: pass</code>, which spins a CPU core at full speed doing nothing useful, and, because it keeps grabbing the GIL, even slows down the thread it is waiting for.</p>
  <table class="tbl"><caption>The synchronisation tools in <code>threading</code></caption>
    <tr><th>Tool</th><th>What it does</th><th>Typical use</th></tr>
    <tr><td><code>Lock</code></td><td>one holder at a time</td><td>protect an update to a shared counter or dict</td></tr>
    <tr><td><code>RLock</code></td><td>the holder may acquire it again</td><td>locked methods that call each other</td></tr>
    <tr><td><code>Semaphore(n)</code></td><td>at most n holders</td><td>API limits, connection pools</td></tr>
    <tr><td><code>Event</code></td><td>a flag: <code>set()</code>, <code>clear()</code>, <code>wait()</code></td><td>"ready" and "stop" signals</td></tr>
    <tr><td><code>Condition</code></td><td>wait until another thread calls <code>notify()</code></td><td>custom coordination (a Queue is usually simpler)</td></tr>
    <tr><td><code>Barrier(n)</code></td><td>n threads wait until all have arrived</td><td>work done in phases</td></tr>
    <tr><td><code>queue.Queue</code></td><td>a thread-safe line of items</td><td>handing work between threads (next section)</td></tr>
  </table>

  <h2 id="th-queue"><span class="num">09</span>Producer–Consumer with queue.Queue</h2>
  <p>Locks work, but they are easy to forget and easy to get into deadlocks with. Often the cleanest design is to avoid sharing variables between threads at all, and to <em>hand data over</em> instead. The tool for that is <code>queue.Queue</code>, a line of items that is safe to use from any number of threads. <code>put(item)</code> adds an item to the back of the line, and <code>get()</code> takes one from the front, waiting if the line is empty. All the locking happens inside the queue, so your code needs none. Think of the ticket rail in a restaurant kitchen: waiters clip order tickets onto the rail, cooks take tickets off the other end, and nobody needs to talk to anybody else directly.</p>
  <p>This arrangement is called the <strong>producer–consumer</strong> pattern: some threads produce items, others consume them, and a queue sits between. Below, 5 fetcher threads take restaurant IDs from a <code>todo</code> queue and put the menus they fetch on a <code>done</code> queue. A single tallier thread takes menus off <code>done</code> and adds up the dishes; because it is the only thread that ever touches <code>total</code>, no lock is needed. To tell each fetcher when to stop, the main thread puts one <code>None</code> per fetcher on the <code>todo</code> queue after the real work. A special value like this that means "stop" is called a <strong>poison pill</strong>.</p>
  <div class="fx" data-lang="py">import threading, queue, time
from workload import RESTAURANTS, fetch_menu

todo, done = queue.Queue(), queue.Queue()      # thread-safe first-in, first-out queues
for rid in RESTAURANTS:
    todo.put(rid)

def fetcher():                                 # PRODUCER: turns IDs into menus
    while True:
        rid = todo.get()                       # waits if the queue is empty
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
for _ in workers: todo.put(None)               # one pill per fetcher, after the real work
for w in workers: w.join()
tally.join()
print(f"5 fetchers + 1 tallier: {time.perf_counter() - t:.2f}s")</div>
  <div class="fx" data-lang="text">tallier: total dishes = 100
5 fetchers + 1 tallier: 0.80s</div>
  <p>The total is correct, there is no lock anywhere in our code, and with 5 fetchers the twenty requests took 4 rounds of 0.2 seconds, about 0.8 seconds, as the rule predicts. Notice that no variable is touched by two threads: IDs travel through <code>todo</code>, menus travel through <code>done</code>, and <code>total</code> lives inside the tallier. Because the pills were queued after all twenty IDs, every fetcher does real work first and then meets exactly one <code>None</code>. If you put fewer pills than consumers, the leftover consumers wait in <code>get()</code> forever and <code>join()</code> never returns.</p>
  <div class="flow"><span>todo: 20 IDs, then None ×5</span><span>5 fetcher threads</span><span>done: 20 menus</span><span>1 tallier → 100</span></div>
  <p>A few more features are worth knowing. <code>Queue(maxsize=n)</code> makes <code>put</code> wait when the queue is full, which stops a fast producer from racing ahead of slow consumers and filling memory (this is called <strong>back-pressure</strong>). <code>task_done()</code> and <code>join()</code> let a producer wait until every item has been processed. And there are variants: <code>LifoQueue</code> (last in, first out), <code>PriorityQueue</code> (smallest item first) and the simpler <code>SimpleQueue</code>. The general idea, share data by passing it along rather than by letting several threads change the same variables, is called <strong>message passing</strong>, and it is one of the best ways to avoid race conditions.</p>

  <h2 id="th-pool"><span class="num">10</span>ThreadPoolExecutor and Futures</h2>
  <p>The producer–consumer pattern, a fixed team of worker threads taking jobs from a queue, is so useful that the standard library packages it ready-made as <code>concurrent.futures.ThreadPoolExecutor</code>. It keeps a <strong>pool</strong> of reusable threads and an internal job queue, and it also solves two problems that raw threads leave to you: getting return values back, and finding out when a job failed. In real application code, this is how threads are normally used. Inside a <code>with</code> block, <code>ex.map(fn, items)</code> works like the built-in <code>map</code> but runs the calls in the pool's threads; leaving the block waits for all the jobs and shuts the pool down.</p>
  <div class="fx" data-lang="py">import time
from concurrent.futures import ThreadPoolExecutor
from workload import RESTAURANTS, fetch_menu

for workers in (1, 5, 20):
    t = time.perf_counter()
    with ThreadPoolExecutor(max_workers=workers) as ex:
        menus = list(ex.map(fetch_menu, RESTAURANTS))      # results come back in INPUT order
    print(f"max_workers={workers:2}: {sum(m['dishes'] for m in menus)} dishes, "
          f"first {menus[0]['id']}, last {menus[-1]['id']}, {time.perf_counter() - t:.2f}s")</div>
  <div class="fx" data-lang="text">max_workers= 1: 100 dishes, first R01, last R20, 4.01s
max_workers= 5: 100 dishes, first R01, last R20, 0.80s
max_workers=20: 100 dishes, first R01, last R20, 0.20s</div>
  <p>The timing rule holds again: 1 worker means 20 rounds (about 4 seconds), 5 workers means 4 rounds (about 0.8 seconds), and 20 workers means 1 round (about 0.2 seconds). <code>map</code> also returns results in the same order as the inputs (first R01, last R20), whatever order the requests actually finished in, and the return values come straight back to us with no shared slots to manage.</p>
  <p>For more control there is <code>ex.submit(fn, *args)</code>, which schedules a single call and immediately returns a <strong>Future</strong>: an object that stands for a result that does not exist yet, like the numbered receipt you get when you order at a takeaway counter. Later you exchange it for the real result with <code>future.result()</code>, which waits if necessary and either returns the value or raises the exception the job raised. The companion function <code>as_completed(futures)</code> hands futures back in the order they <em>finish</em>. Below, three requests take different times and one of them fails:</p>
  <div class="fx" data-lang="py">import time
from concurrent.futures import ThreadPoolExecutor, as_completed

def fetch_v2(rid, secs):                       # requests take different times; one fails
    time.sleep(secs)
    if rid == "R13":
        raise ConnectionError("R13 unavailable")
    return {"id": rid, "dishes": 3 + int(rid[1:]) % 5}

jobs = {"R01": 0.3, "R02": 0.1, "R13": 0.2}
with ThreadPoolExecutor(max_workers=3) as ex:
    futures = {ex.submit(fetch_v2, rid, s): rid for rid, s in jobs.items()}
    print("submitted in this order:", list(futures.values()))
    for fut in as_completed(futures):          # hands back futures as they FINISH
        try:
            print("got", fut.result())
        except ConnectionError as e:
            print(futures[fut], "failed:", e)</div>
  <div class="fx" data-lang="text">submitted in this order: ['R01', 'R02', 'R13']
got {'id': 'R02', 'dishes': 5}
R13 failed: R13 unavailable
got {'id': 'R01', 'dishes': 4}</div>
  <p>The requests were submitted as R01, R02, R13 but finished as R02 (0.1 s), R13 (0.2 s) and R01 (0.3 s), and <code>as_completed</code> handed them over in that finishing order. When <code>fut.result()</code> was called for R13, the <code>ConnectionError</code> raised inside the worker thread was raised again in our code, so we could catch it and carry on with the other results. The dictionary maps each future back to its restaurant ID, which is what lets the error message name the failed request.</p>
  <table class="tbl">
    <tr><th></th><th><code>ex.map(fn, items)</code></th><th><code>submit</code> + <code>as_completed</code></th></tr>
    <tr><td>Result order</td><td>input order</td><td>finish order</td></tr>
    <tr><td>When a job fails</td><td>its exception is raised when you reach that result, ending your loop</td><td>handled per future with its own <code>try</code></td></tr>
    <tr><td>Use when</td><td>one function, similar inputs, all must succeed</td><td>you want results as they arrive, or must tolerate failures</td></tr>
  </table>
  <p>If you do not choose <code>max_workers</code>, the pool uses <code>min(32, os.cpu_count() + 4)</code> threads. For waiting jobs, choose enough threads to cover the waits you want to overlap, limited by what the remote service and your memory allow. A thread pool still has the GIL, so it will not speed up pure-Python computing; the same interface backed by processes, <code>ProcessPoolExecutor</code>, does that (<a class="xref" data-note="py_multiprocessing">Processes</a>).</p>

  <h2 id="th-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>A very common beginner mistake is writing brackets after the target function: <code>Thread(target=worker(r))</code> instead of <code>Thread(target=worker, args=(r,))</code>. The brackets <em>call</em> <code>worker</code> immediately, in the main thread, and pass its return value, <code>None</code>, as the target. The work happens, so the bug is easy to miss, but it happens one call at a time:</p>
  <div class="fx" data-lang="py">import threading, time

def worker(rid):
    time.sleep(0.2)
    print(f"  {threading.current_thread().name:&lt;10} fetched {rid}")

t = time.perf_counter()
ts = [threading.Thread(target=worker(r)) for r in ("R01", "R02", "R03")]   # MISTAKE: worker(r)
for th in ts: th.start()
for th in ts: th.join()
print(f"target=worker(r): {time.perf_counter() - t:.1f}s")

t = time.perf_counter()
ts = [threading.Thread(target=worker, args=(r,)) for r in ("R01", "R02", "R03")]   # FIX
for th in ts: th.start()
for th in ts: th.join()
print(f"target=worker, args=(r,): {time.perf_counter() - t:.1f}s")</div>
  <div class="fx" data-lang="text">  MainThread fetched R01
  MainThread fetched R02
  MainThread fetched R03
target=worker(r): 0.6s
  Thread-4 (worker) fetched R01
  Thread-5 (worker) fetched R02
  Thread-6 (worker) fetched R03
target=worker, args=(r,): 0.2s</div>
  <p>With the mistake, every fetch was done by <code>MainThread</code>, one after another, taking 0.6 seconds; the threads themselves did nothing. With the fix, three separate threads did the work side by side in about 0.2 seconds. A similar slip is starting and joining each thread in the same loop, which also runs them one at a time: start them all first, then join them all.</p>
  <p>A more dangerous mistake is assuming you will notice when a thread fails. With a raw <code>Thread</code>, an exception inside the target function is printed to the screen, the thread ends, and <code>join()</code> returns as if nothing had happened. The code that started the thread never finds out:</p>
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
  File "m_exc.py", line 7, in worker
    raise ConnectionError("R13 unavailable")
ConnectionError: R13 unavailable
main carries on, results: ['R12']</div>
  <p>The traceback appeared on the screen, but the main program carried on with one result instead of two, and nothing in its own code knew that R13 had failed. In a long-running service that output may go nowhere, and the data is silently incomplete. The fix is to use a <code>ThreadPoolExecutor</code> and call <code>future.result()</code>, which raises the error in your code, or to catch exceptions inside the target and record them somewhere.</p>
  <p>Another subtle race is <strong>check-then-act</strong>: "if the menu is not in the cache, fetch it and store it" is two steps, and several threads can all pass the check before any of them has stored anything:</p>
  <div class="fx" data-lang="py">import threading, time

calls = 0
cache = {}
def slow_fetch(key):
    global calls
    calls += 1
    time.sleep(0.05)
    return {"id": key}

def get(key):                                  # check ... then act: two separate steps
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
  <p>Without a lock, four threads all found the cache empty and the expensive fetch ran four times for a single key. Holding a lock across both the check and the act makes it run once. (This simple version also makes requests for <em>different</em> keys wait for each other; a lock per key is a common refinement.) The same applies to <code>d[k] = d.get(k, 0) + 1</code> and any other "look, then change" sequence on shared data.</p>
  <p>Finally, some objects must not be used from several threads at once at all: many database connections, HTTP sessions and generators are like this (a generator used from two threads raises <code>ValueError: generator already executing</code>). Instead of sharing one, give each thread its own. <code>threading.local()</code> creates an object on which every thread sees its own separate attributes:</p>
  <div class="fx" data-lang="py">import threading

local = threading.local()                      # every thread sees its own attributes on this
results = {}

def worker(name):
    local.conn = f"connection-for-{name}"      # e.g. one database connection per thread
    results[name] = local.conn

ts = [threading.Thread(target=worker, args=(n,)) for n in ("t1", "t2")]
for t in ts: t.start()
for t in ts: t.join()
print(results)
print("main thread has conn?", hasattr(local, "conn"))</div>
  <div class="fx" data-lang="text">{'t1': 'connection-for-t1', 't2': 'connection-for-t2'}
main thread has conn? False</div>
  <p>Each thread stored its own connection on the same <code>local</code> object without seeing the other's, and the main thread, which never set one, has none at all. Beyond these, remember the mistakes already met on this page: using threads to speed up pure-Python computing (the GIL prevents it), holding a lock while doing slow I/O (it makes all threads sequential), taking locks in different orders (deadlock), and forgetting a poison pill per consumer (the program never finishes).</p>

  <h2 id="th-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key definitions</h3>
  <ul>
    <li><b>Thread</b>: an independent sequence of execution inside a process; threads share the process's memory, each has its own call stack.</li>
    <li><b>GIL</b>: a CPython lock a thread must hold to run Python code; one thread runs Python at a time per process. Exists to protect reference counts.</li>
    <li><b>Race condition</b>: a bug whose result depends on thread timing. <b>Critical section</b>: code touching shared data. <b>Atomic</b>: cannot be seen half-done.</li>
    <li><b>Lock / mutex</b>: one holder at a time. <b>RLock</b>: the owner may re-acquire it. <b>Deadlock</b>: threads waiting for each other in a circle.</li>
    <li><b>Semaphore(n)</b>: at most n holders. <b>Event</b>: a flag threads can wait on. <b>Poison pill</b>: a special item telling a consumer to stop.</li>
    <li><b>Daemon thread</b>: does not keep the program alive. <b>Future</b>: a placeholder for a result that will exist later.</li>
  </ul>
  <h3>Creating threads</h3>
  <div class="fx" data-lang="py">t = threading.Thread(target=f, args=(x,), name="w1", daemon=False)
t.start()          # returns immediately
t.join(timeout)    # wait for it; then t.is_alive()
threading.current_thread().name, threading.active_count()</div>
  <ul>
    <li><code>target=f</code>, not <code>target=f()</code>. The target's return value is thrown away: store results.</li>
    <li>Start all, then join all. Waiting jobs with n threads take ≈ ⌈tasks ÷ n⌉ × one wait.</li>
  </ul>
  <h3>The GIL</h3>
  <ul>
    <li>Released: blocking I/O, <code>sleep</code>, most numpy/pandas/hashlib/zlib C code. Held: pure-Python computing, offered every <code>sys.getswitchinterval()</code> = 0.005 s.</li>
    <li>Threads speed up waiting, not pure-Python computing (4 threads ≈ 1 thread on the route job).</li>
    <li>Not thread safety for your code. Free-threaded build: <code>python3.13t</code> (experimental), 3.14t (supported, opt-in); check <code>sys._is_gil_enabled()</code>.</li>
  </ul>
  <h3>Synchronisation tools</h3>
  <table class="tbl">
    <tr><th>Tool</th><th>Key API</th><th>Use</th></tr>
    <tr><td><code>Lock</code></td><td><code>with lock:</code>, <code>acquire(timeout=)</code>, <code>locked()</code></td><td>one at a time</td></tr>
    <tr><td><code>RLock</code></td><td>same; re-entrant for the owner</td><td>nested locked calls</td></tr>
    <tr><td><code>Semaphore(n)</code></td><td><code>with sem:</code></td><td>at most n inside</td></tr>
    <tr><td><code>Event</code></td><td><code>set</code>, <code>clear</code>, <code>is_set</code>, <code>wait(timeout)</code></td><td>ready / stop signals</td></tr>
    <tr><td><code>queue.Queue</code></td><td><code>put</code>, <code>get</code>, <code>maxsize</code>, <code>task_done</code>/<code>join</code></td><td>producer–consumer</td></tr>
    <tr><td><code>threading.local()</code></td><td>attributes per thread</td><td>one connection per thread</td></tr>
  </table>
  <h3>ThreadPoolExecutor</h3>
  <div class="fx" data-lang="py">with ThreadPoolExecutor(max_workers=20) as ex:
    out = list(ex.map(fetch, ids))                  # input order
    futs = {ex.submit(fetch, i): i for i in ids}
    for f in as_completed(futs):                    # finish order
        try: f.result()                             # value, or re-raises
        except Exception as e: print(futs[f], e)</div>
  <ul>
    <li>Default workers: <code>min(32, cpu_count + 4)</code>.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li><code>x += 1</code> on shared data is read, add, write: not atomic. Lock it or avoid sharing.</li>
    <li>Check-then-act needs one lock around both steps.</li>
    <li>Never do slow I/O while holding a lock.</li>
    <li>Same lock order everywhere prevents deadlock; deadlocks hang with no error.</li>
    <li>Raw thread exceptions are printed and lost; use a pool and <code>result()</code>.</li>
    <li>Threads cannot be killed: give them a stop Event or a poison pill.</li>
    <li>One pill per consumer, after the real work.</li>
  </ul>

  <h2 id="th-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a thread, and how is it different from a process?</summary><div class="qa-body">A thread is a sequence of execution inside a process; all threads of a process share its memory, and each has its own call stack. A process has its own memory and, in Python, its own interpreter and GIL. Threads are cheap to start and share data easily but need synchronisation; processes are isolated and can run Python in parallel, but cost more to start and must copy data to communicate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the GIL?</summary><div class="qa-body">The Global Interpreter Lock is a lock in CPython that a thread must hold to run Python code, so only one thread per process executes Python at a time. It exists mainly to make reference counting safe without a lock on every object. It is released during blocking I/O and in many C extensions, so threads help I/O-bound work but not CPU-bound pure-Python work.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>If Python has a GIL, why use threads at all?</summary><div class="qa-body">Because waiting releases the GIL. Network calls, disk reads, database queries and <code>time.sleep</code> all release it, so many threads can wait at the same time: 20 requests of 0.2 s took 4 s one after another and about 0.2 s with 20 threads. Heavy numpy and other C code also release it and can run in parallel across threads.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why don't threads speed up a CPU-bound pure-Python function?</summary><div class="qa-body">Only the thread holding the GIL can run Python code. A computing thread keeps it, handing it over only every switch interval (5 ms), so the threads take turns and the total time is about the same as running sequentially, sometimes worse because of the hand-overs. Use a process pool, numpy, or the free-threaded build.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do <code>start()</code> and <code>join()</code> do?</summary><div class="qa-body"><code>start()</code> asks the operating system to begin running the thread's target and returns immediately. <code>join()</code> blocks the calling thread until that thread has finished (or until an optional timeout passes). The usual pattern is to start all threads first and then join all of them; starting and joining in the same loop runs them one at a time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is <code>counter += 1</code> thread-safe in Python?</summary><div class="qa-body">No. <code>dis</code> shows it is three steps: load, add and store. If a thread switch happens between the load and the store, another thread can read the same old value and one update is lost. It may happen to work in a tight loop on a particular CPython version, but that is an implementation detail. Protect it with a lock, or give each thread its own counter and add them up at the end.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does the GIL make Python code thread-safe?</summary><div class="qa-body">No. It guarantees that single bytecode instructions, and therefore single built-in operations like <code>list.append</code>, do not interleave, but not that a sequence of them runs as a unit. Read-modify-write and check-then-act sequences on shared data still need locks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a race condition? Give an example.</summary><div class="qa-body">A bug whose result depends on the timing of threads. Example: two threads both read a counter as 5 and both write 6, so one increment is lost. Another: two threads both find a key missing from a cache and both do the expensive fetch. Fix it with a lock around the whole compound operation, or by not sharing mutable data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Lock vs RLock?</summary><div class="qa-body">A <code>Lock</code> does not track its owner: if the thread holding it tries to acquire it again, it waits forever. An <code>RLock</code> records its owner and a count, so the owner can acquire it again, for example when one locked method calls another, and it is released only after the same number of releases. Only the owner may release an RLock.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a deadlock, and how do you prevent one?</summary><div class="qa-body">A situation where threads wait for each other in a circle, for example thread 1 holds lock A and wants B while thread 2 holds B and wants A; the program hangs with no error. Prevent it by acquiring locks in one fixed order everywhere, not holding locks during slow work or calls into unknown code, using <code>acquire(timeout=…)</code>, and preferring queues to shared state.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Semaphore vs Lock?</summary><div class="qa-body">A lock lets in one thread at a time; <code>Semaphore(n)</code> lets in up to n. Use a semaphore to enforce limits such as "at most 3 requests to this API at once" or a pool of n connections. <code>BoundedSemaphore</code> also raises an error if it is released more times than acquired.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a <code>threading.Event</code> used for?</summary><div class="qa-body">It is a flag that threads can wait on. <code>wait()</code> sleeps until another thread calls <code>set()</code>, which wakes all waiters; <code>clear()</code> resets it. Typical uses are "data is ready" signals and stop flags for background threads, which check <code>is_set()</code> in their loop. It replaces wasteful busy-wait loops.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does <code>queue.Queue</code> help with thread safety?</summary><div class="qa-body">It is a line of items with its own internal locking, so producers can <code>put</code> and consumers can <code>get</code> safely without any locks in your code. Data is handed over rather than shared, which removes most race conditions. <code>maxsize</code> adds back-pressure, and poison pills or <code>task_done()</code>/<code>join()</code> handle shutdown.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you get a return value from a thread?</summary><div class="qa-body">A raw <code>Thread</code> throws away its target's return value, so you write the result somewhere shared, such as a per-thread slot in a list or a queue. The idiomatic way is <code>ThreadPoolExecutor</code>: <code>submit</code> returns a Future whose <code>result()</code> gives the value or re-raises the exception.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens to an exception raised inside a thread?</summary><div class="qa-body">With a raw <code>Thread</code>, <code>threading.excepthook</code> prints the traceback, the thread ends, and <code>join()</code> returns normally, so the code that started it never finds out. With an executor, the exception is stored in the Future and raised again when you call <code>result()</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>executor.map</code> vs <code>submit</code> plus <code>as_completed</code>?</summary><div class="qa-body"><code>map</code> returns results in input order and raises the first exception when you reach it. <code>submit</code> gives one Future per call and <code>as_completed</code> yields them in the order they finish, so you can process fast results first and handle each failure separately.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many threads should a ThreadPoolExecutor have?</summary><div class="qa-body">For waiting jobs, enough to cover the waits you want to overlap, limited by what the remote service, connection pool and memory allow: often tens, sometimes a few hundred. Time is roughly ⌈tasks ÷ workers⌉ × latency. The default is <code>min(32, cpu_count + 4)</code>. For CPU-bound pure Python, more threads do not help at all.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you stop a running thread?</summary><div class="qa-body">Python cannot kill a thread from outside. Design the thread to stop itself: give it a <code>threading.Event</code> to check in its loop (using <code>event.wait(timeout)</code> instead of <code>sleep</code> so it wakes promptly), or send it a poison pill through its queue. Daemon threads are simply abandoned when the program exits, without running their cleanup.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is free-threaded Python, and should you use it?</summary><div class="qa-body">An optional CPython build without the GIL (PEP 703): experimental as <code>python3.13t</code>, officially supported but not the default from 3.14. Threads can then run Python code on several cores at once. The costs are somewhat slower single-threaded code, C extensions that must support it (otherwise the GIL is re-enabled), and race conditions becoming more likely. It is worth benchmarking for CPU-heavy threaded code whose libraries support it; processes remain the portable answer.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your threaded downloader sometimes returns fewer files than expected and shows no error. Where do you look?</summary><div class="qa-body">First, exceptions in raw threads, which are printed and lost: switch to a pool and call <code>result()</code>. Then shared lists or dicts updated with compound operations without a lock, check-then-act around a "seen" set or cache, and a client object that is not thread-safe being shared between threads (give each thread its own with <code>threading.local</code>).</div></details>
</main>
`
});
