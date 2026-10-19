// notes/mathstats/st_abtesting.js — A/B Testing
Object.assign(TOPIC_CONTENT, {
  "st_abtesting": `<main>
  <h1>A/B Testing</h1>
  <div class="where"><span>Mathematics &amp; Statistics</span><span>Statistics</span><span>A/B Testing</span></div>
  <p class="lead">An A/B test is how tech companies decide what to ship: split users at random, show one group the change, and measure the difference. It is <a class="xref" data-note="st_hypothesis">hypothesis testing</a> plus real-world mess: picking the metric, sizing the test, broken splits, people peeking early, novelty and users who affect each other. This note follows the same one-page checkout as the Hypothesis Testing note, from its small pilots to a full experiment and a business decision, works each formula by hand, and checks it in Python. It is the most common data-science case-interview topic.</p>

  <h2 id="sab-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 110" width="680"><defs><marker id="sab-trk" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs><rect x="10.0" y="20" width="100" height="56" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="60.0" y="42" text-anchor="middle" font-size="11">Descriptive</text><text x="60.0" y="58" text-anchor="middle" class="tm" font-size="9.5">summarise one column</text><line x1="110.0" y1="48" x2="120.0" y2="48" stroke="currentColor" marker-end="url(#sab-trk)"/><rect x="122.0" y="20" width="100" height="56" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="172.0" y="42" text-anchor="middle" font-size="11">Probability</text><text x="172.0" y="58" text-anchor="middle" class="tm" font-size="9.5">quantify uncertainty</text><line x1="222.0" y1="48" x2="232.0" y2="48" stroke="currentColor" marker-end="url(#sab-trk)"/><rect x="234.0" y="20" width="100" height="56" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="284.0" y="42" text-anchor="middle" font-size="11">Distributions</text><text x="284.0" y="58" text-anchor="middle" class="tm" font-size="9.5">named shapes of chance</text><line x1="334.0" y1="48" x2="344.0" y2="48" stroke="currentColor" marker-end="url(#sab-trk)"/><rect x="346.0" y="20" width="100" height="56" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="396.0" y="42" text-anchor="middle" font-size="11">Correlation</text><text x="396.0" y="58" text-anchor="middle" class="tm" font-size="9.5">two columns together</text><line x1="446.0" y1="48" x2="456.0" y2="48" stroke="currentColor" marker-end="url(#sab-trk)"/><rect x="458.0" y="20" width="100" height="56" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="508.0" y="42" text-anchor="middle" font-size="11">Hypothesis Testing</text><text x="508.0" y="58" text-anchor="middle" class="tm" font-size="9.5">real or luck?</text><line x1="558.0" y1="48" x2="568.0" y2="48" stroke="currentColor" marker-end="url(#sab-trk)"/><rect x="570.0" y="20" width="100" height="56" rx="8" class="fg sg" stroke-width="3"/><text x="620.0" y="42" text-anchor="middle" font-size="11.5" font-weight="700">A/B Testing</text><text x="620.0" y="58" text-anchor="middle" class="tm" font-size="9.5">decide with an experiment</text><text x="620.0" y="96" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text></svg><figcaption>The Statistics track, in reading order. Each note answers a question the previous one left open.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="st_hypothesis">Hypothesis Testing</a></b><span>We built the recipe (H₀, statistic, null distribution, p-value, α, CI, power) and a family of tests. The checkout pilots ended with a problem: conversion 13% vs 10% gave p = 0.036, but the CI was +0.2 to +5.8 pp and the pilot had only 11% power for a realistic +1 pp lift. And from <a class="xref" data-note="st_correlation">Correlation</a>: observational data cannot prove cause, because confounders hide everywhere.</span></li>
    <li><b>This note adds: the full experiment, run in production</b><span>Random assignment (which kills confounders), a pre-registered hypothesis, the right metric and unit, a sample size from the power formula, variance reduction (CUPED), sanity checks (SRM), the z-test and CI on real numbers, practical significance, the four classic threats (peeking, novelty, interference, many variants) and the business-impact story.</span></li>
    <li><b>Leads to: Machine Learning</b><span>An A/B test answers one decision at a time with a lot of traffic. Predicting outcomes for every user calls for models, starting at <a class="xref" data-note="ml_intro">What is Machine Learning</a>; comparing models offline uses the metrics in <a class="xref" data-note="ml_evaluation">Classification Metrics</a>, and online A/B tests return in <a class="xref" data-note="ml_rs_ranking">Ranking, Evaluation &amp; Cold Start</a>.</span></li>
  </ol>

  <h2 id="sab-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. All numbers come from the one-page checkout experiment.</p>
  <ol class="story">
    <li><b>Randomised experiment</b><span>Q: sales rose 8% the week the new checkout launched; did the checkout cause it? → A before/after can't tell (payday, a festival, a competitor outage); run both pages at the same time and let a coin flip pick each user's page. But what exactly are we claiming?</span></li>
    <li><b>Hypothesis &amp; pre-registration</b><span>Q: what is the testable claim? → "Conversion 10% → at least 11% (MDE 1 pp); H₀ no difference; α 0.05, power 0.8", written down before launch. But measured how, and who gets the coin flip?</span></li>
    <li><b>Metrics &amp; randomisation unit</b><span>Q: which number decides, and what is randomised? → One primary metric (purchase conversion per user), guardrails, and the user as unit via md5(experiment:user) % 100. But how many users?</span></li>
    <li><b>Sample size &amp; duration</b><span>Q: how many users and days? → 14,745 per arm from the power formula; 13.4 days → 14 (full weeks). But two weeks of traffic is expensive…</span></li>
    <li><b>CUPED</b><span>Q: can we need fewer users? → Subtract what each user's pre-test behaviour predicts: variance × (1 − ρ²) = 0.22. The data is in; but did the experiment itself work?</span></li>
    <li><b>Sample ratio mismatch (SRM)</b><span>Q: is the split as planned? → χ² on user counts: 15,400 / 15,380, p = 0.91, fine; 15,400 / 14,700 would be p = 0.00005, a bug. Now: is the lift real?</span></li>
    <li><b>z-test, CI, guardrails</b><span>Q: real or luck, and how big? → 11.10% vs 10.00%, z = 3.14, p = 0.0017, CI +0.41 to +1.79 pp; guardrails flat. But significant is not the same as worth shipping…</span></li>
    <li><b>Practical significance</b><span>Q: is it big enough to act on? → Compare the CI with 0 and with the MDE: centre 1.1 ≥ 1 → ship. But all of this assumed we looked at the result only once…</span></li>
    <li><b>Peeking</b><span>Q: what if we check every day and stop at p &lt; 0.05? → False positives rise from 5% to 21.6%. And we assumed behaviour is stable over time…</span></li>
    <li><b>Novelty &amp; primacy</b><span>Q: does the lift last? → Early lifts fade (novelty) or grow (primacy); plot lift by day. And we assumed users don't affect each other…</span></li>
    <li><b>Interference</b><span>Q: what if treated users change control users' outcomes? → Randomise clusters or time slots (switchback). And we assumed one comparison…</span></li>
    <li><b>Multiple variants</b><span>Q: four new designs at once? → P(≥ 1 false alarm) = 18.5%; use α/4, which needs 20,948 users per arm. Finally: how do we tell leadership?</span></li>
    <li><b>Business impact</b><span>Q: what is it worth? → lift × users × value: ≈ $530k a year, range $198k–$862k from the CI ends.</span></li>
  </ol>

  <h2 id="sab-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">A/B Testing</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Lifecycle</div>
        <ul>
          <li><b>Flow</b> — hypothesis → metrics → unit → sample size → run → checks → analyse → decide</li>
          <li><b>Why random</b> — breaks every confounder, measured or not</li>
          <li><b>Hypothesis</b> — "Change X will raise metric Y by ≥ Z because …"</li>
          <li><b>Pre-register</b> — metric, MDE, duration, test fixed before launch</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Metrics &amp; Unit</div>
        <ul>
          <li><b>Primary (OEC)</b> — one decision metric; sensitive and tied to value</li>
          <li><b>Secondary</b> — explain the why · <b>Guardrails</b> — must not get worse</li>
          <li><b>Unit</b> — user; <code>md5(exp:user) % 100 &lt; 50</code> → sticky, even split</li>
          <li>⚠ randomise users, analyse clicks → SE too small</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Size, Duration, CUPED</div>
        <ul>
          <li><code>(1.96 + 0.84)² · [p₁(1−p₁) + p₂(1−p₂)] / δ²</code> = 14,749 for 10% → 11%</li>
          <li><b>Rule of thumb</b> — <code>16·p(1−p)/δ²</code> = 14,400 per arm</li>
          <li><b>MDE halves → n ×4</b> — 0.5 pp needs 57,756</li>
          <li><b>Duration</b> — 29,490 / 2,200 a day = 13.4 → 14 days</li>
          <li><b>CUPED</b> — Y − θ(X − X̄); variance × (1 − ρ²) = 0.22</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Analysis &amp; Decision</div>
        <ul>
          <li><b>SRM first</b> — χ² on user counts: p 0.91 ok; p &lt; 0.001 stop</li>
          <li><b>z-test</b> — pooled 0.1055, SE 0.0035, z 3.14, p 0.0017</li>
          <li><b>CI</b> — +0.41 to +1.79 pp (unpooled SE)</li>
          <li><b>Decide</b> — CI vs 0 and vs MDE: ship / tiny / inconclusive / null / kill</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Validity Threats</div>
        <ul>
          <li><b>Peeking</b> — daily looks: false positives 5% → 21.6%; sequential tests</li>
          <li><b>Novelty / primacy</b> — plot lift by day; new vs returning users</li>
          <li><b>Interference</b> — cluster or switchback designs (SUTVA)</li>
          <li><b>Many variants</b> — 4 arms: 18.5% → α/4; 20,948 per arm</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Business Impact</div>
        <ul>
          <li><b>Formula</b> — lift × users/yr × value per conversion</li>
          <li><b>Range</b> — CI ends: $198k–$862k, point $530k</li>
          <li><b>Story</b> — what changed, how sure, worth it, risks, recommendation</li>
          <li>⚠ winner's curse — keep a holdout</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sab-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="sab-flow"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Randomise</span><span class="rm-sub">Before/after vs a coin flip</span></div></div>
      <div class="rm-item rm-done" data-target="sab-hyp"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Hypothesis &amp; Lifecycle</span><span class="rm-sub">Decide before data</span></div></div>
      <div class="rm-item rm-done" data-target="sab-metrics"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Metrics &amp; Unit</span><span class="rm-sub">OEC, guardrails, hashing users</span></div></div>
      <div class="rm-item rm-done" data-target="sab-size"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Sample Size &amp; Duration</span><span class="rm-sub">Power by hand</span></div></div>
      <div class="rm-item rm-done" data-target="sab-cuped"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">CUPED</span><span class="rm-sub">Needing fewer users</span></div></div>
      <div class="rm-item rm-done" data-target="sab-srm"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">SRM Check</span><span class="rm-sub">Did the split work?</span></div></div>
      <div class="rm-item rm-done" data-target="sab-analysis"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">z-test &amp; CI</span><span class="rm-sub">The result, by hand</span></div></div>
      <div class="rm-item rm-done" data-target="sab-practical"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Practical Significance</span><span class="rm-sub">Ship, kill or extend</span></div></div>
      <div class="rm-item rm-done" data-target="sab-peek"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Peeking</span><span class="rm-sub">5% becomes 21.6%</span></div></div>
      <div class="rm-item rm-done" data-target="sab-novelty"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Novelty &amp; Primacy</span><span class="rm-sub">Lifts that change over time</span></div></div>
      <div class="rm-item rm-done" data-target="sab-network"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Interference</span><span class="rm-sub">When users affect each other</span></div></div>
      <div class="rm-item rm-done" data-target="sab-variants"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Multiple Variants</span><span class="rm-sub">A/B/n corrections</span></div></div>
      <div class="rm-item rm-done" data-target="sab-impact"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Business Impact</span><span class="rm-sub">Presenting the result</span></div></div>
      <div class="rm-item rm-done" data-target="sab-connect"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">Design, analysis, threats</span></div></div>
      <div class="rm-item rm-done" data-target="sab-traps"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Quick checklist</span></div></div>
      <div class="rm-item rm-done" data-target="sab-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="sab-qa"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">Case Questions</span><span class="rm-sub">Interview-style Q&amp;A</span></div></div>
    </div>
  </div>

  <h2 id="sab-flow"><span class="num">01</span>Why Randomise: Before/After vs a Coin Flip</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The pilots in the Hypothesis Testing note were small and hand-picked. If we simply launch the one-page checkout and compare this week with last week, can we credit any change to the checkout?</p>
  </div>
  <h3>The running example: the one-page checkout, at full scale</h3>
  <p>The shop from the Hypothesis Testing note now tests its <strong>one-page checkout</strong> (treatment, "B") against the current three-step checkout (control, "A") on real traffic: about 2,200 checkout visitors a day, baseline conversion 10%. Every section uses this experiment.</p>
  <p>Suppose instead the shop launched the new checkout on Monday and by Friday sales were up 8%. The team celebrates. But Friday was also payday, a festival sale started, and a competitor's site was down. Was it the checkout? Nobody can tell. A before/after comparison mixes your change with everything else that changed at the same time: every one of those is a <strong>confounder</strong> (Correlation note).</p>
  <p>The idea of an A/B test: run both versions <strong>at the same time</strong>, and let a coin flip decide which version each user sees. Payday, festivals and competitors then hit both groups equally. The only systematic difference left between the groups is your change, so any gap bigger than luck must come from it.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A clinical trial for a new medicine. Patients are randomly given the medicine or a sugar pill, at the same hospital, in the same season. Random assignment makes the groups alike on average in age, diet and luck, so a difference in recovery can be credited to the medicine.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>A/B test</strong> (online controlled experiment): users are randomly assigned to control or treatment at the same time, and a pre-chosen metric is compared. Randomisation makes the arms alike on every variable, measured or not, so the difference estimates the <em>causal</em> effect of the change.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"We'll compare users who chose the new checkout with those who didn't" is not an A/B test: users who opt in differ (more engaged, newer phones). Only <em>assignment</em> by a coin flip removes confounders.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Hypothesis &amp; lifecycle.</b> A coin flip makes the comparison fair, but fair comparison of <em>what</em>? Before any data arrives, we must state the claim, the size that matters and the test, or we will end up fishing.</div>

  <h2 id="sab-hyp"><span class="num">02</span>Hypothesis &amp; the Experiment Lifecycle</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>What exactly will we test, how big an effect do we care about, and what will we decide in each case, all before the experiment starts?</p>
  </div>
  <p>Every serious experiment follows the same steps, and most are decided <em>before</em> any data arrives.</p>
  <div class="flow"><span>Hypothesis</span><span>Metrics + guardrails</span><span>Randomisation unit</span><span>Sample size</span><span>Run full weeks</span><span>Sanity checks (SRM)</span><span>Analyse</span><span>Decide &amp; communicate</span></div>
  <table class="tbl">
    <tr><th>Step</th><th>Our checkout test</th><th>Section</th></tr>
    <tr><td>Hypothesis</td><td>Fewer steps → fewer drop-offs → conversion 10% → at least 11%</td><td>02</td></tr>
    <tr><td>Metrics</td><td>Primary: purchase conversion per user. Guardrails: latency, payment errors, refunds</td><td>03</td></tr>
    <tr><td>Unit</td><td>User (hash of user_id)</td><td>03</td></tr>
    <tr><td>Size &amp; time</td><td>14,745 users per arm, 14 days (fewer with CUPED)</td><td>04–05</td></tr>
    <tr><td>Checks &amp; analysis</td><td>SRM, two-proportion z-test, CI for the difference</td><td>06–07</td></tr>
    <tr><td>Decision</td><td>Compare CI with the minimum lift worth shipping</td><td>08</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Placing a bet at a cricket match: you name the team and the margin before the first ball. Naming them after the match is not a prediction, it is a story.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Hypothesis</strong>: "Removing two checkout steps will raise purchase conversion from 10% to at least 11%, because fewer steps mean fewer drop-offs." H₀: no difference. Two-sided, α = 0.05, power 0.8. <strong>MDE</strong> (minimum detectable effect): the smallest lift worth detecting, here +1 percentage point (pp). <strong>Pre-registration</strong>: writing all of this down before launch.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Fix the metric, MDE, duration and analysis <em>before</em> launch, and write them down. Choosing them after seeing data ("conversion didn't move, but look at time-on-page!") turns the test into a fishing trip, and something will always look significant (the multiple-testing problem).</p>
  </div>
  <p>Where you meet it: product teams at Flipkart, Swiggy, Netflix and Google run thousands of these a year. In interviews, "design an experiment for feature X" is a standard case question; walking through these eight steps in order is most of the answer.</p>
  <div class="bridge"><b>What this still can't tell us → next: Metrics &amp; unit.</b> "Conversion" sounds obvious, but conversion of what: page views, sessions, users? And how does a backend flip a coin for millions of users consistently?</div>

  <h2 id="sab-metrics"><span class="num">03</span>Metrics &amp; Randomisation Unit</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which single number decides the test, which numbers must not get worse, and what thing (user, session, city) gets the coin flip?</p>
  </div>
  <p>A test can only answer the question you measure. Pick "clicks" and a clickbait headline wins, even while users get annoyed and leave. Pick "annual revenue" and nothing moves within two weeks. And if you assign the coin flip to the wrong thing (each page view instead of each person), the same person sees both checkouts and the maths quietly breaks.</p>
  <p>The idea: choose <strong>one</strong> primary metric that is close to real value and moves within weeks; add a few metrics that explain <em>why</em>; and add "guardrails" that must not get worse. Then choose the unit that gets the coin flip, usually the user.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket team trying a new batting order judges it by runs scored (primary). It also watches strike rate (secondary, the why) and makes sure wickets lost don't shoot up (guardrail). Judging only by boundaries hit would reward reckless shots.</p>
  </div>
  <div class="cards">
    <div><b>Primary (OEC)</b><p>The one metric that decides. Sensitive, moves within weeks, tied to value.</p><small>Purchase conversion per user</small></div>
    <div><b>Secondary</b><p>Explain <em>why</em> the primary moved.</p><small>Step drop-off, time to purchase</small></div>
    <div><b>Guardrails</b><p>Must not get worse, even if the primary wins.</p><small>Page latency, payment errors, refund rate, AOV</small></div>
  </div>
  <table class="tbl">
    <tr><th>Unit</th><th>Pros</th><th>Cons</th><th>Use for</th></tr>
    <tr><td><strong>User</strong> (hash of user_id)</td><td>Consistent experience; independent units</td><td>Needs login or stable cookie</td><td>Most product tests (our checkout)</td></tr>
    <tr><td><strong>Session / page view</strong></td><td>More samples, faster</td><td>Same person sees both versions</td><td>Invisible changes: ranking, latency</td></tr>
    <tr><td><strong>Cluster</strong> (city, school)</td><td>Contains interference</td><td>Few units → low power</td><td>Marketplaces, social features</td></tr>
  </table>
  <h3>How the coin flip is done in a backend</h3>
  <p>You cannot store a random coin flip per user in every service. Instead, hash the user id with the experiment name, turn the hash into a number 0 to 99, and send 0 to 49 to treatment. Steps for user "u1": key = "checkout_v2:u1" → md5 → a huge hex number → mod 100 → bucket. Same input always gives the same bucket, so the user is "sticky". The code builds this, splits 10,000 users, and checks the split is even.</p>
  <div class="fx" data-lang="py">import hashlib
import numpy as np
from scipy import stats

def bucket(user_id, experiment="checkout_v2"):
    key = f"{experiment}:{user_id}".encode()
    return int(hashlib.md5(key).hexdigest(), 16) % 100        # 0..99, same every time

def arm(user_id):
    return "treatment" if bucket(user_id) &lt; 50 else "control"

print([arm(u) for u in ["u1", "u2", "u3"]], arm("u1") == arm("u1"))
counts = {"control": 0, "treatment": 0}
for i in range(10000):
    counts[arm(f"user{i}")] += 1
print(counts, " SRM p =", round(stats.chisquare(list(counts.values())).pvalue, 3))
print("other experiment, same user:", bucket("u1"), bucket("u1", "search_rank"))</div>
  <div class="fx" data-lang="text">['control', 'treatment', 'control'] True
{'control': 5021, 'treatment': 4979}  SRM p = 0.674
other experiment, same user: 64 38</div>
  <p><code>hashlib.md5(...).hexdigest()</code> turns the key into a fixed hex string; <code>int(..., 16) % 100</code> maps it to a bucket. Calling <code>arm("u1")</code> twice gives the same answer (True). 10,000 users split 5,021 / 4,979, and the chi-square check (section 06) says that is normal luck. Putting the experiment name in the key matters: user u1 is bucket 64 in one test and 38 in another, so experiments don't all hit the same users.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>OEC</strong> (overall evaluation criterion): the primary metric that decides. <strong>Guardrail metric</strong>: a metric that must not degrade. <strong>Randomisation unit</strong>: the thing assigned to an arm (user, session, city). <strong>Analysis unit</strong>: the thing each data row describes.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Randomise by user but analyse per page view, and views from one user are correlated (a keen user makes many). The SE comes out too small and false positives soar: the independence assumption behind the test's null distribution is broken. Analyse at the randomisation unit (one row per user), or use the delta method for ratio metrics like clicks per view.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Sample size &amp; duration.</b> We know what to measure and how to split. The pilot with 1,000 users per page had only 11% power for +1 pp. How many users do we need, and how many days is that?</div>

  <h2 id="sab-size"><span class="num">04</span>Sample Size &amp; Run Duration</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How many users per arm give an 80% chance of detecting a true +1 pp lift at α = 0.05, and how long must the test run to collect them?</p>
  </div>
  <p>Run the checkout test on 500 users and a real +1 pp lift will drown in noise: the test will usually say "not significant", and a good idea gets killed. Run it on 5 million and you waste weeks of traffic that other experiments needed. You must decide the size in advance, from four inputs: baseline rate, MDE, α, power.</p>
  <p>The idea: the smaller the effect you want to catch, the more users you need, and it grows fast. Halving the effect needs <strong>four times</strong> the users, because noise in an average shrinks only with √n.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Listening for a friend's voice in a noisy railway station. A shout is heard at once; a whisper needs you to listen much longer (or move closer) before you are sure it was your name. The MDE is how loud the voice is; the sample size is how long you listen.</p>
  </div>
  <h3>The formula by hand</h3>
  <p>Per arm, for two proportions (from the power section of the Hypothesis Testing note): <code>n = (z₁₋α/₂ + z₁₋β)² · [p₁(1−p₁) + p₂(1−p₂)] / δ²</code>, where δ = p₂ − p₁.</p>
  <ol>
    <li>α = 0.05 two-sided → z₁₋α/₂ = 1.96. Power 0.8 → z₁₋β = 0.84. (1.96 + 0.84)² = 7.85.</li>
    <li>Noise part: 0.10 × 0.90 + 0.11 × 0.89 = 0.090 + 0.0979 = 0.1879.</li>
    <li>Effect part: δ² = 0.01² = 0.0001.</li>
    <li>n = 7.85 × 0.1879 / 0.0001 ≈ <strong>14,749</strong> per arm.</li>
    <li>Shortcut: with α 0.05 and power 0.8, 7.85 × 2 ≈ 16, so n ≈ 16·p(1−p)/δ² = 16 × 0.09 / 0.0001 = 14,400.</li>
  </ol>
  <p>The code repeats the hand calculation, then uses <code>statsmodels</code> (which uses a slightly different scale, "Cohen's h") and loops over three MDEs. Finally it turns users into days.</p>
  <div class="fx" data-lang="py">z_a, z_b = stats.norm.ppf(0.975), stats.norm.ppf(0.80)
p1, p2 = 0.10, 0.11
n = (z_a + z_b)**2 * (p1*(1-p1) + p2*(1-p2)) / (p2 - p1)**2
print(f"z_alpha/2={z_a:.3f} z_beta={z_b:.3f} (sum)^2={(z_a+z_b)**2:.2f}")
print(f"variance part={p1*(1-p1) + p2*(1-p2):.4f}  n per arm={np.ceil(n):,.0f}")
print(f"rule of thumb 16*p(1-p)/d^2 = {16*0.1*0.9/0.01**2:,.0f}")

from statsmodels.stats.power import NormalIndPower
from statsmodels.stats.proportion import proportion_effectsize
baseline, target = 0.10, 0.11                      # MDE = +1 pp (10% relative)
h = proportion_effectsize(target, baseline)        # Cohen's h for proportions
n = NormalIndPower().solve_power(effect_size=h, alpha=0.05, power=0.8)
print(f"per arm: {np.ceil(n):,.0f}   total: {2*np.ceil(n):,.0f}")
for mde in [0.005, 0.01, 0.02]:
    h = proportion_effectsize(baseline + mde, baseline)
    print(f"MDE {mde*100:.1f} pp -&gt; {np.ceil(NormalIndPower().solve_power(h, alpha=0.05, power=0.8)):,.0f} per arm")
daily_users = 2200                                  # eligible checkout visitors/day
days = 2 * 14745 / daily_users
print(f"{days:.1f} days -&gt; run {int(np.ceil(days / 7) * 7)} days (full weeks)")</div>
  <div class="fx" data-lang="text">z_alpha/2=1.960 z_beta=0.842 (sum)^2=7.85
variance part=0.1879  n per arm=14,749
rule of thumb 16*p(1-p)/d^2 = 14,400
per arm: 14,745   total: 29,490
MDE 0.5 pp -&gt; 57,756 per arm
MDE 1.0 pp -&gt; 14,745 per arm
MDE 2.0 pp -&gt; 3,835 per arm
13.4 days -&gt; run 14 days (full weeks)</div>
  <p><code>stats.norm.ppf</code> turns a probability into a z value (0.975 → 1.96). The hand formula gives 14,749; statsmodels gives 14,745. Same answer. The loop shows the square law: 2 pp needs 3,835, 1 pp needs 14,745 (about 4×), 0.5 pp needs 57,756 (4× again). With 2,200 checkout visitors a day, 29,490 users take 13.4 days, rounded up to 14 so every weekday appears twice.</p>
  <figure class="viz"><svg viewBox="0 0 560 190" width="560"><line x1="40" y1="162" x2="546" y2="162" stroke="currentColor" stroke-opacity=".5"/><text x="121.6" y="177" text-anchor="middle" font-size="11">0.5</text><text x="203.2" y="177" text-anchor="middle" font-size="11">1.0</text><text x="284.8" y="177" text-anchor="middle" font-size="11">1.5</text><text x="366.5" y="177" text-anchor="middle" font-size="11">2.0</text><text x="448.1" y="177" text-anchor="middle" font-size="11">2.5</text><text x="529.7" y="177" text-anchor="middle" font-size="11">3.0</text><text x="546" y="157" text-anchor="end" font-size="11" class="tm">MDE (pp)</text><path d="M105.3,18.2 L116.2,56.1 L127.1,80.7 L137.9,97.6 L148.8,109.7 L159.7,118.6 L170.6,125.4 L181.5,130.8 L192.3,135.0 L203.2,138.4 L214.1,141.2 L225.0,143.5 L235.9,145.5 L246.8,147.1 L257.6,148.5 L268.5,149.8 L279.4,150.8 L290.3,151.7 L301.2,152.6 L312.0,153.3 L322.9,153.9 L333.8,154.5 L344.7,155.0 L355.6,155.5 L366.5,155.9 L377.3,156.2 L388.2,156.6 L399.1,156.9 L410.0,157.2 L420.9,157.4 L431.7,157.7 L442.6,157.9 L453.5,158.1 L464.4,158.3 L475.3,158.5 L486.2,158.6 L497.0,158.8 L507.9,158.9 L518.8,159.0 L529.7,159.2" fill="none" class="sb" stroke-width="2"/><text x="34" y="166.0" text-anchor="end" font-size="10" class="tm">0k</text><text x="34" y="134.0" text-anchor="end" font-size="10" class="tm">20k</text><text x="34" y="102.0" text-anchor="end" font-size="10" class="tm">40k</text><text x="34" y="70.0" text-anchor="end" font-size="10" class="tm">60k</text><text x="34" y="38.0" text-anchor="end" font-size="10" class="tm">80k</text><path d="M121.6,69.6h0M203.2,138.4h0M366.5,155.9h0" class="sr" stroke-width="7.0" stroke-linecap="round"/><text x="134.7" y="69.6" text-anchor="start" font-size="10">57.8k</text><text x="216.3" y="134.8" text-anchor="start" font-size="10">14.7k (our test)</text><text x="374.6" y="150.8" text-anchor="start" font-size="10">3.8k</text></svg><figcaption>Users per arm vs the smallest lift you want to detect (baseline 10%). Halving the MDE quadruples the sample.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Power analysis</strong>: choosing n so that a real effect of size MDE is detected with probability 1 − β. Inputs: baseline rate, MDE, α, power. n ∝ (noise)/δ².</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Run whole weeks. Weekend shoppers behave differently from weekday shoppers; stopping on a Thursday over-represents some days. Run at least one, ideally two, full weekly cycles even if the sample size is reached earlier.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: CUPED.</b> 14 days of all checkout traffic is a lot to spend on one question. n is proportional to the noise in the metric. Can we remove some noise we already know about?</div>

  <h2 id="sab-cuped"><span class="num">05</span>Needing Fewer Users: CUPED</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Much of the spread in spend per user is just "some users always spend more". We know that from before the test. Can we subtract it and detect the same lift with less data?</p>
  </div>
  <p>Users differ hugely in spend: some spend ₹200 a month, some ₹5,000. That spread is noise that hides your effect. But you already know how much each user spent <em>before</em> the test. CUPED (controlled-experiment using pre-experiment data) subtracts the part of each user's metric that their past predicts: <code>Y_adj = Y − θ(X − X̄)</code>, with θ = cov(X, Y)/var(X), the regression slope from the Correlation note. Variance shrinks by a factor of (1 − ρ²), where ρ is the correlation between before and after.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Judging a coaching class by students' final marks is noisy because some students were always toppers. Judging by "final mark minus what their mock predicted" removes that, and the class's real effect stands out.</p>
  </div>
  <h3>By hand, then simulated</h3>
  <p>If before and after spend correlate at ρ = 0.88, the adjusted variance is (1 − 0.88²) = 1 − 0.774 = 0.226 of the original. Since n ∝ variance, the same test needs only about 23% of the users it would otherwise need. The simulation below has 20,000 users and a true lift of ₹15.</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(3)
n_users = 20000
pre = rng.gamma(2, 250, n_users)                      # spend in the 4 weeks BEFORE the test (Rs)
arm = rng.integers(0, 2, n_users)                     # 0 = control, 1 = treatment
post = 0.8 * pre + rng.normal(100, 150, n_users) + 15 * arm   # true lift = Rs 15
theta = np.cov(pre, post)[0, 1] / np.var(pre, ddof=1)
adj = post - theta * (pre - pre.mean())               # CUPED-adjusted metric
rho = np.corrcoef(pre, post)[0, 1]
print(f"corr(pre, post)={rho:.2f}  theta={theta:.2f}")
print(f"variance: raw={post.var():,.0f}  cuped={adj.var():,.0f}  ratio={adj.var()/post.var():.2f}  (1-rho^2={1-rho**2:.2f})")
for name, y in [("raw  ", post), ("cuped", adj)]:
    r = stats.ttest_ind(y[arm == 1], y[arm == 0], equal_var=False)
    ci = r.confidence_interval()
    print(f"{name} lift={y[arm == 1].mean() - y[arm == 0].mean():6.1f}  95% CI [{ci.low:6.1f}, {ci.high:6.1f}]  p={r.pvalue:.2g}")</div>
  <div class="fx" data-lang="text">corr(pre, post)=0.88  theta=0.80
variance: raw=103,538  cuped=22,772  ratio=0.22  (1-rho^2=0.22)
raw   lift=   8.0  95% CI [  -0.9,   17.0]  p=0.077
cuped lift=  14.8  95% CI [  10.7,   19.0]  p=3.5e-12</div>
  <p>Variance drops to 22% of the original, exactly 1 − 0.88². The raw t-test misses the ₹15 lift (CI −0.9 to 17.0, p = 0.077). The adjusted metric finds it clearly (CI 10.7 to 19.0). Same users, same days, about 4.5× less noise: equivalent to running the test on 4.5× more users. Because <code>pre</code> was measured before assignment, the adjustment cannot create a fake effect.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>CUPED</strong>: variance reduction using a pre-experiment covariate X: Y_adj = Y − θ(X − X̄), θ = cov(X, Y)/var(X). Var(Y_adj) = Var(Y)(1 − ρ²). The treatment effect estimate stays unbiased because X is unaffected by assignment.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The covariate must be measured <em>before</em> assignment. Adjusting for something the treatment can change (in-test sessions, for example) can remove part of the real effect or invent one.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: SRM check.</b> The test has run its 14 days. Before reading the lift, one question: did the experiment itself work, with users split as planned?</div>

  <h2 id="sab-srm"><span class="num">06</span>Sanity Check: Sample Ratio Mismatch</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Control has 15,400 users and treatment 15,380 in a planned 50/50 split. Is that normal luck, or a sign that something broke the randomisation?</p>
  </div>
  <p>14 days later the data is in: control had 15,400 users and 1,540 purchases; treatment had 15,380 users and 1,707 purchases. The temptation is to compute the lift and announce it. But first you must check that the experiment itself worked, because a broken split makes every number after it meaningless.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Before reading an exam's results, the examiner checks that both halls got the same number of question papers. If one hall got 10% fewer, something went wrong in distribution, and comparing marks between halls is unfair no matter how good the marking was.</p>
  </div>
  <h3>By hand with chi-square</h3>
  <p>This is the goodness-of-fit χ² from the Distributions note. Expected = 30,780 / 2 = 15,390 per arm. χ² = (15,400 − 15,390)²/15,390 + (15,380 − 15,390)²/15,390 = 200 / 15,390 = 0.013 → p ≈ 0.91, fine. A broken split of 15,400 / 14,700: expected 15,050 each, χ² = 2 × 350² / 15,050 = 16.3 → p ≈ 0.00005.</p>
  <div class="fx" data-lang="py">print("ours  :", stats.chisquare([15400, 15380]).pvalue.round(4))
print("broken:", stats.chisquare([15400, 14700]).pvalue)</div>
  <div class="fx" data-lang="text">ours  : 0.9092
broken: 5.466443968511142e-05</div>
  <p><code>stats.chisquare</code> assumes equal expected counts unless told otherwise, which is exactly the 50/50 plan. Ours passes. For the broken split the rule is: <strong>stop, find the bug, don't read the results</strong>. Common causes: the new page crashes on old browsers so those users never log a visit, bot filtering hits one arm more, or a redirect loses users.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Sample ratio mismatch (SRM)</strong>: the user split differs from the planned ratio more than luck allows, tested with a χ² goodness-of-fit on the arm counts. Usual alarm threshold: p &lt; 0.001.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"The split is only 2% off, close enough" is how broken experiments ship. With 30,000 users a 2% imbalance is far beyond luck; the users that went missing are rarely random (they are often exactly the users the change affected).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: z-test &amp; CI.</b> The split is healthy. Now the main question: is 11.10% vs 10.00% a real lift, and how big might it truly be?</div>

  <h2 id="sab-analysis"><span class="num">07</span>The Result: z-test, CI and Guardrails</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Treatment 1,707 / 15,380, control 1,540 / 15,400. Real or luck, and what range of true lifts is consistent with the data?</p>
  </div>
  <p>This is the two-proportion z-test from the Hypothesis Testing note, on the full data. The pilot (1,000 per arm) gave a CI 5.6 pp wide; with 15× more users per arm the CI should be about √15 ≈ 4× narrower.</p>
  <h3>By hand</h3>
  <ol>
    <li>Rates: treatment 1,707/15,380 = 0.1110; control 1,540/15,400 = 0.1000. Difference = 0.0110 (1.1 pp; 11% relative).</li>
    <li>For the test, assume H₀ (no difference) and pool both groups: p̂ = 3,247 / 30,780 = 0.1055.</li>
    <li>SE under H₀ = √(p̂(1 − p̂)(1/15,380 + 1/15,400)) = √(0.0944 × 0.0001299) = 0.00350.</li>
    <li>z = 0.0110 / 0.00350 = 3.14. Two-sided p = 2 × P(Z &gt; 3.14) = 0.0017.</li>
    <li>For the CI, don't pool (we no longer assume H₀): SE = √(0.111 × 0.889/15,380 + 0.1 × 0.9/15,400) = 0.00350. CI = 0.0110 ± 1.96 × 0.00350 = [+0.0041, +0.0179].</li>
  </ol>
  <div class="fx" data-lang="py">pt, pc = 1707 / 15380, 1540 / 15400
pool = (1707 + 1540) / (15380 + 15400)
se_pool = np.sqrt(pool * (1 - pool) * (1/15380 + 1/15400))
se_unpool = np.sqrt(pt * (1 - pt) / 15380 + pc * (1 - pc) / 15400)
z = (pt - pc) / se_pool
print(f"pt={pt:.4f} pc={pc:.4f} diff={pt-pc:.4f} pooled={pool:.4f}")
print(f"se_pooled={se_pool:.5f}  z={z:.2f}  p={2*stats.norm.sf(z):.4f}")
print(f"se_unpooled={se_unpool:.5f}  CI=[{pt-pc-1.96*se_unpool:+.4f}, {pt-pc+1.96*se_unpool:+.4f}]")

from statsmodels.stats.proportion import proportions_ztest, confint_proportions_2indep
conv, users = np.array([1707, 1540]), np.array([15380, 15400])   # treatment, control
rates = conv / users
z, p = proportions_ztest(conv, users)
lo, hi = confint_proportions_2indep(conv[0], users[0], conv[1], users[1], compare="diff")
print(f"control {rates[1]:.2%}  treatment {rates[0]:.2%}")
print(f"abs lift {rates[0]-rates[1]:+.2%}  rel lift {rates[0]/rates[1]-1:+.1%}")
print(f"z={z:.2f}  p={p:.4f}  95% CI for diff: [{lo:+.2%}, {hi:+.2%}]")</div>
  <div class="fx" data-lang="text">pt=0.1110 pc=0.1000 diff=0.0110 pooled=0.1055
se_pooled=0.00350  z=3.14  p=0.0017
se_unpooled=0.00350  CI=[+0.0041, +0.0179]
control 10.00%  treatment 11.10%
abs lift +1.10%  rel lift +11.0%
z=3.14  p=0.0017  95% CI for diff: [+0.41%, +1.79%]</div>
  <p>The first block is the hand calculation in code; the second is the library way. <code>proportions_ztest</code> uses the pooled SE and agrees: z = 3.14, p = 0.0017. <code>confint_proportions_2indep(..., compare="diff")</code> gives the CI for treatment minus control: [+0.41, +1.79] pp, the same as our ±1.96 × SE, and 1.4 pp wide instead of the pilot's 5.6. In plain words: "if the new checkout did nothing, a gap this big would appear about 2 times in 1,000 tests; our best guess of the true lift is 1.1 pp, and the method we used puts it between 0.4 and 1.8 pp."</p>
  <h3>Guardrails</h3>
  <p>Run the same kind of test on each guardrail (latency with a Welch t-test, payment errors and refunds with z-tests), each with its CI. If none got meaningfully worse, move to the decision.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A new bowling plan that takes more wickets is only good if it doesn't also leak runs. The z-test checks the wickets; the guardrails check the runs.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Two-proportion z-test</strong>: z = (p̂_T − p̂_C) / SE, with the pooled SE under H₀. Valid when each arm has at least about 10 successes and 10 failures. For means (revenue per user), use Welch's t-test. <strong>Absolute lift</strong>: p_T − p_C (pp). <strong>Relative lift</strong>: p_T / p_C − 1 (%).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Mixing up absolute and relative lift. "+1.1%" might mean 10.0% → 11.1% (absolute, pp) or 10.0% → 10.11% (relative). Always say "percentage points" for absolute changes.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Practical significance.</b> p = 0.0017 says the lift is almost surely not zero. It does not say the lift is big enough to be worth the engineering, maintenance and risk.</div>

  <h2 id="sab-practical"><span class="num">08</span>Statistical vs Practical Significance</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Given the CI [+0.41, +1.79] pp and an MDE of 1 pp, do we ship? What would we do with other possible CIs?</p>
  </div>
  <p>"p &lt; 0.05" only says the effect is probably not zero. With millions of users, a 0.02 pp lift is "significant" but worth nothing. With few users, a valuable lift can be "not significant". The p-value alone cannot make the decision.</p>
  <p>The idea: look at the whole confidence interval and compare it with two lines. Zero answers "is there any effect?". The MDE (the smallest lift worth shipping, chosen in section 02) answers "is it worth it?".</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A new route to office saves time "for sure", but somewhere between 10 seconds and 40 seconds a day. It is a real saving, but not worth an extra toll. Another route saves between −5 and +25 minutes: you don't know yet; drive it a few more days before deciding.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 560 200" width="560"><line x1="150" y1="172" x2="546" y2="172" stroke="currentColor" stroke-opacity=".5"/><text x="150" y="187" text-anchor="middle" font-size="11">−2</text><text x="240" y="187" text-anchor="middle" font-size="11">−1</text><text x="330" y="187" text-anchor="middle" font-size="11">0</text><text x="420" y="187" text-anchor="middle" font-size="11">+1</text><text x="510" y="187" text-anchor="middle" font-size="11">+2</text><text x="546" y="167" text-anchor="end" font-size="11" class="tm">lift (pp)</text><line x1="330" y1="165.3" x2="330" y2="22.7" class="sr" stroke-width="1.2" stroke-dasharray="4 3"/><line x1="420" y1="165.3" x2="420" y2="22.7" class="sg" stroke-width="1.2" stroke-dasharray="4 3"/><text x="330" y="21.6" text-anchor="middle" font-size="10" class="tr">0</text><text x="420" y="21.6" text-anchor="middle" font-size="10" class="tg">MDE</text><line x1="384" y1="38.3" x2="492" y2="38.3" class="sg" stroke-width="3"/><path d="M438,38.3h0" class="sg" stroke-width="7.0" stroke-linecap="round"/><text x="142" y="42.3" text-anchor="end" font-size="11">A: ship</text><line x1="339" y1="60.6" x2="375" y2="60.6" class="sb" stroke-width="3"/><path d="M357,60.6h0" class="sb" stroke-width="7.0" stroke-linecap="round"/><text x="142" y="64.6" text-anchor="end" font-size="11">B: real but tiny</text><line x1="249" y1="82.9" x2="465" y2="82.9" class="sb" stroke-width="3"/><path d="M357,82.9h0" class="sb" stroke-width="7.0" stroke-linecap="round"/><text x="142" y="86.9" text-anchor="end" font-size="11">C: inconclusive</text><line x1="307.5" y1="105.1" x2="357" y2="105.1" class="sb" stroke-width="3"/><path d="M332.2,105.1h0" class="sb" stroke-width="7.0" stroke-linecap="round"/><text x="142" y="109.1" text-anchor="end" font-size="11">D: confident null</text><line x1="186" y1="127.4" x2="294" y2="127.4" class="sr" stroke-width="3"/><path d="M240,127.4h0" class="sr" stroke-width="7.0" stroke-linecap="round"/><text x="142" y="131.4" text-anchor="end" font-size="11">E: kill</text><line x1="366.9" y1="149.7" x2="491.1" y2="149.7" class="sg" stroke-width="3"/><path d="M429,149.7h0" class="sg" stroke-width="7.0" stroke-linecap="round"/><text x="142" y="153.7" text-anchor="end" font-size="11" font-weight="bold">ours</text></svg><figcaption>Each bar is a 95% CI for the lift. Judge it against 0 (is it real?) and against the MDE (is it worth it?).</figcaption></figure>
  <table class="tbl">
    <tr><th>CI for the lift</th><th>Decision</th></tr>
    <tr><td>Entirely above 0, centre at or above MDE</td><td><strong>Ship</strong></td></tr>
    <tr><td>Above 0 but entirely below MDE</td><td>Real but tiny: ship only if cheap and low risk</td></tr>
    <tr><td>Spans 0, wide</td><td>Inconclusive: underpowered. Don't call it "no effect"</td></tr>
    <tr><td>Spans 0, narrow around 0</td><td>Confident null: kill, move on</td></tr>
    <tr><td>Entirely below 0</td><td><strong>Kill</strong> and learn why</td></tr>
  </table>
  <p>The same table as a function, applied to the five example bars in the picture and to our result, with MDE = 1 pp.</p>
  <div class="fx" data-lang="py">def decide(lo, hi, mde):
    """lo, hi = 95% CI for the lift; mde = smallest lift worth shipping (same units)."""
    if hi &lt; 0:
        return "kill: it hurts"
    if lo &gt; 0:
        if (lo + hi) / 2 &gt;= mde:
            return "ship"
        if hi &lt; mde:
            return "real but tiny: ship only if cheap"
        return "real, size unclear: weigh cost"
    if -mde &lt; lo and hi &lt; mde:
        return "confident null: kill, move on"
    return "inconclusive: underpowered"

for name, lo, hi in [("A", 0.6, 1.8), ("B", 0.1, 0.5), ("C", -0.9, 1.5),
                     ("D", -0.25, 0.3), ("E", -1.6, -0.4), ("ours", 0.41, 1.79)]:
    print(f"{name:5s} CI [{lo:+.2f}, {hi:+.2f}] pp -&gt; {decide(lo, hi, mde=1.0)}")</div>
  <div class="fx" data-lang="text">A     CI [+0.60, +1.80] pp -&gt; ship
B     CI [+0.10, +0.50] pp -&gt; real but tiny: ship only if cheap
C     CI [-0.90, +1.50] pp -&gt; inconclusive: underpowered
D     CI [-0.25, +0.30] pp -&gt; confident null: kill, move on
E     CI [-1.60, -0.40] pp -&gt; kill: it hurts
ours  CI [+0.41, +1.79] pp -&gt; ship</div>
  <p>The order of the checks matters. "Entirely below 0" is tested first, then "entirely above 0", and only then the cases that span 0. C and D both include 0, but D is narrow (it rules out any lift as big as the MDE) while C is wide (it rules out nothing). Our CI [+0.41, +1.79] pp is above 0 and centred at 1.1, above the MDE. With guardrails clean, the call is ship.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Statistical significance</strong>: the data is unlikely under H₀ (p &lt; α). <strong>Practical significance</strong>: the effect is large enough to matter for the business. A good decision needs both, plus guardrails and cost.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Not significant, so the feature does nothing" is wrong for case C. Its CI still allows a +1.5 pp lift. Say "inconclusive", and either extend the test (if traffic allows) or accept the uncertainty knowingly.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Peeking.</b> Everything so far assumed a clean experiment analysed once, at the planned end. In reality a dashboard shows the p-value every day, and people act on it.</div>

  <h2 id="sab-peek"><span class="num">09</span>Peeking</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>On day 6 the live p-value dips to 0.017 and the PM wants to ship. If we check daily and stop at the first p &lt; 0.05, is our false-alarm rate still 5%?</p>
  </div>
  <p>The problem: p-values wander up and down by chance, even when there is no effect at all. Checking every day and stopping at the first dip gives noise 14 chances to cross 0.05: it is multiple testing (Hypothesis Testing note) in disguise.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Declaring a cricket match result the first moment your team is ahead. Look after every over and some team will be "winning" at some point, even if the final result is a draw. The scorecard only counts at the end of the match.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 560 180" width="560"><line x1="40" y1="152" x2="548" y2="152" stroke="currentColor" stroke-opacity=".5"/><text x="94.4" y="167" text-anchor="middle" font-size="11">d2</text><text x="167" y="167" text-anchor="middle" font-size="11">d4</text><text x="239.6" y="167" text-anchor="middle" font-size="11">d6</text><text x="312.1" y="167" text-anchor="middle" font-size="11">d8</text><text x="384.7" y="167" text-anchor="middle" font-size="11">d10</text><text x="457.3" y="167" text-anchor="middle" font-size="11">d12</text><text x="529.9" y="167" text-anchor="middle" font-size="11">d14</text><text x="34" y="149.1" text-anchor="end" font-size="10" class="tm">0.05</text><text x="34" y="87.0" text-anchor="end" font-size="10" class="tm">0.5</text><text x="34" y="18.0" text-anchor="end" font-size="10" class="tm">1.0</text><rect x="40.0" y="145.1" width="508.0" height="6.9" class="fr"/><path d="M58.1,69.5 L94.4,25.6 L130.7,121.2 L167.0,144.4 L203.3,138.5 L239.6,149.6 L275.9,125.3 L312.1,122.6 L348.4,105.2 L384.7,52.8 L421.0,82.4 L457.3,60.3 L493.6,48.4 L529.9,62.8" fill="none" class="sb" stroke-width="2"/><path d="M58.1,69.5h0M94.4,25.6h0M130.7,121.2h0M167,144.4h0M203.3,138.5h0M239.6,149.6h0M275.9,125.3h0M312.1,122.6h0M348.4,105.2h0M384.7,52.8h0M421,82.4h0M457.3,60.3h0M493.6,48.4h0M529.9,62.8h0" class="sb" stroke-width="6" stroke-linecap="round"/><text x="250.5" y="135.4" text-anchor="start" font-size="11" class="tr">day 6: p = 0.017 → 'ship!'</text><text x="540.7" y="20.9" text-anchor="end" font-size="11">day 14 (planned end): p = 0.65</text></svg><figcaption>One simulated A/A test (no real difference). Its daily p-value dips into the red zone (p &lt; 0.05), then wanders back. Stopping at the dip ships noise.</figcaption></figure>
  <p>The code runs 2,000 A/A tests (both arms identical, 10% conversion, 1,100 users per arm per day) for 14 days, and compares two rules: stop the first day p &lt; 0.05, or look only on day 14.</p>
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
  <p><code>rng.binomial(per_day, 0.10, days)</code> simulates daily purchases; <code>cumsum()</code> turns them into running totals, like a live dashboard. <code>min(ps) &lt; 0.05</code> asks "was p ever below 0.05?". Looking once gives the promised 5% false alarms; peeking daily gives 21.6%, more than four times as many.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Peeking</strong>: repeatedly testing an experiment while it runs and stopping when significant. <strong>Fixed-horizon test</strong>: analysed once at a pre-set n. <strong>Sequential testing</strong> (alpha-spending such as O'Brien-Fleming, or always-valid p-values): designs that allow interim looks while keeping the overall false-alarm rate at α. <strong>A/A test</strong>: both arms get the same experience; used to check the pipeline (it should show "significant" only about 5% of the time).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"We'll just peek but not act" rarely holds under business pressure. If stakeholders will want early answers, plan a sequential design from the start.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Novelty &amp; primacy.</b> Looking once at day 14 fixes peeking. But it still assumes the effect is the same on day 1 and day 100. Do users react to a new checkout the same way in its first week as later?</div>

  <h2 id="sab-novelty"><span class="num">10</span>Novelty &amp; Primacy Effects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>If the lift is +4% in week 1 and +1% in week 3, which one do we report, and how would we even notice?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 560 170" width="560"><line x1="30" y1="142" x2="548" y2="142" stroke="currentColor" stroke-opacity=".5"/><text x="47.9" y="157" text-anchor="middle" font-size="11">1</text><text x="155" y="157" text-anchor="middle" font-size="11">7</text><text x="280.1" y="157" text-anchor="middle" font-size="11">14</text><text x="405.1" y="157" text-anchor="middle" font-size="11">21</text><text x="530.1" y="157" text-anchor="middle" font-size="11">28</text><text x="548" y="137" text-anchor="end" font-size="11" class="tm">day</text><path d="M47.9,46.3 L65.7,61.0 L83.6,73.1 L101.4,83.0 L119.3,91.2 L137.2,97.8 L155.0,103.2 L172.9,107.7 L190.8,111.3 L208.6,114.3 L226.5,116.7 L244.3,118.7 L262.2,120.4 L280.1,121.7 L297.9,122.8 L315.8,123.7 L333.7,124.5 L351.5,125.1 L369.4,125.6 L387.2,126.0 L405.1,126.3 L423.0,126.6 L440.8,126.8 L458.7,127.0 L476.6,127.1 L494.4,127.2 L512.3,127.3 L530.1,127.4" fill="none" class="sb" stroke-width="2"/><line x1="30" y1="127.8" x2="548" y2="127.8" class="sg" stroke-width="1.2" stroke-dasharray="4 3"/><text x="539.1" y="120.7" text-anchor="end" font-size="11" class="tg">true long-run lift ≈ 1%</text><text x="83.6" y="38.2" text-anchor="start" font-size="11">week 1 average: +4.4% (novelty)</text><text x="24" y="146.0" text-anchor="end" font-size="10" class="tm">0%</text><text x="24" y="89.1" text-anchor="end" font-size="10" class="tm">4%</text><text x="24" y="32.2" text-anchor="end" font-size="10" class="tm">8%</text></svg><figcaption>Illustrative: daily lift of a shiny new feature. A one-week test would report +4.4%; the lasting effect is ~1%.</figcaption></figure>
  <p><strong>Novelty</strong>: users click the shiny new thing, then lose interest, so week 1 overstates the lasting lift. <strong>Primacy</strong>: users resist change at first, then adapt, so week 1 understates it. For the checkout, returning users who learned the three-step flow may hesitate on the new page at first (primacy). Detect: plot the lift by day, or compare new users (who have no "old" habit) with returning users. Fix: run longer, or analyse only after the curve flattens.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A new restaurant in the colony is packed in its first fortnight because it is new; the crowd after two months tells you whether the food is good.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Novelty effect</strong>: a temporary lift caused by newness. <strong>Primacy (change-aversion) effect</strong>: a temporary drop caused by users' existing habits. Both make a short test's estimate differ from the long-run effect.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Stopping as soon as the sample size is reached, in week 1, bakes the novelty into the decision. Look at the daily lift curve before deciding.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Interference.</b> Our test also assumes each user's outcome depends only on their own arm. On a marketplace that is often false: treated users can change what control users experience.</div>

  <h2 id="sab-network"><span class="num">11</span>Network Effects (Interference)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>If treatment users grab limited stock or delivery slots, control users get less. Is the measured difference still the effect of the change?</p>
  </div>
  <div class="cards">
    <div><b>Problem</b><p>Treated users affect control users: shared drivers, stock, chat, auctions.</p><small>Violates "units are independent" (SUTVA)</small></div>
    <div><b>Cluster randomisation</b><p>Randomise whole cities or friend clusters.</p><small>Fewer units → less power</small></div>
    <div><b>Switchback</b><p>Alternate the whole market between A and B over time slots.</p><small>Ride-sharing pricing, delivery dispatch</small></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Testing a new lane-changing rule by giving it to half the cars on one road: the treated cars push in, the untreated cars slow down, and the "difference" partly measures the treated cars stealing space.</p>
  </div>
  <div class="callout intu"><span class="label">Example</span>
    <p>A ride app gives treatment riders a discount. They book more, taking drivers away, so control riders wait longer and book less. Treatment goes up and control goes down, so the measured lift is inflated twice over. For our shop: if the faster checkout makes treatment users buy limited-stock items first, control users find them sold out. The same happens with Swiggy delivery partners or a shared ad budget.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>SUTVA</strong> (stable unit treatment value assumption): one unit's outcome is not affected by another unit's assignment. <strong>Interference</strong>: SUTVA is violated. Fixes randomise at a level that contains the spill-over (cluster) or in time (switchback).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Cluster designs have far fewer units (20 cities, not 30,000 users), so their SE must be computed at the cluster level. Analysing per user after randomising per city gives falsely tiny p-values.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Multiple variants.</b> The design team now wants to test four checkout designs against control at once. Each comparison is a test at 5%. What does four comparisons do to our false alarms and our sample size?</div>

  <h2 id="sab-variants"><span class="num">12</span>Multiple Variants (A/B/n)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>With four treatments vs one control, how likely is at least one false "winner", and what does correcting for it cost in users?</p>
  </div>
  <p>Testing 4 checkout designs vs control = 4 comparisons. By hand: P(at least one false alarm) = 1 − 0.95⁴ = 1 − 0.815 = 18.5%, not 5%. Correct with Bonferroni (α/4 = 0.0125) or Dunnett's test (built for "many vs one control"). The price: a smaller α needs a bigger n per arm.</p>
  <div class="fx" data-lang="py">from statsmodels.stats.power import NormalIndPower
from statsmodels.stats.proportion import proportion_effectsize
print(f"4 variants vs control at 0.05 each: P(&gt;=1 false alarm) = {1 - 0.95**4:.3f}")
h = proportion_effectsize(0.11, 0.10)
for a in (0.05, 0.05 / 4):
    n_ = NormalIndPower().solve_power(effect_size=h, alpha=a, power=0.8)
    print(f"alpha={a:.4f}: {np.ceil(n_):,.0f} users per arm")</div>
  <div class="fx" data-lang="text">4 variants vs control at 0.05 each: P(&gt;=1 false alarm) = 0.185
alpha=0.0500: 14,745 users per arm
alpha=0.0125: 20,948 users per arm</div>
  <p>At α = 0.0125 each arm needs 20,948 users instead of 14,745 (42% more), and there are now five arms instead of two: about 104,700 users in total vs 29,490, or roughly seven weeks of checkout traffic instead of two. That is why teams test few variants, or screen many cheaply first.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Five friends each toss a coin hoping for three heads in a row. One of them will probably manage it; that does not make his coin special.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>A/B/n test</strong>: one control and several treatments. <strong>Family-wise error</strong> for m comparisons: 1 − (1 − α)^m. <strong>Dunnett's test</strong>: compares each treatment with control while controlling the family-wise error, less conservative than Bonferroni.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Picking the best of four arms and reporting its uncorrected lift overstates it (winner's curse). Correct the α, and re-test the winner or keep a holdout.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Business impact.</b> Our two-arm test is clean: no SRM, looked at once after 14 full days, stable lift, no interference, one comparison. Leadership will not decide on "z = 3.14". What is the result worth?</div>

  <h2 id="sab-impact"><span class="num">13</span>Presenting Business Impact</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How do we turn +1.1 pp (CI +0.41 to +1.79) into money, with the uncertainty still visible?</p>
  </div>
  <p>Leadership decides on money, risk and effort. A data scientist who stops at the p-value leaves the most important step to someone who may misread it. Translating the result into annual value, with an honest range, is what gets features shipped (or saved from a bad launch).</p>
  <p>The idea: multiply the lift by how many users will see it per year and by what each extra conversion is worth. Do it for the point estimate and for both ends of the CI, so the range carries the uncertainty.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shopkeeper deciding whether to open on Sundays doesn't care that "Sunday footfall is significantly above zero". He wants "about ₹12,000 extra a month, at worst ₹5,000, at best ₹20,000", which he can weigh against an extra staff salary.</p>
  </div>
  <p>By hand, point estimate: 2,200 users/day × 365 = 803,000 users/year; × 0.0110 extra conversion = 8,833 extra purchases; × $60 margin = $529,980. Low end uses 0.0041, high end 0.0179.</p>
  <div class="fx" data-lang="py">users_per_year = 2200 * 365
value_per_purchase = 60                       # $ average order margin, from finance
for name, lift in [("low (CI)", 0.0041), ("point", 0.0110), ("high (CI)", 0.0179)]:
    print(f"{name:9s} \${lift * users_per_year * value_per_purchase:,.0f} / year")</div>
  <div class="fx" data-lang="text">low (CI)  $197,538 / year
point     $529,980 / year
high (CI) $862,422 / year</div>
  <p>The loop reuses one formula with three lifts. The CI ends give $198k to $862k a year. Note the assumptions in the comment: the value per purchase comes from finance, and we assume traffic stays at today's level and the effect lasts. State these on the slide.</p>
  <div class="callout def"><span class="label">One-slide summary</span>
    <p><strong>What:</strong> one-page checkout vs three-step, 14 days, 30,780 users. <strong>Result:</strong> conversion 10.0% → 11.1% (+11% relative, p = 0.002, 95% CI +0.4 to +1.8 pp). <strong>Worth:</strong> ≈ $530k/yr (range $200k–$860k). <strong>Guardrails:</strong> latency, errors, refunds unchanged. <strong>Recommendation:</strong> ship to 100%, keep a 5% holdout for a month to confirm.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: winner's curse</span>
    <p>Experiments that "won" tend to overstate their lift: among many tests, the ones noise pushed up are the ones that crossed the line. Quote the range, discount the point estimate a little, and use a <strong>holdout</strong> (a small group kept on the old version) to confirm the long-term impact.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How it all connects.</b> Thirteen steps from "did it work?" to "$530k a year". How do they form one system, and which statistics from earlier notes does each reuse?</div>

  <h2 id="sab-connect"><span class="num">14</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which parts of an A/B test are design, which are analysis, which are threats, and where does each piece of statistics come from?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 340" width="680">
<defs><marker id="sab-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="140" height="44" rx="7" class="fr sr"/><text x="80" y="29" text-anchor="middle" font-size="11.5" font-weight="700">before/after</text><text x="80" y="45" text-anchor="middle" class="tm" font-size="10">+8%, but payday, festival…</text>
<line x1="150" y1="32" x2="183" y2="32" stroke="currentColor" marker-end="url(#sab-a9)"/><text x="167" y="24" text-anchor="middle" class="tm" font-size="9.5">fix</text>
<rect x="185" y="10" width="150" height="44" rx="7" class="fb sb"/><text x="260" y="29" text-anchor="middle" font-size="11.5" font-weight="700">randomise + hypothesis</text><text x="260" y="45" text-anchor="middle" class="tm" font-size="10">10% → ≥ 11%, pre-registered</text>
<line x1="335" y1="32" x2="368" y2="32" stroke="currentColor" marker-end="url(#sab-a9)"/>
<rect x="370" y="10" width="140" height="44" rx="7" class="fb sb"/><text x="440" y="29" text-anchor="middle" font-size="11.5" font-weight="700">metric + unit</text><text x="440" y="45" text-anchor="middle" class="tm" font-size="10">conversion/user, md5 % 100</text>
<line x1="510" y1="32" x2="543" y2="32" stroke="currentColor" marker-end="url(#sab-a9)"/>
<rect x="545" y="10" width="125" height="44" rx="7" class="fb sb"/><text x="607" y="29" text-anchor="middle" font-size="11.5" font-weight="700">sample size</text><text x="607" y="45" text-anchor="middle" class="tm" font-size="10">14,745/arm, 14 days</text>
<line x1="607" y1="54" x2="607" y2="88" stroke="currentColor" marker-end="url(#sab-a9)"/>
<rect x="545" y="90" width="125" height="44" rx="7" class="ft st"/><text x="607" y="109" text-anchor="middle" font-size="11.5" font-weight="700">CUPED</text><text x="607" y="125" text-anchor="middle" class="tm" font-size="10">variance × 0.22</text>
<line x1="545" y1="112" x2="512" y2="112" stroke="currentColor" marker-end="url(#sab-a9)"/>
<rect x="370" y="90" width="140" height="44" rx="7" class="fg sg"/><text x="440" y="109" text-anchor="middle" font-size="11.5" font-weight="700">SRM check (χ²)</text><text x="440" y="125" text-anchor="middle" class="tm" font-size="10">15,400 / 15,380: p 0.91</text>
<line x1="370" y1="112" x2="337" y2="112" stroke="currentColor" marker-end="url(#sab-a9)"/>
<rect x="185" y="90" width="150" height="44" rx="7" class="fg sg"/><text x="260" y="109" text-anchor="middle" font-size="11.5" font-weight="700">z-test + CI</text><text x="260" y="125" text-anchor="middle" class="tm" font-size="10">z 3.14, CI +0.41 to +1.79 pp</text>
<line x1="185" y1="112" x2="152" y2="112" stroke="currentColor" marker-end="url(#sab-a9)"/>
<rect x="10" y="90" width="140" height="44" rx="7" class="fg sg"/><text x="80" y="109" text-anchor="middle" font-size="11.5" font-weight="700">CI vs MDE</text><text x="80" y="125" text-anchor="middle" class="tm" font-size="10">centre 1.1 ≥ 1 → ship</text>
<line x1="80" y1="134" x2="80" y2="168" stroke="currentColor" marker-end="url(#sab-a9)"/>
<rect x="10" y="170" width="140" height="44" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="80" y="189" text-anchor="middle" font-size="11.5" font-weight="700">business impact</text><text x="80" y="205" text-anchor="middle" class="tm" font-size="10">$198k – $862k / year</text>
<rect x="185" y="250" width="110" height="44" rx="7" class="fr sr"/><text x="240" y="269" text-anchor="middle" font-size="11.5" font-weight="700">peeking</text><text x="240" y="285" text-anchor="middle" class="tm" font-size="10">5% → 21.6%</text>
<rect x="305" y="250" width="110" height="44" rx="7" class="fr sr"/><text x="360" y="269" text-anchor="middle" font-size="11.5" font-weight="700">novelty</text><text x="360" y="285" text-anchor="middle" class="tm" font-size="10">+4.4% → ~1%</text>
<rect x="425" y="250" width="115" height="44" rx="7" class="fr sr"/><text x="482" y="269" text-anchor="middle" font-size="11.5" font-weight="700">interference</text><text x="482" y="285" text-anchor="middle" class="tm" font-size="10">cluster, switchback</text>
<rect x="550" y="250" width="120" height="44" rx="7" class="fr sr"/><text x="610" y="269" text-anchor="middle" font-size="11.5" font-weight="700">many variants</text><text x="610" y="285" text-anchor="middle" class="tm" font-size="10">18.5% → α/4</text>
<line x1="240" y1="250" x2="250" y2="136" stroke="currentColor" stroke-opacity=".5" stroke-dasharray="4 3" marker-end="url(#sab-a9)"/><line x1="360" y1="250" x2="280" y2="136" stroke="currentColor" stroke-opacity=".5" stroke-dasharray="4 3" marker-end="url(#sab-a9)"/><line x1="482" y1="250" x2="300" y2="136" stroke="currentColor" stroke-opacity=".5" stroke-dasharray="4 3" marker-end="url(#sab-a9)"/><line x1="610" y1="250" x2="320" y2="136" stroke="currentColor" stroke-opacity=".5" stroke-dasharray="4 3" marker-end="url(#sab-a9)"/>
<text x="428" y="318" text-anchor="middle" class="tm" font-size="10.5">each threat breaks one assumption behind the z-test: look once · stable behaviour · independent units · one comparison</text>
<text x="440" y="215" text-anchor="middle" class="tm" font-size="10.5">from Hypothesis Testing: power, χ², z-test, CI, multiple testing</text>
</svg><figcaption>Top row, left to right: the design decisions made before launch. Second row, right to left: the analysis after the data is in, ending in a decision. Bottom: the four threats, each attacking the analysis by breaking one assumption of the test.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the checkout experiment</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers</th><th>Our value</th><th>Use when</th></tr>
    <tr><td>Randomisation</td><td>coin flip per user (hash)</td><td>can we credit the change?</td><td>5,021 / 4,979 in 10,000</td><td>always</td></tr>
    <tr><td>Hypothesis, MDE</td><td>H₀/H₁ from Hypothesis Testing</td><td>what are we testing, what size matters?</td><td>10% → ≥ 11%, MDE 1 pp</td><td>before launch</td></tr>
    <tr><td>OEC, guardrails, unit</td><td>business goal</td><td>which number decides? what is randomised?</td><td>conversion per user</td><td>before launch</td></tr>
    <tr><td>Sample size</td><td>power formula</td><td>how many users, how long?</td><td>14,745/arm, 14 days</td><td>before launch</td></tr>
    <tr><td>CUPED</td><td>regression slope θ, correlation ρ</td><td>can we need fewer users?</td><td>variance × 0.22</td><td>pre-period data exists</td></tr>
    <tr><td>SRM</td><td>χ² goodness of fit</td><td>did the split work?</td><td>p 0.91 (broken: 0.00005)</td><td>first analysis step</td></tr>
    <tr><td>z-test, CI</td><td>two-proportion z, unpooled SE</td><td>real? how big?</td><td>z 3.14, CI +0.41 to +1.79 pp</td><td>binary metrics (Welch t for means)</td></tr>
    <tr><td>Practical significance</td><td>CI vs 0 and MDE</td><td>ship?</td><td>centre 1.1 ≥ 1 → ship</td><td>every decision</td></tr>
    <tr><td>Peeking</td><td>repeated tests</td><td>can we stop early?</td><td>5% → 21.6%</td><td>live dashboards → sequential</td></tr>
    <tr><td>Novelty / primacy</td><td>lift by day</td><td>does it last?</td><td>+4.4% → ~1% (illustrative)</td><td>visible UI changes</td></tr>
    <tr><td>Interference</td><td>SUTVA</td><td>do users affect each other?</td><td>(marketplaces)</td><td>shared supply → cluster, switchback</td></tr>
    <tr><td>Many variants</td><td>FWER, Bonferroni</td><td>several treatments?</td><td>18.5% → α/4, 20,948/arm</td><td>A/B/n</td></tr>
    <tr><td>Business impact</td><td>lift × users × value</td><td>what is it worth?</td><td>$198k–$862k, point $530k</td><td>every readout</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>an A/B test is a hypothesis test whose assumptions are made true by design.</strong> Randomisation removes confounders, pre-registration and one look keep α honest, the right unit keeps observations independent, power sets n, and every pitfall is one of those assumptions breaking.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common mistakes.</b> The checklist.</div>

  <h2 id="sab-traps"><span class="num">15</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>What goes wrong most often when real teams run experiments?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reading results before the SRM check</span>
    <p>A broken split invalidates everything. Check the user counts with a chi-square test first; p &lt; 0.001 means stop and debug.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: peeking and stopping early</span>
    <p>Daily looks with "stop at p &lt; 0.05" raised false alarms from 5% to 21.6% in our simulation. Fix the horizon, or use a sequential method.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: wrong analysis unit</span>
    <p>Randomised by user, analysed by page view → SE too small. One row per randomisation unit, or the delta method.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: too many metrics, no primary</span>
    <p>With 20 metrics, about one will be "significant" by luck. Name one primary metric before launch; treat the rest as explanations, with FDR correction.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: "not significant" = "no effect"</span>
    <p>A wide CI spanning 0 means "we don't know". Only a narrow CI around 0 supports "no meaningful effect".</p>
  </div>
  <div class="callout trap"><span class="label">Trap: stopping mid-week or after a few days</span>
    <p>Day-of-week patterns and novelty both distort short tests. Run whole weeks; plot lift by day.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: ignoring interference</span>
    <p>Marketplaces, social features and shared budgets leak between arms. Use cluster or switchback designs.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: underpowered pilots as verdicts</span>
    <p>The 1,000-per-arm pilot had 11% power for +1 pp. A "not significant" pilot is not evidence of no effect; size the real test with the power formula.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Revision.</b> The whole note condensed onto one sheet.</div>

  <h2 id="sab-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: one-page checkout (B) vs three-step (A). Baseline conversion 10%, MDE +1 pp, α 0.05, power 0.8, 2,200 eligible users a day. Result after 14 days: control 1,540 / 15,400, treatment 1,707 / 15,380. Margin $60 per purchase.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>Our answer</th><th>Weakness → next</th></tr>
    <tr><td>Randomisation</td><td>can we credit the change?</td><td>coin flip per user, same time</td><td>what exactly is the claim?</td></tr>
    <tr><td>Hypothesis</td><td>what are we testing?</td><td>10% → ≥ 11%, pre-registered</td><td>which metric, which unit?</td></tr>
    <tr><td>Metrics, unit</td><td>which number, what is randomised?</td><td>conversion per user; md5 % 100</td><td>how many users?</td></tr>
    <tr><td>Sample size</td><td>how many, how long?</td><td>14,745/arm; 14 days</td><td>expensive</td></tr>
    <tr><td>CUPED</td><td>fewer users?</td><td>variance × (1 − 0.88²) = 0.22</td><td>did the split work?</td></tr>
    <tr><td>SRM</td><td>split as planned?</td><td>p 0.91</td><td>is the lift real?</td></tr>
    <tr><td>z-test, CI</td><td>real? how big?</td><td>z 3.14, p 0.0017, CI +0.41 to +1.79 pp</td><td>worth it?</td></tr>
    <tr><td>Practical significance</td><td>ship?</td><td>centre 1.1 ≥ MDE 1 → ship</td><td>assumed one look</td></tr>
    <tr><td>Peeking</td><td>stop early?</td><td>5% → 21.6% false alarms</td><td>assumed stable behaviour</td></tr>
    <tr><td>Novelty / primacy</td><td>does it last?</td><td>plot lift by day</td><td>assumed independent users</td></tr>
    <tr><td>Interference</td><td>users affect each other?</td><td>cluster / switchback</td><td>assumed one comparison</td></tr>
    <tr><td>Variants</td><td>several treatments?</td><td>18.5% → α/4; 20,948/arm</td><td>how to tell leadership?</td></tr>
    <tr><td>Impact</td><td>what is it worth?</td><td>$530k (198k–862k)/yr</td><td>winner's curse → holdout</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>Bucket</td><td>int(md5(experiment:user), 16) % 100 &lt; 50 → treatment</td><td>sticky, independent across experiments</td></tr>
    <tr><td>Sample size</td><td>n = (z₁₋α/₂ + z₁₋β)² [p₁(1 − p₁) + p₂(1 − p₂)] / δ²</td><td>1.96 + 0.84; δ = MDE</td></tr>
    <tr><td>Rule of thumb</td><td>n ≈ 16 p(1 − p)/δ²</td><td>α 0.05, power 0.8</td></tr>
    <tr><td>Duration</td><td>2n / daily users, rounded up to whole weeks</td><td>29,490/2,200 = 13.4 → 14</td></tr>
    <tr><td>CUPED</td><td>Y − θ(X − X̄), θ = cov(X, Y)/var(X); var × (1 − ρ²)</td><td>X pre-period metric</td></tr>
    <tr><td>SRM</td><td>χ² = Σ (O − E)²/E on arm counts</td><td>alarm at p &lt; 0.001</td></tr>
    <tr><td>z-test</td><td>(p̂_T − p̂_C)/√(p̂(1 − p̂)(1/n_T + 1/n_C))</td><td>p̂ pooled rate</td></tr>
    <tr><td>CI</td><td>diff ± 1.96 √(p_T(1 − p_T)/n_T + p_C(1 − p_C)/n_C)</td><td>unpooled SE</td></tr>
    <tr><td>Variants</td><td>1 − (1 − α)^m; α/m</td><td>m comparisons</td></tr>
    <tr><td>Impact</td><td>lift × users per year × value per conversion</td><td>use CI ends for the range</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Run an A/B test</b><p>A change you can show to some users and not others, enough traffic for a useful MDE, a metric that moves within weeks.</p><small>The default for product decisions</small></div>
    <div><b>Don't</b><p>Too little traffic, changes that can't be hidden (brand, pricing PR), ethical or legal issues, tiny one-off decisions.</p><small>Use qualitative research, diff-in-diff</small></div>
    <div><b>Change the design</b><p>Interference → cluster or switchback. Early looks needed → sequential. Many variants → correct α.</p><small>Each fixes one assumption</small></div>
    <div><b>Report</b><p>Lift with CI, guardrails, value range, recommendation, holdout.</p><small>Never a bare p-value</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Skipping SRM; peeking; analysing at the wrong unit; no primary metric; "not significant" read as "no effect"; stopping mid-week; ignoring novelty and interference; absolute vs relative lift confusion; uncorrected multiple variants; trusting the winner's point estimate.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Baseline 10%, MDE 1 pp, α 0.05, power 0.8: users per arm (rule of thumb)?</td><td>16 × 0.09/0.0001 = 14,400 (exact ≈ 14,750)</td></tr>
    <tr><td>MDE halves. What happens to n?</td><td>×4 (57,756 per arm for 0.5 pp)</td></tr>
    <tr><td>15,400 vs 15,380 users in a 50/50 test: SRM?</td><td>χ² 0.013, p 0.91: fine</td></tr>
    <tr><td>1,707/15,380 vs 1,540/15,400: z and CI?</td><td>z 3.14, p 0.0017; CI +0.41 to +1.79 pp</td></tr>
    <tr><td>Before/after correlation 0.88: CUPED variance factor?</td><td>1 − 0.88² ≈ 0.22</td></tr>
  </table>

  <h2 id="sab-qa"><span class="num">16</span>Case Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Walk me through designing an A/B test for a new recommendation widget.</summary><div class="qa-body">Hypothesis (widget raises items bought per user). Primary metric: purchases or revenue per user; secondary: widget CTR; guardrails: latency, page errors, overall engagement. Unit: user. Sample size from baseline, MDE, α 0.05, power 0.8; duration in full weeks. Launch 50/50, check SRM, don't peek, analyse with a t-test/z-test and CI, check guardrails and novelty, decide against the MDE.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Estimate the sample size: baseline 10%, MDE +1 pp, α 0.05, power 0.8.</summary><div class="qa-body">Rule of thumb n ≈ 16·p(1−p)/δ² = 16 × 0.09 / 0.0001 = 14,400 per arm. The exact formula gives about 14,750. Halving the MDE to 0.5 pp would need about 4× as many (≈ 58k per arm).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your test shows p = 0.03 after 3 days of a planned 14. The PM wants to ship. What do you say?</summary><div class="qa-body">Not yet. Stopping at the first significant peek inflates the false-positive rate (our simulation: 5% → 22%). Three days also misses weekly patterns and novelty effects. Finish the planned 14 days, or switch to a sequential design next time if early stopping matters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Control has 50,000 users and treatment 48,500 in a 50/50 test. What now?</summary><div class="qa-body">SRM check: χ² p ≈ 2e-6, so the split is broken. Don't trust any metric. Look for causes: treatment crashes for some browsers, redirects losing users, bot filtering applied unevenly, logging differences. Fix and rerun.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the p-value and CI of this test to a non-technical manager.</summary><div class="qa-body">"If the new checkout made no difference, a gap as large as 1.1 points would show up only about 2 times in 1,000 tests, so we're confident it's real. Our best estimate is +1.1 points, and the plausible range is +0.4 to +1.8 points, which is roughly $200k to $860k a year."</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The result is significant but the lift is 0.1% and the CI is [0.02%, 0.18%]. Ship?</summary><div class="qa-body">Statistically real, practically small. Compare against the MDE and costs: if the feature adds maintenance, complexity or risk, probably not. If it's a free config change, maybe. Significance isn't the decision; business value is.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you reduce the sample size you need?</summary><div class="qa-body">Lower variance: CUPED (adjust for each user's pre-experiment metric; variance × (1 − ρ²)), stratification, trimming outliers. Use a more sensitive metric closer to the change. Accept a larger MDE. Avoid many arms. Bigger effect = smaller n (n ∝ 1/δ²).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Engagement jumped 8% in week 1 and is +1% in week 3. What's happening?</summary><div class="qa-body">Likely a novelty effect: curiosity wears off. Report the stabilised effect, check new vs returning users (new users have no novelty), and run longer if needed. The long-run lift (~1%) is what matters.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you A/B test a new surge-pricing algorithm at a ride-sharing company?</summary><div class="qa-body">User-level randomisation fails: riders and drivers share a market, so treatment changes control's supply (interference). Use switchback testing (alternate the whole city between algorithms in random time blocks) or randomise by city/region and analyse at that level.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you assign users to arms in a backend, consistently?</summary><div class="qa-body">Hash experiment name + user id (e.g. md5), take mod 100, and map bucket ranges to arms. It is deterministic (same user, same arm, no lookup table), evenly spread, and independent across experiments because the experiment name is in the key.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Conversion rose overall, but fell in both mobile and desktop. How?</summary><div class="qa-body">Simpson's paradox (Correlation note): the treatment's traffic mix shifted towards the higher-converting segment (e.g. more desktop users). Check SRM within segments; the mix shift may itself indicate a bug, since randomisation should balance segments.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You track 20 metrics and one guardrail is "significantly" worse at p = 0.04. Panic?</summary><div class="qa-body">With 20 metrics, about one false alarm is expected at α 0.05. Check its size and plausibility, apply an FDR correction, and look for a mechanism. If it's a critical guardrail (payments), rerun or investigate before shipping.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should you NOT run an A/B test?</summary><div class="qa-body">Too little traffic for any useful MDE; changes that can't be hidden from control (brand redesign, pricing PR); ethical or legal issues; one-off decisions where the cost of being wrong is tiny. Alternatives: qualitative research, diff-in-diff, before/after with caution.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does an A/B test prove causation when a correlation can't?</summary><div class="qa-body">Correlation in observational data can come from confounders (motivation, payday, user type). Random assignment makes the arms alike on every variable, measured or not, so the only systematic difference is the change. The hypothesis test then only has to rule out luck.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: which pieces of Hypothesis Testing does each step reuse?</summary><div class="qa-body">Sample size = the power formula; SRM = χ² goodness of fit; the result = two-proportion z-test and CI; guardrails on means = Welch t; peeking and many variants = multiple testing; practical significance = reading the CI against the MDE.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip the power calculation and just "run it for a week"?</summary><div class="qa-body">One week at 2,200 users a day gives about 7,700 per arm, roughly 50% power for +1 pp: a coin flip whether a real +$530k/year improvement shows as significant. You also miss a full second weekly cycle and may bake in novelty. Size first, then run.</div></details>
</main>`
});
