// notes/mathstats/st_hypothesis.js — Hypothesis Testing
Object.assign(TOPIC_CONTENT, {
  "st_hypothesis": `<main>
  <h1>Hypothesis Testing</h1>
  <p class="lead">Every dataset is a little noisy. Hypothesis testing is the method for deciding whether a difference you see is real or just luck. Every A/B test, model comparison and "did the change help?" question runs on it, and interviewers probe the p-value definition and test choice hardest. This note works every formula by hand on tiny numbers first, then checks it in Python. Builds on <a class="xref" data-note="st_distributions">Distributions</a> and the CLT.</p>

  <h2 id="sht-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Hypothesis Testing</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Logic</div>
        <ul>
          <li>💡 <b>Courtroom</b> — H₀ innocent until data proves otherwise</li>
          <li><b>H₀</b> — no effect / nothing special; <b>H₁</b> — there is an effect</li>
          <li><b>Coin</b> — 9 heads in 10: two-sided p = 22/1024 = 0.021</li>
          <li><b>Flow</b> — hypotheses → α → statistic → p → decide</li>
          <li>⚠ "fail to reject" ≠ "H₀ is true"; pick one/two-sided before looking</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Statistic &amp; p-value</div>
        <ul>
          <li><b>Statistic</b> — <code>(estimate − H₀ value) / SE</code>; SE = s/√n</li>
          <li><b>By hand</b> — [31,33,32,35,34] vs 30: s 1.58, SE 0.707, t 4.24, p 0.013</li>
          <li><b>p in words</b> — if nothing were going on, how often would luck give a result this extreme?</li>
          <li><b>α</b> — false-alarm rate you accept; usually 0.05</li>
          <li>⚠ p is not P(H₀ true); small p ≠ big effect; p &gt; 0.05 ≠ no effect</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Confidence Interval</div>
        <ul>
          <li><b>Formula</b> — <code>estimate ± t* × SE</code></li>
          <li><b>By hand</b> — 33 ± 2.776 × 0.707 = [31.04, 34.96]</li>
          <li><b>Meaning</b> — the net-casting method catches the truth 95% of the time (958/1000 in a simulation)</li>
          <li><b>Link</b> — 95% CI excludes H₀ value ⇔ two-sided p &lt; 0.05</li>
          <li><b>Width</b> — ∝ 1/√n: 4× data halves it</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Errors &amp; Power</div>
        <ul>
          <li><b>Type I</b> — false alarm, rate α · <b>Type II</b> — miss, rate β</li>
          <li><b>Power</b> — 1 − β; target 0.8</li>
          <li><b>By hand</b> — effect 2.5 SE, cut-off 1.645 → power = P(Z &gt; −0.855) = 0.80</li>
          <li><b>Cohen's d</b> — diff / sd; d = 0.5 needs 64 per group (n = 20 → power 0.34)</li>
          <li><b>Levers</b> — ↑n, ↑effect, ↑α, ↓noise (pairing, CUPED)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">t-tests</div>
        <ul>
          <li><b>One-sample</b> — group vs a known number (<code>ttest_1samp</code>)</li>
          <li><b>Welch</b> — two independent groups; SE = √(s₁²/n₁ + s₂²/n₂); safe default</li>
          <li><b>Paired</b> — same units twice; one-sample t on the differences (<code>ttest_rel</code>)</li>
          <li><b>Pairing wins</b> — same 8 queries: paired p 0.0002, unpaired 0.37</li>
          <li>⚠ tiny n: means 7 vs 3, Welch p = 0.055</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Chi-square &amp; ANOVA</div>
        <ul>
          <li><b>χ²</b> — <code>Σ(O − E)²/E</code>, E = row total × col total / grand total</li>
          <li><b>By hand</b> — mobile buyers 30 vs expected 42: χ² 9.22 (8.47 with Yates)</li>
          <li>⚠ expected counts &lt; 5 → Fisher's exact</li>
          <li><b>ANOVA</b> — F = (SSB/(k−1)) / (SSW/(N−k)); toy F = 19</li>
          <li>⚠ ANOVA says "some differ"; Tukey HSD says which</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Non-parametric</div>
        <ul>
          <li><b>Rank-based</b> — robust to skew, outliers, ordinal data</li>
          <li><b>U</b> — number of (A, B) pairs where A wins</li>
          <li><b>Pairs</b> — t → Mann-Whitney; paired t → Wilcoxon; ANOVA → Kruskal-Wallis</li>
          <li><b>Whale</b> — Welch p 0.38, Mann-Whitney p 0.003</li>
          <li>⚠ Mann-Whitney tests "tends larger", not means</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Multiple Testing &amp; Choosing</div>
        <ul>
          <li><b>Problem</b> — 20 tests at 0.05 → 1 − 0.95²⁰ = 64% chance of a false alarm</li>
          <li><b>Bonferroni</b> — p &lt; α/m; strict (FWER)</li>
          <li><b>Benjamini-Hochberg</b> — p₍ᵢ₎ ≤ (i/m)α; controls FDR; more power</li>
          <li><b>Choose by data</b> — means → t / ANOVA; proportions → z; counts table → χ²</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sht-court"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Courtroom</span><span class="rm-sub">H₀, H₁ and a suspicious coin</span></div></div>
      <div class="rm-item rm-done" data-target="sht-p"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Test Statistic &amp; p-value</span><span class="rm-sub">A t-test by hand, then in scipy</span></div></div>
      <div class="rm-item rm-done" data-target="sht-ci"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Confidence Intervals</span><span class="rm-sub">What 95% really means</span></div></div>
      <div class="rm-item rm-done" data-target="sht-err"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Errors &amp; Power</span><span class="rm-sub">Type I, Type II, sample size</span></div></div>
      <div class="rm-item rm-done" data-target="sht-t"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">t-tests</span><span class="rm-sub">One-sample, Welch, paired</span></div></div>
      <div class="rm-item rm-done" data-target="sht-chi"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Chi-square &amp; ANOVA</span><span class="rm-sub">Counts tables and 3+ groups</span></div></div>
      <div class="rm-item rm-done" data-target="sht-np"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Non-parametric</span><span class="rm-sub">Ranks, Mann-Whitney</span></div></div>
      <div class="rm-item rm-done" data-target="sht-multi"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Multiple Testing</span><span class="rm-sub">Bonferroni and FDR</span></div></div>
      <div class="rm-item rm-done" data-target="sht-which"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Which Test When</span><span class="rm-sub">Decision table</span></div></div>
      <div class="rm-item rm-done" data-target="sht-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">p-hacking, misreadings, wrong test</span></div></div>
      <div class="rm-item rm-done" data-target="sht-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="sht-court"><span class="num">01</span>The Courtroom: H₀, H₁ and a Suspicious Coin</h2>
  <p>You change the checkout button and sales go up from 100 to 104 the next day. Did the button help? Maybe. But sales also jump around by 5 or 10 on normal days with no change at all. Without a method, people see a pattern in every wiggle and ship things that do nothing. Hypothesis testing is that method: it asks "could plain luck easily give a result like this?"</p>
  <p>The idea in plain words: start by assuming <strong>nothing special is happening</strong>. Work out what results luck alone would usually produce. If your actual result would be very rare under "nothing is happening", you stop believing that assumption.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An Indian courtroom. The accused is presumed innocent. The prosecutor must bring evidence so strong that "innocent" becomes hard to believe ("beyond reasonable doubt"). If the evidence is weak, the verdict is "not guilty", which is not the same as "proved innocent". It only means the evidence was not enough.</p>
  </div>
  <h3>A tiny worked example: is this coin fair?</h3>
  <p>At a chai stall, a friend tosses his coin 10 times to decide who pays. It lands heads 9 times. Is the coin rigged?</p>
  <ol>
    <li><strong>Assume nothing special</strong>: the coin is fair, P(heads) = 0.5.</li>
    <li><strong>List what luck can do</strong>: 10 tosses have 2¹⁰ = 1024 equally likely heads/tails sequences.</li>
    <li><strong>Count results at least as extreme as ours</strong>: 9 heads can happen in 10 ways (which toss was the tail), 10 heads in 1 way. That is 11. Extreme in the other direction (1 or 0 heads) is another 11. Total 22.</li>
    <li><strong>Share</strong>: 22 / 1024 = 0.021. A fair coin gives a result this lopsided only about 2 times in 100.</li>
    <li><strong>Decide</strong>: we agreed beforehand that "rarer than 5 in 100" is too rare to blame on luck. 0.021 &lt; 0.05, so we doubt the coin.</li>
  </ol>
  <figure class="viz"><svg viewBox="0 0 600 210" width="600"><line x1="60" y1="170" x2="560" y2="170" stroke="currentColor" stroke-opacity=".5"/><rect x="70" y="169.5" width="34" height="1.0" class="fr sr"/><text x="87.0" y="185" text-anchor="middle" font-size="11">0</text><text x="87.0" y="164.5" text-anchor="middle" font-size="10" class="tm">1</text><rect x="114" y="165.2" width="34" height="4.8" class="fr sr"/><text x="131.0" y="185" text-anchor="middle" font-size="11">1</text><text x="131.0" y="160.2" text-anchor="middle" font-size="10" class="tm">10</text><rect x="158" y="148.6" width="34" height="21.4" class="fb sb"/><text x="175.0" y="185" text-anchor="middle" font-size="11">2</text><text x="175.0" y="143.6" text-anchor="middle" font-size="10" class="tm">45</text><rect x="202" y="112.9" width="34" height="57.1" class="fb sb"/><text x="219.0" y="185" text-anchor="middle" font-size="11">3</text><text x="219.0" y="107.9" text-anchor="middle" font-size="10" class="tm">120</text><rect x="246" y="70.0" width="34" height="100.0" class="fb sb"/><text x="263.0" y="185" text-anchor="middle" font-size="11">4</text><text x="263.0" y="65.0" text-anchor="middle" font-size="10" class="tm">210</text><rect x="290" y="50.0" width="34" height="120.0" class="fb sb"/><text x="307.0" y="185" text-anchor="middle" font-size="11">5</text><text x="307.0" y="45.0" text-anchor="middle" font-size="10" class="tm">252</text><rect x="334" y="70.0" width="34" height="100.0" class="fb sb"/><text x="351.0" y="185" text-anchor="middle" font-size="11">6</text><text x="351.0" y="65.0" text-anchor="middle" font-size="10" class="tm">210</text><rect x="378" y="112.9" width="34" height="57.1" class="fb sb"/><text x="395.0" y="185" text-anchor="middle" font-size="11">7</text><text x="395.0" y="107.9" text-anchor="middle" font-size="10" class="tm">120</text><rect x="422" y="148.6" width="34" height="21.4" class="fb sb"/><text x="439.0" y="185" text-anchor="middle" font-size="11">8</text><text x="439.0" y="143.6" text-anchor="middle" font-size="10" class="tm">45</text><rect x="466" y="165.2" width="34" height="4.8" class="fr sr"/><text x="483.0" y="185" text-anchor="middle" font-size="11">9</text><text x="483.0" y="160.2" text-anchor="middle" font-size="10" class="tm">10</text><rect x="510" y="169.5" width="34" height="1.0" class="fr sr"/><text x="527.0" y="185" text-anchor="middle" font-size="11">10</text><text x="527.0" y="164.5" text-anchor="middle" font-size="10" class="tm">1</text><text x="310" y="202" text-anchor="middle" font-size="11" class="tm">number of heads in 10 flips (counts out of 1024 possible sequences)</text><text x="70" y="22" font-size="11" class="tr">red = as extreme as 9 heads, either way: 1+10+10+1 = 22 of 1024 = 0.021</text></svg><figcaption>If the coin is fair, this is how often each head count turns up. 9 or more heads (or 1 or fewer) happens in only 22 of the 1024 equally likely sequences. That share is the p-value.</figcaption></figure>
  <p>That 0.021 is the <strong>p-value</strong>. Now let scipy check the counting. <code>binomtest</code> does exactly the steps above for any count of successes.</p>
  <div class="fx" data-lang="py">from scipy import stats
from math import comb
p_one = sum(comb(10, k) for k in (9, 10)) / 2**10      # 9 or 10 heads
print("P(&gt;=9 heads) =", p_one, "  two-sided =", 2 * p_one)
r = stats.binomtest(9, n=10, p=0.5)                     # two-sided by default
print(f"binomtest p = {r.pvalue:.4f}")
print(f"one-sided p = {stats.binomtest(9, n=10, p=0.5, alternative='greater').pvalue:.4f}")</div>
  <div class="fx" data-lang="text">P(&gt;=9 heads) = 0.0107421875   two-sided = 0.021484375
binomtest p = 0.0215
one-sided p = 0.0107</div>
  <p><code>comb(10, k)</code> counts the sequences with k heads, so the first line is our hand count, 11/1024. Doubling it covers the "too many tails" side: that is a <strong>two-sided</strong> test. <code>binomtest</code> agrees: 0.0215. The <code>alternative='greater'</code> line asks only "too many heads?" and gives half, 0.0107.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>H₀ (null hypothesis)</strong>: the boring explanation, "no effect, no difference" (the coin is fair). <strong>H₁ (alternative)</strong>: what you suspect (the coin is biased). <strong>Two-sided</strong> H₁: different in either direction. <strong>One-sided</strong>: only one direction counts. <strong>α (significance level)</strong>: the rarity cut-off you choose in advance, usually 0.05.</p>
  </div>
  <table class="tbl">
    <tr><th>Courtroom</th><th>Hypothesis test</th></tr>
    <tr><td>Presumed innocent</td><td><strong>H₀</strong>: no effect</td></tr>
    <tr><td>Prosecutor's claim</td><td><strong>H₁</strong>: there is an effect</td></tr>
    <tr><td>Evidence</td><td>Test statistic computed from data</td></tr>
    <tr><td>"Beyond reasonable doubt"</td><td>p-value &lt; α</td></tr>
    <tr><td>Convict an innocent person</td><td><strong>Type I error</strong> (false positive), rate = α</td></tr>
    <tr><td>Free a guilty person</td><td><strong>Type II error</strong> (false negative), rate = β</td></tr>
    <tr><td>"Not guilty" ≠ "innocent"</td><td>"Fail to reject H₀" ≠ "H₀ is true"</td></tr>
  </table>
  <div class="flow"><span>State H₀ / H₁</span><span>Choose α (before data)</span><span>Compute statistic</span><span>Get p-value</span><span>p &lt; α → reject H₀</span></div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Choose one- or two-sided and α <em>before</em> looking at the data. Seeing 9 heads and then saying "I only cared about too many heads" halves p after the fact. That is quiet cheating, and interviewers know it.</p>
  </div>
  <p>Where you meet it: A/B tests on websites and apps, "is model B really better than model A on the test set?", drug trials, quality checks on a factory line, and almost every statistics interview.</p>

  <h2 id="sht-p"><span class="num">02</span>Test Statistic &amp; p-value</h2>
  <p>Coins are easy because we can count every outcome. Most data is numbers like minutes, rupees or milliseconds, and we cannot list every outcome. So we squeeze the data into one number, the <strong>test statistic</strong>, whose behaviour under H₀ is already known from a table or formula.</p>
  <p>The idea: measure the gap between what you saw and what H₀ claims, then divide by how big gaps usually are by luck. "3 minutes slower" means nothing alone. "3 minutes slower when luck usually moves the average by only 0.7" means a lot.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Your Ola driver says "10 minutes away". He arrives in 13. Is he lying? If his estimates are usually off by 5 minutes, a 3-minute miss is normal. If they are usually off by 30 seconds, a 3-minute miss is suspicious. The gap only means something compared with the usual wobble.</p>
  </div>
  <h3>A one-sample t-test by hand</h3>
  <p>A courier claims its mean delivery time is 30 minutes. You time 5 deliveries: 31, 33, 32, 35, 34. H₀: μ = 30 (μ, "mu", is the true long-run mean). H₁: μ ≠ 30.</p>
  <table class="tbl out"><caption>Step by step</caption>
    <tr><th>Step</th><th>Work</th><th>Result</th></tr>
    <tr><td>1. Sample mean x̄</td><td>(31+33+32+35+34) / 5</td><td>33</td></tr>
    <tr><td>2. Deviations x − x̄</td><td>−2, 0, −1, 2, 1</td><td></td></tr>
    <tr><td>3. Squared deviations</td><td>4, 0, 1, 4, 1</td><td>sum = 10</td></tr>
    <tr><td>4. Sample variance s²</td><td>10 / (n − 1) = 10 / 4</td><td>2.5</td></tr>
    <tr><td>5. Standard deviation s</td><td>√2.5</td><td>1.581</td></tr>
    <tr><td>6. Standard error SE</td><td>s / √n = 1.581 / √5</td><td>0.707</td></tr>
    <tr><td>7. t statistic</td><td>(x̄ − 30) / SE = 3 / 0.707</td><td><strong>4.24</strong></td></tr>
    <tr><td>8. Degrees of freedom</td><td>n − 1</td><td>4</td></tr>
    <tr><td>9. p-value</td><td>area beyond ±4.24 under a t curve with 4 df</td><td><strong>0.013</strong></td></tr>
  </table>
  <p>The <strong>standard error</strong> (step 6) is the typical wobble of a sample <em>mean</em>, not of one delivery. Averages wobble less than single values, by a factor √n. Step 9 is the only step you cannot do with a pen: you read it from a t-table or let scipy do it. The code below repeats each step, then calls the built-in test to confirm.</p>
  <div class="fx" data-lang="py">import numpy as np
from scipy import stats
small = np.array([31, 33, 32, 35, 34])          # 5 deliveries, minutes
n = len(small)
mean = small.mean()
dev = small - mean
print("deviations:", dev, " squared:", dev**2, " sum:", (dev**2).sum())
sd = small.std(ddof=1)                          # divide by n-1
se = sd / np.sqrt(n)
t = (mean - 30) / se
p = 2 * stats.t.sf(abs(t), df=n-1)              # area in both tails
print(f"mean={mean} sd={sd:.3f} se={se:.3f} t={t:.3f} p={p:.4f}")
print(stats.ttest_1samp(small, popmean=30))</div>
  <div class="fx" data-lang="text">deviations: [-2.  0. -1.  2.  1.]  squared: [4. 0. 1. 4. 1.]  sum: 10.0
mean=33.0 sd=1.581 se=0.707 t=4.243 p=0.0132
TtestResult(statistic=np.float64(4.242640687119285), pvalue=np.float64(0.01323559956368269), df=np.int64(4))</div>
  <p>Point at three lines. <code>std(ddof=1)</code> divides by n − 1, matching step 4 (NumPy's default <code>ddof=0</code> divides by n and gives a slightly smaller number, a classic bug). <code>stats.t.sf(abs(t), df)</code> is the "survival function": the area to the right of t. Times 2 gives both tails. <code>ttest_1samp</code> gives the same t = 4.243 and p = 0.0132 in one call.</p>
  <h3>The same test on 12 deliveries</h3>
  <div class="fx" data-lang="py">times = np.array([31, 34, 29, 35, 33, 30, 36, 32, 28, 34, 33, 31])
mean, sd, n = times.mean(), times.std(ddof=1), len(times)
se = sd / np.sqrt(n)                          # standard error of the mean
print(f"mean={mean:.2f} sd={sd:.3f} se={se:.3f} t={(mean-30)/se:.3f}")
r = stats.ttest_1samp(times, popmean=30)
print(f"t={r.statistic:.3f}  p={r.pvalue:.4f}  df={r.df}")</div>
  <div class="fx" data-lang="text">mean=32.17 sd=2.443 se=0.705 t=3.072
t=3.072  p=0.0106  df=11</div>
  <p>The mean sits 3.07 standard errors above the claim. The picture shows what that means: the curve is where t would land if the courier were honest, and the red tails are the p-value.</p>
  <figure class="viz"><svg viewBox="0 0 560 190" width="560"><line x1="30" y1="162" x2="548" y2="162" stroke="currentColor" stroke-opacity=".5"/><text x="112.2" y="177" text-anchor="middle" font-size="11">−3.07</text><text x="173.9" y="177" text-anchor="middle" font-size="11">−2</text><text x="289" y="177" text-anchor="middle" font-size="11">0</text><text x="404.1" y="177" text-anchor="middle" font-size="11">2</text><text x="465.8" y="177" text-anchor="middle" font-size="11">3.07</text><text x="548" y="157" text-anchor="end" font-size="11" class="tm">t</text><path d="M465.8,162 L465.8,158.7 L471.7,159.3 L477.6,159.7 L483.4,160.1 L489.3,160.4 L495.2,160.7 L501,160.9 L506.9,161.1 L512.8,161.3 L518.6,161.4 L524.5,161.5 L530.4,161.6 L536.3,161.6 L542.1,161.7 L548,161.7 L548,162 Z" class="fr" stroke="none"/><path d="M30,162 L30,161.7 L35.9,161.7 L41.7,161.6 L47.6,161.6 L53.5,161.5 L59.4,161.4 L65.2,161.3 L71.1,161.1 L77,160.9 L82.8,160.7 L88.7,160.4 L94.6,160.1 L100.4,159.7 L106.3,159.3 L112.2,158.7 L112.2,162 Z" class="fr" stroke="none"/><path d="M30,161.7 L38.8,161.7 L47.6,161.6 L56.3,161.4 L65.1,161.3 L73.9,161 L82.7,160.7 L91.5,160.3 L100.2,159.8 L109,159 L117.8,158.1 L126.6,156.9 L135.4,155.3 L144.1,153.2 L152.9,150.6 L161.7,147.2 L170.5,143 L179.3,137.8 L188,131.4 L196.8,123.8 L205.6,114.9 L214.4,104.8 L223.2,93.6 L231.9,81.7 L240.7,69.5 L249.5,57.6 L258.3,46.9 L267.1,37.9 L275.8,31.5 L284.6,28.2 L293.4,28.2 L302.2,31.5 L310.9,37.9 L319.7,46.9 L328.5,57.6 L337.3,69.5 L346.1,81.7 L354.8,93.6 L363.6,104.8 L372.4,114.9 L381.2,123.8 L390,131.4 L398.7,137.8 L407.5,143 L416.3,147.2 L425.1,150.6 L433.9,153.2 L442.6,155.3 L451.4,156.9 L460.2,158.1 L469,159 L477.8,159.8 L486.5,160.3 L495.3,160.7 L504.1,161 L512.9,161.3 L521.7,161.4 L530.4,161.6 L539.2,161.7 L548,161.7" fill="none" class="sb" stroke-width="2"/><line x1="465.8" y1="162" x2="465.8" y2="93.2" class="sr" stroke-dasharray="4 3"/><text x="465.8" y="90.2" text-anchor="middle" font-size="11">observed t</text><line x1="112.2" y1="162" x2="112.2" y2="93.2" class="sr" stroke-dasharray="4 3"/><text x="530.7" y="141.3" text-anchor="middle" font-size="10" class="tr">0.53%</text><text x="47.3" y="141.3" text-anchor="middle" font-size="10" class="tr">0.53%</text><text x="363.8" y="48.4" text-anchor="start" font-size="10" class="tm">← t values if H₀ is true</text></svg><figcaption>The curve is where t would fall if the claim (30 min) were true. Our t = 3.07 is far out; both red tails together = p = 0.0106.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Test statistic</strong>: (estimate − H₀ value) / SE, the distance from H₀ in units of noise. <strong>p-value</strong>: assuming H₀ is true, the probability of getting a statistic at least as extreme as the one observed. In plain words: <em>if nothing were going on, how often would luck alone give a result this surprising?</em></p>
  </div>
  <h3>The 4 misreadings (interview favourite)</h3>
  <table class="tbl">
    <tr><th>Wrong</th><th>Right</th></tr>
    <tr><td>"p = 0.01 means a 1% chance H₀ is true"</td><td>p is computed assuming H₀ is true. It is P(data this extreme | H₀), not P(H₀ | data)</td></tr>
    <tr><td>"1 − p = 99% chance the effect is real"</td><td>Same confusion. That needs Bayes' rule and a prior belief</td></tr>
    <tr><td>"Small p = big effect"</td><td>Huge n makes tiny effects significant. Report the effect size and CI</td></tr>
    <tr><td>"p &gt; 0.05 proves no effect"</td><td>Maybe the test was too small (low power). Absence of evidence ≠ evidence of absence</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The vertical bar "|" means "given". P(data | H₀) and P(H₀ | data) are different, just as P(wet road | rain) ≈ 1 but P(rain | wet road) is much lower (a tanker may have passed).</p>
  </div>

  <h2 id="sht-ci"><span class="num">03</span>Confidence Intervals</h2>
  <p>A p-value answers a yes/no question: "is it different from 30?". A manager usually wants more: "so what <em>is</em> the delivery time, roughly?". Saying "33 minutes" sounds too exact; another 5 deliveries would give another mean. We need a range that honestly shows how unsure we are.</p>
  <p>The idea: take the estimate, then step out on both sides by "a few standard errors". How many is "a few" comes from the t table, chosen so the method works 95% of the time.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A fisherman throws a net at a fish he cannot see clearly. The fish (true mean) stays still; the net (interval) lands somewhere new each throw. A "95% net" is one that is wide enough to catch the fish on 95 of every 100 throws. After any one throw, the fish is either inside or not; the 95% describes the throwing method.</p>
  </div>
  <h3>By hand, on the 5 deliveries</h3>
  <ol>
    <li>Estimate x̄ = 33, SE = 0.707 (from section 02).</li>
    <li>Critical value t* for 95% with 4 df: the point that leaves 2.5% in each tail = <strong>2.776</strong> (t table).</li>
    <li>Margin of error = t* × SE = 2.776 × 0.707 = 1.963.</li>
    <li>CI = 33 ± 1.963 = <strong>[31.04, 34.96]</strong>.</li>
    <li>30 is outside the interval, which agrees with p = 0.013 &lt; 0.05.</li>
  </ol>
  <p>Next the 12-delivery version, then a simulation that checks the "95 of every 100 throws" promise directly. It invents 1,000 studies where we <em>know</em> the true mean is 30 and counts how many intervals catch it.</p>
  <div class="fx" data-lang="py">tcrit = stats.t.ppf(0.975, df=n-1)        # n = 12 from the times above
print("t critical:", round(tcrit, 3))
print("95% CI:", np.round([mean - tcrit*se, mean + tcrit*se], 2))
ci = r.confidence_interval()             # same thing, built in
print("built-in:", round(ci.low, 2), round(ci.high, 2))

rng = np.random.default_rng(42)
true_mu, hits = 30, 0
for _ in range(1000):                        # 1000 imaginary studies
    sample = rng.normal(true_mu, 2.5, 12)    # 12 deliveries each
    ci = stats.ttest_1samp(sample, popmean=true_mu).confidence_interval()
    hits += ci.low &lt;= true_mu &lt;= ci.high
print("intervals that caught the true mean:", hits, "of 1000")</div>
  <div class="fx" data-lang="text">t critical: 2.201
95% CI: [30.61 33.72]
built-in: 30.61 33.72
intervals that caught the true mean: 958 of 1000</div>
  <p><code>stats.t.ppf(0.975, df)</code> is the reverse of a tail area: "which t leaves 97.5% below it?". With 11 df it is 2.201 (with 4 df it was 2.776; fewer data points means fatter tails and wider nets). <code>confidence_interval()</code> on the test result builds the same interval. In the loop, 958 of 1,000 intervals caught 30: about 95%, with a little simulation noise. The picture shows 40 such intervals.</p>
  <figure class="viz"><svg viewBox="0 0 560 240" width="560"><line x1="20" y1="214" x2="540" y2="214" stroke="currentColor" stroke-opacity=".5"/><text x="72" y="229" text-anchor="middle" font-size="11">26</text><text x="176" y="229" text-anchor="middle" font-size="11">28</text><text x="280" y="229" text-anchor="middle" font-size="11">30</text><text x="384" y="229" text-anchor="middle" font-size="11">32</text><text x="488" y="229" text-anchor="middle" font-size="11">34</text><text x="540" y="209" text-anchor="end" font-size="11" class="tm">minutes</text><line x1="174.4" y1="209.2" x2="380.9" y2="209.2" class="sb" stroke-width="1.4"/><line x1="147.6" y1="204.3" x2="373.5" y2="204.3" class="sb" stroke-width="1.4"/><line x1="136.1" y1="199.5" x2="371.1" y2="199.5" class="sb" stroke-width="1.4"/><line x1="179.1" y1="194.7" x2="316.1" y2="194.7" class="sb" stroke-width="1.4"/><line x1="198.8" y1="189.8" x2="388.8" y2="189.8" class="sb" stroke-width="1.4"/><line x1="224" y1="185" x2="417.6" y2="185" class="sb" stroke-width="1.4"/><line x1="129.8" y1="180.1" x2="401.6" y2="180.1" class="sb" stroke-width="1.4"/><line x1="125.8" y1="175.3" x2="303.8" y2="175.3" class="sb" stroke-width="1.4"/><line x1="287.7" y1="170.5" x2="390.9" y2="170.5" class="sr" stroke-width="2.2"/><line x1="182.9" y1="165.6" x2="368.4" y2="165.6" class="sb" stroke-width="1.4"/><line x1="329.5" y1="160.8" x2="508.3" y2="160.8" class="sr" stroke-width="2.2"/><line x1="151" y1="156" x2="386.8" y2="156" class="sb" stroke-width="1.4"/><line x1="218.8" y1="151.1" x2="335.8" y2="151.1" class="sb" stroke-width="1.4"/><line x1="144.7" y1="146.3" x2="370.4" y2="146.3" class="sb" stroke-width="1.4"/><line x1="261.1" y1="141.4" x2="444.1" y2="141.4" class="sb" stroke-width="1.4"/><line x1="156.1" y1="136.6" x2="384.8" y2="136.6" class="sb" stroke-width="1.4"/><line x1="187.1" y1="131.8" x2="387.2" y2="131.8" class="sb" stroke-width="1.4"/><line x1="145" y1="126.9" x2="391" y2="126.9" class="sb" stroke-width="1.4"/><line x1="233.7" y1="122.1" x2="422.5" y2="122.1" class="sb" stroke-width="1.4"/><line x1="157.4" y1="117.3" x2="351.8" y2="117.3" class="sb" stroke-width="1.4"/><line x1="303" y1="112.4" x2="403.2" y2="112.4" class="sr" stroke-width="2.2"/><line x1="277.4" y1="107.6" x2="440.8" y2="107.6" class="sb" stroke-width="1.4"/><line x1="180.9" y1="102.7" x2="405" y2="102.7" class="sb" stroke-width="1.4"/><line x1="220.7" y1="97.9" x2="415.9" y2="97.9" class="sb" stroke-width="1.4"/><line x1="210.7" y1="93.1" x2="471.6" y2="93.1" class="sb" stroke-width="1.4"/><line x1="173.7" y1="88.2" x2="335.7" y2="88.2" class="sb" stroke-width="1.4"/><line x1="152.3" y1="83.4" x2="344.8" y2="83.4" class="sb" stroke-width="1.4"/><line x1="201.6" y1="78.6" x2="347.2" y2="78.6" class="sb" stroke-width="1.4"/><line x1="253.5" y1="73.7" x2="405.8" y2="73.7" class="sb" stroke-width="1.4"/><line x1="198.9" y1="68.9" x2="404.5" y2="68.9" class="sb" stroke-width="1.4"/><line x1="105.3" y1="64" x2="369.4" y2="64" class="sb" stroke-width="1.4"/><line x1="101.1" y1="59.2" x2="297.6" y2="59.2" class="sb" stroke-width="1.4"/><line x1="57" y1="54.4" x2="311.9" y2="54.4" class="sb" stroke-width="1.4"/><line x1="129.8" y1="49.5" x2="349.3" y2="49.5" class="sb" stroke-width="1.4"/><line x1="212.7" y1="44.7" x2="399.6" y2="44.7" class="sb" stroke-width="1.4"/><line x1="145.6" y1="39.9" x2="326.7" y2="39.9" class="sb" stroke-width="1.4"/><line x1="153.7" y1="35" x2="357.7" y2="35" class="sb" stroke-width="1.4"/><line x1="72.5" y1="30.2" x2="221.2" y2="30.2" class="sr" stroke-width="2.2"/><line x1="192.6" y1="25.3" x2="402.3" y2="25.3" class="sb" stroke-width="1.4"/><line x1="276.3" y1="20.5" x2="443.3" y2="20.5" class="sb" stroke-width="1.4"/><line x1="280" y1="214" x2="280" y2="15.7" class="sg" stroke-width="1.5" stroke-dasharray="4 3"/><text x="280" y="12.8" text-anchor="middle" font-size="11" class="tg">true μ = 30</text></svg><figcaption>40 repeated studies, one 95% CI each. 36 contain the true mean; 4 (red) miss. 95% is a property of the method, not one interval.</figcaption></figure>
  <div class="callout def"><span class="label">Correct interpretation</span>
    <p><strong>95% confidence interval</strong>: a range built by a method that, over many repeated studies, contains the true value 95% of the time. Formula: <code>estimate ± critical value × SE</code>. Width shrinks like 1/√n: four times the data, half the width.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"There's a 95% probability the true mean is in [30.6, 33.7]" is wrong in the usual (frequentist) view: the true mean is a fixed number, and this one interval either contains it or not. A Bayesian credible interval does allow that sentence. In interviews say "95% of intervals built this way contain the true mean".</p>
  </div>
  <p>Why it matters at work: a CI shows size and uncertainty together. "Conversion up 1.1 points, CI 0.4 to 1.8" lets a business judge whether the low end is still worth it. A bare p-value cannot.</p>

  <h2 id="sht-err"><span class="num">04</span>Type I / II Errors &amp; Power</h2>
  <p>Any yes/no decision made from noisy data can go wrong in two ways. You can raise a false alarm (declare an effect that is not there), or you can miss a real effect. A test that never raises false alarms is easy: never reject anything. But it would miss everything. So we have to balance the two.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An airport metal detector. Set it very sensitive and it beeps at every belt buckle (false alarms, Type I). Set it lax and a real knife slips through (a miss, Type II). Turning one dial trades one error for the other. The only way to reduce both is a better machine: in statistics, more data or less noise.</p>
  </div>
  <table class="tbl">
    <tr><th></th><th>H₀ true (no effect)</th><th>H₁ true (real effect)</th></tr>
    <tr><th>Reject H₀</th><td><strong>Type I</strong>, false positive, prob α</td><td>Correct, prob = <strong>power</strong> = 1 − β</td></tr>
    <tr><th>Don't reject</th><td>Correct, prob 1 − α</td><td><strong>Type II</strong>, false negative, prob β</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 560 200" width="560"><line x1="30" y1="172" x2="548" y2="172" stroke="currentColor" stroke-opacity=".5"/><text x="220.8" y="187" text-anchor="middle" font-size="11">0</text><text x="310.5" y="187" text-anchor="middle" font-size="11">1.645</text><text x="357.2" y="187" text-anchor="middle" font-size="11">2.5</text><text x="548" y="167" text-anchor="end" font-size="11" class="tm">test statistic</text><path d="M30,172 L30,172 L39.7,172 L49.3,172 L59,172 L68.7,172 L78.4,172 L88,172 L97.7,172 L107.4,172 L117.1,172 L126.7,172 L136.4,172 L146.1,171.9 L155.8,171.8 L165.4,171.7 L175.1,171.5 L184.8,171.1 L194.5,170.4 L204.1,169.3 L213.8,167.6 L223.5,165.1 L233.1,161.5 L242.8,156.5 L252.5,149.8 L262.2,141.3 L271.8,130.8 L281.5,118.5 L291.2,104.6 L300.9,89.8 L310.5,74.8 L310.5,172 Z" class="fb" stroke="none"/><path d="M310.5,172 L310.5,74.8 L316.6,65.7 L322.7,57.3 L328.8,49.6 L334.9,43.1 L341,38 L347.1,34.3 L353.2,32.3 L359.2,32 L365.3,33.5 L371.4,36.6 L377.5,41.4 L383.6,47.5 L389.7,54.8 L395.8,63 L401.9,71.9 L408,81.2 L414,90.7 L420.1,100.1 L426.2,109.2 L432.3,117.8 L438.4,125.8 L444.5,133.2 L450.6,139.7 L456.7,145.5 L462.8,150.5 L468.8,154.8 L474.9,158.4 L481,161.4 L487.1,163.8 L493.2,165.8 L499.3,167.3 L505.4,168.5 L511.5,169.4 L517.6,170.1 L523.6,170.7 L529.7,171.1 L535.8,171.3 L541.9,171.5 L548,171.7 L548,172 Z" class="fg" stroke="none"/><path d="M310.5,172 L310.5,135.8 L318.7,144 L326.9,150.9 L335.1,156.4 L343.3,160.7 L351.5,164.1 L359.7,166.5 L367.9,168.3 L376,169.6 L384.2,170.4 L392.4,171 L400.6,171.4 L408.8,171.6 L417,171.8 L425.2,171.9 L433.4,171.9 L441.6,172 L449.7,172 L457.9,172 L466.1,172 L474.3,172 L482.5,172 L490.7,172 L498.9,172 L507.1,172 L515.2,172 L523.4,172 L531.6,172 L539.8,172 L548,172 L548,172 Z" class="fr" stroke="none"/><path d="M30,171.7 L38.8,171.5 L47.6,171.1 L56.3,170.5 L65.1,169.6 L73.9,168.3 L82.7,166.3 L91.5,163.6 L100.2,159.9 L109,154.9 L117.8,148.5 L126.6,140.6 L135.4,131 L144.1,119.9 L152.9,107.5 L161.7,94.2 L170.5,80.6 L179.3,67.3 L188,55.1 L196.8,44.9 L205.6,37.3 L214.4,32.9 L223.2,32.1 L231.9,34.8 L240.7,40.9 L249.5,50 L258.3,61.3 L267.1,74.2 L275.8,87.8 L284.6,101.3 L293.4,114.2 L302.2,125.9 L310.9,136.2 L319.7,145 L328.5,152.1 L337.3,157.7 L346.1,162 L354.8,165.2 L363.6,167.5 L372.4,169.1 L381.2,170.1 L390,170.9 L398.7,171.3 L407.5,171.6 L416.3,171.8 L425.1,171.9 L433.9,171.9 L442.6,172 L451.4,172 L460.2,172 L469,172 L477.8,172 L486.5,172 L495.3,172 L504.1,172 L512.9,172 L521.7,172 L530.4,172 L539.2,172 L548,172" fill="none" class="sb" stroke-width="2"/><path d="M30,172 L38.8,172 L47.6,172 L56.3,172 L65.1,172 L73.9,172 L82.7,172 L91.5,172 L100.2,172 L109,172 L117.8,172 L126.6,172 L135.4,172 L144.1,171.9 L152.9,171.9 L161.7,171.8 L170.5,171.6 L179.3,171.3 L188,170.9 L196.8,170.1 L205.6,169.1 L214.4,167.5 L223.2,165.2 L231.9,162 L240.7,157.7 L249.5,152.1 L258.3,145 L267.1,136.2 L275.8,125.9 L284.6,114.2 L293.4,101.3 L302.2,87.8 L310.9,74.2 L319.7,61.3 L328.5,50 L337.3,40.9 L346.1,34.8 L354.8,32.1 L363.6,32.9 L372.4,37.3 L381.2,44.9 L390,55.1 L398.7,67.3 L407.5,80.6 L416.3,94.2 L425.1,107.5 L433.9,119.9 L442.6,131 L451.4,140.6 L460.2,148.5 L469,154.9 L477.8,159.9 L486.5,163.6 L495.3,166.3 L504.1,168.3 L512.9,169.6 L521.7,170.5 L530.4,171.1 L539.2,171.5 L548,171.7" fill="none" class="sg" stroke-width="2"/><line x1="310.5" y1="172" x2="310.5" y2="21" class="sr" stroke-dasharray="4 3"/><text x="310.5" y="18" text-anchor="start" font-size="11">reject H₀ →</text><text x="35.5" y="45.6" text-anchor="start" font-size="11" class="tb">H₀: no effect</text><text x="438.9" y="45.6" text-anchor="middle" font-size="11" class="tg">H₁: real effect</text><text x="289" y="154.4" text-anchor="middle" font-size="13" font-weight="bold">β</text><text x="340.8" y="154.4" text-anchor="middle" font-size="13" class="tr" font-weight="bold">α</text><text x="389.9" y="119.3" text-anchor="middle" font-size="11" class="tg" font-weight="bold">power</text></svg><figcaption>Right of the line we reject. Red α = false alarms under H₀. Blue β = real effects we miss. Green = power (80% here).</figcaption></figure>
  <h3>Power by hand</h3>
  <p>Suppose a one-sided z-test (like a t-test but with a known noise level, so the curve is the standard normal). We reject when the statistic is above 1.645 (the point with 5% above it). Suppose the real effect is 2.5 standard errors. Then the statistic we observe wobbles around 2.5 instead of 0.</p>
  <ol>
    <li>We reject when Z_observed &gt; 1.645.</li>
    <li>Under H₁, Z_observed = 2.5 + noise, where noise ~ standard normal.</li>
    <li>So we need noise &gt; 1.645 − 2.5 = −0.855.</li>
    <li>P(standard normal &gt; −0.855) = 0.80. Power = 80%, β = 20%.</li>
  </ol>
  <p>The code checks that number, then uses <code>statsmodels</code> to answer the planning question "how many people per group?", and finally simulates many experiments to see α and power as real rates.</p>
  <div class="fx" data-lang="py">crit = stats.norm.ppf(0.95)
print(f"critical z = {crit:.3f}")
print(f"power = P(Z &gt; {crit:.3f} - 2.5) = {stats.norm.sf(crit-2.5):.3f}")
from statsmodels.stats.power import TTestIndPower
pa = TTestIndPower()
print("n per group for d=0.5, power 0.8:", round(pa.solve_power(effect_size=0.5, alpha=0.05, power=0.8), 1))
print("power with n=20 per group:", round(pa.power(effect_size=0.5, nobs1=20, alpha=0.05), 3))
rng = np.random.default_rng(7)
def reject_rate(diff, n, sims=4000):
    hits = 0
    for _ in range(sims):
        a = rng.normal(0, 1, n); b = rng.normal(diff, 1, n)
        hits += stats.ttest_ind(a, b, equal_var=False).pvalue &lt; 0.05
    return hits / sims
print(f"no effect, n=20: {reject_rate(0.0, 20):.3f}")
print(f"d=0.5,     n=20: {reject_rate(0.5, 20):.3f}")
print(f"d=0.5,     n=64: {reject_rate(0.5, 64):.3f}")</div>
  <div class="fx" data-lang="text">critical z = 1.645
power = P(Z &gt; 1.645 - 2.5) = 0.804
n per group for d=0.5, power 0.8: 63.8
power with n=20 per group: 0.338
no effect, n=20: 0.051
d=0.5,     n=20: 0.342
d=0.5,     n=64: 0.799</div>
  <p><code>effect_size</code> is <strong>Cohen's d</strong>: difference in means ÷ standard deviation (0.2 small, 0.5 medium, 0.8 large). <code>solve_power</code> says a medium effect needs about 64 people per group for 80% power. With only 20 per group, power is 0.34: two out of three real effects would be missed. The simulation agrees: with no effect, about 5% of tests reject (that is α); with d = 0.5 the reject rate is 0.34 at n = 20 and 0.80 at n = 64.</p>
  <div class="cards">
    <div><b>↑ sample size</b><p>Narrower curves → more power.</p><small>The main lever</small></div>
    <div><b>↑ effect size</b><p>Curves further apart → more power.</p><small>Big changes are easy to detect</small></div>
    <div><b>↑ α</b><p>Line moves left → more power, more false alarms.</p><small>A trade-off, not a free lunch</small></div>
    <div><b>↓ noise (σ)</b><p>Narrower curves.</p><small>Paired designs, CUPED</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Type I error</strong>: rejecting a true H₀ (rate α). <strong>Type II error</strong>: not rejecting a false H₀ (rate β). <strong>Power</strong> = 1 − β: the chance of detecting an effect that really exists. Standard target: α = 0.05, power = 0.8.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Computing power <em>after</em> a non-significant result ("observed power") adds nothing: it is just a re-coding of the p-value. Do the power calculation <em>before</em> collecting data, to choose n.</p>
  </div>

  <h2 id="sht-t"><span class="num">05</span>t-tests: One-sample, Welch, Paired</h2>
  <p>Section 02 compared one group with a fixed number. More often you compare two groups: users on CDN A vs CDN B, or the same queries before and after a fix. All three t-tests share one recipe, <code>t = difference / SE of that difference</code>. They differ only in what "the difference" is and how its SE is computed.</p>
  <div class="cards">
    <div><b>One-sample</b><p>One group vs a known number.</p><small>Mean delivery vs the claimed 30 min</small></div>
    <div><b>Two-sample (Welch)</b><p>Two independent groups of different people/things.</p><small>Load time: users on CDN A vs CDN B</small></div>
    <div><b>Paired</b><p>Same units measured twice; test the differences.</p><small>Latency of 8 queries, before vs after a fix</small></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Comparing two coaching centres by the marks of their students is a two-sample test: different students, lots of natural spread. Comparing the same 8 students' marks before and after a crash course is a paired test: each student is their own baseline, so "this student is just bright" cancels out.</p>
  </div>
  <h3>Welch by hand</h3>
  <p>Group A = [5, 7, 9], group B = [2, 3, 4].</p>
  <ol>
    <li>Means: 7 and 3. Difference = 4.</li>
    <li>Variances (÷ n − 1): A = (4+0+4)/2 = 4, B = (1+0+1)/2 = 1.</li>
    <li>SE of the difference = √(s²_A/n_A + s²_B/n_B) = √(4/3 + 1/3) = √1.667 = 1.291.</li>
    <li>t = 4 / 1.291 = 3.10.</li>
    <li>Welch's degrees of freedom (a formula that adjusts for unequal variances) ≈ 2.94.</li>
  </ol>
  <div class="fx" data-lang="py">a, b = np.array([5, 7, 9]), np.array([2, 3, 4])
va, vb = a.var(ddof=1) / len(a), b.var(ddof=1) / len(b)   # squared SE of each mean
se = np.sqrt(va + vb)
t = (a.mean() - b.mean()) / se
df = (va + vb)**2 / (va**2 / (len(a)-1) + vb**2 / (len(b)-1))   # Welch df
print(f"se={se:.3f} t={t:.3f} df={df:.2f} p={2*stats.t.sf(t, df):.4f}")
print(stats.ttest_ind(a, b, equal_var=False))</div>
  <div class="fx" data-lang="text">se=1.291 t=3.098 df=2.94 p=0.0548
TtestResult(statistic=np.float64(3.0983866769659336), pvalue=np.float64(0.054786766041076435), df=np.float64(2.9411764705882346))</div>
  <p>The hand numbers match <code>ttest_ind(..., equal_var=False)</code>. Notice the lesson: means of 7 vs 3 look very different, yet p = 0.055. With 3 points per group and under 3 degrees of freedom, the t curve has very fat tails. Tiny samples need huge gaps.</p>
  <h3>Paired by hand</h3>
  <p>Latency (ms) of 8 queries before and after an index change. Subtract per query: differences = 7, 4, 8, 2, 8, 5, 5, 9. Now it is just a one-sample t-test of "mean difference = 0": mean 6.0, sd 2.39, SE = 2.39/√8 = 0.845, t = 6.0/0.845 = 7.10.</p>
  <p>The code runs all three tests. The CDN groups are simulated with a true gap of 0.3 seconds; then the same latency numbers are tested paired and (wrongly) unpaired.</p>
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
  <p><code>ttest_rel</code> ("related samples") gives t = 7.099, exactly our hand value. Treating the same numbers as two unrelated groups gives p = 0.37. Why? Queries differ a lot from each other (120 to 160 ms), and that spread swamps the 6 ms improvement. Pairing subtracts each query from itself, so that spread disappears.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Welch's t-test</strong>: two independent groups, does not assume equal variances. <strong>Student's t-test</strong>: the older version that assumes equal variances (<code>equal_var=True</code>, scipy's default). <strong>Paired t-test</strong>: a one-sample t-test on per-unit differences. <strong>Degrees of freedom</strong>: roughly "how many independent pieces of information"; fewer df → fatter t tails.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>scipy's <code>ttest_ind</code> defaults to Student's (equal variances). Pass <code>equal_var=False</code> for Welch: it is safe when variances differ and loses almost nothing when they don't. And never run an unpaired test on paired data; you throw away most of your power.</p>
  </div>

  <h2 id="sht-chi"><span class="num">06</span>Chi-square Test &amp; ANOVA</h2>
  <p>t-tests compare two means. Two other questions come up all the time. First, data that is <em>counts in categories</em>, like "bought / didn't buy" by device. There is no mean to compare. Second, <em>three or more groups</em>: running t-tests on every pair inflates false alarms (section 08). Chi-square handles the first, ANOVA the second.</p>
  <h3>Chi-square test of independence</h3>
  <p>The idea: work out the counts you would <strong>expect</strong> if the two variables had nothing to do with each other, then measure how far the <strong>observed</strong> counts are from that.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school says 7% of all its students got distinction. If one section of 600 students had a "normal" share, you would expect about 42 distinctions there. If it has only 30, something about that section is different, or it is luck. Chi-square measures how surprising the gap is.</p>
  </div>
  <table class="tbl out"><caption>1,000 visitors: observed counts (expected in brackets)</caption>
    <tr><th></th><th>Bought</th><th>Didn't buy</th><th>Row total</th></tr>
    <tr><th>Mobile</th><td>30 (42)</td><td>570 (558)</td><td>600</td></tr>
    <tr><th>Desktop</th><td>40 (28)</td><td>360 (372)</td><td>400</td></tr>
    <tr><th>Column total</th><td>70</td><td>930</td><td>1000</td></tr>
  </table>
  <ol>
    <li><strong>Expected</strong> = row total × column total / grand total. Mobile-bought: 600 × 70 / 1000 = 42. Overall 7% bought, so 7% of 600 mobile users = 42.</li>
    <li><strong>Each cell's contribution</strong> (O − E)²/E: (30−42)²/42 = 3.429; (570−558)²/558 = 0.258; (40−28)²/28 = 5.143; (360−372)²/372 = 0.387.</li>
    <li><strong>χ²</strong> = sum = 9.217. Degrees of freedom = (rows − 1)(columns − 1) = 1.</li>
    <li>Look up χ² = 9.22 with 1 df: p ≈ 0.002.</li>
  </ol>
  <div class="fx" data-lang="py">table = np.array([[30, 570],    # mobile: buy, no buy
                  [40, 360]])   # desktop
row, col, total = table.sum(1, keepdims=True), table.sum(0, keepdims=True), table.sum()
E = row * col / total                       # expected counts if device doesn't matter
chi2 = ((table - E)**2 / E).sum()
print("expected:", E.tolist())
print("by hand chi2 =", round(chi2, 3))
res = stats.chi2_contingency(table, correction=False)
print("scipy, no correction:", round(res.statistic, 3), " p =", round(res.pvalue, 4))
res = stats.chi2_contingency(table)          # default: Yates correction on 2x2
print("scipy, default      :", round(res.statistic, 3), " p =", round(res.pvalue, 4), " dof =", res.dof)</div>
  <div class="fx" data-lang="text">expected: [[42.0, 558.0], [28.0, 372.0]]
by hand chi2 = 9.217
scipy, no correction: 9.217  p = 0.0024
scipy, default      : 8.465  p = 0.0036  dof = 1</div>
  <p><code>row * col / total</code> builds the whole expected table in one line (NumPy broadcasting: a 2×1 column times a 1×2 row). With <code>correction=False</code>, scipy matches the hand value 9.217. Its <em>default</em> applies the <strong>Yates continuity correction</strong> on 2×2 tables, which shrinks each |O − E| by 0.5 and gives 8.465. Both say the same thing: device and buying are related (p ≈ 0.003).</p>
  <h3>One-way ANOVA</h3>
  <p>Do 3+ group means differ? ANOVA ("analysis of variance") compares two kinds of spread: how far the <em>group means</em> are from each other (between) vs how much individuals vary <em>inside</em> each group (within). If the between-spread is much bigger, the groups really differ.</p>
  <p>By hand: messages sent by email [4, 5, 6], push [6, 7, 8], SMS [9, 10, 11]. Group means 5, 7, 10; grand mean 7.333.</p>
  <ol>
    <li>Between: SSB = 3·(5 − 7.333)² + 3·(7 − 7.333)² + 3·(10 − 7.333)² = 16.33 + 0.33 + 21.33 = 38.</li>
    <li>Within: each group's squared deviations are 1 + 0 + 1 = 2; SSW = 6.</li>
    <li>Divide by df: between k − 1 = 2 → 19; within N − k = 6 → 1.</li>
    <li>F = 19 / 1 = <strong>19</strong>.</li>
  </ol>
  <div class="fx" data-lang="py">groups = {"email": [4, 5, 6], "push": [6, 7, 8], "sms": [9, 10, 11]}
allv = np.concatenate(list(groups.values()))
grand = allv.mean()
ssb = sum(len(g) * (np.mean(g) - grand)**2 for g in groups.values())   # between
ssw = sum(((np.array(g) - np.mean(g))**2).sum() for g in groups.values())  # within
k, N = len(groups), len(allv)
F = (ssb / (k - 1)) / (ssw / (N - k))
print(f"grand={grand:.3f} SSB={ssb:.1f} SSW={ssw:.1f} F={F:.1f}")
print(stats.f_oneway(*groups.values()))

rng = np.random.default_rng(5)
email, push, sms = rng.normal(50, 8, 30), rng.normal(56, 8, 30), rng.normal(49, 8, 30)
r = stats.f_oneway(email, push, sms)
print(f"F={r.statistic:.3f}  p={r.pvalue:.4f}")
print(stats.tukey_hsd(email, push, sms))</div>
  <div class="fx" data-lang="text">grand=7.333 SSB=38.0 SSW=6.0 F=19.0
F_onewayResult(statistic=np.float64(18.99999999999995), pvalue=np.float64(0.0025356874530428415))
F=8.053  p=0.0006
Pairwise Group Comparisons (95.0% Confidence Interval)
Comparison  Statistic  p-value  Lower CI  Upper CI
 (0 - 1)     -6.030     0.005   -10.488    -1.572
 (0 - 2)      0.852     0.892    -3.606     5.310
 (1 - 0)      6.030     0.005     1.572    10.488
 (1 - 2)      6.882     0.001     2.424    11.340
 (2 - 0)     -0.852     0.892    -5.310     3.606
 (2 - 1)     -6.882     0.001   -11.340    -2.424</div>
  <p><code>f_oneway</code> confirms F = 19 for the toy data. On the bigger simulated campaign data, F = 8.05, p = 0.0006: some channel differs. <code>tukey_hsd</code> then says which: group 1 (push) beats 0 (email) and 2 (SMS), while email vs SMS (p = 0.89) shows no real difference.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Chi-square test of independence</strong>: are two categorical variables related? χ² = Σ(O − E)²/E. <strong>One-way ANOVA</strong>: are 3+ group means equal? F = between-group variance / within-group variance. <strong>Tukey HSD</strong>: follow-up that compares every pair while keeping the overall false-alarm rate at α.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Chi-square needs expected counts ≥ 5 in every cell; otherwise use Fisher's exact test (<code>stats.fisher_exact</code>). It also needs raw <em>counts</em>, never percentages. ANOVA only says "at least one mean differs", never which one.</p>
  </div>

  <h2 id="sht-np"><span class="num">07</span>Non-parametric Alternatives</h2>
  <p>t-tests work with means and standard deviations. One extreme value, like a single customer who spends ₹90,000 when everyone else spends ₹100, blows up both. The mean jumps, the SD jumps even more, and the t statistic shrinks to nothing. Ratings (1 to 5 stars) have a similar problem: the gap between 4 and 5 stars is not a real "1 unit".</p>
  <p>The idea: throw away the actual sizes and keep only the <strong>order</strong>. Rank all values from smallest to largest, then ask whether one group's ranks tend to be higher. A whale becomes "rank 20", no matter how big.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>In a school race, the medal list only records who finished 1st, 2nd, 3rd. One runner taking a wrong turn and finishing 10 minutes late does not change anyone else's position. Ranks ignore how big the gap is.</p>
  </div>
  <h3>Mann-Whitney U by hand</h3>
  <p>A = [3, 5, 40], B = [6, 8, 9].</p>
  <ol>
    <li>Sort everything: 3, 5, 6, 8, 9, 40 → ranks 1 to 6. A has ranks 1, 2, 6 (rank sum 9).</li>
    <li>Count the (A, B) pairs where A wins. 3 beats nobody, 5 beats nobody, 40 beats all three. U_A = 3 out of 3 × 3 = 9 pairs.</li>
    <li>If the groups were alike, A would win about half: 4.5. U = 3 is close to that, so no evidence.</li>
  </ol>
  <div class="fx" data-lang="py">a, b = [3, 5, 40], [6, 8, 9]
ranks = stats.rankdata(a + b)
print("ranks:", ranks, " rank sum A:", ranks[:3].sum())
wins = sum(x &gt; y for x in a for y in b)     # pairs where A beats B
print("U_A =", wins, "of", len(a) * len(b))
r = stats.mannwhitneyu(a, b)
print(f"scipy: U={r.statistic:.0f}  p={r.pvalue:.2f}")

a = np.array([12, 15, 14, 10, 13, 11, 16, 14, 12, 900])   # spend; one whale
b = np.array([18, 21, 17, 20, 19, 22, 18, 23, 20, 19])
print("means       :", a.mean(), b.mean())
print("Welch t     :", stats.ttest_ind(a, b, equal_var=False).pvalue.round(4))
print("Mann-Whitney:", stats.mannwhitneyu(a, b).pvalue.round(4))</div>
  <div class="fx" data-lang="text">ranks: [1. 2. 6. 3. 4. 5.]  rank sum A: 9.0
U_A = 3 of 9
scipy: U=3  p=0.70
means       : 101.7 19.7
Welch t     : 0.3794
Mann-Whitney: 0.0028</div>
  <p>First block: <code>rankdata</code> and the pair count match the hand work, and scipy's U is the same pair count. Second block, the real lesson: B beats A for 9 of 10 users, but one whale (900) drags A's mean to 101.7, above B's 19.7. The t-test sees a huge, noisy spread and gives p = 0.38. Mann-Whitney sees that almost every B value outranks almost every A value: p = 0.003.</p>
  <table class="tbl">
    <tr><th>Parametric</th><th>Non-parametric</th><th>scipy</th></tr>
    <tr><td>Two-sample t</td><td>Mann-Whitney U</td><td><code>mannwhitneyu</code></td></tr>
    <tr><td>Paired t</td><td>Wilcoxon signed-rank</td><td><code>wilcoxon</code></td></tr>
    <tr><td>One-way ANOVA</td><td>Kruskal-Wallis</td><td><code>kruskal</code></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Parametric test</strong>: assumes a shape (usually normal) and works with means/variances. <strong>Non-parametric test</strong>: makes few shape assumptions, usually by working on ranks. <strong>Mann-Whitney U</strong>: tests whether a random value from one group tends to be larger than one from the other.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Mann-Whitney does not test whether <em>means</em> differ. If the business cares about mean revenue per user (it usually does), use a t-test with a large n (the CLT makes the mean roughly normal), cap extreme values, or bootstrap the CI.</p>
  </div>

  <h2 id="sht-multi"><span class="num">08</span>Multiple Testing</h2>
  <p>α = 0.05 means a 5% false-alarm chance <em>per test</em>. A product dashboard compares 20 metrics after every launch. Even if the launch did nothing at all, each metric has a 5% chance to look "significant". Across 20, at least one false alarm is more likely than not.</p>
  <p>By hand: P(no false alarm in one test) = 0.95. In 20 independent tests: 0.95²⁰ = 0.358. So P(at least one) = 1 − 0.358 = <strong>0.64</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Buy one lottery ticket and winning is a surprise. Buy 20 and one small win is expected. If you test 20 things, one "win" at p = 0.04 is not surprising news; it is what luck does.</p>
  </div>
  <h3>Two fixes, by hand on 8 p-values</h3>
  <p>p-values (sorted): 0.001, 0.008, 0.012, 0.030, 0.041, 0.20, 0.35, 0.60. m = 8 tests.</p>
  <table class="tbl out"><caption>Bonferroni cut-off is 0.05/8 = 0.00625 for everyone; BH cut-off grows with rank i</caption>
    <tr><th>rank i</th><th>p</th><th>Bonferroni: p &lt; 0.00625?</th><th>BH cut-off (i/8)·0.05</th><th>p ≤ cut-off?</th></tr>
    <tr><td>1</td><td>0.001</td><td>yes</td><td>0.00625</td><td>yes</td></tr>
    <tr><td>2</td><td>0.008</td><td>no</td><td>0.0125</td><td>yes</td></tr>
    <tr><td>3</td><td>0.012</td><td>no</td><td>0.01875</td><td>yes ← last pass</td></tr>
    <tr><td>4</td><td>0.030</td><td>no</td><td>0.025</td><td>no</td></tr>
    <tr><td>5</td><td>0.041</td><td>no</td><td>0.03125</td><td>no</td></tr>
  </table>
  <p>Benjamini-Hochberg (BH) finds the <em>largest</em> rank that passes and rejects it and everything above it: ranks 1 to 3. Bonferroni keeps 1 discovery; BH keeps 3. The code does the same with <code>multipletests</code>.</p>
  <div class="fx" data-lang="py">from statsmodels.stats.multitest import multipletests
print(f"P(at least one false alarm in 20 tests) = {1 - 0.95**20:.3f}")
pvals = [0.001, 0.008, 0.012, 0.030, 0.041, 0.20, 0.35, 0.60]
for method in ["bonferroni", "fdr_bh"]:
    reject, p_adj, _, _ = multipletests(pvals, alpha=0.05, method=method)
    print(f"{method:10s}", reject.astype(int), np.round(p_adj, 3))</div>
  <div class="fx" data-lang="text">P(at least one false alarm in 20 tests) = 0.642
bonferroni [1 0 0 0 0 0 0 0] [0.008 0.064 0.096 0.24  0.328 1.    1.    1.   ]
fdr_bh     [1 1 1 0 0 0 0 0] [0.008 0.032 0.032 0.06  0.066 0.267 0.4   0.6  ]</div>
  <p>The first array is "reject? 1/0", the second is <strong>adjusted p-values</strong>, which you can compare directly with 0.05. Bonferroni's adjusted p is just p × 8 (capped at 1): 0.008 × 8 = 0.064, not significant. BH's adjusted values are smaller, so ranks 2 and 3 survive.</p>
  <table class="tbl">
    <tr><th>Method</th><th>Rule</th><th>Controls</th><th>Use when</th></tr>
    <tr><td><strong>Bonferroni</strong></td><td>p &lt; α / m</td><td>FWER: chance of <em>any</em> false positive</td><td>Few tests; a false positive is costly</td></tr>
    <tr><td><strong>Benjamini-Hochberg</strong></td><td>Sort p; reject up to the largest i with p₍ᵢ₎ ≤ (i/m)·α</td><td>FDR: expected share of discoveries that are false</td><td>Many metrics, genes, segments</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>FWER</strong> (family-wise error rate): P(at least one false positive among all tests). <strong>FDR</strong> (false discovery rate): among the things you call significant, the expected fraction that are false.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Correction only works if you count every test you ran, including the segments and metrics you looked at and then "forgot". Best fix: name one primary metric before the test starts.</p>
  </div>

  <h2 id="sht-which"><span class="num">09</span>Which Test When</h2>
  <p>Beginners memorise test names; interviewers ask "which test, and why?". You can answer almost every case with three questions, in this order.</p>
  <ol>
    <li><strong>What type is the outcome?</strong> A number (minutes, rupees) → you compare means or ranks. Yes/no (converted or not) → you compare proportions. A category with several levels → you compare counts in a table.</li>
    <li><strong>How many groups, and are they the same units?</strong> One group vs a fixed number, two separate groups, the same units measured twice, or three or more groups.</li>
    <li><strong>Is the data badly behaved?</strong> Heavy skew, big outliers, ordinal ratings, or tiny n → use the rank-based version, or bootstrap.</li>
  </ol>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Choosing a test is like choosing a vehicle in a city. Distance (data type), number of passengers (groups), and road condition (skew, outliers) decide between auto, car and bus. Nobody memorises "vehicle names"; they answer three questions.</p>
  </div>
  <table class="tbl">
    <tr><th>Question</th><th>Data</th><th>Test</th><th>scipy / statsmodels</th></tr>
    <tr><td>Mean vs a known value</td><td>numeric, one group</td><td>One-sample t</td><td><code>ttest_1samp</code></td></tr>
    <tr><td>Two group means</td><td>numeric, independent</td><td>Welch t (Mann-Whitney if skewed/ordinal)</td><td><code>ttest_ind(equal_var=False)</code></td></tr>
    <tr><td>Before vs after, same units</td><td>numeric, paired</td><td>Paired t (Wilcoxon)</td><td><code>ttest_rel</code></td></tr>
    <tr><td>3+ group means</td><td>numeric</td><td>ANOVA → Tukey (Kruskal-Wallis)</td><td><code>f_oneway</code>, <code>tukey_hsd</code></td></tr>
    <tr><td>Two proportions (conversion)</td><td>binary, large n</td><td>Two-proportion z-test</td><td><code>proportions_ztest</code></td></tr>
    <tr><td>Successes vs a known rate</td><td>binary, small n</td><td>Exact binomial</td><td><code>binomtest</code></td></tr>
    <tr><td>Two categorical variables related?</td><td>counts table</td><td>Chi-square (Fisher if small)</td><td><code>chi2_contingency</code></td></tr>
    <tr><td>Is data normal?</td><td>numeric</td><td>Shapiro-Wilk + QQ-plot</td><td><code>shapiro</code></td></tr>
    <tr><td>Two numeric variables related?</td><td>numeric pairs</td><td>Pearson / Spearman</td><td><code>pearsonr</code>, <code>spearmanr</code></td></tr>
  </table>
  <p>Worked choices: "Did average order value change between control and treatment?" → numeric, two independent groups → Welch t (order values are skewed, but with thousands of users the mean is fine by the CLT). "Did click-through rate change?" → yes/no, two groups → two-proportion z-test (see <a class="xref" data-note="st_abtesting">A/B Testing</a>). "Does preferred payment method differ by city?" → two categorical variables → chi-square. "Are hours studied and marks related?" → see <a class="xref" data-note="st_correlation">Correlation</a>.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Running a normality test first and switching tests based on its p-value is shaky: with big n, Shapiro rejects tiny harmless departures; with small n it misses big ones. Look at a histogram or QQ-plot and think about the question you need answered (means or "tends larger").</p>
  </div>

  <h2 id="sht-traps"><span class="num">10</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: reading p as the chance H₀ is true</span>
    <p>p = 0.03 does not mean "3% chance the change did nothing". It means "if the change did nothing, results this extreme happen 3% of the time". Same words, different order, very different meaning.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: "not significant" = "no effect"</span>
    <p>A small test can miss a real effect. Look at the CI. [−5%, +8%] means "we don't know"; [−0.1%, +0.1%] with good power means "any effect is tiny".</p>
  </div>
  <div class="callout trap"><span class="label">Trap: p-hacking</span>
    <p>Trying several tests, dropping "outliers", adding segments or stopping early until p &lt; 0.05. Each try is another lottery ticket. Fix the test, metric, n and α before you look.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: ddof and Student's default</span>
    <p><code>np.std</code> divides by n unless you pass <code>ddof=1</code>. <code>ttest_ind</code> assumes equal variances unless you pass <code>equal_var=False</code>. Both silently change your answer.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: unpaired test on paired data</span>
    <p>Same users before/after, same queries on two models: use the paired test. Our latency example went from p = 0.0002 (paired) to p = 0.37 (unpaired) on identical numbers.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: significance without size</span>
    <p>With 10 million users, a 0.01% lift can have p &lt; 0.001. Always report the effect size and CI next to p, and compare them with the smallest effect worth acting on.</p>
  </div>

  <h2 id="sht-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Explain a p-value to a product manager.</summary><div class="qa-body">"Assume the change did nothing. How often would random noise alone produce a lift this big? p = 0.03 means about 3% of the time. That's rare, so we doubt the 'did nothing' story." Avoid saying "97% chance it works".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute t by hand: data [31, 33, 32, 35, 34], H₀ mean 30.</summary><div class="qa-body">Mean 33. Squared deviations 4, 0, 1, 4, 1 sum to 10; variance 10/4 = 2.5; s = 1.581; SE = 1.581/√5 = 0.707; t = 3/0.707 = 4.24 with 4 df; two-sided p ≈ 0.013.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a 95% confidence interval mean?</summary><div class="qa-body">If we repeated the study many times and built an interval each time with this method, about 95% of those intervals would contain the true value. It is not "95% chance the true value is in this particular interval" (that is the Bayesian credible interval).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>p = 0.04 with 10 million users and a lift of 0.01%. Ship it?</summary><div class="qa-body">Statistically significant, practically meaningless. Huge n detects tiny effects. Check the CI against the minimum effect worth the engineering and risk cost. Probably not.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your test gives p = 0.3. Can you conclude the feature has no effect?</summary><div class="qa-body">No. Maybe the effect is real but the test was underpowered. Look at the CI: if it's [−5%, +8%], you learned little. If it's [−0.1%, +0.1%] with good power, you can say any effect is negligible.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When do you use a paired test?</summary><div class="qa-body">When each observation in one group has a natural partner in the other: same user before/after, same query on two models, twins. Test the differences; it removes between-unit variance and boosts power.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Type I or Type II: which is worse?</summary><div class="qa-body">Depends on cost. Shipping a harmful feature (Type I) is usually worse in product tests, so α is kept low. In disease screening, missing a sick patient (Type II) is worse, so you favour sensitivity.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is power and how do you raise it?</summary><div class="qa-body">The probability of detecting an effect that really exists (1 − β). Raise it with a larger n, a bigger true effect, less noise (paired design, CUPED, better measurement), or a larger α. A medium effect (d = 0.5) needs about 64 per group for 80% power.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you test if conversion differs across 4 countries?</summary><div class="qa-body">Chi-square test of independence on a 4 × 2 table (country × converted). If significant, do pairwise two-proportion tests with a Bonferroni or BH correction to find which countries differ.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute the expected count: 600 mobile users, 70 buyers out of 1,000 total.</summary><div class="qa-body">E = row total × column total / grand total = 600 × 70 / 1000 = 42. Observed 30 contributes (30 − 42)²/42 = 3.43 to χ².</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens to the CI width if you quadruple n?</summary><div class="qa-body">It halves. SE = σ/√n, and √4 = 2.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You test 50 product metrics and 3 are significant at 0.05. Excited?</summary><div class="qa-body">No: you'd expect 2.5 false positives by chance alone. Apply FDR correction, and pre-register one primary metric next time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why Welch instead of Student's t?</summary><div class="qa-body">Student's t assumes equal variances in both groups; if wrong (especially with unequal n), its false-positive rate drifts. Welch adjusts the degrees of freedom and is nearly as powerful when variances are equal. Safe default.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Revenue per user is very skewed. t-test or Mann-Whitney?</summary><div class="qa-body">If the question is "did mean revenue change?" and n is large (thousands), the t-test is valid by the CLT; consider capping outliers or bootstrapping the CI. Mann-Whitney answers a different question (do values tend to be larger), which may not match the business goal.</div></details>
</main>`
});
