// ml/ml_intro.js — ML Basics
Object.assign(TOPIC_CONTENT, {
  "ml_intro": `<main>
  <h1>ML Basics</h1>
  <p class="lead">What machine learning is, the kinds of learning, the end-to-end workflow, how a model actually learns (loss + gradient descent), and a first scikit-learn model built the right way. Everything later in the ML section builds on this page.</p>

  <h2 id="mi-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">ML Basics</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What ML is</div>
        <ul>
          <li><b>ML</b> — learn a function f(X) → y from examples instead of hand-writing rules</li>
          <li><b>Training</b> — fit f on (X, y); <b>inference</b> — apply f to new X</li>
          <li><b>Goal = generalise</b> — work on unseen data, not memorise training rows</li>
          <li><b>Use ML when</b> rules are too many/unknown and you have data + a measurable target</li>
          <li><b>Don't</b> when a simple rule works, errors are unacceptable, or no data</li>
          <li>💡 Doctor who learns from thousands of cases vs one with a rulebook</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Types of learning</div>
        <ul>
          <li><b>Supervised</b> — labelled (X, y); <b>regression</b> (number) or <b>classification</b> (class)</li>
          <li><b>Unsupervised</b> — X only; clustering, dimensionality reduction, anomalies</li>
          <li><b>Reinforcement</b> — agent acts, gets reward, learns a policy (games, robots, ads)</li>
          <li><b>Semi-supervised</b> — few labels + many unlabelled rows</li>
          <li><b>Self-supervised</b> — labels made from data itself: next word (GPT), masked word (BERT)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Workflow</div>
        <ul>
          <li><b>Loop</b> — problem → data/EDA → features → split → baseline → train/tune → evaluate → deploy → monitor → retrain</li>
          <li><b>Problem first</b> — what decision? cost of FP vs FN? business metric?</li>
          <li><b>Baseline first</b> — mean/majority → linear/logistic → boosting</li>
          <li>⚠ Most failures: wrong problem (start) or no monitoring (end)</li>
          <li>Features beat algorithms: simple model + good features wins</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Train / val / test</div>
        <ul>
          <li><b>Train ~70%</b> — fit weights; <b>val ~15%</b> — tune and pick; <b>test ~15%</b> — touched once</li>
          <li><code>stratify=y</code> keeps class ratios in every split</li>
          <li><b>Time series</b> — split by time, never shuffle; test = most recent</li>
          <li>⚠ Using test to choose models turns it into a 2nd val set → optimistic score</li>
          <li>Small data → cross-validation instead of one val split</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">How a model learns</div>
        <ul>
          <li><b>Loss</b> — one number for "how wrong"; training minimises it</li>
          <li><b>MSE</b> (outliers dominate, optimum = mean) · <b>MAE</b> (robust, optimum = median) · <b>Huber</b> (both) · <b>cross-entropy</b> (classification) · <b>hinge</b> (SVM)</li>
          <li><b>Gradient descent</b> — <code>w ← w − α·∇L(w)</code>; α = learning rate</li>
          <li>⚠ α too big → diverges; too small → crawls</li>
          <li><b>Batch / SGD / mini-batch</b> (32–512, the default for nets)</li>
          <li><b>Momentum</b> — velocity smooths steps; <b>Adam</b> — momentum + per-parameter step size; <b>AdamW</b> — decoupled weight decay</li>
          <li>Adam fast; SGD+momentum sometimes generalises better (flatter minima)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Linear &amp; logistic baselines</div>
        <ul>
          <li><b>OLS</b> — min ‖y − Xw‖²; closed form <code>w = (XᵀX)⁻¹Xᵀy</code>, O(nd² + d³)</li>
          <li>Normal eq for small d; GD for huge d / streaming; lstsq/SVD for stability</li>
          <li><b>LINE assumptions</b> — Linearity, Independent errors, Normal errors, Equal variance</li>
          <li><b>Logistic</b> — P(y=1) = σ(wᵀx + b); linear in log-odds; trained on log loss</li>
          <li><b>Coefficient</b> — +1 unit multiplies odds by e^w (odds ratio)</li>
          <li>⚠ Logistic is a classifier: judge with log loss / AUC, never R²</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Generalisation &amp; drift</div>
        <ul>
          <li><b>Overfit</b> — memorised noise; <b>spurious</b> correlation; <b>shift</b> — world changed</li>
          <li><b>Covariate shift</b> — P(X) changes, P(y|X) same</li>
          <li><b>Label shift</b> — P(y) changes (fraud rate jumps)</li>
          <li><b>Concept drift</b> — P(y|X) changes; the most dangerous (COVID spending)</li>
          <li><b>Detect</b> — PSI on features, rolling metric on recent labels; <b>fix</b> — retrain on recent window</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">First model recipe</div>
        <ul>
          <li>Split (stratified) → Dummy baseline → Pipeline(scaler, model) → compare on val → refit on train+val → test once</li>
          <li>Breast cancer: baseline acc 0.628 / recall 0 → logreg val 0.977, test 0.988</li>
          <li><code>predict_proba</code> gives probabilities; choose the threshold later</li>
          <li>⚠ Leakage (preprocessing on all data, future info) — see Core Concepts</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mi-what"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What ML Is</span><span class="rm-sub">Learned rules vs written rules</span></div></div>
      <div class="rm-item rm-done" data-target="mi-types"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Types of Learning</span><span class="rm-sub">Supervised, unsupervised, RL</span></div></div>
      <div class="rm-item rm-done" data-target="mi-flow"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The ML Workflow</span><span class="rm-sub">A loop, not a line</span></div></div>
      <div class="rm-item rm-done" data-target="mi-split"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Train / Val / Test</span><span class="rm-sub">Why the test set is touched once</span></div></div>
      <div class="rm-item rm-done" data-target="mi-learn"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">How a Model Learns</span><span class="rm-sub">Loss + gradient descent</span></div></div>
      <div class="rm-item rm-done" data-target="mi-lin"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Linear &amp; Logistic Baselines</span><span class="rm-sub">OLS, log-odds, assumptions</span></div></div>
      <div class="rm-item rm-done" data-target="mi-gen"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Generalisation &amp; Drift</span><span class="rm-sub">Why prod ≠ notebook</span></div></div>
      <div class="rm-item rm-done" data-target="mi-first"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">First sklearn Model</span><span class="rm-sub">End to end, real output</span></div></div>
      <div class="rm-item rm-done" data-target="mi-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="mi-what"><span class="num">01</span>What ML Is</h2>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
    <defs><marker id="mi-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <text x="10" y="18">Rules-based program</text>
    <rect x="10" y="32" width="70" height="28" rx="5" class="fs" stroke="currentColor"/><text x="45" y="51" text-anchor="middle">Rules</text>
    <rect x="10" y="82" width="70" height="28" rx="5" class="fs" stroke="currentColor"/><text x="45" y="101" text-anchor="middle">Data</text>
    <rect x="115" y="56" width="74" height="30" rx="5" class="fb sb"/><text x="152" y="76" text-anchor="middle">Program</text>
    <rect x="210" y="56" width="66" height="30" rx="5" class="fg sg"/><text x="243" y="76" text-anchor="middle">Answers</text>
    <line x1="80" y1="46" x2="113" y2="64" stroke="currentColor" marker-end="url(#mi-ah)"/><line x1="80" y1="96" x2="113" y2="78" stroke="currentColor" marker-end="url(#mi-ah)"/>
    <line x1="189" y1="71" x2="208" y2="71" stroke="currentColor" marker-end="url(#mi-ah)"/>
    <text x="10" y="138" class="tm">you write the rules</text>
    <line x1="290" y1="10" x2="290" y2="140" stroke="currentColor" opacity="0.2"/>
    <text x="305" y="18">Machine learning</text>
    <rect x="305" y="32" width="70" height="28" rx="5" class="fs" stroke="currentColor"/><text x="340" y="51" text-anchor="middle">Data</text>
    <rect x="305" y="82" width="70" height="28" rx="5" class="fs" stroke="currentColor"/><text x="340" y="101" text-anchor="middle">Answers</text>
    <rect x="405" y="56" width="66" height="30" rx="5" class="ft st"/><text x="438" y="76" text-anchor="middle">Train</text>
    <rect x="490" y="56" width="62" height="30" rx="5" class="fv" stroke="currentColor"/><text x="521" y="76" text-anchor="middle">Model</text>
    <line x1="375" y1="46" x2="403" y2="64" stroke="currentColor" marker-end="url(#mi-ah)"/><line x1="375" y1="96" x2="403" y2="78" stroke="currentColor" marker-end="url(#mi-ah)"/>
    <line x1="471" y1="71" x2="488" y2="71" stroke="currentColor" marker-end="url(#mi-ah)"/>
    <text x="305" y="138" class="tm">the rules are learned from examples</text>
  </svg><figcaption>Classic code turns rules + data into answers. ML turns data + answers into the rules (the model).</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Machine learning</strong> finds a function f with f(X) ≈ y from examples. <strong>Training</strong> fits f; <strong>inference</strong> applies f to new X. The whole game is <strong>generalisation</strong>: doing well on rows the model never saw.</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A rulebook doctor ("fever &gt; 38.5 and WBC &gt; 11,000 → infection") is silent on unseen symptom combos. A doctor who learned from 10,000 cases generalises. Breaks if those cases were biased: the intuition is wrong in ways that are hard to see.</p>
  </div>
  <table class="tbl">
    <tr><th>Use ML when…</th><th>Prefer rules when…</th></tr>
    <tr><td>Patterns are too many or unknown (spam, fraud, images)</td><td>A clear rule exists ("age &lt; 18 → reject")</td></tr>
    <tr><td>You have labelled history and a measurable target</td><td>No data, or no way to measure success</td></tr>
    <tr><td>Patterns change and the system must adapt</td><td>Every decision must be fully explainable / zero error</td></tr>
  </table>

  <h2 id="mi-types"><span class="num">02</span>Types of Learning</h2>
  <div class="cards">
    <div><b>Supervised</b><p>Labelled (X, y). Learn X → y.<br><em>Regression</em>: a number. <em>Classification</em>: a class.</p><small>House price, demand, spam, fraud, churn</small></div>
    <div><b>Unsupervised</b><p>X only. Find structure: groups, compressed features, outliers.</p><small>Customer segments, PCA, anomaly detection</small></div>
    <div><b>Reinforcement</b><p>An agent acts, gets rewards, learns a policy that maximises total reward.</p><small>Game AI, robotics, ad bidding, RLHF for LLMs</small></div>
  </div>
  <figure class="viz"><svg viewBox="0 0 420 120" width="420">
    <defs><marker id="mi-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="20" y="40" width="100" height="40" rx="6" class="fb sb"/><text x="70" y="65" text-anchor="middle">Agent</text>
    <rect x="300" y="40" width="110" height="40" rx="6" class="ft st"/><text x="355" y="65" text-anchor="middle">Environment</text>
    <path d="M120 50 C 180 15, 240 15, 298 50" fill="none" stroke="currentColor" marker-end="url(#mi-ah2)"/>
    <text x="210" y="22" text-anchor="middle">action</text>
    <path d="M300 72 C 240 108, 180 108, 122 72" fill="none" stroke="currentColor" marker-end="url(#mi-ah2)"/>
    <text x="210" y="112" text-anchor="middle" class="tg">reward + new state</text>
  </svg><figcaption>Reinforcement learning: no labels, only delayed rewards. Trial and error replaces the answer key.</figcaption></figure>
  <table class="tbl">
    <tr><th>In-between kind</th><th>Labels</th><th>Example</th></tr>
    <tr><td><strong>Semi-supervised</strong></td><td>Few labelled + many unlabelled</td><td>100 labelled tickets + 100K unlabelled ones</td></tr>
    <tr><td><strong>Self-supervised</strong></td><td>Made from the data itself</td><td>GPT: predict next word. BERT: fill a masked word. SimCLR: match two crops of one image</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Self-supervision is why LLMs scale: the internet supplies billions of free "labels" (the next word), so no human annotation is needed.</p>
  </div>

  <h2 id="mi-flow"><span class="num">03</span>The ML Workflow</h2>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560">
    <defs><marker id="mi-ah3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g text-anchor="middle">
      <rect x="20" y="20" width="100" height="34" rx="5" class="fv" stroke="currentColor"/><text x="70" y="42">Problem</text>
      <rect x="160" y="20" width="100" height="34" rx="5" class="fs" stroke="currentColor"/><text x="210" y="42">Data / EDA</text>
      <rect x="300" y="20" width="100" height="34" rx="5" class="fs" stroke="currentColor"/><text x="350" y="42">Features</text>
      <rect x="440" y="20" width="100" height="34" rx="5" class="fs" stroke="currentColor"/><text x="490" y="42">Split</text>
      <rect x="440" y="100" width="100" height="34" rx="5" class="fb sb"/><text x="490" y="117">Baseline →</text><text x="490" y="129">train/tune</text>
      <rect x="300" y="100" width="100" height="34" rx="5" class="fb sb"/><text x="350" y="122">Evaluate</text>
      <rect x="160" y="100" width="100" height="34" rx="5" class="fg sg"/><text x="210" y="122">Deploy</text>
      <rect x="20" y="100" width="100" height="34" rx="5" class="fr sr"/><text x="70" y="122">Monitor</text>
    </g>
    <g stroke="currentColor" marker-end="url(#mi-ah3)">
      <line x1="120" y1="37" x2="158" y2="37"/><line x1="260" y1="37" x2="298" y2="37"/><line x1="400" y1="37" x2="438" y2="37"/>
      <line x1="490" y1="54" x2="490" y2="98"/>
      <line x1="440" y1="117" x2="402" y2="117"/><line x1="300" y1="117" x2="262" y2="117"/><line x1="160" y1="117" x2="122" y2="117"/>
      <line x1="70" y1="100" x2="70" y2="56" stroke-dasharray="4 3"/>
    </g>
    <text x="80" y="82" class="tr">drift → retrain</text>
  </svg><figcaption>A loop, not a pipeline: monitoring feeds back into the problem and retraining.</figcaption></figure>
  <table class="tbl">
    <tr><th>Stage</th><th>What really matters</th></tr>
    <tr><td><strong>Problem</strong></td><td>Which decision does it drive? Cost of a false positive vs false negative? Which business metric?</td></tr>
    <tr><td><strong>Data / EDA</strong></td><td>Representative of production? Missing values, outliers, class balance, time patterns.</td></tr>
    <tr><td><strong>Features</strong></td><td>Highest-leverage step: good features improve every model.</td></tr>
    <tr><td><strong>Split</strong></td><td>Lock the test set before anything else.</td></tr>
    <tr><td><strong>Baseline</strong></td><td>Mean / majority → linear or logistic → gradient boosting. Know what you must beat.</td></tr>
    <tr><td><strong>Train / tune</strong></td><td>Compare with cross-validation; tune the winner.</td></tr>
    <tr><td><strong>Deploy</strong></td><td>API / batch job, versioned model, handle missing features, watch latency.</td></tr>
    <tr><td><strong>Monitor</strong></td><td>Input drift, label drift, broken pipelines. Without it, you learn of failure from users.</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Courses spend 90% of time on train/tune; real projects fail at the ends. A weaker model with monitoring beats a stronger one that degrades silently.</p>
  </div>

  <h2 id="mi-split"><span class="num">04</span>Train / Validation / Test</h2>
  <figure class="viz"><svg viewBox="0 0 560 160" width="560">
    <rect x="20" y="30" width="364" height="36" class="fb sb"/><text x="202" y="53" text-anchor="middle">Train 70% · 397 rows</text>
    <rect x="384" y="30" width="78" height="36" class="ft st"/><text x="423" y="53" text-anchor="middle">Val 86</text>
    <rect x="462" y="30" width="78" height="36" class="fr sr"/><text x="501" y="53" text-anchor="middle">Test 86</text>
    <text x="202" y="84" text-anchor="middle" class="tm">fit the weights</text>
    <text x="423" y="84" text-anchor="middle" class="tm">tune, pick</text>
    <text x="501" y="84" text-anchor="middle" class="tm">use once</text>
    <text x="20" y="18" class="tm">Random (stratified) split — i.i.d. data</text>
    <text x="20" y="114" class="tm">Time series — split by time, test = most recent</text>
    <rect x="20" y="122" width="364" height="22" class="fb sb"/><rect x="384" y="122" width="78" height="22" class="ft st"/><rect x="462" y="122" width="78" height="22" class="fr sr"/>
    <text x="30" y="137">Jan … Sep</text><text x="392" y="137">Oct–Nov</text><text x="472" y="137">Dec</text>
  </svg><figcaption>Three jobs, three sets. The test set imitates production: no decision may depend on it.</figcaption></figure>
  <div class="fx" data-lang="py">from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
X, y = load_breast_cancer(return_X_y=True, as_frame=True)
print(X.shape, y.value_counts().to_dict())
X_trval, X_test, y_trval, y_test = train_test_split(
    X, y, test_size=0.15, stratify=y, random_state=42)          # lock test first
X_tr, X_val, y_tr, y_val = train_test_split(
    X_trval, y_trval, test_size=0.15/0.85, stratify=y_trval, random_state=42)
print(len(X_tr), len(X_val), len(X_test))
print(round(y_tr.mean(),3), round(y_val.mean(),3), round(y_test.mean(),3))  # same class ratio</div>
  <div class="fx" data-lang="text">(569, 30) {1: 357, 0: 212}
397 86 86
0.627 0.628 0.628</div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Train = textbook exercises, validation = mock exams, test = the real exam. Peek at the real exam and your score stops meaning anything.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Evaluate on test, tweak, evaluate again → test has become a second validation set and the reported score is optimistic. For time series, <code>shuffle</code> leaks the future: slice by date (<code>X.iloc[:train_end]</code> …).</p>
  </div>

  <h2 id="mi-learn"><span class="num">05</span>How a Model Learns</h2>
  <div class="flow"><span>Predict ŷ = f(X; w)</span><span>Loss L(y, ŷ)</span><span>Gradient ∇L(w)</span><span>w ← w − α·∇L</span><span>Repeat</span></div>
  <p>The <strong>loss</strong> is one number saying how wrong the model is. Training searches for the weights that minimise it.</p>
  <table class="tbl">
    <tr><th>Loss</th><th>Formula</th><th>Outliers</th><th>Use when</th></tr>
    <tr><td><strong>MSE</strong></td><td>mean((y − ŷ)²)</td><td>Dominate (squared)</td><td>Big errors are disproportionately bad; Gaussian noise</td></tr>
    <tr><td><strong>MAE</strong></td><td>mean(|y − ŷ|)</td><td>Robust</td><td>Outliers are noise; Laplace noise; kink at 0</td></tr>
    <tr><td><strong>Huber</strong></td><td>MSE if |e| ≤ δ, else linear</td><td>Tunable via δ</td><td>MSE for small errors, robust for large</td></tr>
    <tr><td><strong>Cross-entropy</strong></td><td>−Σ y·log ŷ</td><td>Confident wrong = huge</td><td>Any classification with probabilities</td></tr>
    <tr><td><strong>Hinge</strong></td><td>max(0, 1 − y·ŷ)</td><td>Moderate</td><td>SVMs (margin-based)</td></tr>
  </table>
  <div class="fx" data-lang="py">import numpy as np
y = np.array([1, 2, 3, 4, 100])                 # one outlier
c = np.linspace(0, 100, 100001)                 # try every constant prediction
mse = ((y[:, None] - c) ** 2).mean(0)
mae = np.abs(y[:, None] - c).mean(0)
print("best constant under MSE:", c[mse.argmin()], "= mean", y.mean())
print("best constant under MAE:", c[mae.argmin()], "= median", np.median(y))</div>
  <div class="fx" data-lang="text">best constant under MSE: 22.0 = mean 22.0
best constant under MAE: 3.0 = median 3.0</div>
  <p>The loss decides what "best" means: MSE chases the mean (pulled by the outlier), MAE the median.</p>

  <h3>Gradient descent</h3>
  <figure class="viz"><svg viewBox="0 0 560 180" width="560">
    <defs><marker id="mi-ah4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <path d="M30 30 Q 140 270 250 30" fill="none" stroke="currentColor" opacity="0.6"/>
    <path d="M320 30 Q 430 270 540 30" fill="none" stroke="currentColor" opacity="0.6"/>
    <g class="tg" stroke="currentColor"><polyline points="45,60 80,114 110,141 130,149 138,150" fill="none" class="sg" marker-end="url(#mi-ah4)"/></g>
    <g fill="currentColor"><circle cx="45" cy="60" r="4" class="fg sg"/><circle cx="80" cy="114" r="4" class="fg sg"/><circle cx="110" cy="141" r="4" class="fg sg"/><circle cx="130" cy="149" r="4" class="fg sg"/></g>
    <polyline points="400,141 470,134 375,120 500,102 340,70" fill="none" class="sr" stroke-width="1.5" marker-end="url(#mi-ah4)"/>
    <circle cx="400" cy="141" r="4" class="fr sr"/><circle cx="470" cy="134" r="4" class="fr sr"/><circle cx="375" cy="120" r="4" class="fr sr"/><circle cx="500" cy="102" r="4" class="fr sr"/>
    <text x="140" y="174" text-anchor="middle" class="tg">α = 0.1: steps shrink → minimum</text>
    <text x="430" y="174" text-anchor="middle" class="tr">α = 1.2: overshoots → diverges</text>
    <text x="20" y="20" class="tm">loss</text><text x="250" y="160" class="tm">w</text>
  </svg><figcaption>Each step moves downhill by α × slope. Too big a step jumps over the valley and climbs the other side.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Walking down a foggy hill: feel the slope under your feet, step downhill, repeat. The learning rate is your stride length.</p>
  </div>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
x = rng.uniform(0, 2, 100)
y = 3 * x + 2 + rng.normal(0, 0.3, 100)       # truth: b=2, w=3
Xb = np.c_[np.ones(100), x]                     # add bias column

print("normal eq:", np.linalg.lstsq(Xb, y, rcond=None)[0].round(3))

def gd(lr, steps):
    w = np.zeros(2)
    for t in range(steps):
        grad = 2 / len(y) * Xb.T @ (Xb @ w - y)   # gradient of MSE
        w -= lr * grad
    return w, np.mean((Xb @ w - y) ** 2)

for lr, steps in [(0.1, 1), (0.1, 50), (0.1, 500), (1.2, 5)]:
    w, mse = gd(lr, steps)
    print(f"lr={lr} steps={steps:3d} w={w.round(3)} mse={mse:.4g}")</div>
  <div class="fx" data-lang="text">normal eq: [1.998 2.98 ]
lr=0.1 steps=  1 w=[1.053 1.374] mse=8.356
lr=0.1 steps= 50 w=[2.039 2.949] mse=0.08501
lr=0.1 steps=500 w=[1.998 2.98 ] mse=0.0846
lr=1.2 steps=  5 w=[5600.535 7242.419] mse=2.025e+08</div>
  <table class="tbl">
    <tr><th>Variant</th><th>Batch</th><th>Idea</th><th>When</th></tr>
    <tr><td>Batch GD</td><td>All rows</td><td>Exact gradient, slow per step</td><td>Small, convex problems</td></tr>
    <tr><td>SGD</td><td>1 row</td><td>Noisy but cheap</td><td>Online / streaming data</td></tr>
    <tr><td>Mini-batch</td><td>32–512</td><td>GPU-friendly middle ground</td><td>Default for neural nets</td></tr>
    <tr><td>Momentum</td><td>Mini-batch</td><td><code>v ← βv + (1−β)g; w ← w − αv</code> (β≈0.9): speeds up consistent directions, damps zig-zag</td><td>Deep nets when generalisation matters</td></tr>
    <tr><td>Adam</td><td>Mini-batch</td><td>Momentum m + RMSProp v (avg g²); bias-correct; <code>w ← w − α·m̂/(√v̂+ε)</code>. Per-parameter step size</td><td>Default; β₁=0.9, β₂=0.999, α=1e-3</td></tr>
    <tr><td>AdamW</td><td>Mini-batch</td><td>Adam + weight decay applied directly to w, not via the gradient</td><td>Transformers standard</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Adam converges fast but may settle in sharp minima; SGD+momentum's noise often finds flatter minima that generalise better. Gradient-boosted trees (XGBoost, LightGBM) don't use these optimisers at all.</p>
  </div>

  <h2 id="mi-lin"><span class="num">06</span>Linear &amp; Logistic Baselines</h2>
  <table class="tbl">
    <tr><th></th><th>Linear regression (OLS)</th><th>Logistic regression</th></tr>
    <tr><td>Predicts</td><td>ŷ = Xw (a number)</td><td>P(y=1|x) = σ(wᵀx + b) = 1/(1+e^−z)</td></tr>
    <tr><td>Loss</td><td>MSE = ‖y − Xw‖²</td><td>Log loss (binary cross-entropy) = negative log-likelihood</td></tr>
    <tr><td>Solved by</td><td>Closed form <code>w = (XᵀX)⁻¹Xᵀy</code> or GD</td><td>No closed form: lbfgs / liblinear / saga</td></tr>
    <tr><td>Linear in</td><td>The target</td><td>The log-odds: log(p/(1−p)) = wᵀx + b</td></tr>
    <tr><td>Coefficient</td><td>+1 unit of x → ŷ changes by w</td><td>+1 unit of x → odds × e^w (odds ratio)</td></tr>
    <tr><td>Boundary</td><td>—</td><td>wᵀx + b = 0: a straight hyperplane</td></tr>
  </table>
  <ul>
    <li><strong>Normal equation</strong>: set the gradient to zero, solve. Costs O(nd² + d³): fine for d up to ~10K. Use GD when d is huge or data streams. Fails if XᵀX is singular (perfectly correlated features); Ridge adds λI to fix it. Prefer <code>lstsq</code> (SVD) over an explicit inverse.</li>
    <li><strong>Geometry</strong>: ŷ is the projection of y onto the column space of X, so residuals are perpendicular to every feature: <code>Xᵀ(y − ŷ) = 0</code>.</li>
  </ul>
  <table class="tbl">
    <tr><th>OLS assumption (LINE)</th><th>If violated</th><th>Check / fix</th></tr>
    <tr><td><strong>L</strong>inearity</td><td>Biased coefficients (serious)</td><td>Residual-vs-fitted plot; add polynomial terms or use a non-linear model</td></tr>
    <tr><td><strong>I</strong>ndependent errors</td><td>Standard errors too small (time series)</td><td>Durbin-Watson; lag features, Newey-West SEs</td></tr>
    <tr><td><strong>N</strong>ormal errors</td><td>Only small-sample t-tests / CIs</td><td>Q-Q plot; matters least (CLT)</td></tr>
    <tr><td><strong>E</strong>qual variance</td><td>Inefficient estimates, wrong SEs</td><td>Residuals should be a flat band; log the target or use WLS</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Logistic regression" is a classifier. Judge it with log loss, ROC-AUC or PR-AUC, never R². It cannot draw a circle unless you add non-linear features.</p>
  </div>

  <h2 id="mi-gen"><span class="num">07</span>Generalisation &amp; Drift</h2>
  <div class="cards">
    <div><b>Overfitting</b><p>Memorised training noise.</p><small>Big train–val gap → see Core Concepts</small></div>
    <div><b>Spurious pattern</b><p>A shortcut true only in training data.</p><small>Row ID or hospital watermark predicts the label</small></div>
    <div><b>Distribution shift</b><p>Production data no longer looks like training data.</p><small>The most common production failure</small></div>
  </div>
  <table class="tbl">
    <tr><th>Shift</th><th>What changes</th><th>Example</th></tr>
    <tr><td><strong>Covariate shift</strong></td><td>P(X) changes, P(y|X) same</td><td>More mobile users; behaviour per device unchanged</td></tr>
    <tr><td><strong>Label shift</strong></td><td>P(y) changes</td><td>Fraud rate doubles during a holiday</td></tr>
    <tr><td><strong>Concept drift</strong></td><td>P(y|X) changes</td><td>COVID: same transaction features, different fraud meaning</td></tr>
  </table>
  <div class="flow"><span>Monitor PSI on inputs</span><span>Rolling AUC / precision on fresh labels</span><span>Alert on drop</span><span>Retrain on recent window</span></div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Concept drift is the worst: inputs look normal, so input monitoring stays green while accuracy falls. You need delayed labels to catch it.</p>
  </div>

  <h2 id="mi-first"><span class="num">08</span>First sklearn Model, End to End</h2>
  <div class="flow"><span>Split (stratified)</span><span>Dummy baseline</span><span>Pipeline candidates</span><span>Pick on val</span><span>Refit train+val</span><span>Test once</span></div>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from sklearn.dummy import DummyClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, recall_score
y = 1 - y        # flip so 1 = malignant, the case we must catch (re-split as above)

models = {
  "baseline": DummyClassifier(strategy="most_frequent"),
  "logreg":   make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)),
  "forest":   RandomForestClassifier(n_estimators=200, random_state=42),
}
for name, m in models.items():
    m.fit(X_tr, y_tr)
    p = m.predict(X_val)
    print(f"{name:9s} val acc={accuracy_score(y_val, p):.3f} recall={recall_score(y_val, p):.3f}")

best = models["logreg"].fit(X_trval, y_trval)      # refit on train+val
p = best.predict(X_test)                             # test touched ONCE
print("TEST acc", round(accuracy_score(y_test, p),3), "recall", round(recall_score(y_test, p),3))
print("P(malignant) first 3 test rows:", best.predict_proba(X_test.iloc[:3])[:, 1].round(3))
coef = pd.Series(best[-1].coef_[0], index=X.columns)
top = coef.abs().sort_values(ascending=False).index[:3]
print(pd.DataFrame({"coef": coef[top].round(2), "odds_x": np.exp(coef[top]).round(2)}))</div>
  <div class="fx" data-lang="text">baseline  val acc=0.628 recall=0.000
logreg    val acc=0.977 recall=0.969
forest    val acc=0.953 recall=0.906
TEST acc 0.988 recall 0.969
P(malignant) first 3 test rows: [0.006 0.    0.002]
                coef  odds_x
radius error    1.22    3.40
worst texture   1.20    3.33
worst symmetry  1.01    2.75</div>
  <ul>
    <li><strong>Baseline</strong>: 62.8% accuracy with zero recall: accuracy alone would fool you.</li>
    <li><strong>Pipeline</strong>: the scaler is fit only on whatever data <code>fit</code> receives, so no test statistics leak in.</li>
    <li><strong>Odds ratio</strong>: on scaled features, +1 standard deviation of "radius error" multiplies the odds of malignant by 3.4.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Don't stop at <code>predict</code>. Keep <code>predict_proba</code>: the 0.5 threshold is a default, not a business decision (see Model Evaluation).</p>
  </div>

  <h2 id="mi-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Supervised vs unsupervised vs self-supervised vs reinforcement learning?</summary><div class="qa-body">Supervised: labelled (X, y), learn X → y (regression or classification). Unsupervised: X only, find structure (clusters, PCA, anomalies). Self-supervised: labels created from the data (next word, masked word), which lets LLMs train on billions of examples with no annotators. Reinforcement: an agent learns a policy from rewards by acting in an environment.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is the test set touched only once?</summary><div class="qa-body">It estimates performance on unseen production data. Every time a test score influences a decision, the test set leaks into model selection and the estimate becomes optimistic. Tune on validation or CV, then evaluate test once at the end.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why build a baseline first?</summary><div class="qa-body">It tells you what "good" means. A majority-class model scored 62.8% on breast cancer; on a 99/1 fraud set it would score 99%. If a fancy model barely beats the baseline, the problem is the data or features, not the algorithm.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You fit y = [1, 2, 3, 4, 100] with a single constant. What does MSE choose, what does MAE choose?</summary><div class="qa-body">MSE → the mean, 22. MAE → the median, 3. Squaring makes the outlier dominate; that is why MAE (or Huber) is used when outliers are noise.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if the learning rate is too high or too low?</summary><div class="qa-body">Too high: steps overshoot the minimum and the loss grows (lr = 1.2 gave MSE 2e8 after 5 steps). Too low: convergence takes forever or stalls on plateaus. Use a schedule (warm-up, decay) or an adaptive optimiser.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Adam vs SGD with momentum?</summary><div class="qa-body">Both average gradients (momentum). Adam also tracks the average squared gradient and divides by its root, giving each parameter its own step size, plus bias correction for early steps. Adam converges faster with little tuning; SGD+momentum sometimes generalises better on over-parameterised nets. AdamW decouples weight decay and is the transformer default.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Normal equation or gradient descent for linear regression?</summary><div class="qa-body">Normal equation <code>w = (XᵀX)⁻¹Xᵀy</code>: exact, no learning rate, O(d³), fine for d up to ~10K and data in memory. Gradient descent: huge d, streaming / out-of-memory data, or losses with no closed form (Lasso, logistic). In practice use <code>lstsq</code>/SVD, not an explicit inverse.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a logistic regression coefficient of 0.5 mean?</summary><div class="qa-body">One more unit of that feature adds 0.5 to the log-odds, i.e. multiplies the odds by e^0.5 ≈ 1.65 (+65% odds). The effect on probability depends on where you are on the sigmoid: big near p = 0.5, tiny near p = 0.01.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which OLS assumptions matter most?</summary><div class="qa-body">Linearity (violations bias the coefficients) and independence (autocorrelated errors make SEs too small, so everything looks significant). Equal variance affects efficiency and SEs. Normality of errors matters least: with large n the CLT makes coefficient estimates approximately normal anyway.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is concept drift and how do you handle it?</summary><div class="qa-body">P(y|X) changes: the same inputs now mean something else (fraud patterns during COVID). Input monitoring can miss it, so track model metrics on fresh labels in a rolling window (AUC, precision at threshold). Respond with scheduled retraining on a recent window for gradual drift, triggered retraining for sudden drops, optionally down-weighting old data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write the minimal correct sklearn workflow for a new tabular classification task.</summary><div class="qa-body">Stratified split off a test set → <code>DummyClassifier</code> baseline → <code>make_pipeline(preprocessing, model)</code> candidates compared on validation or CV → refit the winner on train+val → one test evaluation → keep <code>predict_proba</code> and tune the threshold to business costs.</div></details>
</main>`
});
