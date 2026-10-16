// notes/mathstats/st_distributions.js — Probability Distributions
Object.assign(TOPIC_CONTENT, {
  "st_distributions": `<main>
  <h1>Probability Distributions</h1>
  <p class="lead">A distribution is a story about how data is generated. Pick the right story and you get correct tests, sensible simulations and the right loss function (Poisson for counts, log-normal for money). Builds on Probability.</p>

  <h2 id="sdi-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Probability Distributions</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Functions</div>
        <ul>
          <li><b>PMF</b> — P(X = k) for discrete counts</li>
          <li><b>PDF</b> — density; probability = area; can exceed 1</li>
          <li><b>CDF</b> — P(X ≤ x); <code>.sf(x)</code> = 1 − CDF</li>
          <li><b>PPF</b> — inverse CDF: <code>.ppf(0.95)</code> = 95th percentile</li>
          <li>⚠ <b>Trap</b> — P(X = exact value) = 0 for continuous</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Bernoulli &amp; Binomial</div>
        <ul>
          <li><b>Bernoulli(p)</b> — one yes/no; mean p, var p(1−p); "did user convert?"</li>
          <li><b>Binomial(n, p)</b> — yeses in n trials; <code>C(n,k)pᵏ(1−p)ⁿ⁻ᵏ</code></li>
          <li><b>Mean/var</b> — np, np(1−p)</li>
          <li><b>Example</b> — 3% CR, 100 visitors: P(5+) = 18% by luck</li>
          <li><b>scipy</b> — <code>stats.binom(n, p).pmf(k)</code>, <code>.sf(k-1)</code> for "k or more"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Poisson</div>
        <ul>
          <li><b>Story</b> — events per window at rate λ, no upper limit</li>
          <li><b>PMF</b> — <code>λᵏe^−λ / k!</code>; mean = var = λ</li>
          <li><b>Example</b> — 4 tickets/hr: P(0) = 0.018, P(8+) = 0.05</li>
          <li>⚠ <b>Overdispersion</b> — var ≫ mean → Negative Binomial</li>
          <li><b>ML</b> — Poisson loss for count targets</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Normal</div>
        <ul>
          <li><b>Story</b> — sum of many small independent effects</li>
          <li><b>Params</b> — μ, σ; symmetric bell</li>
          <li><b>68-95-99.7</b> — share within ±1, 2, 3σ</li>
          <li><b>z-score</b> — <code>(x − μ)/σ</code>; N(170,10): P(&gt;185) = 6.7%</li>
          <li><b>Where</b> — errors, heights, sample means (CLT); MSE loss</li>
          <li>⚠ <b>Trap</b> — raw business metrics are rarely normal</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Exponential, Uniform, Log-normal</div>
        <ul>
          <li><b>Exponential(λ)</b> — wait until next Poisson event; mean 1/λ, var 1/λ²</li>
          <li><b>Memoryless</b> — P(&gt;40 | &gt;10) = P(&gt;30) = 0.135</li>
          <li>⚠ <b>scipy</b> — <code>expon(scale=1/λ)</code>, not λ</li>
          <li><b>Uniform(a,b)</b> — flat; mean (a+b)/2, var (b−a)²/12; random search</li>
          <li><b>Log-normal</b> — log(X) normal; positive, right-skewed; money, durations</li>
          <li><b>Log-normal mean</b> — e^(μ+σ²/2) &gt; median e^μ</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Relationships</div>
        <ul>
          <li><b>Bernoulli → Binomial</b> — sum of n trials</li>
          <li><b>Binomial → Poisson</b> — n large, p small, λ = np (1000, .003 ≈ Pois(3))</li>
          <li><b>Binomial/Poisson → Normal</b> — np ≥ 10 or λ large</li>
          <li><b>Poisson ↔ Exponential</b> — counts vs gaps between events</li>
          <li><b>Normal → Log-normal</b> — exp(X)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Check Normality</div>
        <ul>
          <li><b>QQ-plot</b> — line = normal; banana = skew; S = tails</li>
          <li><b>Shapiro-Wilk</b> — H₀ normal; p &lt; 0.05 → reject</li>
          <li>⚠ <b>n effect</b> — near-normal: p 0.31 at n=50, 0.008 at n=5000</li>
          <li><b>Ask</b> — normal <em>enough</em> for the method?</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Which One?</div>
        <ul>
          <li><b>yes/no</b> → Bernoulli; <b>k of n</b> → Binomial</li>
          <li><b>count per time</b> → Poisson (NegBin if overdispersed)</li>
          <li><b>time to event</b> → Exponential (Weibull if rate changes)</li>
          <li><b>additive, symmetric</b> → Normal; <b>multiplicative, positive</b> → Log-normal</li>
          <li><b>equal chance on range</b> → Uniform</li>
        </ul>
      </div>
    </div>
  </div>


  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sdi-shapes"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">PMF, PDF, CDF</span><span class="rm-sub">All seven at a glance</span></div></div>
      <div class="rm-item rm-done" data-target="sdi-binom"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Bernoulli &amp; Binomial</span><span class="rm-sub">Yes/no, and counting yeses</span></div></div>
      <div class="rm-item rm-done" data-target="sdi-pois"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Poisson</span><span class="rm-sub">Events per time window</span></div></div>
      <div class="rm-item rm-done" data-target="sdi-norm"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Normal</span><span class="rm-sub">The bell curve and z-scores</span></div></div>
      <div class="rm-item rm-done" data-target="sdi-expo"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Exponential &amp; Uniform</span><span class="rm-sub">Waiting times, equal chances</span></div></div>
      <div class="rm-item rm-done" data-target="sdi-logn"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Log-normal</span><span class="rm-sub">Money, sizes, durations</span></div></div>
      <div class="rm-item rm-done" data-target="sdi-rel"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">How They Connect</span><span class="rm-sub">Limits and transforms</span></div></div>
      <div class="rm-item rm-done" data-target="sdi-check"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Checking Normality</span><span class="rm-sub">QQ-plot and Shapiro-Wilk</span></div></div>
      <div class="rm-item rm-done" data-target="sdi-which"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Which Distribution?</span><span class="rm-sub">Decision table</span></div></div>
      <div class="rm-item rm-done" data-target="sdi-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="sdi-shapes"><span class="num">01</span>PMF, PDF, CDF</h2>
  <figure class="viz"><svg viewBox="0 0 600 238" width="600"><g transform="translate(0,0)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">Bernoulli p=.3</text><g transform="translate(0,16)"><line x1="8" y1="79" x2="142" y2="79" stroke="currentColor" stroke-opacity=".5"/><text x="47.1" y="94" text-anchor="middle" font-size="11">0</text><text x="102.9" y="94" text-anchor="middle" font-size="11">1</text><path d="M30.3,79V27.9H63.8V79M86.2,79V57.1H119.7V79" class="fb sb"/></g></g><g transform="translate(150,0)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">Binomial 20, .3</text><g transform="translate(0,16)"><line x1="8" y1="79" x2="142" y2="79" stroke="currentColor" stroke-opacity=".5"/><text x="11.2" y="94" text-anchor="middle" font-size="11">0</text><text x="75" y="94" text-anchor="middle" font-size="11">10</text><text x="138.8" y="94" text-anchor="middle" font-size="11">20</text><path d="M8.6,79V78.7H13.7V79M15,79V76.6H20.1V79M21.4,79V69.3H26.5V79M27.8,79V54.1H32.9V79M34.2,79V33.7H39.3V79M40.5,79V16.8H45.6V79M46.9,79V12.4H52V79M53.3,79V21.9H58.4V79M59.7,79V39.2H64.8V79M66.1,79V56.3H71.2V79M72.4,79V68.3H77.6V79M78.8,79V74.8H83.9V79M85.2,79V77.7H90.3V79M91.6,79V78.6H96.7V79M98,79V78.9H103.1V79M104.4,79V79H109.5V79M110.7,79V79H115.8V79M117.1,79V79H122.2V79M123.5,79V79H128.6V79M129.9,79V79H135V79M136.3,79V79H141.4V79" class="fb sb"/></g></g><g transform="translate(300,0)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">Poisson λ=4</text><g transform="translate(0,16)"><line x1="8" y1="79" x2="142" y2="79" stroke="currentColor" stroke-opacity=".5"/><text x="12.5" y="94" text-anchor="middle" font-size="11">0</text><text x="48.2" y="94" text-anchor="middle" font-size="11">4</text><text x="83.9" y="94" text-anchor="middle" font-size="11">8</text><text x="119.7" y="94" text-anchor="middle" font-size="11">12</text><path d="M8.9,79V72.6H16V79M17.8,79V53.5H25V79M26.8,79V28.1H33.9V79M35.7,79V11.1H42.8V79M44.6,79V11.1H51.8V79M53.6,79V24.7H60.7V79M62.5,79V42.8H69.6V79M71.4,79V58.3H78.6V79M80.4,79V68.7H87.5V79M89.3,79V74.4H96.4V79M98.2,79V77.2H105.4V79M107.2,79V78.3H114.3V79M116.1,79V78.8H123.2V79M125,79V78.9H132.2V79M134,79V79H141.1V79" class="fb sb"/></g></g><g transform="translate(450,0)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">Uniform 0–10</text><g transform="translate(0,16)"><line x1="8" y1="79" x2="142" y2="79" stroke="currentColor" stroke-opacity=".5"/><text x="14.1" y="94" text-anchor="middle" font-size="11">0</text><text x="75" y="94" text-anchor="middle" font-size="11">5</text><text x="135.9" y="94" text-anchor="middle" font-size="11">10</text><rect x="14.1" y="18.2" width="121.8" height="60.8" class="ft st"/></g></g><g transform="translate(0,119)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">Normal 0, 1</text><g transform="translate(0,16)"><line x1="8" y1="79" x2="142" y2="79" stroke="currentColor" stroke-opacity=".5"/><text x="17.6" y="94" text-anchor="middle" font-size="11">-3</text><text x="75" y="94" text-anchor="middle" font-size="11">0</text><text x="132.4" y="94" text-anchor="middle" font-size="11">3</text><path d="M8,79 L8,78.9 L12.6,78.7 L17.2,78.3 L21.9,77.6 L26.5,76.4 L31.1,74.3 L35.7,71.1 L40.3,66.4 L45,60.1 L49.6,52.2 L54.2,43.1 L58.8,33.7 L63.4,25.1 L68.1,18.4 L72.7,14.8 L77.3,14.8 L81.9,18.4 L86.6,25.1 L91.2,33.7 L95.8,43.1 L100.4,52.2 L105,60.1 L109.7,66.4 L114.3,71.1 L118.9,74.3 L123.5,76.4 L128.1,77.6 L132.8,78.3 L137.4,78.7 L142,78.9 L142,79 Z" class="ft st" stroke-width="2"/></g></g><g transform="translate(150,119)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">Exponential λ=1</text><g transform="translate(0,16)"><line x1="8" y1="79" x2="142" y2="79" stroke="currentColor" stroke-opacity=".5"/><text x="8" y="94" text-anchor="middle" font-size="11">0</text><text x="34.8" y="94" text-anchor="middle" font-size="11">1</text><text x="61.6" y="94" text-anchor="middle" font-size="11">2</text><text x="88.4" y="94" text-anchor="middle" font-size="11">3</text><text x="115.2" y="94" text-anchor="middle" font-size="11">4</text><text x="142" y="94" text-anchor="middle" font-size="11">5</text><path d="M8,79 L8,9.5 L13.6,22.6 L19.2,33.2 L24.8,41.8 L30.3,48.8 L35.9,54.5 L41.5,59.1 L47.1,62.8 L52.7,65.9 L58.2,68.3 L63.8,70.3 L69.4,72 L75,73.3 L80.6,74.4 L86.2,75.2 L91.8,75.9 L97.3,76.5 L102.9,77 L108.5,77.4 L114.1,77.7 L119.7,77.9 L125.2,78.1 L130.8,78.3 L136.4,78.4 L142,78.5 L142,79 Z" class="ft st" stroke-width="2"/></g></g><g transform="translate(300,119)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11">Log-normal</text><g transform="translate(0,16)"><line x1="8" y1="79" x2="142" y2="79" stroke="currentColor" stroke-opacity=".5"/><text x="8" y="94" text-anchor="middle" font-size="11">0</text><text x="34.8" y="94" text-anchor="middle" font-size="11">1</text><text x="61.6" y="94" text-anchor="middle" font-size="11">2</text><text x="88.4" y="94" text-anchor="middle" font-size="11">3</text><text x="115.2" y="94" text-anchor="middle" font-size="11">4</text><text x="142" y="94" text-anchor="middle" font-size="11">5</text><path d="M8.3,79 L8.3,79 L12.9,72.7 L17.5,38.1 L22.1,9.6 L26.7,6 L31.3,6.6 L35.9,17.1 L40.5,28.4 L45.2,38.8 L49.8,47.4 L54.4,54.4 L59,59.9 L63.6,64.1 L68.2,67.4 L72.8,69.9 L77.4,71.9 L82.1,73.4 L86.7,74.6 L91.3,75.5 L95.9,76.2 L100.5,76.8 L105.1,77.2 L109.7,77.6 L114.3,77.8 L118.9,78.1 L123.6,78.2 L128.2,78.4 L132.8,78.5 L137.4,78.6 L142,78.6 L142,79 Z" class="ft st" stroke-width="2"/></g></g><g transform="translate(450,119)"><text x="75" y="12" text-anchor="middle" font-weight="bold" font-size="11"></text><g transform="translate(0,16)"><rect x="12" y="20" width="16" height="12" class="fb sb"/><text x="34" y="30" font-size="11">discrete: PMF</text><rect x="12" y="46" width="16" height="12" class="ft st"/><text x="34" y="56" font-size="11">continuous: PDF</text></g></g></svg><figcaption>Bars = probability of each count. Curves = density; probability is the area under the curve.</figcaption></figure>
  <table class="tbl">
    <tr><th>Function</th><th>Means</th><th>scipy</th></tr>
    <tr><td><strong>PMF</strong> (discrete)</td><td>P(X = k), a real probability</td><td><code>.pmf(k)</code></td></tr>
    <tr><td><strong>PDF</strong> (continuous)</td><td>density; P(a &lt; X &lt; b) = area under it. P(X = exact value) = 0</td><td><code>.pdf(x)</code></td></tr>
    <tr><td><strong>CDF</strong></td><td>P(X ≤ x), climbs 0 → 1</td><td><code>.cdf(x)</code>; <code>.sf(x)</code> = 1 − cdf</td></tr>
    <tr><td><strong>PPF</strong></td><td>inverse CDF: "which x has 95% below it?"</td><td><code>.ppf(0.95)</code></td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A PDF value can exceed 1 (a narrow normal peaks above 1). It's a density, not a probability.</p>
  </div>

  <h2 id="sdi-binom"><span class="num">02</span>Bernoulli &amp; Binomial</h2>
  <table class="tbl">
    <tr><th></th><th>Story</th><th>PMF</th><th>Mean / Var</th><th>DS example</th></tr>
    <tr><td><strong>Bernoulli(p)</strong></td><td>One yes/no trial</td><td><code>P(1) = p, P(0) = 1 − p</code></td><td>p / p(1−p)</td><td>Did this user convert?</td></tr>
    <tr><td><strong>Binomial(n, p)</strong></td><td>Number of yeses in n independent trials</td><td><code>C(n,k) pᵏ (1−p)ⁿ⁻ᵏ</code></td><td>np / np(1−p)</td><td>Conversions out of 100 visitors</td></tr>
  </table>
  <p>C(n,k) counts the orderings; pᵏ(1−p)ⁿ⁻ᵏ is the chance of one ordering. Conversion rate 3%, 100 visitors:</p>
  <div class="fx" data-lang="py">from scipy import stats
import numpy as np
b = stats.bernoulli(0.03)
print("Bernoulli mean, var:", b.mean(), round(b.var(), 4))
B = stats.binom(n=100, p=0.03)
print("Binomial mean, var:", B.mean(), B.var())
print("P(exactly 3)   :", round(B.pmf(3), 4))
print("P(5 or more)   :", round(B.sf(4), 4))     # sf(4) = P(X &gt; 4)</div>
  <div class="fx" data-lang="text">Bernoulli mean, var: 0.03 0.0291
Binomial mean, var: 3.0 2.91
P(exactly 3)   : 0.2275
P(5 or more)   : 0.1821</div>
  <p>Seeing 5+ conversions happens 18% of the time by luck alone. That's why one good day proves nothing.</p>

  <h2 id="sdi-pois"><span class="num">03</span>Poisson</h2>
  <table class="tbl">
    <tr><th>Story</th><th>PMF</th><th>Mean / Var</th><th>DS example</th></tr>
    <tr><td>Count of independent events in a fixed window, at an average rate λ</td><td><code>λᵏ e^−λ / k!</code></td><td>λ / λ (equal!)</td><td>Support tickets per hour, clicks per minute, defects per batch</td></tr>
  </table>
  <div class="fx" data-lang="py">P = stats.poisson(mu=4)                  # 4 tickets/hour on average
print("mean, var:", P.mean(), P.var())
print("P(0 tickets):", round(P.pmf(0), 4))
print("P(8 or more):", round(P.sf(7), 4))</div>
  <div class="fx" data-lang="text">mean, var: 4.0 4.0
P(0 tickets): 0.0183
P(8 or more): 0.0511</div>
  <p>By hand: P(0) = e⁻⁴ = 0.0183. An hour with 8+ tickets happens 5% of the time, a sensible alert threshold.</p>
  <div class="callout trap"><span class="label">Trap: overdispersion</span>
    <p>Real counts often have variance ≫ mean (some users click 100×). Then Poisson underestimates spread; use Negative Binomial.</p>
  </div>

  <h2 id="sdi-norm"><span class="num">04</span>Normal (Gaussian)</h2>
  <figure class="viz"><svg viewBox="0 0 560 200" width="560"><line x1="30" y1="172" x2="548" y2="172" stroke="currentColor" stroke-opacity=".5"/><text x="94.8" y="187" text-anchor="middle" font-size="11">−3σ</text><text x="159.5" y="187" text-anchor="middle" font-size="11">−2σ</text><text x="224.2" y="187" text-anchor="middle" font-size="11">−1σ</text><text x="289" y="187" text-anchor="middle" font-size="11">μ</text><text x="353.8" y="187" text-anchor="middle" font-size="11">+1σ</text><text x="418.5" y="187" text-anchor="middle" font-size="11">+2σ</text><text x="483.2" y="187" text-anchor="middle" font-size="11">+3σ</text><path d="M94.8,172 L94.8,170.8 L104.7,170.2 L114.7,169.2 L124.6,167.8 L134.6,165.9 L144.6,163.3 L154.5,159.8 L164.5,155.5 L174.4,150 L184.4,143.5 L194.4,135.9 L204.3,127.3 L214.3,118 L224.2,108.3 L234.2,98.6 L244.2,89.3 L254.1,81.1 L264.1,74.4 L274.1,69.7 L284,67.3 L294,67.3 L303.9,69.7 L313.9,74.4 L323.9,81.1 L333.8,89.3 L343.8,98.6 L353.8,108.3 L363.7,118 L373.7,127.3 L383.6,135.9 L393.6,143.5 L403.6,150 L413.5,155.5 L423.5,159.8 L433.4,163.3 L443.4,165.9 L453.4,167.8 L463.3,169.2 L473.3,170.2 L483.2,170.8 L483.2,172 Z" class="ft" stroke="none"/><path d="M159.5,172 L159.5,157.8 L166.1,154.6 L172.8,151 L179.4,146.9 L186.1,142.3 L192.7,137.2 L199.3,131.7 L206,125.8 L212.6,119.6 L219.3,113.2 L225.9,106.6 L232.6,100.2 L239.2,93.9 L245.8,87.9 L252.5,82.4 L259.1,77.6 L265.8,73.5 L272.4,70.3 L279,68.2 L285.7,67.1 L292.3,67.1 L299,68.2 L305.6,70.3 L312.2,73.5 L318.9,77.6 L325.5,82.4 L332.2,87.9 L338.8,93.9 L345.4,100.2 L352.1,106.6 L358.7,113.2 L365.4,119.6 L372,125.8 L378.7,131.7 L385.3,137.2 L391.9,142.3 L398.6,146.9 L405.2,151 L411.9,154.6 L418.5,157.8 L418.5,172 Z" class="ft" stroke="none"/><path d="M224.2,172 L224.2,108.3 L228.7,103.9 L233.2,99.5 L237.6,95.3 L242.1,91.2 L246.6,87.2 L251,83.5 L255.5,80.1 L260,77 L264.4,74.2 L268.9,71.9 L273.4,70 L277.8,68.5 L282.3,67.5 L286.8,67 L291.2,67 L295.7,67.5 L300.2,68.5 L304.6,70 L309.1,71.9 L313.6,74.2 L318,77 L322.5,80.1 L327,83.5 L331.4,87.2 L335.9,91.2 L340.4,95.3 L344.8,99.5 L349.3,103.9 L353.8,108.3 L353.8,172 Z" class="fb" stroke="none"/><path d="M30,172 L38.8,171.9 L47.6,171.9 L56.3,171.8 L65.1,171.7 L73.9,171.6 L82.7,171.3 L91.5,171 L100.2,170.5 L109,169.8 L117.8,168.8 L126.6,167.5 L135.4,165.7 L144.1,163.4 L152.9,160.5 L161.7,156.8 L170.5,152.3 L179.3,147 L188,140.9 L196.8,133.9 L205.6,126.2 L214.4,117.9 L223.2,109.4 L231.9,100.8 L240.7,92.4 L249.5,84.8 L258.3,78.1 L267.1,72.8 L275.8,69.1 L284.6,67.2 L293.4,67.2 L302.2,69.1 L310.9,72.8 L319.7,78.1 L328.5,84.8 L337.3,92.4 L346.1,100.8 L354.8,109.4 L363.6,117.9 L372.4,126.2 L381.2,133.9 L390,140.9 L398.7,147 L407.5,152.3 L416.3,156.8 L425.1,160.5 L433.9,163.4 L442.6,165.7 L451.4,167.5 L460.2,168.8 L469,169.8 L477.8,170.5 L486.5,171 L495.3,171.3 L504.1,171.6 L512.9,171.7 L521.7,171.8 L530.4,171.9 L539.2,171.9 L548,172" fill="none" class="sb" stroke-width="2"/><line x1="224.2" y1="53.5" x2="353.8" y2="53.5" class="sb" stroke-width="1.2"/><line x1="224.2" y1="57.5" x2="224.2" y2="49.5" class="sb" stroke-width="1.2"/><line x1="353.8" y1="57.5" x2="353.8" y2="49.5" class="sb" stroke-width="1.2"/><text x="360.2" y="56.7" text-anchor="start" font-size="11">68.3%</text><line x1="159.5" y1="37.7" x2="418.5" y2="37.7" class="sb" stroke-width="1.2"/><line x1="159.5" y1="41.6" x2="159.5" y2="33.7" class="sb" stroke-width="1.2"/><line x1="418.5" y1="41.6" x2="418.5" y2="33.7" class="sb" stroke-width="1.2"/><text x="425" y="40.9" text-anchor="start" font-size="11">95.4%</text><line x1="94.8" y1="21.9" x2="483.2" y2="21.9" class="sb" stroke-width="1.2"/><line x1="94.8" y1="25.9" x2="94.8" y2="18" class="sb" stroke-width="1.2"/><line x1="483.2" y1="25.9" x2="483.2" y2="18" class="sb" stroke-width="1.2"/><text x="489.7" y="25.1" text-anchor="start" font-size="11">99.7%</text></svg><figcaption>Within ±1σ: 68%. ±2σ: 95%. ±3σ: 99.7%. Heights N(170, 10): 68% of people are 160–180 cm.</figcaption></figure>
  <table class="tbl">
    <tr><th>Story</th><th>PDF</th><th>Mean / Var</th><th>DS example</th></tr>
    <tr><td>Sum of many small independent effects</td><td><code>(1/σ√2π) e^−(x−μ)²/2σ²</code></td><td>μ / σ²</td><td>Heights, measurement error, sample means (CLT), regression residuals</td></tr>
  </table>
  <p><strong>z-score</strong> <code>z = (x − μ)/σ</code>: how many stds from the mean. Turns any normal into the standard N(0, 1).</p>
  <div class="fx" data-lang="py">N = stats.norm(loc=170, scale=10)       # adult height, cm
print("P(taller than 185):", round(N.sf(185), 4))       # z = 1.5
print("95th percentile   :", round(N.ppf(0.95), 2))
print("P(160 to 180)     :", round(N.cdf(180) - N.cdf(160), 4))</div>
  <div class="fx" data-lang="text">P(taller than 185): 0.0668
95th percentile   : 186.45
P(160 to 180)     : 0.6827</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Don't assume your <em>data</em> is normal. Revenue, latency and counts rarely are. What's normal is the sampling distribution of the mean.</p>
  </div>

  <h2 id="sdi-expo"><span class="num">05</span>Exponential &amp; Uniform</h2>
  <table class="tbl">
    <tr><th></th><th>Story</th><th>PDF</th><th>Mean / Var</th><th>DS example</th></tr>
    <tr><td><strong>Exponential(λ)</strong></td><td>Waiting time until the next Poisson event</td><td><code>λ e^−λx</code>, x ≥ 0</td><td>1/λ / 1/λ²</td><td>Time between orders, time to churn (simple model)</td></tr>
    <tr><td><strong>Uniform(a, b)</strong></td><td>Every value in [a, b] equally likely</td><td><code>1/(b − a)</code></td><td>(a+b)/2 / (b−a)²/12</td><td>Random hash buckets, random search for hyperparameters</td></tr>
  </table>
  <div class="fx" data-lang="py">E = stats.expon(scale=15)        # mean 15 min between orders; scale = 1/λ
print("mean, var:", E.mean(), E.var())
print("P(wait &gt; 30):", round(E.sf(30), 4))
print("P(wait &gt; 40 | already waited 10):", round(E.sf(40) / E.sf(10), 4))
U = stats.uniform(loc=0, scale=10)
print("uniform mean, var:", U.mean(), round(U.var(), 4), " P(X&lt;3):", U.cdf(3))</div>
  <div class="fx" data-lang="text">mean, var: 15.0 225.0
P(wait &gt; 30): 0.1353
P(wait &gt; 40 | already waited 10): 0.1353
uniform mean, var: 5.0 8.3333  P(X&lt;3): 0.3</div>
  <div class="callout intu"><span class="label">Memoryless</span>
    <p>Having waited 10 min, P(30 more) = P(30 from scratch) = 0.1353. The exponential has no memory, which is also its weakness for churn: real users "age".</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>scipy's exponential takes <code>scale = 1/λ</code>, not λ. Passing a rate as scale is a classic silent bug.</p>
  </div>

  <h2 id="sdi-logn"><span class="num">06</span>Log-normal (brief)</h2>
  <div class="flow"><span>X is log-normal</span><span>⇔</span><span>log(X) is normal</span></div>
  <p>Story: <em>multiplied</em> small effects (growth rates). Always positive, right-skewed. Order values, incomes, file sizes, session lengths.</p>
  <div class="fx" data-lang="py">L = stats.lognorm(s=0.9, scale=np.exp(3.5))   # s = σ of log, scale = e^μ
print("mean:", round(L.mean(), 2), " median:", round(L.median(), 2))</div>
  <div class="fx" data-lang="text">mean: 49.65  median: 33.12</div>
  <p>Median = e^μ; mean = e^(μ + σ²/2), always higher. Model it by taking <code>np.log</code> and using normal tools.</p>

  <h2 id="sdi-rel"><span class="num">07</span>How They Connect</h2>
  <figure class="viz"><svg viewBox="0 0 640 200" width="640"><defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><rect x="10" y="40" width="100" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity=".5"/><text x="60.0" y="58" text-anchor="middle" font-weight="bold">Bernoulli</text><rect x="180" y="40" width="100" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity=".5"/><text x="230.0" y="58" text-anchor="middle" font-weight="bold">Binomial</text><rect x="350" y="40" width="100" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity=".5"/><text x="400.0" y="58" text-anchor="middle" font-weight="bold">Normal</text><rect x="530" y="40" width="100" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity=".5"/><text x="580.0" y="58" text-anchor="middle" font-weight="bold">Log-normal</text><rect x="180" y="150" width="100" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity=".5"/><text x="230.0" y="168" text-anchor="middle" font-weight="bold">Poisson</text><rect x="350" y="150" width="100" height="28" rx="6" class="fs" stroke="currentColor" stroke-opacity=".5"/><text x="400.0" y="168" text-anchor="middle" font-weight="bold">Exponential</text><line x1="110" y1="54" x2="178" y2="54" stroke="currentColor" stroke-opacity=".6" marker-end="url(#ar)"/><text x="145" y="32" font-size="10" text-anchor="middle" class="tm">sum of n trials</text><line x1="280" y1="54" x2="348" y2="54" stroke="currentColor" stroke-opacity=".6" marker-end="url(#ar)"/><text x="315" y="32" font-size="10" text-anchor="middle" class="tm">n large</text><line x1="450" y1="54" x2="528" y2="54" stroke="currentColor" stroke-opacity=".6" marker-end="url(#ar)"/><text x="490" y="32" font-size="10" text-anchor="middle" class="tm">exp(X)</text><line x1="230" y1="68" x2="230" y2="148" stroke="currentColor" stroke-opacity=".6" marker-end="url(#ar)"/><text x="222" y="104" font-size="10" text-anchor="end" class="tm">n large, p small</text><text x="222" y="118" font-size="10" text-anchor="end" class="tm">(λ = np)</text><line x1="280" y1="164" x2="348" y2="164" stroke="currentColor" stroke-opacity=".6" marker-end="url(#ar)"/><text x="315" y="186" font-size="10" text-anchor="middle" class="tm">waiting time</text><line x1="270" y1="150" x2="370" y2="70" stroke="currentColor" stroke-opacity=".6" marker-end="url(#ar)"/><text x="340" y="122" font-size="10" text-anchor="start" class="tm">λ large</text></svg><figcaption>One coin flip → many flips → counts in time → waiting times. Most distributions are limits or transforms of each other.</figcaption></figure>
  <div class="fx" data-lang="py">k = range(6)
print("Binom(1000, .003):", [round(float(stats.binom(1000, 0.003).pmf(i)), 4) for i in k])
print("Poisson(3)       :", [round(float(stats.poisson(3).pmf(i)), 4) for i in k])</div>
  <div class="fx" data-lang="text">Binom(1000, .003): [0.0496, 0.1491, 0.2242, 0.2244, 0.1683, 0.1009]
Poisson(3)       : [0.0498, 0.1494, 0.224, 0.224, 0.168, 0.1008]</div>
  <p>Many trials with tiny p → Poisson with λ = np. Same numbers to 3 decimals.</p>

  <h2 id="sdi-check"><span class="num">08</span>Checking Normality</h2>
  <figure class="viz"><svg viewBox="0 0 560 186" width="560"><g transform="translate(0,0)"><text x="140" y="12" text-anchor="middle" font-weight="bold" font-size="11">normal sample: on the line</text><g transform="translate(0,16)"><line x1="10" y1="152" x2="270" y2="152" stroke="currentColor" stroke-opacity=".5"/><text x="40" y="167" text-anchor="middle" font-size="11">-2</text><text x="140" y="167" text-anchor="middle" font-size="11">0</text><text x="240" y="167" text-anchor="middle" font-size="11">2</text><text x="270" y="147" text-anchor="end" font-size="11" class="tm">theoretical</text><line x1="15" y1="149.9" x2="265" y2="44" class="sr" stroke-width="1.2" stroke-dasharray="4 3"/><path d="M20.9,144.5h0M38.3,142.7h0M48.3,140.7h0M55.7,139.9h0M61.5,136h0M66.5,134.5h0M70.8,134h0M74.6,130h0M78.1,128.9h0M81.4,126.6h0M84.4,118.8h0M87.2,118.7h0M89.8,117.9h0M92.3,117.3h0M94.7,117.3h0M97,115.6h0M99.3,115.5h0M101.4,113.8h0M103.5,113.6h0M105.5,110.3h0M107.4,110.2h0M109.3,109.9h0M111.2,108.8h0M113,108.1h0M114.8,106.7h0M116.6,104.7h0M118.3,104.7h0M120,103.5h0M121.7,103.1h0M123.3,102.4h0M125,102.3h0M126.6,101.7h0M128.2,101.1h0M129.8,100.7h0M131.4,99.9h0M133,99.7h0M134.5,99.7h0M136.1,98.7h0M137.7,97.8h0M139.2,96.5h0M140.8,96.5h0M142.3,94.3h0M143.9,91.3h0M145.5,88.9h0M147,88.8h0M148.6,88.8h0M150.2,87.9h0M151.8,87.7h0M153.4,87.5h0M155,86h0M156.7,86h0M158.3,85.3h0M160,84.4h0M161.7,84h0M163.4,83.4h0M165.2,82.7h0M167,82.6h0M168.8,82.5h0M170.7,82.3h0M172.6,82h0M174.5,81.9h0M176.5,80.7h0M178.6,80.5h0M180.7,79.8h0M183,79h0M185.3,78.2h0M187.7,77.2h0M190.2,77.1h0M192.8,75.7h0M195.6,75.4h0M198.6,73.9h0M201.9,71.8h0M205.4,70.7h0M209.2,70.4h0M213.5,67.3h0M218.5,66.5h0M224.3,64h0M231.7,63.4h0M241.7,58.9h0M259.1,53.4h0" class="sb" stroke-width="5.2" stroke-linecap="round" stroke-opacity=".75"/></g></g><g transform="translate(280,0)"><text x="140" y="12" text-anchor="middle" font-weight="bold" font-size="11">log-normal sample: curves up</text><g transform="translate(0,16)"><line x1="10" y1="152" x2="270" y2="152" stroke="currentColor" stroke-opacity=".5"/><text x="40" y="167" text-anchor="middle" font-size="11">-2</text><text x="140" y="167" text-anchor="middle" font-size="11">0</text><text x="240" y="167" text-anchor="middle" font-size="11">2</text><text x="270" y="147" text-anchor="end" font-size="11" class="tm">theoretical</text><line x1="15" y1="149.9" x2="265" y2="44" class="sr" stroke-width="1.2" stroke-dasharray="4 3"/><path d="M26.3,117.2h0M44.3,116.3h0M54.9,115.7h0M62.7,115.2h0M68.9,115.2h0M74.2,115.1h0M78.9,114.6h0M83,114.5h0M86.8,114.4h0M90.4,113.1h0M93.7,112.1h0M96.8,112h0M99.7,111.6h0M102.5,111.5h0M105.2,110.9h0M107.8,110.4h0M110.3,110.3h0M112.8,109.6h0M115.1,109.4h0M117.5,109h0M119.7,108.4h0M122,108h0M124.2,107.6h0M126.3,107.2h0M128.5,107h0M130.6,106.8h0M132.7,106h0M134.8,105.8h0M136.9,104.9h0M139,104.4h0M141,103.9h0M143.1,102.1h0M145.2,101.4h0M147.3,100.5h0M149.4,100.4h0M151.5,100.1h0M153.7,99.1h0M155.8,98.5h0M158,96.6h0M160.3,96.3h0M162.5,95.9h0M164.9,95.6h0M167.2,95.3h0M169.7,93.1h0M172.2,91h0M174.8,90.6h0M177.5,88h0M180.3,85.4h0M183.2,83.2h0M186.3,79.7h0M189.6,78.1h0M193.2,76.5h0M197,75.8h0M201.1,75.8h0M205.8,75.4h0M211.1,68.5h0M217.3,65.7h0M225.1,42.6h0M235.7,37.2h0M253.7,8h0" class="sb" stroke-width="5.2" stroke-linecap="round" stroke-opacity=".75"/></g></g></svg><figcaption>QQ-plot: sorted data vs where a normal would put them. Straight line = normal; a banana = skew.</figcaption></figure>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
near = 50 + 5*rng.standard_t(20, 5000)    # almost normal: slightly heavier tails
for name, x in [("normal, n=200", rng.normal(50, 5, 200)),
                ("lognormal, n=200", rng.lognormal(3, 0.6, 200)),
                ("near-normal, n=50", near[:50]),
                ("near-normal, n=5000", near)]:
    stat, p = stats.shapiro(x)
    print(f"{name:20s} W={stat:.3f}  p={p:.4f}")
# QQ-plot: stats.probplot(x, dist="norm", plot=plt)</div>
  <div class="fx" data-lang="text">normal, n=200        W=0.987  p=0.0684
lognormal, n=200     W=0.916  p=0.0000
near-normal, n=50    W=0.973  p=0.3062
near-normal, n=5000  W=0.999  p=0.0085</div>
  <table class="tbl">
    <tr><th>Tool</th><th>Reads as</th><th>Caveat</th></tr>
    <tr><td><strong>QQ-plot</strong></td><td>Points on the line → normal; banana → skew; S-shape → heavy/light tails</td><td>Best first look; shows <em>how</em> it's non-normal</td></tr>
    <tr><td><strong>Shapiro-Wilk</strong></td><td>H₀: data is normal. p &lt; 0.05 → reject</td><td>Tiny n: never rejects. Huge n: rejects trivial deviations</td></tr>
    <tr><td><strong>Skew / kurtosis</strong></td><td>Near 0 / 0 → roughly normal</td><td>Quick numeric summary</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The same near-normal data passes at n = 50 and fails at n = 5000. With big data, judge the QQ-plot and ask "is it normal <em>enough</em> for my method?"</p>
  </div>

  <h2 id="sdi-which"><span class="num">09</span>Which Distribution?</h2>
  <table class="tbl">
    <tr><th>Your data is…</th><th>Use</th><th>Example</th></tr>
    <tr><td>One yes/no outcome</td><td>Bernoulli</td><td>clicked / didn't</td></tr>
    <tr><td>Count of yeses out of a fixed n</td><td>Binomial</td><td>conversions out of 1,000 visitors</td></tr>
    <tr><td>Count per time/space, no upper limit</td><td>Poisson (Neg. Binomial if var ≫ mean)</td><td>tickets per hour</td></tr>
    <tr><td>Time until an event, constant rate</td><td>Exponential (Weibull if rate changes)</td><td>time between failures</td></tr>
    <tr><td>Symmetric, many small additive effects</td><td>Normal</td><td>heights, errors, sample means</td></tr>
    <tr><td>Positive, right-skewed, multiplicative</td><td>Log-normal</td><td>order value, income</td></tr>
    <tr><td>Equal chance over a range</td><td>Uniform</td><td>random IDs, priors with no info</td></tr>
  </table>

  <h2 id="sdi-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>A site gets 2 sign-ups per hour on average. P(no sign-ups in an hour)?</summary><div class="qa-body">Poisson(λ = 2): P(0) = e⁻² ≈ 0.135. And the wait until the next sign-up is Exponential with mean 30 min.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Binomial vs Poisson: how do you choose?</summary><div class="qa-body">Binomial when there's a fixed number of trials n and you count successes (can't exceed n). Poisson when you count events in a window with no natural upper limit. For huge n and tiny p they coincide with λ = np.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your count data has mean 3 and variance 20. What do you do?</summary><div class="qa-body">It's overdispersed; Poisson assumes var = mean. Use a Negative Binomial (or quasi-Poisson) model, or check for a mix of user types (zero-inflation if many zeros).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "the exponential is memoryless" mean? Give a case where that's wrong.</summary><div class="qa-body">P(wait &gt; s + t | waited s) = P(wait &gt; t): past waiting tells you nothing. Machine wear or user churn violate it: failure risk changes with age. Use Weibull or survival models there.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Heights ~ N(170, 10). What fraction is above 190?</summary><div class="qa-body">z = 2, so about 2.3% (half of the 5% outside ±2σ). In scipy: <code>stats.norm(170, 10).sf(190)</code> = 0.0228.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is income usually modelled as log-normal?</summary><div class="qa-body">It's positive and right-skewed, and grows multiplicatively (raises are percentages). Log of a product is a sum of logs, which the CLT pushes towards normal. So log(income) ≈ normal.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Shapiro-Wilk gives p = 0.001 on 50,000 rows. Is the data non-normal enough to matter?</summary><div class="qa-body">Not necessarily. With huge n, the test detects tiny, irrelevant deviations. Look at the QQ-plot and skew/kurtosis, and remember that many methods (t-tests on means) only need the mean to be normal, which the CLT gives you.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Mean and variance of a fair die as a discrete uniform?</summary><div class="qa-body">Mean 3.5, variance (n² − 1)/12 = 35/12 ≈ 2.92 for n = 6 faces.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What loss function matches each distribution in ML?</summary><div class="qa-body">Normal target → MSE. Bernoulli target → log-loss (binary cross-entropy). Poisson counts → Poisson deviance (e.g. <code>objective="poisson"</code> in LightGBM). Picking the loss = picking the assumed distribution of y.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write code: probability that a 2% conversion page gets 0 sales from 100 visitors.</summary><div class="qa-body"><code>stats.binom(100, 0.02).pmf(0)</code> = 0.98¹⁰⁰ ≈ 0.133. A zero-sales page is not proof of a bug.</div></details>
</main>`
});
