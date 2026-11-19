// notes/apis/api_production.js — Production Backend
Object.assign(TOPIC_CONTENT, {
  "api_production": `<main>
  <h1>Production Backend</h1>
  <div class="where"><span>APIs &amp; Backend</span><span>Production Backend</span></div>
  <p class="lead">Over the last few notes we built the Biteful food-ordering API: customers list restaurants, open Dosa Hut's menu, and place orders, and each order triggers a receipt email. On a laptop it runs as one program and has exactly one user, you. A production backend is the same code arranged so that it keeps working when thousands of real customers arrive at once, when a machine crashes, and when something slow or broken hides inside it. This note follows Biteful through its first lunch rush at 12:30, when Asha places order 101 for ₹240, Dosa Hut's menu is opened thousands of times, and Ben's buggy app hammers the API. Each problem that rush exposes is fixed with one standard tool (gunicorn workers, an nginx reverse proxy, a Redis cache, a Celery task queue, shared rate limits, structured logs and metrics, health checks, and horizontal scaling), and every demo was really run on this machine, a shared 4-core virtual machine, so all timings are approximate.</p>

  <h2 id="ap-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Production Backend</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">More copies</div>
        <ul>
          <li><b>gunicorn</b> runs N worker processes and restarts dead ones</li>
          <li><b>UvicornWorker</b>: each worker is an async event loop</li>
          <li><b>nginx</b>: one public address, many servers (round robin, failover, TLS)</li>
          <li><b>Horizontal scaling</b> works only if copies are stateless</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Less waiting</div>
        <ul>
          <li><b>Cache-aside</b> in Redis: get, miss, load, set with TTL</li>
          <li>Invalidate on change; lock against a <b>stampede</b></li>
          <li><b>Celery</b>: broker + workers + result backend; retries</li>
          <li>Tasks must be <b>idempotent</b> (safe to run twice)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Protection</div>
        <ul>
          <li>Fixed window, sliding window, token bucket</li>
          <li>Counters in Redis so every copy shares them</li>
          <li>429 Too Many Requests + <code>Retry-After</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Seeing inside</div>
        <ul>
          <li>JSON logs, one line per request, with a request id</li>
          <li>Prometheus counters and histograms; alert on p95/p99</li>
          <li>Golden signals: latency, traffic, errors, saturation</li>
          <li><code>/health</code> = restart me; <code>/ready</code> = stop sending traffic</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ap-arch"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Processes, Ports and the Production Layout</span><span class="rm-sub">why one program on one port is not enough</span></div></div>
      <div class="rm-item rm-done" data-target="ap-workers"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">gunicorn &amp; uvicorn Workers</span><span class="rm-sub">using every CPU core and surviving crashes</span></div></div>
      <div class="rm-item rm-done" data-target="ap-nginx"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">nginx Reverse Proxy &amp; Load Balancing</span><span class="rm-sub">one address in front of many servers</span></div></div>
      <div class="rm-item rm-done" data-target="ap-cache"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Caching with Redis</span><span class="rm-sub">cache-aside, TTL, invalidation, stampedes</span></div></div>
      <div class="rm-item rm-done" data-target="ap-celery"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Task Queues with Celery</span><span class="rm-sub">slow work outside the request, with retries</span></div></div>
      <div class="rm-item rm-done" data-target="ap-rl"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Rate Limiting at Scale</span><span class="rm-sub">windows, token buckets, shared counters</span></div></div>
      <div class="rm-item rm-done" data-target="ap-logs"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Structured Logging</span><span class="rm-sub">JSON lines and request ids</span></div></div>
      <div class="rm-item rm-done" data-target="ap-metrics"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Metrics, Monitoring &amp; Alerting</span><span class="rm-sub">percentiles, Prometheus, golden signals</span></div></div>
      <div class="rm-item rm-done" data-target="ap-health"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Health Checks</span><span class="rm-sub">liveness versus readiness</span></div></div>
      <div class="rm-item rm-done" data-target="ap-scale"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Horizontal Scaling</span><span class="rm-sub">stateless copies, measured</span></div></div>
      <div class="rm-item rm-done" data-target="ap-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">what breaks on day two</span></div></div>
      <div class="rm-item rm-done" data-target="ap-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, tables, commands</span></div></div>
      <div class="rm-item rm-done" data-target="ap-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the backend questions interviewers ask</span></div></div>
    </div>
  </div>

  <h2 id="ap-arch"><span class="num">01</span>Processes, Ports and the Production Layout</h2>
  <p>To see what production adds, we first need two words that the earlier notes used loosely. A <strong>process</strong> is one running program: when you type <code>uvicorn prod_app:app</code>, the operating system loads Python, gives it a slice of memory, and lets it run on the CPU; that running thing is a process, with its own number called a <strong>pid</strong> (process id). A <strong>port</strong> is a numbered door on a machine through which network connections arrive. A machine has one address on the network (its <strong>host</strong>, such as <code>10.0.1.11</code>, or <code>localhost</code> meaning "this same machine"), and many programs can listen on it at once because each listens on its own port: Redis on one number, our API on another. When a phone sends an HTTP request to "localhost port 18512", the operating system hands that connection to whichever process is listening on port 18512. (The <a class="xref" data-note="cf_os">Operating Systems</a> and <a class="xref" data-note="cf_networking">Networking</a> notes explain processes and ports in more depth.)</p>
  <p>Our Biteful API has an endpoint, "recommended for you", that ranks dishes for a customer. Ranking is pure calculation, about a quarter of a second of CPU time per request, with no waiting on a database or network. This is the endpoint we will use to stress the system:</p>
  <div class="fx" data-lang="py">@app.get("/v1/recommend")
def recommend(customer: str):
    """'Recommended for you': ranking dishes is pure CPU work, about 0.25 s."""
    t0 = time.thread_time()
    while time.thread_time() - t0 &lt; 0.25:           # burn 0.25 s of CPU in this thread
        pass
    return {"customer": customer, "top": ["Masala Dosa", "Idli"],
            "served_by": INSTANCE, "pid": os.getpid()}</div>
  <p>The function burns 0.25 s of CPU and then returns the top dishes, plus two fields that will be useful for the whole note: <code>served_by</code>, the name of the server that answered, and <code>pid</code>, the process that answered. To simulate eight customers opening the page at the same moment, we use a small script that sends eight requests in parallel threads and reports how long they took and how many requests each process handled:</p>
  <div class="fx" data-lang="py"># fire8.py: 8 customers open "recommended for you" at the same moment
import sys, threading, time
from collections import Counter
import httpx

port = sys.argv[1]
pids = []

def call(i):
    r = httpx.get(f"http://127.0.0.1:{port}/v1/recommend", params={"customer": f"c{i}"})
    pids.append(r.json()["pid"])

t0 = time.perf_counter()
threads = [threading.Thread(target=call, args=(i,)) for i in range(8)]
for t in threads: t.start()
for t in threads: t.join()
print(f"8 requests in {time.perf_counter() - t0:.2f} s; "
      f"requests per process: {sorted(Counter(pids).values(), reverse=True)}")</div>
  <p>Now we run the API the way we did on the laptop, as one uvicorn process, and fire eight requests at it. Then we kill the process, as a crash or an out-of-memory error would, and try one more request:</p>
  <div class="fx" data-lang="text">$ INSTANCE=api-1 uvicorn prod_app:app --port 18512 &amp;
$ curl -s 'localhost:18512/v1/recommend?customer=asha'
{"customer":"asha","top":["Masala Dosa","Idli"],"served_by":"api-1","pid":7434}

$ python fire8.py 18512
8 requests in 2.11 s; requests per process: [8]

$ kill -9 $(pgrep -f 'uvicorn prod_app')    # the process crashes
$ curl -sS 'localhost:18512/v1/recommend?customer=asha'
curl: (7) Failed to connect to localhost port 18512 after 0 ms: Couldn't connect to server</div>
  <p>The single request works. But the eight parallel requests take about 2 seconds, which is exactly 8 × 0.25 s: they were handled one after another, and the line "requests per process: [8]" confirms that one process did all of them. The reason is the <strong>GIL</strong> (global interpreter lock), a rule inside Python that lets only one thread run Python code at a time within one process. FastAPI's async features help when a request is <em>waiting</em> (for a database, for another API), but they cannot make one process <em>compute</em> on four CPU cores. So three of this machine's four cores sat idle while customers waited. The last command shows the second problem: once the process died, nothing brought it back, and every later request got "Couldn't connect to server" because no program was listening on that port any more.</p>
  <p>Those two failures are just the start of the lunch rush. Dosa Hut's menu costs a 0.5 s database query and is requested thousands of times with the same answer. The receipt email takes a second and sometimes times out. Ben's app has a bug that sends hundreds of requests a second. And when something breaks at 3 AM, nobody can tell which request failed or how many customers were affected. A production backend is the set of standard pieces that solve these problems, arranged like this:</p>
  <figure class="viz"><svg viewBox="0 0 640 300" width="640">
    <defs><marker id="ap-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="5" y="115" width="80" height="44" rx="6" class="fv sb"/><text x="45" y="141" text-anchor="middle">Apps</text>
    <rect x="110" y="105" width="110" height="64" rx="6" class="ft st"/><text x="165" y="130" text-anchor="middle">nginx</text><text x="165" y="148" text-anchor="middle" font-size="11" class="tm">TLS, limits, LB</text>
    <rect x="250" y="40" width="140" height="44" rx="6" class="fb sb"/><text x="320" y="60" text-anchor="middle">api-1</text><text x="320" y="76" text-anchor="middle" font-size="10" class="tm">gunicorn × uvicorn</text>
    <rect x="250" y="115" width="140" height="44" rx="6" class="fb sb"/><text x="320" y="135" text-anchor="middle">api-2</text><text x="320" y="151" text-anchor="middle" font-size="10" class="tm">gunicorn × uvicorn</text>
    <rect x="250" y="190" width="140" height="44" rx="6" class="fb sb"/><text x="320" y="216" text-anchor="middle">api-N</text>
    <rect x="430" y="10" width="95" height="40" rx="6" class="fr sr"/><text x="477" y="35" text-anchor="middle">Redis</text>
    <rect x="430" y="70" width="95" height="40" rx="6" class="fg sg"/><text x="477" y="95" text-anchor="middle">Postgres</text>
    <rect x="430" y="140" width="95" height="40" rx="6" class="fr sr"/><text x="477" y="165" text-anchor="middle">Broker</text>
    <rect x="545" y="140" width="90" height="40" rx="6" class="fv sb"/><text x="590" y="158" text-anchor="middle">Celery</text><text x="590" y="172" text-anchor="middle" font-size="10">receipts</text>
    <rect x="545" y="70" width="90" height="40" rx="6" class="ft st"/><text x="590" y="88" text-anchor="middle">Email</text><text x="590" y="102" text-anchor="middle" font-size="10">provider</text>
    <rect x="250" y="255" width="385" height="36" rx="6" class="ft st"/><text x="442" y="278" text-anchor="middle">JSON logs · Prometheus metrics · alerts (every copy)</text>
    <line x1="85" y1="137" x2="108" y2="137" stroke="currentColor" marker-end="url(#ap-ar)"/>
    <line x1="220" y1="125" x2="248" y2="65" stroke="currentColor" marker-end="url(#ap-ar)"/>
    <line x1="220" y1="137" x2="248" y2="137" stroke="currentColor" marker-end="url(#ap-ar)"/>
    <line x1="220" y1="150" x2="248" y2="208" stroke="currentColor" marker-end="url(#ap-ar)"/>
    <line x1="390" y1="55" x2="428" y2="32" stroke="currentColor" marker-end="url(#ap-ar)"/>
    <line x1="390" y1="130" x2="428" y2="92" stroke="currentColor" marker-end="url(#ap-ar)"/>
    <line x1="390" y1="145" x2="428" y2="158" stroke="currentColor" marker-end="url(#ap-ar)"/>
    <line x1="525" y1="160" x2="543" y2="160" stroke="currentColor" marker-end="url(#ap-ar)"/>
    <line x1="590" y1="140" x2="590" y2="112" stroke="currentColor" marker-end="url(#ap-ar)"/>
    <line x1="320" y1="234" x2="320" y2="253" stroke="currentColor" stroke-dasharray="3 3"/>
  </svg><figcaption>Identical API copies behind nginx; everything that must be remembered lives in shared services to the right; slow work goes through the broker to Celery workers.</figcaption></figure>
  <p>Follow Asha's order 101 through the picture from left to right. Her phone connects to one public address, where <strong>nginx</strong> receives the request, decrypts the HTTPS, checks that her IP address is not flooding the system, and forwards the request to one of several identical API servers, here api-2. Inside api-2, <strong>gunicorn</strong> runs several worker processes so that all CPU cores are used; one of them handles the request. To price the order it needs Dosa Hut's menu, which it reads from <strong>Redis</strong>, an in-memory store that answers in a fraction of a millisecond, rather than running the slow database query again. It saves the order in <strong>Postgres</strong>, the database. Instead of sending the receipt email itself, it drops a short message, "send receipt for order 101", into a <strong>broker</strong> (a queue) and immediately answers Asha with 201 Created; a separate <strong>Celery</strong> worker picks up the message and talks to the email provider, retrying if it times out. Along the bottom, every copy writes structured logs and exposes metrics, so humans and alerting systems can see what is happening.</p>
  <p>Think of a busy restaurant at Sunday lunch. The host at the door (nginx) greets every party and seats them at a free table, turning away a rowdy group. Several identical waiters (API workers) take orders. Popular dishes wait ready at the counter (the cache). Big catering orders go on a ticket to the back kitchen (the task queue) so the waiter can return to the floor. The manager watches a board showing how many tables are waiting (metrics), and when a waiter goes home sick, the host stops seating people at his tables (health checks).</p>
  <p>One rule makes this whole arrangement work, and the rest of the note keeps coming back to it. The API copies must be <strong>stateless</strong>, meaning a copy keeps nothing in its own memory between requests that another copy would need. Anything that must be remembered, such as cached menus, orders, queued jobs, rate-limit counters and sessions, lives in a shared service outside the copies. Only then can nginx send each request to any copy, and only then can any copy crash, or be added, without customers noticing. We will start inside a single machine, with the two failures we just saw.</p>

  <h2 id="ap-workers"><span class="num">02</span>gunicorn &amp; uvicorn Workers</h2>
  <p>The single uvicorn process left three cores idle and stayed dead after a crash. The obvious fix for the first problem is to run several copies of the program on the same machine, one per core, since each process has its own GIL and can compute in parallel with the others. The fix for the second problem is a supervisor that notices when a copy dies and starts a new one. A <strong>process manager</strong> is a program that does both: it starts a fixed number of copies of your app, called <strong>workers</strong>, watches them, and replaces any that die. <strong>gunicorn</strong> is the standard process manager for Python web apps.</p>
  <p>It helps to know the two kinds of Python web app, because gunicorn must be told which kind it is running. Flask apps follow a standard called <strong>WSGI</strong> (Web Server Gateway Interface), in which each request is a normal function call that runs until it returns. FastAPI apps follow <strong>ASGI</strong> (the asynchronous version), in which an event loop can juggle many requests that are waiting at the same time. gunicorn's default workers speak WSGI. For FastAPI we tell it to use workers from the <code>uvicorn-worker</code> package with <code>-k uvicorn_worker.UvicornWorker</code> (<code>-k</code> means "worker class"): gunicorn then manages the processes, and inside each process uvicorn runs the event loop and the FastAPI app. (Older guides write <code>uvicorn.workers.UvicornWorker</code>; that module is deprecated in favour of the separate package.)</p>
  <p>Think of gunicorn as the floor manager of one restaurant hall. The manager does not serve anybody himself. He hires four waiters, assigns each a section, and the moment one faints he calls in a replacement, while the other three carry on serving.</p>
  <p>When gunicorn starts, the first process it creates is the <strong>master</strong> (or arbiter). The master opens the listening port, then creates the workers as child processes that all share that port, so the operating system can hand each new connection to whichever worker accepts it first. The master itself never handles requests; it only watches its children. We start four workers (<code>-w 4</code>) on port 18510, fire the same eight requests twice, then look up the process ids and kill one worker with <code>kill -9</code>, which ends a process instantly the way the operating system's out-of-memory killer would:</p>
  <div class="fx" data-lang="text">$ INSTANCE=api-1 gunicorn prod_app:app -k uvicorn_worker.UvicornWorker -w 4 -b 127.0.0.1:18510 &amp;
$ python fire8.py 18510
8 requests in 0.86 s; requests per process: [3, 3, 1, 1]
$ python fire8.py 18510
8 requests in 0.88 s; requests per process: [3, 3, 1, 1]

$ pgrep -f '[g]unicorn prod_app'          # the master, then its 4 workers
7481
7482
7483
7484
7485
$ kill -9 7482                           # one worker dies, as if out of memory
$ pgrep -f '[g]unicorn prod_app'
7481
7483
7484
7485
7520
$ python fire8.py 18510
8 requests in 0.89 s; requests per process: [3, 2, 2, 1]

$ grep -E 'Starting|Booting|SIGKILL' gunicorn.log
[2026-11-19 07:34:25 +0000] [7481] [INFO] Starting gunicorn 27.0.1
[2026-11-19 07:34:25 +0000] [7482] [INFO] Booting worker with pid: 7482
[2026-11-19 07:34:25 +0000] [7483] [INFO] Booting worker with pid: 7483
[2026-11-19 07:34:26 +0000] [7484] [INFO] Booting worker with pid: 7484
[2026-11-19 07:34:26 +0000] [7485] [INFO] Booting worker with pid: 7485
[2026-11-19 07:34:30 +0000] [7481] [ERROR] Worker (pid:7482) was sent SIGKILL! Perhaps out of memory?
[2026-11-19 07:34:30 +0000] [7520] [INFO] Booting worker with pid: 7520</div>
  <p>The same eight requests now take about 0.9 s instead of 2 s, because four processes computed in parallel on four cores. The perfect result would be 8 × 0.25 ÷ 4 = 0.5 s, but the "requests per process" lists show why we did not get it: the operating system does not hand out connections perfectly evenly, so one worker received 3 requests while another received only 1, and the batch is only finished when the busiest worker finishes (3 × 0.25 = 0.75 s, plus overhead). After the kill, <code>pgrep</code> lists a brand-new pid in place of the dead one, and the gunicorn log shows exactly what happened: the master noticed that a worker "was sent SIGKILL! Perhaps out of memory?" and booted a replacement in the same second. The next batch of eight requests was served normally, and requests on the other three workers were never interrupted.</p>
  <p>How many workers should you run? Each worker can run Python on one core at a time, so for CPU-heavy or async apps a good starting point is one worker per core. The classic formula you will see in gunicorn's documentation, 2 × cores + 1, comes from synchronous (WSGI) apps that spend most of their time waiting on databases, where extra workers fill the waiting time. The other limit is memory. Every worker is a separate process that loads its own copy of everything the app loads at startup, so an ML model of 3 GB in eight workers needs 24 GB of RAM. The practical method is to start near the number of cores, cap the number by memory, and then measure under realistic load.</p>
  <p>gunicorn also handles a few operational chores that matter in production. Its <code>--timeout</code> setting (30 s by default) kills and replaces a worker that has stopped responding, which protects you from a worker stuck in an endless loop. Sending the master the signal <code>HUP</code> makes it start fresh workers with new code and retire the old ones gracefully, which is how a deployment can happen without dropping requests. And <code>--max-requests</code> restarts each worker after a set number of requests, a common safety net against slow memory leaks. What gunicorn cannot do is go beyond one machine: one machine has a ceiling on how many requests it can handle, and if it dies, everything on it dies. For that we need several machines and something in front of them.</p>

  <h2 id="ap-nginx"><span class="num">03</span>nginx Reverse Proxy &amp; Load Balancing</h2>
  <p>Suppose Biteful now runs two servers, api-1 and api-2, each running gunicorn. Asha's phone knows only one address, <code>api.biteful.in</code>. Something must sit at that address, decide which server gets each request, stop sending requests to a server that has died, deal with encryption, and turn away floods before they reach Python. That something is a <strong>reverse proxy</strong>: a server that accepts connections from clients and forwards each request to one of several backend servers, then passes the answer back. To the client it looks like a single server. When the reverse proxy's main job is spreading requests across servers, it is called a <strong>load balancer</strong>. <strong>nginx</strong> (pronounced "engine-x") is the most common one, and it plays both roles.</p>
  <p>Picture the host at a restaurant door again. Customers never walk into the kitchen or choose a waiter; they talk to the host, who checks the reservation, seats each party at a free table, refuses gate-crashers, and stops seating people at a table whose waiter has gone home. The host adds a little work at the door so that everything behind the door can be simpler.</p>
  <p>nginx is configured with a text file. The important part for us is an <strong>upstream</strong> block, nginx's name for the pool of backend servers, and a <code>location</code> block that says which requests go to that pool. nginx is not installed on this machine, so the configuration below is illustrative rather than something we ran, but every directive in it is standard:</p>
  <div class="fx" data-lang="text"># nginx.conf: Biteful's front door (illustrative; nginx is not installed on this machine)
upstream biteful_api {                        # the pool of identical, stateless app servers
    server 10.0.1.11:8000 max_fails=3 fail_timeout=10s;    # api-1
    server 10.0.1.12:8000 max_fails=3 fail_timeout=10s;    # api-2
}

limit_req_zone $binary_remote_addr zone=perip:10m rate=5r/s;   # coarse per-IP limit

server {
    listen 443 ssl;                           # HTTPS ends here (TLS termination)
    server_name api.biteful.in;
    ssl_certificate     /etc/ssl/biteful.crt;
    ssl_certificate_key /etc/ssl/biteful.key;

    client_max_body_size 1m;                  # refuse giant uploads at the door

    location / {
        limit_req zone=perip burst=10 nodelay;
        limit_req_status 429;
        proxy_pass http://biteful_api;        # round robin across the pool
        proxy_set_header Host $host;
        proxy_set_header X-Request-ID $request_id;               # trace id made at the edge
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_connect_timeout 2s;
        proxy_read_timeout 10s;
        proxy_next_upstream error timeout;    # server refused or timed out: try the next one
    }
}</div>
  <p>Reading it from the top: the <code>upstream biteful_api</code> block lists the two servers. By default nginx sends requests to them in turn, which is called <strong>round robin</strong>; other strategies include "least connections" (send to the server with the fewest requests in progress) and "IP hash" (always send the same client to the same server). <code>max_fails=3 fail_timeout=10s</code> means that after 3 failed attempts nginx stops using a server for 10 seconds. The <code>listen 443 ssl</code> line and the two certificate lines mean nginx handles HTTPS: it decrypts the request and forwards plain HTTP to the servers on the private network. This is called <strong>TLS termination</strong>, and it means the certificate lives in one place instead of on every app server. <code>limit_req_zone</code> and <code>limit_req</code> set a coarse per-IP rate limit (5 requests per second with bursts of 10), and <code>client_max_body_size</code> rejects huge uploads before they reach Python. Inside <code>location /</code>, <code>proxy_pass</code> forwards to the pool, <code>proxy_set_header</code> adds two headers we will need later (a fresh <code>X-Request-ID</code> for tracing, and <code>X-Forwarded-For</code> carrying the real client's address), the two timeouts stop nginx waiting forever, and <code>proxy_next_upstream</code> tells nginx to retry on another server if one refuses or times out.</p>
  <p>nginx also does something subtle that protects Python workers. A customer on a slow mobile connection may take seconds to send a request or receive a response. nginx is built to hold tens of thousands of such slow connections cheaply, so it reads the whole request from the phone first and only then passes it to a worker, and it collects the whole response from the worker and then trickles it out. Without this <strong>buffering</strong>, a worker would sit idle and blocked for the whole slow transfer.</p>
  <p>Because we cannot run nginx here, we can still watch the two core ideas, round robin and failover, with a toy reverse proxy written in Python. It listens on port 18520, forwards each request to api-1 or api-2 in turn, stamps the same two headers nginx would, and moves on to the next server if one refuses the connection:</p>
  <div class="fx" data-lang="py"># lb.py: a toy reverse proxy that does what nginx's upstream block does
import itertools, sys, threading, uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import httpx

UPSTREAMS = ["http://127.0.0.1:18510", "http://127.0.0.1:18511"]   # api-1, api-2
turn = itertools.cycle(range(len(UPSTREAMS)))
lock = threading.Lock()

class Proxy(BaseHTTPRequestHandler):
    def do_GET(self):
        headers = {k: v for k, v in self.headers.items() if k.lower() not in ("host", "connection")}
        headers.setdefault("X-Request-ID", uuid.uuid4().hex)       # trace id stamped at the edge
        headers["X-Forwarded-For"] = self.client_address[0]        # the real client's address
        with lock:
            first = next(turn)                                     # round robin: take turns
        for i in range(len(UPSTREAMS)):                            # on failure, try the next one
            upstream = UPSTREAMS[(first + i) % len(UPSTREAMS)]
            try:
                r = httpx.get(upstream + self.path, headers=headers, timeout=10)
                break
            except httpx.ConnectError:
                print(f"lb: {upstream} refused the connection, trying the next server", flush=True)
        else:
            self.send_error(502, "no upstream available")
            return
        self.send_response(r.status_code)
        for k in ("content-type", "x-request-id", "retry-after"):
            if k in r.headers:
                self.send_header(k, r.headers[k])
        self.send_header("content-length", str(len(r.content)))
        self.end_headers()
        self.wfile.write(r.content)

    def log_message(self, *args):                                  # keep the demo output quiet
        pass

ThreadingHTTPServer(("127.0.0.1", int(sys.argv[1])), Proxy).serve_forever()</div>
  <p>We start api-1 and api-2 (two gunicorn workers each, on ports 18510 and 18511) and the toy proxy, send four requests through the proxy, then stop api-2 completely and send four more:</p>
  <div class="fx" data-lang="text">$ INSTANCE=api-1 gunicorn prod_app:app -k uvicorn_worker.UvicornWorker -w 2 -b 127.0.0.1:18510 &amp;
$ INSTANCE=api-2 gunicorn prod_app:app -k uvicorn_worker.UvicornWorker -w 2 -b 127.0.0.1:18511 &amp;
$ python lb.py 18520 &amp;

$ for i in 1 2 3 4; do curl -s 'localhost:18520/v1/recommend?customer=asha'; echo; done
{"customer":"asha","top":["Masala Dosa","Idli"],"served_by":"api-1","pid":7559}
{"customer":"asha","top":["Masala Dosa","Idli"],"served_by":"api-2","pid":7564}
{"customer":"asha","top":["Masala Dosa","Idli"],"served_by":"api-1","pid":7559}
{"customer":"asha","top":["Masala Dosa","Idli"],"served_by":"api-2","pid":7564}

$ kill api-2                                    # the whole second server goes down
$ for i in 1 2 3 4; do curl -s -w ' [%{http_code}]' 'localhost:18520/v1/recommend?customer=asha'; echo; done
{"customer":"asha","top":["Masala Dosa","Idli"],"served_by":"api-1","pid":7560} [200]
{"customer":"asha","top":["Masala Dosa","Idli"],"served_by":"api-1","pid":7559} [200]
{"customer":"asha","top":["Masala Dosa","Idli"],"served_by":"api-1","pid":7559} [200]
{"customer":"asha","top":["Masala Dosa","Idli"],"served_by":"api-1","pid":7560} [200]

$ cat lb.log
lb: http://127.0.0.1:18511 refused the connection, trying the next server
lb: http://127.0.0.1:18511 refused the connection, trying the next server</div>
  <p>The first four replies alternate between <code>"served_by":"api-1"</code> and <code>"served_by":"api-2"</code>: that is round robin, and the different <code>pid</code> values show different gunicorn workers inside each server. After api-2 was stopped, all four requests still returned 200, all from api-1. The proxy's log shows why: twice it was api-2's turn, the connection was refused, and the proxy retried on the next server. The customer never saw the failure. This is the same behaviour that <code>proxy_next_upstream error timeout</code> gives you in nginx, and it is what makes running several servers worthwhile: one of them can die and the service stays up.</p>
  <p>Two consequences of putting a proxy in front are easy to miss. First, every request now reaches your app from the proxy's address, not the customer's, so per-IP rate limits and logs would see a single "user" unless you read the client's address from <code>X-Forwarded-For</code>, and you should trust that header only when it was set by your own proxy, because a client can send a fake one. Second, the proxy's timeouts must be longer than your slowest legitimate request, or nginx will give up and return 504 Gateway Timeout while the app is still working. With more servers we can serve more requests, but many of those requests are asking the same question, which brings us to caching.</p>

  <h2 id="ap-cache"><span class="num">04</span>Caching with Redis</h2>
  <p>Opening Dosa Hut's menu runs a database query that joins items, prices and photos, and takes about half a second. At 12:30 thousands of customers open the same menu, so the database does the same half-second of work thousands of times and produces the same answer every time. A <strong>cache</strong> is a small, fast store that keeps recent answers so they can be reused instead of recomputed. The cache must be shared, though: our API now runs as many processes on several machines, and a Python dictionary inside one worker would be invisible to all the others, giving every worker its own separate, separately stale copy.</p>
  <p><strong>Redis</strong> is the usual answer. It is a separate server program that keeps <strong>key-value</strong> data (a name, such as <code>menu:v1:10</code>, and a value stored under it) entirely in RAM, and every API process connects to it over the network. Because it never touches the disk to answer a read, a lookup takes a fraction of a millisecond. Think of the difference between your desk and the records room downstairs. Today's files stay on your desk and take a second to grab; everything else is in the records room, five minutes away. You clear the desk every evening so it does not overflow, and if someone updates a file downstairs you throw away your desk copy so you never work from an old version.</p>
  <p>The most common way to use a cache is called <strong>cache-aside</strong> (or lazy loading). The app asks the cache first. If the key is there, that is a <strong>hit</strong>, and the app returns it. If not, that is a <strong>miss</strong>: the app goes to the database, stores the result in the cache with an expiry time, and returns it. The expiry is called the <strong>TTL</strong> (time to live): Redis deletes the key by itself when the TTL runs out, so no answer can be older than that. We run a private Redis on port 18500 and let Asha, Ben and Chen open Dosa Hut (restaurant 10). Then Dosa Hut changes a price, so we delete the key, which is called <strong>invalidation</strong>, and read once more:</p>
  <div class="fx" data-lang="py">import json, time, redis

r = redis.Redis(port=18500, decode_responses=True)      # the shared cache every copy talks to
r.flushdb()

def load_menu_from_db(rid: int) -&gt; dict:
    time.sleep(0.5)                                      # stands in for a slow DB query (joins, photos)
    return {"restaurant_id": rid, "Masala Dosa": 120, "Idli": 60, "Filter Coffee": 40}

def get_menu(rid: int, ttl: int = 300) -&gt; dict:
    key = f"menu:v1:{rid}"
    cached = r.get(key)                                  # 1. look in the cache
    if cached is not None:
        return json.loads(cached)                        # 2a. hit: done
    value = load_menu_from_db(rid)                       # 2b. miss: go to the source
    r.set(key, json.dumps(value), ex=ttl)                # 3. remember it for 300 seconds
    return value

for name in ["Asha", "Ben", "Chen"]:                     # three customers open Dosa Hut (id 10)
    t = time.perf_counter()
    get_menu(10)
    print(f"{name:5} {(time.perf_counter() - t) * 1000:7.1f} ms")

print("stored  :", r.get("menu:v1:10"))
print("TTL left:", r.ttl("menu:v1:10"), "s")

r.delete("menu:v1:10")                                   # Dosa Hut changes a price: invalidate
t = time.perf_counter()
get_menu(10)
print(f"after invalidation: {(time.perf_counter() - t) * 1000:.1f} ms")</div>
  <div class="fx" data-lang="text">Asha    501.0 ms
Ben       0.2 ms
Chen      0.1 ms
stored  : {"restaurant_id": 10, "Masala Dosa": 120, "Idli": 60, "Filter Coffee": 40}
TTL left: 300 s
after invalidation: 500.8 ms</div>
  <p>Asha's request was a miss and paid the full half-second. Ben and Chen were hits and took a fraction of a millisecond, more than a thousand times faster, and the database was not touched at all. Redis stores strings, so the menu dictionary goes in through <code>json.dumps</code> and comes back through <code>json.loads</code>; the "stored" line shows the exact JSON text in Redis. <code>ex=ttl</code> set the TTL, and <code>r.ttl</code> reports 300 seconds left, so even if we forget an invalidation somewhere, nobody sees a menu more than five minutes old. After the price change we deleted the key, and the next read was a miss again (about 500 ms) that loaded the new prices. The <code>v1</code> in the key is a version label: if the menu's format ever changes, the code switches to <code>menu:v2:10</code> and the old entries are simply never read again and expire on their own.</p>
  <p>Cache-aside is not the only strategy, and interviewers often ask for the alternatives. They differ in when the cache is written:</p>
  <table class="tbl">
    <tr><th>Strategy</th><th>How it works</th><th>Good for</th><th>Weakness</th></tr>
    <tr><td>Cache-aside</td><td>app reads the cache, fills it on a miss</td><td>read-heavy data: menus, restaurant lists</td><td>first read is slow; data can be stale until TTL or invalidation</td></tr>
    <tr><td>Write-through</td><td>every write updates the database and the cache together</td><td>data that is read right after it is written</td><td>every write is slower; may cache data nobody reads</td></tr>
    <tr><td>Write-behind (write-back)</td><td>write to the cache now, flush to the database later</td><td>very write-heavy counters</td><td>data lost if the cache dies before flushing</td></tr>
  </table>
  <p>Because Redis lives in RAM, it can fill up. You set a memory limit (<code>maxmemory</code>) and an <strong>eviction policy</strong>, the rule for what to throw out when full; <code>allkeys-lru</code> removes the least recently used keys, which suits a cache well. That is a second reason every key should have a TTL: without one, memory only grows.</p>
  <p>Caching has one dangerous moment. At 12:30 the menu key expires, and within the next tenth of a second fifty customers open Dosa Hut. All fifty miss, and all fifty send the same half-second query, so the database suddenly gets fifty times the load at the busiest moment of the day. This is called a <strong>cache stampede</strong> (or thundering herd), and it can knock over the very database the cache was protecting. The fix is to let exactly one request refill the cache while the others wait briefly and read again. Redis gives us a simple lock for this: <code>SET key value NX EX 10</code> stores the key only if it does Not eXist yet, so among fifty simultaneous callers exactly one succeeds. We compare the plain version with the locked version, using fifty threads as fifty customers:</p>
  <div class="fx" data-lang="py">import json, threading, time, redis

r = redis.Redis(port=18500, decode_responses=True)
db_calls = 0

def slow_db(rid):
    global db_calls
    db_calls += 1
    time.sleep(0.5)
    return {"restaurant_id": rid, "Masala Dosa": 120}

def get_naive(rid):                                       # plain cache-aside, as before
    key = f"menu:v1:{rid}"
    if (v := r.get(key)) is not None:
        return json.loads(v)
    value = slow_db(rid)
    r.set(key, json.dumps(value), ex=300)
    return value

def get_with_lock(rid):
    key = f"menu:v1:{rid}"
    while True:
        if (v := r.get(key)) is not None:
            return json.loads(v)
        # only ONE caller can create the lock key (nx = only if it does Not eXist); it expires in 10 s
        if r.set(f"lock:{key}", "1", nx=True, ex=10):
            value = slow_db(rid)
            r.set(key, json.dumps(value), ex=300)
            r.delete(f"lock:{key}")
            return value
        time.sleep(0.05)                                  # someone else is refilling: wait, re-read

for fn in (get_naive, get_with_lock):
    r.flushdb(); db_calls = 0                             # 12:30: the menu key has just expired
    threads = [threading.Thread(target=fn, args=(10,)) for _ in range(50)]
    t = time.perf_counter()
    for th in threads: th.start()
    for th in threads: th.join()
    print(f"{fn.__name__:14} 50 customers at once -&gt; {db_calls:2} DB queries, {time.perf_counter() - t:.2f} s")</div>
  <div class="fx" data-lang="text">get_naive      50 customers at once -&gt; 50 DB queries, 0.53 s
get_with_lock  50 customers at once -&gt;  1 DB queries, 0.55 s</div>
  <p>The plain version sent 50 identical queries to the database. The locked version sent 1: the caller that won the lock loaded the menu and stored it, while the other 49 found the lock taken, slept 50 ms at a time, and then found the fresh value in the cache. Both took about half a second in total, but the database did one fiftieth of the work. The lock's own <code>ex=10</code> is important: if the winner crashes before deleting the lock, the lock expires by itself and someone else can refill. Two other common defences are adding a little random variation (<strong>jitter</strong>) to TTLs so that many keys do not expire at the same instant, and refreshing very popular keys shortly before they expire. Caching makes reads fast, but it does nothing for the receipt email, which is slow work that must happen after an order is placed.</p>

  <h2 id="ap-celery"><span class="num">05</span>Task Queues with Celery</h2>
  <p>When Asha places order 101, Biteful must send her a receipt email. Talking to the email provider takes about a second and sometimes times out. If the API sends the email inside the request, Asha waits an extra second, and a timeout turns her successful order into an error. The FastAPI note's <code>BackgroundTasks</code> improved this by sending the email after the response, but still inside the same web process: if that process is restarted during a deployment or crashes at that moment, the email is lost, with no retry and no record that it ever existed. What we need is a way to separate <em>asking</em> for slow work from <em>doing</em> it, in a way that survives crashes and retries failures.</p>
  <p>A <strong>task queue</strong> provides exactly that. The API writes a small message, "send receipt for order 101", into a queue and answers at once. Separate <strong>worker</strong> processes, which can run on other machines, take messages off the queue one by one and do the work. Think of a dry cleaner. You hand over your suit at the counter, get a numbered slip, and leave within two minutes; the cleaning happens in the back, and you can check later with your slip number whether it is "in progress" or "ready". If a machine breaks halfway, the suit goes back on the rack to be cleaned again.</p>
  <p><strong>Celery</strong> is the standard task queue for Python, and it has three parts. The <strong>broker</strong> is the queue itself, a service that stores messages until a worker takes them; we use Redis database 1 here (RabbitMQ is the other common choice). The <strong>workers</strong> are Celery processes that run your task functions. The <strong>result backend</strong> is where workers record each job's state and return value so the API can look them up; we use Redis database 2. Each message is identified by a job id, the "slip number". Here is the task. To demonstrate retries honestly, the first attempt for each order raises a timeout, as a flaky provider would; a small Redis database stands in for the orders database:</p>
  <div class="fx" data-lang="py"># tasks.py: Biteful's slow work, run by Celery workers
import time, redis
from celery import Celery

app = Celery("biteful", broker="redis://localhost:18500/1", backend="redis://localhost:18500/2")
app.conf.task_acks_late = True            # confirm a message only after the task finishes
app.conf.task_track_started = True        # report STARTED, not just PENDING -&gt; SUCCESS
store = redis.Redis(port=18500, db=3)     # stands in for the orders database

@app.task(bind=True, max_retries=3, default_retry_delay=2)
def send_receipt_email(self, order_id: int, customer: str, total: int):
    if store.exists(f"receipt-sent:{order_id}"):             # idempotency: already done?
        return {"order_id": order_id, "skipped": "receipt already sent"}
    try:
        if store.incr(f"attempts:{order_id}") == 1:          # the provider times out once
            raise ConnectionError("email provider timed out")
        time.sleep(1)                                        # talking to the email provider
    except ConnectionError as exc:
        raise self.retry(exc=exc)                            # back on the queue, try in 2 s
    store.set(f"receipt-sent:{order_id}", 1)                 # record that it is done
    return {"order_id": order_id, "sent_to": customer, "total": total,
            "attempt": self.request.retries + 1}</div>
  <p>The <code>@app.task</code> decorator turns a normal function into a Celery task. <code>bind=True</code> gives the function access to <code>self</code>, the running task, so it can call <code>self.retry</code>, which puts the job back on the queue to be tried again after <code>default_retry_delay</code> seconds, up to <code>max_retries</code> times. <code>task_acks_late</code> controls when the worker confirms ("acknowledges", or <strong>acks</strong>) a message to the broker: by default Celery acks as soon as a worker takes the message, but with acks_late it acks only after the task finishes, so if a worker crashes halfway, the broker still has the message and gives it to another worker. The first lines of the task check whether the receipt for this order was already sent; we will see why shortly.</p>
  <p>The API side needs only two endpoints. Placing an order calls <code>.delay()</code>, which writes the message to the broker and returns immediately with a job id; a second endpoint looks up a job's state in the result backend:</p>
  <div class="fx" data-lang="py"># orders_api.py: placing an order queues the receipt instead of sending it
from celery.result import AsyncResult
from fastapi import FastAPI
from tasks import app as celery_app, send_receipt_email

api = FastAPI()
NEXT_ID = [101]

@api.post("/v1/orders", status_code=201)
def create_order(customer: str, total: int):
    oid = NEXT_ID[0]; NEXT_ID[0] += 1
    job = send_receipt_email.delay(oid, customer, total)     # a message to the broker; returns at once
    return {"order_id": oid, "status": "placed", "receipt_job": job.id}

@api.get("/v1/jobs/{job_id}")
def job_status(job_id: str):
    res = AsyncResult(job_id, app=celery_app)
    body = {"job_id": job_id, "state": res.state}
    if res.successful():
        body["result"] = res.result
    return body</div>
  <p>Finally, a script plays Asha's phone: it places the order, then asks about the receipt job once a second until it finishes. At the end it sends the same receipt task for order 101 a second time, which is what happens when a message is delivered twice, and asks about a job id that never existed:</p>
  <div class="fx" data-lang="py"># submit.py: Asha places order 101 (Rs 240) and her app polls the receipt job
import time
from fastapi.testclient import TestClient
from orders_api import api
from tasks import send_receipt_email

c = TestClient(api)
t0 = time.perf_counter()
r = c.post("/v1/orders", params={"customer": "asha", "total": 240})
print(f"POST /v1/orders -&gt; {r.status_code} in {(time.perf_counter() - t0) * 1000:.0f} ms: {r.json()}")
job = r.json()["receipt_job"]
while True:
    s = c.get(f"/v1/jobs/{job}").json()
    extra = f"  result={s['result']}" if "result" in s else ""
    print(f"t={time.perf_counter() - t0:4.1f}s  state={s['state']}{extra}")
    if s["state"] in ("SUCCESS", "FAILURE"):
        break
    time.sleep(1)

again = send_receipt_email.delay(101, "asha", 240)           # the same message delivered twice
print("redelivered -&gt;", again.get(timeout=10))
print("unknown id  -&gt;", c.get("/v1/jobs/no-such-job").json())</div>
  <p>We start one Celery worker with two worker processes (<code>--concurrency=2</code>) in the background, writing its log to a file, then run the script and look at the worker's log:</p>
  <div class="fx" data-lang="text">$ celery -A tasks worker --concurrency=2 --loglevel=info &gt; celery.log &amp;
$ python submit.py
POST /v1/orders -&gt; 201 in 50 ms: {'order_id': 101, 'status': 'placed', 'receipt_job': '954de537-ddbf-46f4-a4b4-83fd232dd237'}
t= 0.1s  state=STARTED
t= 1.1s  state=RETRY
t= 2.1s  state=STARTED
t= 3.1s  state=SUCCESS  result={'order_id': 101, 'sent_to': 'asha', 'total': 240, 'attempt': 2}
redelivered -&gt; {'order_id': 101, 'skipped': 'receipt already sent'}
unknown id  -&gt; {'job_id': 'no-such-job', 'state': 'PENDING'}

$ grep -E 'received|retry|succeeded' celery.log | cut -c1-200
[2026-11-19 07:34:45,591: INFO/MainProcess] Task tasks.send_receipt_email[954de537-ddbf-46f4-a4b4-83fd232dd237] received
[2026-11-19 07:34:45,607: INFO/MainProcess] Task tasks.send_receipt_email[954de537-ddbf-46f4-a4b4-83fd232dd237] received
[2026-11-19 07:34:45,611: INFO/ForkPoolWorker-2] Task tasks.send_receipt_email[954de537-ddbf-46f4-a4b4-83fd232dd237] retry: Retry in 2s: ConnectionError('email provider timed out')
[2026-11-19 07:34:48,604: INFO/ForkPoolWorker-2] Task tasks.send_receipt_email[954de537-ddbf-46f4-a4b4-83fd232dd237] succeeded in 1.003049762999808s: {'order_id': 101, 'sent_to': 'asha', 'total': 240,
[2026-11-19 07:34:48,629: INFO/MainProcess] Task tasks.send_receipt_email[3c808f9f-b5d7-46e9-b4d4-f31206854817] received
[2026-11-19 07:34:48,632: INFO/ForkPoolWorker-2] Task tasks.send_receipt_email[3c808f9f-b5d7-46e9-b4d4-f31206854817] succeeded in 0.00257081399990966s: {'order_id': 101, 'skipped': 'receipt already se</div>
  <p>Read the two outputs side by side. <code>POST /v1/orders</code> returned 201 in a few tens of milliseconds (the first call also opened the connection to Redis), so Asha's app showed "order placed" without waiting for any email. Behind the scenes, the worker received the job, the provider "timed out", and <code>self.retry</code> scheduled a new attempt in 2 seconds; that is why the log shows the job "received" twice and a "retry" line, and why the status endpoint reported RETRY. The second attempt took about a second and succeeded, and the final status shows the task's return value with <code>'attempt': 2</code>. The states moved through STARTED, RETRY, STARTED again and SUCCESS; a job still waiting in the queue would have shown PENDING. If all retries had failed, the state would have been FAILURE, and the failure would be visible instead of silently lost.</p>
  <p>The line "redelivered" shows why the idempotency check exists. Retries and acks_late make Celery's guarantee "at least once": if a worker finishes sending the email but crashes before acking, the broker delivers the message again, and the task runs a second time. A task is <strong>idempotent</strong> when running it twice has the same effect as running it once. Our task records <code>receipt-sent:101</code> after sending and checks for it first, so the second delivery returned "receipt already sent" instead of emailing Asha twice. For payouts to restaurants this check is the difference between paying Dosa Hut once and paying it twice. A related habit is to pass ids rather than data: the message carries <code>order_id</code>, not a large order object, so the worker always reads the current order from the database.</p>
  <p>The last line is a well-known surprise. An id that never existed also reports PENDING, because Celery's result backend only knows about jobs that have started, so "waiting in the queue" and "no such job" look the same. If that difference matters, store job ids in your own database. Typical uses for a task queue are emails and SMS, payments and payouts, monthly statements, image resizing, report generation and model retraining; a separate tool called Celery beat can also put tasks on the queue on a schedule, like a cron job. With slow work moved out of requests, the system is fast, until one client starts sending far more requests than anyone else.</p>

  <h2 id="ap-rl"><span class="num">06</span>Rate Limiting at Scale</h2>
  <p>Ben's app ships with a bug: a retry loop with no pause that calls the orders API hundreds of times a second. Every request costs CPU and database time, so every other customer slows down. nginx's per-IP limit from section 03 helps against floods, but it is coarse: a whole office or college may share one IP address. We also want a limit per customer, such as "at most 5 calls per minute on this endpoint for each customer key". <strong>Rate limiting</strong> means capping how many requests one client may make in a period of time; when the cap is exceeded, the server answers <strong>429 Too Many Requests</strong>, usually with a <code>Retry-After</code> header telling the client how many seconds to wait. Think of a ticket counter that serves each person at most a few times an hour so one person cannot hold up the queue.</p>
  <p>There are several algorithms, and they behave differently at the edges. The simplest is the <strong>fixed window</strong>: keep one counter per client per clock minute, and refuse requests once it passes the limit. Its weakness appears at the boundary between two minutes. The <strong>sliding window</strong> instead asks "how many requests did this client make in the last 60 seconds, counting back from now?". We send Ben's 10 calls, 5 just before the minute ends (at 59.5 s) and 5 just after (at 60.2 s), through both:</p>
  <div class="fx" data-lang="py">from collections import defaultdict, deque

LIMIT, WINDOW = 5, 60                        # Ben's key: 5 calls per 60 seconds
times = [59.5] * 5 + [60.2] * 5              # 5 calls just before the minute ends, 5 just after

def fixed_window(times):
    counts, allowed = defaultdict(int), []
    for t in times:
        minute = int(t // WINDOW)            # which clock minute: 0 or 1
        counts[minute] += 1
        allowed.append(counts[minute] &lt;= LIMIT)
    return allowed

def sliding_window(times):
    recent, allowed = deque(), []
    for t in times:
        while recent and recent[0] &lt;= t - WINDOW:   # forget calls older than 60 s
            recent.popleft()
        ok = len(recent) &lt; LIMIT
        if ok:
            recent.append(t)
        allowed.append(ok)
    return allowed

print("fixed window  :", sum(fixed_window(times)), "of 10 allowed")
print("sliding window:", sum(sliding_window(times)), "of 10 allowed")</div>
  <div class="fx" data-lang="text">fixed window  : 10 of 10 allowed
sliding window: 5 of 10 allowed</div>
  <p>The fixed window let all 10 through in under a second, twice the intended limit. <code>int(t // WINDOW)</code> put the calls at 59.5 s into minute 0 and the calls at 60.2 s into minute 1, so each group found a fresh counter. The sliding window kept a list of recent call times in a <code>deque</code> (a list that is fast to remove from at the front); at 60.2 s the five calls from 59.5 s were still within the last 60 seconds, so the second group was refused, and only 5 passed.</p>
  <p>Real users are also bursty. When Asha opens the app it fires five calls at once and then nothing for a while, which is perfectly normal behaviour that a strict "one per 12 seconds" rule would wrongly punish. The <strong>token bucket</strong> handles this. Picture a pani-puri vendor whose plate holds at most 5 puris and who makes one new puri per second. Five friends arriving together can each grab one at once, but after that they get one per second, as fast as he makes them. In the algorithm, each client has a bucket holding up to <em>capacity</em> tokens that refills at <em>rate</em> tokens per second; each request spends one token, and an empty bucket means 429. Capacity sets the largest allowed burst, and rate sets the long-run average:</p>
  <div class="fx" data-lang="py">import time

class TokenBucket:
    """Holds up to capacity tokens and refills rate tokens per second. Each request spends one."""
    def __init__(self, capacity: int, rate: float):
        self.capacity, self.rate = capacity, rate
        self.tokens, self.last = capacity, time.monotonic()

    def allow(self) -&gt; bool:
        now = time.monotonic()
        self.tokens = min(self.capacity, self.tokens + (now - self.last) * self.rate)   # lazy refill
        self.last = now
        if self.tokens &gt;= 1:
            self.tokens -= 1
            return True
        return False

b = TokenBucket(capacity=5, rate=1)          # bursts of up to 5, then 1 request per second
print("burst of 8:     ", ["ok" if b.allow() else "429" for _ in range(8)])
time.sleep(2)
print("2 s later, 3:   ", ["ok" if b.allow() else "429" for _ in range(3)])</div>
  <div class="fx" data-lang="text">burst of 8:      ['ok', 'ok', 'ok', 'ok', 'ok', '429', '429', '429']
2 s later, 3:    ['ok', 'ok', '429']</div>
  <p>A full bucket of 5 allowed the first 5 requests of the burst and refused the next 3. After a 2-second pause, 2 tokens had refilled, so 2 of the next 3 requests passed. Notice that nothing runs in the background to add tokens: on every call the code computes how much time has passed since the last call, adds <code>elapsed × rate</code> tokens, and caps the total at capacity. This lazy refill means the bucket costs only two numbers per client. <code>time.monotonic()</code> is used rather than the wall clock because it never jumps backwards when the system clock is adjusted. nginx's <code>limit_req</code> uses a closely related algorithm, the <strong>leaky bucket</strong>, in which requests drain out at a fixed rate like water from a hole in a bucket.</p>
  <p>All of this has one more requirement in production: the counter must be shared. If each of our worker processes keeps its own counter in memory, a client whose requests are spread across 4 processes gets 4 times the limit (section 10 measures exactly this). So the counter lives in Redis. A neat way to build a sliding window there is a <strong>sorted set</strong>, a Redis collection in which each member has a numeric score and members are kept ordered by score. We store one member per request, scored by its timestamp:</p>
  <div class="fx" data-lang="py">import time, uuid, redis

r = redis.Redis(port=18500)                  # one counter store for ALL processes and servers

def allow_sliding(client: str, limit: int = 3, window_s: float = 1.0) -&gt; bool:
    key, now = f"rl:{client}", time.time()
    p = r.pipeline()                         # send the four commands in one round trip
    p.zremrangebyscore(key, 0, now - window_s)       # drop requests older than the window
    p.zadd(key, {uuid.uuid4().hex: now})             # record this request, scored by its time
    p.zcard(key)                                     # how many are left in the window?
    p.expire(key, int(window_s) + 1)                 # idle clients' keys clean themselves up
    _, _, count, _ = p.execute()
    return count &lt;= limit

r.delete("rl:ben")
print("5 fast calls:", ["ok" if allow_sliding("ben") else "429" for _ in range(5)])
time.sleep(1.1)
print("1.1 s later: ", ["ok" if allow_sliding("ben") else "429" for _ in range(2)])</div>
  <div class="fx" data-lang="text">5 fast calls: ['ok', 'ok', 'ok', '429', '429']
1.1 s later:  ['ok', 'ok']</div>
  <p>With a limit of 3 per second, the first 3 of 5 fast calls passed and the next 2 were refused; 1.1 seconds later the old entries had fallen out of the window and calls passed again. On each request, <code>zremrangebyscore</code> deletes entries older than the window, <code>zadd</code> records this request, <code>zcard</code> counts what is left, and <code>expire</code> lets an idle client's key disappear by itself. The <code>pipeline</code> sends all four commands to Redis in a single round trip, which keeps the check fast. Because every worker on every server talks to the same Redis, they all see the same count. (This version also records refused requests, which deliberately keeps punishing a client that keeps hammering; a production version would often wrap the steps in a small Lua script so they run as one atomic operation in Redis.)</p>
  <table class="tbl">
    <tr><th>Algorithm</th><th>Idea</th><th>Strength</th><th>Weakness</th></tr>
    <tr><td>Fixed window</td><td>one counter per clock window (Redis <code>INCR</code> + <code>EXPIRE</code>)</td><td>simplest, one number per client</td><td>up to 2× the limit at a window boundary</td></tr>
    <tr><td>Sliding window log</td><td>timestamp of every request (sorted set)</td><td>exact</td><td>memory grows with the limit</td></tr>
    <tr><td>Sliding window counter</td><td>weighted blend of the current and previous fixed windows</td><td>cheap and nearly exact</td><td>approximate</td></tr>
    <tr><td>Token bucket</td><td>tokens refill at a rate up to a capacity</td><td>allows bursts, caps the average</td><td>two numbers to tune</td></tr>
    <tr><td>Leaky bucket</td><td>requests leave at a fixed rate</td><td>perfectly smooth output</td><td>bursts wait or are dropped</td></tr>
  </table>
  <p>In practice limits are layered: a coarse per-IP limit at the edge (nginx) stops floods cheaply before they reach Python, and finer per-customer or per-API-key limits in the app, backed by Redis, enforce fairness. The system is now fast and protected. But when something does go wrong, we still cannot see it.</p>

  <h2 id="ap-logs"><span class="num">07</span>Structured Logging</h2>
  <p>At 10 AM a customer writes: "the app showed an error around 3 AM". Biteful runs four worker processes on two servers, each printing whatever its developers happened to <code>print</code>. Which process handled that request? What did it log? How many other customers had the same problem? With scattered print statements, nobody can answer. A <strong>log</strong> is the running diary a program writes about what it does, one entry per event. <strong>Structured logging</strong> means writing each entry as a machine-readable record with named fields, almost always one JSON object per line, instead of free-form sentences. Think of the difference between a diary written in prose and a form with labelled boxes: a computer can search a stack of forms for "status = 500" in a second, but it cannot reliably search prose.</p>
  <p>The place to write one entry per request is a <strong>middleware</strong>, a function that runs around every request: it sees the request on the way in, passes it to the endpoint, and sees the response on the way out. Our middleware times the request, records the method, path, status, duration, server name and pid, and writes all of it as one JSON line through Python's standard <code>logging</code> module with a small JSON formatter:</p>
  <div class="fx" data-lang="py">class JsonFormatter(logging.Formatter):
    """Turn every log record into one line of JSON with named fields."""
    def format(self, rec):
        return json.dumps({"ts": round(rec.created, 3), "level": rec.levelname,
                           "msg": rec.getMessage(), **getattr(rec, "fields", {})})

handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(JsonFormatter())
log = logging.getLogger("biteful")
log.addHandler(handler)
log.setLevel(logging.INFO)

@app.middleware("http")                              # runs around EVERY request
async def observe(request: Request, call_next):
    rid = request.headers.get("X-Request-ID") or uuid.uuid4().hex[:12]
    t0 = time.perf_counter()
    response = await call_next(request)
    seconds = time.perf_counter() - t0
    route = request.scope.get("route")
    path = route.path if route else request.url.path    # "/v1/orders/{oid}", not "/v1/orders/101"
    if path != "/metrics":
        REQS.labels(path, str(response.status_code)).inc()
        LAT.labels(path).observe(seconds)
        log.info("request", extra={"fields": {
            "request_id": rid, "method": request.method, "path": request.url.path,
            "status": response.status_code, "ms": round(seconds * 1000, 1),
            "instance": INSTANCE, "pid": os.getpid()}})
    response.headers["X-Request-ID"] = rid           # hand the id back to the caller too
    return response</div>
  <p>The middleware also handles a <strong>request id</strong>, a unique label for one request. If the request arrived with an <code>X-Request-ID</code> header (which nginx, or our toy proxy, adds at the edge), the middleware uses it; otherwise it makes one. It writes the id into the log line and sends it back in the response header. The point is that the same id appears in the proxy's logs, every app log line about that request, and any error message shown to the customer, so one search finds the request's whole story. (Libraries such as <code>structlog</code> do the same job with more features; the idea is identical.) We run api-1 and api-2 behind the proxy, writing their output to <code>api-1.log</code> and <code>api-2.log</code>, make one normal request and one request with a typo in the path, and then search the logs:</p>
  <div class="fx" data-lang="text">$ INSTANCE=api-1 gunicorn prod_app:app -k uvicorn_worker.UvicornWorker -w 2 -b 127.0.0.1:18510 &gt; api-1.log &amp;
$ INSTANCE=api-2 gunicorn prod_app:app -k uvicorn_worker.UvicornWorker -w 2 -b 127.0.0.1:18511 &gt; api-2.log &amp;
$ python lb.py 18520 &amp;

$ curl -si 'localhost:18520/v1/recommend?customer=asha' | grep -iE '^HTTP|^x-request-id'
HTTP/1.0 200 OK
x-request-id: 8c6ccab47c774c30804cb3bbaf556120
$ curl -s -o /dev/null localhost:18520/v1/restaurants/10/menuu

$ grep -h 8c6ccab47c774c30804cb3bbaf556120 api-*.log                  # find Asha's request
{"ts": 1795073697.375, "level": "INFO", "msg": "request", "request_id": "8c6ccab47c774c30804cb3bbaf556120", "method": "GET", "path": "/v1/recommend", "status": 200, "ms": 256.8, "instance": "api-1", "pid": 7739}
$ grep -h '"status": 404' api-*.log                                # every 404, from both servers
{"ts": 1795073697.413, "level": "INFO", "msg": "request", "request_id": "d1ad6f03d9c24cd484cc33f058705aeb", "method": "GET", "path": "/v1/restaurants/10/menuu", "status": 404, "ms": 0.4, "instance": "api-2", "pid": 7742}</div>
  <p>The <code>x-request-id</code> header in the response carried the id that the proxy stamped. Searching both servers' logs for that id found exactly one line, which tells us everything about Asha's request: it went to api-1, worker pid shown, took about 250 ms (the 0.25 s of CPU), and returned 200. The second search shows the other strength of structured logs: we asked for every line with <code>"status": 404</code> across both servers and found the typo request, on api-2. In production these lines are shipped to a central log system (such as Loki, Elasticsearch or a cloud provider's logging service), where you can filter by any field, for example <code>status=500 AND path="/v1/orders"</code> in the last hour, across every copy at once.</p>
  <p>Two habits matter as much as the format. Use log levels consistently: DEBUG for detail you only want while developing, INFO for normal events such as each request, WARNING for something odd but handled, ERROR for a failed operation. And never log secrets or personal data: passwords, tokens, full card numbers and customers' addresses must not appear in logs, because logs are copied widely and kept for a long time. Logs answer "what happened to this particular request?". They are poor at answering "is the whole system healthy right now?", which is the job of metrics.</p>

  <h2 id="ap-metrics"><span class="num">08</span>Metrics, Monitoring &amp; Alerting</h2>
  <p><strong>Metrics</strong> are numbers measured continuously and aggregated over time: requests per second, the share of requests that failed, how long requests take. Where logs are a detailed diary of individual events, metrics are a car's dashboard: you cannot see each turn of the engine, but you can see speed and temperature at a glance, and a warning light comes on when a needle passes a line. <strong>Monitoring</strong> means collecting these numbers and showing them on dashboards; <strong>alerting</strong> means automatically notifying a human (paging the on-call engineer) when a number crosses a threshold.</p>
  <p>Which numbers? Google's Site Reliability Engineering book names four <strong>golden signals</strong> that cover most services: <strong>latency</strong> (how long requests take), <strong>traffic</strong> (how many requests arrive), <strong>errors</strong> (how many fail), and <strong>saturation</strong> (how full the system is: CPU, memory, queue length). For an ML endpoint you would add the distribution of predictions, signs of input drift, and the model version serving each request (see <a class="xref" data-note="sd_monitoring">Monitoring, Drift &amp; Retraining</a>).</p>
  <p>Latency needs special care, because the obvious summary, the average, hides exactly the customers you care about. A <strong>percentile</strong> answers "what latency are most requests faster than?": the <strong>p50</strong> (median) is the value half the requests are faster than, the <strong>p95</strong> the value 95% are faster than, the <strong>p99</strong> the value 99% are faster than. Here are twenty menu requests, eighteen served from the cache and two that missed it:</p>
  <div class="fx" data-lang="py">import statistics

# latency of 20 Biteful menu requests in ms: most hit the cache, two missed it
lat = [42, 38, 45, 40, 41, 39, 44, 43, 40, 38, 41, 42, 39, 45, 40, 43, 41, 44, 1900, 2300]

def pct(values, p):                          # nearest-rank percentile
    s = sorted(values)
    return s[max(0, round(p / 100 * len(s)) - 1)]

print("mean:", round(statistics.mean(lat), 1), "ms")
print("p50 :", pct(lat, 50), "ms")
print("p95 :", pct(lat, 95), "ms")
print("p99 :", pct(lat, 99), "ms")</div>
  <div class="fx" data-lang="text">mean: 247.2 ms
p50 : 41 ms
p95 : 1900 ms
p99 : 2300 ms</div>
  <p>The mean of 247 ms describes nobody: eighteen customers waited about 40 ms and two waited around two seconds. The p50 of 41 ms describes the typical customer, and the p95 and p99 (1.9 s and 2.3 s) describe the unhappy tail. At Biteful's scale, a p99 of 2.3 s means one request in a hundred is slow, which is thousands of slow requests an hour, and the heaviest users, who make the most requests, are the most likely to hit them. That is why latency targets and alerts are written in percentiles.</p>
  <p>The standard open-source tool for metrics is <strong>Prometheus</strong>. Each API process exposes its current numbers as plain text at an endpoint, usually <code>/metrics</code>, and the Prometheus server visits that endpoint on every copy every few seconds (this is called <strong>scraping</strong>), stores the numbers as time series, and evaluates alert rules; Grafana draws the dashboards. In the app we define two metrics with the <code>prometheus_client</code> library. A <strong>counter</strong> is a number that only goes up, here the total requests labelled by path and status. A <strong>histogram</strong> counts how many observations fell into each latency range ("bucket"), from which Prometheus can estimate percentiles later. The middleware from the previous section already updates both on every request:</p>
  <div class="fx" data-lang="py">REQS = Counter("http_requests_total", "Requests handled", ["path", "status"])
LAT = Histogram("http_request_seconds", "Request latency", ["path"],
                buckets=(0.01, 0.05, 0.1, 0.5, 1.0))

@app.get("/metrics")
def metrics():
    if "PROMETHEUS_MULTIPROC_DIR" in os.environ:     # gunicorn: add up every worker's numbers
        registry = CollectorRegistry()
        multiprocess.MultiProcessCollector(registry)
        return Response(generate_latest(registry), media_type=CONTENT_TYPE_LATEST)
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)</div>
  <p>Now a trap that catches almost everyone who runs Prometheus with gunicorn. We start api-1 with two workers, send 10 requests, and scrape <code>/metrics</code> four times. Then we restart it in Prometheus's multiprocess mode, by setting <code>PROMETHEUS_MULTIPROC_DIR</code> to a directory, and repeat:</p>
  <div class="fx" data-lang="text">$ INSTANCE=api-1 gunicorn prod_app:app -k uvicorn_worker.UvicornWorker -w 2 -b 127.0.0.1:18510 &amp;
$ for i in $(seq 10); do curl -s -o /dev/null 'localhost:18510/v1/recommend?customer=asha'; done
$ for i in 1 2 3 4; do curl -s localhost:18510/metrics | grep '^http_requests_total'; done
http_requests_total{path="/v1/recommend",status="200"} 9.0
http_requests_total{path="/v1/recommend",status="200"} 1.0
http_requests_total{path="/v1/recommend",status="200"} 9.0
http_requests_total{path="/v1/recommend",status="200"} 9.0

$ PROMETHEUS_MULTIPROC_DIR=./prom INSTANCE=api-1 gunicorn prod_app:app -k uvicorn_worker.UvicornWorker -w 2 -b 127.0.0.1:18510 &amp;
$ for i in $(seq 10); do curl -s -o /dev/null 'localhost:18510/v1/recommend?customer=asha'; done
$ for i in 1 2 3 4; do curl -s localhost:18510/metrics | grep '^http_requests_total'; done
http_requests_total{path="/v1/recommend",status="200"} 10.0
http_requests_total{path="/v1/recommend",status="200"} 10.0
http_requests_total{path="/v1/recommend",status="200"} 10.0
http_requests_total{path="/v1/recommend",status="200"} 10.0
$ curl -s localhost:18510/metrics | grep '^http_request_seconds_bucket'
http_request_seconds_bucket{le="0.01",path="/v1/recommend"} 0.0
http_request_seconds_bucket{le="0.05",path="/v1/recommend"} 0.0
http_request_seconds_bucket{le="0.1",path="/v1/recommend"} 0.0
http_request_seconds_bucket{le="0.5",path="/v1/recommend"} 10.0
http_request_seconds_bucket{le="1.0",path="/v1/recommend"} 10.0
http_request_seconds_bucket{le="+Inf",path="/v1/recommend"} 10.0</div>
  <p>In the first run the counter said 9, 1, 9 and 9, and never 10. Each worker is a separate process with its own counters in its own memory, and each scrape was answered by whichever worker happened to accept it: one worker had handled 9 requests, the other just 1. Both were right about themselves, and neither reported the truth. In multiprocess mode each worker writes its numbers to files in the shared directory, and the <code>/metrics</code> endpoint adds them all up with <code>MultiProcessCollector</code>, so every scrape reported 10. This is the same "state inside one process" problem as the rate limiter, and it has the same kind of fix: move the numbers somewhere shared. The histogram lines show the bucket counts: no request was under 0.1 s, and all 10 were under 0.5 s, which matches 0.25 s of CPU each. Prometheus would estimate the p95 from these buckets with a query such as <code>histogram_quantile(0.95, rate(http_request_seconds_bucket[5m]))</code>.</p>
  <p>Good alerts are written on symptoms that customers feel, not on causes. "Error rate above 1% for 5 minutes" or "p99 latency of order requests above 300 ms for 10 minutes" are good alerts, because they mean customers are suffering right now. "CPU above 80%" is a poor alert on its own, because a busy CPU with happy customers is simply an efficient system. Teams usually write the target down as an <strong>SLO</strong> (service level objective), for example "99% of order requests complete in under 300 ms over 30 days", and alert when they are burning through it too fast. An alert rule in Prometheus's configuration looks like this (illustrative, not run here):</p>
  <div class="fx" data-lang="text"># alert when more than 1% of order requests fail for 5 minutes
- alert: OrdersErrorRateHigh
  expr: |
    sum(rate(http_requests_total{path="/v1/orders",status=~"5.."}[5m]))
      / sum(rate(http_requests_total{path="/v1/orders"}[5m])) &gt; 0.01
  for: 5m
  labels: {severity: page}</div>
  <p>Humans can now see problems. But the load balancer must also decide, every few seconds and with no human involved, whether each copy should receive traffic, and that needs a simpler signal.</p>

  <h2 id="ap-health"><span class="num">09</span>Health Checks</h2>
  <p>Consider three unhealthy API copies. One has just started and is still loading its model. One has lost its connection to Redis, so it is running but cannot read the cache or check rate limits. One is stuck in an endless loop and will never answer again. Each needs a different reaction: wait for the first, stop sending traffic to the second until Redis is back, restart the third. The infrastructure (the load balancer, or an orchestrator such as Kubernetes that starts and stops containers) cannot read logs or dashboards, so each copy answers a couple of simple questions over HTTP. A <strong>health check</strong> (or probe) is an endpoint that the infrastructure calls every few seconds and that answers with a status code.</p>
  <p>There are two main questions, and mixing them up causes real outages. <strong>Liveness</strong> asks "is this process alive and able to respond at all?"; if the answer is no, restart it. A liveness endpoint should be cheap and check nothing outside the process. <strong>Readiness</strong> asks "can this copy do useful work right now?"; if the answer is no, stop sending it traffic, but do not restart it, because restarting will not fix a missing dependency. A readiness endpoint checks what the copy needs, such as the model being loaded and Redis being reachable. Think of a shop: liveness asks whether the shopkeeper is breathing (if not, call an ambulance); readiness asks whether the shutter is up and the shelves are stocked (if not, send customers to the next shop, but nobody calls an ambulance).</p>
  <div class="fx" data-lang="py">@app.get("/health")                                  # liveness: is this process alive?
def health():
    return {"status": "alive"}

@app.get("/ready")                                   # readiness: can it serve real traffic?
def ready(response: Response):
    checks = {"model_loaded": True}
    try:
        checks["redis"] = bool(cache.ping())
    except redis.RedisError:
        checks["redis"] = False
    if not all(checks.values()):
        response.status_code = 503                   # "don't send me traffic right now"
    return checks</div>
  <p><code>/health</code> just returns 200. <code>/ready</code> pings Redis and returns 503 Service Unavailable if any check fails. The Redis client was created with <code>socket_timeout=0.2</code>, so if Redis hangs instead of refusing, the probe still answers within a fraction of a second rather than hanging itself. We run api-1, check readiness, shut Redis down, check both endpoints, and bring Redis back:</p>
  <div class="fx" data-lang="text">$ INSTANCE=api-1 gunicorn prod_app:app -k uvicorn_worker.UvicornWorker -w 2 -b 127.0.0.1:18510 &amp;
$ curl -s -w ' %{http_code}\\n' localhost:18510/ready
{"model_loaded":true,"redis":true} 200

$ redis-cli -p 18500 shutdown nosave           # Redis goes down
$ curl -s -w ' %{http_code}\\n' localhost:18510/health
{"status":"alive"} 200
$ curl -s -w ' %{http_code}\\n' localhost:18510/ready
{"model_loaded":true,"redis":false} 503

$ redis-server --port 18500 --save '' --appendonly no --daemonize yes    # Redis comes back
$ curl -s -w ' %{http_code}\\n' localhost:18510/ready
{"model_loaded":true,"redis":true} 200</div>
  <p>While Redis was down, <code>/health</code> stayed 200, so nothing restarted the process pointlessly, and <code>/ready</code> returned 503 with <code>"redis": false</code>, so a load balancer would take this copy out of rotation and send its traffic to healthy copies. When Redis came back, <code>/ready</code> returned 200 and the copy would receive traffic again, all without a human. Now imagine the mistake of checking Redis in the liveness endpoint instead: a 30-second Redis blip would make every copy fail liveness at once, and the orchestrator would restart all of them together, turning a small outage into a large one. This is sometimes called a restart storm. Kubernetes adds a third probe, the <strong>startup probe</strong>, which holds off the other two until a slow start (such as downloading a large model) has finished.</p>
  <table class="tbl">
    <tr><th>Probe</th><th>Question</th><th>On failure</th><th>What it checks</th></tr>
    <tr><td>Liveness (<code>/health</code>)</td><td>is the process alive?</td><td>restart it</td><td>nothing external; cheap</td></tr>
    <tr><td>Readiness (<code>/ready</code>)</td><td>can it serve right now?</td><td>stop routing traffic to it</td><td>model loaded, Redis and database reachable</td></tr>
    <tr><td>Startup</td><td>has slow startup finished?</td><td>wait before running the others</td><td>large model download, cache warm-up</td></tr>
  </table>

  <h2 id="ap-scale"><span class="num">10</span>Horizontal Scaling</h2>
  <p>Lunch traffic doubles. There are two ways to handle more load. <strong>Vertical scaling</strong> (scaling up) means moving to a bigger machine with more cores and memory. It needs no code changes, but there is a largest machine you can buy, and that one machine is still a <strong>single point of failure</strong>: if it dies, everything stops. <strong>Horizontal scaling</strong> (scaling out) means adding more identical copies behind the load balancer. It has practically no upper limit for the API tier, and as our failover test showed, one copy can die while the others carry on. An <strong>autoscaler</strong> can even add copies at 12:30 and remove them at 15:00, based on CPU, p95 latency, or for Celery workers the length of the queue. (Cloud machines and autoscaling are covered in <a class="xref" data-note="cf_cloud">Virtualization, Cloud &amp; Performance</a>.)</p>
  <p>Horizontal scaling has one condition, the statelessness rule from section 01, and the easiest way to understand it is to watch it break. Our app has the same "5 calls per minute per customer" limit written twice: once counted in each process's memory, and once in Redis using the sorted-set code from section 06:</p>
  <div class="fx" data-lang="py">LOCAL_HITS: dict[str, list[float]] = {}              # lives inside ONE process

def limit_local(x_customer: str = Header()):
    now = time.time()
    hits = [t for t in LOCAL_HITS.get(x_customer, []) if now - t &lt; 60] + [now]
    LOCAL_HITS[x_customer] = hits
    if len(hits) &gt; 5:
        raise HTTPException(429, "slow down", headers={"Retry-After": "60"})

def limit_shared(x_customer: str = Header()):        # lives in Redis, shared by every process
    key, now = f"rl:{x_customer}", time.time()
    p = cache.pipeline()
    p.zremrangebyscore(key, 0, now - 60)
    p.zadd(key, {uuid.uuid4().hex: now})
    p.zcard(key)
    p.expire(key, 61)
    if p.execute()[2] &gt; 5:
        raise HTTPException(429, "slow down", headers={"Retry-After": "60"})

@app.get("/v1/orders/local-limit", dependencies=[Depends(limit_local)])
def orders_local():
    return {"served_by": INSTANCE, "pid": os.getpid()}

@app.get("/v1/orders/shared-limit", dependencies=[Depends(limit_shared)])
def orders_shared():
    return {"served_by": INSTANCE, "pid": os.getpid()}</div>
  <p><code>limit_local</code> keeps a dictionary of recent call times inside the process, which looks perfectly reasonable and works perfectly on a laptop. <code>limit_shared</code> keeps them in Redis. Both are attached to endpoints with FastAPI's <code>Depends</code>, so they run before the endpoint and raise a 429 when the limit is passed. We run two servers with two workers each (four processes) behind the proxy, and let Ben's app call each endpoint 30 times:</p>
  <div class="fx" data-lang="text">$ INSTANCE=api-1 gunicorn prod_app:app -k uvicorn_worker.UvicornWorker -w 2 -b 127.0.0.1:18510 &amp;
$ INSTANCE=api-2 gunicorn prod_app:app -k uvicorn_worker.UvicornWorker -w 2 -b 127.0.0.1:18511 &amp;
$ python lb.py 18520 &amp;

$ for i in $(seq 30); do curl -s -o /dev/null -w '%{http_code}\\n' localhost:18520/v1/orders/local-limit -H 'X-Customer: ben'; done | sort | uniq -c
     20 200
     10 429

$ for i in $(seq 30); do curl -s -o /dev/null -w '%{http_code}\\n' localhost:18520/v1/orders/shared-limit -H 'X-Customer: ben'; done | sort | uniq -c
      5 200
     25 429</div>
  <p>The in-memory limit of 5 let 20 calls through. Each of the four processes counted only the calls that happened to reach it and allowed up to 5 of them, so the real limit became roughly 5 × 4; add a third server and it grows again. The Redis limit let through exactly 5, no matter how many copies exist, because every copy reads and writes the same counter. Nothing in the in-memory code is wrong in isolation. It is wrong only because the state it relies on lives inside one copy, and the load balancer spreads one customer's requests across many copies.</p>
  <p>The same failure appears wherever a copy keeps changing state in its own memory, and the fix is always to move that state to a shared service:</p>
  <table class="tbl">
    <tr><th>State kept inside one copy</th><th>What goes wrong</th><th>Stateless fix</th></tr>
    <tr><td>login sessions in a dict</td><td>logged in on copy A, "401" on copy B</td><td>JWTs, or sessions in Redis</td></tr>
    <tr><td>rate-limit counters in memory</td><td>20 calls instead of 5</td><td>Redis counter or sorted set</td></tr>
    <tr><td>cache in a dict</td><td>each copy has its own stale copy</td><td>Redis</td></tr>
    <tr><td>metrics per process</td><td>scrapes say 9 or 1 instead of 10</td><td>multiprocess mode, or scrape each worker</td></tr>
    <tr><td>uploaded menu photos on local disk</td><td>photo exists on one server only</td><td>object storage (S3 or similar)</td></tr>
    <tr><td>background work in the web process</td><td>lost on restart</td><td>Celery workers with a broker</td></tr>
  </table>
  <p>Read-only state is fine: a model file baked into every copy is identical everywhere, so it does not matter which copy answers. A good test of a design is the "cattle, not pets" question: if you killed one copy at random right now, would anyone lose data, be logged out, or get around a limit? If not, the tier is ready to scale horizontally.</p>
  <p>Moving state into shared services moves the risk there too. Redis is now something every copy depends on, so in production it needs replication or a managed service, clients need timeouts, and copies must degrade sensibly when it is unreachable, which is exactly what our <code>/ready</code> endpoint did. And as the API tier grows, the database usually becomes the next bottleneck, handled with caching, connection pooling (reusing a fixed set of database connections instead of opening one per request), and read replicas (extra copies of the database that serve reads). These are the starting points of <a class="xref" data-note="sd_framework">system design</a>, and packaging all these processes so they run the same way on every machine is the job of <a class="xref" data-note="se_docker">Docker</a>.</p>

  <h2 id="ap-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>The most common caching bug is storing a personal answer under a key that does not say whose answer it is. The code looks like ordinary cache-aside, and the first customer gets the right result, but every later customer gets the first customer's data until the key expires. The second most common is forgetting the TTL, which leaves values stale forever and lets memory grow without limit; Redis reports a TTL of −1 for a key that will never expire:</p>
  <div class="fx" data-lang="py">import json, redis

r = redis.Redis(port=18500, decode_responses=True)
r.flushdb()

# Mistake 1: a personal answer cached under a key that does not say whose it is
def get_cart_wrong(customer):
    if (v := r.get("cart")) is not None:
        return json.loads(v)
    cart = {"owner": customer, "items": ["Masala Dosa"]} if customer == "asha" else {"owner": customer, "items": []}
    r.set("cart", json.dumps(cart), ex=60)
    return cart

get_cart_wrong("asha")
print("Ben sees:", get_cart_wrong("ben"))           # Asha's cart!

def get_cart(customer):                              # fix: the key includes the customer
    key = f"cart:{customer}"
    if (v := r.get(key)) is not None:
        return json.loads(v)
    cart = {"owner": customer, "items": []}
    r.set(key, json.dumps(cart), ex=60)
    return cart

print("Ben sees:", get_cart("ben"))

# Mistake 2: forgetting the expiry
r.set("menu:v1:11", "{}")                            # no ex=
r.set("menu:v1:12", "{}", ex=300)
print("TTL without ex:", r.ttl("menu:v1:11"), "| TTL with ex:", r.ttl("menu:v1:12"))</div>
  <div class="fx" data-lang="text">Ben sees: {'owner': 'asha', 'items': ['Masala Dosa']}
Ben sees: {'owner': 'ben', 'items': []}
TTL without ex: -1 | TTL with ex: 300</div>
  <p>Ben was shown Asha's cart because both used the key <code>cart</code>; including the customer in the key (<code>cart:ben</code>) fixed it. The same rule applies to ML predictions: key them by a hash of the input <em>and</em> the model version, or a new model will serve the old model's cached answers. The TTL line shows −1 for the key written without <code>ex=</code> and 300 for the key written with it.</p>
  <p>Per-process state is the mistake behind several earlier demos: rate-limit counters, caches, sessions or metrics kept in a Python dictionary all behave correctly with one process and wrongly with four (20 calls instead of 5; scrapes of 9 or 1 instead of 10). Anything that changes and must be the same for every copy belongs in Redis, the database or another shared service.</p>
  <p>Doing slow work inside the request, or in <code>BackgroundTasks</code>, is the next one. Emails, statements and retraining jobs belong on a queue, with the endpoint returning 201 or 202 Accepted and a job id. Once they are on a queue, the related mistake is a task that is not idempotent: with retries and acks_late a task can run twice, so a receipt is emailed twice or a restaurant is paid twice unless the task records completion and checks it first.</p>
  <p>On the operations side, three mistakes cause real outages. Alerting on average latency hides the slow tail (a mean of 247 ms next to a p99 of 2.3 s). Putting dependency checks in the liveness endpoint turns a short Redis blip into a restart of every copy at once. And choosing the number of gunicorn workers by CPU alone ignores memory: each worker loads its own copy of the model, so eight workers with a 3 GB model need 24 GB. Finally, behind a proxy, reading the client's IP from the connection instead of a trusted <code>X-Forwarded-For</code> makes every customer look like the same user to your logs and per-IP limits.</p>

  <h2 id="ap-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Process / pid</b>: one running program / its id number. <b>Port</b>: numbered door on a host where a process listens.</li>
    <li><b>Process manager</b> (gunicorn): starts N <b>workers</b> (processes running the app), restarts dead ones, reloads gracefully.</li>
    <li><b>WSGI / ASGI</b>: sync (Flask) / async (FastAPI) interface between server and app. FastAPI under gunicorn: <code>-k uvicorn_worker.UvicornWorker</code>.</li>
    <li><b>GIL</b>: one thread runs Python at a time per process, so CPU work needs more processes.</li>
    <li><b>Reverse proxy</b>: accepts client connections, forwards to backends. <b>Load balancer</b>: spreads requests across backends. <b>Upstream</b>: nginx's backend pool. <b>TLS termination</b>: HTTPS decrypted at the proxy.</li>
    <li><b>Cache-aside</b>: read cache, on miss load from DB and set with <b>TTL</b>. <b>Invalidation</b>: delete on change. <b>Stampede</b>: many simultaneous misses on one key.</li>
    <li><b>Broker</b>: the queue. <b>Worker</b>: runs tasks. <b>Result backend</b>: stores state and results. <b>acks_late</b>: confirm after finishing. <b>Idempotent</b>: running twice = running once.</li>
    <li><b>Rate limiting</b>: cap requests per client per time; answer 429 + <code>Retry-After</code>.</li>
    <li><b>Structured log</b>: one JSON object per event. <b>Request id</b>: one label carried through every log line of a request.</li>
    <li><b>Counter / histogram</b>: only goes up / counts per latency bucket. <b>Golden signals</b>: latency, traffic, errors, saturation. <b>SLO</b>: a reliability target.</li>
    <li><b>Liveness</b>: failure → restart. <b>Readiness</b>: failure → stop traffic. <b>Stateless</b>: nothing in a copy's memory that another copy needs.</li>
  </ul>
  <h3>What each piece fixed on Biteful</h3>
  <table class="tbl">
    <tr><th>Piece</th><th>Problem</th><th>Measured here (approximate)</th></tr>
    <tr><td>gunicorn, 4 workers</td><td>one process, one core, stays dead</td><td>8 × 0.25 s CPU: ~2.1 s → ~0.9 s; killed worker replaced in 1 s</td></tr>
    <tr><td>Reverse proxy</td><td>many servers, one address</td><td>replies alternate api-1/api-2; api-2 down → still 200</td></tr>
    <tr><td>Redis cache-aside</td><td>same 0.5 s query repeated</td><td>~500 ms → ~0.2 ms; stampede 50 → 1 DB query</td></tr>
    <tr><td>Celery</td><td>slow, flaky, must-not-lose email</td><td>201 in tens of ms; RETRY → SUCCESS on attempt 2; redelivery skipped</td></tr>
    <tr><td>Rate limits</td><td>one client floods the API</td><td>fixed 10/10 at boundary, sliding 5/10; bucket ok×5 then 429×3</td></tr>
    <tr><td>Logs + metrics</td><td>failures invisible</td><td>one grep finds a request id; mean 247 ms vs p99 2300 ms</td></tr>
    <tr><td>Health checks</td><td>broken copy still gets traffic</td><td>Redis down: /health 200, /ready 503</td></tr>
    <tr><td>Shared state</td><td>limits break with more copies</td><td>in-memory 20 of 30 passed; Redis 5 of 30</td></tr>
  </table>
  <h3>Rate-limiting algorithms</h3>
  <table class="tbl">
    <tr><th>Algorithm</th><th>Key fact</th></tr>
    <tr><td>Fixed window</td><td>cheapest; up to 2× limit at the boundary</td></tr>
    <tr><td>Sliding window log</td><td>exact; Redis sorted set of timestamps</td></tr>
    <tr><td>Token bucket</td><td>capacity = burst, rate = average; <code>tokens = min(cap, tokens + elapsed × rate)</code></td></tr>
    <tr><td>Leaky bucket</td><td>fixed outflow rate; used by nginx <code>limit_req</code></td></tr>
  </table>
  <h3>Commands and code</h3>
  <div class="fx" data-lang="py"># gunicorn with FastAPI workers (one per core to start, capped by RAM)
#   gunicorn prod_app:app -k uvicorn_worker.UvicornWorker -w 4 -b 0.0.0.0:8000 --timeout 30

# cache-aside with TTL
v = r.get(key)
if v is None:
    v = json.dumps(load_from_db())
    r.set(key, v, ex=300)

# stampede lock: only one caller wins
r.set(f"lock:{key}", "1", nx=True, ex=10)

# Celery task with retries; call it with .delay()
@app.task(bind=True, max_retries=3, default_retry_delay=2)
def send_receipt_email(self, order_id): ...
job = send_receipt_email.delay(101)

# Redis sliding window: zremrangebyscore, zadd, zcard, expire in one pipeline</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Per-process state (limits, caches, sessions, metrics) breaks with more workers or servers.</li>
    <li>Every cache key needs a TTL, and personal data needs the user in the key.</li>
    <li>Unknown Celery job ids report PENDING too.</li>
    <li>Retries + acks_late = at-least-once: make tasks idempotent; pass ids, not data.</li>
    <li>Alert on p95/p99 and error rate, not the mean or raw CPU.</li>
    <li>Dependencies go in readiness, never liveness.</li>
    <li>Behind a proxy, use a trusted <code>X-Forwarded-For</code>; keep proxy timeouts above your slowest request.</li>
  </ul>

  <h2 id="ap-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why not just run <code>uvicorn main:app</code> in production?</summary><div class="qa-body">One uvicorn process runs Python on one core at a time because of the GIL, so CPU-heavy requests queue up (8 × 0.25 s took about 2 s). Nothing restarts it if it crashes, and it handles TLS, slow clients and floods poorly. In production you run several workers under a process manager such as gunicorn, behind a reverse proxy such as nginx.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between gunicorn and uvicorn?</summary><div class="qa-body">uvicorn is an ASGI server: it runs an event loop and calls your FastAPI app. gunicorn is a process manager: it starts several worker processes, shares the port among them, restarts dead ones and reloads gracefully. Used together with <code>-k uvicorn_worker.UvicornWorker</code>, gunicorn manages the processes and each process runs uvicorn.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many gunicorn workers should you run?</summary><div class="qa-body">For CPU-bound or async apps, start near the number of CPU cores; the classic 2 × cores + 1 suits synchronous apps that mostly wait on I/O. Each worker is a separate process that loads its own copy of the app and any model, so memory caps the number. Then load-test and adjust.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a reverse proxy, and how is it different from a load balancer?</summary><div class="qa-body">A reverse proxy accepts client connections and forwards them to backend servers, hiding them behind one address; it can also terminate TLS, buffer slow clients, apply limits and add headers. A load balancer's job is spreading requests across several backends. nginx does both, and a load balancer is usually a kind of reverse proxy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What load-balancing strategies do you know?</summary><div class="qa-body">Round robin sends requests to servers in turn; weighted round robin gives bigger servers more. Least connections sends each request to the server with the fewest in progress, which helps when request times vary. IP hash (or a sticky session) sends the same client to the same server, which is only needed when servers keep state, and is best avoided by making them stateless.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain cache-aside, write-through and write-behind.</summary><div class="qa-body">Cache-aside: the app reads the cache and, on a miss, reads the database and stores the result with a TTL. Write-through: every write updates the database and the cache together, so reads right after writes hit the cache. Write-behind: writes go to the cache and are flushed to the database later, which is fast but can lose data if the cache fails.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you keep a cache consistent with the database?</summary><div class="qa-body">Set a TTL on every key so staleness is bounded, and delete (invalidate) the key when the underlying data changes; deleting is safer than updating because the next read reloads fresh data. Versioned keys such as <code>menu:v2:10</code> handle format changes. Perfect consistency is not possible with a separate cache, so you choose the TTL by how much staleness the data can tolerate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a cache stampede and how do you prevent it?</summary><div class="qa-body">When a popular key expires, many simultaneous requests miss together and all hit the database. Prevent it by letting one request refill under a lock (<code>SET lock NX EX 10</code>) while others wait and re-read, by adding random jitter to TTLs, or by refreshing hot keys before they expire. In our demo the lock reduced 50 database queries to 1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use Celery instead of FastAPI's BackgroundTasks?</summary><div class="qa-body">BackgroundTasks run inside the web process after the response: no retries, no status, and the work is lost if that process restarts. Celery puts the job on a durable broker, runs it in separate workers that can scale independently, retries failures and records state. BackgroundTasks are fine for trivial work such as a log line; receipts, payments and long jobs belong in a queue.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the broker and the result backend in Celery?</summary><div class="qa-body">The broker is the queue that holds task messages until a worker takes them, commonly Redis or RabbitMQ. The result backend stores each task's state (PENDING, STARTED, RETRY, SUCCESS, FAILURE) and return value so the API can report progress. They can be the same Redis server using different databases.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does idempotent mean, and why must Celery tasks be idempotent?</summary><div class="qa-body">An operation is idempotent if doing it twice has the same effect as doing it once. With retries and acks_late, Celery delivers tasks at least once, so a task can run twice after a crash or timeout. Recording completion (for example "receipt sent for order 101") and checking it first prevents duplicate emails or double payments.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compare fixed window, sliding window and token bucket rate limiting.</summary><div class="qa-body">A fixed window counts per clock window, which is cheap but lets up to twice the limit through around a window boundary (10 of 10 in our test). A sliding window counts requests in the last N seconds, which is accurate (5 of 10) but stores more. A token bucket allows bursts up to its capacity and then a steady rate, which matches real client behaviour well.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you rate-limit an API that runs on many servers?</summary><div class="qa-body">Keep the counters in a shared store such as Redis, not in process memory, otherwise the real limit becomes the limit times the number of processes (20 instead of 5 in our test). Use atomic operations, such as <code>INCR</code> with <code>EXPIRE</code> for a fixed window, a sorted set or a Lua script for a sliding window. Layer a coarse per-IP limit at the edge with per-key limits in the app, and return 429 with Retry-After.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is structured logging and why use request ids?</summary><div class="qa-body">Structured logging writes each event as a machine-readable record, usually one JSON object per line, so a log system can filter on fields like status or path across every server. A request id is generated at the edge and passed along in a header and every log line, so one search reconstructs a single request's path through the proxy, the app and its workers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why alert on p99 latency rather than the average?</summary><div class="qa-body">The average mixes fast and slow requests and can look fine while some customers wait seconds: our example had a mean of 247 ms while the p99 was 2.3 s. Percentiles show the experience of the slowest requests, which at scale are many real users. Alerts should target customer-facing symptoms such as error rate and tail latency.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the four golden signals?</summary><div class="qa-body">Latency (how long requests take, ideally as percentiles), traffic (requests per second), errors (rate of failed requests) and saturation (how full resources are: CPU, memory, queue length). Together they cover most of what you need to know about a service's health. For ML services you also watch prediction distributions, drift and model version.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a liveness and a readiness probe?</summary><div class="qa-body">Liveness asks whether the process is alive; if it fails, the orchestrator restarts it, so it should be cheap and check nothing external. Readiness asks whether the copy can serve traffic now; if it fails, the load balancer stops sending it requests without restarting it. Putting dependency checks in liveness causes restart storms when a dependency blips.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Horizontal versus vertical scaling: which do you prefer and what does horizontal require?</summary><div class="qa-body">Vertical scaling buys a bigger machine: simple, but limited and a single point of failure. Horizontal scaling adds identical copies behind a load balancer: nearly unlimited and fault-tolerant, so it is preferred for API tiers. It requires stateless copies, with sessions, caches, counters, files and jobs in shared services such as Redis, the database, object storage and a queue.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Design question: Biteful's traffic grows tenfold at lunch. What do you change?</summary><div class="qa-body">Make sure the API copies are stateless, then autoscale them behind the load balancer on p95 latency or CPU. Cache read-heavy data such as menus in Redis with TTLs and stampede protection, move slow work to Celery and autoscale workers on queue length, and add per-customer rate limits in Redis. Protect the database with connection pooling and read replicas, make Redis highly available, and watch the golden signals with alerts on error rate and p99.</div></details>
</main>
`
});
