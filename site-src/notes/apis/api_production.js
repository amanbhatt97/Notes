// notes/apis/api_production.js — Production Backend
Object.assign(TOPIC_CONTENT, {
  "api_production": `<main>
  <h1>Production Backend</h1>
  <p class="lead">A <code>/predict</code> endpoint that works on your laptop is 20% of the job. The rest is making it fast (caching), keeping slow work off the request path (task queues), protecting it from floods (rate limits), seeing inside it (logs, metrics) and running many copies of it safely (gunicorn workers, nginx, health checks, scaling). This note builds each piece from the problem it solves. Everything was run locally on real Redis 7, a real Celery worker, gunicorn and nginx. Builds on <a class="xref" data-note="api_fastapi">FastAPI</a> and <a class="xref" data-note="api_auth">Authentication &amp; Security</a>.</p>

  <h2 id="ap-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Production ML Backend</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Architecture</div>
        <ul>
          <li><b>Path</b> — client → LB/nginx (TLS) → N stateless API copies → cache / DB / model</li>
          <li><b>Slow work</b> — API → broker → Celery workers → result store</li>
          <li><b>Observability</b> — JSON logs + Prometheus metrics + request id</li>
          <li><b>State lives outside</b> the API: Redis, Postgres, S3</li>
          <li>💡 a busy restaurant: host, tables, waiters, kitchen</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Caching</div>
        <ul>
          <li><b>Cache-aside</b> — read cache → miss → DB → store with TTL</li>
          <li><b>Write-through</b> — write cache + DB together; <b>write-behind</b> — cache first, DB later</li>
          <li><b>TTL</b> — auto-expiry; bounds staleness (<code>SET k v EX 300</code>)</li>
          <li><b>Invalidation</b> — delete key on update; version keys (<code>features:v1:42</code>)</li>
          <li><b>Measured</b> — 501 ms miss → 0.2 ms hit</li>
          <li>⚠ <b>Stampede</b> — 50 misses → 50 DB queries; lock (<code>SET NX</code>) → 1</li>
          <li>💡 today's files on your desk, the rest in the archive</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Task queues (Celery)</div>
        <ul>
          <li><b>Why</b> — slow work (batch scoring, retraining, emails) off the request path</li>
          <li><b>Broker</b> — queue of task messages (Redis, RabbitMQ)</li>
          <li><b>Worker</b> — separate process that runs tasks</li>
          <li><b>Result backend</b> — PENDING → STARTED → SUCCESS/FAILURE</li>
          <li><b>API pattern</b> — <code>POST</code> → 202 + job id → poll <code>GET /jobs/{id}</code></li>
          <li><b>Reliability</b> — retries, <code>acks_late</code>, idempotent tasks, pass ids not data</li>
          <li>⚠ unknown job id also says PENDING</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Rate limiting</div>
        <ul>
          <li><b>Fixed window</b> — N per clock minute; ⚠ 2N burst at the boundary</li>
          <li><b>Sliding window</b> — count in the last T seconds (Redis sorted set)</li>
          <li><b>Token bucket</b> — capacity = burst, refill rate = sustained speed</li>
          <li><b>Leaky bucket</b> — queue drains at a fixed rate; smooth output</li>
          <li><b>Where</b> — edge per IP (nginx) + app per API key, shared store (Redis)</li>
          <li>Return <b>429 + Retry-After</b></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Logging &amp; Monitoring</div>
        <ul>
          <li><b>Structured logs</b> — one JSON object per event; searchable fields</li>
          <li><b>Request id</b> — made at the edge, logged by every service</li>
          <li><b>Golden signals</b> — latency, traffic, errors, saturation</li>
          <li><b>Percentiles</b> — p95/p99, not mean (mean 247 ms, p50 41 ms)</li>
          <li><b>ML signals</b> — prediction drift, null features, model version</li>
          <li><b>Alerts</b> — on user-visible symptoms, not every CPU blip</li>
          <li>⚠ counters are per process → multiprocess mode with gunicorn</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Servers &amp; Proxy</div>
        <ul>
          <li><b>gunicorn</b> — process manager; restarts killed workers</li>
          <li><b>UvicornWorker</b> — each worker runs an async event loop</li>
          <li><b>Workers</b> ≈ CPU cores (2×cores+1 for sync I/O apps); each loads its own model</li>
          <li><b>nginx</b> — TLS, load balancing, buffering, timeouts, limits</li>
          <li><b>proxy_next_upstream</b> — retry another server when one is down</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Health &amp; Scaling</div>
        <ul>
          <li><b>Liveness</b> <code>/health</code> — process alive? fail → restart</li>
          <li><b>Readiness</b> <code>/ready</code> — model loaded, Redis up? fail → 503, no traffic</li>
          <li><b>Vertical</b> — bigger machine; <b>horizontal</b> — more copies behind LB</li>
          <li><b>Stateless</b> — no sessions/files in memory → any copy serves any request</li>
          <li><b>Autoscale</b> — on CPU, latency or queue length</li>
          <li>⚠ in-memory caches/limits diverge across copies → Redis</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ap-arch"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Big Picture</span><span class="rm-sub">A production ML API end to end</span></div></div>
      <div class="rm-item rm-done" data-target="ap-cache"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Caching with Redis</span><span class="rm-sub">Cache-aside, TTL, invalidation, stampede</span></div></div>
      <div class="rm-item rm-done" data-target="ap-celery"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Task Queues: Celery</span><span class="rm-sub">Broker, worker, result backend</span></div></div>
      <div class="rm-item rm-done" data-target="ap-rl"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Rate Limiting</span><span class="rm-sub">Fixed window, token bucket, sliding window</span></div></div>
      <div class="rm-item rm-done" data-target="ap-obs"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Logging &amp; Monitoring</span><span class="rm-sub">JSON logs, golden signals, percentiles</span></div></div>
      <div class="rm-item rm-done" data-target="ap-srv"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Workers &amp; nginx</span><span class="rm-sub">gunicorn, uvicorn, reverse proxy</span></div></div>
      <div class="rm-item rm-done" data-target="ap-scale"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Health &amp; Scaling</span><span class="rm-sub">Liveness, readiness, statelessness</span></div></div>
      <div class="rm-item rm-done" data-target="ap-traps"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">What breaks on day two</span></div></div>
      <div class="rm-item rm-done" data-target="ap-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="ap-arch"><span class="num">01</span>The Big Picture</h2>
  <p>On your laptop, <code>uvicorn app:app</code> runs one process, the model sits in its memory, and you are the only user. Now the marketing team puts your churn score into the app used by two lakh customers. New problems arrive at once. The feature query takes 500 ms and runs on every call. A "score all customers" request takes ten minutes and the browser gives up after one. One buggy client sends 1,000 requests a second. The process crashes at 3 AM and nobody notices. And one process on one machine cannot keep up.</p>
  <p>A production backend is the set of standard answers to these problems. Each answer is a separate box with one job, so each can be understood, scaled and replaced on its own. The most important rule: the API copies keep <strong>no state of their own</strong>. Anything that must be remembered (cache, sessions, jobs, files) lives in a shared service outside them, so any copy can answer any request.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A busy Udupi restaurant on a Sunday. The host at the door (nginx) greets people, turns away a rowdy group, and seats each party at a free table. Many identical waiters (API copies) take orders. Popular items sit ready at the counter (cache). Big catering orders go on a ticket to the back kitchen (task queue) instead of blocking a waiter. The manager watches a board of how many tables are waiting (metrics). If a waiter goes home, the host just stops seating at his tables.</p></div>
  <figure class="viz"><svg viewBox="0 0 640 300" width="640">
    <defs><marker id="ap-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="5" y="115" width="80" height="44" rx="6" class="fv sb"/><text x="45" y="141" text-anchor="middle">Clients</text>
    <rect x="110" y="105" width="110" height="64" rx="6" class="ft st"/><text x="165" y="130" text-anchor="middle">nginx / LB</text><text x="165" y="148" text-anchor="middle" font-size="11" class="tm">TLS, limits</text>
    <rect x="250" y="40" width="140" height="44" rx="6" class="fb sb"/><text x="320" y="60" text-anchor="middle">API copy 1</text><text x="320" y="76" text-anchor="middle" font-size="10" class="tm">gunicorn × uvicorn</text>
    <rect x="250" y="115" width="140" height="44" rx="6" class="fb sb"/><text x="320" y="135" text-anchor="middle">API copy 2</text><text x="320" y="151" text-anchor="middle" font-size="10" class="tm">model in RAM</text>
    <rect x="250" y="190" width="140" height="44" rx="6" class="fb sb"/><text x="320" y="216" text-anchor="middle">API copy N</text>
    <rect x="430" y="10" width="95" height="40" rx="6" class="fr sr"/><text x="477" y="35" text-anchor="middle">Redis cache</text>
    <rect x="430" y="70" width="95" height="40" rx="6" class="fg sg"/><text x="477" y="95" text-anchor="middle">Postgres</text>
    <rect x="430" y="140" width="95" height="40" rx="6" class="fr sr"/><text x="477" y="165" text-anchor="middle">Broker</text>
    <rect x="545" y="140" width="90" height="40" rx="6" class="fv sb"/><text x="590" y="165" text-anchor="middle">Celery</text>
    <rect x="545" y="70" width="90" height="40" rx="6" class="ft st"/><text x="590" y="88" text-anchor="middle">S3 / model</text><text x="590" y="102" text-anchor="middle" font-size="10">registry</text>
    <rect x="250" y="255" width="385" height="36" rx="6" class="ft st"/><text x="442" y="278" text-anchor="middle">Prometheus metrics · JSON logs · alerts (every copy)</text>
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
  </svg><figcaption>Identical, stateless API copies behind a proxy; all shared state (cache, DB, queue, model files) lives outside them.</figcaption></figure>
  <p>Trace one prediction request through the picture:</p>
  <table class="tbl out"><caption>One request, box by box</caption>
    <tr><th>Step</th><th>Box</th><th>What happens</th><th>Section</th></tr>
    <tr><td>1</td><td>nginx</td><td>Decrypts HTTPS, checks the per-IP limit, adds a request id, picks API copy 2</td><td>06, 04</td></tr>
    <tr><td>2</td><td>API copy 2</td><td>Validates input, checks the API key (Auth note)</td><td>–</td></tr>
    <tr><td>3</td><td>Redis</td><td>Looks up cached features for this customer: hit, 0.2 ms</td><td>02</td></tr>
    <tr><td>4</td><td>Model in RAM</td><td>Predicts in a few ms</td><td>06</td></tr>
    <tr><td>5</td><td>Logs + metrics</td><td>One JSON log line; latency added to a histogram</td><td>05</td></tr>
    <tr><td>6</td><td>Response</td><td>Back through nginx to the client</td><td>–</td></tr>
  </table>
  <p>A "score all customers" request takes a different path: the API puts a message on the broker, replies "202, here is your job id" in milliseconds, and a Celery worker does the heavy work (section 03).</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Stateless service</strong>: a process that keeps nothing between requests that another copy would need. <strong>Load balancer</strong>: a component that spreads requests across copies. <strong>Reverse proxy</strong>: a server that sits in front of your app and forwards requests to it (nginx does both jobs).</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Saying "just use a bigger machine" in a system-design interview. One machine is one point of failure and has a ceiling. Interviewers want to hear "stateless copies behind a load balancer, state in Redis/Postgres/S3, slow work on a queue".</p></div>

  <h2 id="ap-cache"><span class="num">02</span>Caching with Redis</h2>
  <p>Your model needs a customer's features: orders in the last 90 days, average basket size. They come from a data-warehouse query that takes half a second. The same customer opens the app five times in an hour, so you run the same slow query five times and get the same answer. That is wasted time for the user and wasted money for the warehouse.</p>
  <p>A <strong>cache</strong> is a small, very fast store that keeps recent answers so you do not recompute them. <strong>Redis</strong> is the usual choice: an in-memory key-value server shared by all API copies, answering in well under a millisecond. The most common pattern is <strong>cache-aside</strong>: the app first asks the cache; on a <strong>hit</strong> it returns the stored value; on a <strong>miss</strong> it asks the real database, stores the result in the cache with an expiry time, and returns it.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Your desk vs the records room. Files you need today stay on the desk (cache): one second to grab. Others are in the records room downstairs (database): five minutes each way. Every evening the desk is cleared (expiry), and if a file is updated downstairs you throw away the old desk copy (invalidation).</p></div>
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
  <table class="tbl out"><caption>Dry run: four reads of customer 1, TTL 300 s</caption>
    <tr><th>Call</th><th>Cache has key?</th><th>Action</th><th>Time</th></tr>
    <tr><td>1</td><td>no</td><td>miss → DB query → SET with TTL 300</td><td>~500 ms</td></tr>
    <tr><td>2</td><td>yes</td><td>hit → return</td><td>&lt; 1 ms</td></tr>
    <tr><td>3</td><td>yes</td><td>hit → return</td><td>&lt; 1 ms</td></tr>
    <tr><td>–</td><td colspan="3">customer places an order → we DELETE the key</td></tr>
    <tr><td>4</td><td>no</td><td>miss → DB → SET again</td><td>~500 ms</td></tr>
  </table>
  <p>The code is that table in Python, using the <code>redis</code> client against a real Redis on port 6380. <code>time.sleep(0.5)</code> stands in for the warehouse query.</p>
  <div class="fx" data-lang="py">import json, time, redis

r = redis.Redis(port=6380, decode_responses=True)
r.flushdb()

def load_features_from_db(customer_id: int) -&gt; dict:
    time.sleep(0.5)                                  # stands in for a slow warehouse query
    return {"customer_id": customer_id, "orders_90d": 2, "avg_basket": 670.0}

def get_features(customer_id: int, ttl: int = 300) -&gt; dict:
    key = f"features:v1:{customer_id}"
    cached = r.get(key)                              # 1. look in the cache
    if cached is not None:
        return json.loads(cached)                    # 2a. hit
    value = load_features_from_db(customer_id)       # 2b. miss: go to the source
    r.set(key, json.dumps(value), ex=ttl)            # 3. store with a TTL
    return value

for attempt in range(3):
    t = time.perf_counter()
    get_features(1)
    print(f"call {attempt + 1}: {(time.perf_counter() - t) * 1000:7.1f} ms")

print("stored:", r.get("features:v1:1"))
print("TTL left:", r.ttl("features:v1:1"), "s")

# invalidation: the customer placed an order -&gt; delete, next read refills
r.delete("features:v1:1")
t = time.perf_counter(); get_features(1)
print(f"after invalidation: {(time.perf_counter() - t) * 1000:.1f} ms")</div>
  <div class="fx" data-lang="text">call 1:   500.8 ms
call 2:     0.2 ms
call 3:     0.1 ms
stored: {"customer_id": 1, "orders_90d": 2, "avg_basket": 670.0}
TTL left: 300 s
after invalidation: 500.6 ms</div>
  <p>Call 1 paid the full 500 ms; calls 2 and 3 took a fraction of a millisecond, about 2,500 times faster. Redis stores strings, so the dict goes in through <code>json.dumps</code> and comes out through <code>json.loads</code>. <code>ex=ttl</code> sets the <strong>TTL</strong> (time to live): after 300 s Redis deletes the key by itself, so data is never more than 5 minutes stale. The key name <code>features:v1:1</code> includes a version; when the feature logic changes, switch to <code>v2</code> and old entries are simply never read again.</p>
  <table class="tbl">
    <tr><th>Strategy</th><th>How</th><th>Good for</th></tr>
    <tr><td><strong>Cache-aside</strong></td><td>App reads cache, fills on miss (above)</td><td>Most read-heavy APIs, feature lookups</td></tr>
    <tr><td>Write-through</td><td>Every write goes to cache and DB together</td><td>Data read right after writing</td></tr>
    <tr><td>Write-behind</td><td>Write to cache; flush to DB later</td><td>Write-heavy counters; risk of loss</td></tr>
  </table>
  <h3>The stampede, and the lock that fixes it</h3>
  <p>A popular key expires. In the next 100 ms, 50 requests arrive. All 50 see a miss, and all 50 send the same slow query to the database at once. This is a <strong>cache stampede</strong> (or thundering herd), and it can knock over the database the cache was meant to protect. The fix: let only one request refill, and make the others wait briefly and re-read. Redis gives a tiny lock for free: <code>SET lock:key 1 NX EX 10</code> succeeds only if the key does <em>not</em> exist yet (<code>NX</code>), so exactly one caller wins.</p>
  <div class="fx" data-lang="py">import json, time, threading, redis

r = redis.Redis(port=6380, decode_responses=True)
db_calls = 0

def slow_db(cid):
    global db_calls
    db_calls += 1
    time.sleep(0.5)
    return {"customer_id": cid, "orders_90d": 2}

def get_naive(cid):
    key = f"features:v1:{cid}"
    if (v := r.get(key)) is not None:
        return json.loads(v)
    value = slow_db(cid)
    r.set(key, json.dumps(value), ex=300)
    return value

def get_with_lock(cid):
    key = f"features:v1:{cid}"
    while True:
        if (v := r.get(key)) is not None:
            return json.loads(v)
        # only ONE caller wins this lock (NX = set only if Not eXists); it expires after 10 s
        if r.set(f"lock:{key}", "1", nx=True, ex=10):
            value = slow_db(cid)
            r.set(key, json.dumps(value), ex=300)
            r.delete(f"lock:{key}")
            return value
        time.sleep(0.05)                       # someone else is refilling: wait, then re-read

for fn in (get_naive, get_with_lock):
    r.flushdb(); db_calls = 0                  # the hot key has just expired
    threads = [threading.Thread(target=fn, args=(7,)) for _ in range(50)]
    t = time.perf_counter()
    for th in threads: th.start()
    for th in threads: th.join()
    print(f"{fn.__name__:14} 50 concurrent requests -&gt; {db_calls:2} DB queries, {time.perf_counter() - t:.2f} s")</div>
  <div class="fx" data-lang="text">get_naive      50 concurrent requests -&gt; 50 DB queries, 0.61 s
get_with_lock  50 concurrent requests -&gt;  1 DB queries, 0.55 s</div>
  <p>50 threads play 50 simultaneous requests right after the key expired. <code>get_naive</code> sent 50 identical queries. <code>get_with_lock</code> sent exactly one: the winner of <code>r.set(..., nx=True)</code> refilled the cache, and the other 49 looped on <code>time.sleep(0.05)</code> and then found the value. Total time is about the same, but the database did 1/50th of the work. The lock's own <code>ex=10</code> matters: if the winner crashes, the lock frees itself. Other fixes: add random jitter to TTLs so keys do not all expire together, or refresh hot keys shortly before they expire.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Cache hit / miss</strong>: the value was / was not in the cache. <strong>Hit ratio</strong>: hits ÷ all reads. <strong>TTL</strong>: how long a key lives. <strong>Invalidation</strong>: removing a cached value because the source changed. <strong>Cache stampede</strong>: many concurrent misses on the same key overloading the source.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Caching without a TTL (stale forever, memory grows forever), forgetting to invalidate on writes, or caching per process in a Python dict: with 8 workers you get 8 different caches, each with its own stale data. <strong>For ML:</strong> cache features, embeddings and predictions for repeated inputs (key = hash of input + model version). Don't cache when inputs rarely repeat; it's just memory spent.</p></div>

  <h2 id="ap-celery"><span class="num">03</span>Task Queues: Celery</h2>
  <p>The business team wants a button: "score all 10 lakh customers". Doing it inside the request means the HTTP connection stays open for minutes. nginx and browsers give up after 30–60 seconds, the worker process is blocked the whole time, and if the process restarts halfway, the work is simply lost with no record.</p>
  <p>The answer is to separate <em>asking</em> for work from <em>doing</em> it. The API writes a small message, "score_batch(1000000)", onto a <strong>queue</strong> and immediately replies with a job id. Separate <strong>worker</strong> processes, possibly on other machines, take messages off the queue and do the work. Their status and results go into a store the API can read. <strong>Celery</strong> is the standard Python tool for this. It has three parts: the <strong>broker</strong> (the queue, usually Redis or RabbitMQ), the <strong>workers</strong>, and the <strong>result backend</strong> (where state and return values are kept).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Giving a suit to the dry cleaner. You drop it at the counter, get a numbered slip (job id) and leave in two minutes. The cleaning happens in the back over two days. You check later by quoting your slip number, and the counter says "still in progress" or "ready".</p></div>
  <figure class="viz"><svg viewBox="0 0 600 130" width="600">
    <defs><marker id="ap-ar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="5" y="40" width="105" height="48" rx="6" class="fb sb"/><text x="57" y="61" text-anchor="middle">API</text><text x="57" y="78" text-anchor="middle" font-size="11">202 + job id</text>
    <rect x="160" y="40" width="120" height="48" rx="6" class="fr sr"/><text x="220" y="61" text-anchor="middle">Broker</text><text x="220" y="78" text-anchor="middle" font-size="11">Redis / RabbitMQ</text>
    <rect x="330" y="40" width="110" height="48" rx="6" class="fv sb"/><text x="385" y="61" text-anchor="middle">Workers</text><text x="385" y="78" text-anchor="middle" font-size="11">N processes</text>
    <rect x="490" y="40" width="105" height="48" rx="6" class="ft st"/><text x="542" y="61" text-anchor="middle">Result store</text><text x="542" y="78" text-anchor="middle" font-size="11">state + result</text>
    <line x1="110" y1="64" x2="158" y2="64" stroke="currentColor" marker-end="url(#ap-ar3)"/>
    <line x1="280" y1="64" x2="328" y2="64" stroke="currentColor" marker-end="url(#ap-ar3)"/>
    <line x1="440" y1="64" x2="488" y2="64" stroke="currentColor" marker-end="url(#ap-ar3)"/>
    <path d="M542,88 C542,125 57,125 57,90" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#ap-ar3)"/><text x="300" y="120" text-anchor="middle" font-size="11">client polls GET /jobs/{id}</text>
  </svg><figcaption>The request returns in milliseconds; the heavy work happens elsewhere.</figcaption></figure>
  <p>First, the task. <code>tasks.py</code> defines the Celery app (broker = Redis db 1, results = Redis db 2) and one task. <code>time.sleep(3)</code> stands in for loading rows, predicting and writing a Parquet file.</p>
  <div class="fx" data-lang="py">import time
from celery import Celery

app = Celery("ml", broker="redis://localhost:6380/1", backend="redis://localhost:6380/2")
app.conf.task_acks_late = True          # ack only after success: a crashed worker's task is redone
app.conf.task_track_started = True      # report STARTED, not just PENDING -&gt; SUCCESS

@app.task(bind=True, max_retries=3, default_retry_delay=5)
def score_batch(self, n_rows: int):
    try:
        time.sleep(3)                   # pretend: load 1M rows, predict, write results
        return {"rows_scored": n_rows, "file": f"s3://preds/batch_{self.request.id[:8]}.parquet"}
    except ConnectionError as exc:
        raise self.retry(exc=exc)       # transient failure -&gt; try again later</div>
  <p>Next, a client script that queues one job and polls its state every second.</p>
  <div class="fx" data-lang="py">import time
from tasks import score_batch

t0 = time.perf_counter()
job = score_batch.delay(1_000_000)                   # returns immediately
print(f"queued in {(time.perf_counter() - t0) * 1000:.0f} ms  id={job.id}")
while not job.ready():
    print(f"t={time.perf_counter() - t0:3.1f}s  state={job.state}")
    time.sleep(1)
print(f"t={time.perf_counter() - t0:3.1f}s  state={job.state}  result={job.get()}")</div>
  <div class="fx" data-lang="text">$ celery -A tasks worker --concurrency=2 --loglevel=info   # terminal 1
$ python submit.py                                          # terminal 2
queued in 108 ms  id=ec7babf8-e2f4-429e-a757-8c39296c4b2b
t=0.1s  state=PENDING
t=1.1s  state=STARTED
t=2.1s  state=STARTED
t=3.1s  state=STARTED
t=4.1s  state=SUCCESS  result={'rows_scored': 1000000, 'file': 's3://preds/batch_ec7babf8.parquet'}

# worker log
- *** --- * --- .&gt; concurrency: 2 (prefork)
Connected to redis://localhost:6380/1
celery@vm ready.
Task tasks.score_batch[ec7babf8-e2f4-429e-a757-8c39296c4b2b] received
Task tasks.score_batch[ec7babf8-e2f4-429e-a757-8c39296c4b2b] succeeded in 3.0082215659999747s: {'rows_scored': 1000000, 'file': 's3://preds/batch_ec7babf8.parquet'}</div>
  <p><code>.delay(...)</code> did not run the function. It wrote a message to the broker and returned an <code>AsyncResult</code> in about 0.1 s (the first call also opens the Redis connection). The state then moved PENDING → STARTED → SUCCESS, which you can see in both the client and the worker log. <code>task_track_started</code> is what makes STARTED visible. <code>bind=True</code> gives the task <code>self</code>, used for <code>self.request.id</code> and <code>self.retry</code>.</p>
  <p>In a real API this becomes two endpoints: one that queues and answers <strong>202 Accepted</strong>, and one that reports status.</p>
  <div class="fx" data-lang="py">from celery.result import AsyncResult
from fastapi import FastAPI
from tasks import app as celery_app, score_batch

api = FastAPI()

@api.post("/jobs/score", status_code=202)            # 202 Accepted: "got it, working on it"
def start_scoring(n_rows: int):
    job = score_batch.delay(n_rows)
    return {"job_id": job.id, "status_url": f"/jobs/{job.id}"}

@api.get("/jobs/{job_id}")
def job_status(job_id: str):
    res = AsyncResult(job_id, app=celery_app)
    body = {"job_id": job_id, "state": res.state}
    if res.successful():
        body["result"] = res.result
    return body

# try it in-process (worker still running in terminal 1)
import time
from fastapi.testclient import TestClient
c = TestClient(api)
r = c.post("/jobs/score", params={"n_rows": 500})
print(r.status_code, r.json())
job_id = r.json()["job_id"]
for _ in range(3):
    print(c.get(f"/jobs/{job_id}").json()["state"]); time.sleep(1.6)
print(c.get(f"/jobs/{job_id}").json())
print(c.get("/jobs/no-such-job").json())             # unknown id</div>
  <div class="fx" data-lang="text">202 {'job_id': '39eb3573-14fb-4b9e-ac38-8702cf6fbf77', 'status_url': '/jobs/39eb3573-14fb-4b9e-ac38-8702cf6fbf77'}
STARTED
STARTED
SUCCESS
{'job_id': '39eb3573-14fb-4b9e-ac38-8702cf6fbf77', 'state': 'SUCCESS', 'result': {'rows_scored': 500, 'file': 's3://preds/batch_39eb3573.parquet'}}
{'job_id': 'no-such-job', 'state': 'PENDING'}</div>
  <p>The last line is a real surprise: an id that never existed also reports PENDING. Celery's result store only knows about jobs that have started, so "waiting" and "never existed" look the same. If that matters, save job ids in your own database when you create them.</p>
  <ul>
    <li><strong>Use it for</strong>: batch scoring, retraining, report generation, sending emails, calling flaky third-party APIs.</li>
    <li><strong>Make tasks idempotent</strong> (running twice gives the same result as once): with retries and <code>acks_late</code>, a task can run twice. Write to a file named by job id, not "append".</li>
    <li><strong>Pass ids, not data</strong>: send <code>s3://…</code> paths, not a 200 MB DataFrame through the broker.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span><p><strong>Task queue</strong>: a system where producers put units of work on a queue and separate workers execute them asynchronously. <strong>Ack</strong> (acknowledgement): the worker telling the broker "done, delete the message". <strong>acks_late</strong>: acknowledge after the task finishes, so a crash mid-task leaves the message to be retried.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Running long work in FastAPI's <code>BackgroundTasks</code> and calling it a queue. It runs inside the same web process: no retries, no status, lost on restart, and it competes with requests for CPU. Fine for "send a log line after responding", not for a 10-minute batch.</p></div>

  <h2 id="ap-rl"><span class="num">04</span>Rate Limiting</h2>
  <p>One customer's script has a bug: a <code>while True</code> loop calling <code>/predict</code> with no pause. It sends 2,000 requests a second. Your GPU bill climbs, and every other customer's requests slow down because the workers are busy with junk. You need a rule like "each key may make at most N requests per time window", and a polite answer when it is broken: <strong>429 Too Many Requests</strong>, with a <code>Retry-After</code> header saying when to try again.</p>
  <p>The simplest rule is a <strong>fixed window</strong>: one counter per client per clock minute. It has a hole at the boundary. Run the numbers with a limit of 5 per minute: 5 requests at 0:59.5 and 5 more at 1:00.2. They fall in different clock minutes, so all 10 pass, twice the limit in under a second. A <strong>sliding window</strong> instead asks "how many requests in the last 60 seconds from now?", and catches it.</p>
  <div class="fx" data-lang="py">from collections import defaultdict, deque

LIMIT, WINDOW = 5, 60                       # 5 requests per 60 seconds
times = [59.5] * 5 + [60.2] * 5             # 5 requests just before :60, 5 just after

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
        while log and log[0] &lt;= t - WINDOW:  # forget requests older than 60 s
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
  <p>In <code>fixed_window</code>, <code>int(t // WINDOW)</code> puts 59.5 in minute 0 and 60.2 in minute 1, two fresh counters. In <code>sliding_window</code>, the <code>deque</code> keeps the times of allowed requests; at 60.2 the five from 59.5 are still within 60 s, so the second group is refused.</p>
  <h3>Token bucket: allow bursts, cap the average</h3>
  <p>Real users are bursty: a dashboard loads and fires 5 calls at once, then nothing for a while. A <strong>token bucket</strong> allows that. Picture a bucket holding at most <em>capacity</em> tokens, refilled at <em>rate</em> tokens per second. Each request takes one token; an empty bucket means 429.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A pani-puri vendor. His plate holds at most 5 puris (capacity), and he makes 1 new puri per second (rate). Five friends can each grab one at once (burst), but after that everyone gets them only as fast as he makes them.</p></div>
  <table class="tbl out"><caption>Dry run: capacity 5, refill 1 token/s</caption>
    <tr><th>Time</th><th>Event</th><th>Tokens before</th><th>Result</th><th>Tokens after</th></tr>
    <tr><td>0 s</td><td>requests 1–5</td><td>5, 4, 3, 2, 1</td><td>ok × 5</td><td>0</td></tr>
    <tr><td>0 s</td><td>requests 6–8</td><td>0</td><td>429 × 3</td><td>0</td></tr>
    <tr><td>2 s</td><td>refill 2 s × 1/s</td><td>0 → 2</td><td>–</td><td>2</td></tr>
    <tr><td>2 s</td><td>requests 9–11</td><td>2, 1, 0</td><td>ok, ok, 429</td><td>0</td></tr>
  </table>
  <p>The code below runs exactly this, then a sliding-window limiter stored in Redis, so that all API copies share one count.</p>
  <figure class="viz"><svg viewBox="0 0 600 140" width="600">
    <defs><marker id="ap-ar4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <text x="70" y="15" text-anchor="middle" font-size="12">refill 1 token/s</text>
    <line x1="70" y1="20" x2="70" y2="40" stroke="currentColor" marker-end="url(#ap-ar4)"/>
    <path d="M20,42 L20,125 L120,125 L120,42" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="45" cy="110" r="9" class="fg sg"/><circle cx="70" cy="110" r="9" class="fg sg"/><circle cx="95" cy="110" r="9" class="fg sg"/><circle cx="45" cy="88" r="9" class="fg sg"/><circle cx="70" cy="88" r="9" class="fg sg"/>
    <text x="70" y="62" text-anchor="middle" font-size="11" class="tm">capacity 5</text>
    <text x="150" y="70" font-size="12">each request takes a token;</text>
    <text x="150" y="88" font-size="12">empty bucket → <tspan class="tr">429</tspan></text>
    <rect x="360" y="40" width="230" height="24" class="ft st"/><text x="475" y="57" text-anchor="middle" font-size="11">sliding window: last 1 s</text>
    <line x1="360" y1="100" x2="590" y2="100" stroke="currentColor"/>
    <circle cx="380" cy="100" r="5" class="fv sb"/><circle cx="450" cy="100" r="5" class="fb sb"/><circle cx="500" cy="100" r="5" class="fb sb"/><circle cx="540" cy="100" r="5" class="fb sb"/><circle cx="575" cy="100" r="5" class="fr sr"/>
    <line x1="420" y1="70" x2="420" y2="115" stroke="currentColor" stroke-dasharray="3 3"/><text x="420" y="130" text-anchor="middle" font-size="11">now − 1 s</text><text x="575" y="130" text-anchor="middle" font-size="11" class="tr">4th → 429</text>
  </svg><figcaption>Token bucket allows bursts up to capacity; a sliding window counts requests in the last T seconds.</figcaption></figure>
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

# Sliding-window log in Redis: shared by ALL API servers
r = redis.Redis(port=6380)

def allow_sliding(client: str, limit: int = 3, window_s: float = 1.0) -&gt; bool:
    key, now = f"rl:{client}", time.time()
    p = r.pipeline()
    p.zremrangebyscore(key, 0, now - window_s)           # drop requests older than the window
    p.zadd(key, {uuid.uuid4().hex: now})                 # record this one
    p.zcard(key)                                         # count requests in the window
    p.expire(key, int(window_s) + 1)
    _, _, count, _ = p.execute()
    return count &lt;= limit

print("sliding, 5 fast:", ["ok" if allow_sliding("key_42") else "429" for _ in range(5)])
time.sleep(1.1)
print("1.1 s later:    ", ["ok" if allow_sliding("key_42") else "429" for _ in range(2)])</div>
  <div class="fx" data-lang="text">burst of 8:    ['ok', 'ok', 'ok', 'ok', 'ok', '429', '429', '429']
2 s later, 3:  ['ok', 'ok', '429']
sliding, 5 fast: ['ok', 'ok', 'ok', '429', '429']
1.1 s later:     ['ok', 'ok']</div>
  <p>The first two lines match the dry-run table. Inside <code>allow</code>, the refill is computed lazily: no timer runs; on each call it adds <code>elapsed × rate</code> tokens, capped at <code>capacity</code>. <code>time.monotonic()</code> is used because it never jumps backwards when the system clock is adjusted. In <code>allow_sliding</code>, a Redis <strong>sorted set</strong> (members ordered by a score; here the score is the timestamp) holds one entry per request. <code>zremrangebyscore</code> drops old entries, <code>zadd</code> records this one, <code>zcard</code> counts. The <code>pipeline</code> sends all four commands in one network round trip.</p>
  <table class="tbl">
    <tr><th>Algorithm</th><th>Idea</th><th>Pro</th><th>Con</th></tr>
    <tr><td>Fixed window</td><td>Counter per clock minute</td><td>Tiny: one <code>INCR</code></td><td>2× burst across a boundary</td></tr>
    <tr><td>Sliding window log</td><td>Timestamps in a sorted set</td><td>Exact</td><td>Memory per request</td></tr>
    <tr><td>Sliding window counter</td><td>Weighted mix of two fixed windows</td><td>Cheap, near-exact</td><td>Approximate</td></tr>
    <tr><td>Token bucket</td><td>Tokens refill at rate r, cap b</td><td>Allows bursts, smooth average</td><td>Two values to tune</td></tr>
    <tr><td>Leaky bucket</td><td>Queue drains at fixed rate</td><td>Perfectly smooth output</td><td>Adds queueing delay</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span><p><strong>Rate limiting</strong>: capping how many requests a client (IP, API key, user) may make per time window. <strong>Throttling</strong> is often used for the same idea, sometimes meaning "slow down" instead of "reject". Answer with <strong>429</strong> and <code>Retry-After</code>.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>An in-memory limiter (like the <code>TokenBucket</code> class) gives each of 4 workers × 3 servers its own count, so the real limit becomes 12×. Keep counters in Redis. This sliding-window variant also counts rejected calls, which deliberately penalises clients that keep hammering. Rate limiting appears in system-design interviews as "design a rate limiter": know these algorithms and where they live (edge + app).</p></div>

  <h2 id="ap-obs"><span class="num">05</span>Logging &amp; Monitoring</h2>
  <p>A customer emails at 10 AM: "your API was slow and gave me an error around 3 AM". With only <code>print</code> statements scattered across three servers, you cannot find that request, cannot say how many others were hit, and cannot tell if it is still happening. You need two kinds of record. <strong>Logs</strong> are a diary of individual events: "request X, path /predict, 500, 2300 ms". <strong>Metrics</strong> are numbers summed over time: "requests per second", "share of 5xx", "95th-percentile latency". Logs answer "what happened to this request?"; metrics answer "how is the whole system doing right now?".</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A car. The dashboard (metrics) shows speed, fuel and engine temperature at a glance, and a warning light comes on when something crosses a line (alert). The service record book (logs) lists each visit in detail, so when the light comes on, the mechanic can look up exactly what happened.</p></div>
  <p>What to measure? Google's SRE book names the <strong>four golden signals</strong>: <strong>latency</strong> (how long requests take), <strong>traffic</strong> (requests per second), <strong>errors</strong> (rate of failed requests), and <strong>saturation</strong> (how full the system is: CPU, memory, GPU, queue length). For ML add: the distribution of predictions, input feature drift, the share of null features, and the model version served.</p>
  <h3>Why percentiles, not the average</h3>
  <p>Latency must be described with <strong>percentiles</strong>. The p95 is the value that 95% of requests are faster than. A tiny example with 20 requests, two of which were slow:</p>
  <div class="fx" data-lang="py">import statistics

# latency of 20 requests in ms: most are fast, two hit a cold cache / slow DB
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
  <p>The mean, 247 ms, describes nobody: 18 users saw about 40 ms and 2 saw about 2 seconds. The p50 (median) shows the typical user; p95/p99 show the unhappy tail. Alert on p95 or p99.</p>
  <h3>A FastAPI app with JSON logs, metrics and health endpoints</h3>
  <p>The app below writes one JSON log line per request and exports Prometheus metrics. A <strong>middleware</strong> is a function that wraps every request, so timing and logging live in one place. <strong>Prometheus</strong> is a monitoring server that visits <code>/metrics</code> on every copy every few seconds ("scrapes" it) and stores the numbers; Grafana draws graphs from them.</p>
  <div class="fx" data-lang="py">import json, logging, os, sys, time, uuid
import redis
from fastapi import FastAPI, Request, Response
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

# ---------- structured (JSON) logging ----------
class JsonFormatter(logging.Formatter):
    def format(self, rec):
        return json.dumps({"ts": round(rec.created, 3), "level": rec.levelname,
                           "msg": rec.getMessage(), **getattr(rec, "extra_fields", {})})

handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(JsonFormatter())
log = logging.getLogger("api")
log.addHandler(handler)
log.setLevel(logging.INFO)

# ---------- metrics ----------
REQS = Counter("http_requests_total", "Requests", ["path", "status"])
LAT = Histogram("http_request_seconds", "Latency", ["path"], buckets=(0.01, 0.05, 0.1, 0.5, 1))

INSTANCE = os.environ.get("INSTANCE", "api-?")
cache = redis.Redis(port=6380, socket_timeout=0.2)
app = FastAPI()
MODEL = {"version": "churn_v3", "w": 1.0}       # loaded once per worker at startup

@app.middleware("http")
async def observe(request: Request, call_next):
    rid = request.headers.get("X-Request-ID") or uuid.uuid4().hex[:8]
    t0 = time.perf_counter()
    response = await call_next(request)
    dt = time.perf_counter() - t0
    if request.url.path != "/metrics":
        REQS.labels(request.url.path, response.status_code).inc()
        LAT.labels(request.url.path).observe(dt)
        log.info("request", extra={"extra_fields": {
            "request_id": rid, "method": request.method, "path": request.url.path,
            "status": response.status_code, "ms": round(dt * 1000, 1),
            "instance": INSTANCE, "pid": os.getpid()}})
    response.headers["X-Request-ID"] = rid
    return response

@app.get("/predict")
def predict(x: float):
    score = 1 / (1 + 2.718 ** (-MODEL["w"] * x))
    return {"score": round(score, 3), "served_by": INSTANCE, "pid": os.getpid()}

@app.get("/health")                              # liveness: is this process alive?
def health():
    return {"status": "alive"}

@app.get("/ready")                               # readiness: can it serve real traffic?
def ready(response: Response):
    checks = {"model_loaded": MODEL is not None}
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
  <p>Running behind nginx (section 06), each request printed one line like these on <code>api-1</code>'s stdout:</p>
  <div class="fx" data-lang="text">{"ts": 1792384008.602, "level": "INFO", "msg": "request", "request_id": "35c73aff258b400c8d71f26ea0a9c33d", "method": "GET", "path": "/predict", "status": 200, "ms": 0.8, "instance": "api-1", "pid": 28199}
{"ts": 1792384008.629, "level": "INFO", "msg": "request", "request_id": "c1fc7497eae8ade136c66fd5833adcf2", "method": "GET", "path": "/predict", "status": 200, "ms": 0.6, "instance": "api-1", "pid": 28199}</div>
  <div class="fx" data-lang="text">$ curl localhost:9001/metrics | grep predict
http_requests_total{path="/predict",status="200"} 1.0
http_requests_created{path="/predict",status="200"} 1.7923840085117784e+09
http_request_seconds_bucket{le="0.01",path="/predict"} 1.0
http_request_seconds_bucket{le="0.05",path="/predict"} 1.0
http_request_seconds_bucket{le="0.1",path="/predict"} 1.0
http_request_seconds_bucket{le="0.5",path="/predict"} 1.0
http_request_seconds_bucket{le="1.0",path="/predict"} 1.0
http_request_seconds_bucket{le="+Inf",path="/predict"} 1.0
http_request_seconds_count{path="/predict"} 1.0
http_request_seconds_sum{path="/predict"} 0.003070058000048448
http_request_seconds_created{path="/predict"} 1.792384008511807e+09</div>
  <p>Each log line is a JSON object, so a log system (Loki, ELK, Cloud Logging) can filter on <code>status=500 AND path="/predict"</code> or pull every line for one <code>request_id</code>. The 32-character ids came from nginx's <code>$request_id</code>, passed in the <code>X-Request-ID</code> header, so the same id appears in nginx's and the app's logs. In the metrics, <code>REQS</code> is a <strong>counter</strong> (only goes up) and <code>LAT</code> is a <strong>histogram</strong>: it counts how many requests fell under each bucket limit (10 ms, 50 ms…). From those counts Prometheus estimates p95 with <code>histogram_quantile(0.95, rate(http_request_seconds_bucket[5m]))</code>.</p>
  <div class="callout trap"><span class="label">Trap: seen above</span><p>The counter says 1 (the <code>_created</code> lines are just timestamps), but <code>api-1</code> had served about 8 predictions by then. Three scrapes in a row returned <code>7.0</code>, <code>7.0</code>, <code>1.0</code>. Each gunicorn worker is a separate process with its own counters, and <code>/metrics</code> is answered by whichever worker gets the request. Use <code>prometheus_client</code>'s multiprocess mode (<code>PROMETHEUS_MULTIPROC_DIR</code>) or one exporter per worker.</p></div>
  <div class="callout def"><span class="label">Definition</span><p><strong>Structured logging</strong>: logs as machine-readable records (usually JSON) with named fields. <strong>Observability</strong>: being able to explain the system's behaviour from its logs, metrics and traces. <strong>SLO</strong> (service level objective): a target such as "99% of requests under 300 ms over 30 days".</p></div>
  <div class="callout intu"><span class="label">Alerting rule</span><p>Page a human on symptoms users feel (error rate &gt; 1% for 5 min, p99 above the SLO), not on causes (CPU at 80%). Never log raw PII, passwords, tokens or full feature vectors with personal data.</p></div>

  <h2 id="ap-srv"><span class="num">06</span>Workers &amp; nginx</h2>
  <p><code>uvicorn app:app</code> starts a single Python process. Python runs one thread of Python code at a time per process (the <strong>GIL</strong>, global interpreter lock), so a CPU-heavy prediction blocks everything else in that process. If the process crashes, the service is down until someone restarts it. And it is exposed straight to the internet with no TLS, no limits and no protection from slow clients.</p>
  <p>Production splits this into layers. <strong>gunicorn</strong> is a <strong>process manager</strong>: it starts N copies (workers) of your app on one machine, spreads connections across them, and restarts any worker that dies. Each worker is a <code>UvicornWorker</code>, i.e. an async uvicorn event loop running FastAPI. In front of one or more such machines sits <strong>nginx</strong>, a <strong>reverse proxy</strong>: it terminates TLS, balances load across servers, applies rate and size limits, sets timeouts, and buffers slow clients so your Python workers are not tied up waiting on a slow mobile network.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>nginx is the restaurant host: greets everyone at the door, checks the reservation, turns away the gate-crashers, seats each party at a free table, and stops seating at a table whose waiter went home. gunicorn is the floor manager in each hall, who calls in a replacement the moment a waiter faints.</p></div>
  <table class="tbl">
    <tr><th>Layer</th><th>Job</th><th>Example</th></tr>
    <tr><td>Process manager</td><td>Starts N workers, restarts crashed ones, graceful reloads</td><td><code>gunicorn -w 4</code></td></tr>
    <tr><td>Worker</td><td>Runs the app: sync (WSGI) or event loop (ASGI)</td><td><code>-k uvicorn_worker.UvicornWorker</code></td></tr>
    <tr><td>Reverse proxy</td><td>TLS, load balancing, buffering slow clients, timeouts, limits</td><td>nginx, Envoy, cloud LB</td></tr>
  </table>
  <p>We started two "servers" (two gunicorn instances with 2 workers each, on ports 9001 and 9002) and nginx in front on port 8088:</p>
  <div class="fx" data-lang="text">$ INSTANCE=api-1 gunicorn prod_app:app -k uvicorn_worker.UvicornWorker -w 2 -b 127.0.0.1:9001
$ INSTANCE=api-2 gunicorn prod_app:app -k uvicorn_worker.UvicornWorker -w 2 -b 127.0.0.1:9002
$ nginx -c nginx.conf</div>
  <div class="fx" data-lang="text">http {   # abridged: the parts that matter
  upstream ml_api {                      # the pool of identical, stateless app servers
    server 127.0.0.1:9001 max_fails=1 fail_timeout=10s;
    server 127.0.0.1:9002 max_fails=1 fail_timeout=10s;
  }
  limit_req_zone $binary_remote_addr zone=perip:10m rate=5r/s;   # coarse per-IP limit
  server {
    listen 8088;
    location / {
      limit_req zone=perip burst=10 nodelay;
      limit_req_status 429;
      client_max_body_size 1m;                            # reject giant uploads at the door
      proxy_pass http://ml_api;
      proxy_set_header Host $host;
      proxy_set_header X-Request-ID $request_id;          # trace id generated at the edge
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_connect_timeout 2s;
      proxy_read_timeout 10s;
      proxy_next_upstream error timeout;                 # try the other server on failure
    }
  }
}</div>
  <p><code>upstream ml_api</code> lists the servers; nginx takes turns between them (<strong>round robin</strong>). <code>limit_req_zone</code> is a token-bucket-style limit of 5 requests/s per client IP, and <code>burst=10 nodelay</code> lets a burst of 10 extra through at once. <code>proxy_next_upstream</code> says: if a server refuses the connection or times out, retry on another one. Three experiments:</p>
  <div class="fx" data-lang="text">$ for i in 1 2 3 4; do curl -s "localhost:8088/predict?x=1"; echo; done
{"score":0.731,"served_by":"api-1","pid":28199}
{"score":0.731,"served_by":"api-2","pid":28198}
{"score":0.731,"served_by":"api-1","pid":28199}
{"score":0.731,"served_by":"api-2","pid":28198}

$ for i in $(seq 30); do curl -s -o /dev/null -w '%{http_code}&#92;n' "localhost:8088/predict?x=1"; done | sort | uniq -c
     12 200
     18 429

$ kill api-2 ; for i in 1 2 3 4; do curl -s -w " [%{http_code}]" "localhost:8088/predict?x=1"; echo; done
{"score":0.731,"served_by":"api-1","pid":28199} [200]
{"score":0.731,"served_by":"api-1","pid":28199} [200]
{"score":0.731,"served_by":"api-1","pid":28197} [200]
{"score":0.731,"served_by":"api-1","pid":28199} [200]
# nginx error log:
[error] 28238#28238: *53 connect() failed (111: Connection refused) while connecting to upstream, client: 127.0.0.1, server: , request: "GET /predict?x=1 HTTP/1.1", upstream: "http://127.0.0.1:9002/predict?x=1", host: "localhost:8088"</div>
  <ul>
    <li><strong>Round robin</strong>: replies alternate <code>api-1</code> / <code>api-2</code>. A different <code>pid</code> means a different gunicorn worker.</li>
    <li><strong>Burst of 30</strong>: 1 + <code>burst=10</code> pass instantly, plus one more as a token refilled during the loop = 12; the other 18 get 429 without touching Python.</li>
    <li><strong>Failover</strong>: with <code>api-2</code> dead, nginx logged the refused connection, retried on <code>api-1</code>, and every client still got 200.</li>
  </ul>
  <p>And gunicorn's own safety net. We killed one worker with <code>kill -9</code> (as the Linux out-of-memory killer would):</p>
  <div class="fx" data-lang="text">[28192] [INFO] Booting worker with pid: 28197
[28192] [INFO] Booting worker with pid: 28199
[28192] [ERROR] Worker (pid:28197) was sent SIGKILL! Perhaps out of memory?
[28192] [INFO] Booting worker with pid: 28605</div>
  <p>The master process (pid 28192) noticed within a second and booted a replacement, 28605. Nobody was paged.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>WSGI / ASGI</strong>: the Python standards for how a server calls a sync (Flask) or async (FastAPI) app. <strong>Worker</strong>: one OS process running your app. <strong>Upstream</strong>: in nginx, the group of backend servers it forwards to.</p></div>
  <div class="callout trap"><span class="label">Trap: workers × model size</span><p>Each worker process loads its own model. A 3 GB model × 8 workers = 24 GB RAM. For big models: fewer workers, a dedicated model server (Triton, TorchServe, vLLM), or <code>--preload</code> to share read-only memory via fork. Start with workers ≈ CPU cores for CPU-bound ML (the classic <code>2×cores+1</code> is for sync, I/O-bound apps), then load-test.</p></div>

  <h2 id="ap-scale"><span class="num">07</span>Health &amp; Scaling</h2>
  <p>Kubernetes (or any orchestrator) runs your containers and must decide two things about each one, all the time: "is it broken, should I restart it?" and "should I send it traffic right now?". A container that just started may be alive but still downloading a 2 GB model. A container whose Redis connection dropped is alive but cannot serve. If the orchestrator cannot tell these apart, it either sends traffic to copies that fail, or restarts healthy copies for no reason.</p>
  <p>So the app answers two different questions on two endpoints. <strong>Liveness</strong> (<code>/health</code>): "is this process alive at all?" It must be cheap and must not check dependencies. If it fails, restart. <strong>Readiness</strong> (<code>/ready</code>): "can I do useful work right now?" It checks the model and Redis. If it fails, stop routing traffic here, but do not restart. Our app from section 05 has both. Here is what happened when we stopped Redis and started it again:</p>
  <div class="fx" data-lang="text">$ redis-cli -p 6380 shutdown nosave
$ curl -w ' %{http_code}' localhost:9001/health   →  {"status":"alive"} 200
$ curl -w ' %{http_code}' localhost:9001/ready    →  {"model_loaded":true,"redis":false} 503
$ redis-server --port 6380 --daemonize yes
$ curl -w ' %{http_code}' localhost:9001/ready    →  {"model_loaded":true,"redis":true} 200</div>
  <p>While Redis was down, <code>/health</code> stayed 200 (no pointless restart) and <code>/ready</code> returned 503, so a load balancer would take this copy out of rotation. The <code>socket_timeout=0.2</code> on the Redis client keeps the probe fast even when Redis hangs.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A shop. Liveness: is the shopkeeper breathing? If not, call an ambulance. Readiness: is the shutter up and is there stock? If not, customers should go to the next shop, but nobody calls an ambulance.</p></div>
  <table class="tbl">
    <tr><th>Probe</th><th>Question</th><th>On failure</th><th>Checks</th></tr>
    <tr><td>Liveness <code>/health</code></td><td>Is the process stuck or dead?</td><td>Restart it</td><td>Cheap; no dependencies</td></tr>
    <tr><td>Readiness <code>/ready</code></td><td>Can it serve right now?</td><td>Stop routing traffic to it</td><td>Model loaded, DB/Redis reachable</td></tr>
    <tr><td>Startup</td><td>Has slow init finished?</td><td>Wait before other probes</td><td>Large model download</td></tr>
  </table>
  <h3>Scaling up vs scaling out</h3>
  <p>When traffic grows you have two choices. <strong>Vertical scaling</strong>: a bigger machine (more CPU, RAM, a larger GPU). Simple, but it has a ceiling, costs rise steeply, and it is still one point of failure. <strong>Horizontal scaling</strong>: more identical copies behind the load balancer, as in our nginx test. Nearly unlimited, and it survives failures, but only if the copies are <strong>stateless</strong>. Anything kept in one copy's memory breaks it:</p>
  <table class="tbl">
    <tr><th>Stateful (breaks scaling)</th><th>Stateless fix</th></tr>
    <tr><td>Sessions in a Python dict</td><td>JWT or sessions in Redis</td></tr>
    <tr><td>Uploads saved to local disk</td><td>Object storage (S3)</td></tr>
    <tr><td>In-memory cache / rate limit</td><td>Redis</td></tr>
    <tr><td>Cron job inside the API process</td><td>Celery beat / a scheduler service</td></tr>
  </table>
  <p>An <strong>autoscaler</strong> then adds or removes copies automatically: on CPU above 70%, on p95 latency, or for Celery workers on queue length. Read-only state (the model file baked into the image) is fine; shared, changing state must live outside.</p>
  <div class="callout def"><span class="label">Definition</span><p><strong>Liveness probe</strong>: a check whose failure means restart. <strong>Readiness probe</strong>: a check whose failure means remove from the load balancer. <strong>Horizontal scaling</strong>: adding more instances; <strong>vertical scaling</strong>: making one instance bigger.</p></div>
  <div class="callout intu"><span class="label">Key insight</span><p>Stateless copies are cattle, not pets: autoscalers add them on high load and kill them freely. If killing any one copy at random would lose data or log users out, the design is not ready to scale.</p></div>
  <h3>Hands-on</h3>
  <ol>
    <li>Wrap the FastAPI iris <code>/predict</code> with the Redis cache (key = hash of features + model version). Measure hit vs miss.</li>
    <li>Add <code>POST /jobs/score</code> returning 202 + a Celery task id, and <code>GET /jobs/{id}</code> returning its state.</li>
    <li>Run two copies behind the nginx config above, kill one, and confirm zero failed requests.</li>
  </ol>

  <h2 id="ap-traps"><span class="num">08</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: per-process state</span><p>Caches, rate-limit counters, sessions or metrics in a Python dict. With 4 workers × 3 servers you get 12 different copies. Shared state goes in Redis; metrics need multiprocess mode.</p></div>
  <div class="callout trap"><span class="label">Trap: cache without TTL or invalidation</span><p>Stale predictions forever and memory that only grows. Always set <code>ex=</code>, delete on writes, version the key with the model.</p></div>
  <div class="callout trap"><span class="label">Trap: stampede on hot keys</span><p>A hot key expiring sends every concurrent request to the DB (we measured 50 queries instead of 1). Use a <code>SET NX</code> lock, TTL jitter or early refresh.</p></div>
  <div class="callout trap"><span class="label">Trap: slow work inside the request</span><p>Minutes-long scoring in an endpoint hits proxy timeouts and is lost on restart. Queue it, return 202 + job id.</p></div>
  <div class="callout trap"><span class="label">Trap: non-idempotent tasks</span><p>With retries and <code>acks_late</code>, a task can run twice. "Append rows" doubles data; "write file named by job id" does not.</p></div>
  <div class="callout trap"><span class="label">Trap: alerting on the mean</span><p>A mean of 247 ms hid a p99 of 2.3 s. Watch p95/p99 and error rate.</p></div>
  <div class="callout trap"><span class="label">Trap: dependencies in liveness</span><p>If <code>/health</code> checks the DB, a DB blip makes the orchestrator restart every pod at once. Dependency checks belong in <code>/ready</code>.</p></div>
  <div class="callout trap"><span class="label">Trap: too many workers for the model</span><p>Each worker holds its own model copy; 8 × 3 GB = 24 GB. Size workers by memory as well as cores.</p></div>

  <h2 id="ap-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through the architecture of a production ML prediction API.</summary><div class="qa-body">Clients → load balancer/nginx (TLS, rate limits) → N stateless API containers (gunicorn + uvicorn workers, model loaded at startup) → Redis for cached features/predictions, Postgres for app data, model artifacts from a registry/S3. Heavy jobs go via a broker to Celery workers. Every copy exposes /health, /ready and /metrics; logs are JSON with request ids; Prometheus + alerts on golden signals and prediction drift.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain cache-aside. What are its failure modes?</summary><div class="qa-body">Read cache; on miss read the DB, write the value to cache with a TTL, return it. Failure modes: stale data until TTL or invalidation; stampede when a hot key expires; inconsistency if the DB update succeeds but the cache delete fails (short TTLs bound it).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a cache stampede and how do you prevent it?</summary><div class="qa-body">A popular key expires and many concurrent requests miss at once, all hitting the source. Prevent with a lock so one request refills (<code>SET lock NX EX 10</code>, others wait and re-read), random jitter on TTLs, or refreshing hot keys before expiry. In our test: 50 DB queries without the lock, 1 with it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use Celery instead of doing the work in the request?</summary><div class="qa-body">Slow work holds a worker and the client's connection, hits proxy timeouts (often 30–60 s), and is lost if the process restarts. A queue returns 202 immediately, runs work on separately scaled workers, retries failures and keeps status.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name Celery's three components and what each does.</summary><div class="qa-body">Broker: holds queued task messages (Redis, RabbitMQ). Worker: process that pulls and executes tasks. Result backend: stores task state and return values (Redis, DB). Producers (your API) only talk to the broker.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>acks_late</code> change, and what does it require of your tasks?</summary><div class="qa-body">The worker acknowledges the message only after the task finishes, so if the worker dies mid-task, the broker redelivers it. The price: a task may run more than once, so tasks must be idempotent.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Token bucket with capacity 5 and refill 1/s: 8 requests at once, then 3 more after 2 s. What's the output?</summary><div class="qa-body">First burst: 5 allowed, 3 rejected (bucket empty). After 2 s, 2 tokens have refilled: 2 allowed, 1 rejected. Measured: <code>ok×5, 429×3</code> then <code>ok, ok, 429</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the weakness of a fixed-window rate limiter?</summary><div class="qa-body">Bursts at the boundary: N requests at the end of one window and N at the start of the next all pass, 2N in a moment. Our run: limit 5/min, requests at 59.5 s and 60.2 s → fixed window allowed 10, sliding window allowed 5.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the four golden signals? What would you add for an ML service?</summary><div class="qa-body">Latency, traffic, errors, saturation. For ML: prediction distribution and drift vs training, input feature drift and null rates, model version, and (when labels arrive) live accuracy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why alert on p99 latency rather than average latency?</summary><div class="qa-body">The average mixes many fast requests with a few very slow ones and describes neither. In our example the mean was 247 ms while 90% of users saw ~40 ms and the slowest saw 2.3 s. p95/p99 show the tail that unhappy users actually experience.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why structured (JSON) logs rather than print statements?</summary><div class="qa-body">Log systems (ELK, Loki, Cloud Logging) can index and filter fields: <code>status=500 AND path=/predict</code>, or every line for one <code>request_id</code>. Free text needs fragile regexes. Include level, timestamp, request id, latency, status and model version.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many gunicorn workers should you run?</summary><div class="qa-body">Start near the CPU core count for async/CPU-bound ML (the classic <code>2×cores+1</code> is for sync, I/O-bound apps). Then cap by memory: each worker holds a model copy. Load-test and watch latency and saturation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does nginx add in front of gunicorn?</summary><div class="qa-body">TLS termination, load balancing and failover across instances, buffering slow clients so workers aren't tied up, timeouts, request size and rate limits, gzip, static files, and a single entry point that adds request ids.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your API scaled from 1 to 4 instances and users get logged out randomly. Why?</summary><div class="qa-body">Sessions are stored in memory on one instance; the load balancer sends the next request to another one that doesn't know the session. Move sessions to Redis or use JWTs. Sticky sessions are only a workaround.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Liveness vs readiness: what goes wrong if /health checks the database?</summary><div class="qa-body">A brief DB outage fails liveness on every pod, so the orchestrator restarts them all, adding a restart storm on top of the outage. Dependency checks belong in readiness (stop traffic), not liveness (restart).</div></details>
</main>
`
});
