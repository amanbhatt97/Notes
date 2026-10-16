// notes/apis/api_production.js — Production Backend
Object.assign(TOPIC_CONTENT, {
  "api_production": `<main>
  <h1>Production Backend</h1>
  <p class="lead">A <code>/predict</code> endpoint that works on your laptop is 20% of the job. The rest is making it fast (caching), keeping slow work off the request path (queues), protecting it (rate limits), seeing inside it (logs, metrics) and running many copies of it (workers, nginx, scaling). Everything here was run locally: real Redis 7, a real Celery worker, gunicorn and nginx. Builds on <em>FastAPI</em>.</p>

  <h2 id="ap-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Production ML Backend</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Architecture</div>
        <ul>
          <li><b>Path</b> — client → LB/nginx (TLS) → N stateless API pods → cache / DB / model</li>
          <li><b>Slow work</b> — API → broker → Celery workers → results store</li>
          <li><b>Observability</b> — JSON logs + Prometheus metrics + traces (request id)</li>
          <li><b>State lives outside</b> the API: Redis, Postgres, S3</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Caching</div>
        <ul>
          <li><b>Cache-aside</b> — read cache → miss → DB → store with TTL (most common)</li>
          <li><b>Write-through</b> — write cache + DB together; <b>write-behind</b> — cache first, DB later</li>
          <li><b>TTL</b> — auto-expiry; bounds staleness (<code>SET k v EX 300</code>)</li>
          <li><b>Invalidation</b> — delete key on update; version keys (<code>features:v1:42</code>)</li>
          <li><b>Measured</b> — 501 ms miss → 0.3 ms hit</li>
          <li>⚠ <b>Stampede</b> — hot key expires, 1000 requests hit DB; fix: lock, jittered TTL</li>
          <li>💡 like keeping today's files on your desk, not in the archive</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Task queues (Celery)</div>
        <ul>
          <li><b>Why</b> — slow work (batch scoring, retraining, emails) off the request path</li>
          <li><b>Broker</b> — queue of task messages (Redis, RabbitMQ)</li>
          <li><b>Worker</b> — separate process that runs tasks</li>
          <li><b>Result backend</b> — stores state/result: PENDING → STARTED → SUCCESS/FAILURE</li>
          <li><b>API pattern</b> — <code>POST</code> → 202 + job id → client polls <code>GET /jobs/{id}</code></li>
          <li><b>Reliability</b> — retries, <code>acks_late</code>, idempotent tasks</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Rate limiting</div>
        <ul>
          <li><b>Fixed window</b> — N per clock minute; ⚠ 2N burst at the boundary</li>
          <li><b>Sliding window</b> — count in the last T seconds (Redis sorted set)</li>
          <li><b>Token bucket</b> — capacity = burst, refill rate = sustained speed</li>
          <li><b>Leaky bucket</b> — queue drains at a fixed rate; smooth output</li>
          <li><b>Where</b> — edge (nginx/gateway) per IP + app per API key; shared store (Redis)</li>
          <li>Return <b>429 + Retry-After</b></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Logging &amp; Monitoring</div>
        <ul>
          <li><b>Structured logs</b> — one JSON object per event; searchable fields</li>
          <li><b>Request id</b> — generated at edge, logged by every service</li>
          <li><b>Golden signals</b> — latency, traffic, errors, saturation</li>
          <li><b>Percentiles</b> — alert on p95/p99, not average</li>
          <li><b>ML signals</b> — prediction distribution drift, null features, model version</li>
          <li><b>Alerts</b> — on user-visible symptoms (SLO burn), not on every CPU blip</li>
          <li>⚠ Prometheus counters are per process → multiprocess mode with gunicorn</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Servers &amp; Proxy</div>
        <ul>
          <li><b>gunicorn</b> — process manager; restarts dead workers</li>
          <li><b>UvicornWorker</b> — each worker runs an async event loop</li>
          <li><b>Workers</b> — ≈ CPU cores (2×cores+1 for sync I/O apps); each loads its own model</li>
          <li><b>nginx</b> — TLS, load balancing, buffering, timeouts, limits, static files</li>
          <li><b>proxy_next_upstream</b> — retry another server when one is down</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Health &amp; Scaling</div>
        <ul>
          <li><b>Liveness</b> — process alive? fail → restart</li>
          <li><b>Readiness</b> — can serve (model loaded, DB up)? fail → no traffic</li>
          <li><b>Vertical</b> — bigger machine; <b>horizontal</b> — more copies behind LB</li>
          <li><b>Stateless</b> — no sessions/files in memory → any copy serves any request</li>
          <li><b>Autoscale</b> — on CPU, latency or queue length</li>
          <li>⚠ In-memory caches/limits diverge across copies → use Redis</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ap-arch"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Big Picture</span><span class="rm-sub">A production ML API end to end</span></div></div>
      <div class="rm-item rm-done" data-target="ap-cache"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Caching with Redis</span><span class="rm-sub">Cache-aside, TTL, invalidation</span></div></div>
      <div class="rm-item rm-done" data-target="ap-celery"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Task Queues: Celery</span><span class="rm-sub">Broker, worker, result backend</span></div></div>
      <div class="rm-item rm-done" data-target="ap-rl"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Rate Limiting</span><span class="rm-sub">Token bucket, sliding window</span></div></div>
      <div class="rm-item rm-done" data-target="ap-obs"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Logging &amp; Monitoring</span><span class="rm-sub">JSON logs, four golden signals</span></div></div>
      <div class="rm-item rm-done" data-target="ap-srv"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Workers &amp; nginx</span><span class="rm-sub">gunicorn, uvicorn, reverse proxy</span></div></div>
      <div class="rm-item rm-done" data-target="ap-scale"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Health &amp; Scaling</span><span class="rm-sub">Readiness, statelessness</span></div></div>
      <div class="rm-item rm-done" data-target="ap-qa"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="ap-arch"><span class="num">01</span>The Big Picture</h2>
  <figure class="viz"><svg viewBox="0 0 640 300" width="640">
    <defs><marker id="ap-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="5" y="115" width="80" height="44" rx="6" class="fs"/><text x="45" y="141" text-anchor="middle">Clients</text>
    <rect x="110" y="105" width="110" height="64" rx="6" class="ft st"/><text x="165" y="130" text-anchor="middle">nginx / LB</text><text x="165" y="148" text-anchor="middle" font-size="11" class="tm">TLS, limits</text>
    <rect x="250" y="40" width="140" height="44" rx="6" class="fb sb"/><text x="320" y="60" text-anchor="middle">API copy 1</text><text x="320" y="76" text-anchor="middle" font-size="10" class="tm">gunicorn × uvicorn</text>
    <rect x="250" y="115" width="140" height="44" rx="6" class="fb sb"/><text x="320" y="135" text-anchor="middle">API copy 2</text><text x="320" y="151" text-anchor="middle" font-size="10" class="tm">model in RAM</text>
    <rect x="250" y="190" width="140" height="44" rx="6" class="fb sb"/><text x="320" y="216" text-anchor="middle">API copy N</text>
    <rect x="430" y="10" width="95" height="40" rx="6" class="fr sr"/><text x="477" y="35" text-anchor="middle">Redis cache</text>
    <rect x="430" y="70" width="95" height="40" rx="6" class="fg sg"/><text x="477" y="95" text-anchor="middle">Postgres</text>
    <rect x="430" y="140" width="95" height="40" rx="6" class="fr sr"/><text x="477" y="165" text-anchor="middle">Broker</text>
    <rect x="545" y="140" width="90" height="40" rx="6" class="fv"/><text x="590" y="165" text-anchor="middle">Celery</text>
    <rect x="545" y="70" width="90" height="40" rx="6" class="fs"/><text x="590" y="88" text-anchor="middle">S3 / model</text><text x="590" y="102" text-anchor="middle" font-size="10">registry</text>
    <rect x="250" y="255" width="385" height="36" rx="6" class="fs"/><text x="442" y="278" text-anchor="middle">Prometheus metrics · JSON logs · alerts (scrape every copy)</text>
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
  <div class="flow"><span>Request</span><span>nginx: TLS, rate limit, pick a copy</span><span>API: validate, cache lookup</span><span>Model predict (or queue a job)</span><span>Log + metrics</span><span>Response</span></div>
  <p>Each section below is one box in this picture.</p>

  <h2 id="ap-cache"><span class="num">02</span>Caching with Redis</h2>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <defs><marker id="ap-ar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="50" width="100" height="44" rx="6" class="fb sb"/><text x="60" y="77" text-anchor="middle">API</text>
    <rect x="250" y="5" width="110" height="44" rx="6" class="fr sr"/><text x="305" y="32" text-anchor="middle">Redis</text>
    <rect x="250" y="100" width="110" height="44" rx="6" class="fg sg"/><text x="305" y="127" text-anchor="middle">DB (slow)</text>
    <line x1="110" y1="62" x2="248" y2="30" stroke="currentColor" marker-end="url(#ap-ar2)"/><text x="170" y="36" font-size="11">1 GET key</text>
    <text x="380" y="25" font-size="11" class="tg">hit → return (0.3 ms)</text>
    <line x1="110" y1="84" x2="248" y2="120" stroke="currentColor" marker-end="url(#ap-ar2)"/><text x="130" y="118" font-size="11">2 miss → query</text>
    <path d="M360,122 C470,122 470,30 362,30" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#ap-ar2)"/><text x="455" y="80" font-size="11">3 SET key EX ttl</text>
  </svg><figcaption>Cache-aside: the app checks the cache first and fills it only on a miss.</figcaption></figure>
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

print("TTL left:", r.ttl("features:v1:1"), "s")

# invalidation: the customer placed an order -&gt; delete, next read refills
r.delete("features:v1:1")
t = time.perf_counter(); get_features(1)
print(f"after invalidation: {(time.perf_counter() - t) * 1000:.1f} ms")</div>
  <div class="fx" data-lang="text">call 1:   501.1 ms
call 2:     0.3 ms
call 3:     0.1 ms
TTL left: 300 s
after invalidation: 500.9 ms</div>
  <table class="tbl">
    <tr><th>Strategy</th><th>How</th><th>Good for</th></tr>
    <tr><td><strong>Cache-aside</strong></td><td>App reads cache, fills on miss (above)</td><td>Most read-heavy APIs, feature lookups</td></tr>
    <tr><td>Write-through</td><td>Every write goes to cache and DB together</td><td>Data read right after writing</td></tr>
    <tr><td>Write-behind</td><td>Write to cache; flush to DB later</td><td>Write-heavy counters; risk of loss</td></tr>
  </table>
  <div class="cards">
    <div><b>TTL</b><p>Every key expires; bounds how stale data can get.</p></div>
    <div><b>Invalidate</b><p>Delete the key when the source changes; next read refills.</p></div>
    <div><b>Version keys</b><p><code>features:v1:…</code> → bump to v2 when the schema or model changes.</p></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span><p>Your desk vs the archive room. Keep what you use today on the desk (cache); clear it on a schedule (TTL) and when a file is updated (invalidation).</p></div>
  <div class="callout trap"><span class="label">Trap: cache stampede</span><p>A hot key expires and 1,000 concurrent requests all miss and hammer the DB. Fixes: a short lock so one request refills, random jitter on TTLs, or refreshing before expiry.</p></div>
  <p><strong>For ML:</strong> cache features, embeddings and predictions for repeated inputs (key = hash of input + model version). Don't cache when inputs rarely repeat; it's just memory spent.</p>

  <h2 id="ap-celery"><span class="num">03</span>Task Queues: Celery</h2>
  <figure class="viz"><svg viewBox="0 0 600 130" width="600">
    <defs><marker id="ap-ar3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="5" y="40" width="105" height="48" rx="6" class="fb sb"/><text x="57" y="61" text-anchor="middle">API</text><text x="57" y="78" text-anchor="middle" font-size="11">202 + job id</text>
    <rect x="160" y="40" width="120" height="48" rx="6" class="fr sr"/><text x="220" y="61" text-anchor="middle">Broker</text><text x="220" y="78" text-anchor="middle" font-size="11">Redis list / RabbitMQ</text>
    <rect x="330" y="40" width="110" height="48" rx="6" class="fv"/><text x="385" y="61" text-anchor="middle">Workers</text><text x="385" y="78" text-anchor="middle" font-size="11">N processes</text>
    <rect x="490" y="40" width="105" height="48" rx="6" class="fs"/><text x="542" y="61" text-anchor="middle">Result store</text><text x="542" y="78" text-anchor="middle" font-size="11">state + result</text>
    <line x1="110" y1="64" x2="158" y2="64" stroke="currentColor" marker-end="url(#ap-ar3)"/>
    <line x1="280" y1="64" x2="328" y2="64" stroke="currentColor" marker-end="url(#ap-ar3)"/>
    <line x1="440" y1="64" x2="488" y2="64" stroke="currentColor" marker-end="url(#ap-ar3)"/>
    <path d="M542,88 C542,125 57,125 57,90" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#ap-ar3)"/><text x="300" y="120" text-anchor="middle" font-size="11">client polls GET /jobs/{id}</text>
  </svg><figcaption>The request returns in milliseconds; the heavy work happens elsewhere.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span><p>A dry cleaner. You drop clothes at the counter, get a ticket (job id) and leave. Workers in the back do the slow part; you come back with the ticket.</p></div>
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
  <div class="fx" data-lang="py">import time
from tasks import score_batch

t0 = time.perf_counter()
job = score_batch.delay(1_000_000)                   # returns immediately
print(f"queued in {(time.perf_counter() - t0) * 1000:.0f} ms  id={job.id}")
while not job.ready():
    print(f"t={time.perf_counter() - t0:3.1f}s  state={job.state}")
    time.sleep(1)
print(f"t={time.perf_counter() - t0:3.1f}s  state={job.state}  result={job.get()}")</div>
  <div class="fx" data-lang="text">$ celery -A tasks worker --concurrency=2      # terminal 1 (Redis 7 as broker + backend)
$ python submit.py                            # terminal 2
queued in 117 ms  id=5252a33f-4cdf-4fd4-aa96-fb66ec6d15aa
t=0.1s  state=PENDING
t=1.1s  state=STARTED
t=2.1s  state=STARTED
t=3.1s  state=STARTED
t=4.1s  state=SUCCESS  result={'rows_scored': 1000000, 'file': 's3://preds/batch_5252a33f.parquet'}

# worker log
- *** --- * --- .&gt; concurrency: 2 (prefork)
Connected to redis://localhost:6380/1
celery@vm ready.
Task tasks.score_batch[5252a33f-4cdf-4fd4-aa96-fb66ec6d15aa] received
Task tasks.score_batch[5252a33f-4cdf-4fd4-aa96-fb66ec6d15aa] succeeded in 3.0094993239999894s: {'rows_scored': 1000000, 'file': 's3://preds/batch_5252a33f.parquet'}</div>
  <ul>
    <li><strong>Use it for</strong>: batch scoring, retraining, report generation, sending emails, calling flaky third-party APIs.</li>
    <li><strong>Make tasks idempotent</strong>: with retries and <code>acks_late</code>, a task can run twice.</li>
    <li><strong>Pass ids, not data</strong>: send <code>s3://…</code> paths, not a 200 MB DataFrame through the broker.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span><p>Unknown task ids also report <code>PENDING</code>: Celery can't tell "waiting" from "never existed". Store job ids yourself if that matters.</p></div>

  <h2 id="ap-rl"><span class="num">04</span>Rate Limiting</h2>
  <figure class="viz"><svg viewBox="0 0 600 140" width="600">
    <defs><marker id="ap-ar4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <text x="70" y="15" text-anchor="middle" font-size="12">refill 1 token/s</text>
    <line x1="70" y1="20" x2="70" y2="40" stroke="currentColor" marker-end="url(#ap-ar4)"/>
    <path d="M20,42 L20,125 L120,125 L120,42" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="45" cy="110" r="9" class="fg"/><circle cx="70" cy="110" r="9" class="fg"/><circle cx="95" cy="110" r="9" class="fg"/><circle cx="45" cy="88" r="9" class="fg"/><circle cx="70" cy="88" r="9" class="fg"/>
    <text x="70" y="62" text-anchor="middle" font-size="11" class="tm">capacity 5</text>
    <text x="150" y="70" font-size="12">each request takes a token;</text>
    <text x="150" y="88" font-size="12">empty bucket → <tspan class="tr">429</tspan></text>
    <rect x="360" y="40" width="230" height="24" class="fs"/><text x="475" y="57" text-anchor="middle" font-size="11">sliding window: last 1 s</text>
    <line x1="360" y1="100" x2="590" y2="100" stroke="currentColor"/>
    <circle cx="380" cy="100" r="5" class="fs"/><circle cx="450" cy="100" r="5" class="fb"/><circle cx="500" cy="100" r="5" class="fb"/><circle cx="540" cy="100" r="5" class="fb"/><circle cx="575" cy="100" r="5" class="fr"/>
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
  <table class="tbl">
    <tr><th>Algorithm</th><th>Idea</th><th>Pro</th><th>Con</th></tr>
    <tr><td>Fixed window</td><td>Counter per clock minute</td><td>Tiny: one <code>INCR</code></td><td>2× burst across a boundary (end of :59 + start of :00)</td></tr>
    <tr><td>Sliding window log</td><td>Timestamps in a sorted set</td><td>Exact</td><td>Memory per request</td></tr>
    <tr><td>Sliding window counter</td><td>Weighted mix of two fixed windows</td><td>Cheap, near-exact</td><td>Approximate</td></tr>
    <tr><td>Token bucket</td><td>Tokens refill at rate r, cap b</td><td>Allows bursts, smooth average</td><td>Two values to tune</td></tr>
    <tr><td>Leaky bucket</td><td>Queue drains at fixed rate</td><td>Perfectly smooth output</td><td>Adds queueing delay</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span><p>An in-memory limiter (like the <code>TokenBucket</code> class) gives each of 4 workers × 3 servers its own count: the real limit becomes 12×. Keep counters in Redis. This sliding-window variant also counts rejected calls, which deliberately penalises clients that keep hammering.</p></div>

  <h2 id="ap-obs"><span class="num">05</span>Logging &amp; Monitoring</h2>
  <div class="cards">
    <div><b>Latency</b><p>How long requests take. Watch p95/p99, not the mean.</p></div>
    <div><b>Traffic</b><p>Requests per second.</p></div>
    <div><b>Errors</b><p>Rate of 5xx (and wrong answers).</p></div>
    <div><b>Saturation</b><p>How full: CPU, memory, GPU, queue length.</p></div>
  </div>
  <p>These are Google SRE's <strong>four golden signals</strong>. For ML, add: prediction distribution, input drift, share of null features, model version served.</p>
  <div class="fx" data-lang="py">import json, logging, os, sys, time, uuid
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
app = FastAPI()

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
    return {"score": round(1 / (1 + 2.718 ** -x), 3), "served_by": INSTANCE, "pid": os.getpid()}

@app.get("/health")

@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
# (+ /predict and /health endpoints)</div>
  <p>One JSON line per request (from <code>api-1</code>'s stdout, behind nginx):</p>
  <div class="fx" data-lang="text">{"ts": 1792132947.74, "level": "INFO", "msg": "request", "request_id": "3b0c8f0ed427a337ec22ada7e93a288d", "method": "GET", "path": "/predict", "status": 200, "ms": 2.2, "instance": "api-1", "pid": 3175}
{"ts": 1792132947.796, "level": "INFO", "msg": "request", "request_id": "b4680d916afd880406c155274c1bb392", "method": "GET", "path": "/predict", "status": 200, "ms": 2.2, "instance": "api-1", "pid": 3173}</div>
  <div class="fx" data-lang="text">$ curl localhost:9001/metrics | grep predict
http_requests_total{path="/predict",status="200"} 1.0
http_request_seconds_bucket{le="0.01",path="/predict"} 1.0
http_request_seconds_bucket{le="0.05",path="/predict"} 1.0
http_request_seconds_bucket{le="0.1",path="/predict"} 1.0
http_request_seconds_bucket{le="0.5",path="/predict"} 1.0
http_request_seconds_bucket{le="1.0",path="/predict"} 1.0
http_request_seconds_bucket{le="+Inf",path="/predict"} 1.0
http_request_seconds_count{path="/predict"} 1.0
http_request_seconds_sum{path="/predict"} 0.002233007000086218</div>
  <ul>
    <li><strong>Logs</strong> answer "what happened to request X?" Search by <code>request_id</code> across services.</li>
    <li><strong>Metrics</strong> answer "how is the system doing?" Prometheus scrapes <code>/metrics</code>; Grafana graphs; Alertmanager pages.</li>
    <li>Histogram buckets let Prometheus compute p95: <code>histogram_quantile(0.95, rate(http_request_seconds_bucket[5m]))</code>.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap: seen above</span><p>The count says 1, yet nginx had sent several requests to <code>api-1</code>. Each gunicorn worker is a separate process with its own counters, and <code>/metrics</code> was answered by just one. Use <code>prometheus_client</code>'s multiprocess mode (<code>PROMETHEUS_MULTIPROC_DIR</code>) or one exporter per worker.</p></div>
  <div class="callout intu"><span class="label">Alerting rule</span><p>Page on symptoms users feel (error rate &gt; 1% for 5 min, p99 &gt; SLO), not on causes (CPU 80%). Never log raw PII or full feature vectors with personal data.</p></div>

  <h2 id="ap-srv"><span class="num">06</span>Workers &amp; nginx</h2>
  <table class="tbl">
    <tr><th>Layer</th><th>Job</th><th>Example</th></tr>
    <tr><td>Process manager</td><td>Starts N workers, restarts crashed ones, graceful reloads</td><td><code>gunicorn -w 4</code></td></tr>
    <tr><td>Worker</td><td>Runs the app: sync (WSGI) or event loop (ASGI)</td><td><code>-k uvicorn_worker.UvicornWorker</code></td></tr>
    <tr><td>Reverse proxy</td><td>TLS, load balancing, buffering slow clients, timeouts, limits</td><td>nginx, Envoy, cloud LB</td></tr>
  </table>
  <div class="fx" data-lang="text">$ INSTANCE=api-1 gunicorn prod_app:app -k uvicorn_worker.UvicornWorker -w 2 -b 127.0.0.1:9001
$ INSTANCE=api-2 gunicorn prod_app:app -k uvicorn_worker.UvicornWorker -w 2 -b 127.0.0.1:9002
$ nginx -c nginx.conf</div>
  <div class="fx" data-lang="text">http {   # abridged
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
  <div class="fx" data-lang="text">$ for i in 1 2 3 4; do curl -s "localhost:8088/predict?x=1"; echo; done
{"score":0.731,"served_by":"api-1","pid":3175}
{"score":0.731,"served_by":"api-2","pid":3176}
{"score":0.731,"served_by":"api-1","pid":3173}
{"score":0.731,"served_by":"api-2","pid":3176}

$ for i in $(seq 30); do curl -s -o /dev/null -w '%{http_code}&#92;n' "localhost:8088/predict?x=1"; done | sort | uniq -c
     12 200
     18 429

$ kill api-2 ; for i in 1 2 3 4; do curl -s -w " [%{http_code}]" "localhost:8088/predict?x=1"; echo; done
{"score":0.731,"served_by":"api-1","pid":3173} [200]
{"score":0.731,"served_by":"api-1","pid":3173} [200]
{"score":0.731,"served_by":"api-1","pid":3175} [200]
{"score":0.731,"served_by":"api-1","pid":3175} [200]
# nginx error log:
[error] 3238#3238: *53 connect() failed (111: Connection refused) while connecting to upstream, request: "GET /predict?x=1 HTTP/1.1", upstream: "http://127.0.0.1:9002/predict?x=1", host: "localhost:8088"</div>
  <ul>
    <li>Round robin alternates <code>api-1</code> / <code>api-2</code>; different <code>pid</code>s are different gunicorn workers.</li>
    <li>Burst of 30: 1 + <code>burst=10</code> pass instantly (11, plus 1 refilled), the rest get 429.</li>
    <li>With <code>api-2</code> dead, nginx logs the refused connection, retries on <code>api-1</code>, and clients still see 200.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span><p>nginx is the restaurant host: greets everyone at the door, checks the reservation, seats each party at a free table, and stops seating at a table whose waiter went home.</p></div>
  <div class="callout trap"><span class="label">Trap: workers × model size</span><p>Each worker process loads its own model. A 3 GB model × 8 workers = 24 GB RAM. For big models: fewer workers, a dedicated model server (Triton, TorchServe, vLLM), or <code>--preload</code> to share read-only memory via fork.</p></div>

  <h2 id="ap-scale"><span class="num">07</span>Health &amp; Scaling</h2>
  <table class="tbl">
    <tr><th>Probe</th><th>Question</th><th>On failure</th><th>Checks</th></tr>
    <tr><td>Liveness <code>/health</code></td><td>Is the process stuck or dead?</td><td>Restart it</td><td>Cheap; no dependencies</td></tr>
    <tr><td>Readiness <code>/ready</code></td><td>Can it serve right now?</td><td>Stop routing traffic to it</td><td>Model loaded, DB/Redis reachable</td></tr>
    <tr><td>Startup</td><td>Has slow init finished?</td><td>Wait before other probes</td><td>Large model download</td></tr>
  </table>
  <div class="cards">
    <div><b>Vertical scaling</b><p>Bigger machine. Simple, but has a ceiling and one point of failure.</p></div>
    <div><b>Horizontal scaling</b><p>More identical copies behind a load balancer. Near-unlimited, survives failures.</p><small>Requires statelessness</small></div>
  </div>
  <table class="tbl">
    <tr><th>Stateful (breaks scaling)</th><th>Stateless fix</th></tr>
    <tr><td>Sessions in a Python dict</td><td>JWT or sessions in Redis</td></tr>
    <tr><td>Uploads saved to local disk</td><td>Object storage (S3)</td></tr>
    <tr><td>In-memory cache / rate limit</td><td>Redis</td></tr>
    <tr><td>Cron job inside the API process</td><td>Celery beat / a scheduler service</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>Stateless copies are cattle, not pets: autoscalers add them on high CPU, latency or queue length, and kill them freely. Read-only state (the model file) is fine; shared mutable state must live outside.</p></div>
  <h3>Hands-on</h3>
  <ol>
    <li>Wrap the FastAPI iris <code>/predict</code> with the Redis cache (key = hash of features + model version). Measure hit vs miss.</li>
    <li>Add <code>POST /jobs/score</code> returning 202 + a Celery task id, and <code>GET /jobs/{id}</code> returning its state.</li>
    <li>Run two copies behind the nginx config above, kill one, and confirm zero failed requests.</li>
  </ol>

  <h2 id="ap-qa"><span class="num">08</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through the architecture of a production ML prediction API.</summary><div class="qa-body">Clients → load balancer/nginx (TLS, rate limits) → N stateless API containers (gunicorn + uvicorn workers, model loaded at startup) → Redis for cached features/predictions, Postgres for app data, model artifacts from a registry/S3. Heavy jobs go via a broker to Celery workers. Every copy exposes /health, /ready and /metrics; logs are JSON with request ids; Prometheus + alerts on golden signals and prediction drift.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain cache-aside. What are its failure modes?</summary><div class="qa-body">Read cache; on miss read the DB, write the value to cache with a TTL, return it. Failure modes: stale data until TTL or invalidation; stampede when a hot key expires; inconsistency if the DB update succeeds but the cache delete fails (short TTLs bound it).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use Celery instead of doing the work in the request?</summary><div class="qa-body">Slow work holds a worker and the client's connection, hits proxy timeouts (often 30–60 s), and is lost if the process restarts. A queue returns 202 immediately, runs work on separately scaled workers, retries failures and keeps status.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name Celery's three components and what each does.</summary><div class="qa-body">Broker: holds queued task messages (Redis, RabbitMQ). Worker: process that pulls and executes tasks. Result backend: stores task state and return values (Redis, DB). Producers (your API) only talk to the broker.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Token bucket with capacity 5 and refill 1/s: 8 requests at once, then 3 more after 2 s. What's the output?</summary><div class="qa-body">First burst: 5 allowed, 3 rejected (bucket empty). After 2 s, 2 tokens have refilled: 2 allowed, 1 rejected. Measured: <code>ok×5, 429×3</code> then <code>ok, ok, 429</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the four golden signals? What would you add for an ML service?</summary><div class="qa-body">Latency, traffic, errors, saturation. For ML: prediction distribution and drift vs training, input feature drift and null rates, model version, and (when labels arrive) live accuracy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why structured (JSON) logs rather than print statements?</summary><div class="qa-body">Log systems (ELK, Loki, Cloud Logging) can index and filter fields: <code>status=500 AND path=/predict</code>, or every line for one <code>request_id</code>. Free text needs fragile regexes. Include level, timestamp, request id, latency, status and model version.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many gunicorn workers should you run?</summary><div class="qa-body">Start near the CPU core count for async/CPU-bound ML (the classic <code>2×cores+1</code> is for sync, I/O-bound apps). Then cap by memory: each worker holds a model copy. Load-test and watch latency and saturation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does nginx add in front of gunicorn?</summary><div class="qa-body">TLS termination, load balancing and failover across instances, buffering slow clients so workers aren't tied up, timeouts, request size and rate limits, gzip, static files, and a single entry point that adds request ids.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your API scaled from 1 to 4 instances and users get logged out randomly. Why?</summary><div class="qa-body">Sessions are stored in memory on one instance; the load balancer sends the next request to another one that doesn't know the session. Move sessions to Redis or use JWTs. Sticky sessions are only a workaround.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Liveness vs readiness: what goes wrong if /health checks the database?</summary><div class="qa-body">A brief DB outage fails liveness on every pod, so the orchestrator restarts them all, adding a restart storm on top of the outage. Dependency checks belong in readiness (stop traffic), not liveness (restart).</div></details>
</main>`
});
