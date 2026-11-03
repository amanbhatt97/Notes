// notes/python/py_concurrency.js — Concurrency vs Parallelism: Choosing a Model
Object.assign(TOPIC_CONTENT, {
  "py_concurrency": `<main>
<h1>Concurrency vs Parallelism: Choosing a Model</h1>
  <div class="where"><span>Python</span><span>Advanced Python</span><span>Concurrency</span><span>Concurrency vs Parallelism: Choosing a Model</span></div>
  <p class="lead">Python gives you three ways to do more than one thing at a time: threads, processes and asyncio. Pick the wrong one and nothing gets faster. Four threads on a pure-Python calculation take as long as one, and a process pool used for network calls costs more than it saves. The right choice depends on one question: while the program is slow, is it <em>waiting</em> (network, disk, database) or <em>computing</em>? This page covers concurrency vs parallelism, how to measure which kind of slow you have, what the GIL does and does not block, how the three models compare when measured on the same two jobs, and <code>concurrent.futures</code>, the one interface that drives both thread and process pools. You meet the same choice in ML and backend work: parallel S3 or API downloads, <code>DataLoader</code> workers, <code>n_jobs</code> in scikit-learn, async FastAPI endpoints. Code was run on CPython 3.13 on a 4-core machine; timings vary from run to run, so treat them as approximate and compare the ratios.</p>

  <h2 id="cc-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Concurrency vs Parallelism</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Two ideas</div>
        <ul>
          <li><b>Concurrency</b>: many tasks in progress, interleaved (structure)</li>
          <li><b>Parallelism</b>: tasks executing at the same instant on several cores (hardware)</li>
          <li>Concurrency hides <b>waiting</b>; only parallelism shortens <b>computing</b></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Diagnose</div>
        <ul>
          <li><b>I/O-bound</b>: CPU time ≪ wall time</li>
          <li><b>CPU-bound</b>: CPU time ≈ wall time</li>
          <li><code>time.process_time()</code> vs <code>time.perf_counter()</code></li>
          <li>Profile (<code>cProfile</code>) before parallelising</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">GIL</div>
        <ul>
          <li>One thread runs Python bytecode at a time (CPython)</li>
          <li>Protects reference counts; keeps single-threaded code fast</li>
          <li>Released on blocking I/O, <code>sleep</code>, most numpy/C work</li>
          <li>Free-threaded build: <code>python3.13t</code> (PEP 703)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Three models</div>
        <ul>
          <li><b>threading</b>: OS threads, shared memory, preemptive</li>
          <li><b>multiprocessing</b>: separate interpreters, own GIL each</li>
          <li><b>asyncio</b>: one thread, event loop, cooperative at <code>await</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">concurrent.futures</div>
        <ul>
          <li><code>ThreadPoolExecutor</code> / <code>ProcessPoolExecutor</code>: same API</li>
          <li><code>submit</code> → <code>Future</code>; <code>map</code>; <code>as_completed</code></li>
          <li>asyncio bridges in with <code>run_in_executor</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Pick a model</div>
        <ul>
          <li>Waiting, blocking libraries → threads</li>
          <li>Waiting, thousands, async libraries → asyncio</li>
          <li>Pure-Python computing → processes</li>
          <li>numpy/pandas computing → vectorise first</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="cc-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Sequential Execution and Waiting</span><span class="rm-sub">Why waits add up</span></div></div>
      <div class="rm-item rm-done" data-target="cc-cvp"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Concurrency vs Parallelism</span><span class="rm-sub">Interleaving vs simultaneous execution</span></div></div>
      <div class="rm-item rm-done" data-target="cc-diag"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">I/O-bound vs CPU-bound</span><span class="rm-sub">CPU time / wall time ratio</span></div></div>
      <div class="rm-item rm-done" data-target="cc-gil"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The GIL in Brief</span><span class="rm-sub">What it blocks, free-threaded builds</span></div></div>
      <div class="rm-item rm-done" data-target="cc-tools"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Threads, Processes and asyncio Compared</span><span class="rm-sub">Same two jobs, four ways</span></div></div>
      <div class="rm-item rm-done" data-target="cc-futures"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">concurrent.futures: One Interface for Threads and Processes</span><span class="rm-sub">Executor, Future, map, as_completed</span></div></div>
      <div class="rm-item rm-done" data-target="cc-decide"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Choosing a Model: Decision Table</span><span class="rm-sub">Workload shape to tool</span></div></div>
      <div class="rm-item rm-done" data-target="cc-traps"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Wrong tool, symptom, fix</span></div></div>
      <div class="rm-item rm-done" data-target="cc-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">Definitions, GIL rules, tables</span></div></div>
      <div class="rm-item rm-done" data-target="cc-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">GIL, models, executors, design</span></div></div>
    </div>
  </div>

  <h2 id="cc-why"><span class="num">01</span>Sequential Execution and Waiting</h2>
  <p>A normal Python program runs one statement at a time and finishes each before starting the next. If one line waits 0.2 s for a server, the whole program waits, and those waits add up. To see this, the examples on this page use two jobs. The first is an I/O-bound job: 20 simulated network calls of 0.2 s each (<code>time.sleep</code> stands in for the network, and from the program's point of view it behaves the same way: the thread sits idle until the reply arrives). The second is a CPU-bound job: 4 brute-force shortest-path searches over 9 points (9! = 362,880 orderings each).</p>
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
  <p>Save that as <code>workload.py</code>. Every correct way of running the I/O job must return 100 dishes in total, and every correct way of running the CPU job must return the costs <code>[40, 36, 35, 36]</code>. Run them sequentially and time each with <code>time.perf_counter()</code>:</p>
  <div class="fx" data-lang="py">import time
from workload import RESTAURANTS, RIDERS, fetch_menu, route_cost

t = time.perf_counter()
menus = [fetch_menu(r) for r in RESTAURANTS]          # 20 waits, one after another
t_io = time.perf_counter() - t
print(f"I/O job : {len(menus)} results, {sum(m['dishes'] for m in menus)} dishes, {t_io:.2f}s")

t = time.perf_counter()
costs = [route_cost(s) for s in RIDERS]               # 4 brute-force searches
t_cpu = time.perf_counter() - t
print(f"CPU job : costs {costs}, {t_cpu:.2f}s")</div>
  <div class="fx" data-lang="text">I/O job : 20 results, 100 dishes, 4.00s
CPU job : costs [40, 36, 35, 36], 1.22s</div>
  <p>The I/O job took 20 × 0.2 = 4.0 s, and almost all of it was idle waiting. The CPU job took roughly 1–1.5 s of real calculation (this number varies between runs; the 4.00 s does not, because it is pure waiting).</p>
  <figure class="viz"><svg viewBox="0 0 600 110" width="600">
    <text x="10" y="18" class="tm">Sequential I/O: 20 waits laid end to end (first 8 shown)</text>
    <rect x="20" y="30" width="4" height="22" class="fb sb"/><rect x="24" y="30" width="60" height="22" class="fs"/>
    <rect x="84" y="30" width="4" height="22" class="fb sb"/><rect x="88" y="30" width="60" height="22" class="fs"/>
    <rect x="148" y="30" width="4" height="22" class="fb sb"/><rect x="152" y="30" width="60" height="22" class="fs"/>
    <rect x="212" y="30" width="4" height="22" class="fb sb"/><rect x="216" y="30" width="60" height="22" class="fs"/>
    <rect x="276" y="30" width="4" height="22" class="fb sb"/><rect x="280" y="30" width="60" height="22" class="fs"/>
    <rect x="340" y="30" width="4" height="22" class="fb sb"/><rect x="344" y="30" width="60" height="22" class="fs"/>
    <rect x="404" y="30" width="4" height="22" class="fb sb"/><rect x="408" y="30" width="60" height="22" class="fs"/>
    <rect x="468" y="30" width="4" height="22" class="fb sb"/><rect x="472" y="30" width="60" height="22" class="fs"/>
    <text x="545" y="46" class="tm">… ×20</text>
    <text x="54" y="70" text-anchor="middle" class="tm" font-size="10">call 1</text><text x="118" y="70" text-anchor="middle" class="tm" font-size="10">call 2</text><text x="182" y="70" text-anchor="middle" class="tm" font-size="10">call 3</text>
    <rect x="20" y="86" width="10" height="10" class="fb sb"/><text x="36" y="95" class="tm">CPU working (tiny)</text>
    <rect x="170" y="86" width="10" height="10" class="fs"/><text x="186" y="95" class="tm">waiting for the reply, CPU idle</text>
  </svg><figcaption>Time runs left to right. Each call is a sliver of real work (blue) followed by a long wait (grey). Sequentially the waits line up end to end, so total time = sum of all waits.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span><p><strong>Sequential execution</strong>: each task runs to completion before the next starts; total time = sum of task times. <strong>Wall-clock time</strong>: real elapsed time (<code>time.perf_counter()</code>). <strong>Latency</strong>: how long one request takes to be answered.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"The program is slow, so the CPU must be busy." Often the opposite: during the 4 seconds above the CPU did almost nothing. Measure what the slow part is doing (section 03) before choosing a tool.</p></div>

  <h2 id="cc-cvp"><span class="num">02</span>Concurrency vs Parallelism</h2>
  <p>"Doing several things at once" means two different things, and mixing them up causes most of the confusion in this topic.</p>
  <ul>
    <li><strong>Concurrency</strong>: several tasks are <em>in progress</em> during the same period. They need not run at the same instant. One worker starts task 1, switches to task 2 while task 1 waits, and returns to task 1 when its reply arrives. Concurrency is about program <em>structure</em>, and it is possible on a single core.</li>
    <li><strong>Parallelism</strong>: several tasks are <em>executing at the same instant</em> on different CPU cores. Parallelism is about <em>hardware</em>.</li>
  </ul>
  <figure class="viz"><svg viewBox="0 0 620 210" width="620">
    <text x="10" y="18" class="tm">Three requests (blue = work, grey = waiting) and two calculations (green)</text>
    <text x="10" y="50">Sequential</text>
    <rect x="130" y="38" width="8" height="16" class="fb sb"/><rect x="138" y="38" width="80" height="16" class="fs"/>
    <rect x="218" y="38" width="8" height="16" class="fb sb"/><rect x="226" y="38" width="80" height="16" class="fs"/>
    <rect x="306" y="38" width="8" height="16" class="fb sb"/><rect x="314" y="38" width="80" height="16" class="fs"/>
    <text x="402" y="51" class="tr">waits add up</text>
    <text x="10" y="96">Concurrent</text><text x="10" y="110" class="tm">(1 core)</text>
    <rect x="130" y="76" width="8" height="12" class="fb sb"/><rect x="138" y="76" width="80" height="12" class="fs"/>
    <rect x="138" y="91" width="8" height="12" class="fb sb"/><rect x="146" y="91" width="80" height="12" class="fs"/>
    <rect x="146" y="106" width="8" height="12" class="fb sb"/><rect x="154" y="106" width="80" height="12" class="fs"/>
    <text x="244" y="100" class="tg">waits overlap: total ≈ one wait</text>
    <text x="10" y="150">Concurrent</text><text x="10" y="164" class="tm">CPU work, 1 core</text>
    <rect x="130" y="140" width="70" height="14" class="fg sg"/><rect x="200" y="140" width="70" height="14" class="ft st"/>
    <text x="280" y="152" class="tr">switching does not help: total = sum</text>
    <text x="10" y="192">Parallel</text><text x="10" y="205" class="tm">CPU work, 2 cores</text>
    <rect x="130" y="180" width="70" height="10" class="fg sg"/><rect x="130" y="193" width="70" height="10" class="ft st"/>
    <text x="210" y="195" class="tg">two cores at once: total ≈ one job</text>
  </svg><figcaption>Waiting work: overlapping the waits (concurrency) wins even on one core, because waiting does not need a core. Computing work: interleaving two calculations on one core gains nothing; only running them on two cores (parallelism) halves the time.</figcaption></figure>
  <table class="tbl"><caption>What each approach can do for the two jobs</caption>
    <tr><th></th><th>I/O job (20 × 0.2 s waits)</th><th>CPU job (4 searches)</th></tr>
    <tr><td>Sequential</td><td>4.0 s</td><td>≈ 1.2 s</td></tr>
    <tr><td>Concurrency (1 core, switch while waiting)</td><td>≈ 0.2 s: all waits overlap</td><td>≈ 1.2 s: nothing to overlap</td></tr>
    <tr><td>Parallelism (4 cores)</td><td>works, but wasteful: waiting needs no core</td><td>≈ 1.2 / 4 at best</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>One cook with four pans on four burners, stirring whichever needs it, is concurrency. Four cooks chopping vegetables at the same time is parallelism. Boiling water (waiting) only needs one cook who keeps moving. Chopping (computing) only gets faster with more cooks.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Concurrency</strong>: structuring a program so several tasks make progress in overlapping time periods. <strong>Parallelism</strong>: executing several tasks simultaneously on multiple cores. Parallelism is one way to achieve concurrency; concurrency does not require parallelism. In CPython: <strong>threads and asyncio give concurrency; processes give parallelism</strong> (threads do not, because of the GIL, section 04).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Treating the words as synonyms: "I made it concurrent, why isn't my calculation faster?" Concurrency only hides waiting. A pure calculation has no waiting to hide.</p></div>

  <h2 id="cc-diag"><span class="num">03</span>I/O-bound vs CPU-bound</h2>
  <p>To pick a model you need to know whether the slow code is mostly waiting or mostly computing. Compare two clocks. <code>time.perf_counter()</code> measures <strong>wall time</strong>, real seconds passing. <code>time.process_time()</code> measures <strong>CPU time</strong>, the seconds the CPU actually spent running this process (sleeping and waiting on I/O do not count). The ratio CPU / wall tells you which kind of slow you have.</p>
  <div class="fx" data-lang="py">import time
from workload import RESTAURANTS, RIDERS, fetch_menu, route_cost

def profile(label, job):
    wall0, cpu0 = time.perf_counter(), time.process_time()
    job()
    wall = time.perf_counter() - wall0               # real elapsed time
    cpu = time.process_time() - cpu0                 # CPU time used by this process
    print(f"{label:&lt;4} wall {wall:.2f}s  cpu {cpu:.2f}s  cpu/wall = {cpu / wall:.0%}")

profile("I/O", lambda: [fetch_menu(r) for r in RESTAURANTS])
profile("CPU", lambda: [route_cost(s) for s in RIDERS])</div>
  <div class="fx" data-lang="text">I/O  wall 4.01s  cpu 0.00s  cpu/wall = 0%
CPU  wall 1.06s  cpu 1.05s  cpu/wall = 99%</div>
  <p>The I/O job used about 0% CPU over 4 s: it was asleep the whole time. The CPU job used about 99%: it was computing every moment. (The <code>lambda</code> wraps each job so <code>profile</code> can call it between the two clock readings.)</p>
  <table class="tbl"><caption>Reading the ratio</caption>
    <tr><th>CPU / wall</th><th>Name</th><th>Typical examples</th><th>What helps</th></tr>
    <tr><td>near 0%</td><td><strong>I/O-bound</strong></td><td>REST/LLM API calls, downloads, SQL queries, reading from S3</td><td>concurrency: threads or asyncio</td></tr>
    <tr><td>near 100%</td><td><strong>CPU-bound</strong></td><td>pure-Python loops, parsing, tokenising, feature engineering in Python, simulations</td><td>parallelism (processes) or faster code (numpy, Cython)</td></tr>
    <tr><td>in between</td><td>mixed</td><td>download then parse; fetch then featurise</td><td>split the stages; give each its own tool</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>I/O-bound</strong>: running time dominated by waiting for input/output; a faster CPU barely helps. <strong>CPU-bound</strong>: running time dominated by computation; a faster CPU or more cores help directly.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Skipping the measurement. If 90% of the time is one slow SQL query, ten concurrent copies only load the database ten times harder. Profile first with <code>cProfile</code> (see <a class="xref" data-note="py_debugging">Debugging, Profiling &amp; Logging</a>), then choose a tool for the part that is actually slow.</p></div>

  <h2 id="cc-gil"><span class="num">04</span>The GIL in Brief</h2>
  <p>The Global Interpreter Lock is why the choice between threads and processes matters in Python at all. In most languages, threads give both concurrency and parallelism. In CPython they give only concurrency.</p>
  <h3>What it is and why it exists</h3>
  <p>The GIL is a single mutex inside the CPython interpreter. A thread must hold it to execute Python bytecode, so at any instant only one thread in a process is running Python code, however many cores the machine has. It exists mainly because CPython manages memory with <strong>reference counting</strong>: every object carries a counter of references to it, updated on almost every assignment, call and container operation. If two threads updated the same counter at once, one update could be lost and an object freed while still in use. One global lock makes those updates safe without the cost of a lock per object, keeps single-threaded code fast, and makes C extensions simpler to write.</p>
  <div class="fx" data-lang="py">import sys, sysconfig
print("GIL enabled:", sys._is_gil_enabled())                       # False on a free-threaded build
print("free-threaded build:", bool(sysconfig.get_config_var("Py_GIL_DISABLED")))
print("switch interval:", sys.getswitchinterval(), "s")             # how often a CPU-bound thread must offer the GIL
x = []
print("refcount of x:", sys.getrefcount(x))                         # the counter the GIL protects</div>
  <div class="fx" data-lang="text">GIL enabled: True
free-threaded build: False
switch interval: 0.005 s
refcount of x: 2</div>
  <p><code>sys.getrefcount(x)</code> reports 2: the name <code>x</code> plus the temporary reference created by passing it to the function. The switch interval (5 ms by default) is how often a thread running pure Python is asked to release the GIL so another thread can take a turn.</p>
  <h3>What it blocks and what it does not</h3>
  <table class="tbl">
    <tr><th>Situation</th><th>GIL</th><th>Effect on threads</th></tr>
    <tr><td>Blocking I/O: sockets, files, <code>time.sleep</code>, DB drivers, <code>requests</code></td><td>released while waiting</td><td>waits overlap: threads speed up I/O-bound work</td></tr>
    <tr><td>Long C routines: most numpy, pandas, PyTorch ops, <code>hashlib</code>, <code>zlib</code></td><td>usually released inside the C code</td><td>can run in parallel on several cores</td></tr>
    <tr><td>Pure-Python computation (loops, dicts, string building)</td><td>held; handed over every 5 ms</td><td>threads take turns: no speed-up, often slightly slower</td></tr>
    <tr><td>Separate processes</td><td>one GIL per process</td><td>no contention: true parallelism</td></tr>
  </table>
  <p>Two things the GIL does <strong>not</strong> do. It does not make your code thread-safe: a thread can be switched out between any two bytecodes, so <code>counter += 1</code> on shared data (read, add, write) can still lose updates. And it does not affect asyncio, which runs on one thread anyway.</p>
  <h3>Free-threaded Python</h3>
  <p>PEP 703 added an optional CPython build without the GIL, shipped as an experimental build in Python 3.13 (usually installed as <code>python3.13t</code>) and officially supported, but still not the default, from 3.14. On that build threads can execute Python bytecode on several cores at once, so CPU-bound threads do speed up. The trade-offs: single-threaded code runs somewhat slower, C extensions must be rebuilt and declare support (importing one that has not re-enables the GIL with a warning), and races in your own code become more likely. Check with <code>sys._is_gil_enabled()</code>. The standard build used here printed <code>True</code>. Details and measurements are in <a class="xref" data-note="py_threading">Threads &amp; the GIL</a>.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>GIL</strong>: a mutex in CPython that allows only one thread per process to execute Python bytecode at a time. It protects interpreter state, chiefly reference counts. Released during blocking I/O and many C-level operations; held during pure-Python computation. Consequence: threads help I/O-bound work, not CPU-bound pure-Python work. PyPy also has a GIL; Jython and IronPython do not.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"Python can't do parallelism because of the GIL." It can: with processes, or inside C code that releases the GIL (numpy matrix maths uses several cores from one Python thread). The GIL only rules out parallel <em>Python bytecode</em> in one process on the standard build.</p></div>

  <h2 id="cc-tools"><span class="num">05</span>Threads, Processes and asyncio Compared</h2>
  <p>Each standard-library model makes a different trade between cost, safety and what it can speed up.</p>
  <div class="cards">
    <div><b>threading</b><p>Several OS threads inside one process, sharing all its memory. The OS switches between them at any point (preemptive). While one thread waits on I/O, another runs.</p><small>see <a class="xref" data-note="py_threading">Threads &amp; the GIL</a></small></div>
    <div><b>multiprocessing</b><p>Several separate Python processes, each with its own interpreter, memory and GIL, so they run Python on different cores at the same instant. Data crosses between them by pickling.</p><small>see <a class="xref" data-note="py_multiprocessing">Processes</a></small></div>
    <div><b>asyncio</b><p>One thread running an event loop over many coroutines. Each coroutine marks where it waits with <code>await</code>; only there does the loop switch to another (cooperative).</p><small>see <a class="xref" data-note="py_asyncio">asyncio</a></small></div>
  </div>
  <p>The script below runs both jobs four ways: sequentially, in a thread pool, in a process pool of 4 workers (the number of cores here), and with asyncio. The answers must be identical every time: 100 dishes and <code>[40, 36, 35, 36]</code>.</p>
  <div class="fx" data-lang="py">import asyncio, time
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
from workload import RESTAURANTS, RIDERS, fetch_menu, fetch_menu_async, route_cost

async def route_cost_async(stops):                    # a coroutine that never awaits
    return route_cost(stops)

def timed(label, fn):
    t = time.perf_counter()
    result = fn()
    print(f"  {label:&lt;10} {time.perf_counter() - t:5.2f}s   {result}")

if __name__ == "__main__":
    print("I/O-bound: 20 calls x 0.2 s")
    timed("sequential", lambda: sum(fetch_menu(r)["dishes"] for r in RESTAURANTS))
    with ThreadPoolExecutor(max_workers=20) as ex:
        timed("threads", lambda: sum(m["dishes"] for m in ex.map(fetch_menu, RESTAURANTS)))
    with ProcessPoolExecutor(max_workers=4) as ex:
        timed("processes", lambda: sum(m["dishes"] for m in ex.map(fetch_menu, RESTAURANTS)))
    async def all_io():
        return sum(m["dishes"] for m in await asyncio.gather(*map(fetch_menu_async, RESTAURANTS)))
    timed("asyncio", lambda: asyncio.run(all_io()))

    print("CPU-bound: 4 brute-force searches")
    timed("sequential", lambda: [route_cost(s) for s in RIDERS])
    with ThreadPoolExecutor(max_workers=4) as ex:
        timed("threads", lambda: list(ex.map(route_cost, RIDERS)))
    with ProcessPoolExecutor(max_workers=4) as ex:
        timed("processes", lambda: list(ex.map(route_cost, RIDERS)))
    async def all_cpu():
        return list(await asyncio.gather(*map(route_cost_async, RIDERS)))
    timed("asyncio", lambda: asyncio.run(all_cpu()))</div>
  <div class="fx" data-lang="text">I/O-bound: 20 calls x 0.2 s
  sequential  4.00s   100
  threads     0.21s   100
  processes   1.02s   100
  asyncio     0.20s   100
CPU-bound: 4 brute-force searches
  sequential  1.06s   [40, 36, 35, 36]
  threads     1.27s   [40, 36, 35, 36]
  processes   0.44s   [40, 36, 35, 36]
  asyncio     1.05s   [40, 36, 35, 36]</div>
  <figure class="viz"><svg viewBox="0 0 520 240" width="520">
    <text x="10" y="18" class="tm">I/O-bound: 20 calls × 0.2 s</text>
    <text x="10" y="40">sequential</text><rect x="110" y="28" width="300" height="15" class="fs"/><text x="416" y="40">4.00 s</text>
    <text x="10" y="60">threads</text><rect x="110" y="48" width="16" height="15" class="fb sb"/><text x="132" y="60">0.21 s</text>
    <text x="10" y="80">processes</text><rect x="110" y="68" width="77" height="15" class="fv"/><text x="193" y="80">1.02 s</text>
    <text x="10" y="100">asyncio</text><rect x="110" y="88" width="15" height="15" class="ft st"/><text x="131" y="100">0.20 s</text>
    <text x="10" y="135" class="tm">CPU-bound: 4 searches</text>
    <text x="10" y="157">sequential</text><rect x="110" y="145" width="80" height="15" class="fs"/><text x="196" y="157">1.06 s</text>
    <text x="10" y="177">threads</text><rect x="110" y="165" width="95" height="15" class="fb sb"/><text x="211" y="177">1.27 s</text>
    <text x="10" y="197">processes</text><rect x="110" y="185" width="33" height="15" class="fv"/><text x="149" y="197">0.44 s</text>
    <text x="10" y="217">asyncio</text><rect x="110" y="205" width="79" height="15" class="ft st"/><text x="195" y="217">1.05 s</text>
  </svg><figcaption>Bar length = wall-clock seconds, same scale in both halves; shorter is better. For waiting, threads and asyncio win by about 20×. For computing, only processes help (about 2.5× on 4 cores).</figcaption></figure>
  <ul>
    <li><strong>I/O, threads and asyncio: 4.0 s → about 0.2 s.</strong> All 20 waits overlapped. That is concurrency.</li>
    <li><strong>I/O, 4 processes: about 1.0 s.</strong> Only 4 calls can wait at once, so 20 calls take 5 rounds of 0.2 s, plus process start-up. Using cores to wait is wasteful.</li>
    <li><strong>CPU, threads and asyncio: no faster than sequential.</strong> Threads take turns on the GIL (and pay for the hand-offs). The coroutines never <code>await</code>, so they simply run one after another.</li>
    <li><strong>CPU, processes: about 2.5× faster.</strong> Each process has its own GIL. Not a full 4× because of start-up, pickling and uneven job sizes.</li>
  </ul>
  <table class="tbl"><caption>The three models side by side</caption>
    <tr><th></th><th>threading</th><th>multiprocessing</th><th>asyncio</th></tr>
    <tr><td>Gives</td><td>concurrency</td><td>parallelism</td><td>concurrency</td></tr>
    <tr><td>Who switches</td><td>OS, at any bytecode (preemptive)</td><td>OS, truly simultaneous</td><td>the coroutine, only at <code>await</code> (cooperative)</td></tr>
    <tr><td>Memory</td><td>shared</td><td>separate; data is pickled</td><td>shared, one thread</td></tr>
    <tr><td>Cost per worker</td><td>an OS thread and its stack</td><td>a whole interpreter (start-up time, MBs of RAM)</td><td>a small Python object (KBs)</td></tr>
    <tr><td>Scales to</td><td>tens to hundreds</td><td>about the core count</td><td>thousands to tens of thousands</td></tr>
    <tr><td>Libraries</td><td>any blocking library</td><td>any, but arguments must be picklable</td><td>needs async libraries (httpx, aiohttp, asyncpg) or wrappers</td></tr>
    <tr><td>Main hazard</td><td>races, deadlocks</td><td>pickling errors, overhead, missing <code>__main__</code> guard</td><td>one blocking call freezes every task</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span><p>Generalising one benchmark. Process start-up, data size and machine load change the result: on tiny tasks a process pool can be 100× slower than a plain loop (measured in <a class="xref" data-note="py_multiprocessing">Processes</a>). Time your own workload.</p></div>

  <h2 id="cc-futures"><span class="num">06</span>concurrent.futures: One Interface for Threads and Processes</h2>
  <p><code>concurrent.futures</code> is the high-level standard-library API for running functions in a pool of workers. It defines one abstract class, <code>Executor</code>, with two implementations: <code>ThreadPoolExecutor</code> and <code>ProcessPoolExecutor</code>. Because they share the interface, moving a workload from threads to processes is usually a one-word change. In day-to-day code it is the usual way to use threads or processes; you rarely need raw <code>threading.Thread</code> or <code>multiprocessing.Process</code>.</p>
  <div class="fx" data-lang="py">import time
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor, as_completed
from workload import RESTAURANTS, RIDERS, fetch_menu, route_cost

def run(executor_cls, fn, items, workers):
    t = time.perf_counter()
    with executor_cls(max_workers=workers) as ex:      # same code for both pool types
        results = list(ex.map(fn, items))
    return results, time.perf_counter() - t

if __name__ == "__main__":
    for cls in (ThreadPoolExecutor, ProcessPoolExecutor):
        _, t_io = run(cls, fetch_menu, RESTAURANTS, 20)
        costs, t_cpu = run(cls, route_cost, RIDERS, 4)
        print(f"{cls.__name__:&lt;20} I/O {t_io:.2f}s   CPU {t_cpu:.2f}s  {costs}")

    with ThreadPoolExecutor(max_workers=4) as ex:
        fut = ex.submit(fetch_menu, "R07")            # schedule one call, get a Future now
        print("done right after submit?", fut.done())
        print("result():", fut.result())              # blocks until the value is ready
        futs = {ex.submit(fetch_menu, r): r for r in ["R01", "R02", "R03"]}
        print("as_completed:", sorted(futs[f] for f in as_completed(futs)))</div>
  <div class="fx" data-lang="text">ThreadPoolExecutor   I/O 0.21s   CPU 1.23s  [40, 36, 35, 36]
ProcessPoolExecutor  I/O 0.26s   CPU 0.46s  [40, 36, 35, 36]
done right after submit? False
result(): {'id': 'R07', 'dishes': 5}
as_completed: ['R01', 'R02', 'R03']</div>
  <p>The same <code>run</code> function drove both pools. Threads won the I/O job; processes won the CPU job. (With 20 worker processes the I/O job also finished quickly, but at the price of 20 interpreters to do nothing but wait.) <code>submit</code> returned a <code>Future</code> immediately, before the call had finished; <code>result()</code> then waited for the value. <code>as_completed</code> yields futures in the order they finish (sorted here for stable output).</p>
  <table class="tbl"><caption>The Executor API</caption>
    <tr><th>Call</th><th>Returns</th><th>Notes</th></tr>
    <tr><td><code>Executor(max_workers=n)</code></td><td>a pool</td><td>use as <code>with … as ex:</code>; leaving the block calls <code>shutdown(wait=True)</code></td></tr>
    <tr><td><code>ex.submit(fn, *args, **kw)</code></td><td><code>Future</code></td><td>schedules one call</td></tr>
    <tr><td><code>ex.map(fn, *iterables, timeout=None, chunksize=1)</code></td><td>iterator of results</td><td>results in <strong>input</strong> order; the first exception re-raises when you reach it; <code>chunksize</code> matters only for processes</td></tr>
    <tr><td><code>as_completed(futures, timeout=None)</code></td><td>iterator of futures</td><td>in <strong>finish</strong> order</td></tr>
    <tr><td><code>wait(futures, return_when=…)</code></td><td><code>(done, not_done)</code></td><td><code>FIRST_COMPLETED</code>, <code>FIRST_EXCEPTION</code>, <code>ALL_COMPLETED</code></td></tr>
    <tr><td><code>fut.result(timeout)</code>, <code>exception()</code>, <code>done()</code>, <code>cancel()</code>, <code>add_done_callback(fn)</code></td><td></td><td><code>result()</code> re-raises the worker's exception in the caller</td></tr>
  </table>
  <p>asyncio plugs into the same executors: <code>await loop.run_in_executor(executor, fn, *args)</code> runs a blocking or CPU-heavy function in a thread or process pool and lets the event loop await its result; <code>asyncio.to_thread(fn, *args)</code> is the shortcut for the default thread pool. That is how one program combines asyncio for its waiting with a process pool for its computing (see <a class="xref" data-note="py_asyncio">asyncio</a>).</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Future</strong>: an object representing the result of a call that may not have finished yet; you exchange it for the value (or the raised exception) with <code>result()</code>. <strong>Executor</strong>: a pool of reusable workers fed from an internal job queue. Default <code>max_workers</code>: <code>min(32, os.cpu_count() + 4)</code> for threads, <code>os.cpu_count()</code> for processes.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Swapping <code>ThreadPoolExecutor</code> for <code>ProcessPoolExecutor</code> is one word only if the function and its arguments are picklable and the pool is created under <code>if __name__ == "__main__":</code>. Lambdas, nested functions, open connections and locks cannot be sent to a process.</p></div>

  <h2 id="cc-decide"><span class="num">07</span>Choosing a Model: Decision Table</h2>
  <p>The choice comes down to three questions: is it actually slow (profile), is it waiting or computing (CPU/wall ratio), and then one practical question on each side.</p>
  <figure class="viz"><svg viewBox="0 0 640 230" width="640">
    <defs><marker id="cc-a6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="230" y="8" width="180" height="34" rx="6" class="fb sb"/><text x="320" y="30" text-anchor="middle" font-size="12">Is it slow? Profile it.</text>
    <line x1="320" y1="42" x2="320" y2="62" stroke="currentColor" marker-end="url(#cc-a6)"/>
    <rect x="200" y="64" width="240" height="34" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="86" text-anchor="middle" font-size="12">CPU time / wall time?</text>
    <line x1="260" y1="98" x2="150" y2="128" stroke="currentColor" marker-end="url(#cc-a6)"/><text x="160" y="112" class="tm">low: waiting</text>
    <line x1="380" y1="98" x2="490" y2="128" stroke="currentColor" marker-end="url(#cc-a6)"/><text x="440" y="112" class="tm">high: computing</text>
    <rect x="40" y="130" width="220" height="34" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="150" y="152" text-anchor="middle" font-size="12">async library? thousands of waits?</text>
    <rect x="380" y="130" width="220" height="34" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="490" y="152" text-anchor="middle" font-size="12">pure Python or numpy?</text>
    <line x1="100" y1="164" x2="70" y2="190" stroke="currentColor" marker-end="url(#cc-a6)"/><line x1="200" y1="164" x2="230" y2="190" stroke="currentColor" marker-end="url(#cc-a6)"/>
    <line x1="440" y1="164" x2="420" y2="190" stroke="currentColor" marker-end="url(#cc-a6)"/><line x1="540" y1="164" x2="560" y2="190" stroke="currentColor" marker-end="url(#cc-a6)"/>
    <rect x="10" y="192" width="120" height="30" rx="6" class="fb sb"/><text x="70" y="212" text-anchor="middle" font-size="12">no: threads</text>
    <rect x="170" y="192" width="120" height="30" rx="6" class="ft st"/><text x="230" y="212" text-anchor="middle" font-size="12">yes: asyncio</text>
    <rect x="350" y="192" width="140" height="30" rx="6" class="fv"/><text x="420" y="212" text-anchor="middle" font-size="12">pure: processes</text>
    <rect x="510" y="192" width="120" height="30" rx="6" class="fg sg"/><text x="570" y="212" text-anchor="middle" font-size="12">numpy: vectorise</text>
  </svg><figcaption>Profile, classify by the CPU/wall ratio, then decide by library support (waiting side) or by whether the work can be vectorised (computing side).</figcaption></figure>
  <table class="tbl">
    <tr><th>Your code mostly…</th><th>Example</th><th>Use</th><th>Why</th></tr>
    <tr><td>waits; tens to hundreds of tasks; blocking libraries</td><td>200 REST calls with <code>requests</code>, boto3 S3 downloads, a sync DB driver</td><td><strong>ThreadPoolExecutor</strong></td><td>waiting threads release the GIL; works with any library</td></tr>
    <tr><td>waits; thousands of tasks; async libraries exist</td><td>crawling 10,000 URLs, websockets, an async web API, many LLM calls</td><td><strong>asyncio</strong></td><td>a task costs KBs, a thread far more; no locks between awaits</td></tr>
    <tr><td>computes in pure Python</td><td>brute-force search, tokenising, log parsing, simulations</td><td><strong>ProcessPoolExecutor</strong></td><td>one GIL per process: every core works</td></tr>
    <tr><td>computes in numpy / pandas / PyTorch</td><td>matrix maths, groupby, a forward pass</td><td><strong>vectorise first</strong></td><td>C code is already fast, releases the GIL, often multi-core</td></tr>
    <tr><td>both waits and computes</td><td>fetch then featurise</td><td><strong>asyncio or threads + a process pool</strong></td><td>each stage gets its own tool (<code>run_in_executor</code> or a queue)</td></tr>
    <tr><td>tiny, fast tasks</td><td>summing a small list</td><td><strong>a plain loop</strong></td><td>pool overhead exceeds any gain</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p>Rule of thumb: <strong>waiting → concurrency (threads; asyncio when there are very many waits and async libraries); computing → parallelism (processes) or faster code (numpy)</strong>. Always measure: overhead can erase the gain on small jobs.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Choosing asyncio because it is modern while the code uses <code>requests</code>, <code>psycopg2</code> or another blocking library. Each blocking call inside <code>async def</code> freezes the loop, so you get asyncio's complexity at the speed of a plain loop. Use threads, or switch to async libraries end to end.</p></div>

  <h2 id="cc-traps"><span class="num">08</span>Common Mistakes</h2>
  <table class="tbl">
    <tr><th>Model</th><th>Mistake</th><th>Symptom</th><th>Fix / details</th></tr>
    <tr><td>Any</td><td>parallelising before profiling</td><td>no speed-up, or an overloaded database</td><td>measure CPU/wall, profile (section 03)</td></tr>
    <tr><td>Threads</td><td>threads for pure-Python calculation</td><td>4 threads as slow as 1</td><td>processes or numpy; <a class="xref" data-note="py_threading">Threads &amp; the GIL</a></td></tr>
    <tr><td>Threads</td><td>updating shared data without a lock</td><td>wrong totals that differ every run</td><td><code>Lock</code> or <code>queue.Queue</code>; <a class="xref" data-note="py_threading">Threads &amp; the GIL</a></td></tr>
    <tr><td>Processes</td><td>no <code>if __name__ == "__main__":</code>, or a lambda as the worker</td><td><code>RuntimeError</code> / <code>PicklingError</code></td><td>guard the entry point, use top-level functions; <a class="xref" data-note="py_multiprocessing">Processes</a></td></tr>
    <tr><td>Processes</td><td>thousands of tiny tasks, or huge arguments</td><td>slower than a plain loop</td><td><code>chunksize</code>, send paths not data; <a class="xref" data-note="py_multiprocessing">Processes</a></td></tr>
    <tr><td>Processes</td><td>a pool for I/O-bound work</td><td>only n waits overlap; high memory</td><td>threads or asyncio</td></tr>
    <tr><td>asyncio</td><td><code>time.sleep</code> / <code>requests.get</code> / heavy maths inside <code>async def</code></td><td>"concurrent" tasks run one at a time</td><td>async libraries, <code>to_thread</code>, process pool; <a class="xref" data-note="py_asyncio">asyncio</a></td></tr>
    <tr><td>asyncio</td><td><code>await</code> in a <code>for</code> loop</td><td>20 calls still take 4 s</td><td><code>gather</code> / <code>TaskGroup</code>; <a class="xref" data-note="py_asyncio">asyncio</a></td></tr>
  </table>

  <h2 id="cc-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Concurrency vs parallelism</h3>
  <ul>
    <li><strong>Concurrency</strong>: tasks in progress over overlapping periods, interleaved; possible on one core. Hides <em>waiting</em>.</li>
    <li><strong>Parallelism</strong>: tasks executing at the same instant on several cores. Shortens <em>computing</em>.</li>
    <li>CPython: threads, asyncio → concurrency; processes → parallelism.</li>
  </ul>
  <h3>I/O-bound vs CPU-bound</h3>
  <ul>
    <li>Measure <code>time.process_time()</code> (CPU) against <code>time.perf_counter()</code> (wall).</li>
    <li>CPU/wall ≈ 0% → I/O-bound (APIs, DB, disk, S3). ≈ 100% → CPU-bound (pure-Python loops, parsing).</li>
    <li>Profile first (<code>cProfile</code>); optimise the part that is actually slow.</li>
  </ul>
  <h3>The GIL</h3>
  <ul>
    <li>One mutex per CPython process; one thread executes bytecode at a time.</li>
    <li>Why: protects reference counts cheaply; simpler C extensions; fast single-threaded code.</li>
    <li>Released: blocking I/O, <code>sleep</code>, most numpy/pandas/hashlib/zlib C code. Held: pure-Python computation (handed over every <code>sys.getswitchinterval()</code> = 0.005 s).</li>
    <li>Not a thread-safety guarantee: <code>x += 1</code> on shared data can lose updates.</li>
    <li>Free-threaded build: PEP 703, <code>python3.13t</code> (experimental in 3.13, supported but opt-in from 3.14); check <code>sys._is_gil_enabled()</code>; slower single-thread, extensions must opt in.</li>
  </ul>
  <h3>The three models</h3>
  <table class="tbl">
    <tr><th></th><th>threading</th><th>multiprocessing</th><th>asyncio</th></tr>
    <tr><td>Best for</td><td>I/O, blocking libs</td><td>CPU, pure Python</td><td>many I/O waits, async libs</td></tr>
    <tr><td>Switching</td><td>preemptive (OS)</td><td>truly parallel</td><td>cooperative (<code>await</code>)</td></tr>
    <tr><td>Memory</td><td>shared</td><td>separate, pickled</td><td>shared, one thread</td></tr>
    <tr><td>Hazard</td><td>races, deadlocks</td><td>overhead, pickling, <code>__main__</code></td><td>blocking the loop</td></tr>
  </table>
  <p>Measured on 4 cores (approximate): I/O 20 × 0.2 s: sequential 4.0 s, threads 0.2 s, 4 processes 1.0 s, asyncio 0.2 s. CPU job: sequential ≈ 1.1 s, threads ≈ 1.3 s, 4 processes ≈ 0.45 s, asyncio ≈ 1.1 s.</p>
  <h3>concurrent.futures</h3>
  <div class="fx" data-lang="py">with ThreadPoolExecutor(max_workers=20) as ex:      # or ProcessPoolExecutor
    results = list(ex.map(fn, items))               # input order
    futs = [ex.submit(fn, x) for x in items]        # Future objects
    for f in as_completed(futs):                     # finish order
        f.result()                                   # value, or re-raises</div>
  <ul>
    <li>Default workers: threads <code>min(32, cpu_count + 4)</code>; processes <code>cpu_count</code>.</li>
    <li>asyncio bridge: <code>await loop.run_in_executor(pool, fn, *args)</code>, <code>await asyncio.to_thread(fn, *args)</code>.</li>
  </ul>
  <h3>Choosing</h3>
  <ul>
    <li>Waiting + blocking libraries → <code>ThreadPoolExecutor</code>.</li>
    <li>Waiting + thousands + async libraries → asyncio (<code>gather</code>/<code>TaskGroup</code> + <code>Semaphore</code>).</li>
    <li>Pure-Python CPU → <code>ProcessPoolExecutor</code> under <code>if __name__ == "__main__":</code>.</li>
    <li>numpy/pandas CPU → vectorise first.</li>
    <li>Mixed → asyncio/threads for I/O + process pool for CPU.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>Threads do not speed up pure-Python CPU work on the standard build.</li>
    <li>The GIL does not protect your read-modify-write sequences.</li>
    <li>Process pools: picklable top-level functions only; guard the entry point; batch tiny tasks.</li>
    <li>One blocking call inside <code>async def</code> stalls every task.</li>
    <li><code>await</code> in a loop is sequential.</li>
  </ul>

  <h2 id="cc-qa"><span class="num">09</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between concurrency and parallelism?</summary><div class="qa-body">Concurrency means several tasks are in progress over overlapping time periods, interleaved, which is possible on a single core. Parallelism means tasks execute at the same instant on multiple cores. Concurrency helps when tasks wait (I/O); only parallelism shortens pure computation. In CPython, threads and asyncio give concurrency, processes give parallelism.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the GIL?</summary><div class="qa-body">The Global Interpreter Lock is a mutex in CPython that allows only one thread per process to execute Python bytecode at a time. It protects the interpreter's internal state, mainly reference counts, without a lock per object. It is released during blocking I/O and in many C extensions, so threads still help I/O-bound work, but pure-Python CPU-bound threads cannot run in parallel.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does CPython have a GIL at all?</summary><div class="qa-body">Memory is managed by reference counting, and counts change on almost every operation. Making each increment and decrement thread-safe with fine-grained locks or atomics would slow down single-threaded code and complicate C extensions. One global lock was the simple, fast choice. Removing it (PEP 703) required biased reference counting, per-object locks and other changes, which is why the free-threaded build is opt-in.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does the GIL make Python code thread-safe?</summary><div class="qa-body">No. It guarantees only that one bytecode instruction runs at a time. <code>counter += 1</code> compiles to load, add and store, and a thread switch between the load and the store loses an update. Compound operations on shared data still need a <code>Lock</code>, or a design that avoids sharing (queues, per-thread data).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When is the GIL released?</summary><div class="qa-body">During blocking I/O (sockets, files, <code>time.sleep</code>, most DB drivers), and inside C code that explicitly releases it: most heavy numpy, pandas and PyTorch operations, <code>hashlib</code>, <code>zlib</code>. A thread running pure Python holds it and is asked to hand it over every switch interval (<code>sys.getswitchinterval()</code>, 5 ms by default).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you tell whether code is I/O-bound or CPU-bound?</summary><div class="qa-body">Compare CPU time (<code>time.process_time()</code>) with wall time (<code>time.perf_counter()</code>) around it, or look at a profiler and CPU usage. CPU/wall near 0% means it is mostly waiting (I/O-bound); near 100% means it is computing (CPU-bound). Then profile with <code>cProfile</code> to find which call dominates.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Threading vs multiprocessing vs asyncio: when would you use each?</summary><div class="qa-body">Threads: I/O-bound work with ordinary blocking libraries, tens to hundreds of tasks. Processes: CPU-bound pure-Python work that can be split into sizeable chunks with small inputs and outputs. asyncio: very many concurrent I/O waits (thousands of connections) when async libraries exist. For numeric work, vectorising with numpy usually beats all three.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Would 4 threads make a CPU-bound pure-Python function 4× faster on a 4-core machine?</summary><div class="qa-body">Not on the standard CPython build. Only one thread holds the GIL at a time, so they take turns; the total is about the same as sequential, often slightly worse because of lock hand-offs (measured here: 1.06 s sequential vs 1.27 s with 4 threads). A <code>ProcessPoolExecutor</code> with 4 workers gave about 2.5×. On a free-threaded build, threads could scale.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why not just use processes for everything?</summary><div class="qa-body">Each process is a whole interpreter: slow to start, megabytes of memory, and every argument and result must be pickled and copied. For I/O, waiting does not need a core, so 4 processes overlap only 4 waits (20 calls took about 1.0 s vs 0.2 s with threads). For tiny tasks, messaging overhead dominates. Processes are worth it only when work per task is large compared with that overhead.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>concurrent.futures</code> give you?</summary><div class="qa-body">A common <code>Executor</code> interface with two implementations, <code>ThreadPoolExecutor</code> and <code>ProcessPoolExecutor</code>: <code>submit</code> returns a <code>Future</code>, <code>map</code> returns results in input order, <code>as_completed</code> yields futures as they finish, and <code>Future.result()</code> re-raises worker exceptions in the caller. Switching between threads and processes is usually one word, and asyncio can await either through <code>run_in_executor</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a Future?</summary><div class="qa-body">A placeholder for the result of a call that has been scheduled but may not have finished. You can check <code>done()</code>, wait with <code>result(timeout)</code> (which returns the value or re-raises the exception), <code>cancel()</code> it if it has not started, or attach <code>add_done_callback</code>. asyncio has its own <code>asyncio.Future</code>, and a <code>Task</code> is a Future that drives a coroutine.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>executor.map</code> vs <code>submit</code> + <code>as_completed</code>?</summary><div class="qa-body"><code>map</code> yields results in input order and re-raises the first exception when you reach it, losing the rest of that loop. <code>submit</code> gives one Future per call; <code>as_completed</code> yields them in finish order, so you can process fast results first and handle each failure in its own <code>try</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Preemptive vs cooperative multitasking?</summary><div class="qa-body">Preemptive (threads): the OS or interpreter can switch threads at almost any point, so any shared-state update can be interrupted and needs a lock. Cooperative (asyncio): a task gives up control only at an <code>await</code>, so code between awaits runs without interruption, but a task that never awaits (a blocking call or a long computation) starves every other task.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can asyncio handle 10,000 connections when 10,000 threads would struggle?</summary><div class="qa-body">A thread is an OS object with its own stack (often reserving megabytes of virtual memory) and the OS must schedule all of them. A coroutine is a small Python object (a few KB) waiting in the event loop, which learns about ready sockets from the OS (epoll/kqueue/IOCP) and resumes only those tasks. The cost per waiting connection is far lower.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you speed up a slow CPU-bound loop in Python?</summary><div class="qa-body">Profile first. Then, in order: a better algorithm or data structure; vectorise with numpy/pandas (moves the loop into C, which also releases the GIL); compile hot code (Numba, Cython); then parallelise with <code>ProcessPoolExecutor</code> using big chunks and small inputs. Threads will not help on the standard build.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A pipeline downloads 5,000 files and then parses each one in pure Python. How would you structure it?</summary><div class="qa-body">Split the stages. Downloads are I/O-bound: a thread pool (or asyncio with an async client and a semaphore). Parsing is CPU-bound: a process pool. Connect them with futures or a queue so parsing starts while downloads continue, e.g. asyncio fetching and <code>run_in_executor(process_pool, parse, data)</code>. Pass file paths rather than large blobs to the processes to avoid pickling cost.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does numpy work benefit from threads?</summary><div class="qa-body">Often yes, or it does not need them. Heavy numpy operations run in C and release the GIL, so several threads can run them in parallel, and BLAS-backed operations such as matrix multiply already use several cores from one thread. Wrapping numpy in a process pool by reflex can oversubscribe cores (each worker's BLAS also spawns threads); set <code>OMP_NUM_THREADS=1</code> in workers if you do.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is free-threaded Python, and does it make the GIL question go away?</summary><div class="qa-body">PEP 703's optional CPython build without the GIL: experimental as <code>python3.13t</code>, officially supported but not the default from 3.14. Threads can then run Python bytecode in parallel. But single-threaded code is somewhat slower, every C extension must support it (otherwise the GIL is re-enabled at import), and races in your own code become more likely. For portable code today, processes remain the standard answer for CPU-bound Python.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Where do these models show up in ML and data work?</summary><div class="qa-body">Threads: parallel S3/API downloads, I/O prefetching. Processes: PyTorch <code>DataLoader(num_workers=…)</code>, scikit-learn and joblib <code>n_jobs</code>, parallel feature engineering. asyncio: <a class="xref" data-note="api_fastapi">FastAPI</a> endpoints, async DB drivers, calling LLM APIs for thousands of prompts with a semaphore, streaming consumers such as aiokafka.</div></details>
</main>
`
});
