// notes/systemdesign/sd_monitoring.js — Monitoring, Drift & Retraining
Object.assign(TOPIC_CONTENT, {
  "sd_monitoring": `<main>
<h1>Monitoring, Drift &amp; Retraining</h1>
  <div class="where"><span>ML System Design</span><span>Monitoring</span></div>
  <p class="lead">Biteful's ETA model is serving: 60 ms, fallback ready, skew fixed, released through shadow and canary. It was trained in March. In July the monsoon arrives, the delivery radius grows to 10 km, and metro works close roads in Kothrud. The service still answers fast with "200 OK". Only the answers are worse. This note follows the need to notice that: what can drift, how to put a number on drift (PSI and the KS test, by hand), why the truth arrives late, when an alert should wake someone, and how to retrain without making things worse (champion vs challenger). Same running example: Biteful's ETA and orders 101–108.</p>

  <h2 id="sm-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 130" width="680">
    <defs><marker id="sm-t0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="8" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="69" y="42" text-anchor="middle" font-size="12">1 Framework</text><text x="69" y="58" text-anchor="middle" font-size="10" class="tm">the whole path once</text>
    <rect x="145" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="206" y="42" text-anchor="middle" font-size="12">2 Serving</text><text x="206" y="58" text-anchor="middle" font-size="10" class="tm">answer in 60 ms</text>
    <rect x="282" y="22" width="122" height="46" rx="6" class="fg sg" stroke-width="2.5"/><text x="343" y="42" text-anchor="middle" font-size="12" font-weight="700">3 Monitoring</text><text x="343" y="58" text-anchor="middle" font-size="10" class="tm">still right next month?</text>
    <rect x="419" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="480" y="42" text-anchor="middle" font-size="12">4 Experiments</text><text x="480" y="58" text-anchor="middle" font-size="10" class="tm">is v2 really better?</text>
    <rect x="556" y="22" width="116" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="614" y="42" text-anchor="middle" font-size="12">5 Case studies</text><text x="614" y="58" text-anchor="middle" font-size="10" class="tm">four full designs</text>
    <line x1="130" y1="45" x2="143" y2="45" stroke="currentColor" marker-end="url(#sm-t0)"/>
    <line x1="267" y1="45" x2="280" y2="45" stroke="currentColor" marker-end="url(#sm-t0)"/>
    <line x1="404" y1="45" x2="417" y2="45" stroke="currentColor" marker-end="url(#sm-t0)"/>
    <line x1="541" y1="45" x2="554" y2="45" stroke="currentColor" marker-end="url(#sm-t0)"/>
    <text x="340" y="96" text-anchor="middle" font-size="11">One story across all five notes: Biteful's delivery-time (ETA) prediction</text>
    <text x="340" y="114" text-anchor="middle" font-size="11" class="tm">this note: March model, July world — monsoon, a bigger radius, metro works</text>
  </svg><figcaption>The ML System Design track in reading order. You are on the green note. Monitoring comes before experiments because a retrained challenger is what experiments then test.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="sd_serving">Serving</a></b><span>A model that answers in 60 ms, logs every served ETA with its features, and was released safely. Serving ended with a skew check (PSI 0.19 on km); this note makes that check routine. Statistics behind it: <a class="xref" data-note="st_hypothesis">Hypothesis Testing</a>; observability basics: <a class="xref" data-note="api_production">Production Backend</a>.</span></li>
    <li><b>This note adds: knowing when the model is wrong</b><span>Four monitoring layers, four kinds of drift, PSI and KS computed by hand, delayed and censored labels, alerts and SLOs without noise, retraining triggers and the champion–challenger gate.</span></li>
    <li><b>Leads to: <a class="xref" data-note="sd_experiments">Shadow, Canary &amp; A/B Infrastructure</a></b><span>A challenger that wins offline must still win online. Experiments tests it on real users; the retraining pipeline itself is <a class="xref" data-note="mlops_lifecycle">MLOps</a> territory (<a class="xref" data-note="mlops_mlflow">registry</a>, <a class="xref" data-note="mlops_cicd">CI/CD</a>).</span></li>
  </ol>

  <h2 id="sm-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The note as one chain. Running example: Biteful's ETA model (v12), trained in March on orders like 101–108 (km 2, 4, 3, 5, 1, 6, 3, 2). In July: monsoon (rain 10% → 40% of orders), radius 8 → 10 km, and metro works in Kothrud slowing every km by 1.5 minutes.</p>
  <ol class="story">
    <li><b>Why models go stale</b><span>Q: the code didn't change — why is the ETA worse? → the world moved; a model is a map of the training data. Ordinary uptime checks see nothing. So what exactly can move?</span></li>
    <li><b>What can drift</b><span>Q: which part changed? → data drift P(x) (radius, rain), concept drift P(y | x) (metro: same km, more minutes), label drift P(y), prediction drift P(ŷ). Only labels prove concept drift. But "inputs moved" must become a number…</span></li>
    <li><b>PSI by hand</b><span>Q: how far did the km distribution move? → bin shares 30/40/20/10% → 20/35/25/20%: PSI = 0.0405 + 0.0067 + 0.0112 + 0.0693 = 0.128, "investigate". PSI needs bins; is there a test with no binning and a p-value?</span></li>
    <li><b>KS test</b><span>Q: are two samples from the same distribution? → largest gap between the two running-share curves: D = 0.375 on 8 vs 8 orders (p 0.66: too few to tell); at 500,000 rows a 0.5-min shift is "certain". Effect size, not p-values. But drift isn't harm; what does the truth say?</span></li>
    <li><b>Delayed labels</b><span>Q: when do we know the real delivery times? → 37.8% labelled after 1 hour, 94.6% eventually, 5.4% never (cancelled); early labels are the fast orders (late rate 11.4% looks great at 20:30, truly 47.0%). Now: when should a number wake someone?</span></li>
    <li><b>Alerts &amp; SLOs</b><span>Q: alert on what, when? → 100 checks at 1% = one false page a day; 3-in-a-row cuts it to 0.0001; a 99.9% SLO allows 43.2 min of failure a month, burn rate shows how fast it is spent. Alert fired — now fix it…</span></li>
    <li><b>Retraining &amp; champion–challenger</b><span>Q: retrain when, and how do we know the new model is better? → triggers + a sliding window; on the newest week the challenger wins (MAE 2.25 vs 2.49; Kothrud 3.71 vs 4.61) and passes the slice rule. Then it goes to <a class="xref" data-note="sd_experiments">experiments</a>.</span></li>
  </ol>

  <h2 id="sm-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Monitoring Biteful's ETA</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why monitor</div>
        <ul>
          <li><b>Silent failure</b> — 200 OK, wrong minutes</li>
          <li><b>Four layers</b> — system, data, model, business</li>
          <li>💡 a 2019 map of Pune: perfect page, missing metro</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">What drifts</div>
        <ul>
          <li><b>Data</b> P(x) — radius, rain share</li>
          <li><b>Concept</b> P(y|x) — metro: +1.5 min/km</li>
          <li><b>Label</b> P(y) — longer deliveries overall</li>
          <li><b>Prediction</b> P(ŷ) — ETAs shift; no labels needed</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Measure it</div>
        <ul>
          <li><b>PSI</b> = Σ (a − e) ln(a/e): 0.128 on km</li>
          <li>&lt;0.1 ok · 0.1–0.25 watch · &gt;0.25 act</li>
          <li><b>KS</b> D = max gap of ECDFs: 0.375</li>
          <li>Huge n → every p tiny: use effect size</li>
          <li>Binary features: one bin per value</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Labels</div>
        <ul>
          <li>ETA: ~1 h delay; fraud: 30–90 days</li>
          <li><b>Censored</b> — cancelled orders never labelled</li>
          <li><b>Early labels biased</b> — fast orders first</li>
          <li>Proxies meanwhile: support calls, drift</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Alerts &amp; SLOs</div>
        <ul>
          <li>100 checks × 1% = 1 false alert/day</li>
          <li><b>Persistence</b> — 3 windows in a row</li>
          <li><b>SLO</b> 99.9%/30 d → 43.2 min budget</li>
          <li><b>Burn rate</b> — 20× → gone in 1.5 days</li>
          <li>Page for symptoms, ticket for slow drift</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Retraining</div>
        <ul>
          <li><b>Scheduled / triggered / continual</b></li>
          <li><b>Gates</b> — validate data, then train</li>
          <li><b>Champion vs challenger</b> on the same newest data</li>
          <li>2.49 → 2.25 MAE; slice rule passed</li>
          <li>Then shadow → canary → A/B</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sm-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Models Go Stale</span><span class="rm-sub">And the four layers to watch</span></div></div>
      <div class="rm-item rm-done" data-target="sm-types"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">What Can Drift</span><span class="rm-sub">Data, concept, label, prediction</span></div></div>
      <div class="rm-item rm-done" data-target="sm-psi"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">PSI by Hand</span><span class="rm-sub">One number per feature</span></div></div>
      <div class="rm-item rm-done" data-target="sm-ks"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The KS Test</span><span class="rm-sub">Gap between two curves</span></div></div>
      <div class="rm-item rm-done" data-target="sm-labels"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Delayed Labels</span><span class="rm-sub">Late, censored, biased truth</span></div></div>
      <div class="rm-item rm-done" data-target="sm-alert"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Alerts &amp; SLOs</span><span class="rm-sub">Wake someone, but rarely</span></div></div>
      <div class="rm-item rm-done" data-target="sm-retrain"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Retraining</span><span class="rm-sub">Triggers, champion vs challenger</span></div></div>
      <div class="rm-item rm-done" data-target="sm-build"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Hands-on: Drift Report</span><span class="rm-sub">PSI per feature, nightly</span></div></div>
      <div class="rm-item rm-done" data-target="sm-connect"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">From drift to a new champion</span></div></div>
      <div class="rm-item rm-done" data-target="sm-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="sm-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="sm-why"><span class="num">01</span>Why Models Go Stale</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In March, Biteful's ETA was late on about 4 orders in 10. In July it is late on almost 6 in 10. Nobody changed the code; the service answers in 30 ms with "200 OK". What happened, and why didn't any server dashboard notice?</p>
  </div>
  <p>Three things happened between March and July:</p>
  <ul>
    <li>The <strong>monsoon</strong> arrived. In March 10% of orders were in rain; now 40%. The model saw few rainy orders in training.</li>
    <li>Biteful grew its <strong>delivery radius</strong> from 8 to 10 km. Long trips the model rarely saw are now common.</li>
    <li><strong>Metro works</strong> closed roads in Kothrud. The same 3 km now takes 4.5 minutes longer. The <em>rule</em> the model learnt stopped being true there.</li>
  </ul>
  <p>In each case the model still runs and still answers. Only the answers are worse. Nobody notices unless someone is <strong>watching the right numbers</strong>. That is <strong>monitoring</strong>, and the general name for "the world moved away from what the model learnt" is <strong>drift</strong>. Normal software monitoring asks "is it up, is it fast?". A model can be up, fast and wrong, so you watch four layers, from the machine up to the money:</p>
  <table class="tbl">
    <tr><th>Layer</th><th>Metrics (Biteful ETA)</th><th>Catches</th><th>Labels needed?</th></tr>
    <tr><td><strong>System</strong></td><td>p99 latency, error rate, QPS, fallback rate (how often the baseline was served)</td><td>Outages, slow features</td><td>No</td></tr>
    <tr><td><strong>Data</strong></td><td>Null rate per feature, schema, ranges, distributions (PSI) of km, queue, rain</td><td>Broken pipelines, drift</td><td>No</td></tr>
    <tr><td><strong>Model</strong></td><td>Distribution of predicted ETAs; MAE, late rate, P90 error once deliveries land</td><td>Decay, concept drift</td><td>Partly</td></tr>
    <tr><td><strong>Business</strong></td><td>Cancellations, "where is my order?" calls, conversion</td><td>What actually matters</td><td>No (but slow, noisy)</td></tr>
  </table>
  <p>What a July dashboard could read: System = "ETA p99 31 ms, 0.1% errors" (fine). Data = "rain = 1 on 40% of orders vs 10% in training". Model = "median predicted ETA up 4 minutes; late rate 57% on yesterday's delivered orders". Business = "support calls about late food up 30%".</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A printed map of Pune from 2019. It still looks perfect: clean, detailed, no errors on the page. But the new flyover and the metro are missing. The map did not change; the city did. A model is a map of the data at training time.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Monitoring</strong>: continuously measuring a deployed model's system health, inputs, outputs and outcomes. <strong>Drift</strong>: change over time in the data or relationships the model depends on. <strong>Silent failure</strong>: wrong outputs with no error signal.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Relying on system monitoring alone. Most ML failures return 200 OK with wrong predictions; only data, model and business checks catch them.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: what can drift.</b> "The world moved" covers three very different stories — new inputs, a new rule, a new mix of outcomes. Which one is happening decides what we can detect without labels and what retraining can fix.</div>

  <h2 id="sm-types"><span class="num">02</span>What Can Drift</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Rain share went up, km went up, and Kothrud got slower. Are these the same kind of change? Can we see each one before the true delivery times arrive?</p>
  </div>
  <p>A little notation keeps them apart. Call the inputs <strong>x</strong> (km, queue, rain), the true answer <strong>y</strong> (actual minutes), and the model's guess <strong>ŷ</strong> ("y-hat", the ETA). <strong>P(x)</strong> means "what inputs usually look like"; <strong>P(y | x)</strong> means "given these inputs, what delivery time to expect" — the rule the model learnt.</p>
  <figure class="viz"><svg viewBox="0 0 762 196" width="762" role="img"><defs><marker id="sm-m1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><text x="125" y="16" text-anchor="middle" font-weight="600">Data drift: P(x) moves</text><path d="M15.0,138.9 L20.3,138.1 L25.7,136.7 L31.0,134.5 L36.3,131.2 L41.7,126.5 L47.0,120.1 L52.3,112.0 L57.7,102.3 L63.0,91.2 L68.3,79.4 L73.7,67.9 L79.0,57.8 L84.3,50.1 L89.7,45.8 L95.0,45.3 L100.3,48.7 L105.7,55.6 L111.0,65.2 L116.3,76.5 L121.7,88.3 L127.0,99.6 L132.3,109.7 L137.7,118.3 L143.0,125.0 L148.3,130.1 L153.7,133.8 L159.0,136.2 L164.3,137.8 L169.7,138.8 L175.0,139.3 L180.3,139.7 L185.7,139.8 L191.0,139.9 L196.3,140.0 L201.7,140.0 L207.0,140.0 L212.3,140.0 L217.7,140.0 L223.0,140.0" stroke="currentColor" fill="none" stroke-width="1.4"/><path d="M15.0,139.9 L20.3,139.9 L25.7,139.8 L31.0,139.6 L36.3,139.3 L41.7,138.8 L47.0,138.0 L52.3,136.9 L57.7,135.3 L63.0,133.1 L68.3,130.0 L73.7,126.1 L79.0,121.1 L84.3,115.1 L89.7,108.1 L95.0,100.4 L100.3,92.2 L105.7,84.0 L111.0,76.2 L116.3,69.5 L121.7,64.3 L127.0,61.0 L132.3,60.0 L137.7,61.3 L143.0,64.8 L148.3,70.2 L153.7,77.1 L159.0,85.0 L164.3,93.2 L169.7,101.4 L175.0,109.1 L180.3,115.9 L185.7,121.8 L191.0,126.6 L196.3,130.5 L201.7,133.4 L207.0,135.6 L212.3,137.1 L217.7,138.2 L223.0,138.9" class="st" fill="none" stroke-width="1.4"/><path d="M15,140 H230" stroke="currentColor" fill="none" stroke-width="1.4"/><text x="70" y="158" text-anchor="middle" class="tm">train</text><text x="175" y="158" text-anchor="middle" class="tb">prod</text><text x="125" y="184" text-anchor="middle" class="tm">inputs change, rule same</text><text x="375" y="16" text-anchor="middle" font-weight="600">Concept drift: P(y|x) moves</text><rect x="260" y="30" width="230" height="110" rx="2" class="fs" stroke="currentColor" stroke-opacity=".4"/><circle cx="290" cy="50" r="5" class="fg" stroke="currentColor"/><circle cx="320" cy="90" r="5" class="fg" stroke="currentColor"/><circle cx="300" cy="110" r="5" class="fg" stroke="currentColor"/><circle cx="355" cy="60" r="5" class="fr" stroke="currentColor"/><circle cx="380" cy="100" r="5" class="fr" stroke="currentColor"/><circle cx="430" cy="50" r="5" class="fr" stroke="currentColor"/><circle cx="460" cy="95" r="5" class="fr" stroke="currentColor"/><circle cx="410" cy="120" r="5" class="fr" stroke="currentColor"/><circle cx="350" cy="125" r="5" class="fg" stroke="currentColor"/><path d="M335,32 L370,138" stroke="currentColor" fill="none" stroke-width="1.4" stroke-dasharray="5 4"/><path d="M395,32 L430,138" class="sr" fill="none" stroke-width="1.4"/><text x="322" y="158" text-anchor="middle" class="tm">old boundary</text><text x="438" y="158" text-anchor="middle" class="tr">new</text><text x="375" y="184" text-anchor="middle" class="tm">same x, different right answer</text><text x="640" y="16" text-anchor="middle" font-weight="600">Prediction drift</text><rect x="550" y="132" width="16" height="8" rx="1" class="fs" stroke="currentColor" stroke-opacity=".4"/><rect x="567" y="137" width="16" height="3" rx="1" class="ft" stroke="currentColor" stroke-opacity=".4"/><rect x="588" y="110" width="16" height="30" rx="1" class="fs" stroke="currentColor" stroke-opacity=".4"/><rect x="605" y="130" width="16" height="10" rx="1" class="ft" stroke="currentColor" stroke-opacity=".4"/><rect x="626" y="80" width="16" height="60" rx="1" class="fs" stroke="currentColor" stroke-opacity=".4"/><rect x="643" y="110" width="16" height="30" rx="1" class="ft" stroke="currentColor" stroke-opacity=".4"/><rect x="664" y="110" width="16" height="30" rx="1" class="fs" stroke="currentColor" stroke-opacity=".4"/><rect x="681" y="85" width="16" height="55" rx="1" class="ft" stroke="currentColor" stroke-opacity=".4"/><rect x="702" y="130" width="16" height="10" rx="1" class="fs" stroke="currentColor" stroke-opacity=".4"/><rect x="719" y="100" width="16" height="40" rx="1" class="ft" stroke="currentColor" stroke-opacity=".4"/><path d="M540,140 H740" stroke="currentColor" fill="none" stroke-width="1.4"/><text x="640" y="158" text-anchor="middle" class="tm">score: grey train, teal prod</text><text x="640" y="184" text-anchor="middle" class="tm">outputs shift; no labels needed</text></svg><figcaption>Three different things move. Only concept drift changes the true rule, so only labels prove it.</figcaption></figure>
  <p>Left: the hump of input values shifted (longer trips after the radius grew), but the rule is the same. Middle: same inputs, but the boundary moved (metro works: same km, more minutes). Right: only the model's outputs shifted, which you can see without any true answers.</p>
  <table class="tbl">
    <tr><th>Drift</th><th>What changes</th><th>Biteful example</th><th>Detect with</th></tr>
    <tr><td><strong>Data (covariate)</strong></td><td>P(x): the inputs</td><td>Radius 8 → 10 km; rain 10% → 40%</td><td>Feature PSI / KS (no labels)</td></tr>
    <tr><td><strong>Concept</strong></td><td>P(y | x): the rule</td><td>Metro works: +1.5 min per km in Kothrud</td><td>Labelled error, by slice</td></tr>
    <tr><td><strong>Label (prior)</strong></td><td>P(y): how outcomes are spread</td><td>Deliveries longer overall in the monsoon</td><td>Label distribution over time</td></tr>
    <tr><td><strong>Prediction</strong></td><td>P(ŷ): the outputs</td><td>Median ETA up 4 minutes</td><td>Output PSI (no labels)</td></tr>
  </table>
  <p>Data drift does not always hurt: if the model already handles 9 km trips well, longer trips just get longer ETAs, correctly. Concept drift always hurts, because the rule itself changed, and you can only prove it once true labels arrive. "Model drift" or "model decay" usually means the performance drop that any of these causes.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A teacher marking exams. Data drift: this year's students are younger, but the marking scheme is the same. Concept drift: the board changed the marking scheme, so the same answer now gets a different mark. Prediction drift: the teacher is suddenly giving everyone 90+, which you notice before any re-check.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Covariate (data) drift</strong>: P(x) changes. <strong>Concept drift</strong>: P(y | x) changes. <strong>Label (prior) drift</strong>: P(y) changes. <strong>Prediction drift</strong>: P(ŷ) changes.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"No feature drifted, so the model is fine." Concept drift (the metro) leaves every input distribution unchanged. Only labelled error by slice (Kothrud) shows it.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: PSI.</b> "The km distribution moved" must become a number a computer can compare to a threshold every night. How far is "moved"?</div>

  <h2 id="sm-psi"><span class="num">03</span>PSI by Hand</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Two histograms of delivery distance, March and this week. Eyeballing them works for one feature once. We need one number per feature, zero when nothing moved, growing as the piles separate, with an agreed "act now" line.</p>
  </div>
  <p>The industry favourite is the <strong>population stability index (PSI)</strong>. Recipe: cut the feature into bins, find each bin's share in the training period (<strong>e</strong>, expected) and now (<strong>a</strong>, actual), and add up (a − e) × ln(a ÷ e) over the bins.</p>
  <p>Biteful's delivery distance in four bins. In March: 30% of orders were 0–2 km, 40% 2–4 km, 20% 4–6 km, 10% over 6 km. This week, after the radius grew: 20%, 35%, 25%, 20%.</p>
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
  <p>Trace the first and last rows by hand. Bin 0–2 km shrank: a − e = −0.10, ln(0.20 ÷ 0.30) = ln 0.667 = −0.405, product (−0.10) × (−0.405) = +0.0405. Bin 6+ km doubled: +0.10 × ln 2 = 0.10 × 0.693 = 0.0693. Both are <em>positive</em>: a shrinking bin has a negative difference and a negative log, a growing bin has both positive. So no term can cancel another, PSI is 0 only when nothing moved, and it grows as the piles separate. Total 0.0405 + 0.0067 + 0.0112 + 0.0693 = <strong>0.128</strong>: "moderate, investigate".</p>
  <table class="tbl">
    <tr><th>PSI</th><th>Common reading</th></tr>
    <tr><td>&lt; 0.1</td><td>No meaningful shift</td></tr>
    <tr><td>0.1 – 0.25</td><td>Moderate: investigate</td></tr>
    <tr><td>&gt; 0.25</td><td>Major: act (check the pipeline, consider retraining)</td></tr>
  </table>
  <p>How the bins are chosen matters. In production you cut by the training data's <strong>deciles</strong> (10 bins, each holding 10% of training values), apply the same edges to current data, and clip empty bins to a tiny share so ln(0) never happens. Section 08 does exactly this.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school compares this year's class to last year's by the share of students in each height band. Every band that grew or shrank adds to a "how different" score; a band that doubled adds a lot.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>PSI = Σ<sub>bins</sub> (a − e) · ln(a / e)</strong>, where e is the bin's share in the reference (training) data and a its share in current data. It is a symmetric form of KL divergence; related measures: <strong>KL divergence</strong> Σ p · ln(p / q) (asymmetric, infinite if q = 0) and <strong>JS divergence</strong> (symmetric, bounded 0–1).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Quantile bins on a binary feature like rain. Its deciles are all 0 or 1, the edges collapse into one bin, and PSI reads 0 even when rain went 10% → 40%. Use one bin per category for binary and categorical features.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the KS test.</b> PSI depends on how we bin, and it has no notion of "could this be chance?". Is there a check that works on the raw numbers and comes with a significance level?</div>

  <h2 id="sm-ks"><span class="num">04</span>The KS Test</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Eight March orders and eight orders this week have different distances. Is that a real shift or the luck of which eight we picked? And what happens to that question when we have half a million orders?</p>
  </div>
  <p>The <strong>Kolmogorov–Smirnov (KS) test</strong> compares two samples without bins. For each sample draw its <strong>empirical CDF</strong> (ECDF): at every value x, the share of the sample that is ≤ x. If both samples come from the same distribution the two curves stay close. The KS statistic <strong>D</strong> is the largest vertical gap between them; the test then gives a p-value for "a gap this big by chance".</p>
  <p>By hand on our running example: training km of orders 101–108 = 2, 4, 3, 5, 1, 6, 3, 2, and eight orders this week = 3, 5, 7, 4, 8, 2, 6, 9.</p>
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
  <p>Trace x = 3: training values ≤ 3 are 2, 3, 1, 3, 2 (5 of 8) = 0.625; this week's ≤ 3 are 3, 2 (2 of 8) = 0.250. Gap 0.375. The gap stays 0.375 from x = 3 to 6, so <strong>D = 0.375</strong>. But p = 0.66: with only 8 orders per side, a gap this big happens by luck two times in three. The test honestly says "can't tell".</p>
  <p>Now the same idea at scale, on the model's predicted ETAs (prediction drift): 10,000 training-period predictions against fresh samples with no shift, +2 minutes, and +8 minutes and wider (monsoon). PSI, KS and JS side by side:</p>
  <div class="fx" data-lang="py">import numpy as np
from scipy import stats
from scipy.spatial.distance import jensenshannon

rng = np.random.default_rng(42)
train = rng.normal(36, 10, 10_000)          # predicted ETA (min) during training period
same  = rng.normal(36, 10, 10_000)          # fresh sample, no drift
small = rng.normal(38, 10, 10_000)          # mean +2 min
big   = rng.normal(44, 13, 10_000)          # mean +8, wider (monsoon)

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
  <p>Look at "small" (+2 minutes): PSI 0.048 says ignore, but KS p ≈ 10<sup>−42</sup> screams. A p-value answers "could this be chance?", and with 10,000 rows even a small real gap is clearly not chance. Whether it <em>matters</em> is a different question. The next run makes the point sharper: the same half-minute shift at three sample sizes.</p>
  <div class="fx" data-lang="py">import numpy as np
from scipy import stats
rng = np.random.default_rng(0)
# Same tiny shift (+0.5 min on a 10-min spread), different sample sizes
for n in [500, 5_000, 500_000]:
    a, b = rng.normal(36, 10, n), rng.normal(36.5, 10, n)
    print(f"n={n:&gt;7,}  KS p-value={stats.ks_2samp(a, b).pvalue:.4f}")</div>
<div class="fx" data-lang="text">n=    500  KS p-value=0.6659
n=  5,000  KS p-value=0.0112
n=500,000  KS p-value=0.0000</div>
  <p>"Fine" at 500 rows, "significant" at 5,000, "certain" at 500,000. The shift didn't grow; only the sample did. Biteful sees 600,000 orders a day, so every KS p-value would be tiny every day.</p>
  <table class="tbl">
    <tr><th>Method</th><th>Idea</th><th>Good for</th></tr>
    <tr><td><strong>PSI</strong></td><td>Σ (a − e) · ln(a / e) over bins</td><td>Industry standard, one number per feature, fixed thresholds</td></tr>
    <tr><td><strong>KS test</strong></td><td>D = max gap between ECDFs, + p-value</td><td>Continuous features; use D (effect size), not p, at scale</td></tr>
    <tr><td><strong>KL divergence</strong></td><td>Σ p · ln(p / q)</td><td>Theory; needs smoothing</td></tr>
    <tr><td><strong>JS divergence</strong></td><td>Symmetric, bounded KL vs the average</td><td>Dashboards (0 to 1)</td></tr>
    <tr><td><strong>Chi-square</strong></td><td>Observed vs expected counts</td><td>Categorical features (<a class="xref" data-note="st_hypothesis">Hypothesis Testing</a>)</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two queues at a ration shop. Walk down both, counting "how many people so far are shorter than me". The biggest difference in those running counts is D. With eight people per queue, a big difference proves little; with a city's population, even a tiny one is "real" — but may not matter.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>ECDF</strong>: F(x) = share of sample values ≤ x. <strong>KS statistic</strong>: D = max<sub>x</sub> |F<sub>1</sub>(x) − F<sub>2</sub>(x)|, between 0 and 1. <strong>Effect size</strong>: how big a difference is (D, PSI), as opposed to how sure we are it exists (p-value).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Alerting on KS p-values at production volumes: every feature becomes "significant" every day. Alert on effect size (PSI, D) with thresholds, or subsample to a fixed size first.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: delayed labels.</b> Drift tells us inputs or outputs moved. It cannot tell us whether the ETAs are now <em>wrong</em> — only real delivery times can. When do we get them, and can we trust the first ones?</div>

  <h2 id="sm-labels"><span class="num">05</span>Delayed Labels</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The honest health check is "compare the ETAs we showed with the times food actually arrived". For tonight's 8 pm orders, when can we compute that, and is an early answer a fair answer?</p>
  </div>
  <p>A label exists only when the order is delivered. For ETA that is fast compared with many products — about an hour — but three things bite. Simulation: 6,000 orders placed between 20:00 and 21:00; long waits make cancellation more likely; the model is good on typical orders but short on long ones.</p>
  <div class="fx" data-lang="py">import numpy as np

# 6,000 orders placed between 20:00 and 21:00; when does each one's label (delivery time) exist?
rng = np.random.default_rng(5)
n = 6_000
placed = rng.uniform(0, 60, n)                        # minutes after 20:00
actual = 15 + rng.gamma(4, 5.5, n)                    # true delivery minutes (mean ~37)
eta = 7.5 + 0.8 * actual + rng.normal(0, 3, n)      # the model: good on typical orders, short on long ones
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
  <ul>
    <li><strong>Delay</strong>: at 21:00 only 37.8% of the 8 pm hour's orders have labels; by 22:00, 94.2%.</li>
    <li><strong>Early labels are biased</strong>: the first labels are the fast deliveries (mean 23.2 minutes at 20:30 vs 36.8 final). At 20:30 the late rate looks like a wonderful 11.4%; the truth is 47.0%. Judge a cohort only once its labels have <strong>matured</strong>.</li>
    <li><strong>Censoring</strong>: 5.4% never get a label because they were cancelled, and cancellations are concentrated in long waits — exactly where the model is worst. Track cancellation rate as a metric of its own.</li>
  </ul>
  <figure class="viz"><svg viewBox="0 0 700 150" width="700" role="img">
    <defs><marker id="sm-m5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <line x1="20" y1="60" x2="680" y2="60" stroke="currentColor" marker-end="url(#sm-m5)"/>
    <circle cx="60" cy="60" r="6" class="fb" stroke="currentColor"/><text x="60" y="40" text-anchor="middle" font-size="11">20:05 ETA</text><text x="60" y="84" text-anchor="middle" font-size="10" class="tm">prediction</text>
    <circle cx="200" cy="60" r="6" class="ft" stroke="currentColor"/><text x="200" y="40" text-anchor="middle" font-size="11">+20 min</text><text x="200" y="84" text-anchor="middle" font-size="10" class="tm">proxy: picked up?</text>
    <circle cx="345" cy="60" r="6" class="fg" stroke="currentColor"/><text x="345" y="40" text-anchor="middle" font-size="11">+30–60 min</text><text x="345" y="84" text-anchor="middle" font-size="10" class="tm">label: delivered</text>
    <circle cx="490" cy="60" r="6" class="fr" stroke="currentColor"/><text x="490" y="40" text-anchor="middle" font-size="11">never</text><text x="490" y="84" text-anchor="middle" font-size="10" class="tm">cancelled</text>
    <circle cx="625" cy="60" r="6" class="fs" stroke="currentColor"/><text x="625" y="40" text-anchor="middle" font-size="11">+30–90 days</text><text x="625" y="84" text-anchor="middle" font-size="10" class="tm">fraud label</text>
    <text x="350" y="122" text-anchor="middle" font-size="11">Between the prediction and a mature label, lean on drift metrics and proxies.</text>
  </svg><figcaption>ETA labels arrive within the hour (except cancellations, which never do). Fraud labels take months. Either way there is a gap to fill.</figcaption></figure>
  <p>While labels mature you lean on a <strong>proxy</strong>: an early signal that usually points the same way.</p>
  <table class="tbl">
    <tr><th>Product</th><th>True label</th><th>Delay</th><th>Proxy to watch meanwhile</th></tr>
    <tr><td>ETA</td><td>Delivered time</td><td>~1 hour; never if cancelled</td><td>Pickup delay vs plan, "where is my order?" taps, cancellations</td></tr>
    <tr><td>Fraud</td><td>Chargeback</td><td>30–90 days</td><td>Disputes, analyst review rate, decline rate</td></tr>
    <tr><td>Recommendations</td><td>Order / retention</td><td>Hours–weeks</td><td>Clicks, add-to-cart</td></tr>
    <tr><td>Demand forecast</td><td>Actual orders</td><td>1 day</td><td>Intra-day order count vs forecast so far</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Judging a new cook by the first plates back from the dining room. The first plates are the quick dishes; the slow, complicated ones — where mistakes happen — come back last, and some customers walk out before theirs arrives.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Label delay</strong>: time between prediction and ground truth. <strong>Mature cohort</strong>: a group of predictions old enough that (almost) all labels have arrived. <strong>Censored label</strong>: never observed (cancelled orders). <strong>Proxy metric</strong>: an early signal correlated with the label.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Computing today's MAE from "labels so far". It is biased towards fast, easy orders and makes a degrading model look healthy. Report metrics per cohort, after maturity.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: alerts and SLOs.</b> We now have many numbers: PSI per feature, KS, late rate per mature cohort, proxies. Which of them should page an engineer at 2 am, and which can wait for tomorrow — without crying wolf every day?</div>

  <h2 id="sm-alert"><span class="num">06</span>Alerts &amp; SLOs</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A flood of alerts that everyone learns to ignore is worse than none. How noisy are naive alerts, how do we cut the noise without missing real problems, and how do we decide how much failure is acceptable at all?</p>
  </div>
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
print(f"\\nSLO {slo:.1%} over {days} days -&gt; error budget {budget_min:.1f} minutes of failure")
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
  <p>Reading the first block: 100 checks a day, each falsely firing 1% of the time, gives one false alert per day on average, and a 63.4% chance of at least one every day. After a week people stop reading them. Requiring the breach to <strong>persist</strong> for 3 windows in a row cuts that (if windows were independent) to about one false alert in 10,000 days. A real problem persists; noise rarely does.</p>
  <p>The second block is the <strong>SLO</strong> (service level objective) idea from site reliability engineering. Biteful promises "99.9% of ETA requests succeed within 60 ms over 30 days". That leaves an <strong>error budget</strong> of 0.1% × 30 days = 43.2 minutes of failure a month. The <strong>burn rate</strong> says how fast we are spending it: failing 2% of requests is 20× the allowed rate, so the budget is gone in 1.5 days — page now. Failing 0.5% (5×) can be a ticket. ML adds model SLOs next to the system ones: "late rate of mature hourly cohorts ≤ 45%", "fallback rate ≤ 1%".</p>
  <div class="flow"><span>Metric</span><span>Window (1 h / 1 day)</span><span>Compare to baseline</span><span>Persists 3 windows?</span><span>Page or ticket</span></div>
  <ul>
    <li><strong>Baseline</strong>: compare with training data or a recent healthy window, and respect seasonality: Friday 8 pm against last Friday 8 pm, not Tuesday 4 pm.</li>
    <li><strong>Severity</strong>: page (phone now) for symptoms users feel — error rate, p99 over budget, a null-rate spike, a burning SLO. Ticket (look tomorrow) for slow drift (km PSI 0.128).</li>
    <li><strong>Prioritise</strong>: weight drift by feature importance; drift in km matters more than drift in hour.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A smoke alarm that rings whenever you make toast gets its battery removed. A good alarm waits for smoke that persists, and a fire brigade budget says how many false call-outs a month the city can afford.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>SLI</strong>: the measured indicator (share of requests under 60 ms). <strong>SLO</strong>: the target for it (99.9% over 30 days). <strong>Error budget</strong> = (1 − SLO) × period. <strong>Burn rate</strong> = current failure rate ÷ allowed failure rate.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Alerting on causes (CPU 80%, one feature's KS p-value) instead of symptoms (late rate, errors, SLO burn). And 100 un-prioritised drift checks at 1% each: one false page a day, then all alerts are ignored.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: retraining.</b> The alert fired: rain and km drifted, the champion's mature late rate is 57%, and its Kothrud error is 2.7× the rest of the city (4.61 vs 1.72 minutes, section 07). The fix is a model trained on recent data. When exactly do we retrain, on which window, and how do we make sure the new model is really better before it replaces the old one?</div>

  <h2 id="sm-retrain"><span class="num">07</span>Retraining &amp; Champion–Challenger</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"Retrain" sounds like running <code>train.py</code> again. But a retrain on bad data bakes the bug in, and a retrained model can be worse on some slice. What triggers a retrain, and what gate decides whether it replaces the current model?</p>
  </div>
  <div class="cards">
    <div><b>Scheduled</b><p>Every day / week, regardless.</p><small>Simple; may waste compute or react too slowly</small></div>
    <div><b>Triggered</b><p>When drift or a metric crosses a threshold (PSI &gt; 0.25 on a top feature; late rate SLO burning).</p><small>Efficient; needs reliable monitoring</small></div>
    <div><b>Continual</b><p>Incremental updates on new data (minutes–hours).</p><small>Ads, news feeds; harder to validate</small></div>
  </div>
  <p>The current production model is the <strong>champion</strong>; the newly trained one is the <strong>challenger</strong>. The challenger must beat the champion on the <em>same</em> most recent data that neither trained on, overall and per slice. Simulation: 67 days of orders; metro works make every km in Kothrud 1.5 minutes slower from day 50. The champion was trained on days 1–45; the challenger on a <strong>sliding window</strong> of days 16–60. Both are scored on days 61–67.</p>
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
champion   = fit(days &lt;= 45)                             # trained before the metro works
challenger = fit((days &gt; 15) &amp; (days &lt;= 60))             # sliding window: last 45 days
test = days &gt; 60                                         # the most recent week, unseen by both

def score(model):
    e = y[test] - model.predict(X[test])
    k = zone[test] == 0
    return np.abs(e).mean(), np.abs(e[k]).mean(), np.abs(e[~k]).mean(), np.mean(e &gt; 0)

print(f"{'model':&lt;12}{'MAE all':&gt;8}{'Kothrud':&gt;9}{'others':&gt;8}{'late':&gt;7}")
res = {}
for name, m in [("champion", champion), ("challenger", challenger)]:
    res[name] = score(m)
    a, k, o, late = res[name]
    print(f"{name:&lt;12}{a:&gt;8.2f}{k:&gt;9.2f}{o:&gt;8.2f}{late:&gt;7.0%}")
c, ch = res["champion"], res["challenger"]
promote = (c[0] - ch[0] &gt;= 0.10) and (ch[2] &lt;= c[2] + 0.20)   # better overall, no slice much worse
print("promote challenger:", promote)</div>
<div class="fx" data-lang="text">model        MAE all  Kothrud  others   late
champion        2.49     4.61    1.72    57%
challenger      2.25     3.71    1.72    56%
promote challenger: True</div>
  <p>Read it: outside Kothrud both models are equal (1.72), because nothing changed there. In Kothrud the champion is 4.61 minutes off and the challenger 3.71: it has seen ten days of the new road conditions. Overall 2.49 → 2.25. The promotion rule (better overall by at least 0.10 minutes, and no slice worse by more than 0.20) says <strong>promote</strong> — into shadow and canary next, not straight to everyone. Note the late rate is still 56%: retraining fixes drift, not the promise; that needs a buffer or quantile (<a class="xref" data-note="sd_framework">framework</a> §08).</p>
  <p>Retraining is a pipeline with gates, so a bad retrain cannot reach users:</p>
  <div class="flow"><span>Trigger</span><span>Pull data (point-in-time)</span><span>Validate data</span><span>Train</span><span>Champion vs challenger</span><span>Register</span><span>Shadow / canary</span><span>Promote</span></div>
  <ul>
    <li><strong>Data validation gate</strong>: schema, ranges, null rates, row counts — stop bad data before it trains a bad model.</li>
    <li><strong>Window</strong>: sliding (recent N weeks; adapts fast, forgets rare events like last year's monsoon) vs expanding (all history; stable, slow to adapt). Many teams use expanding with more weight on recent rows.</li>
    <li><strong>Registry</strong>: the challenger is versioned with its data, code and metrics (<a class="xref" data-note="mlops_mlflow">MLflow</a>) so it can be rolled back.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket team's opening batsman (champion) keeps his place until a challenger outscores him in the same recent matches — and not just on average: a challenger who fails against spin doesn't get picked for the Chennai test.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Champion–challenger</strong>: comparing a candidate model against the production model on identical recent held-out data before promotion. <strong>Sliding / expanding window</strong>: train on the last N periods / on all history. <strong>Retraining trigger</strong>: the rule that starts a retrain.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Auto-retraining on data that contains the incident (a week of rain = 0 from a broken feed). The model learns the bug. That is why validation comes before training, and why the gate compares slices, not just the overall number.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: a hands-on drift report.</b> We have every piece. What does the nightly job that ties PSI, thresholds and statuses together actually look like?</div>

  <h2 id="sm-build"><span class="num">08</span>Hands-on: Nightly Drift Report</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Section 03 computed PSI on four hand-made bins for one feature. A nightly job must do it for every feature and the model's output, with decile bins, the binary-feature fix and a status anyone can read. What does that look like?</p>
  </div>
  <p>The reference is a frozen sample from training time; "cur" is today's traffic: the radius grew (km × 1.3), the monsoon arrived (rain 10% → 40%), queue and hour are unchanged. The model's output, <code>eta_pred</code>, is computed with the linear ETA model.</p>
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
  <p>Reading it: rain jumped (0.534, ALERT) — and only shows up because binary features get one bin per value; with decile bins it would read 0. The ETA itself moved (0.299, ALERT): prediction drift, visible without a single label. km is in the "watch" zone (0.134), close to section 03's hand-computed 0.128. Queue and hour did not move. Next step for the on-call engineer: confirm rain is real (it is the monsoon, not a broken feed), then check mature late rate by rain slice before deciding to retrain.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A morning health check-up sheet: each line a test, each with a normal range, flagged in red when out of range. The doctor reads the red lines first, then asks why.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Reference window</strong>: the frozen data drift is measured against (training sample or a healthy period). <strong>Drift report</strong>: per-feature drift scores and statuses, produced on a schedule; tools such as Evidently generate them.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A report nobody owns. Every ALERT line needs an owner and a next step (check pipeline → check mature labels by slice → trigger retrain), or it becomes wallpaper.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> From one changed city to one promoted challenger, on one page.</div>

  <h2 id="sm-connect"><span class="num">09</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which monitoring piece feeds which, which question does each answer, and what number did each give on Biteful in July?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 700 240" width="700" role="img">
    <defs><marker id="sm-c0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="150" height="50" rx="6" class="fs" stroke="currentColor" stroke-opacity=".5"/><text x="85" y="40" text-anchor="middle" font-size="12" font-weight="600">World changes</text><text x="85" y="57" text-anchor="middle" font-size="10" class="tm">monsoon, radius, metro</text>
    <rect x="190" y="20" width="150" height="50" rx="6" class="ft" stroke="currentColor" stroke-opacity=".5"/><text x="265" y="40" text-anchor="middle" font-size="12" font-weight="600">Data drift (no labels)</text><text x="265" y="57" text-anchor="middle" font-size="10" class="tm">PSI km 0.128, D 0.375</text>
    <rect x="370" y="20" width="150" height="50" rx="6" class="ft" stroke="currentColor" stroke-opacity=".5"/><text x="445" y="40" text-anchor="middle" font-size="12" font-weight="600">Prediction drift</text><text x="445" y="57" text-anchor="middle" font-size="10" class="tm">eta_pred PSI 0.299</text>
    <rect x="550" y="20" width="140" height="50" rx="6" class="fg" stroke="currentColor" stroke-opacity=".5"/><text x="620" y="40" text-anchor="middle" font-size="12" font-weight="600">Mature labels</text><text x="620" y="57" text-anchor="middle" font-size="10" class="tm">late 11.4% → 47.0%</text>
    <rect x="190" y="120" width="150" height="50" rx="6" class="fr" stroke="currentColor" stroke-opacity=".5"/><text x="265" y="140" text-anchor="middle" font-size="12" font-weight="600">Alert (persist 3×)</text><text x="265" y="157" text-anchor="middle" font-size="10" class="tm">SLO burn 20× → page</text>
    <rect x="370" y="120" width="150" height="50" rx="6" class="fv" stroke="currentColor" stroke-opacity=".5"/><text x="445" y="140" text-anchor="middle" font-size="12" font-weight="600">Retrain (sliding)</text><text x="445" y="157" text-anchor="middle" font-size="10" class="tm">validate data first</text>
    <rect x="550" y="120" width="140" height="50" rx="6" class="fv" stroke="currentColor" stroke-opacity=".5"/><text x="620" y="140" text-anchor="middle" font-size="12" font-weight="600">Champion vs chall.</text><text x="620" y="157" text-anchor="middle" font-size="10" class="tm">2.49 → 2.25; promote</text>
    <rect x="10" y="120" width="150" height="50" rx="6" class="fb" stroke="currentColor" stroke-opacity=".5"/><text x="85" y="140" text-anchor="middle" font-size="12" font-weight="600">Concept drift?</text><text x="85" y="157" text-anchor="middle" font-size="10" class="tm">Kothrud 4.61 min off</text>
    <line x1="160" y1="45" x2="187" y2="45" stroke="currentColor" marker-end="url(#sm-c0)"/>
    <line x1="340" y1="45" x2="367" y2="45" stroke="currentColor" marker-end="url(#sm-c0)"/>
    <line x1="520" y1="45" x2="547" y2="45" stroke="currentColor" marker-end="url(#sm-c0)"/>
    <line x1="265" y1="70" x2="265" y2="117" stroke="currentColor" marker-end="url(#sm-c0)"/>
    <path d="M620,70 V95 H85 V117" fill="none" stroke="currentColor" marker-end="url(#sm-c0)"/>
    <line x1="160" y1="145" x2="187" y2="145" stroke="currentColor" marker-end="url(#sm-c0)"/>
    <line x1="340" y1="145" x2="367" y2="145" stroke="currentColor" marker-end="url(#sm-c0)"/>
    <line x1="520" y1="145" x2="547" y2="145" stroke="currentColor" marker-end="url(#sm-c0)"/>
    <text x="350" y="200" text-anchor="middle" font-size="11">Top: what we can see, from earliest (inputs, no labels) to latest (mature labels).</text>
    <text x="350" y="218" text-anchor="middle" font-size="11">Bottom: what we do about it. The winner goes on to shadow → canary → A/B (next note).</text>
  </svg><figcaption>Monitoring as one chain on Biteful's July: signals in time order on top, actions below.</figcaption></figure>
  <table class="tbl"><caption>Every monitoring concept on Biteful's ETA</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on Biteful</th><th>When to use</th></tr>
    <tr><td>Four layers</td><td>system + data + model + business metrics</td><td>where can it fail silently?</td><td>p99 fine; rain 40%; late 58%; calls +30%</td><td>every deployed model</td></tr>
    <tr><td>Drift types</td><td>P(x), P(y|x), P(y), P(ŷ)</td><td>what moved?</td><td>radius &amp; rain (data); metro (concept)</td><td>diagnosing a drop</td></tr>
    <tr><td>PSI</td><td>bin shares e, a</td><td>how far did a feature move?</td><td>km 0.128 by hand; 0.134 nightly; rain 0.534</td><td>every feature, nightly</td></tr>
    <tr><td>KS test</td><td>two ECDFs</td><td>same distribution? (no bins)</td><td>D 0.375, p 0.66 (n 8)</td><td>continuous features; use D at scale</td></tr>
    <tr><td>Delayed / censored labels</td><td>delivery timestamps</td><td>is it actually wrong?</td><td>37.8% at 1 h; 5.4% never; 11.4% vs 47.0%</td><td>mature cohorts only</td></tr>
    <tr><td>Alerts</td><td>thresholds + persistence</td><td>wake someone?</td><td>1 false/day → 0.0001 with 3-in-a-row</td><td>symptoms page, drift tickets</td></tr>
    <tr><td>SLO, error budget</td><td>(1 − SLO) × period</td><td>how much failure is OK?</td><td>43.2 min/month; 20× burn → 1.5 days</td><td>system and model SLOs</td></tr>
    <tr><td>Champion–challenger</td><td>same recent holdout, slices</td><td>is the retrain better?</td><td>2.49 → 2.25; Kothrud 4.61 → 3.71</td><td>every retrain</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p><strong>Monitoring is a ladder of evidence ordered by time: input drift (PSI, KS) is visible immediately but only says "something moved"; prediction drift says the model reacted; only mature, uncensored labels say "it's wrong"; alerts turn persistent evidence into action; and champion–challenger turns action into a provably better model.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet.</b> After it, <a class="xref" data-note="sd_experiments">Experiments</a> asks the last question: the challenger wins offline, but does it win with real customers?</div>

  <h2 id="sm-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The note on one page. Running example: Biteful's ETA model v12, trained in March (km of orders 101–108: 2, 4, 3, 5, 1, 6, 3, 2). July: rain 10% → 40%, radius 8 → 10 km, metro works in Kothrud (+1.5 min per km from day 50).</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>On Biteful</th><th>Weakness → next</th></tr>
    <tr><td>Staleness, four layers</td><td>why worse with no code change?</td><td>system fine, data/model/business not</td><td>what moved? → drift types</td></tr>
    <tr><td>Drift types</td><td>which part changed?</td><td>data (rain, km), concept (metro)</td><td>need a number → PSI</td></tr>
    <tr><td>PSI</td><td>how far did it move?</td><td>0.128 on km</td><td>bins, no chance → KS</td></tr>
    <tr><td>KS</td><td>same distribution?</td><td>D 0.375, p 0.66 (n 8)</td><td>moved ≠ wrong → labels</td></tr>
    <tr><td>Delayed labels</td><td>is it wrong, and when do we know?</td><td>37.8% at 1 h; early late 11.4% vs 47.0%</td><td>act when? → alerts</td></tr>
    <tr><td>Alerts &amp; SLOs</td><td>wake someone?</td><td>3-in-a-row; 43.2 min budget</td><td>then fix → retrain</td></tr>
    <tr><td>Champion–challenger</td><td>is the retrain better?</td><td>2.49 → 2.25, Kothrud 4.61 → 3.71</td><td>online? → experiments</td></tr>
  </table>
  <h3>Formulas and numbers</h3>
  <table class="tbl">
    <tr><th>Formula</th><th>Symbols</th><th>On Biteful</th></tr>
    <tr><td>PSI = Σ (a − e) · ln(a / e)</td><td>e reference share, a current share per bin</td><td>0.0405 + 0.0067 + 0.0112 + 0.0693 = 0.128</td></tr>
    <tr><td>KS: D = max |F<sub>1</sub>(x) − F<sub>2</sub>(x)|</td><td>F = ECDF, share ≤ x</td><td>at x = 3: 0.625 − 0.250 = 0.375</td></tr>
    <tr><td>P(≥1 false alert) = 1 − (1 − p)<sup>n</sup></td><td>n checks, p false rate</td><td>1 − 0.99<sup>100</sup> = 63.4%</td></tr>
    <tr><td>persistence: p<sup>k</sup></td><td>k windows in a row</td><td>0.01<sup>3</sup> × 100 = 0.0001/day</td></tr>
    <tr><td>error budget = (1 − SLO) × period</td><td>SLO as a fraction</td><td>0.001 × 43,200 min = 43.2 min</td></tr>
    <tr><td>burn rate = failure rate ÷ (1 − SLO)</td><td>how fast the budget is spent</td><td>2% ÷ 0.1% = 20× → 1.5 days</td></tr>
  </table>
  <h3>Definitions</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td>Data / concept / label / prediction drift</td><td>P(x) / P(y|x) / P(y) / P(ŷ) changes</td></tr>
    <tr><td>PSI thresholds</td><td>&lt; 0.1 ok, 0.1–0.25 investigate, &gt; 0.25 act</td></tr>
    <tr><td>ECDF, KS statistic</td><td>share of values ≤ x; largest gap between two ECDFs</td></tr>
    <tr><td>Effect size vs p-value</td><td>how big vs how sure; at scale p is always tiny</td></tr>
    <tr><td>Label delay, mature cohort, censoring</td><td>wait for truth; old enough to judge; truth never observed</td></tr>
    <tr><td>SLI, SLO, error budget, burn rate</td><td>measured indicator; its target; allowed failure; spending speed</td></tr>
    <tr><td>Champion, challenger, sliding window</td><td>production model; candidate; train on the last N periods</td></tr>
  </table>
  <h3>Use / avoid</h3>
  <div class="cards">
    <div><b>Use</b><p>All four layers; PSI on decile bins (one bin per category for binary features); KS statistic D, not p, at scale; metrics on mature cohorts; cancellation rate as its own metric; persistence rules and SLO burn rates; validation before training; champion vs challenger on the same newest data, by slice; then shadow and canary.</p></div>
    <div><b>Avoid</b><p>Uptime-only monitoring; "no input drift = fine"; quantile bins on binary features; alerting on KS p-values; MAE from labels-so-far; 100 un-prioritised alerts; auto-retrain without data validation; promoting on the overall number alone.</p></div>
  </div>
  <h3>Five rapid-fire checks</h3>
  <ol>
    <li>A bin's share goes 0.10 → 0.20. Its PSI term? <em>0.10 × ln 2 = 0.0693.</em></li>
    <li>D = 0.375 with 8 orders per sample, p = 0.66. Drift? <em>Can't tell: too few rows. With huge samples, the opposite problem: everything is "significant".</em></li>
    <li>At 20:30 the late rate of the 8 pm orders is 11.4%. Trust it? <em>No: only fast orders are labelled yet; the mature value was 47.0%.</em></li>
    <li>SLO 99.9% over 30 days. Error budget? <em>43.2 minutes; at 2% failure (20× burn) it lasts 1.5 days.</em></li>
    <li>Challenger 2.25 vs champion 2.49 overall. Promote straight to 100%? <em>No: check slices (others 1.72 = 1.72, Kothrud improved), then shadow → canary → A/B.</em></li>
  </ol>

  <h2 id="sm-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't ordinary server monitoring tell you a model is broken?</summary><div class="qa-body">A stale or mis-fed model still answers fast with status 200. The failure is in the content of the answers, so you need data checks (nulls, PSI), prediction-distribution checks and delayed accuracy on top of system metrics.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Data drift vs concept drift, with an ETA example of each?</summary><div class="qa-body">Data drift: the input distribution changes — the delivery radius grew, so long trips are more common. Concept drift: the input-to-label rule changes — metro works make the same km take longer. Only concept drift is guaranteed to hurt, and only labels prove it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you compute PSI?</summary><div class="qa-body">Bin the reference data (often deciles; one bin per category for categorical), apply the same edges to current data, get shares e and a per bin, clip zeros, and sum (a − e) · ln(a / e). Below 0.1 ok, 0.1–0.25 investigate, above 0.25 act.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Every KS test in your dashboard has p &lt; 0.001. What's wrong?</summary><div class="qa-body">Huge samples make trivial shifts significant (a 0.5-minute shift is "certain" at 500,000 rows). Use the KS statistic or PSI with thresholds, or subsample to a fixed size.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Prediction drift fired but no feature drifted. Possible causes?</summary><div class="qa-body">An interaction shift per-feature tests miss, an unmonitored feature, a new model or config deploy, a traffic-mix change (a new city), or a changed default value for missing features.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Fraud labels take 60 days. How do you know the fraud model is degrading this week?</summary><div class="qa-body">Watch input and score drift (PSI), decline and review rates, dispute counts as proxies, and analyst-labelled samples; confirm with chargeback-based metrics as cohorts mature.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is KL divergence awkward for monitoring?</summary><div class="qa-body">It is asymmetric and becomes infinite when the reference has zero mass where current data has some. PSI and JS fix this by symmetrising (and JS by bounding to [0, 1]).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Scheduled vs triggered retraining: when each?</summary><div class="qa-body">Scheduled when change is steady and predictable (weekly). Triggered when shifts are bursty and compute is expensive. Many teams do both: a weekly schedule plus emergency triggers (PSI on a top feature, SLO burn).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your auto-retrain pipeline promoted a worse model. What gates were missing?</summary><div class="qa-body">Data validation before training, champion-vs-challenger on the same holdout with slice checks, and a shadow/canary step with automatic rollback before full promotion.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What would you put on the ETA model's dashboard?</summary><div class="qa-body">p99 latency, errors and fallback rate; null rates and PSI for km, queue, rain; predicted-ETA distribution; mature-cohort MAE, late rate and P90 error by city and rain; cancellation rate; support calls; SLO burn.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the drift report depend on serving logging its features?</summary><div class="qa-body">PSI compares training-time feature values with the values serving actually used. If serving doesn't log what it fed the model, you can only compare raw upstream data, which misses skew (the straight-line km bug) and default-value bugs. The same log is also tomorrow's training data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why is a PSI alert not enough reason to retrain?</summary><div class="qa-body">PSI says inputs moved, not that predictions are wrong; the model may handle the new inputs fine (data drift without harm). Check prediction drift and mature labelled error by slice first; retrain when performance (or concept drift) is confirmed, or a broken pipeline is ruled out.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip label maturity when comparing champion and challenger?</summary><div class="qa-body">Recent cohorts contain only the fast deliveries; both models look better than they are, and the slices where they differ (long Kothrud trips) are exactly the ones missing. You might promote or reject on biased evidence.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does a challenger that wins here still need the experiments note?</summary><div class="qa-body">Champion–challenger is an offline comparison on logged data. It can't show how customers and riders react to different ETAs (conversion, cancellations, rider behaviour). Shadow, canary and an A/B test on on-time rate and conversion settle that.</div></details>
</main>`
});
