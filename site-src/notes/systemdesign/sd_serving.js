// notes/systemdesign/sd_serving.js — Feature Stores & Online/Offline Serving
Object.assign(TOPIC_CONTENT, {
  "sd_serving": `<main>
<h1>Feature Stores &amp; Online/Offline Serving</h1>
  <div class="where"><span>ML System Design</span><span>Serving</span></div>
  <p class="lead">The framework note ended with a trained ETA model that beats the baseline offline. Now it has to answer for real: Asha opens Biteful at 8:10 pm and 20 restaurant cards each need "34 min", 11,111 times a second at the dinner peak, inside a 60 ms slice of the page. This note follows one need at a time: when to compute (batch, online, streaming), how to spend 60 ms, how features reach the model, what to cache, where the model runs, why live numbers can silently differ from training, and how a new version reaches users safely (shadow, then canary). Same running example throughout: Biteful's ETA, orders 101–108, Dosa Hut, Biryani Bros and Pizza Point.</p>

  <h2 id="ss-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 130" width="680">
    <defs><marker id="ss-t0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="8" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="69" y="42" text-anchor="middle" font-size="12">1 Framework</text><text x="69" y="58" text-anchor="middle" font-size="10" class="tm">the whole path once</text>
    <rect x="145" y="22" width="122" height="46" rx="6" class="fg sg" stroke-width="2.5"/><text x="206" y="42" text-anchor="middle" font-size="12" font-weight="700">2 Serving</text><text x="206" y="58" text-anchor="middle" font-size="10" class="tm">answer in 60 ms</text>
    <rect x="282" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="343" y="42" text-anchor="middle" font-size="12">3 Monitoring</text><text x="343" y="58" text-anchor="middle" font-size="10" class="tm">still right next month?</text>
    <rect x="419" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="480" y="42" text-anchor="middle" font-size="12">4 Experiments</text><text x="480" y="58" text-anchor="middle" font-size="10" class="tm">is v2 really better?</text>
    <rect x="556" y="22" width="116" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="614" y="42" text-anchor="middle" font-size="12">5 Case studies</text><text x="614" y="58" text-anchor="middle" font-size="10" class="tm">four full designs</text>
    <line x1="130" y1="45" x2="143" y2="45" stroke="currentColor" marker-end="url(#ss-t0)"/>
    <line x1="267" y1="45" x2="280" y2="45" stroke="currentColor" marker-end="url(#ss-t0)"/>
    <line x1="404" y1="45" x2="417" y2="45" stroke="currentColor" marker-end="url(#ss-t0)"/>
    <line x1="541" y1="45" x2="554" y2="45" stroke="currentColor" marker-end="url(#ss-t0)"/>
    <text x="340" y="96" text-anchor="middle" font-size="11">One story across all five notes: Biteful's delivery-time (ETA) prediction</text>
    <text x="340" y="114" text-anchor="middle" font-size="11" class="tm">this note: the top row of the architecture — request → features → model → "34 min"</text>
  </svg><figcaption>The ML System Design track in reading order. You are on the green note. Serving comes before monitoring because you can only watch a system that runs.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="sd_framework">How to Approach ML System Design</a></b><span>The framework sized the problem (139 QPS average, 556 at peak, 20 cards, 11,111 ETAs/s, 60 ms), named the features (km, kitchen queue, rain, prep_7d), and drew the architecture. <a class="xref" data-note="api_production">Production Backend</a> gave the boxes (workers, Redis, caching, health checks).</span></li>
    <li><b>This note adds: the request path in detail</b><span>Batch vs online vs streaming, a computed latency budget, the feature store and feature fetch, caching with a measured hit ratio, model placement and batching, training-serving skew reproduced, and safe release with shadow and canary.</span></li>
    <li><b>Leads to: <a class="xref" data-note="sd_monitoring">Monitoring, Drift &amp; Retraining</a></b><span>A system that answers in time can still answer wrongly next month. Monitoring watches it; <a class="xref" data-note="sd_experiments">Experiments</a> then proves whether v2 is better. Running these services on real machines is <a class="xref" data-note="mlops_serving">model serving in MLOps</a> and <a class="xref" data-note="mlops_deploy">deployment</a>.</span></li>
  </ol>

  <h2 id="ss-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The note as one chain. Running example: Asha opens Biteful at 20:11 in Pune. The feed needs ETAs for Dosa Hut (4 km, queue 6), Biryani Bros (3 km, queue 8), Pizza Point (6 km, queue 1) and the brand-new Chai Corner (2 km, no data yet). The model is the framework's linear ETA: 13.87 + 3.25·km + 2.42·queue + 8.71·rain.</p>
  <ol class="story">
    <li><b>Batch, online or streaming</b><span>Q: compute the ETA in advance or when asked? → Precomputing every (restaurant, map cell) pair every 5 min costs 20,000 predictions/s and 86% of them are never looked at; nightly is 24 h stale. Online it is: 2,778/s average, 11,111 at peak, with streaming for the queue feature. But online means the user waits…</span></li>
    <li><b>Latency budget</b><span>Q: how do we fit 20 ETAs into 60 ms? → split it: network 8, fetch 12 ∥ route 15, model 10, post 3 → critical path 36 ms, 24 ms headroom; 20 separate GETs push p99 from 5.1 to 10.0 ms. Where do the 12 ms of features come from?</span></li>
    <li><b>Feature fetch &amp; feature store</b><span>Q: how do queue and prep_7d reach the model in milliseconds, and the same values reach training? → one definition, offline store (history) + online store (latest), one MGET, defaults for Chai Corner. Many requests ask the same thing…</span></li>
    <li><b>Caching &amp; precompute</b><span>Q: why recompute the same ETA? → TTL 60 s caches 73.5% of lookups at +0.20 min of error; TTL 300 s caches 85.5% at +1.52 min. Then: where does the model itself run, and how many machines?</span></li>
    <li><b>Where the model runs &amp; scaling</b><span>Q: embedded, model server or batch job; how to scale? → 20 rows in one call: 0.94 ms vs 9.67 ms for 20 calls; ~1,063 feeds per core-second. Everything runs — but are live inputs the same as training inputs?</span></li>
    <li><b>Training-serving skew</b><span>Q: why is live worse than offline? → reproduced: serving used straight-line km, training used road km: MAE 1.66 → 3.15, late 42% → 84%; PSI 0.19 on logged km catches it. With skew fixed, how do we release v2 without hurting users?</span></li>
    <li><b>Shadow deployment</b><span>Q: does v2 even work on real traffic? → mirror requests, show nobody: overall only 2.7 min apart, but Mumbai-in-rain is −9.6 min (a null weather feed). Shadow can't show user impact…</span></li>
    <li><b>Canary &amp; blue-green</b><span>Q: how few users see v2 first, and how do we undo? → 10% for 10 min = 33,360 requests; 55 errors vs 33.4 expected → p = 0.0004, roll back. Whether v2 is <em>better</em> is the experiments note's job.</span></li>
  </ol>

  <h2 id="ss-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Serving Biteful's ETA</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">When to compute</div>
        <ul>
          <li><b>Batch</b> — precompute, look up; cheap, stale</li>
          <li><b>Online</b> — per request; fresh, pays latency</li>
          <li><b>Streaming</b> — features updated from events (Kafka)</li>
          <li>ETA: online model + streaming queue + nightly prep_7d</li>
          <li>💡 tiffin service vs dhaba</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Latency budget</div>
        <ul>
          <li><b>p99</b>, not average</li>
          <li>60 ms: 8 + max(15, 12) + 10 + 3 = 36 critical path</li>
          <li><b>Fan-out</b> — 20 calls: 1 − 0.99<sup>20</sup> = 18.2% hit a slow one</li>
          <li>One MGET; parallel independent steps; fallback</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Feature store</div>
        <ul>
          <li><b>Offline store</b> — history + timestamps (training)</li>
          <li><b>Online store</b> — latest per key (Redis)</li>
          <li><b>Registry</b> — one definition</li>
          <li><b>Materialize</b> — offline → online</li>
          <li>Feast, Tecton</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Cache &amp; run</div>
        <ul>
          <li><b>TTL</b> trades hit ratio for staleness</li>
          <li>60 s: 73.5% hits, +0.20 min error</li>
          <li><b>Model placement</b> — embedded, server, sidecar, batch</li>
          <li><b>Batching</b> — 20 rows/call: 10× faster</li>
          <li>Autoscale on latency/queue, not CPU (GPU)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Skew</div>
        <ul>
          <li><b>Two code paths</b> — road vs straight km</li>
          <li>MAE 1.66 → 3.15, late 42% → 84%</li>
          <li><b>Detect</b> — compare logged served features (PSI 0.19)</li>
          <li><b>Fix</b> — shared code; log-and-wait training</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Safe release</div>
        <ul>
          <li><b>Shadow</b> — mirror, log, compare; zero user risk</li>
          <li>slice it: Mumbai + rain −9.6 min</li>
          <li><b>Canary</b> — 10% → widen; binomial test on errors</li>
          <li><b>Blue-green</b> — warm copy, flip back</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ss-modes"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Batch, Online or Streaming?</span><span class="rm-sub">Precompute or compute now</span></div></div>
      <div class="rm-item rm-done" data-target="ss-budget"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Latency Budget</span><span class="rm-sub">Spending 60 ms, computed</span></div></div>
      <div class="rm-item rm-done" data-target="ss-fs"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Feature Fetch &amp; Feature Stores</span><span class="rm-sub">Offline, online, registry</span></div></div>
      <div class="rm-item rm-done" data-target="ss-cache"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Caching &amp; Precompute</span><span class="rm-sub">Hit ratio vs staleness</span></div></div>
      <div class="rm-item rm-done" data-target="ss-run"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Where the Model Runs</span><span class="rm-sub">Patterns, batching, scaling</span></div></div>
      <div class="rm-item rm-done" data-target="ss-skew"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Training-Serving Skew</span><span class="rm-sub">Reproduced and caught</span></div></div>
      <div class="rm-item rm-done" data-target="ss-shadow"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Shadow Deployment</span><span class="rm-sub">Real traffic, zero risk</span></div></div>
      <div class="rm-item rm-done" data-target="ss-canary"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Canary &amp; Blue-Green</span><span class="rm-sub">Limit the blast radius</span></div></div>
      <div class="rm-item rm-done" data-target="ss-connect"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One 20:11 request</span></div></div>
      <div class="rm-item rm-done" data-target="ss-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="ss-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="ss-modes"><span class="num">01</span>Batch, Online or Streaming?</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We have <code>model.pkl</code> and a laptop. Asha's phone has neither. Should Biteful compute every possible ETA in advance and just look it up, or compute each one at the moment she opens the app? And what about a feature like the kitchen queue, which changes every minute?</p>
  </div>
  <p>Getting a model's answers to the people who need them, in time, is called <strong>serving</strong>. There are three ways, and real systems mix them:</p>
  <ul>
    <li><strong>Batch</strong>: a scheduled job scores everything at once and saves the results in a fast <strong>key-value store</strong> (give it a key, get a value back in ~1 ms; Redis is the common one). The app only looks them up.</li>
    <li><strong>Online</strong> (real-time): nothing is saved in advance. When the request arrives, the service fetches features, runs the model, and replies. Everything it does sits on the <strong>request path</strong>, the work done while the user waits.</li>
    <li><strong>Streaming</strong>: a job reads events as they happen (order placed, order picked up) from a stream such as <a class="xref" data-note="de_kafka">Kafka</a> and keeps a feature up to date continuously, so online serving can read a value that is seconds old.</li>
  </ul>
  <figure class="viz"><svg viewBox="0 0 740 168" width="740" role="img"><defs><marker id="ss-m1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><text x="10" y="16" text-anchor="start" class="tb" font-weight="600">Batch: precompute for everyone</text><rect x="10" y="24" width="155" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="87.5" y="43" text-anchor="middle" font-weight="600">Scheduler</text><text x="87.5" y="57" text-anchor="middle" class="tm">nightly</text><rect x="199" y="24" width="155" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="276.5" y="43" text-anchor="middle" font-weight="600">Batch job</text><text x="276.5" y="57" text-anchor="middle" class="tm">score all users</text><rect x="388" y="24" width="155" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="465.5" y="43" text-anchor="middle" font-weight="600">Key-value store</text><text x="465.5" y="57" text-anchor="middle" class="tm">predictions</text><rect x="577" y="24" width="155" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="654.5" y="43" text-anchor="middle" font-weight="600">App lookup</text><text x="654.5" y="57" text-anchor="middle" class="tm">~5 ms</text><line x1="167" y1="46" x2="196" y2="46" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m1)"/><line x1="356" y1="46" x2="385" y2="46" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m1)"/><line x1="545" y1="46" x2="574" y2="46" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m1)"/><text x="10" y="100" text-anchor="start" class="tb" font-weight="600">Real-time: compute per request</text><rect x="10" y="108" width="155" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="87.5" y="134" text-anchor="middle" font-weight="600">User request</text><rect x="199" y="108" width="155" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="276.5" y="127" text-anchor="middle" font-weight="600">Feature fetch</text><text x="276.5" y="141" text-anchor="middle" class="tm">online store</text><rect x="388" y="108" width="155" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="465.5" y="127" text-anchor="middle" font-weight="600">Model server</text><text x="465.5" y="141" text-anchor="middle" class="tm">predict</text><rect x="577" y="108" width="155" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="654.5" y="127" text-anchor="middle" font-weight="600">Response</text><text x="654.5" y="141" text-anchor="middle" class="tm">~50 ms</text><line x1="167" y1="130" x2="196" y2="130" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m1)"/><line x1="356" y1="130" x2="385" y2="130" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m1)"/><line x1="545" y1="130" x2="574" y2="130" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m1)"/></svg><figcaption>Batch moves the model off the request path. Real-time pays latency to use fresh context.</figcaption></figure>
  <p>Count the work on the request path. In the top row the request touches only the key-value store (~5 ms). In the bottom row it waits for a feature fetch and a model call too (~50 ms). So why not always batch? Cost it for Biteful:</p>
  <div class="fx" data-lang="py"># Three ways to get an ETA onto Asha's screen, costed for Biteful
DAY = 86_400
restaurants, cells = 20_000, 300          # each restaurant delivers to ~300 map cells (8 km)
pairs = restaurants * cells

# (a) Batch: score every (restaurant, cell) pair nightly, store, look up
print(f"(a) nightly batch : {pairs/1e6:.0f} M predictions/day, values up to 24 h old")

# (b) Near-real-time: re-score every pair every 5 minutes
every = 300
print(f"(b) every 5 min   : {pairs/every:,.0f} predictions/s, all day -&gt; {pairs/every*DAY/1e9:.2f} B/day")

# (c) Online: score only what is requested, when requested
avg_qps = 12_000_000 / DAY            # 138.9 feed loads per second (framework note)
peak_qps, cards = avg_qps * 4, 20
online_day = avg_qps * cards * DAY
print(f"(c) online        : {avg_qps*cards:,.0f}/s avg, {peak_qps*cards:,.0f}/s peak -&gt; {online_day/1e9:.2f} B/day")
print(f"share of 5-min precomputed pairs anyone looks at: {online_day/(pairs/every*DAY):.1%}")</div>
<div class="fx" data-lang="text">(a) nightly batch : 6 M predictions/day, values up to 24 h old
(b) every 5 min   : 20,000 predictions/s, all day -&gt; 1.73 B/day
(c) online        : 2,778/s avg, 11,111/s peak -&gt; 0.24 B/day
share of 5-min precomputed pairs anyone looks at: 13.9%</div>
  <ul>
    <li><strong>(a) Nightly batch</strong> is cheap (6M predictions) but the queue at Dosa Hut tonight is not knowable last night. Useless for ETA.</li>
    <li><strong>(b) Every 5 minutes</strong> keeps values fresh-ish but burns 20,000 predictions every second, all day, and only <strong>13.9%</strong> of them are ever shown to anyone.</li>
    <li><strong>(c) Online</strong> computes only what is asked: 2,778/s on average, 11,111 at peak. The cost is latency on the request path, which section 02 budgets.</li>
  </ul>
  <p>So Biteful's ETA is <strong>online</strong> for the model, <strong>streaming</strong> for the kitchen queue, and <strong>batch</strong> for slow features like prep_7d. That mix is the norm.</p>
  <table class="tbl">
    <tr><th></th><th>Batch (offline)</th><th>Online (real-time)</th><th>Streaming features</th></tr>
    <tr><td>When computed</td><td>On a schedule, for all entities</td><td>Per request</td><td>Per event, continuously</td></tr>
    <tr><td>Freshness</td><td>Hours old</td><td>Uses this request's context</td><td>Seconds old</td></tr>
    <tr><td>Latency at read</td><td>~ms (key lookup)</td><td>Model + feature time</td><td>~ms (key lookup)</td></tr>
    <tr><td>Cost</td><td>Wasted on entities nobody asks about</td><td>Pay per request; autoscaling</td><td>Always-on stream job</td></tr>
    <tr><td>Biteful examples</td><td>prep_7d, "we miss you" emails, demand forecasts</td><td>ETA, fraud check, feed ranking</td><td>kitchen queue, rider supply, card velocity</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A tiffin service packs 500 tiffins in the morning (batch): slow once, then handing each out takes a second, but nobody gets a custom dish. A dhaba cooks each order when you sit down (online): fresh and made for you, but the cook must be fast. The boy who keeps shouting the latest count of waiting customers to the cook is the stream job.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Serving</strong>: delivering model predictions to the place they are used. <strong>Batch serving</strong>: precompute and store. <strong>Online serving</strong>: compute per request. <strong>Streaming features</strong>: features maintained continuously from an event stream.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Choosing by habit. Ask one question: does the answer depend on something that exists only at request time (this address, this minute's queue, this payment)? If yes, online. If no, batch is cheaper and simpler.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the latency budget.</b> Online means Asha waits while we fetch features, get distances and run the model, for 20 cards. The feed must load in 200 ms and the ETA service gets 60 ms. How do we spend 60 ms, and what quietly makes it longer?</div>

  <h2 id="ss-budget"><span class="num">02</span>The Latency Budget</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Five steps sit on the ETA request path. If each team takes "as long as it needs", the total blows past 60 ms. Which number do we budget (average or slow tail), how do we split it, and why does calling 20 things at once make the tail worse?</p>
  </div>
  <p><strong>Latency</strong> is the time from asking to getting the answer, in milliseconds (ms). A <strong>latency budget</strong> gives each step a fixed slice of the total in advance. We budget the <strong>p99</strong> — the time within which 99 of 100 requests finish — not the average, because the slow 1% is what users notice, and heavy users hit it most. (p50 is the median.)</p>
  <div class="fx" data-lang="py">import numpy as np

# The ETA service's 60 ms p99 slice of the 200 ms feed, split per step (ms)
budget = {"network in+out": 8, "feature fetch (Redis)": 12, "route engine (km x20)": 15,
          "model (20 rows)": 10, "post-process": 3}
used = sum(budget.values())
for k, v in budget.items():
    print(f"{k:&lt;32}{v:&gt;4} ms")
print(f"{'sum if run one after another':&lt;32}{used} ms, headroom {60 - used} ms")
# feature fetch and route engine don't depend on each other: run them in parallel
crit = budget["network in+out"] + max(budget["feature fetch (Redis)"], budget["route engine (km x20)"]) \\
       + budget["model (20 rows)"] + budget["post-process"]
print(f"{'critical path, parallel fetch':&lt;32}{crit} ms, headroom {60 - crit} ms")

# Fan-out: 20 separate Redis GETs vs one MGET. Each call's latency: mostly ~1 ms, sometimes slow.
rng = np.random.default_rng(0)
calls = rng.lognormal(mean=0.0, sigma=0.7, size=(100_000, 20))    # ms, 100k simulated requests
single_p99 = np.quantile(calls[:, 0], 0.99)
print(f"\\none GET:   p50 {np.median(calls[:, 0]):.1f} ms  p99 {single_p99:.1f} ms")
slowest = calls.max(axis=1)                    # parallel GETs: the request waits for the slowest
print(f"20 GETs:   p50 {np.median(slowest):.1f} ms  p99 {np.quantile(slowest, 0.99):.1f} ms")
print(f"requests that hit at least one call above the single-call p99: {np.mean(slowest &gt; single_p99):.1%}")
print(f"theory 1 - 0.99**20 = {1 - 0.99**20:.1%}")</div>
<div class="fx" data-lang="text">network in+out                     8 ms
feature fetch (Redis)             12 ms
route engine (km x20)             15 ms
model (20 rows)                   10 ms
post-process                       3 ms
sum if run one after another    48 ms, headroom 12 ms
critical path, parallel fetch   36 ms, headroom 24 ms

one GET:   p50 1.0 ms  p99 5.1 ms
20 GETs:   p50 3.6 ms  p99 10.0 ms
requests that hit at least one call above the single-call p99: 18.0%
theory 1 - 0.99**20 = 18.2%</div>
  <p>Trace the top half. Added one after another, the five steps take 8 + 12 + 15 + 10 + 3 = 48 ms, leaving 12 ms. But the feature fetch and the route engine don't need each other's answers, so they run in parallel: the request waits only for the slower of the two. Critical path = 8 + max(12, 15) + 10 + 3 = <strong>36 ms</strong>, headroom <strong>24 ms</strong>.</p>
  <figure class="viz"><svg viewBox="0 0 680 150" width="680" role="img"><rect x="40" y="40" width="80" height="60" rx="3" class="fs" stroke="currentColor" stroke-opacity=".45"/><text x="80.0" y="74.0" text-anchor="middle" font-size="11">network</text><rect x="120" y="40" width="150" height="29" rx="3" class="ft" stroke="currentColor" stroke-opacity=".45"/><text x="195.0" y="58.5" text-anchor="middle" font-size="11">route km 15</text><rect x="120" y="71" width="120" height="29" rx="3" class="ft" stroke="currentColor" stroke-opacity=".45"/><text x="180.0" y="89.5" text-anchor="middle" font-size="11">fetch 12</text><rect x="270" y="40" width="100" height="60" rx="3" class="fv" stroke="currentColor" stroke-opacity=".45"/><text x="320.0" y="74.0" text-anchor="middle" font-size="11">model 10</text><rect x="370" y="40" width="30" height="60" rx="3" class="fs" stroke="currentColor" stroke-opacity=".45"/><text x="385.0" y="74.0" text-anchor="middle" font-size="11">3</text><rect x="400" y="40" width="240" height="60" rx="3" class="fg" stroke="currentColor" stroke-opacity=".45"/><text x="520.0" y="74.0" text-anchor="middle" font-size="11">headroom 24</text><line x1="40" y1="30" x2="40" y2="108" stroke="currentColor" stroke-opacity=".35"/><text x="40" y="24" text-anchor="middle" font-size="10" class="tm">0</text><line x1="120" y1="30" x2="120" y2="108" stroke="currentColor" stroke-opacity=".35"/><text x="120" y="24" text-anchor="middle" font-size="10" class="tm">8</text><line x1="270" y1="30" x2="270" y2="108" stroke="currentColor" stroke-opacity=".35"/><text x="270" y="24" text-anchor="middle" font-size="10" class="tm">23</text><line x1="370" y1="30" x2="370" y2="108" stroke="currentColor" stroke-opacity=".35"/><text x="370" y="24" text-anchor="middle" font-size="10" class="tm">33</text><line x1="400" y1="30" x2="400" y2="108" stroke="currentColor" stroke-opacity=".35"/><text x="400" y="24" text-anchor="middle" font-size="10" class="tm">36</text><line x1="640" y1="30" x2="640" y2="108" stroke="currentColor" stroke-opacity=".35"/><text x="640" y="24" text-anchor="middle" font-size="10" class="tm">60</text><text x="40" y="128" font-size="11">critical path 36 ms = 8 + max(15, 12) + 10 + 3; the two teal steps run in parallel</text><text x="40" y="144" font-size="10" class="tm">ms of the ETA service's 60 ms p99 slice (the whole feed has 200 ms)</text></svg><figcaption>The ETA service's 60 ms budget. Fetch and route overlap; the headroom absorbs bad days.</figcaption></figure>
  <p>Now the bottom half: <strong>fan-out</strong>, one request calling many services. Suppose we fetched each of the 20 restaurants' features with its own GET. A single GET is usually ~1 ms (p50 1.0) and occasionally slow (p99 5.1). With 20 in parallel, the request waits for the slowest, so its p50 becomes 3.6 ms and its p99 10.0 ms. 18.0% of requests hit at least one call slower than the single-call p99; the formula 1 − 0.99<sup>20</sup> = 18.2% predicts it. The fix: one <strong>MGET</strong> for all 20 keys (one round trip), a timeout, and a default value.</p>
  <ul>
    <li>Budget the <strong>p99</strong>, and give every step a slice plus headroom.</li>
    <li>Run independent steps in parallel; the critical path is what counts.</li>
    <li>Fan-out multiplies tail risk: batch the calls (MGET), use timeouts with defaults.</li>
    <li>Always define a <strong>fallback</strong>: if the model times out, show the baseline 15 + 4 × km. A rough ETA beats a blank card.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A relay race with a fixed finish time. If one runner is slow, the others can't recover it, so each leg gets a strict slice. And two runners who don't need the baton from each other can run at the same time.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>p99 latency</strong>: the time 99% of requests beat. <strong>Critical path</strong>: the longest chain of dependent steps. <strong>Fan-out</strong>: one request calling many downstream services; the request is as slow as the slowest call.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Budgeting the average. An average of 30 ms can hide a p99 of 200 ms. And measuring each step's p99 separately: the request's p99 is worse than any single step's when steps fan out.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: feature fetch.</b> We gave "feature fetch" 12 ms. But where do queue and prep_7d actually live, how are they kept fresh, and how do we make sure training used the same numbers?</div>

  <h2 id="ss-fs"><span class="num">03</span>Feature Fetch &amp; Feature Stores</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Two teams need Dosa Hut's queue count. The training job wants every value from the last six months, with timestamps, read once a week. The ETA service wants today's value, now, in ~1 ms. If each team writes its own code, the numbers drift apart. How do we serve both from one definition?</p>
  </div>
  <p>A <strong>feature store</strong> defines each feature once, computes it once, and stores it in two shapes: an <strong>offline store</strong> (full history with timestamps, for building training sets with point-in-time joins) and an <strong>online store</strong> (the latest value per key, for serving). A <strong>registry</strong> holds the definitions, and <strong>materialization</strong> copies fresh values from offline to online.</p>
  <figure class="viz"><svg viewBox="0 0 740 236" width="740" role="img"><defs><marker id="ss-m3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="190" y="4" width="350" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="365" y="22" text-anchor="middle" font-weight="600">Registry: one feature definition for both paths</text><rect x="10" y="60" width="140" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="80" y="79" text-anchor="middle" font-weight="600">Warehouse</text><text x="80" y="93" text-anchor="middle" class="tm">batch tables</text><rect x="10" y="160" width="140" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="80" y="179" text-anchor="middle" font-weight="600">Event stream</text><text x="80" y="193" text-anchor="middle" class="tm">Kafka</text><rect x="190" y="110" width="140" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="260" y="129" text-anchor="middle" font-weight="600">Feature</text><text x="260" y="143" text-anchor="middle" class="tm">pipelines</text><rect x="380" y="60" width="160" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="460" y="79" text-anchor="middle" font-weight="600">Offline store</text><text x="460" y="93" text-anchor="middle" class="tm">full history</text><rect x="380" y="160" width="160" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="460" y="179" text-anchor="middle" font-weight="600">Online store</text><text x="460" y="193" text-anchor="middle" class="tm">latest values</text><rect x="585" y="60" width="145" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="657.5" y="79" text-anchor="middle" font-weight="600">Training sets</text><text x="657.5" y="93" text-anchor="middle" class="tm">point-in-time</text><rect x="585" y="160" width="145" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="657.5" y="179" text-anchor="middle" font-weight="600">Online serving</text><text x="657.5" y="193" text-anchor="middle" class="tm">&lt;10 ms lookup</text><line x1="152" y1="82" x2="188" y2="124" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m3)"/><line x1="152" y1="182" x2="188" y2="142" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m3)"/><line x1="332" y1="124" x2="378" y2="86" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m3)"/><line x1="332" y1="142" x2="378" y2="178" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m3)"/><line x1="460" y1="106" x2="460" y2="157" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#ss-m3)"/><text x="468" y="136" text-anchor="start" class="tm">materialize</text><line x1="542" y1="82" x2="582" y2="82" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m3)"/><line x1="542" y1="182" x2="582" y2="182" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m3)"/></svg><figcaption>Same definitions feed a history store (for training) and a fast latest-value store (for serving).</figcaption></figure>
  <p>Follow the arrows: raw data on the left (warehouse tables, the Kafka order stream) is turned into features in the middle, then written to the top (full history, for training) and the bottom (latest value, for serving). Here is the whole idea in miniature, on Asha's 20:11 feed:</p>
  <div class="fx" data-lang="py">import pandas as pd

# A feature store in miniature: one definition, two stores.
# OFFLINE store: every value ever computed, with its timestamp (for training)
offline = pd.DataFrame({
    "restaurant": ["Dosa Hut", "Dosa Hut", "Biryani Bros", "Pizza Point", "Dosa Hut", "Biryani Bros"],
    "ts": pd.to_datetime(["20:00", "20:05", "20:05", "20:05", "20:10", "20:10"], format="%H:%M"),
    "queue": [4, 5, 7, 1, 6, 8]})

# MATERIALIZE: copy the latest value per key into the ONLINE store (a dict here, Redis in prod)
online = {}
for r in offline.sort_values("ts").itertuples():
    online[f"queue:{r.restaurant}"] = r.queue
online["rain:pune"] = 0
print("online store:", online)

DEFAULTS = {"queue": 3}            # same default in training and serving: the median queue

def get_online_features(restaurants):
    keys = [f"queue:{r}" for r in restaurants]
    values = [online.get(k) for k in keys]            # in Redis: ONE MGET call for all keys
    return {r: (v if v is not None else DEFAULTS["queue"]) for r, v in zip(restaurants, values)}

# Asha opens the feed at 20:11: four cards, one restaurant is brand new
feed = ["Dosa Hut", "Biryani Bros", "Pizza Point", "Chai Corner"]
km = {"Dosa Hut": 4.0, "Biryani Bros": 3.0, "Pizza Point": 6.0, "Chai Corner": 2.0}   # route engine
q = get_online_features(feed)
rain = online["rain:pune"]
for r in feed:
    eta = 13.87 + 3.25 * km[r] + 2.42 * q[r] + 8.71 * rain      # the linear model from the framework note
    print(f"{r:&lt;13} km={km[r]}  queue={q[r]}  ETA={eta:.1f} min")</div>
<div class="fx" data-lang="text">online store: {'queue:Dosa Hut': 6, 'queue:Biryani Bros': 8, 'queue:Pizza Point': 1, 'rain:pune': 0}
Dosa Hut      km=4.0  queue=6  ETA=41.4 min
Biryani Bros  km=3.0  queue=8  ETA=43.0 min
Pizza Point   km=6.0  queue=1  ETA=35.8 min
Chai Corner   km=2.0  queue=3  ETA=27.6 min</div>
  <p>Walk through it:</p>
  <ul>
    <li><strong>Offline store</strong>: six rows of history. Dosa Hut's queue went 4 → 5 → 6 between 20:00 and 20:10. Training would use these with a point-in-time join (<a class="xref" data-note="sd_framework">framework</a> §06).</li>
    <li><strong>Materialize</strong>: the loop keeps only the latest value per key, so the online store holds <code>queue:Dosa Hut = 6</code>. In production this is a scheduled or streaming job writing to Redis.</li>
    <li><strong>Fetch</strong>: <code>get_online_features</code> builds four keys and reads them together (one MGET in Redis). Chai Corner opened today and has no key, so it gets the <strong>default</strong> 3 — the same default the training pipeline used for missing values.</li>
    <li><strong>Predict</strong>: Dosa Hut = 13.87 + 3.25 × 4 + 2.42 × 6 + 0 = 41.4 minutes, exactly order 102's situation (actual 41).</li>
  </ul>
  <div class="cards">
    <div><b>Offline store</b><p>Every historical value with timestamps. Big, slow, cheap.</p><small>Parquet, BigQuery, Snowflake</small></div>
    <div><b>Online store</b><p>Latest value per entity. Small and fast.</p><small>Redis, DynamoDB, Bigtable</small></div>
    <div><b>Registry</b><p>Feature definitions, owners, versions.</p><small>Reuse across teams</small></div>
    <div><b>Materialization</b><p>Job that copies fresh values offline → online.</p><small>Batch or streaming</small></div>
  </div>
  <p>Real tools do the same four things. In <strong>Feast</strong> (open source): a <code>FeatureView</code> is the registry entry; <code>get_historical_features(entity_df)</code> does the point-in-time join for training; <code>materialize(start, end)</code> copies values to the online store; <code>get_online_features(entity_rows)</code> is our fetch. <strong>Tecton</strong> (managed, now part of Databricks) also runs the batch and streaming transforms for you.</p>
  <table class="tbl">
    <tr><th>Our miniature</th><th>Feast call</th><th>Production version</th></tr>
    <tr><td><code>offline</code> DataFrame</td><td>FileSource / BigQuerySource in a FeatureView</td><td>Warehouse table with event timestamps</td></tr>
    <tr><td>merge_asof (framework note)</td><td><code>get_historical_features</code></td><td>Point-in-time join at scale</td></tr>
    <tr><td>the materialize loop</td><td><code>materialize</code> / <code>materialize_incremental</code></td><td>Scheduled job or stream writer</td></tr>
    <tr><td><code>get_online_features</code> + DEFAULTS</td><td><code>get_online_features</code></td><td>Redis MGET with timeout and defaults</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school's marks. The office keeps every term's full register (offline store) for report cards. The notice board shows only the latest result per student (online store) so anyone can check it in a second. Both come from the same exam sheets (registry).</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Feature store</strong>: one place to define, compute, store and serve features, so training and serving read the same values. <strong>Entity / join key</strong>: what a feature describes (restaurant id). <strong>Default value</strong>: what serving returns when a key is missing; it must match training's fill value.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A feature store is not required for every design. One batch model with three features does fine with a table. Bring it up when several models share features, or real-time features are needed, as for ETA.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: caching.</b> Features now arrive in milliseconds. But at 8 pm thousands of people in Kothrud ask for Dosa Hut's ETA to almost the same address within the same minute. Do we really need to run the model for every one of them?</div>

  <h2 id="ss-cache"><span class="num">04</span>Caching &amp; Precompute</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The same (restaurant, neighbourhood) ETA is requested again and again within seconds. Recomputing it wastes work; reusing it risks showing a stale number after the queue changed. How much do we save, and how wrong do we get?</p>
  </div>
  <p>The fastest work is work you did earlier. <strong>Precomputing</strong> moves slow, slowly-changing work (prep_7d, embeddings) off the request path. A <strong>cache</strong> keeps a recent answer and reuses it until its <strong>TTL</strong> (time to live) expires. The <strong>hit ratio</strong> is the share of lookups answered from the cache. For the ETA the key is (restaurant, map cell): Asha and her neighbour two streets away get the same answer.</p>
  <p>We simulate 10 minutes of dinner traffic at 1/10 scale: 1,111 lookups per second over 2,000 restaurants and 50 cells each, popular restaurants asked far more often. Each kitchen's queue drifts by up to one order per minute, and since every queue order is worth 2.42 minutes in our model, a cached ETA built on an old queue is off by 2.42 × (change in queue).</p>
  <div class="fx" data-lang="py">import numpy as np

# 10 minutes of dinner traffic at 1/10 scale: 1,111 ETA lookups per second
# key = (restaurant, map cell); popular restaurants are asked about far more often
rng = np.random.default_rng(1)
R, C, secs, per_s = 2_000, 50, 600, 1_111
pop = 1 / np.arange(1, R + 1) ** 1.1; pop /= pop.sum()          # Zipf-like popularity
t = np.repeat(np.arange(secs), per_s)
rest = rng.choice(R, size=t.size, p=pop)
cell = rng.integers(0, C, t.size)
# each kitchen's queue drifts by -1/0/+1 every minute (what the ETA depends on)
queue = np.clip(3 + np.cumsum(rng.integers(-1, 2, (secs // 60 + 1, R)), axis=0), 0, None)

for ttl in [0, 30, 60, 120, 300]:
    cached = {}                                    # key -&gt; (time stored, queue used)
    hits, extra_err = 0, 0.0
    for ti, r, c in zip(t, rest, cell):
        key = (r, c)
        hit = key in cached and ti - cached[key][0] &lt; ttl
        if hit:
            hits += 1
            extra_err += 2.42 * abs(queue[ti // 60, r] - cached[key][1])   # minutes, from a stale queue
        else:
            cached[key] = (ti, queue[ti // 60, r])
    print(f"TTL {ttl:&gt;3} s: hit ratio {hits/t.size:5.1%}   model calls saved {hits:&gt;7,}   "
          f"extra error {extra_err/t.size:.2f} min per lookup")</div>
<div class="fx" data-lang="text">TTL   0 s: hit ratio  0.0%   model calls saved       0   extra error 0.00 min per lookup
TTL  30 s: hit ratio 67.0%   model calls saved 446,340   extra error 0.11 min per lookup
TTL  60 s: hit ratio 73.5%   model calls saved 489,700   extra error 0.20 min per lookup
TTL 120 s: hit ratio 79.2%   model calls saved 528,226   extra error 0.62 min per lookup
TTL 300 s: hit ratio 85.5%   model calls saved 570,166   extra error 1.52 min per lookup</div>
  <p>Read the trade-off row by row. TTL 30 s already serves two thirds of lookups from the cache, because popular keys repeat constantly. Going to 60 s adds a little more (73.5%) for 0.20 minutes of extra error per lookup on average. At 300 s the cache answers 85.5% of lookups but the ETAs are 1.52 minutes worse — almost as much as the gap between a good and a mediocre model. Biteful picks <strong>60 s</strong>: about 3.8× fewer model calls for a fifth of a minute.</p>
  <table class="tbl">
    <tr><th>What</th><th>Where</th><th>Refresh</th></tr>
    <tr><td>prep_7d, zone history</td><td>Online store</td><td>Nightly batch</td></tr>
    <tr><td>Kitchen queue, rider supply</td><td>Online store</td><td>Streaming, seconds</td></tr>
    <tr><td>ETA per (restaurant, cell)</td><td>Cache with TTL</td><td>60 s</td></tr>
    <tr><td>Restaurant embeddings + ANN index (for recommendations)</td><td>In-memory on retrieval servers</td><td>Daily</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The "today's specials" board at a restaurant. The waiter doesn't run to the kitchen for every customer; he reads the board. But if the board is never rewritten, customers order dishes that ran out an hour ago. TTL is how often someone rewrites the board.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Cache-aside</strong>: read the cache; on a miss, compute, store with a TTL, return (see <a class="xref" data-note="api_production">Production Backend</a>). <strong>Hit ratio</strong> = hits ÷ lookups. <strong>Staleness</strong>: how old a served value is.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Caching predictions without the model version in the key. After v13 ships, users keep getting v12's ETAs until every entry expires — and an A/B test of v13 is silently diluted. Key = (model version, restaurant, cell).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: where the model runs.</b> Caching removed three quarters of the model calls. The rest still have to run somewhere: inside the ETA service, in a separate model server, or as a batch job? And how many machines at 11,111 rows a second?</div>

  <h2 id="ss-run"><span class="num">05</span>Where the Model Runs &amp; Scaling</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The model file must be loaded by some process. Should the ETA service load it itself, or call a separate model service over the network? And at peak, is the model call cheap enough per row, or do we need GPUs and tricks?</p>
  </div>
  <p><strong>Inference</strong> means running the model to get a prediction. There are four common placements:</p>
  <div class="cards">
    <div><b>Embedded</b><p>Model loaded inside the app process.</p><small>Lowest latency; redeploy app to update model</small></div>
    <div><b>Model server</b><p>Separate service behind REST/gRPC.</p><small>Triton, TorchServe, KServe, BentoML</small></div>
    <div><b>Sidecar</b><p>Model container next to the app in the same pod, via localhost.</p><small>Independent deploys, no network hop</small></div>
    <div><b>Batch job</b><p>Spark / Ray scores a table on a schedule.</p><small>Writes to a key-value store</small></div>
  </div>
  <table class="tbl">
    <tr><th></th><th>Embedded</th><th>Model server</th><th>Sidecar</th></tr>
    <tr><td>Latency</td><td>Best</td><td>+1–5 ms network</td><td>Near embedded</td></tr>
    <tr><td>Independent scaling</td><td>No</td><td>Yes (GPU pool)</td><td>No (scales with app)</td></tr>
    <tr><td>Language lock-in</td><td>Yes</td><td>No</td><td>No</td></tr>
    <tr><td>Use when</td><td>Small model, one service, mobile/edge</td><td>Big models, many callers</td><td>Per-service model, tight latency</td></tr>
  </table>
  <p>Biteful's ETA model is a few-MB GBM used by one service, so <strong>embedded</strong> fits: no network hop. The biggest per-call lever is <strong>batching</strong>: every model call has a fixed overhead, so scoring 20 rows in one call is far cheaper than 20 calls of one row. Measured with a real 300-tree LightGBM, one thread:</p>
  <div class="fx" data-lang="py">import time, numpy as np, lightgbm as lgb

# A real LightGBM ETA-style model (300 trees), single-threaded
rng = np.random.default_rng(0)
X = rng.random((5_000, 5)); y = 15 + 20 * X[:, 0] + 10 * X[:, 1] + rng.normal(0, 2, 5_000)
model = lgb.LGBMRegressor(n_estimators=300, n_jobs=1, verbose=-1).fit(X, y)
feed = rng.random((20, 5))                         # one feed load: 20 restaurant rows

def ms(f, reps=200):
    t0 = time.perf_counter()
    for _ in range(reps): f()
    return (time.perf_counter() - t0) / reps * 1000

one_by_one = ms(lambda: [model.predict(feed[i:i + 1]) for i in range(20)])
batched = ms(lambda: model.predict(feed))
print(f"20 calls of 1 row : {one_by_one:6.2f} ms per feed")
print(f"1 call of 20 rows : {batched:6.2f} ms per feed  ({one_by_one / batched:.0f}x faster)")
print(f"feeds per second per core, batched: {1000 / batched:,.0f}")</div>
<div class="fx" data-lang="text">20 calls of 1 row :   9.67 ms per feed
1 call of 20 rows :   0.94 ms per feed  (10x faster)
feeds per second per core, batched: 1,063</div>
  <p>One call of 20 rows takes about a tenth of the time of 20 separate calls (exact timings vary by machine). At ~1,063 feeds per core-second, peak (556 feeds/s) needs about one core for the model — the framework's 0.56-core estimate, confirmed. The expensive parts of ETA serving are features and the route engine, not the model.</p>
  <p>For bigger models (deep rankers, embeddings) the same idea becomes <strong>dynamic batching</strong> on GPUs: the server waits a few milliseconds, collects requests from many users, and runs them as one call.</p>
  <div class="flow"><span>Requests</span><span>Queue (wait ≤ 5 ms)</span><span>Batch of 32</span><span>One GPU call</span><span>Split responses</span></div>
  <table class="tbl">
    <tr><th>Lever</th><th>Gain</th><th>Cost</th></tr>
    <tr><td><strong>Batching</strong></td><td>Throughput up many times (10× here)</td><td>Dynamic batching adds a few ms of queueing</td></tr>
    <tr><td><strong>GPU vs CPU</strong></td><td>Large DNNs, embeddings</td><td>Expensive; GBMs are fine on CPU</td></tr>
    <tr><td><strong>Quantization / distillation</strong></td><td>Smaller, faster model</td><td>Small accuracy loss; re-validate</td></tr>
    <tr><td><strong>Horizontal autoscaling</strong></td><td>Add replicas with traffic (on QPS, latency, queue depth)</td><td>Cold start of new pods; keep a warm minimum</td></tr>
    <tr><td><strong>Cascades</strong></td><td>Cheap model first, heavy model on hard cases</td><td>Two models to maintain</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A GPU (or any model call) is like a bus: it costs almost the same to carry 1 passenger or 20. Waiting a moment to fill the bus beats sending 20 autos.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Inference</strong>: computing predictions from a trained model. <strong>Batch inference call</strong>: many rows per call. <strong>Dynamic batching</strong>: a server combining concurrent requests into one model call. <strong>Autoscaling</strong>: adding or removing replicas automatically from a load metric (<a class="xref" data-note="mlops_k8s">Kubernetes</a> HPA).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Autoscaling a GPU model server on CPU usage. CPU can stay low while the GPU is saturated; scale on request queue length or latency instead.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: training-serving skew.</b> Every piece now runs within budget. Biteful launches — and the live late rate is double what offline evaluation promised. No errors, no timeouts. What could make the same model worse live than on paper?</div>

  <h2 id="ss-skew"><span class="num">06</span>Training-Serving Skew</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The model scored MAE 1.66 offline. Live it behaves much worse, and nothing crashes. The model file is identical. What differs, how do we prove it, and how do we prevent it?</p>
  </div>
  <p><strong>Training-serving skew</strong> means the features the model sees live are not the same as the features it trained on. Here is a real way it happens. The training pipeline takes <code>km</code> from completed trips: the <em>road</em> distance the rider drove. The serving team, needing km before any trip exists, writes a quick haversine formula: the <em>straight-line</em> distance between restaurant and door. Roads are 1.2–1.5× longer than the crow flies. Both are called "km".</p>
  <div class="fx" data-lang="py">import numpy as np, lightgbm as lgb

rng = np.random.default_rng(3)
def orders(n):
    straight = np.clip(rng.gamma(2.2, 1.1, n), 0.2, 7)        # straight-line km, restaurant -&gt; door
    road = straight * rng.uniform(1.2, 1.5, n)                  # roads are longer than the crow flies
    queue = rng.poisson(4, n); rain = (rng.random(n) &lt; 0.2).astype(int)
    actual = 12 + road * (3.0 + 2.0 * rain) + 1.3 * queue + rng.gamma(2, 1.5, n)
    return straight, road, queue, rain, actual

# TRAINING pipeline: km taken from completed trips = ROAD distance
s, road, q, rain, y = orders(20_000)
model = lgb.LGBMRegressor(n_estimators=300, n_jobs=1, verbose=-1).fit(np.c_[road, q, rain], y)

# Next week, live traffic
s, road, q, rain, y = orders(5_000)
offline = model.predict(np.c_[road, q, rain])   # what the training-style feature gives
live    = model.predict(np.c_[s, q, rain])      # SERVING code computed km with haversine (straight line)

for name, p in [("offline (road km)", offline), ("live (straight km)", live)]:
    e = y - p
    print(f"{name:&lt;20} MAE {np.abs(e).mean():5.2f}  bias {e.mean():+5.2f}  late {np.mean(e &gt; 0):4.0%}")

# Detect it: compare the km values serving LOGGED with the km values training USED
print(f"\\nmean km  training {road.mean():.2f}   served {s.mean():.2f}   ratio {s.mean()/road.mean():.2f}")
edges = np.quantile(road, np.linspace(0, 1, 11)); edges[0], edges[-1] = -np.inf, np.inf
e_ = np.clip(np.histogram(road, edges)[0] / len(road), 1e-6, None)
a_ = np.clip(np.histogram(s, edges)[0] / len(s), 1e-6, None)
print(f"PSI(served km vs training km) = {np.sum((a_ - e_) * np.log(a_ / e_)):.2f}")</div>
<div class="fx" data-lang="text">offline (road km)    MAE  1.66  bias +0.05  late  42%
live (straight km)   MAE  3.15  bias +2.87  late  84%

mean km  training 3.21   served 2.38   ratio 0.74
PSI(served km vs training km) = 0.19</div>
  <p>Trace the damage:</p>
  <ul>
    <li><strong>Offline</strong> (road km, as in training): MAE 1.66, bias +0.05, 42% late — the model is fine.</li>
    <li><strong>Live</strong> (straight km): the model thinks every trip is shorter, so it promises too little. MAE nearly doubles to 3.15, bias +2.87 minutes, and <strong>84%</strong> of orders arrive late.</li>
    <li><strong>Catch it</strong>: compare the km values serving <em>logged</em> with the km values training used. The served mean is 0.74× the training mean, and PSI = 0.19 (section 04 of <a class="xref" data-note="sd_monitoring">Monitoring</a> explains PSI; 0.1–0.25 means "investigate"). One dashboard line finds a bug that no error log would.</li>
  </ul>
  <table class="tbl">
    <tr><th>Cause</th><th>Biteful example</th><th>Fix</th></tr>
    <tr><td>Two code paths</td><td>Road km in training, straight km in serving</td><td>One feature function, imported by both; or a feature store</td></tr>
    <tr><td>Freshness gap</td><td>Trained on end-of-day queues, served 10-minute-old ones</td><td>Log served features and train on those</td></tr>
    <tr><td>Leakage</td><td>prep_7d joined at today's value (<a class="xref" data-note="sd_framework">framework</a> §06)</td><td>Point-in-time joins</td></tr>
    <tr><td>Missing values</td><td>Online miss returns 0, training had the median 3</td><td>Same default both sides; monitor null rates</td></tr>
    <tr><td>Preprocessing</td><td>Training scaled features, serving forgot</td><td>Ship the whole sklearn <a class="xref" data-note="ml_pipelines">Pipeline</a>, not just the model</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A student practises maths with a calculator set to degrees, then sits the exam with one set to radians. Same student, same knowledge, wrong answers — and nothing tells him why.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Training-serving skew</strong>: a difference between the feature values (or preprocessing) used in training and at serving time. <strong>Log-and-wait</strong>: log the exact features used at prediction time, join the labels when they arrive, and train on those rows, so training matches serving by construction.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Debugging the model when the features are wrong. When live is worse than offline, first compare logged served features with training features for the same entities; most "model problems" are pipeline problems.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: shadow deployment.</b> Skew is fixed and v12 is serving. The team has v13, with a new weather feed. If we switch over and it has a bug like the km one, every customer feels it at once. Can v13 see real traffic without any customer seeing v13?</div>

  <h2 id="ss-shadow"><span class="num">07</span>Shadow Deployment</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Real requests have missing fields, odd cities and 8 pm spikes. A model that was fine on a test file can time out or output nonsense on them. How do we try v2 on real traffic with zero risk to users?</p>
  </div>
  <p><strong>Shadow deployment</strong>: send a copy of every live request to v2 as well. v1 still answers the user; v2's answer is logged and thrown away. You get v2's real latency, errors and outputs on real inputs, and nobody sees them.</p>
  <figure class="viz"><svg viewBox="0 0 720 160" width="720" role="img"><defs><marker id="se-m2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="10" y="50" width="110" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="65" y="76" text-anchor="middle" font-weight="600">Request</text><rect x="160" y="50" width="110" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="215" y="76" text-anchor="middle" font-weight="600">Router</text><rect x="320" y="10" width="160" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="400" y="36" text-anchor="middle" font-weight="600">Prod model v1</text><rect x="320" y="100" width="160" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="400" y="126" text-anchor="middle" font-weight="600">Shadow v2</text><rect x="540" y="10" width="170" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="625" y="36" text-anchor="middle" font-weight="600">Response to user</text><rect x="540" y="100" width="170" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="625" y="119" text-anchor="middle" font-weight="600">Log only</text><text x="625" y="133" text-anchor="middle" class="tm">compare later</text><line x1="122" y1="72" x2="157" y2="72" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m2)"/><line x1="272" y1="66" x2="318" y2="34" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m2)"/><line x1="272" y1="80" x2="318" y2="120" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#se-m2)"/><line x1="482" y1="32" x2="537" y2="32" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m2)"/><line x1="482" y1="122" x2="537" y2="122" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m2)"/><text x="250" y="128" text-anchor="middle" class="tm">copy</text></svg><figcaption>Shadow gets real traffic but its answers are thrown away: zero user risk, real latency and output checks.</figcaption></figure>
  <p>Biteful's v2 reads rain from a new weather feed. We shadow it on 10,000 requests. (The simulation plants the kind of bug shadows exist to find: the new feed has no Mumbai data, the null becomes 0.)</p>
  <div class="fx" data-lang="py">import numpy as np

# Shadow test: every live ETA request also goes to v2; users only ever see v1's answer
rng = np.random.default_rng(0)
n = 10_000
city = rng.choice(["Pune", "Mumbai"], n)
km = np.clip(rng.gamma(2.2, 1.4, n), 0.3, 9); queue = rng.poisson(4, n)
rain = (rng.random(n) &lt; 0.3).astype(int)

v1 = 13.9 + 3.25 * km + 2.42 * queue + 8.7 * rain + rng.normal(0, 1.0, n)
# v2 reads rain from a NEW weather feed. Bug: the feed has no Mumbai data -&gt; null -&gt; filled with 0
rain_v2 = np.where(city == "Mumbai", 0, rain)
v2 = 13.0 + 3.40 * km + 2.30 * queue + 9.0 * rain_v2 + rng.normal(0, 1.0, n)

d = v2 - v1
print(f"overall      mean |v2-v1| {np.abs(d).mean():4.1f} min   differ by &gt;5 min: {np.mean(np.abs(d) &gt; 5):5.1%}")
for c in ["Pune", "Mumbai"]:
    for r in [0, 1]:
        m = (city == c) &amp; (rain == r)
        print(f"{c:&lt;6} rain={r}  mean v2-v1 {d[m].mean():+5.1f} min   differ by &gt;5 min: {np.mean(np.abs(d[m]) &gt; 5):5.1%}  (n={m.sum()})")
lat_v1 = rng.gamma(4, 2.5, n); lat_v2 = rng.gamma(4, 3.5, n)                # ms, ETA service time
print(f"p99 latency  v1 {np.quantile(lat_v1, .99):.0f} ms   v2 {np.quantile(lat_v2, .99):.0f} ms   (budget 60)")</div>
<div class="fx" data-lang="text">overall      mean |v2-v1|  2.7 min   differ by &gt;5 min: 15.9%
Pune   rain=0  mean v2-v1  -0.9 min   differ by &gt;5 min:  0.3%  (n=3464)
Pune   rain=1  mean v2-v1  -0.6 min   differ by &gt;5 min:  0.1%  (n=1506)
Mumbai rain=0  mean v2-v1  -0.9 min   differ by &gt;5 min:  0.4%  (n=3463)
Mumbai rain=1  mean v2-v1  -9.6 min   differ by &gt;5 min: 99.8%  (n=1567)
p99 latency  v1 25 ms   v2 35 ms   (budget 60)</div>
  <p>Read it top to bottom. Overall, v2 is only 2.7 minutes from v1 on average and differs by more than 5 minutes on 15.9% of requests. That could pass as "v2 is a bit different". The <strong>slices</strong> tell the truth: Pune dry, Pune rain and Mumbai dry all move by under a minute, but <strong>Mumbai in rain</strong> is −9.6 minutes, with 99.8% of requests off by more than 5. v2 ignores Mumbai's rain entirely. Latency is fine (p99 35 ms against a 60 ms budget). The rollout stops here, and nobody was ever shown a wrong ETA.</p>
  <ul>
    <li><strong>Proves</strong>: runs at production load, within latency, with sane outputs, by slice.</li>
    <li><strong>Compare</strong>: mean and share of large differences, distributions, by city, weather, new restaurants.</li>
    <li><strong>Cost</strong>: double compute while the shadow runs.</li>
    <li><strong>Can't prove</strong>: user impact (did more people order? fewer complaints?), because users never see v2.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A new cashier at a kirana shop on day one. The owner bills every customer as usual. The new cashier also writes a bill on a notepad, which nobody receives. In the evening the owner compares the two piles, page by page.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Shadow deployment</strong> (dark launch, shadow mode): mirroring live traffic to a candidate whose outputs are logged, not served. <strong>Slice</strong>: a subset of traffic (a city, a weather condition) checked separately.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Shadow calls with side effects: sending an SMS, assigning a rider, writing to the orders table. The shadow path must be read-only. And judging by the overall average only: the Mumbai bug was invisible in "2.7 minutes".</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: canary.</b> Suppose v2 is fixed and the shadow is clean. Users must eventually see it. If it is broken in a way shadow couldn't catch (it affects how users or riders behave), how do we limit how many people are hurt, and undo it fast?</div>

  <h2 id="ss-canary"><span class="num">08</span>Canary &amp; Blue-Green</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The first time real users see v2, we want the number of affected people small and the way back instant. How small, for how long, and what number tells us to stop?</p>
  </div>
  <p><strong>Canary</strong>: send a small share of traffic (here 10%) to v2, the rest to v1. Watch errors and latency. If healthy, widen to 25%, 50%, 100%; if not, shrink to 0%. <strong>Blue-green</strong>: keep two full copies; "blue" serves everyone, "green" has v2 warmed up. Flip the router to move everyone at once, and flip back to roll back instantly. The share of users exposed is the <strong>blast radius</strong>.</p>
  <figure class="viz"><svg viewBox="0 0 720 160" width="720" role="img"><defs><marker id="se-m3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><text x="170" y="16" text-anchor="middle" font-weight="600">Canary: split traffic</text><rect x="10" y="52" width="100" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="60" y="71" text-anchor="middle" font-weight="600">Load</text><text x="60" y="85" text-anchor="middle" class="tm">balancer</text><rect x="170" y="26" width="150" height="40" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="245" y="50" text-anchor="middle" font-weight="600">v1  90%</text><rect x="170" y="92" width="150" height="40" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="245" y="116" text-anchor="middle" font-weight="600">v2  10%</text><line x1="112" y1="68" x2="168" y2="46" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m3)"/><line x1="112" y1="80" x2="168" y2="112" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m3)"/><text x="540" y="16" text-anchor="middle" font-weight="600">Blue-green: switch all at once</text><rect x="380" y="52" width="100" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="430" y="78" text-anchor="middle" font-weight="600">Router</text><rect x="560" y="26" width="150" height="40" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="635" y="50" text-anchor="middle" font-weight="600">Blue v1  live</text><rect x="560" y="92" width="150" height="40" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="635" y="116" text-anchor="middle" font-weight="600">Green v2  idle</text><line x1="482" y1="68" x2="558" y2="46" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m3)"/><line x1="482" y1="80" x2="558" y2="112" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#se-m3)"/><text x="545" y="152" text-anchor="middle" class="tm">flip pointer → instant swap / rollback</text></svg><figcaption>Canary limits blast radius by %, blue-green by having a warm copy to flip back to.</figcaption></figure>
  <p><strong>Worked numbers: how long must the canary run?</strong> Long enough for a real problem to stand out from noise. The ETA service gets 556 requests/s at peak; v1 fails (timeout or error) on 0.1%.</p>
  <ol>
    <li>Canary requests in 10 minutes = 556 × 0.10 × 60 × 10 = <strong>33,360</strong>.</li>
    <li>Errors expected if v2 is as good as v1 = 33,360 × 0.001 ≈ <strong>33.4</strong>.</li>
    <li>If we see 40, or 55, is that bad luck or a real problem? A <strong>binomial test</strong> answers "if the true error rate were still 0.1%, how likely is a count this high?" (<a class="xref" data-note="st_hypothesis">Hypothesis Testing</a>).</li>
  </ol>
  <div class="fx" data-lang="py">from scipy.stats import binomtest

peak_rps = 556             # ETA requests per second at the dinner peak
canary_share = 0.10        # 10% go to v2
minutes = 10
n = int(peak_rps * canary_share * 60 * minutes)
base_err = 0.001           # v1 fails (timeout or 5xx) on 0.1% of requests
print("canary requests in", minutes, "min:", n, "| expected errors at baseline:", round(n * base_err, 1))

for errors in [40, 55, 80]:
    p = binomtest(errors, n, base_err, alternative="greater").pvalue
    verdict = "ROLL BACK" if p &lt; 0.01 else "keep going"
    print(f"errors={errors:&gt;3}  rate={errors/n:.4%}  p={p:.4f}  {verdict}")</div>
<div class="fx" data-lang="text">canary requests in 10 min: 33360 | expected errors at baseline: 33.4
errors= 40  rate=0.1199%  p=0.1443  keep going
errors= 55  rate=0.1649%  p=0.0004  ROLL BACK
errors= 80  rate=0.2398%  p=0.0000  ROLL BACK</div>
  <p>40 errors happen 14% of the time by luck: keep going. 55 errors happen only 0.04% of the time by luck: the canary controller rolls back. The jump is tiny (0.10% → 0.16%); only the volume makes it visible. That is why canaries widen in timed steps, and why a 1% canary for 2 minutes can't see anything.</p>
  <table class="tbl">
    <tr><th></th><th>Shadow</th><th>Canary</th><th>Blue-green</th><th>A/B test</th></tr>
    <tr><td>Goal</td><td>Does it work?</td><td>Is it broken for real users?</td><td>Zero-downtime swap</td><td>Is it better?</td></tr>
    <tr><td>Users exposed</td><td>0%</td><td>1–10%, then widen</td><td>0% → 100% at once</td><td>Fixed split for weeks</td></tr>
    <tr><td>Decided by</td><td>Diffs, slices, latency</td><td>Errors, latency, guardrails</td><td>Smoke tests</td><td>Statistical test on primary metric</td></tr>
    <tr><td>Rollback</td><td>Nothing to roll back</td><td>Shrink to 0%</td><td>Flip back</td><td>End experiment</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Canary: miners carried a canary into coal mines; bad gas hurt the small bird first, warning the miners in time. Blue-green: a wedding caterer keeps a second full kitchen ready; if the first one's gas runs out, service switches in a minute.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Canary release</strong>: exposing a new version to a small, growing share of traffic with automatic rollback. <strong>Blue-green deployment</strong>: two full environments and an instant switch. <strong>Blast radius</strong>: how many users a failure can reach. Rollouts in practice: <a class="xref" data-note="mlops_cicd">CI/CD for ML</a>, <a class="xref" data-note="mlops_k8s">Kubernetes</a>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Calling a canary an A/B test. A canary is too small and too short to measure a 1% change in orders or on-time rate. It answers "is it broken?", not "is it better?" — that is <a class="xref" data-note="sd_experiments">Experiments</a>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> Every piece of the request path on one 20:11 request. After that, two questions remain that serving can't answer: will v12 still be right in July (<a class="xref" data-note="sd_monitoring">Monitoring</a>), and is v13 actually better for customers (<a class="xref" data-note="sd_experiments">Experiments</a>)?</div>

  <h2 id="ss-connect"><span class="num">09</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which serving decision depends on which, and what did each one measure on Biteful?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 700 250" width="700" role="img">
    <defs><marker id="ss-c0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <text x="10" y="16" font-size="12" font-weight="600">One request at 20:11 (Asha, 20 cards)</text>
    <rect x="10" y="28" width="120" height="50" rx="6" class="fb" stroke="currentColor" stroke-opacity=".5"/><text x="70" y="48" text-anchor="middle" font-size="12" font-weight="600">Online mode</text><text x="70" y="65" text-anchor="middle" font-size="10" class="tm">11,111/s peak</text>
    <rect x="150" y="28" width="120" height="50" rx="6" class="fs" stroke="currentColor" stroke-opacity=".5"/><text x="210" y="48" text-anchor="middle" font-size="12" font-weight="600">Cache (60 s)</text><text x="210" y="65" text-anchor="middle" font-size="10" class="tm">73.5% hits</text>
    <rect x="290" y="28" width="120" height="50" rx="6" class="ft" stroke="currentColor" stroke-opacity=".5"/><text x="350" y="48" text-anchor="middle" font-size="12" font-weight="600">Feature fetch</text><text x="350" y="65" text-anchor="middle" font-size="10" class="tm">1 MGET, default 3</text>
    <rect x="430" y="28" width="120" height="50" rx="6" class="fv" stroke="currentColor" stroke-opacity=".5"/><text x="490" y="48" text-anchor="middle" font-size="12" font-weight="600">Model, 20 rows</text><text x="490" y="65" text-anchor="middle" font-size="10" class="tm">0.94 ms batched</text>
    <rect x="570" y="28" width="120" height="50" rx="6" class="fg" stroke="currentColor" stroke-opacity=".5"/><text x="630" y="48" text-anchor="middle" font-size="12" font-weight="600">"41 min"</text><text x="630" y="65" text-anchor="middle" font-size="10" class="tm">36 ms path</text>
    <line x1="130" y1="53" x2="147" y2="53" stroke="currentColor" marker-end="url(#ss-c0)"/>
    <line x1="270" y1="53" x2="287" y2="53" stroke="currentColor" marker-end="url(#ss-c0)"/>
    <line x1="410" y1="53" x2="427" y2="53" stroke="currentColor" marker-end="url(#ss-c0)"/>
    <line x1="550" y1="53" x2="567" y2="53" stroke="currentColor" marker-end="url(#ss-c0)"/>
    <rect x="150" y="110" width="400" height="34" rx="6" class="fr" stroke="currentColor" stroke-opacity=".5"/><text x="350" y="131" text-anchor="middle" font-size="12">Latency budget 60 ms p99: every box above gets a slice</text>
    <line x1="350" y1="80" x2="350" y2="108" stroke="currentColor" stroke-dasharray="4 3"/>
    <rect x="10" y="170" width="200" height="50" rx="6" class="ft" stroke="currentColor" stroke-opacity=".5"/><text x="110" y="190" text-anchor="middle" font-size="12" font-weight="600">Same feature code</text><text x="110" y="207" text-anchor="middle" font-size="10" class="tm">skew: MAE 1.66 vs 3.15</text>
    <rect x="250" y="170" width="200" height="50" rx="6" class="fs" stroke="currentColor" stroke-opacity=".5"/><text x="350" y="190" text-anchor="middle" font-size="12" font-weight="600">Shadow v2</text><text x="350" y="207" text-anchor="middle" font-size="10" class="tm">Mumbai+rain −9.6 min</text>
    <rect x="490" y="170" width="200" height="50" rx="6" class="fs" stroke="currentColor" stroke-opacity=".5"/><text x="590" y="190" text-anchor="middle" font-size="12" font-weight="600">Canary 10%</text><text x="590" y="207" text-anchor="middle" font-size="10" class="tm">55 vs 33.4 → roll back</text>
    <line x1="210" y1="195" x2="247" y2="195" stroke="currentColor" marker-end="url(#ss-c0)"/>
    <line x1="450" y1="195" x2="487" y2="195" stroke="currentColor" marker-end="url(#ss-c0)"/>
    <path d="M350,78 V96 H110 V167" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#ss-c0)"/>
    <text x="350" y="242" text-anchor="middle" font-size="10" class="tm">bottom row: keeping the top row correct (skew) and changing it safely (shadow → canary)</text>
  </svg><figcaption>Top: the request path, each box with its measured number. Bottom: what keeps it honest and what lets it change.</figcaption></figure>
  <table class="tbl"><caption>Every serving concept on Biteful's ETA</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on Biteful</th><th>When to use</th></tr>
    <tr><td>Online serving</td><td>requirements (framework)</td><td>compute now or before?</td><td>2,778/s avg, 11,111 peak vs 20,000/s precompute (13.9% used)</td><td>answer depends on request context</td></tr>
    <tr><td>Streaming features</td><td>Kafka order events</td><td>how fresh is the queue?</td><td>seconds old</td><td>fast-changing aggregates</td></tr>
    <tr><td>Latency budget</td><td>p99 + critical path</td><td>how to spend 60 ms?</td><td>8 + max(12, 15) + 10 + 3 = 36; 24 headroom</td><td>every online system</td></tr>
    <tr><td>Fan-out control</td><td>1 − 0.99<sup>n</sup></td><td>why is the tail worse?</td><td>20 GETs: p99 5.1 → 10.0 ms; 18.0% slow</td><td>many downstream calls</td></tr>
    <tr><td>Feature store</td><td>registry + offline + online</td><td>same values for training and serving?</td><td>Dosa Hut queue 6; Chai Corner default 3</td><td>shared or real-time features</td></tr>
    <tr><td>Cache</td><td>TTL + key with model version</td><td>why recompute?</td><td>60 s: 73.5% hits, +0.20 min</td><td>repeated requests</td></tr>
    <tr><td>Batching</td><td>fixed per-call overhead</td><td>cheaper per row?</td><td>9.67 → 0.94 ms per 20 rows</td><td>always for multi-item requests</td></tr>
    <tr><td>Skew check</td><td>logged served features</td><td>why is live worse?</td><td>MAE 1.66 → 3.15; PSI 0.19</td><td>before and after every launch</td></tr>
    <tr><td>Shadow</td><td>mirrored traffic</td><td>does v2 work on real inputs?</td><td>Mumbai+rain −9.6 min</td><td>every new model or feature</td></tr>
    <tr><td>Canary</td><td>small split + binomial test</td><td>is v2 broken for users?</td><td>33,360 req; 55 errors → p 0.0004</td><td>every rollout</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p><strong>Serving is a chain of budgets: the requirement (online, 60 ms) decides the feature plumbing (streaming + online store + one MGET), caching and batching buy back time, one shared feature definition keeps live inputs equal to training inputs, and shadow then canary let the chain change without users paying for mistakes.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet.</b> After it, <a class="xref" data-note="sd_monitoring">Monitoring</a> asks what happens when the monsoon arrives and the world drifts away from the training data.</div>

  <h2 id="ss-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The note on one page. Running example: Biteful's ETA at 20:11, Asha's feed of 20 cards (Dosa Hut 4 km queue 6 → 41.4 min; Chai Corner new → default queue 3). Model: 13.87 + 3.25·km + 2.42·queue + 8.71·rain. Peak 556 feeds/s = 11,111 ETAs/s; ETA service budget 60 ms p99.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>On Biteful</th><th>Weakness → next</th></tr>
    <tr><td>Batch / online / streaming</td><td>compute when?</td><td>online model, streaming queue, nightly prep_7d</td><td>user waits → budget</td></tr>
    <tr><td>Latency budget</td><td>how to spend 60 ms?</td><td>36 ms critical path; fan-out 18%</td><td>features from where? → feature store</td></tr>
    <tr><td>Feature store</td><td>same values, fast?</td><td>offline + online + MGET + defaults</td><td>repeated work → cache</td></tr>
    <tr><td>Cache</td><td>why recompute?</td><td>60 s TTL: 73.5% hits, +0.20 min</td><td>rest must run → placement</td></tr>
    <tr><td>Placement &amp; batching</td><td>where, how many machines?</td><td>embedded; 20 rows 10× faster</td><td>live ≠ offline → skew</td></tr>
    <tr><td>Skew</td><td>why worse live?</td><td>straight vs road km: MAE 1.66 → 3.15</td><td>release safely → shadow</td></tr>
    <tr><td>Shadow</td><td>does v2 work?</td><td>Mumbai+rain −9.6 min</td><td>no user impact → canary</td></tr>
    <tr><td>Canary</td><td>broken for users?</td><td>55 vs 33.4 → roll back</td><td>better? → experiments</td></tr>
  </table>
  <h3>Formulas and numbers</h3>
  <table class="tbl">
    <tr><th>Formula</th><th>Symbols</th><th>On Biteful</th></tr>
    <tr><td>critical path = sum of sequential steps, max over parallel ones</td><td>steps in ms</td><td>8 + max(12, 15) + 10 + 3 = 36</td></tr>
    <tr><td>P(at least one slow) = 1 − (1 − p)<sup>n</sup></td><td>p = chance one call is slow, n calls</td><td>1 − 0.99<sup>20</sup> = 18.2%</td></tr>
    <tr><td>hit ratio = hits ÷ lookups</td><td>lookups answered from cache</td><td>TTL 60 s: 73.5%</td></tr>
    <tr><td>stale error ≈ coefficient × |Δfeature|</td><td>2.42 min per queue order</td><td>+0.20 min (60 s), +1.52 (300 s)</td></tr>
    <tr><td>canary requests = rps × share × seconds</td><td>rps at peak</td><td>556 × 0.10 × 600 = 33,360</td></tr>
    <tr><td>expected errors = requests × base rate</td><td>base error rate 0.1%</td><td>33.4</td></tr>
    <tr><td>PSI = Σ (a − e) · ln(a / e)</td><td>e training share, a served share per bin</td><td>served vs training km: 0.19</td></tr>
  </table>
  <h3>Definitions</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td>Batch / online serving</td><td>precompute and store / compute per request</td></tr>
    <tr><td>Streaming feature</td><td>kept up to date from an event stream</td></tr>
    <tr><td>p99, critical path, fan-out</td><td>time 99% beat; longest dependent chain; one request calling many</td></tr>
    <tr><td>Feature store (offline, online, registry, materialize)</td><td>history for training; latest for serving; definitions; copy offline → online</td></tr>
    <tr><td>TTL, hit ratio, staleness</td><td>cache lifetime; share served from cache; age of served value</td></tr>
    <tr><td>Embedded / model server / sidecar</td><td>in-process / separate service / same pod</td></tr>
    <tr><td>Training-serving skew</td><td>features or preprocessing differ between training and serving</td></tr>
    <tr><td>Shadow, canary, blue-green</td><td>mirror and log; small growing split; two copies and a switch</td></tr>
  </table>
  <h3>Use / avoid</h3>
  <div class="cards">
    <div><b>Use</b><p>Online serving when the answer depends on the request; streaming for minute-level features; a p99 budget with parallel steps and headroom; one MGET with timeouts and defaults; a TTL cache keyed by model version; batched model calls; one shared feature function and logged served features; shadow with slices, then a canary with a statistical stop rule.</p></div>
    <div><b>Avoid</b><p>Precomputing what nobody asks for; budgeting averages; 20 separate GETs; caches without version or TTL; two implementations of one feature; trusting overall averages in a shadow report; side effects in the shadow path; treating a canary as an A/B test.</p></div>
  </div>
  <h3>Five rapid-fire checks</h3>
  <ol>
    <li>Fetch 12 ms and route 15 ms run in parallel; network 8, model 10, post 3. Critical path? <em>8 + 15 + 10 + 3 = 36 ms.</em></li>
    <li>Each of 20 parallel calls is slow 1% of the time. Share of requests with a slow call? <em>1 − 0.99<sup>20</sup> ≈ 18.2%.</em></li>
    <li>Why not cache ETAs for 5 minutes? <em>85.5% hits but +1.52 min error per lookup: the queue changes too fast.</em></li>
    <li>Offline MAE 1.66, live 3.15, no errors in logs. First check? <em>Compare logged served features with training features (served km was 0.74× training: skew).</em></li>
    <li>Shadow says v2 differs by 2.7 min on average. Ship to canary? <em>Not before slicing: Mumbai in rain was −9.6 min.</em></li>
  </ol>

  <h2 id="ss-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between p50 and p99 latency, and which do you budget?</summary><div class="qa-body">p50 is the median: half of requests finish faster. p99 is the time within which 99% finish. Budget p99, because the slow tail is what users notice, and fan-out makes it worse.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Daily "recommended for you" email to 20M users. Batch or real-time?</summary><div class="qa-body">Batch. The send happens once a day, there is no request context, and scoring everyone in a Spark/Ray job is cheaper than standing up a low-latency service.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why have two feature stores instead of one?</summary><div class="qa-body">Training needs every historical value to rebuild the past (large, scan-friendly, columnar). Serving needs one latest value per key in ~1 ms (small, key-value, in memory). No single store is good and cheap at both.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you build "orders to this kitchen in the last 15 minutes"?</summary><div class="qa-body">A streaming job (Flink, Kafka Streams, Spark Structured Streaming) consumes order events, keeps a 15-minute window count per restaurant, and writes it to the online store. Log the served value so training uses the same numbers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A request fans out to 20 feature lookups, each with p99 = 5 ms. What's the request p99?</summary><div class="qa-body">Higher than 5 ms: the request waits for the slowest. ~18% of requests see at least one slow call; our simulation gave 10.0 ms. Fix with one MGET, hedged requests or timeouts with defaults.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is dynamic batching and its trade-off?</summary><div class="qa-body">The server holds requests for a few ms and runs them as one call. Throughput rises a lot (20 rows: 0.94 ms vs 9.67 ms as 20 calls); each request pays a small queueing delay. Tune max batch size and max wait against the latency budget.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Embedded model vs model server: which for a 500 MB deep ranker used by three services?</summary><div class="qa-body">Model server. It scales on its own GPU pool, is updated once for all callers, and doesn't bloat three apps. Embedded suits small models in one service, like Biteful's ETA GBM.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your ETA model is 1.66 MAE offline and 3.15 live. What do you check first?</summary><div class="qa-body">Training-serving skew: compare logged served feature distributions with training ones for the same orders (mean, PSI). Then leakage in training joins, defaults for missing values and preprocessing differences.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Shadow vs canary: what does each prove?</summary><div class="qa-body">Shadow proves the model runs correctly on real traffic (latency, errors, output sanity by slice) with zero exposure. Canary proves it is safe with a small share of real users. Neither measures the causal business effect; that's the A/B test.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>556 rps, 10% canary, 0.1% baseline errors. Expected errors in 10 minutes, and when do you roll back?</summary><div class="qa-body">33,360 canary requests, 33.4 expected errors. One-sided binomial test against 0.1%: 40 errors gives p ≈ 0.14 (keep going), 55 gives p ≈ 0.0004 (roll back).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When the model times out, what do you return?</summary><div class="qa-body">A fallback that is never blank: the cached ETA if fresh enough, else the baseline 15 + 4 × km. Log the fallback rate as a monitored metric.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the latency budget depend on the framework's back-of-envelope numbers?</summary><div class="qa-body">The numbers said 11,111 predictions/s, 20 per feed, inside a 200 ms page. That fixed the mode (online), the slice (60 ms) and the shape (20 rows per call). Without them you can't tell whether 10 ms of model time is generous or impossible.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how are the feature store and training-serving skew related?</summary><div class="qa-body">Skew is two different computations of "the same" feature; a feature store removes the second computation by giving training (offline store, point-in-time joins) and serving (online store) one definition. It doesn't remove all skew (freshness gaps, defaults), so you still log served features and compare.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you cache ETAs but skip the model version in the key?</summary><div class="qa-body">After a release, users keep seeing the old model's ETAs until entries expire, so a canary or A/B of v2 measures a mix of v1 and v2 and its results are diluted or wrong. Rollback also leaves v2 answers in the cache.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does shadow come before canary, and canary before the A/B test?</summary><div class="qa-body">Each rung is cheaper and safer than the next. Shadow (0 users) catches bugs like the Mumbai rain null; canary (10%) catches breakage that needs real users; only then is it worth spending weeks of split traffic on an A/B test to measure whether v2 is better.</div></details>
</main>`
});
