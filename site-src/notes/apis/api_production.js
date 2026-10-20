// notes/apis/api_production.js — Production Backend
Object.assign(TOPIC_CONTENT, {
  "api_production": `<main>
  <h1>Production Backend</h1>
  <div class="where"><span>APIs &amp; Backend</span><span>Production Backend</span></div>
  <p class="lead">The Biteful API from the last three notes works on a laptop: one uvicorn process, a dict for orders, a background task for the receipt email, a login limit in memory. Then lunchtime arrives in Pune and Mumbai. Three problems appear at once: <strong>one process isn't enough</strong>, <strong>things get slow</strong>, and <strong>things fail silently</strong>. This note answers them one need at a time: gunicorn workers, an nginx reverse proxy, a Redis cache, a Celery task queue for the receipt email, rate limits that hold across copies, structured logs and metrics, health checks, and horizontal scaling. Everything here was run on this machine against real software: a private Redis 7.0 on port 6390, a Celery 5.6 worker, gunicorn 26 with uvicorn workers, and nginx 1.24 in front of two app servers. Timings depend on the machine (4 cores, shared).</p>

  <h2 id="ap-fits" class="open"><span class="num">★</span>Where this fits</h2>
<figure class="viz"><svg viewBox="0 0 680 130" width="680">
    <defs><marker id="ap-t0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="8" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="69" y="42" text-anchor="middle" font-size="12">1 HTTP &amp; REST</text><text x="69" y="58" text-anchor="middle" font-size="10" class="tm">the conversation</text>
    <rect x="145" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="206" y="42" text-anchor="middle" font-size="12">2 Flask</text><text x="206" y="58" text-anchor="middle" font-size="10" class="tm">write the server</text>
    <rect x="282" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="343" y="42" text-anchor="middle" font-size="12">3 FastAPI</text><text x="343" y="58" text-anchor="middle" font-size="10" class="tm">validation, docs, async</text>
    <rect x="419" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="480" y="42" text-anchor="middle" font-size="12">4 Auth &amp; Security</text><text x="480" y="58" text-anchor="middle" font-size="10" class="tm">who may call</text>
    <rect x="556" y="22" width="116" height="46" rx="6" class="fg sg" stroke-width="2.5"/><text x="614" y="42" text-anchor="middle" font-size="12" font-weight="700">5 Production</text><text x="614" y="58" text-anchor="middle" font-size="10" class="tm">many copies, watched</text>
    <line x1="130" y1="45" x2="143" y2="45" stroke="currentColor" marker-end="url(#ap-t0)"/>
    <line x1="267" y1="45" x2="280" y2="45" stroke="currentColor" marker-end="url(#ap-t0)"/>
    <line x1="404" y1="45" x2="417" y2="45" stroke="currentColor" marker-end="url(#ap-t0)"/>
    <line x1="541" y1="45" x2="554" y2="45" stroke="currentColor" marker-end="url(#ap-t0)"/>
    <text x="340" y="96" text-anchor="middle" font-size="11">One story across all five notes: the Biteful orders API</text>
    <text x="340" y="114" text-anchor="middle" font-size="11" class="tm">GET /restaurants · POST /orders · customers vs restaurant staff · a slow receipt email on a queue</text>
  </svg><figcaption>The APIs &amp; Backend track in reading order. You are on the green note. Each note starts from a weakness the one before it leaves.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="api_fastapi">FastAPI</a> and <a class="xref" data-note="api_auth">Authentication &amp; Security</a></b><span>You have a validated, documented, authenticated Biteful API. Each note left a production promise open: Flask's sync workers (3.02 s for three receipts), FastAPI's BackgroundTasks that die with the process, sessions and login counters that must live in Redis, TLS that ends "at nginx", and the fundamentals note's statelessness, so any copy can answer.</span></li>
    <li><b>This note adds: running it for real users</b><span>Process managers and workers, a reverse proxy and load balancer, caching (cache-aside, TTL, invalidation, stampedes), task queues (broker, worker, result backend, retries), distributed rate limiting, JSON logs and Prometheus metrics, liveness and readiness, and stateless horizontal scaling.</span></li>
    <li><b>Leads to: system design and MLOps</b><span><a class="xref" data-note="sd_serving">Model serving</a> and <a class="xref" data-note="sd_monitoring">monitoring</a> in system design, <a class="xref" data-note="se_docker">Docker</a> to package these processes, and <a class="xref" data-note="mlops_deploy">deployment</a> to run them on many machines.</span></li>
  </ol>

  <h2 id="ap-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The note as one chain. Running example: Biteful at the 12:30 lunch rush. Dosa Hut's menu takes 0.5 s to load from the database; a "recommended for you" endpoint burns 0.25 s of CPU; Asha's order 101 (₹240) triggers a receipt email that takes 1 s and sometimes times out; Ben's app is buggy and hammers the API.</p>
  <ol class="story">
    <li><b>The big picture</b><span>Q: what goes wrong when real users arrive? → One process can't keep up, slow work blocks requests, failures go unseen. Each has a standard box. First: one process isn't enough…</span></li>
    <li><b>gunicorn + uvicorn workers</b><span>Q: how do we use all CPU cores and survive a crash? → <code>gunicorn -w 4 -k uvicorn_worker.UvicornWorker</code>: 8 CPU-heavy requests 2.03 s → 0.87 s; a killed worker was replaced in a second. But one machine has a ceiling and no TLS…</span></li>
    <li><b>nginx reverse proxy</b><span>Q: how do many servers look like one address? → nginx: round robin api-1/api-2, 30-request burst → 11 × 200, 19 × 429 at the edge, failover when api-2 died. Now: the menu query still costs 0.5 s every time…</span></li>
    <li><b>Caching with Redis</b><span>Q: why recompute the same answer? → cache-aside: 500.7 ms → 0.2 ms; TTL 300 s; delete on change; a lock turned 50 stampeding DB queries into 1. The receipt email still blocks or gets lost…</span></li>
    <li><b>Task queues (Celery)</b><span>Q: how do we do slow, must-not-lose work outside the request? → broker + worker + result store: 201 in 50 ms; the email timed out once and the retry succeeded (attempt 2). Ben's buggy app floods us…</span></li>
    <li><b>Rate limiting at scale</b><span>Q: how do we cap one client fairly? → fixed window lets 10 of 10 through at the boundary, sliding 5; token bucket allows bursts. The counter must be shared. Something breaks at 3 AM and nobody knows…</span></li>
    <li><b>Structured logging and monitoring</b><span>Q: how do we see inside? → one JSON line per request with nginx's request id; Prometheus counters and histograms; mean 247 ms hid p99 2300 ms; per-process counters said 2 or 8. How does the load balancer know a copy is broken?</span></li>
    <li><b>Health checks</b><span>Q: restart it, or just stop sending traffic? → <code>/health</code> 200 (alive) while <code>/ready</code> 503 (Redis down), back to 200 when Redis returned. Finally: more copies on more machines…</span></li>
    <li><b>Horizontal scaling</b><span>Q: can we just add copies? → Only if they're stateless: a per-process limit of 5 let 19 of 30 through across 4 processes; the Redis limit let exactly 5. State goes to shared stores.</span></li>
  </ol>

  <h2 id="ap-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Production Backend</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Shape</div>
        <ul>
          <li>client → nginx (TLS, limits) → N stateless API copies → Redis / Postgres / queue</li>
          <li>Slow work: API → broker → Celery workers → result store</li>
          <li>Every copy: JSON logs, /metrics, /health, /ready</li>
          <li>💡 busy restaurant: host, waiters, counter, back kitchen</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Workers &amp; nginx</div>
        <ul>
          <li><b>gunicorn</b> — process manager, restarts dead workers</li>
          <li><b>UvicornWorker</b> — each worker runs an event loop</li>
          <li>workers ≈ CPU cores (CPU-bound); each loads its own model</li>
          <li><b>nginx</b> — TLS, round robin, <code>limit_req</code>, timeouts, failover</li>
          <li>8 × 0.25 s CPU: 1 process 2.03 s, 4 workers 0.87 s</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Caching</div>
        <ul>
          <li><b>Cache-aside</b> — get → miss → DB → set with TTL</li>
          <li>500.7 ms → 0.2 ms; <code>SET k v EX 300</code></li>
          <li><b>Invalidate</b> on change; version keys <code>menu:v1:10</code></li>
          <li>⚠ <b>stampede</b> 50 → 1 DB query with <code>SET NX EX</code> lock</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Task queues</div>
        <ul>
          <li><b>Broker</b> (Redis/RabbitMQ) · <b>worker</b> · <b>result backend</b></li>
          <li><code>.delay()</code> returns at once; 201 in 50 ms</li>
          <li>States: PENDING → STARTED → RETRY → SUCCESS</li>
          <li><code>max_retries</code>, <code>acks_late</code>, idempotent tasks, pass ids</li>
          <li>⚠ unknown job id also says PENDING</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Rate limits</div>
        <ul>
          <li><b>Fixed window</b> — 2× burst at the boundary (10 of 10)</li>
          <li><b>Sliding window</b> — last T seconds (5 of 10); Redis sorted set</li>
          <li><b>Token bucket</b> — capacity = burst, rate = sustained</li>
          <li>Edge per IP (nginx) + app per key (Redis); 429 + Retry-After</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Observe, check, scale</div>
        <ul>
          <li><b>JSON logs</b> + request id; <b>golden signals</b>: latency, traffic, errors, saturation</li>
          <li><b>p95/p99</b>, not mean (247 ms vs p99 2300 ms)</li>
          <li><b>/health</b> alive → restart if not; <b>/ready</b> deps → stop traffic</li>
          <li><b>Horizontal</b>: stateless copies; state in Redis/DB/S3</li>
          <li>⚠ per-process state: limits ×4, metrics 2 vs 8</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ap-arch"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Big Picture</span><span class="rm-sub">Three problems, standard boxes</span></div></div>
      <div class="rm-item rm-done" data-target="ap-workers"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">gunicorn &amp; uvicorn Workers</span><span class="rm-sub">Use every core, survive crashes</span></div></div>
      <div class="rm-item rm-done" data-target="ap-nginx"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">nginx Reverse Proxy</span><span class="rm-sub">One address, many servers</span></div></div>
      <div class="rm-item rm-done" data-target="ap-cache"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Caching with Redis</span><span class="rm-sub">Cache-aside, TTL, stampede</span></div></div>
      <div class="rm-item rm-done" data-target="ap-celery"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Task Queues: Celery</span><span class="rm-sub">The receipt email, retried</span></div></div>
      <div class="rm-item rm-done" data-target="ap-rl"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Rate Limiting at Scale</span><span class="rm-sub">Windows and buckets</span></div></div>
      <div class="rm-item rm-done" data-target="ap-obs"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Logging &amp; Monitoring</span><span class="rm-sub">JSON logs, metrics, percentiles</span></div></div>
      <div class="rm-item rm-done" data-target="ap-health"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Health Checks</span><span class="rm-sub">Liveness vs readiness</span></div></div>
      <div class="rm-item rm-done" data-target="ap-scale"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Horizontal Scaling</span><span class="rm-sub">Stateless copies, measured</span></div></div>
      <div class="rm-item rm-done" data-target="ap-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">What breaks on day two</span></div></div>
      <div class="rm-item rm-done" data-target="ap-connect"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One lunch-rush request</span></div></div>
      <div class="rm-item rm-done" data-target="ap-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="ap-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="ap-arch"><span class="num">01</span>The Big Picture</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>On a laptop, <code>uvicorn main:app</code> runs one process and you are the only user. At 12:30, two lakh Biteful customers open the app. What exactly goes wrong, and what does a production backend add to fix each problem?</p>
  </div>
  <p>The problems come in three groups, and each group has standard answers:</p>
  <table class="tbl"><caption>Lunch rush: the problems and their boxes</caption>
    <tr><th>Group</th><th>On Biteful</th><th>Standard answer</th><th>Section</th></tr>
    <tr><td rowspan="2">One process isn't enough</td><td>8 "recommended for you" requests need 8 × 0.25 s of CPU; one Python process does one at a time</td><td>several worker processes (gunicorn)</td><td>02</td></tr>
    <tr><td>one machine has a ceiling and is a single point of failure</td><td>many servers behind a reverse proxy (nginx)</td><td>03, 09</td></tr>
    <tr><td rowspan="3">It gets slow</td><td>Dosa Hut's menu costs a 0.5 s DB query, thousands of times, same answer</td><td>cache (Redis)</td><td>04</td></tr>
    <tr><td>the receipt email takes 1 s and sometimes times out</td><td>task queue (Celery)</td><td>05</td></tr>
    <tr><td>Ben's buggy app sends hundreds of requests a second</td><td>rate limits</td><td>06</td></tr>
    <tr><td rowspan="2">It fails silently</td><td>a 3 AM error nobody sees; "slow" with no numbers</td><td>structured logs + metrics + alerts</td><td>07</td></tr>
    <tr><td>a copy loses Redis but keeps getting traffic</td><td>health checks</td><td>08</td></tr>
  </table>
  <p>The most important rule ties them together: the API copies keep <strong>no state of their own</strong>. Anything that must be remembered (cache, sessions, orders, jobs, counters, files) lives in a shared service outside them, so any copy can answer any request and any copy can die.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A busy Udupi restaurant on Sunday. The host at the door (nginx) seats each party at a free table and turns away a rowdy group. Identical waiters (API copies) take orders. Popular items wait ready at the counter (cache). Big catering orders go on a ticket to the back kitchen (task queue). The manager watches a board of how many tables are waiting (metrics). If a waiter goes home, the host stops seating his tables (health checks).</p></div>
  <figure class="viz"><svg viewBox="0 0 640 300" width="640">
    <defs><marker id="ap-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="5" y="115" width="80" height="44" rx="6" class="fv sb"/><text x="45" y="141" text-anchor="middle">Apps</text>
    <rect x="110" y="105" width="110" height="64" rx="6" class="ft st"/><text x="165" y="130" text-anchor="middle">nginx</text><text x="165" y="148" text-anchor="middle" font-size="11" class="tm">TLS, limits, LB</text>
    <rect x="250" y="40" width="140" height="44" rx="6" class="fb sb"/><text x="320" y="60" text-anchor="middle">api-1</text><text x="320" y="76" text-anchor="middle" font-size="10" class="tm">gunicorn × uvicorn</text>
    <rect x="250" y="115" width="140" height="44" rx="6" class="fb sb"/><text x="320" y="135" text-anchor="middle">api-2</text><text x="320" y="151" text-anchor="middle" font-size="10" class="tm">model in RAM</text>
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
  </svg><figcaption>Identical, stateless API copies behind nginx; shared state (cache, orders, queue) lives outside them; slow work goes through the broker to Celery workers.</figcaption></figure>
  <table class="tbl"><caption>Asha's order 101, box by box</caption>
    <tr><th>Step</th><th>Box</th><th>What happens</th><th>Section</th></tr>
    <tr><td>1</td><td>nginx</td><td>decrypts HTTPS, checks the per-IP limit, stamps a request id, picks api-2</td><td>03, 06</td></tr>
    <tr><td>2</td><td>api-2 worker</td><td>validates the body, checks Asha's JWT (Auth note), rate-limits her key in Redis</td><td>02, 06</td></tr>
    <tr><td>3</td><td>Redis</td><td>Dosa Hut's menu (for prices): cache hit, 0.2 ms</td><td>04</td></tr>
    <tr><td>4</td><td>Postgres</td><td>stores order 101</td><td>–</td></tr>
    <tr><td>5</td><td>broker</td><td>gets "send receipt for 101"; the API answers 201 at once</td><td>05</td></tr>
    <tr><td>6</td><td>logs + metrics</td><td>one JSON line; latency into a histogram</td><td>07</td></tr>
    <tr><td>7</td><td>Celery worker</td><td>sends the email, retries if the provider times out</td><td>05</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Stateless service</strong>: keeps nothing between requests that another copy would need. <strong>Load balancer</strong>: spreads requests across copies. <strong>Reverse proxy</strong>: a server in front of your app that forwards requests to it (nginx does both).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>"Just use a bigger machine" in a design interview. One machine is one point of failure with a ceiling. The expected answer: stateless copies behind a load balancer, state in Redis/Postgres/S3, slow work on a queue, and observability on every copy.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: workers.</b> Start inside one machine. It has 4 CPU cores, but <code>uvicorn main:app</code> is one Python process. What happens when 8 customers ask for CPU-heavy recommendations at once?</div>

  <h2 id="ap-workers"><span class="num">02</span>gunicorn &amp; uvicorn Workers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Recommended for you" ranks dishes for a customer: about 0.25 s of pure CPU. FastAPI's async helps with <em>waiting</em>, not computing, and one Python process runs Python code on one core at a time (the <strong>GIL</strong>, global interpreter lock). The machine has 4 cores. How do we use them, and who restarts the process when it crashes at 3 AM?</p>
  </div>
  <p><strong>gunicorn</strong> is a <strong>process manager</strong>: it starts N copies (<strong>workers</strong>) of your app on one machine, shares the listening port among them, and restarts any worker that dies. With <code>-k uvicorn_worker.UvicornWorker</code>, each worker is a uvicorn event loop running FastAPI. The endpoint used for the test, from <code>prod_app.py</code>:</p>
<div class="fx" data-lang="py"># ---------- CPU-heavy work: ranks dishes for a customer ----------
@app.get("/v1/recommend")
def recommend(customer: str):
    t0, n = time.thread_time(), 0
    while time.thread_time() - t0 &lt; 0.25:     # ~0.25 s of pure CPU (this thread only)
        n += 1
    return {"customer": customer, "top": ["Masala Dosa", "Idli"], "served_by": INSTANCE,
            "pid": os.getpid()}</div>
<div class="fx" data-lang="py"># fire8.py: 8 customers open "recommended for you" at the same moment
import time, threading, requests, sys
from collections import Counter

port = sys.argv[1]
pids = []
def call(i):
    r = requests.get(f"http://127.0.0.1:{port}/v1/recommend", params={"customer": f"c{i}"})
    pids.append(r.json()["pid"])

t0 = time.perf_counter()
ts = [threading.Thread(target=call, args=(i,)) for i in range(8)]
for t in ts: t.start()
for t in ts: t.join()
print(f"8 requests in {time.perf_counter() - t0:.2f} s; requests per process: {sorted(Counter(pids).values(), reverse=True)}")</div>
<div class="fx" data-lang="text">$ uvicorn prod_app:app --port 9001                 # ONE process
$ python fire8.py 9001
8 requests in 2.03 s; requests per process: [8]

$ gunicorn prod_app:app -k uvicorn_worker.UvicornWorker -w 4 -b 127.0.0.1:9001
$ python fire8.py 9001
8 requests in 0.87 s; requests per process: [3, 2, 2, 1]
8 requests in 1.18 s; requests per process: [4, 2, 1, 1]</div>
  <ul>
    <li><strong>One process: 2.03 s.</strong> 8 × 0.25 s = 2.0 s: the requests ran in the threadpool but the GIL let only one compute at a time.</li>
    <li><strong>Four workers: 0.87 s and 1.18 s.</strong> Four processes, four cores. The ideal is 8 × 0.25 ÷ 4 = 0.5 s, but the kernel doesn't hand connections out evenly: the busiest worker got 3 requests (3 × 0.25 = 0.75 s → 0.87 s), then 4 (1.0 s → 1.18 s). Throughput is set by the busiest worker.</li>
  </ul>
  <p>And the safety net. We killed one worker with <code>kill -9</code>, as the Linux out-of-memory killer would:</p>
<div class="fx" data-lang="text">[2026-10-20 00:32:44 +0000] [4386] [INFO] Starting gunicorn 26.2.0
[2026-10-20 00:32:44 +0000] [4386] [INFO] Listening at: http://127.0.0.1:9001 (4386)
[2026-10-20 00:32:44 +0000] [4386] [INFO] Using worker: uvicorn_worker.UvicornWorker
[2026-10-20 00:32:44 +0000] [4389] [INFO] Booting worker with pid: 4389
[2026-10-20 00:32:44 +0000] [4390] [INFO] Booting worker with pid: 4390
[2026-10-20 00:32:44 +0000] [4391] [INFO] Booting worker with pid: 4391
[2026-10-20 00:32:44 +0000] [4392] [INFO] Booting worker with pid: 4392
[2026-10-20 00:32:49 +0000] [4386] [ERROR] Worker (pid:4389) was sent SIGKILL! Perhaps out of memory?
[2026-10-20 00:32:50 +0000] [4447] [INFO] Booting worker with pid: 4447</div>
  <p>The master (pid 4386) noticed and booted a replacement (4447) within a second. Requests on the other three workers never noticed.</p>
  <table class="tbl">
    <tr><th>Layer</th><th>Job</th><th>Example</th></tr>
    <tr><td>Process manager</td><td>start N workers, restart crashed ones, graceful reloads</td><td><code>gunicorn -w 4</code></td></tr>
    <tr><td>Worker</td><td>runs the app: sync (WSGI, Flask) or event loop (ASGI, FastAPI)</td><td><code>-k uvicorn_worker.UvicornWorker</code></td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span><p>gunicorn is the floor manager of one hall: four waiters work in parallel, and when one faints, a replacement is called in immediately.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Worker</strong>: one OS process running your app. <strong>Process manager</strong>: supervises workers (start, restart, reload). <strong>GIL</strong>: the lock that lets one thread at a time run Python bytecode in a process; separate processes each have their own.</p></div>
  <div class="callout trap"><span class="label">Trap: workers × model size</span><p>Each worker loads its own copy of everything in <code>lifespan</code>: a 3 GB model × 8 workers = 24 GB RAM. Start with workers ≈ cores for CPU-bound work (the classic <code>2 × cores + 1</code> is for sync, I/O-bound apps), cap by memory, then load-test.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: nginx.</b> Four workers fill one machine. One machine still has a ceiling, can die, and is exposed directly to the internet with no TLS and no protection against slow or abusive clients. How do several machines answer at one address?</div>

  <h2 id="ap-nginx"><span class="num">03</span>nginx Reverse Proxy</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Biteful now runs two app servers, api-1 and api-2. Asha's phone knows one address, <code>api.biteful.in</code>. Who picks a server for each request, who stops sending to a dead server, who handles TLS and slow mobile connections, and who turns away floods before they reach Python?</p>
  </div>
  <p><strong>nginx</strong> is a <strong>reverse proxy</strong>: clients connect to it, and it forwards each request to one of the app servers in an <strong>upstream</strong> pool (load balancing), then relays the answer. It also terminates TLS, applies rate and size limits, sets timeouts, and buffers slow clients so Python workers aren't tied up waiting on a 2G connection. We started two gunicorn servers (2 workers each) and nginx in front:</p>
<div class="fx" data-lang="text">$ INSTANCE=api-1 gunicorn prod_app:app -k uvicorn_worker.UvicornWorker -w 2 -b 127.0.0.1:9001
$ INSTANCE=api-2 gunicorn prod_app:app -k uvicorn_worker.UvicornWorker -w 2 -b 127.0.0.1:9002
$ nginx -p PREFIX -c nginx.conf</div>
<div class="fx" data-lang="text"># nginx.conf: Biteful's front door  (scratch paths shown as PREFIX)
worker_processes 1;
pid PREFIX/nginx.pid;
error_log PREFIX/logs/error.log;
events { worker_connections 256; }

http {
  access_log PREFIX/logs/access.log;
  client_body_temp_path PREFIX/tmp; proxy_temp_path PREFIX/tmp; fastcgi_temp_path PREFIX/tmp;
  uwsgi_temp_path PREFIX/tmp; scgi_temp_path PREFIX/tmp;

  upstream biteful_api {                   # the pool of identical, stateless app servers
    server 127.0.0.1:9001 max_fails=1 fail_timeout=10s;
    server 127.0.0.1:9002 max_fails=1 fail_timeout=10s;
  }
  limit_req_zone $binary_remote_addr zone=perip:10m rate=5r/s;   # coarse per-IP limit

  server {
    listen 127.0.0.1:8088;

    location / {
      limit_req zone=perip burst=10 nodelay;
      limit_req_status 429;
      client_max_body_size 1m;                            # reject giant uploads at the door
      proxy_pass http://biteful_api;
      proxy_set_header Host $host;
      proxy_set_header X-Request-ID $request_id;         # trace id generated at the edge
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_connect_timeout 2s;
      proxy_read_timeout 10s;
      proxy_next_upstream error timeout;                 # try the other server on failure
    }

    location /v1/orders/ {                               # no edge limit here (scaling demo)
      proxy_pass http://biteful_api;
      proxy_set_header X-Request-ID $request_id;
    }
  }
}</div>
  <p><code>upstream biteful_api</code> lists the servers; nginx takes turns (<strong>round robin</strong>). <code>limit_req_zone</code> is a token-bucket-style limit of 5 requests/s per client IP; <code>burst=10 nodelay</code> lets 10 extra through at once. <code>proxy_next_upstream</code>: if a server refuses or times out, retry on another. <code>$request_id</code> is a fresh 32-character id per request, passed on as <code>X-Request-ID</code>. The second <code>location</code> (no edge limit) is used in section 09. Three experiments:</p>
<div class="fx" data-lang="text">$ for i in 1 2 3 4; do curl -s 'localhost:8088/v1/recommend?customer=asha'; echo; done
{"customer":"asha","top":["Masala Dosa","Idli"],"served_by":"api-1","pid":4938}
{"customer":"asha","top":["Masala Dosa","Idli"],"served_by":"api-2","pid":4936}
{"customer":"asha","top":["Masala Dosa","Idli"],"served_by":"api-1","pid":4934}
{"customer":"asha","top":["Masala Dosa","Idli"],"served_by":"api-2","pid":4936}</div>
<div class="fx" data-lang="text">$ for i in $(seq 30); do curl -s -o /dev/null -w '%{http_code}\\n' localhost:8088/health; done | sort | uniq -c
     11 200
     19 429</div>
<div class="fx" data-lang="text">$ kill api-2   # stop the whole second server
$ for i in 1 2 3 4; do curl -s -w ' [%{http_code}]' 'localhost:8088/v1/recommend?customer=asha'; echo; done
{"customer":"asha","top":["Masala Dosa","Idli"],"served_by":"api-1","pid":4934} [200]
{"customer":"asha","top":["Masala Dosa","Idli"],"served_by":"api-1","pid":4934} [200]
{"customer":"asha","top":["Masala Dosa","Idli"],"served_by":"api-1","pid":4938} [200]
{"customer":"asha","top":["Masala Dosa","Idli"],"served_by":"api-1","pid":4934} [200]</div>
  <p>And nginx's error log at the moment api-2 died:</p>
<div class="fx" data-lang="text">2026/10/20 00:33:48 [error] 4962#4962: *98 connect() failed (111: Connection refused) while connecting to upstream, client: 127.0.0.1, server: , request: "GET /v1/recommend?customer=asha HTTP/1.1", upstream: "http://127.0.0.1:9002/v1/recommend?customer=asha", host: "localhost:8088"</div>
  <ul>
    <li><strong>Round robin</strong>: replies alternate api-1 / api-2; different <code>pid</code>s are different gunicorn workers.</li>
    <li><strong>Burst of 30</strong>: 1 + <code>burst=10</code> passed at once = 11 × 200; the other 19 got 429 from nginx without touching Python.</li>
    <li><strong>Failover</strong>: with api-2 gone, nginx logged the refused connection, retried on api-1, and every client still got 200.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span><p>nginx is the restaurant host: greets everyone, checks the reservation, turns away gate-crashers, seats each party at a free table, and stops seating at a table whose waiter went home.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Reverse proxy</strong>: a server that accepts client connections and forwards them to backend servers. <strong>Upstream</strong>: nginx's pool of backends. <strong>TLS termination</strong>: decrypting HTTPS at the proxy and forwarding plain HTTP inside the private network.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Behind a proxy, every request comes from nginx's IP. Read the client's address from <code>X-Forwarded-For</code> (set by your proxy, trusted only from your proxy), or your per-IP limits and logs will see one "user". And proxy timeouts (here 10 s) must be longer than your slowest legitimate request, or nginx returns 504 while the app is still working.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: caching.</b> We can now serve more requests. But many of them are the same question: every customer opening Dosa Hut asks for the same menu, and each answer costs a 0.5 s database query. Why compute it again?</div>

  <h2 id="ap-cache"><span class="num">04</span>Caching with Redis</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Dosa Hut's menu comes from a query that joins items, prices and photos: 0.5 s. At lunchtime thousands of customers open the same menu, and the database does the same work thousands of times. And the copies are separate processes, so a Python dict would give each its own copy. Where can we keep recent answers that every copy shares?</p>
  </div>
  <p>A <strong>cache</strong> is a small, very fast store of recent answers. <strong>Redis</strong> is the usual choice: an in-memory key-value server shared by all copies, answering in well under a millisecond. The common pattern is <strong>cache-aside</strong>: ask the cache; on a <strong>hit</strong> return it; on a <strong>miss</strong> ask the database, store the result with an expiry (<strong>TTL</strong>, time to live), and return it.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Your desk vs the records room. Today's files stay on the desk (cache): one second to grab. The rest are in the records room (database): five minutes each way. The desk is cleared every evening (TTL), and if a file is updated downstairs you throw away the desk copy (invalidation).</p></div>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <defs><marker id="ap-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="50" width="100" height="44" rx="6" class="fb sb"/><text x="60" y="77" text-anchor="middle">API</text>
    <rect x="250" y="5" width="110" height="44" rx="6" class="fr sr"/><text x="305" y="32" text-anchor="middle">Redis</text>
    <rect x="250" y="100" width="110" height="44" rx="6" class="fg sg"/><text x="305" y="127" text-anchor="middle">DB (slow)</text>
    <line x1="110" y1="62" x2="248" y2="30" stroke="currentColor" marker-end="url(#ap-ar2)"/><text x="170" y="36" font-size="11">1 GET key</text>
    <text x="380" y="25" font-size="11" class="tg">hit → return (0.2 ms)</text>
    <line x1="110" y1="84" x2="248" y2="120" stroke="currentColor" marker-end="url(#ap-ar2)"/><text x="130" y="118" font-size="11">2 miss → query</text>
    <path d="M360,122 C470,122 470,30 362,30" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#ap-ar2)"/><text x="455" y="80" font-size="11">3 SET key EX ttl</text>
  </svg><figcaption>Cache-aside: the app checks the cache first and fills it only on a miss.</figcaption></figure>
  <table class="tbl"><caption>Dry run: Asha, Ben and Chen open Dosa Hut; then the price changes; TTL 300 s</caption>
    <tr><th>Call</th><th>Key menu:v1:10 present?</th><th>Action</th><th>Expected time</th></tr>
    <tr><td>1 Asha</td><td>no</td><td>miss → DB → SET with TTL 300</td><td>~500 ms</td></tr>
    <tr><td>2 Ben</td><td>yes</td><td>hit</td><td>&lt; 1 ms</td></tr>
    <tr><td>3 Chen</td><td>yes</td><td>hit</td><td>&lt; 1 ms</td></tr>
    <tr><td>–</td><td colspan="3">Dosa Hut changes a price → DELETE the key</td></tr>
    <tr><td>4</td><td>no</td><td>miss → DB → SET again</td><td>~500 ms</td></tr>
  </table>
<div class="fx" data-lang="py">import json, time, redis

r = redis.Redis(port=6390, decode_responses=True)       # our private Redis
r.flushdb()

def load_menu_from_db(rid: int) -&gt; dict:
    time.sleep(0.5)                                      # stands in for a slow DB query (joins, photos)
    return {"restaurant_id": rid, "Masala Dosa": 120, "Idli": 60, "Filter Coffee": 40}

def get_menu(rid: int, ttl: int = 300) -&gt; dict:
    key = f"menu:v1:{rid}"
    cached = r.get(key)                                  # 1. look in the cache
    if cached is not None:
        return json.loads(cached)                        # 2a. hit
    value = load_menu_from_db(rid)                       # 2b. miss: go to the source
    r.set(key, json.dumps(value), ex=ttl)                # 3. store with a TTL
    return value

for attempt in range(3):                                 # Asha, Ben, Chen open Dosa Hut
    t = time.perf_counter()
    get_menu(10)
    print(f"call {attempt + 1}: {(time.perf_counter() - t) * 1000:7.1f} ms")

print("stored  :", r.get("menu:v1:10"))
print("TTL left:", r.ttl("menu:v1:10"), "s")

# invalidation: Dosa Hut changes a price -&gt; delete the key, next read refills
r.delete("menu:v1:10")
t = time.perf_counter(); get_menu(10)
print(f"after invalidation: {(time.perf_counter() - t) * 1000:.1f} ms")</div>
<div class="fx" data-lang="text">call 1:   500.7 ms
call 2:     0.2 ms
call 3:     0.1 ms
stored  : {"restaurant_id": 10, "Masala Dosa": 120, "Idli": 60, "Filter Coffee": 40}
TTL left: 300 s
after invalidation: 500.7 ms</div>
  <p>Exactly the dry run: 500.7 ms, then 0.2 and 0.1 ms (about 2,500 times faster), then 500.7 ms after invalidation. Redis stores strings, so the dict goes in through <code>json.dumps</code>. <code>ex=ttl</code> makes Redis delete the key after 300 s by itself, so a menu is never more than 5 minutes stale even if an invalidation is missed. The <code>v1</code> in the key is a version: change the menu format and switch to <code>v2</code>; old entries are simply never read.</p>
  <table class="tbl">
    <tr><th>Strategy</th><th>How</th><th>Good for</th></tr>
    <tr><td><strong>Cache-aside</strong></td><td>app reads cache, fills on miss</td><td>read-heavy data: menus, restaurant lists, features</td></tr>
    <tr><td>Write-through</td><td>every write updates cache and DB together</td><td>data read right after writing</td></tr>
    <tr><td>Write-behind</td><td>write to cache, flush to DB later</td><td>write-heavy counters; risk of loss</td></tr>
  </table>
  <h3>The stampede, and the lock that fixes it</h3>
  <p>12:30: the menu key expires, and in the next 100 ms 50 customers open Dosa Hut. All 50 miss; all 50 send the same 0.5 s query. This <strong>cache stampede</strong> can knock over the database the cache was protecting. Fix: let one request refill while the others wait briefly and re-read. Redis gives a tiny lock for free: <code>SET lock:key 1 NX EX 10</code> succeeds only if the key does <em>not</em> exist (<code>NX</code>), so exactly one caller wins.</p>
<div class="fx" data-lang="py">import json, time, threading, redis

r = redis.Redis(port=6390, decode_responses=True)
db_calls = 0

def slow_db(rid):
    global db_calls
    db_calls += 1
    time.sleep(0.5)
    return {"restaurant_id": rid, "Masala Dosa": 120}

def get_naive(rid):
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
        # only ONE caller wins this lock (NX = set only if Not eXists); it expires after 10 s
        if r.set(f"lock:{key}", "1", nx=True, ex=10):
            value = slow_db(rid)
            r.set(key, json.dumps(value), ex=300)
            r.delete(f"lock:{key}")
            return value
        time.sleep(0.05)                       # someone else is refilling: wait, then re-read

for fn in (get_naive, get_with_lock):
    r.flushdb(); db_calls = 0                  # 12:30 lunch rush: the menu key has just expired
    threads = [threading.Thread(target=fn, args=(10,)) for _ in range(50)]
    t = time.perf_counter()
    for th in threads: th.start()
    for th in threads: th.join()
    print(f"{fn.__name__:14} 50 concurrent requests -&gt; {db_calls:2} DB queries, {time.perf_counter() - t:.2f} s")</div>
<div class="fx" data-lang="text">get_naive      50 concurrent requests -&gt; 50 DB queries, 0.54 s
get_with_lock  50 concurrent requests -&gt;  1 DB queries, 0.55 s</div>
  <p>50 threads play 50 simultaneous customers. <code>get_naive</code> sent 50 identical queries. <code>get_with_lock</code> sent one: the winner refilled; the other 49 slept 50 ms at a time and then found the value. Total time is about the same; the database did 1/50th of the work. The lock's own <code>ex=10</code> matters: if the winner crashes, the lock frees itself. Other fixes: random jitter on TTLs, or refreshing hot keys just before they expire.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Hit / miss</strong>: the value was / wasn't in the cache. <strong>Hit ratio</strong>: hits ÷ reads. <strong>TTL</strong>: lifetime of a key. <strong>Invalidation</strong>: removing a cached value when the source changes. <strong>Stampede</strong>: many concurrent misses on one key overloading the source.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>No TTL (stale forever, memory grows forever); forgetting to invalidate on writes; caching per process in a dict (8 workers = 8 different stale copies); caching personal data under a key without the user id (Ben sees Asha's cart). For ML, cache predictions keyed by a hash of the input plus the model version.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: task queues.</b> Reads are fast now. But order 101 still has to send a receipt email that takes a second and sometimes times out. FastAPI's BackgroundTasks sent it after the response, but inside the same process: a deploy or crash at that moment loses Asha's receipt, with no retry and no record. Where should must-not-lose slow work run?</div>

  <h2 id="ap-celery"><span class="num">05</span>Task Queues: Celery</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Placing an order must return in milliseconds. The receipt email takes a second, the provider sometimes times out, and the email must not be lost if a web process restarts. Monthly statements for every restaurant take minutes. How do we separate <em>asking</em> for slow work from <em>doing</em> it, and retry when it fails?</p>
  </div>
  <p>The API writes a small message, "send receipt for order 101", onto a <strong>queue</strong> and answers at once. Separate <strong>worker</strong> processes, possibly on other machines, take messages off the queue and do the work; status and results go to a store the API can read. <strong>Celery</strong> is the standard Python tool, with three parts: the <strong>broker</strong> (the queue; here our Redis db 1), the <strong>workers</strong>, and the <strong>result backend</strong> (state and return values; Redis db 2).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A dry cleaner. You drop the suit at the counter, get a numbered slip (job id), and leave in two minutes. The cleaning happens in the back. You check later with your slip number: "in progress" or "ready". If a machine breaks, the suit goes back on the rack and is cleaned again.</p></div>
  <figure class="viz"><svg viewBox="0 0 600 130" width="600">
    <defs><marker id="ap-ar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="5" y="40" width="105" height="48" rx="6" class="fb sb"/><text x="57" y="61" text-anchor="middle">API</text><text x="57" y="78" text-anchor="middle" font-size="11">201 + job id</text>
    <rect x="160" y="40" width="120" height="48" rx="6" class="fr sr"/><text x="220" y="61" text-anchor="middle">Broker</text><text x="220" y="78" text-anchor="middle" font-size="11">Redis db 1</text>
    <rect x="330" y="40" width="110" height="48" rx="6" class="fv sb"/><text x="385" y="61" text-anchor="middle">Workers</text><text x="385" y="78" text-anchor="middle" font-size="11">send emails</text>
    <rect x="490" y="40" width="105" height="48" rx="6" class="ft st"/><text x="542" y="61" text-anchor="middle">Result store</text><text x="542" y="78" text-anchor="middle" font-size="11">Redis db 2</text>
    <line x1="110" y1="64" x2="158" y2="64" stroke="currentColor" marker-end="url(#ap-ar3)"/>
    <line x1="280" y1="64" x2="328" y2="64" stroke="currentColor" marker-end="url(#ap-ar3)"/>
    <line x1="440" y1="64" x2="488" y2="64" stroke="currentColor" marker-end="url(#ap-ar3)"/>
    <path d="M385,40 C385,10 220,10 220,38" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#ap-ar3)"/><text x="300" y="16" text-anchor="middle" font-size="10">retry: back on the queue</text>
    <path d="M542,88 C542,125 57,125 57,90" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#ap-ar3)"/><text x="300" y="120" text-anchor="middle" font-size="11">app polls GET /v1/jobs/{id}</text>
  </svg><figcaption>The request returns in milliseconds; the email happens elsewhere, and a failed attempt goes back on the queue.</figcaption></figure>
  <p>The task. To show retries honestly, a counter in Redis makes the first attempt for each order fail with a timeout, as a flaky provider would:</p>
<div class="fx" data-lang="py"># tasks.py: Biteful's slow work, run by Celery workers
import time, redis
from celery import Celery

app = Celery("biteful", broker="redis://localhost:6390/1", backend="redis://localhost:6390/2")
app.conf.task_acks_late = True          # ack only after success: a crashed worker's task is redone
app.conf.task_track_started = True      # report STARTED, not just PENDING -&gt; SUCCESS
flaky = redis.Redis(port=6390, db=3)    # used only to make the first attempt fail

@app.task(bind=True, max_retries=3, default_retry_delay=2)
def send_receipt_email(self, order_id: int, customer: str, total: int):
    try:
        if flaky.incr(f"attempts:{order_id}") == 1:          # the provider times out once
            raise ConnectionError("email provider timed out")
        time.sleep(1)                                        # talking to the provider
        return {"order_id": order_id, "sent_to": customer, "total": total,
                "attempt": self.request.retries + 1}
    except ConnectionError as exc:
        raise self.retry(exc=exc)                            # try again in 2 s</div>
  <p>The API: placing an order queues the receipt and returns its job id; a second endpoint reports the job's state.</p>
<div class="fx" data-lang="py"># orders_api.py: placing an order queues the receipt instead of sending it
import time
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
<div class="fx" data-lang="py"># submit.py: Asha places order 101 and her app polls the receipt job
import time
from fastapi.testclient import TestClient
from orders_api import api

c = TestClient(api)
t0 = time.perf_counter()
r = c.post("/v1/orders", params={"customer": "asha", "total": 240})
print(f"POST /v1/orders -&gt; {r.status_code} in {(time.perf_counter() - t0) * 1000:.0f} ms: {r.json()}")
job = r.json()["receipt_job"]
while True:
    s = c.get(f"/v1/jobs/{job}").json()
    print(f"t={time.perf_counter() - t0:4.1f}s  state={s['state']}" + (f"  result={s['result']}" if "result" in s else ""))
    if s["state"] in ("SUCCESS", "FAILURE"):
        break
    time.sleep(1)
print("unknown id -&gt;", c.get("/v1/jobs/no-such-job").json())</div>
  <p>Worker in terminal 1, then the client:</p>
<div class="fx" data-lang="text">$ celery -A tasks worker --concurrency=2 --loglevel=info      # terminal 1 (banner trimmed)
- ** ---------- .&gt; transport:   redis://localhost:6390/1
- ** ---------- .&gt; results:     redis://localhost:6390/2
- *** --- * --- .&gt; concurrency: 2 (prefork)
[2026-10-20 00:31:41,279: INFO/MainProcess] Connected to redis://localhost:6390/1
[2026-10-20 00:31:42,306: INFO/MainProcess] celery@vm ready.
[2026-10-20 00:31:47,314: INFO/MainProcess] Task tasks.send_receipt_email[140f7cf0-…] received
[2026-10-20 00:31:47,329: INFO/MainProcess] Task tasks.send_receipt_email[140f7cf0-…] received
[2026-10-20 00:31:47,332: INFO/ForkPoolWorker-1] Task tasks.send_receipt_email[140f7cf0-…] retry: Retry in 2s: ConnectionError('email provider timed out')
[2026-10-20 00:31:50,327: INFO/ForkPoolWorker-1] Task tasks.send_receipt_email[140f7cf0-…] succeeded in 1.0024426269997093s: {'order_id': 101, 'sent_to': 'asha', 'total': 240, 'attempt': 2}</div>
<div class="fx" data-lang="text">$ python submit.py                                              # terminal 2</div>
<div class="fx" data-lang="text">POST /v1/orders -&gt; 201 in 50 ms: {'order_id': 101, 'status': 'placed', 'receipt_job': '140f7cf0-f1ea-4565-ad0c-ea3a40d82dde'}
t= 0.1s  state=STARTED
t= 1.1s  state=RETRY
t= 2.1s  state=STARTED
t= 3.1s  state=SUCCESS  result={'order_id': 101, 'sent_to': 'asha', 'total': 240, 'attempt': 2}
unknown id -&gt; {'job_id': 'no-such-job', 'state': 'PENDING'}</div>
  <table class="tbl"><caption>The timeline, from both logs</caption>
    <tr><th>Time</th><th>What happened</th></tr>
    <tr><td>0 s</td><td><code>.delay()</code> wrote a message to the broker; the API answered 201 in 50 ms (first call also opened the Redis connection)</td></tr>
    <tr><td>≈ 0 s</td><td>a worker took it: STARTED; the "provider" timed out; <code>self.retry</code> scheduled a new attempt in 2 s: RETRY (that is the second "received" line)</td></tr>
    <tr><td>≈ 2 s</td><td>attempt 2 STARTED; the email takes 1 s</td></tr>
    <tr><td>≈ 3 s</td><td>SUCCESS, result says <code>attempt: 2</code></td></tr>
  </table>
  <p>The last line is a real surprise: an id that never existed also reports PENDING. Celery's result store only knows jobs that have started, so "waiting" and "never existed" look the same. If that matters, save job ids in your own database.</p>
  <ul>
    <li><strong>Make tasks idempotent</strong>: with retries and <code>acks_late</code>, a task can run twice. Record "receipt sent for 101" and check it before sending, so a re-run doesn't email Asha twice.</li>
    <li><strong>Pass ids, not data</strong>: send <code>order_id</code>, not a 200 KB order object.</li>
    <li><strong>Use it for</strong>: emails, SMS, payouts to restaurants, monthly statements, image resizing, model retraining.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span><p><strong>Task queue</strong>: producers put units of work on a queue; separate workers execute them asynchronously. <strong>Ack</strong>: the worker telling the broker "done, delete the message". <strong>acks_late</strong>: ack after the task finishes, so a crash mid-task leaves the message to be redelivered.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Calling BackgroundTasks a queue. It runs inside the web process: no retries, no status, lost on restart, competing with requests for CPU. Fine for a log line after responding; not for receipts or 10-minute jobs.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: rate limiting at scale.</b> Fast reads, reliable slow work. Then Ben's app ships a bug: a retry loop with no pause that calls the orders API hundreds of times a second. Every other customer slows down. nginx's per-IP limit is coarse (many users share one office IP). How do we cap each <em>customer</em> fairly, across all copies?</div>

  <h2 id="ap-rl"><span class="num">06</span>Rate Limiting at Scale</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We want "each customer key: at most 5 calls per minute on this endpoint", answered with 429 and <code>Retry-After</code>. The obvious counter, one per clock minute, has a hole; real users are bursty; and the counter must be the same for every copy. Which algorithm, and where does the counter live?</p>
  </div>
  <p><strong>Fixed window</strong>: one counter per client per clock minute. The hole: 5 calls at 0:59.5 and 5 more at 1:00.2 fall in different minutes, so all 10 pass in under a second. <strong>Sliding window</strong>: "how many calls in the last 60 seconds from now?"</p>
<div class="fx" data-lang="py">from collections import defaultdict, deque

LIMIT, WINDOW = 5, 60                       # Ben's key: 5 orders-API calls per 60 seconds
times = [59.5] * 5 + [60.2] * 5             # 5 calls just before :60, 5 just after

def fixed_window(times):
    counts, out = defaultdict(int), []
    for t in times:
        bucket = int(t // WINDOW)           # which clock minute: 0 or 1
        counts[bucket] += 1
        out.append(counts[bucket] &lt;= LIMIT)
    return out

def sliding_window(times):
    log, out = deque(), []
    for t in times:
        while log and log[0] &lt;= t - WINDOW:  # forget calls older than 60 s
            log.popleft()
        ok = len(log) &lt; LIMIT
        if ok:
            log.append(t)
        out.append(ok)
    return out

print("fixed  :", sum(fixed_window(times)), "of 10 allowed")
print("sliding:", sum(sliding_window(times)), "of 10 allowed")</div>
<div class="fx" data-lang="text">fixed  : 10 of 10 allowed
sliding: 5 of 10 allowed</div>
  <p><code>int(t // WINDOW)</code> put 59.5 in minute 0 and 60.2 in minute 1: two fresh counters. The sliding window's <code>deque</code> still held the five calls from 59.5 at 60.2, so the second group was refused.</p>
  <h3>Token bucket: allow bursts, cap the average</h3>
  <p>Real users are bursty: Asha's app fires 5 calls when it opens, then nothing. A <strong>token bucket</strong> holds at most <em>capacity</em> tokens, refilled at <em>rate</em> per second; each request spends one; empty means 429.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A pani-puri vendor. His plate holds at most 5 puris (capacity), and he makes one per second (rate). Five friends can each grab one at once (burst); after that, one per second.</p></div>
  <table class="tbl"><caption>Dry run: capacity 5, refill 1 token/s</caption>
    <tr><th>Time</th><th>Event</th><th>Tokens before</th><th>Result</th><th>Tokens after</th></tr>
    <tr><td>0 s</td><td>requests 1–5</td><td>5, 4, 3, 2, 1</td><td>ok × 5</td><td>0</td></tr>
    <tr><td>0 s</td><td>requests 6–8</td><td>0</td><td>429 × 3</td><td>0</td></tr>
    <tr><td>2 s</td><td>refill 2 s × 1/s</td><td>0 → 2</td><td>–</td><td>2</td></tr>
    <tr><td>2 s</td><td>requests 9–11</td><td>2, 1, 0</td><td>ok, ok, 429</td><td>0</td></tr>
  </table>
<div class="fx" data-lang="py">import time, uuid, redis

class TokenBucket:
    """Holds up to capacity tokens; refills rate tokens/sec. Each request spends 1."""
    def __init__(self, capacity: int, rate: float):
        self.capacity, self.rate = capacity, rate
        self.tokens, self.last = capacity, time.monotonic()

    def allow(self) -&gt; bool:
        now = time.monotonic()
        self.tokens = min(self.capacity, self.tokens + (now - self.last) * self.rate)
        self.last = now
        if self.tokens &gt;= 1:
            self.tokens -= 1
            return True
        return False

b = TokenBucket(capacity=5, rate=1)                      # burst 5, then 1 req/s
print("burst of 8:   ", ["ok" if b.allow() else "429" for _ in range(8)])
time.sleep(2)
print("2 s later, 3: ", ["ok" if b.allow() else "429" for _ in range(3)])

# Sliding-window log in Redis: shared by ALL API processes and servers
r = redis.Redis(port=6390)

def allow_sliding(client: str, limit: int = 3, window_s: float = 1.0) -&gt; bool:
    key, now = f"rl:{client}", time.time()
    p = r.pipeline()
    p.zremrangebyscore(key, 0, now - window_s)           # drop requests older than the window
    p.zadd(key, {uuid.uuid4().hex: now})                 # record this one
    p.zcard(key)                                         # count requests in the window
    p.expire(key, int(window_s) + 1)
    _, _, count, _ = p.execute()
    return count &lt;= limit

print("sliding, 5 fast:", ["ok" if allow_sliding("ben") else "429" for _ in range(5)])
time.sleep(1.1)
print("1.1 s later:    ", ["ok" if allow_sliding("ben") else "429" for _ in range(2)])</div>
<div class="fx" data-lang="text">burst of 8:    ['ok', 'ok', 'ok', 'ok', 'ok', '429', '429', '429']
2 s later, 3:  ['ok', 'ok', '429']
sliding, 5 fast: ['ok', 'ok', 'ok', '429', '429']
1.1 s later:     ['ok', 'ok']</div>
  <p>The first two lines match the dry run. The refill is computed lazily: on each call, add <code>elapsed × rate</code>, capped at capacity; <code>time.monotonic()</code> never jumps when the clock is adjusted. The Redis version is a sliding-window log: a <strong>sorted set</strong> (members ordered by a score; here the timestamp) with one entry per request; <code>zremrangebyscore</code> drops old ones, <code>zadd</code> records this one, <code>zcard</code> counts, and the <code>pipeline</code> sends all four in one round trip. Because it lives in Redis, every worker and server shares the count (section 09 measures the difference).</p>
  <table class="tbl">
    <tr><th>Algorithm</th><th>Idea</th><th>Pro</th><th>Con</th></tr>
    <tr><td>Fixed window</td><td>counter per clock minute</td><td>one <code>INCR</code></td><td>2× burst at the boundary</td></tr>
    <tr><td>Sliding window log</td><td>timestamps in a sorted set</td><td>exact</td><td>memory per request</td></tr>
    <tr><td>Sliding window counter</td><td>weighted mix of two fixed windows</td><td>cheap, near-exact</td><td>approximate</td></tr>
    <tr><td>Token bucket</td><td>tokens refill at rate r, cap b</td><td>bursts allowed, smooth average</td><td>two values to tune</td></tr>
    <tr><td>Leaky bucket</td><td>queue drains at fixed rate</td><td>perfectly smooth output</td><td>adds queueing delay</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Rate limiting</strong>: capping requests per client (IP, key, user) per time window; answer 429 with <code>Retry-After</code>. Layers: coarse per-IP at the edge (nginx, section 03), fine per-key in the app (Redis).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>An in-memory limiter gives each worker its own count, so the real limit becomes limit × processes (measured in section 09). Our Redis variant also counts rejected calls, which deliberately punishes clients that keep hammering. In design interviews ("design a rate limiter"), name the algorithm and where the counter lives.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: logging and monitoring.</b> The system is protected and fast. A customer emails at 10 AM: "the app was slow and showed an error around 3 AM". Which request? On which of four processes on two servers? How many others? Is it still happening? We have no way to know.</div>

  <h2 id="ap-obs"><span class="num">07</span>Structured Logging &amp; Monitoring</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>With <code>print</code> statements scattered over four processes on two servers, we cannot find Asha's 3 AM request, cannot count how many were hit, and cannot see whether latency is creeping up right now. What should every copy record, and in what form?</p>
  </div>
  <p>Two kinds of record. <strong>Logs</strong> are a diary of individual events: "request X, /v1/orders, 500, 2300 ms". <strong>Metrics</strong> are numbers aggregated over time: requests per second, share of 5xx, 95th-percentile latency. Logs answer "what happened to this request?"; metrics answer "how is the whole system doing?". Google's SRE book names the <strong>four golden signals</strong>: <strong>latency</strong>, <strong>traffic</strong>, <strong>errors</strong>, <strong>saturation</strong> (how full: CPU, memory, queue length). For ML endpoints add the distribution of predictions, input drift and the model version.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A car. The dashboard (metrics) shows speed and temperature at a glance, and a warning light comes on past a line (alert). The service book (logs) lists each visit in detail, so the mechanic can see exactly what happened.</p></div>
  <h3>Why percentiles, not the average</h3>
  <p>The <strong>p95</strong> is the value 95% of requests are faster than. Twenty menu requests, two of which missed the cache at a cold start:</p>
<div class="fx" data-lang="py">import statistics

# latency of 20 Biteful menu requests in ms: most hit the cache, two missed it at a cold start
lat = [42, 38, 45, 40, 41, 39, 44, 43, 40, 38, 41, 42, 39, 45, 40, 43, 41, 44, 1900, 2300]

def pct(values, p):                         # nearest-rank percentile
    s = sorted(values)
    return s[max(0, int(round(p / 100 * len(s))) - 1)]

print("mean:", round(statistics.mean(lat), 1), "ms")
print("p50 :", pct(lat, 50), "ms")
print("p95 :", pct(lat, 95), "ms")
print("p99 :", pct(lat, 99), "ms")</div>
<div class="fx" data-lang="text">mean: 247.2 ms
p50 : 41 ms
p95 : 1900 ms
p99 : 2300 ms</div>
  <p>The mean, 247 ms, describes nobody: 18 customers saw about 40 ms and 2 saw about 2 seconds. p50 shows the typical customer; p95/p99 show the unhappy tail. Alert on p95/p99.</p>
  <h3>JSON logs and Prometheus metrics in the app</h3>
  <p><code>prod_app.py</code> (the app behind nginx in section 03) writes one JSON line per request from a <strong>middleware</strong>, and exports <strong>Prometheus</strong> metrics at <code>/metrics</code>. Prometheus is a monitoring server that visits <code>/metrics</code> on every copy every few seconds ("scrapes") and stores the numbers; Grafana draws graphs; alert rules page a human.</p>
<div class="fx" data-lang="py"># prod_app.py: the Biteful API as it runs in production (one file for the demos)
import json, logging, os, sys, time, uuid
import redis
from fastapi import Depends, FastAPI, Header, HTTPException, Request, Response
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

# ---------- structured (JSON) logging ----------
class JsonFormatter(logging.Formatter):
    def format(self, rec):
        return json.dumps({"ts": round(rec.created, 3), "level": rec.levelname,
                           "msg": rec.getMessage(), **getattr(rec, "fields", {})})

handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(JsonFormatter())
log = logging.getLogger("biteful")
log.addHandler(handler)
log.setLevel(logging.INFO)

# ---------- metrics ----------
REQS = Counter("http_requests_total", "Requests", ["path", "status"])
LAT = Histogram("http_request_seconds", "Latency", ["path"], buckets=(0.01, 0.05, 0.1, 0.5, 1))

INSTANCE = os.environ.get("INSTANCE", "api-?")
cache = redis.Redis(port=6390, socket_timeout=0.2, decode_responses=True)   # shared by every copy
app = FastAPI()</div>
<div class="fx" data-lang="py">@app.middleware("http")
async def observe(request: Request, call_next):
    rid = request.headers.get("X-Request-ID") or uuid.uuid4().hex[:8]
    t0 = time.perf_counter()
    response = await call_next(request)
    dt = time.perf_counter() - t0
    path = request.scope.get("route").path if request.scope.get("route") else request.url.path
    if path != "/metrics":
        REQS.labels(path, response.status_code).inc()
        LAT.labels(path).observe(dt)
        log.info("request", extra={"fields": {
            "request_id": rid, "method": request.method, "path": request.url.path,
            "status": response.status_code, "ms": round(dt * 1000, 1),
            "instance": INSTANCE, "pid": os.getpid()}})
    response.headers["X-Request-ID"] = rid
    return response</div>
  <p>Two lines from the round-robin test in section 03, one from each server's stdout:</p>
<div class="fx" data-lang="text">{"ts": 1792456421.182, "level": "INFO", "msg": "request", "request_id": "a00603a4482324555f375c6ad546154b", "method": "GET", "path": "/v1/recommend", "status": 200, "ms": 256.5, "instance": "api-1", "pid": 4938}
{"ts": 1792456421.461, "level": "INFO", "msg": "request", "request_id": "eafdc1ba7ec82e3701afd42f15eec541", "method": "GET", "path": "/v1/recommend", "status": 200, "ms": 253.5, "instance": "api-2", "pid": 4936}</div>
  <p>Each line is a JSON object, so a log system (Loki, ELK, Cloud Logging) can filter <code>status=500 AND path="/v1/orders"</code> or pull every line with one <code>request_id</code>. The 32-character ids came from nginx's <code>$request_id</code>, so the same id is in nginx's logs and the app's. <code>ms</code> ≈ 250 is the 0.25 s of CPU. Now the metrics, scraped four times from api-1 after 10 recommendation requests:</p>
<div class="fx" data-lang="text">$ for i in $(seq 10); do curl -s -o /dev/null localhost:9001/v1/recommend?customer=asha; done

$ for i in 1 2 3 4; do curl -s localhost:9001/metrics | grep '^http_requests_total{path="/v1/recommend"'; done
http_requests_total{path="/v1/recommend",status="200"} 2.0
http_requests_total{path="/v1/recommend",status="200"} 8.0
http_requests_total{path="/v1/recommend",status="200"} 2.0
http_requests_total{path="/v1/recommend",status="200"} 2.0</div>
  <p>The counter said 2, 8, 2, 2: api-1 has two gunicorn workers, each a separate process with its own counters, and <code>/metrics</code> is answered by whichever worker gets the scrape. Both are right about themselves; neither is the total 10. Fix: <code>prometheus_client</code>'s multiprocess mode (<code>PROMETHEUS_MULTIPROC_DIR</code>) or one exporter per worker. <code>REQS</code> is a <strong>counter</strong> (only goes up); <code>LAT</code> is a <strong>histogram</strong> (counts per latency bucket: under 10 ms, 50 ms…), from which Prometheus estimates p95: <code>histogram_quantile(0.95, rate(http_request_seconds_bucket[5m]))</code>.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Structured logging</strong>: logs as machine-readable records (JSON) with named fields. <strong>Observability</strong>: explaining the system's behaviour from logs, metrics and traces. <strong>SLO</strong>: a target such as "99% of order requests under 300 ms over 30 days".</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Alerting on the mean, or on causes (CPU 80%) instead of symptoms users feel (error rate &gt; 1% for 5 min, p99 over the SLO). And never log passwords, tokens, full card numbers or customers' addresses.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: health checks.</b> Humans can now see problems. But the load balancer must decide by itself, every few seconds, whether to send a copy traffic, and an orchestrator must decide whether to restart it. A copy that has lost Redis is alive but useless. How does a machine ask?</div>

  <h2 id="ap-health"><span class="num">08</span>Health Checks</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A copy that just started may still be loading the ETA model. A copy whose Redis connection dropped is alive but can't rate-limit or read the cache. A copy stuck in an infinite loop is broken. These need different reactions (wait, stop traffic, restart). How does the infrastructure tell them apart?</p>
  </div>
  <p>Two endpoints answer two questions. <strong>Liveness</strong> (<code>/health</code>): "is this process alive at all?" Cheap, no dependency checks; failure → restart. <strong>Readiness</strong> (<code>/ready</code>): "can I do useful work right now?" Checks the model and Redis; failure → stop routing traffic here, but don't restart.</p>
<div class="fx" data-lang="py"># ---------- health ----------
@app.get("/health")                              # liveness: is this process alive?
def health():
    return {"status": "alive"}

@app.get("/ready")                               # readiness: can it serve real traffic?
def ready(response: Response):
    checks = {"model_loaded": True}
    try:
        checks["redis"] = bool(cache.ping())
    except redis.RedisError:
        checks["redis"] = False
    if not all(checks.values()):
        response.status_code = 503               # "don't send me traffic yet"
    return checks

@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)</div>
  <p>With api-1 running, we shut Redis down and started it again:</p>
<div class="fx" data-lang="text">$ redis-cli -p 6390 shutdown nosave

$ curl -s -w ' %{http_code}\\n' localhost:9001/health
{"status":"alive"} 200

$ curl -s -w ' %{http_code}\\n' localhost:9001/ready
{"model_loaded":true,"redis":false} 503

$ redis-server --port 6390 --save '' --appendonly no --daemonize yes --dir . --pidfile ./redis.pid --logfile ./redis.log; sleep 0.5

$ curl -s -w ' %{http_code}\\n' localhost:9001/ready
{"model_loaded":true,"redis":true} 200</div>
  <p>While Redis was down, <code>/health</code> stayed 200 (no pointless restart) and <code>/ready</code> returned 503, so a load balancer would take this copy out of rotation; when Redis came back, 200 again. <code>socket_timeout=0.2</code> on the Redis client keeps the probe fast even if Redis hangs instead of refusing.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A shop. Liveness: is the shopkeeper breathing? If not, call an ambulance. Readiness: is the shutter up and is there stock? If not, send customers to the next shop, but nobody calls an ambulance.</p></div>
  <table class="tbl">
    <tr><th>Probe</th><th>Question</th><th>On failure</th><th>Checks</th></tr>
    <tr><td>Liveness <code>/health</code></td><td>stuck or dead?</td><td>restart</td><td>cheap; no dependencies</td></tr>
    <tr><td>Readiness <code>/ready</code></td><td>can it serve now?</td><td>stop routing traffic</td><td>model loaded, Redis/DB reachable</td></tr>
    <tr><td>Startup</td><td>has slow init finished?</td><td>wait before other probes</td><td>large model download</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Liveness probe</strong>: a check whose failure means restart. <strong>Readiness probe</strong>: a check whose failure means remove from the load balancer.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Putting dependency checks in liveness: a 30-second Redis blip makes the orchestrator restart every copy at once, a restart storm on top of the outage. Dependencies belong in readiness.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: horizontal scaling.</b> Every piece is in place for running more copies on more machines, and an autoscaler can add them at 12:30 and remove them at 15:00. Is adding copies really that simple, or does something in our code quietly break?</div>

  <h2 id="ap-scale"><span class="num">09</span>Horizontal Scaling</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Lunch traffic doubles. We can buy a bigger machine (vertical scaling) or add identical copies behind nginx (horizontal). Copies are cheaper and survive failures, but only if nothing important lives inside one copy. How do we find what breaks?</p>
  </div>
  <p>Measure it. <code>prod_app.py</code> has the same "5 calls per minute per customer" limit twice: once counted in each process's memory, once in Redis (code in section 06):</p>
<div class="fx" data-lang="py"># ---------- rate limit per customer: in this process vs shared in Redis ----------
LOCAL_COUNTS: dict[str, list[float]] = {}

def limit_local(x_customer: str = Header()):
    now = time.time()
    hits = [t for t in LOCAL_COUNTS.get(x_customer, []) if now - t &lt; 60] + [now]
    LOCAL_COUNTS[x_customer] = hits
    if len(hits) &gt; 5:
        raise HTTPException(429, "slow down", headers={"Retry-After": "60"})

def limit_shared(x_customer: str = Header()):
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
    return {"served_by": INSTANCE}

@app.get("/v1/orders/shared-limit", dependencies=[Depends(limit_shared)])
def orders_shared():
    return {"served_by": INSTANCE}</div>
  <p>Through nginx (2 servers × 2 workers = 4 processes), Ben's app calls each 30 times:</p>
<div class="fx" data-lang="text">$ for i in $(seq 30); do curl -s -o /dev/null -w '%{http_code}\\n' localhost:8088/v1/orders/local-limit -H 'X-Customer: ben'; done | sort | uniq -c
     19 200
     11 429

$ for i in $(seq 30); do curl -s -o /dev/null -w '%{http_code}\\n' localhost:8088/v1/orders/shared-limit -H 'X-Customer: ben'; done | sort | uniq -c
      5 200
     25 429</div>
  <p>The in-memory limit of 5 let <strong>19</strong> calls through: each of the 4 processes counted only the calls it happened to receive and allowed up to 5 (one received just 4). Add servers and the "limit" grows with them. The Redis limit let through exactly <strong>5</strong>, however many copies there are. The same thing happened to sessions in the fundamentals note (copy B said 401) and to metrics in section 07 (2 vs 8). The fix is always the same: move shared, changing state out of the process.</p>
  <table class="tbl">
    <tr><th>Stateful (breaks scaling)</th><th>Seen where</th><th>Stateless fix</th></tr>
    <tr><td>sessions in a dict</td><td>fundamentals 10: copy B 401</td><td>JWT, or sessions in Redis</td></tr>
    <tr><td>rate-limit counters in memory</td><td>here: 19 instead of 5</td><td>Redis sorted set / INCR</td></tr>
    <tr><td>cache in a dict</td><td>section 04 trap</td><td>Redis</td></tr>
    <tr><td>metrics per process</td><td>section 07: 2 vs 8</td><td>multiprocess mode / per-worker scrape</td></tr>
    <tr><td>uploads on local disk</td><td>menu photos</td><td>object storage (S3)</td></tr>
    <tr><td>background work in the web process</td><td>FastAPI BackgroundTasks</td><td>Celery workers</td></tr>
  </table>
  <p>Read-only state is fine: the ETA model file baked into every copy is identical. An <strong>autoscaler</strong> then adds or removes copies on CPU, p95 latency or (for Celery workers) queue length.</p>
  <table class="tbl">
    <tr><th></th><th>Vertical (scale up)</th><th>Horizontal (scale out)</th></tr>
    <tr><td>How</td><td>bigger machine</td><td>more identical copies behind a load balancer</td></tr>
    <tr><td>Limit</td><td>largest machine you can buy</td><td>practically none for stateless tiers</td></tr>
    <tr><td>Failure</td><td>one machine = one point of failure</td><td>a copy dies, others carry on (our failover test)</td></tr>
    <tr><td>Requires</td><td>nothing</td><td>stateless copies; shared stores</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Horizontal scaling</strong>: adding instances. <strong>Vertical scaling</strong>: making one instance bigger. <strong>Autoscaling</strong>: adjusting the instance count automatically from a metric.</p></div>
  <div class="callout intu"><span class="label">Key insight</span><p>Stateless copies are cattle, not pets: autoscalers add them at 12:30 and kill them at 15:00. If killing one copy at random would lose data, log users out or loosen a limit, the design isn't ready to scale.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Moving state to Redis moves the single point of failure there: Redis needs replication (or a managed service), and the app must degrade sensibly when it is unreachable (our <code>/ready</code> said 503). And the database becomes the next bottleneck: read replicas, connection pooling, caching.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> Every box is in place. Which mistakes in setting them up cause real day-two outages?</div>

  <h2 id="ap-traps"><span class="num">10</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each section ended with a trap. Which ones cause real incidents, in one list to check a deployment against?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: per-process state</span><p>Caches, rate-limit counters, sessions or metrics in a Python dict: 19 instead of 5, 2 instead of 10. Shared state in Redis; metrics in multiprocess mode.</p></div>
  <div class="callout trap"><span class="label">Trap: cache without TTL or invalidation</span><p>Stale menus forever and memory that only grows. Always <code>ex=</code>, delete on writes, version the key.</p></div>
  <div class="callout trap"><span class="label">Trap: stampede on hot keys</span><p>50 queries instead of 1 when a hot key expires. <code>SET NX</code> lock, TTL jitter or early refresh.</p></div>
  <div class="callout trap"><span class="label">Trap: slow work in the request</span><p>Emails, statements, retraining in an endpoint: timeouts and lost work. Queue it; return 201/202 with a job id.</p></div>
  <div class="callout trap"><span class="label">Trap: non-idempotent tasks</span><p>With retries and <code>acks_late</code> a task can run twice: two receipt emails, two payouts. Record completion and check it first.</p></div>
  <div class="callout trap"><span class="label">Trap: alerting on the mean</span><p>A mean of 247 ms hid a p99 of 2.3 s. Watch p95/p99 and error rate.</p></div>
  <div class="callout trap"><span class="label">Trap: dependencies in liveness</span><p>A Redis blip restarts every copy at once. Dependencies go in readiness.</p></div>
  <div class="callout trap"><span class="label">Trap: workers × model size</span><p>Each worker holds its own model; 8 × 3 GB = 24 GB. Size workers by memory as well as cores.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> All the boxes on one lunch-rush request.</div>

  <h2 id="ap-connect"><span class="num">11</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which box answers which of the three problems, which is built from which, and what did each one measure on Biteful?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 260" width="680">
    <defs><marker id="ap-c0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="10" width="200" height="34" rx="6" class="fb sb"/><text x="110" y="32" text-anchor="middle" font-size="12">one process isn't enough</text>
    <rect x="240" y="10" width="200" height="34" rx="6" class="fr sr"/><text x="340" y="32" text-anchor="middle" font-size="12">it gets slow</text>
    <rect x="470" y="10" width="200" height="34" rx="6" class="ft st"/><text x="570" y="32" text-anchor="middle" font-size="12">it fails silently</text>
    <rect x="10" y="64" width="200" height="38" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="110" y="81" text-anchor="middle" font-size="11">gunicorn workers</text><text x="110" y="95" text-anchor="middle" font-size="10" class="tm">2.03 s → 0.87 s; auto-restart</text>
    <rect x="10" y="114" width="200" height="38" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="110" y="131" text-anchor="middle" font-size="11">nginx</text><text x="110" y="145" text-anchor="middle" font-size="10" class="tm">round robin, failover, edge 429</text>
    <rect x="10" y="164" width="200" height="38" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="110" y="181" text-anchor="middle" font-size="11">horizontal scaling</text><text x="110" y="195" text-anchor="middle" font-size="10" class="tm">needs stateless copies</text>
    <rect x="240" y="64" width="200" height="38" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="340" y="81" text-anchor="middle" font-size="11">Redis cache</text><text x="340" y="95" text-anchor="middle" font-size="10" class="tm">500.7 → 0.2 ms; 50 → 1 query</text>
    <rect x="240" y="114" width="200" height="38" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="340" y="131" text-anchor="middle" font-size="11">Celery queue</text><text x="340" y="145" text-anchor="middle" font-size="10" class="tm">201 in 50 ms; retry succeeded</text>
    <rect x="240" y="164" width="200" height="38" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="340" y="181" text-anchor="middle" font-size="11">rate limits</text><text x="340" y="195" text-anchor="middle" font-size="10" class="tm">sliding 5 of 10; bucket bursts</text>
    <rect x="470" y="64" width="200" height="38" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="570" y="81" text-anchor="middle" font-size="11">JSON logs + metrics</text><text x="570" y="95" text-anchor="middle" font-size="10" class="tm">request id; p99 2300 vs mean 247</text>
    <rect x="470" y="114" width="200" height="38" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="570" y="131" text-anchor="middle" font-size="11">health checks</text><text x="570" y="145" text-anchor="middle" font-size="10" class="tm">/health 200, /ready 503</text>
    <line x1="110" y1="44" x2="110" y2="62" stroke="currentColor" marker-end="url(#ap-c0)"/>
    <line x1="340" y1="44" x2="340" y2="62" stroke="currentColor" marker-end="url(#ap-c0)"/>
    <line x1="570" y1="44" x2="570" y2="62" stroke="currentColor" marker-end="url(#ap-c0)"/>
    <rect x="120" y="222" width="440" height="32" rx="6" class="fg sg"/><text x="340" y="243" text-anchor="middle" font-size="12">Redis: shared state for cache, broker, limits, sessions</text>
    <line x1="210" y1="183" x2="250" y2="222" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#ap-c0)"/>
    <line x1="340" y1="202" x2="340" y2="220" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#ap-c0)"/>
    <line x1="570" y1="152" x2="480" y2="220" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#ap-c0)"/>
  </svg><figcaption>Three problems, three columns of answers. Dashed arrows: scaling, caching, queues, limits and readiness all depend on one shared store; that is what makes the copies stateless.</figcaption></figure>
  <table class="tbl"><caption>Every concept on Biteful</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Measured on Biteful</th><th>When to use</th></tr>
    <tr><td>gunicorn workers</td><td>processes + a supervisor</td><td>use all cores, survive crashes?</td><td>8 × 0.25 s CPU: 2.03 s → 0.87 s; pid 4389 killed → 4447</td><td>every deployment</td></tr>
    <tr><td>nginx</td><td>reverse proxy + upstream pool</td><td>many servers, one address?</td><td>alternating api-1/api-2; 11 ok / 19 × 429; failover</td><td>in front of every app</td></tr>
    <tr><td>Cache</td><td>Redis + TTL + invalidation</td><td>why recompute?</td><td>500.7 → 0.2 ms; stampede 50 → 1</td><td>read-heavy, repeated answers</td></tr>
    <tr><td>Task queue</td><td>broker + workers + result store</td><td>slow, must-not-lose work?</td><td>201 in 50 ms; RETRY → SUCCESS, attempt 2</td><td>emails, jobs, payouts</td></tr>
    <tr><td>Rate limiting</td><td>windows / buckets + shared counter</td><td>cap one client?</td><td>fixed 10/10, sliding 5/10; bucket ok×5, 429×3</td><td>public APIs, logins</td></tr>
    <tr><td>Logs + metrics</td><td>JSON lines, counters, histograms</td><td>what is happening?</td><td>mean 247 vs p99 2300 ms; per-worker 2 vs 8</td><td>always</td></tr>
    <tr><td>Health checks</td><td>two endpoints</td><td>restart or stop traffic?</td><td>Redis down: /health 200, /ready 503</td><td>behind any LB or orchestrator</td></tr>
    <tr><td>Horizontal scaling</td><td>stateless copies + shared stores</td><td>can we add copies?</td><td>local limit 19/30, Redis 5/30</td><td>whenever load grows</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p><strong>Production is the same API, multiplied: many worker processes on many servers behind a proxy, which only works when every piece of changing state lives in a shared store (Redis, the database, the queue), and when every copy reports what it is doing.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet.</b> After it, packaging these processes is <a class="xref" data-note="se_docker">Docker</a>'s job, and designing whole systems from these boxes is <a class="xref" data-note="sd_framework">system design</a>.</div>

  <h2 id="ap-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The note on one page. Running example: Biteful at the 12:30 lunch rush. Menu query 0.5 s; "recommended" 0.25 s CPU; receipt email 1 s, first attempt times out; Ben's buggy app hammers the API. Redis on port 6390; api-1 :9001, api-2 :9002 (2 workers each); nginx :8088.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>On Biteful</th><th>Weakness → next</th></tr>
    <tr><td>Big picture</td><td>what goes wrong at scale?</td><td>not enough, slow, silent</td><td>start with CPU → workers</td></tr>
    <tr><td>Workers</td><td>all cores; crash recovery?</td><td>2.03 → 0.87 s; replaced in 1 s</td><td>one machine → nginx</td></tr>
    <tr><td>nginx</td><td>one address, many servers?</td><td>RR, 11/19, failover</td><td>repeated slow reads → cache</td></tr>
    <tr><td>Cache</td><td>why recompute?</td><td>500.7 → 0.2 ms; 50 → 1</td><td>slow writes, lost emails → queue</td></tr>
    <tr><td>Celery</td><td>slow, reliable work?</td><td>201 in 50 ms; retry ok</td><td>floods → rate limits</td></tr>
    <tr><td>Rate limits</td><td>cap a client?</td><td>sliding 5/10; bucket</td><td>blind at 3 AM → logs/metrics</td></tr>
    <tr><td>Logs, metrics</td><td>see inside?</td><td>JSON + request id; p99</td><td>machines must decide → health</td></tr>
    <tr><td>Health</td><td>restart or drain?</td><td>200 / 503 / 200</td><td>add copies → scaling</td></tr>
    <tr><td>Scaling</td><td>can we add copies?</td><td>19 vs 5 of 30</td><td>→ Docker, system design</td></tr>
  </table>
  <h3>Formulas and numbers</h3>
  <table class="tbl">
    <tr><th>Formula</th><th>Symbols</th><th>On Biteful</th></tr>
    <tr><td>time ≈ (requests on busiest worker) × CPU per request</td><td>CPU-bound work, one request per core at a time</td><td>3 × 0.25 = 0.75 → 0.87 s</td></tr>
    <tr><td>ideal = N × t ÷ workers</td><td>N requests, t seconds each</td><td>8 × 0.25 ÷ 4 = 0.5 s</td></tr>
    <tr><td>hit ratio = hits ÷ reads</td><td>reads served from cache</td><td>2 of 3 in the dry run</td></tr>
    <tr><td>tokens = min(capacity, tokens + elapsed × rate)</td><td>capacity = burst, rate = sustained</td><td>5, 1/s: ok×5, 429×3; after 2 s ok, ok, 429</td></tr>
    <tr><td>sliding: count(requests in (now − W, now]) ≤ limit</td><td>W window seconds</td><td>W 60, limit 5: 5 of 10</td></tr>
    <tr><td>p95 = value 95% of requests are below (nearest rank: sorted[ceil(0.95n) − 1])</td><td>n = number of samples</td><td>n 20 → 19th value = 1900 ms</td></tr>
    <tr><td>effective in-memory limit ≈ limit × processes</td><td>per-process counters</td><td>5 × 4 = up to 20 (got 19)</td></tr>
  </table>
  <h3>Definitions</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td>Worker / process manager</td><td>OS process running the app / supervisor that starts and restarts them</td></tr>
    <tr><td>Reverse proxy / upstream</td><td>front server forwarding to backends / nginx's backend pool</td></tr>
    <tr><td>Cache-aside, TTL, invalidation, stampede</td><td>fill on miss; key lifetime; delete on change; many misses at once</td></tr>
    <tr><td>Broker / worker / result backend</td><td>queue of messages / executes tasks / stores state and results</td></tr>
    <tr><td>acks_late, idempotent task</td><td>ack after success; safe to run twice</td></tr>
    <tr><td>Golden signals</td><td>latency, traffic, errors, saturation</td></tr>
    <tr><td>Liveness / readiness</td><td>restart if failing / stop traffic if failing</td></tr>
    <tr><td>Stateless, horizontal scaling</td><td>no per-copy memory that matters; add copies</td></tr>
  </table>
  <h3>Use / avoid</h3>
  <div class="cards">
    <div><b>Use</b><p>gunicorn + UvicornWorker with workers ≈ cores (cap by RAM); nginx for TLS, balancing, edge limits; Redis cache-aside with TTL and invalidation; Celery for emails and jobs with retries and idempotency; Redis-backed limits; JSON logs with request ids; p95/p99 alerts; separate /health and /ready.</p></div>
    <div><b>Avoid</b><p>One process in production; caches, limits, sessions or metrics in process memory; caches without TTL; slow work in requests or BackgroundTasks for must-not-lose work; alerting on means; dependency checks in liveness; more workers than RAM allows.</p></div>
  </div>
  <h3>Five rapid-fire checks</h3>
  <ol>
    <li>8 requests each needing 0.25 s CPU on one uvicorn process: time? <em>About 2 s (measured 2.03 s): the GIL serialises the CPU work.</em></li>
    <li>nginx <code>rate=5r/s burst=10 nodelay</code>, 30 instant requests: how many pass at once? <em>11 (1 + burst 10); measured 11 × 200, 19 × 429.</em></li>
    <li>Why did the second Celery "received" line appear? <em>The retry put the task back on the queue; the worker received it again.</em></li>
    <li>Redis is down. /health and /ready return? <em>200 and 503.</em></li>
    <li>Limit of 5 per minute kept in each process's memory, 4 processes: how many calls can pass? <em>Up to 20 (measured 19 of 30); in Redis exactly 5.</em></li>
  </ol>

  <h2 id="ap-qa"><span class="num">12</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through the architecture of a production API like Biteful's.</summary><div class="qa-body">Clients → nginx/load balancer (TLS, per-IP limits, request ids) → N stateless API servers (gunicorn + uvicorn workers, model loaded in lifespan) → Redis (cache, limits, sessions), Postgres (orders), object storage (photos). Slow work goes via a broker to Celery workers. Every copy exposes /health, /ready, /metrics and writes JSON logs; Prometheus and alerts watch the golden signals.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain cache-aside and its failure modes.</summary><div class="qa-body">Read the cache; on a miss read the DB, store the value with a TTL, return it. Failure modes: staleness until TTL or invalidation; stampede when a hot key expires; inconsistency if the DB write succeeds but the cache delete fails (short TTLs bound it).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a cache stampede and how do you prevent it?</summary><div class="qa-body">Many concurrent misses on one expired key all hit the source. Let one refill with a lock (<code>SET lock NX EX 10</code>) while others wait and re-read; add TTL jitter; refresh hot keys early. Measured: 50 DB queries without the lock, 1 with it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use Celery instead of sending the receipt in the request?</summary><div class="qa-body">The request should return in milliseconds; the email takes a second and sometimes fails. A queue answers at once (201 in 50 ms), runs the email on separate workers, retries failures (our first attempt timed out, the second succeeded), and survives web-process restarts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>acks_late</code> change, and what does it require?</summary><div class="qa-body">The worker acks after the task finishes, so a crash mid-task gets the message redelivered. The task may run twice, so it must be idempotent (record "receipt sent for 101" and check it).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Token bucket, capacity 5, refill 1/s: 8 requests at once, then 3 after 2 s?</summary><div class="qa-body">ok × 5, 429 × 3; after 2 s two tokens have refilled: ok, ok, 429. Matches the run.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Weakness of a fixed-window limiter?</summary><div class="qa-body">Boundary bursts: N at the end of one window and N at the start of the next all pass. Limit 5/min with calls at 59.5 s and 60.2 s: fixed allowed 10, sliding 5.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why alert on p99 rather than average latency?</summary><div class="qa-body">The mean mixes fast and slow requests and describes neither: 247 ms mean while 18 of 20 saw ~40 ms and the slowest 2.3 s. p95/p99 show the tail unhappy users feel.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many gunicorn workers?</summary><div class="qa-body">Near the core count for CPU-bound or async apps (2 × cores + 1 is for sync I/O apps), capped by memory since each holds its own model, then load-test. With 4 cores, 4 workers cut 8 CPU-heavy requests from 2.03 s to 0.87–1.18 s (uneven distribution).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does nginx add in front of gunicorn?</summary><div class="qa-body">TLS termination, load balancing and failover across servers, buffering slow clients, timeouts, body-size and rate limits, request ids, compression and static files, at one entry point.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Liveness vs readiness: what goes wrong if /health checks Redis?</summary><div class="qa-body">A short Redis outage fails liveness everywhere and the orchestrator restarts every copy: a restart storm. Dependency checks belong in readiness (stop traffic), as our /ready 503 did while /health stayed 200.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does horizontal scaling depend on the fundamentals note's statelessness?</summary><div class="qa-body">A load balancer sends consecutive requests to different copies. Anything one copy remembers in memory is invisible to the others: sessions (401 on copy B), rate limits (19 instead of 5), caches and metrics. Stateless copies with shared stores are what make "add another copy" safe.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how do FastAPI's BackgroundTasks, async endpoints and Celery differ for the receipt email?</summary><div class="qa-body">Async lets one process wait on many emails (throughput) but the customer still waits; BackgroundTasks answer first but run in the web process with no retry; Celery moves the work to separate workers with a durable queue, retries and status. Only Celery survives a crash or deploy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does Redis appear in almost every section, and what is the risk?</summary><div class="qa-body">It is the shared, fast store that lets copies stay stateless: cache, broker and results, rate-limit counters, sessions and refresh-token ids (Auth note). The risk: it becomes a single point of failure and a bottleneck, so it needs replication or a managed service, timeouts, and readiness checks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip structured logs and request ids but have everything else?</summary><div class="qa-body">The system may be fast and resilient, but when the 3 AM error happens you can't find the request across 4 processes on 2 servers, can't connect nginx's line to the app's, and can't count who was affected. Observability is what turns "it failed silently" into "it failed, here, for these users".</div></details>
</main>
`
});
