// notes/systemdesign/sd_cases.js — Case Studies
Object.assign(TOPIC_CONTENT, {
  "sd_cases": `<main>
  <h1>Case Studies</h1>
  <p class="lead">Four classic ML design prompts, each walked through the framework from <em>How to Approach ML System Design</em>: requirements, metrics, data, model, architecture, serving, monitoring, trade-offs. Learn the shape; adapt the details to the prompt.</p>

  <h2 id="sc-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">ML Design Case Studies</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Recommendations</div>
        <ul>
          <li><b>Frame</b> — rank items by P(engage/purchase | user, item, context)</li>
          <li><b>Metrics</b> — Recall@K, NDCG offline; purchases/user online; diversity guardrail</li>
          <li><b>Arch</b> — two-tower + ANN retrieval → GBM/DNN ranker → re-rank</li>
          <li><b>Cold start</b> — content features, popularity, exploration slots</li>
          <li>⚠ <b>Trap</b> — feedback loop: only shown items get labels → explore</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Demand forecasting</div>
        <ul>
          <li><b>Frame</b> — units per SKU × store × day, horizon 1–28 days, quantiles</li>
          <li><b>Metrics</b> — WAPE, bias, pinball loss; online: stock-outs, waste</li>
          <li><b>Model</b> — one global LightGBM on lags + calendar + promos; baseline seasonal naive</li>
          <li><b>Batch</b> — nightly job writes forecasts table; no request latency</li>
          <li>⚠ <b>Trap</b> — sales ≠ demand when out of stock (censored); backtest with rolling origin</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Fraud detection</div>
        <ul>
          <li><b>Frame</b> — P(fraud | txn) → approve / review / block, &lt;100 ms</li>
          <li><b>Metrics</b> — PR-AUC, recall at fixed FPR, $ loss saved; guardrail: false declines</li>
          <li><b>Features</b> — velocity counts (stream), device, merchant, graph links</li>
          <li><b>Arch</b> — rules + GBM in payment path; Flink → online store</li>
          <li>⚠ <b>Trap</b> — labels 30–90 days late, blocked txns unlabelled, adversaries adapt</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Ad click prediction</div>
        <ul>
          <li><b>Frame</b> — pCTR per (user, ad, context); auction ranks bid × pCTR</li>
          <li><b>Metrics</b> — log loss, calibration, AUC; online: revenue, CTR, advertiser ROI</li>
          <li><b>Model</b> — LR with hashed crosses → DCN / DeepFM; frequent refresh</li>
          <li><b>Why calibration</b> — pCTR is a price input; 10% over-prediction = overcharging</li>
          <li>⚠ <b>Trap</b> — negative downsampling shifts probabilities: recalibrate</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Common follow-ups</div>
        <ul>
          <li><b>Scale ×10</b> — shard, cache, cheaper retrieval, distillation</li>
          <li><b>Cold start</b> — content features, priors, exploration</li>
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
      <div class="rm-item rm-done" data-target="sc-how"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">How to Use These</span><span class="rm-sub">Same eight-step shape</span></div></div>
      <div class="rm-item rm-done" data-target="sc-rec"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">E-commerce Recommendations</span><span class="rm-sub">Retrieval + ranking</span></div></div>
      <div class="rm-item rm-done" data-target="sc-fc"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Demand Forecasting</span><span class="rm-sub">Batch, quantiles, backtests</span></div></div>
      <div class="rm-item rm-done" data-target="sc-fraud"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Real-Time Fraud</span><span class="rm-sub">50 ms, late labels, adversaries</span></div></div>
      <div class="rm-item rm-done" data-target="sc-ads"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Ad Click Prediction</span><span class="rm-sub">Calibration is money</span></div></div>
      <div class="rm-item rm-done" data-target="sc-compare"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Side by Side</span><span class="rm-sub">What changes per problem</span></div></div>
      <div class="rm-item rm-done" data-target="sc-qa"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Follow-up Questions</span><span class="rm-sub">What interviewers ask next</span></div></div>
    </div>
  </div>

  <h2 id="sc-how"><span class="num">01</span>How to Use These</h2>
  <div class="flow"><span>Requirements</span><span>Metrics</span><span>Data &amp; features</span><span>Model</span><span>Architecture</span><span>Serving</span><span>Monitoring</span><span>Trade-offs</span></div>
  <p>Each case fills the same eight boxes. In an interview, say the box name before filling it.</p>

  <h2 id="sc-rec"><span class="num">02</span>E-commerce Recommendations</h2>
  <p><em>"Design the 'Recommended for you' feed for a store with 50M DAU and 10M products."</em></p>
  <table class="tbl">
    <tr><th>Step</th><th>Decision</th></tr>
    <tr><td>Requirements</td><td>Home feed, personalised, p99 &lt; 150 ms, ~17k peak QPS, new items daily</td></tr>
    <tr><td>Metrics</td><td>Offline: Recall@200 (retrieval), NDCG@20 (ranking). Online: purchases &amp; GMV per user. Guardrails: latency, diversity, returns</td></tr>
    <tr><td>Labels</td><td>Implicit: click &lt; add-to-cart &lt; purchase (weighted). Negatives: shown-not-clicked</td></tr>
    <tr><td>Features</td><td>User (history embedding, category affinity), item (price, ratings, age), context (time, device), cross (user×category CTR)</td></tr>
    <tr><td>Model</td><td>Baseline: popular-in-category. Retrieval: two-tower. Ranker: GBM → multi-task DNN (click + purchase)</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 740 196" width="740" role="img"><defs><marker id="sc-m1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><text x="10" y="14" text-anchor="start" class="tb" font-weight="600">Offline (daily)</text><rect x="10" y="22" width="160" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="90" y="41" text-anchor="middle" font-weight="600">ANN index</text><text x="90" y="55" text-anchor="middle" class="tm">FAISS / ScaNN</text><rect x="196" y="22" width="160" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="276" y="48" text-anchor="middle" font-weight="600">Item embeddings</text><rect x="382" y="22" width="160" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="462" y="41" text-anchor="middle" font-weight="600">Train two-tower</text><text x="462" y="55" text-anchor="middle" class="tm">+ ranker</text><rect x="568" y="22" width="160" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="648" y="48" text-anchor="middle" font-weight="600">Interaction logs</text><line x1="566" y1="44" x2="545" y2="44" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m1)"/><line x1="380" y1="44" x2="359" y2="44" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m1)"/><line x1="194" y1="44" x2="173" y2="44" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m1)"/><text x="10" y="188" text-anchor="start" class="tb" font-weight="600">Online (per request, &lt;150 ms)</text><rect x="10" y="126" width="128" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="74" y="145" text-anchor="middle" font-weight="600">Request</text><text x="74" y="159" text-anchor="middle" class="tm">user_id</text><rect x="158" y="126" width="128" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="222" y="145" text-anchor="middle" font-weight="600">Candidates</text><text x="222" y="159" text-anchor="middle" class="tm">ANN + popular</text><rect x="306" y="126" width="128" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="370" y="145" text-anchor="middle" font-weight="600">Ranker</text><text x="370" y="159" text-anchor="middle" class="tm">GBM / DNN</text><rect x="454" y="126" width="128" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="518" y="145" text-anchor="middle" font-weight="600">Re-rank</text><text x="518" y="159" text-anchor="middle" class="tm">diversity</text><rect x="602" y="126" width="128" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="666" y="152" text-anchor="middle" font-weight="600">Feed</text><line x1="140" y1="148" x2="155" y2="148" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m1)"/><line x1="288" y1="148" x2="303" y2="148" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m1)"/><line x1="436" y1="148" x2="451" y2="148" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m1)"/><line x1="584" y1="148" x2="599" y2="148" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m1)"/><line x1="90" y1="68" x2="222" y2="123" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#sc-m1)"/><line x1="462" y1="68" x2="370" y2="123" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#sc-m1)"/><line x1="666" y1="124" x2="648" y2="69" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#sc-m1)"/></svg><figcaption>Dashed arrows cross the offline/online line: index and model ship down, logged impressions flow back up.</figcaption></figure>
  <table class="tbl">
    <tr><th>Serving &amp; monitoring</th><th>Trade-offs</th></tr>
    <tr><td>Item index rebuilt daily; user embedding from online store; ranker on model servers; fallback to cached feed. Monitor: CTR by slice, catalogue coverage, embedding drift, latency.</td><td>Click vs purchase objective (clickbait risk); freshness vs cost of rebuilding index; exploration (short-term loss) vs feedback loop; GBM simplicity vs DNN multi-task gains.</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Random negatives only. The ranker then never learns from "shown but ignored" items, which are the hard, informative negatives.</p>
  </div>

  <h2 id="sc-fc"><span class="num">03</span>Demand Forecasting</h2>
  <p><em>"Forecast daily demand for 50k SKUs across 2,000 stores to drive replenishment."</em></p>
  <table class="tbl">
    <tr><th>Step</th><th>Decision</th></tr>
    <tr><td>Requirements</td><td>100M series (SKU × store), daily by 5 am, horizon 1–14 days, quantiles for safety stock</td></tr>
    <tr><td>Metrics</td><td>Offline: WAPE, bias, pinball loss on P90. Online: stock-out rate, waste, inventory cost</td></tr>
    <tr><td>Data</td><td>Sales, stock levels, price, promos, holidays, weather, store attributes</td></tr>
    <tr><td>Features</td><td>Lags (7, 14, 28 days), rolling means, day-of-week, promo flags, price change, item/store embeddings</td></tr>
    <tr><td>Model</td><td>Baseline: seasonal naive (same day last week). Main: one global LightGBM with quantile objective. Sparse items: hierarchical / category-level forecasts</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 740 196" width="740" role="img"><defs><marker id="sc-m2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="10" y="14" width="160" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="90" y="40" text-anchor="middle" font-weight="600">Sales history</text><rect x="10" y="74" width="160" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="90" y="93" text-anchor="middle" font-weight="600">Promos, price,</text><text x="90" y="107" text-anchor="middle" class="tm">calendar, weather</text><rect x="205" y="44" width="160" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="285" y="63" text-anchor="middle" font-weight="600">Features</text><text x="285" y="77" text-anchor="middle" class="tm">lags, rolling</text><rect x="400" y="44" width="150" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="475" y="63" text-anchor="middle" font-weight="600">Global GBM</text><text x="475" y="77" text-anchor="middle" class="tm">all SKU x store</text><rect x="585" y="44" width="145" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="657.5" y="63" text-anchor="middle" font-weight="600">Forecasts</text><text x="657.5" y="77" text-anchor="middle" class="tm">P10 / P50 / P90</text><rect x="585" y="140" width="145" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="657.5" y="159" text-anchor="middle" font-weight="600">Replenishment</text><text x="657.5" y="173" text-anchor="middle" class="tm">orders</text><rect x="400" y="140" width="150" height="44" rx="6" class="fr" stroke="currentColor" stroke-opacity=".55"/><text x="475" y="159" text-anchor="middle" font-weight="600">Backtest vs actual</text><text x="475" y="173" text-anchor="middle" class="tm">WAPE, bias</text><line x1="172" y1="36" x2="203" y2="60" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m2)"/><line x1="172" y1="96" x2="203" y2="74" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m2)"/><line x1="367" y1="66" x2="397" y2="66" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m2)"/><line x1="552" y1="66" x2="582" y2="66" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m2)"/><line x1="657.5" y1="90" x2="657.5" y2="137" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m2)"/><line x1="583" y1="162" x2="553" y2="162" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m2)"/><line x1="475" y1="138" x2="475" y2="91" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#sc-m2)"/><text x="482" y="118" text-anchor="start" class="tm">weekly retrain</text></svg><figcaption>A batch system: no online latency, but quantiles and backtests matter more than a single accuracy number.</figcaption></figure>
  <table class="tbl">
    <tr><th>Serving &amp; monitoring</th><th>Trade-offs</th></tr>
    <tr><td>Nightly Spark/Ray batch writes a forecasts table; replenishment reads it. Monitor WAPE by category as actuals arrive, bias drift, missing-input checks before the run.</td><td>Global model (shares patterns, one pipeline) vs per-series (fits quirks, 100M models); point vs quantile forecasts; retrain cadence vs holiday shocks.</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Training on raw sales. A stocked-out day shows 0 sales, not 0 demand. Mask or impute those days, or the model learns to under-forecast.</p>
  </div>

  <h2 id="sc-fraud"><span class="num">04</span>Real-Time Fraud</h2>
  <p><em>"Score card transactions for fraud at 5k TPS before authorisation."</em></p>
  <table class="tbl">
    <tr><th>Step</th><th>Decision</th></tr>
    <tr><td>Requirements</td><td>Decision in &lt;100 ms p99 (model ~20 ms), 5k TPS avg, fraud rate ~0.1%, must explain declines</td></tr>
    <tr><td>Metrics</td><td>Offline: PR-AUC, recall at 0.1% FPR, $-weighted recall. Online: fraud loss, false decline rate, review queue size</td></tr>
    <tr><td>Labels</td><td>Chargebacks (30–90 days), analyst verdicts, confirmed customer reports</td></tr>
    <tr><td>Features</td><td>Velocity (txns per card in 10 min / 1 h), amount vs user's usual, new device / IP / country, merchant risk, graph (shared cards/devices)</td></tr>
    <tr><td>Model</td><td>Baseline: rules. Main: GBM (fast, tabular, SHAP for reasons). Thresholds per segment for approve / review / block</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 740 196" width="740" role="img"><defs><marker id="sc-m3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="10" y="14" width="160" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="90" y="40" text-anchor="middle" font-weight="600">Card txn</text><rect x="196" y="14" width="160" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="276" y="33" text-anchor="middle" font-weight="600">Rules</text><text x="276" y="47" text-anchor="middle" class="tm">blocklists, limits</text><rect x="382" y="14" width="160" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="462" y="33" text-anchor="middle" font-weight="600">GBM score</text><text x="462" y="47" text-anchor="middle" class="tm">txn + velocity</text><rect x="568" y="14" width="160" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="648" y="33" text-anchor="middle" font-weight="600">Decision</text><text x="648" y="47" text-anchor="middle" class="tm">approve/review/block</text><line x1="172" y1="36" x2="193" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><line x1="358" y1="36" x2="379" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><line x1="544" y1="36" x2="565" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><rect x="10" y="140" width="160" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="90" y="166" text-anchor="middle" font-weight="600">Event stream</text><rect x="196" y="140" width="160" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="276" y="159" text-anchor="middle" font-weight="600">Stream job</text><text x="276" y="173" text-anchor="middle" class="tm">velocity feats</text><rect x="382" y="140" width="160" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="462" y="159" text-anchor="middle" font-weight="600">Online store</text><text x="462" y="173" text-anchor="middle" class="tm">Redis</text><rect x="568" y="140" width="160" height="44" rx="6" class="fr" stroke="currentColor" stroke-opacity=".55"/><text x="648" y="159" text-anchor="middle" font-weight="600">Analysts +</text><text x="648" y="173" text-anchor="middle" class="tm">chargebacks</text><line x1="172" y1="162" x2="193" y2="162" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><line x1="358" y1="162" x2="379" y2="162" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><line x1="90" y1="60" x2="90" y2="137" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><line x1="462" y1="138" x2="462" y2="61" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><line x1="648" y1="60" x2="648" y2="137" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m3)"/><text x="640" y="104" text-anchor="end" class="tm">labels → retrain</text></svg><figcaption>Score inside the payment path (~50 ms). Velocity features come from a stream job, labels from analysts weeks later.</figcaption></figure>
  <table class="tbl">
    <tr><th>Serving &amp; monitoring</th><th>Trade-offs</th></tr>
    <tr><td>Embedded or sidecar GBM for latency; streaming velocity features; timeout → rules-only fallback. Monitor score PSI, decline rate, review rate daily; matured-label recall by cohort.</td><td>Recall vs customer friction; GBM explainability vs deep sequence models; rules (fast to update against new attacks) vs model (generalises); retrain often vs label maturity.</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Random train/test split. Fraud patterns move over time; split by time, and evaluate only on labels mature enough to be complete.</p>
  </div>

  <h2 id="sc-ads"><span class="num">05</span>Ad Click Prediction</h2>
  <p><em>"Predict click probability for ads in a feed to run the auction."</em> Search ranking is the same shape with a query as context and relevance labels.</p>
  <table class="tbl">
    <tr><th>Step</th><th>Decision</th></tr>
    <tr><td>Requirements</td><td>~100k ad requests/s, ~50 ms, billions of impressions/day, CTR ~1%</td></tr>
    <tr><td>Metrics</td><td>Offline: normalised log loss, calibration (predicted/observed CTR ≈ 1), AUC. Online: revenue per mille, CTR, advertiser ROI, user ad-hide rate</td></tr>
    <tr><td>Data</td><td>Impression logs joined to clicks within a window; negatives downsampled</td></tr>
    <tr><td>Features</td><td>User, ad, advertiser, placement, time; hashed high-cardinality IDs and crosses; historical CTRs</td></tr>
    <tr><td>Model</td><td>Baseline: logistic regression on hashed crosses. Main: DCN / DeepFM; online or hourly incremental training</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 740 196" width="740" role="img"><defs><marker id="sc-m4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="10" y="14" width="128" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="74" y="33" text-anchor="middle" font-weight="600">Ad request</text><text x="74" y="47" text-anchor="middle" class="tm">user, page</text><rect x="158" y="14" width="128" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="222" y="33" text-anchor="middle" font-weight="600">Candidates</text><text x="222" y="47" text-anchor="middle" class="tm">targeting</text><rect x="306" y="14" width="128" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="370" y="33" text-anchor="middle" font-weight="600">pCTR model</text><text x="370" y="47" text-anchor="middle" class="tm">calibrated</text><rect x="454" y="14" width="128" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="518" y="33" text-anchor="middle" font-weight="600">Auction</text><text x="518" y="47" text-anchor="middle" class="tm">bid x pCTR</text><rect x="602" y="14" width="128" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="666" y="40" text-anchor="middle" font-weight="600">Ad shown</text><line x1="140" y1="36" x2="155" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m4)"/><line x1="288" y1="36" x2="303" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m4)"/><line x1="436" y1="36" x2="451" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m4)"/><line x1="584" y1="36" x2="599" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m4)"/><rect x="602" y="140" width="128" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="666" y="159" text-anchor="middle" font-weight="600">Impression +</text><text x="666" y="173" text-anchor="middle" class="tm">click logs</text><rect x="454" y="140" width="128" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="518" y="159" text-anchor="middle" font-weight="600">Join clicks</text><text x="518" y="173" text-anchor="middle" class="tm">to impressions</text><rect x="306" y="140" width="128" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="370" y="159" text-anchor="middle" font-weight="600">Train</text><text x="370" y="173" text-anchor="middle" class="tm">hourly refresh</text><line x1="666" y1="60" x2="666" y2="137" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m4)"/><line x1="600" y1="162" x2="585" y2="162" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m4)"/><line x1="452" y1="162" x2="437" y2="162" stroke="currentColor" stroke-width="1.4" marker-end="url(#sc-m4)"/><line x1="370" y1="138" x2="370" y2="61" stroke="currentColor" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#sc-m4)"/></svg><figcaption>The model's probability is used as a price input, so calibration matters as much as ranking quality.</figcaption></figure>
  <table class="tbl">
    <tr><th>Serving &amp; monitoring</th><th>Trade-offs</th></tr>
    <tr><td>Model servers with batching; feature cache; frequent model refresh. Monitor calibration per slice hourly, log loss on fresh data, revenue, spend pacing.</td><td>Freshness (online learning) vs stability; downsampling (cheaper) vs calibration; deep model gains vs latency; short-term revenue vs user experience (ad load).</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Keeping 10% of negatives inflates predicted CTR about 10×. Correct with <code>p = q / (q + (1 − q) / w)</code>, where q is the model output and w the negative sampling rate (0.1).</p>
  </div>

  <h2 id="sc-compare"><span class="num">06</span>Side by Side</h2>
  <table class="tbl">
    <tr><th></th><th>Recs</th><th>Forecasting</th><th>Fraud</th><th>Ads</th></tr>
    <tr><td>Serving</td><td>Online, hybrid</td><td>Batch</td><td>Online, in payment path</td><td>Online, very high QPS</td></tr>
    <tr><td>Label delay</td><td>Minutes–days</td><td>1 day</td><td>30–90 days</td><td>Minutes</td></tr>
    <tr><td>Key metric trait</td><td>Ranking quality</td><td>Scale-free error, bias</td><td>Precision at low FPR</td><td>Calibration</td></tr>
    <tr><td>Biggest risk</td><td>Feedback loop</td><td>Censored demand</td><td>Adversarial drift</td><td>Miscalibration = mispricing</td></tr>
    <tr><td>Baseline</td><td>Popularity</td><td>Seasonal naive</td><td>Rules</td><td>Logistic regression</td></tr>
  </table>

  <h2 id="sc-qa"><span class="num">07</span>Follow-up Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Recs: how do you handle a brand-new product?</summary><div class="qa-body">Item tower from content (title, image, category embeddings) so it gets an embedding without interactions; reserve exploration slots; boost with a decaying freshness prior; monitor new-item exposure share.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Recs: traffic grows 10×. What breaks first and what do you change?</summary><div class="qa-body">Ranker compute. Cut candidates (1,000 → 300), distil or quantise the ranker, cache per-user results for a few minutes, add dynamic batching on GPUs, and shard the ANN index.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Forecasting: why one global model instead of one per SKU?</summary><div class="qa-body">Most series are short and sparse. A global model shares patterns (promo effect, seasonality) across items, handles new SKUs via features, and is one pipeline to monitor instead of millions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Forecasting: why quantiles, not just the mean?</summary><div class="qa-body">Replenishment decides safety stock from uncertainty. The cost of a stock-out differs from the cost of waste, so you order at a chosen quantile (e.g. P90 for high-margin items).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Fraud: how do you get labels for transactions you blocked?</summary><div class="qa-body">You mostly don't. Let a tiny random sample of borderline txns through (with loss limits) or send them to analyst review; reweight by inverse propensity in training. Otherwise the model stops learning about what it blocks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Fraud: fraudsters adapt within days. How does the system keep up?</summary><div class="qa-body">Rules for instant response, frequent retraining on recent matured labels plus analyst labels, anomaly scores for unseen patterns, graph features that are hard to fake, and drift monitors on score and decline rates.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Ads: why log loss and calibration rather than AUC alone?</summary><div class="qa-body">The auction multiplies pCTR by bid, so absolute probability sets price and ranking across advertisers. AUC only checks ordering; a model can have great AUC and be 30% over-confident.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Ads: a click can happen minutes after the impression. How do you build training data?</summary><div class="qa-body">Join clicks to impressions in a streaming job with a wait window (e.g. 15–30 min). Late clicks become false negatives; handle by a longer window, delayed-feedback correction, or later re-labelling.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Search ranking: what differs from feed recommendations?</summary><div class="qa-body">The query is the main context, so retrieval uses lexical (BM25) plus semantic embeddings; labels include human relevance ratings; position bias in clicks needs correction; and freshness/latency targets are tighter.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>For any case: how do you roll out the new model?</summary><div class="qa-body">Offline gate vs champion → shadow for latency and output checks → 1–5% canary with guardrails → A/B for 1–2 weeks on the primary metric → ramp, with config-flag rollback ready.</div></details>
</main>`
});
