// notes/mathstats/st_abtesting.js — A/B Testing
Object.assign(TOPIC_CONTENT, {
  "st_abtesting": `<main>
  <h1>A/B Testing</h1>
  <p class="lead">The standard way tech companies decide what to ship: randomise users, change one thing, measure. It's hypothesis testing with real-world mess (peeking, novelty, broken randomisation, network effects), and it's the most common DS case-interview topic. Builds on Hypothesis Testing.</p>

  <h2 id="sab-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">A/B Testing</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Lifecycle</div>
        <ul>
          <li><b>Flow</b> — hypothesis → metrics → unit → sample size → run → checks → analyse → decide</li>
          <li><b>Hypothesis</b> — "Change X will raise metric Y by ≥ Z because …"</li>
          <li><b>Pre-register</b> — metric, MDE, duration, test fixed before launch</li>
          <li>💡 like a clinical trial for product changes</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Metrics</div>
        <ul>
          <li><b>Primary (OEC)</b> — one decision metric; sensitive and tied to value</li>
          <li><b>Secondary</b> — explain the why (CTR, add-to-cart)</li>
          <li><b>Guardrails</b> — must not get worse: latency, errors, unsubscribes, revenue</li>
          <li>⚠ <b>Proxy trap</b> — clicks up, long-term retention down</li>
          <li><b>Ratio metrics</b> — per-user denominators; delta method for variance</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Randomisation Unit</div>
        <ul>
          <li><b>User</b> — default; consistent experience; hash(user_id) → bucket</li>
          <li><b>Session / page view</b> — more samples but same user sees both</li>
          <li><b>Cluster</b> (city, school) — when users interact</li>
          <li>⚠ <b>Unit ≠ analysis unit</b> — randomise users, analyse clicks → SE too small</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Sample Size &amp; Duration</div>
        <ul>
          <li><b>Inputs</b> — baseline p, MDE, α (0.05), power (0.8)</li>
          <li><b>Rule of thumb</b> — <code>n ≈ 16·p(1−p)/δ²</code> per arm</li>
          <li><b>Example</b> — 10% → 11%: ≈ 14,745 per arm</li>
          <li><b>MDE halves → n ×4</b> — 0.5 pp needs 57,756 per arm</li>
          <li><b>Duration</b> — total n / daily traffic, rounded up to full weeks (≥ 1–2)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Validity Threats</div>
        <ul>
          <li><b>Peeking</b> — checking daily and stopping at p &lt; 0.05: FPR 5% → 22%</li>
          <li><b>Fix peeking</b> — fixed horizon, or sequential tests / alpha spending</li>
          <li><b>Novelty / primacy</b> — early lift fades (or grows); plot lift by day</li>
          <li><b>SRM</b> — split ≠ planned; χ² test, p &lt; 0.001 → don't trust results</li>
          <li><b>Network effects</b> — treatment leaks to control; cluster or switchback</li>
          <li><b>Many variants</b> — Bonferroni/Dunnett; more arms = more n</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Analysis &amp; Decision</div>
        <ul>
          <li><b>Test</b> — two-proportion z-test (conversion), Welch t (means)</li>
          <li><b>Worked</b> — 10.0% → 11.1%, p = 0.0017, CI [+0.41, +1.79] pp</li>
          <li><b>Practical significance</b> — compare CI with MDE, not just with 0</li>
          <li><b>Decide</b> — CI above MDE → ship; spans 0 → inconclusive; below 0 → kill</li>
          <li>⚠ significant ≠ worth shipping (cost, risk, guardrails)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Business Impact</div>
        <ul>
          <li><b>Formula</b> — lift × users/yr × value per conversion</li>
          <li><b>Report a range</b> — use the CI: ≈ $200k–$860k, point $530k</li>
          <li><b>Story</b> — what changed, how sure, worth it, risks, recommendation</li>
          <li>⚠ winners' curse — measured lifts of winners are inflated; discount</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sab-flow"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Lifecycle</span><span class="rm-sub">Hypothesis to decision</span></div></div>
      <div class="rm-item rm-done" data-target="sab-metrics"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Metrics &amp; Unit</span><span class="rm-sub">OEC, guardrails, randomisation</span></div></div>
      <div class="rm-item rm-done" data-target="sab-size"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Sample Size &amp; Duration</span><span class="rm-sub">Power calculation in code</span></div></div>
      <div class="rm-item rm-done" data-target="sab-analysis"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Worked Example</span><span class="rm-sub">SRM check, z-test, CI</span></div></div>
      <div class="rm-item rm-done" data-target="sab-practical"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Practical Significance</span><span class="rm-sub">Ship, kill or extend</span></div></div>
      <div class="rm-item rm-done" data-target="sab-pitfalls"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Pitfalls</span><span class="rm-sub">Peeking, novelty, network, variants</span></div></div>
      <div class="rm-item rm-done" data-target="sab-impact"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Business Impact</span><span class="rm-sub">Presenting the result</span></div></div>
      <div class="rm-item rm-done" data-target="sab-qa"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Case Questions</span><span class="rm-sub">Interview-style Q&amp;A</span></div></div>
    </div>
  </div>

  <h2 id="sab-flow"><span class="num">01</span>The Experiment Lifecycle</h2>
  <div class="flow"><span>Hypothesis</span><span>Metrics + guardrails</span><span>Randomisation unit</span><span>Sample size</span><span>Run full weeks</span><span>Sanity checks (SRM)</span><span>Analyse</span><span>Decide &amp; communicate</span></div>
  <p>Running example: an online shop tests a <strong>one-page checkout</strong> against the current three-step checkout.</p>
  <div class="callout def"><span class="label">Hypothesis</span>
    <p>"Removing two checkout steps will raise purchase conversion from 10% to at least 11%, because fewer steps mean fewer drop-offs." H₀: no difference. Two-sided, α = 0.05, power 0.8.</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A clinical trial. Random assignment makes the groups identical on average, so any difference afterwards must come from the treatment.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Fix the metric, MDE and duration <em>before</em> launch. Choosing them after seeing data turns the test into a fishing trip.</p>
  </div>

  <h2 id="sab-metrics"><span class="num">02</span>Metrics &amp; Randomisation Unit</h2>
  <div class="cards">
    <div><b>Primary (OEC)</b><p>The one metric that decides. Sensitive, moves within weeks, tied to value.</p><small>Purchase conversion per user</small></div>
    <div><b>Secondary</b><p>Explain <em>why</em> the primary moved.</p><small>Step drop-off, time to purchase</small></div>
    <div><b>Guardrails</b><p>Must not get worse, even if the primary wins.</p><small>Page latency, payment errors, refund rate, AOV</small></div>
  </div>
  <div class="callout trap"><span class="label">Trap: proxy metrics</span>
    <p>Optimising clicks with clickbait raises CTR and lowers retention. Pick a primary metric close to long-term value, and guard the rest.</p>
  </div>
  <table class="tbl">
    <tr><th>Unit</th><th>Pros</th><th>Cons</th><th>Use for</th></tr>
    <tr><td><strong>User</strong> (hash of user_id)</td><td>Consistent experience; independent units</td><td>Needs login or stable cookie</td><td>Most product tests (our checkout)</td></tr>
    <tr><td><strong>Session / page view</strong></td><td>More samples, faster</td><td>Same person sees both versions</td><td>Invisible changes: ranking, latency</td></tr>
    <tr><td><strong>Cluster</strong> (city, school)</td><td>Contains interference</td><td>Few units → low power</td><td>Marketplaces, social features</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Randomise by user but analyse per page view, and views from one user are correlated. The SE comes out too small and false positives soar. Analyse at the randomisation unit (or use the delta method).</p>
  </div>

  <h2 id="sab-size"><span class="num">03</span>Sample Size &amp; Run Duration</h2>
  <p>Per-arm n for proportions: <code>n = (z₁₋α/₂ + z₁₋β)² · [p₁(1−p₁) + p₂(1−p₂)] / δ²</code>. Shortcut at α 0.05, power 0.8: <code>n ≈ 16 · p(1−p) / δ²</code>.</p>
  <p>Worked: 16 × 0.1 × 0.9 / 0.01² = <strong>14,400</strong> per arm. The exact calculation:</p>
  <div class="fx" data-lang="py">import numpy as np
from scipy import stats
from statsmodels.stats.power import NormalIndPower
from statsmodels.stats.proportion import proportion_effectsize

baseline, target = 0.10, 0.11                      # MDE = +1 pp (10% relative)
h = proportion_effectsize(target, baseline)        # Cohen's h for proportions
n = NormalIndPower().solve_power(effect_size=h, alpha=0.05, power=0.8)
print(f"per arm: {np.ceil(n):,.0f}   total: {2*np.ceil(n):,.0f}")
for mde in [0.005, 0.01, 0.02]:
    h = proportion_effectsize(baseline + mde, baseline)
    print(f"MDE {mde*100:.1f} pp -&gt; {np.ceil(NormalIndPower().solve_power(h, alpha=0.05, power=0.8)):,.0f} per arm")</div>
  <div class="fx" data-lang="text">per arm: 14,745   total: 29,490
MDE 0.5 pp -&gt; 57,756 per arm
MDE 1.0 pp -&gt; 14,745 per arm
MDE 2.0 pp -&gt; 3,835 per arm</div>
  <figure class="viz"><svg viewBox="0 0 560 190" width="560"><line x1="40" y1="162" x2="546" y2="162" stroke="currentColor" stroke-opacity=".5"/><text x="121.6" y="177" text-anchor="middle" font-size="11">0.5</text><text x="203.2" y="177" text-anchor="middle" font-size="11">1.0</text><text x="284.8" y="177" text-anchor="middle" font-size="11">1.5</text><text x="366.5" y="177" text-anchor="middle" font-size="11">2.0</text><text x="448.1" y="177" text-anchor="middle" font-size="11">2.5</text><text x="529.7" y="177" text-anchor="middle" font-size="11">3.0</text><text x="546" y="157" text-anchor="end" font-size="11" class="tm">MDE (pp)</text><path d="M105.3,18.2 L116.2,56.1 L127.1,80.7 L137.9,97.6 L148.8,109.7 L159.7,118.6 L170.6,125.4 L181.5,130.8 L192.3,135.0 L203.2,138.4 L214.1,141.2 L225.0,143.5 L235.9,145.5 L246.8,147.1 L257.6,148.5 L268.5,149.8 L279.4,150.8 L290.3,151.7 L301.2,152.6 L312.0,153.3 L322.9,153.9 L333.8,154.5 L344.7,155.0 L355.6,155.5 L366.5,155.9 L377.3,156.2 L388.2,156.6 L399.1,156.9 L410.0,157.2 L420.9,157.4 L431.7,157.7 L442.6,157.9 L453.5,158.1 L464.4,158.3 L475.3,158.5 L486.2,158.6 L497.0,158.8 L507.9,158.9 L518.8,159.0 L529.7,159.2" fill="none" class="sb" stroke-width="2"/><text x="34" y="166.0" text-anchor="end" font-size="10" class="tm">0k</text><text x="34" y="134.0" text-anchor="end" font-size="10" class="tm">20k</text><text x="34" y="102.0" text-anchor="end" font-size="10" class="tm">40k</text><text x="34" y="70.0" text-anchor="end" font-size="10" class="tm">60k</text><text x="34" y="38.0" text-anchor="end" font-size="10" class="tm">80k</text><path d="M121.6,69.6h0M203.2,138.4h0M366.5,155.9h0" class="sr" stroke-width="7.0" stroke-linecap="round"/><text x="134.7" y="69.6" text-anchor="start" font-size="10">57.8k</text><text x="216.3" y="134.8" text-anchor="start" font-size="10">14.7k (our test)</text><text x="374.6" y="150.8" text-anchor="start" font-size="10">3.8k</text></svg><figcaption>Users per arm vs the smallest lift you want to detect (baseline 10%). Halving the MDE quadruples the sample.</figcaption></figure>
  <div class="fx" data-lang="py">daily_users = 2200                                  # eligible checkout visitors/day
days = 2 * 14745 / daily_users
print(f"{days:.1f} days -&gt; run {int(np.ceil(days / 7) * 7)} days (full weeks)")</div>
  <div class="fx" data-lang="text">13.4 days -&gt; run 14 days (full weeks)</div>
  <div class="callout intu"><span class="label">Why full weeks</span>
    <p>Weekend shoppers behave differently. Stopping mid-week over-represents some days. Run at least one, ideally two, full business cycles.</p>
  </div>

  <h2 id="sab-analysis"><span class="num">04</span>Worked Example, End to End</h2>
  <p>After 14 days: control 15,400 users, 1,540 purchases; treatment 15,380 users, 1,707 purchases.</p>
  <h3>Step 1: sanity check (SRM)</h3>
  <p><strong>Sample ratio mismatch</strong>: the split differs from the planned 50/50 more than chance allows. It signals broken assignment, bot filtering or logging bugs.</p>
  <div class="fx" data-lang="py">print("ours  :", stats.chisquare([15400, 15380]).pvalue.round(4))
print("broken:", stats.chisquare([15400, 14700]).pvalue)</div>
  <div class="fx" data-lang="text">ours  : 0.9092
broken: 5.466443968511142e-05</div>
  <p>Ours is fine. A 15,400 / 14,700 split (p ≈ 0.00005) would mean: <strong>stop, find the bug, don't read the results</strong>. Common cause: the new page crashes on old browsers, so those users never log a visit.</p>
  <h3>Step 2: test and confidence interval</h3>
  <div class="fx" data-lang="py">from statsmodels.stats.proportion import proportions_ztest, confint_proportions_2indep
conv, users = np.array([1707, 1540]), np.array([15380, 15400])   # treatment, control
rates = conv / users
z, p = proportions_ztest(conv, users)
lo, hi = confint_proportions_2indep(conv[0], users[0], conv[1], users[1], compare="diff")
print(f"control {rates[1]:.2%}  treatment {rates[0]:.2%}")
print(f"abs lift {rates[0]-rates[1]:+.2%}  rel lift {rates[0]/rates[1]-1:+.1%}")
print(f"z={z:.2f}  p={p:.4f}  95% CI for diff: [{lo:+.2%}, {hi:+.2%}]")</div>
  <div class="fx" data-lang="text">control 10.00%  treatment 11.10%
abs lift +1.10%  rel lift +11.0%
z=3.14  p=0.0017  95% CI for diff: [+0.41%, +1.79%]</div>
  <p>By hand: pooled p̂ = 3,247 / 30,780 = 0.1055; SE = √(p̂(1−p̂)(1/15,380 + 1/15,400)) = 0.0035; z = 0.0110 / 0.0035 ≈ 3.1.</p>
  <h3>Step 3: guardrails</h3>
  <p>Check latency, payment errors and refunds didn't worsen (same tests, each with its own CI). Then decide.</p>

  <h2 id="sab-practical"><span class="num">05</span>Statistical vs Practical Significance</h2>
  <figure class="viz"><svg viewBox="0 0 560 200" width="560"><line x1="150" y1="172" x2="546" y2="172" stroke="currentColor" stroke-opacity=".5"/><text x="150" y="187" text-anchor="middle" font-size="11">−2</text><text x="240" y="187" text-anchor="middle" font-size="11">−1</text><text x="330" y="187" text-anchor="middle" font-size="11">0</text><text x="420" y="187" text-anchor="middle" font-size="11">+1</text><text x="510" y="187" text-anchor="middle" font-size="11">+2</text><text x="546" y="167" text-anchor="end" font-size="11" class="tm">lift (pp)</text><line x1="330" y1="165.3" x2="330" y2="22.7" class="sr" stroke-width="1.2" stroke-dasharray="4 3"/><line x1="420" y1="165.3" x2="420" y2="22.7" class="sg" stroke-width="1.2" stroke-dasharray="4 3"/><text x="330" y="21.6" text-anchor="middle" font-size="10" class="tr">0</text><text x="420" y="21.6" text-anchor="middle" font-size="10" class="tg">MDE</text><line x1="384" y1="38.3" x2="492" y2="38.3" class="sg" stroke-width="3"/><path d="M438,38.3h0" class="sg" stroke-width="7.0" stroke-linecap="round"/><text x="142" y="42.3" text-anchor="end" font-size="11">A: ship</text><line x1="339" y1="60.6" x2="375" y2="60.6" class="sb" stroke-width="3"/><path d="M357,60.6h0" class="sb" stroke-width="7.0" stroke-linecap="round"/><text x="142" y="64.6" text-anchor="end" font-size="11">B: real but tiny</text><line x1="249" y1="82.9" x2="465" y2="82.9" class="sb" stroke-width="3"/><path d="M357,82.9h0" class="sb" stroke-width="7.0" stroke-linecap="round"/><text x="142" y="86.9" text-anchor="end" font-size="11">C: inconclusive</text><line x1="307.5" y1="105.1" x2="357" y2="105.1" class="sb" stroke-width="3"/><path d="M332.2,105.1h0" class="sb" stroke-width="7.0" stroke-linecap="round"/><text x="142" y="109.1" text-anchor="end" font-size="11">D: confident null</text><line x1="186" y1="127.4" x2="294" y2="127.4" class="sr" stroke-width="3"/><path d="M240,127.4h0" class="sr" stroke-width="7.0" stroke-linecap="round"/><text x="142" y="131.4" text-anchor="end" font-size="11">E: kill</text><line x1="366.9" y1="149.7" x2="491.1" y2="149.7" class="sg" stroke-width="3"/><path d="M429,149.7h0" class="sg" stroke-width="7.0" stroke-linecap="round"/><text x="142" y="153.7" text-anchor="end" font-size="11" font-weight="bold">ours</text></svg><figcaption>Each bar is a 95% CI for the lift. Judge it against 0 (is it real?) and against the MDE (is it worth it?).</figcaption></figure>
  <table class="tbl">
    <tr><th>CI for the lift</th><th>Decision</th></tr>
    <tr><td>Entirely above 0 and mostly above MDE</td><td><strong>Ship</strong></td></tr>
    <tr><td>Above 0 but entirely below MDE</td><td>Real but tiny: ship only if cheap and low risk</td></tr>
    <tr><td>Spans 0, wide</td><td>Inconclusive: underpowered. Don't call it "no effect"</td></tr>
    <tr><td>Spans 0, narrow around 0</td><td>Confident null: kill, move on</td></tr>
    <tr><td>Entirely below 0</td><td><strong>Kill</strong> and learn why</td></tr>
  </table>
  <p>Our CI [+0.41, +1.79] pp is above 0 and centred at the MDE (1 pp). Guardrails clean → ship.</p>

  <h2 id="sab-pitfalls"><span class="num">06</span>Pitfalls</h2>
  <h3>Peeking</h3>
  <figure class="viz"><svg viewBox="0 0 560 180" width="560"><line x1="40" y1="152" x2="548" y2="152" stroke="currentColor" stroke-opacity=".5"/><text x="94.4" y="167" text-anchor="middle" font-size="11">d2</text><text x="167" y="167" text-anchor="middle" font-size="11">d4</text><text x="239.6" y="167" text-anchor="middle" font-size="11">d6</text><text x="312.1" y="167" text-anchor="middle" font-size="11">d8</text><text x="384.7" y="167" text-anchor="middle" font-size="11">d10</text><text x="457.3" y="167" text-anchor="middle" font-size="11">d12</text><text x="529.9" y="167" text-anchor="middle" font-size="11">d14</text><text x="34" y="149.1" text-anchor="end" font-size="10" class="tm">0.05</text><text x="34" y="87.0" text-anchor="end" font-size="10" class="tm">0.5</text><text x="34" y="18.0" text-anchor="end" font-size="10" class="tm">1.0</text><rect x="40.0" y="145.1" width="508.0" height="6.9" class="fr"/><path d="M58.1,69.5 L94.4,25.6 L130.7,121.2 L167.0,144.4 L203.3,138.5 L239.6,149.6 L275.9,125.3 L312.1,122.6 L348.4,105.2 L384.7,52.8 L421.0,82.4 L457.3,60.3 L493.6,48.4 L529.9,62.8" fill="none" class="sb" stroke-width="2"/><path d="M58.1,69.5h0M94.4,25.6h0M130.7,121.2h0M167,144.4h0M203.3,138.5h0M239.6,149.6h0M275.9,125.3h0M312.1,122.6h0M348.4,105.2h0M384.7,52.8h0M421,82.4h0M457.3,60.3h0M493.6,48.4h0M529.9,62.8h0" class="sb" stroke-width="6" stroke-linecap="round"/><text x="250.5" y="135.4" text-anchor="start" font-size="11" class="tr">day 6: p = 0.017 → 'ship!'</text><text x="540.7" y="20.9" text-anchor="end" font-size="11">day 14 (planned end): p = 0.65</text></svg><figcaption>One simulated A/A test (no real difference). Its daily p-value dips into the red zone (p &lt; 0.05), then wanders back. Stopping at the dip ships noise.</figcaption></figure>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)                 # A/A test: no real difference
sims, days, per_day = 2000, 14, 1100
peek_fp = end_fp = 0
for _ in range(sims):
    a = rng.binomial(per_day, 0.10, days).cumsum()
    b = rng.binomial(per_day, 0.10, days).cumsum()
    n_ = per_day * np.arange(1, days + 1)
    ps = [proportions_ztest([a[d], b[d]], [n_[d], n_[d]])[1] for d in range(days)]
    peek_fp += min(ps) &lt; 0.05                  # stop the first day p &lt; 0.05
    end_fp += ps[-1] &lt; 0.05                    # look once, at the planned end
print(f"false positive rate, peeking daily: {peek_fp/sims:.1%}")
print(f"false positive rate, fixed horizon: {end_fp/sims:.1%}")</div>
  <div class="fx" data-lang="text">false positive rate, peeking daily: 21.6%
false positive rate, fixed horizon: 5.0%</div>
  <p>14 looks give 14 chances for noise to cross 0.05. Fixes: decide the horizon up front, or use <strong>sequential testing</strong> (alpha-spending such as O'Brien-Fleming, or always-valid p-values) built to allow peeks.</p>
  <h3>Novelty and primacy effects</h3>
  <figure class="viz"><svg viewBox="0 0 560 170" width="560"><line x1="30" y1="142" x2="548" y2="142" stroke="currentColor" stroke-opacity=".5"/><text x="47.9" y="157" text-anchor="middle" font-size="11">1</text><text x="155" y="157" text-anchor="middle" font-size="11">7</text><text x="280.1" y="157" text-anchor="middle" font-size="11">14</text><text x="405.1" y="157" text-anchor="middle" font-size="11">21</text><text x="530.1" y="157" text-anchor="middle" font-size="11">28</text><text x="548" y="137" text-anchor="end" font-size="11" class="tm">day</text><path d="M47.9,46.3 L65.7,61.0 L83.6,73.1 L101.4,83.0 L119.3,91.2 L137.2,97.8 L155.0,103.2 L172.9,107.7 L190.8,111.3 L208.6,114.3 L226.5,116.7 L244.3,118.7 L262.2,120.4 L280.1,121.7 L297.9,122.8 L315.8,123.7 L333.7,124.5 L351.5,125.1 L369.4,125.6 L387.2,126.0 L405.1,126.3 L423.0,126.6 L440.8,126.8 L458.7,127.0 L476.6,127.1 L494.4,127.2 L512.3,127.3 L530.1,127.4" fill="none" class="sb" stroke-width="2"/><line x1="30" y1="127.8" x2="548" y2="127.8" class="sg" stroke-width="1.2" stroke-dasharray="4 3"/><text x="539.1" y="120.7" text-anchor="end" font-size="11" class="tg">true long-run lift ≈ 1%</text><text x="83.6" y="38.2" text-anchor="start" font-size="11">week 1 average: +4.4% (novelty)</text><text x="24" y="146.0" text-anchor="end" font-size="10" class="tm">0%</text><text x="24" y="89.1" text-anchor="end" font-size="10" class="tm">4%</text><text x="24" y="32.2" text-anchor="end" font-size="10" class="tm">8%</text></svg><figcaption>Illustrative: daily lift of a shiny new feature. A one-week test would report +4.4%; the lasting effect is ~1%.</figcaption></figure>
  <p><strong>Novelty</strong>: users click the shiny new thing, then lose interest. <strong>Primacy</strong>: users resist change, then adapt (lift grows). Detect: plot lift by day, or compare new vs returning users. Fix: run longer, or analyse only after the curve flattens.</p>
  <h3>Network effects (interference)</h3>
  <div class="cards">
    <div><b>Problem</b><p>Treated users affect control users: shared drivers, chat, auctions.</p><small>Violates "units are independent" (SUTVA)</small></div>
    <div><b>Cluster randomisation</b><p>Randomise whole cities or friend clusters.</p><small>Fewer units → less power</small></div>
    <div><b>Switchback</b><p>Alternate the whole market between A and B over time slots.</p><small>Ride-sharing pricing, delivery dispatch</small></div>
  </div>
  <div class="callout intu"><span class="label">Example</span>
    <p>Uber gives treatment riders a discount; they book more drivers, so control riders wait longer and book less. The measured lift is inflated twice over.</p>
  </div>
  <h3>Multiple variants (A/B/n)</h3>
  <p>Testing 4 checkout designs vs control = 4 comparisons. Correct with Bonferroni (α/4 = 0.0125) or Dunnett's test, and size each arm for the corrected α (more traffic or longer runs).</p>

  <h2 id="sab-impact"><span class="num">07</span>Presenting Business Impact</h2>
  <div class="fx" data-lang="py">users_per_year = 2200 * 365
value_per_purchase = 60                       # $ average order margin, from finance
for name, lift in [("low (CI)", 0.0041), ("point", 0.0110), ("high (CI)", 0.0179)]:
    print(f"{name:9s} &#36;{lift * users_per_year * value_per_purchase:,.0f} / year")</div>
  <div class="fx" data-lang="text">low (CI)  $197,538 / year
point     $529,980 / year
high (CI) $862,422 / year</div>
  <div class="callout def"><span class="label">One-slide summary</span>
    <p><strong>What:</strong> one-page checkout vs three-step, 14 days, 30,780 users. <strong>Result:</strong> conversion 10.0% → 11.1% (+11% relative, p = 0.002, 95% CI +0.4 to +1.8 pp). <strong>Worth:</strong> ≈ $530k/yr (range $200k–$860k). <strong>Guardrails:</strong> latency, errors, refunds unchanged. <strong>Recommendation:</strong> ship to 100%, keep a 5% holdout for a month to confirm.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: winner's curse</span>
    <p>Experiments that "won" tend to overstate their lift (we noticed them because noise pushed them up). Quote the range, and use holdouts to confirm long-term impact.</p>
  </div>

  <h2 id="sab-qa"><span class="num">08</span>Case Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Walk me through designing an A/B test for a new recommendation widget.</summary><div class="qa-body">Hypothesis (widget raises items bought per user). Primary metric: purchases or revenue per user; secondary: widget CTR; guardrails: latency, page errors, overall engagement. Unit: user. Sample size from baseline, MDE, α 0.05, power 0.8; duration in full weeks. Launch 50/50, check SRM, don't peek, analyse with a t-test/z-test and CI, check guardrails and novelty, decide against the MDE.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your test shows p = 0.03 after 3 days of a planned 14. The PM wants to ship. What do you say?</summary><div class="qa-body">Not yet. Stopping at the first significant peek inflates the false-positive rate (our simulation: 5% → 22%). Three days also misses weekly patterns and novelty effects. Finish the planned 14 days, or switch to a sequential design next time if early stopping matters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Control has 50,000 users and treatment 48,500 in a 50/50 test. What now?</summary><div class="qa-body">SRM check: χ² p ≈ 2e-6, so the split is broken. Don't trust any metric. Look for causes: treatment crashes for some browsers, redirects losing users, bot filtering applied unevenly, logging differences. Fix and rerun.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The result is significant but the lift is 0.1% and the CI is [0.02%, 0.18%]. Ship?</summary><div class="qa-body">Statistically real, practically small. Compare against the MDE and costs: if the feature adds maintenance, complexity or risk, probably not. If it's a free config change, maybe. Significance isn't the decision; business value is.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you reduce the sample size you need?</summary><div class="qa-body">Lower variance: CUPED (adjust for each user's pre-experiment metric), stratification, trimming outliers. Use a more sensitive metric closer to the change. Accept a larger MDE. Avoid many arms. Bigger effect = smaller n (n ∝ 1/δ²).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Engagement jumped 8% in week 1 and is +1% in week 3. What's happening?</summary><div class="qa-body">Likely a novelty effect: curiosity wears off. Report the stabilised effect, check new vs returning users (new users have no novelty), and run longer if needed. The long-run lift (~1%) is what matters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you A/B test a new surge-pricing algorithm at a ride-sharing company?</summary><div class="qa-body">User-level randomisation fails: riders and drivers share a market, so treatment changes control's supply (interference). Use switchback testing (alternate the whole city between algorithms in random time blocks) or randomise by city/region and analyse at that level.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Conversion rose overall, but fell in both mobile and desktop. How?</summary><div class="qa-body">Simpson's paradox: the treatment's traffic mix shifted towards the higher-converting segment (e.g. more desktop users). Check SRM within segments; the mix shift may itself indicate a bug, since randomisation should balance segments.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You track 20 metrics and one guardrail is "significantly" worse at p = 0.04. Panic?</summary><div class="qa-body">With 20 metrics, about one false alarm is expected at α 0.05. Check its size and plausibility, apply an FDR correction, and look for a mechanism. If it's a critical guardrail (payments), rerun or investigate before shipping.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should you NOT run an A/B test?</summary><div class="qa-body">Too little traffic for any useful MDE; changes that can't be hidden from control (brand redesign, pricing PR); ethical or legal issues; one-off decisions where the cost of being wrong is tiny. Alternatives: qualitative research, diff-in-diff, before/after with caution.</div></details>
</main>`
});
