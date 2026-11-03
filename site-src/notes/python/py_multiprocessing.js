// notes/python/py_multiprocessing.js — Processes: multiprocessing
Object.assign(TOPIC_CONTENT, {
  "py_multiprocessing": `<main>
<h1>Processes: multiprocessing</h1>
  <div class="where"><span>Python</span><span>Advanced Python</span><span>Concurrency</span><span>Processes</span></div>
  <p class="lead">When a Python program is slow because it is <em>computing</em>, not waiting, threads cannot help: the Global Interpreter Lock lets only one thread run Python code at a time, so four threads calculate no faster than one. The way around this is to run several separate Python <strong>processes</strong>, each with its own interpreter and its own GIL, so that each can use a different CPU core at the same moment. That is what the <code>multiprocessing</code> module and <code>ProcessPoolExecutor</code> do. The price is isolation: processes share no memory, so every piece of data sent between them must be packed up and copied, the functions you send must be importable by name, your script needs an <code>if __name__ == "__main__":</code> guard, and the overhead can make a process pool slower than a plain loop if you are not careful. This page builds all of that up using the food-delivery app from <a class="xref" data-note="py_concurrency">Concurrency vs Parallelism</a>, whose computing job, finding the shortest route for each of 4 delivery riders, is exactly the kind of work processes are for. In real work you meet processes in PyTorch's <code>DataLoader(num_workers=…)</code>, scikit-learn's <code>n_jobs</code>, and parallel parsing or feature engineering. The code was run on CPython 3.13 on Linux with 4 cores; timings vary from run to run and are approximate.</p>

  <h2 id="mp-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">multiprocessing</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why processes</div>
        <ul>
          <li>Own interpreter, own GIL, own memory → <b>true parallelism</b></li>
          <li>Best speed-up ≈ number of cores, minus overhead</li>
          <li>Nothing is shared unless you share it</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Using them</div>
        <ul>
          <li><code>Process(target=f, args=…)</code>, <code>start</code>, <code>join</code>, <code>exitcode</code></li>
          <li><code>ProcessPoolExecutor</code>: <code>map</code>, <code>submit</code>; or <code>mp.Pool</code></li>
          <li><code>Queue</code>, <code>Pipe</code>, <code>Value</code>, <code>shared_memory</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Rules</div>
        <ul>
          <li>Data and functions are <b>pickled</b>; functions travel by name</li>
          <li>Top-level functions only: no lambdas</li>
          <li><code>if __name__ == "__main__":</code> guard (spawn re-imports your file)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Costs</div>
        <ul>
          <li>Start-up per process (spawn is slow)</li>
          <li>One message per task: use <code>chunksize</code></li>
          <li>Big arguments copied to every task</li>
          <li>Often numpy beats processes</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mp-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Processes: Escaping the GIL</span><span class="rm-sub">four cores really computing at once</span></div></div>
      <div class="rm-item rm-done" data-target="mp-process"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Process and Separate Memory</span><span class="rm-sub">start, join, and why globals are not shared</span></div></div>
      <div class="rm-item rm-done" data-target="mp-pool"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Process Pools</span><span class="rm-sub">Pool and ProcessPoolExecutor</span></div></div>
      <div class="rm-item rm-done" data-target="mp-pickle"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Pickling: How Data Travels</span><span class="rm-sub">why lambdas cannot be sent</span></div></div>
      <div class="rm-item rm-done" data-target="mp-guard"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Start Methods and the __main__ Guard</span><span class="rm-sub">fork, spawn, forkserver</span></div></div>
      <div class="rm-item rm-done" data-target="mp-cost"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">The Cost of Processes</span><span class="rm-sub">start-up, chunksize, copying data</span></div></div>
      <div class="rm-item rm-done" data-target="mp-ipc"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Talking Between Processes: Queue and Pipe</span><span class="rm-sub">message passing and poison pills</span></div></div>
      <div class="rm-item rm-done" data-target="mp-shared"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Shared Memory</span><span class="rm-sub">Value, Array, shared_memory</span></div></div>
      <div class="rm-item rm-done" data-target="mp-when"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">When Not to Use Processes</span><span class="rm-sub">waiting jobs, tiny tasks, numpy</span></div></div>
      <div class="rm-item rm-done" data-target="mp-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">lambdas, new pools, missing guards</span></div></div>
      <div class="rm-item rm-done" data-target="mp-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">APIs, rules, costs, IPC</span></div></div>
      <div class="rm-item rm-done" data-target="mp-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">processes vs threads, pickling, the guard</span></div></div>
    </div>
  </div>

  <h2 id="mp-why"><span class="num">01</span>Why Processes: Escaping the GIL</h2>
  <p>On the threads page we found that threads are excellent for waiting but useless for pure-Python calculation. The reason is the <strong>GIL</strong>, the Global Interpreter Lock: a lock inside the Python interpreter that a thread must hold to run Python code. Since each interpreter has only one GIL, the threads inside one program can only take turns at computing, never compute together. Picture a kitchen with only one recipe book, where nobody may cook without reading from it: hiring more cooks for that kitchen does not produce more dishes per hour.</p>
  <p>The solution is to open more kitchens. A <strong>process</strong> is a separate running program, with its own private memory, managed by the operating system. When you start a new Python process, it gets its own complete interpreter, and therefore its own GIL. Four Python processes are four separate kitchens, each with its own recipe book, and the operating system can run them on four different CPU cores at the same instant. That is real <strong>parallelism</strong>: several calculations happening at the same moment, not just taking turns.</p>
  <p>Our example is the food-delivery app's computing job. Here is the helper module used across the concurrency pages; the important function on this page is <code>route_cost</code>, which finds the shortest route through a rider's 9 drop-off points by trying all 9! = 362,880 possible orders. It is pure Python and pure calculation, with no waiting at all.</p>
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
rider 1 best route: 40 in 0.28s</div>
  <p>Now let us plan all four riders' routes, first one at a time and then with a <code>ProcessPoolExecutor</code> of 4 worker processes. A pool is a team of worker processes that share out a list of jobs; we will look at pools properly in section 03, and for now <code>ex.map(plan, range(4))</code> simply means "run <code>plan(0)</code> to <code>plan(3)</code> using the workers". Each job also reports <code>os.getpid()</code>, the process ID the operating system gave to the process that ran it, so we can see where the work happened. The code that starts processes sits under <code>if __name__ == "__main__":</code>; section 05 explains why that line is needed.</p>
  <div class="fx" data-lang="py">import os, time
from concurrent.futures import ProcessPoolExecutor
from workload import RIDERS, route_cost

def plan(i):                                   # runs inside a worker process
    return route_cost(RIDERS[i]), os.getpid()

if __name__ == "__main__":
    t = time.perf_counter()
    costs = [route_cost(s) for s in RIDERS]
    print(f"one at a time: {costs} in {time.perf_counter() - t:.2f}s")

    t = time.perf_counter()
    with ProcessPoolExecutor(max_workers=4) as ex:
        out = list(ex.map(plan, range(4)))
    print(f"4 processes  : {[c for c, _ in out]} in {time.perf_counter() - t:.2f}s")
    pids = {pid for _, pid in out}
    print(f"main process id {os.getpid()}; worker ids differ from it: {os.getpid() not in pids}; "
          f"workers used: {len(pids)}")</div>
  <div class="fx" data-lang="text">one at a time: [40, 36, 35, 36] in 1.54s
4 processes  : [40, 36, 35, 36] in 0.43s
main process id 6649; worker ids differ from it: True; workers used: 4</div>
  <p>The answers are identical, and the time dropped to a fraction of the original: about three to four times faster on 4 cores. The process IDs prove that the work really ran in 4 different processes, none of them the main program. The same job with 4 threads gave no speed-up at all (<a class="xref" data-note="py_threading">Threads &amp; the GIL</a>). The speed-up is a little below 4 because starting the processes and sending each its job takes time, the four searches are not exactly the same size, and other programs share the cores. For long jobs on an otherwise idle machine it gets close to the number of cores, but it can never exceed it.</p>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
    <defs><marker id="mp-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="60" width="180" height="70" rx="8" class="fb sb"/><text x="22" y="82">Main process</text><text x="22" y="100" class="tm">interpreter + GIL</text><text x="22" y="116" class="tm">own memory</text>
    <rect x="420" y="10" width="170" height="62" rx="8" class="ft st"/><text x="432" y="32">Worker 1 · core 1</text><text x="432" y="52" class="tm">own GIL + memory</text>
    <rect x="420" y="118" width="170" height="62" rx="8" class="ft st"/><text x="432" y="140">Worker 2 · core 2</text><text x="432" y="160" class="tm">own GIL + memory</text>
    <line x1="190" y1="70" x2="416" y2="38" stroke="currentColor" stroke-width="1.5" marker-end="url(#mp-ah2)"/>
    <line x1="190" y1="120" x2="416" y2="152" stroke="currentColor" stroke-width="1.5" marker-end="url(#mp-ah2)"/>
    <text x="200" y="28" class="tm">jobs and results: pickled copies</text>
    <rect x="245" y="75" width="140" height="42" rx="6" class="fv"/><text x="257" y="93">shared memory</text><text x="257" y="110" class="tm">no copy (section 08)</text>
    <line x1="385" y1="96" x2="420" y2="66" stroke="currentColor" stroke-dasharray="3 3"/><line x1="385" y1="96" x2="420" y2="124" stroke="currentColor" stroke-dasharray="3 3"/>
  </svg><figcaption>Each process is a separate program with its own interpreter, GIL and memory, so each can run on its own core. Data travels between them as copied messages (solid arrows) or, for large arrays, through a block of memory deliberately shared between them (dashed lines).</figcaption></figure>
  <p>The figure shows the trade-off that runs through the rest of this page. Because the processes have separate memory, they cannot interfere with each other, which removes most of the data-corruption bugs that threads suffer from. But for the same reason, everything a worker needs must be <em>sent</em> to it, and everything it produces must be sent back, as copies. Most of the rules and costs of <code>multiprocessing</code> come from that one fact.</p>

  <h2 id="mp-process"><span class="num">02</span>Process and Separate Memory</h2>
  <p>The lowest-level tool is <code>multiprocessing.Process</code>, and it deliberately looks just like <code>threading.Thread</code>. <code>Process(target=f, args=(x,))</code> creates a process object that <em>will</em> run <code>f(x)</code>; <code>start()</code> launches the new process; <code>join()</code> waits for it to finish. Two extras are useful: <code>is_alive()</code> tells you whether it is still running, and after it ends, <code>exitcode</code> tells you how it ended, with 0 meaning normally.</p>
  <p>The big difference from threads is memory. A thread works in the same memory as the main program, so it can change the main program's variables. A process works on its <em>own copy</em> of the program's state, so changes it makes stay inside it. Think of giving a colleague a photocopy of your notebook: they can write anything they like on their copy, but your original does not change. The demo below has a global counter in the parent; the child fetches a menu and adds one to the counter:</p>
  <div class="fx" data-lang="py">import multiprocessing as mp
from workload import fetch_menu

menus_seen = 0                                 # a global variable in the parent

def child(rid):
    global menus_seen
    menu = fetch_menu(rid)
    menus_seen += 1                            # changes the CHILD's own copy
    print(f"child  [{mp.current_process().name}] got {menu}, menus_seen = {menus_seen}")

if __name__ == "__main__":
    p = mp.Process(target=child, args=("R01",), name="worker-1")
    print("parent: alive before start?", p.is_alive())
    p.start()                                  # a brand-new Python process begins
    p.join()                                   # wait for it to finish
    print("parent: exitcode", p.exitcode, "| parent's menus_seen =", menus_seen)</div>
  <div class="fx" data-lang="text">parent: alive before start? False
child  [worker-1] got {'id': 'R01', 'dishes': 4}, menus_seen = 1
parent: exitcode 0 | parent's menus_seen = 0</div>
  <p>The child saw its counter go up to 1. But after the child had finished, the parent's counter was still 0. The child's <code>+= 1</code> changed the child's copy of <code>menus_seen</code>, and that copy disappeared when the child process exited. The exit code 0 shows that the child finished normally; this was not a crash. Nothing ever flows back from a child process automatically. If you want a result, you must send it back on purpose: as a return value through a pool, through a <code>Queue</code> or a <code>Pipe</code>, or through deliberately shared memory. Each of these is covered below.</p>
  <table class="tbl"><caption>Thread vs process</caption>
    <tr><th></th><th>Thread</th><th>Process</th></tr>
    <tr><td>Memory</td><td>shared with all threads</td><td>own copy; nothing shared by default</td></tr>
    <tr><td>GIL</td><td>one for all threads</td><td>one per process</td></tr>
    <tr><td>Pure-Python computing</td><td>no speed-up</td><td>up to × number of cores</td></tr>
    <tr><td>Getting results back</td><td>write to a shared variable</td><td>return value via a pool, Queue, Pipe or shared memory</td></tr>
    <tr><td>Start-up cost</td><td>tiny</td><td>noticeable (section 06)</td></tr>
    <tr><td>A crash</td><td>can take down the whole program</td><td>isolated; the parent sees a non-zero <code>exitcode</code></td></tr>
    <tr><td>Race conditions</td><td>on any shared variable</td><td>only on what you deliberately share</td></tr>
    <tr><td>Stopping one from outside</td><td>impossible</td><td><code>p.terminate()</code> or <code>p.kill()</code> (skips its cleanup)</td></tr>
  </table>
  <p>Data moving between processes always goes through some form of <strong>IPC</strong>, short for inter-process communication: return values, queues, pipes, shared memory, files or network sockets. The next section shows the easiest form, the return value of a pool job.</p>

  <h2 id="mp-pool"><span class="num">03</span>Process Pools</h2>
  <p>Starting a process for every job and collecting each result by hand is fiddly. A <strong>process pool</strong> does it for you: it starts a fixed set of worker processes once, keeps a queue of jobs, hands each job to the next free worker, and sends the worker's return value back to you. It is like a restaurant that keeps a fixed team of cooks instead of hiring a new cook for every order. Python offers two pool APIs. The older one is <code>multiprocessing.Pool</code>, with methods such as <code>map</code>, <code>starmap</code>, <code>imap</code>, <code>imap_unordered</code> and <code>apply_async</code>. The newer one is <code>concurrent.futures.ProcessPoolExecutor</code>, which has exactly the same interface as <code>ThreadPoolExecutor</code>, so moving code between threads and processes is often a one-word change.</p>
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
  <p>Both <code>map</code> methods returned the four route costs in the same order as the riders went in. <code>starmap</code> is for functions with several arguments: each tuple is unpacked into arguments, so <code>(2, 3)</code> became <code>pow(2, 3)</code> = 8. With the executor, <code>submit</code> schedules a single call and returns a <strong>Future</strong>, an object that stands for a result that is not ready yet, and <code>as_completed</code> hands futures back in the order they <em>finish</em>. Because that order can change from run to run, the code keeps a dictionary from each future to its rider number and sorts the results. Leaving each <code>with</code> block waits for the jobs and shuts the workers down.</p>
  <table class="tbl">
    <tr><th></th><th><code>mp.Pool</code></th><th><code>ProcessPoolExecutor</code></th></tr>
    <tr><td>Methods</td><td><code>map</code>, <code>imap</code>, <code>imap_unordered</code>, <code>starmap</code>, <code>apply_async</code></td><td><code>map</code>, <code>submit</code> → Future, <code>as_completed</code>, <code>wait</code></td></tr>
    <tr><td>Default <code>chunksize</code> for <code>map</code></td><td>chosen automatically</td><td>1 (set it yourself, section 06)</td></tr>
    <tr><td>If a worker crashes</td><td>can hang waiting for a result</td><td>raises <code>BrokenProcessPool</code></td></tr>
    <tr><td>Works with</td><td>older code</td><td><code>ThreadPoolExecutor</code> code, and asyncio's <code>run_in_executor</code></td></tr>
  </table>
  <p>For new code, <code>ProcessPoolExecutor</code> is usually the better default. Two of its options are worth knowing: <code>initializer=f</code> runs <code>f</code> once in each worker when it starts, which is the place to load a model or open a file that every job will use, and <code>max_tasks_per_child=n</code> replaces each worker after n jobs, which contains slow memory leaks. Whichever API you use, create one pool and reuse it; starting a fresh pool for every batch of work pays the start-up cost again each time (section 10 measures this).</p>

  <h2 id="mp-pickle"><span class="num">04</span>Pickling: How Data Travels</h2>
  <p>Two processes cannot look into each other's memory, so how does a worker get its job and how does the result get back? Everything that crosses between processes, the function to call, its arguments and its return value, is turned into a string of bytes, sent through an operating-system pipe, and turned back into Python objects on the other side. Turning an object into bytes is called <strong>serialising</strong>, and Python's standard way of doing it is the <code>pickle</code> module, so the process is called <strong>pickling</strong>. It is like flat-pack furniture: the item is taken apart into a compact package, shipped, and reassembled at the other end into an identical but separate copy.</p>
  <div class="fx" data-lang="py">import pickle
from workload import route_cost

menu = {"id": "R01", "dishes": 4}
data = pickle.dumps(menu)                      # object -&gt; bytes
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
PicklingError: Can't pickle &lt;function &lt;lambda&gt; at 0x7f3a1c2b5e40&gt;: attribute lookup &lt;lambda&gt; on __main__ failed</div>
  <p>The menu dictionary became 38 bytes and was rebuilt equal to the original. The function, however, is surprising: its pickle contains nothing but two names, <code>workload</code> and <code>route_cost</code>. <strong>Functions and classes are pickled by name, not by their code.</strong> The receiving process rebuilds them by importing the module <code>workload</code> and looking up <code>route_cost</code> in it. That works only if the function can be found by name at the top level of a module. A <code>lambda</code> is an anonymous function with no name to look up, so it cannot be pickled, and for the same reason it cannot be sent to a process pool:</p>
  <div class="fx" data-lang="py">from concurrent.futures import ProcessPoolExecutor
from workload import RIDERS, route_cost

if __name__ == "__main__":
    with ProcessPoolExecutor(max_workers=2) as ex:
        try:
            print(list(ex.map(lambda s: route_cost(s), RIDERS[:2])))
        except Exception as e:
            print(type(e).__name__ + ":", e)</div>
  <div class="fx" data-lang="text">PicklingError: Can't pickle &lt;function &lt;lambda&gt; at 0x7f3a1c2b5e40&gt;: attribute lookup &lt;lambda&gt; on __main__ failed</div>
  <p>The rule that follows is simple: <strong>the function you give to a process pool must be defined at the top level of a module</strong>, so not a lambda, not a function defined inside another function, and not a method of an object that cannot itself be pickled. The arguments and the return value must be picklable too. Numbers, strings, lists, dictionaries, tuples, dataclasses and numpy arrays all are. Open files, network connections, database connections, locks and generators are not, because they represent something live in one particular process that cannot be copied. If you need to fix some of a function's arguments, <code>functools.partial(top_level_function, x=1)</code> is picklable and is the usual answer (section 10 shows it).</p>

  <h2 id="mp-guard"><span class="num">05</span>Start Methods and the __main__ Guard</h2>
  <p>How exactly does Python create a new process, and how does the new process get your functions? There are three ways, called <strong>start methods</strong>. With <strong>fork</strong>, the operating system makes an exact copy of the running parent process, memory and all, so the child already has every function and variable. It is fast, but it is unsafe if the parent has other threads running, because a lock held by one of those threads is copied in its locked state and nobody in the child will ever release it. With <strong>spawn</strong>, Python starts a completely fresh interpreter and has it <em>import your main script</em> to find the functions it needs. It is slower but safer, and it is the default on macOS and Windows. With <strong>forkserver</strong>, a small, clean helper process is started early and forks new children on request; this is the default on Linux from Python 3.14 (it was fork up to 3.13).</p>
  <p>The phrase "import your main script" is the key to one of the most famous rules in Python. Under spawn, each child runs your file from the top, with the special variable <code>__name__</code> set to <code>"__mp_main__"</code> instead of the usual <code>"__main__"</code>. The script below prints a line at the top of the file, then starts two spawned children one after another:</p>
  <div class="fx" data-lang="py">import multiprocessing as mp

print(f"top of the file runs, __name__ = {__name__!r}")

def work(n):
    print(f"   worker handles job {n}")

if __name__ == "__main__":
    print("default start method here:", mp.get_start_method())
    ctx = mp.get_context("spawn")              # how macOS and Windows start processes
    kids = [ctx.Process(target=work, args=(n,)) for n in (1, 2)]
    for k in kids:
        k.start(); k.join()                    # one at a time, so the output stays in order</div>
  <div class="fx" data-lang="text">top of the file runs, __name__ = '__main__'
default start method here: fork
top of the file runs, __name__ = '__mp_main__'
   worker handles job 1
top of the file runs, __name__ = '__mp_main__'
   worker handles job 2</div>
  <p>The top line ran three times: once in the parent and once in each child, before the child ran <code>work</code>. The code inside <code>if __name__ == "__main__":</code> ran only in the parent, because in the children <code>__name__</code> was <code>"__mp_main__"</code>. (The default start method on this Linux machine with Python 3.13 is fork, which is why the demo asks for spawn explicitly.) Now see what happens if the code that creates the pool is <em>not</em> protected by that check:</p>
  <div class="fx" data-lang="py">import multiprocessing as mp
from concurrent.futures import ProcessPoolExecutor

def square(x):
    return x * x

print(f"top of the file runs, __name__ = {__name__!r}")
ctx = mp.get_context("spawn")
with ProcessPoolExecutor(max_workers=2, mp_context=ctx) as ex:   # NO guard!
    print(list(ex.map(square, [1, 2, 3])))</div>
  <div class="fx" data-lang="text">top of the file runs, __name__ = '__main__'
top of the file runs, __name__ = '__mp_main__'
   [... traceback lines trimmed ...]
RuntimeError:
        An attempt has been made to start a new process before the
        current process has finished its bootstrapping phase.

        This probably means that you are not using fork to start your
        child processes and you have forgotten to use the proper idiom
        in the main module:

            if __name__ == '__main__':
                freeze_support()
                ...

        The "freeze_support()" line can be omitted if the program
        is not going to be frozen to produce an executable.

        To fix this issue, refer to the "Safe importing of main module"
        section in https://docs.python.org/3/library/multiprocessing.html
top of the file runs, __name__ = '__mp_main__'
   [... traceback lines trimmed ...]
RuntimeError:
        An attempt has been made to start a new process before the
        current process has finished its bootstrapping phase.
   [... traceback lines trimmed ...]
concurrent.futures.process.BrokenProcessPool: A process in the process pool was terminated abruptly while the future was running or pending.</div>
  <p>Each child re-ran the whole file, reached the pool-creating line, and tried to start processes of its own before it had even finished starting up. <code>multiprocessing</code> detects this and raises a <code>RuntimeError</code> inside the child, with a message that tells you exactly what to do: use the <code>if __name__ == '__main__':</code> idiom. The parent then sees its workers die and reports <code>BrokenProcessPool</code>. With fork, the same script happens to work, because forked children do not re-import the file. That is precisely why code written and tested on Linux with older Pythons breaks on macOS, on Windows, or on Linux with Python 3.14. The <strong>main guard</strong>, <code>if __name__ == "__main__":</code>, is the fix: everything that starts processes goes under it, so it runs only in the parent. Always use it, whatever your platform.</p>
  <p>You can check the start method with <code>mp.get_start_method()</code> and choose one with <code>mp.get_context("spawn")</code> (as the demos do) or <code>mp.set_start_method("spawn")</code>, called once under the guard. One related trap: in a Jupyter notebook on macOS or Windows, functions defined in the notebook live in <code>__main__</code>, which a spawned child cannot import, so pools fail with pickling or <code>AttributeError</code> errors. Put the worker function in a separate <code>.py</code> file and import it.</p>

  <h2 id="mp-cost"><span class="num">06</span>The Cost of Processes</h2>
  <p>Processes are not free, and three costs decide whether a pool helps or hurts: starting the worker processes, sending one message per job, and copying the data each job needs. Knowing their size turns "processes sometimes make things slower" from a mystery into something you can predict.</p>
  <p>Start-up comes first. Creating a thread is cheap, but creating a process means asking the operating system for a new program, and with spawn it also means booting a fresh interpreter and importing your modules. Here is the time to start and finish 20 workers that do nothing at all:</p>
  <div class="fx" data-lang="py">import threading, multiprocessing as mp, time

def nothing():
    pass

if __name__ == "__main__":
    for kind, make in (("threads", threading.Thread), ("forked processes", mp.Process),
                       ("spawned processes", mp.get_context("spawn").Process)):
        t = time.perf_counter()
        workers = [make(target=nothing) for _ in range(20)]
        for w in workers: w.start()
        for w in workers: w.join()
        print(f"start + join 20 {kind:&lt;17}: {(time.perf_counter() - t) * 1000:6.1f} ms")</div>
  <div class="fx" data-lang="text">start + join 20 threads          :    3.4 ms
start + join 20 forked processes :   21.3 ms
start + join 20 spawned processes:  312.3 ms</div>
  <p>Twenty forked processes cost several times as much as twenty threads, and twenty spawned processes cost around a hundred times as much, because each spawned child starts an interpreter from scratch and re-imports your code (heavy imports such as pandas or PyTorch make this much worse). A third of a second is nothing next to a job that runs for a minute, but it is a disaster if you pay it for every small batch. That is why you create one pool and keep using it.</p>
  <p>The second cost is per job. By default, <code>ProcessPoolExecutor.map</code> sends each item as its own message: pickle the arguments, send them through a pipe, unpickle, compute, pickle the result, send it back, unpickle. That round trip takes far longer than a tiny calculation. The experiment below uses 5000 copies of a tiny 3-stop route, each solved in microseconds. The <code>chunksize</code> argument tells <code>map</code> to send several items in each message:</p>
  <div class="fx" data-lang="py">import time
from concurrent.futures import ProcessPoolExecutor
from workload import route_cost

TINY = [[(2, 1), (5, 3), (1, 4)]] * 5000       # 5000 copies of a 3-stop route: microseconds each

if __name__ == "__main__":
    t = time.perf_counter()
    seq = [route_cost(s) for s in TINY]
    print(f"plain loop           : {time.perf_counter() - t:.2f}s  (each answer {seq[0]})")
    for chunk in (1, 50, 1250):
        t = time.perf_counter()
        with ProcessPoolExecutor(max_workers=4) as ex:
            out = list(ex.map(route_cost, TINY, chunksize=chunk))
        print(f"4 procs, chunksize={chunk:&lt;4}: {time.perf_counter() - t:.2f}s  same answers: {out == seq}")</div>
  <div class="fx" data-lang="text">plain loop           : 0.01s  (each answer 12)
4 procs, chunksize=1   : 0.95s  same answers: True
4 procs, chunksize=50  : 0.03s  same answers: True
4 procs, chunksize=1250: 0.02s  same answers: True</div>
  <p>With one item per message, the pool was around a hundred times <em>slower</em> than a plain loop: the messaging completely swamped the work. Sending 50 items per message (100 messages instead of 5000) removed most of the overhead, and 1250 per message (one big chunk per worker) removed nearly all of it. Even so, the pool never beat the loop, because the whole job was too small to be worth sharing out in the first place. The lesson has two halves: batch tiny tasks with <code>chunksize</code>, and do not parallelise work that is already fast. (The older <code>mp.Pool.map</code> chooses a chunk size automatically; the executor's default is 1.)</p>
  <p>The third cost is data. Every argument is pickled and copied, so sending a large dataset to a worker means serialising megabytes, pushing them through a pipe and rebuilding them on the other side. The worker below is warmed up first, so that only the transfer is timed; then it is sent a 2-million-element list, and then just a single number:</p>
  <div class="fx" data-lang="py">import pickle, time
from concurrent.futures import ProcessPoolExecutor

ORDERS = list(range(2_000_000))                # a large in-memory dataset

def count_given(rows):                         # the data travels with the call
    return len(rows)

def count_own(n):                              # only a small number travels
    return n

if __name__ == "__main__":
    t = time.perf_counter()
    size = len(pickle.dumps(ORDERS))
    print(f"pickled size: {size / 1e6:.1f} MB, pickling alone took {time.perf_counter() - t:.3f}s")
    with ProcessPoolExecutor(max_workers=1) as ex:
        ex.submit(count_own, 1).result()       # warm up: start the worker first
        t = time.perf_counter()
        ex.submit(count_given, ORDERS).result()
        print(f"send the list : {time.perf_counter() - t:.3f}s")
        t = time.perf_counter()
        ex.submit(count_own, 2_000_000).result()
        print(f"send just 'n' : {time.perf_counter() - t:.3f}s")</div>
  <div class="fx" data-lang="text">pickled size: 9.9 MB, pickling alone took 0.062s
send the list : 0.869s
send just 'n' : 0.015s</div>
  <p>The list pickled to about 10 MB, and sending it took many times longer than sending one number (this varies a lot between runs, but the gap is always large). In a real pool, every job that receives such an argument pays that cost again, and every worker holds its own copy in memory, so four workers each given a 2 GB DataFrame need 8 GB. The fix is to send small descriptions instead of data: a file path, a range of row numbers, or an ID, and let each worker load its own slice. Alternatively, use an <code>initializer</code> that loads the data once per worker, or shared memory (section 08).</p>
  <table class="tbl"><caption>Where the time goes</caption>
    <tr><th>Cost</th><th>Size here (approximate)</th><th>How to reduce it</th></tr>
    <tr><td>Starting processes</td><td>20 processes: tens of ms (fork), hundreds of ms (spawn)</td><td>one long-lived pool</td></tr>
    <tr><td>One message per job</td><td>5000 tiny jobs: about 1 s, against 0.01 s for a loop</td><td><code>chunksize</code>, bigger jobs</td></tr>
    <tr><td>Copying data</td><td>a 10 MB argument: a large fraction of a second</td><td>send paths or ranges; <code>initializer</code>; shared memory</td></tr>
  </table>
  <p>The rule of thumb: a pool pays off only when the <strong>work per job is much larger than the overhead per job</strong> (pickling plus messaging) and the total work is much larger than the pool's start-up time.</p>

  <h2 id="mp-ipc"><span class="num">07</span>Talking Between Processes: Queue and Pipe</h2>
  <p>A pool works like a vending machine: you put a job in, you get a result out. Sometimes you need something more like a conversation, with long-running workers that receive a stream of jobs and send back a stream of results. For that, <code>multiprocessing</code> provides explicit channels. Both of the channels below pickle every message, just as a pool does.</p>
  <p><code>multiprocessing.Queue</code> has the same interface as the thread-safe <code>queue.Queue</code> (<code>put</code> to add an item, <code>get</code> to take one, waiting if empty), but each item is pickled and sent to whichever process calls <code>get</code>. In the example, the main program puts the 4 riders' jobs on a <code>tasks</code> queue, two worker processes take jobs and put results on a <code>results</code> queue, and each worker stops when it receives <code>None</code>. A special value like that, which means "stop", is called a <strong>poison pill</strong>; one is needed per worker.</p>
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
    out = sorted(results.get() for _ in RIDERS)  # read every result BEFORE joining
    for p in procs: p.join()
    for n, cost, who in out:
        print(f"rider {n}: best route {cost}")
    print("workers used:", sorted({who for _, _, who in out}))</div>
  <div class="fx" data-lang="text">rider 1: best route 40
rider 2: best route 36
rider 3: best route 35
rider 4: best route 36
workers used: ['worker-1', 'worker-2']</div>
  <p>All four routes came back correct, and both workers took part. Which worker handled which rider changes from run to run, which is why the results are sorted by rider number before printing. Notice the order of the last steps: the main program reads every result <em>before</em> it joins the workers. That order matters. A process that has put items on a queue may not be able to exit until those items have been read, so if the parent waits for the child to exit while the child waits for the parent to read, both wait forever.</p>
  <p><code>multiprocessing.Pipe()</code> is simpler: it returns two connected ends, and whatever is sent with <code>send</code> on one end is received with <code>recv</code> on the other, in both directions. It suits a conversation between exactly two processes:</p>
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
  <p>The parent sent a small route through its end of the pipe, the child received it, computed the answer and sent it back on the same pipe.</p>
  <table class="tbl">
    <tr><th>Channel</th><th>Shape</th><th>Cost</th><th>Use for</th></tr>
    <tr><td><code>mp.Queue</code></td><td>many senders, many receivers</td><td>pickles every item</td><td>job queues, collecting results</td></tr>
    <tr><td><code>mp.Pipe</code></td><td>exactly two ends</td><td>pickles; slightly faster than Queue</td><td>a parent talking to one child</td></tr>
    <tr><td><code>Value</code> / <code>Array</code></td><td>numbers in shared memory</td><td>no pickling; needs a lock</td><td>counters, flags, small arrays (next section)</td></tr>
    <tr><td><code>shared_memory</code></td><td>a raw block of shared bytes</td><td>no copying at all</td><td>large numpy arrays read by many workers</td></tr>
    <tr><td><code>Manager()</code></td><td>a dict or list living in a helper process</td><td>every access is a round trip: slow</td><td>convenience for small shared state</td></tr>
  </table>
  <p>Queues and pipes are both forms of <strong>message passing</strong>: processes exchange copies of data rather than sharing variables. That is the natural style for processes, and it is also what makes them safe.</p>

  <h2 id="mp-shared"><span class="num">08</span>Shared Memory</h2>
  <p>Sometimes copying is too expensive: a counter updated thousands of times, or a huge array that every worker needs to read. For these cases, processes can agree to use the same piece of memory directly. Think of a whiteboard in a shared corridor that every kitchen can walk up to and write on. It removes the copying, but it brings back the problem threads have: two processes writing at the same time can trample each other's updates.</p>
  <p>The simplest tools are <code>mp.Value</code> and <code>mp.Array</code>. <code>mp.Value("i", 0)</code> creates a single C integer (<code>"i"</code>) in shared memory, starting at 0; <code>"d"</code> would make a decimal number. <code>mp.Array("i", 4)</code> creates four of them. Each comes with its own lock, available as <code>get_lock()</code>. Below, four processes each add 50,000 to a shared Value, first without and then with the lock, and then four children each write one rider's route cost into a shared Array:</p>
  <div class="fx" data-lang="py">import multiprocessing as mp

def count_views(v, n, use_lock):
    for _ in range(n):
        if use_lock:
            with v.get_lock():                 # a Value carries its own lock
                v.value += 1
        else:
            v.value += 1                       # read ... add ... write, across processes

def fill(slots, i, cost):
    slots[i] = cost                            # each child writes only its own slot

if __name__ == "__main__":
    for use_lock in (False, True):
        v = mp.Value("i", 0)                   # "i" = a C int, living in shared memory
        ps = [mp.Process(target=count_views, args=(v, 50_000, use_lock)) for _ in range(4)]
        for p in ps: p.start()
        for p in ps: p.join()
        print(f"Value, lock={use_lock!s:&lt;5}: {v.value} / 200000")
    slots = mp.Array("i", 4)                   # 4 shared ints, all 0
    ps = [mp.Process(target=fill, args=(slots, i, c)) for i, c in enumerate([40, 36, 35, 36])]
    for p in ps: p.start()
    for p in ps: p.join()
    print("Array after children:", list(slots))</div>
  <div class="fx" data-lang="text">Value, lock=False: 90242 / 200000
Value, lock=True : 200000 / 200000
Array after children: [40, 36, 35, 36]</div>
  <p>Without the lock, more than half of the updates were lost. <code>v.value += 1</code> is still three steps (read, add, write), and these processes run truly in parallel on different cores, with no GIL between them, so their steps interleave constantly. This is exactly the race condition from the threads page, made worse by real parallelism. With <code>with v.get_lock():</code> around the update, the total is exactly 200,000. The Array needed no lock because each child wrote only its own slot, so no two processes ever touched the same number.</p>
  <p>For large numeric data there is <code>multiprocessing.shared_memory.SharedMemory</code>, which creates a named block of raw bytes. Any process can attach to the block by its name and view it as a numpy array, so a worker can read or change a large array without anything being pickled or copied:</p>
  <div class="fx" data-lang="py">import multiprocessing as mp
from multiprocessing import shared_memory
import numpy as np

def add_ten(name, shape):
    shm = shared_memory.SharedMemory(name=name)               # attach to the block by name
    arr = np.ndarray(shape, dtype=np.float64, buffer=shm.buf)
    arr += 10                                                 # changes it in place: no copy
    del arr
    shm.close()

if __name__ == "__main__":
    shm = shared_memory.SharedMemory(create=True, size=4 * 8)  # room for 4 float64 numbers
    arr = np.ndarray((4,), dtype=np.float64, buffer=shm.buf)
    arr[:] = [40, 36, 35, 36]
    p = mp.Process(target=add_ten, args=(shm.name, arr.shape)); p.start(); p.join()
    print("parent sees after child:", arr)
    del arr
    shm.close(); shm.unlink()                                  # free the block, once</div>
  <div class="fx" data-lang="text">parent sees after child: [50. 46. 45. 46.]</div>
  <p>The child attached to the block by name, wrapped it as a numpy array and added 10 to every element, and the parent saw the change immediately, because both were looking at the same memory. Shared memory has cleanup rules that you must follow: every process calls <code>close()</code> when it is finished with the block (after deleting any numpy arrays that use it), and exactly one process calls <code>unlink()</code> at the very end to free it. Forgetting <code>unlink()</code> leaves the block behind (on Linux it stays in <code>/dev/shm</code> until reboot); calling it too early pulls the block out from under processes still using it. And if several processes write to the same part of the block, they need coordination, just like threads.</p>

  <h2 id="mp-when"><span class="num">09</span>When Not to Use Processes</h2>
  <p>Processes pay off for CPU-bound, pure-Python work split into reasonably large jobs with small inputs and outputs. Many jobs that look like good candidates are actually faster without them. One more measurement makes the most important point: computing the sum of i² for every i below 2 million, in pure Python, in pure Python split across 4 processes, and with numpy.</p>
  <div class="fx" data-lang="py">import time
import numpy as np
from concurrent.futures import ProcessPoolExecutor

N = 2_000_000
def part(bounds):
    lo, hi = bounds
    return sum(i * i for i in range(lo, hi))

if __name__ == "__main__":
    t = time.perf_counter(); a = part((0, N))
    print(f"pure Python, 1 process  : {time.perf_counter() - t:.3f}s")
    t = time.perf_counter()
    with ProcessPoolExecutor(max_workers=4) as ex:
        b = sum(ex.map(part, [(k * N // 4, (k + 1) * N // 4) for k in range(4)]))
    print(f"pure Python, 4 processes: {time.perf_counter() - t:.3f}s")
    x = np.arange(N, dtype=np.int64)           # the data already lives in a numpy array
    t = time.perf_counter(); c = int(x @ x)    # sum of x*x, done in compiled C
    print(f"numpy, 1 process        : {time.perf_counter() - t:.3f}s")
    print("same answer:", a == b == c)</div>
  <div class="fx" data-lang="text">pure Python, 1 process  : 0.081s
pure Python, 4 processes: 0.051s
numpy, 1 process        : 0.002s
same answer: True</div>
  <p>Four processes made the pure-Python version roughly twice as fast; on a job this short, the pool's start-up ate the rest of the possible gain. But numpy, in a single process, was dozens of times faster than the four processes together. numpy stores the numbers in a compact array and runs the whole loop in compiled C code, with no Python object per number, which removes the very cost that processes can only divide between cores. Whenever a calculation can be expressed as whole-array operations, that is, <strong>vectorised</strong>, do that first, and parallelise only what cannot be vectorised, such as our route search.</p>
  <table class="tbl"><caption>When processes lose</caption>
    <tr><th>Situation</th><th>Why</th><th>Use instead</th></tr>
    <tr><td>Waiting (I/O-bound) work</td><td>waiting needs no core; n processes overlap only n waits (20 requests: 4 processes about 1 s, 20 threads about 0.2 s)</td><td>threads or asyncio</td></tr>
    <tr><td>Tiny jobs</td><td>messaging overhead per job is larger than the job</td><td>a plain loop, or large chunks</td></tr>
    <tr><td>Huge data per job</td><td>pickling and copying; a copy in every worker</td><td>send paths or ranges; shared memory; <code>initializer</code></td></tr>
    <tr><td>Numeric work on arrays</td><td>numpy is already fast and often multi-core</td><td>vectorise</td></tr>
    <tr><td>Short scripts</td><td>pool start-up dominates</td><td>a plain loop</td></tr>
    <tr><td>Little memory</td><td>each worker is a whole interpreter plus its data</td><td>fewer workers; shared memory</td></tr>
  </table>
  <p>Two more practical points. More processes than cores does not help CPU-bound work: 16 processes on 4 cores just take turns and use four times the memory. <code>ProcessPoolExecutor()</code> defaults to one per core (<code>os.cpu_count()</code>), and in containers or on shared machines you may want fewer; Python 3.13's <code>os.process_cpu_count()</code> reports how many cores this process is actually allowed to use. And beware of <strong>oversubscription</strong> from nested parallelism: if each of 4 worker processes calls numpy or scikit-learn code that itself uses all 4 cores, 16 threads end up fighting over 4 cores. Set one of the two levels to 1, for example with the environment variable <code>OMP_NUM_THREADS=1</code> in the workers.</p>

  <h2 id="mp-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>The mistake almost everyone makes once is forgetting the <code>if __name__ == "__main__":</code> guard. It works on Linux with older Pythons, because fork does not re-import your file, and then fails on macOS, Windows or Python 3.14+ with the bootstrapping <code>RuntimeError</code> and <code>BrokenProcessPool</code> from section 05. Put everything that creates processes or pools under the guard, always.</p>
  <p>The second is sending something that cannot be pickled, most often a lambda written to fix one of the function's arguments. The fix is a top-level function, and when you need to fix arguments, <code>functools.partial</code>, which records the function by name together with the fixed arguments and can therefore be pickled:</p>
  <div class="fx" data-lang="py">from concurrent.futures import ProcessPoolExecutor
from functools import partial
from workload import RIDERS, route_cost

if __name__ == "__main__":
    with ProcessPoolExecutor(max_workers=2) as ex:
        try:
            list(ex.map(lambda s: route_cost(s, depot=(5, 5)), RIDERS[:2]))   # MISTAKE
        except Exception as e:
            print("lambda :", type(e).__name__)
        fixed = partial(route_cost, depot=(5, 5))      # FIX: a top-level function + fixed argument
        print("partial:", list(ex.map(fixed, RIDERS[:2])))</div>
  <div class="fx" data-lang="text">lambda : PicklingError
partial: [40, 36]</div>
  <p>The lambda failed with <code>PicklingError</code>; the <code>partial</code> object, which is <code>route_cost</code> with <code>depot=(5, 5)</code> fixed, travelled to the workers without trouble. The same applies to open files, database connections and locks: create them inside the worker (an <code>initializer</code> is a good place) instead of sending them.</p>
  <p>The third is creating a new pool for every batch of work, often inside a function that is called in a loop. Every new pool starts its processes again:</p>
  <div class="fx" data-lang="py">import time
from concurrent.futures import ProcessPoolExecutor

def score(order_id):
    return order_id % 7

if __name__ == "__main__":
    t = time.perf_counter()
    for batch in range(10):
        with ProcessPoolExecutor(max_workers=4) as ex:      # MISTAKE: a new pool every time
            list(ex.map(score, range(batch * 100, batch * 100 + 100), chunksize=25))
    print(f"new pool per batch: {time.perf_counter() - t:.2f}s")

    t = time.perf_counter()
    with ProcessPoolExecutor(max_workers=4) as ex:          # FIX: one pool, reused
        for batch in range(10):
            list(ex.map(score, range(batch * 100, batch * 100 + 100), chunksize=25))
    print(f"one reused pool   : {time.perf_counter() - t:.2f}s")</div>
  <div class="fx" data-lang="text">new pool per batch: 0.09s
one reused pool   : 0.02s</div>
  <p>The work was identical, but starting a fresh pool ten times took several times as long as reusing one pool. With spawn, or with heavy imports, the difference is far larger. Create the pool once, near the top of your program, and pass it to the code that needs it.</p>
  <p>The remaining mistakes have all appeared earlier on this page. Expecting a child to fill a global list or dict leaves the parent's copy empty without any error; return the result instead. Sending thousands of tiny jobs with the default <code>chunksize=1</code> can be a hundred times slower than a loop. Passing a big dataset with every job costs time and memory; send paths or ranges. Updating a shared <code>Value</code> with <code>+= 1</code> without its lock loses updates. Joining a worker before draining its output queue, or giving a worker no poison pill, makes the program hang silently. And using more workers than cores for CPU work adds memory without adding speed.</p>

  <h2 id="mp-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key definitions</h3>
  <ul>
    <li><b>Process</b>: a separate running program with its own memory; each Python process has its own interpreter and GIL, so processes can compute in parallel.</li>
    <li><b>Process pool</b>: a fixed team of worker processes fed from a job queue (<code>ProcessPoolExecutor</code>, <code>mp.Pool</code>).</li>
    <li><b>Pickling</b>: turning objects into bytes (<code>pickle.dumps</code>) and back (<code>pickle.loads</code>); functions and classes travel by module + name.</li>
    <li><b>Start method</b>: <code>fork</code> (copy the parent), <code>spawn</code> (fresh interpreter, re-imports your file), <code>forkserver</code> (clean helper forks children).</li>
    <li><b>IPC</b>: inter-process communication: return values, <code>Queue</code>, <code>Pipe</code>, shared memory.</li>
    <li><b>Poison pill</b>: a special item (often <code>None</code>) telling a worker to stop.</li>
  </ul>
  <h3>APIs</h3>
  <div class="fx" data-lang="py">p = mp.Process(target=f, args=(x,)); p.start(); p.join(); p.exitcode

with mp.Pool(4) as pool:
    pool.map(f, xs); pool.starmap(g, pairs); pool.imap_unordered(f, xs)

with ProcessPoolExecutor(max_workers=4) as ex:      # under if __name__ == "__main__":
    list(ex.map(f, xs, chunksize=100))
    fut = ex.submit(f, x); fut.result()</div>
  <h3>Rules</h3>
  <ul>
    <li>Worker functions must be top-level: no lambdas or nested functions; use <code>functools.partial</code>.</li>
    <li>Not picklable: open files, sockets, locks, DB connections, generators.</li>
    <li>Always guard process-creating code with <code>if __name__ == "__main__":</code>.</li>
    <li>A child's changes to globals never reach the parent.</li>
  </ul>
  <table class="tbl">
    <tr><th>Start method</th><th>How</th><th>Default on</th></tr>
    <tr><td>fork</td><td>copy of the parent; fast; unsafe with threads</td><td>Linux up to 3.13</td></tr>
    <tr><td>spawn</td><td>fresh interpreter, re-imports your file</td><td>macOS, Windows</td></tr>
    <tr><td>forkserver</td><td>clean helper process forks children</td><td>Linux 3.14+</td></tr>
  </table>
  <h3>Costs</h3>
  <ul>
    <li>Worth it when work per job ≫ pickling + messaging per job, and total work ≫ start-up.</li>
    <li>Start-up: forked processes several × threads; spawned processes around 100 × threads.</li>
    <li><code>chunksize=k</code>: ⌈jobs ÷ k⌉ messages. <code>Executor.map</code> default 1; <code>Pool.map</code> automatic.</li>
    <li>Big arguments are copied per job and per worker: send paths or ranges.</li>
    <li>Speed-up ≤ number of cores (about 3–4× on 4 cores for the route job).</li>
  </ul>
  <h3>IPC and shared memory</h3>
  <table class="tbl">
    <tr><th>Tool</th><th>Notes</th></tr>
    <tr><td><code>mp.Queue</code></td><td>many ↔ many; pickled; poison pills; read results before joining</td></tr>
    <tr><td><code>mp.Pipe</code></td><td>two ends; <code>send</code> / <code>recv</code></td></tr>
    <tr><td><code>Value</code> / <code>Array</code></td><td>shared C numbers; <code>with v.get_lock():</code></td></tr>
    <tr><td><code>shared_memory</code></td><td>named block, numpy view; <code>close()</code> in each process, <code>unlink()</code> once</td></tr>
    <tr><td><code>Manager</code></td><td>shared dict/list via a helper process; slow</td></tr>
  </table>
  <h3>Gotchas</h3>
  <ul>
    <li>No guard → <code>RuntimeError</code> / <code>BrokenProcessPool</code> under spawn.</li>
    <li>Lambda to a pool → <code>PicklingError</code>.</li>
    <li>Unlocked shared <code>Value += 1</code> loses updates (no GIL between processes).</li>
    <li>A new pool per call pays start-up every time.</li>
    <li>Waiting jobs → threads/asyncio; array maths → numpy, often far faster than processes.</li>
    <li>Nested parallelism oversubscribes cores: set <code>OMP_NUM_THREADS=1</code> in workers.</li>
  </ul>

  <h2 id="mp-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Threads vs processes in Python: when do you use each?</summary><div class="qa-body">Threads for I/O-bound work: they are cheap, share memory, and release the GIL while waiting. Processes for CPU-bound pure-Python work: each has its own interpreter and GIL, so they run in parallel on different cores, at the cost of start-up time, memory, and pickling all the data that passes between them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does multiprocessing get around the GIL?</summary><div class="qa-body">It does not remove the GIL; it runs several interpreters. Each process has its own GIL, so the operating system can run Python code in each of them on a different core at the same time. The trade-off is that processes do not share memory, so they communicate through pickled messages or explicitly shared memory.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>If a child process changes a global variable, does the parent see the change?</summary><div class="qa-body">No. The child works on its own copy of memory (copied at fork, or rebuilt by importing under spawn), and its changes vanish when it exits. Results must be sent back on purpose: as return values through a pool, through a <code>Queue</code> or <code>Pipe</code>, or through shared memory such as <code>Value</code>, <code>Array</code> or <code>shared_memory</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is pickling, and why does multiprocessing need it?</summary><div class="qa-body">Pickling is serialising a Python object into bytes and rebuilding it later. Processes cannot read each other's memory, so the function to run, its arguments and its result are pickled, sent through an operating-system pipe and unpickled on the other side. Anything sent to a worker must therefore be picklable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't you pass a lambda to <code>ProcessPoolExecutor.map</code>?</summary><div class="qa-body">Functions are pickled by reference, as a module name plus a function name, and re-imported in the worker. A lambda, or a function defined inside another function, has no importable name, so pickling fails with <code>PicklingError</code>. Use a top-level function, wrapped in <code>functools.partial</code> if you need to fix some arguments.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What can and cannot be sent to a worker process?</summary><div class="qa-body">Anything picklable: numbers, strings, lists, dicts, tuples, dataclasses, numpy arrays, and top-level functions and classes. Not lambdas, nested functions, open files, sockets, locks, database connections or generators. Things that cannot be sent should be created inside the worker, for example in an <code>initializer</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do you need <code>if __name__ == "__main__":</code> with multiprocessing?</summary><div class="qa-body">With the spawn and forkserver start methods, every child imports your main script (as <code>__mp_main__</code>) to find the worker function. Any unguarded top-level code runs again in each child; if that code creates processes, the children try to start processes while still starting up, and <code>multiprocessing</code> raises <code>RuntimeError</code>. The guard makes that code run only in the parent. It is required on macOS and Windows, and on Linux by default from 3.14.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>fork vs spawn vs forkserver?</summary><div class="qa-body">fork copies the running parent: fast, and the child already has every function and variable, but unsafe if the parent has threads, because locks held by other threads are copied in the locked state. spawn starts a fresh interpreter that imports the main script: slower and safer, and it needs the guard and picklable workers. forkserver forks children from a clean, single-threaded helper process. Linux defaulted to fork up to 3.13 and uses forkserver from 3.14; macOS and Windows use spawn.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>multiprocessing.Pool</code> vs <code>ProcessPoolExecutor</code>?</summary><div class="qa-body">Both are process pools. <code>Pool</code> is older and has <code>map</code>, <code>imap</code>, <code>imap_unordered</code>, <code>starmap</code> and <code>apply_async</code>, with an automatic chunk size. <code>ProcessPoolExecutor</code> implements the <code>concurrent.futures</code> interface (Futures, <code>as_completed</code>), matches <code>ThreadPoolExecutor</code>, works with asyncio's <code>run_in_executor</code>, and raises <code>BrokenProcessPool</code> if a worker dies instead of hanging.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why might a <code>ProcessPoolExecutor</code> be slower than a plain loop?</summary><div class="qa-body">Overhead: starting the processes, pickling arguments and results, and by default one message per job. In the demo, 5000 tiny jobs took about 1 s in a pool against 0.01 s in a loop. Fix it with <code>chunksize</code> or larger jobs, send small arguments, reuse one pool, and do not parallelise work that is already fast.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>chunksize</code> do?</summary><div class="qa-body">It groups k input items into one message to a worker, so the pickling and messaging overhead is paid ⌈n ÷ k⌉ times instead of n times. It matters for many small jobs; very large chunks can leave some workers idle at the end. <code>Pool.map</code> picks one automatically; <code>ProcessPoolExecutor.map</code> defaults to 1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do processes communicate?</summary><div class="qa-body">By message passing, with <code>mp.Queue</code> (many senders and receivers) and <code>mp.Pipe</code> (two ends), both pickling every message; or through shared memory, with <code>Value</code> and <code>Array</code> for small typed data plus a lock, and <code>shared_memory.SharedMemory</code> for large buffers such as numpy arrays. <code>Manager</code> objects give shared dicts and lists, but every access is a slow round trip.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Processes are isolated, so why can <code>mp.Value</code> still have race conditions?</summary><div class="qa-body">A Value deliberately lives in shared memory, so it is no longer isolated. <code>v.value += 1</code> is still read, add, write, and the processes run truly in parallel with no GIL between them, so their steps interleave and updates are lost (more than half in the demo). Wrap the update in <code>with v.get_lock():</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you share a large numpy array with workers without copying it?</summary><div class="qa-body">Create <code>shared_memory.SharedMemory(create=True, size=arr.nbytes)</code>, wrap it with <code>np.ndarray(shape, dtype, buffer=shm.buf)</code>, copy the data in once, and pass the block's name, shape and dtype to the workers, which attach by name. Every process calls <code>close()</code>; one calls <code>unlink()</code> at the end. Workers that write to the same region still need coordination.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must you read all results from a <code>multiprocessing.Queue</code> before joining the workers?</summary><div class="qa-body">A process that has put items on a queue uses a background thread to push them into the underlying pipe, and it cannot exit until that data has been taken out. If the parent joins first, the parent waits for the child to exit while the child waits for the parent to read: a deadlock. Read everything, then join.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens when a worker process crashes?</summary><div class="qa-body">The crash stays in that process and the parent survives. A raw <code>Process</code> shows a non-zero (or negative, for a signal) <code>exitcode</code>. A <code>ProcessPoolExecutor</code> marks itself broken and pending futures raise <code>BrokenProcessPool</code>. An ordinary Python exception inside a pool job is pickled back and raised again by <code>future.result()</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many worker processes should you use?</summary><div class="qa-body">For CPU-bound work, about the number of cores this process may use (<code>os.cpu_count()</code>, or <code>os.process_cpu_count()</code> in 3.13+, or the container's CPU quota), fewer on shared machines or when each worker uses multi-threaded libraries. More workers than cores only add memory use and switching.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is numpy a better answer than multiprocessing?</summary><div class="qa-body">Often, yes. numpy runs the loop in compiled C with no Python object per element, removing the cost that processes can only divide among cores: in the demo numpy in one process was dozens of times faster than 4 processes of pure Python. Processes are for Python logic that cannot be vectorised, such as a permutation search. If you combine them, limit numpy's own threads in each worker to avoid oversubscription.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you parallelise feature engineering on a 20 GB CSV file?</summary><div class="qa-body">First try vectorised pandas or polars with chunked reading, which may be enough. If per-row Python logic is unavoidable, split the file by byte ranges, row ranges or into several files, and give each worker a path and range rather than data; each worker reads and processes its own slice and writes results to disk or returns small summaries. Use a <code>ProcessPoolExecutor</code> with about one worker per core and combine at the end. For much larger data, use Dask or Spark.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Where do you meet multiprocessing in machine-learning libraries?</summary><div class="qa-body">PyTorch's <code>DataLoader(num_workers=n)</code> loads and augments batches in worker processes, which is why datasets must be picklable and scripts need the main guard on Windows and macOS. scikit-learn and joblib's <code>n_jobs</code> use a process backend. Hyperparameter searches and parallel feature extraction commonly use process pools.</div></details>
</main>
`
});
