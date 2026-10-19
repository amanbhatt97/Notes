// notes/mathstats/st_correlation.js — Correlation & Relationships
Object.assign(TOPIC_CONTENT, {
  "st_correlation": `<main>
  <h1>Correlation &amp; Relationships</h1>
  <div class="where"><span>Mathematics &amp; Statistics</span><span>Statistics</span><span>Correlation &amp; Relationships</span></div>
  <p class="lead">Correlation is one number that says how strongly two variables move together. You will use it every day in data exploration and feature selection, and you will hear it misused every day in "X causes Y" claims. This note follows five students, A to E, through the whole topic: covariance and Pearson's r built by hand from their study hours and exam scores, whether r on 5 students could be luck, ranks for curves and typos, the shapes r cannot see, the confounder behind "phones lower scores", Simpson's paradox and copy-cat features in a model.</p>

  <h2 id="sco-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 110" width="680"><defs><marker id="sco-trk" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs><rect x="10.0" y="20" width="100" height="56" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="60.0" y="42" text-anchor="middle" font-size="11">Descriptive</text><text x="60.0" y="58" text-anchor="middle" class="tm" font-size="9.5">summarise one column</text><line x1="110.0" y1="48" x2="120.0" y2="48" stroke="currentColor" marker-end="url(#sco-trk)"/><rect x="122.0" y="20" width="100" height="56" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="172.0" y="42" text-anchor="middle" font-size="11">Probability</text><text x="172.0" y="58" text-anchor="middle" class="tm" font-size="9.5">quantify uncertainty</text><line x1="222.0" y1="48" x2="232.0" y2="48" stroke="currentColor" marker-end="url(#sco-trk)"/><rect x="234.0" y="20" width="100" height="56" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="284.0" y="42" text-anchor="middle" font-size="11">Distributions</text><text x="284.0" y="58" text-anchor="middle" class="tm" font-size="9.5">named shapes of chance</text><line x1="334.0" y1="48" x2="344.0" y2="48" stroke="currentColor" marker-end="url(#sco-trk)"/><rect x="346.0" y="20" width="100" height="56" rx="8" class="fg sg" stroke-width="3"/><text x="396.0" y="42" text-anchor="middle" font-size="11.5" font-weight="700">Correlation</text><text x="396.0" y="58" text-anchor="middle" class="tm" font-size="9.5">two columns together</text><text x="396.0" y="96" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text><line x1="446.0" y1="48" x2="456.0" y2="48" stroke="currentColor" marker-end="url(#sco-trk)"/><rect x="458.0" y="20" width="100" height="56" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="508.0" y="42" text-anchor="middle" font-size="11">Hypothesis Testing</text><text x="508.0" y="58" text-anchor="middle" class="tm" font-size="9.5">real or luck?</text><line x1="558.0" y1="48" x2="568.0" y2="48" stroke="currentColor" marker-end="url(#sco-trk)"/><rect x="570.0" y="20" width="100" height="56" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="620.0" y="42" text-anchor="middle" font-size="11">A/B Testing</text><text x="620.0" y="58" text-anchor="middle" class="tm" font-size="9.5">decide with an experiment</text></svg><figcaption>The Statistics track, in reading order. Each note answers a question the previous one left open.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="st_distributions">Probability Distributions</a></b><span>We learnt the standard stories for a single variable (Bernoulli, Poisson, Normal, …) and the sampling distributions t, χ² and F. From <a class="xref" data-note="st_descriptive">Descriptive Statistics</a> we have the mean, the standard deviation and the z-score. Left open: everything so far describes <em>one</em> column at a time. Real questions involve two: do students who study more score more?</span></li>
    <li><b>This note adds: measuring how two variables move together, and how that measure misleads</b><span>Covariance, Pearson's r, r² and the t-test for r; Spearman and Kendall on ranks; the blind spots (curves, outliers, Anscombe); and the three traps of interpretation: confounders, Simpson's paradox and multicollinearity.</span></li>
    <li><b>Leads to: <a class="xref" data-note="st_hypothesis">Hypothesis Testing</a></b><span>r = 0.994 on 5 students came with "p = 0.0005", and pure noise gave |r| &gt; 0.8 one time in ten. Where do p-values come from, and when is any pattern (a correlation, a difference in means, a difference in rates) real rather than luck? The next note builds that machinery in general, and <a class="xref" data-note="st_abtesting">A/B Testing</a> uses it to settle causation, which correlation never can.</span></li>
  </ol>

  <h2 id="sco-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. All numbers come from students A–E.</p>
  <ol class="story">
    <li><b>Covariance</b><span>Q: when study hours go up, does the score go up too? → Multiply each student's distance from the mean hours by their distance from the mean score and average: 41/4 = 10.25, positive. But 10.25 what? Measure study in minutes and it becomes 615…</span></li>
    <li><b>Pearson's r</b><span>Q: how strong is the link, in a unit-free number? → Divide covariance by both standard deviations: r = 0.994, nearly a perfect line; r² = 0.989; slope 4.1 marks per hour. But it comes from only 5 students…</span></li>
    <li><b>Is r real? (t-test for r)</b><span>Q: could pure luck produce r this large? → t = r√(n − 2)/√(1 − r²) = 16.3, p = 0.0005; yet pure noise gives |r| &gt; 0.8 for 10% of 5-student samples. But r only measures straight lines on raw values: one typo or one curve fools it…</span></li>
    <li><b>Spearman &amp; Kendall</b><span>Q: what if the link is curved, or a value is wrong? → Correlate ranks: mock vs final ρ = 0.9, τ = 0.8; a typo (50 hours) drops Pearson to 0.45 but Spearman stays 0.94. But even ranks miss patterns that go up then down…</span></li>
    <li><b>Blind spots: r = 0 and Anscombe</b><span>Q: does r = 0 mean "unrelated"? → No: stress vs score has r = 0.07 yet a clear peak at stress 3; Anscombe's four datasets share r = 0.816 and look nothing alike. Always plot. But even a real, well-plotted correlation may not be a cause…</span></li>
    <li><b>Confounders &amp; partial correlation</b><span>Q: phone hours and score correlate −0.93: will banning phones raise scores? → Not if motivation drives both: r = −0.75 among 300 students drops to 0.06 once motivation is removed. But a confounder can do worse than create a link; it can flip one…</span></li>
    <li><b>Simpson's paradox</b><span>Q: can a trend reverse when groups are pooled? → Yes: treatment A wins for small stones (93% vs 87%) and large (73% vs 69%) but loses pooled (78% vs 83%), because of case mix. And when correlated variables are both fed into a model…</span></li>
    <li><b>Multicollinearity &amp; VIF</b><span>Q: what happens when two features are near copies? → The model can't split the credit: hours and practice tests r = 0.959, VIF = 12.6; the coefficient's SE quadruples. Next: a general way to tell real patterns from luck.</span></li>
  </ol>

  <h2 id="sco-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Correlation &amp; Relationships</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Covariance &amp; Pearson</div>
        <ul>
          <li><b>Covariance</b> — <code>Σ(x − x̄)(y − ȳ)/(n − 1)</code>; sign = direction: 10.25</li>
          <li>⚠ carries units: minutes → 615, score ×10 → 102.5</li>
          <li><b>Pearson r</b> — <code>cov / (sₓ s_y)</code> = average product of z-scores: 0.994</li>
          <li><b>r²</b> — share of variance a line explains: 0.989 (r 0.3 → 9%)</li>
          <li><b>Slope</b> — cov/var(x) = 4.1 marks per hour</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Is it real?</div>
        <ul>
          <li><b>t</b> = r√(n−2)/√(1−r²) = 16.3 on 3 df, p 0.0005</li>
          <li><b>95% CI</b> for r: 0.914 to 1.000 (Fisher z)</li>
          <li>Noise, n = 5: |r| &gt; 0.8 in 9.8% of samples</li>
          <li>⚠ big n: tiny r is "significant"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Ranks</div>
        <ul>
          <li><b>Spearman ρ</b> — Pearson on ranks; 1 − 6Σd²/(n(n²−1)) = 0.9</li>
          <li><b>Kendall τ</b> — (concordant − discordant)/pairs = (9 − 1)/10 = 0.8</li>
          <li><b>Typo</b> F = 50 h: Pearson 0.45, Spearman 0.94</li>
          <li><b>Curve</b> diminishing returns: Pearson 0.86, Spearman 1.00</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Blind spots</div>
        <ul>
          <li>r = 0 ≠ independent: stress r 0.07, peak at 3</li>
          <li><b>Anscombe</b>: 4 sets, same mean, var, r 0.816, line y = 3 + 0.5x</li>
          <li>Always plot (<code>sns.pairplot</code>)</li>
          <li><code>df.corr(method="spearman")</code> for a whole table</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Causation</div>
        <ul>
          <li><b>Confounder</b> — Z causes X and Y: motivation → phone, score</li>
          <li><b>Partial r</b> — −0.75 raw → 0.06 after removing motivation</li>
          <li>Reverse causation, selection bias, coincidence</li>
          <li><b>Simpson</b> — kidney stones: A wins both groups, loses pooled (78% vs 83%)</li>
          <li><b>Prove it</b> — randomised experiment</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Multicollinearity</div>
        <ul>
          <li>Features near copies: hours &amp; tests r 0.959</li>
          <li><b>VIF</b> = 1/(1 − R²ⱼ) = 12.6; &gt; 10 severe</li>
          <li>200 students: tests coef 2.27 → 1.26, SE 0.11 → 0.44</li>
          <li>⚠ hurts interpretation, not prediction (R² 0.700 → 0.709)</li>
          <li>Fix: drop/combine, PCA, ridge</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sco-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="sco-cov"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Covariance</span><span class="rm-sub">Five students, by hand</span></div></div>
      <div class="rm-item rm-done" data-target="sco-r"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Pearson's r</span><span class="rm-sub">Unit-free strength, r², slope</span></div></div>
      <div class="rm-item rm-done" data-target="sco-sig"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Is r Real?</span><span class="rm-sub">t-test and CI for r</span></div></div>
      <div class="rm-item rm-done" data-target="sco-ps"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Spearman &amp; Kendall</span><span class="rm-sub">Ranks, curves and typos</span></div></div>
      <div class="rm-item rm-done" data-target="sco-anscombe"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Blind Spots</span><span class="rm-sub">r = 0, Anscombe, always plot</span></div></div>
      <div class="rm-item rm-done" data-target="sco-cause"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Correlation ≠ Causation</span><span class="rm-sub">Confounders, partial r</span></div></div>
      <div class="rm-item rm-done" data-target="sco-simpson"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Simpson's Paradox</span><span class="rm-sub">Real kidney-stone data</span></div></div>
      <div class="rm-item rm-done" data-target="sco-vif"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Multicollinearity &amp; VIF</span><span class="rm-sub">When features copy each other</span></div></div>
      <div class="rm-item rm-done" data-target="sco-connect"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One chain, one table</span></div></div>
      <div class="rm-item rm-done" data-target="sco-traps"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Units, curves, causal claims</span></div></div>
      <div class="rm-item rm-done" data-target="sco-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="sco-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="sco-cov"><span class="num">01</span>Covariance</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Every tool so far (mean, sd, distributions) describes one variable. How do we measure, with a number, whether two variables move together?</p>
  </div>
  <h3>The running example: five students</h3>
  <p>A coaching teacher records six numbers for five students. Every calculation in this note uses this table (plus, where a concept needs more rows, "the same idea at scale" with simulated students).</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from scipy import stats
df = pd.DataFrame({"hours":  [1, 2, 3, 4, 5],         # hours studied per day
                   "score":  [52, 55, 61, 64, 68],    # final exam score
                   "phone":  [6, 5, 5, 3, 2],         # phone hours per day
                   "mock":   [40, 58, 50, 66, 70],    # mock-test score
                   "stress": [1, 5, 4, 2, 3],         # self-rated stress 1-5
                   "tests":  [2, 4, 4, 8, 9]},       # practice tests taken
                  index=list("ABCDE"))
print(df)</div>
  <div class="fx" data-lang="text">   hours  score  phone  mock  stress  tests
A      1     52      6    40       1      2
B      2     55      5    58       5      4
C      3     61      5    50       4      4
D      4     64      3    66       2      8
E      5     68      2    70       3      9</div>
  <p>Columns: <code>hours</code> studied per day, final exam <code>score</code>, <code>phone</code> hours per day, <code>mock</code>-test score, self-rated <code>stress</code> (1–5) and number of practice <code>tests</code> taken. Start with the main question: when hours go up, does score go up too, and how reliably? Looking at 10,000 rows by eye does not work, and a scatter plot cannot be put in a feature-selection loop. We need a number.</p>
  <p>The idea in plain words: for each student, check whether they are above or below average on hours, and above or below average on score. If most students are "above on both" or "below on both", the two move together. If most are "above on one, below on the other", they move opposite. If it is mixed, there is no clear link.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Rainfall and umbrella sales in Mumbai. On wetter-than-usual days, umbrella shops sell more than usual; on drier days, less. Both are "above usual" together and "below usual" together. That shared movement around the usual level is exactly what covariance measures.</p>
  </div>
  <h3>Covariance by hand</h3>
  <p>Average hours x̄ = 15/5 = 3, average score ȳ = 300/5 = 60.</p>
  <table class="tbl out"><caption>Worked: hours studied vs exam score</caption>
    <tr><th>student</th><td>A</td><td>B</td><td>C</td><td>D</td><td>E</td><th>sum</th></tr>
    <tr><th>x (hours)</th><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>15</td></tr>
    <tr><th>y (score)</th><td>52</td><td>55</td><td>61</td><td>64</td><td>68</td><td>300</td></tr>
    <tr><th>x − 3</th><td>−2</td><td>−1</td><td>0</td><td>1</td><td>2</td><td></td></tr>
    <tr><th>y − 60</th><td>−8</td><td>−5</td><td>1</td><td>4</td><td>8</td><td></td></tr>
    <tr><th>(x−3)(y−60)</th><td>16</td><td>5</td><td>0</td><td>4</td><td>16</td><td><strong>41</strong></td></tr>
  </table>
  <ol>
    <li>Every product is positive or zero: below-average students are below on both, above-average students are above on both.</li>
    <li>Covariance = 41 / (n − 1) = 41 / 4 = <strong>10.25</strong>. Positive → they rise together. (n − 1 for the same reason as the sample variance: Bessel's correction from the Descriptive note.)</li>
  </ol>
  <figure class="viz"><svg viewBox="0 0 560 190" width="560"><rect x="160.0" y="20.0" width="120.0" height="70.0" class="fg" opacity=".35"/><rect x="40.0" y="90.0" width="120.0" height="70.0" class="fg" opacity=".35"/><rect x="40.0" y="20.0" width="120.0" height="70.0" class="fr" opacity=".25"/><rect x="160.0" y="90.0" width="120.0" height="70.0" class="fr" opacity=".25"/><line x1="160.0" y1="20.0" x2="160.0" y2="160.0" stroke="currentColor" stroke-dasharray="4 3"/><line x1="40.0" y1="90.0" x2="280.0" y2="90.0" stroke="currentColor" stroke-dasharray="4 3"/><circle cx="64.0" cy="146.0" r="5" class="fb sb"/><text x="72.0" y="150.0" font-size="11">A</text><circle cx="112.0" cy="125.0" r="5" class="fb sb"/><text x="120.0" y="129.0" font-size="11">B</text><circle cx="160.0" cy="83.0" r="5" class="fb sb"/><text x="168.0" y="87.0" font-size="11">C</text><circle cx="208.0" cy="62.0" r="5" class="fb sb"/><text x="216.0" y="66.0" font-size="11">D</text><circle cx="256.0" cy="34.0" r="5" class="fb sb"/><text x="264.0" y="38.0" font-size="11">E</text><text x="64.0" y="176" text-anchor="middle" font-size="10.5">1</text><text x="112.0" y="176" text-anchor="middle" font-size="10.5">2</text><text x="160.0" y="176" text-anchor="middle" font-size="10.5">3</text><text x="208.0" y="176" text-anchor="middle" font-size="10.5">4</text><text x="256.0" y="176" text-anchor="middle" font-size="10.5">5</text><text x="34" y="164.0" text-anchor="end" font-size="10.5">50</text><text x="34" y="129.0" text-anchor="end" font-size="10.5">55</text><text x="34" y="94.0" text-anchor="end" font-size="10.5">60</text><text x="34" y="59.0" text-anchor="end" font-size="10.5">65</text><text x="34" y="24.0" text-anchor="end" font-size="10.5">70</text><text x="164.0" y="32.0" font-size="10" class="tm">x̄ = 3</text><text x="276.0" y="86.0" font-size="10" class="tm" text-anchor="end">ȳ = 60</text><text x="220.0" y="30.5" text-anchor="middle" font-size="10.5" class="tg">+ × + = +</text><text x="100.0" y="149.5" text-anchor="middle" font-size="10.5" class="tg">− × − = +</text><text x="100.0" y="30.5" text-anchor="middle" font-size="10.5" class="tr">− × + = −</text><text x="220.0" y="149.5" text-anchor="middle" font-size="10.5" class="tr">+ × − = −</text><text x="310" y="30" font-size="11.5" font-weight="700">Products (x − 3)(y − 60):</text><text x="310" y="48" font-size="11.5">A: (−2)(−8) = 16</text><text x="310" y="66" font-size="11.5">B: (−1)(−5) = 5</text><text x="310" y="84" font-size="11.5">C: (0)(1) = 0</text><text x="310" y="102" font-size="11.5">D: (1)(4) = 4</text><text x="310" y="120" font-size="11.5">E: (2)(8) = 16</text><text x="310" y="138" font-size="11.5">sum 41 → cov = 41/4 = 10.25</text><text x="310" y="156" font-size="11.5" font-weight="700">r = 10.25/(1.581 × 6.519) = 0.994</text></svg><figcaption>The five students around the mean lines. Every point sits in a green quadrant (both above or both below average), so every product is positive or zero and the covariance is positive.</figcaption></figure>
  <div class="fx" data-lang="py">hours, score = df.hours.values, df.score.values
dx, dy = hours - hours.mean(), score - score.mean()
print("deviation products:", dx * dy, " sum:", (dx * dy).sum())
print(np.cov(hours, score))                       # 2x2 covariance matrix
print("cov with score out of 1000:", np.cov(hours, score * 10)[0, 1])
print("cov with study in minutes :", np.cov(hours * 60, score)[0, 1])</div>
  <div class="fx" data-lang="text">deviation products: [16.  5.  0.  4. 16.]  sum: 41.0
[[ 2.5  10.25]
 [10.25 42.5 ]]
cov with score out of 1000: 102.5
cov with study in minutes : 615.0</div>
  <p>The code rebuilds the deviation products (16, 5, 0, 4, 16, sum 41). <code>np.cov</code> returns a 2×2 <strong>covariance matrix</strong>: the diagonal holds each variable's variance (2.5 and 42.5), the off-diagonal holds the covariance 10.25. Then the problem: score out of 1,000 makes it 102.5; study time in minutes makes it 615. The relationship did not change; only the units did.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Covariance</strong>: cov(x, y) = Σ(xᵢ − x̄)(yᵢ − ȳ) / (n − 1). Its sign gives the direction (positive: rise together; negative: one rises as the other falls; near 0: no linear link). Its size is in "units of x × units of y". cov(x, x) = var(x).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Never compare covariances across variables measured in different units, or read "10.25" as strong or weak. On its own the size of a covariance means nothing.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Pearson's r.</b> Covariance tells us the direction (up together), but not the strength, because its size depends on units. We need the same number with the units divided out.</div>

  <h2 id="sco-r"><span class="num">02</span>Pearson's r</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Covariance 10.25 in "hours × marks" can't be judged. How do we turn it into a unit-free number that says how strong the link is?</p>
  </div>
  <p>Divide by both standard deviations. That removes the units of x and of y at once, and the result always lies between −1 and 1.</p>
  <h3>By hand</h3>
  <ol>
    <li>sₓ = √(Σ(x − 3)²/4) = √((4 + 1 + 0 + 1 + 4)/4) = √2.5 = 1.581 hours.</li>
    <li>s_y = √((64 + 25 + 1 + 16 + 64)/4) = √(170/4) = √42.5 = 6.519 marks.</li>
    <li>r = 10.25 / (1.581 × 6.519) = 10.25 / 10.31 = <strong>0.994</strong>. Almost a perfect straight line.</li>
    <li>r² = 0.989: a straight line in hours explains 98.9% of the variation in scores.</li>
    <li>Bonus, the slope of that line: cov/var(x) = 10.25/2.5 = <strong>4.1 marks per extra hour</strong> (the least-squares slope, built in <a class="xref" data-note="ml_regression">Linear Regression</a>).</li>
  </ol>
  <p>Another way to see r: turn each value into a <strong>z-score</strong> (how many SDs from its mean, from the Descriptive note). Then r is the average product z_x × z_y (dividing by n − 1). The products are big and positive when a student is far above (or far below) average on both.</p>
  <div class="fx" data-lang="py">print("r =", round(np.corrcoef(hours, score)[0, 1], 4))
zx = (hours - hours.mean()) / hours.std(ddof=1)
zy = (score - score.mean()) / score.std(ddof=1)
print("z-products:", np.round(zx * zy, 3), " r =", round((zx * zy).sum() / (len(hours) - 1), 4))
print("r with score out of 1000:", round(np.corrcoef(hours, score * 10)[0, 1], 4))
r = np.corrcoef(hours, score)[0, 1]
print("r^2 =", round(r**2, 3), " slope = cov/var_x =", np.cov(hours, score)[0, 1] / hours.var(ddof=1))</div>
  <div class="fx" data-lang="text">r = 0.9944
z-products: [1.552 0.485 0.    0.388 1.552]  r = 0.9944
r with score out of 1000: 0.9944
r^2 = 0.989  slope = cov/var_x = 4.1</div>
  <p><code>np.corrcoef</code> gives 0.9944. The z-product line rebuilds it from scratch: students A and E contribute 1.552 each, C contributes 0. Multiplying scores by 10 leaves r unchanged: correlation has no units. The last line gives r² and the slope 4.1.</p>
  <figure class="viz"><svg viewBox="0 0 600 136" width="600"><g transform="translate(0,0)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">r = -0.9</text><g transform="translate(0,16)"><rect x="8" y="6" width="134" height="106" fill="none" stroke="currentColor" stroke-opacity=".25"/><path d="M85.8,77.9h0M82.5,61.6h0M50.9,39.1h0M83.1,71.5h0M66.9,39.8h0M63,59.2h0M103.7,69.1h0M62,62.3h0M71,65h0M86.2,71.7h0M93.2,69h0M73.4,62.4h0M70.3,48.7h0M109.3,88.2h0M95.4,76.5h0M103,81h0M74.3,60.8h0M95.7,78.5h0M91.9,83h0M64.6,59.5h0M53.2,36.1h0M119.6,92.1h0M99,77.7h0M64.2,66.1h0M78.8,64h0M48.3,47.2h0M53.6,50.7h0M78,68h0M46.5,32h0M25.5,14.8h0M60.9,41.2h0M87.8,69.7h0M43.8,37.4h0M70.8,55.8h0M60,50h0M79.5,60.7h0M68.5,60.6h0M49.2,48.8h0M94.6,84.6h0M52.3,43.9h0M90.4,80.1h0M60.6,55.9h0M105.6,78.4h0M99.3,80.8h0M72.9,60.9h0" class="sb" stroke-width="4.8" stroke-linecap="round" stroke-opacity=".75"/></g></g><g transform="translate(150,0)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">r = 0</text><g transform="translate(0,16)"><rect x="8" y="6" width="134" height="106" fill="none" stroke="currentColor" stroke-opacity=".25"/><path d="M73.8,35.5h0M63.5,81.1h0M34.2,62.6h0M67.2,54.3h0M64.7,67.4h0M59,68.1h0M78.6,65.7h0M77.2,25.6h0M85.6,86.7h0M113.5,52.9h0M54.1,43.1h0M75.4,69.8h0M60.9,76.5h0M76.1,40.2h0M67.8,51.6h0M116.7,80.3h0M80.7,64.4h0M51.5,77h0M74.7,51.4h0M63.2,58h0M91,53.8h0M94.3,50.9h0M85.8,26.9h0M88.8,56.7h0M90.8,75.2h0M67.5,45.1h0M89,31.8h0M75.2,84.7h0M118.3,39.8h0M51.5,34.8h0M75.7,90.9h0M65.7,67.9h0M110.3,72.9h0M69.4,63.9h0M66.6,75.1h0M79.9,40.1h0M88.9,75.3h0M49.5,56.9h0M59.3,70.1h0M37.7,24.7h0M95.4,76.1h0M95.2,35.4h0M21.9,68.6h0M66.4,47.6h0M72.3,63h0" class="sb" stroke-width="4.8" stroke-linecap="round" stroke-opacity=".75"/></g></g><g transform="translate(300,0)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">r = 0.5</text><g transform="translate(0,16)"><rect x="8" y="6" width="134" height="106" fill="none" stroke="currentColor" stroke-opacity=".25"/><path d="M55.5,41.8h0M39.3,96.5h0M62.9,21.2h0M100.2,49.1h0M68.9,55.3h0M50.9,71.2h0M86.2,41.3h0M49.3,46.3h0M90.1,70.5h0M79,30.4h0M108.8,69.3h0M86.2,50.2h0M63.4,86h0M53.3,62.2h0M90.5,50h0M21.8,70.8h0M54.9,69.1h0M54.7,77.6h0M86.4,65.1h0M75.8,59.8h0M23.8,102.9h0M35.9,66.7h0M65.6,45.9h0M115.8,25h0M85.1,93.1h0M85.6,32.1h0M92.1,64.7h0M88.2,58.1h0M56,66h0M87.8,60.6h0M61.3,46.5h0M61.2,58.7h0M92.2,68.1h0M81.4,42.5h0M83.1,68.5h0M104.9,33.4h0M85.4,56.9h0M78.2,51.5h0M58.6,55h0M42.3,61.4h0M63.2,74.2h0M70.6,53.8h0M74.9,49.5h0M61.7,83.6h0M95.8,21.6h0" class="sb" stroke-width="4.8" stroke-linecap="round" stroke-opacity=".75"/></g></g><g transform="translate(450,0)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">r = 0.9</text><g transform="translate(0,16)"><rect x="8" y="6" width="134" height="106" fill="none" stroke="currentColor" stroke-opacity=".25"/><path d="M71.1,56.5h0M95.2,29.4h0M59.6,72.1h0M82.1,52.5h0M80,57.2h0M93,34.9h0M75.5,58h0M84.7,69.9h0M65.2,69.3h0M80.9,53.8h0M91.9,39h0M94.6,50.6h0M92.9,43.6h0M61.8,74.1h0M102.4,29h0M92.1,36.1h0M79.6,60.8h0M86.6,46.2h0M56.7,75h0M44.1,67h0M85.2,59.9h0M104.7,46.4h0M92.4,50.9h0M101.1,34.2h0M138.1,19.5h0M26.2,89.4h0M61.4,66.2h0M34,87.2h0M79.4,65.2h0M80.2,60.6h0M93.8,49.7h0M77.6,59.5h0M62.7,79.1h0M69.4,48.8h0M68.2,55h0M43.8,73.3h0M65.9,77.1h0M82.7,55.9h0M110.8,34.3h0M110.3,44.1h0M70.7,62.8h0M94.6,51h0M88.7,51.3h0M84.1,52.2h0M82.5,50h0" class="sb" stroke-width="4.8" stroke-linecap="round" stroke-opacity=".75"/></g></g></svg><figcaption>r measures how tightly points hug a straight line: sign = direction, size = tightness.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Covariance is a height difference quoted in feet by one person and metres by another: you can't compare. r is like a percentage grade: whatever the original marks were out of, 99% means the same thing.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Pearson correlation</strong>: r = cov(x, y) / (sₓ · s_y) = (1/(n − 1)) Σ z_x z_y, always between −1 and 1, measuring how tightly points hug a <em>straight line</em>. r = ±1 only if every point lies exactly on a line. <strong>r²</strong>: the share of y's variance a straight line in x explains; r = 0.3 explains only 9%.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>r says nothing about the <em>slope</em>: a line rising 1 mark per hour and one rising 50 marks per hour can both have r = 1. A strong r with a tiny slope can be useless in practice.</p>
  </div>
  <p>Where you meet it: correlation heatmaps in every EDA notebook, dropping one of two near-duplicate features, checking whether an offline metric tracks an online one, and in portfolio risk (covariance matrices). PCA is built on the covariance matrix.</p>
  <div class="bridge"><b>What this still can't tell us → next: Is r real?</b> 0.994 looks convincing, but it comes from 5 students. With so few points, could two unrelated columns produce a large r just by luck?</div>

  <h2 id="sco-sig"><span class="num">03</span>Is r Real? The t-test for r</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>If hours and score were truly unrelated (true correlation ρ = 0), how often would 5 students show an r as large as 0.994?</p>
  </div>
  <p>The trick is the one from the <a class="xref" data-note="st_distributions">Distributions</a> note: turn r into a statistic with a known sampling distribution. If the true correlation is 0 and the data are roughly normal, then t = r√(n − 2)/√(1 − r²) follows a <strong>t-distribution with n − 2 degrees of freedom</strong> (two used up: one for each mean).</p>
  <h3>By hand</h3>
  <p>t = 0.994 × √3 / √(1 − 0.989) = 0.994 × 1.732 / √0.011 = 1.722/0.105 ≈ 16.3 on 3 df. The t(3) curve puts 95% of its area within ±3.18; 16.3 is far outside, so luck alone almost never gives this. The two-sided p-value is 0.0005: if hours and score were unrelated, only 5 in 10,000 groups of 5 students would show |r| this large.</p>
  <div class="fx" data-lang="py">n = len(hours)
t = r * np.sqrt(n - 2) / np.sqrt(1 - r**2)
print(f"t = {t:.2f} on {n-2} df, two-sided p = {2 * stats.t.sf(abs(t), n - 2):.5f}")
res = stats.pearsonr(hours, score)
print(f"pearsonr: r={res.statistic:.4f} p={res.pvalue:.5f}")
ci = res.confidence_interval(0.95)
print(f"95% CI for r: {ci.low:.3f} to {ci.high:.3f}")
rng = np.random.default_rng(3)
fake = [abs(np.corrcoef(rng.normal(size=5), rng.normal(size=5))[0, 1]) for _ in range(10000)]
print("pure noise, n=5: share with |r| &gt; 0.8 =", np.mean(np.array(fake) &gt; 0.8))</div>
  <div class="fx" data-lang="text">t = 16.29 on 3 df, two-sided p = 0.00050
pearsonr: r=0.9944 p=0.00050
95% CI for r: 0.914 to 1.000
pure noise, n=5: share with |r| &gt; 0.8 = 0.0984</div>
  <p>The formula and <code>pearsonr</code> agree (t = 16.29, p = 0.0005). <code>confidence_interval</code> gives a 95% range for the true correlation, 0.914 to 1.000 (built with Fisher's z-transform, which makes r roughly normal). The last line is the warning: generating 10,000 groups of 5 <em>completely unrelated</em> pairs, |r| exceeded 0.8 in 9.8% of them. With tiny samples, big correlations come cheap; that is why the t-test is needed.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two strangers who both like chai, cricket and old Hindi songs: with only three questions, matching on all three is quite likely by chance. Match on 300 questions and it's no coincidence. r on 5 points is a three-question match.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Test for a correlation</strong>: H₀: ρ = 0. Statistic t = r√(n − 2)/√(1 − r²) ~ t(n − 2) under H₀ (bivariate normal data). The p-value is the probability, if H₀ were true, of a |t| at least this large. The full logic (null hypothesis, p-value, errors) is the subject of the next note.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Significance is not strength. With n = 10,000, r = 0.05 is "significant" (p &lt; 0.001) but explains 0.25% of the variance. Report r (or r²) and its CI, not just p.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Spearman &amp; Kendall.</b> The test assumes a straight-line relation on raw values. Real data has curves (diminishing returns from studying) and errors (a typed "50" hours). Does r survive those?</div>

  <h2 id="sco-ps"><span class="num">04</span>Spearman &amp; Kendall: Correlation on Ranks</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Pearson uses raw values and only sees straight lines. What if the relationship always rises but curves, or one value is a typo? We need a measure that only asks "do they rise together in order?"</p>
  </div>
  <p>The idea: replace each value by its <strong>rank</strong> (1st smallest, 2nd smallest...), then compute Pearson on the ranks. Ranks only care about order, so any always-increasing curve becomes a perfect straight line of ranks, and an outlier can only be "rank n", not "a million".</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two judges score a Diwali rangoli contest. One gives marks out of 10, another out of 100 and is very generous at the top. Their raw marks look different, but if both put the same entries 1st, 2nd and 3rd, they agree completely. Spearman asks "do they agree on the order?", not "do they agree on the marks?".</p>
  </div>
  <h3>Spearman and Kendall by hand: mock test vs final</h3>
  <p>Mock scores 40, 58, 50, 66, 70 have ranks 1, 3, 2, 4, 5. Final scores 52, 55, 61, 64, 68 have ranks 1, 2, 3, 4, 5. Only B and C swap order.</p>
  <ol>
    <li><strong>Spearman</strong>: rank differences d = 0, 1, −1, 0, 0; Σd² = 2. With n = 5: ρ = 1 − 6Σd² / (n(n² − 1)) = 1 − 12/120 = <strong>0.9</strong>. (This shortcut is exact when there are no ties.)</li>
    <li><strong>Kendall</strong>: look at all C(5, 2) = 10 pairs of students. A pair is <em>concordant</em> if the one with the higher mock also has the higher final, <em>discordant</em> otherwise. Only (B, C) is discordant (B's mock 58 &gt; C's 50, but B's final 55 &lt; C's 61). So 9 concordant, 1 discordant: τ = (9 − 1)/10 = <strong>0.8</strong>.</li>
  </ol>
  <div class="fx" data-lang="py">mock = df.mock.values
print("ranks of mock :", stats.rankdata(mock), " ranks of score:", stats.rankdata(score))
print("spearman:", round(stats.spearmanr(mock, score).statistic, 3))
print("kendall :", round(stats.kendalltau(mock, score).statistic, 3))
print("pearson :", round(stats.pearsonr(mock, score).statistic, 3))</div>
  <div class="fx" data-lang="text">ranks of mock : [1. 3. 2. 4. 5.]  ranks of score: [1. 2. 3. 4. 5.]
spearman: 0.9
kendall : 0.8
pearson : 0.834</div>
  <p>scipy matches both hand values. Pearson (0.834) differs because it also uses the sizes: B's mock of 58 is far above C's 50 while B's final is below.</p>
  <h3>A typo and a curve</h3>
  <p>Now the two failure cases. First, a sixth student F studied 5.0 hours but the teacher typed "50"; F scored 66. Second, the same idea at scale: 20 students where extra hours help less and less (score = 100 − 60e^−hours/2), a curve that always rises.</p>
  <div class="fx" data-lang="py">h6 = np.append(hours, 50); s6 = np.append(score, 66)   # student F: "5.0" typed as "50"
print("with typo  pearson=%.3f spearman=%.3f" % (stats.pearsonr(h6, s6)[0], stats.spearmanr(h6, s6)[0]))
h = np.arange(1, 21) / 2                                 # 20 students, 0.5 to 10 hours
s = 100 - 60 * np.exp(-h / 2)                            # diminishing returns, always rising
print("curve      pearson=%.3f spearman=%.3f" % (stats.pearsonr(h, s)[0], stats.spearmanr(h, s)[0]))</div>
  <div class="fx" data-lang="text">with typo  pearson=0.454 spearman=0.943
curve      pearson=0.860 spearman=1.000</div>
  <p>One typo collapses Pearson from 0.994 to 0.454: the point at 50 hours sits far to the right with an ordinary score, so the "line" now looks flat. Spearman only drops to 0.943, because 50 is just "rank 6", one place above E. On the curve, Spearman is exactly 1 (the order never breaks) while Pearson under-reports at 0.86.</p>
  <figure class="viz"><svg viewBox="0 0 600 160" width="600"><g transform="translate(0,0)"><text x="145.0" y="13" text-anchor="middle" font-weight="bold" font-size="11">20 students, diminishing returns: P .86 · S 1.00</text><g transform="translate(0,20)"><rect x="8" y="4" width="274" height="130" fill="none" stroke="currentColor" stroke-opacity=".3"/><circle cx="26.5" cy="101.9" r="4" class="fb sb"/><circle cx="39.0" cy="81.6" r="4" class="fb sb"/><circle cx="51.4" cy="65.7" r="4" class="fb sb"/><circle cx="63.9" cy="53.4" r="4" class="fb sb"/><circle cx="76.4" cy="43.8" r="4" class="fb sb"/><circle cx="88.9" cy="36.3" r="4" class="fb sb"/><circle cx="101.3" cy="30.5" r="4" class="fb sb"/><circle cx="113.8" cy="26.0" r="4" class="fb sb"/><circle cx="126.3" cy="22.4" r="4" class="fb sb"/><circle cx="138.8" cy="19.7" r="4" class="fb sb"/><circle cx="151.2" cy="17.5" r="4" class="fb sb"/><circle cx="163.7" cy="15.9" r="4" class="fb sb"/><circle cx="176.2" cy="14.6" r="4" class="fb sb"/><circle cx="188.7" cy="13.6" r="4" class="fb sb"/><circle cx="201.1" cy="12.8" r="4" class="fb sb"/><circle cx="213.6" cy="12.2" r="4" class="fb sb"/><circle cx="226.1" cy="11.7" r="4" class="fb sb"/><circle cx="238.6" cy="11.3" r="4" class="fb sb"/><circle cx="251.0" cy="11.0" r="4" class="fb sb"/><circle cx="263.5" cy="10.8" r="4" class="fb sb"/></g></g><g transform="translate(305,0)"><text x="145.0" y="13" text-anchor="middle" font-weight="bold" font-size="11">our 5 + F typed as 50 h: P .45 · S .94</text><g transform="translate(0,20)"><rect x="8" y="4" width="274" height="130" fill="none" stroke="currentColor" stroke-opacity=".3"/><circle cx="19.0" cy="116.2" r="4" class="fb sb"/><circle cx="24.1" cy="98.5" r="4" class="fb sb"/><circle cx="29.1" cy="63.1" r="4" class="fb sb"/><circle cx="34.2" cy="45.4" r="4" class="fb sb"/><circle cx="39.2" cy="21.8" r="4" class="fb sb"/><circle cx="265.9" cy="33.6" r="4" class="fr sr"/></g></g></svg><figcaption>Left: always rising but curved, so Spearman (S) = 1 while Pearson (P) under-reports. Right: one typo (red) drags Pearson from 0.99 to 0.45; Spearman barely notices, because F is just "rank 6" in hours.</figcaption></figure>
  <div class="cards">
    <div><b>Pearson</b><p>Linear relationship on raw values.</p><small>Sensitive to outliers and curves</small></div>
    <div><b>Spearman</b><p>Pearson on the <em>ranks</em>: any monotonic (always up or always down) relation.</p><small>Robust to outliers, skew; fine for ratings</small></div>
    <div><b>Kendall τ</b><p>Share of agreeing minus disagreeing pairs.</p><small>Small samples, many ties; easy to explain</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Monotonic</strong>: always moves in one direction (never turns back). <strong>Spearman's ρ</strong> (rho): Pearson computed on ranks; without ties ρ = 1 − 6Σdᵢ²/(n(n² − 1)). <strong>Kendall's τ</strong> (tau): (concordant − discordant pairs) / total pairs.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>When Pearson and Spearman disagree a lot, don't just pick the one you like: the disagreement is the finding. It means a curve or an outlier; look at the data.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Blind spots.</b> Ranks fix curves and typos as long as the relation goes one way. What about a relation that rises then falls? And can any single number be trusted to describe a scatter plot?</div>

  <h2 id="sco-anscombe"><span class="num">05</span>Blind Spots: r = 0 and Anscombe's Quartet</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>If r (or ρ) is near 0, are the variables unrelated? And if two datasets have the same r, do they have the same relationship?</p>
  </div>
  <h3>r = 0 does not mean unrelated</h3>
  <p>Look at stress against score. Sorted by stress: 1 → 52 (A), 2 → 64 (D), 3 → 68 (E), 4 → 61 (C), 5 → 55 (B). Scores rise up to moderate stress, then fall: a clear peak at 3. By hand: stress deviations from 3 are −2, 2, 1, −1, 0 for A–E; score deviations −8, −5, 1, 4, 8; products 16, −10, 1, −4, 0; sum 3. r = 3/√(10 × 170) = 3/41.2 = <strong>0.07</strong>. The rising half and the falling half cancel.</p>
  <p>In practice you compute every pair at once on a DataFrame: <code>df.corr()</code> gives the <strong>correlation matrix</strong>; <code>method="spearman"</code> switches to ranks.</p>
  <div class="fx" data-lang="py">print(df.corr().round(2) + 0.0)          # + 0.0 turns -0.0 into 0.0
print(df.corr(method="spearman")["score"].round(2).to_dict())
st = df.stress.values
print("stress vs score: r =", round(np.corrcoef(st, score)[0, 1], 3))
print(df.groupby("stress").score.mean().to_dict())</div>
  <div class="fx" data-lang="text">        hours  score  phone  mock  stress  tests
hours    1.00   0.99  -0.96  0.89    0.10   0.96
score    0.99   1.00  -0.93  0.83    0.07   0.93
phone   -0.96  -0.93   1.00 -0.94    0.00  -0.99
mock     0.89   0.83  -0.94  1.00    0.26   0.95
stress   0.10   0.07   0.00  0.26    1.00   0.00
tests    0.96   0.93  -0.99  0.95    0.00   1.00
{'hours': 1.0, 'score': 1.0, 'phone': -0.97, 'mock': 0.9, 'stress': 0.1, 'tests': 0.97}
stress vs score: r = 0.073
{1: 52.0, 2: 64.0, 3: 68.0, 4: 61.0, 5: 55.0}</div>
  <p>The matrix is symmetric with 1s on the diagonal (each column with itself). Hours–score 0.99; phone strongly <em>negative</em> with score (−0.93). Hours and tests are 0.96, near copies (section 08). Stress–score is 0.07, yet the group means show the clear rise-and-fall. Spearman also misses it (0.1): it is not monotonic.</p>
  <h3>Anscombe's quartet</h3>
  <p>Busy analysts often report a table of summaries (mean, variance, correlation, regression line) and never draw the data. Francis Anscombe built four small datasets in 1973 that match on every common summary to two decimals, yet look nothing alike when plotted. One is a clean line, one a curve, one a line with a single outlier, and one is a vertical column plus one far point that alone creates the slope.</p>
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
    <p><strong>Independence</strong> means knowing x tells you nothing about y; r = 0 only means no <em>linear</em> association. Independent ⇒ r = 0, but r = 0 ⇏ independent. <strong>Outlier</strong>: a point far from the pattern in y. <strong>Leverage point</strong>: a point far from the others in x, which can pull a fitted line toward itself (dataset IV, our typo student F).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Summary statistics compress; plots reveal. Before reporting a correlation, draw the scatter plot (<code>df.plot.scatter</code>, <code>sns.pairplot</code>). The modern version of this lesson is the "Datasaurus Dozen": a dinosaur and a star with the same summaries.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Correlation ≠ causation.</b> Say the plot is clean, r is strong and significant: phone hours and score, r = −0.93. The principal wants to ban phones to raise scores. Does a real, well-measured correlation mean one causes the other?</div>

  <h2 id="sco-cause"><span class="num">06</span>Correlation ≠ Causation</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Phone hours and score correlate at −0.93. If we take phones away, will scores rise? Correlation alone cannot say, because something else might drive both.</p>
  </div>
  <p>Acting on correlation as if it were cause wastes months and sometimes harms people. A product version: "users who use the wishlist spend 40% more, so push the wishlist to everyone" — that spend may not move at all. This is the most common analytics mistake, and interviewers test it with almost every case question.</p>
  <p>The idea: when A and B move together, there are four stories besides "A causes B". A hidden third thing causes both. B causes A. You only looked at a filtered group. Or it is a coincidence among many things you checked.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Cities with more fire engines at a fire have more damage. Fire engines don't cause damage; a bigger fire causes both more engines and more damage. Sending fewer engines will not reduce damage. The size of the fire is the <em>confounder</em>.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 520 140" width="520"><defs><marker id="sco-ad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><rect x="190" y="8" width="140" height="28" rx="6" class="ft st" stroke="currentColor" stroke-opacity=".5"/><text x="260" y="26" text-anchor="middle">Motivation</text><rect x="20" y="100" width="140" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity=".5"/><text x="90" y="118" text-anchor="middle">Phone hours</text><rect x="360" y="100" width="140" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity=".5"/><text x="430" y="118" text-anchor="middle">Exam score</text><line x1="230" y1="36" x2="110" y2="98" stroke="currentColor" marker-end="url(#sco-ad)"/><text x="150" y="62" text-anchor="end" font-size="10.5" class="tm">r = −0.84</text><line x1="290" y1="36" x2="410" y2="98" stroke="currentColor" marker-end="url(#sco-ad)"/><text x="370" y="62" font-size="10.5" class="tm">r = 0.91</text><line x1="162" y1="114" x2="358" y2="114" class="sr" stroke-dasharray="5 4"/><text x="260" y="108" text-anchor="middle" class="tr" font-size="11">r = −0.75, partial r = 0.06</text></svg><figcaption>A confounder (motivation) drives both. Taking phones away would not raise scores in this world: phone hours never enter the score formula.</figcaption></figure>
  <table class="tbl">
    <tr><th>Explanation</th><th>Students example</th><th>Product example</th></tr>
    <tr><td><strong>Confounder</strong>: Z drives both</td><td>motivation → less phone and higher score</td><td>engaged users use the wishlist and spend more</td></tr>
    <tr><td><strong>Reverse causation</strong></td><td>a bad mock result → stress → more phone to escape</td><td>"users who contact support churn more": unhappy users contact support</td></tr>
    <tr><td><strong>Selection bias</strong></td><td>only students who stayed till the final were recorded</td><td>only surveyed customers who stayed</td></tr>
    <tr><td><strong>Coincidence</strong></td><td>check 15 pairs of columns, one correlates by luck</td><td>test enough metrics and some correlate by chance</td></tr>
  </table>
  <h3>"Controlling for" a confounder, step by step</h3>
  <p>Five students can't separate motivation from phone use, so take the same idea at scale: 300 simulated students where motivation lowers phone use and raises scores, and phone use has <em>no</em> effect on score. To ask "do phone and score move together <em>among equally motivated students</em>?":</p>
  <ol>
    <li>Predict phone hours from motivation with a straight line. Keep the leftover (the <strong>residual</strong>): the part motivation does not explain.</li>
    <li>Do the same for score.</li>
    <li>Correlate the two leftovers. That is the <strong>partial correlation</strong>.</li>
  </ol>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
motiv = rng.normal(0, 1, 300)                           # hidden: how motivated each student is
phone = 4 - 1.2 * motiv + rng.normal(0, 0.8, 300)       # motivation -&gt; less phone
exam = 60 + 8 * motiv + rng.normal(0, 4, 300)           # motivation -&gt; higher score (phone plays no part)
print("corr(phone, score):", round(np.corrcoef(phone, exam)[0, 1], 3))
res_ = lambda v: v - np.polyval(np.polyfit(motiv, v, 1), motiv)   # remove motivation's straight-line effect
print("partial corr | motivation:", round(np.corrcoef(res_(phone), res_(exam))[0, 1], 3))
R = np.corrcoef([phone, exam, motiv])
rxy, rxz, ryz = R[0, 1], R[0, 2], R[1, 2]
print("r(phone,motiv)=%.3f r(score,motiv)=%.3f" % (rxz, ryz))
print("formula:", round((rxy - rxz * ryz) / np.sqrt((1 - rxz**2) * (1 - ryz**2)), 3))</div>
  <div class="fx" data-lang="text">corr(phone, score): -0.751
partial corr | motivation: 0.056
r(phone,motiv)=-0.836 r(score,motiv)=0.914
formula: 0.056</div>
  <p>In the code, <code>exam</code> never uses <code>phone</code>; only <code>motiv</code> feeds both. Still the raw correlation is −0.751. <code>np.polyfit(motiv, v, 1)</code> fits the straight line and <code>res_</code> subtracts it. Correlating residuals gives 0.056: nothing left. There is also a formula using only three ordinary correlations: r_xy·z = (r_xy − r_xz·r_yz)/√((1 − r_xz²)(1 − r_yz²)). By hand: numerator −0.751 − (−0.836 × 0.914) = −0.751 + 0.764 = 0.013; denominator √((1 − 0.699)(1 − 0.835)) = √(0.301 × 0.165) = 0.223; result ≈ 0.06. Same answer.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Confounder</strong>: a variable that causes both X and Y, creating a correlation without X causing Y. <strong>Partial correlation</strong>: the correlation of X and Y after removing the linear effect of Z from both. <strong>Causation</strong> is shown by a <strong>randomised experiment</strong> (random assignment breaks every confounder, measured or not), or, when you cannot randomise, by causal methods such as difference-in-differences, instrumental variables or matching.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Controlling only removes confounders you measured, and only their <em>linear</em> effect. An unmeasured confounder (motivation is rarely in the data!) still fools you. That is why experiments are the gold standard; see <a class="xref" data-note="st_abtesting">A/B Testing</a>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Simpson's paradox.</b> A confounder can create a correlation out of nothing. Can it do worse, and flip a real effect so that the better option looks worse?</div>

  <h2 id="sco-simpson"><span class="num">07</span>Simpson's Paradox</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>If treatment A beats B inside every group, must A also beat B when the groups are added together?</p>
  </div>
  <p>A dashboard shows overall conversion fell after a launch. The team panics. But when you split by country, conversion <em>rose</em> in every single country. Both statements are true at once. If you only look at the pooled number, you will kill a good feature; if you only look at one segment, you might ship a bad one.</p>
  <p>The idea: an overall rate is a <strong>weighted average</strong> of the group rates, and the weights are "how much of each group you have". If two options got very different mixes of easy and hard cases, the overall rates compare the mixes, not the options. The case mix is a confounder, exactly as motivation was in section 06.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two coaching institutes. Institute A takes mostly weak students and gets more of them through than other institutes would. Institute B takes mostly toppers. B's overall pass rate is higher, yet for weak students A does better and for toppers A also does better. B's "win" comes from whom it admits, not how it teaches.</p>
  </div>
  <h3>Real data: kidney-stone treatments (Charig et al., 1986)</h3>
  <p>Our five students are too few to show the flip, so here is the most famous real case.</p>
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
  <div class="fx" data-lang="py">ks = pd.DataFrame({"treat": ["A", "A", "B", "B"], "size": ["small", "large"] * 2,
                   "ok": [81, 192, 234, 55], "n": [87, 263, 270, 80]})
by = ks.assign(rate=(ks.ok / ks.n).round(3)).pivot(index="size", columns="treat", values="rate")
print(by)
tot = ks.groupby("treat")[["ok", "n"]].sum()
print((tot.ok / tot.n).round(3).to_dict())
print(ks.pivot(index="size", columns="treat", values="n"))</div>
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
  <div class="bridge"><b>What this still can't tell us → next: Multicollinearity.</b> So far correlation was something to interpret. In a model it causes a different problem: when two <em>input</em> features are strongly correlated (hours and practice tests), how does the model decide which one gets the credit?</div>

  <h2 id="sco-vif"><span class="num">08</span>Multicollinearity &amp; VIF</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A score model uses both hours studied and practice tests taken. Students who study more take more tests. Can the model still tell us how much one extra test adds?</p>
  </div>
  <p>The idea: when two features move together, the model cannot tell which one deserves the credit. Many different splits of credit fit the data almost equally well, so the coefficient it picks is shaky, and its standard error is large. Prediction is fine; explanation ("what drives scores?") breaks.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two friends always cook together. The dal is excellent. Who should get the credit? You cannot tell, because you have never seen either cook alone. Any split, 50-50 or 90-10, matches what you saw.</p>
  </div>
  <div class="flow"><span>Features highly correlated</span><span>Model can't tell who gets credit</span><span>Unstable, huge-SE coefficients</span></div>
  <h3>VIF by hand on our five students</h3>
  <ol>
    <li>Take one feature, practice tests: 2, 4, 4, 8, 9 (mean 5.4). Deviations −3.4, −1.4, −1.4, 2.6, 3.6; with hours' deviations −2, −1, 0, 1, 2 the products are 6.8, 1.4, 0, 2.6, 7.2, sum 18.</li>
    <li>r(hours, tests) = 18/√(10 × 35.2) = 18/18.76 = 0.959.</li>
    <li>Predict tests from the other features. With only one other feature, R² = r² = 0.920: hours explain 92% of the variation in tests.</li>
    <li>VIF = 1/(1 − R²) = 1/0.080 = <strong>12.6</strong>. The tests coefficient's variance is 12.6 times bigger than it would be with unrelated features; its SE is √12.6 ≈ 3.5 times bigger.</li>
  </ol>
  <div class="fx" data-lang="py">r_ht = np.corrcoef(df.hours, df.tests)[0, 1]
print(f"r(hours, tests) = {r_ht:.3f}   VIF = 1/(1 - r^2) = {1 / (1 - r_ht**2):.1f}")</div>
  <div class="fx" data-lang="text">r(hours, tests) = 0.959   VIF = 1/(1 - r^2) = 12.6</div>
  <p>Now the consequence, at scale: 200 simulated students where tests ≈ 2 × hours plus a little noise, sleep is unrelated, and the true effect of one extra test is +1 mark.</p>
  <div class="fx" data-lang="py">from statsmodels.stats.outliers_influence import variance_inflation_factor
from statsmodels.tools import add_constant
import statsmodels.api as sm
rng = np.random.default_rng(1)
hrs = rng.normal(4, 1.5, 200)                       # 200 students
tst = 2 * hrs + rng.normal(0, 0.8, 200)             # practice tests: nearly a copy of hours
slp = rng.normal(7, 1, 200)                         # sleep: unrelated
X = add_constant(pd.DataFrame({"hours": hrs, "tests": tst, "sleep": slp}))
for i, col in enumerate(X.columns[1:], start=1):
    print(f"{col:6s} VIF = {variance_inflation_factor(X.values, i):.1f}")
exam = 40 + 3 * hrs + 1 * tst + 0.5 * slp + rng.normal(0, 4, 200)   # true effect of one test: +1
for cols in [["tests", "sleep"], ["hours", "tests", "sleep"]]:
    m = sm.OLS(exam, add_constant(X[cols])).fit()
    print(f"{'+'.join(cols):17s} tests coef={m.params['tests']:5.2f}  SE={m.bse['tests']:.2f}  R2={m.rsquared:.3f}")</div>
  <div class="fx" data-lang="text">hours  VIF = 17.2
tests  VIF = 17.0
sleep  VIF = 1.1
tests+sleep       tests coef= 2.27  SE=0.11  R2=0.700
hours+tests+sleep tests coef= 1.26  SE=0.44  R2=0.709</div>
  <p><code>add_constant</code> adds the intercept column (VIF needs it, which is why the loop starts at index 1). Hours and tests have VIF ≈ 17; sleep 1.1, no overlap. Without hours in the model, tests soak up hours' effect and claim 2.27 marks per test. With hours, the estimate is 1.26 (closer to the true 1) but the SE quadruples from 0.11 to 0.44. Meanwhile R² barely moves (0.700 → 0.709): predictions are fine either way.</p>
  <table class="tbl">
    <tr><th>VIF</th><th>Meaning</th><th>Action</th></tr>
    <tr><td>1</td><td>No collinearity</td><td>none</td></tr>
    <tr><td>5–10</td><td>Moderate to high</td><td>watch if you interpret coefficients</td></tr>
    <tr><td>&gt; 10</td><td>Severe</td><td>drop/merge features, PCA, or ridge regression</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Multicollinearity</strong>: two or more features are strongly linearly related. <strong>VIF</strong> (variance inflation factor) of feature j = 1/(1 − R²ⱼ), where R²ⱼ comes from regressing j on all other features. With two features, R²ⱼ = r².</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Multicollinearity hurts <em>interpretation</em>, not prediction. Don't drop useful features from a pure prediction model just because VIF is high. Tree models don't mind for accuracy, but their feature importance gets split between the copies, so each looks less important.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How it all connects.</b> We have built one number and found six ways it can mislead. How do the pieces fit together, and which question does each answer?</div>

  <h2 id="sco-connect"><span class="num">09</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Covariance, r, r², the t-test, Spearman, Kendall, Anscombe, partial r, Simpson, VIF: a list of facts, or one idea seen from several sides?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 330" width="680">
<defs><marker id="sco-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="150" height="44" rx="7" class="fb sb"/><text x="85" y="29" text-anchor="middle" font-size="11.5" font-weight="700">deviations</text><text x="85" y="45" text-anchor="middle" class="tm" font-size="10">x − x̄, y − ȳ (Descriptive)</text>
<line x1="160" y1="32" x2="193" y2="32" stroke="currentColor" marker-end="url(#sco-a9)"/>
<rect x="195" y="10" width="140" height="44" rx="7" class="fb sb"/><text x="265" y="29" text-anchor="middle" font-size="11.5" font-weight="700">covariance</text><text x="265" y="45" text-anchor="middle" class="tm" font-size="10">41/4 = 10.25 (units!)</text>
<line x1="335" y1="32" x2="368" y2="32" stroke="currentColor" marker-end="url(#sco-a9)"/><text x="352" y="24" text-anchor="middle" class="tm" font-size="9.5">÷ sₓs_y</text>
<rect x="370" y="10" width="140" height="44" rx="7" class="fg sg"/><text x="440" y="29" text-anchor="middle" font-size="11.5" font-weight="700">Pearson r</text><text x="440" y="45" text-anchor="middle" class="tm" font-size="10">0.994, unit-free</text>
<line x1="510" y1="32" x2="543" y2="32" stroke="currentColor" marker-end="url(#sco-a9)"/>
<rect x="545" y="10" width="125" height="44" rx="7" class="ft st"/><text x="607" y="29" text-anchor="middle" font-size="11.5" font-weight="700">r², slope, t</text><text x="607" y="45" text-anchor="middle" class="tm" font-size="10">0.989 · 4.1 · 16.3</text>
<line x1="85" y1="54" x2="85" y2="98" stroke="currentColor" marker-end="url(#sco-a9)"/><text x="92" y="80" class="tm" font-size="9.5">replace by ranks</text>
<rect x="10" y="100" width="150" height="44" rx="7" class="ft st"/><text x="85" y="119" text-anchor="middle" font-size="11.5" font-weight="700">Spearman · Kendall</text><text x="85" y="135" text-anchor="middle" class="tm" font-size="10">mock: ρ 0.9, τ 0.8</text>
<line x1="440" y1="54" x2="440" y2="98" stroke="currentColor" marker-end="url(#sco-a9)"/><text x="447" y="80" class="tm" font-size="9.5">only straight lines…</text>
<rect x="360" y="100" width="160" height="44" rx="7" class="fr sr"/><text x="440" y="119" text-anchor="middle" font-size="11.5" font-weight="700">blind spots</text><text x="440" y="135" text-anchor="middle" class="tm" font-size="10">stress r 0.07 · typo 0.45</text>
<line x1="160" y1="122" x2="358" y2="122" stroke="currentColor" stroke-opacity=".5" stroke-dasharray="4 3"/><text x="258" y="116" text-anchor="middle" class="tm" font-size="9.5">robust to typo: 0.94</text>
<line x1="520" y1="122" x2="555" y2="122" stroke="currentColor" marker-end="url(#sco-a9)"/>
<rect x="557" y="100" width="113" height="44" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="613" y="119" text-anchor="middle" font-size="11.5" font-weight="700">plot (Anscombe)</text><text x="613" y="135" text-anchor="middle" class="tm" font-size="10">4 sets, r 0.816</text>
<line x1="440" y1="144" x2="440" y2="188" stroke="currentColor" marker-end="url(#sco-a9)"/><text x="447" y="170" class="tm" font-size="9.5">add a third variable Z</text>
<rect x="340" y="190" width="200" height="44" rx="7" class="fr sr"/><text x="440" y="209" text-anchor="middle" font-size="11.5" font-weight="700">confounder → partial r</text><text x="440" y="225" text-anchor="middle" class="tm" font-size="10">phone: −0.75 → 0.06</text>
<line x1="340" y1="212" x2="265" y2="212" stroke="currentColor" marker-end="url(#sco-a9)"/><text x="302" y="204" text-anchor="middle" class="tm" font-size="9.5">Z = group</text>
<rect x="105" y="190" width="158" height="44" rx="7" class="fr sr"/><text x="184" y="209" text-anchor="middle" font-size="11.5" font-weight="700">Simpson's paradox</text><text x="184" y="225" text-anchor="middle" class="tm" font-size="10">A wins both, loses pooled</text>
<line x1="540" y1="212" x2="573" y2="212" stroke="currentColor" marker-end="url(#sco-a9)"/><text x="557" y="204" text-anchor="middle" class="tm" font-size="9.5">X, Z both features</text>
<rect x="575" y="190" width="95" height="44" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="622" y="209" text-anchor="middle" font-size="11.5" font-weight="700">VIF</text><text x="622" y="225" text-anchor="middle" class="tm" font-size="10">1/(1 − r²) = 12.6</text>
<line x1="440" y1="234" x2="440" y2="270" stroke="currentColor" marker-end="url(#sco-a9)"/>
<rect x="180" y="272" width="490" height="44" rx="7" class="fg sg"/><text x="425" y="291" text-anchor="middle" font-size="11.5" font-weight="700">is it causal? is it real? → randomised experiment, hypothesis test</text><text x="425" y="307" text-anchor="middle" class="tm" font-size="10">next notes: Hypothesis Testing, A/B Testing</text>
</svg><figcaption>Top row: one chain of construction, deviations → covariance → r → r², slope and its t-statistic. Second row: what r cannot see, and the fixes (ranks, plots). Third row: what a third variable does to r. Last: the two questions r never answers, which the next notes take up.</figcaption></figure>
  <table class="tbl"><caption>Every concept on students A–E</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers</th><th>Our students</th><th>Sensitive to</th><th>Use when</th></tr>
    <tr><td>Covariance</td><td>mean of deviation products</td><td>direction of joint movement</td><td>10.25</td><td>units</td><td>inside formulas (PCA, portfolio)</td></tr>
    <tr><td>Pearson r</td><td>cov / (sₓ s_y); mean z-product</td><td>strength of a straight-line link</td><td>0.994</td><td>outliers, curves</td><td>linear, clean numeric data</td></tr>
    <tr><td>r², slope</td><td>r squared; cov/var(x)</td><td>share explained; change per unit</td><td>0.989; 4.1 marks/hour</td><td>same as r</td><td>explaining effect size</td></tr>
    <tr><td>t-test for r</td><td>r, n and the t-distribution</td><td>real or luck?</td><td>t 16.3, p 0.0005</td><td>n (big n: tiny r significant)</td><td>small samples</td></tr>
    <tr><td>Spearman ρ</td><td>Pearson on ranks</td><td>monotonic link?</td><td>mock 0.9; typo case 0.94</td><td>robust</td><td>curves, outliers, ratings</td></tr>
    <tr><td>Kendall τ</td><td>concordant − discordant pairs</td><td>share of agreeing pairs</td><td>mock 0.8</td><td>robust</td><td>small n, ties</td></tr>
    <tr><td>r = 0 blind spot</td><td>cancelling halves</td><td>is r = 0 "unrelated"?</td><td>stress 0.07, peak at 3</td><td>—</td><td>always plot</td></tr>
    <tr><td>Anscombe</td><td>same summaries, different shapes</td><td>can summaries be trusted?</td><td>(4 sets, r 0.816)</td><td>—</td><td>always plot</td></tr>
    <tr><td>Partial r</td><td>r of residuals after Z</td><td>link once Z is held fixed?</td><td>phone −0.75 → 0.06 (300 students)</td><td>unmeasured Z</td><td>suspected confounder</td></tr>
    <tr><td>Simpson</td><td>weighted averages with different weights</td><td>can pooling flip a trend?</td><td>(kidney: 78% vs 83%)</td><td>case mix</td><td>comparing rates across groups</td></tr>
    <tr><td>VIF</td><td>1/(1 − R²) of a feature on the rest</td><td>are features copies?</td><td>hours–tests 12.6</td><td>—</td><td>interpreting coefficients</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>r is the average product of z-scores, a measure of straight-line co-movement and nothing more.</strong> It does not see curves (use ranks), shapes (plot), luck (test it), causes (find confounders, run experiments) or which of two copies matters (VIF).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common mistakes.</b> The traps in one place.</div>

  <h2 id="sco-traps"><span class="num">10</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which misuses of correlation turn up most often in reports and interviews?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reading causation into r</span>
    <p>"Feature X users retain better, so X causes retention." Check confounders (engaged users do everything more), reverse causation, and selection. Only an experiment settles it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: r = 0 means unrelated</span>
    <p>r measures straight-line relation only. Stress vs score gave r = 0.07 with a clear peak. U-shapes, cycles and thresholds all hide from r. Plot first.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: one outlier driving r</span>
    <p>One typo moved our r from 0.99 to 0.45. Compare Pearson with Spearman; if they disagree a lot, look for outliers or curves.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: confusing significance with strength</span>
    <p>With n = 10,000, r = 0.05 is "significant" (p &lt; 0.001) but explains 0.25% of the variance. Report r (or r²) and its CI, not just p.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: trusting big r on tiny n</span>
    <p>Pure noise gave |r| &gt; 0.8 in 10% of 5-point samples. Always report n and a CI.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: comparing covariances</span>
    <p>Covariance changes with units (615 in minutes vs 10.25 in hours). Use correlation to compare strength across pairs.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: dropping features for prediction because of VIF</span>
    <p>High VIF makes coefficients unreliable, not predictions. Only act on VIF when you need to interpret coefficients; otherwise ridge regularisation is usually enough.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: pooling groups blindly</span>
    <p>A pooled rate mixes treatment effect with case mix (Simpson). Check whether group sizes differ between the things you compare.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Revision.</b> The whole note condensed onto one sheet.</div>

  <h2 id="sco-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: five students A–E with hours 1, 2, 3, 4, 5; score 52, 55, 61, 64, 68; phone 6, 5, 5, 3, 2; mock 40, 58, 50, 66, 70; stress 1, 5, 4, 2, 3; practice tests 2, 4, 4, 8, 9.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>Our answer</th><th>Weakness → next</th></tr>
    <tr><td>Covariance</td><td>do they move together?</td><td>41/4 = 10.25</td><td>depends on units</td></tr>
    <tr><td>Pearson r</td><td>how strong, unit-free?</td><td>0.994; r² 0.989; slope 4.1</td><td>only 5 students</td></tr>
    <tr><td>t-test for r</td><td>real or luck?</td><td>t 16.3, p 0.0005, CI 0.914–1</td><td>straight lines, raw values only</td></tr>
    <tr><td>Spearman, Kendall</td><td>monotonic link? robust to typos?</td><td>ρ 0.9, τ 0.8; typo: P 0.45 vs S 0.94</td><td>miss up-then-down shapes</td></tr>
    <tr><td>Blind spots</td><td>r = 0 → unrelated? same r → same shape?</td><td>stress r 0.07 with a peak; Anscombe r 0.816 ×4</td><td>real r may not be causal</td></tr>
    <tr><td>Confounder, partial r</td><td>does X cause Y?</td><td>phone −0.75 → 0.06 given motivation</td><td>confounders can flip trends</td></tr>
    <tr><td>Simpson</td><td>can pooling reverse a trend?</td><td>A wins both groups, loses 78% vs 83%</td><td>correlated features in models</td></tr>
    <tr><td>VIF</td><td>are features copies?</td><td>r 0.959 → VIF 12.6</td><td>"real or luck" in general → next note</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>Covariance</td><td>Σ(xᵢ − x̄)(yᵢ − ȳ)/(n − 1)</td><td>x̄, ȳ means; n pairs</td></tr>
    <tr><td>Pearson r</td><td>cov/(sₓ s_y) = Σ z_x z_y/(n − 1)</td><td>s sample sd; z = (value − mean)/s</td></tr>
    <tr><td>Slope of the line</td><td>b = cov/sₓ² = r·s_y/sₓ</td><td>change in y per unit x</td></tr>
    <tr><td>t for r</td><td>t = r√(n − 2)/√(1 − r²), df n − 2</td><td>H₀: true ρ = 0</td></tr>
    <tr><td>Spearman (no ties)</td><td>ρ = 1 − 6Σdᵢ²/(n(n² − 1))</td><td>dᵢ rank difference</td></tr>
    <tr><td>Kendall</td><td>τ = (C − D)/(n(n − 1)/2)</td><td>C concordant, D discordant pairs</td></tr>
    <tr><td>Partial r</td><td>(r_xy − r_xz r_yz)/√((1 − r_xz²)(1 − r_yz²))</td><td>Z the controlled variable</td></tr>
    <tr><td>Pooled rate</td><td>Σ (share of group g) × (rate in g)</td><td>weights = case mix</td></tr>
    <tr><td>VIF</td><td>1/(1 − R²ⱼ)</td><td>R²ⱼ from regressing feature j on the others</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Pearson</b><p>Two numeric columns, roughly linear, no wild outliers; when you want r² and a slope.</p><small>Not for curves, ranks, heavy outliers</small></div>
    <div><b>Spearman / Kendall</b><p>Monotonic curves, ratings, skewed data, suspected typos; Kendall for small n with ties.</p><small>Not for U-shapes</small></div>
    <div><b>Partial r / segmenting</b><p>When a third variable plausibly drives both, or groups differ in mix.</p><small>Only handles measured confounders</small></div>
    <div><b>VIF</b><p>Before interpreting regression coefficients.</p><small>Ignore for pure prediction</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Causation from correlation; r = 0 read as "unrelated"; one outlier driving r; significance mistaken for strength; big r on tiny n; comparing covariances; dropping collinear features from a prediction model; pooling groups with different case mix.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Deviation products sum to 41 over 5 pairs; sₓ 1.581, s_y 6.519. r?</td><td>cov 10.25; r = 10.25/10.31 = 0.994</td></tr>
    <tr><td>Ranks 1, 3, 2, 4, 5 vs 1, 2, 3, 4, 5: Spearman and Kendall?</td><td>ρ = 1 − 12/120 = 0.9; τ = (9 − 1)/10 = 0.8</td></tr>
    <tr><td>x = −2..2, y = x²: r?</td><td>0, though y depends completely on x</td></tr>
    <tr><td>Two features with r = 0.95: VIF?</td><td>1/(1 − 0.9025) ≈ 10.3</td></tr>
    <tr><td>A wins in every subgroup but loses pooled. Name and cause?</td><td>Simpson's paradox: different case mix (a confounder) weights the averages</td></tr>
  </table>

  <h2 id="sco-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between covariance and correlation?</summary><div class="qa-body">Covariance = Σ(x − x̄)(y − ȳ)/(n − 1): sign gives direction, but size depends on units. Correlation divides covariance by both standard deviations, so it is unit-free and lies in [−1, 1]. Study time in minutes makes our covariance 615 instead of 10.25; r stays 0.994.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute r by hand: x = [1, 2, 3, 4, 5], y = [52, 55, 61, 64, 68].</summary><div class="qa-body">Means 3 and 60. Products of deviations: 16, 5, 0, 4, 16 → sum 41, cov = 41/4 = 10.25. sₓ = √2.5 = 1.581, s_y = √42.5 = 6.519. r = 10.25 / 10.31 = 0.994.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use Spearman over Pearson?</summary><div class="qa-body">When the relation is monotonic but not linear (diminishing returns: Pearson 0.86, Spearman 1.00), data is ordinal (ratings), or there are outliers/heavy skew (a typo dropped Pearson to 0.45; Spearman stayed 0.94). Spearman ranks first, so one extreme point can't dominate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Users who use feature X retain 30% better. Can we say X causes retention?</summary><div class="qa-body">No. Engaged users both find X and stay (confounder: engagement); or retained users simply had more time to find X (reverse/time bias). Run an experiment: randomly expose X, or use matching / diff-in-diff if you can't.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "controlling for Z" mean, concretely?</summary><div class="qa-body">Remove the part of X and of Y that Z explains (regress each on Z, keep residuals), then correlate what is left. That is the partial correlation: phone vs score went from −0.75 to 0.06 once motivation was removed. In a regression, adding Z as a feature does the same for the coefficient of X. It only handles measured confounders and their modelled (often linear) effect.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain Simpson's paradox with an example.</summary><div class="qa-body">Kidney stones: treatment A wins for small stones (93% vs 87%) and large stones (73% vs 69%), yet loses overall (78% vs 83%), because 75% of A's patients had hard large stones vs 23% of B's. The pooled rate is a weighted average, and the weights (case mix) differ.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two features have correlation 0.98. What happens in linear regression? In a random forest?</summary><div class="qa-body">Linear regression: coefficients become unstable with big standard errors; signs can flip; predictions are fine. VIF ≈ 1/(1 − 0.98²) ≈ 25. Random forest: predictions fine, but feature importance gets split between the two, so each looks less important.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is VIF and how is it computed?</summary><div class="qa-body">For each feature, regress it on all other features and get R². VIF = 1/(1 − R²): how much its coefficient's variance is inflated by collinearity. Hours vs tests: r = 0.959, R² = 0.920, VIF = 12.6. Above 5–10 is a warning sign.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Predict: r between x = [−2, −1, 0, 1, 2] and y = x².</summary><div class="qa-body">0. y = [4, 1, 0, 1, 4] is perfectly determined by x but symmetric, so the linear association cancels out. Spearman is also 0 here because it's not monotonic. Our stress column is the same story (r = 0.07, peak in the middle).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>r = 0.3 with n = 10,000 and p &lt; 0.001. Strong relationship?</summary><div class="qa-body">Significant, but weak: r² = 0.09, so x explains 9% of y's variance. p reflects sample size; r reflects strength.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the point of Anscombe's quartet?</summary><div class="qa-body">Four datasets share mean, variance, correlation (0.816) and regression line, yet one is linear, one curved, one has an outlier and one is driven by a single leverage point. Never trust summary statistics without a plot.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you find correlated features quickly in pandas?</summary><div class="qa-body"><code>df.corr(method="spearman")</code>, then list pairs with |r| &gt; 0.8 from the upper triangle (<code>np.triu</code> mask). Plot as a heatmap. Follow up with VIF for groups of features.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does r need the t-distribution from the Distributions note?</summary><div class="qa-body">r is computed from a sample, so it wobbles. To ask "could ρ = 0 produce this?" we need r's sampling distribution: t = r√(n − 2)/√(1 − r²) follows t(n − 2) under H₀. Without it, r = 0.994 on 5 points and r = 0.994 on 5,000 points would look equally convincing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is Pearson's r related to z-scores and to the regression slope?</summary><div class="qa-body">r is the average product of the two z-scores (from Descriptive Statistics). The least-squares slope is b = r·s_y/sₓ = 10.25/2.5 = 4.1 marks per hour: r is the slope you get when both variables are measured in z-units.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip plotting and go straight to r?</summary><div class="qa-body">You miss curves (stress peak, r 0.07), single outliers (typo, r 0.45) and leverage points (Anscombe IV), and you report the same "r = 0.816" for four completely different relationships. Every later step (testing, controlling, modelling) inherits the wrong picture.</div></details>
</main>`
});
