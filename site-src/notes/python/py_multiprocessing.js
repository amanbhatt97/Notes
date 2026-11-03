// notes/python/py_multiprocessing.js — Processes: multiprocessing
Object.assign(TOPIC_CONTENT, {
  "py_multiprocessing": `<main>
<h1>Processes: multiprocessing</h1>
  <div class="where"><span>Python</span><span>Advanced Python</span><span>Concurrency</span><span>Processes</span></div>
  <p class="lead">The <code>multiprocessing</code> module and <code>ProcessPoolExecutor</code> run Python code in several separate processes. Each process has its own interpreter and its own GIL, so CPU-bound pure-Python work really runs on several cores at once. Threads cannot do that on standard CPython: 4 threads computing take as long as 1. The price is isolation. Processes share no memory, so every argument and result is pickled and copied, worker functions must be importable (no lambdas), the entry point needs <code>if __name__ == "__main__":</code>, and start-up and copying overhead can make a pool slower than a plain loop. You meet this in PyTorch <code>DataLoader(num_workers=…)</code>, scikit-learn and joblib <code>n_jobs</code>, and parallel feature engineering or parsing. Code was run on CPython 3.13 on Linux with 4 cores; timings vary between runs and are approximate.</p>

  <h2 id="mp-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">multiprocessing</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why processes</div>
        <ul>
          <li>Own interpreter, own GIL, own memory → <b>true parallelism</b></li>
          <li>Best speed-up ≈ number of cores, minus overhead</li>
          <li>A crash is isolated: non-zero <code>exitcode</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">APIs</div>
        <ul>
          <li><code>mp.Process(target=f, args=…)</code>, <code>start</code>, <code>join</code>, <code>exitcode</code></li>
          <li><code>mp.Pool(n)</code>: <code>map</code>, <code>imap</code>, <code>starmap</code>, <code>apply_async</code></li>
          <li><code>ProcessPoolExecutor</code>: <code>map</code>, <code>submit</code>, <code>as_completed</code></li>
          <li>Globals are NOT shared</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Rules</div>
        <ul>
          <li>Arguments and results are <b>pickled</b></li>
          <li>Functions pickle by name → top-level only, no lambdas</li>
          <li><code>if __name__ == "__main__":</code> (spawn re-imports the file)</li>
          <li>Start methods: fork, spawn, forkserver</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Costs</div>
        <ul>
          <li>Start-up: ~ms (fork) to ~10 ms+ (spawn) per process</li>
          <li>Per-task pickling: use <code>chunksize</code></li>
          <li>Big arguments: copied per task, per worker</li>
          <li>RAM: one interpreter per worker</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">IPC</div>
        <ul>
          <li><code>mp.Queue</code>: many ↔ many, poison pills</li>
          <li><code>mp.Pipe</code>: two ends</li>
          <li><code>Value</code> / <code>Array</code>: shared C numbers + lock</li>
          <li><code>shared_memory</code>: zero-copy buffer; <code>close</code> + <code>unlink</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">When not</div>
        <ul>
          <li>I/O-bound → threads / asyncio</li>
          <li>numpy / pandas → vectorise</li>
          <li>Tiny tasks, huge per-task data</li>
          <li>Nested parallelism → oversubscription</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mp-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Processes and the GIL: Real Parallelism</span><span class="rm-sub">CPU work on 4 cores, measured</span></div></div>
      <div class="rm-item rm-done" data-target="mp-process"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">multiprocessing.Process and Memory Isolation</span><span class="rm-sub">start, join, exitcode, copies</span></div></div>
      <div class="rm-item rm-done" data-target="mp-pool"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Process Pools: Pool and ProcessPoolExecutor</span><span class="rm-sub">map, starmap, submit</span></div></div>
      <div class="rm-item rm-done" data-target="mp-pickle"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Pickling, Start Methods and the __main__ Guard</span><span class="rm-sub">fork, spawn, forkserver</span></div></div>
      <div class="rm-item rm-done" data-target="mp-cost"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Overhead: Start-up, chunksize and Data Copying</span><span class="rm-sub">When pools lose to loops</span></div></div>
      <div class="rm-item rm-done" data-target="mp-ipc"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Inter-Process Communication: Queue and Pipe</span><span class="rm-sub">Message passing, poison pills</span></div></div>
      <div class="rm-item rm-done" data-target="mp-shared"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Shared Memory: Value, Array and shared_memory</span><span class="rm-sub">Zero-copy, locks return</span></div></div>
      <div class="rm-item rm-done" data-target="mp-when"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">When Not to Use Processes</span><span class="rm-sub">I/O, tiny tasks, numpy</span></div></div>
      <div class="rm-item rm-done" data-target="mp-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Symptom and fix</span></div></div>
      <div class="rm-item rm-done" data-target="mp-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">APIs, rules, costs, IPC</span></div></div>
      <div class="rm-item rm-done" data-target="mp-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">Processes vs threads, pickling, guard</span></div></div>
    </div>
  </div>

  <h2 id="mp-why"><span class="num">01</span>Processes and the GIL: Real Parallelism</h2>
  <p>The GIL is one lock per interpreter, so threads in one Python process can only take turns at running Python code. A <strong>process</strong> is a separate running program with its own memory, and each new Python process has its own interpreter and therefore its own GIL. Start several and the OS runs them on different cores at the same instant. The examples use this helper module; <code>route_cost</code> is the CPU-bound job, a brute-force search over all 9! = 362,880 orderings of 9 points.</p>
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
  <p>The same 4 searches, first in a loop, then in a <code>ProcessPoolExecutor</code> with 4 workers. Each job also returns <code>os.getpid()</code>, the OS process ID it ran in. The pool code sits under <code>if __name__ == "__main__":</code> (section 04 explains why that is required).</p>
  <div class="fx" data-lang="py">import os, time
from concurrent.futures import ProcessPoolExecutor
from workload import RIDERS, route_cost

def plan(i):                                   # runs inside a worker process
    return route_cost(RIDERS[i]), os.getpid()

if __name__ == "__main__":
    t = time.perf_counter()
    costs = [route_cost(s) for s in RIDERS]
    print(f"sequential : {costs} in {time.perf_counter() - t:.2f}s")

    t = time.perf_counter()
    with ProcessPoolExecutor(max_workers=4) as ex:
        out = list(ex.map(plan, range(4)))
    print(f"4 processes: {[c for c, _ in out]} in {time.perf_counter() - t:.2f}s")
    pids = {pid for _, pid in out}
    print(f"worker pids all differ from main: {os.getpid() not in pids}, distinct workers used: {len(pids)}")</div>
  <div class="fx" data-lang="text">sequential : [40, 36, 35, 36] in 1.18s
4 processes: [40, 36, 35, 36] in 0.34s
worker pids all differ from main: True, distinct workers used: 4</div>
  <p>About 3.5× faster with identical answers, and the PIDs show the work ran in 4 different processes, none of them the parent. Threads gave no speed-up on the same job (<a class="xref" data-note="py_threading">Threads &amp; the GIL</a>). The ratio is below 4 because starting processes and sending each its job costs time, the jobs are not exactly equal, and other programs share the cores. It approaches the core count for long jobs on idle cores and never exceeds it.</p>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
    <defs><marker id="mp-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="60" width="180" height="70" rx="8" class="fb sb"/><text x="22" y="82">Main process</text><text x="22" y="100" class="tm">interpreter + GIL</text><text x="22" y="116" class="tm">own memory</text>
    <rect x="420" y="10" width="170" height="62" rx="8" class="ft st"/><text x="432" y="32">Worker 1 · core 1</text><text x="432" y="52" class="tm">own GIL + memory</text>
    <rect x="420" y="118" width="170" height="62" rx="8" class="ft st"/><text x="432" y="140">Worker 2 · core 2</text><text x="432" y="160" class="tm">own GIL + memory</text>
    <line x1="190" y1="70" x2="416" y2="38" stroke="currentColor" stroke-width="1.5" marker-end="url(#mp-ah2)"/>
    <line x1="190" y1="120" x2="416" y2="152" stroke="currentColor" stroke-width="1.5" marker-end="url(#mp-ah2)"/>
    <text x="200" y="28" class="tm">arguments/results: pickled</text>
    <rect x="245" y="75" width="140" height="42" rx="6" class="fv"/><text x="257" y="93">shared memory</text><text x="257" y="110" class="tm">no copy (section 07)</text>
    <line x1="385" y1="96" x2="420" y2="66" stroke="currentColor" stroke-dasharray="3 3"/><line x1="385" y1="96" x2="420" y2="124" stroke="currentColor" stroke-dasharray="3 3"/>
  </svg><figcaption>Separate programs, each with its own GIL and memory. Data crosses between them as pickled messages (solid arrows) or, for large arrays, through an explicitly shared memory block (dashed).</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>process</strong> is an independent running program with its own address space, scheduled by the OS. Each Python process runs its own interpreter with its own GIL, so CPU-bound Python code in <em>n</em> processes can use up to <em>n</em> cores. Best-case speed-up ≈ number of cores, minus overhead.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>More processes than cores for CPU work. 16 processes on 4 cores do not compute faster than 4; they take turns and use 4× the memory. <code>ProcessPoolExecutor()</code> defaults to <code>os.cpu_count()</code>; in containers check the CPU quota (<code>os.process_cpu_count()</code> in 3.13+ respects affinity) and use fewer on shared machines.</p></div>

  <h2 id="mp-process"><span class="num">02</span>multiprocessing.Process and Memory Isolation</h2>
  <p><code>multiprocessing.Process</code> mirrors <code>threading.Thread</code>: <code>Process(target=f, args=(…,))</code>, <code>start()</code>, <code>join()</code>, plus <code>exitcode</code> (0 = normal exit) and <code>is_alive()</code>. The key difference is memory: the child works on its own copy of the program's state, so changes it makes are invisible to the parent.</p>
  <div class="fx" data-lang="py">import multiprocessing as mp
from workload import fetch_menu

counter = 0                                    # a global in the parent

def child(rid):
    global counter
    result = fetch_menu(rid)
    counter += 1                               # changes the CHILD's copy
    print(f"child  [{mp.current_process().name}] got {result}, counter = {counter}")

if __name__ == "__main__":
    p = mp.Process(target=child, args=("R01",), name="worker-1")
    print("parent: alive before start?", p.is_alive())
    p.start()                                  # a new Python process begins
    p.join()                                   # wait for it to exit
    print("parent: exitcode", p.exitcode, "| parent's counter =", counter)</div>
  <div class="fx" data-lang="text">parent: alive before start? False
child  [worker-1] got {'id': 'R01', 'dishes': 4}, counter = 1
parent: exitcode 0 | parent's counter = 0</div>
  <p>The child saw <code>counter = 1</code>; the parent still had 0 after the child finished. The child's <code>+= 1</code> changed the child's copy, which disappeared when it exited. Nothing flows back unless you send it: a return value through a pool, a <code>Queue</code>, a <code>Pipe</code>, or shared memory.</p>
  <table class="tbl"><caption>Thread vs process</caption>
    <tr><th></th><th>Thread</th><th>Process</th></tr>
    <tr><td>Memory</td><td>shared with all threads</td><td>own copy; nothing shared by default</td></tr>
    <tr><td>GIL</td><td>one for all threads</td><td>one per process</td></tr>
    <tr><td>CPU-bound Python</td><td>no speed-up</td><td>up to × cores</td></tr>
    <tr><td>Results back</td><td>write to a shared variable</td><td>return value via pool, Queue, Pipe, shared memory</td></tr>
    <tr><td>Start-up cost</td><td>tiny</td><td>noticeable (section 05)</td></tr>
    <tr><td>A crash</td><td>can corrupt shared state; segfault kills everything</td><td>isolated; parent sees a non-zero <code>exitcode</code></td></tr>
    <tr><td>Races</td><td>on any shared variable</td><td>only on what you explicitly share</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Process isolation</strong>: each process has its own address space; changes in one are invisible to others. Data moves between processes only through <strong>IPC</strong> (inter-process communication): return values, queues, pipes, shared memory, files, sockets. <code>p.terminate()</code> / <code>p.kill()</code> can stop a process from outside, unlike a thread (but skip its cleanup).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Expecting a child to fill a global list or dict, as threads can. The parent's copy stays empty and no error says so. Return the result instead.</p></div>

  <h2 id="mp-pool"><span class="num">03</span>Process Pools: Pool and ProcessPoolExecutor</h2>
  <p>Managing processes one by one is fiddly. A <strong>pool</strong> keeps a fixed set of worker processes, sends them jobs from an internal queue and pickles the return values back. There are two APIs: the older <code>multiprocessing.Pool</code> (<code>map</code>, <code>imap</code>, <code>imap_unordered</code>, <code>starmap</code>, <code>apply_async</code>) and <code>concurrent.futures.ProcessPoolExecutor</code>, which has exactly the interface of <code>ThreadPoolExecutor</code>.</p>
  <div class="fx" data-lang="py">import multiprocessing as mp
from concurrent.futures import ProcessPoolExecutor, as_completed
from workload import RIDERS, route_cost

if __name__ == "__main__":
    with mp.Pool(processes=4) as pool:                 # the older API
        print("Pool.map            :", pool.map(route_cost, RIDERS))
        print("Pool.starmap        :", pool.starmap(pow, [(2, 3), (3, 2)]))
    with ProcessPoolExecutor(max_workers=4) as ex:     # same interface as ThreadPoolExecutor
        print("Executor.map        :", list(ex.map(route_cost, RIDERS)))
        futs = {ex.submit(route_cost, s): n for n, s in enumerate(RIDERS, start=1)}
        print("submit+as_completed :", sorted((futs[f], f.result()) for f in as_completed(futs)))</div>
  <div class="fx" data-lang="text">Pool.map            : [40, 36, 35, 36]
Pool.starmap        : [8, 9]
Executor.map        : [40, 36, 35, 36]
submit+as_completed : [(1, 40), (2, 36), (3, 35), (4, 36)]</div>
  <p>Both <code>map</code>s return results in input order. <code>starmap</code> unpacks each tuple into arguments (<code>pow(2, 3)</code>, <code>pow(3, 2)</code>). With <code>submit</code> we kept a dict from each future to its input and sorted, because <code>as_completed</code> yields in finish order. Leaving each <code>with</code> block shuts the pool down.</p>
  <table class="tbl">
    <tr><th></th><th><code>mp.Pool</code></th><th><code>ProcessPoolExecutor</code></th></tr>
    <tr><td>Interface</td><td><code>map</code>, <code>imap</code>, <code>imap_unordered</code>, <code>starmap</code>, <code>apply_async</code></td><td><code>map</code>, <code>submit</code> → Future, <code>as_completed</code>, <code>wait</code></td></tr>
    <tr><td>Default <code>chunksize</code> for <code>map</code></td><td>computed automatically</td><td>1 (set it yourself)</td></tr>
    <tr><td>Worker crash</td><td>can hang waiting for a result</td><td>raises <code>BrokenProcessPool</code></td></tr>
    <tr><td>Fits with</td><td>older code</td><td><code>ThreadPoolExecutor</code>, asyncio's <code>run_in_executor</code></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Process pool</strong>: a fixed set of worker processes fed from a job queue. <code>ProcessPoolExecutor(max_workers=n, mp_context=None, initializer=None, initargs=(), max_tasks_per_child=None)</code>; <code>initializer</code> runs once per worker (e.g. load a model or open a file), <code>max_tasks_per_child</code> recycles workers to contain memory leaks.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Creating a new pool inside a loop or per request. Each pool starts fresh processes (section 05 measures the cost). Create one pool and reuse it.</p></div>

  <h2 id="mp-pickle"><span class="num">04</span>Pickling, Start Methods and the __main__ Guard</h2>
  <p>Two processes cannot read each other's memory, so everything sent to a worker (the function and its arguments) and everything sent back (the result) is serialised with <code>pickle</code>, pushed through an OS pipe and rebuilt on the other side.</p>
  <div class="fx" data-lang="py">import pickle
from workload import route_cost

record = {"id": "R01", "dishes": 4}
data = pickle.dumps(record)                    # object -&gt; bytes
print(len(data), "bytes:", data[:24], "...")
print("bytes -&gt; object:", pickle.loads(data))
print("a function travels BY NAME:", pickle.dumps(route_cost))
try:
    pickle.dumps(lambda stops: route_cost(stops))
except Exception as e:
    print(type(e).__name__ + ":", e)</div>
  <div class="fx" data-lang="text">38 bytes: b'\\x80\\x04\\x95\\x1b\\x00\\x00\\x00\\x00\\x00\\x00\\x00}\\x94(\\x8c\\x02id\\x94\\x8c\\x03R01' ...
bytes -&gt; object: {'id': 'R01', 'dishes': 4}
a function travels BY NAME: b'\\x80\\x04\\x95\\x1b\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x8c\\x08workload\\x94\\x8c\\nroute_cost\\x94\\x93\\x94.'
PicklingError: Can't pickle &lt;function &lt;lambda&gt; at 0x7f7b1efe71a0&gt;: attribute lookup &lt;lambda&gt; on __main__ failed</div>
  <p>The dict became 38 bytes and came back equal. The function's pickle contains only two names, <code>workload</code> and <code>route_cost</code>: <strong>functions and classes are pickled by reference</strong> ("import <code>workload</code>, take <code>route_cost</code>"), and the worker rebuilds them by importing. A lambda has no importable name, so it cannot be pickled, and neither can it be sent to a pool:</p>
  <div class="fx" data-lang="py">from concurrent.futures import ProcessPoolExecutor
from workload import RIDERS, route_cost

if __name__ == "__main__":
    with ProcessPoolExecutor(max_workers=2) as ex:
        try:
            print(list(ex.map(lambda s: route_cost(s), RIDERS[:2])))
        except Exception as e:
            print(type(e).__name__ + ":", e)</div>
  <div class="fx" data-lang="text">PicklingError: Can't pickle &lt;function &lt;lambda&gt; at 0x7f51f0fddda0&gt;: attribute lookup &lt;lambda&gt; on __main__ failed</div>
  <p>Rule: <strong>the worker function must be defined at module top level</strong>, so not a lambda, not a nested function, not a bound method of an unpicklable object. Arguments and results must be picklable too. Numbers, strings, lists, dicts, dataclasses and numpy arrays are; open files, sockets, locks, DB connections and generators are not. <code>functools.partial(top_level_fn, x=1)</code> is picklable and is the usual way to pass fixed extra arguments.</p>
  <h3>Start methods</h3>
  <ul>
    <li><strong>fork</strong>: the child is a copy of the parent at that moment, functions and all. Fast. Was the default on Linux up to 3.13 (printed below). Unsafe if the parent has threads (a lock held by another thread is copied in the locked state).</li>
    <li><strong>spawn</strong>: the child is a fresh interpreter that <em>imports your main module</em> to find the functions. Slower, safer. Default on macOS and Windows.</li>
    <li><strong>forkserver</strong>: a clean single-threaded server process forks children on request. Default on Linux from 3.14.</li>
  </ul>
  <h3>Why <code>if __name__ == "__main__":</code> is required</h3>
  <p>With spawn, a child runs your file from the top with <code>__name__</code> set to <code>"__mp_main__"</code>. The script below prints a line at the top, then starts two spawned children one after another:</p>
  <div class="fx" data-lang="py">import multiprocessing as mp

print(f"top of the file runs, __name__ = {__name__!r}")

def work(n):
    print(f"   worker handles job {n}")

if __name__ == "__main__":
    print("default start method here:", mp.get_start_method())
    ctx = mp.get_context("spawn")              # how macOS and Windows start children
    kids = [ctx.Process(target=work, args=(n,)) for n in (1, 2)]
    for k in kids:
        k.start(); k.join()                    # one at a time, so the output is in order</div>
  <div class="fx" data-lang="text">top of the file runs, __name__ = '__main__'
default start method here: fork
top of the file runs, __name__ = '__mp_main__'
   worker handles job 1
top of the file runs, __name__ = '__mp_main__'
   worker handles job 2</div>
  <p>The top line ran three times: in the parent and in each child, before the child ran <code>work</code>. Code under the guard ran only in the parent. Now remove the guard so the pool is created at top level:</p>
  <div class="fx" data-lang="py">import multiprocessing as mp
from concurrent.futures import ProcessPoolExecutor

def square(x):
    return x * x

print(f"top of the file runs, __name__ = {__name__!r}")
ctx = mp.get_context("spawn")
with ProcessPoolExecutor(max_workers=2, mp_context=ctx) as ex:   # NO guard
    print(list(ex.map(square, [1, 2, 3])))</div>
  <div class="fx" data-lang="text">top of the file runs, __name__ = '__main__'
top of the file runs, __name__ = '__mp_main__'
   [... traceback lines trimmed ...]
RuntimeError:
        An attempt has been made to start a new process before the
        current process has finished its bootstrapping phase.
   [... traceback lines trimmed ...]
top of the file runs, __name__ = '__mp_main__'
   [... traceback lines trimmed ...]
RuntimeError:
        An attempt has been made to start a new process before the
        current process has finished its bootstrapping phase.
   [... traceback lines trimmed ...]
concurrent.futures.process.BrokenProcessPool: A process in the process pool was terminated abruptly while the future was running or pending.</div>
  <p>Each child re-ran the file, reached the pool code and tried to start processes of its own while still bootstrapping. <code>multiprocessing</code> detects that and raises <code>RuntimeError</code> in the child (its full message tells you to use the <code>__main__</code> idiom), and the parent's pool reports <code>BrokenProcessPool</code>. With fork the same script happens to work on Linux, which is why code written on Linux breaks on macOS, Windows, or Linux with Python 3.14. Always use the guard.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Pickling</strong>: serialising an object to bytes (<code>pickle.dumps</code>) and back (<code>pickle.loads</code>); functions and classes pickle by module + qualified name. <strong>Start method</strong>: <code>fork</code>, <code>spawn</code> or <code>forkserver</code>; query with <code>mp.get_start_method()</code>, choose with <code>mp.get_context("spawn")</code> or <code>mp.set_start_method</code> (once, under the guard). <strong>The guard</strong> keeps process-creating code from running when a child imports the main module.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Process pools in Jupyter on macOS/Windows (spawn): functions defined in the notebook live in <code>__main__</code>, which the child cannot import, so you get pickling or <code>AttributeError</code>s. Put the worker function in a <code>.py</code> module and import it.</p></div>

  <h2 id="mp-cost"><span class="num">05</span>Overhead: Start-up, chunksize and Data Copying</h2>
  <p>Processes are not free. Three costs decide whether a pool helps: starting the workers, one pickled message per task, and copying the data each task needs.</p>
  <h3>Starting processes</h3>
  <div class="fx" data-lang="py">import threading, multiprocessing as mp, time

def nothing():
    pass

if __name__ == "__main__":
    for kind, make in (("thread", threading.Thread), ("process", mp.Process)):
        t = time.perf_counter()
        workers = [make(target=nothing) for _ in range(20)]
        for w in workers: w.start()
        for w in workers: w.join()
        print(f"start + join 20 {kind:&lt;7}: {(time.perf_counter() - t) * 1000:6.1f} ms")
    ctx = mp.get_context("spawn")
    t = time.perf_counter()
    workers = [ctx.Process(target=nothing) for _ in range(20)]
    for w in workers: w.start()
    for w in workers: w.join()
    print(f"start + join 20 spawned: {(time.perf_counter() - t) * 1000:6.1f} ms")</div>
  <div class="fx" data-lang="text">start + join 20 thread :    2.8 ms
start + join 20 process:   22.0 ms
start + join 20 spawned:  296.1 ms</div>
  <p>20 forked processes cost about 8× as much as 20 threads, and 20 spawned processes about 100×, because each spawned child boots a fresh interpreter and re-imports your modules (heavy imports like pandas or torch make this much worse). That is negligible next to a job of several seconds, but it is why you create one pool and reuse it.</p>
  <h3>One message per task, and chunksize</h3>
  <p>5000 copies of a tiny 3-stop problem; each takes microseconds. By default <code>ProcessPoolExecutor.map</code> sends each item as its own message: pickle, send, unpickle, compute, pickle the result, send back, 5000 times. <code>chunksize=k</code> sends k items per message.</p>
  <div class="fx" data-lang="py">import time
from concurrent.futures import ProcessPoolExecutor
from workload import route_cost

TINY = [[(2, 1), (5, 3), (1, 4)]] * 5000       # 5000 copies of a 3-stop problem

if __name__ == "__main__":
    t = time.perf_counter()
    seq = [route_cost(s) for s in TINY]
    print(f"sequential          : {time.perf_counter() - t:.2f}s  (each answer {seq[0]})")
    for chunk in (1, 50, 1250):
        t = time.perf_counter()
        with ProcessPoolExecutor(max_workers=4) as ex:
            out = list(ex.map(route_cost, TINY, chunksize=chunk))
        print(f"4 procs chunksize={chunk:&lt;4}: {time.perf_counter() - t:.2f}s  same answers: {out == seq}")</div>
  <div class="fx" data-lang="text">sequential          : 0.01s  (each answer 12)
4 procs chunksize=1   : 0.92s  same answers: True
4 procs chunksize=50  : 0.04s  same answers: True
4 procs chunksize=1250: 0.02s  same answers: True</div>
  <p>With one item per message the pool was about 100× <em>slower</em> than the loop: messaging dwarfed the work. <code>chunksize=50</code> (100 messages instead of 5000) brought it to 0.04 s, and 1250 (one chunk per worker) to 0.02 s. Still not faster than the loop, because the whole job was too small to be worth parallelising. Batch tiny tasks, and do not parallelise work that is already fast.</p>
  <h3>Copying data</h3>
  <p>Sending a 2-million-element list to a worker means pickling about 10 MB, pushing it through a pipe and unpickling it. Compare that with sending a single number:</p>
  <div class="fx" data-lang="py">import pickle, time
from concurrent.futures import ProcessPoolExecutor

ROWS = list(range(2_000_000))                  # a large in-memory dataset

def count_given(rows):                         # data travels with the call
    return len(rows)

def count_own(n):                              # only a small number travels
    return n

if __name__ == "__main__":
    t = time.perf_counter()
    size = len(pickle.dumps(ROWS))
    print(f"pickled size: {size / 1e6:.1f} MB, pickling alone took {time.perf_counter() - t:.3f}s")
    with ProcessPoolExecutor(max_workers=1) as ex:
        ex.submit(count_own, 1).result()       # warm up: start the worker first
        t = time.perf_counter()
        ex.submit(count_given, ROWS).result()
        print(f"send the list : {time.perf_counter() - t:.3f}s")
        t = time.perf_counter()
        ex.submit(count_own, 2_000_000).result()
        print(f"send just 'n' : {time.perf_counter() - t:.3f}s")</div>
  <div class="fx" data-lang="text">pickled size: 9.9 MB, pickling alone took 0.027s
send the list : 0.197s
send just 'n' : 0.014s</div>
  <p>The worker was warmed up first so only the transfer is timed. Sending the list took more than 10× as long as sending a number (it ranged from about 0.16 s to 0.8 s across runs), and in a real pool every task that receives it pays again and every worker holds a copy in RAM. Send small descriptions instead, such as a file path, a row range or an ID, and let each worker load its own slice. Alternatively, use shared memory (section 07) or an <code>initializer</code> that loads the data once per worker.</p>
  <table class="tbl"><caption>Where the time goes</caption>
    <tr><th>Cost</th><th>Measured here</th><th>Mitigation</th></tr>
    <tr><td>Start-up</td><td>20 processes: ≈ 22 ms (fork), ≈ 300 ms (spawn)</td><td>one long-lived pool</td></tr>
    <tr><td>Per-task messaging</td><td>5000 tiny tasks: 0.92 s vs loop 0.01 s</td><td><code>chunksize</code>, bigger tasks</td></tr>
    <tr><td>Data copying</td><td>9.9 MB argument: ≈ 0.2 s vs 0.014 s</td><td>pass paths/ranges, shared memory, <code>initializer</code></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p>A pool pays off only when <strong>work per task ≫ overhead per task</strong> (pickling arguments and results plus messaging) and total work ≫ pool start-up. <strong>chunksize</strong> spreads the per-message overhead over many items.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Passing a large pandas DataFrame to every task. Pickling can cost more than the work, and each worker holds a copy (4 workers × a 2 GB frame = 8 GB). Pass paths or index ranges.</p></div>

  <h2 id="mp-ipc"><span class="num">06</span>Inter-Process Communication: Queue and Pipe</h2>
  <p>Pools are request/response: send a job, get a result. Long-running workers that exchange a stream of messages with the parent use explicit channels. Both channels below pickle each message.</p>
  <h3>multiprocessing.Queue</h3>
  <p><code>mp.Queue</code> has the <code>queue.Queue</code> interface (<code>put</code>, <code>get</code>), but each item is pickled and sent through a pipe to whichever process calls <code>get</code>. Two workers take jobs from <code>tasks</code>, put results on <code>results</code>, and stop at a <code>None</code> pill.</p>
  <div class="fx" data-lang="py">import multiprocessing as mp
from workload import RIDERS, route_cost

def worker(tasks, results):
    while (job := tasks.get()) is not None:    # None = poison pill
        n, stops = job
        results.put((n, route_cost(stops), mp.current_process().name))

if __name__ == "__main__":
    tasks, results = mp.Queue(), mp.Queue()
    procs = [mp.Process(target=worker, args=(tasks, results), name=f"worker-{i}") for i in (1, 2)]
    for p in procs: p.start()
    for n, stops in enumerate(RIDERS, start=1):
        tasks.put((n, stops))
    for _ in procs: tasks.put(None)            # one pill per worker
    out = sorted(results.get() for _ in RIDERS)  # drain BEFORE joining
    for p in procs: p.join()
    for n, cost, who in out:
        print(f"job {n}: cost {cost}  (by {who})")</div>
  <div class="fx" data-lang="text">job 1: cost 40  (by worker-1)
job 2: cost 36  (by worker-2)
job 3: cost 35  (by worker-2)
job 4: cost 36  (by worker-1)</div>
  <p>Which worker took which job varies between runs, so the results are sorted. All results are read <em>before</em> joining: a process that has put items on a queue may not exit until they have been flushed, so joining first can deadlock.</p>
  <h3>multiprocessing.Pipe</h3>
  <p><code>mp.Pipe()</code> returns two connected <code>Connection</code> objects; whatever is <code>send</code>-ed on one end is <code>recv</code>-ed on the other, in both directions by default.</p>
  <div class="fx" data-lang="py">import multiprocessing as mp
from workload import route_cost

def child(conn):
    stops = conn.recv()                        # wait for a message
    conn.send(route_cost(stops))               # answer on the same pipe
    conn.close()

if __name__ == "__main__":
    here, there = mp.Pipe()                    # two connected ends
    p = mp.Process(target=child, args=(there,)); p.start()
    here.send([(2, 1), (5, 3), (1, 4)])
    print("child says the best route costs", here.recv())
    p.join()</div>
  <div class="fx" data-lang="text">child says the best route costs 12</div>
  <table class="tbl">
    <tr><th>Channel</th><th>Shape</th><th>Cost</th><th>Use for</th></tr>
    <tr><td><code>mp.Queue</code></td><td>many producers ↔ many consumers</td><td>pickle per item; background feeder thread</td><td>work queues, collecting results</td></tr>
    <tr><td><code>mp.Pipe</code></td><td>exactly two ends, duplex</td><td>pickle; a little faster than Queue</td><td>parent ↔ one child conversation</td></tr>
    <tr><td><code>Value</code> / <code>Array</code></td><td>typed C values in shared memory</td><td>no pickling; needs a lock</td><td>counters, flags, small arrays</td></tr>
    <tr><td><code>shared_memory</code></td><td>raw named buffer</td><td>zero-copy</td><td>large numpy arrays read by many workers</td></tr>
    <tr><td><code>Manager()</code></td><td>proxy objects (dict, list) in a server process</td><td>every access is an IPC round trip: slow</td><td>convenience, small shared state</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>mp.Queue</strong>: process-safe FIFO built on a pipe plus locks; items are pickled. <strong>mp.Pipe(duplex=True)</strong>: a pair of connections with <code>send</code>, <code>recv</code>, <code>poll</code>, <code>close</code>. Both are <strong>message passing</strong>: processes exchange copies, not shared variables.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Joining a worker before draining its output queue, or giving one worker no pill: both hang with no error. Drain first, then join; one pill per worker.</p></div>

  <h2 id="mp-shared"><span class="num">07</span>Shared Memory: Value, Array and shared_memory</h2>
  <p>When copying is too expensive, as with a counter updated thousands of times or a large array many workers read, processes can map the same piece of memory. That removes the copying and brings back the race conditions of threads.</p>
  <h3>Value and Array</h3>
  <p><code>mp.Value("i", 0)</code> is one C int in shared memory (<code>"d"</code> for a double); <code>mp.Array("i", 4)</code> is four. Both carry a lock, <code>get_lock()</code>. Four processes each add 50,000, without and with the lock; then four children each write one slot of an Array.</p>
  <div class="fx" data-lang="py">import multiprocessing as mp

def count_views(v, n, use_lock):
    for _ in range(n):
        if use_lock:
            with v.get_lock():                 # Value carries its own lock
                v.value += 1
        else:
            v.value += 1                       # read ... add ... write, across processes

def fill(slots, i, cost):
    slots[i] = cost                            # each child writes its own slot

if __name__ == "__main__":
    for use_lock in (False, True):
        v = mp.Value("i", 0)                   # "i" = C int, lives in shared memory
        ps = [mp.Process(target=count_views, args=(v, 50_000, use_lock)) for _ in range(4)]
        for p in ps: p.start()
        for p in ps: p.join()
        print(f"Value, lock={use_lock!s:&lt;5}: {v.value} / 200000")
    slots = mp.Array("i", 4)                   # 4 shared ints, all 0
    ps = [mp.Process(target=fill, args=(slots, i, c)) for i, c in enumerate([40, 36, 35, 36])]
    for p in ps: p.start()
    for p in ps: p.join()
    print("Array after children:", list(slots))</div>
  <div class="fx" data-lang="text">Value, lock=False: 83645 / 200000
Value, lock=True : 200000 / 200000
Array after children: [40, 36, 35, 36]</div>
  <p>Without the lock, less than half the updates survived. These processes run truly in parallel with no GIL between them, so <code>v.value += 1</code> (read, add, write) interleaves freely. With <code>with v.get_lock():</code> it is exactly 200,000. The Array needed no lock because each child wrote only its own slot.</p>
  <h3>shared_memory for numpy arrays</h3>
  <p><code>multiprocessing.shared_memory.SharedMemory</code> creates a named block of raw bytes. Any process can attach by name and view it as a numpy array; nothing is pickled or copied.</p>
  <div class="fx" data-lang="py">import multiprocessing as mp
from multiprocessing import shared_memory
import numpy as np

def add_ten(name, shape):
    shm = shared_memory.SharedMemory(name=name)               # attach by name
    arr = np.ndarray(shape, dtype=np.float64, buffer=shm.buf)
    arr += 10                                                 # in place: no copy, no pickling
    del arr
    shm.close()

if __name__ == "__main__":
    shm = shared_memory.SharedMemory(create=True, size=4 * 8)  # room for 4 float64
    arr = np.ndarray((4,), dtype=np.float64, buffer=shm.buf)
    arr[:] = [40, 36, 35, 36]
    p = mp.Process(target=add_ten, args=(shm.name, arr.shape)); p.start(); p.join()
    print("parent sees after child:", arr)
    del arr
    shm.close(); shm.unlink()                                  # free the block once</div>
  <div class="fx" data-lang="text">parent sees after child: [50. 46. 45. 46.]</div>
  <p>The child modified the parent's array directly. Cleanup rules: every process calls <code>close()</code> when done (after deleting numpy views into the buffer), and exactly one process calls <code>unlink()</code> at the end to free the block.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Value(typecode, init)</strong> / <strong>Array(typecode, size)</strong>: ctypes objects in shared memory with an associated lock (<code>get_lock()</code>). <strong>SharedMemory(create=True, size=…)</strong> / <strong>SharedMemory(name=…)</strong>: a named block; <code>.buf</code> is a memoryview; <code>close()</code> per process, <code>unlink()</code> once. Shared memory removes copying but re-introduces races: coordinate writers.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Forgetting <code>unlink()</code> (on Linux the block lives in <code>/dev/shm</code> until reboot) or calling it while others still use the block. And treating <code>v.value += 1</code> as safe: it lost more than half the updates above.</p></div>

  <h2 id="mp-when"><span class="num">08</span>When Not to Use Processes</h2>
  <p>Processes pay off for CPU-bound pure-Python work split into sizeable tasks with small inputs and outputs. Many jobs that look like candidates are faster without them. One more measurement: the sum of i² for i below 2 million, in pure Python, in pure Python over 4 processes, and in numpy.</p>
  <div class="fx" data-lang="py">import time
import numpy as np
from concurrent.futures import ProcessPoolExecutor

N = 2_000_000
def part(bounds):
    lo, hi = bounds
    return sum(i * i for i in range(lo, hi))

if __name__ == "__main__":
    t = time.perf_counter(); a = part((0, N))
    print(f"pure Python, 1 process : {time.perf_counter() - t:.3f}s")
    t = time.perf_counter()
    with ProcessPoolExecutor(max_workers=4) as ex:
        b = sum(ex.map(part, [(k * N // 4, (k + 1) * N // 4) for k in range(4)]))
    print(f"pure Python, 4 processes: {time.perf_counter() - t:.3f}s")
    x = np.arange(N, dtype=np.int64)           # the data already lives in an array
    t = time.perf_counter(); c = int(x @ x)    # sum of x*x, done in C
    print(f"numpy, 1 process        : {time.perf_counter() - t:.3f}s")
    print("same answer:", a == b == c)</div>
  <div class="fx" data-lang="text">pure Python, 1 process : 0.112s
pure Python, 4 processes: 0.055s
numpy, 1 process        : 0.002s
same answer: True</div>
  <p>Four processes halved the pure-Python time (pool start-up ate the rest of the gain on a job this short). numpy in one process was about 25× faster than the 4 processes, because it runs the loop in compiled C with no Python object per number. Vectorise first; parallelise what cannot be vectorised.</p>
  <table class="tbl"><caption>When processes lose</caption>
    <tr><th>Situation</th><th>Why</th><th>Use instead</th></tr>
    <tr><td>I/O-bound work</td><td>waiting needs no core; n processes overlap only n waits (20 × 0.2 s calls: 4 processes ≈ 1.0 s, 20 threads ≈ 0.2 s)</td><td>threads or asyncio</td></tr>
    <tr><td>Tiny tasks</td><td>messaging overhead per task (0.92 s vs loop 0.01 s)</td><td>a loop, or big chunks</td></tr>
    <tr><td>Huge data per task</td><td>pickling and copying, N copies in RAM</td><td>paths/ranges, shared memory, initializer</td></tr>
    <tr><td>numpy / pandas work</td><td>C code is already fast and often multi-core (numpy 0.002 s vs 4 processes 0.055 s)</td><td>vectorise</td></tr>
    <tr><td>Short scripts</td><td>pool start-up dominates (spawn ≈ 15 ms per process here)</td><td>a loop</td></tr>
    <tr><td>Memory-tight machines</td><td>one interpreter plus data per worker</td><td>shared memory, fewer workers</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p>Use processes when the work is <strong>CPU-bound, in pure Python, made of tasks that are long compared with their overhead, with small inputs and outputs</strong>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Nested parallelism: a process pool whose workers each call numpy/BLAS or scikit-learn with all cores (<code>n_jobs=-1</code>) oversubscribes the CPU, with 4 workers × 4 threads fighting over 4 cores. Set one level to 1 (e.g. <code>OMP_NUM_THREADS=1</code> in the workers).</p></div>

  <h2 id="mp-traps"><span class="num">09</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: missing <code>if __name__ == "__main__":</code></span><p>Works with fork, breaks with spawn/forkserver (macOS, Windows, Linux 3.14+): <code>RuntimeError</code> about the bootstrapping phase, or <code>BrokenProcessPool</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: unpicklable worker or arguments</span><p>Lambdas, nested functions, open files, locks, DB connections: <code>PicklingError</code>. Use top-level functions, <code>functools.partial</code>, plain data.</p></div>
  <div class="callout trap"><span class="label">Trap: expecting globals to be shared</span><p>The child changes its own copy; the parent sees nothing. Return results, or use a Queue / Value / shared memory.</p></div>
  <div class="callout trap"><span class="label">Trap: thousands of tiny tasks with chunksize=1</span><p>100× slower than a loop. Raise <code>chunksize</code> or make tasks bigger.</p></div>
  <div class="callout trap"><span class="label">Trap: shipping big data with every task</span><p>Pickling cost and N copies in RAM. Send paths or ranges; use shared memory or an <code>initializer</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: unlocked <code>Value += 1</code></span><p>Lost updates. Use <code>with v.get_lock():</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: joining before draining a Queue / missing pills</span><p>The program hangs silently.</p></div>
  <div class="callout trap"><span class="label">Trap: a new pool per call</span><p>Start-up paid every time (≈ 300 ms for 20 spawned processes here). Create one pool and reuse it.</p></div>

  <h2 id="mp-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Why processes</h3>
  <ul>
    <li>One interpreter and one GIL per process → CPU-bound Python runs in parallel.</li>
    <li>Speed-up ≤ number of cores; measured ≈ 3.5× on 4 cores (1.18 s → 0.34 s).</li>
    <li>Isolation: no shared memory by default; a crash gives a non-zero <code>exitcode</code>.</li>
  </ul>
  <h3>APIs</h3>
  <div class="fx" data-lang="py">p = mp.Process(target=f, args=(x,)); p.start(); p.join(); p.exitcode

with mp.Pool(4) as pool:
    pool.map(f, xs); pool.starmap(g, pairs); pool.imap_unordered(f, xs)

with ProcessPoolExecutor(max_workers=4) as ex:
    list(ex.map(f, xs, chunksize=100))
    fut = ex.submit(f, x); fut.result()</div>
  <h3>Pickling and the guard</h3>
  <ul>
    <li>Arguments, results and the function are pickled; functions/classes by module + name.</li>
    <li>Worker must be top-level: no lambdas, nested functions; use <code>functools.partial</code>.</li>
    <li>Unpicklable: open files, sockets, locks, DB connections, generators.</li>
    <li>spawn/forkserver children import the main module as <code>__mp_main__</code> → guard with <code>if __name__ == "__main__":</code>.</li>
  </ul>
  <table class="tbl">
    <tr><th>Start method</th><th>How</th><th>Default on</th></tr>
    <tr><td>fork</td><td>copy of the parent; fast; unsafe with threads</td><td>Linux ≤ 3.13</td></tr>
    <tr><td>spawn</td><td>fresh interpreter, re-imports main</td><td>macOS, Windows</td></tr>
    <tr><td>forkserver</td><td>clean server forks children</td><td>Linux 3.14+</td></tr>
  </table>
  <h3>Overhead</h3>
  <ul>
    <li>Worth it when work per task ≫ pickling + messaging per task, and total work ≫ start-up.</li>
    <li>Messages with chunksize k: ⌈tasks / k⌉. <code>Executor.map</code> default 1; <code>Pool.map</code> auto.</li>
    <li>Measured: 20 processes start ≈ 22 ms (fork) / ≈ 300 ms (spawn) vs threads ≈ 3 ms; 5000 tiny tasks 0.92 s (chunksize 1) vs 0.02 s (1250) vs loop 0.01 s; 9.9 MB argument ≈ 0.2 s.</li>
  </ul>
  <h3>IPC and shared memory</h3>
  <table class="tbl">
    <tr><th>Tool</th><th>Notes</th></tr>
    <tr><td><code>mp.Queue</code></td><td>many ↔ many; pickled; pills; drain before join</td></tr>
    <tr><td><code>mp.Pipe</code></td><td>two ends; <code>send</code>/<code>recv</code></td></tr>
    <tr><td><code>Value</code> / <code>Array</code></td><td>shared ctypes; <code>with v.get_lock():</code></td></tr>
    <tr><td><code>shared_memory</code></td><td>named buffer, numpy view; <code>close()</code> each, <code>unlink()</code> once</td></tr>
    <tr><td><code>Manager</code></td><td>proxied dict/list; slow</td></tr>
  </table>
  <h3>When not to</h3>
  <ul>
    <li>I/O-bound → threads/asyncio. numpy/pandas → vectorise (≈ 25× faster than 4 processes here).</li>
    <li>Tiny tasks, huge per-task data, nested <code>n_jobs=-1</code>.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>No guard → <code>RuntimeError</code> / <code>BrokenProcessPool</code> on spawn.</li>
    <li>Globals changed in a child are not seen by the parent.</li>
    <li>Unlocked <code>Value += 1</code> loses updates (no GIL between processes).</li>
    <li>Jupyter + spawn: put workers in a <code>.py</code> module.</li>
    <li>More workers than cores does not help CPU work.</li>
  </ul>

  <h2 id="mp-qa"><span class="num">10</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Threads vs processes in Python: when do you use each?</summary><div class="qa-body">Threads for I/O-bound work: cheap, shared memory, and the GIL is released while waiting. Processes for CPU-bound pure-Python work: each has its own interpreter and GIL, so they run in parallel, at the cost of start-up time, memory and pickling all data that crosses between them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does multiprocessing get around the GIL?</summary><div class="qa-body">It does not remove the GIL; it runs several interpreters. Each process has its own GIL, so the OS can run Python bytecode in each on a different core simultaneously. The trade-off is that processes do not share memory, so communication goes through pickled messages or explicit shared memory.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do you need <code>if __name__ == "__main__":</code> with multiprocessing?</summary><div class="qa-body">With the spawn and forkserver start methods, each child imports your main module (as <code>__mp_main__</code>) to find the worker function. Unguarded top-level code runs again in every child; if it creates processes, the children try to start processes while bootstrapping and <code>multiprocessing</code> raises <code>RuntimeError</code>. The guard confines that code to the parent. It is required on macOS and Windows and, from 3.14, on Linux by default.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't you pass a lambda to <code>ProcessPoolExecutor.map</code>?</summary><div class="qa-body">Functions are pickled by reference: module name plus qualified name, re-imported in the worker. A lambda (or nested function) has no importable name, so pickling fails with <code>PicklingError</code>. Use a top-level function, optionally wrapped in <code>functools.partial</code> for fixed arguments.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What can and cannot be sent to a worker process?</summary><div class="qa-body">Anything picklable: numbers, strings, lists, dicts, tuples, dataclasses, numpy arrays, top-level functions and classes. Not: lambdas, nested functions, open files, sockets, locks, database connections, generators. Unpicklable objects should be created inside the worker, for example in an <code>initializer</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>fork vs spawn vs forkserver?</summary><div class="qa-body">fork copies the running parent: fast, and functions and globals are already present, but unsafe if the parent has threads (locks held by other threads are copied locked). spawn starts a fresh interpreter that imports the main module: slower, safer, needs the guard and picklable workers. forkserver forks children from a clean single-threaded server. Linux defaulted to fork up to 3.13 and forkserver from 3.14; macOS and Windows use spawn.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>If a child process modifies a global variable, does the parent see it?</summary><div class="qa-body">No. The child has its own copy of memory (copied at fork, or rebuilt by importing under spawn); its changes vanish when it exits. Send results back through return values, a <code>Queue</code>/<code>Pipe</code>, or explicitly shared memory (<code>Value</code>, <code>Array</code>, <code>shared_memory</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why might a <code>ProcessPoolExecutor</code> be slower than a plain loop?</summary><div class="qa-body">Overhead: starting processes, pickling arguments and results, and one message per task by default. 5000 tiny tasks took 0.92 s in a pool vs 0.01 s in a loop. Fix with <code>chunksize</code> or bigger tasks, send small arguments, reuse one pool, and do not parallelise work that is already fast.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>chunksize</code> do?</summary><div class="qa-body">It groups k input items into one message to a worker, so pickling and IPC overhead is paid ⌈n / k⌉ times instead of n times. It matters for many small tasks; too large a chunk can unbalance load at the end. <code>Pool.map</code> picks one automatically; <code>ProcessPoolExecutor.map</code> defaults to 1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>multiprocessing.Pool</code> vs <code>ProcessPoolExecutor</code>?</summary><div class="qa-body">Both are process pools. <code>Pool</code> is older, with <code>map</code>, <code>imap</code>, <code>imap_unordered</code>, <code>starmap</code>, <code>apply_async</code> and automatic chunksize. <code>ProcessPoolExecutor</code> implements the <code>concurrent.futures.Executor</code> interface (Futures, <code>as_completed</code>), matches <code>ThreadPoolExecutor</code>, works with asyncio's <code>run_in_executor</code>, and raises <code>BrokenProcessPool</code> if a worker dies rather than hanging.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do processes communicate?</summary><div class="qa-body">Message passing: <code>mp.Queue</code> (many producers and consumers) and <code>mp.Pipe</code> (two ends), both pickling each message. Shared memory: <code>Value</code>/<code>Array</code> for small typed data with a lock, and <code>shared_memory.SharedMemory</code> for large buffers such as numpy arrays. <code>Manager</code> proxies give shared dicts and lists, but every access is an IPC round trip.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you share a large numpy array with workers without copying it?</summary><div class="qa-body">Create <code>shared_memory.SharedMemory(create=True, size=arr.nbytes)</code>, wrap it with <code>np.ndarray(shape, dtype, buffer=shm.buf)</code>, copy the data in once, and pass <code>shm.name</code>, shape and dtype to workers, which attach by name. Every process calls <code>close()</code>; one calls <code>unlink()</code> at the end. Concurrent writers still need coordination.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Processes are isolated, so why can <code>mp.Value</code> still have race conditions?</summary><div class="qa-body">A Value deliberately lives in shared memory, so it is no longer isolated. <code>v.value += 1</code> is still read, add, write, and processes run truly in parallel with no GIL between them, so updates interleave (more than half were lost in the demo). Wrap updates in <code>with v.get_lock():</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must you drain a <code>multiprocessing.Queue</code> before joining the producer?</summary><div class="qa-body">A process that has put items on a queue uses a background feeder thread to flush them into the pipe; it does not exit until the buffered data has been consumed. Joining it before reading can deadlock: the parent waits for the child to exit, the child waits for the parent to read. Read all results first, then join.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens when a worker process crashes?</summary><div class="qa-body">The crash is isolated and the parent survives. A raw <code>Process</code> shows a non-zero (or negative signal) <code>exitcode</code>. A <code>ProcessPoolExecutor</code> marks itself broken and pending futures raise <code>BrokenProcessPool</code>. An ordinary Python exception inside a pool job is pickled back and re-raised by <code>future.result()</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many worker processes should you use?</summary><div class="qa-body">For CPU-bound work, about the number of available cores (<code>os.cpu_count()</code>, or the container's CPU quota or affinity), fewer on shared machines or if each worker uses multi-threaded libraries. More workers than cores only add memory and context switching.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is numpy a better answer than multiprocessing?</summary><div class="qa-body">Often. numpy runs the loop in compiled C with no Python object per element, removing the cost that processes only divide among cores: numpy took 0.002 s vs 0.055 s for 4 processes and 0.112 s for 1. Processes are for Python logic that cannot be vectorised, such as a permutation search. If you combine them, limit BLAS threads per worker to avoid oversubscription.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you parallelise feature engineering on a 20 GB CSV?</summary><div class="qa-body">First try vectorised pandas/polars or chunked reading, since that may be enough. If per-row Python logic is unavoidable, split the work by byte ranges, row ranges or files, and give each worker a path and range rather than data; workers read and process their own slice and write results to disk or return small aggregates. Use a <code>ProcessPoolExecutor</code> with about one worker per core, and combine results at the end. For larger scale, Dask or Spark.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Where do you meet multiprocessing in ML libraries?</summary><div class="qa-body">PyTorch <code>DataLoader(num_workers=n)</code> loads and augments batches in worker processes (hence picklable datasets and the main guard on Windows/macOS). scikit-learn and joblib <code>n_jobs</code> use the loky process backend. Hyperparameter searches and parallel feature extraction commonly use process pools.</div></details>
</main>
`
});
