// notes/systemdesign/sd_serving.js — Feature Stores & Online/Offline Serving
Object.assign(TOPIC_CONTENT, {
  "sd_serving": `<main>
<h1>Feature Stores &amp; Online/Offline Serving</h1>
  <div class="where"><span>ML System Design</span><span>Serving</span></div>
  <p class="lead">A trained model sitting in a file on a laptop helps nobody. <strong>Serving</strong> is everything that happens between "the model is trained" and "the right number appears on a user's screen in time": deciding when predictions are computed, getting fresh feature values to the model in a few milliseconds, making sure those values mean exactly what they meant during training, and swapping in a new model version without hurting anyone. Most ML systems that fail in production fail here, not in the training notebook, and interviewers spend a large part of every ML system design round on it. The running example is the one from <a class="xref" data-note="sd_framework">How to Approach ML System Design</a>: Biteful, a food delivery app, shows an estimated delivery time ("34 min") on every restaurant card. When Asha opens the app at 20:11, her feed has 20 cards, the ETA service gets 60 ms of the page's 200 ms, and at the dinner peak it must produce about 11,111 ETAs a second. Every idea on this page is added to that one request.</p>

  <h2 id="ss-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Serving Biteful's ETA</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">When and how fast</div>
        <ul>
          <li><b>Batch</b> precomputes; <b>online</b> computes per request; <b>streaming</b> keeps features fresh</li>
          <li>Budget the <b>p99</b>, not the mean; critical path = sequential steps + slowest parallel step</li>
          <li><b>Fan-out</b>: 20 parallel calls, 1 − 0.99<sup>20</sup> = 18% hit a slow one</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Features</div>
        <ul>
          <li><b>Offline</b>: full history with timestamps (training)</li>
          <li><b>Online</b>: latest value per key, ~1 ms (serving)</li>
          <li><b>Point-in-time join</b>: only values known at prediction time</li>
          <li><b>Feature store</b>: one definition, both stores (Feast, Tecton)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Running the model</div>
        <ul>
          <li><b>Cache</b> with a TTL; key includes model version</li>
          <li>Embedded, model server, sidecar or batch job</li>
          <li><b>Batch rows</b> per call; dynamic batching on GPUs</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Staying correct</div>
        <ul>
          <li><b>Skew</b>: training and serving compute a feature differently</li>
          <li>Detect by comparing logged served features with training ones</li>
          <li><b>Shadow</b> (0 users) → <b>canary</b> (small %) → A/B test</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ss-modes"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Batch, Online and Streaming Serving</span><span class="rm-sub">compute in advance, or when asked?</span></div></div>
      <div class="rm-item rm-done" data-target="ss-latency"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Latency Budgets and Percentiles</span><span class="rm-sub">how to spend 60 ms, and why the average lies</span></div></div>
      <div class="rm-item rm-done" data-target="ss-features"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Online and Offline Features</span><span class="rm-sub">history for training, latest value for serving</span></div></div>
      <div class="rm-item rm-done" data-target="ss-pit"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Point-in-Time Correct Joins</span><span class="rm-sub">a naive join leaks the future, shown for real</span></div></div>
      <div class="rm-item rm-done" data-target="ss-fs"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Feature Stores</span><span class="rm-sub">one definition, two stores, with real Feast</span></div></div>
      <div class="rm-item rm-done" data-target="ss-cache"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Caching</span><span class="rm-sub">hit ratio against staleness</span></div></div>
      <div class="rm-item rm-done" data-target="ss-run"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Where the Model Runs</span><span class="rm-sub">placement, batching and scaling</span></div></div>
      <div class="rm-item rm-done" data-target="ss-skew"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Training-Serving Skew</span><span class="rm-sub">same model, worse live, reproduced</span></div></div>
      <div class="rm-item rm-done" data-target="ss-shadow"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Shadow Deployment</span><span class="rm-sub">real traffic, nobody sees the answer</span></div></div>
      <div class="rm-item rm-done" data-target="ss-canary"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Canary and Blue-Green Releases</span><span class="rm-sub">a few users first, and a fast way back</span></div></div>
      <div class="rm-item rm-done" data-target="ss-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">defaults, cache keys, averages</span></div></div>
      <div class="rm-item rm-done" data-target="ss-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, numbers, comparisons</span></div></div>
      <div class="rm-item rm-done" data-target="ss-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">serving questions from ML system design rounds</span></div></div>
    </div>
  </div>

  <h2 id="ss-modes"><span class="num">01</span>Batch, Online and Streaming Serving</h2>
  <p>The first serving decision is about time: should Biteful compute ETAs before anyone asks for them, or at the moment Asha opens the app? It sounds like a detail, but it decides the cost of the system, how fresh its answers are, and how much engineering it needs. There are three basic patterns, and real systems usually mix them.</p>
  <p>In <strong>batch serving</strong>, a scheduled job scores every possible input at once and saves the results in a fast <strong>key-value store</strong>, a database that returns a value for a given key in about a millisecond (Redis is the common one). The app never runs the model; it only looks the answer up. In <strong>online serving</strong> (also called real-time serving), nothing is prepared in advance: when a request arrives, the service fetches the features, runs the model and replies. All of that work sits on the <strong>request path</strong>, meaning the user is waiting while it happens. The third pattern, <strong>streaming</strong>, is not a way of running the model but a way of keeping features fresh: a job reads events as they happen (order placed, order picked up) from an event stream such as <a class="xref" data-note="de_kafka">Kafka</a> and updates a feature like "orders currently waiting in this kitchen" every few seconds, so online serving can read a value that is barely old.</p>
  <p>Think of a tiffin service and a dhaba. The tiffin service cooks 500 identical lunches in the morning; handing one out takes a second, but nobody gets anything made for them, and if it rains and half the customers stay home the food is wasted. That is batch. The dhaba cooks each dish when you order it; it is fresh and made for you, but the cook has to be fast because you are sitting there. That is online. The boy who keeps shouting the latest count of waiting customers to the cook is the streaming job.</p>
  <figure class="viz"><svg viewBox="0 0 740 168" width="740" role="img"><defs><marker id="ss-m1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><text x="10" y="16" text-anchor="start" class="tb" font-weight="600">Batch: precompute for everyone</text><rect x="10" y="24" width="155" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="87.5" y="43" text-anchor="middle" font-weight="600">Scheduler</text><text x="87.5" y="57" text-anchor="middle" class="tm">nightly</text><rect x="199" y="24" width="155" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="276.5" y="43" text-anchor="middle" font-weight="600">Batch job</text><text x="276.5" y="57" text-anchor="middle" class="tm">score all inputs</text><rect x="388" y="24" width="155" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="465.5" y="43" text-anchor="middle" font-weight="600">Key-value store</text><text x="465.5" y="57" text-anchor="middle" class="tm">predictions</text><rect x="577" y="24" width="155" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="654.5" y="43" text-anchor="middle" font-weight="600">App lookup</text><text x="654.5" y="57" text-anchor="middle" class="tm">~5 ms</text><line x1="167" y1="46" x2="196" y2="46" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m1)"/><line x1="356" y1="46" x2="385" y2="46" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m1)"/><line x1="545" y1="46" x2="574" y2="46" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m1)"/><text x="10" y="100" text-anchor="start" class="tb" font-weight="600">Online: compute per request</text><rect x="10" y="108" width="155" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="87.5" y="134" text-anchor="middle" font-weight="600">User request</text><rect x="199" y="108" width="155" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="276.5" y="127" text-anchor="middle" font-weight="600">Feature fetch</text><text x="276.5" y="141" text-anchor="middle" class="tm">online store</text><rect x="388" y="108" width="155" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="465.5" y="127" text-anchor="middle" font-weight="600">Model</text><text x="465.5" y="141" text-anchor="middle" class="tm">predict</text><rect x="577" y="108" width="155" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="654.5" y="127" text-anchor="middle" font-weight="600">Response</text><text x="654.5" y="141" text-anchor="middle" class="tm">~50 ms</text><line x1="167" y1="130" x2="196" y2="130" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m1)"/><line x1="356" y1="130" x2="385" y2="130" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m1)"/><line x1="545" y1="130" x2="574" y2="130" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m1)"/></svg><figcaption>Batch takes the model off the request path. Online pays latency in exchange for using this request's context.</figcaption></figure>
  <p>The figure shows the difference in what the user waits for. In the top row the scheduler, batch job and model all run long before the request; when Asha opens the app, the only thing on the request path is a key lookup of a few milliseconds. In the bottom row the request itself sets off a feature fetch and a model call, so she waits for both. Batch is clearly faster at request time, so why not always batch? The answer is cost and freshness, and the way to find out is to count, as an interviewer would expect you to. Biteful has 20,000 restaurants, each delivering to about 300 small map cells, and 12 million feed loads a day:</p>
  <div class="fx" data-lang="py"># Three ways to get an ETA onto Asha's screen, costed for Biteful
DAY = 86_400
restaurants, cells = 20_000, 300          # each restaurant delivers to ~300 map cells (8 km)
pairs = restaurants * cells

# (a) Batch: score every (restaurant, cell) pair nightly, store, look up
print(f"(a) nightly batch : {pairs/1e6:.0f} M predictions/day, values up to 24 h old")

# (b) Near-real-time batch: re-score every pair every 5 minutes
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
  <p>Read the three lines in turn. A nightly batch is cheap, 6 million predictions a day, but tonight's kitchen queue at Dosa Hut did not exist last night, so a nightly ETA would ignore the single most important input. Re-scoring every pair every 5 minutes keeps values fairly fresh, but it burns 20,000 predictions every second, all day, and only 13.9% of them are ever looked at by anyone; the rest are pairs like "a restaurant in Hadapsar to an empty field at 4 am". Online serving computes only what is actually requested, 2,778 predictions a second on average and 11,111 at peak, about a seventh of the precompute work. The price is that the user waits, which is the subject of the next section.</p>
  <p>So Biteful runs the ETA model <strong>online</strong>, keeps the kitchen queue fresh with <strong>streaming</strong>, and computes slow-moving features such as a restaurant's average preparation time over the last seven days (<code>prep_7d</code>) in a nightly <strong>batch</strong> job. That mix is normal. The question that decides each piece is simple: does the answer depend on something that exists only at request time, such as this delivery address, this minute's queue or this payment? If yes, compute online. If no, batch is cheaper and simpler, which is why daily "recommended for you" emails and demand forecasts are batch jobs.</p>
  <table class="tbl">
    <tr><th></th><th>Batch</th><th>Online</th><th>Streaming features</th></tr>
    <tr><td>When computed</td><td>On a schedule, for every entity</td><td>Per request</td><td>Per event, continuously</td></tr>
    <tr><td>Freshness</td><td>Hours old</td><td>Uses this request's context</td><td>Seconds old</td></tr>
    <tr><td>Latency at read time</td><td>A key lookup (~ms)</td><td>Feature fetch + model time</td><td>A key lookup (~ms)</td></tr>
    <tr><td>Main cost</td><td>Work wasted on things nobody asks for</td><td>Latency; servers sized for peak</td><td>An always-on stream job</td></tr>
    <tr><td>Biteful examples</td><td>prep_7d, emails, demand forecasts</td><td>ETA, fraud check, feed ranking</td><td>Kitchen queue, rider supply</td></tr>
  </table>

  <h2 id="ss-latency"><span class="num">02</span>Latency Budgets and Percentiles</h2>
  <p>Choosing online serving means Asha waits while Biteful fetches features, asks the route engine for road distances and runs the model, for 20 cards at once. The whole feed must load in 200 ms, and the ETA service gets 60 ms of that. If every team working on one of those steps takes "as long as it needs", the total quietly grows past 60 ms and the page feels slow. To prevent that, we need to agree what "how long" means and then share out the time.</p>
  <p><strong>Latency</strong> is the time from sending a request to receiving the answer, measured in milliseconds. The tricky part is that latency is not one number: the same service answers some requests in 5 ms and others in 120 ms, depending on garbage-collection pauses, a slow database call or a busy machine. So we describe it with <strong>percentiles</strong>. The p99 (99th percentile) latency is the time within which 99 out of 100 requests finish; the p50 is the median, the time half the requests beat. Imagine 100 runners finishing a race: the p50 is the time of the 50th finisher and the p99 the time of the 99th. Here is why the average is the wrong number to watch:</p>
  <div class="fx" data-lang="py">import numpy as np

# 10,000 ETA requests: most are quick, about 2% hit a slow Redis call or a pause
rng = np.random.default_rng(7)
lat = rng.gamma(4, 2.5, 10_000)                       # typical requests: around 10 ms
slow = rng.random(10_000) &lt; 0.02
lat[slow] += rng.uniform(40, 120, slow.sum())         # the unlucky ones

print(f"mean  {lat.mean():6.1f} ms")
for q in [50, 90, 95, 99, 99.9]:
    print(f"p{q:&lt;5}{np.percentile(lat, q):6.1f} ms")
print(f"max   {lat.max():6.1f} ms")

# A percentile by hand: sort, then read the value 99% of the way along
s = np.sort(lat)
print(f"\n9,900th of 10,000 sorted values: {s[9_899]:.1f} ms")
print(f"share of requests slower than the mean: {np.mean(lat &gt; lat.mean()):.0%}")</div>
  <div class="fx" data-lang="text">mean    11.5 ms
p50      9.3 ms
p90     17.5 ms
p95     21.1 ms
p99     88.8 ms
p99.9  126.6 ms
max    139.3 ms

9,900th of 10,000 sorted values: 88.8 ms
share of requests slower than the mean: 34%</div>
  <p>The mean is 11.5 ms and the median 9.3 ms, which both sound excellent. But the p99 is 88.8 ms, eight times the mean, because about 2% of requests hit something slow. The middle block shows what a percentile actually is: sort all 10,000 latencies and read the 9,900th value, which is exactly the 88.8 ms numpy reported. And the last line explains why the average misleads: the few very slow requests pull the mean up, yet 66% of requests are faster than it and the slow ones are hidden inside it. Users do not experience averages; a heavy user who loads the feed 50 times a day will meet the slow tail every single day. That is why services are designed and monitored against their p99 (sometimes p99.9), not their mean.</p>
  <p>A <strong>latency budget</strong> gives each step on the request path a fixed slice of the p99 target before anyone writes code, the way a household divides its monthly salary into rent, food and savings. Two more ideas make the budget work. The <strong>critical path</strong> is the longest chain of steps that must happen one after another; steps that do not need each other's results can run at the same time, and then only the slower of them counts. <strong>Fan-out</strong> is when one request calls many downstream services or keys at once; the request can only finish when the slowest call finishes. The code splits the 60 ms and then simulates fetching 20 restaurants' features with 20 separate calls:</p>
  <div class="fx" data-lang="py">import numpy as np

# The ETA service's 60 ms p99 slice of the 200 ms feed, split per step (ms)
budget = {"network in+out": 8, "feature fetch (Redis)": 12, "route engine (km x20)": 15,
          "model (20 rows)": 10, "post-process": 3}
for k, v in budget.items():
    print(f"{k:&lt;32}{v:&gt;4} ms")
used = sum(budget.values())
print(f"{'sum if run one after another':&lt;32}{used} ms, headroom {60 - used} ms")
# feature fetch and route engine don't need each other's answers: run them in parallel
crit = (budget["network in+out"] + max(budget["feature fetch (Redis)"], budget["route engine (km x20)"])
        + budget["model (20 rows)"] + budget["post-process"])
print(f"{'critical path, parallel fetch':&lt;32}{crit} ms, headroom {60 - crit} ms")

# Fan-out: 20 separate Redis GETs in parallel. Each call is mostly ~1 ms, sometimes slow.
rng = np.random.default_rng(0)
calls = rng.lognormal(mean=0.0, sigma=0.7, size=(100_000, 20))    # ms, 100k simulated requests
single_p99 = np.quantile(calls[:, 0], 0.99)
print(f"\none GET:   p50 {np.median(calls[:, 0]):.1f} ms  p99 {single_p99:.1f} ms")
slowest = calls.max(axis=1)                    # the request waits for the slowest of its 20 calls
print(f"20 GETs:   p50 {np.median(slowest):.1f} ms  p99 {np.quantile(slowest, 0.99):.1f} ms")
print(f"requests with at least one call above the single-call p99: {np.mean(slowest &gt; single_p99):.1%}")
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
requests with at least one call above the single-call p99: 18.0%
theory 1 - 0.99**20 = 18.2%</div>
  <p>Added end to end, the five steps take 48 ms and leave 12 ms of headroom. But the feature fetch and the route engine do not depend on each other, so they run in parallel, and the request waits only for the slower one: 8 + max(12, 15) + 10 + 3 = 36 ms, leaving 24 ms of headroom for bad days. The figure below draws exactly this.</p>
  <figure class="viz"><svg viewBox="0 0 680 150" width="680" role="img"><rect x="40" y="40" width="80" height="60" rx="3" class="fs" stroke="currentColor" stroke-opacity=".45"/><text x="80.0" y="74.0" text-anchor="middle" font-size="11">network</text><rect x="120" y="40" width="150" height="29" rx="3" class="ft" stroke="currentColor" stroke-opacity=".45"/><text x="195.0" y="58.5" text-anchor="middle" font-size="11">route km 15</text><rect x="120" y="71" width="120" height="29" rx="3" class="ft" stroke="currentColor" stroke-opacity=".45"/><text x="180.0" y="89.5" text-anchor="middle" font-size="11">fetch 12</text><rect x="270" y="40" width="100" height="60" rx="3" class="fv" stroke="currentColor" stroke-opacity=".45"/><text x="320.0" y="74.0" text-anchor="middle" font-size="11">model 10</text><rect x="370" y="40" width="30" height="60" rx="3" class="fs" stroke="currentColor" stroke-opacity=".45"/><text x="385.0" y="74.0" text-anchor="middle" font-size="11">3</text><rect x="400" y="40" width="240" height="60" rx="3" class="fg" stroke="currentColor" stroke-opacity=".45"/><text x="520.0" y="74.0" text-anchor="middle" font-size="11">headroom 24</text><line x1="40" y1="30" x2="40" y2="108" stroke="currentColor" stroke-opacity=".35"/><text x="40" y="24" text-anchor="middle" font-size="10" class="tm">0</text><line x1="120" y1="30" x2="120" y2="108" stroke="currentColor" stroke-opacity=".35"/><text x="120" y="24" text-anchor="middle" font-size="10" class="tm">8</text><line x1="270" y1="30" x2="270" y2="108" stroke="currentColor" stroke-opacity=".35"/><text x="270" y="24" text-anchor="middle" font-size="10" class="tm">23</text><line x1="370" y1="30" x2="370" y2="108" stroke="currentColor" stroke-opacity=".35"/><text x="370" y="24" text-anchor="middle" font-size="10" class="tm">33</text><line x1="400" y1="30" x2="400" y2="108" stroke="currentColor" stroke-opacity=".35"/><text x="400" y="24" text-anchor="middle" font-size="10" class="tm">36</text><line x1="640" y1="30" x2="640" y2="108" stroke="currentColor" stroke-opacity=".35"/><text x="640" y="24" text-anchor="middle" font-size="10" class="tm">60</text><text x="40" y="128" font-size="11">critical path 36 ms = 8 + max(15, 12) + 10 + 3; the two teal steps run in parallel</text><text x="40" y="144" font-size="10" class="tm">ms of the ETA service's 60 ms p99 slice (the whole feed has 200 ms)</text></svg><figcaption>The ETA service's 60 ms budget. Fetch and route overlap, so the model starts at 23 ms, not 35.</figcaption></figure>
  <p>Time runs left to right. The network takes the first 8 ms. Then the two teal bars start together: the route engine finishes at 23 ms and the feature fetch earlier, at 20 ms, so the model can start at 23 ms. The model ends at 33, post-processing at 36, and everything from 36 to 60 is headroom.</p>
  <p>Now the second half of the output, the fan-out. A single Redis GET has a p50 of 1.0 ms and a p99 of 5.1 ms. With 20 GETs in parallel, the request waits for the slowest of the 20, so its median rises to 3.6 ms and its p99 to 10.0 ms. In 18.0% of requests at least one of the 20 calls was slower than the single-call p99, almost exactly the 1 − 0.99<sup>20</sup> = 18.2% the formula predicts: if each call has a 1% chance of being slow, the chance that none of 20 is slow is 0.99<sup>20</sup>. Fan-out turns one call's rare bad luck into a common event. The cures are to make fewer calls (one <strong>MGET</strong>, Redis's "get many keys in one round trip", instead of 20 GETs), to put a timeout on every call with a sensible default value when it expires, and to define a <strong>fallback</strong> for the whole service: if the model times out, show the simple baseline 15 + 4 × km minutes, because a rough ETA is better than a blank card.</p>

  <h2 id="ss-features"><span class="num">03</span>Online and Offline Features</h2>
  <p>The budget gave "feature fetch" 12 ms. Now we need to look at where the features actually come from, because the ETA model uses three very different kinds. The road distance <code>km</code> and whether it is raining are <strong>request-time features</strong>: they can only be computed when the request arrives, from this address and this minute's weather. The kitchen queue is a <strong>streaming feature</strong>, updated every few seconds from order events. And <code>prep_7d</code> is a <strong>batch feature</strong>, recomputed once a night. Whatever their source, every feature is needed by two very different consumers.</p>
  <p>The training job needs the <em>history</em> of each feature: for every past order in the last six months, what was Dosa Hut's queue at the moment that order was placed? It reads millions of rows, once a week, and does not mind waiting minutes. The serving path needs only the <em>latest</em> value of each feature, for 20 restaurants, in about a millisecond. No single database is good at both, so features are kept in two shapes. The <strong>offline store</strong> holds every value ever computed together with the time it became true; it is usually a warehouse table or Parquet files, big, slow and cheap. The <strong>online store</strong> holds only the current value per key, usually in Redis or DynamoDB, small and fast. A school works the same way: the office keeps the full register of every term's marks for report cards, while the notice board shows only each student's latest result so anyone can check it in a second.</p>
  <p>The code below builds both shapes from the same queue values. Copying the latest values from the offline history into the online store is called <strong>materialization</strong>. Then it serves Asha's 20:11 request, including a restaurant that opened today and therefore has no queue value at all:</p>
  <div class="fx" data-lang="py">import pandas as pd

# OFFLINE features: every value ever computed, with the time it became true (for training)
offline = pd.DataFrame({
    "restaurant": ["Dosa Hut", "Dosa Hut", "Biryani Bros", "Pizza Point", "Dosa Hut", "Biryani Bros"],
    "ts": pd.to_datetime(["20:00", "20:05", "20:05", "20:05", "20:10", "20:10"], format="%H:%M"),
    "queue": [4, 5, 7, 1, 6, 8]})

# ONLINE features: only the latest value per key (a dict here, Redis in production)
online = {}
for r in offline.sort_values("ts").itertuples():
    online[f"queue:{r.restaurant}"] = r.queue
print("online store:", online)

DEFAULT_QUEUE = 3            # the median queue - the SAME fill value training used

def get_online_features(restaurants):
    keys = [f"queue:{r}" for r in restaurants]
    values = [online.get(k) for k in keys]                 # in Redis: ONE MGET for all keys
    return {r: (v if v is not None else DEFAULT_QUEUE) for r, v in zip(restaurants, values)}

# Asha opens the feed at 20:11. km and rain are REQUEST-TIME features: known only now.
feed = ["Dosa Hut", "Biryani Bros", "Pizza Point", "Chai Corner"]       # Chai Corner opened today
km = {"Dosa Hut": 4.0, "Biryani Bros": 3.0, "Pizza Point": 6.0, "Chai Corner": 2.0}   # route engine
rain = 0                                                                # weather API, right now
q = get_online_features(feed)
for r in feed:
    eta = 13.87 + 3.25 * km[r] + 2.42 * q[r] + 8.71 * rain             # the framework note's model
    print(f"{r:&lt;13} km={km[r]}  queue={q[r]}  ETA={eta:.1f} min")</div>
  <div class="fx" data-lang="text">online store: {'queue:Dosa Hut': 6, 'queue:Biryani Bros': 8, 'queue:Pizza Point': 1}
Dosa Hut      km=4.0  queue=6  ETA=41.4 min
Biryani Bros  km=3.0  queue=8  ETA=43.0 min
Pizza Point   km=6.0  queue=1  ETA=35.8 min
Chai Corner   km=2.0  queue=3  ETA=27.6 min</div>
  <p>The offline table has six rows: Dosa Hut's queue went 4, 5, 6 between 20:00 and 20:10. The materialization loop walks through the rows in time order and keeps overwriting, so the online store ends up holding only the latest value for each restaurant: <code>queue:Dosa Hut</code> is 6. When the request arrives, <code>get_online_features</code> builds four keys and reads them together, which in Redis is one MGET. Chai Corner has no key, so it receives the <strong>default value</strong> 3. That default is not arbitrary: it must be the same value the training pipeline used to fill missing queues (here, the median), otherwise the model sees a number at serving time that means something different from what it learnt. Finally the model, the linear formula from the framework note, combines the fetched queue with the request-time features: Dosa Hut is 13.87 + 3.25 × 4 + 2.42 × 6 = 41.4 minutes.</p>
  <p>This tiny program contains the whole architecture of feature serving, but it hides one dangerous question. The serving path asks "what is the queue <em>now</em>?", which is easy. The training path asks "what was the queue <em>then</em>?" for every past order, and answering that carelessly is one of the most common bugs in machine learning.</p>

  <h2 id="ss-pit"><span class="num">04</span>Point-in-Time Correct Joins</h2>
  <p>To build a training set, we take a table of past orders (each with its timestamp and its actual delivery time, the label) and attach the feature values that belong to each order. Attaching columns from one table to another is a <strong>join</strong>. The danger is attaching a value that was computed <em>after</em> the order, using information the model could never have at prediction time. This is called <strong>data leakage</strong> (or label leakage, when the leaked information includes the answer itself), and it is dangerous precisely because it makes the model look better in testing, not worse.</p>
  <p>Here is a concrete case. Biteful computes each restaurant's average delivery time at the end of every day. On 14 July Dosa Hut was short-staffed and its average was 47.5 minutes. The obvious way to attach this feature to orders is to join on restaurant and date. Watch what that does, compared with a <strong>point-in-time correct join</strong>, which attaches to each order the most recent feature value that already existed when the order was placed:</p>
  <div class="fx" data-lang="py">import pandas as pd

# Feature table: Dosa Hut's average delivery time, recomputed at the END of each day
daily = pd.DataFrame({
    "restaurant": ["Dosa Hut"] * 3,
    "date": pd.to_datetime(["2026-07-13", "2026-07-14", "2026-07-15"]),
    "avg_delivery_min": [34.0, 47.5, 36.0]})          # 14 July was a bad day: the kitchen was short-staffed
daily["valid_from"] = daily["date"] + pd.Timedelta(days=1)   # a day's value exists only after midnight

# Training rows: past orders, each with the moment the ETA was shown
orders = pd.DataFrame({
    "order_id": [101, 102, 103],
    "restaurant": ["Dosa Hut"] * 3,
    "ts": pd.to_datetime(["2026-07-14 12:30", "2026-07-14 20:05", "2026-07-15 13:10"]),
    "actual_min": [44, 51, 35]})
orders["date"] = orders["ts"].dt.normalize()

# NAIVE join on (restaurant, date): picks the value computed at the end of the SAME day
naive = orders.merge(daily[["restaurant", "date", "avg_delivery_min"]], on=["restaurant", "date"])
print("naive join\n", naive[["order_id", "ts", "actual_min", "avg_delivery_min"]].to_string(index=False))

# POINT-IN-TIME join: the latest value whose valid_from is at or before the order time
pit = pd.merge_asof(orders.sort_values("ts"),
                    daily[["restaurant", "valid_from", "avg_delivery_min"]].sort_values("valid_from"),
                    left_on="ts", right_on="valid_from", by="restaurant", direction="backward")
print("\npoint-in-time join\n", pit[["order_id", "ts", "actual_min", "avg_delivery_min"]].to_string(index=False))</div>
  <div class="fx" data-lang="text">naive join
  order_id                  ts  actual_min  avg_delivery_min
      101 2026-07-14 12:30:00          44              47.5
      102 2026-07-14 20:05:00          51              47.5
      103 2026-07-15 13:10:00          35              36.0

point-in-time join
  order_id                  ts  actual_min  avg_delivery_min
      101 2026-07-14 12:30:00          44              34.0
      102 2026-07-14 20:05:00          51              34.0
      103 2026-07-15 13:10:00          35              47.5</div>
  <p>Look at order 101, placed at 12:30 on 14 July. The naive join gives it 47.5, the average of 14 July. But at 12:30 the day was not over; that 47.5 was computed at midnight from every order of the day, <em>including order 101's own 44-minute delivery</em> and the 51-minute order 102 that had not even been placed yet. The feature contains the answer. The point-in-time join uses <code>valid_from</code>, the moment each value became available (midnight after the day it describes), and pandas' <code>merge_asof</code>, which for every order finds the latest feature row whose timestamp is at or before the order's timestamp. Order 101 gets 34.0, the value from 13 July, which really was the newest number available at 12:30. Order 103 on 15 July gets 47.5, because by then 14 July's average truly existed.</p>
  <p>It is like a student who is allowed to study last year's question paper, compared with one who has been handed this year's paper the night before. The second student scores brilliantly in the mock exam and badly in the real one. To see how much this matters, the next program builds a realistic history: 200 restaurants over 60 days, where each restaurant-day has a "kitchen mood" (staff, rush) that partly carries into the next day. It trains one model on the naive join and one on the point-in-time join, then tests both on the last 15 days:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd, lightgbm as lgb

rng = np.random.default_rng(4)
R, D, per_day = 200, 60, 25                      # 200 restaurants, 60 days, 25 orders each per day
# Each restaurant-day has its own "kitchen mood" (staffing, rush) that partly carries into the next day
mood = np.zeros((R, D))
for d in range(1, D):
    mood[:, d] = 0.5 * mood[:, d - 1] + rng.normal(0, 5, R)

rows = []
for r in range(R):
    base = rng.normal(0, 3)
    for d in range(D):
        km = np.clip(rng.gamma(2.2, 1.4, per_day), 0.3, 9)
        actual = 20 + 3 * km + base + mood[r, d] + rng.normal(0, 3, per_day)
        rows.append(pd.DataFrame({"r": r, "day": d, "km": km, "actual": actual}))
orders = pd.concat(rows, ignore_index=True)

# Daily feature: each restaurant's average delivery time, computed at the end of each day
daily = orders.groupby(["r", "day"], as_index=False)["actual"].mean().rename(columns={"actual": "avg_day"})
naive = orders.merge(daily, on=["r", "day"])                          # same day's value: includes the future
pit = orders.merge(daily.assign(day=daily.day + 1), on=["r", "day"])  # yesterday's value: known at order time

def fit(df):
    return lgb.LGBMRegressor(n_estimators=200, verbose=-1, random_state=0).fit(df[["km", "avg_day"]], df.actual)

def mae(model, df):
    return np.abs(df.actual - model.predict(df[["km", "avg_day"]])).mean()

tr, te = (lambda d: d[d.day &lt; 45]), (lambda d: d[d.day &gt;= 45])
leaky = fit(tr(naive))
honest = fit(tr(pit))
print(f"leaky model,  offline test (leaky features) : MAE {mae(leaky, te(naive)):.2f} min")
print(f"leaky model,  live (features known at the time): MAE {mae(leaky, te(pit)):.2f} min")
print(f"honest model, offline test = live            : MAE {mae(honest, te(pit)):.2f} min")</div>
  <div class="fx" data-lang="text">leaky model,  offline test (leaky features) : MAE 2.52 min
leaky model,  live (features known at the time): MAE 5.28 min
honest model, offline test = live            : MAE 4.85 min</div>
  <p>Three numbers tell the whole story. The leaky model, evaluated the way its own pipeline would evaluate it (with leaky features in the test set too), reports an MAE (mean absolute error) of 2.52 minutes. That is the number that goes into the launch slide. But in production, serving can only supply yesterday's average, because today's does not exist yet; fed those honest values, the same model's error is 5.28 minutes, more than double. The honest model, trained on point-in-time values from the start, scores 4.85, and that number is the same offline and live because nothing it uses is from the future. Notice the twist: the leaky model is not just over-promised, it is actually <em>worse</em> live than the honest one, because it learnt to lean almost entirely on a feature that is far less informative in real life than it was during training.</p>
  <p>The rule that follows is simple to say and easy to break: every feature in a training row must be computed only from data that was available at that row's prediction time. In practice this means storing a timestamp with every feature value (when it became true, not when the job happened to run), joining with an "as of" join like <code>merge_asof</code> rather than an equality join on date, and being suspicious of any offline result that looks much better than expected. Doing this correctly at scale, over billions of rows and hundreds of features, is the main reason feature stores exist.</p>

  <h2 id="ss-fs"><span class="num">05</span>Feature Stores</h2>
  <p>So far we have built three things by hand: an offline history, an online latest-value store with a materialization loop, and a point-in-time join. In a company with one model this is fine. With twenty models and ten teams, each team writes its own version of "kitchen queue", with its own SQL, its own default value and its own join, and the versions drift apart. A <strong>feature store</strong> is a system that defines each feature once and then provides all three pieces from that single definition: an offline store with point-in-time joins for training, an online store for serving, and the materialization job that keeps them in sync. A <strong>registry</strong> holds the definitions (name, entity, source, owner, how long a value stays valid) so other teams can find and reuse them.</p>
  <figure class="viz"><svg viewBox="0 0 740 236" width="740" role="img"><defs><marker id="ss-m3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="190" y="4" width="350" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="365" y="22" text-anchor="middle" font-weight="600">Registry: one feature definition for both paths</text><rect x="10" y="60" width="140" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="80" y="79" text-anchor="middle" font-weight="600">Warehouse</text><text x="80" y="93" text-anchor="middle" class="tm">batch tables</text><rect x="10" y="160" width="140" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="80" y="179" text-anchor="middle" font-weight="600">Event stream</text><text x="80" y="193" text-anchor="middle" class="tm">Kafka</text><rect x="190" y="110" width="140" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="260" y="129" text-anchor="middle" font-weight="600">Feature</text><text x="260" y="143" text-anchor="middle" class="tm">pipelines</text><rect x="380" y="60" width="160" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="460" y="79" text-anchor="middle" font-weight="600">Offline store</text><text x="460" y="93" text-anchor="middle" class="tm">full history</text><rect x="380" y="160" width="160" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="460" y="179" text-anchor="middle" font-weight="600">Online store</text><text x="460" y="193" text-anchor="middle" class="tm">latest values</text><rect x="585" y="60" width="145" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="657.5" y="79" text-anchor="middle" font-weight="600">Training sets</text><text x="657.5" y="93" text-anchor="middle" class="tm">point-in-time</text><rect x="585" y="160" width="145" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="657.5" y="179" text-anchor="middle" font-weight="600">Online serving</text><text x="657.5" y="193" text-anchor="middle" class="tm">&lt;10 ms lookup</text><line x1="152" y1="82" x2="188" y2="124" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m3)"/><line x1="152" y1="182" x2="188" y2="142" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m3)"/><line x1="332" y1="124" x2="378" y2="86" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m3)"/><line x1="332" y1="142" x2="378" y2="178" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m3)"/><line x1="460" y1="106" x2="460" y2="157" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#ss-m3)"/><text x="468" y="136" text-anchor="start" class="tm">materialize</text><line x1="542" y1="82" x2="582" y2="82" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m3)"/><line x1="542" y1="182" x2="582" y2="182" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m3)"/></svg><figcaption>One set of definitions feeds a history store for training and a fast latest-value store for serving.</figcaption></figure>
  <p>Follow the figure from left to right. Raw data arrives from two kinds of sources: warehouse tables updated in batches, and the Kafka stream of order events. Feature pipelines in the middle turn raw data into feature values and write them to the offline store (top, full history) and the online store (bottom, latest values); the dashed arrow is materialization, copying recent offline values into the online store. On the right, training sets are built from the offline store with point-in-time joins, and online serving reads the online store. The registry across the top is what makes both paths use the same definition.</p>
  <p><strong>Feast</strong> is the most widely used open-source feature store, and it runs entirely on a laptop with files and SQLite, so we can use it for real. A Feast project has a small configuration file saying where each store lives. Here the offline store is plain files and the online store is a local SQLite database (in production it would be BigQuery or Snowflake offline and Redis or DynamoDB online):</p>
  <div class="fx" data-lang="text">project: biteful
provider: local
registry: data/registry.db
online_store:
  type: sqlite
  path: data/online.db
offline_store:
  type: file
entity_key_serialization_version: 3</div>
  <p>The feature definitions are ordinary Python. An <strong>entity</strong> is the thing a feature describes, identified by a join key (here <code>restaurant_id</code>). A <strong>feature view</strong> groups features that come from the same source, and its <code>ttl</code> (time to live) says how old a value may be before it counts as missing:</p>
  <div class="fx" data-lang="py">from datetime import timedelta
from feast import Entity, FeatureView, Field, FileSource
from feast.types import Int64

restaurant = Entity(name="restaurant", join_keys=["restaurant_id"])

queue_source = FileSource(path="data/kitchen_queue.parquet",
                          timestamp_field="event_timestamp")

kitchen_queue = FeatureView(
    name="kitchen_queue",
    entities=[restaurant],
    ttl=timedelta(hours=1),            # a value older than 1 hour counts as missing
    schema=[Field(name="queue", dtype=Int64)],
    source=queue_source,
)</div>
  <p>Running <code>feast apply</code> in the project folder registers these definitions in the registry. The program below then writes the queue history, asks Feast for a point-in-time training set for three past orders, materializes into the online store, and reads the latest values for a live request:</p>
  <div class="fx" data-lang="py">from feast import FeatureStore

# Raw history: kitchen queue of Dosa Hut (id 1) and Biryani Bros (id 2), with timestamps
pd.DataFrame({
    "restaurant_id": [1, 1, 2, 1, 2],
    "event_timestamp": pd.to_datetime(["2026-07-14 20:00", "2026-07-14 20:05", "2026-07-14 20:05",
                                       "2026-07-14 20:10", "2026-07-14 20:10"], utc=True),
    "queue": [4, 5, 7, 6, 8],
}).to_parquet("data/kitchen_queue.parquet")
store = FeatureStore(repo_path=".")          # reads feature_store.yaml + the registered views

# TRAINING: point-in-time join - the queue as it was when each past order was placed
orders = pd.DataFrame({"order_id": [101, 102, 103], "restaurant_id": [1, 1, 2],
                       "event_timestamp": pd.to_datetime(["2026-07-14 20:03", "2026-07-14 20:07",
                                                          "2026-07-14 20:09"], utc=True)})
train = store.get_historical_features(entity_df=orders, features=["kitchen_queue:queue"]).to_df()
print(train.sort_values("order_id")[["order_id", "restaurant_id", "event_timestamp", "queue"]]
      .to_string(index=False))

# SERVING: materialize (copy latest values into the SQLite online store), then look up
    store.materialize(start_date=pd.Timestamp("2026-07-14 19:00", tz="UTC"),
                      end_date=pd.Timestamp("2026-07-14 20:11", tz="UTC"))
live = store.get_online_features(features=["kitchen_queue:queue"],
                                 entity_rows=[{"restaurant_id": 1}, {"restaurant_id": 2},
                                              {"restaurant_id": 3}]).to_dict()
print(live)</div>
  <div class="fx" data-lang="text"> order_id  restaurant_id           event_timestamp  queue
      101              1 2026-07-14 20:03:00+00:00      4
      102              1 2026-07-14 20:07:00+00:00      5
      103              2 2026-07-14 20:09:00+00:00      7
{'restaurant_id': [1, 2, 3], 'queue': [6, 8, None]}</div>
  <p>The first table is the training set. Order 101 at 20:03 gets queue 4, the value from 20:00, not the 5 that appeared at 20:05; order 102 at 20:07 gets 5; order 103 for Biryani Bros at 20:09 gets 7. Feast's <code>get_historical_features</code> performed exactly the point-in-time join we wrote with <code>merge_asof</code>, but from the registered definition, so every team gets it right without thinking about it. The second line is serving: after <code>materialize</code>, the online store returns the latest queue for Dosa Hut (6) and Biryani Bros (8), and <code>None</code> for restaurant 3, which has no data, so the serving code must apply the same default as training. One definition produced both the training values and the serving values, which is the entire point.</p>
  <p>Managed products such as <strong>Tecton</strong> (now part of Databricks) and the feature stores built into Databricks, SageMaker and Vertex AI do the same job and also run the batch and streaming transformations for you. A feature store is not required for every design, though. One batch model with three features is perfectly well served by a table. In an interview, bring it in when several models share features, when real-time features are involved, or when training-serving consistency is a stated risk, all of which apply to ETA.</p>
  <table class="tbl">
    <tr><th>What we built by hand</th><th>Feast</th><th>Production equivalent</th></tr>
    <tr><td>offline DataFrame with timestamps</td><td><code>FileSource</code> in a <code>FeatureView</code></td><td>Warehouse table with event timestamps</td></tr>
    <tr><td><code>merge_asof</code></td><td><code>get_historical_features</code></td><td>Point-in-time join at scale</td></tr>
    <tr><td>the materialization loop</td><td><code>materialize</code> / <code>materialize_incremental</code></td><td>Scheduled job or stream writer</td></tr>
    <tr><td><code>get_online_features</code> + default</td><td><code>get_online_features</code></td><td>Redis MGET with timeout and default</td></tr>
  </table>

  <h2 id="ss-cache"><span class="num">06</span>Caching</h2>
  <p>Features now arrive in milliseconds, but there is still waste. At 20:00 thousands of people in Kothrud ask for Dosa Hut's ETA to almost the same address within the same minute, and the service computes the same answer for each of them. A <strong>cache</strong> keeps recent answers and reuses them. The standard pattern, called <strong>cache-aside</strong>, is: look in the cache; on a miss, compute the answer, store it, and return it (<a class="xref" data-note="api_production">Production Backend</a> covers it in general). Each entry has a <strong>TTL</strong> (time to live) after which it expires, and the <strong>hit ratio</strong> is the share of lookups answered from the cache.</p>
  <p>Think of the "today's specials" board in a restaurant. The waiter does not run to the kitchen for every customer who asks what is available; he reads the board. But if nobody rewrites the board, customers order dishes that ran out an hour ago. The TTL is how often the board is rewritten, and choosing it is a trade between saved work and stale answers. For the ETA the cache key is (restaurant, map cell), so Asha and her neighbour two streets away share an answer. The simulation below runs 10 minutes of dinner traffic at a tenth of real scale, with popular restaurants asked about far more often than others, while each kitchen's queue drifts by up to one order a minute. Since each queued order adds 2.42 minutes in our model, a cached ETA built on an old queue is off by 2.42 × the change in queue:</p>
  <div class="fx" data-lang="py">import numpy as np

# 10 minutes of dinner traffic at 1/10 scale: 1,111 ETA lookups per second
# cache key = (restaurant, map cell); popular restaurants are asked about far more often
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
        if key in cached and ti - cached[key][0] &lt; ttl:
            hits += 1
            extra_err += 2.42 * abs(queue[ti // 60, r] - cached[key][1])   # minutes off, stale queue
        else:
            cached[key] = (ti, queue[ti // 60, r])
    print(f"TTL {ttl:&gt;3} s: hit ratio {hits/t.size:5.1%}   model calls saved {hits:&gt;7,}   "
          f"extra error {extra_err/t.size:.2f} min per lookup")</div>
  <div class="fx" data-lang="text">TTL   0 s: hit ratio  0.0%   model calls saved       0   extra error 0.00 min per lookup
TTL  30 s: hit ratio 67.0%   model calls saved 446,340   extra error 0.11 min per lookup
TTL  60 s: hit ratio 73.5%   model calls saved 489,700   extra error 0.20 min per lookup
TTL 120 s: hit ratio 79.2%   model calls saved 528,226   extra error 0.62 min per lookup
TTL 300 s: hit ratio 85.5%   model calls saved 570,166   extra error 1.52 min per lookup</div>
  <p>A 30-second TTL already answers 67.0% of lookups from the cache, because popular keys repeat constantly. Going to 60 seconds raises that to 73.5% for an average extra error of 0.20 minutes per lookup. Beyond that the trade gets worse quickly: at 300 seconds the cache answers 85.5% of lookups but each ETA is on average 1.52 minutes further from what a fresh model call would say, which is about the difference between a good model and a mediocre one. Biteful chooses 60 seconds, which cuts model calls by roughly 3.8 times (only 26.5% of lookups reach the model) for a fifth of a minute of error.</p>
  <p>Precomputation is the cousin of caching: values that change slowly (prep_7d, restaurant embeddings for recommendations) are computed ahead of time and stored, so they never touch the request path at all. One detail matters enormously, and we return to it in Common Mistakes: the cache key must include the model version, otherwise users keep receiving the old model's answers after a release.</p>

  <h2 id="ss-run"><span class="num">07</span>Where the Model Runs</h2>
  <p>Caching removed about three quarters of the model calls; the rest still have to run somewhere. Running a trained model to get predictions is called <strong>inference</strong>, and there are four common places to do it. An <strong>embedded</strong> model is loaded inside the application process itself, so a prediction is a function call with no network hop; the cost is that updating the model means redeploying the app, and the app must be written in a language that can load it. A <strong>model server</strong> is a separate service, reached over REST or gRPC, built with tools such as Triton, TorchServe, KServe or BentoML (<a class="xref" data-note="mlops_serving">Model Serving</a> covers them); it adds a millisecond or more of network time but scales independently, can live on GPUs, and serves many callers. A <strong>sidecar</strong> is a model container running next to the app in the same Kubernetes pod and reached over localhost: almost as fast as embedded, but deployable separately. A <strong>batch job</strong> (Spark, Ray) scores whole tables on a schedule, as in section 01.</p>
  <table class="tbl">
    <tr><th></th><th>Embedded</th><th>Model server</th><th>Sidecar</th></tr>
    <tr><td>Latency</td><td>Best</td><td>+1–5 ms network</td><td>Near embedded</td></tr>
    <tr><td>Scales independently</td><td>No</td><td>Yes (e.g. a GPU pool)</td><td>No (scales with the app)</td></tr>
    <tr><td>Update the model alone</td><td>No</td><td>Yes</td><td>Yes</td></tr>
    <tr><td>Use when</td><td>Small model, one service, mobile or edge</td><td>Large models, many callers</td><td>One service's model, tight latency</td></tr>
  </table>
  <p>Biteful's ETA model is a gradient-boosted tree model of a few megabytes used by one service, so embedded fits. The largest single lever on inference cost is then <strong>batching</strong>: every model call has a fixed overhead (input checks, converting data, setting up the computation), so scoring 20 rows in one call is far cheaper than 20 calls of one row. A bus works the same way; it costs almost the same to drive with 1 passenger or 20, so waiting a moment to fill it beats sending 20 autos. Measured on a real 300-tree LightGBM model on one CPU thread (timings are approximate and vary by machine):</p>
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
  <div class="fx" data-lang="text">20 calls of 1 row :   9.17 ms per feed
1 call of 20 rows :   1.14 ms per feed  (8x faster)
feeds per second per core, batched: 874</div>
  <p>Twenty single-row calls took about 9.2 ms; one call with all 20 rows took about 1.1 ms, roughly eight times faster. That gives about 874 feeds per second on one core, and since the peak is 556 feeds per second, the model needs less than one core at peak. This is a useful interview point: for tree models the expensive parts of ETA serving are the feature fetch and the route engine, not the model.</p>
  <p>For large neural models the same idea becomes <strong>dynamic batching</strong>: the model server holds incoming requests for a few milliseconds, combines requests from many users into one GPU call, and splits the results. Throughput rises sharply while each request pays a small queueing delay, so the maximum wait is tuned against the latency budget. Other levers for heavy models are quantization and distillation (a smaller, faster model at a small accuracy cost) and cascades (a cheap model for easy cases, the heavy one only for hard ones). Finally, servers are added and removed automatically with load, called <strong>autoscaling</strong> (<a class="xref" data-note="mlops_k8s">Kubernetes</a> does it with the Horizontal Pod Autoscaler). For a GPU model server, scale on request queue length or latency, not CPU usage, because the CPU can sit idle while the GPU is saturated; and keep a warm minimum of replicas, since a new one takes time to start and load the model.</p>

  <h2 id="ss-skew"><span class="num">08</span>Training-Serving Skew</h2>
  <p>Suppose every piece above is built and within budget. Biteful launches, and the live late rate is twice what offline evaluation promised. There are no errors, no timeouts, and the model file is byte-for-byte the one that was evaluated. What could make the same model worse in production than on paper?</p>
  <p>The usual answer is <strong>training-serving skew</strong>: the feature values the model receives in production are not computed the same way as the values it was trained on. Here is a way it really happens. The training pipeline takes <code>km</code> from completed trips, which is the <em>road</em> distance the rider actually drove. The serving team needs km before any trip exists, so it writes a quick haversine formula, the <em>straight-line</em> distance from restaurant to door. Roads are 1.2 to 1.5 times longer than the straight line. Both columns are called "km", both look reasonable, and nobody notices. It is like a student who practises with a calculator set to degrees and sits the exam with one set to radians: same student, same knowledge, wrong answers, and nothing tells him why.</p>
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
offline = model.predict(np.c_[road, q, rain])   # the feature as training computed it
live    = model.predict(np.c_[s, q, rain])      # SERVING code computed km with haversine (straight line)

for name, p in [("offline (road km)", offline), ("live (straight km)", live)]:
    e = y - p
    print(f"{name:&lt;20} MAE {np.abs(e).mean():5.2f}  bias {e.mean():+5.2f}  late {np.mean(e &gt; 0):4.0%}")

# Detect it: compare the km values serving LOGGED with the km values training USED
print(f"\nmean km  training {road.mean():.2f}   served {s.mean():.2f}   ratio {s.mean()/road.mean():.2f}")
edges = np.quantile(road, np.linspace(0, 1, 11)); edges[0], edges[-1] = -np.inf, np.inf
e_ = np.clip(np.histogram(road, edges)[0] / len(road), 1e-6, None)
a_ = np.clip(np.histogram(s, edges)[0] / len(s), 1e-6, None)
print(f"PSI(served km vs training km) = {np.sum((a_ - e_) * np.log(a_ / e_)):.2f}")</div>
  <div class="fx" data-lang="text">offline (road km)    MAE  1.66  bias +0.05  late  42%
live (straight km)   MAE  3.15  bias +2.87  late  84%

mean km  training 3.21   served 2.38   ratio 0.74
PSI(served km vs training km) = 0.19</div>
  <p>With road km, as in training, the model is healthy: MAE 1.66 minutes, almost no bias, 42% of orders late (roughly half, as you would expect from a model aiming at the middle). With straight-line km the model believes every trip is shorter than it is, so it promises too little: the MAE nearly doubles to 3.15, the bias is +2.87 minutes (actual minus predicted), and 84% of orders arrive late. Every individual prediction looks plausible, which is why no error log catches this.</p>
  <p>What does catch it is the last two lines. If the serving service <strong>logs the exact features it used</strong> for every prediction, we can compare them with the training features: the served km averages 2.38 against 3.21 in training, a ratio of 0.74, and the PSI (population stability index, a standard measure of how far a distribution has moved, explained in <a class="xref" data-note="sd_monitoring">Monitoring, Drift &amp; Retraining</a>) is 0.19, above the usual 0.1 "investigate" line. One chart on a dashboard finds a bug that would otherwise take weeks.</p>
  <table class="tbl">
    <tr><th>Cause of skew</th><th>Biteful example</th><th>Fix</th></tr>
    <tr><td>Two code paths for one feature</td><td>Road km in training, straight-line km in serving</td><td>One feature function imported by both, or a feature store</td></tr>
    <tr><td>Freshness gap</td><td>Trained on end-of-day queues, served 10-minute-old ones</td><td>Log served features and train on those ("log and wait")</td></tr>
    <tr><td>Leakage in training joins</td><td>Same-day average joined to the order (section 04)</td><td>Point-in-time joins</td></tr>
    <tr><td>Missing-value handling</td><td>Serving returns 0 on a miss, training filled the median</td><td>One default, shared; monitor null rates</td></tr>
    <tr><td>Preprocessing</td><td>Training scaled features, serving forgot</td><td>Ship the whole sklearn <a class="xref" data-note="ml_pipelines">Pipeline</a>, not just the model</td></tr>
  </table>
  <p>The strongest prevention is called <strong>log and wait</strong>: log the exact feature vector used at prediction time, join the true label when it arrives, and train the next model on those logged rows, so training matches serving by construction. And when live performance is worse than offline, check the features before touching the model; most "model problems" turn out to be pipeline problems.</p>

  <h2 id="ss-shadow"><span class="num">09</span>Shadow Deployment</h2>
  <p>With skew fixed, version 1 is serving. The team now has version 2, which reads rain from a new weather feed. A model that looked fine on a test file can still time out, crash on an unusual input, or produce nonsense for a city the test set barely covered. If we simply switch over, every user meets those problems at once. We want v2 to face real traffic without any user seeing its answers.</p>
  <p>That is <strong>shadow deployment</strong> (also called a dark launch or shadow mode): every live request is copied to v2 as well as v1. v1 still answers the user; v2's answer is logged and thrown away. Picture a new cashier on her first day at a kirana shop. The owner bills every customer as usual, while the new cashier writes her own bill on a notepad that nobody receives. In the evening the owner compares the two piles page by page.</p>
  <figure class="viz"><svg viewBox="0 0 720 160" width="720" role="img"><defs><marker id="ss-m4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="10" y="50" width="110" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="65" y="76" text-anchor="middle" font-weight="600">Request</text><rect x="160" y="50" width="110" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="215" y="76" text-anchor="middle" font-weight="600">Router</text><rect x="320" y="10" width="160" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="400" y="36" text-anchor="middle" font-weight="600">Live model v1</text><rect x="320" y="100" width="160" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="400" y="126" text-anchor="middle" font-weight="600">Shadow v2</text><rect x="540" y="10" width="170" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="625" y="36" text-anchor="middle" font-weight="600">Response to user</text><rect x="540" y="100" width="170" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="625" y="119" text-anchor="middle" font-weight="600">Log only</text><text x="625" y="133" text-anchor="middle" class="tm">compare later</text><line x1="122" y1="72" x2="157" y2="72" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m4)"/><line x1="272" y1="66" x2="318" y2="34" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m4)"/><line x1="272" y1="80" x2="318" y2="120" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#ss-m4)"/><line x1="482" y1="32" x2="537" y2="32" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m4)"/><line x1="482" y1="122" x2="537" y2="122" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m4)"/><text x="250" y="128" text-anchor="middle" class="tm">copy</text></svg><figcaption>The shadow receives a copy of real traffic, but its answers only reach a log.</figcaption></figure>
  <p>In the figure the router sends each request to v1 (solid arrow), whose answer goes back to the user, and a copy to v2 (dashed arrow), whose answer goes only to a log. Later, a comparison job reads the log. The simulation below shadows v2 on 10,000 requests. It plants the kind of bug shadows exist to find: the new weather feed has no Mumbai data, and the null is quietly filled with 0, meaning "not raining":</p>
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
  <p>Read from the top. Overall, v2 is only 2.7 minutes away from v1 on average and differs by more than 5 minutes on 15.9% of requests; that could easily pass as "v2 is a bit different". The <strong>slices</strong> (subsets of traffic checked separately) tell the truth. Pune dry, Pune rain and Mumbai dry all move by under a minute, but Mumbai in rain moves by −9.6 minutes, with 99.8% of requests off by more than 5. v2 is ignoring Mumbai's rain entirely. Its latency is fine (p99 35 ms against a 60 ms budget), so a latency-only check would have passed it. The rollout stops here, and no customer was ever shown a wrong ETA.</p>
  <p>Shadowing proves that a new model runs at production load, within latency, with sensible outputs on real inputs, slice by slice. It costs double compute while it runs, and the shadow path must have no side effects: a shadow model must never send an SMS, assign a rider or write to the orders table. What a shadow cannot prove is user impact, because users never see v2. Whether people order more or complain less with v2's ETAs needs v2 to be shown to someone.</p>

  <h2 id="ss-canary"><span class="num">10</span>Canary and Blue-Green Releases</h2>
  <p>Suppose v2 is fixed and the shadow comparison is clean. Users must eventually see it, and some problems only appear when they do: riders behaving differently when ETAs are shorter, a memory leak that grows under real load. The goal of the first exposure is to keep the number of affected users small and the way back instant. The share of users a failure can reach is called the <strong>blast radius</strong>.</p>
  <p>A <strong>canary release</strong> sends a small share of traffic, say 10%, to v2 and the rest to v1, watches errors and latency, and then widens step by step (25%, 50%, 100%) if healthy, or shrinks to 0% if not. The name comes from coal miners, who carried a canary underground: bad gas harmed the small bird first, warning the miners in time. A <strong>blue-green deployment</strong> keeps two complete copies of the service: "blue" serves everyone while "green" has v2 loaded and warmed up; the router flips everyone to green at once, and flipping back is an instant rollback. A wedding caterer who keeps a second full kitchen ready is doing blue-green.</p>
  <figure class="viz"><svg viewBox="0 0 720 160" width="720" role="img"><defs><marker id="ss-m5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><text x="170" y="16" text-anchor="middle" font-weight="600">Canary: split traffic</text><rect x="10" y="52" width="100" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="60" y="71" text-anchor="middle" font-weight="600">Load</text><text x="60" y="85" text-anchor="middle" class="tm">balancer</text><rect x="170" y="26" width="150" height="40" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="245" y="50" text-anchor="middle" font-weight="600">v1  90%</text><rect x="170" y="92" width="150" height="40" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="245" y="116" text-anchor="middle" font-weight="600">v2  10%</text><line x1="112" y1="68" x2="168" y2="46" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m5)"/><line x1="112" y1="80" x2="168" y2="112" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m5)"/><text x="540" y="16" text-anchor="middle" font-weight="600">Blue-green: switch all at once</text><rect x="380" y="52" width="100" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="430" y="78" text-anchor="middle" font-weight="600">Router</text><rect x="560" y="26" width="150" height="40" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="635" y="50" text-anchor="middle" font-weight="600">Blue v1  live</text><rect x="560" y="92" width="150" height="40" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="635" y="116" text-anchor="middle" font-weight="600">Green v2  idle</text><line x1="482" y1="68" x2="558" y2="46" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m5)"/><line x1="482" y1="80" x2="558" y2="112" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#ss-m5)"/><text x="545" y="152" text-anchor="middle" class="tm">flip the router → instant swap or rollback</text></svg><figcaption>A canary limits the blast radius by percentage; blue-green limits it by having a warm copy to flip back to.</figcaption></figure>
  <p>On the left, the load balancer splits traffic 90/10, so if v2 is broken only a tenth of users are affected. On the right, the router sends everything to blue while green waits (dashed arrow); the switch moves everyone at once, so blue-green protects through speed of rollback rather than through a small share.</p>
  <p>The practical question about a canary is how long it must run and what number tells it to stop. It must run long enough for a real problem to stand out from random noise. Biteful's ETA service gets 556 requests per second at peak and v1 fails (timeout or server error) on 0.1% of them. A 10% canary for 10 minutes sees 556 × 0.10 × 600 = 33,360 requests, so if v2 were exactly as good as v1 we would expect about 33.4 errors. Seeing 40 or 55 could be bad luck or a real problem. A <strong>binomial test</strong> answers "if the true error rate were still 0.1%, how likely is a count at least this high?" (<a class="xref" data-note="st_hypothesis">Hypothesis Testing</a>):</p>
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
  <p>Forty errors would happen by luck about 14% of the time (p = 0.1443), so the canary keeps going. Fifty-five errors would happen by luck only 0.04% of the time, so the canary controller rolls back automatically, and only 10% of users for 10 minutes ever saw the problem. Notice how small the real change is: 0.10% to 0.16%. Only the volume of requests makes it visible, which is why canaries widen in timed steps and why a 1% canary for 2 minutes cannot see anything.</p>
  <p>A canary is not an A/B test. It is too small and too short to measure a 1% change in orders or on-time rate; it answers "is v2 broken?", not "is v2 better?". Measuring "better" is the job of a properly sized experiment, covered in <a class="xref" data-note="sd_experiments">Experiments</a>. The full safe-release ladder is therefore shadow (zero users, does it work?), canary (a few users, is it broken?), then an A/B test (is it better?), each rung cheaper and safer than the next. The deployment mechanics live in <a class="xref" data-note="mlops_cicd">CI/CD for ML</a> and <a class="xref" data-note="mlops_deploy">Deployment</a>.</p>
  <table class="tbl">
    <tr><th></th><th>Shadow</th><th>Canary</th><th>Blue-green</th><th>A/B test</th></tr>
    <tr><td>Question</td><td>Does it work?</td><td>Is it broken for real users?</td><td>Can we swap with no downtime?</td><td>Is it better?</td></tr>
    <tr><td>Users exposed</td><td>0%</td><td>1–10%, then widen</td><td>0% then 100% at once</td><td>Fixed split for weeks</td></tr>
    <tr><td>Decided by</td><td>Diffs by slice, latency</td><td>Errors, latency, guardrails</td><td>Smoke tests</td><td>Statistical test on the main metric</td></tr>
    <tr><td>Rollback</td><td>Nothing to roll back</td><td>Shrink to 0%</td><td>Flip back</td><td>End the experiment</td></tr>
  </table>

  <h2 id="ss-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>The quietest serving bug is a default value that differs between training and serving. Training filled missing kitchen queues with the median, 3. The serving code, written later by another team, returns 0 when Redis has no key. For a brand-new restaurant, the model then receives a value that means "empty kitchen" instead of "we don't know":</p>
  <div class="fx" data-lang="py">import numpy as np, lightgbm as lgb

# Training filled a missing queue with the median (3). The serving code returns 0 on a cache miss.
rng = np.random.default_rng(2)
km = np.clip(rng.gamma(2.2, 1.4, 5_000), 0.3, 9); q = rng.poisson(4, 5_000).astype(float)
y = 14 + 3.2 * km + 2.4 * q + rng.normal(0, 2, 5_000)
q_train = q.copy(); q_train[rng.random(5_000) &lt; 0.05] = 3          # 5% missing -&gt; median
model = lgb.LGBMRegressor(n_estimators=200, verbose=-1).fit(np.c_[km, q_train], y)

chai_corner = [[2.0, 3.0], [2.0, 0.0]]                             # same new restaurant, two defaults
print("default 3 (as in training):", model.predict(np.array(chai_corner[:1])).round(1))
print("default 0 (serving bug)   :", model.predict(np.array(chai_corner[1:])).round(1))</div>
  <div class="fx" data-lang="text">default 3 (as in training): [27.5]
default 0 (serving bug)   : [21.6]</div>
  <p>The same new restaurant gets 27.5 minutes with the training default and 21.6 minutes with the serving bug, six minutes of optimism for every new restaurant, and nothing crashes. The fix is a single shared constant (or the feature store's default) used by both pipelines, plus a monitored null rate per feature.</p>
  <p>A second classic is caching predictions without the model version in the key. After v13 ships, users keep receiving v12's cached answers until every entry expires, which also dilutes any canary or A/B test of v13:</p>
  <div class="fx" data-lang="py"># A prediction cache keyed WITHOUT the model version keeps serving the old model after a release
cache = {}
def eta(model_version, restaurant, cell, predict, versioned):
    key = (model_version, restaurant, cell) if versioned else (restaurant, cell)
    if key not in cache:
        cache[key] = predict()
    return cache[key]

for versioned in [False, True]:
    cache.clear()
    eta("v12", "Dosa Hut", 41, lambda: 41.4, versioned)              # v12 answer is cached at 20:10
    shown = eta("v13", "Dosa Hut", 41, lambda: 38.9, versioned)      # v13 ships at 20:11
    print(f"versioned key={versioned!s:&lt;5}  user sees {shown} (v13 says 38.9)")</div>
  <div class="fx" data-lang="text">versioned key=False  user sees 41.4 (v13 says 38.9)
versioned key=True   user sees 38.9 (v13 says 38.9)</div>
  <p>Without the version in the key, the user still sees 41.4, v12's answer, even though v13 is live and says 38.9. With the version in the key, the lookup misses and v13's answer is computed. The same problem appears in reverse after a rollback, when v13's answers linger.</p>
  <p>Three more mistakes come up constantly in design reviews. Budgeting or monitoring the average latency hides the tail; an average of 30 ms can sit on top of a p99 of 200 ms. Judging a shadow or canary by the overall average hides slice-level failures, exactly as the Mumbai rain bug hid inside "2.7 minutes". And joining features to training rows by date instead of by point in time leaks the future, producing offline numbers that collapse in production.</p>

  <h2 id="ss-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Serving modes</h3>
  <ul>
    <li><b>Batch serving</b>: precompute predictions on a schedule, store in a key-value store, look up. Cheap at read time, stale, wastes work on unrequested inputs.</li>
    <li><b>Online serving</b>: compute per request; needed when the answer depends on request-time context.</li>
    <li><b>Streaming features</b>: features updated continuously from an event stream (Kafka), seconds old.</li>
    <li>Biteful: online model, streaming queue, nightly prep_7d; 2,778/s average, 11,111/s peak vs 20,000/s for 5-minute precompute (13.9% ever used).</li>
  </ul>
  <h3>Latency</h3>
  <ul>
    <li><b>p50 / p99</b>: time beaten by 50% / 99% of requests. Budget and monitor p99; the mean hides the tail (mean 11.5 ms, p99 88.8 ms).</li>
    <li><b>Critical path</b> = sequential steps + the slowest of each parallel group: 8 + max(12, 15) + 10 + 3 = 36 ms of 60.</li>
    <li><b>Fan-out</b>: P(at least one slow of n) = 1 − (1 − p)<sup>n</sup>; 20 calls at 1% → 18.2%. Use MGET, timeouts with defaults, a fallback answer.</li>
  </ul>
  <h3>Features</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td>Offline store</td><td>Every feature value with its timestamp; for training</td></tr>
    <tr><td>Online store</td><td>Latest value per key, ~1 ms; for serving</td></tr>
    <tr><td>Materialization</td><td>Copying recent values offline → online</td></tr>
    <tr><td>Point-in-time join</td><td>Attach the latest value that existed at prediction time (<code>merge_asof</code>, Feast <code>get_historical_features</code>)</td></tr>
    <tr><td>Data leakage</td><td>Training features use information from after prediction time (leaky MAE 2.52 offline, 5.28 live)</td></tr>
    <tr><td>Feature store</td><td>Registry + offline + online + materialization from one definition (Feast, Tecton)</td></tr>
    <tr><td>Training-serving skew</td><td>A feature computed differently in training and serving (road vs straight km: MAE 1.66 → 3.15)</td></tr>
  </table>
  <h3>Running the model</h3>
  <table class="tbl">
    <tr><th>Choice</th><th>Key fact</th></tr>
    <tr><td>Cache (cache-aside, TTL)</td><td>60 s: 73.5% hits, +0.20 min error; 300 s: 85.5%, +1.52 min; key includes model version</td></tr>
    <tr><td>Embedded / server / sidecar / batch</td><td>In-process / separate service / same pod / scheduled job</td></tr>
    <tr><td>Batching</td><td>20 rows in one call ~8× faster than 20 calls (timings approximate)</td></tr>
    <tr><td>Dynamic batching</td><td>Server groups concurrent requests into one GPU call; adds a few ms of queueing</td></tr>
    <tr><td>Autoscaling</td><td>Scale GPU servers on queue length or latency, not CPU</td></tr>
  </table>
  <h3>Safe release</h3>
  <table class="tbl">
    <tr><th></th><th>Shadow</th><th>Canary</th><th>Blue-green</th><th>A/B</th></tr>
    <tr><td>Exposed</td><td>0%</td><td>small %, growing</td><td>all at once</td><td>fixed split</td></tr>
    <tr><td>Answers</td><td>works?</td><td>broken?</td><td>zero-downtime swap</td><td>better?</td></tr>
  </table>
  <div class="fx" data-lang="py"># point-in-time join
pd.merge_asof(orders.sort_values("ts"), feats.sort_values("valid_from"),
              left_on="ts", right_on="valid_from", by="restaurant", direction="backward")

# canary: n = rps * share * seconds; roll back if one-sided binomial p &lt; 0.01
binomtest(errors, n, base_rate, alternative="greater").pvalue

# Feast
store.get_historical_features(entity_df=orders, features=["kitchen_queue:queue"])  # training
store.materialize(start_date, end_date)                                            # offline -&gt; online
store.get_online_features(features=[...], entity_rows=[{"restaurant_id": 1}])      # serving</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Different default for missing values in training and serving (27.5 vs 21.6 minutes).</li>
    <li>Prediction cache without the model version in the key.</li>
    <li>Joining features by date instead of point in time.</li>
    <li>Budgeting the mean; ignoring fan-out.</li>
    <li>Judging shadows and canaries by the overall average; side effects in the shadow path.</li>
    <li>Treating a canary as an A/B test.</li>
  </ul>

  <h2 id="ss-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between batch and online inference, and how do you choose?</summary><div class="qa-body">Batch inference scores many inputs on a schedule and stores the results for lookup; online inference computes a prediction when a request arrives. Choose online when the answer depends on information that only exists at request time (location, current queue, a payment) or when the space of possible inputs is too large to precompute. Choose batch when inputs are known in advance and some staleness is acceptable, such as daily recommendation emails, because it is cheaper and simpler.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are p50 and p99 latency, and why do we budget p99?</summary><div class="qa-body">p50 is the median latency; p99 is the time within which 99% of requests finish. We budget p99 because the slow tail is what users notice, heavy users hit it daily, and fan-out makes it worse. A service with a 10 ms average can have an 80 ms p99, and the average hides it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A request fans out to 20 feature lookups, each with p99 = 5 ms. What is the request's p99?</summary><div class="qa-body">Higher than 5 ms, because the request waits for the slowest call. If each call is slow 1% of the time, 1 − 0.99<sup>20</sup> ≈ 18% of requests see at least one slow call, so the request p99 is set by the single-call tail (about 10 ms in our simulation). Fix it with one batched call (MGET), timeouts with defaults, or hedged requests.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you split a 60 ms latency budget for a prediction service?</summary><div class="qa-body">List the steps on the request path (network, feature fetch, any external calls, model, post-processing), assign each a p99 slice, run independent steps in parallel so only the critical path counts, and leave headroom (Biteful: 8 + max(12, 15) + 10 + 3 = 36 ms, 24 ms spare). Add a timeout and fallback for each step so a slow dependency degrades the answer instead of breaking it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a feature store and what problems does it solve?</summary><div class="qa-body">A feature store defines each feature once and serves it two ways: an offline store with full timestamped history for building training sets with point-in-time joins, and an online store with the latest values for low-latency serving, kept in sync by materialization. It solves duplicated feature code across teams, training-serving inconsistency, leakage in training joins, and discovery and reuse of features. Feast is the common open-source one; Tecton and cloud platforms offer managed versions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why have separate online and offline stores instead of one database?</summary><div class="qa-body">Their access patterns are opposite. Training scans months of history for millions of entities, which suits cheap columnar storage (Parquet, BigQuery). Serving reads one latest value per key for a handful of keys in about a millisecond, which suits an in-memory key-value store (Redis, DynamoDB). No single store does both well and cheaply.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a point-in-time correct join, and what goes wrong without one?</summary><div class="qa-body">For each training row, it attaches the most recent feature value whose timestamp is at or before that row's prediction time. Without it, a naive join (for example on date) can attach values computed later, sometimes including the label itself, so the model learns from the future. Offline metrics look excellent and production collapses; in our demo the leaky model reported 2.52 minutes MAE offline but scored 5.28 live, worse than an honest model's 4.85.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is training-serving skew? Give causes and fixes.</summary><div class="qa-body">It is a difference between how features (or preprocessing) are computed in training and in serving. Causes include two code paths for one feature (road vs straight-line distance), freshness differences, different missing-value defaults, leaky training joins and forgotten preprocessing. Fixes: one shared feature definition or a feature store, shipping the full preprocessing pipeline with the model, logging served features and training on them, and monitoring served-vs-training feature distributions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your model scores 1.66 MAE offline and 3.15 live. What do you check first?</summary><div class="qa-body">Training-serving skew: compare the logged features serving actually used with the training features for comparable traffic (means, null rates, PSI). Then check training joins for leakage, default values for missing features, and preprocessing differences. Only after the inputs are proven identical would I suspect genuine drift or the model itself.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you choose a cache TTL for predictions?</summary><div class="qa-body">Measure the trade-off: a longer TTL raises the hit ratio but serves staler answers. Simulate or measure hit ratio and the error introduced by staleness (for ETA, how much the queue changes within the TTL) and pick the knee of the curve; Biteful chose 60 s for 73.5% hits at +0.20 min. Always include the model version in the key and set the TTL shorter than the fastest-changing input you care about.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Embedded model vs model server: which for a 500 MB deep ranker used by three services?</summary><div class="qa-body">A model server. It can run on its own GPU pool, scale independently of the callers, be updated once for all three services, and keep three applications from each loading 500 MB. Embedded suits small models used by one service, like a few-megabyte tree model for ETA, where avoiding the network hop matters most.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is dynamic batching and what is its trade-off?</summary><div class="qa-body">The model server waits a few milliseconds to collect concurrent requests and runs them as one batched call, which uses GPUs far more efficiently and multiplies throughput. The cost is added queueing latency per request, so you tune the maximum batch size and maximum wait time against the latency budget.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Shadow vs canary: what does each prove?</summary><div class="qa-body">A shadow sends a copy of live traffic to the new model and logs its answers without showing them, proving it runs correctly at production load with sensible outputs, by slice, with zero user risk. A canary shows the new model to a small, growing share of users with automatic rollback, proving it is not broken for real users. Neither measures whether it is better; that requires an A/B test.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How long should a canary run, and when do you roll back?</summary><div class="qa-body">Long enough for a meaningful degradation to be statistically visible. At 556 requests/s, a 10% canary for 10 minutes sees 33,360 requests; with a 0.1% baseline error rate you expect 33.4 errors. A one-sided binomial test gives p ≈ 0.14 for 40 errors (continue) and p ≈ 0.0004 for 55 (roll back). Also watch latency and guardrail metrics, and widen in timed steps.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is blue-green deployment and when would you prefer it to a canary?</summary><div class="qa-body">Two full environments run side by side; one serves all traffic while the other holds the new version, and a router switch moves everyone at once, with an instant switch back for rollback. Prefer it when versions cannot run side by side on split traffic (for example an incompatible schema or protocol change) or when you need a clean, fast cutover; it costs double infrastructure during the switch and gives no gradual exposure.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What should a prediction service return when the model times out?</summary><div class="qa-body">A fallback that is never blank: a recent cached prediction if fresh enough, otherwise a simple baseline (for ETA, 15 + 4 × km minutes). Log every fallback and monitor the fallback rate as a metric, because a rising rate means users are silently getting worse answers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you build the feature "orders to this kitchen in the last 15 minutes" for real-time serving?</summary><div class="qa-body">A streaming job (Flink, Kafka Streams or Spark Structured Streaming) consumes order events, maintains a 15-minute window count per restaurant, and writes it to the online store every few seconds, while also appending timestamped values to the offline store for training. Log the value used at prediction time so training sees exactly what serving saw, and set a default and TTL for restaurants with no recent events.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Design the serving path for an ETA model at 11,000 predictions per second within 60 ms.</summary><div class="qa-body">Run the model online (answers depend on live queue and address), embedded in the ETA service since it is a small tree model, scoring all 20 cards in one batched call. Features come from an online store via one MGET (streaming queue, nightly prep_7d) plus parallel request-time calls to the route engine and weather, with timeouts, shared defaults and a baseline fallback. Put a 60 s TTL cache keyed by (model version, restaurant, map cell) in front, log every served feature vector, autoscale on latency, and release new versions through shadow, then canary, then an A/B test.</div></details>
</main>
`
});
