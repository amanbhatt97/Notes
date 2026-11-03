// notes/python/py_asyncio.js — asyncio
Object.assign(TOPIC_CONTENT, {
  "py_asyncio": `<main>
<h1>asyncio</h1>
  <div class="where"><span>Python</span><span>Advanced Python</span><span>Concurrency</span><span>asyncio</span></div>
  <p class="lead"><code>asyncio</code> is Python's built-in way to have thousands of waiting tasks in progress at once while using only a single thread. Each task marks the places where it has to wait with the keyword <code>await</code>, and a scheduler called the <strong>event loop</strong> uses each of those waits to run some other task. Threads can also overlap waits, but each thread is a fairly heavy operating-system object, threads can be switched at any moment, and shared data needs locks; those costs make ten thousand threads impractical, while ten thousand asyncio tasks are cheap. The catch is that every task has to cooperate: one task that blocks the thread, for example by calling <code>time.sleep</code> or <code>requests.get</code> or doing a long calculation, freezes all the others. asyncio is what FastAPI endpoints, async database drivers, websocket servers, streaming consumers and high-volume AI-API clients run on. This page builds it up from scratch with the food-delivery app from <a class="xref" data-note="py_concurrency">Concurrency vs Parallelism</a>: fetching menus from 20 restaurants (a waiting job) and planning routes for 4 riders (a computing job). The code was run on CPython 3.13; timings vary from run to run and are approximate.</p>

  <h2 id="ai-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">asyncio</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The idea</div>
        <ul>
          <li>One thread, one <b>event loop</b>, many tasks</li>
          <li>Cooperative: tasks switch only at <code>await</code></li>
          <li>Concurrency for waiting, not parallelism</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Building blocks</div>
        <ul>
          <li><code>async def</code> → calling it makes a coroutine; nothing runs yet</li>
          <li><code>asyncio.run(main())</code> once; <code>await</code> inside</li>
          <li><code>create_task</code>, <code>gather</code>, <code>TaskGroup</code> to run many</li>
          <li>A loop of awaits is still sequential</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Control</div>
        <ul>
          <li><code>asyncio.timeout(s)</code>, <code>task.cancel()</code> → <code>CancelledError</code></li>
          <li><code>asyncio.Semaphore(n)</code>: at most n in flight</li>
          <li><code>async with</code>, <code>async for</code>, async generators</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Never block the loop</div>
        <ul>
          <li><code>time.sleep</code>, <code>requests</code>, heavy maths freeze every task</li>
          <li><code>asyncio.to_thread</code> for blocking calls</li>
          <li><code>run_in_executor(process_pool, …)</code> for computing</li>
          <li>Use async libraries: httpx, aiohttp, asyncpg</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ai-idea"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">One Thread, Many Waits</span><span class="rm-sub">the waiter and the event loop</span></div></div>
      <div class="rm-item rm-done" data-target="ai-coro"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Coroutines: async def and await</span><span class="rm-sub">functions that can pause and resume</span></div></div>
      <div class="rm-item rm-done" data-target="ai-await"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">asyncio.run and the Sequential await</span><span class="rm-sub">why a loop of awaits is still slow</span></div></div>
      <div class="rm-item rm-done" data-target="ai-task"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Tasks</span><span class="rm-sub">scheduling work to run alongside</span></div></div>
      <div class="rm-item rm-done" data-target="ai-gather"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">gather, as_completed and TaskGroup</span><span class="rm-sub">running many tasks and handling failures</span></div></div>
      <div class="rm-item rm-done" data-target="ai-timeout"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Timeouts and Cancellation</span><span class="rm-sub">giving up cleanly</span></div></div>
      <div class="rm-item rm-done" data-target="ai-sem"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Limiting Concurrency with a Semaphore</span><span class="rm-sub">at most n requests in flight</span></div></div>
      <div class="rm-item rm-done" data-target="ai-with"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">async with, async for and Async Generators</span><span class="rm-sub">resources and streams that wait</span></div></div>
      <div class="rm-item rm-done" data-target="ai-block"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Blocking the Event Loop</span><span class="rm-sub">the one rule you must not break</span></div></div>
      <div class="rm-item rm-done" data-target="ai-exec"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">to_thread and run_in_executor</span><span class="rm-sub">blocking calls and computing from async code</span></div></div>
      <div class="rm-item rm-done" data-target="ai-http"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Async HTTP with httpx and aiohttp</span><span class="rm-sub">one client, a limit, error handling</span></div></div>
      <div class="rm-item rm-done" data-target="ai-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">missing await, nested run, races</span></div></div>
      <div class="rm-item rm-done" data-target="ai-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">API, rules, comparison tables</span></div></div>
      <div class="rm-item rm-done" data-target="ai-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">coroutines, the loop, tasks, design</span></div></div>
    </div>
  </div>

  <h2 id="ai-idea"><span class="num">01</span>One Thread, Many Waits</h2>
  <p>Think about a good waiter in a busy restaurant. The waiter takes an order at table 1, hands the ticket to the kitchen, and then, instead of standing at the kitchen door until that dish is ready, goes to table 2 to take the next order, then table 3. When the kitchen rings the bell for table 1's dish, the waiter carries it out and carries on. One person keeps twenty tables happy, because most of each table's time is spent waiting for the kitchen, and the waiter never waits with them. The waiter is not doing two things at the same instant; they are simply never idle while there is something else to do.</p>
  <p>asyncio works exactly like that waiter. A program that makes network requests spends most of its time waiting for replies. With ordinary code, that waiting blocks the whole program. With asyncio, a function that has to wait says so with the keyword <code>await</code>, which means "I cannot continue until this is ready, so let something else run". Control goes back to a scheduler called the <strong>event loop</strong>, which picks another task that is ready to run, and later resumes the waiting function when its reply has arrived. Functions that can pause and resume like this are called <strong>coroutines</strong>. All of it happens on a single thread: there is only ever one waiter.</p>
  <p>Here is the helper module used throughout the concurrency pages. On this page the important pair is <code>fetch_menu</code> and <code>fetch_menu_async</code>: both simulate asking a restaurant's server for its menu and waiting 0.2 seconds for the reply. The first waits with the ordinary <code>time.sleep(...)</code>; the second waits with <code>await asyncio.sleep(...)</code>. The difference between those two lines is what most of asyncio is about.</p>
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
rider 1 best route: 40 in 0.30s</div>
  <p>Before explaining any of the syntax, here is the payoff. The program below fetches all 20 menus the ordinary way, one at a time, and then with asyncio, and also checks how many threads are running during the asyncio version:</p>
  <div class="fx" data-lang="py">import asyncio, threading, time
from workload import RESTAURANTS, fetch_menu, fetch_menu_async

t = time.perf_counter()
menus = [fetch_menu(r) for r in RESTAURANTS]                # ordinary code: one at a time
print(f"one at a time: {sum(m['dishes'] for m in menus)} dishes in {time.perf_counter() - t:.2f}s")

async def main():
    menus = await asyncio.gather(*(fetch_menu_async(r) for r in RESTAURANTS))
    print(f"threads running right now: {threading.active_count()}")
    return menus

t = time.perf_counter()
menus = asyncio.run(main())                                 # asyncio: all 20 waits together
print(f"asyncio:       {sum(m['dishes'] for m in menus)} dishes in {time.perf_counter() - t:.2f}s")</div>
  <div class="fx" data-lang="text">one at a time: 100 dishes in 4.00s
threads running right now: 1
asyncio:       100 dishes in 0.20s</div>
  <p>The ordinary version took 4 seconds, twenty waits of 0.2 seconds laid end to end. The asyncio version took about 0.2 seconds, the time of a single wait, because all twenty waits happened at the same time, and it did so with just <strong>one</strong> thread running. That is the whole promise of asyncio: overlapping many waits without the cost of many threads. The rest of this page explains how it works and how to use it safely.</p>
  <figure class="viz"><svg viewBox="0 0 590 200" width="590">
    <defs><marker id="ai-ah3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="180" height="50" rx="8" class="fb sb"/><text x="24" y="42">Ready queue</text><text x="24" y="60" class="tm">tasks able to run</text>
    <rect x="390" y="20" width="190" height="50" rx="8" class="fg sg"/><text x="402" y="42">Run one task</text><text x="402" y="60" class="tm">until it reaches await</text>
    <rect x="170" y="135" width="250" height="50" rx="8" class="fs"/><text x="184" y="157">Waiting</text><text x="184" y="175" class="tm">sockets, timers (OS tells the loop)</text>
    <line x1="190" y1="45" x2="386" y2="45" stroke="currentColor" stroke-width="1.5" marker-end="url(#ai-ah3)"/><text x="245" y="38" class="tm">pick next</text>
    <line x1="480" y1="70" x2="400" y2="132" stroke="currentColor" stroke-width="1.5" marker-end="url(#ai-ah3)"/><text x="455" y="112" class="tm">await I/O</text>
    <line x1="200" y1="133" x2="110" y2="73" stroke="currentColor" stroke-width="1.5" marker-end="url(#ai-ah3)"/><text x="10" y="140" class="tm">reply ready</text><text x="10" y="156" class="tm">→ wake</text>
  </svg><figcaption>The event loop cycles on one thread: take a ready task, run it until it awaits something that is not ready yet, park it in Waiting, and move it back to Ready when the operating system reports that its network reply or timer has arrived.</figcaption></figure>
  <p>Follow the arrows in the figure. The loop keeps a queue of tasks that are ready to run. It takes one and runs it until it reaches an <code>await</code> on something that is not ready, such as a reply that has not arrived. That task is parked in the waiting area, and the loop asks the operating system to tell it when the reply comes in (operating systems have efficient ways of watching thousands of network connections at once, with names like epoll, kqueue and IOCP). Meanwhile the loop picks the next ready task. When the reply arrives, the parked task moves back to the ready queue, and when its turn comes it resumes exactly where it stopped. This style is called <strong>cooperative multitasking</strong>: each task decides for itself when to give up control, by awaiting. Threads use <strong>preemptive multitasking</strong> instead, where the operating system can interrupt a thread at almost any moment.</p>
  <table class="tbl"><caption>Threads vs asyncio for waiting work</caption>
    <tr><th></th><th>Threads</th><th>asyncio</th></tr>
    <tr><td>Who decides when to switch</td><td>the operating system, at almost any moment (preemptive)</td><td>the task itself, only at <code>await</code> (cooperative)</td></tr>
    <tr><td>Cost per waiting task</td><td>an OS thread with its own stack</td><td>a small Python object (kilobytes)</td></tr>
    <tr><td>Shared data</td><td>needs locks</td><td>safe between two awaits</td></tr>
    <tr><td>Libraries</td><td>any (requests, ordinary database drivers)</td><td>must be async (httpx, aiohttp, asyncpg) or wrapped</td></tr>
    <tr><td>Main danger</td><td>race conditions, deadlocks</td><td>one blocking call freezes everything</td></tr>
  </table>
  <p>One thing asyncio does <em>not</em> do is make code faster in general. It does not speed up any single request, and it does nothing at all for calculation, because everything runs on one thread. It only stops the program sitting idle while it waits.</p>

  <h2 id="ai-coro"><span class="num">02</span>Coroutines: async def and await</h2>
  <p>A function defined with <code>async def</code> is a <strong>coroutine function</strong>. The first surprise is that calling it does <strong>not</strong> run its body. Instead it returns a <strong>coroutine object</strong>: the function frozen just before its first line, waiting for something to drive it forward. Under the hood, the event loop drives a coroutine with a method called <code>send(None)</code>, the same method that resumes generators (<a class="xref" data-note="py_iterators">Iterators &amp; Generators</a>). To see what the loop does, we can call <code>send</code> by hand:</p>
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
  <p>Line 1 printed before the body had run at all: calling <code>count_dishes("R01")</code> only created the coroutine. The first <code>send(None)</code> ran the body all the way to its <code>return</code>. A finished coroutine signals that it is done by raising <code>StopIteration</code>, with the return value stored in the exception's <code>.value</code>, exactly as a generator does. <code>asyncio.run</code> does all of this for us: it drives the coroutine and hands back the return value.</p>
  <p>That coroutine never paused. The interesting part is what happens at an <code>await</code> on something that is not ready. <code>await asyncio.sleep(0)</code> is the simplest possible pause point: it gives up control once, then continues. Here it stands in for "send the request, then wait for the reply":</p>
  <div class="fx" data-lang="py">import asyncio

async def fetch(rid):
    print(f"   sending request for {rid}")
    await asyncio.sleep(0)                     # a pause point: control goes back to the caller
    print(f"   resumed: reply for {rid} arrived")
    return {"id": rid, "dishes": 4}

c = fetch("R01")
print("send #1 returned:", c.send(None))       # runs up to the pause, then hands back control
try:
    c.send(None)                               # resumes after the pause, runs to the end
except StopIteration as stop:
    print("send #2 finished with:", stop.value)</div>
  <div class="fx" data-lang="text">   sending request for R01
send #1 returned: None
   resumed: reply for R01 arrived
send #2 finished with: {'id': 'R01', 'dishes': 4}</div>
  <p>The first <code>send</code> ran the coroutine up to its <code>await</code>, and then control came back to us, with the coroutine frozen in the middle. The second <code>send</code> resumed it right after the <code>await</code>, with its local variables intact, and ran it to the end. This is the whole mechanism of asyncio. An <code>await</code> on something not yet ready pauses the coroutine and passes control back up to whoever called <code>send</code>. In a real program, that is the event loop, which then drives some other coroutine and comes back to this one when its timer or network reply is ready.</p>
  <p>The thing after <code>await</code> must be an <strong>awaitable</strong>: a coroutine, a Task, a Future (all explained below), or any object with an <code>__await__</code> method. And <code>await</code> is only allowed inside an <code>async def</code> function (plus, as a convenience, at the top level of a Jupyter notebook cell or the <code>python -m asyncio</code> interactive prompt).</p>

  <h2 id="ai-await"><span class="num">03</span>asyncio.run and the Sequential await</h2>
  <p>Every asyncio program needs an event loop to drive its coroutines, and <code>asyncio.run(main())</code> provides one. It creates a new event loop, runs the coroutine <code>main()</code> until it finishes, cancels anything left over, and closes the loop. You call it once, at the program's entry point; everything else happens inside <code>main</code> and the coroutines it awaits. Inside, <code>await x</code> means "run <code>x</code>, and pause me until it has finished". Here is the most natural first attempt at fetching all the menus with it:</p>
  <div class="fx" data-lang="py">import asyncio, time
from workload import RESTAURANTS, fetch_menu_async

async def main():
    t = time.perf_counter()
    menus = []
    for rid in RESTAURANTS:
        menus.append(await fetch_menu_async(rid))   # wait for THIS one before starting the next
    print(f"awaited one by one: {sum(m['dishes'] for m in menus)} dishes in {time.perf_counter() - t:.2f}s")

asyncio.run(main())                            # start the loop, run main() to the end, close it</div>
  <div class="fx" data-lang="text">awaited one by one: 100 dishes in 4.05s</div>
  <p>About 4 seconds, no faster than the ordinary sequential loop. Each <code>await</code> did pause <code>main</code>, so the loop was free to run something else, but <strong>there was nothing else to run</strong>: the second request had not even been created yet, because the <code>for</code> loop only gets to it after the first one finishes. It is a waiter who takes table 1's order, hands it to the kitchen, and then, with no other orders taken, has nothing to do but wait. Pausing is necessary for concurrency, but it is not enough. There must also be other tasks ready to use the pause, and creating those is the job of <code>create_task</code> and <code>gather</code>. This "loop of awaits" is the most common reason people find their async code is not faster; it is perfectly correct, just sequential.</p>

  <h2 id="ai-task"><span class="num">04</span>Tasks</h2>
  <p>To get several requests in flight at once, each one must be handed to the event loop as an independent piece of work. <code>asyncio.create_task(coro)</code> does this: it wraps a coroutine in a <strong>Task</strong>, puts it in the loop's ready queue, and returns immediately. A Task is a coroutine that the loop runs on its own, independently of whoever created it. There is one subtlety: the task does not start running the instant you create it, because only one thing runs at a time on the single thread, and that thing is still the code that called <code>create_task</code>. The task starts the next time that code pauses at an <code>await</code>. In the restaurant, <code>create_task</code> is the waiter writing a ticket and clipping it onto the kitchen rail; the kitchen picks it up as soon as it gets the chance.</p>
  <p>The program below fetches two menus, one taking 0.3 seconds and the other 0.2, first by awaiting them one after the other (part A) and then as two tasks (part B). Each line shows the time since the start:</p>
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
  <table class="tbl"><caption>Part B traced (everything on one thread)</caption>
    <tr><th>Time</th><th>main</th><th>t1 (0.3 s)</th><th>t2 (0.2 s)</th></tr>
    <tr><td>0.5</td><td>creates t1 and t2; prints "still running"; <code>await t1</code> pauses main</td><td>loop starts it: sends, waits</td><td>loop starts it: sends, waits</td></tr>
    <tr><td>0.7</td><td>(waiting for t1)</td><td>(waiting)</td><td>reply arrives, done</td></tr>
    <tr><td>0.8</td><td>resumes with "R01"; <code>await t2</code> is already done, so no wait</td><td>reply arrives, done</td><td></td></tr>
  </table>
  <p>Part A took 0.3 + 0.2 = 0.5 seconds, because the second request was not sent until the first had finished. Part B took only 0.3 seconds, the time of the longer request, because both waits overlapped. Look at the order of the lines in part B: "both tasks created; main is still running" was printed <em>before</em> either request was sent. That confirms that <code>create_task</code> only schedules a task; the tasks actually started when <code>main</code> paused at <code>await t1</code>, and from then on the loop ran them alongside each other.</p>
  <p>A Task is a kind of <strong>Future</strong>, an object that stands for a result that will exist later, like the numbered receipt you get at a takeaway counter. <code>await task</code> waits for the result; <code>task.done()</code> checks whether it is ready; <code>task.result()</code> gets it once it is; <code>task.cancel()</code> asks it to stop; <code>task.add_done_callback(fn)</code> runs a function when it finishes. One important rule: keep a reference to every task you create. The event loop holds only a weak reference to tasks, so a task created with <code>asyncio.create_task(send_email())</code> and never stored anywhere can be cleaned up by the garbage collector while it is still running, and any exception it raises is never seen. Store tasks in a variable or a set, or use a TaskGroup (next section), which keeps them for you.</p>

  <h2 id="ai-gather"><span class="num">05</span>gather, as_completed and TaskGroup</h2>
  <p>Creating and awaiting tasks one by one gets tedious with twenty requests. For the very common job "run all of these and give me all the results", there is <code>await asyncio.gather(c1, c2, …)</code>. It wraps each coroutine in a task, waits until all of them have finished, and returns their results as a list <strong>in the same order as the arguments</strong>, however they finished. The demo below also uses <code>flaky</code>, a fetch that fails for restaurant R13, to show what happens when one of the tasks raises an exception:</p>
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
  <p>There are four things to see. First, all twenty requests finished in about 0.2 seconds, with the results in input order (R01, R02, R03 …). Second, with <code>return_exceptions=True</code>, R13's exception was placed in the result list like an ordinary value, and the good results on either side were kept. Third, without that option, the first exception is raised out of <code>gather</code> and you lose all the other results; worse, the other tasks are <em>not</em> stopped and keep running in the background where nobody is watching them. Fourth, <code>asyncio.as_completed</code> hands results back in the order they <em>finish</em>, which lets you deal with fast results first; here both requests take 0.2 seconds, so the order is decided by small timing differences.</p>
  <p>That third behaviour is a real problem for work that should stop as a whole when part of it fails. Python 3.11 added a safer tool, the <strong>TaskGroup</strong>. It is used as an <code>async with</code> block that owns the tasks created inside it: the block does not finish until all of them have finished, and if any of them fails, the group <strong>cancels all the others</strong> and then raises the errors together as an <code>ExceptionGroup</code>, which you catch with <code>except*</code>. Below, R01 succeeds quickly, R13 fails after 0.2 seconds, and R20 would take a full second:</p>
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
  <p>R01 finished at 0.1 seconds. When R13 failed at 0.2 seconds, the group immediately cancelled R20, which still had 0.8 seconds to go (R20 printed "cancelled" from its own <code>except</code> block, then re-raised, as every task should), and then raised R13's error. When the block ended, nothing was left running. This guarantee, that no task outlives the block that started it, is called <strong>structured concurrency</strong>, and it makes errors and cancellation predictable. Plain <code>create_task</code> and <code>gather</code> do not give it.</p>
  <table class="tbl">
    <tr><th>Tool</th><th>Result order</th><th>If a task fails</th><th>Use when</th></tr>
    <tr><td><code>gather(*aws)</code></td><td>input order</td><td>first error raised; the others keep running</td><td>simple fan-out where failure is unlikely</td></tr>
    <tr><td><code>gather(…, return_exceptions=True)</code></td><td>input order</td><td>errors returned as values</td><td>batches that should tolerate failures</td></tr>
    <tr><td><code>as_completed(aws)</code></td><td>finish order</td><td>raised when you await that one</td><td>handling fast results first</td></tr>
    <tr><td><code>TaskGroup</code></td><td>keep the task objects</td><td>the rest are cancelled; <code>ExceptionGroup</code> raised</td><td>all-or-nothing work; the safe default in 3.11+</td></tr>
    <tr><td><code>wait(aws, return_when=…)</code></td><td><code>(done, pending)</code> sets</td><td>you inspect each</td><td>"first completed" or "first exception" logic</td></tr>
  </table>

  <h2 id="ai-timeout"><span class="num">06</span>Timeouts and Cancellation</h2>
  <p>A network request can hang for a very long time, so real code needs a way to give up. In asyncio, giving up is done by <strong>cancellation</strong>: the loop throws a special exception, <code>asyncio.CancelledError</code>, into the coroutine at the <code>await</code> where it is currently paused. Because it arrives as an ordinary exception, all the usual cleanup runs, including <code>finally</code> blocks and the exit of <code>with</code> and <code>async with</code> blocks. A <strong>timeout</strong> is built on top of cancellation: when the time is up, the awaited work is cancelled, and the cancellation is turned into a <code>TimeoutError</code> for the code that set the timeout. Every request below needs 0.2 seconds, and <code>careful_fetch</code> prints a line from its <code>finally</code> block so we can see the cleanup run:</p>
  <div class="fx" data-lang="py">import asyncio
from workload import fetch_menu_async

async def careful_fetch(rid):
    try:
        return await fetch_menu_async(rid)       # needs 0.2 s
    finally:
        print(f"   cleanup for {rid} ran")        # runs on success, error or cancellation

async def main():
    try:
        async with asyncio.timeout(0.1):         # Python 3.11+
            await careful_fetch("R01")
    except TimeoutError:
        print("1. asyncio.timeout: gave up after 0.1 s")

    try:
        await asyncio.wait_for(careful_fetch("R02"), timeout=0.1)   # the older form
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
  <p>In every case the <code>finally</code> block ran before control came back: when <code>asyncio.timeout(0.1)</code> gave up (1), when the older <code>asyncio.wait_for(…, timeout=0.1)</code> gave up (2), when the task was cancelled directly with <code>task.cancel()</code> (3), and when the request succeeded within its time limit (4). <code>asyncio.timeout</code> is the context-manager form added in 3.11 and is usually the more readable; <code>wait_for</code> is the older function form. Since 3.11, <code>asyncio.TimeoutError</code> is simply the built-in <code>TimeoutError</code>.</p>
  <p>This mechanism has one rule you must never break: if you catch <code>CancelledError</code>, you must re-raise it. A coroutine that catches it and carries on refuses to be cancelled, so timeouts stop working, TaskGroups wait forever, and the program cannot shut down. Put cleanup code in <code>finally</code>, as above, and you will rarely need to catch <code>CancelledError</code> at all. (Since Python 3.8 it inherits from <code>BaseException</code> rather than <code>Exception</code>, so an ordinary <code>except Exception:</code> does not swallow it by accident.) If one inner operation must finish even when its caller is cancelled, <code>asyncio.shield(aw)</code> protects it.</p>

  <h2 id="ai-sem"><span class="num">07</span>Limiting Concurrency with a Semaphore</h2>
  <p>Being able to start ten thousand requests at once is not always a good thing. Most real APIs limit how many requests a client may have in flight, and firing everything at once can get you rate-limited, banned, or run your machine out of network connections. You need a way to say "at most 5 at a time". That tool is a <strong>semaphore</strong>: a counter that starts at <em>n</em>; each task entering <code>async with slots:</code> decreases it, and when it is zero the next task pauses at that line until someone leaves. It is like a restaurant with 5 tables and a host at the door: when all tables are full, new guests wait in the lobby until a table frees up. <code>asyncio.Semaphore</code> is the asyncio version of the threading semaphore; waiting for it is an <code>await</code>, so the other tasks keep running.</p>
  <div class="fx" data-lang="py">import asyncio, time
from workload import RESTAURANTS, fetch_menu_async

inside = peak = 0
async def polite_fetch(slots, rid):
    global inside, peak
    async with slots:                            # wait here while 5 requests are in flight
        inside += 1; peak = max(peak, inside)    # safe: no await between read and write
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
  <p>All 100 dishes arrived, the number of requests in flight never went above 5, and the time follows a simple rule: 20 requests, 5 at a time, is ⌈20 ÷ 5⌉ = 4 rounds of 0.2 seconds, about 0.8 seconds (⌈ ⌉ means "round up"). Notice also that <code>inside += 1</code> needs no lock here, even though every task changes it. With threads, that read-add-write could be interrupted halfway; with asyncio, a task can only lose control at an <code>await</code>, and there is no <code>await</code> between reading <code>inside</code> and writing it back. (Section 12 shows the case where a lock <em>is</em> needed.)</p>

  <h2 id="ai-with"><span class="num">08</span>async with, async for and Async Generators</h2>
  <p>Ordinary Python has two protocols that cannot wait. A <code>with</code> block calls the methods <code>__enter__</code> and <code>__exit__</code> (see <a class="xref" data-note="py_context">Context Managers</a>), and a <code>for</code> loop calls <code>__next__</code> to get each item. None of these can contain an <code>await</code>, which is a problem when opening a connection, closing it politely, or fetching the next page of results involves a network round trip. asyncio adds async versions of both. <code>async with x:</code> awaits <code>x.__aenter__()</code> on the way in and <code>x.__aexit__(…)</code> on the way out, and <code>@asynccontextmanager</code> lets you write such an object as a generator with a single <code>yield</code>. An <code>async def</code> function that contains <code>yield</code> is an <strong>async generator</strong>; it can await between the items it produces, and you loop over it with <code>async for</code>.</p>
  <p>The example builds a small client in both styles and adds an async generator that fetches menus a page at a time, three restaurants per page:</p>
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
async def client():                              # the same thing, written as a generator
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
  <p>The <code>Client</code> class opened and closed its "connection" with awaits inside <code>__aenter__</code> and <code>__aexit__</code>, and the generator-style <code>client()</code> did the same with less code. The async generator <code>pages</code> fetched each page only when the <code>async for</code> loop asked for it, fetching the three menus within a page concurrently with <code>gather</code>, so the pages came out as R01–R03 and then R04–R05. The last line shows an <strong>async comprehension</strong>, <code>[… async for …]</code>, which builds a list from an async generator. This is exactly the shape of paginated API clients and streaming consumers, such as <code>async for message in consumer:</code> when reading from a message queue.</p>
  <table class="tbl">
    <tr><th>Ordinary</th><th>Async</th><th>What Python calls</th></tr>
    <tr><td><code>with m as x:</code></td><td><code>async with m as x:</code></td><td><code>await m.__aenter__()</code>, <code>await m.__aexit__(t, e, tb)</code></td></tr>
    <tr><td><code>@contextmanager</code></td><td><code>@asynccontextmanager</code></td><td>an async generator with one <code>yield</code></td></tr>
    <tr><td><code>for x in it:</code></td><td><code>async for x in ait:</code></td><td><code>ait.__aiter__()</code>, <code>await ait.__anext__()</code>, ends with <code>StopAsyncIteration</code></td></tr>
    <tr><td>generator (<code>def</code> + <code>yield</code>)</td><td>async generator (<code>async def</code> + <code>yield</code>)</td><td>may <code>await</code> between yields</td></tr>
  </table>
  <p>Mixing them up gives clear errors: using plain <code>with</code> on an async-only resource raises a <code>TypeError</code> saying the object does not support the context manager protocol, and a plain <code>for</code> over an async generator raises <code>TypeError: 'async_generator' object is not iterable</code>.</p>

  <h2 id="ai-block"><span class="num">09</span>Blocking the Event Loop</h2>
  <p>Everything so far rests on one assumption: tasks give control back to the loop often, at their <code>await</code>s. The loop and every task share a single thread, and a coroutine only gives that thread back when it awaits. So a call that <strong>blocks</strong>, meaning it does not return until its work is done and never awaits, keeps the thread for itself, and nothing else runs until it returns. In the restaurant, it is the waiter deciding to stand at the kitchen door after all: every other table waits too. Here are five gathered calls written correctly with <code>await asyncio.sleep</code>, and incorrectly with the ordinary <code>time.sleep</code>:</p>
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
  <p>The <code>bad</code> version looks concurrent, since it uses <code>async def</code> and <code>gather</code>, but each call held the thread for its full 0.2 seconds, so the five calls ran one after another: 5 × 0.2 = 1 second. The same thing happens with any blocking library inside an <code>async def</code>, including <code>requests.get</code>, ordinary database drivers such as <code>psycopg2</code>, the AWS library <code>boto3</code>, and most plain file reading.</p>
  <p>Long calculations block in exactly the same way, because they never await either. Below, a "heartbeat" task prints a tick every 0.1 seconds, standing in for all the other requests a web server would be handling, and in the middle a route calculation runs directly inside a coroutine:</p>
  <div class="fx" data-lang="py">import asyncio, time
from workload import RIDERS, route_cost

T0 = time.perf_counter()
async def heartbeat():                           # stands in for every other task on the loop
    while True:
        print(f"   tick {time.perf_counter() - T0:.1f}s")
        await asyncio.sleep(0.1)

async def plan_route():
    print(f"compute start {time.perf_counter() - T0:.1f}s")
    cost = route_cost(RIDERS[0])                 # CPU work with no await: the loop is stuck
    print(f"compute done  {time.perf_counter() - T0:.1f}s, cost {cost}")

async def main():
    hb = asyncio.create_task(heartbeat())
    await asyncio.sleep(0.25)
    await plan_route()
    await asyncio.sleep(0.25)
    hb.cancel()

asyncio.run(main())</div>
  <div class="fx" data-lang="text">   tick 0.0s
   tick 0.1s
   tick 0.2s
compute start 0.3s
compute done  0.6s, cost 40
   tick 0.6s
   tick 0.7s
   tick 0.8s</div>
  <p>The ticks stop while the calculation runs: the ticks that should have appeared in that gap never happen, and they only resume once the calculation has finished. In a web server, that gap is every other user's request frozen for the whole duration. If you suspect something is blocking your loop, run it with <code>asyncio.run(main(), debug=True)</code>, which logs any step that holds the thread for longer than 0.1 seconds.</p>
  <p>The rule that follows is the most important one on this page: <strong>never block the event loop</strong>. Inside <code>async def</code>, wait only with <code>await</code>, use async libraries for network and database access, and move any unavoidable blocking call or heavy calculation off the loop's thread, as the next section shows. A common place to get this wrong is a FastAPI <code>async def</code> endpoint that calls <code>requests.get</code>: every request to the server queues behind it. Either use an async client, or declare the endpoint with a plain <code>def</code>, which tells FastAPI to run it in a thread pool (<a class="xref" data-note="api_fastapi">FastAPI</a>).</p>

  <h2 id="ai-exec"><span class="num">10</span>to_thread and run_in_executor</h2>
  <p>Sometimes the only library available for a job is a blocking one, or a step really does need heavy calculation. You cannot run it directly on the loop, but you can hand it to a helper and await the result. Think of the waiter passing a complicated order to a sous-chef and carrying on with the tables until it is done.</p>
  <p>For blocking calls, the helper is a thread. <code>asyncio.to_thread(f, *args)</code> runs <code>f(*args)</code> in a thread from the loop's default thread pool (a <code>ThreadPoolExecutor</code>, see <a class="xref" data-note="py_threading">Threads &amp; the GIL</a>) and returns something you can await. While the thread waits, the loop is free. Here is the <em>blocking</em> <code>fetch_menu</code>, run 20 times this way:</p>
  <div class="fx" data-lang="py">import asyncio, os, time
from workload import RESTAURANTS, fetch_menu       # the BLOCKING version

async def main():
    t = time.perf_counter()
    menus = await asyncio.gather(*(asyncio.to_thread(fetch_menu, r) for r in RESTAURANTS))
    print(f"to_thread, default pool: {sum(m['dishes'] for m in menus)} dishes in {time.perf_counter() - t:.2f}s")

asyncio.run(main())
print("default thread-pool size here = min(32, cores + 4) =", min(32, (os.cpu_count() or 1) + 4))</div>
  <div class="fx" data-lang="text">to_thread, default pool: 100 dishes in 0.60s
default thread-pool size here = min(32, cores + 4) = 8</div>
  <p>About 0.6 seconds rather than 0.2. The default thread pool on this 4-core machine has 8 threads, so the 20 blocking calls ran 8 at a time: ⌈20 ÷ 8⌉ = 3 rounds of 0.2 seconds. The loop itself stayed free the whole time. If you need more blocking calls in flight at once, create your own larger <code>ThreadPoolExecutor</code> and pass it to <code>loop.run_in_executor</code>, described next.</p>
  <p>For calculation, a thread does not help: the GIL lets only one thread run Python code at a time, so a computing thread would keep the loop responsive but would not finish any faster. The helper must be a <strong>process pool</strong> (<a class="xref" data-note="py_multiprocessing">Processes</a>), and the way to use one from asyncio is <code>await loop.run_in_executor(pool, fn, *args)</code>, which works with any thread or process pool. Below, the 4 riders' routes are sent to 4 worker processes while the loop fetches the 20 menus, and the heartbeat shows whether the loop ever freezes:</p>
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
    cpu_futs = [loop.run_in_executor(pool, route_cost, s) for s in RIDERS]     # computing -&gt; processes
    menus = await asyncio.gather(*(fetch_menu_async(r) for r in RESTAURANTS)) # waiting -&gt; the loop
    print(f"menus done at {time.perf_counter() - T0:.1f}s: {sum(m['dishes'] for m in menus)} dishes")
    costs = await asyncio.gather(*cpu_futs)
    print(f"routes done at {time.perf_counter() - T0:.1f}s: {costs}")
    hb.cancel()

if __name__ == "__main__":
    with ProcessPoolExecutor(max_workers=4) as pool:
        asyncio.run(main(pool))</div>
  <div class="fx" data-lang="text">   tick 0.0s
   tick 0.1s
   tick 0.2s
menus done at 0.2s: 100 dishes
   tick 0.3s
routes done at 0.3s: [40, 36, 35, 36]</div>
  <p>The heartbeat kept ticking throughout, so the loop never froze. The menus were finished at 0.2 seconds while the worker processes were still computing, and the routes arrived a little later. Both jobs, which take about five seconds one after another, finished in about the time of the slower one. The process pool is created under <code>if __name__ == "__main__":</code> because it starts processes (the reason is explained on the Processes page), and the function and arguments sent to it must be picklable.</p>
  <div class="flow"><span>event loop (1 thread)</span><span>menus: await, ≈ 0.2 s</span><span>heartbeat keeps ticking</span><span>run_in_executor → 4 processes</span><span>routes: a little later</span></div>
  <p>To summarise the two tools: <code>asyncio.to_thread(func, *args, **kwargs)</code> (Python 3.9+) is the convenient way to run a blocking function in the default thread pool. <code>loop.run_in_executor(executor, func, *args)</code> accepts any executor, including your own thread pool or a process pool, but takes only positional arguments, so use <code>functools.partial</code> for keyword arguments. The rule of thumb: <strong>blocking I/O goes to a thread pool; CPU-heavy work goes to a process pool.</strong></p>

  <h2 id="ai-http"><span class="num">11</span>Async HTTP with httpx and aiohttp</h2>
  <p>So far the network has been simulated with <code>asyncio.sleep</code>. Real HTTP requests need an async HTTP library, and the two most popular are <strong>httpx</strong> and <strong>aiohttp</strong> (<code>pip install httpx aiohttp</code>). Using them well takes three things beyond <code>gather</code>. First, <strong>one shared client</strong> for many requests: opening a network connection, and especially a secure (TLS) one, takes several round trips, and a client keeps a pool of open connections that it reuses. Second, <strong>a semaphore</strong> to limit how many requests are in flight. Third, <strong>error handling</strong>, so that one bad response does not lose the whole batch. To keep the example runnable without the internet, the script first starts a tiny local web server on the same event loop, where every request takes 0.2 seconds and <code>/menu/R99</code> returns a 404 "not found" error, and then fetches the 20 menus with each library:</p>
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
        r.raise_for_status()                     # 4xx/5xx replies become exceptions
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
    async with httpx.AsyncClient() as client:    # ONE client, reused: a connection pool
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
  <div class="fx" data-lang="text">httpx  : 100 dishes in 0.45s
httpx with a bad id: ['R01', 'HTTPStatusError']
aiohttp: 100 dishes in 0.41s</div>
  <p>With at most 10 requests in flight, 20 requests need ⌈20 ÷ 10⌉ = 2 rounds of 0.2 seconds, about 0.4 seconds, and both libraries came in close to that (opening the connections during the first round adds a little). The request for R99 got a 404 reply; <code>raise_for_status()</code> turned it into an <code>httpx.HTTPStatusError</code> exception, and because of <code>return_exceptions=True</code> the good result for R01 was kept next to it. Both clients are used with <code>async with</code>, so their connection pools are closed properly at the end. The two APIs differ only in small details: with httpx, <code>await client.get(…)</code> returns the whole response; with aiohttp, <code>session.get(…)</code> is itself an async context manager, and the body is read with <code>await r.json()</code>.</p>
  <p>For production code, add per-request timeouts, and retry temporary failures (such as 429 "too many requests" or 5xx server errors) after waiting a little longer each time, which is called <strong>exponential back-off</strong>. And avoid the two classic mistakes: creating a new client for every request, which pays the connection set-up every time, and gathering ten thousand requests with no semaphore, which leads to rate limits, mass timeouts and running out of network sockets.</p>

  <h2 id="ai-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The most common asyncio bug is forgetting <code>await</code>. Because calling a coroutine function only creates a coroutine object, leaving out <code>await</code> gives you that object instead of a result, and the request never runs:</p>
  <div class="fx" data-lang="py">import asyncio
from workload import fetch_menu_async

async def main():
    result = fetch_menu_async("R01")             # MISTAKE: forgot await
    print("got:", result)
    print("fixed:", await fetch_menu_async("R01"))

asyncio.run(main())</div>
  <div class="fx" data-lang="text">got: &lt;coroutine object fetch_menu_async at 0x7f3a1c2b5e40&gt;
fixed: {'id': 'R01', 'dishes': 4}
/usr/local/lib/python3.13/asyncio/events.py:89: RuntimeWarning: coroutine 'fetch_menu_async' was never awaited
  self._context.run(self._callback, *self._args)
RuntimeWarning: Enable tracemalloc to get the object allocation traceback</div>
  <p>There is no error at the point of the mistake: <code>result</code> is simply a coroutine object that never ran. Python only notices later, when the unused coroutine is cleaned up, and prints a <code>RuntimeWarning</code> saying the coroutine "was never awaited". That warning always means a missing <code>await</code> somewhere.</p>
  <p>The second is calling <code>asyncio.run</code> from code that is already running inside an event loop. Only one loop may run in a thread at a time, so <code>asyncio.run</code> refuses:</p>
  <div class="fx" data-lang="py">import asyncio
from workload import fetch_menu_async

async def main():
    coro = fetch_menu_async("R01")
    try:
        asyncio.run(coro)                        # MISTAKE: a loop is already running here
    except RuntimeError as e:
        print("RuntimeError:", e)
        coro.close()                             # tidy up the coroutine that never ran
    print("inside a running loop, just await:", await fetch_menu_async("R01"))

asyncio.run(main())</div>
  <div class="fx" data-lang="text">RuntimeError: asyncio.run() cannot be called from a running event loop
inside a running loop, just await: {'id': 'R01', 'dishes': 4}</div>
  <p>Inside async code there is no need for <code>asyncio.run</code>; just <code>await</code> the coroutine. The same error appears in Jupyter notebooks, because the notebook itself already runs an event loop; there, write <code>await main()</code> directly at the top level of a cell.</p>
  <p>The third is believing asyncio has no race conditions at all. It is true that code between two <code>await</code>s cannot be interrupted, which is why the semaphore example needed no lock. But a read-modify-write that has an <code>await</code> in the <em>middle</em> can be interleaved, because other tasks run during that pause. Here five tasks each withdraw 10 from a balance of 100, with a short await between reading the balance and writing the new value:</p>
  <div class="fx" data-lang="py">import asyncio

balance = 100
lock = asyncio.Lock()

async def withdraw(amount, use_lock):
    global balance
    async def body():
        global balance
        current = balance
        await asyncio.sleep(0.01)                # an await between the read and the write
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
  <p>Without a lock the balance ended at 90 instead of 50: all five tasks read 100 before any of them wrote, so four withdrawals were lost. An <code>asyncio.Lock</code>, used with <code>async with lock:</code>, makes the read, the await and the write happen as one unit. Note that asyncio's locks, events and queues coordinate tasks on one event loop; they are not safe to use from other threads.</p>
  <p>The other mistakes have appeared earlier on the page: a loop of <code>await</code>s that runs sequentially (use <code>gather</code> or a TaskGroup); a blocking call or heavy calculation inside <code>async def</code> that freezes every task (use async libraries, <code>to_thread</code>, or a process pool); tasks created without keeping a reference, which can disappear along with their errors; catching <code>CancelledError</code> without re-raising it, which breaks timeouts and shutdown; plain <code>gather</code> leaving tasks running after a failure; and a new HTTP client per request or no limit on requests in flight. Finally, calling asyncio objects from another thread causes random errors; use <code>asyncio.run_coroutine_threadsafe</code> or <code>loop.call_soon_threadsafe</code> for that. To test async code, call <code>asyncio.run</code> inside a normal test or use pytest-asyncio, and mock async functions with <code>unittest.mock.AsyncMock</code> (see <a class="xref" data-note="py_pytest">pytest</a> and <a class="xref" data-note="py_mocking">Mocking</a>).</p>

  <h2 id="ai-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key definitions</h3>
  <ul>
    <li><b>Event loop</b>: a scheduler on one thread that runs ready tasks until they await, and resumes them when their I/O or timer is ready.</li>
    <li><b>Coroutine function</b>: <code>async def f()</code>. <b>Coroutine</b>: what calling it returns; runs only when awaited, wrapped in a Task, or given to <code>asyncio.run</code>.</li>
    <li><b>Awaitable</b>: a coroutine, Task, Future, or object with <code>__await__</code>.</li>
    <li><b>Task</b>: a coroutine scheduled to run independently on the loop; a kind of <b>Future</b> (a placeholder for a later result).</li>
    <li><b>Cooperative multitasking</b>: tasks switch only at <code>await</code>. <b>Blocking call</b>: does not await, so it freezes every task.</li>
    <li><b>Structured concurrency</b>: no task outlives the block that started it (<code>TaskGroup</code>).</li>
  </ul>
  <h3>Running coroutines</h3>
  <div class="fx" data-lang="py">asyncio.run(main())                            # once, at the entry point
t = asyncio.create_task(coro())                # starts at the next await; keep t
res = await asyncio.gather(*coros)             # input order
res = await asyncio.gather(*coros, return_exceptions=True)
for f in asyncio.as_completed(coros): await f  # finish order
async with asyncio.TaskGroup() as tg:          # 3.11+: cancel the rest on failure
    tg.create_task(coro())</div>
  <ul>
    <li>A loop of awaits is sequential: 20 × 0.2 s awaited one by one ≈ 4 s; gathered ≈ 0.2 s.</li>
  </ul>
  <h3>Control</h3>
  <ul>
    <li><code>async with asyncio.timeout(s):</code> / <code>await asyncio.wait_for(aw, s)</code> → <code>TimeoutError</code>.</li>
    <li><code>task.cancel()</code> throws <code>CancelledError</code> at the current await; clean up in <code>finally</code>; always re-raise.</li>
    <li><code>asyncio.Semaphore(n)</code>: at most n in flight; time ≈ ⌈tasks ÷ n⌉ × latency (20 × 0.2 s, n = 5 → 0.8 s).</li>
    <li><code>asyncio.Lock</code> only when a read-modify-write spans an <code>await</code>.</li>
    <li><code>async with</code>: <code>__aenter__</code>/<code>__aexit__</code>, <code>@asynccontextmanager</code>. <code>async for</code>: <code>__aiter__</code>/<code>__anext__</code>; async generator = <code>async def</code> + <code>yield</code>.</li>
  </ul>
  <h3>Blocking work</h3>
  <table class="tbl">
    <tr><th>Work inside <code>async def</code></th><th>What to do</th><th>Measured</th></tr>
    <tr><td><code>await asyncio.sleep</code> / async I/O</td><td>fine</td><td>5 gathered: 0.2 s</td></tr>
    <tr><td><code>time.sleep</code> / <code>requests</code> / sync DB</td><td><code>await asyncio.to_thread(f, …)</code></td><td>5 gathered done wrongly: 1.0 s</td></tr>
    <tr><td>heavy Python calculation</td><td><code>await loop.run_in_executor(process_pool, f, …)</code></td><td>heartbeat stops while computing on the loop</td></tr>
  </table>
  <ul>
    <li>Default thread pool: <code>min(32, cpu_count + 4)</code> threads (8 here, so 20 blocking calls ≈ 0.6 s).</li>
    <li><code>asyncio.run(main(), debug=True)</code> logs steps slower than 0.1 s.</li>
  </ul>
  <h3>HTTP checklist</h3>
  <ul>
    <li>One <code>httpx.AsyncClient</code> / <code>aiohttp.ClientSession</code>, used with <code>async with</code>.</li>
    <li>A semaphore, per-request timeouts, <code>raise_for_status()</code>, retries with exponential back-off.</li>
  </ul>
  <h3>asyncio vs threads</h3>
  <table class="tbl">
    <tr><th></th><th>Threads</th><th>asyncio</th></tr>
    <tr><td>Switching</td><td>preemptive</td><td>cooperative (<code>await</code>)</td></tr>
    <tr><td>Scale</td><td>tens to hundreds</td><td>thousands and more</td></tr>
    <tr><td>Libraries</td><td>any</td><td>async, or wrapped with <code>to_thread</code></td></tr>
    <tr><td>Locks</td><td>needed for shared data</td><td>only across an await</td></tr>
  </table>
  <h3>Gotchas</h3>
  <ul>
    <li>Missing <code>await</code> → a coroutine object and a "never awaited" warning.</li>
    <li><code>asyncio.run</code> inside a running loop (or in Jupyter) → <code>RuntimeError</code>; just <code>await</code>.</li>
    <li>Unreferenced tasks can be garbage-collected; plain <code>gather</code> leaves tasks running after an error.</li>
    <li>Swallowing <code>CancelledError</code> breaks timeouts and shutdown.</li>
    <li>asyncio objects are not thread-safe.</li>
  </ul>

  <h2 id="ai-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is asyncio and when would you use it?</summary><div class="qa-body">asyncio is the standard-library framework for cooperative concurrency on a single thread: coroutines pause at <code>await</code>, and an event loop runs other ready tasks in the meantime. Use it for I/O-bound work with many waits in progress at once, such as web servers, API clients, websockets and async database access, when async libraries exist. It does not help CPU-bound work.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a coroutine, and what happens when you call an <code>async def</code> function?</summary><div class="qa-body">Calling it returns a coroutine object without running any of its body. The body runs when the coroutine is awaited, wrapped in a Task, or passed to <code>asyncio.run</code>. Internally it is driven like a generator: <code>send(None)</code> runs it to its next pause, and it finishes by raising <code>StopIteration</code> carrying the return value.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the event loop?</summary><div class="qa-body">A scheduler running on one thread. It keeps a queue of ready tasks, runs each until it awaits something that is not ready, registers what it is waiting for (network sockets via the OS's epoll, kqueue or IOCP, and timers), and moves the task back to the ready queue when that completes. <code>asyncio.run</code> creates one, runs your main coroutine, and closes it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Concurrency or parallelism: which does asyncio give?</summary><div class="qa-body">Concurrency only. All coroutines run on one thread, so only one is executing at any instant; the overlap comes from tasks waiting at the same time. For parallel computation you need processes, for example via <code>run_in_executor</code> with a <code>ProcessPoolExecutor</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between cooperative and preemptive multitasking?</summary><div class="qa-body">In preemptive multitasking, used by threads, the operating system can switch threads at almost any moment, so shared data needs locks. In cooperative multitasking, used by asyncio, a task gives up control only at an <code>await</code>, so code between awaits is never interrupted; but a task that never awaits, because it blocks or computes, freezes all the others.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Total time: <code>await f(); await g()</code> vs <code>await asyncio.gather(f(), g())</code>, where each waits 0.2 s?</summary><div class="qa-body">About 0.4 s versus about 0.2 s. Sequential awaits wait for each in turn; <code>gather</code> schedules both as tasks so their waits overlap. In the demos, 20 requests awaited in a loop took about 4 s and gathered took about 0.2 s.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>create_task</code> vs <code>await</code>?</summary><div class="qa-body"><code>await coro</code> runs the coroutine and pauses the caller until it finishes. <code>create_task(coro)</code> schedules it on the loop and returns a Task immediately; the task starts at the caller's next await and runs independently, and you collect its result later with <code>await task</code>. Keep a reference to the task, because the loop holds tasks only weakly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>gather</code> vs <code>TaskGroup</code>?</summary><div class="qa-body"><code>gather</code> returns results in input order; if a task fails it raises the first exception but leaves the other tasks running, unless <code>return_exceptions=True</code>, which returns errors as values. <code>TaskGroup</code> (3.11+) waits for all its tasks when the block exits and, if one fails, cancels the rest and raises an <code>ExceptionGroup</code>, handled with <code>except*</code>. That is structured concurrency.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if you call <code>time.sleep</code> or <code>requests.get</code> inside an <code>async def</code>?</summary><div class="qa-body">It blocks the event loop's only thread, so every other task freezes until it returns: 5 gathered coroutines calling <code>time.sleep(0.2)</code> took 1 s instead of 0.2 s. Use <code>await asyncio.sleep</code>, an async client such as httpx or aiohttp, or wrap the blocking call with <code>await asyncio.to_thread(...)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you run CPU-bound code from an asyncio application?</summary><div class="qa-body">Send it to a process pool with <code>await loop.run_in_executor(process_pool, fn, *args)</code>. A thread via <code>to_thread</code> would keep the loop responsive but would not compute faster, because of the GIL. The function and arguments must be picklable, and the pool should be created under <code>if __name__ == "__main__":</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>asyncio.to_thread</code> vs <code>loop.run_in_executor</code>?</summary><div class="qa-body"><code>to_thread(fn, *args, **kwargs)</code> (3.9+) is a convenience that runs <code>fn</code> in the loop's default thread pool and carries over context variables. <code>run_in_executor(executor, fn, *args)</code> accepts any executor, including a custom-sized thread pool or a process pool, but takes positional arguments only, so keyword arguments need <code>functools.partial</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does cancellation work, and why must <code>CancelledError</code> be re-raised?</summary><div class="qa-body"><code>task.cancel()</code> or a timeout throws <code>CancelledError</code> into the task at the await where it is paused, so <code>finally</code> blocks and <code>async with</code> exits run. If the coroutine catches it and does not re-raise, the task keeps running: timeouts no longer stop it, TaskGroups and shutdown hang. Clean up in <code>finally</code>, and re-raise if you must catch it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you add a timeout to an await?</summary><div class="qa-body"><code>async with asyncio.timeout(5): await op()</code> (3.11+) or <code>await asyncio.wait_for(op(), timeout=5)</code>. When the time runs out, the inner work is cancelled and <code>TimeoutError</code> is raised. HTTP clients also accept per-request timeouts, which you should set as well.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you stop 10,000 async requests from overwhelming an API?</summary><div class="qa-body">Wrap each request in <code>async with semaphore:</code> using <code>asyncio.Semaphore(n)</code> so at most n are in flight; share one client so connections are reused; set timeouts; retry 429 and 5xx errors with exponential back-off; and use <code>return_exceptions=True</code> or a TaskGroup so failures are handled. For very large inputs, a fixed number of worker tasks reading from an <code>asyncio.Queue</code> avoids creating 10,000 tasks at once.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Do you need locks in asyncio?</summary><div class="qa-body">Less often than with threads. Code between two awaits cannot be interrupted, so a read-modify-write with no await in the middle is safe. If the sequence contains an await (read, await I/O, write), other tasks can run in between and updates are lost: five withdrawals of 10 from 100 left 90 instead of 50. Protect such sequences with <code>asyncio.Lock</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does this print? <code>async def f(): return 1</code> then <code>print(f())</code></summary><div class="qa-body">Something like <code>&lt;coroutine object f at 0x…&gt;</code>, followed later by <code>RuntimeWarning: coroutine 'f' was never awaited</code>. Calling a coroutine function only creates the coroutine; you need <code>asyncio.run(f())</code> at the top level, or <code>await f()</code> inside async code, to get 1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does <code>asyncio.run()</code> fail in Jupyter?</summary><div class="qa-body">The Jupyter kernel already runs an event loop in that thread, and <code>asyncio.run</code> refuses to start a second one ("cannot be called from a running event loop"). In a notebook, use top-level <code>await main()</code> directly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is a coroutine related to a generator?</summary><div class="qa-body">Both are functions that pause and resume with their local variables intact, are driven by <code>send()</code>, and finish by raising <code>StopIteration</code>. <code>await</code> works much like <code>yield from</code>, passing the pause up the chain to the event loop. Before the <code>async</code>/<code>await</code> keywords arrived in Python 3.5, asyncio coroutines were written as generators.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In FastAPI, when should an endpoint be <code>async def</code> and when plain <code>def</code>?</summary><div class="qa-body"><code>async def</code> when everything it calls is async (httpx, asyncpg, async Redis); it runs directly on the event loop. Plain <code>def</code> when it calls blocking libraries (requests, ordinary database drivers); FastAPI then runs it in a thread pool so it cannot block the loop. An <code>async def</code> endpoint that calls blocking code is the worst case, because it stalls every request.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you call an AI-model API for 50,000 prompts as fast as the rate limit allows?</summary><div class="qa-body">Use asyncio with one shared async client; a semaphore or rate limiter sized to the provider's limits; per-request timeouts; retries with exponential back-off and some randomness on 429 and 5xx errors; results written to disk as they complete (with <code>as_completed</code> or worker tasks on an <code>asyncio.Queue</code>) so a crash does not lose everything; and <code>return_exceptions=True</code> or a per-task <code>try</code> so one failure does not stop the batch.</div></details>
</main>
`
});
