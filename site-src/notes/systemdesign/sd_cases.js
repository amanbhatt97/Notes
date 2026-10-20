// notes/systemdesign/sd_cases.js — Case Studies
Object.assign(TOPIC_CONTENT, {
  "sd_cases": `<main>
<h1>Case Studies</h1>
  <div class="where"><span>ML System Design</span><span>Case Studies</span></div>
  <p class="lead">Four ML design prompts from one company, each walked like a mock interview with the framework from the first note: goal, numbers, data and labels, features, baseline and model, offline evaluation, serving, monitoring, rollout, trade-offs. Case 1 is the running example of the whole track — Biteful's delivery-time (ETA) prediction — told end to end in one place. Cases 2–4 (restaurant recommendations, payment and refund fraud, demand forecasting for rider staffing) reuse the same steps and change what dominates the design. A bonus case (sponsored listings) shows why a probability can be a price. Every number is computed.</p>

  <h2 id="sc-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 130" width="680">
    <defs><marker id="sc-t0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="8" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="69" y="42" text-anchor="middle" font-size="12">1 Framework</text><text x="69" y="58" text-anchor="middle" font-size="10" class="tm">the whole path once</text>
    <rect x="145" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="206" y="42" text-anchor="middle" font-size="12">2 Serving</text><text x="206" y="58" text-anchor="middle" font-size="10" class="tm">answer in 60 ms</text>
    <rect x="282" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="343" y="42" text-anchor="middle" font-size="12">3 Monitoring</text><text x="343" y="58" text-anchor="middle" font-size="10" class="tm">still right next month?</text>
    <rect x="419" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="480" y="42" text-anchor="middle" font-size="12">4 Experiments</text><text x="480" y="58" text-anchor="middle" font-size="10" class="tm">is v2 really better?</text>
    <rect x="556" y="22" width="116" height="46" rx="6" class="fg sg" stroke-width="2.5"/><text x="614" y="42" text-anchor="middle" font-size="12" font-weight="700">5 Case studies</text><text x="614" y="58" text-anchor="middle" font-size="10" class="tm">four full designs</text>
    <line x1="130" y1="45" x2="143" y2="45" stroke="currentColor" marker-end="url(#sc-t0)"/>
    <line x1="267" y1="45" x2="280" y2="45" stroke="currentColor" marker-end="url(#sc-t0)"/>
    <line x1="404" y1="45" x2="417" y2="45" stroke="currentColor" marker-end="url(#sc-t0)"/>
    <line x1="541" y1="45" x2="554" y2="45" stroke="currentColor" marker-end="url(#sc-t0)"/>
    <text x="340" y="96" text-anchor="middle" font-size="11">One story across all five notes: Biteful's delivery-time (ETA) prediction</text>
    <text x="340" y="114" text-anchor="middle" font-size="11" class="tm">this note: ETA end to end, then recommendations, fraud and forecasting at the same company</text>
  </svg><figcaption>The ML System Design track in reading order. You are on the green note: practice that uses every earlier note.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: the whole track</b><span><a class="xref" data-note="sd_framework">Framework</a> (the steps and the ETA numbers), <a class="xref" data-note="sd_serving">Serving</a> (budgets, feature stores, skew, shadow, canary), <a class="xref" data-note="sd_monitoring">Monitoring</a> (PSI, delayed labels, champion–challenger), <a class="xref" data-note="sd_experiments">Experiments</a> (A/B, guardrails, interleaving, feedback loops).</span></li>
    <li><b>This note adds: practice and contrast</b><span>Four full designs with every step filled in, and a side-by-side that shows which single fact dominates each design: an online regression promise, a huge candidate set, rare positives with late labels, or a nightly batch with censored history.</span></li>
    <li><b>Leads to: the model notes behind each case</b><span><a class="xref" data-note="ml_recsys">Recommendation Systems</a> and <a class="xref" data-note="ml_rs_ranking">Ranking</a> for case 2; <a class="xref" data-note="ml_evaluation">Model Evaluation</a> and <a class="xref" data-note="ml_calibration">Calibration</a> for cases 3 and 5; <a class="xref" data-note="ml_ts_ml">ML for Time Series</a> for case 4; and <a class="xref" data-note="mlops_deploy">deployment</a> to run any of them.</span></li>
  </ol>

  <h2 id="sc-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The note as one chain. Running example: Biteful, 3M daily users in Pune and Mumbai, 12M feed loads and 600,000 orders a day, dinner peak 556 feed loads per second. Each case keeps the same walk and changes one dominant fact.</p>
  <ol class="story">
    <li><b>How to walk a case</b><span>Q: how do I answer any prompt calmly? → the same steps, out loud, each tied to an earlier note, numbers stated as assumptions. First, the full ETA design in one place…</span></li>
    <li><b>Case 1: ETA prediction</b><span>Q: what does a complete online regression design look like? → 11,111 ETAs/s, label = delivered − placed, point-in-time features, LightGBM; and the promise: a P80 quantile model is late 22% vs 50% for P50, for 2.7 more minutes shown. But ETA scores 20 known restaurants; what if there are thousands of candidates?</span></li>
    <li><b>Case 2: restaurant recommendations</b><span>Q: how do we rank 2,000 restaurants in 150 ms? → scoring all costs 1.11M rows/s at peak; retrieval to 300 cuts it to 0.17M; NDCG@5 0.921 vs 0.53 tells good order from bad. But ranking assumes plenty of positives…</span></li>
    <li><b>Case 3: payment &amp; refund fraud</b><span>Q: what if positives are 0.1% and labels arrive in months? → threshold by rupee cost (t = 0.5: ₹91,908 vs ₹201,600 and ₹642,952), velocity features from a stream, rules in front. All three so far are online; what if no one is waiting?</span></li>
    <li><b>Case 4: demand forecasting</b><span>Q: how many riders for Kothrud at 8 pm next Friday? → nightly batch, 100,800 forecasts, WAPE 9.4% vs 29.4% naive, P90 for staffing, outage days censored. And when a probability sets a price…</span></li>
    <li><b>Bonus: sponsored listings</b><span>Q: why can't we judge an ad model by AUC? → bid × pCTR sets the winner and the price: a 30% over-prediction flips the auction; correct downsampling (0.0917 → 0.0100) and check calibration (ratio 1.21).</span></li>
    <li><b>Side by side</b><span>Q: what changes per problem? → serving mode, the key number, label delay, the metric's trait, the biggest risk and the baseline. Spotting the dominant fact early is the skill.</span></li>
  </ol>

  <h2 id="sc-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Biteful ML Design Cases</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The walk (every case)</div>
        <ul>
          <li><b>Clarify</b> — goal, users, scale, latency, constraints</li>
          <li><b>Estimate</b> — QPS = requests/day ÷ 86,400; peak 2–5×</li>
          <li><b>Metrics</b> — offline, online, guardrails</li>
          <li><b>Data → features → baseline → model</b></li>
          <li><b>Serve → monitor → roll out → trade-offs</b></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">1 ETA</div>
        <ul>
          <li>Online regression, 11,111/s, 60 ms</li>
          <li>Label delivered − placed; leakage; PIT joins</li>
          <li>LightGBM; quantile promise P80: 22% late</li>
          <li>Risk: broken promises, skew</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">2 Recommendations</div>
        <ul>
          <li>2,000 → 300 → 50 → 20 shown</li>
          <li>Two-tower + ANN retrieval; GBM ranker</li>
          <li>Recall@K, NDCG (0.921 vs 0.53)</li>
          <li>Risk: feedback loop; cold start</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">3 Fraud</div>
        <ul>
          <li>0.1% positives; labels in 30–90 days</li>
          <li>Rupee cost picks t = 0.5</li>
          <li>Velocity features from a stream</li>
          <li>Risk: adversaries; blocked = unlabelled</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">4 Forecasting</div>
        <ul>
          <li>Nightly batch: 300 zones × 48 slots × 7 days</li>
          <li>WAPE, bias, pinball; P90 for staffing</li>
          <li>Global LightGBM; rolling-origin backtest</li>
          <li>Risk: censored demand (outages)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Bonus: ads</div>
        <ul>
          <li>bid × pCTR = winner and price</li>
          <li>Calibration ratio ≈ 1; log loss</li>
          <li>Downsampling correction p = q / (q + (1−q)/w)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sc-how"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">How to Walk a Case</span><span class="rm-sub">Same steps, every prompt</span></div></div>
      <div class="rm-item rm-done" data-target="sc-eta"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Case 1: ETA Prediction</span><span class="rm-sub">The running example, end to end</span></div></div>
      <div class="rm-item rm-done" data-target="sc-rec"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Case 2: Restaurant Recommendations</span><span class="rm-sub">Retrieval + ranking</span></div></div>
      <div class="rm-item rm-done" data-target="sc-fraud"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Case 3: Payment &amp; Refund Fraud</span><span class="rm-sub">Rare, late, adversarial</span></div></div>
      <div class="rm-item rm-done" data-target="sc-fc"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Case 4: Demand Forecasting</span><span class="rm-sub">Batch, quantiles, backtests</span></div></div>
      <div class="rm-item rm-done" data-target="sc-ads"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Bonus: Sponsored Listings</span><span class="rm-sub">Calibration is money</span></div></div>
      <div class="rm-item rm-done" data-target="sc-compare"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Side by Side</span><span class="rm-sub">What changes per problem</span></div></div>
      <div class="rm-item rm-done" data-target="sc-mistakes"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">What sinks a case answer</span></div></div>
      <div class="rm-item rm-done" data-target="sc-connect"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">Track notes × cases</span></div></div>
      <div class="rm-item rm-done" data-target="sc-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="sc-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Follow-up Questions</span><span class="rm-sub">What interviewers ask next</span></div></div>
    </div>
  </div>

  <h2 id="sc-how"><span class="num">01</span>How to Walk a Case</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The four earlier notes taught the pieces one at a time. In an interview, a prompt arrives with no data and no numbers: "Design fraud detection for a food-delivery app." How do we turn the pieces into one calm, complete answer in 45 minutes?</p>
  </div>
  <p>The common failure is "I'd use XGBoost" in the first minute. The interviewer then has nothing to score: you never said what you solve, how you'd know it works, or how it runs. The fix is to walk the <em>same</em> steps every time, saying each step's name out loud before filling it, and to know which earlier note each step comes from.</p>
  <div class="flow"><span>Clarify</span><span>Estimate</span><span>Metrics</span><span>Data &amp; labels</span><span>Features</span><span>Baseline &amp; model</span><span>Serving</span><span>Monitoring</span><span>Rollout</span><span>Trade-offs</span></div>
  <table class="tbl">
    <tr><th>Step</th><th>The question it answers</th><th>Minutes (of 45)</th><th>Track note</th></tr>
    <tr><td>Clarify</td><td>Business goal, users, limits?</td><td>5</td><td><a class="xref" data-note="sd_framework">Framework</a> §03</td></tr>
    <tr><td>Estimate</td><td>Traffic, data, time? (QPS, storage, latency)</td><td>3</td><td>Framework §04</td></tr>
    <tr><td>Metrics</td><td>Good offline and online? Guardrails?</td><td>5</td><td>Framework §03, §08</td></tr>
    <tr><td>Data, labels, features</td><td>What do we learn from; known when?</td><td>8</td><td>Framework §05–06</td></tr>
    <tr><td>Baseline, model</td><td>Simplest first, then which model and why</td><td>7</td><td>Framework §07</td></tr>
    <tr><td>Serving</td><td>How does a prediction arrive in time?</td><td>8</td><td><a class="xref" data-note="sd_serving">Serving</a></td></tr>
    <tr><td>Monitoring, rollout, trade-offs</td><td>Still right next month? Safe launch? What did we give up?</td><td>9</td><td><a class="xref" data-note="sd_monitoring">Monitoring</a>, <a class="xref" data-note="sd_experiments">Experiments</a></td></tr>
  </table>
  <p>Two habits make the walk work. <strong>State assumptions</strong> when no numbers are given: "I'll assume 3 million daily users; tell me if that's off." And <strong>give a reason with every choice</strong>: not "a GBM", but "a GBM, because the data is tabular, it scores 20 rows in about a millisecond, and SHAP values explain declines".</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A doctor's consultation. She asks questions (clarify), takes your temperature (estimate), decides what "better" means (metrics), orders tests (data), prescribes (model), explains how to take it (serving) and books a follow-up (monitoring). Skipping straight to the prescription is how mistakes happen.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Offline metric</strong>: on held-out historical data. <strong>Online metric</strong>: on live users in an A/B test. <strong>Guardrail</strong>: must not get worse. <strong>Baseline</strong>: the simplest reasonable solution, which the model must beat and which serves as fallback.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Spending 30 minutes on model architecture. Framing, metrics, data, serving and monitoring carry more marks than the choice between two neural nets.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: case 1.</b> The walk is a list of headings. What does it sound like with every heading filled in? Start with the system the whole track has been building: Biteful's ETA.</div>

  <h2 id="sc-eta"><span class="num">02</span>Case 1: ETA Prediction</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The ETA appeared in pieces across four notes. As one interview answer, what does each step say — and what is the one design decision the earlier notes left open (how to turn a good estimate into a promise customers can trust)?</p>
  </div>
  <p><em>"Design the delivery-time estimate shown on every restaurant card and at checkout."</em></p>
  <h3>Clarify</h3>
  <table class="tbl">
    <tr><th>You ask</th><th>Assumed answer</th><th>Why it matters</th></tr>
    <tr><td>What is the goal?</td><td>Kept promises: fewer late orders, cancellations, support calls; without hurting conversion</td><td>The online metric is on-time rate, not MAE</td></tr>
    <tr><td>Where is it shown?</td><td>20 cards per feed load + once at checkout</td><td>Fan-out of 20 per request</td></tr>
    <tr><td>Latency?</td><td>Feed 200 ms p99; ETA service 60 ms</td><td>Online, batched, cached</td></tr>
    <tr><td>Late vs early cost?</td><td>Late is much worse</td><td>Predict a quantile, not the mean</td></tr>
  </table>
  <h3>Estimate</h3>
  <ol>
    <li>3M users × 4 loads = 12M loads/day → 139 QPS average, 556 at the 4× dinner peak.</li>
    <li>× 20 cards = <strong>11,111 ETAs/s</strong> at peak; one LightGBM call of 20 rows ≈ 0.94 ms, so the model needs about one core. The hard part is fresh features.</li>
    <li>Training: 600k orders/day × 180 days = 108M rows × 40 features × 4 B ≈ <strong>17.3 GB</strong>.</li>
  </ol>
  <h3>Metrics</h3>
  <p>Offline: MAE, late rate, P90 error, all on a <strong>time split</strong>. Online (A/B): on-time rate of the shown ETA, cancellations, conversion. Guardrails: p99 latency, conversion, support contacts.</p>
  <h3>Data, labels, features</h3>
  <p>Label = delivered − placed (orders 101–108: 28, 41, 30, 58, 19, 52, 27, 33 min). Censored when cancelled. Leakage: pickup time, rider id. Features: km from the route engine, kitchen queue (stream job on order events), rain, hour, prep_7d (nightly, joined point-in-time: order 102 gets 15.5, not today's 18.0). One feature definition for training and serving to avoid skew (straight-line vs road km doubled the MAE).</p>
  <h3>Baseline, model, and the promise</h3>
  <p>Baseline 15 + 4 × km (MAE 8.0 on our orders, 9.18 at scale) is also the fallback. LightGBM on honest features: MAE 2.52 on the time split — but late on about half the orders, because a model that predicts the middle is above the truth half the time. The open decision: which <strong>quantile</strong> to promise. LightGBM can learn a quantile directly (<code>objective="quantile"</code>, pinball loss). Same 20,000 simulated orders, same time split:</p>
  <div class="fx" data-lang="py">import numpy as np, lightgbm as lgb

# The framework note's 20,000 simulated orders (same generator, same seed)
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
tr, te = day &lt;= 45, day &gt; 45                       # time split

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
  <p>Read the trade-off: the median model (P50) is late 50% of the time and shows 35.5 minutes. Promising the 80th percentile cuts late orders to <strong>22%</strong> for an ETA only 2.7 minutes longer (38.2). P90 gets to 12% but shows 39.8 minutes, which may cost conversion. MAE rises with the quantile — again, MAE is not the goal. Biteful starts with P80 and lets an A/B test (<a class="xref" data-note="sd_experiments">Experiments</a> §05) settle P70 vs P80 on on-time rate and conversion.</p>
  <h3>Serving, monitoring, rollout, trade-offs</h3>
  <p>Serving: online ETA service with one MGET to Redis, route engine in parallel, batched model call, 60 s cache keyed by model version, baseline fallback (critical path 36 ms). Monitoring: PSI on km/rain/queue and on predicted ETAs, mature-cohort late rate by city and weather, cancellation rate, SLO burn. Retrain weekly plus triggers; champion vs challenger on the newest week by slice. Rollout: shadow (by slice — the Mumbai rain bug), 10% canary, then a switchback A/B by zone because ETAs affect riders. Trade-offs: P70 vs P80 (conversion vs trust); cache TTL (73.5% hits at +0.20 min); nightly vs streaming prep time.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A train announcement. "Arriving at 8:15" that is right on average but late half the time makes passengers angry; "arriving by 8:20" that is almost always kept makes them trust the railway.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Quantile regression</strong>: predicting the value the outcome stays below with probability α (P80: 80%). Trained with the <strong>pinball loss</strong>, which charges α per minute of under-prediction and (1 − α) per minute of over-prediction.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Optimising MAE and shipping the mean as a promise. The best-MAE model was late on half of all orders.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: recommendations.</b> The ETA model scores 20 known restaurants per request. Biteful's home feed must <em>choose</em> those 20 out of ~2,000 restaurants that deliver to Asha's address, in 150 ms. Scoring all of them carefully is too slow. What changes?</div>

  <h2 id="sc-rec"><span class="num">03</span>Case 2: Restaurant Recommendations</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>When the candidate set is thousands of items and the page needs 20, can one model score them all in time? If not, how do we split the work, and how do we measure whether the order of the 20 is good?</p>
  </div>
  <p><em>"Design the 'Recommended for you' row on Biteful's home screen."</em></p>
  <h3>Clarify</h3>
  <table class="tbl">
    <tr><th>You ask</th><th>Assumed answer</th><th>Why it matters</th></tr>
    <tr><td>Goal: taps or orders?</td><td>Orders (and repeat orders), taps as a signal</td><td>Taps alone reward pretty photos</td></tr>
    <tr><td>How many candidates?</td><td>~2,000 restaurants deliver to a typical address; 20 shown</td><td>Decides one-stage vs two-stage</td></tr>
    <tr><td>Latency?</td><td>p99 under 150 ms for the row</td><td>Budget for retrieval + ranking</td></tr>
    <tr><td>New restaurants?</td><td>Dozens open every week</td><td>Cold start; exploration</td></tr>
  </table>
  <h3>Estimate</h3>
  <p>At the measured ~0.047 ms per row (one LightGBM call of 20 rows took 0.94 ms in <a class="xref" data-note="sd_serving">Serving</a> §05), ranking all 2,000 candidates costs about 94 ms per request — most of the 150 ms budget — and 1.11 million rows per second at peak. Ranking 300 costs about 14 ms and 0.17 million rows/s. That one number forces a <strong>two-stage</strong> design: a cheap <strong>retrieval</strong> step to ~300, then a careful <strong>ranker</strong>.</p>
  <figure class="viz"><svg viewBox="0 0 680 200" width="680" role="img"><defs><marker id="ss-m5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="20" y="8" width="360" height="36" rx="4" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="200" y="31" text-anchor="middle" font-weight="600">2,000 in range</text><text x="410" y="24" text-anchor="start" font-weight="600">Corpus</text><text x="410" y="39" text-anchor="start" class="tm">restaurants delivering here</text><rect x="65" y="55" width="270" height="36" rx="4" class="fb" stroke="currentColor" stroke-opacity=".4"/><text x="200" y="78" text-anchor="middle" font-weight="600">~300</text><text x="410" y="71" text-anchor="start" font-weight="600">Retrieval</text><text x="410" y="86" text-anchor="start" class="tm">ANN / rules, cheap, ~10 ms</text><rect x="110" y="102" width="180" height="36" rx="4" class="fv" stroke="currentColor" stroke-opacity=".4"/><text x="200" y="125" text-anchor="middle" font-weight="600">~50</text><text x="410" y="118" text-anchor="start" font-weight="600">Ranking</text><text x="410" y="133" text-anchor="start" class="tm">heavy model, rich features</text><rect x="150" y="149" width="100" height="36" rx="4" class="fg" stroke="currentColor" stroke-opacity=".4"/><text x="200" y="172" text-anchor="middle" font-weight="600">20 shown</text><text x="410" y="165" text-anchor="start" font-weight="600">Re-rank</text><text x="410" y="180" text-anchor="start" class="tm">diversity, business rules</text></svg><figcaption>Each stage shrinks the set so the next, more expensive model can afford to look closely.</figcaption></figure>
  <h3>Metrics</h3>
  <p>Offline, replay a user's next session. <strong>Recall@K</strong>: of the restaurants the user engaged with, what fraction appeared in our top K? (Did retrieval fetch the right ones?) <strong>NDCG@K</strong> also rewards putting the best <em>near the top</em>: each item's gain is divided by log₂(position + 1), and the total by the best possible total. Online: orders per user (A/B), interleaving to screen rankers. Guardrails: latency, diversity (not 20 biryani places), new-restaurant exposure.</p>
  <p>Worked example: in her next session Asha ordered from Biryani Bros (gain 3), opened Dosa Hut's menu (2) and tapped Thali Bar's card (1). Two models ranked five restaurants:</p>
  <div class="fx" data-lang="py">import math

def recall_at_k(ranked, relevant, k):
    return len(set(ranked[:k]) &amp; relevant) / len(relevant)

def ndcg_at_k(ranked, gains, k):
    dcg = sum(gains.get(item, 0) / math.log2(pos + 2) for pos, item in enumerate(ranked[:k]))
    ideal = sorted(gains.values(), reverse=True)[:k]
    idcg = sum(g / math.log2(pos + 2) for pos, g in enumerate(ideal))
    return dcg / idcg

# What Asha actually did next session: ordered = 3, opened menu = 2, tapped card = 1
gains = {"Biryani Bros": 3, "Thali Bar": 1, "Dosa Hut": 2}
model_a = ["Biryani Bros", "Pizza Point", "Dosa Hut", "Momo Stop", "Thali Bar"]
model_b = ["Momo Stop", "Pizza Point", "Thali Bar", "Dosa Hut", "Biryani Bros"]
for name, ranked in [("A", model_a), ("B", model_b)]:
    print(name, "Recall@3 =", round(recall_at_k(ranked, set(gains), 3), 2),
          " NDCG@5 =", round(ndcg_at_k(ranked, gains, 5), 3))</div>
<div class="fx" data-lang="text">A Recall@3 = 0.67  NDCG@5 = 0.921
B Recall@3 = 0.33  NDCG@5 = 0.53</div>
  <p>Trace model A. DCG = 3/log₂2 + 0 + 2/log₂4 + 0 + 1/log₂6 = 3 + 1 + 0.387 = 4.387. The ideal order (3, 2, 1) gives 3 + 2/log₂3 + 1/log₂4 = 3 + 1.262 + 0.5 = 4.762. NDCG = 4.387 / 4.762 = 0.921. Model B has the same five restaurants but buries Biryani Bros at the bottom: 0.53. The <code>pos + 2</code> is "position + 1" with positions counted from 0. More metrics in <a class="xref" data-note="ml_rs_ranking">Ranking &amp; Evaluation</a>.</p>
  <h3>Data, labels and features</h3>
  <p>Labels are <strong>implicit feedback</strong>: order &gt; menu opened &gt; card tapped &gt; shown-but-ignored. Shown-but-ignored restaurants are the most useful negatives. Features: <strong>user</strong> (cuisines ordered, price range, order times), <strong>restaurant</strong> (cuisine, rating, price, <em>ETA from case 1</em>), <strong>context</strong> (hour, weather, weekday), <strong>cross</strong> (this user's past order rate on this cuisine).</p>
  <h3>Model, and why two stages</h3>
  <p>Baseline: "popular near you in your favourite cuisines" (<a class="xref" data-note="ml_recsys">Recommendation Systems</a>). Retrieval: a <strong>two-tower</strong> model — one network turns the user into a vector, another turns each restaurant into a vector, trained so a user's vector is close to restaurants they order from. Restaurant vectors are computed offline into an <strong>ANN</strong> (approximate nearest neighbour) index; plus "popular now" and "ordered before" candidates. Ranker: a GBM on rich features, later a multi-task net predicting tap and order together.</p>
  <figure class="viz"><svg viewBox="0 0 740 196" width="740" role="img"><defs><marker id="sc-m1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><text x="10" y="14" text-anchor="start" class="tb" font-weight="600">Offline (daily)</text><rect x="10" y="22" width="160" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="90" y="41" text-anchor="middle" font-weight="600">ANN index</text><text x="90" y="55" text-anchor="middle" class="tm">FAISS / ScaNN</text><rect x="196" y="22" width="160" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="276" y="48" text-anchor="middle" font-weight="600">Restaurant embeddings</text><rect x="382" y="22" width="160" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="462" y="41" text-anchor="middle" font-weight="600">Train two-tower</text><text x="462" y="55" text-anchor="middle" class="tm">+ ranker</text><rect x="568" y="22" width="160" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="648" y="48" text-anchor="middle" font-weight="600">Interaction logs</text><line x1="566" y1="44" x2="545" y2="44" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m1)"/><line x1="380" y1="44" x2="359" y2="44" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m1)"/><line x1="194" y1="44" x2="173" y2="44" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m1)"/><text x="10" y="188" text-anchor="start" class="tb" font-weight="600">Online (per request, &lt;150 ms)</text><rect x="10" y="126" width="128" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="74" y="145" text-anchor="middle" font-weight="600">Request</text><text x="74" y="159" text-anchor="middle" class="tm">user_id</text><rect x="158" y="126" width="128" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="222" y="145" text-anchor="middle" font-weight="600">Candidates</text><text x="222" y="159" text-anchor="middle" class="tm">ANN + popular</text><rect x="306" y="126" width="128" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="370" y="145" text-anchor="middle" font-weight="600">Ranker</text><text x="370" y="159" text-anchor="middle" class="tm">GBM / DNN</text><rect x="454" y="126" width="128" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="518" y="145" text-anchor="middle" font-weight="600">Re-rank</text><text x="518" y="159" text-anchor="middle" class="tm">diversity</text><rect x="602" y="126" width="128" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="666" y="152" text-anchor="middle" font-weight="600">Feed</text><line x1="140" y1="148" x2="155" y2="148" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m1)"/><line x1="288" y1="148" x2="303" y2="148" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m1)"/><line x1="436" y1="148" x2="451" y2="148" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m1)"/><line x1="584" y1="148" x2="599" y2="148" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m1)"/><line x1="90" y1="68" x2="222" y2="123" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#sc-m1)"/><line x1="462" y1="68" x2="370" y2="123" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#sc-m1)"/><line x1="666" y1="124" x2="648" y2="69" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#sc-m1)"/></svg><figcaption>Dashed arrows cross the offline/online line: index and model ship down, logged impressions flow back up.</figcaption></figure>
  <h3>Serving: spend the 150 ms</h3>
  <figure class="viz"><svg viewBox="0 0 720 96" width="720" role="img"><rect x="20" y="20" width="91" height="34" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="65" y="42" text-anchor="middle" class="tm">network 20</text><rect x="111" y="20" width="68" height="34" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="145" y="42" text-anchor="middle" class="tm">fetch 15</text><rect x="179" y="20" width="91" height="34" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="224" y="42" text-anchor="middle" class="tm">retrieve 20</text><rect x="270" y="20" width="272" height="34" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="406" y="42" text-anchor="middle" class="tm">rank 300 items 60</text><rect x="542" y="20" width="45" height="34" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="564" y="42" text-anchor="middle" class="tm">10</text><rect x="587" y="20" width="113" height="34" class="fs" stroke="currentColor" stroke-opacity=".3"/><text x="643" y="42" text-anchor="middle" class="tm">slack 25</text><text x="564" y="72" text-anchor="middle" class="tm">re-rank</text><text x="360" y="90" text-anchor="middle" class="tm">p99 budget = 150 ms (all numbers in ms)</text></svg><figcaption>Ranking gets the biggest slice; the slack absorbs slow network hops and garbage-collection pauses.</figcaption></figure>
  <p>The index is rebuilt daily; the user vector is computed per request from recent activity in the online feature store. If the ranker times out, serve candidates in retrieval order; if everything fails, a cached "popular near you" row. Never an empty screen.</p>
  <h3>Monitoring, rollout, trade-offs</h3>
  <p>Watch order rate by slice (new users, cuisines), <strong>coverage</strong> (share of restaurants shown at least once a day), new-restaurant exposure, embedding drift, p99 latency. Screen rankers with interleaving, confirm with A/B. Trade-offs: order vs tap objective; exploration slots (short-term cost) vs the feedback loop where only shown restaurants get labels (<a class="xref" data-note="sd_experiments">Experiments</a> §07: the best new restaurant shown 0 times without exploration); GBM simplicity vs multi-task gains.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Hiring. HR screens 2,000 CVs with keyword filters (retrieval: fast, rough). Managers interview the 50 who pass (ranking: slow, careful). Interviewing all 2,000 would be better in theory and impossible in practice.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Retrieval</strong>: cheaply select candidates, optimised for recall. <strong>Ranking</strong>: score candidates carefully, optimised for precision at the top (NDCG). <strong>Two-tower model</strong>: separate user and item encoders whose dot product scores relevance; item side precomputable.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Random negatives only. The ranker never learns from "shown but ignored" restaurants, the hard and informative negatives. Log what was shown, and use it.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: fraud.</b> Recommendations get millions of positive signals a day, within minutes. What if positives are one in a thousand, the truth arrives months later, and someone is actively trying to fool the model?</div>

  <h2 id="sc-fraud"><span class="num">04</span>Case 3: Payment &amp; Refund Fraud</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>With 0.1% fraud, a model that never flags anything is 99.9% accurate. Labels (chargebacks) arrive 30–90 days late, and blocked payments never get one. How do we choose a threshold, which features catch a stolen card, and how do we keep up with fraudsters who adapt?</p>
  </div>
  <p><em>"Score every Biteful payment and refund claim for fraud before it completes."</em></p>
  <h3>Clarify</h3>
  <table class="tbl">
    <tr><th>You ask</th><th>Assumed answer</th><th>Why it matters</th></tr>
    <tr><td>What actions?</td><td>Approve, step-up (OTP) or review, block</td><td>Three bands, two thresholds</td></tr>
    <tr><td>Time budget?</td><td>Under 100 ms p99 inside checkout</td><td>Model ~20 ms; no heavy joins</td></tr>
    <tr><td>How rare?</td><td>~0.1% of payments; refund abuse ("food never arrived") rising</td><td>Accuracy is useless</td></tr>
    <tr><td>Explain declines?</td><td>Yes, to customers and the payment partner</td><td>Reason codes</td></tr>
  </table>
  <h3>Estimate</h3>
  <ol>
    <li>Payments = orders = 600,000/day → 6.9/s average, ~28/s at peak. Small traffic: the model's cost is not the problem.</li>
    <li>Fraud at 0.1% = <strong>600 a day</strong>. Each scoring reads ~10 velocity keys from Redis: trivial load.</li>
    <li>Review capacity: an analyst checks ~20 cases/hour, 8 hours = 160/day. Sending 0.5% of payments to review = 3,000 cases/day = 19 analysts. The review band is sized by team capacity, not just by the model.</li>
  </ol>
  <h3>Metrics</h3>
  <p>With 0.1% positives use <strong>PR-AUC</strong> rather than ROC-AUC, and <strong>recall at a fixed false-positive rate</strong> (<a class="xref" data-note="ml_evaluation">Model Evaluation</a>). Best: put it in rupees — cost = fraud let through + ₹150 per good customer declined. Choosing the block threshold on 100,000 simulated payments (about four hours of Biteful):</p>
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
          f"FPR={false_decl/n_legit:.2%} false declines={false_decl:&gt;4} total cost=Rs {cost:,.0f}")</div>
<div class="fx" data-lang="text">t=0.3: recall=100% precision=7% FPR=1.35% false declines=1344 total cost=Rs 201,600
t=0.5: recall=89% precision=78% FPR=0.03% false declines=  25 total cost=Rs 91,908
t=0.7: recall=53% precision=100% FPR=0.00% false declines=   0 total cost=Rs 343,580
t=0.9: recall=12% precision=100% FPR=0.00% false declines=   0 total cost=Rs 642,952</div>
  <p>At t = 0.3 every fraud is caught but 1,344 good customers are declined: 1,344 × ₹150 = ₹201,600. At t = 0.9 nobody good is declined, but 88% of fraud gets through and costs ₹642,952. t = 0.5 is cheapest. The line <code>fraud_loss = amount[~block &amp; is_fraud].sum()</code> weights each missed fraud by its rupee amount, so a missed ₹40,000 fraud counts more than a ₹200 one. In production this gives three bands:</p>
  <figure class="viz"><svg viewBox="0 0 720 104" width="720" role="img"><rect x="20" y="20" width="340" height="40" rx="3" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="190" y="45" text-anchor="middle" font-weight="600">approve</text><rect x="360" y="20" width="136" height="40" rx="3" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="428" y="45" text-anchor="middle" font-weight="600">review / OTP</text><rect x="496" y="20" width="204" height="40" rx="3" class="fr" stroke="currentColor" stroke-opacity=".55"/><text x="598" y="45" text-anchor="middle" font-weight="600">block</text><text x="20" y="78" text-anchor="middle" class="tm">0</text><text x="360" y="78" text-anchor="middle" class="tm">0.5</text><text x="496" y="78" text-anchor="middle" class="tm">0.7</text><text x="700" y="78" text-anchor="middle" class="tm">1.0</text><text x="360" y="98" text-anchor="middle" class="tm">fraud score →</text></svg><figcaption>Two thresholds, three actions. The middle band's width is limited by how many cases analysts (or OTP friction) can absorb.</figcaption></figure>
  <h3>Data, labels, features</h3>
  <p>Labels: chargebacks (30–90 days), analyst verdicts, refund-claim investigations. The newest data has no labels yet (<a class="xref" data-note="sd_monitoring">Monitoring</a> §05). The strongest features are <strong>velocity</strong> features: how many payments this account made in the last 10 minutes, hour, day. A stolen card is used fast, many times. Others: amount vs this user's usual, new device/IP, refunds claimed per order, graph links (accounts sharing a device with a known fraudster). Velocity must be fresh to the second, so a stream job maintains it:</p>
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
  <p>Each account keeps a queue of recent timestamps. A new payment is appended, and the <code>while</code> loop drops anything older than 600 seconds. acct_9 reaches 4 payments within 55 seconds, a classic stolen-card burst. At t = 700 the old ones have expired and the count is back to 1. In production a stream processor (Flink, Kafka Streams on <a class="xref" data-note="de_kafka">Kafka</a>) does exactly this and writes the count to Redis.</p>
  <h3>Model, serving, monitoring</h3>
  <p>Baseline: rules (blocklists, "more than 5 payments in 10 minutes"). Main model: a <strong>GBM</strong> — tabular data, a millisecond per score, SHAP reason codes. Rules stay in front: they change in minutes when a new attack appears; retraining takes days.</p>
  <figure class="viz"><svg viewBox="0 0 740 196" width="740" role="img"><defs><marker id="sc-m3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="10" y="14" width="160" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="90" y="40" text-anchor="middle" font-weight="600">Payment</text><rect x="196" y="14" width="160" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="276" y="33" text-anchor="middle" font-weight="600">Rules</text><text x="276" y="47" text-anchor="middle" class="tm">blocklists, limits</text><rect x="382" y="14" width="160" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="462" y="33" text-anchor="middle" font-weight="600">GBM score</text><text x="462" y="47" text-anchor="middle" class="tm">txn + velocity</text><rect x="568" y="14" width="160" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="648" y="33" text-anchor="middle" font-weight="600">Decision</text><text x="648" y="47" text-anchor="middle" class="tm">approve/review/block</text><line x1="172" y1="36" x2="193" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><line x1="358" y1="36" x2="379" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><line x1="544" y1="36" x2="565" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><rect x="10" y="140" width="160" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="90" y="166" text-anchor="middle" font-weight="600">Event stream</text><rect x="196" y="140" width="160" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="276" y="159" text-anchor="middle" font-weight="600">Stream job</text><text x="276" y="173" text-anchor="middle" class="tm">velocity feats</text><rect x="382" y="140" width="160" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="462" y="159" text-anchor="middle" font-weight="600">Online store</text><text x="462" y="173" text-anchor="middle" class="tm">Redis</text><rect x="568" y="140" width="160" height="44" rx="6" class="fr" stroke="currentColor" stroke-opacity=".55"/><text x="648" y="159" text-anchor="middle" font-weight="600">Analysts +</text><text x="648" y="173" text-anchor="middle" class="tm">chargebacks</text><line x1="172" y1="162" x2="193" y2="162" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><line x1="358" y1="162" x2="379" y2="162" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><line x1="90" y1="60" x2="90" y2="137" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><line x1="462" y1="138" x2="462" y2="61" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><line x1="648" y1="60" x2="648" y2="137" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><text x="640" y="104" text-anchor="end" class="tm">labels → retrain</text></svg><figcaption>Score inside the payment path. Velocity features come from a stream job, labels from analysts weeks later.</figcaption></figure>
  <p>Budget (100 ms): network ~20 ms, rules ~5 ms, parallel Redis reads ~10 ms, GBM ~5–20 ms, the rest slack. If the model or Redis times out, fall back to rules only; a payment must never hang. Monitor daily: score PSI, decline rate, review queue size; monthly: recall on matured labels, by cohort. Trade-offs: recall vs customer friction; explainable GBM vs deep sequence models; rules (fast to change) vs model (generalises).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A bank branch guard. He has a list of known troublemakers (rules), a feel for who looks nervous (model), and a manager to call (review). He decides at the door in seconds, and learns weeks later who really was trouble.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Velocity feature</strong>: a count or sum over a recent time window per entity. <strong>Chargeback</strong>: a payment reversed after a customer dispute; the fraud label. <strong>Selective labels</strong>: outcomes observed only for approved cases.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Random train/test splits; fraud patterns move, so split by time and evaluate only on matured labels. And blocked payments never get a chargeback: let a tiny random sample through or to review, or the model stops learning about what it blocks (<a class="xref" data-note="sd_experiments">Experiments</a> §07).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: forecasting.</b> All three cases so far answer while someone waits. Biteful also has to decide tonight how many riders to schedule for next Friday at 8 pm in Kothrud. Nobody is waiting; the problem is predicting the future, and the past is partly missing. What changes?</div>

  <h2 id="sc-fc"><span class="num">05</span>Case 4: Demand Forecasting</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Rider schedules are fixed days ahead. Too few riders: late orders (case 1 breaks). Too many: idle pay. How do we forecast orders per zone per half-hour, express uncertainty, and evaluate honestly when some history (outage days) doesn't show true demand?</p>
  </div>
  <p><em>"Forecast orders per zone per 30-minute slot for the next 7 days to plan rider shifts."</em></p>
  <h3>Clarify</h3>
  <table class="tbl">
    <tr><th>You ask</th><th>Assumed answer</th><th>Why it matters</th></tr>
    <tr><td>Who uses it, when?</td><td>The shift planner, nightly</td><td>Batch job; no request latency</td></tr>
    <tr><td>How far ahead?</td><td>1–7 days</td><td>7 forecasts per slot</td></tr>
    <tr><td>One number enough?</td><td>No: staffing needs a safety margin</td><td>Quantiles (P50, P90)</td></tr>
    <tr><td>Known future events?</td><td>Promotions, holidays, IPL match days</td><td>Future-known features</td></tr>
  </table>
  <h3>Estimate</h3>
  <p>300 zones × 48 half-hour slots × 7 days = <strong>100,800 forecasts a night</strong>; two years of history = 10.5M rows. Small: one machine, minutes. The difficulty is not scale but <strong>uncertainty and missing truth</strong>.</p>
  <h3>Metrics</h3>
  <p><strong>WAPE</strong> (weighted absolute percentage error) = total absolute error ÷ total actual; unlike MAPE it doesn't blow up on slots with 0 orders. <strong>Bias</strong> = (total forecast − total actual) ÷ total actual: positive means over-staffing, negative means late food. <strong>Pinball loss</strong> scores a quantile forecast: for P90, being under the actual costs 9× more than being over — the shape of the business cost. Online: late-order rate and rider idle time.</p>
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
  <p>Trace the model line: absolute errors 1, 0, 2, 1, 3, 1, 0 = 8, over 85 actual, so WAPE = 8 ÷ 85 = 9.4%; forecasts also sum to 85, so bias 0. The naive "same slot last week" misses Friday's spike (20 vs 30): WAPE 29.4%. The P90 line is above the actual every day; over a long backtest a good P90 should cover about 90%, so 100% in a week hints it is a little high. Now Wednesday: actual 0 — the app was down for that half-hour. That 0 is not demand; it is <strong>censored</strong>. Training on it teaches the model "Wednesdays are dead".</p>
  <h3>Data, features, model</h3>
  <p>Data: orders per zone-slot, app outage log, promotions, holidays (Diwali, Ganesh Chaturthi), cricket match schedule, weather forecast. Features: lags (same slot 7, 14, 28 days ago), rolling means, day of week, promo flag, rain forecast, zone category. Baseline: <strong>seasonal naive</strong>. Main model: <strong>one global LightGBM</strong> across all zones with a quantile objective (as in case 1). Why global? Most zone-slots are noisy and short; a promo's effect in Kothrud teaches the model about Baner. More in <a class="xref" data-note="ml_ts_ml">ML for Time Series</a>.</p>
  <figure class="viz"><svg viewBox="0 0 740 196" width="740" role="img"><defs><marker id="sc-m2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="10" y="14" width="160" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="90" y="40" text-anchor="middle" font-weight="600">Order history</text><rect x="10" y="74" width="160" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="90" y="93" text-anchor="middle" font-weight="600">Promos, holidays,</text><text x="90" y="107" text-anchor="middle" class="tm">cricket, weather</text><rect x="205" y="44" width="160" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="285" y="63" text-anchor="middle" font-weight="600">Features</text><text x="285" y="77" text-anchor="middle" class="tm">lags, rolling</text><rect x="400" y="44" width="150" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="475" y="63" text-anchor="middle" font-weight="600">Global GBM</text><text x="475" y="77" text-anchor="middle" class="tm">all zones x slots</text><rect x="585" y="44" width="145" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="657.5" y="63" text-anchor="middle" font-weight="600">Forecasts</text><text x="657.5" y="77" text-anchor="middle" class="tm">P10 / P50 / P90</text><rect x="585" y="140" width="145" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="657.5" y="159" text-anchor="middle" font-weight="600">Rider shifts</text><text x="657.5" y="173" text-anchor="middle" class="tm">planned</text><rect x="400" y="140" width="150" height="44" rx="6" class="fr" stroke="currentColor" stroke-opacity=".55"/><text x="475" y="159" text-anchor="middle" font-weight="600">Backtest vs actual</text><text x="475" y="173" text-anchor="middle" class="tm">WAPE, bias</text><line x1="172" y1="36" x2="203" y2="60" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m2)"/><line x1="172" y1="96" x2="203" y2="74" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m2)"/><line x1="367" y1="66" x2="397" y2="66" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m2)"/><line x1="552" y1="66" x2="582" y2="66" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m2)"/><line x1="657.5" y1="90" x2="657.5" y2="137" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m2)"/><line x1="583" y1="162" x2="553" y2="162" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m2)"/><line x1="475" y1="138" x2="475" y2="91" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#sc-m2)"/><text x="482" y="118" text-anchor="start" class="tm">weekly retrain</text></svg><figcaption>A batch system: no online latency, but quantiles and backtests matter more than a single accuracy number.</figcaption></figure>
  <h3>Serving, monitoring, trade-offs</h3>
  <p>A nightly job checks inputs first (did today's orders land? row counts normal?), builds features, predicts, writes a forecasts table the planner reads by 6 am (<a class="xref" data-note="de_etl">ETL</a>). If inputs are missing, reuse yesterday's forecasts shifted by a day. Evaluate with a <strong>rolling-origin backtest</strong>: train up to week t, forecast t+1, slide, repeat — never a random split. Monitor WAPE and bias by zone as actuals arrive (labels in a day), P90 coverage, and outage-masked slots. Trade-offs: global vs per-zone models; P90 (fewer late orders) vs idle rider pay; retrain cadence vs shocks (a new IPL schedule).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A chaiwala near a college deciding how much milk to buy. Usually 20 litres, up to 28 on exam days. Running out loses the day's customers; extra milk spoils. He buys near the high end because running out hurts more. That is a P90 forecast.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Censored demand</strong>: on outage (or stock-out) slots we observe what was served, not what was wanted. <strong>Quantile forecast</strong> (P90): a value the actual should stay below 90% of the time. <strong>Rolling-origin backtest</strong>: repeated train-up-to-t, test-after-t evaluation.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Training on raw counts. Outage slots show 0 orders, not 0 demand. Mask or impute them, or the model under-forecasts, Biteful under-staffs, deliveries run late, customers leave, real orders drop — and the model "learns" it was right.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: sponsored listings.</b> In every case so far the model's number was used to rank or to decide. In Biteful's sponsored listings, the model's probability is multiplied by a bid and directly sets a price. What does that demand of the model that AUC can't check?</div>

  <h2 id="sc-ads"><span class="num">06</span>Bonus: Sponsored Listings</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Restaurants pay to appear in two "Sponsored" slots, per click. The auction picks the winner by bid × predicted click rate. If the predicted rate is 30% too high for one restaurant, what goes wrong — and why can't a ranking metric see it?</p>
  </div>
  <p><em>"Predict click probability for sponsored restaurant cards to run the auction."</em> 12M feed loads × 2 slots = 24M impressions/day; ~50 sponsored candidates per request → about 27,800 predictions/s at peak. Typical CTR ~1%.</p>
  <p>A model is <strong>calibrated</strong> when its probabilities match reality: of cards it scores 2%, about 2% get clicked. AUC only checks order, so it can't see this. Offline: <strong>log loss</strong> and the <strong>calibration ratio</strong> = mean predicted CTR ÷ observed CTR (≈ 1.0 is good) — see <a class="xref" data-note="ml_calibration">Calibration</a>. Online: revenue per thousand impressions, CTR, restaurant return on spend; guardrail: users hiding sponsored cards. Three things in code: fixing downsampling, what miscalibration does to an auction, and a calibration check.</p>
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
  <p>Part 1: keeping 10% of non-clicks makes clicks look 9× more common in training (1% → 9.17%). <code>p = q / (q + (1 − q) / w)</code> maps outputs back to 1%. Without it, every restaurant is charged as if its card were 9× more clickable.</p>
  <p>Part 2: <strong>eCPM</strong> = 1,000 × bid × pCTR, expected rupees per thousand impressions. With true probabilities B wins (240) and pays ₹10 per click, just enough to beat A's 200: over 1,000 impressions, 20 clicks × ₹10 = ₹200. If the model over-predicts A by 30%, A "wins" with 260 and pays ₹18.46 per click — but A's real CTR is still 1%, so 1,000 impressions bring 10 clicks × ₹18.46 = ₹184.6. Revenue fell ~8%, users saw a less relevant card, and restaurant A overpaid. Part 3: a ratio of 1.21 flags a model 21% over-confident; fix with a calibration layer (Platt scaling or isotonic regression) fitted on fresh data.</p>
  <figure class="viz"><svg viewBox="0 0 740 196" width="740" role="img"><defs><marker id="sc-m4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="10" y="14" width="128" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="74" y="33" text-anchor="middle" font-weight="600">Ad request</text><text x="74" y="47" text-anchor="middle" class="tm">user, page</text><rect x="158" y="14" width="128" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="222" y="33" text-anchor="middle" font-weight="600">Candidates</text><text x="222" y="47" text-anchor="middle" class="tm">targeting</text><rect x="306" y="14" width="128" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="370" y="33" text-anchor="middle" font-weight="600">pCTR model</text><text x="370" y="47" text-anchor="middle" class="tm">calibrated</text><rect x="454" y="14" width="128" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="518" y="33" text-anchor="middle" font-weight="600">Auction</text><text x="518" y="47" text-anchor="middle" class="tm">bid x pCTR</text><rect x="602" y="14" width="128" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="666" y="40" text-anchor="middle" font-weight="600">Ad shown</text><line x1="140" y1="36" x2="155" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m4)"/><line x1="288" y1="36" x2="303" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m4)"/><line x1="436" y1="36" x2="451" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m4)"/><line x1="584" y1="36" x2="599" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m4)"/><rect x="602" y="140" width="128" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="666" y="159" text-anchor="middle" font-weight="600">Impression +</text><text x="666" y="173" text-anchor="middle" class="tm">click logs</text><rect x="454" y="140" width="128" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="518" y="159" text-anchor="middle" font-weight="600">Join clicks</text><text x="518" y="173" text-anchor="middle" class="tm">to impressions</text><rect x="306" y="140" width="128" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="370" y="159" text-anchor="middle" font-weight="600">Train</text><text x="370" y="173" text-anchor="middle" class="tm">hourly refresh</text><line x1="666" y1="60" x2="666" y2="137" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m4)"/><line x1="600" y1="162" x2="585" y2="162" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m4)"/><line x1="452" y1="162" x2="437" y2="162" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m4)"/><line x1="370" y1="138" x2="370" y2="61" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#sc-m4)"/></svg><figcaption>The model's probability is used as a price input, so calibration matters as much as ranking quality.</figcaption></figure>
  <p>Data: impression logs joined to clicks within a wait window (say 30 minutes), negatives downsampled. Features: user interests, restaurant, slot position, time, and crosses (user cuisine × restaurant cuisine); ids via the hashing trick or embeddings. Baseline: logistic regression (fast, naturally calibrated). Main: DCN or DeepFM, updated hourly. Monitor the calibration ratio per slice every hour.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A mandi auction for mangoes. Each trader bids per kilo, and the auctioneer weighs the crate. If his scale reads 30% heavy for one trader, that trader wins crates he shouldn't and pays for mangoes that aren't there. pCTR is the scale.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>pCTR</strong>: predicted click-through rate. <strong>Calibration</strong>: predicted probabilities match observed frequencies. <strong>Negative downsampling</strong>: keeping a fraction w of negatives; correct with p = q / (q + (1 − q) / w).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reporting only AUC. A model can rank perfectly and still be 30% over-confident, mispricing every auction. Always report log loss and the calibration ratio.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: side by side.</b> Five designs, one company. Which differences really drove each design, and can we see them before the interview's tenth minute?</div>

  <h2 id="sc-compare"><span class="num">07</span>Side by Side</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The steps never changed. What did change from case to case, and is there one fact per problem that, spotted early, predicts the whole design?</p>
  </div>
  <p>All the estimates come from the same few multiplications:</p>
  <div class="fx" data-lang="py">DAY = 86_400
loads_day = 3_000_000 * 4                     # Biteful feed loads per day
peak = loads_day / DAY * 4                    # dinner peak QPS

# ETA: 20 cards per feed load
print(f"eta    peak QPS {peak:,.0f}  ETAs/s {peak*20:,.0f}")

# Restaurant recs: ~2,000 restaurants deliver to a typical address; ranker scores 300 after retrieval
print(f"recs   score all 2,000 at peak {peak*2_000/1e6:.2f} M/s  vs after retrieval (300) {peak*300/1e6:.2f} M/s")
print(f"recs   dish index 2M dishes x 64 dims x 4 B = {2e6*64*4/1e6:,.0f} MB")

# Fraud: payments = orders
orders = 600_000
print(f"fraud  payments/day {orders:,}  peak/s {orders/DAY*4:,.1f}  frauds/day at 0.1% {orders*0.001:,.0f}")

# Demand forecasting: 300 zones x 48 half-hour slots x 7-day horizon
fc = 300 * 48 * 7
print(f"fcst   forecasts/night {fc:,}  history rows (2 years) {300*48*730/1e6:.1f} M")

# Sponsored listings: 2 ad slots per feed load, 50 candidate sponsored restaurants per request
print(f"ads    impressions/day {loads_day*2/1e6:.0f} M  pCTR predictions/s at peak {peak*50:,.0f}")</div>
<div class="fx" data-lang="text">eta    peak QPS 556  ETAs/s 11,111
recs   score all 2,000 at peak 1.11 M/s  vs after retrieval (300) 0.17 M/s
recs   dish index 2M dishes x 64 dims x 4 B = 512 MB
fraud  payments/day 600,000  peak/s 27.8  frauds/day at 0.1% 600
fcst   forecasts/night 100,800  history rows (2 years) 10.5 M
ads    impressions/day 24 M  pCTR predictions/s at peak 27,778</div>
  <table class="tbl">
    <tr><th></th><th>ETA</th><th>Recommendations</th><th>Fraud</th><th>Forecasting</th><th>Sponsored</th></tr>
    <tr><td>Serving</td><td>Online, 20 per request</td><td>Online, two-stage</td><td>Online, in payment path</td><td>Nightly batch</td><td>Online auction</td></tr>
    <tr><td>Key number</td><td>11,111 ETAs/s, 60 ms</td><td>2,000 → 300 candidates</td><td>0.1% positives, 600/day</td><td>100,800 forecasts/night</td><td>27,778 pCTR/s</td></tr>
    <tr><td>Label delay</td><td>~1 hour (cancels never)</td><td>Minutes–days</td><td>30–90 days</td><td>1 day</td><td>Minutes</td></tr>
    <tr><td>Metric trait</td><td>Late rate / quantile</td><td>Ranking (NDCG)</td><td>₹ cost at low FPR</td><td>WAPE, bias, pinball</td><td>Calibration, log loss</td></tr>
    <tr><td>Biggest risk</td><td>Broken promises, skew</td><td>Feedback loop</td><td>Adversaries; unlabelled blocks</td><td>Censored demand</td><td>Mispricing</td></tr>
    <tr><td>Baseline</td><td>15 + 4 × km</td><td>Popular near you</td><td>Rules</td><td>Seasonal naive</td><td>Logistic regression</td></tr>
  </table>
  <p>Turn each number into a decision: 11,111/s in 60 ms → online, batched, cached; 2,000 × 0.047 ms ≈ 94 ms → retrieval first; 600 frauds a day → precision matters more than throughput, and analysts are a capacity limit; 100,800 forecasts → one machine, so spend effort on quantiles and backtests; 27,778 predictions/s that set prices → small, fast, calibrated models.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Five kinds of cooking in one kitchen: à la carte with a promised time (ETA), a menu chosen per guest (recs), a food-safety check at the door (fraud), tomorrow's grocery order (forecasting), and buffet plates priced by weight (ads). Same skills, different constraints.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Dominant constraint</strong>: the one fact (latency, candidate count, label rarity and delay, batch horizon, price-setting) that most shapes a design. Name it within the first ten minutes.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reusing one template answer for every prompt. The steps are shared; the dominant constraint is not.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: common mistakes.</b> Which errors sink case answers most often?</div>

  <h2 id="sc-mistakes"><span class="num">08</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Knowing the steps is not enough. Which specific slips, repeated across interviews, cost the most marks?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: model first</span><p>Naming a model before the goal, label and metric. The interviewer can't judge a model without knowing what it predicts.</p></div>
  <div class="callout trap"><span class="label">Trap: no numbers</span><p>"It should be fast." Say 11,111 ETAs/s, 60 ms, 2,000 candidates, and let the numbers pick the design.</p></div>
  <div class="callout trap"><span class="label">Trap: the mean as a promise</span><p>An unbiased ETA is late half the time (P50: 50%, P80: 22%).</p></div>
  <div class="callout trap"><span class="label">Trap: accuracy on rare events</span><p>0.1% fraud gives 99.9% accuracy to a model that never flags. Use PR-AUC, recall at fixed FPR, or rupee cost.</p></div>
  <div class="callout trap"><span class="label">Trap: random splits on time data</span><p>ETA, fraud and forecasting must be split by time, or the model sees the future.</p></div>
  <div class="callout trap"><span class="label">Trap: forgetting the label's quirks</span><p>Cancelled orders and outage slots are censored, blocked fraud is never labelled, recs only learn from shown items, ad clicks arrive late. Name the quirk and the fix.</p></div>
  <div class="callout trap"><span class="label">Trap: no fallback, no rollout</span><p>Every online case needs a timeout fallback (baseline ETA, rules-only, popular row) and a launch plan: shadow → canary → A/B with guardrails (<a class="xref" data-note="sd_experiments">Experiments</a>).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> Which track note supplies which part of each case.</div>

  <h2 id="sc-connect"><span class="num">09</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each case reused the earlier notes. Which note supplied which decision, in which case, with which number?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 700 250" width="700" role="img">
    <defs><marker id="sc-c0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="160" height="40" rx="6" class="fb" stroke="currentColor" stroke-opacity=".5"/><text x="90" y="45" text-anchor="middle" font-size="12" font-weight="600">Framework</text>
    <rect x="10" y="75" width="160" height="40" rx="6" class="fg" stroke="currentColor" stroke-opacity=".5"/><text x="90" y="100" text-anchor="middle" font-size="12" font-weight="600">Serving</text>
    <rect x="10" y="130" width="160" height="40" rx="6" class="fr" stroke="currentColor" stroke-opacity=".5"/><text x="90" y="155" text-anchor="middle" font-size="12" font-weight="600">Monitoring</text>
    <rect x="10" y="185" width="160" height="40" rx="6" class="fv" stroke="currentColor" stroke-opacity=".5"/><text x="90" y="210" text-anchor="middle" font-size="12" font-weight="600">Experiments</text>
    <rect x="300" y="10" width="190" height="38" rx="6" class="fs" stroke="currentColor" stroke-opacity=".5"/><text x="395" y="27" text-anchor="middle" font-size="12" font-weight="600">1 ETA</text><text x="395" y="42" text-anchor="middle" font-size="10" class="tm">P80: 22% late</text>
    <rect x="300" y="58" width="190" height="38" rx="6" class="fs" stroke="currentColor" stroke-opacity=".5"/><text x="395" y="75" text-anchor="middle" font-size="12" font-weight="600">2 Recommendations</text><text x="395" y="90" text-anchor="middle" font-size="10" class="tm">2,000 → 300; NDCG 0.921</text>
    <rect x="300" y="106" width="190" height="38" rx="6" class="fs" stroke="currentColor" stroke-opacity=".5"/><text x="395" y="123" text-anchor="middle" font-size="12" font-weight="600">3 Fraud</text><text x="395" y="138" text-anchor="middle" font-size="10" class="tm">t = 0.5: ₹91,908</text>
    <rect x="300" y="154" width="190" height="38" rx="6" class="fs" stroke="currentColor" stroke-opacity=".5"/><text x="395" y="171" text-anchor="middle" font-size="12" font-weight="600">4 Forecasting</text><text x="395" y="186" text-anchor="middle" font-size="10" class="tm">WAPE 9.4% vs 29.4%</text>
    <rect x="300" y="202" width="190" height="38" rx="6" class="fs" stroke="currentColor" stroke-opacity=".5"/><text x="395" y="219" text-anchor="middle" font-size="12" font-weight="600">Bonus: sponsored</text><text x="395" y="234" text-anchor="middle" font-size="10" class="tm">calibration ratio 1.21</text>
    <line x1="170" y1="40" x2="297" y2="29" stroke="currentColor" stroke-opacity=".7" marker-end="url(#sc-c0)"/>
    <line x1="170" y1="40" x2="297" y2="173" stroke="currentColor" stroke-opacity=".7" marker-end="url(#sc-c0)"/>
    <line x1="170" y1="40" x2="297" y2="221" stroke="currentColor" stroke-opacity=".7" marker-end="url(#sc-c0)"/>
    <line x1="170" y1="40" x2="297" y2="125" stroke="currentColor" stroke-opacity=".25"/>
    <line x1="170" y1="95" x2="297" y2="31" stroke="currentColor" stroke-opacity=".25"/>
    <line x1="170" y1="95" x2="297" y2="77" stroke="currentColor" stroke-opacity=".7" marker-end="url(#sc-c0)"/>
    <line x1="170" y1="95" x2="297" y2="125" stroke="currentColor" stroke-opacity=".25"/>
    <line x1="170" y1="150" x2="297" y2="125" stroke="currentColor" stroke-opacity=".7" marker-end="url(#sc-c0)"/>
    <line x1="170" y1="150" x2="297" y2="173" stroke="currentColor" stroke-opacity=".25"/>
    <line x1="170" y1="150" x2="297" y2="31" stroke="currentColor" stroke-opacity=".25"/>
    <line x1="170" y1="205" x2="297" y2="77" stroke="currentColor" stroke-opacity=".25"/>
    <line x1="170" y1="205" x2="297" y2="31" stroke="currentColor" stroke-opacity=".25"/>
    <text x="510" y="35" font-size="10" class="tm">quantile promise</text>
    <text x="510" y="83" font-size="10" class="tm">two-stage, loops</text>
    <text x="510" y="131" font-size="10" class="tm">late labels, rules</text>
    <text x="510" y="179" font-size="10" class="tm">batch, censoring</text>
    <text x="510" y="227" font-size="10" class="tm">probability = price</text>
  </svg><figcaption>Left: the four track notes. Right: the cases. Dark arrows mark each case's heaviest dependency (framework for ETA, forecasting and sponsored; serving for recommendations; monitoring for fraud); light lines show other strong uses.</figcaption></figure>
  <table class="tbl"><caption>Every case through the track's notes</caption>
    <tr><th>Case</th><th>Built from (notes)</th><th>Answers which question</th><th>Key value</th><th>When this pattern applies</th></tr>
    <tr><td>1 ETA</td><td>framework (labels, PIT, baseline), serving (budget, skew), monitoring, experiments (switchback)</td><td>trustworthy time promise, live</td><td>P50 50% late → P80 22% (+2.7 min)</td><td>online regression with asymmetric cost</td></tr>
    <tr><td>2 Recommendations</td><td>framework, serving (two-stage, ANN), experiments (interleaving, loops)</td><td>best 20 of thousands, in 150 ms</td><td>94 ms → 14 ms ranking; NDCG 0.921 vs 0.53</td><td>large candidate sets</td></tr>
    <tr><td>3 Fraud</td><td>framework (metric by cost), serving (stream features), monitoring (delayed labels)</td><td>block, review or approve, now</td><td>t = 0.5 cheapest (₹91,908)</td><td>rare, costly, adversarial positives</td></tr>
    <tr><td>4 Forecasting</td><td>framework (time splits), monitoring (backtests), batch serving</td><td>how many riders, per zone-slot</td><td>WAPE 9.4% vs 29.4%; P90 covers 7/7</td><td>planning ahead, no request latency</td></tr>
    <tr><td>Bonus: sponsored</td><td>framework (metrics), <a class="xref" data-note="ml_calibration">calibration</a></td><td>probability as a price</td><td>ratio 1.21; revenue ₹200 → ₹184.6</td><td>auctions, pricing, expected value</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p><strong>Every case is the same walk — goal, numbers, labels, features, baseline, model, evaluation, serving, monitoring, rollout — and every design difference traces back to one dominant fact found in the first ten minutes: an asymmetric promise, a huge candidate set, rare late labels, a batch horizon with censored history, or a probability used as a price.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet.</b> Then the follow-up questions interviewers ask after each case.</div>

  <h2 id="sc-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The note on one page. Running example: Biteful, 3M DAU, 12M feed loads and 600,000 orders a day, peak 556 feed loads/s; one ETA system end to end, plus recommendations, fraud, forecasting and sponsored listings at the same company.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Case</th><th>Question</th><th>Dominant fact</th><th>Weakness → next</th></tr>
    <tr><td>The walk</td><td>how to answer any prompt?</td><td>same steps, out loud</td><td>needs a full example → ETA</td></tr>
    <tr><td>1 ETA</td><td>trustworthy promise, live?</td><td>late ≫ early; 60 ms</td><td>only 20 items → recs</td></tr>
    <tr><td>2 Recs</td><td>best 20 of 2,000?</td><td>candidate count</td><td>plenty of labels → fraud</td></tr>
    <tr><td>3 Fraud</td><td>rare, late, adversarial?</td><td>0.1%, 30–90 days</td><td>all online → forecasting</td></tr>
    <tr><td>4 Forecasting</td><td>plan days ahead?</td><td>batch; censored history</td><td>number = price? → ads</td></tr>
    <tr><td>Sponsored</td><td>probability as price?</td><td>calibration</td><td>→ side by side</td></tr>
  </table>
  <h3>Formulas and numbers</h3>
  <table class="tbl">
    <tr><th>Formula</th><th>Symbols</th><th>On Biteful</th></tr>
    <tr><td>QPS = requests/day ÷ 86,400; peak = × 2–5</td><td>4× dinner peak</td><td>12M → 139 → 556</td></tr>
    <tr><td>pinball(y, f, α) = mean max(α·(y−f), (α−1)·(y−f))</td><td>α = quantile</td><td>P80 ETA: 22% late; forecast P90 pinball 0.37</td></tr>
    <tr><td>NDCG@K = DCG / ideal DCG; DCG = Σ gain / log₂(pos + 1)</td><td>pos from 1</td><td>4.387 / 4.762 = 0.921</td></tr>
    <tr><td>Recall@K = relevant in top K ÷ all relevant</td><td>K items</td><td>A 0.67, B 0.33</td></tr>
    <tr><td>fraud cost = missed fraud ₹ + ₹150 × false declines</td><td>per threshold t</td><td>t 0.5: ₹91,908</td></tr>
    <tr><td>WAPE = Σ|y − f| ÷ Σy; bias = Σ(f − y) ÷ Σy</td><td>totals over slots</td><td>8 ÷ 85 = 9.4%; 0</td></tr>
    <tr><td>eCPM = 1,000 × bid × pCTR</td><td>bid per click</td><td>B 240, A 200 (260 if over-predicted)</td></tr>
    <tr><td>p = q / (q + (1 − q)/w)</td><td>q training-scale, w negative keep rate</td><td>0.0917 → 0.0100</td></tr>
  </table>
  <h3>Definitions</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td>Quantile regression, pinball loss</td><td>predict the α-quantile; asymmetric absolute loss</td></tr>
    <tr><td>Retrieval / ranking / re-ranking</td><td>cheap recall-oriented selection / careful scoring / business rules</td></tr>
    <tr><td>Two-tower, ANN index</td><td>user and item encoders; fast approximate nearest-neighbour search</td></tr>
    <tr><td>Velocity feature, chargeback</td><td>windowed count per entity; reversed payment = fraud label</td></tr>
    <tr><td>Censored demand, rolling-origin backtest</td><td>observed ≠ true demand; repeated train-to-t, test-after-t</td></tr>
    <tr><td>Calibration, eCPM, downsampling correction</td><td>probabilities match frequencies; value per 1,000 impressions; undo negative sampling</td></tr>
  </table>
  <h3>Use / avoid</h3>
  <div class="cards">
    <div><b>Use</b><p>The walk with stated assumptions; a reason per choice; quantile promises for ETA; retrieval before ranking when candidates are thousands; rupee-cost thresholds and rules-in-front for fraud; global quantile models and rolling backtests for forecasting; calibration checks wherever a probability becomes a price; a fallback and a rollout plan in every online case.</p></div>
    <div><b>Avoid</b><p>Model-first answers; no numbers; the mean as a promise; scoring every candidate with the heavy model; accuracy on rare events; random splits on time data; training on censored zeros; AUC-only ad models.</p></div>
  </div>
  <h3>Five rapid-fire checks</h3>
  <ol>
    <li>P50 ETA is late 50% of the time. What does P80 do here? <em>22% late, for 2.7 more minutes shown (38.2 vs 35.5).</em></li>
    <li>Why two stages for 2,000 restaurants? <em>2,000 × ~0.047 ms ≈ 94 ms of a 150 ms budget; 300 candidates ≈ 14 ms.</em></li>
    <li>Fraud thresholds 0.3 / 0.5 / 0.9 cost ₹201,600 / ₹91,908 / ₹642,952. Pick? <em>0.5, then size the review band to analyst capacity.</em></li>
    <li>A zone-slot shows 0 orders during an app outage. Train on it? <em>No: censored; mask or impute.</em></li>
    <li>Calibration ratio 1.21. Meaning and fix? <em>Model 21% over-confident; recalibrate (Platt/isotonic) on fresh data.</em></li>
  </ol>

  <h2 id="sc-qa"><span class="num">10</span>Follow-up Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>ETA: why predict a quantile instead of the mean?</summary><div class="qa-body">Late costs more than early. A mean (or median) model is late about half the time; a P80 model is late ~20% of the time for a slightly longer ETA (22% late, +2.7 minutes in our run). Choose the quantile with an A/B test on on-time rate and conversion.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>ETA: a brand-new restaurant has no prep history. What do you do?</summary><div class="qa-body">Use a prior from similar restaurants (cuisine, size, area) for prep time, a default queue, and a wider quantile until a week of orders exists; log it as a slice in monitoring.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Recs: how do you handle a brand-new restaurant?</summary><div class="qa-body">An item tower built from content (cuisine, menu text, photos, price) gives it an embedding without orders; reserve exploration slots; add a decaying freshness boost; monitor new-restaurant exposure.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Recs: traffic grows 10×. What breaks first?</summary><div class="qa-body">Ranker compute. Cut candidates (300 → 150), distil or quantise the ranker, cache per-user rows for a few minutes, batch ranking calls, and replicate the ANN index.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Fraud: how do you pick the block threshold?</summary><div class="qa-body">Minimise expected cost (missed fraud amount + cost per false decline) on a time-based validation set with matured labels; then size the review band to analyst capacity.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Fraud: how do you get labels for payments you blocked?</summary><div class="qa-body">Mostly you don't. Let a tiny random sample of borderline payments through (with loss limits) or send them to review, and reweight by inverse propensity in training.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Fraud: fraudsters adapt within days. How does the system keep up?</summary><div class="qa-body">Rules for instant response, frequent retraining on matured plus analyst labels, anomaly scores for unseen patterns, graph features that are hard to fake, and drift monitors on scores and decline rates.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Forecasting: WAPE or MAPE?</summary><div class="qa-body">WAPE. MAPE divides by each slot's actual, so a slot with 0 or 1 order explodes the score. WAPE divides total error by total actual, weighting busy slots more.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Forecasting: why one global model instead of one per zone?</summary><div class="qa-body">Zone-slots are short and noisy. A global model shares patterns (promo effect, rain, match days) across zones, handles new zones via features, and is one pipeline to monitor instead of 300.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Ads: you trained with 10% of negatives and the model outputs 0.0917. Real pCTR?</summary><div class="qa-body">p = q / (q + (1 − q)/w) = 0.0917 / (0.0917 + 0.9083/0.1) ≈ 0.0100, i.e. 1%.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>For any case: how do you roll out the new model?</summary><div class="qa-body">Offline gate vs champion → shadow for latency and outputs by slice → 5–10% canary with a statistical stop rule → A/B for full weeks on the primary metric with guardrails → ramp, with flag rollback ready.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the ETA model appear inside the recommendations case?</summary><div class="qa-body">The ETA is a feature of the ranker (people avoid 55-minute restaurants) and part of the card the user sees. A change to the ETA model therefore shifts recommendations too, so its rollout should check recommendation metrics as guardrails.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: which monitoring idea matters most for fraud, and why?</summary><div class="qa-body">Delayed labels. Chargebacks take 30–90 days, so recent cohorts look clean; you rely on score and input drift, decline and review rates, and analyst labels, and judge recall only on matured cohorts.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks in the forecasting case if you skip the framework's leakage check?</summary><div class="qa-body">Features like "orders so far today" or a random train/test split let the model see the future; backtest WAPE looks excellent and live forecasts fail. Rolling-origin backtests and point-in-time features are the same leakage rules applied to time series.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the bonus ads case need calibration but the recommendation ranker mostly doesn't?</summary><div class="qa-body">The ranker only needs the order of scores to pick the top 20. The auction multiplies the probability by a bid to choose the winner and set the price, so the absolute value matters; a 30% over-prediction changed both winner and revenue.</div></details>
</main>`
});
