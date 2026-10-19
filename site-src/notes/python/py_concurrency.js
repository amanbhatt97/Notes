// notes/python/py_concurrency.js — Concurrency in Python: the map
Object.assign(TOPIC_CONTENT, {
  "py_concurrency": `<main>
<h1>Concurrency in Python: the map</h1>
  <div class="where"><span>Python</span><span>Advanced Python</span><span>Concurrency</span><span>Concurrency in Python: the map</span></div>
  <p class="lead">Start here. Threads, the GIL, processes and asyncio are usually taught as four separate toolboxes, each with its own vocabulary. They are not separate. They are three answers to one question, <strong>"my program is slow: what is it doing while it is slow?"</strong>, and the answer depends on whether the program is <em>waiting</em> or <em>computing</em>. This short note gives you the whole picture before the details: why concurrency exists, the difference between concurrency and parallelism, how to diagnose your own code, what each tool is good and bad at (measured, not claimed), a decision table, and the reading order for the three child notes. One running example, a small food-delivery app called QuickBite, is introduced here and reused in every note of the group.</p>

  <h2 id="cc-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 160" width="640">
    <defs><marker id="cc-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="200" y="8" width="240" height="32" rx="6" class="fg sg" stroke-width="2.5"/><text x="320" y="29" text-anchor="middle" font-size="12" font-weight="700">Concurrency in Python: the map</text>
    <line x1="320" y1="40" x2="110" y2="72" stroke="currentColor" stroke-opacity="0.45"/>
    <line x1="320" y1="40" x2="320" y2="72" stroke="currentColor" stroke-opacity="0.45"/>
    <line x1="320" y1="40" x2="530" y2="72" stroke="currentColor" stroke-opacity="0.45"/>
    <rect x="20" y="72" width="180" height="34" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="110" y="94" text-anchor="middle" font-size="12">1 · Threads &amp; the GIL</text>
    <rect x="230" y="72" width="180" height="34" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="94" text-anchor="middle" font-size="12">2 · Processes</text>
    <rect x="440" y="72" width="180" height="34" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="530" y="94" text-anchor="middle" font-size="12">3 · asyncio</text>
    <line x1="200" y1="89" x2="226" y2="89" stroke="currentColor" marker-end="url(#cc-a0)"/>
    <line x1="410" y1="89" x2="436" y2="89" stroke="currentColor" marker-end="url(#cc-a0)"/>
    <text x="110" y="125" text-anchor="middle" class="tm" font-size="11">waiting, shared memory</text>
    <text x="320" y="125" text-anchor="middle" class="tm" font-size="11">computing, many cores</text>
    <text x="530" y="125" text-anchor="middle" class="tm" font-size="11">many waits, one thread</text>
    <text x="320" y="150" text-anchor="middle" class="tm" font-size="11">read left to right: each note starts from the weakness of the one before</text>
  </svg><figcaption>The Concurrency group. You are on the green map note. The three child notes are read left to right: threads first (the simplest way to overlap waiting), then processes (what threads cannot do), then asyncio (doing what threads do with less cost).</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="py_fundamentals">Python Fundamentals</a> and the <a class="xref" data-note="py_advanced">Advanced Python Functions</a> group</b><span>You can write functions, loops and classes, and you have met generators (functions that pause at <code>yield</code>, <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>), decorators (<a class="xref" data-note="py_decorators">Closures &amp; Decorators</a>) and <code>with</code> blocks (<a class="xref" data-note="py_context">Context Managers</a>). Left open: every program so far did one thing at a time, from top to bottom. When one line waits two seconds for a server, the whole program waits.</span></li>
    <li><b>This note adds: the map</b><span>Why concurrency exists, the words you need (concurrency, parallelism, I/O-bound, CPU-bound, thread, process, GIL, event loop), a way to diagnose your own code, all three tools measured on one example, a decision table and the reading order. No tool is taught in depth here.</span></li>
    <li><b>Leads to: <a class="xref" data-note="py_threading">Threads &amp; the GIL</a></b><span>Then <a class="xref" data-note="py_multiprocessing">Processes</a> and <a class="xref" data-note="py_asyncio">asyncio</a>. After the group: <a class="xref" data-note="api_fastapi">FastAPI</a> (its endpoints are <code>async def</code> coroutines), <a class="xref" data-note="de_kafka">Kafka &amp; Streaming</a> (consumers that wait on a stream) and <a class="xref" data-note="py_testing">Testing &amp; Debugging</a> (profiling before you parallelise, testing async code).</span></li>
  </ol>

  <h2 id="cc-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole group as one chain. Each idea answers the question above it, and its weakness raises the next question. The link at the end of each line is the note that teaches it. Numbers come from the running example (section 01): QuickBite fetches 20 menus (0.2 s each, 100 dishes in total) and plans routes for 4 riders (costs 40, 36, 35, 36).</p>
  <ol class="story">
    <li><b>A program that waits</b><span>Q: why does fetching 20 menus take 4 seconds? → Each request waits 0.2 s for a server, and a normal program waits for each one before sending the next: 20 × 0.2 = 4.0 s, with the CPU idle almost the whole time. Can we use that idle time?</span></li>
    <li><b>Concurrency</b><span>Q: can we do other work while one request waits? → Yes: keep several tasks in progress and switch to whichever can move. One cook, many pans. But what if the work is not waiting but calculating?</span></li>
    <li><b>Parallelism</b><span>Q: how do we speed up pure calculation, like the route plans? → Run pieces at literally the same instant on several CPU cores. Many cooks. So which kind of help does <em>my</em> code need?</span></li>
    <li><b>I/O-bound vs CPU-bound</b><span>Q: how do I tell? → Compare CPU time with wall-clock time. Menus: CPU 0% of 4.0 s (waiting, I/O-bound). Routes: CPU 98% (computing, CPU-bound). Now: which tool gives concurrency most simply? <a class="xref" data-note="py_threading">Threads &amp; the GIL</a></span></li>
    <li><b>Threads</b><span>Q: how do we overlap the 20 waits? → 20 threads: 4.0 s → 0.2 s. But 4 threads planning routes are no faster than 1. Why? <a class="xref" data-note="py_threading">Threads &amp; the GIL</a></span></li>
    <li><b>The GIL</b><span>Q: why don't threads help calculation? → CPython lets only one thread run Python code at a time (the Global Interpreter Lock). Waiting releases it, calculating holds it. And sharing memory brings race conditions and locks. How do we compute on 4 cores? <a class="xref" data-note="py_threading">Threads &amp; the GIL</a></span></li>
    <li><b>Processes</b><span>Q: how do we get real parallelism? → Separate Python programs, each with its own GIL: routes 1.5 s → 0.5 s. But each process costs start-up time, memory and copying (pickling) of data. Is there a cheaper way to handle many waits? <a class="xref" data-note="py_multiprocessing">Processes</a></span></li>
    <li><b>asyncio</b><span>Q: can one thread juggle all the waits? → Yes, if every function says where it waits (<code>await</code>): an event loop switches between them. 20 menus in 0.2 s, no locks. But one blocking call freezes everything… <a class="xref" data-note="py_asyncio">asyncio</a></span></li>
    <li><b>Combining them</b><span>Q: the real app both waits and computes: now what? → asyncio for the waiting, a process pool for the computing, joined by <code>run_in_executor</code>: both jobs in about 0.7 s instead of about 5.5 s. <a class="xref" data-note="py_asyncio">asyncio</a></span></li>
  </ol>

  <h2 id="cc-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Concurrency in Python</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The need</div>
        <ul>
          <li>Programs spend time <b>waiting</b> (network, disk, DB) or <b>computing</b></li>
          <li>Sequential: waits add up (20 × 0.2 s = 4.0 s)</li>
          <li><b>Concurrency</b> — many tasks in progress, switching (one cook, many pans)</li>
          <li><b>Parallelism</b> — tasks at the same instant on several cores (many cooks)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Diagnose first</div>
        <ul>
          <li><b>I/O-bound</b> — mostly waiting; CPU time ≪ wall time</li>
          <li><b>CPU-bound</b> — mostly computing; CPU time ≈ wall time</li>
          <li>Measure: <code>time.process_time()</code> vs <code>time.perf_counter()</code></li>
          <li>Profile before parallelising</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Threads</div>
        <ul>
          <li>Several lines of execution in one process; shared memory</li>
          <li>Great for waiting: menus 4.0 s → 0.2 s</li>
          <li><b>GIL</b>: one thread runs Python at a time → no help for computing</li>
          <li>Shared data → races → <code>Lock</code>, <code>Queue</code></li>
          <li><code>ThreadPoolExecutor</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Processes</div>
        <ul>
          <li>Separate interpreters: own GIL, own memory</li>
          <li>Real parallelism: routes 1.5 s → 0.5 s on 4 cores</li>
          <li>Cost: start-up, RAM, pickling data both ways</li>
          <li><code>ProcessPoolExecutor</code>, <code>if __name__ == "__main__":</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">asyncio</div>
        <ul>
          <li>One thread, an <b>event loop</b>, many coroutines</li>
          <li><code>async def</code> / <code>await</code> mark the pause points</li>
          <li>Cooperative: a task switches only at <code>await</code></li>
          <li>Thousands of waits cheaply; never block the loop</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Pick a tool</div>
        <ul>
          <li>Waiting, normal libraries → <b>threads</b></li>
          <li>Waiting, very many, async libraries → <b>asyncio</b></li>
          <li>Computing in pure Python → <b>processes</b></li>
          <li>Computing in numpy/pandas → vectorise first</li>
          <li>Both → asyncio + process pool</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="cc-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The group as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="cc-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Programs Wait</span><span class="rm-sub">QuickBite, one thing at a time</span></div></div>
      <div class="rm-item rm-done" data-target="cc-cvp"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Concurrency vs Parallelism</span><span class="rm-sub">One cook or many cooks</span></div></div>
      <div class="rm-item rm-done" data-target="cc-diag"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">I/O-bound or CPU-bound?</span><span class="rm-sub">Diagnose before you choose</span></div></div>
      <div class="rm-item rm-done" data-target="cc-tools"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Three Tools, One Showdown</span><span class="rm-sub">Threads, processes, asyncio measured</span></div></div>
      <div class="rm-item rm-done" data-target="cc-app"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">The Whole App, Fixed</span><span class="rm-sub">Each job with its own tool</span></div></div>
      <div class="rm-item rm-done" data-target="cc-decide"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Decision Table</span><span class="rm-sub">Which tool for which job</span></div></div>
      <div class="rm-item rm-done" data-target="cc-order"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Reading Order</span><span class="rm-sub">What each note answers</span></div></div>
      <div class="rm-item rm-done" data-target="cc-connect"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One table for the group</span></div></div>
      <div class="rm-item rm-done" data-target="cc-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">One per tool</span></div></div>
      <div class="rm-item rm-done" data-target="cc-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The group on one page</span></div></div>
      <div class="rm-item rm-done" data-target="cc-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Connection questions</span></div></div>
    </div>
  </div>

  <h2 id="cc-why"><span class="num">01</span>Why Programs Wait</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Every program you have written runs one line at a time and finishes each line before starting the next. That has always been fine. So when does "one thing at a time" become a problem, and what is the program actually doing while it is slow?</p>
  </div>
  <h3>The running example: QuickBite</h3>
  <p>QuickBite is a small food-delivery app (made up for these notes). Every evening at 6 pm it does two jobs:</p>
  <ul>
    <li><strong>Job 1, fetch menus.</strong> Ask each of its 20 partner restaurants (R01 to R20) for tonight's menu. Each request goes over the network, and each restaurant's server takes 0.2 s to answer. The program does almost no work itself; it <em>waits</em>.</li>
    <li><strong>Job 2, plan routes.</strong> Each of its 4 riders has 9 drop-off points. For each rider, find the order of visiting the points that walks the fewest city blocks. The program tries every possible order (9! = 362,880 of them). Nothing to wait for; it <em>computes</em>.</li>
  </ul>
  <p>To keep everything runnable on any laptop without the internet, the network is simulated: <code>fetch_menu</code> just sleeps 0.2 s, which is exactly what a real request looks like from your program's point of view (the program sits idle until the answer arrives). Save this file as <code>quickbite.py</code>; every note in the group imports from it.</p>
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
  <p>Read it from the top. <code>RESTAURANTS</code> is the list <code>["R01", …, "R20"]</code>. <code>fetch_menu("R07")</code> waits 0.2 s and returns a dict like <code>{"id": "R07", "dishes": 5}</code>; the number of dishes is a made-up rule (3 + the restaurant number mod 5) so that we can check every answer by hand. <code>fetch_menu_async</code> is the same request written for asyncio; ignore it until the asyncio note. <code>dist</code> counts city blocks between two grid points: |x₁ − x₂| + |y₁ − y₂|. <code>route_cost</code> tries every order of the stops (<code>itertools.permutations</code>), adds up the blocks walked from the depot at (0, 0), and keeps the smallest total. <code>RIDERS</code> holds 4 lists of 9 points each.</p>
  <h3>Checking the numbers by hand</h3>
  <p>Dishes: R01 has 3 + 1 = 4, R02 has 5, R03 has 6, R04 has 7, R05 has 3 + 0 = 3, and the pattern 4, 5, 6, 7, 3 repeats four times across 20 restaurants, so the total is 4 × (4 + 5 + 6 + 7 + 3) = 4 × 25 = <strong>100 dishes</strong>. Every correct way of fetching the menus, however clever, must give 100.</p>
  <p>Routes: try a tiny rider with three stops A (2, 1), B (5, 3), C (1, 4), starting at the depot D (0, 0). The distances are D→A = 2 + 1 = 3, D→B = 8, D→C = 5, A→B = 3 + 2 = 5, A→C = 1 + 3 = 4, B→C = 4 + 1 = 5. All 3! = 6 orders:</p>
  <table class="tbl"><caption>route_cost by hand: try every order, keep the smallest</caption>
    <tr><th>Order</th><th>Blocks walked</th><th>Total</th></tr>
    <tr><td>A → B → C</td><td>3 + 5 + 5</td><td>13</td></tr>
    <tr><td><strong>A → C → B</strong></td><td>3 + 4 + 5</td><td><strong>12</strong> (best)</td></tr>
    <tr><td>B → A → C</td><td>8 + 5 + 4</td><td>17</td></tr>
    <tr><td>B → C → A</td><td>8 + 5 + 4</td><td>17</td></tr>
    <tr><td>C → A → B</td><td>5 + 4 + 5</td><td>14</td></tr>
    <tr><td>C → B → A</td><td>5 + 5 + 5</td><td>15</td></tr>
  </table>
  <p>Three stops need 6 orders; nine stops need 362,880 orders, each with 9 additions. That is pure calculation, which is why job 2 is our CPU-heavy job. The code confirms the hand numbers:</p>
  <div class="fx" data-lang="py">from quickbite import RESTAURANTS, RIDERS, route_cost, dist

print(len(RESTAURANTS), "restaurants:", RESTAURANTS[0], RESTAURANTS[1], "...", RESTAURANTS[-1])
print("dishes per menu:", [3 + int(r[1:]) % 5 for r in RESTAURANTS[:5]], "... total", sum(3 + int(r[1:]) % 5 for r in RESTAURANTS))
A, B, C = (2, 1), (5, 3), (1, 4)
print("depot-&gt;A", dist((0, 0), A), " A-&gt;C", dist(A, C), " C-&gt;B", dist(C, B))
print("cheapest route through A, B, C:", route_cost([A, B, C]))
print("rider 1 has", len(RIDERS[0]), "stops:", RIDERS[0][:3], "...")</div>
  <div class="fx" data-lang="text">20 restaurants: R01 R02 ... R20
dishes per menu: [4, 5, 6, 7, 3] ... total 100
depot-&gt;A 3  A-&gt;C 4  C-&gt;B 5
cheapest route through A, B, C: 12
rider 1 has 9 stops: [(7, 3), (1, 10), (6, 4)] ...</div>
  <h3>The obvious first attempt: one thing at a time</h3>
  <p>Here is how anyone would first write the 6 pm run: a list comprehension for each job, timed with <code>time.perf_counter()</code> (a stopwatch: read it before and after, subtract).</p>
  <div class="fx" data-lang="py">import time
from quickbite import RESTAURANTS, RIDERS, fetch_menu, route_cost

t = time.perf_counter()
menus = [fetch_menu(r) for r in RESTAURANTS]          # job 1: 20 menus, one after another
t_menus = time.perf_counter() - t
print(f"menus : {len(menus)} fetched, {sum(m['dishes'] for m in menus)} dishes, {t_menus:.2f}s")

t = time.perf_counter()
costs = [route_cost(stops) for stops in RIDERS]       # job 2: 4 riders' best routes
t_routes = time.perf_counter() - t
print(f"routes: costs {costs}, {t_routes:.2f}s")
print(f"total : {t_menus + t_routes:.2f}s")</div>
  <div class="fx" data-lang="text">menus : 20 fetched, 100 dishes, 4.00s
routes: costs [40, 36, 35, 36], 1.48s
total : 5.49s</div>
  <p>The menus took 4.00 s, exactly 20 × 0.2 s: the program sent request 1, waited 0.2 s, sent request 2, waited 0.2 s, and so on. The routes took about 1.5 s of real calculation. Together, roughly 5.5 s (your times will differ a little; the 4.00 s will not, because it is pure waiting).</p>
  <figure class="viz"><svg viewBox="0 0 600 110" width="600">
    <text x="10" y="18" class="tm">Sequential menus: 20 waits laid end to end (first 8 shown)</text>
    <rect x="20" y="30" width="4" height="22" class="fb sb"/><rect x="24" y="30" width="60" height="22" class="fs"/>
    <rect x="84" y="30" width="4" height="22" class="fb sb"/><rect x="88" y="30" width="60" height="22" class="fs"/>
    <rect x="148" y="30" width="4" height="22" class="fb sb"/><rect x="152" y="30" width="60" height="22" class="fs"/>
    <rect x="212" y="30" width="4" height="22" class="fb sb"/><rect x="216" y="30" width="60" height="22" class="fs"/>
    <rect x="276" y="30" width="4" height="22" class="fb sb"/><rect x="280" y="30" width="60" height="22" class="fs"/>
    <rect x="340" y="30" width="4" height="22" class="fb sb"/><rect x="344" y="30" width="60" height="22" class="fs"/>
    <rect x="404" y="30" width="4" height="22" class="fb sb"/><rect x="408" y="30" width="60" height="22" class="fs"/>
    <rect x="468" y="30" width="4" height="22" class="fb sb"/><rect x="472" y="30" width="60" height="22" class="fs"/>
    <text x="545" y="46" class="tm">… ×20</text>
    <text x="54" y="70" text-anchor="middle" class="tm" font-size="10">R01</text><text x="118" y="70" text-anchor="middle" class="tm" font-size="10">R02</text><text x="182" y="70" text-anchor="middle" class="tm" font-size="10">R03</text>
    <rect x="20" y="86" width="10" height="10" class="fb sb"/><text x="36" y="95" class="tm">CPU working (tiny)</text>
    <rect x="170" y="86" width="10" height="10" class="fs"/><text x="186" y="95" class="tm">waiting for the server, CPU idle</text>
  </svg><figcaption>Time runs left to right. Each request is a sliver of real work (blue) followed by a long wait (grey). In a sequential program the grey bars line up one after another, so the total is the sum of all the waits.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span><p>A cook making 20 cups of tea one at a time: put a pan on, stare at it until it boils, pour, then start the next pan. The cook is busy for a few seconds per cup and idle for minutes. Nobody cooks like that: you put several pans on and do something else while they heat.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Sequential execution</strong>: one task runs to the end before the next starts; total time = sum of every task's time. <strong>Wall-clock time</strong>: real time from start to finish, what a stopwatch shows (<code>time.perf_counter()</code>). <strong>Latency</strong>: how long one request takes to be answered (0.2 s here).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"The program is slow, so the computer must be working hard." Often the opposite: during those 4 seconds the CPU did almost nothing. Before reaching for any tool, find out <em>what</em> the slow part is doing (section 03 shows how).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Concurrency vs Parallelism.</b> We see two kinds of slowness: idle waiting and busy computing. What exactly are the two ways of "doing several things at once", and which one fits which kind?</div>

  <h2 id="cc-cvp"><span class="num">02</span>Concurrency vs Parallelism</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Doing several things at once" sounds like one idea. Is it? Does a single CPU core help with the menus? Does it help with the routes?</p>
  </div>
  <p>There are two different meanings, and mixing them up is the root of most confusion in this topic.</p>
  <ul>
    <li><strong>Concurrency</strong> means several tasks are <em>in progress</em> at the same time. They do not have to run at the same instant. One worker starts task 1, and while task 1 is waiting, starts task 2, then task 3, then comes back to task 1 when its answer arrives. Concurrency is about <em>structure</em>: not being stuck behind a wait.</li>
    <li><strong>Parallelism</strong> means several tasks are <em>executing at the same instant</em>, on different CPU cores. Parallelism is about <em>hardware</em>: more hands working.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span><p>A kitchen. <strong>Concurrency</strong>: one cook puts four pans on four burners and moves between them, stirring whichever needs it. Only one pair of hands, but nothing waits for anything else to boil. <strong>Parallelism</strong>: four cooks each chopping vegetables at the same time. Boiling water (waiting) only needs one cook who does not stand still; chopping (computing) only speeds up with more cooks.</p></div>
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
  </svg><figcaption>Top two rows: waiting work. Overlapping the waits (concurrency) wins, even on one core, because waiting does not need a core. Bottom two rows: computing work. Switching between two calculations on one core gains nothing; only running them on two cores at once (parallelism) halves the time.</figcaption></figure>
  <table class="tbl"><caption>On the running example</caption>
    <tr><th></th><th>Menus (waiting)</th><th>Routes (computing)</th></tr>
    <tr><td>Sequential</td><td>20 × 0.2 = 4.0 s</td><td>≈ 1.5 s (sum of 4 riders)</td></tr>
    <tr><td>Concurrency (1 core, switch while waiting)</td><td>≈ 0.2 s: all 20 waits overlap</td><td>≈ 1.5 s: nothing to overlap</td></tr>
    <tr><td>Parallelism (4 cores)</td><td>helps, but overkill: you do not need 4 cores to wait</td><td>≈ 1.5 / 4 ≈ 0.4 s at best</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Concurrency</strong>: structuring a program so several tasks make progress in overlapping time periods, switching between them. <strong>Parallelism</strong>: executing several tasks simultaneously on multiple CPU cores. Parallelism is one way to get concurrency, but concurrency does not need parallelism. In Python: <strong>threads and asyncio give concurrency</strong>; <strong>processes give parallelism</strong> (the next notes explain why threads do not).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Treating the two words as synonyms. "I made it concurrent, why isn't my calculation faster?" Because concurrency only hides <em>waiting</em>. A calculation has nothing to hide.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: I/O-bound or CPU-bound?</b> Waiting work wants concurrency; computing work wants parallelism. For QuickBite we know which job is which because we wrote it. How do you find out for code you did not write?</div>

  <h2 id="cc-diag"><span class="num">03</span>I/O-bound or CPU-bound?</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Given a slow function, how do we tell whether it is mostly waiting or mostly computing, without guessing?</p>
  </div>
  <p>Use two clocks. <code>time.perf_counter()</code> measures <strong>wall time</strong>, real seconds passing. <code>time.process_time()</code> measures <strong>CPU time</strong>, the seconds the CPU actually spent running <em>this</em> program (sleeping and waiting do not count). The ratio CPU / wall tells you what the program was doing.</p>
  <div class="fx" data-lang="py">import time
from quickbite import RESTAURANTS, RIDERS, fetch_menu, route_cost

def profile(label, job):
    wall0, cpu0 = time.perf_counter(), time.process_time()
    job()
    wall = time.perf_counter() - wall0               # clock on the wall
    cpu = time.process_time() - cpu0                 # time the CPU actually worked for us
    print(f"{label:&lt;7} wall {wall:.2f}s  cpu {cpu:.2f}s  cpu/wall = {cpu / wall:.0%}")

profile("menus", lambda: [fetch_menu(r) for r in RESTAURANTS])
profile("routes", lambda: [route_cost(s) for s in RIDERS])</div>
  <div class="fx" data-lang="text">menus   wall 4.00s  cpu 0.00s  cpu/wall = 0%
routes  wall 1.63s  cpu 1.60s  cpu/wall = 98%</div>
  <p>The menus took 4 s of wall time but essentially 0 s of CPU: 0%, the program was asleep the whole time, waiting. The routes used about 98% of the wall time as CPU: it was calculating every moment. (The <code>lambda: …</code> wraps each job so <code>profile</code> can call it between the two clock readings.)</p>
  <table class="tbl"><caption>Reading the ratio</caption>
    <tr><th>CPU / wall</th><th>Name</th><th>What the program does</th><th>Typical examples</th><th>What helps</th></tr>
    <tr><td>near 0%</td><td><strong>I/O-bound</strong></td><td>waits for input/output: network, disk, database</td><td>calling APIs, downloading files, SQL queries, reading S3</td><td>concurrency: threads or asyncio</td></tr>
    <tr><td>near 100%</td><td><strong>CPU-bound</strong></td><td>calculates non-stop</td><td>pure-Python loops, parsing, feature engineering in Python, brute-force search</td><td>parallelism: processes (or faster code: numpy)</td></tr>
    <tr><td>in between</td><td>mixed</td><td>both</td><td>download then parse</td><td>split the stages, give each its own tool (section 05)</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>A doctor checking why a patient is tired: is it lack of sleep (waiting) or overwork (computing)? A watch (wall time) and a step counter (CPU time) together answer it; either alone does not.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>I/O-bound</strong>: the running time is dominated by waiting for input/output; a faster CPU would barely help. <strong>CPU-bound</strong>: the running time is dominated by computation; a faster CPU (or more cores) helps directly. I/O = input/output.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Skipping this step. If 90% of your time is one slow SQL query, running ten copies at once only loads the database ten times harder. Profile first (<code>cProfile</code>, covered in <a class="xref" data-note="py_testing">Testing &amp; Debugging</a>), then pick the tool for the slow part.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Three Tools, One Showdown.</b> We can now label each job. What does Python actually offer for each label, and how much does each tool really help on our two jobs?</div>

  <h2 id="cc-tools"><span class="num">04</span>Three Tools, One Showdown</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Python has three tools: threads, processes and asyncio. What is each in one sentence, and how does each do on the menus (waiting) and the routes (computing)?</p>
  </div>
  <h3>The three tools in plain words</h3>
  <div class="cards">
    <div><b>Threads</b><p>Several lines of execution inside one running program, sharing its memory. The operating system switches between them. While one thread waits for a server, another runs.</p><small>cooks sharing one kitchen</small></div>
    <div><b>Processes</b><p>Several separate copies of the Python program, each with its own memory and its own interpreter, which the operating system can run on different cores at the same instant.</p><small>separate kitchens</small></div>
    <div><b>asyncio</b><p>One thread running an <em>event loop</em> that juggles many tasks. Each task says where it will wait (<code>await</code>); at that point the loop runs another task.</p><small>one waiter, many tables</small></div>
  </div>
  <h3>The showdown</h3>
  <p>The script below runs both jobs four ways: sequential, a thread pool, a process pool (4 processes, the number of cores on this machine), and asyncio. Do not try to understand every line yet; each child note builds its part from scratch. Look at the shape: the same work, handed to different "executors". The answers (100 dishes; costs 40, 36, 35, 36) must be identical every time.</p>
  <div class="fx" data-lang="py">import asyncio, time
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
from quickbite import RESTAURANTS, RIDERS, fetch_menu, fetch_menu_async, route_cost

async def route_cost_async(stops):                    # a coroutine that never awaits
    return route_cost(stops)

def timed(label, fn):
    t = time.perf_counter()
    result = fn()
    print(f"  {label:&lt;10} {time.perf_counter() - t:5.2f}s   {result}")

if __name__ == "__main__":
    print("MENUS (I/O-bound): 20 requests x 0.2 s -&gt; total dishes")
    timed("sequential", lambda: sum(fetch_menu(r)["dishes"] for r in RESTAURANTS))
    with ThreadPoolExecutor(max_workers=20) as ex:
        timed("threads", lambda: sum(m["dishes"] for m in ex.map(fetch_menu, RESTAURANTS)))
    with ProcessPoolExecutor(max_workers=4) as ex:
        timed("processes", lambda: sum(m["dishes"] for m in ex.map(fetch_menu, RESTAURANTS)))
    async def all_menus():
        return sum(m["dishes"] for m in await asyncio.gather(*map(fetch_menu_async, RESTAURANTS)))
    timed("asyncio", lambda: asyncio.run(all_menus()))

    print("ROUTES (CPU-bound): 4 riders x 9 stops -&gt; best costs")
    timed("sequential", lambda: [route_cost(s) for s in RIDERS])
    with ThreadPoolExecutor(max_workers=4) as ex:
        timed("threads", lambda: list(ex.map(route_cost, RIDERS)))
    with ProcessPoolExecutor(max_workers=4) as ex:
        timed("processes", lambda: list(ex.map(route_cost, RIDERS)))
    async def all_routes():
        return list(await asyncio.gather(*map(route_cost_async, RIDERS)))
    timed("asyncio", lambda: asyncio.run(all_routes()))</div>
  <div class="fx" data-lang="text">MENUS (I/O-bound): 20 requests x 0.2 s -&gt; total dishes
  sequential  4.00s   100
  threads     0.20s   100
  processes   1.02s   100
  asyncio     0.20s   100
ROUTES (CPU-bound): 4 riders x 9 stops -&gt; best costs
  sequential  1.49s   [40, 36, 35, 36]
  threads     1.84s   [40, 36, 35, 36]
  processes   0.52s   [40, 36, 35, 36]
  asyncio     1.62s   [40, 36, 35, 36]</div>
  <figure class="viz"><svg viewBox="0 0 520 240" width="520">
    <text x="10" y="18" class="tm">MENUS: 20 requests × 0.2 s (waiting)</text>
    <text x="10" y="40">sequential</text><rect x="110" y="28" width="300" height="15" class="fs"/><text x="416" y="40">4.00 s</text>
    <text x="10" y="60">threads</text><rect x="110" y="48" width="15" height="15" class="fb sb"/><text x="131" y="60">0.20 s</text>
    <text x="10" y="80">processes</text><rect x="110" y="68" width="77" height="15" class="fv"/><text x="193" y="80">1.02 s</text>
    <text x="10" y="100">asyncio</text><rect x="110" y="88" width="15" height="15" class="ft st"/><text x="131" y="100">0.20 s</text>
    <text x="10" y="135" class="tm">ROUTES: 4 riders × 9 stops (computing)</text>
    <text x="10" y="157">sequential</text><rect x="110" y="145" width="112" height="15" class="fs"/><text x="228" y="157">1.49 s</text>
    <text x="10" y="177">threads</text><rect x="110" y="165" width="138" height="15" class="fb sb"/><text x="254" y="177">1.84 s</text>
    <text x="10" y="197">processes</text><rect x="110" y="185" width="39" height="15" class="fv"/><text x="155" y="197">0.52 s</text>
    <text x="10" y="217">asyncio</text><rect x="110" y="205" width="122" height="15" class="ft st"/><text x="238" y="217">1.62 s</text>
  </svg><figcaption>Bar length = wall-clock seconds, same scale in both halves; shorter is better. Top: for waiting, threads and asyncio win by a factor of 20. Bottom: for computing, only processes help (about 3× here).</figcaption></figure>
  <p>Reading the numbers (they vary a little from run to run; the ratios are what matter):</p>
  <ul>
    <li><strong>Menus, threads and asyncio: 4.00 s → 0.20 s</strong>, 20× faster. All 20 waits happened during the same 0.2 s. That is concurrency.</li>
    <li><strong>Menus, processes: 1.02 s.</strong> Better than sequential but 5× worse than threads: with 4 processes only 4 requests wait at once, so 20 requests take 5 rounds of 0.2 s = 1.0 s. Buying 4 cores to wait is wasteful.</li>
    <li><strong>Routes, threads and asyncio: no faster than sequential</strong> (even slightly slower). Threads are blocked by the GIL: CPython lets only one thread run Python code at a time. The asyncio coroutines never <code>await</code>, so they simply run one after another.</li>
    <li><strong>Routes, processes: 1.49 s → 0.52 s</strong>, about 3× on 4 cores. Each process has its own interpreter and its own GIL. Not a full 4× because starting the processes and sending data to them costs time.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span><p>Hiring for a restaurant. To take 20 phone orders where each caller takes a while to decide (waiting), one attentive person with many phone lines (asyncio) or a few receptionists (threads) is enough. To chop 4 crates of vegetables (computing), you need 4 cooks with 4 knives (processes); 4 receptionists sharing one knife (threads with the GIL) chop no faster than one.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Thread</strong>: an independent line of execution inside a process; threads share the process's memory. <strong>Process</strong>: a running program with its own memory space; Python processes each have their own interpreter. <strong>GIL</strong> (Global Interpreter Lock): CPython's lock that allows one thread at a time to run Python bytecode. <strong>Event loop</strong>: asyncio's scheduler, which runs coroutines on one thread and switches between them at each <code>await</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Generalising one benchmark. Process start-up, data copying and machine load all change the picture: on a tiny job, processes can be <em>slower</em> than a plain loop (measured in <a class="xref" data-note="py_multiprocessing">Processes</a>). Always time your own case.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: The Whole App, Fixed.</b> Each tool won one job and lost the other. The real 6 pm run has both jobs. Can we use two tools at once?</div>

  <h2 id="cc-app"><span class="num">05</span>The Whole App, Fixed</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>What does QuickBite's 6 pm run look like when the waiting job and the computing job each get the right tool, and both run at the same time?</p>
  </div>
  <p>Here is the finished program. asyncio fetches the 20 menus on one thread, while a pool of 4 processes plans the 4 routes. <code>loop.run_in_executor(pool, route_cost, stops)</code> is the bridge: it hands a normal function to the process pool and gives back something asyncio can <code>await</code>. The <a class="xref" data-note="py_asyncio">asyncio</a> note builds this line by line.</p>
  <div class="fx" data-lang="py">import asyncio, time
from concurrent.futures import ProcessPoolExecutor
from quickbite import RESTAURANTS, RIDERS, fetch_menu_async, route_cost

async def main(pool):
    loop = asyncio.get_running_loop()
    route_jobs = [loop.run_in_executor(pool, route_cost, s) for s in RIDERS]   # computing: processes
    menus = await asyncio.gather(*(fetch_menu_async(r) for r in RESTAURANTS))   # waiting: one thread
    costs = await asyncio.gather(*route_jobs)
    return sum(m["dishes"] for m in menus), costs

if __name__ == "__main__":
    t = time.perf_counter()
    with ProcessPoolExecutor(max_workers=4) as pool:
        dishes, costs = asyncio.run(main(pool))
    print(f"{dishes} dishes, route costs {costs}, both jobs in {time.perf_counter() - t:.2f}s")</div>
  <div class="fx" data-lang="text">100 dishes, route costs [40, 36, 35, 36], both jobs in 0.67s</div>
  <p>About 0.7 s instead of about 5.5 s, with the same 100 dishes and the same four route costs. The route jobs were handed to the processes first, then the menus were fetched while the processes worked; the program finished when the slower of the two (the routes) was done.</p>
  <div class="flow"><span>20 menu requests</span><span>asyncio, 1 thread, ≈ 0.2 s</span><span>4 route plans</span><span>4 processes, ≈ 0.5 s</span><span>both overlap → ≈ 0.7 s</span></div>
  <div class="callout anlg"><span class="label">Analogy</span><p>The restaurant at opening time: the front-of-house person takes all the phone orders (asyncio handling the waits) while the four cooks in the back chop at the same time (processes doing the computing). Nobody waits for anybody.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>The general pattern: <strong>split the program into its waiting stages and its computing stages, give waiting stages concurrency (threads or asyncio) and computing stages parallelism (processes), and connect them</strong> with an executor (<code>run_in_executor</code>) or a queue.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Putting <code>route_cost(...)</code> directly inside an <code>async def</code>. It would run on the event loop's only thread and freeze all 20 menu requests until it finished. Heavy computing must leave the loop (measured in <a class="xref" data-note="py_asyncio">asyncio</a>, "Never Block the Loop").</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Decision Table.</b> QuickBite's two jobs are clean examples. Real jobs come in more shapes: 10,000 connections, numpy work, a library with no async version. Which tool for which?</div>

  <h2 id="cc-decide"><span class="num">06</span>Decision Table</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Given any slow piece of code, which tool should we reach for first?</p>
  </div>
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
  </svg><figcaption>The decision in three questions: is it really slow (profile), is it waiting or computing (the CPU/wall ratio), and then one practical question on each side.</figcaption></figure>
  <table class="tbl">
    <tr><th>Your code mostly…</th><th>Example</th><th>Use</th><th>Why</th><th>QuickBite evidence</th></tr>
    <tr><td>waits; tens to hundreds of tasks; normal (blocking) libraries</td><td>call a REST API for 200 user IDs with <code>requests</code>, boto3, a DB driver</td><td><strong>ThreadPoolExecutor</strong></td><td>waiting threads release the GIL; works with any library</td><td>menus 4.00 → 0.20 s</td></tr>
    <tr><td>waits; thousands of tasks; async libraries exist</td><td>crawl 10,000 URLs, a websocket/chat server, an async web API</td><td><strong>asyncio</strong></td><td>a task costs a few KB, a thread far more; no locks needed</td><td>menus 4.00 → 0.20 s on one thread</td></tr>
    <tr><td>computes in pure Python</td><td>route search, tokenising text, parsing logs, simulations</td><td><strong>ProcessPoolExecutor</strong></td><td>each process has its own GIL → every core works</td><td>routes 1.49 → 0.52 s</td></tr>
    <tr><td>computes in numpy / pandas / PyTorch</td><td>matrix maths, groupby, a model's forward pass</td><td><strong>vectorise first</strong></td><td>the C code is already fast, releases the GIL, and often uses many cores</td><td>(numpy beat 4 processes ≈ 20× in <a class="xref" data-note="py_multiprocessing">Processes</a>)</td></tr>
    <tr><td>both waits and computes</td><td>fetch then featurise</td><td><strong>asyncio (or threads) + a process pool</strong></td><td>each stage gets its own tool</td><td>whole run ≈ 5.5 → 0.7 s</td></tr>
    <tr><td>tiny, fast tasks</td><td>adding up a list</td><td><strong>nothing</strong></td><td>the overhead of any tool exceeds the gain</td><td>(5000 tiny jobs: processes 1 s vs loop 0.01 s)</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>Choosing transport: walking (plain loop) for the corner shop, a bicycle (threads) for short trips around town, a bus (asyncio) when you have to move very many people along the same route cheaply, and four trucks (processes) for heavy loads. Taking four trucks to the corner shop is slower than walking.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>Rule of thumb: <strong>waiting → concurrency (threads; asyncio when there are very many waits and async libraries), computing → parallelism (processes) or faster code (numpy)</strong>. And measure, because overhead can erase the gain on small jobs.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Choosing asyncio because it is fashionable when the code uses <code>requests</code>, <code>psycopg2</code> or another blocking library. Every blocking call inside <code>async def</code> freezes the loop, so you get the complexity of asyncio and the speed of a plain loop. Use threads, or switch to async libraries end to end.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Reading Order.</b> We know which tool to pick. Now we need to learn to use each one well, in an order where each note builds on the one before.</div>

  <h2 id="cc-order"><span class="num">07</span>Reading Order: What Each Note Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In which order should the three tools be learned, and what exactly will each note teach?</p>
  </div>
  <h3>1. <a class="xref" data-note="py_threading">Threads &amp; the GIL</a></h3>
  <p>First, because threads are the most direct way to overlap waits and they introduce the problems every other tool reacts to. You will start and join threads with a timeline traced by hand, fetch the 20 menus in 0.2 s, measure that 4 threads do not speed up the routes, and learn why (the GIL, with reference counts shown for real). Then the price of shared memory: a race condition reproduced (800,000 updates, but only 440,000 to 730,000 counted, different every run), explained with <code>dis</code>, and fixed with <code>Lock</code>; <code>RLock</code>, a deadlock traced and fixed, <code>Semaphore</code>, <code>Event</code>, a <code>queue.Queue</code> producer–consumer, and <code>ThreadPoolExecutor</code>. Free-threaded Python 3.13t is covered briefly and honestly.</p>
  <h3>2. <a class="xref" data-note="py_multiprocessing">Processes</a></h3>
  <p>Second, because it answers the question threads leave open: how to use all cores. You will plan the routes in about a third of the time, see that processes do not share variables, learn why arguments must be picklable and why <code>if __name__ == "__main__":</code> is required (watching child processes re-run your file), measure what starting processes and copying data cost (and how <code>chunksize</code> fixes the tiny-task disaster), pass messages with <code>Queue</code> and <code>Pipe</code>, share memory with <code>Value</code>, <code>Array</code> and <code>shared_memory</code>, and learn when not to use processes at all.</p>
  <h3>3. <a class="xref" data-note="py_asyncio">asyncio</a></h3>
  <p>Last, because it builds on both: it does what threads do (overlap waits) without threads, and it hands CPU work to the processes. You will see that <code>async def</code> returns a coroutine object (driven by hand with <code>send</code>, exactly like a generator), why awaiting one by one is still sequential, <code>create_task</code> vs <code>await</code> on a traced timeline, <code>gather</code>, <code>TaskGroup</code>, timeouts and cancellation, <code>async with</code> and <code>async for</code>, the "never block the loop" rule measured, <code>to_thread</code> and <code>run_in_executor</code>, and real async HTTP against a local server with httpx and aiohttp.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Learning to run a kitchen: first hire helpers who share the kitchen (threads) and learn the rules that stop them colliding; then open more kitchens (processes) when one is not enough; finally train one very efficient waiter (asyncio) who coordinates everyone.</p></div>
  <div class="callout def"><span class="label">Definition</span><p>The dependency chain: <strong>threads</strong> introduce concurrency, shared state and locks → <strong>processes</strong> remove the GIL limit by removing shared state → <strong>asyncio</strong> keeps concurrency but replaces OS threads with cooperative tasks on one thread, and borrows threads/processes for anything that blocks.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Starting with asyncio because "it's the modern way". Without knowing what threads do and what blocking means, the most common asyncio bug (a blocking call inside <code>async def</code>) makes no sense.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> One table that places every concept of the group on the running example.</div>

  <h2 id="cc-connect"><span class="num">08</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can the whole group be held in one picture: what each concept is built from, which question it answers, and what it gave on QuickBite?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 270" width="680">
    <defs><marker id="cc-a8" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="250" y="8" width="180" height="36" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="340" y="24" text-anchor="middle" font-size="12">slow program</text><text x="340" y="38" text-anchor="middle" class="tm" font-size="10">CPU / wall ratio?</text>
    <line x1="300" y1="44" x2="160" y2="72" stroke="currentColor" marker-end="url(#cc-a8)"/>
    <line x1="380" y1="44" x2="520" y2="72" stroke="currentColor" marker-end="url(#cc-a8)"/>
    <rect x="70" y="74" width="180" height="36" rx="6" class="fb sb"/><text x="160" y="90" text-anchor="middle" font-size="12">I/O-bound</text><text x="160" y="104" text-anchor="middle" class="tm" font-size="10">needs concurrency</text>
    <rect x="430" y="74" width="180" height="36" rx="6" class="fv"/><text x="520" y="90" text-anchor="middle" font-size="12">CPU-bound</text><text x="520" y="104" text-anchor="middle" class="tm" font-size="10">needs parallelism</text>
    <line x1="130" y1="110" x2="90" y2="140" stroke="currentColor" marker-end="url(#cc-a8)"/>
    <line x1="190" y1="110" x2="270" y2="140" stroke="currentColor" marker-end="url(#cc-a8)"/>
    <line x1="520" y1="110" x2="520" y2="140" stroke="currentColor" marker-end="url(#cc-a8)"/>
    <rect x="10" y="142" width="160" height="40" rx="6" class="fb sb"/><text x="90" y="160" text-anchor="middle" font-size="12">threads</text><text x="90" y="175" text-anchor="middle" class="tm" font-size="10">menus 4.00 → 0.20 s</text>
    <rect x="200" y="142" width="160" height="40" rx="6" class="ft st"/><text x="280" y="160" text-anchor="middle" font-size="12">asyncio</text><text x="280" y="175" text-anchor="middle" class="tm" font-size="10">menus 0.20 s, 1 thread</text>
    <rect x="440" y="142" width="160" height="40" rx="6" class="fv"/><text x="520" y="160" text-anchor="middle" font-size="12">processes</text><text x="520" y="175" text-anchor="middle" class="tm" font-size="10">routes 1.49 → 0.52 s</text>
    <line x1="170" y1="162" x2="436" y2="162" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#cc-a8)"/><text x="380" y="135" class="tr" font-size="10">GIL blocks threads on CPU work</text>
    <line x1="90" y1="182" x2="90" y2="212" stroke="currentColor" marker-end="url(#cc-a8)"/>
    <rect x="10" y="214" width="160" height="36" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="90" y="230" text-anchor="middle" font-size="11">shared memory → races</text><text x="90" y="244" text-anchor="middle" class="tm" font-size="10">Lock, Queue</text>
    <line x1="280" y1="182" x2="330" y2="212" stroke="currentColor" marker-end="url(#cc-a8)"/>
    <line x1="520" y1="182" x2="440" y2="212" stroke="currentColor" marker-end="url(#cc-a8)"/>
    <rect x="250" y="214" width="250" height="36" rx="6" class="fg sg"/><text x="375" y="230" text-anchor="middle" font-size="12">asyncio + process pool</text><text x="375" y="244" text-anchor="middle" class="tm" font-size="10">run_in_executor: whole run ≈ 0.7 s</text>
  </svg><figcaption>The group as one picture. The diagnosis splits slow programs into waiting and computing. Waiting gets threads or asyncio; computing gets processes, because the GIL stops threads (dashed arrow). Threads' shared memory brings races and locks. The finished app joins asyncio and a process pool.</figcaption></figure>
  <table class="tbl"><caption>Every concept of the group on QuickBite</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>On the running example</th><th>When to use</th></tr>
    <tr><td>Sequential baseline</td><td>a plain loop</td><td>how slow is it, and is it correct?</td><td>menus 4.00 s, routes ≈ 1.5 s; 100 dishes; 40, 36, 35, 36</td><td>always first</td></tr>
    <tr><td>I/O vs CPU diagnosis</td><td>wall clock + CPU clock</td><td>waiting or computing?</td><td>menus CPU 0%, routes CPU 98%</td><td>before choosing any tool</td></tr>
    <tr><td>Concurrency</td><td>switching between tasks</td><td>can waits overlap?</td><td>20 waits in one 0.2 s window</td><td>I/O-bound work</td></tr>
    <tr><td>Parallelism</td><td>several cores</td><td>can calculations run at once?</td><td>4 routes on 4 cores</td><td>CPU-bound work</td></tr>
    <tr><td>Threads</td><td>OS threads in one process, shared memory</td><td>simplest concurrency?</td><td>menus 0.20 s; routes no faster</td><td>waiting with blocking libraries</td></tr>
    <tr><td>GIL</td><td>one lock around the interpreter</td><td>why don't threads compute in parallel?</td><td>4 threads on routes 1.84 s vs 1.49 s</td><td>(a limit to know, not a tool)</td></tr>
    <tr><td>Locks &amp; queues</td><td>threads + shared data</td><td>how do threads share safely?</td><td>800,000 updates only correct with a lock</td><td>whenever threads change shared data</td></tr>
    <tr><td>Processes</td><td>separate interpreters, own GIL each</td><td>real parallelism?</td><td>routes 0.52 s; menus 1.02 s (wasteful)</td><td>pure-Python computing</td></tr>
    <tr><td>asyncio</td><td>coroutines (generator-like pausing) + event loop</td><td>many waits, one thread?</td><td>menus 0.20 s on one thread</td><td>very many waits, async libraries</td></tr>
    <tr><td>Executor bridge</td><td>asyncio + a pool</td><td>a program that waits and computes?</td><td>both jobs ≈ 0.7 s</td><td>mixed pipelines</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the group: <strong>first ask whether the slow part is waiting or computing; waiting is hidden by concurrency (threads, or asyncio's single-threaded event loop), computing is shortened only by parallelism (processes, because the GIL lets one thread run Python at a time), and real programs combine them.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> One typical trap per tool, so you recognise them before meeting them in the child notes.</div>

  <h2 id="cc-traps"><span class="num">09</span>Common Mistakes Across the Group</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which single mistake is most typical for each tool, and where is it explained?</p>
  </div>
  <table class="tbl">
    <tr><th>Tool</th><th>Typical mistake</th><th>Symptom</th><th>Details</th></tr>
    <tr><td>Any</td><td>parallelising before profiling</td><td>no speed-up, or a database melts</td><td>section 03 here</td></tr>
    <tr><td>Threads</td><td>threads for pure-Python calculation</td><td>4 threads as slow as 1 (the GIL)</td><td><a class="xref" data-note="py_threading">Threads &amp; the GIL</a> §03</td></tr>
    <tr><td>Threads</td><td>changing shared data without a lock</td><td>wrong totals that differ every run</td><td><a class="xref" data-note="py_threading">Threads &amp; the GIL</a> §04</td></tr>
    <tr><td>Processes</td><td>no <code>if __name__ == "__main__":</code>, or a lambda as the worker</td><td><code>RuntimeError</code> / <code>PicklingError</code></td><td><a class="xref" data-note="py_multiprocessing">Processes</a> §04</td></tr>
    <tr><td>Processes</td><td>thousands of tiny tasks, or huge arguments</td><td>slower than a plain loop</td><td><a class="xref" data-note="py_multiprocessing">Processes</a> §05</td></tr>
    <tr><td>asyncio</td><td><code>time.sleep</code> / <code>requests.get</code> / heavy maths inside <code>async def</code></td><td>"concurrent" code runs one task at a time</td><td><a class="xref" data-note="py_asyncio">asyncio</a> §08</td></tr>
    <tr><td>asyncio</td><td>awaiting one by one in a loop</td><td>20 menus still take 4 s</td><td><a class="xref" data-note="py_asyncio">asyncio</a> §03</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: the child notes.</b> This map only names the ideas. Start with <a class="xref" data-note="py_threading">Threads &amp; the GIL</a>, where the first thread is started and traced on the QuickBite menus.</div>

  <h2 id="cc-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The group on one page. Running example: QuickBite fetches 20 menus (0.2 s each; dishes 4, 5, 6, 7, 3 repeating → 100) and plans 4 riders' routes (9 stops each, try all 9! orders; costs 40, 36, 35, 36). Hand example: stops A (2, 1), B (5, 3), C (1, 4) from (0, 0) → best order A → C → B = 3 + 4 + 5 = 12.</p>
  <h3>The ladder in one line each</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>Answer in one line</th></tr>
    <tr><td>Sequential</td><td>why is it slow?</td><td>waits add up: 20 × 0.2 s = 4.0 s with the CPU idle</td></tr>
    <tr><td>Concurrency</td><td>can we use the waiting time?</td><td>keep many tasks in progress and switch: waits overlap</td></tr>
    <tr><td>Parallelism</td><td>can we compute faster?</td><td>run on several cores at the same instant</td></tr>
    <tr><td>I/O- vs CPU-bound</td><td>which does my code need?</td><td>CPU time / wall time: ≈ 0% waiting, ≈ 100% computing</td></tr>
    <tr><td>Threads</td><td>simplest concurrency?</td><td>shared-memory workers; menus 4.0 → 0.2 s</td></tr>
    <tr><td>GIL</td><td>why no speed-up on routes?</td><td>one thread runs Python at a time; released while waiting</td></tr>
    <tr><td>Processes</td><td>how to use all cores?</td><td>separate interpreters with their own GIL; routes ≈ 3× faster; cost: start-up, pickling</td></tr>
    <tr><td>asyncio</td><td>many waits, one thread?</td><td>coroutines + event loop; switch only at <code>await</code>; never block</td></tr>
    <tr><td>Combination</td><td>a program that does both?</td><td>asyncio for I/O + process pool for CPU via <code>run_in_executor</code></td></tr>
  </table>
  <h3>Measured on this machine (4 cores; ratios matter, not exact times)</h3>
  <table class="tbl">
    <tr><th>Job</th><th>Sequential</th><th>Threads</th><th>Processes (4)</th><th>asyncio</th></tr>
    <tr><td>Menus (waiting)</td><td>4.00 s</td><td>0.20 s</td><td>1.02 s</td><td>0.20 s</td></tr>
    <tr><td>Routes (computing)</td><td>1.49 s</td><td>1.84 s</td><td>0.52 s</td><td>1.62 s</td></tr>
  </table>
  <h3>Which tool when</h3>
  <div class="cards">
    <div><b>Waiting, normal libraries</b><p><code>ThreadPoolExecutor</code>. Lock any shared data you change.</p><small>APIs with requests, boto3, DB drivers</small></div>
    <div><b>Waiting, thousands, async libraries</b><p>asyncio with <code>gather</code>/<code>TaskGroup</code>, a semaphore, one shared client.</p><small>crawlers, websockets, FastAPI</small></div>
    <div><b>Computing, pure Python</b><p><code>ProcessPoolExecutor</code> under <code>if __name__ == "__main__":</code>, top-level functions, big chunks.</p><small>route search, parsing</small></div>
    <div><b>Computing, numpy/pandas</b><p>Vectorise first; the C code is already fast and releases the GIL.</p><small>do not wrap numpy in processes by reflex</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Not profiling first; threads for CPU work; shared data without a lock; missing <code>__main__</code> guard or unpicklable worker; tiny tasks or huge arguments sent to processes; blocking calls inside <code>async def</code>; awaiting one by one and calling it concurrent.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>20 requests × 0.2 s, sequential vs 20 threads?</td><td>4.0 s vs ≈ 0.2 s</td></tr>
    <tr><td>Concurrency or parallelism: one cook, four pans?</td><td>Concurrency</td></tr>
    <tr><td>A function has CPU time 0.1 s and wall time 5 s. Which tool?</td><td>I/O-bound → threads or asyncio</td></tr>
    <tr><td>Why are 4 threads no faster at route planning?</td><td>The GIL: only one thread runs Python bytecode at a time</td></tr>
    <tr><td>Total dishes over the 20 QuickBite menus?</td><td>4 × (4 + 5 + 6 + 7 + 3) = 100</td></tr>
  </table>

  <h2 id="cc-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Concurrency vs parallelism: what is the difference, with an example of each?</summary><div class="qa-body">Concurrency: several tasks in progress, switching between them (one cook with four pans; 20 menu requests waiting together on one thread). Parallelism: several tasks executing at the same instant on different cores (four cooks; 4 route plans on 4 cores). Concurrency hides waiting; only parallelism speeds up computing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you tell whether code is I/O-bound or CPU-bound?</summary><div class="qa-body">Measure wall time (<code>time.perf_counter</code>) and CPU time (<code>time.process_time</code>) around it, or profile it. CPU / wall near 0% means it is waiting (I/O-bound); near 100% means it is computing (CPU-bound). The QuickBite menus were 0%, the routes 98%.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Threading vs multiprocessing vs asyncio: when each?</summary><div class="qa-body">Threads: I/O-bound work with normal blocking libraries, tens to hundreds of tasks. Processes: CPU-bound pure-Python work; costs start-up, memory and pickling. asyncio: very many concurrent waits with async libraries; one thread, no locks, but every call in the path must cooperate (never block).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the GIL make processes necessary?</summary><div class="qa-body">The GIL allows only one thread per interpreter to run Python bytecode at a time, so threads cannot calculate in parallel. A process is a separate interpreter with its own GIL, so 4 processes can run Python on 4 cores at once. Without the GIL (free-threaded builds), threads could do it, which is why that work matters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why are processes a poor choice for the menus even though they "run in parallel"?</summary><div class="qa-body">Waiting does not need a core. With 4 processes only 4 requests wait at a time, so 20 requests take 5 rounds (1.02 s), and you pay process start-up and pickling. Threads or asyncio let all 20 wait together in 0.2 s for almost no cost.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what does asyncio borrow from generators?</summary><div class="qa-body">The ability to pause a function in the middle and resume it later with its local variables intact. A coroutine is driven with <code>send()</code> and finishes with <code>StopIteration</code>, just like a generator; <code>await</code> is the pause point, as <code>yield</code> is for generators. The event loop is the code that calls <code>send</code> for you.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip the diagnosis step?</summary><div class="qa-body">You may pick the wrong tool: threads for a calculation (no gain, extra race risk), processes for waiting (5× worse than threads on the menus), or any tool for a job dominated by one slow query (the database gets hammered, the program gets no faster).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why did the combined app take about 0.7 s and not 0.2 s?</summary><div class="qa-body">The two jobs overlapped, so the total is set by the slower one: the routes need about 0.5 s on 4 processes (plus start-up), while the menus finished at about 0.2 s. Overlapping removed the menu time entirely, not the route time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Where will you meet these tools in data and ML work?</summary><div class="qa-body">Threads: parallel S3/API downloads, PyTorch <code>DataLoader</code> prefetching. Processes: <code>DataLoader(num_workers=…)</code>, scikit-learn's <code>n_jobs</code>, parallel feature engineering. asyncio: <a class="xref" data-note="api_fastapi">FastAPI</a> endpoints, async database drivers, streaming consumers such as aiokafka for <a class="xref" data-note="de_kafka">Kafka</a>, calling LLM APIs for many prompts at once.</div></details>
</main>
`
});
