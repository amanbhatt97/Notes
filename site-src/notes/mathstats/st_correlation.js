// notes/mathstats/st_correlation.js — Correlation & Relationships
Object.assign(TOPIC_CONTENT, {
  "st_correlation": `<main>
  <h1>Correlation &amp; Relationships</h1>
  <div class="where"><span>Mathematics &amp; Statistics</span><span>Statistics</span><span>Correlation &amp; Relationships</span></div>
  <p class="lead">Everything in <a class="xref" data-note="st_descriptive">Descriptive Statistics</a> described one column at a time: its centre, its spread, its shape. Most real questions involve two columns at once. Do students who study more score more? Does a cheaper price go with more sales? Is this new feature telling the model anything that an existing feature does not already say? <strong>Correlation</strong> is the tool that turns "do these two things move together?" into a single number, and you will use it in almost every exploratory analysis, every feature-selection step and every argument about whether X causes Y. This page follows one small class of five students, A to E, the whole way through: we build covariance and Pearson's r from their study hours and exam scores by hand, check whether the result could be luck, switch to ranks when the data has curves or typos, see the patterns that a correlation cannot see, and finish with the two ways correlation misleads people most often, causation and multicollinearity.</p>

  <h2 id="sco-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Correlation</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Measuring it</div>
        <ul>
          <li><b>Covariance</b>: average product of deviations; sign = direction, size depends on units</li>
          <li><b>Pearson r</b> = cov ÷ (s<sub>x</sub> s<sub>y</sub>), between −1 and 1, straight lines only</li>
          <li><b>r²</b>: share of variation a straight line explains</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Trusting it</div>
        <ul>
          <li>t = r√(n − 2) ÷ √(1 − r²) tests "true correlation is 0"</li>
          <li>Small n: big r comes cheap; big n: tiny r is "significant"</li>
          <li>Always plot: r = 0 can hide a strong curve (Anscombe)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Ranks</div>
        <ul>
          <li><b>Spearman ρ</b>: Pearson on ranks; any always-rising curve</li>
          <li><b>Kendall τ</b>: agreeing minus disagreeing pairs</li>
          <li>Robust to outliers and typos</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Misreading it</div>
        <ul>
          <li><b>Confounder</b>: a third variable drives both</li>
          <li><b>Simpson's paradox</b>: pooling groups flips the trend</li>
          <li><b>Multicollinearity</b>: correlated features, shaky coefficients; <b>VIF</b> = 1 ÷ (1 − R²)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sco-cov"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Covariance</span><span class="rm-sub">do two columns move together, and in which direction?</span></div></div>
      <div class="rm-item rm-done" data-target="sco-r"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Pearson Correlation</span><span class="rm-sub">a unit-free strength between −1 and 1</span></div></div>
      <div class="rm-item rm-done" data-target="sco-sig"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Testing a Correlation</span><span class="rm-sub">could this r be luck?</span></div></div>
      <div class="rm-item rm-done" data-target="sco-rank"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Spearman and Kendall</span><span class="rm-sub">correlation on ranks, for curves and outliers</span></div></div>
      <div class="rm-item rm-done" data-target="sco-blind"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">What r Cannot See</span><span class="rm-sub">r = 0 with a clear pattern, Anscombe's quartet</span></div></div>
      <div class="rm-item rm-done" data-target="sco-cause"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Correlation vs Causation</span><span class="rm-sub">confounders and partial correlation</span></div></div>
      <div class="rm-item rm-done" data-target="sco-simpson"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Simpson's Paradox</span><span class="rm-sub">a trend that flips when groups are pooled</span></div></div>
      <div class="rm-item rm-done" data-target="sco-vif"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Multicollinearity and VIF</span><span class="rm-sub">when model features copy each other</span></div></div>
      <div class="rm-item rm-done" data-target="sco-traps"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">units, outliers, tiny samples, causal claims</span></div></div>
      <div class="rm-item rm-done" data-target="sco-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, comparison table, gotchas</span></div></div>
      <div class="rm-item rm-done" data-target="sco-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on correlation</span></div></div>
    </div>
  </div>

  <h2 id="sco-cov"><span class="num">01</span>Covariance</h2>
  <p>A tutor keeps a small record for five students. For each one she notes how many hours a day they studied, their final exam score, how many hours a day they spent on their phone, their score in an earlier mock test, how stressed they said they felt on a scale of 1 to 5, and how many practice tests they took. Every calculation on this page uses this table:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from scipy import stats
df = pd.DataFrame({"hours":  [1, 2, 3, 4, 5],         # hours studied per day
                   "score":  [52, 55, 61, 64, 68],    # final exam score
                   "phone":  [6, 5, 5, 3, 2],         # phone hours per day
                   "mock":   [40, 58, 50, 66, 70],    # mock-test score
                   "stress": [1, 5, 4, 2, 3],         # self-rated stress, 1-5
                   "tests":  [2, 4, 4, 8, 9]},        # practice tests taken
                  index=list("ABCDE"))
print(df)</div>
  <div class="fx" data-lang="text">   hours  score  phone  mock  stress  tests
A      1     52      6    40       1      2
B      2     55      5    58       5      4
C      3     61      5    50       4      4
D      4     64      3    66       2      8
E      5     68      2    70       3      9</div>
  <p>The first question is the obvious one: when study hours go up, does the score go up too? With five rows you can see by eye that it does. But with ten thousand rows and fifty columns you cannot look at every pair, and a picture cannot be put inside a feature-selection loop. We need a number that says "these two columns rise together" or "one rises while the other falls" or "there is no clear link".</p>
  <p>Here is the idea in plain words. For every student, ask two questions: are they above or below the average on hours, and are they above or below the average on score? If most students are above average on both, or below average on both, the two columns move together. If most are above on one and below on the other, they move in opposite directions. If it is a mix, there is no clear link. Think of rainfall and umbrella sales: on days that are wetter than usual, umbrella shops sell more than usual, and on drier days they sell less. Both are "above usual" together and "below usual" together. That shared movement around the usual level is what we are about to measure.</p>
  <p>To turn the idea into a number, we measure each student's <strong>deviation</strong>, meaning how far they are from the average, on both columns, and multiply the two deviations together. The sign of the product does the "same side or opposite side" check for us: above on both gives a positive times a positive, below on both gives a negative times a negative, and both of those are positive. Being above on one and below on the other gives a negative product. A student who is far from average on both gives a big product, so they count for more.</p>
  <p>Let us do it by hand. The average of hours is (1 + 2 + 3 + 4 + 5) ÷ 5 = 3, and the average score is 300 ÷ 5 = 60.</p>
  <table class="tbl">
    <tr><th>student</th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th><th>sum</th></tr>
    <tr><td>hours x</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>15</td></tr>
    <tr><td>score y</td><td>52</td><td>55</td><td>61</td><td>64</td><td>68</td><td>300</td></tr>
    <tr><td>x − 3</td><td>−2</td><td>−1</td><td>0</td><td>+1</td><td>+2</td><td></td></tr>
    <tr><td>y − 60</td><td>−8</td><td>−5</td><td>+1</td><td>+4</td><td>+8</td><td></td></tr>
    <tr><td>product</td><td>16</td><td>5</td><td>0</td><td>4</td><td>16</td><td><strong>41</strong></td></tr>
  </table>
  <p>Every product is positive or zero. Students A and B studied less than average and scored less than average; D and E studied more and scored more; C sits exactly on the average hours, so it contributes 0. Averaging the products gives the <strong>covariance</strong>: a number whose sign tells you whether two variables tend to move in the same direction (positive) or in opposite directions (negative). Written as a formula:</p>
  <div class="fx" data-lang="text">cov(x, y) = Σ (xᵢ − x̄)(yᵢ − ȳ) ÷ (n − 1)

          = 41 ÷ (5 − 1) = 10.25</div>
  <p>In words: x̄ and ȳ (read "x-bar", "y-bar") are the two averages, so (xᵢ − x̄) and (yᵢ − ȳ) are student i's two deviations. Σ means "add up over all students". We divide by n − 1 rather than n for the same reason as the sample variance in the Descriptive Statistics note: the deviations are measured from the sample's own average, which sits a little too close to the data, and dividing by n − 1 corrects for that. Notice that if you put the same column in both places, cov(x, x) is just the variance of x. Covariance is variance generalised to two columns.</p>
  <p>The chart shows the same calculation as a picture. The dashed lines are the two averages, and they split the plot into four boxes. Points in the green boxes (top right and bottom left) give positive products; points in the red boxes give negative ones. All five students sit in green boxes or on a line, so the covariance comes out positive.</p>
  <figure class="viz"><svg fill="currentColor" style="max-width:680px;width:100%;height:auto" xmlns:xlink="http://www.w3.org/1999/xlink"  viewBox="0 0 371.174922 261.802394" xmlns="http://www.w3.org/2000/svg" version="1.1">
<defs>
</defs>
<g id="sco-ch_quad-figure_1">
<g id="sco-ch_quad-patch_1">
<path d="M 0 261.802394 
L 371.174922 261.802394 
L 371.174922 0 
L 0 0 
L 0 261.802394 
z
" style="fill: none"/>
</g>
<g id="sco-ch_quad-axes_1">
<g id="sco-ch_quad-patch_2">
<path d="M 51.494922 219.403175 
L 363.974922 219.403175 
L 363.974922 8.731175 
L 51.494922 8.731175 
L 51.494922 219.403175 
z
" style="fill: none"/>
</g>
<g id="sco-ch_quad-patch_3">
<path d="M 207.734922 219.403175 
L 363.974922 219.403175 
L 363.974922 8.731175 
L 207.734922 8.731175 
L 207.734922 219.403175 
z
" clip-path="url(#sco-ch_quad-p40544a298a)" style="fill: none; opacity: 0"/>
</g>
<g id="sco-ch_quad-FillBetweenPolyCollection_1">
<defs>
<path id="sco-ch_quad-ma3c9c8e614" d="M 207.734922 -253.071219 
L 207.734922 -147.735219 
L 363.974922 -147.735219 
L 363.974922 -253.071219 
L 363.974922 -253.071219 
L 207.734922 -253.071219 
z
"/>
</defs>
<g clip-path="url(#sco-ch_quad-p40544a298a)">
<use xlink:href="#sco-ch_quad-ma3c9c8e614" x="0" y="261.802394" style="fill: #22c55e; fill-opacity: 0.15"/>
</g>
</g>
<g id="sco-ch_quad-FillBetweenPolyCollection_2">
<defs>
<path id="sco-ch_quad-m04be5f7f55" d="M 51.494922 -147.735219 
L 51.494922 -42.399219 
L 207.734922 -42.399219 
L 207.734922 -147.735219 
L 207.734922 -147.735219 
L 51.494922 -147.735219 
z
"/>
</defs>
<g clip-path="url(#sco-ch_quad-p40544a298a)">
<use xlink:href="#sco-ch_quad-m04be5f7f55" x="0" y="261.802394" style="fill: #22c55e; fill-opacity: 0.15"/>
</g>
</g>
<g id="sco-ch_quad-FillBetweenPolyCollection_3">
<defs>
<path id="sco-ch_quad-m4c8c80db80" d="M 51.494922 -253.071219 
L 51.494922 -147.735219 
L 207.734922 -147.735219 
L 207.734922 -253.071219 
L 207.734922 -253.071219 
L 51.494922 -253.071219 
z
"/>
</defs>
<g clip-path="url(#sco-ch_quad-p40544a298a)">
<use xlink:href="#sco-ch_quad-m4c8c80db80" x="0" y="261.802394" style="fill: #ef4444; fill-opacity: 0.1"/>
</g>
</g>
<g id="sco-ch_quad-FillBetweenPolyCollection_4">
<defs>
<path id="sco-ch_quad-m4af419f507" d="M 207.734922 -147.735219 
L 207.734922 -42.399219 
L 363.974922 -42.399219 
L 363.974922 -147.735219 
L 363.974922 -147.735219 
L 207.734922 -147.735219 
z
"/>
</defs>
<g clip-path="url(#sco-ch_quad-p40544a298a)">
<use xlink:href="#sco-ch_quad-m4af419f507" x="0" y="261.802394" style="fill: #ef4444; fill-opacity: 0.1"/>
</g>
</g>
<g id="sco-ch_quad-matplotlib.axis_1">
<g id="sco-ch_quad-xtick_1">
<g id="sco-ch_quad-line2d_1">
<defs>
<path id="sco-ch_quad-m7c25c535dc" d="M 0 0 
L 0 3.5 
" style="stroke: currentColor; stroke-width: 0.8"/>
</defs>
<g>
<use xlink:href="#sco-ch_quad-m7c25c535dc" x="87.550306" y="219.403175" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_quad-text_1">
<text style="font-size: 10px; text-anchor: middle" x="87.550306" y="236.090675" transform="rotate(-0 87.550306 236.090675)">1</text>
</g>
</g>
<g id="sco-ch_quad-xtick_2">
<g id="sco-ch_quad-line2d_2">
<g>
<use xlink:href="#sco-ch_quad-m7c25c535dc" x="147.642614" y="219.403175" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_quad-text_2">
<text style="font-size: 10px; text-anchor: middle" x="147.642614" y="236.090675" transform="rotate(-0 147.642614 236.090675)">2</text>
</g>
</g>
<g id="sco-ch_quad-xtick_3">
<g id="sco-ch_quad-line2d_3">
<g>
<use xlink:href="#sco-ch_quad-m7c25c535dc" x="207.734922" y="219.403175" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_quad-text_3">
<text style="font-size: 10px; text-anchor: middle" x="207.734922" y="236.090675" transform="rotate(-0 207.734922 236.090675)">3</text>
</g>
</g>
<g id="sco-ch_quad-xtick_4">
<g id="sco-ch_quad-line2d_4">
<g>
<use xlink:href="#sco-ch_quad-m7c25c535dc" x="267.82723" y="219.403175" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_quad-text_4">
<text style="font-size: 10px; text-anchor: middle" x="267.82723" y="236.090675" transform="rotate(-0 267.82723 236.090675)">4</text>
</g>
</g>
<g id="sco-ch_quad-xtick_5">
<g id="sco-ch_quad-line2d_5">
<g>
<use xlink:href="#sco-ch_quad-m7c25c535dc" x="327.919537" y="219.403175" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_quad-text_5">
<text style="font-size: 10px; text-anchor: middle" x="327.919537" y="236.090675" transform="rotate(-0 327.919537 236.090675)">5</text>
</g>
</g>
<g id="sco-ch_quad-text_6">
<text style="font-size: 10px; text-anchor: middle" x="207.734922" y="252.190284" transform="rotate(-0 207.734922 252.190284)">hours studied per day</text>
</g>
</g>
<g id="sco-ch_quad-matplotlib.axis_2">
<g id="sco-ch_quad-ytick_1">
<g id="sco-ch_quad-line2d_6">
<defs>
<path id="sco-ch_quad-mb258c49b38" d="M 0 0 
L -3.5 0 
" style="stroke: currentColor; stroke-width: 0.8"/>
</defs>
<g>
<use xlink:href="#sco-ch_quad-mb258c49b38" x="51.494922" y="209.827175" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_quad-text_7">
<text style="font-size: 10px; text-anchor: end" x="44.494922" y="214.670925" transform="rotate(-0 44.494922 214.670925)">50.0</text>
</g>
</g>
<g id="sco-ch_quad-ytick_2">
<g id="sco-ch_quad-line2d_7">
<g>
<use xlink:href="#sco-ch_quad-mb258c49b38" x="51.494922" y="185.887175" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_quad-text_8">
<text style="font-size: 10px; text-anchor: end" x="44.494922" y="190.730925" transform="rotate(-0 44.494922 190.730925)">52.5</text>
</g>
</g>
<g id="sco-ch_quad-ytick_3">
<g id="sco-ch_quad-line2d_8">
<g>
<use xlink:href="#sco-ch_quad-mb258c49b38" x="51.494922" y="161.947175" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_quad-text_9">
<text style="font-size: 10px; text-anchor: end" x="44.494922" y="166.790925" transform="rotate(-0 44.494922 166.790925)">55.0</text>
</g>
</g>
<g id="sco-ch_quad-ytick_4">
<g id="sco-ch_quad-line2d_9">
<g>
<use xlink:href="#sco-ch_quad-mb258c49b38" x="51.494922" y="138.007175" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_quad-text_10">
<text style="font-size: 10px; text-anchor: end" x="44.494922" y="142.850925" transform="rotate(-0 44.494922 142.850925)">57.5</text>
</g>
</g>
<g id="sco-ch_quad-ytick_5">
<g id="sco-ch_quad-line2d_10">
<g>
<use xlink:href="#sco-ch_quad-mb258c49b38" x="51.494922" y="114.067175" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_quad-text_11">
<text style="font-size: 10px; text-anchor: end" x="44.494922" y="118.910925" transform="rotate(-0 44.494922 118.910925)">60.0</text>
</g>
</g>
<g id="sco-ch_quad-ytick_6">
<g id="sco-ch_quad-line2d_11">
<g>
<use xlink:href="#sco-ch_quad-mb258c49b38" x="51.494922" y="90.127175" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_quad-text_12">
<text style="font-size: 10px; text-anchor: end" x="44.494922" y="94.970925" transform="rotate(-0 44.494922 94.970925)">62.5</text>
</g>
</g>
<g id="sco-ch_quad-ytick_7">
<g id="sco-ch_quad-line2d_12">
<g>
<use xlink:href="#sco-ch_quad-mb258c49b38" x="51.494922" y="66.187175" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_quad-text_13">
<text style="font-size: 10px; text-anchor: end" x="44.494922" y="71.030925" transform="rotate(-0 44.494922 71.030925)">65.0</text>
</g>
</g>
<g id="sco-ch_quad-ytick_8">
<g id="sco-ch_quad-line2d_13">
<g>
<use xlink:href="#sco-ch_quad-mb258c49b38" x="51.494922" y="42.247175" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_quad-text_14">
<text style="font-size: 10px; text-anchor: end" x="44.494922" y="47.090925" transform="rotate(-0 44.494922 47.090925)">67.5</text>
</g>
</g>
<g id="sco-ch_quad-ytick_9">
<g id="sco-ch_quad-line2d_14">
<g>
<use xlink:href="#sco-ch_quad-mb258c49b38" x="51.494922" y="18.307175" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_quad-text_15">
<text style="font-size: 10px; text-anchor: end" x="44.494922" y="23.150925" transform="rotate(-0 44.494922 23.150925)">70.0</text>
</g>
</g>
<g id="sco-ch_quad-text_16">
<text style="font-size: 10px; text-anchor: middle" x="16.8875" y="114.067175" transform="rotate(-90 16.8875 114.067175)">exam score</text>
</g>
</g>
<g id="sco-ch_quad-line2d_15">
<path d="M 207.734922 219.403175 
L 207.734922 8.731175 
" clip-path="url(#sco-ch_quad-p40544a298a)" style="fill: none; stroke-dasharray: 3.7,1.6; stroke-dashoffset: 0; stroke: #9ca3af"/>
</g>
<g id="sco-ch_quad-line2d_16">
<path d="M 51.494922 114.067175 
L 363.974922 114.067175 
" clip-path="url(#sco-ch_quad-p40544a298a)" style="fill: none; stroke-dasharray: 3.7,1.6; stroke-dashoffset: 0; stroke: #9ca3af"/>
</g>
<g id="sco-ch_quad-patch_4">
<path d="M 51.494922 219.403175 
L 51.494922 8.731175 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sco-ch_quad-patch_5">
<path d="M 51.494922 219.403175 
L 363.974922 219.403175 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sco-ch_quad-PathCollection_1">
<defs>
<path id="sco-ch_quad-m2b17971a8b" d="M 0 3.535534 
C 0.937635 3.535534 1.836992 3.163008 2.5 2.5 
C 3.163008 1.836992 3.535534 0.937635 3.535534 0 
C 3.535534 -0.937635 3.163008 -1.836992 2.5 -2.5 
C 1.836992 -3.163008 0.937635 -3.535534 0 -3.535534 
C -0.937635 -3.535534 -1.836992 -3.163008 -2.5 -2.5 
C -3.163008 -1.836992 -3.535534 -0.937635 -3.535534 0 
C -3.535534 0.937635 -3.163008 1.836992 -2.5 2.5 
C -1.836992 3.163008 -0.937635 3.535534 0 3.535534 
z
" style="stroke: #3b82f6"/>
</defs>
<g clip-path="url(#sco-ch_quad-p40544a298a)">
<use xlink:href="#sco-ch_quad-m2b17971a8b" x="87.550306" y="190.675175" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_quad-m2b17971a8b" x="147.642614" y="161.947175" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_quad-m2b17971a8b" x="207.734922" y="104.491175" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_quad-m2b17971a8b" x="267.82723" y="75.763175" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_quad-m2b17971a8b" x="327.919537" y="37.459175" style="fill: #3b82f6; stroke: #3b82f6"/>
</g>
</g>
<g id="sco-ch_quad-text_17">
<text style="font-size: 8.5px; text-anchor: start" x="95.550306" y="194.675175" transform="rotate(-0 95.550306 194.675175)">A: −2 × −8 = 16</text>
</g>
<g id="sco-ch_quad-text_18">
<text style="font-size: 8.5px; text-anchor: start" x="155.642614" y="165.947175" transform="rotate(-0 155.642614 165.947175)">B: −1 × −5 = 5</text>
</g>
<g id="sco-ch_quad-text_19">
<text style="font-size: 8.5px; text-anchor: end" x="199.734922" y="96.491175" transform="rotate(-0 199.734922 96.491175)">C: +0 × +1 = 0</text>
</g>
<g id="sco-ch_quad-text_20">
<text style="font-size: 8.5px; text-anchor: start" x="275.82723" y="79.763175" transform="rotate(-0 275.82723 79.763175)">D: +1 × +4 = 4</text>
</g>
<g id="sco-ch_quad-text_21">
<text style="font-size: 8.5px; text-anchor: end" x="319.919537" y="29.459175" transform="rotate(-0 319.919537 29.459175)">E: +2 × +8 = 16</text>
</g>
<g id="sco-ch_quad-text_22">
<text style="font-size: 8.5px; text-anchor: end" x="357.965691" y="15.434375" transform="rotate(-0 357.965691 15.434375)">above on both: product +</text>
</g>
<g id="sco-ch_quad-text_23">
<text style="font-size: 8.5px; text-anchor: start" x="57.504153" y="213.657575" transform="rotate(-0 57.504153 213.657575)">below on both: product +</text>
</g>
<g id="sco-ch_quad-text_24">
<text style="font-size: 8.5px; text-anchor: start" x="57.504153" y="15.434375" transform="rotate(-0 57.504153 15.434375)">product −</text>
</g>
<g id="sco-ch_quad-text_25">
<text style="font-size: 8.5px; text-anchor: end" x="357.965691" y="213.657575" transform="rotate(-0 357.965691 213.657575)">product −</text>
</g>
<g id="sco-ch_quad-text_26">
<text style="font-size: 8px; text-anchor: start; fill: #9ca3af" x="210.739537" y="213.657575" transform="rotate(-0 210.739537 213.657575)">mean 3 h</text>
</g>
<g id="sco-ch_quad-text_27">
<text style="font-size: 8px; text-anchor: start; fill: #9ca3af" x="54.499537" y="110.236775" transform="rotate(-0 54.499537 110.236775)">mean 60</text>
</g>
</g>
</g>
<defs>
<clipPath id="sco-ch_quad-p40544a298a">
<rect x="51.494922" y="8.731175" width="312.48" height="210.672"/>
</clipPath>
</defs>
</svg><figcaption>The five students around the average lines. Every point is above average on both or below average on both, so every product is positive (or zero for C) and the covariance is positive.</figcaption></figure>
  <p>NumPy computes it with <code>np.cov</code>. The code below rebuilds the products and the sum, then lets NumPy do it:</p>
  <div class="fx" data-lang="py">hours, score = df.hours.values, df.score.values
dx = hours - hours.mean()                 # distance from mean hours (3)
dy = score - score.mean()                 # distance from mean score (60)
print("products:", dx * dy, " sum:", (dx * dy).sum())
print("covariance:", (dx * dy).sum() / (len(hours) - 1))
print(np.cov(hours, score))               # 2x2 covariance matrix</div>
  <div class="fx" data-lang="text">products: [16.  5.  0.  4. 16.]  sum: 41.0
covariance: 10.25
[[ 2.5  10.25]
 [10.25 42.5 ]]</div>
  <p>The products 16, 5, 0, 4, 16 and the sum 41 match the table, and 41 ÷ 4 = 10.25. <code>np.cov</code> returns a 2×2 table called the <strong>covariance matrix</strong>: the off-diagonal entries are the covariance between the two columns (10.25, written twice because cov(x, y) = cov(y, x)), and the diagonal entries are each column's own variance (2.5 for hours, 42.5 for score). With many columns this matrix gets one row and one column per variable; it is the starting point of PCA (see <a class="xref" data-note="ml_dimred">Dimensionality Reduction</a>) and of portfolio risk in finance.</p>
  <p>So covariance tells us the direction: hours and score rise together. But is 10.25 a strong link or a weak one? The trouble is that covariance carries the units of both columns, "hours × marks", and changing the units changes the number even though the relationship has not changed at all:</p>
  <div class="fx" data-lang="py">print("hours, score      :", np.cov(hours, score)[0, 1])
print("minutes, score    :", np.cov(hours * 60, score)[0, 1])
print("score out of 1000 :", np.cov(hours, score * 10)[0, 1])</div>
  <div class="fx" data-lang="text">hours, score      : 10.25
minutes, score    : 615.0
score out of 1000 : 102.5</div>
  <p>Recording study time in minutes multiplies every hour deviation by 60, so the covariance becomes 615. Marking the exam out of 1000 instead of 100 multiplies the score deviations by 10, so it becomes 102.5. Same five students, same relationship, three different numbers. The sign of a covariance is meaningful, but its size on its own is not, and you cannot compare covariances between pairs of columns measured in different units. To judge strength we need to remove the units, which is exactly what Pearson's correlation does.</p>

  <h2 id="sco-r"><span class="num">02</span>Pearson Correlation</h2>
  <p>The fix for the units problem is to measure each deviation not in hours or marks but in "how many standard deviations from the average". The <strong>standard deviation</strong> (from Descriptive Statistics) is the typical size of a deviation in a column, so dividing by it turns hours into a pure number, and the same for marks. Dividing the covariance by both standard deviations removes both units at once. The result is the <strong>Pearson correlation coefficient</strong>, written r: a unit-free number between −1 and +1 that measures how closely the points follow a straight line.</p>
  <p>Think of exam marks given out of different totals. One teacher marks out of 20, another out of 150, so "17" and "120" cannot be compared directly. Turn both into percentages and suddenly they can. Covariance is the raw mark; r is the percentage. Whatever units the columns were in, r = 0.9 means the same thing.</p>
  <div class="fx" data-lang="text">r = cov(x, y) ÷ (sₓ × s_y)

sₓ  = √(Σ(x − 3)² ÷ 4)  = √((4 + 1 + 0 + 1 + 4) ÷ 4)     = √2.5  = 1.581 hours
s_y = √(Σ(y − 60)² ÷ 4) = √((64 + 25 + 1 + 16 + 64) ÷ 4) = √42.5 = 6.519 marks

r = 10.25 ÷ (1.581 × 6.519) = 10.25 ÷ 10.31 = 0.994</div>
  <p>Here sₓ and s_y are the two sample standard deviations. The answer, 0.994, is very close to 1, which means the five points lie almost exactly on a rising straight line. The scale reads like this: r = +1 means every point lies exactly on a rising line; r = −1 means exactly on a falling line; r = 0 means no straight-line pattern at all; values in between say how tightly the points hug a line. The sign is the direction, the size is the tightness.</p>
  <figure class="viz"><svg fill="currentColor" style="max-width:680px;width:100%;height:auto" xmlns:xlink="http://www.w3.org/1999/xlink"  viewBox="0 0 550.08 135.4235" xmlns="http://www.w3.org/2000/svg" version="1.1">
<defs>
</defs>
<g id="sco-ch_gallery-figure_1">
<g id="sco-ch_gallery-patch_1">
<path d="M 0 135.4235 
L 550.08 135.4235 
L 550.08 0 
L 0 0 
L 0 135.4235 
z
" style="fill: none"/>
</g>
<g id="sco-ch_gallery-axes_1">
<g id="sco-ch_gallery-patch_2">
<path d="M 7.2 128.2235 
L 83.725714 128.2235 
L 83.725714 22.8875 
L 7.2 22.8875 
L 7.2 128.2235 
z
" style="fill: none"/>
</g>
<g id="sco-ch_gallery-PathCollection_1">
<defs>
<path id="sco-ch_gallery-mb7c521647f" d="M 0 1.224745 
C 0.324806 1.224745 0.636353 1.095698 0.866025 0.866025 
C 1.095698 0.636353 1.224745 0.324806 1.224745 0 
C 1.224745 -0.324806 1.095698 -0.636353 0.866025 -0.866025 
C 0.636353 -1.095698 0.324806 -1.224745 0 -1.224745 
C -0.324806 -1.224745 -0.636353 -1.095698 -0.866025 -0.866025 
C -1.095698 -0.636353 -1.224745 -0.324806 -1.224745 0 
C -1.224745 0.324806 -1.095698 0.636353 -0.866025 0.866025 
C -0.636353 1.095698 -0.324806 1.224745 0 1.224745 
z
" style="stroke: #3b82f6; stroke-opacity: 0.7"/>
</defs>
<g clip-path="url(#sco-ch_gallery-pec9984a99a)">
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="29.460565" y="44.756383" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="21.255514" y="34.12411" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="38.154724" y="71.681038" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="48.658753" y="79.581687" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="59.897717" y="78.934734" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="43.778405" y="76.741247" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="33.375727" y="56.908061" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="29.729933" y="54.421605" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="53.814917" y="78.988178" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="67.730685" y="107.574139" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="46.339402" y="77.448477" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="22.685203" y="42.418495" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="27.005246" y="49.539453" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="67.184695" y="112.240868" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="45.241793" y="64.749" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="14.851141" y="48.792003" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="40.740897" y="81.439718" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="23.786209" y="60.248778" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="32.172036" y="46.973601" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="34.390962" y="64.137283" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="30.852367" y="66.096002" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="50.746552" y="93.761792" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="41.064593" y="64.416559" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="32.798013" y="69.529369" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="48.489015" y="92.286733" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="55.088793" y="80.594724" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="16.250692" y="49.519079" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="38.023291" y="68.454192" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="26.652149" y="50.260452" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="39.335887" y="71.484041" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="21.804273" y="44.460069" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="42.380354" y="56.261333" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="41.460379" y="75.018491" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="37.275584" y="77.55547" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="25.597059" y="68.565579" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="35.832982" y="64.338215" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="24.915397" y="51.715326" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="20.771" y="39.683019" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="45.585798" y="79.821441" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="24.632366" y="52.705981" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="60.435628" y="101.912386" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="53.309854" y="90.471029" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="10.678442" y="27.6755" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="46.329352" y="79.887042" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="24.752252" y="46.635008" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="42.574582" y="50.466336" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="42.740666" y="65.974365" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="10.825869" y="46.538434" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="38.389352" y="46.822254" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="38.038056" y="61.266052" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="57.164216" y="100.021511" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="23.500039" y="36.331638" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="53.646806" y="85.130595" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="24.795346" y="54.386776" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="36.852268" y="70.275167" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="28.855243" y="63.737631" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="64.808626" y="99.329776" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="50.979539" y="70.355821" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="80.247273" y="123.4355" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="52.137095" y="78.830377" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
</g>
</g>
<g id="sco-ch_gallery-matplotlib.axis_1"/>
<g id="sco-ch_gallery-matplotlib.axis_2"/>
<g id="sco-ch_gallery-patch_3">
<path d="M 7.2 128.2235 
L 7.2 22.8875 
" style="fill: none; stroke: #9ca3af; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sco-ch_gallery-patch_4">
<path d="M 7.2 128.2235 
L 83.725714 128.2235 
" style="fill: none; stroke: #9ca3af; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sco-ch_gallery-text_1">
<text style="font-size: 10px; text-anchor: middle" x="45.462857" y="16.8875" transform="rotate(-0 45.462857 16.8875)">r = -0.90</text>
</g>
</g>
<g id="sco-ch_gallery-axes_2">
<g id="sco-ch_gallery-patch_5">
<path d="M 99.030857 128.2235 
L 175.556571 128.2235 
L 175.556571 22.8875 
L 99.030857 22.8875 
L 99.030857 128.2235 
z
" style="fill: none"/>
</g>
<g id="sco-ch_gallery-PathCollection_2">
<g clip-path="url(#sco-ch_gallery-p9b44dddab9)">
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="121.291422" y="41.661299" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="113.086372" y="33.542521" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="129.985581" y="87.680365" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="140.48961" y="84.428212" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="151.728574" y="59.203061" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="135.609263" y="87.923304" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="125.206584" y="62.449025" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="121.56079" y="64.188901" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="145.645774" y="72.14655" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="159.561542" y="111.13397" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="138.170259" y="84.217503" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="114.51606" y="50.349832" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="118.836103" y="58.26357" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="159.015552" y="123.4355" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="137.07265" y="56.184531" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="106.681998" y="82.084883" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="132.571754" y="105.550035" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="115.617066" y="90.635749" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="124.002893" y="41.246591" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="126.22182" y="77.584327" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="122.683224" y="89.72013" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="142.577409" y="113.912933" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="132.895451" y="64.191058" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="124.62887" y="93.82493" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="140.319873" y="115.144645" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="146.91965" y="73.301491" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="108.081549" y="80.873538" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="129.854148" y="80.246704" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="118.483007" y="60.730339" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="131.166744" y="84.721059" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="113.63513" y="57.084213" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="134.211211" y="41.931916" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="133.291236" y="88.690589" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="129.106441" y="103.569621" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="117.427916" y="106.693557" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="127.663839" y="75.026279" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="116.746254" y="67.865916" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="112.601857" y="47.846401" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="137.416655" y="91.47548" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="116.463223" y="70.829413" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="152.266485" y="112.975039" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="145.140711" y="100.649033" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="102.509299" y="40.418232" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="138.160209" y="90.065649" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="116.583109" y="56.070184" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="134.405439" y="27.6755" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="134.571523" y="64.382152" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="102.656726" y="85.180763" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="130.220209" y="27.785752" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="129.868913" y="63.039473" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="148.995073" y="115.349279" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="115.330897" y="34.088463" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="145.477663" y="87.178098" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="116.626203" y="74.502305" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="128.683125" y="87.065154" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="120.6861" y="88.292501" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="156.639483" y="97.590447" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="142.810396" y="57.493287" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="172.07813" y="122.663767" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="143.967952" y="75.304467" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
</g>
</g>
<g id="sco-ch_gallery-matplotlib.axis_3"/>
<g id="sco-ch_gallery-matplotlib.axis_4"/>
<g id="sco-ch_gallery-patch_6">
<path d="M 99.030857 128.2235 
L 99.030857 22.8875 
" style="fill: none; stroke: #9ca3af; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sco-ch_gallery-patch_7">
<path d="M 99.030857 128.2235 
L 175.556571 128.2235 
" style="fill: none; stroke: #9ca3af; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sco-ch_gallery-text_2">
<text style="font-size: 10px; text-anchor: middle" x="137.293714" y="16.8875" transform="rotate(-0 137.293714 16.8875)">r = -0.50</text>
</g>
</g>
<g id="sco-ch_gallery-axes_3">
<g id="sco-ch_gallery-patch_8">
<path d="M 190.861714 128.2235 
L 267.387429 128.2235 
L 267.387429 22.8875 
L 190.861714 22.8875 
L 190.861714 128.2235 
z
" style="fill: none"/>
</g>
<g id="sco-ch_gallery-PathCollection_3">
<g clip-path="url(#sco-ch_gallery-p99fa611090)">
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="213.122279" y="53.146194" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="204.917229" y="51.694317" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="221.816438" y="93.251772" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="232.320467" y="81.045007" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="243.559431" y="45.56988" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="227.44012" y="88.761587" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="217.037442" y="71.272932" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="213.391648" y="76.139618" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="237.476631" y="64.039098" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="251.392399" y="92.495093" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="230.001116" y="82.782961" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="206.346917" y="67.813394" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="210.66696" y="72.328871" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="250.846409" y="105.63524" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="228.903507" y="54.813017" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="198.512855" y="107.128416" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="224.402611" y="109.491" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="207.447923" y="108.410288" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="215.833751" y="50.43304" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="218.052677" y="86.017944" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="214.514081" y="101.509945" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="234.408266" y="109.67665" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="224.726308" y="66.58706" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="216.459727" y="104.100876" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="232.15073" y="112.849282" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="238.750507" y="64.155722" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="199.912406" y="104.700033" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="221.685006" y="85.700264" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="210.313864" y="75.169161" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="222.997602" y="89.205759" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="205.465987" y="75.497504" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="226.042068" y="42.534136" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="225.122093" y="91.506499" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="220.937298" y="110.37083" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="209.258773" y="123.4355" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="219.494696" y="82.165638" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="208.577112" y="83.98824" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="204.432714" y="66.84658" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="229.247512" y="90.89944" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="208.29408" y="87.281474" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="244.097342" y="100.542305" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="236.971568" y="93.843998" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="194.340156" y="67.697666" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="229.991066" y="88.819453" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="208.413966" y="71.967228" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="226.236297" y="27.6755" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="226.40238" y="65.371152" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="194.487583" y="113.712702" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="222.051066" y="31.317168" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="221.69977" y="67.951336" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="240.82593" y="105.747274" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="207.161754" y="50.364983" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="237.30852" y="79.674691" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="208.45706" y="90.929947" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="220.513982" y="93.71557" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="212.516957" y="101.721922" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="248.47034" y="80.998215" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="234.641253" y="51.325277" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="263.908987" y="93.828406" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="235.798809" y="68.708499" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
</g>
</g>
<g id="sco-ch_gallery-matplotlib.axis_5"/>
<g id="sco-ch_gallery-matplotlib.axis_6"/>
<g id="sco-ch_gallery-patch_9">
<path d="M 190.861714 128.2235 
L 190.861714 22.8875 
" style="fill: none; stroke: #9ca3af; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sco-ch_gallery-patch_10">
<path d="M 190.861714 128.2235 
L 267.387429 128.2235 
" style="fill: none; stroke: #9ca3af; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sco-ch_gallery-text_3">
<text style="font-size: 10px; text-anchor: middle" x="229.124571" y="16.8875" transform="rotate(-0 229.124571 16.8875)">r = 0.00</text>
</g>
</g>
<g id="sco-ch_gallery-axes_4">
<g id="sco-ch_gallery-patch_11">
<path d="M 282.692571 128.2235 
L 359.218286 128.2235 
L 359.218286 22.8875 
L 282.692571 22.8875 
L 282.692571 128.2235 
z
" style="fill: none"/>
</g>
<g id="sco-ch_gallery-PathCollection_4">
<g clip-path="url(#sco-ch_gallery-pf2384a9e4f)">
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="304.953137" y="58.683134" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="296.748086" y="63.32233" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="313.647295" y="86.508322" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="324.151324" y="68.628648" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="335.390288" y="30.469756" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="319.270977" y="78.672007" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="308.868299" y="71.26973" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="305.222505" y="78.010243" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="329.307488" y="50.50189" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="343.223256" y="64.700647" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="321.831973" y="71.76384" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="298.177774" y="75.983225" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="302.497817" y="76.725029" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="342.677267" y="76.246474" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="320.734365" y="48.804709" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="290.343712" y="114.965296" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="316.233469" y="98.443607" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="299.27878" y="109.659358" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="307.664608" y="54.439451" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="309.883534" y="83.06073" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="306.344938" y="98.744709" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="326.239123" y="91.440911" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="316.557165" y="61.789392" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="308.290584" y="99.551882" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="323.981587" y="95.749814" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="330.581364" y="49.689278" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="291.743263" y="111.902207" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="313.515863" y="80.191654" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="302.144721" y="79.38893" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="314.828459" y="82.228258" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="297.296844" y="83.136935" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="317.872925" y="40.428481" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="316.95295" y="82.661092" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="312.768155" y="101.67039" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="301.08963" y="121.118866" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="311.325553" y="78.758434" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="300.407969" y="88.118601" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="296.263571" y="76.532316" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="321.078369" y="79.193485" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="300.124937" y="91.11688" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="335.928199" y="76.752717" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="328.802425" y="76.165688" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="286.171013" y="84.477321" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="321.821923" y="76.895609" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="300.244823" y="78.030319" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="318.067154" y="27.6755" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="318.233237" y="59.557728" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="286.31844" y="123.4355" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="313.881923" y="33.762089" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="313.530628" y="65.113438" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="332.656787" y="83.512492" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="298.992611" y="60.587575" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="329.139377" y="63.895764" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="300.287917" y="94.097557" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="312.344839" y="87.834125" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="304.347814" y="100.353855" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="340.301197" y="57.031667" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="326.47211" y="41.737776" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="355.739844" y="56.875353" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="327.629666" y="55.66659" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
</g>
</g>
<g id="sco-ch_gallery-matplotlib.axis_7"/>
<g id="sco-ch_gallery-matplotlib.axis_8"/>
<g id="sco-ch_gallery-patch_12">
<path d="M 282.692571 128.2235 
L 282.692571 22.8875 
" style="fill: none; stroke: #9ca3af; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sco-ch_gallery-patch_13">
<path d="M 282.692571 128.2235 
L 359.218286 128.2235 
" style="fill: none; stroke: #9ca3af; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sco-ch_gallery-text_4">
<text style="font-size: 10px; text-anchor: middle" x="320.955429" y="16.8875" transform="rotate(-0 320.955429 16.8875)">r = 0.50</text>
</g>
</g>
<g id="sco-ch_gallery-axes_5">
<g id="sco-ch_gallery-patch_14">
<path d="M 374.523429 128.2235 
L 451.049143 128.2235 
L 451.049143 22.8875 
L 374.523429 22.8875 
L 374.523429 128.2235 
z
" style="fill: none"/>
</g>
<g id="sco-ch_gallery-PathCollection_5">
<g clip-path="url(#sco-ch_gallery-p0b76ae49a9)">
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="396.783994" y="74.652651" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="388.578943" y="84.381982" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="405.478152" y="80.459111" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="415.982181" y="62.126293" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="427.221145" y="33.144694" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="411.101834" y="71.498602" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="400.699156" y="77.295149" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="397.053362" y="83.921411" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="421.138346" y="48.524872" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="435.054113" y="42.885678" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="413.66283" y="65.774237" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="390.008631" y="89.31654" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="394.328674" y="85.761369" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="434.508124" y="49.064241" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="412.565222" y="55.469322" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="382.174569" y="115.613484" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="408.064326" y="83.987035" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="391.109638" y="104.893501" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="399.495465" y="70.103248" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="401.714391" y="82.177629" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="398.175795" y="93.108771" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="418.06998" y="71.46035" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="408.388022" y="65.651328" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="400.121441" y="91.740467" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="415.812444" y="75.629924" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="422.412221" y="46.968886" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="383.57412" y="112.83572" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="405.34672" y="77.469187" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="393.975578" y="87.39302" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="406.659316" y="77.280507" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="389.127701" y="93.637159" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="409.703782" y="53.943035" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="408.783807" y="75.565648" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="404.599012" y="88.719986" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="392.920488" y="108.890819" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="403.15641" y="78.751363" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="392.238826" y="93.265992" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="388.094428" y="91.323892" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="412.909227" y="70.115133" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="391.955794" y="94.998649" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="427.759056" y="55.437988" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="420.633282" y="61.615454" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="378.00187" y="104.393264" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="413.65278" y="68.30932" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="392.07568" y="88.44838" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="409.898011" y="47.489498" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="410.064094" y="63.031875" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="378.149297" y="123.4355" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="405.71278" y="54.283406" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="405.361485" y="70.033979" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="424.487645" y="61.733992" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="390.823468" y="80.999044" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="420.970235" y="55.27017" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="392.118774" y="96.317901" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="404.175697" y="82.293636" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="396.178672" y="95.713152" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="432.132055" y="41.762522" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="418.302967" y="46.78401" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="447.570701" y="27.6755" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="419.460523" y="52.589615" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
</g>
</g>
<g id="sco-ch_gallery-matplotlib.axis_9"/>
<g id="sco-ch_gallery-matplotlib.axis_10"/>
<g id="sco-ch_gallery-patch_15">
<path d="M 374.523429 128.2235 
L 374.523429 22.8875 
" style="fill: none; stroke: #9ca3af; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sco-ch_gallery-patch_16">
<path d="M 374.523429 128.2235 
L 451.049143 128.2235 
" style="fill: none; stroke: #9ca3af; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sco-ch_gallery-text_5">
<text style="font-size: 10px; text-anchor: middle" x="412.786286" y="16.8875" transform="rotate(-0 412.786286 16.8875)">r = 0.90</text>
</g>
</g>
<g id="sco-ch_gallery-axes_6">
<g id="sco-ch_gallery-patch_17">
<path d="M 466.354286 128.2235 
L 542.88 128.2235 
L 542.88 22.8875 
L 466.354286 22.8875 
L 466.354286 128.2235 
z
" style="fill: none"/>
</g>
<g id="sco-ch_gallery-PathCollection_6">
<g clip-path="url(#sco-ch_gallery-pa5768dac63)">
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="488.614851" y="97.582311" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="480.4098" y="108.876387" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="497.30901" y="85.614988" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="507.813038" y="71.156419" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="519.052003" y="55.686226" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="502.932691" y="77.874112" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="492.530013" y="92.193174" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="488.884219" y="97.211531" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="512.969203" y="64.059069" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="526.88497" y="44.904314" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="505.493687" y="74.348955" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="481.839488" y="106.908452" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="486.159531" y="100.962005" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="526.338981" y="45.655857" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="504.396079" y="75.85979" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="474.005426" y="117.691869" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="499.895183" y="82.055176" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="482.940495" y="105.39294" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="491.326322" y="93.850029" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="493.545248" y="90.795725" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="490.006653" y="95.666526" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="509.900838" y="68.282608" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="500.218879" y="81.609615" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="491.952298" y="92.988386" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="507.643301" y="71.390058" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="514.243079" y="62.305606" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="475.404978" y="115.765417" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="497.177577" y="85.795902" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="485.806435" y="101.448035" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="498.490173" y="83.989142" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="480.958559" y="108.121032" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="501.534639" y="79.7985" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="500.614665" y="81.064825" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="496.42987" y="86.825106" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="484.751345" y="102.900344" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="494.987268" y="88.810816" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="484.069683" y="103.838637" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="479.925286" y="109.54331" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="504.740084" y="75.386274" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="483.786651" y="104.228223" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="519.589913" y="54.945803" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="512.46414" y="64.754278" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="469.832727" y="123.4355" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="505.483637" y="74.362789" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="483.906537" y="104.063203" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="501.728868" y="79.531148" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="501.894951" y="79.302538" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="469.980154" y="123.23257" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="497.543637" y="85.292028" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="497.192342" y="85.775579" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="516.318502" y="59.448831" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="482.654325" y="105.786846" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="512.801092" y="64.29047" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="483.949631" y="104.003885" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="496.006554" y="87.407791" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="488.009529" y="98.415524" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="523.962912" y="48.926465" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="510.133825" y="67.961906" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="539.401558" y="27.6755" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
<use xlink:href="#sco-ch_gallery-mb7c521647f" x="511.291381" y="66.368555" style="fill: #3b82f6; fill-opacity: 0.7; stroke: #3b82f6; stroke-opacity: 0.7"/>
</g>
</g>
<g id="sco-ch_gallery-matplotlib.axis_11"/>
<g id="sco-ch_gallery-matplotlib.axis_12"/>
<g id="sco-ch_gallery-patch_18">
<path d="M 466.354286 128.2235 
L 466.354286 22.8875 
" style="fill: none; stroke: #9ca3af; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sco-ch_gallery-patch_19">
<path d="M 466.354286 128.2235 
L 542.88 128.2235 
" style="fill: none; stroke: #9ca3af; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sco-ch_gallery-text_6">
<text style="font-size: 10px; text-anchor: middle" x="504.617143" y="16.8875" transform="rotate(-0 504.617143 16.8875)">r = 1.00</text>
</g>
</g>
</g>
<defs>
<clipPath id="sco-ch_gallery-pec9984a99a">
<rect x="7.2" y="22.8875" width="76.525714" height="105.336"/>
</clipPath>
<clipPath id="sco-ch_gallery-p9b44dddab9">
<rect x="99.030857" y="22.8875" width="76.525714" height="105.336"/>
</clipPath>
<clipPath id="sco-ch_gallery-p99fa611090">
<rect x="190.861714" y="22.8875" width="76.525714" height="105.336"/>
</clipPath>
<clipPath id="sco-ch_gallery-pf2384a9e4f">
<rect x="282.692571" y="22.8875" width="76.525714" height="105.336"/>
</clipPath>
<clipPath id="sco-ch_gallery-p0b76ae49a9">
<rect x="374.523429" y="22.8875" width="76.525714" height="105.336"/>
</clipPath>
<clipPath id="sco-ch_gallery-pa5768dac63">
<rect x="466.354286" y="22.8875" width="76.525714" height="105.336"/>
</clipPath>
</defs>
</svg><figcaption>What different values of r look like with 60 points each. The size of r is about how tightly points hug a line, not how steep the line is.</figcaption></figure>
  <p>There is a second way to see the same number that many people find more natural. Turn every value into a <strong>z-score</strong>, z = (value − average) ÷ standard deviation, which says how many standard deviations above or below average it is. Then r is simply the average of z<sub>x</sub> × z<sub>y</sub> over the students (again dividing by n − 1). A student far above average on both columns contributes a large positive product; a student who is average on either contributes almost nothing.</p>
  <div class="fx" data-lang="py">sx, sy = hours.std(ddof=1), score.std(ddof=1)        # sample standard deviations
cov = np.cov(hours, score)[0, 1]
print(f"sx = {sx:.3f}  sy = {sy:.3f}  r = {cov / (sx * sy):.4f}")
zx = (hours - hours.mean()) / sx                     # z-scores
zy = (score - score.mean()) / sy
print("z-products:", np.round(zx * zy, 3), " average:", round((zx * zy).sum() / 4, 4))
print("np.corrcoef      :", round(np.corrcoef(hours, score)[0, 1], 4))
print("minutes, /1000   :", round(np.corrcoef(hours * 60, score * 10)[0, 1], 4))
r = np.corrcoef(hours, score)[0, 1]
print(f"r^2 = {r**2:.3f}   slope = cov / var(x) = {cov / hours.var(ddof=1)}")</div>
  <div class="fx" data-lang="text">sx = 1.581  sy = 6.519  r = 0.9944
z-products: [1.552 0.485 0.    0.388 1.552]  average: 0.9944
np.corrcoef      : 0.9944
minutes, /1000   : 0.9944
r^2 = 0.989   slope = cov / var(x) = 4.1</div>
  <p>The first line repeats the hand calculation: 1.581, 6.519 and r = 0.9944. The z-product line shows where r comes from: students A and E, who are furthest from average on both columns, each contribute 1.552; C contributes 0; and the average of the five products is again 0.9944. <code>np.corrcoef</code> gives the same value, and the next line shows the point of all this: changing to minutes and marks out of 1000 leaves r untouched, unlike the covariance.</p>
  <p>The last line gives two useful relatives of r. The first is <strong>r²</strong> (r squared), which is the share of the variation in one column that a straight line in the other column explains. Here r² = 0.989, so a line in hours explains 98.9% of the differences between the students' scores. r² is a good antidote to over-excitement: r = 0.3 sounds respectable, but r² = 0.09 means the line explains only 9% of the variation. The second is the <strong>slope</strong> of the best-fitting line, cov ÷ var(x) = 10.25 ÷ 2.5 = 4.1, meaning each extra hour of study goes with about 4.1 more marks. This is exactly the least-squares slope you will meet in <a class="xref" data-note="ml_regression">Linear Regression</a>, and it can also be written as r × s_y ÷ sₓ.</p>
  <p>The slope and r answer different questions, and mixing them up is common. r says how reliably the points follow a line; the slope says how steep the line is. A line rising 0.01 marks per hour and a line rising 50 marks per hour can both have r = 1. A very strong r with a tiny slope can be useless in practice, so when the size of the effect matters, report the slope as well.</p>
  <p>In data work you meet r constantly: the correlation heatmap at the start of every exploratory notebook, checking whether two features are near-duplicates, checking whether an offline model metric tracks the online business metric, and inside PCA, which is built on the correlation or covariance matrix. Its big limitation is in its definition: it measures straight-line co-movement and nothing else. The next sections show what happens when that is not enough.</p>

  <h2 id="sco-sig"><span class="num">03</span>Testing a Correlation</h2>
  <p>An r of 0.994 looks convincing, but it comes from only five students. With so few points, could two completely unrelated columns produce a large r just by luck? This is a real worry, and it is easy to measure. The code below generates pairs of columns of pure random noise, where the true correlation is exactly zero, and counts how often the sample r still looks big:</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(3)
for n in [5, 30, 300]:
    rs = np.array([np.corrcoef(rng.normal(size=n), rng.normal(size=n))[0, 1] for _ in range(10000)])
    print(f"n = {n:3d}: share of pure-noise samples with |r| &gt; 0.8 = {np.mean(abs(rs) &gt; 0.8):.4f}, "
          f"|r| &gt; 0.3 = {np.mean(abs(rs) &gt; 0.3):.4f}")</div>
  <div class="fx" data-lang="text">n =   5: share of pure-noise samples with |r| &gt; 0.8 = 0.0984, |r| &gt; 0.3 = 0.6230
n =  30: share of pure-noise samples with |r| &gt; 0.8 = 0.0000, |r| &gt; 0.3 = 0.1069
n = 300: share of pure-noise samples with |r| &gt; 0.8 = 0.0000, |r| &gt; 0.3 = 0.0000</div>
  <p>With 5 points, pure noise gave |r| above 0.8 in almost 10% of samples, and above 0.3 in 62% of them. With 30 points, |r| above 0.8 never happened, and with 300 points even 0.3 never happened. Small samples make big correlations cheap. It is like two strangers discovering they both like chai, cricket and old film songs: with only three questions, matching on all three is quite likely by coincidence, but matching on three hundred questions would not be. A correlation on five points is a three-question match.</p>
  <p>So we need a way to ask: "if the true correlation in the whole population were zero, how surprising would our sample r be?" That is the logic of a <strong>hypothesis test</strong>, which the next note, <a class="xref" data-note="st_hypothesis">Hypothesis Testing</a>, builds in full. For a correlation, the recipe is to convert r into a <strong>t-statistic</strong>:</p>
  <div class="fx" data-lang="text">t = r × √(n − 2) ÷ √(1 − r²)

  = 0.994 × √3 ÷ √(1 − 0.989)
  = 1.722 ÷ 0.105 ≈ 16.3      (with n − 2 = 3 degrees of freedom)</div>
  <p>The formula makes sense if you read its parts. The top grows with r and with the sample size n, because a strong correlation on many points is harder to get by luck. The bottom, √(1 − r²), shrinks as r gets close to ±1, which makes t bigger still. Statisticians have worked out that if the true correlation is zero (and the data is roughly normal), this t follows a known curve, the <strong>t-distribution</strong> with n − 2 degrees of freedom, which you met in <a class="xref" data-note="st_distributions">Probability Distributions</a>. "Degrees of freedom" here is n minus the two averages we had to estimate. For 3 degrees of freedom, 95% of the curve lies between −3.18 and +3.18, and our 16.3 is far outside, so luck alone very rarely gives a correlation this strong. The <strong>p-value</strong> puts a number on "very rarely": it is the probability of getting a |t| at least this large if the true correlation were zero.</p>
  <div class="fx" data-lang="py">r, n = np.corrcoef(hours, score)[0, 1], len(hours)
t = r * np.sqrt(n - 2) / np.sqrt(1 - r**2)
print(f"t = {t:.2f} on {n - 2} df, two-sided p = {2 * stats.t.sf(abs(t), n - 2):.5f}")
res = stats.pearsonr(hours, score)
ci = res.confidence_interval(0.95)
print(f"pearsonr: r = {res.statistic:.4f}, p = {res.pvalue:.5f}, 95% CI {ci.low:.3f} to {ci.high:.3f}")</div>
  <div class="fx" data-lang="text">t = 16.29 on 3 df, two-sided p = 0.00050
pearsonr: r = 0.9944, p = 0.00050, 95% CI 0.914 to 1.000</div>
  <p>The hand formula and <code>scipy.stats.pearsonr</code> agree: t = 16.29, p = 0.0005, so if hours and score were truly unrelated, only about 5 groups of five students in 10,000 would show a correlation this strong. <code>pearsonr</code> also gives a 95% <strong>confidence interval</strong> for the true correlation, 0.914 to 1.000: a range of plausible values for the population correlation given our five points. (It is built with Fisher's z-transformation, a trick that stretches r so that its sampling distribution becomes roughly normal.) The interval is wide even though r is huge, which is the honest message from n = 5.</p>
  <p>The opposite problem appears with big data. When n is large, even a tiny correlation becomes "statistically significant", because significance only says the correlation is probably not exactly zero; it says nothing about whether it is big enough to matter:</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(7)
x = rng.normal(size=10000)
y = 0.05 * x + rng.normal(size=10000)              # a very weak real link
res = stats.pearsonr(x, y)
print(f"r = {res.statistic:.3f}, r^2 = {res.statistic**2:.4f}, p = {res.pvalue:.6f}")</div>
  <div class="fx" data-lang="text">r = 0.038, r^2 = 0.0014, p = 0.000141</div>
  <p>With 10,000 rows, r = 0.038 has p = 0.00014, comfortably "significant", yet r² = 0.0014 means x explains about 0.1% of y. Significance is about how sure we are that r is not zero; strength is about how big r is. Always report r (or r²) and its confidence interval, not just the p-value.</p>

  <h2 id="sco-rank"><span class="num">04</span>Spearman and Kendall</h2>
  <p>Pearson's r uses the raw values and only looks for straight lines. Two very ordinary situations break it. First, many relationships always rise but bend: every extra hour of study helps, but each one helps a little less than the one before. Second, real data has mistakes: a student who studied 5.0 hours gets typed in as 50. Both are shown below, using a twenty-student version of the class for the curve and a sixth student F for the typo:</p>
  <div class="fx" data-lang="py">h6 = np.append(hours, 50)        # student F studied 5.0 hours, typed as 50
s6 = np.append(score, 66)
print("typo : pearson = %.3f  spearman = %.3f" % (stats.pearsonr(h6, s6)[0], stats.spearmanr(h6, s6)[0]))
h = np.arange(1, 21) / 2                     # 20 students, 0.5 to 10 hours
s = 100 - 60 * np.exp(-h / 2)                # every extra hour helps, but less and less
print("curve: pearson = %.3f  spearman = %.3f" % (stats.pearsonr(h, s)[0], stats.spearmanr(h, s)[0]))</div>
  <div class="fx" data-lang="text">typo : pearson = 0.454  spearman = 0.943
curve: pearson = 0.860  spearman = 1.000</div>
  <p>One typo collapses Pearson from 0.994 to 0.454. The point at 50 hours sits far to the right with an ordinary score, so the best straight line through the six points is pulled almost flat. On the curve, the score goes up every single time hours go up, yet Pearson reports only 0.86, because a curve is not a line.</p>
  <figure class="viz"><svg fill="currentColor" style="max-width:680px;width:100%;height:auto" xmlns:xlink="http://www.w3.org/1999/xlink"  viewBox="0 0 597.590937 223.2" xmlns="http://www.w3.org/2000/svg" version="1.1">
<defs>
</defs>
<g id="sco-ch_rank-figure_1">
<g id="sco-ch_rank-patch_1">
<path d="M 0 223.2 
L 597.590937 223.2 
L 597.590937 0 
L 0 0 
L 0 223.2 
z
" style="fill: none"/>
</g>
<g id="sco-ch_rank-axes_1">
<g id="sco-ch_rank-patch_2">
<path d="M 46.985547 180.800781 
L 299.196367 180.800781 
L 299.196367 33.897754 
L 46.985547 33.897754 
L 46.985547 180.800781 
z
" style="fill: none"/>
</g>
<g id="sco-ch_rank-PathCollection_1">
<defs>
<path id="sco-ch_rank-mfd6f193657" d="M 0 2.12132 
C 0.562581 2.12132 1.102195 1.897805 1.5 1.5 
C 1.897805 1.102195 2.12132 0.562581 2.12132 0 
C 2.12132 -0.562581 1.897805 -1.102195 1.5 -1.5 
C 1.102195 -1.897805 0.562581 -2.12132 0 -2.12132 
C -0.562581 -2.12132 -1.102195 -1.897805 -1.5 -1.5 
C -1.897805 -1.102195 -2.12132 -0.562581 -2.12132 0 
C -2.12132 0.562581 -1.897805 1.102195 -1.5 1.5 
C -1.102195 1.897805 -0.562581 2.12132 0 2.12132 
z
" style="stroke: #3b82f6"/>
</defs>
<g clip-path="url(#sco-ch_rank-p8e777e41a3)">
<use xlink:href="#sco-ch_rank-mfd6f193657" x="58.449675" y="174.123371" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_rank-mfd6f193657" x="70.517178" y="144.324804" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_rank-mfd6f193657" x="82.584682" y="121.117657" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_rank-mfd6f193657" x="94.652185" y="103.043912" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_rank-mfd6f193657" x="106.719689" y="88.968066" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_rank-mfd6f193657" x="118.787192" y="78.005786" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_rank-mfd6f193657" x="130.854695" y="69.468354" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_rank-mfd6f193657" x="142.922199" y="62.819395" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_rank-mfd6f193657" x="154.989702" y="57.64118" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_rank-mfd6f193657" x="167.057205" y="53.608383" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_rank-mfd6f193657" x="179.124709" y="50.467637" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_rank-mfd6f193657" x="191.192212" y="48.021622" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_rank-mfd6f193657" x="203.259715" y="46.116663" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_rank-mfd6f193657" x="215.327219" y="44.63308" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_rank-mfd6f193657" x="227.394722" y="43.477664" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_rank-mfd6f193657" x="239.462226" y="42.577825" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_rank-mfd6f193657" x="251.529729" y="41.87703" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_rank-mfd6f193657" x="263.597232" y="41.33125" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_rank-mfd6f193657" x="275.664736" y="40.906196" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_rank-mfd6f193657" x="287.732239" y="40.575164" style="fill: #3b82f6; stroke: #3b82f6"/>
</g>
</g>
<g id="sco-ch_rank-matplotlib.axis_1">
<g id="sco-ch_rank-xtick_1">
<g id="sco-ch_rank-line2d_1">
<defs>
<path id="sco-ch_rank-m7c25c535dc" d="M 0 0 
L 0 3.5 
" style="stroke: currentColor; stroke-width: 0.8"/>
</defs>
<g>
<use xlink:href="#sco-ch_rank-m7c25c535dc" x="94.652185" y="180.800781" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_rank-text_1">
<text style="font-size: 10px; text-anchor: middle" x="94.652185" y="197.488281" transform="rotate(-0 94.652185 197.488281)">2</text>
</g>
</g>
<g id="sco-ch_rank-xtick_2">
<g id="sco-ch_rank-line2d_2">
<g>
<use xlink:href="#sco-ch_rank-m7c25c535dc" x="142.922199" y="180.800781" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_rank-text_2">
<text style="font-size: 10px; text-anchor: middle" x="142.922199" y="197.488281" transform="rotate(-0 142.922199 197.488281)">4</text>
</g>
</g>
<g id="sco-ch_rank-xtick_3">
<g id="sco-ch_rank-line2d_3">
<g>
<use xlink:href="#sco-ch_rank-m7c25c535dc" x="191.192212" y="180.800781" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_rank-text_3">
<text style="font-size: 10px; text-anchor: middle" x="191.192212" y="197.488281" transform="rotate(-0 191.192212 197.488281)">6</text>
</g>
</g>
<g id="sco-ch_rank-xtick_4">
<g id="sco-ch_rank-line2d_4">
<g>
<use xlink:href="#sco-ch_rank-m7c25c535dc" x="239.462226" y="180.800781" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_rank-text_4">
<text style="font-size: 10px; text-anchor: middle" x="239.462226" y="197.488281" transform="rotate(-0 239.462226 197.488281)">8</text>
</g>
</g>
<g id="sco-ch_rank-xtick_5">
<g id="sco-ch_rank-line2d_5">
<g>
<use xlink:href="#sco-ch_rank-m7c25c535dc" x="287.732239" y="180.800781" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_rank-text_5">
<text style="font-size: 10px; text-anchor: middle" x="287.732239" y="197.488281" transform="rotate(-0 287.732239 197.488281)">10</text>
</g>
</g>
<g id="sco-ch_rank-text_6">
<text style="font-size: 10px; text-anchor: middle" x="173.090957" y="213.587891" transform="rotate(-0 173.090957 213.587891)">hours</text>
</g>
</g>
<g id="sco-ch_rank-matplotlib.axis_2">
<g id="sco-ch_rank-ytick_1">
<g id="sco-ch_rank-line2d_6">
<defs>
<path id="sco-ch_rank-mb258c49b38" d="M 0 0 
L -3.5 0 
" style="stroke: currentColor; stroke-width: 0.8"/>
</defs>
<g>
<use xlink:href="#sco-ch_rank-mb258c49b38" x="46.985547" y="154.72688" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_rank-text_7">
<text style="font-size: 10px; text-anchor: end" x="39.985547" y="159.57063" transform="rotate(-0 39.985547 159.57063)">60</text>
</g>
</g>
<g id="sco-ch_rank-ytick_2">
<g id="sco-ch_rank-line2d_7">
<g>
<use xlink:href="#sco-ch_rank-mb258c49b38" x="46.985547" y="125.897575" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_rank-text_8">
<text style="font-size: 10px; text-anchor: end" x="39.985547" y="130.741325" transform="rotate(-0 39.985547 130.741325)">70</text>
</g>
</g>
<g id="sco-ch_rank-ytick_3">
<g id="sco-ch_rank-line2d_8">
<g>
<use xlink:href="#sco-ch_rank-mb258c49b38" x="46.985547" y="97.068271" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_rank-text_9">
<text style="font-size: 10px; text-anchor: end" x="39.985547" y="101.912021" transform="rotate(-0 39.985547 101.912021)">80</text>
</g>
</g>
<g id="sco-ch_rank-ytick_4">
<g id="sco-ch_rank-line2d_9">
<g>
<use xlink:href="#sco-ch_rank-mb258c49b38" x="46.985547" y="68.238967" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_rank-text_10">
<text style="font-size: 10px; text-anchor: end" x="39.985547" y="73.082717" transform="rotate(-0 39.985547 73.082717)">90</text>
</g>
</g>
<g id="sco-ch_rank-ytick_5">
<g id="sco-ch_rank-line2d_10">
<g>
<use xlink:href="#sco-ch_rank-mb258c49b38" x="46.985547" y="39.409662" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_rank-text_11">
<text style="font-size: 10px; text-anchor: end" x="39.985547" y="44.253412" transform="rotate(-0 39.985547 44.253412)">100</text>
</g>
</g>
<g id="sco-ch_rank-text_12">
<text style="font-size: 10px; text-anchor: middle" x="16.8875" y="107.349268" transform="rotate(-90 16.8875 107.349268)">score</text>
</g>
</g>
<g id="sco-ch_rank-patch_3">
<path d="M 46.985547 180.800781 
L 46.985547 33.897754 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sco-ch_rank-patch_4">
<path d="M 46.985547 180.800781 
L 299.196367 180.800781 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sco-ch_rank-text_13">
<text style="font-size: 9.5px; " transform="translate(117.547871 16.403125)">Curved but always rising</text>
<text style="font-size: 9.5px; " transform="translate(107.300488 27.897754)">Pearson 0.86, Spearman 1.00</text>
</g>
</g>
<g id="sco-ch_rank-axes_2">
<g id="sco-ch_rank-patch_5">
<path d="M 338.180117 180.800781 
L 590.390937 180.800781 
L 590.390937 33.897754 
L 338.180117 33.897754 
L 338.180117 180.800781 
z
" style="fill: none"/>
</g>
<g id="sco-ch_rank-PathCollection_2">
<defs>
<path id="sco-ch_rank-m4c5352e764" d="M 0 2.738613 
C 0.726289 2.738613 1.422928 2.450055 1.936492 1.936492 
C 2.450055 1.422928 2.738613 0.726289 2.738613 0 
C 2.738613 -0.726289 2.450055 -1.422928 1.936492 -1.936492 
C 1.422928 -2.450055 0.726289 -2.738613 0 -2.738613 
C -0.726289 -2.738613 -1.422928 -2.450055 -1.936492 -1.936492 
C -2.450055 -1.422928 -2.738613 -0.726289 -2.738613 0 
C -2.738613 0.726289 -2.450055 1.422928 -1.936492 1.936492 
C -1.422928 2.450055 -0.726289 2.738613 0 2.738613 
z
" style="stroke: #3b82f6"/>
</defs>
<g clip-path="url(#sco-ch_rank-p6de664bc73)">
<use xlink:href="#sco-ch_rank-m4c5352e764" x="354.053525" y="174.123371" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_rank-m4c5352e764" x="358.462806" y="149.083082" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_rank-m4c5352e764" x="362.872086" y="99.002505" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_rank-m4c5352e764" x="367.281366" y="73.962216" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_rank-m4c5352e764" x="371.690646" y="40.575164" style="fill: #3b82f6; stroke: #3b82f6"/>
</g>
</g>
<g id="sco-ch_rank-PathCollection_3">
<defs>
<path id="sco-ch_rank-m459bb7e77c" d="M 0 3.162278 
C 0.838646 3.162278 1.643056 2.82908 2.236068 2.236068 
C 2.82908 1.643056 3.162278 0.838646 3.162278 0 
C 3.162278 -0.838646 2.82908 -1.643056 2.236068 -2.236068 
C 1.643056 -2.82908 0.838646 -3.162278 0 -3.162278 
C -0.838646 -3.162278 -1.643056 -2.82908 -2.236068 -2.236068 
C -2.82908 -1.643056 -3.162278 -0.838646 -3.162278 0 
C -3.162278 0.838646 -2.82908 1.643056 -2.236068 2.236068 
C -1.643056 2.82908 -0.838646 3.162278 0 3.162278 
z
" style="stroke: #ef4444"/>
</defs>
<g clip-path="url(#sco-ch_rank-p6de664bc73)">
<use xlink:href="#sco-ch_rank-m459bb7e77c" x="570.108249" y="57.26869" style="fill: #ef4444; stroke: #ef4444"/>
</g>
</g>
<g id="sco-ch_rank-matplotlib.axis_3">
<g id="sco-ch_rank-xtick_6">
<g id="sco-ch_rank-line2d_11">
<g>
<use xlink:href="#sco-ch_rank-m7c25c535dc" x="349.644245" y="180.800781" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_rank-text_14">
<text style="font-size: 10px; text-anchor: middle" x="349.644245" y="197.488281" transform="rotate(-0 349.644245 197.488281)">0</text>
</g>
</g>
<g id="sco-ch_rank-xtick_7">
<g id="sco-ch_rank-line2d_12">
<g>
<use xlink:href="#sco-ch_rank-m7c25c535dc" x="393.737046" y="180.800781" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_rank-text_15">
<text style="font-size: 10px; text-anchor: middle" x="393.737046" y="197.488281" transform="rotate(-0 393.737046 197.488281)">10</text>
</g>
</g>
<g id="sco-ch_rank-xtick_8">
<g id="sco-ch_rank-line2d_13">
<g>
<use xlink:href="#sco-ch_rank-m7c25c535dc" x="437.829847" y="180.800781" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_rank-text_16">
<text style="font-size: 10px; text-anchor: middle" x="437.829847" y="197.488281" transform="rotate(-0 437.829847 197.488281)">20</text>
</g>
</g>
<g id="sco-ch_rank-xtick_9">
<g id="sco-ch_rank-line2d_14">
<g>
<use xlink:href="#sco-ch_rank-m7c25c535dc" x="481.922648" y="180.800781" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_rank-text_17">
<text style="font-size: 10px; text-anchor: middle" x="481.922648" y="197.488281" transform="rotate(-0 481.922648 197.488281)">30</text>
</g>
</g>
<g id="sco-ch_rank-xtick_10">
<g id="sco-ch_rank-line2d_15">
<g>
<use xlink:href="#sco-ch_rank-m7c25c535dc" x="526.015448" y="180.800781" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_rank-text_18">
<text style="font-size: 10px; text-anchor: middle" x="526.015448" y="197.488281" transform="rotate(-0 526.015448 197.488281)">40</text>
</g>
</g>
<g id="sco-ch_rank-xtick_11">
<g id="sco-ch_rank-line2d_16">
<g>
<use xlink:href="#sco-ch_rank-m7c25c535dc" x="570.108249" y="180.800781" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_rank-text_19">
<text style="font-size: 10px; text-anchor: middle" x="570.108249" y="197.488281" transform="rotate(-0 570.108249 197.488281)">50</text>
</g>
</g>
<g id="sco-ch_rank-text_20">
<text style="font-size: 10px; text-anchor: middle" x="464.285527" y="213.587891" transform="rotate(-0 464.285527 213.587891)">hours (as recorded)</text>
</g>
</g>
<g id="sco-ch_rank-matplotlib.axis_4">
<g id="sco-ch_rank-ytick_6">
<g id="sco-ch_rank-line2d_17">
<g>
<use xlink:href="#sco-ch_rank-mb258c49b38" x="338.180117" y="149.083082" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_rank-text_21">
<text style="font-size: 10px; text-anchor: end" x="331.180117" y="153.926832" transform="rotate(-0 331.180117 153.926832)">55</text>
</g>
</g>
<g id="sco-ch_rank-ytick_7">
<g id="sco-ch_rank-line2d_18">
<g>
<use xlink:href="#sco-ch_rank-mb258c49b38" x="338.180117" y="107.349268" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_rank-text_22">
<text style="font-size: 10px; text-anchor: end" x="331.180117" y="112.193018" transform="rotate(-0 331.180117 112.193018)">60</text>
</g>
</g>
<g id="sco-ch_rank-ytick_8">
<g id="sco-ch_rank-line2d_19">
<g>
<use xlink:href="#sco-ch_rank-mb258c49b38" x="338.180117" y="65.615453" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_rank-text_23">
<text style="font-size: 10px; text-anchor: end" x="331.180117" y="70.459203" transform="rotate(-0 331.180117 70.459203)">65</text>
</g>
</g>
</g>
<g id="sco-ch_rank-line2d_20">
<path d="M 349.644245 112.486604 
L 578.926809 47.762926 
" clip-path="url(#sco-ch_rank-p6de664bc73)" style="fill: none; stroke-dasharray: 3.7,1.6; stroke-dashoffset: 0; stroke: #ef4444"/>
</g>
<g id="sco-ch_rank-patch_6">
<path d="M 338.180117 180.800781 
L 338.180117 33.897754 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sco-ch_rank-patch_7">
<path d="M 338.180117 180.800781 
L 590.390937 180.800781 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sco-ch_rank-patch_8">
<path d="M 491.294144 137.424526 
Q 530.000076 98.059664 568.078913 59.332573 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linecap: round"/>
<path d="M 564.482943 60.565048 
L 568.078913 59.332573 
L 566.907311 62.948835 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linecap: round"/>
</g>
<g id="sco-ch_rank-text_24">
<text style="font-size: 8.5px; text-anchor: start" x="446.648407" y="149.083082" transform="rotate(-0 446.648407 149.083082)">F: 5.0 typed as 50</text>
</g>
<g id="sco-ch_rank-text_25">
<text style="font-size: 9.5px; " transform="translate(443.668301 16.403125)">One typo</text>
<text style="font-size: 9.5px; " transform="translate(397.231113 27.897754)">Pearson 0.45, Spearman 0.94</text>
</g>
</g>
</g>
<defs>
<clipPath id="sco-ch_rank-p8e777e41a3">
<rect x="46.985547" y="33.897754" width="252.21082" height="146.903027"/>
</clipPath>
<clipPath id="sco-ch_rank-p6de664bc73">
<rect x="338.180117" y="33.897754" width="252.21082" height="146.903027"/>
</clipPath>
</defs>
</svg><figcaption>Left: the relationship never turns back, so Spearman is exactly 1 while Pearson under-reports. Right: one mistyped value (red) drags the straight line (dashed) almost flat; Spearman barely notices.</figcaption></figure>
  <p>The fix is to stop using the values and use their order instead. Replace each value by its <strong>rank</strong>: 1 for the smallest, 2 for the next, and so on. Then compute Pearson's r on the ranks. This is <strong>Spearman's rank correlation</strong>, written ρ (the Greek letter "rho"). Ranks only care about order, so any relationship that always goes up becomes a perfect straight line of ranks, and an outlier can only ever be "the largest", never "ten times bigger than the rest". Spearman measures whether a relationship is <strong>monotonic</strong>, meaning it always moves in one direction and never turns back, whether or not it is straight.</p>
  <p>Picture two judges at a cooking contest. One marks out of 10, the other out of 100 and is very generous at the top. Their raw marks look nothing alike, but if both put the same dishes first, second and third, they completely agree. Pearson asks "do they agree on the marks?"; Spearman asks "do they agree on the order?".</p>
  <p>Let us compute it by hand on mock-test score against final score. Mock scores 40, 58, 50, 66, 70 have ranks 1, 3, 2, 4, 5. Final scores 52, 55, 61, 64, 68 have ranks 1, 2, 3, 4, 5. Only students B and C swap places. When there are no tied values there is a shortcut formula based on the rank differences d:</p>
  <div class="fx" data-lang="text">d   = 0, 1, −1, 0, 0        Σd² = 2

ρ = 1 − 6 Σd² ÷ (n(n² − 1)) = 1 − 6×2 ÷ (5×24) = 1 − 12/120 = 0.9</div>
  <p>The formula subtracts a penalty for every rank disagreement: if all the ranks match, Σd² = 0 and ρ = 1; the more they disagree, the bigger the penalty. The 6 and n(n² − 1) are just the numbers that scale the penalty so that a perfectly reversed order gives exactly −1.</p>
  <p>A close cousin is <strong>Kendall's tau</strong> (τ), which counts pairs of students. Take every possible pair; with 5 students there are 10 pairs. A pair is <strong>concordant</strong> if the student with the higher mock score also has the higher final score, and <strong>discordant</strong> if the order is reversed. Here only the pair (B, C) is discordant: B had the higher mock (58 against 50) but the lower final (55 against 61). So there are 9 concordant and 1 discordant pairs, and τ = (concordant − discordant) ÷ total pairs = (9 − 1) ÷ 10 = 0.8. Kendall's τ has a very plain meaning: "pick two students at random; τ is how much more likely their orders agree than disagree".</p>
  <div class="fx" data-lang="py">mock = df.mock.values
print("ranks of mock :", stats.rankdata(mock))
print("ranks of score:", stats.rankdata(score))
print("spearman:", round(stats.spearmanr(mock, score).statistic, 3))
print("kendall :", round(stats.kendalltau(mock, score).statistic, 3))
print("pearson :", round(stats.pearsonr(mock, score).statistic, 3))</div>
  <div class="fx" data-lang="text">ranks of mock : [1. 3. 2. 4. 5.]
ranks of score: [1. 2. 3. 4. 5.]
spearman: 0.9
kendall : 0.8
pearson : 0.834</div>
  <p><code>stats.rankdata</code> produces the ranks we wrote down, and SciPy's <code>spearmanr</code> and <code>kendalltau</code> match the hand values 0.9 and 0.8. Pearson on the raw values is lower, 0.834, because it also uses the sizes: B's mock score of 58 is well above C's 50, while B's final is below. Going back to the typo and curve examples, Spearman stayed at 0.943 with the typo (50 hours is simply "rank 6", one place above student E) and was exactly 1.000 on the curve, because the order never breaks.</p>
  <table class="tbl">
    <tr><th></th><th>Pearson r</th><th>Spearman ρ</th><th>Kendall τ</th></tr>
    <tr><td>Uses</td><td>raw values</td><td>ranks</td><td>pairs of ranks</td></tr>
    <tr><td>Measures</td><td>straight-line relationship</td><td>monotonic relationship</td><td>share of agreeing pairs</td></tr>
    <tr><td>Outliers</td><td>very sensitive</td><td>robust</td><td>robust</td></tr>
    <tr><td>Best for</td><td>clean numeric data, roughly linear</td><td>curves, skewed data, ratings</td><td>small samples, many ties</td></tr>
  </table>
  <p>Kendall's τ is usually smaller than Spearman's ρ on the same data (0.8 against 0.9 here), so do not compare a τ from one study with a ρ from another. In pandas, <code>df.corr(method="spearman")</code> or <code>method="kendall"</code> switches the whole correlation table to ranks. A useful habit: compute both Pearson and Spearman. When they roughly agree, the relationship is close to a line. When they disagree a lot, that disagreement is itself the finding: there is a curve or an outlier, and you should look at the data.</p>

  <h2 id="sco-blind"><span class="num">05</span>What r Cannot See</h2>
  <p>Ranks fix curves and typos as long as the relationship keeps going in one direction. But some relationships go up and then come down. Look at stress against score. Sorted by stress, the scores are 52 (stress 1), 64 (stress 2), 68 (stress 3), 61 (stress 4), 55 (stress 5): they rise up to moderate stress and then fall. A little pressure helps; too much hurts. That is a clear and strong pattern. Now compute r by hand: the stress deviations from their average of 3 are −2, +2, +1, −1, 0 for students A to E, the score deviations are −8, −5, +1, +4, +8, the products are 16, −10, 1, −4, 0, and the sum is just 3. Then r = 3 ÷ √(10 × 170) = 3 ÷ 41.2 = 0.07. The rising half and the falling half cancel each other out.</p>
  <p>In practice you check all pairs at once with the <strong>correlation matrix</strong>: <code>df.corr()</code> computes r for every pair of columns and lays them out as a table.</p>
  <div class="fx" data-lang="py">print(df.corr().round(2) + 0.0)              # + 0.0 turns -0.0 into 0.0
print("stress vs score: r =", round(np.corrcoef(df.stress, score)[0, 1], 3))
print("mean score by stress:", df.groupby("stress").score.mean().to_dict())</div>
  <div class="fx" data-lang="text">        hours  score  phone  mock  stress  tests
hours    1.00   0.99  -0.96  0.89    0.10   0.96
score    0.99   1.00  -0.93  0.83    0.07   0.93
phone   -0.96  -0.93   1.00 -0.94    0.00  -0.99
mock     0.89   0.83  -0.94  1.00    0.26   0.95
stress   0.10   0.07   0.00  0.26    1.00   0.00
tests    0.96   0.93  -0.99  0.95    0.00   1.00
stress vs score: r = 0.073
mean score by stress: {1: 52.0, 2: 64.0, 3: 68.0, 4: 61.0, 5: 55.0}</div>
  <p>The matrix is symmetric (the hours–score entry equals the score–hours entry) and has 1s on the diagonal, because every column correlates perfectly with itself. Hours and score are 0.99. Phone hours are strongly negative with score (−0.93): more phone time goes with lower scores. Hours and practice tests are 0.96, almost copies of each other, which will matter in the multicollinearity section. And stress against score shows 0.07, while the group averages underneath clearly rise from 52 to 68 and fall back to 55. Spearman would not help either: the pattern is not monotonic, so its ranks also cancel.</p>
  <p>The lesson is that <strong>r = 0 does not mean the variables are unrelated</strong>. It means there is no straight-line relationship. Two variables are <strong>independent</strong> when knowing one tells you nothing at all about the other. Independent variables always have r close to 0, but r = 0 can hide a strong curved, U-shaped or cyclical relationship. The cleanest example is y = x² for x = −2, −1, 0, 1, 2: y is completely determined by x, yet r is exactly 0 (you will see it in Common Mistakes).</p>
  <p>The statistician Francis Anscombe made the same point more dramatically in 1973. He built four small datasets, now called <strong>Anscombe's quartet</strong>, that share the same average, the same variance, the same correlation and the same best-fitting line, yet look completely different when plotted:</p>
  <div class="fx" data-lang="py">x = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5]
x4 = [8, 8, 8, 8, 8, 8, 8, 19, 8, 8, 8]
sets = {"I":   (x,  [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68]),
        "II":  (x,  [9.14, 8.14, 8.74, 8.77, 9.26, 8.10, 6.13, 3.10, 9.13, 7.26, 4.74]),
        "III": (x,  [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73]),
        "IV":  (x4, [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.50, 5.56, 7.91, 6.89])}
for name, (xx, yy) in sets.items():
    slope, icpt = np.polyfit(xx, yy, 1)            # best straight line
    print(f"{name:3s} mean_y={np.mean(yy):.2f} var_y={np.var(yy, ddof=1):.2f} "
          f"r={np.corrcoef(xx, yy)[0, 1]:.3f} line: y = {icpt:.2f} + {slope:.3f}x")</div>
  <div class="fx" data-lang="text">I   mean_y=7.50 var_y=4.13 r=0.816 line: y = 3.00 + 0.500x
II  mean_y=7.50 var_y=4.13 r=0.816 line: y = 3.00 + 0.500x
III mean_y=7.50 var_y=4.12 r=0.816 line: y = 3.00 + 0.500x
IV  mean_y=7.50 var_y=4.12 r=0.817 line: y = 3.00 + 0.500x</div>
  <p><code>np.polyfit(xx, yy, 1)</code> fits a straight line and returns its slope and intercept. All four datasets print an average of 7.50, a variance of about 4.12, r = 0.816 and the line y = 3 + 0.5x. Now look at them:</p>
  <figure class="viz"><svg fill="currentColor" style="max-width:680px;width:100%;height:auto" xmlns:xlink="http://www.w3.org/1999/xlink"  viewBox="0 0 683.996094 172.8" xmlns="http://www.w3.org/2000/svg" version="1.1">
<defs>
</defs>
<g id="sco-ch_ansc-figure_1">
<g id="sco-ch_ansc-patch_1">
<path d="M 0 172.8 
L 683.996094 172.8 
L 683.996094 0 
L 0 0 
L 0 172.8 
z
" style="fill: none"/>
</g>
<g id="sco-ch_ansc-axes_1">
<g id="sco-ch_ansc-patch_2">
<path d="M 24.726562 146.500391 
L 170.814687 146.500391 
L 170.814687 22.403125 
L 24.726562 22.403125 
L 24.726562 146.500391 
z
" style="fill: none"/>
</g>
<g id="sco-ch_ansc-matplotlib.axis_1">
<g id="sco-ch_ansc-xtick_1">
<g id="sco-ch_ansc-line2d_1">
<defs>
<path id="sco-ch_ansc-m7c25c535dc" d="M 0 0 
L 0 3.5 
" style="stroke: currentColor; stroke-width: 0.8"/>
</defs>
<g>
<use xlink:href="#sco-ch_ansc-m7c25c535dc" x="49.074583" y="146.500391" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_ansc-text_1">
<text style="font-size: 10px; text-anchor: middle" x="49.074583" y="163.187891" transform="rotate(-0 49.074583 163.187891)">5</text>
</g>
</g>
<g id="sco-ch_ansc-xtick_2">
<g id="sco-ch_ansc-line2d_2">
<g>
<use xlink:href="#sco-ch_ansc-m7c25c535dc" x="89.654618" y="146.500391" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_ansc-text_2">
<text style="font-size: 10px; text-anchor: middle" x="89.654618" y="163.187891" transform="rotate(-0 89.654618 163.187891)">10</text>
</g>
</g>
<g id="sco-ch_ansc-xtick_3">
<g id="sco-ch_ansc-line2d_3">
<g>
<use xlink:href="#sco-ch_ansc-m7c25c535dc" x="130.234653" y="146.500391" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_ansc-text_3">
<text style="font-size: 10px; text-anchor: middle" x="130.234653" y="163.187891" transform="rotate(-0 130.234653 163.187891)">15</text>
</g>
</g>
<g id="sco-ch_ansc-xtick_4">
<g id="sco-ch_ansc-line2d_4">
<g>
<use xlink:href="#sco-ch_ansc-m7c25c535dc" x="170.814687" y="146.500391" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_ansc-text_4">
<text style="font-size: 10px; text-anchor: middle" x="170.814687" y="163.187891" transform="rotate(-0 170.814687 163.187891)">20</text>
</g>
</g>
</g>
<g id="sco-ch_ansc-matplotlib.axis_2">
<g id="sco-ch_ansc-ytick_1">
<g id="sco-ch_ansc-line2d_5">
<defs>
<path id="sco-ch_ansc-mb258c49b38" d="M 0 0 
L -3.5 0 
" style="stroke: currentColor; stroke-width: 0.8"/>
</defs>
<g>
<use xlink:href="#sco-ch_ansc-mb258c49b38" x="24.726562" y="146.500391" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_ansc-text_5">
<text style="font-size: 10px; text-anchor: end" x="17.726562" y="151.344141" transform="rotate(-0 17.726562 151.344141)">2</text>
</g>
</g>
<g id="sco-ch_ansc-ytick_2">
<g id="sco-ch_ansc-line2d_6">
<g>
<use xlink:href="#sco-ch_ansc-mb258c49b38" x="24.726562" y="125.817513" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_ansc-text_6">
<text style="font-size: 10px; text-anchor: end" x="17.726562" y="130.661263" transform="rotate(-0 17.726562 130.661263)">4</text>
</g>
</g>
<g id="sco-ch_ansc-ytick_3">
<g id="sco-ch_ansc-line2d_7">
<g>
<use xlink:href="#sco-ch_ansc-mb258c49b38" x="24.726562" y="105.134635" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_ansc-text_7">
<text style="font-size: 10px; text-anchor: end" x="17.726562" y="109.978385" transform="rotate(-0 17.726562 109.978385)">6</text>
</g>
</g>
<g id="sco-ch_ansc-ytick_4">
<g id="sco-ch_ansc-line2d_8">
<g>
<use xlink:href="#sco-ch_ansc-mb258c49b38" x="24.726562" y="84.451758" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_ansc-text_8">
<text style="font-size: 10px; text-anchor: end" x="17.726562" y="89.295508" transform="rotate(-0 17.726562 89.295508)">8</text>
</g>
</g>
<g id="sco-ch_ansc-ytick_5">
<g id="sco-ch_ansc-line2d_9">
<g>
<use xlink:href="#sco-ch_ansc-mb258c49b38" x="24.726562" y="63.76888" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_ansc-text_9">
<text style="font-size: 10px; text-anchor: end" x="17.726562" y="68.61263" transform="rotate(-0 17.726562 68.61263)">10</text>
</g>
</g>
<g id="sco-ch_ansc-ytick_6">
<g id="sco-ch_ansc-line2d_10">
<g>
<use xlink:href="#sco-ch_ansc-mb258c49b38" x="24.726562" y="43.086003" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_ansc-text_10">
<text style="font-size: 10px; text-anchor: end" x="17.726562" y="47.929753" transform="rotate(-0 17.726562 47.929753)">12</text>
</g>
</g>
<g id="sco-ch_ansc-ytick_7">
<g id="sco-ch_ansc-line2d_11">
<g>
<use xlink:href="#sco-ch_ansc-mb258c49b38" x="24.726562" y="22.403125" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_ansc-text_11">
<text style="font-size: 10px; text-anchor: end" x="17.726562" y="27.246875" transform="rotate(-0 17.726562 27.246875)">14</text>
</g>
</g>
</g>
<g id="sco-ch_ansc-line2d_12">
<path d="M 32.842569 120.646794 
L 170.814687 32.744564 
" clip-path="url(#sco-ch_ansc-p6cdc9988c1)" style="fill: none; stroke: #ef4444; stroke-linecap: square"/>
</g>
<g id="sco-ch_ansc-patch_3">
<path d="M 24.726562 146.500391 
L 24.726562 22.403125 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sco-ch_ansc-patch_4">
<path d="M 24.726562 146.500391 
L 170.814687 146.500391 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sco-ch_ansc-PathCollection_1">
<defs>
<path id="sco-ch_ansc-m37ce446c48" d="M 0 2 
C 0.530406 2 1.03916 1.789267 1.414214 1.414214 
C 1.789267 1.03916 2 0.530406 2 0 
C 2 -0.530406 1.789267 -1.03916 1.414214 -1.414214 
C 1.03916 -1.789267 0.530406 -2 0 -2 
C -0.530406 -2 -1.03916 -1.789267 -1.414214 -1.414214 
C -1.789267 -1.03916 -2 -0.530406 -2 0 
C -2 0.530406 -1.789267 1.03916 -1.414214 1.414214 
C -1.03916 1.789267 -0.530406 2 0 2 
z
" style="stroke: #3b82f6"/>
</defs>
<g clip-path="url(#sco-ch_ansc-p6cdc9988c1)">
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="89.654618" y="84.0381" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="73.422604" y="95.310269" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="114.002639" y="88.795162" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="81.538611" y="76.075192" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="97.770625" y="81.039083" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="122.118646" y="64.182538" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="57.19059" y="92.311251" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="40.958576" y="123.128739" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="105.886632" y="55.082072" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="65.306597" y="117.337533" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="49.074583" y="108.443896" style="fill: #3b82f6; stroke: #3b82f6"/>
</g>
</g>
<g id="sco-ch_ansc-text_12">
<text style="font-size: 9.5px; text-anchor: middle" x="97.770625" y="16.403125" transform="rotate(-0 97.770625 16.403125)">I   r = 0.816</text>
</g>
</g>
<g id="sco-ch_ansc-axes_2">
<g id="sco-ch_ansc-patch_5">
<path d="M 191.319062 146.500391 
L 337.407188 146.500391 
L 337.407188 22.403125 
L 191.319062 22.403125 
L 191.319062 146.500391 
z
" style="fill: none"/>
</g>
<g id="sco-ch_ansc-matplotlib.axis_3">
<g id="sco-ch_ansc-xtick_5">
<g id="sco-ch_ansc-line2d_13">
<g>
<use xlink:href="#sco-ch_ansc-m7c25c535dc" x="215.667083" y="146.500391" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_ansc-text_13">
<text style="font-size: 10px; text-anchor: middle" x="215.667083" y="163.187891" transform="rotate(-0 215.667083 163.187891)">5</text>
</g>
</g>
<g id="sco-ch_ansc-xtick_6">
<g id="sco-ch_ansc-line2d_14">
<g>
<use xlink:href="#sco-ch_ansc-m7c25c535dc" x="256.247118" y="146.500391" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_ansc-text_14">
<text style="font-size: 10px; text-anchor: middle" x="256.247118" y="163.187891" transform="rotate(-0 256.247118 163.187891)">10</text>
</g>
</g>
<g id="sco-ch_ansc-xtick_7">
<g id="sco-ch_ansc-line2d_15">
<g>
<use xlink:href="#sco-ch_ansc-m7c25c535dc" x="296.827153" y="146.500391" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_ansc-text_15">
<text style="font-size: 10px; text-anchor: middle" x="296.827153" y="163.187891" transform="rotate(-0 296.827153 163.187891)">15</text>
</g>
</g>
<g id="sco-ch_ansc-xtick_8">
<g id="sco-ch_ansc-line2d_16">
<g>
<use xlink:href="#sco-ch_ansc-m7c25c535dc" x="337.407188" y="146.500391" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_ansc-text_16">
<text style="font-size: 10px; text-anchor: middle" x="337.407188" y="163.187891" transform="rotate(-0 337.407188 163.187891)">20</text>
</g>
</g>
</g>
<g id="sco-ch_ansc-matplotlib.axis_4">
<g id="sco-ch_ansc-ytick_8">
<g id="sco-ch_ansc-line2d_17">
<g>
<use xlink:href="#sco-ch_ansc-mb258c49b38" x="191.319062" y="146.500391" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
</g>
<g id="sco-ch_ansc-ytick_9">
<g id="sco-ch_ansc-line2d_18">
<g>
<use xlink:href="#sco-ch_ansc-mb258c49b38" x="191.319062" y="125.817513" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
</g>
<g id="sco-ch_ansc-ytick_10">
<g id="sco-ch_ansc-line2d_19">
<g>
<use xlink:href="#sco-ch_ansc-mb258c49b38" x="191.319062" y="105.134635" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
</g>
<g id="sco-ch_ansc-ytick_11">
<g id="sco-ch_ansc-line2d_20">
<g>
<use xlink:href="#sco-ch_ansc-mb258c49b38" x="191.319062" y="84.451758" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
</g>
<g id="sco-ch_ansc-ytick_12">
<g id="sco-ch_ansc-line2d_21">
<g>
<use xlink:href="#sco-ch_ansc-mb258c49b38" x="191.319062" y="63.76888" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
</g>
<g id="sco-ch_ansc-ytick_13">
<g id="sco-ch_ansc-line2d_22">
<g>
<use xlink:href="#sco-ch_ansc-mb258c49b38" x="191.319062" y="43.086003" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
</g>
<g id="sco-ch_ansc-ytick_14">
<g id="sco-ch_ansc-line2d_23">
<g>
<use xlink:href="#sco-ch_ansc-mb258c49b38" x="191.319062" y="22.403125" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
</g>
</g>
<g id="sco-ch_ansc-line2d_24">
<path d="M 199.435069 120.646794 
L 337.407188 32.744564 
" clip-path="url(#sco-ch_ansc-p940568092e)" style="fill: none; stroke: #ef4444; stroke-linecap: square"/>
</g>
<g id="sco-ch_ansc-patch_6">
<path d="M 191.319062 146.500391 
L 191.319062 22.403125 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sco-ch_ansc-patch_7">
<path d="M 191.319062 146.500391 
L 337.407188 146.500391 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sco-ch_ansc-PathCollection_2">
<g clip-path="url(#sco-ch_ansc-p940568092e)">
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="256.247118" y="72.662518" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="240.015104" y="83.003956" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="280.595139" y="76.799093" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="248.131111" y="76.48885" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="264.363125" y="71.421545" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="288.711146" y="83.417614" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="223.78309" y="103.790248" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="207.551076" y="135.124808" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="272.479132" y="72.765932" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="231.899097" y="92.104423" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="215.667083" y="118.164848" style="fill: #3b82f6; stroke: #3b82f6"/>
</g>
</g>
<g id="sco-ch_ansc-text_17">
<text style="font-size: 9.5px; text-anchor: middle" x="264.363125" y="16.403125" transform="rotate(-0 264.363125 16.403125)">II   r = 0.816</text>
</g>
</g>
<g id="sco-ch_ansc-axes_3">
<g id="sco-ch_ansc-patch_8">
<path d="M 357.911563 146.500391 
L 503.999687 146.500391 
L 503.999687 22.403125 
L 357.911563 22.403125 
L 357.911563 146.500391 
z
" style="fill: none"/>
</g>
<g id="sco-ch_ansc-matplotlib.axis_5">
<g id="sco-ch_ansc-xtick_9">
<g id="sco-ch_ansc-line2d_25">
<g>
<use xlink:href="#sco-ch_ansc-m7c25c535dc" x="382.259583" y="146.500391" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_ansc-text_18">
<text style="font-size: 10px; text-anchor: middle" x="382.259583" y="163.187891" transform="rotate(-0 382.259583 163.187891)">5</text>
</g>
</g>
<g id="sco-ch_ansc-xtick_10">
<g id="sco-ch_ansc-line2d_26">
<g>
<use xlink:href="#sco-ch_ansc-m7c25c535dc" x="422.839618" y="146.500391" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_ansc-text_19">
<text style="font-size: 10px; text-anchor: middle" x="422.839618" y="163.187891" transform="rotate(-0 422.839618 163.187891)">10</text>
</g>
</g>
<g id="sco-ch_ansc-xtick_11">
<g id="sco-ch_ansc-line2d_27">
<g>
<use xlink:href="#sco-ch_ansc-m7c25c535dc" x="463.419653" y="146.500391" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_ansc-text_20">
<text style="font-size: 10px; text-anchor: middle" x="463.419653" y="163.187891" transform="rotate(-0 463.419653 163.187891)">15</text>
</g>
</g>
<g id="sco-ch_ansc-xtick_12">
<g id="sco-ch_ansc-line2d_28">
<g>
<use xlink:href="#sco-ch_ansc-m7c25c535dc" x="503.999687" y="146.500391" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_ansc-text_21">
<text style="font-size: 10px; text-anchor: middle" x="503.999687" y="163.187891" transform="rotate(-0 503.999687 163.187891)">20</text>
</g>
</g>
</g>
<g id="sco-ch_ansc-matplotlib.axis_6">
<g id="sco-ch_ansc-ytick_15">
<g id="sco-ch_ansc-line2d_29">
<g>
<use xlink:href="#sco-ch_ansc-mb258c49b38" x="357.911563" y="146.500391" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
</g>
<g id="sco-ch_ansc-ytick_16">
<g id="sco-ch_ansc-line2d_30">
<g>
<use xlink:href="#sco-ch_ansc-mb258c49b38" x="357.911563" y="125.817513" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
</g>
<g id="sco-ch_ansc-ytick_17">
<g id="sco-ch_ansc-line2d_31">
<g>
<use xlink:href="#sco-ch_ansc-mb258c49b38" x="357.911563" y="105.134635" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
</g>
<g id="sco-ch_ansc-ytick_18">
<g id="sco-ch_ansc-line2d_32">
<g>
<use xlink:href="#sco-ch_ansc-mb258c49b38" x="357.911563" y="84.451758" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
</g>
<g id="sco-ch_ansc-ytick_19">
<g id="sco-ch_ansc-line2d_33">
<g>
<use xlink:href="#sco-ch_ansc-mb258c49b38" x="357.911563" y="63.76888" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
</g>
<g id="sco-ch_ansc-ytick_20">
<g id="sco-ch_ansc-line2d_34">
<g>
<use xlink:href="#sco-ch_ansc-mb258c49b38" x="357.911563" y="43.086003" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
</g>
<g id="sco-ch_ansc-ytick_21">
<g id="sco-ch_ansc-line2d_35">
<g>
<use xlink:href="#sco-ch_ansc-mb258c49b38" x="357.911563" y="22.403125" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
</g>
</g>
<g id="sco-ch_ansc-line2d_36">
<path d="M 366.027569 120.646794 
L 503.999687 32.744564 
" clip-path="url(#sco-ch_ansc-pa0a90ad38e)" style="fill: none; stroke: #ef4444; stroke-linecap: square"/>
</g>
<g id="sco-ch_ansc-patch_9">
<path d="M 357.911563 146.500391 
L 357.911563 22.403125 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sco-ch_ansc-patch_10">
<path d="M 357.911563 146.500391 
L 503.999687 146.500391 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sco-ch_ansc-PathCollection_3">
<g clip-path="url(#sco-ch_ansc-pa0a90ad38e)">
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="422.839618" y="90.036135" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="406.607604" y="97.171728" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="447.187639" y="35.433338" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="414.723611" y="93.655638" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="430.955625" y="86.416631" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="455.303646" y="75.764949" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="390.37559" y="104.30732" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="374.143576" y="111.442913" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="439.071632" y="82.900542" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="398.491597" y="100.791231" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="382.259583" y="107.926824" style="fill: #3b82f6; stroke: #3b82f6"/>
</g>
</g>
<g id="sco-ch_ansc-text_22">
<text style="font-size: 9.5px; text-anchor: middle" x="430.955625" y="16.403125" transform="rotate(-0 430.955625 16.403125)">III   r = 0.816</text>
</g>
</g>
<g id="sco-ch_ansc-axes_4">
<g id="sco-ch_ansc-patch_11">
<path d="M 524.504062 146.500391 
L 670.592187 146.500391 
L 670.592187 22.403125 
L 524.504062 22.403125 
L 524.504062 146.500391 
z
" style="fill: none"/>
</g>
<g id="sco-ch_ansc-matplotlib.axis_7">
<g id="sco-ch_ansc-xtick_13">
<g id="sco-ch_ansc-line2d_37">
<g>
<use xlink:href="#sco-ch_ansc-m7c25c535dc" x="548.852083" y="146.500391" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_ansc-text_23">
<text style="font-size: 10px; text-anchor: middle" x="548.852083" y="163.187891" transform="rotate(-0 548.852083 163.187891)">5</text>
</g>
</g>
<g id="sco-ch_ansc-xtick_14">
<g id="sco-ch_ansc-line2d_38">
<g>
<use xlink:href="#sco-ch_ansc-m7c25c535dc" x="589.432118" y="146.500391" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_ansc-text_24">
<text style="font-size: 10px; text-anchor: middle" x="589.432118" y="163.187891" transform="rotate(-0 589.432118 163.187891)">10</text>
</g>
</g>
<g id="sco-ch_ansc-xtick_15">
<g id="sco-ch_ansc-line2d_39">
<g>
<use xlink:href="#sco-ch_ansc-m7c25c535dc" x="630.012153" y="146.500391" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_ansc-text_25">
<text style="font-size: 10px; text-anchor: middle" x="630.012153" y="163.187891" transform="rotate(-0 630.012153 163.187891)">15</text>
</g>
</g>
<g id="sco-ch_ansc-xtick_16">
<g id="sco-ch_ansc-line2d_40">
<g>
<use xlink:href="#sco-ch_ansc-m7c25c535dc" x="670.592187" y="146.500391" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
<g id="sco-ch_ansc-text_26">
<text style="font-size: 10px; text-anchor: middle" x="670.592187" y="163.187891" transform="rotate(-0 670.592187 163.187891)">20</text>
</g>
</g>
</g>
<g id="sco-ch_ansc-matplotlib.axis_8">
<g id="sco-ch_ansc-ytick_22">
<g id="sco-ch_ansc-line2d_41">
<g>
<use xlink:href="#sco-ch_ansc-mb258c49b38" x="524.504062" y="146.500391" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
</g>
<g id="sco-ch_ansc-ytick_23">
<g id="sco-ch_ansc-line2d_42">
<g>
<use xlink:href="#sco-ch_ansc-mb258c49b38" x="524.504062" y="125.817513" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
</g>
<g id="sco-ch_ansc-ytick_24">
<g id="sco-ch_ansc-line2d_43">
<g>
<use xlink:href="#sco-ch_ansc-mb258c49b38" x="524.504062" y="105.134635" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
</g>
<g id="sco-ch_ansc-ytick_25">
<g id="sco-ch_ansc-line2d_44">
<g>
<use xlink:href="#sco-ch_ansc-mb258c49b38" x="524.504062" y="84.451758" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
</g>
<g id="sco-ch_ansc-ytick_26">
<g id="sco-ch_ansc-line2d_45">
<g>
<use xlink:href="#sco-ch_ansc-mb258c49b38" x="524.504062" y="63.76888" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
</g>
<g id="sco-ch_ansc-ytick_27">
<g id="sco-ch_ansc-line2d_46">
<g>
<use xlink:href="#sco-ch_ansc-mb258c49b38" x="524.504062" y="43.086003" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
</g>
<g id="sco-ch_ansc-ytick_28">
<g id="sco-ch_ansc-line2d_47">
<g>
<use xlink:href="#sco-ch_ansc-mb258c49b38" x="524.504062" y="22.403125" style="stroke: currentColor; stroke-width: 0.8"/>
</g>
</g>
</g>
</g>
<g id="sco-ch_ansc-line2d_48">
<path d="M 532.620069 120.646794 
L 670.592187 32.744564 
" clip-path="url(#sco-ch_ansc-p330db71e69)" style="fill: none; stroke: #ef4444; stroke-linecap: square"/>
</g>
<g id="sco-ch_ansc-patch_12">
<path d="M 524.504062 146.500391 
L 524.504062 22.403125 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sco-ch_ansc-patch_13">
<path d="M 524.504062 146.500391 
L 670.592187 146.500391 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
</g>
<g id="sco-ch_ansc-PathCollection_4">
<g clip-path="url(#sco-ch_ansc-p330db71e69)">
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="573.200104" y="99.136601" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="573.200104" y="107.616581" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="573.200104" y="87.450775" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="573.200104" y="75.764949" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="573.200104" y="79.591282" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="573.200104" y="94.379539" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="573.200104" y="112.890715" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="662.476181" y="37.915283" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="573.200104" y="109.684868" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="573.200104" y="85.382487" style="fill: #3b82f6; stroke: #3b82f6"/>
<use xlink:href="#sco-ch_ansc-m37ce446c48" x="573.200104" y="95.930755" style="fill: #3b82f6; stroke: #3b82f6"/>
</g>
</g>
<g id="sco-ch_ansc-text_27">
<text style="font-size: 9.5px; text-anchor: middle" x="597.548125" y="16.403125" transform="rotate(-0 597.548125 16.403125)">IV   r = 0.817</text>
</g>
</g>
</g>
<defs>
<clipPath id="sco-ch_ansc-p6cdc9988c1">
<rect x="24.726562" y="22.403125" width="146.088125" height="124.097266"/>
</clipPath>
<clipPath id="sco-ch_ansc-p940568092e">
<rect x="191.319062" y="22.403125" width="146.088125" height="124.097266"/>
</clipPath>
<clipPath id="sco-ch_ansc-pa0a90ad38e">
<rect x="357.911563" y="22.403125" width="146.088125" height="124.097266"/>
</clipPath>
<clipPath id="sco-ch_ansc-p330db71e69">
<rect x="524.504062" y="22.403125" width="146.088125" height="124.097266"/>
</clipPath>
</defs>
</svg><figcaption>Anscombe's quartet: four datasets with the same averages, variance, correlation and fitted line (red). Only the picture shows they are different.</figcaption></figure>
  <p>Dataset I is a genuine noisy straight line, where r is a fair summary. II is a smooth curve, which needs a curved model rather than a line. III is a perfect line ruined by one outlier, which should be checked. In IV, every point has the same x except one, and that single far-away point creates the entire correlation; without it there is no evidence of any relationship. A point that is far from the others in x like this is called a <strong>leverage point</strong>, because it can pull a fitted line towards itself, just as our typo student F did. It is like four cricket batters who all average 40 runs: one scores close to 40 every time, one swings between 0 and 80, one scores 35 every time apart from a single 200, and one has played only once. Same average, completely different players. Before trusting any correlation, draw the scatter plot (<code>df.plot.scatter</code>, or <code>sns.pairplot</code> for every pair at once).</p>

  <h2 id="sco-cause"><span class="num">06</span>Correlation vs Causation</h2>
  <p>Suppose the plot is clean, the correlation is strong and the sample is big. In our class, phone hours and exam score have r = −0.93. The head teacher proposes banning phones to raise scores. Is that justified? Not from the correlation alone, and acting on a correlation as if it were a cause is the most common mistake in analytics. Product teams make the same error all the time: "users who use the wishlist spend 40% more, so let us push the wishlist to everyone", and then spending does not move at all.</p>
  <p>When two variables A and B move together, "A causes B" is only one of several possible explanations. The most important alternative is a <strong>confounder</strong>: a third variable that causes both A and B, creating a correlation between them even though neither affects the other. Think of fires: the more fire engines that turn up, the more damage there is. Fire engines do not cause damage; a bigger fire causes both more engines and more damage, and sending fewer engines would not reduce the damage. The size of the fire is the confounder. For the students, a likely confounder is motivation: motivated students both spend less time on their phones and work harder, so phone time and score are correlated even if the phone itself does nothing.</p>
  <p>The other explanations are worth knowing by name, because interviewers ask for them. <strong>Reverse causation</strong> means B actually causes A: a student who did badly in the mock may become stressed and escape to their phone more, so low scores cause phone use, not the other way round. <strong>Selection bias</strong> means the data only contains a filtered group: if only students who stayed until the final exam were recorded, the ones who dropped out are missing, and that can create or hide a pattern. And plain <strong>coincidence</strong>: check enough pairs of columns and some will correlate by luck, as the noise simulation in section 03 showed.</p>
  <p>If you suspect a confounder and you have measured it, you can ask a sharper question: "among students with the <em>same</em> motivation, do phone time and score still move together?" This is what people mean by "controlling for" a variable, and the measurement is called the <strong>partial correlation</strong>. The recipe is simple. Predict phone time from motivation with a straight line and keep what is left over, the part motivation does not explain (this leftover is called the <strong>residual</strong>). Do the same for score. Then correlate the two leftovers. Five students are too few for this, so the code simulates 300 students in a world where motivation lowers phone use and raises scores, and phone use has <em>no</em> effect on score at all:</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
motiv = rng.normal(0, 1, 300)                         # hidden: how motivated each student is
phone = 4 - 1.2 * motiv + rng.normal(0, 0.8, 300)     # motivated students use the phone less
exam = 60 + 8 * motiv + rng.normal(0, 4, 300)         # ...and score higher; phone plays no part
print("corr(phone, exam):", round(np.corrcoef(phone, exam)[0, 1], 3))

def leftover(v):                                      # what motivation does NOT explain
    return v - np.polyval(np.polyfit(motiv, v, 1), motiv)

print("partial corr given motivation:", round(np.corrcoef(leftover(phone), leftover(exam))[0, 1], 3))
R = np.corrcoef([phone, exam, motiv])
rxy, rxz, ryz = R[0, 1], R[0, 2], R[1, 2]
print("r(phone,motiv) = %.3f  r(exam,motiv) = %.3f" % (rxz, ryz))
print("formula:", round((rxy - rxz * ryz) / np.sqrt((1 - rxz**2) * (1 - ryz**2)), 3))</div>
  <div class="fx" data-lang="text">corr(phone, exam): -0.751
partial corr given motivation: 0.056
r(phone,motiv) = -0.836  r(exam,motiv) = 0.914
formula: 0.056</div>
  <p>Look at how <code>exam</code> is built: it uses <code>motiv</code> and random noise, and <code>phone</code> does not appear in it. Yet the raw correlation between phone and exam is −0.751, a strong negative link created entirely by motivation. After removing motivation's straight-line effect from both, the correlation of the leftovers is 0.056: essentially nothing. There is also a formula that gives the same answer from three ordinary correlations, r<sub>xy·z</sub> = (r<sub>xy</sub> − r<sub>xz</sub> r<sub>yz</sub>) ÷ √((1 − r<sub>xz</sub>²)(1 − r<sub>yz</sub>²)). With the printed values the top is −0.751 − (−0.836 × 0.914) = 0.013 and the bottom is √(0.301 × 0.165) = 0.223, giving about 0.06, which matches. The top of the formula reads naturally: the raw correlation, minus the part you would expect just from both variables being linked to z.</p>
  <p>Controlling has two big limits. It only removes confounders you measured, and only the part of their effect your model captures (here a straight line). Motivation is rarely a column in a real dataset, and an unmeasured confounder will still fool you. That is why the gold standard for proving causation is a <strong>randomised experiment</strong>: if you randomly decide which students get their phones taken away, motivation (and every other hidden factor, measured or not) ends up balanced between the two groups on average, so any difference in scores must come from the phones. That is the subject of <a class="xref" data-note="st_abtesting">A/B Testing</a>. When you cannot randomise, causal-inference methods such as difference-in-differences, instrumental variables and matching try to imitate an experiment, each with its own assumptions.</p>

  <h2 id="sco-simpson"><span class="num">07</span>Simpson's Paradox</h2>
  <p>A confounder can create a correlation out of nothing. It can also do something stranger: flip the direction of a real effect. A dashboard shows that overall conversion fell after a product launch, and the team panics. Then someone splits the numbers by country, and conversion <em>rose</em> in every single country. Both statements are true at the same time. This is <strong>Simpson's paradox</strong>: a trend that appears in every subgroup reverses, or disappears, when the subgroups are combined.</p>
  <p>Our five students are too few to show it, so here is the most famous real case, a 1986 study of two treatments for kidney stones:</p>
  <table class="tbl">
    <tr><th>Success rate</th><th>Treatment A (open surgery)</th><th>Treatment B (less invasive)</th><th>Better</th></tr>
    <tr><td>Small stones</td><td>81/87 = <strong>93%</strong></td><td>234/270 = 87%</td><td>A</td></tr>
    <tr><td>Large stones</td><td>192/263 = <strong>73%</strong></td><td>55/80 = 69%</td><td>A</td></tr>
    <tr><td>All patients</td><td>273/350 = 78%</td><td>289/350 = <strong>83%</strong></td><td>B?</td></tr>
  </table>
  <p>A is better for small stones and better for large stones, yet B looks better overall. The key is that an overall rate is a <strong>weighted average</strong> of the group rates, where the weights are the share of patients in each group. Doctors tended to give the more serious treatment A to the harder cases, so A's patients were mostly large stones, while B's were mostly small stones. Working it through:</p>
  <div class="fx" data-lang="text">A:  87 small (25%), 263 large (75%)
    overall = 0.25 × 93.1% + 0.75 × 73.0% = 23.1 + 54.9 = 78.0%

B:  270 small (77%), 80 large (23%)
    overall = 0.77 × 86.7% + 0.23 × 68.8% = 66.9 + 15.7 = 82.6%</div>
  <p>Large stones are much harder to treat (around 70% success) than small ones (around 90%). A was given mostly hard cases, B mostly easy ones, and that mix, not the treatment, decides the pooled number. Stone size is a confounder: it affects both which treatment a patient got and whether the treatment succeeded, exactly as motivation affected both phone use and score. Think of two coaching institutes: one admits mostly weak students and helps them more than anyone else would, the other admits mostly toppers. The second has the higher overall pass rate, yet for weak students and for toppers alike, the first does better. Its "win" comes from whom it admits, not how it teaches.</p>
  <div class="fx" data-lang="py">ks = pd.DataFrame({"treat": ["A", "A", "B", "B"], "size": ["small", "large"] * 2,
                   "ok": [81, 192, 234, 55], "n": [87, 263, 270, 80]})
rates = ks.assign(rate=(ks.ok / ks.n).round(3)).pivot(index="size", columns="treat", values="rate")
print(rates)
tot = ks.groupby("treat")[["ok", "n"]].sum()
print("pooled:", (tot.ok / tot.n).round(3).to_dict())
print(ks.pivot(index="size", columns="treat", values="n"))</div>
  <div class="fx" data-lang="text">treat      A      B
size               
large  0.730  0.688
small  0.931  0.867
pooled: {'A': 0.78, 'B': 0.826}
treat    A    B
size           
large  263   80
small   87  270</div>
  <p>The first table shows A ahead in both rows (0.730 against 0.688, and 0.931 against 0.867). The pooled line shows B ahead overall (0.826 against 0.780). The last table is the explanation: A treated 263 large-stone patients, B only 80.</p>
  <p>The practical rule is not "always split" or "always pool". Split by a variable that influences both the choice being compared and the outcome, as stone size does here, because that is a confounder. In a properly randomised A/B test the mix should be the same in both arms, so a big difference in segment mix between control and treatment is itself a warning sign that the randomisation is broken.</p>

  <h2 id="sco-vif"><span class="num">08</span>Multicollinearity and VIF</h2>
  <p>So far correlation has been something to interpret. Inside a model it causes a different kind of problem. Say we fit a linear regression that predicts exam score from both study hours and number of practice tests. Students who study more also take more tests (r = 0.96 in our table), so the two features almost always move together. The model has to decide how much of the score to credit to each feature, and because it has hardly ever seen one change without the other, it cannot tell. This is <strong>multicollinearity</strong>: two or more input features are strongly linearly related to each other.</p>
  <p>Imagine two friends who always cook together. The meal is excellent. Who deserves the credit? You cannot say, because you have never seen either of them cook alone. A 50-50 split, a 90-10 split and a 10-90 split all explain what you saw equally well. A regression model faces the same problem: many different combinations of coefficients fit the data almost equally well, so the one it picks is shaky. Add or remove a few rows and the coefficients can swing wildly, even change sign. In statistical terms, their <strong>standard errors</strong> (the typical amount an estimate would wobble if you collected a new sample) become large.</p>
  <p>The standard way to measure this is the <strong>variance inflation factor</strong>, or VIF. For each feature, you try to predict it from all the other features with a linear regression and see how well that works, measured by R² (the share of the feature's variation the others explain). Then:</p>
  <div class="fx" data-lang="text">VIF_j = 1 ÷ (1 − R²_j)</div>
  <p>If the other features cannot predict feature j at all, R² = 0 and VIF = 1: no inflation. If they predict it almost perfectly, R² is near 1, the bottom of the fraction is near 0, and VIF shoots up. The name says what it measures: the VIF is how many times larger the variance of that feature's coefficient is, compared with what it would be if the feature were unrelated to the others. Its square root is how many times larger the standard error is. With only one other feature, R² is just r², so on our five students: hours and tests have r = 0.959, R² = 0.920, and VIF = 1 ÷ 0.080 = 12.6.</p>
  <div class="fx" data-lang="py">r_ht = np.corrcoef(df.hours, df.tests)[0, 1]
print(f"r(hours, tests) = {r_ht:.3f}  R^2 = {r_ht**2:.3f}  VIF = 1/(1 - R^2) = {1 / (1 - r_ht**2):.1f}")</div>
  <div class="fx" data-lang="text">r(hours, tests) = 0.959  R^2 = 0.920  VIF = 1/(1 - R^2) = 12.6</div>
  <p>A VIF of 12.6 means the tests coefficient's variance is about 12.6 times bigger than it would be with unrelated features, and its standard error about √12.6 ≈ 3.5 times bigger. To see what that does to a real model, the next code simulates 200 students where practice tests are roughly twice the study hours plus a little noise, sleep is unrelated to both, and the true effect of one extra practice test is exactly +1 mark. It prints each feature's VIF using statsmodels, then fits two regressions, one without hours and one with:</p>
  <div class="fx" data-lang="py">import statsmodels.api as sm
from statsmodels.stats.outliers_influence import variance_inflation_factor
rng = np.random.default_rng(1)
hrs = rng.normal(4, 1.5, 200)                       # 200 students
tst = 2 * hrs + rng.normal(0, 0.8, 200)             # practice tests: nearly a copy of hours
slp = rng.normal(7, 1, 200)                         # sleep: unrelated to both
X = sm.add_constant(pd.DataFrame({"hours": hrs, "tests": tst, "sleep": slp}))
for i, col in enumerate(X.columns[1:], start=1):
    print(f"{col:6s} VIF = {variance_inflation_factor(X.values, i):.1f}")
exam = 40 + 3 * hrs + 1 * tst + 0.5 * slp + rng.normal(0, 4, 200)   # true effect of one test: +1
for cols in [["tests", "sleep"], ["hours", "tests", "sleep"]]:
    m = sm.OLS(exam, sm.add_constant(X[cols])).fit()
    print(f"{'+'.join(cols):17s} tests coef = {m.params['tests']:5.2f}  SE = {m.bse['tests']:.2f}  R2 = {m.rsquared:.3f}")</div>
  <div class="fx" data-lang="text">hours  VIF = 17.2
tests  VIF = 17.0
sleep  VIF = 1.1
tests+sleep       tests coef =  2.27  SE = 0.11  R2 = 0.700
hours+tests+sleep tests coef =  1.26  SE = 0.44  R2 = 0.709</div>
  <p><code>add_constant</code> adds the intercept column that a regression needs (which is why the VIF loop starts at column 1). Hours and tests both have VIF around 17, far into the danger zone; sleep is 1.1, no overlap. Without hours in the model, tests soaks up the effect of hours as well as its own and claims 2.27 marks per test, more than double the truth. With hours included, the estimate is 1.26, closer to the true 1, but its standard error has quadrupled from 0.11 to 0.44, so we are much less sure of it. Meanwhile R² barely moves, 0.700 against 0.709: the predictions are just as good either way.</p>
  <p>That last point is the one interviewers look for: <strong>multicollinearity hurts interpretation, not prediction</strong>. If you only want accurate predictions, correlated features are usually fine, and regularisation such as ridge regression handles them gracefully. If you want to say "one more practice test is worth 1.3 marks", high VIF means you cannot trust that number. Common rules of thumb treat VIF above 5 as worth watching and above 10 as severe. The usual fixes are to drop one of the near-copies, combine them into one feature (for example an average or a principal component, see <a class="xref" data-note="ml_dimred">Dimensionality Reduction</a>), or use ridge regression. Tree models such as random forests do not suffer in accuracy either, but their feature importance gets split between the copies, so each one looks less important than it really is (see <a class="xref" data-note="ml_trees">Tree-Based Models</a>).</p>

  <h2 id="sco-traps"><span class="num">09</span>Common Mistakes</h2>
  <p>The first mistake is comparing covariances to judge which relationship is stronger. Covariance carries units, so its size reflects the scale of the columns as much as the strength of the link:</p>
  <div class="fx" data-lang="py">print("cov(hours, score) =", np.cov(hours, score)[0, 1], "  cov(hours, phone) =", np.cov(hours, df.phone)[0, 1])
print("corr(hours, score) =", round(np.corrcoef(hours, score)[0, 1], 3),
      "  corr(hours, phone) =", round(np.corrcoef(hours, df.phone)[0, 1], 3))</div>
  <div class="fx" data-lang="text">cov(hours, score) = 10.25   cov(hours, phone) = -2.5
corr(hours, score) = 0.994   corr(hours, phone) = -0.962</div>
  <p>The covariance of hours with phone, −2.5, looks four times weaker than the 10.25 with score, but that is only because phone hours vary less than exam marks. The correlations show the truth: −0.962 and 0.994 are nearly equally strong. Compare strength with r, never with covariance.</p>
  <p>The second is reading r = 0 as "no relationship". r only measures straight lines, and a perfectly predictable curve can have r of exactly zero:</p>
  <div class="fx" data-lang="py">x = np.array([-2, -1, 0, 1, 2])
y = x ** 2                                    # y is completely determined by x
print("pearson:", np.corrcoef(x, y)[0, 1], " spearman:", stats.spearmanr(x, y)[0])</div>
  <div class="fx" data-lang="text">pearson: 0.0  spearman: 0.0</div>
  <p>Here y = x² is completely determined by x, yet both Pearson and Spearman are 0, because the left half falls and the right half rises and they cancel. The stress column in our table is the same story. Plot before you conclude anything.</p>
  <p>Third, letting one outlier decide the answer. A single mistyped value moved our r from 0.99 to 0.45, and in Anscombe's dataset IV a single point created the entire correlation. Compare Pearson with Spearman, and if they disagree a lot, look for the point that is causing it.</p>
  <p>Fourth, trusting a big r on a tiny sample, or treating a tiny r on a huge sample as important. Pure noise gave |r| above 0.8 in about 10% of five-point samples, and with 10,000 rows an r of 0.04 was "significant". Always report n, r (or r²) and a confidence interval together, not a p-value alone.</p>
  <p>Fifth, the classic: concluding causation from correlation. "Users of feature X retain better, so X causes retention" ignores confounders (engaged users do everything more), reverse causation and selection. Partial correlation only removes confounders you measured. Only a randomised experiment settles it.</p>
  <p>Sixth, pooling groups that have different mixes. A pooled rate mixes the effect you care about with the case mix (Simpson's paradox). Before comparing two overall rates, check whether the groups being compared have similar make-ups.</p>
  <p>Finally, dropping useful features from a prediction model just because their VIF is high. VIF warns that coefficients cannot be interpreted; it does not mean predictions are worse. Act on it when you need to explain the coefficients, not by reflex.</p>

  <h2 id="sco-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Covariance</b>: average product of deviations from the means; sign = direction, size depends on units. cov(x, x) = var(x).</li>
    <li><b>Pearson r</b>: covariance divided by both standard deviations; unit-free, from −1 to +1; measures straight-line relationships only. Equal to the average product of z-scores.</li>
    <li><b>r²</b>: share of the variation in y explained by a straight line in x (r = 0.3 → 9%).</li>
    <li><b>Spearman ρ</b>: Pearson computed on ranks; measures any monotonic (always up or always down) relationship.</li>
    <li><b>Kendall τ</b>: (concordant − discordant pairs) ÷ total pairs.</li>
    <li><b>Independent</b>: knowing one tells you nothing about the other. Independent ⇒ r ≈ 0, but r = 0 does not imply independent.</li>
    <li><b>Confounder</b>: a third variable that causes both X and Y. <b>Partial correlation</b>: correlation of X and Y after removing Z's linear effect from both.</li>
    <li><b>Simpson's paradox</b>: a trend in every subgroup reverses when groups are pooled, because the group mix differs.</li>
    <li><b>Multicollinearity</b>: features strongly related to each other. <b>VIF</b> = 1 ÷ (1 − R²<sub>j</sub>).</li>
  </ul>
  <h3>Formulas (students A–E)</h3>
  <table class="tbl">
    <tr><th>Quantity</th><th>Formula</th><th>Our value</th></tr>
    <tr><td>Covariance</td><td>Σ(xᵢ − x̄)(yᵢ − ȳ) ÷ (n − 1)</td><td>41 ÷ 4 = 10.25</td></tr>
    <tr><td>Pearson r</td><td>cov ÷ (sₓ s_y)</td><td>10.25 ÷ (1.581 × 6.519) = 0.994</td></tr>
    <tr><td>Slope</td><td>cov ÷ sₓ² = r × s_y ÷ sₓ</td><td>4.1 marks per hour</td></tr>
    <tr><td>t for r</td><td>r√(n − 2) ÷ √(1 − r²), df = n − 2</td><td>16.3, p = 0.0005</td></tr>
    <tr><td>Spearman (no ties)</td><td>1 − 6Σd² ÷ (n(n² − 1))</td><td>mock vs final: 0.9</td></tr>
    <tr><td>Kendall</td><td>(C − D) ÷ (n(n − 1)/2)</td><td>(9 − 1) ÷ 10 = 0.8</td></tr>
    <tr><td>Partial r</td><td>(r<sub>xy</sub> − r<sub>xz</sub>r<sub>yz</sub>) ÷ √((1 − r<sub>xz</sub>²)(1 − r<sub>yz</sub>²))</td><td>phone/score: −0.75 → 0.06</td></tr>
    <tr><td>VIF</td><td>1 ÷ (1 − R²<sub>j</sub>)</td><td>hours/tests: 12.6</td></tr>
  </table>
  <h3>Which correlation?</h3>
  <table class="tbl">
    <tr><th>Situation</th><th>Use</th></tr>
    <tr><td>Two numeric columns, roughly linear, no wild outliers</td><td>Pearson</td></tr>
    <tr><td>Always rising/falling but curved; skewed data; ratings</td><td>Spearman</td></tr>
    <tr><td>Small sample, many ties</td><td>Kendall</td></tr>
    <tr><td>Rises then falls (U-shape)</td><td>none of them: plot it, model the curve</td></tr>
    <tr><td>Suspected third variable</td><td>partial correlation, or better an experiment</td></tr>
    <tr><td>Correlated model features</td><td>VIF; ridge, drop or combine features</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">np.cov(x, y)[0, 1]                     # covariance
np.corrcoef(x, y)[0, 1]                # Pearson r
stats.pearsonr(x, y)                   # r, p-value; .confidence_interval()
stats.spearmanr(x, y)                  # Spearman rho, p-value
stats.kendalltau(x, y)                 # Kendall tau, p-value
df.corr()                              # correlation matrix (method="spearman"/"kendall")
from statsmodels.stats.outliers_influence import variance_inflation_factor
variance_inflation_factor(X.values, i) # VIF of column i (X includes a constant)</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Covariance size means nothing on its own; compare strength with r.</li>
    <li>r = 0 means no straight-line link, not no link. Always plot.</li>
    <li>One outlier can make or break r; check Pearson against Spearman.</li>
    <li>Small n: big r by luck. Big n: tiny r "significant". Report r, n and a CI.</li>
    <li>Correlation is not causation: confounders, reverse causation, selection, coincidence.</li>
    <li>Pooled rates can reverse group-level trends (Simpson).</li>
    <li>High VIF hurts coefficient interpretation, not prediction.</li>
  </ul>

  <h2 id="sco-qa"><span class="num">10</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between covariance and correlation?</summary><div class="qa-body">Both measure whether two variables move together. Covariance is the average product of their deviations from the mean, so its sign gives the direction but its size depends on the units (study time in minutes turns our 10.25 into 615). Correlation divides covariance by both standard deviations, which makes it unit-free and always between −1 and 1, so it can be compared across pairs of variables.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute Pearson's r by hand for x = [1, 2, 3, 4, 5], y = [52, 55, 61, 64, 68].</summary><div class="qa-body">The means are 3 and 60. The deviation products are 16, 5, 0, 4, 16, which sum to 41, so the covariance is 41 ÷ 4 = 10.25. The standard deviations are √2.5 = 1.581 and √42.5 = 6.519. So r = 10.25 ÷ (1.581 × 6.519) = 10.25 ÷ 10.31 ≈ 0.994.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does r² mean? If r = 0.5, how much variance is explained?</summary><div class="qa-body">r² is the share of the variation in one variable that a straight line in the other explains. With r = 0.5, r² = 0.25, so only 25% of the variation is explained and 75% is not. It is a useful reality check, because correlations that sound decent often explain little.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does a high correlation mean a steep slope?</summary><div class="qa-body">No. r measures how tightly the points follow a line, not how steep the line is. Lines rising 0.01 and 50 units per unit of x can both have r = 1. The slope is cov ÷ var(x) = r × s<sub>y</sub> ÷ s<sub>x</sub>, so it depends on r and on the spreads of the two variables.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use Spearman instead of Pearson?</summary><div class="qa-body">When the relationship is monotonic but not straight (diminishing returns), when the data is ordinal such as ratings, or when there are outliers or heavy skew. Spearman correlates ranks, so one extreme value can only be "the largest" and cannot dominate. In our example a single typo dropped Pearson from 0.99 to 0.45 while Spearman stayed at 0.94.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between Spearman's rho and Kendall's tau?</summary><div class="qa-body">Both work on ranks. Spearman is Pearson's r applied to the ranks; Kendall counts pairs of observations and reports (concordant − discordant) ÷ total pairs, which has a direct probability meaning. Kendall is usually smaller in value, handles ties and small samples well, and has nicer statistical properties, while Spearman is more common and faster to compute.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>If the correlation between two variables is 0, are they independent?</summary><div class="qa-body">Not necessarily. r = 0 only means there is no linear relationship. For x = −2..2 and y = x², y is completely determined by x but r is exactly 0. Independence implies zero correlation, but zero correlation does not imply independence (the exception is jointly normal variables, where it does).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You find r = 0.03 with p &lt; 0.001 on a million rows. Is this an important relationship?</summary><div class="qa-body">It is almost certainly real but negligible. With huge n, almost any non-zero correlation becomes significant, because the p-value only says r is probably not exactly zero. r² = 0.0009, so x explains less than 0.1% of y. Report the effect size and its confidence interval, not just the p-value.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you test whether a correlation is statistically significant?</summary><div class="qa-body">The null hypothesis is that the true correlation is 0. Under it (with roughly normal data) t = r√(n − 2) ÷ √(1 − r²) follows a t-distribution with n − 2 degrees of freedom, which gives a p-value. <code>scipy.stats.pearsonr</code> does this and also gives a confidence interval via Fisher's z-transformation. For non-normal data, use Spearman's test or a permutation test.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is Anscombe's quartet and what does it teach?</summary><div class="qa-body">Four small datasets with the same means, variances, correlation (0.816) and regression line, which look completely different when plotted: a noisy line, a curve, a line with one outlier, and a cluster plus one leverage point that creates the whole correlation. The lesson is that summary statistics can hide very different structures, so always plot the data before trusting a correlation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Users who use feature X retain 30% better. Can we say X causes retention?</summary><div class="qa-body">No. Engaged users are more likely both to find X and to stay (a confounder); users who stayed longer had more time to discover X (reverse causation or time bias); and the comparison may only include certain users (selection). To establish causation, run a randomised experiment that exposes X to a random half; if that is impossible, use methods such as difference-in-differences or matching, and state their assumptions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a confounder, and what does "controlling for" it mean?</summary><div class="qa-body">A confounder is a variable that influences both the supposed cause and the outcome, creating a correlation between them. Controlling for it means removing its effect: for example, regress both variables on the confounder and correlate the residuals (partial correlation), or include it as a feature in a regression. It only works for confounders you have measured, and only for the form of effect you model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain Simpson's paradox with an example.</summary><div class="qa-body">In the kidney-stone study, treatment A had higher success for small stones (93% vs 87%) and for large stones (73% vs 69%), yet lower success overall (78% vs 83%). A was given mostly large, hard cases and B mostly small, easy ones, and the overall rate is a weighted average with those different weights. Stone size is a confounder, so the per-group comparison is the right one here.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is multicollinearity and why does it matter?</summary><div class="qa-body">It is when model features are strongly correlated with each other. The model cannot tell which feature deserves credit, so coefficients become unstable, get large standard errors and can even flip sign when the data changes slightly. Predictions are usually unaffected, so it matters mainly when you want to interpret coefficients.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is VIF and how is it computed? What values are worrying?</summary><div class="qa-body">For each feature, regress it on all the other features and take the R². VIF = 1 ÷ (1 − R²) is how many times the variance of that feature's coefficient is inflated by its overlap with the others. VIF = 1 means no overlap; above 5 is worth watching and above 10 is usually called severe. For two features with r = 0.95, VIF = 1 ÷ (1 − 0.9025) ≈ 10.3.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two features have correlation 0.98. What happens in linear regression, ridge and a random forest?</summary><div class="qa-body">In ordinary linear regression the two coefficients become unstable with large standard errors, though predictions stay fine (VIF ≈ 25). Ridge regression shrinks the coefficients and tends to share the weight between the two, giving stable estimates. A random forest predicts fine too, but its feature importance is split between the two features, so each looks less important than it really is.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you find highly correlated features in a large dataset?</summary><div class="qa-body">Compute <code>df.corr()</code> (or <code>method="spearman"</code> for robustness), take the upper triangle with an <code>np.triu</code> mask, and list pairs with |r| above a threshold such as 0.8 or 0.9; a heatmap helps to see clusters. Because pairwise correlation misses a feature that is a combination of several others, follow up with VIF on the candidate set. Then decide based on the goal: for interpretation drop or combine, for prediction often keep them and regularise.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is Pearson's r related to the slope of a linear regression?</summary><div class="qa-body">The least-squares slope of y on x is b = r × s<sub>y</sub> ÷ s<sub>x</sub>. If both variables are standardised to z-scores, both standard deviations are 1 and the slope equals r. Also, in simple linear regression the R² of the model equals r².</div></details>
</main>
`
});
