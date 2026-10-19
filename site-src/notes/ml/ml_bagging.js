// notes/ml/ml_bagging.js — Bagging & Bootstrap
Object.assign(TOPIC_CONTENT, {
  "ml_bagging": `<main>
  <h1>Bagging &amp; Bootstrap</h1>
  <div class="where"><span>Tree-Based Models</span><span>Ensemble Methods</span><span>Bagging</span><span>Bagging &amp; Bootstrap</span></div>
  <p class="lead"><strong>Bagging</strong> (bootstrap aggregating, Breiman 1996) turns one training table into many slightly different ones by sampling rows <em>with replacement</em>, trains the same model on each, and averages their answers. This note covers the bootstrap from scratch, the famous 63.2% derivation, how members are aggregated (mean, majority, probability average), exactly why variance drops and by how much, which learners benefit (deep trees a lot, linear models and kNN almost nothing), out-of-bag (OOB) error, the variants pasting / random subspaces / random patches, sklearn's <code>BaggingClassifier</code> and <code>BaggingRegressor</code>, a from-scratch implementation, and results on the shared churn data.</p>

  <h2 id="bag-where" class="open"><span class="num">↳</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 300" width="680">
<defs><marker id="bag-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<line x1="340" y1="40" x2="340" y2="64" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#bag-ar)"/>
<line x1="340" y1="98" x2="110" y2="126" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#bag-ar)"/>
<line x1="340" y1="98" x2="340" y2="126" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#bag-ar)"/>
<line x1="340" y1="98" x2="570" y2="126" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#bag-ar)"/>
<line x1="110" y1="160" x2="110" y2="188" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#bag-ar)"/>
<line x1="110" y1="222" x2="55" y2="250" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#bag-ar)"/>
<line x1="110" y1="222" x2="168" y2="250" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#bag-ar)"/>
<line x1="340" y1="160" x2="270" y2="188" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#bag-ar)"/>
<line x1="340" y1="160" x2="410" y2="188" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#bag-ar)"/>
<line x1="410" y1="222" x2="300" y2="250" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#bag-ar)"/>
<line x1="410" y1="222" x2="410" y2="250" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#bag-ar)"/>
<line x1="410" y1="222" x2="520" y2="250" stroke="currentColor" stroke-opacity="0.45" marker-end="url(#bag-ar)"/>
<rect x="265" y="8" width="150" height="32" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.35"/>
<text x="340" y="28" text-anchor="middle" font-size="12" font-weight="400">Decision Trees</text>
<rect x="265" y="66" width="150" height="32" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.35"/>
<text x="340" y="86" text-anchor="middle" font-size="12" font-weight="400">Ensemble Learning</text>
<rect x="35" y="128" width="150" height="32" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.35"/>
<text x="110" y="148" text-anchor="middle" font-size="12" font-weight="400">Bagging branch</text>
<rect x="265" y="128" width="150" height="32" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.35"/>
<text x="340" y="148" text-anchor="middle" font-size="12" font-weight="400">Boosting branch</text>
<rect x="495" y="128" width="150" height="32" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.35"/>
<text x="570" y="148" text-anchor="middle" font-size="12" font-weight="400">Stacking &amp; Voting</text>
<rect x="35" y="190" width="150" height="32" rx="7" class="fg sg" stroke-width="2.5"/>
<text x="110" y="210" text-anchor="middle" font-size="12" font-weight="700">Bagging &amp; Bootstrap</text>
<rect x="3" y="252" width="104" height="32" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.35"/>
<text x="55" y="272" text-anchor="middle" font-size="12" font-weight="400">Random Forest</text>
<rect x="116" y="252" width="104" height="32" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.35"/>
<text x="168" y="272" text-anchor="middle" font-size="12" font-weight="400">Extra Trees</text>
<rect x="218" y="190" width="104" height="32" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.35"/>
<text x="270" y="210" text-anchor="middle" font-size="12" font-weight="400">AdaBoost</text>
<rect x="335" y="190" width="150" height="32" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.35"/>
<text x="410" y="210" text-anchor="middle" font-size="12" font-weight="400">Gradient Boosting</text>
<rect x="248" y="252" width="104" height="32" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.35"/>
<text x="300" y="272" text-anchor="middle" font-size="12" font-weight="400">XGBoost</text>
<rect x="358" y="252" width="104" height="32" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.35"/>
<text x="410" y="272" text-anchor="middle" font-size="12" font-weight="400">LightGBM</text>
<rect x="468" y="252" width="104" height="32" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.35"/>
<text x="520" y="272" text-anchor="middle" font-size="12" font-weight="400">CatBoost</text>
<text x="110" y="237" text-anchor="middle" class="tg" font-size="11" font-weight="700">▲ you are here</text>
</svg><figcaption>Bagging is the root of the parallel branch. Random Forest and Extra Trees are bagging plus extra randomness.</figcaption></figure>
  <ul>
    <li><strong>Came from:</strong> <a class="xref" data-note="ml_ensembles">Ensemble Learning: The Idea</a>. That note proved a team beats its members only if the members make <em>different</em> mistakes (Var = ρσ² + (1 − ρ)σ²/n). It left one practical question open: we have exactly one training table, so where do different members come from?</li>
    <li><strong>What this note adds:</strong> the bootstrap, a way to manufacture many training sets from one, and bagging, the simplest team built on it. It works best on the high-variance models of <a class="xref" data-note="ml_dtree">Decision Trees</a>.</li>
    <li><strong>Leads to:</strong> bagged trees still look alike, because the strongest column wins the top split in almost every bootstrap sample (ρ stays near 0.5). <a class="xref" data-note="ml_rf">Random Forest</a> lowers ρ with random columns per split; <a class="xref" data-note="ml_extratrees">Extra Trees</a> adds random thresholds. Bagging also never fixes bias; that is the job of <a class="xref" data-note="ml_boosting">boosting</a>.</li>
  </ul>

  <h2 id="bag-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Bagging &amp; Bootstrap</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Bootstrap</div>
        <ul>
          <li><b>Sample n rows with replacement</b> from n rows</li>
          <li>Some rows 2–3×, some 0× · each sample a "new" dataset</li>
          <li>Origin: Efron 1979, error bars without formulas</li>
          <li>💡 Lucky draw where the chit goes back in the box</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">63.2% rule</div>
        <ul>
          <li>P(row never drawn) = (1 − 1/n)ⁿ → 1/e ≈ 0.368</li>
          <li>Each sample holds ≈ 63.2% of unique rows</li>
          <li>Times drawn ≈ Poisson(1): 0× 36.8%, 1× 36.8%, 2× 18.4%</li>
          <li>Left-out 36.8% = <b>out-of-bag</b> rows</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Algorithm</div>
        <ul>
          <li>For b = 1..B: bootstrap → fit model</li>
          <li><b>Regression</b>: mean of predictions</li>
          <li><b>Classification</b>: majority vote, or average probabilities (sklearn: average if available)</li>
          <li>Members independent → parallel (<code>n_jobs</code>)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Why it works</div>
        <ul>
          <li>Var = ρσ² + (1 − ρ)σ²/B · bias ≈ unchanged</li>
          <li>Bagged deep trees: ρ ≈ 0.46 measured</li>
          <li>Smooths a jumpy tree into a gentle staircase</li>
          <li><b>Unstable learners gain</b>: deep tree +0.104</li>
          <li><b>Stable learners don't</b>: LR −0.002, kNN +0.008, stump 0</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Out-of-bag</div>
        <ul>
          <li>Each row scored only by members that never saw it</li>
          <li>Free validation estimate, no hold-out needed</li>
          <li>Pessimistic with few members (uses ≈ 37% of them)</li>
          <li><code>oob_score=True</code> → <code>oob_score_</code>, <code>oob_decision_function_</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Variants &amp; sklearn</div>
        <ul>
          <li><b>Pasting</b> — rows without replacement (<code>bootstrap=False, max_samples&lt;1</code>)</li>
          <li><b>Random subspaces</b> — random columns per member</li>
          <li><b>Random patches</b> — both</li>
          <li><code>estimator, n_estimators, max_samples, max_features, bootstrap, bootstrap_features, oob_score, warm_start, n_jobs</code></li>
          <li>⚠ Bagging ≠ Random Forest (no per-split feature sampling)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="bag-boot"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Bootstrap</span><span class="rm-sub">Sampling with replacement, by hand</span></div></div>
      <div class="rm-item rm-done" data-target="bag-632"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The 63.2% Rule</span><span class="rm-sub">(1 − 1/n)ⁿ → 1/e, derived</span></div></div>
      <div class="rm-item rm-done" data-target="bag-algo"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Bagging Algorithm</span><span class="rm-sub">Three stumps bagged by hand; aggregation</span></div></div>
      <div class="rm-item rm-done" data-target="bag-why"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Why Variance Drops</span><span class="rm-sub">ρ measured, formula checked</span></div></div>
      <div class="rm-item rm-done" data-target="bag-stable"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Stable vs Unstable Learners</span><span class="rm-sub">Who gains from bagging</span></div></div>
      <div class="rm-item rm-done" data-target="bag-oob"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Out-of-Bag Error</span><span class="rm-sub">A free test set inside the training data</span></div></div>
      <div class="rm-item rm-done" data-target="bag-var"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Pasting, Subspaces, Patches</span><span class="rm-sub">Other ways to sample</span></div></div>
      <div class="rm-item rm-done" data-target="bag-sk"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">sklearn Bagging API</span><span class="rm-sub">Every parameter, regression too</span></div></div>
      <div class="rm-item rm-done" data-target="bag-scratch"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Bagging From Scratch</span><span class="rm-sub">40 lines, with OOB</span></div></div>
      <div class="rm-item rm-done" data-target="bag-res"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Results on the Churn Data</span><span class="rm-sub">Accuracy, AUC, time</span></div></div>
      <div class="rm-item rm-done" data-target="bag-cmp"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Comparisons</span><span class="rm-sub">vs tree, RF, Extra Trees, boosting</span></div></div>
      <div class="rm-item rm-done" data-target="bag-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Where bagging goes wrong</span></div></div>
      <div class="rm-item rm-done" data-target="bag-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview and connection checks</span></div></div>
    </div>
  </div>

  <h2 id="bag-boot"><span class="num">01</span>The Bootstrap</h2>
  <h3>The need</h3>
  <p>The ensemble maths says: average many models that make different mistakes. The ideal would be to collect 100 fresh training sets from the real world and train one model on each. We cannot; we have one table. The <strong>bootstrap</strong> fakes it: it treats our table as a stand-in for the world and draws new "training sets" from it.</p>
  <h3>Plain words and an analogy</h3>
  <p>To make one bootstrap sample of a table with n rows: pick a row at random, copy it into the new table, <em>put it back</em>, and repeat n times. Because rows go back, the same row can be picked again, and some rows are never picked. Every sample has the same size as the original, but a different mix.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school lucky draw where every chit is put back into the box after it is read out. Draw 6 times from 6 chits: some names come up twice, some never. Do it again and you get a different list. Each list is a slightly different "class" made from the same students.</p>
  </div>
  <h3>Worked by hand: 6 rows, 3 samples</h3>
  <p>Our table has 6 rows, A to F. Each draw picks one of the 6 with probability 1/6. The code makes three samples (sorted so they are easy to read) and counts how often each row appears.</p>
  <div class="fx" data-lang="py">import numpy as np
rng = np.random.default_rng(42)
rows = ["A", "B", "C", "D", "E", "F"]                      # a 6-row training table
for b in range(3):
    pick = rng.integers(0, 6, 6)                          # 6 draws, each from all 6 rows (replacement)
    sample = [rows[i] for i in pick]
    counts = {r: sample.count(r) for r in rows}
    oob = [r for r in rows if counts[r] == 0]
    print(f"sample {b+1}: {' '.join(sorted(sample))}   counts {counts}   left out (OOB): {oob}")</div>
  <div class="fx" data-lang="text">sample 1: A C C D E F   counts {'A': 1, 'B': 0, 'C': 2, 'D': 1, 'E': 1, 'F': 1}   left out (OOB): ['B']
sample 2: A A B D E F   counts {'A': 2, 'B': 1, 'C': 0, 'D': 1, 'E': 1, 'F': 1}   left out (OOB): ['C']
sample 3: A D E E E E   counts {'A': 1, 'B': 0, 'C': 0, 'D': 1, 'E': 4, 'F': 0}   left out (OOB): ['B', 'C', 'F']</div>
  <table class="tbl">
    <tr><th>Row</th><th>Sample 1</th><th>Sample 2</th><th>Sample 3</th></tr>
    <tr><td>A</td><td>1</td><td>2</td><td>1</td></tr>
    <tr><td>B</td><td><b>0</b></td><td>1</td><td><b>0</b></td></tr>
    <tr><td>C</td><td>2</td><td><b>0</b></td><td><b>0</b></td></tr>
    <tr><td>D</td><td>1</td><td>1</td><td>1</td></tr>
    <tr><td>E</td><td>1</td><td>1</td><td>4</td></tr>
    <tr><td>F</td><td>1</td><td>1</td><td><b>0</b></td></tr>
    <tr><td>unique rows used</td><td>5 of 6</td><td>5 of 6</td><td>3 of 6</td></tr>
  </table>
  <p>Each column adds up to 6 (same size as the original). Sample 3 is extreme: row E four times, and B, C, F missing. A model trained on sample 3 will lean heavily on E. That is the point: each sample pushes its model in a slightly different direction. The rows with a 0 are that sample's <strong>out-of-bag</strong> rows (section 06).</p>
  <h3>Where the idea came from: error bars without formulas</h3>
  <p>Bradley Efron invented the bootstrap in 1979 for a statistics problem: "how uncertain is my estimate?" Take 8 food-delivery times. Their mean is 29.5 minutes. How much would that mean move if we had a different 8 orders? Resample the 8 times with replacement 10,000 times, compute each mean, and look at how much the means spread.</p>
  <div class="fx" data-lang="py">import numpy as np
rng = np.random.default_rng(0)
times = np.array([22, 25, 31, 28, 35, 24, 41, 30])          # 8 delivery times (minutes)
print("sample mean:", times.mean())
means = [rng.choice(times, size=len(times), replace=True).mean() for _ in range(10_000)]
print(f"bootstrap SE of the mean: {np.std(means):.2f}")
print(f"textbook SE s/sqrt(n):    {times.std() / np.sqrt(len(times)):.2f}")
print("95% bootstrap interval:", np.percentile(means, [2.5, 97.5]).round(1))</div>
  <div class="fx" data-lang="text">sample mean: 29.5
bootstrap SE of the mean: 2.05
textbook SE s/sqrt(n):    2.07
95% bootstrap interval: [25.6 33.8]</div>
  <p>The bootstrap spread of the mean, 2.05 minutes, matches the textbook standard error s/√n = 2.07 (see <a class="xref" data-note="st_descriptive">Descriptive Statistics</a>). The trick works for any statistic, even ones with no textbook formula (a median, a model's accuracy). Breiman's insight in 1996 was to use the same resampling not to measure the wobble of an estimate but to <em>average it away</em>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>bootstrap sample</strong> of a dataset with n rows is n rows drawn uniformly at random <strong>with replacement</strong>. The empirical distribution of the data (each row has probability 1/n) stands in for the unknown real distribution.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Sampling <em>without</em> replacement n rows out of n just shuffles the table: every sample is identical as a set. Diversity needs replacement, or a smaller sample size (that variant is called pasting, section 07).</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We saw samples keep 5, 5 and 3 of 6 rows. How many rows does a bootstrap sample keep on average, and what does that mean for each model?</div>

  <h2 id="bag-632"><span class="num">02</span>The 63.2% Rule</h2>
  <h3>Derivation step by step</h3>
  <ol>
    <li>Fix one row, say row A. In a single draw, the chance of picking A is 1/n, so the chance of <em>not</em> picking it is 1 − 1/n.</li>
    <li>The n draws are independent, so the chance that A is missed in all n draws is (1 − 1/n) × (1 − 1/n) × … (n times) = <strong>(1 − 1/n)ⁿ</strong>.</li>
    <li>For n = 6: (5/6)⁶ = 15,625/46,656 = 0.335. About a third of rows are missed. Our three samples missed 1, 1 and 3 rows; the average 5/3 ≈ 1.67 out of 6 = 0.28, close for such a tiny test.</li>
    <li>For large n: take the log. ln[(1 − 1/n)ⁿ] = n · ln(1 − 1/n). For small x, ln(1 − x) ≈ −x (the first term of its Taylor series, see <a class="xref" data-note="m_calculus">Calculus</a>). So n · ln(1 − 1/n) ≈ n · (−1/n) = −1, and (1 − 1/n)ⁿ → e⁻¹ = 1/e ≈ <strong>0.368</strong>.</li>
    <li>So each row is in a given bootstrap sample with probability 1 − 1/e ≈ <strong>0.632</strong>, and the expected number of unique rows is n(1 − (1 − 1/n)ⁿ) ≈ 0.632n.</li>
  </ol>
  <div class="fx" data-lang="py">import numpy as np
from math import exp, factorial
print("     n   P(row never picked) = (1-1/n)^n   expected share in sample")
for n in [2, 3, 5, 10, 100, 1000, 100_000]:
    out = (1 - 1/n) ** n
    print(f"{n:6d}   {out:.4f}                           {1 - out:.4f}")
print(f"limit 1/e = {exp(-1):.4f},  1 - 1/e = {1 - exp(-1):.4f}")
rng = np.random.default_rng(0)
n = 100_000
counts = np.bincount(rng.integers(0, n, n), minlength=n)      # how many times each row was drawn
for k in range(4):
    print(f"rows drawn {k} times: {np.mean(counts == k):.3f}   Poisson(1) says {exp(-1) / factorial(k):.3f}")</div>
  <div class="fx" data-lang="text">     n   P(row never picked) = (1-1/n)^n   expected share in sample
     2   0.2500                           0.7500
     3   0.2963                           0.7037
     5   0.3277                           0.6723
    10   0.3487                           0.6513
   100   0.3660                           0.6340
  1000   0.3677                           0.6323
100000   0.3679                           0.6321
limit 1/e = 0.3679,  1 - 1/e = 0.6321
rows drawn 0 times: 0.368   Poisson(1) says 0.368
rows drawn 1 times: 0.369   Poisson(1) says 0.368
rows drawn 2 times: 0.184   Poisson(1) says 0.184
rows drawn 3 times: 0.060   Poisson(1) says 0.061</div>
  <p>The table converges fast: by n = 100 the share is already 0.634, and it never goes below 0.632. The second part counts how many times each row was drawn in one big sample. The counts follow a <strong>Poisson distribution with mean 1</strong>: P(k) = e⁻¹/k!. 36.8% of rows are drawn 0 times, 36.8% once, 18.4% twice, 6.1% three times. The sample still has n rows because the duplicates make up for the missing ones.</p>
  <div class="callout def"><span class="label">Formula</span>
    <p><strong>P(row out of a bootstrap sample) = (1 − 1/n)ⁿ → 1/e ≈ 0.368</strong>; P(in) → 1 − 1/e ≈ 0.632. Times a row is drawn ~ Binomial(n, 1/n) → Poisson(1).</p>
  </div>
  <div class="callout intu"><span class="label">What it means for the model</span>
    <p>Each bagged member learns from only about 63% of the distinct rows (with some repeated). So a single bagged tree is slightly <em>worse</em> than a tree trained on all rows (section 10 measures it); the average of many is far better. And each member has a free 37% of rows it never saw: the out-of-bag rows.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"63.2%" is about <em>unique</em> rows. The bootstrap sample still has n rows, not 0.632n. If you set <code>max_samples=0.632</code> thinking you are copying bagging, you get a smaller sample with even fewer unique rows (about 47%).</p>
  </div>

  <h2 id="bag-algo"><span class="num">03</span>The Bagging Algorithm</h2>
  <figure class="viz"><svg viewBox="0 0 640 210" width="640">
<defs><marker id="bag-al" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="80" width="95" height="50" rx="7" class="fs" stroke="currentColor"/><text x="57" y="102" text-anchor="middle" font-size="12">training data</text><text x="57" y="118" text-anchor="middle" class="tm" font-size="11">n rows</text>
<rect x="160" y="14" width="120" height="38" rx="6" class="fb sb" fill-opacity="0.3"/><text x="220" y="37" text-anchor="middle" font-size="12">bootstrap 1</text>
<rect x="160" y="86" width="120" height="38" rx="6" class="fb sb" fill-opacity="0.3"/><text x="220" y="109" text-anchor="middle" font-size="12">bootstrap 2</text>
<rect x="160" y="158" width="120" height="38" rx="6" class="fb sb" fill-opacity="0.3"/><text x="220" y="181" text-anchor="middle" font-size="12">bootstrap B</text>
<line x1="105" y1="95" x2="158" y2="35" stroke="currentColor" marker-end="url(#bag-al)"/><line x1="105" y1="105" x2="158" y2="105" stroke="currentColor" marker-end="url(#bag-al)"/><line x1="105" y1="115" x2="158" y2="175" stroke="currentColor" marker-end="url(#bag-al)"/>
<rect x="320" y="14" width="110" height="38" rx="6" class="ft st" fill-opacity="0.3"/><text x="375" y="37" text-anchor="middle" font-size="12">model h₁</text>
<rect x="320" y="86" width="110" height="38" rx="6" class="ft st" fill-opacity="0.3"/><text x="375" y="109" text-anchor="middle" font-size="12">model h₂</text>
<rect x="320" y="158" width="110" height="38" rx="6" class="ft st" fill-opacity="0.3"/><text x="375" y="181" text-anchor="middle" font-size="12">model h_B</text>
<line x1="280" y1="33" x2="318" y2="33" stroke="currentColor" marker-end="url(#bag-al)"/><line x1="280" y1="105" x2="318" y2="105" stroke="currentColor" marker-end="url(#bag-al)"/><line x1="280" y1="177" x2="318" y2="177" stroke="currentColor" marker-end="url(#bag-al)"/>
<text x="220" y="140" text-anchor="middle" class="tm" font-size="16">⋮</text><text x="375" y="140" text-anchor="middle" class="tm" font-size="16">⋮</text>
<rect x="470" y="78" width="160" height="54" rx="7" class="fg sg" fill-opacity="0.3"/><text x="550" y="100" text-anchor="middle" font-size="12">aggregate</text><text x="550" y="118" text-anchor="middle" class="tm" font-size="11">mean · vote · avg prob</text>
<line x1="430" y1="33" x2="468" y2="92" stroke="currentColor" marker-end="url(#bag-al)"/><line x1="430" y1="105" x2="468" y2="105" stroke="currentColor" marker-end="url(#bag-al)"/><line x1="430" y1="177" x2="468" y2="120" stroke="currentColor" marker-end="url(#bag-al)"/>
</svg><figcaption>Bagging: B bootstrap samples, the same algorithm trained on each (independently, so in parallel), and one combined answer.</figcaption></figure>
  <div class="callout def"><span class="label">Algorithm (bagging)</span>
    <p>Input: training set of n rows, a base algorithm, number of members B. <strong>For b = 1 … B</strong>: draw a bootstrap sample D_b (n rows with replacement); train h_b on D_b. <strong>Predict</strong>: regression f̂(x) = (1/B) Σ h_b(x); classification by majority vote of h_b(x), or by averaging class probabilities and taking the largest.</p>
  </div>
  <h3>Worked by hand: bagging three regression stumps</h3>
  <p>Six flats: size x (in hundreds of sq ft) and rent y (in thousands): x = 1…6, y = 2, 3, 5, 6, 8, 9. The base model is a <strong>stump</strong>: one cut, predict the mean on each side; the cut is the midpoint that gives the smallest sum of squared errors (SSE), exactly as in <a class="xref" data-note="ml_dtree">Decision Trees</a>. We use three fixed bootstrap samples (row numbers chosen in advance so you can follow along).</p>
  <p>Bootstrap 1 = x {1, 1, 2, 4, 5, 6}, y {2, 2, 3, 6, 8, 9}. Try the cut at 3.0 (between x = 2 and 4): left y {2, 2, 3}, mean 2.33, SSE (0.33² + 0.33² + 0.67²) = 0.67; right y {6, 8, 9}, mean 7.67, SSE (1.67² + 0.33² + 1.33²) = 4.67; total 5.33. The other cuts give 21.0, 11.25 and 28.8, so stump 1 = "x ≤ 3 → 2.33 else 7.67". The code does the same for all three samples.</p>
  <div class="fx" data-lang="py">import numpy as np
x = np.array([1, 2, 3, 4, 5, 6])
y = np.array([2, 3, 5, 6, 8, 9])
samples = [[0, 0, 1, 3, 4, 5], [1, 2, 2, 3, 5, 5], [0, 2, 3, 3, 4, 4]]   # row indices (0-based) of 3 bootstraps

def best_stump(xs, ys):
    best = None
    for t in (np.unique(xs)[:-1] + np.unique(xs)[1:]) / 2:          # midpoints between distinct x
        L, R = ys[xs &lt;= t], ys[xs &gt; t]
        sse = ((L - L.mean())**2).sum() + ((R - R.mean())**2).sum()
        print(f"     cut {t}: left mean {L.mean():.2f}, right mean {R.mean():.2f}, SSE {sse:.2f}")
        if best is None or sse &lt; best[0]:
            best = (sse, t, L.mean(), R.mean())
    return best[1:]

stumps = []
for b, idx in enumerate(samples):
    print(f"bootstrap {b+1}: x = {x[idx].tolist()}  y = {y[idx].tolist()}")
    t, l, r = best_stump(x[idx], y[idx])
    stumps.append((t, l, r))
    print(f"  -&gt; stump {b+1}: if x &lt;= {t} predict {l:.2f} else {r:.2f}")
P = np.array([[l if xi &lt;= t else r for xi in x] for t, l, r in stumps])
print("x:            ", x.tolist())
for b in range(3):
    print(f"stump {b+1}:      ", P[b].round(2).tolist())
print("bagged (mean):", P.mean(0).round(2).tolist())
# out-of-bag: each row is predicted only by the stumps whose sample did not contain it
sq = []
for i in range(6):
    who = [b for b in range(3) if i not in samples[b]]
    if who:
        p = P[who, i].mean(); sq.append((p - y[i])**2)
        print(f"row x={x[i]}: OOB for stumps {[w+1 for w in who]} -&gt; pred {p:.2f}, y {y[i]}, sq err {(p - y[i])**2:.2f}")
    else:
        print(f"row x={x[i]}: in every sample, no OOB prediction")
print(f"OOB MSE = {np.mean(sq):.2f}")
t, l, r = best_stump(x, y)                                           # one stump on all 6 rows
print(f"single stump on all rows: if x &lt;= {t} predict {l:.2f} else {r:.2f}")</div>
  <div class="fx" data-lang="text">bootstrap 1: x = [1, 1, 2, 4, 5, 6]  y = [2, 2, 3, 6, 8, 9]
     cut 1.5: left mean 2.00, right mean 6.50, SSE 21.00
     cut 3.0: left mean 2.33, right mean 7.67, SSE 5.33
     cut 4.5: left mean 3.25, right mean 8.50, SSE 11.25
     cut 5.5: left mean 4.20, right mean 9.00, SSE 28.80
  -&gt; stump 1: if x &lt;= 3.0 predict 2.33 else 7.67
bootstrap 2: x = [2, 3, 3, 4, 6, 6]  y = [3, 5, 5, 6, 9, 9]
     cut 2.5: left mean 3.00, right mean 6.80, SSE 16.80
     cut 3.5: left mean 4.33, right mean 8.00, SSE 8.67
     cut 5.0: left mean 4.75, right mean 9.00, SSE 4.75
  -&gt; stump 2: if x &lt;= 5.0 predict 4.75 else 9.00
bootstrap 3: x = [1, 3, 4, 4, 5, 5]  y = [2, 5, 6, 6, 8, 8]
     cut 2.0: left mean 2.00, right mean 6.60, SSE 7.20
     cut 3.5: left mean 3.50, right mean 7.00, SSE 8.50
     cut 4.5: left mean 4.75, right mean 8.00, SSE 10.75
  -&gt; stump 3: if x &lt;= 2.0 predict 2.00 else 6.60
x:             [1, 2, 3, 4, 5, 6]
stump 1:       [2.33, 2.33, 2.33, 7.67, 7.67, 7.67]
stump 2:       [4.75, 4.75, 4.75, 4.75, 4.75, 9.0]
stump 3:       [2.0, 2.0, 6.6, 6.6, 6.6, 6.6]
bagged (mean): [3.03, 3.03, 4.56, 6.34, 6.34, 7.76]
row x=1: OOB for stumps [2] -&gt; pred 4.75, y 2, sq err 7.56
row x=2: OOB for stumps [3] -&gt; pred 2.00, y 3, sq err 1.00
row x=3: OOB for stumps [1] -&gt; pred 2.33, y 5, sq err 7.11
row x=4: in every sample, no OOB prediction
row x=5: OOB for stumps [2] -&gt; pred 4.75, y 8, sq err 10.56
row x=6: OOB for stumps [3] -&gt; pred 6.60, y 9, sq err 5.76
OOB MSE = 6.40
     cut 1.5: left mean 2.00, right mean 6.20, SSE 22.80
     cut 2.5: left mean 2.50, right mean 7.00, SSE 10.50
     cut 3.5: left mean 3.33, right mean 7.67, SSE 9.33
     cut 4.5: left mean 4.00, right mean 8.50, SSE 10.50
     cut 5.5: left mean 4.80, right mean 9.00, SSE 22.80
single stump on all rows: if x &lt;= 3.5 predict 3.33 else 7.67</div>
  <table class="tbl">
    <tr><th>x</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th></tr>
    <tr><td>true y</td><td>2</td><td>3</td><td>5</td><td>6</td><td>8</td><td>9</td></tr>
    <tr><td>stump 1 (cut 3.0)</td><td>2.33</td><td>2.33</td><td>2.33</td><td>7.67</td><td>7.67</td><td>7.67</td></tr>
    <tr><td>stump 2 (cut 5.0)</td><td>4.75</td><td>4.75</td><td>4.75</td><td>4.75</td><td>4.75</td><td>9.00</td></tr>
    <tr><td>stump 3 (cut 2.0)</td><td>2.00</td><td>2.00</td><td>6.60</td><td>6.60</td><td>6.60</td><td>6.60</td></tr>
    <tr><td><b>bagged = mean</b></td><td><b>3.03</b></td><td><b>3.03</b></td><td><b>4.56</b></td><td><b>6.34</b></td><td><b>6.34</b></td><td><b>7.76</b></td></tr>
    <tr><td>single stump, all rows (cut 3.5)</td><td>3.33</td><td>3.33</td><td>3.33</td><td>7.67</td><td>7.67</td><td>7.67</td></tr>
  </table>
  <p>Check one column by hand: at x = 3, (2.33 + 4.75 + 6.60)/3 = 13.68/3 = 4.56. Because each bootstrap sample put its cut in a different place (3.0, 5.0, 2.0), the average is a <strong>4-step staircase</strong> that climbs with x, while a single stump can only ever give 2 levels. Averaging models that disagree about <em>where</em> to cut produces a smoother answer than any one of them.</p>
  <h3>Aggregation rules</h3>
  <table class="tbl">
    <tr><th>Task</th><th>Rule</th><th>Example (3 members)</th></tr>
    <tr><td>Regression</td><td>Mean of the numbers (median is a robust alternative)</td><td>4.75, 2.33, 6.60 → 4.56</td></tr>
    <tr><td>Classification, hard</td><td>Majority of predicted labels</td><td>churn, stay, stay → stay</td></tr>
    <tr><td>Classification, soft</td><td>Average class probabilities, take the largest</td><td>P(churn) 0.9, 0.4, 0.45 → 0.583 → churn</td></tr>
  </table>
  <p>The two classification rules can disagree (the last two rows above describe the same three members). sklearn's <code>BaggingClassifier</code> uses the <strong>soft</strong> rule whenever the base model has <code>predict_proba</code> (trees do), and falls back to hard voting otherwise. For a fully grown tree each leaf is pure, so its "probabilities" are 0 or 1 and the two rules almost coincide; they differ more for pruned trees or other models.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Averaging the <em>labels</em> 0/1 of regression-style members and rounding is hard voting, not soft. Soft voting needs real probabilities from each member.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> The staircase looked smoother, but we have not shown how much bagging helps, or why it helps some models more than others. The variance formula from the ensemble note gives a precise answer, and we can measure every piece of it.</div>

  <h2 id="bag-why"><span class="num">04</span>Why Variance Drops (and Bias Does Not)</h2>
  <h3>The formula, applied to bagging</h3>
  <p>From <a class="xref" data-note="ml_ensembles">Ensemble Learning</a>: the variance of an average of B members, each with variance σ² and pairwise correlation ρ, is <strong>ρσ² + (1 − ρ)σ²/B</strong>. For bagging, σ² is the variance of one bagged tree (across possible training sets <em>and</em> bootstrap draws), and ρ measures how similar two trees from the same bag are: both were drawn from the same training set, so ρ &gt; 0 always.</p>
  <p>The code measures σ² and ρ directly. It draws 200 training sets (150 noisy points from y = sin x), bags 25 deep trees on each, records every tree's predictions at 50 points, and then compares the formula with the actual variance of the bagged average.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import BaggingRegressor
rng = np.random.default_rng(0)
xg = np.linspace(0.2, 5.8, 50).reshape(-1, 1)            # 50 points where we watch predictions
B, T = 25, 200                                           # 25 trees per bag, 200 training sets
M = np.empty((T, B, len(xg)))                            # every member's prediction, every training set
for t in range(T):
    x = rng.uniform(0, 6, 150).reshape(-1, 1)
    y = np.sin(x).ravel() + rng.normal(0, 0.3, 150)
    bag = BaggingRegressor(DecisionTreeRegressor(), n_estimators=B, random_state=t).fit(x, y)
    M[t] = [tree.predict(xg) for tree in bag.estimators_]
sigma2 = M.var(axis=0).mean(axis=0)                      # variance of ONE member, per point (over training sets)
cov = np.mean([np.mean((M[:, i] - M[:, i].mean(0)) * (M[:, j] - M[:, j].mean(0)), axis=0)
               for i in range(B) for j in range(i)], axis=0)
rho = cov / sigma2                                        # correlation between two members of the same bag
actual = M.mean(axis=1).var(axis=0)                       # variance of the bagged average
print(f"one member: sigma^2 = {sigma2.mean():.4f}")
print(f"two members of one bag: rho = {rho.mean():.2f}")
for b in [1, 5, 25]:
    pred = (rho * sigma2 + (1 - rho) * sigma2 / b).mean()
    act = M[:, :b].mean(axis=1).var(axis=0).mean()
    print(f"bag of {b:2d}: formula rho*s2+(1-rho)*s2/B = {pred:.4f}   measured {act:.4f}")
print(f"floor as B -&gt; infinity: rho*sigma^2 = {(rho * sigma2).mean():.4f}")</div>
  <div class="fx" data-lang="text">one member: sigma^2 = 0.0894
two members of one bag: rho = 0.46
bag of  1: formula rho*s2+(1-rho)*s2/B = 0.0894   measured 0.0897
bag of  5: formula rho*s2+(1-rho)*s2/B = 0.0512   measured 0.0518
bag of 25: formula rho*s2+(1-rho)*s2/B = 0.0435   measured 0.0435
floor as B -&gt; infinity: rho*sigma^2 = 0.0416</div>
  <p>The two bagged trees are correlated at ρ = 0.46. The formula predicts the variance of a bag of 5 as 0.0512 (measured 0.0518) and of 25 as 0.0435 (measured 0.0435). The floor ρσ² = 0.0416 is already almost reached at 25 trees: bagging can cut a deep tree's variance roughly in half here, no more. To go lower you must lower ρ, which is exactly what <a class="xref" data-note="ml_rf">Random Forest</a> does.</p>
  <h3>What it looks like</h3>
  <figure class="viz"><svg viewBox="0 0 560 230" width="560">
<line x1="30" y1="110.0" x2="550" y2="110.0" stroke="currentColor" stroke-opacity="0.3"/>
<path d="M30.0,110.0 L30.9,109.4 L31.7,108.8 L32.6,108.2 L33.5,107.6 L34.3,107.0 L35.2,106.4 L36.1,105.8 L36.9,105.2 L37.8,104.7 L38.7,104.1 L39.5,103.5 L40.4,102.9 L41.3,102.3 L42.2,101.7 L43.0,101.1 L43.9,100.5 L44.8,99.9 L45.6,99.4 L46.5,98.8 L47.4,98.2 L48.2,97.6 L49.1,97.0 L50.0,96.4 L50.8,95.9 L51.7,95.3 L52.6,94.7 L53.4,94.1 L54.3,93.6 L55.2,93.0 L56.0,92.4 L56.9,91.9 L57.8,91.3 L58.6,90.7 L59.5,90.2 L60.4,89.6 L61.3,89.1 L62.1,88.5 L63.0,87.9 L63.9,87.4 L64.7,86.8 L65.6,86.3 L66.5,85.8 L67.3,85.2 L68.2,84.7 L69.1,84.1 L69.9,83.6 L70.8,83.1 L71.7,82.5 L72.5,82.0 L73.4,81.5 L74.3,81.0 L75.1,80.5 L76.0,79.9 L76.9,79.4 L77.7,78.9 L78.6,78.4 L79.5,77.9 L80.4,77.4 L81.2,76.9 L82.1,76.4 L83.0,75.9 L83.8,75.5 L84.7,75.0 L85.6,74.5 L86.4,74.0 L87.3,73.5 L88.2,73.1 L89.0,72.6 L89.9,72.2 L90.8,71.7 L91.6,71.2 L92.5,70.8 L93.4,70.4 L94.2,69.9 L95.1,69.5 L96.0,69.0 L96.8,68.6 L97.7,68.2 L98.6,67.8 L99.4,67.4 L100.3,66.9 L101.2,66.5 L102.1,66.1 L102.9,65.7 L103.8,65.3 L104.7,64.9 L105.5,64.6 L106.4,64.2 L107.3,63.8 L108.1,63.4 L109.0,63.1 L109.9,62.7 L110.7,62.3 L111.6,62.0 L112.5,61.6 L113.3,61.3 L114.2,61.0 L115.1,60.6 L115.9,60.3 L116.8,60.0 L117.7,59.7 L118.5,59.4 L119.4,59.0 L120.3,58.7 L121.2,58.4 L122.0,58.2 L122.9,57.9 L123.8,57.6 L124.6,57.3 L125.5,57.0 L126.4,56.8 L127.2,56.5 L128.1,56.3 L129.0,56.0 L129.8,55.8 L130.7,55.5 L131.6,55.3 L132.4,55.1 L133.3,54.8 L134.2,54.6 L135.0,54.4 L135.9,54.2 L136.8,54.0 L137.6,53.8 L138.5,53.6 L139.4,53.4 L140.3,53.3 L141.1,53.1 L142.0,52.9 L142.9,52.8 L143.7,52.6 L144.6,52.5 L145.5,52.3 L146.3,52.2 L147.2,52.0 L148.1,51.9 L148.9,51.8 L149.8,51.7 L150.7,51.6 L151.5,51.5 L152.4,51.4 L153.3,51.3 L154.1,51.2 L155.0,51.1 L155.9,51.0 L156.7,51.0 L157.6,50.9 L158.5,50.9 L159.3,50.8 L160.2,50.8 L161.1,50.7 L162.0,50.7 L162.8,50.7 L163.7,50.6 L164.6,50.6 L165.4,50.6 L166.3,50.6 L167.2,50.6 L168.0,50.6 L168.9,50.7 L169.8,50.7 L170.6,50.7 L171.5,50.7 L172.4,50.8 L173.2,50.8 L174.1,50.9 L175.0,50.9 L175.8,51.0 L176.7,51.1 L177.6,51.1 L178.4,51.2 L179.3,51.3 L180.2,51.4 L181.1,51.5 L181.9,51.6 L182.8,51.7 L183.7,51.8 L184.5,52.0 L185.4,52.1 L186.3,52.2 L187.1,52.4 L188.0,52.5 L188.9,52.7 L189.7,52.8 L190.6,53.0 L191.5,53.1 L192.3,53.3 L193.2,53.5 L194.1,53.7 L194.9,53.9 L195.8,54.1 L196.7,54.3 L197.5,54.5 L198.4,54.7 L199.3,54.9 L200.2,55.1 L201.0,55.4 L201.9,55.6 L202.8,55.8 L203.6,56.1 L204.5,56.3 L205.4,56.6 L206.2,56.9 L207.1,57.1 L208.0,57.4 L208.8,57.7 L209.7,58.0 L210.6,58.3 L211.4,58.6 L212.3,58.9 L213.2,59.2 L214.0,59.5 L214.9,59.8 L215.8,60.1 L216.6,60.4 L217.5,60.8 L218.4,61.1 L219.2,61.4 L220.1,61.8 L221.0,62.1 L221.9,62.5 L222.7,62.8 L223.6,63.2 L224.5,63.6 L225.3,63.9 L226.2,64.3 L227.1,64.7 L227.9,65.1 L228.8,65.5 L229.7,65.9 L230.5,66.3 L231.4,66.7 L232.3,67.1 L233.1,67.5 L234.0,67.9 L234.9,68.3 L235.7,68.8 L236.6,69.2 L237.5,69.6 L238.3,70.1 L239.2,70.5 L240.1,71.0 L241.0,71.4 L241.8,71.9 L242.7,72.3 L243.6,72.8 L244.4,73.2 L245.3,73.7 L246.2,74.2 L247.0,74.7 L247.9,75.1 L248.8,75.6 L249.6,76.1 L250.5,76.6 L251.4,77.1 L252.2,77.6 L253.1,78.1 L254.0,78.6 L254.8,79.1 L255.7,79.6 L256.6,80.1 L257.4,80.6 L258.3,81.2 L259.2,81.7 L260.1,82.2 L260.9,82.7 L261.8,83.3 L262.7,83.8 L263.5,84.3 L264.4,84.9 L265.3,85.4 L266.1,85.9 L267.0,86.5 L267.9,87.0 L268.7,87.6 L269.6,88.1 L270.5,88.7 L271.3,89.3 L272.2,89.8 L273.1,90.4 L273.9,90.9 L274.8,91.5 L275.7,92.1 L276.5,92.6 L277.4,93.2 L278.3,93.8 L279.1,94.3 L280.0,94.9 L280.9,95.5 L281.8,96.1 L282.6,96.7 L283.5,97.2 L284.4,97.8 L285.2,98.4 L286.1,99.0 L287.0,99.6 L287.8,100.2 L288.7,100.7 L289.6,101.3 L290.4,101.9 L291.3,102.5 L292.2,103.1 L293.0,103.7 L293.9,104.3 L294.8,104.9 L295.6,105.5 L296.5,106.1 L297.4,106.7 L298.2,107.2 L299.1,107.8 L300.0,108.4 L300.9,109.0 L301.7,109.6 L302.6,110.2 L303.5,110.8 L304.3,111.4 L305.2,112.0 L306.1,112.6 L306.9,113.2 L307.8,113.8 L308.7,114.4 L309.5,115.0 L310.4,115.6 L311.3,116.2 L312.1,116.7 L313.0,117.3 L313.9,117.9 L314.7,118.5 L315.6,119.1 L316.5,119.7 L317.3,120.3 L318.2,120.9 L319.1,121.4 L319.9,122.0 L320.8,122.6 L321.7,123.2 L322.6,123.8 L323.4,124.3 L324.3,124.9 L325.2,125.5 L326.0,126.1 L326.9,126.6 L327.8,127.2 L328.6,127.8 L329.5,128.3 L330.4,128.9 L331.2,129.5 L332.1,130.0 L333.0,130.6 L333.8,131.2 L334.7,131.7 L335.6,132.3 L336.4,132.8 L337.3,133.4 L338.2,133.9 L339.0,134.4 L339.9,135.0 L340.8,135.5 L341.7,136.1 L342.5,136.6 L343.4,137.1 L344.3,137.7 L345.1,138.2 L346.0,138.7 L346.9,139.2 L347.7,139.7 L348.6,140.2 L349.5,140.8 L350.3,141.3 L351.2,141.8 L352.1,142.3 L352.9,142.8 L353.8,143.3 L354.7,143.8 L355.5,144.2 L356.4,144.7 L357.3,145.2 L358.1,145.7 L359.0,146.2 L359.9,146.6 L360.8,147.1 L361.6,147.6 L362.5,148.0 L363.4,148.5 L364.2,148.9 L365.1,149.4 L366.0,149.8 L366.8,150.2 L367.7,150.7 L368.6,151.1 L369.4,151.5 L370.3,152.0 L371.2,152.4 L372.0,152.8 L372.9,153.2 L373.8,153.6 L374.6,154.0 L375.5,154.4 L376.4,154.8 L377.2,155.2 L378.1,155.6 L379.0,156.0 L379.8,156.3 L380.7,156.7 L381.6,157.1 L382.5,157.4 L383.3,157.8 L384.2,158.1 L385.1,158.5 L385.9,158.8 L386.8,159.2 L387.7,159.5 L388.5,159.8 L389.4,160.1 L390.3,160.4 L391.1,160.8 L392.0,161.1 L392.9,161.4 L393.7,161.7 L394.6,162.0 L395.5,162.2 L396.3,162.5 L397.2,162.8 L398.1,163.1 L398.9,163.3 L399.8,163.6 L400.7,163.8 L401.6,164.1 L402.4,164.3 L403.3,164.6 L404.2,164.8 L405.0,165.0 L405.9,165.2 L406.8,165.5 L407.6,165.7 L408.5,165.9 L409.4,166.1 L410.2,166.3 L411.1,166.5 L412.0,166.6 L412.8,166.8 L413.7,167.0 L414.6,167.1 L415.4,167.3 L416.3,167.5 L417.2,167.6 L418.0,167.7 L418.9,167.9 L419.8,168.0 L420.7,168.1 L421.5,168.3 L422.4,168.4 L423.3,168.5 L424.1,168.6 L425.0,168.7 L425.9,168.8 L426.7,168.8 L427.6,168.9 L428.5,169.0 L429.3,169.0 L430.2,169.1 L431.1,169.2 L431.9,169.2 L432.8,169.3 L433.7,169.3 L434.5,169.3 L435.4,169.3 L436.3,169.4 L437.1,169.4 L438.0,169.4 L438.9,169.4 L439.7,169.4 L440.6,169.4 L441.5,169.3 L442.4,169.3 L443.2,169.3 L444.1,169.2 L445.0,169.2 L445.8,169.2 L446.7,169.1 L447.6,169.0 L448.4,169.0 L449.3,168.9 L450.2,168.8 L451.0,168.7 L451.9,168.7 L452.8,168.6 L453.6,168.5 L454.5,168.4 L455.4,168.2 L456.2,168.1 L457.1,168.0 L458.0,167.9 L458.8,167.7 L459.7,167.6 L460.6,167.4 L461.5,167.3 L462.3,167.1 L463.2,167.0 L464.1,166.8 L464.9,166.6 L465.8,166.4 L466.7,166.2 L467.5,166.1 L468.4,165.9 L469.3,165.7 L470.1,165.4 L471.0,165.2 L471.9,165.0 L472.7,164.8 L473.6,164.5 L474.5,164.3 L475.3,164.1 L476.2,163.8 L477.1,163.6 L477.9,163.3 L478.8,163.0 L479.7,162.8 L480.6,162.5 L481.4,162.2 L482.3,161.9 L483.2,161.6 L484.0,161.3 L484.9,161.0 L485.8,160.7 L486.6,160.4 L487.5,160.1 L488.4,159.8 L489.2,159.5 L490.1,159.1 L491.0,158.8 L491.8,158.4 L492.7,158.1 L493.6,157.7 L494.4,157.4 L495.3,157.0 L496.2,156.7 L497.0,156.3 L497.9,155.9 L498.8,155.5 L499.6,155.2 L500.5,154.8 L501.4,154.4 L502.3,154.0 L503.1,153.6 L504.0,153.2 L504.9,152.8 L505.7,152.3 L506.6,151.9 L507.5,151.5 L508.3,151.1 L509.2,150.6 L510.1,150.2 L510.9,149.8 L511.8,149.3 L512.7,148.9 L513.5,148.4 L514.4,148.0 L515.3,147.5 L516.1,147.0 L517.0,146.6 L517.9,146.1 L518.7,145.6 L519.6,145.2 L520.5,144.7 L521.4,144.2 L522.2,143.7 L523.1,143.2 L524.0,142.7 L524.8,142.2 L525.7,141.7 L526.6,141.2 L527.4,140.7 L528.3,140.2 L529.2,139.7 L530.0,139.2 L530.9,138.7 L531.8,138.1 L532.6,137.6 L533.5,137.1 L534.4,136.5 L535.2,136.0 L536.1,135.5 L537.0,134.9 L537.8,134.4 L538.7,133.9 L539.6,133.3 L540.5,132.8 L541.3,132.2 L542.2,131.7 L543.1,131.1 L543.9,130.5 L544.8,130.0 L545.7,129.4 L546.5,128.9 L547.4,128.3 L548.3,127.7 L549.1,127.2 L550.0,126.6" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.6"/>
<path d="M30.0,94.5 L30.9,94.5 L31.7,94.5 L32.6,94.5 L33.5,94.5 L34.3,89.9 L35.2,89.9 L36.1,89.9 L36.9,89.9 L37.8,89.9 L38.7,114.2 L39.5,114.2 L40.4,114.2 L41.3,114.2 L42.2,114.2 L43.0,114.2 L43.9,114.2 L44.8,114.2 L45.6,114.2 L46.5,114.2 L47.4,95.3 L48.2,95.3 L49.1,95.3 L50.0,95.3 L50.8,95.3 L51.7,95.3 L52.6,95.3 L53.4,95.3 L54.3,95.3 L55.2,68.8 L56.0,68.8 L56.9,98.2 L57.8,98.2 L58.6,98.2 L59.5,98.2 L60.4,85.5 L61.3,85.5 L62.1,85.5 L63.0,88.1 L63.9,88.1 L64.7,88.1 L65.6,88.1 L66.5,88.1 L67.3,88.1 L68.2,88.1 L69.1,69.9 L69.9,69.9 L70.8,69.9 L71.7,69.9 L72.5,69.9 L73.4,69.9 L74.3,69.9 L75.1,69.9 L76.0,69.9 L76.9,69.9 L77.7,69.9 L78.6,69.9 L79.5,69.9 L80.4,69.9 L81.2,69.9 L82.1,69.9 L83.0,69.9 L83.8,69.9 L84.7,69.9 L85.6,69.9 L86.4,69.9 L87.3,69.9 L88.2,69.9 L89.0,69.9 L89.9,69.9 L90.8,69.9 L91.6,70.2 L92.5,70.2 L93.4,70.2 L94.2,70.2 L95.1,70.2 L96.0,70.2 L96.8,70.2 L97.7,70.2 L98.6,70.2 L99.4,70.2 L100.3,70.2 L101.2,70.2 L102.1,70.2 L102.9,70.2 L103.8,70.2 L104.7,70.2 L105.5,70.2 L106.4,70.2 L107.3,70.2 L108.1,70.2 L109.0,70.2 L109.9,70.2 L110.7,70.2 L111.6,70.2 L112.5,70.2 L113.3,70.2 L114.2,70.2 L115.1,70.2 L115.9,70.2 L116.8,70.2 L117.7,70.2 L118.5,70.2 L119.4,70.2 L120.3,70.2 L121.2,70.2 L122.0,57.0 L122.9,57.0 L123.8,57.0 L124.6,57.0 L125.5,57.0 L126.4,57.0 L127.2,57.0 L128.1,57.0 L129.0,57.0 L129.8,57.0 L130.7,57.0 L131.6,57.0 L132.4,57.0 L133.3,57.0 L134.2,57.0 L135.0,57.0 L135.9,57.0 L136.8,57.0 L137.6,57.0 L138.5,57.0 L139.4,57.0 L140.3,57.0 L141.1,57.0 L142.0,47.6 L142.9,47.6 L143.7,47.6 L144.6,47.6 L145.5,47.6 L146.3,47.6 L147.2,47.6 L148.1,47.6 L148.9,47.6 L149.8,47.6 L150.7,49.6 L151.5,49.6 L152.4,66.8 L153.3,35.4 L154.1,74.3 L155.0,74.3 L155.9,74.3 L156.7,74.3 L157.6,74.3 L158.5,74.3 L159.3,74.3 L160.2,74.3 L161.1,74.3 L162.0,74.3 L162.8,74.3 L163.7,72.1 L164.6,72.1 L165.4,72.1 L166.3,72.1 L167.2,72.1 L168.0,72.1 L168.9,72.1 L169.8,72.1 L170.6,72.1 L171.5,72.1 L172.4,72.1 L173.2,72.1 L174.1,72.1 L175.0,74.1 L175.8,74.1 L176.7,74.1 L177.6,74.1 L178.4,74.1 L179.3,74.1 L180.2,74.1 L181.1,74.1 L181.9,74.1 L182.8,74.1 L183.7,74.1 L184.5,74.1 L185.4,74.1 L186.3,74.1 L187.1,36.6 L188.0,36.6 L188.9,36.6 L189.7,36.6 L190.6,36.6 L191.5,36.6 L192.3,36.6 L193.2,36.6 L194.1,36.6 L194.9,36.6 L195.8,60.6 L196.7,60.6 L197.5,60.6 L198.4,72.1 L199.3,72.1 L200.2,72.1 L201.0,72.1 L201.9,72.1 L202.8,72.1 L203.6,72.1 L204.5,72.1 L205.4,72.1 L206.2,72.1 L207.1,72.1 L208.0,72.1 L208.8,72.1 L209.7,72.1 L210.6,82.5 L211.4,82.5 L212.3,82.5 L213.2,82.5 L214.0,82.5 L214.9,82.5 L215.8,82.5 L216.6,82.5 L217.5,82.5 L218.4,82.5 L219.2,82.5 L220.1,82.5 L221.0,82.5 L221.9,82.5 L222.7,82.5 L223.6,82.5 L224.5,82.5 L225.3,58.2 L226.2,58.2 L227.1,58.2 L227.9,58.2 L228.8,58.2 L229.7,58.2 L230.5,58.2 L231.4,58.2 L232.3,86.7 L233.1,86.7 L234.0,86.7 L234.9,86.7 L235.7,86.7 L236.6,92.4 L237.5,92.4 L238.3,92.4 L239.2,92.4 L240.1,61.2 L241.0,61.2 L241.8,61.2 L242.7,61.2 L243.6,61.2 L244.4,61.2 L245.3,61.2 L246.2,61.2 L247.0,61.2 L247.9,61.2 L248.8,61.2 L249.6,101.2 L250.5,101.2 L251.4,101.2 L252.2,101.2 L253.1,101.2 L254.0,101.2 L254.8,101.2 L255.7,101.2 L256.6,101.2 L257.4,86.2 L258.3,86.2 L259.2,86.2 L260.1,86.2 L260.9,84.3 L261.8,84.3 L262.7,84.3 L263.5,84.3 L264.4,84.3 L265.3,84.3 L266.1,84.3 L267.0,84.3 L267.9,84.3 L268.7,84.3 L269.6,84.3 L270.5,84.3 L271.3,84.3 L272.2,84.3 L273.1,84.3 L273.9,84.3 L274.8,107.1 L275.7,107.1 L276.5,107.1 L277.4,107.1 L278.3,107.1 L279.1,107.1 L280.0,107.1 L280.9,107.1 L281.8,107.1 L282.6,107.1 L283.5,107.1 L284.4,107.1 L285.2,107.1 L286.1,107.1 L287.0,107.1 L287.8,107.1 L288.7,107.1 L289.6,103.8 L290.4,103.8 L291.3,103.8 L292.2,103.8 L293.0,80.0 L293.9,113.3 L294.8,113.3 L295.6,113.3 L296.5,129.5 L297.4,129.5 L298.2,129.5 L299.1,129.5 L300.0,129.5 L300.9,129.5 L301.7,129.5 L302.6,129.5 L303.5,129.5 L304.3,129.5 L305.2,129.5 L306.1,129.5 L306.9,129.5 L307.8,129.5 L308.7,154.0 L309.5,154.0 L310.4,154.0 L311.3,154.0 L312.1,154.0 L313.0,154.0 L313.9,154.0 L314.7,154.0 L315.6,154.0 L316.5,154.0 L317.3,154.0 L318.2,154.0 L319.1,125.2 L319.9,125.2 L320.8,125.2 L321.7,125.2 L322.6,125.2 L323.4,125.2 L324.3,125.2 L325.2,125.2 L326.0,125.2 L326.9,125.2 L327.8,125.2 L328.6,125.2 L329.5,125.2 L330.4,125.2 L331.2,125.2 L332.1,125.2 L333.0,125.2 L333.8,125.2 L334.7,125.2 L335.6,125.2 L336.4,125.2 L337.3,125.2 L338.2,125.2 L339.0,125.2 L339.9,125.2 L340.8,125.2 L341.7,125.2 L342.5,125.2 L343.4,125.2 L344.3,157.7 L345.1,157.7 L346.0,157.7 L346.9,157.7 L347.7,157.7 L348.6,157.7 L349.5,157.7 L350.3,157.7 L351.2,157.7 L352.1,157.7 L352.9,157.7 L353.8,157.7 L354.7,157.7 L355.5,157.7 L356.4,157.7 L357.3,157.7 L358.1,157.7 L359.0,157.7 L359.9,157.7 L360.8,157.7 L361.6,157.7 L362.5,157.7 L363.4,157.7 L364.2,157.7 L365.1,157.7 L366.0,157.7 L366.8,157.7 L367.7,157.7 L368.6,157.7 L369.4,157.7 L370.3,157.7 L371.2,157.7 L372.0,157.7 L372.9,157.7 L373.8,157.7 L374.6,157.7 L375.5,152.0 L376.4,152.0 L377.2,152.0 L378.1,152.0 L379.0,152.0 L379.8,152.0 L380.7,152.0 L381.6,165.5 L382.5,165.5 L383.3,166.2 L384.2,166.2 L385.1,166.2 L385.9,166.2 L386.8,166.2 L387.7,166.2 L388.5,174.3 L389.4,174.3 L390.3,174.3 L391.1,174.3 L392.0,174.3 L392.9,174.3 L393.7,174.3 L394.6,174.3 L395.5,174.3 L396.3,172.3 L397.2,172.3 L398.1,172.3 L398.9,172.3 L399.8,172.3 L400.7,172.3 L401.6,172.3 L402.4,172.3 L403.3,172.3 L404.2,172.3 L405.0,172.3 L405.9,172.3 L406.8,164.5 L407.6,164.5 L408.5,164.5 L409.4,164.5 L410.2,164.5 L411.1,164.5 L412.0,164.5 L412.8,164.5 L413.7,164.5 L414.6,164.5 L415.4,164.5 L416.3,164.5 L417.2,164.5 L418.0,164.5 L418.9,164.5 L419.8,164.5 L420.7,164.5 L421.5,164.5 L422.4,164.5 L423.3,164.5 L424.1,164.5 L425.0,164.5 L425.9,164.5 L426.7,164.5 L427.6,164.5 L428.5,164.5 L429.3,164.5 L430.2,164.5 L431.1,176.0 L431.9,176.0 L432.8,176.0 L433.7,176.0 L434.5,176.0 L435.4,176.0 L436.3,176.0 L437.1,176.0 L438.0,176.0 L438.9,176.0 L439.7,176.0 L440.6,176.0 L441.5,176.0 L442.4,176.0 L443.2,176.0 L444.1,176.0 L445.0,176.0 L445.8,167.4 L446.7,167.4 L447.6,135.1 L448.4,135.1 L449.3,160.4 L450.2,196.9 L451.0,196.9 L451.9,196.9 L452.8,196.9 L453.6,196.9 L454.5,196.9 L455.4,196.9 L456.2,196.9 L457.1,196.9 L458.0,196.9 L458.8,196.9 L459.7,134.8 L460.6,134.8 L461.5,134.8 L462.3,134.8 L463.2,134.8 L464.1,134.8 L464.9,134.8 L465.8,134.8 L466.7,134.8 L467.5,134.8 L468.4,134.8 L469.3,159.4 L470.1,159.4 L471.0,159.4 L471.9,159.4 L472.7,159.4 L473.6,159.4 L474.5,159.4 L475.3,159.4 L476.2,178.6 L477.1,178.6 L477.9,178.6 L478.8,178.6 L479.7,178.6 L480.6,178.6 L481.4,178.6 L482.3,178.6 L483.2,145.3 L484.0,145.3 L484.9,145.3 L485.8,159.8 L486.6,159.8 L487.5,159.8 L488.4,159.8 L489.2,159.8 L490.1,159.8 L491.0,159.8 L491.8,167.9 L492.7,167.9 L493.6,167.9 L494.4,167.9 L495.3,167.9 L496.2,167.9 L497.0,167.7 L497.9,167.7 L498.8,167.7 L499.6,167.7 L500.5,167.7 L501.4,167.7 L502.3,167.7 L503.1,167.7 L504.0,167.7 L504.9,167.7 L505.7,167.7 L506.6,165.2 L507.5,165.2 L508.3,165.2 L509.2,165.2 L510.1,165.2 L510.9,165.2 L511.8,165.2 L512.7,165.2 L513.5,165.2 L514.4,165.2 L515.3,165.2 L516.1,145.8 L517.0,145.8 L517.9,145.8 L518.7,145.8 L519.6,145.8 L520.5,145.8 L521.4,123.4 L522.2,123.4 L523.1,123.4 L524.0,123.4 L524.8,123.4 L525.7,123.4 L526.6,123.4 L527.4,123.4 L528.3,123.4 L529.2,123.4 L530.0,123.4 L530.9,141.0 L531.8,141.0 L532.6,141.0 L533.5,141.0 L534.4,141.0 L535.2,141.0 L536.1,141.0 L537.0,141.0 L537.8,141.0 L538.7,141.0 L539.6,141.0 L540.5,141.0 L541.3,141.0 L542.2,141.0 L543.1,141.0 L543.9,119.4 L544.8,119.4 L545.7,119.4 L546.5,119.4 L547.4,119.4 L548.3,119.4 L549.1,119.4 L550.0,119.4" fill="none" class="sr" stroke-width="1.3"/>
<path d="M30.0,95.1 L30.9,95.1 L31.7,95.1 L32.6,95.1 L33.5,95.1 L34.3,93.1 L35.2,95.8 L36.1,95.8 L36.9,95.8 L37.8,95.8 L38.7,105.8 L39.5,105.8 L40.4,105.8 L41.3,105.8 L42.2,105.8 L43.0,105.4 L43.9,105.4 L44.8,105.4 L45.6,106.2 L46.5,104.8 L47.4,96.6 L48.2,90.9 L49.1,90.1 L50.0,90.1 L50.8,89.4 L51.7,89.2 L52.6,89.2 L53.4,89.1 L54.3,89.1 L55.2,77.6 L56.0,78.0 L56.9,89.1 L57.8,88.6 L58.6,91.8 L59.5,92.6 L60.4,88.4 L61.3,86.8 L62.1,86.8 L63.0,87.8 L63.9,87.8 L64.7,87.8 L65.6,87.9 L66.5,86.5 L67.3,86.5 L68.2,84.2 L69.1,76.4 L69.9,76.4 L70.8,76.4 L71.7,76.4 L72.5,76.4 L73.4,76.4 L74.3,76.2 L75.1,76.2 L76.0,76.2 L76.9,76.2 L77.7,76.2 L78.6,76.2 L79.5,76.2 L80.4,76.2 L81.2,76.2 L82.1,76.2 L83.0,75.2 L83.8,75.2 L84.7,74.6 L85.6,72.1 L86.4,72.1 L87.3,72.1 L88.2,72.1 L89.0,72.1 L89.9,72.1 L90.8,72.1 L91.6,72.2 L92.5,72.2 L93.4,72.2 L94.2,72.2 L95.1,72.0 L96.0,72.0 L96.8,72.0 L97.7,71.8 L98.6,71.8 L99.4,71.3 L100.3,70.2 L101.2,70.2 L102.1,70.2 L102.9,70.2 L103.8,69.7 L104.7,69.7 L105.5,67.9 L106.4,66.9 L107.3,66.9 L108.1,66.7 L109.0,66.7 L109.9,66.7 L110.7,66.7 L111.6,65.2 L112.5,65.2 L113.3,64.9 L114.2,64.7 L115.1,64.7 L115.9,64.7 L116.8,64.7 L117.7,64.6 L118.5,64.6 L119.4,64.6 L120.3,64.6 L121.2,64.6 L122.0,59.2 L122.9,59.2 L123.8,59.2 L124.6,59.2 L125.5,59.2 L126.4,59.2 L127.2,59.2 L128.1,55.4 L129.0,55.4 L129.8,54.3 L130.7,53.9 L131.6,53.9 L132.4,53.9 L133.3,53.9 L134.2,53.9 L135.0,53.9 L135.9,53.9 L136.8,53.9 L137.6,53.9 L138.5,53.9 L139.4,53.9 L140.3,53.9 L141.1,53.9 L142.0,50.0 L142.9,50.0 L143.7,50.0 L144.6,49.4 L145.5,49.6 L146.3,49.6 L147.2,49.6 L148.1,49.6 L148.9,49.6 L149.8,49.6 L150.7,52.9 L151.5,52.9 L152.4,57.2 L153.3,44.5 L154.1,62.9 L155.0,62.9 L155.9,62.9 L156.7,62.9 L157.6,63.0 L158.5,63.0 L159.3,63.0 L160.2,63.1 L161.1,63.1 L162.0,64.0 L162.8,70.4 L163.7,69.7 L164.6,69.7 L165.4,70.1 L166.3,72.1 L167.2,72.0 L168.0,72.0 L168.9,72.0 L169.8,72.0 L170.6,72.0 L171.5,72.0 L172.4,72.0 L173.2,72.0 L174.1,71.8 L175.0,70.7 L175.8,70.4 L176.7,70.4 L177.6,70.4 L178.4,70.4 L179.3,70.4 L180.2,70.4 L181.1,70.4 L181.9,70.4 L182.8,70.4 L183.7,65.6 L184.5,64.6 L185.4,64.6 L186.3,64.6 L187.1,47.4 L188.0,45.8 L188.9,45.7 L189.7,45.7 L190.6,45.7 L191.5,45.6 L192.3,45.6 L193.2,45.6 L194.1,45.6 L194.9,45.6 L195.8,54.8 L196.7,54.8 L197.5,62.1 L198.4,66.3 L199.3,66.3 L200.2,66.4 L201.0,66.4 L201.9,66.4 L202.8,66.4 L203.6,66.4 L204.5,66.4 L205.4,66.4 L206.2,66.4 L207.1,66.4 L208.0,69.2 L208.8,72.8 L209.7,72.8 L210.6,77.1 L211.4,77.1 L212.3,77.4 L213.2,77.3 L214.0,77.3 L214.9,75.8 L215.8,76.3 L216.6,77.5 L217.5,77.6 L218.4,77.8 L219.2,77.8 L220.1,77.8 L221.0,77.7 L221.9,77.7 L222.7,77.7 L223.6,77.7 L224.5,77.7 L225.3,67.1 L226.2,67.1 L227.1,67.1 L227.9,67.8 L228.8,67.8 L229.7,68.2 L230.5,68.2 L231.4,68.2 L232.3,78.7 L233.1,78.7 L234.0,84.1 L234.9,84.1 L235.7,84.1 L236.6,86.6 L237.5,86.6 L238.3,83.1 L239.2,83.2 L240.1,69.8 L241.0,69.8 L241.8,69.8 L242.7,69.8 L243.6,70.9 L244.4,70.9 L245.3,71.8 L246.2,71.8 L247.0,72.9 L247.9,72.4 L248.8,72.4 L249.6,88.6 L250.5,92.5 L251.4,92.5 L252.2,92.5 L253.1,94.1 L254.0,94.1 L254.8,94.1 L255.7,94.1 L256.6,94.1 L257.4,88.2 L258.3,88.2 L259.2,88.2 L260.1,85.8 L260.9,85.0 L261.8,85.0 L262.7,85.0 L263.5,85.0 L264.4,86.4 L265.3,86.4 L266.1,86.4 L267.0,86.4 L267.9,86.6 L268.7,86.6 L269.6,86.6 L270.5,86.6 L271.3,86.8 L272.2,89.3 L273.1,89.3 L273.9,89.3 L274.8,100.2 L275.7,100.0 L276.5,100.0 L277.4,100.0 L278.3,102.8 L279.1,102.6 L280.0,102.6 L280.9,103.1 L281.8,103.1 L282.6,103.1 L283.5,103.1 L284.4,103.1 L285.2,103.1 L286.1,103.1 L287.0,103.1 L287.8,103.1 L288.7,103.1 L289.6,101.9 L290.4,98.3 L291.3,98.6 L292.2,98.6 L293.0,91.6 L293.9,104.3 L294.8,104.3 L295.6,105.1 L296.5,119.6 L297.4,119.6 L298.2,119.6 L299.1,119.6 L300.0,119.6 L300.9,119.6 L301.7,119.6 L302.6,119.6 L303.5,119.8 L304.3,119.8 L305.2,119.8 L306.1,120.6 L306.9,134.7 L307.8,134.7 L308.7,144.6 L309.5,144.6 L310.4,144.6 L311.3,144.6 L312.1,144.6 L313.0,144.6 L313.9,144.6 L314.7,144.6 L315.6,144.6 L316.5,144.6 L317.3,144.6 L318.2,144.6 L319.1,132.8 L319.9,132.8 L320.8,132.8 L321.7,132.8 L322.6,132.8 L323.4,132.8 L324.3,132.8 L325.2,132.8 L326.0,132.8 L326.9,132.8 L327.8,132.8 L328.6,133.1 L329.5,133.1 L330.4,133.1 L331.2,133.6 L332.1,134.3 L333.0,134.3 L333.8,136.5 L334.7,136.5 L335.6,136.5 L336.4,136.5 L337.3,136.5 L338.2,137.0 L339.0,137.0 L339.9,137.2 L340.8,137.6 L341.7,137.6 L342.5,137.6 L343.4,137.6 L344.3,151.4 L345.1,151.4 L346.0,151.4 L346.9,151.4 L347.7,151.4 L348.6,151.4 L349.5,151.4 L350.3,154.9 L351.2,157.1 L352.1,157.1 L352.9,157.1 L353.8,157.1 L354.7,157.1 L355.5,157.1 L356.4,157.4 L357.3,157.4 L358.1,157.4 L359.0,157.4 L359.9,157.4 L360.8,157.4 L361.6,157.4 L362.5,157.4 L363.4,157.4 L364.2,157.4 L365.1,157.4 L366.0,157.4 L366.8,157.4 L367.7,157.4 L368.6,157.4 L369.4,157.4 L370.3,157.4 L371.2,157.4 L372.0,157.4 L372.9,157.4 L373.8,157.4 L374.6,157.4 L375.5,155.0 L376.4,156.8 L377.2,156.8 L378.1,156.8 L379.0,156.8 L379.8,156.8 L380.7,156.8 L381.6,162.1 L382.5,164.5 L383.3,164.8 L384.2,165.1 L385.1,165.1 L385.9,165.1 L386.8,165.1 L387.7,167.6 L388.5,170.8 L389.4,171.0 L390.3,171.4 L391.1,172.7 L392.0,172.7 L392.9,172.7 L393.7,172.7 L394.6,172.7 L395.5,172.7 L396.3,171.8 L397.2,171.8 L398.1,171.8 L398.9,172.0 L399.8,171.9 L400.7,171.9 L401.6,171.9 L402.4,171.9 L403.3,171.9 L404.2,171.9 L405.0,170.8 L405.9,170.8 L406.8,167.4 L407.6,167.4 L408.5,167.4 L409.4,167.4 L410.2,167.4 L411.1,167.4 L412.0,167.4 L412.8,167.4 L413.7,167.4 L414.6,167.6 L415.4,167.6 L416.3,167.6 L417.2,167.6 L418.0,167.6 L418.9,167.6 L419.8,167.6 L420.7,167.6 L421.5,167.6 L422.4,167.9 L423.3,166.6 L424.1,166.5 L425.0,166.5 L425.9,166.5 L426.7,166.5 L427.6,166.5 L428.5,166.5 L429.3,166.5 L430.2,166.5 L431.1,171.6 L431.9,171.6 L432.8,169.9 L433.7,170.4 L434.5,170.4 L435.4,170.4 L436.3,170.4 L437.1,170.4 L438.0,170.4 L438.9,170.4 L439.7,170.4 L440.6,170.4 L441.5,170.4 L442.4,170.4 L443.2,170.4 L444.1,170.4 L445.0,170.4 L445.8,167.1 L446.7,167.1 L447.6,146.5 L448.4,148.3 L449.3,159.3 L450.2,184.3 L451.0,184.3 L451.9,184.3 L452.8,184.3 L453.6,184.3 L454.5,184.3 L455.4,184.3 L456.2,184.3 L457.1,184.3 L458.0,183.4 L458.8,183.4 L459.7,156.4 L460.6,148.4 L461.5,148.4 L462.3,148.4 L463.2,148.4 L464.1,148.4 L464.9,148.4 L465.8,149.0 L466.7,148.0 L467.5,147.2 L468.4,147.2 L469.3,155.1 L470.1,155.1 L471.0,155.1 L471.9,155.1 L472.7,155.1 L473.6,155.1 L474.5,155.1 L475.3,155.1 L476.2,170.8 L477.1,169.5 L477.9,169.5 L478.8,170.2 L479.7,170.2 L480.6,170.2 L481.4,170.2 L482.3,170.2 L483.2,155.8 L484.0,155.8 L484.9,155.8 L485.8,158.5 L486.6,158.5 L487.5,158.5 L488.4,158.5 L489.2,157.5 L490.1,160.8 L491.0,162.8 L491.8,166.2 L492.7,167.4 L493.6,167.4 L494.4,167.4 L495.3,167.4 L496.2,167.4 L497.0,167.3 L497.9,167.3 L498.8,167.3 L499.6,167.2 L500.5,167.2 L501.4,167.4 L502.3,167.2 L503.1,167.2 L504.0,167.2 L504.9,167.2 L505.7,166.6 L506.6,164.7 L507.5,161.1 L508.3,161.1 L509.2,161.1 L510.1,161.1 L510.9,157.3 L511.8,157.3 L512.7,157.1 L513.5,157.1 L514.4,157.1 L515.3,157.1 L516.1,149.4 L517.0,149.0 L517.9,149.0 L518.7,149.0 L519.6,149.0 L520.5,142.9 L521.4,133.8 L522.2,133.8 L523.1,133.3 L524.0,133.1 L524.8,133.1 L525.7,133.1 L526.6,131.5 L527.4,131.0 L528.3,131.0 L529.2,131.0 L530.0,131.0 L530.9,138.8 L531.8,138.8 L532.6,137.7 L533.5,135.4 L534.4,135.4 L535.2,135.4 L536.1,135.4 L537.0,135.4 L537.8,134.9 L538.7,134.9 L539.6,134.9 L540.5,134.9 L541.3,134.9 L542.2,134.9 L543.1,134.9 L543.9,125.8 L544.8,125.8 L545.7,125.8 L546.5,125.8 L547.4,125.8 L548.3,125.8 L549.1,125.8 L550.0,125.8" fill="none" class="sb" stroke-width="2.2"/>
<circle cx="30.6" cy="94.5" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="37.6" cy="89.9" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="39.6" cy="114.2" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="53.5" cy="95.3" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="55.4" cy="68.8" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="58.0" cy="98.2" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="61.6" cy="85.5" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="63.4" cy="88.1" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="74.6" cy="69.9" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="107.5" cy="70.2" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="135.7" cy="57.0" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="148.2" cy="47.6" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="151.9" cy="49.6" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="152.5" cy="66.8" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="152.8" cy="35.4" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="154.9" cy="74.3" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="171.2" cy="72.1" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="178.6" cy="74.1" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="194.6" cy="36.6" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="196.3" cy="60.6" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="199.0" cy="72.1" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="221.3" cy="82.5" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="229.4" cy="58.2" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="234.1" cy="86.7" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="237.7" cy="92.4" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="242.4" cy="61.2" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="256.2" cy="101.2" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="257.1" cy="86.2" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="263.2" cy="84.3" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="286.4" cy="107.1" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="291.7" cy="103.8" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="293.3" cy="80.0" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="293.7" cy="113.3" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="298.0" cy="129.5" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="318.9" cy="154.0" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="319.2" cy="125.2" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="369.2" cy="157.7" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="380.7" cy="152.0" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="381.9" cy="165.5" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="383.2" cy="166.2" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="393.2" cy="174.3" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="397.9" cy="172.3" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="415.5" cy="164.5" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="445.4" cy="176.0" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="445.9" cy="167.4" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="448.6" cy="135.1" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="449.2" cy="160.4" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="450.1" cy="196.9" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="469.0" cy="134.8" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="469.4" cy="159.4" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="482.4" cy="178.6" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="483.5" cy="145.3" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="487.4" cy="159.8" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="495.6" cy="167.9" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="496.8" cy="167.7" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="515.3" cy="165.2" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="516.9" cy="145.8" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="524.5" cy="123.4" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="536.6" cy="141.0" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<circle cx="549.6" cy="119.4" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="360" y="27" class="tr" font-size="12">red: one deep tree</text>
<text x="360" y="43" class="tb" font-size="12">blue: bagging, 200 trees</text>
<text x="360" y="59" class="tm" font-size="12">dashed: true curve sin(x)</text>
<text x="30" y="224" class="tm" font-size="11">x from 0 to 6 · 60 noisy training points</text>
</svg><figcaption>One deep tree (red) jumps to every noisy point. The average of 200 bagged trees (blue) still bends toward the data, but its jumps are smaller and it stays closer to the true curve (dashed): mean squared distance from the truth 0.059 for the tree, 0.028 for the bag. Drawn from a real run.</figcaption></figure>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import BaggingRegressor
rng = np.random.default_rng(5)
x = np.sort(rng.uniform(0, 6, 60)).reshape(-1, 1)
y = np.sin(x).ravel() + rng.normal(0, 0.3, 60)
g = np.linspace(0, 6, 600).reshape(-1, 1)
one = DecisionTreeRegressor(random_state=0).fit(x, y).predict(g)
bag = BaggingRegressor(DecisionTreeRegressor(), n_estimators=200, random_state=0).fit(x, y).predict(g)
W, H, L, T = 560, 230, 30, 15
X = lambda v: L + v / 6 * (W - L - 10)
Y = lambda v: T + (1.6 - v) / 3.2 * (H - T - 25)
path = lambda ys: "M" + " L".join(f"{X(a):.1f},{Y(b):.1f}" for a, b in zip(g.ravel(), ys))
s = [f'&lt;figure class="viz"&gt;&lt;svg viewBox="0 0 {W} {H}" width="{W}"&gt;']
s.append(f'&lt;line x1="{L}" y1="{Y(0):.1f}" x2="{W-10}" y2="{Y(0):.1f}" stroke="currentColor" stroke-opacity="0.3"/&gt;')
s.append(f'&lt;path d="{path(np.sin(g.ravel()))}" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.6"/&gt;')
s.append(f'&lt;path d="{path(one)}" fill="none" class="sr" stroke-width="1.3"/&gt;')
s.append(f'&lt;path d="{path(bag)}" fill="none" class="sb" stroke-width="2.2"/&gt;')
for a, b in zip(x.ravel(), y):
    s.append(f'&lt;circle cx="{X(a):.1f}" cy="{Y(b):.1f}" r="2.6" class="fs" stroke="currentColor" stroke-opacity="0.5"/&gt;')
s.append(f'&lt;text x="{W-200}" y="{T+12}" class="tr" font-size="12"&gt;red: one deep tree&lt;/text&gt;')
s.append(f'&lt;text x="{W-200}" y="{T+28}" class="tb" font-size="12"&gt;blue: bagging, 200 trees&lt;/text&gt;')
s.append(f'&lt;text x="{W-200}" y="{T+44}" class="tm" font-size="12"&gt;dashed: true curve sin(x)&lt;/text&gt;')
s.append(f'&lt;text x="{L}" y="{H-6}" class="tm" font-size="11"&gt;x from 0 to 6 · 60 noisy training points&lt;/text&gt;')
s.append('&lt;/svg&gt;&lt;figcaption&gt;One deep tree (red) jumps to every noisy point. The average of 200 bagged trees (blue) still bends toward the data, but its jumps are smaller and it stays closer to the true curve (dashed). Drawn from a real run.&lt;/figcaption&gt;&lt;/figure&gt;')
open("d_svg.svg", "w").write("\\n".join(s))
print("one tree MSE vs truth:", round(float(np.mean((one - np.sin(g.ravel()))**2)), 4))
print("bagged   MSE vs truth:", round(float(np.mean((bag - np.sin(g.ravel()))**2)), 4))</div>
  <div class="fx" data-lang="text">one tree MSE vs truth: 0.0593
bagged   MSE vs truth: 0.028</div>
  <p>On this training set the single tree's mean squared distance from the true curve is 0.059; the bagged average's is 0.028, about half. The picture shows why: the single tree chases every noisy dot; each bagged tree chases a <em>different</em> subset of dots (each saw a different 63%), so where they disagree their jumps partly cancel and the average leans toward what they share, the real curve. It is not perfectly smooth (every member is still a deep tree), but the error from the truth is halved.</p>
  <h3>And bias?</h3>
  <p>Each bagged member has the bias of the base model trained on ≈ 63% of the unique rows, which is about the same as (or slightly larger than) the bias of the base model on all rows. Averaging does not change the average prediction, so <strong>bagging keeps the bias of its base model</strong>. In the bias-variance experiment in the ensemble note, bagging 50 deep trees moved bias² 0.0014 → 0.0010 (unchanged within noise) and variance 0.0897 → 0.0432.</p>
  <div class="callout def"><span class="label">In one line</span>
    <p>Bagging reduces variance by averaging, bounded below by ρσ²; it leaves bias essentially unchanged. So bag <strong>low-bias, high-variance</strong> models.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Bagging prevents overfitting" is half true. It reduces the <em>variance</em> part of overfitting. Each member is still a fully grown tree with train accuracy near 1.0, and the bag's train accuracy is also near 1.0; judge it only on held-out or OOB data.</p>
  </div>

  <h2 id="bag-stable"><span class="num">05</span>Stable vs Unstable Learners</h2>
  <h3>The idea</h3>
  <p>Breiman's rule: bagging helps <strong>unstable</strong> learners, those whose output changes a lot when the training set changes a little (large σ², ρ well below 1). It barely helps <strong>stable</strong> learners, whose output hardly moves (small σ², ρ ≈ 1).</p>
  <table class="tbl">
    <tr><th>Unstable (bagging helps)</th><th>Stable (bagging does little)</th></tr>
    <tr><td>Fully grown decision trees, neural networks, subset selection in regression</td><td>Linear / logistic regression, kNN with large k, naive Bayes, SVM with wide margin, stumps</td></tr>
  </table>
  <p>Test it on the churn data. This is the shared customer table used across the tree-family notes (20,000 rows, 12 <code>make_classification</code> columns plus two pure-noise columns; 12,000 train / 3,000 validation / 5,000 test). Every churn block below starts from this setup.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd, time
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.ensemble import RandomForestClassifier
X, y = make_classification(n_samples=20000, n_features=12, n_informative=6, n_redundant=2,
                           n_clusters_per_class=3, class_sep=0.8, flip_y=0.05, random_state=7)
X = pd.DataFrame(X, columns=[f"f{i}" for i in range(12)])
rng = np.random.default_rng(0)
X["row_noise"] = rng.random(20000)               # pure noise, 20,000 different values
X["coin_noise"] = rng.integers(0, 2, 20000)      # pure noise, only 0 or 1
Xtmp, Xte, ytmp, yte = train_test_split(X, y, test_size=5000, stratify=y, random_state=0)
Xtr, Xva, ytr, yva = train_test_split(Xtmp, ytmp, test_size=3000, stratify=ytmp, random_state=0)</div>
  <p>Now the same 50-member bag around six different base models.</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import BaggingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
sc = lambda m: make_pipeline(StandardScaler(), m)
learners = {
    "deep tree (no limit)": DecisionTreeClassifier(random_state=0),
    "tree max_depth=5":     DecisionTreeClassifier(max_depth=5, random_state=0),
    "stump max_depth=1":    DecisionTreeClassifier(max_depth=1, random_state=0),
    "1-nearest neighbour":  sc(KNeighborsClassifier(1)),
    "15-nearest neighbours": sc(KNeighborsClassifier(15)),
    "logistic regression":  sc(LogisticRegression()),
}
for name, m in learners.items():
    one = m.fit(Xtr, ytr).score(Xva, yva)
    bag = BaggingClassifier(m, n_estimators=50, n_jobs=-1, random_state=0).fit(Xtr, ytr).score(Xva, yva)
    print(f"{name:22s} alone {one:.3f}   bagged x50 {bag:.3f}   gain {bag - one:+.3f}")</div>
  <div class="fx" data-lang="text">deep tree (no limit)   alone 0.773   bagged x50 0.877   gain +0.104
tree max_depth=5       alone 0.748   bagged x50 0.799   gain +0.052
stump max_depth=1      alone 0.597   bagged x50 0.598   gain +0.000
1-nearest neighbour    alone 0.746   bagged x50 0.748   gain +0.001
15-nearest neighbours  alone 0.805   bagged x50 0.813   gain +0.008
logistic regression    alone 0.581   bagged x50 0.579   gain -0.002</div>
  <ul>
    <li><strong>Deep tree: +0.104.</strong> The classic case. Highest variance, biggest gain.</li>
    <li><strong>Depth-5 tree: +0.052.</strong> Still somewhat unstable (its top splits move with the sample), so still a gain, but its bias (0.748 alone) limits the result to 0.799.</li>
    <li><strong>Stump: +0.000.</strong> All 50 bootstrap stumps pick the same column and nearly the same cut. High bias, almost no variance.</li>
    <li><strong>1-NN: +0.001.</strong> Surprising at first: 1-NN is very sensitive to individual points. But a test point's nearest neighbour is in a bootstrap sample 63% of the time, and when it is missing the next-nearest usually has the same label; duplicates never change who is nearest. So the 50 members mostly give the same answer (ρ close to 1) and bagging does little. Smaller subsamples (max_samples well below 0.5) make 1-NN members differ more.</li>
    <li><strong>15-NN: +0.008, logistic regression: −0.002.</strong> Stable models. Logistic regression's problem is bias (a straight boundary on a bent pattern), and averaging 50 nearly identical straight lines is still a straight line.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Asking 50 photocopies of the same textbook gives one answer 50 times (stable). Asking 50 students who each studied from a different random half of the notes gives different answers whose majority beats most students (unstable members, real gain).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Bagging a model to "fix underfitting". If the base model is too simple (stump, linear), bagging cannot add flexibility. Use a more flexible base, or boosting.</p>
  </div>

  <h2 id="bag-oob"><span class="num">06</span>Out-of-Bag Error</h2>
  <h3>The idea</h3>
  <p>Every member skipped about 37% of the rows. For each training row, collect predictions only from the members that did <em>not</em> train on it, combine them, and compare with the true label. Averaged over rows, that is the <strong>out-of-bag (OOB) error</strong>: an honest estimate of test error, computed without setting aside any data.</p>
  <h3>Worked by hand: the three stumps</h3>
  <p>Go back to the three stumps of section 03. Bootstrap 1 used rows x = {1, 2, 4, 5, 6} (missed 3); bootstrap 2 used {2, 3, 4, 6} (missed 1, 5); bootstrap 3 used {1, 3, 4, 5} (missed 2, 6).</p>
  <table class="tbl">
    <tr><th>Row x</th><th>true y</th><th>Members that never saw it</th><th>OOB prediction</th><th>Squared error</th></tr>
    <tr><td>1</td><td>2</td><td>stump 2</td><td>4.75</td><td>(4.75 − 2)² = 7.56</td></tr>
    <tr><td>2</td><td>3</td><td>stump 3</td><td>2.00</td><td>(2 − 3)² = 1.00</td></tr>
    <tr><td>3</td><td>5</td><td>stump 1</td><td>2.33</td><td>(2.33 − 5)² = 7.11</td></tr>
    <tr><td>4</td><td>6</td><td>none (in every sample)</td><td>—</td><td>skipped</td></tr>
    <tr><td>5</td><td>8</td><td>stump 2</td><td>4.75</td><td>10.56</td></tr>
    <tr><td>6</td><td>9</td><td>stump 3</td><td>6.60</td><td>5.76</td></tr>
  </table>
  <p>OOB MSE = (7.56 + 1.00 + 7.11 + 10.56 + 5.76)/5 = 31.99/5 = <strong>6.40</strong>, matching the last line of the stump code's output. Two lessons from this tiny case: row 4 got no OOB prediction at all (it was in all three samples), and each OOB prediction came from only one stump, not from the full bag of three. With few members, OOB judges a weaker model than the one you will use.</p>
  <h3>On the churn data</h3>
  <div class="fx" data-lang="py">import warnings
from sklearn.ensemble import BaggingClassifier
warnings.filterwarnings("ignore")                         # tiny bags warn that some rows have no OOB vote
for n in [5, 10, 25, 50, 100, 200]:
    bag = BaggingClassifier(DecisionTreeClassifier(), n_estimators=n, oob_score=True,
                            n_jobs=-1, random_state=0).fit(Xtr, ytr)
    has = ~np.isnan(bag.oob_decision_function_[:, 0])     # rows that got at least one OOB vote
    print(f"trees {n:3d}: OOB acc {bag.oob_score_:.3f}  val acc {bag.score(Xva, yva):.3f}  rows with an OOB vote {has.mean():.1%}")
print(bag.oob_decision_function_[:3].round(2))            # OOB class probabilities of the first 3 rows</div>
  <div class="fx" data-lang="text">trees   5: OOB acc 0.745  val acc 0.836  rows with an OOB vote 90.1%
trees  10: OOB acc 0.798  val acc 0.857  rows with an OOB vote 99.0%
trees  25: OOB acc 0.836  val acc 0.865  rows with an OOB vote 100.0%
trees  50: OOB acc 0.851  val acc 0.877  rows with an OOB vote 100.0%
trees 100: OOB acc 0.860  val acc 0.881  rows with an OOB vote 100.0%
trees 200: OOB acc 0.866  val acc 0.881  rows with an OOB vote 100.0%
[[0.33 0.67]
 [0.15 0.85]
 [0.12 0.88]]</div>
  <p>Read the columns together. With 5 trees, only 90.1% of rows get any OOB vote (1 − 0.632⁵ = 0.899: the rest were in all five samples), and the OOB accuracy, 0.745, is far below the validation accuracy of the real 5-tree bag, 0.836, because each OOB vote comes from only about 2 trees. As the bag grows, OOB climbs toward validation: 0.851 vs 0.877 at 50 trees, 0.866 vs 0.881 at 200. A gap of about 0.01–0.015 remains: each row's OOB vote still comes from only ≈ 37% of the members (≈ 74 of 200), and 3,000 validation rows carry their own noise of about ±0.006. The last block shows <code>oob_decision_function_</code>: per training row, the average OOB probability of each class (row 1: 67% churn).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>For row i, let S_i be the members whose bootstrap sample did not contain i. The <strong>OOB prediction</strong> is the aggregate of {h_b(x_i) : b ∈ S_i}; the <strong>OOB score</strong> is the accuracy (or R² for regression) of OOB predictions over all rows with S_i non-empty. Each row is judged by about 0.368 × B members. sklearn: <code>oob_score=True</code>, then <code>oob_score_</code> and <code>oob_decision_function_</code> (classifier) or <code>oob_prediction_</code> (regressor).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>OOB is not a replacement for a proper test set when you tune many settings: if you pick the configuration with the best OOB score out of 50, that score is optimistic. And any preprocessing fitted on all rows before bagging (scaling, target encoding, feature selection) has seen the OOB rows, which leaks into the estimate.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Bootstrapping rows is one way to make members differ. What about sampling without replacement, or sampling columns instead of rows?</div>

  <h2 id="bag-var"><span class="num">07</span>Pasting, Random Subspaces, Random Patches</h2>
  <p>Bagging is one point in a family of "train each member on a random slice of the table" methods. They differ in what is sampled and how.</p>
  <table class="tbl">
    <tr><th>Variant</th><th>Rows</th><th>Columns</th><th>sklearn settings</th><th>Origin</th></tr>
    <tr><td><b>Bagging</b></td><td>n with replacement</td><td>all</td><td><code>bootstrap=True, max_samples=1.0</code></td><td>Breiman 1996</td></tr>
    <tr><td><b>Pasting</b></td><td>a subset without replacement</td><td>all</td><td><code>bootstrap=False, max_samples=0.5</code></td><td>Breiman 1999 (big data)</td></tr>
    <tr><td><b>Random subspaces</b></td><td>all</td><td>random subset per member</td><td><code>bootstrap=False, max_features=0.5</code></td><td>Ho 1998</td></tr>
    <tr><td><b>Random patches</b></td><td>random subset</td><td>random subset</td><td><code>max_samples=0.5, max_features=0.5</code></td><td>Louppe &amp; Geurts 2012</td></tr>
  </table>
  <div class="fx" data-lang="py">from sklearn.ensemble import BaggingClassifier
tree = DecisionTreeClassifier()
variants = {   # name: (max_samples, bootstrap, max_features, bootstrap_features)
    "bagging (rows w/ repl.)":       (1.0, True,  1.0, False),
    "pasting (50% rows, no repl.)":  (0.5, False, 1.0, False),
    "random subspaces (50% cols)":   (1.0, False, 0.5, False),
    "random patches (50% + 50%)":    (0.5, False, 0.5, False),
}
for name, (ms, bs, mf, bf) in variants.items():
    m = BaggingClassifier(tree, n_estimators=100, max_samples=ms, bootstrap=bs, max_features=mf,
                          bootstrap_features=bf, n_jobs=-1, random_state=0)
    t0 = time.time(); m.fit(Xtr, ytr); sec = time.time() - t0
    P = np.array([e.predict(Xva.values[:, f]) for e, f in zip(m.estimators_[:30], m.estimators_features_[:30])])
    one = np.mean(P == yva, axis=1).mean()
    agree = np.mean([np.mean(P[i] == P[j]) for i in range(30) for j in range(i)])
    print(f"{name:29s} one tree {one:.3f}  trees agree {agree:.1%}  ensemble val {m.score(Xva, yva):.3f}  fit {sec:4.1f}s")</div>
  <div class="fx" data-lang="text">bagging (rows w/ repl.)       one tree 0.769  trees agree 73.3%  ensemble val 0.881  fit 13.2s
pasting (50% rows, no repl.)  one tree 0.768  trees agree 73.3%  ensemble val 0.875  fit  9.4s
random subspaces (50% cols)   one tree 0.676  trees agree 60.4%  ensemble val 0.861  fit 10.5s
random patches (50% + 50%)    one tree 0.666  trees agree 59.1%  ensemble val 0.858  fit  5.7s</div>
  <p>Line by line. <strong>Pasting</strong> with half the rows: each tree is as good as a bagged tree (0.768 vs 0.769, because a bootstrap sample also holds only 63% unique rows), the trees agree just as often, the ensemble is a little lower (0.875 vs 0.881) and training is faster (13.2 s → 9.4 s: half the rows per tree). <strong>Random subspaces</strong>: a tree that sees only 7 of the 14 columns often misses the strongest ones, so a single tree drops to 0.676; the trees agree far less (60%), but on this data the loss of accuracy per tree outweighs the gain in diversity (0.861). <strong>Random patches</strong> combines both: fastest (5.7 s), most diverse, slightly weakest here. Which wins depends on the data: with many noisy or redundant columns, column sampling often wins; with a few strong columns (as here) it hurts. Fit times come from a shared machine; compare them only with each other.</p>
  <div class="callout intu"><span class="label">Where Random Forest fits</span>
    <p>Random subspaces pick columns once <em>per member</em>. <a class="xref" data-note="ml_rf">Random Forest</a> picks a fresh random subset of columns at <em>every split</em> of every tree, on top of bootstrap rows. Per-split sampling lets every column still be used somewhere in each tree, while still breaking the dominance of the strongest column. That turns out to be the better trade-off, which is why RF, not random subspaces, became the default.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>With <code>bootstrap=False</code> and <code>max_samples=1.0</code> and all columns, every member sees the identical table: no diversity, the "ensemble" is one tree repeated (only tie-breaking differs).</p>
  </div>

  <h2 id="bag-sk"><span class="num">08</span>sklearn's BaggingClassifier &amp; BaggingRegressor</h2>
  <table class="tbl">
    <tr><th>Parameter</th><th>Default</th><th>What it does</th><th>Effect / advice</th></tr>
    <tr><td><code>estimator</code></td><td>DecisionTree</td><td>The base model to copy (any sklearn estimator)</td><td>Use an unstable, low-bias model; deep tree is the default</td></tr>
    <tr><td><code>n_estimators</code></td><td>10</td><td>Number of members B</td><td>More never overfits; gains flatten after ~100–300. Cost grows linearly</td></tr>
    <tr><td><code>max_samples</code></td><td>1.0</td><td>Rows per member (fraction or count)</td><td>Smaller → more diverse, faster, each member weaker</td></tr>
    <tr><td><code>max_features</code></td><td>1.0</td><td>Columns per member (fraction or count)</td><td>&lt; 1.0 → random subspaces / patches</td></tr>
    <tr><td><code>bootstrap</code></td><td>True</td><td>Rows with replacement?</td><td>False → pasting</td></tr>
    <tr><td><code>bootstrap_features</code></td><td>False</td><td>Columns with replacement?</td><td>Rarely useful</td></tr>
    <tr><td><code>oob_score</code></td><td>False</td><td>Compute OOB score (needs bootstrap=True)</td><td>Free validation estimate</td></tr>
    <tr><td><code>warm_start</code></td><td>False</td><td>Keep existing members and add more on the next fit</td><td>Grow a bag step by step</td></tr>
    <tr><td><code>n_jobs</code></td><td>None (1 core)</td><td>Cores for fit and predict</td><td>-1 = all cores; members are independent</td></tr>
    <tr><td><code>random_state</code></td><td>None</td><td>Seed for the sampling</td><td>Set it for reproducible results</td></tr>
  </table>
  <p>Fitted attributes: <code>estimators_</code> (the members), <code>estimators_samples_</code> (the row indices each one drew), <code>estimators_features_</code> (its columns), <code>oob_score_</code>, <code>oob_decision_function_</code> / <code>oob_prediction_</code>. The code shows the bookkeeping, warm starting and the regression version.</p>
  <div class="fx" data-lang="py">from sklearn.ensemble import BaggingClassifier, BaggingRegressor
from sklearn.datasets import make_friedman1
from sklearn.metrics import mean_squared_error
# 1) the bookkeeping sklearn keeps
bag = BaggingClassifier(DecisionTreeClassifier(), n_estimators=3, max_features=0.5,
                        random_state=0).fit(Xtr, ytr)
for k in range(3):
    rows, cols = bag.estimators_samples_[k], bag.estimators_features_[k]
    print(f"member {k}: {len(rows)} row draws, {len(np.unique(rows))} unique; columns {sorted(cols.tolist())}")
# 2) warm_start: add trees to an existing bag instead of refitting
bag = BaggingClassifier(DecisionTreeClassifier(), n_estimators=20, warm_start=True, random_state=0, n_jobs=-1)
for n in [20, 60, 120]:
    bag.set_params(n_estimators=n).fit(Xtr, ytr)          # only the new trees are trained
    print(f"warm start -&gt; {len(bag.estimators_)} trees, val {bag.score(Xva, yva):.3f}")
# 3) regression: BaggingRegressor averages the members' numbers
Xr, yr = make_friedman1(n_samples=3000, noise=1.0, random_state=0)
Xa, Xb, ya, yb = Xr[:2000], Xr[2000:], yr[:2000], yr[2000:]
for name, m in [("one deep tree", DecisionTreeRegressor(random_state=0)),
                ("bagging 100 trees", BaggingRegressor(DecisionTreeRegressor(), n_estimators=100,
                                                       oob_score=True, n_jobs=-1, random_state=0))]:
    m.fit(Xa, ya)
    extra = f"  OOB R^2 {m.oob_score_:.3f}" if hasattr(m, "oob_score_") else ""
    print(f"{name:18s} test MSE {mean_squared_error(yb, m.predict(Xb)):.2f}  test R^2 {m.score(Xb, yb):.3f}{extra}")</div>
  <div class="fx" data-lang="text">member 0: 12000 row draws, 7570 unique; columns [1, 4, 5, 7, 8, 9, 13]
member 1: 12000 row draws, 7586 unique; columns [2, 4, 5, 6, 7, 10, 12]
member 2: 12000 row draws, 7554 unique; columns [0, 2, 6, 8, 9, 10, 12]
warm start -&gt; 20 trees, val 0.868
warm start -&gt; 60 trees, val 0.881
warm start -&gt; 120 trees, val 0.880
one deep tree      test MSE 8.01  test R^2 0.688
bagging 100 trees  test MSE 3.29  test R^2 0.872  OOB R^2 0.867</div>
  <p>Part 1: each member drew 12,000 rows but only about 7,570 distinct ones (63.1%, the rule of section 02), and with <code>max_features=0.5</code> each got its own 7 of the 14 columns. Part 2: with <code>warm_start=True</code>, raising <code>n_estimators</code> and calling <code>fit</code> again trains only the new members, so you can grow a bag and watch validation flatten (0.868 → 0.881 → 0.880) without retraining from zero. Part 3, regression on the Friedman #1 benchmark: one deep tree has test R² 0.688; averaging 100 bootstrap trees lifts it to 0.872 and cuts the MSE from 8.01 to 3.29, and the free OOB R² (0.867) is within 0.005 of the test value.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>In sklearn ≥ 1.2 the parameter is <code>estimator=</code>; older code uses <code>base_estimator=</code>, which was removed in 1.4. Passing the base model positionally, <code>BaggingClassifier(DecisionTreeClassifier())</code>, works in every version.</p>
  </div>

  <h2 id="bag-scratch"><span class="num">09</span>Bagging From Scratch</h2>
  <p>The whole algorithm is four steps: bootstrap, fit, remember which rows each member saw (for OOB), and average probabilities. Here it is, using sklearn's tree as the base model.</p>
  <div class="fx" data-lang="py">class MyBagging:
    def __init__(self, n_estimators=50, seed=0):
        self.n, self.rng = n_estimators, np.random.default_rng(seed)
    def fit(self, X, y):
        X, y = np.asarray(X), np.asarray(y)
        n = len(X)
        self.classes_ = np.unique(y)
        self.trees, self.inbag = [], []
        for _ in range(self.n):
            idx = self.rng.integers(0, n, n)                  # 1. bootstrap: n draws with replacement
            tree = DecisionTreeClassifier(random_state=int(self.rng.integers(1e9)))
            self.trees.append(tree.fit(X[idx], y[idx]))       # 2. a full-depth tree on that sample
            self.inbag.append(np.bincount(idx, minlength=n) &gt; 0)
        # 3. out-of-bag: each row is scored only by trees that never saw it
        votes, count = np.zeros((n, len(self.classes_))), np.zeros(n)
        for tree, seen in zip(self.trees, self.inbag):
            votes[~seen] += tree.predict_proba(X[~seen])
            count[~seen] += 1
        ok = count &gt; 0
        self.oob_score_ = np.mean(self.classes_[votes[ok].argmax(1)] == y[ok])
        return self
    def predict_proba(self, X):                               # 4. aggregate: average the probabilities
        return np.mean([t.predict_proba(np.asarray(X)) for t in self.trees], axis=0)
    def predict(self, X):
        return self.classes_[self.predict_proba(X).argmax(1)]

from sklearn.ensemble import BaggingClassifier
mine = MyBagging(100, seed=0).fit(Xtr, ytr)
sk = BaggingClassifier(DecisionTreeClassifier(), n_estimators=100, oob_score=True,
                       n_jobs=-1, random_state=0).fit(Xtr, ytr)
print(f"from scratch: val {np.mean(mine.predict(Xva) == yva):.3f}  OOB {mine.oob_score_:.3f}")
print(f"sklearn:      val {sk.score(Xva, yva):.3f}  OOB {sk.oob_score_:.3f}")
same = np.mean(mine.predict(Xva) == sk.predict(Xva))
print(f"the two bags give the same label on {same:.1%} of validation rows")</div>
  <div class="fx" data-lang="text">from scratch: val 0.875  OOB 0.862
sklearn:      val 0.881  OOB 0.860
the two bags give the same label on 96.7% of validation rows</div>
  <p>The from-scratch bag scores 0.875 on validation with OOB 0.862; sklearn's scores 0.881 with OOB 0.860. The two use different random numbers, so their bootstrap samples and trees differ and the numbers are not identical, but they agree on 96.7% of validation labels and both OOB estimates sit at 0.86. Two details worth copying: the OOB bookkeeping is just a boolean "this member saw row i" mask per member, and the prediction averages <code>predict_proba</code> (soft voting), exactly as sklearn does for trees.</p>

  <h2 id="bag-res"><span class="num">10</span>Results on the Churn Data</h2>
  <div class="fx" data-lang="py">from sklearn.ensemble import BaggingClassifier
from sklearn.metrics import roc_auc_score
single = DecisionTreeClassifier(random_state=0).fit(Xtr, ytr)
print(f"single deep tree       test acc {single.score(Xte, yte):.3f}  AUC {roc_auc_score(yte, single.predict_proba(Xte)[:, 1]):.3f}")
for n in [1, 10, 50, 200]:
    m = BaggingClassifier(DecisionTreeClassifier(), n_estimators=n, n_jobs=-1, random_state=0).fit(Xtr, ytr)
    p = m.predict_proba(Xte)[:, 1]
    print(f"bagging {n:3d} trees      test acc {m.score(Xte, yte):.3f}  AUC {roc_auc_score(yte, p):.3f}")</div>
  <div class="fx" data-lang="text">single deep tree       test acc 0.778  AUC 0.778
bagging   1 trees      test acc 0.762  AUC 0.762
bagging  10 trees      test acc 0.844  AUC 0.912
bagging  50 trees      test acc 0.864  AUC 0.931
bagging 200 trees      test acc 0.876  AUC 0.934</div>
  <p>The single tree trained on all rows scores 0.778 (its AUC equals its accuracy here because a pure-leaf tree outputs only 0 or 1, so the ROC curve has a single corner). One bagged tree is a bit <em>worse</em>, 0.762: it saw only ≈ 63% of the distinct rows. Ten bagged trees: 0.844; fifty: 0.864; two hundred: 0.876 accuracy and AUC 0.934. The AUC jump (0.78 → 0.93) is even larger than the accuracy jump, because averaging 0/1 trees produces real graded probabilities ("147 of 200 trees say churn"), which rank customers far better. That is +10 points of accuracy from one idea, without touching the tree itself.</p>
  <div class="callout intu"><span class="label">Speed</span>
    <p>The members are independent, so <code>n_jobs=-1</code> spreads them over all CPU cores and on an idle 4-core machine training is close to 4× faster. Prediction is parallel too. Each bagged deep tree tries all 14 columns at every split, which is why a 300-tree Random Forest (which tries √14 ≈ 3) trains several times faster than 100 bagged trees in the ensemble note's comparison.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Bagged trees are still correlated at ρ ≈ 0.46, because the strongest column wins the top split in almost every bootstrap sample. <a class="xref" data-note="ml_rf">Random Forest</a> attacks that floor directly by hiding random columns at every split.</div>

  <h2 id="bag-cmp"><span class="num">11</span>Comparisons</h2>
  <table class="tbl">
    <tr><th></th><th>Single deep tree</th><th>Bagging</th><th><a class="xref" data-note="ml_rf">Random Forest</a></th><th><a class="xref" data-note="ml_extratrees">Extra Trees</a></th><th><a class="xref" data-note="ml_boosting">Boosting</a></th></tr>
    <tr><td>Rows per member</td><td>all</td><td>bootstrap</td><td>bootstrap</td><td>all (default)</td><td>all or subsample</td></tr>
    <tr><td>Columns at a split</td><td>all</td><td>all</td><td>random subset</td><td>random subset</td><td>all or subsample</td></tr>
    <tr><td>Threshold</td><td>best</td><td>best</td><td>best</td><td>random</td><td>best (often histogram)</td></tr>
    <tr><td>Members built</td><td>—</td><td>parallel</td><td>parallel</td><td>parallel</td><td>sequential</td></tr>
    <tr><td>Reduces</td><td>—</td><td>variance</td><td>variance (lower ρ)</td><td>variance (lowest ρ)</td><td>bias</td></tr>
    <tr><td>Any base model?</td><td>—</td><td>yes</td><td>trees only</td><td>trees only</td><td>usually trees</td></tr>
    <tr><td>Churn test acc</td><td>0.778</td><td>≈ 0.87–0.88</td><td>≈ 0.88</td><td>≈ 0.87–0.88</td><td>≈ 0.86–0.88</td></tr>
  </table>
  <p>Bagging's unique strength in this table is the "any base model" row: it can wrap any unstable learner, not just trees. For trees specifically, Random Forest is almost always at least as good and faster.</p>

  <h2 id="bag-traps"><span class="num">12</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: bagging a stable model</span>
    <p>Logistic regression, large-k kNN, naive Bayes, stumps: gains near zero (−0.002 to +0.008 above). Bag deep trees or other unstable learners.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: limiting the trees too much</span>
    <p>Pruning each member hard "to avoid overfitting" raises bias, which bagging cannot remove. Let members grow deep; the averaging handles variance.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: "bagging = random forest"</span>
    <p>Plain bagging uses all columns at every split. Random Forest adds per-split column sampling, which lowers correlation. They are siblings, not synonyms.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: trusting OOB with few members</span>
    <p>With 5–10 members, each row is judged by only 2–4 of them, so OOB under-states the full bag's accuracy, and some rows get no OOB vote at all.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: bootstrapping time-ordered or grouped rows</span>
    <p>For time series or several rows per customer, row-level bootstrap mixes future with past and puts the same customer in and out of bag, so OOB is optimistic. Use block / group sampling and a time-based validation set.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: expecting extrapolation</span>
    <p>An average of trees can only predict values between the training targets. Bagging does not fix a tree's flat prediction beyond the training range.</p>
  </div>

  <h2 id="bag-qa"><span class="num">13</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a bootstrap sample, and why must it be drawn with replacement?</summary><div class="qa-body">n rows drawn uniformly at random with replacement from an n-row table. With replacement, some rows repeat and others are left out, so each sample is a different dataset. Without replacement and the same size, every sample is the same set of rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the 63.2%.</summary><div class="qa-body">P(a row is missed in one draw) = 1 − 1/n; in n independent draws (1 − 1/n)ⁿ. Since n·ln(1 − 1/n) → −1, (1 − 1/n)ⁿ → 1/e ≈ 0.368. So a row is in the sample with probability ≈ 0.632, and a sample contains ≈ 63.2% unique rows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does bagging reduce variance but not bias?</summary><div class="qa-body">The bag's average prediction equals the average of the members' average predictions, so its bias is the members' bias. Its variance is ρσ² + (1 − ρ)σ²/B, smaller than σ² whenever ρ &lt; 1. Measured on sin data: ρ = 0.46, bag-of-25 variance 0.0435 vs one tree 0.0897.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which base learners benefit from bagging, and which do not? Give numbers.</summary><div class="qa-body">Unstable, low-bias learners: deep trees (+0.104 on churn), moderately deep trees (+0.052). Stable or high-bias learners barely change: stump +0.000, 1-NN +0.001, 15-NN +0.008, logistic regression −0.002.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is the OOB score computed, and why is it pessimistic with few members?</summary><div class="qa-body">Each training row is predicted only by members whose bootstrap sample excluded it (≈ 37% of members), those predictions are aggregated, and accuracy is taken over all rows. With few members each row's OOB vote comes from a much smaller team than the real bag (5 trees: OOB 0.745 vs validation 0.836), so it understates performance; it converges as B grows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Hard vs soft aggregation in BaggingClassifier?</summary><div class="qa-body">If the base estimator has predict_proba, sklearn averages the members' probabilities (soft); otherwise it takes the majority of predicted labels (hard). For fully grown trees the probabilities are 0/1 so the two nearly coincide.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Define pasting, random subspaces and random patches, with sklearn settings.</summary><div class="qa-body">Pasting: rows sampled without replacement (bootstrap=False, max_samples &lt; 1). Random subspaces: all rows, a random subset of columns per member (bootstrap=False, max_features &lt; 1). Random patches: both rows and columns subsampled.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Bagging 100 trees vs Random Forest of 100 trees: what is the difference, and why does it matter?</summary><div class="qa-body">Both use bootstrap rows. RF also restricts every split to a random subset of max_features columns. That stops the strongest column from dominating every tree's top, lowering the correlation ρ between trees, which lowers the variance floor ρσ²; it also makes each split cheaper (3 columns tried instead of 14 on churn).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does adding more bagged trees ever cause overfitting?</summary><div class="qa-body">No. More members only shrink the (1 − ρ)σ²/B term; the test error curve flattens and stays flat. The members themselves may be overfit (deep trees), but adding more of them does not make it worse. Only cost grows.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can bagging be parallelised? Can boosting?</summary><div class="qa-body">Bagging: yes, members are independent, so n_jobs=-1 trains them on all cores. Boosting: the rounds are sequential (each needs the previous team), so only the work inside one round (e.g. split finding) can be parallel.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How did the bootstrap originally get used, before bagging?</summary><div class="qa-body">Efron (1979) used it to estimate the uncertainty of a statistic: resample the data many times, recompute the statistic, and use the spread as its standard error or confidence interval. For 8 delivery times the bootstrap SE of the mean was 2.05 vs the textbook 2.07.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why is bagging a natural fit for decision trees specifically?</summary><div class="qa-body">Fully grown trees have very low bias and very high variance, and small data changes reshuffle their top splits (see <a class="xref" data-note="ml_dtree">Decision Trees</a>), so bootstrap samples produce genuinely different trees (low ρ relative to e.g. linear models). That is exactly the profile averaging fixes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: the bias-variance experiment showed bagged stumps and boosted stumps. Explain the difference.</summary><div class="qa-body">Bagged stumps: average of near-identical one-cut models, bias² stayed 0.063. Boosted stumps: each stump fits what the sum still gets wrong, so the sum can draw a curve, bias² fell to 0.0012. Averaging fixes variance; adding sequentially fixes bias. See <a class="xref" data-note="ml_boosting">How Boosting Works</a>.</div></details>
</main>
`
});
