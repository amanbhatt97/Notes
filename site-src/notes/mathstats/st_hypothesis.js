// notes/mathstats/st_hypothesis.js — Hypothesis Testing
Object.assign(TOPIC_CONTENT, {
  "st_hypothesis": `<main>
  <h1>Hypothesis Testing</h1>
  <div class="where"><span>Mathematics &amp; Statistics</span><span>Statistics</span><span>Hypothesis Testing</span></div>
  <p class="lead">Every dataset is a little noisy, so every comparison shows some difference even when nothing real is going on. <strong>Hypothesis testing</strong> is the method for deciding whether a difference you see is real or something luck alone could easily have produced. Every A/B test, every "is model B really better than model A?" and every "did the change help?" question runs on it, and interviewers probe the meaning of the p-value and the choice of test harder than almost anything else in statistics. This page follows one story from start to finish: an online shop has built a <strong>one-page checkout</strong> to replace its old three-step checkout, and before risking real traffic it runs a series of small pilot studies. Each new idea, from the null hypothesis and the p-value to confidence intervals, the family of tests and power, is built on one of those pilots, first by hand with small numbers and then checked in Python.</p>

  <h2 id="sht-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Hypothesis Testing</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The logic</div>
        <ul>
          <li><b>H₀</b>: nothing is going on; <b>H₁</b>: something is</li>
          <li><b>Statistic</b> = (estimate − H₀ value) ÷ SE</li>
          <li><b>p-value</b>: if H₀ were true, how often would luck look this extreme?</li>
          <li>Reject H₀ when p &lt; α (usually 0.05, chosen in advance)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Errors and planning</div>
        <ul>
          <li><b>Type I</b>: false alarm, rate α</li>
          <li><b>Type II</b>: missed effect, rate β; <b>power</b> = 1 − β</li>
          <li><b>CI</b> = estimate ± critical value × SE</li>
          <li>Power grows with n, effect size, α; falls with noise</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Which test</div>
        <ul>
          <li>Means: one-sample, Welch two-sample, paired t</li>
          <li>Rates: two-proportion z</li>
          <li>Count tables: chi-square; 3+ means: ANOVA</li>
          <li>Outliers, ratings: rank tests (Mann-Whitney)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Traps</div>
        <ul>
          <li>p is not P(H₀ is true)</li>
          <li>Not significant ≠ no effect</li>
          <li>Significant ≠ important</li>
          <li>Many tests or peeking → many false alarms</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sht-h0"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Null and Alternative Hypotheses</span><span class="rm-sub">assume nothing is happening, then look for surprise</span></div></div>
      <div class="rm-item rm-done" data-target="sht-stat"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Test Statistics and Sampling Distributions</span><span class="rm-sub">distance from H₀ in units of noise, and what luck produces</span></div></div>
      <div class="rm-item rm-done" data-target="sht-p"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The p-value</span><span class="rm-sub">what it means and the four classic misreadings</span></div></div>
      <div class="rm-item rm-done" data-target="sht-err"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Significance Level and Type I/II Errors</span><span class="rm-sub">false alarms and missed effects</span></div></div>
      <div class="rm-item rm-done" data-target="sht-ci"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Confidence Intervals</span><span class="rm-sub">how big is the effect, and how sure are we?</span></div></div>
      <div class="rm-item rm-done" data-target="sht-t"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">t-tests</span><span class="rm-sub">one-sample, two-sample (Welch) and paired</span></div></div>
      <div class="rm-item rm-done" data-target="sht-z"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">The z-test for Proportions</span><span class="rm-sub">comparing two conversion rates</span></div></div>
      <div class="rm-item rm-done" data-target="sht-power"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Power and Sample Size</span><span class="rm-sub">how many users before you start</span></div></div>
      <div class="rm-item rm-done" data-target="sht-chi"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Chi-square Test</span><span class="rm-sub">are two categories related?</span></div></div>
      <div class="rm-item rm-done" data-target="sht-anova"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">ANOVA</span><span class="rm-sub">comparing three or more group means</span></div></div>
      <div class="rm-item rm-done" data-target="sht-np"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Rank (Non-parametric) Tests</span><span class="rm-sub">when one huge value breaks the mean</span></div></div>
      <div class="rm-item rm-done" data-target="sht-multi"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Multiple Testing</span><span class="rm-sub">twenty tests, one false alarm; Bonferroni and BH</span></div></div>
      <div class="rm-item rm-done" data-target="sht-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">defaults, pairing, peeking, misreading p</span></div></div>
      <div class="rm-item rm-done" data-target="sht-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">which test when, formulas, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="sht-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on testing</span></div></div>
    </div>
  </div>

  <h2 id="sht-h0"><span class="num">01</span>Null and Alternative Hypotheses</h2>
  <p>Without a method, people see a pattern in every wiggle. Sales go from 100 to 104 the day after a change and the team celebrates, even though sales jump around by 5 or 10 on perfectly normal days. Hypothesis testing exists to ask one disciplined question before anyone celebrates: "could plain luck easily have given a result like this?"</p>
  <p>The approach is a little backwards, and that is what makes it work. Instead of trying to prove that the new checkout is better, we start by assuming the boring answer: <strong>nothing special is happening</strong>. Then we work out what results luck alone would usually produce under that assumption. If our actual result would be very rare in a world where nothing is happening, we stop believing that world. The boring assumption is called the <strong>null hypothesis</strong>, written H₀ ("H-nought"): the statement that there is no effect, no difference, no preference. The claim we suspect is true, that there <em>is</em> an effect, is the <strong>alternative hypothesis</strong>, H₁.</p>
  <p>A courtroom works exactly the same way. The accused is presumed innocent (H₀). The prosecution has to bring evidence so strong that innocence becomes hard to believe, "beyond reasonable doubt". If the evidence is weak, the verdict is "not guilty", which is <em>not</em> the same as "proved innocent"; it only means the evidence was not enough. A test behaves the same way: we can "reject H₀" when the evidence is strong, or "fail to reject H₀" when it is not, but we never prove H₀ true.</p>
  <p>Let us run the very first pilot entirely by hand. Ten testers try both checkouts in a usability lab and each names a favourite. Nine pick the new page. Is that a real preference, or could it be luck?</p>
  <p>Step one is to state H₀ precisely: testers have no real preference, so each choice is like a fair coin flip, with a 50% chance of picking the new page. Step two is to list everything luck could do. Ten coin flips have 2¹⁰ = 1024 equally likely patterns. Step three is to count the patterns at least as extreme as what we saw. "Nine pick new" can happen in 10 ways (any one of the ten testers could be the one who picked the old page), and "ten pick new" in 1 way, so 11 patterns. But a split this lopsided in the other direction (1 or 0 picking new) would be just as surprising under H₀, which adds another 11. Step four: 22 extreme patterns out of 1024 is 0.021. In a world with no preference, a split this lopsided turns up only about 2 times in 100. That 0.021 is the <strong>p-value</strong>, and we will take it apart properly in section 03.</p>
  <figure class="viz"><svg fill="currentColor" style="max-width:680px;width:100%;height:auto" xmlns:xlink="http://www.w3.org/1999/xlink"  viewBox="0 0 416.655156 210.073156" xmlns="http://www.w3.org/2000/svg" version="1.1">
<defs>
</defs>
<g id="sht-ch_binom-figure_1">
<g id="sht-ch_binom-patch_1">
<path d="M 0 210.073156 
L 416.655156 210.073156 
L 416.655156 -0 
L 0 -0 
L 0 210.073156 
z
" style="fill: none"/>
</g>
<g id="sht-ch_binom-axes_1">
<g id="sht-ch_binom-patch_2">
<path d="M 52.335156 171.872375 
L 409.455156 171.872375 
L 409.455156 11.096375 
L 52.335156 11.096375 
L 52.335156 171.872375 
z
" style="fill: none"/>
</g>
<g id="sht-ch_binom-patch_3">
<path d="M 68.567884 171.872375 
L 91.218201 171.872375 
L 91.218201 171.330969 
L 68.567884 171.330969 
z
" clip-path="url(#sht-ch_binom-p91ae7737b0)" style="fill: #ef4444"/>
</g>
<g id="sht-ch_binom-patch_4">
<path d="M 98.768306 171.872375 
L 121.418623 171.872375 
L 121.418623 166.458313 
L 98.768306 166.458313 
z
" clip-path="url(#sht-ch_binom-p91ae7737b0)" style="fill: #ef4444"/>
</g>
<g id="sht-ch_binom-patch_5">
<path d="M 128.968729 171.872375 
L 151.619046 171.872375 
L 151.619046 147.509094 
L 128.968729 147.509094 
z
" clip-path="url(#sht-ch_binom-p91ae7737b0)" style="fill: #3b82f6"/>
</g>
<g id="sht-ch_binom-patch_6">
<path d="M 159.169152 171.872375 
L 181.819469 171.872375 
L 181.819469 106.903625 
L 159.169152 106.903625 
z
" clip-path="url(#sht-ch_binom-p91ae7737b0)" style="fill: #3b82f6"/>
</g>
<g id="sht-ch_binom-patch_7">
<path d="M 189.369575 171.872375 
L 212.019892 171.872375 
L 212.019892 58.177062 
L 189.369575 58.177062 
z
" clip-path="url(#sht-ch_binom-p91ae7737b0)" style="fill: #3b82f6"/>
</g>
<g id="sht-ch_binom-patch_8">
<path d="M 219.569998 171.872375 
L 242.220315 171.872375 
L 242.220315 35.438 
L 219.569998 35.438 
z
" clip-path="url(#sht-ch_binom-p91ae7737b0)" style="fill: #3b82f6"/>
</g>
<g id="sht-ch_binom-patch_9">
<path d="M 249.770421 171.872375 
L 272.420738 171.872375 
L 272.420738 58.177062 
L 249.770421 58.177062 
z
" clip-path="url(#sht-ch_binom-p91ae7737b0)" style="fill: #3b82f6"/>
</g>
<g id="sht-ch_binom-patch_10">
<path d="M 279.970843 171.872375 
L 302.62116 171.872375 
L 302.62116 106.903625 
L 279.970843 106.903625 
z
" clip-path="url(#sht-ch_binom-p91ae7737b0)" style="fill: #3b82f6"/>
</g>
<g id="sht-ch_binom-patch_11">
<path d="M 310.171266 171.872375 
L 332.821583 171.872375 
L 332.821583 147.509094 
L 310.171266 147.509094 
z
" clip-path="url(#sht-ch_binom-p91ae7737b0)" style="fill: #3b82f6"/>
</g>
<g id="sht-ch_binom-patch_12">
<path d="M 340.371689 171.872375 
L 363.022006 171.872375 
L 363.022006 166.458313 
L 340.371689 166.458313 
z
" clip-path="url(#sht-ch_binom-p91ae7737b0)" style="fill: #ef4444"/>
</g>
<g id="sht-ch_binom-patch_13">
<path d="M 370.572112 171.872375 
L 393.222429 171.872375 
L 393.222429 171.330969 
L 370.572112 171.330969 
z
" clip-path="url(#sht-ch_binom-p91ae7737b0)" style="fill: #ef4444"/>
</g>
<g id="sht-ch_binom-matplotlib.axis_1">
<g id="sht-ch_binom-xtick_1">
<g id="sht-ch_binom-line2d_1">
<defs>
<path id="sht-ch_binom-m7c25c535dc" d="M 0 0 
L 0 3.5 
" style="stroke: currentColor; stroke-width: 0.8"/>
</defs>
<g>
<use xlink:href="#sht-ch_binom-m7c25c535dc" x="79.893042" y="171.872375" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_binom-text_1">
<text style="font-size: 10px; text-anchor: middle" x="79.893042" y="186.470031" transform="rotate(-0 79.893042 186.470031)">0</text>
</g>
</g>
<g id="sht-ch_binom-xtick_2">
<g id="sht-ch_binom-line2d_2">
<g>
<use xlink:href="#sht-ch_binom-m7c25c535dc" x="110.093465" y="171.872375" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_binom-text_2">
<text style="font-size: 10px; text-anchor: middle" x="110.093465" y="186.470031" transform="rotate(-0 110.093465 186.470031)">1</text>
</g>
</g>
<g id="sht-ch_binom-xtick_3">
<g id="sht-ch_binom-line2d_3">
<g>
<use xlink:href="#sht-ch_binom-m7c25c535dc" x="140.293888" y="171.872375" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_binom-text_3">
<text style="font-size: 10px; text-anchor: middle" x="140.293888" y="186.470031" transform="rotate(-0 140.293888 186.470031)">2</text>
</g>
</g>
<g id="sht-ch_binom-xtick_4">
<g id="sht-ch_binom-line2d_4">
<g>
<use xlink:href="#sht-ch_binom-m7c25c535dc" x="170.494311" y="171.872375" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_binom-text_4">
<text style="font-size: 10px; text-anchor: middle" x="170.494311" y="186.470031" transform="rotate(-0 170.494311 186.470031)">3</text>
</g>
</g>
<g id="sht-ch_binom-xtick_5">
<g id="sht-ch_binom-line2d_5">
<g>
<use xlink:href="#sht-ch_binom-m7c25c535dc" x="200.694733" y="171.872375" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_binom-text_5">
<text style="font-size: 10px; text-anchor: middle" x="200.694733" y="186.470031" transform="rotate(-0 200.694733 186.470031)">4</text>
</g>
</g>
<g id="sht-ch_binom-xtick_6">
<g id="sht-ch_binom-line2d_6">
<g>
<use xlink:href="#sht-ch_binom-m7c25c535dc" x="230.895156" y="171.872375" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_binom-text_6">
<text style="font-size: 10px; text-anchor: middle" x="230.895156" y="186.470031" transform="rotate(-0 230.895156 186.470031)">5</text>
</g>
</g>
<g id="sht-ch_binom-xtick_7">
<g id="sht-ch_binom-line2d_7">
<g>
<use xlink:href="#sht-ch_binom-m7c25c535dc" x="261.095579" y="171.872375" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_binom-text_7">
<text style="font-size: 10px; text-anchor: middle" x="261.095579" y="186.470031" transform="rotate(-0 261.095579 186.470031)">6</text>
</g>
</g>
<g id="sht-ch_binom-xtick_8">
<g id="sht-ch_binom-line2d_8">
<g>
<use xlink:href="#sht-ch_binom-m7c25c535dc" x="291.296002" y="171.872375" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_binom-text_8">
<text style="font-size: 10px; text-anchor: middle" x="291.296002" y="186.470031" transform="rotate(-0 291.296002 186.470031)">7</text>
</g>
</g>
<g id="sht-ch_binom-xtick_9">
<g id="sht-ch_binom-line2d_9">
<g>
<use xlink:href="#sht-ch_binom-m7c25c535dc" x="321.496425" y="171.872375" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_binom-text_9">
<text style="font-size: 10px; text-anchor: middle" x="321.496425" y="186.470031" transform="rotate(-0 321.496425 186.470031)">8</text>
</g>
</g>
<g id="sht-ch_binom-xtick_10">
<g id="sht-ch_binom-line2d_10">
<g>
<use xlink:href="#sht-ch_binom-m7c25c535dc" x="351.696848" y="171.872375" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_binom-text_10">
<text style="font-size: 10px; text-anchor: middle" x="351.696848" y="186.470031" transform="rotate(-0 351.696848 186.470031)">9</text>
</g>
</g>
<g id="sht-ch_binom-xtick_11">
<g id="sht-ch_binom-line2d_11">
<g>
<use xlink:href="#sht-ch_binom-m7c25c535dc" x="381.89727" y="171.872375" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_binom-text_11">
<text style="font-size: 10px; text-anchor: middle" x="381.89727" y="186.470031" transform="rotate(-0 381.89727 186.470031)">10</text>
</g>
</g>
<g id="sht-ch_binom-text_12">
<text style="font-size: 10px; text-anchor: middle" x="230.895156" y="200.470813" transform="rotate(-0 230.895156 200.470813)">testers (of 10) who pick the new page</text>
</g>
</g>
<g id="sht-ch_binom-matplotlib.axis_2">
<g id="sht-ch_binom-ytick_1">
<g id="sht-ch_binom-line2d_12">
<defs>
<path id="sht-ch_binom-mb258c49b38" d="M 0 0 
L -3.5 0 
" style="stroke: currentColor; stroke-width: 0.8"/>
</defs>
<g>
<use xlink:href="#sht-ch_binom-mb258c49b38" x="52.335156" y="171.872375" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_binom-text_13">
<text style="font-size: 10px; text-anchor: end" x="45.335156" y="175.671203" transform="rotate(-0 45.335156 175.671203)">0.00</text>
</g>
</g>
<g id="sht-ch_binom-ytick_2">
<g id="sht-ch_binom-line2d_13">
<g>
<use xlink:href="#sht-ch_binom-mb258c49b38" x="52.335156" y="144.152375" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_binom-text_14">
<text style="font-size: 10px; text-anchor: end" x="45.335156" y="147.951203" transform="rotate(-0 45.335156 147.951203)">0.05</text>
</g>
</g>
<g id="sht-ch_binom-ytick_3">
<g id="sht-ch_binom-line2d_14">
<g>
<use xlink:href="#sht-ch_binom-mb258c49b38" x="52.335156" y="116.432375" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_binom-text_15">
<text style="font-size: 10px; text-anchor: end" x="45.335156" y="120.231203" transform="rotate(-0 45.335156 120.231203)">0.10</text>
</g>
</g>
<g id="sht-ch_binom-ytick_4">
<g id="sht-ch_binom-line2d_15">
<g>
<use xlink:href="#sht-ch_binom-mb258c49b38" x="52.335156" y="88.712375" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_binom-text_16">
<text style="font-size: 10px; text-anchor: end" x="45.335156" y="92.511203" transform="rotate(-0 45.335156 92.511203)">0.15</text>
</g>
</g>
<g id="sht-ch_binom-ytick_5">
<g id="sht-ch_binom-line2d_16">
<g>
<use xlink:href="#sht-ch_binom-mb258c49b38" x="52.335156" y="60.992375" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_binom-text_17">
<text style="font-size: 10px; text-anchor: end" x="45.335156" y="64.791203" transform="rotate(-0 45.335156 64.791203)">0.20</text>
</g>
</g>
<g id="sht-ch_binom-ytick_6">
<g id="sht-ch_binom-line2d_17">
<g>
<use xlink:href="#sht-ch_binom-mb258c49b38" x="52.335156" y="33.272375" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_binom-text_18">
<text style="font-size: 10px; text-anchor: end" x="45.335156" y="37.071203" transform="rotate(-0 45.335156 37.071203)">0.25</text>
</g>
</g>
<g id="sht-ch_binom-text_19">
<text style="font-size: 10px; text-anchor: middle" x="14.851563" y="91.484375" transform="rotate(-90 14.851563 91.484375)">probability if no preference</text>
</g>
</g>
<g id="sht-ch_binom-patch_14">
<path d="M 52.335156 171.872375 
L 52.335156 11.096375 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sht-ch_binom-patch_15">
<path d="M 52.335156 171.872375 
L 409.455156 171.872375 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sht-ch_binom-text_20">
<text style="font-size: 8.5px; text-anchor: middle" x="79.893042" y="168.004569" transform="rotate(-0 79.893042 168.004569)">1</text>
</g>
<g id="sht-ch_binom-text_21">
<text style="font-size: 8.5px; text-anchor: middle" x="110.093465" y="163.131912" transform="rotate(-0 110.093465 163.131912)">10</text>
</g>
<g id="sht-ch_binom-text_22">
<text style="font-size: 8.5px; text-anchor: middle" x="351.696848" y="163.131912" transform="rotate(-0 351.696848 163.131912)">10</text>
</g>
<g id="sht-ch_binom-text_23">
<text style="font-size: 8.5px; text-anchor: middle" x="381.89727" y="168.004569" transform="rotate(-0 381.89727 168.004569)">1</text>
</g>
<g id="sht-ch_binom-text_24">
<text style="font-size: 8.5px; text-anchor: middle" x="230.895156" y="30.500375" transform="rotate(-0 230.895156 30.500375)">252 of 1024</text>
</g>
</g>
</g>
<defs>
<clipPath id="sht-ch_binom-p91ae7737b0">
<rect x="52.335156" y="11.096375" width="357.12" height="160.776"/>
</clipPath>
</defs>
</svg><figcaption>If testers had no preference, each count of "new page" picks would turn up this often. The red bars (9 or more, or 1 or fewer) together cover 22 of the 1024 equally likely patterns: p = 0.021.</figcaption></figure>
  <p>SciPy's <code>binomtest</code> does exactly this counting for any number of yes/no trials (it uses the Binomial distribution from <a class="xref" data-note="st_distributions">Probability Distributions</a>):</p>
  <div class="fx" data-lang="py">from scipy import stats
from math import comb
p_upper = sum(comb(10, k) for k in (9, 10)) / 2**10     # 9 or 10 of 10 pick the new page
print("P(9 or 10 of 10) =", p_upper, "  both directions =", 2 * p_upper)
print(f"binomtest two-sided p = {stats.binomtest(9, n=10, p=0.5).pvalue:.4f}")
print(f"binomtest one-sided p = {stats.binomtest(9, n=10, p=0.5, alternative='greater').pvalue:.4f}")</div>
  <div class="fx" data-lang="text">P(9 or 10 of 10) = 0.0107421875   both directions = 0.021484375
binomtest two-sided p = 0.0215
binomtest one-sided p = 0.0107</div>
  <p><code>comb(10, k)</code> counts the patterns with k testers picking the new page, so the first line is our 11 ÷ 1024 = 0.0107, doubled to 0.0215 for both directions. <code>binomtest</code> gives the same 0.0215. The last line asks a different question: with <code>alternative='greater'</code> it only counts surprises in one direction ("too many prefer new") and gives half the p-value, 0.0107.</p>
  <p>That difference has a name. A <strong>two-sided</strong> test treats a difference in either direction as evidence against H₀ (H₁: "testers have <em>some</em> preference"). A <strong>one-sided</strong> test only counts one direction (H₁: "testers prefer the new page"). Two-sided is the safe default, because in practice you would want to know if the new page were clearly <em>worse</em>. Whichever you choose, choose it before seeing the data: looking at 9 out of 10 and then deciding "I only cared about the new page winning" halves the p-value after the fact, which is a quiet form of cheating.</p>
  <p>Finally, we need a rule for when the evidence is "strong enough". Before collecting data we pick a cut-off called the <strong>significance level</strong>, written α (alpha), almost always 0.05. If the p-value is below α we reject H₀; here 0.021 &lt; 0.05, so we conclude testers do seem to prefer the new page. Section 04 explains what choosing α really commits you to. The whole procedure, which every test on this page follows, is: state H₀ and H₁, choose α, compute a number from the data, find out how unusual that number would be under H₀, and decide.</p>

  <h2 id="sht-stat"><span class="num">02</span>Test Statistics and Sampling Distributions</h2>
  <p>Counting all 1024 patterns works for ten yes/no answers. The next pilot measures checkout <em>time</em>, a number like 27.3 seconds, and there is no way to list every possible outcome. We need a different route: squeeze the whole sample into one number that measures how far the data is from H₀, and then find out how that number behaves when H₀ is true.</p>
  <p>Five shoppers use the new page and take 27, 25, 28, 26 and 29 seconds. Years of logs say the old page averages 30 seconds. H₀ is that the new page's true long-run average, written μ ("mu"), is still 30; H₁ is that it is not. The sample average is 27, so the new page looks 3 seconds faster. But is 3 seconds a lot? That depends entirely on how much averages naturally wobble. Think of a taxi driver who says "ten minutes away" and arrives in thirteen. If his estimates are usually off by five minutes, a three-minute miss is normal. If they are usually off by thirty seconds, it is suspicious. A gap only means something compared with the usual wobble.</p>
  <p>So the number we compute is the gap divided by the usual wobble of the average. That usual wobble is the <strong>standard error</strong> (SE): the typical amount a sample average would move if you repeated the study with new people. It is not the same as the standard deviation, which is the typical spread of individual shoppers. Averages wobble less than individuals, because high and low values partly cancel, and the Central Limit Theorem from the Distributions note says exactly how much less: SE = s ÷ √n, where s is the sample standard deviation and n the sample size. The resulting number is called a <strong>test statistic</strong>; for a mean it is the <strong>t statistic</strong>:</p>
  <div class="fx" data-lang="text">t = (sample mean − H₀ value) ÷ SE          SE = s ÷ √n

mean       = (27 + 25 + 28 + 26 + 29) ÷ 5        = 27
deviations = 0, −2, +1, −1, +2   squared: 0, 4, 1, 1, 4   sum = 10
s          = √(10 ÷ (5 − 1)) = √2.5              = 1.581 s
SE         = 1.581 ÷ √5                          = 0.707 s
t          = (27 − 30) ÷ 0.707                   = −4.24</div>
  <p>In words: the sample mean sits 4.24 standard errors below what H₀ predicts. We divide by n − 1 when computing s for the same reason as in Descriptive Statistics. The same three lines in NumPy:</p>
  <div class="fx" data-lang="py">import numpy as np
small = np.array([27, 25, 28, 26, 29])          # 5 shoppers, seconds to check out (new page)
n = len(small)
mean = small.mean()
dev = small - mean
print("deviations:", dev, " squared:", dev**2, " sum:", (dev**2).sum())
sd = small.std(ddof=1)                          # divide by n - 1
se = sd / np.sqrt(n)                            # standard error of the mean
t = (mean - 30) / se                            # H0: mu = 30 s
print(f"mean = {mean}  sd = {sd:.3f}  se = {se:.3f}  t = {t:.3f}")</div>
  <div class="fx" data-lang="text">deviations: [ 0. -2.  1. -1.  2.]  squared: [0. 4. 1. 1. 4.]  sum: 10.0
mean = 27.0  sd = 1.581  se = 0.707  t = -4.243</div>
  <p>Every number matches the hand calculation. Note <code>std(ddof=1)</code>: NumPy's default divides by n rather than n − 1, a classic silent bug (more in Common Mistakes).</p>
  <p>Now the key question: is −4.24 unusual? To know, we need the list of t values that luck alone produces when H₀ is true. Imagine running this five-shopper pilot over and over in a world where the new page truly averages 30 seconds. Each repeat gives a slightly different sample and so a slightly different t. The spread of all those t values is the statistic's <strong>sampling distribution</strong>, and when we assume H₀ is true it is called the <strong>null distribution</strong>. It is the "normal commutes" against which we judge today's commute.</p>
  <p>We do not have to imagine. The code below simulates 100,000 pilots of five shoppers whose true mean <em>is</em> 30, computes each pilot's t, and compares the result with the theoretical answer, the <strong>t-distribution</strong> with n − 1 = 4 <strong>degrees of freedom</strong> (roughly, the number of independent pieces of information left after estimating the mean):</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
sims = rng.normal(30, 2, size=(100000, 5))      # 100,000 pilots of 5 shoppers, H0 TRUE (mean 30)
m = sims.mean(axis=1)
s = sims.std(axis=1, ddof=1)
t_sim = (m - 30) / (s / np.sqrt(5))             # the t each pilot would report
print("97.5% point: simulated", round(np.quantile(t_sim, 0.975), 3),
      "  t(4) table", round(stats.t.ppf(0.975, 4), 3), "  normal", round(stats.norm.ppf(0.975), 3))
print("share of pilots with |t| &gt;= 1.96 :", round(np.mean(np.abs(t_sim) &gt;= 1.96), 3))
print("share of pilots with |t| &gt;= 4.243:", round(np.mean(np.abs(t_sim) &gt;= 4.243), 4))</div>
  <div class="fx" data-lang="text">97.5% point: simulated 2.796   t(4) table 2.776   normal 1.96
share of pilots with |t| &gt;= 1.96 : 0.121
share of pilots with |t| &gt;= 4.243: 0.0135</div>
  <p>The simulated pilots put 97.5% of their t values below 2.796, and the t(4) table says 2.776: the same curve, up to simulation noise. If we had known the true standard deviation instead of estimating it from five people, the cut-off would have been the normal curve's 1.96. Estimating s from a tiny sample adds extra wobble, so the t curve has fatter tails than the normal; in fact 12% of these no-effect pilots reached |t| ≥ 1.96, so using the normal cut-off with five shoppers would give 12% false alarms instead of 5%. Only 1.35% of the 100,000 pilots reached |t| ≥ 4.24, which already tells us our result is rare under H₀.</p>
  <figure class="viz"><svg fill="currentColor" style="max-width:680px;width:100%;height:auto" xmlns:xlink="http://www.w3.org/1999/xlink"  viewBox="0 0 380.550469 211.720781" xmlns="http://www.w3.org/2000/svg" version="1.1">
<defs>
</defs>
<g id="sht-ch_null-figure_1">
<g id="sht-ch_null-patch_1">
<path d="M 0 211.720781 
L 380.550469 211.720781 
L 380.550469 0 
L 0 0 
L 0 211.720781 
z
" style="fill: none"/>
</g>
<g id="sht-ch_null-axes_1">
<g id="sht-ch_null-patch_2">
<path d="M 13.220313 173.52 
L 370.340312 173.52 
L 370.340312 7.2 
L 13.220313 7.2 
L 13.220313 173.52 
z
" style="fill: none"/>
</g>
<g id="sht-ch_null-patch_3">
<path d="M 13.220313 173.52 
L 16.940313 173.52 
L 16.940313 172.946014 
L 13.220313 172.946014 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_4">
<path d="M 16.940313 173.52 
L 20.660313 173.52 
L 20.660313 172.914126 
L 16.940313 172.914126 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_5">
<path d="M 20.660313 173.52 
L 24.380313 173.52 
L 24.380313 173.073566 
L 20.660313 173.073566 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_6">
<path d="M 24.380313 173.52 
L 28.100313 173.52 
L 28.100313 172.786573 
L 24.380313 172.786573 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_7">
<path d="M 28.100313 173.52 
L 31.820313 173.52 
L 31.820313 172.786573 
L 28.100313 172.786573 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_8">
<path d="M 31.820313 173.52 
L 35.540313 173.52 
L 35.540313 172.850349 
L 31.820313 172.850349 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_9">
<path d="M 35.540313 173.52 
L 39.260313 173.52 
L 39.260313 172.563356 
L 35.540313 172.563356 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_10">
<path d="M 39.260313 173.52 
L 42.980313 173.52 
L 42.980313 172.563356 
L 39.260313 172.563356 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_11">
<path d="M 42.980313 173.52 
L 46.700313 173.52 
L 46.700313 171.893706 
L 42.980313 171.893706 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_12">
<path d="M 46.700313 173.52 
L 50.420313 173.52 
L 50.420313 172.340139 
L 46.700313 172.340139 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_13">
<path d="M 50.420313 173.52 
L 54.140313 173.52 
L 54.140313 172.116923 
L 50.420313 172.116923 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_14">
<path d="M 54.140313 173.52 
L 57.860313 173.52 
L 57.860313 172.053146 
L 54.140313 172.053146 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_15">
<path d="M 57.860313 173.52 
L 61.580313 173.52 
L 61.580313 172.021258 
L 57.860313 172.021258 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_16">
<path d="M 61.580313 173.52 
L 65.300313 173.52 
L 65.300313 171.47916 
L 61.580313 171.47916 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_17">
<path d="M 65.300313 173.52 
L 69.020313 173.52 
L 69.020313 170.937062 
L 65.300313 170.937062 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_18">
<path d="M 69.020313 173.52 
L 72.740313 173.52 
L 72.740313 171.82993 
L 69.020313 171.82993 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_19">
<path d="M 72.740313 173.52 
L 76.460313 173.52 
L 76.460313 170.777621 
L 72.740313 170.777621 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_20">
<path d="M 76.460313 173.52 
L 80.180313 173.52 
L 80.180313 170.331188 
L 76.460313 170.331188 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_21">
<path d="M 80.180313 173.52 
L 83.900313 173.52 
L 83.900313 170.426852 
L 80.180313 170.426852 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_22">
<path d="M 83.900313 173.52 
L 87.620313 173.52 
L 87.620313 170.235523 
L 83.900313 170.235523 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_23">
<path d="M 87.620313 173.52 
L 91.340313 173.52 
L 91.340313 168.290348 
L 87.620313 168.290348 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_24">
<path d="M 91.340313 173.52 
L 95.060313 173.52 
L 95.060313 168.290348 
L 91.340313 168.290348 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_25">
<path d="M 95.060313 173.52 
L 98.780313 173.52 
L 98.780313 167.142376 
L 95.060313 167.142376 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_26">
<path d="M 98.780313 173.52 
L 102.500313 173.52 
L 102.500313 166.664054 
L 98.780313 166.664054 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_27">
<path d="M 102.500313 173.52 
L 106.220313 173.52 
L 106.220313 166.090068 
L 102.500313 166.090068 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_28">
<path d="M 106.220313 173.52 
L 109.940313 173.52 
L 109.940313 164.01734 
L 106.220313 164.01734 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_29">
<path d="M 109.940313 173.52 
L 113.660313 173.52 
L 113.660313 162.741815 
L 109.940313 162.741815 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_30">
<path d="M 113.660313 173.52 
L 117.380313 173.52 
L 117.380313 160.190765 
L 113.660313 160.190765 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_31">
<path d="M 117.380313 173.52 
L 121.100313 173.52 
L 121.100313 156.746848 
L 117.380313 156.746848 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_32">
<path d="M 121.100313 173.52 
L 124.820313 173.52 
L 124.820313 156.268526 
L 121.100313 156.268526 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_33">
<path d="M 124.820313 173.52 
L 128.540313 173.52 
L 128.540313 151.804189 
L 124.820313 151.804189 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_34">
<path d="M 128.540313 173.52 
L 132.260313 173.52 
L 132.260313 147.850062 
L 128.540313 147.850062 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_35">
<path d="M 132.260312 173.52 
L 135.980312 173.52 
L 135.980312 145.299012 
L 132.260312 145.299012 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_36">
<path d="M 135.980313 173.52 
L 139.700313 173.52 
L 139.700313 141.631878 
L 135.980313 141.631878 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_37">
<path d="M 139.700312 173.52 
L 143.420312 173.52 
L 143.420312 134.520827 
L 139.700312 134.520827 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_38">
<path d="M 143.420313 173.52 
L 147.140313 173.52 
L 147.140313 127.090894 
L 143.420313 127.090894 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_39">
<path d="M 147.140312 173.52 
L 150.860312 173.52 
L 150.860312 122.435228 
L 147.140312 122.435228 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_40">
<path d="M 150.860313 173.52 
L 154.580313 173.52 
L 154.580313 113.251449 
L 150.860313 113.251449 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_41">
<path d="M 154.580313 173.52 
L 158.300313 173.52 
L 158.300313 104.386551 
L 154.580313 104.386551 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_42">
<path d="M 158.300313 173.52 
L 162.020313 173.52 
L 162.020313 93.098156 
L 158.300313 93.098156 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_43">
<path d="M 162.020313 173.52 
L 165.740313 173.52 
L 165.740313 81.745984 
L 162.020313 81.745984 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_44">
<path d="M 165.740313 173.52 
L 169.460313 173.52 
L 169.460313 70.77647 
L 165.740313 70.77647 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_45">
<path d="M 169.460313 173.52 
L 173.180313 173.52 
L 173.180313 61.018705 
L 169.460313 61.018705 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_46">
<path d="M 173.180313 173.52 
L 176.900313 173.52 
L 176.900313 48.582337 
L 173.180313 48.582337 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_47">
<path d="M 176.900313 173.52 
L 180.620313 173.52 
L 180.620313 41.91772 
L 176.900313 41.91772 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_48">
<path d="M 180.620313 173.52 
L 184.340313 173.52 
L 184.340313 34.519675 
L 180.620313 34.519675 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_49">
<path d="M 184.340313 173.52 
L 188.060313 173.52 
L 188.060313 26.643309 
L 184.340313 26.643309 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_50">
<path d="M 188.060313 173.52 
L 191.780313 173.52 
L 191.780313 22.434077 
L 188.060313 22.434077 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_51">
<path d="M 191.780313 173.52 
L 195.500313 173.52 
L 195.500313 25.877994 
L 191.780313 25.877994 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_52">
<path d="M 195.500313 173.52 
L 199.220313 173.52 
L 199.220313 24.187924 
L 195.500313 24.187924 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_53">
<path d="M 199.220313 173.52 
L 202.940313 173.52 
L 202.940313 35.827088 
L 199.220313 35.827088 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_54">
<path d="M 202.940313 173.52 
L 206.660313 173.52 
L 206.660313 38.537579 
L 202.940313 38.537579 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_55">
<path d="M 206.660313 173.52 
L 210.380313 173.52 
L 210.380313 53.174227 
L 206.660313 53.174227 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_56">
<path d="M 210.380313 173.52 
L 214.100313 173.52 
L 214.100313 60.699824 
L 210.380313 60.699824 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_57">
<path d="M 214.100313 173.52 
L 217.820312 173.52 
L 217.820312 69.500945 
L 214.100313 69.500945 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_58">
<path d="M 217.820312 173.52 
L 221.540312 173.52 
L 221.540312 82.319971 
L 217.820312 82.319971 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_59">
<path d="M 221.540312 173.52 
L 225.260312 173.52 
L 225.260312 93.576478 
L 221.540312 93.576478 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_60">
<path d="M 225.260312 173.52 
L 228.980312 173.52 
L 228.980312 101.676061 
L 225.260312 101.676061 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_61">
<path d="M 228.980312 173.52 
L 232.700312 173.52 
L 232.700312 111.242497 
L 228.980312 111.242497 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_62">
<path d="M 232.700312 173.52 
L 236.420312 173.52 
L 236.420312 121.988795 
L 232.700312 121.988795 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_63">
<path d="M 236.420313 173.52 
L 240.140313 173.52 
L 240.140313 127.090894 
L 236.420313 127.090894 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_64">
<path d="M 240.140312 173.52 
L 243.860312 173.52 
L 243.860312 134.329498 
L 240.140312 134.329498 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_65">
<path d="M 243.860313 173.52 
L 247.580313 173.52 
L 247.580313 140.037472 
L 243.860313 140.037472 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_66">
<path d="M 247.580312 173.52 
L 251.300312 173.52 
L 251.300312 144.501809 
L 247.580312 144.501809 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_67">
<path d="M 251.300313 173.52 
L 255.020313 173.52 
L 255.020313 149.603908 
L 251.300313 149.603908 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_68">
<path d="M 255.020312 173.52 
L 258.740313 173.52 
L 258.740313 152.091182 
L 255.020312 152.091182 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_69">
<path d="M 258.740313 173.52 
L 262.460313 173.52 
L 262.460313 155.917757 
L 258.740313 155.917757 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_70">
<path d="M 262.460312 173.52 
L 266.180313 173.52 
L 266.180313 159.042793 
L 262.460312 159.042793 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_71">
<path d="M 266.180313 173.52 
L 269.900313 173.52 
L 269.900313 160.987968 
L 266.180313 160.987968 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_72">
<path d="M 269.900312 173.52 
L 273.620313 173.52 
L 273.620313 160.796639 
L 269.900312 160.796639 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_73">
<path d="M 273.620313 173.52 
L 277.340313 173.52 
L 277.340313 162.837479 
L 273.620313 162.837479 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_74">
<path d="M 277.340312 173.52 
L 281.060313 173.52 
L 281.060313 164.591326 
L 277.340312 164.591326 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_75">
<path d="M 281.060313 173.52 
L 284.780313 173.52 
L 284.780313 166.313284 
L 281.060313 166.313284 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_76">
<path d="M 284.780313 173.52 
L 288.500313 173.52 
L 288.500313 167.269928 
L 284.780313 167.269928 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_77">
<path d="M 288.500313 173.52 
L 292.220313 173.52 
L 292.220313 167.74825 
L 288.500313 167.74825 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_78">
<path d="M 292.220312 173.52 
L 295.940313 173.52 
L 295.940313 168.4179 
L 292.220312 168.4179 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_79">
<path d="M 295.940313 173.52 
L 299.660313 173.52 
L 299.660313 170.2993 
L 295.940313 170.2993 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_80">
<path d="M 299.660313 173.52 
L 303.380313 173.52 
L 303.380313 169.693425 
L 299.660313 169.693425 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_81">
<path d="M 303.380313 173.52 
L 307.100313 173.52 
L 307.100313 170.2993 
L 303.380313 170.2993 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_82">
<path d="M 307.100312 173.52 
L 310.820312 173.52 
L 310.820312 170.618181 
L 307.100312 170.618181 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_83">
<path d="M 310.820312 173.52 
L 314.540313 173.52 
L 314.540313 171.000838 
L 310.820312 171.000838 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_84">
<path d="M 314.540313 173.52 
L 318.260313 173.52 
L 318.260313 170.905174 
L 314.540313 170.905174 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_85">
<path d="M 318.260312 173.52 
L 321.980313 173.52 
L 321.980313 171.638601 
L 318.260312 171.638601 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_86">
<path d="M 321.980312 173.52 
L 325.700312 173.52 
L 325.700312 171.734265 
L 321.980312 171.734265 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_87">
<path d="M 325.700312 173.52 
L 329.420313 173.52 
L 329.420313 171.574825 
L 325.700312 171.574825 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_88">
<path d="M 329.420313 173.52 
L 333.140313 173.52 
L 333.140313 172.467692 
L 329.420313 172.467692 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_89">
<path d="M 333.140312 173.52 
L 336.860313 173.52 
L 336.860313 171.734265 
L 333.140312 171.734265 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_90">
<path d="M 336.860312 173.52 
L 340.580312 173.52 
L 340.580312 172.595244 
L 336.860312 172.595244 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_91">
<path d="M 340.580312 173.52 
L 344.300313 173.52 
L 344.300313 172.276363 
L 340.580312 172.276363 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_92">
<path d="M 344.300313 173.52 
L 348.020313 173.52 
L 348.020313 172.563356 
L 344.300313 172.563356 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_93">
<path d="M 348.020312 173.52 
L 351.740313 173.52 
L 351.740313 172.563356 
L 348.020312 172.563356 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_94">
<path d="M 351.740312 173.52 
L 355.460312 173.52 
L 355.460312 173.041678 
L 351.740312 173.041678 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_95">
<path d="M 355.460312 173.52 
L 359.180313 173.52 
L 359.180313 172.659021 
L 355.460312 172.659021 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_96">
<path d="M 359.180313 173.52 
L 362.900313 173.52 
L 362.900313 173.041678 
L 359.180313 173.041678 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_97">
<path d="M 362.900312 173.52 
L 366.620313 173.52 
L 366.620313 173.073566 
L 362.900312 173.073566 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-patch_98">
<path d="M 366.620312 173.52 
L 370.340312 173.52 
L 370.340312 172.818461 
L 366.620312 172.818461 
z
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-matplotlib.axis_1">
<g id="sht-ch_null-xtick_1">
<g id="sht-ch_null-line2d_1">
<defs>
<path id="sht-ch_null-m7c25c535dc" d="M 0 0 
L 0 3.5 
" style="stroke: currentColor; stroke-width: 0.8"/>
</defs>
<g>
<use xlink:href="#sht-ch_null-m7c25c535dc" x="13.220313" y="173.52" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_null-text_1">
<text style="font-size: 10px; text-anchor: middle" x="13.220313" y="188.117656" transform="rotate(-0 13.220313 188.117656)">−6</text>
</g>
</g>
<g id="sht-ch_null-xtick_2">
<g id="sht-ch_null-line2d_2">
<g>
<use xlink:href="#sht-ch_null-m7c25c535dc" x="72.740313" y="173.52" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_null-text_2">
<text style="font-size: 10px; text-anchor: middle" x="72.740313" y="188.117656" transform="rotate(-0 72.740313 188.117656)">−4</text>
</g>
</g>
<g id="sht-ch_null-xtick_3">
<g id="sht-ch_null-line2d_3">
<g>
<use xlink:href="#sht-ch_null-m7c25c535dc" x="132.260312" y="173.52" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_null-text_3">
<text style="font-size: 10px; text-anchor: middle" x="132.260312" y="188.117656" transform="rotate(-0 132.260312 188.117656)">−2</text>
</g>
</g>
<g id="sht-ch_null-xtick_4">
<g id="sht-ch_null-line2d_4">
<g>
<use xlink:href="#sht-ch_null-m7c25c535dc" x="191.780313" y="173.52" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_null-text_4">
<text style="font-size: 10px; text-anchor: middle" x="191.780313" y="188.117656" transform="rotate(-0 191.780313 188.117656)">0</text>
</g>
</g>
<g id="sht-ch_null-xtick_5">
<g id="sht-ch_null-line2d_5">
<g>
<use xlink:href="#sht-ch_null-m7c25c535dc" x="251.300313" y="173.52" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_null-text_5">
<text style="font-size: 10px; text-anchor: middle" x="251.300313" y="188.117656" transform="rotate(-0 251.300313 188.117656)">2</text>
</g>
</g>
<g id="sht-ch_null-xtick_6">
<g id="sht-ch_null-line2d_6">
<g>
<use xlink:href="#sht-ch_null-m7c25c535dc" x="310.820312" y="173.52" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_null-text_6">
<text style="font-size: 10px; text-anchor: middle" x="310.820312" y="188.117656" transform="rotate(-0 310.820312 188.117656)">4</text>
</g>
</g>
<g id="sht-ch_null-xtick_7">
<g id="sht-ch_null-line2d_7">
<g>
<use xlink:href="#sht-ch_null-m7c25c535dc" x="370.340312" y="173.52" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_null-text_7">
<text style="font-size: 10px; text-anchor: middle" x="370.340312" y="188.117656" transform="rotate(-0 370.340312 188.117656)">6</text>
</g>
</g>
<g id="sht-ch_null-text_8">
<text style="font-size: 10px; text-anchor: middle" x="191.780313" y="202.118438" transform="rotate(-0 191.780313 202.118438)">t statistic when H₀ is true</text>
</g>
</g>
<g id="sht-ch_null-matplotlib.axis_2"/>
<g id="sht-ch_null-line2d_8">
<path d="M 13.220313 173.049103 
L 34.701215 172.688268 
L 49.916854 172.22925 
L 61.552343 171.671787 
L 71.397756 170.97332 
L 79.453094 170.169309 
L 85.718358 169.33987 
L 91.088583 168.439466 
L 96.458809 167.313694 
L 100.933997 166.159076 
L 105.409185 164.760051 
L 108.989335 163.428111 
L 112.569485 161.870837 
L 116.149636 160.04886 
L 119.729786 157.916628 
L 122.414899 156.082706 
L 125.100012 154.020495 
L 127.785125 151.703308 
L 130.470237 149.102478 
L 133.15535 146.187665 
L 135.840463 142.927376 
L 138.525576 139.289748 
L 141.210688 135.243675 
L 143.895801 130.76033 
L 146.580914 125.815165 
L 149.266027 120.39042 
L 151.95114 114.478179 
L 154.636252 108.083911 
L 158.216403 98.850764 
L 161.796553 88.918563 
L 167.166779 73.168526 
L 173.432042 54.844892 
L 176.117155 47.562154 
L 178.802267 40.934772 
L 180.592343 36.990763 
L 182.382418 33.500289 
L 184.172493 30.521907 
L 185.962568 28.107534 
L 187.752643 26.300575 
L 188.647681 25.635703 
L 189.542719 25.134287 
L 190.437756 24.798687 
L 191.332794 24.630488 
L 192.227831 24.630488 
L 193.122869 24.798687 
L 194.017906 25.134287 
L 194.912944 25.635703 
L 195.807982 26.300575 
L 196.703019 27.125794 
L 198.493094 29.241286 
L 200.28317 31.943663 
L 202.073245 35.185042 
L 203.86332 38.909941 
L 205.653395 43.057229 
L 208.338508 49.927994 
L 211.918658 59.954398 
L 225.344222 98.850764 
L 228.924373 108.083911 
L 231.609485 114.478179 
L 234.294598 120.39042 
L 236.979711 125.815165 
L 239.664824 130.76033 
L 242.349937 135.243675 
L 245.035049 139.289748 
L 247.720162 142.927376 
L 250.405275 146.187665 
L 253.090388 149.102478 
L 255.7755 151.703308 
L 258.460613 154.020495 
L 261.145726 156.082706 
L 263.830839 157.916628 
L 267.410989 160.04886 
L 270.99114 161.870837 
L 274.57129 163.428111 
L 278.15144 164.760051 
L 282.626628 166.159076 
L 287.101816 167.313694 
L 292.472042 168.439466 
L 297.842267 169.33987 
L 304.107531 170.169309 
L 311.267831 170.89592 
L 320.218207 171.563165 
L 330.958658 172.120336 
L 344.384222 172.576668 
L 362.284974 172.940952 
L 370.340312 173.049103 
L 370.340312 173.049103 
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: none; stroke: #3b82f6; stroke-width: 1.8; stroke-linecap: square"/>
</g>
<g id="sht-ch_null-line2d_9">
<path d="M 13.220313 173.519998 
L 77.663019 173.418408 
L 87.508433 173.177994 
L 93.773696 172.820546 
L 98.248884 172.385195 
L 102.724072 171.72004 
L 106.304222 170.958671 
L 109.884373 169.927618 
L 112.569485 168.933876 
L 115.254598 167.71271 
L 117.939711 166.225998 
L 120.624824 164.432953 
L 123.309937 162.290919 
L 125.995049 159.756458 
L 128.680162 156.786731 
L 131.365275 153.341173 
L 134.050388 149.383427 
L 136.7355 144.883505 
L 139.420613 139.820095 
L 142.105726 134.182927 
L 144.790839 127.975077 
L 147.475952 121.215091 
L 150.161064 113.938765 
L 153.741215 103.530538 
L 158.216403 89.651669 
L 169.851891 52.764432 
L 172.537004 44.987721 
L 175.222117 37.819387 
L 177.90723 31.412836 
L 179.697305 27.635905 
L 181.48738 24.299458 
L 183.277455 21.437944 
L 185.067531 19.081338 
L 186.857606 17.254618 
L 188.647681 15.977324 
L 189.542719 15.549244 
L 190.437756 15.263211 
L 191.332794 15.12 
L 192.227831 15.12 
L 193.122869 15.263211 
L 194.017906 15.549244 
L 194.912944 15.977324 
L 195.807982 16.546295 
L 197.598057 18.100389 
L 199.388132 20.194844 
L 201.178207 22.807349 
L 202.968282 25.910369 
L 204.758358 29.471622 
L 206.548433 33.454639 
L 209.233546 40.131588 
L 211.918658 47.520153 
L 215.498809 58.208399 
L 219.973997 72.382287 
L 228.029335 98.073817 
L 231.609485 108.827083 
L 235.189636 118.844727 
L 237.874749 125.781699 
L 240.559861 132.176474 
L 243.244974 138.004934 
L 245.930087 143.259068 
L 248.6152 147.944948 
L 251.300313 152.080467 
L 253.985425 155.692983 
L 256.670538 158.816979 
L 259.355651 161.491844 
L 262.040764 163.759859 
L 264.725876 165.664431 
L 267.410989 167.24861 
L 270.096102 168.553911 
L 272.781215 169.619415 
L 275.466328 170.481148 
L 279.046478 171.368953 
L 282.626628 172.019262 
L 287.101816 172.582363 
L 292.472042 173.002455 
L 299.632343 173.297242 
L 310.372794 173.463568 
L 332.748734 173.517874 
L 370.340312 173.519998 
L 370.340312 173.519998 
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: none; stroke-dasharray: 4.44,1.92; stroke-dashoffset: 0; stroke: #9ca3af; stroke-width: 1.2"/>
</g>
<g id="sht-ch_null-line2d_10">
<path d="M 65.508633 173.52 
L 65.508633 7.2 
" clip-path="url(#sht-ch_null-p81e9cf012d)" style="fill: none; stroke: #ef4444; stroke-width: 1.2; stroke-linecap: square"/>
</g>
<g id="sht-ch_null-patch_99">
<path d="M 13.220313 173.52 
L 370.340312 173.52 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sht-ch_null-text_9">
<text style="font-size: 8.5px; text-anchor: start; fill: #ef4444" x="68.276313" y="42.478712" transform="rotate(-0 68.276313 42.478712)">our t = −4.24</text>
</g>
<g id="sht-ch_null-legend_1">
<g id="sht-ch_null-patch_100">
<path d="M 216.075937 21.353828 
L 233.075937 21.353828 
L 233.075937 15.403828 
L 216.075937 15.403828 
z
" style="fill: #3b82f6; opacity: 0.35"/>
</g>
<g id="sht-ch_null-text_10">
<text style="font-size: 8.5px; text-anchor: start" x="239.875937" y="21.353828" transform="rotate(-0 239.875937 21.353828)">100,000 simulated pilots</text>
</g>
<g id="sht-ch_null-line2d_11">
<path d="M 216.075937 31.174648 
L 224.575937 31.174648 
L 233.075937 31.174648 
" style="fill: none; stroke: #3b82f6; stroke-width: 1.8; stroke-linecap: square"/>
</g>
<g id="sht-ch_null-text_11">
<text style="font-size: 8.5px; text-anchor: start" x="239.875937" y="34.149648" transform="rotate(-0 239.875937 34.149648)">t curve, 4 df</text>
</g>
<g id="sht-ch_null-line2d_12">
<path d="M 216.075937 43.970469 
L 224.575937 43.970469 
L 233.075937 43.970469 
" style="fill: none; stroke-dasharray: 4.44,1.92; stroke-dashoffset: 0; stroke: #9ca3af; stroke-width: 1.2"/>
</g>
<g id="sht-ch_null-text_12">
<text style="font-size: 8.5px; text-anchor: start" x="239.875937" y="46.945469" transform="rotate(-0 239.875937 46.945469)">normal curve</text>
</g>
</g>
</g>
</g>
<defs>
<clipPath id="sht-ch_null-p81e9cf012d">
<rect x="13.220313" y="7.2" width="357.12" height="166.32"/>
</clipPath>
</defs>
</svg><figcaption>The null distribution of t for five shoppers. The bars are 100,000 simulated pilots where H₀ is true, the solid line is the t curve with 4 degrees of freedom, and they agree. The dashed normal curve is too thin in the tails. Our t = −4.24 sits far out in the left tail.</figcaption></figure>
  <p>This pattern, a statistic shaped like (estimate − H₀ value) ÷ SE, compared with a known null distribution, is behind every test on this page. Only the statistic and its distribution change: the t curve for means, the normal curve for large-sample proportions, the χ² curve for count tables and the F curve for ANOVA, all introduced in <a class="xref" data-note="st_distributions">Probability Distributions</a>. The guarantee of every test depends on that null distribution being right; data that breaks its assumptions (the same user counted many times, wild outliers, tiny skewed samples) gives wrong p-values even when the arithmetic is perfect.</p>

  <h2 id="sht-p"><span class="num">03</span>The p-value</h2>
  <p>We now have a null curve and our t. To turn "how far out in the tail" into one number, we take the area of the null curve that is at least as far from zero as our t, on both sides for a two-sided test. That area is the <strong>p-value</strong>: assuming H₀ is true, the probability of getting a test statistic at least as extreme as the one we observed. In plain words: <em>if nothing were going on, how often would luck alone give a result this surprising?</em></p>
  <p>Think of a smoke alarm. Burnt toast fills a room with a little smoke quite often, so a little smoke is not surprising and you ignore it (large p). Smoke this thick without a real fire almost never happens, so you act (small p). The p-value is that "how often without a fire" number. The simulation already estimated it as 1.35%; the exact area under the t(4) curve is a lookup that SciPy does for us:</p>
  <div class="fx" data-lang="py">p = 2 * stats.t.sf(abs(t), df=n - 1)            # area in both tails beyond |t|
print(f"by formula : p = {p:.4f}")
r5 = stats.ttest_1samp(small, popmean=30)
print(f"ttest_1samp: t = {r5.statistic:.3f}  p = {r5.pvalue:.4f}  df = {r5.df}")
times = np.array([29, 26, 31, 25, 27, 30, 24, 28, 32, 26, 27, 29])   # 12 shoppers
r12 = stats.ttest_1samp(times, popmean=30)
print(f"12 shoppers: mean = {times.mean():.2f}  t = {r12.statistic:.3f}  p = {r12.pvalue:.4f}")</div>
  <div class="fx" data-lang="text">by formula : p = 0.0132
ttest_1samp: t = -4.243  p = 0.0132  df = 4
12 shoppers: mean = 27.83  t = -3.072  p = 0.0106</div>
  <p><code>stats.t.sf</code> is the "survival function", the area to the right of a value; doubling it covers both tails and gives p = 0.0132. <code>ttest_1samp</code> does the whole calculation in one call and agrees: t = −4.243, p = 0.0132, with 4 degrees of freedom. A bigger pilot of 12 shoppers averages 27.83 seconds and gives t = −3.07, p = 0.0106. The picture shows that p-value as an area:</p>
  <figure class="viz"><svg fill="currentColor" style="max-width:680px;width:100%;height:auto" xmlns:xlink="http://www.w3.org/1999/xlink"  viewBox="0 0 371.52 200.632781" xmlns="http://www.w3.org/2000/svg" version="1.1">
<defs>
</defs>
<g id="sht-ch_pval-figure_1">
<g id="sht-ch_pval-patch_1">
<path d="M 0 200.632781 
L 371.52 200.632781 
L 371.52 -0 
L 0 -0 
L 0 200.632781 
z
" style="fill: none"/>
</g>
<g id="sht-ch_pval-axes_1">
<g id="sht-ch_pval-patch_2">
<path d="M 7.2 162.432 
L 364.32 162.432 
L 364.32 7.2 
L 7.2 7.2 
L 7.2 162.432 
z
" style="fill: none"/>
</g>
<g id="sht-ch_pval-FillBetweenPolyCollection_1">
<defs>
<path id="sht-ch_pval-m17387286e5" d="M 23.432727 -38.200781 
L 23.432727 -38.318089 
L 24.083338 -38.322076 
L 24.733948 -38.326206 
L 25.384558 -38.330482 
L 26.035169 -38.334912 
L 26.685779 -38.3395 
L 27.336389 -38.344252 
L 27.986999 -38.349175 
L 28.63761 -38.354274 
L 29.28822 -38.359556 
L 29.93883 -38.365029 
L 30.589441 -38.370698 
L 31.240051 -38.376572 
L 31.890661 -38.382659 
L 32.541272 -38.388965 
L 33.191882 -38.395499 
L 33.842492 -38.40227 
L 34.493103 -38.409287 
L 35.143713 -38.416558 
L 35.794323 -38.424094 
L 36.444934 -38.431904 
L 37.095544 -38.439998 
L 37.746154 -38.448388 
L 38.396764 -38.457083 
L 39.047375 -38.466097 
L 39.697985 -38.47544 
L 40.348595 -38.485125 
L 40.999206 -38.495165 
L 41.649816 -38.505572 
L 42.300426 -38.516362 
L 42.951037 -38.527549 
L 43.601647 -38.539146 
L 44.252257 -38.551171 
L 44.902868 -38.563638 
L 45.553478 -38.576565 
L 46.204088 -38.589969 
L 46.854698 -38.603867 
L 47.505309 -38.618279 
L 48.155919 -38.633224 
L 48.806529 -38.648721 
L 49.45714 -38.664793 
L 50.10775 -38.681459 
L 50.75836 -38.698744 
L 51.408971 -38.716669 
L 52.059581 -38.73526 
L 52.710191 -38.754541 
L 53.360802 -38.774538 
L 54.011412 -38.795279 
L 54.662022 -38.81679 
L 55.312633 -38.839102 
L 55.963243 -38.862245 
L 56.613853 -38.886249 
L 57.264463 -38.911147 
L 57.915074 -38.936973 
L 58.565684 -38.963762 
L 59.216294 -38.991548 
L 59.866905 -39.020372 
L 60.517515 -39.05027 
L 61.168125 -39.081283 
L 61.818736 -39.113453 
L 62.469346 -39.146824 
L 63.119956 -39.18144 
L 63.770567 -39.217347 
L 64.421177 -39.254595 
L 65.071787 -39.293232 
L 65.722398 -39.333311 
L 66.373008 -39.374885 
L 67.023618 -39.418009 
L 67.674228 -39.462742 
L 68.324839 -39.509143 
L 68.975449 -39.557274 
L 69.626059 -39.607198 
L 70.27667 -39.658981 
L 70.92728 -39.712693 
L 71.57789 -39.768404 
L 72.228501 -39.826187 
L 72.879111 -39.886119 
L 73.529721 -39.948278 
L 74.180332 -40.012745 
L 74.830942 -40.079605 
L 75.481552 -40.148944 
L 76.132163 -40.220852 
L 76.782773 -40.295422 
L 77.433383 -40.372751 
L 78.083993 -40.452938 
L 78.734604 -40.536085 
L 79.385214 -40.622298 
L 80.035824 -40.711687 
L 80.686435 -40.804366 
L 81.337045 -40.90045 
L 81.987655 -41.000062 
L 82.638266 -41.103324 
L 83.288876 -41.210366 
L 83.939486 -41.321319 
L 84.590097 -41.436322 
L 85.240707 -41.555514 
L 85.891317 -41.679041 
L 85.891317 -38.200781 
L 85.891317 -38.200781 
L 85.240707 -38.200781 
L 84.590097 -38.200781 
L 83.939486 -38.200781 
L 83.288876 -38.200781 
L 82.638266 -38.200781 
L 81.987655 -38.200781 
L 81.337045 -38.200781 
L 80.686435 -38.200781 
L 80.035824 -38.200781 
L 79.385214 -38.200781 
L 78.734604 -38.200781 
L 78.083993 -38.200781 
L 77.433383 -38.200781 
L 76.782773 -38.200781 
L 76.132163 -38.200781 
L 75.481552 -38.200781 
L 74.830942 -38.200781 
L 74.180332 -38.200781 
L 73.529721 -38.200781 
L 72.879111 -38.200781 
L 72.228501 -38.200781 
L 71.57789 -38.200781 
L 70.92728 -38.200781 
L 70.27667 -38.200781 
L 69.626059 -38.200781 
L 68.975449 -38.200781 
L 68.324839 -38.200781 
L 67.674228 -38.200781 
L 67.023618 -38.200781 
L 66.373008 -38.200781 
L 65.722398 -38.200781 
L 65.071787 -38.200781 
L 64.421177 -38.200781 
L 63.770567 -38.200781 
L 63.119956 -38.200781 
L 62.469346 -38.200781 
L 61.818736 -38.200781 
L 61.168125 -38.200781 
L 60.517515 -38.200781 
L 59.866905 -38.200781 
L 59.216294 -38.200781 
L 58.565684 -38.200781 
L 57.915074 -38.200781 
L 57.264463 -38.200781 
L 56.613853 -38.200781 
L 55.963243 -38.200781 
L 55.312633 -38.200781 
L 54.662022 -38.200781 
L 54.011412 -38.200781 
L 53.360802 -38.200781 
L 52.710191 -38.200781 
L 52.059581 -38.200781 
L 51.408971 -38.200781 
L 50.75836 -38.200781 
L 50.10775 -38.200781 
L 49.45714 -38.200781 
L 48.806529 -38.200781 
L 48.155919 -38.200781 
L 47.505309 -38.200781 
L 46.854698 -38.200781 
L 46.204088 -38.200781 
L 45.553478 -38.200781 
L 44.902868 -38.200781 
L 44.252257 -38.200781 
L 43.601647 -38.200781 
L 42.951037 -38.200781 
L 42.300426 -38.200781 
L 41.649816 -38.200781 
L 40.999206 -38.200781 
L 40.348595 -38.200781 
L 39.697985 -38.200781 
L 39.047375 -38.200781 
L 38.396764 -38.200781 
L 37.746154 -38.200781 
L 37.095544 -38.200781 
L 36.444934 -38.200781 
L 35.794323 -38.200781 
L 35.143713 -38.200781 
L 34.493103 -38.200781 
L 33.842492 -38.200781 
L 33.191882 -38.200781 
L 32.541272 -38.200781 
L 31.890661 -38.200781 
L 31.240051 -38.200781 
L 30.589441 -38.200781 
L 29.93883 -38.200781 
L 29.28822 -38.200781 
L 28.63761 -38.200781 
L 27.986999 -38.200781 
L 27.336389 -38.200781 
L 26.685779 -38.200781 
L 26.035169 -38.200781 
L 25.384558 -38.200781 
L 24.733948 -38.200781 
L 24.083338 -38.200781 
L 23.432727 -38.200781 
z
" style="stroke: #ef4444; stroke-opacity: 0.6"/>
</defs>
<g clip-path="url(#sht-ch_pval-pcdff3a5964)">
<use xlink:href="#sht-ch_pval-m17387286e5" x="0" y="200.632781" style="fill: #ef4444; fill-opacity: 0.6; stroke: #ef4444; stroke-opacity: 0.6"/>
</g>
</g>
<g id="sht-ch_pval-FillBetweenPolyCollection_2">
<defs>
<path id="sht-ch_pval-m5e0e2782a5" d="M 285.628683 -38.200781 
L 285.628683 -41.679041 
L 286.279293 -41.555514 
L 286.929903 -41.436322 
L 287.580514 -41.321319 
L 288.231124 -41.210366 
L 288.881734 -41.103324 
L 289.532345 -41.000062 
L 290.182955 -40.90045 
L 290.833565 -40.804366 
L 291.484176 -40.711687 
L 292.134786 -40.622298 
L 292.785396 -40.536085 
L 293.436007 -40.452938 
L 294.086617 -40.372751 
L 294.737227 -40.295422 
L 295.387837 -40.220852 
L 296.038448 -40.148944 
L 296.689058 -40.079605 
L 297.339668 -40.012745 
L 297.990279 -39.948278 
L 298.640889 -39.886119 
L 299.291499 -39.826187 
L 299.94211 -39.768404 
L 300.59272 -39.712693 
L 301.24333 -39.658981 
L 301.893941 -39.607198 
L 302.544551 -39.557274 
L 303.195161 -39.509143 
L 303.845772 -39.462742 
L 304.496382 -39.418009 
L 305.146992 -39.374885 
L 305.797602 -39.333311 
L 306.448213 -39.293232 
L 307.098823 -39.254595 
L 307.749433 -39.217347 
L 308.400044 -39.18144 
L 309.050654 -39.146824 
L 309.701264 -39.113453 
L 310.351875 -39.081283 
L 311.002485 -39.05027 
L 311.653095 -39.020372 
L 312.303706 -38.991548 
L 312.954316 -38.963762 
L 313.604926 -38.936973 
L 314.255537 -38.911147 
L 314.906147 -38.886249 
L 315.556757 -38.862245 
L 316.207367 -38.839102 
L 316.857978 -38.81679 
L 317.508588 -38.795279 
L 318.159198 -38.774538 
L 318.809809 -38.754541 
L 319.460419 -38.73526 
L 320.111029 -38.716669 
L 320.76164 -38.698744 
L 321.41225 -38.681459 
L 322.06286 -38.664793 
L 322.713471 -38.648721 
L 323.364081 -38.633224 
L 324.014691 -38.618279 
L 324.665302 -38.603867 
L 325.315912 -38.589969 
L 325.966522 -38.576565 
L 326.617132 -38.563638 
L 327.267743 -38.551171 
L 327.918353 -38.539146 
L 328.568963 -38.527549 
L 329.219574 -38.516362 
L 329.870184 -38.505572 
L 330.520794 -38.495165 
L 331.171405 -38.485125 
L 331.822015 -38.47544 
L 332.472625 -38.466097 
L 333.123236 -38.457083 
L 333.773846 -38.448388 
L 334.424456 -38.439998 
L 335.075066 -38.431904 
L 335.725677 -38.424094 
L 336.376287 -38.416558 
L 337.026897 -38.409287 
L 337.677508 -38.40227 
L 338.328118 -38.395499 
L 338.978728 -38.388965 
L 339.629339 -38.382659 
L 340.279949 -38.376572 
L 340.930559 -38.370698 
L 341.58117 -38.365029 
L 342.23178 -38.359556 
L 342.88239 -38.354274 
L 343.533001 -38.349175 
L 344.183611 -38.344252 
L 344.834221 -38.3395 
L 345.484831 -38.334912 
L 346.135442 -38.330482 
L 346.786052 -38.326206 
L 347.436662 -38.322076 
L 348.087273 -38.318089 
L 348.087273 -38.200781 
L 348.087273 -38.200781 
L 347.436662 -38.200781 
L 346.786052 -38.200781 
L 346.135442 -38.200781 
L 345.484831 -38.200781 
L 344.834221 -38.200781 
L 344.183611 -38.200781 
L 343.533001 -38.200781 
L 342.88239 -38.200781 
L 342.23178 -38.200781 
L 341.58117 -38.200781 
L 340.930559 -38.200781 
L 340.279949 -38.200781 
L 339.629339 -38.200781 
L 338.978728 -38.200781 
L 338.328118 -38.200781 
L 337.677508 -38.200781 
L 337.026897 -38.200781 
L 336.376287 -38.200781 
L 335.725677 -38.200781 
L 335.075066 -38.200781 
L 334.424456 -38.200781 
L 333.773846 -38.200781 
L 333.123236 -38.200781 
L 332.472625 -38.200781 
L 331.822015 -38.200781 
L 331.171405 -38.200781 
L 330.520794 -38.200781 
L 329.870184 -38.200781 
L 329.219574 -38.200781 
L 328.568963 -38.200781 
L 327.918353 -38.200781 
L 327.267743 -38.200781 
L 326.617132 -38.200781 
L 325.966522 -38.200781 
L 325.315912 -38.200781 
L 324.665302 -38.200781 
L 324.014691 -38.200781 
L 323.364081 -38.200781 
L 322.713471 -38.200781 
L 322.06286 -38.200781 
L 321.41225 -38.200781 
L 320.76164 -38.200781 
L 320.111029 -38.200781 
L 319.460419 -38.200781 
L 318.809809 -38.200781 
L 318.159198 -38.200781 
L 317.508588 -38.200781 
L 316.857978 -38.200781 
L 316.207367 -38.200781 
L 315.556757 -38.200781 
L 314.906147 -38.200781 
L 314.255537 -38.200781 
L 313.604926 -38.200781 
L 312.954316 -38.200781 
L 312.303706 -38.200781 
L 311.653095 -38.200781 
L 311.002485 -38.200781 
L 310.351875 -38.200781 
L 309.701264 -38.200781 
L 309.050654 -38.200781 
L 308.400044 -38.200781 
L 307.749433 -38.200781 
L 307.098823 -38.200781 
L 306.448213 -38.200781 
L 305.797602 -38.200781 
L 305.146992 -38.200781 
L 304.496382 -38.200781 
L 303.845772 -38.200781 
L 303.195161 -38.200781 
L 302.544551 -38.200781 
L 301.893941 -38.200781 
L 301.24333 -38.200781 
L 300.59272 -38.200781 
L 299.94211 -38.200781 
L 299.291499 -38.200781 
L 298.640889 -38.200781 
L 297.990279 -38.200781 
L 297.339668 -38.200781 
L 296.689058 -38.200781 
L 296.038448 -38.200781 
L 295.387837 -38.200781 
L 294.737227 -38.200781 
L 294.086617 -38.200781 
L 293.436007 -38.200781 
L 292.785396 -38.200781 
L 292.134786 -38.200781 
L 291.484176 -38.200781 
L 290.833565 -38.200781 
L 290.182955 -38.200781 
L 289.532345 -38.200781 
L 288.881734 -38.200781 
L 288.231124 -38.200781 
L 287.580514 -38.200781 
L 286.929903 -38.200781 
L 286.279293 -38.200781 
L 285.628683 -38.200781 
z
" style="stroke: #ef4444; stroke-opacity: 0.6"/>
</defs>
<g clip-path="url(#sht-ch_pval-pcdff3a5964)">
<use xlink:href="#sht-ch_pval-m5e0e2782a5" x="0" y="200.632781" style="fill: #ef4444; fill-opacity: 0.6; stroke: #ef4444; stroke-opacity: 0.6"/>
</g>
</g>
<g id="sht-ch_pval-matplotlib.axis_1">
<g id="sht-ch_pval-xtick_1">
<g id="sht-ch_pval-line2d_1">
<defs>
<path id="sht-ch_pval-m7c25c535dc" d="M 0 0 
L 0 3.5 
" style="stroke: currentColor; stroke-width: 0.8"/>
</defs>
<g>
<use xlink:href="#sht-ch_pval-m7c25c535dc" x="55.898182" y="162.432" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_pval-text_1">
<text style="font-size: 10px; text-anchor: middle" x="55.898182" y="177.029656" transform="rotate(-0 55.898182 177.029656)">−4</text>
</g>
</g>
<g id="sht-ch_pval-xtick_2">
<g id="sht-ch_pval-line2d_2">
<g>
<use xlink:href="#sht-ch_pval-m7c25c535dc" x="120.829091" y="162.432" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_pval-text_2">
<text style="font-size: 10px; text-anchor: middle" x="120.829091" y="177.029656" transform="rotate(-0 120.829091 177.029656)">−2</text>
</g>
</g>
<g id="sht-ch_pval-xtick_3">
<g id="sht-ch_pval-line2d_3">
<g>
<use xlink:href="#sht-ch_pval-m7c25c535dc" x="185.76" y="162.432" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_pval-text_3">
<text style="font-size: 10px; text-anchor: middle" x="185.76" y="177.029656" transform="rotate(-0 185.76 177.029656)">0</text>
</g>
</g>
<g id="sht-ch_pval-xtick_4">
<g id="sht-ch_pval-line2d_4">
<g>
<use xlink:href="#sht-ch_pval-m7c25c535dc" x="250.690909" y="162.432" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_pval-text_4">
<text style="font-size: 10px; text-anchor: middle" x="250.690909" y="177.029656" transform="rotate(-0 250.690909 177.029656)">2</text>
</g>
</g>
<g id="sht-ch_pval-xtick_5">
<g id="sht-ch_pval-line2d_5">
<g>
<use xlink:href="#sht-ch_pval-m7c25c535dc" x="315.621818" y="162.432" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_pval-text_5">
<text style="font-size: 10px; text-anchor: middle" x="315.621818" y="177.029656" transform="rotate(-0 315.621818 177.029656)">4</text>
</g>
</g>
<g id="sht-ch_pval-text_6">
<text style="font-size: 10px; text-anchor: middle" x="185.76" y="191.030437" transform="rotate(-0 185.76 191.030437)">t (11 df) if the new page were no faster</text>
</g>
</g>
<g id="sht-ch_pval-matplotlib.axis_2"/>
<g id="sht-ch_pval-line2d_6">
<path d="M 23.432727 162.314692 
L 44.252257 162.08161 
L 57.264463 161.721634 
L 66.373008 161.257897 
L 73.529721 160.684503 
L 79.385214 160.010483 
L 84.590097 159.196459 
L 89.144369 158.26568 
L 93.048031 157.262644 
L 96.951692 156.026773 
L 100.204744 154.784294 
L 103.457796 153.314659 
L 106.710847 151.582332 
L 109.963899 149.548377 
L 112.56634 147.67597 
L 115.168781 145.561238 
L 117.771222 143.181127 
L 120.373664 140.512525 
L 122.976105 137.532887 
L 125.578546 134.221011 
L 128.180987 130.55796 
L 130.783429 126.528136 
L 133.38587 122.120501 
L 135.988311 117.329903 
L 139.241363 110.807193 
L 142.494414 103.713833 
L 145.747466 96.098987 
L 149.651128 86.384961 
L 154.85601 72.788345 
L 162.663334 52.387758 
L 165.916385 44.466448 
L 168.518827 38.604111 
L 171.121268 33.291463 
L 173.073099 29.735715 
L 175.02493 26.596762 
L 176.976761 23.914648 
L 178.928592 21.724403 
L 180.229812 20.552161 
L 181.531033 19.618655 
L 182.832254 18.929527 
L 184.133474 18.488972 
L 185.434695 18.299679 
L 186.735915 18.362809 
L 188.037136 18.677974 
L 189.338357 19.243247 
L 190.639577 20.05518 
L 191.940798 21.108848 
L 193.242019 22.397903 
L 195.19385 24.755651 
L 197.14568 27.594203 
L 199.097511 30.876758 
L 201.049342 34.561807 
L 203.651784 40.022706 
L 206.254225 46.004172 
L 209.507276 54.032546 
L 214.712159 67.613692 
L 222.519483 88.040752 
L 226.423144 97.660367 
L 229.676196 105.176194 
L 232.929248 112.158488 
L 236.182299 118.563476 
L 238.78474 123.258225 
L 241.387182 127.570671 
L 243.989623 131.507567 
L 246.592064 135.081212 
L 249.194505 138.308146 
L 251.796947 141.207971 
L 254.399388 143.802303 
L 257.001829 146.113895 
L 259.60427 148.165898 
L 262.206712 149.981272 
L 265.459763 151.951635 
L 268.712815 153.628413 
L 271.965866 155.049887 
L 275.218918 156.250886 
L 279.12258 157.444784 
L 283.026242 158.41322 
L 287.580514 159.311462 
L 292.785396 160.096697 
L 298.640889 160.746662 
L 305.797602 161.299471 
L 314.255537 161.721634 
L 325.315912 162.042813 
L 341.58117 162.267753 
L 348.087273 162.314692 
L 348.087273 162.314692 
" clip-path="url(#sht-ch_pval-pcdff3a5964)" style="fill: none; stroke: #3b82f6; stroke-width: 1.8; stroke-linecap: square"/>
</g>
<g id="sht-ch_pval-line2d_7">
<path d="M 86.026124 162.432 
L 86.026124 7.2 
" clip-path="url(#sht-ch_pval-pcdff3a5964)" style="fill: none; stroke: #ef4444; stroke-linecap: square"/>
</g>
<g id="sht-ch_pval-patch_3">
<path d="M 7.2 162.432 
L 364.32 162.432 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sht-ch_pval-text_7">
<text style="font-size: 8.5px; text-anchor: start; fill: #ef4444" x="91.610182" y="40.464" transform="rotate(-0 91.610182 40.464)">our t = −3.07</text>
</g>
<g id="sht-ch_pval-patch_4">
<path d="M 294.284265 105.643619 
Q 295.178415 131.190114 296.041278 155.842731 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linecap: round"/>
<path d="M 297.621308 152.385346 
L 296.041278 155.842731 
L 294.223389 152.504276 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linecap: round"/>
</g>
<g id="sht-ch_pval-text_8">
<text style="font-size: 8.5px; text-anchor: start" x="237.704727" y="99.6" transform="rotate(-0 237.704727 99.6)">each red tail ≈ 0.0053</text>
</g>
<g id="sht-ch_pval-text_9">
<text style="font-size: 8.5px; text-anchor: middle" x="185.76" y="140.256" transform="rotate(-0 185.76 140.256)">p = both tails = 0.0106</text>
</g>
</g>
</g>
<defs>
<clipPath id="sht-ch_pval-pcdff3a5964">
<rect x="7.2" y="7.2" width="357.12" height="155.232"/>
</clipPath>
</defs>
</svg><figcaption>Where t would fall for 12 shoppers if the new page were no faster. Our t = −3.07 is far out, and the two red tails together (the area at least as extreme in either direction) are the p-value, 0.0106.</figcaption></figure>
  <p>The p-value is the most misunderstood number in statistics, and interviewers know it. The commonest error is reading p = 0.013 as "a 1.3% chance that H₀ is true". That gets the logic backwards. The p-value is computed <em>assuming</em> H₀ is true; it is the probability of the data given H₀, written P(data | H₀), where "|" means "given". What people want is P(H₀ | data), and those two are as different as P(wet road | rain), which is nearly 1, and P(rain | wet road), which is much lower because a water tanker may have passed. Turning one into the other needs Bayes' rule and a prior belief, as in <a class="xref" data-note="st_probability">Probability</a>. For the same reason "1 − p = 98.7% chance the new page is faster" is wrong.</p>
  <p>Two more misreadings matter as much. A small p does not mean a big effect: with a huge sample, a difference too small to matter still gives a tiny p, so always report the size of the effect alongside it. And a large p does not prove there is no effect: the study may simply have been too small to detect it (section 08 measures this). "Absence of evidence is not evidence of absence." What a small p-value honestly says is: "this data would be surprising if nothing were going on".</p>

  <h2 id="sht-err"><span class="num">04</span>Significance Level and Type I/II Errors</h2>
  <p>A p-value measures surprise; a business needs a decision: ship the new checkout or not. The rule from section 01 is to fix the significance level α before seeing the data and reject H₀ when p &lt; α. Any yes/no decision made from noisy data can go wrong in two different ways, and α controls one of them.</p>
  <p>Picture an airport metal detector. Set it very sensitive and it beeps at every belt buckle: false alarms. Set it lax and a real knife slips through: a miss. Turning one dial trades one kind of error for the other, and the only way to reduce both at once is a better machine. In testing the two errors have names. A <strong>Type I error</strong> is a false alarm: rejecting H₀ when it is actually true, for example shipping a checkout that is no better. A <strong>Type II error</strong> is a miss: failing to reject H₀ when there really is an effect, for example abandoning a checkout that was genuinely faster.</p>
  <table class="tbl">
    <tr><th></th><th>H₀ true (no real effect)</th><th>H₁ true (real effect)</th></tr>
    <tr><td><b>Reject H₀</b></td><td>Type I error (false positive), probability α</td><td>correct, probability = <b>power</b> = 1 − β</td></tr>
    <tr><td><b>Don't reject H₀</b></td><td>correct, probability 1 − α</td><td>Type II error (false negative), probability β</td></tr>
  </table>
  <p>The reason α is the false-alarm rate is neat. When H₀ is true, p-values are spread evenly between 0 and 1, so "reject when p &lt; 0.05" fires exactly 5% of the time. The code applies the rule to our pilot and then checks the promise on 20,000 pilots where H₀ is true:</p>
  <div class="fx" data-lang="py">p = stats.ttest_1samp(small, 30).pvalue
for alpha in (0.05, 0.01):
    print(f"alpha = {alpha}: p = {p:.4f} -&gt; {'reject H0' if p &lt; alpha else 'do not reject H0'}")
rng = np.random.default_rng(1)
pv = np.array([stats.ttest_1samp(rng.normal(30, 2, 5), 30).pvalue for _ in range(20000)])
print("H0 true, 20,000 pilots: share rejected at 0.05 =", round(np.mean(pv &lt; 0.05), 4),
      "  at 0.01 =", round(np.mean(pv &lt; 0.01), 4))</div>
  <div class="fx" data-lang="text">alpha = 0.05: p = 0.0132 -&gt; reject H0
alpha = 0.01: p = 0.0132 -&gt; do not reject H0
H0 true, 20,000 pilots: share rejected at 0.05 = 0.048   at 0.01 = 0.0098</div>
  <p>Our pilot's p = 0.0132 is rejected at α = 0.05 but not at the stricter α = 0.01, which is why α must be chosen before looking. Across 20,000 no-effect pilots, the rule "reject when p &lt; 0.05" fired 4.8% of the time and "p &lt; 0.01" fired 0.98% of the time. That is exactly what α <em>is</em>: the false-alarm rate you agreed to accept.</p>
  <p>The probability of a Type II error is written β (beta), and its complement, 1 − β, is the <strong>power</strong>: the chance of catching a real effect when it exists. Unlike α, β is not chosen directly; it depends on how big the real effect is, how noisy the data is and how much data you collect, which is the subject of section 08. Lowering α to 0.01 makes false alarms rarer but, with the same data, makes misses more common. Which error is worse depends on the cost. In product testing, shipping a change that does nothing (or harm) is usually the costlier mistake, so α is kept at 0.05 or lower. In medical screening, missing a sick patient is worse, so tests are tuned to miss as little as possible. Decide by consequences, not by habit.</p>

  <h2 id="sht-ci"><span class="num">05</span>Confidence Intervals</h2>
  <p>"Reject H₀" tells the manager that the new page is not 30 seconds. Her next question is obvious: "So how fast <em>is</em> it?" Saying "27 seconds" sounds far too exact, because another five shoppers would give another average. We need a range that honestly shows how unsure we are. That range is a <strong>confidence interval</strong> (CI).</p>
  <p>The construction reuses everything from section 02. Start at the estimate and step out on both sides by "a few standard errors", where "a few" is the <strong>critical value</strong> from the t curve that leaves 2.5% in each tail, so that 95% of the curve is in between:</p>
  <div class="fx" data-lang="text">CI = estimate ± critical value × SE

critical value t* (95%, 4 df) = 2.776
margin = 2.776 × 0.707 = 1.963
CI     = 27 ± 1.963   →   25.04 to 28.96 seconds</div>
  <p>Notice that 30 lies outside the interval, which agrees with p = 0.013 &lt; 0.05. This always holds: a 95% CI excludes the H₀ value exactly when the two-sided p-value is below 0.05. The interval carries strictly more information than the test, because it also shows the size of the effect.</p>
  <div class="fx" data-lang="py">tcrit = stats.t.ppf(0.975, df=4)                # leaves 2.5% in each tail
print("5 shoppers : t* =", round(tcrit, 3), " CI =", np.round([mean - tcrit * se, mean + tcrit * se], 2))
ci = stats.ttest_1samp(times, popmean=30).confidence_interval()
print("12 shoppers: t* =", round(stats.t.ppf(0.975, 11), 3), " CI =", round(ci.low, 2), "to", round(ci.high, 2))
rng = np.random.default_rng(42)
hits = 0
for _ in range(1000):                           # 1000 imaginary studies of 12 shoppers
    sample = rng.normal(30, 2.5, 12)            # true mean is 30
    c = stats.ttest_1samp(sample, popmean=30).confidence_interval()
    hits += c.low &lt;= 30 &lt;= c.high
print("intervals that caught the true mean:", hits, "of 1000")</div>
  <div class="fx" data-lang="text">5 shoppers : t* = 2.776  CI = [25.04 28.96]
12 shoppers: t* = 2.201  CI = 26.28 to 29.39
intervals that caught the true mean: 958 of 1000</div>
  <p><code>stats.t.ppf(0.975, df)</code> runs the tail-area lookup backwards: "which t has 97.5% of the curve below it?". For 4 degrees of freedom it is 2.776, matching the hand value, and the interval is 25.04 to 28.96. With 12 shoppers the critical value drops to 2.201 (more data, thinner tails) and <code>confidence_interval()</code> gives 26.28 to 29.39 seconds. The final loop is the most important line: it runs 1000 imaginary studies where the true mean really is 30, builds a 95% interval in each, and 958 of the 1000 intervals contain 30. About 95%, as promised.</p>
  <p>That loop is also the key to interpreting a CI correctly. Think of a fisherman throwing a net at a fish he cannot see clearly. The fish (the true mean) stays still; the net (the interval) lands somewhere new each throw. A "95% net" is one wide enough to catch the fish on 95 of every 100 throws. After any single throw, the fish is either inside or it is not; the 95% describes the throwing method, not one particular throw. So the careful statement is "95% of intervals built this way contain the true mean", not "there is a 95% probability the true mean is between 25.04 and 28.96". (A Bayesian <em>credible interval</em> does allow the second sentence, but that is a different calculation.)</p>
  <figure class="viz"><svg fill="currentColor" style="max-width:680px;width:100%;height:auto" xmlns:xlink="http://www.w3.org/1999/xlink"  viewBox="0 0 404.561406 207.89581" xmlns="http://www.w3.org/2000/svg" version="1.1">
<defs>
</defs>
<g id="sht-ch_ci-figure_1">
<g id="sht-ch_ci-patch_1">
<path d="M 0 207.89581 
L 404.561406 207.89581 
L 404.561406 0 
L 0 0 
L 0 207.89581 
z
" style="fill: none"/>
</g>
<g id="sht-ch_ci-axes_1">
<g id="sht-ch_ci-patch_2">
<path d="M 40.241406 186.695029 
L 397.361406 186.695029 
L 397.361406 9.287029 
L 40.241406 9.287029 
L 40.241406 186.695029 
z
" style="fill: none"/>
</g>
<g id="sht-ch_ci-matplotlib.axis_1">
<g id="sht-ch_ci-text_1">
<text style="font-size: 10px; text-anchor: middle" x="218.801406" y="198.293466" transform="rotate(-0 218.801406 198.293466)">40 studies of 12 shoppers (3 of 40 miss, in red)</text>
</g>
</g>
<g id="sht-ch_ci-matplotlib.axis_2">
<g id="sht-ch_ci-ytick_1">
<g id="sht-ch_ci-line2d_1">
<defs>
<path id="sht-ch_ci-mb258c49b38" d="M 0 0 
L -3.5 0 
" style="stroke: currentColor; stroke-width: 0.8"/>
</defs>
<g>
<use xlink:href="#sht-ch_ci-mb258c49b38" x="40.241406" y="164.04359" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_ci-text_2">
<text style="font-size: 10px; text-anchor: end" x="33.241406" y="167.842418" transform="rotate(-0 33.241406 167.842418)">27</text>
</g>
</g>
<g id="sht-ch_ci-ytick_2">
<g id="sht-ch_ci-line2d_2">
<g>
<use xlink:href="#sht-ch_ci-mb258c49b38" x="40.241406" y="138.53613" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_ci-text_3">
<text style="font-size: 10px; text-anchor: end" x="33.241406" y="142.334958" transform="rotate(-0 33.241406 142.334958)">28</text>
</g>
</g>
<g id="sht-ch_ci-ytick_3">
<g id="sht-ch_ci-line2d_3">
<g>
<use xlink:href="#sht-ch_ci-mb258c49b38" x="40.241406" y="113.028669" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_ci-text_4">
<text style="font-size: 10px; text-anchor: end" x="33.241406" y="116.827498" transform="rotate(-0 33.241406 116.827498)">29</text>
</g>
</g>
<g id="sht-ch_ci-ytick_4">
<g id="sht-ch_ci-line2d_4">
<g>
<use xlink:href="#sht-ch_ci-mb258c49b38" x="40.241406" y="87.521209" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_ci-text_5">
<text style="font-size: 10px; text-anchor: end" x="33.241406" y="91.320037" transform="rotate(-0 33.241406 91.320037)">30</text>
</g>
</g>
<g id="sht-ch_ci-ytick_5">
<g id="sht-ch_ci-line2d_5">
<g>
<use xlink:href="#sht-ch_ci-mb258c49b38" x="40.241406" y="62.013749" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_ci-text_6">
<text style="font-size: 10px; text-anchor: end" x="33.241406" y="65.812577" transform="rotate(-0 33.241406 65.812577)">31</text>
</g>
</g>
<g id="sht-ch_ci-ytick_6">
<g id="sht-ch_ci-line2d_6">
<g>
<use xlink:href="#sht-ch_ci-mb258c49b38" x="40.241406" y="36.506288" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_ci-text_7">
<text style="font-size: 10px; text-anchor: end" x="33.241406" y="40.305117" transform="rotate(-0 33.241406 40.305117)">32</text>
</g>
</g>
<g id="sht-ch_ci-ytick_7">
<g id="sht-ch_ci-line2d_7">
<g>
<use xlink:href="#sht-ch_ci-mb258c49b38" x="40.241406" y="10.998828" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_ci-text_8">
<text style="font-size: 10px; text-anchor: end" x="33.241406" y="14.797656" transform="rotate(-0 33.241406 14.797656)">33</text>
</g>
</g>
<g id="sht-ch_ci-text_9">
<text style="font-size: 10px; text-anchor: middle" x="14.798437" y="97.991029" transform="rotate(-90 14.798437 97.991029)">95% CI (seconds)</text>
</g>
</g>
<g id="sht-ch_ci-line2d_8">
<path d="M 46.979519 120.61264 
L 46.979519 66.9355 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_9">
<path d="M 53.717633 166.092332 
L 53.717633 96.362043 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #ef4444; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_10">
<path d="M 60.455746 159.184264 
L 60.455746 85.607304 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_11">
<path d="M 67.193859 121.460929 
L 67.193859 53.875765 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_12">
<path d="M 73.931972 106.478355 
L 73.931972 32.100707 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_13">
<path d="M 80.670085 144.671307 
L 80.670085 67.73203 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_14">
<path d="M 87.408199 107.444498 
L 87.408199 52.042407 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_15">
<path d="M 94.146312 104.124969 
L 94.146312 49.796855 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_16">
<path d="M 100.884425 156.674934 
L 100.884425 63.224381 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_17">
<path d="M 107.622538 118.048042 
L 107.622538 64.703215 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_18">
<path d="M 114.360652 162.382306 
L 114.360652 73.50038 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_19">
<path d="M 121.098765 127.094252 
L 121.098765 53.034357 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_20">
<path d="M 127.836878 126.746995 
L 127.836878 70.296879 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_21">
<path d="M 134.574991 153.462958 
L 134.574991 62.314694 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_22">
<path d="M 141.313104 127.783204 
L 141.313104 70.319833 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_23">
<path d="M 148.051218 114.987911 
L 148.051218 54.809577 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_24">
<path d="M 154.789331 86.502361 
L 154.789331 25.370087 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #ef4444; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_25">
<path d="M 161.527444 153.066867 
L 161.527444 46.327618 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_26">
<path d="M 168.265557 148.74897 
L 168.265557 91.759046 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #ef4444; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_27">
<path d="M 175.00367 138.288404 
L 175.00367 55.996594 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_28">
<path d="M 181.741784 178.631029 
L 181.741784 76.322847 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_29">
<path d="M 188.479897 105.856978 
L 188.479897 46.204394 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_30">
<path d="M 195.21801 126.991966 
L 195.21801 41.37941 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_31">
<path d="M 201.956123 132.458754 
L 201.956123 47.272325 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_32">
<path d="M 208.694236 116.261619 
L 208.694236 45.154654 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_33">
<path d="M 215.43235 109.369302 
L 215.43235 40.982204 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_34">
<path d="M 222.170463 129.080748 
L 222.170463 62.032967 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_35">
<path d="M 228.908576 137.769196 
L 228.908576 63.525638 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_36">
<path d="M 235.646689 103.245879 
L 235.646689 17.351029 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_37">
<path d="M 242.384802 114.200678 
L 242.384802 71.047034 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_38">
<path d="M 249.122916 147.764845 
L 249.122916 47.79801 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_39">
<path d="M 255.861029 139.142971 
L 255.861029 60.422879 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_40">
<path d="M 262.599142 122.065647 
L 262.599142 49.794158 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_41">
<path d="M 269.337255 130.516948 
L 269.337255 57.362874 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_42">
<path d="M 276.075369 121.224385 
L 276.075369 18.217011 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_43">
<path d="M 282.813482 139.115537 
L 282.813482 71.416039 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_44">
<path d="M 289.551595 147.603471 
L 289.551595 85.163301 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_45">
<path d="M 296.289708 116.426986 
L 296.289708 58.866885 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_46">
<path d="M 303.027821 162.347077 
L 303.027821 79.170476 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_47">
<path d="M 309.765935 152.578966 
L 309.765935 70.251778 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke: #3b82f6; stroke-width: 2; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-line2d_48">
<path d="M 40.241406 87.521209 
L 316.504048 87.521209 
" clip-path="url(#sht-ch_ci-pc76f555ced)" style="fill: none; stroke-dasharray: 3.7,1.6; stroke-dashoffset: 0; stroke: currentColor"/>
</g>
<g id="sht-ch_ci-patch_3">
<path d="M 40.241406 186.695029 
L 40.241406 9.287029 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-patch_4">
<path d="M 40.241406 186.695029 
L 397.361406 186.695029 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sht-ch_ci-text_10">
<text style="font-size: 8.5px; text-anchor: start" x="321.894538" y="89.729217" transform="rotate(-0 321.894538 89.729217)">true mean 30</text>
</g>
</g>
</g>
<defs>
<clipPath id="sht-ch_ci-pc76f555ced">
<rect x="40.241406" y="9.287029" width="357.12" height="177.408"/>
</clipPath>
</defs>
</svg><figcaption>Forty repeated studies of 12 shoppers, one 95% interval each. Almost all of them cover the true mean of 30; the occasional red one misses. The 95% is a property of the method.</figcaption></figure>
  <p>The width of a CI shrinks like 1 ÷ √n: four times the data gives half the width. At work, a CI is usually more useful than a p-value, because it shows size and uncertainty together. "Checkout is 3 seconds faster, 95% CI 1 to 5 seconds" lets the business judge whether even the low end is worth the engineering cost; "p = 0.013" cannot.</p>

  <h2 id="sht-t"><span class="num">06</span>t-tests</h2>
  <p>Everything so far used one group compared with a fixed number, the old page's 30 seconds. That is the <strong>one-sample t-test</strong>, and it is the first of three t-tests. In practice we more often compare two groups, and the right test depends on how the groups were formed. All three share one recipe, t = difference ÷ SE of that difference; they differ only in what "the difference" is and how its SE is worked out.</p>
  <p>The <strong>two-sample t-test</strong> compares two independent groups of different people, for example shoppers who saw the old page against other shoppers who saw the new one. Take a tiny version so we can do it by hand: old page 31, 33, 35 seconds; new page 28, 29, 30 seconds. The means are 33 and 29, so the difference is 4 seconds. Each mean has its own standard error, and when you subtract two independent averages their wobbles add up (in squares), so:</p>
  <div class="fx" data-lang="text">variances (÷ n − 1):  old = (4 + 0 + 4) ÷ 2 = 4      new = (1 + 0 + 1) ÷ 2 = 1
SE of difference    = √(s²_old ÷ n_old + s²_new ÷ n_new) = √(4/3 + 1/3) = √1.667 = 1.291
t                   = 4 ÷ 1.291 = 3.10</div>
  <p>This version, which lets the two groups have different variances, is called <strong>Welch's t-test</strong>. The older <strong>Student's t-test</strong> assumes both groups have the same variance and pools them into one estimate. Welch is the safer default: it is reliable when the variances differ and loses almost nothing when they do not. Its degrees of freedom come from a formula that adjusts for unequal variances; here it gives about 2.94.</p>
  <div class="fx" data-lang="py">a, b = np.array([31, 33, 35]), np.array([28, 29, 30])     # old page vs new page, seconds
va, vb = a.var(ddof=1) / len(a), b.var(ddof=1) / len(b)   # squared SE of each mean
se2 = np.sqrt(va + vb)
t2 = (a.mean() - b.mean()) / se2
df2 = (va + vb)**2 / (va**2 / (len(a) - 1) + vb**2 / (len(b) - 1))   # Welch df
print(f"by hand: se = {se2:.3f}  t = {t2:.3f}  df = {df2:.2f}  p = {2 * stats.t.sf(t2, df2):.4f}")
rw = stats.ttest_ind(a, b, equal_var=False)
print(f"scipy  : t = {rw.statistic:.3f}  p = {rw.pvalue:.4f}  df = {rw.df:.2f}")
rng = np.random.default_rng(1)
old40, new40 = rng.normal(33, 6, 40), rng.normal(30, 6, 40)       # 40 shoppers per page
r40 = stats.ttest_ind(old40, new40, equal_var=False)
print(f"40 per page: t = {r40.statistic:.3f}  p = {r40.pvalue:.4f}")</div>
  <div class="fx" data-lang="text">by hand: se = 1.291  t = 3.098  df = 2.94  p = 0.0548
scipy  : t = 3.098  p = 0.0548  df = 2.94
40 per page: t = 3.419  p = 0.0010</div>
  <p>The hand calculation and <code>ttest_ind(a, b, equal_var=False)</code> agree: t = 3.098, 2.94 degrees of freedom. And here is a lesson worth remembering: 33 against 29 seconds looks like a clear difference, yet p = 0.055, not significant. With three shoppers per page the t curve has very fat tails, so tiny samples need huge gaps. The last line runs the same test on a simulated 40 shoppers per page with a true 3-second gap and gets p = 0.001.</p>
  <p>The <strong>paired t-test</strong> is for the same units measured twice: the same users before and after, or the same eight testers using both pages (in random order). Comparing two coaching centres by their students' marks is a two-sample comparison: different students, lots of natural spread. Comparing the same eight students before and after a crash course is paired: each student is their own baseline, so "this student is just quick" cancels out. The trick is to subtract within each tester first and then run a one-sample t-test on the differences, with H₀ "the mean difference is 0". Eight testers took 42, 28, 55, 20, 38, 49, 31, 60 seconds on the old page and 35, 24, 47, 18, 30, 44, 26, 51 on the new. The differences are 7, 4, 8, 2, 8, 5, 5, 9: mean 6.0, standard deviation 2.39, SE = 2.39 ÷ √8 = 0.845, t = 6.0 ÷ 0.845 = 7.10.</p>
  <div class="fx" data-lang="py">before = np.array([42, 28, 55, 20, 38, 49, 31, 60])   # same 8 testers, old page (s)
after  = np.array([35, 24, 47, 18, 30, 44, 26, 51])   # same 8 testers, new page (s)
d = before - after
print("differences:", d, " mean", d.mean(), " sd", round(d.std(ddof=1), 3))
r = stats.ttest_rel(before, after)
print(f"paired  : t = {r.statistic:.3f}  p = {r.pvalue:.4f}")
r = stats.ttest_ind(before, after)
print(f"unpaired: t = {r.statistic:.3f}  p = {r.pvalue:.4f}")</div>
  <div class="fx" data-lang="text">differences: [7 4 8 2 8 5 5 9]  mean 6.0  sd 2.39
paired  : t = 7.099  p = 0.0002
unpaired: t = 0.930  p = 0.3682</div>
  <p><code>ttest_rel</code> ("related samples") gives t = 7.099, exactly the hand value, and p = 0.0002. Treating the very same numbers as two unrelated groups with <code>ttest_ind</code> gives p = 0.37: nothing. Why such a gap? Testers differ hugely from each other, from 18 to 60 seconds, and in the unpaired test that person-to-person spread swamps the 6-second improvement. Pairing subtracts each tester from themselves, so that spread disappears and only the improvement is left. Whenever data is naturally paired, use the paired test; ignoring the pairing throws away most of your power.</p>
  <table class="tbl">
    <tr><th>Test</th><th>Question</th><th>Difference and SE</th><th>SciPy</th></tr>
    <tr><td>One-sample</td><td>one group vs a known value</td><td>x̄ − μ₀; s ÷ √n</td><td><code>ttest_1samp</code></td></tr>
    <tr><td>Two-sample (Welch)</td><td>two independent groups</td><td>x̄₁ − x̄₂; √(s₁²/n₁ + s₂²/n₂)</td><td><code>ttest_ind(equal_var=False)</code></td></tr>
    <tr><td>Paired</td><td>same units measured twice</td><td>mean of differences; s<sub>d</sub> ÷ √n</td><td><code>ttest_rel</code></td></tr>
  </table>
  <p>t-tests assume the sample means are roughly normal. With small samples that needs roughly normal data; with larger samples (a few dozen or more per group) the Central Limit Theorem makes the mean close to normal even when the data is skewed, which is why t-tests work well on things like order values in large A/B tests. You may also hear of a <strong>z-test</strong> for means: it is the same thing when the true standard deviation is known or n is large, so the normal curve replaces the t curve. In practice the t-test is used, because the true standard deviation is almost never known.</p>

  <h2 id="sht-z"><span class="num">07</span>The z-test for Proportions</h2>
  <p>The decision metric for the checkout is not time but <strong>conversion</strong>: did the shopper buy, yes or no? In the conversion pilot, 1,000 shoppers saw each page; 100 bought on the old page (10%) and 130 on the new page (13%). Is 13% against 10% a real difference? Think of two batters' boundary rates: 13 per 100 balls against 10 per 100. Over 100 balls each that could easily be one good day; over 10,000 balls each it would clearly be a better player. The test tells us which of those worlds we are in.</p>
  <p>The recipe is unchanged; only the statistic is new. Each shopper is a yes/no (Bernoulli) trial, so a conversion rate is just an average of 0s and 1s, and the Central Limit Theorem makes it close to normal for large n, with standard error √(p(1 − p) ÷ n). Because that SE comes straight from the rate p itself, there is no separate standard deviation to estimate, so with large samples the null distribution is the standard normal curve and the statistic is called <strong>z</strong>. Under H₀ the two pages convert at the same rate, so we estimate that one shared rate by pooling everyone:</p>
  <div class="fx" data-lang="text">difference = 0.13 − 0.10 = 0.03                (3 percentage points)
pooled p   = (100 + 130) ÷ 2000 = 0.115
SE (H₀)    = √(0.115 × 0.885 × (1/1000 + 1/1000)) = 0.01427
z          = 0.03 ÷ 0.01427 = 2.10            two-sided p = 0.036

CI (no pooling: we no longer assume H₀)
SE         = √(0.10 × 0.90/1000 + 0.13 × 0.87/1000) = 0.01425
95% CI     = 0.03 ± 1.96 × 0.01425 = +0.002 to +0.058</div>
  <div class="fx" data-lang="py">from statsmodels.stats.proportion import proportions_ztest
x_old, x_new, n_arm = 100, 130, 1000            # buyers out of 1,000 shoppers per page
p_old, p_new = x_old / n_arm, x_new / n_arm
pool = (x_old + x_new) / (2 * n_arm)            # one shared rate, assuming H0
se0 = np.sqrt(pool * (1 - pool) * (2 / n_arm))
z = (p_new - p_old) / se0
print(f"pooled = {pool:.3f}  se = {se0:.5f}  z = {z:.3f}  p = {2 * stats.norm.sf(abs(z)):.4f}")
se1 = np.sqrt(p_old * (1 - p_old) / n_arm + p_new * (1 - p_new) / n_arm)   # unpooled, for the CI
print(f"95% CI for the lift: {p_new - p_old - 1.96 * se1:+.4f} to {p_new - p_old + 1.96 * se1:+.4f}")
zz, pp = proportions_ztest([x_new, x_old], [n_arm, n_arm])
print(f"statsmodels: z = {zz:.3f}  p = {pp:.4f}")</div>
  <div class="fx" data-lang="text">pooled = 0.115  se = 0.01427  z = 2.103  p = 0.0355
95% CI for the lift: +0.0021 to +0.0579
statsmodels: z = 2.103  p = 0.0355</div>
  <p>The hand calculation and statsmodels' <code>proportions_ztest</code> agree: z = 2.10, p = 0.036, so the lift is significant at α = 0.05. But look at the confidence interval: somewhere between +0.2 and +5.8 percentage points. That is "probably positive, size very uncertain", which is a far more honest summary than "significant". Notice the two different standard errors: the pooled one for the test (because the test assumes H₀), the unpooled one for the interval (because the interval does not).</p>
  <p>The z-test needs reasonably large counts, roughly at least 10 buyers and 10 non-buyers in each group. For tiny counts, use an exact test instead: the binomial test from section 01 for one group, or Fisher's exact test for two. This two-proportion z-test is the workhorse of product A/B testing, and the next note, <a class="xref" data-note="st_abtesting">A/B Testing</a>, runs it on the full experiment.</p>

  <h2 id="sht-power"><span class="num">08</span>Power and Sample Size</h2>
  <p>The pilots so far happened to find effects. But a study that is too small can easily miss a real effect, and then the team wrongly concludes "it doesn't work". <strong>Power</strong>, introduced in section 04, is the probability that a test rejects H₀ when a real effect of a given size exists: 1 − β. Power is something you plan <em>before</em> collecting data, by choosing how many users to include.</p>
  <p>The picture explains power better than any formula. There are two curves of possible test statistics: the grey one is where the statistic would land if H₀ were true, and the blue one is where it would land if there were a real effect. We reject whenever the statistic falls to the right of the cut-off. The red sliver of the grey curve beyond the cut-off is α (false alarms). The part of the blue curve to the left of the cut-off is β (real effects we miss), and the part to the right is power.</p>
  <figure class="viz"><svg fill="currentColor" style="max-width:680px;width:100%;height:auto" xmlns:xlink="http://www.w3.org/1999/xlink"  viewBox="0 0 371.52 211.720781" xmlns="http://www.w3.org/2000/svg" version="1.1">
<defs>
</defs>
<g id="sht-ch_power-figure_1">
<g id="sht-ch_power-patch_1">
<path d="M 0 211.720781 
L 371.52 211.720781 
L 371.52 0 
L 0 0 
L 0 211.720781 
z
" style="fill: none"/>
</g>
<g id="sht-ch_power-axes_1">
<g id="sht-ch_power-patch_2">
<path d="M 7.2 173.52 
L 364.32 173.52 
L 364.32 7.2 
L 7.2 7.2 
L 7.2 173.52 
z
" style="fill: none"/>
</g>
<g id="sht-ch_power-FillBetweenPolyCollection_1">
<defs>
<path id="sht-ch_power-mf47c7e1985" d="M 23.432727 -38.200781 
L 23.432727 -38.200783 
L 23.974722 -38.200784 
L 24.516716 -38.200784 
L 25.05871 -38.200784 
L 25.600704 -38.200784 
L 26.142698 -38.200785 
L 26.684693 -38.200785 
L 27.226687 -38.200785 
L 27.768681 -38.200786 
L 28.310675 -38.200786 
L 28.85267 -38.200787 
L 29.394664 -38.200787 
L 29.936658 -38.200788 
L 30.478652 -38.200789 
L 31.020647 -38.200789 
L 31.562641 -38.20079 
L 32.104635 -38.200791 
L 32.646629 -38.200792 
L 33.188623 -38.200793 
L 33.730618 -38.200794 
L 34.272612 -38.200795 
L 34.814606 -38.200796 
L 35.3566 -38.200798 
L 35.898595 -38.200799 
L 36.440589 -38.200801 
L 36.982583 -38.200803 
L 37.524577 -38.200805 
L 38.066572 -38.200807 
L 38.608566 -38.200809 
L 39.15056 -38.200812 
L 39.692554 -38.200815 
L 40.234548 -38.200818 
L 40.776543 -38.200821 
L 41.318537 -38.200825 
L 41.860531 -38.200829 
L 42.402525 -38.200833 
L 42.94452 -38.200837 
L 43.486514 -38.200842 
L 44.028508 -38.200848 
L 44.570502 -38.200854 
L 45.112497 -38.20086 
L 45.654491 -38.200867 
L 46.196485 -38.200875 
L 46.738479 -38.200883 
L 47.280474 -38.200892 
L 47.822468 -38.200902 
L 48.364462 -38.200912 
L 48.906456 -38.200924 
L 49.44845 -38.200936 
L 49.990445 -38.20095 
L 50.532439 -38.200964 
L 51.074433 -38.20098 
L 51.616427 -38.200997 
L 52.158422 -38.201015 
L 52.700416 -38.201035 
L 53.24241 -38.201057 
L 53.784404 -38.20108 
L 54.326399 -38.201105 
L 54.868393 -38.201133 
L 55.410387 -38.201162 
L 55.952381 -38.201194 
L 56.494375 -38.201228 
L 57.03637 -38.201265 
L 57.578364 -38.201305 
L 58.120358 -38.201348 
L 58.662352 -38.201395 
L 59.204347 -38.201445 
L 59.746341 -38.201499 
L 60.288335 -38.201558 
L 60.830329 -38.201621 
L 61.372324 -38.201688 
L 61.914318 -38.201761 
L 62.456312 -38.20184 
L 62.998306 -38.201925 
L 63.540301 -38.202016 
L 64.082295 -38.202114 
L 64.624289 -38.202219 
L 65.166283 -38.202333 
L 65.708277 -38.202455 
L 66.250272 -38.202586 
L 66.792266 -38.202727 
L 67.33426 -38.202878 
L 67.876254 -38.203041 
L 68.418249 -38.203215 
L 68.960243 -38.203403 
L 69.502237 -38.203604 
L 70.044231 -38.203819 
L 70.586226 -38.204051 
L 71.12822 -38.204299 
L 71.670214 -38.204565 
L 72.212208 -38.20485 
L 72.754202 -38.205155 
L 73.296197 -38.205483 
L 73.838191 -38.205833 
L 74.380185 -38.206208 
L 74.922179 -38.20661 
L 75.464174 -38.20704 
L 76.006168 -38.207499 
L 76.548162 -38.207991 
L 77.090156 -38.208517 
L 77.632151 -38.209079 
L 78.174145 -38.209679 
L 78.716139 -38.210321 
L 79.258133 -38.211006 
L 79.800127 -38.211738 
L 80.342122 -38.212519 
L 80.884116 -38.213353 
L 81.42611 -38.214243 
L 81.968104 -38.215192 
L 82.510099 -38.216204 
L 83.052093 -38.217282 
L 83.594087 -38.218432 
L 84.136081 -38.219658 
L 84.678076 -38.220963 
L 85.22007 -38.222353 
L 85.762064 -38.223833 
L 86.304058 -38.225408 
L 86.846053 -38.227085 
L 87.388047 -38.228868 
L 87.930041 -38.230765 
L 88.472035 -38.232782 
L 89.014029 -38.234926 
L 89.556024 -38.237204 
L 90.098018 -38.239625 
L 90.640012 -38.242196 
L 91.182006 -38.244926 
L 91.724001 -38.247825 
L 92.265995 -38.250901 
L 92.807989 -38.254165 
L 93.349983 -38.257627 
L 93.891978 -38.261298 
L 94.433972 -38.265191 
L 94.975966 -38.269316 
L 95.51796 -38.273687 
L 96.059954 -38.278318 
L 96.601949 -38.283222 
L 97.143943 -38.288414 
L 97.685937 -38.293909 
L 98.227931 -38.299725 
L 98.769926 -38.305877 
L 99.31192 -38.312384 
L 99.853914 -38.319263 
L 100.395908 -38.326535 
L 100.937903 -38.33422 
L 101.479897 -38.342339 
L 102.021891 -38.350914 
L 102.563885 -38.359968 
L 103.105879 -38.369526 
L 103.647874 -38.379613 
L 104.189868 -38.390255 
L 104.731862 -38.40148 
L 105.273856 -38.413317 
L 105.815851 -38.425795 
L 106.357845 -38.438945 
L 106.899839 -38.452801 
L 107.441833 -38.467396 
L 107.983828 -38.482765 
L 108.525822 -38.498945 
L 109.067816 -38.515975 
L 109.60981 -38.533893 
L 110.151805 -38.552741 
L 110.693799 -38.572562 
L 111.235793 -38.593401 
L 111.777787 -38.615303 
L 112.319781 -38.638317 
L 112.861776 -38.662493 
L 113.40377 -38.687881 
L 113.945764 -38.714537 
L 114.487758 -38.742515 
L 115.029753 -38.771873 
L 115.571747 -38.802671 
L 116.113741 -38.83497 
L 116.655735 -38.868834 
L 117.19773 -38.90433 
L 117.739724 -38.941525 
L 118.281718 -38.98049 
L 118.823712 -39.021299 
L 119.365706 -39.064026 
L 119.907701 -39.10875 
L 120.449695 -39.155551 
L 120.991689 -39.204512 
L 121.533683 -39.255718 
L 122.075678 -39.309258 
L 122.617672 -39.365221 
L 123.159666 -39.423703 
L 123.70166 -39.484799 
L 124.243655 -39.548607 
L 124.785649 -39.615232 
L 125.327643 -39.684775 
L 125.869637 -39.757347 
L 126.411632 -39.833057 
L 126.953626 -39.912019 
L 127.49562 -39.99435 
L 128.037614 -40.080169 
L 128.579608 -40.169598 
L 129.121603 -40.262765 
L 129.663597 -40.359797 
L 130.205591 -40.460827 
L 130.747585 -40.56599 
L 131.28958 -40.675423 
L 131.831574 -40.789268 
L 132.373568 -40.90767 
L 132.915562 -41.030776 
L 133.457557 -41.158736 
L 133.999551 -41.291705 
L 134.541545 -41.429838 
L 135.083539 -41.573297 
L 135.625533 -41.722243 
L 136.167528 -41.876842 
L 136.709522 -42.037264 
L 137.251516 -42.203679 
L 137.79351 -42.376262 
L 138.335505 -42.555191 
L 138.877499 -42.740646 
L 139.419493 -42.932808 
L 139.961487 -43.131864 
L 140.503482 -43.338001 
L 141.045476 -43.551409 
L 141.58747 -43.77228 
L 142.129464 -44.000811 
L 142.671458 -44.237196 
L 143.213453 -44.481636 
L 143.755447 -44.73433 
L 144.297441 -44.995481 
L 144.839435 -45.265294 
L 145.38143 -45.543974 
L 145.923424 -45.831727 
L 146.465418 -46.128762 
L 147.007412 -46.435287 
L 147.549407 -46.751513 
L 148.091401 -47.07765 
L 148.633395 -47.413908 
L 149.175389 -47.760499 
L 149.717384 -48.117633 
L 150.259378 -48.485522 
L 150.801372 -48.864377 
L 151.343366 -49.254406 
L 151.88536 -49.655819 
L 152.427355 -50.068825 
L 152.969349 -50.493628 
L 153.511343 -50.930434 
L 154.053337 -51.379447 
L 154.595332 -51.840866 
L 155.137326 -52.31489 
L 155.67932 -52.801714 
L 156.221314 -53.301531 
L 156.763309 -53.81453 
L 157.305303 -54.340895 
L 157.847297 -54.88081 
L 158.389291 -55.43445 
L 158.931285 -56.001989 
L 159.47328 -56.583593 
L 160.015274 -57.179425 
L 160.557268 -57.789641 
L 161.099262 -58.414393 
L 161.641257 -59.053824 
L 162.183251 -59.708073 
L 162.725245 -60.377269 
L 163.267239 -61.061536 
L 163.809234 -61.760989 
L 164.351228 -62.475737 
L 164.893222 -63.205877 
L 165.435216 -63.951501 
L 165.977211 -64.712689 
L 166.519205 -65.489513 
L 167.061199 -66.282034 
L 167.603193 -67.090304 
L 168.145187 -67.914363 
L 168.687182 -68.754243 
L 169.229176 -69.609961 
L 169.77117 -70.481525 
L 170.313164 -71.368929 
L 170.855159 -72.272157 
L 171.397153 -73.19118 
L 171.939147 -74.125954 
L 172.481141 -75.076424 
L 173.023136 -76.042522 
L 173.56513 -77.024163 
L 174.107124 -78.021251 
L 174.649118 -79.033675 
L 175.191112 -80.061309 
L 175.733107 -81.104013 
L 176.275101 -82.16163 
L 176.817095 -83.23399 
L 177.359089 -84.320907 
L 177.901084 -85.422178 
L 178.443078 -86.537586 
L 178.985072 -87.666896 
L 179.527066 -88.80986 
L 180.069061 -89.966211 
L 180.611055 -91.135667 
L 181.153049 -92.317928 
L 181.695043 -93.512679 
L 182.237037 -94.71959 
L 182.779032 -95.93831 
L 183.321026 -97.168476 
L 183.86302 -98.409705 
L 184.405014 -99.661601 
L 184.947009 -100.923747 
L 185.489003 -102.195714 
L 186.030997 -103.477054 
L 186.572991 -104.767304 
L 187.114986 -106.065984 
L 187.65698 -107.3726 
L 188.198974 -108.686641 
L 188.740968 -110.00758 
L 189.282963 -111.334877 
L 189.824957 -112.667974 
L 190.366951 -114.006301 
L 190.908945 -115.349273 
L 191.450939 -116.69629 
L 191.992934 -118.04674 
L 192.534928 -119.399997 
L 193.076922 -120.755421 
L 193.618916 -122.112362 
L 194.160911 -123.470156 
L 194.702905 -124.828129 
L 195.244899 -126.185594 
L 195.786893 -127.541856 
L 196.328888 -128.896209 
L 196.870882 -130.247937 
L 197.412876 -131.596316 
L 197.95487 -132.940614 
L 198.496864 -134.280092 
L 199.038859 -135.614002 
L 199.038859 -38.200781 
L 199.038859 -38.200781 
L 198.496864 -38.200781 
L 197.95487 -38.200781 
L 197.412876 -38.200781 
L 196.870882 -38.200781 
L 196.328888 -38.200781 
L 195.786893 -38.200781 
L 195.244899 -38.200781 
L 194.702905 -38.200781 
L 194.160911 -38.200781 
L 193.618916 -38.200781 
L 193.076922 -38.200781 
L 192.534928 -38.200781 
L 191.992934 -38.200781 
L 191.450939 -38.200781 
L 190.908945 -38.200781 
L 190.366951 -38.200781 
L 189.824957 -38.200781 
L 189.282963 -38.200781 
L 188.740968 -38.200781 
L 188.198974 -38.200781 
L 187.65698 -38.200781 
L 187.114986 -38.200781 
L 186.572991 -38.200781 
L 186.030997 -38.200781 
L 185.489003 -38.200781 
L 184.947009 -38.200781 
L 184.405014 -38.200781 
L 183.86302 -38.200781 
L 183.321026 -38.200781 
L 182.779032 -38.200781 
L 182.237037 -38.200781 
L 181.695043 -38.200781 
L 181.153049 -38.200781 
L 180.611055 -38.200781 
L 180.069061 -38.200781 
L 179.527066 -38.200781 
L 178.985072 -38.200781 
L 178.443078 -38.200781 
L 177.901084 -38.200781 
L 177.359089 -38.200781 
L 176.817095 -38.200781 
L 176.275101 -38.200781 
L 175.733107 -38.200781 
L 175.191112 -38.200781 
L 174.649118 -38.200781 
L 174.107124 -38.200781 
L 173.56513 -38.200781 
L 173.023136 -38.200781 
L 172.481141 -38.200781 
L 171.939147 -38.200781 
L 171.397153 -38.200781 
L 170.855159 -38.200781 
L 170.313164 -38.200781 
L 169.77117 -38.200781 
L 169.229176 -38.200781 
L 168.687182 -38.200781 
L 168.145187 -38.200781 
L 167.603193 -38.200781 
L 167.061199 -38.200781 
L 166.519205 -38.200781 
L 165.977211 -38.200781 
L 165.435216 -38.200781 
L 164.893222 -38.200781 
L 164.351228 -38.200781 
L 163.809234 -38.200781 
L 163.267239 -38.200781 
L 162.725245 -38.200781 
L 162.183251 -38.200781 
L 161.641257 -38.200781 
L 161.099262 -38.200781 
L 160.557268 -38.200781 
L 160.015274 -38.200781 
L 159.47328 -38.200781 
L 158.931285 -38.200781 
L 158.389291 -38.200781 
L 157.847297 -38.200781 
L 157.305303 -38.200781 
L 156.763309 -38.200781 
L 156.221314 -38.200781 
L 155.67932 -38.200781 
L 155.137326 -38.200781 
L 154.595332 -38.200781 
L 154.053337 -38.200781 
L 153.511343 -38.200781 
L 152.969349 -38.200781 
L 152.427355 -38.200781 
L 151.88536 -38.200781 
L 151.343366 -38.200781 
L 150.801372 -38.200781 
L 150.259378 -38.200781 
L 149.717384 -38.200781 
L 149.175389 -38.200781 
L 148.633395 -38.200781 
L 148.091401 -38.200781 
L 147.549407 -38.200781 
L 147.007412 -38.200781 
L 146.465418 -38.200781 
L 145.923424 -38.200781 
L 145.38143 -38.200781 
L 144.839435 -38.200781 
L 144.297441 -38.200781 
L 143.755447 -38.200781 
L 143.213453 -38.200781 
L 142.671458 -38.200781 
L 142.129464 -38.200781 
L 141.58747 -38.200781 
L 141.045476 -38.200781 
L 140.503482 -38.200781 
L 139.961487 -38.200781 
L 139.419493 -38.200781 
L 138.877499 -38.200781 
L 138.335505 -38.200781 
L 137.79351 -38.200781 
L 137.251516 -38.200781 
L 136.709522 -38.200781 
L 136.167528 -38.200781 
L 135.625533 -38.200781 
L 135.083539 -38.200781 
L 134.541545 -38.200781 
L 133.999551 -38.200781 
L 133.457557 -38.200781 
L 132.915562 -38.200781 
L 132.373568 -38.200781 
L 131.831574 -38.200781 
L 131.28958 -38.200781 
L 130.747585 -38.200781 
L 130.205591 -38.200781 
L 129.663597 -38.200781 
L 129.121603 -38.200781 
L 128.579608 -38.200781 
L 128.037614 -38.200781 
L 127.49562 -38.200781 
L 126.953626 -38.200781 
L 126.411632 -38.200781 
L 125.869637 -38.200781 
L 125.327643 -38.200781 
L 124.785649 -38.200781 
L 124.243655 -38.200781 
L 123.70166 -38.200781 
L 123.159666 -38.200781 
L 122.617672 -38.200781 
L 122.075678 -38.200781 
L 121.533683 -38.200781 
L 120.991689 -38.200781 
L 120.449695 -38.200781 
L 119.907701 -38.200781 
L 119.365706 -38.200781 
L 118.823712 -38.200781 
L 118.281718 -38.200781 
L 117.739724 -38.200781 
L 117.19773 -38.200781 
L 116.655735 -38.200781 
L 116.113741 -38.200781 
L 115.571747 -38.200781 
L 115.029753 -38.200781 
L 114.487758 -38.200781 
L 113.945764 -38.200781 
L 113.40377 -38.200781 
L 112.861776 -38.200781 
L 112.319781 -38.200781 
L 111.777787 -38.200781 
L 111.235793 -38.200781 
L 110.693799 -38.200781 
L 110.151805 -38.200781 
L 109.60981 -38.200781 
L 109.067816 -38.200781 
L 108.525822 -38.200781 
L 107.983828 -38.200781 
L 107.441833 -38.200781 
L 106.899839 -38.200781 
L 106.357845 -38.200781 
L 105.815851 -38.200781 
L 105.273856 -38.200781 
L 104.731862 -38.200781 
L 104.189868 -38.200781 
L 103.647874 -38.200781 
L 103.105879 -38.200781 
L 102.563885 -38.200781 
L 102.021891 -38.200781 
L 101.479897 -38.200781 
L 100.937903 -38.200781 
L 100.395908 -38.200781 
L 99.853914 -38.200781 
L 99.31192 -38.200781 
L 98.769926 -38.200781 
L 98.227931 -38.200781 
L 97.685937 -38.200781 
L 97.143943 -38.200781 
L 96.601949 -38.200781 
L 96.059954 -38.200781 
L 95.51796 -38.200781 
L 94.975966 -38.200781 
L 94.433972 -38.200781 
L 93.891978 -38.200781 
L 93.349983 -38.200781 
L 92.807989 -38.200781 
L 92.265995 -38.200781 
L 91.724001 -38.200781 
L 91.182006 -38.200781 
L 90.640012 -38.200781 
L 90.098018 -38.200781 
L 89.556024 -38.200781 
L 89.014029 -38.200781 
L 88.472035 -38.200781 
L 87.930041 -38.200781 
L 87.388047 -38.200781 
L 86.846053 -38.200781 
L 86.304058 -38.200781 
L 85.762064 -38.200781 
L 85.22007 -38.200781 
L 84.678076 -38.200781 
L 84.136081 -38.200781 
L 83.594087 -38.200781 
L 83.052093 -38.200781 
L 82.510099 -38.200781 
L 81.968104 -38.200781 
L 81.42611 -38.200781 
L 80.884116 -38.200781 
L 80.342122 -38.200781 
L 79.800127 -38.200781 
L 79.258133 -38.200781 
L 78.716139 -38.200781 
L 78.174145 -38.200781 
L 77.632151 -38.200781 
L 77.090156 -38.200781 
L 76.548162 -38.200781 
L 76.006168 -38.200781 
L 75.464174 -38.200781 
L 74.922179 -38.200781 
L 74.380185 -38.200781 
L 73.838191 -38.200781 
L 73.296197 -38.200781 
L 72.754202 -38.200781 
L 72.212208 -38.200781 
L 71.670214 -38.200781 
L 71.12822 -38.200781 
L 70.586226 -38.200781 
L 70.044231 -38.200781 
L 69.502237 -38.200781 
L 68.960243 -38.200781 
L 68.418249 -38.200781 
L 67.876254 -38.200781 
L 67.33426 -38.200781 
L 66.792266 -38.200781 
L 66.250272 -38.200781 
L 65.708277 -38.200781 
L 65.166283 -38.200781 
L 64.624289 -38.200781 
L 64.082295 -38.200781 
L 63.540301 -38.200781 
L 62.998306 -38.200781 
L 62.456312 -38.200781 
L 61.914318 -38.200781 
L 61.372324 -38.200781 
L 60.830329 -38.200781 
L 60.288335 -38.200781 
L 59.746341 -38.200781 
L 59.204347 -38.200781 
L 58.662352 -38.200781 
L 58.120358 -38.200781 
L 57.578364 -38.200781 
L 57.03637 -38.200781 
L 56.494375 -38.200781 
L 55.952381 -38.200781 
L 55.410387 -38.200781 
L 54.868393 -38.200781 
L 54.326399 -38.200781 
L 53.784404 -38.200781 
L 53.24241 -38.200781 
L 52.700416 -38.200781 
L 52.158422 -38.200781 
L 51.616427 -38.200781 
L 51.074433 -38.200781 
L 50.532439 -38.200781 
L 49.990445 -38.200781 
L 49.44845 -38.200781 
L 48.906456 -38.200781 
L 48.364462 -38.200781 
L 47.822468 -38.200781 
L 47.280474 -38.200781 
L 46.738479 -38.200781 
L 46.196485 -38.200781 
L 45.654491 -38.200781 
L 45.112497 -38.200781 
L 44.570502 -38.200781 
L 44.028508 -38.200781 
L 43.486514 -38.200781 
L 42.94452 -38.200781 
L 42.402525 -38.200781 
L 41.860531 -38.200781 
L 41.318537 -38.200781 
L 40.776543 -38.200781 
L 40.234548 -38.200781 
L 39.692554 -38.200781 
L 39.15056 -38.200781 
L 38.608566 -38.200781 
L 38.066572 -38.200781 
L 37.524577 -38.200781 
L 36.982583 -38.200781 
L 36.440589 -38.200781 
L 35.898595 -38.200781 
L 35.3566 -38.200781 
L 34.814606 -38.200781 
L 34.272612 -38.200781 
L 33.730618 -38.200781 
L 33.188623 -38.200781 
L 32.646629 -38.200781 
L 32.104635 -38.200781 
L 31.562641 -38.200781 
L 31.020647 -38.200781 
L 30.478652 -38.200781 
L 29.936658 -38.200781 
L 29.394664 -38.200781 
L 28.85267 -38.200781 
L 28.310675 -38.200781 
L 27.768681 -38.200781 
L 27.226687 -38.200781 
L 26.684693 -38.200781 
L 26.142698 -38.200781 
L 25.600704 -38.200781 
L 25.05871 -38.200781 
L 24.516716 -38.200781 
L 23.974722 -38.200781 
L 23.432727 -38.200781 
z
" style="stroke: #3b82f6; stroke-opacity: 0.18"/>
</defs>
<g clip-path="url(#sht-ch_power-pbf25170d6c)">
<use xlink:href="#sht-ch_power-mf47c7e1985" x="0" y="211.720781" style="fill: #3b82f6; fill-opacity: 0.18; stroke: #3b82f6; stroke-opacity: 0.18"/>
</g>
</g>
<g id="sht-ch_power-FillBetweenPolyCollection_2">
<defs>
<path id="sht-ch_power-mdadc901463" d="M 199.580853 -38.200781 
L 199.580853 -136.941592 
L 200.122847 -138.262103 
L 200.664841 -139.574772 
L 201.206836 -140.878831 
L 201.74883 -142.173509 
L 202.290824 -143.458034 
L 202.832818 -144.731628 
L 203.374813 -145.993516 
L 203.916807 -147.242921 
L 204.458801 -148.479065 
L 205.000795 -149.701173 
L 205.542789 -150.908471 
L 206.084784 -152.100189 
L 206.626778 -153.275559 
L 207.168772 -154.433817 
L 207.710766 -155.574207 
L 208.252761 -156.695977 
L 208.794755 -157.798381 
L 209.336749 -158.880683 
L 209.878743 -159.942153 
L 210.420738 -160.982072 
L 210.962732 -161.999731 
L 211.504726 -162.994431 
L 212.04672 -163.965485 
L 212.588715 -164.91222 
L 213.130709 -165.833973 
L 213.672703 -166.730098 
L 214.214697 -167.599963 
L 214.756691 -168.442951 
L 215.298686 -169.258462 
L 215.84068 -170.045911 
L 216.382674 -170.804733 
L 216.924668 -171.53438 
L 217.466663 -172.234324 
L 218.008657 -172.904057 
L 218.550651 -173.543088 
L 219.092645 -174.150951 
L 219.63464 -174.727199 
L 220.176634 -175.271408 
L 220.718628 -175.783175 
L 221.260622 -176.262121 
L 221.802616 -176.707891 
L 222.344611 -177.120154 
L 222.886605 -177.498601 
L 223.428599 -177.842951 
L 223.970593 -178.152945 
L 224.512588 -178.42835 
L 225.054582 -178.668961 
L 225.596576 -178.874597 
L 226.13857 -179.045102 
L 226.680565 -179.180348 
L 227.222559 -179.280234 
L 227.764553 -179.344684 
L 228.306547 -179.373649 
L 228.848542 -179.367108 
L 229.390536 -179.325066 
L 229.93253 -179.247553 
L 230.474524 -179.13463 
L 231.016518 -178.98638 
L 231.558513 -178.802916 
L 232.100507 -178.584375 
L 232.642501 -178.330923 
L 233.184495 -178.042749 
L 233.72649 -177.720069 
L 234.268484 -177.363126 
L 234.810478 -176.972186 
L 235.352472 -176.547542 
L 235.894467 -176.089508 
L 236.436461 -175.598428 
L 236.978455 -175.074663 
L 237.520449 -174.518603 
L 238.062443 -173.930657 
L 238.604438 -173.311257 
L 239.146432 -172.66086 
L 239.688426 -171.979939 
L 240.23042 -171.268991 
L 240.772415 -170.528532 
L 241.314409 -169.759099 
L 241.856403 -168.961245 
L 242.398397 -168.135542 
L 242.940392 -167.282581 
L 243.482386 -166.402969 
L 244.02438 -165.497327 
L 244.566374 -164.566294 
L 245.108368 -163.610522 
L 245.650363 -162.630677 
L 246.192357 -161.627438 
L 246.734351 -160.601496 
L 247.276345 -159.553554 
L 247.81834 -158.484325 
L 248.360334 -157.394532 
L 248.902328 -156.284907 
L 249.444322 -155.15619 
L 249.986317 -154.009129 
L 250.528311 -152.844478 
L 251.070305 -151.662996 
L 251.612299 -150.465449 
L 252.154294 -149.252605 
L 252.696288 -148.025235 
L 253.238282 -146.784115 
L 253.780276 -145.530021 
L 254.32227 -144.26373 
L 254.864265 -142.986018 
L 255.406259 -141.697663 
L 255.948253 -140.399438 
L 256.490247 -139.092118 
L 257.032242 -137.776471 
L 257.574236 -136.453263 
L 258.11623 -135.123257 
L 258.658224 -133.787208 
L 259.200219 -132.445868 
L 259.742213 -131.09998 
L 260.284207 -129.750283 
L 260.826201 -128.397504 
L 261.368195 -127.042365 
L 261.91019 -125.685578 
L 262.452184 -124.327845 
L 262.994178 -122.96986 
L 263.536172 -121.612302 
L 264.078167 -120.255843 
L 264.620161 -118.901143 
L 265.162155 -117.548846 
L 265.704149 -116.199589 
L 266.246144 -114.853991 
L 266.788138 -113.512661 
L 267.330132 -112.176194 
L 267.872126 -110.845168 
L 268.414121 -109.52015 
L 268.956115 -108.20169 
L 269.498109 -106.890324 
L 270.040103 -105.586573 
L 270.582097 -104.290942 
L 271.124092 -103.003919 
L 271.666086 -101.72598 
L 272.20808 -100.45758 
L 272.750074 -99.199161 
L 273.292069 -97.951148 
L 273.834063 -96.713949 
L 274.376057 -95.487957 
L 274.918051 -94.273546 
L 275.460046 -93.071075 
L 276.00204 -91.880888 
L 276.544034 -90.703309 
L 277.086028 -89.538647 
L 277.628022 -88.387196 
L 278.170017 -87.249233 
L 278.712011 -86.125016 
L 279.254005 -85.01479 
L 279.795999 -83.918783 
L 280.337994 -82.837206 
L 280.879988 -81.770257 
L 281.421982 -80.718115 
L 281.963976 -79.680946 
L 282.505971 -78.6589 
L 283.047965 -77.652112 
L 283.589959 -76.660703 
L 284.131953 -75.684778 
L 284.673947 -74.724429 
L 285.215942 -73.779734 
L 285.757936 -72.850757 
L 286.29993 -71.93755 
L 286.841924 -71.040148 
L 287.383919 -70.158579 
L 287.925913 -69.292853 
L 288.467907 -68.442972 
L 289.009901 -67.608923 
L 289.551896 -66.790685 
L 290.09389 -65.988222 
L 290.635884 -65.201491 
L 291.177878 -64.430436 
L 291.719873 -63.674991 
L 292.261867 -62.935082 
L 292.803861 -62.210623 
L 293.345855 -61.501522 
L 293.887849 -60.807677 
L 294.429844 -60.128976 
L 294.971838 -59.465302 
L 295.513832 -58.816528 
L 296.055826 -58.182521 
L 296.597821 -57.563142 
L 297.139815 -56.958242 
L 297.681809 -56.367671 
L 298.223803 -55.791268 
L 298.765798 -55.22887 
L 299.307792 -54.680307 
L 299.849786 -54.145404 
L 300.39178 -53.623985 
L 300.933774 -53.115864 
L 301.475769 -52.620856 
L 302.017763 -52.13877 
L 302.559757 -51.669413 
L 303.101751 -51.212588 
L 303.643746 -50.768096 
L 304.18574 -50.335736 
L 304.727734 -49.915303 
L 305.269728 -49.506593 
L 305.811723 -49.109398 
L 306.353717 -48.72351 
L 306.895711 -48.34872 
L 307.437705 -47.984817 
L 307.979699 -47.631592 
L 308.521694 -47.288832 
L 309.063688 -46.956328 
L 309.605682 -46.633867 
L 310.147676 -46.321239 
L 310.689671 -46.018235 
L 311.231665 -45.724644 
L 311.773659 -45.440258 
L 312.315653 -45.164869 
L 312.857648 -44.898271 
L 313.399642 -44.640259 
L 313.941636 -44.390629 
L 314.48363 -44.14918 
L 315.025625 -43.915712 
L 315.567619 -43.690026 
L 316.109613 -43.471927 
L 316.651607 -43.26122 
L 317.193601 -43.057714 
L 317.735596 -42.861219 
L 318.27759 -42.67155 
L 318.819584 -42.48852 
L 319.361578 -42.31195 
L 319.903573 -42.14166 
L 320.445567 -41.977473 
L 320.987561 -41.819216 
L 321.529555 -41.666719 
L 322.07155 -41.519814 
L 322.613544 -41.378336 
L 323.155538 -41.242124 
L 323.697532 -41.111018 
L 324.239526 -40.984864 
L 324.781521 -40.863509 
L 325.323515 -40.746803 
L 325.865509 -40.6346 
L 326.407503 -40.526756 
L 326.949498 -40.423132 
L 327.491492 -40.323591 
L 328.033486 -40.227998 
L 328.57548 -40.136223 
L 329.117475 -40.048138 
L 329.659469 -39.963618 
L 330.201463 -39.882542 
L 330.743457 -39.804792 
L 331.285452 -39.730251 
L 331.827446 -39.658808 
L 332.36944 -39.590352 
L 332.911434 -39.524777 
L 333.453428 -39.461979 
L 333.995423 -39.401858 
L 334.537417 -39.344315 
L 335.079411 -39.289255 
L 335.621405 -39.236586 
L 336.1634 -39.186217 
L 336.705394 -39.138062 
L 337.247388 -39.092036 
L 337.789382 -39.048057 
L 338.331377 -39.006045 
L 338.873371 -38.965924 
L 339.415365 -38.927619 
L 339.957359 -38.891059 
L 340.499353 -38.856172 
L 341.041348 -38.822892 
L 341.583342 -38.791153 
L 342.125336 -38.760893 
L 342.66733 -38.73205 
L 343.209325 -38.704566 
L 343.751319 -38.678383 
L 344.293313 -38.653447 
L 344.835307 -38.629706 
L 345.377302 -38.607107 
L 345.919296 -38.585602 
L 346.46129 -38.565144 
L 347.003284 -38.545686 
L 347.545278 -38.527185 
L 348.087273 -38.5096 
L 348.087273 -38.200781 
L 348.087273 -38.200781 
L 347.545278 -38.200781 
L 347.003284 -38.200781 
L 346.46129 -38.200781 
L 345.919296 -38.200781 
L 345.377302 -38.200781 
L 344.835307 -38.200781 
L 344.293313 -38.200781 
L 343.751319 -38.200781 
L 343.209325 -38.200781 
L 342.66733 -38.200781 
L 342.125336 -38.200781 
L 341.583342 -38.200781 
L 341.041348 -38.200781 
L 340.499353 -38.200781 
L 339.957359 -38.200781 
L 339.415365 -38.200781 
L 338.873371 -38.200781 
L 338.331377 -38.200781 
L 337.789382 -38.200781 
L 337.247388 -38.200781 
L 336.705394 -38.200781 
L 336.1634 -38.200781 
L 335.621405 -38.200781 
L 335.079411 -38.200781 
L 334.537417 -38.200781 
L 333.995423 -38.200781 
L 333.453428 -38.200781 
L 332.911434 -38.200781 
L 332.36944 -38.200781 
L 331.827446 -38.200781 
L 331.285452 -38.200781 
L 330.743457 -38.200781 
L 330.201463 -38.200781 
L 329.659469 -38.200781 
L 329.117475 -38.200781 
L 328.57548 -38.200781 
L 328.033486 -38.200781 
L 327.491492 -38.200781 
L 326.949498 -38.200781 
L 326.407503 -38.200781 
L 325.865509 -38.200781 
L 325.323515 -38.200781 
L 324.781521 -38.200781 
L 324.239526 -38.200781 
L 323.697532 -38.200781 
L 323.155538 -38.200781 
L 322.613544 -38.200781 
L 322.07155 -38.200781 
L 321.529555 -38.200781 
L 320.987561 -38.200781 
L 320.445567 -38.200781 
L 319.903573 -38.200781 
L 319.361578 -38.200781 
L 318.819584 -38.200781 
L 318.27759 -38.200781 
L 317.735596 -38.200781 
L 317.193601 -38.200781 
L 316.651607 -38.200781 
L 316.109613 -38.200781 
L 315.567619 -38.200781 
L 315.025625 -38.200781 
L 314.48363 -38.200781 
L 313.941636 -38.200781 
L 313.399642 -38.200781 
L 312.857648 -38.200781 
L 312.315653 -38.200781 
L 311.773659 -38.200781 
L 311.231665 -38.200781 
L 310.689671 -38.200781 
L 310.147676 -38.200781 
L 309.605682 -38.200781 
L 309.063688 -38.200781 
L 308.521694 -38.200781 
L 307.979699 -38.200781 
L 307.437705 -38.200781 
L 306.895711 -38.200781 
L 306.353717 -38.200781 
L 305.811723 -38.200781 
L 305.269728 -38.200781 
L 304.727734 -38.200781 
L 304.18574 -38.200781 
L 303.643746 -38.200781 
L 303.101751 -38.200781 
L 302.559757 -38.200781 
L 302.017763 -38.200781 
L 301.475769 -38.200781 
L 300.933774 -38.200781 
L 300.39178 -38.200781 
L 299.849786 -38.200781 
L 299.307792 -38.200781 
L 298.765798 -38.200781 
L 298.223803 -38.200781 
L 297.681809 -38.200781 
L 297.139815 -38.200781 
L 296.597821 -38.200781 
L 296.055826 -38.200781 
L 295.513832 -38.200781 
L 294.971838 -38.200781 
L 294.429844 -38.200781 
L 293.887849 -38.200781 
L 293.345855 -38.200781 
L 292.803861 -38.200781 
L 292.261867 -38.200781 
L 291.719873 -38.200781 
L 291.177878 -38.200781 
L 290.635884 -38.200781 
L 290.09389 -38.200781 
L 289.551896 -38.200781 
L 289.009901 -38.200781 
L 288.467907 -38.200781 
L 287.925913 -38.200781 
L 287.383919 -38.200781 
L 286.841924 -38.200781 
L 286.29993 -38.200781 
L 285.757936 -38.200781 
L 285.215942 -38.200781 
L 284.673947 -38.200781 
L 284.131953 -38.200781 
L 283.589959 -38.200781 
L 283.047965 -38.200781 
L 282.505971 -38.200781 
L 281.963976 -38.200781 
L 281.421982 -38.200781 
L 280.879988 -38.200781 
L 280.337994 -38.200781 
L 279.795999 -38.200781 
L 279.254005 -38.200781 
L 278.712011 -38.200781 
L 278.170017 -38.200781 
L 277.628022 -38.200781 
L 277.086028 -38.200781 
L 276.544034 -38.200781 
L 276.00204 -38.200781 
L 275.460046 -38.200781 
L 274.918051 -38.200781 
L 274.376057 -38.200781 
L 273.834063 -38.200781 
L 273.292069 -38.200781 
L 272.750074 -38.200781 
L 272.20808 -38.200781 
L 271.666086 -38.200781 
L 271.124092 -38.200781 
L 270.582097 -38.200781 
L 270.040103 -38.200781 
L 269.498109 -38.200781 
L 268.956115 -38.200781 
L 268.414121 -38.200781 
L 267.872126 -38.200781 
L 267.330132 -38.200781 
L 266.788138 -38.200781 
L 266.246144 -38.200781 
L 265.704149 -38.200781 
L 265.162155 -38.200781 
L 264.620161 -38.200781 
L 264.078167 -38.200781 
L 263.536172 -38.200781 
L 262.994178 -38.200781 
L 262.452184 -38.200781 
L 261.91019 -38.200781 
L 261.368195 -38.200781 
L 260.826201 -38.200781 
L 260.284207 -38.200781 
L 259.742213 -38.200781 
L 259.200219 -38.200781 
L 258.658224 -38.200781 
L 258.11623 -38.200781 
L 257.574236 -38.200781 
L 257.032242 -38.200781 
L 256.490247 -38.200781 
L 255.948253 -38.200781 
L 255.406259 -38.200781 
L 254.864265 -38.200781 
L 254.32227 -38.200781 
L 253.780276 -38.200781 
L 253.238282 -38.200781 
L 252.696288 -38.200781 
L 252.154294 -38.200781 
L 251.612299 -38.200781 
L 251.070305 -38.200781 
L 250.528311 -38.200781 
L 249.986317 -38.200781 
L 249.444322 -38.200781 
L 248.902328 -38.200781 
L 248.360334 -38.200781 
L 247.81834 -38.200781 
L 247.276345 -38.200781 
L 246.734351 -38.200781 
L 246.192357 -38.200781 
L 245.650363 -38.200781 
L 245.108368 -38.200781 
L 244.566374 -38.200781 
L 244.02438 -38.200781 
L 243.482386 -38.200781 
L 242.940392 -38.200781 
L 242.398397 -38.200781 
L 241.856403 -38.200781 
L 241.314409 -38.200781 
L 240.772415 -38.200781 
L 240.23042 -38.200781 
L 239.688426 -38.200781 
L 239.146432 -38.200781 
L 238.604438 -38.200781 
L 238.062443 -38.200781 
L 237.520449 -38.200781 
L 236.978455 -38.200781 
L 236.436461 -38.200781 
L 235.894467 -38.200781 
L 235.352472 -38.200781 
L 234.810478 -38.200781 
L 234.268484 -38.200781 
L 233.72649 -38.200781 
L 233.184495 -38.200781 
L 232.642501 -38.200781 
L 232.100507 -38.200781 
L 231.558513 -38.200781 
L 231.016518 -38.200781 
L 230.474524 -38.200781 
L 229.93253 -38.200781 
L 229.390536 -38.200781 
L 228.848542 -38.200781 
L 228.306547 -38.200781 
L 227.764553 -38.200781 
L 227.222559 -38.200781 
L 226.680565 -38.200781 
L 226.13857 -38.200781 
L 225.596576 -38.200781 
L 225.054582 -38.200781 
L 224.512588 -38.200781 
L 223.970593 -38.200781 
L 223.428599 -38.200781 
L 222.886605 -38.200781 
L 222.344611 -38.200781 
L 221.802616 -38.200781 
L 221.260622 -38.200781 
L 220.718628 -38.200781 
L 220.176634 -38.200781 
L 219.63464 -38.200781 
L 219.092645 -38.200781 
L 218.550651 -38.200781 
L 218.008657 -38.200781 
L 217.466663 -38.200781 
L 216.924668 -38.200781 
L 216.382674 -38.200781 
L 215.84068 -38.200781 
L 215.298686 -38.200781 
L 214.756691 -38.200781 
L 214.214697 -38.200781 
L 213.672703 -38.200781 
L 213.130709 -38.200781 
L 212.588715 -38.200781 
L 212.04672 -38.200781 
L 211.504726 -38.200781 
L 210.962732 -38.200781 
L 210.420738 -38.200781 
L 209.878743 -38.200781 
L 209.336749 -38.200781 
L 208.794755 -38.200781 
L 208.252761 -38.200781 
L 207.710766 -38.200781 
L 207.168772 -38.200781 
L 206.626778 -38.200781 
L 206.084784 -38.200781 
L 205.542789 -38.200781 
L 205.000795 -38.200781 
L 204.458801 -38.200781 
L 203.916807 -38.200781 
L 203.374813 -38.200781 
L 202.832818 -38.200781 
L 202.290824 -38.200781 
L 201.74883 -38.200781 
L 201.206836 -38.200781 
L 200.664841 -38.200781 
L 200.122847 -38.200781 
L 199.580853 -38.200781 
z
" style="stroke: #22c55e; stroke-opacity: 0.35"/>
</defs>
<g clip-path="url(#sht-ch_power-pbf25170d6c)">
<use xlink:href="#sht-ch_power-mdadc901463" x="0" y="211.720781" style="fill: #22c55e; fill-opacity: 0.35; stroke: #22c55e; stroke-opacity: 0.35"/>
</g>
</g>
<g id="sht-ch_power-FillBetweenPolyCollection_3">
<defs>
<path id="sht-ch_power-m6861d2dfd1" d="M 199.580853 -38.200781 
L 199.580853 -74.125954 
L 200.122847 -73.19118 
L 200.664841 -72.272157 
L 201.206836 -71.368929 
L 201.74883 -70.481525 
L 202.290824 -69.609961 
L 202.832818 -68.754243 
L 203.374813 -67.914363 
L 203.916807 -67.090304 
L 204.458801 -66.282034 
L 205.000795 -65.489513 
L 205.542789 -64.712689 
L 206.084784 -63.951501 
L 206.626778 -63.205877 
L 207.168772 -62.475737 
L 207.710766 -61.760989 
L 208.252761 -61.061536 
L 208.794755 -60.377269 
L 209.336749 -59.708073 
L 209.878743 -59.053824 
L 210.420738 -58.414393 
L 210.962732 -57.789641 
L 211.504726 -57.179425 
L 212.04672 -56.583593 
L 212.588715 -56.001989 
L 213.130709 -55.43445 
L 213.672703 -54.88081 
L 214.214697 -54.340895 
L 214.756691 -53.81453 
L 215.298686 -53.301531 
L 215.84068 -52.801714 
L 216.382674 -52.31489 
L 216.924668 -51.840866 
L 217.466663 -51.379447 
L 218.008657 -50.930434 
L 218.550651 -50.493628 
L 219.092645 -50.068825 
L 219.63464 -49.655819 
L 220.176634 -49.254406 
L 220.718628 -48.864377 
L 221.260622 -48.485522 
L 221.802616 -48.117633 
L 222.344611 -47.760499 
L 222.886605 -47.413908 
L 223.428599 -47.07765 
L 223.970593 -46.751513 
L 224.512588 -46.435287 
L 225.054582 -46.128762 
L 225.596576 -45.831727 
L 226.13857 -45.543974 
L 226.680565 -45.265294 
L 227.222559 -44.995481 
L 227.764553 -44.73433 
L 228.306547 -44.481636 
L 228.848542 -44.237196 
L 229.390536 -44.000811 
L 229.93253 -43.77228 
L 230.474524 -43.551409 
L 231.016518 -43.338001 
L 231.558513 -43.131864 
L 232.100507 -42.932808 
L 232.642501 -42.740646 
L 233.184495 -42.555191 
L 233.72649 -42.376262 
L 234.268484 -42.203679 
L 234.810478 -42.037264 
L 235.352472 -41.876842 
L 235.894467 -41.722243 
L 236.436461 -41.573297 
L 236.978455 -41.429838 
L 237.520449 -41.291705 
L 238.062443 -41.158736 
L 238.604438 -41.030776 
L 239.146432 -40.90767 
L 239.688426 -40.789268 
L 240.23042 -40.675423 
L 240.772415 -40.56599 
L 241.314409 -40.460827 
L 241.856403 -40.359797 
L 242.398397 -40.262765 
L 242.940392 -40.169598 
L 243.482386 -40.080169 
L 244.02438 -39.99435 
L 244.566374 -39.912019 
L 245.108368 -39.833057 
L 245.650363 -39.757347 
L 246.192357 -39.684775 
L 246.734351 -39.615232 
L 247.276345 -39.548607 
L 247.81834 -39.484799 
L 248.360334 -39.423703 
L 248.902328 -39.365221 
L 249.444322 -39.309258 
L 249.986317 -39.255718 
L 250.528311 -39.204512 
L 251.070305 -39.155551 
L 251.612299 -39.10875 
L 252.154294 -39.064026 
L 252.696288 -39.021299 
L 253.238282 -38.98049 
L 253.780276 -38.941525 
L 254.32227 -38.90433 
L 254.864265 -38.868834 
L 255.406259 -38.83497 
L 255.948253 -38.802671 
L 256.490247 -38.771873 
L 257.032242 -38.742515 
L 257.574236 -38.714537 
L 258.11623 -38.687881 
L 258.658224 -38.662493 
L 259.200219 -38.638317 
L 259.742213 -38.615303 
L 260.284207 -38.593401 
L 260.826201 -38.572562 
L 261.368195 -38.552741 
L 261.91019 -38.533893 
L 262.452184 -38.515975 
L 262.994178 -38.498945 
L 263.536172 -38.482765 
L 264.078167 -38.467396 
L 264.620161 -38.452801 
L 265.162155 -38.438945 
L 265.704149 -38.425795 
L 266.246144 -38.413317 
L 266.788138 -38.40148 
L 267.330132 -38.390255 
L 267.872126 -38.379613 
L 268.414121 -38.369526 
L 268.956115 -38.359968 
L 269.498109 -38.350914 
L 270.040103 -38.342339 
L 270.582097 -38.33422 
L 271.124092 -38.326535 
L 271.666086 -38.319263 
L 272.20808 -38.312384 
L 272.750074 -38.305877 
L 273.292069 -38.299725 
L 273.834063 -38.293909 
L 274.376057 -38.288414 
L 274.918051 -38.283222 
L 275.460046 -38.278318 
L 276.00204 -38.273687 
L 276.544034 -38.269316 
L 277.086028 -38.265191 
L 277.628022 -38.261298 
L 278.170017 -38.257627 
L 278.712011 -38.254165 
L 279.254005 -38.250901 
L 279.795999 -38.247825 
L 280.337994 -38.244926 
L 280.879988 -38.242196 
L 281.421982 -38.239625 
L 281.963976 -38.237204 
L 282.505971 -38.234926 
L 283.047965 -38.232782 
L 283.589959 -38.230765 
L 284.131953 -38.228868 
L 284.673947 -38.227085 
L 285.215942 -38.225408 
L 285.757936 -38.223833 
L 286.29993 -38.222353 
L 286.841924 -38.220963 
L 287.383919 -38.219658 
L 287.925913 -38.218432 
L 288.467907 -38.217282 
L 289.009901 -38.216204 
L 289.551896 -38.215192 
L 290.09389 -38.214243 
L 290.635884 -38.213353 
L 291.177878 -38.212519 
L 291.719873 -38.211738 
L 292.261867 -38.211006 
L 292.803861 -38.210321 
L 293.345855 -38.209679 
L 293.887849 -38.209079 
L 294.429844 -38.208517 
L 294.971838 -38.207991 
L 295.513832 -38.207499 
L 296.055826 -38.20704 
L 296.597821 -38.20661 
L 297.139815 -38.206208 
L 297.681809 -38.205833 
L 298.223803 -38.205483 
L 298.765798 -38.205155 
L 299.307792 -38.20485 
L 299.849786 -38.204565 
L 300.39178 -38.204299 
L 300.933774 -38.204051 
L 301.475769 -38.203819 
L 302.017763 -38.203604 
L 302.559757 -38.203403 
L 303.101751 -38.203215 
L 303.643746 -38.203041 
L 304.18574 -38.202878 
L 304.727734 -38.202727 
L 305.269728 -38.202586 
L 305.811723 -38.202455 
L 306.353717 -38.202333 
L 306.895711 -38.202219 
L 307.437705 -38.202114 
L 307.979699 -38.202016 
L 308.521694 -38.201925 
L 309.063688 -38.20184 
L 309.605682 -38.201761 
L 310.147676 -38.201688 
L 310.689671 -38.201621 
L 311.231665 -38.201558 
L 311.773659 -38.201499 
L 312.315653 -38.201445 
L 312.857648 -38.201395 
L 313.399642 -38.201348 
L 313.941636 -38.201305 
L 314.48363 -38.201265 
L 315.025625 -38.201228 
L 315.567619 -38.201194 
L 316.109613 -38.201162 
L 316.651607 -38.201133 
L 317.193601 -38.201105 
L 317.735596 -38.20108 
L 318.27759 -38.201057 
L 318.819584 -38.201035 
L 319.361578 -38.201015 
L 319.903573 -38.200997 
L 320.445567 -38.20098 
L 320.987561 -38.200964 
L 321.529555 -38.20095 
L 322.07155 -38.200936 
L 322.613544 -38.200924 
L 323.155538 -38.200912 
L 323.697532 -38.200902 
L 324.239526 -38.200892 
L 324.781521 -38.200883 
L 325.323515 -38.200875 
L 325.865509 -38.200867 
L 326.407503 -38.20086 
L 326.949498 -38.200854 
L 327.491492 -38.200848 
L 328.033486 -38.200842 
L 328.57548 -38.200837 
L 329.117475 -38.200833 
L 329.659469 -38.200829 
L 330.201463 -38.200825 
L 330.743457 -38.200821 
L 331.285452 -38.200818 
L 331.827446 -38.200815 
L 332.36944 -38.200812 
L 332.911434 -38.200809 
L 333.453428 -38.200807 
L 333.995423 -38.200805 
L 334.537417 -38.200803 
L 335.079411 -38.200801 
L 335.621405 -38.200799 
L 336.1634 -38.200798 
L 336.705394 -38.200796 
L 337.247388 -38.200795 
L 337.789382 -38.200794 
L 338.331377 -38.200793 
L 338.873371 -38.200792 
L 339.415365 -38.200791 
L 339.957359 -38.20079 
L 340.499353 -38.200789 
L 341.041348 -38.200789 
L 341.583342 -38.200788 
L 342.125336 -38.200787 
L 342.66733 -38.200787 
L 343.209325 -38.200786 
L 343.751319 -38.200786 
L 344.293313 -38.200785 
L 344.835307 -38.200785 
L 345.377302 -38.200785 
L 345.919296 -38.200784 
L 346.46129 -38.200784 
L 347.003284 -38.200784 
L 347.545278 -38.200784 
L 348.087273 -38.200783 
L 348.087273 -38.200781 
L 348.087273 -38.200781 
L 347.545278 -38.200781 
L 347.003284 -38.200781 
L 346.46129 -38.200781 
L 345.919296 -38.200781 
L 345.377302 -38.200781 
L 344.835307 -38.200781 
L 344.293313 -38.200781 
L 343.751319 -38.200781 
L 343.209325 -38.200781 
L 342.66733 -38.200781 
L 342.125336 -38.200781 
L 341.583342 -38.200781 
L 341.041348 -38.200781 
L 340.499353 -38.200781 
L 339.957359 -38.200781 
L 339.415365 -38.200781 
L 338.873371 -38.200781 
L 338.331377 -38.200781 
L 337.789382 -38.200781 
L 337.247388 -38.200781 
L 336.705394 -38.200781 
L 336.1634 -38.200781 
L 335.621405 -38.200781 
L 335.079411 -38.200781 
L 334.537417 -38.200781 
L 333.995423 -38.200781 
L 333.453428 -38.200781 
L 332.911434 -38.200781 
L 332.36944 -38.200781 
L 331.827446 -38.200781 
L 331.285452 -38.200781 
L 330.743457 -38.200781 
L 330.201463 -38.200781 
L 329.659469 -38.200781 
L 329.117475 -38.200781 
L 328.57548 -38.200781 
L 328.033486 -38.200781 
L 327.491492 -38.200781 
L 326.949498 -38.200781 
L 326.407503 -38.200781 
L 325.865509 -38.200781 
L 325.323515 -38.200781 
L 324.781521 -38.200781 
L 324.239526 -38.200781 
L 323.697532 -38.200781 
L 323.155538 -38.200781 
L 322.613544 -38.200781 
L 322.07155 -38.200781 
L 321.529555 -38.200781 
L 320.987561 -38.200781 
L 320.445567 -38.200781 
L 319.903573 -38.200781 
L 319.361578 -38.200781 
L 318.819584 -38.200781 
L 318.27759 -38.200781 
L 317.735596 -38.200781 
L 317.193601 -38.200781 
L 316.651607 -38.200781 
L 316.109613 -38.200781 
L 315.567619 -38.200781 
L 315.025625 -38.200781 
L 314.48363 -38.200781 
L 313.941636 -38.200781 
L 313.399642 -38.200781 
L 312.857648 -38.200781 
L 312.315653 -38.200781 
L 311.773659 -38.200781 
L 311.231665 -38.200781 
L 310.689671 -38.200781 
L 310.147676 -38.200781 
L 309.605682 -38.200781 
L 309.063688 -38.200781 
L 308.521694 -38.200781 
L 307.979699 -38.200781 
L 307.437705 -38.200781 
L 306.895711 -38.200781 
L 306.353717 -38.200781 
L 305.811723 -38.200781 
L 305.269728 -38.200781 
L 304.727734 -38.200781 
L 304.18574 -38.200781 
L 303.643746 -38.200781 
L 303.101751 -38.200781 
L 302.559757 -38.200781 
L 302.017763 -38.200781 
L 301.475769 -38.200781 
L 300.933774 -38.200781 
L 300.39178 -38.200781 
L 299.849786 -38.200781 
L 299.307792 -38.200781 
L 298.765798 -38.200781 
L 298.223803 -38.200781 
L 297.681809 -38.200781 
L 297.139815 -38.200781 
L 296.597821 -38.200781 
L 296.055826 -38.200781 
L 295.513832 -38.200781 
L 294.971838 -38.200781 
L 294.429844 -38.200781 
L 293.887849 -38.200781 
L 293.345855 -38.200781 
L 292.803861 -38.200781 
L 292.261867 -38.200781 
L 291.719873 -38.200781 
L 291.177878 -38.200781 
L 290.635884 -38.200781 
L 290.09389 -38.200781 
L 289.551896 -38.200781 
L 289.009901 -38.200781 
L 288.467907 -38.200781 
L 287.925913 -38.200781 
L 287.383919 -38.200781 
L 286.841924 -38.200781 
L 286.29993 -38.200781 
L 285.757936 -38.200781 
L 285.215942 -38.200781 
L 284.673947 -38.200781 
L 284.131953 -38.200781 
L 283.589959 -38.200781 
L 283.047965 -38.200781 
L 282.505971 -38.200781 
L 281.963976 -38.200781 
L 281.421982 -38.200781 
L 280.879988 -38.200781 
L 280.337994 -38.200781 
L 279.795999 -38.200781 
L 279.254005 -38.200781 
L 278.712011 -38.200781 
L 278.170017 -38.200781 
L 277.628022 -38.200781 
L 277.086028 -38.200781 
L 276.544034 -38.200781 
L 276.00204 -38.200781 
L 275.460046 -38.200781 
L 274.918051 -38.200781 
L 274.376057 -38.200781 
L 273.834063 -38.200781 
L 273.292069 -38.200781 
L 272.750074 -38.200781 
L 272.20808 -38.200781 
L 271.666086 -38.200781 
L 271.124092 -38.200781 
L 270.582097 -38.200781 
L 270.040103 -38.200781 
L 269.498109 -38.200781 
L 268.956115 -38.200781 
L 268.414121 -38.200781 
L 267.872126 -38.200781 
L 267.330132 -38.200781 
L 266.788138 -38.200781 
L 266.246144 -38.200781 
L 265.704149 -38.200781 
L 265.162155 -38.200781 
L 264.620161 -38.200781 
L 264.078167 -38.200781 
L 263.536172 -38.200781 
L 262.994178 -38.200781 
L 262.452184 -38.200781 
L 261.91019 -38.200781 
L 261.368195 -38.200781 
L 260.826201 -38.200781 
L 260.284207 -38.200781 
L 259.742213 -38.200781 
L 259.200219 -38.200781 
L 258.658224 -38.200781 
L 258.11623 -38.200781 
L 257.574236 -38.200781 
L 257.032242 -38.200781 
L 256.490247 -38.200781 
L 255.948253 -38.200781 
L 255.406259 -38.200781 
L 254.864265 -38.200781 
L 254.32227 -38.200781 
L 253.780276 -38.200781 
L 253.238282 -38.200781 
L 252.696288 -38.200781 
L 252.154294 -38.200781 
L 251.612299 -38.200781 
L 251.070305 -38.200781 
L 250.528311 -38.200781 
L 249.986317 -38.200781 
L 249.444322 -38.200781 
L 248.902328 -38.200781 
L 248.360334 -38.200781 
L 247.81834 -38.200781 
L 247.276345 -38.200781 
L 246.734351 -38.200781 
L 246.192357 -38.200781 
L 245.650363 -38.200781 
L 245.108368 -38.200781 
L 244.566374 -38.200781 
L 244.02438 -38.200781 
L 243.482386 -38.200781 
L 242.940392 -38.200781 
L 242.398397 -38.200781 
L 241.856403 -38.200781 
L 241.314409 -38.200781 
L 240.772415 -38.200781 
L 240.23042 -38.200781 
L 239.688426 -38.200781 
L 239.146432 -38.200781 
L 238.604438 -38.200781 
L 238.062443 -38.200781 
L 237.520449 -38.200781 
L 236.978455 -38.200781 
L 236.436461 -38.200781 
L 235.894467 -38.200781 
L 235.352472 -38.200781 
L 234.810478 -38.200781 
L 234.268484 -38.200781 
L 233.72649 -38.200781 
L 233.184495 -38.200781 
L 232.642501 -38.200781 
L 232.100507 -38.200781 
L 231.558513 -38.200781 
L 231.016518 -38.200781 
L 230.474524 -38.200781 
L 229.93253 -38.200781 
L 229.390536 -38.200781 
L 228.848542 -38.200781 
L 228.306547 -38.200781 
L 227.764553 -38.200781 
L 227.222559 -38.200781 
L 226.680565 -38.200781 
L 226.13857 -38.200781 
L 225.596576 -38.200781 
L 225.054582 -38.200781 
L 224.512588 -38.200781 
L 223.970593 -38.200781 
L 223.428599 -38.200781 
L 222.886605 -38.200781 
L 222.344611 -38.200781 
L 221.802616 -38.200781 
L 221.260622 -38.200781 
L 220.718628 -38.200781 
L 220.176634 -38.200781 
L 219.63464 -38.200781 
L 219.092645 -38.200781 
L 218.550651 -38.200781 
L 218.008657 -38.200781 
L 217.466663 -38.200781 
L 216.924668 -38.200781 
L 216.382674 -38.200781 
L 215.84068 -38.200781 
L 215.298686 -38.200781 
L 214.756691 -38.200781 
L 214.214697 -38.200781 
L 213.672703 -38.200781 
L 213.130709 -38.200781 
L 212.588715 -38.200781 
L 212.04672 -38.200781 
L 211.504726 -38.200781 
L 210.962732 -38.200781 
L 210.420738 -38.200781 
L 209.878743 -38.200781 
L 209.336749 -38.200781 
L 208.794755 -38.200781 
L 208.252761 -38.200781 
L 207.710766 -38.200781 
L 207.168772 -38.200781 
L 206.626778 -38.200781 
L 206.084784 -38.200781 
L 205.542789 -38.200781 
L 205.000795 -38.200781 
L 204.458801 -38.200781 
L 203.916807 -38.200781 
L 203.374813 -38.200781 
L 202.832818 -38.200781 
L 202.290824 -38.200781 
L 201.74883 -38.200781 
L 201.206836 -38.200781 
L 200.664841 -38.200781 
L 200.122847 -38.200781 
L 199.580853 -38.200781 
z
" style="stroke: #ef4444; stroke-opacity: 0.9"/>
</defs>
<g clip-path="url(#sht-ch_power-pbf25170d6c)">
<use xlink:href="#sht-ch_power-m6861d2dfd1" x="0" y="211.720781" style="fill: #ef4444; fill-opacity: 0.9; stroke: #ef4444; stroke-opacity: 0.9"/>
</g>
</g>
<g id="sht-ch_power-matplotlib.axis_1">
<g id="sht-ch_power-xtick_1">
<g id="sht-ch_power-line2d_1">
<defs>
<path id="sht-ch_power-m7c25c535dc" d="M 0 0 
L 0 3.5 
" style="stroke: currentColor; stroke-width: 0.8"/>
</defs>
<g>
<use xlink:href="#sht-ch_power-m7c25c535dc" x="74.693971" y="173.52" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_power-text_1">
<text style="font-size: 10px; text-anchor: middle" x="74.693971" y="188.117656" transform="rotate(-0 74.693971 188.117656)">−2</text>
</g>
</g>
<g id="sht-ch_power-xtick_2">
<g id="sht-ch_power-line2d_2">
<g>
<use xlink:href="#sht-ch_power-m7c25c535dc" x="143.042297" y="173.52" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_power-text_2">
<text style="font-size: 10px; text-anchor: middle" x="143.042297" y="188.117656" transform="rotate(-0 143.042297 188.117656)">0</text>
</g>
</g>
<g id="sht-ch_power-xtick_3">
<g id="sht-ch_power-line2d_3">
<g>
<use xlink:href="#sht-ch_power-m7c25c535dc" x="211.390622" y="173.52" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_power-text_3">
<text style="font-size: 10px; text-anchor: middle" x="211.390622" y="188.117656" transform="rotate(-0 211.390622 188.117656)">2</text>
</g>
</g>
<g id="sht-ch_power-xtick_4">
<g id="sht-ch_power-line2d_4">
<g>
<use xlink:href="#sht-ch_power-m7c25c535dc" x="279.738947" y="173.52" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_power-text_4">
<text style="font-size: 10px; text-anchor: middle" x="279.738947" y="188.117656" transform="rotate(-0 279.738947 188.117656)">4</text>
</g>
</g>
<g id="sht-ch_power-xtick_5">
<g id="sht-ch_power-line2d_5">
<g>
<use xlink:href="#sht-ch_power-m7c25c535dc" x="348.087273" y="173.52" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sht-ch_power-text_5">
<text style="font-size: 10px; text-anchor: middle" x="348.087273" y="188.117656" transform="rotate(-0 348.087273 188.117656)">6</text>
</g>
</g>
<g id="sht-ch_power-text_6">
<text style="font-size: 10px; text-anchor: middle" x="185.76" y="202.118437" transform="rotate(-0 185.76 202.118437)">test statistic (in standard errors)</text>
</g>
</g>
<g id="sht-ch_power-matplotlib.axis_2"/>
<g id="sht-ch_power-line2d_6">
<path d="M 23.432727 173.211182 
L 31.020647 172.864609 
L 36.982583 172.376466 
L 41.860531 171.757163 
L 46.196485 170.973978 
L 49.990445 170.054062 
L 53.24241 169.049232 
L 56.494375 167.805069 
L 59.204347 166.555912 
L 61.914318 165.086914 
L 64.624289 163.372062 
L 67.33426 161.385045 
L 70.044231 159.099925 
L 72.754202 156.491912 
L 75.464174 153.53826 
L 78.174145 150.219259 
L 80.884116 146.51929 
L 83.594087 142.427928 
L 86.304058 137.941047 
L 89.014029 133.061881 
L 92.265995 126.705991 
L 95.51796 119.839894 
L 99.31192 111.263201 
L 103.647874 100.875613 
L 111.777787 80.620801 
L 117.19773 67.457051 
L 120.449695 60.057785 
L 123.159666 54.326249 
L 125.869637 49.090104 
L 128.037614 45.317812 
L 130.205591 41.961683 
L 132.373568 39.059922 
L 133.999551 37.202178 
L 135.625533 35.631273 
L 137.251516 34.357655 
L 138.877499 33.389859 
L 140.503482 32.734401 
L 142.129464 32.395716 
L 143.755447 32.376097 
L 145.38143 32.675679 
L 147.007412 33.292431 
L 148.633395 34.22218 
L 150.259378 35.45866 
L 151.88536 36.993582 
L 153.511343 38.816725 
L 155.137326 40.916049 
L 157.305303 44.120818 
L 159.47328 47.755296 
L 161.641257 51.778629 
L 164.351228 57.286964 
L 167.603193 64.47786 
L 171.397153 73.458678 
L 177.359089 88.250625 
L 184.405014 105.654797 
L 188.740968 115.782471 
L 192.534928 124.053885 
L 195.786893 130.616768 
L 199.038859 136.644357 
L 201.74883 141.239257 
L 204.458801 145.438748 
L 207.168772 149.245044 
L 209.878743 152.666957 
L 212.588715 155.718793 
L 215.298686 158.41925 
L 218.008657 160.790347 
L 220.718628 162.856405 
L 223.428599 164.643132 
L 226.13857 166.176807 
L 228.848542 167.483585 
L 232.100507 168.787973 
L 235.352472 169.843939 
L 239.146432 170.813111 
L 242.940392 171.551183 
L 247.276345 172.172174 
L 252.696288 172.699482 
L 259.200219 173.082464 
L 267.872126 173.341168 
L 280.879988 173.478585 
L 312.857648 173.519386 
L 348.087273 173.519998 
L 348.087273 173.519998 
" clip-path="url(#sht-ch_power-pbf25170d6c)" style="fill: none; stroke: #9ca3af; stroke-width: 1.5; stroke-linecap: square"/>
</g>
<g id="sht-ch_power-line2d_7">
<path d="M 23.432727 173.519998 
L 98.769926 173.414904 
L 110.151805 173.16804 
L 117.19773 172.816451 
L 123.159666 172.297078 
L 128.037614 171.640613 
L 132.373568 170.813111 
L 136.167528 169.843939 
L 139.419493 168.787973 
L 142.671458 167.483585 
L 145.38143 166.176807 
L 148.091401 164.643132 
L 150.801372 162.856405 
L 153.511343 160.790347 
L 156.221314 158.41925 
L 158.931285 155.718793 
L 161.641257 152.666957 
L 164.351228 149.245044 
L 167.061199 145.438748 
L 169.77117 141.239257 
L 172.481141 136.644357 
L 175.191112 131.659472 
L 178.443078 125.183196 
L 181.695043 118.208102 
L 185.489003 109.525068 
L 190.366951 97.71448 
L 203.374813 65.727265 
L 206.626778 58.445223 
L 209.336749 52.840099 
L 212.04672 47.755296 
L 214.214697 44.120818 
L 216.382674 40.916049 
L 218.550651 38.177693 
L 220.176634 36.449374 
L 221.802616 35.01289 
L 223.428599 33.877831 
L 225.054582 33.05182 
L 226.680565 32.540433 
L 228.306547 32.347132 
L 229.93253 32.473228 
L 231.558513 32.917865 
L 233.184495 33.678033 
L 234.810478 34.748595 
L 236.436461 36.122354 
L 238.062443 37.790125 
L 239.688426 39.740843 
L 241.856403 42.759537 
L 244.02438 46.223454 
L 246.192357 50.093343 
L 248.902328 55.435874 
L 251.612299 61.255332 
L 254.864265 68.734763 
L 259.200219 79.274913 
L 271.666086 109.994802 
L 275.460046 118.649706 
L 278.712011 125.595765 
L 281.963976 132.039835 
L 285.215942 137.941047 
L 287.925913 142.427928 
L 290.635884 146.51929 
L 293.345855 150.219259 
L 296.055826 153.53826 
L 298.765798 156.491912 
L 301.475769 159.099925 
L 304.18574 161.385045 
L 306.895711 163.372062 
L 309.605682 165.086914 
L 312.315653 166.555912 
L 315.025625 167.805069 
L 318.27759 169.049232 
L 321.529555 170.054062 
L 325.323515 170.973978 
L 329.117475 171.672644 
L 333.453428 172.258802 
L 338.873371 172.754857 
L 345.377302 173.113674 
L 348.087273 173.211182 
L 348.087273 173.211182 
" clip-path="url(#sht-ch_power-pbf25170d6c)" style="fill: none; stroke: #3b82f6; stroke-width: 1.5; stroke-linecap: square"/>
</g>
<g id="sht-ch_power-line2d_8">
<path d="M 199.258794 173.52 
L 199.258794 7.2 
" clip-path="url(#sht-ch_power-pbf25170d6c)" style="fill: none; stroke-dasharray: 3.7,1.6; stroke-dashoffset: 0; stroke: currentColor"/>
</g>
<g id="sht-ch_power-patch_3">
<path d="M 7.2 173.52 
L 364.32 173.52 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sht-ch_power-text_7">
<text style="font-size: 8.5px; text-anchor: middle" x="122.537799" y="24.893617" transform="rotate(-0 122.537799 24.893617)">if H₀ true</text>
</g>
<g id="sht-ch_power-text_8">
<text style="font-size: 8.5px; text-anchor: middle" x="266.069282" y="24.893617" transform="rotate(-0 266.069282 24.893617)">if real effect = 2.5 SE</text>
</g>
<g id="sht-ch_power-text_9">
<text style="font-size: 8.5px; text-anchor: start" x="201.992727" y="67.358298" transform="rotate(-0 201.992727 67.358298)">reject →</text>
</g>
<g id="sht-ch_power-patch_4">
<path d="M 287.110183 108.008109 
Q 250.041844 136.614558 213.681596 164.674559 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linecap: round"/>
<path d="M 217.411887 163.943171 
L 213.681596 164.674559 
L 215.33466 161.251493 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linecap: round"/>
</g>
<g id="sht-ch_power-text_10">
<text style="font-size: 8.5px; text-anchor: start" x="276.321531" y="102.745532" transform="rotate(-0 276.321531 102.745532)">α = 0.05</text>
</g>
<g id="sht-ch_power-text_11">
<text style="font-size: 8.5px; text-anchor: middle" x="175.507751" y="164.673191" transform="rotate(-0 175.507751 164.673191)">β = 0.20</text>
</g>
<g id="sht-ch_power-text_12">
<text style="font-size: 8.5px; " transform="translate(236.189037 120.853659)">power</text>
<text style="font-size: 8.5px; " transform="translate(233.630404 131.055319)">= 0.80</text>
</g>
</g>
</g>
<defs>
<clipPath id="sht-ch_power-pbf25170d6c">
<rect x="7.2" y="7.2" width="357.12" height="166.32"/>
</clipPath>
</defs>
</svg><figcaption>A one-sided test at α = 0.05 when the real effect is 2.5 standard errors. Right of the dashed cut-off we reject. Red = false alarms if H₀ is true; light blue = misses (β = 0.20); green = power (0.80).</figcaption></figure>
  <p>Here is the calculation behind that picture, done by hand. Take a one-sided z-test, which rejects when the statistic is above 1.645 (the point with 5% of the normal curve above it). Suppose the real effect is 2.5 standard errors. Then the statistic we observe is 2.5 plus normal noise. We reject when 2.5 + noise &gt; 1.645, that is when noise &gt; −0.855, and the probability of that is 0.80. So power is 80% and β is 20%. The code checks this, then answers the planning question most people actually ask, "how many per group?", and finally confirms both α and power by simulating thousands of experiments:</p>
  <div class="fx" data-lang="py">from statsmodels.stats.power import TTestIndPower
crit = stats.norm.ppf(0.95)                     # one-sided cut-off
print(f"critical z = {crit:.3f}   power = P(Z &gt; {crit:.3f} - 2.5) = {stats.norm.sf(crit - 2.5):.3f}")
pa = TTestIndPower()
print("n per group for d = 0.5, power 0.8:", round(pa.solve_power(effect_size=0.5, alpha=0.05, power=0.8), 1))
print("power with n = 20 per group      :", round(pa.power(effect_size=0.5, nobs1=20, alpha=0.05), 3))
rng = np.random.default_rng(7)
def reject_rate(diff, n, sims=4000):            # run many experiments, count rejections
    hits = 0
    for _ in range(sims):
        a = rng.normal(0, 1, n); b = rng.normal(diff, 1, n)
        hits += stats.ttest_ind(a, b, equal_var=False).pvalue &lt; 0.05
    return hits / sims
print(f"simulated: no effect, n=20: {reject_rate(0.0, 20):.3f}   d=0.5, n=20: {reject_rate(0.5, 20):.3f}"
      f"   d=0.5, n=64: {reject_rate(0.5, 64):.3f}")</div>
  <div class="fx" data-lang="text">critical z = 1.645   power = P(Z &gt; 1.645 - 2.5) = 0.804
n per group for d = 0.5, power 0.8: 63.8
power with n = 20 per group      : 0.338
simulated: no effect, n=20: 0.051   d=0.5, n=20: 0.342   d=0.5, n=64: 0.799</div>
  <p>The first line confirms 0.804. The planning lines use <strong>Cohen's d</strong>, the effect size measured as the difference in means divided by the standard deviation (0.2 is small, 0.5 medium, 0.8 large). If shopper-to-shopper times have a standard deviation of 6 seconds, a 3-second improvement is d = 0.5. <code>solve_power</code> says that needs about 64 shoppers per page for 80% power, and with only 20 per page the power is 0.34, so two out of three real effects of that size would be missed. The simulation agrees: with no effect, 5.1% of tests reject (that is α); with d = 0.5 the reject rate is 0.34 at n = 20 and 0.80 at n = 64.</p>
  <p>Now apply this to the conversion pilot. A realistic lift for a checkout change is +1 percentage point (10% to 11%), not +3. With 1,000 shoppers per page, how likely was the pilot to detect that?</p>
  <div class="fx" data-lang="py">se1 = np.sqrt(0.10 * 0.90 / 1000 + 0.11 * 0.89 / 1000)   # SE of a 1 pp difference, 1,000 per page
shift = 0.01 / se1                                       # the true effect, in SE units
print(f"SE = {se1:.4f}  effect = {shift:.2f} SE  power = {stats.norm.sf(1.96 - shift) + stats.norm.cdf(-1.96 - shift):.3f}")
n_need = (1.96 + 0.8416)**2 * (0.10 * 0.90 + 0.11 * 0.89) / 0.01**2
print(f"shoppers per page for 80% power: {np.ceil(n_need):,.0f}")</div>
  <div class="fx" data-lang="text">SE = 0.0137  effect = 0.73 SE  power = 0.113
shoppers per page for 80% power: 14,749</div>
  <p>The standard error of the difference is 0.0137, so a 1-point lift is only 0.73 standard errors. Two-sided power is about 11%: the pilot would miss a real +1 point lift nine times out of ten. To reach the standard 80% power you need about 14,749 shoppers per page, from the formula n = (z<sub>α/2</sub> + z<sub>β</sub>)² × (p₁(1 − p₁) + p₂(1 − p₂)) ÷ (p₂ − p₁)², where z<sub>α/2</sub> = 1.96 and z<sub>β</sub> = 0.84 are the normal cut-offs for α = 0.05 and 80% power. Read it as: required n grows with the noise (the variance terms) and shrinks with the square of the effect, so halving the effect you want to detect needs four times the users.</p>
  <p>So there are four levers on power. More data narrows both curves and is the main lever. A bigger true effect moves the curves apart. A larger α moves the cut-off left, buying power at the price of more false alarms. And less noise narrows the curves, which is exactly what pairing did in section 06 (and what variance-reduction tricks like CUPED do in A/B tests). One warning: computing power <em>after</em> a non-significant result ("observed power") adds nothing, because it is just the p-value in disguise. Do the calculation before you start.</p>

  <h2 id="sht-chi"><span class="num">09</span>Chi-square Test</h2>
  <p>Some questions involve no averages at all, only counts in categories. Among 1,000 new-page shoppers, does buying depend on the device they use? Each shopper falls into one cell of a table, mobile or desktop by bought or not, and we want to know whether the two variables are related. The <strong>chi-square test of independence</strong> (χ², "kai-square") answers this.</p>
  <p>The idea is to work out the counts you would <strong>expect</strong> if device and buying had nothing to do with each other, and then measure how far the <strong>observed</strong> counts are from those. Think of a school where 13% of all students get a distinction. If one section of 600 students were completely ordinary, you would expect about 13% of 600 = 78 distinctions there. If it has only 60, something about that section is different, or it is luck; chi-square measures how surprising the gap is.</p>
  <table class="tbl">
    <tr><th>New page</th><th>Bought</th><th>Did not buy</th><th>Row total</th></tr>
    <tr><td>Mobile</td><td>60 (expected 78)</td><td>540 (522)</td><td>600</td></tr>
    <tr><td>Desktop</td><td>70 (expected 52)</td><td>330 (348)</td><td>400</td></tr>
    <tr><td>Column total</td><td>130</td><td>870</td><td>1000</td></tr>
  </table>
  <p>Each expected count is row total × column total ÷ grand total. For mobile-bought that is 600 × 130 ÷ 1000 = 78: overall 13% bought, so 13% of the 600 mobile shoppers. Then each cell contributes (O − E)² ÷ E, where O is observed and E expected: squaring makes every gap positive, and dividing by E judges each gap relative to how big that cell should be.</p>
  <div class="fx" data-lang="text">χ² = Σ (O − E)² ÷ E
   = (60 − 78)²/78 + (540 − 522)²/522 + (70 − 52)²/52 + (330 − 348)²/348
   = 4.154 + 0.621 + 6.231 + 0.931 = 11.94

degrees of freedom = (rows − 1) × (columns − 1) = 1</div>
  <p>Under H₀ (independence) this statistic follows the χ² curve with 1 degree of freedom, and 11.94 is far out in its tail.</p>
  <div class="fx" data-lang="py">table = np.array([[60, 540],    # new page, mobile : bought, did not buy
                  [70, 330]])   # new page, desktop: bought, did not buy
row, col, total = table.sum(1, keepdims=True), table.sum(0, keepdims=True), table.sum()
E = row * col / total                        # expected counts if device does not matter
print("expected:", E.tolist())
print("by hand chi2 =", round(((table - E)**2 / E).sum(), 3))
res = stats.chi2_contingency(table, correction=False)
print("scipy, no correction:", round(res.statistic, 3), " p =", round(res.pvalue, 5), " dof =", res.dof)
res = stats.chi2_contingency(table)          # default: Yates correction on a 2x2 table
print("scipy, default      :", round(res.statistic, 3), " p =", round(res.pvalue, 5))</div>
  <div class="fx" data-lang="text">expected: [[78.0, 522.0], [52.0, 348.0]]
by hand chi2 = 11.936
scipy, no correction: 11.936  p = 0.00055  dof = 1
scipy, default      : 11.282  p = 0.00078</div>
  <p><code>row * col / total</code> builds the whole expected table in one line using NumPy broadcasting (a 2×1 column times a 1×2 row). With <code>correction=False</code>, SciPy matches the hand value 11.936 and gives p = 0.00055. SciPy's <em>default</em> applies the <strong>Yates continuity correction</strong> to 2×2 tables, which shrinks each gap by 0.5 and gives 11.28; both lead to the same conclusion. On the new page, desktop shoppers buy more often (70 of 400 = 17.5%) than mobile shoppers (60 of 600 = 10%), so the mobile layout probably needs work.</p>
  <p>The chi-square test is closely related to the z-test. Put the conversion pilot into a 2×2 table (page × bought) and chi-square gives exactly the square of the z statistic, with the same p-value:</p>
  <div class="fx" data-lang="py">tab = np.array([[130, 870], [100, 900]])     # conversion pilot as a table: page x bought
c2 = stats.chi2_contingency(tab, correction=False)
z = 0.03 / np.sqrt(0.115 * 0.885 * 2 / 1000)  # the z from the two-proportion test
print(f"chi2 = {c2.statistic:.3f}   z^2 = {z**2:.3f}   p = {c2.pvalue:.4f}")</div>
  <div class="fx" data-lang="text">chi2 = 4.422   z^2 = 4.422   p = 0.0355</div>
  <p>χ² = 4.422 = z², p = 0.0355: the same test in two forms. Chi-square's advantage is that it extends to bigger tables, such as three pages by four devices. It needs raw counts, never percentages, and expected counts of at least about 5 in every cell; for smaller tables use Fisher's exact test (<code>stats.fisher_exact</code>). In A/B testing a chi-square goodness-of-fit test is also how you detect a <strong>sample ratio mismatch</strong>, when the split of users between arms differs from the planned 50/50 more than luck allows.</p>

  <h2 id="sht-anova"><span class="num">10</span>ANOVA</h2>
  <p>The team now tries three colours for the "Pay" button and measures items per basket. With three groups, why not just run a t-test on every pair? Because each test carries its own 5% false-alarm risk, and three tests together give a much higher chance of at least one false alarm (section 12 makes this precise). We need one test for "are all the group means equal?". That is <strong>analysis of variance</strong>, or <strong>ANOVA</strong>.</p>
  <p>Despite its name, ANOVA is a test about means. It compares two kinds of spread. The <strong>between-group</strong> spread measures how far the group means are from the overall mean. The <strong>within-group</strong> spread measures how much individuals vary inside their own group, which is pure noise. If the button colour did nothing, the group means would differ only by noise, and the two spreads would be similar. If the between-group spread is much larger than the within-group spread, the groups genuinely differ. It is like hearing a conversation in a noisy café: you can only tell people are arguing if their voices rise well above the background chatter.</p>
  <p>By hand, with tiny groups: green [4, 5, 6], blue [6, 7, 8], orange [9, 10, 11]. The group means are 5, 7 and 10, and the overall mean is 7.333.</p>
  <div class="fx" data-lang="text">between (SSB) = 3 × (5 − 7.333)² + 3 × (7 − 7.333)² + 3 × (10 − 7.333)² = 16.33 + 0.33 + 21.33 = 38
within  (SSW) = each group: 1 + 0 + 1 = 2, three groups → 6

F = (SSB ÷ (k − 1)) ÷ (SSW ÷ (N − k)) = (38 ÷ 2) ÷ (6 ÷ 6) = 19 ÷ 1 = 19</div>
  <p>SS stands for "sum of squares". Each sum is divided by its degrees of freedom (k − 1 = 2 for three groups, N − k = 6 for nine values in three groups) to turn it into an average spread, and the ratio of the two is the <strong>F statistic</strong>. Under H₀ (all means equal) it follows the F distribution with (2, 6) degrees of freedom, and 19 is far out in its tail.</p>
  <div class="fx" data-lang="py">groups = {"green": [4, 5, 6], "blue": [6, 7, 8], "orange": [9, 10, 11]}   # items per basket
allv = np.concatenate(list(groups.values()))
grand = allv.mean()
ssb = sum(len(g) * (np.mean(g) - grand)**2 for g in groups.values())      # between groups
ssw = sum(((np.array(g) - np.mean(g))**2).sum() for g in groups.values())  # within groups
k, N = len(groups), len(allv)
F = (ssb / (k - 1)) / (ssw / (N - k))
print(f"grand mean = {grand:.3f}  SSB = {ssb:.1f}  SSW = {ssw:.1f}  F = {F:.1f}")
r = stats.f_oneway(*groups.values())
print(f"f_oneway: F = {r.statistic:.1f}  p = {r.pvalue:.4f}")</div>
  <div class="fx" data-lang="text">grand mean = 7.333  SSB = 38.0  SSW = 6.0  F = 19.0
f_oneway: F = 19.0  p = 0.0025</div>
  <p><code>f_oneway</code> confirms F = 19 with p = 0.0025. But ANOVA only says "at least one mean differs"; it does not say which. For that you run a follow-up that compares every pair while keeping the overall false-alarm rate at α, most commonly <strong>Tukey's HSD</strong> ("honestly significant difference"). Here it is on a larger simulated version with 30 shoppers per colour:</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(5)
green, blue, orange = rng.normal(50, 8, 30), rng.normal(56, 8, 30), rng.normal(49, 8, 30)
r = stats.f_oneway(green, blue, orange)
print(f"30 per colour: F = {r.statistic:.3f}  p = {r.pvalue:.4f}")
print(stats.tukey_hsd(green, blue, orange))</div>
  <div class="fx" data-lang="text">30 per colour: F = 8.053  p = 0.0006
Pairwise Group Comparisons (95.0% Confidence Interval)
Comparison  Statistic  p-value  Lower CI  Upper CI
 (0 - 1)     -6.030     0.005   -10.488    -1.572
 (0 - 2)      0.852     0.892    -3.606     5.310
 (1 - 0)      6.030     0.005     1.572    10.488
 (1 - 2)      6.882     0.001     2.424    11.340
 (2 - 0)     -0.852     0.892    -5.310     3.606
 (2 - 1)     -6.882     0.001   -11.340    -2.424</div>
  <p>ANOVA gives F = 8.05, p = 0.0006, so some colour differs. In Tukey's table, group 0 is green, 1 blue and 2 orange. Blue against green has p = 0.005 and blue against orange p = 0.001, while green against orange has p = 0.89, no real difference. So blue is the winner, and the other two are indistinguishable. With exactly two groups ANOVA is the same as Student's t-test (F = t²). Like the t-test it assumes roughly normal data with similar spreads in each group; Welch's ANOVA relaxes the equal-spread assumption, and the Kruskal-Wallis test in the next section drops the normality assumption.</p>

  <h2 id="sht-np"><span class="num">11</span>Rank (Non-parametric) Tests</h2>
  <p>t-tests and ANOVA work with means and standard deviations, which makes them fragile in one common situation: a single extreme value. Order values are a good example. If one customer places a bulk order worth ₹90,000 while everyone else spends ₹1,000 to ₹2,000, that one value drags the mean far upwards and inflates the standard deviation, and the t statistic collapses. Ratings have a related problem: the gap between 4 and 5 stars is not necessarily the same "one unit" as the gap between 1 and 2.</p>
  <p>The fix is the same one Spearman's correlation used in <a class="xref" data-note="st_correlation">Correlation &amp; Relationships</a>: throw away the sizes and keep only the order. Rank all the values from smallest to largest and ask whether one group's ranks tend to be higher. A whale becomes simply "the largest value", however large it is. In a school race the results list only records who finished first, second and third; one runner taking a wrong turn and finishing ten minutes late does not change anyone else's position. Tests built this way are called <strong>non-parametric</strong>, because they do not assume the data follows a particular shape such as the normal curve. Tests that do, like the t-test, are <strong>parametric</strong>.</p>
  <p>The rank version of the two-sample t-test is the <strong>Mann-Whitney U test</strong>. Its statistic U has a very plain meaning: take every possible pair of one value from each group, and count how many pairs the first group wins. By hand, with order values in ₹100s: old page 3, 5, 40 and new page 6, 8, 9. There are 3 × 3 = 9 pairs. The old page's 3 and 5 lose every pair; its 40 wins all three. So U<sub>old</sub> = 3 out of 9. If the two pages were alike, the old page would win about half, 4.5, so 3 is no evidence of a difference.</p>
  <div class="fx" data-lang="py">a, b = [3, 5, 40], [6, 8, 9]                    # order value in Rs 100s: old page, new page
ranks = stats.rankdata(a + b)
print("ranks:", ranks, " rank sum old:", ranks[:3].sum())
wins = sum(x &gt; y for x in a for y in b)         # pairs where old beats new
print("U_old =", wins, "of", len(a) * len(b))
r = stats.mannwhitneyu(a, b)
print(f"scipy: U = {r.statistic:.0f}  p = {r.pvalue:.2f}")</div>
  <div class="fx" data-lang="text">ranks: [1. 2. 6. 3. 4. 5.]  rank sum old: 9.0
U_old = 3 of 9
scipy: U = 3  p = 0.70</div>
  <p><code>rankdata</code> and the pair count match the hand work, and SciPy's U is the same count of 3, with p = 0.70. Now the real lesson, with ten shoppers per page and one whale on the old page:</p>
  <div class="fx" data-lang="py">a = np.array([12, 15, 14, 10, 13, 11, 16, 14, 12, 900])   # old page spend (Rs 100s); one whale
b = np.array([18, 21, 17, 20, 19, 22, 18, 23, 20, 19])    # new page spend
print("means       :", a.mean(), b.mean())
print("Welch t     : p =", stats.ttest_ind(a, b, equal_var=False).pvalue.round(4))
print("Mann-Whitney: p =", stats.mannwhitneyu(a, b).pvalue.round(4))</div>
  <div class="fx" data-lang="text">means       : 101.7 19.7
Welch t     : p = 0.3794
Mann-Whitney: p = 0.0028</div>
  <p>The new page's shoppers spend more than the old page's in nine cases out of ten, but the single whale (900) drags the old page's mean to 101.7, far above the new page's 19.7. The t-test sees a huge, noisy spread and gives p = 0.38. Mann-Whitney sees that nearly every new-page value outranks nearly every old-page value and gives p = 0.003.</p>
  <table class="tbl">
    <tr><th>Parametric test</th><th>Rank-based alternative</th><th>SciPy</th></tr>
    <tr><td>Two-sample t</td><td>Mann-Whitney U</td><td><code>mannwhitneyu</code></td></tr>
    <tr><td>Paired t</td><td>Wilcoxon signed-rank</td><td><code>wilcoxon</code></td></tr>
    <tr><td>One-way ANOVA</td><td>Kruskal-Wallis</td><td><code>kruskal</code></td></tr>
    <tr><td>Pearson correlation</td><td>Spearman correlation</td><td><code>spearmanr</code></td></tr>
  </table>
  <p>There is a catch that interviewers like. Mann-Whitney does not test whether the <em>means</em> differ; it tests whether a value from one group tends to be larger than a value from the other. If the business cares about average revenue per user, which it usually does because revenue adds up, a rank test answers a different question. In that case use a t-test on a large sample (the CLT makes the mean roughly normal), cap extreme values, or build a confidence interval for the mean by bootstrapping.</p>

  <h2 id="sht-multi"><span class="num">12</span>Multiple Testing</h2>
  <p>α = 0.05 is a promise about <em>one</em> test. After the checkout launch, the dashboard compares 20 metrics. Even if the launch did nothing at all, each metric has a 5% chance of looking "significant" by luck, and across 20 of them at least one false alarm is more likely than not. By hand: the chance that one test gives no false alarm is 0.95, the chance that 20 independent tests all give none is 0.95²⁰ = 0.358, so the chance of at least one is 1 − 0.358 = 0.64. Buy one lottery ticket and winning is a surprise; buy twenty and one small win is expected. A single "p = 0.04" among twenty metrics is not news; it is what luck does.</p>
  <p>There are two standard fixes, and they control different things. The <strong>Bonferroni correction</strong> divides α by the number of tests m and only rejects when p &lt; α ÷ m. It controls the <strong>family-wise error rate</strong> (FWER), the chance of making <em>any</em> false discovery at all, which makes it strict. The <strong>Benjamini-Hochberg</strong> procedure (BH) controls the <strong>false discovery rate</strong> (FDR) instead: among the results you call significant, the expected share that are false. It sorts the p-values from smallest to largest, compares the i-th smallest with (i ÷ m) × α, finds the largest rank that passes, and rejects that one and everything smaller. By hand on the launch's eight secondary metrics:</p>
  <table class="tbl">
    <tr><th>rank i</th><th>p</th><th>Bonferroni: p &lt; 0.05/8 = 0.00625?</th><th>BH cut-off (i/8) × 0.05</th><th>p ≤ BH cut-off?</th></tr>
    <tr><td>1</td><td>0.001</td><td>yes</td><td>0.00625</td><td>yes</td></tr>
    <tr><td>2</td><td>0.008</td><td>no</td><td>0.0125</td><td>yes</td></tr>
    <tr><td>3</td><td>0.012</td><td>no</td><td>0.01875</td><td>yes (largest that passes)</td></tr>
    <tr><td>4</td><td>0.030</td><td>no</td><td>0.025</td><td>no</td></tr>
    <tr><td>5</td><td>0.041</td><td>no</td><td>0.03125</td><td>no</td></tr>
    <tr><td>6–8</td><td>0.20, 0.35, 0.60</td><td>no</td><td>…</td><td>no</td></tr>
  </table>
  <p>Bonferroni keeps one discovery; BH keeps three. statsmodels' <code>multipletests</code> does both:</p>
  <div class="fx" data-lang="py">from statsmodels.stats.multitest import multipletests
print(f"P(at least one false alarm in 20 tests) = {1 - 0.95**20:.3f}")
pvals = [0.001, 0.008, 0.012, 0.030, 0.041, 0.20, 0.35, 0.60]
for method in ["bonferroni", "fdr_bh"]:
    reject, p_adj, _, _ = multipletests(pvals, alpha=0.05, method=method)
    print(f"{method:10s}", reject.astype(int), np.round(p_adj, 3))</div>
  <div class="fx" data-lang="text">P(at least one false alarm in 20 tests) = 0.642
bonferroni [1 0 0 0 0 0 0 0] [0.008 0.064 0.096 0.24  0.328 1.    1.    1.   ]
fdr_bh     [1 1 1 0 0 0 0 0] [0.008 0.032 0.032 0.06  0.066 0.267 0.4   0.6  ]</div>
  <p>The first array in each row is "reject? (1 = yes)" and the second is the <strong>adjusted p-values</strong>, which can be compared directly with 0.05. Bonferroni's adjusted p is simply p × 8, capped at 1: 0.008 × 8 = 0.064, no longer significant. BH's adjusted values are smaller, so ranks 2 and 3 survive. Use Bonferroni when there are few tests and any false positive is costly; use BH when there are many (dozens of metrics, segments, thousands of genes) and you can accept that a small share of your discoveries will be false. Either correction only works if you count every test you actually ran, including the segments you glanced at and "forgot". The cleanest protection is to name one primary metric before the experiment starts.</p>

  <h2 id="sht-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>Two silent defaults change answers without any warning. NumPy's <code>std</code> divides by n unless you pass <code>ddof=1</code>, and SciPy's <code>ttest_ind</code> assumes equal variances (Student's test) unless you pass <code>equal_var=False</code>:</p>
  <div class="fx" data-lang="py">print("np.std default (divide by n)  :", round(small.std(), 3))
print("np.std ddof=1 (divide by n-1) :", round(small.std(ddof=1), 3))
rng = np.random.default_rng(2)
a = np.array([12, 52, 20, 60])               # 4 shoppers, very spread out
b = rng.normal(30, 1, 40)                    # 40 shoppers, tightly bunched
print("Student (equal_var=True, default):", round(stats.ttest_ind(a, b).pvalue, 4))
print("Welch   (equal_var=False)        :", round(stats.ttest_ind(a, b, equal_var=False).pvalue, 4))</div>
  <div class="fx" data-lang="text">np.std default (divide by n)  : 1.414
np.std ddof=1 (divide by n-1) : 1.581
Student (equal_var=True, default): 0.0794
Welch   (equal_var=False)        : 0.6457</div>
  <p>The first two lines give 1.414 and 1.581 for the same five times; the smaller one makes every t statistic too large. In the second example a small, very spread-out group is compared with a large, tightly bunched one. Student's test pools the two variances, so the tight group's small spread dominates and the test looks much more confident than it should (p = 0.079). Welch's test treats each group's spread honestly and gives p = 0.65. Pass <code>equal_var=False</code> by default.</p>
  <p>Peeking at a running experiment and stopping as soon as p drops below 0.05 is another way to cheat without meaning to. Every look is another chance for luck to cross the line:</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(11)
false_alarms = 0
for _ in range(2000):                       # 2000 experiments with NO real effect
    a, b = rng.normal(0, 1, 500), rng.normal(0, 1, 500)
    for n_seen in range(50, 501, 50):       # peek after every 50 users per group
        if stats.ttest_ind(a[:n_seen], b[:n_seen]).pvalue &lt; 0.05:
            false_alarms += 1               # stop and "ship" at the first p &lt; 0.05
            break
print("false-alarm rate with 10 peeks:", false_alarms / 2000)</div>
  <div class="fx" data-lang="text">false-alarm rate with 10 peeks: 0.1975</div>
  <p>In 2,000 experiments with no real effect, checking after every 50 users and stopping at the first p &lt; 0.05 produced a false alarm about 20% of the time, four times the promised 5%. Fix the sample size in advance (from a power calculation) and analyse once, or use a method designed for repeated looks (sequential testing).</p>
  <p>Running an unpaired test on paired data throws away most of the evidence: our eight testers went from p = 0.0002 with the paired test to p = 0.37 unpaired, on identical numbers. Using the normal cut-off 1.96 on tiny samples does the opposite and creates false alarms: with five shoppers it fired 12% of the time under H₀ instead of 5%.</p>
  <p>Finally, the interpretation mistakes, which no code can catch. Reading p as the probability that H₀ is true gets the conditional backwards. Reading "not significant" as "no effect" ignores power: the conversion pilot had only 11% power for a +1 point lift, so its silence would have meant nothing. Reading "significant" as "important" ignores size: with millions of users a 0.01% lift can have p &lt; 0.001. And trying several tests, dropping awkward points or adding segments until something crosses 0.05 ("p-hacking") turns α into fiction. Decide the metric, the test, the sample size and α before looking, and always report the effect size and confidence interval next to p.</p>

  <h2 id="sht-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Core definitions</h3>
  <ul>
    <li><b>H₀</b>: no effect / no difference. <b>H₁</b>: there is one (two-sided: either direction; one-sided: one direction, chosen in advance).</li>
    <li><b>Test statistic</b>: (estimate − H₀ value) ÷ SE, distance from H₀ in units of noise.</li>
    <li><b>Standard error</b>: typical wobble of an estimate across repeated samples; for a mean SE = s ÷ √n.</li>
    <li><b>Null distribution</b>: the statistic's distribution if H₀ is true (t, normal, χ², F).</li>
    <li><b>p-value</b>: P(statistic at least this extreme | H₀). Not P(H₀ | data).</li>
    <li><b>α</b>: false-alarm rate chosen in advance; reject when p &lt; α.</li>
    <li><b>Type I</b>: reject a true H₀ (rate α). <b>Type II</b>: miss a real effect (rate β). <b>Power</b> = 1 − β.</li>
    <li><b>95% CI</b>: estimate ± critical value × SE; 95% of intervals built this way contain the true value.</li>
  </ul>
  <h3>Which test when</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Test</th><th>Checkout pilot</th><th>Python</th></tr>
    <tr><td>Successes vs a known rate, small n</td><td>exact binomial</td><td>9 of 10 prefer new: p 0.021</td><td><code>stats.binomtest</code></td></tr>
    <tr><td>One mean vs a known value</td><td>one-sample t</td><td>27 vs 30 s: t −4.24, p 0.013</td><td><code>stats.ttest_1samp</code></td></tr>
    <tr><td>Two independent means</td><td>Welch t (Mann-Whitney if outliers)</td><td>33 vs 29 s: t 3.10, p 0.055</td><td><code>stats.ttest_ind(equal_var=False)</code></td></tr>
    <tr><td>Same units twice</td><td>paired t (Wilcoxon)</td><td>8 testers: t 7.10, p 0.0002</td><td><code>stats.ttest_rel</code></td></tr>
    <tr><td>Two proportions</td><td>two-proportion z</td><td>13% vs 10%: z 2.10, p 0.036</td><td><code>proportions_ztest</code></td></tr>
    <tr><td>Two categorical variables</td><td>chi-square (Fisher if small)</td><td>device × bought: χ² 11.94</td><td><code>stats.chi2_contingency</code></td></tr>
    <tr><td>3+ means</td><td>ANOVA → Tukey (Kruskal-Wallis)</td><td>3 colours: F 19</td><td><code>stats.f_oneway</code>, <code>stats.tukey_hsd</code></td></tr>
    <tr><td>Many tests at once</td><td>Bonferroni (FWER) / BH (FDR)</td><td>8 metrics: 1 vs 3 discoveries</td><td><code>multipletests</code></td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th></tr>
    <tr><td>One-sample t</td><td>(x̄ − μ₀) ÷ (s ÷ √n), df = n − 1</td></tr>
    <tr><td>Welch t</td><td>(x̄₁ − x̄₂) ÷ √(s₁²/n₁ + s₂²/n₂)</td></tr>
    <tr><td>Paired t</td><td>d̄ ÷ (s<sub>d</sub> ÷ √n) on per-unit differences</td></tr>
    <tr><td>Two-proportion z</td><td>(p̂₂ − p̂₁) ÷ √(p̂(1 − p̂)(1/n₁ + 1/n₂)), p̂ pooled</td></tr>
    <tr><td>Chi-square</td><td>Σ(O − E)² ÷ E, E = row × col ÷ total, df = (r − 1)(c − 1)</td></tr>
    <tr><td>ANOVA</td><td>F = (SSB ÷ (k − 1)) ÷ (SSW ÷ (N − k))</td></tr>
    <tr><td>Confidence interval</td><td>estimate ± t* × SE</td></tr>
    <tr><td>n per arm, two proportions</td><td>(z<sub>α/2</sub> + z<sub>β</sub>)² (p₁(1 − p₁) + p₂(1 − p₂)) ÷ (p₂ − p₁)²</td></tr>
    <tr><td>P(≥ 1 false alarm), m tests</td><td>1 − (1 − α)<sup>m</sup>; 20 tests → 0.64</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from scipy import stats
stats.ttest_1samp(x, popmean=30)            # .confidence_interval()
stats.ttest_ind(a, b, equal_var=False)      # Welch
stats.ttest_rel(before, after)              # paired
stats.chi2_contingency(table)               # Yates on 2x2 by default
stats.f_oneway(g1, g2, g3); stats.tukey_hsd(g1, g2, g3)
stats.mannwhitneyu(a, b); stats.wilcoxon(before, after); stats.kruskal(g1, g2, g3)
from statsmodels.stats.proportion import proportions_ztest
from statsmodels.stats.power import TTestIndPower    # .solve_power(effect_size=0.5, power=0.8)
from statsmodels.stats.multitest import multipletests  # method="bonferroni" / "fdr_bh"</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Choose H₁ direction and α before seeing data.</li>
    <li>Fail to reject ≠ H₀ is true; significant ≠ important.</li>
    <li><code>ddof=1</code> for sample sd; <code>equal_var=False</code> for Welch.</li>
    <li>Paired data needs the paired test.</li>
    <li>Pooled SE for the z-test, unpooled for the CI.</li>
    <li>Chi-square: counts not percentages, expected ≥ 5 per cell.</li>
    <li>ANOVA says "some mean differs"; Tukey says which.</li>
    <li>Mann-Whitney compares "tends to be larger", not means.</li>
    <li>Peeking and many metrics inflate false alarms; correct or pre-register.</li>
    <li>Power is planned before the study, never computed after.</li>
  </ul>

  <h2 id="sht-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Explain a p-value to a non-technical stakeholder.</summary><div class="qa-body">Imagine the change did nothing at all. The p-value is how often, in that world, we would see a difference as big as ours just from random variation. A p-value of 0.02 means that kind of result would happen about 2 times in 100 by luck alone, so luck is an unlikely explanation. It is not the probability that the change works.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the null and alternative hypotheses? Why do we try to reject the null rather than prove the alternative?</summary><div class="qa-body">H₀ is the "nothing is happening" statement (no difference, no effect) and H₁ is what we suspect. We assume H₀ because it gives a precise world in which we can calculate how likely our data would be; "there is some effect" does not specify how big, so it cannot be calculated directly. Like a court, we either find strong evidence against H₀ or we do not; we never prove H₀ true.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are Type I and Type II errors? Give an example of when each is worse.</summary><div class="qa-body">A Type I error is a false positive: rejecting H₀ when it is true (shipping a feature that does nothing); its rate is α. A Type II error is a false negative: missing a real effect (abandoning a feature that works); its rate is β. In product launches false positives are often worse because they ship useless or harmful changes; in disease screening false negatives are worse because a sick patient goes untreated.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is statistical power, and what increases it?</summary><div class="qa-body">Power is the probability of rejecting H₀ when a real effect of a given size exists, 1 − β; 80% is the usual target. It increases with sample size, with the size of the true effect, with a larger α, and with lower noise (for example through paired designs or variance reduction). It must be computed before the study to choose the sample size.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a 95% confidence interval mean? Is "95% probability the true value is inside" correct?</summary><div class="qa-body">It means the procedure that built the interval captures the true value in 95% of repeated studies. In the frequentist view the true value is fixed, so a particular interval either contains it or not; the 95% describes the method. "95% probability the value is in this interval" is the interpretation of a Bayesian credible interval, not a confidence interval.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How are confidence intervals and hypothesis tests related?</summary><div class="qa-body">For the same data and method, a 95% CI excludes the H₀ value exactly when the two-sided test gives p &lt; 0.05. The CI carries more information because it also shows the plausible size of the effect, so it is better to report the CI than a bare p-value.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between standard deviation and standard error?</summary><div class="qa-body">Standard deviation measures how spread out individual values are. Standard error measures how much an estimate, such as the sample mean, would vary between repeated samples. For a mean SE = s ÷ √n, so it shrinks as the sample grows while the standard deviation does not. Test statistics divide by the standard error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When do you use a t-test versus a z-test?</summary><div class="qa-body">Use a z-test when the standard deviation is known or the sample is large enough that the normal curve fits, as with proportions on large samples where the SE comes from p itself. Use a t-test for means when the standard deviation is estimated from the sample; the t curve has fatter tails to account for that extra uncertainty, and it approaches the normal as n grows. In practice the t-test is the default for means.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain one-sample, two-sample and paired t-tests, with an example of each.</summary><div class="qa-body">A one-sample test compares one group's mean with a fixed value (new-page checkout time against the historical 30 seconds). A two-sample test compares two independent groups (shoppers on the old page against different shoppers on the new). A paired test compares the same units measured twice (the same testers on both pages) by running a one-sample test on their differences, which removes person-to-person variation and greatly increases power.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why prefer Welch's t-test over Student's?</summary><div class="qa-body">Student's t-test assumes both groups have the same variance. When they differ, especially with unequal group sizes, its p-values can be badly wrong. Welch's test estimates each group's variance separately and adjusts the degrees of freedom; it is accurate when variances differ and loses almost nothing when they are equal, so it is the safer default (<code>equal_var=False</code> in SciPy).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a chi-square test of independence do, and what are its requirements?</summary><div class="qa-body">It tests whether two categorical variables are related by comparing observed counts in a table with the counts expected if they were independent (row total × column total ÷ grand total), using χ² = Σ(O − E)² ÷ E with (r − 1)(c − 1) degrees of freedom. It needs raw counts, independent observations and expected counts of at least about 5 per cell; otherwise use Fisher's exact test.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use ANOVA instead of several t-tests? What does a significant ANOVA tell you?</summary><div class="qa-body">Running a t-test on every pair inflates the overall chance of a false positive, while ANOVA tests "all means are equal" once at level α. It compares variation between group means with variation within groups via F = between ÷ within. A significant result only says at least one mean differs; a post-hoc test such as Tukey's HSD identifies which pairs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use a non-parametric test such as Mann-Whitney?</summary><div class="qa-body">When the data is ordinal (ratings), heavily skewed, has influential outliers, or the sample is small and clearly non-normal. It works on ranks, so one extreme value cannot dominate. Note that it tests whether one group tends to have larger values, not whether means differ; if the mean is the business metric, prefer a t-test on a large sample or a bootstrap CI.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your test gives p = 0.3. Can you conclude the change has no effect?</summary><div class="qa-body">No. It means the data is consistent with no effect, not that there is none. The test may have had low power, so look at the confidence interval: if it is wide (say −5% to +8%) you simply do not know, while a narrow interval around zero from a well-powered test supports "any effect is small".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>With 10 million users, a 0.01% lift has p &lt; 0.001. Should you ship?</summary><div class="qa-body">Not on the p-value alone. A huge sample makes tiny effects significant; the question is whether the effect is large enough to matter compared with cost, risk and complexity. Look at the effect size and its confidence interval against the minimum effect worth acting on, which should have been defined before the test.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You test 20 metrics and one has p = 0.04. What do you conclude?</summary><div class="qa-body">Probably nothing. With 20 independent tests at α = 0.05 the chance of at least one false positive is 1 − 0.95²⁰ ≈ 64%, so one hit is what luck would produce. Correct for multiple comparisons (Bonferroni would require p &lt; 0.0025; Benjamini-Hochberg controls the false discovery rate), or treat it as a hypothesis for a new test, and decide a primary metric in advance next time.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between Bonferroni and Benjamini-Hochberg?</summary><div class="qa-body">Bonferroni controls the family-wise error rate, the chance of any false positive, by using α ÷ m for each test; it is simple but strict and loses power with many tests. Benjamini-Hochberg controls the false discovery rate, the expected share of false positives among discoveries, by comparing sorted p-values with (i ÷ m) × α; it finds more real effects and suits settings with many tests.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is wrong with checking an A/B test every day and stopping when p &lt; 0.05?</summary><div class="qa-body">Each look is another chance for random fluctuation to cross the threshold, so the real false-positive rate climbs far above 5% (about 20% with ten looks in our simulation). Either fix the sample size in advance from a power calculation and analyse once, or use a sequential method designed for repeated looks, such as group-sequential boundaries or always-valid p-values.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you calculate the sample size for an A/B test on conversion?</summary><div class="qa-body">Choose α (0.05), power (0.8), the baseline rate and the minimum detectable effect. Then n per arm ≈ (z<sub>α/2</sub> + z<sub>β</sub>)² × (p₁(1 − p₁) + p₂(1 − p₂)) ÷ (p₂ − p₁)². For 10% → 11% that is (1.96 + 0.84)² × (0.09 + 0.0979) ÷ 0.0001 ≈ 14,749 per arm; halving the detectable effect roughly quadruples n.</div></details>
</main>
`
});
