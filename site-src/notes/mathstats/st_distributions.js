// notes/mathstats/st_distributions.js — Probability Distributions
Object.assign(TOPIC_CONTENT, {
  "st_distributions": `<main>
  <h1>Probability Distributions</h1>
  <div class="where"><span>Mathematics &amp; Statistics</span><span>Statistics</span><span>Probability Distributions</span></div>
  <p class="lead">A distribution is a story about how numbers are generated: one yes/no, a count of yeses, events arriving in time, a measurement built from many small effects. Pick the story that matches your data and you get correct probabilities, the right test and even the right ML loss function. This note follows one small online tea shop, LeafBox, through the whole family: how many packets an order has, whether a visitor buys, how many buy out of 100, orders per hour, the wait between orders, the weight of a packet, the value of an order, the average of 30 orders, a sample of 5 packets with unknown spread, and finally how to check which story fits.</p>

  <h2 id="sdi-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 110" width="680"><defs><marker id="sdi-trk" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs><rect x="10.0" y="20" width="100" height="56" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="60.0" y="42" text-anchor="middle" font-size="11">Descriptive</text><text x="60.0" y="58" text-anchor="middle" class="tm" font-size="9.5">summarise one column</text><line x1="110.0" y1="48" x2="120.0" y2="48" stroke="currentColor" marker-end="url(#sdi-trk)"/><rect x="122.0" y="20" width="100" height="56" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="172.0" y="42" text-anchor="middle" font-size="11">Probability</text><text x="172.0" y="58" text-anchor="middle" class="tm" font-size="9.5">quantify uncertainty</text><line x1="222.0" y1="48" x2="232.0" y2="48" stroke="currentColor" marker-end="url(#sdi-trk)"/><rect x="234.0" y="20" width="100" height="56" rx="8" class="fg sg" stroke-width="3"/><text x="284.0" y="42" text-anchor="middle" font-size="11.5" font-weight="700">Distributions</text><text x="284.0" y="58" text-anchor="middle" class="tm" font-size="9.5">named shapes of chance</text><text x="284.0" y="96" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text><line x1="334.0" y1="48" x2="344.0" y2="48" stroke="currentColor" marker-end="url(#sdi-trk)"/><rect x="346.0" y="20" width="100" height="56" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="396.0" y="42" text-anchor="middle" font-size="11">Correlation</text><text x="396.0" y="58" text-anchor="middle" class="tm" font-size="9.5">two columns together</text><line x1="446.0" y1="48" x2="456.0" y2="48" stroke="currentColor" marker-end="url(#sdi-trk)"/><rect x="458.0" y="20" width="100" height="56" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="508.0" y="42" text-anchor="middle" font-size="11">Hypothesis Testing</text><text x="508.0" y="58" text-anchor="middle" class="tm" font-size="9.5">real or luck?</text><line x1="558.0" y1="48" x2="568.0" y2="48" stroke="currentColor" marker-end="url(#sdi-trk)"/><rect x="570.0" y="20" width="100" height="56" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="620.0" y="42" text-anchor="middle" font-size="11">A/B Testing</text><text x="620.0" y="58" text-anchor="middle" class="tm" font-size="9.5">decide with an experiment</text></svg><figcaption>The Statistics track, in reading order. Each note answers a question the previous one left open.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="st_probability">Probability</a></b><span>We learnt to assign probabilities to events, to define a random variable with its expectation E[X] and variance, and saw the law of large numbers and the central limit theorem. Left open: for a real variable (orders per hour, packet weight, order value) where does the full list of probabilities come from? Writing it by hand every time is impossible.</span></li>
    <li><b>This note adds: ready-made families of distributions</b><span>A handful of named stories (Bernoulli, Binomial, Poisson, Exponential, Uniform, Normal, Log-normal) cover most real variables, each fixed by one or two knobs. Then the sampling distributions built from them (the CLT's Normal, t, χ², F) that every statistical test uses, and the QQ-plot to check which story fits.</span></li>
    <li><b>Leads to: <a class="xref" data-note="st_correlation">Correlation &amp; Relationships</a></b><span>Every distribution here describes <em>one</em> variable at a time. Real questions involve two: does a bigger discount go with bigger orders? The next note measures how two variables move together. After that, <a class="xref" data-note="st_hypothesis">Hypothesis Testing</a> uses the t, χ² and F curves from this note to decide whether a pattern is real or luck.</span></li>
  </ol>

  <h2 id="sdi-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. All numbers come from LeafBox.</p>
  <ol class="story">
    <li><b>PMF, PDF, CDF</b><span>Q: how do we write down "how the values of a variable are spread", in general? → A list (or curve) giving the probability of every value, plus its running total. Packets per order: P(1, 2, 3, 4) = 0.4, 0.3, 0.2, 0.1; CDF 0.4, 0.7, 0.9, 1. But writing every list by hand is impossible; are there standard shapes?</span></li>
    <li><b>Bernoulli</b><span>Q: what is the simplest random variable of all? → One yes/no with chance p: a visitor buys with p = 0.03; mean 0.03, variance 0.0291. But the shop has many visitors, not one…</span></li>
    <li><b>Binomial</b><span>Q: out of n independent visitors, how many buy? → C(n, k)pᵏ(1 − p)ⁿ⁻ᵏ: of 100 visitors, 3 expected, yet 5 or more happens 18% of the time. But orders also arrive by the hour with no fixed n…</span></li>
    <li><b>Poisson</b><span>Q: how many events in a time window when only the average rate is known? → λᵏe^−λ/k!: 4 orders an hour, a silent hour 1.8%, 8+ orders 5.1%. But it counts events; it does not say <em>when</em> the next one comes…</span></li>
    <li><b>Exponential (and Uniform)</b><span>Q: how long until the next order? → Exponential with mean 1/λ = 15 min; P(wait &gt; 30) = 0.135, and it has no memory. If exactly one order came in an hour, its minute is Uniform(0, 60). But these are waiting times; what about measurements like a packet's weight?</span></li>
    <li><b>Normal</b><span>Q: what shape do measurements made of many small effects take? → The bell N(μ, σ): packets N(500, 10), 68% within 490–510 g, P(&gt; 515) = 0.067. But money is positive and lopsided, not a bell…</span></li>
    <li><b>Log-normal</b><span>Q: what about values built by multiplying effects (prices, incomes)? → log(X) is Normal: order values median ₹400, mean ₹479. But most data is not any named shape; can we still use the Normal?</span></li>
    <li><b>Central limit theorem</b><span>Q: what shape do sums and averages of <em>anything</em> take? → Normal, with spread σ/√n: the average of 30 skewed orders has sd 57.7 instead of 316 and is nearly a bell. But this needs the true σ, and with 5 packets we only have an estimate s…</span></li>
    <li><b>Student's t</b><span>Q: small sample, σ unknown, how wide must the band be? → The t-curve with n − 1 df: 5 packets need ±2.776 SE, not ±1.96. But tests also ask about spreads and counts, not only means…</span></li>
    <li><b>χ² and F</b><span>Q: what curve governs a sample variance, a goodness-of-fit sum, a ratio of two variances? → χ² = sum of squared z's (packets 0.74; packet-count GOF 0.367), F = ratio of two χ²/df (machine B vs A: 4.03). But every one of these assumes a story; does it fit our data?</span></li>
    <li><b>QQ-plot &amp; Shapiro-Wilk</b><span>Q: how do we check which story fits? → Plot sorted data against the story's quantiles: order values bend (r = 0.938), their logs lie on the line (r = 0.997). With huge n the test flags trivial deviations. Then: which story to pick for a new variable?</span></li>
    <li><b>Which distribution?</b><span>Q: given a new variable, which story and which ML loss? → Match the data-generating story: yes/no → Bernoulli (log-loss), counts → Poisson (Poisson deviance), additive measurements → Normal (MSE). Next note: two variables at once.</span></li>
  </ol>

  <h2 id="sdi-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Probability Distributions</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Functions</div>
        <ul>
          <li><b>PMF</b> — P(X = k) for discrete counts: packets 0.4, 0.3, 0.2, 0.1</li>
          <li><b>PDF</b> — density; probability = area; can exceed 1</li>
          <li><b>CDF</b> — P(X ≤ x): 0.4, 0.7, 0.9, 1; <code>.sf(x)</code> = 1 − CDF</li>
          <li><b>PPF</b> — inverse CDF: <code>.ppf(0.95)</code> = 95th percentile</li>
          <li><b>E[X], Var</b> — Σk·p = 2, Σ(k − 2)²p = 1</li>
          <li>⚠ P(X = exact value) = 0 for continuous</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Counting stories</div>
        <ul>
          <li><b>Bernoulli(p)</b> — one yes/no; mean p, var p(1−p): 0.03, 0.0291</li>
          <li><b>Binomial(n, p)</b> — C(n,k)pᵏ(1−p)ⁿ⁻ᵏ; np, np(1−p)</li>
          <li>100 visitors: P(3) .2275, P(0) .0476, P(5+) .1821</li>
          <li><b>Poisson(λ)</b> — λᵏe^−λ/k!; mean = var = λ</li>
          <li>4 orders/hr: P(0) .0183, P(8+) .0511</li>
          <li>Binomial(2000, .002) ≈ Poisson(4)</li>
          <li>⚠ overdispersion (var ≫ mean) → Negative Binomial</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Waiting &amp; flat</div>
        <ul>
          <li><b>Exponential(λ)</b> — gap between Poisson events; mean 1/λ = 15 min</li>
          <li>P(&gt; t) = e^−t/15: P(&gt; 30) = .135</li>
          <li><b>Memoryless</b> — P(&gt; 40 | &gt; 10) = P(&gt; 30)</li>
          <li>⚠ scipy <code>expon(scale=1/λ)</code></li>
          <li><b>Uniform(a, b)</b> — flat; mean (a+b)/2, var (b−a)²/12: 30, 300</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Bell &amp; skewed bell</div>
        <ul>
          <li><b>Normal(μ, σ)</b> — sum of many small effects; packets N(500, 10)</li>
          <li><b>68-95-99.7</b> — 490–510, 480–520, 470–530 g</li>
          <li><b>z</b> = (x − μ)/σ: 515 g → 1.5 → P = .0668</li>
          <li><b>Log-normal</b> — log X normal; median e^μ = 400, mean e^(μ+σ²/2) = 479</li>
          <li>⚠ raw business metrics are rarely normal</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Sampling distributions</div>
        <ul>
          <li><b>CLT</b> — mean of n ≈ N(μ, σ/√n): orders 316 → 57.7, skew 2.26 → 0.4</li>
          <li><b>t(n−1)</b> — σ replaced by s; fatter tails; df 4 → ±2.776</li>
          <li><b>χ²(k)</b> — sum of k squared z's; (n−1)s²/σ² = 0.74</li>
          <li><b>GOF</b> — Σ(O − E)²/E = 0.367, p 0.95</li>
          <li><b>F</b> — ratio of two χ²/df: 74.5 / 18.5 = 4.03</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Check &amp; choose</div>
        <ul>
          <li><b>QQ-plot</b> — line = fits; banana = skew; S = tails</li>
          <li>Orders r 0.938 (bends) · log orders r 0.997 (line)</li>
          <li><b>Shapiro-Wilk</b> — H₀ normal; p .31 at n 50, .008 at n 5000</li>
          <li><b>Pick by story</b>: yes/no, count of n, count per time, wait, measurement, money</li>
          <li><b>Loss = distribution</b>: MSE↔Normal, log-loss↔Bernoulli, Poisson deviance↔Poisson</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sdi-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="sdi-shapes"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">PMF, PDF, CDF</span><span class="rm-sub">LeafBox and packets per order</span></div></div>
      <div class="rm-item rm-done" data-target="sdi-bern"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Bernoulli</span><span class="rm-sub">One visitor: buy or not</span></div></div>
      <div class="rm-item rm-done" data-target="sdi-binom"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Binomial</span><span class="rm-sub">Buyers out of n visitors</span></div></div>
      <div class="rm-item rm-done" data-target="sdi-pois"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Poisson</span><span class="rm-sub">Orders per hour</span></div></div>
      <div class="rm-item rm-done" data-target="sdi-expo"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Exponential &amp; Uniform</span><span class="rm-sub">Wait for the next order</span></div></div>
      <div class="rm-item rm-done" data-target="sdi-norm"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Normal</span><span class="rm-sub">Packet weights, z-scores</span></div></div>
      <div class="rm-item rm-done" data-target="sdi-logn"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Log-normal</span><span class="rm-sub">Order values</span></div></div>
      <div class="rm-item rm-done" data-target="sdi-clt"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Central Limit Theorem</span><span class="rm-sub">Averages of anything</span></div></div>
      <div class="rm-item rm-done" data-target="sdi-t"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Student's t</span><span class="rm-sub">Small samples, unknown σ</span></div></div>
      <div class="rm-item rm-done" data-target="sdi-chif"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">χ² and F</span><span class="rm-sub">Variances and counts</span></div></div>
      <div class="rm-item rm-done" data-target="sdi-check"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Checking the Fit</span><span class="rm-sub">QQ-plot and Shapiro-Wilk</span></div></div>
      <div class="rm-item rm-done" data-target="sdi-which"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Which Distribution?</span><span class="rm-sub">Decision table and ML losses</span></div></div>
      <div class="rm-item rm-done" data-target="sdi-connect"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">Limits, transforms, one table</span></div></div>
      <div class="rm-item rm-done" data-target="sdi-traps"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">What goes wrong in practice</span></div></div>
      <div class="rm-item rm-done" data-target="sdi-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="sdi-qa"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="sdi-shapes"><span class="num">01</span>PMF, PDF, CDF</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The Probability note gave us P(event) and E[X] for a random variable, but never a complete description of <em>all</em> its values at once. How do we write down "how a variable's values are spread", in a form that answers any question about it?</p>
  </div>
  <h3>The running example: LeafBox</h3>
  <p>LeafBox is a small online tea shop. Every number in this note is about it:</p>
  <table class="tbl">
    <tr><th>Variable</th><th>Kind</th><th>Story</th><th>Section</th></tr>
    <tr><td>packets in one order (1–4)</td><td>discrete</td><td>a hand-made list of probabilities</td><td>01</td></tr>
    <tr><td>does a visitor buy?</td><td>yes/no</td><td>Bernoulli(0.03)</td><td>02</td></tr>
    <tr><td>buyers among 100 visitors</td><td>count out of n</td><td>Binomial(100, 0.03)</td><td>03</td></tr>
    <tr><td>orders in one hour</td><td>count per window</td><td>Poisson(4)</td><td>04</td></tr>
    <tr><td>minutes until the next order</td><td>waiting time</td><td>Exponential(mean 15)</td><td>05</td></tr>
    <tr><td>weight of a tea packet (g)</td><td>measurement</td><td>Normal(500, 10)</td><td>06</td></tr>
    <tr><td>value of an order (₹)</td><td>money</td><td>Log-normal(median 400)</td><td>07</td></tr>
    <tr><td>average of 30 order values</td><td>an average</td><td>Normal by the CLT</td><td>08</td></tr>
    <tr><td>5 packets weighed, σ unknown</td><td>small sample</td><td>t, χ², F</td><td>09–10</td></tr>
  </table>
  <h3>A distribution, by hand</h3>
  <p>Start with the first row. From last month's orders, 40% had 1 packet, 30% had 2, 20% had 3, 10% had 4. That list "value → probability" is the whole distribution of X = packets per order. Everything else can be read from it:</p>
  <table class="tbl">
    <tr><th>k</th><th>PMF P(X = k)</th><th>CDF P(X ≤ k)</th><th>P(X &gt; k) = 1 − CDF</th><th>k · P</th><th>(k − 2)² · P</th></tr>
    <tr><td>1</td><td>0.4</td><td>0.4</td><td>0.6</td><td>0.4</td><td>1 × 0.4 = 0.4</td></tr>
    <tr><td>2</td><td>0.3</td><td>0.4 + 0.3 = 0.7</td><td>0.3</td><td>0.6</td><td>0</td></tr>
    <tr><td>3</td><td>0.2</td><td>0.9</td><td>0.1</td><td>0.6</td><td>1 × 0.2 = 0.2</td></tr>
    <tr><td>4</td><td>0.1</td><td>1.0</td><td>0</td><td>0.4</td><td>4 × 0.1 = 0.4</td></tr>
    <tr><td colspan="4"><strong>Totals</strong></td><td><strong>E[X] = 2.0</strong></td><td><strong>Var = 1.0</strong></td></tr>
  </table>
  <p>The <strong>PMF</strong> (probability mass function) answers "P(X = exactly k)". The <strong>CDF</strong> (cumulative distribution function) is its running total, P(X ≤ k): it climbs from 0 to 1, so P(an order has at most 2 packets) = 0.7. Its mirror, the <strong>survival function</strong>, is P(X &gt; k) = 1 − CDF: 30% of orders have 3 or more packets, so they need the bigger box. The <strong>PPF</strong> runs the CDF backwards: "the smallest k with at least 90% of orders at or below it" is 3. And the mean and variance from the Probability note are just weighted sums over the PMF: E[X] = Σ k·P(k) = 2 packets, Var = Σ (k − 2)²·P(k) = 1.</p>
  <div class="fx" data-lang="py">import numpy as np
from scipy import stats
packets = np.array([1, 2, 3, 4])            # packets in one order
pmf = np.array([0.4, 0.3, 0.2, 0.1])        # P(X = k)
cdf = pmf.cumsum()                          # P(X &lt;= k)
for k, p, c in zip(packets, pmf, cdf):
    print(f"k={k}  PMF={p:.1f}  CDF={c:.1f}  P(X&gt;k)={1-c:.1f}")
mean = (packets * pmf).sum()
var = ((packets - mean) ** 2 * pmf).sum()
print("mean", round(mean, 3), " variance", round(var, 3))</div>
  <div class="fx" data-lang="text">k=1  PMF=0.4  CDF=0.4  P(X&gt;k)=0.6
k=2  PMF=0.3  CDF=0.7  P(X&gt;k)=0.3
k=3  PMF=0.2  CDF=0.9  P(X&gt;k)=0.1
k=4  PMF=0.1  CDF=1.0  P(X&gt;k)=0.0
mean 2.0  variance 1.0</div>
  <p>The code stores the PMF as an array, gets the CDF with <code>cumsum</code> (running total), and computes mean and variance as weighted sums. The output matches the hand table line by line.</p>
  <h3>Discrete vs continuous</h3>
  <p>Packets, buyers and orders are <em>discrete</em>: separate values with gaps. Weights, waiting times and money are <em>continuous</em>: any decimal is possible. For continuous data a single exact value has probability 0 (no packet weighs <em>exactly</em> 500.000000 g), so instead of a PMF there is a <strong>PDF</strong> (probability density function): a curve where probability is the <em>area</em> under it between two values. The CDF works the same for both kinds.</p>
  <figure class="viz"><svg viewBox="0 0 600 238" width="600"><g transform="translate(0,0)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">Bernoulli p=.3</text><g transform="translate(0,16)"><line x1="8" y1="79" x2="142" y2="79" stroke="currentColor" stroke-opacity=".5"/><text x="47.1" y="94" text-anchor="middle" font-size="11">0</text><text x="102.9" y="94" text-anchor="middle" font-size="11">1</text><path d="M30.3,79V27.9H63.8V79M86.2,79V57.1H119.7V79" class="fb sb"/></g></g><g transform="translate(150,0)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">Binomial 20, .3</text><g transform="translate(0,16)"><line x1="8" y1="79" x2="142" y2="79" stroke="currentColor" stroke-opacity=".5"/><text x="11.2" y="94" text-anchor="middle" font-size="11">0</text><text x="75" y="94" text-anchor="middle" font-size="11">10</text><text x="138.8" y="94" text-anchor="middle" font-size="11">20</text><path d="M8.6,79V78.7H13.7V79M15,79V76.6H20.1V79M21.4,79V69.3H26.5V79M27.8,79V54.1H32.9V79M34.2,79V33.7H39.3V79M40.5,79V16.8H45.6V79M46.9,79V12.4H52V79M53.3,79V21.9H58.4V79M59.7,79V39.2H64.8V79M66.1,79V56.3H71.2V79M72.4,79V68.3H77.6V79M78.8,79V74.8H83.9V79M85.2,79V77.7H90.3V79M91.6,79V78.6H96.7V79M98,79V78.9H103.1V79M104.4,79V79H109.5V79M110.7,79V79H115.8V79M117.1,79V79H122.2V79M123.5,79V79H128.6V79M129.9,79V79H135V79M136.3,79V79H141.4V79" class="fb sb"/></g></g><g transform="translate(300,0)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">Poisson λ=4</text><g transform="translate(0,16)"><line x1="8" y1="79" x2="142" y2="79" stroke="currentColor" stroke-opacity=".5"/><text x="12.5" y="94" text-anchor="middle" font-size="11">0</text><text x="48.2" y="94" text-anchor="middle" font-size="11">4</text><text x="83.9" y="94" text-anchor="middle" font-size="11">8</text><text x="119.7" y="94" text-anchor="middle" font-size="11">12</text><path d="M8.9,79V72.6H16V79M17.8,79V53.5H25V79M26.8,79V28.1H33.9V79M35.7,79V11.1H42.8V79M44.6,79V11.1H51.8V79M53.6,79V24.7H60.7V79M62.5,79V42.8H69.6V79M71.4,79V58.3H78.6V79M80.4,79V68.7H87.5V79M89.3,79V74.4H96.4V79M98.2,79V77.2H105.4V79M107.2,79V78.3H114.3V79M116.1,79V78.8H123.2V79M125,79V78.9H132.2V79M134,79V79H141.1V79" class="fb sb"/></g></g><g transform="translate(450,0)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">Uniform 0–10</text><g transform="translate(0,16)"><line x1="8" y1="79" x2="142" y2="79" stroke="currentColor" stroke-opacity=".5"/><text x="14.1" y="94" text-anchor="middle" font-size="11">0</text><text x="75" y="94" text-anchor="middle" font-size="11">5</text><text x="135.9" y="94" text-anchor="middle" font-size="11">10</text><rect x="14.1" y="18.2" width="121.8" height="60.8" class="ft st"/></g></g><g transform="translate(0,119)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">Normal 0, 1</text><g transform="translate(0,16)"><line x1="8" y1="79" x2="142" y2="79" stroke="currentColor" stroke-opacity=".5"/><text x="17.6" y="94" text-anchor="middle" font-size="11">-3</text><text x="75" y="94" text-anchor="middle" font-size="11">0</text><text x="132.4" y="94" text-anchor="middle" font-size="11">3</text><path d="M8,79 L8,78.9 L12.6,78.7 L17.2,78.3 L21.9,77.6 L26.5,76.4 L31.1,74.3 L35.7,71.1 L40.3,66.4 L45,60.1 L49.6,52.2 L54.2,43.1 L58.8,33.7 L63.4,25.1 L68.1,18.4 L72.7,14.8 L77.3,14.8 L81.9,18.4 L86.6,25.1 L91.2,33.7 L95.8,43.1 L100.4,52.2 L105,60.1 L109.7,66.4 L114.3,71.1 L118.9,74.3 L123.5,76.4 L128.1,77.6 L132.8,78.3 L137.4,78.7 L142,78.9 L142,79 Z" class="ft st" stroke-width="2"/></g></g><g transform="translate(150,119)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">Exponential λ=1</text><g transform="translate(0,16)"><line x1="8" y1="79" x2="142" y2="79" stroke="currentColor" stroke-opacity=".5"/><text x="8" y="94" text-anchor="middle" font-size="11">0</text><text x="34.8" y="94" text-anchor="middle" font-size="11">1</text><text x="61.6" y="94" text-anchor="middle" font-size="11">2</text><text x="88.4" y="94" text-anchor="middle" font-size="11">3</text><text x="115.2" y="94" text-anchor="middle" font-size="11">4</text><text x="142" y="94" text-anchor="middle" font-size="11">5</text><path d="M8,79 L8,9.5 L13.6,22.6 L19.2,33.2 L24.8,41.8 L30.3,48.8 L35.9,54.5 L41.5,59.1 L47.1,62.8 L52.7,65.9 L58.2,68.3 L63.8,70.3 L69.4,72 L75,73.3 L80.6,74.4 L86.2,75.2 L91.8,75.9 L97.3,76.5 L102.9,77 L108.5,77.4 L114.1,77.7 L119.7,77.9 L125.2,78.1 L130.8,78.3 L136.4,78.4 L142,78.5 L142,79 Z" class="ft st" stroke-width="2"/></g></g><g transform="translate(300,119)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">Log-normal</text><g transform="translate(0,16)"><line x1="8" y1="79" x2="142" y2="79" stroke="currentColor" stroke-opacity=".5"/><text x="8" y="94" text-anchor="middle" font-size="11">0</text><text x="34.8" y="94" text-anchor="middle" font-size="11">1</text><text x="61.6" y="94" text-anchor="middle" font-size="11">2</text><text x="88.4" y="94" text-anchor="middle" font-size="11">3</text><text x="115.2" y="94" text-anchor="middle" font-size="11">4</text><text x="142" y="94" text-anchor="middle" font-size="11">5</text><path d="M8.3,79 L8.3,79 L12.9,72.7 L17.5,38.1 L22.1,9.6 L26.7,6 L31.3,6.6 L35.9,17.1 L40.5,28.4 L45.2,38.8 L49.8,47.4 L54.4,54.4 L59,59.9 L63.6,64.1 L68.2,67.4 L72.8,69.9 L77.4,71.9 L82.1,73.4 L86.7,74.6 L91.3,75.5 L95.9,76.2 L100.5,76.8 L105.1,77.2 L109.7,77.6 L114.3,77.8 L118.9,78.1 L123.6,78.2 L128.2,78.4 L132.8,78.5 L137.4,78.6 L142,78.6 L142,79 Z" class="ft st" stroke-width="2"/></g></g><g transform="translate(450,119)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11"></text><g transform="translate(0,16)"><rect x="12" y="20" width="16" height="12" class="fb sb"/><text x="34" y="30" font-size="11">discrete: PMF</text><rect x="12" y="46" width="16" height="12" class="ft st"/><text x="34" y="56" font-size="11">continuous: PDF</text></g></g></svg><figcaption>Bars = probability of each count. Curves = density; probability is the area under the curve.</figcaption></figure>
  <p>The gallery above shows every shape this note builds. Top row: discrete distributions drawn as bars; each bar's height is a probability. Bottom row: continuous distributions drawn as curves; probability is the area between two points, not the height.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>PMF is a price list: each item has its own price. PDF is a map of population density: nobody lives at one exact point, but the darker the region, the more people live in any small patch of it. The CDF is the odometer: "how much have I covered up to here?"</p>
  </div>
  <table class="tbl">
    <tr><th>Function</th><th>Means</th><th>scipy</th></tr>
    <tr><td><strong>PMF</strong> (discrete)</td><td>P(X = k), a real probability</td><td><code>.pmf(k)</code></td></tr>
    <tr><td><strong>PDF</strong> (continuous)</td><td>density; P(a &lt; X &lt; b) = area under it. P(X = exact value) = 0</td><td><code>.pdf(x)</code></td></tr>
    <tr><td><strong>CDF</strong></td><td>P(X ≤ x), climbs 0 → 1</td><td><code>.cdf(x)</code>; <code>.sf(x)</code> = 1 − cdf</td></tr>
    <tr><td><strong>PPF</strong></td><td>inverse CDF: "which x has 95% below it?"</td><td><code>.ppf(0.95)</code></td></tr>
    <tr><td><strong>rvs</strong></td><td>draw random samples from the story</td><td><code>.rvs(size, random_state)</code></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>distribution</strong> of a random variable X is the complete rule giving P(X ∈ A) for every set of values A. For discrete X it is the PMF p(k) = P(X = k) with Σ p(k) = 1; for continuous X it is a PDF f(x) ≥ 0 with ∫ f(x) dx = 1 and P(a &lt; X &lt; b) = ∫ₐᵇ f(x) dx. The CDF F(x) = P(X ≤ x) exists for both. A <strong>parametric family</strong> is a whole set of distributions indexed by a few knobs (p, λ, μ, σ…).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A PDF value can exceed 1 (a very narrow bell curve peaks above 1). It's a density, like people per square metre, not a probability. Only areas are probabilities.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Bernoulli.</b> We wrote the packets list by hand from last month's data. For most variables nobody hands us the list. Are there standard shapes, fixed by one or two numbers, that we can reuse? Start with the smallest random thing there is.</div>

  <h2 id="sdi-bern"><span class="num">02</span>Bernoulli</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A hand-made list works for packets, but we want reusable shapes. What is the simplest possible random variable, and what is its distribution?</p>
  </div>
  <p>The smallest random thing: one yes/no. A visitor lands on LeafBox: does she buy? Code "buys" as 1 and "doesn't" as 0. If the chance of buying is p, the whole distribution is two numbers: P(1) = p, P(0) = 1 − p. That is the <strong>Bernoulli(p)</strong>, and LeafBox's p is 0.03.</p>
  <p><strong>Mean and variance by hand.</strong> E[X] = 1·p + 0·(1 − p) = p = 0.03: the long-run share of visitors who buy. Var = (1 − p)²·p + (0 − p)²·(1 − p) = p(1 − p) = 0.03 × 0.97 = 0.0291. The variance is biggest at p = 0.5 (0.25), when the outcome is most uncertain, and 0 at p = 0 or 1, when there is no uncertainty at all.</p>
  <div class="fx" data-lang="py">b = stats.bernoulli(0.03)                   # one visitor: buys (1) or not (0)
print("P(buy) =", b.pmf(1), " P(no) =", round(b.pmf(0), 2))
print("mean", b.mean(), " variance", round(b.var(), 4))
sim = stats.bernoulli(0.03).rvs(10000, random_state=1)
print("10,000 simulated visitors -&gt; share who bought:", sim.mean())</div>
  <div class="fx" data-lang="text">P(buy) = 0.03  P(no) = 0.97
mean 0.03  variance 0.0291
10,000 simulated visitors -&gt; share who bought: 0.0303</div>
  <p><code>stats.bernoulli(0.03)</code> is the story; <code>.pmf</code>, <code>.mean</code> and <code>.var</code> confirm the hand numbers; <code>.rvs</code> simulates 10,000 visitors, and 3.03% of them bought, close to p. That is the law of large numbers from the Probability note, seen on a Bernoulli.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A Bernoulli is one light switch flicked by chance: on with probability p. Everything that follows (counts, rates, conversion tests) is built by flicking many such switches.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>X ~ <strong>Bernoulli(p)</strong> if P(X = 1) = p and P(X = 0) = 1 − p, 0 ≤ p ≤ 1. E[X] = p, Var(X) = p(1 − p). The sample mean of Bernoulli outcomes is the observed proportion (conversion rate, click-through rate, default rate).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>p is a property of the process, not of one visitor's "3% of a purchase". A single visitor either buys or doesn't; p only shows up in the long-run share.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Binomial.</b> One visitor is one switch. The shop sees 100 visitors a day. How many of them buy, and is 5 buyers a good day or just luck?</div>

  <h2 id="sdi-binom"><span class="num">03</span>Binomial</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Bernoulli describes one visitor. With n independent visitors, each buying with chance p, what is the distribution of the <em>number</em> who buy?</p>
  </div>
  <h3>By hand with 3 visitors</h3>
  <p>Take 3 visitors, each buying with p = 0.03. Write B for buys and N for not. There are 2³ = 8 sequences:</p>
  <table class="tbl">
    <tr><th>Buyers k</th><th>Sequences</th><th>Probability of each</th><th>Count</th><th>P(k)</th></tr>
    <tr><td>0</td><td>NNN</td><td>0.97³ = 0.912673</td><td>1</td><td>0.91267</td></tr>
    <tr><td>1</td><td>BNN, NBN, NNB</td><td>0.03 × 0.97² = 0.028227</td><td>3</td><td>0.08468</td></tr>
    <tr><td>2</td><td>BBN, BNB, NBB</td><td>0.03² × 0.97 = 0.000873</td><td>3</td><td>0.00262</td></tr>
    <tr><td>3</td><td>BBB</td><td>0.03³ = 0.000027</td><td>1</td><td>0.00003</td></tr>
  </table>
  <p>Every row has the same pattern: (number of orderings) × pᵏ × (1 − p)ⁿ⁻ᵏ. The number of orderings with k buyers among n is "n choose k", C(n, k) = n!/(k!(n − k)!): C(3, 1) = 3. That is the Binomial formula.</p>
  <div class="fx" data-lang="py">from itertools import product
p = 0.03
probs = {0: 0, 1: 0, 2: 0, 3: 0}
for seq in product("BN", repeat=3):         # B = buys, N = does not
    pr = np.prod([p if s == "B" else 1 - p for s in seq])
    probs[seq.count("B")] += pr
print("by enumeration:", [round(float(v), 5) for v in probs.values()])
print("scipy binom   :", [round(float(stats.binom(3, 0.03).pmf(k)), 5) for k in range(4)])</div>
  <div class="fx" data-lang="text">by enumeration: [0.91267, 0.08468, 0.00262, 3e-05]
scipy binom   : [0.91267, 0.08468, 0.00262, 3e-05]</div>
  <p>The loop literally lists the 8 sequences, multiplies the per-visitor chances, and adds them up by number of B's; scipy's formula gives the same four numbers.</p>
  <h3>A day with 100 visitors</h3>
  <p>Mean = np = 100 × 0.03 = 3 buyers; variance = np(1 − p) = 2.91 (n Bernoulli variances added, because the visitors are independent). P(0 buyers) = 0.97¹⁰⁰ = 0.0476.</p>
  <div class="fx" data-lang="py">B = stats.binom(n=100, p=0.03)              # 100 visitors today
print("mean, var:", B.mean(), B.var())
print("P(exactly 3)   :", round(B.pmf(3), 4))
print("P(0)           :", round(B.pmf(0), 4))
print("P(5 or more)   :", round(B.sf(4), 4))     # sf(4) = P(X &gt; 4)</div>
  <div class="fx" data-lang="text">mean, var: 3.0 2.91
P(exactly 3)   : 0.2275
P(0)           : 0.0476
P(5 or more)   : 0.1821</div>
  <p>Three buyers is the single most likely count, but only 23% likely. A day with 5 or more buyers happens 18% of the time by pure luck (<code>.sf(4)</code> is "strictly more than 4"), and a day with zero sales 5% of the time. That's why one good or bad day proves nothing, and why A/B tests need thousands of visitors.</p>
  <table class="tbl">
    <tr><th></th><th>Story</th><th>PMF</th><th>Mean / Var</th><th>LeafBox</th></tr>
    <tr><td><strong>Bernoulli(p)</strong></td><td>One yes/no trial</td><td><code>P(1) = p, P(0) = 1 − p</code></td><td>p / p(1−p)</td><td>one visitor: 0.03 / 0.0291</td></tr>
    <tr><td><strong>Binomial(n, p)</strong></td><td>Number of yeses in n independent trials</td><td><code>C(n,k) pᵏ (1−p)ⁿ⁻ᵏ</code></td><td>np / np(1−p)</td><td>100 visitors: 3 / 2.91</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Flick the same light switch 100 times and count how often it lands "on". The Binomial is the distribution of that count.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>X ~ <strong>Binomial(n, p)</strong> is the number of successes in n independent Bernoulli(p) trials: P(X = k) = C(n, k) pᵏ (1 − p)ⁿ⁻ᵏ, k = 0 … n. E[X] = np, Var(X) = np(1 − p). It is the sum of n independent Bernoullis.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Binomial needs independent trials with the same p and a fixed n. Ten visits from one person who keeps refreshing are not ten independent trials; and a count with no natural ceiling (orders per hour) has no n at all.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Poisson.</b> Orders also arrive through the day with no fixed number of "trials": thousands of people might see an ad, each with a tiny chance. All we know is the rate, about 4 orders an hour. What is the distribution of a count per hour?</div>

  <h2 id="sdi-pois"><span class="num">04</span>Poisson</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The Binomial needs n and p. For orders per hour we only know the average rate λ = 4. How likely is a silent hour, or a rush of 8, so we know when to add packing staff?</p>
  </div>
  <p>Counting independent events in a fixed window when you only know the average rate is the <strong>Poisson(λ)</strong> story (λ, "lambda", is the average count per window). The formula: <code>P(k) = λᵏ e^−λ / k!</code>, where e ≈ 2.718 is a constant, λᵏ grows with the count, k! (k factorial) shrinks it back, and e^−λ scales everything so the probabilities add to 1.</p>
  <h3>By hand, λ = 4</h3>
  <p>There is a neat shortcut: P(k) = P(k − 1) × λ/k. So start from P(0) = e⁻⁴ = 0.0183 and multiply:</p>
  <table class="tbl">
    <tr><th>k orders</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th></tr>
    <tr><td>step</td><td>e⁻⁴</td><td>× 4/1</td><td>× 4/2</td><td>× 4/3</td><td>× 4/4</td><td>× 4/5</td><td>× 4/6</td><td>× 4/7</td></tr>
    <tr><td>P(k)</td><td>0.0183</td><td>0.0733</td><td>0.1465</td><td>0.1954</td><td>0.1954</td><td>0.1563</td><td>0.1042</td><td>0.0595</td></tr>
  </table>
  <p>Adding 0 to 7 gives 0.9489, so P(8 or more) = 1 − 0.9489 = 0.0511.</p>
  <div class="fx" data-lang="py">P = stats.poisson(mu=4)                     # 4 orders per hour on average
print([round(float(P.pmf(k)), 4) for k in range(9)])
print("mean, var:", P.mean(), P.var())
print("P(0 orders):", round(P.pmf(0), 4))
print("P(8 or more):", round(P.sf(7), 4))</div>
  <div class="fx" data-lang="text">[0.0183, 0.0733, 0.1465, 0.1954, 0.1954, 0.1563, 0.1042, 0.0595, 0.0298]
mean, var: 4.0 4.0
P(0 orders): 0.0183
P(8 or more): 0.0511</div>
  <p>A silent hour happens 1.8% of the time; 3 or 4 orders are most common (19.5% each); an hour with 8+ orders happens 5% of the time, about once a day if the shop is open 20 hours, which makes it a sensible "call a second packer" threshold. Notice the one surprising property: <strong>mean and variance are both λ</strong>.</p>
  <h3>Where the Poisson comes from: a Binomial with huge n</h3>
  <p>Say 2,000 people see LeafBox's ad each hour and each orders with chance 0.002. That is Binomial(2000, 0.002) with mean np = 4. Compare it with Poisson(4):</p>
  <div class="fx" data-lang="py">k = range(7)
print("Binom(2000, .002):", [round(float(stats.binom(2000, 0.002).pmf(i)), 4) for i in k])
print("Poisson(4)       :", [round(float(stats.poisson(4).pmf(i)), 4) for i in k])
print("Binom(20, .2)    :", [round(float(stats.binom(20, 0.2).pmf(i)), 4) for i in k])</div>
  <div class="fx" data-lang="text">Binom(2000, .002): [0.0182, 0.0731, 0.1465, 0.1955, 0.1956, 0.1564, 0.1042]
Poisson(4)       : [0.0183, 0.0733, 0.1465, 0.1954, 0.1954, 0.1563, 0.1042]
Binom(20, .2)    : [0.0115, 0.0576, 0.1369, 0.2054, 0.2182, 0.1746, 0.1091]</div>
  <p>Binomial(2000, 0.002) and Poisson(4) agree to 3 decimals. Binomial(20, 0.2) also has mean 4 but visibly differs (p is not small, so the variance np(1 − p) = 3.2 is less than 4). Rule: when n is large and p small, the Binomial becomes the Poisson with λ = np, and you no longer need to know n or p separately.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Rain drops hitting one paving stone in a minute. You know the drizzle's average rate, nothing else; the count on any given stone is Poisson.</p>
  </div>
  <table class="tbl">
    <tr><th>Story</th><th>PMF</th><th>Mean / Var</th><th>Examples</th></tr>
    <tr><td>Count of independent events in a fixed window, at an average rate λ</td><td><code>λᵏ e^−λ / k!</code></td><td>λ / λ (equal!)</td><td>Orders per hour, support tickets per day, clicks per minute, defects per batch</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>X ~ <strong>Poisson(λ)</strong> if P(X = k) = λᵏe^−λ/k!, k = 0, 1, 2, … It counts events in a window when events occur independently at a constant average rate λ per window. E[X] = Var(X) = λ. It is the limit of Binomial(n, p) as n → ∞, p → 0 with np = λ.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: overdispersion</span>
    <p>Real counts often have variance much bigger than the mean (most users order once, a few order 50 times; lunch hours are busier than 3 a.m.). Then Poisson underestimates spread and alerts fire constantly. Check var vs mean; if var ≫ mean, use the Negative Binomial, which has a separate spread knob, or model the rate per hour of day.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Exponential &amp; Uniform.</b> Poisson counts the orders in an hour, but the packer asks a different question: "I just packed one; how long until the next arrives?" That is a waiting time, a continuous number, not a count.</div>

  <h2 id="sdi-expo"><span class="num">05</span>Exponential &amp; Uniform</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know how many orders an hour brings (Poisson), but not when the next one arrives, nor where in the hour a single order falls. These are continuous times: what are their distributions?</p>
  </div>
  <p>If orders arrive as a Poisson process at λ = 4 per hour, the waiting time between orders follows the <strong>Exponential</strong> distribution with rate λ, mean 1/λ = 15 minutes. Short waits are most common, long waits get rarer and rarer.</p>
  <h3>By hand: why e^−t/15</h3>
  <p>"Wait longer than t" means "zero orders in the next t minutes". In t minutes the Poisson rate is λt = t/15, and P(0 events) = e^−(t/15) (from section 04, P(0) = e^−λ). So P(wait &gt; 15) = e⁻¹ = 0.368 and P(wait &gt; 30) = e⁻² = 0.135. The Exponential is literally the Poisson's P(0) seen from the other side.</p>
  <p>The <strong>Uniform(a, b)</strong> is the "every value equally likely" distribution: its PDF is a flat line 1/(b − a). It shows up here too: if exactly one order arrived in an hour, its minute is Uniform(0, 60), so P(it came in the first 15 minutes) = 15/60 = 0.25. Mean (a + b)/2 = 30, variance (b − a)²/12 = 3600/12 = 300.</p>
  <table class="tbl">
    <tr><th></th><th>Story</th><th>PDF</th><th>Mean / Var</th><th>Examples</th></tr>
    <tr><td><strong>Exponential(λ)</strong></td><td>Waiting time until the next Poisson event</td><td><code>λ e^−λx</code>, x ≥ 0</td><td>1/λ / 1/λ²</td><td>Time between orders (15, 225), time to failure (simple model)</td></tr>
    <tr><td><strong>Uniform(a, b)</strong></td><td>Every value in [a, b] equally likely</td><td><code>1/(b − a)</code></td><td>(a+b)/2 / (b−a)²/12</td><td>Minute of one event in an hour (30, 300), hash buckets, random search</td></tr>
  </table>
  <div class="fx" data-lang="py">E_ = stats.expon(scale=15)                  # mean 15 min between orders; scale = 1/rate
print("mean, var:", E_.mean(), E_.var())
print("P(wait &gt; 15):", round(E_.sf(15), 4))
print("P(wait &gt; 30):", round(E_.sf(30), 4))
print("P(wait &gt; 40 | already waited 10):", round(E_.sf(40) / E_.sf(10), 4))
U = stats.uniform(loc=0, scale=60)          # minute of the single order in an hour
print("uniform mean, var:", U.mean(), round(U.var(), 2), " P(first 15 min):", U.cdf(15))</div>
  <div class="fx" data-lang="text">mean, var: 15.0 225.0
P(wait &gt; 15): 0.3679
P(wait &gt; 30): 0.1353
P(wait &gt; 40 | already waited 10): 0.1353
uniform mean, var: 30.0 300.0  P(first 15 min): 0.25</div>
  <p><code>stats.expon(scale=15)</code> takes the mean wait (scale = 1/λ), not the rate. The fourth line uses the conditional-probability formula from the Probability note: P(wait &gt; 40 | wait &gt; 10) = P(&gt; 40)/P(&gt; 10) = e^−40/15 / e^−10/15 = e^−30/15 = 0.1353, exactly P(wait &gt; 30).</p>
  <div class="callout intu"><span class="label">Memoryless</span>
    <p>Having waited 10 min, P(30 more) = P(30 from scratch) = 0.1353. The exponential has no memory: the past wait tells you nothing. That's also its weakness for churn or machine failure: real users and real machines "age".</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Memoryless is a bus with no timetable that shows up at random: having already waited 10 minutes does not make the bus any closer. A timetabled bus is the opposite: every minute waited brings it nearer.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>X ~ <strong>Exponential(λ)</strong> has PDF λe^−λx for x ≥ 0, CDF 1 − e^−λx, mean 1/λ, variance 1/λ², and P(X &gt; s + t | X &gt; s) = P(X &gt; t). X ~ <strong>Uniform(a, b)</strong> has PDF 1/(b − a) on [a, b], mean (a + b)/2, variance (b − a)²/12.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>scipy's exponential takes <code>scale = 1/λ</code> (the mean wait), not λ (the rate). Passing a rate as scale is a classic silent bug: no error, wrong answers.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Normal.</b> Waiting times pile up near zero. But LeafBox also measures things: the filling machine puts about 500 g of tea in each packet, a little more or less each time. What shape do measurements built from many small random nudges take?</div>

  <h2 id="sdi-norm"><span class="num">06</span>Normal (Gaussian)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Packet weights wobble around 500 g because of dozens of small effects (tea density, vibration, scale drift). What distribution do such measurements follow, and how do we answer "what share of packets are underfilled"?</p>
  </div>
  <p>Add many small independent effects and the result piles up in the middle with symmetric, thinning tails: the <strong>bell curve</strong>, called the <strong>Normal</strong> distribution. It has two knobs: μ (mu), the centre, and σ (sigma), the standard deviation. Write it N(μ, σ). LeafBox's packets are N(500, 10): centre 500 g, typical wobble 10 g.</p>
  <figure class="viz"><svg viewBox="0 0 560 200" width="560"><line x1="30" y1="172" x2="548" y2="172" stroke="currentColor" stroke-opacity=".5"/><text x="94.8" y="187" text-anchor="middle" font-size="11">−3σ</text><text x="159.5" y="187" text-anchor="middle" font-size="11">−2σ</text><text x="224.2" y="187" text-anchor="middle" font-size="11">−1σ</text><text x="289" y="187" text-anchor="middle" font-size="11">μ</text><text x="353.8" y="187" text-anchor="middle" font-size="11">+1σ</text><text x="418.5" y="187" text-anchor="middle" font-size="11">+2σ</text><text x="483.2" y="187" text-anchor="middle" font-size="11">+3σ</text><path d="M94.8,172 L94.8,170.8 L104.7,170.2 L114.7,169.2 L124.6,167.8 L134.6,165.9 L144.6,163.3 L154.5,159.8 L164.5,155.5 L174.4,150 L184.4,143.5 L194.4,135.9 L204.3,127.3 L214.3,118 L224.2,108.3 L234.2,98.6 L244.2,89.3 L254.1,81.1 L264.1,74.4 L274.1,69.7 L284,67.3 L294,67.3 L303.9,69.7 L313.9,74.4 L323.9,81.1 L333.8,89.3 L343.8,98.6 L353.8,108.3 L363.7,118 L373.7,127.3 L383.6,135.9 L393.6,143.5 L403.6,150 L413.5,155.5 L423.5,159.8 L433.4,163.3 L443.4,165.9 L453.4,167.8 L463.3,169.2 L473.3,170.2 L483.2,170.8 L483.2,172 Z" class="ft" stroke="none"/><path d="M159.5,172 L159.5,157.8 L166.1,154.6 L172.8,151 L179.4,146.9 L186.1,142.3 L192.7,137.2 L199.3,131.7 L206,125.8 L212.6,119.6 L219.3,113.2 L225.9,106.6 L232.6,100.2 L239.2,93.9 L245.8,87.9 L252.5,82.4 L259.1,77.6 L265.8,73.5 L272.4,70.3 L279,68.2 L285.7,67.1 L292.3,67.1 L299,68.2 L305.6,70.3 L312.2,73.5 L318.9,77.6 L325.5,82.4 L332.2,87.9 L338.8,93.9 L345.4,100.2 L352.1,106.6 L358.7,113.2 L365.4,119.6 L372,125.8 L378.7,131.7 L385.3,137.2 L391.9,142.3 L398.6,146.9 L405.2,151 L411.9,154.6 L418.5,157.8 L418.5,172 Z" class="ft" stroke="none"/><path d="M224.2,172 L224.2,108.3 L228.7,103.9 L233.2,99.5 L237.6,95.3 L242.1,91.2 L246.6,87.2 L251,83.5 L255.5,80.1 L260,77 L264.4,74.2 L268.9,71.9 L273.4,70 L277.8,68.5 L282.3,67.5 L286.8,67 L291.2,67 L295.7,67.5 L300.2,68.5 L304.6,70 L309.1,71.9 L313.6,74.2 L318,77 L322.5,80.1 L327,83.5 L331.4,87.2 L335.9,91.2 L340.4,95.3 L344.8,99.5 L349.3,103.9 L353.8,108.3 L353.8,172 Z" class="fb" stroke="none"/><path d="M30,172 L38.8,171.9 L47.6,171.9 L56.3,171.8 L65.1,171.7 L73.9,171.6 L82.7,171.3 L91.5,171 L100.2,170.5 L109,169.8 L117.8,168.8 L126.6,167.5 L135.4,165.7 L144.1,163.4 L152.9,160.5 L161.7,156.8 L170.5,152.3 L179.3,147 L188,140.9 L196.8,133.9 L205.6,126.2 L214.4,117.9 L223.2,109.4 L231.9,100.8 L240.7,92.4 L249.5,84.8 L258.3,78.1 L267.1,72.8 L275.8,69.1 L284.6,67.2 L293.4,67.2 L302.2,69.1 L310.9,72.8 L319.7,78.1 L328.5,84.8 L337.3,92.4 L346.1,100.8 L354.8,109.4 L363.6,117.9 L372.4,126.2 L381.2,133.9 L390,140.9 L398.7,147 L407.5,152.3 L416.3,156.8 L425.1,160.5 L433.9,163.4 L442.6,165.7 L451.4,167.5 L460.2,168.8 L469,169.8 L477.8,170.5 L486.5,171 L495.3,171.3 L504.1,171.6 L512.9,171.7 L521.7,171.8 L530.4,171.9 L539.2,171.9 L548,172" fill="none" class="sb" stroke-width="2"/><line x1="224.2" y1="53.5" x2="353.8" y2="53.5" class="sb" stroke-width="1.2"/><line x1="224.2" y1="57.5" x2="224.2" y2="49.5" class="sb" stroke-width="1.2"/><line x1="353.8" y1="57.5" x2="353.8" y2="49.5" class="sb" stroke-width="1.2"/><text x="360.2" y="56.7" text-anchor="start" font-size="11">68.3%</text><line x1="159.5" y1="37.7" x2="418.5" y2="37.7" class="sb" stroke-width="1.2"/><line x1="159.5" y1="41.6" x2="159.5" y2="33.7" class="sb" stroke-width="1.2"/><line x1="418.5" y1="41.6" x2="418.5" y2="33.7" class="sb" stroke-width="1.2"/><text x="425" y="40.9" text-anchor="start" font-size="11">95.4%</text><line x1="94.8" y1="21.9" x2="483.2" y2="21.9" class="sb" stroke-width="1.2"/><line x1="94.8" y1="25.9" x2="94.8" y2="18" class="sb" stroke-width="1.2"/><line x1="483.2" y1="25.9" x2="483.2" y2="18" class="sb" stroke-width="1.2"/><text x="489.7" y="25.1" text-anchor="start" font-size="11">99.7%</text></svg><figcaption>Within ±1σ: 68%. ±2σ: 95%. ±3σ: 99.7%. Packet weights N(500, 10): 68% of packets weigh 490–510 g, 95% weigh 480–520 g.</figcaption></figure>
  <p>The shaded bands are the rule to memorise. Within one σ either side of the centre sits 68% of the data; within two, 95%; within three, 99.7%. For packets: 68% weigh 490–510 g, 95% weigh 480–520 g, and almost none fall outside 470–530 g.</p>
  <table class="tbl">
    <tr><th>Story</th><th>PDF</th><th>Mean / Var</th><th>Examples</th></tr>
    <tr><td>Sum of many small independent effects</td><td><code>(1/σ√2π) e^−(x−μ)²/2σ²</code></td><td>μ / σ²</td><td>Packet weights, heights, measurement error, regression residuals, sample means (CLT)</td></tr>
  </table>
  <p>The PDF looks scary but reads simply: (x − μ)²/2σ² is "how far x is from the centre, in σ units, squared, halved"; e to the minus that makes the curve fall off fast on both sides; 1/σ√2π just makes the total area 1.</p>
  <h3>z-scores by hand</h3>
  <p>The tool for every normal question is the <strong>z-score</strong>: <code>z = (x − μ)/σ</code>, how many σ a value sits from the centre (met in the <a class="xref" data-note="st_descriptive">Descriptive Statistics</a> note). Every N(μ, σ) becomes the standard N(0, 1) after this conversion, so one table answers all of them.</p>
  <table class="tbl">
    <tr><th>Question</th><th>z</th><th>From the 68-95-99.7 rule</th><th>Exact</th></tr>
    <tr><td>P(packet &gt; 515 g)</td><td>(515 − 500)/10 = 1.5</td><td>between 16% (z = 1) and 2.5% (z = 2)</td><td>0.0668</td></tr>
    <tr><td>P(packet &lt; 480 g), "underfilled"</td><td>(480 − 500)/10 = −2</td><td>half of the 5% outside ±2σ = 2.5%</td><td>0.0228</td></tr>
    <tr><td>P(490 to 510 g)</td><td>−1 to 1</td><td>68%</td><td>0.6827</td></tr>
    <tr><td>Weight with 95% below</td><td>z = 1.645</td><td>500 + 1.645 × 10</td><td>516.45</td></tr>
  </table>
  <div class="fx" data-lang="py">N = stats.norm(loc=500, scale=10)           # packet weight in grams
print("P(heavier than 515):", round(N.sf(515), 4))      # z = 1.5
print("P(under 480)       :", round(N.cdf(480), 4))     # z = -2
print("P(490 to 510)      :", round(N.cdf(510) - N.cdf(490), 4))
print("95th percentile    :", round(N.ppf(0.95), 2))
print("share within 1,2,3 sd:", [round(float(stats.norm.cdf(k) - stats.norm.cdf(-k)), 4) for k in (1, 2, 3)])</div>
  <div class="fx" data-lang="text">P(heavier than 515): 0.0668
P(under 480)       : 0.0228
P(490 to 510)      : 0.6827
95th percentile    : 516.45
share within 1,2,3 sd: [0.6827, 0.9545, 0.9973]</div>
  <p><code>loc</code> is μ and <code>scale</code> is σ in scipy. <code>.sf(515)</code> is the area to the right of 515; <code>.cdf(480)</code> the area to the left of 480; <code>.cdf(510) − .cdf(490)</code> the area between; <code>.ppf(0.95)</code> the weight with 95% below it. The last line checks the 68-95-99.7 rule on N(0, 1).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A Galton board: balls fall through rows of pins, each pin nudging them left or right at random. Each ball's final position is the sum of many small nudges, and the pile at the bottom is a bell.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>X ~ <strong>N(μ, σ²)</strong> has PDF f(x) = (1/(σ√(2π))) exp(−(x − μ)²/(2σ²)), mean μ, variance σ². Z = (X − μ)/σ ~ N(0, 1), the standard normal, whose CDF is written Φ(z). Sums of independent normals are normal.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Don't assume your <em>data</em> is normal. Revenue, latency and counts rarely are: they are positive and lopsided. What's reliably normal is the sampling distribution of the mean (section 08).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Log-normal.</b> The Normal is symmetric and allows negative values. LeafBox's order values are neither: most orders are ₹200–600, a few bulk orders are ₹3,000, and none are below zero. What story makes positive, right-skewed numbers?</div>

  <h2 id="sdi-logn"><span class="num">07</span>Log-normal</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Order values are positive with a long right tail, so the Normal fits badly. Is there a story that turns "many small effects" into a skewed, positive shape?</p>
  </div>
  <p>An order value grows by percentages, not fixed amounts: more packets, a pricier blend, a gift box, each <em>multiplies</em> the total. When many small effects multiply instead of add, the result is positive and lopsided with a long right tail. Take the log and the multiplications become additions, so log(X) is normal. That is the <strong>Log-normal</strong>: order values, incomes, file sizes, session lengths.</p>
  <div class="flow"><span>X is log-normal</span><span>⇔</span><span>log(X) is normal</span></div>
  <h3>By hand</h3>
  <p>LeafBox: log(order value) ~ N(μ = ln 400 = 5.991, σ = 0.6). The <strong>median</strong> is e^μ = ₹400 (half the logs are below μ, so half the values below e^μ). The <strong>mean</strong> is e^(μ + σ²/2) = 400 × e^0.18 = 400 × 1.197 = ₹478.9, higher than the median because the long tail drags it up, exactly as with salaries in the Descriptive Statistics note. P(order &gt; ₹1000): z = (ln 1000 − ln 400)/0.6 = 0.916/0.6 = 1.53, so about 6.3%.</p>
  <div class="fx" data-lang="py">mu, sig = np.log(400), 0.6                  # log of order value (Rs) is N(mu, sig)
L = stats.lognorm(s=sig, scale=np.exp(mu))  # scipy: s = sigma of log, scale = e^mu
print("median:", round(L.median(), 1), " mean:", round(L.mean(), 1), " sd:", round(L.std(), 1))
print("P(order &gt; 1000):", round(L.sf(1000), 4))
x = L.rvs(200, random_state=7)              # 200 orders
print("sample skew raw:", round(stats.skew(x), 2), " skew of log:", round(stats.skew(np.log(x)), 2))</div>
  <div class="fx" data-lang="text">median: 400.0  mean: 478.9  sd: 315.2
P(order &gt; 1000): 0.0634
sample skew raw: 1.4  skew of log: -0.0</div>
  <p>scipy's <code>lognorm</code> takes <code>s</code> = σ of the log and <code>scale</code> = e^μ. The 200 simulated orders have skewness 1.4, but their logs have skewness 0: taking the log turned a lopsided shape into a symmetric one. To model it: take <code>np.log</code>, use normal tools, then <code>np.exp</code> back.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Compound interest: ₹100 growing by a random few percent each year. After many years most accounts are moderate, but a few lucky ones are huge, because growth multiplies on growth.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>X is <strong>log-normal(μ, σ)</strong> if ln X ~ N(μ, σ²). Median e^μ, mean e^(μ + σ²/2), variance (e^(σ²) − 1)e^(2μ + σ²). Always positive and right-skewed.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Averaging logs and exponentiating gives the median (₹400), not the mean (₹479). If finance needs expected revenue, back-transform with the σ²/2 correction or average the raw values.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Central Limit Theorem.</b> We now have seven stories, but most real data fits none of them exactly. Yet the tests ahead all use the Normal. What lets us use a Normal for data that is not normal at all?</div>

  <h2 id="sdi-clt"><span class="num">08</span>Central Limit Theorem: Averages of Anything</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Order values are skewed (skew 2.26). The finance team reports the <em>average</em> of each day's 30 orders. What is the distribution of that average, and how much does it wobble from day to day?</p>
  </div>
  <p>The <a class="xref" data-note="st_probability">Probability</a> note stated the central limit theorem (CLT); here we use it as a distribution. In plain words: <strong>add up (or average) many independent values from almost any distribution, and the result is approximately Normal</strong>, centred on the true mean μ, with spread σ/√n. That spread of an average has its own name, the <strong>standard error</strong> (SE).</p>
  <h3>By hand</h3>
  <p>One order: mean μ = ₹479, standard deviation σ ≈ ₹316 (from the log-normal formula). The average of n = 30 orders: same centre ₹479, SE = 316/√30 = 316/5.48 = ₹57.7. So about 95% of days have an average order value within 479 ± 2 × 57.7, i.e. ₹364 to ₹594, even though single orders range from ₹100 to ₹3,000.</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
orders = rng.lognormal(mean=np.log(400), sigma=0.6, size=(20000, 30))  # 20,000 days x 30 orders
day_avg = orders.mean(axis=1)
print("one order : mean", round(orders.mean(), 1), " sd", round(orders.std(), 1), " skew", round(stats.skew(orders.ravel()), 2))
print("avg of 30 : mean", round(day_avg.mean(), 1), " sd", round(day_avg.std(), 1), " skew", round(stats.skew(day_avg), 2))
print("sd / sqrt(30) =", round(orders.std() / np.sqrt(30), 1))</div>
  <div class="fx" data-lang="text">one order : mean 479.5  sd 315.9  skew 2.26
avg of 30 : mean 479.5  sd 57.7  skew 0.4
sd / sqrt(30) = 57.7</div>
  <p>The code simulates 20,000 days of 30 orders each. Single orders: sd 316, skew 2.26. Daily averages: the same mean, sd 57.7 (exactly σ/√30), and skew down to 0.4. Skew of an average shrinks like 1/√n (2.26/√30 = 0.41), so more orders per day make it ever more bell-shaped.</p>
  <figure class="viz"><svg viewBox="0 0 620 170" width="620"><g transform="translate(10,0)"><text x="140.0" y="14" text-anchor="middle" font-size="11.5" font-weight="700">one order: skewed (skew 2.26)</text><path d="M0.5,134V133.9H6.5V134M7.5,134V128.9H13.5V134M14.5,134V106.8H20.5V134M21.5,134V77.4H27.5V134M28.5,134V51.1H34.5V134M35.5,134V32.5H41.5V134M42.5,134V24.0H48.5V134M49.5,134V26.9H55.5V134M56.5,134V32.9H62.5V134M63.5,134V39.7H69.5V134M70.5,134V46.8H76.5V134M77.5,134V55.0H83.5V134M84.5,134V67.2H90.5V134M91.5,134V73.8H97.5V134M98.5,134V82.2H104.5V134M105.5,134V85.7H111.5V134M112.5,134V93.6H118.5V134M119.5,134V98.2H125.5V134M126.5,134V106.0H132.5V134M133.5,134V110.8H139.5V134M140.5,134V111.1H146.5V134M147.5,134V116.0H153.5V134M154.5,134V116.9H160.5V134M161.5,134V122.9H167.5V134M168.5,134V122.9H174.5V134M175.5,134V123.4H181.5V134M182.5,134V124.8H188.5V134M189.5,134V125.3H195.5V134M196.5,134V127.5H202.5V134M203.5,134V127.9H209.5V134M210.5,134V128.8H216.5V134M217.5,134V129.8H223.5V134M224.5,134V129.6H230.5V134M231.5,134V131.5H237.5V134M238.5,134V130.8H244.5V134M245.5,134V131.3H251.5V134M252.5,134V131.7H258.5V134M259.5,134V131.7H265.5V134M266.5,134V131.8H272.5V134M273.5,134V132.1H279.5V134" class="fr sr"/><line x1="0" y1="134" x2="280" y2="134" stroke="currentColor" stroke-opacity=".5"/><text x="0.0" y="148" text-anchor="middle" font-size="10.5">0</text><text x="70.0" y="148" text-anchor="middle" font-size="10.5">400</text><text x="140.0" y="148" text-anchor="middle" font-size="10.5">800</text><text x="210.0" y="148" text-anchor="middle" font-size="10.5">1200</text><text x="280.0" y="148" text-anchor="middle" font-size="10.5">1600</text></g><g transform="translate(330,0)"><text x="140.0" y="14" text-anchor="middle" font-size="11.5" font-weight="700">average of 30 orders: bell (skew 0.4)</text><path d="M0.5,134V134.0H6.5V134M7.5,134V133.9H13.5V134M14.5,134V134.0H20.5V134M21.5,134V133.9H27.5V134M28.5,134V133.9H34.5V134M35.5,134V133.3H41.5V134M42.5,134V132.8H48.5V134M49.5,134V130.7H55.5V134M56.5,134V127.1H62.5V134M63.5,134V121.5H69.5V134M70.5,134V109.9H76.5V134M77.5,134V97.7H83.5V134M84.5,134V80.1H90.5V134M91.5,134V63.9H97.5V134M98.5,134V50.2H104.5V134M105.5,134V39.5H111.5V134M112.5,134V29.5H118.5V134M119.5,134V24.0H125.5V134M126.5,134V31.7H132.5V134M133.5,134V37.2H139.5V134M140.5,134V50.8H146.5V134M147.5,134V58.6H153.5V134M154.5,134V74.0H160.5V134M161.5,134V84.4H167.5V134M168.5,134V94.5H174.5V134M175.5,134V105.4H181.5V134M182.5,134V111.0H188.5V134M189.5,134V118.4H195.5V134M196.5,134V122.3H202.5V134M203.5,134V126.7H209.5V134M210.5,134V128.9H216.5V134M217.5,134V130.8H223.5V134M224.5,134V131.6H230.5V134M231.5,134V132.5H237.5V134M238.5,134V133.5H244.5V134M245.5,134V133.5H251.5V134M252.5,134V133.5H258.5V134M259.5,134V133.8H265.5V134M266.5,134V133.9H272.5V134M273.5,134V134.0H279.5V134" class="fb sb"/><line x1="0" y1="134" x2="280" y2="134" stroke="currentColor" stroke-opacity=".5"/><text x="28.0" y="148" text-anchor="middle" font-size="10.5">300</text><text x="84.0" y="148" text-anchor="middle" font-size="10.5">400</text><text x="140.0" y="148" text-anchor="middle" font-size="10.5">500</text><text x="196.0" y="148" text-anchor="middle" font-size="10.5">600</text><text x="252.0" y="148" text-anchor="middle" font-size="10.5">700</text></g></svg><figcaption>Left: 20,000 single order values (log-normal, long right tail). Right: 20,000 daily averages of 30 orders. Same centre (≈ ₹479), spread shrinks from 316 to 316/√30 = 57.7, and the shape turns into a bell.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>One customer's mood is unpredictable; the average mood of a full stadium barely moves from match to match. Individual extremes cancel out in a crowd, and what is left is a narrow bell.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Central limit theorem</strong>: if X₁ … Xₙ are independent with mean μ and finite variance σ², then (X̄ − μ)/(σ/√n) → N(0, 1) as n grows. The distribution of a statistic (like X̄) over repeated samples is its <strong>sampling distribution</strong>; its standard deviation is the <strong>standard error</strong>, SE = σ/√n for a mean.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The CLT is about the <em>average</em>, not the data: the orders themselves stay skewed no matter how many you collect. And "n = 30 is enough" is folklore: very skewed or heavy-tailed data needs more, and infinite-variance data never gets there.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Student's t.</b> The CLT's band X̄ ± 1.96·σ/√n needs the true σ. In practice we estimate σ from the same sample. With 30 orders that's fine; with 5 packets the estimate itself is shaky. How much wider must the band be?</div>

  <h2 id="sdi-t"><span class="num">09</span>Student's t: Small Samples, Unknown σ</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A worker weighs 5 packets from machine A: 497, 503, 492, 499, 494 g. Nobody knows the machine's true σ today. If we standardise the mean using the sample's own s, does it still follow N(0, 1)?</p>
  </div>
  <h3>By hand</h3>
  <p>Mean = (497 + 503 + 492 + 499 + 494)/5 = 2485/5 = 497. Deviations: 0, 6, −5, 2, −3; squares 0, 36, 25, 4, 9, sum 74. Sample variance s² = 74/(5 − 1) = 18.5 (n − 1, Bessel's correction, from the Descriptive note), s = 4.301. Standard error = s/√5 = 4.301/2.236 = 1.924. The standardised distance from the target 500 is t = (497 − 500)/1.924 = −1.56.</p>
  <p>If we had used the true σ this would be a z, following N(0, 1). But s is itself random: in some samples it comes out too small, which makes t too large. So t has <em>fatter tails</em> than the normal. William Gosset worked out its exact shape in 1908 (publishing as "Student"): the <strong>t-distribution with n − 1 degrees of freedom</strong> (df). Degrees of freedom = how many independent pieces of information s is built from: 5 deviations that must sum to 0 leave 4 free.</p>
  <div class="fx" data-lang="py">w = np.array([497, 503, 492, 499, 494])     # 5 packets from machine A
m, s = w.mean(), w.std(ddof=1)
se = s / np.sqrt(len(w))
print("mean", m, " s", round(s, 3), " SE", round(se, 3), " t", round((m - 500) / se, 3))
for df in (4, 9, 29, 1000):
    print(f"df={df:4d}: 97.5% point of t = {stats.t.ppf(0.975, df):.3f}")
print("normal 97.5% point =", round(stats.norm.ppf(0.975), 3))
print("95% interval:", round(m - stats.t.ppf(0.975, 4) * se, 2), "to", round(m + stats.t.ppf(0.975, 4) * se, 2))</div>
  <div class="fx" data-lang="text">mean 497.0  s 4.301  SE 1.924  t -1.56
df=   4: 97.5% point of t = 2.776
df=   9: 97.5% point of t = 2.262
df=  29: 97.5% point of t = 2.045
df=1000: 97.5% point of t = 1.962
normal 97.5% point = 1.96
95% interval: 491.66 to 502.34</div>
  <p>With 4 df, 95% of the t-curve lies within ±2.776, not ±1.96. With 9 df it is 2.262, with 29 df 2.045, and by 1000 df it is the normal's 1.96: more data, better s, t → z. So a 95% interval for machine A's true mean is 497 ± 2.776 × 1.924 = 491.66 to 502.34 g. The target 500 is inside, and |t| = 1.56 &lt; 2.776: no evidence the machine is off. (That reasoning <em>is</em> a t-test; the <a class="xref" data-note="st_hypothesis">Hypothesis Testing</a> note builds it properly.)</p>
  <figure class="viz"><svg viewBox="0 0 560 175" width="560"><line x1="30" y1="140" x2="550" y2="140" stroke="currentColor" stroke-opacity=".5"/><text x="30.0" y="155" text-anchor="middle" font-size="10.5">-4</text><text x="95.0" y="155" text-anchor="middle" font-size="10.5">-3</text><text x="160.0" y="155" text-anchor="middle" font-size="10.5">-2</text><text x="225.0" y="155" text-anchor="middle" font-size="10.5">-1</text><text x="290.0" y="155" text-anchor="middle" font-size="10.5">0</text><text x="355.0" y="155" text-anchor="middle" font-size="10.5">1</text><text x="420.0" y="155" text-anchor="middle" font-size="10.5">2</text><text x="485.0" y="155" text-anchor="middle" font-size="10.5">3</text><text x="550.0" y="155" text-anchor="middle" font-size="10.5">4</text><path d="M30.0,140.0 L36.5,139.9 L43.0,139.9 L49.5,139.9 L56.0,139.8 L62.5,139.7 L69.0,139.6 L75.5,139.5 L82.0,139.3 L88.5,139.0 L95.0,138.7 L101.5,138.2 L108.0,137.6 L114.5,136.9 L121.0,135.9 L127.5,134.7 L134.0,133.3 L140.5,131.5 L147.0,129.4 L153.5,126.8 L160.0,123.8 L166.5,120.3 L173.0,116.3 L179.5,111.8 L186.0,106.7 L192.5,101.1 L199.0,95.1 L205.5,88.6 L212.0,81.7 L218.5,74.6 L225.0,67.4 L231.5,60.2 L238.0,53.1 L244.5,46.3 L251.0,40.0 L257.5,34.4 L264.0,29.5 L270.5,25.6 L277.0,22.7 L283.5,20.9 L290.0,20.3 L296.5,20.9 L303.0,22.7 L309.5,25.6 L316.0,29.5 L322.5,34.4 L329.0,40.0 L335.5,46.3 L342.0,53.1 L348.5,60.2 L355.0,67.4 L361.5,74.6 L368.0,81.7 L374.5,88.6 L381.0,95.1 L387.5,101.1 L394.0,106.7 L400.5,111.8 L407.0,116.3 L413.5,120.3 L420.0,123.8 L426.5,126.8 L433.0,129.4 L439.5,131.5 L446.0,133.3 L452.5,134.7 L459.0,135.9 L465.5,136.9 L472.0,137.6 L478.5,138.2 L485.0,138.7 L491.5,139.0 L498.0,139.3 L504.5,139.5 L511.0,139.6 L517.5,139.7 L524.0,139.8 L530.5,139.9 L537.0,139.9 L543.5,139.9 L550.0,140.0" fill="none" class="sb" stroke-width="2"/><path d="M30.0,138.0 L36.5,137.8 L43.0,137.5 L49.5,137.3 L56.0,137.0 L62.5,136.6 L69.0,136.2 L75.5,135.8 L82.0,135.3 L88.5,134.7 L95.0,134.1 L101.5,133.4 L108.0,132.5 L114.5,131.6 L121.0,130.5 L127.5,129.3 L134.0,127.9 L140.5,126.3 L147.0,124.5 L153.5,122.4 L160.0,120.1 L166.5,117.5 L173.0,114.5 L179.5,111.1 L186.0,107.3 L192.5,103.1 L199.0,98.5 L205.5,93.4 L212.0,87.8 L218.5,81.9 L225.0,75.6 L231.5,69.1 L238.0,62.4 L244.5,55.7 L251.0,49.3 L257.5,43.3 L264.0,38.0 L270.5,33.6 L277.0,30.3 L283.5,28.2 L290.0,27.5 L296.5,28.2 L303.0,30.3 L309.5,33.6 L316.0,38.0 L322.5,43.3 L329.0,49.3 L335.5,55.7 L342.0,62.4 L348.5,69.1 L355.0,75.6 L361.5,81.9 L368.0,87.8 L374.5,93.4 L381.0,98.5 L387.5,103.1 L394.0,107.3 L400.5,111.1 L407.0,114.5 L413.5,117.5 L420.0,120.1 L426.5,122.4 L433.0,124.5 L439.5,126.3 L446.0,127.9 L452.5,129.3 L459.0,130.5 L465.5,131.6 L472.0,132.5 L478.5,133.4 L485.0,134.1 L491.5,134.7 L498.0,135.3 L504.5,135.8 L511.0,136.2 L517.5,136.6 L524.0,137.0 L530.5,137.3 L537.0,137.5 L543.5,137.8 L550.0,138.0" fill="none" class="sr" stroke-width="2" stroke-dasharray="5 3"/><line x1="417.4" y1="140" x2="417.4" y2="80" class="sb" stroke-width="1.2"/><line x1="470.4" y1="140" x2="470.4" y2="80" class="sr" stroke-width="1.2"/><text x="413.4" y="76" text-anchor="end" font-size="10.5">normal 1.96</text><text x="474.4" y="76" font-size="10.5">t(4) 2.776</text><rect x="360" y="12" width="14" height="4" class="fb sb"/><text x="380" y="18" font-size="10.5">standard normal N(0,1)</text><rect x="360" y="28" width="14" height="4" class="fr sr"/><text x="380" y="34" font-size="10.5">t with 4 df (n = 5)</text></svg><figcaption>The t-curve (dashed) is lower in the middle and fatter in the tails than the normal, because s is itself a noisy guess of σ. To hold 95% in the middle it must reach out to ±2.776 instead of ±1.96.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Measuring a room with a tape you are not sure is accurate. You add a safety margin. With only 5 measurements the margin must be generous (2.776); with 1,000 you trust the tape and the margin shrinks to the usual 1.96.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>If X₁ … Xₙ are independent N(μ, σ²), then T = (X̄ − μ)/(s/√n) follows <strong>Student's t with ν = n − 1 degrees of freedom</strong>: symmetric, centred at 0, variance ν/(ν − 2) &gt; 1, tending to N(0, 1) as ν → ∞. Equivalently T = Z/√(V/ν) with Z ~ N(0, 1) and V ~ χ²(ν) independent.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The exact t needs normal data when n is small. With 5 packets from a normal filling machine it is fine; with 5 skewed order values it is not (neither the CLT nor the t can rescue n = 5 from heavy skew).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: χ² and F.</b> The t handles questions about a <em>mean</em>. The quality team asks about <em>spread</em>: "is machine A's σ still 10 g?", "is machine B wobblier than A?" And the sales team asks whether packet counts still follow last month's PMF. What curves govern variances and counts?</div>

  <h2 id="sdi-chif"><span class="num">10</span>χ² and F: Variances and Counts</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A sample variance, a sum of (observed − expected)² over categories, a ratio of two variances: none of these is a mean, so neither z nor t applies. What are their distributions?</p>
  </div>
  <h3>χ² (chi-square): sums of squared z's</h3>
  <p>Square a standard normal z and add up k independent ones: the total follows a <strong>χ² with k degrees of freedom</strong>. It is never negative, skewed right, with mean k. It appears whenever we add up squared standardised gaps.</p>
  <p><strong>Use 1: a variance.</strong> For normal data, (n − 1)s²/σ² ~ χ²(n − 1). For machine A with the claimed σ = 10: 4 × 18.5/100 = 0.74 on 4 df. A χ²(4) averages 4, so 0.74 is small: only 5.4% of samples would show this little spread. If anything, machine A is steadier than claimed.</p>
  <p><strong>Use 2: counts vs a story (goodness of fit).</strong> Section 01's PMF says packets 1–4 occur 40/30/20/10%. This week's 50 orders had 22, 14, 9, 5. Expected: 20, 15, 10, 5. Each category adds (O − E)²/E:</p>
  <table class="tbl">
    <tr><th>packets</th><th>observed O</th><th>expected E = 50 × p</th><th>(O − E)²/E</th></tr>
    <tr><td>1</td><td>22</td><td>20</td><td>4/20 = 0.200</td></tr>
    <tr><td>2</td><td>14</td><td>15</td><td>1/15 = 0.067</td></tr>
    <tr><td>3</td><td>9</td><td>10</td><td>1/10 = 0.100</td></tr>
    <tr><td>4</td><td>5</td><td>5</td><td>0</td></tr>
    <tr><td colspan="3"><strong>χ² (df = 4 categories − 1 = 3)</strong></td><td><strong>0.367</strong></td></tr>
  </table>
  <p>A χ²(3) averages 3; 0.367 is tiny, p = 0.95: this week fits last month's PMF very well.</p>
  <h3>F: the ratio of two variances</h3>
  <p>Machine B's 5 packets: 505, 490, 512, 498, 495. Mean 500; deviations 5, −10, 12, −2, −5; squares 25, 100, 144, 4, 25 = 298; s² = 298/4 = 74.5. Is B wobblier than A? Compare the variances as a ratio: F = 74.5/18.5 = 4.03. Each s² is (σ²/df) × χ², so if both machines had the same σ, their ratio follows the <strong>F-distribution with (4, 4) df</strong>.</p>
  <div class="fx" data-lang="py">chi = (len(w) - 1) * w.var(ddof=1) / 10**2  # is machine A's sd still 10 g?
print("chi2 stat for variance:", round(chi, 3), " df 4, P(chi2 &lt;= this):", round(stats.chi2.cdf(chi, 4), 4))
obs = np.array([22, 14, 9, 5])              # 50 orders: 1,2,3,4 packets
exp = 50 * pmf                              # the PMF from section 01
gof = ((obs - exp) ** 2 / exp).sum()
print("goodness-of-fit chi2:", round(gof, 4), " p =", round(stats.chi2.sf(gof, 3), 4))
res = stats.chisquare(obs, exp)
print("scipy chisquare:", round(float(res.statistic), 4), round(float(res.pvalue), 4))
wB = np.array([505, 490, 512, 498, 495])    # 5 packets from machine B
F = wB.var(ddof=1) / w.var(ddof=1)
print("var A", w.var(ddof=1), " var B", wB.var(ddof=1), " F =", round(F, 3))
print("F(4,4) 97.5% point:", round(stats.f.ppf(0.975, 4, 4), 3), " p (two-sided):", round(2 * stats.f.sf(F, 4, 4), 4))</div>
  <div class="fx" data-lang="text">chi2 stat for variance: 0.74  df 4, P(chi2 &lt;= this): 0.0537
goodness-of-fit chi2: 0.3667  p = 0.947
scipy chisquare: 0.3667 0.947
var A 18.5  var B 74.5  F = 4.027
F(4,4) 97.5% point: 9.605  p (two-sided): 0.2059</div>
  <p>The variance statistic 0.74 and the goodness-of-fit 0.367 match the hand work, and <code>stats.chisquare</code> agrees. For F, 97.5% of an F(4, 4) lies below 9.6, so even a 4× variance ratio is not convincing with 5 packets each (p = 0.21). Small samples tell you little about spread. These three curves (t, χ², F) are the sampling distributions behind the t-test, the chi-square test and ANOVA in the next notes.</p>
  <table class="tbl">
    <tr><th>Distribution</th><th>Built from</th><th>Used for</th><th>LeafBox value</th></tr>
    <tr><td>t(ν)</td><td>Z / √(χ²(ν)/ν)</td><td>means with unknown σ</td><td>t = −1.56, df 4</td></tr>
    <tr><td>χ²(k)</td><td>Z₁² + … + Z_k²</td><td>one variance; counts vs expected; independence tables</td><td>0.74 (df 4); 0.367 (df 3)</td></tr>
    <tr><td>F(d₁, d₂)</td><td>(χ²(d₁)/d₁) / (χ²(d₂)/d₂)</td><td>ratio of variances; ANOVA; regression F</td><td>4.03 (4, 4)</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>χ² is a "total surprise" meter: each category or each observation adds its own squared surprise. F is a "who is noisier" scale: put two surprise meters on either side and see which way it tips.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>If Z₁ … Z_k are independent N(0, 1), Σ Zᵢ² ~ <strong>χ²(k)</strong>, mean k, variance 2k. If U ~ χ²(d₁) and V ~ χ²(d₂) are independent, (U/d₁)/(V/d₂) ~ <strong>F(d₁, d₂)</strong>. Note t(ν)² = F(1, ν).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The variance tests (χ² for one σ, F for two) are very sensitive to non-normal data, much more than the t-test. For real data prefer Levene's test for equal variances. The count χ² needs expected counts of about 5 or more per cell.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Checking the fit.</b> Everything so far starts with "if the data follows story X". The t and the variance tests assume normal packets; we called order values log-normal. How do we check whether a story actually fits the data in front of us?</div>

  <h2 id="sdi-check"><span class="num">11</span>Checking the Fit: QQ-plot &amp; Shapiro-Wilk</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We claimed packets are Normal and orders are Log-normal. Is that true for the data we actually have, and how would we see it?</p>
  </div>
  <p>Two tools: a picture and a test. The <strong>QQ-plot</strong> (quantile-quantile) sorts your data and plots each value against where a perfect normal would have put it. If the story fits, the points land on a straight line. Lopsided data bends into a banana. Heavy tails make an S.</p>
  <p><strong>By hand on 5 packets.</strong> Sorted: 492, 494, 497, 499, 503. A normal sample of 5 would place its values near the z-quantiles −1.18, −0.50, 0, 0.50, 1.18 (the middle of 5 equal slices of the bell). Plot (−1.18, 492), (−0.50, 494), (0, 497), (0.50, 499), (1.18, 503): the points rise steadily, nearly a straight line with slope about s ≈ 4.3. No bend, no S: consistent with normal (5 points can't show much more).</p>
  <figure class="viz"><svg viewBox="0 0 560 186" width="560"><g transform="translate(0,0)"><text x="140" y="12" text-anchor="middle" font-weight="bold" font-size="11">normal sample: on the line</text><g transform="translate(0,16)"><line x1="10" y1="152" x2="270" y2="152" stroke="currentColor" stroke-opacity=".5"/><text x="40" y="167" text-anchor="middle" font-size="11">-2</text><text x="140" y="167" text-anchor="middle" font-size="11">0</text><text x="240" y="167" text-anchor="middle" font-size="11">2</text><text x="270" y="147" text-anchor="end" font-size="11" class="tm">theoretical</text><line x1="15" y1="149.9" x2="265" y2="44" class="sr" stroke-width="1.2" stroke-dasharray="4 3"/><path d="M20.9,144.5h0M38.3,142.7h0M48.3,140.7h0M55.7,139.9h0M61.5,136h0M66.5,134.5h0M70.8,134h0M74.6,130h0M78.1,128.9h0M81.4,126.6h0M84.4,118.8h0M87.2,118.7h0M89.8,117.9h0M92.3,117.3h0M94.7,117.3h0M97,115.6h0M99.3,115.5h0M101.4,113.8h0M103.5,113.6h0M105.5,110.3h0M107.4,110.2h0M109.3,109.9h0M111.2,108.8h0M113,108.1h0M114.8,106.7h0M116.6,104.7h0M118.3,104.7h0M120,103.5h0M121.7,103.1h0M123.3,102.4h0M125,102.3h0M126.6,101.7h0M128.2,101.1h0M129.8,100.7h0M131.4,99.9h0M133,99.7h0M134.5,99.7h0M136.1,98.7h0M137.7,97.8h0M139.2,96.5h0M140.8,96.5h0M142.3,94.3h0M143.9,91.3h0M145.5,88.9h0M147,88.8h0M148.6,88.8h0M150.2,87.9h0M151.8,87.7h0M153.4,87.5h0M155,86h0M156.7,86h0M158.3,85.3h0M160,84.4h0M161.7,84h0M163.4,83.4h0M165.2,82.7h0M167,82.6h0M168.8,82.5h0M170.7,82.3h0M172.6,82h0M174.5,81.9h0M176.5,80.7h0M178.6,80.5h0M180.7,79.8h0M183,79h0M185.3,78.2h0M187.7,77.2h0M190.2,77.1h0M192.8,75.7h0M195.6,75.4h0M198.6,73.9h0M201.9,71.8h0M205.4,70.7h0M209.2,70.4h0M213.5,67.3h0M218.5,66.5h0M224.3,64h0M231.7,63.4h0M241.7,58.9h0M259.1,53.4h0" class="sb" stroke-width="5.2" stroke-linecap="round" stroke-opacity=".75"/></g></g><g transform="translate(280,0)"><text x="140" y="12" text-anchor="middle" font-weight="bold" font-size="11">log-normal sample: curves up</text><g transform="translate(0,16)"><line x1="10" y1="152" x2="270" y2="152" stroke="currentColor" stroke-opacity=".5"/><text x="40" y="167" text-anchor="middle" font-size="11">-2</text><text x="140" y="167" text-anchor="middle" font-size="11">0</text><text x="240" y="167" text-anchor="middle" font-size="11">2</text><text x="270" y="147" text-anchor="end" font-size="11" class="tm">theoretical</text><line x1="15" y1="149.9" x2="265" y2="44" class="sr" stroke-width="1.2" stroke-dasharray="4 3"/><path d="M26.3,117.2h0M44.3,116.3h0M54.9,115.7h0M62.7,115.2h0M68.9,115.2h0M74.2,115.1h0M78.9,114.6h0M83,114.5h0M86.8,114.4h0M90.4,113.1h0M93.7,112.1h0M96.8,112h0M99.7,111.6h0M102.5,111.5h0M105.2,110.9h0M107.8,110.4h0M110.3,110.3h0M112.8,109.6h0M115.1,109.4h0M117.5,109h0M119.7,108.4h0M122,108h0M124.2,107.6h0M126.3,107.2h0M128.5,107h0M130.6,106.8h0M132.7,106h0M134.8,105.8h0M136.9,104.9h0M139,104.4h0M141,103.9h0M143.1,102.1h0M145.2,101.4h0M147.3,100.5h0M149.4,100.4h0M151.5,100.1h0M153.7,99.1h0M155.8,98.5h0M158,96.6h0M160.3,96.3h0M162.5,95.9h0M164.9,95.6h0M167.2,95.3h0M169.7,93.1h0M172.2,91h0M174.8,90.6h0M177.5,88h0M180.3,85.4h0M183.2,83.2h0M186.3,79.7h0M189.6,78.1h0M193.2,76.5h0M197,75.8h0M201.1,75.8h0M205.8,75.4h0M211.1,68.5h0M217.3,65.7h0M225.1,42.6h0M235.7,37.2h0M253.7,8h0" class="sb" stroke-width="5.2" stroke-linecap="round" stroke-opacity=".75"/></g></g></svg><figcaption>QQ-plot: sorted data vs where a normal would put them. Straight line = normal; a banana = skew. Right: 200 log-normal order values.</figcaption></figure>
  <p>Left: a normal sample hugs the dashed line. Right: 200 log-normal order values peel upward at the top, because their biggest values are far bigger than a normal would produce.</p>
  <p>The <strong>Shapiro-Wilk</strong> test turns the same idea into a number: its p-value is the chance of seeing data this far from normal if the data really were normal. A small p (under 0.05) says "not normal".</p>
  <div class="fx" data-lang="py">x = L.rvs(200, random_state=7)              # the same 200 orders as section 07
for name, data in [("order value", x), ("log(order value)", np.log(x))]:
    (theo, ordered), (slope, icpt, r) = stats.probplot(data, dist="norm")
    W, p = stats.shapiro(data)
    print(f"{name:17s} QQ straightness r={r:.4f}  Shapiro W={W:.3f} p={p:.4f}")
rng = np.random.default_rng(0)
near = 500 + 10 * rng.standard_t(20, 5000)  # almost normal weights, slightly heavy tails
for n in (50, 5000):
    print(f"near-normal n={n:5d}: Shapiro p = {stats.shapiro(near[:n])[1]:.4f}")</div>
  <div class="fx" data-lang="text">order value       QQ straightness r=0.9379  Shapiro W=0.879 p=0.0000
log(order value)  QQ straightness r=0.9970  Shapiro W=0.991 p=0.2614
near-normal n=   50: Shapiro p = 0.3062
near-normal n= 5000: Shapiro p = 0.0085</div>
  <p><code>stats.probplot</code> returns the QQ points and the correlation r of the fitted line: raw order values r = 0.938 (a clear bend) and Shapiro p = 0.0000; their logs r = 0.997 and p = 0.26, consistent with normal. That confirms the log-normal story. Now the catch in the last two lines: the <em>same</em> almost-normal packet data passes with 50 rows and fails with 5,000. More data lets the test detect tinier deviations, even ones that don't matter.</p>
  <table class="tbl">
    <tr><th>Tool</th><th>Reads as</th><th>Caveat</th></tr>
    <tr><td><strong>QQ-plot</strong></td><td>Points on the line → fits; banana → skew; S-shape → heavy/light tails</td><td>Best first look; shows <em>how</em> it doesn't fit; works for any distribution (<code>dist=</code>)</td></tr>
    <tr><td><strong>Shapiro-Wilk</strong></td><td>H₀: data is normal. p &lt; 0.05 → reject</td><td>Tiny n: never rejects. Huge n: rejects trivial deviations</td></tr>
    <tr><td><strong>Skew / kurtosis</strong></td><td>Near 0 / 0 → roughly normal</td><td>Quick numeric summary (Descriptive note)</td></tr>
    <tr><td><strong>χ² goodness of fit</strong></td><td>Counts vs a discrete story (section 10)</td><td>Expected counts ≥ 5 per cell</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A QQ-plot is trying on a shoe: line up your foot (sorted data) against the shoe's shape (theoretical quantiles). Where it pinches, the bend shows you exactly which part does not fit.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>QQ-plot</strong> plots the sorted sample x₍ᵢ₎ against the theoretical quantiles F⁻¹((i − 0.5)/n) (or a similar plotting position) of a reference distribution F. A straight line means the sample matches F up to location and scale.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>With big data, almost everything "fails" a normality test. Judge the QQ-plot and ask "is it normal <em>enough</em> for my method?" A t-test on 5,000 rows only needs the mean to be normal, which the CLT guarantees.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Which distribution?</b> We can now test a guess. But where does the first guess come from when a new variable lands on your desk, and why does it matter for ML?</div>

  <h2 id="sdi-which"><span class="num">12</span>Which Distribution?</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Faced with a new variable, how do we choose a story before fitting anything, and what changes in practice if we choose wrong?</p>
  </div>
  <p>In practice you go the other way: look at how the data is <em>generated</em>, match the story, then check with a QQ-plot.</p>
  <table class="tbl">
    <tr><th>Your data is…</th><th>Use</th><th>LeafBox example</th></tr>
    <tr><td>One yes/no outcome</td><td>Bernoulli</td><td>did the visitor buy?</td></tr>
    <tr><td>Count of yeses out of a fixed n</td><td>Binomial</td><td>buyers out of 100 visitors</td></tr>
    <tr><td>Count per time/space, no upper limit</td><td>Poisson (Neg. Binomial if var ≫ mean)</td><td>orders per hour</td></tr>
    <tr><td>Time until an event, constant rate</td><td>Exponential (Weibull if the rate changes with age)</td><td>minutes to next order</td></tr>
    <tr><td>Equal chance over a range</td><td>Uniform</td><td>minute of a single order in the hour</td></tr>
    <tr><td>Symmetric, many small additive effects</td><td>Normal</td><td>packet weight</td></tr>
    <tr><td>Positive, right-skewed, multiplicative</td><td>Log-normal</td><td>order value</td></tr>
    <tr><td>An average or sum of many values</td><td>Normal by the CLT (t if σ estimated, small n)</td><td>daily average order value</td></tr>
    <tr><td>A variance, a sum of squared gaps, a ratio of variances</td><td>χ², F</td><td>machine A vs B spread</td></tr>
  </table>
  <div class="callout intu"><span class="label">Why ML cares</span>
    <p>Choosing a loss function is choosing a distribution for the target: MSE assumes Normal errors, log-loss assumes a Bernoulli target, Poisson deviance assumes Poisson counts. A count target (orders per hour) trained with MSE can predict negative orders; a log-normal target (order value) trained with MSE on the raw scale is dominated by a few bulk orders, so train on log(value) or use a Gamma/Tweedie loss.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Choosing by the histogram's look alone. A Poisson with large λ and a Normal look alike; what decides is the story (counts can't be negative or fractional) and the variance-mean relationship.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How it all connects.</b> We have met twelve ideas one at a time. How are they built from each other, and which one answers which question?</div>

  <h2 id="sdi-connect"><span class="num">13</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Bernoulli, Binomial, Poisson, Exponential, Uniform, Normal, Log-normal, CLT, t, χ², F, QQ-plot: seven formulas and five tools, or one family grown from a coin flip?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 350" width="680">
<defs><marker id="sdi-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="125" height="44" rx="7" class="fb sb"/><text x="72" y="29" text-anchor="middle" font-size="11.5" font-weight="700">Bernoulli(0.03)</text><text x="72" y="45" text-anchor="middle" class="tm" font-size="10">one visitor</text>
<line x1="135" y1="32" x2="178" y2="32" stroke="currentColor" marker-end="url(#sdi-a9)"/><text x="157" y="24" text-anchor="middle" class="tm" font-size="9.5">add n</text>
<rect x="180" y="10" width="130" height="44" rx="7" class="fb sb"/><text x="245" y="29" text-anchor="middle" font-size="11.5" font-weight="700">Binomial(100, .03)</text><text x="245" y="45" text-anchor="middle" class="tm" font-size="10">mean 3, P(5+) .18</text>
<line x1="310" y1="32" x2="378" y2="32" stroke="currentColor" marker-end="url(#sdi-a9)"/><text x="344" y="24" text-anchor="middle" class="tm" font-size="9.5">n large</text>
<rect x="380" y="10" width="130" height="44" rx="7" class="ft st"/><text x="445" y="29" text-anchor="middle" font-size="11.5" font-weight="700">Normal(500, 10)</text><text x="445" y="45" text-anchor="middle" class="tm" font-size="10">P(&gt;515) = .067</text>
<line x1="510" y1="32" x2="543" y2="32" stroke="currentColor" marker-end="url(#sdi-a9)"/><text x="527" y="24" text-anchor="middle" class="tm" font-size="9.5">exp</text>
<rect x="545" y="10" width="125" height="44" rx="7" class="ft st"/><text x="607" y="29" text-anchor="middle" font-size="11.5" font-weight="700">Log-normal</text><text x="607" y="45" text-anchor="middle" class="tm" font-size="10">median 400, mean 479</text>
<line x1="245" y1="54" x2="245" y2="98" stroke="currentColor" marker-end="url(#sdi-a9)"/><text x="252" y="80" class="tm" font-size="9.5">n huge, p tiny, λ = np</text>
<rect x="180" y="100" width="130" height="44" rx="7" class="fb sb"/><text x="245" y="119" text-anchor="middle" font-size="11.5" font-weight="700">Poisson(4)</text><text x="245" y="135" text-anchor="middle" class="tm" font-size="10">P(0) .018, P(8+) .051</text>
<line x1="180" y1="122" x2="137" y2="122" stroke="currentColor" marker-end="url(#sdi-a9)"/><text x="158" y="114" text-anchor="middle" class="tm" font-size="9.5">gaps</text>
<rect x="10" y="100" width="125" height="44" rx="7" class="ft st"/><text x="72" y="119" text-anchor="middle" font-size="11.5" font-weight="700">Exponential(15)</text><text x="72" y="135" text-anchor="middle" class="tm" font-size="10">P(wait&gt;30) .135</text>
<line x1="72" y1="144" x2="72" y2="183" stroke="currentColor" marker-end="url(#sdi-a9)"/><text x="80" y="168" class="tm" font-size="9.5">where is the 1 event?</text>
<rect x="10" y="185" width="125" height="40" rx="7" class="ft st"/><text x="72" y="203" text-anchor="middle" font-size="11.5" font-weight="700">Uniform(0, 60)</text><text x="72" y="218" text-anchor="middle" class="tm" font-size="10">P(first 15 min) .25</text>
<line x1="300" y1="100" x2="395" y2="56" stroke="currentColor" stroke-opacity=".6" marker-end="url(#sdi-a9)"/><text x="355" y="90" class="tm" font-size="9.5">λ large</text>
<rect x="380" y="100" width="130" height="44" rx="7" class="fg sg"/><text x="445" y="119" text-anchor="middle" font-size="11.5" font-weight="700">CLT</text><text x="445" y="135" text-anchor="middle" class="tm" font-size="10">avg of 30: SE 57.7</text>
<line x1="445" y1="100" x2="445" y2="56" stroke="currentColor" marker-end="url(#sdi-a9)"/><line x1="565" y1="56" x2="510" y2="110" stroke="currentColor" stroke-opacity=".6" marker-end="url(#sdi-a9)"/><text x="548" y="92" class="tm" font-size="9.5">its averages</text>
<line x1="420" y1="144" x2="330" y2="183" stroke="currentColor" marker-end="url(#sdi-a9)"/><text x="335" y="164" class="tm" font-size="9.5">σ unknown → s</text>
<line x1="470" y1="144" x2="515" y2="183" stroke="currentColor" marker-end="url(#sdi-a9)"/><text x="500" y="164" class="tm" font-size="9.5">square &amp; add</text>
<rect x="250" y="185" width="130" height="44" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="315" y="204" text-anchor="middle" font-size="11.5" font-weight="700">t (df 4)</text><text x="315" y="220" text-anchor="middle" class="tm" font-size="10">±2.776, not ±1.96</text>
<rect x="450" y="185" width="110" height="44" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="505" y="204" text-anchor="middle" font-size="11.5" font-weight="700">χ² (df k)</text><text x="505" y="220" text-anchor="middle" class="tm" font-size="10">0.74; GOF 0.367</text>
<line x1="560" y1="207" x2="588" y2="207" stroke="currentColor" marker-end="url(#sdi-a9)"/><text x="574" y="199" text-anchor="middle" class="tm" font-size="9.5">ratio</text>
<rect x="590" y="185" width="80" height="44" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="630" y="204" text-anchor="middle" font-size="11.5" font-weight="700">F(4, 4)</text><text x="630" y="220" text-anchor="middle" class="tm" font-size="10">4.03</text>
<line x1="450" y1="207" x2="382" y2="207" stroke="currentColor" stroke-opacity=".6" stroke-dasharray="4 3"/><text x="416" y="246" text-anchor="middle" class="tm" font-size="9.5">t = z / √(χ²/df)</text>
<rect x="150" y="280" width="420" height="44" rx="7" class="fr sr"/><text x="360" y="299" text-anchor="middle" font-size="11.5" font-weight="700">QQ-plot &amp; Shapiro-Wilk: does a story fit the data?</text><text x="360" y="315" text-anchor="middle" class="tm" font-size="10">order values r = 0.938 (no) · log order values r = 0.997 (yes)</text>
<line x1="360" y1="255" x2="360" y2="278" stroke="currentColor" marker-end="url(#sdi-a9)"/>
</svg><figcaption>Top two rows: the "stories" for single values, each a limit or transform of another. Middle: the CLT turns averages of any of them into a Normal. Bottom row: the sampling distributions built from the Normal (t, χ², F) that every test in the next notes uses. Last: the check that a chosen story fits.</figcaption></figure>
  <p>Follow the arrows: one coin flip (Bernoulli) summed n times gives the Binomial. Binomial with huge n and tiny p becomes Poisson. Poisson counts per window and Exponential gaps between events describe the same process from two angles, and a single event's position in the window is Uniform. Binomial with large n, or Poisson with large λ, becomes Normal, and e to the power of a Normal is Log-normal. The CLT turns averages of any of them into a Normal; replacing σ by s gives t, squaring and adding normals gives χ², and dividing two χ²'s gives F.</p>
  <table class="tbl"><caption>Every concept on LeafBox</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers</th><th>LeafBox value</th><th>Use when</th></tr>
    <tr><td>PMF / CDF</td><td>list of probabilities, running total</td><td>how are the values spread?</td><td>0.4, 0.3, 0.2, 0.1; CDF 0.7 at 2; mean 2, var 1</td><td>any discrete variable</td></tr>
    <tr><td>Bernoulli</td><td>one trial</td><td>yes or no?</td><td>p 0.03, var 0.0291</td><td>one binary outcome</td></tr>
    <tr><td>Binomial</td><td>sum of n Bernoullis</td><td>how many yeses of n?</td><td>mean 3; P(5+) 0.182</td><td>fixed n, same p, independent</td></tr>
    <tr><td>Poisson</td><td>Binomial, n → ∞, np = λ</td><td>how many per window?</td><td>P(0) 0.018; P(8+) 0.051</td><td>rate known, no ceiling, var ≈ mean</td></tr>
    <tr><td>Exponential</td><td>Poisson P(0) over time t</td><td>how long until the next?</td><td>mean 15; P(&gt; 30) 0.135</td><td>constant rate, no ageing</td></tr>
    <tr><td>Uniform</td><td>one Poisson event in a window</td><td>where in the range?</td><td>P(first 15 min) 0.25</td><td>no value favoured</td></tr>
    <tr><td>Normal</td><td>sum of many small effects; Binomial/Poisson limits</td><td>measurement spread?</td><td>N(500, 10): P(&gt; 515) 0.067</td><td>additive, symmetric data</td></tr>
    <tr><td>Log-normal</td><td>exp(Normal)</td><td>skewed positive values?</td><td>median 400, mean 479</td><td>money, sizes, durations</td></tr>
    <tr><td>CLT</td><td>average of n independent values</td><td>how does an average wobble?</td><td>SE 316/√30 = 57.7</td><td>means, sums, proportions</td></tr>
    <tr><td>t</td><td>Z/√(χ²/ν)</td><td>mean with unknown σ, small n</td><td>t −1.56; ±2.776 at df 4</td><td>t-tests, intervals</td></tr>
    <tr><td>χ²</td><td>sum of squared Z</td><td>variance; counts vs expected</td><td>0.74; GOF 0.367</td><td>variance test, GOF, independence</td></tr>
    <tr><td>F</td><td>ratio of χ²/df</td><td>which is noisier?</td><td>74.5/18.5 = 4.03</td><td>variance ratio, ANOVA</td></tr>
    <tr><td>QQ-plot</td><td>sorted data vs story quantiles</td><td>does the story fit?</td><td>orders r .938, logs r .997</td><td>before any normal-based method</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>every named distribution is a story about how values are generated, and most are limits, transforms or sums of the coin flip.</strong> The CLT is why the Normal dominates statistics, and t, χ² and F are what the Normal becomes once we estimate things from a sample, which is exactly what every test in the next notes does.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common mistakes.</b> Knowing the family is half the job; the other half is not misusing it.</div>

  <h2 id="sdi-traps"><span class="num">14</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Where do analysts most often go wrong with distributions, even when they know the formulas?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: assuming raw data is normal</span><p>Order values, latencies and counts are skewed. Normality is a property of averages (CLT), not of most raw business data.</p></div>
  <div class="callout trap"><span class="label">Trap: reading a PDF height as a probability</span><p>Densities can exceed 1. Probability is area.</p></div>
  <div class="callout trap"><span class="label">Trap: Poisson on overdispersed counts</span><p>If variance ≫ mean, alerts based on Poisson fire constantly. Use Negative Binomial or model the changing rate.</p></div>
  <div class="callout trap"><span class="label">Trap: Binomial with dependent trials</span><p>Repeat visits by one user are not independent trials; count users, not page views.</p></div>
  <div class="callout trap"><span class="label">Trap: rate vs scale in scipy</span><p><code>expon(scale=1/λ)</code>, <code>lognorm(s=σ, scale=e^μ)</code>, <code>norm(loc=μ, scale=σ)</code>. Wrong parameter = silent wrong answers.</p></div>
  <div class="callout trap"><span class="label">Trap: z instead of t for small samples</span><p>With 5 packets, ±1.96 gives a band that covers the truth far less than 95% of the time; use ±2.776.</p></div>
  <div class="callout trap"><span class="label">Trap: mean of logs = mean</span><p>exp(mean of log) is the median (₹400), not the mean (₹479).</p></div>
  <div class="callout trap"><span class="label">Trap: trusting a normality test on huge n</span><p>Shapiro rejects trivial deviations at n = 5000. Look at the QQ-plot and ask "normal enough for what?"</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision.</b> The whole note condensed onto one sheet.</div>

  <h2 id="sdi-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: LeafBox, an online tea shop. Packets per order P(1..4) = 0.4, 0.3, 0.2, 0.1; a visitor buys with p = 0.03; 4 orders an hour; packets weigh N(500, 10) g; log(order value) ~ N(ln 400, 0.6); machine A's 5 packets 497, 503, 492, 499, 494; machine B's 505, 490, 512, 498, 495.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>LeafBox answer</th><th>Weakness → next</th></tr>
    <tr><td>PMF/PDF/CDF</td><td>how are values spread?</td><td>CDF 0.4, 0.7, 0.9, 1; mean 2, var 1</td><td>hand lists don't scale → standard shapes</td></tr>
    <tr><td>Bernoulli</td><td>one yes/no?</td><td>p 0.03, var 0.0291</td><td>many visitors</td></tr>
    <tr><td>Binomial</td><td>yeses out of n?</td><td>mean 3, P(5+) 0.182</td><td>no fixed n for hourly orders</td></tr>
    <tr><td>Poisson</td><td>events per window?</td><td>P(0) 0.018, P(8+) 0.051</td><td>says how many, not when</td></tr>
    <tr><td>Exponential / Uniform</td><td>wait until next? where in window?</td><td>mean 15, P(&gt; 30) 0.135; 0.25</td><td>measurements aren't waits</td></tr>
    <tr><td>Normal</td><td>additive measurement?</td><td>P(&gt; 515) 0.067, P(&lt; 480) 0.023</td><td>money is skewed, positive</td></tr>
    <tr><td>Log-normal</td><td>multiplicative positive value?</td><td>median 400, mean 479</td><td>most data fits no story</td></tr>
    <tr><td>CLT</td><td>shape of an average?</td><td>SE 57.7, skew 2.26 → 0.4</td><td>needs true σ</td></tr>
    <tr><td>t</td><td>mean with s, small n?</td><td>t −1.56; ±2.776; CI 491.7–502.3</td><td>only means</td></tr>
    <tr><td>χ², F</td><td>variances, counts?</td><td>0.74; GOF 0.367 (p .95); F 4.03 (p .21)</td><td>all assume a story</td></tr>
    <tr><td>QQ / Shapiro</td><td>does the story fit?</td><td>orders r .938; logs r .997, p .26</td><td>huge n over-rejects</td></tr>
    <tr><td>Which one?</td><td>pick a story and loss</td><td>counts → Poisson; value → log-normal</td><td>one variable only → correlation</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>Mean, variance from a PMF</td><td>E[X] = Σ k p(k); Var = Σ (k − E[X])² p(k)</td><td>p(k) = P(X = k)</td></tr>
    <tr><td>Bernoulli</td><td>P(1) = p; mean p; var p(1 − p)</td><td>p chance of yes</td></tr>
    <tr><td>Binomial</td><td>C(n, k) pᵏ (1 − p)ⁿ⁻ᵏ; mean np; var np(1 − p)</td><td>n trials, k yeses, C(n, k) = n!/(k!(n − k)!)</td></tr>
    <tr><td>Poisson</td><td>λᵏ e^−λ / k!; mean = var = λ; P(k) = P(k−1)·λ/k</td><td>λ average count per window</td></tr>
    <tr><td>Exponential</td><td>f(x) = λe^−λx; P(X &gt; t) = e^−λt; mean 1/λ, var 1/λ²</td><td>λ rate; scipy scale = 1/λ</td></tr>
    <tr><td>Uniform</td><td>f = 1/(b − a); mean (a + b)/2; var (b − a)²/12</td><td>a, b ends of the range</td></tr>
    <tr><td>Normal</td><td>f = e^−(x−μ)²/2σ² / (σ√2π); z = (x − μ)/σ</td><td>μ centre, σ sd; 68/95/99.7 within 1/2/3σ</td></tr>
    <tr><td>Log-normal</td><td>ln X ~ N(μ, σ²); median e^μ; mean e^(μ + σ²/2)</td><td>μ, σ of the log</td></tr>
    <tr><td>CLT</td><td>X̄ ≈ N(μ, σ²/n); SE = σ/√n</td><td>n sample size</td></tr>
    <tr><td>t</td><td>t = (X̄ − μ)/(s/√n), df = n − 1</td><td>s sample sd (n − 1 divisor)</td></tr>
    <tr><td>χ² variance</td><td>(n − 1)s²/σ² ~ χ²(n − 1)</td><td>σ claimed sd</td></tr>
    <tr><td>χ² goodness of fit</td><td>Σ (O − E)²/E, df = categories − 1 − fitted params</td><td>O observed, E expected counts</td></tr>
    <tr><td>F</td><td>F = s₁²/s₂² ~ F(n₁ − 1, n₂ − 1)</td><td>two sample variances</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Counts</b><p>Fixed n and same p → Binomial. Per window with only a rate → Poisson. If variance ≫ mean → Negative Binomial.</p><small>Not for dependent trials or repeat visits</small></div>
    <div><b>Times</b><p>Constant-rate waits → Exponential (memoryless). Rates that change with age (churn, wear) → Weibull or survival models.</p><small>scipy scale = mean wait</small></div>
    <div><b>Measurements and money</b><p>Additive, symmetric → Normal. Multiplicative, positive, skewed → Log-normal: work on the log scale.</p><small>Back-transform mean with + σ²/2</small></div>
    <div><b>Averages and tests</b><p>Means → CLT Normal; small n with s → t; variances and counts → χ²; variance ratios and ANOVA → F.</p><small>Small n needs normal data</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Assuming raw data is normal; reading PDF heights as probabilities; Poisson on overdispersed counts; dependent trials in a Binomial; scipy rate vs scale; z instead of t for small n; exp(mean of logs) as the mean; trusting Shapiro at huge n; the CLT applies to averages, not to the data.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>4 orders an hour on average: P(no order in an hour)?</td><td>e⁻⁴ = 0.0183</td></tr>
    <tr><td>Packets N(500, 10): share under 480 g?</td><td>z = −2 → 2.3%</td></tr>
    <tr><td>Order sd ₹316: sd of the average of 30 orders?</td><td>316/√30 = ₹57.7</td></tr>
    <tr><td>n = 5, 95% two-sided: t or z multiplier?</td><td>t with 4 df: 2.776 (z would be 1.96)</td></tr>
    <tr><td>log(value) ~ N(ln 400, 0.6): median and mean?</td><td>₹400 and 400·e^0.18 = ₹479</td></tr>
  </table>

  <h2 id="sdi-qa"><span class="num">15</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>A site gets 2 sign-ups per hour on average. P(no sign-ups in an hour)?</summary><div class="qa-body">Poisson(λ = 2): P(0) = e⁻² ≈ 0.135. And the wait until the next sign-up is Exponential with mean 30 min.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Binomial vs Poisson: how do you choose?</summary><div class="qa-body">Binomial when there's a fixed number of trials n and you count successes (can't exceed n). Poisson when you count events in a window with no natural upper limit. For huge n and tiny p they coincide with λ = np: Binomial(2000, 0.002) ≈ Poisson(4) to 3 decimals.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your count data has mean 3 and variance 20. What do you do?</summary><div class="qa-body">It's overdispersed; Poisson assumes var = mean. Use a Negative Binomial (or quasi-Poisson) model, or check for a mix of user types or time-of-day rates (zero-inflation if many zeros).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "the exponential is memoryless" mean? Give a case where that's wrong.</summary><div class="qa-body">P(wait &gt; s + t | waited s) = P(wait &gt; t): past waiting tells you nothing (LeafBox: P(&gt; 40 | &gt; 10) = P(&gt; 30) = 0.135). Machine wear or user churn violate it: failure risk changes with age. Use Weibull or survival models there.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Packets ~ N(500, 10). What fraction is above 520 g?</summary><div class="qa-body">z = 2, so about 2.3% (half of the 5% outside ±2σ). In scipy: <code>stats.norm(500, 10).sf(520)</code> = 0.0228.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is income or order value usually modelled as log-normal?</summary><div class="qa-body">It's positive and right-skewed, and grows multiplicatively (raises and add-ons are percentages). Log of a product is a sum of logs, which the CLT pushes towards normal. So log(value) ≈ normal; LeafBox's logs had QQ r = 0.997.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Shapiro-Wilk gives p = 0.001 on 50,000 rows. Is the data non-normal enough to matter?</summary><div class="qa-body">Not necessarily. With huge n, the test detects tiny, irrelevant deviations. Look at the QQ-plot and skew/kurtosis, and remember that many methods (t-tests on means) only need the mean to be normal, which the CLT gives you.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Mean and variance of a fair die as a discrete uniform?</summary><div class="qa-body">Mean 3.5, variance (n² − 1)/12 = 35/12 ≈ 2.92 for n = 6 faces. Same method as the packets PMF: Σ k·p and Σ (k − mean)²·p.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What loss function matches each distribution in ML?</summary><div class="qa-body">Normal target → MSE. Bernoulli target → log-loss (binary cross-entropy). Poisson counts → Poisson deviance (e.g. <code>objective="poisson"</code> in LightGBM). Picking the loss = picking the assumed distribution of y.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write code: probability that a 2% conversion page gets 0 sales from 100 visitors.</summary><div class="qa-body"><code>stats.binom(100, 0.02).pmf(0)</code> = 0.98¹⁰⁰ ≈ 0.133. A zero-sales page is not proof of a bug.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the Exponential follow from the Poisson?</summary><div class="qa-body">"Wait longer than t" = "zero events in the next t". With rate λ, the count in t is Poisson(λt), and P(0) = e^−λt. So P(wait &gt; t) = e^−λt, the Exponential's survival function. Same process, counted vs timed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why do we need the t-distribution if we have the CLT?</summary><div class="qa-body">The CLT says (X̄ − μ)/(σ/√n) is about N(0, 1), but σ is unknown. Plugging in s adds extra randomness, so the ratio has fatter tails: t with n − 1 df. With 5 packets the 95% multiplier is 2.776, not 1.96; as n grows t → z.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how are Normal, χ², t and F built from each other?</summary><div class="qa-body">χ²(k) = sum of k squared standard normals. t(ν) = Z/√(χ²(ν)/ν). F(d₁, d₂) = (χ²(d₁)/d₁)/(χ²(d₂)/d₂). Hence t(ν)² = F(1, ν): a two-group t-test and a two-group ANOVA give the same p-value.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip the "check the fit" step?</summary><div class="qa-body">Every probability you compute inherits the story's assumptions. Treat order values as Normal and you predict negative orders and badly underestimate P(order &gt; ₹1000); use a Poisson on overdispersed counts and alerts fire constantly; run a variance F-test on skewed data and the p-value is wrong.</div></details>
</main>`
});
