// notes/python/py_asyncio.js — asyncio
Object.assign(TOPIC_CONTENT, {
  "py_asyncio": `<main>
<h1>asyncio</h1>
  <div class="where"><span>Python</span><span>Advanced Python</span><span>Concurrency</span><span>asyncio</span></div>
  <p class="lead">Threads overlapped QuickBite's 20 menu waits, but each thread costs memory, the operating system decides when they switch, and shared data needs locks. <strong>asyncio</strong> overlaps the same waits on a <em>single</em> thread: every function says exactly where it will wait (<code>await</code>), and an <strong>event loop</strong> runs something else at each of those points. This note builds it up from the bottom: a coroutine driven by hand like a generator, why awaiting one by one is still sequential, tasks on a traced timeline, <code>gather</code> and <code>TaskGroup</code>, timeouts and cancellation, <code>async with</code> and <code>async for</code>, the one rule you must never break (do not block the loop, measured), how to run blocking and CPU-heavy code anyway, and real async HTTP against a local server. Every block was run; times vary a little between runs.</p>

  <h2 id="ai-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 150" width="640">
    <defs><marker id="ai-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="200" y="8" width="240" height="30" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="28" text-anchor="middle" font-size="12">Concurrency in Python: the map</text>
    <line x1="320" y1="38" x2="110" y2="70" stroke="currentColor" stroke-opacity="0.45"/>
    <line x1="320" y1="38" x2="320" y2="70" stroke="currentColor" stroke-opacity="0.45"/>
    <line x1="320" y1="38" x2="530" y2="70" stroke="currentColor" stroke-opacity="0.45"/>
    <rect x="20" y="70" width="180" height="34" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="110" y="92" text-anchor="middle" font-size="12">Threads &amp; the GIL</text>
    <rect x="230" y="70" width="180" height="34" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="92" text-anchor="middle" font-size="12">Processes</text>
    <rect x="440" y="70" width="180" height="34" rx="6" class="fg sg" stroke-width="2.5"/><text x="530" y="92" text-anchor="middle" font-size="12" font-weight="700">asyncio</text>
    <line x1="200" y1="87" x2="226" y2="87" stroke="currentColor" marker-end="url(#ai-a0)"/>
    <line x1="410" y1="87" x2="436" y2="87" stroke="currentColor" marker-end="url(#ai-a0)"/>
    <path d="M110,104 Q320,150 524,108" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#ai-a0)"/>
    <text x="320" y="142" text-anchor="middle" class="tm" font-size="11">to_thread uses a thread pool; run_in_executor a process pool</text>
  </svg><figcaption>The Concurrency group. You are on the green note, the last child. It replaces threads for waiting work, and it borrows both earlier notes' pools for anything that would block its single thread.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="py_threading">Threads &amp; the GIL</a>, <a class="xref" data-note="py_multiprocessing">Processes</a> and <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a></b><span>Threads overlapped the 20 menu waits (4.0 → 0.2 s) but cost memory each and needed locks; processes computed the routes in parallel. And generators showed a function that can <em>pause</em> at <code>yield</code> and be resumed with <code>send</code>: asyncio's coroutines are built on exactly that.</span></li>
    <li><b>This note adds: cooperative concurrency on one thread</b><span>The event loop, coroutines, <code>await</code>, <code>asyncio.run</code>, tasks, <code>gather</code>/<code>TaskGroup</code>/<code>as_completed</code>, timeouts and cancellation, async semaphores, <code>async with</code>/<code>async for</code>, the blocking rule, <code>to_thread</code>/<code>run_in_executor</code>, async HTTP with httpx and aiohttp, and the traps.</span></li>
    <li><b>Leads to: <a class="xref" data-note="api_fastapi">FastAPI</a>, <a class="xref" data-note="de_kafka">Kafka &amp; Streaming</a> and <a class="xref" data-note="py_testing">Testing &amp; Debugging</a></b><span>FastAPI endpoints are <code>async def</code> coroutines running on an event loop; async Kafka clients consume streams with <code>async for</code>; testing async code needs an event loop in the test (e.g. <code>asyncio.run</code> or pytest-asyncio).</span></li>
  </ol>

  <h2 id="ai-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The note as one chain. Numbers come from the running example: 20 menus at 0.2 s each (100 dishes), 4 route plans (40, 36, 35, 36).</p>
  <ol class="story">
    <li><b>Event loop</b><span>Q: can one thread juggle 20 waits without OS threads? → Yes, if each task gives control back while it waits; a loop then runs whichever task is ready. Like one waiter serving many tables. What is a "task that can give control back"?</span></li>
    <li><b>Coroutine</b><span>Q: what does <code>async def</code> make? → Calling it returns a paused coroutine object; nothing runs. <code>send(None)</code> runs it to its next pause; it ends with <code>StopIteration(value)</code>, exactly like a generator. Who calls <code>send</code>?</span></li>
    <li><b>await and asyncio.run</b><span>Q: how do we run coroutines? → <code>asyncio.run(main())</code> starts the loop; <code>await x</code> runs x and waits for it. But awaiting 20 fetches one by one still takes 4.01 s. Why?</span></li>
    <li><b>Tasks</b><span>Q: how do two coroutines run at the same time? → <code>create_task</code> schedules a coroutine on the loop; it starts at the next <code>await</code>. R01 (0.3 s) + R02 (0.2 s): 0.5 s awaited in turn, 0.3 s as tasks. Starting 20 tasks by hand is clumsy…</span></li>
    <li><b>gather, TaskGroup</b><span>Q: run many and collect results? → <code>gather</code>: 100 dishes in 0.20 s, input order; <code>return_exceptions</code>; <code>TaskGroup</code> cancels the rest when one fails. What if a restaurant never answers?</span></li>
    <li><b>Timeouts, cancellation, limits</b><span>Q: how do we stop waiting, or not overload the API? → <code>asyncio.timeout</code>, <code>wait_for</code>, <code>task.cancel()</code> (cleanup still runs); <code>Semaphore(5)</code>: peak 5, 0.80 s. Resources must open and close around awaits…</span></li>
    <li><b>async with, async for</b><span>Q: what if opening, closing or iterating needs to wait? → <code>__aenter__</code>/<code>__aexit__</code>, <code>@asynccontextmanager</code>, async generators. Everything cooperates. What if something does not?</span></li>
    <li><b>Never block the loop</b><span>Q: what does one <code>time.sleep</code> do? → Freezes every task: 5 fetches 0.20 s → 1.00 s; a route plan stopped the heartbeat for 0.3 s. Then how do we call blocking or heavy code at all?</span></li>
    <li><b>to_thread, run_in_executor</b><span>Q: how do we run blocking code from async code? → <code>to_thread</code> (thread pool: 20 blocking fetches 0.60 s with 8 threads); <code>run_in_executor</code> with a process pool: routes done at 0.6 s while menus and heartbeat kept going. And real network calls?</span></li>
    <li><b>Async HTTP</b><span>Q: what does this look like with a real server? → One shared <code>httpx.AsyncClient</code> or <code>aiohttp.ClientSession</code>, a semaphore, <code>raise_for_status</code>: 20 menus in ≈ 0.4–0.5 s with 10 in flight. What still goes wrong?</span></li>
    <li><b>Traps</b><span>Q: the classic bugs? → Forgotten <code>await</code> (a warning, no result), <code>asyncio.run</code> inside a running loop, lost task references, sequential awaits, blocking calls.</span></li>
  </ol>

  <h2 id="ai-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">asyncio</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Model</div>
        <ul>
          <li><b>One thread</b>, one <b>event loop</b>, many tasks</li>
          <li>Cooperative: switch only at <code>await</code></li>
          <li>vs threads: preemptive, OS switches anywhere</li>
          <li>No locks needed between awaits</li>
          <li>💡 one waiter, many tables</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Coroutines</div>
        <ul>
          <li><code>async def f()</code>; <code>f()</code> returns a coroutine, runs nothing</li>
          <li><code>coro.send(None)</code> → next pause; <code>StopIteration.value</code> = result</li>
          <li>Generators with a new name (<a class="xref" data-note="py_iterators">Iterators</a>)</li>
          <li><code>asyncio.run(main())</code> — once per program</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Running many</div>
        <ul>
          <li><code>await</code> in a loop → sequential (4.01 s)</li>
          <li><code>create_task</code> → starts at next await; keep a reference</li>
          <li><code>gather</code> → input order; <code>return_exceptions=True</code></li>
          <li><code>as_completed</code> → finish order</li>
          <li><code>TaskGroup</code> (3.11+) → one fails, rest cancelled</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Control</div>
        <ul>
          <li><code>async with asyncio.timeout(s)</code>, <code>wait_for</code></li>
          <li><code>task.cancel()</code> → <code>CancelledError</code>; re-raise it</li>
          <li><code>asyncio.Semaphore(n)</code> — max n in flight</li>
          <li><code>async with</code> / <code>async for</code> / async generators</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Never block</div>
        <ul>
          <li><code>time.sleep</code>, <code>requests</code>, heavy CPU freeze every task</li>
          <li>5 fetches: 0.20 s → 1.00 s with <code>time.sleep</code></li>
          <li><code>asyncio.to_thread(f, …)</code> for blocking I/O</li>
          <li><code>loop.run_in_executor(process_pool, f, …)</code> for CPU</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">HTTP</div>
        <ul>
          <li>One <code>httpx.AsyncClient</code> / <code>aiohttp.ClientSession</code></li>
          <li>Semaphore + timeouts + <code>raise_for_status()</code></li>
          <li>20 menus, 10 in flight: ≈ 2 rounds</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ai-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="ai-loop"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Event Loop</span><span class="rm-sub">One waiter, many tables</span></div></div>
      <div class="rm-item rm-done" data-target="ai-coro"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Coroutines</span><span class="rm-sub">Driven by hand, like generators</span></div></div>
      <div class="rm-item rm-done" data-target="ai-await"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">await and asyncio.run</span><span class="rm-sub">Still sequential!</span></div></div>
      <div class="rm-item rm-done" data-target="ai-task"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Tasks</span><span class="rm-sub">create_task vs await, traced</span></div></div>
      <div class="rm-item rm-done" data-target="ai-gather"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">gather and TaskGroup</span><span class="rm-sub">Many at once</span></div></div>
      <div class="rm-item rm-done" data-target="ai-timeout"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Timeouts, Cancellation, Limits</span><span class="rm-sub">Stop waiting, stay polite</span></div></div>
      <div class="rm-item rm-done" data-target="ai-with"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">async with and async for</span><span class="rm-sub">Resources and streams</span></div></div>
      <div class="rm-item rm-done" data-target="ai-block"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Never Block the Loop</span><span class="rm-sub">Measured</span></div></div>
      <div class="rm-item rm-done" data-target="ai-exec"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Blocking Code from async</span><span class="rm-sub">to_thread, run_in_executor</span></div></div>
      <div class="rm-item rm-done" data-target="ai-http"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Async HTTP</span><span class="rm-sub">httpx and aiohttp, local server</span></div></div>
      <div class="rm-item rm-done" data-target="ai-pitfalls"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Traps, Demonstrated</span><span class="rm-sub">The classic bugs</span></div></div>
      <div class="rm-item rm-done" data-target="ai-connect"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">The whole group, one table</span></div></div>
      <div class="rm-item rm-done" data-target="ai-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="ai-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview and connection checks</span></div></div>
    </div>
  </div>

  <h2 id="ai-loop"><span class="num">01</span>The Event Loop: One Waiter, Many Tables</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Threads got the 20 menus in 0.2 s, but we paid for 20 operating-system threads, the OS switched between them whenever it liked, and every shared variable needed a lock. Could a <em>single</em> thread keep 20 requests in flight by itself?</p>
  </div>
  <h3>The running example, again</h3>
  <p>All code imports from <code>quickbite.py</code> (introduced in <a class="xref" data-note="py_concurrency">the map</a>). This note mostly uses <code>fetch_menu_async</code>: the same 0.2 s request, but the wait is written <code>await asyncio.sleep(LATENCY)</code> instead of <code>time.sleep(LATENCY)</code>. The difference between those two lines is the whole subject of this note.</p>
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
  <p>A thread waiting for a network reply does nothing useful; it just sits. What if, instead of sitting, the function said "I'm waiting for this reply; wake me when it arrives" and <em>returned control</em> to a scheduler? The scheduler could then start the next request, and the next, and come back to each function when its reply arrived. One thread, no sitting. That scheduler is the <strong>event loop</strong>, and functions that can give control back like this are <strong>coroutines</strong>. The places where they give control back are marked with <code>await</code>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A good waiter serving twenty tables. The waiter takes table 1's order, hands it to the kitchen, and does not stand at the kitchen door waiting; they go to table 2, then 3. When the kitchen rings the bell for table 1, the waiter brings the food. One waiter, twenty tables in progress. Threads are twenty waiters, one per table, each mostly standing at the kitchen door. But if our single waiter stops to chat at one table for ten minutes (a blocking call), every other table waits.</p></div>
  <figure class="viz"><svg viewBox="0 0 590 200" width="590">
    <defs><marker id="ai-ah3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="180" height="50" rx="8" class="fb sb"/><text x="24" y="42">Ready queue</text><text x="24" y="60" class="tm">tasks able to run</text>
    <rect x="390" y="20" width="190" height="50" rx="8" class="fg sg"/><text x="402" y="42">Run one task</text><text x="402" y="60" class="tm">until it reaches await</text>
    <rect x="170" y="135" width="250" height="50" rx="8" class="fs"/><text x="184" y="157">Waiting</text><text x="184" y="175" class="tm">sockets, timers (OS tells the loop)</text>
    <line x1="190" y1="45" x2="386" y2="45" stroke="currentColor" stroke-width="1.5" marker-end="url(#ai-ah3)"/><text x="245" y="38" class="tm">pick next</text>
    <line x1="480" y1="70" x2="400" y2="132" stroke="currentColor" stroke-width="1.5" marker-end="url(#ai-ah3)"/><text x="455" y="112" class="tm">await I/O</text>
    <line x1="200" y1="133" x2="110" y2="73" stroke="currentColor" stroke-width="1.5" marker-end="url(#ai-ah3)"/><text x="10" y="140" class="tm">reply ready</text><text x="10" y="156" class="tm">→ wake</text>
  </svg><figcaption>The event loop goes round this circle on one thread: take a ready task, run it until it reaches an <code>await</code> on something not yet available, park it in Waiting, and when the operating system reports that its reply or timer is ready, move it back to Ready.</figcaption></figure>
  <table class="tbl"><caption>Threads vs asyncio for the same 20 waits</caption>
    <tr><th></th><th>Threads</th><th>asyncio</th></tr>
    <tr><td>Who switches</td><td>the operating system, at any moment (<strong>preemptive</strong>)</td><td>the task itself, only at <code>await</code> (<strong>cooperative</strong>)</td></tr>
    <tr><td>Cost per waiting task</td><td>an OS thread with its own stack</td><td>a small Python object</td></tr>
    <tr><td>Shared data</td><td>needs locks (a switch can happen mid-update)</td><td>safe between awaits (nothing else runs)</td></tr>
    <tr><td>Libraries</td><td>any (requests, DB drivers)</td><td>must be async (httpx, aiohttp, asyncpg) or wrapped</td></tr>
    <tr><td>Main danger</td><td>races, deadlocks</td><td>one blocking call freezes everything</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Event loop</strong>: a scheduler running on one thread that keeps a queue of ready tasks, runs each until it awaits something not yet ready, and uses the operating system's I/O notification (epoll, kqueue, IOCP) to learn when waiting tasks can resume. <strong>Cooperative multitasking</strong>: tasks give up control voluntarily; nothing interrupts a task between two <code>await</code>s.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Thinking asyncio makes Python faster. It does not make any single request faster, and it does nothing for calculation (it runs on one thread, so it is not parallel). It only stops the program from sitting idle while waiting.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Coroutines.</b> The loop needs functions that can stop in the middle and be resumed later. What exactly does <code>async def</code> create, and how does "stop and resume" work?</div>

  <h2 id="ai-coro"><span class="num">02</span>Coroutines: async def Returns a Paused Function</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>What happens when you call a function defined with <code>async def</code>? Does it run?</p>
  </div>
  <p>Calling an <code>async def</code> function does <strong>not</strong> run its body. It creates a <strong>coroutine object</strong>: the function, paused before its first line. Something has to drive it. Below we drive one by hand with <code>send(None)</code>, the same method you used to resume generators in <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>.</p>
  <div class="fx" data-lang="py">import asyncio

async def count_dishes(rid):
    print(f"   ... count_dishes({rid!r}) is running")
    return 3 + int(rid[1:]) % 5

c = count_dishes("R01")
print("1. calling it gave a", type(c).__name__, "object; nothing ran")
try:
    c.send(None)                               # drive it by hand, like next() on a generator
except StopIteration as stop:
    print("2. it finished; StopIteration carried the result:", stop.value)
print("3. asyncio.run drives it for us:", asyncio.run(count_dishes("R02")))</div>
  <div class="fx" data-lang="text">1. calling it gave a coroutine object; nothing ran
   ... count_dishes('R01') is running
2. it finished; StopIteration carried the result: 4
   ... count_dishes('R02') is running
3. asyncio.run drives it for us: 5</div>
  <table class="tbl"><caption>Traced line by line</caption>
    <tr><th>Step</th><th>What happened</th><th>Printed</th></tr>
    <tr><td><code>c = count_dishes("R01")</code></td><td>a coroutine object is created; the body has <em>not</em> started</td><td>line 1 only says "coroutine object; nothing ran"</td></tr>
    <tr><td><code>c.send(None)</code></td><td>runs the body from the top; there is no pause point, so it runs to <code>return 4</code></td><td>"... is running"</td></tr>
    <tr><td>the <code>return</code></td><td>a finished coroutine raises <code>StopIteration</code>, with the return value in <code>.value</code> (exactly what a generator does)</td><td>"result: 4" (R01: 3 + 1 % 5 = 4)</td></tr>
    <tr><td><code>asyncio.run(count_dishes("R02"))</code></td><td>the event loop does the sending and catches StopIteration for us</td><td>"... is running", then 5</td></tr>
  </table>
  <p>Now a coroutine with a pause point. <code>await asyncio.sleep(0)</code> means "I give control back once, then continue". Driving it by hand shows the pause:</p>
  <div class="fx" data-lang="py">import asyncio

async def fetch(rid):
    print(f"   sending request for {rid}")
    await asyncio.sleep(0)                     # a pause point: control goes back to the caller
    print(f"   resumed: menu for {rid} arrived")
    return {"id": rid, "dishes": 4}

c = fetch("R01")
print("send #1 returned:", c.send(None))       # runs up to the pause, then hands back None
try:
    c.send(None)                               # resumes after the pause, runs to the end
except StopIteration as stop:
    print("send #2 finished with:", stop.value)</div>
  <div class="fx" data-lang="text">   sending request for R01
send #1 returned: None
   resumed: menu for R01 arrived
send #2 finished with: {'id': 'R01', 'dishes': 4}</div>
  <p>The first <code>send(None)</code> ran up to the <code>await</code> and stopped there, handing <code>None</code> back to us (the caller): "request sent", but not yet "arrived". The second <code>send</code> resumed right after the <code>await</code>, with every local variable (<code>rid</code>) intact, and ran to the end. <strong>This is the entire trick of asyncio.</strong> An <code>await</code> on something not ready pauses the coroutine and returns control to whoever called <code>send</code>. In real programs that caller is the event loop, which then calls <code>send</code> on some other coroutine, and comes back to this one when its timer or socket is ready.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A bookmark in a recipe. The coroutine object is the recipe with a bookmark at the start. Each <code>send</code> says "cook until the next step that needs waiting, then put the bookmark there". The event loop is the cook flipping between many bookmarked recipes.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Coroutine function</strong>: defined with <code>async def</code>. <strong>Coroutine</strong>: the object its call returns; it runs only when awaited, wrapped in a task, or passed to <code>asyncio.run</code>. Under the hood it is a generator-like object: <code>send()</code> runs to the next suspension, <code>StopIteration.value</code> carries the return value. <code>await</code> may only appear inside <code>async def</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Calling a coroutine function and expecting it to have done something: <code>fetch_menu_async("R01")</code> on its own does nothing at all and gives a "never awaited" warning later (section 11). Coroutines must be awaited or scheduled.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: await and asyncio.run.</b> We drove coroutines by hand. How do we let the event loop drive them, and does <code>await</code> alone make 20 fetches overlap?</div>

  <h2 id="ai-await"><span class="num">03</span>await and asyncio.run</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>If every fetch pauses at its <code>await</code>, does a simple loop of <code>await fetch_menu_async(rid)</code> fetch the 20 menus concurrently?</p>
  </div>
  <p><code>asyncio.run(main())</code> creates an event loop, runs the coroutine <code>main()</code> until it finishes, and closes the loop. Call it once, at the top of the program. Inside <code>main</code>, <code>await x</code> means "run x, and pause me until x has finished". Let us await the 20 fetches in a loop:</p>
  <div class="fx" data-lang="py">import asyncio, time
from quickbite import RESTAURANTS, fetch_menu_async

async def main():
    t = time.perf_counter()
    menus = []
    for rid in RESTAURANTS:
        menus.append(await fetch_menu_async(rid))   # wait for THIS one before the next
    print(f"awaited one by one: {sum(m['dishes'] for m in menus)} dishes in {time.perf_counter() - t:.2f}s")

asyncio.run(main())                            # start the loop, run main() to the end, close</div>
  <div class="fx" data-lang="text">awaited one by one: 100 dishes in 4.01s</div>
  <p>4.01 s: no faster than the plain sequential loop. Each <code>await</code> did pause <code>main</code> and give control to the loop, but the loop had <strong>nothing else to run</strong>: <code>main</code> had not yet created fetch 2, because it was still waiting on fetch 1. <code>await</code> means "wait for <em>this one</em> to finish". Pausing is necessary for concurrency, but not sufficient: there must also be other tasks ready to use the pause.</p>
  <table class="tbl"><caption>What the loop sees, by hand</caption>
    <tr><th>Time</th><th>main</th><th>Other tasks the loop could run</th></tr>
    <tr><td>0.0 s</td><td>awaits R01 (paused 0.2 s)</td><td>none</td></tr>
    <tr><td>0.2 s</td><td>R01 done; awaits R02</td><td>none</td></tr>
    <tr><td>…</td><td>…</td><td>none</td></tr>
    <tr><td>3.8 s</td><td>awaits R20</td><td>none</td></tr>
    <tr><td>4.0 s</td><td>done: 100 dishes</td><td></td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>A waiter who takes table 1's order, then stands still until table 1's food is served before even walking to table 2. The waiter is <em>able</em> to multitask but has been given only one table at a time.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong><code>asyncio.run(coro)</code></strong>: create a new event loop, run <code>coro</code> to completion, cancel leftovers, close the loop; cannot be called while a loop is already running in that thread. <strong><code>await x</code></strong>: suspend the current coroutine until the awaitable <code>x</code> (a coroutine, task or future) completes, then evaluate to its result (or raise its exception).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>for u in urls: data = await fetch(u)</code> is the most common "my async code is not faster" bug. It is correct, just sequential.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Tasks.</b> To overlap, the loop needs several coroutines in progress at once. How do we start a coroutine without waiting for it?</div>

  <h2 id="ai-task"><span class="num">04</span>Tasks: create_task vs await, Traced</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How do we tell the loop "start this fetch, but don't make me wait for it yet"?</p>
  </div>
  <p><code>asyncio.create_task(coro)</code> wraps a coroutine in a <strong>task</strong> and puts it in the loop's ready queue. It returns immediately. The task does not start at that very moment (only one thing runs at a time, and that is still <code>main</code>); it starts the next time <code>main</code> pauses at an <code>await</code>. Below, R01 (0.3 s) and R02 (0.2 s) are fetched twice: (A) awaited in turn, (B) as two tasks. Each line shows the time since the start.</p>
  <div class="fx" data-lang="py">import asyncio, time

T0 = time.perf_counter()
def log(msg):
    print(f"{time.perf_counter() - T0:.1f}s  {msg}")

async def fetch(rid, secs):
    log(f"{rid} request sent")
    await asyncio.sleep(secs)
    log(f"{rid} menu arrived")
    return rid

async def main():
    log("A) await, then await")
    await fetch("R01", 0.3)
    await fetch("R02", 0.2)
    log("B) create_task, create_task, then await")
    t1 = asyncio.create_task(fetch("R01", 0.3))   # scheduled, not started yet
    t2 = asyncio.create_task(fetch("R02", 0.2))
    log("both tasks created; main is still running")
    r1 = await t1                                 # main pauses; the loop starts t1 and t2
    r2 = await t2
    log(f"got {r1} and {r2}")

asyncio.run(main())</div>
  <div class="fx" data-lang="text">0.0s  A) await, then await
0.0s  R01 request sent
0.3s  R01 menu arrived
0.3s  R02 request sent
0.5s  R02 menu arrived
0.5s  B) create_task, create_task, then await
0.5s  both tasks created; main is still running
0.5s  R01 request sent
0.5s  R02 request sent
0.7s  R02 menu arrived
0.8s  R01 menu arrived
0.8s  got R01 and R02</div>
  <h3>Traced on a timeline</h3>
  <table class="tbl"><caption>Who runs when (one thread throughout)</caption>
    <tr><th>Time</th><th>main</th><th>R01</th><th>R02</th></tr>
    <tr><td colspan="4"><strong>A) await, then await</strong></td></tr>
    <tr><td>0.0</td><td><code>await fetch("R01")</code>: paused</td><td>sent; sleeps 0.3</td><td>(not created yet)</td></tr>
    <tr><td>0.3</td><td>resumes; <code>await fetch("R02")</code>: paused</td><td>arrived, done</td><td>sent; sleeps 0.2</td></tr>
    <tr><td>0.5</td><td>resumes</td><td></td><td>arrived, done</td></tr>
    <tr><td colspan="4"><strong>B) create_task, create_task, then await</strong></td></tr>
    <tr><td>0.5</td><td>creates t1, t2 (not started); prints "still running"; <code>await t1</code>: paused</td><td>loop starts it: sent; sleeps 0.3</td><td>loop starts it: sent; sleeps 0.2</td></tr>
    <tr><td>0.7</td><td>(still waiting for t1)</td><td>(sleeping)</td><td>arrived, done</td></tr>
    <tr><td>0.8</td><td>resumes with "R01"; <code>await t2</code>: already done, no wait</td><td>arrived, done</td><td></td></tr>
  </table>
  <p>Part A took 0.3 + 0.2 = 0.5 s. Part B took 0.3 s, the longer of the two, because both waits overlapped. Notice in the output that "both tasks created; main is still running" printed <em>before</em> either request was sent: <code>create_task</code> only scheduled them; they began when <code>main</code> reached <code>await t1</code> and handed control to the loop. Awaiting <code>t2</code> afterwards cost nothing, because it had already finished.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Writing two orders on tickets and pinning them on the kitchen rail (create_task), then waiting at the pass for the first one (await t1). Both dishes cook while you wait; when you then ask for the second, it is already there.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Task</strong> (<code>asyncio.Task</code>): a coroutine scheduled to run on the event loop, independently of whoever created it. <code>create_task(coro)</code> schedules it and returns the task; awaiting the task gives its result. A task is a kind of <strong>Future</strong> (a placeholder for a result that will exist later), the async cousin of <code>concurrent.futures.Future</code> from the thread pool.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Firing and forgetting: <code>asyncio.create_task(send_receipt())</code> without keeping the returned task. The loop holds only a weak reference to tasks, so an unreferenced task can be garbage-collected before it finishes, and its exceptions go unnoticed. Keep a reference (a set, a list) or use a TaskGroup.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: gather and TaskGroup.</b> Creating and awaiting 20 tasks by hand is tedious and error handling is unclear. Is there one call for "run all of these and give me the results"?</div>

  <h2 id="ai-gather"><span class="num">05</span>gather, as_completed and TaskGroup</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How do we run all 20 fetches at once, get 20 results in order, and decide what happens when one restaurant fails?</p>
  </div>
  <p><code>await asyncio.gather(c1, c2, …)</code> wraps every coroutine in a task, waits for all of them, and returns their results <strong>in the order given</strong>. The <code>*</code> unpacks a generator of 20 coroutines into 20 arguments. <code>flaky</code> is a fetch where R13's kitchen is closed.</p>
  <div class="fx" data-lang="py">import asyncio, time
from quickbite import RESTAURANTS, fetch_menu_async

async def flaky(rid):
    if rid == "R13":
        await asyncio.sleep(0.1)
        raise ConnectionError("R13 kitchen closed")
    return await fetch_menu_async(rid)

async def main():
    t = time.perf_counter()
    menus = await asyncio.gather(*(fetch_menu_async(r) for r in RESTAURANTS))
    print(f"gather: {sum(m['dishes'] for m in menus)} dishes in {time.perf_counter() - t:.2f}s, "
          f"order kept: {[m['id'] for m in menus[:3]]} ...")

    results = await asyncio.gather(*(flaky(r) for r in ("R12", "R13", "R14")), return_exceptions=True)
    print("return_exceptions=True:", [r if isinstance(r, Exception) else r["id"] for r in results])

    try:
        await asyncio.gather(*(flaky(r) for r in ("R12", "R13", "R14")))
    except ConnectionError as e:
        print("without it, the first error is raised:", e)

    for fut in asyncio.as_completed([flaky("R12"), flaky("R14")]):
        print("as_completed gave", (await fut)["id"])

asyncio.run(main())</div>
  <div class="fx" data-lang="text">gather: 100 dishes in 0.20s, order kept: ['R01', 'R02', 'R03'] ...
return_exceptions=True: ['R12', ConnectionError('R13 kitchen closed'), 'R14']
without it, the first error is raised: R13 kitchen closed
as_completed gave R14
as_completed gave R12</div>
  <p>Reading the output. (1) 100 dishes in 0.20 s, and the results come back as R01, R02, R03… whatever order they finished in. (2) With <code>return_exceptions=True</code>, R13's exception is placed in the result list like a value, and R12 and R14 are kept. (3) Without it, the first exception propagates out of <code>gather</code> and you lose the other results (the other tasks keep running in the background unless you cancel them). (4) <code>asyncio.as_completed</code> yields results in <strong>finish</strong> order; here R14 happened to finish before R12, since both take the same 0.2 s.</p>
  <h3>TaskGroup: structured concurrency (Python 3.11+)</h3>
  <p>A <code>TaskGroup</code> is an <code>async with</code> block: tasks created in it are all awaited when the block ends, and if any task fails, the group <strong>cancels the others</strong> and raises the errors together as an <code>ExceptionGroup</code>, caught with <code>except*</code>.</p>
  <div class="fx" data-lang="py">import asyncio

async def fetch(rid, secs, fail=False):
    try:
        await asyncio.sleep(secs)
        if fail:
            raise ConnectionError(f"{rid} kitchen closed")
        print(rid, "menu arrived")
        return rid
    except asyncio.CancelledError:
        print(rid, "cancelled")
        raise                                    # always re-raise CancelledError

async def main():
    try:
        async with asyncio.TaskGroup() as tg:    # Python 3.11+
            tg.create_task(fetch("R01", 0.1))
            tg.create_task(fetch("R13", 0.2, fail=True))
            tg.create_task(fetch("R20", 1.0))
    except* ConnectionError as eg:
        print("TaskGroup raised:", [str(e) for e in eg.exceptions])

asyncio.run(main())</div>
  <div class="fx" data-lang="text">R01 menu arrived
R20 cancelled
TaskGroup raised: ['R13 kitchen closed']</div>
  <p>R01 finished at 0.1 s. R13 failed at 0.2 s, so the group cancelled R20 (which still had 0.8 s to sleep): R20's <code>except asyncio.CancelledError</code> printed "cancelled" and re-raised. Then the group raised R13's error. Nothing was left running in the background.</p>
  <table class="tbl">
    <tr><th>Tool</th><th>Result order</th><th>On error</th><th>Use when</th></tr>
    <tr><td><code>gather(*coros)</code></td><td>input order</td><td>first error raised; others keep running</td><td>simple fan-out</td></tr>
    <tr><td><code>gather(…, return_exceptions=True)</code></td><td>input order</td><td>errors returned as values</td><td>batch jobs that tolerate failures</td></tr>
    <tr><td><code>as_completed(coros)</code></td><td>finish order</td><td>raised when you await that one</td><td>process fast results first</td></tr>
    <tr><td><code>TaskGroup</code></td><td>(keep the tasks)</td><td>cancel the rest, raise <code>ExceptionGroup</code></td><td>all-or-nothing work; the safe default in 3.11+</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p><code>gather</code> is a head waiter who brings all twenty plates out together, in table order. A TaskGroup is a kitchen rule: if one dish of a set menu is ruined, stop cooking the rest of that set and tell the customer at once.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>gather</strong>: run awaitables concurrently, return a list of results in argument order. <strong>as_completed</strong>: iterate over awaitables as they finish. <strong>TaskGroup</strong>: an async context manager that owns its tasks; on exit it awaits them all; on the first failure it cancels the rest and raises an <code>ExceptionGroup</code> (<strong>structured concurrency</strong>: no task outlives the block that started it).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Using plain <code>gather</code> for work that must not continue after a failure: the other tasks keep running, unobserved. Use a TaskGroup, or cancel them yourself.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Timeouts, Cancellation and Limits.</b> One restaurant may never answer, and 20,000 simultaneous requests would get us blocked. How do we stop waiting after a deadline, and cap how many requests are in flight?</div>

  <h2 id="ai-timeout"><span class="num">06</span>Timeouts, Cancellation and Limits</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How do we give up on a request that takes too long, stop a task we no longer need, and make sure cleanup still happens? And how do we stay under the API's limit of 5 requests at a time?</p>
  </div>
  <p>Cancellation in asyncio works by <strong>throwing <code>asyncio.CancelledError</code> into the coroutine at the <code>await</code> where it is paused</strong>. So <code>try/finally</code> cleanup inside the coroutine runs, just as for any other exception. Timeouts are built on cancellation: when time is up, the waiting coroutine is cancelled and the timeout turns that into <code>TimeoutError</code>. Every fetch below needs 0.2 s.</p>
  <div class="fx" data-lang="py">import asyncio, time
from quickbite import fetch_menu_async

async def careful_fetch(rid):
    try:
        return await fetch_menu_async(rid)
    finally:
        print(f"   cleanup for {rid} ran")        # runs on success, error or cancel

async def main():
    try:
        async with asyncio.timeout(0.1):         # Python 3.11+; the fetch needs 0.2 s
            await careful_fetch("R01")
    except TimeoutError:
        print("1. asyncio.timeout: gave up after 0.1 s")

    try:
        await asyncio.wait_for(careful_fetch("R02"), timeout=0.1)   # older, same idea
    except TimeoutError:
        print("2. wait_for: gave up after 0.1 s")

    task = asyncio.create_task(careful_fetch("R03"))
    await asyncio.sleep(0.05)
    task.cancel()                                # ask the task to stop
    try:
        await task
    except asyncio.CancelledError:
        print("3. task.cancel(): cancelled =", task.cancelled())

    print("4. enough time:", await asyncio.wait_for(careful_fetch("R04"), timeout=1))

asyncio.run(main())</div>
  <div class="fx" data-lang="text">   cleanup for R01 ran
1. asyncio.timeout: gave up after 0.1 s
   cleanup for R02 ran
2. wait_for: gave up after 0.1 s
   cleanup for R03 ran
3. task.cancel(): cancelled = True
   cleanup for R04 ran
4. enough time: {'id': 'R04', 'dishes': 7}</div>
  <p>(1) <code>async with asyncio.timeout(0.1)</code> (Python 3.11+) cancelled the fetch after 0.1 s; its <code>finally</code> printed "cleanup" first, then <code>TimeoutError</code> reached us. (2) <code>wait_for(coro, timeout=0.1)</code> is the older spelling of the same thing. (3) <code>task.cancel()</code> asked a running task to stop; awaiting it then raised <code>CancelledError</code>, and the cleanup still ran. (4) With enough time (1 s), the fetch returned R04's menu (3 + 4 = 7 dishes), and cleanup ran on success too.</p>
  <h3>Limiting how many are in flight</h3>
  <p><code>asyncio.Semaphore(5)</code> is the async twin of the threading semaphore: <code>async with slots:</code> waits (by awaiting, so other tasks run) while 5 requests are already inside.</p>
  <div class="fx" data-lang="py">import asyncio, time
from quickbite import RESTAURANTS, fetch_menu_async

inside = peak = 0
async def polite_fetch(slots, rid):
    global inside, peak
    async with slots:                            # wait here if 5 requests are in flight
        inside += 1; peak = max(peak, inside)    # no lock needed: one thread, no await in between
        menu = await fetch_menu_async(rid)
        inside -= 1
        return menu

async def main():
    slots = asyncio.Semaphore(5)                 # the menu API allows 5 at once
    t = time.perf_counter()
    menus = await asyncio.gather(*(polite_fetch(slots, r) for r in RESTAURANTS))
    print(f"{sum(m['dishes'] for m in menus)} dishes, peak in flight = {peak}, {time.perf_counter() - t:.2f}s")

asyncio.run(main())</div>
  <div class="fx" data-lang="text">100 dishes, peak in flight = 5, 0.80s</div>
  <p>By hand: 20 requests, 5 at a time → 4 rounds × 0.2 s = 0.8 s, and the peak never exceeded 5. Note that <code>inside += 1</code> needs no lock here: there is no <code>await</code> between reading and writing <code>inside</code>, and on one thread nothing else can run in between. That is cooperative multitasking paying off.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A timeout is telling the waiter "if the kitchen hasn't sent table 7's soup in 10 minutes, cancel it and offer something else", and the waiter still clears the table (cleanup). The semaphore is a rule that the kitchen accepts at most 5 tickets at a time.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong><code>asyncio.timeout(s)</code></strong> / <strong><code>wait_for(aw, s)</code></strong>: cancel the awaited work after s seconds and raise <code>TimeoutError</code>. <strong><code>task.cancel()</code></strong>: request cancellation; <code>CancelledError</code> is raised inside the task at its current <code>await</code>. <strong><code>asyncio.Semaphore(n)</code></strong>: at most n holders; acquire with <code>async with</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Catching <code>CancelledError</code> (or a bare <code>except Exception</code> in old code, or <code>except BaseException</code>) and not re-raising it. The task then refuses to die, timeouts stop working and TaskGroups hang. Clean up in <code>finally</code>; if you catch <code>CancelledError</code>, re-raise it.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: async with and async for.</b> We used <code>async with</code> for timeouts, semaphores and TaskGroups. What is it, and how do we write our own async resources and async streams?</div>

  <h2 id="ai-with"><span class="num">07</span>async with and async for</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A normal <code>with</code> block calls <code>__enter__</code>/<code>__exit__</code>, which cannot <code>await</code>. What if opening or closing a connection needs network round-trips? And what if the items of a <code>for</code> loop arrive over the network?</p>
  </div>
  <p>Each has an async twin. <code>async with x</code> calls <code>await x.__aenter__()</code> and <code>await x.__aexit__(…)</code> (the async form of <a class="xref" data-note="py_context">Context Managers</a>). <code>@asynccontextmanager</code> builds one from an async generator, as <code>@contextmanager</code> does from a generator (a decorator, see <a class="xref" data-note="py_decorators">Closures &amp; Decorators</a>). An <code>async def</code> containing <code>yield</code> is an <strong>async generator</strong>, consumed with <code>async for</code> (the async form of <a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>). Below: a pretend menu-API connection, and an async generator that fetches menus page by page (3 restaurants per page, each page fetched with <code>gather</code>).</p>
  <div class="fx" data-lang="py">import asyncio
from contextlib import asynccontextmanager
from quickbite import fetch_menu_async

class MenuAPI:
    async def __aenter__(self):                  # may await: e.g. open a connection
        await asyncio.sleep(0.01)
        print("connection opened")
        return self
    async def __aexit__(self, exc_type, exc, tb):  # may await: e.g. close it politely
        await asyncio.sleep(0.01)
        print("connection closed, error was:", exc_type.__name__ if exc_type else None)
    async def menu(self, rid):
        return await fetch_menu_async(rid)

@asynccontextmanager
async def menu_api():                            # the same thing, generator style
    print("connection opened (generator style)")
    try:
        yield MenuAPI()
    finally:
        print("connection closed (generator style)")

async def menu_pages(api, rids, page_size=3):    # an ASYNC generator: yield inside async def
    for i in range(0, len(rids), page_size):
        page = await asyncio.gather(*(api.menu(r) for r in rids[i:i + page_size]))
        yield page

async def main():
    async with MenuAPI() as api:
        print("R01:", await api.menu("R01"))
    async with menu_api() as api:
        async for page in menu_pages(api, ["R01", "R02", "R03", "R04", "R05"]):
            print("page:", [m["id"] for m in page])
        dishes = [m["dishes"] async for page in menu_pages(api, ["R01", "R02"]) for m in page]
        print("async comprehension:", dishes)

asyncio.run(main())</div>
  <div class="fx" data-lang="text">connection opened
R01: {'id': 'R01', 'dishes': 4}
connection closed, error was: None
connection opened (generator style)
page: ['R01', 'R02', 'R03']
page: ['R04', 'R05']
async comprehension: [4, 5]
connection closed (generator style)</div>
  <p>The class version opened the connection (an awaited step), fetched R01 (4 dishes) and closed it, reporting no error. The generator-style version did the same with <code>try/finally</code> around <code>yield</code>. <code>async for</code> pulled pages lazily: R01–R03 then R04–R05; each page was fetched only when the loop asked for it. The last line is an async comprehension: <code>[… async for …]</code> gives R01 and R02's dish counts, 4 and 5.</p>
  <table class="tbl">
    <tr><th>Sync</th><th>Async twin</th><th>Methods called</th></tr>
    <tr><td><code>with m as x:</code></td><td><code>async with m as x:</code></td><td><code>await m.__aenter__()</code>, <code>await m.__aexit__(t, e, tb)</code></td></tr>
    <tr><td><code>@contextmanager</code></td><td><code>@asynccontextmanager</code></td><td>async generator with one <code>yield</code></td></tr>
    <tr><td><code>for x in it:</code></td><td><code>async for x in ait:</code></td><td><code>ait.__aiter__()</code>, <code>await ait.__anext__()</code>, <code>StopAsyncIteration</code></td></tr>
    <tr><td>generator (<code>def</code> + <code>yield</code>)</td><td>async generator (<code>async def</code> + <code>yield</code>)</td><td>may <code>await</code> between yields</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p><code>async with</code> is a door that takes a moment to unlock; while it unlocks, the waiter serves someone else. <code>async for</code> is a conveyor belt from the kitchen: you take each dish as it arrives, and serve other tables between dishes.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Asynchronous context manager</strong>: an object with <code>__aenter__</code> and <code>__aexit__</code> coroutines. <strong>Asynchronous iterator</strong>: <code>__aiter__</code> and an <code>__anext__</code> coroutine raising <code>StopAsyncIteration</code>. <strong>Async generator</strong>: <code>async def</code> with <code>yield</code>; implements the async iterator protocol automatically. All may only be used inside <code>async def</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Writing <code>with</code> instead of <code>async with</code> on an async resource (<code>TypeError: … does not support the context manager protocol</code>), or <code>for</code> instead of <code>async for</code> (<code>TypeError: 'async_generator' object is not iterable</code>). The error names the missing protocol.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Never Block the Loop.</b> Every tool so far assumes that every function cooperates by awaiting. What happens if one does not?</div>

  <h2 id="ai-block"><span class="num">08</span>Never Block the Loop</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>What happens when a coroutine calls something that waits or computes <em>without</em> awaiting, like <code>time.sleep</code>, <code>requests.get</code> or <code>route_cost</code>?</p>
  </div>
  <p>The event loop and every task share one thread. A coroutine gives that thread back only at an <code>await</code>. A call that blocks, or simply computes for a long time, keeps the thread, so the loop cannot run anything else until it returns. First, five gathered fetches written correctly and incorrectly:</p>
  <div class="fx" data-lang="py">import asyncio, time

async def good(rid):
    await asyncio.sleep(0.2)                     # waits WITHOUT holding the thread
    return rid

async def bad(rid):
    time.sleep(0.2)                              # BUG: holds the only thread
    return rid

async def main():
    for fn in (good, bad):
        t = time.perf_counter()
        await asyncio.gather(*(fn(f"R{i:02d}") for i in range(1, 6)))
        print(f"{fn.__name__:&lt;4}: 5 gathered fetches took {time.perf_counter() - t:.2f}s")

asyncio.run(main())</div>
  <div class="fx" data-lang="text">good: 5 gathered fetches took 0.20s
bad : 5 gathered fetches took 1.00s</div>
  <p><code>good</code> awaited <code>asyncio.sleep</code>: 5 waits overlapped, 0.20 s. <code>bad</code> called <code>time.sleep</code>: although the five were "gathered", each held the thread for 0.2 s and the loop could not switch, so they ran one after another: 1.00 s, exactly 5 × 0.2. The code looks concurrent and is not.</p>
  <p>CPU work blocks the loop just the same. Here a heartbeat task prints a tick every 0.1 s (think "I'm alive" pings, or other users' requests), and in the middle we plan one rider's route directly inside a coroutine:</p>
  <div class="fx" data-lang="py">import asyncio, time
from quickbite import RIDERS, route_cost

T0 = time.perf_counter()
async def heartbeat():                           # the app's "I'm alive" signal, every 0.1 s
    while True:
        print(f"   tick {time.perf_counter() - T0:.1f}s")
        await asyncio.sleep(0.1)

async def plan_routes_inside_loop():
    print(f"routes start {time.perf_counter() - T0:.1f}s")
    costs = route_cost(RIDERS[0])                # CPU work, no await: the loop is stuck
    print(f"routes done  {time.perf_counter() - T0:.1f}s, cost {costs}")

async def main():
    hb = asyncio.create_task(heartbeat())
    await asyncio.sleep(0.25)
    await plan_routes_inside_loop()
    await asyncio.sleep(0.25)
    hb.cancel()

asyncio.run(main())</div>
  <div class="fx" data-lang="text">   tick 0.0s
   tick 0.1s
   tick 0.2s
routes start 0.3s
routes done  0.6s, cost 40
   tick 0.6s
   tick 0.7s
   tick 0.8s</div>
  <p>Ticks at 0.0, 0.1, 0.2; the route plan starts at about 0.3 and holds the thread until 0.6; the 0.3, 0.4 and 0.5 ticks never happen; ticking resumes at 0.6. In a web server, that is every other user's request frozen for 0.3 s.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>The single waiter stops at one table to fold 300 napkins. Nobody else gets served until the napkins are done, however many tables need attention.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Blocking call</strong>: a call that does not return until its work is done and does not yield to the event loop: <code>time.sleep</code>, synchronous network and DB libraries (<code>requests</code>, <code>psycopg2</code>), file reads, heavy computation. Inside <code>async def</code>, every blocking call stalls <strong>all</strong> tasks for its full duration. asyncio's debug mode (<code>asyncio.run(main(), debug=True)</code>) logs callbacks that take longer than 0.1 s.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Using <code>requests</code> inside a FastAPI <code>async def</code> endpoint: every request to the server waits behind it. Use an async client, or declare the endpoint with plain <code>def</code> (FastAPI then runs it in a thread pool) — see <a class="xref" data-note="api_fastapi">FastAPI</a>.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Blocking Code from async.</b> Sometimes the only library is blocking, and route planning has to happen somewhere. How do we run such code without freezing the loop?</div>

  <h2 id="ai-exec"><span class="num">09</span>Running Blocking Code: to_thread and run_in_executor</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>QuickBite's original <code>fetch_menu</code> uses <code>time.sleep</code> (a blocking library), and <code>route_cost</code> is pure calculation. How can the async app use both without blocking the loop?</p>
  </div>
  <p>Move the blocking work off the loop's thread and await its result. <code>asyncio.to_thread(f, *args)</code> runs <code>f</code> in the loop's default <strong>thread pool</strong> (a <code>ThreadPoolExecutor</code> from <a class="xref" data-note="py_threading">Threads &amp; the GIL</a>) and returns something awaitable. The blocking <code>fetch_menu</code>, 20 times:</p>
  <div class="fx" data-lang="py">import asyncio, time
from quickbite import RESTAURANTS, fetch_menu       # the BLOCKING fetch

async def main():
    t = time.perf_counter()
    menus = await asyncio.gather(*(asyncio.to_thread(fetch_menu, r) for r in RESTAURANTS))
    print(f"to_thread, default pool: {sum(m['dishes'] for m in menus)} dishes in {time.perf_counter() - t:.2f}s")

asyncio.run(main())
import os
print("default thread-pool size here = min(32, cpus + 4) =", min(32, (os.cpu_count() or 1) + 4))</div>
  <div class="fx" data-lang="text">to_thread, default pool: 100 dishes in 0.60s
default thread-pool size here = min(32, cpus + 4) = 8</div>
  <p>100 dishes in 0.60 s, not 0.20 s. Why? The default pool has <code>min(32, cpus + 4)</code> = 8 threads on this 4-core machine, so 20 blocking fetches ran 8 at a time: ⌈20 / 8⌉ = 3 rounds × 0.2 s = 0.6 s. The loop itself stayed free the whole time. (For more parallel blocking calls you can pass your own bigger <code>ThreadPoolExecutor</code> to <code>loop.run_in_executor</code>.)</p>
  <p>For CPU-bound work a thread does not help (the GIL), so use a <strong>process pool</strong> from <a class="xref" data-note="py_multiprocessing">Processes</a>: <code>loop.run_in_executor(pool, route_cost, stops)</code>. This is the finished QuickBite 6 pm run: routes in 4 processes, menus with asyncio, and the heartbeat to prove the loop never froze.</p>
  <div class="fx" data-lang="py">import asyncio, time
from concurrent.futures import ProcessPoolExecutor
from quickbite import RESTAURANTS, RIDERS, fetch_menu_async, route_cost

T0 = time.perf_counter()
async def heartbeat():
    while True:
        print(f"   tick {time.perf_counter() - T0:.1f}s")
        await asyncio.sleep(0.1)

async def main(pool):
    loop = asyncio.get_running_loop()
    hb = asyncio.create_task(heartbeat())
    route_futs = [loop.run_in_executor(pool, route_cost, s) for s in RIDERS]   # CPU -&gt; processes
    menus = await asyncio.gather(*(fetch_menu_async(r) for r in RESTAURANTS)) # I/O -&gt; the loop
    print(f"menus done at {time.perf_counter() - T0:.1f}s: {sum(m['dishes'] for m in menus)} dishes")
    costs = await asyncio.gather(*route_futs)
    print(f"routes done at {time.perf_counter() - T0:.1f}s: {costs}")
    hb.cancel()

if __name__ == "__main__":
    with ProcessPoolExecutor(max_workers=4) as pool:
        asyncio.run(main(pool))</div>
  <div class="fx" data-lang="text">   tick 0.0s
   tick 0.1s
menus done at 0.2s: 100 dishes
   tick 0.2s
   tick 0.3s
   tick 0.4s
   tick 0.5s
routes done at 0.6s: [40, 36, 35, 36]</div>
  <p>The heartbeat ticked every 0.1 s throughout. The menus finished at 0.2 s (one overlapped wait), while the four processes were still planning; the routes finished at about 0.6 s. Both jobs, about 5.5 s sequentially, completed in the time of the slower one. The pool code sits under <code>if __name__ == "__main__":</code> because it starts processes.</p>
  <div class="flow"><span>event loop (1 thread)</span><span>menus: await, 0.2 s</span><span>heartbeat keeps ticking</span><span>run_in_executor → 4 processes</span><span>routes: 0.6 s</span></div>
  <div class="callout anlg"><span class="label">Analogy</span><p>The waiter does not fold napkins any more: they hand napkin-folding to helpers in the back room (a thread pool) and heavy prep to other kitchens (a process pool), and come back to collect the result when it is ready.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong><code>asyncio.to_thread(func, *args, **kwargs)</code></strong> (3.9+): run a blocking function in the default thread pool; returns a coroutine. <strong><code>loop.run_in_executor(executor, func, *args)</code></strong>: run <code>func</code> in the given <code>concurrent.futures</code> executor (<code>None</code> = default thread pool); returns an awaitable future. Rule: blocking I/O → thread pool; CPU-bound → process pool.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Sending CPU work to <code>to_thread</code> and expecting it to finish faster: the loop stays responsive, but the computation still holds the GIL and runs no faster than before. Only a process pool computes in parallel.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Async HTTP.</b> We have simulated every request with a sleep. What does the same thing look like against a real HTTP server with a real async client?</div>

  <h2 id="ai-http"><span class="num">10</span>Async HTTP: httpx and aiohttp</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>QuickBite's real menus come from HTTP endpoints. How do we fetch them asynchronously, politely and safely, and how do we handle a bad restaurant ID?</p>
  </div>
  <p>Doing it right needs three things beyond <code>gather</code>. <strong>One shared client</strong>, so connections are reused instead of opening a new one per request (a <strong>connection pool</strong>). <strong>A semaphore</strong> to limit requests in flight. And <strong>error handling</strong>, so one bad ID does not lose the batch. To run without the internet, the script starts a tiny local menu server (aiohttp's web server) on the same event loop; every request takes 0.2 s, and <code>/menu/R99</code> returns HTTP 404. Then it fetches the 20 menus twice, once with httpx and once with aiohttp, both installed on this machine.</p>
  <div class="fx" data-lang="py">import asyncio, time
import aiohttp, httpx
from aiohttp import web
from quickbite import RESTAURANTS, LATENCY

# --- a tiny local menu server, so we need no internet: every request takes 0.2 s ---
async def menu_handler(request):
    rid = request.match_info["rid"]
    await asyncio.sleep(LATENCY)
    if rid == "R99":
        return web.json_response({"error": "no such restaurant"}, status=404)
    return web.json_response({"id": rid, "dishes": 3 + int(rid[1:]) % 5})

async def start_server():
    app = web.Application()
    app.add_routes([web.get("/menu/{rid}", menu_handler)])
    runner = web.AppRunner(app)
    await runner.setup()
    await web.TCPSite(runner, "127.0.0.1", 8765).start()
    return runner

URL = "http://127.0.0.1:8765/menu/{}"

# --- client 1: httpx.AsyncClient ---
async def fetch_httpx(client, slots, rid):
    async with slots:
        r = await client.get(URL.format(rid), timeout=5)
        r.raise_for_status()                     # 4xx/5xx become exceptions
        return r.json()

# --- client 2: aiohttp.ClientSession ---
async def fetch_aiohttp(session, slots, rid):
    async with slots:
        async with session.get(URL.format(rid)) as r:
            r.raise_for_status()
            return await r.json()

async def main():
    runner = await start_server()
    slots = asyncio.Semaphore(10)                # at most 10 requests in flight
    async with httpx.AsyncClient() as client:    # ONE client, reused: connection pool
        t = time.perf_counter()
        menus = await asyncio.gather(*(fetch_httpx(client, slots, r) for r in RESTAURANTS))
        print(f"httpx  : {sum(m['dishes'] for m in menus)} dishes in {time.perf_counter() - t:.2f}s")
        bad = await asyncio.gather(fetch_httpx(client, slots, "R01"), fetch_httpx(client, slots, "R99"),
                                   return_exceptions=True)
        print("httpx with a bad id:", [type(x).__name__ if isinstance(x, Exception) else x["id"] for x in bad])
    async with aiohttp.ClientSession() as session:
        t = time.perf_counter()
        menus = await asyncio.gather(*(fetch_aiohttp(session, slots, r) for r in RESTAURANTS))
        print(f"aiohttp: {sum(m['dishes'] for m in menus)} dishes in {time.perf_counter() - t:.2f}s")
    await runner.cleanup()

asyncio.run(main())</div>
  <div class="fx" data-lang="text">httpx  : 100 dishes in 0.53s
httpx with a bad id: ['R01', 'HTTPStatusError']
aiohttp: 100 dishes in 0.41s</div>
  <p>Reading it. With 10 requests in flight, 20 requests need ⌈20 / 10⌉ = 2 rounds × 0.2 s = 0.4 s; aiohttp measured 0.41 s and httpx 0.53 s (the first round also opens the connections). Same 100 dishes. The bad ID: the server answered 404, <code>raise_for_status()</code> turned that into <code>httpx.HTTPStatusError</code>, and <code>return_exceptions=True</code> kept R01's good result next to it. Both clients are used inside <code>async with</code>, which closes their connection pools at the end. The two client libraries differ only in spelling: httpx returns the response from <code>await client.get()</code>; aiohttp's <code>session.get()</code> is itself an <code>async with</code> and the body is read with <code>await r.json()</code>.</p>
  <div class="flow"><span>20 coroutines</span><span>Semaphore(10)</span><span>one client, pooled connections</span><span>server: 0.2 s each</span><span>gather → 100 dishes</span></div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A bank with 10 counters and 20 customers: the semaphore is the ticket machine (at most 10 served at once), and the shared client is keeping the counters open all day instead of building a new counter for each customer.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong><code>httpx.AsyncClient</code></strong> / <strong><code>aiohttp.ClientSession</code></strong>: async HTTP clients holding a connection pool; create one per application (or per batch) and reuse it. <strong><code>raise_for_status()</code></strong>: raise on 4xx/5xx. Combine with <code>timeout=…</code> per request or <code>asyncio.timeout</code>, a semaphore for concurrency, and retries with back-off for transient errors.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Creating a new client per request (a new TCP and TLS handshake every time) or gathering 10,000 requests with no semaphore (the API rate-limits or bans you, and you may run out of sockets). One client, a limit, timeouts.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Traps, Demonstrated.</b> We have seen blocking and sequential awaits. Which other asyncio mistakes appear constantly, and what do they look like?</div>

  <h2 id="ai-pitfalls"><span class="num">11</span>Traps, Demonstrated</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>What do the most common asyncio mistakes look like when you actually run them?</p>
  </div>
  <h3>1. Forgetting await</h3>
  <div class="fx" data-lang="py">import asyncio
from quickbite import fetch_menu_async

async def main():
    menu = fetch_menu_async("R01")               # forgot await
    print("got:", menu)

asyncio.run(main())</div>
  <div class="fx" data-lang="text">got: &lt;coroutine object fetch_menu_async at 0x7f08967102e0&gt;
/usr/lib/python3.13/asyncio/events.py:89: RuntimeWarning: coroutine 'fetch_menu_async' was never awaited
  self._context.run(self._callback, *self._args)
RuntimeWarning: Enable tracemalloc to get the object allocation traceback</div>
  <p>No error, no menu: <code>menu</code> is a coroutine object that never ran, and Python only warns ("coroutine … was never awaited") when the object is thrown away. If you see that warning, an <code>await</code> is missing.</p>
  <h3>2. asyncio.run inside a running loop</h3>
  <div class="fx" data-lang="py">import asyncio
from quickbite import fetch_menu_async

async def main():
    try:
        asyncio.run(fetch_menu_async("R01"))     # a loop is already running here
    except RuntimeError as e:
        print("RuntimeError:", e)
    print("inside a running loop, just await:", await fetch_menu_async("R01"))

asyncio.run(main())</div>
  <div class="fx" data-lang="text">RuntimeError: asyncio.run() cannot be called from a running event loop
blk_trap_nested.py:8: RuntimeWarning: coroutine 'fetch_menu_async' was never awaited
  print("RuntimeError:", e)
RuntimeWarning: Enable tracemalloc to get the object allocation traceback
inside a running loop, just await: {'id': 'R01', 'dishes': 4}</div>
  <p><code>asyncio.run</code> starts a new loop, and there may be only one running loop per thread. Inside async code, just <code>await</code>. (This is also why <code>asyncio.run</code> fails in Jupyter, which already runs a loop: use top-level <code>await</code> there.)</p>
  <h3>3. The others, already measured</h3>
  <table class="tbl">
    <tr><th>Trap</th><th>Symptom</th><th>Fix</th><th>Where</th></tr>
    <tr><td><code>for … : await fetch()</code></td><td>20 menus still 4.01 s</td><td><code>gather</code> / TaskGroup</td><td>§03</td></tr>
    <tr><td><code>time.sleep</code>, <code>requests</code>, heavy CPU in <code>async def</code></td><td>5 fetches 1.00 s; heartbeat gap</td><td>async libraries, <code>to_thread</code>, process pool</td><td>§08–09</td></tr>
    <tr><td>Unreferenced <code>create_task</code></td><td>task vanishes, errors unseen</td><td>keep references; TaskGroup</td><td>§04</td></tr>
    <tr><td>Swallowing <code>CancelledError</code></td><td>timeouts and cancellation stop working</td><td>re-raise; clean up in <code>finally</code></td><td>§06</td></tr>
    <tr><td>Plain <code>gather</code> on failure</td><td>other tasks keep running unseen</td><td>TaskGroup, or <code>return_exceptions=True</code></td><td>§05</td></tr>
    <tr><td>No semaphore / new client per request</td><td>rate limits, socket exhaustion</td><td>one client, <code>Semaphore(n)</code></td><td>§06, §10</td></tr>
    <tr><td>Sharing asyncio objects across threads</td><td>random errors; asyncio is not thread-safe</td><td><code>asyncio.run_coroutine_threadsafe</code>, <code>loop.call_soon_threadsafe</code></td><td>—</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>Most asyncio bugs are the waiter forgetting to hand an order to the kitchen (no await), trying to open a second restaurant inside the first (nested run), or standing still at one table (blocking).</p></div>
  <div class="callout def"><span class="label">Definition</span><p>Testing async code: run it with <code>asyncio.run</code> inside a normal test, or use the pytest-asyncio plugin (<code>@pytest.mark.asyncio</code> on an <code>async def</code> test); see <a class="xref" data-note="py_testing">Testing &amp; Debugging</a>. Enable <code>debug=True</code> to catch slow callbacks and never-awaited coroutines.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"Async all the way down": one synchronous layer in the middle (a blocking DB driver, a sync SDK) silently turns the whole service sequential. Audit every call on the request path.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> asyncio, threads and processes in one picture, on QuickBite.</div>

  <h2 id="ai-connect"><span class="num">12</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How do coroutines, tasks, the loop and the executors fit together, and how does asyncio relate to the two earlier notes?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 280" width="680">
    <defs><marker id="ai-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="20" y="8" width="180" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="110" y="26" text-anchor="middle" font-size="12">generator</text><text x="110" y="41" text-anchor="middle" class="tm" font-size="10">pause at yield, send()</text>
    <line x1="200" y1="28" x2="246" y2="28" stroke="currentColor" marker-end="url(#ai-a9)"/>
    <rect x="250" y="8" width="180" height="40" rx="6" class="fb sb"/><text x="340" y="26" text-anchor="middle" font-size="12">coroutine</text><text x="340" y="41" text-anchor="middle" class="tm" font-size="10">async def, pause at await</text>
    <line x1="340" y1="48" x2="340" y2="80" stroke="currentColor" marker-end="url(#ai-a9)"/>
    <rect x="250" y="82" width="180" height="40" rx="6" class="fb sb"/><text x="340" y="100" text-anchor="middle" font-size="12">task</text><text x="340" y="115" text-anchor="middle" class="tm" font-size="10">create_task / gather / TaskGroup</text>
    <line x1="340" y1="122" x2="340" y2="154" stroke="currentColor" marker-end="url(#ai-a9)"/>
    <rect x="220" y="156" width="240" height="40" rx="6" class="fg sg"/><text x="340" y="174" text-anchor="middle" font-size="12">event loop (1 thread)</text><text x="340" y="189" text-anchor="middle" class="tm" font-size="10">menus 0.20 s; timeouts, semaphores</text>
    <line x1="230" y1="196" x2="130" y2="230" stroke="currentColor" marker-end="url(#ai-a9)"/>
    <line x1="450" y1="196" x2="550" y2="230" stroke="currentColor" marker-end="url(#ai-a9)"/>
    <rect x="20" y="232" width="220" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="130" y="250" text-anchor="middle" font-size="12">to_thread → thread pool</text><text x="130" y="265" text-anchor="middle" class="tm" font-size="10">blocking I/O: 20 fetches 0.60 s</text>
    <rect x="440" y="232" width="230" height="40" rx="6" class="fv"/><text x="555" y="250" text-anchor="middle" font-size="12">run_in_executor → processes</text><text x="555" y="265" text-anchor="middle" class="tm" font-size="10">CPU: routes done at 0.6 s</text>
    <rect x="490" y="150" width="180" height="40" rx="6" class="fr sr"/><text x="580" y="168" text-anchor="middle" font-size="12">blocking call</text><text x="580" y="183" text-anchor="middle" class="tm" font-size="10">freezes all: 0.20 → 1.00 s</text>
    <line x1="490" y1="172" x2="462" y2="174" stroke="currentColor" class="sr" stroke-dasharray="4 3"/>
  </svg><figcaption>A coroutine is a generator-style function that pauses at <code>await</code>. Wrapped as a task, it is run by the event loop on one thread, which handles all the waiting. A blocking call (red) freezes that thread, so blocking I/O goes to a thread pool and CPU work to a process pool: the two earlier notes, reused.</figcaption></figure>
  <table class="tbl"><caption>Every concept on QuickBite</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>On the running example</th><th>When to use</th></tr>
    <tr><td>Event loop</td><td>one thread + ready/waiting queues + OS I/O events</td><td>many waits, one thread?</td><td>runs all 20 fetches</td><td>every asyncio program</td></tr>
    <tr><td>Coroutine</td><td>generator-style pausing (<code>send</code>, <code>StopIteration</code>)</td><td>what can pause mid-function?</td><td><code>send</code> → None, then StopIteration with R01's menu</td><td>any async function</td></tr>
    <tr><td><code>await</code> / <code>asyncio.run</code></td><td>suspend until done / start the loop</td><td>how do coroutines run?</td><td>awaited one by one: 4.01 s</td><td>always; but not alone</td></tr>
    <tr><td>Task</td><td>coroutine scheduled on the loop</td><td>start without waiting?</td><td>R01 + R02: 0.5 s → 0.3 s</td><td>background work</td></tr>
    <tr><td><code>gather</code> / TaskGroup</td><td>many tasks + collection</td><td>run many, collect results?</td><td>100 dishes, 0.20 s; R20 cancelled when R13 failed</td><td>fan-out</td></tr>
    <tr><td>Timeout / cancel</td><td><code>CancelledError</code> thrown at await</td><td>stop waiting?</td><td>gave up after 0.1 s; cleanup ran</td><td>every network call</td></tr>
    <tr><td>Semaphore</td><td>counter, awaited</td><td>at most n in flight?</td><td>peak 5, 0.80 s</td><td>API limits</td></tr>
    <tr><td><code>async with</code> / <code>async for</code></td><td><code>__aenter__</code>/<code>__aexit__</code>; async generators</td><td>awaiting in setup or iteration?</td><td>connection opened/closed; pages R01–R03, R04–R05</td><td>clients, sessions, streams</td></tr>
    <tr><td>Blocking call</td><td>no await</td><td>why did it freeze?</td><td>0.20 → 1.00 s; heartbeat gap 0.3 s</td><td>(never in async code)</td></tr>
    <tr><td><code>to_thread</code></td><td>default thread pool</td><td>blocking library from async?</td><td>20 fetches in 0.60 s (8 threads)</td><td>sync I/O libraries</td></tr>
    <tr><td><code>run_in_executor</code> + process pool</td><td>executor from Processes</td><td>CPU work from async?</td><td>menus 0.2 s, routes 0.6 s, ticks continued</td><td>CPU-heavy steps</td></tr>
    <tr><td>Async HTTP</td><td>one client + semaphore + raise_for_status</td><td>real requests?</td><td>20 menus 0.41–0.53 s; R99 → HTTPStatusError</td><td>APIs, crawlers, LLM calls</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p><strong>asyncio is generators applied to waiting: a coroutine pauses at <code>await</code>, the event loop resumes whichever coroutine's I/O is ready, so one thread can keep thousands of waits in flight with no locks; the price is that nothing may block that thread, so blocking I/O goes to threads and calculation to processes, which is how the three tools of this group end up working together.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet.</b> Everything in this note on one page. After it, asyncio reappears in <a class="xref" data-note="api_fastapi">FastAPI</a> (async endpoints) and <a class="xref" data-note="de_kafka">Kafka &amp; Streaming</a> (async consumers).</div>

  <h2 id="ai-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The note on one page. Running example: <code>fetch_menu_async</code> awaits 0.2 s (20 restaurants, 100 dishes); blocking <code>fetch_menu</code> sleeps 0.2 s; <code>route_cost</code> is pure CPU (40, 36, 35, 36).</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>Answer in one line</th></tr>
    <tr><td>Event loop</td><td>many waits on one thread?</td><td>run ready tasks until they await; resume them when their I/O is ready</td></tr>
    <tr><td>Coroutine</td><td>what does <code>async def</code> return?</td><td>a paused coroutine object; <code>send</code> runs it; <code>StopIteration.value</code> = result</td></tr>
    <tr><td>await / run</td><td>how to run it?</td><td><code>asyncio.run(main())</code> once; <code>await</code> = wait for this one (loop of awaits = 4.01 s)</td></tr>
    <tr><td>Task</td><td>start without waiting?</td><td><code>create_task</code>; starts at the next await; keep a reference</td></tr>
    <tr><td>gather / TaskGroup</td><td>run many?</td><td><code>gather</code> input order (0.20 s); TaskGroup cancels the rest on failure</td></tr>
    <tr><td>Timeout / cancel / Semaphore</td><td>stop waiting; limit?</td><td><code>asyncio.timeout</code>, <code>cancel()</code> → <code>CancelledError</code>; <code>Semaphore(5)</code> → 0.80 s</td></tr>
    <tr><td>async with / for</td><td>awaiting setup or iteration?</td><td><code>__aenter__</code>/<code>__aexit__</code>; async generators with <code>async for</code></td></tr>
    <tr><td>Never block</td><td>what does <code>time.sleep</code> do?</td><td>freezes all tasks: 0.20 → 1.00 s</td></tr>
    <tr><td>Executors</td><td>blocking or CPU code?</td><td><code>to_thread</code> for I/O; <code>run_in_executor(process_pool, …)</code> for CPU</td></tr>
    <tr><td>Async HTTP</td><td>real requests?</td><td>one shared client, semaphore, timeouts, <code>raise_for_status</code></td></tr>
  </table>
  <h3>Definitions and formulas</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td>Cooperative multitasking</td><td>tasks switch only where they <code>await</code>; vs preemptive (threads: OS switches anywhere)</td></tr>
    <tr><td>Time for n waits of w seconds, limit k</td><td>≈ ⌈n / k⌉ × w: 20 × 0.2 s, k = 5 → 0.8 s; k = 10 → 0.4 s; no limit → 0.2 s</td></tr>
    <tr><td>Default thread pool size</td><td><code>min(32, cpu_count + 4)</code> = 8 here → 20 blocking fetches in 3 rounds ≈ 0.6 s</td></tr>
    <tr><td>Future / Task</td><td>placeholder for a result; a Task is a Future that drives a coroutine</td></tr>
    <tr><td>Structured concurrency</td><td>no task outlives the block (TaskGroup) that started it</td></tr>
  </table>
  <div class="cards">
    <div><b>Use asyncio</b><p>Many concurrent waits (hundreds to tens of thousands) with async libraries: HTTP APIs, websockets, async DB drivers, FastAPI.</p><small>20 menus, 0.20 s, one thread</small></div>
    <div><b>Do not use asyncio</b><p>CPU-bound work on its own (no parallelism), or code built on blocking libraries you cannot replace (threads are simpler).</p><small>routes: use processes</small></div>
    <div><b>Must-haves</b><p>One shared client, a semaphore, timeouts, TaskGroup or <code>return_exceptions</code>, no blocking calls.</p><small>production checklist</small></div>
    <div><b>Escape hatches</b><p><code>to_thread</code> for blocking I/O; <code>run_in_executor</code> with a process pool for CPU.</p><small>heartbeat keeps ticking</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Missing <code>await</code> (warning, no result); awaiting in a loop (sequential); blocking calls in <code>async def</code>; unreferenced tasks; swallowing <code>CancelledError</code>; <code>asyncio.run</code> inside a running loop; no limit on concurrency; a new client per request.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>What does calling an <code>async def</code> function do?</td><td>returns a coroutine object; runs nothing</td></tr>
    <tr><td><code>await f(); await g()</code> each 0.2 s vs <code>gather(f(), g())</code>?</td><td>≈ 0.4 s vs ≈ 0.2 s</td></tr>
    <tr><td>When does a task made with <code>create_task</code> start?</td><td>at the creator's next <code>await</code> (next time the loop gets control)</td></tr>
    <tr><td>5 gathered coroutines each calling <code>time.sleep(0.2)</code>?</td><td>≈ 1.0 s: they block the loop and run one by one</td></tr>
    <tr><td>Which executor for <code>route_cost</code> from async code, and why?</td><td>a process pool: CPU-bound, and threads would hold the GIL</td></tr>
  </table>

  <h2 id="ai-qa"><span class="num">13</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a coroutine and how does <code>await</code> work?</summary><div class="qa-body">The object returned by calling an <code>async def</code> function; it does nothing until awaited or scheduled. At an <code>await</code> on something not ready, it suspends and control returns to the event loop, which runs other ready tasks and resumes this one (via <code>send</code>) when the awaited thing completes. Switching is cooperative: code that never awaits blocks everything.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the event loop?</summary><div class="qa-body">A scheduler on one thread: it keeps ready tasks, runs each until it awaits, registers what it waits for with the OS (epoll/kqueue/IOCP, timers) and moves it back to ready when that happens. <code>asyncio.run</code> creates one, runs your main coroutine, and closes it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Total time: <code>await f(); await g()</code> vs <code>await asyncio.gather(f(), g())</code>, each awaiting 0.2 s?</summary><div class="qa-body">About 0.4 s vs 0.2 s. Awaiting one after another is sequential; <code>gather</code> runs both as tasks so the waits overlap. Measured on the running example: 20 awaited in a loop 4.01 s, gathered 0.20 s.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>create_task</code> vs <code>await</code>?</summary><div class="qa-body"><code>await coro</code> runs the coroutine and pauses the caller until it finishes. <code>create_task(coro)</code> schedules it to run on the loop and returns immediately; it starts at the caller's next await, and you collect the result later by awaiting the task. Keep a reference to it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your async service got slow and you find <code>requests.get</code> inside an <code>async def</code>. Why is that a problem?</summary><div class="qa-body"><code>requests</code> blocks the thread, and the event loop runs on that thread, so every other task freezes for the duration (5 "concurrent" sleeps took 1.00 s instead of 0.20 s). Switch to <code>httpx.AsyncClient</code>/<code>aiohttp</code>, or wrap it: <code>await asyncio.to_thread(requests.get, url)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>asyncio vs threads for I/O-bound work?</summary><div class="qa-body">Both overlap waits. Threads work with any library and are simplest for tens to hundreds of tasks, but each costs an OS thread and shared data needs locks. asyncio uses one thread, scales to many thousands of waits cheaply and needs no locks between awaits, but requires async libraries throughout and a single blocking call freezes everything.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you stop 10,000 async requests overwhelming an API?</summary><div class="qa-body">An <code>asyncio.Semaphore(n)</code> around each request (at most n in flight), one shared client for connection pooling, timeouts on every request, and <code>return_exceptions=True</code> or a TaskGroup with retries so failures are handled.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is a coroutine related to a generator?</summary><div class="qa-body">Both are functions that pause and resume with their local variables intact. A coroutine is driven with <code>send(None)</code> and finishes with <code>StopIteration(value)</code>, like a generator; <code>await</code> plays the role of <code>yield from</code>, passing pauses up to the event loop. Historically, asyncio coroutines were generators decorated with <code>@asyncio.coroutine</code> using <code>yield from</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does asyncio still need threads and processes?</summary><div class="qa-body">The loop has one thread and must never block. Blocking libraries go to a thread pool (<code>to_thread</code>), where waiting releases the GIL; CPU work goes to a process pool (<code>run_in_executor</code>), because only separate processes compute in parallel. In QuickBite, menus stayed on the loop and routes went to 4 processes: both done by 0.6 s.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does <code>inside += 1</code> need no lock in async code when it did with threads?</summary><div class="qa-body">Threads can be switched by the OS between the read and the write. A coroutine can only be switched at an <code>await</code>, and there is none between reading and writing <code>inside</code>, so no other task can interleave. Put an <code>await</code> in between and the race returns (then use <code>asyncio.Lock</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you remove the semaphore from the HTTP example and fetch 10,000 menus?</summary><div class="qa-body">All 10,000 requests start at once: the server or API rate-limits or rejects you, the client may run out of sockets or connection-pool slots, and timeouts fire en masse. The semaphore keeps load bounded at a known level.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does cancellation work, and why must <code>CancelledError</code> be re-raised?</summary><div class="qa-body"><code>task.cancel()</code> (or a timeout) throws <code>CancelledError</code> into the task at its current await, so <code>finally</code> blocks run. If the task catches it and does not re-raise, it keeps running: timeouts no longer bound it and TaskGroups cannot shut down. Clean up, then re-raise.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Where does asyncio appear in data and ML work?</summary><div class="qa-body">FastAPI and other async web servers (<a class="xref" data-note="api_fastapi">FastAPI</a>), calling LLM or REST APIs for thousands of prompts or IDs, async database drivers (asyncpg), streaming consumers (aiokafka with <code>async for</code>, <a class="xref" data-note="de_kafka">Kafka</a>), websockets for live dashboards.</div></details>
</main>
`
});
