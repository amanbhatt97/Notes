// notes/mathstats/st_descriptive.js — Descriptive Statistics
Object.assign(TOPIC_CONTENT, {
  "st_descriptive": `<main>
  <h1>Descriptive Statistics</h1>
  <div class="where"><span>Mathematics &amp; Statistics</span><span>Statistics</span><span>Descriptive Statistics</span></div>
  <p class="lead">Summarising a column in a few honest numbers: centre, spread, relative position, outliers and shape. This note builds every measure as the answer to a question the previous measure could not answer, all on ONE running example: the monthly salaries of ten people at a small startup, one of whom is the founder. You will see the mean, median and mode disagree on the same data, the spread measures from range to IQR to variance to standard deviation, the CV and z-scores that let you compare across units, three outlier rules (one of which cannot possibly fire here), skewness and kurtosis worked by hand, the five-number summary and box plot, how to describe and transform a column, and the step to two variables. It ends with one table that connects every measure to the ones it is built from.</p>

  <h2 id="sde-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 170" width="660">
<defs><marker id="sde-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="120" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="70" y="41" text-anchor="middle" font-size="12" font-weight="700">Descriptive</text><text x="70" y="59" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<line x1="130" y1="45" x2="148" y2="45" stroke="currentColor" marker-end="url(#sde-a0)"/>
<rect x="150" y="20" width="110" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="205" y="41" text-anchor="middle" font-size="12">Probability</text><text x="205" y="58" text-anchor="middle" class="tm" font-size="10">how likely?</text>
<line x1="260" y1="45" x2="278" y2="45" stroke="currentColor" marker-end="url(#sde-a0)"/>
<rect x="280" y="20" width="110" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="335" y="41" text-anchor="middle" font-size="12">Distributions</text><text x="335" y="58" text-anchor="middle" class="tm" font-size="10">named shapes</text>
<line x1="390" y1="45" x2="408" y2="45" stroke="currentColor" marker-end="url(#sde-a0)"/>
<rect x="410" y="20" width="110" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="465" y="41" text-anchor="middle" font-size="12">Hypothesis</text><text x="465" y="58" text-anchor="middle" class="tm" font-size="10">real or noise?</text>
<line x1="520" y1="45" x2="538" y2="45" stroke="currentColor" marker-end="url(#sde-a0)"/>
<rect x="540" y="20" width="110" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="595" y="41" text-anchor="middle" font-size="12">A/B Testing</text><text x="595" y="58" text-anchor="middle" class="tm" font-size="10">decide with data</text>
<line x1="70" y1="70" x2="70" y2="108" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#sde-a0)"/>
<rect x="10" y="110" width="160" height="46" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="90" y="130" text-anchor="middle" font-size="12">Correlation</text><text x="90" y="147" text-anchor="middle" class="tm" font-size="10">two columns at once</text>
<text x="400" y="125" text-anchor="middle" class="tm" font-size="10.5">mean, SD, z-scores and skew from this note are used</text><text x="400" y="141" text-anchor="middle" class="tm" font-size="10.5">in every later note of the Statistics group</text>
</svg><figcaption>The Statistics group. Descriptive statistics comes first: it describes the data you have. Everything to its right is about data you have not seen yet.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: a raw column of numbers</b><span>You loaded a table (see <a class="xref" data-note="da_pandas">Pandas</a>) and have a column of 10 or 10 million values. Nobody can read them all. What do you say about the column?</span></li>
    <li><b>This note adds: a few honest numbers that stand for the whole column</b><span>Where is the centre, how spread out is it, where does one value stand, which values are unusual, what shape does it have, and how do you see and report all of it.</span></li>
    <li><b>Leads to: <a class="xref" data-note="st_probability">Probability</a></b><span>Descriptive statistics only describes the data in hand. Probability asks about data you have not seen yet: how likely is a value, a mean, a difference? Then <a class="xref" data-note="st_distributions">Distributions</a> names the common shapes you meet here (the bell curve behind "68-95-99.7"), <a class="xref" data-note="st_correlation">Correlation</a> extends spread to two columns, and <a class="xref" data-note="st_hypothesis">Hypothesis Testing</a> and <a class="xref" data-note="st_abtesting">A/B Testing</a> compare means and spreads between groups.</span></li>
  </ol>

  <h2 id="sde-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each measure answers the question above it, and its weakness raises the next question. All the numbers are from the same ten salaries (₹ thousand per month): 30, 35, 35, 35, 40, 45, 55, 60, 70 and the founder's 295.</p>
  <ol class="story">
    <li><b>Mean</b><span>Q: what is a typical salary? → Add all and divide: 700 / 10 = 70. It is the balance point: the gaps above and below cancel. But one person (the founder) dragged it to 70, where nobody earns…</span></li>
    <li><b>Median</b><span>Q: is there a "typical" that one extreme value cannot drag? → Sort and take the middle: 42.5. Remove the founder and it moves only 2.5 (the mean moves 25). But it needs numbers, and the department column has none…</span></li>
    <li><b>Mode</b><span>Q: what is typical for categories? → The most frequent value: Engineering (5 of 10); for salary, 35. Now we know the centre three ways. But two companies with the same centre can feel completely different…</span></li>
    <li><b>Range</b><span>Q: how spread out are the values? → max − min: our nine staff 40, a government office 8, same mean 45. But add the founder and the range jumps to 265: it listens only to the two most extreme people…</span></li>
    <li><b>Percentiles, quartiles &amp; IQR</b><span>Q: a spread that ignores the extremes? → Width of the middle half, Q3 − Q1 = 58.75 − 35 = 23.75 (20 without the founder). Robust, but it uses only two values and ignores everyone's actual distance from the centre…</span></li>
    <li><b>Variance</b><span>Q: a spread built from every person's gap, like the mean uses every value? → Gaps sum to 0, so square them, add (57,750) and divide by n − 1: 6,416.67. But that is in "squared rupees", which no one can picture…</span></li>
    <li><b>Standard deviation</b><span>Q: spread in the original units? → √variance = 80.1: "₹70k give or take ₹80k". But an SD of 80 for salary and 7.3 for height cannot be compared, and "is 295 far?" needs a ruler…</span></li>
    <li><b>CV &amp; z-scores</b><span>Q: how do we compare spreads and positions across units? → CV = SD / mean (salary 1.14 vs height 0.043); z = (x − mean) / SD (founder: 2.81 SDs above). Can z flag the founder as an outlier?</span></li>
    <li><b>Outlier rules</b><span>Q: which values are unusual? → |z| &gt; 3 cannot fire with 10 people (max is 3), and the founder inflates the SD (masking). Tukey fences (above 94.4) and robust z (17.0, using median and MAD) catch him. But no number so far says which side the long tail is on: "70 ± 80" looks symmetric…</span></li>
    <li><b>Skewness</b><span>Q: is one side's tail longer? → Average of z³: 2.54, strongly right-skewed; mode 35 &lt; median 42.5 &lt; mean 70. But is that one extreme person or a gradual long tail?</span></li>
    <li><b>Kurtosis</b><span>Q: how heavy are the tails, how extreme are the extremes? → Average of z⁴ minus 3: 4.71; the founder supplies 99.7% of it. Now we have a dozen numbers. Can we see them all at once, and catch what numbers miss?</span></li>
    <li><b>Five-number summary, box plot, histogram</b><span>Q: how do I see it all? → min 30, Q1 35, median 42.5, Q3 58.75, max 295 drawn as a box, plus a histogram for humps the box hides. Then how do I say it, and can I fix the shape?</span></li>
    <li><b>Describe &amp; transform</b><span>Q: how do I report the column and prepare it for models? → Shape, centre, spread, outliers, context; a log transform pulls in a long right tail. But every number so far describes one column; does salary rise with experience?</span></li>
    <li><b>Covariance &amp; correlation (pointer)</b><span>Q: how do two columns move together? → Average product of the two columns' gaps from their means: r = 0.74 with the founder, 0.99 without. The full story is in <a class="xref" data-note="st_correlation">Correlation</a>.</span></li>
  </ol>

  <h2 id="sde-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Descriptive Statistics</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Centre</div>
        <ul>
          <li><b>Mean</b> — <code>Σx / n</code>; balance point; gaps sum to 0. Ours: 700/10 = 70</li>
          <li><b>Median</b> — middle of sorted data: (40 + 45)/2 = 42.5; robust</li>
          <li><b>Mode</b> — most frequent: salary 35, department Engineering</li>
          <li><b>Robustness</b> — drop founder: mean 70 → 45, median 42.5 → 40</li>
          <li><b>Use</b> — mean for symmetric data and totals (payroll = 10 × 70 = 700); median for skewed money/latency</li>
          <li>⚠ <b>Trap</b> — "average salary ₹70k" when 9 of 10 earn ≤ ₹70k</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Spread</div>
        <ul>
          <li><b>Range</b> — max − min: 265 (40 without founder); listens to 2 values</li>
          <li><b>IQR</b> — Q3 − Q1 = 58.75 − 35 = 23.75; middle half; robust</li>
          <li><b>Variance</b> — <code>Σ(x − x̄)² / (n − 1)</code> = 57,750 / 9 = 6,416.67</li>
          <li><b>SD</b> — √variance = 80.1, in ₹k; 13.69 without founder</li>
          <li><b>n − 1 (Bessel)</b> — sample mean hugs its own data; ÷n is too small on average (80 vs 100 in simulation)</li>
          <li>⚠ <b>Trap</b> — numpy ddof=0 (75.99), pandas ddof=1 (80.1)</li>
          <li><b>68-95-99.7</b> — ±1/2/3 SD, only for bell-shaped data</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Relative position</div>
        <ul>
          <li><b>CV</b> — SD / mean: salary 1.14 vs height 0.043; unit-free</li>
          <li><b>z-score</b> — (x − mean) / SD: founder salary 2.81, height 1.65</li>
          <li><b>Percentile rank</b> — ₹55k beats 60% of the company</li>
          <li>⚠ <b>Trap</b> — CV useless when mean ≈ 0 or values can be negative</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Outliers</div>
        <ul>
          <li><b>Tukey fences</b> — outside <code>Q1 − 1.5·IQR … Q3 + 1.5·IQR</code> = −0.6 … 94.4 → 295 flagged</li>
          <li><b>z rule</b> — |z| &gt; 3: founder only 2.96; with n = 10, |z| can never exceed 3</li>
          <li><b>Masking</b> — the outlier inflates the SD it is measured with</li>
          <li><b>Robust z</b> — 0.6745·(x − median)/MAD = 17.0 (MAD = 10)</li>
          <li><b>Handle</b> — investigate; fix errors; cap/log real extremes; don't blindly delete</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Shape</div>
        <ul>
          <li><b>Skewness</b> — mean of z³ = 2.54 (0.70 without founder)</li>
          <li><b>Right skew</b> — mode 35 &lt; median 42.5 &lt; mean 70</li>
          <li><b>Scale</b> — |skew| &lt; 0.5 symmetric, 0.5–1 moderate, &gt; 1 strong</li>
          <li><b>Kurtosis</b> — mean of z⁴ = 7.71; excess = 4.71; tails, not peak</li>
          <li><b>Higher power, less robust</b> — founder owns 50% / 88% / 98% / 99.7% at powers 1–4</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">See &amp; Say</div>
        <ul>
          <li><b>Five numbers</b> — 30, 35, 42.5, 58.75, 295 → box plot</li>
          <li><b>Box</b> — IQR; line = median; whiskers to last point inside fences; dots = outliers</li>
          <li><b>describe()</b> — mean ≫ median or SD ≫ IQR → skew/outliers</li>
          <li>⚠ <b>Trap</b> — box hides two humps; add a histogram</li>
          <li><b>Words</b> — shape → centre → spread → unusual points → context</li>
          <li><b>Log</b> — pulls in a right tail; back-transform = geometric mean (52.5)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Two Variables</div>
        <ul>
          <li><b>Covariance</b> — average product of gaps: 220.6 (years × ₹k)</li>
          <li><b>Pearson r</b> — 0.74 with founder, 0.99 without: sensitive like the mean</li>
          <li><b>Spearman</b> — ranks: 0.99; robust like the median</li>
          <li><b>Next</b> — <a class="xref" data-note="st_correlation">Correlation</a></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sde-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="sde-mean"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">A Typical Value: the Mean</span><span class="rm-sub">Ten salaries, one founder</span></div></div>
      <div class="rm-item rm-done" data-target="sde-median"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Median</span><span class="rm-sub">A centre one person can't drag</span></div></div>
      <div class="rm-item rm-done" data-target="sde-mode"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Mode</span><span class="rm-sub">Categories, and three centres compared</span></div></div>
      <div class="rm-item rm-done" data-target="sde-range"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Range, Percentiles &amp; IQR</span><span class="rm-sub">Same centre, different spread</span></div></div>
      <div class="rm-item rm-done" data-target="sde-var"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Variance</span><span class="rm-sub">Squared gaps, and why n − 1</span></div></div>
      <div class="rm-item rm-done" data-target="sde-sd"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Standard Deviation</span><span class="rm-sub">Back to rupees</span></div></div>
      <div class="rm-item rm-done" data-target="sde-cvz"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">CV &amp; z-Scores</span><span class="rm-sub">Comparing across units</span></div></div>
      <div class="rm-item rm-done" data-target="sde-out"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Outliers</span><span class="rm-sub">Fences, z, robust z</span></div></div>
      <div class="rm-item rm-done" data-target="sde-skew"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Skewness</span><span class="rm-sub">Which way the tail points</span></div></div>
      <div class="rm-item rm-done" data-target="sde-kurt"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Kurtosis</span><span class="rm-sub">How heavy the tails are</span></div></div>
      <div class="rm-item rm-done" data-target="sde-box"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Seeing It All</span><span class="rm-sub">Five numbers, box plot, histogram</span></div></div>
      <div class="rm-item rm-done" data-target="sde-words"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Describe &amp; Transform</span><span class="rm-sub">The one-sentence summary, log</span></div></div>
      <div class="rm-item rm-done" data-target="sde-two"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Two Variables</span><span class="rm-sub">Covariance &amp; correlation pointer</span></div></div>
      <div class="rm-item rm-done" data-target="sde-connect"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">Two families of measures</span></div></div>
      <div class="rm-item rm-done" data-target="sde-traps"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Traps in reports and code</span></div></div>
      <div class="rm-item rm-done" data-target="sde-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="sde-qa"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="sde-mean"><span class="num">01</span>A Typical Value: the Mean</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We have a column of numbers and no way to talk about it except reading every value. With 10 values that is annoying; with 10,000 it is impossible. What single number can stand for "a typical value"?</p>
  </div>
  <p>You will do this on day one of every data job. It is called EDA ("exploratory data analysis"): before any model, you describe each column in a few numbers. Interviewers ask about it because a wrong summary quietly misleads a whole company. <strong>Descriptive statistics</strong> is the toolkit for that description.</p>
  <h3>The running example</h3>
  <p>A small startup has ten people. Here is their monthly salary in ₹ thousand, plus three more columns we will need later (department for the mode, height for comparing units, years of experience for two-variable questions). Every section of this note uses this same table.</p>
  <table class="tbl out"><caption>The running example: ten people at a startup</caption>
    <tr><th>Person</th><td>Anu</td><td>Bala</td><td>Chirag</td><td>Divya</td><td>Eshan</td><td>Farah</td><td>Gopal</td><td>Hema</td><td>Imran</td><td>Kavya (founder)</td></tr>
    <tr><th>Salary (₹k)</th><td>30</td><td>35</td><td>35</td><td>35</td><td>40</td><td>45</td><td>55</td><td>60</td><td>70</td><td><strong>295</strong></td></tr>
    <tr><th>Department</th><td>Eng</td><td>Eng</td><td>Sales</td><td>Eng</td><td>Ops</td><td>Sales</td><td>Eng</td><td>Ops</td><td>Eng</td><td>Mgmt</td></tr>
    <tr><th>Height (cm)</th><td>158</td><td>162</td><td>165</td><td>168</td><td>170</td><td>170</td><td>172</td><td>175</td><td>178</td><td>182</td></tr>
    <tr><th>Years exp.</th><td>1</td><td>2</td><td>2</td><td>3</td><td>4</td><td>5</td><td>7</td><td>8</td><td>10</td><td>12</td></tr>
  </table>
  <h3>The mean, by hand</h3>
  <p>The most natural "typical value": share the total equally. Add all salaries: 30 + 35 + 35 + 35 + 40 + 45 + 55 + 60 + 70 + 295 = 700. Divide by the number of people: 700 / 10 = <strong>70</strong>. That is the <strong>mean</strong> (the everyday "average").</p>
  <p>Now look at each person's gap from 70: −40, −35, −35, −35, −30, −25, −15, −10, 0, +225. The nine negative gaps add to −225, and the founder alone supplies +225. They cancel exactly: the gaps from the mean <em>always</em> sum to zero. That is what "the mean is the balance point" means, and it is the fact that will force us to square gaps in section 05.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The mean is a see-saw's balance point. Put each salary as a weight on a plank at its value. Nine people sit between 30 and 70; one heavy weight sits far out at 295. The plank balances at 70, because a weight far from the pivot pushes much harder. The founder alone balances all nine others.</p>
  </div>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd
from scipy import stats
np.set_printoptions(suppress=True)
# monthly salary in Rs thousand; the last person is the founder
salary = np.array([30, 35, 35, 35, 40, 45, 55, 60, 70, 295])
staff = salary[:-1]                 # the nine employees, founder left out
print("n =", len(salary), "  total =", salary.sum())
print("mean =", salary.mean())
dev = salary - salary.mean()        # each person's gap from the mean
print("gaps from mean:", dev)
print("sum of gaps   :", dev.sum())</div>
  <div class="fx" data-lang="text">n = 10   total = 700
mean = 70.0
gaps from mean: [-40. -35. -35. -35. -30. -25. -15. -10.   0. 225.]
sum of gaps   : 0.0</div>
  <p>What the code does: <code>salary.mean()</code> is the sum divided by n. <code>salary - salary.mean()</code> subtracts 70 from every value at once (numpy works on whole arrays), giving each person's gap. The last line confirms the gaps cancel. <code>staff</code> keeps the nine employees without the founder; we will compare the two versions all through the note.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>mean</strong> of values x₁ … xₙ is x̄ = (x₁ + x₂ + … + xₙ) / n = Σxᵢ / n. Σ ("sigma") means "add up over all i", n is the number of values, x̄ is read "x bar". Key property: Σ(xᵢ − x̄) = 0. The mean is also the value c that makes Σ(xᵢ − c)² smallest, which is why it pairs naturally with the variance later.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"The average salary here is ₹70k" is true and misleading: 9 of the 10 people earn ₹70k or less, and Imran, at exactly the mean, is the second-highest earner. The mean is the right number for <em>totals</em> (monthly payroll = 10 × 70 = ₹700k) but a poor "typical person" when one value is extreme.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the median.</b> One person dragged the mean to 70, a salary almost nobody is near. We need a "typical value" that one extreme person cannot pull around.</div>

  <h2 id="sde-median"><span class="num">02</span>The Median</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The mean listens to every value in proportion to its size, so one ₹295k salary moved it far from where people actually are. Is there a centre that only cares about <em>order</em>, not about how big the biggest value is?</p>
  </div>
  <p>Line everyone up from lowest to highest salary and pick the person in the middle. That is the <strong>median</strong>. With 10 people there is no single middle person, so take the two middle ones (5th and 6th) and average them.</p>
  <table class="tbl out"><caption>Median by hand</caption>
    <tr><th>Sorted</th><td>30</td><td>35</td><td>35</td><td>35</td><td><strong>40</strong></td><td><strong>45</strong></td><td>55</td><td>60</td><td>70</td><td>295</td></tr>
    <tr><th>Position</th><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td></tr>
  </table>
  <p>Median = (40 + 45) / 2 = <strong>42.5</strong>. Half the company earns less than ₹42.5k and half earns more. That matches how the company actually feels.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The median is the person standing in the middle of a queue sorted by salary. If the founder at the end of the queue becomes a billionaire, the middle person does not change. The mean, the see-saw, would tip wildly.</p>
  </div>
  <div class="fx" data-lang="py">print("sorted:", np.sort(salary))
print("median:", np.median(salary))
print("without founder -&gt; mean", round(staff.mean(), 2), " median", np.median(staff))</div>
  <div class="fx" data-lang="text">sorted: [ 30  35  35  35  40  45  55  60  70 295]
median: 42.5
without founder -&gt; mean 45.0  median 40.0</div>
  <p>The test of robustness: take the founder out. The mean falls from 70 to 45, a move of 25. The median moves from 42.5 to 40 (with nine people the middle is simply the 5th value), a move of 2.5. If the founder's salary were 2,950 instead of 295, the median would not move at all. A summary that barely moves when a few extreme values come or go is called <strong>robust</strong>.</p>
  <p>A neat way to say it: the median survives until half the data is corrupted (you would have to push 5 of the 10 values to infinity to drag it), while the mean breaks with a single bad value. Statisticians call this the <em>breakdown point</em>: 50% for the median, 0% for the mean.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>median</strong> is the middle value of the sorted data: the value at position (n + 1)/2 if n is odd, and the average of positions n/2 and n/2 + 1 if n is even. It is the 50th percentile (section 04). It minimises Σ|xᵢ − c|, the sum of absolute (not squared) gaps.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The median ignores how big the extremes are, which is sometimes exactly what you need. Payroll budget = 10 × median = ₹425k is wrong by ₹275k; only the mean gives totals. Report the median for "a typical person", the mean for "how much money in total", and say why they differ.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the mode.</b> The mean and median both need numbers you can add or sort. What is the "typical department"? You cannot average Eng and Sales.</div>

  <h2 id="sde-mode"><span class="num">03</span>The Mode</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Some columns are categories: department, city, device. There is no "average department" and no way to sort them meaningfully. How do we name the typical value of a category column?</p>
  </div>
  <p>Count how often each value appears and pick the most common one. That is the <strong>mode</strong>. Departments: Eng appears 5 times, Sales 2, Ops 2, Mgmt 1, so the mode is <strong>Eng</strong>. The mode also works on numbers: three people earn exactly ₹35k (the entry-level band), more than any other value, so the salary mode is <strong>35</strong>.</p>
  <div class="fx" data-lang="py">vals, counts = np.unique(salary, return_counts=True)
print(dict(zip(vals.tolist(), counts.tolist())))
print("mode of salary:", stats.mode(salary).mode)
dept = pd.Series(["Eng", "Eng", "Sales", "Eng", "Ops",
                  "Sales", "Eng", "Ops", "Eng", "Mgmt"])
print(dept.value_counts().to_dict())
print("mode of dept:", dept.mode()[0])</div>
  <div class="fx" data-lang="text">{30: 1, 35: 3, 40: 1, 45: 1, 55: 1, 60: 1, 70: 1, 295: 1}
mode of salary: 35
{'Eng': 5, 'Sales': 2, 'Ops': 2, 'Mgmt': 1}
mode of dept: Eng</div>
  <p>What the code does: <code>np.unique(..., return_counts=True)</code> lists each distinct value with its count; <code>stats.mode</code> returns the most frequent one. For a pandas column of text, <code>value_counts()</code> gives the counts and <code>.mode()</code> the winner (it returns a Series because there can be ties).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The mode is a vote: every value votes for itself and the most popular wins. It does not care how far apart the candidates are, only how many votes each got.</p>
  </div>
  <h3>Three centres on the same data</h3>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600"><line x1="30" y1="122" x2="570" y2="122" stroke="currentColor" stroke-opacity=".5"/><text x="30.0" y="137" text-anchor="middle" font-size="11">0</text><text x="120.0" y="137" text-anchor="middle" font-size="11">50</text><text x="210.0" y="137" text-anchor="middle" font-size="11">100</text><text x="300.0" y="137" text-anchor="middle" font-size="11">150</text><text x="390.0" y="137" text-anchor="middle" font-size="11">200</text><text x="480.0" y="137" text-anchor="middle" font-size="11">250</text><text x="570.0" y="137" text-anchor="middle" font-size="11">300</text><text x="470" y="117" text-anchor="end" font-size="11" class="tm">salary (Rs k / month)</text><circle cx="84.0" cy="110" r="6" class="fb sb"/><circle cx="93.0" cy="110" r="6" class="fb sb"/><circle cx="93.0" cy="97" r="6" class="fb sb"/><circle cx="93.0" cy="84" r="6" class="fb sb"/><circle cx="102.0" cy="110" r="6" class="fb sb"/><circle cx="111.0" cy="110" r="6" class="fb sb"/><circle cx="129.0" cy="110" r="6" class="fb sb"/><circle cx="138.0" cy="110" r="6" class="fb sb"/><circle cx="156.0" cy="110" r="6" class="fb sb"/><circle cx="561.0" cy="110" r="6" class="fb sb"/><line x1="93.0" y1="122" x2="93.0" y2="34" class="st" stroke-dasharray="4 3"/><text x="90.0" y="30" text-anchor="end" font-size="11">mode 35</text><line x1="106.5" y1="122" x2="106.5" y2="20" class="sg" stroke-dasharray="4 3"/><text x="109.5" y="16" text-anchor="start" font-size="11">median 42.5</text><line x1="156.0" y1="122" x2="156.0" y2="48" class="sr" stroke-dasharray="4 3"/><text x="159.0" y="44" text-anchor="start" font-size="11">mean 70</text><text x="561.0" y="92" text-anchor="middle" font-size="11">founder</text><text x="354.0" y="80" text-anchor="middle" font-size="11" class="tm">nobody earns near the mean</text></svg><figcaption>The same ten salaries, three "typical values". Mode 35 sits where most people cluster, median 42.5 splits the company in half, and the founder drags the mean to 70, where almost nobody is.</figcaption></figure>
  <p>Read the dashed lines from left to right: <strong>mode 35 &lt; median 42.5 &lt; mean 70</strong>. That ordering is not an accident. The mode sits at the crowd, the median is pulled a little by the order of everyone, and the mean is pulled hardest by the far-right founder. This exact order is the fingerprint of a long right tail, which section 09 turns into a number (skewness).</p>
  <table class="tbl">
    <tr><th>Measure</th><th>Formula, in words</th><th>Our salaries</th><th>Misleads when…</th><th>Use for</th></tr>
    <tr><td><strong>Mean</strong></td><td><code>Σx / n</code>: add every value, divide by how many</td><td>70</td><td>Outliers or a long tail on one side (salaries, revenue)</td><td>Roughly symmetric data; totals ("payroll = mean × people")</td></tr>
    <tr><td><strong>Median</strong></td><td>Middle value after sorting (average of the two middles if n is even)</td><td>42.5</td><td>Rarely; it ignores how big the tail is</td><td>Lopsided data: income, house prices, delivery time</td></tr>
    <tr><td><strong>Mode</strong></td><td>Most frequent value</td><td>35 (dept: Eng)</td><td>Decimal data (every value is unique); several equal peaks</td><td>Categories: most common city, device, department</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>mode</strong> is the value with the highest frequency. A column can have one mode (unimodal), two (bimodal) or more. For continuous data, where every value is unique, use the <em>modal class</em>: the tallest bar of a histogram.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>On decimal data (₹35,214.50, ₹35,290.10 …) every value appears once and "the mode" is meaningless. And a column with two peaks (junior and senior bands) has two modes; reporting one hides the other.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: range and IQR.</b> We know the centre three ways. But two companies can share the same centre and feel completely different to work at: one pays everyone about the same, the other pays all over the place. We need a number for <em>spread</em>.</div>

  <h2 id="sde-range"><span class="num">04</span>Range, Percentiles &amp; IQR</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Our nine employees (founder aside) have mean ₹45k. A government office with nine staff also has mean ₹45k. Same centre. Are the two pay structures the same? The centre cannot tell us.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600"><line x1="60" y1="162" x2="560" y2="162" stroke="currentColor" stroke-opacity=".5"/><text x="60" y="177" text-anchor="middle" font-size="11">25</text><text x="110" y="177" text-anchor="middle" font-size="11">30</text><text x="160" y="177" text-anchor="middle" font-size="11">35</text><text x="210" y="177" text-anchor="middle" font-size="11">40</text><text x="260" y="177" text-anchor="middle" font-size="11">45</text><text x="310" y="177" text-anchor="middle" font-size="11">50</text><text x="360" y="177" text-anchor="middle" font-size="11">55</text><text x="410" y="177" text-anchor="middle" font-size="11">60</text><text x="460" y="177" text-anchor="middle" font-size="11">65</text><text x="510" y="177" text-anchor="middle" font-size="11">70</text><text x="560" y="177" text-anchor="middle" font-size="11">75</text><text x="560" y="157" text-anchor="end" font-size="11" class="tm">salary (Rs k)</text><text x="8" y="64" font-size="11">our 9</text><text x="8" y="136" font-size="11">office</text><circle cx="110" cy="70" r="6" class="fb sb"/><circle cx="160" cy="70" r="6" class="fb sb"/><circle cx="160" cy="57" r="6" class="fb sb"/><circle cx="160" cy="44" r="6" class="fb sb"/><circle cx="210" cy="70" r="6" class="fb sb"/><circle cx="260" cy="70" r="6" class="fb sb"/><circle cx="360" cy="70" r="6" class="fb sb"/><circle cx="410" cy="70" r="6" class="fb sb"/><circle cx="510" cy="70" r="6" class="fb sb"/><circle cx="220" cy="142" r="5" class="ft st"/><circle cx="240" cy="142" r="5" class="ft st"/><circle cx="250" cy="142" r="5" class="ft st"/><circle cx="260" cy="142" r="5" class="ft st"/><circle cx="260" cy="129" r="5" class="ft st"/><circle cx="260" cy="116" r="5" class="ft st"/><circle cx="270" cy="142" r="5" class="ft st"/><circle cx="280" cy="142" r="5" class="ft st"/><circle cx="300" cy="142" r="5" class="ft st"/><line x1="260" y1="162" x2="260" y2="14" class="sr" stroke-dasharray="4 3"/><text x="264" y="14" font-size="11">both means = 45</text><line x1="110" y1="84" x2="510" y2="84" class="sb" stroke-width="1.5"/><text x="516" y="88" font-size="10.5" class="tb">range 40</text><line x1="220" y1="152" x2="300" y2="152" class="st" stroke-width="1.5"/><text x="306" y="148" font-size="10.5">range 8</text></svg><figcaption>Same mean (45), very different spread. Our staff run from 30 to 70; the office runs from 41 to 49.</figcaption></figure>
  <p>One look at the picture says no: our salaries are scattered from 30 to 70, the office's huddle between 41 and 49. The simplest number for that is the <strong>range</strong>, max − min: 70 − 30 = 40 for us, 49 − 41 = 8 for the office.</p>
  <p>But put the founder back and our range becomes 295 − 30 = 265. One person changed the spread from 40 to 265. The range uses only the two most extreme values, so it inherits all their quirks. We need a spread that ignores the extremes, which means talking about positions in the sorted data: percentiles.</p>
  <h3>Percentiles and quartiles</h3>
  <p>"Gopal earns ₹55k." High or low? It depends on everyone else. Six of the ten earn less than 55, so Gopal is at the <strong>60th percentile</strong>: a percentile turns a raw number into a rank out of 100. "Percentile p" is the value with p% of the data below it. The median is the 50th percentile. <strong>Quartiles</strong> cut the data into quarters: Q1 is the 25th percentile, Q3 the 75th.</p>
  <p>Percentiles are also the standard way to talk about speed. A website promise like "p95 latency under 300 ms" means 95% of requests finish within 300 ms; the mean would hide the slow 5% that users actually complain about.</p>
  <p>With few values, a percentile usually falls <em>between</em> two data points, so we need a rule. numpy's default (linear interpolation) is: sort, number the positions from 0 to n − 1, and go to position p × (n − 1). If that is not a whole number, move proportionally between the two neighbours.</p>
  <table class="tbl out"><caption>Quartiles by hand, sorted salaries at positions 0–9</caption>
    <tr><th></th><th>Position p × (n − 1)</th><th>Neighbours</th><th>Value</th></tr>
    <tr><td>Q1 (p = 0.25)</td><td>0.25 × 9 = 2.25</td><td>pos 2 = 35, pos 3 = 35</td><td>35 + 0.25 × (35 − 35) = <strong>35</strong></td></tr>
    <tr><td>Median (p = 0.5)</td><td>0.5 × 9 = 4.5</td><td>pos 4 = 40, pos 5 = 45</td><td>40 + 0.5 × 5 = <strong>42.5</strong></td></tr>
    <tr><td>Q3 (p = 0.75)</td><td>0.75 × 9 = 6.75</td><td>pos 6 = 55, pos 7 = 60</td><td>55 + 0.75 × 5 = <strong>58.75</strong></td></tr>
  </table>
  <p>The <strong>IQR</strong> (interquartile range) is Q3 − Q1 = 58.75 − 35 = <strong>23.75</strong>: the width of the middle half of the company. The founder sits in the top quarter, outside the box, so his salary could be anything and Q3 would only shift by where the 7th and 8th people sit.</p>
  <div class="fx" data-lang="py">office = np.array([41, 43, 44, 45, 45, 45, 46, 47, 49])   # a government office, 9 staff
for name, x in [("our 9 staff", staff), ("office", office), ("our 10 + founder", salary)]:
    q1, q3 = np.percentile(x, [25, 75])
    print(f"{name:17s} mean {x.mean():5.1f}  range {x.max() - x.min():5.1f}"
          f"  Q1 {q1:5.2f}  Q3 {q3:5.2f}  IQR {q3 - q1:5.2f}")
print("Rs 55k beats", stats.percentileofscore(salary, 55, kind="strict"), "% of the company")</div>
  <div class="fx" data-lang="text">our 9 staff       mean  45.0  range  40.0  Q1 35.00  Q3 55.00  IQR 20.00
office            mean  45.0  range   8.0  Q1 44.00  Q3 46.00  IQR  2.00
our 10 + founder  mean  70.0  range 265.0  Q1 35.00  Q3 58.75  IQR 23.75
Rs 55k beats 60.0 % of the company</div>
  <p>What the code does: <code>np.percentile(x, [25, 75])</code> returns Q1 and Q3 with the linear rule above. <code>percentileofscore(..., kind="strict")</code> counts the share of values strictly below 55. Read the output: adding the founder moved the range from 40 to 265 but the IQR only from 20 to 23.75. The office's IQR is 2, ten times smaller than ours: a clear, robust "they pay everyone about the same".</p>
  <div class="cards">
    <div><b>Percentile p</b><p>The value below which p% of data falls.</p><small>p50 = median; p95/p99 for latency promises</small></div>
    <div><b>IQR</b><p>Q3 − Q1: the width of the middle 50%.</p><small>Ignores both tails, so outliers can't inflate it</small></div>
    <div><b>Range</b><p>max − min: the full width.</p><small>Decided by the two most extreme values only</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>range</strong> is max − min. The <strong>p-th percentile</strong> is a value with p% of observations at or below it; Q1, Q2 (median) and Q3 are the 25th, 50th and 75th. The <strong>IQR</strong> = Q3 − Q1 is a robust measure of spread.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>There are about nine percentile conventions (numpy, Excel, R and textbooks differ). On 10 values they can give different quartiles; on 10,000 values they agree. Don't be alarmed when your hand answer differs from a library's by a little on tiny data; state the method.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: variance.</b> The IQR is robust, but it looks at only two values (Q1 and Q3) and ignores how far each person actually is from the centre. We want a spread built from <em>every</em> person's gap, the way the mean is built from every value.</div>

  <h2 id="sde-var"><span class="num">05</span>Variance</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each person has a gap from the mean (section 01). Can we combine all ten gaps into one "typical distance from the centre"?</p>
  </div>
  <p>The obvious idea: average the gaps. But we already saw that the gaps −40, −35, −35, −35, −30, −25, −15, −10, 0, +225 sum to exactly 0, for <em>any</em> data, because the mean is the balance point. Averaging them always gives 0. We have to stop the negatives cancelling the positives.</p>
  <p>Two ways: take absolute values (the mean absolute deviation), or square each gap. Squaring wins in practice because squares have clean algebra (they add up nicely for sums of variables, and calculus works on them), so it is the standard. The average squared gap is the <strong>variance</strong>.</p>
  <div class="flow"><span>Subtract the mean</span><span>Square each gap</span><span>Add them up (SS)</span><span>Divide by n − 1</span><span>= variance</span></div>
  <table class="tbl out"><caption>Variance by hand on the ten salaries, mean = 70</caption>
    <tr><th>x</th><td>30</td><td>35</td><td>35</td><td>35</td><td>40</td><td>45</td><td>55</td><td>60</td><td>70</td><td>295</td><th>sum</th></tr>
    <tr><th>x − 70</th><td>−40</td><td>−35</td><td>−35</td><td>−35</td><td>−30</td><td>−25</td><td>−15</td><td>−10</td><td>0</td><td>225</td><td>0</td></tr>
    <tr><th>(x − 70)²</th><td>1600</td><td>1225</td><td>1225</td><td>1225</td><td>900</td><td>625</td><td>225</td><td>100</td><td>0</td><td>50625</td><td><strong>57750</strong></td></tr>
  </table>
  <p>The sum of squared gaps (SS) is 57,750. Divide by n − 1 = 9: variance = <strong>6,416.67</strong>. Look at the last column: the founder's single squared gap, 50,625, is 87.7% of the total. Squaring makes big gaps count enormously more than small ones (a gap of 225 is 6.4× a gap of 35, but its square is 41× bigger).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Squaring is like a speeding fine that grows with the square of how fast you went: 10 km/h over costs 100, 50 over costs 2,500. One wild driver pays more than all the mild ones together. Variance is "average fine", and the founder is the wild driver.</p>
  </div>
  <div class="fx" data-lang="py">sq = dev ** 2                       # squared gaps from the mean 70
print("squared gaps:", sq)
ss = sq.sum()
print("SS =", ss)
print("variance = SS/(n-1) =", round(ss / (len(salary) - 1), 2),
      "  numpy:", round(salary.var(ddof=1), 2))
print("founder's share of SS:", round(sq[-1] / ss, 3))</div>
  <div class="fx" data-lang="text">squared gaps: [ 1600.  1225.  1225.  1225.   900.   625.   225.   100.     0. 50625.]
SS = 57750.0
variance = SS/(n-1) = 6416.67   numpy: 6416.67
founder's share of SS: 0.877</div>
  <p>What the code does: <code>dev ** 2</code> squares each gap from block 01; the sum is SS; dividing by <code>len(salary) - 1</code> gives the sample variance, the same number as <code>var(ddof=1)</code>. <code>ddof</code> means "delta degrees of freedom", how much to subtract from n: ddof=0 divides by n, ddof=1 by n − 1.</p>
  <h3>Why divide by n − 1 (Bessel's correction)</h3>
  <p>Divide by n if you have the <em>whole</em> group and only want to describe it (every employee of this company). Divide by n − 1 if your data is a <em>sample</em> and you want to estimate the spread of the bigger group it came from (ten salaries surveyed from a whole industry).</p>
  <p>The reason: your sample's own mean is the point that makes the squared gaps smallest (that is the property in section 01's definition). The true mean of the whole group is somewhere else, so the real gaps are a bit bigger than the ones you measured. Dividing by a slightly smaller number pushes the answer up by just the right amount. On our nine staff: SS = 1,500, so ÷9 gives 166.67 and ÷8 gives 187.5. Check the claim by simulation: take 100,000 small samples (n = 5) from a group whose true variance is 100.</p>
  <div class="fx" data-lang="py">ss9 = ((staff - staff.mean()) ** 2).sum()
print("9 staff: SS =", ss9, " /n =", round(ss9 / 9, 2), " /(n-1) =", ss9 / 8)
rng = np.random.default_rng(0)
pop = rng.normal(0, 10, 1_000_000)             # true variance = 100
samples = rng.choice(pop, size=(100_000, 5))   # 100k samples of n=5
print("avg var, ddof=0:", round(samples.var(axis=1, ddof=0).mean(), 1))
print("avg var, ddof=1:", round(samples.var(axis=1, ddof=1).mean(), 1))</div>
  <div class="fx" data-lang="text">9 staff: SS = 1500.0  /n = 166.67  /(n-1) = 187.5
avg var, ddof=0: 80.2
avg var, ddof=1: 100.2</div>
  <p>Dividing by n lands at 80 on average, too low by exactly the factor (n − 1)/n = 4/5. Dividing by n − 1 lands at 100, the truth. "Right on average" is what statisticians call <strong>unbiased</strong>. Another way to see n − 1: once you know the mean and nine of the gaps, the tenth gap is forced (they must sum to 0), so only n − 1 gaps are free. That count is the <em>degrees of freedom</em>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>Sample <strong>variance</strong> s² = Σ(xᵢ − x̄)² / (n − 1). Population variance σ² = Σ(xᵢ − μ)² / N, where μ is the population mean and N the population size. Both are "average squared distance from the mean"; the numerator Σ(xᵢ − x̄)² is called the sum of squares (SS).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The units of variance are squared: 6,416.67 "thousand-rupees squared". Nobody can picture that, so never report a variance to a stakeholder as if it were a spread in rupees. It is a building block, not a final answer.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: standard deviation.</b> Variance uses every gap, but it is in squared rupees. We want the same idea in plain rupees: "give or take how much?"</div>

  <h2 id="sde-sd"><span class="num">06</span>Standard Deviation</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Variance 6,416.67 is in (₹k)². How do we get a spread in the same units as the salaries, something a manager can read as "give or take"?</p>
  </div>
  <p>Undo the squaring with a square root: √6,416.67 = <strong>80.1</strong>. That is the <strong>standard deviation</strong> (SD, or std). Read it as "typical distance from the mean": salaries here are ₹70k give or take ₹80k. Without the founder: ₹45k give or take ₹13.7k.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>SD is the "±" on a train's arrival. "Arrives at 9:00 ± 2 min" and "arrives at 9:00 ± 40 min" have the same mean, but only one lets you plan. Our nine staff are a ± 13.7 train; add the founder and it becomes a ± 80 train.</p>
  </div>
  <div class="fx" data-lang="py">sd = salary.std(ddof=1)
print("SD =", round(sd, 2), "  SD without founder =", round(staff.std(ddof=1), 2))
print("mean - SD =", round(salary.mean() - sd, 1), "  mean + SD =", round(salary.mean() + sd, 1))
print("numpy default (ddof=0):", round(salary.std(), 2),
      "  pandas default (ddof=1):", round(pd.Series(salary).std(), 2))</div>
  <div class="fx" data-lang="text">SD = 80.1   SD without founder = 13.69
mean - SD = -10.1   mean + SD = 150.1
numpy default (ddof=0): 75.99   pandas default (ddof=1): 80.1</div>
  <p>Look at the second line: mean ± 1 SD runs from <strong>−10.1 to 150.1</strong>. A negative salary is impossible, and nine of ten people are bunched at the bottom of that interval. "Mean ± SD" quietly assumes the data is spread evenly on both sides; ours is not. Keep this in mind: it is the problem section 09 solves.</p>
  <div class="callout intu"><span class="label">Rule of thumb (bell-shaped data only)</span>
    <p>For bell-shaped data, about 68% of values sit within ±1 SD of the mean, 95% within ±2, 99.7% within ±3. The heights in our table (mean 170 cm, SD 7.3 cm) are roughly bell-shaped, so about 95% of similar people are 155–185 cm. On lopsided data like our salaries the rule breaks, so do not quote it there. The bell curve itself is studied in <a class="xref" data-note="st_distributions">Distributions</a>.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Standard deviation</strong> s = √s² = √(Σ(xᵢ − x̄)² / (n − 1)). Same units as the data. Like the mean and variance, it is sensitive to outliers: the founder alone moves it from 13.69 to 80.1.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Defaults differ: <code>np.std</code> uses ddof=0 (75.99 here), <code>pandas .std()</code> uses ddof=1 (80.1). Same data, two different numbers, and both are "correct". On small samples the gap is noticeable; always state which one you used.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: CV and z-scores.</b> The SD carries the units of its column: salary SD 80.1 (₹k), height SD 7.26 (cm). Which column varies more? And is the founder's 295 "far" from the rest? We need a unit-free ruler.</div>

  <h2 id="sde-cvz"><span class="num">07</span>CV &amp; z-Scores</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>An SD of 80 rupees-thousand and an SD of 7.3 centimetres cannot be compared: different units, different scales. And "the founder earns 225 above the mean" means little until we know what a typical gap is. How do we measure spread and position without units?</p>
  </div>
  <p>Divide by something in the same units, and the units cancel. Two ways:</p>
  <ul>
    <li><strong>Coefficient of variation (CV)</strong> = SD / mean: spread as a fraction of the centre. Salary: 80.1 / 70 = <strong>1.14</strong> (the SD is bigger than the mean itself). Height: 7.26 / 170 = <strong>0.043</strong> (4%). Salaries here vary relatively 27 times more than heights.</li>
    <li><strong>z-score</strong> = (x − mean) / SD: how many SDs a value sits from the mean. Founder's salary: (295 − 70) / 80.1 = <strong>2.81</strong>. Founder's height: (182 − 170) / 7.26 = <strong>1.65</strong>. He is "more unusual" in salary than in height, a statement that makes sense only after removing the units.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Marks out of different totals: 45/50 in maths and 80/100 in English. You can't compare 45 and 80; you convert both to percentages first. z-scores do the same, but the "total" they divide by is the column's typical spread, and the zero point is the column's mean.</p>
  </div>
  <div class="fx" data-lang="py">height = np.array([158, 162, 165, 168, 170, 170, 172, 175, 178, 182])  # cm, same 10 people
for name, x in [("salary (Rs k)", salary), ("height (cm)", height)]:
    m, s = x.mean(), x.std(ddof=1)
    print(f"{name:14s} mean {m:6.1f}  SD {s:6.2f}  CV {s / m:.3f}")
z_sal = (salary - salary.mean()) / salary.std(ddof=1)
z_h = (height - height.mean()) / height.std(ddof=1)
print("founder: salary z =", round(z_sal[-1], 2), "  height z =", round(z_h[-1], 2))
print("Rs 30k employee z =", round(z_sal[0], 2), "  Rs 70k employee z =", round(z_sal[8], 2))</div>
  <div class="fx" data-lang="text">salary (Rs k)  mean   70.0  SD  80.10  CV 1.144
height (cm)    mean  170.0  SD   7.26  CV 0.043
founder: salary z = 2.81   height z = 1.65
Rs 30k employee z = -0.5   Rs 70k employee z = 0.0</div>
  <p>What the code does: for each column it computes the mean, SD (ddof=1) and their ratio. Then it standardises both columns: subtract the mean, divide by the SD. Every standardised column has mean 0 and SD 1, which is exactly what <code>StandardScaler</code> does before many ML models. Look at the last line: Anu (₹30k), the lowest earner, gets z = −0.5, "only half an SD below average". That is because the founder inflated the SD to 80; everyone else looks "close to average" by comparison.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>CV</strong> = s / x̄ (often ×100%). <strong>z-score</strong> zᵢ = (xᵢ − x̄) / s. A z-score has no units; z = 0 is the mean, z = 2 is two SDs above it. z-scores are the building block of skewness and kurtosis (sections 09–10), and of every test statistic in <a class="xref" data-note="st_hypothesis">Hypothesis Testing</a>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>CV only makes sense for positive data on a ratio scale (salary, weight, time). For temperature in °C or profit that can be negative, a mean near 0 makes the CV explode. And z-scores inherit the weakness of the mean and SD: one outlier distorts every other z.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: outliers.</b> z-scores are a natural ruler for "unusual". The usual rule says |z| &gt; 3 is an outlier. Does it flag the founder?</div>

  <h2 id="sde-out"><span class="num">08</span>Outliers: Fences, z and Robust z</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Everyone can see the founder is unusual. But "everyone can see" does not scale to a million rows. We need a rule that flags values so far from the rest that they deserve a second look, an <strong>outlier</strong> rule.</p>
  </div>
  <div class="fx" data-lang="py">q1, q3 = np.percentile(salary, [25, 75]); iqr = q3 - q1
lo, hi = q1 - 1.5 * iqr, q3 + 1.5 * iqr
print("fences:", lo, hi, "  flagged:", salary[(salary &lt; lo) | (salary &gt; hi)])
z = stats.zscore(salary)            # uses ddof=0
print("z:", z.round(2))
print("|z| &gt; 3 flags:", salary[np.abs(z) &gt; 3])
med, mad = np.median(salary), stats.median_abs_deviation(salary)
print("median", med, "  MAD", mad)
rz = 0.6745 * (salary - med) / mad
print("robust z:", rz.round(2))
print("|robust z| &gt; 3.5 flags:", salary[np.abs(rz) &gt; 3.5])</div>
  <div class="fx" data-lang="text">fences: -0.625 94.375   flagged: [295]
z: [-0.53 -0.46 -0.46 -0.46 -0.39 -0.33 -0.2  -0.13  0.    2.96]
|z| &gt; 3 flags: []
median 42.5   MAD 10.0
robust z: [-0.84 -0.51 -0.51 -0.51 -0.17  0.17  0.84  1.18  1.85 17.03]
|robust z| &gt; 3.5 flags: [295]</div>
  <h3>Rule 1: |z| &gt; 3 fails</h3>
  <p>The founder's z-score (scipy's <code>zscore</code> uses ddof=0, so SD = 75.99) is 225 / 75.99 = 2.96. Not above 3, so the rule flags nobody. Two reasons:</p>
  <ul>
    <li><strong>Masking.</strong> The outlier is part of the data used to compute the mean and SD, so it drags both toward itself (SD 13.7 → 76) and then measures itself with the stretched ruler.</li>
    <li><strong>A hard ceiling.</strong> With n values and ddof=0, no z-score can ever exceed √(n − 1). With n = 10 that is √9 = 3. So on ten values "|z| &gt; 3" is <em>mathematically impossible</em>, whatever the founder earns.</li>
  </ul>
  <h3>Rule 2: Tukey fences work</h3>
  <p>Use the quartiles from section 04, which the founder barely moves. Fences: Q1 − 1.5·IQR = 35 − 1.5 × 23.75 = 35 − 35.625 = <strong>−0.625</strong>, and Q3 + 1.5·IQR = 58.75 + 35.625 = <strong>94.375</strong>. Only 295 is outside, so the founder is flagged. (Why 1.5? A convention that works well on bell-shaped data; nothing deeper.)</p>
  <h3>Rule 3: the robust z-score works</h3>
  <p>Keep the z idea but swap in robust pieces: the median instead of the mean, and the <strong>MAD</strong> (median absolute deviation) instead of the SD. MAD by hand: gaps from the median 42.5 are 12.5, 7.5, 7.5, 7.5, 2.5, 2.5, 12.5, 17.5, 27.5, 252.5. Sorted: 2.5, 2.5, 7.5, 7.5, <strong>7.5, 12.5</strong>, 12.5, 17.5, 27.5, 252.5. Their median is (7.5 + 12.5)/2 = <strong>10</strong>. Robust z of the founder = 0.6745 × (295 − 42.5) / 10 = 0.6745 × 25.25 = <strong>17.03</strong>. (0.6745 puts the MAD on the same scale as an SD for bell-shaped data; the usual cut-off is 3.5.)</p>
  <div class="cards">
    <div><b>z rule</b><p>|z| &gt; 3 with mean and SD.</p><small>Masked here: 2.96; impossible above 3 when n = 10</small></div>
    <div><b>Tukey fences</b><p>Outside Q1 − 1.5·IQR … Q3 + 1.5·IQR.</p><small>Flags 295 (fence 94.4); works on skewed data</small></div>
    <div><b>Robust z</b><p>0.6745·(x − median)/MAD, cut-off 3.5.</p><small>Founder: 17.0, unmistakable</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>An <strong>outlier</strong> is a value far from the bulk of the data by some rule. <strong>MAD</strong> = median(|xᵢ − median(x)|), a robust spread. A good outlier rule uses robust statistics (quartiles, median, MAD) so that the outliers cannot hide themselves.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: deleting outliers</span>
    <p>Flagging is not deleting. Investigate first. A data error (age = 999) → fix or drop. A real extreme (the founder, a whale customer) → keep it, but describe with robust measures, cap it (winsorise) or log-transform it. Deleting real extremes hides exactly the cases the business may care about.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: skewness.</b> We now know the centre, the spread and the unusual value. But "₹70k ± 80k" still pictures a symmetric spread from −10 to 150, while the real data is a crowd on the left with one value far out on the right. No number so far says which side the long tail is on.</div>

  <h2 id="sde-skew"><span class="num">09</span>Skewness</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Mean and SD describe a centre and a width, but not whether the data leans to one side. Our salaries have a long tail to the right; a column of exam marks might have one to the left. How do we measure lopsidedness, and its direction, in one number?</p>
  </div>
  <p>A histogram that is lopsided, with a tall hump on one side and a long thin tail on the other, is <strong>skewed</strong>. The tail's direction gives its name: a tail to the right is <strong>right-skewed</strong> (positive), a tail to the left is <strong>left-skewed</strong> (negative). Salaries, house prices, order values and delivery times are right-skewed: they can't go below 0 but can go very high.</p>
  <p>To turn this into a number we need something that (a) keeps the sign of each gap, so right and left can disagree, and (b) is unit-free. Take the z-scores from section 07 and <em>cube</em> them. Cubing keeps the sign (z = 3 gives +27, z = −3 gives −27) and makes far-away values count much more than near ones. Average the cubes: if the far values are mostly on the right, the total is positive.</p>
  <table class="tbl out"><caption>Skewness by hand (z with ddof=0, SD = 75.99)</caption>
    <tr><th>x</th><td>30</td><td>35</td><td>35</td><td>35</td><td>40</td><td>45</td><td>55</td><td>60</td><td>70</td><td>295</td><th>mean</th></tr>
    <tr><th>z</th><td>−0.53</td><td>−0.46</td><td>−0.46</td><td>−0.46</td><td>−0.39</td><td>−0.33</td><td>−0.20</td><td>−0.13</td><td>0</td><td>2.96</td><td>0</td></tr>
    <tr><th>z³</th><td>−0.15</td><td>−0.10</td><td>−0.10</td><td>−0.10</td><td>−0.06</td><td>−0.04</td><td>−0.01</td><td>−0.00</td><td>0</td><td>25.95</td><td><strong>2.54</strong></td></tr>
  </table>
  <p>The nine small negatives add to about −0.56; the founder adds +25.95. Total 25.39, divided by 10: skewness = <strong>2.54</strong>, strongly right-skewed. Without the founder it is 0.70, only moderately skewed.</p>
  <div class="fx" data-lang="py">z0 = (salary - salary.mean()) / salary.std()     # ddof=0, as the moment formula uses
print("z cubed:", (z0 ** 3).round(2))
print("skew = mean of z cubed =", round((z0 ** 3).mean(), 3), "  scipy:", round(stats.skew(salary), 3))
print("skew without founder:", round(stats.skew(staff), 3))
print("mode", stats.mode(salary).mode, "&lt; median", np.median(salary), "&lt; mean", salary.mean())</div>
  <div class="fx" data-lang="text">z cubed: [-0.15 -0.1  -0.1  -0.1  -0.06 -0.04 -0.01 -0.    0.   25.95]
skew = mean of z cubed = 2.541   scipy: 2.541
skew without founder: 0.697
mode 35 &lt; median 42.5 &lt; mean 70.0</div>
  <p>And the last line is the same ordering we saw in section 03: mode &lt; median &lt; mean. Skewness is the number; the ordering of the three centres is the picture.</p>
  <h3>The same idea at scale</h3>
  <figure class="viz"><svg viewBox="0 0 560 200" width="560"><line x1="30" y1="172" x2="548" y2="172" stroke="currentColor" stroke-opacity=".5"/><text x="30" y="187" text-anchor="middle" font-size="11">0</text><text x="133.6" y="187" text-anchor="middle" font-size="11">2</text><text x="237.2" y="187" text-anchor="middle" font-size="11">4</text><text x="340.8" y="187" text-anchor="middle" font-size="11">6</text><text x="444.4" y="187" text-anchor="middle" font-size="11">8</text><text x="548" y="187" text-anchor="middle" font-size="11">10</text><text x="548" y="167" text-anchor="end" font-size="11" class="tm">value</text><path d="M30,172 L30,172 L38.8,172 L47.6,170.2 L56.3,162.1 L65.1,146.7 L73.9,127.3 L82.7,107.8 L91.5,90.8 L100.2,77.8 L109,68.9 L117.8,63.7 L126.6,61.9 L135.4,62.6 L144.1,65.2 L152.9,69.3 L161.7,74.2 L170.5,79.8 L179.3,85.6 L188,91.5 L196.8,97.4 L205.6,103 L214.4,108.5 L223.2,113.6 L231.9,118.4 L240.7,122.9 L249.5,127.1 L258.3,131 L267.1,134.5 L275.8,137.8 L284.6,140.7 L293.4,143.5 L302.2,146 L310.9,148.2 L319.7,150.3 L328.5,152.2 L337.3,153.9 L346.1,155.5 L354.8,156.9 L363.6,158.2 L372.4,159.4 L381.2,160.4 L390,161.4 L398.7,162.3 L407.5,163.1 L416.3,163.8 L425.1,164.5 L433.9,165.1 L442.6,165.7 L451.4,166.2 L460.2,166.7 L469,167.1 L477.8,167.5 L486.5,167.8 L495.3,168.2 L504.1,168.5 L512.9,168.7 L521.7,169 L530.4,169.2 L539.2,169.4 L548,169.6 L548,172 Z" class="fb" stroke="none"/><path d="M30.5,172 L38,172 L45.5,171 L53,166.1 L60.5,155.5 L68,140.5 L75.5,123.6 L83,107.1 L90.5,92.5 L98,80.7 L105.5,71.9 L113,66.1 L120.5,62.9 L128,61.8 L135.5,62.6 L143,64.8 L150.5,68 L158,72.1 L165.5,76.6 L173,81.4 L180.5,86.4 L188,91.5 L195.5,96.5 L203,101.4 L210.5,106.1 L218,110.6 L225.5,114.9 L233,119 L240.5,122.8 L248,126.4 L255.5,129.8 L263,132.9 L270.5,135.8 L278,138.5 L285.5,141 L293,143.4 L300.5,145.5 L308,147.5 L315.5,149.3 L323,151 L330.5,152.6 L338,154 L345.5,155.4 L353,156.6 L360.5,157.7 L368,158.8 L375.5,159.8 L383,160.6 L390.5,161.5 L398,162.2 L405.5,162.9 L413,163.6 L420.5,164.2 L428,164.7 L435.5,165.2 L443,165.7 L450.5,166.2 L458,166.6 L465.5,166.9 L473,167.3 L480.5,167.6 L488,167.9 L495.5,168.2 L503,168.4 L510.5,168.7 L518,168.9 L525.5,169.1 L533,169.3 L540.5,169.5 L548,169.6" fill="none" class="sb" stroke-width="2"/><line x1="128.2" y1="172" x2="128.2" y2="36.6" class="st" stroke-dasharray="2 2"/><text x="128.2" y="33.6" text-anchor="end" font-size="11">mode</text><line x1="170.8" y1="172" x2="170.8" y2="25.3" class="sg" stroke-dasharray="4 3"/><text x="170.8" y="22.3" text-anchor="middle" font-size="11">median</text><line x1="198.6" y1="172" x2="198.6" y2="47.9" class="sr" stroke-dasharray="4 3"/><text x="198.6" y="44.9" text-anchor="start" font-size="11">mean</text><text x="366.7" y="78" text-anchor="start" font-size="11">long right tail →</text></svg><figcaption>Right skew (income, latency, order value): mode &lt; median &lt; mean. The tail pulls the mean toward it.</figcaption></figure>
  <p>With thousands of right-skewed values the histogram is smooth: hump first (mode), then the median, then the mean dragged furthest right. For left skew (an easy exam where most people score 90+ and a few score 40) the order flips: mean &lt; median &lt; mode.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Skew is a tug-of-war on the mean: a few very large values pull it toward their side, away from where the crowd stands. Our founder is one strong person on the right end of the rope.</p>
  </div>
  <div class="fx" data-lang="py">rng = np.random.default_rng(42)
normal = rng.normal(50, 10, 10_000)
income = rng.lognormal(10, 0.8, 10_000)      # right-skewed
exam   = 100 - rng.exponential(8, 10_000)    # left-skewed (easy exam)
for name, d in [("normal", normal), ("income", income), ("exam", exam)]:
    print(f"{name:7s} skew={stats.skew(d):6.2f}  mean={d.mean():9.1f}  median={np.median(d):9.1f}")</div>
  <div class="fx" data-lang="text">normal  skew= -0.00  mean=     49.9  median=     49.9
income  skew=  3.36  mean=  30872.8  median=  22187.2
exam    skew= -2.09  mean=     91.9  median=     94.5</div>
  <p>Symmetric data: skew ≈ 0 and mean ≈ median. Income: skew +3.4 and the mean sits 8,700 above the median. Easy exam: skew −2.1 and the mean sits below the median.</p>
  <table class="tbl">
    <tr><th>Skew</th><th>Order</th><th>Real examples</th><th>Typical fix before modelling</th></tr>
    <tr><td>≈ 0</td><td>mean ≈ median</td><td>heights, measurement error</td><td>none</td></tr>
    <tr><td>&gt; 0 (right)</td><td>mode &lt; median &lt; mean</td><td>our salaries (2.54), income, order value, delivery time</td><td><code>np.log1p</code> (log of 1 + x), Box-Cox</td></tr>
    <tr><td>&lt; 0 (left)</td><td>mean &lt; median &lt; mode</td><td>easy-exam scores, age at death</td><td>reflect (subtract from max) then log</td></tr>
  </table>
  <p>Scale: |skew| &lt; 0.5 is roughly symmetric; 0.5–1 is moderate; above 1 is strongly skewed.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Skewness</strong> g₁ = (1/n) Σ zᵢ³ with zᵢ = (xᵢ − x̄)/σ̂ (σ̂ the ddof=0 SD); this is scipy's default <code>stats.skew</code>. It is called the third standardised <em>moment</em>: mean is built from gaps to the power 1, variance from power 2, skewness from power 3.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reporting "mean ± SD" on skewed data gives ranges like "₹70k ± 80k", which includes negative salaries. Use median and IQR for skewed columns, or take the log first (section 12).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: kurtosis.</b> Skewness 2.54 says the long tail is on the right. But it can't say whether that tail is one wild value (our founder) or a steady stream of fairly large ones. How heavy, how extreme, are the tails?</div>

  <h2 id="sde-kurt"><span class="num">10</span>Kurtosis</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Two columns can have the same mean, same SD and similar skew, yet one throws up a crazy value every week and the other never does. How often do extreme values show up?</p>
  </div>
  <p>Go one power higher. Raise each z-score to the fourth power and average. The fourth power is always positive (direction no longer matters) and it makes far-out values utterly dominate: a value 3 SDs out contributes 81, a value 1 SD out contributes 1. That average is <strong>kurtosis</strong>, and it is almost entirely about the tails.</p>
  <table class="tbl out"><caption>Kurtosis by hand</caption>
    <tr><th>x</th><td>30</td><td>35</td><td>35</td><td>35</td><td>40</td><td>45</td><td>55</td><td>60</td><td>70</td><td>295</td><th>mean</th></tr>
    <tr><th>z⁴</th><td>0.08</td><td>0.04</td><td>0.04</td><td>0.04</td><td>0.02</td><td>0.01</td><td>0.00</td><td>0.00</td><td>0</td><td>76.85</td><td><strong>7.71</strong></td></tr>
  </table>
  <p>Sum ≈ 77.1, divided by 10 = 7.71. A perfect bell curve scores 3 on this scale, so libraries usually report <em>excess</em> kurtosis = 7.71 − 3 = <strong>4.71</strong>: much heavier tails than a bell curve. The founder supplies 99.7% of it. Without him the excess is −0.87: lighter tails than a bell curve, because nine values spread evenly from 30 to 70 have no extremes at all.</p>
  <div class="fx" data-lang="py">print("z^4:", (z0 ** 4).round(2))
print("kurtosis = mean of z^4 =", round((z0 ** 4).mean(), 3),
      "  excess (minus 3) =", round(stats.kurtosis(salary), 3))
print("excess kurtosis without founder:", round(stats.kurtosis(staff), 3))
print("founder's share of the z^4 total:", round(z0[-1] ** 4 / (z0 ** 4).sum(), 3))</div>
  <div class="fx" data-lang="text">z^4: [ 0.08  0.04  0.04  0.04  0.02  0.01  0.    0.    0.   76.85]
kurtosis = mean of z^4 = 7.71   excess (minus 3) = 4.71
excess kurtosis without founder: -0.87
founder's share of the z^4 total: 0.997</div>
  <h3>The same idea at scale</h3>
  <figure class="viz"><svg viewBox="0 0 560 200" width="560"><line x1="30" y1="172" x2="548" y2="172" stroke="currentColor" stroke-opacity=".5"/><text x="81.8" y="187" text-anchor="middle" font-size="11">-4</text><text x="185.4" y="187" text-anchor="middle" font-size="11">-2</text><text x="289" y="187" text-anchor="middle" font-size="11">0</text><text x="392.6" y="187" text-anchor="middle" font-size="11">2</text><text x="496.2" y="187" text-anchor="middle" font-size="11">4</text><path d="M30,172 L37.5,172 L45,172 L52.5,172 L60,172 L67.5,172 L75,172 L82.6,171.9 L90.1,171.9 L97.6,171.8 L105.1,171.7 L112.6,171.5 L120.1,171.3 L127.6,170.8 L135.1,170.2 L142.6,169.2 L150.1,167.9 L157.6,166 L165.1,163.4 L172.6,160 L180.1,155.5 L187.7,149.9 L195.2,142.9 L202.7,134.6 L210.2,124.9 L217.7,113.8 L225.2,101.7 L232.7,88.9 L240.2,75.7 L247.7,62.8 L255.2,50.7 L262.7,40 L270.2,31.5 L277.7,25.4 L285.2,22.3 L292.8,22.3 L300.3,25.4 L307.8,31.5 L315.3,40 L322.8,50.7 L330.3,62.8 L337.8,75.7 L345.3,88.9 L352.8,101.7 L360.3,113.8 L367.8,124.9 L375.3,134.6 L382.8,142.9 L390.3,149.9 L397.9,155.5 L405.4,160 L412.9,163.4 L420.4,166 L427.9,167.9 L435.4,169.2 L442.9,170.2 L450.4,170.8 L457.9,171.3 L465.4,171.5 L472.9,171.7 L480.4,171.8 L487.9,171.9 L495.4,171.9 L503,172 L510.5,172 L518,172 L525.5,172 L533,172 L540.5,172 L548,172" fill="none" class="sb" stroke-width="2"/><path d="M30,170.4 L37.5,170.2 L45,170 L52.5,169.8 L60,169.6 L67.5,169.3 L75,168.9 L82.6,168.5 L90.1,168.1 L97.6,167.5 L105.1,166.9 L112.6,166.2 L120.1,165.3 L127.6,164.3 L135.1,163.1 L142.6,161.7 L150.1,160 L157.6,158 L165.1,155.6 L172.6,152.8 L180.1,149.4 L187.7,145.3 L195.2,140.5 L202.7,134.7 L210.2,128 L217.7,120.1 L225.2,111 L232.7,100.8 L240.2,89.7 L247.7,77.8 L255.2,65.9 L262.7,54.7 L270.2,45.1 L277.7,38 L285.2,34.2 L292.8,34.2 L300.3,38 L307.8,45.1 L315.3,54.7 L322.8,65.9 L330.3,77.8 L337.8,89.7 L345.3,100.8 L352.8,111 L360.3,120.1 L367.8,128 L375.3,134.7 L382.8,140.5 L390.3,145.3 L397.9,149.4 L405.4,152.8 L412.9,155.6 L420.4,158 L427.9,160 L435.4,161.7 L442.9,163.1 L450.4,164.3 L457.9,165.3 L465.4,166.2 L472.9,166.9 L480.4,167.5 L487.9,168.1 L495.4,168.5 L503,168.9 L510.5,169.3 L518,169.6 L525.5,169.8 L533,170 L540.5,170.2 L548,170.4" fill="none" class="sr" stroke-width="2" stroke-dasharray="5 3"/><text x="40.4" y="36.6" text-anchor="start" font-size="11" class="tb">— normal (excess kurtosis 0)</text><text x="40.4" y="55.4" text-anchor="start" font-size="11" class="tr">- - t, 3 df (heavy tails)</text><text x="475.5" y="149.4" text-anchor="middle" font-size="10">fatter tail</text></svg><figcaption>Same centre, different tails. Heavy tails mean extreme values show up far more often than a normal predicts.</figcaption></figure>
  <p>Both curves have the same centre. Look at the far left and far right: the dashed red curve stays visibly above zero where the blue one has already hit the floor. Those fat tails mean values 4 or 5 SDs away actually happen. Server latency is like this: most requests take 100 ms, but once in a while one takes 10 seconds.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two roads with the same average speed. On the first, everyone drives 55–65. On the second, most drive 55–65 but once an hour someone does 150. Same mean, same "typical" spread, but you plan very differently for the second road. Kurtosis is the "once an hour someone does 150" number.</p>
  </div>
  <div class="fx" data-lang="py">heavy = rng.standard_t(3, 10_000)
print(round(stats.kurtosis(normal), 2), round(stats.kurtosis(heavy), 2))</div>
  <div class="fx" data-lang="text">0.05 34.32</div>
  <p>The bell-shaped column scores about 0 (excess). The heavy-tailed column (a t distribution with 3 degrees of freedom) scores 34: extreme values are far more common than the bell curve predicts.</p>
  <div class="callout intu"><span class="label">Why a DS cares</span>
    <p>Stock returns, fraud amounts and latency are heavy-tailed. A model or alert that assumes bell-curve tails will be "surprised" by 5-sigma events every week, and its "99.9% safe" promises will fail.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Kurtosis</strong> = (1/n) Σ zᵢ⁴, the fourth standardised moment; <strong>excess kurtosis</strong> = kurtosis − 3 (scipy's default <code>stats.kurtosis</code>, Fisher's definition), so a normal distribution scores 0. Positive: heavier tails than normal (leptokurtic); negative: lighter (platykurtic).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>High kurtosis does not mean "a sharper peak". It is dominated by z⁴ in the tails, so a flat-topped distribution with heavy tails can score high. And on small samples it is wildly unstable: on our ten salaries one person decides 99.7% of it.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: seeing it all.</b> We now have a dozen numbers: three centres, four spreads, z, outlier flags, skew and kurtosis. Is there a compact way to see them together, and to catch things numbers miss, like two separate humps?</div>

  <h2 id="sde-box"><span class="num">11</span>Seeing It All: Five-Number Summary, Box Plot, Histogram</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A table of twelve statistics is hard to read and can still hide the overall picture. How do we see centre, spread, outliers and shape in one glance?</p>
  </div>
  <p>Take five landmarks you already know, min, Q1, median, Q3, max, and you have the <strong>five-number summary</strong>. Draw it and you get a <strong>box plot</strong>, the chart in every EDA notebook. Add a <strong>histogram</strong> (bars counting how many values fall in each band) and you see the shape too.</p>
  <div class="flow"><span>min 30</span><span>Q1 35</span><span>median 42.5</span><span>Q3 58.75</span><span>max 295</span></div>
  <figure class="viz"><svg viewBox="0 0 600 250" width="600"><rect x="31.0" y="14" width="88.0" height="96" class="fb sb"/><text x="75.0" y="10" text-anchor="middle" font-size="10">6</text><rect x="121.0" y="62" width="88.0" height="48" class="fb sb"/><text x="165.0" y="58" text-anchor="middle" font-size="10">3</text><rect x="481.0" y="94" width="88.0" height="16" class="fb sb"/><text x="525.0" y="90" text-anchor="middle" font-size="10">1</text><line x1="30" y1="110" x2="570" y2="110" stroke="currentColor" stroke-opacity=".3"/><text x="246" y="40" font-size="11" class="tm">histogram: how many people per Rs 50k band</text><rect x="93.0" y="149" width="42.8" height="32" class="fb sb"/><line x1="106.5" y1="149" x2="106.5" y2="181" class="sb" stroke-width="2.5"/><line x1="84.0" y1="165" x2="93.0" y2="165" class="sb" stroke-width="1.5"/><line x1="135.8" y1="165" x2="156.0" y2="165" class="sb" stroke-width="1.5"/><line x1="84.0" y1="157" x2="84.0" y2="173" class="sb" stroke-width="1.5"/><line x1="156.0" y1="157" x2="156.0" y2="173" class="sb" stroke-width="1.5"/><circle cx="561.0" cy="165" r="6" class="fr sr"/><text x="561.0" y="191" text-anchor="middle" font-size="10" class="tr">outlier 295</text><line x1="199.9" y1="119" x2="199.9" y2="185" class="sr" stroke-dasharray="4 3"/><text x="203.9" y="127" font-size="10">upper fence 94.4 = Q3 + 1.5·IQR</text><text x="91.0" y="143" text-anchor="end" font-size="10">Q1 35</text><text x="106.5" y="195" text-anchor="middle" font-size="10">median 42.5</text><text x="137.8" y="143" font-size="10">Q3 58.75</text><text x="80.0" y="169" text-anchor="end" font-size="10">min 30</text><text x="159.0" y="179" font-size="10">70</text><line x1="30" y1="222" x2="570" y2="222" stroke="currentColor" stroke-opacity=".5"/><text x="30.0" y="237" text-anchor="middle" font-size="11">0</text><text x="120.0" y="237" text-anchor="middle" font-size="11">50</text><text x="210.0" y="237" text-anchor="middle" font-size="11">100</text><text x="300.0" y="237" text-anchor="middle" font-size="11">150</text><text x="390.0" y="237" text-anchor="middle" font-size="11">200</text><text x="480.0" y="237" text-anchor="middle" font-size="11">250</text><text x="570.0" y="237" text-anchor="middle" font-size="11">300</text><text x="470" y="217" text-anchor="end" font-size="11" class="tm">salary (Rs k)</text></svg><figcaption>Top: histogram of the ten salaries in ₹50k bands. Bottom: the box plot on the same axis. Box = middle 50% (IQR); whiskers reach the furthest points inside the fences; anything beyond is a dot.</figcaption></figure>
  <p>How to read the box plot: the box runs from Q1 (35) to Q3 (58.75), so it holds the middle half of the company. The thick line inside is the median (42.5). The whiskers reach out to the last values still inside the fences: down to 30, and up to 70 (Imran), the largest salary below the fence at 94.4. Anything beyond the fence is drawn alone as a dot: the founder at 295. The histogram above says the same thing differently: six people in the ₹0–50k band, three in ₹50–100k, then empty bands, then one person at ₹250–300k.</p>
  <div class="fx" data-lang="py">print("five numbers:", salary.min(), np.percentile(salary, [25, 50, 75]), salary.max())
counts, edges = np.histogram(salary, bins=range(0, 351, 50))
for c, e in zip(counts, edges):
    print(f"{e:3d}-{e + 50:3d} {'#' * c}")
print(pd.Series(salary, name="salary").describe().round(2))</div>
  <div class="fx" data-lang="text">five numbers: 30 [35.   42.5  58.75] 295
  0- 50 ######
 50-100 ###
100-150 
150-200 
200-250 
250-300 #
300-350 
count     10.00
mean      70.00
std       80.10
min       30.00
25%       35.00
50%       42.50
75%       58.75
max      295.00
Name: salary, dtype: float64</div>
  <p><code>describe()</code> prints the five numbers plus count, mean and SD (ddof=1). Read it like a detective: mean (70) is far above median (42.5), and SD (80.1) is more than 3× the IQR (23.75). Both say "right skew or an outlier is present". You already know it is the founder.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The five-number summary is a building's floor plan: five measurements tell you where the walls are. The histogram is a photograph from the street: it shows the shape the floor plan leaves out.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>five-number summary</strong> is (min, Q1, median, Q3, max). A <strong>box plot</strong> draws Q1–Q3 as a box, the median as a line, whiskers to the most extreme points within Q1 − 1.5·IQR and Q3 + 1.5·IQR, and points beyond as individual outliers. A <strong>histogram</strong> draws counts per bin.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A box plot hides shape. Data with two humps (say 20-minute casual users and 80-minute power users) can produce a normal-looking box centred at 50, where almost nobody is. Pair it with a histogram or violin plot. And a histogram's look depends on the bin width: try two or three widths before concluding.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: describe &amp; transform.</b> We can see the column. Now: how do we say it in one honest sentence, and can we reshape a skewed column so that mean and SD work again?</div>

  <h2 id="sde-words"><span class="num">12</span>Describe &amp; Transform</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A manager asks "so what does the salary column look like?" Which of our numbers do we say, in what order? And when a model wants roughly symmetric inputs, what do we do with a column skewed like ours?</p>
  </div>
  <p>The answer has a fixed order: shape first (it decides which centre and spread to use), then centre, then spread, then unusual points, then what it means for the business.</p>
  <div class="flow"><span>Shape</span><span>Centre</span><span>Spread</span><span>Unusual points</span><span>Context</span></div>
  <div class="callout def"><span class="label">Template, on our data</span>
    <p>"Monthly salary is <strong>strongly right-skewed</strong> (skew 2.5) with a median of <strong>₹42.5k</strong> (IQR ₹35k–₹58.75k). One value, the founder at <strong>₹295k</strong>, is an outlier (robust z 17). The mean of ₹70k is pulled up by that one value, so I'd report the median and IQR, and use the mean only for payroll totals (₹700k a month)."</p>
  </div>
  <table class="tbl">
    <tr><th>Shape</th><th>Centre to report</th><th>Spread to report</th></tr>
    <tr><td>Symmetric, no outliers</td><td>mean</td><td>SD</td></tr>
    <tr><td>Skewed or outliers (our salaries)</td><td>median</td><td>IQR (or MAD)</td></tr>
    <tr><td>Two humps (bimodal)</td><td>describe each group</td><td>split by segment first</td></tr>
  </table>
  <h3>The log transform</h3>
  <p>Right skew means big values are stretched far apart. A logarithm squashes big values much more than small ones (log of 30 is 3.4, log of 295 is only 5.7), which pulls a right tail in. <code>np.log1p(v)</code> computes log(1 + v), safe when v can be 0.</p>
  <div class="fx" data-lang="py">logs = np.log(salary)
print("log salary:", logs.round(2))
print("skew raw", round(stats.skew(salary), 2), "-&gt; skew of log", round(stats.skew(logs), 2))
print("back-transformed mean of logs (geometric mean):", round(np.exp(logs.mean()), 1))</div>
  <div class="fx" data-lang="text">log salary: [3.4  3.56 3.56 3.56 3.69 3.81 4.01 4.09 4.25 5.69]
skew raw 2.54 -&gt; skew of log 1.9
back-transformed mean of logs (geometric mean): 52.5</div>
  <p>Skew drops from 2.54 to 1.9, but the founder is still far out: when one value is ten times the typical one in a set of ten, even a log can't hide it (cap it, or describe it separately). Back-transforming the mean of the logs gives ₹52.5k, the <em>geometric mean</em>, which sits between the median (42.5) and the mean (70). The log works much better when the skew comes from a long, smooth tail, as at scale:</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(7)
order_value = rng.lognormal(mean=3.5, sigma=0.9, size=5000)
for name, v in [("raw", order_value), ("log1p", np.log1p(order_value))]:
    q1, q3 = np.percentile(v, [25, 75])
    print(f"{name:5s} mean={v.mean():7.2f} median={np.median(v):7.2f} "
          f"IQR={q3-q1:6.2f} skew={stats.skew(v):5.2f}")</div>
  <div class="fx" data-lang="text">raw   mean=  48.67 median=  32.22 IQR= 42.36 skew= 5.09
log1p mean=   3.53 median=   3.50 IQR=  1.18 skew= 0.13</div>
  <p>Before: mean far above median, skew 5. After the log: mean ≈ median and skew ≈ 0. The column is now well described by mean and SD, and ready for models that expect bell-shaped inputs.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A log scale is how we already talk about money: a raise from ₹30k to ₹60k feels as big as one from ₹150k to ₹300k. Both are "doubling", and on the log scale they are the same distance.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>log(0) is −∞ and log of a negative number does not exist: use <code>log1p</code> or a shift. And after transforming, the back-transformed mean is a geometric mean, not the arithmetic mean: don't report it as "average salary".</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: two variables.</b> Every number so far describes one column on its own. "Do salaries rise with experience?" is a question about two columns moving together.</div>

  <h2 id="sde-two"><span class="num">13</span>Two Variables: Covariance &amp; Correlation (pointer)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Variance measures how one column moves around its mean. How do we measure whether two columns, years of experience and salary, move <em>together</em>?</p>
  </div>
  <p>Reuse the gaps. For each person, multiply the gap of years from its mean by the gap of salary from its mean. If people above average in experience are also above average in salary (and below with below), the products are mostly positive. Average them (÷ n − 1) and you get the <strong>covariance</strong>, variance's two-column cousin (the covariance of a column with itself <em>is</em> its variance). Divide the covariance by both SDs and the units cancel, exactly like a z-score: that is <strong>Pearson's correlation r</strong>, between −1 and +1.</p>
  <div class="fx" data-lang="py">years = np.array([1, 2, 2, 3, 4, 5, 7, 8, 10, 12])   # years of experience, same 10 people
print("covariance(years, salary):", round(np.cov(years, salary)[0, 1], 1))
print("Pearson r with founder   :", round(np.corrcoef(years, salary)[0, 1], 3))
print("Pearson r without founder:", round(np.corrcoef(years[:-1], staff)[0, 1], 3))
print("Spearman (ranks), with founder:", round(stats.spearmanr(years, salary).statistic, 3))</div>
  <div class="fx" data-lang="text">covariance(years, salary): 220.6
Pearson r with founder   : 0.741
Pearson r without founder: 0.992
Spearman (ranks), with founder: 0.991</div>
  <p>Read it with everything this note taught. Without the founder, salary and experience are almost perfectly linear (r = 0.99). With him, r drops to 0.74: Pearson's r is built from means and SDs, so one outlier distorts it, just like the mean. <strong>Spearman's</strong> correlation works on <em>ranks</em> (the median's idea: only order matters), and the founder, who has both the most years and the highest salary, keeps it at 0.99. Robust vs sensitive again, now for two columns.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Covariance</strong> cov(x, y) = Σ(xᵢ − x̄)(yᵢ − ȳ) / (n − 1). <strong>Pearson r</strong> = cov(x, y) / (s_x · s_y). <strong>Spearman ρ</strong> = Pearson r computed on the ranks. Full treatment, including why correlation is not causation, in <a class="xref" data-note="st_correlation">Correlation &amp; Relationships</a>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Covariance has units (here "years × ₹k", 220.6), so its size says nothing on its own; only its sign is readable. Use r for strength. And r measures only straight-line relationships: Y = X² on symmetric X can give r = 0 while Y depends completely on X.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: how it all connects.</b> We have built every measure, each to fix the weakness of the one before. How do they fit together as one system?</div>

  <h2 id="sde-connect"><span class="num">14</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Mean, median, mode, range, IQR, variance, SD, CV, z, MAD, skewness, kurtosis, box plot, correlation: a list of separate formulas, or two or three ideas grown in different directions?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 720 330" width="720">
<defs><marker id="sde-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<text x="10" y="16" font-size="11" font-weight="700" class="tr">SUM FAMILY (moments): values count by size → sensitive</text>
<rect x="10" y="30" width="100" height="44" rx="7" class="fr sr"/><text x="60" y="49" text-anchor="middle" font-size="11.5" font-weight="700">mean</text><text x="60" y="65" text-anchor="middle" class="tm" font-size="10">Σx/n = 70</text>
<line x1="110" y1="52" x2="123" y2="52" stroke="currentColor" marker-end="url(#sde-a9)"/>
<rect x="125" y="30" width="100" height="44" rx="7" class="fr sr"/><text x="175" y="49" text-anchor="middle" font-size="11.5" font-weight="700">gaps</text><text x="175" y="65" text-anchor="middle" class="tm" font-size="10">x − mean</text>
<line x1="225" y1="52" x2="238" y2="52" stroke="currentColor" marker-end="url(#sde-a9)"/>
<rect x="240" y="30" width="115" height="44" rx="7" class="fr sr"/><text x="297" y="49" text-anchor="middle" font-size="11.5" font-weight="700">variance</text><text x="297" y="65" text-anchor="middle" class="tm" font-size="10">6,416.67</text>
<line x1="355" y1="52" x2="368" y2="52" stroke="currentColor" marker-end="url(#sde-a9)"/>
<rect x="370" y="30" width="90" height="44" rx="7" class="fr sr"/><text x="415" y="49" text-anchor="middle" font-size="11.5" font-weight="700">SD = √</text><text x="415" y="65" text-anchor="middle" class="tm" font-size="10">80.1</text>
<line x1="460" y1="52" x2="473" y2="52" stroke="currentColor" marker-end="url(#sde-a9)"/>
<rect x="475" y="30" width="100" height="44" rx="7" class="fr sr"/><text x="525" y="49" text-anchor="middle" font-size="11.5" font-weight="700">z, CV</text><text x="525" y="65" text-anchor="middle" class="tm" font-size="10">2.81 · 1.14</text>
<line x1="575" y1="44" x2="593" y2="34" stroke="currentColor" marker-end="url(#sde-a9)"/><line x1="575" y1="60" x2="593" y2="72" stroke="currentColor" marker-end="url(#sde-a9)"/>
<rect x="595" y="14" width="118" height="32" rx="7" class="fr sr"/><text x="654" y="34" text-anchor="middle" font-size="10.5">skew (z³) 2.54</text>
<rect x="595" y="58" width="118" height="32" rx="7" class="fr sr"/><text x="654" y="78" text-anchor="middle" font-size="10.5">kurt (z⁴) 4.71</text>
<line x1="297" y1="74" x2="297" y2="100" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#sde-a9)"/>
<rect x="187" y="102" width="220" height="34" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="297" y="123" text-anchor="middle" font-size="10.5">two columns: covariance, r</text>
<text x="10" y="168" font-size="11" font-weight="700" class="tg">ORDER FAMILY (ranks): only positions count → robust</text>
<rect x="10" y="180" width="100" height="44" rx="7" class="fg sg"/><text x="60" y="199" text-anchor="middle" font-size="11.5" font-weight="700">sort</text><text x="60" y="215" text-anchor="middle" class="tm" font-size="10">30 … 295</text>
<line x1="110" y1="202" x2="123" y2="202" stroke="currentColor" marker-end="url(#sde-a9)"/>
<rect x="125" y="180" width="110" height="44" rx="7" class="fg sg"/><text x="180" y="199" text-anchor="middle" font-size="11.5" font-weight="700">median</text><text x="180" y="215" text-anchor="middle" class="tm" font-size="10">42.5</text>
<line x1="235" y1="202" x2="248" y2="202" stroke="currentColor" marker-end="url(#sde-a9)"/>
<rect x="250" y="180" width="130" height="44" rx="7" class="fg sg"/><text x="315" y="199" text-anchor="middle" font-size="11.5" font-weight="700">quartiles, IQR</text><text x="315" y="215" text-anchor="middle" class="tm" font-size="10">IQR 23.75</text>
<line x1="380" y1="202" x2="393" y2="202" stroke="currentColor" marker-end="url(#sde-a9)"/>
<rect x="395" y="180" width="150" height="44" rx="7" class="fg sg"/><text x="470" y="199" text-anchor="middle" font-size="11.5" font-weight="700">fences, box plot</text><text x="470" y="215" text-anchor="middle" class="tm" font-size="10">fence 94.4: 295 out</text>
<line x1="180" y1="224" x2="180" y2="250" stroke="currentColor" marker-end="url(#sde-a9)"/>
<rect x="100" y="252" width="160" height="44" rx="7" class="fg sg"/><text x="180" y="271" text-anchor="middle" font-size="11.5" font-weight="700">MAD, robust z</text><text x="180" y="287" text-anchor="middle" class="tm" font-size="10">10 → 17.0</text>
<rect x="300" y="252" width="160" height="44" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="380" y="271" text-anchor="middle" font-size="11">Spearman (ranks)</text><text x="380" y="287" text-anchor="middle" class="tm" font-size="10">0.99 with founder</text>
<text x="10" y="320" font-size="11" class="tm">COUNTING, a third idea: mode (35; Eng) and the histogram.</text>
</svg><figcaption>Every measure grows from one of three ideas. Sum family: add values (mean), then their gaps raised to powers 2, 3, 4 (variance, skewness, kurtosis), with the SD as the ruler for z. Order family: sort, then read positions (median, quartiles, IQR, fences, MAD). Counting: mode and histogram.</figcaption></figure>
  <p>The sum family uses each value in proportion to its size, and the higher the power, the more one extreme value owns the result. On our data the founder's share of the total is:</p>
  <div class="fx" data-lang="py">def describe(x):
    q1, q3 = np.percentile(x, [25, 75])
    return {"mean": x.mean(), "median": np.median(x), "mode": stats.mode(x).mode,
            "range": x.max() - x.min(), "IQR": q3 - q1, "variance": x.var(ddof=1),
            "SD": x.std(ddof=1), "CV": x.std(ddof=1) / x.mean(),
            "MAD": stats.median_abs_deviation(x),
            "skew": stats.skew(x), "excess kurt": stats.kurtosis(x)}
table = pd.DataFrame({"with founder": describe(salary), "without": describe(staff)})
print(table.round(2))
for p in [1, 2, 3, 4]:
    w = np.abs(dev) ** p
    print(f"power {p}: founder's share of the total {w[-1] / w.sum():.3f}")</div>
  <div class="fx" data-lang="text">             with founder  without
mean                70.00    45.00
median              42.50    40.00
mode                35.00    35.00
range              265.00    40.00
IQR                 23.75    20.00
variance          6416.67   187.50
SD                  80.10    13.69
CV                   1.14     0.30
MAD                 10.00     5.00
skew                 2.54     0.70
excess kurt          4.71    -0.87
power 1: founder's share of the total 0.500
power 2: founder's share of the total 0.877
power 3: founder's share of the total 0.979
power 4: founder's share of the total 0.997</div>
  <p>Power 1 (the gaps behind the mean): the founder is 50% of the total. Power 2 (variance): 88%. Power 3 (skewness): 98%. Power 4 (kurtosis): 99.7%. That one line explains why the mean is "a bit sensitive", the SD "very sensitive" and kurtosis "almost entirely one value" on small data. The order family never looks at sizes beyond the sort, which is why median, IQR and MAD barely move.</p>
  <table class="tbl"><caption>Every measure on the same ten salaries</caption>
    <tr><th>Measure</th><th>Built from</th><th>Answers which question</th><th>Robust or sensitive</th><th>With founder</th><th>Without</th><th>Use when</th></tr>
    <tr><td>Mean</td><td>sum of values ÷ n</td><td>typical value / fair share?</td><td>sensitive (breaks with 1 value)</td><td>70</td><td>45</td><td>symmetric data; totals</td></tr>
    <tr><td>Median</td><td>sorted middle (p50)</td><td>typical person?</td><td>robust (survives 50%)</td><td>42.5</td><td>40</td><td>skewed data, outliers</td></tr>
    <tr><td>Mode</td><td>counts</td><td>most common value / category?</td><td>robust, but unstable on decimals</td><td>35 (Eng)</td><td>35</td><td>categories, discrete values</td></tr>
    <tr><td>Range</td><td>max − min</td><td>full width?</td><td>very sensitive</td><td>265</td><td>40</td><td>quick sanity check only</td></tr>
    <tr><td>IQR</td><td>Q3 − Q1 (percentiles)</td><td>width of the middle half?</td><td>robust</td><td>23.75</td><td>20</td><td>skewed data; fences</td></tr>
    <tr><td>Variance</td><td>mean of squared gaps (÷ n − 1)</td><td>spread using every value?</td><td>very sensitive (power 2)</td><td>6,416.67</td><td>187.5</td><td>algebra, models, building block</td></tr>
    <tr><td>SD</td><td>√variance</td><td>spread in data units?</td><td>very sensitive</td><td>80.1</td><td>13.69</td><td>symmetric data, mean ± SD</td></tr>
    <tr><td>CV</td><td>SD ÷ mean</td><td>relative spread across units?</td><td>sensitive</td><td>1.14</td><td>0.30</td><td>positive ratio-scale data</td></tr>
    <tr><td>z-score</td><td>(x − mean) ÷ SD</td><td>where does one value stand?</td><td>sensitive (masking)</td><td>founder 2.81</td><td>—</td><td>comparing across columns; scaling</td></tr>
    <tr><td>MAD</td><td>median of |x − median|</td><td>robust typical gap?</td><td>robust</td><td>10</td><td>5</td><td>robust z, outlier detection</td></tr>
    <tr><td>Tukey fences</td><td>Q1, Q3, IQR</td><td>which values are unusual?</td><td>robust</td><td>−0.6 … 94.4</td><td>5 … 85</td><td>outlier flags, box plots</td></tr>
    <tr><td>Skewness</td><td>mean of z³</td><td>which side is the long tail?</td><td>extremely sensitive (power 3)</td><td>2.54</td><td>0.70</td><td>choosing mean vs median, log</td></tr>
    <tr><td>Excess kurtosis</td><td>mean of z⁴ − 3</td><td>how heavy are the tails?</td><td>extremely sensitive (power 4)</td><td>4.71</td><td>−0.87</td><td>risk, alerts; large n only</td></tr>
    <tr><td>Five numbers / box</td><td>min, Q1, median, Q3, max</td><td>see it all at once?</td><td>robust (except min/max)</td><td>30, 35, 42.5, 58.75, 295</td><td>30, 35, 40, 55, 70</td><td>every EDA, comparing groups</td></tr>
    <tr><td>Pearson r</td><td>covariance ÷ (SD·SD)</td><td>do two columns move together?</td><td>sensitive</td><td>0.74</td><td>0.99</td><td>linear relationships</td></tr>
  </table>
  <p>(Fences without the founder: Q1 35, Q3 55, IQR 20 → 35 − 30 = 5 and 55 + 30 = 85.)</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>every summary either adds values (and so listens to their size) or sorts them (and so listens only to their order).</strong> Adding gives the mean and, through powers of the gaps, variance, SD, skewness and kurtosis: precise, algebra-friendly, and increasingly owned by outliers. Sorting gives the median, quartiles, IQR, fences and MAD: robust, but blind to magnitudes. Good EDA reports one of each and explains when they disagree, because the disagreement itself (mean 70 vs median 42.5) is information.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: common mistakes.</b> Knowing the system, which slips do people still make in reports and code?</div>

  <h2 id="sde-traps"><span class="num">15</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Where do real analyses of a column usually go wrong?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: mean of skewed money</span><p>"Average salary ₹70k" when 9 of 10 earn less. Report the median, or both with the reason.</p></div>
  <div class="callout trap"><span class="label">Trap: mean ± SD on skewed data</span><p>₹70k ± 80k includes negative salaries. Use median and IQR, or log first.</p></div>
  <div class="callout trap"><span class="label">Trap: ddof confusion</span><p>numpy 75.99 vs pandas 80.1 on the same data. State ddof; use ddof=1 for samples.</p></div>
  <div class="callout trap"><span class="label">Trap: |z| &gt; 3 on small or contaminated data</span><p>Masking hides the outlier, and with n = 10 |z| can't exceed 3 at all. Use fences or robust z.</p></div>
  <div class="callout trap"><span class="label">Trap: deleting outliers on sight</span><p>Investigate: fix errors, keep real extremes and use robust summaries or caps.</p></div>
  <div class="callout trap"><span class="label">Trap: comparing SDs across units</span><p>Salary SD 80 vs height SD 7.3 says nothing. Use CV or z-scores.</p></div>
  <div class="callout trap"><span class="label">Trap: trusting skew/kurtosis on tiny samples</span><p>One person supplied 98% of the skewness and 99.7% of the kurtosis. Look at the histogram.</p></div>
  <div class="callout trap"><span class="label">Trap: box plot alone</span><p>Two humps can make a tidy box. Always pair with a histogram or violin plot.</p></div>
  <div class="callout trap"><span class="label">Trap: 68-95-99.7 on non-bell data</span><p>The rule holds for roughly normal data only; salaries and latencies break it.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: the revision sheet.</b> Everything above, condensed to one page.</div>

  <h2 id="sde-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: monthly salaries (₹k) of ten people at a startup: 30, 35, 35, 35, 40, 45, 55, 60, 70 and the founder's 295. Also used: department (Eng ×5, Sales ×2, Ops ×2, Mgmt), height (mean 170, SD 7.26 cm), years of experience (1 … 12).</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Measure</th><th>Question it answers</th><th>On our data</th><th>Weakness → next</th></tr>
    <tr><td>Mean</td><td>typical value?</td><td>70</td><td>dragged by one person → median</td></tr>
    <tr><td>Median</td><td>a centre that ignores extremes?</td><td>42.5</td><td>needs numbers → mode</td></tr>
    <tr><td>Mode</td><td>typical category?</td><td>35; Eng</td><td>centre ≠ spread → range</td></tr>
    <tr><td>Range</td><td>how spread out?</td><td>265 (40 without founder)</td><td>two values decide it → IQR</td></tr>
    <tr><td>Percentiles / IQR</td><td>spread of the middle half?</td><td>Q1 35, Q3 58.75, IQR 23.75</td><td>ignores most gaps → variance</td></tr>
    <tr><td>Variance</td><td>spread from every gap?</td><td>57,750 / 9 = 6,416.67</td><td>squared units → SD</td></tr>
    <tr><td>SD</td><td>spread in data units?</td><td>80.1</td><td>can't compare units → CV, z</td></tr>
    <tr><td>CV, z</td><td>relative spread, position?</td><td>CV 1.14 vs 0.043; founder z 2.81</td><td>masked outliers → robust rules</td></tr>
    <tr><td>Outlier rules</td><td>which values are unusual?</td><td>fence 94.4; robust z 17.0; z 2.96 fails</td><td>no direction info → skewness</td></tr>
    <tr><td>Skewness</td><td>which side's tail is longer?</td><td>2.54; mode &lt; median &lt; mean</td><td>one value or a long tail? → kurtosis</td></tr>
    <tr><td>Kurtosis</td><td>how heavy are the tails?</td><td>excess 4.71 (99.7% founder)</td><td>too many numbers → plots</td></tr>
    <tr><td>Five numbers, box, histogram</td><td>see it all?</td><td>30, 35, 42.5, 58.75, 295</td><td>how to say it / fix it → words, log</td></tr>
    <tr><td>Describe &amp; log</td><td>report and reshape?</td><td>skew 2.54 → 1.9; geometric mean 52.5</td><td>one column only → correlation</td></tr>
    <tr><td>Covariance / r</td><td>do two columns move together?</td><td>cov 220.6; r 0.74 (0.99 without)</td><td>→ <a class="xref" data-note="st_correlation">Correlation</a></td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>Mean</td><td>x̄ = Σxᵢ / n</td><td>xᵢ each value, n how many, Σ add over all; Σ(xᵢ − x̄) = 0</td></tr>
    <tr><td>Median</td><td>middle of sorted data; mean of the two middles if n even</td><td>= 50th percentile</td></tr>
    <tr><td>Percentile (numpy linear)</td><td>value at position p·(n − 1), interpolating</td><td>positions counted from 0; Q1 p = 0.25, Q3 p = 0.75</td></tr>
    <tr><td>IQR</td><td>Q3 − Q1</td><td>width of the middle 50%</td></tr>
    <tr><td>Sample variance</td><td>s² = Σ(xᵢ − x̄)² / (n − 1)</td><td>n − 1 = degrees of freedom (Bessel); population: ÷ N with μ</td></tr>
    <tr><td>SD</td><td>s = √s²</td><td>same units as data</td></tr>
    <tr><td>CV</td><td>s / x̄</td><td>unit-free; positive data only</td></tr>
    <tr><td>z-score</td><td>z = (x − x̄) / s</td><td>SDs from the mean; max |z| = √(n − 1) with ddof=0</td></tr>
    <tr><td>Tukey fences</td><td>Q1 − 1.5·IQR, Q3 + 1.5·IQR</td><td>outside = outlier</td></tr>
    <tr><td>MAD, robust z</td><td>MAD = median|x − median|; 0.6745·(x − median)/MAD</td><td>cut-off 3.5</td></tr>
    <tr><td>Skewness</td><td>(1/n) Σ zᵢ³</td><td>z with ddof=0 SD; sign = tail side</td></tr>
    <tr><td>Excess kurtosis</td><td>(1/n) Σ zᵢ⁴ − 3</td><td>0 for a normal; &gt; 0 heavy tails</td></tr>
    <tr><td>Covariance, r</td><td>Σ(xᵢ − x̄)(yᵢ − ȳ)/(n − 1); r = cov/(s_x s_y)</td><td>r between −1 and 1</td></tr>
  </table>
  <h3>The running example in one table</h3>
  <table class="tbl">
    <tr><th></th><th>mean</th><th>median</th><th>mode</th><th>range</th><th>IQR</th><th>variance</th><th>SD</th><th>CV</th><th>MAD</th><th>skew</th><th>ex. kurt</th></tr>
    <tr><th>with founder</th><td>70</td><td>42.5</td><td>35</td><td>265</td><td>23.75</td><td>6,416.67</td><td>80.1</td><td>1.14</td><td>10</td><td>2.54</td><td>4.71</td></tr>
    <tr><th>without</th><td>45</td><td>40</td><td>35</td><td>40</td><td>20</td><td>187.5</td><td>13.69</td><td>0.30</td><td>5</td><td>0.70</td><td>−0.87</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Mean + SD</b><p>Use for roughly symmetric data without outliers, and whenever totals matter (payroll, revenue).</p><small>Avoid on skewed money, latency, counts with whales</small></div>
    <div><b>Median + IQR (or MAD)</b><p>Use for skewed data or data with outliers: the "typical person" and the middle half.</p><small>Avoid when you need totals or algebra</small></div>
    <div><b>Mode</b><p>Use for categories and discrete values; look for several modes (segments).</p><small>Avoid on continuous decimals; use the histogram's tallest bar</small></div>
    <div><b>CV / z</b><p>Use to compare spread or position across different units, and to scale features.</p><small>Avoid CV near mean 0; z on contaminated data (masking)</small></div>
    <div><b>Skew / kurtosis</b><p>Use on large samples to decide mean vs median, log transforms, and tail risk.</p><small>Avoid trusting them on tiny n: one value decides</small></div>
    <div><b>Box + histogram</b><p>Use together in every EDA: box for landmarks and outliers, histogram for humps.</p><small>A box alone hides bimodality</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Mean salary with a founder in the data; mean ± SD giving negative values; numpy (ddof=0) vs pandas (ddof=1); |z| &gt; 3 masked or impossible on small n; deleting real outliers; comparing SDs across units; 68-95-99.7 on skewed data; trusting skew/kurtosis from ten values; box plot without a histogram; reporting a variance in squared units.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Values 2, 4, 9: mean, median, sample variance?</td><td>5; 4; gaps −3, −1, 4 → SS 26 → 26/2 = 13</td></tr>
    <tr><td>Mean 650k, median 420k house prices: which skew, which to report?</td><td>Right skew; median (maybe with p90)</td></tr>
    <tr><td>Q1 = 20, Q3 = 30: upper Tukey fence?</td><td>30 + 1.5 × 10 = 45</td></tr>
    <tr><td>Why does |z| &gt; 3 never fire on 10 values (ddof=0)?</td><td>Max possible |z| is √(n − 1) = 3</td></tr>
    <tr><td>Salaries 40, 50, 60 and a founder at 450: mean, median, and which one is robust?</td><td>Mean 600/4 = 150, median 55; the median</td></tr>
  </table>

  <h2 id="sde-qa"><span class="num">16</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you explain each measure, and why it exists, out loud without notes?</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Mean house price is $650k, median is $420k. What does that tell you?</summary><div class="qa-body">The distribution is right-skewed: a few very expensive houses pull the mean up (exactly like our founder pulling the salary mean to 70 while the median is 42.5). The median better describes a "typical" house. Report the median, maybe with p90.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why divide by n−1 for a sample variance?</summary><div class="qa-body">Gaps are measured from the sample mean, which is fitted to the same data and makes the squared gaps as small as possible, so they're systematically too small. Dividing by n−1 (degrees of freedom: one is "used up" by estimating the mean, since the gaps must sum to 0) makes the estimate unbiased. With n = 5, dividing by n gives 80% of the true value on average.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Predict: <code>np.std([1,2,3,4])</code> vs <code>pd.Series([1,2,3,4]).std()</code>.</summary><div class="qa-body">Mean 2.5, SS = 2.25 + 0.25 + 0.25 + 2.25 = 5. numpy: ddof=0 → √(5/4) = 1.118. pandas: ddof=1 → √(5/3) = 1.291. Different defaults, not a bug.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you report the mean even though the data is skewed?</summary><div class="qa-body">When the business cares about totals. Payroll = mean × people (70 × 10 = ₹700k); revenue per user × users = total revenue. The median can't give totals. A/B tests on revenue usually compare means for this reason (with care about outliers).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is the IQR rule better than "|z| &gt; 3" for finding outliers?</summary><div class="qa-body">z-scores use the mean and SD, which the outliers themselves inflate (masking), and they assume a bell shape; on small n they are even capped (√(n − 1) = 3 for n = 10). IQR uses quartiles, which outliers barely move, and works on skewed data. On our salaries: z = 2.96 (not flagged), fence 94.4 (flagged), robust z = 17.0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does high kurtosis mean a sharper peak?</summary><div class="qa-body">Not really. Kurtosis is dominated by z⁴ in the tails, so it measures how often extreme values occur. On our salaries the founder supplies 99.7% of it. A distribution can be flat-topped and still have high kurtosis if its tails are heavy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A latency SLA says "p99 &lt; 300 ms". Why p99 and not the mean?</summary><div class="qa-body">Latency is right-skewed; the mean hides the slow tail that users actually feel. p99 says 99% of requests are faster than 300 ms, so at most 1 in 100 is slow. Big services track p50, p95, p99.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two features: SD 5 and SD 5000. Which varies more?</summary><div class="qa-body">You can't tell: SD carries the units. Compare the coefficient of variation (SD / mean), as with salary CV 1.14 vs height CV 0.043, or standardise to z-scores. This is also why scale-sensitive models (kNN, SVM, regularised regression) need feature scaling.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You find an outlier. Do you delete it?</summary><div class="qa-body">Investigate first. A data error (age = 999) → fix or drop. A real extreme (the founder, a whale customer) → keep it, but use robust stats, cap (winsorise) or log-transform. Deleting real extremes hides exactly the cases the business may care about.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A box plot looks perfectly symmetric. Can the data still be bimodal?</summary><div class="qa-body">Yes. Two equal humps at 20 and 80 give a symmetric box centred at 50, where almost no data lives. Always look at a histogram or violin plot too.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does variance need squaring at all? What breaks if you just average the gaps?</summary><div class="qa-body">The gaps from the mean always sum to zero (that is what makes the mean the balance point: our −225 and +225), so their average is 0 for every dataset. You must remove the sign: absolute values give the mean absolute deviation; squares give the variance, which has cleaner algebra (variances of independent variables add) and pairs with the mean (the mean minimises the sum of squared gaps).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why do skewness and kurtosis use z-scores rather than raw gaps?</summary><div class="qa-body">To be unit-free and comparable. Raw cubed gaps would be in (₹k)³ and would change if you measured in rupees instead of thousands. Dividing each gap by the SD first (z) makes skewness and kurtosis pure numbers, so "skew 2.5" means the same for salaries, heights or latencies. That is why the ladder needs SD and z before shape.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why is the SD sensitive but the IQR robust? What is the structural reason?</summary><div class="qa-body">The SD is in the sum family: it adds every squared gap, so a value's influence grows with the square of its distance (the founder is 88% of the sum of squares). The IQR is in the order family: it only reads the values at two sorted positions, so making the founder richer changes nothing. Same split as mean vs median.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip the histogram and go straight to mean ± SD?</summary><div class="qa-body">You assume a symmetric, single-humped shape without checking. On our salaries "70 ± 80" suggests negative salaries and hides that 9 of 10 people are below 70. On bimodal data, the mean may sit where nobody is. The histogram (and skewness) tells you which centre and spread to report.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is Pearson correlation built from things in this note, and what does that imply?</summary><div class="qa-body">r = covariance / (SD_x · SD_y), and covariance is the average product of gaps from the means: it is variance generalised to two columns, then standardised like a z-score. So it inherits the mean's sensitivity: the founder drops r from 0.99 to 0.74, while Spearman (ranks, the median's idea) stays at 0.99.</div></details>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="st_probability">Probability</a>.</b> Everything here describes the ten people we have. If we hire an eleventh, how likely is a salary above ₹60k? If we survey another startup, how far could its mean be from ours by pure chance? Questions about data we haven't seen need the language of probability.</div>
</main>`
});
