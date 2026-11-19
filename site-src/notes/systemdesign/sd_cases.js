// notes/systemdesign/sd_cases.js — Case Studies
Object.assign(TOPIC_CONTENT, {
  "sd_cases": `<main>
<h1>Case Studies</h1>
  <div class="where"><span>ML System Design</span><span>Case Studies</span></div>
  <p class="lead">An ML system design interview gives you a one-line prompt, such as "design fraud detection for our app", and 45 minutes to turn it into a complete, reasoned system. This note is practice for that: five full worked answers, each walked through the same steps from the <a class="xref" data-note="sd_framework">Framework</a> note (requirements, back-of-envelope numbers, metrics, data and labels, features, baseline and model, serving, monitoring, rollout and trade-offs). Every estimate is computed in Python rather than waved at, and the key modelling decision in each case is demonstrated with real code and output. All five cases come from one company, Biteful, the food-delivery app used throughout this track: delivery-time (ETA) prediction, restaurant recommendations, payment fraud, demand forecasting for rider staffing, and sponsored listings. Because the company stays the same, you can see clearly how the walk stays fixed while one dominant fact about each problem changes the whole design.</p>

  <h2 id="sc-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">ML Design Cases</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The walk</div>
        <ul>
          <li>Clarify → estimate → metrics → data → features</li>
          <li>Baseline → model → serve → monitor → roll out</li>
          <li>QPS = per day ÷ 86,400; peak ≈ 4×</li>
          <li>State assumptions; give a reason per choice</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Online cases</div>
        <ul>
          <li><b>ETA</b>: 11,111/s; promise P80 (22% late vs 50%)</li>
          <li><b>Recs</b>: 2,000 → 300 → 20; NDCG 0.921 vs 0.53</li>
          <li><b>Fraud</b>: 0.1% positives; ₹-cost picks t = 0.5</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Batch and pricing</div>
        <ul>
          <li><b>Forecasting</b>: 100,800/night; WAPE 9.4% vs 29.4%</li>
          <li>Outage zeros are censored, not demand</li>
          <li><b>Ads</b>: bid × pCTR sets winner and price</li>
          <li>Calibration ratio ≈ 1; correct downsampling</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Dominant fact</div>
        <ul>
          <li>Late ≫ early → quantile</li>
          <li>Thousands of candidates → two stages</li>
          <li>Rare, late labels → cost metric, rules in front</li>
          <li>Probability = price → calibration</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sc-how"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">How to Walk a Case</span><span class="rm-sub">the same steps for every prompt, and the company's base numbers</span></div></div>
      <div class="rm-item rm-done" data-target="sc-eta"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Case 1: ETA Prediction</span><span class="rm-sub">online regression and a promise customers can trust</span></div></div>
      <div class="rm-item rm-done" data-target="sc-rec"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Case 2: Restaurant Recommendations</span><span class="rm-sub">retrieval then ranking; search as a variant</span></div></div>
      <div class="rm-item rm-done" data-target="sc-fraud"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Case 3: Payment Fraud</span><span class="rm-sub">rare positives, late labels, an adversary</span></div></div>
      <div class="rm-item rm-done" data-target="sc-fc"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Case 4: Demand Forecasting</span><span class="rm-sub">a nightly batch, quantiles and missing truth</span></div></div>
      <div class="rm-item rm-done" data-target="sc-ads"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Case 5: Sponsored Listings</span><span class="rm-sub">when a probability becomes a price</span></div></div>
      <div class="rm-item rm-done" data-target="sc-compare"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Side by Side</span><span class="rm-sub">what changed from case to case, and why</span></div></div>
      <div class="rm-item rm-done" data-target="sc-mistakes"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">the slips that sink case answers</span></div></div>
      <div class="rm-item rm-done" data-target="sc-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">each case in a few lines, formulas, numbers</span></div></div>
      <div class="rm-item rm-done" data-target="sc-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the follow-ups interviewers ask on each case</span></div></div>
    </div>
  </div>

  <h2 id="sc-how"><span class="num">01</span>How to Walk a Case</h2>
  <p>The most common way to fail an ML design interview is to say "I'd use XGBoost" in the first minute. The interviewer then has nothing to score: you have not said what the model predicts, how you would know it works, or how it would run in production. Interviewers grade the whole system, and most of the marks sit in framing, data, serving and monitoring rather than in the choice between two models.</p>
  <p>The remedy is to walk the <em>same</em> sequence of steps for every prompt, saying the name of each step out loud before filling it in. A doctor's consultation is a good picture: she asks questions, takes your temperature, decides what "better" would mean, orders tests, prescribes, explains how to take the medicine and books a follow-up. Skipping straight to the prescription is how mistakes happen. The table shows the steps, the question each one answers and a rough share of a 45-minute interview.</p>
  <table class="tbl">
    <tr><th>Step</th><th>The question it answers</th><th>Minutes</th></tr>
    <tr><td>Clarify requirements</td><td>What is the business goal, who uses it, what are the limits (latency, scale, cost, explanations)?</td><td>5</td></tr>
    <tr><td>Estimate</td><td>How much traffic and data? (requests per second, storage, latency budget)</td><td>3</td></tr>
    <tr><td>Metrics</td><td>What is "good" offline and online, and what must not get worse (guardrails)?</td><td>5</td></tr>
    <tr><td>Data, labels, features</td><td>What do we learn from, what is the label, and what is known at prediction time?</td><td>8</td></tr>
    <tr><td>Baseline and model</td><td>What is the simplest thing that works, and what model beats it and why?</td><td>7</td></tr>
    <tr><td>Serving</td><td>How does a prediction arrive in time, and what happens when something fails?</td><td>8</td></tr>
    <tr><td>Monitoring, rollout, trade-offs</td><td>Is it still right next month? How do we launch safely? What did we give up?</td><td>9</td></tr>
  </table>
  <p>Two habits make the walk work. The first is to <strong>state assumptions</strong> whenever the interviewer gives no numbers: "I'll assume 3 million daily users; tell me if that's off." The second is to <strong>give a reason with every choice</strong>: not "a gradient-boosted tree", but "a gradient-boosted tree, because the data is tabular, it scores 20 rows in about a millisecond, and its feature attributions can explain a decline".</p>
  <p>The estimate step deserves a word because it is where candidates most often hand-wave. A <strong>back-of-envelope estimate</strong> is a quick calculation, accurate to within a factor of two or so, that turns the assumptions into the few numbers that drive the design: requests per second (QPS), predictions per second, rows of training data, gigabytes. The core formula is simple: requests per second = requests per day ÷ 86,400 (the seconds in a day), multiplied by a <strong>peak factor</strong> because traffic is not flat; for a food app the dinner rush is several times the daily average. Here are Biteful's base numbers, which every case below reuses:</p>
  <div class="fx" data-lang="py">DAY = 86_400                                   # seconds in a day

def per_sec(per_day, peak_factor=1):
    return per_day / DAY * peak_factor

# Biteful, stated as assumptions: 3M daily users, 4 feed loads each, 600k orders a day
feed_loads = 3_000_000 * 4
peak = per_sec(feed_loads, 4)                  # dinner peak is about 4x the daily average
print(f"feed loads/day {feed_loads:,}   average {per_sec(feed_loads):,.0f}/s   peak {peak:,.0f}/s")
print(f"orders/day 600,000   average {per_sec(600_000):.1f}/s   peak {per_sec(600_000, 4):.1f}/s")</div>
  <div class="fx" data-lang="text">feed loads/day 12,000,000   average 139/s   peak 556/s
orders/day 600,000   average 6.9/s   peak 27.8/s</div>
  <p>Twelve million feed loads a day sounds enormous, but it is only 139 per second on average and 556 per second at the dinner peak. Orders are much rarer, about 28 per second at peak. These two numbers already hint at very different designs: anything computed per feed load has to be fast and cheap, while anything computed per order can afford to be thorough. The rest of the note shows how far a few multiplications like these go.</p>

  <h2 id="sc-eta"><span class="num">02</span>Case 1: ETA Prediction</h2>
  <p>The prompt: <em>"Design the delivery-time estimate shown on every restaurant card and at checkout."</em> This is the system the whole track has been building, so here it is end to end in one place, with one decision that the earlier notes left open: how to turn a good estimate into a promise customers can trust.</p>
  <p>We begin by clarifying requirements. The questions worth asking, and the answers we will assume, are in the table, along with why each answer matters to the design.</p>
  <table class="tbl">
    <tr><th>You ask</th><th>Assumed answer</th><th>Why it matters</th></tr>
    <tr><td>What is the goal?</td><td>Kept promises: fewer late orders, cancellations and support calls, without hurting conversion</td><td>The online metric is on-time rate, not error in minutes</td></tr>
    <tr><td>Where is it shown?</td><td>On 20 cards per feed load, and once at checkout</td><td>Each request needs 20 predictions</td></tr>
    <tr><td>Latency budget?</td><td>Feed 200 ms at p99; ETA service gets 60 ms</td><td>Online, batched, with caching</td></tr>
    <tr><td>Is late worse than early?</td><td>Much worse</td><td>Predict a high quantile, not the average</td></tr>
  </table>
  <p>Next, the estimate. Every feed load needs 20 ETAs, so the peak rate is 556 × 20. To see whether the model itself is a bottleneck, we multiply the number of model calls by the measured cost of one call (a LightGBM call on 20 rows takes about 0.94 ms, as measured in <a class="xref" data-note="sd_serving">Serving</a>). For training data we assume six months of orders with 40 features each.</p>
  <div class="fx" data-lang="py">etas_per_s = peak * 20                         # 20 restaurant cards per feed load
model_ms_per_call = 0.94                       # one LightGBM call on 20 rows (measured in Serving)
cores = peak * model_ms_per_call / 1000        # busy core-seconds per second
rows = 600_000 * 180                           # 180 days of orders for training
gb = rows * 40 * 4 / 1e9                       # 40 float32 features
print(f"ETAs/s at peak {etas_per_s:,.0f}   model cores needed {cores:.2f}")
print(f"training rows {rows/1e6:.0f}M   size {gb:.1f} GB")</div>
  <div class="fx" data-lang="text">ETAs/s at peak 11,111   model cores needed 0.52
training rows 108M   size 17.3 GB</div>
  <p>The model needs about half a CPU core at peak, so model compute is not the hard part. The hard part is that each of those 11,111 predictions per second needs fresh inputs, such as how busy the kitchen is right now, within the 60 ms budget. The training set, 108 million rows and about 17 GB, fits comfortably on one large machine.</p>
  <p>For metrics, offline we track mean absolute error, the share of orders delivered later than the ETA (the <strong>late rate</strong>) and the 90th-percentile error, always measured on a <strong>time split</strong> (train on earlier weeks, test on later weeks) so the model never sees the future. Online, in an A/B test, the decision metric is the on-time rate of the ETA actually shown, with conversion, cancellations, support contacts and p99 latency as guardrails.</p>
  <p>The data and labels come from completed orders. The label is delivered time minus placed time; for Biteful's orders 101–108 that is 28, 41, 30, 58, 19, 52, 27 and 33 minutes. Cancelled orders have no delivery time, so their label is <strong>censored</strong> (we only know it would have been at least as long as the time until cancellation), and they must be handled rather than silently dropped. The main trap is <strong>leakage</strong>: features that are only known after the order is placed, such as the actual pickup time or the rider's id, would give a wonderful offline score and be useless live. The honest features are the road distance from a routing engine, the restaurant's current kitchen queue (kept fresh by a stream job reading order events), rain, the hour, and the restaurant's average prep time over the last seven days (computed nightly and joined <strong>point-in-time</strong>, meaning each training row gets the value as it was when that order was placed, not today's value). Training and serving must compute features with the same code; in the framework note, a straight-line distance used at serving time against road distance in training doubled the error.</p>
  <p>The baseline is a simple formula, 15 minutes plus 4 minutes per kilometre, which also serves as the fallback when anything fails. The main model is LightGBM on the honest features. Now the open decision. A model trained to minimise average error predicts the middle of the possible delivery times, so the real delivery is later than its estimate about half the time. Since late is much worse than early, we should promise a <strong>quantile</strong> instead: a P80 ETA is a time the delivery beats 80% of the time. <strong>Quantile regression</strong> trains a model to predict a chosen quantile directly, using the <strong>pinball loss</strong>, which charges α per minute of under-prediction and (1 − α) per minute of over-prediction; for α = 0.8 being early costs four times less than being late, so the model learns to lean late. LightGBM supports this with <code>objective="quantile"</code>. Here it is on 20,000 simulated orders with a time split:</p>
  <div class="fx" data-lang="py">import numpy as np, lightgbm as lgb

# 20,000 simulated Biteful orders (the framework note's generator, same seed)
rng = np.random.default_rng(7)
n = 20_000
day = np.sort(rng.integers(1, 61, n)); rest = rng.integers(0, 50, n)
prep_base = rng.uniform(8, 18, 50)[rest]
hour = rng.choice([12, 13, 14, 19, 20, 21, 22], n); rush = np.isin(hour, [20, 21]).astype(int)
km = np.clip(rng.gamma(2.2, 1.4, n), 0.3, 9); queue = rng.poisson(2 + 4 * rush)
rain = (rng.random(n) &lt; np.where(day &gt; 40, 0.40, 0.10)).astype(int)
pickup = prep_base + 1.3 * queue + rng.gamma(2, 1.5, n)
actual = pickup + km * (3.0 + 2.0 * rain) + 4 * rush + rng.gamma(2, 1.5, n)
prep_7d = prep_base + rng.normal(0, 1, n)
X = np.c_[km, queue, rain, hour, prep_7d]
tr, te = day &lt;= 45, day &gt; 45                       # time split: train on the past, test on the future

print(f"{'promise':&lt;14}{'late':&gt;6}{'avg ETA shown':&gt;15}{'MAE':&gt;6}")
for a in [0.5, 0.7, 0.8, 0.9]:
    m = lgb.LGBMRegressor(objective="quantile", alpha=a, n_estimators=300,
                          learning_rate=0.05, n_jobs=1, verbose=-1, random_state=0)
    eta = m.fit(X[tr], actual[tr]).predict(X[te])
    y = actual[te]
    print(f"P{int(a*100):&lt;13}{np.mean(y &gt; eta):&gt;6.0%}{eta.mean():&gt;15.1f}{np.abs(y - eta).mean():&gt;6.2f}")
print(f"actual mean on test days: {actual[te].mean():.1f} min")</div>
  <div class="fx" data-lang="text">promise         late  avg ETA shown   MAE
P50              50%           35.5  2.50
P70              31%           37.1  2.82
P80              22%           38.2  3.37
P90              12%           39.8  4.44
actual mean on test days: 35.9 min</div>
  <p>Read the table row by row. The median model (P50) is late on 50% of orders and shows 35.5 minutes on average, almost exactly the real average of 35.9. Promising the 80th percentile cuts late orders to 22% for an ETA only 2.7 minutes longer (38.2). P90 gets to 12% late but shows 39.8 minutes, which may cost conversion. Notice that MAE gets <em>worse</em> as the quantile rises, from 2.50 to 4.44, which is the clearest possible demonstration that MAE is not the goal. A railway announcement that says "arriving at 8:15" and is late half the time makes passengers angry; "arriving by 8:20" and almost always kept makes them trust the railway. Biteful starts with P80 and lets an A/B test settle P70 against P80 on on-time rate and conversion.</p>
  <figure class="viz"><svg viewBox="0 0 730 240" width="730" role="img"><defs><marker id="sc-m0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="10" y="20" width="130" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="75" y="39" text-anchor="middle" font-weight="600">Feed service</text><text x="75" y="53" text-anchor="middle" class="tm">20 cards per load</text><rect x="190" y="20" width="150" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="265" y="39" text-anchor="middle" font-weight="600">ETA service</text><text x="265" y="53" text-anchor="middle" class="tm">batch of 20, 60 ms</text><rect x="390" y="20" width="150" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="465" y="39" text-anchor="middle" font-weight="600">LightGBM P80</text><text x="465" y="53" text-anchor="middle" class="tm">in-process</text><rect x="590" y="20" width="130" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="655" y="39" text-anchor="middle" font-weight="600">Weekly training</text><text x="655" y="53" text-anchor="middle" class="tm">+ model registry</text><line x1="142" y1="42" x2="187" y2="42" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m0)"/><line x1="342" y1="42" x2="387" y2="42" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m0)"/><line x1="588" y1="42" x2="543" y2="42" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m0)"/><rect x="60" y="110" width="140" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="130" y="129" text-anchor="middle" font-weight="600">Route engine</text><text x="130" y="143" text-anchor="middle" class="tm">road km</text><rect x="240" y="110" width="150" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="315" y="129" text-anchor="middle" font-weight="600">Online store</text><text x="315" y="143" text-anchor="middle" class="tm">Redis: queue, prep_7d</text><rect x="430" y="110" width="140" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="500" y="129" text-anchor="middle" font-weight="600">Cache 60 s</text><text x="500" y="143" text-anchor="middle" class="tm">fallback 15 + 4 × km</text><line x1="240" y1="66" x2="160" y2="107" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m0)"/><line x1="285" y1="66" x2="305" y2="107" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m0)"/><line x1="330" y1="66" x2="460" y2="107" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m0)"/><rect x="10" y="186" width="150" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="85" y="211" text-anchor="middle" font-weight="600">Order events</text><rect x="190" y="186" width="150" height="40" rx="6" class="fr" stroke="currentColor" stroke-opacity=".55"/><text x="265" y="203" text-anchor="middle" font-weight="600">Stream job</text><text x="265" y="217" text-anchor="middle" class="tm">kitchen queue</text><rect x="390" y="186" width="150" height="40" rx="6" class="fr" stroke="currentColor" stroke-opacity=".55"/><text x="465" y="203" text-anchor="middle" font-weight="600">Nightly batch</text><text x="465" y="217" text-anchor="middle" class="tm">prep_7d</text><line x1="162" y1="206" x2="187" y2="206" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m0)"/><line x1="285" y1="184" x2="305" y2="157" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m0)"/><line x1="430" y1="184" x2="345" y2="157" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m0)"/></svg><figcaption>The top row is the request path; the middle row is what the ETA service reads in parallel; the bottom row keeps the online store fresh.</figcaption></figure>
  <p>The figure shows the serving design. A feed request asks the ETA service for 20 estimates at once. The service reads the road distances from the route engine and the restaurant features from the online feature store (one batched Redis read, called an MGET, for all 20 restaurants) in parallel, then makes a single batched call to the model, which is loaded inside the service process so there is no extra network hop. Results are cached for 60 seconds, keyed by model version so a new model never serves an old model's cached answers; if anything times out, the service returns the baseline formula instead of an empty card. The bottom row keeps the features fresh: a stream job reads order events and updates each kitchen's queue within seconds, and a nightly batch job recomputes seven-day prep times from the warehouse. Weekly training publishes a new model to a registry, from which the service loads it.</p>
  <p>Monitoring watches the inputs and outputs for drift (with the population stability index, PSI, on distance, rain and queue, and on the predicted ETAs themselves), the late rate on orders old enough to have a label, broken down by city and weather, the cancellation rate, and the service's latency targets. The model retrains weekly and on triggers, and a new candidate must beat the current champion on the newest week, slice by slice (<a class="xref" data-note="sd_monitoring">Monitoring</a>). The rollout is shadow first, checked by slice (the framework note's Mumbai rain bug only showed in one slice), then a 10% canary, then an A/B test randomised by zone and time slot (a switchback) because ETAs influence rider dispatch, which is shared between groups (<a class="xref" data-note="sd_experiments">Experiments</a>). The main trade-offs to state are P70 against P80 (conversion against trust), the cache time-to-live (a longer cache saves compute but serves staler queues), and nightly against streaming prep times (simplicity against freshness).</p>

  <h2 id="sc-rec"><span class="num">03</span>Case 2: Restaurant Recommendations</h2>
  <p>The prompt: <em>"Design the 'Recommended for you' row on Biteful's home screen."</em> The ETA model scored 20 restaurants that were already chosen. This row has to do the choosing, out of every restaurant that delivers to the user's address.</p>
  <table class="tbl">
    <tr><th>You ask</th><th>Assumed answer</th><th>Why it matters</th></tr>
    <tr><td>Goal: taps or orders?</td><td>Orders (and repeat orders); taps are a weaker signal</td><td>Optimising taps rewards pretty photos, not good food</td></tr>
    <tr><td>How many candidates?</td><td>About 2,000 restaurants deliver to a typical address; 20 are shown</td><td>Decides one stage or two</td></tr>
    <tr><td>Latency budget?</td><td>p99 under 150 ms for the row</td><td>How much ranking we can afford</td></tr>
    <tr><td>New restaurants?</td><td>Dozens open every week</td><td>Cold start and exploration</td></tr>
  </table>
  <p>The estimate settles the architecture. If the ranking model costs about 0.047 ms per candidate (the 0.94 ms LightGBM call on 20 rows, divided by 20), we can compute what scoring every candidate would cost:</p>
  <div class="fx" data-lang="py">ms_per_row = 0.047                             # ranker cost per candidate (0.94 ms / 20 rows)
for candidates in [2_000, 300]:
    print(f"rank {candidates:&gt;5,} candidates: {candidates * ms_per_row:5.1f} ms per request, "
          f"{peak * candidates / 1e6:.2f} M rows/s at peak")
index_mb = 50_000 * 64 * 4 / 1e6               # 50k restaurants x 64-dim float32 embeddings
print(f"restaurant embedding index: {index_mb:.1f} MB (fits in memory on every server)")</div>
  <div class="fx" data-lang="text">rank 2,000 candidates:  94.0 ms per request, 1.11 M rows/s at peak
rank   300 candidates:  14.1 ms per request, 0.17 M rows/s at peak
restaurant embedding index: 12.8 MB (fits in memory on every server)</div>
  <p>Ranking all 2,000 candidates would take about 94 ms of the 150 ms budget for every single request and require 1.11 million model rows per second at peak. Ranking 300 takes about 14 ms. That one comparison forces a <strong>two-stage design</strong>: a cheap <strong>retrieval</strong> stage that narrows 2,000 restaurants to a few hundred plausible ones, followed by a careful <strong>ranking</strong> stage that scores only those. Hiring works the same way: HR screens 2,000 CVs with keyword filters, which is fast and rough, and managers interview the 50 who pass, which is slow and careful. Interviewing all 2,000 would be better in theory and impossible in practice. The last line shows that the restaurant vectors used by retrieval take only about 13 MB, so every server can hold them in memory.</p>
  <figure class="viz"><svg viewBox="0 0 680 200" width="680" role="img"><rect x="20" y="8" width="360" height="36" rx="4" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="200" y="31" text-anchor="middle" font-weight="600">2,000 in range</text><text x="410" y="24" text-anchor="start" font-weight="600">Corpus</text><text x="410" y="39" text-anchor="start" class="tm">restaurants delivering here</text><rect x="65" y="55" width="270" height="36" rx="4" class="fb" stroke="currentColor" stroke-opacity=".4"/><text x="200" y="78" text-anchor="middle" font-weight="600">~300</text><text x="410" y="71" text-anchor="start" font-weight="600">Retrieval</text><text x="410" y="86" text-anchor="start" class="tm">ANN / rules, cheap, ~10 ms</text><rect x="110" y="102" width="180" height="36" rx="4" class="fv" stroke="currentColor" stroke-opacity=".4"/><text x="200" y="125" text-anchor="middle" font-weight="600">~50</text><text x="410" y="118" text-anchor="start" font-weight="600">Ranking</text><text x="410" y="133" text-anchor="start" class="tm">heavy model, rich features</text><rect x="150" y="149" width="100" height="36" rx="4" class="fg" stroke="currentColor" stroke-opacity=".4"/><text x="200" y="172" text-anchor="middle" font-weight="600">20 shown</text><text x="410" y="165" text-anchor="start" font-weight="600">Re-rank</text><text x="410" y="180" text-anchor="start" class="tm">diversity, business rules</text></svg><figcaption>Each stage shrinks the set so the next, more expensive step can afford to look closely.</figcaption></figure>
  <p>The funnel in the figure has one more stage at the bottom: <strong>re-ranking</strong> applies business rules after the model, such as not showing 20 biryani places in a row, or reserving a slot for a new restaurant.</p>
  <p>The metrics follow the two stages. Offline, we replay each user's next session against our ranked list. <strong>Recall@K</strong> asks: of the restaurants the user engaged with, what fraction appeared in our top K? It measures whether retrieval fetched the right candidates at all. <strong>NDCG@K</strong> (normalised discounted cumulative gain) also rewards putting the best ones <em>near the top</em>: each item's gain is divided by log₂(position + 1), so the same item is worth less further down, and the total is divided by the best possible total, so a perfect order scores 1. Online, the decision metric is orders per user in an A/B test, with interleaving used to screen candidate rankers quickly; guardrails are latency, diversity and new-restaurant exposure. Here is a worked example. In her next session Asha ordered from Biryani Bros (gain 3), opened Dosa Hut's menu (gain 2) and tapped Thali Bar's card (gain 1), and two models had ranked five restaurants:</p>
  <div class="fx" data-lang="py">import math

def recall_at_k(ranked, relevant, k):
    return len(set(ranked[:k]) &amp; relevant) / len(relevant)

def ndcg_at_k(ranked, gains, k):
    dcg = sum(gains.get(item, 0) / math.log2(pos + 2) for pos, item in enumerate(ranked[:k]))
    ideal = sorted(gains.values(), reverse=True)[:k]
    idcg = sum(g / math.log2(pos + 2) for pos, g in enumerate(ideal))
    return dcg / idcg

# What Asha actually did next session: ordered = 3, opened menu = 2, tapped card = 1
gains = {"Biryani Bros": 3, "Dosa Hut": 2, "Thali Bar": 1}
model_a = ["Biryani Bros", "Pizza Point", "Dosa Hut", "Momo Stop", "Thali Bar"]
model_b = ["Momo Stop", "Pizza Point", "Thali Bar", "Dosa Hut", "Biryani Bros"]
for name, ranked in [("A", model_a), ("B", model_b)]:
    print(name, "Recall@3 =", round(recall_at_k(ranked, set(gains), 3), 2),
          " NDCG@5 =", round(ndcg_at_k(ranked, gains, 5), 3))</div>
  <div class="fx" data-lang="text">A Recall@3 = 0.67  NDCG@5 = 0.921
B Recall@3 = 0.33  NDCG@5 = 0.53</div>
  <p>Trace model A by hand. Its DCG is 3/log₂2 + 0 + 2/log₂4 + 0 + 1/log₂6 = 3 + 1 + 0.387 = 4.387. The ideal order (3, 2, 1) gives 3 + 2/log₂3 + 1/log₂4 = 3 + 1.262 + 0.5 = 4.762, so NDCG = 4.387 / 4.762 = 0.921. Model B contains the same five restaurants but buries Biryani Bros at the bottom, so it scores 0.53. (The code's <code>pos + 2</code> is "position + 1" with positions counted from 0.) More ranking metrics are in <a class="xref" data-note="ml_rs_ranking">Ranking &amp; Evaluation</a>.</p>
  <p>The labels are <strong>implicit feedback</strong>: nobody rates restaurants, so we infer preference from behaviour, ordered &gt; opened the menu &gt; tapped the card &gt; shown but ignored. The shown-but-ignored restaurants are the most valuable negatives, because they are the ones the old system thought were good and the user rejected; a model trained only on random negatives never learns from them, which is why every impression must be logged. Features come in four groups: the user (cuisines ordered, price range, usual order times), the restaurant (cuisine, rating, price and, importantly, its ETA from case 1), the context (hour, weather, weekday) and crosses between them (this user's past order rate for this cuisine).</p>
  <p>The baseline is "popular near you in your favourite cuisines" (<a class="xref" data-note="ml_recsys">Recommendation Systems</a>). For retrieval, the standard model is a <strong>two-tower model</strong>: one neural network turns the user into a vector, another turns each restaurant into a vector, and training pulls a user's vector close to the vectors of restaurants they order from. Because the restaurant side does not depend on the user, all restaurant vectors can be computed offline and stored in an <strong>ANN index</strong> (approximate nearest neighbour, a data structure such as FAISS or ScaNN that finds the closest vectors in milliseconds without comparing against every one). At request time we compute Asha's vector and fetch her nearest few hundred restaurants, plus a few candidates from simple sources such as "ordered before" and "popular now". The ranker is a gradient-boosted tree on the rich features above, later perhaps a multi-task neural network predicting taps and orders together.</p>
  <figure class="viz"><svg viewBox="0 0 740 196" width="740" role="img"><defs><marker id="sc-m1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><text x="10" y="14" text-anchor="start" class="tb" font-weight="600">Offline (daily)</text><rect x="10" y="22" width="160" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="90" y="41" text-anchor="middle" font-weight="600">ANN index</text><text x="90" y="55" text-anchor="middle" class="tm">FAISS / ScaNN</text><rect x="196" y="22" width="160" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="276" y="48" text-anchor="middle" font-weight="600">Restaurant embeddings</text><rect x="382" y="22" width="160" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="462" y="41" text-anchor="middle" font-weight="600">Train two-tower</text><text x="462" y="55" text-anchor="middle" class="tm">+ ranker</text><rect x="568" y="22" width="160" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="648" y="48" text-anchor="middle" font-weight="600">Interaction logs</text><line x1="566" y1="44" x2="545" y2="44" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m1)"/><line x1="380" y1="44" x2="359" y2="44" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m1)"/><line x1="194" y1="44" x2="173" y2="44" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m1)"/><text x="10" y="188" text-anchor="start" class="tb" font-weight="600">Online (per request, &lt;150 ms)</text><rect x="10" y="126" width="128" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="74" y="145" text-anchor="middle" font-weight="600">Request</text><text x="74" y="159" text-anchor="middle" class="tm">user_id</text><rect x="158" y="126" width="128" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="222" y="145" text-anchor="middle" font-weight="600">Candidates</text><text x="222" y="159" text-anchor="middle" class="tm">ANN + popular</text><rect x="306" y="126" width="128" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="370" y="145" text-anchor="middle" font-weight="600">Ranker</text><text x="370" y="159" text-anchor="middle" class="tm">GBM / DNN</text><rect x="454" y="126" width="128" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="518" y="145" text-anchor="middle" font-weight="600">Re-rank</text><text x="518" y="159" text-anchor="middle" class="tm">diversity</text><rect x="602" y="126" width="128" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="666" y="152" text-anchor="middle" font-weight="600">Feed</text><line x1="140" y1="148" x2="155" y2="148" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m1)"/><line x1="288" y1="148" x2="303" y2="148" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m1)"/><line x1="436" y1="148" x2="451" y2="148" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m1)"/><line x1="584" y1="148" x2="599" y2="148" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m1)"/><line x1="90" y1="68" x2="222" y2="123" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#sc-m1)"/><line x1="462" y1="68" x2="370" y2="123" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#sc-m1)"/><line x1="666" y1="124" x2="648" y2="69" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#sc-m1)"/></svg><figcaption>Dashed arrows cross the offline/online line: the index and model ship down, logged impressions flow back up.</figcaption></figure>
  <p>The architecture figure has two halves. The top row runs offline once a day, right to left: interaction logs train the two-tower model and the ranker, the restaurant tower produces embeddings, and the embeddings are built into the ANN index. The bottom row runs on every request, left to right, within the 150 ms budget: fetch candidates from the index and simple sources, rank them, re-rank for diversity, and return the feed. A sensible split of the budget is roughly 20 ms network, 15 ms feature fetch, 20 ms retrieval, 60 ms ranking, 10 ms re-ranking and 25 ms of slack for slow hops. The failure plan matters as much as the happy path: if the ranker times out, serve the candidates in retrieval order; if everything fails, serve a cached "popular near you" row. Never an empty screen.</p>
  <p>Monitoring watches order rate by slice (new users, each cuisine), <strong>coverage</strong> (the share of restaurants shown at least once a day), new-restaurant exposure, drift in the embeddings and p99 latency. The biggest risk is the feedback loop described in <a class="xref" data-note="sd_experiments">Experiments</a>: the system only gets labels for restaurants it shows, so new restaurants can starve forever unless some slots are reserved for exploration. For a brand-new restaurant, the item tower can use content (cuisine, menu text, photos, price) to give it a reasonable vector before it has any orders. The trade-offs to name are orders against taps as the objective, the short-term cost of exploration against the long-term health of the catalogue, and the simplicity of a GBM ranker against the gains of a multi-task network.</p>
  <p>Interviewers often ask for <strong>search ranking</strong> instead ("design restaurant and dish search"), and it is the same funnel with a query added. Retrieval now has to match the query: a lexical index such as BM25 catches exact words ("paneer tikka"), an embedding of the query catches meaning ("something spicy and vegetarian"), and the two candidate sets are merged. A query-understanding step in front fixes spelling, detects intent (a dish, a restaurant name, a cuisine) and applies filters such as "open now". The ranker gains query-document features (text match scores, how often users who typed this query ordered from this restaurant), and labels come from clicks and orders after a search, corrected for <strong>position bias</strong> (people click the first result partly because it is first). The metrics are the same, NDCG and recall at K, plus search-specific ones such as the share of searches with no result or no click.</p>

  <h2 id="sc-fraud"><span class="num">04</span>Case 3: Payment Fraud</h2>
  <p>The prompt: <em>"Score every Biteful payment and refund claim for fraud before it completes."</em> Recommendations receive millions of positive signals a day within minutes. Fraud is the opposite: positives are rare, the truth arrives months later, and someone is actively trying to fool the model.</p>
  <table class="tbl">
    <tr><th>You ask</th><th>Assumed answer</th><th>Why it matters</th></tr>
    <tr><td>What actions are possible?</td><td>Approve, step up (ask for an OTP) or send to review, block</td><td>Three bands, so two thresholds</td></tr>
    <tr><td>Time budget?</td><td>Under 100 ms at p99, inside checkout</td><td>No heavy joins; fast model</td></tr>
    <tr><td>How rare is fraud?</td><td>About 0.1% of payments; refund abuse ("food never arrived") is rising</td><td>Accuracy is meaningless</td></tr>
    <tr><td>Must declines be explained?</td><td>Yes, to customers and the payment partner</td><td>Reason codes from the model</td></tr>
  </table>
  <p>The estimate shows that throughput is not the problem here, and points to a different constraint:</p>
  <div class="fx" data-lang="py">payments = 600_000                             # one payment per order
frauds = payments * 0.001                      # ~0.1% are fraudulent
review_share = 0.005                           # send 0.5% of payments to human review
cases = payments * review_share
analysts = cases / (20 * 8)                    # 20 cases an hour, 8-hour shift
print(f"payments: {per_sec(payments):.1f}/s average, {per_sec(payments, 4):.1f}/s peak")
print(f"frauds/day {frauds:.0f}   review cases/day {cases:,.0f}   analysts needed {analysts:.0f}")</div>
  <div class="fx" data-lang="text">payments: 6.9/s average, 27.8/s peak
frauds/day 600   review cases/day 3,000   analysts needed 19</div>
  <p>At under 28 payments per second at peak, any reasonable model can keep up. Fraud at 0.1% is about 600 cases a day, so the data is dominated by legitimate payments. The surprising number is the last one: if the model sends 0.5% of payments to human review, that is 3,000 cases a day, and at 20 cases an hour per analyst the company needs 19 analysts. The width of the "review" band is therefore set by the size of the review team, not only by the model.</p>
  <p>For metrics, plain accuracy is useless: a model that approves everything is 99.9% accurate and catches nothing (the Common Mistakes section shows this in code). With rare positives we use <strong>precision</strong> (of the payments we flag, how many are fraud), <strong>recall</strong> (of all fraud, how much we flag), <strong>PR-AUC</strong> (the area under the precision-recall curve, which unlike ROC-AUC is not flattered by the huge number of easy negatives) and recall at a fixed false-positive rate (<a class="xref" data-note="ml_evaluation">Model Evaluation</a>). Best of all is to express the trade-off in money: the cost of a threshold is the fraud it lets through plus a cost, say ₹150, for every good customer it wrongly declines (lost margin and an annoyed customer). Here is the block threshold chosen on 100,000 simulated payments, about four hours of Biteful traffic:</p>
  <div class="fx" data-lang="py">import numpy as np

rng = np.random.default_rng(7)
n_legit, n_fraud = 99_900, 100                       # 0.1% fraud in 100k Biteful payments
score = np.r_[rng.beta(1, 12, n_legit), rng.beta(5, 2, n_fraud)]
is_fraud = np.r_[np.zeros(n_legit, bool), np.ones(n_fraud, bool)]
amount = np.r_[rng.gamma(2, 1_000, n_legit), rng.gamma(2, 4_000, n_fraud)]   # rupees

DECLINE_COST = 150        # lost margin + annoyed customer for each good payment we block
for t in [0.3, 0.5, 0.7, 0.9]:
    block = score &gt;= t
    caught = (block &amp; is_fraud).sum()
    false_decl = (block &amp; ~is_fraud).sum()
    precision = caught / max(block.sum(), 1)
    fraud_loss = amount[~block &amp; is_fraud].sum()
    cost = fraud_loss + false_decl * DECLINE_COST
    print(f"t={t}: recall={caught/n_fraud:.0%} precision={precision:.0%} "
          f"false declines={false_decl:&gt;4} total cost=Rs {cost:,.0f}")</div>
  <div class="fx" data-lang="text">t=0.3: recall=100% precision=7% false declines=1344 total cost=Rs 201,600
t=0.5: recall=89% precision=78% false declines=  25 total cost=Rs 91,908
t=0.7: recall=53% precision=100% false declines=   0 total cost=Rs 343,580
t=0.9: recall=12% precision=100% false declines=   0 total cost=Rs 642,952</div>
  <p>At a threshold of 0.3, every fraud is caught but 1,344 good customers are declined, costing 1,344 × ₹150 = ₹201,600. At 0.9 nobody good is declined, but 88% of fraud gets through and costs ₹642,952. The cheapest threshold is 0.5, at ₹91,908. The line <code>fraud_loss = amount[~block &amp; is_fraud].sum()</code> weights each missed fraud by its rupee amount, so missing a ₹40,000 fraud counts far more than missing a ₹200 one, which is exactly how the business experiences it. In production this becomes three bands:</p>
  <figure class="viz"><svg viewBox="0 0 720 104" width="720" role="img"><rect x="20" y="20" width="340" height="40" rx="3" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="190" y="45" text-anchor="middle" font-weight="600">approve</text><rect x="360" y="20" width="136" height="40" rx="3" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="428" y="45" text-anchor="middle" font-weight="600">review / OTP</text><rect x="496" y="20" width="204" height="40" rx="3" class="fr" stroke="currentColor" stroke-opacity=".55"/><text x="598" y="45" text-anchor="middle" font-weight="600">block</text><text x="20" y="78" text-anchor="middle" class="tm">0</text><text x="360" y="78" text-anchor="middle" class="tm">0.5</text><text x="496" y="78" text-anchor="middle" class="tm">0.7</text><text x="700" y="78" text-anchor="middle" class="tm">1.0</text><text x="360" y="98" text-anchor="middle" class="tm">fraud score →</text></svg><figcaption>Two thresholds, three actions. The middle band's width is limited by how many cases analysts (or OTP friction) can absorb.</figcaption></figure>
  <p>Scores below 0.5 are approved, scores above 0.7 are blocked, and the band in between gets friction (an OTP) or a human look. Tuning the two thresholds means trading fraud losses, customer friction and analyst hours against each other.</p>
  <p>The labels are the hard part of this case. The main label is a <strong>chargeback</strong>, a payment reversed after the cardholder disputes it, and chargebacks arrive 30 to 90 days after the payment, so the newest data has no labels yet (<a class="xref" data-note="sd_monitoring">Monitoring</a> covers this delayed-label problem). Analyst verdicts and refund investigations add faster but noisier labels. Worse, blocked payments never complete, so they never get a chargeback: the model gets no feedback on its own blocks, a problem called <strong>selective labels</strong>. The standard fix is to let a tiny random sample of borderline payments through (with loss limits) or send them to review, so some labels exist for the blocked region.</p>
  <p>The strongest features are <strong>velocity features</strong>: counts or sums over a recent time window for one entity, such as how many payments this account made in the last 10 minutes, hour and day. A stolen card is used fast and many times before it is cancelled. Others include the amount compared with this user's usual, a new device or IP address, refunds claimed per order, and graph links (accounts sharing a device or address with a known fraudster). Velocity has to be fresh to the second, so a stream job maintains it. Here is the core logic:</p>
  <div class="fx" data-lang="py">from collections import deque, defaultdict

WINDOW = 600                      # seconds (10 minutes)
recent = defaultdict(deque)       # account -&gt; timestamps of its recent payments

def payments_10m(account, ts):
    q = recent[account]
    q.append(ts)
    while q[0] &lt;= ts - WINDOW:    # drop payments older than 10 minutes
        q.popleft()
    return len(q)

events = [("acct_9", 0), ("acct_9", 30), ("acct_4", 45), ("acct_9", 50),
          ("acct_9", 55), ("acct_9", 700)]
for acct, ts in events:
    print(acct, "t =", ts, "-&gt; payments in last 10 min:", payments_10m(acct, ts))</div>
  <div class="fx" data-lang="text">acct_9 t = 0 -&gt; payments in last 10 min: 1
acct_9 t = 30 -&gt; payments in last 10 min: 2
acct_4 t = 45 -&gt; payments in last 10 min: 1
acct_9 t = 50 -&gt; payments in last 10 min: 3
acct_9 t = 55 -&gt; payments in last 10 min: 4
acct_9 t = 700 -&gt; payments in last 10 min: 1</div>
  <p>Each account keeps a queue of its recent payment timestamps. A new payment is appended, and the <code>while</code> loop drops anything older than 600 seconds. acct_9 reaches 4 payments within 55 seconds, a classic stolen-card burst, while acct_4 stays at 1. At t = 700 the old payments have expired and acct_9's count is back to 1. In production a stream processor such as Flink or Kafka Streams (<a class="xref" data-note="de_kafka">Kafka</a>) runs exactly this per account and writes the counts to Redis, where the scorer reads them.</p>
  <figure class="viz"><svg viewBox="0 0 740 196" width="740" role="img"><defs><marker id="sc-m3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="10" y="14" width="160" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="90" y="40" text-anchor="middle" font-weight="600">Payment</text><rect x="196" y="14" width="160" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="276" y="33" text-anchor="middle" font-weight="600">Rules</text><text x="276" y="47" text-anchor="middle" class="tm">blocklists, limits</text><rect x="382" y="14" width="160" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="462" y="33" text-anchor="middle" font-weight="600">GBM score</text><text x="462" y="47" text-anchor="middle" class="tm">txn + velocity</text><rect x="568" y="14" width="160" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="648" y="33" text-anchor="middle" font-weight="600">Decision</text><text x="648" y="47" text-anchor="middle" class="tm">approve/review/block</text><line x1="172" y1="36" x2="193" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><line x1="358" y1="36" x2="379" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><line x1="544" y1="36" x2="565" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><rect x="10" y="140" width="160" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="90" y="166" text-anchor="middle" font-weight="600">Event stream</text><rect x="196" y="140" width="160" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="276" y="159" text-anchor="middle" font-weight="600">Stream job</text><text x="276" y="173" text-anchor="middle" class="tm">velocity feats</text><rect x="382" y="140" width="160" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="462" y="159" text-anchor="middle" font-weight="600">Online store</text><text x="462" y="173" text-anchor="middle" class="tm">Redis</text><rect x="568" y="140" width="160" height="44" rx="6" class="fr" stroke="currentColor" stroke-opacity=".55"/><text x="648" y="159" text-anchor="middle" font-weight="600">Analysts +</text><text x="648" y="173" text-anchor="middle" class="tm">chargebacks</text><line x1="172" y1="162" x2="193" y2="162" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><line x1="358" y1="162" x2="379" y2="162" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><line x1="90" y1="60" x2="90" y2="137" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><line x1="462" y1="138" x2="462" y2="61" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><line x1="648" y1="60" x2="648" y2="137" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><text x="640" y="104" text-anchor="end" class="tm">labels → retrain</text></svg><figcaption>Scoring happens inside the payment path. Velocity features come from a stream job; labels come from analysts and chargebacks weeks later.</figcaption></figure>
  <p>The figure shows the full system. Each payment passes first through <strong>rules</strong> (blocklists of known bad cards and devices, hard limits such as "more than 5 payments in 10 minutes"), then through the model, then to a decision. Every payment also goes onto the event stream, where the stream job updates the velocity counts the model reads from Redis. Decisions flow to analysts, and their verdicts plus chargebacks become the labels for retraining. The baseline is the rules alone. The main model is a gradient-boosted tree, because the data is tabular, it scores in a millisecond or two, and SHAP values (per-feature contributions to a score) provide the reason codes needed to explain a decline. The rules stay in front even after the model exists, because a new attack can be blocked by a rule within minutes, while retraining takes days.</p>
  <p>The 100 ms budget splits roughly into 20 ms of network, 5 ms of rules, 10 ms of parallel Redis reads and 5–20 ms for the model, with the rest as slack. If the model or Redis times out, the system falls back to rules only; a payment must never hang. Monitoring runs daily on what is available immediately (the score distribution, decline rate and review queue size) and monthly on recall measured only over cohorts whose labels have matured. Training and evaluation must be split by time, because fraud patterns move and a random split lets the model learn from the future. Fraudsters adapt within days, so the system needs fast rules, frequent retraining, graph features that are expensive to fake and drift alerts. The trade-offs to name are recall against customer friction, an explainable GBM against a more powerful deep sequence model over each account's history, and rules (fast to change, brittle) against the model (slower to change, generalises).</p>

  <h2 id="sc-fc"><span class="num">05</span>Case 4: Demand Forecasting</h2>
  <p>The prompt: <em>"Forecast orders per zone per 30-minute slot for the next 7 days, to plan rider shifts."</em> The first three cases answered while someone waited. Here nobody is waiting: the shift planner needs numbers by tomorrow morning. Too few riders scheduled means late food, which breaks case 1's promises; too many means paying riders to stand idle.</p>
  <table class="tbl">
    <tr><th>You ask</th><th>Assumed answer</th><th>Why it matters</th></tr>
    <tr><td>Who uses it, and when?</td><td>The shift planner, nightly</td><td>A batch job; no request latency</td></tr>
    <tr><td>How far ahead?</td><td>1–7 days</td><td>Seven forecasts per zone-slot</td></tr>
    <tr><td>Is one number enough?</td><td>No: staffing needs a safety margin</td><td>Quantile forecasts (P50, P90)</td></tr>
    <tr><td>Known future events?</td><td>Promotions, holidays, cricket match days</td><td>Features known in advance</td></tr>
  </table>
  <div class="fx" data-lang="py">zones, slots, horizon = 300, 48, 7             # zones x half-hour slots x days ahead
forecasts = zones * slots * horizon
history_rows = zones * slots * 730             # two years of zone-slot history
print(f"forecasts per night {forecasts:,}   history rows {history_rows/1e6:.1f}M")
print(f"history size at 30 features x 4 B: {history_rows * 30 * 4 / 1e9:.2f} GB")</div>
  <div class="fx" data-lang="text">forecasts per night 100,800   history rows 10.5M
history size at 30 features x 4 B: 1.26 GB</div>
  <p>The estimate shows that this is a small problem in computing terms: about 100,000 forecasts a night and two years of history that fits in about 1.3 GB, so one machine finishes in minutes. The difficulty is not scale but <strong>uncertainty</strong> (next Friday is genuinely unknown) and <strong>missing truth</strong> (some history does not show real demand). That changes where the effort should go: into the metric, the quantiles and the evaluation, not into distributed infrastructure.</p>
  <p>Three metrics are standard. <strong>WAPE</strong> (weighted absolute percentage error) is the total absolute error divided by the total actual orders; unlike MAPE, which divides each slot's error by that slot's actual, it does not explode on slots with zero or one order. <strong>Bias</strong> is the total forecast minus the total actual, divided by the total actual: positive means we over-staff, negative means food runs late. The <strong>pinball loss</strong> from case 1 scores a quantile forecast: for P90, being below the actual costs nine times more than being above it, which matches the business cost of running out of riders. Online, what matters is the late-order rate and rider idle time. Here is one week for the Kothrud zone's 8:00–8:30 pm slot:</p>
  <div class="fx" data-lang="py">import numpy as np

# Orders in the Kothrud zone, 20:00-20:30, Mon..Sun, in tens (12 = 120 orders)
actual    = np.array([12, 8, 0, 15, 30, 9, 11])     # Wednesday: app outage, 0 orders recorded
naive     = np.array([10, 9, 7, 14, 20, 12, 10])    # "same slot last week"
model     = np.array([11, 8, 2, 16, 27, 10, 11])    # the GBM's median forecast
model_p90 = np.array([15, 11, 4, 20, 34, 13, 14])   # the GBM's 90th-percentile forecast

def wape(y, f):  return np.abs(y - f).sum() / y.sum()
def bias(y, f):  return (f - y).sum() / y.sum()
def pinball(y, f, q):
    d = y - f
    return np.mean(np.maximum(q * d, (q - 1) * d))

for name, f in [("naive", naive), ("model", model)]:
    print(f"{name}: WAPE={wape(actual, f):.1%}  bias={bias(actual, f):+.1%}")
print(f"P90 pinball={pinball(actual, model_p90, 0.9):.2f}  covered={np.mean(actual &lt;= model_p90):.0%} of days")</div>
  <div class="fx" data-lang="text">naive: WAPE=29.4%  bias=-3.5%
model: WAPE=9.4%  bias=+0.0%
P90 pinball=0.37  covered=100% of days</div>
  <p>Trace the model line. Its absolute errors are 1, 0, 2, 1, 3, 1 and 0, a total of 8, over 85 actual orders (in tens), so WAPE = 8 ÷ 85 = 9.4%; its forecasts also sum to 85, so the bias is zero. The naive "same slot last week" forecast misses Friday's spike (20 against 30) and has a WAPE of 29.4%. The P90 forecast was above the actual every day; over a long period a good P90 should cover about 90% of slots, so 100% in one week hints that it is slightly too high. Now look at Wednesday: the actual is 0 because the app was down for that half-hour. That zero is not demand, it is <strong>censored</strong> demand: we observed what was served, not what was wanted. Training on it teaches the model that Wednesday evenings are dead, the model under-forecasts, Biteful under-staffs, deliveries run late, customers leave, real orders fall, and the model appears to have been right. Outage slots must be masked or filled in using the app's outage log before training.</p>
  <p>The data is orders per zone-slot plus the outage log, promotions, holidays (Diwali, Ganesh Chaturthi), the cricket schedule and the weather forecast. Features are lags (the same slot 7, 14 and 28 days ago), rolling averages, day of week, promotion flags, the rain forecast and the zone's type. The baseline is the <strong>seasonal naive</strong> forecast ("same slot last week") shown above. The main model is <strong>one global LightGBM</strong> across all zones with a quantile objective, as in case 1. A global model is chosen over 300 per-zone models because most zone-slot histories are short and noisy, and a single model can learn that a promotion in Kothrud behaves like a promotion in Baner; it also handles new zones through their features and is one pipeline to monitor instead of 300 (<a class="xref" data-note="ml_ts_ml">ML for Time Series</a>). A chaiwala near a college reasons the same way when buying milk: usually 20 litres, up to 28 on exam days, and since running out loses the day's customers while extra milk merely spoils, he buys near the high end. That is a P90 forecast.</p>
  <figure class="viz"><svg viewBox="0 0 740 196" width="740" role="img"><defs><marker id="sc-m2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="10" y="14" width="160" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="90" y="40" text-anchor="middle" font-weight="600">Order history</text><rect x="10" y="74" width="160" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="90" y="93" text-anchor="middle" font-weight="600">Promos, holidays,</text><text x="90" y="107" text-anchor="middle" class="tm">cricket, weather</text><rect x="205" y="44" width="160" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="285" y="63" text-anchor="middle" font-weight="600">Features</text><text x="285" y="77" text-anchor="middle" class="tm">lags, rolling</text><rect x="400" y="44" width="150" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="475" y="63" text-anchor="middle" font-weight="600">Global GBM</text><text x="475" y="77" text-anchor="middle" class="tm">all zones x slots</text><rect x="585" y="44" width="145" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="657.5" y="63" text-anchor="middle" font-weight="600">Forecasts</text><text x="657.5" y="77" text-anchor="middle" class="tm">P10 / P50 / P90</text><rect x="585" y="140" width="145" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="657.5" y="159" text-anchor="middle" font-weight="600">Rider shifts</text><text x="657.5" y="173" text-anchor="middle" class="tm">planned</text><rect x="400" y="140" width="150" height="44" rx="6" class="fr" stroke="currentColor" stroke-opacity=".55"/><text x="475" y="159" text-anchor="middle" font-weight="600">Backtest vs actual</text><text x="475" y="173" text-anchor="middle" class="tm">WAPE, bias</text><line x1="172" y1="36" x2="203" y2="60" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m2)"/><line x1="172" y1="96" x2="203" y2="74" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m2)"/><line x1="367" y1="66" x2="397" y2="66" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m2)"/><line x1="552" y1="66" x2="582" y2="66" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m2)"/><line x1="657.5" y1="90" x2="657.5" y2="137" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m2)"/><line x1="583" y1="162" x2="553" y2="162" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m2)"/><line x1="475" y1="138" x2="475" y2="91" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#sc-m2)"/><text x="482" y="118" text-anchor="start" class="tm">weekly retrain</text></svg><figcaption>A batch system: no online latency, but quantiles and backtests matter more than a single accuracy number.</figcaption></figure>
  <p>Serving is a nightly pipeline (<a class="xref" data-note="de_etl">ETL</a>), drawn in the figure. It first checks its inputs (did today's orders land, are row counts normal?), then builds features, predicts P10, P50 and P90 for every zone-slot, and writes a forecasts table that the planner reads by 6 am. If the inputs are missing, it reuses yesterday's forecasts shifted by a day rather than publishing garbage. Evaluation uses a <strong>rolling-origin backtest</strong>: train on data up to week t, forecast week t + 1, slide forward a week and repeat, so every test week is genuinely in the future of its training data; a random split would let the model peek at neighbouring days. Monitoring is easier than in the other cases because the truth arrives the next day: WAPE and bias by zone, P90 coverage, and the number of outage-masked slots. The trade-offs are global against per-zone models, a higher quantile (fewer late orders) against idle rider pay, and how often to retrain against how fast the world shifts (a new cricket schedule, a new competitor).</p>

  <h2 id="sc-ads"><span class="num">06</span>Case 5: Sponsored Listings</h2>
  <p>The prompt: <em>"Predict click probability for sponsored restaurant cards, to run the ad auction."</em> Restaurants pay per click to appear in two "Sponsored" slots on the feed. In every earlier case the model's number was used to rank or to decide. Here it is multiplied by a bid and directly sets a price, and that changes what we demand of the model.</p>
  <div class="fx" data-lang="py">impressions = feed_loads * 2                   # 2 sponsored slots per feed load
preds = peak * 50                              # ~50 sponsored candidates scored per request
print(f"impressions/day {impressions/1e6:.0f}M   clicks/day at 1% CTR {impressions*0.01/1e3:.0f}k")
print(f"pCTR predictions/s at peak {preds:,.0f}")</div>
  <div class="fx" data-lang="text">impressions/day 24M   clicks/day at 1% CTR 240k
pCTR predictions/s at peak 27,778</div>
  <p>Two slots per feed load gives 24 million sponsored impressions a day and, at a typical 1% click-through rate (CTR), about 240,000 clicks. Scoring about 50 candidate sponsored restaurants per request means roughly 28,000 predictions per second at peak, with a few milliseconds of budget, which favours small, fast models refreshed often.</p>
  <p>The auction ranks ads by <strong>eCPM</strong> (expected cost per mille), the expected revenue per thousand impressions: 1,000 × bid × pCTR, where pCTR is the model's predicted click-through rate. The winner pays per click just enough to beat the runner-up. Because pCTR multiplies the bid, its absolute value matters, not just its order. A model is <strong>calibrated</strong> when its probabilities match reality: of all cards it scores at 2%, about 2% are clicked. AUC only measures whether clicked cards score higher than unclicked ones, so a model can have a perfect AUC and still be 30% too high everywhere. The right offline metrics are <strong>log loss</strong>, which punishes confident wrong probabilities, and the <strong>calibration ratio</strong>, mean predicted CTR divided by observed CTR, which should be close to 1.0 (<a class="xref" data-note="ml_calibration">Calibration</a>). Online, the metrics are revenue per thousand impressions, CTR and restaurants' return on spend, with users hiding sponsored cards as a guardrail. Three things in code: fixing a common training shortcut, what miscalibration does to an auction, and a calibration check.</p>
  <div class="fx" data-lang="py">import numpy as np

# 1) Negative downsampling: keep all clicks, keep only w = 10% of non-clicks
true_ctr, w = 0.01, 0.10
q = true_ctr / (true_ctr + (1 - true_ctr) * w)        # CTR the model sees in training data
p = q / (q + (1 - q) / w)                              # correction back to the real scale
print(f"training-data CTR q = {q:.4f}  corrected p = {p:.4f}")

# 2) Why calibration is money: auction ranks by bid x pCTR, price per click from runner-up
ads = {"A": (20.0, 0.010), "B": (12.0, 0.020), "C": (30.0, 0.005)}   # (bid Rs per click, pCTR)
def auction(ads):
    ranked = sorted(ads, key=lambda a: ads[a][0] * ads[a][1], reverse=True)
    win, second = ranked[0], ranked[1]
    ecpm = {a: round(1000 * b * c, 1) for a, (b, c) in ads.items()}
    price = ads[second][0] * ads[second][1] / ads[win][1]   # pay just enough to beat runner-up
    return ecpm, win, round(price, 2)
print(auction(ads))
ads["A"] = (20.0, 0.013)                                     # model over-predicts A by 30%
print(auction(ads))

# 3) Calibration check: mean predicted vs observed CTR, plus log loss
rng = np.random.default_rng(3)
pred = rng.beta(1, 80, 200_000)                  # model says ~1.2%
clicked = rng.random(200_000) &lt; pred * 0.8       # reality is 20% lower
ll = -np.mean(clicked * np.log(pred) + (~clicked) * np.log(1 - pred))
print(f"mean pCTR {pred.mean():.4f}  observed CTR {clicked.mean():.4f}  "
      f"calibration ratio {pred.mean() / clicked.mean():.2f}  log loss {ll:.4f}")</div>
  <div class="fx" data-lang="text">training-data CTR q = 0.0917  corrected p = 0.0100
({'A': 200.0, 'B': 240.0, 'C': 150.0}, 'B', 10.0)
({'A': 260.0, 'B': 240.0, 'C': 150.0}, 'A', 18.46)
mean pCTR 0.0124  observed CTR 0.0102  calibration ratio 1.21  log loss 0.0531</div>
  <p>Part 1 handles <strong>negative downsampling</strong>. With 24 million impressions a day and only 1% clicks, teams usually keep every click but only a fraction w of the non-clicks, here 10%, to make training cheaper. That makes clicks look nine times more common in the training data (9.17% instead of 1%), so the model's raw outputs are too high. The formula <code>p = q / (q + (1 − q) / w)</code> maps them back to the real scale, recovering exactly 1%. Without it, every restaurant would be charged as if its card were nine times more clickable.</p>
  <p>Part 2 shows why calibration is money. With correct probabilities, B wins with an eCPM of 240 and pays ₹10 per click, just enough to beat A's 200; over 1,000 impressions that is 20 clicks × ₹10 = ₹200. If the model over-predicts A's CTR by 30%, A's eCPM becomes 260 and A wins, paying ₹18.46 per click. But A's real CTR is still 1%, so 1,000 impressions bring only 10 clicks × ₹18.46 = ₹184.60. Revenue fell by about 8%, users saw a less relevant card, and restaurant A overpaid. Think of a mango auction where the auctioneer's scale reads 30% heavy for one trader: that trader wins crates he should not and pays for mangoes that are not there. pCTR is the scale. Part 3 is the routine check: a calibration ratio of 1.21 means the model is 21% over-confident. The fix is a calibration layer, Platt scaling (a small logistic regression on the model's score) or isotonic regression (a flexible increasing curve), fitted on fresh data and monitored hourly per slice.</p>
  <figure class="viz"><svg viewBox="0 0 740 196" width="740" role="img"><defs><marker id="sc-m4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="10" y="14" width="128" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="74" y="33" text-anchor="middle" font-weight="600">Ad request</text><text x="74" y="47" text-anchor="middle" class="tm">user, page</text><rect x="158" y="14" width="128" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="222" y="33" text-anchor="middle" font-weight="600">Candidates</text><text x="222" y="47" text-anchor="middle" class="tm">targeting</text><rect x="306" y="14" width="128" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="370" y="33" text-anchor="middle" font-weight="600">pCTR model</text><text x="370" y="47" text-anchor="middle" class="tm">calibrated</text><rect x="454" y="14" width="128" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="518" y="33" text-anchor="middle" font-weight="600">Auction</text><text x="518" y="47" text-anchor="middle" class="tm">bid x pCTR</text><rect x="602" y="14" width="128" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="666" y="40" text-anchor="middle" font-weight="600">Ad shown</text><line x1="140" y1="36" x2="155" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m4)"/><line x1="288" y1="36" x2="303" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m4)"/><line x1="436" y1="36" x2="451" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m4)"/><line x1="584" y1="36" x2="599" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m4)"/><rect x="602" y="140" width="128" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="666" y="159" text-anchor="middle" font-weight="600">Impression +</text><text x="666" y="173" text-anchor="middle" class="tm">click logs</text><rect x="454" y="140" width="128" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="518" y="159" text-anchor="middle" font-weight="600">Join clicks</text><text x="518" y="173" text-anchor="middle" class="tm">to impressions</text><rect x="306" y="140" width="128" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="370" y="159" text-anchor="middle" font-weight="600">Train</text><text x="370" y="173" text-anchor="middle" class="tm">hourly refresh</text><line x1="666" y1="60" x2="666" y2="137" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m4)"/><line x1="600" y1="162" x2="585" y2="162" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m4)"/><line x1="452" y1="162" x2="437" y2="162" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m4)"/><line x1="370" y1="138" x2="370" y2="61" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#sc-m4)"/></svg><figcaption>The model's probability is a price input, so calibration matters as much as ranking quality.</figcaption></figure>
  <p>The figure closes the loop. The top row is the request path: targeting picks eligible sponsored restaurants, the model scores them, the auction picks the winners and prices, and the cards are shown. The bottom row is the learning path: impressions and clicks are logged, clicks are joined to their impressions within a waiting window (say 30 minutes, since a click can arrive after the impression is logged), and the model retrains hourly because campaigns and budgets change fast. Features are the user's interests, the restaurant, the slot position, time, and crosses such as user cuisine × restaurant cuisine, with ids handled by the hashing trick or learned embeddings. The baseline is logistic regression, which is fast and naturally well calibrated; the main model is a deep CTR model such as DCN or DeepFM with a calibration layer on top. The trade-offs to name are model capacity against latency, freshness against training cost, and short-term revenue against user experience (too many sponsored cards drive users away).</p>

  <h2 id="sc-compare"><span class="num">07</span>Side by Side</h2>
  <p>The steps never changed from case to case. What changed was one fact about each problem, and that fact, spotted early, predicted most of the design. Calling it the <strong>dominant constraint</strong> is useful: it is the single property (latency, candidate count, label rarity and delay, planning horizon, or a probability that sets a price) that shapes the system more than anything else. Five kinds of cooking in one restaurant kitchen make the same point: à la carte with a promised time, a menu chosen per guest, a food-safety check at the door, tomorrow's grocery order and plates priced by weight need the same skills but very different set-ups.</p>
  <table class="tbl">
    <tr><th></th><th>ETA</th><th>Recommendations</th><th>Fraud</th><th>Forecasting</th><th>Sponsored</th></tr>
    <tr><td>Serving</td><td>online, 20 per request</td><td>online, two stages</td><td>online, in payment path</td><td>nightly batch</td><td>online auction</td></tr>
    <tr><td>Key number</td><td>11,111 ETAs/s, 60 ms</td><td>2,000 → 300 candidates</td><td>0.1% positives, 600/day</td><td>100,800 forecasts/night</td><td>27,778 pCTR/s</td></tr>
    <tr><td>Label delay</td><td>about an hour (cancels never)</td><td>minutes to days</td><td>30–90 days</td><td>1 day</td><td>minutes</td></tr>
    <tr><td>Metric trait</td><td>late rate, quantile</td><td>ranking (NDCG)</td><td>₹ cost at low FPR</td><td>WAPE, bias, pinball</td><td>calibration, log loss</td></tr>
    <tr><td>Biggest risk</td><td>broken promises, skew</td><td>feedback loop</td><td>adversaries; unlabelled blocks</td><td>censored demand</td><td>mispricing</td></tr>
    <tr><td>Baseline</td><td>15 + 4 × km</td><td>popular near you</td><td>rules</td><td>seasonal naive</td><td>logistic regression</td></tr>
  </table>
  <p>Read the "key number" row as a set of decisions. 11,111 predictions per second within 60 ms means online, batched and cached. 2,000 candidates at about 0.047 ms each would take 94 ms, so retrieval must come first. 600 frauds a day means precision and cost matter far more than throughput, and the analyst team is a capacity limit. 100,800 forecasts fit on one machine, so the effort goes into quantiles and backtests. 27,778 predictions per second that set prices call for small, fast, calibrated models. The "label delay" row predicts the monitoring design: forecasting can check itself tomorrow, while fraud has to rely on drift signals for months. And the "biggest risk" row is what a strong candidate brings up unprompted.</p>

  <h2 id="sc-mistakes"><span class="num">08</span>Common Mistakes</h2>
  <p>The first mistake is naming a model before the goal, the label and the metric. "I'd use a two-tower model" tells the interviewer nothing until they know what it predicts and how success is measured. Walk the steps in order. The second is giving no numbers: "it should be fast" earns nothing, while "11,111 ETAs per second within 60 ms, and 2,000 candidates would take 94 ms" lets the numbers choose the design for you.</p>
  <p>The third is using accuracy, or ROC-AUC alone, on rare events. It sounds reasonable until you compute what a useless model scores:</p>
  <div class="fx" data-lang="py">import numpy as np

is_fraud = np.r_[np.zeros(99_900, bool), np.ones(100, bool)]
never_flag = np.zeros_like(is_fraud)                   # a "model" that approves everything
print(f"accuracy {np.mean(never_flag == is_fraud):.1%}   fraud caught {never_flag[is_fraud].sum()} of 100")</div>
  <div class="fx" data-lang="text">accuracy 99.9%   fraud caught 0 of 100</div>
  <p>A model that approves every payment is 99.9% accurate and catches none of the 100 frauds. Use precision, recall, PR-AUC, recall at a fixed false-positive rate, or better still the rupee cost of each threshold.</p>
  <p>The fourth is shipping the average as a promise. A model that predicts the middle is late half the time; in case 1 the P50 model was late on 50% of orders and P80 on 22%. Whenever errors in one direction cost more, predict a quantile. The fifth is random train/test splits on data that changes over time. ETA, fraud and forecasting must be split by time, or with a rolling-origin backtest, because a random split lets the model learn from days that come after the ones it is tested on, and the offline score will flatter it.</p>
  <p>The sixth is forgetting the quirks of the label. Every case had one: cancelled orders and outage slots are censored, blocked payments are never labelled, recommendations only learn from what was shown, and ad clicks arrive after the impression. Name the quirk and the fix. The last is ending without a fallback and a rollout plan. Every online case needs a timeout fallback (the baseline ETA formula, rules only, a cached popular row) and a launch path of shadow, then canary, then an A/B test with guardrails (<a class="xref" data-note="sd_experiments">Experiments</a>).</p>

  <h2 id="sc-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>The walk</h3>
  <ul>
    <li>Clarify → estimate → metrics → data &amp; labels → features → baseline &amp; model → serving → monitoring → rollout → trade-offs.</li>
    <li>State assumptions out loud; give a reason with every choice; name the dominant constraint in the first ten minutes.</li>
    <li>QPS = per day ÷ 86,400, × peak factor. Biteful: 12M feed loads → 139/s → 556/s peak; 600k orders → 27.8/s peak.</li>
  </ul>
  <h3>Each case in brief</h3>
  <table class="tbl">
    <tr><th>Case</th><th>Dominant fact</th><th>Key design choice</th><th>Number to remember</th></tr>
    <tr><td>ETA</td><td>late ≫ early; 60 ms</td><td>quantile regression (P80); batched online service with cache and baseline fallback</td><td>P50 late 50%, P80 22% for +2.7 min</td></tr>
    <tr><td>Recommendations</td><td>2,000 candidates</td><td>two-tower + ANN retrieval → GBM ranker → re-rank; exploration slots</td><td>94 ms vs 14 ms; NDCG 0.921 vs 0.53</td></tr>
    <tr><td>Search (variant)</td><td>query + candidates</td><td>BM25 + embedding retrieval, query understanding, position-bias correction</td><td>same metrics, plus no-result rate</td></tr>
    <tr><td>Fraud</td><td>0.1%, labels in 30–90 days</td><td>rules in front, GBM with velocity features, three bands</td><td>t = 0.5: ₹91,908 vs ₹201,600 / ₹642,952</td></tr>
    <tr><td>Forecasting</td><td>batch; censored history</td><td>global quantile LightGBM, rolling-origin backtest, mask outages</td><td>WAPE 9.4% vs 29.4%</td></tr>
    <tr><td>Sponsored</td><td>probability = price</td><td>calibrated pCTR, downsampling correction, hourly refresh</td><td>ratio 1.21; revenue ₹200 → ₹184.6</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Formula</th><th>Example</th></tr>
    <tr><td>pinball(y, f, α) = mean max(α(y − f), (α − 1)(y − f))</td><td>P90 forecast: 0.37</td></tr>
    <tr><td>NDCG@K = DCG / ideal DCG, DCG = Σ gain / log₂(position + 1)</td><td>4.387 / 4.762 = 0.921</td></tr>
    <tr><td>Recall@K = relevant in top K ÷ all relevant</td><td>A 0.67, B 0.33</td></tr>
    <tr><td>fraud cost = missed fraud ₹ + ₹150 × false declines</td><td>minimum at t = 0.5</td></tr>
    <tr><td>WAPE = Σ|y − f| ÷ Σy; bias = Σ(f − y) ÷ Σy</td><td>8 ÷ 85 = 9.4%; 0</td></tr>
    <tr><td>eCPM = 1,000 × bid × pCTR</td><td>B 240 beats A 200</td></tr>
    <tr><td>p = q / (q + (1 − q) / w)</td><td>0.0917 → 0.0100 with w = 0.1</td></tr>
  </table>
  <h3>Gotchas</h3>
  <ul>
    <li>MAE got worse as the ETA quantile rose (2.50 → 4.44): MAE is not the goal.</li>
    <li>Log shown-but-ignored items; they are the best negatives.</li>
    <li>Review band width = analyst capacity (0.5% of payments → 19 analysts).</li>
    <li>Blocked payments and outage slots have no true label; let a sample through, mask outages.</li>
    <li>AUC cannot see miscalibration; report log loss and the calibration ratio.</li>
    <li>Split by time; always have a fallback and a rollout plan.</li>
  </ul>

  <h2 id="sc-qa"><span class="num">09</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>How do you structure an answer to an open-ended ML design prompt?</summary><div class="qa-body">Walk fixed steps out loud: clarify the goal and constraints, estimate scale, define offline and online metrics and guardrails, then data and labels, features, a baseline and the model, serving, monitoring, rollout and trade-offs. State assumptions where numbers are missing and give a reason for every choice. Spend most time where the dominant constraint is.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you estimate QPS for a feature shown on a home feed?</summary><div class="qa-body">Daily users × sessions per user gives requests per day; divide by 86,400 and multiply by a peak factor (2–5×). Multiply by items per request for predictions per second. Biteful: 3M × 4 = 12M loads, 139/s average, 556/s peak, × 20 cards = 11,111 ETAs per second.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>ETA: why predict a quantile instead of the mean?</summary><div class="qa-body">Late costs more than early. A mean or median model is late about half the time; a P80 model was late 22% of the time for an ETA only 2.7 minutes longer. Train it with the pinball loss and choose the quantile with an A/B test on on-time rate and conversion.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>ETA: a brand-new restaurant has no prep-time history. What do you do?</summary><div class="qa-body">Use a prior from similar restaurants (cuisine, size, area) for prep time, a default queue estimate and a slightly higher quantile until about a week of orders exists, and track new restaurants as a separate slice in monitoring.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>ETA: which features would leak, and how do you prevent it?</summary><div class="qa-body">Anything known only after the order is placed, such as actual pickup time or the assigned rider. Prevent it by building training rows with point-in-time joins (feature values as of the order time) and by computing features with the same code online and offline.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Recommendations: why two stages, and what does each optimise?</summary><div class="qa-body">Scoring 2,000 candidates with the heavy ranker would take about 94 ms of a 150 ms budget. Retrieval cheaply narrows to a few hundred and is judged by recall (did the right items make it in?); ranking scores those carefully and is judged by NDCG (are the best near the top?). A re-ranking step then applies diversity and business rules.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Recommendations: how do you handle cold start for new restaurants and new users?</summary><div class="qa-body">For restaurants, an item tower built from content (cuisine, menu text, photos, price) gives an embedding without orders, plus exploration slots and a decaying freshness boost. For users, start from popularity by location and time, ask for cuisine preferences, and switch to the personal model as soon as a few interactions exist.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does search ranking differ from recommendations?</summary><div class="qa-body">The same retrieve-then-rank funnel, but retrieval must match a query, usually combining a lexical index such as BM25 with query embeddings, behind a query-understanding step for spelling, intent and filters. The ranker adds query-document features, and click labels need position-bias correction because top results are clicked partly for being on top.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Recommendations: traffic grows 10×. What breaks first, and what do you do?</summary><div class="qa-body">Ranker compute. Cut candidates (300 → 150), distil or quantise the ranker, batch ranking calls, cache each user's row for a few minutes, and replicate the ANN index across more servers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Fraud: why not use accuracy, and how do you pick the threshold?</summary><div class="qa-body">With 0.1% fraud, approving everything is 99.9% accurate and catches nothing. Use precision, recall and PR-AUC, and pick the threshold that minimises expected cost (missed fraud amount plus a cost per false decline) on a time-based validation set with matured labels. Then size the review band to analyst capacity.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Fraud: how do you get labels for payments you blocked?</summary><div class="qa-body">Mostly you don't, which is the selective-labels problem. Let a tiny random sample of borderline payments through with loss limits, or send them to analyst review, and reweight those examples by inverse propensity during training.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Fraud: why keep rules when you have a model?</summary><div class="qa-body">Rules can be changed in minutes when a new attack appears, while retraining and validating a model takes days. They also encode hard policy (blocklists, legal limits) and act as the fallback when the model or feature store times out.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Forecasting: WAPE or MAPE?</summary><div class="qa-body">WAPE. MAPE divides each slot's error by that slot's actual, so slots with zero or one order explode the score. WAPE divides total absolute error by total actual, which naturally weights busy slots more, and pairs well with a bias metric.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Forecasting: an app outage recorded zero orders for a slot. What do you do with it?</summary><div class="qa-body">Treat it as censored demand, not real demand. Mask it out of training and evaluation, or impute it from similar slots, using the outage log. Training on it makes the model under-forecast, which causes under-staffing and late deliveries that then suppress real demand.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Forecasting: how do you evaluate a forecasting model honestly?</summary><div class="qa-body">With a rolling-origin backtest: train up to week t, forecast t + 1, slide forward and repeat, reporting WAPE, bias and quantile coverage across many origins. Never use a random split, and make sure every feature is available as of the forecast date.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Ads: why does a CTR model need calibration when a recommendation ranker mostly doesn't?</summary><div class="qa-body">A ranker only needs the order of scores to pick the top items. An auction multiplies pCTR by the bid to choose the winner and set the price, so the absolute value matters; a 30% over-prediction for one ad changed the winner and cut revenue by about 8%. Report log loss and the calibration ratio, and recalibrate with Platt scaling or isotonic regression.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Ads: you trained with 10% of negatives and the model outputs 0.0917. What is the real pCTR?</summary><div class="qa-body">p = q / (q + (1 − q)/w) = 0.0917 / (0.0917 + 0.9083/0.1) ≈ 0.0100, so 1%.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>For any of these cases, how would you roll out a new model?</summary><div class="qa-body">Offline gate against the champion on recent, time-split data and key slices; shadow traffic to check latency and output distributions; a 5–10% canary with automatic stop rules; an A/B test (switchback if users interfere) for full weeks on the primary metric with guardrails; then a ramp with feature-flag rollback ready.</div></details>
</main>
`
});
