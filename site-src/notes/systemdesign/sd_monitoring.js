// notes/systemdesign/sd_monitoring.js — Monitoring, Drift & Retraining
Object.assign(TOPIC_CONTENT, {
  "sd_monitoring": `<main>
<h1>Monitoring, Drift &amp; Retraining</h1>
  <div class="where"><span>ML System Design</span><span>Monitoring</span></div>
  <p class="lead">A deployed model does not stay good on its own. The world it learnt from keeps changing, and unlike ordinary software, a model that has gone wrong usually keeps answering quickly and politely with "200 OK"; only the answers are worse. <strong>Monitoring</strong> is how you notice that, and <strong>retraining</strong> is how you fix it without making things worse. Interviewers ask about this in almost every ML system design round, because "how would you know your model is broken?" separates people who have run models in production from people who have only trained them. The running example continues from <a class="xref" data-note="sd_serving">Serving</a>: Biteful's ETA model was trained in March. In July the monsoon arrives, the delivery radius grows from 8 to 10 km, and metro works close roads in the Kothrud area. We follow that one model from the first silent symptom to a measured, safely promoted replacement.</p>

  <h2 id="sm-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Monitoring Biteful's ETA</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What can go wrong</div>
        <ul>
          <li>Silent failure: fast, 200 OK, wrong minutes</li>
          <li>Four layers: system, data, model, business</li>
          <li><b>Data drift</b> P(x), <b>concept drift</b> P(y|x), <b>prediction drift</b> P(ŷ)</li>
          <li>Only labels prove concept drift</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Measuring drift</div>
        <ul>
          <li><b>PSI</b> = Σ (a − e) ln(a/e); &lt;0.1 ok, 0.1–0.25 watch, &gt;0.25 act</li>
          <li><b>KS</b> D = largest gap between two ECDFs</li>
          <li>Huge samples make every p-value tiny: use effect size</li>
          <li>Evidently produces the per-column report</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Truth and alerts</div>
        <ul>
          <li>Labels arrive late, early ones are biased, some never arrive</li>
          <li>Proxies meanwhile: "where is my order?" taps, cancellations</li>
          <li>Persistence rules; SLO error budget and burn rate</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Retraining</div>
        <ul>
          <li>Scheduled, triggered or continual</li>
          <li>Validate data before training</li>
          <li><b>Champion vs challenger</b> on the same newest data, by slice</li>
          <li>Then shadow → canary → A/B</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sm-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Models Go Stale</span><span class="rm-sub">silent failure and the four layers to watch</span></div></div>
      <div class="rm-item rm-done" data-target="sm-types"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Data, Concept and Model Drift</span><span class="rm-sub">what moved, and does it hurt?</span></div></div>
      <div class="rm-item rm-done" data-target="sm-psi"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Population Stability Index</span><span class="rm-sub">one drift number per feature, by hand</span></div></div>
      <div class="rm-item rm-done" data-target="sm-ks"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The KS Test</span><span class="rm-sub">comparing two samples without bins</span></div></div>
      <div class="rm-item rm-done" data-target="sm-labels"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Delayed Labels and Proxy Metrics</span><span class="rm-sub">the truth arrives late, and biased</span></div></div>
      <div class="rm-item rm-done" data-target="sm-alert"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Alerts and SLOs</span><span class="rm-sub">wake someone, but rarely and for real</span></div></div>
      <div class="rm-item rm-done" data-target="sm-report"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Drift Reports and Evidently</span><span class="rm-sub">the nightly check, by hand and with a tool</span></div></div>
      <div class="rm-item rm-done" data-target="sm-retrain"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Retraining Triggers</span><span class="rm-sub">when to retrain, on what, behind which gate</span></div></div>
      <div class="rm-item rm-done" data-target="sm-champ"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Champion and Challenger</span><span class="rm-sub">proving the new model is better</span></div></div>
      <div class="rm-item rm-done" data-target="sm-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">binning, p-values, labels so far</span></div></div>
      <div class="rm-item rm-done" data-target="sm-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, thresholds, comparisons</span></div></div>
      <div class="rm-item rm-done" data-target="sm-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">monitoring questions from ML design rounds</span></div></div>
    </div>
  </div>

  <h2 id="sm-why"><span class="num">01</span>Why Models Go Stale</h2>
  <p>In March, Biteful's ETA was late on about 4 orders in 10. In July it is late on almost 6 in 10. Nobody changed a line of code, the service still answers in 30 ms, and every server dashboard is green. Three things happened in the meantime. The monsoon arrived, so the share of orders delivered in rain rose from 10% to 40%, and the model had seen relatively few rainy orders. Biteful grew its delivery radius from 8 to 10 km, so long trips that were rare in training are now common. And metro construction closed roads in Kothrud, so the same 3 km trip there now takes several minutes longer: the relationship the model learnt between distance and time is simply no longer true in that area.</p>
  <p>A trained model is a summary of the data it was trained on, like a printed map of a city. A map of Pune from 2019 still looks perfect, clean and detailed with no errors on the page, but the new flyover and the metro are missing. The map did not change; the city did. The general name for "the world has moved away from what the model learnt" is <strong>drift</strong>, and the failure it causes is a <strong>silent failure</strong>: the system produces wrong outputs without raising any error. That is why ML systems need monitoring beyond the usual "is it up and is it fast?".</p>
  <p>It helps to think of monitoring in four layers, from the machine up to the money. The <strong>system</strong> layer is ordinary software monitoring: latency, error rate, requests per second and the fallback rate. The <strong>data</strong> layer watches the model's inputs: missing-value rates, schema, ranges and distributions of each feature. The <strong>model</strong> layer watches the outputs (the distribution of predicted ETAs) and, once the true delivery times arrive, accuracy. The <strong>business</strong> layer watches what the company actually cares about: cancellations, "where is my order?" support contacts, conversion. Each layer catches failures the others miss.</p>
  <table class="tbl">
    <tr><th>Layer</th><th>Biteful ETA metrics</th><th>Catches</th><th>Needs true labels?</th></tr>
    <tr><td>System</td><td>p99 latency, error rate, requests/s, fallback rate</td><td>Outages, slow dependencies</td><td>No</td></tr>
    <tr><td>Data</td><td>Null rate, schema, ranges, distribution (PSI) of km, queue, rain</td><td>Broken pipelines, input drift</td><td>No</td></tr>
    <tr><td>Model</td><td>Distribution of predicted ETAs; MAE, late rate once deliveries land</td><td>Decay, concept drift</td><td>For accuracy, yes</td></tr>
    <tr><td>Business</td><td>Cancellations, support contacts, conversion</td><td>What actually matters</td><td>No, but slow and noisy</td></tr>
  </table>
  <p>In July a good dashboard would read something like this. System: p99 31 ms, 0.1% errors, fine. Data: rain = 1 on 40% of orders against 10% in training. Model: median predicted ETA up 4 minutes; late rate 57% on yesterday's delivered orders. Business: support contacts about late food up 30%. Only the bottom three layers show anything, which is the point: monitoring the system layer alone would report a perfectly healthy service.</p>

  <h2 id="sm-types"><span class="num">02</span>Data, Concept and Model Drift</h2>
  <p>"The world moved" covers several different stories, and telling them apart matters, because they differ in whether they hurt, how early we can see them, and what fixes them. A little notation keeps them separate. Call the inputs <strong>x</strong> (km, queue, rain), the true answer <strong>y</strong> (actual delivery minutes) and the model's prediction <strong>ŷ</strong> ("y-hat", the ETA). P(x) means "what inputs usually look like", and P(y | x), read "y given x", means "for these inputs, what delivery time to expect", which is exactly the rule the model learnt.</p>
  <p><strong>Data drift</strong> (also called covariate drift) is a change in P(x): the inputs look different, but the rule connecting inputs to answers is unchanged. Longer trips after the radius grew, and more rainy orders in the monsoon, are data drift. <strong>Concept drift</strong> is a change in P(y | x): the same inputs now lead to a different right answer. The metro works are concept drift, since a 3 km trip in Kothrud now takes longer than a 3 km trip used to. <strong>Prediction drift</strong> is a change in P(ŷ), the distribution of the model's outputs, and <strong>label drift</strong> is a change in P(y), the distribution of true answers. "Model drift" or "model decay" is the everyday name for the resulting drop in accuracy, whatever caused it. A teacher marking exams gives a good picture: data drift is a younger class sitting the same exam with the same marking scheme; concept drift is the exam board changing the marking scheme, so the same answer now earns a different mark; prediction drift is the teacher suddenly awarding everyone 90+, which you can notice before any re-check.</p>
  <figure class="viz"><svg viewBox="0 0 762 196" width="762" role="img"><text x="125" y="16" text-anchor="middle" font-weight="600">Data drift: P(x) moves</text><path d="M15.0,138.9 L20.3,138.1 L25.7,136.7 L31.0,134.5 L36.3,131.2 L41.7,126.5 L47.0,120.1 L52.3,112.0 L57.7,102.3 L63.0,91.2 L68.3,79.4 L73.7,67.9 L79.0,57.8 L84.3,50.1 L89.7,45.8 L95.0,45.3 L100.3,48.7 L105.7,55.6 L111.0,65.2 L116.3,76.5 L121.7,88.3 L127.0,99.6 L132.3,109.7 L137.7,118.3 L143.0,125.0 L148.3,130.1 L153.7,133.8 L159.0,136.2 L164.3,137.8 L169.7,138.8 L175.0,139.3 L180.3,139.7 L185.7,139.8 L191.0,139.9 L196.3,140.0 L201.7,140.0 L207.0,140.0 L212.3,140.0 L217.7,140.0 L223.0,140.0" stroke="currentColor" fill="none" stroke-width="1.4"/><path d="M15.0,139.9 L20.3,139.9 L25.7,139.8 L31.0,139.6 L36.3,139.3 L41.7,138.8 L47.0,138.0 L52.3,136.9 L57.7,135.3 L63.0,133.1 L68.3,130.0 L73.7,126.1 L79.0,121.1 L84.3,115.1 L89.7,108.1 L95.0,100.4 L100.3,92.2 L105.7,84.0 L111.0,76.2 L116.3,69.5 L121.7,64.3 L127.0,61.0 L132.3,60.0 L137.7,61.3 L143.0,64.8 L148.3,70.2 L153.7,77.1 L159.0,85.0 L164.3,93.2 L169.7,101.4 L175.0,109.1 L180.3,115.9 L185.7,121.8 L191.0,126.6 L196.3,130.5 L201.7,133.4 L207.0,135.6 L212.3,137.1 L217.7,138.2 L223.0,138.9" class="st" fill="none" stroke-width="1.4"/><path d="M15,140 H230" stroke="currentColor" fill="none" stroke-width="1.4"/><text x="70" y="158" text-anchor="middle" class="tm">train</text><text x="175" y="158" text-anchor="middle" class="tb">prod</text><text x="125" y="184" text-anchor="middle" class="tm">inputs change, rule same</text><text x="375" y="16" text-anchor="middle" font-weight="600">Concept drift: P(y|x) moves</text><rect x="260" y="30" width="230" height="110" rx="2" class="fs" stroke="currentColor" stroke-opacity=".4"/><circle cx="290" cy="50" r="5" class="fg" stroke="currentColor"/><circle cx="320" cy="90" r="5" class="fg" stroke="currentColor"/><circle cx="300" cy="110" r="5" class="fg" stroke="currentColor"/><circle cx="355" cy="60" r="5" class="fr" stroke="currentColor"/><circle cx="380" cy="100" r="5" class="fr" stroke="currentColor"/><circle cx="430" cy="50" r="5" class="fr" stroke="currentColor"/><circle cx="460" cy="95" r="5" class="fr" stroke="currentColor"/><circle cx="410" cy="120" r="5" class="fr" stroke="currentColor"/><circle cx="350" cy="125" r="5" class="fg" stroke="currentColor"/><path d="M335,32 L370,138" stroke="currentColor" fill="none" stroke-width="1.4" stroke-dasharray="5 4"/><path d="M395,32 L430,138" class="sr" fill="none" stroke-width="1.4"/><text x="322" y="158" text-anchor="middle" class="tm">old boundary</text><text x="438" y="158" text-anchor="middle" class="tr">new</text><text x="375" y="184" text-anchor="middle" class="tm">same x, different right answer</text><text x="640" y="16" text-anchor="middle" font-weight="600">Prediction drift</text><rect x="550" y="132" width="16" height="8" rx="1" class="fs" stroke="currentColor" stroke-opacity=".4"/><rect x="567" y="137" width="16" height="3" rx="1" class="ft" stroke="currentColor" stroke-opacity=".4"/><rect x="588" y="110" width="16" height="30" rx="1" class="fs" stroke="currentColor" stroke-opacity=".4"/><rect x="605" y="130" width="16" height="10" rx="1" class="ft" stroke="currentColor" stroke-opacity=".4"/><rect x="626" y="80" width="16" height="60" rx="1" class="fs" stroke="currentColor" stroke-opacity=".4"/><rect x="643" y="110" width="16" height="30" rx="1" class="ft" stroke="currentColor" stroke-opacity=".4"/><rect x="664" y="110" width="16" height="30" rx="1" class="fs" stroke="currentColor" stroke-opacity=".4"/><rect x="681" y="85" width="16" height="55" rx="1" class="ft" stroke="currentColor" stroke-opacity=".4"/><rect x="702" y="130" width="16" height="10" rx="1" class="fs" stroke="currentColor" stroke-opacity=".4"/><rect x="719" y="100" width="16" height="40" rx="1" class="ft" stroke="currentColor" stroke-opacity=".4"/><path d="M540,140 H740" stroke="currentColor" fill="none" stroke-width="1.4"/><text x="640" y="158" text-anchor="middle" class="tm">score: grey train, teal prod</text><text x="640" y="184" text-anchor="middle" class="tm">outputs shift; no labels needed</text></svg><figcaption>Three different things can move. Only concept drift changes the true rule, so only true labels can prove it.</figcaption></figure>
  <p>On the left, the hump of input values has slid to the right (longer trips), but nothing says the rule changed. In the middle, the points are the same, but the line separating "fast" from "slow" deliveries has moved, so points between the two lines are now on the other side: the same input, a different right answer. On the right, the grey and teal bars are histograms of the model's own predictions in training and in production; you can see them move without knowing a single true answer.</p>
  <p>The crucial practical difference is whether each kind of drift actually hurts. The experiment below trains a model on March data and then shows it three Julys: one with no change, one with pure data drift (15% longer trips, 40% rain, same rule), and one with pure concept drift (identical inputs, but every km in the affected area costs 1.5 minutes more). PSI, the drift score we build in the next section, measures how far the km distribution moved:</p>
  <div class="fx" data-lang="py">import numpy as np, lightgbm as lgb

rng = np.random.default_rng(8)
def orders(n, km_scale=1.0, rain_share=0.10, extra_per_km=0.0):
    km = np.clip(rng.gamma(2.2, 1.4, n), 0.3, 9) * km_scale
    q = rng.poisson(4, n); rain = (rng.random(n) &lt; rain_share).astype(int)
    y = 12 + km * (3.0 + 2.0 * rain + extra_per_km) + 1.3 * q + rng.gamma(2, 1.5, n)
    return np.c_[km, q, rain], y

def psi(e, a, bins=10):
    edges = np.quantile(e, np.linspace(0, 1, bins + 1)); edges[0], edges[-1] = -np.inf, np.inf
    pe = np.clip(np.histogram(e, edges)[0] / len(e), 1e-6, None)
    pa = np.clip(np.histogram(a, edges)[0] / len(a), 1e-6, None)
    return np.sum((pa - pe) * np.log(pa / pe))

X_mar, y_mar = orders(30_000)                                   # March: what v12 learnt from
model = lgb.LGBMRegressor(n_estimators=300, verbose=-1, random_state=0).fit(X_mar, y_mar)

scenarios = {
    "March again (no drift)":          orders(10_000),
    "data drift: longer trips, rain":  orders(10_000, km_scale=1.15, rain_share=0.40),
    "concept drift: metro works":      orders(10_000, extra_per_km=1.5),
}
print(f"{'scenario':&lt;33}{'PSI km':&gt;7}{'rain %':&gt;8}{'pred mean':&gt;10}{'MAE':&gt;6}{'bias':&gt;7}")
for name, (X, y) in scenarios.items():
    p = model.predict(X); e = y - p
    print(f"{name:&lt;33}{psi(X_mar[:, 0], X[:, 0]):&gt;7.3f}{X[:, 2].mean():&gt;8.0%}{p.mean():&gt;10.1f}"
          f"{np.abs(e).mean():&gt;6.2f}{e.mean():&gt;+7.2f}")</div>
  <div class="fx" data-lang="text">scenario                          PSI km  rain % pred mean   MAE   bias
March again (no drift)             0.001     10%      30.0  1.63  -0.02
data drift: longer trips, rain     0.042     41%      33.5  1.73  +0.19
concept drift: metro works         0.002     10%      30.0  4.69  +4.58</div>
  <p>The first row is the baseline: no drift, MAE 1.63 minutes, bias near zero. In the data-drift row, the inputs clearly moved (rain went from 10% to 41%) and the average prediction rose from 30.0 to 33.5 minutes, which is prediction drift; yet accuracy barely changed (MAE 1.73), because the model had learnt the effect of rain and distance correctly and the new inputs were still within what it had seen. The model simply, and rightly, gave longer ETAs. In the concept-drift row the opposite happens: the km PSI is 0.002 and rain is still 10%, so every input check is perfectly green, but the MAE nearly triples to 4.69 and the model is 4.58 minutes too optimistic on average.</p>
  <p>Two lessons follow, and both are standard interview answers. First, data drift is a warning, not proof of harm; a drift alert should lead to an investigation, not an automatic retrain. Second, concept drift is invisible to input monitoring and can only be confirmed by comparing predictions with true labels, ideally per slice (Kothrud, rain, long trips). That is why a monitoring system needs both cheap, immediate input checks and slower label-based accuracy checks. The next two sections turn "the inputs moved" into numbers.</p>

  <h2 id="sm-psi"><span class="num">03</span>The Population Stability Index</h2>
  <p>Looking at two histograms and judging that "km moved" works for one feature, once, with a human watching. A nightly job checking fifty features needs one number per feature that is zero when nothing moved, grows as the distributions separate, and can be compared with an agreed threshold. The most widely used number in industry, originally from credit scoring, is the <strong>population stability index (PSI)</strong>. The recipe is: cut the feature's range into bins; find each bin's share of rows in the reference period, usually the training data (call it e, for expected) and in the current period (call it a, for actual); then add up (a − e) × ln(a ÷ e) over all bins.</p>
  <p>Imagine a school comparing this year's class with last year's by the share of students in each height band. Every band that grew or shrank adds something to a "how different" score, and a band that doubled adds a lot. Here is Biteful's delivery distance in four bins. In March, 30% of orders were 0–2 km, 40% were 2–4 km, 20% were 4–6 km and 10% were over 6 km. This week, after the radius grew, the shares are 20%, 35%, 25% and 20%:</p>
  <div class="fx" data-lang="py">import numpy as np

# Share of Biteful orders per delivery-distance bin
bins  = ["0-2 km", "2-4 km", "4-6 km", "6+ km"]
train = np.array([0.30, 0.40, 0.20, 0.10])   # training period (expected, e)
week  = np.array([0.20, 0.35, 0.25, 0.20])   # this week, after the radius grew to 10 km (actual, a)

parts = (week - train) * np.log(week / train)
for b, e, a, p in zip(bins, train, week, parts):
    print(f"{b:&lt;7} e={e:.2f} a={a:.2f}  a-e={a-e:+.2f}  ln(a/e)={np.log(a/e):+.3f}  term={p:.4f}")
print(f"PSI = {parts.sum():.4f}")</div>
  <div class="fx" data-lang="text">0-2 km  e=0.30 a=0.20  a-e=-0.10  ln(a/e)=-0.405  term=0.0405
2-4 km  e=0.40 a=0.35  a-e=-0.05  ln(a/e)=-0.134  term=0.0067
4-6 km  e=0.20 a=0.25  a-e=+0.05  ln(a/e)=+0.223  term=0.0112
6+ km   e=0.10 a=0.20  a-e=+0.10  ln(a/e)=+0.693  term=0.0693
PSI = 0.1277</div>
  <p>Check the first and last rows by hand. The 0–2 km bin shrank: a − e = −0.10, and ln(0.20 ÷ 0.30) = ln(0.667) = −0.405, so the term is (−0.10) × (−0.405) = +0.0405. The 6+ km bin doubled: a − e = +0.10 and ln(2) = 0.693, so the term is 0.0693. Notice that both terms are positive. A shrinking bin has a negative difference and a negative logarithm; a growing bin has both positive; either way the product is positive. So no bin can cancel another, PSI is zero only when every bin keeps its share, and it grows as shares move apart. The total here is 0.128.</p>
  <p>The usual reading of PSI is: below 0.1, no meaningful shift; 0.1 to 0.25, a moderate shift worth investigating; above 0.25, a major shift that calls for action (check the pipeline first, then consider retraining). Our 0.128 is "investigate". These thresholds are rules of thumb from credit scoring, not laws of nature, and teams often tune them per feature. Mathematically, PSI is a symmetric version of the <strong>Kullback–Leibler (KL) divergence</strong>, Σ p · ln(p ÷ q), which measures how different two distributions are but is asymmetric and becomes infinite when q is zero in some bin. The <strong>Jensen–Shannon (JS) divergence</strong> is another symmetric relative that is bounded between 0 and 1, which makes it convenient for dashboards.</p>
  <p>How the bins are chosen matters a great deal. In production you take the reference data's deciles (10 bins, each holding 10% of the training values), apply those same edges to the current data, and replace any empty bin's share with a tiny number such as 0.000001 so that ln(0) never occurs. Categorical and binary features need one bin per value instead, for a reason shown in Common Mistakes. Section 07 builds exactly this function and runs it on every feature.</p>

  <h2 id="sm-ks"><span class="num">04</span>The KS Test</h2>
  <p>PSI has two weaknesses: its value depends on how you choose the bins, and it has no notion of chance. With only a handful of orders, two samples from the same distribution will differ a little just by luck, and PSI cannot tell you whether a difference is bigger than luck would produce. The <strong>Kolmogorov–Smirnov (KS) test</strong> works on the raw numbers with no bins and comes with a p-value.</p>
  <p>It is built on the <strong>empirical cumulative distribution function (ECDF)</strong> of a sample: for every value x, the share of the sample that is less than or equal to x. An ECDF climbs from 0 to 1 as x increases. If two samples come from the same distribution, their two ECDF curves stay close together. The <strong>KS statistic D</strong> is the largest vertical gap between the two curves, a number between 0 and 1, and the test then asks how likely a gap at least that large would be if both samples really came from the same distribution. Picture two queues at a ration shop: walk down both and, at every height, count what share of each queue is shorter than that height; D is the biggest difference between those running shares. Here it is by hand on the km of orders 101–108 from training and eight orders from this week:</p>
  <div class="fx" data-lang="py">import numpy as np
from scipy import stats

train = np.array([2.0, 4.0, 3.0, 5.0, 1.0, 6.0, 3.0, 2.0])   # km of orders 101-108
week  = np.array([3.0, 5.0, 7.0, 4.0, 8.0, 2.0, 6.0, 9.0])   # km of 8 orders this week

# Empirical CDF: share of values &lt;= x, checked at every value that occurs
print(" x   F_train  F_week   gap")
best = 0
for x in np.unique(np.r_[train, week]):
    ft, fw = np.mean(train &lt;= x), np.mean(week &lt;= x)
    best = max(best, abs(ft - fw))
    print(f"{x:&gt;3.0f}   {ft:5.3f}   {fw:5.3f}  {abs(ft - fw):5.3f}")
print("KS statistic D (largest gap) =", best)
res = stats.ks_2samp(train, week)
print(f"scipy: D = {res.statistic:.3f}, p-value = {res.pvalue:.3f}")</div>
  <div class="fx" data-lang="text"> x   F_train  F_week   gap
  1   0.125   0.000  0.125
  2   0.375   0.125  0.250
  3   0.625   0.250  0.375
  4   0.750   0.375  0.375
  5   0.875   0.500  0.375
  6   1.000   0.625  0.375
  7   1.000   0.750  0.250
  8   1.000   0.875  0.125
  9   1.000   1.000  0.000
KS statistic D (largest gap) = 0.375
scipy: D = 0.375, p-value = 0.660</div>
  <p>Take x = 3. Training values at or below 3 are 2, 3, 1, 3 and 2, five of eight, so F_train = 0.625. This week only 3 and 2 are at or below 3, two of eight, so F_week = 0.250. The gap is 0.375, and it stays 0.375 from x = 3 to x = 6, so D = 0.375, which scipy confirms. But the p-value is 0.66: with only eight orders on each side, a gap this large happens by pure luck about two times in three. The test honestly says it cannot tell whether anything changed.</p>
  <p>Production has the opposite problem. Biteful sees hundreds of thousands of orders a day, and with that much data a statistical test can detect differences far too small to matter. The next program applies the same tiny shift to the predicted ETA (half a minute, on a spread of 10 minutes) at three sample sizes:</p>
  <div class="fx" data-lang="py">import numpy as np
from scipy import stats

def psi(e, a, bins=10):
    edges = np.quantile(e, np.linspace(0, 1, bins + 1)); edges[0], edges[-1] = -np.inf, np.inf
    pe = np.clip(np.histogram(e, edges)[0] / len(e), 1e-6, None)
    pa = np.clip(np.histogram(a, edges)[0] / len(a), 1e-6, None)
    return np.sum((pa - pe) * np.log(pa / pe))

rng = np.random.default_rng(0)
# The SAME small shift in predicted ETA (+0.5 min on a 10-min spread) at three sample sizes
print(f"{'n':&gt;9}{'KS D':&gt;8}{'KS p-value':&gt;12}{'PSI':&gt;8}")
for n in [500, 5_000, 500_000]:
    a, b = rng.normal(36, 10, n), rng.normal(36.5, 10, n)
    ks = stats.ks_2samp(a, b)
    print(f"{n:&gt;9,}{ks.statistic:&gt;8.3f}{ks.pvalue:&gt;12.4f}{psi(a, b):&gt;8.3f}")</div>
  <div class="fx" data-lang="text">        n    KS D  KS p-value     PSI
      500   0.046      0.6659   0.028
    5,000   0.032      0.0112   0.008
  500,000   0.020      0.0000   0.002</div>
  <p>At 500 rows the p-value is 0.67, "nothing to see". At 5,000 it is 0.011, "significant". At 500,000 it is 0.0000, "certain". The shift did not grow at all; only the sample did. Meanwhile the KS statistic D settles towards the true, small size of the shift (0.020 at 500,000 rows; the larger values at small n are mostly noise), and PSI stays tiny throughout. This is the difference between a p-value, which answers "how sure are we that some difference exists?", and an <strong>effect size</strong> such as D or PSI, which answers "how big is the difference?". At production volumes everything is "significant", so drift alerts should use effect sizes with thresholds (or KS on a fixed-size random subsample), not raw p-values.</p>
  <table class="tbl">
    <tr><th>Method</th><th>Idea</th><th>Good for</th></tr>
    <tr><td>PSI</td><td>Σ (a − e) · ln(a / e) over bins</td><td>One number per feature with standard thresholds</td></tr>
    <tr><td>KS test</td><td>D = largest gap between two ECDFs, plus a p-value</td><td>Continuous features; use D, not p, at scale</td></tr>
    <tr><td>KL divergence</td><td>Σ p · ln(p / q)</td><td>Theory; asymmetric, needs smoothing</td></tr>
    <tr><td>JS divergence</td><td>Symmetric, bounded version of KL</td><td>Dashboards (0 to 1); categorical features</td></tr>
    <tr><td>Wasserstein distance</td><td>How far probability mass must move</td><td>Continuous features; Evidently's default at large n</td></tr>
    <tr><td>Chi-square test</td><td>Observed vs expected counts per category</td><td>Categorical features (<a class="xref" data-note="st_hypothesis">Hypothesis Testing</a>)</td></tr>
  </table>

  <h2 id="sm-labels"><span class="num">05</span>Delayed Labels and Proxy Metrics</h2>
  <p>Drift scores only say that inputs or outputs moved. Whether the ETAs are actually <em>wrong</em> can only be known by comparing them with the true delivery times, the <strong>labels</strong>. For an ETA a label exists once the food is delivered, typically within the hour, which is quick compared with many products: a fraud model learns the truth only when a chargeback arrives 30 to 90 days later. The gap between prediction and truth is called <strong>label delay</strong>, and it creates three problems that the simulation below makes visible. It follows 6,000 orders placed between 20:00 and 21:00, where long waits make customers more likely to cancel, and the model is good on typical orders but too optimistic on long ones:</p>
  <div class="fx" data-lang="py">import numpy as np

# 6,000 orders placed between 20:00 and 21:00; when does each one's label (delivery time) exist?
rng = np.random.default_rng(5)
n = 6_000
placed = rng.uniform(0, 60, n)                        # minutes after 20:00
actual = 15 + rng.gamma(4, 5.5, n)                    # true delivery minutes (mean ~37)
eta = 7.5 + 0.8 * actual + rng.normal(0, 3, n)        # the model: good on typical orders, short on long ones
cancelled = rng.random(n) &lt; 0.04 + 0.004 * np.clip(actual - 40, 0, None)   # long waits cancel more
done_at = placed + actual

print(f"cancelled (never labelled): {cancelled.mean():.1%}")
for clock in [30, 60, 90, 120, 180]:                  # minutes after 20:00
    have = (~cancelled) &amp; (done_at &lt;= clock)
    print(f"at {20 + clock // 60}:{clock % 60:02d}  labelled {have.mean():5.1%}   "
          f"mean actual of labelled {actual[have].mean():5.1f} min   late rate so far {np.mean(actual[have] &gt; eta[have]):5.1%}")
final = ~cancelled
print(f"final (all delivered)  mean actual {actual[final].mean():5.1f} min   late rate {np.mean(actual[final] &gt; eta[final]):5.1%}")</div>
  <div class="fx" data-lang="text">cancelled (never labelled): 5.4%
at 20:30  labelled  2.3%   mean actual of labelled  23.2 min   late rate so far 11.4%
at 21:00  labelled 37.8%   mean actual of labelled  32.2 min   late rate so far 37.1%
at 21:30  labelled 82.1%   mean actual of labelled  34.9 min   late rate so far 43.4%
at 22:00  labelled 94.2%   mean actual of labelled  36.6 min   late rate so far 46.8%
at 23:00  labelled 94.6%   mean actual of labelled  36.8 min   late rate so far 47.0%
final (all delivered)  mean actual  36.8 min   late rate 47.0%</div>
  <p>The first problem is delay itself: at 21:00 only 37.8% of the evening's orders have a label, and by 22:00 94.2%. The second is that early labels are <strong>biased</strong>: the first deliveries to finish are the fast ones, so at 20:30 the labelled orders average 23.2 minutes against 36.8 eventually, and the late rate looks like a wonderful 11.4% when the truth is 47.0%. A dashboard computing "today's accuracy from labels so far" would show a degrading model as healthy. The fix is to judge a group of predictions (a <strong>cohort</strong>, such as "the 20:00–21:00 orders") only once it has <strong>matured</strong>, meaning almost all its labels have arrived. The third problem is <strong>censoring</strong>: 5.4% of orders are cancelled and never get a label, and cancellations cluster in long waits, exactly where the model is worst. So cancellation rate must be tracked as a metric in its own right, or the worst cases silently disappear from the accuracy figures. It is like judging a new cook by the first plates coming back from the dining room: the quick dishes come back first, the complicated ones where mistakes happen come back last, and some customers walk out before theirs arrives.</p>
  <figure class="viz"><svg viewBox="0 0 700 150" width="700" role="img">
    <defs><marker id="sm-m5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <line x1="20" y1="60" x2="680" y2="60" stroke="currentColor" marker-end="url(#sm-m5)"/>
    <circle cx="60" cy="60" r="6" class="fb" stroke="currentColor"/><text x="60" y="40" text-anchor="middle" font-size="11">20:05 ETA</text><text x="60" y="84" text-anchor="middle" font-size="10" class="tm">prediction</text>
    <circle cx="200" cy="60" r="6" class="ft" stroke="currentColor"/><text x="200" y="40" text-anchor="middle" font-size="11">+20 min</text><text x="200" y="84" text-anchor="middle" font-size="10" class="tm">proxy: picked up?</text>
    <circle cx="345" cy="60" r="6" class="fg" stroke="currentColor"/><text x="345" y="40" text-anchor="middle" font-size="11">+30–60 min</text><text x="345" y="84" text-anchor="middle" font-size="10" class="tm">label: delivered</text>
    <circle cx="490" cy="60" r="6" class="fr" stroke="currentColor"/><text x="490" y="40" text-anchor="middle" font-size="11">never</text><text x="490" y="84" text-anchor="middle" font-size="10" class="tm">cancelled</text>
    <circle cx="625" cy="60" r="6" class="fs" stroke="currentColor"/><text x="625" y="40" text-anchor="middle" font-size="11">+30–90 days</text><text x="625" y="84" text-anchor="middle" font-size="10" class="tm">fraud label</text>
    <text x="350" y="122" text-anchor="middle" font-size="11">Between a prediction and its mature label, lean on drift metrics and proxies.</text>
  </svg><figcaption>ETA labels arrive within the hour, except for cancellations, which never arrive. Fraud labels take months.</figcaption></figure>
  <p>The timeline shows what is available when. At prediction time we have only drift metrics. Twenty minutes later we know whether the rider picked the food up on schedule. The label arrives 30 to 60 minutes after ordering, or never if the order is cancelled; for fraud the wait is months. To fill the gap we watch a <strong>proxy metric</strong>: a signal that arrives early and usually moves together with the true metric. For ETA, good proxies are pickup delay against plan, "where is my order?" taps in the app, and cancellations. A proxy is only useful if it really tracks the label, which you check on history:</p>
  <div class="fx" data-lang="py">import numpy as np

# 30 days of Biteful: does a same-evening proxy track the late rate we only know hours later?
rng = np.random.default_rng(9)
late_rate = np.clip(0.42 + 0.004 * np.arange(30) + rng.normal(0, 0.02, 30), 0, 1)   # slowly rising
where_taps = 900 + 4_000 * late_rate + rng.normal(0, 60, 30)    # "where is my order?" taps per 10k orders
cancel = 0.03 + 0.05 * late_rate + rng.normal(0, 0.003, 30)     # cancellation rate

print(f"correlation with daily late rate: taps {np.corrcoef(where_taps, late_rate)[0, 1]:.2f}, "
      f"cancellations {np.corrcoef(cancel, late_rate)[0, 1]:.2f}")
print(f"first week vs last week  late {late_rate[:7].mean():.1%} -&gt; {late_rate[-7:].mean():.1%}   "
      f"taps {where_taps[:7].mean():,.0f} -&gt; {where_taps[-7:].mean():,.0f}")</div>
  <div class="fx" data-lang="text">correlation with daily late rate: taps 0.96, cancellations 0.61
first week vs last week  late 43.1% -&gt; 52.8%   taps 2,590 -&gt; 2,988</div>
  <p>Over 30 days the daily count of "where is my order?" taps correlates 0.96 with the late rate, while cancellations correlate only 0.61, because cancellations also depend on things like price and mood. When the late rate crept from 43.1% in the first week to 52.8% in the last, taps rose from 2,590 to 2,988 per 10,000 orders the same evening, hours before the matured late rate confirmed it. Proxies are for early warning only; decisions such as promoting a model should still rest on mature labels.</p>
  <table class="tbl">
    <tr><th>Product</th><th>True label</th><th>Delay</th><th>Proxy meanwhile</th></tr>
    <tr><td>ETA</td><td>Delivered time</td><td>~1 hour; never if cancelled</td><td>Pickup delay, "where is my order?" taps, cancellations</td></tr>
    <tr><td>Fraud</td><td>Chargeback</td><td>30–90 days</td><td>Disputes, analyst review outcomes, decline rate</td></tr>
    <tr><td>Recommendations</td><td>Purchase, retention</td><td>Hours to weeks</td><td>Clicks, add-to-cart</td></tr>
    <tr><td>Demand forecast</td><td>Actual orders</td><td>1 day</td><td>Orders so far today vs forecast so far</td></tr>
  </table>

  <h2 id="sm-alert"><span class="num">06</span>Alerts and SLOs</h2>
  <p>We now have many numbers: PSI per feature, prediction drift, matured late rate, proxies, latency. Someone must decide which of them should wake an engineer at 2 am, which can wait for a ticket tomorrow, and which only belong on a dashboard. Get this wrong in one direction and real problems go unnoticed; get it wrong in the other and people drown in false alarms, learn to ignore them, and then miss the real one. A smoke alarm that rings whenever you make toast ends up with its battery removed.</p>
  <p>An <strong>alert</strong> is an automatic notification when a metric crosses a rule. Severity matters: a <strong>page</strong> interrupts someone immediately (a phone call at night), so it is reserved for symptoms users feel right now; a <strong>ticket</strong> goes into a queue for working hours. The other half of the picture comes from site reliability engineering (SRE). A <strong>service level indicator (SLI)</strong> is a measured quantity, such as "share of ETA requests answered successfully within 60 ms". A <strong>service level objective (SLO)</strong> is the target for it, such as "99.9% over 30 days". The gap between 100% and the SLO is the <strong>error budget</strong>, the amount of failure the team has agreed is acceptable, and the <strong>burn rate</strong> is how fast that budget is being spent compared with the allowed pace. The code works through both ideas:</p>
  <div class="fx" data-lang="py"># How noisy are alerts, and how much failure can an SLO absorb?
checks_per_day, false_rate = 100, 0.01                  # 100 drift checks, each wrong 1% of the time
print(f"expected false alerts/day: {checks_per_day * false_rate:.1f}")
print(f"P(at least one false alert today): {1 - (1 - false_rate) ** checks_per_day:.1%}")
need = 3                                                 # alert only after 3 breaches in a row
p3 = false_rate ** need                                  # (if windows were independent)
print(f"with a {need}-in-a-row rule: {checks_per_day * p3:.0e} false alerts/day")

# Availability SLO for the ETA service
slo, days = 0.999, 30
budget_min = (1 - slo) * days * 24 * 60
print(f"\nSLO {slo:.1%} over {days} days -&gt; error budget {budget_min:.1f} minutes of failure")
for err in [0.001, 0.005, 0.02]:                         # current failure rate
    burn = err / (1 - slo)                               # how many times faster than allowed
    print(f"failing {err:.1%} of requests: burn rate {burn:4.1f}x -&gt; budget gone in {days / burn:4.1f} days")</div>
  <div class="fx" data-lang="text">expected false alerts/day: 1.0
P(at least one false alert today): 63.4%
with a 3-in-a-row rule: 1e-04 false alerts/day

SLO 99.9% over 30 days -&gt; error budget 43.2 minutes of failure
failing 0.1% of requests: burn rate  1.0x -&gt; budget gone in 30.0 days
failing 0.5% of requests: burn rate  5.0x -&gt; budget gone in  6.0 days
failing 2.0% of requests: burn rate 20.0x -&gt; budget gone in  1.5 days</div>
  <p>The first block shows why naive alerting fails. With 100 drift checks a day, each with a 1% chance of firing by accident, we expect one false alert every day and have a 63.4% chance of at least one on any given day. Within a week nobody reads them. Requiring a breach to <strong>persist</strong> for three consecutive windows before alerting cuts the false rate to about one in 10,000 days (assuming windows are independent), because noise rarely repeats three times in a row while a real problem does.</p>
  <p>The second block is the SLO arithmetic. A 99.9% target over 30 days allows 0.1% × 30 days = 43.2 minutes of failure a month. If the service is currently failing 0.1% of requests, the burn rate is 1×, and the budget lasts exactly the month. At 0.5% the burn rate is 5×, the budget is gone in 6 days, and a ticket is appropriate. At 2% the burn rate is 20×, the budget is gone in 1.5 days, and someone should be paged now. Alerting on burn rate rather than on raw error rate is the standard SRE practice because it ties urgency to how much of the agreed tolerance is at stake.</p>
  <p>ML systems add model SLOs beside the system ones, for example "late rate of matured hourly cohorts at most 45%" or "fallback rate at most 1%". A few rules keep model alerts useful. Compare with the right baseline, respecting seasonality: Friday at 20:00 against last Friday at 20:00, not against Tuesday afternoon. Page on symptoms (error rate, latency over budget, a sudden spike in a feature's null rate, a burning SLO), and file tickets for slow drift such as a km PSI of 0.13. And weight drift alerts by feature importance, since a shift in the most important feature matters far more than one in a feature the model barely uses.</p>

  <h2 id="sm-report"><span class="num">07</span>Drift Reports and Evidently</h2>
  <p>Section 03 computed PSI on four hand-made bins for one feature. In production a scheduled job does this every night for every feature and for the model's output, compares against a frozen <strong>reference window</strong> (a sample of the training data, or a recent period known to be healthy), and produces a <strong>drift report</strong>: one line per column with a score and a status. It works like a medical check-up sheet, where each line is a test with a normal range and anything out of range is flagged in red for the doctor to read first. Here is such a report written with pandas. The reference is a training-time sample; "current" is today's logged traffic, in which the radius grew (km × 1.3), the monsoon arrived (rain 10% → 40%) and queue and hour are unchanged. <code>eta_pred</code> is the model's output, logged by the serving service:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd

def psi(e, a, bins=10):
    if e.nunique() &lt;= 10:                       # categorical / binary: one bin per value
        cats = sorted(set(e) | set(a))
        pe = np.clip(np.array([(e == c).mean() for c in cats]), 1e-6, None)
        pa = np.clip(np.array([(a == c).mean() for c in cats]), 1e-6, None)
        return float(np.sum((pa - pe) * np.log(pa / pe)))
    edges = np.unique(np.quantile(e, np.linspace(0, 1, bins + 1)))
    edges[0], edges[-1] = -np.inf, np.inf
    pe = np.clip(np.histogram(e, edges)[0] / len(e), 1e-6, None)
    pa = np.clip(np.histogram(a, edges)[0] / len(a), 1e-6, None)
    return float(np.sum((pa - pe) * np.log(pa / pe)))

# ref: a frozen sample from training time.  cur: today's logged traffic.
rng = np.random.default_rng(1)
n = 20_000
ref = pd.DataFrame({"km": rng.gamma(2.2, 1.4, n), "queue": rng.poisson(4, n),
                    "rain": (rng.random(n) &lt; 0.10).astype(int), "hour": rng.integers(11, 23, n)})
cur = pd.DataFrame({"km": rng.gamma(2.2, 1.4, n) * 1.3,            # delivery radius grew
                    "queue": rng.poisson(4, n),                       # unchanged
                    "rain": (rng.random(n) &lt; 0.40).astype(int),       # monsoon
                    "hour": rng.integers(11, 23, n)})                 # unchanged
eta = lambda d: 13.87 + 3.25 * d.km + 2.42 * d.queue + 8.71 * d.rain  # the model's output
ref["eta_pred"], cur["eta_pred"] = eta(ref), eta(cur)

def status(p): return "ALERT" if p &gt; 0.25 else "watch" if p &gt; 0.1 else "ok"
rep = pd.DataFrame({"psi": {c: psi(ref[c], cur[c]) for c in ref}}).round(3)
rep["status"] = rep["psi"].map(status)
print(rep.sort_values("psi", ascending=False))</div>
  <div class="fx" data-lang="text">            psi status
rain      0.534  ALERT
eta_pred  0.299  ALERT
km        0.134  watch
queue     0.001     ok
hour      0.000     ok</div>
  <p>The function bins continuous columns by the reference deciles and gives columns with ten or fewer distinct values one bin per value. The report sorts by PSI. Rain jumped the most (0.534, ALERT), and it only appears because binary columns get one bin per value. The model's output moved too (0.299, ALERT): that is prediction drift, visible without a single label. Distance is in the "watch" zone at 0.134, close to the 0.128 we computed by hand. Queue and hour did not move. The on-call engineer's next steps would be to confirm that the rain change is real (the monsoon, not a broken weather feed), then check the matured late rate per rain slice before deciding anything about retraining. A report like this needs an owner and a written next step for every ALERT line, or it becomes wallpaper.</p>
  <p>Writing this by hand is instructive, but teams usually use a library. <strong>Evidently</strong> is a popular open-source one: given reference and current DataFrames it chooses a suitable test per column, computes drift scores, and renders an interactive HTML report (it also runs as a monitoring service with dashboards). It installs with pip; we ran it in its own virtual environment on the same two DataFrames:</p>
  <div class="fx" data-lang="py">from evidently import Report
from evidently.presets import DataDriftPreset
from evidently.metrics import ValueDrift
from data import ref, cur          # the same frozen reference and today's traffic as above

# 1) The preset: Evidently picks a test per column from its type and the sample size
snapshot = Report([DataDriftPreset()]).run(reference_data=ref, current_data=cur)
for m in snapshot.dict()["metrics"]:
    print(m["metric_name"], "-&gt;", m["value"] if isinstance(m["value"], dict) else round(m["value"], 4))
snapshot.save_html("drift_report.html")              # the interactive report people open

# 2) Asking for PSI explicitly, to compare with our own report
psi = Report([ValueDrift(column=c, method="psi") for c in ["rain", "eta_pred", "km"]])
for m in psi.run(reference_data=ref, current_data=cur).dict()["metrics"]:
    print(m["metric_name"], "-&gt;", round(m["value"], 3))</div>
  <div class="fx" data-lang="text">DriftedColumnsCount(drift_share=0.5) -&gt; {'count': 3.0, 'share': 0.6}
ValueDrift(column=km,method=Wasserstein distance (normed),threshold=0.1) -&gt; 0.4406
ValueDrift(column=queue,method=Wasserstein distance (normed),threshold=0.1) -&gt; 0.0149
ValueDrift(column=hour,method=Wasserstein distance (normed),threshold=0.1) -&gt; 0.0108
ValueDrift(column=eta_pred,method=Wasserstein distance (normed),threshold=0.1) -&gt; 0.6296
ValueDrift(column=rain,method=Jensen-Shannon distance,threshold=0.1) -&gt; 0.2506
ValueDrift(column=rain,method=psi,threshold=0.1) -&gt; 0.534
ValueDrift(column=eta_pred,method=psi,threshold=0.1) -&gt; 0.325
ValueDrift(column=km,method=psi,threshold=0.1) -&gt; 0.163</div>
  <p>The first line is the summary: 3 of the 5 columns (60%) drifted. The <code>DataDriftPreset</code> picked the test per column automatically. For continuous columns with this many rows it used the normalised <strong>Wasserstein distance</strong> (roughly, how far, in units of the reference spread, the probability mass would have to move to turn one distribution into the other), flagging km (0.44) and eta_pred (0.63) above its 0.1 threshold while queue and hour stay near 0.01. For the binary rain column it used the Jensen–Shannon distance (0.25). Asked for PSI explicitly, Evidently agrees with our report on rain (0.534) but gives 0.325 for eta_pred and 0.163 for km where ours gave 0.299 and 0.134, because it chooses bins differently. That difference is a useful lesson in itself: a PSI value only means something together with its binning, so pick one implementation and keep it fixed, or thresholds will mean different things on different days. The <code>save_html</code> call writes the shareable report with per-column histograms, which is what people actually open.</p>

  <h2 id="sm-retrain"><span class="num">08</span>Retraining Triggers</h2>
  <p>The alert fired, the investigation confirmed that the model is genuinely worse (matured late rate 57%, with Kothrud errors far above the rest of the city), and the fix is a model trained on recent data. "Retrain" sounds like running <code>train.py</code> again, but three decisions hide behind it: when to retrain, on which window of data, and what stops a bad retrain from reaching users.</p>
  <p>There are three common answers to "when". <strong>Scheduled retraining</strong> runs every day or week regardless; it is simple and predictable, but it may waste compute when nothing changed and react slowly when something changes suddenly. <strong>Triggered retraining</strong> starts when monitoring crosses a threshold, such as PSI above 0.25 on a top feature or a model SLO burning; it is efficient but only as reliable as the monitoring behind it. <strong>Continual (online) learning</strong> updates the model incrementally every few minutes or hours on fresh data; it is common for ads and news feeds where tastes shift by the hour, but much harder to validate. Many teams combine the first two: a weekly schedule plus emergency triggers.</p>
  <p>The training window is the second decision. A <strong>sliding window</strong> trains on the most recent N weeks, so it adapts quickly but forgets rare events such as last year's monsoon. An <strong>expanding window</strong> trains on all history, so it is stable and remembers rare events but adapts slowly. A common compromise is an expanding window that gives more weight to recent rows. We compare the two in the next section.</p>
  <p>The third decision is the most important: a retraining pipeline must have gates, because an automatic retrain on bad data bakes the bug into the model. Imagine the weather feed broke for a week and the pipeline filled every missing value with 0 ("not raining"). A model retrained on that week learns that rain does not exist. The first gate is therefore <strong>data validation</strong>: before training, check row counts, schemas, ranges, null rates and whether any column has suddenly become constant (libraries such as Great Expectations and pandera formalise this). Here is a small validation function run on a genuine monsoon week and on a week with the broken feed:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd

rng = np.random.default_rng(3)
def week(n, rain_share, broken_feed=False):
    df = pd.DataFrame({"km": rng.gamma(2.2, 1.4, n), "queue": rng.poisson(4, n).astype(float),
                       "rain": (rng.random(n) &lt; rain_share).astype(float)})
    if broken_feed:                       # weather API returned nothing; the pipeline filled 0
        df["rain"] = 0.0
    df.loc[rng.random(n) &lt; 0.002, "queue"] = np.nan
    return df

ref = week(20_000, 0.10)                  # what training data normally looks like
def validate(new, ref):
    problems = []
    if len(new) &lt; 0.5 * len(ref):
        problems.append(f"row count {len(new):,} &lt; half of usual")
    for c in ref:
        if new[c].isna().mean() &gt; 0.01:
            problems.append(f"{c}: {new[c].isna().mean():.1%} nulls")
        if ref[c].nunique() &gt; 1 and new[c].nunique() == 1:
            problems.append(f"{c}: constant value {new[c].iloc[0]}")
    if (new["km"] &lt; 0).any() or new["km"].max() &gt; 25:
        problems.append("km out of range")
    return problems or ["ok - safe to train"]

print("monsoon week     :", validate(week(19_000, 0.40), ref))
print("broken-feed week :", validate(week(19_000, 0.40, broken_feed=True), ref))</div>
  <div class="fx" data-lang="text">monsoon week     : ['ok - safe to train']
broken-feed week : ['rain: constant value 0.0']</div>
  <p>The monsoon week has far more rain than the reference (40% against 10%), but rain is still a varying, sensible column, so validation passes: real drift is exactly what retraining should learn from. The broken-feed week is caught because rain has become a constant 0.0, something that never happens in real data, and the pipeline stops before training. The distinction matters: validation should block data that is <em>broken</em>, not data that is merely <em>different</em>. After validation the pipeline trains the candidate, compares it with the current model (next section), registers it with its data, code and metrics in a model registry such as <a class="xref" data-note="mlops_mlflow">MLflow</a> so it can be rolled back, and sends it through shadow and canary before it serves everyone.</p>
  <div class="flow"><span>Trigger</span><span>Pull data (point-in-time)</span><span>Validate data</span><span>Train</span><span>Champion vs challenger</span><span>Register</span><span>Shadow / canary</span><span>Promote</span></div>

  <h2 id="sm-champ"><span class="num">09</span>Champion and Challenger</h2>
  <p>A freshly trained model is not automatically better. It might have learnt from a quiet week, it might be worse on one city while better on average, or it might simply be noise. Before it replaces anything it must prove itself against the model already in production. That production model is called the <strong>champion</strong>, and the candidate is the <strong>challenger</strong>. The rule of the comparison is that both are scored on the <em>same</em> most recent data, which neither was trained on, overall and per slice. It is like a cricket team's opening batsman, who keeps his place until a challenger outscores him in the same recent matches, and not just on average: a challenger who keeps failing against spin is not picked for the Chennai test.</p>
  <p>The simulation has 67 days of orders. From day 50, the metro works make every km in Kothrud (zone 0) cost 1.5 minutes more. The champion was trained on days 1–45, before the works. Two challengers are trained: one on a sliding window of the last 45 days (16–60) and one on an expanding window of all 60 days. All three are scored on days 61–67, and a promotion rule requires the challenger to beat the champion by at least 0.10 minutes overall without being more than 0.20 minutes worse on any slice:</p>
  <div class="fx" data-lang="py">import numpy as np, lightgbm as lgb

rng = np.random.default_rng(11)
def make(days):
    n = len(days)
    zone = rng.integers(0, 4, n)                         # zone 0 = Kothrud
    km = np.clip(rng.gamma(2.2, 1.4, n), 0.3, 9); q = rng.poisson(4, n)
    rain = (rng.random(n) &lt; 0.2).astype(int)
    per_km = 3.0 + 2.0 * rain + np.where((zone == 0) &amp; (days &gt; 50), 1.5, 0.0)   # metro works from day 50
    y = 12 + km * per_km + 1.3 * q + rng.gamma(2, 1.5, n)
    return np.c_[km, q, rain, zone], y, zone

days = np.repeat(np.arange(1, 68), 300)                  # 67 days x 300 orders
X, y, zone = make(days)
fit = lambda m: lgb.LGBMRegressor(n_estimators=300, n_jobs=1, verbose=-1, random_state=0).fit(X[m], y[m])
models = {
    "champion":   fit(days &lt;= 45),                       # in production, trained before the metro works
    "sliding":    fit((days &gt; 15) &amp; (days &lt;= 60)),       # challenger A: the last 45 days only
    "expanding":  fit(days &lt;= 60),                       # challenger B: all 60 days
}
test = days &gt; 60                                         # the newest week: unseen by every model

print(f"{'model':&lt;11}{'MAE all':&gt;8}{'Kothrud':&gt;9}{'others':&gt;8}{'late':&gt;7}")
res = {}
for name, m in models.items():
    e = y[test] - m.predict(X[test]); k = zone[test] == 0
    res[name] = (np.abs(e).mean(), np.abs(e[k]).mean(), np.abs(e[~k]).mean())
    print(f"{name:&lt;11}{res[name][0]:&gt;8.2f}{res[name][1]:&gt;9.2f}{res[name][2]:&gt;8.2f}{np.mean(e &gt; 0):&gt;7.0%}")

c = res["champion"]
for name in ["sliding", "expanding"]:
    ch = res[name]
    promote = (c[0] - ch[0] &gt;= 0.10) and all(ch[i] &lt;= c[i] + 0.20 for i in (1, 2))   # better, no slice worse
    print(f"promote {name}: {promote}")</div>
  <div class="fx" data-lang="text">model       MAE all  Kothrud  others   late
champion       2.49     4.61    1.72    57%
sliding        2.25     3.71    1.72    56%
expanding      2.30     3.95    1.70    56%
promote sliding: True
promote expanding: True</div>
  <p>Outside Kothrud all three models are equal (about 1.7 minutes), because nothing changed there. In Kothrud the champion is 4.61 minutes off. The sliding-window challenger, which saw ten days of the new road conditions within a 45-day window, gets 3.71; the expanding-window challenger saw the same ten days but diluted among 60, so it gets 3.95. Both pass the promotion rule, and the sliding window is the stronger candidate here because the change is recent and permanent; if the change were seasonal and likely to return next year, the expanding window's memory would be worth more. The late rate barely moves (57% to 56%), which is worth noticing: retraining fixes drift in the predictions, not the fact that a model aiming at the middle is late half the time. That is a product decision about adding a buffer or predicting a higher quantile, covered in <a class="xref" data-note="sd_framework">the framework note</a>.</p>
  <p>Passing the offline comparison promotes the challenger to the next stage, not to every user. An offline comparison on logged data cannot show how customers and riders react to different ETAs, so the challenger goes through shadow and canary (<a class="xref" data-note="sd_serving">Serving</a>) and then an A/B test on on-time rate and conversion (<a class="xref" data-note="sd_experiments">Experiments</a>). If the challenger fails anywhere along the way, the champion simply stays, and that safety is the purpose of the whole process. The pipeline itself, with its registry, automation and rollback, is covered in <a class="xref" data-note="mlops_lifecycle">the MLOps lifecycle</a> and <a class="xref" data-note="mlops_cicd">CI/CD for ML</a>.</p>

  <h2 id="sm-traps"><span class="num">10</span>Common Mistakes</h2>
  <p>A very common drift-monitoring bug is applying decile bins to a binary feature. The deciles of a column of 0s and 1s are all 0 or 1, so the bin edges collapse and every row falls into a single bin. PSI then reads zero even when rain quadrupled:</p>
  <div class="fx" data-lang="py">import numpy as np

rng = np.random.default_rng(0)
rain_train = (rng.random(20_000) &lt; 0.10).astype(int)
rain_now   = (rng.random(20_000) &lt; 0.40).astype(int)

edges = np.unique(np.quantile(rain_train, np.linspace(0, 1, 11)))   # deciles of a 0/1 column
print("decile edges:", edges)                                         # collapse to just 0 and 1
edges[0], edges[-1] = -np.inf, np.inf
pe = np.histogram(rain_train, edges)[0] / 20_000; pa = np.histogram(rain_now, edges)[0] / 20_000
print("PSI with decile bins:", round(float(np.sum((pa - pe) * np.log(pa / pe))), 3))

pe = np.array([1 - rain_train.mean(), rain_train.mean()]); pa = np.array([1 - rain_now.mean(), rain_now.mean()])
print("PSI with one bin per value:", round(float(np.sum((pa - pe) * np.log(pa / pe))), 3))</div>
  <div class="fx" data-lang="text">decile edges: [0. 1.]
PSI with decile bins: 0.0
PSI with one bin per value: 0.519</div>
  <p>The decile edges come out as just [0, 1], which after opening the outer edges to infinity leaves one bin containing everything, so PSI is 0.0. With one bin per value, the same data gives 0.519, a major shift. Binary and categorical features always need one bin per category (or a chi-square or JS test).</p>
  <p>The second mistake is alerting on KS p-values at production volume. As section 04 showed, a half-minute shift becomes "certain" at 500,000 rows, so every feature is "significant" every day and the alerts become noise. Alert on effect sizes (PSI, D, Wasserstein) with thresholds, or run the test on a fixed-size subsample.</p>
  <p>The third is computing today's accuracy from "labels so far". Early labels are the fast, easy orders, so a degrading model looks healthy (11.4% late at 20:30 against 47.0% when mature). Report accuracy per cohort, only after it has matured, and track the censored part (cancellations) separately.</p>
  <p>Three more come up in design reviews. Monitoring only the system layer misses every silent failure. Treating "no input drift" as "the model is fine" misses concept drift, which leaves inputs untouched. And auto-retraining without a validation gate, or promoting a challenger on the overall number alone, lets a broken feed or a slice regression reach users.</p>

  <h2 id="sm-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Why monitor</h3>
  <ul>
    <li><b>Silent failure</b>: a model returns fast, valid responses that are wrong. System metrics stay green.</li>
    <li><b>Four layers</b>: system (latency, errors), data (nulls, PSI), model (prediction distribution, accuracy), business (cancellations, support contacts).</li>
  </ul>
  <h3>Kinds of drift</h3>
  <table class="tbl">
    <tr><th>Drift</th><th>What changes</th><th>Biteful example</th><th>Detect with</th><th>Hurts?</th></tr>
    <tr><td>Data (covariate)</td><td>P(x)</td><td>Longer trips, more rain</td><td>PSI, KS (no labels)</td><td>Not necessarily (MAE 1.63 → 1.73)</td></tr>
    <tr><td>Concept</td><td>P(y | x)</td><td>Metro works: +1.5 min/km</td><td>Labelled error by slice</td><td>Yes (MAE 1.63 → 4.69, inputs unchanged)</td></tr>
    <tr><td>Prediction</td><td>P(ŷ)</td><td>Mean ETA 30.0 → 33.5</td><td>Output PSI (no labels)</td><td>A signal, not proof</td></tr>
    <tr><td>Label</td><td>P(y)</td><td>Longer deliveries overall</td><td>Label distribution</td><td>Depends</td></tr>
  </table>
  <h3>Formulas and thresholds</h3>
  <table class="tbl">
    <tr><th>Formula</th><th>Example</th></tr>
    <tr><td>PSI = Σ (a − e) · ln(a / e)</td><td>0.0405 + 0.0067 + 0.0112 + 0.0693 = 0.128; &lt;0.1 ok, 0.1–0.25 investigate, &gt;0.25 act</td></tr>
    <tr><td>KS: D = max |F<sub>1</sub>(x) − F<sub>2</sub>(x)|</td><td>x = 3: 0.625 − 0.250 = 0.375 (p = 0.66 with n = 8)</td></tr>
    <tr><td>P(≥1 false alert) = 1 − (1 − p)<sup>n</sup></td><td>1 − 0.99<sup>100</sup> = 63.4%</td></tr>
    <tr><td>Persistence: p<sup>k</sup></td><td>100 × 0.01<sup>3</sup> = 0.0001 false alerts/day</td></tr>
    <tr><td>Error budget = (1 − SLO) × period</td><td>0.001 × 43,200 min = 43.2 min</td></tr>
    <tr><td>Burn rate = failure rate ÷ (1 − SLO)</td><td>2% ÷ 0.1% = 20× → budget gone in 1.5 days</td></tr>
  </table>
  <h3>Key terms</h3>
  <ul>
    <li><b>ECDF</b>: share of values ≤ x. <b>Effect size</b> (D, PSI) vs <b>p-value</b>: how big vs how sure.</li>
    <li><b>Label delay</b>, <b>mature cohort</b> (old enough that labels have arrived), <b>censored label</b> (never observed).</li>
    <li><b>Proxy metric</b>: early signal that tracks the label (taps: correlation 0.96).</li>
    <li><b>SLI</b> measured indicator, <b>SLO</b> its target, <b>page</b> vs <b>ticket</b>.</li>
    <li><b>Reference window</b>: frozen data drift is measured against.</li>
    <li><b>Scheduled / triggered / continual</b> retraining; <b>sliding</b> vs <b>expanding</b> window.</li>
    <li><b>Champion</b> (production) vs <b>challenger</b> (candidate), compared on the same newest unseen data, by slice.</li>
  </ul>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from scipy import stats
stats.ks_2samp(reference, current)            # .statistic = D, .pvalue

def psi(e, a, bins=10):                       # deciles of the REFERENCE
    edges = np.quantile(e, np.linspace(0, 1, bins + 1)); edges[0], edges[-1] = -np.inf, np.inf
    pe = np.clip(np.histogram(e, edges)[0] / len(e), 1e-6, None)
    pa = np.clip(np.histogram(a, edges)[0] / len(a), 1e-6, None)
    return np.sum((pa - pe) * np.log(pa / pe))

from evidently import Report
from evidently.presets import DataDriftPreset
Report([DataDriftPreset()]).run(reference_data=ref, current_data=cur).save_html("drift.html")</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Decile bins on a binary feature: PSI 0.0 instead of 0.519.</li>
    <li>KS p-values at scale are always tiny; alert on effect size.</li>
    <li>Accuracy from labels so far is biased towards easy cases; wait for maturity.</li>
    <li>No input drift does not mean no problem (concept drift).</li>
    <li>PSI depends on binning (ours 0.134, Evidently 0.163 for km): keep one implementation.</li>
    <li>Validate data before retraining; promote on slices, then shadow → canary → A/B.</li>
  </ul>

  <h2 id="sm-qa"><span class="num">11</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't ordinary server monitoring tell you that a model is broken?</summary><div class="qa-body">A stale or badly fed model still responds quickly with valid outputs and status 200, so latency and error dashboards stay green. The failure is in the content of the predictions. You need data checks (nulls, distributions), prediction-distribution checks and, once labels arrive, accuracy and business metrics on top of system metrics.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between data drift and concept drift? Give an example of each.</summary><div class="qa-body">Data drift is a change in the input distribution P(x) with the input-output relationship unchanged, for example longer trips after the delivery radius grows. Concept drift is a change in P(y | x), so the same inputs now have a different correct answer, for example road works making the same distance take longer. Data drift may not hurt if the model already handles the new inputs; concept drift always hurts and can only be confirmed with labels.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is model drift or model decay?</summary><div class="qa-body">It is the everyday name for a deployed model's performance getting worse over time. It is a consequence, not a cause: data drift, concept drift, label drift, upstream pipeline changes or training-serving skew can all produce it. Diagnosing which one is responsible decides the fix.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you compute PSI, and how do you interpret it?</summary><div class="qa-body">Bin the reference data (usually by its deciles; one bin per category for categorical features), apply the same edges to the current data, compute each bin's share e (reference) and a (current), replace zeros with a tiny value, and sum (a − e) · ln(a / e). Below 0.1 is usually no meaningful shift, 0.1 to 0.25 is worth investigating, and above 0.25 is a major shift. The thresholds are conventions, and the value depends on the binning.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the KS test measure, and what is its weakness in production?</summary><div class="qa-body">It compares two samples through their empirical CDFs; the statistic D is the largest vertical gap between them, and the p-value says how likely such a gap is if both come from the same distribution. Its weakness is sample size: with hundreds of thousands of rows even trivial shifts give tiny p-values, so every feature looks drifted every day. Use D or another effect size with a threshold, or test a fixed-size subsample.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Every KS test on your dashboard shows p &lt; 0.001. What is wrong?</summary><div class="qa-body">Probably nothing is wrong with the data; the tests are overpowered. At production volumes a half-minute shift is "certain" statistically while being irrelevant practically. Switch the alert rule to effect sizes such as PSI, KS D or Wasserstein distance with thresholds, and weight alerts by feature importance.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is KL divergence awkward for drift monitoring, and what do people use instead?</summary><div class="qa-body">KL divergence is asymmetric (KL(p‖q) ≠ KL(q‖p)) and becomes infinite when the reference has zero probability in a bin where current data has some. PSI symmetrises it, and Jensen–Shannon divergence both symmetrises and bounds it between 0 and 1, which makes both easier to threshold.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Prediction drift fired but no input feature drifted. What could cause that?</summary><div class="qa-body">A shift in the combination of features that per-feature tests miss, a feature that is not monitored, a new model version or configuration deploy, a change in traffic mix (a new city), or a changed default value for missing features. Check recent deploys and the served feature logs first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your labels arrive 60 days late (fraud). How do you know the model is degrading this week?</summary><div class="qa-body">Watch input and score drift, decline and manual-review rates, dispute counts and analyst-labelled samples as proxies, and validate those proxies against history. Confirm with chargeback-based metrics cohort by cohort as they mature, and keep a small random holdout reviewed quickly by analysts to get faster labels.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can early labels give a misleading picture of model performance?</summary><div class="qa-body">Labels do not arrive at random. For ETA the quick deliveries finish first, so early labels over-represent easy cases; in our simulation the late rate looked like 11.4% at 20:30 but was 47.0% once mature. Some labels never arrive (cancellations) and those are concentrated where the model is worst. Evaluate cohorts only after maturity and track censoring separately.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a proxy metric, and how do you choose a good one?</summary><div class="qa-body">A proxy is an early signal that moves together with the true metric, used while labels are delayed, such as "where is my order?" taps for ETA lateness or clicks for purchases. A good proxy arrives quickly, is hard to game, and is validated on history to track the true metric (taps correlated 0.96 with late rate, cancellations only 0.61). Use proxies for early warning, not for final decisions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are an SLO, an error budget and a burn rate?</summary><div class="qa-body">An SLO is a target for a measured indicator, such as 99.9% of requests succeeding within 60 ms over 30 days. The error budget is the failure that target allows, here 43.2 minutes a month. The burn rate is the current failure rate divided by the allowed rate; at 20× the monthly budget is gone in 1.5 days, which justifies a page, while 5× might only justify a ticket.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you avoid alert fatigue in ML monitoring?</summary><div class="qa-body">Alert on symptoms rather than causes, require breaches to persist for several windows, compare against seasonal baselines, use effect sizes instead of p-values, prioritise by feature importance, and split severity into pages (user-facing, urgent) and tickets (slow drift). Every alert should have an owner and a documented next step.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Scheduled vs triggered retraining: when would you use each?</summary><div class="qa-body">Scheduled retraining suits steady, predictable change and keeps operations simple. Triggered retraining suits bursty change or expensive training, retraining only when monitoring shows a real shift or degradation. Most teams combine a regular schedule with emergency triggers, and use continual learning only where data shifts within hours, such as ads.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Sliding window or expanding window for retraining?</summary><div class="qa-body">A sliding window (the last N weeks) adapts quickly to recent, permanent changes but forgets rare or seasonal events. An expanding window (all history) is stable and remembers seasonality but adapts slowly. A common compromise is all history with higher weight on recent data; in our simulation the sliding window won (Kothrud MAE 3.71 vs 3.95) because the change was recent and permanent.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is champion–challenger evaluation?</summary><div class="qa-body">The production model (champion) and a newly trained candidate (challenger) are scored on the same most recent data that neither trained on, overall and per important slice, with a predefined promotion rule (for example, better overall by a margin and no slice worse by more than a tolerance). The winner then goes through shadow, canary and an A/B test before full promotion; if the challenger loses, the champion stays.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your automated retraining pipeline promoted a worse model. Which safeguards were missing?</summary><div class="qa-body">Data validation before training (to catch broken feeds such as a column that became constant), a champion–challenger comparison on the same held-out recent data with slice checks, label maturity in the evaluation data, and a shadow or canary stage with automatic rollback before full promotion. A model registry with versioned data and code makes the rollback itself quick.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Design the monitoring for an ETA prediction model.</summary><div class="qa-body">System: p99 latency, error and fallback rates, with SLOs and burn-rate alerts. Data: null rates and nightly PSI per feature against a training reference, with one bin per category for binary features, weighted by importance. Model: distribution of predicted ETAs, and matured-cohort MAE, late rate and P90 error by city, rain and new restaurants. Business and proxies: cancellations, "where is my order?" taps, support contacts. Persistent drift creates tickets, symptoms page, and confirmed degradation triggers a validated retrain evaluated champion versus challenger.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does good monitoring depend on the serving system logging its features?</summary><div class="qa-body">Drift reports compare training-time feature values with the values serving actually used. Without logs of the exact served feature vectors you can only compare raw upstream data, which misses training-serving skew and default-value bugs. The same logs, joined with labels later, also become the next training set, so training matches serving by construction.</div></details>
</main>
`
});
