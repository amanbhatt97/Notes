// notes/mathstats/st_probability.js — Probability
Object.assign(TOPIC_CONTENT, {
  "st_probability": `<main>
  <h1>Probability</h1>
  <p class="lead">The language of uncertainty. Every classifier score, A/B test and Bayesian model is built from the few rules on this page, and interviewers love testing them with Bayes and simulation puzzles.</p>

  <h2 id="spr-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Probability</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Basics &amp; Rules</div>
        <ul>
          <li><b>Sample space S</b> — all outcomes; <b>event</b> — subset you care about</li>
          <li><b>Complement</b> — <code>P(not A) = 1 − P(A)</code>; "at least one" → 1 − P(none)</li>
          <li><b>Addition</b> — <code>P(A∪B) = P(A) + P(B) − P(A∩B)</code>; heart or king = 16/52</li>
          <li><b>Multiplication</b> — <code>P(A∩B) = P(A)·P(B|A)</code>; two aces = 4/52 × 3/51</li>
          <li>⚠ <b>Trap</b> — mutually exclusive ≠ independent (exclusive events are dependent)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Joint, Marginal, Conditional</div>
        <ul>
          <li><b>Joint</b> — P(A∩B): one cell ÷ total (mobile &amp; buy = 0.03)</li>
          <li><b>Marginal</b> — row/column total ÷ total (P(buy) = 0.07)</li>
          <li><b>Conditional</b> — <code>P(A|B) = P(A∩B)/P(B)</code>; zoom into row B (0.05)</li>
          <li>⚠ <b>P(A|B) ≠ P(B|A)</b> — buy|mobile 5% vs mobile|buy 43% (prosecutor's fallacy)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Independence</div>
        <ul>
          <li><b>Definition</b> — P(A|B) = P(A) ⇔ <code>P(A∩B) = P(A)·P(B)</code></li>
          <li><b>Check</b> — 0.07 × 0.6 = 0.042 ≠ 0.03 → device and buying dependent</li>
          <li>💡 coins have no memory; rain and umbrellas do</li>
          <li>⚠ <b>Gambler's fallacy</b> — after 5 heads, next is still 0.5</li>
          <li><b>Naive Bayes</b> — assumes features independent given class</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Bayes' Theorem</div>
        <ul>
          <li><b>Formula</b> — <code>P(A|B) = P(B|A)·P(A) / P(B)</code>; posterior ∝ likelihood × prior</li>
          <li><b>Evidence</b> — P(B) = Σ P(B|Aᵢ)P(Aᵢ) (total probability)</li>
          <li><b>Medical test</b> — 1% prevalence, 95%/95% test → P(sick|+) = 95/590 = 16%</li>
          <li><b>Base-rate fallacy</b> — ignoring the prior; rare events → most positives are false</li>
          <li><b>Update again</b> — 2nd positive: prior 16% → 78%</li>
          <li><b>Spam</b> — P(spam|"free") = 0.10/0.112 = 89%</li>
          <li><b>Tip</b> — use natural frequencies (count 10,000 people)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Random Variables</div>
        <ul>
          <li><b>Random variable</b> — a number assigned to each outcome</li>
          <li><b>E[X]</b> — <code>Σ x·P(x)</code>; die = 3.5</li>
          <li><b>Var(X)</b> — <code>E[(X − μ)²]</code>; die = 35/12 = 2.92</li>
          <li><b>Linearity</b> — E[aX + bY] = aE[X] + bE[Y], always</li>
          <li><b>Var(aX + b)</b> — a²Var(X); <b>Var(X ± Y)</b> = VarX + VarY if independent</li>
          <li><b>Games</b> — pay $2, win $10 on a 6: E = −$0.33 → don't play</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">LLN &amp; CLT</div>
        <ul>
          <li><b>LLN</b> — sample mean → true mean as n grows (coin → 0.5)</li>
          <li><b>CLT</b> — means of n draws ≈ <code>Normal(μ, σ/√n)</code>, any shape</li>
          <li><b>Standard error</b> — σ/√n; 4× data halves the noise</li>
          <li><b>Demo</b> — exponential skew 2.0 → means of 30 skew 0.38</li>
          <li><b>Why it matters</b> — t-tests, CIs, A/B tests on skewed metrics</li>
          <li>⚠ <b>Trap</b> — CLT is about the mean, not the data; fails for very heavy tails</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Puzzles</div>
        <ul>
          <li><b>Birthday</b> — 23 people → 50.7% share; 253 pairs, use complement</li>
          <li><b>Monty Hall</b> — switch wins 2/3; host's reveal carries info</li>
          <li>💡 100 doors, host opens 98 → obviously switch</li>
          <li><b>First head</b> — expected 1/p flips (geometric)</li>
          <li><b>All 6 faces</b> — 6(1 + ½ + … + ⅙) = 14.7 rolls</li>
          <li><b>When unsure</b> — simulate with numpy</li>
        </ul>
      </div>
    </div>
  </div>


  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="spr-space"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Sample Spaces &amp; Rules</span><span class="rm-sub">Addition and multiplication</span></div></div>
      <div class="rm-item rm-done" data-target="spr-cond"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Joint, Marginal, Conditional</span><span class="rm-sub">One 2×2 table explains all</span></div></div>
      <div class="rm-item rm-done" data-target="spr-indep"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Independence</span><span class="rm-sub">When knowing A tells nothing</span></div></div>
      <div class="rm-item rm-done" data-target="spr-bayes"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Bayes' Theorem</span><span class="rm-sub">Medical test, spam filter</span></div></div>
      <div class="rm-item rm-done" data-target="spr-rv"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Random Variables</span><span class="rm-sub">Expectation and variance</span></div></div>
      <div class="rm-item rm-done" data-target="spr-lln"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">LLN &amp; CLT</span><span class="rm-sub">Why averages behave</span></div></div>
      <div class="rm-item rm-done" data-target="spr-puzzles"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Classic Puzzles</span><span class="rm-sub">Birthday, Monty Hall, simulated</span></div></div>
      <div class="rm-item rm-done" data-target="spr-qa"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="spr-space"><span class="num">01</span>Sample Spaces, Events &amp; Rules</h2>
  <div class="cards">
    <div><b>Sample space S</b><p>Every possible outcome.</p><small>Die: {1,2,3,4,5,6}</small></div>
    <div><b>Event A</b><p>A subset of outcomes you care about.</p><small>"Even" = {2,4,6}</small></div>
    <div><b>P(A)</b><p>Favourable ÷ total, if outcomes are equally likely.</p><small>P(even) = 3/6 = 0.5</small></div>
  </div>
  <figure class="viz"><svg viewBox="0 0 560 190" width="560"><rect x="10" y="10" width="540" height="170" fill="none" stroke="currentColor" stroke-opacity=".4"/><text x="20" y="28" class="tm">S = 52 cards</text><circle cx="230" cy="90" r="62" class="fb sb"/><circle cx="320" cy="90" r="62" class="ft st"/><text x="195" y="92" text-anchor="end">Hearts 13</text><text x="355" y="92" text-anchor="start">Kings 4</text><text x="275" y="86" text-anchor="middle" font-weight="bold">K♥</text><text x="275" y="102" text-anchor="middle" font-size="10">1</text><text x="275" y="176" text-anchor="middle">P(H ∪ K) = 13/52 + 4/52 − 1/52 = 16/52</text></svg><figcaption>Add the two circles, then subtract the overlap you counted twice.</figcaption></figure>
  <table class="tbl">
    <tr><th>Rule</th><th>Formula</th><th>In words</th><th>Worked example</th></tr>
    <tr><td><strong>Complement</strong></td><td><code>P(not A) = 1 − P(A)</code></td><td>Often easier to count "none"</td><td>P(at least one 6 in 4 rolls) = 1 − (5/6)⁴ = 0.518</td></tr>
    <tr><td><strong>Addition</strong></td><td><code>P(A∪B) = P(A) + P(B) − P(A∩B)</code></td><td>"Or": add, remove double count</td><td>Heart or King = 16/52 = 0.308</td></tr>
    <tr><td><strong>Multiplication</strong></td><td><code>P(A∩B) = P(A) · P(B|A)</code></td><td>"And": first, then second given first</td><td>Two aces, no replacement = 4/52 × 3/51 = 0.0045</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Adding without subtracting the overlap only works for <strong>mutually exclusive</strong> events (can't both happen). Mutually exclusive is not the same as independent: exclusive events are strongly <em>dependent</em>.</p>
  </div>

  <h2 id="spr-cond"><span class="num">02</span>Joint, Marginal &amp; Conditional</h2>
  <table class="tbl out"><caption>1,000 visitors: device × purchase (counts)</caption>
    <tr><th></th><th>buy</th><th>no buy</th><th>total</th></tr>
    <tr><th>mobile</th><td>30</td><td>570</td><td>600</td></tr>
    <tr><th>desktop</th><td>40</td><td>360</td><td>400</td></tr>
    <tr><th>total</th><td>70</td><td>930</td><td>1000</td></tr>
  </table>
  <div class="cards">
    <div><b>Joint</b><p>P(mobile ∩ buy): one cell ÷ grand total.</p><small>30 / 1000 = 0.03</small></div>
    <div><b>Marginal</b><p>P(buy): a row/column total ÷ grand total.</p><small>70 / 1000 = 0.07</small></div>
    <div><b>Conditional</b><p>P(buy | mobile): zoom into one row.</p><small>30 / 600 = 0.05</small></div>
  </div>
  <p>Conditional formula: <code>P(A|B) = P(A∩B) / P(B)</code>. Read "|" as "given that". Check: 0.03 / 0.6 = 0.05.</p>
  <div class="fx" data-lang="py">import pandas as pd
df = pd.DataFrame({"buy": [30, 40], "no_buy": [570, 360]}, index=["mobile", "desktop"])
joint = df / df.values.sum()
print(joint)
print("P(buy) =", joint["buy"].sum())
print("P(buy|mobile) =", joint.loc["mobile", "buy"] / joint.loc["mobile"].sum())</div>
  <div class="fx" data-lang="text">          buy  no_buy
mobile   0.03    0.57
desktop  0.04    0.36
P(buy) = 0.07
P(buy|mobile) = 0.05</div>
  <div class="callout trap"><span class="label">Trap: P(A|B) ≠ P(B|A)</span>
    <p>P(buy | mobile) = 30/600 = 5%, but P(mobile | buy) = 30/70 = 43%. Swapping them is the "prosecutor's fallacy", and Bayes is the fix.</p>
  </div>

  <h2 id="spr-indep"><span class="num">03</span>Independence</h2>
  <div class="flow"><span>Is P(A|B) = P(A)?</span><span>Yes → independent</span><span>P(A∩B) = P(A)·P(B)</span></div>
  <p>Independent = knowing B doesn't change your belief about A. Check the table: P(buy) · P(mobile) = 0.07 × 0.6 = 0.042, but the actual joint is 0.03. Device and buying are <strong>dependent</strong> (desktop converts 2× better).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two coin flips are independent: the coin has no memory. Rain and umbrella sales are not: seeing one tells you a lot about the other.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: gambler's fallacy</span>
    <p>After 5 heads, P(heads) on the next fair flip is still 0.5. Naive Bayes also <em>assumes</em> words are independent given the class; it's wrong but often works.</p>
  </div>

  <h2 id="spr-bayes"><span class="num">04</span>Bayes' Theorem</h2>
  <div class="flow"><span>Prior P(A)</span><span>× Likelihood P(B|A)</span><span>÷ Evidence P(B)</span><span>= Posterior P(A|B)</span></div>
  <p><code>P(A|B) = P(B|A) · P(A) / P(B)</code>. In words: update your old belief by how well it explains the new evidence.</p>
  <h3>Medical test (base-rate fallacy)</h3>
  <p>Disease prevalence 1%. Test sensitivity 95% (catches sick people), specificity 95% (clears healthy people). You test positive. Chance you're sick?</p>
  <figure class="viz"><svg viewBox="0 0 580 210" width="580"><defs><marker id="ab" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><rect x="220" y="8" width="140" height="26" rx="5" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="290.0" y="25" text-anchor="middle">10,000 people</text><line x1="260" y1="34" x2="130" y2="68" stroke="currentColor" stroke-opacity=".6" marker-end="url(#ab)"/><text x="150" y="52" font-size="10" class="tm">1% sick</text><line x1="320" y1="34" x2="440" y2="68" stroke="currentColor" stroke-opacity=".6" marker-end="url(#ab)"/><text x="395" y="52" font-size="10" class="tm">99% healthy</text><rect x="70" y="70" width="120" height="26" rx="5" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="130.0" y="87" text-anchor="middle">100 sick</text><rect x="380" y="70" width="140" height="26" rx="5" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="450.0" y="87" text-anchor="middle">9,900 healthy</text><line x1="110" y1="96" x2="60" y2="136" stroke="currentColor" stroke-opacity=".6" marker-end="url(#ab)"/><text x="58" y="118" font-size="10" class="tm">95%</text><line x1="150" y1="96" x2="190" y2="136" stroke="currentColor" stroke-opacity=".6" marker-end="url(#ab)"/><text x="178" y="118" font-size="10" class="tm">5%</text><line x1="420" y1="96" x2="380" y2="136" stroke="currentColor" stroke-opacity=".6" marker-end="url(#ab)"/><text x="346" y="118" font-size="10" class="tm">5% FP</text><line x1="480" y1="96" x2="520" y2="136" stroke="currentColor" stroke-opacity=".6" marker-end="url(#ab)"/><text x="510" y="118" font-size="10" class="tm">95%</text><rect x="10" y="138" width="95" height="26" rx="5" class="fg sg" stroke="currentColor" stroke-opacity=".4"/><text x="57.5" y="155" text-anchor="middle">95 test +</text><rect x="150" y="138" width="90" height="26" rx="5" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="195.0" y="155" text-anchor="middle">5 test −</text><rect x="330" y="138" width="110" height="26" rx="5" class="fr sr" stroke="currentColor" stroke-opacity=".4"/><text x="385.0" y="155" text-anchor="middle">495 test +</text><rect x="470" y="138" width="105" height="26" rx="5" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="522.5" y="155" text-anchor="middle">9,405 test −</text><text x="290" y="196" text-anchor="middle" font-weight="bold">P(sick | +) = 95 / (95 + 495) = 16.1%</text></svg><figcaption>Count people, not percentages. False positives from the huge healthy group swamp the true positives.</figcaption></figure>
  <div class="fx" data-lang="py">prev, sens, spec = 0.01, 0.95, 0.95
p_pos = sens*prev + (1-spec)*(1-prev)          # total probability of "+"
post = sens*prev / p_pos
print("P(+) =", round(p_pos, 4), " P(sick|+) =", round(post, 4))
# test again: yesterday's posterior is today's prior
p2 = sens*post + (1-spec)*(1-post)
print("after 2nd +:", round(sens*post / p2, 4))</div>
  <div class="fx" data-lang="text">P(+) = 0.059  P(sick|+) = 0.161
after 2nd +: 0.7848</div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Most people guess 95%. The rare base rate (1%) dominates. Same reason a fraud model with 99% accuracy still flags mostly legit transactions when fraud is 0.1%.</p>
  </div>
  <h3>Spam filter</h3>
  <p>40% of mail is spam. "free" appears in 25% of spam and 2% of normal mail. An email contains "free".</p>
  <div class="fx" data-lang="py">ps, pw_s, pw_h = 0.4, 0.25, 0.02
print("P(spam|free) =", round(pw_s*ps / (pw_s*ps + pw_h*(1-ps)), 4))</div>
  <div class="fx" data-lang="text">P(spam|free) = 0.8929</div>
  <p>By hand: 0.25 × 0.4 = 0.10 vs 0.02 × 0.6 = 0.012 → 0.10 / 0.112 = 89%. Naive Bayes multiplies one such ratio per word.</p>

  <h2 id="spr-rv"><span class="num">05</span>Random Variables, Expectation &amp; Variance</h2>
  <div class="cards">
    <div><b>Random variable X</b><p>A number attached to each outcome.</p><small>X = die face; X = clicks today</small></div>
    <div><b>E[X]</b><p><code>Σ x·P(x)</code>: the long-run average.</p><small>Die: 3.5 (never actually rolled!)</small></div>
    <div><b>Var(X)</b><p><code>E[(X − E[X])²]</code>: average squared surprise.</p><small>Die: 35/12 = 2.917</small></div>
  </div>
  <div class="fx" data-lang="py">import numpy as np
x = np.arange(1, 7); p = np.ones(6) / 6
E = (x * p).sum(); Var = ((x - E)**2 * p).sum()
print("E =", E, " Var =", round(Var, 4))</div>
  <div class="fx" data-lang="text">E = 3.5  Var = 2.9167</div>
  <table class="tbl">
    <tr><th>Property</th><th>Rule</th><th>Use</th></tr>
    <tr><td>Linearity</td><td><code>E[aX + bY] = aE[X] + bE[Y]</code>, always</td><td>Expected revenue = Σ price × P(buy)</td></tr>
    <tr><td>Scaling</td><td><code>Var(aX + b) = a² Var(X)</code></td><td>Shifting doesn't change spread</td></tr>
    <tr><td>Sum</td><td><code>Var(X + Y) = Var X + Var Y</code> <em>if independent</em></td><td>Variance of a mean = σ²/n</td></tr>
  </table>
  <div class="callout intu"><span class="label">Interview use</span>
    <p>"A game pays $10 on a 6, costs $2. Play?" E = 10 × 1/6 − 2 = −$0.33 per game. No.</p>
  </div>

  <h2 id="spr-lln"><span class="num">06</span>Law of Large Numbers &amp; Central Limit Theorem</h2>
  <figure class="viz"><svg viewBox="0 0 560 180" width="560"><line x1="30" y1="152" x2="530" y2="152" stroke="currentColor" stroke-opacity=".5"/><text x="30" y="167" text-anchor="middle" font-size="11">1</text><text x="155" y="167" text-anchor="middle" font-size="11">10</text><text x="280" y="167" text-anchor="middle" font-size="11">100</text><text x="405" y="167" text-anchor="middle" font-size="11">1,000</text><text x="530" y="167" text-anchor="middle" font-size="11">10,000</text><text x="530" y="147" text-anchor="end" font-size="11" class="tm">flips (log scale)</text><line x1="30" y1="83" x2="530" y2="83" class="sr" stroke-width="1" stroke-dasharray="4 3"/><path d="M30.0,152.0 L67.6,83.0 L89.6,60.0 L105.3,48.5 L117.4,69.2 L127.3,83.0 L135.6,73.1 L142.9,65.8 L149.3,75.3 L155.0,83.0 L160.2,76.7 L164.9,83.0 L169.2,88.3 L177.0,87.6 L180.5,91.6 L186.9,83.0 L192.6,89.9 L197.8,83.0 L204.7,74.7 L208.9,80.4 L214.6,83.0 L221.4,87.1 L226.0,88.6 L231.6,91.4 L237.8,95.0 L243.4,92.5 L249.5,89.1 L254.9,90.7 L260.6,90.9 L265.8,87.5 L271.8,87.8 L277.2,83.7 L282.6,81.0 L288.5,81.2 L294.2,80.9 L299.8,80.1 L305.2,79.1 L311.0,79.5 L316.5,80.2 L322.1,79.5 L327.8,82.1 L333.3,83.3 L338.9,81.6 L344.6,79.9 L350.3,79.0 L355.8,81.6 L361.4,80.2 L367.0,80.9 L372.7,83.0 L378.3,82.3 L383.9,83.6 L389.5,85.0 L395.1,84.5 L400.8,85.2 L406.4,84.5 L412.0,84.2 L417.6,84.4 L423.3,83.6 L428.9,83.2 L434.5,82.9 L440.1,81.6 L445.7,82.0 L451.3,82.2 L457.0,81.9 L462.6,82.4 L468.2,82.2 L473.8,82.4 L479.4,82.7 L485.1,83.2 L490.7,83.3 L496.3,83.4 L501.9,83.5 L507.5,83.5 L513.1,83.1 L518.8,83.3 L524.4,82.8 L530.0,83.0" fill="none" class="sb" stroke-width="2"/><text x="36.2" y="25" text-anchor="start" font-size="11" class="tb">running share of heads</text><text x="523.8" y="76.1" text-anchor="end" font-size="11" class="tr">true p = 0.5</text></svg><figcaption>Early on the average swings wildly. With more flips it settles on 0.5. That's the law of large numbers.</figcaption></figure>
  <div class="fx" data-lang="py">rng = np.random.default_rng(1)
flips = rng.integers(0, 2, 10_000)
running = np.cumsum(flips) / np.arange(1, 10_001)
for n in [10, 100, 1000, 10000]:
    print(n, running[n-1])</div>
  <div class="fx" data-lang="text">10 0.5
100 0.5
1000 0.491
10000 0.5003</div>
  <p><strong>LLN</strong>: the sample average converges to the true mean as n grows. It's why casinos and insurers win reliably.</p>
  <figure class="viz"><svg viewBox="0 0 560 200" width="560"><line x1="30" y1="172" x2="548" y2="172" stroke="currentColor" stroke-opacity=".5"/><text x="30" y="187" text-anchor="middle" font-size="11">0</text><text x="104" y="187" text-anchor="middle" font-size="11">0.5</text><text x="178" y="187" text-anchor="middle" font-size="11">1</text><text x="252" y="187" text-anchor="middle" font-size="11">1.5</text><text x="326" y="187" text-anchor="middle" font-size="11">2</text><text x="400" y="187" text-anchor="middle" font-size="11">2.5</text><text x="474" y="187" text-anchor="middle" font-size="11">3</text><text x="548" y="187" text-anchor="middle" font-size="11">3.5</text><path d="M30,172 L30,108.8 L51.6,117.4 L73.2,124.8 L94.8,131.2 L116.3,136.7 L137.9,141.5 L159.5,145.7 L181.1,149.2 L202.7,152.3 L224.2,155 L245.8,157.3 L267.4,159.3 L289,161 L310.6,162.5 L332.2,163.8 L353.8,164.9 L375.3,165.9 L396.9,166.7 L418.5,167.4 L440.1,168 L461.7,168.6 L483.2,169 L504.8,169.4 L526.4,169.8 L548,170.1 L548,172 Z" class="ft" stroke="none"/><path d="M30,108.8 L51.6,117.4 L73.2,124.8 L94.8,131.2 L116.3,136.7 L137.9,141.5 L159.5,145.7 L181.1,149.2 L202.7,152.3 L224.2,155 L245.8,157.3 L267.4,159.3 L289,161 L310.6,162.5 L332.2,163.8 L353.8,164.9 L375.3,165.9 L396.9,166.7 L418.5,167.4 L440.1,168 L461.7,168.6 L483.2,169 L504.8,169.4 L526.4,169.8 L548,170.1" fill="none" class="st" stroke-width="2" stroke-dasharray="5 3"/><path d="M81.8,172V171.9H92.9V172M92.9,172V171.7H104V172M104,172V169.4H115.1V172M115.1,172V159.9H126.2V172M126.2,172V138.9H137.3V172M137.3,172V105.5H148.4V172M148.4,172V70.7H159.5V172M159.5,172V38.1H170.6V172M170.6,172V36H181.7V172M181.7,172V49.5H192.8V172M192.8,172V80.2H203.9V172M203.9,172V107.9H215V172M215,172V134.4H226.1V172M226.1,172V151.6H237.2V172M237.2,172V161.6H248.3V172M248.3,172V166.4H259.4V172M259.4,172V168.8H270.5V172M270.5,172V171.2H281.6V172M281.6,172V171.8H292.7V172" class="fb sb"/><path d="M74.4,171.9 L79.4,171.8 L84.5,171.7 L89.5,171.4 L94.6,170.8 L99.6,169.9 L104.7,168.5 L109.7,166.3 L114.8,163.1 L119.8,158.4 L124.9,152 L129.9,143.7 L134.9,133.2 L140,120.7 L145,106.4 L150.1,91 L155.1,75.5 L160.2,60.9 L165.2,48.5 L170.3,39.4 L175.3,34.6 L180.4,34.4 L185.4,39 L190.4,47.8 L195.5,60 L200.5,74.5 L205.6,90 L210.6,105.4 L215.7,119.7 L220.7,132.4 L225.8,143 L230.8,151.5 L235.9,158 L240.9,162.8 L245.9,166.1 L251,168.4 L256,169.9 L261.1,170.8 L266.1,171.3 L271.2,171.6 L276.2,171.8 L281.3,171.9 L286.3,172 L291.4,172 L296.4,172" fill="none" class="sr" stroke-width="1.8"/><text x="311.2" y="137.2" text-anchor="start" font-size="11" class="tm">raw data: exponential (skewed)</text><text x="289" y="45.6" text-anchor="start" font-size="11" class="tb">means of n=30: bell-shaped</text><text x="289" y="61.4" text-anchor="start" font-size="11" class="tr">red = Normal(1, 1/√30)</text></svg><figcaption>Each bar = how often a 30-sample average landed there. Skewed raw data, yet the averages form a normal curve.</figcaption></figure>
  <div class="fx" data-lang="py">from scipy import stats
rng = np.random.default_rng(0)
raw = rng.exponential(1, 300_000)
means = rng.exponential(1, (10_000, 30)).mean(axis=1)   # 10k averages of n=30
print("raw   skew:", round(stats.skew(raw), 2))
print("means skew:", round(stats.skew(means), 2))
print("std of means:", round(means.std(), 4), " theory σ/√n:", round(1/np.sqrt(30), 4))</div>
  <div class="fx" data-lang="text">raw   skew: 2.02
means skew: 0.38
std of means: 0.1828  theory σ/√n: 0.1826</div>
  <p><strong>CLT</strong>: averages of n independent draws are ≈ Normal(μ, σ/√n), whatever the original shape. Skew shrinks by √n (2.0 → 0.38 here), so n ≈ 30 is enough for mild skew.</p>
  <div class="callout intu"><span class="label">Why it matters</span>
    <p>It's why t-tests, confidence intervals and A/B tests work on non-normal metrics like revenue: they test the <em>mean</em>, and the mean is normal. σ/√n is the <strong>standard error</strong>: 4× the data halves the noise.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>CLT is about the distribution of the <em>mean</em>, not the data. The raw data stays skewed. Very heavy tails (e.g. Cauchy) or tiny n break it.</p>
  </div>

  <h2 id="spr-puzzles"><span class="num">07</span>Classic Interview Puzzles</h2>
  <h3>Birthday problem</h3>
  <p>How many people until a shared birthday is more likely than not? Use the complement: P(all different) = 365/365 × 364/365 × … .</p>
  <div class="fx" data-lang="py">from math import prod
for n in [23, 50, 70]:
    print(n, "exact:", round(1 - prod((365-i)/365 for i in range(n)), 4))
rng = np.random.default_rng(0)
bdays = rng.integers(0, 365, (100_000, 23))
shared = np.array([len(set(r)) &lt; 23 for r in bdays])
print("simulated, n=23:", shared.mean())</div>
  <div class="fx" data-lang="text">23 exact: 0.5073
50 exact: 0.9704
70 exact: 0.9992
simulated, n=23: 0.50699</div>
  <p>Only 23. Intuition fails because there are 23 × 22 / 2 = 253 <em>pairs</em>, not 23 chances.</p>
  <h3>Monty Hall</h3>
  <div class="flow"><span>Pick door 1</span><span>Host opens a goat door (he knows)</span><span>Stay or switch?</span></div>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
n = 100_000
car = rng.integers(0, 3, n)
pick = rng.integers(0, 3, n)
print("stay wins  :", (pick == car).mean())
print("switch wins:", (pick != car).mean())   # switching wins whenever first pick was wrong</div>
  <div class="fx" data-lang="text">stay wins  : 0.33168
switch wins: 0.66832</div>
  <div class="callout anlg"><span class="label">Intuition</span>
    <p>Imagine 100 doors; you pick one and the host opens 98 goats. Your door kept its 1/100 chance; the one he carefully avoided holds the other 99/100.</p>
  </div>
  <table class="tbl">
    <tr><th>Puzzle</th><th>Answer</th><th>Trick</th></tr>
    <tr><td>P(at least one 6 in 4 rolls)</td><td>1 − (5/6)⁴ = 0.518</td><td>Complement</td></tr>
    <tr><td>Two children, at least one boy. P(two boys)?</td><td>1/3</td><td>List {BB, BG, GB}</td></tr>
    <tr><td>Expected flips until first head</td><td>2</td><td>Geometric: 1/p</td></tr>
    <tr><td>Expected rolls to see all 6 faces</td><td>6(1 + 1/2 + … + 1/6) = 14.7</td><td>Coupon collector, linearity</td></tr>
  </table>

  <h2 id="spr-qa"><span class="num">08</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>A fraud model flags 1% of legit transactions and catches 90% of fraud. Fraud rate is 0.1%. What fraction of flags are real fraud?</summary><div class="qa-body">Per 100,000: 100 fraud → 90 flagged; 99,900 legit → 999 flagged. Precision = 90 / 1,089 ≈ 8.3%. Low base rate kills precision, which is why fraud teams look at precision/recall, not accuracy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Are mutually exclusive events independent?</summary><div class="qa-body">No (unless one has probability 0). If A happens, B certainly didn't, so knowing A changes P(B) to 0. That's maximum dependence.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can two variables have zero correlation but be dependent?</summary><div class="qa-body">Yes. X uniform on [−1, 1] and Y = X²: Y is fully determined by X, yet their correlation is 0 because the relationship isn't linear. Independence implies zero correlation, not the reverse.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>State the CLT and why A/B testing relies on it.</summary><div class="qa-body">The mean of n independent draws from any distribution with finite variance is approximately Normal(μ, σ/√n) for large n. A/B tests compare means of metrics that are rarely normal (revenue, clicks); the CLT makes the z/t-test on those means valid.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>LLN vs CLT in one line each?</summary><div class="qa-body">LLN: the sample mean converges to the true mean. CLT: the sample mean's error around the truth is normally distributed with spread σ/√n. LLN says where it goes; CLT says how it wobbles on the way.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You roll two dice. P(sum = 7)? P(at least one 6)?</summary><div class="qa-body">Sum 7: 6 of 36 combos → 1/6. At least one 6: 1 − (5/6)² = 11/36 ≈ 0.306.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain Monty Hall in 20 seconds.</summary><div class="qa-body">Your first pick is right 1/3 of the time. The host always reveals a goat, which doesn't change that. So the remaining door carries the other 2/3. Switching wins whenever your first pick was wrong: 2/3. Simulation confirms ≈ 0.667.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a second positive test raise P(sick) from 16% to 78%?</summary><div class="qa-body">The first posterior (16%) becomes the new prior. Applying Bayes again with a much higher prior gives 78%. This sequential updating is the core of Bayesian thinking (assuming the two tests' errors are independent).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write <code>Var(X − Y)</code> for independent X, Y.</summary><div class="qa-body">Var X + Var Y. Variances add even for a difference, because Var(−Y) = (−1)² Var Y. This is why the standard error of a difference of two group means is √(σ₁²/n₁ + σ₂²/n₂).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Expected number of flips to get one head with p = 0.2?</summary><div class="qa-body">1/p = 5 (geometric distribution). Intuition: 20% success per try → about one success per 5 tries.</div></details>
</main>`
});
