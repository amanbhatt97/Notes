// notes/systemdesign/sd_monitoring.js — Monitoring, Drift & Retraining
Object.assign(TOPIC_CONTENT, {
  "sd_monitoring": `<main>
  <h1>Monitoring, Drift &amp; Retraining</h1>
  <p class="lead">A model is right on launch day and slowly wrong after. This note covers what to watch, how to detect drift with numbers, what to do when labels arrive late, and when to retrain. Builds on the serving note.</p>

  <h2 id="sm-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Monitoring, Drift &amp; Retraining</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What to monitor</div>
        <ul>
          <li><b>System</b> — latency, errors, QPS, fallback rate</li>
          <li><b>Data</b> — nulls, schema, ranges, feature PSI</li>
          <li><b>Model</b> — prediction distribution, delayed accuracy, calibration</li>
          <li><b>Business</b> — CTR, revenue, fraud loss</li>
          <li>⚠ ML fails silently: 200 OK with wrong answers</li>
          <li>💡 car dashboard: engine, fuel, speedometer, arrival time</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Drift types</div>
        <ul>
          <li><b>Data / covariate</b> — P(x) changes (new users, inflation)</li>
          <li><b>Concept</b> — P(y|x) changes (fraud tactics); needs labels to prove</li>
          <li><b>Prediction</b> — P(ŷ) changes; no labels needed</li>
          <li><b>Label / prior</b> — P(y) changes (holiday fraud rate)</li>
          <li>Data drift doesn't always hurt accuracy</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Detection</div>
        <ul>
          <li><b>PSI</b> — Σ (a−e)·ln(a/e), bins from training quantiles</li>
          <li><b>PSI rule</b> — &lt;0.1 ok · 0.1–0.25 watch · &gt;0.25 act</li>
          <li><b>KS</b> — max CDF gap; ⚠ p-value tiny at large n → use statistic</li>
          <li><b>KL</b> — asymmetric, ∞ on empty bins; <b>JS</b> — symmetric, 0–1</li>
          <li><b>Chi-square</b> — categorical features</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Delayed labels</div>
        <ul>
          <li><b>Fraud</b> — chargebacks 30–90 days; proxy: disputes, review rate</li>
          <li><b>Loans</b> — default months later; proxy: early missed payments</li>
          <li><b>Recs</b> — purchase later; proxy: clicks, add-to-cart</li>
          <li><b>Meanwhile</b> — drift metrics + small human-labelled samples</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Alerting</div>
        <ul>
          <li><b>Baseline</b> — training or healthy window; same weekday for seasonality</li>
          <li><b>Persistence</b> — 2–3 consecutive breaches</li>
          <li><b>Severity</b> — page outages/null spikes; ticket slow drift</li>
          <li><b>Weight</b> by feature importance</li>
          <li>⚠ 100 features × 1% FP = daily false alarm → alert fatigue</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Feedback loops</div>
        <ul>
          <li><b>Degenerate loop</b> — model outputs choose its future training data</li>
          <li><b>Recs</b> — popular gets more popular → exploration slots, bandits</li>
          <li><b>Fraud</b> — blocked txns unlabelled → random holdout, analyst review</li>
          <li><b>Fix</b> — exploration + inverse propensity weighting</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Retraining</div>
        <ul>
          <li><b>Scheduled</b> — fixed cadence; simple</li>
          <li><b>Triggered</b> — on drift / metric drop; efficient</li>
          <li><b>Continual</b> — incremental, minutes–hours (ads, news)</li>
          <li><b>Pipeline</b> — trigger → PIT data → validate → train → champion vs challenger → shadow/canary → promote</li>
          <li><b>Window</b> — sliding (adapts) vs expanding (stable)</li>
          <li>⚠ auto-retrain on buggy data bakes the bug in</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sm-what"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What to Monitor</span><span class="rm-sub">Four layers</span></div></div>
      <div class="rm-item rm-done" data-target="sm-types"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Types of Drift</span><span class="rm-sub">Data, concept, prediction</span></div></div>
      <div class="rm-item rm-done" data-target="sm-detect"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Detecting Drift</span><span class="rm-sub">PSI, KS, KL/JS in numpy</span></div></div>
      <div class="rm-item rm-done" data-target="sm-labels"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Delayed Labels</span><span class="rm-sub">Proxies until truth arrives</span></div></div>
      <div class="rm-item rm-done" data-target="sm-alert"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Alerting</span><span class="rm-sub">Thresholds without noise</span></div></div>
      <div class="rm-item rm-done" data-target="sm-loops"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Feedback Loops</span><span class="rm-sub">When the model feeds itself</span></div></div>
      <div class="rm-item rm-done" data-target="sm-retrain"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Retraining</span><span class="rm-sub">Scheduled, triggered, continual</span></div></div>
      <div class="rm-item rm-done" data-target="sm-build"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Hands-on: Drift Report</span><span class="rm-sub">PSI per feature</span></div></div>
      <div class="rm-item rm-done" data-target="sm-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="sm-what"><span class="num">01</span>What to Monitor</h2>
  <table class="tbl">
    <tr><th>Layer</th><th>Metrics</th><th>Catches</th><th>Labels needed?</th></tr>
    <tr><td><strong>System</strong></td><td>p99 latency, error rate, QPS, GPU/CPU, fallback rate</td><td>Outages, slow features</td><td>No</td></tr>
    <tr><td><strong>Data</strong></td><td>Null rate, schema, ranges, feature distributions (PSI)</td><td>Broken pipelines, drift</td><td>No</td></tr>
    <tr><td><strong>Model</strong></td><td>Prediction distribution, AUC/precision when labels land, calibration</td><td>Decay, concept drift</td><td>Partly</td></tr>
    <tr><td><strong>Business</strong></td><td>CTR, conversion, revenue, fraud losses, complaints</td><td>What actually matters</td><td>No (but slow, noisy)</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A car dashboard. Engine light (system), fuel quality (data), speedometer accuracy (model), and whether you reach the destination on time (business).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Most ML failures are silent: the service returns 200 OK with wrong predictions. System monitoring alone will never catch them.</p>
  </div>

  <h2 id="sm-types"><span class="num">02</span>Types of Drift</h2>
  <figure class="viz"><svg viewBox="0 0 762 196" width="762" role="img"><defs><marker id="sm-m1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><text x="125" y="16" text-anchor="middle" font-weight="600">Data drift: P(x) moves</text><path d="M15.0,138.9 L20.3,138.1 L25.7,136.7 L31.0,134.5 L36.3,131.2 L41.7,126.5 L47.0,120.1 L52.3,112.0 L57.7,102.3 L63.0,91.2 L68.3,79.4 L73.7,67.9 L79.0,57.8 L84.3,50.1 L89.7,45.8 L95.0,45.3 L100.3,48.7 L105.7,55.6 L111.0,65.2 L116.3,76.5 L121.7,88.3 L127.0,99.6 L132.3,109.7 L137.7,118.3 L143.0,125.0 L148.3,130.1 L153.7,133.8 L159.0,136.2 L164.3,137.8 L169.7,138.8 L175.0,139.3 L180.3,139.7 L185.7,139.8 L191.0,139.9 L196.3,140.0 L201.7,140.0 L207.0,140.0 L212.3,140.0 L217.7,140.0 L223.0,140.0" stroke="currentColor" fill="none" stroke-width="1.4"/><path d="M15.0,139.9 L20.3,139.9 L25.7,139.8 L31.0,139.6 L36.3,139.3 L41.7,138.8 L47.0,138.0 L52.3,136.9 L57.7,135.3 L63.0,133.1 L68.3,130.0 L73.7,126.1 L79.0,121.1 L84.3,115.1 L89.7,108.1 L95.0,100.4 L100.3,92.2 L105.7,84.0 L111.0,76.2 L116.3,69.5 L121.7,64.3 L127.0,61.0 L132.3,60.0 L137.7,61.3 L143.0,64.8 L148.3,70.2 L153.7,77.1 L159.0,85.0 L164.3,93.2 L169.7,101.4 L175.0,109.1 L180.3,115.9 L185.7,121.8 L191.0,126.6 L196.3,130.5 L201.7,133.4 L207.0,135.6 L212.3,137.1 L217.7,138.2 L223.0,138.9" class="st" fill="none" stroke-width="1.4"/><path d="M15,140 H230" stroke="currentColor" fill="none" stroke-width="1.4"/><text x="70" y="158" text-anchor="middle" class="tm">train</text><text x="175" y="158" text-anchor="middle" class="tb">prod</text><text x="125" y="184" text-anchor="middle" class="tm">inputs change, rule same</text><text x="375" y="16" text-anchor="middle" font-weight="600">Concept drift: P(y|x) moves</text><rect x="260" y="30" width="230" height="110" rx="2" class="fs" stroke="currentColor" stroke-opacity=".4"/><circle cx="290" cy="50" r="5" class="fg" stroke="currentColor"/><circle cx="320" cy="90" r="5" class="fg" stroke="currentColor"/><circle cx="300" cy="110" r="5" class="fg" stroke="currentColor"/><circle cx="355" cy="60" r="5" class="fr" stroke="currentColor"/><circle cx="380" cy="100" r="5" class="fr" stroke="currentColor"/><circle cx="430" cy="50" r="5" class="fr" stroke="currentColor"/><circle cx="460" cy="95" r="5" class="fr" stroke="currentColor"/><circle cx="410" cy="120" r="5" class="fr" stroke="currentColor"/><circle cx="350" cy="125" r="5" class="fg" stroke="currentColor"/><path d="M335,32 L370,138" stroke="currentColor" fill="none" stroke-width="1.4" stroke-dasharray="5 4"/><path d="M395,32 L430,138" class="sr" fill="none" stroke-width="1.4"/><text x="322" y="158" text-anchor="middle" class="tm">old boundary</text><text x="438" y="158" text-anchor="middle" class="tr">new</text><text x="375" y="184" text-anchor="middle" class="tm">same x, different right answer</text><text x="640" y="16" text-anchor="middle" font-weight="600">Prediction drift</text><rect x="550" y="132" width="16" height="8" rx="1" class="fs" stroke="currentColor" stroke-opacity=".4"/><rect x="567" y="137" width="16" height="3" rx="1" class="ft" stroke="currentColor" stroke-opacity=".4"/><rect x="588" y="110" width="16" height="30" rx="1" class="fs" stroke="currentColor" stroke-opacity=".4"/><rect x="605" y="130" width="16" height="10" rx="1" class="ft" stroke="currentColor" stroke-opacity=".4"/><rect x="626" y="80" width="16" height="60" rx="1" class="fs" stroke="currentColor" stroke-opacity=".4"/><rect x="643" y="110" width="16" height="30" rx="1" class="ft" stroke="currentColor" stroke-opacity=".4"/><rect x="664" y="110" width="16" height="30" rx="1" class="fs" stroke="currentColor" stroke-opacity=".4"/><rect x="681" y="85" width="16" height="55" rx="1" class="ft" stroke="currentColor" stroke-opacity=".4"/><rect x="702" y="130" width="16" height="10" rx="1" class="fs" stroke="currentColor" stroke-opacity=".4"/><rect x="719" y="100" width="16" height="40" rx="1" class="ft" stroke="currentColor" stroke-opacity=".4"/><path d="M540,140 H740" stroke="currentColor" fill="none" stroke-width="1.4"/><text x="640" y="158" text-anchor="middle" class="tm">score: grey train, teal prod</text><text x="640" y="184" text-anchor="middle" class="tm">outputs shift; no labels needed</text></svg><figcaption>Three different things move. Only concept drift changes the true rule, so only labels prove it.</figcaption></figure>
  <table class="tbl">
    <tr><th>Drift</th><th>What changes</th><th>Example</th><th>Detect with</th></tr>
    <tr><td><strong>Data (covariate)</strong></td><td>P(x)</td><td>New market, younger users, inflation raises prices</td><td>Feature PSI / KS</td></tr>
    <tr><td><strong>Concept</strong></td><td>P(y | x)</td><td>Fraudsters change tactics; COVID changes buying</td><td>Labelled performance</td></tr>
    <tr><td><strong>Prediction</strong></td><td>P(ŷ)</td><td>Share of "fraud" flags doubles</td><td>Output PSI, positive rate</td></tr>
    <tr><td><strong>Label (prior)</strong></td><td>P(y)</td><td>Fraud base rate rises in holidays</td><td>Label rate over time</td></tr>
  </table>
  <p>"Model drift" usually means performance decay from any of these. Data drift does not always hurt: if the model handles the new region well, accuracy holds.</p>

  <h2 id="sm-detect"><span class="num">03</span>Detecting Drift</h2>
  <table class="tbl">
    <tr><th>Method</th><th>Idea</th><th>Good for</th></tr>
    <tr><td><strong>PSI</strong></td><td>Σ (a − e) · ln(a / e) over bins</td><td>Industry standard, one number per feature</td></tr>
    <tr><td><strong>KS test</strong></td><td>Max gap between two CDFs + p-value</td><td>Continuous features</td></tr>
    <tr><td><strong>KL divergence</strong></td><td>Σ p · ln(p / q); asymmetric, infinite if q = 0</td><td>Theory; needs smoothing</td></tr>
    <tr><td><strong>JS divergence</strong></td><td>Symmetric, bounded KL vs the average</td><td>Dashboards (0 to 1)</td></tr>
    <tr><td><strong>Chi-square</strong></td><td>Observed vs expected counts</td><td>Categorical features</td></tr>
  </table>
  <div class="fx" data-lang="py">import numpy as np
from scipy import stats
from scipy.spatial.distance import jensenshannon

rng = np.random.default_rng(42)
train = rng.normal(50, 10, 10_000)          # e.g. basket value at training time
same  = rng.normal(50, 10, 10_000)          # fresh sample, no drift
small = rng.normal(52, 10, 10_000)          # mean +2
big   = rng.normal(58, 13, 10_000)          # mean +8, wider

def psi(expected, actual, bins=10):
    # bin edges from TRAINING quantiles -&gt; ~10% of train in each bin
    edges = np.quantile(expected, np.linspace(0, 1, bins + 1))
    edges[0], edges[-1] = -np.inf, np.inf
    e = np.histogram(expected, edges)[0] / len(expected)
    a = np.histogram(actual, edges)[0] / len(actual)
    e, a = np.clip(e, 1e-6, None), np.clip(a, 1e-6, None)   # avoid log(0)
    return np.sum((a - e) * np.log(a / e))

def js(expected, actual, bins=10):
    edges = np.quantile(expected, np.linspace(0, 1, bins + 1))
    edges[0], edges[-1] = -np.inf, np.inf
    e = np.histogram(expected, edges)[0] / len(expected)
    a = np.histogram(actual, edges)[0] / len(actual)
    return jensenshannon(e, a, base=2) ** 2      # divergence, in [0, 1]

print(f"{'sample':&lt;8}{'PSI':&gt;8}{'KS stat':&gt;9}{'KS p':&gt;11}{'JS':&gt;8}")
for name, x in [("same", same), ("small", small), ("big", big)]:
    ks = stats.ks_2samp(train, x)
    print(f"{name:&lt;8}{psi(train, x):&gt;8.3f}{ks.statistic:&gt;9.3f}{ks.pvalue:&gt;11.2e}{js(train, x):&gt;8.3f}")</div>
  <div class="fx" data-lang="text">sample       PSI  KS stat       KS p      JS
same       0.002    0.016   1.50e-01   0.000
small      0.048    0.098   8.96e-42   0.009
big        0.492    0.295  9.88e-324   0.085</div>
  <table class="tbl">
    <tr><th>PSI</th><th>Common reading</th></tr>
    <tr><td>&lt; 0.1</td><td>No meaningful shift</td></tr>
    <tr><td>0.1 – 0.25</td><td>Moderate: investigate</td></tr>
    <tr><td>&gt; 0.25</td><td>Major: act (check pipeline, consider retrain)</td></tr>
  </table>
  <p>Note "small" (mean +2): PSI 0.048 says ignore, but KS p ≈ 10<sup>-42</sup> screams. With big samples, KS flags tiny shifts.</p>
  <div class="fx" data-lang="py">import numpy as np
from scipy import stats
rng = np.random.default_rng(0)
# Same tiny shift (mean +0.5), different sample sizes
for n in [500, 5_000, 500_000]:
    a, b = rng.normal(50, 10, n), rng.normal(50.5, 10, n)
    print(f"n={n:&gt;7,}  KS p-value={stats.ks_2samp(a, b).pvalue:.4f}")</div>
  <div class="fx" data-lang="text">n=    500  KS p-value=0.6659
n=  5,000  KS p-value=0.0112
n=500,000  KS p-value=0.0000</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Alerting on KS p-values at production volumes. Every feature becomes "significant". Alert on effect size (PSI, KS statistic) instead.</p>
  </div>

  <h2 id="sm-labels"><span class="num">04</span>Delayed Labels</h2>
  <figure class="viz"><svg viewBox="0 0 700 112" width="700" role="img"><defs><marker id="sm-m2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><path d="M30,60 H680" stroke="currentColor" fill="none" stroke-width="1.4" marker-end="url(#sm-m2)"/><circle cx="60" cy="60" r="7" class="fb" stroke="currentColor"/><text x="60" y="42" text-anchor="middle" font-weight="600">t0: predict</text><text x="60" y="84" text-anchor="middle" class="tm">score txn</text><circle cx="220" cy="60" r="7" class="fs" stroke="currentColor"/><text x="220" y="42" text-anchor="middle" font-weight="600">+1 s</text><text x="220" y="84" text-anchor="middle" class="tm">decline / approve</text><circle cx="400" cy="60" r="7" class="ft" stroke="currentColor"/><text x="400" y="42" text-anchor="middle" font-weight="600">+1 day</text><text x="400" y="84" text-anchor="middle" class="tm">proxy: disputes opened</text><circle cx="600" cy="60" r="7" class="fr" stroke="currentColor"/><text x="600" y="42" text-anchor="middle" font-weight="600">+30–90 days</text><text x="600" y="84" text-anchor="middle" class="tm">label: chargeback</text></svg><figcaption>Fraud labels arrive months late. Proxies and drift metrics are your early warning in between.</figcaption></figure>
  <table class="tbl">
    <tr><th>Product</th><th>True label</th><th>Delay</th><th>Proxy to watch meanwhile</th></tr>
    <tr><td>Fraud</td><td>Chargeback</td><td>30–90 days</td><td>Disputes, analyst review rate, decline rate</td></tr>
    <tr><td>Loans</td><td>Default</td><td>Months–years</td><td>Early missed payments</td></tr>
    <tr><td>Recommendations</td><td>Purchase / retention</td><td>Hours–weeks</td><td>Clicks, add-to-cart, dwell time</td></tr>
    <tr><td>Ads</td><td>Click</td><td>Seconds–minutes</td><td>(Labels are fast: use them)</td></tr>
  </table>
  <div class="callout intu"><span class="label">Fill the gap</span>
    <p>Use input and prediction drift as early warnings, proxies for direction, and a small human-labelled sample for ground truth now.</p>
  </div>

  <h2 id="sm-alert"><span class="num">05</span>Alerting</h2>
  <div class="flow"><span>Metric</span><span>Window (1 h / 1 day)</span><span>Compare to baseline</span><span>Persists N windows?</span><span>Page or ticket</span></div>
  <ul>
    <li><strong>Baseline</strong>: training data or a recent healthy window. Seasonality: compare to the same weekday.</li>
    <li><strong>Severity</strong>: page for system outages and null-rate spikes; ticket for slow drift.</li>
    <li><strong>Persistence</strong>: require 2–3 consecutive breaches to cut noise.</li>
    <li><strong>Prioritise</strong>: weight drift by feature importance; a drift in a top feature matters more.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>100 features × daily checks at 1% false-alarm rate = one false alert per day. Teams then ignore all alerts.</p>
  </div>

  <h2 id="sm-loops"><span class="num">06</span>Feedback Loops</h2>
  <figure class="viz"><svg viewBox="0 0 640 196" width="640" role="img"><defs><marker id="sm-m3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="30" y="20" width="180" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="120" y="46" text-anchor="middle" font-weight="600">Model ranks items</text><rect x="430" y="20" width="180" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="520" y="46" text-anchor="middle" font-weight="600">Users see top items</text><rect x="430" y="130" width="180" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="520" y="149" text-anchor="middle" font-weight="600">Clicks logged</text><text x="520" y="163" text-anchor="middle" class="tm">only on shown items</text><rect x="30" y="130" width="180" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="120" y="156" text-anchor="middle" font-weight="600">Training data</text><line x1="212" y1="42" x2="427" y2="42" stroke="currentColor" stroke-width="1.4" marker-end="url(#sm-m3)"/><line x1="520" y1="66" x2="520" y2="127" stroke="currentColor" stroke-width="1.4" marker-end="url(#sm-m3)"/><line x1="428" y1="152" x2="213" y2="152" stroke="currentColor" stroke-width="1.4" marker-end="url(#sm-m3)"/><line x1="120" y1="128" x2="120" y2="67" stroke="currentColor" stroke-width="1.4" marker-end="url(#sm-m3)"/><text x="320" y="96" text-anchor="middle" class="tr" font-weight="600">degenerate loop:</text><text x="320" y="112" text-anchor="middle" class="tr">unshown items never earn data</text></svg><figcaption>The model creates its own training data. Without exploration it keeps confirming its past choices.</figcaption></figure>
  <table class="tbl">
    <tr><th>Loop</th><th>Effect</th><th>Mitigation</th></tr>
    <tr><td>Recommendations</td><td>Popular gets more popular; new items starve</td><td>Exploration slots (ε-greedy, bandits), popularity debiasing</td></tr>
    <tr><td>Fraud blocking</td><td>Blocked txns never get a label</td><td>Let a tiny random holdout through, or use analyst review</td></tr>
    <tr><td>Predictive policing / credit</td><td>Model's decisions shape who is observed</td><td>Counterfactual evaluation, fairness audits</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>degenerate feedback loop</strong>: the model's outputs decide its future training data, so errors and biases reinforce themselves.</p>
  </div>

  <h2 id="sm-retrain"><span class="num">07</span>Retraining</h2>
  <div class="cards">
    <div><b>Scheduled</b><p>Every day / week, regardless.</p><small>Simple; may waste compute or be too slow</small></div>
    <div><b>Triggered</b><p>When drift or a metric crosses a threshold.</p><small>Efficient; needs reliable monitoring</small></div>
    <div><b>Continual</b><p>Incremental updates on new data (minutes–hours).</p><small>Ads, news feeds; harder to validate</small></div>
  </div>
  <div class="flow"><span>Trigger</span><span>Pull data (point-in-time)</span><span>Validate data</span><span>Train</span><span>Evaluate vs prod model</span><span>Register</span><span>Shadow / canary</span><span>Promote</span></div>
  <ul>
    <li><strong>Data validation gate</strong>: schema, ranges, row counts; stop bad data training a bad model.</li>
    <li><strong>Champion vs challenger</strong>: the new model must beat production on the same recent holdout.</li>
    <li><strong>Window</strong>: sliding (recent N weeks, adapts fast) vs expanding (all history, stable).</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Retraining on data that already contains the incident (e.g. a broken feature). Auto-retrain then bakes the bug into the model.</p>
  </div>

  <h2 id="sm-build"><span class="num">08</span>Hands-on: Drift Report</h2>
  <p>A nightly job's core: PSI per feature (and on the model score) against a reference window, with traffic-light status.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd

def psi(e, a, bins=10):
    edges = np.unique(np.quantile(e, np.linspace(0, 1, bins + 1)))
    edges[0], edges[-1] = -np.inf, np.inf
    pe = np.clip(np.histogram(e, edges)[0] / len(e), 1e-6, None)
    pa = np.clip(np.histogram(a, edges)[0] / len(a), 1e-6, None)
    return float(np.sum((pa - pe) * np.log(pa / pe)))

rng = np.random.default_rng(1)
n = 20_000
ref = pd.DataFrame({"amount": rng.lognormal(3, 1, n), "age": rng.normal(35, 9, n),
                    "hour": rng.integers(0, 24, n), "score": rng.beta(2, 8, n)})
cur = pd.DataFrame({"amount": rng.lognormal(3.6, 1, n),      # prices went up
                    "age": rng.normal(35, 9, n),             # unchanged
                    "hour": rng.integers(0, 24, n),          # unchanged
                    "score": rng.beta(2, 6, n)})             # model output shifted

def status(p): return "ALERT" if p &gt; 0.25 else "watch" if p &gt; 0.1 else "ok"
rep = pd.DataFrame({"psi": {c: psi(ref[c], cur[c]) for c in ref}}).round(3)
rep["status"] = rep["psi"].map(status)
print(rep.sort_values("psi", ascending=False))</div>
  <div class="fx" data-lang="text">          psi status
amount  0.344  ALERT
score   0.135  watch
hour    0.002     ok
age     0.000     ok</div>
  <p>Try it: weight each PSI by feature importance, and only alert when the status persists two nights in a row.</p>

  <h2 id="sm-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Data drift vs concept drift, with an example of each?</summary><div class="qa-body">Data drift: input distribution changes, e.g. a new app version brings younger users. Concept drift: the input-to-label relationship changes, e.g. the same transaction pattern that was safe is now a fraud tactic. Only concept drift is guaranteed to break the model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you compute PSI?</summary><div class="qa-body">Bin the reference data (often 10 quantile bins), apply the same edges to current data, get proportions e and a per bin, clip zeros, and sum (a − e) · ln(a / e). It is a symmetric form of KL divergence.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Every KS test in your dashboard has p &lt; 0.001. What's wrong?</summary><div class="qa-body">Huge samples make trivial shifts significant. Use the KS statistic (effect size) or PSI with thresholds, or subsample to a fixed size before testing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Fraud labels take 60 days. How do you know the model is degrading this week?</summary><div class="qa-body">Watch input and score drift (PSI), decline and review rates, dispute counts as proxies, and analyst-labelled samples. Then confirm with chargeback-based metrics as labels mature, by cohort.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Prediction drift fired but no feature drifted. Possible causes?</summary><div class="qa-body">An interaction shift that per-feature tests miss, an unmonitored feature, a new model or config deploy, a change in traffic mix (new segment), or a bug in a feature's default value.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a degenerate feedback loop in recommendations and how do you break it?</summary><div class="qa-body">The model only gets click data on items it chose to show, so it keeps favouring them; new items never get exposure. Break it with exploration (reserved slots, bandits), position/popularity debiasing, and inverse propensity weighting.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Scheduled vs triggered retraining: when each?</summary><div class="qa-body">Scheduled when change is steady and predictable (weekly demand). Triggered when shifts are bursty and compute is expensive. Many teams do both: a weekly schedule plus emergency triggers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your auto-retrain pipeline produced a worse model and promoted it. What gates were missing?</summary><div class="qa-body">Data validation before training, champion-vs-challenger evaluation on the same holdout, slice checks, and a shadow/canary step with automatic rollback before full promotion.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is KL divergence awkward for monitoring?</summary><div class="qa-body">It is asymmetric and becomes infinite when the reference has zero mass where current data has some. PSI and JS fix this by symmetrising (and JS by bounding to [0, 1]).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What would you put on a model's monitoring dashboard?</summary><div class="qa-body">Latency, errors and fallback rate; null rates and PSI for top features; prediction distribution and positive rate; delayed performance by cohort; and the business KPI with its guardrails.</div></details>
</main>`
});
