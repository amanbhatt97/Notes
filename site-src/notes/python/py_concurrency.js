// notes/python/py_concurrency.js — Concurrency & Async
Object.assign(TOPIC_CONTENT, {
  "py_concurrency": `<main>
  <h1>Concurrency &amp; Async</h1>
  <p class="lead">How to make Python do several things at once, and which of its three tools to pick: <strong>threads</strong> for waiting, <strong>processes</strong> for computing, <strong>asyncio</strong> for thousands of waits. You need this for API-heavy data collection, parallel feature extraction and model-serving code, and interviewers love "what is the GIL?". Every idea starts from the slow version, explains what is really happening, then measures the fix. Builds on functions, <a class="xref" data-note="py_advanced">generators and context managers</a>.</p>

  <h2 id="pc-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Concurrency &amp; Async</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Pick the tool</div>
        <ul>
          <li><b>First ask</b> — is the code mostly <b>waiting</b> (I/O) or <b>computing</b> (CPU)?</li>
          <li><b>I/O-bound</b> (API calls, DB, files) → threads or asyncio</li>
          <li><b>CPU-bound</b> (pure-Python loops, parsing) → processes</li>
          <li><b>Thousands of connections</b> → asyncio</li>
          <li><b>numpy / pandas / torch</b> → C code already releases the GIL; vectorise first</li>
          <li><b>Concurrency</b> = juggling tasks; <b>parallelism</b> = truly at the same instant</li>
          <li>💡 one cook juggling dishes vs four cooks</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">GIL</div>
        <ul>
          <li><b>Global Interpreter Lock</b> — only one thread runs Python code at a time (CPython)</li>
          <li><b>Why</b> — protects reference counts; keeps single-thread code fast</li>
          <li><b>Released</b> during I/O waits, <code>time.sleep</code>, heavy C code (numpy)</li>
          <li><b>Effect</b> — 2 CPU threads: 1.07 s vs 1.01 s; 2 waiting threads: 0.50 s vs 1.00 s</li>
          <li>💡 one microphone on stage</li>
          <li><b>Free-threaded build</b> (3.13t+) removes it; opt-in</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Threads</div>
        <ul>
          <li><code>Thread(target=f, args=...)</code>, <code>.start()</code>, <code>.join()</code></li>
          <li><b>Shared memory</b> → easy sharing, but races</li>
          <li><b>Race condition</b> — read-modify-write interleaves → lost updates (578k of 800k)</li>
          <li><b>Lock</b> — <code>with lock:</code> one thread at a time in that block</li>
          <li><b>RLock</b> · <b>Semaphore(n)</b> max n inside · <b>Event</b> · <b>Condition</b> · <b>Queue</b></li>
          <li><b>Deadlock</b> — A holds L1 wants L2, B holds L2 wants L1 → hang</li>
          <li>⚠ Fix: one lock order everywhere; <code>acquire(timeout=)</code>; prefer queues</li>
          <li><b>ThreadPoolExecutor</b> — <code>map</code> (input order) / <code>submit</code> + <code>as_completed</code> (finish order)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Processes</div>
        <ul>
          <li><b>Own interpreter, own GIL, own memory</b> → true CPU parallelism</li>
          <li><b>Cost</b> — slower start, more RAM, args/results are pickled</li>
          <li><b>ProcessPoolExecutor</b> — default choice; <code>chunksize</code> for many small tasks</li>
          <li><b>Sharing</b> — Queue (poison pill <code>None</code>), Pipe, Value/Array, SharedMemory</li>
          <li>⚠ Globals are NOT shared: child +100, parent still 0</li>
          <li>⚠ Guard with <code>if __name__ == "__main__":</code>; workers must be top-level functions</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">asyncio</div>
        <ul>
          <li><b>Coroutine</b> — <code>async def</code>; calling it runs nothing</li>
          <li><b>await</b> — "pause me here, run others until this is ready"</li>
          <li><b>Event loop</b> — one thread; resumes tasks when their I/O is ready</li>
          <li><b>gather</b> — run many, results in input order; <code>return_exceptions=True</code></li>
          <li><b>create_task</b> — start now, await later; <b>TaskGroup</b> cancels siblings on error</li>
          <li>⚠ <code>time.sleep</code> / <code>requests</code> / heavy CPU inside async blocks everything → <code>to_thread</code></li>
          <li>💡 one chef chops veg while the pasta boils</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Async HTTP</div>
        <ul>
          <li><b>httpx.AsyncClient</b> / <b>aiohttp.ClientSession</b> — one shared client (connection pool)</li>
          <li><b>Semaphore(10)</b> — cap requests in flight</li>
          <li><b>Timeouts</b> — <code>async with asyncio.timeout(s)</code> (3.11+)</li>
          <li><b>raise_for_status()</b> — 4xx/5xx become exceptions</li>
          <li>50 calls × 200 ms, 10 at a time → 1.09 s instead of 10 s</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Measured here</div>
        <ul>
          <li><b>20 HTTP calls × 200 ms</b>: sequential 4.05 s · threads 0.23 s · asyncio 0.30 s · processes 1.46 s</li>
          <li><b>CPU × 4</b>: threads ≈ asyncio ≈ sequential (2.2–2.5 s); processes 1.05 s</li>
          <li><b>Rule</b> — measure; start-up and pickling can erase gains on small jobs</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pc-pick"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Pick the Right Tool</span><span class="rm-sub">Waiting vs computing</span></div></div>
      <div class="rm-item rm-done" data-target="pc-gil"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The GIL</span><span class="rm-sub">One microphone, many singers</span></div></div>
      <div class="rm-item rm-done" data-target="pc-thr"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Threading</span><span class="rm-sub">Races, locks, deadlocks, pools</span></div></div>
      <div class="rm-item rm-done" data-target="pc-mp"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Multiprocessing</span><span class="rm-sub">Pools, queues, pipes, shared memory</span></div></div>
      <div class="rm-item rm-done" data-target="pc-aio"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">asyncio</span><span class="rm-sub">Event loop, await, gather, tasks</span></div></div>
      <div class="rm-item rm-done" data-target="pc-http"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Async HTTP</span><span class="rm-sub">httpx against a local server</span></div></div>
      <div class="rm-item rm-done" data-target="pc-bench"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Timing Showdown</span><span class="rm-sub">Four models, two workloads</span></div></div>
      <div class="rm-item rm-done" data-target="pc-build"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Build It</span><span class="rm-sub">Parallel scraper + featuriser</span></div></div>
      <div class="rm-item rm-done" data-target="pc-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Blocking the loop, unlocked state</span></div></div>
      <div class="rm-item rm-done" data-target="pc-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="pc-pick"><span class="num">01</span>Pick the Right Tool</h2>
  <p>You need to download 200 web pages (or call an API for 200 user IDs). Each request takes half a second. Written as a normal loop, that is 100 seconds. But look at what the program is doing during those 100 seconds: almost nothing. It sends a request, then sits idle until the server answers. The CPU is free nearly the whole time. It would be much faster to send all the requests, then collect the answers as they arrive.</p>
  <p>Now a different job: tokenise one million documents. Here the CPU is busy every moment. There is no idle time to fill. The only way to go faster is to use more CPU cores at the same time.</p>
  <p>These two cases need different tools, so the first question is always: <strong>is my code mostly waiting, or mostly computing?</strong> Waiting on the network, disk or a database is called <strong>I/O-bound</strong> (I/O = input/output). Busy calculating is called <strong>CPU-bound</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A home kitchen. Making tea for four is mostly waiting for the water to boil: one person can put four pans on four burners and wait for all of them at once. That is I/O-bound work, and one cook juggling is enough. Chopping vegetables for a wedding is non-stop hand work: one cook juggling does not help, you need more cooks with more knives. That is CPU-bound work.</p></div>
  <p>The code below "downloads" 4 pages where each download is just a 0.5-second wait, first one by one, then with 4 threads (helpers that can wait at the same time; section 03 explains them).</p>
  <div class="fx" data-lang="py">import time
from concurrent.futures import ThreadPoolExecutor

def download(i):                 # pretend network call: 0.5 s of pure waiting
    time.sleep(0.5)
    return f"page{i}"

t = time.perf_counter()
pages = [download(i) for i in range(4)]
print(pages, f"one by one: {time.perf_counter() - t:.1f}s")

t = time.perf_counter()
with ThreadPoolExecutor(max_workers=4) as ex:
    pages = list(ex.map(download, range(4)))
print(pages, f"4 threads:  {time.perf_counter() - t:.1f}s")</div>
  <div class="fx" data-lang="text">['page0', 'page1', 'page2', 'page3'] one by one: 2.0s
['page0', 'page1', 'page2', 'page3'] 4 threads:  0.5s</div>
  <p>Same results, same order, four times faster. One by one: 0.5 + 0.5 + 0.5 + 0.5 = 2 s. With threads, all four waits happened during the same half second. <code>ex.map(download, range(4))</code> is like the built-in <code>map</code>, except each call runs in a pool thread. The picture below shows the same idea for three calls.</p>
  <figure class="viz"><svg viewBox="0 0 560 180" width="560">
    <text x="10" y="20" class="tm">3 API calls: short compute (blue) + long network wait (grey)</text>
    <text x="10" y="52">Sequential</text>
    <rect x="110" y="40" width="10" height="16" class="fb sb"/><rect x="120" y="40" width="90" height="16" class="fs"/>
    <rect x="210" y="40" width="10" height="16" class="fb sb"/><rect x="220" y="40" width="90" height="16" class="fs"/>
    <rect x="310" y="40" width="10" height="16" class="fb sb"/><rect x="320" y="40" width="90" height="16" class="fs"/>
    <text x="418" y="53" class="tr">waits in series</text>
    <text x="10" y="94">Threads</text>
    <rect x="110" y="74" width="10" height="10" class="fb sb"/><rect x="120" y="74" width="90" height="10" class="fs"/>
    <rect x="114" y="86" width="10" height="10" class="fb sb"/><rect x="124" y="86" width="90" height="10" class="fs"/>
    <rect x="118" y="98" width="10" height="10" class="fb sb"/><rect x="128" y="98" width="90" height="10" class="fs"/>
    <text x="228" y="95" class="tg">3 OS threads wait together</text>
    <text x="10" y="142">asyncio</text>
    <rect x="110" y="130" width="10" height="16" class="fb sb"/><rect x="120" y="130" width="10" height="16" class="fb sb"/><rect x="130" y="130" width="10" height="16" class="fb sb"/>
    <rect x="140" y="130" width="80" height="16" class="fs"/>
    <text x="228" y="143" class="tg">1 thread: start all, waits overlap</text>
    <line x1="110" y1="165" x2="550" y2="165" stroke="currentColor" opacity="0.4"/><text x="520" y="178" class="tm">time</text>
  </svg><figcaption>Time runs left to right. Blue = the CPU actually working, grey = waiting for the network. One by one, the grey bars line up end to end. With threads or asyncio, the grey bars overlap, so the total is roughly one wait.</figcaption></figure>
  <table class="tbl">
    <tr><th>Your code mostly…</th><th>Example</th><th>Use</th><th>Why</th></tr>
    <tr><td>Waits on network/disk, tens of tasks</td><td>Call a REST API for 200 user IDs</td><td><strong>ThreadPoolExecutor</strong></td><td>Waiting threads don't block each other; works with normal libraries (requests, boto3)</td></tr>
    <tr><td>Waits, thousands of tasks</td><td>Crawl 10k URLs, websocket server</td><td><strong>asyncio</strong></td><td>A task costs ~KB, a thread ~MB; no locks needed</td></tr>
    <tr><td>Computes in pure Python</td><td>Tokenise 1M docs, parse logs</td><td><strong>ProcessPoolExecutor</strong></td><td>Each process has its own GIL → really uses every core</td></tr>
    <tr><td>Computes in numpy/torch</td><td>Matrix ops, model forward pass</td><td>Vectorise first</td><td>C code already runs fast and often uses many cores</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Concurrency</strong>: making progress on several tasks by switching between them (one cook, many pans). <strong>Parallelism</strong>: running them at literally the same instant on different CPU cores (many cooks). Threads and asyncio give concurrency in Python; processes give parallelism.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Reaching for concurrency before checking. If one slow SQL query takes 90% of the time, running ten copies in parallel just loads the database ten times harder. Time the parts first (see profiling in <a class="xref" data-note="py_testing">Testing &amp; Debugging</a>).</p></div>

  <h2 id="pc-gil"><span class="num">02</span>The GIL</h2>
  <p>A natural idea: "my laptop has 4 cores, so 4 threads will make my number-crunching loop 4 times faster". In Python (the normal CPython interpreter) this does not happen. Two threads doing pure-Python calculation take about as long as doing the two jobs one after the other. The reason is the GIL.</p>
  <p>Python keeps a count on every object of how many things point at it, and frees the object when the count hits zero. If two threads changed the same count at the same moment, the count could go wrong and memory could be freed while still in use. The simple solution CPython chose: one big lock, the <strong>Global Interpreter Lock</strong>. A thread must hold it to run Python code. So at any instant only one thread runs Python code, even on a 16-core machine.</p>
  <p>The good news: a thread <em>gives the lock away</em> whenever it starts waiting (for the network, a file, <code>time.sleep</code>) and whenever it enters heavy C code that doesn't touch Python objects (most numpy, pandas and PyTorch work). So waiting threads overlap perfectly; computing threads take turns.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A singing competition with one microphone. Only the singer holding the mic can sing, however many singers are on stage. When a singer goes backstage for water (waiting for I/O), they hand the mic to someone else, so backstage breaks overlap with singing. numpy is a singer who brought their own speaker: they can perform without the shared mic.</p></div>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
    <text x="10" y="18" class="tm">CPU-bound: threads take turns</text>
    <text x="10" y="45">T1</text><text x="10" y="75">T2</text>
    <rect x="40" y="33" width="50" height="16" class="fb sb"/><rect x="90" y="33" width="50" height="16" fill="none" stroke="currentColor" opacity="0.4"/>
    <rect x="140" y="33" width="50" height="16" class="fb sb"/><rect x="190" y="33" width="50" height="16" fill="none" stroke="currentColor" opacity="0.4"/>
    <rect x="40" y="63" width="50" height="16" fill="none" stroke="currentColor" opacity="0.4"/><rect x="90" y="63" width="50" height="16" class="ft st"/>
    <rect x="140" y="63" width="50" height="16" fill="none" stroke="currentColor" opacity="0.4"/><rect x="190" y="63" width="50" height="16" class="ft st"/>
    <text x="40" y="105" class="tr">total = T1 + T2 → no speed-up</text>
    <text x="300" y="18" class="tm">I/O-bound: wait without the GIL</text>
    <text x="300" y="45">T1</text><text x="300" y="75">T2</text>
    <rect x="330" y="33" width="25" height="16" class="fb sb"/><rect x="355" y="33" width="150" height="16" class="fs"/>
    <rect x="355" y="63" width="25" height="16" class="ft st"/><rect x="380" y="63" width="150" height="16" class="fs"/>
    <text x="330" y="105" class="tg">T2 runs while T1 waits → overlap</text>
    <rect x="40" y="122" width="12" height="12" class="fb sb"/><text x="58" y="132" class="tm">holds GIL</text>
    <rect x="140" y="122" width="12" height="12" fill="none" stroke="currentColor" opacity="0.4"/><text x="158" y="132" class="tm">wants GIL</text>
    <rect x="320" y="122" width="12" height="12" class="fs"/><text x="338" y="132" class="tm">I/O wait (GIL free)</text>
  </svg><figcaption>Left: two computing threads. Only one holds the lock (filled box) while the other waits for it (empty box), so they alternate and the total time is the sum. Right: two waiting threads. Each holds the lock only briefly, then waits without it (grey), so the waits overlap.</figcaption></figure>
  <p>The code measures both cases with two threads: a pure-Python countdown (computing) and a sleep (waiting).</p>
  <div class="fx" data-lang="py">import threading, time

def count(n):                     # pure-Python CPU work: holds the GIL
    while n: n -= 1

def nap(secs):                    # waiting: releases the GIL
    time.sleep(secs)

def two_threads(fn, arg):
    ts = [threading.Thread(target=fn, args=(arg,)) for _ in range(2)]
    t = time.perf_counter()
    for th in ts: th.start()
    for th in ts: th.join()
    return time.perf_counter() - t

t = time.perf_counter(); count(20_000_000); count(20_000_000)
print(f"CPU,  one after other: {time.perf_counter() - t:.2f}s")
print(f"CPU,  two threads:     {two_threads(count, 20_000_000):.2f}s")
t = time.perf_counter(); nap(0.5); nap(0.5)
print(f"wait, one after other: {time.perf_counter() - t:.2f}s")
print(f"wait, two threads:     {two_threads(nap, 0.5):.2f}s")</div>
  <div class="fx" data-lang="text">CPU,  one after other: 1.01s
CPU,  two threads:     1.07s
wait, one after other: 1.00s
wait, two threads:     0.50s</div>
  <p>Exactly the picture. Two counting threads took 1.07 s, slightly <em>slower</em> than doing it one after the other (1.01 s), because they also pay for handing the lock back and forth. Two sleeping threads took 0.50 s, half the sequential time, because sleeping releases the GIL.</p>
  <div class="callout def"><span class="label">Definition</span><p>The <strong>GIL</strong> (Global Interpreter Lock) is a mutex (a lock that one thread holds at a time) in CPython that allows only one thread to execute Python bytecode at a time. It protects the interpreter's internal state, mainly <strong>reference counts</strong>, the per-object counters that decide when memory is freed.</p></div>
  <ul>
    <li><strong>Released</strong> during socket/file I/O, <code>time.sleep</code>, and most numpy/pandas/torch heavy kernels.</li>
    <li><strong>Not released</strong> during pure-Python loops, so 4 computing threads ≈ 1 thread (measured again in section 07).</li>
    <li><strong>Free-threaded Python</strong> (<code>python3.13t</code>, officially supported from 3.14) removes the GIL, but it is a separate opt-in build and some C extensions still lag.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span><p>"The GIL makes my code thread-safe." No. It guards the interpreter's internals, not your logic. Python can switch threads between any two steps of your code, so updating your own shared variable can still go wrong (next section).</p></div>

  <h2 id="pc-thr"><span class="num">03</span>Threading</h2>
  <p>A <strong>thread</strong> is a separate line of execution inside your program. All threads share the same memory (the same variables), and the operating system switches between them. You give a thread a function to run, start it, and later wait for it to finish.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Several cooks in one kitchen sharing one fridge and one counter. Very easy to share ingredients, because everything is right there. But if two cooks grab the same bowl at the same moment, things spill.</p></div>
  <div class="fx" data-lang="py">import threading, time

def worker(name, secs):
    print(f"{name} start")
    time.sleep(secs)              # waiting: other threads can run
    print(f"{name} done after {secs}s")

t0 = time.perf_counter()
a = threading.Thread(target=worker, args=("A", 0.3))
b = threading.Thread(target=worker, args=("B", 0.1))
a.start(); b.start()              # both begin now
print("main: threads started")
a.join(); b.join()                # wait for both to finish
print(f"main: all done in {time.perf_counter() - t0:.1f}s")</div>
  <div class="fx" data-lang="text">A start
B start
main: threads started
B done after 0.1s
A done after 0.3s
main: all done in 0.3s</div>
  <p><code>Thread(target=worker, args=(...))</code> creates the thread; note <code>target=worker</code> without brackets, because we pass the function, not its result. <code>start()</code> begins running it in the background and returns at once, which is why "main: threads started" is printed while A and B are still sleeping. B finished first because it slept less. <code>join()</code> makes the main program wait until that thread is done. The total is 0.3 s, the longest single wait, not 0.4 s. Run it a few times and the first three lines can come out in a different order (once they even merged on one line): the operating system decides who runs when. That unpredictability is the root of the next problem.</p>
  <h3>Race condition, seen for real</h3>
  <p>Four threads each add 1 to a shared <code>counter</code> 200,000 times. The answer should be 800,000. "Add 1" is really three steps: <em>read</em> the current value, <em>compute</em> value + 1, <em>write</em> it back. If Python switches threads between the read and the write, two threads can read the same old value and both write the same new value. One addition is lost.</p>
  <table class="tbl out"><caption>How one update gets lost (counter starts at 5)</caption>
    <tr><th>Step</th><th>Thread 1</th><th>Thread 2</th><th>counter</th></tr>
    <tr><td>1</td><td>reads 5</td><td></td><td>5</td></tr>
    <tr><td>2</td><td>(switched out)</td><td>reads 5</td><td>5</td></tr>
    <tr><td>3</td><td></td><td>writes 5 + 1 = 6</td><td>6</td></tr>
    <tr><td>4</td><td>writes 5 + 1 = 6</td><td></td><td>6 (should be 7)</td></tr>
  </table>
  <p>A <strong>lock</strong> fixes it. <code>with lock:</code> means "only one thread may be inside this block at a time; others wait at the door". The code runs the unsafe version three times and the locked version once.</p>
  <div class="fx" data-lang="py">import threading

def add_one(x):                  # any function call between read and write
    return x + 1

counter = 0
def unsafe(n):
    global counter
    for _ in range(n):
        counter = add_one(counter)   # READ counter ... call ... WRITE counter

lock = threading.Lock()
def safe(n):
    global counter
    for _ in range(n):
        with lock:
            counter = add_one(counter)

def run(fn, n=200_000, k=4):
    global counter
    counter = 0
    ts = [threading.Thread(target=fn, args=(n,)) for _ in range(k)]
    for t in ts: t.start()
    for t in ts: t.join()
    return counter

for _ in range(3):
    print("unsafe   :", run(unsafe), "/ 800000")
print("with lock:", run(safe), "/ 800000")</div>
  <div class="fx" data-lang="text">unsafe   : 664024 / 800000
unsafe   : 577640 / 800000
unsafe   : 659364 / 800000
with lock: 800000 / 800000</div>
  <figure class="viz"><svg viewBox="0 0 520 120" width="520">
    <text x="10" y="20">T1</text><text x="10" y="70">T2</text>
    <rect x="40" y="6" width="110" height="22" rx="4" class="fb sb"/><text x="48" y="22">read 5</text>
    <rect x="260" y="6" width="110" height="22" rx="4" class="fb sb"/><text x="268" y="22">write 6</text>
    <rect x="150" y="56" width="110" height="22" rx="4" class="ft st"/><text x="158" y="72">read 5</text>
    <rect x="370" y="56" width="110" height="22" rx="4" class="ft st"/><text x="378" y="72">write 6</text>
    <text x="40" y="108" class="tr">two increments, counter only +1 → one update lost</text>
  </svg><figcaption>The table above as a timeline. T2 reads before T1 has written, so both write 6.</figcaption></figure>
  <p>The unsafe runs lost between 136,000 and 222,000 updates, and the number was <em>different every time</em>. That is what makes races nasty: they may pass on your laptop and fail in production. With the lock, read-compute-write became one indivisible step and the answer was exactly right. (On Python 3.13 a bare <code>counter += 1</code> loop happened to give the right total, because CPython only switches threads at certain points. That is luck, not a guarantee: always lock shared data you change.)</p>
  <div class="callout def"><span class="label">Definition</span><p>A <strong>race condition</strong> is a bug where the result depends on the timing of threads. The code that touches shared data is the <strong>critical section</strong>; a <strong>lock</strong> (mutex) ensures only one thread is in it at a time. An operation that cannot be interrupted halfway is <strong>atomic</strong>.</p></div>
  <h3>Other sync tools</h3>
  <table class="tbl">
    <tr><th>Primitive</th><th>What it does</th><th>Use for</th></tr>
    <tr><td><code>Lock</code></td><td>One thread at a time</td><td>Protect a shared counter/dict</td></tr>
    <tr><td><code>RLock</code></td><td>Same thread can re-acquire</td><td>Recursive methods that lock</td></tr>
    <tr><td><code>Semaphore(n)</code></td><td>At most n threads inside</td><td>API rate / connection limits</td></tr>
    <tr><td><code>Event</code></td><td><code>set()</code> / <code>wait()</code> flag</td><td>"Model loaded, start serving"</td></tr>
    <tr><td><code>Condition</code></td><td>Wait until notified</td><td>Hand-rolled producer/consumer</td></tr>
    <tr><td><code>queue.Queue</code></td><td>Thread-safe FIFO</td><td>Usually better than raw locks</td></tr>
  </table>
  <p>A <strong>semaphore</strong> is a lock with n keys instead of one. Below, 10 worker threads run 12 "API calls", but the semaphore allows only 3 inside at once (say the API permits 3 parallel requests). The code also tracks the peak number inside.</p>
  <div class="fx" data-lang="py">import threading, time
from concurrent.futures import ThreadPoolExecutor

sem = threading.Semaphore(3)          # at most 3 threads inside at once
inside = 0; peak = 0; count_lock = threading.Lock()

def call_api(i):
    global inside, peak
    with sem:                         # wait here if 3 are already inside
        with count_lock:
            inside += 1; peak = max(peak, inside)
        time.sleep(0.1)               # the "API call"
        with count_lock:
            inside -= 1
    return i

t = time.perf_counter()
with ThreadPoolExecutor(max_workers=10) as ex:
    out = list(ex.map(call_api, range(12)))
print("results:", out[:5], "... peak concurrent:", peak, f"time: {time.perf_counter() - t:.2f}s")</div>
  <div class="fx" data-lang="text">results: [0, 1, 2, 3, 4] ... peak concurrent: 3 time: 0.41s</div>
  <p>Never more than 3 inside. 12 calls, 3 at a time, 0.1 s each → 4 rounds ≈ 0.4 s. (<code>count_lock</code> protects our own <code>inside</code> counter, a race we just learned about.)</p>
  <h3>Deadlock</h3>
  <p>Locks bring their own problem. Thread A takes Lock 1 and then wants Lock 2. At the same moment Thread B takes Lock 2 and then wants Lock 1. Each waits for the other to let go. Neither ever does. There is no error message: the program just hangs.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Two cars meet on a narrow one-lane bridge from opposite ends. Each driver waits for the other to reverse. Nobody does, and both wait forever. The fix is a traffic rule everyone follows: always enter from the north side first (one fixed lock order).</p></div>
  <figure class="viz"><svg viewBox="0 0 440 130" width="440">
    <defs><marker id="pc-ah1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="20" y="20" width="110" height="34" rx="6" class="fb sb"/><text x="40" y="42">Thread A</text>
    <rect x="310" y="20" width="110" height="34" rx="6" class="ft st"/><text x="330" y="42">Thread B</text>
    <rect x="20" y="86" width="110" height="30" rx="6" class="fs"/><text x="50" y="106">Lock 1</text>
    <rect x="310" y="86" width="110" height="30" rx="6" class="fs"/><text x="340" y="106">Lock 2</text>
    <line x1="75" y1="86" x2="75" y2="56" stroke="currentColor" stroke-width="2" marker-end="url(#pc-ah1)"/><text x="82" y="76" class="tm">holds</text>
    <line x1="365" y1="86" x2="365" y2="56" stroke="currentColor" stroke-width="2" marker-end="url(#pc-ah1)"/><text x="372" y="76" class="tm">holds</text>
    <line x1="130" y1="44" x2="308" y2="98" class="sr" stroke-width="2" stroke-dasharray="5 3" marker-end="url(#pc-ah1)"/>
    <line x1="310" y1="44" x2="132" y2="98" class="sr" stroke-width="2" stroke-dasharray="5 3" marker-end="url(#pc-ah1)"/>
    <text x="220" y="118" class="tr" text-anchor="middle">wants</text>
  </svg><figcaption>Solid arrows: each thread holds the lock below it. Dashed red arrows: each wants the lock the other holds. The circle can never break by itself.</figcaption></figure>
  <p>The code creates exactly this situation, but uses <code>acquire(timeout=1)</code> instead of a plain <code>with</code>, so one thread gives up after a second instead of hanging. Then it repeats with both threads taking the locks in the same order.</p>
  <div class="fx" data-lang="py">import threading, time
lock1, lock2 = threading.Lock(), threading.Lock()

def worker(name, first, second):
    with first:
        time.sleep(0.1)                       # let the other thread grab its lock
        if second.acquire(timeout=1):         # a plain 'with second:' would hang forever
            second.release(); print(name, "done")
        else:
            print(name, "gave up: deadlock")

a = threading.Thread(target=worker, args=("A", lock1, lock2))
b = threading.Thread(target=worker, args=("B", lock2, lock1))   # opposite order!
a.start(); b.start(); a.join(); b.join()

b = threading.Thread(target=worker, args=("B-fixed", lock1, lock2))  # same order
a = threading.Thread(target=worker, args=("A", lock1, lock2))
a.start(); b.start(); a.join(); b.join()</div>
  <div class="fx" data-lang="text">A gave up: deadlock
B done
A done
B-fixed done</div>
  <p>First pair: A held Lock 1, B held Lock 2, both wanted the other. After 1 s, A's timeout fired; A gave up and released Lock 1, which let B finish. (On another run it may be B that gives up; timing decides.) Second pair: both take Lock 1 first, so whoever gets it second simply waits its turn, and no circle can form.</p>
  <div class="callout trap"><span class="label">Trap</span><p>Deadlock fixes, best first: one lock order everywhere → <code>acquire(timeout=...)</code> → never hold a lock while doing slow I/O → replace shared state with a <code>queue.Queue</code> so threads pass messages instead of sharing variables.</p></div>
  <h3>ThreadPoolExecutor: the everyday API</h3>
  <p>Creating and joining threads by hand is fiddly. <code>concurrent.futures.ThreadPoolExecutor</code> keeps a pool of worker threads and hands them jobs. <code>submit(fn, args)</code> starts one job and returns a <strong>Future</strong>, a receipt you can later exchange for the result (or the error). <code>as_completed</code> gives the receipts back in the order the jobs finish.</p>
  <div class="fx" data-lang="py">from concurrent.futures import ThreadPoolExecutor, as_completed
import time

def download(name, secs):
    time.sleep(secs)
    if name == "c.csv": raise ValueError("404 not found")
    return f"{name} ok"

jobs = {"a.csv": 0.3, "b.csv": 0.1, "c.csv": 0.2}
with ThreadPoolExecutor(max_workers=3) as ex:
    futures = {ex.submit(download, n, s): n for n, s in jobs.items()}
    for fut in as_completed(futures):          # yields in finish order
        try:
            print(fut.result())
        except Exception as e:
            print(futures[fut], "failed:", e)</div>
  <div class="fx" data-lang="text">b.csv ok
c.csv failed: 404 not found
a.csv ok</div>
  <p>We submitted a, b, c, but got results b (0.1 s), c (0.2 s), a (0.3 s): finish order. <code>fut.result()</code> returns the value, or re-raises the error that happened inside the thread, so each failure is handled on its own without losing the others. The <code>futures</code> dict maps each receipt back to its file name for the error message. Leaving the <code>with</code> block waits for all workers.</p>
  <ul>
    <li><code>ex.map(fn, items)</code> → results in <em>input</em> order; the first exception re-raises when you reach it.</li>
    <li><code>submit</code> + <code>as_completed</code> → results in <em>finish</em> order; handle each error separately.</li>
  </ul>

  <h2 id="pc-mp"><span class="num">04</span>Multiprocessing</h2>
  <p>Threads cannot speed up pure-Python computing because of the GIL. The way around it is to run several separate Python programs. A <strong>process</strong> is a running program with its own memory. Each new Python process has its own interpreter and therefore its own GIL, so four processes really can compute on four cores at the same time.</p>
  <p>The price: processes share nothing by default. Data sent to a worker process (the function's arguments) and data coming back (the result) must be packed into bytes and unpacked on the other side. This packing is called <strong>pickling</strong> (Python's <code>pickle</code> format). Starting a process also takes much longer than starting a thread.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Threads are cooks in one kitchen sharing a fridge: fast to share, but they bump into each other. Processes are separate kitchens in different buildings: no collisions at all, but every ingredient has to be packed and sent by courier (pickling), and setting up a new kitchen takes time.</p></div>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
    <defs><marker id="pc-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="60" width="180" height="70" rx="8" class="fb sb"/><text x="22" y="82">Main process</text><text x="22" y="100" class="tm">interpreter + GIL</text><text x="22" y="116" class="tm">own memory</text>
    <rect x="420" y="10" width="170" height="62" rx="8" class="ft st"/><text x="432" y="32">Worker 1 · core 1</text><text x="432" y="52" class="tm">own GIL + memory</text>
    <rect x="420" y="118" width="170" height="62" rx="8" class="ft st"/><text x="432" y="140">Worker 2 · core 2</text><text x="432" y="160" class="tm">own GIL + memory</text>
    <line x1="190" y1="70" x2="416" y2="38" stroke="currentColor" stroke-width="1.5" marker-end="url(#pc-ah2)"/>
    <line x1="190" y1="120" x2="416" y2="152" stroke="currentColor" stroke-width="1.5" marker-end="url(#pc-ah2)"/>
    <text x="200" y="28" class="tm">Queue/Pipe: pickled</text>
    <rect x="245" y="75" width="140" height="42" rx="6" class="fv"/><text x="257" y="93">SharedMemory</text><text x="257" y="110" class="tm">no copy</text>
    <line x1="385" y1="96" x2="420" y2="66" stroke="currentColor" stroke-dasharray="3 3"/><line x1="385" y1="96" x2="420" y2="124" stroke="currentColor" stroke-dasharray="3 3"/>
  </svg><figcaption>Three separate programs, each with its own GIL and memory. Data crosses between them as pickled messages (solid arrows), or, for big arrays, by all of them attaching to one shared memory block (dashed lines).</figcaption></figure>
  <p><code>ProcessPoolExecutor</code> has the same interface as the thread pool. The code computes three sums in worker processes and checks they really ran in a different process (<code>os.getpid()</code> returns the current process's ID number).</p>
  <div class="fx" data-lang="py">from concurrent.futures import ProcessPoolExecutor
import os

def heavy(n):                                   # top-level: must be picklable
    return n, sum(i * i for i in range(n)), os.getpid()

if __name__ == "__main__":                      # required: children re-import this file
    print("parent pid:", os.getpid())
    with ProcessPoolExecutor(max_workers=2) as ex:
        for n, total, pid in ex.map(heavy, [10, 100, 1000], chunksize=1):
            print(n, total, "computed in a different process:", pid != os.getpid())</div>
  <div class="fx" data-lang="text">parent pid: 31082
10 285 computed in a different process: True
100 328350 computed in a different process: True
1000 332833500 computed in a different process: True</div>
  <p>Two details are required, not optional. <code>heavy</code> is defined at the top level of the file, because the worker has to find it by name after unpickling; a lambda or a function defined inside another function cannot be sent. And all the pool code sits under <code>if __name__ == "__main__":</code>. On macOS and Windows each worker starts by importing your file; without the guard, every worker would run the pool-creating code again and try to start its own workers. <code>chunksize</code> sends several items per message, which matters when you have thousands of tiny tasks.</p>
  <p>Because memory is separate, changing a global variable in a child does not change the parent's copy:</p>
  <div class="fx" data-lang="py">import multiprocessing as mp
counter = 0
def bump():
    global counter
    counter += 100
    print("child sees", counter)
if __name__ == "__main__":
    p = mp.Process(target=bump); p.start(); p.join()
    print("parent sees", counter)</div>
  <div class="fx" data-lang="text">child sees 100
parent sees 0</div>
  <h3>Talking between processes</h3>
  <p>So how do processes share results? Four standard channels, all in one script below: a <strong>Queue</strong> (a thread- and process-safe line of messages; we stop the workers by sending <code>None</code>, a "poison pill"), a <strong>Pipe</strong> (a two-ended connection between exactly two processes), <strong>SharedMemory</strong> (one block of memory that several processes attach to by name, so a big numpy array is never copied), and a <strong>Value</strong> (a single shared number with its own lock).</p>
  <div class="fx" data-lang="py">import multiprocessing as mp
from multiprocessing import shared_memory
import numpy as np

def worker(tasks, results):
    while (n := tasks.get()) is not None:      # None = poison pill
        results.put((n, sum(i * i for i in range(n))))

def child(conn):
    msg = conn.recv()                          # Pipe: two-way, two endpoints
    conn.send(msg.upper()); conn.close()

def double_in_place(name, shape):
    shm = shared_memory.SharedMemory(name=name)            # attach by name
    arr = np.ndarray(shape, dtype=np.float64, buffer=shm.buf)
    arr *= 2                                               # no copy, no pickling
    shm.close()

def bump(v):
    for _ in range(10_000):
        with v.get_lock(): v.value += 1      # += on a Value is NOT atomic

if __name__ == "__main__":
    # 1) Queue: producer/consumer with poison pills
    tasks, results = mp.Queue(), mp.Queue()
    procs = [mp.Process(target=worker, args=(tasks, results)) for _ in range(2)]
    for p in procs: p.start()
    for n in (10, 100, 1000): tasks.put(n)
    for _ in procs: tasks.put(None)
    print("queue:", sorted(results.get() for _ in range(3)))
    for p in procs: p.join()

    # 2) Pipe
    parent, kid = mp.Pipe()
    p = mp.Process(target=child, args=(kid,)); p.start()
    parent.send("hello"); print("pipe:", parent.recv()); p.join()

    # 3) Shared memory: one buffer, visible to both processes
    shm = shared_memory.SharedMemory(create=True, size=4 * 8)
    arr = np.ndarray((4,), dtype=np.float64, buffer=shm.buf)
    arr[:] = [1, 2, 3, 4]
    p = mp.Process(target=double_in_place, args=(shm.name, arr.shape)); p.start(); p.join()
    print("shared memory after child:", arr)
    del arr
    shm.close(); shm.unlink()                               # free it (once!)

    # 4) Value: shared counter, needs its lock
    v = mp.Value("i", 0)
    ps = [mp.Process(target=bump, args=(v,)) for _ in range(4)]
    for p in ps: p.start()
    for p in ps: p.join()
    print("Value:", v.value)
    print("start method:", mp.get_start_method())</div>
  <div class="fx" data-lang="text">queue: [(10, 285), (100, 328350), (1000, 332833500)]
pipe: HELLO
shared memory after child: [2. 4. 6. 8.]
Value: 40000
start method: fork</div>
  <p>Reading the results. Queue: two workers took jobs from <code>tasks</code> until each received a <code>None</code>, and put answers on <code>results</code>; we sort because the finish order varies. Pipe: the child received "hello" and sent back "HELLO". Shared memory: the child doubled the array <em>in place</em> and the parent saw <code>[2, 4, 6, 8]</code> without anything being copied; <code>close()</code> detaches each process, and <code>unlink()</code> frees the block once at the end (we <code>del arr</code> first because the array still points into it). Value: four processes added 10,000 each and got exactly 40,000 because each <code>+=</code> took the Value's lock.</p>
  <table class="tbl">
    <tr><th>Channel</th><th>Shape</th><th>Cost</th><th>Pick when</th></tr>
    <tr><td><code>Queue</code></td><td>Many producers ↔ many consumers</td><td>Pickle each item</td><td>Work queues, results</td></tr>
    <tr><td><code>Pipe</code></td><td>Exactly two ends</td><td>Pickle, a bit faster</td><td>Parent ↔ one child</td></tr>
    <tr><td><code>Value</code> / <code>Array</code></td><td>Typed C number/array</td><td>No pickle; lock it</td><td>Shared counters, flags</td></tr>
    <tr><td><code>SharedMemory</code></td><td>Raw buffer, attach by name</td><td>Zero-copy</td><td>Big numpy arrays read by many workers</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Process</strong>: an independent running program with its own memory. <strong>IPC</strong> (inter-process communication): any channel for passing data between processes. <strong>Pickling</strong>: serialising Python objects to bytes. <strong>Start method</strong>: how a child is created: <code>fork</code> (copy the parent; Linux default up to 3.13), <code>spawn</code> (fresh interpreter; macOS/Windows), <code>forkserver</code> (Linux default from 3.14).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Sending a 1 GB DataFrame to each worker. Pickling it can cost more than the work itself, and every worker holds a copy. Send file paths or row ranges and let each worker load its own piece, or use shared memory.</p></div>

  <h2 id="pc-aio"><span class="num">05</span>asyncio</h2>
  <p>Threads handle waiting well, but each thread costs memory (often ~1 MB of stack) and the operating system's time to switch. For 10,000 open connections (a chat server, crawling a large site) that becomes heavy, and you still need locks for shared data. <strong>asyncio</strong> handles many waits with a single thread and no operating-system switching at all.</p>
  <p>The idea: you write functions that say exactly where they will wait. At each such point the function voluntarily steps aside, and a scheduler called the <strong>event loop</strong> runs some other function that is ready. When the thing being waited for (a network reply, a timer) is ready, the loop resumes the first function where it stopped. This is the "pausing" of <a class="xref" data-note="py_advanced">generators</a>, applied to waiting.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>One chef, many dishes. She puts the pasta on to boil (starts a wait), and instead of staring at the pot she chops vegetables for the next dish. When the timer rings she comes back to the pasta. One person, many dishes in progress, nothing burnt. But if she stands staring at the pot (a blocking call), every dish stalls.</p></div>
  <p>Three keywords. <code>async def</code> defines a <strong>coroutine function</strong>; calling it does not run it, it returns a <strong>coroutine</strong> object (like calling a generator function). <code>await x</code> means "pause me here until x is done; meanwhile run others". <code>asyncio.run(main())</code> starts the event loop and runs <code>main</code> until it finishes.</p>
  <figure class="viz"><svg viewBox="0 0 590 200" width="590">
    <defs><marker id="pc-ah3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="180" height="50" rx="8" class="fb sb"/><text x="24" y="42">Ready queue</text><text x="24" y="60" class="tm">tasks able to run</text>
    <rect x="390" y="20" width="190" height="50" rx="8" class="fg sg"/><text x="402" y="42">Run one task</text><text x="402" y="60" class="tm">until it hits await</text>
    <rect x="170" y="135" width="250" height="50" rx="8" class="fs"/><text x="184" y="157">Waiting</text><text x="184" y="175" class="tm">sockets, timers (epoll)</text>
    <line x1="190" y1="45" x2="386" y2="45" stroke="currentColor" stroke-width="1.5" marker-end="url(#pc-ah3)"/><text x="245" y="38" class="tm">pick next</text>
    <line x1="480" y1="70" x2="400" y2="132" stroke="currentColor" stroke-width="1.5" marker-end="url(#pc-ah3)"/><text x="455" y="112" class="tm">await I/O</text>
    <line x1="200" y1="133" x2="110" y2="73" stroke="currentColor" stroke-width="1.5" marker-end="url(#pc-ah3)"/><text x="10" y="140" class="tm">I/O ready</text><text x="10" y="156" class="tm">→ wake</text>
  </svg><figcaption>The event loop goes round this circle forever on one thread. Take a ready task (top left), run it until it reaches an await (top right), park it in Waiting (bottom), and when its network reply or timer is ready, move it back to Ready.</figcaption></figure>
  <p>The code brews tea and coffee (each a 1-second wait) three ways: awaiting one after the other, running both with <code>gather</code>, and starting a task in the background with <code>create_task</code>. Each line prints the time since the start.</p>
  <div class="fx" data-lang="py">import asyncio, time

async def brew(name, secs):
    print(f"{time.perf_counter()-T0:.1f}s start {name}")
    await asyncio.sleep(secs)            # pause here; loop runs others
    print(f"{time.perf_counter()-T0:.1f}s done  {name}")
    return name

async def main():
    c = brew("x", 1)
    print(type(c).__name__)              # calling it does NOT run it
    c.close()

    t = time.perf_counter()
    await brew("tea", 1); await brew("coffee", 1)          # one after another
    print(f"awaited in turn: {time.perf_counter()-t:.1f}s")

    t = time.perf_counter()
    res = await asyncio.gather(brew("tea", 1), brew("coffee", 1))
    print(res, f"gather: {time.perf_counter()-t:.1f}s")

    task = asyncio.create_task(brew("toast", 0.5))         # scheduled, runs at next await
    print("doing other work while toast runs")
    print(await task)

T0 = time.perf_counter()
asyncio.run(main())</div>
  <div class="fx" data-lang="text">coroutine
0.0s start tea
1.0s done  tea
1.0s start coffee
2.0s done  coffee
awaited in turn: 2.0s
2.0s start tea
2.0s start coffee
3.0s done  tea
3.0s done  coffee
['tea', 'coffee'] gather: 1.0s
doing other work while toast runs
3.0s start toast
3.5s done  toast
toast</div>
  <p>Step by step. <code>brew("x", 1)</code> printed nothing and gave a <code>coroutine</code> object (we close it to avoid a "never awaited" warning). <code>await brew("tea", 1); await brew("coffee", 1)</code> took 2 s: <code>await</code> waits for that one coroutine to finish before the next line, so this is still sequential. <code>gather</code> wrapped both as tasks and started them together: both "start" lines at 2.0 s, both "done" at 3.0 s, total 1 s, results in the order given. <code>create_task</code> scheduled toast but it did not start until <code>main</code> reached its next <code>await</code>; that is why "doing other work" printed first.</p>
  <table class="tbl">
    <tr><th>Tool</th><th>Does</th></tr>
    <tr><td><code>asyncio.run(main())</code></td><td>Create loop, run until done, close. Once per program.</td></tr>
    <tr><td><code>await coro</code></td><td>Run it and wait; sequential if you await one by one</td></tr>
    <tr><td><code>gather(*coros)</code></td><td>Run together; results in input order</td></tr>
    <tr><td><code>create_task(coro)</code></td><td>Schedule now, collect later (keep a reference!)</td></tr>
    <tr><td><code>async with asyncio.TaskGroup()</code></td><td>3.11+: one failure cancels the rest</td></tr>
    <tr><td><code>async for</code> / async generator</td><td>Stream rows/pages lazily from an async source</td></tr>
  </table>
  <p>A <code>TaskGroup</code> is the safe way to run a group of tasks: if one fails, the others are cancelled and the error is reported, so nothing keeps running in the background unnoticed.</p>
  <div class="fx" data-lang="py">async def job(name, secs, fail=False):
    try:
        await asyncio.sleep(secs)
        if fail:
            raise ValueError(f"{name} broke")
        print(name, "finished")
        return name
    except asyncio.CancelledError:
        print(name, "cancelled")
        raise

async def main():
    try:
        async with asyncio.TaskGroup() as tg:          # Python 3.11+
            tg.create_task(job("a", 0.1))
            tg.create_task(job("b", 0.2, fail=True))
            tg.create_task(job("c", 1.0))
    except* ValueError as eg:
        print("TaskGroup error:", [str(e) for e in eg.exceptions])

asyncio.run(main())</div>
  <div class="fx" data-lang="text">a finished
c cancelled
TaskGroup error: ['b broke']</div>
  <p>a finished at 0.1 s. b failed at 0.2 s, so the group cancelled c (still sleeping) and raised the error as an <code>ExceptionGroup</code>; <code>except*</code> is the syntax that catches errors from such a group.</p>
  <h3>The blocking-call trap</h3>
  <p>asyncio only works if every wait is an <code>await</code>. A normal blocking call, like <code>time.sleep</code> or <code>requests.get</code>, holds the one and only thread, so the loop cannot run anything else. The code compares the right way, the wrong way, and the fix: <code>asyncio.to_thread</code> runs a blocking function in a helper thread and gives you something you can await.</p>
  <div class="fx" data-lang="py">async def ok(i):
    await asyncio.sleep(0.5); return i

async def blocking(i):
    time.sleep(0.5); return i            # BUG: blocks the whole loop

async def main():
    for fn in (ok, blocking):
        t = time.perf_counter()
        await asyncio.gather(*(fn(i) for i in range(4)))
        print(f"{fn.__name__:&lt;9} 4 tasks: {time.perf_counter()-t:.1f}s")

    t = time.perf_counter()               # fix: push blocking code to a thread
    await asyncio.gather(*(asyncio.to_thread(time.sleep, 0.5) for _ in range(4)))
    print(f"to_thread 4 tasks: {time.perf_counter()-t:.1f}s")

asyncio.run(main())</div>
  <div class="fx" data-lang="text">ok        4 tasks: 0.5s
blocking  4 tasks: 2.0s
to_thread 4 tasks: 0.5s</div>
  <p>Four <code>ok</code> tasks overlapped: 0.5 s. Four <code>blocking</code> tasks ran one after another: 2.0 s, even though they were "gathered", because <code>time.sleep</code> never let the loop switch. With <code>to_thread</code> the sleeps moved off the loop's thread and overlapped again.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Coroutine</strong>: the object returned by calling an <code>async def</code> function; it runs only when awaited or wrapped in a <strong>task</strong>. <strong>Event loop</strong>: the single-threaded scheduler that runs tasks until they await and resumes them when ready. This is <strong>cooperative multitasking</strong>: tasks must give up control themselves (threads are switched by the OS, which is <strong>preemptive</strong>).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Inside <code>async def</code>, any call that does not await blocks every task: <code>time.sleep</code>, <code>requests.get</code>, a normal database driver, a big pandas job. Use async libraries (httpx, aiohttp, asyncpg), <code>asyncio.to_thread</code>, or <code>loop.run_in_executor(ProcessPoolExecutor())</code> for CPU work.</p></div>

  <h2 id="pc-http"><span class="num">06</span>Async HTTP Against a Local Server</h2>
  <p>The classic real use: call an API for 50 IDs. Doing it right needs three things beyond <code>gather</code>. One shared <strong>client</strong>, so connections are reused instead of opening a new one per request (a <strong>connection pool</strong>). A <strong>semaphore</strong> to limit how many requests are in flight, because APIs block you if you fire 10,000 at once. And error handling so one bad ID doesn't kill the batch.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A bank with 10 counters and 50 customers. The semaphore is the token machine: at most 10 customers are served at once, the rest wait their turn. The shared client is keeping the counters open all day instead of setting up a new counter for each customer.</p></div>
  <div class="flow"><span>50 coroutines</span><span>Semaphore(10)</span><span>one AsyncClient pool</span><span>local API, 200 ms each</span><span>gather results</span></div>
  <p>To test without the internet, first a tiny local server (aiohttp) where every request takes 200 ms:</p>
  <div class="fx" data-lang="py"># server.py: a tiny local API; every request takes 200 ms
import asyncio
from aiohttp import web

async def item(request):
    await asyncio.sleep(0.2)
    return web.json_response({"id": int(request.match_info["i"])})

app = web.Application()
app.add_routes([web.get("/item/{i}", item)])
web.run_app(app, port=8765, print=None)</div>
  <p>Then the client: 50 requests through one <code>httpx.AsyncClient</code>, at most 10 at a time; a batch with one bad ID; and a timeout.</p>
  <div class="fx" data-lang="py">import asyncio, time
import httpx

URL = "http://127.0.0.1:8765/item/{}"
sem = asyncio.Semaphore(10)                  # at most 10 requests in flight

async def fetch(client, i):
    async with sem:
        r = await client.get(URL.format(i), timeout=5)
        r.raise_for_status()
        return r.json()["id"]

async def main():
    async with httpx.AsyncClient() as client:      # one pooled client, reused
        t = time.perf_counter()
        ids = await asyncio.gather(*(fetch(client, i) for i in range(50)))
        print(len(ids), "items", ids[:5], f"in {time.perf_counter()-t:.2f}s")

        bad = await asyncio.gather(fetch(client, 1), fetch(client, "x"),
                                   return_exceptions=True)
        print([type(x).__name__ if isinstance(x, Exception) else x for x in bad])

        try:
            async with asyncio.timeout(0.1):          # Python 3.11+
                await fetch(client, 2)
        except TimeoutError:
            print("timed out after 0.1s")

asyncio.run(main())</div>
  <div class="fx" data-lang="text">50 items [0, 1, 2, 3, 4] in 1.09s
[1, 'HTTPStatusError']
timed out after 0.1s</div>
  <p>Trace: 50 requests × 0.2 s would be 10 s one by one. With 10 allowed at once there are 5 "rounds" of 0.2 s = 1 s, and we measured 1.09 s. In the second batch, <code>"x"</code> made the server fail (it cannot turn "x" into an int) and return HTTP 500; <code>raise_for_status()</code> turned that into an <code>HTTPStatusError</code>, and <code>return_exceptions=True</code> put the error into the results list instead of throwing away the good result. The last request needed 0.2 s but was given 0.1 s, so <code>asyncio.timeout</code> cancelled it.</p>
  <p>aiohttp's client does the same: <code>async with aiohttp.ClientSession() as s:</code> then <code>async with s.get(url) as r: await r.json()</code>.</p>
  <div class="callout trap"><span class="label">Trap</span><p>Creating a new client per request throws away connection pooling (a new TCP and TLS handshake every time). Create one client and share it. And without a semaphore, 10,000 gathered requests hit the API at once and you get rate-limited or banned.</p></div>

  <h2 id="pc-bench"><span class="num">07</span>Timing Showdown</h2>
  <p>Now all four approaches on two jobs, on the same 4-core machine. The I/O job is 20 calls to the local 200 ms server. The CPU job is four pure-Python sums of 10 million squares. Here is the shape of the benchmark (each line is timed separately):</p>
  <div class="fx" data-lang="py">client = httpx.Client()       # one reusable connection pool (thread-safe)
def fetch(i):                 # I/O-bound: mostly waiting on the network
    return client.get(URL.format(i)).json()["id"]

def crunch(n):                # CPU-bound: pure-Python arithmetic
    return sum(i * i for i in range(n))
CPU_JOBS = [10_000_000] * 4

# timed:  [fetch(i) for i in range(20)]                     sequential
#         ThreadPoolExecutor(20).map(fetch, range(20))       threads
#         ProcessPoolExecutor(4).map(fetch_own, range(20))   processes (own client each)
#         asyncio.gather of 20 AsyncClient.get calls         asyncio
# and the same four for crunch over CPU_JOBS (async version: coroutines that never await)</div>
  <div class="fx" data-lang="text">I/O task: 20 HTTP calls, 200 ms each
sequential   4.05 s
threads      0.23 s
processes    1.46 s
asyncio      0.30 s
CPU task: 4 x sum of 10M squares (4 cores)
sequential   2.50 s
threads      2.44 s
processes    1.05 s
asyncio      2.25 s</div>
  <figure class="viz"><svg viewBox="0 0 480 228" width="480">
    <text x="10" y="18" class="tm">I/O: 20 HTTP calls × 200 ms</text>
    <text x="10" y="40">sequential</text><rect x="110" y="28" width="300" height="15" class="fs"/><text x="416" y="40">4.05 s</text>
    <text x="10" y="60">threads</text><rect x="110" y="48" width="17" height="15" class="fb sb"/><text x="133" y="60">0.23 s</text>
    <text x="10" y="80">processes</text><rect x="110" y="68" width="108" height="15" class="fv"/><text x="224" y="80">1.46 s</text>
    <text x="10" y="100">asyncio</text><rect x="110" y="88" width="22" height="15" class="ft st"/><text x="138" y="100">0.30 s</text>
    <text x="10" y="130" class="tm">CPU: 4 × sum of 10M squares</text>
    <text x="10" y="152">sequential</text><rect x="110" y="140" width="185" height="15" class="fs"/><text x="301" y="152">2.50 s</text>
    <text x="10" y="172">threads</text><rect x="110" y="160" width="181" height="15" class="fb sb"/><text x="297" y="172">2.44 s</text>
    <text x="10" y="192">processes</text><rect x="110" y="180" width="78" height="15" class="fv"/><text x="194" y="192">1.05 s</text>
    <text x="10" y="212">asyncio</text><rect x="110" y="200" width="167" height="15" class="ft st"/><text x="283" y="212">2.25 s</text>
  </svg><figcaption>Bar length = wall-clock seconds, same scale in both halves (shorter is better). Top: waiting work, where threads and asyncio win. Bottom: computing work, where only processes help.</figcaption></figure>
  <ul>
    <li><strong>I/O:</strong> threads and asyncio overlap the 200 ms waits: 13–18× faster than sequential. Processes help less: only 4 workers (so 5 rounds of waits), and each pays process start-up and opens its own connection.</li>
    <li><strong>CPU:</strong> threads and asyncio give nothing. The GIL lets only one thread compute, and the coroutines never <code>await</code>, so they just run one after another.</li>
    <li><strong>Processes on CPU:</strong> 1.05 s vs 2.50 s, a 2.4× win. Not the full 4× because this machine was busy with other work during the run (load average ≈ 6); on idle cores expect close to 4×.</li>
  </ul>
  <div class="callout intu"><span class="label">Key insight</span><p>The table in section 01 in numbers: waiting → threads or asyncio; computing → processes. And always measure, because start-up, pickling and machine load change the picture for small jobs.</p></div>

  <h2 id="pc-build"><span class="num">08</span>Build It</h2>
  <p>Fetch 200 records from the local server, then compute an expensive pure-Python feature for each. Stage 1 is waiting work, stage 2 is computing work, so each gets its own tool.</p>
  <div class="flow"><span>asyncio + httpx (Semaphore 20)</span><span>list of JSON records</span><span>ProcessPoolExecutor.map(featurise, chunksize=20)</span><span>DataFrame</span></div>
  <ol>
    <li>Run <code>server.py</code>; write <code>fetch_all(ids)</code> with one <code>AsyncClient</code>, a semaphore and <code>return_exceptions=True</code>. Log and drop failures.</li>
    <li>Write a top-level <code>featurise(record)</code> (e.g. the <code>crunch</code> loop). Map it over a process pool under <code>if __name__ == "__main__":</code>.</li>
    <li>Time each stage sequentially vs concurrently and check the results are identical.</li>
    <li>Stretch: replace the pool map with <code>await loop.run_in_executor(pool, featurise, rec)</code> so fetching and featurising overlap.</li>
  </ol>

  <h2 id="pc-traps"><span class="num">09</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: threads for CPU-bound Python</span>
    <p>Four threads running a pure-Python loop take as long as one (or longer). Use processes, or vectorise with numpy.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: shared data without a lock</span>
    <p><code>counter = counter + 1</code>, <code>d[k] = d.get(k, 0) + 1</code>, <code>if x not in seen: seen.append(x)</code> from several threads all lose updates sometimes. Wrap them in <code>with lock:</code> or give each thread its own data and merge at the end.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: locks taken in different orders</span>
    <p>Deadlock: the program hangs with no error. Pick one global order, use timeouts, or use queues.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: missing <code>__main__</code> guard / unpicklable worker</span>
    <p>On macOS/Windows, pool code at the top level re-runs in every child. Lambdas and nested functions cannot be sent to worker processes. Use top-level functions under <code>if __name__ == "__main__":</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: expecting a child process to change your globals</span>
    <p>Each process has its own memory. Return results, or use a Queue / Value / SharedMemory.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: blocking the event loop</span>
    <p><code>time.sleep</code>, <code>requests.get</code> or heavy pandas inside <code>async def</code> freezes every task. Use async libraries or <code>asyncio.to_thread</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: awaiting one by one and calling it concurrent</span>
    <p><code>for u in urls: await fetch(u)</code> is sequential. Use <code>gather</code> or a <code>TaskGroup</code>. And a <code>create_task</code> result with no reference kept can be garbage-collected mid-run.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: no limit on concurrency</span>
    <p>Gathering 10,000 requests at once gets you rate-limited, or exhausts sockets. Use a Semaphore and one shared client.</p>
  </div>

  <h2 id="pc-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the GIL and when does it matter?</summary><div class="qa-body">A CPython lock that allows one thread to execute Python bytecode at a time; it protects reference counting. It matters for CPU-bound pure-Python threads (no speed-up: 2 threads 1.07 s vs 1.01 s). It doesn't matter much for I/O-bound threads (released while waiting) or numpy-heavy code (C releases it). For CPU parallelism use processes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Threading vs multiprocessing vs asyncio: when do you use each?</summary><div class="qa-body">Threads: I/O-bound work with normal blocking libraries, tens to hundreds of tasks. Processes: CPU-bound pure-Python work; costs memory, start-up and pickling. asyncio: very many concurrent I/O waits (thousands of sockets) with async libraries; one thread, no locks, but the whole call path must be async.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Concurrency vs parallelism?</summary><div class="qa-body">Concurrency: several tasks in progress, switching between them (one cook, many pans; threads/asyncio). Parallelism: several tasks executing at the same instant on different cores (several cooks; processes). Concurrency helps waiting work; parallelism helps computing work.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a race condition and how do you prevent it?</summary><div class="qa-body">The result depends on thread timing: two threads read 5, both write 6, one increment lost. Prevent with a <code>Lock</code> around the read-modify-write (<code>with lock:</code> releases even on exceptions), or avoid sharing: give each thread its own data and combine via a <code>queue.Queue</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a deadlock and how do you prevent it?</summary><div class="qa-body">A circular wait: A holds L1 and wants L2, B holds L2 and wants L1, so both wait forever. Prevent with a single global lock order, <code>acquire(timeout=...)</code>, not holding locks during slow I/O, or queues instead of raw locks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a coroutine and how does <code>await</code> work?</summary><div class="qa-body">The object returned by calling an <code>async def</code> function; it does nothing until awaited or scheduled as a task. At <code>await</code> it suspends and hands control to the event loop, which runs other ready tasks and resumes it when the awaited thing completes. The switching is cooperative: code that never awaits blocks everything.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the total time? <code>await f(); await g()</code> vs <code>await asyncio.gather(f(), g())</code>, each sleeping 1 s.</summary><div class="qa-body">~2 s vs ~1 s. Awaiting one after another is sequential; <code>gather</code> runs them concurrently (measured: 2.0 s vs 1.0 s).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your async service got slow. You find <code>requests.get</code> inside an <code>async def</code>. Why is that a problem?</summary><div class="qa-body"><code>requests</code> blocks the thread, and the event loop runs on that thread, so every other task freezes for the duration. Switch to <code>httpx.AsyncClient</code>/<code>aiohttp</code>, or wrap the call in <code>await asyncio.to_thread(requests.get, url)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why might a ProcessPoolExecutor be <em>slower</em> than a plain loop?</summary><div class="qa-body">Overhead: starting processes, pickling arguments and results, and tiny tasks that each pay a round-trip. Fix with bigger tasks or <code>chunksize</code>, send paths not DataFrames, use shared memory, and check that cores are actually free.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do I need <code>if __name__ == "__main__":</code> with multiprocessing?</summary><div class="qa-body">With the spawn/forkserver start methods each child imports your main module. Unguarded top-level code would run again in every child, starting more processes. The guard makes pool creation run only in the parent.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you share a large numpy array with worker processes without copying it?</summary><div class="qa-body"><code>multiprocessing.shared_memory.SharedMemory</code>: create a buffer, wrap it with <code>np.ndarray(shape, dtype, buffer=shm.buf)</code>, pass <code>shm.name</code> to workers, who attach by name. Call <code>close()</code> in every process and <code>unlink()</code> once at the end. Writers still need coordination.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you stop 10,000 async requests from overwhelming an API?</summary><div class="qa-body">Wrap each request in <code>async with asyncio.Semaphore(n)</code> so at most n are in flight, reuse one client for connection pooling, set timeouts, and use <code>return_exceptions=True</code> (or a TaskGroup with retries) so one failure doesn't lose the batch.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>executor.map</code> vs <code>submit</code> + <code>as_completed</code>?</summary><div class="qa-body"><code>map</code> returns results in input order and re-raises the first exception when you reach it. <code>submit</code> returns Futures; <code>as_completed</code> yields them as they finish, so you can process fast results first and handle each failure separately.</div></details>
</main>`
});
