// notes/mathstats/st_descriptive.js — Descriptive Statistics
Object.assign(TOPIC_CONTENT, {
  "st_descriptive": `<main>
  <h1>Descriptive Statistics</h1>
  <p class="lead">Summarising a column in a few honest numbers: centre, spread, shape and outliers. It's the first thing you do in every EDA, and the first place a wrong summary (a mean salary, a std on skewed data) misleads a stakeholder.</p>

  <h2 id="sde-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Descriptive Statistics</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Centre</div>
        <ul>
          <li><b>Mean</b> — <code>Σx / n</code>; balance point; uses every value</li>
          <li><b>Median</b> — middle of sorted data; robust to outliers</li>
          <li><b>Mode</b> — most frequent value; for categories</li>
          <li><b>Salary example</b> — [40…60, 1000]: mean 170k, median 53.5k</li>
          <li><b>Use</b> — mean for symmetric data and totals; median for skewed money/latency</li>
          <li>⚠ <b>Trap</b> — "average salary" with a CEO in the data; report median or both</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Spread</div>
        <ul>
          <li><b>Variance</b> — average squared distance from the mean: <code>Σ(x − x̄)² / (n − 1)</code></li>
          <li><b>Std</b> — √variance, back in original units</li>
          <li><b>Worked</b> — [2,4,4,4,5,5,7,9]: SS = 32 → 32/8 = 4, 32/7 = 4.571</li>
          <li><b>n − 1 (Bessel)</b> — sample mean hugs its own data, so ÷n underestimates; n − 1 is unbiased</li>
          <li><b>Simulation</b> — n = 5: ÷n gives 80, ÷(n−1) gives 100 (true 100)</li>
          <li>⚠ <b>Trap</b> — numpy ddof=0, pandas ddof=1 by default</li>
          <li><b>68-95-99.7</b> — ±1/2/3 std, only for roughly normal data</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Shape: Skewness</div>
        <ul>
          <li><b>Skewness</b> — mean of z³; sign shows which side the long tail is</li>
          <li><b>Right (+)</b> — mode &lt; median &lt; mean; income, order value, latency</li>
          <li><b>Left (−)</b> — mean &lt; median; easy-exam scores</li>
          <li><b>Scale</b> — |skew| &lt; 0.5 symmetric, 0.5–1 moderate, &gt; 1 strong</li>
          <li><b>Fix</b> — <code>np.log1p</code> or Box-Cox before linear models</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Tails: Kurtosis</div>
        <ul>
          <li><b>Kurtosis</b> — mean of z⁴; measures tail heaviness, not peak height</li>
          <li><b>Excess</b> — scipy subtracts 3, so normal = 0</li>
          <li><b>Heavy tails</b> — t(3) excess ≈ 34; extreme values far more common</li>
          <li><b>Why care</b> — fraud amounts, returns, latency spikes break normal assumptions</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Percentiles &amp; Outliers</div>
        <ul>
          <li><b>Percentile p</b> — value with p% of data below; p50 = median</li>
          <li><b>p95 / p99</b> — latency SLAs: what the slowest users feel</li>
          <li><b>IQR</b> — Q3 − Q1, spread of the middle half; robust</li>
          <li><b>Tukey fences</b> — outlier if outside <code>Q1 − 1.5·IQR</code> … <code>Q3 + 1.5·IQR</code></li>
          <li><b>Example</b> — Q1 17.75, Q3 25.5, IQR 7.75 → upper fence 37.1; 95 is an outlier</li>
          <li>⚠ <b>Masking</b> — outlier inflates the std: z = 3.2, robust z (median, MAD) = 12.4</li>
          <li><b>Handle</b> — investigate; fix errors; cap/log real extremes, don't blindly delete</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Five-Number Summary</div>
        <ul>
          <li><b>min, Q1, median, Q3, max</b> — the box plot's skeleton</li>
          <li><b>Box</b> — IQR; line = median; whiskers to last point inside fences; dots = outliers</li>
          <li><b>pandas</b> — <code>df.describe()</code> gives count, mean, std, quartiles</li>
          <li><b>Read it</b> — mean ≫ median or std ≫ IQR → skew/outliers</li>
          <li>⚠ <b>Trap</b> — box hides bimodality; pair with histogram/violin</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Describe in Words</div>
        <ul>
          <li><b>Order</b> — shape → centre → spread → unusual points → context</li>
          <li><b>Symmetric</b> — report mean ± std</li>
          <li><b>Skewed</b> — report median and IQR (or MAD)</li>
          <li><b>Bimodal</b> — split by segment first</li>
          <li><b>Template</b> — "right-skewed, median 21.5 min (IQR 17.8–25.5), one outlier at 95"</li>
        </ul>
      </div>
    </div>
  </div>


  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sde-centre"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Mean, Median, Mode</span><span class="rm-sub">Which "average" to trust</span></div></div>
      <div class="rm-item rm-done" data-target="sde-spread"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Variance &amp; Std</span><span class="rm-sub">Spread, and why n−1</span></div></div>
      <div class="rm-item rm-done" data-target="sde-skew"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Skewness</span><span class="rm-sub">Which way the tail points</span></div></div>
      <div class="rm-item rm-done" data-target="sde-kurt"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Kurtosis</span><span class="rm-sub">How heavy the tails are</span></div></div>
      <div class="rm-item rm-done" data-target="sde-pct"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Percentiles, IQR, Outliers</span><span class="rm-sub">Robust spread and fences</span></div></div>
      <div class="rm-item rm-done" data-target="sde-box"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Five-Number Summary</span><span class="rm-sub">The box plot, decoded</span></div></div>
      <div class="rm-item rm-done" data-target="sde-words"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Describe It in Words</span><span class="rm-sub">The one-sentence EDA summary</span></div></div>
      <div class="rm-item rm-done" data-target="sde-hands"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Hands-on</span><span class="rm-sub">Summarise a skewed column</span></div></div>
      <div class="rm-item rm-done" data-target="sde-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="sde-centre"><span class="num">01</span>Mean, Median, Mode</h2>
  <p>You have a column with 10,000 numbers: delivery times, order values, marks. Nobody can read 10,000 numbers. You need a few numbers that honestly stand for the whole column. That is what <strong>descriptive statistics</strong> means: describing a pile of numbers with a handful of summaries. You will do this on day one of every data job (it is called EDA, "exploratory data analysis"), and interviewers ask about it because a wrong summary quietly misleads the whole company.</p>
  <p>The first question is always: what is a "typical" value? There are three ways to answer, and they can disagree.</p>
  <table class="tbl out"><caption>Marks of 5 friends: 6, 7, 7, 8, 9</caption>
    <tr><th>Mean</th><td>add them all, divide by how many: (6 + 7 + 7 + 8 + 9) / 5 = 37 / 5 = <strong>7.4</strong></td></tr>
    <tr><th>Median</th><td>sort them, take the middle one: 6, 7, <strong>7</strong>, 8, 9 → <strong>7</strong></td></tr>
    <tr><th>Mode</th><td>the value that appears most often: <strong>7</strong> (appears twice)</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The mean is a see-saw's balance point: every value pushes on it, and a very heavy value far away tilts it a lot. The median is the person standing in the middle of a queue: it does not matter how rich the person at the end is, the middle person stays the same.</p>
  </div>
  <p>Now the case that matters. Eight salaries at a small company, in thousands per year. Seven people earn 40 to 60. The eighth is the CEO at 1000.</p>
  <figure class="viz"><svg viewBox="0 0 560 120" width="560"><line x1="20" y1="92" x2="540" y2="92" stroke="currentColor" stroke-opacity=".5"/><text x="20" y="107" text-anchor="middle" font-size="11">0</text><text x="119" y="107" text-anchor="middle" font-size="11">200</text><text x="218.1" y="107" text-anchor="middle" font-size="11">400</text><text x="317.1" y="107" text-anchor="middle" font-size="11">600</text><text x="416.2" y="107" text-anchor="middle" font-size="11">800</text><text x="515.2" y="107" text-anchor="middle" font-size="11">1000</text><text x="540" y="87" text-anchor="end" font-size="11" class="tm">salary ($k)</text><path d="M39.8,74.5h0M42.3,74.5h0M44.8,74.5h0M45.8,74.5h0M47.2,74.5h0M48.7,74.5h0M49.7,74.5h0M515.2,74.5h0" class="sb" stroke-width="10" stroke-linecap="round"/><line x1="46.5" y1="92" x2="46.5" y2="39.5" class="sg" stroke-dasharray="4 3"/><text x="46.5" y="36.5" text-anchor="start" font-size="11">median 53.5</text><line x1="104.2" y1="92" x2="104.2" y2="25.5" class="sr" stroke-dasharray="4 3"/><text x="104.2" y="22.5" text-anchor="start" font-size="11">mean 170</text><text x="515.2" y="57" text-anchor="middle" font-size="11">CEO</text></svg><figcaption>Seven salaries sit at 40–60k. One CEO at 1000k drags the mean to 170k; the median barely notices.</figcaption></figure>
  <p>Look at the two dashed lines. The median (53.5) sits where most people are. The mean (170) sits where nobody is: no single person earns anything close to 170. One extreme value moved it.</p>
  <div class="fx" data-lang="py">import numpy as np
from scipy import stats
salaries = np.array([40, 45, 50, 52, 55, 58, 60, 1000])  # $k; last = CEO
print("mean  :", salaries.mean())
print("median:", np.median(salaries))
print("mode  :", stats.mode([1,2,2,3,3,3,4]).mode)
no_ceo = salaries[:-1]
print("mean without CEO  :", round(no_ceo.mean(), 2))
print("median without CEO:", np.median(no_ceo))</div>
  <div class="fx" data-lang="text">mean  : 170.0
median: 53.5
mode  : 3
mean without CEO  : 51.43
median without CEO: 52.0</div>
  <p>Removing one person moved the mean by 118 and the median by 1.5. A summary that barely moves when a few extreme values come or go is called <strong>robust</strong>. The median is robust; the mean is not.</p>
  <table class="tbl">
    <tr><th>Measure</th><th>Formula, in words</th><th>Misleads when…</th><th>Use for</th></tr>
    <tr><td><strong>Mean</strong></td><td><code>Σx / n</code>: Σx means "add up every value", n is "how many values"</td><td>Outliers or a long tail on one side (salaries, revenue)</td><td>Roughly symmetric data; totals ("revenue = mean × users")</td></tr>
    <tr><td><strong>Median</strong></td><td>Middle value after sorting (average of the two middles if n is even)</td><td>Rarely; it ignores how big the tail is</td><td>Lopsided data: income, house prices, delivery time</td></tr>
    <tr><td><strong>Mode</strong></td><td>Most frequent value</td><td>Decimal data (every value is unique)</td><td>Categories: most common city, device, pin code</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Average salary at the company is 170k" is true and useless: 7 of 8 people earn under 61k. For money data, report the median, or report both and say why they differ.</p>
  </div>

  <h2 id="sde-spread"><span class="num">02</span>Variance &amp; Standard Deviation</h2>
  <p>Two batters both average 40 runs over 5 matches. Batter A scored 38, 40, 42, 40, 40. Batter B scored 0, 80, 5, 75, 40. Same mean, completely different players. The mean alone hides this. You also need a number for <strong>spread</strong>: how far the values typically sit from the mean.</p>
  <p>The obvious idea: measure each value's gap from the mean and average the gaps. For batter B the gaps are −40, +40, −35, +35, 0. They add up to exactly 0, because the mean is the balance point: the gaps above always cancel the gaps below. So first make every gap positive by squaring it, then average. That average of squared gaps is the <strong>variance</strong>. Its square root, which brings the units back to runs, is the <strong>standard deviation</strong> (std).</p>
  <div class="fx" data-lang="py">a = np.array([38, 40, 42, 40, 40])   # steady batter
b = np.array([0, 80, 5, 75, 40])     # risky batter
for name, s in [("A", a), ("B", b)]:
    print(name, "mean", s.mean(), " var", s.var(ddof=1), " std", round(s.std(ddof=1), 2))
print("gaps from mean (B):", b - b.mean(), " sum:", (b - b.mean()).sum())</div>
  <div class="fx" data-lang="text">A mean 40.0  var 2.0  std 1.41
B mean 40.0  var 1412.5  std 37.58
gaps from mean (B): [-40.  40. -35.  35.   0.]  sum: 0.0</div>
  <p>Read the std as "give or take": A scores 40 give or take 1.4 runs; B scores 40 give or take 38 runs. Same mean, and now the difference is visible in one number.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Std is like the "±" on a train's arrival. "Arrives at 9:00 ± 2 min" and "arrives at 9:00 ± 40 min" have the same mean, but only one lets you plan.</p>
  </div>
  <div class="flow"><span>Subtract the mean</span><span>Square each gap</span><span>Average them (÷ n−1)</span><span>= variance</span><span>√ → std</span></div>
  <table class="tbl out"><caption>Worked by hand: x = [2, 4, 4, 4, 5, 5, 7, 9], mean = 40 / 8 = 5</caption>
    <tr><th>x</th><td>2</td><td>4</td><td>4</td><td>4</td><td>5</td><td>5</td><td>7</td><td>9</td><th>sum</th></tr>
    <tr><th>(x − 5)²</th><td>9</td><td>1</td><td>1</td><td>1</td><td>0</td><td>0</td><td>4</td><td>16</td><td><strong>32</strong></td></tr>
  </table>
  <p>Population variance = 32 / 8 = <strong>4</strong> (std = √4 = 2). Sample variance = 32 / 7 = <strong>4.571</strong> (std 2.138). Two answers, because there are two formulas; the next sub-section explains why.</p>
  <div class="fx" data-lang="py">x = np.array([2, 4, 4, 4, 5, 5, 7, 9])
print("var  (ddof=0):", x.var())
print("var  (ddof=1):", round(x.var(ddof=1), 4))
print("std  (ddof=1):", round(x.std(ddof=1), 4))</div>
  <div class="fx" data-lang="text">var  (ddof=0): 4.0
var  (ddof=1): 4.5714
std  (ddof=1): 2.1381</div>
  <p>Formula: <code>s² = Σ(x − x̄)² / (n − 1)</code>. Here x̄ (say "x bar") is the mean, (x − x̄) is one value's gap from the mean, Σ adds the squared gaps over all values, and n − 1 is the divisor explained next. <code>ddof</code> in numpy is "how much to subtract from n": ddof=0 divides by n, ddof=1 divides by n − 1.</p>
  <h3>Why divide by n−1 (Bessel's correction)</h3>
  <p>Divide by n if you have the <em>whole</em> group (every employee's salary). Divide by n − 1 if you have a <em>sample</em> and want to guess the spread of the bigger group it came from (12 deliveries out of thousands).</p>
  <p>The reason: your sample's own mean is the point that makes the gaps smallest. The true mean of the whole group is somewhere else, so the real gaps are a bit bigger than the ones you measured. Dividing by a slightly smaller number (n − 1) pushes the answer up by just the right amount. Check it by simulation: take 100,000 small samples from a group whose true variance is 100.</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
pop = rng.normal(0, 10, 1_000_000)            # true variance = 100
samples = rng.choice(pop, size=(100_000, 5))  # 100k samples of n=5
print("avg var, ddof=0:", round(samples.var(axis=1, ddof=0).mean(), 1))
print("avg var, ddof=1:", round(samples.var(axis=1, ddof=1).mean(), 1))</div>
  <div class="fx" data-lang="text">avg var, ddof=0: 80.2
avg var, ddof=1: 100.2</div>
  <p>Dividing by n lands at 80 on average, too low by the factor (n − 1)/n = 4/5. Dividing by n − 1 lands at 100, the truth. "Right on average" is what statisticians call <strong>unbiased</strong>.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Defaults differ: <code>np.std</code> uses ddof=0, <code>pandas .std()</code> uses ddof=1. Same data, two different numbers. On small samples the gap is noticeable.</p>
  </div>
  <div class="callout intu"><span class="label">Rule of thumb</span>
    <p>For bell-shaped data, about 68% of values sit within ±1 std of the mean, 95% within ±2, 99.7% within ±3. Heights with mean 170 cm and std 10 cm: about 95% of people are 150–190 cm. On lopsided data this rule breaks, so do not quote it there.</p>
  </div>

  <h2 id="sde-skew"><span class="num">03</span>Skewness</h2>
  <p>Order values on a food app: most orders are 150–400 rupees, a few are 3000-rupee party orders, and none are below 0. Draw the histogram and it is lopsided: a tall hump on the left and a long thin tail stretching right. That lopsidedness is called <strong>skew</strong>, and the tail's direction gives its name: a tail to the right is <strong>right-skewed</strong> (positive), a tail to the left is <strong>left-skewed</strong> (negative).</p>
  <figure class="viz"><svg viewBox="0 0 560 200" width="560"><line x1="30" y1="172" x2="548" y2="172" stroke="currentColor" stroke-opacity=".5"/><text x="30" y="187" text-anchor="middle" font-size="11">0</text><text x="133.6" y="187" text-anchor="middle" font-size="11">2</text><text x="237.2" y="187" text-anchor="middle" font-size="11">4</text><text x="340.8" y="187" text-anchor="middle" font-size="11">6</text><text x="444.4" y="187" text-anchor="middle" font-size="11">8</text><text x="548" y="187" text-anchor="middle" font-size="11">10</text><text x="548" y="167" text-anchor="end" font-size="11" class="tm">value</text><path d="M30,172 L30,172 L38.8,172 L47.6,170.2 L56.3,162.1 L65.1,146.7 L73.9,127.3 L82.7,107.8 L91.5,90.8 L100.2,77.8 L109,68.9 L117.8,63.7 L126.6,61.9 L135.4,62.6 L144.1,65.2 L152.9,69.3 L161.7,74.2 L170.5,79.8 L179.3,85.6 L188,91.5 L196.8,97.4 L205.6,103 L214.4,108.5 L223.2,113.6 L231.9,118.4 L240.7,122.9 L249.5,127.1 L258.3,131 L267.1,134.5 L275.8,137.8 L284.6,140.7 L293.4,143.5 L302.2,146 L310.9,148.2 L319.7,150.3 L328.5,152.2 L337.3,153.9 L346.1,155.5 L354.8,156.9 L363.6,158.2 L372.4,159.4 L381.2,160.4 L390,161.4 L398.7,162.3 L407.5,163.1 L416.3,163.8 L425.1,164.5 L433.9,165.1 L442.6,165.7 L451.4,166.2 L460.2,166.7 L469,167.1 L477.8,167.5 L486.5,167.8 L495.3,168.2 L504.1,168.5 L512.9,168.7 L521.7,169 L530.4,169.2 L539.2,169.4 L548,169.6 L548,172 Z" class="fb" stroke="none"/><path d="M30.5,172 L38,172 L45.5,171 L53,166.1 L60.5,155.5 L68,140.5 L75.5,123.6 L83,107.1 L90.5,92.5 L98,80.7 L105.5,71.9 L113,66.1 L120.5,62.9 L128,61.8 L135.5,62.6 L143,64.8 L150.5,68 L158,72.1 L165.5,76.6 L173,81.4 L180.5,86.4 L188,91.5 L195.5,96.5 L203,101.4 L210.5,106.1 L218,110.6 L225.5,114.9 L233,119 L240.5,122.8 L248,126.4 L255.5,129.8 L263,132.9 L270.5,135.8 L278,138.5 L285.5,141 L293,143.4 L300.5,145.5 L308,147.5 L315.5,149.3 L323,151 L330.5,152.6 L338,154 L345.5,155.4 L353,156.6 L360.5,157.7 L368,158.8 L375.5,159.8 L383,160.6 L390.5,161.5 L398,162.2 L405.5,162.9 L413,163.6 L420.5,164.2 L428,164.7 L435.5,165.2 L443,165.7 L450.5,166.2 L458,166.6 L465.5,166.9 L473,167.3 L480.5,167.6 L488,167.9 L495.5,168.2 L503,168.4 L510.5,168.7 L518,168.9 L525.5,169.1 L533,169.3 L540.5,169.5 L548,169.6" fill="none" class="sb" stroke-width="2"/><line x1="128.2" y1="172" x2="128.2" y2="36.6" class="st" stroke-dasharray="2 2"/><text x="128.2" y="33.6" text-anchor="end" font-size="11">mode</text><line x1="170.8" y1="172" x2="170.8" y2="25.3" class="sg" stroke-dasharray="4 3"/><text x="170.8" y="22.3" text-anchor="middle" font-size="11">median</text><line x1="198.6" y1="172" x2="198.6" y2="47.9" class="sr" stroke-dasharray="4 3"/><text x="198.6" y="44.9" text-anchor="start" font-size="11">mean</text><text x="366.7" y="78" text-anchor="start" font-size="11">long right tail →</text></svg><figcaption>Right skew (income, latency, order value): mode &lt; median &lt; mean. The tail pulls the mean toward it.</figcaption></figure>
  <p>Look at the three dashed lines. The hump (mode) comes first, then the median, then the mean, which the long tail drags furthest right. That ordering is the fingerprint of right skew. For left skew (an easy exam where most people score 90+ and a few score 40) the order flips: mean &lt; median &lt; mode.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Skew is like a tug-of-war on the mean: a few very large values pull it toward their side, away from where the crowd stands.</p>
  </div>
  <div class="fx" data-lang="py">rng = np.random.default_rng(42)
normal = rng.normal(50, 10, 10_000)
income = rng.lognormal(10, 0.8, 10_000)      # right-skewed
exam   = 100 - rng.exponential(8, 10_000)    # left-skewed (easy exam)
for name, d in [("normal", normal), ("income", income), ("exam", exam)]:
    print(f"{name:7s} skew={stats.skew(d):6.2f}  mean={d.mean():9.1f}  median={np.median(d):9.1f}")</div>
  <div class="fx" data-lang="text">normal  skew= -0.00  mean=     49.9  median=     49.9
income  skew=  3.36  mean=  30872.8  median=  22187.2
exam    skew= -2.09  mean=     91.9  median=     94.5</div>
  <p>Symmetric data: skew ≈ 0 and mean ≈ median. Income: skew +3.4 and the mean sits 8,700 above the median. Easy exam: skew −2.1 and the mean sits below the median.</p>
  <p>The formula: <strong>skewness = average of z³</strong>, where z = (x − mean) / std is "how many stds this value sits from the mean". Cubing keeps the sign (a value 3 stds to the right gives +27, a value 3 stds to the left gives −27) and makes far-away values count much more. So a long right tail gives a positive total, a long left tail gives a negative total.</p>
  <table class="tbl">
    <tr><th>Skew</th><th>Order</th><th>Real examples</th><th>Typical fix before modelling</th></tr>
    <tr><td>≈ 0</td><td>mean ≈ median</td><td>heights, measurement error</td><td>none</td></tr>
    <tr><td>&gt; 0 (right)</td><td>mode &lt; median &lt; mean</td><td>income, order value, delivery time, video views</td><td><code>np.log1p</code> (log of 1 + x), Box-Cox</td></tr>
    <tr><td>&lt; 0 (left)</td><td>mean &lt; median &lt; mode</td><td>easy-exam scores, age at death</td><td>reflect (subtract from max) then log</td></tr>
  </table>
  <p>Scale: |skew| &lt; 0.5 is roughly symmetric; 0.5–1 is moderate; above 1 is strongly skewed.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reporting "mean ± std" on skewed data gives a range like "mean order 480 ± 600 rupees", which includes negative orders. Use median and IQR (next section) for skewed columns, or take the log first.</p>
  </div>

  <h2 id="sde-kurt"><span class="num">04</span>Kurtosis</h2>
  <p>Two columns can have the same mean, same std and zero skew, yet one of them throws up a crazy value every week and the other never does. Server latency is like this: most requests take 100 ms, but once in a while one takes 10 seconds. The question "how often do extreme values show up?" is answered by <strong>kurtosis</strong>, which measures how heavy the <em>tails</em> are.</p>
  <figure class="viz"><svg viewBox="0 0 560 200" width="560"><line x1="30" y1="172" x2="548" y2="172" stroke="currentColor" stroke-opacity=".5"/><text x="81.8" y="187" text-anchor="middle" font-size="11">-4</text><text x="185.4" y="187" text-anchor="middle" font-size="11">-2</text><text x="289" y="187" text-anchor="middle" font-size="11">0</text><text x="392.6" y="187" text-anchor="middle" font-size="11">2</text><text x="496.2" y="187" text-anchor="middle" font-size="11">4</text><path d="M30,172 L37.5,172 L45,172 L52.5,172 L60,172 L67.5,172 L75,172 L82.6,171.9 L90.1,171.9 L97.6,171.8 L105.1,171.7 L112.6,171.5 L120.1,171.3 L127.6,170.8 L135.1,170.2 L142.6,169.2 L150.1,167.9 L157.6,166 L165.1,163.4 L172.6,160 L180.1,155.5 L187.7,149.9 L195.2,142.9 L202.7,134.6 L210.2,124.9 L217.7,113.8 L225.2,101.7 L232.7,88.9 L240.2,75.7 L247.7,62.8 L255.2,50.7 L262.7,40 L270.2,31.5 L277.7,25.4 L285.2,22.3 L292.8,22.3 L300.3,25.4 L307.8,31.5 L315.3,40 L322.8,50.7 L330.3,62.8 L337.8,75.7 L345.3,88.9 L352.8,101.7 L360.3,113.8 L367.8,124.9 L375.3,134.6 L382.8,142.9 L390.3,149.9 L397.9,155.5 L405.4,160 L412.9,163.4 L420.4,166 L427.9,167.9 L435.4,169.2 L442.9,170.2 L450.4,170.8 L457.9,171.3 L465.4,171.5 L472.9,171.7 L480.4,171.8 L487.9,171.9 L495.4,171.9 L503,172 L510.5,172 L518,172 L525.5,172 L533,172 L540.5,172 L548,172" fill="none" class="sb" stroke-width="2"/><path d="M30,170.4 L37.5,170.2 L45,170 L52.5,169.8 L60,169.6 L67.5,169.3 L75,168.9 L82.6,168.5 L90.1,168.1 L97.6,167.5 L105.1,166.9 L112.6,166.2 L120.1,165.3 L127.6,164.3 L135.1,163.1 L142.6,161.7 L150.1,160 L157.6,158 L165.1,155.6 L172.6,152.8 L180.1,149.4 L187.7,145.3 L195.2,140.5 L202.7,134.7 L210.2,128 L217.7,120.1 L225.2,111 L232.7,100.8 L240.2,89.7 L247.7,77.8 L255.2,65.9 L262.7,54.7 L270.2,45.1 L277.7,38 L285.2,34.2 L292.8,34.2 L300.3,38 L307.8,45.1 L315.3,54.7 L322.8,65.9 L330.3,77.8 L337.8,89.7 L345.3,100.8 L352.8,111 L360.3,120.1 L367.8,128 L375.3,134.7 L382.8,140.5 L390.3,145.3 L397.9,149.4 L405.4,152.8 L412.9,155.6 L420.4,158 L427.9,160 L435.4,161.7 L442.9,163.1 L450.4,164.3 L457.9,165.3 L465.4,166.2 L472.9,166.9 L480.4,167.5 L487.9,168.1 L495.4,168.5 L503,168.9 L510.5,169.3 L518,169.6 L525.5,169.8 L533,170 L540.5,170.2 L548,170.4" fill="none" class="sr" stroke-width="2" stroke-dasharray="5 3"/><text x="40.4" y="36.6" text-anchor="start" font-size="11" class="tb">— normal (excess kurtosis 0)</text><text x="40.4" y="55.4" text-anchor="start" font-size="11" class="tr">- - t, 3 df (heavy tails)</text><text x="475.5" y="149.4" text-anchor="middle" font-size="10">fatter tail</text></svg><figcaption>Same centre, different tails. Heavy tails mean extreme values show up far more often than a normal predicts.</figcaption></figure>
  <p>Both curves have the same centre. Look at the far left and far right: the dashed red curve stays visibly above zero where the blue one has already hit the floor. Those fat tails mean values 4 or 5 stds away actually happen.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two roads with the same average speed. On the first, everyone drives 55–65. On the second, most drive 55–65 but once an hour someone does 150. Same mean, same "typical" spread, but you plan very differently for the second road. Kurtosis is the "once an hour someone does 150" number.</p>
  </div>
  <p>The formula: <strong>kurtosis = average of z⁴</strong>, with z as before. The fourth power makes far-out points dominate: a value 3 stds out contributes 81, a value 1 std out contributes just 1. So kurtosis is almost entirely about the tails, not about how pointy the peak looks. scipy reports <em>excess</em> kurtosis (the raw number minus 3), so a bell curve scores 0 and anything positive means "heavier tails than a bell curve".</p>
  <div class="fx" data-lang="py">heavy = rng.standard_t(3, 10_000)
print(round(stats.kurtosis(normal), 2), round(stats.kurtosis(heavy), 2))</div>
  <div class="fx" data-lang="text">0.05 34.32</div>
  <p>The bell-shaped column scores about 0. The heavy-tailed column (a t distribution with 3 degrees of freedom) scores 34: extreme values are far more common than the bell curve predicts.</p>
  <div class="callout intu"><span class="label">Why a DS cares</span>
    <p>Stock returns, fraud amounts and latency are heavy-tailed. A model or alert that assumes bell-curve tails will be "surprised" by 5-sigma events every week, and its "99.9% safe" promises will fail.</p>
  </div>

  <h2 id="sde-pct"><span class="num">05</span>Percentiles, IQR &amp; Outliers</h2>
  <p>"You scored 74 in the class test." Good or bad? It depends on everyone else. If 70% of the class scored below you, you are at the <strong>70th percentile</strong>. A percentile turns a raw number into a rank out of 100: "percentile p" is the value that p% of the data sits below. The median is the 50th percentile. Quartiles cut the data into quarters: Q1 is the 25th percentile, Q3 the 75th.</p>
  <div class="fx" data-lang="py">scores = np.array([45, 52, 58, 61, 63, 67, 70, 74, 81, 92])
print("your 74 beats", stats.percentileofscore(scores, 74, kind="strict"), "% of the class")</div>
  <div class="fx" data-lang="text">your 74 beats 70.0 % of the class</div>
  <p>Percentiles are the standard way to talk about speed. A website promise like "p95 latency under 300 ms" means 95% of requests finish within 300 ms; the mean would hide the slow 5% that users actually complain about.</p>
  <div class="cards">
    <div><b>Percentile p</b><p>The value below which p% of data falls.</p><small>p50 = median; p95/p99 for latency promises</small></div>
    <div><b>IQR</b><p>Q3 − Q1: the width of the middle 50%.</p><small>Ignores both tails, so outliers can't inflate it</small></div>
    <div><b>Tukey fences</b><p>Outlier if below Q1 − 1.5·IQR or above Q3 + 1.5·IQR.</p><small>Works on skewed data too</small></div>
  </div>
  <p>The IQR (interquartile range) is the robust cousin of the std: it is the spread of the middle half, so a few wild values cannot change it. It also gives a simple rule for spotting <strong>outliers</strong>, values so far from the rest that they deserve a second look. Twelve app sessions, in minutes:</p>
  <div class="fx" data-lang="py">x = np.array([12, 15, 17, 18, 20, 21, 22, 24, 25, 27, 30, 95])  # session minutes
q1, q2, q3 = np.percentile(x, [25, 50, 75])
iqr = q3 - q1
lo, hi = q1 - 1.5*iqr, q3 + 1.5*iqr
print("Q1, median, Q3:", q1, q2, q3)
print("IQR:", iqr, " fences:", lo, hi)
print("outliers:", x[(x &lt; lo) | (x &gt; hi)])</div>
  <div class="fx" data-lang="text">Q1, median, Q3: 17.75 21.5 25.5
IQR: 7.75  fences: 6.125 37.125
outliers: [95]</div>
  <p>By hand: IQR = 25.5 − 17.75 = 7.75. Upper fence = 25.5 + 1.5 × 7.75 = 25.5 + 11.625 = 37.125. Only 95 is beyond it, so 95 is flagged. (Why 1.5? It is a convention that works well on bell-shaped data; nothing deeper.)</p>
  <h3>z-score vs robust z-score</h3>
  <p>Another way to flag outliers is the <strong>z-score</strong>: how many stds a value sits from the mean, z = (x − mean) / std. A common rule says |z| &gt; 3 is an outlier. Watch what happens with our 95:</p>
  <div class="fx" data-lang="py">print("z-scores:", stats.zscore(x).round(2))
med, mad = np.median(x), stats.median_abs_deviation(x)
print("median, MAD:", med, mad)
print("robust z of 95:", round(0.6745*(95-med)/mad, 2))</div>
  <div class="fx" data-lang="text">z-scores: [-0.72 -0.58 -0.48 -0.44 -0.34 -0.29 -0.25 -0.15 -0.1  -0.01  0.13  3.23]
median, MAD: 21.5 4.0
robust z of 95: 12.39</div>
  <div class="callout trap"><span class="label">Trap: masking</span>
    <p>The outlier is part of the data used to compute the mean (27.2) and std (21.0), so it drags both toward itself and then looks only 3.2 stds out. This is called masking. The robust z-score swaps in the median (21.5) and the MAD (median absolute deviation: the median of every value's gap from the median, here 4.0); 0.6745 is a constant that puts MAD on the same scale as std. Now 95 is 12.4 "stds" out, an obvious outlier. Use robust versions for outlier detection.</p>
  </div>

  <h2 id="sde-box"><span class="num">06</span>Five-Number Summary &amp; Box Plot</h2>
  <p>Take the five landmarks you now know (min, Q1, median, Q3, max) and you have a <strong>five-number summary</strong>, a compact description of any column. Draw it, and you get a <strong>box plot</strong>, the chart you will see in every EDA notebook. For the 12 sessions:</p>
  <div class="flow"><span>min 12</span><span>Q1 17.75</span><span>median 21.5</span><span>Q3 25.5</span><span>max 95</span></div>
  <figure class="viz"><svg viewBox="0 0 560 150" width="560"><line x1="20" y1="122" x2="540" y2="122" stroke="currentColor" stroke-opacity=".5"/><text x="20" y="137" text-anchor="middle" font-size="11">0</text><text x="72" y="137" text-anchor="middle" font-size="11">10</text><text x="124" y="137" text-anchor="middle" font-size="11">20</text><text x="176" y="137" text-anchor="middle" font-size="11">30</text><text x="228" y="137" text-anchor="middle" font-size="11">40</text><text x="332" y="137" text-anchor="middle" font-size="11">60</text><text x="436" y="137" text-anchor="middle" font-size="11">80</text><text x="540" y="137" text-anchor="middle" font-size="11">100</text><text x="540" y="117" text-anchor="end" font-size="11" class="tm">minutes</text><rect x="112.3" y="51.8" width="40.3" height="37.8" class="fb sb"/><line x1="131.8" y1="89.6" x2="131.8" y2="51.8" class="sb" stroke-width="2.5"/><line x1="82.4" y1="70.7" x2="112.3" y2="70.7" class="sb" stroke-width="1.5"/><line x1="152.6" y1="70.7" x2="176" y2="70.7" class="sb" stroke-width="1.5"/><line x1="82.4" y1="78.8" x2="82.4" y2="62.6" class="sb" stroke-width="1.5"/><line x1="176" y1="78.8" x2="176" y2="62.6" class="sb" stroke-width="1.5"/><path d="M514,70.7h0" class="sr" stroke-width="10" stroke-linecap="round"/><line x1="213.1" y1="122" x2="213.1" y2="30.2" class="sr" stroke-dasharray="4 3"/><text x="215.5" y="24.8" text-anchor="start" font-size="10">upper fence 37.1 = Q3 + 1.5·IQR</text><text x="112.3" y="41" text-anchor="middle" font-size="10">Q1</text><text x="131.8" y="41" text-anchor="middle" font-size="10">med</text><text x="152.6" y="41" text-anchor="middle" font-size="10">Q3</text><text x="82.4" y="100.4" text-anchor="middle" font-size="10">min 12</text><text x="176" y="100.4" text-anchor="middle" font-size="10">30</text><text x="514" y="100.4" text-anchor="middle" font-size="10" class="tr">outlier 95</text></svg><figcaption>Box = middle 50% (IQR). Whiskers reach the furthest points inside the fences. Anything beyond is drawn as a dot.</figcaption></figure>
  <p>How to read it: the box runs from Q1 to Q3, so it holds the middle half of the sessions. The line inside is the median. The "whiskers" (thin lines) reach out to the last values still inside the fences. Anything beyond the fence is drawn alone as a dot: here, the 95-minute session. One glance tells you centre, spread and outliers.</p>
  <div class="fx" data-lang="py">import pandas as pd
print(pd.Series(x, name="minutes").describe().round(2))</div>
  <div class="fx" data-lang="text">count    12.00
mean     27.17
std      21.96
min      12.00
25%      17.75
50%      21.50
75%      25.50
max      95.00
Name: minutes, dtype: float64</div>
  <p><code>describe()</code> prints exactly these numbers plus count, mean and std. Read it like a detective: mean (27.2) is well above median (21.5), and std (22) is almost 3× the IQR (7.75). Both say "right skew or an outlier is present"; you already know it is the 95.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A box plot hides shape. Data with two humps (say, 20-minute casual users and 80-minute power users) can produce a normal-looking box centred at 50, where almost nobody is. Pair it with a histogram or violin plot.</p>
  </div>

  <h2 id="sde-words"><span class="num">07</span>Describing a Distribution in Words</h2>
  <p>In a job you will be asked "so what does this column look like?" The answer has a fixed order: shape first, then centre, then spread, then unusual points, then what it means for the business.</p>
  <div class="flow"><span>Shape</span><span>Centre</span><span>Spread</span><span>Unusual points</span><span>Context</span></div>
  <div class="callout def"><span class="label">Template</span>
    <p>"Session length is <strong>right-skewed</strong> with a median of <strong>21.5 min</strong> (IQR 17.8–25.5). One session at <strong>95 min</strong> is an outlier, possibly an idle tab. I'd report the median and cap or log-transform before modelling."</p>
  </div>
  <table class="tbl">
    <tr><th>Shape</th><th>Centre to report</th><th>Spread to report</th></tr>
    <tr><td>Symmetric, no outliers</td><td>mean</td><td>std</td></tr>
    <tr><td>Skewed or outliers</td><td>median</td><td>IQR (or MAD)</td></tr>
    <tr><td>Two humps (bimodal)</td><td>describe each group</td><td>split by segment first</td></tr>
  </table>

  <h2 id="sde-hands"><span class="num">08</span>Hands-on</h2>
  <p>Summarise a right-skewed column (order values), then see what the log transform does to its shape. <code>np.log1p(v)</code> computes log(1 + v), which squashes big values far more than small ones.</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(7)
order_value = rng.lognormal(mean=3.5, sigma=0.9, size=5000)
for name, v in [("raw", order_value), ("log1p", np.log1p(order_value))]:
    q1, q3 = np.percentile(v, [25, 75])
    print(f"{name:5s} mean={v.mean():7.2f} median={np.median(v):7.2f} "
          f"IQR={q3-q1:6.2f} skew={stats.skew(v):5.2f}")</div>
  <div class="fx" data-lang="text">raw   mean=  48.67 median=  32.22 IQR= 42.36 skew= 5.09
log1p mean=   3.53 median=   3.50 IQR=  1.18 skew= 0.13</div>
  <p>Before: mean far above median, skew 5. After the log: mean ≈ median and skew ≈ 0. The column is now well described by mean and std, and ready for models that expect bell-shaped inputs.</p>

  <h2 id="sde-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Mean house price is $650k, median is $420k. What does that tell you?</summary><div class="qa-body">The distribution is right-skewed: a few very expensive houses pull the mean up. The median better describes a "typical" house. Report the median, maybe with p90.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why divide by n−1 for a sample variance?</summary><div class="qa-body">Deviations are measured from the sample mean, which is fitted to the same data, so they're systematically too small. Dividing by n−1 (degrees of freedom: one is "used up" by estimating the mean) makes the estimate unbiased. With n = 5, dividing by n gives 80% of the true value on average.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Predict: <code>np.std([1,2,3,4])</code> vs <code>pd.Series([1,2,3,4]).std()</code>.</summary><div class="qa-body">numpy: ddof=0 → √(5/4) = 1.118. pandas: ddof=1 → √(5/3) = 1.291. Different defaults, not a bug.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you report the mean even though the data is skewed?</summary><div class="qa-body">When the business cares about totals. Revenue per user × users = total revenue, which the median can't give you. A/B tests on revenue usually compare means for this reason (with care about outliers).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is the IQR rule better than "|z| &gt; 3" for finding outliers?</summary><div class="qa-body">z-scores use the mean and std, which the outliers themselves inflate (masking), and they assume normality. IQR uses quartiles, which outliers barely move, and works on skewed data. In our example z = 3.2, while robust z = 12.4.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does high kurtosis mean a sharper peak?</summary><div class="qa-body">Not really. Kurtosis is dominated by z⁴ in the tails, so it measures how often extreme values occur. A distribution can be flat-topped and still have high kurtosis if its tails are heavy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A latency SLA says "p99 &lt; 300 ms". Why p99 and not the mean?</summary><div class="qa-body">Latency is right-skewed; the mean hides the slow tail that users actually feel. p99 says 99% of requests are faster than 300 ms, so at most 1 in 100 is slow. Big services track p50, p95, p99.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two features: std 5 and std 5000. Which varies more?</summary><div class="qa-body">You can't tell: std carries the units. Compare the coefficient of variation (std / mean), or standardise. This is also why scale-sensitive models (kNN, SVM, regularised regression) need feature scaling.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You find an outlier. Do you delete it?</summary><div class="qa-body">Investigate first. A data error (age = 999) → fix or drop. A real extreme (a whale customer) → keep it, but use robust stats, cap (winsorise) or log-transform. Deleting real extremes hides exactly the cases the business may care about.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A box plot looks perfectly symmetric. Can the data still be bimodal?</summary><div class="qa-body">Yes. Two equal humps at 20 and 80 give a symmetric box centred at 50, where almost no data lives. Always look at a histogram or violin plot too.</div></details>
</main>`
});
