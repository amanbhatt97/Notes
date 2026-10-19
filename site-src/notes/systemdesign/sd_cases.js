// notes/systemdesign/sd_cases.js — Case Studies
Object.assign(TOPIC_CONTENT, {
  "sd_cases": `<main>
  <h1>Case Studies</h1>
  <p class="lead">Four classic ML design prompts, each walked like a mock interview: clarify, estimate, metrics, data, features, model, serving, monitoring, trade-offs. Every choice comes with its reason, and every number (traffic, latency, storage, metrics) is worked out. Learn the shape; adapt the details to the prompt. Uses the steps from <a class="xref" data-note="sd_framework">How to Approach ML System Design</a>.</p>

  <h2 id="sc-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">ML Design Case Studies</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The walk (every case)</div>
        <ul>
          <li><b>Clarify</b> — goal, users, scale, latency, constraints; write assumptions down</li>
          <li><b>Estimate</b> — QPS = daily requests / 86,400; peak = 3–6× average</li>
          <li><b>Metrics</b> — offline (model), online (business), guardrails (must not break)</li>
          <li><b>Data → features → model</b> — labels first; baseline before deep model</li>
          <li><b>Serving → monitoring → trade-offs</b> — latency budget, fallbacks, drift, rollout</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Recommendations</div>
        <ul>
          <li><b>Frame</b> — rank items by P(purchase | user, item, context)</li>
          <li><b>Numbers</b> — 50M DAU × 5 = 250M req/day → 2,894 avg, ~17k peak QPS</li>
          <li><b>Arch</b> — two-tower + ANN (10M × 64 × 4 B = 2.56 GB) → ranker on 1,000 → re-rank</li>
          <li><b>Metrics</b> — Recall@K, NDCG offline; purchases/user online; diversity guardrail</li>
          <li>⚠ <b>Trap</b> — feedback loop: only shown items get labels → explore</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Demand forecasting</div>
        <ul>
          <li><b>Frame</b> — units per SKU × store × day, horizon 1–14 days, P10/P50/P90</li>
          <li><b>Numbers</b> — 100M series × 14 days = 1.4B forecasts/night; 16.8 GB out</li>
          <li><b>Metrics</b> — WAPE, bias, pinball loss; online: stock-outs, waste</li>
          <li><b>Model</b> — one global LightGBM; baseline seasonal naive; batch, no request latency</li>
          <li>⚠ <b>Trap</b> — sales ≠ demand on stock-out days (censored); backtest by time</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Fraud detection</div>
        <ul>
          <li><b>Frame</b> — P(fraud | txn) → approve / review / block, &lt;100 ms</li>
          <li><b>Numbers</b> — 5k TPS = 432M txns/day; 0.1% fraud; 15k peak × 10 feature reads = 150k Redis reads/s</li>
          <li><b>Metrics</b> — PR-AUC, recall at fixed FPR, ₹ cost = missed fraud + false declines</li>
          <li><b>Arch</b> — rules + GBM in payment path; stream job → velocity features in Redis</li>
          <li>⚠ <b>Trap</b> — labels 30–90 days late, blocked txns unlabelled, adversaries adapt</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Ad click prediction</div>
        <ul>
          <li><b>Frame</b> — pCTR per (user, ad, context); auction ranks bid × pCTR</li>
          <li><b>Numbers</b> — 100k req/s × 500 ads = 50M predictions/s; 34.6B impressions/day</li>
          <li><b>Metrics</b> — log loss, calibration ≈ 1.0, AUC; online: revenue, CTR, ad hides</li>
          <li><b>Why calibration</b> — 30% over-predicted pCTR wins the auction and loses revenue</li>
          <li>⚠ <b>Trap</b> — negative downsampling: q = 0.0917 must map back to p = 0.01</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Common follow-ups</div>
        <ul>
          <li><b>Scale ×10</b> — fewer candidates, distil, cache, shard the index</li>
          <li><b>Cold start</b> — content features, priors, exploration slots</li>
          <li><b>Fairness</b> — slice metrics, exposure constraints</li>
          <li><b>Label delay</b> — proxies, drift monitors, analyst samples</li>
          <li><b>Rollout</b> — shadow → canary → A/B with guardrails</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sc-how"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">How to Walk a Case</span><span class="rm-sub">Same nine-step shape</span></div></div>
      <div class="rm-item rm-done" data-target="sc-rec"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">E-commerce Recommendations</span><span class="rm-sub">Retrieval + ranking</span></div></div>
      <div class="rm-item rm-done" data-target="sc-fc"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Demand Forecasting</span><span class="rm-sub">Batch, quantiles, backtests</span></div></div>
      <div class="rm-item rm-done" data-target="sc-fraud"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Real-Time Fraud</span><span class="rm-sub">100 ms, late labels, adversaries</span></div></div>
      <div class="rm-item rm-done" data-target="sc-ads"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Ad Click Prediction</span><span class="rm-sub">Calibration is money</span></div></div>
      <div class="rm-item rm-done" data-target="sc-compare"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Side by Side</span><span class="rm-sub">What changes per problem</span></div></div>
      <div class="rm-item rm-done" data-target="sc-mistakes"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">What sinks a case answer</span></div></div>
      <div class="rm-item rm-done" data-target="sc-qa"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Follow-up Questions</span><span class="rm-sub">What interviewers ask next</span></div></div>
    </div>
  </div>

  <h2 id="sc-how"><span class="num">01</span>How to Walk a Case</h2>
  <p>An ML design interview opens with one vague line: "Design fraud detection for a card network." There is no data, no numbers, no right answer. The common failure is to jump to "I'd use XGBoost" in the first minute. The interviewer then has nothing to score: you never said what problem you solved, how you would know it works, or how it would run.</p>
  <p>The fix is to walk the <em>same</em> nine steps every time, saying each step's name out loud before you fill it. The steps are the same for all four cases below; only the answers change.</p>
  <div class="flow"><span>Clarify</span><span>Estimate</span><span>Metrics</span><span>Data &amp; labels</span><span>Features</span><span>Model</span><span>Serving</span><span>Monitoring</span><span>Trade-offs</span></div>
  <table class="tbl">
    <tr><th>Step</th><th>The question it answers</th><th>Rough minutes (of 45)</th></tr>
    <tr><td>Clarify</td><td>What is the business goal, who are the users, what are the limits?</td><td>5</td></tr>
    <tr><td>Estimate</td><td>How much traffic, data and time do we have? (QPS, storage, latency)</td><td>3</td></tr>
    <tr><td>Metrics</td><td>How will we know the model is good, offline and online?</td><td>5</td></tr>
    <tr><td>Data, labels, features</td><td>What do we learn from, and what is the "right answer" for each example?</td><td>8</td></tr>
    <tr><td>Model</td><td>Baseline first, then the main model, and why that one</td><td>7</td></tr>
    <tr><td>Serving</td><td>How does a prediction reach the user in time?</td><td>8</td></tr>
    <tr><td>Monitoring, trade-offs</td><td>How do we know it still works next month, and what did we give up?</td><td>9</td></tr>
  </table>
  <p>Two habits make the walk work. First, <strong>state assumptions</strong> when the interviewer does not give numbers: "I'll assume 50 million daily users; tell me if that's off." Second, <strong>give a reason with every choice</strong>: not "a GBM", but "a GBM, because the data is tabular, it trains in minutes, and SHAP values explain declines to the bank".</p>
  <p>The one formula you need for estimates: <strong>QPS</strong> (queries per second) = requests per day ÷ 86,400 (seconds in a day). Traffic is not flat, so <strong>peak QPS</strong> is usually 3–6× the average; you design for the peak.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A doctor's consultation. A good doctor does not prescribe the moment you sit down. She asks questions (clarify), takes your temperature and BP (estimate), decides what "better" means (metrics), orders tests (data), then prescribes (model), explains how to take it (serving) and books a follow-up (monitoring). Skipping straight to the prescription is how mistakes happen.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Offline metric</strong>: computed on held-out historical data (AUC, NDCG). <strong>Online metric</strong>: measured on live users in an A/B test (orders, revenue). <strong>Guardrail</strong>: a metric that must not get worse (latency, complaints). <strong>Baseline</strong>: the simplest reasonable solution, which the ML model must beat.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Spending 30 minutes on model architecture. Interviewers score the whole system: framing, metrics, data, serving and monitoring carry more marks than the choice between two neural nets.</p>
  </div>

  <h2 id="sc-rec"><span class="num">02</span>E-commerce Recommendations</h2>
  <p><em>"Design the 'Recommended for you' feed for a store with 50M daily active users and 10M products."</em> Think of the home screen of Myntra or Flipkart: a row of products picked for you alone.</p>
  <h3>Clarify</h3>
  <table class="tbl">
    <tr><th>You ask</th><th>Assumed answer</th><th>Why it matters</th></tr>
    <tr><td>What is the goal: clicks or purchases?</td><td>Purchases and GMV (gross merchandise value, total rupees sold), clicks as a signal</td><td>Optimising clicks alone rewards clickbait thumbnails</td></tr>
    <tr><td>Where is it shown, how many items?</td><td>Home feed, 20 items per load</td><td>Sets how many candidates we must rank</td></tr>
    <tr><td>Latency limit?</td><td>p99 under 150 ms</td><td>Rules out a heavy model on all 10M items</td></tr>
    <tr><td>How fast does the catalogue change?</td><td>Thousands of new items daily</td><td>New items have no clicks yet: cold start</td></tr>
  </table>
  <h3>Estimate</h3>
  <ol>
    <li>Requests/day: 50M users × 5 feed loads = <strong>250M</strong>.</li>
    <li>Average QPS: 250M ÷ 86,400 = <strong>2,894</strong>. Peak (evening sale, ×6) ≈ <strong>17,361</strong>.</li>
    <li>Ranking work at peak: 17,361 × 1,000 candidates = <strong>17.4M scores/s</strong>. If one CPU core scores 1,000 candidates in 20 ms, it serves 50 requests/s, so peak needs 17,361 ÷ 50 ≈ <strong>350 cores</strong> before headroom.</li>
    <li>Item index: 10M items × 64-number embedding × 4 bytes = <strong>2.56 GB</strong> (0.64 GB with 8-bit numbers). Fits in RAM on one machine, so we can copy it to every server.</li>
    <li>Logs: 250M loads × 20 items shown = 5B impressions/day × ~100 bytes = <strong>500 GB/day</strong>.</li>
  </ol>
  <p>Point 3 is the key insight: we cannot run a heavy model on 10M items per request. That forces the two-stage design below.</p>
  <h3>Metrics</h3>
  <p>Offline, we replay a user's next session. <strong>Recall@K</strong> asks: of the items the user really engaged with, what fraction appeared in our top K? It checks retrieval ("did we fetch the right items at all?"). <strong>NDCG@K</strong> (normalised discounted cumulative gain) also rewards putting the best items <em>near the top</em>: each item's gain is divided by log₂(position + 1), then the total is divided by the best possible total. Online: purchases and GMV per user in an A/B test. Guardrails: latency, diversity (not 20 black t-shirts), return rate.</p>
  <p>Worked example: the user then bought a kurta (gain 3), added sandals to cart (2) and clicked a dupatta (1). Two models ranked five items:</p>
  <div class="fx" data-lang="py">import math

def recall_at_k(ranked, relevant, k):
    return len(set(ranked[:k]) &amp; relevant) / len(relevant)

def ndcg_at_k(ranked, gains, k):
    dcg = sum(gains.get(item, 0) / math.log2(pos + 2) for pos, item in enumerate(ranked[:k]))
    ideal = sorted(gains.values(), reverse=True)[:k]
    idcg = sum(g / math.log2(pos + 2) for pos, g in enumerate(ideal))
    return dcg / idcg

# what this user actually did next session: purchase = 3, add-to-cart = 2, click = 1
gains = {"kurta": 3, "dupatta": 1, "sandals": 2}
model_a = ["kurta", "saree", "sandals", "watch", "dupatta"]
model_b = ["watch", "saree", "dupatta", "sandals", "kurta"]
for name, ranked in [("A", model_a), ("B", model_b)]:
    print(name, "Recall@3 =", round(recall_at_k(ranked, set(gains), 3), 2),
          " NDCG@5 =", round(ndcg_at_k(ranked, gains, 5), 3))</div>
  <div class="fx" data-lang="text">A Recall@3 = 0.67  NDCG@5 = 0.921
B Recall@3 = 0.33  NDCG@5 = 0.53</div>
  <p>Trace model A by hand. DCG = 3/log₂2 + 0 + 2/log₂4 + 0 + 1/log₂6 = 3 + 1 + 0.387 = 4.387. The ideal order (3, 2, 1) gives 3 + 2/log₂3 + 1/log₂4 = 3 + 1.262 + 0.5 = 4.762. NDCG = 4.387 / 4.762 = 0.921. Model B has the same five items but buries the kurta at the bottom, so its NDCG is 0.53. The <code>pos + 2</code> in the code is "position + 1" with positions counted from 0.</p>
  <h3>Data, labels and features</h3>
  <p>Labels are <strong>implicit feedback</strong>: nobody rates products, but their actions tell us. Purchase &gt; add-to-cart &gt; click &gt; shown-but-ignored. Shown-but-ignored items are the most useful negatives, because the model must learn why a plausible item was skipped. Features: <strong>user</strong> (embedding of recent views, favourite categories, price range), <strong>item</strong> (category, price, rating, age, image embedding), <strong>context</strong> (time, device, sale day), <strong>cross</strong> (this user's past CTR on this category).</p>
  <h3>Model, and why two stages</h3>
  <p>Baseline: "popular in your top categories". It is cheap and surprisingly hard to beat, so we always measure against it. Main design, because of estimate point 3: <strong>retrieval</strong> picks ~1,000 candidates from 10M fast, then a <strong>ranker</strong> scores only those 1,000 carefully. Retrieval uses a <strong>two-tower</strong> model: one network turns the user into a vector, another turns each item into a vector, trained so a user's vector is close to items they buy. Item vectors are computed offline and put in an <strong>ANN</strong> (approximate nearest neighbour) index such as FAISS, which finds the closest 1,000 in a few milliseconds. The ranker starts as a GBM on rich features, later a multi-task neural net that predicts click and purchase together.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Hiring at a big company. HR screens 10,000 CVs in a day with keyword filters (retrieval: fast, rough). Managers interview the 50 who pass (ranking: slow, careful). Interviewing all 10,000 would be better in theory and impossible in practice.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 740 196" width="740" role="img"><defs><marker id="sc-m1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><text x="10" y="14" text-anchor="start" class="tb" font-weight="600">Offline (daily)</text><rect x="10" y="22" width="160" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="90" y="41" text-anchor="middle" font-weight="600">ANN index</text><text x="90" y="55" text-anchor="middle" class="tm">FAISS / ScaNN</text><rect x="196" y="22" width="160" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="276" y="48" text-anchor="middle" font-weight="600">Item embeddings</text><rect x="382" y="22" width="160" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="462" y="41" text-anchor="middle" font-weight="600">Train two-tower</text><text x="462" y="55" text-anchor="middle" class="tm">+ ranker</text><rect x="568" y="22" width="160" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="648" y="48" text-anchor="middle" font-weight="600">Interaction logs</text><line x1="566" y1="44" x2="545" y2="44" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m1)"/><line x1="380" y1="44" x2="359" y2="44" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m1)"/><line x1="194" y1="44" x2="173" y2="44" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m1)"/><text x="10" y="188" text-anchor="start" class="tb" font-weight="600">Online (per request, &lt;150 ms)</text><rect x="10" y="126" width="128" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="74" y="145" text-anchor="middle" font-weight="600">Request</text><text x="74" y="159" text-anchor="middle" class="tm">user_id</text><rect x="158" y="126" width="128" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="222" y="145" text-anchor="middle" font-weight="600">Candidates</text><text x="222" y="159" text-anchor="middle" class="tm">ANN + popular</text><rect x="306" y="126" width="128" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="370" y="145" text-anchor="middle" font-weight="600">Ranker</text><text x="370" y="159" text-anchor="middle" class="tm">GBM / DNN</text><rect x="454" y="126" width="128" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="518" y="145" text-anchor="middle" font-weight="600">Re-rank</text><text x="518" y="159" text-anchor="middle" class="tm">diversity</text><rect x="602" y="126" width="128" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="666" y="152" text-anchor="middle" font-weight="600">Feed</text><line x1="140" y1="148" x2="155" y2="148" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m1)"/><line x1="288" y1="148" x2="303" y2="148" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m1)"/><line x1="436" y1="148" x2="451" y2="148" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m1)"/><line x1="584" y1="148" x2="599" y2="148" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m1)"/><line x1="90" y1="68" x2="222" y2="123" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#sc-m1)"/><line x1="462" y1="68" x2="370" y2="123" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#sc-m1)"/><line x1="666" y1="124" x2="648" y2="69" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#sc-m1)"/></svg><figcaption>Dashed arrows cross the offline/online line: index and model ship down, logged impressions flow back up.</figcaption></figure>
  <h3>Serving: spend the 150 ms</h3>
  <figure class="viz"><svg viewBox="0 0 720 96" width="720" role="img"><rect x="20" y="20" width="91" height="34" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="65" y="42" text-anchor="middle" class="tm">network 20</text><rect x="111" y="20" width="68" height="34" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="145" y="42" text-anchor="middle" class="tm">fetch 15</text><rect x="179" y="20" width="91" height="34" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="224" y="42" text-anchor="middle" class="tm">retrieve 20</text><rect x="270" y="20" width="272" height="34" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="406" y="42" text-anchor="middle" class="tm">rank 1,000 items 60</text><rect x="542" y="20" width="45" height="34" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="564" y="42" text-anchor="middle" class="tm">10</text><rect x="587" y="20" width="113" height="34" class="fs" stroke="currentColor" stroke-opacity=".3"/><text x="643" y="42" text-anchor="middle" class="tm">slack 25</text><text x="564" y="72" text-anchor="middle" class="tm">re-rank</text><text x="360" y="90" text-anchor="middle" class="tm">p99 budget = 150 ms (all numbers in ms)</text></svg><figcaption>Ranking gets the biggest slice; the slack absorbs slow network hops and garbage-collection pauses.</figcaption></figure>
  <p>The item index is rebuilt daily and copied to each retrieval server. The user vector is computed at request time from recent views held in an online feature store (see <a class="xref" data-note="sd_serving">Feature Stores &amp; Online/Offline Serving</a>). If the ranker times out, serve the candidates in retrieval order; if everything fails, serve a cached "popular now" feed. Users should never see an empty screen.</p>
  <h3>Monitoring and trade-offs</h3>
  <p>Watch CTR and purchases by slice (new users, categories), <strong>catalogue coverage</strong> (share of items shown at least once a day), new-item exposure, embedding drift and p99 latency. Trade-offs to name: click vs purchase objective; daily index rebuild (fresh) vs cost; exploration slots (short-term loss) vs a feedback loop where only shown items get labels; GBM simplicity vs multi-task DNN gains.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Random negatives only. The ranker then never learns from "shown but ignored" items, which are the hard, informative negatives. Use them, plus some random items, and log what was shown.</p>
  </div>

  <h2 id="sc-fc"><span class="num">03</span>Demand Forecasting</h2>
  <p><em>"Forecast daily demand for 50k SKUs across 2,000 stores to drive replenishment."</em> Think of a grocery chain like DMart deciding tonight how many packets of each item to send to each store.</p>
  <h3>Clarify</h3>
  <table class="tbl">
    <tr><th>You ask</th><th>Assumed answer</th><th>Why it matters</th></tr>
    <tr><td>Who uses the forecast?</td><td>An ordering system, nightly</td><td>Batch job, no per-request latency</td></tr>
    <tr><td>How far ahead?</td><td>1–14 days (supplier lead time)</td><td>14 forecasts per series</td></tr>
    <tr><td>Is a single number enough?</td><td>No, safety stock needs uncertainty</td><td>Predict quantiles, not just the mean</td></tr>
    <tr><td>Do we know promotions in advance?</td><td>Yes, from the promo calendar</td><td>Future promos can be features</td></tr>
  </table>
  <h3>Estimate</h3>
  <ol>
    <li>Series: 50,000 SKUs × 2,000 stores = <strong>100M</strong> (one series = one SKU in one store).</li>
    <li>Forecasts per night: 100M × 14 days = <strong>1.4B</strong>. With three quantiles at 4 bytes each: 1.4B × 3 × 4 = <strong>16.8 GB</strong>.</li>
    <li>If the job must finish in a 4-hour window: 1.4B ÷ 14,400 s = <strong>97,222 predictions/s</strong>. At ~10,000 GBM predictions/s per core that is about 10 cores: the model is cheap.</li>
    <li>The heavy part is features: two years of daily history = 100M × 730 = <strong>73B rows</strong> to scan for lags and rolling means. That is a distributed batch job (Spark or Ray), not a single Python script.</li>
  </ol>
  <h3>Metrics</h3>
  <p><strong>WAPE</strong> (weighted absolute percentage error) = total absolute error ÷ total actual units. Unlike MAPE it does not blow up on days with 0 sales. <strong>Bias</strong> = (total forecast − total actual) ÷ total actual: positive means we over-order (waste), negative means stock-outs. <strong>Pinball loss</strong> scores a quantile forecast: for P90, being under the actual costs 9× more than being over, which is exactly the shape of the business cost. Online: stock-out rate, waste, inventory holding cost.</p>
  <div class="fx" data-lang="py">import numpy as np

actual   = np.array([12, 8, 0, 15, 30, 9, 11])     # units sold, Mon..Sun, one SKU in one store
naive    = np.array([10, 9, 7, 14, 20, 12, 10])    # "same day last week"
model    = np.array([11, 8, 2, 16, 27, 10, 11])    # the GBM's median forecast
model_p90 = np.array([15, 11, 4, 20, 34, 13, 14])  # the GBM's 90th-percentile forecast

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
  <p>Trace the model line: absolute errors are 1, 0, 2, 1, 3, 1, 0 = 8 units, over 85 actual units, so WAPE = 8 ÷ 85 = 9.4%. Its forecasts also sum to 85, so bias is 0. The naive baseline misses Friday's spike (20 vs 30) and has WAPE 29.4%. The P90 line is above the actual every day; in a long backtest a good P90 should cover about 90% of days, so 100% over a week hints it may be a little too high. Now look at Wednesday: actual = 0. Suppose the shelf was empty that day. Then 0 is not the demand, it is the stock, and the model's "2" was probably closer to the truth.</p>
  <h3>Data, features, model</h3>
  <p>Data: sales, stock levels (to spot stock-outs), price, promotions, holidays (Diwali, Pongal), weather, store size. Features: lags (sales 7, 14, 28 days ago), rolling 7- and 28-day means, day of week, promo flag, price change, item and store category. Baseline: <strong>seasonal naive</strong> ("same as the same day last week"). Main model: <strong>one global LightGBM</strong> trained on all series together with a quantile objective, one model per quantile. Why global? Most series are short and sparse, and a promo's effect on biscuits in Pune teaches the model about biscuits in Chennai. More in <a class="xref" data-note="ml_timeseries">Time Series Forecasting</a>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A chaiwala near a college deciding how much milk to buy. He doesn't guess one number; he thinks "usually 20 litres, but on exam days up to 28". Running out loses customers for the day; extra milk spoils. He buys near the high end because running out hurts more. That is a P90 forecast.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 740 196" width="740" role="img"><defs><marker id="sc-m2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="10" y="14" width="160" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="90" y="40" text-anchor="middle" font-weight="600">Sales history</text><rect x="10" y="74" width="160" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="90" y="93" text-anchor="middle" font-weight="600">Promos, price,</text><text x="90" y="107" text-anchor="middle" class="tm">calendar, weather</text><rect x="205" y="44" width="160" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="285" y="63" text-anchor="middle" font-weight="600">Features</text><text x="285" y="77" text-anchor="middle" class="tm">lags, rolling</text><rect x="400" y="44" width="150" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="475" y="63" text-anchor="middle" font-weight="600">Global GBM</text><text x="475" y="77" text-anchor="middle" class="tm">all SKU x store</text><rect x="585" y="44" width="145" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="657.5" y="63" text-anchor="middle" font-weight="600">Forecasts</text><text x="657.5" y="77" text-anchor="middle" class="tm">P10 / P50 / P90</text><rect x="585" y="140" width="145" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="657.5" y="159" text-anchor="middle" font-weight="600">Replenishment</text><text x="657.5" y="173" text-anchor="middle" class="tm">orders</text><rect x="400" y="140" width="150" height="44" rx="6" class="fr" stroke="currentColor" stroke-opacity=".55"/><text x="475" y="159" text-anchor="middle" font-weight="600">Backtest vs actual</text><text x="475" y="173" text-anchor="middle" class="tm">WAPE, bias</text><line x1="172" y1="36" x2="203" y2="60" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m2)"/><line x1="172" y1="96" x2="203" y2="74" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m2)"/><line x1="367" y1="66" x2="397" y2="66" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m2)"/><line x1="552" y1="66" x2="582" y2="66" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m2)"/><line x1="657.5" y1="90" x2="657.5" y2="137" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m2)"/><line x1="583" y1="162" x2="553" y2="162" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m2)"/><line x1="475" y1="138" x2="475" y2="91" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#sc-m2)"/><text x="482" y="118" text-anchor="start" class="tm">weekly retrain</text></svg><figcaption>A batch system: no online latency, but quantiles and backtests matter more than a single accuracy number.</figcaption></figure>
  <h3>Serving, monitoring, trade-offs</h3>
  <p>A nightly job checks inputs first (did today's sales file arrive? are row counts normal?), builds features, predicts, and writes a forecasts table that the ordering system reads by 5 am. If inputs are missing, reuse yesterday's forecasts shifted by a day rather than ordering from bad data. Evaluate with a <strong>rolling-origin backtest</strong>: train up to week t, forecast weeks t+1 and t+2, slide forward, repeat; never a random split, because that leaks the future. Monitor WAPE and bias by category as actuals arrive, plus the share of stock-out days. Trade-offs: global model (shared patterns, one pipeline) vs per-series models (fit quirks, 100M models to babysit); point vs quantile forecasts; retrain cadence vs sudden shocks like a lockdown.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Censored demand</strong>: on stock-out days we observe sales = stock, not true demand. <strong>Quantile forecast</strong> (P90): a value the actual should stay below 90% of the time.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Training on raw sales. A stocked-out day shows 0 sales, not 0 demand. Mask or impute those days, or the model learns to under-forecast, which causes more stock-outs, which teaches it to under-forecast again.</p>
  </div>

  <h2 id="sc-fraud"><span class="num">04</span>Real-Time Fraud</h2>
  <p><em>"Score card transactions for fraud at 5k transactions per second before authorisation."</em> When you tap your card at a petrol pump, the bank has a fraction of a second to say yes or no. Fraud models sit inside that moment.</p>
  <h3>Clarify</h3>
  <table class="tbl">
    <tr><th>You ask</th><th>Assumed answer</th><th>Why it matters</th></tr>
    <tr><td>What actions are possible?</td><td>Approve, send to review (or OTP step-up), block</td><td>Three bands, two thresholds</td></tr>
    <tr><td>Time budget?</td><td>Whole check under 100 ms p99</td><td>Model gets ~20 ms; no heavy joins at request time</td></tr>
    <tr><td>How rare is fraud?</td><td>~0.1% of transactions</td><td>Accuracy is useless (99.9% by saying "never fraud")</td></tr>
    <tr><td>Must we explain declines?</td><td>Yes, to customers and regulators</td><td>Favours models with reason codes</td></tr>
  </table>
  <h3>Estimate</h3>
  <ol>
    <li>Transactions/day: 5,000 × 86,400 = <strong>432M</strong>; fraud at 0.1% = <strong>432,000/day</strong>.</li>
    <li>Peak at 3× = <strong>15,000 TPS</strong>. Each scoring reads ~10 feature keys, so 15,000 × 10 = <strong>150,000 reads/s</strong> on the feature store. One Redis node does roughly 100k simple ops/s, so we shard across several nodes with replicas.</li>
    <li>Review capacity: an analyst checks ~20 cases/hour, 8 hours = 160/day. Sending 0.05% of traffic to review = 216,000 cases/day = 1,350 analysts. Sending 0.002% = 8,640 cases = <strong>54 analysts</strong>. The review band is set by team size, not just by the model.</li>
  </ol>
  <h3>Metrics</h3>
  <p>With 0.1% fraud, use <strong>PR-AUC</strong> (area under the precision-recall curve) rather than ROC-AUC, and <strong>recall at a fixed false positive rate</strong> (e.g. "catch as much fraud as possible while declining at most 0.1% of good customers"). Best of all, put it in rupees: cost = fraud we let through + ₹150 per good customer we decline (lost margin and annoyance). The code below picks a block threshold on 100,000 simulated transactions.</p>
  <div class="fx" data-lang="py">import numpy as np

rng = np.random.default_rng(7)
n_legit, n_fraud = 99_900, 100                       # 0.1% fraud in 100k txns
score = np.r_[rng.beta(1, 12, n_legit), rng.beta(5, 2, n_fraud)]
is_fraud = np.r_[np.zeros(n_legit, bool), np.ones(n_fraud, bool)]
amount = np.r_[rng.gamma(2, 1_000, n_legit), rng.gamma(2, 4_000, n_fraud)]   # rupees

DECLINE_COST = 150        # lost margin + annoyed customer for each good txn we block
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
  <p>At t = 0.3 we catch every fraud but decline 1,344 good customers: 1,344 × ₹150 = ₹201,600. At t = 0.9 nobody good is declined, but 88% of fraud gets through and costs ₹642,952. t = 0.5 is cheapest. The line <code>fraud_loss = amount[~block &amp; is_fraud].sum()</code> weights each missed fraud by its rupee amount, so a missed ₹40,000 fraud counts more than a missed ₹200 one. In production this gives three bands:</p>
  <figure class="viz"><svg viewBox="0 0 720 104" width="720" role="img"><rect x="20" y="20" width="340" height="40" rx="3" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="190" y="45" text-anchor="middle" font-weight="600">approve</text><rect x="360" y="20" width="136" height="40" rx="3" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="428" y="45" text-anchor="middle" font-weight="600">review / OTP</text><rect x="496" y="20" width="204" height="40" rx="3" class="fr" stroke="currentColor" stroke-opacity=".55"/><text x="598" y="45" text-anchor="middle" font-weight="600">block</text><text x="20" y="78" text-anchor="middle" class="tm">0</text><text x="360" y="78" text-anchor="middle" class="tm">0.5</text><text x="496" y="78" text-anchor="middle" class="tm">0.7</text><text x="700" y="78" text-anchor="middle" class="tm">1.0</text><text x="360" y="98" text-anchor="middle" class="tm">fraud score →</text></svg><figcaption>Two thresholds, three actions. The middle band's width is limited by how many cases analysts (or OTP friction) can absorb.</figcaption></figure>
  <h3>Data, labels, features</h3>
  <p>Labels come from <strong>chargebacks</strong> (the customer disputes a charge, 30–90 days later), analyst verdicts, and customer reports. So the newest data has no labels yet. The strongest features are <strong>velocity</strong> features: how many times this card was used in the last 10 minutes, 1 hour, 24 hours. A stolen card is used fast, many times, before it is blocked. Others: amount vs this user's usual, new device/IP/country, merchant risk score, and graph links (cards sharing a device with a known fraud card). Velocity counts must be fresh to the second, so a stream job keeps them updated. The idea, in a few lines:</p>
  <div class="fx" data-lang="py">from collections import deque, defaultdict

WINDOW = 600                      # seconds (10 minutes)
recent = defaultdict(deque)       # card -&gt; timestamps of its recent txns

def txn_count_10m(card, ts):
    q = recent[card]
    q.append(ts)
    while q[0] &lt;= ts - WINDOW:    # drop txns older than 10 minutes
        q.popleft()
    return len(q)

events = [("card_9", 0), ("card_9", 30), ("card_4", 45), ("card_9", 50),
          ("card_9", 55), ("card_9", 700)]
for card, ts in events:
    print(card, "t =", ts, "-&gt; txns in last 10 min:", txn_count_10m(card, ts))</div>
  <div class="fx" data-lang="text">card_9 t = 0 -&gt; txns in last 10 min: 1
card_9 t = 30 -&gt; txns in last 10 min: 2
card_4 t = 45 -&gt; txns in last 10 min: 1
card_9 t = 50 -&gt; txns in last 10 min: 3
card_9 t = 55 -&gt; txns in last 10 min: 4
card_9 t = 700 -&gt; txns in last 10 min: 1</div>
  <p>Each card keeps a queue of its recent timestamps. A new transaction is appended, and the <code>while</code> loop drops anything older than 600 seconds. card_9 reaches 4 uses within 55 seconds, a classic stolen-card burst. At t = 700 the old ones have expired and the count is back to 1. In production a stream processor (Flink, Kafka Streams) does exactly this and writes the count to Redis, where the scorer reads it.</p>
  <h3>Model and serving</h3>
  <p>Baseline: rules (blocklists, "more than 5 transactions in 10 minutes"). Main model: a <strong>GBM</strong>, because the data is tabular, prediction takes about a millisecond, and SHAP values (each feature's share of the score) give reason codes ("new device + unusual amount"). Rules stay in front: they can be changed in minutes when a new attack appears, while retraining takes days.</p>
  <figure class="viz"><svg viewBox="0 0 740 196" width="740" role="img"><defs><marker id="sc-m3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="10" y="14" width="160" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="90" y="40" text-anchor="middle" font-weight="600">Card txn</text><rect x="196" y="14" width="160" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="276" y="33" text-anchor="middle" font-weight="600">Rules</text><text x="276" y="47" text-anchor="middle" class="tm">blocklists, limits</text><rect x="382" y="14" width="160" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="462" y="33" text-anchor="middle" font-weight="600">GBM score</text><text x="462" y="47" text-anchor="middle" class="tm">txn + velocity</text><rect x="568" y="14" width="160" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="648" y="33" text-anchor="middle" font-weight="600">Decision</text><text x="648" y="47" text-anchor="middle" class="tm">approve/review/block</text><line x1="172" y1="36" x2="193" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><line x1="358" y1="36" x2="379" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><line x1="544" y1="36" x2="565" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><rect x="10" y="140" width="160" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="90" y="166" text-anchor="middle" font-weight="600">Event stream</text><rect x="196" y="140" width="160" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="276" y="159" text-anchor="middle" font-weight="600">Stream job</text><text x="276" y="173" text-anchor="middle" class="tm">velocity feats</text><rect x="382" y="140" width="160" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="462" y="159" text-anchor="middle" font-weight="600">Online store</text><text x="462" y="173" text-anchor="middle" class="tm">Redis</text><rect x="568" y="140" width="160" height="44" rx="6" class="fr" stroke="currentColor" stroke-opacity=".55"/><text x="648" y="159" text-anchor="middle" font-weight="600">Analysts +</text><text x="648" y="173" text-anchor="middle" class="tm">chargebacks</text><line x1="172" y1="162" x2="193" y2="162" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><line x1="358" y1="162" x2="379" y2="162" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><line x1="90" y1="60" x2="90" y2="137" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><line x1="462" y1="138" x2="462" y2="61" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><line x1="648" y1="60" x2="648" y2="137" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><text x="640" y="104" text-anchor="end" class="tm">labels → retrain</text></svg><figcaption>Score inside the payment path. Velocity features come from a stream job, labels from analysts weeks later.</figcaption></figure>
  <p>Latency budget (100 ms): network in and out ~20 ms, rules ~5 ms, parallel Redis reads ~10 ms, GBM ~5–20 ms, rest is slack. If the model or Redis times out, fall back to rules only; a payment must never hang. Monitor daily: score distribution (PSI, population stability index: how far today's scores moved from last month's), decline rate, review queue size; weekly and monthly: recall on labels as they mature, by cohort. Trade-offs: recall vs customer friction; GBM explainability vs deep sequence models; rules (fast to update) vs model (generalises); frequent retraining vs waiting for labels to mature.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A bank branch guard. He has a list of known troublemakers (rules), a feel for who looks nervous (model), and a manager he can call (review). He must decide at the door in seconds, and he only learns weeks later which people really were trouble.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Random train/test split. Fraud patterns move over time; split by time, and evaluate only on labels old enough to be complete. And remember: blocked transactions never get a chargeback, so the model never learns whether it was right to block them.</p>
  </div>

  <h2 id="sc-ads"><span class="num">05</span>Ad Click Prediction</h2>
  <p><em>"Predict click probability for ads in a feed to run the auction."</em> Every time you scroll Instagram or a news app, an auction picks which ad to show you in a few milliseconds. Search ranking is the same shape with a query as context and relevance labels.</p>
  <h3>Clarify</h3>
  <table class="tbl">
    <tr><th>You ask</th><th>Assumed answer</th><th>Why it matters</th></tr>
    <tr><td>How is the winner chosen?</td><td>Highest bid × pCTR (expected value per impression)</td><td>The probability itself sets the price, not just the order</td></tr>
    <tr><td>Traffic and latency?</td><td>100k ad requests/s, 50 ms total</td><td>Model must score hundreds of ads in ~15 ms</td></tr>
    <tr><td>Typical CTR?</td><td>~1%</td><td>Heavy imbalance; we will downsample negatives</td></tr>
    <tr><td>How fast do ads change?</td><td>New campaigns hourly</td><td>Model must refresh often</td></tr>
  </table>
  <h3>Estimate</h3>
  <ol>
    <li>Predictions: 100,000 requests/s × 500 candidate ads = <strong>50M predictions/s</strong>. At ~1M predictions/s per GPU server, about 50 servers before headroom.</li>
    <li>Impressions: 100,000 × 86,400 × 4 ad slots = <strong>34.6B/day</strong>; clicks at 1% = <strong>346M/day</strong>.</li>
    <li>Training rows if we keep all clicks and 10% of non-clicks: 0.346B + 34.2B × 0.1 = <strong>3.77B rows/day</strong> instead of 34.6B. That 9× saving is why everyone downsamples.</li>
  </ol>
  <h3>Metrics: why calibration is money</h3>
  <p>A model is <strong>calibrated</strong> when its probabilities match reality: of ads it scores 2%, about 2% get clicked. AUC only checks order, so it cannot see this. Offline we use <strong>log loss</strong> (punishes confident wrong probabilities) and the <strong>calibration ratio</strong> = mean predicted CTR ÷ observed CTR, which should be ≈ 1.0. Online: revenue per thousand impressions, CTR, advertiser return, and user ad-hide rate as a guardrail. The code shows three things: fixing downsampling, what miscalibration does to an auction, and a calibration check.</p>
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
  <p>Part 1: keeping 10% of non-clicks makes clicks look 9× more common (1% → 9.17%). The formula <code>p = q / (q + (1 − q) / w)</code> maps the model's output back to 1%. Without it, every advertiser is charged as if ads were 9× more clickable.</p>
  <p>Part 2: <strong>eCPM</strong> = 1,000 × bid × pCTR, the expected rupees per thousand impressions. With true probabilities, B wins (240) and pays ₹10 per click, enough to beat A's 200. Over 1,000 impressions that is 20 clicks × ₹10 = ₹200. Now the model over-predicts A by 30%: A "wins" with 260 and pays ₹18.46 per click. But A's real CTR is still 1%, so 1,000 impressions give 10 clicks × ₹18.46 = ₹184.6. Revenue fell about 8%, users saw a less relevant ad, and advertiser A overpaid. Part 3: a 1.21 ratio flags a model 21% over-confident; the fix is a calibration layer (Platt scaling or isotonic regression) fitted on fresh data.</p>
  <h3>Data, features, model, serving</h3>
  <p>Training data: impression logs joined to clicks that arrive within a wait window (say 30 minutes), negatives downsampled. Features: user (interests, past CTR), ad (creative, category, advertiser), placement, time, and their <strong>crosses</strong> (user-interest × ad-category). IDs have millions of values, so we use the <strong>hashing trick</strong> (map each ID to one of, say, 2²⁴ slots) or learned embeddings. Baseline: logistic regression on hashed crosses, still used at many companies because it is fast and calibrated. Main: DCN or DeepFM, which learn the crosses themselves. Retrain or incrementally update hourly, because new campaigns appear all day. Serving: model servers with request batching, a feature cache, and a calibration layer after the model.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A mandi auction for mangoes. Each trader bids per kilo, but the auctioneer also weighs the crate. If his scale reads 30% heavy for one trader, that trader wins crates he shouldn't, pays for mangoes that aren't there, and the honest traders lose. pCTR is the scale.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 740 196" width="740" role="img"><defs><marker id="sc-m4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="10" y="14" width="128" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="74" y="33" text-anchor="middle" font-weight="600">Ad request</text><text x="74" y="47" text-anchor="middle" class="tm">user, page</text><rect x="158" y="14" width="128" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="222" y="33" text-anchor="middle" font-weight="600">Candidates</text><text x="222" y="47" text-anchor="middle" class="tm">targeting</text><rect x="306" y="14" width="128" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="370" y="33" text-anchor="middle" font-weight="600">pCTR model</text><text x="370" y="47" text-anchor="middle" class="tm">calibrated</text><rect x="454" y="14" width="128" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="518" y="33" text-anchor="middle" font-weight="600">Auction</text><text x="518" y="47" text-anchor="middle" class="tm">bid x pCTR</text><rect x="602" y="14" width="128" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="666" y="40" text-anchor="middle" font-weight="600">Ad shown</text><line x1="140" y1="36" x2="155" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m4)"/><line x1="288" y1="36" x2="303" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m4)"/><line x1="436" y1="36" x2="451" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m4)"/><line x1="584" y1="36" x2="599" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m4)"/><rect x="602" y="140" width="128" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="666" y="159" text-anchor="middle" font-weight="600">Impression +</text><text x="666" y="173" text-anchor="middle" class="tm">click logs</text><rect x="454" y="140" width="128" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="518" y="159" text-anchor="middle" font-weight="600">Join clicks</text><text x="518" y="173" text-anchor="middle" class="tm">to impressions</text><rect x="306" y="140" width="128" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="370" y="159" text-anchor="middle" font-weight="600">Train</text><text x="370" y="173" text-anchor="middle" class="tm">hourly refresh</text><line x1="666" y1="60" x2="666" y2="137" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m4)"/><line x1="600" y1="162" x2="585" y2="162" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m4)"/><line x1="452" y1="162" x2="437" y2="162" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m4)"/><line x1="370" y1="138" x2="370" y2="61" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#sc-m4)"/></svg><figcaption>The model's probability is used as a price input, so calibration matters as much as ranking quality.</figcaption></figure>
  <p>Monitor calibration ratio per slice (country, placement, new advertisers) every hour, log loss on fresh data, revenue and spend pacing. Trade-offs: freshness (online learning) vs stability; downsampling (cheaper) vs calibration work; deep model gains vs latency and servers; short-term revenue vs user experience (ad load).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>pCTR</strong>: predicted click-through rate. <strong>Calibration</strong>: predicted probabilities match observed frequencies. <strong>Negative downsampling</strong>: keeping only a fraction w of negative examples; correct with <code>p = q / (q + (1 − q) / w)</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reporting only AUC. A model can rank ads perfectly and still be 30% over-confident, which misprices every auction. Always report log loss and calibration ratio too.</p>
  </div>

  <h2 id="sc-compare"><span class="num">06</span>Side by Side</h2>
  <p>Put the four cases next to each other and a pattern appears: the steps never change, but each problem has one thing that dominates the design. Spotting that thing early is what interviewers look for.</p>
  <table class="tbl">
    <tr><th></th><th>Recs</th><th>Forecasting</th><th>Fraud</th><th>Ads</th></tr>
    <tr><td>Serving</td><td>Online, two-stage</td><td>Nightly batch</td><td>Online, in payment path</td><td>Online, very high QPS</td></tr>
    <tr><td>Key number</td><td>17k peak QPS × 1,000 candidates</td><td>1.4B forecasts/night</td><td>&lt;100 ms, 0.1% positives</td><td>50M predictions/s</td></tr>
    <tr><td>Label delay</td><td>Minutes–days</td><td>1 day</td><td>30–90 days</td><td>Minutes</td></tr>
    <tr><td>Key metric trait</td><td>Ranking quality (NDCG)</td><td>Scale-free error, bias (WAPE)</td><td>Precision at low FPR, ₹ cost</td><td>Calibration, log loss</td></tr>
    <tr><td>Biggest risk</td><td>Feedback loop</td><td>Censored demand</td><td>Adversarial drift</td><td>Miscalibration = mispricing</td></tr>
    <tr><td>Baseline</td><td>Popularity</td><td>Seasonal naive</td><td>Rules</td><td>Logistic regression</td></tr>
  </table>
  <p>All four estimates come from the same few multiplications. Practise them until they are quick. This script reproduces every number used above:</p>
  <div class="fx" data-lang="py">DAY = 86_400

# Recommendations: 50M daily users, ~5 home-feed loads each
req_day = 50e6 * 5
avg_qps = req_day / DAY
print(f"recs   avg QPS {avg_qps:,.0f}  peak (x6) {avg_qps*6:,.0f}")
cands = 1_000
print(f"recs   ranker scores/s at peak {avg_qps*6*cands/1e6:,.1f} M")
items, dim = 10e6, 64
print(f"recs   item index {items*dim*4/1e9:.2f} GB (float32)  {items*dim/1e9:.2f} GB (int8)")

# Forecasting: 50k SKUs x 2,000 stores, 14-day horizon, 3 quantiles
series = 50_000 * 2_000
preds = series * 14
print(f"fcst   series {series/1e6:.0f} M  predictions/night {preds/1e9:.1f} B")
print(f"fcst   output {preds*3*4/1e9:.1f} GB  rate needed in 4 h {preds/(4*3600):,.0f} /s")

# Fraud: 5k TPS average, 0.1% fraud
tps = 5_000
txn_day = tps * DAY
print(f"fraud  txns/day {txn_day/1e6:,.0f} M  frauds/day {txn_day*0.001:,.0f}  peak TPS (x3) {tps*3:,}")

# Ads: 100k requests/s, 500 candidate ads each, 1% CTR
ads_qps, ads_c = 100_000, 500
print(f"ads    pCTR predictions/s {ads_qps*ads_c/1e6:.0f} M")
imps_day = ads_qps * DAY * 4          # 4 ad slots per request
print(f"ads    impressions/day {imps_day/1e9:.1f} B  clicks/day {imps_day*0.01/1e6:.0f} M")
print(f"ads    training rows/day after 10% neg sampling {(imps_day*0.01 + imps_day*0.99*0.1)/1e9:.2f} B")</div>
  <div class="fx" data-lang="text">recs   avg QPS 2,894  peak (x6) 17,361
recs   ranker scores/s at peak 17.4 M
recs   item index 2.56 GB (float32)  0.64 GB (int8)
fcst   series 100 M  predictions/night 1.4 B
fcst   output 16.8 GB  rate needed in 4 h 97,222 /s
fraud  txns/day 432 M  frauds/day 432,000  peak TPS (x3) 15,000
ads    pCTR predictions/s 50 M
ads    impressions/day 34.6 B  clicks/day 346 M
ads    training rows/day after 10% neg sampling 3.77 B</div>
  <p>Each line is "count × rate × size". The useful habit is the last step: turn the number into a design decision. 2.56 GB fits in RAM, so copy the index to every server. 1.4B predictions is easy, but 73B rows of history is not, so the feature job is the hard part. 50M predictions/s is why ad models stay small and fast.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Four kinds of cooking: a restaurant à la carte (recs, made per order, fast), a tiffin service (forecasting, cooked in bulk overnight), a railway station food check (fraud, decided instantly, consequences found later), and a wedding buffet priced per plate (ads, where getting the count wrong costs money). Same kitchen skills, different constraints.</p>
  </div>

  <h2 id="sc-mistakes"><span class="num">07</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: model first</span>
    <p>Naming a model before stating the goal, the label and the metric. The interviewer cannot judge a model without knowing what it predicts and why.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: no numbers</span>
    <p>"It should be fast and scale." Say 17k peak QPS, 150 ms p99, 2.56 GB index, then let the numbers pick the design (two stages, in-memory index).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: accuracy on rare events</span>
    <p>Fraud at 0.1% gives 99.9% accuracy to a model that never flags anything. Use PR-AUC, recall at fixed FPR, or rupee cost.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: random splits on time data</span>
    <p>Forecasting and fraud must be split by time (rolling origin), or the model sees the future and offline scores lie.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting the label's quirks</span>
    <p>Stock-outs censor demand, blocked fraud never gets labels, recs only learn from shown items, ad clicks arrive late. Name the quirk and the fix.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: no fallback, no rollout</span>
    <p>Every online case needs a timeout fallback (cached feed, rules-only) and a launch plan: shadow → canary → A/B, as in <a class="xref" data-note="sd_experiments">Shadow, Canary &amp; A/B Infrastructure</a>.</p>
  </div>

  <h2 id="sc-qa"><span class="num">08</span>Follow-up Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Recs: 50M DAU, 5 feed loads each. What peak QPS do you design for?</summary><div class="qa-body">250M requests/day ÷ 86,400 ≈ 2,894 average. Evening peaks run 3–6× higher, so design for ~17k QPS and add headroom for sale days.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Recs: how do you handle a brand-new product?</summary><div class="qa-body">Item tower from content (title, image, category embeddings) so it gets an embedding without interactions; reserve exploration slots; boost with a decaying freshness prior; monitor new-item exposure share.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Recs: traffic grows 10×. What breaks first and what do you change?</summary><div class="qa-body">Ranker compute (17.4M → 174M scores/s at peak). Cut candidates (1,000 → 300), distil or quantise the ranker, cache per-user results for a few minutes, add dynamic batching on GPUs, and shard or replicate the ANN index.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Forecasting: why one global model instead of one per SKU?</summary><div class="qa-body">Most series are short and sparse. A global model shares patterns (promo effect, seasonality) across items, handles new SKUs via features, and is one pipeline to monitor instead of 100 million.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Forecasting: why quantiles, not just the mean?</summary><div class="qa-body">Replenishment decides safety stock from uncertainty. A stock-out costs differently from waste, so you order at a chosen quantile (e.g. P90 for high-margin items) and score it with pinball loss.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Forecasting: WAPE or MAPE?</summary><div class="qa-body">WAPE. MAPE divides by each day's actual, so a day with 0 or 1 unit sold explodes the score. WAPE divides total error by total actual, weighting busy days more, which matches business impact.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Fraud: how do you pick the block threshold?</summary><div class="qa-body">Minimise expected cost: missed fraud amount + cost per false decline, on a time-based validation set. In our simulation t = 0.5 cost ₹91,908 vs ₹201,600 at 0.3 and ₹642,952 at 0.9. Then size the review band to analyst capacity.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Fraud: how do you get labels for transactions you blocked?</summary><div class="qa-body">You mostly don't. Let a tiny random sample of borderline transactions through (with loss limits) or send them to analyst review, and reweight by inverse propensity in training. Otherwise the model stops learning about what it blocks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Fraud: fraudsters adapt within days. How does the system keep up?</summary><div class="qa-body">Rules for instant response, frequent retraining on recent matured labels plus analyst labels, anomaly scores for unseen patterns, graph features that are hard to fake, and drift monitors on score and decline rates (see <a class="xref" data-note="sd_monitoring">Monitoring, Drift &amp; Retraining</a>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Ads: why log loss and calibration rather than AUC alone?</summary><div class="qa-body">The auction multiplies pCTR by bid, so the absolute probability sets both the winner and the price. AUC only checks ordering. In our example a 30% over-prediction made the wrong ad win and cut revenue from ₹200 to ₹184.6 per 1,000 impressions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Ads: you trained with 10% of negatives. The model outputs 0.0917. What is the real pCTR?</summary><div class="qa-body">p = q / (q + (1 − q)/w) = 0.0917 / (0.0917 + 0.9083/0.1) ≈ 0.0100, i.e. 1%.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Ads: a click can happen minutes after the impression. How do you build training data?</summary><div class="qa-body">Join clicks to impressions in a streaming job with a wait window (e.g. 15–30 min). Late clicks become false negatives; handle by a longer window, delayed-feedback correction, or later re-labelling.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Search ranking: what differs from feed recommendations?</summary><div class="qa-body">The query is the main context, so retrieval uses lexical (BM25) plus semantic embeddings; labels include human relevance ratings; position bias in clicks needs correction; and freshness/latency targets are tighter.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>For any case: how do you roll out the new model?</summary><div class="qa-body">Offline gate vs champion → shadow for latency and output checks → 1–5% canary with guardrails → A/B for 1–2 weeks on the primary metric → ramp, with config-flag rollback ready.</div></details>
</main>`
});
