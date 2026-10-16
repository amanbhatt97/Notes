// notes/systemdesign/sd_framework.js — How to Approach ML System Design
Object.assign(TOPIC_CONTENT, {
  "sd_framework": `<main>
  <h1>How to Approach ML System Design</h1>
  <p class="lead">A repeatable path for "Design X with ML" interviews: business goal → ML problem → data → model → system → loop. Senior interviews grade the path and the trade-offs, not the fanciest model. Builds on your ML and MLOps notes.</p>

  <h2 id="sf-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">ML System Design Interview</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The framework</div>
        <ul>
          <li><b>Order</b> — goal → framing → metrics → data → features → model → train → serve → evaluate → monitor → iterate</li>
          <li><b>Why</b> — shows a plan; lets the interviewer steer you</li>
          <li>💡 architect: ask who lives there before choosing taps</li>
          <li><b>Skeleton first</b> — end-to-end pass, then deepen where asked</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Clarify &amp; frame</div>
        <ul>
          <li><b>Ask</b> — business goal, scale (users, items, QPS), latency, constraints</li>
          <li><b>Frame</b> — explicit input, output, label (e.g. rank by P(purchase))</li>
          <li><b>Constraints</b> — privacy, fairness, cold start, cost</li>
          <li>⚠ <b>Proxy trap</b> — P(click) can reward clickbait; align label with goal</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Metrics</div>
        <ul>
          <li><b>Offline</b> — choose models: Recall@K, NDCG, log loss, PR-AUC</li>
          <li><b>Online</b> — decide A/B: purchases/user, revenue, retention</li>
          <li><b>Guardrail</b> — must not regress: p99 latency, complaints, diversity</li>
          <li><b>Cost of error</b> — fraud: precision at fixed recall, not accuracy</li>
          <li>⚠ offline win ≠ online win: say how you'll check</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Data → model</div>
        <ul>
          <li><b>Labels</b> — explicit vs implicit; delay; noise; negatives</li>
          <li><b>Data risks</b> — logging bias, leakage, point-in-time joins</li>
          <li><b>Features</b> — user, item, context, cross; batch vs real-time</li>
          <li><b>Baseline first</b> — popularity / rules / LR: bar + fallback</li>
          <li><b>Model by data</b> — GBM tabular; two-tower + ranker recs; sequence for sessions</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">System half</div>
        <ul>
          <li><b>Train</b> — scheduled, versioned, validated pipeline</li>
          <li><b>Serve</b> — batch vs real-time, latency budget, fallback</li>
          <li><b>Evaluate</b> — offline → shadow → canary → A/B</li>
          <li><b>Monitor</b> — system, data, model, business; retrain triggers</li>
          <li><b>Senior signal</b> — this half + trade-offs</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Scoring &amp; time</div>
        <ul>
          <li><b>Scored</b> — framing, metrics, data sense, trade-offs, production, communication</li>
          <li><b>45 min</b> — 5 clarify, 5 frame+metrics, 8 data, 8 model, 10 serving, 6 monitor, 3 wrap</li>
          <li>⚠ overspending on the model; never reaching serving</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Back-of-envelope</div>
        <ul>
          <li><b>QPS</b> — DAU × requests / 86,400; peak = 2–5× avg</li>
          <li><b>1M req/day</b> ≈ 12 QPS</li>
          <li><b>Storage</b> — rows × features × 4 B (200M × 200 ≈ 160 GB)</li>
          <li><b>Latency</b> — Redis ~1 ms; cross-region 50–150 ms</li>
          <li><b>Use</b> — decides batch vs online, CPU vs GPU, need for retrieval stage</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Mistakes</div>
        <ul>
          <li>No clarifying questions</li>
          <li>Model-first, no baseline</li>
          <li>Ignoring label delay / bias / skew</li>
          <li>No cold start, no rollout, vague "retrain sometimes"</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sf-flow"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Framework</span><span class="rm-sub">Eleven steps, one loop</span></div></div>
      <div class="rm-item rm-done" data-target="sf-frame"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Clarify &amp; Frame</span><span class="rm-sub">Business goal → ML task</span></div></div>
      <div class="rm-item rm-done" data-target="sf-metrics"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Metrics</span><span class="rm-sub">Offline, online, guardrail</span></div></div>
      <div class="rm-item rm-done" data-target="sf-data"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Data, Features, Model</span><span class="rm-sub">Baseline first, always</span></div></div>
      <div class="rm-item rm-done" data-target="sf-system"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">The System Half</span><span class="rm-sub">Train, serve, test, watch</span></div></div>
      <div class="rm-item rm-done" data-target="sf-score"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">What Gets Scored</span><span class="rm-sub">And the 45-minute budget</span></div></div>
      <div class="rm-item rm-done" data-target="sf-est"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Back-of-Envelope</span><span class="rm-sub">QPS, storage, latency</span></div></div>
      <div class="rm-item rm-done" data-target="sf-mistakes"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">What sinks candidates</span></div></div>
      <div class="rm-item rm-done" data-target="sf-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="sf-flow"><span class="num">01</span>The Framework</h2>
  <figure class="viz"><svg viewBox="0 0 720 168" width="720" role="img"><defs><marker id="sf-m1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="12" y="14" width="100" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="62" y="33" text-anchor="middle" font-weight="600">Clarify</text><text x="62" y="47" text-anchor="middle" class="tm">goal</text><rect x="130" y="14" width="100" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="180" y="33" text-anchor="middle" font-weight="600">Frame as</text><text x="180" y="47" text-anchor="middle" class="tm">ML task</text><rect x="248" y="14" width="100" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="298" y="33" text-anchor="middle" font-weight="600">Metrics</text><text x="298" y="47" text-anchor="middle" class="tm">off + online</text><rect x="366" y="14" width="100" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="416" y="33" text-anchor="middle" font-weight="600">Data &amp;</text><text x="416" y="47" text-anchor="middle" class="tm">labels</text><rect x="484" y="14" width="100" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="534" y="40" text-anchor="middle" font-weight="600">Features</text><rect x="602" y="14" width="100" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="652" y="33" text-anchor="middle" font-weight="600">Model</text><text x="652" y="47" text-anchor="middle" class="tm">baseline 1st</text><line x1="114" y1="36" x2="127" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="232" y1="36" x2="245" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="350" y1="36" x2="363" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="468" y1="36" x2="481" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="586" y1="36" x2="599" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><rect x="602" y="112" width="100" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="652" y="131" text-anchor="middle" font-weight="600">Training</text><text x="652" y="145" text-anchor="middle" class="tm">pipeline</text><rect x="484" y="112" width="100" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="534" y="138" text-anchor="middle" font-weight="600">Serving</text><rect x="366" y="112" width="100" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="416" y="131" text-anchor="middle" font-weight="600">Offline</text><text x="416" y="145" text-anchor="middle" class="tm">eval</text><rect x="248" y="112" width="100" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="298" y="131" text-anchor="middle" font-weight="600">Online</text><text x="298" y="145" text-anchor="middle" class="tm">A/B test</text><rect x="130" y="112" width="100" height="44" rx="6" class="fr" stroke="currentColor" stroke-opacity=".55"/><text x="180" y="138" text-anchor="middle" font-weight="600">Monitoring</text><rect x="12" y="112" width="100" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="62" y="138" text-anchor="middle" font-weight="600">Iterate</text><line x1="652" y1="60" x2="652" y2="109" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="600" y1="134" x2="587" y2="134" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="482" y1="134" x2="469" y2="134" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="364" y1="134" x2="351" y2="134" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="246" y1="134" x2="233" y2="134" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><line x1="128" y1="134" x2="115" y2="134" stroke="currentColor" stroke-width="1.4" marker-end="url(#sf-m1)"/><path d="M62.0,110 V86 H416.0 V61" class="sb" fill="none" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#sf-m1)"/><text x="239" y="81" text-anchor="middle" class="tb">loop back: new data, features, model</text></svg><figcaption>Problem first (blue), then data, model, system, and the loop that keeps it alive. Spend time in that order.</figcaption></figure>
  <p>Say the steps out loud at the start. It shows the interviewer you have a plan, and lets them steer you to the part they care about.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An architect sketching a house. Ask who lives there and the budget first, then rooms, then plumbing. Nobody starts by picking the tap.</p>
  </div>

  <h2 id="sf-frame"><span class="num">02</span>Clarify &amp; Frame</h2>
  <div class="cards">
    <div><b>Goal</b><p>What business number should move?</p><small>"More purchases", not "better recall"</small></div>
    <div><b>Users &amp; scale</b><p>How many users, items, requests?</p><small>Drives every estimate later</small></div>
    <div><b>Latency</b><p>Real-time, near-real-time or batch?</p><small>50 ms vs nightly is a different system</small></div>
    <div><b>Constraints</b><p>Privacy, fairness, cold start, budget.</p><small>Often the hidden twist</small></div>
  </div>
  <p>Then turn the goal into an ML task with an explicit input, output and label.</p>
  <table class="tbl">
    <tr><th>Business ask</th><th>ML framing</th><th>Label</th></tr>
    <tr><td>Increase purchases from the home feed</td><td>Rank items by P(purchase | user, item)</td><td>Bought within session</td></tr>
    <tr><td>Stop fraudulent payments</td><td>Binary classification per transaction</td><td>Chargeback / analyst verdict</td></tr>
    <tr><td>Avoid stock-outs</td><td>Forecast units per SKU × store × day</td><td>Actual sales (censored by stock-outs!)</td></tr>
    <tr><td>Show relevant search results</td><td>Learning-to-rank per query</td><td>Clicks, purchases, human ratings</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Optimising a proxy that diverges from the goal. Ranking by P(click) can promote clickbait; P(purchase) or long-term engagement may be the better target.</p>
  </div>

  <h2 id="sf-metrics"><span class="num">03</span>Metrics</h2>
  <table class="tbl">
    <tr><th>Layer</th><th>Purpose</th><th>Recommendation example</th></tr>
    <tr><td><strong>Offline</strong></td><td>Pick models before shipping</td><td>Recall@100 (retrieval), NDCG@10 (ranking), log loss</td></tr>
    <tr><td><strong>Online (primary)</strong></td><td>Decide the A/B test</td><td>Purchases per user, revenue per session</td></tr>
    <tr><td><strong>Guardrail</strong></td><td>Must not get worse</td><td>p99 latency, unsubscribe rate, catalogue coverage</td></tr>
  </table>
  <p>Offline wins don't guarantee online wins. Name both, and say how you'll check they agree.</p>
  <div class="callout intu"><span class="label">Pick metrics by cost of error</span>
    <p>Fraud: a missed fraud costs money, a false block costs a customer. So state precision at a fixed recall, or expected cost, not plain accuracy.</p>
  </div>

  <h2 id="sf-data"><span class="num">04</span>Data, Features, Model</h2>
  <div class="flow"><span>Sources</span><span>Labels</span><span>Features</span><span>Baseline</span><span>Better model</span></div>
  <table class="tbl">
    <tr><th>Step</th><th>Say this</th></tr>
    <tr><td>Data</td><td>Where it comes from, volume, freshness, bias (only logged what the old model showed).</td></tr>
    <tr><td>Labels</td><td>Explicit (ratings) vs implicit (clicks); delay; noise; negative sampling.</td></tr>
    <tr><td>Features</td><td>User, item, context, cross features. Which are batch vs real-time. Leakage risks.</td></tr>
    <tr><td>Baseline</td><td>Popularity, rules or logistic regression. Gives a number to beat and a fallback.</td></tr>
    <tr><td>Model</td><td>GBM for tabular, two-tower + ranker for recs, sequence models for sessions. Justify by data size and latency.</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Jumping to "a transformer" before a baseline. Interviewers read it as not knowing what is good enough.</p>
  </div>

  <h2 id="sf-system"><span class="num">05</span>The System Half</h2>
  <div class="cards">
    <div><b>Training pipeline</b><p>Scheduled, versioned data + code + model; point-in-time features.</p><small>Next note: feature stores</small></div>
    <div><b>Serving</b><p>Batch vs real-time; latency budget; caching; fallback.</p><small>Feature Stores &amp; Serving</small></div>
    <div><b>Evaluation</b><p>Offline → shadow → canary → A/B.</p><small>Shadow, Canary &amp; A/B</small></div>
    <div><b>Monitoring</b><p>System, data, model, business; drift; retrain triggers.</p><small>Monitoring &amp; Drift</small></div>
  </div>
  <p>This half separates senior from junior answers. A good model with no rollout or monitoring plan scores low.</p>

  <h2 id="sf-score"><span class="num">06</span>What Gets Scored</h2>
  <table class="tbl">
    <tr><th>Signal</th><th>Weak answer</th><th>Strong answer</th></tr>
    <tr><td>Problem framing</td><td>Starts with a model</td><td>Asks about goal, scale, latency; states the label</td></tr>
    <tr><td>Metrics</td><td>"Accuracy"</td><td>Offline + online + guardrail, tied to cost of errors</td></tr>
    <tr><td>Data sense</td><td>Assumes clean labels</td><td>Discusses delay, bias, leakage, sampling</td></tr>
    <tr><td>Trade-offs</td><td>One option</td><td>Two options, picks one, says why and when it breaks</td></tr>
    <tr><td>Production</td><td>Stops at training</td><td>Serving, rollout, monitoring, retraining</td></tr>
    <tr><td>Communication</td><td>Silent detours</td><td>Signposts, checks in, keeps time</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 720 118" width="720" role="img"><defs><marker id="sf-m2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><text x="10" y="18" text-anchor="middle" class="tm">0</text><rect x="10" y="26" width="77.7778" height="34" rx="2" class="fb" stroke="currentColor" stroke-opacity=".4"/><text x="48.8889" y="48" text-anchor="middle" font-weight="600">5m</text><text x="87.7778" y="18" text-anchor="middle" class="tm">5</text><text x="48.8889" y="80" text-anchor="middle">Clarify</text><rect x="87.7778" y="26" width="77.7778" height="34" rx="2" class="fb" stroke="currentColor" stroke-opacity=".4"/><text x="126.667" y="48" text-anchor="middle" font-weight="600">5m</text><text x="165.556" y="18" text-anchor="middle" class="tm">10</text><text x="126.667" y="98" text-anchor="middle">Frame+metrics</text><rect x="165.556" y="26" width="124.444" height="34" rx="2" class="ft" stroke="currentColor" stroke-opacity=".4"/><text x="227.778" y="48" text-anchor="middle" font-weight="600">8m</text><text x="290" y="18" text-anchor="middle" class="tm">18</text><text x="227.778" y="80" text-anchor="middle">Data+features</text><rect x="290" y="26" width="124.444" height="34" rx="2" class="fv" stroke="currentColor" stroke-opacity=".4"/><text x="352.222" y="48" text-anchor="middle" font-weight="600">8m</text><text x="414.444" y="18" text-anchor="middle" class="tm">26</text><text x="352.222" y="98" text-anchor="middle">Model</text><rect x="414.444" y="26" width="155.556" height="34" rx="2" class="fg" stroke="currentColor" stroke-opacity=".4"/><text x="492.222" y="48" text-anchor="middle" font-weight="600">10m</text><text x="570" y="18" text-anchor="middle" class="tm">36</text><text x="492.222" y="80" text-anchor="middle">Architecture+serving</text><rect x="570" y="26" width="93.3333" height="34" rx="2" class="fr" stroke="currentColor" stroke-opacity=".4"/><text x="616.667" y="48" text-anchor="middle" font-weight="600">6m</text><text x="663.333" y="18" text-anchor="middle" class="tm">42</text><text x="616.667" y="98" text-anchor="middle">Eval+monitoring</text><rect x="663.333" y="26" width="46.6667" height="34" rx="2" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="686.667" y="48" text-anchor="middle" font-weight="600">3m</text><text x="710" y="18" text-anchor="middle" class="tm">45</text><text x="686.667" y="80" text-anchor="middle">Wrap-up</text></svg><figcaption>A 45-minute budget. Most candidates overspend on the model and never reach serving or monitoring.</figcaption></figure>

  <h2 id="sf-est"><span class="num">07</span>Back-of-Envelope</h2>
  <p>Numbers decide architecture: batch or real-time, CPU or GPU, cache or not. Round hard; the order of magnitude is what matters.</p>
  <div class="fx" data-lang="py"># Back-of-envelope: home-feed recommendations
dau            = 50_000_000        # daily active users
req_per_user   = 10                # feed loads per user per day
avg_qps  = dau * req_per_user / 86_400
peak_qps = avg_qps * 3             # peak is ~2-5x average
print(f"avg QPS  ~ {avg_qps:,.0f}")
print(f"peak QPS ~ {peak_qps:,.0f}")

# Ranking cost: 500 candidates scored per request
cands = 500
print(f"model scores/sec at peak ~ {peak_qps*cands/1e6:,.1f} M")

# Online feature store size: 200 features x 4 bytes per user
users, feats, bytes_per = 200_000_000, 200, 4
print(f"user features ~ {users*feats*bytes_per/1e9:,.0f} GB")

# Event logs: 1 KB per impression, 20 items shown per request
log_tb_day = dau * req_per_user * 20 * 1_000 / 1e12
print(f"impression logs ~ {log_tb_day:,.0f} TB/day, {log_tb_day*365/1e3:,.1f} PB/year")

# Replicas: one GPU ranker scores ~200k items/sec; keep 50% headroom
per_gpu = 200_000
print(f"GPUs needed ~ {peak_qps*cands/per_gpu/0.5:,.0f}")</div>
  <div class="fx" data-lang="text">avg QPS  ~ 5,787
peak QPS ~ 17,361
model scores/sec at peak ~ 8.7 M
user features ~ 160 GB
impression logs ~ 10 TB/day, 3.6 PB/year
GPUs needed ~ 87</div>
  <p>Reading it: ~17k peak QPS × 500 candidates is too much for one heavy model, so you need a cheap retrieval stage first. 160 GB of features fits in a sharded in-memory store.</p>
  <table class="tbl">
    <tr><th>Number to remember</th><th>Value</th></tr>
    <tr><td>Seconds per day</td><td>86,400 ≈ 10<sup>5</sup></td></tr>
    <tr><td>1M requests/day</td><td>≈ 12 QPS average</td></tr>
    <tr><td>Peak / average</td><td>2–5×</td></tr>
    <tr><td>Redis / in-memory lookup</td><td>~1 ms (same region)</td></tr>
    <tr><td>Cross-region round trip</td><td>~50–150 ms</td></tr>
    <tr><td>GBM inference (CPU, 100 trees)</td><td>~0.1–1 ms per row; batch scores many rows per call</td></tr>
    <tr><td>float32 feature</td><td>4 bytes; 1B rows × 100 features ≈ 400 GB</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Designing for average QPS. Capacity and autoscaling must handle the peak, plus headroom for a failed zone.</p>
  </div>

  <h2 id="sf-mistakes"><span class="num">08</span>Common Mistakes</h2>
  <table class="tbl">
    <tr><th>Mistake</th><th>Fix</th></tr>
    <tr><td>No clarifying questions</td><td>Spend the first 5 minutes on goal, scale, latency</td></tr>
    <tr><td>Model-first, no baseline</td><td>State a heuristic baseline, then improve</td></tr>
    <tr><td>Ignoring label delay and bias</td><td>Say when labels arrive and what the logging policy hides</td></tr>
    <tr><td>Training-serving skew</td><td>Same feature code both paths; point-in-time joins</td></tr>
    <tr><td>No cold start story</td><td>Content features, popularity fallback, exploration</td></tr>
    <tr><td>Ships without online test</td><td>Shadow → canary → A/B with guardrails</td></tr>
    <tr><td>"Retrain sometimes"</td><td>Name the trigger: schedule, drift threshold, metric drop</td></tr>
  </table>

  <h2 id="sf-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>"Design a recommendation system." What are your first three questions?</summary><div class="qa-body">(1) What business metric should move: clicks, purchases, watch time? (2) Scale: users, items, requests per day. (3) Latency and freshness: per request in &lt;200 ms, or a daily email? Bonus: cold start and any fairness or diversity constraints.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why name offline, online and guardrail metrics separately?</summary><div class="qa-body">They answer different questions. Offline picks candidates cheaply; online decides what ships; guardrails stop a "win" that breaks latency, revenue or trust. Offline and online often disagree, so you need both.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>50M DAU, 10 feed loads each. Average and peak QPS?</summary><div class="qa-body">500M / 86,400 ≈ 5.8k QPS average. With a 3× peak factor, ≈ 17k QPS. Size servers for peak plus headroom.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why start with a baseline when you know a deep model will win?</summary><div class="qa-body">It sets the bar to beat, exposes data and pipeline bugs early, ships value fast, and becomes the fallback when the main model fails. Often the gain from the fancy model is smaller than expected.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose batch prediction over real-time?</summary><div class="qa-body">When inputs change slowly and the set of entities is enumerable: daily emails, demand forecasts, churn scores. It is cheaper and simpler. Choose real-time when the request context (query, session, transaction) matters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The interviewer says "assume infinite data and compute". What do you still discuss?</summary><div class="qa-body">Label quality and delay, the right objective, latency at serving, training-serving skew, rollout safety and monitoring. Compute doesn't fix a wrong label or a feedback loop.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you handle running out of time?</summary><div class="qa-body">Keep to the budget: skeleton end-to-end first, then deepen where the interviewer points. If short on time, summarise the remaining stages in one line each (serving, A/B, monitoring) rather than leaving them out.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your offline NDCG improved 3% but the A/B test is flat. Name three causes.</summary><div class="qa-body">(1) Offline data is biased by the old model's exposure. (2) Training-serving skew: features differ online. (3) The metric doesn't track the business goal, or the effect is too small for the test's power. Also: latency increase hurting engagement.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Storage for 200M users × 200 float32 features?</summary><div class="qa-body">200M × 200 × 4 B = 160 GB. Fits a sharded in-memory store (Redis cluster, DynamoDB with DAX). Add replicas for availability.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What makes an answer "senior"?</summary><div class="qa-body">Explicit trade-offs, awareness of data problems (delay, bias, leakage), a production plan (rollout, monitoring, retraining, fallback), and cost thinking. Juniors describe a model; seniors describe a system that stays correct over time.</div></details>
</main>`
});
