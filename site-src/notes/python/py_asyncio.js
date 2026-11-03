// notes/python/py_asyncio.js — asyncio
Object.assign(TOPIC_CONTENT, {
  "py_asyncio": `<main>
<h1>asyncio</h1>
  <div class="where"><span>Python</span><span>Advanced Python</span><span>Concurrency</span><span>asyncio</span></div>
  <p class="lead"><code>asyncio</code> runs many I/O-bound tasks concurrently on a <em>single</em> thread. Each coroutine marks the points where it waits with <code>await</code>, and an <strong>event loop</strong> runs another task at each of those points. Threads can overlap waits too, but every thread costs an OS stack, switches happen at arbitrary moments, and shared data needs locks. Those costs make thousands of concurrent connections impractical with threads and cheap with asyncio. The catch is that everything on the loop must cooperate: one blocking call (<code>time.sleep</code>, <code>requests.get</code>, a heavy computation) freezes every task. asyncio is what FastAPI endpoints, async DB drivers (asyncpg), websocket servers, Kafka consumers (aiokafka) and high-volume LLM/API clients run on. Code was run on CPython 3.13; timings vary between runs and are approximate.</p>

  <h2 id="ai-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">asyncio</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Model</div>
        <ul>
          <li><b>One thread</b>, one <b>event loop</b>, many tasks</li>
          <li>Cooperative: switch only at <code>await</code></li>
          <li>vs threads: preemptive, switch anywhere</li>
          <li>No locks needed between awaits</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Coroutines</div>
        <ul>
          <li><code>async def f()</code>; <code>f()</code> returns a coroutine, runs nothing</li>
          <li><code>coro.send(None)</code> → next pause; <code>StopIteration.value</code> = result</li>
          <li>Generator machinery underneath (<a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>)</li>
          <li><code>asyncio.run(main())</code>: once per program</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Running many</div>
        <ul>
          <li><code>await</code> in a loop → sequential</li>
          <li><code>create_task</code>: starts at next await; keep a reference</li>
          <li><code>gather</code>: input order; <code>return_exceptions=True</code></li>
          <li><code>as_completed</code>: finish order</li>
          <li><code>TaskGroup</code> (3.11+): one fails → rest cancelled</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Control</div>
        <ul>
          <li><code>asyncio.timeout(s)</code>, <code>wait_for</code></li>
          <li><code>task.cancel()</code> → <code>CancelledError</code>; re-raise it</li>
          <li><code>asyncio.Semaphore(n)</code>: max n in flight</li>
          <li><code>async with</code> / <code>async for</code> / async generators</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Never block</div>
        <ul>
          <li><code>time.sleep</code>, <code>requests</code>, heavy CPU freeze every task</li>
          <li><code>asyncio.to_thread(f, …)</code> for blocking I/O</li>
          <li><code>loop.run_in_executor(process_pool, f, …)</code> for CPU</li>
          <li><code>debug=True</code> logs slow callbacks</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">HTTP</div>
        <ul>
          <li>One <code>httpx.AsyncClient</code> / <code>aiohttp.ClientSession</code></li>
          <li>Semaphore + timeouts + <code>raise_for_status()</code></li>
          <li>Time ≈ ⌈n / limit⌉ × latency</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ai-loop"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Event Loop</span><span class="rm-sub">Cooperative scheduling on one thread</span></div></div>
      <div class="rm-item rm-done" data-target="ai-coro"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Coroutines: async def and await</span><span class="rm-sub">send(), StopIteration, pause points</span></div></div>
      <div class="rm-item rm-done" data-target="ai-await"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">asyncio.run and Sequential await</span><span class="rm-sub">Why a loop of awaits is slow</span></div></div>
      <div class="rm-item rm-done" data-target="ai-task"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Tasks: asyncio.create_task</span><span class="rm-sub">Scheduling, timeline, references</span></div></div>
      <div class="rm-item rm-done" data-target="ai-gather"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">gather, as_completed and TaskGroup</span><span class="rm-sub">Fan-out and error handling</span></div></div>
      <div class="rm-item rm-done" data-target="ai-timeout"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Timeouts, Cancellation and Semaphores</span><span class="rm-sub">timeout, cancel, concurrency limits</span></div></div>
      <div class="rm-item rm-done" data-target="ai-with"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">async with, async for and Async Generators</span><span class="rm-sub">__aenter__, __anext__, yield</span></div></div>
      <div class="rm-item rm-done" data-target="ai-block"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Blocking the Event Loop</span><span class="rm-sub">time.sleep and CPU work, measured</span></div></div>
      <div class="rm-item rm-done" data-target="ai-exec"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">to_thread and run_in_executor</span><span class="rm-sub">Blocking I/O and CPU from async</span></div></div>
      <div class="rm-item rm-done" data-target="ai-http"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Async HTTP with httpx and aiohttp</span><span class="rm-sub">Shared client, limits, errors</span></div></div>
      <div class="rm-item rm-done" data-target="ai-pitfalls"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Pitfalls</span><span class="rm-sub">Missing await, nested run, races</span></div></div>
      <div class="rm-item rm-done" data-target="ai-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">API, rules, comparison tables</span></div></div>
      <div class="rm-item rm-done" data-target="ai-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">Coroutines, loop, tasks, design</span></div></div>
    </div>
  </div>

  <h2 id="ai-loop"><span class="num">01</span>The Event Loop</h2>
  <p>A thread waiting for a network reply does nothing useful. In asyncio, a function that has to wait says so with <code>await</code> and hands control back to a scheduler, the <strong>event loop</strong>. The loop runs other tasks in the meantime and resumes the paused function when its reply arrives. Functions that can be paused and resumed like this are <strong>coroutines</strong>. The result is many waits in flight on one thread. The examples use this helper module; <code>fetch_menu_async</code> is a simulated 0.2 s request whose wait is <code>await asyncio.sleep(...)</code>, while <code>fetch_menu</code> is the same request written with the blocking <code>time.sleep(...)</code>. The difference between those two lines is what most of asyncio is about.</p>
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
  <figure class="viz"><svg viewBox="0 0 590 200" width="590">
    <defs><marker id="ai-ah3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="180" height="50" rx="8" class="fb sb"/><text x="24" y="42">Ready queue</text><text x="24" y="60" class="tm">tasks able to run</text>
    <rect x="390" y="20" width="190" height="50" rx="8" class="fg sg"/><text x="402" y="42">Run one task</text><text x="402" y="60" class="tm">until it reaches await</text>
    <rect x="170" y="135" width="250" height="50" rx="8" class="fs"/><text x="184" y="157">Waiting</text><text x="184" y="175" class="tm">sockets, timers (OS tells the loop)</text>
    <line x1="190" y1="45" x2="386" y2="45" stroke="currentColor" stroke-width="1.5" marker-end="url(#ai-ah3)"/><text x="245" y="38" class="tm">pick next</text>
    <line x1="480" y1="70" x2="400" y2="132" stroke="currentColor" stroke-width="1.5" marker-end="url(#ai-ah3)"/><text x="455" y="112" class="tm">await I/O</text>
    <line x1="200" y1="133" x2="110" y2="73" stroke="currentColor" stroke-width="1.5" marker-end="url(#ai-ah3)"/><text x="10" y="140" class="tm">reply ready</text><text x="10" y="156" class="tm">→ wake</text>
  </svg><figcaption>The loop cycles on one thread: take a ready task, run it until it awaits something not yet available, park it in Waiting, and move it back to Ready when the OS reports that its socket or timer is ready.</figcaption></figure>
  <table class="tbl"><caption>Threads vs asyncio for I/O-bound concurrency</caption>
    <tr><th></th><th>Threads</th><th>asyncio</th></tr>
    <tr><td>Who switches</td><td>the OS / interpreter, at almost any point (<strong>preemptive</strong>)</td><td>the task itself, only at <code>await</code> (<strong>cooperative</strong>)</td></tr>
    <tr><td>Cost per waiting task</td><td>an OS thread with its own stack</td><td>a small Python object (KBs)</td></tr>
    <tr><td>Shared data</td><td>needs locks</td><td>safe between awaits</td></tr>
    <tr><td>Libraries</td><td>any (requests, sync DB drivers)</td><td>must be async (httpx, aiohttp, asyncpg) or wrapped</td></tr>
    <tr><td>Main hazard</td><td>races, deadlocks</td><td>a blocking call freezes everything</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Event loop</strong>: a scheduler on one thread that keeps a queue of ready tasks, runs each until it awaits something not ready, and uses the OS's I/O notification (epoll, kqueue, IOCP) plus timers to learn when waiting tasks can resume. <strong>Cooperative multitasking</strong>: tasks give up control voluntarily; nothing interrupts a task between two <code>await</code>s.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Thinking asyncio makes code faster. It does not speed up any single request and does nothing for calculation (one thread, no parallelism). It only stops the program sitting idle while it waits.</p></div>

  <h2 id="ai-coro"><span class="num">02</span>Coroutines: async def and await</h2>
  <p>Calling an <code>async def</code> function does <strong>not</strong> run its body. It returns a <strong>coroutine object</strong>, the function paused before its first line, and something has to drive it. Below we drive one by hand with <code>send(None)</code>, the same method that resumes generators (<a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>).</p>
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
  <p>Line 1 printed before the body ran. <code>send(None)</code> ran the body to its <code>return</code>, and a finished coroutine raises <code>StopIteration</code> with the return value in <code>.value</code>, exactly as a generator does. <code>asyncio.run</code> does the sending and catches <code>StopIteration</code> for us. Now a coroutine with a pause point (<code>await asyncio.sleep(0)</code> yields control once):</p>
  <div class="fx" data-lang="py">import asyncio

async def fetch(rid):
    print(f"   sending request for {rid}")
    await asyncio.sleep(0)                     # a pause point: control goes back to the caller
    print(f"   resumed: reply for {rid} arrived")
    return {"id": rid, "dishes": 4}

c = fetch("R01")
print("send #1 returned:", c.send(None))       # runs up to the pause, then hands back None
try:
    c.send(None)                               # resumes after the pause, runs to the end
except StopIteration as stop:
    print("send #2 finished with:", stop.value)</div>
  <div class="fx" data-lang="text">   sending request for R01
send #1 returned: None
   resumed: reply for R01 arrived
send #2 finished with: {'id': 'R01', 'dishes': 4}</div>
  <p>The first <code>send</code> ran up to the <code>await</code> and returned control to us. The second resumed right after it, with local variables intact, and ran to the end. This is the whole mechanism: an <code>await</code> on something not ready suspends the coroutine and returns control up the chain to whoever called <code>send</code>. In real programs that is the event loop, which then drives some other coroutine and comes back to this one when its timer or socket is ready.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Coroutine function</strong>: defined with <code>async def</code>. <strong>Coroutine</strong>: the object its call returns; it runs only when awaited, wrapped in a Task, or passed to <code>asyncio.run</code>. <strong>Awaitable</strong>: anything usable after <code>await</code>: a coroutine, a <code>Task</code>, a <code>Future</code>, or an object with <code>__await__</code>. <code>await</code> is only valid inside <code>async def</code> (or at the top level of a Jupyter cell / <code>python -m asyncio</code> REPL).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Calling a coroutine function without awaiting it: <code>fetch_menu_async("R01")</code> on its own does nothing and later warns "coroutine … was never awaited" (section 11).</p></div>

  <h2 id="ai-await"><span class="num">03</span>asyncio.run and Sequential await</h2>
  <p><code>asyncio.run(main())</code> creates an event loop, runs <code>main()</code> to completion, cancels leftovers and closes the loop; call it once, at the program's entry point. Inside, <code>await x</code> means "run x and suspend me until it has finished". On its own that does not create concurrency:</p>
  <div class="fx" data-lang="py">import asyncio, time
from workload import RESTAURANTS, fetch_menu_async

async def main():
    t = time.perf_counter()
    menus = []
    for rid in RESTAURANTS:
        menus.append(await fetch_menu_async(rid))   # wait for THIS one before the next
    print(f"awaited one by one: {sum(m['dishes'] for m in menus)} dishes in {time.perf_counter() - t:.2f}s")

asyncio.run(main())                            # start the loop, run main() to the end, close</div>
  <div class="fx" data-lang="text">awaited one by one: 100 dishes in 4.01s</div>
  <p>4.01 s, the same as the blocking sequential loop. Each <code>await</code> did suspend <code>main</code>, but the loop had <strong>nothing else to run</strong>: the second request had not been created yet. Suspending is necessary for concurrency but not sufficient. There must also be other tasks ready to use the pause, which is what <code>create_task</code> and <code>gather</code> provide.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong><code>asyncio.run(coro, debug=False)</code></strong>: new event loop → run <code>coro</code> → cancel remaining tasks → close; raises <code>RuntimeError</code> if a loop is already running in this thread. <strong><code>await x</code></strong>: suspend the current coroutine until awaitable <code>x</code> completes, then evaluate to its result or raise its exception.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>for u in urls: data = await fetch(u)</code> is the most common "my async code isn't faster" bug. It is correct, just sequential.</p></div>

  <h2 id="ai-task"><span class="num">04</span>Tasks: asyncio.create_task</h2>
  <p><code>asyncio.create_task(coro)</code> wraps a coroutine in a <strong>Task</strong> and schedules it on the loop, returning immediately. The task does not start at that instant, because only one thing runs at a time and that is still the caller. It starts the next time the caller suspends at an <code>await</code>. Below, two requests of 0.3 s and 0.2 s run (A) awaited in turn and (B) as two tasks.</p>
  <div class="fx" data-lang="py">import asyncio, time

T0 = time.perf_counter()
def log(msg):
    print(f"{time.perf_counter() - T0:.1f}s  {msg}")

async def fetch(rid, secs):
    log(f"{rid} request sent")
    await asyncio.sleep(secs)
    log(f"{rid} reply arrived")
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
0.3s  R01 reply arrived
0.3s  R02 request sent
0.5s  R02 reply arrived
0.5s  B) create_task, create_task, then await
0.5s  both tasks created; main is still running
0.5s  R01 request sent
0.5s  R02 request sent
0.7s  R02 reply arrived
0.8s  R01 reply arrived
0.8s  got R01 and R02</div>
  <table class="tbl"><caption>Part B, traced (one thread throughout)</caption>
    <tr><th>Time</th><th>main</th><th>t1 (0.3 s)</th><th>t2 (0.2 s)</th></tr>
    <tr><td>0.5</td><td>creates t1, t2; prints "still running"; <code>await t1</code> suspends main</td><td>loop starts it: sent, sleeps</td><td>loop starts it: sent, sleeps</td></tr>
    <tr><td>0.7</td><td>(waiting for t1)</td><td>(sleeping)</td><td>reply, done</td></tr>
    <tr><td>0.8</td><td>resumes with "R01"; <code>await t2</code> is already done, no wait</td><td>reply, done</td><td></td></tr>
  </table>
  <p>Part A took 0.3 + 0.2 = 0.5 s; part B took 0.3 s, the longer of the two, because the waits overlapped. "both tasks created" printed before either request was sent, which confirms that <code>create_task</code> only schedules.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Task</strong> (<code>asyncio.Task</code>): a coroutine scheduled to run on the loop independently of its creator; a subclass of <code>asyncio.Future</code>, a placeholder for a result that will exist later. API: <code>create_task(coro, name=None)</code>, <code>await task</code>, <code>task.done()</code>, <code>task.result()</code>, <code>task.cancel()</code>, <code>task.add_done_callback(fn)</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Fire-and-forget: <code>asyncio.create_task(send_email())</code> without keeping the result. The loop keeps only a weak reference to tasks, so an unreferenced task can be garbage-collected mid-flight, and its exception is never seen. Keep references (a set, with <code>task.add_done_callback(tasks.discard)</code>) or use a TaskGroup.</p></div>

  <h2 id="ai-gather"><span class="num">05</span>gather, as_completed and TaskGroup</h2>
  <p>For "run all of these and collect the results", <code>await asyncio.gather(c1, c2, …)</code> wraps each coroutine in a task, waits for all, and returns results <strong>in argument order</strong>. <code>flaky</code> is a call that fails for R13.</p>
  <div class="fx" data-lang="py">import asyncio, time
from workload import RESTAURANTS, fetch_menu_async

async def flaky(rid):
    if rid == "R13":
        await asyncio.sleep(0.1)
        raise ConnectionError("R13 unavailable")
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
return_exceptions=True: ['R12', ConnectionError('R13 unavailable'), 'R14']
without it, the first error is raised: R13 unavailable
as_completed gave R14
as_completed gave R12</div>
  <p>(1) 20 requests in 0.20 s instead of 4.01 s, results in input order. (2) With <code>return_exceptions=True</code>, R13's exception sits in the list like a value and the others are kept. (3) Without it, the first exception propagates and you lose the other results, while the other tasks <em>keep running</em> in the background. (4) <code>as_completed</code> yields in finish order (here R14 happened to finish first; both take 0.2 s).</p>
  <h3>TaskGroup: structured concurrency (3.11+)</h3>
  <p>A <code>TaskGroup</code> is an <code>async with</code> block that owns its tasks: all are awaited when the block exits, and if any fails, the group <strong>cancels the rest</strong> and raises the errors together as an <code>ExceptionGroup</code>, caught with <code>except*</code>.</p>
  <div class="fx" data-lang="py">import asyncio

async def fetch(rid, secs, fail=False):
    try:
        await asyncio.sleep(secs)
        if fail:
            raise ConnectionError(f"{rid} unavailable")
        print(rid, "reply arrived")
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
  <div class="fx" data-lang="text">R01 reply arrived
R20 cancelled
TaskGroup raised: ['R13 unavailable']</div>
  <p>R01 finished at 0.1 s; R13 failed at 0.2 s, so the group cancelled R20, which still had 0.8 s to go, then raised R13's error. Nothing was left running.</p>
  <table class="tbl">
    <tr><th>Tool</th><th>Result order</th><th>On error</th><th>Use when</th></tr>
    <tr><td><code>gather(*aws)</code></td><td>input order</td><td>first error raised; others keep running</td><td>simple fan-out</td></tr>
    <tr><td><code>gather(…, return_exceptions=True)</code></td><td>input order</td><td>errors returned as values</td><td>batches that tolerate failures</td></tr>
    <tr><td><code>as_completed(aws)</code></td><td>finish order</td><td>raised when you await that one</td><td>process fast results first</td></tr>
    <tr><td><code>TaskGroup</code></td><td>keep the task objects</td><td>cancel the rest, raise <code>ExceptionGroup</code></td><td>all-or-nothing work; the safe default in 3.11+</td></tr>
    <tr><td><code>wait(aws, return_when=…)</code></td><td><code>(done, pending)</code> sets</td><td>you inspect each</td><td>first-completed / first-exception logic</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Structured concurrency</strong>: no task outlives the block that started it, so errors and cancellation propagate predictably. <code>TaskGroup</code> provides it; bare <code>create_task</code> and <code>gather</code> do not.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Plain <code>gather</code> for work that must stop after a failure: the remaining tasks keep running unobserved. Use a TaskGroup, or cancel them yourself.</p></div>

  <h2 id="ai-timeout"><span class="num">06</span>Timeouts, Cancellation and Semaphores</h2>
  <p>Cancellation in asyncio works by <strong>throwing <code>asyncio.CancelledError</code> into the coroutine at the <code>await</code> where it is suspended</strong>, so <code>try/finally</code> cleanup runs as for any exception. Timeouts are built on cancellation: when time is up, the awaited work is cancelled and the timeout converts that into <code>TimeoutError</code>. Each call below needs 0.2 s.</p>
  <div class="fx" data-lang="py">import asyncio
from workload import fetch_menu_async

async def careful_fetch(rid):
    try:
        return await fetch_menu_async(rid)
    finally:
        print(f"   cleanup for {rid} ran")        # runs on success, error or cancel

async def main():
    try:
        async with asyncio.timeout(0.1):         # Python 3.11+; the call needs 0.2 s
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
  <p>In every case the <code>finally</code> ran before control returned: on timeout (1, 2), on explicit cancel (3), and on success (4). <code>asyncio.timeout</code> is the 3.11+ context-manager form; <code>wait_for</code> is the older function form. Since 3.11, <code>asyncio.TimeoutError</code> is the built-in <code>TimeoutError</code>.</p>
  <h3>Limiting concurrency with asyncio.Semaphore</h3>
  <p><code>asyncio.Semaphore(n)</code> is the async version of the threading semaphore: <code>async with slots:</code> suspends (letting other tasks run) while n holders are inside.</p>
  <div class="fx" data-lang="py">import asyncio, time
from workload import RESTAURANTS, fetch_menu_async

inside = peak = 0
async def polite_fetch(slots, rid):
    global inside, peak
    async with slots:                            # wait here if 5 requests are in flight
        inside += 1; peak = max(peak, inside)    # no lock needed: one thread, no await in between
        menu = await fetch_menu_async(rid)
        inside -= 1
        return menu

async def main():
    slots = asyncio.Semaphore(5)                 # the API allows 5 at once
    t = time.perf_counter()
    menus = await asyncio.gather(*(polite_fetch(slots, r) for r in RESTAURANTS))
    print(f"{sum(m['dishes'] for m in menus)} dishes, peak in flight = {peak}, {time.perf_counter() - t:.2f}s")

asyncio.run(main())</div>
  <div class="fx" data-lang="text">100 dishes, peak in flight = 5, 0.80s</div>
  <p>⌈20 / 5⌉ = 4 rounds × 0.2 s = 0.8 s, and the peak never exceeded 5. <code>inside += 1</code> needs no lock here because there is no <code>await</code> between the read and the write, and on one thread nothing else can run in between.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong><code>asyncio.timeout(s)</code></strong> / <strong><code>asyncio.wait_for(aw, s)</code></strong>: cancel the awaited work after s seconds and raise <code>TimeoutError</code>. <strong><code>task.cancel()</code></strong>: request cancellation; <code>CancelledError</code> is raised inside the task at its current <code>await</code>. <strong><code>asyncio.shield(aw)</code></strong> protects an inner operation from outer cancellation. <strong><code>asyncio.Semaphore(n)</code></strong>: at most n holders, acquired with <code>async with</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Catching <code>CancelledError</code> (or a bare <code>except BaseException</code>) and not re-raising it. The task refuses to die, timeouts stop working and TaskGroups hang. Put cleanup in <code>finally</code>; if you must catch <code>CancelledError</code>, re-raise it. (Since 3.8 it subclasses <code>BaseException</code>, so <code>except Exception</code> does not catch it.)</p></div>

  <h2 id="ai-with"><span class="num">07</span>async with, async for and Async Generators</h2>
  <p>A normal <code>with</code> calls <code>__enter__</code> and <code>__exit__</code>, which cannot <code>await</code>, and a normal <code>for</code> calls <code>__next__</code>, which cannot either. When opening or closing a resource, or producing the next item, involves network round-trips, use the async versions. <code>async with x</code> awaits <code>x.__aenter__()</code> and <code>x.__aexit__(…)</code> (the async form of <a class="xref" data-note="py_context">Context Managers</a>); <code>@asynccontextmanager</code> builds one from an async generator. An <code>async def</code> containing <code>yield</code> is an <strong>async generator</strong>, consumed with <code>async for</code>.</p>
  <div class="fx" data-lang="py">import asyncio
from contextlib import asynccontextmanager
from workload import fetch_menu_async

class Client:
    async def __aenter__(self):                  # may await: e.g. open a connection
        await asyncio.sleep(0.01)
        print("connection opened")
        return self
    async def __aexit__(self, exc_type, exc, tb):  # may await: e.g. close it politely
        await asyncio.sleep(0.01)
        print("connection closed, error was:", exc_type.__name__ if exc_type else None)
    async def get(self, rid):
        return await fetch_menu_async(rid)

@asynccontextmanager
async def client():                              # the same thing, generator style
    print("connection opened (generator style)")
    try:
        yield Client()
    finally:
        print("connection closed (generator style)")

async def pages(api, rids, page_size=3):         # an ASYNC generator: yield inside async def
    for i in range(0, len(rids), page_size):
        page = await asyncio.gather(*(api.get(r) for r in rids[i:i + page_size]))
        yield page

async def main():
    async with Client() as api:
        print("R01:", await api.get("R01"))
    async with client() as api:
        async for page in pages(api, ["R01", "R02", "R03", "R04", "R05"]):
            print("page:", [m["id"] for m in page])
        dishes = [m["dishes"] async for page in pages(api, ["R01", "R02"]) for m in page]
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
  <p><code>async for</code> pulled pages lazily: each page was fetched (concurrently, via <code>gather</code>) only when the loop asked for it. <code>[… async for …]</code> is an async comprehension. This is the shape of paginated API clients and streaming consumers (<code>async for msg in consumer:</code> in aiokafka).</p>
  <table class="tbl">
    <tr><th>Sync</th><th>Async</th><th>Protocol</th></tr>
    <tr><td><code>with m as x:</code></td><td><code>async with m as x:</code></td><td><code>await m.__aenter__()</code>, <code>await m.__aexit__(t, e, tb)</code></td></tr>
    <tr><td><code>@contextmanager</code></td><td><code>@asynccontextmanager</code></td><td>async generator with one <code>yield</code></td></tr>
    <tr><td><code>for x in it:</code></td><td><code>async for x in ait:</code></td><td><code>ait.__aiter__()</code>, <code>await ait.__anext__()</code>, <code>StopAsyncIteration</code></td></tr>
    <tr><td>generator (<code>def</code> + <code>yield</code>)</td><td>async generator (<code>async def</code> + <code>yield</code>)</td><td>may <code>await</code> between yields</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span><p><code>with</code> on an async resource raises <code>TypeError: … does not support the context manager protocol</code>; <code>for</code> over an async generator raises <code>TypeError: 'async_generator' object is not iterable</code>. The error names the missing protocol.</p></div>

  <h2 id="ai-block"><span class="num">08</span>Blocking the Event Loop</h2>
  <p>The loop and every task share one thread, and a coroutine gives that thread back only at an <code>await</code>. A call that blocks, or simply computes for a long time, keeps the thread, and nothing else runs until it returns. Five gathered calls, written correctly and incorrectly:</p>
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
        print(f"{fn.__name__:&lt;4}: 5 gathered calls took {time.perf_counter() - t:.2f}s")

asyncio.run(main())</div>
  <div class="fx" data-lang="text">good: 5 gathered calls took 0.20s
bad : 5 gathered calls took 1.00s</div>
  <p><code>bad</code> looks concurrent, but each call held the thread for 0.2 s, so they ran one after another: exactly 5 × 0.2 = 1.00 s. CPU work blocks the same way. Below, a heartbeat task prints every 0.1 s (standing in for every other request a server is handling), and in the middle a CPU-bound function runs directly inside a coroutine:</p>
  <div class="fx" data-lang="py">import asyncio, time
from workload import RIDERS, route_cost

T0 = time.perf_counter()
async def heartbeat():                           # stands in for every other task on the loop
    while True:
        print(f"   tick {time.perf_counter() - T0:.1f}s")
        await asyncio.sleep(0.1)

async def compute_inside_loop():
    print(f"compute start {time.perf_counter() - T0:.1f}s")
    cost = route_cost(RIDERS[0])                 # CPU work, no await: the loop is stuck
    print(f"compute done  {time.perf_counter() - T0:.1f}s, cost {cost}")

async def main():
    hb = asyncio.create_task(heartbeat())
    await asyncio.sleep(0.25)
    await compute_inside_loop()
    await asyncio.sleep(0.25)
    hb.cancel()

asyncio.run(main())</div>
  <div class="fx" data-lang="text">   tick 0.0s
   tick 0.1s
   tick 0.2s
compute start 0.3s
compute done  0.5s, cost 40
   tick 0.5s
   tick 0.6s
   tick 0.7s</div>
  <p>Ticks stop between 0.3 s and 0.5 s while the computation holds the thread; the 0.3 and 0.4 ticks never happen. In a web server, that is every other user's request frozen for the duration.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Blocking call</strong>: a call that does not return until its work is done and does not yield to the loop: <code>time.sleep</code>, sync network/DB libraries (<code>requests</code>, <code>psycopg2</code>, boto3), most file I/O, heavy computation. Inside <code>async def</code> it stalls <strong>all</strong> tasks. <code>asyncio.run(main(), debug=True)</code> logs callbacks that take longer than 0.1 s (<code>loop.slow_callback_duration</code>).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>requests.get</code> inside a FastAPI <code>async def</code> endpoint: every request to the server queues behind it. Use an async client, or declare the endpoint with plain <code>def</code> so FastAPI runs it in a thread pool (<a class="xref" data-note="api_fastapi">FastAPI</a>).</p></div>

  <h2 id="ai-exec"><span class="num">09</span>to_thread and run_in_executor</h2>
  <p>When the only library is blocking, or a step is CPU-heavy, move that work off the loop's thread and await its result. <code>asyncio.to_thread(f, *args)</code> runs <code>f</code> in the loop's default thread pool (a <code>ThreadPoolExecutor</code>, see <a class="xref" data-note="py_threading">Threads &amp; the GIL</a>) and returns an awaitable. Here is the blocking <code>fetch_menu</code>, 20 times:</p>
  <div class="fx" data-lang="py">import asyncio, os, time
from workload import RESTAURANTS, fetch_menu       # the BLOCKING version

async def main():
    t = time.perf_counter()
    menus = await asyncio.gather(*(asyncio.to_thread(fetch_menu, r) for r in RESTAURANTS))
    print(f"to_thread, default pool: {sum(m['dishes'] for m in menus)} dishes in {time.perf_counter() - t:.2f}s")

asyncio.run(main())
print("default thread-pool size here = min(32, cpus + 4) =", min(32, (os.cpu_count() or 1) + 4))</div>
  <div class="fx" data-lang="text">to_thread, default pool: 100 dishes in 0.60s
default thread-pool size here = min(32, cpus + 4) = 8</div>
  <p>0.60 s, not 0.20 s: the default pool has 8 threads on this 4-core machine, so 20 blocking calls ran 8 at a time, ⌈20 / 8⌉ = 3 rounds × 0.2 s. The loop itself stayed free throughout. For more concurrency, pass your own larger <code>ThreadPoolExecutor</code> to <code>loop.run_in_executor</code> (or set it with <code>loop.set_default_executor</code>).</p>
  <p>For CPU-bound work a thread does not help (the GIL), so use a <strong>process pool</strong> (<a class="xref" data-note="py_multiprocessing">Processes</a>): <code>await loop.run_in_executor(pool, fn, *args)</code>. Below, the 4 CPU-bound searches go to 4 processes while the loop fetches 20 results and a heartbeat shows the loop never froze.</p>
  <div class="fx" data-lang="py">import asyncio, time
from concurrent.futures import ProcessPoolExecutor
from workload import RESTAURANTS, RIDERS, fetch_menu_async, route_cost

T0 = time.perf_counter()
async def heartbeat():
    while True:
        print(f"   tick {time.perf_counter() - T0:.1f}s")
        await asyncio.sleep(0.1)

async def main(pool):
    loop = asyncio.get_running_loop()
    hb = asyncio.create_task(heartbeat())
    cpu_futs = [loop.run_in_executor(pool, route_cost, s) for s in RIDERS]     # CPU -&gt; processes
    menus = await asyncio.gather(*(fetch_menu_async(r) for r in RESTAURANTS)) # I/O -&gt; the loop
    print(f"I/O done at {time.perf_counter() - T0:.1f}s: {sum(m['dishes'] for m in menus)} dishes")
    costs = await asyncio.gather(*cpu_futs)
    print(f"CPU done at {time.perf_counter() - T0:.1f}s: {costs}")
    hb.cancel()

if __name__ == "__main__":
    with ProcessPoolExecutor(max_workers=4) as pool:
        asyncio.run(main(pool))</div>
  <div class="fx" data-lang="text">   tick 0.0s
   tick 0.1s
   tick 0.2s
I/O done at 0.2s: 100 dishes
   tick 0.3s
CPU done at 0.4s: [40, 36, 35, 36]</div>
  <p>The heartbeat kept ticking; the I/O finished at 0.2 s while the processes were still computing; the CPU work finished at about 0.4 s. Both jobs, about 5 s sequentially, completed in the time of the slower one. The pool is created under <code>if __name__ == "__main__":</code> because it starts processes.</p>
  <div class="flow"><span>event loop (1 thread)</span><span>I/O: await, ≈ 0.2 s</span><span>heartbeat keeps ticking</span><span>run_in_executor → 4 processes</span><span>CPU: ≈ 0.4 s</span></div>
  <div class="callout def"><span class="label">Definition</span><p><strong><code>asyncio.to_thread(func, *args, **kwargs)</code></strong> (3.9+): run a blocking function in the default thread pool; returns a coroutine; copies the current <code>contextvars</code>. <strong><code>loop.run_in_executor(executor, func, *args)</code></strong>: run <code>func</code> in any <code>concurrent.futures</code> executor (<code>None</code> = default thread pool); returns an awaitable Future; use <code>functools.partial</code> for keyword arguments. Rule: blocking I/O → thread pool; CPU-bound → process pool.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Sending CPU work to <code>to_thread</code> and expecting it to finish faster. The loop stays responsive, but the computation still holds the GIL and runs no faster. Only a process pool computes in parallel.</p></div>

  <h2 id="ai-http"><span class="num">10</span>Async HTTP with httpx and aiohttp</h2>
  <p>Real async HTTP needs three things beyond <code>gather</code>. First, <strong>one shared client</strong>, so TCP/TLS connections are reused from a connection pool instead of opened per request. Second, <strong>a semaphore</strong> to bound requests in flight. Third, <strong>error handling</strong> so one bad response does not lose the batch. To run offline, the script starts a tiny aiohttp server on the same loop (every request takes 0.2 s; <code>/menu/R99</code> returns 404), then fetches 20 resources with httpx and with aiohttp (<code>pip install httpx aiohttp</code>).</p>
  <div class="fx" data-lang="py">import asyncio, time
import aiohttp, httpx
from aiohttp import web
from workload import RESTAURANTS, LATENCY

# --- a tiny local server, so no internet is needed: every request takes 0.2 s ---
async def handler(request):
    rid = request.match_info["rid"]
    await asyncio.sleep(LATENCY)
    if rid == "R99":
        return web.json_response({"error": "not found"}, status=404)
    return web.json_response({"id": rid, "dishes": 3 + int(rid[1:]) % 5})

async def start_server():
    app = web.Application()
    app.add_routes([web.get("/menu/{rid}", handler)])
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
  <div class="fx" data-lang="text">httpx  : 100 dishes in 0.52s
httpx with a bad id: ['R01', 'HTTPStatusError']
aiohttp: 100 dishes in 0.41s</div>
  <p>With 10 in flight, 20 requests need ⌈20 / 10⌉ = 2 rounds × 0.2 s = 0.4 s; aiohttp measured about 0.41 s and httpx about 0.52 s (opening connections in the first round adds a little). The 404 became <code>httpx.HTTPStatusError</code> via <code>raise_for_status()</code>, and <code>return_exceptions=True</code> kept the good result next to it. Both clients are used as <code>async with</code> so their connection pools are closed. The APIs differ only in spelling: httpx returns the response from <code>await client.get()</code>; aiohttp's <code>session.get()</code> is itself an async context manager and the body is read with <code>await r.json()</code>.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong><code>httpx.AsyncClient</code></strong> / <strong><code>aiohttp.ClientSession</code></strong>: async HTTP clients holding a connection pool; create one per application (or per batch) and reuse it. Combine with per-request timeouts, a semaphore, <code>raise_for_status()</code>, and retries with exponential back-off for transient errors (429, 5xx).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>A new client per request (a TCP and TLS handshake every time), or gathering 10,000 requests with no semaphore (rate limits, bans, socket exhaustion, mass timeouts). One client, a limit, timeouts.</p></div>

  <h2 id="ai-pitfalls"><span class="num">11</span>Common Pitfalls</h2>
  <h3>Forgetting await</h3>
  <div class="fx" data-lang="py">import asyncio
from workload import fetch_menu_async

async def main():
    result = fetch_menu_async("R01")             # forgot await
    print("got:", result)

asyncio.run(main())</div>
  <div class="fx" data-lang="text">got: &lt;coroutine object fetch_menu_async at 0x7f313297c2e0&gt;
/usr/local/lib/python3.13/asyncio/events.py:89: RuntimeWarning: coroutine 'fetch_menu_async' was never awaited
  self._context.run(self._callback, *self._args)
RuntimeWarning: Enable tracemalloc to get the object allocation traceback</div>
  <p>No error and no result: <code>result</code> is a coroutine object that never ran, and Python only warns when it is garbage-collected. That warning always means a missing <code>await</code>.</p>
  <h3>asyncio.run inside a running loop</h3>
  <div class="fx" data-lang="py">import asyncio
from workload import fetch_menu_async

async def main():
    try:
        asyncio.run(fetch_menu_async("R01"))     # a loop is already running here
    except RuntimeError as e:
        print("RuntimeError:", e)
    print("inside a running loop, just await:", await fetch_menu_async("R01"))

asyncio.run(main())</div>
  <div class="fx" data-lang="text">RuntimeError: asyncio.run() cannot be called from a running event loop
nested_run.py:8: RuntimeWarning: coroutine 'fetch_menu_async' was never awaited
  print("RuntimeError:", e)
RuntimeWarning: Enable tracemalloc to get the object allocation traceback
inside a running loop, just await: {'id': 'R01', 'dishes': 4}</div>
  <p>(Script path shortened.) Only one loop may run per thread. Inside async code, just <code>await</code>. Jupyter already runs a loop, so use top-level <code>await</code> there instead of <code>asyncio.run</code>.</p>
  <h3>Races still exist across an await</h3>
  <p>Code between two <code>await</code>s cannot be interrupted, but a read-modify-write that spans an <code>await</code> can be:</p>
  <div class="fx" data-lang="py">import asyncio

balance = 100
lock = asyncio.Lock()

async def withdraw(amount, use_lock):
    global balance
    async def body():
        global balance
        current = balance
        await asyncio.sleep(0.01)                # an await between read and write
        balance = current - amount
    if use_lock:
        async with lock:
            await body()
    else:
        await body()

async def main():
    global balance
    for use_lock in (False, True):
        balance = 100
        await asyncio.gather(*(withdraw(10, use_lock) for _ in range(5)))
        print(f"lock={use_lock!s:&lt;5}: balance = {balance} (expected 50)")

asyncio.run(main())</div>
  <div class="fx" data-lang="text">lock=False: balance = 90 (expected 50)
lock=True : balance = 50 (expected 50)</div>
  <p>All five tasks read 100 before any wrote, so four withdrawals were lost. <code>asyncio.Lock</code> (acquired with <code>async with</code>) fixes it. Note that asyncio primitives are not thread-safe. They coordinate tasks on one loop, not threads.</p>
  <table class="tbl"><caption>Pitfall summary</caption>
    <tr><th>Pitfall</th><th>Symptom</th><th>Fix</th></tr>
    <tr><td>Missing <code>await</code></td><td>coroutine object instead of a result; "never awaited" warning</td><td>add <code>await</code></td></tr>
    <tr><td><code>for …: await f()</code></td><td>no speed-up (20 calls 4.01 s)</td><td><code>gather</code> / <code>TaskGroup</code></td></tr>
    <tr><td>Blocking call in <code>async def</code></td><td>"concurrent" tasks run one by one; latency spikes</td><td>async library, <code>to_thread</code>, process pool</td></tr>
    <tr><td>Unreferenced <code>create_task</code></td><td>task vanishes, errors unseen</td><td>keep references; TaskGroup</td></tr>
    <tr><td>Swallowing <code>CancelledError</code></td><td>timeouts and shutdown stop working</td><td>re-raise; cleanup in <code>finally</code></td></tr>
    <tr><td>Plain <code>gather</code> on failure</td><td>other tasks keep running unseen</td><td>TaskGroup or <code>return_exceptions=True</code></td></tr>
    <tr><td>No semaphore / new client per request</td><td>rate limits, socket exhaustion</td><td>one client, <code>Semaphore(n)</code></td></tr>
    <tr><td>Read-modify-write across an <code>await</code></td><td>lost updates</td><td><code>asyncio.Lock</code></td></tr>
    <tr><td>Calling loop objects from another thread</td><td>random errors (asyncio is not thread-safe)</td><td><code>asyncio.run_coroutine_threadsafe</code>, <code>loop.call_soon_threadsafe</code></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p>Testing async code: call <code>asyncio.run</code> inside a normal test, or use pytest-asyncio (<code>@pytest.mark.asyncio</code> on an <code>async def</code> test); mock async functions with <code>unittest.mock.AsyncMock</code> (see <a class="xref" data-note="py_pytest">pytest</a> and <a class="xref" data-note="py_mocking">Mocking</a>).</p></div>

  <h2 id="ai-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Model</h3>
  <ul>
    <li>One thread, one event loop, many tasks; cooperative switching only at <code>await</code>.</li>
    <li>Concurrency for I/O, not parallelism: no help for CPU-bound work.</li>
    <li>Loop uses epoll/kqueue/IOCP + timers to know which waiting task can resume.</li>
  </ul>
  <h3>Coroutines and run</h3>
  <ul>
    <li><code>async def f()</code>; calling <code>f()</code> returns a coroutine, runs nothing.</li>
    <li>Under the hood: <code>send(None)</code> runs to the next suspension; <code>StopIteration.value</code> is the result.</li>
    <li><code>asyncio.run(main())</code> once at the entry point; error if a loop is already running.</li>
    <li><code>await</code> = suspend until this awaitable is done. A loop of awaits is sequential.</li>
  </ul>
  <h3>Running many</h3>
  <div class="fx" data-lang="py">t = asyncio.create_task(coro())                # starts at the next await; keep t
res = await asyncio.gather(*coros)             # input order
res = await asyncio.gather(*coros, return_exceptions=True)
for f in asyncio.as_completed(coros): await f  # finish order
async with asyncio.TaskGroup() as tg:          # 3.11+: cancel rest on failure
    tg.create_task(coro())</div>
  <h3>Control</h3>
  <ul>
    <li><code>async with asyncio.timeout(s):</code> / <code>await asyncio.wait_for(aw, s)</code> → <code>TimeoutError</code>.</li>
    <li><code>task.cancel()</code> throws <code>CancelledError</code> at the current await; clean up in <code>finally</code>; re-raise.</li>
    <li><code>asyncio.Semaphore(n)</code>: at most n in flight; time ≈ ⌈tasks / n⌉ × latency (20 × 0.2 s, n = 5 → 0.8 s).</li>
    <li><code>asyncio.Lock</code> when a read-modify-write spans an <code>await</code>.</li>
  </ul>
  <h3>async with / async for</h3>
  <ul>
    <li><code>__aenter__</code>/<code>__aexit__</code>; <code>@asynccontextmanager</code>.</li>
    <li><code>__aiter__</code>/<code>__anext__</code>/<code>StopAsyncIteration</code>; async generator = <code>async def</code> + <code>yield</code>.</li>
  </ul>
  <h3>Blocking and executors</h3>
  <table class="tbl">
    <tr><th>Work</th><th>Inside <code>async def</code></th><th>Measured</th></tr>
    <tr><td><code>await asyncio.sleep</code> / async I/O</td><td>fine</td><td>5 gathered: 0.20 s</td></tr>
    <tr><td><code>time.sleep</code> / <code>requests</code></td><td>blocks every task → <code>asyncio.to_thread</code></td><td>5 gathered: 1.00 s</td></tr>
    <tr><td>CPU-heavy Python</td><td>blocks every task → <code>run_in_executor(process_pool, …)</code></td><td>heartbeat gap while computing</td></tr>
  </table>
  <ul>
    <li>Default thread pool: <code>min(32, cpu_count + 4)</code> threads (8 here → 20 blocking calls ≈ 0.6 s).</li>
    <li><code>debug=True</code> logs callbacks slower than 0.1 s.</li>
  </ul>
  <h3>HTTP checklist</h3>
  <ul>
    <li>One <code>httpx.AsyncClient</code> / <code>aiohttp.ClientSession</code> per app, used as <code>async with</code>.</li>
    <li><code>Semaphore</code>, per-request timeouts, <code>raise_for_status()</code>, retries with back-off.</li>
  </ul>
  <h3>asyncio vs threads</h3>
  <table class="tbl">
    <tr><th></th><th>Threads</th><th>asyncio</th></tr>
    <tr><td>Switching</td><td>preemptive</td><td>cooperative (<code>await</code>)</td></tr>
    <tr><td>Scale</td><td>tens–hundreds</td><td>thousands+</td></tr>
    <tr><td>Libraries</td><td>any</td><td>async-native or wrapped</td></tr>
    <tr><td>Locks</td><td>needed for shared state</td><td>only across awaits</td></tr>
  </table>
  <h3>Gotchas</h3>
  <ul>
    <li>Missing <code>await</code> → coroutine object + "never awaited" warning.</li>
    <li><code>asyncio.run</code> inside a running loop (and in Jupyter) → <code>RuntimeError</code>; just <code>await</code>.</li>
    <li>Unreferenced tasks can be garbage-collected.</li>
    <li>Plain <code>gather</code> leaves other tasks running after an error.</li>
    <li>asyncio objects are not thread-safe.</li>
  </ul>

  <h2 id="ai-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is asyncio and when would you use it?</summary><div class="qa-body">The standard-library framework for cooperative concurrency on a single thread: coroutines suspend at <code>await</code> and an event loop runs other ready tasks meanwhile. Use it for I/O-bound workloads with many concurrent waits, such as web servers, API clients, websockets and async DB access, when async libraries exist. It does not help CPU-bound work.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a coroutine, and what happens when you call an <code>async def</code> function?</summary><div class="qa-body">Calling it returns a coroutine object without running the body. The body runs when the coroutine is awaited, wrapped in a Task, or passed to <code>asyncio.run</code>. Internally it is driven like a generator: <code>send(None)</code> runs it to the next suspension point, and it finishes by raising <code>StopIteration</code> with the return value.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the event loop?</summary><div class="qa-body">A scheduler running on one thread. It keeps a queue of ready tasks, runs each until it awaits something not ready, registers what it is waiting for (sockets via epoll/kqueue/IOCP, timers), and moves the task back to ready when that completes. <code>asyncio.run</code> creates one, runs your main coroutine and closes it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Concurrency or parallelism: which does asyncio give?</summary><div class="qa-body">Concurrency only. All coroutines run on one thread, so only one executes at any instant; overlap happens only while tasks are waiting on I/O. For parallel CPU work you need processes (e.g. <code>run_in_executor</code> with a <code>ProcessPoolExecutor</code>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Total time: <code>await f(); await g()</code> vs <code>await asyncio.gather(f(), g())</code>, each awaiting 0.2 s?</summary><div class="qa-body">About 0.4 s vs about 0.2 s. Sequential awaits wait for each in turn; <code>gather</code> schedules both as tasks so their waits overlap. Measured: 20 awaited in a loop took 4.01 s, gathered 0.20 s.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>create_task</code> vs <code>await</code>?</summary><div class="qa-body"><code>await coro</code> runs the coroutine and suspends the caller until it finishes. <code>create_task(coro)</code> schedules it on the loop and returns a Task immediately; it starts at the caller's next await, runs independently, and you collect the result later with <code>await task</code>. Keep a reference, because the loop holds tasks only weakly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>gather</code> vs <code>TaskGroup</code>?</summary><div class="qa-body"><code>gather</code> returns results in input order; on an error it raises the first exception but leaves the other tasks running (unless <code>return_exceptions=True</code>, which returns errors as values). <code>TaskGroup</code> (3.11+) awaits all tasks on exit and, if one fails, cancels the rest and raises an <code>ExceptionGroup</code> (handled with <code>except*</code>): structured concurrency.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if you call <code>time.sleep</code> or <code>requests.get</code> inside an <code>async def</code>?</summary><div class="qa-body">It blocks the event loop's only thread, so every other task freezes for the duration: 5 gathered coroutines calling <code>time.sleep(0.2)</code> took 1.00 s instead of 0.20 s. Use <code>await asyncio.sleep</code>, an async client (httpx, aiohttp), or wrap the blocking call with <code>await asyncio.to_thread(...)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you run CPU-bound code from an asyncio application?</summary><div class="qa-body">Offload it to a process pool: <code>await loop.run_in_executor(process_pool, fn, *args)</code>. A thread (<code>to_thread</code>) would keep the loop responsive but would not compute faster because of the GIL. The function and arguments must be picklable, and the pool is created under <code>if __name__ == "__main__":</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>asyncio.to_thread</code> vs <code>loop.run_in_executor</code>?</summary><div class="qa-body"><code>to_thread(fn, *args, **kwargs)</code> (3.9+) is a convenience that runs <code>fn</code> in the loop's default thread pool and propagates contextvars. <code>run_in_executor(executor, fn, *args)</code> accepts any executor, including a custom-sized thread pool or a process pool, but takes positional arguments only (use <code>functools.partial</code> for keywords).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does cancellation work, and why must <code>CancelledError</code> be re-raised?</summary><div class="qa-body"><code>task.cancel()</code> or a timeout throws <code>CancelledError</code> into the task at its current await, so <code>finally</code> blocks and <code>async with</code> exits run. If the coroutine catches it and does not re-raise, the task keeps running: timeouts no longer bound it and TaskGroups and shutdown hang. Clean up, then re-raise.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you add a timeout to an await?</summary><div class="qa-body"><code>async with asyncio.timeout(5): await op()</code> (3.11+) or <code>await asyncio.wait_for(op(), timeout=5)</code>. On expiry the inner work is cancelled and <code>TimeoutError</code> is raised. HTTP clients also accept per-request timeouts, which you should set too.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you stop 10,000 async requests from overwhelming an API?</summary><div class="qa-body">Wrap each request in <code>async with semaphore:</code> (<code>asyncio.Semaphore(n)</code>) so at most n are in flight; share one client for connection pooling; set timeouts; handle 429/5xx with retries and back-off; and use <code>return_exceptions=True</code> or a TaskGroup so failures are handled. For large inputs, a fixed set of worker tasks consuming an <code>asyncio.Queue</code> avoids creating 10,000 tasks up front.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Do you need locks in asyncio?</summary><div class="qa-body">Less often than with threads. Code between two awaits cannot be interrupted, so a read-modify-write with no await in the middle is safe. If the sequence spans an await (read, await I/O, write), other tasks can interleave and lose updates (5 withdrawals of 10 from 100 left 90 instead of 50); protect it with <code>asyncio.Lock</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>async def f(): return 1</code> then <code>print(f())</code></summary><div class="qa-body">Something like <code>&lt;coroutine object f at 0x…&gt;</code>, followed later by <code>RuntimeWarning: coroutine 'f' was never awaited</code>. Calling a coroutine function only creates the coroutine; you need <code>asyncio.run(f())</code> at top level or <code>await f()</code> inside async code to get 1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>asyncio.run()</code> fail in Jupyter?</summary><div class="qa-body">Jupyter's kernel already runs an event loop in that thread, and <code>asyncio.run</code> refuses to start a second one ("cannot be called from a running event loop"). In a notebook, use top-level <code>await main()</code> directly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>asyncio vs threads for I/O-bound work?</summary><div class="qa-body">Both overlap waits. Threads work with any blocking library and are simplest for tens to hundreds of tasks, but each costs an OS thread and shared state needs locks. asyncio scales to many thousands of connections cheaply and switches only at awaits, but needs async libraries end to end, and one blocking call stalls everything.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is a coroutine related to a generator?</summary><div class="qa-body">Both are functions that suspend and resume with their locals intact and are driven by <code>send()</code>, finishing with <code>StopIteration</code>. <code>await</code> works like <code>yield from</code>: it passes suspension up the chain to the event loop. Before <code>async</code>/<code>await</code> (3.5), asyncio coroutines were generators decorated with <code>@asyncio.coroutine</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In FastAPI, when should an endpoint be <code>async def</code> vs <code>def</code>?</summary><div class="qa-body"><code>async def</code> when everything it calls is async (httpx, asyncpg, async Redis): it runs on the event loop. Plain <code>def</code> when it calls blocking libraries (requests, sync DB drivers): FastAPI runs it in a thread pool so it does not block the loop. An <code>async def</code> endpoint that calls blocking code is the worst case, because it stalls every request.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you call an LLM API for 50,000 prompts as fast as the rate limit allows?</summary><div class="qa-body">asyncio with one shared async client; a semaphore (or token-bucket limiter) sized to the provider's concurrency and rate limits; per-request timeouts; retries with exponential back-off and jitter on 429/5xx; results streamed to disk as they complete (<code>as_completed</code> or worker tasks on an <code>asyncio.Queue</code>) so a crash does not lose everything; and <code>return_exceptions=True</code> or per-task try/except so one failure does not abort the batch.</div></details>
</main>
`
});
