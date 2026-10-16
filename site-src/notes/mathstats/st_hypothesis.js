// notes/mathstats/st_hypothesis.js — Hypothesis Testing
Object.assign(TOPIC_CONTENT, {
  "st_hypothesis": `<main>
  <h1>Hypothesis Testing</h1>
  <p class="lead">How to tell a real effect from luck. Every A/B test, model comparison and "did the change help?" question runs on this machinery. Interviewers probe the p-value definition and test choice hardest. Builds on Distributions and the CLT.</p>

  <h2 id="sht-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Hypothesis Testing</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Logic</div>
        <ul>
          <li>💡 <b>Courtroom</b> — H₀ innocent until data proves otherwise</li>
          <li><b>H₀</b> — no effect; <b>H₁</b> — effect exists (one- or two-sided, chosen up front)</li>
          <li><b>Flow</b> — hypotheses → α → statistic → p → decide</li>
          <li><b>Statistic</b> — <code>(estimate − H₀ value) / SE</code></li>
          <li>⚠ "fail to reject" ≠ "H₀ is true"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">p-value</div>
        <ul>
          <li><b>Definition</b> — P(result this extreme | H₀ true)</li>
          <li><b>Example</b> — 12 deliveries, mean 32.17 vs 30: t = 3.07, p = 0.011</li>
          <li><b>α</b> — false-positive rate you accept; usually 0.05</li>
          <li>⚠ not P(H₀ true); not 1 − p = P(effect real)</li>
          <li>⚠ small p ≠ big effect; p &gt; 0.05 ≠ no effect</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Confidence Interval</div>
        <ul>
          <li><b>Formula</b> — <code>estimate ± t* × SE</code>; delivery CI [30.6, 33.7]</li>
          <li><b>Meaning</b> — 95% of intervals built this way catch the truth</li>
          <li><b>Link</b> — 95% CI excludes H₀ value ⇔ p &lt; 0.05</li>
          <li><b>Width</b> — ∝ 1/√n: 4× data halves it</li>
          <li>⚠ not "95% chance μ is in this interval" (that's Bayesian)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Errors &amp; Power</div>
        <ul>
          <li><b>Type I</b> — false positive, rate α</li>
          <li><b>Type II</b> — false negative, rate β</li>
          <li><b>Power</b> — 1 − β; target 0.8</li>
          <li><b>Levers</b> — ↑n, ↑effect, ↑α, ↓noise (pairing, CUPED)</li>
          <li><b>Cohen's d</b> — diff / std; d = 0.5 needs 64 per group</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">t-tests</div>
        <ul>
          <li><b>One-sample</b> — group vs known number (<code>ttest_1samp</code>)</li>
          <li><b>Welch</b> — two independent groups; safe default (<code>equal_var=False</code>)</li>
          <li><b>Paired</b> — same units twice; test the differences (<code>ttest_rel</code>)</li>
          <li><b>Pairing wins</b> — same data: paired p = 0.0002, unpaired 0.37</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Chi-square &amp; ANOVA</div>
        <ul>
          <li><b>χ² independence</b> — <code>Σ(O − E)²/E</code> on a counts table</li>
          <li><b>Example</b> — mobile expected 42 buyers, saw 30: χ² 8.5, p 0.004</li>
          <li>⚠ expected counts &lt; 5 → Fisher's exact</li>
          <li><b>ANOVA</b> — F = between / within variance; 3+ means</li>
          <li>⚠ ANOVA says "some differ"; follow with Tukey HSD</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Non-parametric</div>
        <ul>
          <li><b>Rank-based</b> — robust to skew, outliers, ordinal data</li>
          <li><b>Pairs</b> — t → Mann-Whitney; paired t → Wilcoxon; ANOVA → Kruskal-Wallis</li>
          <li><b>Whale example</b> — Welch p 0.38, Mann-Whitney p 0.003</li>
          <li>⚠ Mann-Whitney tests "tends larger", not means</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Multiple Testing &amp; Choosing</div>
        <ul>
          <li><b>Problem</b> — 20 tests at 0.05 → 64% chance of a false positive</li>
          <li><b>Bonferroni</b> — p &lt; α/m; controls FWER; strict</li>
          <li><b>Benjamini-Hochberg</b> — controls FDR; more power for many metrics</li>
          <li><b>Proportions</b> → z-test; <b>categories</b> → χ²; <b>means</b> → t / ANOVA</li>
        </ul>
      </div>
    </div>
  </div>


  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sht-court"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Courtroom</span><span class="rm-sub">H₀, H₁ and the logic</span></div></div>
      <div class="rm-item rm-done" data-target="sht-p"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Test Statistic &amp; p-value</span><span class="rm-sub">And 4 classic misreadings</span></div></div>
      <div class="rm-item rm-done" data-target="sht-ci"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Confidence Intervals</span><span class="rm-sub">What 95% really means</span></div></div>
      <div class="rm-item rm-done" data-target="sht-err"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Errors &amp; Power</span><span class="rm-sub">Type I, Type II, β</span></div></div>
      <div class="rm-item rm-done" data-target="sht-t"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">t-tests</span><span class="rm-sub">One-sample, two-sample, paired</span></div></div>
      <div class="rm-item rm-done" data-target="sht-chi"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Chi-square &amp; ANOVA</span><span class="rm-sub">Categories and 3+ groups</span></div></div>
      <div class="rm-item rm-done" data-target="sht-np"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Non-parametric</span><span class="rm-sub">Mann-Whitney and friends</span></div></div>
      <div class="rm-item rm-done" data-target="sht-multi"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Multiple Testing</span><span class="rm-sub">Bonferroni and FDR</span></div></div>
      <div class="rm-item rm-done" data-target="sht-which"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Which Test When</span><span class="rm-sub">Decision table</span></div></div>
      <div class="rm-item rm-done" data-target="sht-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="sht-court"><span class="num">01</span>The Courtroom Analogy</h2>
  <table class="tbl">
    <tr><th>Courtroom</th><th>Hypothesis test</th></tr>
    <tr><td>Presumed innocent</td><td><strong>H₀</strong> (null): no effect, no difference</td></tr>
    <tr><td>Prosecutor's claim</td><td><strong>H₁</strong> (alternative): there is an effect</td></tr>
    <tr><td>Evidence</td><td>Test statistic computed from data</td></tr>
    <tr><td>"Beyond reasonable doubt"</td><td>p-value &lt; α (usually 0.05)</td></tr>
    <tr><td>Convict an innocent person</td><td><strong>Type I error</strong> (false positive), rate = α</td></tr>
    <tr><td>Free a guilty person</td><td><strong>Type II error</strong> (false negative), rate = β</td></tr>
    <tr><td>"Not guilty" ≠ "innocent"</td><td>"Fail to reject H₀" ≠ "H₀ is true"</td></tr>
  </table>
  <div class="flow"><span>State H₀ / H₁</span><span>Choose α</span><span>Compute statistic</span><span>Get p-value</span><span>p &lt; α → reject H₀</span></div>
  <p>Example: a courier claims mean delivery is 30 min. H₀: μ = 30. H₁: μ ≠ 30 (two-sided). We time 12 deliveries.</p>

  <h2 id="sht-p"><span class="num">02</span>Test Statistic &amp; p-value</h2>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Test statistic</strong>: how far the data is from H₀, in units of noise. <strong>p-value</strong>: if H₀ were true, the probability of a result at least this extreme.</p>
  </div>
  <div class="fx" data-lang="py">import numpy as np
from scipy import stats
times = np.array([31, 34, 29, 35, 33, 30, 36, 32, 28, 34, 33, 31])
mean, sd, n = times.mean(), times.std(ddof=1), len(times)
se = sd / np.sqrt(n)                          # standard error of the mean
print(f"mean={mean:.2f} sd={sd:.3f} se={se:.3f} t={(mean-30)/se:.3f}")
r = stats.ttest_1samp(times, popmean=30)
print(f"t={r.statistic:.3f}  p={r.pvalue:.4f}  df={r.df}")</div>
  <div class="fx" data-lang="text">mean=32.17 sd=2.443 se=0.705 t=3.072
t=3.072  p=0.0106  df=11</div>
  <p>By hand: t = (32.17 − 30) / 0.705 = 3.07. The sample mean sits 3 standard errors above the claim.</p>
  <figure class="viz"><svg viewBox="0 0 560 190" width="560"><line x1="30" y1="162" x2="548" y2="162" stroke="currentColor" stroke-opacity=".5"/><text x="112.2" y="177" text-anchor="middle" font-size="11">−3.07</text><text x="173.9" y="177" text-anchor="middle" font-size="11">−2</text><text x="289" y="177" text-anchor="middle" font-size="11">0</text><text x="404.1" y="177" text-anchor="middle" font-size="11">2</text><text x="465.8" y="177" text-anchor="middle" font-size="11">3.07</text><text x="548" y="157" text-anchor="end" font-size="11" class="tm">t</text><path d="M465.8,162 L465.8,158.7 L471.7,159.3 L477.6,159.7 L483.4,160.1 L489.3,160.4 L495.2,160.7 L501,160.9 L506.9,161.1 L512.8,161.3 L518.6,161.4 L524.5,161.5 L530.4,161.6 L536.3,161.6 L542.1,161.7 L548,161.7 L548,162 Z" class="fr" stroke="none"/><path d="M30,162 L30,161.7 L35.9,161.7 L41.7,161.6 L47.6,161.6 L53.5,161.5 L59.4,161.4 L65.2,161.3 L71.1,161.1 L77,160.9 L82.8,160.7 L88.7,160.4 L94.6,160.1 L100.4,159.7 L106.3,159.3 L112.2,158.7 L112.2,162 Z" class="fr" stroke="none"/><path d="M30,161.7 L38.8,161.7 L47.6,161.6 L56.3,161.4 L65.1,161.3 L73.9,161 L82.7,160.7 L91.5,160.3 L100.2,159.8 L109,159 L117.8,158.1 L126.6,156.9 L135.4,155.3 L144.1,153.2 L152.9,150.6 L161.7,147.2 L170.5,143 L179.3,137.8 L188,131.4 L196.8,123.8 L205.6,114.9 L214.4,104.8 L223.2,93.6 L231.9,81.7 L240.7,69.5 L249.5,57.6 L258.3,46.9 L267.1,37.9 L275.8,31.5 L284.6,28.2 L293.4,28.2 L302.2,31.5 L310.9,37.9 L319.7,46.9 L328.5,57.6 L337.3,69.5 L346.1,81.7 L354.8,93.6 L363.6,104.8 L372.4,114.9 L381.2,123.8 L390,131.4 L398.7,137.8 L407.5,143 L416.3,147.2 L425.1,150.6 L433.9,153.2 L442.6,155.3 L451.4,156.9 L460.2,158.1 L469,159 L477.8,159.8 L486.5,160.3 L495.3,160.7 L504.1,161 L512.9,161.3 L521.7,161.4 L530.4,161.6 L539.2,161.7 L548,161.7" fill="none" class="sb" stroke-width="2"/><line x1="465.8" y1="162" x2="465.8" y2="93.2" class="sr" stroke-dasharray="4 3"/><text x="465.8" y="90.2" text-anchor="middle" font-size="11">observed t</text><line x1="112.2" y1="162" x2="112.2" y2="93.2" class="sr" stroke-dasharray="4 3"/><text x="530.7" y="141.3" text-anchor="middle" font-size="10" class="tr">0.53%</text><text x="47.3" y="141.3" text-anchor="middle" font-size="10" class="tr">0.53%</text><text x="363.8" y="48.4" text-anchor="start" font-size="10" class="tm">← t values if H₀ is true</text></svg><figcaption>The curve is where t would fall if the claim (30 min) were true. Our t = 3.07 is far out; both red tails together = p = 0.0106.</figcaption></figure>
  <h3>The 4 misreadings (interview favourite)</h3>
  <table class="tbl">
    <tr><th>Wrong</th><th>Right</th></tr>
    <tr><td>"p = 0.01 means a 1% chance H₀ is true"</td><td>p assumes H₀ is true; it's P(data this extreme | H₀), not P(H₀ | data)</td></tr>
    <tr><td>"1 − p = 99% chance the effect is real"</td><td>Same confusion. Needs Bayes and a prior</td></tr>
    <tr><td>"Small p = big effect"</td><td>Huge n makes tiny effects significant. Report effect size + CI</td></tr>
    <tr><td>"p &gt; 0.05 proves no effect"</td><td>Maybe the test had low power. Absence of evidence ≠ evidence of absence</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Pick one- vs two-sided <em>before</em> looking at data. Switching to one-sided after seeing the direction halves p and is cheating.</p>
  </div>

  <h2 id="sht-ci"><span class="num">03</span>Confidence Intervals</h2>
  <p><code>CI = estimate ± critical value × SE</code>. For our deliveries: 32.17 ± 2.201 × 0.705.</p>
  <div class="fx" data-lang="py">tcrit = stats.t.ppf(0.975, df=n-1)
print("t critical:", round(tcrit, 3))
print("95% CI:", np.round([mean - tcrit*se, mean + tcrit*se], 2))
ci = r.confidence_interval()             # same thing, built in
print("built-in:", round(ci.low, 2), round(ci.high, 2))</div>
  <div class="fx" data-lang="text">t critical: 2.201
95% CI: [30.61 33.72]
built-in: 30.61 33.72</div>
  <p>30 is outside [30.6, 33.7], matching p &lt; 0.05. A 95% CI excludes the H₀ value exactly when the two-sided test rejects at α = 0.05.</p>
  <figure class="viz"><svg viewBox="0 0 560 240" width="560"><line x1="20" y1="214" x2="540" y2="214" stroke="currentColor" stroke-opacity=".5"/><text x="72" y="229" text-anchor="middle" font-size="11">26</text><text x="176" y="229" text-anchor="middle" font-size="11">28</text><text x="280" y="229" text-anchor="middle" font-size="11">30</text><text x="384" y="229" text-anchor="middle" font-size="11">32</text><text x="488" y="229" text-anchor="middle" font-size="11">34</text><text x="540" y="209" text-anchor="end" font-size="11" class="tm">minutes</text><line x1="174.4" y1="209.2" x2="380.9" y2="209.2" class="sb" stroke-width="1.4"/><line x1="147.6" y1="204.3" x2="373.5" y2="204.3" class="sb" stroke-width="1.4"/><line x1="136.1" y1="199.5" x2="371.1" y2="199.5" class="sb" stroke-width="1.4"/><line x1="179.1" y1="194.7" x2="316.1" y2="194.7" class="sb" stroke-width="1.4"/><line x1="198.8" y1="189.8" x2="388.8" y2="189.8" class="sb" stroke-width="1.4"/><line x1="224" y1="185" x2="417.6" y2="185" class="sb" stroke-width="1.4"/><line x1="129.8" y1="180.1" x2="401.6" y2="180.1" class="sb" stroke-width="1.4"/><line x1="125.8" y1="175.3" x2="303.8" y2="175.3" class="sb" stroke-width="1.4"/><line x1="287.7" y1="170.5" x2="390.9" y2="170.5" class="sr" stroke-width="2.2"/><line x1="182.9" y1="165.6" x2="368.4" y2="165.6" class="sb" stroke-width="1.4"/><line x1="329.5" y1="160.8" x2="508.3" y2="160.8" class="sr" stroke-width="2.2"/><line x1="151" y1="156" x2="386.8" y2="156" class="sb" stroke-width="1.4"/><line x1="218.8" y1="151.1" x2="335.8" y2="151.1" class="sb" stroke-width="1.4"/><line x1="144.7" y1="146.3" x2="370.4" y2="146.3" class="sb" stroke-width="1.4"/><line x1="261.1" y1="141.4" x2="444.1" y2="141.4" class="sb" stroke-width="1.4"/><line x1="156.1" y1="136.6" x2="384.8" y2="136.6" class="sb" stroke-width="1.4"/><line x1="187.1" y1="131.8" x2="387.2" y2="131.8" class="sb" stroke-width="1.4"/><line x1="145" y1="126.9" x2="391" y2="126.9" class="sb" stroke-width="1.4"/><line x1="233.7" y1="122.1" x2="422.5" y2="122.1" class="sb" stroke-width="1.4"/><line x1="157.4" y1="117.3" x2="351.8" y2="117.3" class="sb" stroke-width="1.4"/><line x1="303" y1="112.4" x2="403.2" y2="112.4" class="sr" stroke-width="2.2"/><line x1="277.4" y1="107.6" x2="440.8" y2="107.6" class="sb" stroke-width="1.4"/><line x1="180.9" y1="102.7" x2="405" y2="102.7" class="sb" stroke-width="1.4"/><line x1="220.7" y1="97.9" x2="415.9" y2="97.9" class="sb" stroke-width="1.4"/><line x1="210.7" y1="93.1" x2="471.6" y2="93.1" class="sb" stroke-width="1.4"/><line x1="173.7" y1="88.2" x2="335.7" y2="88.2" class="sb" stroke-width="1.4"/><line x1="152.3" y1="83.4" x2="344.8" y2="83.4" class="sb" stroke-width="1.4"/><line x1="201.6" y1="78.6" x2="347.2" y2="78.6" class="sb" stroke-width="1.4"/><line x1="253.5" y1="73.7" x2="405.8" y2="73.7" class="sb" stroke-width="1.4"/><line x1="198.9" y1="68.9" x2="404.5" y2="68.9" class="sb" stroke-width="1.4"/><line x1="105.3" y1="64" x2="369.4" y2="64" class="sb" stroke-width="1.4"/><line x1="101.1" y1="59.2" x2="297.6" y2="59.2" class="sb" stroke-width="1.4"/><line x1="57" y1="54.4" x2="311.9" y2="54.4" class="sb" stroke-width="1.4"/><line x1="129.8" y1="49.5" x2="349.3" y2="49.5" class="sb" stroke-width="1.4"/><line x1="212.7" y1="44.7" x2="399.6" y2="44.7" class="sb" stroke-width="1.4"/><line x1="145.6" y1="39.9" x2="326.7" y2="39.9" class="sb" stroke-width="1.4"/><line x1="153.7" y1="35" x2="357.7" y2="35" class="sb" stroke-width="1.4"/><line x1="72.5" y1="30.2" x2="221.2" y2="30.2" class="sr" stroke-width="2.2"/><line x1="192.6" y1="25.3" x2="402.3" y2="25.3" class="sb" stroke-width="1.4"/><line x1="276.3" y1="20.5" x2="443.3" y2="20.5" class="sb" stroke-width="1.4"/><line x1="280" y1="214" x2="280" y2="15.7" class="sg" stroke-width="1.5" stroke-dasharray="4 3"/><text x="280" y="12.8" text-anchor="middle" font-size="11" class="tg">true μ = 30</text></svg><figcaption>40 repeated studies, one 95% CI each. 36 contain the true mean; 4 (red) miss. 95% is a property of the method, not one interval.</figcaption></figure>
  <div class="callout def"><span class="label">Correct interpretation</span>
    <p>"If we repeated this study many times, 95% of the intervals built this way would contain the true mean." The method has 95% coverage.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"There's a 95% probability the true mean is in [30.6, 33.7]" is wrong in frequentist terms: the true mean is fixed; this interval either contains it or not. (A Bayesian credible interval does mean that.)</p>
  </div>

  <h2 id="sht-err"><span class="num">04</span>Type I / II Errors &amp; Power</h2>
  <figure class="viz"><svg viewBox="0 0 560 200" width="560"><line x1="30" y1="172" x2="548" y2="172" stroke="currentColor" stroke-opacity=".5"/><text x="220.8" y="187" text-anchor="middle" font-size="11">0</text><text x="310.5" y="187" text-anchor="middle" font-size="11">1.645</text><text x="357.2" y="187" text-anchor="middle" font-size="11">2.5</text><text x="548" y="167" text-anchor="end" font-size="11" class="tm">test statistic</text><path d="M30,172 L30,172 L39.7,172 L49.3,172 L59,172 L68.7,172 L78.4,172 L88,172 L97.7,172 L107.4,172 L117.1,172 L126.7,172 L136.4,172 L146.1,171.9 L155.8,171.8 L165.4,171.7 L175.1,171.5 L184.8,171.1 L194.5,170.4 L204.1,169.3 L213.8,167.6 L223.5,165.1 L233.1,161.5 L242.8,156.5 L252.5,149.8 L262.2,141.3 L271.8,130.8 L281.5,118.5 L291.2,104.6 L300.9,89.8 L310.5,74.8 L310.5,172 Z" class="fb" stroke="none"/><path d="M310.5,172 L310.5,74.8 L316.6,65.7 L322.7,57.3 L328.8,49.6 L334.9,43.1 L341,38 L347.1,34.3 L353.2,32.3 L359.2,32 L365.3,33.5 L371.4,36.6 L377.5,41.4 L383.6,47.5 L389.7,54.8 L395.8,63 L401.9,71.9 L408,81.2 L414,90.7 L420.1,100.1 L426.2,109.2 L432.3,117.8 L438.4,125.8 L444.5,133.2 L450.6,139.7 L456.7,145.5 L462.8,150.5 L468.8,154.8 L474.9,158.4 L481,161.4 L487.1,163.8 L493.2,165.8 L499.3,167.3 L505.4,168.5 L511.5,169.4 L517.6,170.1 L523.6,170.7 L529.7,171.1 L535.8,171.3 L541.9,171.5 L548,171.7 L548,172 Z" class="fg" stroke="none"/><path d="M310.5,172 L310.5,135.8 L318.7,144 L326.9,150.9 L335.1,156.4 L343.3,160.7 L351.5,164.1 L359.7,166.5 L367.9,168.3 L376,169.6 L384.2,170.4 L392.4,171 L400.6,171.4 L408.8,171.6 L417,171.8 L425.2,171.9 L433.4,171.9 L441.6,172 L449.7,172 L457.9,172 L466.1,172 L474.3,172 L482.5,172 L490.7,172 L498.9,172 L507.1,172 L515.2,172 L523.4,172 L531.6,172 L539.8,172 L548,172 L548,172 Z" class="fr" stroke="none"/><path d="M30,171.7 L38.8,171.5 L47.6,171.1 L56.3,170.5 L65.1,169.6 L73.9,168.3 L82.7,166.3 L91.5,163.6 L100.2,159.9 L109,154.9 L117.8,148.5 L126.6,140.6 L135.4,131 L144.1,119.9 L152.9,107.5 L161.7,94.2 L170.5,80.6 L179.3,67.3 L188,55.1 L196.8,44.9 L205.6,37.3 L214.4,32.9 L223.2,32.1 L231.9,34.8 L240.7,40.9 L249.5,50 L258.3,61.3 L267.1,74.2 L275.8,87.8 L284.6,101.3 L293.4,114.2 L302.2,125.9 L310.9,136.2 L319.7,145 L328.5,152.1 L337.3,157.7 L346.1,162 L354.8,165.2 L363.6,167.5 L372.4,169.1 L381.2,170.1 L390,170.9 L398.7,171.3 L407.5,171.6 L416.3,171.8 L425.1,171.9 L433.9,171.9 L442.6,172 L451.4,172 L460.2,172 L469,172 L477.8,172 L486.5,172 L495.3,172 L504.1,172 L512.9,172 L521.7,172 L530.4,172 L539.2,172 L548,172" fill="none" class="sb" stroke-width="2"/><path d="M30,172 L38.8,172 L47.6,172 L56.3,172 L65.1,172 L73.9,172 L82.7,172 L91.5,172 L100.2,172 L109,172 L117.8,172 L126.6,172 L135.4,172 L144.1,171.9 L152.9,171.9 L161.7,171.8 L170.5,171.6 L179.3,171.3 L188,170.9 L196.8,170.1 L205.6,169.1 L214.4,167.5 L223.2,165.2 L231.9,162 L240.7,157.7 L249.5,152.1 L258.3,145 L267.1,136.2 L275.8,125.9 L284.6,114.2 L293.4,101.3 L302.2,87.8 L310.9,74.2 L319.7,61.3 L328.5,50 L337.3,40.9 L346.1,34.8 L354.8,32.1 L363.6,32.9 L372.4,37.3 L381.2,44.9 L390,55.1 L398.7,67.3 L407.5,80.6 L416.3,94.2 L425.1,107.5 L433.9,119.9 L442.6,131 L451.4,140.6 L460.2,148.5 L469,154.9 L477.8,159.9 L486.5,163.6 L495.3,166.3 L504.1,168.3 L512.9,169.6 L521.7,170.5 L530.4,171.1 L539.2,171.5 L548,171.7" fill="none" class="sg" stroke-width="2"/><line x1="310.5" y1="172" x2="310.5" y2="21" class="sr" stroke-dasharray="4 3"/><text x="310.5" y="18" text-anchor="start" font-size="11">reject H₀ →</text><text x="35.5" y="45.6" text-anchor="start" font-size="11" class="tb">H₀: no effect</text><text x="438.9" y="45.6" text-anchor="middle" font-size="11" class="tg">H₁: real effect</text><text x="289" y="154.4" text-anchor="middle" font-size="13" font-weight="bold">β</text><text x="340.8" y="154.4" text-anchor="middle" font-size="13" class="tr" font-weight="bold">α</text><text x="389.9" y="119.3" text-anchor="middle" font-size="11" class="tg" font-weight="bold">power</text></svg><figcaption>Right of the line we reject. Red α = false alarms under H₀. Blue β = real effects we miss. Green = power (80% here).</figcaption></figure>
  <table class="tbl">
    <tr><th></th><th>H₀ true (no effect)</th><th>H₁ true (real effect)</th></tr>
    <tr><th>Reject H₀</th><td><strong>Type I</strong>, false positive, prob α</td><td>Correct, prob = <strong>power</strong> = 1 − β</td></tr>
    <tr><th>Don't reject</th><td>Correct, prob 1 − α</td><td><strong>Type II</strong>, false negative, prob β</td></tr>
  </table>
  <div class="cards">
    <div><b>↑ sample size</b><p>Narrower curves → more power.</p><small>The main lever</small></div>
    <div><b>↑ effect size</b><p>Curves further apart → more power.</p><small>Big changes are easy to detect</small></div>
    <div><b>↑ α</b><p>Line moves left → more power, more false alarms.</p><small>A trade-off, not a free lunch</small></div>
    <div><b>↓ noise (σ)</b><p>Narrower curves.</p><small>Paired designs, CUPED</small></div>
  </div>
  <div class="fx" data-lang="py">from statsmodels.stats.power import TTestIndPower
pa = TTestIndPower()
print("n per group for d=0.5, power 0.8:", round(pa.solve_power(effect_size=0.5, alpha=0.05, power=0.8), 1))
print("power with n=20 per group:", round(pa.power(effect_size=0.5, nobs1=20, alpha=0.05), 3))</div>
  <div class="fx" data-lang="text">n per group for d=0.5, power 0.8: 63.8
power with n=20 per group: 0.338</div>
  <p>d (Cohen's d) = difference in means ÷ std. 0.2 small, 0.5 medium, 0.8 large. Standard target: power 0.8, α 0.05.</p>

  <h2 id="sht-t"><span class="num">05</span>t-tests</h2>
  <div class="cards">
    <div><b>One-sample</b><p>One group vs a known number.</p><small>Mean delivery vs the claimed 30 min</small></div>
    <div><b>Two-sample (Welch)</b><p>Two independent groups.</p><small>Load time: users on CDN A vs CDN B</small></div>
    <div><b>Paired</b><p>Same units measured twice; test the differences.</p><small>Latency of 8 queries, before vs after a fix</small></div>
  </div>
  <div class="fx" data-lang="py">rng = np.random.default_rng(1)
cdn_a, cdn_b = rng.normal(2.4, 0.6, 40), rng.normal(2.1, 0.6, 40)
show = lambda name, r: print(f"{name:9s} t={r.statistic:6.3f}  p={r.pvalue:.4f}")
show("Welch", stats.ttest_ind(cdn_a, cdn_b, equal_var=False))

before = np.array([142, 128, 155, 120, 138, 149, 131, 160])   # ms, same 8 queries
after  = np.array([135, 124, 147, 118, 130, 144, 126, 151])
show("paired", stats.ttest_rel(before, after))
show("unpaired", stats.ttest_ind(before, after))</div>
  <div class="fx" data-lang="text">Welch     t= 3.419  p=0.0010
paired    t= 7.099  p=0.0002
unpaired  t= 0.930  p=0.3682</div>
  <div class="callout intu"><span class="label">Why paired wins here</span>
    <p>Queries differ a lot (120 to 160 ms), but each improved by ~6 ms. Pairing removes the between-query noise: p = 0.0002 vs 0.37 on the same numbers.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Default to Welch (<code>equal_var=False</code>): it's safe when variances differ and loses almost nothing when they don't. Student's t assumes equal variances.</p>
  </div>

  <h2 id="sht-chi"><span class="num">06</span>Chi-square Test &amp; ANOVA</h2>
  <h3>Chi-square test of independence</h3>
  <p>Are two categorical variables related? Compare observed counts with the counts expected if they were independent: <code>χ² = Σ (O − E)² / E</code>.</p>
  <div class="fx" data-lang="py">table = [[30, 570],    # mobile: buy, no buy
         [40, 360]]    # desktop
res = stats.chi2_contingency(table)
print("chi2 =", round(res.statistic, 3), " p =", round(res.pvalue, 4), " dof =", res.dof)
print("expected:", res.expected_freq.tolist())</div>
  <div class="fx" data-lang="text">chi2 = 8.465  p = 0.0036  dof = 1
expected: [[42.0, 558.0], [28.0, 372.0]]</div>
  <p>If device didn't matter, mobile would have 42 buyers (600 × 7%); it had 30. Unlikely by chance (p = 0.004). Needs expected counts ≥ 5 per cell; else use Fisher's exact test.</p>
  <h3>One-way ANOVA</h3>
  <p>Do 3+ group means differ? <code>F = variance between groups / variance within groups</code>. Big F → groups differ more than noise explains.</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(5)
email, push, sms = rng.normal(50, 8, 30), rng.normal(56, 8, 30), rng.normal(49, 8, 30)
r = stats.f_oneway(email, push, sms)
print(f"F={r.statistic:.3f}  p={r.pvalue:.4f}")</div>
  <div class="fx" data-lang="text">F=8.053  p=0.0006</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>ANOVA says "at least one mean differs", not which. Follow up with Tukey's HSD (<code>stats.tukey_hsd</code>). Running all pairwise t-tests instead inflates false positives.</p>
  </div>

  <h2 id="sht-np"><span class="num">07</span>Non-parametric Alternatives</h2>
  <p>Use when data is very skewed, ordinal (ratings) or tiny-n with outliers. They work on <strong>ranks</strong>, so one whale can't dominate.</p>
  <div class="fx" data-lang="py">a = np.array([12, 15, 14, 10, 13, 11, 16, 14, 12, 900])   # spend; one whale
b = np.array([18, 21, 17, 20, 19, 22, 18, 23, 20, 19])
print("Welch t     :", stats.ttest_ind(a, b, equal_var=False).pvalue.round(4))
print("Mann-Whitney:", stats.mannwhitneyu(a, b).pvalue.round(4))</div>
  <div class="fx" data-lang="text">Welch t     : 0.3794
Mann-Whitney: 0.0028</div>
  <p>B beats A for 9 of 10 users, but the whale inflates A's mean and variance so the t-test sees nothing. Mann-Whitney compares ranks and catches it.</p>
  <table class="tbl">
    <tr><th>Parametric</th><th>Non-parametric</th></tr>
    <tr><td>Two-sample t</td><td>Mann-Whitney U</td></tr>
    <tr><td>Paired t</td><td>Wilcoxon signed-rank</td></tr>
    <tr><td>One-way ANOVA</td><td>Kruskal-Wallis</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Mann-Whitney tests whether one group tends to have larger values, not whether means differ. If the business cares about mean revenue, use a t-test with a large n, or bootstrap.</p>
  </div>

  <h2 id="sht-multi"><span class="num">08</span>Multiple Testing</h2>
  <p>Test 20 true-null metrics at α = 0.05: P(at least one false positive) = 1 − 0.95²⁰ = <strong>64%</strong>.</p>
  <div class="fx" data-lang="py">from statsmodels.stats.multitest import multipletests
pvals = [0.001, 0.008, 0.012, 0.030, 0.041, 0.20, 0.35, 0.60]
for method in ["bonferroni", "fdr_bh"]:
    reject, p_adj, _, _ = multipletests(pvals, alpha=0.05, method=method)
    print(f"{method:10s}", reject.astype(int), np.round(p_adj, 3))</div>
  <div class="fx" data-lang="text">bonferroni [1 0 0 0 0 0 0 0] [0.008 0.064 0.096 0.24  0.328 1.    1.    1.   ]
fdr_bh     [1 1 1 0 0 0 0 0] [0.008 0.032 0.032 0.06  0.066 0.267 0.4   0.6  ]</div>
  <table class="tbl">
    <tr><th>Method</th><th>Rule</th><th>Controls</th><th>Use when</th></tr>
    <tr><td><strong>Bonferroni</strong></td><td>p &lt; α / m (here 0.05/8 = 0.00625)</td><td>FWER: any false positive</td><td>Few tests; a false positive is costly</td></tr>
    <tr><td><strong>Benjamini-Hochberg</strong></td><td>Sort p; reject p₍ᵢ₎ ≤ (i/m)·α</td><td>FDR: share of discoveries that are false</td><td>Many metrics, genes, segments</td></tr>
  </table>
  <p>Bonferroni keeps 1 discovery; BH keeps 3. BH trades a few false finds for much more power.</p>

  <h2 id="sht-which"><span class="num">09</span>Which Test When</h2>
  <table class="tbl">
    <tr><th>Question</th><th>Data</th><th>Test</th><th>scipy</th></tr>
    <tr><td>Mean vs a known value</td><td>numeric, one group</td><td>One-sample t</td><td><code>ttest_1samp</code></td></tr>
    <tr><td>Two group means</td><td>numeric, independent</td><td>Welch t (Mann-Whitney if skewed/ordinal)</td><td><code>ttest_ind(equal_var=False)</code></td></tr>
    <tr><td>Before vs after, same units</td><td>numeric, paired</td><td>Paired t (Wilcoxon)</td><td><code>ttest_rel</code></td></tr>
    <tr><td>3+ group means</td><td>numeric</td><td>ANOVA → Tukey (Kruskal-Wallis)</td><td><code>f_oneway</code></td></tr>
    <tr><td>Two proportions (conversion)</td><td>binary, large n</td><td>Two-proportion z-test</td><td><code>proportions_ztest</code> (statsmodels)</td></tr>
    <tr><td>Two categorical variables related?</td><td>counts table</td><td>Chi-square (Fisher if small)</td><td><code>chi2_contingency</code></td></tr>
    <tr><td>Is data normal?</td><td>numeric</td><td>Shapiro-Wilk + QQ-plot</td><td><code>shapiro</code></td></tr>
    <tr><td>Two numeric variables related?</td><td>numeric pairs</td><td>Pearson / Spearman</td><td><code>pearsonr</code>, <code>spearmanr</code></td></tr>
  </table>

  <h2 id="sht-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Explain a p-value to a product manager.</summary><div class="qa-body">"Assume the change did nothing. How often would random noise alone produce a lift this big? p = 0.03 means about 3% of the time. That's rare, so we doubt the 'did nothing' story." Avoid saying "97% chance it works".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>p = 0.04 with 10 million users and a lift of 0.01%. Ship it?</summary><div class="qa-body">Statistically significant, practically meaningless. Huge n detects tiny effects. Check the CI against the minimum effect worth the engineering and risk cost. Probably not.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your test gives p = 0.3. Can you conclude the feature has no effect?</summary><div class="qa-body">No. Maybe the effect is real but the test was underpowered. Look at the CI: if it's [−5%, +8%], you learned little. If it's [−0.1%, +0.1%] with good power, you can say any effect is negligible.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When do you use a paired test?</summary><div class="qa-body">When each observation in one group has a natural partner in the other: same user before/after, same query on two models, twins. Test the differences; it removes between-unit variance and boosts power.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Type I or Type II: which is worse?</summary><div class="qa-body">Depends on cost. Shipping a harmful feature (Type I) is usually worse in product tests, so α is kept low. In disease screening, missing a sick patient (Type II) is worse, so you favour sensitivity.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you test if conversion differs across 4 countries?</summary><div class="qa-body">Chi-square test of independence on a 4 × 2 table (country × converted). If significant, do pairwise two-proportion tests with a Bonferroni or BH correction to find which countries differ.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens to the CI width if you quadruple n?</summary><div class="qa-body">It halves. SE = σ/√n, and √4 = 2.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You test 50 product metrics and 3 are significant at 0.05. Excited?</summary><div class="qa-body">No: you'd expect 2.5 false positives by chance alone. Apply FDR correction, and pre-register one primary metric next time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why Welch instead of Student's t?</summary><div class="qa-body">Student's t assumes equal variances in both groups; if wrong (especially with unequal n), its false-positive rate drifts. Welch adjusts the degrees of freedom and is nearly as powerful when variances are equal. Safe default.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Revenue per user is very skewed. t-test or Mann-Whitney?</summary><div class="qa-body">If the question is "did mean revenue change?" and n is large (thousands), the t-test is valid by the CLT; consider capping outliers or bootstrapping the CI. Mann-Whitney answers a different question (do values tend to be larger), which may not match the business goal.</div></details>
</main>`
});
