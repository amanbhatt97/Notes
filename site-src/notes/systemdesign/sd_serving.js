// notes/systemdesign/sd_serving.js — Feature Stores & Online/Offline Serving
Object.assign(TOPIC_CONTENT, {
  "sd_serving": `<main>
  <h1>Feature Stores &amp; Online/Offline Serving</h1>
  <p class="lead">How predictions actually reach users: precomputed or on request, within a latency budget, with the same features in training and serving. This is the "system" half of every ML design interview.</p>

  <h2 id="ss-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Serving &amp; Feature Stores</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Batch vs real-time</div>
        <ul>
          <li><b>Batch</b> — precompute for all on schedule → key-value lookup (~5 ms)</li>
          <li><b>Real-time</b> — per request, fresh context (query, session, txn)</li>
          <li><b>Batch fits</b> — emails, churn scores, forecasts</li>
          <li><b>Online fits</b> — search, fraud, feed ranking</li>
          <li><b>Hybrid</b> — batch embeddings/candidates + online ranking</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Latency budget</div>
        <ul>
          <li><b>Budget p99</b>, not mean; slice per stage + headroom</li>
          <li><b>Fan-out</b> — 20 calls at p99 → 1 − 0.99²⁰ ≈ 18% hit a slow one</li>
          <li><b>Fallback</b> — cached / popular list on timeout</li>
          <li>💡 relay race with a fixed finish time</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Feature store</div>
        <ul>
          <li><b>Offline store</b> — full timestamped history for training (Parquet, BQ)</li>
          <li><b>Online store</b> — latest value per key, ms (Redis, DynamoDB)</li>
          <li><b>Registry</b> — one definition, reuse, lineage</li>
          <li><b>Materialize</b> — offline → online copy job</li>
          <li><b>Feast</b> OSS store/serve; <b>Tecton</b> managed + transforms</li>
          <li>⚠ overkill for one batch model</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Point-in-time &amp; skew</div>
        <ul>
          <li><b>PIT join</b> — last feature value ≤ label time (<code>merge_asof</code>)</li>
          <li>⚠ joining latest values leaks the future: great offline, bad live</li>
          <li><b>Skew causes</b> — two code paths, freshness gap, defaults, leakage</li>
          <li><b>Fix</b> — one definition; log served features and train on them</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Precompute &amp; cache</div>
        <ul>
          <li>Item embeddings + ANN index (daily)</li>
          <li>User aggregates in online store (batch + stream counters)</li>
          <li>Full predictions ("similar items") in key-value store</li>
          <li>Response cache with TTL; key on user, locale, model version</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Serving patterns</div>
        <ul>
          <li><b>Embedded</b> — in app process; fastest; tiny models, edge</li>
          <li><b>Model server</b> — Triton/TorchServe/KServe; own scaling; many callers</li>
          <li><b>Sidecar</b> — same pod, localhost; independent deploy</li>
          <li><b>Batch job</b> — Spark/Ray scores tables</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Scaling inference</div>
        <ul>
          <li><b>Dynamic batching</b> — wait few ms, one GPU call; throughput ↑</li>
          <li><b>Quantize / distil</b> — smaller, faster; re-validate</li>
          <li><b>Autoscale</b> on queue depth/latency, not CPU (GPU services)</li>
          <li><b>Cascade</b> — cheap model first, heavy on hard cases</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Two-stage funnel</div>
        <ul>
          <li><b>Retrieval</b> — 10M → ~1k; recall; two-tower + ANN, rules</li>
          <li><b>Ranking</b> — ~1k → ~100; precision; GBM / DNN with crosses</li>
          <li><b>Re-rank</b> — diversity, freshness, business rules → 20 shown</li>
          <li>💡 hiring: CV screen → interviews → offer</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="ss-modes"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Batch vs Real-Time</span><span class="rm-sub">Precompute or compute now</span></div></div>
      <div class="rm-item rm-done" data-target="ss-budget"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Latency Budgets</span><span class="rm-sub">Slicing 200 ms</span></div></div>
      <div class="rm-item rm-done" data-target="ss-fs"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Feature Stores</span><span class="rm-sub">Offline, online, registry</span></div></div>
      <div class="rm-item rm-done" data-target="ss-pit"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Point-in-Time &amp; Skew</span><span class="rm-sub">No future, no mismatch</span></div></div>
      <div class="rm-item rm-done" data-target="ss-cache"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Precompute &amp; Cache</span><span class="rm-sub">Move work off the path</span></div></div>
      <div class="rm-item rm-done" data-target="ss-patterns"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Serving Patterns</span><span class="rm-sub">Embedded, server, sidecar</span></div></div>
      <div class="rm-item rm-done" data-target="ss-scale"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Scaling Inference</span><span class="rm-sub">Batching, GPUs, autoscale</span></div></div>
      <div class="rm-item rm-done" data-target="ss-twostage"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Retrieval → Ranking</span><span class="rm-sub">The two-stage funnel</span></div></div>
      <div class="rm-item rm-done" data-target="ss-build"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Hands-on: Feast</span><span class="rm-sub">A real local feature store</span></div></div>
      <div class="rm-item rm-done" data-target="ss-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="ss-modes"><span class="num">01</span>Batch vs Real-Time</h2>
  <figure class="viz"><svg viewBox="0 0 740 168" width="740" role="img"><defs><marker id="ss-m1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><text x="10" y="16" text-anchor="start" class="tb" font-weight="600">Batch: precompute for everyone</text><rect x="10" y="24" width="155" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="87.5" y="43" text-anchor="middle" font-weight="600">Scheduler</text><text x="87.5" y="57" text-anchor="middle" class="tm">nightly</text><rect x="199" y="24" width="155" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="276.5" y="43" text-anchor="middle" font-weight="600">Batch job</text><text x="276.5" y="57" text-anchor="middle" class="tm">score all users</text><rect x="388" y="24" width="155" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="465.5" y="43" text-anchor="middle" font-weight="600">Key-value store</text><text x="465.5" y="57" text-anchor="middle" class="tm">predictions</text><rect x="577" y="24" width="155" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="654.5" y="43" text-anchor="middle" font-weight="600">App lookup</text><text x="654.5" y="57" text-anchor="middle" class="tm">~5 ms</text><line x1="167" y1="46" x2="196" y2="46" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m1)"/><line x1="356" y1="46" x2="385" y2="46" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m1)"/><line x1="545" y1="46" x2="574" y2="46" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m1)"/><text x="10" y="100" text-anchor="start" class="tb" font-weight="600">Real-time: compute per request</text><rect x="10" y="108" width="155" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="87.5" y="134" text-anchor="middle" font-weight="600">User request</text><rect x="199" y="108" width="155" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="276.5" y="127" text-anchor="middle" font-weight="600">Feature fetch</text><text x="276.5" y="141" text-anchor="middle" class="tm">online store</text><rect x="388" y="108" width="155" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="465.5" y="127" text-anchor="middle" font-weight="600">Model server</text><text x="465.5" y="141" text-anchor="middle" class="tm">predict</text><rect x="577" y="108" width="155" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="654.5" y="127" text-anchor="middle" font-weight="600">Response</text><text x="654.5" y="141" text-anchor="middle" class="tm">~50 ms</text><line x1="167" y1="130" x2="196" y2="130" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m1)"/><line x1="356" y1="130" x2="385" y2="130" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m1)"/><line x1="545" y1="130" x2="574" y2="130" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m1)"/></svg><figcaption>Batch moves the model off the request path. Real-time pays latency to use fresh context.</figcaption></figure>
  <table class="tbl">
    <tr><th></th><th>Batch (offline)</th><th>Real-time (online)</th></tr>
    <tr><td>When computed</td><td>On a schedule, for all entities</td><td>Per request</td></tr>
    <tr><td>Freshness</td><td>Hours old</td><td>Uses this session, query, transaction</td></tr>
    <tr><td>Latency at read</td><td>~ms (key lookup)</td><td>Model + feature time</td></tr>
    <tr><td>Cost</td><td>Wasted on users who never come</td><td>Pay per request; needs autoscaling</td></tr>
    <tr><td>Fits</td><td>Daily emails, churn scores, forecasts</td><td>Search, fraud, feed ranking</td></tr>
  </table>
  <div class="callout intu"><span class="label">Hybrid is the norm</span>
    <p>Precompute the slow parts (user embeddings, candidate lists) in batch. Do the cheap, context-aware part (ranking with session features) online.</p>
  </div>

  <h2 id="ss-budget"><span class="num">02</span>Latency Budgets</h2>
  <figure class="viz"><svg viewBox="0 0 720 120" width="720" role="img"><defs><marker id="ss-m2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><text x="10" y="18" text-anchor="middle" class="tm">0</text><rect x="10" y="26" width="105" height="34" rx="2" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="62.5" y="48" text-anchor="middle" font-weight="600">30</text><text x="115" y="18" text-anchor="middle" class="tm">30</text><text x="62.5" y="80" text-anchor="middle">Network</text><rect x="115" y="26" width="70" height="34" rx="2" class="ft" stroke="currentColor" stroke-opacity=".4"/><text x="150" y="48" text-anchor="middle" font-weight="600">20</text><text x="185" y="18" text-anchor="middle" class="tm">50</text><text x="150" y="98" text-anchor="middle">Features</text><rect x="185" y="26" width="105" height="34" rx="2" class="fb" stroke="currentColor" stroke-opacity=".4"/><text x="237.5" y="48" text-anchor="middle" font-weight="600">30</text><text x="290" y="18" text-anchor="middle" class="tm">80</text><text x="237.5" y="80" text-anchor="middle">Retrieval</text><rect x="290" y="26" width="210" height="34" rx="2" class="fv" stroke="currentColor" stroke-opacity=".4"/><text x="395" y="48" text-anchor="middle" font-weight="600">60</text><text x="500" y="18" text-anchor="middle" class="tm">140</text><text x="395" y="98" text-anchor="middle">Ranking model</text><rect x="500" y="26" width="52.5" height="34" rx="2" class="fb" stroke="currentColor" stroke-opacity=".4"/><text x="526.25" y="48" text-anchor="middle" font-weight="600">15</text><text x="552.5" y="18" text-anchor="middle" class="tm">155</text><text x="526.25" y="80" text-anchor="middle">Re-rank</text><rect x="552.5" y="26" width="35" height="34" rx="2" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="570" y="48" text-anchor="middle" font-weight="600">10</text><text x="587.5" y="18" text-anchor="middle" class="tm">165</text><text x="570" y="98" text-anchor="middle">Serialize</text><rect x="587.5" y="26" width="122.5" height="34" rx="2" class="fg" stroke="currentColor" stroke-opacity=".4"/><text x="648.75" y="48" text-anchor="middle" font-weight="600">35</text><text x="710" y="18" text-anchor="middle" class="tm">200</text><text x="648.75" y="80" text-anchor="middle">Headroom</text></svg><figcaption>A 200 ms p99 budget (ms). Every stage gets a slice; the model gets the biggest, and headroom absorbs spikes.</figcaption></figure>
  <ul>
    <li>Budget the <strong>p99</strong> (slowest 1%), not the average. Heavy users often hit the tail.</li>
    <li>Fan-out multiplies tail risk: 50 parallel feature calls each 1% slow → ~40% of requests hit a slow one.</li>
    <li>Always define a <strong>fallback</strong> (cached list, popular items) when a stage times out.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A relay race with a fixed finish time. If one runner is slow, the others can't recover it, so each leg gets a strict slice.</p>
  </div>

  <h2 id="ss-fs"><span class="num">03</span>Feature Stores</h2>
  <figure class="viz"><svg viewBox="0 0 740 236" width="740" role="img"><defs><marker id="ss-m3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="190" y="4" width="350" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="365" y="22" text-anchor="middle" font-weight="600">Registry: one feature definition for both paths</text><rect x="10" y="60" width="140" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="80" y="79" text-anchor="middle" font-weight="600">Warehouse</text><text x="80" y="93" text-anchor="middle" class="tm">batch tables</text><rect x="10" y="160" width="140" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="80" y="179" text-anchor="middle" font-weight="600">Event stream</text><text x="80" y="193" text-anchor="middle" class="tm">Kafka</text><rect x="190" y="110" width="140" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="260" y="129" text-anchor="middle" font-weight="600">Feature</text><text x="260" y="143" text-anchor="middle" class="tm">pipelines</text><rect x="380" y="60" width="160" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="460" y="79" text-anchor="middle" font-weight="600">Offline store</text><text x="460" y="93" text-anchor="middle" class="tm">full history</text><rect x="380" y="160" width="160" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="460" y="179" text-anchor="middle" font-weight="600">Online store</text><text x="460" y="193" text-anchor="middle" class="tm">latest values</text><rect x="585" y="60" width="145" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="657.5" y="79" text-anchor="middle" font-weight="600">Training sets</text><text x="657.5" y="93" text-anchor="middle" class="tm">point-in-time</text><rect x="585" y="160" width="145" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="657.5" y="179" text-anchor="middle" font-weight="600">Online serving</text><text x="657.5" y="193" text-anchor="middle" class="tm">&lt;10 ms lookup</text><line x1="152" y1="82" x2="188" y2="124" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m3)"/><line x1="152" y1="182" x2="188" y2="142" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m3)"/><line x1="332" y1="124" x2="378" y2="86" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m3)"/><line x1="332" y1="142" x2="378" y2="178" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m3)"/><line x1="460" y1="106" x2="460" y2="157" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#ss-m3)"/><text x="468" y="136" text-anchor="start" class="tm">materialize</text><line x1="542" y1="82" x2="582" y2="82" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m3)"/><line x1="542" y1="182" x2="582" y2="182" stroke="currentColor" stroke-width="1.4" marker-end="url(#ss-m3)"/></svg><figcaption>Same definitions feed a history store (for training) and a fast latest-value store (for serving).</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p>A feature store is one place to define, compute, store and serve features, so training and serving read the same values.</p>
  </div>
  <div class="cards">
    <div><b>Offline store</b><p>Every historical value with timestamps. Big and slow.</p><small>Parquet, BigQuery, Snowflake</small></div>
    <div><b>Online store</b><p>Latest value per entity. Small and fast.</p><small>Redis, DynamoDB, Bigtable</small></div>
    <div><b>Registry</b><p>Feature definitions, owners, versions.</p><small>Reuse across teams</small></div>
    <div><b>Materialization</b><p>Job that copies fresh values offline → online.</p><small>Batch or streaming</small></div>
  </div>
  <table class="tbl">
    <tr><th></th><th>Feast</th><th>Tecton</th></tr>
    <tr><td>Type</td><td>Open source library</td><td>Managed platform (acquired by Databricks, 2025)</td></tr>
    <tr><td>Transforms</td><td>Mostly you compute features elsewhere; Feast stores and serves</td><td>Defines and runs batch + streaming transforms</td></tr>
    <tr><td>Fits</td><td>Small team, own infra</td><td>Many real-time features, less ops work</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A feature store is not required for every design. For one batch model it is overhead. Bring it up when many models share features or real-time features are needed.</p>
  </div>

  <h2 id="ss-pit"><span class="num">04</span>Point-in-Time &amp; Skew</h2>
  <figure class="viz"><svg viewBox="0 0 660 150" width="660" role="img"><defs><marker id="ss-m4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><path d="M40,80 H630" stroke="currentColor" fill="none" stroke-width="1.4" marker-end="url(#ss-m4)"/><text x="80" y="98" text-anchor="middle" class="tm">Feb 25</text><text x="230" y="98" text-anchor="middle" class="tm">Mar 01</text><text x="350" y="98" text-anchor="middle" class="tm">Mar 05</text><text x="500" y="98" text-anchor="middle" class="tm">Mar 10</text><text x="560" y="98" text-anchor="middle" class="tm">Mar 12</text><path d="M500,30 V88" class="sr" fill="none" stroke-width="1.4" stroke-dasharray="5 4"/><text x="500" y="24" text-anchor="middle" class="tr" font-weight="600">label time: churned=1</text><circle cx="80" cy="80" r="7" class="fs" stroke="currentColor"/><text x="80" y="64" text-anchor="middle" font-weight="600">orders_30d=4</text><circle cx="350" cy="80" r="7" class="fg" stroke="currentColor"/><text x="350" y="64" text-anchor="middle" font-weight="600">orders_30d=2</text><circle cx="560" cy="80" r="7" class="fr" stroke="currentColor"/><text x="560" y="64" text-anchor="middle" font-weight="600">orders_30d=0</text><text x="350" y="122" text-anchor="middle" class="tg">use: last value at or before label</text><text x="540" y="140" text-anchor="middle" class="tr">leak: computed after label</text></svg><figcaption>Point-in-time join: for each label, take the feature value as it was then, never a later one.</figcaption></figure>
  <p>Joining labels to the <em>latest</em> feature value leaks the future. The model looks great offline and fails live.</p>
  <div class="fx" data-lang="py">import pandas as pd
# Label events: did the user churn after this timestamp?
labels = pd.DataFrame({
    "user": ["u1", "u1", "u2"],
    "ts":   pd.to_datetime(["2024-03-01", "2024-03-10", "2024-03-05"]),
    "churned": [0, 1, 0]})
# Feature values as they were computed over time
feats = pd.DataFrame({
    "user": ["u1", "u1", "u1", "u2"],
    "ts":   pd.to_datetime(["2024-02-25", "2024-03-05", "2024-03-12", "2024-03-06"]),
    "orders_30d": [4, 2, 0, 7]})

# WRONG: join on latest feature value -&gt; leaks the future
latest = feats.sort_values("ts").groupby("user").tail(1)[["user", "orders_30d"]]
print(labels.merge(latest, on="user"))

# RIGHT: point-in-time join -&gt; last value at or before each label ts
pit = pd.merge_asof(labels.sort_values("ts"), feats.sort_values("ts"),
                    on="ts", by="user", direction="backward")
print(pit)</div>
  <div class="fx" data-lang="text">  user         ts  churned  orders_30d
0   u1 2024-03-01        0           0
1   u1 2024-03-10        1           0
2   u2 2024-03-05        0           7
  user         ts  churned  orders_30d
0   u1 2024-03-01        0         4.0
1   u2 2024-03-05        0         NaN
2   u1 2024-03-10        1         2.0</div>
  <p>The naive join gave u1 <code>orders_30d=0</code> on both rows, a value computed after both labels. The as-of join uses 4 and 2; u2 gets NaN because no value existed yet.</p>
  <h3>Training-serving skew</h3>
  <table class="tbl">
    <tr><th>Cause</th><th>Example</th><th>Fix</th></tr>
    <tr><td>Two code paths</td><td>SQL in training, Java at serving, round differently</td><td>One definition, shared library or feature store</td></tr>
    <tr><td>Freshness gap</td><td>Trained on end-of-day values, served 6-hour-old ones</td><td>Log served features and train on those</td></tr>
    <tr><td>Leakage</td><td>Feature uses data after the label time</td><td>Point-in-time joins</td></tr>
    <tr><td>Missing values</td><td>Online store miss returns 0, training had NaN</td><td>Same default in both; monitor null rates</td></tr>
  </table>
  <div class="callout intu"><span class="label">Gold standard</span>
    <p>"Log and wait": log the exact features used at prediction time, join labels later. Training data then matches serving by construction.</p>
  </div>

  <h2 id="ss-cache"><span class="num">05</span>Precompute &amp; Cache</h2>
  <table class="tbl">
    <tr><th>What</th><th>Where</th><th>Refresh</th></tr>
    <tr><td>Item embeddings + ANN index</td><td>In-memory index on retrieval servers</td><td>Daily / hourly rebuild</td></tr>
    <tr><td>User embeddings, aggregates</td><td>Online store</td><td>Batch daily, stream for counters</td></tr>
    <tr><td>Full predictions (e.g. "similar items")</td><td>Key-value store</td><td>Daily</td></tr>
    <tr><td>Response for identical requests</td><td>Cache with TTL (time to live)</td><td>Minutes</td></tr>
  </table>

  <h2 id="ss-patterns"><span class="num">06</span>Serving Patterns</h2>
  <div class="cards">
    <div><b>Embedded</b><p>Model loaded inside the app process.</p><small>Lowest latency; redeploy app to update model</small></div>
    <div><b>Model server</b><p>Separate service behind an API (REST/gRPC).</p><small>Triton, TorchServe, TF Serving, KServe, BentoML</small></div>
    <div><b>Sidecar</b><p>Model container next to the app in the same pod, via localhost.</p><small>Independent deploys, no network hop</small></div>
    <div><b>Batch job</b><p>Spark / Ray scores a table on a schedule.</p><small>Writes to a key-value store</small></div>
  </div>
  <table class="tbl">
    <tr><th></th><th>Embedded</th><th>Model server</th><th>Sidecar</th></tr>
    <tr><td>Latency</td><td>Best</td><td>+1–5 ms network</td><td>Near embedded</td></tr>
    <tr><td>Independent scaling</td><td>No</td><td>Yes (GPU pool)</td><td>No (scales with app)</td></tr>
    <tr><td>Language lock-in</td><td>Yes</td><td>No</td><td>No</td></tr>
    <tr><td>Use when</td><td>Tiny model, mobile/edge</td><td>Big models, many callers</td><td>Per-service model, tight latency</td></tr>
  </table>

  <h2 id="ss-scale"><span class="num">07</span>Scaling Inference</h2>
  <div class="flow"><span>Requests</span><span>Queue (wait ≤ 5 ms)</span><span>Batch of 32</span><span>One GPU call</span><span>Split responses</span></div>
  <table class="tbl">
    <tr><th>Lever</th><th>Gain</th><th>Cost</th></tr>
    <tr><td><strong>Dynamic batching</strong></td><td>GPU throughput up many times</td><td>Adds a few ms of queueing</td></tr>
    <tr><td><strong>GPU vs CPU</strong></td><td>Large DNNs, embeddings</td><td>Expensive; GBMs usually fine on CPU</td></tr>
    <tr><td><strong>Quantization / distillation</strong></td><td>Smaller, faster model</td><td>Small accuracy loss; re-validate</td></tr>
    <tr><td><strong>Horizontal autoscaling</strong></td><td>Follow traffic (scale on QPS, GPU use, queue depth)</td><td>Cold start of new pods; keep warm minimum</td></tr>
    <tr><td><strong>Cascades</strong></td><td>Cheap model first, heavy model only on hard cases</td><td>Two models to maintain</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Autoscaling on CPU for a GPU service. Scale on request queue length or latency; CPU may stay low while the GPU is saturated.</p>
  </div>

  <h2 id="ss-twostage"><span class="num">08</span>Retrieval → Ranking</h2>
  <figure class="viz"><svg viewBox="0 0 680 200" width="680" role="img"><defs><marker id="ss-m5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="20" y="8" width="360" height="36" rx="4" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="200" y="31" text-anchor="middle" font-weight="600">10M items</text><text x="410" y="24" text-anchor="start" font-weight="600">Corpus</text><text x="410" y="39" text-anchor="start" class="tm">everything you could show</text><rect x="65" y="55" width="270" height="36" rx="4" class="fb" stroke="currentColor" stroke-opacity=".4"/><text x="200" y="78" text-anchor="middle" font-weight="600">~1,000</text><text x="410" y="71" text-anchor="start" font-weight="600">Retrieval</text><text x="410" y="86" text-anchor="start" class="tm">ANN / rules, cheap, ~10 ms</text><rect x="110" y="102" width="180" height="36" rx="4" class="fv" stroke="currentColor" stroke-opacity=".4"/><text x="200" y="125" text-anchor="middle" font-weight="600">~100</text><text x="410" y="118" text-anchor="start" font-weight="600">Ranking</text><text x="410" y="133" text-anchor="start" class="tm">heavy model, rich features</text><rect x="150" y="149" width="100" height="36" rx="4" class="fg" stroke="currentColor" stroke-opacity=".4"/><text x="200" y="172" text-anchor="middle" font-weight="600">20 shown</text><text x="410" y="165" text-anchor="start" font-weight="600">Re-rank</text><text x="410" y="180" text-anchor="start" class="tm">diversity, business rules</text></svg><figcaption>Each stage shrinks the set so the next, more expensive model can afford to look closely.</figcaption></figure>
  <table class="tbl">
    <tr><th>Stage</th><th>Optimise for</th><th>Typical model</th></tr>
    <tr><td>Retrieval</td><td>Recall: don't miss good items</td><td>Two-tower embeddings + ANN, co-visitation, popularity</td></tr>
    <tr><td>Ranking</td><td>Precision at the top (NDCG)</td><td>GBM or deep ranker with cross features</td></tr>
    <tr><td>Re-ranking</td><td>Business goals</td><td>Rules: diversity, freshness, dedupe, ads slots</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Hiring. CV screening (fast, broad) → interviews (slow, careful) → final offer (budget, team fit). You can't interview all 10,000 applicants.</p>
  </div>

  <h2 id="ss-build"><span class="num">09</span>Hands-on: Feast</h2>
  <p>A local Feast store (file offline store, SQLite online store): one point-in-time training set, one online lookup.</p>
  <div class="fx" data-lang="py">import os, pandas as pd
from datetime import timedelta
from feast import ValueType, Entity, FeatureView, Field, FileSource, FeatureStore
from feast.types import Int64

os.makedirs("data", exist_ok=True)
# 1. Raw feature log: value of orders_30d over time
pd.DataFrame({
    "user_id": [1, 1, 1, 2],
    "orders_30d": [4, 2, 0, 7],
    "event_ts": pd.to_datetime(["2024-02-25", "2024-03-05", "2024-03-12", "2024-03-06"], utc=True),
}).to_parquet("data/user_stats.parquet")

# 2. Definitions (normally in a .py file, applied with "feast apply")
user = Entity(name="user", join_keys=["user_id"], value_type=ValueType.INT64)
stats = FeatureView(
    name="user_stats", entities=[user], ttl=timedelta(days=30),
    schema=[Field(name="orders_30d", dtype=Int64)],
    source=FileSource(path="data/user_stats.parquet", timestamp_field="event_ts"))
fs = FeatureStore(repo_path=".")
fs.apply([user, stats])

# 3. Training: point-in-time join against label timestamps
labels = pd.DataFrame({"user_id": [1, 1, 2],
    "event_timestamp": pd.to_datetime(["2024-03-01", "2024-03-10", "2024-03-05"], utc=True),
    "churned": [0, 1, 0]})
train = fs.get_historical_features(entity_df=labels, features=["user_stats:orders_30d"]).to_df()
print(train.sort_values("event_timestamp").to_string(index=False))

# 4. Serving: copy latest values to the online store, then low-latency lookup
fs.materialize(start_date=pd.Timestamp("2024-01-01", tz="UTC"),
               end_date=pd.Timestamp("2024-03-20", tz="UTC"))
print(fs.get_online_features(features=["user_stats:orders_30d"],
                             entity_rows=[{"user_id": 1}, {"user_id": 2}]).to_dict())</div>
  <div class="fx" data-lang="text"> user_id           event_timestamp  churned  orders_30d
       1 2024-03-01 00:00:00+00:00        0           4
       1 2024-03-10 00:00:00+00:00        1           2
Materializing 1 feature views from 2024-01-01 00:00:00+00:00 to 2024-03-20 00:00:00+00:00 into the sqlite online store.
user_stats:
{'user_id': [1, 2], 'orders_30d': [0, 7]}</div>
  <ul>
    <li>Training rows got 4 and 2: values as of each label time, as in the diagram.</li>
    <li>Online lookup returns the <em>latest</em> values (0 and 7) in milliseconds.</li>
    <li>User 2's training row was dropped: no feature existed before its label. Always check row counts after a join.</li>
  </ul>

  <h2 id="ss-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Your churn model scores 0.92 AUC offline but performs poorly live. What do you check first?</summary><div class="qa-body">Leakage via non-point-in-time joins (features computed after the label), then training-serving skew: compare the distribution of logged online features against training features for the same users.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why have two stores instead of one?</summary><div class="qa-body">Training needs every historical value to rebuild the past (large, scan-friendly, columnar). Serving needs one latest value per key in ~1 ms (small, key-value, in memory). No single store is good and cheap at both.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Daily "recommended for you" email to 20M users. Batch or real-time?</summary><div class="qa-body">Batch. The send happens once a day, there is no request context, and scoring everyone in a Spark/Ray job is cheaper than standing up a low-latency service.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is dynamic batching and its trade-off?</summary><div class="qa-body">The server holds requests for a few ms and runs them as one batch on the GPU. Throughput rises a lot; each request pays a small queueing delay. Tune max batch size and max wait against the latency budget.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why not run the ranking model on all 10M items?</summary><div class="qa-body">At 17k QPS that is ~10<sup>11</sup> scores per second. Retrieval cuts it to ~1,000 candidates with a cheap model and ANN search, so the expensive ranker only scores what might matter.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Embedded model vs model server: which for a 500 MB deep ranker used by three services?</summary><div class="qa-body">Model server. It scales on its own GPU pool, is updated once for all callers, and doesn't bloat three apps. Embedded suits small models in a single service or on device.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A request fans out to 20 feature lookups, each with p99 = 10 ms. What's the request p99?</summary><div class="qa-body">Higher than 10 ms: the request waits for the slowest. P(all 20 under their p99) = 0.99<sup>20</sup> ≈ 0.82, so ~18% of requests see at least one slow call. Batch lookups, use hedged requests or timeouts with defaults.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you make a "number of transactions in the last 10 minutes" feature?</summary><div class="qa-body">A streaming job (Flink, Spark Structured Streaming) maintains windowed counts per card and writes them to the online store. Log the served value, so training uses the same numbers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When does the ranker time out, what do you return?</summary><div class="qa-body">A precomputed fallback: the cached previous feed, retrieval order, or popular items in the user's region. Log the fallback rate as a monitored metric.</div></details>
</main>`
});
