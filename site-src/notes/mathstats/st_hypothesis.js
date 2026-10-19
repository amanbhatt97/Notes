// notes/mathstats/st_hypothesis.js — Hypothesis Testing
Object.assign(TOPIC_CONTENT, {
  "st_hypothesis": `<main>
  <h1>Hypothesis Testing</h1>
  <div class="where"><span>Mathematics &amp; Statistics</span><span>Statistics</span><span>Hypothesis Testing</span></div>
  <p class="lead">Every dataset is a little noisy. Hypothesis testing is the method for deciding whether a difference you see is real or just luck. Every A/B test, model comparison and "did the change help?" question runs on it, and interviewers probe the p-value definition and test choice hardest. This note follows one story: an online shop has built a <strong>one-page checkout</strong> and runs small pilot studies before the big experiment. Each step of testing is built on it, by hand first and then in Python: the question and H₀, the test statistic, its sampling distribution, the p-value, α and the two errors, confidence intervals, power and sample size, then the family of tests (z, t, paired, χ², ANOVA, rank tests) and what happens when you run many of them.</p>

  <h2 id="sht-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 680 110" width="680"><defs><marker id="sht-trk" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs><rect x="10.0" y="20" width="100" height="56" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="60.0" y="42" text-anchor="middle" font-size="11">Descriptive</text><text x="60.0" y="58" text-anchor="middle" class="tm" font-size="9.5">summarise one column</text><line x1="110.0" y1="48" x2="120.0" y2="48" stroke="currentColor" marker-end="url(#sht-trk)"/><rect x="122.0" y="20" width="100" height="56" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="172.0" y="42" text-anchor="middle" font-size="11">Probability</text><text x="172.0" y="58" text-anchor="middle" class="tm" font-size="9.5">quantify uncertainty</text><line x1="222.0" y1="48" x2="232.0" y2="48" stroke="currentColor" marker-end="url(#sht-trk)"/><rect x="234.0" y="20" width="100" height="56" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="284.0" y="42" text-anchor="middle" font-size="11">Distributions</text><text x="284.0" y="58" text-anchor="middle" class="tm" font-size="9.5">named shapes of chance</text><line x1="334.0" y1="48" x2="344.0" y2="48" stroke="currentColor" marker-end="url(#sht-trk)"/><rect x="346.0" y="20" width="100" height="56" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="396.0" y="42" text-anchor="middle" font-size="11">Correlation</text><text x="396.0" y="58" text-anchor="middle" class="tm" font-size="9.5">two columns together</text><line x1="446.0" y1="48" x2="456.0" y2="48" stroke="currentColor" marker-end="url(#sht-trk)"/><rect x="458.0" y="20" width="100" height="56" rx="8" class="fg sg" stroke-width="3"/><text x="508.0" y="42" text-anchor="middle" font-size="11.5" font-weight="700">Hypothesis Testing</text><text x="508.0" y="58" text-anchor="middle" class="tm" font-size="9.5">real or luck?</text><text x="508.0" y="96" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text><line x1="558.0" y1="48" x2="568.0" y2="48" stroke="currentColor" marker-end="url(#sht-trk)"/><rect x="570.0" y="20" width="100" height="56" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="620.0" y="42" text-anchor="middle" font-size="11">A/B Testing</text><text x="620.0" y="58" text-anchor="middle" class="tm" font-size="9.5">decide with an experiment</text></svg><figcaption>The Statistics track, in reading order. Each note answers a question the previous one left open.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="st_correlation">Correlation &amp; Relationships</a></b><span>We measured how two variables move together and met one test already: r = 0.994 on 5 students came with "p = 0.0005", while pure noise gave |r| &gt; 0.8 one time in ten. Left open: what exactly is a p-value, and how do we decide "real or luck" for <em>any</em> pattern: a mean, a difference between groups, a rate, a table of counts? From <a class="xref" data-note="st_distributions">Distributions</a> we bring the CLT and the t, χ² and F curves.</span></li>
    <li><b>This note adds: the general recipe for "real or luck?"</b><span>H₀ and H₁, a test statistic, its sampling distribution under H₀, the p-value, α and the two kinds of error, confidence intervals, power and sample size, then the family of tests for each kind of data, and the correction for running many tests.</span></li>
    <li><b>Leads to: <a class="xref" data-note="st_abtesting">A/B Testing</a></b><span>Our pilot found +3 pp conversion with p = 0.036, but its power to detect a realistic +1 pp was only 11%, and pilots don't randomise traffic in production. The next note runs the full experiment on the same checkout: metrics, randomisation, sample size (14,749 per arm), sanity checks, peeking and the business decision.</span></li>
  </ol>

  <h2 id="sht-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. All numbers come from the one-page-checkout pilots.</p>
  <ol class="story">
    <li><b>The question, H₀ and H₁</b><span>Q: "is the new checkout better?" How do we make that testable? → Assume the boring answer (H₀: no preference) and ask how rare our data would be under it: 9 of 10 testers prefer the new page; under H₀ that happens 22 times in 1,024. But counting outcomes only works for tiny yes/no data…</span></li>
    <li><b>Test statistic</b><span>Q: how do we squeeze numeric data (checkout seconds) into one number measuring "distance from H₀"? → (estimate − H₀ value)/SE: 5 shoppers average 27 s vs the old 30 s; t = −3/0.707 = −4.24. But is −4.24 big or normal?</span></li>
    <li><b>Sampling distribution</b><span>Q: what values of t does luck alone produce? → If H₀ is true, t follows the t-curve with n − 1 = 4 df (100,000 simulated pilots agree). But we need one number for "how surprising is ours"…</span></li>
    <li><b>p-value</b><span>Q: how often would luck give a t at least this extreme? → The tail area beyond ±4.24: p = 0.013. But at what p do we act, and what can go wrong when we do?</span></li>
    <li><b>α and the two errors</b><span>Q: when do we reject, and how often are we wrong? → Fix α = 0.05 in advance: reject (0.013 &lt; 0.05). False alarms (Type I) happen at rate α, misses (Type II) at rate β. But "reject" says nothing about how much faster…</span></li>
    <li><b>Confidence interval</b><span>Q: how big is the effect, with honest uncertainty? → 27 ± 2.776 × 0.707 = 25.0 to 29.0 s; excludes 30 exactly when p &lt; 0.05. But a small pilot gives wide intervals and can miss real effects…</span></li>
    <li><b>Power &amp; sample size</b><span>Q: how likely are we to catch a real effect, and how many users do we need? → The 1,000-per-arm pilot has only 11% power for +1 pp; 80% needs 14,749 per arm. Then: the t-test fits means of one group; what about other data?</span></li>
    <li><b>z-test for proportions</b><span>Q: conversion is yes/no; how do we compare two rates? → z = (p₂ − p₁)/SE: 13% vs 10% on 1,000 each, z = 2.10, p = 0.036. But checkout time has two groups of different shoppers, or the same shopper twice…</span></li>
    <li><b>t-tests: Welch and paired</b><span>Q: two groups of means? → Welch t = diff/√(s₁²/n₁ + s₂²/n₂) = 3.10; the same 8 testers on both pages: paired t = 7.10 vs 0.93 unpaired. But some data are counts in categories, or 3+ groups…</span></li>
    <li><b>χ² and ANOVA</b><span>Q: counts in a table, or more than two groups? → χ² = Σ(O − E)²/E: device × bought 11.94; ANOVA F = between/within: three button colours F = 19. But all these use means and variances, which one whale wrecks…</span></li>
    <li><b>Rank (non-parametric) tests</b><span>Q: what if outliers or ratings break the mean? → Compare ranks: one ₹90,000 order makes Welch p = 0.38, Mann-Whitney p = 0.003. Then: how to choose among all these tests?</span></li>
    <li><b>Which test when</b><span>Q: given a question, which test? → Three questions: outcome type, number/pairing of groups, badly behaved data. But the dashboard runs one test per metric…</span></li>
    <li><b>Multiple testing</b><span>Q: what if we run 20 tests? → At α = 0.05 each, P(at least one false alarm) = 64%. Bonferroni (α/m) or Benjamini-Hochberg (FDR). Next note: put the whole recipe into a real product experiment.</span></li>
  </ol>

  <h2 id="sht-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Hypothesis Testing</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Logic</div>
        <ul>
          <li>💡 <b>Courtroom</b> — H₀ innocent until data proves otherwise</li>
          <li><b>H₀</b> — no effect; <b>H₁</b> — there is an effect</li>
          <li><b>Lab test</b> — 9 of 10 prefer new: two-sided p = 22/1024 = 0.021</li>
          <li><b>Flow</b> — hypotheses → α → statistic → sampling distribution → p → decide</li>
          <li>⚠ "fail to reject" ≠ "H₀ is true"; pick one/two-sided before looking</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Statistic, distribution, p</div>
        <ul>
          <li><b>Statistic</b> — <code>(estimate − H₀ value) / SE</code>; SE = s/√n</li>
          <li><b>By hand</b> — [27,25,28,26,29] vs 30: s 1.58, SE 0.707, t −4.24</li>
          <li><b>Under H₀</b> — t ~ t(4); 97.5% point 2.776 (simulated 2.796)</li>
          <li><b>p</b> — P(|T| ≥ 4.24 | H₀) = 0.013; 12 shoppers p 0.011</li>
          <li>⚠ p is not P(H₀ true); small p ≠ big effect</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">α, errors, CI, power</div>
        <ul>
          <li><b>α</b> — false-alarm rate chosen in advance; simulated 0.048</li>
          <li><b>Type I</b> rate α · <b>Type II</b> rate β · <b>power</b> 1 − β</li>
          <li><b>CI</b> — 27 ± 2.776 × 0.707 = [25.04, 28.96]; 958/1000 cover</li>
          <li><b>Power</b> — 2.5 SE effect, one-sided → 0.80; d = 0.5 needs 64/group</li>
          <li><b>Pilot</b> — 1 pp lift, 1,000/arm → power 0.11; need 14,749</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">z and t</div>
        <ul>
          <li><b>z (proportions)</b> — 13% vs 10%, pooled SE 0.0143, z 2.10, p 0.036</li>
          <li>CI [+0.2, +5.8] pp; 2×2 χ² = z² = 4.42</li>
          <li><b>Welch</b> — √(s₁²/n₁ + s₂²/n₂); [31,33,35] vs [28,29,30]: t 3.10, p 0.055</li>
          <li><b>Paired</b> — one-sample t on differences: 7.10 (unpaired 0.93)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">χ², ANOVA, ranks</div>
        <ul>
          <li><b>χ²</b> — Σ(O − E)²/E, E = row × col / total: device 11.94 (Yates 11.28)</li>
          <li><b>ANOVA</b> — F = (SSB/(k−1))/(SSW/(N−k)) = 19 → Tukey HSD</li>
          <li><b>Mann-Whitney</b> — U = pairs won: 3 of 9</li>
          <li><b>Whale</b> — Welch p 0.38, Mann-Whitney 0.003</li>
          <li>t → MW · paired → Wilcoxon · ANOVA → Kruskal</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Choosing &amp; many tests</div>
        <ul>
          <li><b>Ask</b> — outcome type? groups/pairing? badly behaved?</li>
          <li>20 tests at 0.05 → 1 − 0.95²⁰ = 64% false-alarm risk</li>
          <li><b>Bonferroni</b> — p &lt; α/m (FWER) → 1 discovery</li>
          <li><b>BH</b> — p₍ᵢ₎ ≤ (i/m)α (FDR) → 3 discoveries</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sht-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="sht-court"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Question, H₀ &amp; H₁</span><span class="rm-sub">9 of 10 testers, by counting</span></div></div>
      <div class="rm-item rm-done" data-target="sht-stat"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Test Statistic</span><span class="rm-sub">Checkout seconds, t by hand</span></div></div>
      <div class="rm-item rm-done" data-target="sht-samp"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Sampling Distribution</span><span class="rm-sub">What luck alone produces</span></div></div>
      <div class="rm-item rm-done" data-target="sht-p"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The p-value</span><span class="rm-sub">Tail areas and misreadings</span></div></div>
      <div class="rm-item rm-done" data-target="sht-err"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">α and the Two Errors</span><span class="rm-sub">Type I, Type II</span></div></div>
      <div class="rm-item rm-done" data-target="sht-ci"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Confidence Intervals</span><span class="rm-sub">What 95% really means</span></div></div>
      <div class="rm-item rm-done" data-target="sht-power"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Power &amp; Sample Size</span><span class="rm-sub">Planning before data</span></div></div>
      <div class="rm-item rm-done" data-target="sht-z"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">z-test for Proportions</span><span class="rm-sub">Conversion 13% vs 10%</span></div></div>
      <div class="rm-item rm-done" data-target="sht-t"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Welch &amp; Paired t</span><span class="rm-sub">Two groups, or the same twice</span></div></div>
      <div class="rm-item rm-done" data-target="sht-chi"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">χ² &amp; ANOVA</span><span class="rm-sub">Count tables, 3+ groups</span></div></div>
      <div class="rm-item rm-done" data-target="sht-np"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Rank Tests</span><span class="rm-sub">When a whale breaks the mean</span></div></div>
      <div class="rm-item rm-done" data-target="sht-which"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Which Test When</span><span class="rm-sub">Three questions, one table</span></div></div>
      <div class="rm-item rm-done" data-target="sht-multi"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Multiple Testing</span><span class="rm-sub">Bonferroni and BH by hand</span></div></div>
      <div class="rm-item rm-done" data-target="sht-connect"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One recipe, one table</span></div></div>
      <div class="rm-item rm-done" data-target="sht-traps"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">p-hacking, defaults, pairing</span></div></div>
      <div class="rm-item rm-done" data-target="sht-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="sht-qa"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="sht-court"><span class="num">01</span>The Question, H₀ and H₁</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The Correlation note ended with a p-value we used without explaining. More generally: when data shows a difference, how do we decide whether it is real or something luck alone could easily produce?</p>
  </div>
  <h3>The running example: a one-page checkout</h3>
  <p>An online shop has a three-step checkout. The team builds a one-page version and wants to know if it is better. Before risking real traffic, they run small pilot studies, and each section of this note uses one of them:</p>
  <table class="tbl">
    <tr><th>Pilot</th><th>Data</th><th>Section</th></tr>
    <tr><td>Usability lab: which page do testers prefer?</td><td>9 of 10 prefer the new page</td><td>01</td></tr>
    <tr><td>Checkout time on the new page (old page: 30 s on average, from years of logs)</td><td>5 shoppers: 27, 25, 28, 26, 29 s; then 12 shoppers</td><td>02–07</td></tr>
    <tr><td>Conversion pilot, 1,000 shoppers per page</td><td>old 100 buyers (10%), new 130 (13%)</td><td>07–08</td></tr>
    <tr><td>Checkout time, separate shoppers per page; and the same 8 testers on both</td><td>old 31, 33, 35 vs new 28, 29, 30 s; 8 pairs</td><td>09</td></tr>
    <tr><td>New page: buying by device; three button colours</td><td>2×2 count table; items per basket</td><td>10</td></tr>
    <tr><td>Order values with one huge order</td><td>₹ per shopper</td><td>11</td></tr>
    <tr><td>The launch dashboard</td><td>20 metrics, 8 p-values</td><td>13</td></tr>
  </table>
  <p>Without a method, people see a pattern in every wiggle: sales go from 100 to 104 the day after a change, and the team celebrates, though sales jump around by 5 or 10 on normal days. Hypothesis testing asks one thing: "could plain luck easily give a result like this?"</p>
  <p>The idea in plain words: start by assuming <strong>nothing special is happening</strong>. Work out what results luck alone would usually produce. If your actual result would be very rare under "nothing is happening", you stop believing that assumption.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An Indian courtroom. The accused is presumed innocent. The prosecutor must bring evidence so strong that "innocent" becomes hard to believe ("beyond reasonable doubt"). If the evidence is weak, the verdict is "not guilty", which is not the same as "proved innocent". It only means the evidence was not enough.</p>
  </div>
  <h3>By hand: 9 of 10 testers prefer the new page</h3>
  <p>Ten testers try both pages and each names a favourite. Nine pick the new one. Is that a real preference?</p>
  <ol>
    <li><strong>Assume nothing special (H₀)</strong>: testers have no real preference; each pick is a fair coin, P(new) = 0.5.</li>
    <li><strong>List what luck can do</strong>: 10 picks have 2¹⁰ = 1024 equally likely patterns.</li>
    <li><strong>Count results at least as extreme as ours</strong>: 9 "new" can happen in 10 ways (which tester picked old), 10 "new" in 1 way. That is 11. Extreme in the other direction (1 or 0 "new") is another 11. Total 22.</li>
    <li><strong>Share</strong>: 22 / 1024 = 0.021. With no real preference, a split this lopsided appears only about 2 times in 100.</li>
    <li><strong>Decide</strong>: we agreed beforehand that "rarer than 5 in 100" is too rare to blame on luck. 0.021 &lt; 0.05, so we doubt "no preference".</li>
  </ol>
  <figure class="viz"><svg viewBox="0 0 600 210" width="600"><line x1="60" y1="170" x2="560" y2="170" stroke="currentColor" stroke-opacity=".5"/><rect x="70" y="169.5" width="34" height="1.0" class="fr sr"/><text x="87.0" y="185" text-anchor="middle" font-size="11">0</text><text x="87.0" y="164.5" text-anchor="middle" font-size="10" class="tm">1</text><rect x="114" y="165.2" width="34" height="4.8" class="fr sr"/><text x="131.0" y="185" text-anchor="middle" font-size="11">1</text><text x="131.0" y="160.2" text-anchor="middle" font-size="10" class="tm">10</text><rect x="158" y="148.6" width="34" height="21.4" class="fb sb"/><text x="175.0" y="185" text-anchor="middle" font-size="11">2</text><text x="175.0" y="143.6" text-anchor="middle" font-size="10" class="tm">45</text><rect x="202" y="112.9" width="34" height="57.1" class="fb sb"/><text x="219.0" y="185" text-anchor="middle" font-size="11">3</text><text x="219.0" y="107.9" text-anchor="middle" font-size="10" class="tm">120</text><rect x="246" y="70.0" width="34" height="100.0" class="fb sb"/><text x="263.0" y="185" text-anchor="middle" font-size="11">4</text><text x="263.0" y="65.0" text-anchor="middle" font-size="10" class="tm">210</text><rect x="290" y="50.0" width="34" height="120.0" class="fb sb"/><text x="307.0" y="185" text-anchor="middle" font-size="11">5</text><text x="307.0" y="45.0" text-anchor="middle" font-size="10" class="tm">252</text><rect x="334" y="70.0" width="34" height="100.0" class="fb sb"/><text x="351.0" y="185" text-anchor="middle" font-size="11">6</text><text x="351.0" y="65.0" text-anchor="middle" font-size="10" class="tm">210</text><rect x="378" y="112.9" width="34" height="57.1" class="fb sb"/><text x="395.0" y="185" text-anchor="middle" font-size="11">7</text><text x="395.0" y="107.9" text-anchor="middle" font-size="10" class="tm">120</text><rect x="422" y="148.6" width="34" height="21.4" class="fb sb"/><text x="439.0" y="185" text-anchor="middle" font-size="11">8</text><text x="439.0" y="143.6" text-anchor="middle" font-size="10" class="tm">45</text><rect x="466" y="165.2" width="34" height="4.8" class="fr sr"/><text x="483.0" y="185" text-anchor="middle" font-size="11">9</text><text x="483.0" y="160.2" text-anchor="middle" font-size="10" class="tm">10</text><rect x="510" y="169.5" width="34" height="1.0" class="fr sr"/><text x="527.0" y="185" text-anchor="middle" font-size="11">10</text><text x="527.0" y="164.5" text-anchor="middle" font-size="10" class="tm">1</text><text x="310" y="202" text-anchor="middle" font-size="11" class="tm">testers (of 10) preferring the new checkout (counts out of 1024 equally likely patterns)</text><text x="70" y="22" font-size="11" class="tr">red = as extreme as 9 of 10, either way: 1+10+10+1 = 22 of 1024 = 0.021</text></svg><figcaption>If testers have no real preference (a fair coin each), this is how often each count turns up. 9 or more (or 1 or fewer) happens in only 22 of the 1024 equally likely patterns. That share is the p-value.</figcaption></figure>
  <p>That 0.021 is the <strong>p-value</strong>. Now let scipy check the counting. <code>binomtest</code> does exactly the steps above for any count of successes (it is the Binomial distribution from the Distributions note).</p>
  <div class="fx" data-lang="py">from scipy import stats
from math import comb
import numpy as np
p_one = sum(comb(10, k) for k in (9, 10)) / 2**10      # 9 or 10 of 10 prefer the new checkout
print("P(&gt;=9 of 10) =", p_one, "  two-sided =", 2 * p_one)
r = stats.binomtest(9, n=10, p=0.5)                     # two-sided by default
print(f"binomtest p = {r.pvalue:.4f}")
print(f"one-sided p = {stats.binomtest(9, n=10, p=0.5, alternative='greater').pvalue:.4f}")</div>
  <div class="fx" data-lang="text">P(&gt;=9 of 10) = 0.0107421875   two-sided = 0.021484375
binomtest p = 0.0215
one-sided p = 0.0107</div>
  <p><code>comb(10, k)</code> counts the patterns with k "new" picks, so the first line is our hand count, 11/1024. Doubling it covers the "too many prefer old" side: that is a <strong>two-sided</strong> test. <code>binomtest</code> agrees: 0.0215. The <code>alternative='greater'</code> line asks only "too many prefer new?" and gives half, 0.0107.</p>
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
  <div class="flow"><span>State H₀ / H₁</span><span>Choose α (before data)</span><span>Compute statistic</span><span>Its distribution under H₀</span><span>Get p-value</span><span>p &lt; α → reject H₀</span></div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>H₀ (null hypothesis)</strong>: the boring explanation, "no effect, no difference" (no preference). <strong>H₁ (alternative)</strong>: what you suspect (a preference). <strong>Two-sided</strong> H₁: different in either direction. <strong>One-sided</strong>: only one direction counts. <strong>α (significance level)</strong>: the rarity cut-off you choose in advance, usually 0.05.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Choose one- or two-sided and α <em>before</em> looking at the data. Seeing 9 of 10 and then saying "I only cared about preference for the new page" halves p after the fact. That is quiet cheating, and interviewers know it.</p>
  </div>
  <p>Where you meet it: A/B tests on websites and apps, "is model B really better than model A on the test set?", drug trials, quality checks on a factory line, and almost every statistics interview.</p>
  <div class="bridge"><b>What this still can't tell us → next: Test statistic.</b> Counting all 1,024 patterns works for 10 yes/no picks. Checkout <em>times</em> are numbers like 27.3 s; we cannot list every possible outcome. We need to squeeze the data into one number whose behaviour under H₀ is known.</div>

  <h2 id="sht-stat"><span class="num">02</span>The Test Statistic</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Five shoppers on the new page take 27, 25, 28, 26 and 29 seconds. The old page averages 30 s. "3 seconds faster" sounds good, but how do we measure that distance in a way that accounts for how much times naturally wobble?</p>
  </div>
  <p>The idea: measure the gap between what you saw and what H₀ claims, then divide by how big gaps usually are by luck. "3 seconds faster" means nothing alone. "3 seconds faster when luck usually moves the average by only 0.7 s" means a lot.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Your Ola driver says "10 minutes away". He arrives in 13. Is he lying? If his estimates are usually off by 5 minutes, a 3-minute miss is normal. If they are usually off by 30 seconds, a 3-minute miss is suspicious. The gap only means something compared with the usual wobble.</p>
  </div>
  <h3>A one-sample t statistic by hand</h3>
  <p>H₀: μ = 30 (μ, "mu", is the new page's true long-run mean checkout time; H₀ says it is no different from the old page). H₁: μ ≠ 30.</p>
  <table class="tbl out"><caption>Step by step</caption>
    <tr><th>Step</th><th>Work</th><th>Result</th></tr>
    <tr><td>1. Sample mean x̄</td><td>(27 + 25 + 28 + 26 + 29) / 5</td><td>27</td></tr>
    <tr><td>2. Deviations x − x̄</td><td>0, −2, 1, −1, 2</td><td></td></tr>
    <tr><td>3. Squared deviations</td><td>0, 4, 1, 1, 4</td><td>sum = 10</td></tr>
    <tr><td>4. Sample variance s²</td><td>10 / (n − 1) = 10 / 4</td><td>2.5</td></tr>
    <tr><td>5. Standard deviation s</td><td>√2.5</td><td>1.581</td></tr>
    <tr><td>6. Standard error SE</td><td>s / √n = 1.581 / √5</td><td>0.707</td></tr>
    <tr><td>7. t statistic</td><td>(x̄ − 30) / SE = −3 / 0.707</td><td><strong>−4.24</strong></td></tr>
  </table>
  <p>The <strong>standard error</strong> (step 6) is the typical wobble of a sample <em>mean</em>, not of one shopper: by the CLT from the <a class="xref" data-note="st_distributions">Distributions</a> note, averages wobble less than single values, by a factor √n. So t = −4.24 says "the sample mean sits 4.24 standard errors below what H₀ predicts".</p>
  <div class="fx" data-lang="py">small = np.array([27, 25, 28, 26, 29])          # 5 shoppers, seconds to check out (new page)
n = len(small)
mean = small.mean()
dev = small - mean
print("deviations:", dev, " squared:", dev**2, " sum:", (dev**2).sum())
sd = small.std(ddof=1)                          # divide by n-1
se = sd / np.sqrt(n)
t = (mean - 30) / se                            # H0: mu = 30 s (the old page's long-run mean)
print(f"mean={mean} sd={sd:.3f} se={se:.3f} t={t:.3f}")</div>
  <div class="fx" data-lang="text">deviations: [ 0. -2.  1. -1.  2.]  squared: [0. 4. 1. 1. 4.]  sum: 10.0
mean=27.0 sd=1.581 se=0.707 t=-4.243</div>
  <p><code>std(ddof=1)</code> divides by n − 1, matching step 4 (NumPy's default <code>ddof=0</code> divides by n and gives a slightly smaller number, a classic bug). The rest is the table, line for line.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Test statistic</strong>: a single number computed from the sample that measures how far the data is from H₀, usually (estimate − H₀ value) / SE: the distance from H₀ in units of noise. <strong>Standard error</strong>: the standard deviation of an estimate over repeated samples; for a mean, SE = s/√n.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Dividing by the standard deviation s (1.58) instead of the standard error s/√n (0.707) makes every effect look 2.2 times smaller. The statistic is about the <em>mean</em>, so it uses the mean's wobble.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Sampling distribution.</b> t = −4.24 is "4.24 standard errors away". Is that rare? To know, we need the list of t values luck alone produces when H₀ is true.</div>

  <h2 id="sht-samp"><span class="num">03</span>The Sampling Distribution</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>If the new page were truly no faster (μ = 30), and we ran this 5-shopper pilot again and again, what spread of t values would we see? Only then can we say whether −4.24 is unusual.</p>
  </div>
  <p>The idea: a statistic is random, because the sample is random. Its distribution over many imaginary repeats of the study, assuming H₀ is true, is its <strong>sampling distribution under H₀</strong>. For a mean with σ unknown and roughly normal data, the <a class="xref" data-note="st_distributions">Distributions</a> note already gave the answer: <strong>t with n − 1 degrees of freedom</strong>. Here we see it happen.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>To know whether a 45-minute commute is unusual, you need to know your normal commutes: mostly 30–40 minutes, rarely over 45. The sampling distribution is "the normal commutes" for t when nothing special is happening.</p>
  </div>
  <h3>Simulating 100,000 pilots where H₀ is true</h3>
  <p>The code invents 100,000 pilots of 5 shoppers whose true mean <em>is</em> 30 (times normal with σ = 2), computes each pilot's t, and compares with the t(4) table.</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
sims = rng.normal(30, 2, size=(100000, 5))      # 100,000 pilots of 5 shoppers, H0 TRUE (mean 30)
m = sims.mean(axis=1)
s = sims.std(axis=1, ddof=1)
t_sim = (m - 30) / (s / np.sqrt(5))             # the t each pilot would report
z_sim = (m - 30) / (2 / np.sqrt(5))             # same, if we knew sigma = 2
print("97.5% point: simulated t", round(np.quantile(t_sim, 0.975), 3),
      " t(4) table", round(stats.t.ppf(0.975, 4), 3), " simulated z", round(np.quantile(z_sim, 0.975), 3))
print("share of pilots with |t| &gt;= 4.243:", np.mean(np.abs(t_sim) &gt;= 4.243))
print("share with |t| &gt;= 1.96:", round(np.mean(np.abs(t_sim) &gt;= 1.96), 3))</div>
  <div class="fx" data-lang="text">97.5% point: simulated t 2.796  t(4) table 2.776  simulated z 1.965
share of pilots with |t| &gt;= 4.243: 0.01346
share with |t| &gt;= 1.96: 0.121</div>
  <p>The simulated t values put 97.5% below 2.796; the t(4) table says 2.776: same curve, up to simulation noise. If we knew σ (z instead of t), the cut-off would be the normal's 1.96. Using s from only 5 shoppers adds wobble, so t's tails are fatter. In fact 12% of pilots would pass |t| ≥ 1.96: using the normal's cut-off with 5 shoppers would give 12% false alarms instead of 5%. And only 1.35% of the 100,000 pilots reached |t| ≥ 4.24.</p>
  <figure class="viz"><svg viewBox="0 0 600 185" width="600"><path d="M112.9,150V148.5H121.3V150M122.1,150V148.0H130.4V150M131.2,150V147.5H139.6V150M140.4,150V147.0H148.8V150M149.6,150V146.0H157.9V150M158.7,150V145.2H167.1V150M167.9,150V144.1H176.3V150M177.1,150V142.3H185.4V150M186.2,150V139.1H194.6V150M195.4,150V136.7H203.8V150M204.6,150V132.9H212.9V150M213.7,150V129.2H222.1V150M222.9,150V122.4H231.3V150M232.1,150V115.2H240.4V150M241.2,150V106.3H249.6V150M250.4,150V94.8H258.8V150M259.6,150V81.4H267.9V150M268.7,150V70.8H277.1V150M277.9,150V57.8H286.3V150M287.1,150V49.3H295.4V150M296.2,150V42.5H304.6V150M305.4,150V43.0H313.8V150M314.6,150V50.6H322.9V150M323.7,150V57.4H332.1V150M332.9,150V70.3H341.3V150M342.1,150V81.6H350.4V150M351.2,150V94.1H359.6V150M360.4,150V105.4H368.8V150M369.6,150V114.5H377.9V150M378.7,150V122.4H387.1V150M387.9,150V128.2H396.3V150M397.1,150V133.3H405.4V150M406.2,150V137.1H414.6V150M415.4,150V140.5H423.8V150M424.6,150V141.2H432.9V150M433.7,150V143.1H442.1V150M442.9,150V145.1H451.3V150M452.1,150V145.7H460.4V150M461.2,150V147.0H469.6V150M470.4,150V147.4H478.8V150M479.6,150V147.9H487.9V150M488.7,150V148.2H497.1V150" class="fb" opacity=".55"/><path d="M30.4,150V147.0H38.8V150M39.6,150V147.0H47.9V150M48.7,150V147.0H57.1V150M57.9,150V147.0H66.3V150M67.1,150V147.0H75.4V150M76.2,150V147.0H84.6V150M85.4,150V147.0H93.8V150M94.6,150V147.0H102.9V150M103.7,150V147.0H112.1V150M497.9,150V147.0H506.3V150M507.1,150V147.0H515.4V150M516.2,150V147.0H524.6V150M525.4,150V147.0H533.8V150M534.6,150V147.0H542.9V150M543.7,150V147.0H552.1V150M552.9,150V147.0H561.3V150M562.1,150V147.0H570.4V150M571.2,150V147.0H579.6V150" class="fr sr"/><path d="M30.0,149.7 L34.6,149.6 L39.2,149.6 L43.7,149.6 L48.3,149.5 L52.9,149.5 L57.5,149.5 L62.1,149.4 L66.7,149.4 L71.3,149.3 L75.8,149.2 L80.4,149.2 L85.0,149.1 L89.6,149.0 L94.2,148.9 L98.8,148.8 L103.3,148.7 L107.9,148.6 L112.5,148.4 L117.1,148.3 L121.7,148.1 L126.3,147.9 L130.8,147.7 L135.4,147.4 L140.0,147.1 L144.6,146.8 L149.2,146.4 L153.8,146.0 L158.3,145.5 L162.9,145.0 L167.5,144.4 L172.1,143.7 L176.7,142.9 L181.2,142.0 L185.8,141.0 L190.4,139.8 L195.0,138.5 L199.6,137.0 L204.2,135.2 L208.8,133.3 L213.3,131.1 L217.9,128.5 L222.5,125.7 L227.1,122.5 L231.7,118.9 L236.2,114.9 L240.8,110.5 L245.4,105.6 L250.0,100.3 L254.6,94.7 L259.2,88.7 L263.8,82.4 L268.3,76.1 L272.9,69.7 L277.5,63.6 L282.1,57.9 L286.7,52.9 L291.2,48.7 L295.8,45.5 L300.4,43.5 L305.0,42.9 L309.6,43.5 L314.2,45.5 L318.8,48.7 L323.3,52.9 L327.9,57.9 L332.5,63.6 L337.1,69.7 L341.7,76.1 L346.3,82.4 L350.8,88.7 L355.4,94.7 L360.0,100.3 L364.6,105.6 L369.2,110.5 L373.8,114.9 L378.3,118.9 L382.9,122.5 L387.5,125.7 L392.1,128.5 L396.7,131.1 L401.2,133.3 L405.8,135.2 L410.4,137.0 L415.0,138.5 L419.6,139.8 L424.2,141.0 L428.8,142.0 L433.3,142.9 L437.9,143.7 L442.5,144.4 L447.1,145.0 L451.7,145.5 L456.2,146.0 L460.8,146.4 L465.4,146.8 L470.0,147.1 L474.6,147.4 L479.2,147.7 L483.8,147.9 L488.3,148.1 L492.9,148.3 L497.5,148.4 L502.1,148.6 L506.7,148.7 L511.2,148.8 L515.8,148.9 L520.4,149.0 L525.0,149.1 L529.6,149.2 L534.2,149.2 L538.8,149.3 L543.3,149.4 L547.9,149.4 L552.5,149.5 L557.1,149.5 L561.7,149.5 L566.2,149.6 L570.8,149.6 L575.4,149.6 L580.0,149.7" fill="none" class="sb" stroke-width="2"/><path d="M30.0,150.0 L34.6,150.0 L39.2,150.0 L43.7,150.0 L48.3,150.0 L52.9,150.0 L57.5,150.0 L62.1,150.0 L66.7,150.0 L71.3,150.0 L75.8,150.0 L80.4,150.0 L85.0,150.0 L89.6,150.0 L94.2,150.0 L98.8,150.0 L103.3,150.0 L107.9,150.0 L112.5,150.0 L117.1,150.0 L121.7,150.0 L126.3,149.9 L130.8,149.9 L135.4,149.9 L140.0,149.8 L144.6,149.8 L149.2,149.6 L153.8,149.5 L158.3,149.3 L162.9,149.1 L167.5,148.7 L172.1,148.3 L176.7,147.7 L181.2,147.0 L185.8,146.1 L190.4,145.0 L195.0,143.6 L199.6,141.9 L204.2,139.9 L208.8,137.4 L213.3,134.6 L217.9,131.3 L222.5,127.4 L227.1,123.1 L231.7,118.3 L236.2,113.0 L240.8,107.2 L245.4,101.0 L250.0,94.5 L254.6,87.8 L259.2,80.9 L263.8,74.0 L268.3,67.2 L272.9,60.8 L277.5,54.8 L282.1,49.4 L286.7,44.8 L291.2,41.0 L295.8,38.3 L300.4,36.6 L305.0,36.0 L309.6,36.6 L314.2,38.3 L318.8,41.0 L323.3,44.8 L327.9,49.4 L332.5,54.8 L337.1,60.8 L341.7,67.2 L346.3,74.0 L350.8,80.9 L355.4,87.8 L360.0,94.5 L364.6,101.0 L369.2,107.2 L373.8,113.0 L378.3,118.3 L382.9,123.1 L387.5,127.4 L392.1,131.3 L396.7,134.6 L401.2,137.4 L405.8,139.9 L410.4,141.9 L415.0,143.6 L419.6,145.0 L424.2,146.1 L428.8,147.0 L433.3,147.7 L437.9,148.3 L442.5,148.7 L447.1,149.1 L451.7,149.3 L456.2,149.5 L460.8,149.6 L465.4,149.8 L470.0,149.8 L474.6,149.9 L479.2,149.9 L483.8,149.9 L488.3,150.0 L492.9,150.0 L497.5,150.0 L502.1,150.0 L506.7,150.0 L511.2,150.0 L515.8,150.0 L520.4,150.0 L525.0,150.0 L529.6,150.0 L534.2,150.0 L538.8,150.0 L543.3,150.0 L547.9,150.0 L552.5,150.0 L557.1,150.0 L561.7,150.0 L566.2,150.0 L570.8,150.0 L575.4,150.0 L580.0,150.0" fill="none" class="sr" stroke-width="1.5" stroke-dasharray="4 3"/><line x1="30" y1="150" x2="580" y2="150" stroke="currentColor" stroke-opacity=".5"/><text x="30.0" y="165" text-anchor="middle" font-size="10.5">-6</text><text x="121.7" y="165" text-anchor="middle" font-size="10.5">-4</text><text x="213.3" y="165" text-anchor="middle" font-size="10.5">-2</text><text x="305.0" y="165" text-anchor="middle" font-size="10.5">0</text><text x="396.7" y="165" text-anchor="middle" font-size="10.5">2</text><text x="488.3" y="165" text-anchor="middle" font-size="10.5">4</text><text x="580.0" y="165" text-anchor="middle" font-size="10.5">6</text><line x1="110.5" y1="150" x2="110.5" y2="95" class="sr" stroke-width="1.2"/><line x1="499.5" y1="150" x2="499.5" y2="95" class="sr" stroke-width="1.2"/><text x="110.5" y="90" text-anchor="middle" font-size="10.5">our t = −4.24</text><text x="499.5" y="90" text-anchor="middle" font-size="10.5">+4.24</text><text x="300.0" y="180" text-anchor="middle" font-size="10.5" class="tm">t from 100,000 pilots of 5 shoppers when H₀ is true (bars) · t(4) curve (solid) · N(0,1) (dashed)</text></svg><figcaption>The sampling distribution of t under H₀. The bars come from simulation, the solid curve is the t-distribution with 4 df from the Distributions note, and they agree. The dashed normal is too thin in the tails. Only 1.3% of pilots land beyond ±4.24 (red, barely visible): that share is the p-value.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Sampling distribution</strong> of a statistic: its probability distribution over repeated samples of the same size from the same population. <strong>Null distribution</strong>: the sampling distribution assuming H₀ is true. For T = (X̄ − μ₀)/(s/√n) with normal data, the null distribution is t(n − 1); for large n it is close to N(0, 1).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Every test's guarantee depends on its null distribution being right. Wrong independence (one user counted many times), heavy outliers or tiny skewed samples change the real distribution, and the p-values that follow are wrong even if the arithmetic is perfect.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The p-value.</b> We now have the curve of "normal" t values and our t = −4.24. We need one number that says how far into the tail we are.</div>

  <h2 id="sht-p"><span class="num">04</span>The p-value</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Given the null curve t(4) and our t = −4.24, how do we summarise "how surprising" in one number?</p>
  </div>
  <p>Take the area of the null curve at least as far out as our t, on both sides (two-sided H₁): that is the <strong>p-value</strong>. By the simulation, 1.35% of pilots reached |t| ≥ 4.24. The exact t(4) curve gives 1.32%. This is the one step you cannot do with a pen: read it from a t-table or let scipy do it.</p>
  <div class="fx" data-lang="py">p = 2 * stats.t.sf(abs(t), df=n-1)              # area in both tails beyond |t|
print(f"p = {p:.4f}")
r5 = stats.ttest_1samp(small, popmean=30)
print(f"ttest_1samp: t={r5.statistic:.3f} p={r5.pvalue:.4f} df={r5.df}")
times = np.array([29, 26, 31, 25, 27, 30, 24, 28, 32, 26, 27, 29])   # 12 shoppers
r12 = stats.ttest_1samp(times, popmean=30)
print(f"12 shoppers: mean={times.mean():.2f} t={r12.statistic:.3f}  p={r12.pvalue:.4f}  df={r12.df}")</div>
  <div class="fx" data-lang="text">p = 0.0132
ttest_1samp: t=-4.243 p=0.0132 df=4
12 shoppers: mean=27.83 t=-3.072  p=0.0106  df=11</div>
  <p><code>stats.t.sf(abs(t), df)</code> is the "survival function": the area to the right of |t|. Times 2 gives both tails. <code>ttest_1samp</code> does steps 1–9 in one call: t = −4.243, p = 0.0132. The same test on 12 shoppers (mean 27.83 s) gives t = −3.07, p = 0.0106. The picture shows what that means.</p>
  <figure class="viz"><svg viewBox="0 0 560 190" width="560"><line x1="30" y1="162" x2="548" y2="162" stroke="currentColor" stroke-opacity=".5"/><text x="112.2" y="177" text-anchor="middle" font-size="11">−3.07</text><text x="173.9" y="177" text-anchor="middle" font-size="11">−2</text><text x="289" y="177" text-anchor="middle" font-size="11">0</text><text x="404.1" y="177" text-anchor="middle" font-size="11">2</text><text x="465.8" y="177" text-anchor="middle" font-size="11">3.07</text><text x="548" y="157" text-anchor="end" font-size="11" class="tm">t</text><path d="M465.8,162 L465.8,158.7 L471.7,159.3 L477.6,159.7 L483.4,160.1 L489.3,160.4 L495.2,160.7 L501,160.9 L506.9,161.1 L512.8,161.3 L518.6,161.4 L524.5,161.5 L530.4,161.6 L536.3,161.6 L542.1,161.7 L548,161.7 L548,162 Z" class="fr" stroke="none"/><path d="M30,162 L30,161.7 L35.9,161.7 L41.7,161.6 L47.6,161.6 L53.5,161.5 L59.4,161.4 L65.2,161.3 L71.1,161.1 L77,160.9 L82.8,160.7 L88.7,160.4 L94.6,160.1 L100.4,159.7 L106.3,159.3 L112.2,158.7 L112.2,162 Z" class="fr" stroke="none"/><path d="M30,161.7 L38.8,161.7 L47.6,161.6 L56.3,161.4 L65.1,161.3 L73.9,161 L82.7,160.7 L91.5,160.3 L100.2,159.8 L109,159 L117.8,158.1 L126.6,156.9 L135.4,155.3 L144.1,153.2 L152.9,150.6 L161.7,147.2 L170.5,143 L179.3,137.8 L188,131.4 L196.8,123.8 L205.6,114.9 L214.4,104.8 L223.2,93.6 L231.9,81.7 L240.7,69.5 L249.5,57.6 L258.3,46.9 L267.1,37.9 L275.8,31.5 L284.6,28.2 L293.4,28.2 L302.2,31.5 L310.9,37.9 L319.7,46.9 L328.5,57.6 L337.3,69.5 L346.1,81.7 L354.8,93.6 L363.6,104.8 L372.4,114.9 L381.2,123.8 L390,131.4 L398.7,137.8 L407.5,143 L416.3,147.2 L425.1,150.6 L433.9,153.2 L442.6,155.3 L451.4,156.9 L460.2,158.1 L469,159 L477.8,159.8 L486.5,160.3 L495.3,160.7 L504.1,161 L512.9,161.3 L521.7,161.4 L530.4,161.6 L539.2,161.7 L548,161.7" fill="none" class="sb" stroke-width="2"/><line x1="465.8" y1="162" x2="465.8" y2="93.2" class="sr" stroke-dasharray="4 3"/><text x="465.8" y="90.2" text-anchor="middle" font-size="11">observed t</text><line x1="112.2" y1="162" x2="112.2" y2="93.2" class="sr" stroke-dasharray="4 3"/><text x="530.7" y="141.3" text-anchor="middle" font-size="10" class="tr">0.53%</text><text x="47.3" y="141.3" text-anchor="middle" font-size="10" class="tr">0.53%</text><text x="363.8" y="48.4" text-anchor="start" font-size="10" class="tm">← t values if H₀ is true</text></svg><figcaption>The curve is where t would fall if the new page were no faster (mean 30 s). The 12 shoppers gave t = −3.07, far out; both red tails together = p = 0.0106.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A smoke alarm's "surprise score": if there were no fire, how often would the room be this smoky? Burnt toast happens often (big p, ignore). Smoke this thick without a fire almost never happens (small p, act).</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>p-value</strong>: assuming H₀ is true, the probability of getting a statistic at least as extreme as the one observed. In plain words: <em>if nothing were going on, how often would luck alone give a result this surprising?</em> Two-sided: p = P(|T| ≥ |t_obs| | H₀).</p>
  </div>
  <h3>The 4 misreadings (interview favourite)</h3>
  <table class="tbl">
    <tr><th>Wrong</th><th>Right</th></tr>
    <tr><td>"p = 0.013 means a 1.3% chance H₀ is true"</td><td>p is computed assuming H₀ is true. It is P(data this extreme | H₀), not P(H₀ | data)</td></tr>
    <tr><td>"1 − p = 98.7% chance the page is faster"</td><td>Same confusion. That needs Bayes' rule and a prior belief (Probability note)</td></tr>
    <tr><td>"Small p = big effect"</td><td>Huge n makes tiny effects significant. Report the effect size and CI</td></tr>
    <tr><td>"p &gt; 0.05 proves no effect"</td><td>Maybe the test was too small (low power). Absence of evidence ≠ evidence of absence</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The vertical bar "|" means "given". P(data | H₀) and P(H₀ | data) are different, just as P(wet road | rain) ≈ 1 but P(rain | wet road) is much lower (a tanker may have passed).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: α and the two errors.</b> p = 0.013 is a measure of surprise, not a decision. Where do we draw the line, and how often will that line make us wrong?</div>

  <h2 id="sht-err"><span class="num">05</span>α and the Two Errors</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We must turn p into "ship" or "don't ship". What cut-off do we use, and what does it cost us in wrong decisions?</p>
  </div>
  <p>Any yes/no decision made from noisy data can go wrong in two ways. You can raise a false alarm (declare an effect that is not there), or you can miss a real effect. A test that never raises false alarms is easy: never reject anything. But it would miss everything. So we have to balance the two.</p>
  <p>The rule: pick α before seeing data and reject H₀ when p &lt; α. Then, <em>if H₀ is true</em>, you reject only α of the time, because p-values under H₀ are spread evenly between 0 and 1. For our pilot: p = 0.0132 → reject at α = 0.05, don't reject at α = 0.01.</p>
  <div class="fx" data-lang="py">for alpha in (0.05, 0.01):
    print(f"alpha={alpha}: p={p:.4f} -&gt; {'reject H0' if p &lt; alpha else 'do not reject H0'}")
rng = np.random.default_rng(1)
pv = np.array([stats.ttest_1samp(rng.normal(30, 2, 5), 30).pvalue for _ in range(20000)])
print("H0 true, 20,000 pilots: rejected at 0.05:", round(np.mean(pv &lt; 0.05), 4),
      " at 0.01:", round(np.mean(pv &lt; 0.01), 4))</div>
  <div class="fx" data-lang="text">alpha=0.05: p=0.0132 -&gt; reject H0
alpha=0.01: p=0.0132 -&gt; do not reject H0
H0 true, 20,000 pilots: rejected at 0.05: 0.048  at 0.01: 0.0098</div>
  <p>The loop runs 20,000 pilots where H₀ is true. With the rule "reject when p &lt; 0.05", 4.8% are rejected: false alarms at about α, as promised. At α = 0.01, about 1%. That is what α <em>is</em>: the false-alarm rate you agreed to.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>An airport metal detector. Set it very sensitive and it beeps at every belt buckle (false alarms, Type I). Set it lax and a real knife slips through (a miss, Type II). Turning one dial trades one error for the other. The only way to reduce both is a better machine: in statistics, more data or less noise.</p>
  </div>
  <table class="tbl">
    <tr><th></th><th>H₀ true (no effect)</th><th>H₁ true (real effect)</th></tr>
    <tr><th>Reject H₀</th><td><strong>Type I</strong>, false positive, prob α</td><td>Correct, prob = <strong>power</strong> = 1 − β</td></tr>
    <tr><th>Don't reject</th><td>Correct, prob 1 − α</td><td><strong>Type II</strong>, false negative, prob β</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Type I error</strong>: rejecting a true H₀ (rate α). <strong>Type II error</strong>: not rejecting a false H₀ (rate β). Standard choice: α = 0.05. Lower α (0.01) when false alarms are costly; it raises β unless n grows.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Which is worse?" depends on cost. Shipping a harmful checkout (Type I) is usually worse in product tests, so α is kept low. In disease screening, missing a sick patient (Type II) is worse. Decide by consequences, not by habit.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Confidence intervals.</b> "Reject H₀" says the new page is not 30 s. The manager asks: "So how fast <em>is</em> it?" A yes/no answer cannot say.</div>

  <h2 id="sht-ci"><span class="num">06</span>Confidence Intervals</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The test says "not 30 s". What range of true mean checkout times is consistent with our 5 shoppers?</p>
  </div>
  <p>Saying "27 seconds" sounds too exact; another 5 shoppers would give another mean. We need a range that honestly shows how unsure we are. The idea: take the estimate, then step out on both sides by "a few standard errors". How many is "a few" comes from the same t curve, chosen so the method works 95% of the time.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A fisherman throws a net at a fish he cannot see clearly. The fish (true mean) stays still; the net (interval) lands somewhere new each throw. A "95% net" is one that is wide enough to catch the fish on 95 of every 100 throws. After any one throw, the fish is either inside or not; the 95% describes the throwing method.</p>
  </div>
  <h3>By hand, on the 5 shoppers</h3>
  <ol>
    <li>Estimate x̄ = 27, SE = 0.707 (section 02).</li>
    <li>Critical value t* for 95% with 4 df: the point that leaves 2.5% in each tail = <strong>2.776</strong> (section 03).</li>
    <li>Margin of error = t* × SE = 2.776 × 0.707 = 1.963.</li>
    <li>CI = 27 ± 1.963 = <strong>[25.04, 28.96]</strong> seconds.</li>
    <li>30 is outside the interval, which agrees with p = 0.013 &lt; 0.05. This always holds: a 95% CI excludes the H₀ value exactly when the two-sided p &lt; 0.05.</li>
  </ol>
  <div class="fx" data-lang="py">tcrit = stats.t.ppf(0.975, df=4)
print("5 shoppers: t* =", round(tcrit, 3), " CI =", np.round([mean - tcrit*se, mean + tcrit*se], 2))
ci = r12.confidence_interval()                  # 12 shoppers, built in
print("12 shoppers: t* =", round(stats.t.ppf(0.975, 11), 3), " CI =", round(ci.low, 2), round(ci.high, 2))
rng = np.random.default_rng(42)
true_mu, hits = 30, 0
for _ in range(1000):                           # 1000 imaginary pilots
    sample = rng.normal(true_mu, 2.5, 12)       # 12 shoppers each
    c = stats.ttest_1samp(sample, popmean=true_mu).confidence_interval()
    hits += c.low &lt;= true_mu &lt;= c.high
print("intervals that caught the true mean:", hits, "of 1000")</div>
  <div class="fx" data-lang="text">5 shoppers: t* = 2.776  CI = [25.04 28.96]
12 shoppers: t* = 2.201  CI = 26.28 29.39
intervals that caught the true mean: 958 of 1000</div>
  <p><code>stats.t.ppf(0.975, df)</code> is the reverse of a tail area: "which t leaves 97.5% below it?". With 11 df it is 2.201 (with 4 df it was 2.776; fewer data points means fatter tails and wider nets). <code>confidence_interval()</code> on the 12-shopper result gives 26.28 to 29.39 s. In the loop, 958 of 1,000 intervals caught the true 30: about 95%, with a little simulation noise. The picture shows 40 such intervals.</p>
  <figure class="viz"><svg viewBox="0 0 560 240" width="560"><line x1="20" y1="214" x2="540" y2="214" stroke="currentColor" stroke-opacity=".5"/><text x="72" y="229" text-anchor="middle" font-size="11">26</text><text x="176" y="229" text-anchor="middle" font-size="11">28</text><text x="280" y="229" text-anchor="middle" font-size="11">30</text><text x="384" y="229" text-anchor="middle" font-size="11">32</text><text x="488" y="229" text-anchor="middle" font-size="11">34</text><text x="540" y="209" text-anchor="end" font-size="11" class="tm">seconds</text><line x1="174.4" y1="209.2" x2="380.9" y2="209.2" class="sb" stroke-width="1.4"/><line x1="147.6" y1="204.3" x2="373.5" y2="204.3" class="sb" stroke-width="1.4"/><line x1="136.1" y1="199.5" x2="371.1" y2="199.5" class="sb" stroke-width="1.4"/><line x1="179.1" y1="194.7" x2="316.1" y2="194.7" class="sb" stroke-width="1.4"/><line x1="198.8" y1="189.8" x2="388.8" y2="189.8" class="sb" stroke-width="1.4"/><line x1="224" y1="185" x2="417.6" y2="185" class="sb" stroke-width="1.4"/><line x1="129.8" y1="180.1" x2="401.6" y2="180.1" class="sb" stroke-width="1.4"/><line x1="125.8" y1="175.3" x2="303.8" y2="175.3" class="sb" stroke-width="1.4"/><line x1="287.7" y1="170.5" x2="390.9" y2="170.5" class="sr" stroke-width="2.2"/><line x1="182.9" y1="165.6" x2="368.4" y2="165.6" class="sb" stroke-width="1.4"/><line x1="329.5" y1="160.8" x2="508.3" y2="160.8" class="sr" stroke-width="2.2"/><line x1="151" y1="156" x2="386.8" y2="156" class="sb" stroke-width="1.4"/><line x1="218.8" y1="151.1" x2="335.8" y2="151.1" class="sb" stroke-width="1.4"/><line x1="144.7" y1="146.3" x2="370.4" y2="146.3" class="sb" stroke-width="1.4"/><line x1="261.1" y1="141.4" x2="444.1" y2="141.4" class="sb" stroke-width="1.4"/><line x1="156.1" y1="136.6" x2="384.8" y2="136.6" class="sb" stroke-width="1.4"/><line x1="187.1" y1="131.8" x2="387.2" y2="131.8" class="sb" stroke-width="1.4"/><line x1="145" y1="126.9" x2="391" y2="126.9" class="sb" stroke-width="1.4"/><line x1="233.7" y1="122.1" x2="422.5" y2="122.1" class="sb" stroke-width="1.4"/><line x1="157.4" y1="117.3" x2="351.8" y2="117.3" class="sb" stroke-width="1.4"/><line x1="303" y1="112.4" x2="403.2" y2="112.4" class="sr" stroke-width="2.2"/><line x1="277.4" y1="107.6" x2="440.8" y2="107.6" class="sb" stroke-width="1.4"/><line x1="180.9" y1="102.7" x2="405" y2="102.7" class="sb" stroke-width="1.4"/><line x1="220.7" y1="97.9" x2="415.9" y2="97.9" class="sb" stroke-width="1.4"/><line x1="210.7" y1="93.1" x2="471.6" y2="93.1" class="sb" stroke-width="1.4"/><line x1="173.7" y1="88.2" x2="335.7" y2="88.2" class="sb" stroke-width="1.4"/><line x1="152.3" y1="83.4" x2="344.8" y2="83.4" class="sb" stroke-width="1.4"/><line x1="201.6" y1="78.6" x2="347.2" y2="78.6" class="sb" stroke-width="1.4"/><line x1="253.5" y1="73.7" x2="405.8" y2="73.7" class="sb" stroke-width="1.4"/><line x1="198.9" y1="68.9" x2="404.5" y2="68.9" class="sb" stroke-width="1.4"/><line x1="105.3" y1="64" x2="369.4" y2="64" class="sb" stroke-width="1.4"/><line x1="101.1" y1="59.2" x2="297.6" y2="59.2" class="sb" stroke-width="1.4"/><line x1="57" y1="54.4" x2="311.9" y2="54.4" class="sb" stroke-width="1.4"/><line x1="129.8" y1="49.5" x2="349.3" y2="49.5" class="sb" stroke-width="1.4"/><line x1="212.7" y1="44.7" x2="399.6" y2="44.7" class="sb" stroke-width="1.4"/><line x1="145.6" y1="39.9" x2="326.7" y2="39.9" class="sb" stroke-width="1.4"/><line x1="153.7" y1="35" x2="357.7" y2="35" class="sb" stroke-width="1.4"/><line x1="72.5" y1="30.2" x2="221.2" y2="30.2" class="sr" stroke-width="2.2"/><line x1="192.6" y1="25.3" x2="402.3" y2="25.3" class="sb" stroke-width="1.4"/><line x1="276.3" y1="20.5" x2="443.3" y2="20.5" class="sb" stroke-width="1.4"/><line x1="280" y1="214" x2="280" y2="15.7" class="sg" stroke-width="1.5" stroke-dasharray="4 3"/><text x="280" y="12.8" text-anchor="middle" font-size="11" class="tg">true μ = 30</text></svg><figcaption>40 repeated studies, one 95% CI each. 36 contain the true mean; 4 (red) miss. 95% is a property of the method, not one interval.</figcaption></figure>
  <div class="callout def"><span class="label">Correct interpretation</span>
    <p><strong>95% confidence interval</strong>: a range built by a method that, over many repeated studies, contains the true value 95% of the time. Formula: <code>estimate ± critical value × SE</code>. Width shrinks like 1/√n: four times the data, half the width.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"There's a 95% probability the true mean is in [25.0, 29.0]" is wrong in the usual (frequentist) view: the true mean is a fixed number, and this one interval either contains it or not. A Bayesian credible interval does allow that sentence. In interviews say "95% of intervals built this way contain the true mean".</p>
  </div>
  <p>Why it matters at work: a CI shows size and uncertainty together. "Checkout 3 s faster, CI 1 to 5 s" lets a business judge whether the low end is still worth it. A bare p-value cannot.</p>
  <div class="bridge"><b>What this still can't tell us → next: Power &amp; sample size.</b> Our pilot happened to find the effect. But small pilots give wide intervals and often miss real effects. Before running a study, how do we know it is big enough to catch what we care about?</div>

  <h2 id="sht-power"><span class="num">07</span>Power &amp; Sample Size</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>If the new page truly raises conversion by 1 percentage point, what is the chance our 1,000-per-arm pilot detects it? And how many shoppers would we need to be fairly sure?</p>
  </div>
  <p><strong>Power</strong> is the probability of rejecting H₀ when a real effect of a given size exists: 1 − β. It is the Type II side of the table, and it is planned <em>before</em> data, by choosing n.</p>
  <figure class="viz"><svg viewBox="0 0 560 200" width="560"><line x1="30" y1="172" x2="548" y2="172" stroke="currentColor" stroke-opacity=".5"/><text x="220.8" y="187" text-anchor="middle" font-size="11">0</text><text x="310.5" y="187" text-anchor="middle" font-size="11">1.645</text><text x="357.2" y="187" text-anchor="middle" font-size="11">2.5</text><text x="548" y="167" text-anchor="end" font-size="11" class="tm">test statistic</text><path d="M30,172 L30,172 L39.7,172 L49.3,172 L59,172 L68.7,172 L78.4,172 L88,172 L97.7,172 L107.4,172 L117.1,172 L126.7,172 L136.4,172 L146.1,171.9 L155.8,171.8 L165.4,171.7 L175.1,171.5 L184.8,171.1 L194.5,170.4 L204.1,169.3 L213.8,167.6 L223.5,165.1 L233.1,161.5 L242.8,156.5 L252.5,149.8 L262.2,141.3 L271.8,130.8 L281.5,118.5 L291.2,104.6 L300.9,89.8 L310.5,74.8 L310.5,172 Z" class="fb" stroke="none"/><path d="M310.5,172 L310.5,74.8 L316.6,65.7 L322.7,57.3 L328.8,49.6 L334.9,43.1 L341,38 L347.1,34.3 L353.2,32.3 L359.2,32 L365.3,33.5 L371.4,36.6 L377.5,41.4 L383.6,47.5 L389.7,54.8 L395.8,63 L401.9,71.9 L408,81.2 L414,90.7 L420.1,100.1 L426.2,109.2 L432.3,117.8 L438.4,125.8 L444.5,133.2 L450.6,139.7 L456.7,145.5 L462.8,150.5 L468.8,154.8 L474.9,158.4 L481,161.4 L487.1,163.8 L493.2,165.8 L499.3,167.3 L505.4,168.5 L511.5,169.4 L517.6,170.1 L523.6,170.7 L529.7,171.1 L535.8,171.3 L541.9,171.5 L548,171.7 L548,172 Z" class="fg" stroke="none"/><path d="M310.5,172 L310.5,135.8 L318.7,144 L326.9,150.9 L335.1,156.4 L343.3,160.7 L351.5,164.1 L359.7,166.5 L367.9,168.3 L376,169.6 L384.2,170.4 L392.4,171 L400.6,171.4 L408.8,171.6 L417,171.8 L425.2,171.9 L433.4,171.9 L441.6,172 L449.7,172 L457.9,172 L466.1,172 L474.3,172 L482.5,172 L490.7,172 L498.9,172 L507.1,172 L515.2,172 L523.4,172 L531.6,172 L539.8,172 L548,172 L548,172 Z" class="fr" stroke="none"/><path d="M30,171.7 L38.8,171.5 L47.6,171.1 L56.3,170.5 L65.1,169.6 L73.9,168.3 L82.7,166.3 L91.5,163.6 L100.2,159.9 L109,154.9 L117.8,148.5 L126.6,140.6 L135.4,131 L144.1,119.9 L152.9,107.5 L161.7,94.2 L170.5,80.6 L179.3,67.3 L188,55.1 L196.8,44.9 L205.6,37.3 L214.4,32.9 L223.2,32.1 L231.9,34.8 L240.7,40.9 L249.5,50 L258.3,61.3 L267.1,74.2 L275.8,87.8 L284.6,101.3 L293.4,114.2 L302.2,125.9 L310.9,136.2 L319.7,145 L328.5,152.1 L337.3,157.7 L346.1,162 L354.8,165.2 L363.6,167.5 L372.4,169.1 L381.2,170.1 L390,170.9 L398.7,171.3 L407.5,171.6 L416.3,171.8 L425.1,171.9 L433.9,171.9 L442.6,172 L451.4,172 L460.2,172 L469,172 L477.8,172 L486.5,172 L495.3,172 L504.1,172 L512.9,172 L521.7,172 L530.4,172 L539.2,172 L548,172" fill="none" class="sb" stroke-width="2"/><path d="M30,172 L38.8,172 L47.6,172 L56.3,172 L65.1,172 L73.9,172 L82.7,172 L91.5,172 L100.2,172 L109,172 L117.8,172 L126.6,172 L135.4,172 L144.1,171.9 L152.9,171.9 L161.7,171.8 L170.5,171.6 L179.3,171.3 L188,170.9 L196.8,170.1 L205.6,169.1 L214.4,167.5 L223.2,165.2 L231.9,162 L240.7,157.7 L249.5,152.1 L258.3,145 L267.1,136.2 L275.8,125.9 L284.6,114.2 L293.4,101.3 L302.2,87.8 L310.9,74.2 L319.7,61.3 L328.5,50 L337.3,40.9 L346.1,34.8 L354.8,32.1 L363.6,32.9 L372.4,37.3 L381.2,44.9 L390,55.1 L398.7,67.3 L407.5,80.6 L416.3,94.2 L425.1,107.5 L433.9,119.9 L442.6,131 L451.4,140.6 L460.2,148.5 L469,154.9 L477.8,159.9 L486.5,163.6 L495.3,166.3 L504.1,168.3 L512.9,169.6 L521.7,170.5 L530.4,171.1 L539.2,171.5 L548,171.7" fill="none" class="sg" stroke-width="2"/><line x1="310.5" y1="172" x2="310.5" y2="21" class="sr" stroke-dasharray="4 3"/><text x="310.5" y="18" text-anchor="start" font-size="11">reject H₀ →</text><text x="35.5" y="45.6" text-anchor="start" font-size="11" class="tb">H₀: no effect</text><text x="438.9" y="45.6" text-anchor="middle" font-size="11" class="tg">H₁: real effect</text><text x="289" y="154.4" text-anchor="middle" font-size="13" font-weight="bold">β</text><text x="340.8" y="154.4" text-anchor="middle" font-size="13" class="tr" font-weight="bold">α</text><text x="389.9" y="119.3" text-anchor="middle" font-size="11" class="tg" font-weight="bold">power</text></svg><figcaption>Right of the line we reject. Red α = false alarms under H₀. Blue β = real effects we miss. Green = power (80% here).</figcaption></figure>
  <h3>Power by hand</h3>
  <p>Take a one-sided z-test (like a t-test but with a known noise level, so the curve is the standard normal). We reject when the statistic is above 1.645 (the point with 5% above it). Suppose the real effect is 2.5 standard errors. Then the statistic we observe wobbles around 2.5 instead of 0.</p>
  <ol>
    <li>We reject when Z_observed &gt; 1.645.</li>
    <li>Under H₁, Z_observed = 2.5 + noise, where noise ~ standard normal.</li>
    <li>So we need noise &gt; 1.645 − 2.5 = −0.855.</li>
    <li>P(standard normal &gt; −0.855) = 0.80. Power = 80%, β = 20%.</li>
  </ol>
  <p>The code checks that number, then uses <code>statsmodels</code> to answer the planning question "how many per group?", and finally simulates many experiments to see α and power as real rates.</p>
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
  <p><code>effect_size</code> is <strong>Cohen's d</strong>: difference in means ÷ standard deviation (0.2 small, 0.5 medium, 0.8 large). For checkout time with a shopper-to-shopper sd of 6 s, a 3 s improvement is d = 0.5. <code>solve_power</code> says that needs about 64 shoppers per page for 80% power. With only 20 per page, power is 0.34: two out of three real effects would be missed. The simulation agrees: with no effect, about 5% of tests reject (that is α); with d = 0.5 the reject rate is 0.34 at n = 20 and 0.80 at n = 64.</p>
  <h3>The conversion pilot is badly underpowered</h3>
  <p>A realistic lift is +1 pp (10% → 11%). With 1,000 shoppers per page, the SE of the difference is √(0.1 × 0.9/1000 + 0.11 × 0.89/1000) = 0.0137, so the effect is only 0.01/0.0137 = 0.73 SE. Two-sided power = P(Z &gt; 1.96 − 0.73) ≈ P(Z &gt; 1.23) ≈ 0.11. For 80% power: n = (1.96 + 0.84)² × (0.09 + 0.0979)/0.01² ≈ 14,749 per arm.</p>
  <div class="fx" data-lang="py">se1 = np.sqrt(0.10*0.90/1000 + 0.11*0.89/1000)  # SE of a 1 pp difference with 1,000 per arm
shift = 0.01 / se1                              # true effect in SE units
print(f"SE={se1:.4f}  effect={shift:.2f} SE  power={stats.norm.sf(1.96 - shift) + stats.norm.cdf(-1.96 - shift):.3f}")
n_need = (1.96 + 0.8416)**2 * (0.10*0.90 + 0.11*0.89) / 0.01**2
print(f"n per arm for 80% power: {np.ceil(n_need):,.0f}")</div>
  <div class="fx" data-lang="text">SE=0.0137  effect=0.73 SE  power=0.113
n per arm for 80% power: 14,749</div>
  <div class="cards">
    <div><b>↑ sample size</b><p>Narrower curves → more power.</p><small>The main lever; n ∝ 1/effect²</small></div>
    <div><b>↑ effect size</b><p>Curves further apart → more power.</p><small>Big changes are easy to detect</small></div>
    <div><b>↑ α</b><p>Line moves left → more power, more false alarms.</p><small>A trade-off, not a free lunch</small></div>
    <div><b>↓ noise (σ)</b><p>Narrower curves.</p><small>Paired designs (section 09), CUPED</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Power</strong> = 1 − β = P(reject H₀ | a specific real effect). Inputs: effect size, noise, n, α. Standard target: power 0.8 at α = 0.05. For two proportions: n per arm = (z₁₋α/₂ + z₁₋β)² [p₁(1 − p₁) + p₂(1 − p₂)] / (p₂ − p₁)².</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Computing power <em>after</em> a non-significant result ("observed power") adds nothing: it is just a re-coding of the p-value. Do the power calculation <em>before</em> collecting data, to choose n.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: z-test for proportions.</b> Sections 02–07 built the whole recipe on a one-sample t-test for a mean. But the decision metric is conversion, a yes/no per shopper, compared between two pages. Which statistic do we use there?</div>

  <h2 id="sht-z"><span class="num">08</span>The z-test for Proportions</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Conversion pilot: old page 100 buyers of 1,000, new page 130 of 1,000. Is 13% vs 10% a real difference? The data are yes/no, two groups.</p>
  </div>
  <p>Same recipe, new statistic. Each buyer is a Bernoulli trial (Distributions note), so a conversion rate p̂ is an average of 0/1 values, and the CLT makes it nearly normal with SE √(p(1 − p)/n). The difference of two rates divided by its SE is a <strong>z</strong>: with large n, σ is known from p itself, so the null distribution is the standard normal, not t.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two cricketers' strike rates: 13 boundaries per 100 balls vs 10. Over 100 balls each, that could be a good day. Over 10,000 balls each, it is a different player. The z-test asks which of those two worlds we are in.</p>
  </div>
  <h3>By hand</h3>
  <ol>
    <li>Rates: new 0.13, old 0.10. Difference = 0.03 (3 pp).</li>
    <li>Under H₀ the two pages convert equally, so pool them: p̂ = 230/2000 = 0.115.</li>
    <li>SE under H₀ = √(p̂(1 − p̂)(1/1000 + 1/1000)) = √(0.115 × 0.885 × 0.002) = √0.0002036 = 0.01427.</li>
    <li>z = 0.03/0.01427 = 2.10. Two-sided p = 2 × P(Z &gt; 2.10) = 0.036.</li>
    <li>CI: don't pool (we no longer assume H₀): SE = √(0.1 × 0.9/1000 + 0.13 × 0.87/1000) = 0.01425; 0.03 ± 1.96 × 0.01425 = [+0.002, +0.058].</li>
  </ol>
  <div class="fx" data-lang="py">x_old, x_new, n_arm = 100, 130, 1000            # pilot: buyers out of 1,000 shoppers per arm
p_old, p_new = x_old / n_arm, x_new / n_arm
pool = (x_old + x_new) / (2 * n_arm)
se0 = np.sqrt(pool * (1 - pool) * (2 / n_arm))  # SE under H0 (pooled)
z = (p_new - p_old) / se0
print(f"pooled={pool:.3f} se={se0:.5f} z={z:.3f} p={2*stats.norm.sf(abs(z)):.4f}")
se1 = np.sqrt(p_old*(1-p_old)/n_arm + p_new*(1-p_new)/n_arm)   # unpooled, for the CI
print(f"95% CI for the lift: [{p_new-p_old-1.96*se1:+.4f}, {p_new-p_old+1.96*se1:+.4f}]")
from statsmodels.stats.proportion import proportions_ztest
zz, pp = proportions_ztest([x_new, x_old], [n_arm, n_arm])
print(f"statsmodels: z={zz:.3f} p={pp:.4f}")
tab = np.array([[x_new, n_arm - x_new], [x_old, n_arm - x_old]])
c2 = stats.chi2_contingency(tab, correction=False)
print(f"same data as a 2x2 chi-square: chi2={c2.statistic:.3f} = z^2={z**2:.3f}, p={c2.pvalue:.4f}")</div>
  <div class="fx" data-lang="text">pooled=0.115 se=0.01427 z=2.103 p=0.0355
95% CI for the lift: [+0.0021, +0.0579]
statsmodels: z=2.103 p=0.0355
same data as a 2x2 chi-square: chi2=4.422 = z^2=4.422, p=0.0355</div>
  <p>The hand calculation and <code>proportions_ztest</code> agree: z = 2.10, p = 0.036. Significant at 0.05, but look at the CI: somewhere between +0.2 pp and +5.8 pp. That is "probably positive, size unknown". The last line shows a link: the same data as a 2×2 table (page × bought) gives χ² = 4.42 = z², with the same p. The chi-square test (section 10) and the z-test are one test in two costumes.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Two-proportion z-test</strong>: z = (p̂₂ − p̂₁)/√(p̂(1 − p̂)(1/n₁ + 1/n₂)), p̂ the pooled rate; z ~ N(0, 1) under H₀ for large n (at least about 10 successes and 10 failures per group). <strong>z vs t</strong>: z when the SE is known or n is large; t when σ is estimated from a small sample.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Pooled SE for the test, unpooled SE for the CI; mixing them up gives slightly wrong answers. And for tiny counts (5 buyers), use the exact binomial or Fisher's test instead of z.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Welch &amp; paired t-tests.</b> Conversion is settled for the pilot. For checkout <em>time</em> the team now compares two groups of different shoppers, and separately the same 8 testers on both pages. Both have means, not rates, and small samples. How does the t-test extend?</div>

  <h2 id="sht-t"><span class="num">09</span>t-tests: Welch and Paired</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Section 02 compared one group with a fixed number (30 s). Now we compare two groups: old-page shoppers vs new-page shoppers, or the same testers before and after. What is "the difference" and what is its SE?</p>
  </div>
  <p>All three t-tests share one recipe, <code>t = difference / SE of that difference</code>. They differ only in what "the difference" is and how its SE is computed.</p>
  <div class="cards">
    <div><b>One-sample</b><p>One group vs a known number.</p><small>New-page mean vs the old 30 s (section 02)</small></div>
    <div><b>Two-sample (Welch)</b><p>Two independent groups of different people.</p><small>Shoppers on the old page vs others on the new</small></div>
    <div><b>Paired</b><p>Same units measured twice; test the differences.</p><small>The same 8 testers on both pages</small></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Comparing two coaching centres by the marks of their students is a two-sample test: different students, lots of natural spread. Comparing the same 8 students' marks before and after a crash course is a paired test: each student is their own baseline, so "this student is just bright" cancels out.</p>
  </div>
  <h3>Welch by hand</h3>
  <p>Old page (3 shoppers): 31, 33, 35 s. New page (3 other shoppers): 28, 29, 30 s.</p>
  <ol>
    <li>Means: 33 and 29. Difference = 4 s.</li>
    <li>Variances (÷ n − 1): old = (4 + 0 + 4)/2 = 4, new = (1 + 0 + 1)/2 = 1.</li>
    <li>SE of the difference = √(s²_old/n_old + s²_new/n_new) = √(4/3 + 1/3) = √1.667 = 1.291.</li>
    <li>t = 4 / 1.291 = 3.10.</li>
    <li>Welch's degrees of freedom (a formula that adjusts for unequal variances) ≈ 2.94.</li>
  </ol>
  <div class="fx" data-lang="py">a, b = np.array([31, 33, 35]), np.array([28, 29, 30])     # old page vs new page, seconds
va, vb = a.var(ddof=1) / len(a), b.var(ddof=1) / len(b)   # squared SE of each mean
se2 = np.sqrt(va + vb)
t2 = (a.mean() - b.mean()) / se2
df2 = (va + vb)**2 / (va**2 / (len(a)-1) + vb**2 / (len(b)-1))   # Welch df
print(f"se={se2:.3f} t={t2:.3f} df={df2:.2f} p={2*stats.t.sf(t2, df2):.4f}")
rw = stats.ttest_ind(a, b, equal_var=False)
print(f"ttest_ind(equal_var=False): t={rw.statistic:.3f} p={rw.pvalue:.4f} df={rw.df:.2f}")</div>
  <div class="fx" data-lang="text">se=1.291 t=3.098 df=2.94 p=0.0548
ttest_ind(equal_var=False): t=3.098 p=0.0548 df=2.94</div>
  <p>The hand numbers match <code>ttest_ind(..., equal_var=False)</code>. Notice the lesson: 33 vs 29 s looks very different, yet p = 0.055. With 3 shoppers per page and under 3 degrees of freedom, the t curve has very fat tails. Tiny samples need huge gaps (and section 07 told us so in advance).</p>
  <h3>Paired by hand</h3>
  <p>Eight testers each check out on both pages (order randomised). Old-page times: 42, 28, 55, 20, 38, 49, 31, 60 s; new-page: 35, 24, 47, 18, 30, 44, 26, 51 s. Subtract per tester: differences = 7, 4, 8, 2, 8, 5, 5, 9. Now it is just a one-sample t-test of "mean difference = 0": mean 6.0, sd 2.39, SE = 2.39/√8 = 0.845, t = 6.0/0.845 = 7.10.</p>
  <p>The code runs all three tests at more realistic sizes: 40 shoppers per page simulated with a true gap of 3 s, then the 8 testers paired and (wrongly) unpaired.</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(1)
old40, new40 = rng.normal(33, 6, 40), rng.normal(30, 6, 40)       # 40 shoppers per page
show = lambda name, r: print(f"{name:9s} t={r.statistic:6.3f}  p={r.pvalue:.4f}")
show("Welch", stats.ttest_ind(old40, new40, equal_var=False))
before = np.array([42, 28, 55, 20, 38, 49, 31, 60])   # same 8 testers, old page (s)
after  = np.array([35, 24, 47, 18, 30, 44, 26, 51])   # same 8 testers, new page (s)
d = before - after
print("differences:", d, " mean", d.mean(), " sd", round(d.std(ddof=1), 3))
show("paired", stats.ttest_rel(before, after))
show("unpaired", stats.ttest_ind(before, after))</div>
  <div class="fx" data-lang="text">Welch     t= 3.419  p=0.0010
differences: [7 4 8 2 8 5 5 9]  mean 6.0  sd 2.39
paired    t= 7.099  p=0.0002
unpaired  t= 0.930  p=0.3682</div>
  <p><code>ttest_rel</code> ("related samples") gives t = 7.099, exactly our hand value. Treating the same numbers as two unrelated groups gives p = 0.37. Why? Testers differ a lot from each other (18 to 60 s), and that spread swamps the 6 s improvement. Pairing subtracts each tester from themself, so that spread disappears: the "↓ noise" lever from section 07.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Welch's t-test</strong>: two independent groups, does not assume equal variances. <strong>Student's t-test</strong>: the older version that assumes equal variances (<code>equal_var=True</code>, scipy's default). <strong>Paired t-test</strong>: a one-sample t-test on per-unit differences. <strong>Degrees of freedom</strong>: roughly "how many independent pieces of information"; fewer df → fatter t tails.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>scipy's <code>ttest_ind</code> defaults to Student's (equal variances). Pass <code>equal_var=False</code> for Welch: it is safe when variances differ and loses almost nothing when they don't. And never run an unpaired test on paired data; you throw away most of your power.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: χ² and ANOVA.</b> t-tests compare two means. The team also asks: among new-page shoppers, does buying depend on device (counts in a table, no mean)? And which of three button colours gives the biggest baskets (three groups)?</div>

  <h2 id="sht-chi"><span class="num">10</span>Chi-square Test &amp; ANOVA</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Counts in categories have no mean to compare, and running t-tests on every pair of 3+ groups inflates false alarms (section 13). What statistic handles each case?</p>
  </div>
  <h3>Chi-square test of independence</h3>
  <p>The idea: work out the counts you would <strong>expect</strong> if the two variables had nothing to do with each other, then measure how far the <strong>observed</strong> counts are from that, exactly the goodness-of-fit sum from the Distributions note.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school says 13% of all its students got distinction. If one section of 600 students had a "normal" share, you would expect about 78 distinctions there. If it has only 60, something about that section is different, or it is luck. Chi-square measures how surprising the gap is.</p>
  </div>
  <table class="tbl out"><caption>1,000 new-page shoppers: observed counts (expected in brackets)</caption>
    <tr><th></th><th>Bought</th><th>Didn't buy</th><th>Row total</th></tr>
    <tr><th>Mobile</th><td>60 (78)</td><td>540 (522)</td><td>600</td></tr>
    <tr><th>Desktop</th><td>70 (52)</td><td>330 (348)</td><td>400</td></tr>
    <tr><th>Column total</th><td>130</td><td>870</td><td>1000</td></tr>
  </table>
  <ol>
    <li><strong>Expected</strong> = row total × column total / grand total. Mobile-bought: 600 × 130 / 1000 = 78. Overall 13% bought, so 13% of 600 mobile shoppers = 78.</li>
    <li><strong>Each cell's contribution</strong> (O − E)²/E: (60 − 78)²/78 = 4.154; (540 − 522)²/522 = 0.621; (70 − 52)²/52 = 6.231; (330 − 348)²/348 = 0.931.</li>
    <li><strong>χ²</strong> = sum = 11.94. Degrees of freedom = (rows − 1)(columns − 1) = 1.</li>
    <li>Look up χ² = 11.94 with 1 df (the χ² curve from the Distributions note): p ≈ 0.0005.</li>
  </ol>
  <div class="fx" data-lang="py">table = np.array([[60, 540],    # new page, mobile: bought, not
                  [70, 330]])   # new page, desktop
row, col, total = table.sum(1, keepdims=True), table.sum(0, keepdims=True), table.sum()
E_ = row * col / total                       # expected counts if device doesn't matter
chi2 = ((table - E_)**2 / E_).sum()
print("expected:", E_.tolist())
print("by hand chi2 =", round(chi2, 3))
res = stats.chi2_contingency(table, correction=False)
print("scipy, no correction:", round(res.statistic, 3), " p =", round(res.pvalue, 5))
res = stats.chi2_contingency(table)          # default: Yates correction on 2x2
print("scipy, default      :", round(res.statistic, 3), " p =", round(res.pvalue, 5), " dof =", res.dof)</div>
  <div class="fx" data-lang="text">expected: [[78.0, 522.0], [52.0, 348.0]]
by hand chi2 = 11.936
scipy, no correction: 11.936  p = 0.00055
scipy, default      : 11.282  p = 0.00078  dof = 1</div>
  <p><code>row * col / total</code> builds the whole expected table in one line (NumPy broadcasting: a 2×1 column times a 1×2 row). With <code>correction=False</code>, scipy matches the hand value 11.936. Its <em>default</em> applies the <strong>Yates continuity correction</strong> on 2×2 tables, which shrinks each |O − E| by 0.5 and gives 11.28. Both say the same thing: on the new page, desktop shoppers buy more often (17.5% vs 10%); the mobile layout may need work.</p>
  <h3>One-way ANOVA</h3>
  <p>Do 3+ group means differ? ANOVA ("analysis of variance") compares two kinds of spread: how far the <em>group means</em> are from each other (between) vs how much individuals vary <em>inside</em> each group (within). If the between-spread is much bigger, the groups really differ.</p>
  <p>By hand: items per basket with a green button [4, 5, 6], blue [6, 7, 8], orange [9, 10, 11]. Group means 5, 7, 10; grand mean 7.333.</p>
  <ol>
    <li>Between: SSB = 3·(5 − 7.333)² + 3·(7 − 7.333)² + 3·(10 − 7.333)² = 16.33 + 0.33 + 21.33 = 38.</li>
    <li>Within: each group's squared deviations are 1 + 0 + 1 = 2; SSW = 6.</li>
    <li>Divide by df: between k − 1 = 2 → 19; within N − k = 6 → 1.</li>
    <li>F = 19 / 1 = <strong>19</strong>, compared with the F(2, 6) curve from the Distributions note.</li>
  </ol>
  <div class="fx" data-lang="py">groups = {"green": [4, 5, 6], "blue": [6, 7, 8], "orange": [9, 10, 11]}   # items per basket
allv = np.concatenate(list(groups.values()))
grand = allv.mean()
ssb = sum(len(g) * (np.mean(g) - grand)**2 for g in groups.values())   # between
ssw = sum(((np.array(g) - np.mean(g))**2).sum() for g in groups.values())  # within
k, N = len(groups), len(allv)
F = (ssb / (k - 1)) / (ssw / (N - k))
print(f"grand={grand:.3f} SSB={ssb:.1f} SSW={ssw:.1f} F={F:.1f}")
r3 = stats.f_oneway(*groups.values())
print(f"f_oneway: F={r3.statistic:.1f} p={r3.pvalue:.4f}")
rng = np.random.default_rng(5)
green, blue, orange = rng.normal(50, 8, 30), rng.normal(56, 8, 30), rng.normal(49, 8, 30)
r = stats.f_oneway(green, blue, orange)
print(f"30 per colour: F={r.statistic:.3f}  p={r.pvalue:.4f}")
print(stats.tukey_hsd(green, blue, orange))</div>
  <div class="fx" data-lang="text">grand=7.333 SSB=38.0 SSW=6.0 F=19.0
f_oneway: F=19.0 p=0.0025
30 per colour: F=8.053  p=0.0006
Pairwise Group Comparisons (95.0% Confidence Interval)
Comparison  Statistic  p-value  Lower CI  Upper CI
 (0 - 1)     -6.030     0.005   -10.488    -1.572
 (0 - 2)      0.852     0.892    -3.606     5.310
 (1 - 0)      6.030     0.005     1.572    10.488
 (1 - 2)      6.882     0.001     2.424    11.340
 (2 - 0)     -0.852     0.892    -5.310     3.606
 (2 - 1)     -6.882     0.001   -11.340    -2.424</div>
  <p><code>f_oneway</code> confirms F = 19 for the toy data. On bigger simulated data (30 shoppers per colour), F = 8.05, p = 0.0006: some colour differs. <code>tukey_hsd</code> then says which: group 1 (blue) beats 0 (green) and 2 (orange), while green vs orange (p = 0.89) shows no real difference.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Chi-square test of independence</strong>: are two categorical variables related? χ² = Σ(O − E)²/E, df = (r − 1)(c − 1). <strong>One-way ANOVA</strong>: are 3+ group means equal? F = between-group variance / within-group variance. <strong>Tukey HSD</strong>: follow-up that compares every pair while keeping the overall false-alarm rate at α. With 2 groups, ANOVA's F = t².</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Chi-square needs expected counts ≥ 5 in every cell; otherwise use Fisher's exact test (<code>stats.fisher_exact</code>). It also needs raw <em>counts</em>, never percentages. ANOVA only says "at least one mean differs", never which one.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Rank tests.</b> t-tests and ANOVA work with means and variances. Order values on the new page include one ₹90,000 bulk order. One extreme value blows up the mean and the SD. What test survives that?</div>

  <h2 id="sht-np"><span class="num">11</span>Non-parametric (Rank) Tests</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>When one huge order (or a 1–5 star rating scale) makes means meaningless, how can we still test whether one page's values tend to be higher?</p>
  </div>
  <p>One extreme value, like a single customer who spends ₹90,000 when everyone else spends ₹1,000–2,000, blows up both the mean and the SD, and the t statistic shrinks to nothing. Ratings have a similar problem: the gap between 4 and 5 stars is not a real "1 unit".</p>
  <p>The idea: throw away the actual sizes and keep only the <strong>order</strong> (exactly what Spearman did in the Correlation note). Rank all values from smallest to largest, then ask whether one group's ranks tend to be higher. A whale becomes "rank 20", no matter how big.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>In a school race, the medal list only records who finished 1st, 2nd, 3rd. One runner taking a wrong turn and finishing 10 minutes late does not change anyone else's position. Ranks ignore how big the gap is.</p>
  </div>
  <h3>Mann-Whitney U by hand</h3>
  <p>Order values in ₹100s. Old page: [3, 5, 40]; new page: [6, 8, 9].</p>
  <ol>
    <li>Sort everything: 3, 5, 6, 8, 9, 40 → ranks 1 to 6. Old has ranks 1, 2, 6 (rank sum 9).</li>
    <li>Count the (old, new) pairs where old wins. 3 beats nobody, 5 beats nobody, 40 beats all three. U_old = 3 out of 3 × 3 = 9 pairs.</li>
    <li>If the pages were alike, old would win about half: 4.5. U = 3 is close to that, so no evidence.</li>
  </ol>
  <div class="fx" data-lang="py">a, b = [3, 5, 40], [6, 8, 9]                    # order value, Rs 100s: old page, new page
ranks = stats.rankdata(a + b)
print("ranks:", ranks, " rank sum old:", ranks[:3].sum())
wins = sum(x &gt; y for x in a for y in b)         # pairs where old beats new
print("U_old =", wins, "of", len(a) * len(b))
r = stats.mannwhitneyu(a, b)
print(f"scipy: U={r.statistic:.0f}  p={r.pvalue:.2f}")
a = np.array([12, 15, 14, 10, 13, 11, 16, 14, 12, 900])   # old page spend; one whale
b = np.array([18, 21, 17, 20, 19, 22, 18, 23, 20, 19])    # new page spend
print("means       :", a.mean(), b.mean())
print("Welch t     :", stats.ttest_ind(a, b, equal_var=False).pvalue.round(4))
print("Mann-Whitney:", stats.mannwhitneyu(a, b).pvalue.round(4))</div>
  <div class="fx" data-lang="text">ranks: [1. 2. 6. 3. 4. 5.]  rank sum old: 9.0
U_old = 3 of 9
scipy: U=3  p=0.70
means       : 101.7 19.7
Welch t     : 0.3794
Mann-Whitney: 0.0028</div>
  <p>First block: <code>rankdata</code> and the pair count match the hand work, and scipy's U is the same pair count. Second block, the real lesson: the new page beats the old for 9 of 10 shoppers, but one whale (900) drags the old page's mean to 101.7, above the new page's 19.7. The t-test sees a huge, noisy spread and gives p = 0.38. Mann-Whitney sees that almost every new-page value outranks almost every old-page value: p = 0.003.</p>
  <table class="tbl">
    <tr><th>Parametric</th><th>Non-parametric</th><th>scipy</th></tr>
    <tr><td>Two-sample t</td><td>Mann-Whitney U</td><td><code>mannwhitneyu</code></td></tr>
    <tr><td>Paired t</td><td>Wilcoxon signed-rank</td><td><code>wilcoxon</code></td></tr>
    <tr><td>One-way ANOVA</td><td>Kruskal-Wallis</td><td><code>kruskal</code></td></tr>
    <tr><td>Pearson r</td><td>Spearman ρ</td><td><code>spearmanr</code></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Parametric test</strong>: assumes a shape (usually normal) and works with means/variances. <strong>Non-parametric test</strong>: makes few shape assumptions, usually by working on ranks. <strong>Mann-Whitney U</strong>: tests whether a random value from one group tends to be larger than one from the other; U counts the pairs one group wins.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Mann-Whitney does not test whether <em>means</em> differ. If the business cares about mean revenue per user (it usually does), use a t-test with a large n (the CLT makes the mean roughly normal), cap extreme values, or bootstrap the CI.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Which test when.</b> We now have a z-test, three t-tests, χ², ANOVA and rank tests. Faced with a new question, how do we pick one quickly and correctly?</div>

  <h2 id="sht-which"><span class="num">12</span>Which Test When</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The recipe is always the same; only the statistic changes. What decides which statistic fits a given question?</p>
  </div>
  <p>Beginners memorise test names; interviewers ask "which test, and why?". You can answer almost every case with three questions, in this order.</p>
  <ol>
    <li><strong>What type is the outcome?</strong> A number (seconds, rupees) → you compare means or ranks. Yes/no (bought or not) → you compare proportions. A category with several levels → you compare counts in a table.</li>
    <li><strong>How many groups, and are they the same units?</strong> One group vs a fixed number, two separate groups, the same units measured twice, or three or more groups.</li>
    <li><strong>Is the data badly behaved?</strong> Heavy skew, big outliers, ordinal ratings, or tiny n → use the rank-based version, or bootstrap.</li>
  </ol>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Choosing a test is like choosing a vehicle in a city. Distance (data type), number of passengers (groups), and road condition (skew, outliers) decide between auto, car and bus. Nobody memorises "vehicle names"; they answer three questions.</p>
  </div>
  <table class="tbl">
    <tr><th>Question</th><th>Data</th><th>Test</th><th>Our pilot</th><th>scipy / statsmodels</th></tr>
    <tr><td>Successes vs a known rate, small n</td><td>binary</td><td>Exact binomial</td><td>9 of 10 prefer new: p 0.021</td><td><code>binomtest</code></td></tr>
    <tr><td>Mean vs a known value</td><td>numeric, one group</td><td>One-sample t</td><td>27 vs 30 s: t −4.24</td><td><code>ttest_1samp</code></td></tr>
    <tr><td>Two proportions</td><td>binary, large n</td><td>Two-proportion z</td><td>13% vs 10%: z 2.10</td><td><code>proportions_ztest</code></td></tr>
    <tr><td>Two group means</td><td>numeric, independent</td><td>Welch t (Mann-Whitney if skewed/ordinal)</td><td>33 vs 29 s: t 3.10</td><td><code>ttest_ind(equal_var=False)</code></td></tr>
    <tr><td>Same units twice</td><td>numeric, paired</td><td>Paired t (Wilcoxon)</td><td>8 testers: t 7.10</td><td><code>ttest_rel</code></td></tr>
    <tr><td>Two categorical variables related?</td><td>counts table</td><td>Chi-square (Fisher if small)</td><td>device × bought: 11.94</td><td><code>chi2_contingency</code></td></tr>
    <tr><td>3+ group means</td><td>numeric</td><td>ANOVA → Tukey (Kruskal-Wallis)</td><td>3 colours: F 19</td><td><code>f_oneway</code>, <code>tukey_hsd</code></td></tr>
    <tr><td>Outliers dominate</td><td>numeric, skewed</td><td>Mann-Whitney / bootstrap</td><td>whale: p 0.003</td><td><code>mannwhitneyu</code></td></tr>
    <tr><td>Two numeric variables related?</td><td>numeric pairs</td><td>Pearson / Spearman t-test</td><td>(Correlation note)</td><td><code>pearsonr</code>, <code>spearmanr</code></td></tr>
  </table>
  <p>Worked choices: "Did average order value change between control and treatment?" → numeric, two independent groups → Welch t (order values are skewed, but with thousands of users the mean is fine by the CLT). "Did click-through rate change?" → yes/no, two groups → two-proportion z-test (see <a class="xref" data-note="st_abtesting">A/B Testing</a>). "Does preferred payment method differ by city?" → two categorical variables → chi-square. "Are hours studied and marks related?" → see <a class="xref" data-note="st_correlation">Correlation</a>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>Every test above is the same recipe: <strong>statistic = (observed − expected under H₀) / noise</strong>, compared with its null distribution (normal, t, χ², F, or a rank distribution) to get a p-value.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Running a normality test first and switching tests based on its p-value is shaky: with big n, Shapiro rejects tiny harmless departures; with small n it misses big ones. Look at a histogram or QQ-plot and think about the question you need answered (means or "tends larger").</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Multiple testing.</b> Each test controls its own false-alarm rate at α. The launch dashboard runs one test per metric, 20 of them. What happens to the chance of at least one false alarm?</div>

  <h2 id="sht-multi"><span class="num">13</span>Multiple Testing</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>α = 0.05 is a promise for <em>one</em> test. If we run 20, how many false alarms should we expect, and how do we correct for it?</p>
  </div>
  <p>A product dashboard compares 20 metrics after every launch. Even if the launch did nothing at all, each metric has a 5% chance to look "significant". Across 20, at least one false alarm is more likely than not.</p>
  <p>By hand: P(no false alarm in one test) = 0.95. In 20 independent tests: 0.95²⁰ = 0.358. So P(at least one) = 1 − 0.358 = <strong>0.64</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Buy one lottery ticket and winning is a surprise. Buy 20 and one small win is expected. If you test 20 things, one "win" at p = 0.04 is not surprising news; it is what luck does.</p>
  </div>
  <h3>Two fixes, by hand on 8 p-values</h3>
  <p>The checkout launch's 8 secondary metrics have p-values (sorted): 0.001, 0.008, 0.012, 0.030, 0.041, 0.20, 0.35, 0.60. m = 8 tests.</p>
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
    <p><strong>FWER</strong> (family-wise error rate): P(at least one false positive among all tests) = 1 − (1 − α)^m for m independent tests. <strong>FDR</strong> (false discovery rate): among the things you call significant, the expected fraction that are false.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Correction only works if you count every test you ran, including the segments and metrics you looked at and then "forgot". Best fix: name one primary metric before the test starts.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How it all connects.</b> Thirteen steps, one idea. Let's see them as one picture before the traps and the revision sheet.</div>

  <h2 id="sht-connect"><span class="num">14</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>H₀, statistics, null distributions, p, α, β, CIs, power, a dozen named tests, corrections: how are they one system?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 350" width="680">
<defs><marker id="sht-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="120" height="44" rx="7" class="fb sb"/><text x="70" y="29" text-anchor="middle" font-size="11.5" font-weight="700">question</text><text x="70" y="45" text-anchor="middle" class="tm" font-size="10">is the new page faster?</text>
<line x1="130" y1="32" x2="148" y2="32" stroke="currentColor" marker-end="url(#sht-a9)"/>
<rect x="150" y="10" width="110" height="44" rx="7" class="fb sb"/><text x="205" y="29" text-anchor="middle" font-size="11.5" font-weight="700">H₀ / H₁</text><text x="205" y="45" text-anchor="middle" class="tm" font-size="10">μ = 30 vs μ ≠ 30</text>
<line x1="260" y1="32" x2="278" y2="32" stroke="currentColor" marker-end="url(#sht-a9)"/>
<rect x="280" y="10" width="120" height="44" rx="7" class="fb sb"/><text x="340" y="29" text-anchor="middle" font-size="11.5" font-weight="700">test statistic</text><text x="340" y="45" text-anchor="middle" class="tm" font-size="10">t = −3/0.707 = −4.24</text>
<line x1="400" y1="32" x2="418" y2="32" stroke="currentColor" marker-end="url(#sht-a9)"/>
<rect x="420" y="10" width="125" height="44" rx="7" class="fb sb"/><text x="482" y="29" text-anchor="middle" font-size="11.5" font-weight="700">sampling distr.</text><text x="482" y="45" text-anchor="middle" class="tm" font-size="10">t(4) if H₀ true</text>
<line x1="545" y1="32" x2="563" y2="32" stroke="currentColor" marker-end="url(#sht-a9)"/>
<rect x="565" y="10" width="105" height="44" rx="7" class="fg sg"/><text x="617" y="29" text-anchor="middle" font-size="11.5" font-weight="700">p-value</text><text x="617" y="45" text-anchor="middle" class="tm" font-size="10">tail area 0.013</text>
<line x1="617" y1="54" x2="617" y2="88" stroke="currentColor" marker-end="url(#sht-a9)"/>
<rect x="520" y="90" width="150" height="44" rx="7" class="fr sr"/><text x="595" y="109" text-anchor="middle" font-size="11.5" font-weight="700">α, Type I / II</text><text x="595" y="125" text-anchor="middle" class="tm" font-size="10">0.013 &lt; 0.05 → reject</text>
<line x1="520" y1="112" x2="452" y2="112" stroke="currentColor" marker-end="url(#sht-a9)"/>
<rect x="300" y="90" width="150" height="44" rx="7" class="ft st"/><text x="375" y="109" text-anchor="middle" font-size="11.5" font-weight="700">confidence interval</text><text x="375" y="125" text-anchor="middle" class="tm" font-size="10">27 ± 1.96 → 25.0–29.0</text>
<line x1="300" y1="112" x2="232" y2="112" stroke="currentColor" marker-end="url(#sht-a9)"/>
<rect x="60" y="90" width="170" height="44" rx="7" class="ft st"/><text x="145" y="109" text-anchor="middle" font-size="11.5" font-weight="700">power &amp; sample size</text><text x="145" y="125" text-anchor="middle" class="tm" font-size="10">pilot 0.11 · need 14,749/arm</text>
<line x1="340" y1="134" x2="340" y2="168" stroke="currentColor" marker-end="url(#sht-a9)"/><text x="348" y="155" class="tm" font-size="9.5">same recipe, different data → which test?</text>
<rect x="10" y="170" width="120" height="50" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="70" y="189" text-anchor="middle" font-size="11.5" font-weight="700">z (proportions)</text><text x="70" y="205" text-anchor="middle" class="tm" font-size="10">13% vs 10%: z 2.10</text>
<rect x="140" y="170" width="130" height="50" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="205" y="189" text-anchor="middle" font-size="11.5" font-weight="700">t: 1-sample · Welch</text><text x="205" y="205" text-anchor="middle" class="tm" font-size="10">−4.24 · 3.10 · paired 7.10</text>
<rect x="280" y="170" width="120" height="50" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="340" y="189" text-anchor="middle" font-size="11.5" font-weight="700">χ² (counts)</text><text x="340" y="205" text-anchor="middle" class="tm" font-size="10">device × buy 11.94</text>
<rect x="410" y="170" width="120" height="50" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="470" y="189" text-anchor="middle" font-size="11.5" font-weight="700">ANOVA (F)</text><text x="470" y="205" text-anchor="middle" class="tm" font-size="10">3 colours: F 19</text>
<rect x="540" y="170" width="130" height="50" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="605" y="189" text-anchor="middle" font-size="11.5" font-weight="700">rank tests</text><text x="605" y="205" text-anchor="middle" class="tm" font-size="10">whale: MW p 0.003</text>
<line x1="70" y1="220" x2="300" y2="262" stroke="currentColor" stroke-opacity=".5"/><line x1="205" y1="220" x2="320" y2="262" stroke="currentColor" stroke-opacity=".5"/><line x1="340" y1="220" x2="340" y2="262" stroke="currentColor" stroke-opacity=".5"/><line x1="470" y1="220" x2="360" y2="262" stroke="currentColor" stroke-opacity=".5"/><line x1="605" y1="220" x2="380" y2="262" stroke="currentColor" stroke-opacity=".5" marker-end="url(#sht-a9)"/>
<rect x="160" y="264" width="360" height="44" rx="7" class="fr sr"/><text x="340" y="283" text-anchor="middle" font-size="11.5" font-weight="700">multiple testing: many tests → many false alarms</text><text x="340" y="299" text-anchor="middle" class="tm" font-size="10">20 metrics: 64% · Bonferroni 1 vs BH 3 discoveries</text>
<text x="340" y="335" text-anchor="middle" class="tm" font-size="10.5">z² = χ² for a 2×2 table (4.42) · t² = F for two groups · ranks replace values when outliers rule</text>
</svg><figcaption>Top row: the single recipe every test follows. Second row: what we do with the p-value (decide, at a chosen α), what we report beside it (a CI), and what we plan before (power, n). Third row: the same recipe with a different statistic for each kind of data. Bottom: the price of running many of them.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the checkout pilots</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers</th><th>Our value</th><th>Use when</th></tr>
    <tr><td>H₀ / H₁</td><td>the question, made testable</td><td>what would "nothing happening" look like?</td><td>no preference; μ = 30 s</td><td>always, before data</td></tr>
    <tr><td>Test statistic</td><td>(estimate − H₀ value)/SE</td><td>how far from H₀, in noise units?</td><td>t = −4.24</td><td>every test</td></tr>
    <tr><td>Sampling distribution</td><td>CLT; t, χ², F curves</td><td>what does luck alone produce?</td><td>t(4); 2.776 (sim 2.796)</td><td>to turn a statistic into p</td></tr>
    <tr><td>p-value</td><td>tail area of the null distribution</td><td>how surprising under H₀?</td><td>0.013; lab test 0.021</td><td>reporting evidence</td></tr>
    <tr><td>α, Type I/II</td><td>cut-off on p</td><td>act or not? how often wrong?</td><td>α 0.05 (sim 0.048)</td><td>decisions</td></tr>
    <tr><td>Confidence interval</td><td>estimate ± t*·SE</td><td>how big, how sure?</td><td>[25.04, 28.96] s</td><td>always beside p</td></tr>
    <tr><td>Power, n</td><td>effect / SE vs critical value</td><td>will we catch a real effect?</td><td>pilot 0.11; need 14,749/arm</td><td>before collecting data</td></tr>
    <tr><td>z (proportions)</td><td>difference of rates / pooled SE</td><td>two rates differ?</td><td>z 2.10, p 0.036; CI +0.2 to +5.8 pp</td><td>conversion, CTR</td></tr>
    <tr><td>Welch / paired t</td><td>difference / its SE</td><td>two means differ?</td><td>3.10 (p .055); paired 7.10</td><td>times, revenue</td></tr>
    <tr><td>χ²</td><td>Σ(O − E)²/E</td><td>categories related?</td><td>11.94, p 0.0005</td><td>count tables, SRM</td></tr>
    <tr><td>ANOVA F</td><td>between / within variance</td><td>3+ means differ?</td><td>F 19</td><td>several variants</td></tr>
    <tr><td>Rank tests</td><td>ranks instead of values</td><td>one group tends larger?</td><td>whale: 0.003 vs t 0.38</td><td>outliers, ratings</td></tr>
    <tr><td>Multiple testing</td><td>α spread over m tests</td><td>many tests, few false alarms?</td><td>64% → Bonferroni 1, BH 3</td><td>dashboards, segments</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>a test asks how often luck alone would produce a statistic this far from H₀, using the statistic's sampling distribution.</strong> Every named test is that sentence with a different statistic; α turns the answer into a decision, the CI shows the size, power tells you in advance whether the study can succeed, and corrections keep the promise when you ask many times.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common mistakes.</b> The traps in one place.</div>

  <h2 id="sht-traps"><span class="num">15</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which errors turn correct arithmetic into wrong conclusions?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reading p as the chance H₀ is true</span>
    <p>p = 0.03 does not mean "3% chance the change did nothing". It means "if the change did nothing, results this extreme happen 3% of the time". Same words, different order, very different meaning.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: "not significant" = "no effect"</span>
    <p>A small test can miss a real effect: our conversion pilot had 11% power for +1 pp. Look at the CI. [−5%, +8%] means "we don't know"; [−0.1%, +0.1%] with good power means "any effect is tiny".</p>
  </div>
  <div class="callout trap"><span class="label">Trap: p-hacking</span>
    <p>Trying several tests, dropping "outliers", adding segments or stopping early until p &lt; 0.05. Each try is another lottery ticket. Fix the test, metric, n and α before you look.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: ddof and Student's default</span>
    <p><code>np.std</code> divides by n unless you pass <code>ddof=1</code>. <code>ttest_ind</code> assumes equal variances unless you pass <code>equal_var=False</code>. Both silently change your answer.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: unpaired test on paired data</span>
    <p>Same users before/after, same queries on two models: use the paired test. Our 8 testers went from p = 0.0002 (paired) to p = 0.37 (unpaired) on identical numbers.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: z cut-offs on tiny samples</span>
    <p>With 5 shoppers, |t| ≥ 1.96 happens 12% of the time under H₀. Use the t-distribution's 2.776.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: significance without size</span>
    <p>With 10 million users, a 0.01% lift can have p &lt; 0.001. Always report the effect size and CI next to p, and compare them with the smallest effect worth acting on.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Revision.</b> The whole note condensed onto one sheet.</div>

  <h2 id="sht-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: pilots of a one-page checkout. Lab: 9 of 10 testers prefer it. Times (new page): 27, 25, 28, 26, 29 s vs the old page's 30 s. Conversion: old 100/1,000, new 130/1,000. Welch: old 31, 33, 35 vs new 28, 29, 30 s. Paired differences for 8 testers: 7, 4, 8, 2, 8, 5, 5, 9 s. Device table (new page): mobile 60/600 bought, desktop 70/400.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>Our answer</th><th>Weakness → next</th></tr>
    <tr><td>H₀ / H₁</td><td>how to make "better?" testable</td><td>9 of 10: p = 22/1024 = 0.021</td><td>counting works only for tiny yes/no data</td></tr>
    <tr><td>Test statistic</td><td>distance from H₀ in noise units</td><td>t = −3/0.707 = −4.24</td><td>big or normal?</td></tr>
    <tr><td>Sampling distribution</td><td>what luck alone produces</td><td>t(4): ±2.776 holds 95%</td><td>need one surprise number</td></tr>
    <tr><td>p-value</td><td>how surprising under H₀</td><td>0.013</td><td>where to draw the line?</td></tr>
    <tr><td>α, errors</td><td>decide; how often wrong</td><td>reject at 0.05, not at 0.01</td><td>says nothing about size</td></tr>
    <tr><td>CI</td><td>how big, how sure</td><td>[25.04, 28.96] s</td><td>small studies miss effects</td></tr>
    <tr><td>Power, n</td><td>will we catch it? how many?</td><td>pilot 0.11; 14,749 per arm</td><td>recipe shown only for one mean</td></tr>
    <tr><td>z-test</td><td>two rates differ?</td><td>z 2.10, p 0.036, CI +0.2 to +5.8 pp</td><td>means of two groups / pairs</td></tr>
    <tr><td>Welch, paired t</td><td>two means differ?</td><td>3.10 (p 0.055); 7.10 vs 0.93</td><td>counts, 3+ groups</td></tr>
    <tr><td>χ², ANOVA</td><td>categories related? 3+ means?</td><td>11.94; F 19</td><td>outliers wreck means</td></tr>
    <tr><td>Rank tests</td><td>which tends larger?</td><td>whale: 0.003 vs 0.38</td><td>which test when?</td></tr>
    <tr><td>Which test</td><td>pick by type, groups, behaviour</td><td>decision table</td><td>many tests at once</td></tr>
    <tr><td>Multiple testing</td><td>keep false alarms down</td><td>64%; Bonferroni 1, BH 3</td><td>a real experiment → A/B note</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>One-sample t</td><td>t = (x̄ − μ₀)/(s/√n), df n − 1</td><td>μ₀ H₀ value; s sample sd</td></tr>
    <tr><td>p-value (two-sided)</td><td>p = P(|T| ≥ |t_obs| given H₀)</td><td>T follows the null distribution</td></tr>
    <tr><td>Confidence interval</td><td>estimate ± t* · SE</td><td>t* = t.ppf(0.975, df)</td></tr>
    <tr><td>Power (one-sided z)</td><td>1 − β = P(Z &gt; z₁₋α − δ/SE)</td><td>δ true effect</td></tr>
    <tr><td>n per arm (proportions)</td><td>(z₁₋α/₂ + z₁₋β)² [p₁(1 − p₁) + p₂(1 − p₂)]/δ²</td><td>1.96, 0.84 for α 0.05, power 0.8</td></tr>
    <tr><td>Two-proportion z</td><td>(p̂₂ − p̂₁)/√(p̂(1 − p̂)(1/n₁ + 1/n₂))</td><td>p̂ pooled rate</td></tr>
    <tr><td>Welch t</td><td>(x̄₁ − x̄₂)/√(s₁²/n₁ + s₂²/n₂)</td><td>Welch df formula</td></tr>
    <tr><td>Paired t</td><td>d̄/(s_d/√n)</td><td>d per-unit differences</td></tr>
    <tr><td>Chi-square</td><td>Σ(O − E)²/E; E = row × col / total</td><td>df (r − 1)(c − 1)</td></tr>
    <tr><td>ANOVA F</td><td>(SSB/(k − 1))/(SSW/(N − k))</td><td>k groups, N values</td></tr>
    <tr><td>Mann-Whitney U</td><td>number of (A, B) pairs where A &gt; B</td><td>expected n_A n_B/2 under H₀</td></tr>
    <tr><td>FWER; Bonferroni; BH</td><td>1 − (1 − α)^m; p &lt; α/m; p₍ᵢ₎ ≤ (i/m)α</td><td>m tests</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>t-tests</b><p>Means: one group vs a value, two groups (Welch), same units twice (paired).</p><small>Not for heavy outliers at small n; never unpaired on paired data</small></div>
    <div><b>z-test / χ²</b><p>Proportions with large n; count tables (independence, SRM).</p><small>Expected counts ≥ 5, else exact/Fisher</small></div>
    <div><b>ANOVA</b><p>3+ group means, then Tukey for pairs.</p><small>Kruskal-Wallis for skewed data</small></div>
    <div><b>Rank tests</b><p>Outliers, ratings, small skewed samples.</p><small>Test "tends larger", not means</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>p as P(H₀ true); "not significant" as "no effect"; p-hacking and choosing one-sided after looking; ddof and equal_var defaults; unpaired tests on paired data; z cut-offs on tiny samples; significance without effect size; uncorrected multiple tests; post-hoc "observed power".</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Data 27, 25, 28, 26, 29; H₀ μ = 30. t?</td><td>s 1.581, SE 0.707, t = −4.24, df 4, p ≈ 0.013</td></tr>
    <tr><td>95% CI for the same data?</td><td>27 ± 2.776 × 0.707 = [25.04, 28.96]</td></tr>
    <tr><td>100/1000 vs 130/1000: z?</td><td>pooled 0.115, SE 0.0143, z = 2.10, p 0.036</td></tr>
    <tr><td>Expected count: 600 mobile, 130 buyers of 1000?</td><td>600 × 130/1000 = 78</td></tr>
    <tr><td>20 independent tests at 0.05: P(≥ 1 false alarm)?</td><td>1 − 0.95²⁰ = 0.64</td></tr>
  </table>

  <h2 id="sht-qa"><span class="num">16</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Explain a p-value to a product manager.</summary><div class="qa-body">"Assume the change did nothing. How often would random noise alone produce a lift this big? p = 0.03 means about 3% of the time. That's rare, so we doubt the 'did nothing' story." Avoid saying "97% chance it works".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute t by hand: data [27, 25, 28, 26, 29], H₀ mean 30.</summary><div class="qa-body">Mean 27. Squared deviations 0, 4, 1, 1, 4 sum to 10; variance 10/4 = 2.5; s = 1.581; SE = 1.581/√5 = 0.707; t = −3/0.707 = −4.24 with 4 df; two-sided p ≈ 0.013.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a 95% confidence interval mean?</summary><div class="qa-body">If we repeated the study many times and built an interval each time with this method, about 95% of those intervals would contain the true value (958 of 1,000 in our simulation). It is not "95% chance the true value is in this particular interval" (that is the Bayesian credible interval).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>p = 0.04 with 10 million users and a lift of 0.01%. Ship it?</summary><div class="qa-body">Statistically significant, practically meaningless. Huge n detects tiny effects. Check the CI against the minimum effect worth the engineering and risk cost. Probably not.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your test gives p = 0.3. Can you conclude the feature has no effect?</summary><div class="qa-body">No. Maybe the effect is real but the test was underpowered. Look at the CI: if it's [−5%, +8%], you learned little. If it's [−0.1%, +0.1%] with good power, you can say any effect is negligible.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When do you use a paired test?</summary><div class="qa-body">When each observation in one group has a natural partner in the other: same user before/after, same query on two models, twins. Test the differences; it removes between-unit variance and boosts power (our 8 testers: t 7.10 paired vs 0.93 unpaired).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Type I or Type II: which is worse?</summary><div class="qa-body">Depends on cost. Shipping a harmful feature (Type I) is usually worse in product tests, so α is kept low. In disease screening, missing a sick patient (Type II) is worse, so you favour sensitivity.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is power and how do you raise it?</summary><div class="qa-body">The probability of detecting an effect that really exists (1 − β). Raise it with a larger n, a bigger true effect, less noise (paired design, CUPED, better measurement), or a larger α. A medium effect (d = 0.5) needs about 64 per group for 80% power.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you test if conversion differs across 4 countries?</summary><div class="qa-body">Chi-square test of independence on a 4 × 2 table (country × converted). If significant, do pairwise two-proportion tests with a Bonferroni or BH correction to find which countries differ.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute the expected count: 600 mobile shoppers, 130 buyers out of 1,000 total.</summary><div class="qa-body">E = row total × column total / grand total = 600 × 130 / 1000 = 78. Observed 60 contributes (60 − 78)²/78 = 4.15 to χ².</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens to the CI width if you quadruple n?</summary><div class="qa-body">It halves. SE = σ/√n, and √4 = 2.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You test 50 product metrics and 3 are significant at 0.05. Excited?</summary><div class="qa-body">No: you'd expect 2.5 false positives by chance alone. Apply FDR correction, and pre-register one primary metric next time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why Welch instead of Student's t?</summary><div class="qa-body">Student's t assumes equal variances in both groups; if wrong (especially with unequal n), its false-positive rate drifts. Welch adjusts the degrees of freedom and is nearly as powerful when variances are equal. Safe default.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Revenue per user is very skewed. t-test or Mann-Whitney?</summary><div class="qa-body">If the question is "did mean revenue change?" and n is large (thousands), the t-test is valid by the CLT; consider capping outliers or bootstrapping the CI. Mann-Whitney answers a different question (do values tend to be larger), which may not match the business goal.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does every test need a sampling distribution?</summary><div class="qa-body">A statistic alone (t = −4.24) has no meaning until we know what values luck produces when H₀ is true. The null distribution (t(4) here, from the CLT and the Distributions note) turns the statistic into a tail area, the p-value. Get the distribution wrong (dependence, outliers, z instead of t at n = 5) and the p-value is wrong even with perfect arithmetic.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how are the test and the confidence interval related?</summary><div class="qa-body">They use the same statistic and the same critical value. A 95% CI excludes the H₀ value exactly when the two-sided p &lt; 0.05: our CI [25.04, 28.96] excludes 30, and p = 0.013. The CI adds what the test lacks: the size of the effect.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip the power calculation?</summary><div class="qa-body">You may run a study that cannot succeed: the 1,000-per-arm conversion pilot had 11% power for a realistic +1 pp lift, so 89% of the time it would say "not significant" about a real gain, and a good idea would be killed. Power fixes n before data (14,749 per arm here).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how are the z-test, χ² and the t-test related?</summary><div class="qa-body">For a 2×2 table, χ² = z² (4.42 = 2.10²) with the same p. For two groups, ANOVA's F = t². The t-test becomes the z-test as n grows (t → N(0, 1)). They are one recipe with different null distributions.</div></details>
</main>`
});
