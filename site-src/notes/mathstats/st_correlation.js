// notes/mathstats/st_correlation.js — Correlation & Relationships
Object.assign(TOPIC_CONTENT, {
  "st_correlation": `<main>
  <h1>Correlation &amp; Relationships</h1>
  <p class="lead">How two variables move together, and the many ways that number lies. Used daily in feature selection and EDA; misused daily in "X causes Y" claims. Builds on Descriptive Statistics.</p>

  <h2 id="sco-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Correlation &amp; Relationships</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Covariance &amp; Pearson</div>
        <ul>
          <li><b>Covariance</b> — <code>Σ(x − x̄)(y − ȳ)/(n − 1)</code>; sign = direction</li>
          <li>⚠ covariance carries units; size alone is meaningless</li>
          <li><b>Pearson r</b> — <code>cov / (sₓ s_y)</code>, −1 to 1, linear strength</li>
          <li><b>Worked</b> — hours vs score: cov 10.25, r 0.994</li>
          <li><b>r²</b> — share of variance explained (r 0.3 → 9%)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Pearson vs Spearman</div>
        <ul>
          <li><b>Spearman</b> — Pearson on ranks; any monotonic relation</li>
          <li><b>Curve</b> — exp curve: Pearson 0.80, Spearman 1.00</li>
          <li><b>Outlier</b> — one point: Pearson 0.20 → 0.86; Spearman 0.28</li>
          <li><b>Kendall τ</b> — pair agreement; small n, ties</li>
          <li>⚠ r = 0 ≠ independent (y = x²)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Causation</div>
        <ul>
          <li><b>Confounder</b> — Z causes X and Y (heat → ice cream, drownings)</li>
          <li><b>Demo</b> — r 0.67 raw → −0.07 after controlling temperature</li>
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
          <li><b>Why</b> — A got mostly hard cases; size confounds</li>
          <li><b>DS version</b> — traffic mix shift hides per-country gains</li>
          <li><b>Fix</b> — segment by the confounder</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Multicollinearity</div>
        <ul>
          <li><b>What</b> — features nearly copies of each other</li>
          <li><b>Effect</b> — unstable coefficients, huge SEs, sign flips</li>
          <li><b>VIF</b> — <code>1/(1 − R²)</code> of feature on the rest; &gt;10 severe</li>
          <li><b>Example</b> — sqft &amp; rooms VIF ≈ 14, age 1.1</li>
          <li><b>Fix</b> — drop/combine, PCA, ridge</li>
          <li>⚠ hurts interpretation, not prediction</li>
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
      <div class="rm-item rm-done" data-target="sco-cov"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Covariance → Correlation</span><span class="rm-sub">Direction, then strength</span></div></div>
      <div class="rm-item rm-done" data-target="sco-ps"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Pearson vs Spearman</span><span class="rm-sub">Curves and outliers</span></div></div>
      <div class="rm-item rm-done" data-target="sco-cause"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Correlation ≠ Causation</span><span class="rm-sub">Confounders, reverse cause</span></div></div>
      <div class="rm-item rm-done" data-target="sco-simpson"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Simpson's Paradox</span><span class="rm-sub">Real kidney-stone data</span></div></div>
      <div class="rm-item rm-done" data-target="sco-vif"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Multicollinearity &amp; VIF</span><span class="rm-sub">When features copy each other</span></div></div>
      <div class="rm-item rm-done" data-target="sco-anscombe"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Anscombe's Quartet</span><span class="rm-sub">Always plot your data</span></div></div>
      <div class="rm-item rm-done" data-target="sco-qa"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="sco-cov"><span class="num">01</span>Covariance → Correlation</h2>
  <figure class="viz"><svg viewBox="0 0 600 136" width="600"><g transform="translate(0,0)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">r = -0.9</text><g transform="translate(0,16)"><rect x="8" y="6" width="134" height="106" fill="none" stroke="currentColor" stroke-opacity=".25"/><path d="M85.8,77.9h0M82.5,61.6h0M50.9,39.1h0M83.1,71.5h0M66.9,39.8h0M63,59.2h0M103.7,69.1h0M62,62.3h0M71,65h0M86.2,71.7h0M93.2,69h0M73.4,62.4h0M70.3,48.7h0M109.3,88.2h0M95.4,76.5h0M103,81h0M74.3,60.8h0M95.7,78.5h0M91.9,83h0M64.6,59.5h0M53.2,36.1h0M119.6,92.1h0M99,77.7h0M64.2,66.1h0M78.8,64h0M48.3,47.2h0M53.6,50.7h0M78,68h0M46.5,32h0M25.5,14.8h0M60.9,41.2h0M87.8,69.7h0M43.8,37.4h0M70.8,55.8h0M60,50h0M79.5,60.7h0M68.5,60.6h0M49.2,48.8h0M94.6,84.6h0M52.3,43.9h0M90.4,80.1h0M60.6,55.9h0M105.6,78.4h0M99.3,80.8h0M72.9,60.9h0" class="sb" stroke-width="4.8" stroke-linecap="round" stroke-opacity=".75"/></g></g><g transform="translate(150,0)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">r = 0</text><g transform="translate(0,16)"><rect x="8" y="6" width="134" height="106" fill="none" stroke="currentColor" stroke-opacity=".25"/><path d="M73.8,35.5h0M63.5,81.1h0M34.2,62.6h0M67.2,54.3h0M64.7,67.4h0M59,68.1h0M78.6,65.7h0M77.2,25.6h0M85.6,86.7h0M113.5,52.9h0M54.1,43.1h0M75.4,69.8h0M60.9,76.5h0M76.1,40.2h0M67.8,51.6h0M116.7,80.3h0M80.7,64.4h0M51.5,77h0M74.7,51.4h0M63.2,58h0M91,53.8h0M94.3,50.9h0M85.8,26.9h0M88.8,56.7h0M90.8,75.2h0M67.5,45.1h0M89,31.8h0M75.2,84.7h0M118.3,39.8h0M51.5,34.8h0M75.7,90.9h0M65.7,67.9h0M110.3,72.9h0M69.4,63.9h0M66.6,75.1h0M79.9,40.1h0M88.9,75.3h0M49.5,56.9h0M59.3,70.1h0M37.7,24.7h0M95.4,76.1h0M95.2,35.4h0M21.9,68.6h0M66.4,47.6h0M72.3,63h0" class="sb" stroke-width="4.8" stroke-linecap="round" stroke-opacity=".75"/></g></g><g transform="translate(300,0)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">r = 0.5</text><g transform="translate(0,16)"><rect x="8" y="6" width="134" height="106" fill="none" stroke="currentColor" stroke-opacity=".25"/><path d="M55.5,41.8h0M39.3,96.5h0M62.9,21.2h0M100.2,49.1h0M68.9,55.3h0M50.9,71.2h0M86.2,41.3h0M49.3,46.3h0M90.1,70.5h0M79,30.4h0M108.8,69.3h0M86.2,50.2h0M63.4,86h0M53.3,62.2h0M90.5,50h0M21.8,70.8h0M54.9,69.1h0M54.7,77.6h0M86.4,65.1h0M75.8,59.8h0M23.8,102.9h0M35.9,66.7h0M65.6,45.9h0M115.8,25h0M85.1,93.1h0M85.6,32.1h0M92.1,64.7h0M88.2,58.1h0M56,66h0M87.8,60.6h0M61.3,46.5h0M61.2,58.7h0M92.2,68.1h0M81.4,42.5h0M83.1,68.5h0M104.9,33.4h0M85.4,56.9h0M78.2,51.5h0M58.6,55h0M42.3,61.4h0M63.2,74.2h0M70.6,53.8h0M74.9,49.5h0M61.7,83.6h0M95.8,21.6h0" class="sb" stroke-width="4.8" stroke-linecap="round" stroke-opacity=".75"/></g></g><g transform="translate(450,0)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">r = 0.9</text><g transform="translate(0,16)"><rect x="8" y="6" width="134" height="106" fill="none" stroke="currentColor" stroke-opacity=".25"/><path d="M71.1,56.5h0M95.2,29.4h0M59.6,72.1h0M82.1,52.5h0M80,57.2h0M93,34.9h0M75.5,58h0M84.7,69.9h0M65.2,69.3h0M80.9,53.8h0M91.9,39h0M94.6,50.6h0M92.9,43.6h0M61.8,74.1h0M102.4,29h0M92.1,36.1h0M79.6,60.8h0M86.6,46.2h0M56.7,75h0M44.1,67h0M85.2,59.9h0M104.7,46.4h0M92.4,50.9h0M101.1,34.2h0M138.1,19.5h0M26.2,89.4h0M61.4,66.2h0M34,87.2h0M79.4,65.2h0M80.2,60.6h0M93.8,49.7h0M77.6,59.5h0M62.7,79.1h0M69.4,48.8h0M68.2,55h0M43.8,73.3h0M65.9,77.1h0M82.7,55.9h0M110.8,34.3h0M110.3,44.1h0M70.7,62.8h0M94.6,51h0M88.7,51.3h0M84.1,52.2h0M82.5,50h0" class="sb" stroke-width="4.8" stroke-linecap="round" stroke-opacity=".75"/></g></g></svg><figcaption>r measures how tightly points hug a straight line: sign = direction, size = tightness.</figcaption></figure>
  <table class="tbl">
    <tr><th></th><th>Formula</th><th>In words</th><th>Range</th></tr>
    <tr><td><strong>Covariance</strong></td><td><code>Σ(x − x̄)(y − ȳ) / (n − 1)</code></td><td>Do x and y sit above/below their means together?</td><td>−∞ to ∞, carries units</td></tr>
    <tr><td><strong>Pearson r</strong></td><td><code>cov(x, y) / (sₓ · s_y)</code></td><td>Covariance with units removed: strength of a <em>straight-line</em> relation</td><td>−1 to 1</td></tr>
  </table>
  <table class="tbl out"><caption>Worked: hours studied vs exam score (x̄ = 3, ȳ = 60)</caption>
    <tr><th>x</th><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><th>sum</th></tr>
    <tr><th>y</th><td>52</td><td>55</td><td>61</td><td>64</td><td>68</td><td></td></tr>
    <tr><th>(x−3)(y−60)</th><td>16</td><td>5</td><td>0</td><td>4</td><td>16</td><td><strong>41</strong></td></tr>
  </table>
  <p>cov = 41 / 4 = 10.25. r = 10.25 / (√2.5 × √42.5) = 0.994.</p>
  <div class="fx" data-lang="py">import numpy as np
from scipy import stats
hours = np.array([1, 2, 3, 4, 5]); score = np.array([52, 55, 61, 64, 68])
print(np.cov(hours, score))
print("r =", round(np.corrcoef(hours, score)[0, 1], 4))</div>
  <div class="fx" data-lang="text">[[ 2.5  10.25]
 [10.25 42.5 ]]
r = 0.9944</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Covariance size means nothing alone: measure score out of 1000 instead of 100 and cov grows 10×, r stays 0.994. Compare correlations, not covariances.</p>
  </div>

  <h2 id="sco-ps"><span class="num">02</span>Pearson vs Spearman</h2>
  <figure class="viz"><svg viewBox="0 0 600 146" width="600"><g transform="translate(0,0)"><text x="100" y="12" text-anchor="middle" font-weight="bold" font-size="11">curve: P .80 · S 1.00</text><g transform="translate(0,16)"><rect x="8" y="6" width="184" height="116" fill="none" stroke="currentColor" stroke-opacity=".25"/><path d="M20.7,114h0M29,113.9h0M37.4,113.8h0M45.7,113.7h0M54.1,113.5h0M62.4,113.2h0M70.8,112.9h0M79.1,112.3h0M87.5,111.6h0M95.8,110.6h0M104.2,109.2h0M112.5,107.2h0M120.9,104.5h0M129.2,100.6h0M137.6,95.3h0M145.9,87.8h0M154.3,77.3h0M162.6,62.7h0M171,42.4h0M179.3,14h0" class="sb" stroke-width="6.4" stroke-linecap="round" stroke-opacity=".75"/></g></g><g transform="translate(200,0)"><text x="100" y="12" text-anchor="middle" font-weight="bold" font-size="11">noise: P .20 · S .21</text><g transform="translate(0,16)"><rect x="8" y="6" width="184" height="116" fill="none" stroke="currentColor" stroke-opacity=".25"/><path d="M113.5,50.1h0M88.4,66.9h0M92.2,44.5h0M20.7,52.9h0M170.2,65h0M147.1,63.2h0M95.3,73.9h0M134.1,49.5h0M116.7,96.5h0M87.3,79.8h0M141.3,64.2h0M95.8,27.5h0M95.2,87.9h0M78.9,95.3h0M122.8,83.2h0M103.3,47.1h0M126,75.4h0M85.4,38.7h0M111.3,114h0M75.3,43.3h0M136.5,45.5h0M113.4,103.3h0M118.4,66.3h0M121.3,41.3h0M71.1,67.8h0M134.4,46.4h0M179.3,14h0M49,63.5h0M45.8,76.5h0M53.7,88.1h0" class="sb" stroke-width="6.4" stroke-linecap="round" stroke-opacity=".75"/></g></g><g transform="translate(400,0)"><text x="100" y="12" text-anchor="middle" font-weight="bold" font-size="11">+1 outlier: P .86 · S .28</text><g transform="translate(0,16)"><rect x="8" y="6" width="184" height="116" fill="none" stroke="currentColor" stroke-opacity=".25"/><path d="M49.6,94.4h0M41.8,99.6h0M43,92.7h0M20.7,95.3h0M67.3,99h0M60.1,98.5h0M43.9,101.7h0M56,94.2h0M50.6,108.6h0M41.4,103.5h0M58.2,98.8h0M44.1,87.5h0M43.9,106h0M38.8,108.3h0M52.5,104.6h0M46.4,93.5h0M53.5,102.2h0M40.8,91h0M48.9,114h0M37.7,92.4h0M56.7,93h0M49.6,110.7h0M51.1,99.4h0M52,91.7h0M36.4,99.9h0M56.1,93.3h0M70.1,83.4h0M29.5,98.5h0M28.5,102.5h0M31,106.1h0M179.3,14h0" class="sb" stroke-width="4.8" stroke-linecap="round" stroke-opacity=".75"/></g></g></svg><figcaption>Left: perfectly monotonic, so Spearman (S) = 1 but Pearson (P) doesn't. Right: one point at (12, 12) fakes a strong Pearson r.</figcaption></figure>
  <div class="cards">
    <div><b>Pearson</b><p>Linear relationship on raw values.</p><small>Sensitive to outliers and curves</small></div>
    <div><b>Spearman</b><p>Pearson on the <em>ranks</em>: any monotonic (always up or always down) relation.</p><small>Robust to outliers, skew</small></div>
    <div><b>Kendall τ</b><p>Share of agreeing vs disagreeing pairs.</p><small>Small samples, many ties</small></div>
  </div>
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
  <p>The curve is perfectly monotonic, so Spearman = 1 while Pearson under-reports. One outlier lifts Pearson from 0.20 to 0.86; Spearman barely moves.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>r = 0 means no <em>linear</em> relation, not no relation. y = x² on symmetric x gives r ≈ 0 with perfect dependence.</p>
  </div>

  <h2 id="sco-cause"><span class="num">03</span>Correlation ≠ Causation</h2>
  <figure class="viz"><svg viewBox="0 0 520 140" width="520"><defs><marker id="ad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><rect x="190" y="8" width="140" height="28" rx="6" class="ft st" stroke="currentColor" stroke-opacity=".5"/><text x="260.0" y="26" text-anchor="middle">Temperature</text><rect x="20" y="100" width="140" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity=".5"/><text x="90.0" y="118" text-anchor="middle">Ice cream sales</text><rect x="360" y="100" width="140" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity=".5"/><text x="430.0" y="118" text-anchor="middle">Drownings</text><line x1="230" y1="36" x2="110" y2="98" stroke="currentColor" marker-end="url(#ad)"/><line x1="290" y1="36" x2="410" y2="98" stroke="currentColor" marker-end="url(#ad)"/><line x1="162" y1="114" x2="358" y2="114" class="sr" stroke-dasharray="5 4"/><text x="260" y="108" text-anchor="middle" class="tr" font-size="11">r = 0.67, no causal link</text></svg><figcaption>A confounder (temperature) causes both. Ban ice cream and drownings won't change.</figcaption></figure>
  <table class="tbl">
    <tr><th>Explanation</th><th>Example</th></tr>
    <tr><td><strong>Confounder</strong>: Z drives both</td><td>Hot weather → ice cream sales and drownings</td></tr>
    <tr><td><strong>Reverse causation</strong></td><td>"Users who contact support churn more": unhappy users contact support</td></tr>
    <tr><td><strong>Selection bias</strong></td><td>Only surveyed customers who stayed</td></tr>
    <tr><td><strong>Coincidence</strong></td><td>Test enough pairs and some correlate by chance</td></tr>
  </table>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
temp = rng.normal(25, 5, 365)                          # daily temperature
ice = 10 * temp + rng.normal(0, 20, 365)               # temp → ice cream
drown = 0.3 * temp + rng.normal(0, 1.5, 365)           # temp → drownings
print("corr(ice, drown):", round(np.corrcoef(ice, drown)[0, 1], 3))
# control for temp: correlate what's left after removing temp's effect
res = lambda v: v - np.polyval(np.polyfit(temp, v, 1), temp)
print("partial corr | temp:", round(np.corrcoef(res(ice), res(drown))[0, 1], 3))</div>
  <div class="fx" data-lang="text">corr(ice, drown): 0.668
partial corr | temp: -0.065</div>
  <p>Strong raw correlation, near zero once temperature is held fixed. To prove causation: a randomised experiment (A/B test), or causal methods (diff-in-diff, instrumental variables) when you can't randomise.</p>

  <h2 id="sco-simpson"><span class="num">04</span>Simpson's Paradox</h2>
  <p>A trend inside every group reverses when groups are combined. Real data: kidney-stone treatments (Charig et al., 1986).</p>
  <table class="tbl">
    <tr><th>Success rate</th><th>Treatment A (surgery)</th><th>Treatment B (less invasive)</th><th>Winner</th></tr>
    <tr><td>Small stones</td><td>81/87 = <strong>93%</strong></td><td>234/270 = 87%</td><td>A</td></tr>
    <tr><td>Large stones</td><td>192/263 = <strong>73%</strong></td><td>55/80 = 69%</td><td>A</td></tr>
    <tr><td>All patients</td><td>273/350 = 78%</td><td>289/350 = <strong>83%</strong></td><td>B ?!</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 560 170" width="560"><text x="60" y="32" text-anchor="end">small</text><rect x="70" y="10" width="391" height="17" class="fb sb"/><text x="466" y="23" font-size="11">A 93%</text><rect x="70" y="30" width="364" height="17" class="ft st"/><text x="439" y="43" font-size="11">B 87%</text><text x="60" y="84" text-anchor="end">large</text><rect x="70" y="62" width="307" height="17" class="fb sb"/><text x="382" y="75" font-size="11">A 73%</text><rect x="70" y="82" width="289" height="17" class="ft st"/><text x="364" y="95" font-size="11">B 69%</text><text x="60" y="136" text-anchor="end">all</text><rect x="70" y="114" width="328" height="17" class="fb sb"/><text x="403" y="127" font-size="11">A 78%</text><rect x="70" y="134" width="347" height="17" class="ft st"/><text x="422" y="147" font-size="11">B 83%</text><line x1="0" y1="113" x2="560" y2="113" stroke="currentColor" stroke-opacity=".3" stroke-dasharray="3 3"/></svg><figcaption>A wins in both groups (blue longer), but B wins on the pooled row because A got mostly large, hard cases.</figcaption></figure>
  <p>Why: doctors gave A mostly to hard (large-stone) cases. Stone size is a confounder that affects both treatment choice and success.</p>
  <div class="fx" data-lang="py">import pandas as pd
df = pd.DataFrame({"treat": ["A", "A", "B", "B"], "size": ["small", "large"] * 2,
                   "ok": [81, 192, 234, 55], "n": [87, 263, 270, 80]})
by = df.assign(rate=(df.ok / df.n).round(3)).pivot(index="size", columns="treat", values="rate")
print(by)
tot = df.groupby("treat")[["ok", "n"]].sum()
print((tot.ok / tot.n).round(3).to_dict())</div>
  <div class="fx" data-lang="text">treat      A      B
size               
large  0.730  0.688
small  0.931  0.867
{'A': 0.78, 'B': 0.826}</div>
  <div class="callout intu"><span class="label">DS version</span>
    <p>Overall conversion drops after a launch, but rises in every country, because the traffic mix shifted to low-converting countries. Always segment before concluding.</p>
  </div>

  <h2 id="sco-vif"><span class="num">05</span>Multicollinearity &amp; VIF</h2>
  <div class="flow"><span>Features highly correlated</span><span>Model can't tell who gets credit</span><span>Unstable, huge-SE coefficients</span></div>
  <p><strong>VIF</strong> (variance inflation factor) for feature j: regress j on all other features, then <code>VIF = 1 / (1 − R²)</code>. R² = 0.9 → VIF 10: its coefficient's variance is 10× inflated.</p>
  <div class="fx" data-lang="py">from statsmodels.stats.outliers_influence import variance_inflation_factor
from statsmodels.tools import add_constant
rng = np.random.default_rng(1)
sqft = rng.normal(1500, 400, 200)
rooms = sqft / 300 + rng.normal(0, 0.4, 200)    # nearly a copy of sqft
age = rng.normal(20, 8, 200)                    # unrelated
X = add_constant(pd.DataFrame({"sqft": sqft, "rooms": rooms, "age": age}))
for i, col in enumerate(X.columns[1:], start=1):
    print(f"{col:6s} VIF = {variance_inflation_factor(X.values, i):.1f}")</div>
  <div class="fx" data-lang="text">sqft   VIF = 13.8
rooms  VIF = 13.7
age    VIF = 1.1</div>
  <table class="tbl">
    <tr><th>VIF</th><th>Meaning</th><th>Action</th></tr>
    <tr><td>1</td><td>No collinearity</td><td>none</td></tr>
    <tr><td>5–10</td><td>Moderate to high</td><td>watch if you interpret coefficients</td></tr>
    <tr><td>&gt; 10</td><td>Severe</td><td>drop/merge features, PCA, or ridge regression</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Multicollinearity hurts <em>interpretation</em>, not prediction. A model predicting prices is fine; a model explaining "the effect of one extra room" is not. Tree models don't care.</p>
  </div>

  <h2 id="sco-anscombe"><span class="num">06</span>Anscombe's Quartet</h2>
  <figure class="viz"><svg viewBox="0 0 600 136" width="600"><g transform="translate(0,0)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">I linear</text><g transform="translate(0,16)"><rect x="8" y="6" width="134" height="106" fill="none" stroke="currentColor" stroke-opacity=".25"/><line x1="17.2" y1="91" x2="132.8" y2="13.3" class="sr" stroke-width="1.2" stroke-dasharray="4 3"/><path d="M64.8,58.6h0M51.2,68.6h0M85.2,62.8h0M58,51.6h0M71.6,56h0M92,41.1h0M37.6,65.9h0M24,93.2h0M78.4,33h0M44.4,88.1h0M30.8,80.2h0" class="sb" stroke-width="6.4" stroke-linecap="round" stroke-opacity=".75"/></g></g><g transform="translate(150,0)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">II curved</text><g transform="translate(0,16)"><rect x="8" y="6" width="134" height="106" fill="none" stroke="currentColor" stroke-opacity=".25"/><line x1="17.2" y1="91" x2="132.8" y2="13.3" class="sr" stroke-width="1.2" stroke-dasharray="4 3"/><path d="M64.8,48.6h0M51.2,57.7h0M85.2,52.2h0M58,52h0M71.6,47.5h0M92,58.1h0M37.6,76.1h0M24,103.8h0M78.4,48.7h0M44.4,65.8h0M30.8,88.8h0" class="sb" stroke-width="6.4" stroke-linecap="round" stroke-opacity=".75"/></g></g><g transform="translate(300,0)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">III outlier</text><g transform="translate(0,16)"><rect x="8" y="6" width="134" height="106" fill="none" stroke="currentColor" stroke-opacity=".25"/><line x1="17.2" y1="91" x2="132.8" y2="13.3" class="sr" stroke-width="1.2" stroke-dasharray="4 3"/><path d="M64.8,63.9h0M51.2,70.2h0M85.2,15.7h0M58,67.1h0M71.6,60.7h0M92,51.3h0M37.6,76.5h0M24,82.9h0M78.4,57.6h0M44.4,73.4h0M30.8,79.7h0" class="sb" stroke-width="6.4" stroke-linecap="round" stroke-opacity=".75"/></g></g><g transform="translate(450,0)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">IV leverage</text><g transform="translate(0,16)"><rect x="8" y="6" width="134" height="106" fill="none" stroke="currentColor" stroke-opacity=".25"/><line x1="17.2" y1="91" x2="132.8" y2="13.3" class="sr" stroke-width="1.2" stroke-dasharray="4 3"/><path d="M51.2,72h0M51.2,79.5h0M51.2,61.7h0M51.2,51.3h0M51.2,54.7h0M51.2,67.8h0M51.2,84.1h0M126,17.9h0M51.2,81.3h0M51.2,59.8h0M51.2,69.1h0" class="sb" stroke-width="6.4" stroke-linecap="round" stroke-opacity=".75"/></g></g></svg><figcaption>Same mean, variance, r = 0.816 and fitted line (red) in all four. Only the plot shows they're different.</figcaption></figure>
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
  <p>Identical summaries, wildly different data: linear, curved, one outlier, one leverage point. Summary stats compress; plots reveal.</p>

  <h2 id="sco-qa"><span class="num">07</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use Spearman over Pearson?</summary><div class="qa-body">When the relation is monotonic but not linear (e.g. diminishing returns), data is ordinal (ratings), or there are outliers/heavy skew. Spearman ranks first, so one extreme point can't dominate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Users who use feature X retain 30% better. Can we say X causes retention?</summary><div class="qa-body">No. Engaged users both find X and stay (confounder: engagement); or retained users simply had more time to find X (reverse/time bias). Run an experiment: randomly expose X, or use matching / diff-in-diff if you can't.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain Simpson's paradox with an example.</summary><div class="qa-body">Kidney stones: treatment A wins for small stones (93% vs 87%) and large stones (73% vs 69%), yet loses overall (78% vs 83%), because A got mostly the hard large-stone cases. The pooled number mixes treatment effect with case mix.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two features have correlation 0.98. What happens in linear regression? In a random forest?</summary><div class="qa-body">Linear regression: coefficients become unstable with big standard errors; signs can flip; predictions are fine. Random forest: predictions fine, but feature importance gets split between the two, so each looks less important.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is VIF and how is it computed?</summary><div class="qa-body">For each feature, regress it on all other features and get R². VIF = 1/(1 − R²): how much its coefficient's variance is inflated by collinearity. Above 5–10 is a warning sign.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Predict: r between x = [−2, −1, 0, 1, 2] and y = x².</summary><div class="qa-body">0. y = [4, 1, 0, 1, 4] is perfectly determined by x but symmetric, so the linear association cancels out. Spearman is also 0 here because it's not monotonic.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>r = 0.3 with n = 10,000 and p &lt; 0.001. Strong relationship?</summary><div class="qa-body">Significant, but weak: r² = 0.09, so x explains 9% of y's variance. p reflects sample size; r reflects strength.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the point of Anscombe's quartet?</summary><div class="qa-body">Four datasets share mean, variance, correlation (0.816) and regression line, yet one is linear, one curved, one has an outlier and one is driven by a single leverage point. Never trust summary statistics without a plot.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you find correlated features quickly in pandas?</summary><div class="qa-body"><code>df.corr(method="spearman")</code>, then list pairs with |r| &gt; 0.8 from the upper triangle (<code>np.triu</code> mask). Plot as a heatmap. Follow up with VIF for groups of features.</div></details>
</main>`
});
