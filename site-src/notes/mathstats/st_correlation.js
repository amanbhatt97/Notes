// notes/mathstats/st_correlation.js — Correlation & Relationships
Object.assign(TOPIC_CONTENT, {
  "st_correlation": `<main>
  <h1>Correlation &amp; Relationships</h1>
  <p class="lead">Correlation is one number that says how strongly two variables move together. You will use it every day in data exploration and feature selection, and you will hear it misused every day in "X causes Y" claims. This note builds covariance and correlation by hand on five data points, then shows the ways the number lies: curves, outliers, confounders, Simpson's paradox, copy-cat features and look-alike datasets. Builds on <a class="xref" data-note="st_descriptive">Descriptive Statistics</a>; the significance test for r comes from <a class="xref" data-note="st_hypothesis">Hypothesis Testing</a>.</p>

  <h2 id="sco-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Correlation &amp; Relationships</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Covariance &amp; Pearson</div>
        <ul>
          <li><b>Covariance</b> — <code>Σ(x − x̄)(y − ȳ)/(n − 1)</code>; sign = direction</li>
          <li>⚠ covariance carries units; score ×10 → cov ×10, r unchanged</li>
          <li><b>Pearson r</b> — <code>cov / (sₓ s_y)</code> = average product of z-scores; −1 to 1</li>
          <li><b>By hand</b> — hours vs score: Σ products 41, cov 10.25, r 0.994</li>
          <li><b>r²</b> — share of variance explained (r 0.3 → 9%)</li>
          <li><b>Significance</b> — t = r√(n−2)/√(1−r²); pearsonr gives p</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Pearson vs Spearman vs Kendall</div>
        <ul>
          <li><b>Spearman ρ</b> — Pearson on ranks; any monotonic relation; 1 − 6Σd²/(n(n²−1))</li>
          <li><b>Kendall τ</b> — (concordant − discordant) / pairs; small n, ties</li>
          <li><b>By hand</b> — ranks 1,3,2,4: ρ = 0.8, τ = 0.667</li>
          <li><b>Curve</b> — exp curve: Pearson 0.80, Spearman 1.00</li>
          <li><b>Outlier</b> — one point: Pearson 0.20 → 0.86; Spearman 0.28</li>
          <li>⚠ r = 0 ≠ independent (y = x² gives 0)</li>
          <li><code>df.corr(method="spearman")</code> for a whole table</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Causation</div>
        <ul>
          <li><b>Confounder</b> — Z causes X and Y (heat → ice cream, drownings)</li>
          <li><b>Partial r</b> — r 0.67 raw → −0.07 after removing temperature</li>
          <li><b>Reverse causation</b> — support contacts ← unhappy users</li>
          <li><b>Selection bias</b>, <b>coincidence</b> — other fake links</li>
          <li><b>Prove it</b> — randomised experiment; else diff-in-diff, IV, matching</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Simpson's Paradox</div>
        <ul>
          <li><b>What</b> — trend in every group flips when pooled</li>
          <li><b>Kidney stones</b> — A wins small (93/87) and large (73/69), loses overall (78/83)</li>
          <li><b>Why</b> — overall = weighted average; A's weight is 75% hard cases, B's 23%</li>
          <li><b>DS version</b> — traffic mix shift hides per-country gains</li>
          <li><b>Fix</b> — segment by the confounder; compare like with like</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Multicollinearity</div>
        <ul>
          <li><b>What</b> — features nearly copies of each other</li>
          <li><b>Effect</b> — unstable coefficients, huge SEs; rooms coef 15.0 → 3.3, SE 0.63 → 2.18</li>
          <li><b>VIF</b> — <code>1/(1 − R²)</code> of feature on the rest; &gt;10 severe; r 0.95 → VIF ≈ 10</li>
          <li><b>Example</b> — sqft &amp; rooms VIF ≈ 14, age 1.1</li>
          <li><b>Fix</b> — drop/combine, PCA, ridge</li>
          <li>⚠ hurts interpretation, not prediction (R² 0.741 → 0.776)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Anscombe's Quartet</div>
        <ul>
          <li><b>What</b> — 4 datasets, same mean, var, r 0.816, fit y = 3 + 0.5x</li>
          <li><b>Shapes</b> — linear, curved, outlier, leverage point</li>
          <li><b>Lesson</b> — always plot before trusting summary stats</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sco-cov"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Covariance → Correlation</span><span class="rm-sub">Direction, then strength, by hand</span></div></div>
      <div class="rm-item rm-done" data-target="sco-ps"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Pearson vs Spearman</span><span class="rm-sub">Ranks, curves and outliers</span></div></div>
      <div class="rm-item rm-done" data-target="sco-cause"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Correlation ≠ Causation</span><span class="rm-sub">Confounders, reverse cause</span></div></div>
      <div class="rm-item rm-done" data-target="sco-simpson"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Simpson's Paradox</span><span class="rm-sub">Real kidney-stone data</span></div></div>
      <div class="rm-item rm-done" data-target="sco-vif"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Multicollinearity &amp; VIF</span><span class="rm-sub">When features copy each other</span></div></div>
      <div class="rm-item rm-done" data-target="sco-anscombe"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Anscombe's Quartet</span><span class="rm-sub">Always plot your data</span></div></div>
      <div class="rm-item rm-done" data-target="sco-traps"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Units, curves, causal claims</span></div></div>
      <div class="rm-item rm-done" data-target="sco-qa"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="sco-cov"><span class="num">01</span>Covariance → Correlation</h2>
  <p>You have a table of students with hours studied and exam score. You want one number that answers "when hours go up, does score go up too, and how reliably?". Looking at 10,000 rows by eye does not work, and a scatter plot cannot be put in a feature-selection loop. We need a number.</p>
  <p>The idea in plain words: for each student, check whether they are above or below average on hours, and above or below average on score. If most students are "above on both" or "below on both", the two move together. If most are "above on one, below on the other", they move opposite. If it is mixed, there is no clear link.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Rainfall and umbrella sales in Mumbai. On wetter-than-usual days, umbrella shops sell more than usual; on drier days, less. Both are "above usual" together and "below usual" together. That shared movement around the usual level is exactly what covariance measures.</p>
  </div>
  <h3>Covariance by hand</h3>
  <p>Five students. Average hours x̄ = 3, average score ȳ = 60.</p>
  <table class="tbl out"><caption>Worked: hours studied vs exam score</caption>
    <tr><th>x (hours)</th><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><th>sum</th></tr>
    <tr><th>y (score)</th><td>52</td><td>55</td><td>61</td><td>64</td><td>68</td><td></td></tr>
    <tr><th>x − 3</th><td>−2</td><td>−1</td><td>0</td><td>1</td><td>2</td><td></td></tr>
    <tr><th>y − 60</th><td>−8</td><td>−5</td><td>1</td><td>4</td><td>8</td><td></td></tr>
    <tr><th>(x−3)(y−60)</th><td>16</td><td>5</td><td>0</td><td>4</td><td>16</td><td><strong>41</strong></td></tr>
  </table>
  <ol>
    <li>Every product is positive or zero: below-average students are below on both, above-average are above on both.</li>
    <li>Covariance = 41 / (n − 1) = 41 / 4 = <strong>10.25</strong>. Positive → they rise together.</li>
    <li>But is 10.25 big? It is in "hours × marks" units, so we can't tell. Divide by both standard deviations: sₓ = √2.5 = 1.581, s_y = √42.5 = 6.519.</li>
    <li>r = 10.25 / (1.581 × 6.519) = 10.25 / 10.31 = <strong>0.994</strong>. Almost a perfect straight line.</li>
  </ol>
  <p>Another way to see r: turn each value into a <strong>z-score</strong> (how many SDs from the mean). Then r is the average of z_x × z_y. The code shows both views, then checks what happens if we change units (score out of 1,000 instead of 100) and asks scipy for a p-value.</p>
  <div class="fx" data-lang="py">import numpy as np
from scipy import stats
hours = np.array([1, 2, 3, 4, 5]); score = np.array([52, 55, 61, 64, 68])
print(np.cov(hours, score))
print("r =", round(np.corrcoef(hours, score)[0, 1], 4))
zx = (hours - hours.mean()) / hours.std(ddof=1)
zy = (score - score.mean()) / score.std(ddof=1)
print("z-products:", np.round(zx * zy, 3), " r =", round((zx * zy).sum() / (len(hours) - 1), 4))
print("cov with score out of 1000:", np.cov(hours, score * 10)[0, 1],
      " r:", round(np.corrcoef(hours, score * 10)[0, 1], 4))
r, p = stats.pearsonr(hours, score)
print(f"pearsonr: r={r:.4f} p={p:.5f}")</div>
  <div class="fx" data-lang="text">[[ 2.5  10.25]
 [10.25 42.5 ]]
r = 0.9944
z-products: [1.552 0.485 0.    0.388 1.552]  r = 0.9944
cov with score out of 1000: 102.5  r: 0.9944
pearsonr: r=0.9944 p=0.00050</div>
  <p><code>np.cov</code> returns a 2×2 <strong>covariance matrix</strong>: the diagonal holds each variable's variance (2.5 and 42.5), the off-diagonal holds the covariance 10.25, matching our table. The z-product line rebuilds r from scratch. Multiplying scores by 10 makes covariance 10 times bigger (102.5) while r stays 0.9944: correlation has no units. <code>pearsonr</code> also returns a p-value for H₀ "true r = 0", using t = r√(n − 2)/√(1 − r²) = 0.994 × √3 / √0.011 ≈ 16.3 with 3 df.</p>
  <figure class="viz"><svg viewBox="0 0 600 136" width="600"><g transform="translate(0,0)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">r = -0.9</text><g transform="translate(0,16)"><rect x="8" y="6" width="134" height="106" fill="none" stroke="currentColor" stroke-opacity=".25"/><path d="M85.8,77.9h0M82.5,61.6h0M50.9,39.1h0M83.1,71.5h0M66.9,39.8h0M63,59.2h0M103.7,69.1h0M62,62.3h0M71,65h0M86.2,71.7h0M93.2,69h0M73.4,62.4h0M70.3,48.7h0M109.3,88.2h0M95.4,76.5h0M103,81h0M74.3,60.8h0M95.7,78.5h0M91.9,83h0M64.6,59.5h0M53.2,36.1h0M119.6,92.1h0M99,77.7h0M64.2,66.1h0M78.8,64h0M48.3,47.2h0M53.6,50.7h0M78,68h0M46.5,32h0M25.5,14.8h0M60.9,41.2h0M87.8,69.7h0M43.8,37.4h0M70.8,55.8h0M60,50h0M79.5,60.7h0M68.5,60.6h0M49.2,48.8h0M94.6,84.6h0M52.3,43.9h0M90.4,80.1h0M60.6,55.9h0M105.6,78.4h0M99.3,80.8h0M72.9,60.9h0" class="sb" stroke-width="4.8" stroke-linecap="round" stroke-opacity=".75"/></g></g><g transform="translate(150,0)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">r = 0</text><g transform="translate(0,16)"><rect x="8" y="6" width="134" height="106" fill="none" stroke="currentColor" stroke-opacity=".25"/><path d="M73.8,35.5h0M63.5,81.1h0M34.2,62.6h0M67.2,54.3h0M64.7,67.4h0M59,68.1h0M78.6,65.7h0M77.2,25.6h0M85.6,86.7h0M113.5,52.9h0M54.1,43.1h0M75.4,69.8h0M60.9,76.5h0M76.1,40.2h0M67.8,51.6h0M116.7,80.3h0M80.7,64.4h0M51.5,77h0M74.7,51.4h0M63.2,58h0M91,53.8h0M94.3,50.9h0M85.8,26.9h0M88.8,56.7h0M90.8,75.2h0M67.5,45.1h0M89,31.8h0M75.2,84.7h0M118.3,39.8h0M51.5,34.8h0M75.7,90.9h0M65.7,67.9h0M110.3,72.9h0M69.4,63.9h0M66.6,75.1h0M79.9,40.1h0M88.9,75.3h0M49.5,56.9h0M59.3,70.1h0M37.7,24.7h0M95.4,76.1h0M95.2,35.4h0M21.9,68.6h0M66.4,47.6h0M72.3,63h0" class="sb" stroke-width="4.8" stroke-linecap="round" stroke-opacity=".75"/></g></g><g transform="translate(300,0)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">r = 0.5</text><g transform="translate(0,16)"><rect x="8" y="6" width="134" height="106" fill="none" stroke="currentColor" stroke-opacity=".25"/><path d="M55.5,41.8h0M39.3,96.5h0M62.9,21.2h0M100.2,49.1h0M68.9,55.3h0M50.9,71.2h0M86.2,41.3h0M49.3,46.3h0M90.1,70.5h0M79,30.4h0M108.8,69.3h0M86.2,50.2h0M63.4,86h0M53.3,62.2h0M90.5,50h0M21.8,70.8h0M54.9,69.1h0M54.7,77.6h0M86.4,65.1h0M75.8,59.8h0M23.8,102.9h0M35.9,66.7h0M65.6,45.9h0M115.8,25h0M85.1,93.1h0M85.6,32.1h0M92.1,64.7h0M88.2,58.1h0M56,66h0M87.8,60.6h0M61.3,46.5h0M61.2,58.7h0M92.2,68.1h0M81.4,42.5h0M83.1,68.5h0M104.9,33.4h0M85.4,56.9h0M78.2,51.5h0M58.6,55h0M42.3,61.4h0M63.2,74.2h0M70.6,53.8h0M74.9,49.5h0M61.7,83.6h0M95.8,21.6h0" class="sb" stroke-width="4.8" stroke-linecap="round" stroke-opacity=".75"/></g></g><g transform="translate(450,0)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">r = 0.9</text><g transform="translate(0,16)"><rect x="8" y="6" width="134" height="106" fill="none" stroke="currentColor" stroke-opacity=".25"/><path d="M71.1,56.5h0M95.2,29.4h0M59.6,72.1h0M82.1,52.5h0M80,57.2h0M93,34.9h0M75.5,58h0M84.7,69.9h0M65.2,69.3h0M80.9,53.8h0M91.9,39h0M94.6,50.6h0M92.9,43.6h0M61.8,74.1h0M102.4,29h0M92.1,36.1h0M79.6,60.8h0M86.6,46.2h0M56.7,75h0M44.1,67h0M85.2,59.9h0M104.7,46.4h0M92.4,50.9h0M101.1,34.2h0M138.1,19.5h0M26.2,89.4h0M61.4,66.2h0M34,87.2h0M79.4,65.2h0M80.2,60.6h0M93.8,49.7h0M77.6,59.5h0M62.7,79.1h0M69.4,48.8h0M68.2,55h0M43.8,73.3h0M65.9,77.1h0M82.7,55.9h0M110.8,34.3h0M110.3,44.1h0M70.7,62.8h0M94.6,51h0M88.7,51.3h0M84.1,52.2h0M82.5,50h0" class="sb" stroke-width="4.8" stroke-linecap="round" stroke-opacity=".75"/></g></g></svg><figcaption>r measures how tightly points hug a straight line: sign = direction, size = tightness.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Covariance</strong>: <code>Σ(x − x̄)(y − ȳ) / (n − 1)</code>; its sign gives direction, its size depends on units. <strong>Pearson correlation r</strong>: <code>cov(x, y) / (sₓ · s_y)</code>, always between −1 and 1, measuring how tightly points hug a <em>straight line</em>. <strong>r²</strong>: the share of y's variance a straight line in x explains; r = 0.3 explains only 9%.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Never compare covariances across variables measured in different units. Compare correlations. And remember r says nothing about the <em>slope</em>: a line rising 1 mark per hour and one rising 50 marks per hour can both have r = 1.</p>
  </div>
  <p>Where you meet it: correlation heatmaps in every EDA notebook, dropping one of two near-duplicate features, checking whether an offline metric tracks an online one, and in portfolio risk (covariance matrices). PCA is built on the covariance matrix.</p>

  <h2 id="sco-ps"><span class="num">02</span>Pearson vs Spearman (and Kendall)</h2>
  <p>Pearson only measures <em>straight-line</em> togetherness, and it uses the raw sizes of values. Two common situations break it. First, a relation that always goes up but curves (salary vs years of experience flattens; app downloads explode). Second, one extreme value, like a single data-entry error of 99999, which can create or destroy a correlation alone.</p>
  <p>The idea: replace each value by its <strong>rank</strong> (1st smallest, 2nd smallest...), then compute Pearson on the ranks. Ranks only care about order, so any always-increasing curve becomes a perfect straight line of ranks, and an outlier can only be "rank n", not "a million".</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two judges score a Diwali rangoli contest. One gives marks out of 10, another out of 100 and is very generous at the top. Their raw marks look different, but if both put the same entries 1st, 2nd and 3rd, they agree completely. Spearman asks "do they agree on the order?", not "do they agree on the marks?".</p>
  </div>
  <h3>Spearman and Kendall by hand</h3>
  <p>x = [1, 2, 3, 4], y = [10, 40, 25, 90]. Ranks of y: 1, 3, 2, 4.</p>
  <ol>
    <li><strong>Spearman</strong>: rank differences d = x-rank − y-rank = 0, −1, 1, 0. Σd² = 2. With n = 4: ρ = 1 − 6Σd² / (n(n² − 1)) = 1 − 12/60 = <strong>0.8</strong>.</li>
    <li><strong>Kendall</strong>: look at all 6 pairs of points. A pair is <em>concordant</em> if both x and y go up together, <em>discordant</em> if one goes up while the other goes down. Only the pair (2nd, 3rd) is discordant (x rises 2→3, y falls 40→25). So 5 concordant, 1 discordant: τ = (5 − 1)/6 = <strong>0.667</strong>.</li>
  </ol>
  <div class="fx" data-lang="py">x, y = [1, 2, 3, 4], [10, 40, 25, 90]           # ranks of y: 1, 3, 2, 4
print("ranks of y:", stats.rankdata(y))
print("spearman:", round(stats.spearmanr(x, y).statistic, 3))
print("kendall :", round(stats.kendalltau(x, y).statistic, 3))
print("pearson :", round(stats.pearsonr(x, y).statistic, 3))</div>
  <div class="fx" data-lang="text">ranks of y: [1. 3. 2. 4.]
spearman: 0.8
kendall : 0.667
pearson : 0.836</div>
  <p>scipy matches both hand values. Pearson (0.836) differs because it also uses the sizes: the jump to 90 pulls it up. Now the two failure cases. The first block is a smooth exponential curve; the second is 30 points of pure noise, then the same noise plus <em>one</em> extreme point at (12, 12).</p>
  <div class="fx" data-lang="py">x = np.arange(1, 21); y = np.exp(x / 3)            # monotonic, not linear
print("curve   pearson=%.3f spearman=%.3f" % (stats.pearsonr(x, y)[0], stats.spearmanr(x, y)[0]))

rng = np.random.default_rng(2)
a, b = rng.normal(0, 1, 30), rng.normal(0, 1, 30)   # unrelated noise
print("noise   pearson=%.3f spearman=%.3f" % (stats.pearsonr(a, b)[0], stats.spearmanr(a, b)[0]))
a2, b2 = np.append(a, 12), np.append(b, 12)         # add ONE extreme point
print("+1 out  pearson=%.3f spearman=%.3f" % (stats.pearsonr(a2, b2)[0], stats.spearmanr(a2, b2)[0]))</div>
  <div class="fx" data-lang="text">curve   pearson=0.798 spearman=1.000
noise   pearson=0.204 spearman=0.208
+1 out  pearson=0.861 spearman=0.283</div>
  <p>The curve always rises, so Spearman is exactly 1 while Pearson under-reports (0.80). On the noise, both are near 0.2 (small samples always show some accidental correlation). One outlier lifts Pearson from 0.20 to 0.86, a fake "strong relationship". Spearman only moves to 0.28, because the outlier is just "rank 31".</p>
  <figure class="viz"><svg viewBox="0 0 600 146" width="600"><g transform="translate(0,0)"><text x="100" y="12" text-anchor="middle" font-weight="bold" font-size="11">curve: P .80 · S 1.00</text><g transform="translate(0,16)"><rect x="8" y="6" width="184" height="116" fill="none" stroke="currentColor" stroke-opacity=".25"/><path d="M20.7,114h0M29,113.9h0M37.4,113.8h0M45.7,113.7h0M54.1,113.5h0M62.4,113.2h0M70.8,112.9h0M79.1,112.3h0M87.5,111.6h0M95.8,110.6h0M104.2,109.2h0M112.5,107.2h0M120.9,104.5h0M129.2,100.6h0M137.6,95.3h0M145.9,87.8h0M154.3,77.3h0M162.6,62.7h0M171,42.4h0M179.3,14h0" class="sb" stroke-width="6.4" stroke-linecap="round" stroke-opacity=".75"/></g></g><g transform="translate(200,0)"><text x="100" y="12" text-anchor="middle" font-weight="bold" font-size="11">noise: P .20 · S .21</text><g transform="translate(0,16)"><rect x="8" y="6" width="184" height="116" fill="none" stroke="currentColor" stroke-opacity=".25"/><path d="M113.5,50.1h0M88.4,66.9h0M92.2,44.5h0M20.7,52.9h0M170.2,65h0M147.1,63.2h0M95.3,73.9h0M134.1,49.5h0M116.7,96.5h0M87.3,79.8h0M141.3,64.2h0M95.8,27.5h0M95.2,87.9h0M78.9,95.3h0M122.8,83.2h0M103.3,47.1h0M126,75.4h0M85.4,38.7h0M111.3,114h0M75.3,43.3h0M136.5,45.5h0M113.4,103.3h0M118.4,66.3h0M121.3,41.3h0M71.1,67.8h0M134.4,46.4h0M179.3,14h0M49,63.5h0M45.8,76.5h0M53.7,88.1h0" class="sb" stroke-width="6.4" stroke-linecap="round" stroke-opacity=".75"/></g></g><g transform="translate(400,0)"><text x="100" y="12" text-anchor="middle" font-weight="bold" font-size="11">+1 outlier: P .86 · S .28</text><g transform="translate(0,16)"><rect x="8" y="6" width="184" height="116" fill="none" stroke="currentColor" stroke-opacity=".25"/><path d="M49.6,94.4h0M41.8,99.6h0M43,92.7h0M20.7,95.3h0M67.3,99h0M60.1,98.5h0M43.9,101.7h0M56,94.2h0M50.6,108.6h0M41.4,103.5h0M58.2,98.8h0M44.1,87.5h0M43.9,106h0M38.8,108.3h0M52.5,104.6h0M46.4,93.5h0M53.5,102.2h0M40.8,91h0M48.9,114h0M37.7,92.4h0M56.7,93h0M49.6,110.7h0M51.1,99.4h0M52,91.7h0M36.4,99.9h0M56.1,93.3h0M70.1,83.4h0M29.5,98.5h0M28.5,102.5h0M31,106.1h0M179.3,14h0" class="sb" stroke-width="4.8" stroke-linecap="round" stroke-opacity=".75"/></g></g></svg><figcaption>Left: perfectly monotonic, so Spearman (S) = 1 but Pearson (P) doesn't. Right: one point at (12, 12) fakes a strong Pearson r.</figcaption></figure>
  <div class="cards">
    <div><b>Pearson</b><p>Linear relationship on raw values.</p><small>Sensitive to outliers and curves</small></div>
    <div><b>Spearman</b><p>Pearson on the <em>ranks</em>: any monotonic (always up or always down) relation.</p><small>Robust to outliers, skew; fine for ratings</small></div>
    <div><b>Kendall τ</b><p>Share of agreeing minus disagreeing pairs.</p><small>Small samples, many ties; easy to explain</small></div>
  </div>
  <p>In practice you compute all pairs at once on a DataFrame. <code>df.corr()</code> gives a <strong>correlation matrix</strong>; <code>method="spearman"</code> switches to ranks.</p>
  <div class="fx" data-lang="py">import pandas as pd
df = pd.DataFrame({"hours": [1, 2, 3, 4, 5, 6],
                   "score": [52, 55, 61, 64, 68, 70],
                   "phone_hrs": [6, 5, 5, 3, 2, 2],
                   "sleep": [7, 6, 8, 6, 7, 8]})
print(df.corr().round(2))
print(df.corr(method="spearman")["score"].round(2).to_dict())
x = np.array([-2, -1, 0, 1, 2])
print("r(x, x squared) =", round(np.corrcoef(x, x**2)[0, 1], 3))</div>
  <div class="fx" data-lang="text">           hours  score  phone_hrs  sleep
hours       1.00   0.99      -0.96   0.36
score       0.99   1.00      -0.95   0.38
phone_hrs  -0.96  -0.95       1.00  -0.13
sleep       0.36   0.38      -0.13   1.00
{'hours': 1.0, 'score': 1.0, 'phone_hrs': -0.97, 'sleep': 0.36}
r(x, x squared) = 0.0</div>
  <p>The matrix is symmetric with 1s on the diagonal (each column with itself). Phone hours are strongly <em>negative</em> with score (−0.95). Spearman for hours-score is exactly 1.0 because score always rises with hours. The last line is the classic trap: y = x² depends completely on x, yet r = 0, because the left half goes down and the right half goes up, and they cancel.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Monotonic</strong>: always moves in one direction (never turns back). <strong>Spearman's ρ</strong> (rho): Pearson computed on ranks. <strong>Kendall's τ</strong> (tau): (concordant − discordant pairs) / total pairs.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>r = 0 means no <em>linear</em> (or for Spearman, no monotonic) relation. It does not mean independent. Always look at a scatter plot before saying "unrelated".</p>
  </div>

  <h2 id="sco-cause"><span class="num">03</span>Correlation ≠ Causation</h2>
  <p>A report says "users who use the wishlist spend 40% more, so let's push the wishlist to everyone". That spend may not move at all, because the correlation might come from something else. Acting on correlation as if it were cause wastes engineering months and sometimes harms users. This is the most common analytics mistake, and interviewers test it with almost every case question.</p>
  <p>The idea: when A and B rise together, there are four stories besides "A causes B". A hidden third thing causes both. B causes A. You only looked at a filtered group. Or it is a coincidence among many things you checked.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Cities with more fire engines at a fire have more damage. Fire engines don't cause damage; a bigger fire causes both more engines and more damage. Sending fewer engines will not reduce damage. The size of the fire is the <em>confounder</em>.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 520 140" width="520"><defs><marker id="ad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><rect x="190" y="8" width="140" height="28" rx="6" class="ft st" stroke="currentColor" stroke-opacity=".5"/><text x="260.0" y="26" text-anchor="middle">Temperature</text><rect x="20" y="100" width="140" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity=".5"/><text x="90.0" y="118" text-anchor="middle">Ice cream sales</text><rect x="360" y="100" width="140" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity=".5"/><text x="430.0" y="118" text-anchor="middle">Drownings</text><line x1="230" y1="36" x2="110" y2="98" stroke="currentColor" marker-end="url(#ad)"/><line x1="290" y1="36" x2="410" y2="98" stroke="currentColor" marker-end="url(#ad)"/><line x1="162" y1="114" x2="358" y2="114" class="sr" stroke-dasharray="5 4"/><text x="260" y="108" text-anchor="middle" class="tr" font-size="11">r = 0.67, no causal link</text></svg><figcaption>A confounder (temperature) causes both. Ban ice cream and drownings won't change.</figcaption></figure>
  <table class="tbl">
    <tr><th>Explanation</th><th>Example</th></tr>
    <tr><td><strong>Confounder</strong>: Z drives both</td><td>Hot weather → ice cream sales and drownings</td></tr>
    <tr><td><strong>Reverse causation</strong></td><td>"Users who contact support churn more": unhappy users contact support</td></tr>
    <tr><td><strong>Selection bias</strong></td><td>Only surveyed customers who stayed; only looked at successful startups</td></tr>
    <tr><td><strong>Coincidence</strong></td><td>Test enough pairs and some correlate by chance (see multiple testing)</td></tr>
  </table>
  <h3>"Controlling for" a confounder, step by step</h3>
  <p>To ask "do ice cream and drownings move together <em>on days with the same temperature</em>?":</p>
  <ol>
    <li>Predict ice cream from temperature with a straight line. Keep the leftover (the <strong>residual</strong>): the part temperature does not explain.</li>
    <li>Do the same for drownings.</li>
    <li>Correlate the two leftovers. That is the <strong>partial correlation</strong>.</li>
  </ol>
  <p>There is also a formula using only three ordinary correlations: r_xy·z = (r_xy − r_xz·r_yz) / √((1 − r_xz²)(1 − r_yz²)). With r(ice, drown) = 0.668, r(ice, temp) = 0.931, r(drown, temp) = 0.735: numerator 0.668 − 0.684 = −0.016; denominator √(0.133 × 0.460) = 0.247; result ≈ −0.07. The code simulates a year of days where temperature causes both, and does it both ways.</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
temp = rng.normal(25, 5, 365)                          # daily temperature
ice = 10 * temp + rng.normal(0, 20, 365)               # temp → ice cream
drown = 0.3 * temp + rng.normal(0, 1.5, 365)           # temp → drownings
print("corr(ice, drown):", round(np.corrcoef(ice, drown)[0, 1], 3))
# control for temp: correlate what's left after removing temp's effect
res = lambda v: v - np.polyval(np.polyfit(temp, v, 1), temp)
print("partial corr | temp:", round(np.corrcoef(res(ice), res(drown))[0, 1], 3))
r = np.corrcoef([ice, drown, temp])
rxy, rxz, ryz = r[0, 1], r[0, 2], r[1, 2]
print("r(ice,temp)=%.3f r(drown,temp)=%.3f" % (rxz, ryz))
print("formula:", round((rxy - rxz * ryz) / np.sqrt((1 - rxz**2) * (1 - ryz**2)), 3))</div>
  <div class="fx" data-lang="text">corr(ice, drown): 0.668
partial corr | temp: -0.065
r(ice,temp)=0.931 r(drown,temp)=0.735
formula: -0.065</div>
  <p>In the code, ice cream never touches drownings; only <code>temp</code> feeds both. Still the raw correlation is 0.668. <code>np.polyfit(temp, v, 1)</code> fits the straight line and <code>res</code> subtracts it, leaving the residual. Correlating residuals gives −0.065: nothing left. The formula gives the same answer.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Confounder</strong>: a variable that causes both X and Y, creating a correlation without X causing Y. <strong>Partial correlation</strong>: the correlation of X and Y after removing the linear effect of Z from both. <strong>Causation</strong> is shown by a <strong>randomised experiment</strong> (an A/B test: random assignment breaks every confounder), or, when you cannot randomise, by causal methods such as difference-in-differences, instrumental variables or matching.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Controlling only removes confounders you measured and only their <em>linear</em> effect. An unmeasured confounder (user motivation, income) still fools you. That is why A/B tests are the gold standard; see <a class="xref" data-note="st_abtesting">A/B Testing</a>.</p>
  </div>

  <h2 id="sco-simpson"><span class="num">04</span>Simpson's Paradox</h2>
  <p>A dashboard shows overall conversion fell after a launch. The team panics. But when you split by country, conversion <em>rose</em> in every single country. Both statements are true at once. If you only look at the pooled number, you will kill a good feature; if you only look at one segment, you might ship a bad one.</p>
  <p>The idea: an overall rate is a <strong>weighted average</strong> of the group rates, and the weights are "how much of each group you have". If two treatments got very different mixes of easy and hard cases, the overall rates compare the mixes, not the treatments.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two coaching institutes. Institute A takes mostly weak students and gets more of them through than other institutes would. Institute B takes mostly toppers. B's overall pass rate is higher, yet for weak students A does better and for toppers A also does better. B's "win" comes from whom it admits, not how it teaches.</p>
  </div>
  <h3>Real data: kidney-stone treatments (Charig et al., 1986)</h3>
  <table class="tbl">
    <tr><th>Success rate</th><th>Treatment A (surgery)</th><th>Treatment B (less invasive)</th><th>Winner</th></tr>
    <tr><td>Small stones</td><td>81/87 = <strong>93%</strong></td><td>234/270 = 87%</td><td>A</td></tr>
    <tr><td>Large stones</td><td>192/263 = <strong>73%</strong></td><td>55/80 = 69%</td><td>A</td></tr>
    <tr><td>All patients</td><td>273/350 = 78%</td><td>289/350 = <strong>83%</strong></td><td>B ?!</td></tr>
  </table>
  <p>The weighted-average view, by hand:</p>
  <ol>
    <li>A's patients: 87 small (25%) and 263 large (75%). Overall A = 0.25 × 93.1% + 0.75 × 73.0% = 23.1 + 54.9 = <strong>78.0%</strong>.</li>
    <li>B's patients: 270 small (77%) and 80 large (23%). Overall B = 0.77 × 86.7% + 0.23 × 68.8% = 66.9 + 15.7 = <strong>82.6%</strong>.</li>
    <li>Large stones are much harder (about 70% success) than small ones (about 90%). A got three-quarters hard cases, B got under a quarter. That mix, not the treatment, decides the pooled number.</li>
  </ol>
  <figure class="viz"><svg viewBox="0 0 560 170" width="560"><text x="60" y="32" text-anchor="end">small</text><rect x="70" y="10" width="391" height="17" class="fb sb"/><text x="466" y="23" font-size="11">A 93%</text><rect x="70" y="30" width="364" height="17" class="ft st"/><text x="439" y="43" font-size="11">B 87%</text><text x="60" y="84" text-anchor="end">large</text><rect x="70" y="62" width="307" height="17" class="fb sb"/><text x="382" y="75" font-size="11">A 73%</text><rect x="70" y="82" width="289" height="17" class="ft st"/><text x="364" y="95" font-size="11">B 69%</text><text x="60" y="136" text-anchor="end">all</text><rect x="70" y="114" width="328" height="17" class="fb sb"/><text x="403" y="127" font-size="11">A 78%</text><rect x="70" y="134" width="347" height="17" class="ft st"/><text x="422" y="147" font-size="11">B 83%</text><line x1="0" y1="113" x2="560" y2="113" stroke="currentColor" stroke-opacity=".3" stroke-dasharray="3 3"/></svg><figcaption>A wins in both groups (blue longer), but B wins on the pooled row because A got mostly large, hard cases.</figcaption></figure>
  <p>The code builds the same table in pandas: per-group rates with <code>pivot</code>, pooled rates with <code>groupby</code>, and the case-mix counts that explain the flip.</p>
  <div class="fx" data-lang="py">df = pd.DataFrame({"treat": ["A", "A", "B", "B"], "size": ["small", "large"] * 2,
                   "ok": [81, 192, 234, 55], "n": [87, 263, 270, 80]})
by = df.assign(rate=(df.ok / df.n).round(3)).pivot(index="size", columns="treat", values="rate")
print(by)
tot = df.groupby("treat")[["ok", "n"]].sum()
print((tot.ok / tot.n).round(3).to_dict())
print(df.pivot(index="size", columns="treat", values="n"))</div>
  <div class="fx" data-lang="text">treat      A      B
size
large  0.730  0.688
small  0.931  0.867
{'A': 0.78, 'B': 0.826}
treat    A    B
size
large  263   80
small   87  270</div>
  <p>The first table: A wins in both rows. The dictionary: B wins overall. The last table is the explanation: A's 263 large-stone cases vs B's 80. Doctors gave surgery to harder cases, so stone size is a confounder for both "which treatment" and "success".</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Simpson's paradox</strong>: a trend that appears in every subgroup reverses (or vanishes) when the subgroups are combined, because a confounder changes the group sizes.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Neither "always segment" nor "always pool" is the rule. Segment by variables that <em>cause</em> both the treatment choice and the outcome (here stone size). In an A/B test, randomisation should balance segments; a big mix shift between arms is itself a warning sign of a bug.</p>
  </div>

  <h2 id="sco-vif"><span class="num">05</span>Multicollinearity &amp; VIF</h2>
  <p>A house-price model has both "square feet" and "number of rooms". Bigger houses have more rooms, so the two columns carry nearly the same information. Prediction is fine, but ask the model "how much does one extra room add?" and you get a nonsense answer that changes wildly with small changes in data. If your job is explaining drivers ("what moves price?"), this breaks it.</p>
  <p>The idea: when two features move together, the model cannot tell which one deserves the credit. Many different splits of credit fit the data almost equally well, so the coefficient it picks is shaky, and its standard error is large.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two friends always cook together. The dal is excellent. Who should get the credit? You cannot tell, because you have never seen either cook alone. Any split, 50-50 or 90-10, matches what you saw.</p>
  </div>
  <div class="flow"><span>Features highly correlated</span><span>Model can't tell who gets credit</span><span>Unstable, huge-SE coefficients</span></div>
  <h3>VIF by hand</h3>
  <ol>
    <li>Take one feature, say rooms. Predict it from all the other features with a linear regression.</li>
    <li>Read that regression's R² (share of rooms' variance explained by the others). Say R² = 0.90.</li>
    <li>VIF = 1 / (1 − R²) = 1 / 0.10 = <strong>10</strong>. Rooms' coefficient variance is 10 times bigger than it would be with unrelated features; its SE is √10 ≈ 3.2 times bigger.</li>
    <li>With only two features, R² = r², so r = 0.95 → R² = 0.9025 → VIF = 10.3.</li>
  </ol>
  <p>The code simulates 200 houses where rooms ≈ sqft/300 plus a little noise, and age is unrelated, then computes VIF for each.</p>
  <div class="fx" data-lang="py">from statsmodels.stats.outliers_influence import variance_inflation_factor
from statsmodels.tools import add_constant
rng = np.random.default_rng(1)
sqft = rng.normal(1500, 400, 200)
rooms = sqft / 300 + rng.normal(0, 0.4, 200)    # nearly a copy of sqft
age = rng.normal(20, 8, 200)                    # unrelated
X = add_constant(pd.DataFrame({"sqft": sqft, "rooms": rooms, "age": age}))
for i, col in enumerate(X.columns[1:], start=1):
    print(f"{col:6s} VIF = {variance_inflation_factor(X.values, i):.1f}")
r = np.corrcoef(sqft, rooms)[0, 1]
print(f"r(sqft, rooms) = {r:.3f}  -&gt;  1/(1-r^2) = {1/(1-r**2):.1f}")</div>
  <div class="fx" data-lang="text">sqft   VIF = 13.8
rooms  VIF = 13.7
age    VIF = 1.1
r(sqft, rooms) = 0.961  -&gt;  1/(1-r^2) = 13.2</div>
  <p><code>add_constant</code> adds the intercept column (VIF needs it, which is why the loop starts at index 1). sqft and rooms are around 14; age is 1.1, almost no overlap. The last line checks the two-feature shortcut: 1/(1 − 0.961²) = 13.2, close to the full value (age adds a tiny bit). Now the consequence: fit price with and without sqft and watch the rooms coefficient.</p>
  <div class="fx" data-lang="py">import statsmodels.api as sm
price = 0.05 * sqft + 2 * rooms - 0.3 * age + rng.normal(0, 10, 200)   # lakh rupees
for cols in [["rooms", "age"], ["sqft", "rooms", "age"]]:
    m = sm.OLS(price, add_constant(X[cols])).fit()
    print(f"{'+'.join(cols):15s} rooms coef={m.params['rooms']:6.2f}  SE={m.bse['rooms']:.2f}  R2={m.rsquared:.3f}")</div>
  <div class="fx" data-lang="text">rooms+age       rooms coef= 15.00  SE=0.63  R2=0.741
sqft+rooms+age  rooms coef=  3.32  SE=2.18  R2=0.776</div>
  <p>The true effect of a room is 2. Without sqft, rooms soaks up sqft's effect and claims 15 lakh per room. With sqft, the estimate is 3.32 but the SE jumps from 0.63 to 2.18, so its 95% CI (about −1 to +7.6) even includes "rooms lower the price". Meanwhile R² barely moves (0.741 → 0.776): predictions are fine either way.</p>
  <table class="tbl">
    <tr><th>VIF</th><th>Meaning</th><th>Action</th></tr>
    <tr><td>1</td><td>No collinearity</td><td>none</td></tr>
    <tr><td>5–10</td><td>Moderate to high</td><td>watch if you interpret coefficients</td></tr>
    <tr><td>&gt; 10</td><td>Severe</td><td>drop/merge features, PCA, or ridge regression</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Multicollinearity</strong>: two or more features are strongly linearly related. <strong>VIF</strong> (variance inflation factor) of feature j = 1/(1 − R²ⱼ), where R²ⱼ comes from regressing j on all other features.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Multicollinearity hurts <em>interpretation</em>, not prediction. Don't drop useful features from a pure prediction model just because VIF is high. Tree models don't mind for accuracy, but their feature importance gets split between the copies, so each looks less important.</p>
  </div>

  <h2 id="sco-anscombe"><span class="num">06</span>Anscombe's Quartet</h2>
  <p>Busy analysts often report a table of summary numbers (mean, variance, correlation, regression line) and never draw the data. The summaries feel complete. They are not: very different datasets can share exactly the same summaries, and the right analysis for each one is different.</p>
  <p>The idea: Francis Anscombe built four small datasets in 1973 that match on every common summary to two decimals, yet look nothing alike when plotted. One is a clean line, one a curve, one a line with a single outlier, and one is a vertical column plus one far point that alone creates the slope.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Four cricket batters each average 40 runs. One scores 38 to 42 every match. One scores 0 or 80. One scores 35 every time except a single 200. One played one match. Same average, completely different batters. You would want to see the scorecards.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 136" width="600"><g transform="translate(0,0)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">I linear</text><g transform="translate(0,16)"><rect x="8" y="6" width="134" height="106" fill="none" stroke="currentColor" stroke-opacity=".25"/><line x1="17.2" y1="91" x2="132.8" y2="13.3" class="sr" stroke-width="1.2" stroke-dasharray="4 3"/><path d="M64.8,58.6h0M51.2,68.6h0M85.2,62.8h0M58,51.6h0M71.6,56h0M92,41.1h0M37.6,65.9h0M24,93.2h0M78.4,33h0M44.4,88.1h0M30.8,80.2h0" class="sb" stroke-width="6.4" stroke-linecap="round" stroke-opacity=".75"/></g></g><g transform="translate(150,0)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">II curved</text><g transform="translate(0,16)"><rect x="8" y="6" width="134" height="106" fill="none" stroke="currentColor" stroke-opacity=".25"/><line x1="17.2" y1="91" x2="132.8" y2="13.3" class="sr" stroke-width="1.2" stroke-dasharray="4 3"/><path d="M64.8,48.6h0M51.2,57.7h0M85.2,52.2h0M58,52h0M71.6,47.5h0M92,58.1h0M37.6,76.1h0M24,103.8h0M78.4,48.7h0M44.4,65.8h0M30.8,88.8h0" class="sb" stroke-width="6.4" stroke-linecap="round" stroke-opacity=".75"/></g></g><g transform="translate(300,0)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">III outlier</text><g transform="translate(0,16)"><rect x="8" y="6" width="134" height="106" fill="none" stroke="currentColor" stroke-opacity=".25"/><line x1="17.2" y1="91" x2="132.8" y2="13.3" class="sr" stroke-width="1.2" stroke-dasharray="4 3"/><path d="M64.8,63.9h0M51.2,70.2h0M85.2,15.7h0M58,67.1h0M71.6,60.7h0M92,51.3h0M37.6,76.5h0M24,82.9h0M78.4,57.6h0M44.4,73.4h0M30.8,79.7h0" class="sb" stroke-width="6.4" stroke-linecap="round" stroke-opacity=".75"/></g></g><g transform="translate(450,0)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">IV leverage</text><g transform="translate(0,16)"><rect x="8" y="6" width="134" height="106" fill="none" stroke="currentColor" stroke-opacity=".25"/><line x1="17.2" y1="91" x2="132.8" y2="13.3" class="sr" stroke-width="1.2" stroke-dasharray="4 3"/><path d="M51.2,72h0M51.2,79.5h0M51.2,61.7h0M51.2,51.3h0M51.2,54.7h0M51.2,67.8h0M51.2,84.1h0M126,17.9h0M51.2,81.3h0M51.2,59.8h0M51.2,69.1h0" class="sb" stroke-width="6.4" stroke-linecap="round" stroke-opacity=".75"/></g></g></svg><figcaption>Same mean, variance, r = 0.816 and fitted line (red) in all four. Only the plot shows they're different.</figcaption></figure>
  <p>The code loads the four datasets (the original published values) and prints the same summaries for each.</p>
  <div class="fx" data-lang="py">x = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5]
ys = {"I":   [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68],
      "II":  [9.14, 8.14, 8.74, 8.77, 9.26, 8.10, 6.13, 3.10, 9.13, 7.26, 4.74],
      "III": [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73]}
x4 = [8, 8, 8, 8, 8, 8, 8, 19, 8, 8, 8]
y4 = [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.50, 5.56, 7.91, 6.89]
sets = [(x, ys["I"]), (x, ys["II"]), (x, ys["III"]), (x4, y4)]
for name, (xx, yy) in zip(["I", "II", "III", "IV"], sets):
    slope, icpt = np.polyfit(xx, yy, 1)
    print(f"{name:3s} mean_y={np.mean(yy):.2f} var_y={np.var(yy, ddof=1):.2f} "
          f"r={np.corrcoef(xx, yy)[0, 1]:.3f} fit: y={icpt:.2f}+{slope:.3f}x")</div>
  <div class="fx" data-lang="text">I   mean_y=7.50 var_y=4.13 r=0.816 fit: y=3.00+0.500x
II  mean_y=7.50 var_y=4.13 r=0.816 fit: y=3.00+0.500x
III mean_y=7.50 var_y=4.12 r=0.816 fit: y=3.00+0.500x
IV  mean_y=7.50 var_y=4.12 r=0.817 fit: y=3.00+0.500x</div>
  <p><code>np.polyfit(xx, yy, 1)</code> fits a straight line and returns (slope, intercept). All four print mean 7.50, variance 4.12 to 4.13, r = 0.816 and the line y = 3 + 0.5x. The right action differs: dataset I is fine for a line; II needs a curve (add x²); III needs the outlier checked; IV has no evidence of any relation without its one far point.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Outlier</strong>: a point far from the pattern in y. <strong>Leverage point</strong>: a point far from the others in x, which can pull a fitted line toward itself (dataset IV).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Summary statistics compress; plots reveal. Before reporting a correlation or fitting a line, draw the scatter plot (<code>df.plot.scatter</code>, <code>sns.pairplot</code>). The modern version of this lesson is the "Datasaurus Dozen": a dinosaur and a star with the same summaries.</p>
  </div>

  <h2 id="sco-traps"><span class="num">07</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: reading causation into r</span>
    <p>"Feature X users retain better, so X causes retention." Check confounders (engaged users do everything more), reverse causation, and selection. Only an experiment settles it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: r = 0 means unrelated</span>
    <p>r measures straight-line relation only. y = x² on symmetric x gives r = 0. U-shapes, cycles and thresholds all hide from r. Plot first.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: one outlier driving r</span>
    <p>One point moved our noise from r = 0.20 to 0.86. Compare Pearson with Spearman; if they disagree a lot, look for outliers or curves.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: confusing significance with strength</span>
    <p>With n = 10,000, r = 0.05 is "significant" (p &lt; 0.001) but explains 0.25% of the variance. Report r (or r²) and its CI, not just p.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: comparing covariances</span>
    <p>Covariance changes with units (×10 when score is out of 1,000). Use correlation to compare strength across pairs.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: dropping features for prediction because of VIF</span>
    <p>High VIF makes coefficients unreliable, not predictions. Only act on VIF when you need to interpret coefficients; otherwise ridge regularisation is usually enough.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: pooling groups blindly</span>
    <p>A pooled rate mixes treatment effect with case mix (Simpson). Check whether group sizes differ between the things you compare.</p>
  </div>

  <h2 id="sco-qa"><span class="num">08</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between covariance and correlation?</summary><div class="qa-body">Covariance = Σ(x − x̄)(y − ȳ)/(n − 1): sign gives direction, but size depends on units. Correlation divides covariance by both standard deviations, so it is unit-free and lies in [−1, 1]. Rescale one variable by 10 and covariance grows 10×; r is unchanged.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute r by hand: x = [1, 2, 3, 4, 5], y = [52, 55, 61, 64, 68].</summary><div class="qa-body">Means 3 and 60. Products of deviations: 16, 5, 0, 4, 16 → sum 41, cov = 41/4 = 10.25. sₓ = √2.5 = 1.581, s_y = √42.5 = 6.519. r = 10.25 / 10.31 = 0.994.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use Spearman over Pearson?</summary><div class="qa-body">When the relation is monotonic but not linear (e.g. diminishing returns), data is ordinal (ratings), or there are outliers/heavy skew. Spearman ranks first, so one extreme point can't dominate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Users who use feature X retain 30% better. Can we say X causes retention?</summary><div class="qa-body">No. Engaged users both find X and stay (confounder: engagement); or retained users simply had more time to find X (reverse/time bias). Run an experiment: randomly expose X, or use matching / diff-in-diff if you can't.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "controlling for Z" mean, concretely?</summary><div class="qa-body">Remove the part of X and of Y that Z explains (regress each on Z, keep residuals), then correlate what is left. That is the partial correlation. In a regression, adding Z as a feature does the same for the coefficient of X. It only handles measured confounders and their modelled (often linear) effect.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain Simpson's paradox with an example.</summary><div class="qa-body">Kidney stones: treatment A wins for small stones (93% vs 87%) and large stones (73% vs 69%), yet loses overall (78% vs 83%), because 75% of A's patients had hard large stones vs 23% of B's. The pooled rate is a weighted average, and the weights (case mix) differ.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two features have correlation 0.98. What happens in linear regression? In a random forest?</summary><div class="qa-body">Linear regression: coefficients become unstable with big standard errors; signs can flip; predictions are fine. VIF ≈ 1/(1 − 0.98²) ≈ 25. Random forest: predictions fine, but feature importance gets split between the two, so each looks less important.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is VIF and how is it computed?</summary><div class="qa-body">For each feature, regress it on all other features and get R². VIF = 1/(1 − R²): how much its coefficient's variance is inflated by collinearity. Above 5–10 is a warning sign.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Predict: r between x = [−2, −1, 0, 1, 2] and y = x².</summary><div class="qa-body">0. y = [4, 1, 0, 1, 4] is perfectly determined by x but symmetric, so the linear association cancels out. Spearman is also 0 here because it's not monotonic.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>r = 0.3 with n = 10,000 and p &lt; 0.001. Strong relationship?</summary><div class="qa-body">Significant, but weak: r² = 0.09, so x explains 9% of y's variance. p reflects sample size; r reflects strength.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the point of Anscombe's quartet?</summary><div class="qa-body">Four datasets share mean, variance, correlation (0.816) and regression line, yet one is linear, one curved, one has an outlier and one is driven by a single leverage point. Never trust summary statistics without a plot.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you find correlated features quickly in pandas?</summary><div class="qa-body"><code>df.corr(method="spearman")</code>, then list pairs with |r| &gt; 0.8 from the upper triangle (<code>np.triu</code> mask). Plot as a heatmap. Follow up with VIF for groups of features.</div></details>
</main>`
});
