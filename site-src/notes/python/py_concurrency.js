// notes/python/py_concurrency.js — Concurrency & Async
Object.assign(TOPIC_CONTENT, {
  "py_concurrency": `<main>
  <h1>Concurrency &amp; Async</h1>
  <p class="lead">How to make Python do several things at once: threads for waiting, processes for computing, asyncio for thousands of waits. You need it for API-heavy data collection, parallel feature extraction and model-serving code. Builds on functions, generators and context managers.</p>

  <h2 id="pc-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Concurrency &amp; Async</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Pick the tool</div>
        <ul>
          <li><b>Find the bottleneck first</b> — waiting (I/O) or computing (CPU)?</li>
          <li><b>I/O-bound</b> (API calls, DB, files) → threads or asyncio</li>
          <li><b>CPU-bound</b> (pure-Python loops, parsing) → processes</li>
          <li><b>Thousands of connections</b> → asyncio (one thread, cheap tasks)</li>
          <li><b>numpy / pandas / torch</b> → already release the GIL in C; often no extra help needed</li>
          <li><b>Concurrency</b> = juggling tasks; <b>parallelism</b> = literally at the same instant</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">GIL</div>
        <ul>
          <li><b>Global Interpreter Lock</b> — only one thread runs Python bytecode at a time (CPython)</li>
          <li><b>Why</b> — protects reference counts; makes single-thread code fast and C extensions simple</li>
          <li><b>Released</b> during I/O waits, <code>time.sleep</code>, and heavy C code (numpy)</li>
          <li><b>Effect</b> — threads speed up I/O work, not pure-Python CPU work</li>
          <li>💡 one microphone on stage; whoever goes backstage (I/O) hands it over</li>
          <li><b>Free-threaded build</b> (3.13t+) removes it; opt-in, not the default</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Threads</div>
        <ul>
          <li><b>Shared memory</b> → easy data sharing, but races</li>
          <li><b>Race condition</b> — read-modify-write interleaves → lost updates (517k of 800k in our run)</li>
          <li><b>Lock</b> — <code>with lock:</code> one thread in the critical section</li>
          <li><b>RLock</b> re-entrant · <b>Semaphore(n)</b> max n inside · <b>Event</b> signal · <b>Condition</b> wait/notify</li>
          <li><b>Deadlock</b> — A holds L1 wants L2, B holds L2 wants L1 → hang</li>
          <li>⚠ Fix deadlock: same lock order everywhere; <code>acquire(timeout=)</code>; prefer queues</li>
          <li><b>ThreadPoolExecutor</b> — <code>map</code> (ordered) / <code>submit</code> + <code>as_completed</code> (finish order)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Processes</div>
        <ul>
          <li><b>Own interpreter, own GIL, own memory</b> → true CPU parallelism</li>
          <li><b>Cost</b> — slower start, more RAM, args/results are pickled</li>
          <li><b>ProcessPoolExecutor</b> — the default choice; <code>chunksize</code> for many tiny tasks</li>
          <li><b>IPC</b> — Queue (many-to-many, poison pill <code>None</code>), Pipe (two ends), Value/Array, SharedMemory (zero-copy numpy)</li>
          <li>⚠ Always guard with <code>if __name__ == "__main__":</code>; workers must be top-level functions</li>
          <li><b>Start method</b> — Linux fork (3.14: forkserver), macOS/Windows spawn</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">asyncio</div>
        <ul>
          <li><b>Coroutine</b> — <code>async def</code>; calling it returns an object, runs nothing</li>
          <li><b>await</b> — pause here, let the event loop run others</li>
          <li><b>Event loop</b> — single-threaded scheduler; resumes tasks when their I/O is ready</li>
          <li><b>gather</b> — run many, results in input order; <code>return_exceptions=True</code> keeps going</li>
          <li><b>create_task</b> — start now, await later; <b>TaskGroup</b> (3.11+) cancels siblings on error</li>
          <li>⚠ <code>time.sleep</code> / <code>requests</code> / heavy CPU inside async blocks everything → <code>asyncio.to_thread</code></li>
          <li>💡 one chef: chops veg while pasta boils</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Async HTTP</div>
        <ul>
          <li><b>httpx.AsyncClient</b> / <b>aiohttp.ClientSession</b> — one shared client, connection pooling</li>
          <li><b>Semaphore(10)</b> — cap requests in flight (rate limits, server load)</li>
          <li><b>Timeouts</b> — <code>async with asyncio.timeout(s)</code> (3.11+) or <code>wait_for</code></li>
          <li><b>raise_for_status()</b> — turn 4xx/5xx into exceptions</li>
          <li>50 calls × 200 ms, 10 at a time → 1.14 s instead of 10 s</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Measured here</div>
        <ul>
          <li><b>20 HTTP calls × 200 ms</b>: sequential 4.06 s · threads 0.26 s · asyncio 0.36 s · processes 1.87 s</li>
          <li><b>CPU loop × 4</b>: threads ≈ sequential (GIL); asyncio ≈ sequential (never awaits)</li>
          <li><b>CPU, processes</b>: 1.95 s vs 2.35 s on a busy box; ~N× only when N cores are free</li>
          <li><b>Rule</b> — measure; overheads (pickling, process start) can erase gains on small jobs</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pc-pick"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Pick the Right Tool</span><span class="rm-sub">I/O-bound vs CPU-bound</span></div></div>
      <div class="rm-item rm-done" data-target="pc-gil"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The GIL</span><span class="rm-sub">One microphone, many singers</span></div></div>
      <div class="rm-item rm-done" data-target="pc-thr"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Threading</span><span class="rm-sub">Races, locks, deadlocks, pools</span></div></div>
      <div class="rm-item rm-done" data-target="pc-mp"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Multiprocessing</span><span class="rm-sub">Pools, queues, pipes, shared memory</span></div></div>
      <div class="rm-item rm-done" data-target="pc-aio"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">asyncio</span><span class="rm-sub">Event loop, await, gather, tasks</span></div></div>
      <div class="rm-item rm-done" data-target="pc-http"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Async HTTP</span><span class="rm-sub">httpx against a local server</span></div></div>
      <div class="rm-item rm-done" data-target="pc-bench"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Timing Showdown</span><span class="rm-sub">Four models, two workloads</span></div></div>
      <div class="rm-item rm-done" data-target="pc-build"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Build It</span><span class="rm-sub">Parallel scraper + featuriser</span></div></div>
      <div class="rm-item rm-done" data-target="pc-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="pc-pick"><span class="num">01</span>Pick the Right Tool</h2>
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
  </svg><figcaption>Waiting is free to overlap. Threads and asyncio both hide the grey bars; only the blue (CPU) part still costs time.</figcaption></figure>
  <table class="tbl">
    <tr><th>Your code mostly…</th><th>Example</th><th>Use</th><th>Why</th></tr>
    <tr><td>Waits on network/disk, tens of tasks</td><td>Call a REST API for 200 user IDs</td><td><strong>ThreadPoolExecutor</strong></td><td>GIL is released while waiting; works with blocking libs (requests, boto3)</td></tr>
    <tr><td>Waits, thousands of tasks</td><td>Crawl 10k URLs, websocket server</td><td><strong>asyncio</strong></td><td>A task costs ~KB, a thread ~MB; no locks needed</td></tr>
    <tr><td>Computes in pure Python</td><td>Tokenise 1M docs, parse logs</td><td><strong>ProcessPoolExecutor</strong></td><td>Each process has its own GIL → real use of every core</td></tr>
    <tr><td>Computes in numpy/torch</td><td>Matrix ops, model forward pass</td><td>Vectorise first</td><td>C code already releases the GIL and uses many cores</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Concurrency</strong> = making progress on many tasks by switching. <strong>Parallelism</strong> = running them at the same instant on different cores. Threads/asyncio give concurrency; processes give parallelism.</p></div>

  <h2 id="pc-gil"><span class="num">02</span>The GIL</h2>
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
  </svg><figcaption>The GIL lets only one thread execute Python bytecode. It is handed over during I/O, so only waiting overlaps.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span><p>The <strong>GIL</strong> (Global Interpreter Lock) is a mutex in CPython. It protects reference counts — the counters that decide when an object is freed — from simultaneous updates.</p></div>
  <div class="callout anlg"><span class="label">Analogy</span><p>One microphone on stage. Only the singer holding it performs. A singer who goes backstage for a drink (I/O) hands it over. Breaks down for numpy: C code can sing without the mic.</p></div>
  <ul>
    <li><strong>Released</strong> during socket/file I/O, <code>time.sleep</code>, and most numpy/pandas/torch heavy kernels.</li>
    <li><strong>Not released</strong> during pure-Python loops, so 4 threads computing ≈ 1 thread (measured in section 07).</li>
    <li><strong>Free-threaded Python</strong> (<code>python3.13t</code>, officially supported from 3.14) removes the GIL, but it is a separate opt-in build and many C extensions still lag.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span><p>"The GIL makes my code thread-safe." No: it guards the interpreter's internals, not your logic. A read-modify-write on your own variable can still be interrupted (next section).</p></div>

  <h2 id="pc-thr"><span class="num">03</span>Threading</h2>
  <h3>Race condition, seen for real</h3>
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
  <div class="fx" data-lang="text">unsafe   : 517324 / 800000
unsafe   : 556747 / 800000
unsafe   : 633579 / 800000
with lock: 800000 / 800000</div>
  <figure class="viz"><svg viewBox="0 0 520 120" width="520">
    <text x="10" y="20">T1</text><text x="10" y="70">T2</text>
    <rect x="40" y="6" width="110" height="22" rx="4" class="fb sb"/><text x="48" y="22">read 5</text>
    <rect x="260" y="6" width="110" height="22" rx="4" class="fb sb"/><text x="268" y="22">write 6</text>
    <rect x="150" y="56" width="110" height="22" rx="4" class="ft st"/><text x="158" y="72">read 5</text>
    <rect x="370" y="56" width="110" height="22" rx="4" class="ft st"/><text x="378" y="72">write 6</text>
    <text x="40" y="108" class="tr">two increments, counter only +1 → one update lost</text>
  </svg><figcaption>A thread switch between the read and the write makes both threads write the same value.</figcaption></figure>
  <ul>
    <li>Wrong <em>and different</em> on every run: races are non-deterministic, so they pass tests and fail in prod.</li>
    <li>On 3.13 a bare <code>counter += 1</code> loop happened to give the right total here: CPython only switches threads at certain points. Luck, not a guarantee — always lock shared mutable state.</li>
  </ul>
  <h3>Sync primitives</h3>
  <table class="tbl">
    <tr><th>Primitive</th><th>What it does</th><th>Use for</th></tr>
    <tr><td><code>Lock</code></td><td>One thread at a time</td><td>Protect a shared counter/dict</td></tr>
    <tr><td><code>RLock</code></td><td>Same thread can re-acquire</td><td>Recursive methods that lock</td></tr>
    <tr><td><code>Semaphore(n)</code></td><td>At most n threads inside</td><td>API rate / connection limits</td></tr>
    <tr><td><code>Event</code></td><td><code>set()</code> / <code>wait()</code> flag</td><td>"Model loaded, start serving"</td></tr>
    <tr><td><code>Condition</code></td><td>Wait until notified</td><td>Hand-rolled producer/consumer</td></tr>
    <tr><td><code>queue.Queue</code></td><td>Thread-safe FIFO</td><td>Usually better than raw locks</td></tr>
  </table>
  <div class="fx" data-lang="py">sem = threading.Semaphore(3)          # at most 3 threads inside at once
# ... 12 tasks, 10 worker threads, each holds sem for 0.1 s and tracks the peak
with ThreadPoolExecutor(max_workers=10) as ex:
    out = list(ex.map(call_api, range(12)))</div>
  <div class="fx" data-lang="text">results: [0, 1, 2, 3, 4] ... peak concurrent: 3 time: 0.42s</div>
  <p>12 tasks, 3 at a time, 0.1 s each → 4 rounds ≈ 0.4 s.</p>
  <h3>Deadlock</h3>
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
  </svg><figcaption>A circular wait: each thread holds what the other needs. No error, the program just hangs.</figcaption></figure>
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
  <p>A's timeout broke the cycle and released Lock 1, so B could finish. With one global lock order, no cycle can form.</p>
  <div class="callout trap"><span class="label">Trap</span><p>Deadlock fixes, in order of preference: one lock order everywhere → <code>acquire(timeout=...)</code> → don't hold a lock while doing I/O → replace shared state with a <code>queue.Queue</code>.</p></div>
  <h3>ThreadPoolExecutor — the everyday API</h3>
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
  <ul>
    <li><code>ex.map(fn, items)</code> → results in <em>input</em> order; the first exception re-raises when you reach it.</li>
    <li><code>submit</code> + <code>as_completed</code> → results in <em>finish</em> order; handle each error separately.</li>
    <li>The <code>with</code> block waits for all workers (calls <code>shutdown(wait=True)</code>).</li>
  </ul>

  <h2 id="pc-mp"><span class="num">04</span>Multiprocessing</h2>
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
  </svg><figcaption>Processes share nothing by default. Data crosses by pickled messages, or by attaching to one shared buffer.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span><p>Threads are cooks in one kitchen sharing a fridge (fast, but they bump into each other). Processes are separate kitchens: no collisions, but ingredients must be couriered across (pickling).</p></div>
  <div class="fx" data-lang="py">from concurrent.futures import ProcessPoolExecutor

def heavy(n):                                   # top-level: must be picklable
    return sum(i * i for i in range(n))

if __name__ == "__main__":                      # required: children re-import this file
    with ProcessPoolExecutor(max_workers=4) as ex:
        print(list(ex.map(heavy, [10, 100, 1000], chunksize=1)))</div>
  <div class="fx" data-lang="text">[285, 328350, 332833500]</div>
  <h3>Talking between processes</h3>
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
  <table class="tbl">
    <tr><th>Channel</th><th>Shape</th><th>Cost</th><th>Pick when</th></tr>
    <tr><td><code>Queue</code></td><td>Many producers ↔ many consumers</td><td>Pickle each item</td><td>Work queues, results</td></tr>
    <tr><td><code>Pipe</code></td><td>Exactly two ends</td><td>Pickle, a bit faster</td><td>Parent ↔ one child</td></tr>
    <tr><td><code>Value</code> / <code>Array</code></td><td>Typed C scalar/array</td><td>No pickle; lock it</td><td>Shared counters, flags</td></tr>
    <tr><td><code>SharedMemory</code></td><td>Raw buffer, attach by name</td><td>Zero-copy</td><td>Big numpy arrays read by many workers</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span><p>Without <code>if __name__ == "__main__":</code>, spawn-based platforms (macOS, Windows) re-run your top-level code in every child: infinite process spawning or a RuntimeError. Lambdas and nested functions can't be pickled as workers.</p></div>
  <ul>
    <li><strong>Start methods:</strong> <code>fork</code> copies the parent instantly (Linux default up to 3.13; unsafe with threads); <code>spawn</code> starts fresh (macOS/Windows); Linux defaults to <code>forkserver</code> from 3.14.</li>
    <li><strong>Overhead:</strong> pickling a 1 GB DataFrame to each worker can cost more than the work. Send file paths or use shared memory.</li>
  </ul>

  <h2 id="pc-aio"><span class="num">05</span>asyncio</h2>
  <figure class="viz"><svg viewBox="0 0 590 200" width="590">
    <defs><marker id="pc-ah3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="180" height="50" rx="8" class="fb sb"/><text x="24" y="42">Ready queue</text><text x="24" y="60" class="tm">tasks able to run</text>
    <rect x="390" y="20" width="190" height="50" rx="8" class="fg sg"/><text x="402" y="42">Run one task</text><text x="402" y="60" class="tm">until it hits await</text>
    <rect x="170" y="135" width="250" height="50" rx="8" class="fs"/><text x="184" y="157">Waiting</text><text x="184" y="175" class="tm">sockets, timers (epoll)</text>
    <line x1="190" y1="45" x2="386" y2="45" stroke="currentColor" stroke-width="1.5" marker-end="url(#pc-ah3)"/><text x="245" y="38" class="tm">pick next</text>
    <line x1="480" y1="70" x2="400" y2="132" stroke="currentColor" stroke-width="1.5" marker-end="url(#pc-ah3)"/><text x="455" y="112" class="tm">await I/O</text>
    <line x1="200" y1="133" x2="110" y2="73" stroke="currentColor" stroke-width="1.5" marker-end="url(#pc-ah3)"/><text x="10" y="140" class="tm">I/O ready</text><text x="10" y="156" class="tm">→ wake</text>
  </svg><figcaption>The event loop: one thread cycles forever. A task runs until it awaits, then the loop runs someone else.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span><p>One chef, many dishes. While the pasta boils (await), they chop vegetables. If the chef stares at the pot (blocking call), every dish stalls.</p></div>
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
  <table class="tbl">
    <tr><th>Tool</th><th>Does</th></tr>
    <tr><td><code>asyncio.run(main())</code></td><td>Create loop, run until done, close. Once per program.</td></tr>
    <tr><td><code>await coro</code></td><td>Run it and wait; sequential if you await one by one</td></tr>
    <tr><td><code>gather(*coros)</code></td><td>Run together; results in input order</td></tr>
    <tr><td><code>create_task(coro)</code></td><td>Schedule now, collect later (keep a reference!)</td></tr>
    <tr><td><code>async with asyncio.TaskGroup()</code></td><td>3.11+: structured; one failure cancels the rest</td></tr>
    <tr><td><code>asyncio.wait(..., return_when=FIRST_COMPLETED)</code></td><td>Get <code>done, pending</code> sets for fine control</td></tr>
    <tr><td><code>async for</code> / async generator</td><td>Stream rows/pages lazily from an async source</td></tr>
  </table>
  <h3>The blocking-call trap</h3>
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
    print(f"to_thread 4 tasks: {time.perf_counter()-t:.1f}s")</div>
  <div class="fx" data-lang="text">ok        4 tasks: 0.5s
blocking  4 tasks: 2.0s
to_thread 4 tasks: 0.5s</div>
  <div class="callout trap"><span class="label">Trap</span><p>Inside <code>async def</code>, any non-awaiting call blocks every task: <code>time.sleep</code>, <code>requests.get</code>, a sync DB driver, a big pandas job. Use async libraries, <code>asyncio.to_thread</code>, or <code>loop.run_in_executor(ProcessPoolExecutor())</code> for CPU work.</p></div>

  <h2 id="pc-http"><span class="num">06</span>Async HTTP Against a Local Server</h2>
  <div class="flow"><span>50 coroutines</span><span>Semaphore(10)</span><span>one AsyncClient pool</span><span>local API, 200 ms each</span><span>gather results</span></div>
  <div class="fx" data-lang="py"># server.py: a tiny local API; every request takes 200 ms
import asyncio
from aiohttp import web

async def item(request):
    await asyncio.sleep(0.2)
    return web.json_response({"id": int(request.match_info["i"])})

app = web.Application()
app.add_routes([web.get("/item/{i}", item)])
web.run_app(app, port=8765, print=None)</div>
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
  <div class="fx" data-lang="text">50 items [0, 1, 2, 3, 4] in 1.14s
[1, 'HTTPStatusError']
timed out after 0.1s</div>
  <ul>
    <li>50 × 0.2 s = 10 s sequentially; 10 at a time → 5 rounds ≈ 1 s.</li>
    <li><code>"x"</code> made the server return 500; <code>return_exceptions=True</code> returned the error as a value instead of cancelling the batch.</li>
    <li>aiohttp equivalent: <code>async with aiohttp.ClientSession() as s:</code> then <code>async with s.get(url) as r: await r.json()</code>.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span><p>Creating a new client per request throws away connection pooling (new TCP + TLS each time). Create one client and share it. Without a semaphore, 10k gathered requests hit the API at once and you get rate-limited.</p></div>

  <h2 id="pc-bench"><span class="num">07</span>Timing Showdown</h2>
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
sequential   4.06 s
threads      0.26 s
processes    1.87 s
asyncio      0.36 s
CPU task: 4 x sum of 10M squares (4 cores)
sequential   2.35 s
threads      2.81 s
processes    1.95 s
asyncio      2.61 s</div>
  <figure class="viz"><svg viewBox="0 0 480 228" width="480">
    <text x="10" y="18" class="tm">I/O: 20 HTTP calls × 200 ms</text>
    <text x="10" y="40">sequential</text><rect x="110" y="28" width="300" height="15" class="fs"/><text x="416" y="40">4.06 s</text>
    <text x="10" y="60">threads</text><rect x="110" y="48" width="19" height="15" class="fb sb"/><text x="135" y="60">0.26 s</text>
    <text x="10" y="80">processes</text><rect x="110" y="68" width="138" height="15" class="fv"/><text x="254" y="80">1.87 s</text>
    <text x="10" y="100">asyncio</text><rect x="110" y="88" width="27" height="15" class="ft st"/><text x="143" y="100">0.36 s</text>
    <text x="10" y="130" class="tm">CPU: 4 × sum of 10M squares</text>
    <text x="10" y="152">sequential</text><rect x="110" y="140" width="174" height="15" class="fs"/><text x="290" y="152">2.35 s</text>
    <text x="10" y="172">threads</text><rect x="110" y="160" width="208" height="15" class="fb sb"/><text x="324" y="172">2.81 s</text>
    <text x="10" y="192">processes</text><rect x="110" y="180" width="144" height="15" class="fv"/><text x="260" y="192">1.95 s</text>
    <text x="10" y="212">asyncio</text><rect x="110" y="200" width="193" height="15" class="ft st"/><text x="309" y="212">2.61 s</text>
  </svg><figcaption>Bar length = wall-clock seconds (shorter is better).</figcaption></figure>
  <ul>
    <li><strong>I/O:</strong> threads and asyncio overlap the 200 ms waits (11–16× faster). Processes help less: only 4 workers and each pays process start-up and its own connection.</li>
    <li><strong>CPU:</strong> threads and asyncio give nothing — the GIL serialises pure-Python work and the coroutines never <code>await</code>.</li>
    <li><strong>Processes on CPU:</strong> 1.95 s vs 2.35 s, a modest win because this 4-core box was shared (load average ≈ 9 during the run). Each process does have its own GIL; on idle cores expect close to a 4× speed-up.</li>
  </ul>

  <h2 id="pc-build"><span class="num">08</span>Build It</h2>
  <p>Fetch 200 records from the local server, then compute an expensive pure-Python feature for each.</p>
  <div class="flow"><span>asyncio + httpx (Semaphore 20)</span><span>list of JSON records</span><span>ProcessPoolExecutor.map(featurise, chunksize=20)</span><span>DataFrame</span></div>
  <ol>
    <li>Run <code>server.py</code>; write <code>fetch_all(ids)</code> with one <code>AsyncClient</code>, a semaphore and <code>return_exceptions=True</code>. Log and drop failures.</li>
    <li>Write a top-level <code>featurise(record)</code> (e.g. the <code>crunch</code> loop). Map it over a process pool under <code>if __name__ == "__main__":</code>.</li>
    <li>Time each stage sequentially vs concurrently and check the results are identical.</li>
    <li>Stretch: replace the pool with <code>await loop.run_in_executor(pool, featurise, rec)</code> so fetching and featurising overlap.</li>
  </ol>

  <h2 id="pc-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the GIL and when does it matter?</summary><div class="qa-body">A CPython mutex allowing one thread to execute bytecode at a time; it protects reference counting. It matters for CPU-bound pure-Python threads (no speed-up). It doesn't matter much for I/O-bound threads (released while waiting) or numpy-heavy code (C releases it). For CPU parallelism use processes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Threading vs multiprocessing vs asyncio — when do you use each?</summary><div class="qa-body">Threads: I/O-bound work with blocking libraries, tens to hundreds of tasks. Processes: CPU-bound pure-Python work; costs memory, start-up and pickling. asyncio: very many concurrent I/O waits (thousands of sockets) with async-aware libraries; one thread, no locks, but the whole call path must be async.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a race condition and how do you prevent it?</summary><div class="qa-body">The result depends on thread timing: two threads read 5, both write 6, one increment lost. Prevent with a <code>Lock</code> around the read-modify-write (<code>with lock:</code> releases even on exceptions), or avoid sharing: give each thread its own data and combine via a <code>queue.Queue</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a deadlock and how do you prevent it?</summary><div class="qa-body">A circular wait: A holds L1 and wants L2, B holds L2 and wants L1, so both wait forever. Prevent with a single global lock order, <code>acquire(timeout=...)</code>, not holding locks during blocking I/O, or higher-level tools (queues) instead of raw locks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a coroutine and how does <code>await</code> work?</summary><div class="qa-body">An <code>async def</code> function; calling it returns a coroutine object that does nothing until awaited or scheduled. At <code>await</code> it suspends and hands control to the event loop, which runs other ready tasks and resumes it when the awaited thing completes. The switching is cooperative: code that never awaits blocks everything.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the total time? <code>await f(); await g()</code> vs <code>await asyncio.gather(f(), g())</code>, each sleeping 1 s.</summary><div class="qa-body">~2 s vs ~1 s. Awaiting one after another is sequential; <code>gather</code> runs them concurrently (measured: 2.0 s vs 1.0 s).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your async service got slow. You find <code>requests.get</code> inside an <code>async def</code>. Why is that a problem?</summary><div class="qa-body"><code>requests</code> blocks the thread, and the event loop runs on that thread, so every other task freezes for the duration. Switch to <code>httpx.AsyncClient</code>/<code>aiohttp</code>, or wrap the call in <code>await asyncio.to_thread(requests.get, url)</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why might a ProcessPoolExecutor be <em>slower</em> than a plain loop?</summary><div class="qa-body">Overhead: starting processes, pickling arguments and results across the boundary, and tiny tasks that each pay a round-trip. Fix with bigger tasks or <code>chunksize</code>, send paths not DataFrames, use shared memory, and check that cores are actually free.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do I need <code>if __name__ == "__main__":</code> with multiprocessing?</summary><div class="qa-body">With the spawn/forkserver start methods each child imports your main module. Unguarded top-level code would run again in every child, starting more processes. The guard makes pool creation run only in the parent.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you share a large numpy array with worker processes without copying it?</summary><div class="qa-body"><code>multiprocessing.shared_memory.SharedMemory</code>: create a buffer, wrap it with <code>np.ndarray(shape, dtype, buffer=shm.buf)</code>, pass <code>shm.name</code> to workers, who attach by name. Call <code>close()</code> in every process and <code>unlink()</code> once at the end. Writers still need coordination.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you stop 10,000 async requests from overwhelming an API?</summary><div class="qa-body">Wrap each request in <code>async with asyncio.Semaphore(n)</code> so at most n are in flight, reuse one client for connection pooling, set timeouts, and use <code>return_exceptions=True</code> (or a TaskGroup with retries) so one failure doesn't lose the batch.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>executor.map</code> vs <code>submit</code> + <code>as_completed</code>?</summary><div class="qa-body"><code>map</code> returns results in input order and re-raises the first exception when you iterate to it. <code>submit</code> returns Futures; <code>as_completed</code> yields them as they finish, so you can process fast results first and handle each failure separately.</div></details>
</main>`
});
