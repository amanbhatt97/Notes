// notes/python/py_concurrency.js — Concurrency vs Parallelism: Choosing a Model
Object.assign(TOPIC_CONTENT, {
  "py_concurrency": `<main>
<h1>Concurrency vs Parallelism: Choosing a Model</h1>
  <div class="where"><span>Python</span><span>Advanced Python</span><span>Concurrency</span><span>Concurrency vs Parallelism: Choosing a Model</span></div>
  <p class="lead">Sooner or later every program has to do many slow things: call twenty web services, download a thousand files, or crunch through a big calculation. Python gives you three ways to do more than one thing at a time (threads, processes and asyncio), and choosing the wrong one gives you all of the complexity and none of the speed. The right choice depends on one simple question: while your program is slow, is it <em>waiting</em> for something outside itself, or is it <em>computing</em>? This page builds the ideas you need to answer that question from the ground up: what waiting really is, the difference between concurrency and parallelism, what processes, threads and the GIL are, and how the three models compare when measured on the same jobs. All the way through we use one running example, a small food-delivery app with two slow jobs: fetching menus from 20 restaurants (a waiting job) and working out the best route for 4 delivery riders (a computing job). The code was run on CPython 3.13 on a 4-core machine; timings change a little from run to run, so treat every number as approximate and compare the ratios.</p>

  <h2 id="cc-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Concurrency vs Parallelism</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Two kinds of slow</div>
        <ul>
          <li><b>I/O-bound</b>: mostly waiting (network, disk, database)</li>
          <li><b>CPU-bound</b>: mostly computing</li>
          <li>Tell them apart: CPU time ÷ wall time</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Two ideas</div>
        <ul>
          <li><b>Concurrency</b>: many tasks in progress, taking turns (one cook, many pans)</li>
          <li><b>Parallelism</b>: tasks running at the same instant on several cores (many cooks)</li>
          <li>Concurrency hides waiting; only parallelism shortens computing</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The GIL</div>
        <ul>
          <li>Only one thread per process runs Python code at a time</li>
          <li>Released while waiting, held while computing</li>
          <li>So threads help waiting, not computing</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Three models</div>
        <ul>
          <li><b>threading</b>: several workers, one shared memory → waiting jobs</li>
          <li><b>multiprocessing</b>: separate programs, one GIL each → computing jobs</li>
          <li><b>asyncio</b>: one thread, thousands of waits → many waiting jobs</li>
          <li><code>concurrent.futures</code>: one interface for thread and process pools</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="cc-wait"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What "Waiting" Means</span><span class="rm-sub">why a program can be slow while doing nothing</span></div></div>
      <div class="rm-item rm-done" data-target="cc-cvp"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Concurrency vs Parallelism</span><span class="rm-sub">one cook with many pans, or many cooks</span></div></div>
      <div class="rm-item rm-done" data-target="cc-diag"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">I/O-bound vs CPU-bound</span><span class="rm-sub">measuring which kind of slow you have</span></div></div>
      <div class="rm-item rm-done" data-target="cc-os"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Processes, Threads and Cores</span><span class="rm-sub">what the operating system actually runs</span></div></div>
      <div class="rm-item rm-done" data-target="cc-gil"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">The GIL</span><span class="rm-sub">why Python threads take turns</span></div></div>
      <div class="rm-item rm-done" data-target="cc-models"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Threads, Processes and asyncio Compared</span><span class="rm-sub">the same two jobs, run four ways</span></div></div>
      <div class="rm-item rm-done" data-target="cc-futures"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">concurrent.futures</span><span class="rm-sub">one interface for thread and process pools</span></div></div>
      <div class="rm-item rm-done" data-target="cc-decide"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Choosing a Model</span><span class="rm-sub">from the shape of the work to the right tool</span></div></div>
      <div class="rm-item rm-done" data-target="cc-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">the wrong tool, and how it shows up</span></div></div>
      <div class="rm-item rm-done" data-target="cc-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, GIL rules, comparison tables</span></div></div>
      <div class="rm-item rm-done" data-target="cc-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask on concurrency</span></div></div>
    </div>
  </div>

  <h2 id="cc-wait"><span class="num">01</span>What "Waiting" Means</h2>
  <p>A normal Python program does one thing at a time. It runs a statement, finishes it completely, and only then moves to the next one. This is called <strong>sequential execution</strong>, and it is exactly what you want most of the time, because it makes programs easy to follow. The trouble starts when one of those statements has to wait for something outside the program.</p>
  <p>Think about what happens when your program asks a web server for some data. The request travels across the network, the server looks up the answer, and the reply travels back. That might take 200 milliseconds. During those 200 milliseconds your program has nothing to do: it cannot continue until the answer arrives, so it simply sits there. The same is true when it reads a file from a slow disk, queries a database, or calls an AI model over the internet. Talking to the world outside the program is called <strong>I/O</strong>, short for input/output, and a call that makes the program stop and wait until the I/O finishes is called a <strong>blocking</strong> call. The time a single request takes to come back is its <strong>latency</strong>.</p>
  <p>Picture a cook making pasta who puts a pot of water on the stove and then stands staring at it until it boils, ignoring the vegetables, the sauce and everything else in the kitchen. The cook is not lazy and not slow at cooking; the cook is simply waiting, and the waiting is wasted time. A sequential program that makes twenty network calls is that cook boiling twenty pots of water one after another.</p>
  <p>To see this in real code, here is the helper module used throughout this page and the three pages that follow it. It describes the food-delivery app's two slow jobs. <code>fetch_menu</code> asks one restaurant for its menu; to keep the examples runnable without an internet connection, the network wait is simulated with <code>time.sleep(0.2)</code>, which from the program's point of view behaves exactly like waiting for a reply. <code>route_cost</code> is a genuine calculation: it finds the shortest route through a rider's 9 drop-off points by trying every possible order, which is 362,880 orders. (<code>fetch_menu_async</code> is the same request written for asyncio; it is explained on the asyncio page.)</p>
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
  <p>One menu took 0.2 s, all of it waiting, and one route search took a fraction of a second of real calculation. Now let us do the whole of each job sequentially, timing it with <code>time.perf_counter()</code>, which reads a clock that measures real elapsed time:</p>
  <div class="fx" data-lang="py">import time
from workload import RESTAURANTS, RIDERS, fetch_menu, route_cost

t = time.perf_counter()
menus = [fetch_menu(r) for r in RESTAURANTS]          # 20 requests, one after another
print(f"waiting job  : {len(menus)} menus, {sum(m['dishes'] for m in menus)} dishes, {time.perf_counter() - t:.2f}s")

t = time.perf_counter()
costs = [route_cost(s) for s in RIDERS]               # 4 route searches, one after another
print(f"computing job: best routes {costs}, {time.perf_counter() - t:.2f}s")</div>
  <div class="fx" data-lang="text">waiting job  : 20 menus, 100 dishes, 4.00s
computing job: best routes [40, 36, 35, 36], 1.22s</div>
  <p>The waiting job took 20 × 0.2 = 4 seconds, and almost every one of those seconds was spent doing nothing. The computing job took around one second (this number moves a little between runs, because the computer is also doing other things; the 4.00 never moves, because it is pure waiting). Remember the two correct answers, 100 dishes and best routes <code>[40, 36, 35, 36]</code>: every faster version on this page must produce exactly the same results.</p>
  <figure class="viz"><svg viewBox="0 0 600 110" width="600">
    <text x="10" y="18" class="tm">Sequential requests: 20 waits laid end to end (first 8 shown)</text>
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
  </svg><figcaption>Time runs left to right. Each request is a sliver of real work (blue) followed by a long wait (grey). Done sequentially, the waits line up end to end, so the total time is the sum of all the waits.</figcaption></figure>
  <p>The picture shows the problem clearly. Each request needs only a sliver of real work from the computer, to build the request and read the reply, and then a long stretch of waiting. If only the program could send the second request while the first one is still waiting, and the third while the first two are waiting, the waits would overlap and the whole job could finish in roughly the time of one wait. That idea, keeping several tasks in progress at once, is what the rest of this page is about. But first we need to be precise about what "at once" means, because it means two quite different things.</p>

  <h2 id="cc-cvp"><span class="num">02</span>Concurrency vs Parallelism</h2>
  <p>People say "doing several things at once" to mean two different things, and mixing them up is the source of most of the confusion in this topic. So let us separate them carefully, starting with the kitchen.</p>
  <p>Imagine one cook with four pans on four burners. The cook starts the pasta water, and while it heats up, chops onions; puts the onions in a pan, and while they soften, stirs the sauce; drains the pasta when the water boils. At any single moment the cook is doing only one thing, because the cook has only one pair of hands. But over any ten-minute stretch, four dishes are in progress. This is <strong>concurrency</strong>: several tasks are in progress during the same period of time, and a single worker switches between them, typically whenever the current task has to wait. Now imagine four cooks, each chopping a different vegetable at the same moment. That is <strong>parallelism</strong>: several tasks are actually being worked on at the same instant, by several workers.</p>
  <p>In a computer, the "hands" that actually carry out instructions are the CPU's <strong>cores</strong>. A core can execute only one stream of instructions at a time, and a typical laptop has between 4 and 16 of them. Concurrency is a way of <em>structuring</em> a program so that tasks take turns, and it works perfectly well on a single core. Parallelism is about <em>hardware</em>: it needs several cores, each running a different task at the same moment. Parallelism is one way to achieve concurrency, but concurrency does not need parallelism.</p>
  <p>Which one helps depends entirely on the kind of slow you have. The figure below shows both kinds.</p>
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
  </svg><figcaption>Waiting work: overlapping the waits (concurrency) wins even on one core, because waiting does not need a core. Computing work: taking turns on one core gains nothing; only running the calculations on two cores at the same time (parallelism) halves the time.</figcaption></figure>
  <p>Walk through the four rows. In the first row, three requests run sequentially, and their waits add up. In the second row, a single core sends all three requests one after another, which takes almost no time, and then all three waits happen together, so the total is about one wait. Waiting does not use the core, so one core can have any number of waits in progress. That is why concurrency is such a big win for the waiting job. The third row tries the same trick with two calculations on one core: the core switches between them, but every switch just hands the same single core to the other calculation, so the total is still the sum of both. There is nothing to overlap, because a calculation never waits. Only the fourth row, where two cores really compute at the same time, makes calculation faster.</p>
  <p>Applied to our two jobs, that gives the following expectations. We will check every one of them with real measurements in section 06.</p>
  <table class="tbl"><caption>What each approach can do for the two jobs</caption>
    <tr><th></th><th>Waiting job (20 × 0.2 s)</th><th>Computing job (4 route searches)</th></tr>
    <tr><td>Sequential</td><td>4.0 s</td><td>about 1 s</td></tr>
    <tr><td>Concurrency (one core, switch while waiting)</td><td>about 0.2 s: all waits overlap</td><td>about 1 s: nothing to overlap</td></tr>
    <tr><td>Parallelism (4 cores)</td><td>works, but wasteful: waiting does not need a core</td><td>about 1 s ÷ 4 at best</td></tr>
  </table>
  <p>The short version, worth memorising: <strong>concurrency hides waiting; only parallelism shortens computing.</strong> The next step is to find out which kind of slow a given piece of code actually has.</p>

  <h2 id="cc-diag"><span class="num">03</span>I/O-bound vs CPU-bound</h2>
  <p>Before choosing a tool you need to know whether your slow code is mostly waiting or mostly computing, and guessing is surprisingly unreliable. A program that takes a long time "feels" busy, but as we just saw, it may be idle almost the whole time. Fortunately there is a simple measurement that tells you, using two different clocks.</p>
  <p>The first clock, <code>time.perf_counter()</code>, measures <strong>wall-clock time</strong>, or wall time: the real time that passes, as a clock on the wall would show it. The second, <code>time.process_time()</code>, measures <strong>CPU time</strong>: only the time during which a CPU core was actually running your program's instructions. Time spent sleeping or waiting for the network does not count towards CPU time. Think of a taxi meter that can charge by distance or by time: a taxi stuck in traffic for twenty minutes has a large time reading but a small distance reading. If you divide CPU time by wall time, you get the fraction of the time your program was really working.</p>
  <div class="fx" data-lang="py">import time
from workload import RESTAURANTS, RIDERS, fetch_menu, route_cost

def measure(label, job):
    wall0, cpu0 = time.perf_counter(), time.process_time()
    job()
    wall = time.perf_counter() - wall0               # real time that passed
    cpu = time.process_time() - cpu0                 # time the CPU actually spent on us
    print(f"{label:&lt;9} wall {wall:.2f}s  cpu {cpu:.2f}s  cpu/wall = {cpu / wall:.0%}")

measure("waiting", lambda: [fetch_menu(r) for r in RESTAURANTS])
measure("computing", lambda: [route_cost(s) for s in RIDERS])</div>
  <div class="fx" data-lang="text">waiting   wall 4.00s  cpu 0.00s  cpu/wall = 0%
computing wall 1.19s  cpu 1.17s  cpu/wall = 98%</div>
  <p>The two jobs could hardly be more different. The waiting job ran for about 4 seconds of wall time but used almost no CPU time at all, so its ratio is close to 0%: it was asleep the whole time. The computing job's CPU time is almost equal to its wall time, a ratio near 100%: the core was busy every moment. (The <code>lambda</code> simply wraps each job in a small function so that <code>measure</code> can run it between its two clock readings.)</p>
  <p>These two shapes have names. Code whose running time is dominated by waiting for input/output is called <strong>I/O-bound</strong>: a faster CPU would barely help it, because the CPU was not the bottleneck. Code whose running time is dominated by calculation is called <strong>CPU-bound</strong>: here a faster CPU, or more cores working together, helps directly.</p>
  <table class="tbl"><caption>Reading the ratio</caption>
    <tr><th>CPU ÷ wall</th><th>Name</th><th>Typical examples</th><th>What helps</th></tr>
    <tr><td>near 0%</td><td><strong>I/O-bound</strong></td><td>calling web APIs and AI models, downloads, database queries, reading from cloud storage</td><td>concurrency: threads or asyncio</td></tr>
    <tr><td>near 100%</td><td><strong>CPU-bound</strong></td><td>pure-Python loops, parsing text, tokenising, simulations, brute-force searches</td><td>parallelism (processes) or faster code (numpy)</td></tr>
    <tr><td>in between</td><td>mixed</td><td>download and then parse; fetch and then compute features</td><td>split the stages and give each its own tool</td></tr>
  </table>
  <p>One more step is worth taking before you parallelise anything: find out <em>which part</em> of the program is slow. A profiler such as <code>cProfile</code> lists how much time each function took (see <a class="xref" data-note="py_debugging">Debugging, Profiling &amp; Logging</a>). If 90% of a program's time is one slow database query, running ten copies of the program concurrently just sends ten slow queries to the database at once. Measure first, then pick the tool for the part that is actually slow.</p>

  <h2 id="cc-os"><span class="num">04</span>Processes, Threads and Cores</h2>
  <p>To understand Python's three models, you need three words from the operating system: process, thread and core. They are often used loosely, so it is worth pinning them down.</p>
  <p>When you run a program, the operating system creates a <strong>process</strong> for it: a running instance of the program with its own private block of memory, holding all its variables and objects. Two processes cannot see each other's memory; if one crashes, the other carries on. Inside every process there is at least one <strong>thread</strong>, which is a single sequence of instructions being executed, one after another. A process can have several threads, and they all share the process's memory, so they can all read and change the same variables. Each thread does keep its own record of which function it is in and its own local variables. Finally, the <strong>cores</strong> are the parts of the CPU that actually execute instructions. The operating system's <strong>scheduler</strong> decides, many times per second, which thread runs on which core, and it can pause a thread at almost any moment to give another one a turn.</p>
  <p>The restaurant analogy maps onto this neatly. A process is a whole kitchen, with its own pantry (memory). Threads are cooks working in that kitchen: they all share the same pantry, which is convenient, but two cooks can also grab the same ingredient at the same moment and get in each other's way. Cores are the stoves: however many cooks you hire, only as many dishes as there are stoves can actually be cooking at the same instant. Opening a second kitchen (a second process) costs much more than hiring another cook, but the two kitchens never fight over ingredients.</p>
  <p>Python lets you see these things directly. Below, the main program prints its process ID (the number the operating system uses to identify the process), then starts a new thread and a new process that each print where they are running. (The <code>if __name__ == "__main__":</code> line is needed whenever you start processes; the reason is explained in <a class="xref" data-note="py_multiprocessing">Processes</a>.)</p>
  <div class="fx" data-lang="py">import os, threading, multiprocessing

def where_am_i(label):
    print(f"{label:&lt;16} process id {os.getpid()}, thread {threading.current_thread().name}")

if __name__ == "__main__":
    print("CPU cores on this machine:", os.cpu_count())
    where_am_i("main program")

    t = threading.Thread(target=where_am_i, args=("a new thread",), name="helper")
    t.start(); t.join()                              # same process, different thread

    p = multiprocessing.Process(target=where_am_i, args=("a new process",))
    p.start(); p.join()                              # a different process altogether</div>
  <div class="fx" data-lang="text">CPU cores on this machine: 4
main program     process id 3236, thread MainThread
a new thread     process id 3236, thread helper
a new process    process id 3238, thread MainThread</div>
  <p>The new thread reports the <em>same</em> process ID as the main program: it is a second worker inside the same kitchen, sharing its memory. The new process reports a <em>different</em> process ID: it is a separate program with its own memory and its own main thread. This difference, shared memory versus separate memory, is the main practical difference between Python's <code>threading</code> and <code>multiprocessing</code> modules. Threads are cheap to start and can share data freely, but they must be careful not to corrupt it. Processes are expensive to start and must copy data between them, but they cannot corrupt each other.</p>
  <p>In most programming languages, the story would end here: put four threads on four cores and you get four times the computing power. In Python, there is one more piece, and it changes the answer.</p>

  <h2 id="cc-gil"><span class="num">05</span>The GIL</h2>
  <p>The standard Python interpreter, called <strong>CPython</strong> because it is written in C, contains a lock called the <strong>Global Interpreter Lock</strong>, or <strong>GIL</strong>. A lock is an object that only one thread can hold at a time; any other thread that wants it must wait until it is released. The GIL's rule is simple: a thread must hold the GIL to execute Python code. Since there is only one GIL per process, only one thread in a process can be running Python code at any instant, no matter how many cores the machine has.</p>
  <p>Picture a kitchen where there is only one recipe book, and nobody is allowed to cook without reading from it. Four cooks can be in the kitchen, but only the one holding the book can actually cook; the others stand and wait for their turn. However, a cook who has put something in the oven and is just waiting for the timer can put the book down, and another cook can pick it up. That is exactly how the GIL behaves: a thread that is computing in Python holds the GIL, but a thread that is waiting for the network or the disk releases it so that another thread can run.</p>
  <p>Why would anyone build a lock like that? The reason lies in how CPython manages memory. Every Python object carries a counter called its <strong>reference count</strong>: the number of names, list slots and other places currently pointing at it. When the count drops to zero, nothing can use the object any more, and CPython frees its memory immediately. These counters change constantly, on almost every assignment, function call and list operation. If two threads changed the same counter at exactly the same moment, one change could be lost, and an object could be freed while something was still using it, which crashes the program. Protecting every object with its own small lock would make all Python code slower. One big lock around the whole interpreter is simple, keeps single-threaded programs fast, and makes it much easier to write C extensions. You can look at both the GIL setting and a reference count from Python:</p>
  <div class="fx" data-lang="py">import sys
print("GIL enabled:", sys._is_gil_enabled())          # False only on a free-threaded build
print("switch interval:", sys.getswitchinterval(), "s")   # how often a busy thread must offer the GIL

menu = {"id": "R01", "dishes": 4}
print("references to menu:", sys.getrefcount(menu))   # the name, plus the function's own argument
alias = menu
print("after alias = menu:", sys.getrefcount(menu))   # one more reference</div>
  <div class="fx" data-lang="text">GIL enabled: True
switch interval: 0.005 s
references to menu: 2
after alias = menu: 3</div>
  <p><code>sys._is_gil_enabled()</code> confirms that this interpreter has a GIL. The <strong>switch interval</strong> of 0.005 seconds is how often a thread that is busy computing is asked to let go of the GIL so another thread can have a turn; that is how threads take turns. The reference count of <code>menu</code> starts at 2 (the name <code>menu</code>, plus the temporary reference created by passing it to <code>getrefcount</code>), and creating a second name, <code>alias</code>, raises it to 3. Those counters are what the GIL protects.</p>
  <p>The consequences for our two jobs follow directly. When a thread makes a blocking I/O call, such as a network request, reading a file, a database query or <code>time.sleep</code>, it releases the GIL while it waits, so many threads can be waiting at the same time and the waits overlap. Threads are therefore a good tool for the waiting job. When a thread runs pure Python calculation, it holds the GIL, and the other threads can only take turns with it, so four computing threads take about as long as one. Threads are therefore no help for the computing job. There is a useful exception: many libraries written in C, including most of numpy, pandas and PyTorch, release the GIL while they do heavy number crunching, so their work can run on several cores even from Python threads.</p>
  <p>Two common misunderstandings are worth clearing up. First, the GIL does not make your own code safe to use from several threads. The interpreter can switch threads between any two of its small internal steps, so an update such as <code>count += 1</code> on shared data, which reads, adds and writes, can still be interrupted halfway and lose updates (this is shown in <a class="xref" data-note="py_threading">Threads &amp; the GIL</a>). Second, "Python cannot do parallelism" is wrong. Separate processes each have their own interpreter and their own GIL, so they can compute in parallel; that is what <code>multiprocessing</code> is for.</p>
  <p>Finally, the GIL is slowly becoming optional. PEP 703 added a special build of CPython without the GIL, called the <strong>free-threaded</strong> build. It was experimental in Python 3.13 (usually installed as <code>python3.13t</code>) and is officially supported, though still not the default, from 3.14. On that build, computing threads really do run on several cores at once. The trade-offs are that single-threaded code runs somewhat slower, every C extension must be rebuilt to support it (importing one that has not been re-enables the GIL), and bugs from threads sharing data become more likely. The standard build used for this page reported <code>True</code> above, so every measurement here has the GIL.</p>

  <h2 id="cc-models"><span class="num">06</span>Threads, Processes and asyncio Compared</h2>
  <p>We now have all the pieces needed to understand Python's three ways of doing several things at once. Each one makes a different trade between cost, safety and what it can speed up.</p>
  <p>The <strong><code>threading</code></strong> module runs several threads inside one process. They share all the process's memory, and the operating system switches between them whenever it likes, which is called <strong>preemptive</strong> switching. Because of the GIL, threads give concurrency but not parallelism for Python code: they are like several cooks in one kitchen sharing one recipe book. The <strong><code>multiprocessing</code></strong> module runs several separate Python processes, each with its own interpreter, memory and GIL. They can compute on different cores at the same instant, so they give real parallelism, but every piece of data sent between them has to be copied: they are like separate kitchens. The <strong><code>asyncio</code></strong> module runs many tasks on a single thread. Each task marks the places where it waits with the keyword <code>await</code>, and a scheduler called the <strong>event loop</strong> switches to another task only at those points, which is called <strong>cooperative</strong> switching. Think of a single waiter serving twenty tables: the waiter takes an order, hands it to the kitchen, and instead of standing by the kitchen door, goes to the next table; when a dish is ready, the waiter carries it out. One person keeps twenty tables happy because most of each table's time is spent waiting.</p>
  <p>Theory is only useful if the measurements agree with it, so the script below runs both jobs four ways: sequentially, with a pool of threads, with a pool of 4 processes (one per core on this machine), and with asyncio. Pools and the <code>map</code> method are explained properly in the next section; for now, read <code>ex.map(fetch_menu, RESTAURANTS)</code> as "call <code>fetch_menu</code> on every restaurant, using the pool's workers". The answers must be the same every time: 100 dishes and <code>[40, 36, 35, 36]</code>.</p>
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
    print("waiting job: 20 requests x 0.2 s")
    timed("sequential", lambda: sum(fetch_menu(r)["dishes"] for r in RESTAURANTS))
    with ThreadPoolExecutor(max_workers=20) as ex:
        timed("threads", lambda: sum(m["dishes"] for m in ex.map(fetch_menu, RESTAURANTS)))
    with ProcessPoolExecutor(max_workers=4) as ex:
        timed("processes", lambda: sum(m["dishes"] for m in ex.map(fetch_menu, RESTAURANTS)))
    async def all_io():
        return sum(m["dishes"] for m in await asyncio.gather(*map(fetch_menu_async, RESTAURANTS)))
    timed("asyncio", lambda: asyncio.run(all_io()))

    print("computing job: 4 route searches")
    timed("sequential", lambda: [route_cost(s) for s in RIDERS])
    with ThreadPoolExecutor(max_workers=4) as ex:
        timed("threads", lambda: list(ex.map(route_cost, RIDERS)))
    with ProcessPoolExecutor(max_workers=4) as ex:
        timed("processes", lambda: list(ex.map(route_cost, RIDERS)))
    async def all_cpu():
        return list(await asyncio.gather(*map(route_cost_async, RIDERS)))
    timed("asyncio", lambda: asyncio.run(all_cpu()))</div>
  <div class="fx" data-lang="text">waiting job: 20 requests x 0.2 s
  sequential  4.01s   100
  threads     0.21s   100
  processes   1.02s   100
  asyncio     0.20s   100
computing job: 4 route searches
  sequential  1.04s   [40, 36, 35, 36]
  threads     1.16s   [40, 36, 35, 36]
  processes   0.29s   [40, 36, 35, 36]
  asyncio     1.05s   [40, 36, 35, 36]</div>
  <p>Every version produced the same answers, so the only question is speed, and the results match the theory closely. For the waiting job, threads and asyncio both cut 4 seconds to about 0.2 seconds, the time of a single wait, because all twenty waits overlapped. Four processes managed only about 1 second: each process can wait for only one request at a time, so 20 requests took 5 rounds of 0.2 seconds, plus the time to start the processes. Using whole processes just to wait is wasteful.</p>
  <p>For the computing job the picture flips. Threads were no faster than the sequential loop, and often a little slower, because they took turns holding the GIL and paid a small cost at every hand-over. The asyncio version was no faster either: its tasks never reach an <code>await</code>, so each one runs to completion before the next can start, which is just a sequential loop with extra steps. Only the 4 processes helped, running the searches about two to three times faster. That is less than the ideal 4×, because starting processes and sending each its work takes time and the four searches are not exactly equal in size.</p>
  <table class="tbl"><caption>The three models side by side</caption>
    <tr><th></th><th>threading</th><th>multiprocessing</th><th>asyncio</th></tr>
    <tr><td>Gives</td><td>concurrency</td><td>parallelism</td><td>concurrency</td></tr>
    <tr><td>Who decides when to switch</td><td>the operating system, at almost any moment (preemptive)</td><td>nobody needs to: processes truly run at the same time</td><td>the task itself, only at <code>await</code> (cooperative)</td></tr>
    <tr><td>Memory</td><td>shared</td><td>separate; data is copied between processes</td><td>shared, one thread</td></tr>
    <tr><td>Cost per worker</td><td>an OS thread</td><td>a whole interpreter (start-up time, megabytes of memory)</td><td>a small Python object (kilobytes)</td></tr>
    <tr><td>Sensible number of workers</td><td>tens to hundreds</td><td>about the number of cores</td><td>thousands to tens of thousands</td></tr>
    <tr><td>Libraries</td><td>any normal blocking library</td><td>any, but data sent must be copyable (picklable)</td><td>needs async libraries such as httpx, aiohttp, asyncpg</td></tr>
    <tr><td>Main danger</td><td>threads corrupting shared data; deadlocks</td><td>copying overhead; set-up mistakes</td><td>one blocking call freezes every task</td></tr>
    <tr><td>Details</td><td><a class="xref" data-note="py_threading">Threads &amp; the GIL</a></td><td><a class="xref" data-note="py_multiprocessing">Processes</a></td><td><a class="xref" data-note="py_asyncio">asyncio</a></td></tr>
  </table>
  <p>One measurement on one machine is not a law of nature. Process start-up time, the size of the data being sent and how busy the machine is all shift the results; on very small tasks a process pool can be dozens of times <em>slower</em> than a plain loop (section 09 shows this). The pattern, however, is reliable: waiting jobs want threads or asyncio, computing jobs want processes.</p>

  <h2 id="cc-futures"><span class="num">07</span>concurrent.futures</h2>
  <p>Creating threads or processes by hand, handing each one its work, collecting the results and dealing with errors is fiddly code that is easy to get wrong. The standard library packages all of it in the <code>concurrent.futures</code> module, and in everyday code this is how threads and processes are normally used.</p>
  <p>The central idea is a <strong>pool</strong>, which the module calls an <strong>executor</strong>: a fixed group of workers, created once and reused, plus an internal queue of jobs waiting for a free worker. Think of a restaurant that keeps a fixed team of cooks rather than hiring a new cook for every order and firing them afterwards. There are two kinds of executor with exactly the same methods: <code>ThreadPoolExecutor</code>, whose workers are threads, and <code>ProcessPoolExecutor</code>, whose workers are processes. Because the interface is identical, switching a job from threads to processes is usually a one-word change.</p>
  <p>The second idea is the <strong>Future</strong>. When you hand a job to an executor with <code>submit</code>, you do not get the result back immediately, because the job has not run yet. Instead you get a Future, an object that stands for a result that will exist later. It is like the receipt with an order number you get at a takeaway counter: you can check whether your order is ready, or wait at the counter until it is, and then swap the receipt for your food. With a Future, <code>done()</code> checks, and <code>result()</code> waits and then hands over the value, or raises the exception if the job failed.</p>
  <div class="fx" data-lang="py">import time
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor, as_completed
from workload import RESTAURANTS, RIDERS, fetch_menu, route_cost

def run(pool_class, fn, items, workers):
    t = time.perf_counter()
    with pool_class(max_workers=workers) as ex:       # the same code for both kinds of pool
        results = list(ex.map(fn, items))
    return results, time.perf_counter() - t

if __name__ == "__main__":
    for cls in (ThreadPoolExecutor, ProcessPoolExecutor):
        _, t_io = run(cls, fetch_menu, RESTAURANTS, 20)
        costs, t_cpu = run(cls, route_cost, RIDERS, 4)
        print(f"{cls.__name__:&lt;20} waiting {t_io:.2f}s   computing {t_cpu:.2f}s  {costs}")

    with ThreadPoolExecutor(max_workers=4) as ex:
        fut = ex.submit(fetch_menu, "R07")            # schedule one call; get a Future at once
        print("finished right after submit?", fut.done())
        print("result():", fut.result())              # waits until the value is ready
        futs = {ex.submit(fetch_menu, r): r for r in ["R01", "R02", "R03"]}
        print("as_completed:", sorted(futs[f] for f in as_completed(futs)))</div>
  <div class="fx" data-lang="text">ThreadPoolExecutor   waiting 0.21s   computing 1.21s  [40, 36, 35, 36]
ProcessPoolExecutor  waiting 0.24s   computing 0.44s  [40, 36, 35, 36]
finished right after submit? False
result(): {'id': 'R07', 'dishes': 5}
as_completed: ['R01', 'R02', 'R03']</div>
  <p>The same <code>run</code> function drove both kinds of pool, changing only the class passed in. As in the previous section, threads were fast for the waiting job and no help for the computing job, while processes sped up the computing job. (With 20 worker processes the waiting job was fast too, but at the cost of starting twenty interpreters just to sit and wait.) In the second part, <code>submit</code> returned a Future straight away, and <code>done()</code> was still <code>False</code> because the 0.2-second request had barely started; <code>result()</code> then waited for it and returned the menu. <code>as_completed</code> hands back futures in the order they <em>finish</em>, which lets you deal with fast results first; the names are sorted here only so the output is the same on every run. <code>map</code>, by contrast, returns results in the same order as the inputs.</p>
  <table class="tbl"><caption>The executor interface</caption>
    <tr><th>Call</th><th>Gives back</th><th>Notes</th></tr>
    <tr><td><code>Executor(max_workers=n)</code></td><td>a pool</td><td>use in a <code>with</code> block, which waits for all jobs and shuts the pool down at the end</td></tr>
    <tr><td><code>ex.submit(fn, *args)</code></td><td>a <code>Future</code></td><td>schedules one call</td></tr>
    <tr><td><code>ex.map(fn, items, chunksize=1)</code></td><td>results</td><td>in <strong>input</strong> order; an exception is re-raised when you reach that result; <code>chunksize</code> only matters for processes</td></tr>
    <tr><td><code>as_completed(futures)</code></td><td>futures</td><td>in <strong>finish</strong> order</td></tr>
    <tr><td><code>fut.result(timeout)</code>, <code>done()</code>, <code>cancel()</code></td><td></td><td><code>result()</code> re-raises the worker's exception in your code</td></tr>
  </table>
  <p>If you do not choose <code>max_workers</code>, a thread pool uses <code>min(32, os.cpu_count() + 4)</code> threads and a process pool uses one process per core. asyncio can use these same pools too: <code>await loop.run_in_executor(pool, fn, *args)</code> runs an ordinary function in a thread or process pool and lets asyncio wait for the result, and <code>asyncio.to_thread(fn, *args)</code> is a shortcut for the default thread pool. That is how one program can use asyncio for its waiting and a process pool for its computing (see <a class="xref" data-note="py_asyncio">asyncio</a>).</p>

  <h2 id="cc-decide"><span class="num">08</span>Choosing a Model</h2>
  <p>Everything so far boils down to a short decision process. First, check that the code really is slow and find which part is slow (profile it). Second, decide whether that part is waiting or computing (compare CPU time with wall time). Then one practical question on each side settles the choice.</p>
  <figure class="viz"><svg viewBox="0 0 640 230" width="640">
    <defs><marker id="cc-a6" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="230" y="8" width="180" height="34" rx="6" class="fb sb"/><text x="320" y="30" text-anchor="middle" font-size="12">Is it slow? Profile it.</text>
    <line x1="320" y1="42" x2="320" y2="62" stroke="currentColor" marker-end="url(#cc-a6)"/>
    <rect x="200" y="64" width="240" height="34" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="86" text-anchor="middle" font-size="12">CPU time ÷ wall time?</text>
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
  </svg><figcaption>Profile, classify the slow part by its CPU-to-wall ratio, then decide by library support (waiting side) or by whether the work can be done in numpy (computing side).</figcaption></figure>
  <p>On the waiting side, the question is which libraries you are using and how many waits you have. If your code uses ordinary blocking libraries, such as <code>requests</code> for HTTP, <code>boto3</code> for cloud storage or a normal database driver, and you have tens or hundreds of calls, a <code>ThreadPoolExecutor</code> is the simplest correct answer: every library works with threads, and waiting threads release the GIL. If you need thousands or tens of thousands of waits at once, for example a web server holding many connections or a crawler fetching 10,000 pages, and async libraries exist for what you need, asyncio is the better fit, because each waiting task costs a few kilobytes while each thread costs far more.</p>
  <p>On the computing side, the question is whether the calculation is written in pure Python or can be handed to a library like numpy. Pure-Python loops, like our route search, need a <code>ProcessPoolExecutor</code> to use more than one core. But numeric work on arrays should first be <strong>vectorised</strong>, meaning rewritten as whole-array numpy or pandas operations, which run in compiled C code that is often 10 to 100 times faster than a Python loop and frequently uses several cores already. Vectorising usually beats adding processes.</p>
  <table class="tbl">
    <tr><th>Your code mostly…</th><th>Example</th><th>Use</th><th>Why</th></tr>
    <tr><td>waits; tens to hundreds of tasks; ordinary libraries</td><td>200 calls with <code>requests</code>, S3 downloads with boto3</td><td><strong>ThreadPoolExecutor</strong></td><td>waiting threads release the GIL; works with any library</td></tr>
    <tr><td>waits; thousands of tasks; async libraries exist</td><td>crawling 10,000 pages, websockets, an async web API, many AI-model calls</td><td><strong>asyncio</strong></td><td>a task costs kilobytes; no locks needed between awaits</td></tr>
    <tr><td>computes in pure Python</td><td>brute-force search, parsing, tokenising, simulations</td><td><strong>ProcessPoolExecutor</strong></td><td>one GIL per process, so every core works</td></tr>
    <tr><td>computes on arrays</td><td>matrix maths, groupby, a neural-network forward pass</td><td><strong>vectorise with numpy / pandas</strong></td><td>C code is already fast and often multi-core</td></tr>
    <tr><td>both waits and computes</td><td>download files, then parse each one</td><td><strong>threads or asyncio for the waiting, plus a process pool for the computing</strong></td><td>each stage gets the tool that suits it</td></tr>
    <tr><td>tiny, fast tasks</td><td>doubling 20,000 numbers</td><td><strong>a plain loop</strong></td><td>the overhead of any pool is bigger than the work</td></tr>
  </table>
  <p>The rule of thumb in one sentence: <strong>waiting calls for concurrency (threads, or asyncio when there are very many waits), computing calls for parallelism (processes) or faster code (numpy)</strong>, and you should always measure, because overhead can wipe out the gain on small jobs. You will meet this choice constantly in data and machine-learning work: parallel downloads from cloud storage use threads; PyTorch's <code>DataLoader(num_workers=…)</code> and scikit-learn's <code>n_jobs</code> use processes; async web frameworks such as <a class="xref" data-note="api_fastapi">FastAPI</a> and high-volume AI-API clients use asyncio.</p>

  <h2 id="cc-traps"><span class="num">09</span>Common Mistakes</h2>
  <p>The most common mistake of all is reaching for a concurrency tool before measuring. If the slow part is a single heavy database query, running it from ten threads just makes the database ten times busier; if the slow part is a pure-Python loop, threads will not help at all on the standard interpreter, as the comparison in section 06 showed. Measure CPU time against wall time and profile first.</p>
  <p>A mistake specific to asyncio is writing <code>await</code> inside a <code>for</code> loop and expecting the requests to overlap. <code>await</code> means "wait until this finishes before continuing", so a loop of awaits is still sequential. The fix is to create all the requests first and then wait for all of them together, for example with <code>asyncio.gather</code>:</p>
  <div class="fx" data-lang="py">import asyncio, time
from workload import RESTAURANTS, fetch_menu_async

async def main():
    t = time.perf_counter()
    for rid in RESTAURANTS:
        await fetch_menu_async(rid)                   # MISTAKE: waits for each before the next
    print(f"await in a loop : {time.perf_counter() - t:.2f}s")

    t = time.perf_counter()
    await asyncio.gather(*(fetch_menu_async(r) for r in RESTAURANTS))   # FIX: start all, then wait
    print(f"asyncio.gather  : {time.perf_counter() - t:.2f}s")

asyncio.run(main())</div>
  <div class="fx" data-lang="text">await in a loop : 4.01s
asyncio.gather  : 0.20s</div>
  <p>Both versions are correct, but the loop took the full 4 seconds because it never had more than one request in flight, while <code>gather</code> started all twenty and finished in about the time of one.</p>
  <p>A related asyncio mistake is calling an ordinary blocking function, such as <code>time.sleep</code> or <code>requests.get</code>, inside an <code>async def</code> function. asyncio runs all its tasks on one thread and can only switch tasks at an <code>await</code>, so a blocking call freezes every task until it returns:</p>
  <div class="fx" data-lang="py">import asyncio, time

async def bad(rid):
    time.sleep(0.2)                                   # MISTAKE: a blocking wait inside async def
    return rid

async def good(rid):
    await asyncio.sleep(0.2)                          # FIX: an awaitable wait
    return rid

async def main():
    for fn in (bad, good):
        t = time.perf_counter()
        await asyncio.gather(*(fn(f"R{i:02d}") for i in range(1, 11)))
        print(f"10 x {fn.__name__:&lt;4}: {time.perf_counter() - t:.2f}s")

asyncio.run(main())</div>
  <div class="fx" data-lang="text">10 x bad : 2.00s
10 x good: 0.20s</div>
  <p>Ten "concurrent" tasks that each call <code>time.sleep(0.2)</code> took the full 10 × 0.2 = 2 seconds, exactly as if they had run one after another. With <code>await asyncio.sleep(0.2)</code> they took about 0.2 seconds. The same freeze happens with any blocking library or any long calculation inside an async function; the fix is an async library, or handing the blocking call to a thread with <code>asyncio.to_thread</code>.</p>
  <p>On the process side, the classic mistake is sending very small jobs to a process pool. Every job has to be packed up, sent to another process, unpacked, and its result sent back, and that overhead can be far larger than the job itself:</p>
  <div class="fx" data-lang="py">import time
from concurrent.futures import ProcessPoolExecutor

def double(x):                                        # a job far too small to be worth sending
    return x * 2

if __name__ == "__main__":
    nums = list(range(20_000))
    t = time.perf_counter()
    plain = [double(x) for x in nums]
    print(f"plain loop          : {time.perf_counter() - t:.3f}s")
    with ProcessPoolExecutor(max_workers=4) as ex:
        t = time.perf_counter()
        pooled = list(ex.map(double, nums))           # MISTAKE: 20,000 tiny messages
        print(f"pool, one per task  : {time.perf_counter() - t:.3f}s")
        t = time.perf_counter()
        pooled = list(ex.map(double, nums, chunksize=5_000))   # better, still pointless
        print(f"pool, chunks of 5000: {time.perf_counter() - t:.3f}s")</div>
  <div class="fx" data-lang="text">plain loop          : 0.001s
pool, one per task  : 3.665s
pool, chunks of 5000: 0.006s</div>
  <p>Doubling 20,000 numbers takes about a millisecond in a plain loop. Sending them to a process pool one at a time took seconds, thousands of times slower, because each tiny job paid the full cost of a round trip between processes. Grouping the work into chunks with <code>chunksize</code> removed most of that overhead, yet the pool was still slower than the loop, because the whole job was simply too small to be worth sharing out. Processes pay off only when each job does substantial work.</p>
  <p>Finally, there are mistakes that belong to each model in detail: updating shared data from several threads without a lock (<a class="xref" data-note="py_threading">Threads &amp; the GIL</a>), forgetting the <code>if __name__ == "__main__":</code> guard or passing a lambda to a process pool (<a class="xref" data-note="py_multiprocessing">Processes</a>), and choosing asyncio because it sounds modern while the code still depends on blocking libraries (<a class="xref" data-note="py_asyncio">asyncio</a>).</p>

  <h2 id="cc-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key definitions</h3>
  <ul>
    <li><b>Sequential execution</b>: each task finishes before the next starts; total time = sum of task times.</li>
    <li><b>I/O</b>: talking to the outside world (network, disk, database). <b>Blocking call</b>: the program stops until it returns. <b>Latency</b>: time for one request to come back.</li>
    <li><b>Wall time</b> (<code>time.perf_counter()</code>): real time passed. <b>CPU time</b> (<code>time.process_time()</code>): time the CPU actually worked for you.</li>
    <li><b>I/O-bound</b>: CPU ÷ wall near 0%. <b>CPU-bound</b>: CPU ÷ wall near 100%.</li>
    <li><b>Concurrency</b>: several tasks in progress over the same period, taking turns; works on one core; hides waiting.</li>
    <li><b>Parallelism</b>: several tasks executing at the same instant on several cores; shortens computing.</li>
    <li><b>Process</b>: a running program with its own memory. <b>Thread</b>: one sequence of execution inside a process; threads share memory. <b>Core</b>: a part of the CPU that executes one thread at a time.</li>
    <li><b>Preemptive</b> switching: the OS switches threads at any moment. <b>Cooperative</b> switching: a task gives up control itself, at <code>await</code>.</li>
  </ul>
  <h3>The GIL</h3>
  <ul>
    <li>One lock per CPython process; a thread must hold it to run Python code, so one thread runs Python at a time.</li>
    <li>Exists to protect reference counts cheaply; keeps single-threaded code fast and C extensions simple.</li>
    <li>Released during blocking I/O, <code>sleep</code> and most heavy numpy/pandas C code; held during pure-Python computation (offered to others every <code>sys.getswitchinterval()</code> = 0.005 s).</li>
    <li>Not a guarantee of thread safety: <code>x += 1</code> on shared data can lose updates.</li>
    <li>Free-threaded build (PEP 703): <code>python3.13t</code> experimental, supported but opt-in from 3.14; check <code>sys._is_gil_enabled()</code>.</li>
  </ul>
  <h3>The three models</h3>
  <table class="tbl">
    <tr><th></th><th>threading</th><th>multiprocessing</th><th>asyncio</th></tr>
    <tr><td>Analogy</td><td>several cooks, one kitchen</td><td>separate kitchens</td><td>one waiter, many tables</td></tr>
    <tr><td>Gives</td><td>concurrency</td><td>parallelism</td><td>concurrency</td></tr>
    <tr><td>Best for</td><td>waiting, ordinary libraries</td><td>computing in pure Python</td><td>very many waits, async libraries</td></tr>
    <tr><td>Switching</td><td>preemptive</td><td>truly simultaneous</td><td>cooperative (<code>await</code>)</td></tr>
    <tr><td>Memory</td><td>shared</td><td>separate, copied</td><td>shared, one thread</td></tr>
    <tr><td>Danger</td><td>races, deadlocks</td><td>overhead, pickling, <code>__main__</code> guard</td><td>blocking the loop</td></tr>
  </table>
  <p>Measured on 4 cores (approximate): waiting job 20 × 0.2 s: sequential 4.0 s, threads 0.2 s, 4 processes 1.0 s, asyncio 0.2 s. Computing job: sequential ≈ 1 s, threads ≈ 1 s, 4 processes ≈ 0.4 s, asyncio ≈ 1 s.</p>
  <h3>concurrent.futures</h3>
  <div class="fx" data-lang="py">from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor, as_completed

with ThreadPoolExecutor(max_workers=20) as ex:      # or ProcessPoolExecutor
    results = list(ex.map(fn, items))               # input order
    futs = [ex.submit(fn, x) for x in items]        # Future objects
    for f in as_completed(futs):                     # finish order
        f.result()                                   # value, or re-raises the error</div>
  <ul>
    <li>Default workers: threads <code>min(32, cpu_count + 4)</code>; processes <code>cpu_count</code>.</li>
    <li>From asyncio: <code>await loop.run_in_executor(pool, fn, *args)</code>, <code>await asyncio.to_thread(fn, *args)</code>.</li>
  </ul>
  <h3>Choosing</h3>
  <ul>
    <li>Waiting + ordinary libraries → <code>ThreadPoolExecutor</code>.</li>
    <li>Waiting + thousands of tasks + async libraries → asyncio.</li>
    <li>Pure-Python computing → <code>ProcessPoolExecutor</code> (under <code>if __name__ == "__main__":</code>).</li>
    <li>Array computing → vectorise with numpy/pandas first.</li>
    <li>Mixed → threads/asyncio for the waiting, a process pool for the computing.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>Threads do not speed up pure-Python computing on the standard build.</li>
    <li><code>await</code> in a loop is sequential; use <code>gather</code>.</li>
    <li>One blocking call inside <code>async def</code> freezes every task.</li>
    <li>Tiny jobs in a process pool are slower than a loop; batch with <code>chunksize</code> or don't parallelise.</li>
    <li>Measure before choosing; profile to find the slow part.</li>
  </ul>

  <h2 id="cc-qa"><span class="num">10</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between concurrency and parallelism?</summary><div class="qa-body">Concurrency means several tasks are in progress over the same period of time, taking turns, which is possible on a single core. Parallelism means several tasks are executing at the same instant on different cores. Concurrency helps when tasks spend their time waiting, because the waits can overlap; only parallelism makes pure computation faster. In CPython, threads and asyncio give concurrency, and processes give parallelism.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does I/O-bound mean, and what does CPU-bound mean?</summary><div class="qa-body">An I/O-bound program spends most of its time waiting for input/output, such as network replies, disk reads or database queries; a faster CPU would barely help. A CPU-bound program spends most of its time calculating; a faster CPU or more cores help directly. Waiting work benefits from concurrency, computing work from parallelism or faster code.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you tell whether code is I/O-bound or CPU-bound?</summary><div class="qa-body">Measure CPU time with <code>time.process_time()</code> and wall time with <code>time.perf_counter()</code> around it. If CPU time is a small fraction of wall time, the code is mostly waiting (I/O-bound); if they are nearly equal, it is computing (CPU-bound). Then use a profiler such as <code>cProfile</code> to find which function is responsible.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a process and a thread?</summary><div class="qa-body">A process is a running program with its own private memory; processes cannot see each other's data, and a crash in one does not affect another. A thread is a sequence of execution inside a process; all threads of a process share its memory, and each has its own stack of function calls. Threads are cheap and share data easily but need care to avoid corrupting it; processes are expensive to start and must copy data between them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the GIL?</summary><div class="qa-body">The Global Interpreter Lock is a lock inside CPython that a thread must hold to execute Python code, so only one thread per process runs Python at any moment. It is released while a thread waits for I/O and inside many C libraries, so threads still help I/O-bound work, but pure-Python CPU-bound threads cannot run in parallel.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does CPython have a GIL at all?</summary><div class="qa-body">CPython manages memory with reference counting, and those counts change on almost every operation. If two threads changed the same count at once, an update could be lost and an object freed while still in use. Protecting every object with its own lock would slow down all code and complicate C extensions, so one global lock was the simple, fast choice. Removing it (PEP 703) required substantial changes, which is why the free-threaded build is still optional.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does the GIL make Python code thread-safe?</summary><div class="qa-body">No. It only guarantees that the interpreter's small internal steps do not overlap. An operation like <code>counter += 1</code> is several steps (read, add, write), and a thread switch between them can lose an update. Shared data that is updated by several threads still needs a lock, or a design that avoids sharing, such as a queue.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When is the GIL released?</summary><div class="qa-body">During blocking I/O such as network calls, file reads, database queries and <code>time.sleep</code>, and inside C code that explicitly releases it, which includes most heavy numpy, pandas and PyTorch operations and modules like <code>hashlib</code> and <code>zlib</code>. A thread running pure Python holds it and is asked to hand it over every switch interval, 5 ms by default.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Would 4 threads make a CPU-bound pure-Python function 4× faster on a 4-core machine?</summary><div class="qa-body">Not on standard CPython. Only one thread holds the GIL at a time, so the threads take turns and the total time is about the same as running sequentially, often slightly worse because of the hand-overs. A <code>ProcessPoolExecutor</code> with 4 workers can use all 4 cores. On the free-threaded build, threads could scale.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Threading vs multiprocessing vs asyncio: when would you use each?</summary><div class="qa-body">Threads for I/O-bound work with ordinary blocking libraries and tens to hundreds of tasks. Processes for CPU-bound pure-Python work that can be split into reasonably large pieces with small inputs and outputs. asyncio for very large numbers of concurrent waits, such as thousands of network connections, when async libraries are available. For numeric work, vectorising with numpy usually beats all three.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why not just use processes for everything?</summary><div class="qa-body">Each process is a whole interpreter: slow to start, megabytes of memory, and every argument and result must be serialised and copied. For waiting work this is wasteful, because waiting does not need a core: 4 processes overlapped only 4 requests at a time, so 20 requests took about 1 s against 0.2 s with threads. For tiny tasks the copying overhead dominates completely.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Preemptive vs cooperative multitasking?</summary><div class="qa-body">In preemptive multitasking, used by threads, the operating system can switch threads at almost any moment, so any update to shared data can be interrupted halfway and needs a lock. In cooperative multitasking, used by asyncio, a task gives up control only at an <code>await</code>, so code between awaits runs uninterrupted; but a task that never awaits, because it blocks or computes for a long time, freezes all the others.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can asyncio handle 10,000 connections when 10,000 threads would struggle?</summary><div class="qa-body">Each thread is an operating-system object with its own stack, often reserving megabytes of memory, and the OS has to schedule all of them. An asyncio task is a small Python object of a few kilobytes waiting in the event loop, which asks the OS which connections have data ready and resumes only those tasks. The cost per waiting connection is far lower.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>concurrent.futures</code> give you?</summary><div class="qa-body">A common executor interface with two implementations, <code>ThreadPoolExecutor</code> and <code>ProcessPoolExecutor</code>. <code>submit</code> returns a Future, <code>map</code> returns results in input order, <code>as_completed</code> yields futures as they finish, and <code>Future.result()</code> re-raises a worker's exception in the caller. Moving work between threads and processes is usually a one-word change, and asyncio can await either kind of pool.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a Future?</summary><div class="qa-body">An object that stands for the result of a call that has been scheduled but may not have finished, like an order receipt. You can check <code>done()</code>, wait for the value with <code>result(timeout)</code>, which returns the value or re-raises the exception, <code>cancel()</code> it if it has not started, or attach a callback. asyncio has its own <code>asyncio.Future</code>, and an asyncio Task is a kind of Future.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>executor.map</code> vs <code>submit</code> plus <code>as_completed</code>?</summary><div class="qa-body"><code>map</code> returns results in input order and re-raises the first exception when you reach that result, which ends your loop. <code>submit</code> gives one Future per call, and <code>as_completed</code> yields them in finish order, so you can handle fast results first and wrap each <code>result()</code> in its own <code>try</code> to deal with failures one by one.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you speed up a slow CPU-bound loop in Python?</summary><div class="qa-body">Profile first. Then, roughly in order: a better algorithm or data structure; vectorise with numpy or pandas so the loop runs in C; compile the hot code with Numba or Cython; and finally split the work across a <code>ProcessPoolExecutor</code> with reasonably large chunks and small inputs. Threads will not help on the standard build.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A pipeline downloads 5,000 files and then parses each one in pure Python. How would you structure it?</summary><div class="qa-body">Treat the two stages separately. Downloading is I/O-bound, so use a thread pool, or asyncio with an async HTTP client and a limit on concurrent requests. Parsing is CPU-bound, so use a process pool. Connect them so parsing starts while downloads continue, for example with futures or a queue, and send file paths rather than large blobs of data to the processes to avoid copying costs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is free-threaded Python, and does it make this whole question go away?</summary><div class="qa-body">It is an optional CPython build without the GIL (PEP 703): experimental as <code>python3.13t</code>, officially supported but not the default from 3.14. Threads can then run Python code in parallel. But single-threaded code is somewhat slower, every C extension must support it, and bugs from shared data become more likely. For portable code today, processes remain the standard answer for CPU-bound Python, and the I/O-bound advice does not change.</div></details>
</main>
`
});
