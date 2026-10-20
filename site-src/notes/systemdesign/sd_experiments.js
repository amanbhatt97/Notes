// notes/systemdesign/sd_experiments.js — Shadow, Canary & A/B Infrastructure
Object.assign(TOPIC_CONTENT, {
  "sd_experiments": `<main>
<h1>Shadow, Canary &amp; A/B Infrastructure</h1>
  <div class="where"><span>ML System Design</span><span>Experiments</span></div>
  <p class="lead">Monitoring ended with a challenger that beats the champion on last week's orders. Serving showed how to release it safely (shadow, then canary). One question is left: is it actually <em>better for customers</em>? This note follows that need: why offline wins don't guarantee online wins, the A/B machinery (assignment by hashing, traced by hand; exposure logs; sample sizes), the checks that make a result trustworthy (SRM, peeking), a metrics hierarchy with guardrails, interleaving for rankers, feedback loops where the model writes its own training data, and bandits that explore on purpose. Running example: Biteful's ETA v2 vs v1, orders 101–108, and Asha, Ben and Chitra as users.</p>

  <h2 id="se-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 130" width="680">
    <defs><marker id="se-t0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="8" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="69" y="42" text-anchor="middle" font-size="12">1 Framework</text><text x="69" y="58" text-anchor="middle" font-size="10" class="tm">the whole path once</text>
    <rect x="145" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="206" y="42" text-anchor="middle" font-size="12">2 Serving</text><text x="206" y="58" text-anchor="middle" font-size="10" class="tm">answer in 60 ms</text>
    <rect x="282" y="22" width="122" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="343" y="42" text-anchor="middle" font-size="12">3 Monitoring</text><text x="343" y="58" text-anchor="middle" font-size="10" class="tm">still right next month?</text>
    <rect x="419" y="22" width="122" height="46" rx="6" class="fg sg" stroke-width="2.5"/><text x="480" y="42" text-anchor="middle" font-size="12" font-weight="700">4 Experiments</text><text x="480" y="58" text-anchor="middle" font-size="10" class="tm">is v2 really better?</text>
    <rect x="556" y="22" width="116" height="46" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="614" y="42" text-anchor="middle" font-size="12">5 Case studies</text><text x="614" y="58" text-anchor="middle" font-size="10" class="tm">four full designs</text>
    <line x1="130" y1="45" x2="143" y2="45" stroke="currentColor" marker-end="url(#se-t0)"/>
    <line x1="267" y1="45" x2="280" y2="45" stroke="currentColor" marker-end="url(#se-t0)"/>
    <line x1="404" y1="45" x2="417" y2="45" stroke="currentColor" marker-end="url(#se-t0)"/>
    <line x1="541" y1="45" x2="554" y2="45" stroke="currentColor" marker-end="url(#se-t0)"/>
    <text x="340" y="96" text-anchor="middle" font-size="11">One story across all five notes: Biteful's delivery-time (ETA) prediction</text>
    <text x="340" y="114" text-anchor="middle" font-size="11" class="tm">this note: v2 vs v1 on real customers — and what the model does to its own data</text>
  </svg><figcaption>The ML System Design track in reading order. You are on the green note: the last stretch of the loop before the full case studies.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="sd_monitoring">Monitoring</a> and <a class="xref" data-note="sd_serving">Serving</a></b><span>A challenger (MAE 2.25 vs 2.49) that passed champion–challenger offline; shadow and canary that showed it runs and isn't broken. The statistics come from <a class="xref" data-note="st_abtesting">A/B Testing</a> and <a class="xref" data-note="st_hypothesis">Hypothesis Testing</a>.</span></li>
    <li><b>This note adds: proving "better", safely</b><span>The offline/online gap, A/B infrastructure (hash assignment, exposure logging, sample size), SRM and peeking checks, a metric hierarchy with guardrails and rollback, interleaving for ranking, feedback loops, and bandits.</span></li>
    <li><b>Leads to: <a class="xref" data-note="sd_cases">Case Studies</a></b><span>Four end-to-end designs that reuse every note. Interleaving and feedback loops matter most for <a class="xref" data-note="ml_rs_ranking">ranking and recommendations</a>.</span></li>
  </ol>

  <h2 id="se-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The note as one chain. Running example: Biteful's ETA v2 (no buffer, MAE 1.27 on orders 101–108) against v1 (the same model plus a 3-minute buffer, MAE 3.15). Users Asha, Ben and Chitra, and 100,000 more.</p>
  <ol class="story">
    <li><b>Offline wins ≠ online wins</b><span>Q: v2 has lower MAE — ship it? → v2 is late on 50% of orders vs 0%, and shows 3 minutes less: customers might order more, or cancel more. Offline data can't show reactions. So we must test on real users, fairly…</span></li>
    <li><b>A/B infrastructure</b><span>Q: how do we compare v1 and v2 at the same time on comparable users? → random assignment, exposure logs, metric pipeline, stats engine; 752,700 users per arm for a 2% lift. But how does each server know Asha's group without a database lookup?</span></li>
    <li><b>Hash assignment, traced</b><span>Q: same group every time, on any server, no storage? → md5("eta_v2:asha") → 9bbb30aa → 2612736170 → mod 1000 = 170 → control. Ramping 10% → 20% keeps all 9,949 treated users. The numbers come in — can we trust them?</span></li>
    <li><b>Trusting the numbers</b><span>Q: is the split broken, or did someone peek? → SRM: 1,008,000 vs 992,000 gives χ² = 128, stop. Peeking daily turns 5.8% false winners into 23.3%. Then: which number decides?</span></li>
    <li><b>Metric hierarchy &amp; guardrails</b><span>Q: conversion up, late orders up — ship? → primary +0.14 pts (significant), but cancellations +1.11 pts breach the +0.25 guardrail: don't ship, roll back by flag. For rankers, A/B is slow…</span></li>
    <li><b>Interleaving</b><span>Q: how do we compare two rankings with far fewer users? → each user sees one merged list; credit orders to the ranker that placed the item; 560–440 decided sessions, p = 0.0002. But every ranker learns only from what it showed…</span></li>
    <li><b>Feedback loops</b><span>Q: what happens when the model chooses its own training data? → without exploration the best (new) restaurant is shown 0 times in 20,000 sessions; with 10% exploration 14,889 times and orders rise 5,392 → 6,008. How do we explore without wasting traffic?</span></li>
    <li><b>Bandits</b><span>Q: can we learn and earn at once? → Thompson sampling: regret 30 clicks vs 378 for a fixed three-way split. Use bandits to optimise, A/B tests to decide.</span></li>
  </ol>

  <h2 id="se-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Proving v2 is Better</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Offline vs online</div>
        <ul>
          <li><b>Offline</b> — old logged data; cheap, no reactions</li>
          <li><b>Gap</b> — logging bias, proxy ≠ goal, skew, latency, novelty, loops</li>
          <li>v2: MAE 1.27 but 50% late</li>
          <li><b>Ladder</b> — offline → shadow → canary → A/B → ramp</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">A/B machinery</div>
        <ul>
          <li><b>Assignment</b> — hash(exp:user) mod 1000</li>
          <li><b>Exposure</b> — log who actually saw it</li>
          <li><b>Sample size</b> — (z<sub>α/2</sub>+z<sub>β</sub>)² · var / Δ²</li>
          <li>2% lift on 5%: 752,700/arm</li>
          <li><b>Unit</b> — user; city/time if users interact</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Trust</div>
        <ul>
          <li><b>SRM</b> — χ² on group sizes; p &lt; 0.001 stop</li>
          <li><b>Peeking</b> — 5.8% → 23.3% false winners</li>
          <li>Fix duration or use sequential tests</li>
          <li>Run full weeks; novelty fades</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Metrics hierarchy</div>
        <ul>
          <li><b>North star</b> — retained, satisfied customers</li>
          <li><b>Primary</b> — conversion / on-time rate</li>
          <li><b>Guardrails</b> — cancellations, latency, complaints</li>
          <li>Breach → auto-rollback by flag</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Rankers</div>
        <ul>
          <li><b>Interleaving</b> — team-draft merge; 10–100× more sensitive</li>
          <li>Screens rankers; A/B confirms the winner</li>
          <li>💡 gully cricket captains picking players</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Loops &amp; bandits</div>
        <ul>
          <li><b>Feedback loop</b> — labels only for what was shown</li>
          <li>ETA: shown time changes who orders</li>
          <li><b>Exploration</b> — 10% slots find the new best</li>
          <li><b>Thompson</b> — regret 30 vs 378</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="se-gap"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Offline Wins ≠ Online Wins</span><span class="rm-sub">Why we must test on users</span></div></div>
      <div class="rm-item rm-done" data-target="se-ab"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">A/B Infrastructure</span><span class="rm-sub">Assign, log, measure, size</span></div></div>
      <div class="rm-item rm-done" data-target="se-hash"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Hash Assignment, Traced</span><span class="rm-sub">Asha → bucket 170</span></div></div>
      <div class="rm-item rm-done" data-target="se-trust"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Trusting the Numbers</span><span class="rm-sub">SRM and peeking</span></div></div>
      <div class="rm-item rm-done" data-target="se-metrics"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Metrics Hierarchy &amp; Guardrails</span><span class="rm-sub">Which number decides</span></div></div>
      <div class="rm-item rm-done" data-target="se-inter"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Interleaving</span><span class="rm-sub">Faster ranking tests</span></div></div>
      <div class="rm-item rm-done" data-target="se-loops"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Feedback Loops</span><span class="rm-sub">When the model feeds itself</span></div></div>
      <div class="rm-item rm-done" data-target="se-bandit"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Bandits</span><span class="rm-sub">Explore on purpose</span></div></div>
      <div class="rm-item rm-done" data-target="se-mistakes"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">What breaks experiments</span></div></div>
      <div class="rm-item rm-done" data-target="se-connect"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">From offline win to launch</span></div></div>
      <div class="rm-item rm-done" data-target="se-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="se-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="se-gap"><span class="num">01</span>Offline Wins ≠ Online Wins</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>v2 beats v1 on every offline error metric. The product manager asks: "Can we switch everyone on Monday?" What can old logged data tell us about how customers will react to <em>different</em> ETAs — and what can it not?</p>
  </div>
  <p><strong>Offline evaluation</strong> scores a model on data logged in the past: cheap, fast, nobody hurt. But it can only replay what already happened. <strong>Online evaluation</strong> lets real users see the model and measures what they do. Here is the gap on our eight orders. v1 is the held-out linear ETA plus a 3-minute buffer; v2 is the same model without the buffer.</p>
  <div class="fx" data-lang="py">import numpy as np

actual = np.array([28, 41, 30, 58, 19, 52, 27, 33])                    # orders 101-108
v2 = np.array([27.5, 42.3, 27.8, 58.9, 20.4, 51.1, 29.1, 32.1])       # held-out linear ETA (framework note)
v1 = v2 + 3                                                            # today's model: same, plus a 3-min buffer

for name, eta in [("v1 (buffered)", v1), ("v2 (unbiased)", v2)]:
    err = actual - eta
    print(f"{name:&lt;14} MAE {np.abs(err).mean():4.2f}   late {np.mean(err &gt; 0):4.0%}   "
          f"average ETA shown {eta.mean():4.1f} min")</div>
<div class="fx" data-lang="text">v1 (buffered)  MAE 3.15   late   0%   average ETA shown 39.1 min
v2 (unbiased)  MAE 1.27   late  50%   average ETA shown 36.1 min</div>
  <p>(These use the held-out ETAs rounded to one decimal, so MAE is 1.27 and 3.15 instead of the framework's 1.25 and 3.16.) Offline, v2 wins clearly: MAE 1.27 vs 3.15. But v2 is late on half the orders, and it shows ETAs 3 minutes shorter. Shorter ETAs might make more people order. Late food might make more people cancel or stop using Biteful. Which effect wins is a question about <em>people</em>, and no log of past orders can answer it.</p>
  <table class="tbl">
    <tr><th>Why offline ≠ online</th><th>Plain meaning</th><th>Biteful example</th></tr>
    <tr><td>User reaction</td><td>People change behaviour when the product changes</td><td>A shorter ETA attracts orders; a broken promise drives cancellations</td></tr>
    <tr><td>Proxy metric</td><td>The offline number stands in for the real goal</td><td>MAE improves, kept promises get worse</td></tr>
    <tr><td>Logging bias</td><td>Old data only contains what the old system caused</td><td>No logs of orders people <em>would</em> have placed with a shorter ETA</td></tr>
    <tr><td>Skew and latency</td><td>Live features or speed differ from training</td><td>The straight-line km bug; +10 ms on the feed</td></tr>
    <tr><td>Feedback loops</td><td>The model's outputs change its future data</td><td>Riders hurry for tight ETAs; long ETAs lose the customers who'd wait</td></tr>
  </table>
  <p>So teams use a <strong>rollout ladder</strong>. Each rung exposes more real users, and you climb only after the cheaper, safer rung passed. <a class="xref" data-note="sd_serving">Serving</a> covered shadow and canary ("does it work, is it broken?"); this note is about the A/B rung ("is it better?").</p>
  <figure class="viz"><svg viewBox="0 0 720 172" width="720" role="img"><defs><marker id="se-m1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="12" y="128" width="126" height="12" rx="3" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="75" y="158" text-anchor="middle" font-weight="600">Offline eval</text><text x="75" y="118" text-anchor="middle" class="tm">0% users</text><rect x="154" y="110" width="126" height="30" rx="3" class="ft" stroke="currentColor" stroke-opacity=".4"/><text x="217" y="158" text-anchor="middle" font-weight="600">Shadow</text><text x="217" y="86" text-anchor="middle" class="tm">0% served</text><text x="217" y="100" text-anchor="middle" class="tm">100% mirrored</text><rect x="296" y="90" width="126" height="50" rx="3" class="fb" stroke="currentColor" stroke-opacity=".4"/><text x="359" y="158" text-anchor="middle" font-weight="600">Canary</text><text x="359" y="80" text-anchor="middle" class="tm">1-5%</text><rect x="438" y="60" width="126" height="80" rx="3" class="fv" stroke="currentColor" stroke-opacity=".4"/><text x="501" y="158" text-anchor="middle" font-weight="600">A/B test</text><text x="501" y="50" text-anchor="middle" class="tm">10-50%</text><rect x="580" y="24" width="126" height="116" rx="3" class="fg" stroke="currentColor" stroke-opacity=".4"/><text x="643" y="158" text-anchor="middle" font-weight="600">Ramp</text><text x="643" y="16" text-anchor="middle" class="tm">25→50→100%</text><path d="M12,140 H710" stroke="currentColor" fill="none" stroke-width="1.4"/></svg><figcaption>Each rung exposes more real users, only after the cheaper, safer rung passed.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Getting a driving licence. Practise on an empty ground (offline), sit beside the instructor and watch (shadow), drive a quiet colony road with his foot near the brake (canary), take the RTO test on a real road (A/B), and only then drive alone in Pune traffic (100%).</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Online evaluation</strong>: measuring a model on live users. <strong>Rollout</strong>: moving traffic from the old model (<strong>champion</strong>) to the new one (<strong>challenger</strong>) in controlled steps.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Shipping on offline wins. Better MAE (or NDCG) on logged data is a reason to test, not to launch.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: A/B infrastructure.</b> We must try v2 on real customers. Comparing "this week with v2" against "last week with v1" mixes in a cricket final, a sale and the weather. How do we compare the two at the same time on comparable groups?</div>

  <h2 id="se-ab"><span class="num">02</span>A/B Infrastructure</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We need two groups that are alike in everything except the ETA model, measured over the same days, with enough people that a real difference isn't lost in noise. What machinery does that, for hundreds of experiments at once?</p>
  </div>
  <p>An <strong>A/B test</strong> randomly puts some users on v1 (<strong>control</strong>) and some on v2 (<strong>treatment</strong>) at the same time. Random assignment makes the groups alike in every other way, so any difference in orders is caused by the model. The statistics are in <a class="xref" data-note="st_abtesting">A/B Testing</a>; here is the machinery.</p>
  <figure class="viz"><svg viewBox="0 0 730 186" width="730" role="img"><defs><marker id="se-m4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="10" y="8" width="150" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="85" y="25" text-anchor="middle" font-weight="600">Experiment</text><text x="85" y="39" text-anchor="middle" class="tm">config</text><rect x="10" y="80" width="150" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="85" y="106" text-anchor="middle" font-weight="600">User request</text><rect x="200" y="80" width="150" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="275" y="99" text-anchor="middle" font-weight="600">Assignment</text><text x="275" y="113" text-anchor="middle" class="tm">hash(user,exp)</text><rect x="390" y="80" width="150" height="44" rx="6" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="465" y="99" text-anchor="middle" font-weight="600">App serves</text><text x="465" y="113" text-anchor="middle" class="tm">variant</text><rect x="580" y="80" width="140" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="650" y="99" text-anchor="middle" font-weight="600">Exposure +</text><text x="650" y="113" text-anchor="middle" class="tm">event logs</text><rect x="390" y="140" width="150" height="40" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="465" y="164" text-anchor="middle" font-weight="600">Metric pipeline</text><rect x="200" y="140" width="150" height="40" rx="6" class="fr" stroke="currentColor" stroke-opacity=".55"/><text x="275" y="164" text-anchor="middle" font-weight="600">Stats + guardrails</text><rect x="10" y="140" width="150" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="85" y="164" text-anchor="middle" font-weight="600">Decision</text><line x1="162" y1="102" x2="197" y2="102" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m4)"/><line x1="352" y1="102" x2="387" y2="102" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m4)"/><line x1="542" y1="102" x2="577" y2="102" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m4)"/><line x1="162" y1="30" x2="240" y2="77" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m4)"/><path d="M650,126 V160 H543" stroke="currentColor" fill="none" stroke-width="1.4" marker-end="url(#se-m4)"/><line x1="388" y1="160" x2="353" y2="160" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m4)"/><line x1="198" y1="160" x2="163" y2="160" stroke="currentColor" stroke-width="1.4" marker-end="url(#se-m4)"/></svg><figcaption>Assignment must be deterministic, and every exposure must be logged, or the analysis is biased.</figcaption></figure>
  <div class="cards">
    <div><b>Assignment service</b><p>Config + hash → variant. Fast, stateless, same answer on every server.</p><small>Optimizely, Statsig, in-house</small></div>
    <div><b>Exposure logs</b><p>Who actually saw which variant, and when.</p><small>Analyse only exposed users</small></div>
    <div><b>Metric pipeline</b><p>Join exposures to orders, cancellations, ETAs; per-user totals.</p><small>Daily batch in the warehouse</small></div>
    <div><b>Stats engine</b><p>Confidence intervals, CUPED, SRM check, guardrails.</p><small>Auto report per experiment</small></div>
  </div>
  <p>Two terms need care. An <strong>exposure</strong> is logged when the user actually sees an ETA from the model, not when they open the app; users who never reach a restaurant card only add noise. <strong>CUPED</strong> uses each user's metric from before the test to remove part of the natural user-to-user variation, so the same effect is visible with fewer users.</p>
  <h3>How many users? The sample size formula, worked</h3>
  <p>Before starting, you must know how many users each group needs. Too few, and a real improvement is lost in the noise. For a conversion rate (did the visit become an order?), with p₁ the current rate and p₂ the rate you hope for:</p>
  <p><code>n per group = (z<sub>α/2</sub> + z<sub>β</sub>)² × [p₁(1−p₁) + p₂(1−p₂)] / (p₂ − p₁)²</code></p>
  <p>Here z<sub>α/2</sub> = 1.96 for a 5% false-alarm rate, and z<sub>β</sub> = 0.84 for 80% <strong>power</strong> (the chance of catching a real effect of that size). Trace it for Biteful's 5% conversion and a hoped-for +2% relative lift (5% → 5.1%):</p>
  <table class="tbl">
    <tr><th>Step</th><th>Value</th></tr>
    <tr><td>(1.96 + 0.84)²</td><td>2.8016² = 7.849</td></tr>
    <tr><td>p₁(1−p₁) + p₂(1−p₂)</td><td>0.05×0.95 + 0.051×0.949 = 0.0475 + 0.0484 = 0.0959</td></tr>
    <tr><td>(p₂ − p₁)²</td><td>0.001² = 0.000001</td></tr>
    <tr><td>n</td><td>7.849 × 0.0959 / 0.000001 ≈ <strong>752,700 per group</strong></td></tr>
  </table>
  <div class="fx" data-lang="py">from scipy.stats import norm
import math

def n_per_arm(p_base, rel_lift, alpha=0.05, power=0.8):
    p_new = p_base * (1 + rel_lift)
    z_a = norm.ppf(1 - alpha / 2)          # 1.96 for a two-sided 5% test
    z_b = norm.ppf(power)                  # 0.84 for 80% power
    var = p_base * (1 - p_base) + p_new * (1 - p_new)
    return math.ceil((z_a + z_b) ** 2 * var / (p_new - p_base) ** 2)

p = 0.05                                    # 5% of restaurant-page visits become an order
for lift in [0.10, 0.05, 0.02]:
    n = n_per_arm(p, lift)
    print(f"lift {lift:&gt;4.0%}: {n:&gt;9,} users per arm")

daily_users = 400_000                       # users who open a restaurant page per day
n = n_per_arm(p, 0.02)
for share in [0.10, 0.50]:
    per_arm_per_day = daily_users * share / 2
    print(f"{share:.0%} of traffic in the test -&gt; {math.ceil(n / per_arm_per_day)} days")</div>
<div class="fx" data-lang="text">lift  10%:    31,231 users per arm
lift   5%:   122,121 users per arm
lift   2%:   752,700 users per arm
10% of traffic in the test -&gt; 38 days
50% of traffic in the test -&gt; 8 days</div>
  <p>The first three lines show the key rule: halve the effect you want to detect and you need about <strong>four times</strong> the users, because the difference is squared in the denominator. The last two turn users into calendar days: with 10% of 400,000 daily users, each group gets 20,000 a day and needs 38 days. With 50% it takes 8 days, which we round up to <strong>14</strong> so the test covers two full weeks (weekday and weekend ordering differ).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A medicine trial. Patients get a sealed envelope (assignment), the nurse records when the tablet was actually swallowed (exposure), lab results come in (metric pipeline), and a statistician compares the groups (stats engine). A patient who never took the tablet should not count as "the tablet failed".</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Unit of randomisation</strong>: the thing you flip a coin for. Usually the user, so one person always sees the same version. When users affect each other — the ETA changes rider dispatch, and riders serve both groups — randomise by city zone or time slot (a <strong>switchback</strong> test) instead, or treatment "leaks" into control.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>No sample-size plan. A test with 10,000 users per arm cannot detect a 2% lift that needs 752,700. "No significant difference" then means "we couldn't tell", not "no effect".</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: hash assignment.</b> Asha opens Biteful 20 times a day, served by any of 200 servers. Every time she must land in the same group, without a database lookup on the 60 ms path. How?</div>

  <h2 id="se-hash"><span class="num">03</span>Hash Assignment, Traced</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Storing "user → group" needs a lookup on every request and millions of writes per experiment. Calling <code>random()</code> on each request makes Asha flip between v1 and v2. How can any server compute her group, the same every time, with no storage?</p>
  </div>
  <p>The trick: <strong>compute</strong> the group from the user id. Feed the text <code>"experiment:user"</code> into a hash function — it turns any text into a big number that looks random but is always the same for the same text. Take the number modulo 1,000 to get a <strong>bucket</strong> from 0 to 999. Buckets 0–99 are treatment (10%), the rest control.</p>
  <div class="fx" data-lang="py">import hashlib
from collections import Counter

def bucket(user_id: str, experiment: str, n_buckets: int = 1000) -&gt; int:
    # salt with the experiment name -&gt; each experiment gets an independent split
    key = f"{experiment}:{user_id}".encode()
    return int(hashlib.md5(key).hexdigest()[:8], 16) % n_buckets

def assign(user_id, experiment, treatment_pct=10):
    return "treatment" if bucket(user_id, experiment) &lt; treatment_pct * 10 else "control"

# Trace one user by hand
key = "eta_v2:asha"
h = hashlib.md5(key.encode()).hexdigest()
print("md5 hex   :", h)
print("first 8   :", h[:8], "-&gt; int", int(h[:8], 16))
print("mod 1000  :", int(h[:8], 16) % 1000, "-&gt;", assign("asha", "eta_v2"))
print()
for u in ["asha", "ben", "chitra"]:
    print(u, bucket(u, "eta_v2"), assign(u, "eta_v2"), assign(u, "eta_v2"), assign(u, "promo_banner"))

users = [f"user_{i}" for i in range(100_000)]
print(Counter(assign(u, "eta_v2") for u in users))

# ramp 10% -&gt; 20%: does anyone switch from treatment back to control?
was_t = {u for u in users if assign(u, "eta_v2", 10) == "treatment"}
now_t = {u for u in users if assign(u, "eta_v2", 20) == "treatment"}
print("still treatment after ramp:", len(was_t &amp; now_t), "of", len(was_t))
print("new treatment users:", len(now_t - was_t))

# independence across experiments
both = sum(1 for u in users if assign(u, "eta_v2") == "treatment" and assign(u, "promo_banner") == "treatment")
print("in treatment of both tests:", both, "(expected about", 100_000 * 0.1 * 0.1, ")")</div>
<div class="fx" data-lang="text">md5 hex   : 9bbb30aa4069c4df71238495c9cc6e3e
first 8   : 9bbb30aa -&gt; int 2612736170
mod 1000  : 170 -&gt; control

asha 170 control control control
ben 563 control control treatment
chitra 81 treatment treatment control
Counter({'control': 90051, 'treatment': 9949})
still treatment after ramp: 9949 of 9949
new treatment users: 9986
in treatment of both tests: 1021 (expected about 1000.0 )</div>
  <p>Trace Asha by hand, top four lines. The key is the text <code>eta_v2:asha</code>. MD5 turns it into 32 hex digits, <code>9bbb30aa…</code>. We keep the first 8, <code>9bbb30aa</code>, and read them as a base-16 number: 2,612,736,170. Dividing by 1,000 leaves remainder <strong>170</strong>. 170 is not below 100, so Asha is in <strong>control</strong> — on every server, every time, forever, for this experiment.</p>
  <p>The next lines: Chitra lands in bucket 81 → treatment, and asking again gives the same answer. In <code>promo_banner</code> the key text differs, so Ben, control for ETA, is treatment there. Out of 100,000 users, 9,949 got treatment: close to 10%. Ramping from 10% to 20% means "buckets 0–199" instead of "0–99": all 9,949 treated users stay treated and 9,986 join; nobody flips back. And 1,021 users are in both treatments, about the 10% × 10% = 1,000 that independence predicts.</p>
  <figure class="viz"><svg viewBox="0 0 720 150" width="720" role="img"><text x="10" y="42" font-weight="600">Ramp 10%</text><rect x="120" y="20" width="58" height="34" rx="3" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="149" y="42" text-anchor="middle" class="tm">0–99</text><rect x="178" y="20" width="522" height="34" rx="3" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="439" y="42" text-anchor="middle">buckets 100–999 → control</text><text x="10" y="102" font-weight="600">Ramp 20%</text><rect x="120" y="80" width="116" height="34" rx="3" class="fg" stroke="currentColor" stroke-opacity=".55"/><text x="178" y="102" text-anchor="middle" class="tm">0–199 treated</text><rect x="236" y="80" width="464" height="34" rx="3" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="468" y="102" text-anchor="middle">buckets 200–999 → control</text><text x="360" y="140" text-anchor="middle" class="tm">Buckets 0–99 stay treated after the ramp; 100–199 join them. Nobody flips back.</text></svg><figcaption>Ramping by bucket range only ever adds users to treatment, so user experience stays consistent.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>School sections by roll number. "Roll numbers ending in 0 go to section B" needs no register: any teacher can work out your section from your roll number, any day. Hashing is the same rule, made random-looking so it doesn't follow alphabetical order or joining date.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Hash bucketing</strong>: deterministic assignment by <code>hash(salt + unit_id) mod B</code>. The <strong>salt</strong> (here the experiment name) makes different experiments get different, uncorrelated splits.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using <code>user_id % 2</code>. Every experiment gets the same split, so the same half of users carries every risky change and overlapping tests' effects mix. Sequential ids also track signup date, so "even ids" may be older, more loyal users.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: trusting the numbers.</b> Two weeks later the dashboard says treatment converts better. Before celebrating: is the split itself healthy, and did anyone stop the test early because it looked good?</div>

  <h2 id="se-trust"><span class="num">04</span>Trusting the Numbers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A result is only as good as the groups behind it and the way it was read. How do we detect a broken split, and why is "check the dashboard every morning" dangerous?</p>
  </div>
  <h3>Check 1: sample ratio mismatch (SRM)</h3>
  <p>You planned 50/50. You should get <em>about</em> 50/50. If the split is off by more than luck allows, something is broken: a variant that crashes before logging, bots filtered in one arm only, a redirect that loses users. Then the groups are no longer alike and the result means nothing. A <strong>chi-square test</strong> compares the counts you got with the counts you expected.</p>
  <div class="fx" data-lang="py">from scipy.stats import chisquare

def srm_check(n_control, n_treatment, expected_share=0.5):
    total = n_control + n_treatment
    expected = [total * (1 - expected_share), total * expected_share]
    stat, p = chisquare([n_control, n_treatment], f_exp=expected)
    return stat, p

for c, t in [(500_400, 499_600), (1_008_000, 992_000), (50_800, 49_200)]:
    stat, p = srm_check(c, t)
    flag = "SRM! stop" if p &lt; 0.001 else "ok"
    print(f"{c:&gt;9,} vs {t:&gt;9,}  share={t/(c+t):.4f}  chi2={stat:7.1f}  p={p:.2e}  {flag}")</div>
<div class="fx" data-lang="text">  500,400 vs   499,600  share=0.4996  chi2=    0.6  p=4.24e-01  ok
1,008,000 vs   992,000  share=0.4960  chi2=  128.0  p=1.12e-29  SRM! stop
   50,800 vs    49,200  share=0.4920  chi2=   25.6  p=4.20e-07  SRM! stop</div>
  <p>Trace the middle row. Expected 1,000,000 each. χ² = (8,000)²/1,000,000 + (8,000)²/1,000,000 = 64 + 64 = 128. A χ² of 128 with one degree of freedom has p ≈ 10<sup>−29</sup>: practically impossible by luck. A 49.6% share looks harmless, but with 2 million users it is a clear bug. The first row (49.96%) is normal noise. Teams use a strict cut-off (p &lt; 0.001) so hundreds of tests don't raise false SRM alarms.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school sends 1,000 students on a trip in two buses of 500. At the destination one bus has 470. You don't start the picnic; you first find out where 30 children got off. The missing children are not a random sample.</p>
  </div>
  <h3>Check 2: did someone peek?</h3>
  <p>A test is planned for 14 days. Someone checks every morning and stops the first day p &lt; 0.05. Each look is another chance for noise to cross the line. The simulation runs 2,000 tests where A and B are <em>exactly the same</em>, so every "win" is false.</p>
  <div class="fx" data-lang="py">import numpy as np
from scipy.stats import norm

rng = np.random.default_rng(1)
n_tests, days, per_day, p = 2_000, 14, 2_000, 0.05   # A and B are IDENTICAL
fp_end = fp_peek = 0
for _ in range(n_tests):
    a = rng.binomial(per_day, p, days).cumsum()      # running orders per arm
    b = rng.binomial(per_day, p, days).cumsum()
    n = per_day * np.arange(1, days + 1)
    pooled = (a + b) / (2 * n)
    z = (b / n - a / n) / np.sqrt(pooled * (1 - pooled) * 2 / n)
    pvals = 2 * (1 - norm.cdf(np.abs(z)))
    fp_end += pvals[-1] &lt; 0.05                     # look once, on day 14
    fp_peek += (pvals &lt; 0.05).any()                # look every day, stop at first p&lt;0.05
print(f"false positives, one look at the end: {fp_end / n_tests:.1%}")
print(f"false positives, peeking daily      : {fp_peek / n_tests:.1%}")</div>
<div class="fx" data-lang="text">false positives, one look at the end: 5.8%
false positives, peeking daily      : 23.3%</div>
  <p><code>cumsum()</code> builds the running totals a person would see each morning, and <code>pvals</code> holds one p-value per day. Looking once gives about 5% false winners, as promised (5.8% is simulation noise). Stopping at the first daily p &lt; 0.05 gives <strong>23.3%</strong>: nearly one in four "winning" launches did nothing.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>SRM</strong>: the observed split differs from the designed split by more than chance. <strong>Peeking problem</strong>: repeated significance checks inflate false positives. Fixes: fix the duration up front, or use <strong>sequential tests</strong> (always-valid p-values) designed for continuous monitoring.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"The SRM is small, the effect is big, let's ship." An SRM means the groups differ in unknown ways; the effect can't be trusted until the cause is found. And stopping before full weeks: weekday and weekend users differ, and novelty fades.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the metrics hierarchy.</b> The split is healthy and nobody peeked. The readout shows conversion up — and late orders and cancellations up too. Which number decides?</div>

  <h2 id="se-metrics"><span class="num">05</span>Metrics Hierarchy &amp; Guardrails</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>An experiment measures dozens of numbers, and some will go up while others go down. Without deciding in advance which number is the goal and which ones must not break, every result can be argued either way.</p>
  </div>
  <p>A <strong>metrics hierarchy</strong>, written before the test starts:</p>
  <table class="tbl">
    <tr><th>Level</th><th>Role</th><th>Biteful ETA test</th></tr>
    <tr><td><strong>North star</strong></td><td>The long-term goal; too slow to move in two weeks</td><td>Retained, satisfied customers (orders per customer per month)</td></tr>
    <tr><td><strong>Primary</strong></td><td>The one metric that decides the test</td><td>Conversion (visits that become orders)</td></tr>
    <tr><td><strong>Secondary</strong></td><td>Explains why the primary moved</td><td>Late rate, average ETA shown, MAE</td></tr>
    <tr><td><strong>Guardrails</strong></td><td>Must not get worse, whatever the primary does</td><td>Cancellations (max +0.25 pts), p99 latency, support calls, SRM</td></tr>
  </table>
  <p>Now the readout of v2 (no buffer) vs v1 (buffered), 400,000 visits per arm over two weeks. The counts are the experiment's inputs; the code computes each difference with a 95% confidence interval (two-proportion z-test, <a class="xref" data-note="st_hypothesis">Hypothesis Testing</a>) and applies the decision rule.</p>
  <div class="fx" data-lang="py">import math
from scipy.stats import norm

def compare(name, x_c, n_c, x_t, n_t):
    # two-proportion z-test and a 95% confidence interval for the difference
    pc, pt = x_c / n_c, x_t / n_t
    pooled = (x_c + x_t) / (n_c + n_t)
    z = (pt - pc) / math.sqrt(pooled * (1 - pooled) * (1 / n_c + 1 / n_t))
    se = math.sqrt(pc * (1 - pc) / n_c + pt * (1 - pt) / n_t)
    lo, hi = (pt - pc) - 1.96 * se, (pt - pc) + 1.96 * se
    p = 2 * (1 - norm.cdf(abs(z)))
    print(f"{name:&lt;22} control {pc:6.2%}  treatment {pt:6.2%}  diff {pt-pc:+.2%} "
          f"[{lo:+.2%}, {hi:+.2%}]  p={p:.3g}")
    return pt - pc, lo, hi

# Two weeks of ETA v2 (no buffer) vs v1 (buffered); counts from the experiment's metric pipeline
conv = compare("conversion (primary)", 20_000, 400_000, 20_560, 400_000)
late = compare("late orders", 4_200, 20_000, 9_250, 20_560)
canc = compare("cancellations (guard)", 400, 20_000, 640, 20_560)

GUARD_CANCEL = 0.0025      # cancellations may rise by at most 0.25 percentage points
ship = conv[1] &gt; 0 and canc[2] &lt;= GUARD_CANCEL     # whole CI must stay inside the guardrail
print("primary significant and positive:", conv[1] &gt; 0)
print("guardrail safe (CI upper end &lt;= +0.25 pts):", canc[2] &lt;= GUARD_CANCEL)
print("decision:", "SHIP" if ship else "DO NOT SHIP")</div>
<div class="fx" data-lang="text">conversion (primary)   control  5.00%  treatment  5.14%  diff +0.14% [+0.04%, +0.24%]  p=0.00432
late orders            control 21.00%  treatment 44.99%  diff +23.99% [+23.11%, +24.87%]  p=0
cancellations (guard)  control  2.00%  treatment  3.11%  diff +1.11% [+0.81%, +1.42%]  p=1.35e-12
primary significant and positive: True
guardrail safe (CI upper end &lt;= +0.25 pts): False
decision: DO NOT SHIP</div>
  <p>Read it in hierarchy order. <strong>Primary</strong>: conversion 5.00% → 5.14%, +0.14 points, interval +0.04 to +0.24, p = 0.004 — a real gain; shorter ETAs attract orders. <strong>Secondary</strong>: late orders jump from 21% to 45%, which explains what comes next. <strong>Guardrail</strong>: cancellations 2.00% → 3.11%, and even the low end of the interval (+0.81 points) is far above the +0.25 limit. Decision: <strong>do not ship</strong>. The fix suggested by the secondary metrics: keep v2's accuracy but promise a higher quantile (<a class="xref" data-note="sd_cases">Case Studies</a>), then test again.</p>
  <p>When a guardrail breaches mid-test, rollback must be fast and complete. Fast: the old model stays loaded and warm, and the switch is a <strong>feature flag</strong> (a config value read at runtime), not a redeploy. Complete: roll back the feature pipeline version too, because an old model fed new features is a new, untested system.</p>
  <div class="flow"><span>Guardrail breach</span><span>Alert</span><span>Flag sets treatment to 0%</span><span>Investigate</span><span>Fix &amp; re-ramp from 5%</span></div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The railings on a ghat road. Your goal is to reach the top quickly (primary). The railing doesn't help you go faster, but if the car touches it, you stop and check before going on (guardrail).</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Primary metric</strong>: the pre-registered decision metric. <strong>Guardrail metric</strong>: a metric that blocks a launch if it degrades beyond a set threshold. <strong>Auto-rollback</strong>: an automated rule that returns traffic to the champion on a breach.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Choosing the primary metric after seeing the results ("conversion is up, let's call that the goal"). And rollback that needs a 45-minute build-and-deploy while users suffer.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: interleaving.</b> The ETA test needed 400,000 visits per arm for two weeks. Biteful's "fastest delivery" row is a <em>ranking</em>, and the team has ten candidate rankers. Ten A/B tests would take most of a year. Is there a faster way to compare rankings?</div>

  <h2 id="se-inter"><span class="num">06</span>Interleaving</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Between users, noise is huge: one orders every day, another never. A small difference between two rankers drowns in it. Can each user compare the two rankers themselves?</p>
  </div>
  <p><strong>Interleaving</strong>: show each user <em>one</em> list made by mixing both rankers' results. Every item remembers which ranker brought it. Count whose items the user ordered from. Each user becomes their own comparison, so person-to-person noise cancels.</p>
  <div class="flow"><span>Ranker A list</span><span>Ranker B list</span><span>Team-draft merge</span><span>One list shown</span><span>Credit orders to A or B</span></div>
  <p>Team-draft, step by step: each round, flip a coin for who picks first; each ranker adds its highest item not yet in the list; repeat until the list has k items. A sorts the "fast delivery" row by v1 ETA; B uses v2 ETAs blended with rating.</p>
  <div class="fx" data-lang="py">import random
from scipy.stats import binomtest

def team_draft(a, b, k, seed):
    rng, shown, team = random.Random(seed), [], {}
    while len(shown) &lt; k:
        order = ["A", "B"] if rng.random() &lt; 0.5 else ["B", "A"]  # coin flip per round
        for t in order:
            ranking = a if t == "A" else b
            pick = next(d for d in ranking if d not in team)   # its best unshown item
            shown.append(pick); team[pick] = t
            if len(shown) == k: break
    return shown, team

# "Fast delivery" row: A sorts by v1 ETA, B by v2 ETA blended with rating
ranker_a = ["Dosa Hut", "Idli House", "Biryani Bros", "Pizza Point", "Chai Corner"]
ranker_b = ["Biryani Bros", "Dosa Hut", "Thali Bar", "Momo Stop", "Idli House"]
shown, team = team_draft(ranker_a, ranker_b, k=4, seed=7)
print("shown :", [f"{d}({team[d]})" for d in shown])
clicks = ["Biryani Bros", "Thali Bar"]
print("orders credited to:", [team[d] for d in clicks])

# Many sessions: drop ties, test B's share of decided sessions against 50/50
wins_b, wins_a, ties = 560, 440, 1_500
p = binomtest(wins_b, wins_b + wins_a, 0.5).pvalue
print(f"B preferred in {wins_b/(wins_a+wins_b):.0%} of decided sessions, p={p:.4f}")</div>
<div class="fx" data-lang="text">shown : ['Dosa Hut(A)', 'Biryani Bros(B)', 'Idli House(A)', 'Thali Bar(B)']
orders credited to: ['B', 'B']
B preferred in 56% of decided sessions, p=0.0002</div>
  <p>Round 1: A picks first and takes Dosa Hut; B's top, Biryani Bros, is free, so it takes it. Round 2: A's next unshown is Idli House; B's Dosa Hut is taken, so it takes Thali Bar. The user ordered from Biryani Bros and Thali Bar, both brought by B: B wins this session 2–0. Over 2,500 sessions — 560 won by B, 440 by A, 1,500 ties — a binomial test against 50/50 gives p = 0.0002. Only 1,000 decided sessions were needed.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Picking teams for gully cricket. Two captains toss a coin, then take turns choosing their best remaining player. At the end you see whose picks scored the runs.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Interleaving</strong>: an online comparison of two rankers where each user sees a merged list and engagement is credited to the ranker that contributed the item. Typically 10–100× more sensitive than A/B for ranking preference (<a class="xref" data-note="ml_rs_ranking">Ranking &amp; Evaluation</a>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Interleaving tells you which ranker users prefer, not the revenue lift or long-term effect. Screen many rankers with it, then A/B test the winner on business metrics.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: feedback loops.</b> Both rankers learn from orders on restaurants they showed. A restaurant neither ever shows never earns an order, so it never looks good, so it is never shown. Is the model quietly choosing its own homework?</div>

  <h2 id="se-loops"><span class="num">07</span>Feedback Loops</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Every experiment so far assumed the data is a fair record of the world. But the logged data is a record of what <em>our model chose to show</em>. What happens when tomorrow's training data is made by today's model?</p>
  </div>
  <p>Biteful's Kothrud row shows the top 3 of 10 restaurants. Orders only happen on shown restaurants, so only they get labels. Restaurant #9 opened last week: no history, estimated rate 0, never in the top 3 — yet it is truly the best (12% order rate). Simulate 20,000 sessions with and without an exploration slot (10% of the time, the third slot shows a random other restaurant):</p>
  <div class="fx" data-lang="py">import numpy as np

# 10 restaurants in Kothrud; true chance a customer orders when it is shown in the top 3
true = np.array([.10, .09, .08, .07, .07, .06, .06, .05, .05, .12])   # #9 is new AND the best
hist_shown = np.array([500] * 9 + [0]); hist_orders = np.round(true * hist_shown); hist_orders[:9] += [5, 4, 2, 0, 1, 0, 2, 0, 1]

def run(eps, sessions=20_000, seed=0):
    rng = np.random.default_rng(seed)
    shown, orders = hist_shown.astype(float).copy(), hist_orders.astype(float).copy()
    for _ in range(sessions):
        est = np.where(shown &gt; 0, orders / np.maximum(shown, 1), 0.0)   # never shown -&gt; estimate 0
        top = list(np.argsort(-est)[:3])
        if rng.random() &lt; eps:                                          # exploration slot
            top[2] = rng.choice([r for r in range(10) if r not in top[:2]])
        for r in top:
            shown[r] += 1
            orders[r] += rng.random() &lt; true[r]     # labels exist ONLY for what we showed
    est = orders / np.maximum(shown, 1)
    return shown, est, orders.sum() - hist_orders.sum()

for eps in [0.0, 0.1]:
    shown, est, gained = run(eps)
    print(f"explore {eps:.0%}: best restaurant (#9) shown {int(shown[9]):&gt;6,} times, "
          f"estimated rate {est[9]:.3f} (true 0.120); top 3 now {np.argsort(-est)[:3].tolist()}; orders {int(gained):,}")</div>
<div class="fx" data-lang="text">explore 0%: best restaurant (#9) shown      0 times, estimated rate 0.000 (true 0.120); top 3 now [0, 1, 2]; orders 5,392
explore 10%: best restaurant (#9) shown 14,889 times, estimated rate 0.119 (true 0.120); top 3 now [9, 0, 1]; orders 6,008</div>
  <p>Without exploration, #9 is shown <strong>0</strong> times in 20,000 sessions; its estimate stays 0, and the model is more confident every day in restaurants 0, 1, 2. With 10% exploration, #9 gets a chance, its estimate climbs to 0.119 (true 0.120), it becomes #1, and total orders rise from 5,392 to 6,008 (+11%). A small, deliberate "waste" of slots paid for itself many times.</p>
  <figure class="viz"><svg viewBox="0 0 640 196" width="640" role="img"><defs><marker id="sm-m3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs><rect x="30" y="20" width="180" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".55"/><text x="120" y="46" text-anchor="middle" font-weight="600">Model ranks items</text><rect x="430" y="20" width="180" height="44" rx="6" class="fb" stroke="currentColor" stroke-opacity=".55"/><text x="520" y="46" text-anchor="middle" font-weight="600">Users see top items</text><rect x="430" y="130" width="180" height="44" rx="6" class="ft" stroke="currentColor" stroke-opacity=".55"/><text x="520" y="149" text-anchor="middle" font-weight="600">Clicks logged</text><text x="520" y="163" text-anchor="middle" class="tm">only on shown items</text><rect x="30" y="130" width="180" height="44" rx="6" class="fs" stroke="currentColor" stroke-opacity=".55"/><text x="120" y="156" text-anchor="middle" font-weight="600">Training data</text><line x1="212" y1="42" x2="427" y2="42" stroke="currentColor" stroke-width="1.4" marker-end="url(#sm-m3)"/><line x1="520" y1="66" x2="520" y2="127" stroke="currentColor" stroke-width="1.4" marker-end="url(#sm-m3)"/><line x1="428" y1="152" x2="213" y2="152" stroke="currentColor" stroke-width="1.4" marker-end="url(#sm-m3)"/><line x1="120" y1="128" x2="120" y2="67" stroke="currentColor" stroke-width="1.4" marker-end="url(#sm-m3)"/><text x="320" y="96" text-anchor="middle" class="tr" font-weight="600">degenerate loop:</text><text x="320" y="112" text-anchor="middle" class="tr">unshown items never earn data</text></svg><figcaption>The model creates its own training data. Without exploration it keeps confirming its past choices.</figcaption></figure>
  <p>The ETA has its own loops. The shown ETA changes who orders: customers who see "55 min" and leave never create a label, so long-wait situations are under-represented in training. And riders who see a tight promise hurry, making the ETA partly self-fulfilling. Fraud is the nastiest: blocked payments never complete, so you never learn whether the block was right.</p>
  <table class="tbl">
    <tr><th>Loop</th><th>Effect</th><th>Mitigation</th></tr>
    <tr><td>Recommendations</td><td>Popular gets more popular; new restaurants starve</td><td>Exploration slots, bandits, popularity debiasing, inverse propensity weighting</td></tr>
    <tr><td>ETA</td><td>Long-ETA situations rarely labelled; behaviour adapts to the promise</td><td>Log shown ETA and use it as context; small randomised holdouts</td></tr>
    <tr><td>Fraud blocking</td><td>Blocked payments never get a label</td><td>Let a tiny random sample through or to analyst review</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cricket selector who only watches the players he already picked. He never sees the others play, so he keeps picking the same team and feels more confident every season. Exploration is giving a few net-practice players a match.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Degenerate feedback loop</strong>: the model's outputs decide its future training data, so errors and biases reinforce themselves. <strong>Exploration</strong>: deliberately showing options the model is unsure about, to collect labels.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reading "the model is getting more confident" as "the model is getting better". In the 0% run confidence grew while the best restaurant stayed invisible.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: bandits.</b> 10% random exploration worked, but it is blunt: it keeps "wasting" slots on restaurants we already know are poor. Can we explore where we are uncertain and exploit where we are sure, automatically?</div>

  <h2 id="se-bandit"><span class="num">08</span>Bandits: Exploring on Purpose</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>An A/B/C test of three promo banners gives each a third of traffic until the end, so two thirds of customers see worse banners the whole time. A greedy system never tries the others. Is there a middle path that learns and earns at once?</p>
  </div>
  <p>The lost value has a name: <strong>regret</strong>, the clicks you missed compared with always showing the best option. A <strong>multi-armed bandit</strong> starts by trying all options and shifts traffic towards the winner as evidence builds. (The name: slot machines are "one-armed bandits"; which arm should you pull next?)</p>
  <p><strong>Thompson sampling</strong>: for each banner keep clicks (wins) and non-clicks (losses). For every visitor, draw one plausible click rate for each banner from a Beta(wins, losses) distribution and show the banner with the highest draw. Little data → wide, random draws, so it is still tried; lots of clicks → high, confident draws, so it wins most rounds.</p>
  <div class="fx" data-lang="py">import numpy as np

true_ctr = [0.040, 0.050, 0.065]          # three promo banners; nobody knows these
n_users = 30_000

def ab_test(rng):
    arms = rng.integers(0, 3, n_users)    # fixed equal split
    clicks = rng.random(n_users) &lt; np.take(true_ctr, arms)
    return clicks.sum(), np.bincount(arms, minlength=3)

def thompson(rng):
    wins = np.ones(3); losses = np.ones(3)     # Beta(1,1) prior per arm
    shown = np.zeros(3, int); total = 0
    for _ in range(n_users):
        arm = np.argmax(rng.beta(wins, losses))   # sample a plausible CTR per arm, pick the max
        click = rng.random() &lt; true_ctr[arm]
        wins[arm] += click; losses[arm] += 1 - click
        shown[arm] += 1; total += click
    return total, shown

rng = np.random.default_rng(42)
c_ab, s_ab = ab_test(rng)
c_ts, s_ts = thompson(rng)
best = n_users * max(true_ctr)
print("A/B      clicks:", c_ab, "shown per arm:", s_ab.tolist(), "regret:", round(best - c_ab))
print("Thompson clicks:", c_ts, "shown per arm:", s_ts.tolist(), "regret:", round(best - c_ts))</div>
<div class="fx" data-lang="text">A/B      clicks: 1572 shown per arm: [10049, 10028, 9923] regret: 378
Thompson clicks: 1920 shown per arm: [338, 865, 28797] regret: 30</div>
  <p>The best possible is 30,000 × 6.5% = 1,950 clicks. The fixed split shows each banner to ~10,000 people and loses 378 clicks. Thompson sampling notices banner 3 quickly, shows it 28,797 times, and loses only 30. The line <code>arm = np.argmax(rng.beta(wins, losses))</code> is the whole algorithm; the next line updates the counts.</p>
  <table class="tbl">
    <tr><th></th><th>A/B test</th><th>Multi-armed bandit</th></tr>
    <tr><td>Traffic</td><td>Fixed split</td><td>Shifts toward the winner</td></tr>
    <tr><td>Goal</td><td>Clean causal estimate</td><td>Maximise reward while learning</td></tr>
    <tr><td>Regret</td><td>Higher (378 above)</td><td>Lower (30 above)</td></tr>
    <tr><td>Best for</td><td>Launch decisions, long-term metrics (the ETA model)</td><td>Banners, headlines, exploration slots, short-lived options</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A new office worker trying lunch places. In week one she tries all three. By week three she goes to the good dosa place most days but still tries the others now and then, in case they improved.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>ε-greedy</strong>: show the best arm, but a random arm with probability ε (our 10% slot). <strong>UCB</strong>: pick the arm with the highest "average + uncertainty bonus". <strong>Thompson sampling</strong>: sample from each arm's posterior and pick the highest sample.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using a bandit to decide a big launch. Traffic is uneven and shifts over time, so the effect estimate is biased, and slow effects (cancellations, retention next month) are never measured. Bandits optimise; A/B tests decide.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: common mistakes.</b> The toolbox is complete. Which misuses break experiments most often?</div>

  <h2 id="se-mistakes"><span class="num">09</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each tool above has a typical way of being misused. Which ones turn a careful experiment into a misleading one?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: shipping on offline wins</span><p>v2's MAE 1.27 vs 3.15 hid a late rate of 50% vs 0%. Test online.</p></div>
  <div class="callout trap"><span class="label">Trap: random assignment per request</span><p>One user sees both versions, results mix, samples are no longer independent. Hash the user id (or zone/time for marketplaces).</p></div>
  <div class="callout trap"><span class="label">Trap: counting everyone, not exposed users</span><p>Users who never saw an ETA dilute the effect towards zero and waste weeks of traffic.</p></div>
  <div class="callout trap"><span class="label">Trap: no sample size plan</span><p>10,000 per arm cannot detect a lift that needs 752,700.</p></div>
  <div class="callout trap"><span class="label">Trap: ignoring SRM and peeking</span><p>A broken split or daily stopping makes any result untrustworthy (23.3% false winners). Check SRM first; fix the duration.</p></div>
  <div class="callout trap"><span class="label">Trap: no guardrails</span><p>Conversion +0.14 pts with cancellations +1.11 pts is a loss. Pre-register the hierarchy.</p></div>
  <div class="callout trap"><span class="label">Trap: interference</span><p>ETA v2 changes rider dispatch, and riders serve both groups. Randomise by zone or time slot when units interact.</p></div>
  <div class="callout trap"><span class="label">Trap: no exploration</span><p>Rankers trained only on their own exposures never discover new restaurants (#9 shown 0 times).</p></div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> From an offline win to a launch decision, on one page.</div>

  <h2 id="se-connect"><span class="num">10</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How do these tools depend on each other, which question does each answer, and what did each give on Biteful?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 700 250" width="700" role="img">
    <defs><marker id="se-c0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L10,5L0,10z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="155" height="50" rx="6" class="fv" stroke="currentColor" stroke-opacity=".5"/><text x="87" y="40" text-anchor="middle" font-size="12" font-weight="600">Offline win</text><text x="87" y="57" text-anchor="middle" font-size="10" class="tm">MAE 1.27 vs 3.15</text>
    <rect x="185" y="20" width="155" height="50" rx="6" class="fb" stroke="currentColor" stroke-opacity=".5"/><text x="262" y="40" text-anchor="middle" font-size="12" font-weight="600">Hash assignment</text><text x="262" y="57" text-anchor="middle" font-size="10" class="tm">Asha → 170 → control</text>
    <rect x="360" y="20" width="155" height="50" rx="6" class="fb" stroke="currentColor" stroke-opacity=".5"/><text x="437" y="40" text-anchor="middle" font-size="12" font-weight="600">Sample size</text><text x="437" y="57" text-anchor="middle" font-size="10" class="tm">752,700/arm, 14 days</text>
    <rect x="535" y="20" width="155" height="50" rx="6" class="fr" stroke="currentColor" stroke-opacity=".5"/><text x="612" y="40" text-anchor="middle" font-size="12" font-weight="600">Trust checks</text><text x="612" y="57" text-anchor="middle" font-size="10" class="tm">SRM χ² 128; peek 23%</text>
    <rect x="535" y="110" width="155" height="50" rx="6" class="fg" stroke="currentColor" stroke-opacity=".5"/><text x="612" y="130" text-anchor="middle" font-size="12" font-weight="600">Hierarchy decides</text><text x="612" y="147" text-anchor="middle" font-size="10" class="tm">+0.14 conv, +1.11 canc</text>
    <rect x="360" y="110" width="155" height="50" rx="6" class="fs" stroke="currentColor" stroke-opacity=".5"/><text x="437" y="130" text-anchor="middle" font-size="12" font-weight="600">Ship or roll back</text><text x="437" y="147" text-anchor="middle" font-size="10" class="tm">flag → 0%</text>
    <rect x="10" y="110" width="155" height="50" rx="6" class="ft" stroke="currentColor" stroke-opacity=".5"/><text x="87" y="130" text-anchor="middle" font-size="12" font-weight="600">Interleaving</text><text x="87" y="147" text-anchor="middle" font-size="10" class="tm">560–440, p 0.0002</text>
    <rect x="185" y="110" width="155" height="50" rx="6" class="ft" stroke="currentColor" stroke-opacity=".5"/><text x="262" y="130" text-anchor="middle" font-size="12" font-weight="600">Screens rankers</text><text x="262" y="147" text-anchor="middle" font-size="10" class="tm">winner → A/B</text>
    <rect x="10" y="190" width="330" height="44" rx="6" class="fv" stroke="currentColor" stroke-opacity=".5"/><text x="175" y="210" text-anchor="middle" font-size="12" font-weight="600">Feedback loop → exploration → bandit</text><text x="175" y="226" text-anchor="middle" font-size="10" class="tm">#9 shown 0 → 14,889; regret 378 → 30</text>
    <line x1="165" y1="45" x2="182" y2="45" stroke="currentColor" marker-end="url(#se-c0)"/>
    <line x1="340" y1="45" x2="357" y2="45" stroke="currentColor" marker-end="url(#se-c0)"/>
    <line x1="515" y1="45" x2="532" y2="45" stroke="currentColor" marker-end="url(#se-c0)"/>
    <line x1="612" y1="70" x2="612" y2="107" stroke="currentColor" marker-end="url(#se-c0)"/>
    <line x1="535" y1="135" x2="518" y2="135" stroke="currentColor" marker-end="url(#se-c0)"/>
    <line x1="165" y1="135" x2="182" y2="135" stroke="currentColor" marker-end="url(#se-c0)"/>
    <path d="M340,135 H350 V95 H262 V73" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#se-c0)"/>
    <path d="M437,160 V212 H343" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#se-c0)"/>
    <text x="520" y="230" text-anchor="middle" font-size="10" class="tm">logged results become the next training data</text>
  </svg><figcaption>Top row and right: the A/B path from an offline win to a decision. Left: the faster path for rankers. Bottom: the loop that every launch feeds.</figcaption></figure>
  <table class="tbl"><caption>Every experiment concept on Biteful</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on Biteful</th><th>When to use</th></tr>
    <tr><td>Offline/online gap</td><td>offline metrics vs user reactions</td><td>why test at all?</td><td>v2 MAE 1.27 but 50% late; ETA 3 min shorter</td><td>every launch</td></tr>
    <tr><td>A/B infrastructure</td><td>assignment + exposure + metrics + stats</td><td>causal effect?</td><td>4 components; exposure = saw an ETA</td><td>launch decisions</td></tr>
    <tr><td>Sample size</td><td>(z<sub>α/2</sub>+z<sub>β</sub>)² · var / Δ²</td><td>how many users, how long?</td><td>752,700/arm; 8 → 14 days</td><td>before starting</td></tr>
    <tr><td>Hash assignment</td><td>md5(exp:user) mod 1000</td><td>stable group, no storage?</td><td>Asha 170 control; Chitra 81 treatment</td><td>every experiment</td></tr>
    <tr><td>SRM check</td><td>χ² on group sizes</td><td>is the split broken?</td><td>1,008,000 vs 992,000: χ² 128</td><td>first look at any result</td></tr>
    <tr><td>Peeking control</td><td>fixed duration / sequential tests</td><td>did we stop on noise?</td><td>5.8% → 23.3% false winners</td><td>always</td></tr>
    <tr><td>Metrics hierarchy</td><td>north star, primary, guardrails</td><td>which number decides?</td><td>conv +0.14 pts, canc +1.11 pts → no ship</td><td>pre-registered</td></tr>
    <tr><td>Interleaving</td><td>team-draft merge + credit</td><td>which ranker, fast?</td><td>560–440, p 0.0002</td><td>screening rankers</td></tr>
    <tr><td>Feedback loop / exploration</td><td>labels only on shown items</td><td>is the model choosing its homework?</td><td>#9 shown 0 vs 14,889; orders +11%</td><td>any system whose outputs make its data</td></tr>
    <tr><td>Bandit</td><td>Beta posteriors, argmax of samples</td><td>learn and earn at once?</td><td>regret 30 vs 378</td><td>short-lived options</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p><strong>Offline metrics choose candidates; only a well-built A/B test (stable hashing, exposure logging, enough users, SRM and peeking checks, a pre-registered hierarchy with guardrails) decides launches; interleaving speeds that up for rankers; and because every launched model writes the data the next one learns from, exploration — blunt or bandit — keeps the loop honest.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet.</b> After it, <a class="xref" data-note="sd_cases">Case Studies</a> runs the whole track — framework, serving, monitoring, experiments — on four complete designs.</div>

  <h2 id="se-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The note on one page. Running example: Biteful's ETA v2 (unbiased, MAE 1.27, 50% late) vs v1 (+3-min buffer, MAE 3.15, 0% late) on orders 101–108; users Asha (bucket 170, control), Ben (563), Chitra (81, treatment); conversion 5%.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>On Biteful</th><th>Weakness → next</th></tr>
    <tr><td>Offline ≠ online</td><td>lower MAE, ship?</td><td>v2 50% late, 3 min shorter</td><td>need users → A/B</td></tr>
    <tr><td>A/B infrastructure</td><td>fair comparison?</td><td>752,700/arm, 14 days</td><td>group per user? → hashing</td></tr>
    <tr><td>Hash assignment</td><td>stable, stateless?</td><td>md5 → 170 → control</td><td>trust result? → SRM, peeking</td></tr>
    <tr><td>Trust checks</td><td>split healthy? stopped early?</td><td>χ² 128; 23.3% vs 5.8%</td><td>which number? → hierarchy</td></tr>
    <tr><td>Hierarchy &amp; guardrails</td><td>ship?</td><td>+0.14 conv, +1.11 canc → no</td><td>slow for rankers → interleaving</td></tr>
    <tr><td>Interleaving</td><td>which ranker, fast?</td><td>560–440, p 0.0002</td><td>own homework → loops</td></tr>
    <tr><td>Feedback loops</td><td>model makes its data?</td><td>#9 shown 0 vs 14,889</td><td>explore smarter → bandits</td></tr>
    <tr><td>Bandits</td><td>learn and earn?</td><td>regret 30 vs 378</td><td>→ case studies</td></tr>
  </table>
  <h3>Formulas and numbers</h3>
  <table class="tbl">
    <tr><th>Formula</th><th>Symbols</th><th>On Biteful</th></tr>
    <tr><td>bucket = int(md5(exp:user)[:8], 16) mod 1000</td><td>salt = experiment name</td><td>2,612,736,170 mod 1000 = 170</td></tr>
    <tr><td>treatment if bucket &lt; pct × 10</td><td>pct = treatment %</td><td>10%: buckets 0–99</td></tr>
    <tr><td>n = (z<sub>α/2</sub> + z<sub>β</sub>)² [p₁(1−p₁) + p₂(1−p₂)] / (p₂ − p₁)²</td><td>1.96, 0.84; p₁ now, p₂ hoped</td><td>7.849 × 0.0959 / 10<sup>−6</sup> ≈ 752,700</td></tr>
    <tr><td>χ² = Σ (observed − expected)² / expected</td><td>SRM, 1 degree of freedom</td><td>64 + 64 = 128</td></tr>
    <tr><td>diff ± 1.96 × √(p<sub>c</sub>(1−p<sub>c</sub>)/n<sub>c</sub> + p<sub>t</sub>(1−p<sub>t</sub>)/n<sub>t</sub>)</td><td>95% interval for a difference in rates</td><td>conversion +0.14% [+0.04, +0.24]</td></tr>
    <tr><td>regret = best possible − achieved</td><td>reward missed</td><td>1,950 − 1,572 = 378; 1,950 − 1,920 = 30</td></tr>
  </table>
  <h3>Definitions</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td>Control, treatment, exposure</td><td>old version; new version; user actually saw the changed thing</td></tr>
    <tr><td>Unit of randomisation, switchback</td><td>what gets a coin flip; randomising by zone/time when users interact</td></tr>
    <tr><td>Power, CUPED</td><td>chance to detect a real effect; variance reduction with pre-test data</td></tr>
    <tr><td>SRM, peeking, sequential test</td><td>broken split; repeated looks; tests valid under continuous monitoring</td></tr>
    <tr><td>North star, primary, guardrail</td><td>long-term goal; decision metric; must-not-worsen metric</td></tr>
    <tr><td>Interleaving (team-draft)</td><td>merged list, credit to the contributing ranker</td></tr>
    <tr><td>Feedback loop, exploration</td><td>outputs shape future data; showing uncertain options on purpose</td></tr>
    <tr><td>ε-greedy, UCB, Thompson</td><td>random ε share; optimism bonus; sample from posteriors</td></tr>
  </table>
  <h3>Use / avoid</h3>
  <div class="cards">
    <div><b>Use</b><p>The rollout ladder; salted hash assignment by user (zone/time if users interact); exposure-based analysis; a sample size and full weeks fixed in advance; SRM first; a pre-registered hierarchy with guardrails and flag rollback; interleaving to screen rankers; exploration slots; bandits for short-lived choices.</p></div>
    <div><b>Avoid</b><p>Launching on offline wins; per-request randomisation; <code>user_id % 2</code>; counting unexposed users; daily stopping; ignoring SRM; picking the primary after the fact; bandits for launch decisions; rankers that never explore.</p></div>
  </div>
  <h3>Five rapid-fire checks</h3>
  <ol>
    <li>md5("eta_v2:asha") starts 9bbb30aa = 2,612,736,170. Group at 10% treatment? <em>Bucket 170 ≥ 100 → control.</em></li>
    <li>Halve the lift you want to detect. Users needed? <em>About 4× (the difference is squared).</em></li>
    <li>1,008,000 vs 992,000 in a 50/50 test. Proceed? <em>No: χ² = 128, p ≈ 10<sup>−29</sup>, SRM.</em></li>
    <li>Conversion +0.14 pts (significant), cancellations +1.11 pts (limit +0.25). Ship? <em>No: guardrail breached.</em></li>
    <li>Why did restaurant #9 get 0 impressions without exploration? <em>No history → estimate 0 → never in the top 3 → never labelled: a feedback loop.</em></li>
  </ol>

  <h2 id="se-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Shadow vs canary vs A/B: what does each prove?</summary><div class="qa-body">Shadow: the model runs correctly on real traffic with zero exposure. Canary: it isn't broken for a small share of real users. A/B: it causes a better outcome than the champion. Only the A/B test measures the business effect.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write a deterministic assignment function.</summary><div class="qa-body"><code>bucket = int(md5(f"{exp}:{user_id}").hexdigest()[:8], 16) % 1000</code>; treatment if <code>bucket &lt; pct*10</code>. Stable per user, salted per experiment, uniform, no storage, and ramping only adds users to treatment.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why salt the hash with the experiment name?</summary><div class="qa-body">Without it every experiment puts the same users in treatment: overlapping tests' effects get confounded and the same users carry all the risk.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Base conversion 5%. Users per arm for a 2% relative lift at α = 0.05, power 80%?</summary><div class="qa-body">(1.96 + 0.84)² × (0.05·0.95 + 0.051·0.949) / 0.001² ≈ 752,700 per arm. With 400k eligible users/day and 50% in the test that is 8 days; run 14 for full weeks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A PM checks the dashboard daily and wants to stop when p &lt; 0.05. What do you say?</summary><div class="qa-body">That inflates false positives: with 14 daily looks at identical A and B, 23% of tests "won" instead of 5%. Fix the duration in advance or use a sequential method.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why might an ETA experiment need switchback (zone × time) randomisation?</summary><div class="qa-body">ETAs influence dispatch and rider behaviour, and riders serve both groups in a zone. Treatment then leaks into control (interference). Randomising whole zones or time slots keeps the groups separate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use interleaving instead of A/B?</summary><div class="qa-body">Comparing ranking models in search/recommendations with many candidates and limited traffic. Each user sees both rankers, so far fewer users are needed. Confirm the winner with an A/B test on business metrics.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Bandit or A/B for choosing among 20 promo banners for a weekend sale?</summary><div class="qa-body">Bandit: options are many and short-lived, and the goal is maximising clicks now, not a precise effect estimate (regret 30 vs 378 in our 3-arm simulation).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Treatment is +3% on day 2 and +0.5% on day 14. What happened?</summary><div class="qa-body">Likely a novelty effect: users explore the change, then return to habits. Run full weekly cycles and look at the effect over time and for new vs returning users.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What guardrails would you set for a new ETA model?</summary><div class="qa-body">Cancellation rate, late-order rate, "where is my order?" contacts, p99 latency and error rate of the ETA service, rider overtime, SRM. Breach of any → automatic rollback by flag, even if conversion is up.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the A/B infrastructure depend on serving's logging?</summary><div class="qa-body">The analysis needs exposure events (who saw which model's ETA) and the outcomes joined to them. Those come from the same request-path logs serving writes; without them you can't restrict to exposed users, check SRM, or join late/cancel outcomes per variant.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how do offline champion–challenger results and the A/B test relate?</summary><div class="qa-body">Champion–challenger (monitoring) decides whether a retrain is worth testing, using logged data. The A/B test decides whether it ships, using user reactions that logs can't contain. v2 won the first (lower MAE) and lost the second (cancellations).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip exploration but keep retraining nightly?</summary><div class="qa-body">Each night's data contains labels only for what the current model showed. Retraining reinforces its choices; new or under-shown restaurants never get labels (shown 0 times in our run), and monitoring can't detect what was never logged. Offline evaluation on that data is biased too.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why is a guardrail breach a reason to go back to the framework's metric step?</summary><div class="qa-body">It shows the primary metric doesn't capture the goal on its own: shorter ETAs raised conversion but broke promises. The fix is in framing (promise a quantile, measure on-time rate), not in more testing.</div></details>
</main>`
});
