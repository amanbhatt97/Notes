// notes/python/py_multiprocessing.js — Processes: multiprocessing
Object.assign(TOPIC_CONTENT, {
  "py_multiprocessing": `<main>
<h1>Processes: multiprocessing</h1>
  <div class="where"><span>Python</span><span>Advanced Python</span><span>Concurrency</span><span>Processes</span></div>
  <p class="lead">Threads could not plan QuickBite's routes any faster, because the GIL lets only one thread run Python code at a time. This note gets around the GIL the direct way: run several separate Python programs, <strong>processes</strong>, each with its own interpreter and its own GIL, so 4 route plans really run on 4 cores at once. Then it pays the bill honestly. Processes share nothing, so data must be packed (pickled) to travel; your file is re-imported in every child, which is why <code>if __name__ == "__main__":</code> is required; and starting processes and copying data costs real time, which we measure, along with the fix (<code>chunksize</code>). Finally: how processes talk (<code>Queue</code>, <code>Pipe</code>), how they share memory (<code>Value</code>, <code>Array</code>, <code>shared_memory</code>), and when not to use them at all. Every block was run; times vary between runs, so read them as ratios.</p>

  <h2 id="mp-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 150" width="640">
    <defs><marker id="mp-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="200" y="8" width="240" height="30" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="28" text-anchor="middle" font-size="12">Concurrency in Python: the map</text>
    <line x1="320" y1="38" x2="110" y2="70" stroke="currentColor" stroke-opacity="0.45"/>
    <line x1="320" y1="38" x2="320" y2="70" stroke="currentColor" stroke-opacity="0.45"/>
    <line x1="320" y1="38" x2="530" y2="70" stroke="currentColor" stroke-opacity="0.45"/>
    <rect x="20" y="70" width="180" height="34" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="110" y="92" text-anchor="middle" font-size="12">Threads &amp; the GIL</text>
    <rect x="230" y="70" width="180" height="34" rx="6" class="fg sg" stroke-width="2.5"/><text x="320" y="92" text-anchor="middle" font-size="12" font-weight="700">Processes</text>
    <rect x="440" y="70" width="180" height="34" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="530" y="92" text-anchor="middle" font-size="12">asyncio</text>
    <line x1="200" y1="87" x2="226" y2="87" stroke="currentColor" marker-end="url(#mp-a0)"/>
    <line x1="410" y1="87" x2="436" y2="87" stroke="currentColor" marker-end="url(#mp-a0)"/>
    <text x="215" y="125" class="tm" font-size="11">GIL limit → own GIL each</text>
    <text x="420" y="125" class="tm" font-size="11">run_in_executor uses a process pool</text>
  </svg><figcaption>The Concurrency group. You are on the green note. It exists because of the GIL limit found in Threads; its process pool is reused by asyncio for the CPU-heavy part of QuickBite.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="py_threading">Threads &amp; the GIL</a></b><span>Threads overlapped the 20 menu waits (4.0 → 0.2 s), but 4 threads planned the 4 routes no faster than 1, because the GIL lets one thread at a time run Python bytecode. You also know <code>ThreadPoolExecutor</code>, <code>queue.Queue</code> and locks; this note has a twin of each.</span></li>
    <li><b>This note adds: real parallelism with processes</b><span>Why processes beat the GIL (measured), <code>Process</code>, <code>Pool</code> and <code>ProcessPoolExecutor</code>, pickling and the <code>__main__</code> guard, the cost of start-up and data copying (and <code>chunksize</code>), <code>Queue</code>/<code>Pipe</code>, <code>Value</code>/<code>Array</code>/<code>shared_memory</code>, and when not to use processes.</span></li>
    <li><b>Leads to: <a class="xref" data-note="py_asyncio">asyncio</a></b><span>Processes are expensive workers; you cannot have thousands. For many cheap waits, asyncio uses one thread, and hands CPU work to this note's process pool with <code>run_in_executor</code>.</span></li>
  </ol>

  <h2 id="mp-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The note as one chain. Numbers come from the running example: 4 riders × 9 stops, best route costs 40, 36, 35, 36; the 3-stop hand example costs 12.</p>
  <ol class="story">
    <li><b>Process</b><span>Q: how do we compute on 4 cores when threads cannot? → Separate Python programs, each with its own GIL: routes 1.75 s → 0.62 s, computed in 4 different processes. But do they share our variables like threads did?</span></li>
    <li><b>Separate memory</b><span>Q: what does a child see? → A copy. The child's <code>menus_seen</code> became 1; the parent's stayed 0. Results must be sent back. Must we manage processes one by one?</span></li>
    <li><b>Pool / ProcessPoolExecutor</b><span>Q: a ready-made pool? → <code>Pool.map</code> or <code>ProcessPoolExecutor</code> (the thread pool's twin): same 40, 36, 35, 36. How do arguments and results cross between separate memories?</span></li>
    <li><b>Pickling</b><span>Q: how does data travel? → Turned into bytes (a menu = 38 bytes), sent, rebuilt. Functions travel by name, so a lambda cannot. And the child must find that name…</span></li>
    <li><b>The __main__ guard</b><span>Q: why does every multiprocessing example have <code>if __name__ == "__main__":</code>? → With spawn, each child re-runs your file to find the functions; unguarded pool code then tries to start children of children: <code>RuntimeError</code>. So processes work. What do they cost?</span></li>
    <li><b>Start-up and copying cost</b><span>Q: is a process free? → 20 processes ≈ 25 ms vs 20 threads ≈ 3 ms; 5000 tiny jobs: 0.01 s in a loop, 1.03 s in a pool, 0.02 s with <code>chunksize</code>; a 9.9 MB argument ≈ 10× slower than sending a number. How do long-running workers exchange messages?</span></li>
    <li><b>Queue and Pipe</b><span>Q: how do processes talk while they run? → <code>mp.Queue</code> (many producers/consumers, poison pills) and <code>Pipe</code> (two ends). Every message is still pickled. Can they share memory instead?</span></li>
    <li><b>Shared memory</b><span>Q: one copy, many processes? → <code>Value</code> / <code>Array</code> (with a lock: 200,000; without: 79,536) and <code>shared_memory</code> for numpy arrays (child added 10 to every fare, parent saw it). So when are processes the wrong tool?</span></li>
    <li><b>When not to</b><span>Q: when do processes lose? → Waiting work (threads win 5×), tiny tasks, huge data, and numpy work (numpy alone beat 4 processes ≈ 24×).</span></li>
  </ol>

  <h2 id="mp-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Processes</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why</div>
        <ul>
          <li>Own interpreter, own GIL, own memory → <b>true parallelism</b></li>
          <li>Routes: 1.75 s → 0.62 s on 4 cores</li>
          <li>💡 separate kitchens in separate buildings</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">APIs</div>
        <ul>
          <li><code>mp.Process(target=f, args=…)</code>, <code>start</code>, <code>join</code>, <code>exitcode</code></li>
          <li><code>mp.Pool(4).map(f, xs)</code></li>
          <li><code>ProcessPoolExecutor</code>: <code>map</code>, <code>submit</code>, <code>as_completed</code></li>
          <li>Globals NOT shared: child 1, parent 0</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Rules</div>
        <ul>
          <li>Args and results are <b>pickled</b></li>
          <li>Functions travel by name → top-level only, no lambdas</li>
          <li><code>if __name__ == "__main__":</code> — children re-import the file (spawn)</li>
          <li>Start methods: fork (Linux ≤ 3.13), spawn (macOS, Windows), forkserver (Linux 3.14+)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Costs</div>
        <ul>
          <li>Start: 20 processes ≈ 25 ms vs 20 threads ≈ 3 ms</li>
          <li>Tiny tasks: <code>chunksize</code>! 1.03 s → 0.02 s</li>
          <li>Big args: 9.9 MB list 0.19 s vs 0.02 s</li>
          <li>RAM: every process has its own copy</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Talking &amp; sharing</div>
        <ul>
          <li><code>mp.Queue</code> — many ↔ many, poison pill</li>
          <li><code>Pipe</code> — exactly two ends</li>
          <li><code>Value</code> / <code>Array</code> — shared C numbers; lock them</li>
          <li><code>shared_memory</code> — zero-copy buffer for numpy; <code>close</code> + <code>unlink</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">When not</div>
        <ul>
          <li>I/O-bound → threads/asyncio</li>
          <li>numpy/pandas → vectorise (≈ 24× faster here)</li>
          <li>Tiny jobs, huge per-task data</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mp-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="mp-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Processes Beat the GIL</span><span class="rm-sub">Routes on 4 cores, measured</span></div></div>
      <div class="rm-item rm-done" data-target="mp-process"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">A Process by Hand</span><span class="rm-sub">Separate memory</span></div></div>
      <div class="rm-item rm-done" data-target="mp-pool"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Pools</span><span class="rm-sub">Pool and ProcessPoolExecutor</span></div></div>
      <div class="rm-item rm-done" data-target="mp-pickle"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Pickling and the __main__ Guard</span><span class="rm-sub">How data and code travel</span></div></div>
      <div class="rm-item rm-done" data-target="mp-cost"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">What Processes Cost</span><span class="rm-sub">Start-up, chunksize, copying</span></div></div>
      <div class="rm-item rm-done" data-target="mp-ipc"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Queue and Pipe</span><span class="rm-sub">Messages between processes</span></div></div>
      <div class="rm-item rm-done" data-target="mp-shared"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Shared Memory</span><span class="rm-sub">Value, Array, shared_memory</span></div></div>
      <div class="rm-item rm-done" data-target="mp-when"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">When Not to Use Processes</span><span class="rm-sub">Measured counter-examples</span></div></div>
      <div class="rm-item rm-done" data-target="mp-connect"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One table, one picture</span></div></div>
      <div class="rm-item rm-done" data-target="mp-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Symptoms and fixes</span></div></div>
      <div class="rm-item rm-done" data-target="mp-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="mp-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview and connection checks</span></div></div>
    </div>
  </div>

  <h2 id="mp-why"><span class="num">01</span>Why Processes Beat the GIL</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The GIL is one lock per interpreter, so threads inside one Python program can only take turns at calculation. How do we get 4 route plans to run on 4 cores at literally the same time?</p>
  </div>
  <h3>The running example, again</h3>
  <p>All code imports from <code>quickbite.py</code> (introduced in <a class="xref" data-note="py_concurrency">the map</a>). The CPU-heavy job is <code>route_cost(stops)</code>: try all 9! = 362,880 orders of a rider's 9 stops and keep the shortest total distance. On three stops A (2, 1), B (5, 3), C (1, 4) from the depot (0, 0) it tries 6 orders and the best, A → C → B, costs 3 + 4 + 5 = 12.</p>
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
  <p>If one interpreter can only run one thread's Python at a time, start <em>more interpreters</em>. A <strong>process</strong> is a running program with its own memory. Each new Python process has its own interpreter and therefore its own GIL. Four processes can run Python on four cores at the same instant, and the operating system spreads them across the cores for us.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Threads are cooks in one kitchen sharing one knife (the GIL): however many cooks, only one chops at a time. Processes are separate kitchens in separate buildings, each with its own knife: four kitchens chop four crates at once. The price: nothing is shared, so ingredients go back and forth by courier (pickling), and opening a kitchen takes time.</p></div>
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
  </svg><figcaption>Separate programs, each with its own GIL and memory. Data crosses between them as pickled messages (solid arrows) or, for big arrays, by attaching to one shared memory block (dashed lines).</figcaption></figure>
  <h3>Measured</h3>
  <p>The same 4 route plans, first in a loop, then in a <code>ProcessPoolExecutor</code> with 4 worker processes (the API is the twin of <code>ThreadPoolExecutor</code>). Each job also returns <code>os.getpid()</code>, the operating system's ID number for the process it ran in. All the pool code sits under <code>if __name__ == "__main__":</code>; section 04 explains why that is required.</p>
  <div class="fx" data-lang="py">import os, time
from concurrent.futures import ProcessPoolExecutor
from quickbite import RIDERS, route_cost

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
  <div class="fx" data-lang="text">sequential : [40, 36, 35, 36] in 1.75s
4 processes: [40, 36, 35, 36] in 0.62s
worker pids all differ from main: True, distinct workers used: 4</div>
  <p>About 2.8× faster (1.75 s → 0.62 s) with identical answers, and the PIDs prove the work ran in 4 different processes, none of them the main one. Compare <a class="xref" data-note="py_threading">Threads</a>, where 4 threads took as long as the loop. Why not a full 4×? Starting 4 processes and sending each its job costs a little, the 4 jobs are not exactly equal in size, and other programs on the machine share the cores. On idle cores with longer jobs the ratio gets closer to the core count, never above it.</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>process</strong> is an independent running program with its own memory space, scheduled by the operating system. In Python, each process runs its own interpreter with its own GIL, so CPU-bound Python code in <em>n</em> processes can use up to <em>n</em> cores. Best possible speed-up ≈ number of cores (<strong>parallelism</strong>), minus overheads.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Starting more processes than cores for CPU work. 16 processes on 4 cores do not compute faster than 4; they just take turns and use 4× the memory. <code>ProcessPoolExecutor()</code> defaults to <code>os.cpu_count()</code>; on a shared machine use fewer.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: A Process by Hand.</b> Threads shared every variable. Processes have "their own memory". What does that mean concretely when a child changes a global?</div>

  <h2 id="mp-process"><span class="num">02</span>A Process by Hand</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>With threads, a worker could write into a shared dict and <code>main</code> saw it. If a child <em>process</em> changes a global variable, does the parent see the change?</p>
  </div>
  <p><code>multiprocessing.Process</code> mirrors <code>threading.Thread</code>: <code>Process(target=f, args=(…,))</code>, <code>start()</code>, <code>join()</code>. It adds <code>exitcode</code> (0 means the child ended normally) and <code>is_alive()</code>. The child below fetches R01's menu and adds 1 to a global counter.</p>
  <div class="fx" data-lang="py">import multiprocessing as mp
from quickbite import fetch_menu

menus_seen = 0                                 # a global in the parent

def child(rid):
    global menus_seen
    menu = fetch_menu(rid)
    menus_seen += 1                            # changes the CHILD's copy
    print(f"child  [{mp.current_process().name}] got {menu}, menus_seen = {menus_seen}")

if __name__ == "__main__":
    p = mp.Process(target=child, args=("R01",), name="kitchen-1")
    print("parent: alive before start?", p.is_alive())
    p.start()                                  # a new Python process begins
    p.join()                                   # wait for it to exit
    print("parent: exitcode", p.exitcode, "| parent's menus_seen =", menus_seen)</div>
  <div class="fx" data-lang="text">parent: alive before start? False
child  [kitchen-1] got {'id': 'R01', 'dishes': 4}, menus_seen = 1
parent: exitcode 0 | parent's menus_seen = 0</div>
  <p>The child saw <code>menus_seen = 1</code>; the parent, after the child finished, still had 0. When the child started, it got its <em>own copy</em> of the program's memory; its <code>+= 1</code> changed that copy, which disappeared when the child exited. Nothing flows back unless you send it.</p>
  <table class="tbl"><caption>Thread vs process, side by side</caption>
    <tr><th></th><th>Thread</th><th>Process</th></tr>
    <tr><td>Memory</td><td>shared with all threads</td><td>own copy; nothing shared by default</td></tr>
    <tr><td>GIL</td><td>one for all threads</td><td>one per process</td></tr>
    <tr><td>CPU-bound Python</td><td>no speed-up</td><td>up to × cores</td></tr>
    <tr><td>Getting results back</td><td>write to a shared variable</td><td>return value via a pool, Queue, Pipe, or shared memory</td></tr>
    <tr><td>Start-up cost</td><td>tiny</td><td>noticeable (section 05)</td></tr>
    <tr><td>A crash</td><td>can corrupt shared state</td><td>isolated; parent sees a non-zero <code>exitcode</code></td></tr>
    <tr><td>Races</td><td>on any shared variable</td><td>only on what you explicitly share</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>Photocopying a recipe book for a second kitchen. The second kitchen can scribble on its copy all day; your original is untouched. If you want their notes, they have to send them back.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Process isolation</strong>: each process has its own address space; changes in one are invisible to others. Data moves between processes only through <strong>IPC</strong> (inter-process communication): return values, queues, pipes, shared memory, files, sockets.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Expecting a child to fill a global list or dict, as you would with threads. The parent's copy stays empty and no error tells you so. Return the result instead.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Pools.</b> Creating, starting and joining processes one by one, and finding a way to send results back, is fiddly. Is there a pool, like <code>ThreadPoolExecutor</code>, that returns results for us?</div>

  <h2 id="mp-pool"><span class="num">03</span>Pools: Pool and ProcessPoolExecutor</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How do we run <code>route_cost</code> over the 4 riders on 4 worker processes and simply get the 4 return values back?</p>
  </div>
  <p>Two APIs do it. <code>multiprocessing.Pool</code> is the older one, with <code>map</code>, <code>imap</code>, <code>starmap</code> and <code>apply_async</code>. <code>concurrent.futures.ProcessPoolExecutor</code> is the newer one, with exactly the interface you learned for threads: <code>map</code>, <code>submit</code>, futures and <code>as_completed</code>. Both start the workers, send each job, and pickle the return value back.</p>
  <div class="fx" data-lang="py">import multiprocessing as mp
from concurrent.futures import ProcessPoolExecutor, as_completed
from quickbite import RIDERS, route_cost

if __name__ == "__main__":
    with mp.Pool(processes=4) as pool:                 # the older API
        print("Pool.map            :", pool.map(route_cost, RIDERS))
    with ProcessPoolExecutor(max_workers=4) as ex:     # same interface as ThreadPoolExecutor
        print("Executor.map        :", list(ex.map(route_cost, RIDERS)))
        futs = {ex.submit(route_cost, s): n for n, s in enumerate(RIDERS, start=1)}
        print("submit+as_completed :", sorted((futs[f], f.result()) for f in as_completed(futs)))</div>
  <div class="fx" data-lang="text">Pool.map            : [40, 36, 35, 36]
Executor.map        : [40, 36, 35, 36]
submit+as_completed : [(1, 40), (2, 36), (3, 35), (4, 36)]</div>
  <p>The same four costs from all three. <code>Pool.map</code> and <code>Executor.map</code> return results in input order. With <code>submit</code> we kept a dict from each future to its rider number and sorted, because <code>as_completed</code> yields futures in finish order. Leaving each <code>with</code> block shuts the pool down.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A delivery company with a fixed fleet of 4 vans (workers). You hand the dispatcher a list of jobs; the dispatcher gives each free van the next job and hands you the results. You never deal with individual vans.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Process pool</strong>: a fixed set of worker processes that take jobs from an internal queue and send results back. <code>ProcessPoolExecutor(max_workers=n)</code> (default: CPU count); <code>map(fn, *iterables, chunksize=1)</code>; <code>submit(fn, *args)</code> → Future. <code>mp.Pool(processes=n)</code>; <code>map</code>, <code>imap</code> (lazy), <code>imap_unordered</code>, <code>starmap</code> (several arguments), <code>apply_async</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Creating a new pool inside a loop or for every request. Each pool starts fresh processes (section 05 measures the cost). Create one pool and reuse it for the whole run.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Pickling and the __main__ Guard.</b> The pool "sent" <code>route_cost</code> and the stops to other processes and got numbers back, between memories that share nothing. How? And why must the code sit under <code>if __name__ == "__main__":</code>?</div>

  <h2 id="mp-pickle"><span class="num">04</span>Pickling and the __main__ Guard</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Two processes cannot look at each other's memory. So how does a list of stops get from the parent into a worker, and how does the worker know what <code>route_cost</code> is?</p>
  </div>
  <h3>Pickling: objects to bytes and back</h3>
  <p>Anything sent to a worker (the function, its arguments) and anything sent back (the result) is turned into a string of bytes with Python's <code>pickle</code> module, sent through an operating-system pipe, and rebuilt on the other side. This is called <strong>pickling</strong> (serialising) and <strong>unpickling</strong>.</p>
  <div class="fx" data-lang="py">import pickle
from quickbite import route_cost

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
a function travels BY NAME: b'\\x80\\x04\\x95\\x1c\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x8c\\tquickbite\\x94\\x8c\\nroute_cost\\x94\\x93\\x94.'
PicklingError: Can't pickle &lt;function &lt;lambda&gt; at 0x7f643a7071a0&gt;: attribute lookup &lt;lambda&gt; on __main__ failed</div>
  <p>A menu dict became 38 bytes and came back equal. The interesting line is the function: its pickle contains just two names, <code>quickbite</code> and <code>route_cost</code>. <strong>Functions are not copied, they are pickled by name</strong>: "import <code>quickbite</code> and take its <code>route_cost</code>". The worker rebuilds it by importing. A lambda has no importable name (it is called <code>&lt;lambda&gt;</code>), so pickling it fails, and so does sending it to a pool:</p>
  <div class="fx" data-lang="py">from concurrent.futures import ProcessPoolExecutor
from quickbite import RIDERS, route_cost

if __name__ == "__main__":
    with ProcessPoolExecutor(max_workers=2) as ex:
        try:
            print(list(ex.map(lambda s: route_cost(s), RIDERS[:2])))
        except Exception as e:
            print(type(e).__name__ + ":", e)</div>
  <div class="fx" data-lang="text">PicklingError: Can't pickle &lt;function &lt;lambda&gt; at 0x7f3e662b3240&gt;: attribute lookup &lt;lambda&gt; on __main__ failed</div>
  <p>The rule that follows: <strong>the function you give a process pool must be defined at the top level of a module</strong>, not a lambda, not a function defined inside another function, not a method of an object that cannot be pickled. Arguments and return values must be picklable too (numbers, strings, lists, dicts, dataclasses, numpy arrays are; open files, sockets, locks and database connections are not).</p>
  <h3>Why if __name__ == "__main__": is required</h3>
  <p>How does a worker "import" the function if it is in the very script you are running? It imports your script. There are three ways to start a child process (<strong>start methods</strong>):</p>
  <ul>
    <li><strong>fork</strong>: the child is an exact copy of the parent at that moment, functions and all. Default on Linux up to Python 3.13 (this machine: it printed <code>fork</code> below).</li>
    <li><strong>spawn</strong>: the child is a brand-new Python that <em>imports your main script</em> to find the functions. Default on macOS and Windows.</li>
    <li><strong>forkserver</strong>: a clean helper process forks children on request. Default on Linux from Python 3.14.</li>
  </ul>
  <p>With spawn, the child runs your file from the top, but with <code>__name__</code> set to <code>"__mp_main__"</code> instead of <code>"__main__"</code>. Watch it happen: the script prints a line at the top, then starts two spawned children one after the other.</p>
  <div class="fx" data-lang="py">import multiprocessing as mp

print(f"top of the file runs, __name__ = {__name__!r}")

def plan(rider):
    print(f"   worker plans rider {rider}")

if __name__ == "__main__":
    print("default start method here:", mp.get_start_method())
    ctx = mp.get_context("spawn")              # how macOS and Windows start children
    kids = [ctx.Process(target=plan, args=(n,)) for n in (1, 2)]
    for k in kids:
        k.start(); k.join()                    # one at a time, so the output is in order</div>
  <div class="fx" data-lang="text">top of the file runs, __name__ = '__main__'
default start method here: fork
top of the file runs, __name__ = '__mp_main__'
   worker plans rider 1
top of the file runs, __name__ = '__mp_main__'
   worker plans rider 2</div>
  <p>"top of the file runs" appeared three times: once in the parent (<code>__main__</code>) and once in each child (<code>__mp_main__</code>), before the child ran <code>plan</code>. Code under <code>if __name__ == "__main__":</code> ran only in the parent, because in the children the condition is false. Now remove the guard, so the pool-creating code is at the top level:</p>
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
  <p>Each child re-ran the file, reached the pool code, and tried to start children of its own while it was still starting up; <code>multiprocessing</code> detects this and raises <code>RuntimeError</code> in the child, its message telling you to use the <code>__main__</code> idiom; the parent's pool then reports <code>BrokenProcessPool</code>. (We trimmed the long tracebacks; the remaining lines are verbatim.) Without that check you would get an explosion of processes. With fork the same script happens to work on Linux, which is exactly why code written on Linux breaks on a colleague's Mac: always use the guard.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Hiring a temp cook by sending them your whole recipe binder (spawn re-imports your file). If page one of the binder says "hire four temp cooks", every temp reads it and tries to hire four more. The guard is a note on that page: "only the head chef does this".</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Pickling</strong>: serialising an object to bytes (<code>pickle.dumps</code>) and back (<code>pickle.loads</code>). Functions and classes pickle by reference (module + qualified name). <strong>Start method</strong>: <code>fork</code>, <code>spawn</code> or <code>forkserver</code>; see <code>mp.get_start_method()</code>, choose with <code>mp.get_context("spawn")</code>. <strong>The guard</strong>: <code>if __name__ == "__main__":</code> keeps process-creating code from running when a child imports the main module.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Running process pools from a Jupyter notebook with spawn (macOS/Windows): functions defined in the notebook live in <code>__main__</code>, which the child cannot import, so you get pickling or attribute errors. Put the worker function in a <code>.py</code> module and import it, as QuickBite does with <code>quickbite.py</code>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: What Processes Cost.</b> Every job now involves starting processes, pickling, sending through a pipe and unpickling. How much does that cost, and when does it eat the whole speed-up?</div>

  <h2 id="mp-cost"><span class="num">05</span>What Processes Cost</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Routes got 2.8× faster. Will processes speed up <em>any</em> CPU work? What happens with thousands of tiny jobs, or with jobs that need a lot of data?</p>
  </div>
  <h3>Cost 1: starting a process</h3>
  <div class="fx" data-lang="py">import threading, multiprocessing as mp, time

def nothing():
    pass

if __name__ == "__main__":
    for kind, make in (("thread", threading.Thread), ("process", mp.Process)):
        t = time.perf_counter()
        workers = [make(target=nothing) for _ in range(20)]
        for w in workers: w.start()
        for w in workers: w.join()
        print(f"start + join 20 {kind:&lt;7}: {(time.perf_counter() - t) * 1000:6.1f} ms")</div>
  <div class="fx" data-lang="text">start + join 20 thread :    2.8 ms
start + join 20 process:   25.3 ms</div>
  <p>Starting and joining 20 processes took about 9× as long as 20 threads (25 ms vs 3 ms here, with fork; spawn is slower still, because each child starts a fresh interpreter and re-imports your modules). Tens of milliseconds is nothing next to a 1.75 s job, but it is not free.</p>
  <h3>Cost 2: one message per job (and the fix, chunksize)</h3>
  <p>Now 5000 copies of the tiny 3-stop hand example (each answer 12). Each job takes microseconds. By default <code>ProcessPoolExecutor.map</code> sends each item as its own message: pickle, send, unpickle, compute, pickle the result, send, unpickle, 5000 times. <code>chunksize=k</code> sends k items per message.</p>
  <div class="fx" data-lang="py">import time
from concurrent.futures import ProcessPoolExecutor
from quickbite import route_cost

TINY = [[(2, 1), (5, 3), (1, 4)]] * 5000       # 5000 copies of the 3-stop hand example

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
4 procs chunksize=1   : 1.03s  same answers: True
4 procs chunksize=50  : 0.03s  same answers: True
4 procs chunksize=1250: 0.02s  same answers: True</div>
  <p>The loop took 0.01 s. The pool with one item per message took about 1 s: roughly 100× <em>slower</em> than doing nothing clever, because the messaging cost dwarfed the work. With <code>chunksize=50</code> there are 100 messages instead of 5000, and the time fell to 0.03 s; with 1250 (one chunk per worker) to 0.02 s. Still not faster than the loop: the whole job was too small to be worth parallelising. That is the lesson in both directions: <strong>batch tiny tasks, and do not parallelise work that is already fast</strong>. (<code>mp.Pool.map</code> picks a chunksize automatically; <code>ProcessPoolExecutor.map</code> defaults to 1.)</p>
  <table class="tbl"><caption>5000 tiny jobs, by hand</caption>
    <tr><th>chunksize</th><th>messages each way</th><th>measured</th></tr>
    <tr><td>1</td><td>5000</td><td>1.03 s</td></tr>
    <tr><td>50</td><td>5000 / 50 = 100</td><td>0.03 s</td></tr>
    <tr><td>1250</td><td>5000 / 1250 = 4</td><td>0.02 s</td></tr>
    <tr><td>(plain loop)</td><td>0</td><td>0.01 s</td></tr>
  </table>
  <h3>Cost 3: copying data</h3>
  <p>QuickBite's order history is a list of 2 million numbers. Sending it to a worker means pickling ~10 MB, pushing it through a pipe and unpickling it. Compare sending the list with sending just one number and letting the worker get its own data.</p>
  <div class="fx" data-lang="py">import pickle, time
from concurrent.futures import ProcessPoolExecutor

ORDERS = list(range(2_000_000))                # a big order history

def count_given(orders):                       # data travels with the call
    return len(orders)

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
  <div class="fx" data-lang="text">pickled size: 9.9 MB, pickling alone took 0.029s
send the list : 0.191s
send just 'n' : 0.017s</div>
  <p>The worker was started first (a warm-up job) so that only the data transfer is timed. Sending the 9.9 MB list took about 10× longer than sending a number, and in a real pool every task that receives it pays again, and every worker holds its own copy in RAM. The fix: send small descriptions (a file path, a row range, an ID) and let each worker load its own slice, or use shared memory (section 07).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Hiring four removal vans to move one teacup: by the time the vans arrive and are loaded, you could have carried it. And if each van must first receive the entire contents of your house to move one room, the vans are not saving time.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>Speed-up is worth it only when <strong>work per task ≫ overhead per task</strong> (pickling arguments and results + messaging) and total work ≫ pool start-up. <strong>chunksize</strong> amortises the per-message overhead over many items.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Passing a big pandas DataFrame to every task. Pickling it can cost more than the work, and each worker holds a copy (4 workers × a 2 GB frame = 8 GB). Pass paths or index ranges.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Queue and Pipe.</b> Pools are request/response: send a job, get a result. What about long-running workers that keep exchanging messages with the parent, like a route-planning service?</div>

  <h2 id="mp-ipc"><span class="num">06</span>Queue and Pipe</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>With threads we used <code>queue.Queue</code> to hand work between workers. Processes do not share memory, so that queue cannot be shared. What is the process version?</p>
  </div>
  <h3>multiprocessing.Queue: the same pattern across processes</h3>
  <p><code>mp.Queue</code> looks exactly like <code>queue.Queue</code> (<code>put</code>, <code>get</code>), but each item is pickled and sent through a pipe to whichever process calls <code>get</code>. Two long-running planner processes take riders from <code>tasks</code> and put results on <code>results</code>, stopping at a <code>None</code> pill, just like the threaded fetchers.</p>
  <div class="fx" data-lang="py">import multiprocessing as mp
from quickbite import RIDERS, route_cost

def planner(tasks, results):
    while (job := tasks.get()) is not None:    # None = poison pill
        n, stops = job
        results.put((n, route_cost(stops), mp.current_process().name))

if __name__ == "__main__":
    tasks, results = mp.Queue(), mp.Queue()
    procs = [mp.Process(target=planner, args=(tasks, results), name=f"planner-{i}") for i in (1, 2)]
    for p in procs: p.start()
    for n, stops in enumerate(RIDERS, start=1):
        tasks.put((n, stops))
    for _ in procs: tasks.put(None)            # one pill per worker
    out = sorted(results.get() for _ in RIDERS)
    for p in procs: p.join()
    for n, cost, who in out:
        print(f"rider {n}: cost {cost}  (by {who})")</div>
  <div class="fx" data-lang="text">rider 1: cost 40  (by planner-1)
rider 2: cost 36  (by planner-2)
rider 3: cost 35  (by planner-2)
rider 4: cost 36  (by planner-1)</div>
  <p>The same four costs, shared between two worker processes (which one took which rider varies between runs, so we sort the results). The pills go in after the real work, one per worker. We read all 4 results <em>before</em> joining the workers: a process that has put items on a queue may not exit until they are taken off, so joining first can hang.</p>
  <h3>Pipe: exactly two ends</h3>
  <p><code>mp.Pipe()</code> returns two connected ends. Whatever is <code>send</code>-ed on one end is <code>recv</code>-ed on the other (pickled on the way), in both directions.</p>
  <div class="fx" data-lang="py">import multiprocessing as mp
from quickbite import route_cost

def courier(conn):
    stops = conn.recv()                        # wait for a message
    conn.send(route_cost(stops))               # answer on the same pipe
    conn.close()

if __name__ == "__main__":
    here, there = mp.Pipe()                    # two connected ends
    p = mp.Process(target=courier, args=(there,)); p.start()
    here.send([(2, 1), (5, 3), (1, 4)])
    print("child says the best route costs", here.recv())
    p.join()</div>
  <div class="fx" data-lang="text">child says the best route costs 12</div>
  <p>The parent sent the three hand-example stops; the child computed 12 and sent it back on the same pipe.</p>
  <table class="tbl">
    <tr><th>Channel</th><th>Shape</th><th>Cost</th><th>Pick when</th></tr>
    <tr><td><code>mp.Queue</code></td><td>many producers ↔ many consumers</td><td>pickle each item; a background feeder thread</td><td>work queues, result collection</td></tr>
    <tr><td><code>Pipe</code></td><td>exactly two ends, two-way</td><td>pickle; a little faster than Queue</td><td>parent ↔ one child conversations</td></tr>
    <tr><td><code>Value</code> / <code>Array</code></td><td>typed C numbers in shared memory</td><td>no pickling; needs a lock</td><td>counters, flags, small result arrays</td></tr>
    <tr><td><code>shared_memory</code></td><td>raw buffer attached by name</td><td>zero-copy</td><td>big numpy arrays read by many workers</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>A Queue is a post box many people drop letters into and many collect from. A Pipe is a private telephone line between two people. Either way, everything said is copied (pickled), never handed over physically.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>mp.Queue</strong>: a process-safe FIFO built on a pipe plus locks; items are pickled. <strong>mp.Pipe(duplex=True)</strong>: a pair of <code>Connection</code> objects with <code>send</code>, <code>recv</code>, <code>poll</code>, <code>close</code>. Both are forms of <strong>message passing</strong>: processes share data by copying messages, not by sharing variables.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Joining a worker before draining its output queue, or forgetting a pill for one worker: both hang with no error. Drain first, then join; one pill per worker.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Shared Memory.</b> Every message is a copy. For a counter updated 200,000 times, or a large array many workers read, copying is wasteful. Can processes share one piece of memory after all?</div>

  <h2 id="mp-shared"><span class="num">07</span>Shared Memory</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can several processes read and write the <em>same</em> memory, without pickling, and what problems from the threads note come back if they do?</p>
  </div>
  <h3>Value and Array</h3>
  <p><code>mp.Value("i", 0)</code> creates one C integer (<code>"i"</code>; <code>"d"</code> would be a float) in memory that child processes can see; <code>mp.Array("i", 4)</code> creates 4 of them. They have a <code>.value</code> (or index access) and a built-in lock, <code>get_lock()</code>. Four processes each record 50,000 views, first without the lock, then with it; then four children each write one rider's cost into an Array slot.</p>
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
  <div class="fx" data-lang="text">Value, lock=False: 79536 / 200000
Value, lock=True : 200000 / 200000
Array after children: [40, 36, 35, 36]</div>
  <p>Without the lock: 79,536 of 200,000. The race condition from <a class="xref" data-note="py_threading">Threads &amp; the GIL</a> is back, and worse, because these are truly parallel processes on different cores (there is no GIL between processes). <code>v.value += 1</code> is still read, add, write. With <code>with v.get_lock():</code> (a lock is a context manager, <a class="xref" data-note="py_context">Context Managers</a>) it is exactly 200,000. The Array needed no lock, because each child wrote only its own slot.</p>
  <h3>shared_memory: a zero-copy block for numpy</h3>
  <p><code>multiprocessing.shared_memory.SharedMemory</code> creates a raw block of bytes with a name. Any process can attach to it by name and view it as a numpy array; nothing is pickled or copied. The parent stores the four route costs as fares, a child adds a 10-unit tip to every fare in place, and the parent sees the change.</p>
  <div class="fx" data-lang="py">import multiprocessing as mp
from multiprocessing import shared_memory
import numpy as np

def add_tip(name, shape):
    shm = shared_memory.SharedMemory(name=name)               # attach by name
    fares = np.ndarray(shape, dtype=np.float64, buffer=shm.buf)
    fares += 10                                               # in place: no copy, no pickling
    del fares
    shm.close()

if __name__ == "__main__":
    shm = shared_memory.SharedMemory(create=True, size=4 * 8)  # room for 4 float64
    fares = np.ndarray((4,), dtype=np.float64, buffer=shm.buf)
    fares[:] = [40, 36, 35, 36]                                # route costs as fares
    p = mp.Process(target=add_tip, args=(shm.name, fares.shape)); p.start(); p.join()
    print("parent sees after child:", fares)
    del fares
    shm.close(); shm.unlink()                                  # free the block once</div>
  <div class="fx" data-lang="text">parent sees after child: [50. 46. 45. 46.]</div>
  <p>The parent saw [50, 46, 45, 46]: the child changed the parent's data directly. The cleanup rules: every process calls <code>close()</code> when done with the block (we first <code>del</code> the numpy view, because it still points into it), and exactly one process calls <code>unlink()</code> at the end to free it.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Instead of photocopying the whiteboard for each kitchen, put one whiteboard in the corridor that all kitchens can write on. No copying, but now two cooks can write on the same spot at once, so you need a marker that only one can hold (the lock).</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Value(typecode, init)</strong> / <strong>Array(typecode, size)</strong>: ctypes objects in shared memory, with an associated lock (<code>get_lock()</code>). <strong>SharedMemory(create=True, size=…)</strong> / <strong>SharedMemory(name=…)</strong>: a named block; <code>.buf</code> is a memoryview; <code>close()</code> per process, <code>unlink()</code> once. Shared memory removes copying but brings back races, so coordinate writers.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Forgetting <code>unlink()</code> (the block outlives your program until reboot on some systems) or calling it while others still use the block. And treating <code>v.value += 1</code> as safe: it lost 60% of the updates above.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: When Not to Use Processes.</b> We can now run, feed and coordinate processes. When is all of this the wrong tool?</div>

  <h2 id="mp-when"><span class="num">08</span>When Not to Use Processes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Processes gave real parallelism for route planning. Which jobs look like candidates but are actually faster without them?</p>
  </div>
  <p>One more measurement: the sum of i² for i below 2 million, three ways. Pure Python in one process, pure Python split over 4 processes, and numpy in one process (the data already in an array, as it would be in numpy work).</p>
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
  <div class="fx" data-lang="text">pure Python, 1 process : 0.156s
pure Python, 4 processes: 0.073s
numpy, 1 process        : 0.003s
same answer: True</div>
  <p>Four processes made the pure-Python loop about 2× faster. numpy, in a single process, was about 24× faster than the 4 processes, because it runs the loop in compiled C with no Python objects per number. If your work can be expressed as numpy/pandas operations, do that first; parallelise only what remains.</p>
  <table class="tbl"><caption>When processes lose (all measured in this group)</caption>
    <tr><th>Situation</th><th>Why processes lose</th><th>Evidence</th><th>Use instead</th></tr>
    <tr><td>Waiting (I/O-bound)</td><td>waiting does not need a core; only 4 waits overlap</td><td>20 menus: processes 1.02 s, threads 0.20 s (<a class="xref" data-note="py_concurrency">map</a>)</td><td>threads or asyncio</td></tr>
    <tr><td>Tiny tasks</td><td>messaging overhead per task</td><td>5000 tiny routes: 1.03 s vs loop 0.01 s</td><td>a loop, or big chunks</td></tr>
    <tr><td>Huge data per task</td><td>pickling and copying</td><td>9.9 MB list: 0.19 s vs 0.02 s</td><td>send paths/ranges; shared memory</td></tr>
    <tr><td>numpy / pandas work</td><td>C code is already fast (and often multi-core)</td><td>numpy 0.003 s vs 4 processes 0.073 s</td><td>vectorise</td></tr>
    <tr><td>Very short scripts</td><td>pool start-up dominates</td><td>20 processes ≈ 25 ms to start</td><td>a loop</td></tr>
    <tr><td>Memory-tight machines</td><td>each process has its own interpreter and data</td><td>(4 workers ≈ 4× RAM for copied data)</td><td>shared memory, fewer workers</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>Opening extra kitchens pays off for a banquet, not for a cup of tea, not for waiting on deliveries, and not when a food processor (numpy) can do the chopping in seconds.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>Use processes when the work is <strong>CPU-bound, in pure Python, made of tasks that are each long compared with the overhead, with small inputs and outputs</strong>. QuickBite's route plans fit all four conditions.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Nesting parallelism: a process pool whose workers each call numpy or scikit-learn with all cores (<code>n_jobs=-1</code>) oversubscribes the CPU; 4 workers × 4 threads each fight over 4 cores. Set one level to 1 (for example <code>OMP_NUM_THREADS=1</code> in workers).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> One picture of how processes, pickling, the guard, costs and sharing fit together.</div>

  <h2 id="mp-connect"><span class="num">09</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Why does every rule in this note (pickling, the guard, chunksize, locks on Values) follow from one design choice?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 260" width="680">
    <defs><marker id="mp-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="230" y="8" width="220" height="40" rx="6" class="fb sb"/><text x="340" y="26" text-anchor="middle" font-size="12">separate processes</text><text x="340" y="41" text-anchor="middle" class="tm" font-size="10">own interpreter, own memory</text>
    <line x1="280" y1="48" x2="130" y2="84" stroke="currentColor" marker-end="url(#mp-a9)"/>
    <line x1="400" y1="48" x2="550" y2="84" stroke="currentColor" marker-end="url(#mp-a9)"/>
    <rect x="40" y="86" width="180" height="40" rx="6" class="fg sg"/><text x="130" y="104" text-anchor="middle" font-size="12">own GIL each</text><text x="130" y="119" text-anchor="middle" class="tm" font-size="10">routes 1.75 → 0.62 s</text>
    <rect x="460" y="86" width="180" height="40" rx="6" class="fr sr"/><text x="550" y="104" text-anchor="middle" font-size="12">nothing shared</text><text x="550" y="119" text-anchor="middle" class="tm" font-size="10">child 1, parent 0</text>
    <line x1="510" y1="126" x2="400" y2="164" stroke="currentColor" marker-end="url(#mp-a9)"/>
    <line x1="550" y1="126" x2="550" y2="164" stroke="currentColor" marker-end="url(#mp-a9)"/>
    <line x1="600" y1="126" x2="650" y2="164" stroke="currentColor" marker-end="url(#mp-a9)"/>
    <rect x="300" y="166" width="180" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="390" y="184" text-anchor="middle" font-size="12">pickling</text><text x="390" y="199" text-anchor="middle" class="tm" font-size="10">by name → top-level, guard</text>
    <rect x="490" y="166" width="120" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="550" y="184" text-anchor="middle" font-size="12">Queue / Pipe</text><text x="550" y="199" text-anchor="middle" class="tm" font-size="10">messages</text>
    <rect x="620" y="166" width="56" height="40" rx="6" class="fv"/><text x="648" y="190" text-anchor="middle" font-size="10">shared</text>
    <line x1="390" y1="206" x2="300" y2="226" stroke="currentColor" marker-end="url(#mp-a9)"/>
    <rect x="80" y="216" width="220" height="38" rx="6" class="fr sr"/><text x="190" y="233" text-anchor="middle" font-size="12">overhead per task</text><text x="190" y="247" text-anchor="middle" class="tm" font-size="10">chunksize, small arguments</text>
    <line x1="648" y1="206" x2="648" y2="240" stroke="currentColor" marker-end="url(#mp-a9)"/><text x="520" y="252" class="tm" font-size="10">races return → lock Values</text>
  </svg><figcaption>One choice, separate processes, has two consequences. Own GIL each gives parallelism (green). Nothing shared forces every exchange through pickled messages (hence top-level functions and the guard, and an overhead per task that chunksize and small arguments reduce), or through explicitly shared memory, where races come back and locks are needed again.</figcaption></figure>
  <table class="tbl"><caption>Every concept on QuickBite</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>On the running example</th><th>When to use</th></tr>
    <tr><td>Process</td><td>separate interpreter + memory</td><td>how to compute on many cores?</td><td>routes 1.75 → 0.62 s, 4 PIDs</td><td>CPU-bound pure Python</td></tr>
    <tr><td>Isolation</td><td>separate address spaces</td><td>does the parent see child changes?</td><td>child 1, parent 0</td><td>(know it; send results back)</td></tr>
    <tr><td>Pool / Executor</td><td>workers + job queue + pickling</td><td>results without plumbing?</td><td>40, 36, 35, 36 three ways</td><td>default way to use processes</td></tr>
    <tr><td>Pickling</td><td><code>pickle</code>; functions by name</td><td>how does data travel?</td><td>menu = 38 bytes; lambda fails</td><td>every argument and result</td></tr>
    <tr><td><code>__main__</code> guard</td><td>spawn re-imports main as <code>__mp_main__</code></td><td>why the idiom?</td><td>top line printed 3 times; unguarded → RuntimeError</td><td>every multiprocessing script</td></tr>
    <tr><td>Start-up cost</td><td>creating interpreters</td><td>is a process free?</td><td>20 processes ≈ 25 ms vs threads ≈ 3 ms</td><td>reuse one pool</td></tr>
    <tr><td>chunksize</td><td>several items per message</td><td>how to handle tiny tasks?</td><td>1.03 s → 0.02 s (loop: 0.01 s)</td><td>many small tasks</td></tr>
    <tr><td>Data copying</td><td>pickle size</td><td>what do big arguments cost?</td><td>9.9 MB: 0.19 s vs 0.02 s</td><td>send paths, not data</td></tr>
    <tr><td>Queue / Pipe</td><td>pipes + pickling</td><td>how do running workers talk?</td><td>2 planners, 4 riders; pipe → 12</td><td>long-lived workers</td></tr>
    <tr><td>Value / Array</td><td>shared ctypes + lock</td><td>a shared counter?</td><td>no lock 79,536; lock 200,000</td><td>small shared state</td></tr>
    <tr><td>shared_memory</td><td>named raw buffer</td><td>big arrays without copies?</td><td>fares +10 seen by parent</td><td>large numpy data</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p><strong>Processes trade shared memory for parallelism: each has its own GIL so Python can run on every core, but because nothing is shared, everything that crosses must be pickled (so functions must be importable, the main module must be guarded, and per-task overhead must be kept small), and whatever you do choose to share brings back the races and locks of threads.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The traps of this note in one list.</div>

  <h2 id="mp-traps"><span class="num">10</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>When multiprocessing code fails or is slow, which mistake is behind each symptom?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: missing <code>if __name__ == "__main__":</code></span><p>Works on Linux with fork, breaks with spawn (macOS, Windows, Linux from 3.14): <code>RuntimeError</code> about the bootstrapping phase, or a <code>BrokenProcessPool</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: unpicklable worker or arguments</span><p>Lambdas, nested functions, open files, locks, DB connections: <code>PicklingError</code>. Use top-level functions and plain data.</p></div>
  <div class="callout trap"><span class="label">Trap: expecting globals to be shared</span><p>The child changes its copy; the parent sees nothing. Return results, or use a Queue / Value / shared memory.</p></div>
  <div class="callout trap"><span class="label">Trap: thousands of tiny tasks with chunksize=1</span><p>100× slower than a loop. Raise <code>chunksize</code> or make tasks bigger.</p></div>
  <div class="callout trap"><span class="label">Trap: shipping big data to every task</span><p>Pickling cost and N copies in RAM. Send paths or ranges; use shared memory.</p></div>
  <div class="callout trap"><span class="label">Trap: unlocked <code>Value += 1</code></span><p>Lost updates (79,536 of 200,000). Use <code>with v.get_lock():</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: joining before draining a Queue / missing pills</span><p>The program hangs silently.</p></div>
  <div class="callout trap"><span class="label">Trap: processes for I/O or numpy work</span><p>Threads/asyncio for waiting, vectorised numpy for array maths.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="py_asyncio">asyncio</a>.</b> Processes handle the computing; threads handled the waiting, at the cost of memory per thread and locks. Can one thread juggle all the waits by itself, and hand the computing to this note's process pool?</div>

  <h2 id="mp-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The note on one page. Running example: <code>route_cost</code> tries every order of a rider's stops (hand example A (2, 1), B (5, 3), C (1, 4) → 12; 4 riders × 9 stops → 40, 36, 35, 36).</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>Answer in one line</th></tr>
    <tr><td>Process</td><td>compute on 4 cores?</td><td>separate interpreters, own GIL each: 1.75 → 0.62 s</td></tr>
    <tr><td>Isolation</td><td>does the parent see changes?</td><td>no: child 1, parent 0; send results back</td></tr>
    <tr><td>Pools</td><td>results without plumbing?</td><td><code>ProcessPoolExecutor</code> / <code>mp.Pool</code>: <code>map</code>, <code>submit</code></td></tr>
    <tr><td>Pickling</td><td>how does data travel?</td><td>to bytes and back; functions by name; no lambdas</td></tr>
    <tr><td>Guard</td><td>why <code>__main__</code>?</td><td>spawn children re-import the file as <code>__mp_main__</code></td></tr>
    <tr><td>Costs</td><td>is it free?</td><td>start-up, per-message pickling, data copies: <code>chunksize</code>, small args</td></tr>
    <tr><td>Queue / Pipe</td><td>running workers talk?</td><td>pickled messages; pills; drain before join</td></tr>
    <tr><td>Shared memory</td><td>one copy for all?</td><td><code>Value</code>/<code>Array</code> (lock them), <code>shared_memory</code> (close, unlink)</td></tr>
    <tr><td>When not</td><td>when do processes lose?</td><td>I/O, tiny tasks, huge data, numpy work</td></tr>
  </table>
  <h3>Definitions and formulas</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td>Best-case speed-up</td><td>≈ number of cores (4 here) minus overhead; measured 2.8×</td></tr>
    <tr><td>Worth it when</td><td>work per task ≫ pickling + messaging per task, and total work ≫ pool start-up</td></tr>
    <tr><td>Messages with chunksize k</td><td>⌈tasks / k⌉: 5000 tasks, k = 50 → 100 messages</td></tr>
    <tr><td>Pickling</td><td><code>pickle.dumps</code> / <code>loads</code>; functions and classes by module + name</td></tr>
    <tr><td>Start methods</td><td>fork (copy parent; Linux ≤ 3.13 default), spawn (fresh interpreter, re-import; macOS/Windows), forkserver (Linux 3.14+ default)</td></tr>
    <tr><td>IPC</td><td>inter-process communication: return values, Queue, Pipe, Value/Array, shared_memory</td></tr>
  </table>
  <h3>Measured numbers (ratios matter)</h3>
  <table class="tbl">
    <tr><th>Measurement</th><th>Result</th></tr>
    <tr><td>4 routes: loop vs 4 processes</td><td>1.75 s vs 0.62 s</td></tr>
    <tr><td>Start + join 20 threads vs 20 processes</td><td>2.8 ms vs 25.3 ms</td></tr>
    <tr><td>5000 tiny jobs: loop / chunksize 1 / 50 / 1250</td><td>0.01 / 1.03 / 0.03 / 0.02 s</td></tr>
    <tr><td>Send 9.9 MB list vs a number</td><td>0.19 s vs 0.02 s</td></tr>
    <tr><td>Value += 1, 4 × 50,000: no lock / lock</td><td>79,536 / 200,000</td></tr>
    <tr><td>Sum of squares: Python / 4 processes / numpy</td><td>0.156 / 0.073 / 0.003 s</td></tr>
  </table>
  <div class="cards">
    <div><b>Use processes</b><p>Pure-Python CPU work in tasks that are long compared with their overhead, with small inputs and outputs.</p><small>route search, parsing, simulations</small></div>
    <div><b>Avoid processes</b><p>Waiting work, tiny tasks, big per-task data, numpy-able maths, nested <code>n_jobs=-1</code>.</p><small>threads/asyncio, loops, vectorise</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>No <code>__main__</code> guard; lambdas or nested functions as workers; expecting shared globals; <code>chunksize=1</code> with thousands of tasks; big DataFrames per task; unlocked <code>Value</code>; join before drain; forgetting <code>unlink</code>.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Why can 4 processes compute in parallel when 4 threads cannot?</td><td>each process has its own interpreter and GIL</td></tr>
    <tr><td>Why can't a lambda be sent to a process pool?</td><td>functions are pickled by importable name; a lambda has none</td></tr>
    <tr><td>What is <code>__name__</code> in a spawned child running your main file?</td><td><code>"__mp_main__"</code></td></tr>
    <tr><td>5000 tasks, chunksize 1250: how many messages?</td><td>4</td></tr>
    <tr><td>Child does <code>counter += 100</code> on a global. Parent's counter?</td><td>unchanged (its own copy)</td></tr>
  </table>

  <h2 id="mp-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Threads vs processes in Python: when each?</summary><div class="qa-body">Threads: I/O-bound work; cheap, shared memory, but one thread runs Python at a time (GIL). Processes: CPU-bound pure-Python work; real parallelism, but separate memory, start-up cost and pickling. QuickBite: threads for menus (0.20 s vs processes 1.02 s), processes for routes (0.62 s vs threads no faster than 1.75 s).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why might a ProcessPoolExecutor be slower than a plain loop?</summary><div class="qa-body">Overhead: starting processes, pickling arguments and results, one message per task. 5000 tiny tasks took 1.03 s in a pool vs 0.01 s in a loop. Fix with bigger tasks or <code>chunksize</code>, send paths not data, reuse the pool, and do not parallelise work that is already fast.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do you need <code>if __name__ == "__main__":</code>?</summary><div class="qa-body">With spawn and forkserver, each child imports your main module (as <code>__mp_main__</code>) to find the worker function. Unguarded top-level code runs again in every child; if it creates a pool, children try to create processes while bootstrapping and <code>multiprocessing</code> raises <code>RuntimeError</code>. The guard limits that code to the parent.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What can and cannot be sent to a worker process?</summary><div class="qa-body">Anything picklable: numbers, strings, lists, dicts, tuples, dataclasses, numpy arrays, top-level functions and classes (by name). Not: lambdas, nested functions, open files, sockets, locks, DB connections, generators. Errors appear as <code>PicklingError</code> or <code>AttributeError</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you share a large numpy array with workers without copying it?</summary><div class="qa-body"><code>shared_memory.SharedMemory(create=True, size=…)</code>, wrap with <code>np.ndarray(shape, dtype, buffer=shm.buf)</code>, pass <code>shm.name</code>; workers attach by name. Every process calls <code>close()</code>; one calls <code>unlink()</code> at the end. Concurrent writers still need coordination.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>fork vs spawn?</summary><div class="qa-body">fork copies the running parent (fast, functions already present; risky if the parent has threads or open resources). spawn starts a fresh interpreter that imports the main module (slower, safer, needs the guard and picklable workers). Linux defaulted to fork up to 3.13 and uses forkserver from 3.14; macOS and Windows use spawn.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why do races come back with <code>mp.Value</code> when processes are "isolated"?</summary><div class="qa-body">A Value is deliberately placed in shared memory, so it is no longer isolated. <code>v.value += 1</code> is still read, add, write, and now processes run truly in parallel with no GIL between them, so updates interleave freely (79,536 of 200,000). Its lock restores correctness.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does <code>ProcessPoolExecutor</code> have the same API as <code>ThreadPoolExecutor</code>?</summary><div class="qa-body">Both implement <code>concurrent.futures.Executor</code>: a pool of workers fed from a job queue, returning Futures. Only the worker type differs, so switching between I/O-bound and CPU-bound work is often one word, and asyncio's <code>run_in_executor</code> accepts either.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you send the whole 9.9 MB order history with each of 1000 tasks?</summary><div class="qa-body">Each task pays the pickling and transfer (≈ 0.19 s measured, so minutes in total), each worker holds copies in RAM, and the speed-up from parallel computing is eaten by copying. Send each task an index range and let workers load their own slice, or put the data in shared memory once.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why is numpy often a better answer than processes?</summary><div class="qa-body">numpy runs the whole loop in compiled C without creating a Python object per element, so it removes the cost that processes only divide. Measured: numpy 0.003 s vs 4 processes 0.073 s vs 1 process 0.156 s. Processes are for the Python logic that cannot be vectorised, such as the permutation search in <code>route_cost</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A worker process crashes. What happens?</summary><div class="qa-body">The crash is isolated: the parent survives. A raw <code>Process</code> shows a non-zero <code>exitcode</code>; a <code>ProcessPoolExecutor</code> marks itself broken and pending futures raise <code>BrokenProcessPool</code>; a normal Python exception inside a pool job is pickled back and re-raised by <code>future.result()</code>.</div></details>
</main>
`
});
