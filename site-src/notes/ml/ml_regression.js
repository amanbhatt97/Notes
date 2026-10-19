// notes/ml/ml_regression.js — Linear Regression
Object.assign(TOPIC_CONTENT, {
  "ml_regression": `<main>
  <h1>Linear Regression</h1>
  <div class="where"><span>Machine Learning</span><span>Regression</span><span>Linear Regression</span></div>
  <p class="lead">Linear regression predicts a number (a house price, a rent, a delivery time) as a weighted sum of input columns plus a constant. This note builds it completely on one running example, six houses A–F with their size, bedrooms, locality and sale price: the least-squares line is derived with calculus and solved by hand, extended to many columns with matrices (the normal equation solved by hand as a 2×2 system), reached again by gradient descent, interpreted in plain words, scored with R² and RMSE, read line by line in a statsmodels summary where every number is recomputed by hand, extended to text categories with dummy variables, given prediction intervals, and finally rebuilt from scratch to match scikit-learn to 12 decimal places. It opens the Regression group: the same six houses run through all four notes, and every other note in the group checks, bends or tames this one model.</p>

  <h2 id="lr-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_loss_gd">Loss Functions &amp; Gradient Descent</a> and <a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a></b><span>The Foundations notes said what a model, a loss and a train/test split are, but they used models as black boxes. The open question: what is the simplest real model that turns columns into a number, and how exactly are its weights found?</span></li>
    <li><b>This note adds: the weighted-sum model and its exact solution</b><span>ŷ = b + w₁x₁ + … + w_dx_d, fitted by minimising the sum of squared errors. One closed-form answer (the normal equation), one iterative answer (gradient descent), and the statistics that say how sure we are about each weight (standard errors, t, p, confidence and prediction intervals).</span></li>
    <li><b>Leads to: the rest of the Regression group</b><span><a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a> checks when those statistics can be trusted. <a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a> bends the straight line. <a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a> keeps weights sane when columns are many or correlated. Outside the group, <a class="xref" data-note="ml_classification">Logistic Regression</a> reuses the same weighted sum for yes/no targets, and <a class="xref" data-note="ml_reg_metrics">Regression Metrics</a> scores any regression model in depth.</span></li>
  </ol>
  <figure class="viz"><svg viewBox="0 0 680 330" width="680">
<defs><marker id="lr-fa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="190" y="8" width="300" height="44" rx="8" class="fs" stroke="currentColor"/>
<text x="340" y="27" text-anchor="middle" font-size="13">Foundations</text><text x="340" y="43" text-anchor="middle" class="tm" font-size="11">loss &amp; gradient descent · splits · bias-variance</text>
<line x1="340" y1="52" x2="340" y2="82" stroke="currentColor" marker-end="url(#lr-fa)"/>
<rect x="20" y="86" width="640" height="150" rx="12" fill="none" stroke="currentColor" stroke-dasharray="5 4" stroke-opacity="0.5"/>
<text x="34" y="104" class="tm" font-size="11.5">REGRESSION GROUP</text>
<rect x="250" y="96" width="180" height="50" rx="8" class="fb sb" stroke-width="3"/>
<text x="340" y="117" text-anchor="middle" font-size="14" font-weight="700">Linear Regression</text><text x="340" y="136" text-anchor="middle" class="tb" font-size="11">YOU ARE HERE</text>
<line x1="300" y1="146" x2="130" y2="178" stroke="currentColor" marker-end="url(#lr-fa)"/>
<line x1="340" y1="146" x2="340" y2="178" stroke="currentColor" marker-end="url(#lr-fa)"/>
<line x1="380" y1="146" x2="550" y2="178" stroke="currentColor" marker-end="url(#lr-fa)"/>
<rect x="40" y="180" width="180" height="46" rx="8" class="ft st"/>
<text x="130" y="199" text-anchor="middle" font-size="12.5">Assumptions &amp; Diagnostics</text><text x="130" y="216" text-anchor="middle" class="tm" font-size="11">can we trust it?</text>
<rect x="250" y="180" width="180" height="46" rx="8" class="ft st"/>
<text x="340" y="199" text-anchor="middle" font-size="12.5">Polynomial &amp; Basis</text><text x="340" y="216" text-anchor="middle" class="tm" font-size="11">bend the line</text>
<rect x="460" y="180" width="180" height="46" rx="8" class="ft st"/>
<text x="550" y="199" text-anchor="middle" font-size="12.5">Ridge, Lasso &amp; Elastic Net</text><text x="550" y="216" text-anchor="middle" class="tm" font-size="11">tame the weights</text>
<line x1="220" y1="203" x2="248" y2="203" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#lr-fa)"/>
<line x1="430" y1="203" x2="458" y2="203" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#lr-fa)"/>
<line x1="340" y1="236" x2="130" y2="268" stroke="currentColor" marker-end="url(#lr-fa)"/>
<line x1="340" y1="236" x2="340" y2="268" stroke="currentColor" marker-end="url(#lr-fa)"/>
<line x1="340" y1="236" x2="550" y2="268" stroke="currentColor" marker-end="url(#lr-fa)"/>
<rect x="40" y="270" width="180" height="46" rx="8" class="fg sg"/>
<text x="130" y="289" text-anchor="middle" font-size="12.5">Logistic Regression</text><text x="130" y="306" text-anchor="middle" class="tm" font-size="11">same sum, yes/no target</text>
<rect x="250" y="270" width="180" height="46" rx="8" class="fg sg"/>
<text x="340" y="289" text-anchor="middle" font-size="12.5">Regression Metrics</text><text x="340" y="306" text-anchor="middle" class="tm" font-size="11">score any regressor</text>
<rect x="460" y="270" width="180" height="46" rx="8" class="fg sg"/>
<text x="550" y="289" text-anchor="middle" font-size="12.5">Trees &amp; boosting</text><text x="550" y="306" text-anchor="middle" class="tm" font-size="11">when straight lines fail</text>
</svg><figcaption>The Regression group. Linear regression is the root; the three sibling notes each fix one of its limits (trust, shape, weight size), in that reading order (dashed arrows). Green boxes are where its ideas are reused next.</figcaption></figure>
  <h3>The Regression group as one ladder, on the same six houses</h3>
  <p>All four notes of this group use one table: six houses A–F with size 600 to 1,600 sq ft, 1 to 4 bedrooms, three localities and prices from 28 to 100 lakh (introduced in section 01). Each note answers the question the previous one leaves open:</p>
  <table class="tbl">
    <tr><th>Step</th><th>Note</th><th>Question it answers</th><th>What it finds on the six houses</th><th>The gap it leaves</th></tr>
    <tr><td>1</td><td><strong>Linear Regression</strong> (this)</td><td>How do we fit a weighted sum to numbers, and how sure are we about each weight?</td><td>price = −16 + 7·size, R² 0.990, slope 7 ± 0.97 (95% CI)</td><td>Every SE and interval assumed things about the errors. Do they hold?</td></tr>
    <tr><td>2</td><td><a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a></td><td>When are the standard errors, p-values and intervals correct? What breaks them?</td><td>residuals +2, 0, −1, −2, −3, +4 bend like a smile; size and rooms have VIF 16; the end houses A and F carry the most leverage</td><td>The line is the wrong shape. How do we fit a curve?</td></tr>
    <tr><td>3</td><td><a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a></td><td>The truth is curved. How do we keep the same machinery but fit curves?</td><td>adding size² cuts SSE from 34 to 9.9; degree 5 hits all six houses exactly yet prices an 1,800 sq ft flat at 152 lakh</td><td>More columns, correlated with each other, give unstable weights. How do we tame them?</td></tr>
    <tr><td>4</td><td><a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a></td><td>Many or correlated columns make weights explode. How do we shrink them?</td><td>ridge shares the weight between size and rooms; lasso keeps size and drops rooms</td><td>Choosing the penalty: cross-validation</td></tr>
  </table>
  <p>The maths you need is only "slope of a curve is zero at its lowest point" (<a class="xref" data-note="m_calculus">Calculus</a>) and matrix multiplication (<a class="xref" data-note="m_linalg">Linear Algebra</a>); both are re-explained where used.</p>

  <h2 id="lr-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. All numbers are for the six houses.</p>
  <ol class="story">
    <li><b>The regression model</b><span>Q: how do we predict a number from columns? → price = b + w·size + noise ε. But which b and w?</span></li>
    <li><b>Residuals &amp; SSE</b><span>Q: how do we score a candidate line? → Square each vertical miss and add: the line −10 + 6.5·size scores SSE 53, −20 + 7.5·size scores 65. But there are infinitely many lines to try…</span></li>
    <li><b>Least squares (calculus)</b><span>Q: which line has the smallest SSE? → Set both derivatives to 0: w = S_xy/S_xx = 490/70 = 7, b = ȳ − w·x̄ = −16, SSE 34. But this formula is for one feature only…</span></li>
    <li><b>Normal equation (matrices)</b><span>Q: what about several features? → XᵀXw = Xᵀy. Size + rooms: size 6.21, rooms 2.92. Why is this the right answer, and is it the best?</span></li>
    <li><b>Geometry, Gauss–Markov, likelihood</b><span>Q: why this answer? → ŷ is the projection of y (residuals ⟂ every column), OLS is BLUE, and it is the maximum-likelihood fit under normal noise (log L = −13.72). But it needs XᵀX in memory and one big solve…</span></li>
    <li><b>Gradient descent</b><span>Q: what if the data is too big for the formula? → Walk downhill step by step: reaches b = 61, w = 7 on centred size. We have weights; what do they mean?</span></li>
    <li><b>Interpreting coefficients</b><span>Q: what does 7 mean? → +7 lakh per 100 sq ft, holding the other columns fixed; with rooms in the model it drops to 6.21 (omitted-variable formula 6.21 + 2.92 × 0.27 = 7). Is the line any good overall?</span></li>
    <li><b>R² and RMSE</b><span>Q: how good is the fit? → R² = 1 − 34/3464 = 0.990, RMSE 2.38 lakh. But could a slope this steep be luck with only six houses?</span></li>
    <li><b>Standard errors, t, p, CI</b><span>Q: how sure are we of each weight? → se(w) = 0.35, t = 20.1, 95% CI [6.03, 7.97]. But every column so far was a number; locality is text…</span></li>
    <li><b>Dummy variables</b><span>Q: how do categories enter a weighted sum? → k − 1 indicator columns; Old town −29.5 vs Metro alone, only −1.9 once size is in. Now, for one new house: how wide should the price range be?</span></li>
    <li><b>Prediction intervals</b><span>Q: what price range for one new 1,300 sq ft house? → 75 lakh, 95% PI [66.0, 84.0], much wider than the CI of the mean [71.2, 78.8]. How is all of this done in everyday code?</span></li>
    <li><b>scikit-learn &amp; from scratch</b><span>Q: how do we use it in a real pipeline, and do we really understand it? → LinearRegression in a pipeline with a test score; 15 lines of numpy match sklearn to 10⁻¹². Left open: the SEs assumed independent, equal, normal errors, and the residuals +2, 0, −1, −2, −3, +4 have a shape. → <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a></span></li>
  </ol>

  <h2 id="lr-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Linear Regression</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Model &amp; loss</div>
        <ul>
          <li><b>Model</b> — ŷ = b + w₁x₁ + … + w_dx_d = Xw (X has a column of 1s)</li>
          <li><b>Truth</b> — y = Xw + ε; ε = noise the columns cannot explain</li>
          <li><b>Residual</b> — eᵢ = yᵢ − ŷᵢ (vertical gap)</li>
          <li><b>Least squares</b> — minimise SSE = Σeᵢ²: smooth bowl, one bottom, big misses cost more</li>
          <li>💡 A stick held by rubber bands to every point</li>
          <li>⚠ "Linear" = linear in the <em>weights</em>; x² columns are allowed</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">One feature by hand</div>
        <ul>
          <li>∂SSE/∂b = 0 → b = ȳ − w·x̄ (line passes through the means)</li>
          <li>∂SSE/∂w = 0 → w = S_xy / S_xx = Σ(x−x̄)(y−ȳ) / Σ(x−x̄)²</li>
          <li>6 houses: S_xy = 490, S_xx = 70 → w = 7, b = −16</li>
          <li>Residuals 2, 0, −1, −2, −3, 4 → sum 0, SSE 34</li>
          <li>SSE(w) = 34 + 70(w − 7)²: a bowl</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Matrices</div>
        <ul>
          <li><b>Normal equation</b> XᵀXw = Xᵀy → w = (XᵀX)⁻¹Xᵀy</li>
          <li>Houses: [[6, 66], [66, 796]] w = [366, 4516]; det 420 → [−16, 7]</li>
          <li><b>Geometry</b>: ŷ = Hy is the projection of y; Xᵀe = 0</li>
          <li>Two features: size alone 7.0, holding rooms fixed 6.21 (rooms 2.92)</li>
          <li>Cost O(nd² + d³); use lstsq/solve, never inv()</li>
          <li><b>GD</b>: w ← w − η·∇MSE; same answer; needs centred/scaled features</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Interpretation</div>
        <ul>
          <li>wⱼ = change in ŷ per +1 unit of xⱼ, <b>holding the others fixed</b></li>
          <li>Units: 7 lakh per 100 sq ft = 0.07 lakh (₹7,000) per sq ft</li>
          <li>Omitted variable: 7.0 = 6.21 + 2.92 × (19/70)</li>
          <li>Standardised coef = per 1 SD (compare importance)</li>
          <li>log(y) model: +1 unit → about 100·w % change</li>
          <li>⚠ Association, not causation; intercept −16 is not a real house</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Inference (statsmodels)</div>
        <ul>
          <li>s² = SSE / (n − p) = 34 / 4 = 8.5</li>
          <li>Cov(ŵ) = s²(XᵀX)⁻¹ → se(w) = 0.348, se(b) = 4.01</li>
          <li>t = coef / se = 20.09; p = 0.00004 (df 4)</li>
          <li>95% CI = coef ± t₀.₉₇₅·se = 7 ± 2.776 × 0.348 = [6.03, 7.97]</li>
          <li>F = 403.5 = t²; adj R² 0.988; log L −13.72</li>
          <li>Prediction interval ⊃ CI of the mean (adds one house's noise)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">In practice</div>
        <ul>
          <li><b>R²</b> = 1 − SSE/SST = 1 − 34/3464 = 0.990; <b>RMSE</b> = √(34/6) = 2.38</li>
          <li><code>LinearRegression</code>: coef_, intercept_, rank_, singular_</li>
          <li>Categories → k − 1 dummies (drop one; else dummy trap, rank 3 of 4)</li>
          <li>Rent demo (300 flats): numbers only R² 0.672 → + city 0.884</li>
          <li>From scratch = sklearn to 1e-12</li>
          <li>⚠ Score on test data; plot residuals; don't extrapolate</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="lr-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="lr-problem"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Regression Problem</span><span class="rm-sub">Six houses; notation</span></div></div>
      <div class="rm-item rm-done" data-target="lr-line"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Line y = wx + b</span><span class="rm-sub">Slope, intercept, residuals</span></div></div>
      <div class="rm-item rm-done" data-target="lr-ls"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Least Squares Derived</span><span class="rm-sub">Calculus, then 6 houses by hand</span></div></div>
      <div class="rm-item rm-done" data-target="lr-matrix"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Matrix Form &amp; Normal Equation</span><span class="rm-sub">2×2 by hand, size + rooms</span></div></div>
      <div class="rm-item rm-done" data-target="lr-geom"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Geometry &amp; Properties</span><span class="rm-sub">Projection, Gauss–Markov, MLE</span></div></div>
      <div class="rm-item rm-done" data-target="lr-gd"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Gradient Descent Alternative</span><span class="rm-sub">Two steps by hand; when to use</span></div></div>
      <div class="rm-item rm-done" data-target="lr-interp"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Interpreting Coefficients</span><span class="rm-sub">Units, holding fixed, logs</span></div></div>
      <div class="rm-item rm-done" data-target="lr-score"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">R² and RMSE</span><span class="rm-sub">How good is the line?</span></div></div>
      <div class="rm-item rm-done" data-target="lr-sm"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">The statsmodels Summary</span><span class="rm-sub">Every line recomputed by hand</span></div></div>
      <div class="rm-item rm-done" data-target="lr-cat"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Categorical Predictors</span><span class="rm-sub">Dummies and the dummy trap</span></div></div>
      <div class="rm-item rm-done" data-target="lr-pi"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Prediction Intervals</span><span class="rm-sub">CI of the mean vs one new house</span></div></div>
      <div class="rm-item rm-done" data-target="lr-sk"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">scikit-learn in Practice</span><span class="rm-sub">LinearRegression end to end</span></div></div>
      <div class="rm-item rm-done" data-target="lr-scratch"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">From Scratch</span><span class="rm-sub">Three solvers matched to sklearn</span></div></div>
      <div class="rm-item rm-done" data-target="lr-connect"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One loss, every number built from it</span></div></div>
      <div class="rm-item rm-done" data-target="lr-when"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Strengths, Limits &amp; Comparisons</span><span class="rm-sub">vs siblings and other models</span></div></div>
      <div class="rm-item rm-done" data-target="lr-traps"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Traps in interviews and code</span></div></div>
      <div class="rm-item rm-done" data-target="lr-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="lr-qa"><span class="rm-num">17</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="lr-problem"><span class="num">01</span>The Regression Problem</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The Foundations notes taught us to train and test a model, but never opened one up. Given a table of past examples with a numeric answer, what is the simplest machine that turns the columns into that number?</p>
  </div>
  <h3>The need</h3>
  <p>A family wants to sell a 1,300 sq ft flat. What price should they ask? A food-delivery app wants to promise a delivery time before the rider even starts. A landlord wants to price a flat from its size, distance to the metro and the city. In each case the answer is a <strong>number on a continuous scale</strong>, and we have past examples with the answer known. That is a <strong>regression</strong> problem (the word is historical; Francis Galton used it in the 1880s for children's heights "regressing" toward the average).</p>
  <table class="tbl">
    <tr><th>Task</th><th>Target y (a number)</th><th>Features x</th></tr>
    <tr><td>House pricing</td><td>sale price, lakh ₹</td><td>size, bedrooms, locality</td></tr>
    <tr><td>Rent pricing</td><td>monthly rent, ₹ thousand</td><td>size, distance to metro, building age, city</td></tr>
    <tr><td>Delivery ETA</td><td>minutes</td><td>distance, time of day, restaurant prep time</td></tr>
    <tr><td>Demand planning</td><td>units sold tomorrow</td><td>price, day of week, promotions</td></tr>
  </table>
  <p>If the target were a category (spam / not spam, which of 3 plans a customer picks) it would be <strong>classification</strong>, covered from <a class="xref" data-note="ml_classification">Logistic Regression</a> onward. Many models do both; linear regression is the simplest model for numbers, and nearly every other model is compared against it as a <strong>baseline</strong>.</p>
  <h3>The running example: six houses</h3>
  <p>A small property dealer sold six flats last year. Size is in hundreds of square feet (so 6 means 600 sq ft), price in lakh rupees. This table is used in every section of this note, and in the other three notes of the Regression group.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
houses = pd.DataFrame({
    "house":    list("ABCDEF"),
    "size":     [6, 8, 10, 12, 14, 16],          # floor area, hundreds of sq ft (6 = 600 sq ft)
    "rooms":    [1, 2, 2, 3, 3, 4],              # bedrooms
    "locality": ["Old town", "Suburb", "Metro", "Old town", "Suburb", "Metro"],
    "price":    [28, 40, 53, 66, 79, 100],       # sale price, lakh rupees
})
print(houses.to_string(index=False))</div>
  <div class="fx" data-lang="text">house  size  rooms locality  price
    A     6      1 Old town     28
    B     8      2   Suburb     40
    C    10      2    Metro     53
    D    12      3 Old town     66
    E    14      3   Suburb     79
    F    16      4    Metro    100</div>
  <p>By eye, price climbs steadily with size: about 12 to 13 lakh for every extra 200 sq ft, and a little faster at the big end (F jumps 21 lakh over E). Bigger flats also tend to have more bedrooms. Our first job: one formula, price ≈ b + w·size, that summarises the table and prices a new flat.</p>
  <h3>Notation used in this note</h3>
  <table class="tbl">
    <tr><th>Symbol</th><th>Meaning</th><th>In the six-house example</th></tr>
    <tr><td>n</td><td>number of rows (examples)</td><td>6</td></tr>
    <tr><td>d</td><td>number of feature columns</td><td>1 (size), later 2 (size, rooms)</td></tr>
    <tr><td>xᵢ, yᵢ</td><td>features and target of row i</td><td>house C: x = 10, y = 53</td></tr>
    <tr><td>ŷᵢ</td><td>the model's prediction for row i ("y-hat")</td><td>ŷ_C = 54</td></tr>
    <tr><td>w, b</td><td>weight (slope) and bias (intercept); together the <strong>parameters</strong></td><td>w = 7, b = −16</td></tr>
    <tr><td>eᵢ = yᵢ − ŷᵢ</td><td>residual: how far the prediction missed</td><td>e_C = −1</td></tr>
    <tr><td>x̄, ȳ</td><td>averages of x and y</td><td>11 and 61</td></tr>
    <tr><td>X</td><td>the n × (d+1) data table with a leading column of 1s</td><td>6 × 2</td></tr>
  </table>
  <h3>The assumed story behind the data</h3>
  <p>Linear regression assumes the world produces data like this: <strong>y = b + w₁x₁ + … + w_dx_d + ε</strong>. The weighted sum is the part of y the features explain; ε (epsilon) is everything else: the buyer's urgency, the view from the balcony, columns we did not record. ε is not a mistake of the model; it is noise the model can never predict. Our job is to estimate the unknown true weights from data, and to say how uncertain those estimates are.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A chai stall's daily sales = 200 cups + 15 cups per degree of cold below 20 °C + a random amount (a cricket match nearby, a festival). The "200 + 15 per degree" is the line; the random amount is ε. Looking at a month of data, you try to recover 200 and 15.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Linear regression</strong> models a numeric target as ŷ = b + Σⱼ wⱼxⱼ, a constant plus a weighted sum of features. "Linear" means linear <em>in the parameters</em> w and b: each parameter multiplies something and the results are added. The features themselves may be x², log x or x₁·x₂.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Linear regression can only fit straight lines" is false. ŷ = b + w₁x + w₂x² is still linear regression (linear in w₁, w₂), and it fits a parabola. What it cannot do is something like ŷ = b·e^(wx) where a parameter sits inside a non-linear function. See <a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a>, which fits exactly such a parabola to these six houses.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The line y = wx + b.</b> We know the shape of the model. Before finding the best weights we should be fluent with what one weight and one intercept actually do to a line, and how to measure a miss.</div>

  <h2 id="lr-line"><span class="num">02</span>The Line y = wx + b</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We wrote price = b + w·size + ε. What do b and w do to the picture, and when we try a particular line on our six houses, how do we put one number on how badly it misses?</p>
  </div>
  <h3>Slope and intercept in plain words</h3>
  <p>With one feature the model is a straight line ŷ = wx + b. The <strong>slope w</strong> says how much ŷ rises when x rises by 1 unit. The <strong>intercept b</strong> is the value of ŷ when x = 0, the height where the line crosses the y-axis.</p>
  <table class="tbl">
    <tr><th>Line</th><th>At x = 0</th><th>At x = 10</th><th>At x = 16</th><th>Reading</th></tr>
    <tr><td>ŷ = 7x − 16</td><td>−16</td><td>54</td><td>96</td><td>+7 lakh per 100 sq ft (the line we will derive)</td></tr>
    <tr><td>ŷ = 6x + 0</td><td>0</td><td>60</td><td>96</td><td>through the origin, flatter</td></tr>
    <tr><td>ŷ = 0x + 61</td><td>61</td><td>61</td><td>61</td><td>flat: predicts the average price for every house</td></tr>
    <tr><td>ŷ = −2x + 90</td><td>90</td><td>70</td><td>58</td><td>falls 2 per unit (clearly wrong here)</td></tr>
  </table>
  <p>The flat line at ȳ = 61 (third row) is the laziest possible model: it ignores size. Every regression model will be measured against it (that is exactly what R² does in section 08).</p>
  <h3>Our data and the line we will find</h3>
  <figure class="viz"><svg viewBox="0 0 520 270" width="520">
<line x1="60" y1="230" x2="500" y2="230" stroke="currentColor"/><line x1="60" y1="20" x2="60" y2="230" stroke="currentColor"/>
<text x="52" y="234" text-anchor="end" class="tm" font-size="11">0</text><text x="52" y="186" text-anchor="end" class="tm" font-size="11">25</text><text x="52" y="139" text-anchor="end" class="tm" font-size="11">50</text><text x="52" y="91" text-anchor="end" class="tm" font-size="11">75</text><text x="52" y="43" text-anchor="end" class="tm" font-size="11">100</text>
<text x="123" y="246" text-anchor="middle" class="tm" font-size="11">6</text><text x="186" y="246" text-anchor="middle" class="tm" font-size="11">8</text><text x="249" y="246" text-anchor="middle" class="tm" font-size="11">10</text><text x="311" y="246" text-anchor="middle" class="tm" font-size="11">12</text><text x="374" y="246" text-anchor="middle" class="tm" font-size="11">14</text><text x="437" y="246" text-anchor="middle" class="tm" font-size="11">16</text>
<text x="280" y="264" text-anchor="middle" class="tm" font-size="11.5">size (hundreds of sq ft)</text><text x="66" y="16" class="tm" font-size="11.5">price (lakh ₹)</text>
<line x1="60" y1="114" x2="480" y2="114" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/><text x="478" y="108" text-anchor="end" class="tm" font-size="11">ȳ = 61</text>
<line x1="60" y1="207" x2="500" y2="20" class="sb" stroke-width="2.2"/>
<line x1="123" y1="177" x2="123" y2="180" class="sr" stroke-width="3"/>
<line x1="249" y1="129" x2="249" y2="127" class="sr" stroke-width="3"/>
<line x1="311" y1="104" x2="311" y2="100" class="sr" stroke-width="3"/>
<line x1="374" y1="79" x2="374" y2="73" class="sr" stroke-width="3"/>
<line x1="437" y1="39" x2="437" y2="47" class="sr" stroke-width="3"/>
<circle cx="123" cy="177" r="5" class="ft st"/><circle cx="186" cy="154" r="5" class="ft st"/><circle cx="249" cy="129" r="5" class="ft st"/><circle cx="311" cy="104" r="5" class="ft st"/><circle cx="374" cy="79" r="5" class="ft st"/><circle cx="437" cy="39" r="5" class="ft st"/>
<text x="113" y="170" text-anchor="end" font-size="11">A</text><text x="176" y="148" text-anchor="end" font-size="11">B</text><text x="239" y="122" text-anchor="end" font-size="11">C</text><text x="321" y="116" font-size="11">D</text><text x="384" y="92" font-size="11">E</text><text x="427" y="34" text-anchor="end" font-size="11">F</text>
<text x="300" y="60" class="tb" font-size="12.5">ŷ = −16 + 7x</text>
<circle cx="280" cy="114" r="4" class="fg sg"/><text x="288" y="130" class="tg" font-size="11">(x̄, ȳ) = (11, 61)</text>
</svg><figcaption>The six houses and the least-squares line we will derive. The residuals (red, vertical) are small at this scale: at most 4 lakh. The line passes through the point of averages (11, 61).</figcaption></figure>
  <h3>Residuals: measuring a miss</h3>
  <p>For any candidate line, each house gets a residual eᵢ = yᵢ − ŷᵢ: positive when the house sold for more than the line predicts (point above the line), negative when less. We measure the gap <strong>vertically</strong>, because the job is predicting y from x; errors in price are what we pay for. Take the guess ŷ = −10 + 6.5x:</p>
  <table class="tbl out"><caption>Scoring the guess ŷ = −10 + 6.5x</caption>
    <tr><th>house</th><th>x</th><th>y</th><th>ŷ</th><th>e = y − ŷ</th><th>e²</th></tr>
    <tr><td>A</td><td>6</td><td>28</td><td>29</td><td>−1</td><td>1</td></tr>
    <tr><td>B</td><td>8</td><td>40</td><td>42</td><td>−2</td><td>4</td></tr>
    <tr><td>C</td><td>10</td><td>53</td><td>55</td><td>−2</td><td>4</td></tr>
    <tr><td>D</td><td>12</td><td>66</td><td>68</td><td>−2</td><td>4</td></tr>
    <tr><td>E</td><td>14</td><td>79</td><td>81</td><td>−2</td><td>4</td></tr>
    <tr><td>F</td><td>16</td><td>100</td><td>94</td><td>+6</td><td>36</td></tr>
    <tr><td colspan="4"><strong>sums</strong></td><td><strong>−3</strong></td><td><strong>53</strong></td></tr>
  </table>
  <p>To turn six residuals into one score we cannot just add them: +6 and five −1s or −2s nearly cancel, and a terrible line could score 0. Two fixes: add absolute values Σ|eᵢ|, or add squares Σeᵢ². Least squares uses squares, for three reasons:</p>
  <ol>
    <li><strong>Smooth</strong>: e² has a derivative everywhere (|e| has a kink at 0), so calculus gives an exact formula.</li>
    <li><strong>One bottom</strong>: the total is a bowl in the weights (convex), so there is exactly one best line (when columns are not duplicates).</li>
    <li><strong>Statistics</strong>: if the noise ε is normally distributed, least squares is the maximum-likelihood estimate (section 05), and it gives the mean of y for each x.</li>
  </ol>
  <p>The cost: a miss of 6 costs 36 while six misses of 1 cost only 6, so one wild point pulls the line hard (F's +6 is 36 of the 53 above). <a class="xref" data-note="ml_loss_gd">Loss Functions</a> compares squared, absolute and Huber loss in detail.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Residual</strong> eᵢ = yᵢ − ŷᵢ. <strong>Sum of squared errors</strong> SSE (also RSS, residual sum of squares) = Σᵢ eᵢ². <strong>Ordinary least squares (OLS)</strong> chooses the parameters that make SSE as small as possible.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Residual (yᵢ − ŷᵢ, observed, from our fitted line) and error (εᵢ, unobservable, from the true line) are different things. Residuals are our <em>estimates</em> of the errors; the diagnostics note studies residuals because errors cannot be seen.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Least squares derived.</b> We can score any line (the guess scores 53). Now we need the rule that finds the line with the smallest SSE, not by trying lines, but with a formula.</div>

  <h2 id="lr-ls"><span class="num">03</span>Least Squares Derived (and Solved by Hand)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The guess −10 + 6.5x scores SSE 53, but there are infinitely many other lines. Which single line makes SSE as small as possible on the six houses, and can we get it from a formula instead of by trial?</p>
  </div>
  <h3>The idea: the bottom of a bowl is flat</h3>
  <p>SSE depends on two numbers, w and b. Picture a bowl: each position on the floor is a (w, b) pair, the height is the SSE of that line. At the lowest point the bowl is flat in every direction, so the slope (derivative) with respect to b is 0 and the slope with respect to w is 0. Two equations, two unknowns: solve them.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A marble dropped into a round steel katori rolls and stops at the bottom, where the surface is level. Setting the derivatives to zero is "finding where the floor is level".</p>
  </div>
  <h3>Step 1: the derivative with respect to b</h3>
  <p>SSE(w, b) = Σ (yᵢ − wxᵢ − b)². Differentiate each square with the chain rule (the derivative of u² is 2u · u′, and the derivative of (yᵢ − wxᵢ − b) with respect to b is −1):</p>
  <p>∂SSE/∂b = Σ 2(yᵢ − wxᵢ − b)(−1) = −2 Σ (yᵢ − wxᵢ − b).</p>
  <p>Set it to 0 and divide by −2n: (1/n)Σyᵢ − w(1/n)Σxᵢ − b = 0, that is <strong>b = ȳ − w·x̄</strong>.</p>
  <p>Plain words: the best line always passes through the point of averages (x̄, ȳ). Also, since Σ(yᵢ − ŷᵢ) = 0 at the solution, <strong>the residuals of any OLS fit with an intercept add up to exactly zero</strong>. (The guess above summed to −3, so it was not the OLS line.)</p>
  <h3>Step 2: the derivative with respect to w</h3>
  <p>The derivative of (yᵢ − wxᵢ − b) with respect to w is −xᵢ, so ∂SSE/∂w = −2 Σ xᵢ(yᵢ − wxᵢ − b). Set it to 0 and substitute b = ȳ − w x̄:</p>
  <p>Σ xᵢ(yᵢ − ȳ − w(xᵢ − x̄)) = 0 → Σ xᵢ(yᵢ − ȳ) = w Σ xᵢ(xᵢ − x̄).</p>
  <p>Because Σ(xᵢ − x̄) = 0, we may replace the leading xᵢ by (xᵢ − x̄) on both sides without changing the sums (we are only subtracting x̄ · 0). That gives the famous formula:</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Least-squares line, one feature:</strong><br>w = S_xy / S_xx = Σ(xᵢ − x̄)(yᵢ − ȳ) / Σ(xᵢ − x̄)²,  b = ȳ − w·x̄.<br>S_xy measures how x and y move together (it is n times the covariance); S_xx measures how spread out x is (n times the variance). So w = cov(x, y) / var(x).</p>
  </div>
  <p>Is it a minimum, not a maximum? The second derivatives are ∂²SSE/∂b² = 2n &gt; 0 and ∂²SSE/∂w² = 2Σxᵢ² &gt; 0, and the bowl is convex (shown with matrices in section 04), so the flat point is the bottom.</p>
  <h3>Worked by hand on the six houses</h3>
  <p>x̄ = (6+8+10+12+14+16)/6 = 66/6 = 11. ȳ = (28+40+53+66+79+100)/6 = 366/6 = 61.</p>
  <table class="tbl out"><caption>The two sums we need</caption>
    <tr><th>house</th><th>x</th><th>y</th><th>dx = x − 11</th><th>dy = y − 61</th><th>dx · dy</th><th>dx²</th></tr>
    <tr><td>A</td><td>6</td><td>28</td><td>−5</td><td>−33</td><td>165</td><td>25</td></tr>
    <tr><td>B</td><td>8</td><td>40</td><td>−3</td><td>−21</td><td>63</td><td>9</td></tr>
    <tr><td>C</td><td>10</td><td>53</td><td>−1</td><td>−8</td><td>8</td><td>1</td></tr>
    <tr><td>D</td><td>12</td><td>66</td><td>1</td><td>5</td><td>5</td><td>1</td></tr>
    <tr><td>E</td><td>14</td><td>79</td><td>3</td><td>18</td><td>54</td><td>9</td></tr>
    <tr><td>F</td><td>16</td><td>100</td><td>5</td><td>39</td><td>195</td><td>25</td></tr>
    <tr><td colspan="5"><strong>sums</strong></td><td><strong>S_xy = 490</strong></td><td><strong>S_xx = 70</strong></td></tr>
  </table>
  <p>w = 490 / 70 = <strong>7</strong> lakh per 100 sq ft. b = 61 − 7 × 11 = <strong>−16</strong> lakh. The line is ŷ = −16 + 7x.</p>
  <table class="tbl out"><caption>Predictions and residuals</caption>
    <tr><th>house</th><th>x</th><th>y</th><th>ŷ = −16 + 7x</th><th>e = y − ŷ</th><th>e²</th></tr>
    <tr><td>A</td><td>6</td><td>28</td><td>26</td><td>+2</td><td>4</td></tr>
    <tr><td>B</td><td>8</td><td>40</td><td>40</td><td>0</td><td>0</td></tr>
    <tr><td>C</td><td>10</td><td>53</td><td>54</td><td>−1</td><td>1</td></tr>
    <tr><td>D</td><td>12</td><td>66</td><td>68</td><td>−2</td><td>4</td></tr>
    <tr><td>E</td><td>14</td><td>79</td><td>82</td><td>−3</td><td>9</td></tr>
    <tr><td>F</td><td>16</td><td>100</td><td>96</td><td>+4</td><td>16</td></tr>
    <tr><td colspan="4"><strong>sums</strong></td><td><strong>0</strong></td><td><strong>SSE = 34</strong></td></tr>
  </table>
  <p>The residuals add to 0, as step 1 promised. Remember their pattern, <strong>+2, 0, −1, −2, −3, +4</strong>: positive at both ends, negative in the middle. It is the clue the next three notes follow up. Is 34 really the smallest? The code checks the arithmetic and tries three other lines.</p>
  <div class="fx" data-lang="py">x = houses["size"].to_numpy(float)             # size, hundreds of sq ft
y = houses["price"].to_numpy(float)            # price, lakh rupees
dx, dy = x - x.mean(), y - y.mean()
w = (dx * dy).sum() / (dx ** 2).sum()          # slope
b = y.mean() - w * x.mean()                    # intercept
print("x_bar", x.mean(), " y_bar", y.mean())
print("S_xy", (dx * dy).sum(), " S_xx", (dx ** 2).sum())
print(f"slope w = {w:.3f}   intercept b = {b:.3f}")
res = y - (b + w * x)
print("residuals", res.round(2) + 0.0, " sum", round(res.sum(), 10) + 0.0)
print("SSE", round((res ** 2).sum(), 3))
for bb, ww in [(-16, 7), (-10, 6.5), (-20, 7.5), (0, 5.5)]:
    print(f"line {bb} + {ww}x   SSE = {((y - (bb + ww * x)) ** 2).sum():.2f}")</div>
  <div class="fx" data-lang="text">x_bar 11.0  y_bar 61.0
S_xy 490.0  S_xx 70.0
slope w = 7.000   intercept b = -16.000
residuals [ 2.  0. -1. -2. -3.  4.]  sum 0.0
SSE 34.0
line -16 + 7x   SSE = 34.00
line -10 + 6.5x   SSE = 53.00
line -20 + 7.5x   SSE = 65.00
line 0 + 5.5x   SSE = 193.00</div>
  <p><code>dx</code> and <code>dy</code> are the middle columns of the table; the next two lines are the two formulas. Every other line has a bigger SSE (53, 65, 193). <code>+ 0.0</code> only turns a printed "-0." into "0.".</p>
  <h3>Seeing the bowl</h3>
  <p>Fix b at its best value for each w (b = ȳ − w·x̄) and look at SSE as w changes. Expanding the square gives SSE(w) = 34 + S_xx·(w − 7)² = 34 + 70(w − 7)²: a parabola whose bottom is at w = 7.</p>
  <div class="fx" data-lang="py"># SSE as a function of the slope, with the intercept always set to y_bar - w*x_bar
for ww in [6.0, 6.25, 6.5, 6.75, 7.0, 7.25, 7.5, 7.75, 8.0]:
    bb = y.mean() - ww * x.mean()
    print(f"w={ww:.2f}  b={bb:6.2f}  SSE={((y - (bb + ww * x)) ** 2).sum():6.2f}")</div>
  <div class="fx" data-lang="text">w=6.00  b= -5.00  SSE=104.00
w=6.25  b= -7.75  SSE= 73.38
w=6.50  b=-10.50  SSE= 51.50
w=6.75  b=-13.25  SSE= 38.38
w=7.00  b=-16.00  SSE= 34.00
w=7.25  b=-18.75  SSE= 38.38
w=7.50  b=-21.50  SSE= 51.50
w=7.75  b=-24.25  SSE= 73.38
w=8.00  b=-27.00  SSE=104.00</div>
  <figure class="viz"><svg viewBox="0 0 520 260" width="520">
<line x1="50" y1="220" x2="480" y2="220" stroke="currentColor"/><line x1="50" y1="30" x2="50" y2="220" stroke="currentColor"/>
<text x="42" y="224" text-anchor="end" class="tm" font-size="11">0</text><text x="42" y="138" text-anchor="end" class="tm" font-size="11">50</text><text x="42" y="51" text-anchor="end" class="tm" font-size="11">100</text>
<text x="60" y="236" text-anchor="middle" class="tm" font-size="11">6.0</text><text x="110" y="236" text-anchor="middle" class="tm" font-size="11">6.25</text><text x="160" y="236" text-anchor="middle" class="tm" font-size="11">6.5</text><text x="210" y="236" text-anchor="middle" class="tm" font-size="11">6.75</text><text x="260" y="236" text-anchor="middle" class="tm" font-size="11">7.0</text><text x="310" y="236" text-anchor="middle" class="tm" font-size="11">7.25</text><text x="360" y="236" text-anchor="middle" class="tm" font-size="11">7.5</text><text x="410" y="236" text-anchor="middle" class="tm" font-size="11">7.75</text><text x="460" y="236" text-anchor="middle" class="tm" font-size="11">8.0</text>
<text x="265" y="254" text-anchor="middle" class="tm" font-size="11.5">slope w (with b = ȳ − w·x̄)</text><text x="56" y="24" class="tm" font-size="11.5">SSE</text>
<polyline points="60,40 70,52 80,63 90,74 100,84 110,93 120,102 130,110 140,118 150,125 160,131 170,137 180,142 190,146 200,150 210,154 220,156 230,159 240,160 250,161 260,161 270,161 280,160 290,159 300,156 310,154 320,150 330,146 340,142 350,137 360,131 370,125 380,118 390,110 400,102 410,93 420,84 430,74 440,63 450,52 460,40" fill="none" class="sb" stroke-width="2.5"/>
<circle cx="60" cy="40" r="4" class="ft st"/><circle cx="160" cy="131" r="4" class="ft st"/><circle cx="360" cy="131" r="4" class="ft st"/><circle cx="460" cy="40" r="4" class="ft st"/>
<circle cx="260" cy="161" r="6" class="fg sg"/><text x="260" y="184" text-anchor="middle" class="tg" font-size="12">minimum: w = 7, SSE = 34</text>
<line x1="75" y1="58" x2="125" y2="106" class="sr" stroke-width="1.5" stroke-dasharray="4 3"/><text x="132" y="70" class="tr" font-size="11">steep slope far away: big gradient</text>
<line x1="225" y1="161" x2="295" y2="161" class="sg" stroke-width="1.5" stroke-dasharray="4 3"/><text x="260" y="202" text-anchor="middle" class="tg" font-size="11">flat at the bottom: derivative = 0</text>
</svg><figcaption>SSE against the slope: 34 + 70(w − 7)². A symmetric bowl (parabola), lowest at w = 7. Setting the derivative to zero picks out exactly this point; gradient descent (section 06) walks down the same bowl.</figcaption></figure>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>The slope formula S_xy / S_xx is "how much x and y move together, divided by how much x moves on its own". Every house above average size (D, E, F) is also above average price, and every smaller one is below, so all six products dx·dy are positive and the slope is steep and positive.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Regressing y on x and x on y gives two <em>different</em> lines (the second minimises horizontal gaps). Slope of price on size = S_xy / S_xx = 7, so "size per lakh" would be 1/7 = 0.1429; but the slope of size on price = S_xy / S_yy = 490 / 3464 = 0.1415. They agree only when the correlation is ±1 (their ratio is r² = 0.990 here), and drift apart as the fit gets worse. Decide which variable you are predicting.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Matrix form &amp; the normal equation.</b> Real problems have many features: size <em>and</em> bedrooms <em>and</em> locality. Writing a separate derivative for each weight gets messy fast. Matrices let us write all of them in one line.</div>

  <h2 id="lr-matrix"><span class="num">04</span>Matrix Form &amp; the Normal Equation</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>S_xy/S_xx works for size alone. The dealer also knows each flat's bedrooms. With two (or two hundred) features, how do we find all the weights at once, and what is size worth once bedrooms are counted?</p>
  </div>
  <h3>All rows at once</h3>
  <p>Stack the rows. Put a column of 1s in front of the features (it multiplies the intercept), and stack all parameters in one vector w = [b, w₁, …, w_d]. Then all n predictions are a single matrix product ŷ = Xw:</p>
  <table class="tbl">
    <tr><th>X (6 × 2)</th><th>w (2 × 1)</th><th>ŷ = Xw</th></tr>
    <tr><td>[1, 6]<br>[1, 8]<br>[1, 10]<br>[1, 12]<br>[1, 14]<br>[1, 16]</td><td>[b]<br>[w]</td><td>b + 6w<br>b + 8w<br>b + 10w<br>b + 12w<br>b + 14w<br>b + 16w</td></tr>
  </table>
  <p>The loss is the squared length of the residual vector: SSE = ‖y − Xw‖² = (y − Xw)ᵀ(y − Xw).</p>
  <h3>Deriving the normal equation</h3>
  <p>Multiply out: SSE = yᵀy − 2wᵀXᵀy + wᵀXᵀXw. Two matrix-calculus facts (each is the many-variable version of d(ax)/dx = a and d(ax²)/dx = 2ax): the gradient of wᵀa is a, and the gradient of wᵀAw is 2Aw when A is symmetric. So</p>
  <p>∇SSE = −2Xᵀy + 2XᵀXw. Set it to the zero vector:</p>
  <div class="flow"><span>Loss ‖y − Xw‖²</span><span>Gradient −2Xᵀ(y − Xw)</span><span>Set = 0</span><span>XᵀX w = Xᵀy</span><span>w = (XᵀX)⁻¹Xᵀy</span></div>
  <p>The middle equation XᵀXw = Xᵀy is the <strong>normal equation</strong> (one equation per parameter). Its second derivative (Hessian) is 2XᵀX, which is positive semi-definite (vᵀXᵀXv = ‖Xv‖² ≥ 0 for every v), so the loss is a convex bowl and the solution is the minimum. If no column is a combination of the others, XᵀX is invertible and the answer is unique.</p>
  <h3>The 2×2 case by hand</h3>
  <p>XᵀX is a table of sums: [[n, Σx], [Σx, Σx²]]. Xᵀy = [Σy, Σxy]. For our houses: n = 6, Σx = 66, Σx² = 36 + 64 + 100 + 144 + 196 + 256 = 796, Σy = 366, Σxy = 168 + 320 + 530 + 792 + 1106 + 1600 = 4516.</p>
  <p>So the normal equation is two ordinary equations:</p>
  <ul>
    <li>6b + 66w = 366</li>
    <li>66b + 796w = 4516</li>
  </ul>
  <p><strong>Solve with the 2×2 inverse.</strong> For A = [[a, c], [c, d]], A⁻¹ = (1/(ad − c²))·[[d, −c], [−c, a]]. Here the determinant is 6·796 − 66·66 = 4776 − 4356 = <strong>420</strong>, so (XᵀX)⁻¹ = (1/420)[[796, −66], [−66, 6]] = [[1.8952, −0.1571], [−0.1571, 0.01429]].</p>
  <p>w = (XᵀX)⁻¹Xᵀy: b = (796·366 − 66·4516)/420 = (291,336 − 298,056)/420 = −6,720/420 = <strong>−16</strong>; w = (−66·366 + 6·4516)/420 = (−24,156 + 27,096)/420 = 2,940/420 = <strong>7</strong>. The same line as the one-feature formula, as it must be. Keep the inverse's diagonal, 1.8952 and 0.01429: it reappears in section 09 as the source of the standard errors.</p>
  <div class="fx" data-lang="py">X = np.c_[np.ones(6), x]                        # column of 1s (intercept) + size
XtX, Xty = X.T @ X, X.T @ y
print("X^T X =", XtX.tolist())
print("X^T y =", Xty.tolist())
print("det   =", round(np.linalg.det(XtX), 6))
w_solve = np.linalg.solve(XtX, Xty)             # solves (X^T X) w = X^T y
w_lstsq, *_ = np.linalg.lstsq(X, y, rcond=None) # SVD-based least squares
print("solve :", w_solve.round(4) + 0.0)
print("lstsq :", w_lstsq.round(4) + 0.0)
r = y - X @ w_solve
print("X^T r =", (X.T @ r).round(8) + 0.0, "  (residuals are orthogonal to every column)")</div>
  <div class="fx" data-lang="text">X^T X = [[6.0, 66.0], [66.0, 796.0]]
X^T y = [366.0, 4516.0]
det   = 420.0
solve : [-16.   7.]
lstsq : [-16.   7.]
X^T r = [0. 0.]   (residuals are orthogonal to every column)</div>
  <p><code>np.c_</code> glues a column of 1s to x. <code>solve</code> solves the linear system directly (no inverse is formed), and <code>lstsq</code> uses the SVD, which also copes with duplicated columns. The last line checks Xᵀe = 0: this is just the normal equation rewritten as Xᵀ(y − Xw) = 0.</p>
  <h3>Multiple regression by hand: size and bedrooms</h3>
  <p>Now use both columns of the table. Bedrooms: A 1, B 2, C 2, D 3, E 3, F 4 (mean 2.5).</p>
  <table class="tbl"><caption>Centred columns</caption>
    <tr><th>house</th><th>size x₁</th><th>rooms x₂</th><th>price y</th><th>d₁ = x₁ − 11</th><th>d₂ = x₂ − 2.5</th><th>dy = y − 61</th></tr>
    <tr><td>A</td><td>6</td><td>1</td><td>28</td><td>−5</td><td>−1.5</td><td>−33</td></tr>
    <tr><td>B</td><td>8</td><td>2</td><td>40</td><td>−3</td><td>−0.5</td><td>−21</td></tr>
    <tr><td>C</td><td>10</td><td>2</td><td>53</td><td>−1</td><td>−0.5</td><td>−8</td></tr>
    <tr><td>D</td><td>12</td><td>3</td><td>66</td><td>1</td><td>0.5</td><td>5</td></tr>
    <tr><td>E</td><td>14</td><td>3</td><td>79</td><td>3</td><td>0.5</td><td>18</td></tr>
    <tr><td>F</td><td>16</td><td>4</td><td>100</td><td>5</td><td>1.5</td><td>39</td></tr>
  </table>
  <p>A shortcut that keeps the arithmetic small: <strong>centre</strong> every column (subtract its mean). The intercept then drops out of the system and comes back at the end as b = ȳ − w₁x̄₁ − w₂x̄₂. The centred normal equation is a 2×2 system of sums of products:</p>
  <ul>
    <li>S₁₁ = Σd₁² = 25 + 9 + 1 + 1 + 9 + 25 = <strong>70</strong></li>
    <li>S₁₂ = Σd₁d₂ = 7.5 + 1.5 + 0.5 + 0.5 + 1.5 + 7.5 = <strong>19</strong></li>
    <li>S₂₂ = Σd₂² = 2.25 + 0.25 + 0.25 + 0.25 + 0.25 + 2.25 = <strong>5.5</strong></li>
    <li>S₁y = Σd₁·dy = <strong>490</strong> (as before)</li>
    <li>S₂y = Σd₂·dy = 49.5 + 10.5 + 4 + 2.5 + 9 + 58.5 = <strong>134</strong></li>
  </ul>
  <p>Equations: 70w₁ + 19w₂ = 490 and 19w₁ + 5.5w₂ = 134. Determinant 70·5.5 − 19·19 = 385 − 361 = 24. Cramer's rule: w₁ = (490·5.5 − 19·134)/24 = (2,695 − 2,546)/24 = 149/24 = <strong>6.208</strong>; w₂ = (70·134 − 19·490)/24 = (9,380 − 9,310)/24 = 70/24 = <strong>2.917</strong>. Intercept b = 61 − 6.208·11 − 2.917·2.5 = 61 − 68.29 − 7.29 = <strong>−14.58</strong>.</p>
  <p>Model: <strong>price = −14.58 + 6.21·size + 2.92·rooms</strong>.</p>
  <div class="fx" data-lang="py">rooms = houses["rooms"].to_numpy(float)                   # bedrooms
d1, d2, dyy = x - x.mean(), rooms - rooms.mean(), y - y.mean()
A = np.array([[d1 @ d1, d1 @ d2], [d1 @ d2, d2 @ d2]])    # centred X^T X (2x2)
c = np.array([d1 @ dyy, d2 @ dyy])                        # centred X^T y
print("centred X^T X =", A.tolist(), "  centred X^T y =", c.tolist())
w12 = np.linalg.solve(A, c)
w0 = y.mean() - w12 @ [x.mean(), rooms.mean()]
print("w_size, w_rooms =", w12.round(4), "  intercept =", round(w0, 4))
X3 = np.c_[np.ones(6), x, rooms]                          # full design matrix with 1s
print("full normal equation:", np.linalg.solve(X3.T @ X3, X3.T @ y).round(4))
print("size ALONE slope:", round((d1 @ dyy) / (d1 @ d1), 4))
print("corr(size, rooms) =", round(np.corrcoef(x, rooms)[0, 1], 3))</div>
  <div class="fx" data-lang="text">centred X^T X = [[70.0, 19.0], [19.0, 5.5]]   centred X^T y = [490.0, 134.0]
w_size, w_rooms = [6.2083 2.9167]   intercept = -14.5833
full normal equation: [-14.5833   6.2083   2.9167]
size ALONE slope: 7.0
corr(size, rooms) = 0.968</div>
  <p>The centred 2×2 system and the full 3×3 normal equation (with the 1s column) agree. Now the important line: <strong>size alone</strong> gives a slope of 490/70 = 7.0, but with bedrooms in the model it is 6.21. Why? Bigger flats in this table also have more bedrooms (correlation 0.968). Alone, size gets credit for both. Section 07 explains the exact formula: 7.0 = 6.208 + 2.917 × (19/70). Notice also the small determinant: 24 out of a possible 385 (the product of the diagonal). Two nearly redundant columns leave the system close to singular; <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a> measures this as a VIF of 16, and <a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a> repairs it.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Normal equation:</strong> XᵀXw = Xᵀy, with solution ŵ = (XᵀX)⁻¹Xᵀy when XᵀX is invertible (X has full column rank). X includes a leading column of 1s, so ŵ[0] is the intercept. Computing it costs about O(nd²) to form XᵀX plus O(d³) to solve.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Never compute <code>np.linalg.inv(X.T @ X) @ X.T @ y</code> in real code. Explicit inverses lose accuracy when columns are nearly duplicates (XᵀX nearly singular, like size and rooms). Use <code>np.linalg.lstsq</code> (SVD) or <code>solve</code>; sklearn's <code>LinearRegression</code> already uses an SVD-based least-squares solver.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Geometry &amp; properties of OLS.</b> We have a formula that gives −16 and 7. Why does it work? A picture of what XᵀXw = Xᵀy means, and a few facts about OLS that interviews love (why it is "best", why it equals maximum likelihood).</div>

  <h2 id="lr-geom"><span class="num">05</span>Geometry &amp; Properties of OLS</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The normal equation hands us −16 and 7, but as a recipe. What does "solving XᵀXw = Xᵀy" mean as a picture, which facts about the six residuals are guaranteed by it, and in what sense is this line the "best" one?</p>
  </div>
  <h3>Projection: the shadow of y</h3>
  <p>Think of the six prices y as one arrow in 6-dimensional space (one coordinate per house). Every possible prediction Xw is a combination of X's columns (the 1s column and the size column), so all of them lie on a flat sheet (the <strong>column space</strong> of X). The closest point on that sheet to y is found by dropping a perpendicular: the shadow. That shadow is ŷ = (26, 40, 54, 68, 82, 96), and the perpendicular is the residual vector e = (2, 0, −1, −2, −3, 4). "Perpendicular to every column" is exactly Xᵀe = 0, the normal equation. (The word "normal" means perpendicular.)</p>
  <figure class="viz"><svg viewBox="0 0 460 210" width="460">
<defs><marker id="lr-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<path d="M30 150 L250 175 L420 130 L200 105 Z" class="fs" stroke="currentColor"/>
<text x="30" y="198" class="tm" font-size="12">sheet = all possible Xw (column space of X)</text>
<line x1="120" y1="140" x2="260" y2="30" stroke="currentColor" stroke-width="2" marker-end="url(#lr-ah)"/>
<text x="266" y="28" font-size="13">y (actual prices)</text>
<line x1="120" y1="140" x2="260" y2="135" class="sb" stroke-width="2" marker-end="url(#lr-ah)"/>
<text x="266" y="150" class="tb" font-size="13">ŷ = Xŵ = Hy</text>
<line x1="260" y1="35" x2="260" y2="130" class="sr" stroke-width="2" stroke-dasharray="4 3"/>
<text x="268" y="88" class="tr" font-size="12">e = y − ŷ, perpendicular</text>
<path d="M260 122 h-8 v9" fill="none" stroke="currentColor"/>
</svg><figcaption>OLS finds the point of the sheet closest to y. The residual sticks out at a right angle: Xᵀe = 0.</figcaption></figure>
  <p>Substituting ŵ gives ŷ = X(XᵀX)⁻¹Xᵀy = <strong>Hy</strong>. H is the <strong>hat matrix</strong> ("it puts the hat on y"). Its diagonal entries hᵢᵢ, called <strong>leverages</strong>, say how much row i's own y pulls its own prediction (for one feature, hᵢ = 1/n + (xᵢ − x̄)²/S_xx: the end houses A and F get 1/6 + 25/70 = 0.524, the middle houses C and D only 0.181). <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a> uses them to find influential points.</p>
  <h3>Facts that follow (all true for every OLS fit with an intercept)</h3>
  <table class="tbl">
    <tr><th>Fact</th><th>Why</th><th>Check on the six houses</th></tr>
    <tr><td>Residuals sum to 0</td><td>e ⟂ the 1s column</td><td>2 + 0 − 1 − 2 − 3 + 4 = 0</td></tr>
    <tr><td>Residuals uncorrelated with each feature</td><td>e ⟂ every column</td><td>Σx·e = 12 + 0 − 10 − 24 − 42 + 64 = 0</td></tr>
    <tr><td>Residuals uncorrelated with ŷ</td><td>ŷ is a combination of columns</td><td>Σŷ·e = 52 + 0 − 54 − 136 − 246 + 384 = 0</td></tr>
    <tr><td>Line passes through (x̄, ȳ)</td><td>b = ȳ − wx̄</td><td>−16 + 7 × 11 = 61</td></tr>
    <tr><td>mean(ŷ) = mean(y)</td><td>residuals sum to 0</td><td>(26+40+54+68+82+96)/6 = 61</td></tr>
    <tr><td>SST = SSR + SSE</td><td>Pythagoras on the right angle</td><td>3464 = 3430 + 34</td></tr>
  </table>
  <p>Because these hold by construction, they are <em>not</em> evidence that the model is good. A residual plot of a wrong model still has residuals that average to zero, and ours (+2, 0, −1, −2, −3, +4) does exactly that while bending in a curve.</p>
  <h3>Why OLS is "best": Gauss–Markov (brief)</h3>
  <p>If the true model is linear, the errors have mean 0, the same variance for every row, and are uncorrelated with each other, then the OLS weights are <strong>BLUE</strong>: the Best (lowest variance) Linear Unbiased Estimator. "Unbiased" means that over many datasets the estimates average to the true weights. "Best" means no other unbiased estimator that is a linear function of y wobbles less. Normality of errors is <em>not</em> needed for this. Which assumptions buy what, and what to do when they fail, is the whole of <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a>.</p>
  <h3>Least squares = maximum likelihood under normal noise (brief)</h3>
  <p>Assume εᵢ ~ Normal(0, σ²). The probability density of seeing yᵢ is (1/√(2πσ²))·exp(−(yᵢ − xᵢᵀw)² / (2σ²)). Multiply over rows and take logs:</p>
  <p>log L(w, σ²) = −(n/2)·log(2πσ²) − (1/(2σ²))·Σ(yᵢ − xᵢᵀw)².</p>
  <p>The only part that depends on w is −SSE/(2σ²). Maximising the likelihood is therefore the same as minimising SSE. The best σ² is SSE/n, and plugging it back gives log L = −(n/2)(log 2π + log(SSE/n) + 1). For our houses: −3 × (1.8379 + log 5.667 + 1) = −3 × (1.8379 + 1.7346 + 1) = −3 × 4.5725 = <strong>−13.717</strong>, the "Log-Likelihood" line of the statsmodels summary in section 09. (<a class="xref" data-note="st_probability">Probability</a> covers likelihood.)</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Three views give the same answer: calculus (flat bottom of the SSE bowl), geometry (perpendicular projection), statistics (maximum likelihood with Gaussian noise). Ridge and lasso add a penalty to the first view; logistic regression changes the likelihood in the third.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"BLUE" does not mean "best model". A biased estimator such as ridge can have lower total error (bias² + variance) than OLS, which is why <a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a> often predicts better. Gauss–Markov only ranks <em>unbiased linear</em> estimators.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Gradient descent.</b> The normal equation needs XᵀX in memory and a d × d solve. With millions of rows streaming in, or a model too big for a closed form, we need a way to find the same weights step by step.</div>

  <h2 id="lr-gd"><span class="num">06</span>Gradient Descent: the Iterative Alternative</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The formula jumps straight to the bottom of the bowl, but only if we can form and solve XᵀX. For huge or streaming data, or for losses with no formula at all, how do we reach the same −16 and 7?</p>
  </div>
  <h3>The idea</h3>
  <p>Instead of jumping to the bottom of the bowl with a formula, start anywhere and repeatedly take a small step downhill. "Downhill" is the negative gradient; the step size is the <strong>learning rate</strong> η. The full theory (learning-rate effects, mini-batches, momentum) is in <a class="xref" data-note="ml_loss_gd">Loss Functions &amp; Gradient Descent</a>; here we apply it to our line.</p>
  <p>Use the mean squared error MSE = SSE / n (dividing by n keeps step sizes independent of dataset size). Its gradients are</p>
  <ul>
    <li>∂MSE/∂b = −(2/n) Σ eᵢ</li>
    <li>∂MSE/∂w = −(2/n) Σ xᵢ eᵢ, where eᵢ = yᵢ − (b + wxᵢ).</li>
  </ul>
  <p>Update: b ← b − η·∂MSE/∂b, w ← w − η·∂MSE/∂w.</p>
  <p>One practical change: we use the <strong>centred</strong> size c = x − 11 = −5, −3, −1, 1, 3, 5. Then the intercept is the price of an average-size house (61) and the slope is still 7, and, as the code shows, the steps for b and w stop interfering with each other.</p>
  <h3>Two steps by hand (η = 0.05, start b = 0, w = 0)</h3>
  <p><strong>Step 1.</strong> The line predicts 0 for every house, so the residuals are just the prices: 28, 40, 53, 66, 79, 100. Σe = 366 and Σc·e = S_xy = 490.</p>
  <ul>
    <li>∂b = −(2/6)·366 = −122; ∂w = −(2/6)·490 = −163.33</li>
    <li>b = 0 − 0.05·(−122) = <strong>6.1</strong>; w = 0 − 0.05·(−163.33) = <strong>8.167</strong></li>
  </ul>
  <p><strong>Step 2.</strong> Predictions 6.1 + 8.167c = −34.73, −18.40, −2.07, 14.27, 30.60, 46.93. Residuals:</p>
  <table class="tbl out"><caption>Step 2 sums</caption>
    <tr><th>house</th><th>c</th><th>e</th><th>c·e</th></tr>
    <tr><td>A</td><td>−5</td><td>62.73</td><td>−313.67</td></tr>
    <tr><td>B</td><td>−3</td><td>58.40</td><td>−175.20</td></tr>
    <tr><td>C</td><td>−1</td><td>55.07</td><td>−55.07</td></tr>
    <tr><td>D</td><td>1</td><td>51.73</td><td>51.73</td></tr>
    <tr><td>E</td><td>3</td><td>48.40</td><td>145.20</td></tr>
    <tr><td>F</td><td>5</td><td>53.07</td><td>265.33</td></tr>
    <tr><td><strong>sum</strong></td><td></td><td><strong>329.40</strong></td><td><strong>−81.67</strong></td></tr>
  </table>
  <ul>
    <li>∂b = −(2/6)(329.4) = −109.8; ∂w = −(2/6)(−81.67) = 27.22</li>
    <li>b = 6.1 + 0.05·109.8 = <strong>11.59</strong>; w = 8.167 − 0.05·27.22 = <strong>6.806</strong></li>
  </ul>
  <p>Step 1 overshot the slope (8.17 &gt; 7) because every prediction was far too low; step 2 pulled it back. The intercept creeps up toward 61. The code continues, and then repeats the experiment on raw (uncentred) size.</p>
  <div class="fx" data-lang="py">xc = x - x.mean()                             # centred size: -5, -3, -1, 1, 3, 5
w, b, lr = 0.0, 0.0, 0.05                     # start from the flat line y = 0
for step in range(1, 201):
    err = y - (b + w * xc)                    # residual for each of the 6 houses
    gb = -2 * err.mean()                      # d MSE / d b
    gw = -2 * (err * xc).mean()               # d MSE / d w
    b, w = b - lr * gb, w - lr * gw           # step downhill
    if step in (1, 2, 3, 10, 50, 200):
        mse = ((y - (b + w * xc)) ** 2).mean()
        print(f"step {step:3d}  grad_b={gb:8.3f} grad_w={gw:8.3f}  b={b:7.3f} w={w:6.3f}  MSE={mse:8.3f}")
print("back to raw size: intercept =", round(b - w * x.mean(), 3), " slope =", round(w, 3))
# the same algorithm on RAW (uncentred) size needs a far smaller step and many more steps
w, b, lr = 0.0, 0.0, 0.004
for step in range(1, 20001):
    err = y - (b + w * x)
    b, w = b + lr * 2 * err.mean(), w + lr * 2 * (err * x).mean()
    if step in (100, 1000, 20000):
        print(f"raw x, step {step:5d}: b={b:8.3f} w={w:6.3f}")</div>
  <div class="fx" data-lang="text">step   1  grad_b=-122.000 grad_w=-163.333  b=  6.100 w= 8.167  MSE=3035.556
step   2  grad_b=-109.800 grad_w=  27.222  b= 11.590 w= 6.806  MSE=2447.456
step   3  grad_b= -98.820 grad_w=  -4.537  b= 16.531 w= 7.032  MSE=1983.171
step  10  grad_b= -47.265 grad_w=   0.000  b= 39.731 w= 7.000  MSE= 458.053
step  50  grad_b=  -0.699 grad_w=  -0.000  b= 60.686 w= 7.000  MSE=   5.766
step 200  grad_b=  -0.000 grad_w=  -0.000  b= 61.000 w= 7.000  MSE=   5.667
back to raw size: intercept = -16.0  slope = 7.0
raw x, step   100: b=  -0.644 w= 5.726
raw x, step  1000: b=  -7.814 w= 6.321
raw x, step 20000: b= -16.000 w= 7.000</div>
  <p>Steps 1 and 2 match the hand table. With centred size the slope is right (7.000) by step 10, and the intercept reaches 61 by step 200, where MSE = 5.667 = SSE 34 / 6. Converting back, intercept 61 − 7 × 11 = −16: the OLS line. On <strong>raw</strong> size the same algorithm must use a step 12 times smaller (η = 0.004; with 0.05 it diverges, because the x values 6–16 make the bowl very steep in the w direction) and still needs about 20,000 steps: changing b and w have tangled effects, so the bowl is a long narrow valley. Centring or standardising makes the valley round and GD much faster; section 13 shows the effect on a real dataset.</p>
  <h3>Closed form or iterative?</h3>
  <table class="tbl">
    <tr><th></th><th>Normal equation / SVD</th><th>Gradient descent</th></tr>
    <tr><td>Answer</td><td>exact, in one shot</td><td>approximate; improves with iterations</td></tr>
    <tr><td>Cost</td><td>O(nd² + d³)</td><td>O(nd) per pass over the data</td></tr>
    <tr><td>Hyperparameters</td><td>none</td><td>learning rate, iterations (and batch size)</td></tr>
    <tr><td>Feature scaling</td><td>not needed</td><td>needed for speed (200 vs 20,000 steps above)</td></tr>
    <tr><td>Data bigger than memory / streaming</td><td>hard</td><td>natural (mini-batch, <code>SGDRegressor</code>)</td></tr>
    <tr><td>Generalises to other losses</td><td>only squared loss (and ridge)</td><td>any differentiable loss: logistic, Huber, neural nets</td></tr>
    <tr><td>sklearn</td><td><code>LinearRegression</code></td><td><code>SGDRegressor</code></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Batch gradient descent for linear regression:</strong> repeat w ← w − η·(2/n)·Xᵀ(Xw − y). Because the MSE is convex, any small enough η (below 2 / largest eigenvalue of (2/n)XᵀX) converges to the OLS solution.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Too large a learning rate makes the loss grow every step (η = 0.05 on raw size sends w to ±∞). Too small and it "converges" to a wrong answer only because you stopped early (raw size after 1,000 steps: w = 6.32, b = −7.8). Always plot the loss per iteration, and scale the features.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Interpreting coefficients.</b> We can find the weights three ways. But what does a weight of 7 <em>mean</em>, and why did size drop from 7.0 to 6.21 when bedrooms were added?</div>

  <h2 id="lr-interp"><span class="num">07</span>Interpreting Coefficients</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We have numbers: −16 and 7 for size alone; −14.58, 6.21 and 2.92 with bedrooms. What should we say to the dealer about them, and why does the "value of size" change when another column joins the model?</p>
  </div>
  <h3>The rule</h3>
  <p>A coefficient wⱼ is the change in the prediction when xⱼ increases by one unit <strong>and every other feature in the model stays the same</strong>. Its units are (units of y) per (unit of xⱼ).</p>
  <ul>
    <li>Size alone: w = 7 → "each extra 100 sq ft is associated with 7 lakh more price".</li>
    <li>Size and rooms: w_size = 6.21 → "comparing two flats with the <em>same number of bedrooms</em>, 100 sq ft more is associated with 6.21 lakh more". w_rooms = 2.92 → "same size, one more bedroom: 2.92 lakh more".</li>
    <li>The intercept is the prediction when every feature is 0. b = −16 means "a 0 sq ft flat sells for −16 lakh", which is nonsense: x = 0 is far outside the data (600 to 1,600 sq ft), and the intercept is just a mathematical anchor for the line. Centre the feature (as in section 06) and the intercept becomes meaningful: 61 lakh for an average 1,100 sq ft flat.</li>
  </ul>
  <h3>Why "holding others fixed" changes the number: the omitted-variable formula</h3>
  <p>When x₂ is left out, x₁'s simple slope absorbs part of x₂'s effect:</p>
  <p><strong>simple slope of x₁ = w₁ + w₂ · δ</strong>, where δ = S₁₂ / S₁₁ is the slope from regressing x₂ on x₁ ("how many extra bedrooms come with 100 more sq ft").</p>
  <p>Our houses by hand: δ = 19 / 70 = 0.271 bedrooms per 100 sq ft. Simple slope = 6.208 + 2.917 × 0.271 = 6.208 + 0.792 = <strong>7.000</strong>, exactly the "size ALONE" number the code printed. The extra 0.79 lakh is really the value of the bedrooms that tend to come with size. This is <strong>omitted-variable bias</strong>; <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a> covers when it makes coefficients misleading.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Ice-cream sales and drowning deaths rise together. Regress drownings on ice-cream alone and ice-cream gets a positive coefficient. Add temperature and ice-cream's coefficient drops to about zero: "holding temperature fixed", ice-cream has nothing to do with drowning.</p>
  </div>
  <h3>Units change the number, not the model</h3>
  <p>For our houses, 7 lakh per 100 sq ft is the same statement as 0.07 lakh (₹7,000) per sq ft. To see this on a bigger table, the same idea at scale: 300 simulated rented flats. Rent is in ₹ thousand per month, size in sq ft, distance to metro in km, building age in years. (Simulated so we know the truth: rent = 5 + 0.02·size − 1.5·metro − 0.1·age + city effect + noise with SD 3.)</p>
  <div class="fx" data-lang="py">import pandas as pd
from rent import df                     # 300 simulated flats (size, metro, age, city, rent)
print(df.head(4)); print(df.shape)</div>
  <div class="fx" data-lang="text">     size  metro  age    city  rent
0  1150.0    3.9   21  Mumbai  27.7
1  1477.0    1.3   25  Mumbai  39.5
2  1331.0    4.6   28  Mumbai  32.2
3   670.0    4.6   22  Mumbai  16.0
(300, 5)</div>
  <p>Fit with size in sq ft vs size in hundreds of sq ft, and distance in km vs metres:</p>
  <div class="fx" data-lang="py">from sklearn.linear_model import LinearRegression
num = ["size", "metro", "age"]
d2 = df.assign(size_100=df["size"] / 100, metro_m=df["metro"] * 1000)    # same data, new units
for cols in (["size", "metro", "age"], ["size_100", "metro_m", "age"]):
    m = LinearRegression().fit(d2[cols], d2["rent"])
    print({k: round(float(v), 5) for k, v in zip(cols, m.coef_)}, " R2", round(m.score(d2[cols], d2["rent"]), 4))
z = (df[num] - df[num].mean()) / df[num].std(ddof=0)                     # standardise
mz = LinearRegression().fit(z, df["rent"])
print("per 1 SD:", {k: round(float(v), 2) for k, v in zip(num, mz.coef_)}, " SDs:", df[num].std(ddof=0).round(2).to_dict())</div>
  <div class="fx" data-lang="text">{'size': 0.01955, 'metro': -1.64226, 'age': -0.03496}  R2 0.6601
{'size_100': 1.95474, 'metro_m': -0.00164, 'age': -0.03496}  R2 0.6601
per 1 SD: {'size': 6.8, 'metro': -2.64, 'age': -0.29}  SDs: {'size': 348.12, 'metro': 1.61, 'age': 8.39}</div>
  <p>The size coefficient goes from 0.01955 (per sq ft) to 1.95474 (per 100 sq ft): exactly 100×. Metro goes from −1.642 per km to −0.00164 per metre. R² is identical: predictions do not change, only the units of the weights do. So <strong>a big coefficient does not mean an important feature</strong>. To compare importance, standardise first (each feature to mean 0, SD 1). Then each weight means "change in rent per one standard deviation of the feature": size 6.8, metro −2.64, age −0.29. Size matters most, age least. Check by hand: 0.01955 × 348.12 = 6.81 ✓.</p>
  <h3>Log transforms: percentage interpretations</h3>
  <table class="tbl">
    <tr><th>Model</th><th>Reading of w</th><th>Example</th></tr>
    <tr><td>y = b + w·x</td><td>+1 unit of x → +w units of y</td><td>w = 7: +100 sq ft → +7 lakh</td></tr>
    <tr><td>log y = b + w·x</td><td>+1 unit of x → y multiplied by e^w, about +100·w %</td><td>w = 0.1: e^0.1 = 1.105 → +10.5% price per 100 sq ft</td></tr>
    <tr><td>y = b + w·log x</td><td>+1% in x → +w/100 units of y</td><td>w = 30: 1% bigger flat → +0.3 thousand rent</td></tr>
    <tr><td>log y = b + w·log x</td><td>+1% in x → about +w % in y (elasticity)</td><td>w = −1.2: price +1% → demand −1.2%</td></tr>
  </table>
  <p>The "about" matters for big w: w = 0.5 in a log-y model means ×e^0.5 = ×1.649, a 64.9% rise, not 50%.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>In ŷ = b + Σwⱼxⱼ, <strong>wⱼ = ∂ŷ/∂xⱼ</strong>: the partial effect of xⱼ with all other included features held constant. A <strong>standardised coefficient</strong> is wⱼ·sd(xⱼ) (or wⱼ·sd(xⱼ)/sd(y)), the effect of a one-SD change.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Coefficients describe association in <em>this</em> data, not cause and effect. "Holding others fixed" may also be impossible: you cannot raise x while holding x² fixed in a polynomial model, and in our table you rarely see two flats of very different size with the same bedrooms (correlation 0.968). When features are that strongly correlated the individual coefficients become unstable (VIF in <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: R² and RMSE.</b> We can read the weights. Is the line any good overall? We need a number for how well it fits.</div>

  <h2 id="lr-score"><span class="num">08</span>R² and RMSE (Brief)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>SSE = 34 is the smallest possible for a line, but is 34 good or bad? It has no scale: it is in lakh², and it grows with the number of houses. We need a fit score that compares against something and speaks in price units.</p>
  </div>
  <h3>Comparing against the lazy model</h3>
  <p>Split the spread of y into two parts. <strong>SST</strong> (total sum of squares) = Σ(yᵢ − ȳ)² is the SSE of the flat line at ȳ = 61, the lazy model. <strong>SSE</strong> is what our line leaves unexplained. <strong>SSR</strong> = Σ(ŷᵢ − ȳ)² is what the line explains. For OLS with an intercept, SST = SSR + SSE (the right angle of section 05).</p>
  <ul>
    <li>SST = 33² + 21² + 8² + 5² + 18² + 39² = 1089 + 441 + 64 + 25 + 324 + 1521 = <strong>3464</strong></li>
    <li>SSE = <strong>34</strong> (section 03); SSR = 3464 − 34 = <strong>3430</strong> (also = w²·S_xx = 49 × 70)</li>
    <li><strong>R² = 1 − SSE/SST</strong> = 1 − 34/3464 = <strong>0.990</strong>: the line removes 99.0% of the squared error of always guessing 61.</li>
    <li><strong>RMSE</strong> = √(SSE/n) = √(34/6) = √5.667 = <strong>2.38</strong> lakh: the typical miss, in price units.</li>
    <li><strong>MAE</strong> = mean |e| = (2 + 0 + 1 + 2 + 3 + 4)/6 = <strong>2.0</strong> lakh.</li>
  </ul>
  <p>With one feature, R² equals the squared correlation r², and the slope equals r · s_y / s_x. Here r = S_xy / √(S_xx·S_yy) = 490 / √(70 × 3464) = 490 / 492.4 = 0.9951, r² = 0.990.</p>
  <div class="fx" data-lang="py">from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
pred = -16 + 7 * x
print(f"R2   {r2_score(y, pred):.4f}")
print(f"RMSE {mean_squared_error(y, pred) ** 0.5:.4f}   MAE {mean_absolute_error(y, pred):.2f}")
print(f"corr(x, y) = {np.corrcoef(x, y)[0, 1]:.4f}  squared = {np.corrcoef(x, y)[0, 1] ** 2:.4f}")
print(f"r * sy/sx  = {np.corrcoef(x, y)[0, 1] * y.std() / x.std():.4f}  (the slope)")</div>
  <div class="fx" data-lang="text">R2   0.9902
RMSE 2.3805   MAE 2.00
corr(x, y) = 0.9951  squared = 0.9902
r * sy/sx  = 7.0000  (the slope)</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>R²</strong> (coefficient of determination) = 1 − SSE/SST: 1 is perfect, 0 is no better than the mean, negative (possible on test data) is worse than the mean. <strong>RMSE</strong> = √(Σe²/n), in y's units. <strong>Adjusted R²</strong> = 1 − (1 − R²)(n − 1)/(n − p) penalises extra parameters (p counts the intercept).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>R² = 0.990 does not mean the shape is right: our residuals still bend (+2, 0, −1, −2, −3, +4), and a curve will fit better. And training R² never decreases when you add a feature, even a column of random numbers, because the old solution is still available (set the new weight to 0). Judge models on held-out data (<a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a>), and see <a class="xref" data-note="ml_reg_metrics">Regression Metrics</a> for MAE, MAPE, RMSLE and when each fits the business.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The statsmodels summary.</b> R² describes the fit. A careful analyst also wants to know: is the size effect real or could it be luck with six houses? How precise is the 7? That is what a statsmodels summary answers.</div>

  <h2 id="lr-sm"><span class="num">09</span>The statsmodels Summary, Line by Line</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Six other houses would have given a slightly different slope. How much would 7 wobble from sample to sample, is it clearly different from 0, and what range of true slopes is believable?</p>
  </div>
  <h3>The need</h3>
  <p>sklearn gives coefficients and predictions. Analysts, economists and anyone writing "size has a significant effect" need <strong>uncertainty</strong>: standard errors, p-values and confidence intervals. statsmodels prints all of it in one table. Here it is for the six houses, and then we will rebuild every number by hand.</p>
  <div class="fx" data-lang="py">import warnings
import statsmodels.api as sm
warnings.filterwarnings("ignore")                   # n=6 is too small for the normality tests; silence their warnings
ols = sm.OLS(y, sm.add_constant(x)).fit()             # add_constant = the column of 1s
print(ols.summary(xname=["const", "size"], yname="price"))</div>
  <div class="fx" data-lang="text">                            OLS Regression Results                            
==============================================================================
Dep. Variable:                  price   R-squared:                       0.990
Model:                            OLS   Adj. R-squared:                  0.988
Method:                 Least Squares   F-statistic:                     403.5
Date:                Mon, 19 Oct 2026   Prob (F-statistic):           3.62e-05
Time:                        14:36:57   Log-Likelihood:                -13.717
No. Observations:                   6   AIC:                             31.43
Df Residuals:                       4   BIC:                             31.02
Df Model:                           1                                         
Covariance Type:            nonrobust                                         
==============================================================================
                 coef    std err          t      P&gt;|t|      [0.025      0.975]
------------------------------------------------------------------------------
const        -16.0000      4.014     -3.986      0.016     -27.144      -4.856
size           7.0000      0.348     20.088      0.000       6.033       7.967
==============================================================================
Omnibus:                          nan   Durbin-Watson:                   1.647
Prob(Omnibus):                    nan   Jarque-Bera (JB):                0.489
Skew:                           0.445   Prob(JB):                        0.783
Kurtosis:                       1.920   Cond. No.                         39.1
==============================================================================

Notes:
[1] Standard Errors assume that the covariance matrix of the errors is correctly specified.</div>
  <h3>The top-left block: the setup</h3>
  <table class="tbl">
    <tr><th>Line</th><th>Value</th><th>Meaning</th></tr>
    <tr><td>Dep. Variable</td><td>price</td><td>the target y</td></tr>
    <tr><td>Model / Method</td><td>OLS / Least Squares</td><td>ordinary least squares</td></tr>
    <tr><td>No. Observations</td><td>6</td><td>n</td></tr>
    <tr><td>Df Residuals</td><td>4</td><td>n − p = 6 − 2: rows left after estimating 2 parameters. Used for s² and the t-distribution.</td></tr>
    <tr><td>Df Model</td><td>1</td><td>number of features (p − 1, not counting the intercept)</td></tr>
    <tr><td>Covariance Type</td><td>nonrobust</td><td>classic standard errors that assume constant error variance; "HC3" etc. are the robust versions (<a class="xref" data-note="ml_reg_diag">Diagnostics</a>)</td></tr>
  </table>
  <h3>The top-right block: overall fit</h3>
  <p>All from SST = 3464, SSR = 3430, SSE = 34, n = 6, p = 2.</p>
  <ul>
    <li><strong>R-squared 0.990</strong> = 1 − 34/3464.</li>
    <li><strong>Adj. R-squared 0.988</strong> = 1 − (1 − 0.9902)·(6 − 1)/(6 − 2) = 1 − 0.0098 × 1.25 = 0.988. Lower than R² because a parameter was spent.</li>
    <li><strong>F-statistic 403.5</strong> = (SSR / Df Model) / (SSE / Df Residuals) = (3430/1) / (34/4) = 3430 / 8.5 = 403.5. It tests "all slopes are 0" (the model is no better than the mean). With one feature F = t² of the slope: 20.088² = 403.5.</li>
    <li><strong>Prob (F-statistic) 3.62e-05</strong>: chance of an F this large if every true slope were 0. From the F(1, 4) distribution.</li>
    <li><strong>Log-Likelihood −13.717</strong>: from section 05, −(n/2)(log 2π + log(SSE/n) + 1).</li>
    <li><strong>AIC 31.43</strong> = −2·logL + 2p = 27.435 + 4. <strong>BIC 31.02</strong> = −2·logL + p·ln n = 27.435 + 2 × 1.792. Lower is better when comparing models on the same y; BIC punishes extra parameters more when n &gt; 7.</li>
  </ul>
  <h3>The coefficient table, by hand</h3>
  <p><strong>1. Estimate the noise.</strong> s² = SSE / (n − p) = 34 / 4 = <strong>8.5</strong>, so s = 2.916 lakh. We divide by n − p, not n, because two parameters were fitted to these same 6 points, which makes residuals slightly smaller than the true errors; dividing by 4 corrects that (it makes s² unbiased).</p>
  <p><strong>2. Standard errors.</strong> The covariance matrix of the estimates is Cov(ŵ) = s²(XᵀX)⁻¹. From section 04, the diagonal of (XᵀX)⁻¹ is 796/420 = 1.8952 and 6/420 = 0.014286, so the variances are 8.5 × 1.8952 = 16.110 and 8.5 × 0.014286 = 0.12143. The square roots are the standard errors:</p>
  <ul>
    <li>se(b) = √16.110 = <strong>4.014</strong> (also = s·√(1/n + x̄²/S_xx) = 2.916·√(0.1667 + 121/70))</li>
    <li>se(w) = √0.12143 = <strong>0.348</strong> (also = s / √S_xx = 2.916 / √70)</li>
  </ul>
  <p>A standard error is the typical amount the estimate would change if we collected a fresh sample of six houses. se(w) shrinks with more rows, more spread in x (bigger S_xx) and less noise (smaller s). The intercept's SE is 11 times larger because x = 0 is so far from the data (x̄²/S_xx = 121/70).</p>
  <p><strong>3. t-statistic</strong> = coef / se: t(w) = 7 / 0.3485 = <strong>20.09</strong>; t(b) = −16 / 4.014 = <strong>−3.99</strong>. "How many standard errors away from zero is the estimate?"</p>
  <p><strong>4. P&gt;|t|</strong>: if the true coefficient were 0, the chance of a t at least this far from 0, using a t-distribution with 4 degrees of freedom. 0.00004 for the slope (printed as 0.000), 0.016 for the intercept. Both below 0.05. See <a class="xref" data-note="st_hypothesis">Hypothesis Testing</a> for what a p-value is and is not.</p>
  <p><strong>5. 95% confidence interval</strong> = coef ± t₀.₉₇₅,₄ × se. With 4 degrees of freedom t₀.₉₇₅ = 2.776 (wider than the normal 1.96 because n is tiny). Slope: 7 ± 2.776 × 0.3485 = 7 ± 0.967 = <strong>[6.03, 7.97]</strong>. Intercept: −16 ± 11.14 = <strong>[−27.14, −4.86]</strong>.</p>
  <div class="fx" data-lang="py">from scipy import stats
n, p = 6, 2                                    # rows, fitted parameters (b and w)
sse = (res ** 2).sum(); sxx = (dx ** 2).sum()
s2 = sse / (n - p)                             # estimated error variance sigma-hat^2
se_w = np.sqrt(s2 / sxx)
se_b = np.sqrt(s2 * (1 / n + x.mean() ** 2 / sxx))
t_w, t_b = 7 / se_w, -16 / se_b
p_w = 2 * stats.t.sf(abs(t_w), df=n - p)       # two-sided p-value
p_b = 2 * stats.t.sf(abs(t_b), df=n - p)
tcrit = stats.t.ppf(0.975, df=n - p)
print(f"s^2={s2:.3f}  s={np.sqrt(s2):.4f}  t_crit(0.975, df=4)={tcrit:.3f}")
print(f"w: se={se_w:.4f}  t={t_w:.3f}  p={p_w:.2e}  CI=[{7 - tcrit*se_w:.3f}, {7 + tcrit*se_w:.3f}]")
print(f"b: se={se_b:.4f}  t={t_b:.3f}  p={p_b:.4f}  CI=[{-16 - tcrit*se_b:.3f}, {-16 + tcrit*se_b:.3f}]")
sst = (dy ** 2).sum(); ssr = sst - sse
F = (ssr / (p - 1)) / (sse / (n - p))
print(f"SST={sst:.1f} SSR={ssr:.1f} SSE={sse:.1f}  R2={1 - sse/sst:.4f}  adjR2={1 - (sse/sst) * (n - 1)/(n - p):.4f}")
print(f"F={F:.2f} (= t_w^2 = {t_w**2:.2f})  Prob(F)={stats.f.sf(F, p - 1, n - p):.2e}")
ll = -n / 2 * (np.log(2 * np.pi) + np.log(sse / n) + 1)
print(f"log-likelihood={ll:.4f}  AIC={-2*ll + 2*p:.3f}  BIC={-2*ll + p*np.log(n):.3f}")</div>
  <div class="fx" data-lang="text">s^2=8.500  s=2.9155  t_crit(0.975, df=4)=2.776
w: se=0.3485  t=20.088  p=3.62e-05  CI=[6.033, 7.967]
b: se=4.0137  t=-3.986  p=0.0163  CI=[-27.144, -4.856]
SST=3464.0 SSR=3430.0 SSE=34.0  R2=0.9902  adjR2=0.9877
F=403.53 (= t_w^2 = 403.53)  Prob(F)=3.62e-05
log-likelihood=-13.7174  AIC=31.435  BIC=31.018</div>
  <p>Every number matches the summary. The <code>stats.t</code> calls replace the printed t-table you would use in an exam.</p>
  <h3>The bottom block: residual checks</h3>
  <table class="tbl">
    <tr><th>Line</th><th>Here</th><th>Meaning (details in <a class="xref" data-note="ml_reg_diag">Diagnostics</a>)</th></tr>
    <tr><td>Omnibus / Prob(Omnibus)</td><td>nan</td><td>a normality test of residuals that needs at least 8 rows</td></tr>
    <tr><td>Skew</td><td>0.445</td><td>asymmetry of residuals (0 for normal); F's +4 makes a slightly longer right tail</td></tr>
    <tr><td>Kurtosis</td><td>1.920</td><td>tail heaviness (3 for normal); below 3 = light tails</td></tr>
    <tr><td>Jarque–Bera / Prob(JB)</td><td>0.489 / 0.783</td><td>JB = (n/6)(skew² + (kurt − 3)²/4) = 1 × (0.198 + 0.292) = 0.489; p = 0.78, no evidence against normality (with 6 rows there could hardly be)</td></tr>
    <tr><td>Durbin–Watson</td><td>1.647</td><td>Σ(eₜ − eₜ₋₁)² / Σe² = (4 + 1 + 1 + 1 + 49)/34 = 56/34; near 2 = no autocorrelation between neighbouring rows</td></tr>
    <tr><td>Cond. No.</td><td>39.1</td><td>√(largest/smallest eigenvalue of XᵀX) = √(801.5/0.524); driven by size not being centred. Large values (&gt; 30 on standardised data, or the summary's warning) flag multicollinearity</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>Under the classic assumptions, <strong>Cov(ŵ) = σ²(XᵀX)⁻¹</strong>, estimated with s² = SSE/(n − p). <strong>se(ŵⱼ)</strong> = √[s²(XᵀX)⁻¹]ⱼⱼ; <strong>t = ŵⱼ / se</strong> follows a t-distribution with n − p degrees of freedom when the true wⱼ = 0 and errors are normal; <strong>CI = ŵⱼ ± t_{1−α/2, n−p} · se</strong>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>These standard errors are only right if the errors are independent with constant variance and the line is the right shape. Our residuals bend, so s² = 8.5 partly measures curvature, not noise. A fan-shaped residual plot or time-ordered data can also make the p-values far too small. "p = 0.016" does not mean "98.4% chance the effect is real", and with large n tiny useless effects become "significant". Always read the size of the coefficient and its interval, not just the star.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Categorical predictors.</b> All our features have been numbers. Locality (Old town, Suburb, Metro) is text. How does a weighted sum use it?</div>

  <h2 id="lr-cat"><span class="num">10</span>Categorical Predictors &amp; Dummy Variables</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The dealer insists location matters. Locality is a word, not a number; a weight cannot multiply "Old town". How do we put a category into a weighted sum, and what does its coefficient mean?</p>
  </div>
  <h3>The need</h3>
  <p>Coding Old town = 1, Suburb = 2, Metro = 3 would force Metro's effect to be exactly "Suburb's effect plus the same step again", an order and spacing that do not exist. The fix: one 0/1 <strong>dummy</strong> column per category, minus one.</p>
  <h3>By hand: the six houses by locality</h3>
  <table class="tbl">
    <tr><th>House</th><th>Locality</th><th>Price</th><th>is_OldTown</th><th>is_Suburb</th></tr>
    <tr><td>A</td><td>Old town</td><td>28</td><td>1</td><td>0</td></tr>
    <tr><td>B</td><td>Suburb</td><td>40</td><td>0</td><td>1</td></tr>
    <tr><td>C</td><td>Metro</td><td>53</td><td>0</td><td>0</td></tr>
    <tr><td>D</td><td>Old town</td><td>66</td><td>1</td><td>0</td></tr>
    <tr><td>E</td><td>Suburb</td><td>79</td><td>0</td><td>1</td></tr>
    <tr><td>F</td><td>Metro</td><td>100</td><td>0</td><td>0</td></tr>
  </table>
  <p>Model: price = b + w_O·is_OldTown + w_S·is_Suburb. Metro (both dummies 0) is the <strong>reference category</strong>. Each locality's prediction is one number, so least squares makes it that locality's mean:</p>
  <ul>
    <li>Metro: ŷ = b → b = mean(53, 100) = <strong>76.5</strong></li>
    <li>Old town: ŷ = b + w_O = mean(28, 66) = 47 → w_O = <strong>−29.5</strong></li>
    <li>Suburb: ŷ = b + w_S = mean(40, 79) = 59.5 → w_S = <strong>−17</strong></li>
  </ul>
  <p>Reading: "an Old town flat sells for 29.5 lakh less than a Metro flat; a Suburb flat for 17 lakh less". Every dummy coefficient is a difference <em>from the reference</em>.</p>
  <div class="fx" data-lang="py">print(houses.groupby("locality")["price"].mean())
D = pd.get_dummies(houses["locality"], drop_first=True, dtype=float)   # "Metro" becomes the reference
print(D.assign(price=houses["price"]))
m = LinearRegression().fit(D, houses["price"])
print("intercept:", round(m.intercept_, 3), " coefs:", {k: round(float(v), 3) for k, v in zip(D.columns, m.coef_)})</div>
  <div class="fx" data-lang="text">locality
Metro       76.5
Old town    47.0
Suburb      59.5
Name: price, dtype: float64
   Old town  Suburb  price
0       1.0     0.0     28
1       0.0     1.0     40
2       0.0     0.0     53
3       1.0     0.0     66
4       0.0     1.0     79
5       0.0     0.0    100
intercept: 76.5  coefs: {'Old town': -29.5, 'Suburb': -17.0}</div>
  <p><code>pd.get_dummies(..., drop_first=True)</code> drops the first category alphabetically (Metro) to make it the reference. The coefficients are the hand values.</p>
  <h3>The dummy-variable trap</h3>
  <p>Why drop one? If we keep all three dummies plus the intercept, is_Metro + is_OldTown + is_Suburb = 1 on every row, which is exactly the intercept column. One column is a sum of others (perfect multicollinearity), XᵀX has determinant 0, and there are infinitely many equally good weight vectors.</p>
  <div class="fx" data-lang="py">import statsmodels.formula.api as smf
D_all = pd.get_dummies(houses["locality"], dtype=float)         # all 3 dummies, no drop
X_trap = np.c_[np.ones(6), D_all]                               # intercept + Metro + Old town + Suburb
print("columns: 1,", ", ".join(D_all.columns), "-&gt; their sum =", D_all.sum(axis=1).tolist())
print("rank of X:", np.linalg.matrix_rank(X_trap), "of", X_trap.shape[1], " det(X^T X):", round(np.linalg.det(X_trap.T @ X_trap), 6) + 0.0)
for shift in [0, 20]:                                           # two DIFFERENT weight vectors ...
    wv = np.array([76.5 - shift, 0 + shift, -29.5 + shift, -17 + shift])
    print(f"weights {wv.tolist()}  predictions {(X_trap @ wv).tolist()}")   # ... same predictions
both = smf.ols("price ~ size + C(locality)", data=houses).fit()   # size AND locality
print("with size:", both.params.round(3).to_dict())</div>
  <div class="fx" data-lang="text">columns: 1, Metro, Old town, Suburb -&gt; their sum = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
rank of X: 3 of 4  det(X^T X): 0.0
weights [76.5, 0.0, -29.5, -17.0]  predictions [47.0, 59.5, 76.5, 47.0, 59.5, 76.5]
weights [56.5, 20.0, -9.5, 3.0]  predictions [47.0, 59.5, 76.5, 47.0, 59.5, 76.5]
with size: {'Intercept': -13.056, 'C(locality)[T.Old town]': -1.944, 'C(locality)[T.Suburb]': -3.222, 'size': 6.889}</div>
  <p>The design matrix has 4 columns but rank 3. Two very different weight vectors, [76.5, 0, −29.5, −17] and [56.5, 20, −9.5, 3], give identical predictions: you can move any amount between the intercept and all three dummies. Predictions are fine; the coefficients mean nothing. sklearn would silently return one of them, so drop one category (or drop the intercept, or use ridge).</p>
  <p>The last line of the output is the more important lesson. With <strong>size in the model too</strong>, the Old town gap shrinks from −29.5 to −1.9 and Suburb from −17 to −3.2. The Metro flats in this table happen to be the biggest on average (C and F average 1,300 sq ft, Suburb 1,100, Old town only 900), so "Metro" was mostly standing in for size: the omitted-variable formula of section 07 again. (With six houses and four parameters, these numbers are very uncertain; the point is the direction.)</p>
  <h3>With other features: statsmodels formulas, at scale</h3>
  <p>In a formula, <code>C(city)</code> creates the dummies and picks a reference automatically. The same idea at scale, on the 300 simulated flats of section 07:</p>
  <div class="fx" data-lang="py">import statsmodels.formula.api as smf
full = smf.ols("rent ~ size + metro + age + C(city)", data=df).fit()
print(full.summary().tables[1])
print(f"R2={full.rsquared:.3f}  adjR2={full.rsquared_adj:.3f}  resid std={np.sqrt(full.scale):.2f}")</div>
  <div class="fx" data-lang="text">=====================================================================================
                        coef    std err          t      P&gt;|t|      [0.025      0.975]
-------------------------------------------------------------------------------------
Intercept             4.3287      0.750      5.769      0.000       2.852       5.805
C(city)[T.Mumbai]     7.7519      0.418     18.541      0.000       6.929       8.575
C(city)[T.Pune]      -2.7021      0.418     -6.465      0.000      -3.525      -1.879
size                  0.0206      0.000     41.811      0.000       0.020       0.022
metro                -1.5513      0.106    -14.618      0.000      -1.760      -1.342
age                  -0.0899      0.020     -4.403      0.000      -0.130      -0.050
=====================================================================================
R2=0.894  adjR2=0.893  resid std=2.95</div>
  <p>Read the rows: <code>C(city)[T.Mumbai]</code> = 7.75 means "Mumbai rents about ₹7,750 more than Delhi for the same size, metro distance and age" (true value 8); <code>T.Pune</code> −2.70 (true −3). The numeric slopes are close to the truth too (0.0206 vs 0.02, −1.55 vs −1.5, −0.090 vs −0.1), and adding city raised R² to 0.894 with a residual SD of 2.95, close to the true noise of 3.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Dummy (one-hot) coding with a reference:</strong> a categorical feature with k levels becomes k − 1 indicator columns. Each coefficient is the difference in mean outcome between that level and the reference level, holding other features fixed. Interactions such as <code>size:C(locality)</code> let the slope differ by locality (see <a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>(1) The coefficients depend on which level is the reference; change it and every dummy coefficient changes (predictions do not). (2) A category seen only in test data breaks the encoder; use <code>OneHotEncoder(handle_unknown="ignore")</code>. (3) Hundreds of levels (pin codes) make hundreds of columns; consider target encoding (<a class="xref" data-note="ml_features">Feature Engineering</a>) or regularisation.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Prediction intervals.</b> We can predict a number for a new flat. How wide should the band around that number be?</div>

  <h2 id="lr-pi"><span class="num">11</span>Prediction Intervals (Brief)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The family's 1,300 sq ft flat gets ŷ = −16 + 7 × 13 = 75 lakh. Section 09 told us how uncertain the slope is, but the family needs something else: a believable price range for this one flat. How wide is it, and why is it not the confidence interval?</p>
  </div>
  <h3>Two different questions</h3>
  <ol>
    <li><strong>Confidence interval for the mean:</strong> "What is the average price of <em>all</em> 1,300 sq ft flats in this market?" Uncertainty comes only from not knowing the true line.</li>
    <li><strong>Prediction interval:</strong> "What will <em>this one</em> 1,300 sq ft flat sell for?" Uncertainty about the line <em>plus</em> that flat's own noise ε.</li>
  </ol>
  <p>Formulas for one feature at a new point x₀:</p>
  <ul>
    <li>se_mean = s · √(1/n + (x₀ − x̄)²/S_xx)</li>
    <li>se_pred = s · √(1 + 1/n + (x₀ − x̄)²/S_xx) (the extra "1" is the new flat's noise)</li>
    <li>interval = ŷ₀ ± t_{0.975, n−p} · se</li>
  </ul>
  <p><strong>By hand at x₀ = 13:</strong> ŷ₀ = 75. (x₀ − x̄)²/S_xx = 4/70 = 0.0571. se_mean = 2.916·√(0.1667 + 0.0571) = 2.916 × 0.4731 = 1.379. se_pred = 2.916·√(1.2238) = 2.916 × 1.1062 = 3.225. With t = 2.776: CI = 75 ± 3.83 = <strong>[71.17, 78.83]</strong>; PI = 75 ± 8.95 = <strong>[66.05, 83.95]</strong>.</p>
  <div class="fx" data-lang="py">x0 = 13.0                                                  # a 1,300 sq ft house
yhat0 = -16 + 7 * x0
s = np.sqrt(s2)
se_mean = s * np.sqrt(1 / n + (x0 - x.mean()) ** 2 / sxx)  # uncertainty of the LINE at x0
se_pred = s * np.sqrt(1 + 1 / n + (x0 - x.mean()) ** 2 / sxx)  # + one house's own noise
print(f"yhat={yhat0:.2f}  se_mean={se_mean:.4f}  se_pred={se_pred:.4f}")
print(f"95% CI for the mean : [{yhat0 - tcrit*se_mean:.3f}, {yhat0 + tcrit*se_mean:.3f}]")
print(f"95% prediction int. : [{yhat0 - tcrit*se_pred:.3f}, {yhat0 + tcrit*se_pred:.3f}]")
frame = ols.get_prediction(np.array([[1.0, x0]])).summary_frame(alpha=0.05)
print(frame.round(3).to_string(index=False))</div>
  <div class="fx" data-lang="text">yhat=75.00  se_mean=1.3793  se_pred=3.2253
95% CI for the mean : [71.171, 78.829]
95% prediction int. : [66.045, 83.955]
 mean  mean_se  mean_ci_lower  mean_ci_upper  obs_ci_lower  obs_ci_upper
 75.0    1.379         71.171         78.829        66.045        83.955</div>
  <p><code>get_prediction</code> returns both: <code>mean_ci_*</code> is the confidence interval, <code>obs_ci_*</code> the prediction interval. With only six houses, the family should expect anything from about 66 to 84 lakh. The same idea at scale: with 300 flats the line is known precisely (mean_se 0.38), but individual flats still vary:</p>
  <div class="fx" data-lang="py">pf = full.get_prediction(pd.DataFrame({"size": [1000], "metro": [1.0], "age": [10], "city": ["Pune"]}))
print(pf.summary_frame(alpha=0.05).round(2).to_string(index=False))</div>
  <div class="fx" data-lang="text"> mean  mean_se  mean_ci_lower  mean_ci_upper  obs_ci_lower  obs_ci_upper
 19.8     0.38          19.04          20.55         13.94         25.65</div>
  <p>The CI for the average 1000 sq ft Pune flat is narrow (19.0 to 20.6) while the PI for one such flat is wide (13.9 to 25.7). More data shrinks the CI toward 0 width; the PI can never be narrower than about ±1.96 × noise SD (±5.8 here), however much data you collect.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A 95% <strong>prediction interval</strong> is a range that, under the model's assumptions (including normal, constant-variance errors), contains a <em>new observation</em> 95% of the time. It is always wider than the confidence interval for the mean at the same x₀. Both widen as x₀ moves away from x̄.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reporting the confidence interval when the family asked "how much will our flat sell for?" understates the risk badly (±3.8 vs ±9.0 lakh above). Prediction intervals also rely on normal, constant-variance errors far more than coefficient tests do; check with <a class="xref" data-note="ml_reg_diag">Diagnostics</a>, or use quantile regression / conformal prediction when they fail.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: scikit-learn in practice.</b> statsmodels is for inference. For a prediction pipeline (train/test split, encoders, deployment) the everyday tool is scikit-learn.</div>

  <h2 id="lr-sk"><span class="num">12</span>scikit-learn in Practice</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Six houses fit in our head; a real pricing system has thousands of rows, text columns and a test set that must stay unseen. How is the same model run in an everyday prediction pipeline?</p>
  </div>
  <h3>LinearRegression: what it has</h3>
  <table class="tbl">
    <tr><th>Item</th><th>Meaning</th></tr>
    <tr><td><code>fit_intercept=True</code></td><td>learn b. Set False only if the data are already centred or a column of 1s is in X.</td></tr>
    <tr><td><code>positive=False</code></td><td>True forces every coefficient ≥ 0 (non-negative least squares), e.g. for mixing proportions.</td></tr>
    <tr><td><code>copy_X</code>, <code>n_jobs</code></td><td>memory and parallelism details; results are identical.</td></tr>
    <tr><td><code>coef_</code>, <code>intercept_</code></td><td>the weights and b (on our houses: [7.0] and −16.0).</td></tr>
    <tr><td><code>rank_</code>, <code>singular_</code></td><td>rank of X and its singular values: a rank below the number of columns means a redundant column; a tiny last singular value means near-collinearity.</td></tr>
    <tr><td><code>score(X, y)</code></td><td>R² on the given data.</td></tr>
  </table>
  <p>No p-values, no standard errors: sklearn is built for prediction. For inference use statsmodels. For ridge/lasso use <code>Ridge</code>, <code>Lasso</code> (<a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a>); for very large data <code>SGDRegressor</code>.</p>
  <h3>End to end on the rent data (the same idea at scale)</h3>
  <p>Six houses are too few to split into train and test, so this section uses the 300 simulated flats. The plan: split 75/25 before anything else; fit numbers only; then add the city with a <code>OneHotEncoder(drop="first")</code> inside a <code>ColumnTransformer</code> so the encoder is learnt from the training rows only (<a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>); compare test scores; predict a new flat.</p>
  <div class="fx" data-lang="py">from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import make_pipeline
num = ["size", "metro", "age"]
train, test = train_test_split(df, test_size=0.25, random_state=0)

lin = LinearRegression().fit(train[num], train["rent"])          # numbers only
print("intercept_:", round(lin.intercept_, 3))
print("coef_     :", {k: round(float(v), 4) for k, v in zip(num, lin.coef_)})
print("rank_:", lin.rank_, "  singular_:", lin.singular_.round(1))

prep = ColumnTransformer([("city", OneHotEncoder(drop="first"), ["city"])],
                         remainder="passthrough")                 # dummies + numeric columns
pipe = make_pipeline(prep, LinearRegression()).fit(train[num + ["city"]], train["rent"])
print("features:", list(pipe[0].get_feature_names_out()))
print("coefs   :", pipe[-1].coef_.round(4))
for name, model, cols in [("numbers only", lin, num), ("with city", pipe, num + ["city"])]:
    p = model.predict(test[cols])
    print(f"{name:13s} test R2 {r2_score(test['rent'], p):.3f}  RMSE {mean_squared_error(test['rent'], p) ** 0.5:.2f}")
new = pd.DataFrame({"size": [1000], "metro": [1.0], "age": [10], "city": ["Pune"]})
print("predict a 1000 sq ft Pune flat, 1 km, 10 yrs:", pipe.predict(new).round(2))</div>
  <div class="fx" data-lang="text">intercept_: 6.657
coef_     : {'size': 0.0195, 'metro': -1.716, 'age': -0.0234}
rank_: 3   singular_: [5230.8  127.4   24.2]
features: ['city__city_Mumbai', 'city__city_Pune', 'remainder__size', 'remainder__metro', 'remainder__age']
coefs   : [ 8.1419 -2.6899  0.0206 -1.6357 -0.0975]
numbers only  test R2 0.672  RMSE 5.06
with city     test R2 0.884  RMSE 3.01
predict a 1000 sq ft Pune flat, 1 km, 10 yrs: [19.96]</div>
  <p>Numbers only: test R² 0.672, RMSE 5.06. Adding the city dummies: R² 0.884, RMSE 3.01 (close to the noise floor of 3). The city coefficients (8.14 and −2.69) and numeric slopes match the statsmodels fit and the truth closely. <code>rank_</code> 3 with three healthy singular values says no column is redundant (the first singular value is large only because size is in sq ft, with values in the hundreds). The new 1000 sq ft Pune flat: 19.96, close to the statsmodels mean of 19.8 (which was fitted on all 300 flats).</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>When using <code>remainder="passthrough"</code>, pass only the feature columns. Passing the whole DataFrame would pass the target <code>rent</code> through as a feature: a perfect, useless model (test R² 1.0) and a classic leak.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: From scratch.</b> Libraries hide the mechanics. Writing the model ourselves and matching sklearn proves we understand every line.</div>

  <h2 id="lr-scratch"><span class="num">13</span>From Scratch, Matching scikit-learn</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We have derived three ways to get the weights. Do they really give the same answer as the library, on our houses and on a real 10-feature dataset, and how much code does it take?</p>
  </div>
  <p>The class below has three solvers. <code>normal</code> solves XᵀXw = Xᵀy (section 04). <code>lstsq</code> uses the SVD. <code>gd</code> runs batch gradient descent (section 06) on standardised features, then converts the weights back to original units: if z = (x − μ)/σ, then w_x = w_z / σ and b = b_z − Σ μⱼ w_xⱼ. The test is sklearn's diabetes data (442 patients, 10 features, target = disease progression after one year), and then our six houses.</p>
  <div class="fx" data-lang="py">from sklearn.datasets import load_diabetes

class MyLinearRegression:
    """Ordinary least squares, three ways: normal equation, lstsq (SVD), gradient descent."""
    def __init__(self, method="lstsq", lr=0.1, n_iter=20000):
        self.method, self.lr, self.n_iter = method, lr, n_iter

    def fit(self, X, y):
        X, y = np.asarray(X, float), np.asarray(y, float)
        Xb = np.c_[np.ones(len(X)), X]                       # prepend the 1s column
        if self.method == "normal":
            w = np.linalg.solve(Xb.T @ Xb, Xb.T @ y)          # (X^T X) w = X^T y
        elif self.method == "lstsq":
            w = np.linalg.lstsq(Xb, y, rcond=None)[0]         # SVD, safest
        else:                                                 # batch gradient descent on MSE
            mu, sd = X.mean(0), X.std(0)                      # GD needs scaled features
            Zb = np.c_[np.ones(len(X)), (X - mu) / sd]
            w = np.zeros(Zb.shape[1])
            for _ in range(self.n_iter):
                w -= self.lr * (2 / len(y)) * Zb.T @ (Zb @ w - y)
            w[1:] = w[1:] / sd                                # undo the scaling
            w[0] = w[0] - mu @ w[1:]
        self.intercept_, self.coef_ = w[0], w[1:]
        return self

    def predict(self, X):
        return np.asarray(X, float) @ self.coef_ + self.intercept_

    def score(self, X, y):                                    # R^2, like sklearn
        r = y - self.predict(X)
        return 1 - (r @ r) / ((y - y.mean()) @ (y - y.mean()))

Xd, yd = load_diabetes(return_X_y=True)                       # 442 patients, 10 features
ref = LinearRegression().fit(Xd, yd)
for method in ["normal", "lstsq", "gd"]:
    mine = MyLinearRegression(method).fit(Xd, yd)
    gap = np.abs(mine.coef_ - ref.coef_).max()
    print(f"{method:6s} intercept {mine.intercept_:.3f}  max |coef - sklearn| = {gap:.2e}  R2 {mine.score(Xd, yd):.4f}")
print("sklearn intercept", round(ref.intercept_, 3), " R2", round(ref.score(Xd, yd), 4))
for method in ["normal", "lstsq", "gd"]:                      # and on our 6 houses
    mh = MyLinearRegression(method).fit(houses[["size"]], y)
    print(f"houses, {method:6s}: intercept {mh.intercept_:.6f}  slope {mh.coef_[0]:.6f}")</div>
  <div class="fx" data-lang="text">normal intercept 152.133  max |coef - sklearn| = 1.59e-12  R2 0.5177
lstsq  intercept 152.133  max |coef - sklearn| = 1.48e-12  R2 0.5177
gd     intercept 152.133  max |coef - sklearn| = 3.81e-11  R2 0.5177
sklearn intercept 152.133  R2 0.5177
houses, normal: intercept -16.000000  slope 7.000000
houses, lstsq : intercept -16.000000  slope 7.000000
houses, gd    : intercept -16.000000  slope 7.000000</div>
  <p>All three agree with sklearn to about 10⁻¹¹ (floating-point noise), and on the houses all three return −16 and 7. The scaling inside <code>gd</code> is not decoration: in the diabetes data every feature has a standard deviation of about 0.048, so without scaling the gradient steps are tiny. In a run without the two scaling lines, 20,000 steps at η = 0.1 still left coefficients wrong by up to 705 and R² at 0.5145 instead of 0.5177. It is the raw-size problem of section 06 again.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>The whole of linear regression fits in about 15 lines: add a 1s column, solve one linear system, and compute R² as 1 − SSE/SST. Everything else in this group (diagnostics, polynomial features, penalties) changes what goes into X or adds one term to the loss.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How it all connects.</b> We have met a dozen ideas: residuals, SSE, the slope formula, the normal equation, projection, GD, R², s², SE, t, CI, dummies, PI. How do they hang together?</div>

  <h2 id="lr-connect"><span class="num">14</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Residuals, SSE, S_xy/S_xx, the normal equation, projection, gradient descent, R², s², standard errors, t, confidence and prediction intervals, dummies: separate facts to memorise, or one system grown from a single quantity?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 370" width="680">
<defs><marker id="lr-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="150" height="44" rx="7" class="fb sb"/><text x="85" y="29" text-anchor="middle" font-size="11.5" font-weight="700">X with a 1s column</text><text x="85" y="45" text-anchor="middle" class="tm" font-size="10">6 houses × [1, size]</text>
<line x1="160" y1="32" x2="188" y2="32" stroke="currentColor" marker-end="url(#lr-a9)"/>
<rect x="190" y="10" width="150" height="44" rx="7" class="fb sb"/><text x="265" y="29" text-anchor="middle" font-size="11.5" font-weight="700">residual e = y − Xw</text><text x="265" y="45" text-anchor="middle" class="tm" font-size="10">vertical miss per house</text>
<line x1="340" y1="32" x2="368" y2="32" stroke="currentColor" marker-end="url(#lr-a9)"/>
<rect x="370" y="10" width="130" height="44" rx="7" class="fb sb"/><text x="435" y="29" text-anchor="middle" font-size="11.5" font-weight="700">SSE = Σe²</text><text x="435" y="45" text-anchor="middle" class="tm" font-size="10">34 at the best line</text>
<line x1="500" y1="32" x2="528" y2="32" stroke="currentColor" marker-end="url(#lr-a9)"/>
<rect x="530" y="10" width="140" height="44" rx="7" class="fb sb"/><text x="600" y="29" text-anchor="middle" font-size="11.5" font-weight="700">SST = SSR + SSE</text><text x="600" y="45" text-anchor="middle" class="tm" font-size="10">3464 = 3430 + 34</text>
<line x1="410" y1="54" x2="120" y2="88" stroke="currentColor" marker-end="url(#lr-a9)"/><line x1="435" y1="54" x2="340" y2="88" stroke="currentColor" marker-end="url(#lr-a9)"/><line x1="460" y1="54" x2="560" y2="88" stroke="currentColor" marker-end="url(#lr-a9)"/>
<text x="20" y="76" class="tm" font-size="10">minimise SSE, three ways:</text>
<rect x="20" y="90" width="200" height="44" rx="7" class="ft st"/><text x="120" y="109" text-anchor="middle" font-size="11.5" font-weight="700">calculus: w = S_xy / S_xx</text><text x="120" y="125" text-anchor="middle" class="tm" font-size="10">490 / 70 = 7, b = ȳ − w·x̄</text>
<rect x="240" y="90" width="200" height="44" rx="7" class="ft st"/><text x="340" y="109" text-anchor="middle" font-size="11.5" font-weight="700">normal eq. XᵀXw = Xᵀy</text><text x="340" y="125" text-anchor="middle" class="tm" font-size="10">= projection, Xᵀe = 0</text>
<rect x="460" y="90" width="200" height="44" rx="7" class="ft st"/><text x="560" y="109" text-anchor="middle" font-size="11.5" font-weight="700">gradient descent</text><text x="560" y="125" text-anchor="middle" class="tm" font-size="10">200 steps on centred size</text>
<line x1="120" y1="134" x2="300" y2="168" stroke="currentColor" marker-end="url(#lr-a9)"/><line x1="340" y1="134" x2="340" y2="168" stroke="currentColor" marker-end="url(#lr-a9)"/><line x1="560" y1="134" x2="380" y2="168" stroke="currentColor" marker-end="url(#lr-a9)"/>
<rect x="250" y="170" width="180" height="44" rx="7" class="fg sg" stroke-width="2"/><text x="340" y="189" text-anchor="middle" font-size="12" font-weight="700">ŵ: b = −16, w = 7</text><text x="340" y="205" text-anchor="middle" class="tm" font-size="10">same answer every way</text>
<line x1="270" y1="214" x2="120" y2="248" stroke="currentColor" marker-end="url(#lr-a9)"/><line x1="340" y1="214" x2="340" y2="248" stroke="currentColor" marker-end="url(#lr-a9)"/><line x1="410" y1="214" x2="560" y2="248" stroke="currentColor" marker-end="url(#lr-a9)"/>
<path d="M600 54 C 660 120, 500 200, 420 248" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#lr-a9)"/>
<rect x="10" y="250" width="220" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="120" y="269" text-anchor="middle" font-size="11.5" font-weight="700">interpretation</text><text x="120" y="285" text-anchor="middle" class="tm" font-size="10">+7 / 100 sq ft; 6.21 with rooms</text>
<rect x="240" y="250" width="200" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="340" y="269" text-anchor="middle" font-size="11.5" font-weight="700">R² = 1 − SSE/SST</text><text x="340" y="285" text-anchor="middle" class="tm" font-size="10">0.990; RMSE 2.38</text>
<rect x="450" y="250" width="220" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="560" y="269" text-anchor="middle" font-size="11.5" font-weight="700">s² = SSE/(n−p) → SE → t, CI</text><text x="560" y="285" text-anchor="middle" class="tm" font-size="10">8.5 → 0.348 → 20.1, [6.03, 7.97]</text>
<line x1="560" y1="294" x2="560" y2="318" stroke="currentColor" marker-end="url(#lr-a9)"/>
<rect x="450" y="320" width="220" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="560" y="337" text-anchor="middle" font-size="11.5" font-weight="700">prediction interval</text><text x="560" y="352" text-anchor="middle" class="tm" font-size="10">75 ± 9.0 at 1,300 sq ft</text>
<rect x="10" y="320" width="220" height="40" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.4"/><text x="120" y="337" text-anchor="middle" font-size="11.5" font-weight="700">dummies = new 0/1 columns</text><text x="120" y="352" text-anchor="middle" class="tm" font-size="10">feed back into X (k − 1 of them)</text>
<path d="M20 320 C 2 240, 2 120, 40 56" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#lr-a9)"/>
<rect x="240" y="320" width="200" height="40" rx="7" class="fr sr"/><text x="340" y="337" text-anchor="middle" font-size="11" font-weight="700">SE, CI, PI all assume</text><text x="340" y="352" text-anchor="middle" font-size="10">LINE errors → Diagnostics</text>
<line x1="448" y1="300" x2="420" y2="318" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#lr-a9)"/>
</svg><figcaption>Everything in this note grows out of one quantity: the residual e = y − Xw. Squared and summed it is SSE; minimised (by calculus, by the normal equation, or by gradient descent) it gives ŵ; compared with the lazy model's SST it gives R²; divided by n − p it gives s², the root of every standard error, t, CI and prediction interval. Dummies are just more columns of X.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the same six houses</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers</th><th>Our houses</th><th>Use when</th></tr>
    <tr><td>Residual e</td><td>y − ŷ</td><td>how badly does a line miss one house?</td><td>+2, 0, −1, −2, −3, +4</td><td>always; plot them</td></tr>
    <tr><td>SSE</td><td>Σe²</td><td>how badly does a line miss overall?</td><td>34 (guess −10 + 6.5x: 53)</td><td>the quantity OLS minimises</td></tr>
    <tr><td>Slope formula</td><td>∂SSE/∂b = ∂SSE/∂w = 0</td><td>best line, one feature?</td><td>w = 490/70 = 7, b = −16</td><td>hand work, one feature</td></tr>
    <tr><td>Normal equation</td><td>∇SSE = 0 in matrix form</td><td>best weights, many features?</td><td>[[6, 66], [66, 796]]w = [366, 4516]</td><td>d up to thousands, data in memory</td></tr>
    <tr><td>Projection / hat matrix</td><td>normal equation as geometry</td><td>why it works; leverage</td><td>Xᵀe = 0; h_A = h_F = 0.524</td><td>explaining; diagnostics</td></tr>
    <tr><td>Gradient descent</td><td>gradient of MSE</td><td>weights without a solve?</td><td>b → 61, w → 7 (centred)</td><td>huge or streaming data, other losses</td></tr>
    <tr><td>Partial coefficient</td><td>normal equation with 2+ columns</td><td>effect holding others fixed?</td><td>size 6.21, rooms 2.92</td><td>any multi-feature model</td></tr>
    <tr><td>Omitted-variable formula</td><td>w₁ + w₂·δ</td><td>why did the coefficient change?</td><td>6.21 + 2.92 × 0.271 = 7.0</td><td>explaining coefficient shifts</td></tr>
    <tr><td>R²</td><td>1 − SSE/SST</td><td>how much better than the mean?</td><td>0.990</td><td>comparing fits on the same y</td></tr>
    <tr><td>RMSE</td><td>√(SSE/n)</td><td>typical miss in y's units?</td><td>2.38 lakh</td><td>business-facing error size</td></tr>
    <tr><td>s², SE</td><td>SSE/(n − p), s²(XᵀX)⁻¹</td><td>how much would w wobble?</td><td>8.5; se(w) = 0.348</td><td>inference</td></tr>
    <tr><td>t, p, CI</td><td>coef / se, t-distribution</td><td>is it different from 0? plausible range?</td><td>t 20.1, p 0.00004, [6.03, 7.97]</td><td>reporting an effect</td></tr>
    <tr><td>Dummies</td><td>k − 1 indicator columns</td><td>how do categories enter?</td><td>Old town −29.5, Suburb −17 vs Metro</td><td>any categorical feature</td></tr>
    <tr><td>Prediction interval</td><td>s√(1 + 1/n + (x₀ − x̄)²/S_xx)</td><td>range for one new case?</td><td>75, [66.0, 84.0] at 1,300 sq ft</td><td>pricing one item</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>linear regression chooses the weights that make the residuals as small as possible in squared size, and every other number it prints is built from those same residuals.</strong> That is why the next note studies residuals: if their assumptions fail, every number in the right-hand column of the diagram is wrong, even though ŵ is computed the same way.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Strengths, limits &amp; comparisons.</b> Where does this model stand against its siblings and against trees, KNN and logistic regression?</div>

  <h2 id="lr-when"><span class="num">15</span>Strengths, Limits &amp; Comparisons</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know how linear regression works. When is it the right tool, and when should we reach for a sibling or a different family?</p>
  </div>
  <div class="cards">
    <div><b>Strengths</b><p>Fast exact solution; no hyperparameters; coefficients you can explain to a manager; standard errors and intervals; works well with few rows; extrapolates a trend (sometimes wisely, sometimes dangerously).</p><small>The default baseline for any numeric target</small></div>
    <div><b>Limits</b><p>Only additive, straight-line effects unless you engineer features; sensitive to outliers (squared loss); unstable with correlated features; needs encoding of categories; statistics need assumptions.</p><small>See the three sibling notes for fixes</small></div>
    <div><b>Use it when</b><p>You need interpretability or inference, have modest data, effects are roughly linear, or you want a baseline before trees and boosting.</p><small>Then check residuals</small></div>
  </div>
  <table class="tbl"><caption>Linear regression vs its siblings and other models</caption>
    <tr><th></th><th>Linear (OLS)</th><th>Polynomial / basis</th><th>Ridge / Lasso</th><th>Decision tree / GBM</th><th>KNN regression</th></tr>
    <tr><td>Shape it can fit</td><td>flat plane</td><td>smooth curves</td><td>flat plane</td><td>steps, interactions</td><td>any local shape</td></tr>
    <tr><td>Hyperparameters</td><td>none</td><td>degree / knots</td><td>α (and l1_ratio)</td><td>depth, learning rate, …</td><td>k, distance</td></tr>
    <tr><td>Many / correlated features</td><td>unstable</td><td>worse (more columns)</td><td>designed for it</td><td>fine</td><td>curse of dimensionality</td></tr>
    <tr><td>Scaling needed</td><td>no (yes for GD)</td><td>yes</td><td>yes</td><td>no</td><td>yes</td></tr>
    <tr><td>Interpretability</td><td>excellent</td><td>moderate</td><td>good (lasso selects)</td><td>tree: good; GBM: via SHAP</td><td>low</td></tr>
    <tr><td>p-values / intervals</td><td>yes (statsmodels)</td><td>yes</td><td>not standard</td><td>no</td><td>no</td></tr>
    <tr><td>Extrapolation</td><td>continues the line</td><td>explodes</td><td>continues the line</td><td>flat beyond data</td><td>flat beyond data</td></tr>
    <tr><td>Note</td><td>this one</td><td><a class="xref" data-note="ml_polyreg">Polynomial</a></td><td><a class="xref" data-note="ml_ridge_lasso">Ridge/Lasso</a></td><td><a class="xref" data-note="ml_dtree">Decision Trees</a>, <a class="xref" data-note="ml_gbm">GBM</a></td><td><a class="xref" data-note="ml_knn">KNN</a></td></tr>
  </table>
  <table class="tbl"><caption>Linear vs logistic regression</caption>
    <tr><th></th><th>Linear regression</th><th>Logistic regression</th></tr>
    <tr><td>Target</td><td>any real number</td><td>0/1 (or classes)</td></tr>
    <tr><td>Output</td><td>ŷ = Xw</td><td>p = sigmoid(Xw)</td></tr>
    <tr><td>Loss</td><td>squared error (Gaussian likelihood)</td><td>log-loss (Bernoulli likelihood)</td></tr>
    <tr><td>Closed form</td><td>yes</td><td>no: iterative solvers</td></tr>
    <tr><td>Coefficient reading</td><td>+w units of y</td><td>+w in log-odds (odds × e^w)</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: Common mistakes.</b> Knowing the tool is half the job; the other half is knowing the ways people misuse it.</div>

  <h2 id="lr-traps"><span class="num">16</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which errors with linear regression show up again and again in interviews and in production code, and how does each one look on our six houses?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: judging by training R²</span>
    <p>Training R² can only go up as columns are added. Report test or cross-validated scores; use adjusted R², AIC or BIC when comparing nested models on the same data.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reading coefficient size as importance</span>
    <p>7 lakh per 100 sq ft and 0.07 lakh per sq ft are the same model. Compare standardised coefficients, or better, permutation importance on test data.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting "holding the others fixed"</span>
    <p>Size was worth 7.0 lakh alone and 6.21 with bedrooms; Old town was −29.5 alone and −1.9 with size. A coefficient's meaning depends on which other columns are in the model; adding or dropping a correlated column changes it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: interpreting the intercept</span>
    <p>b = −16 is the "price of a 0 sq ft flat". Outside the data, the intercept is an anchor, not a fact. Centre the features if you want an interpretable intercept (61 for the average flat).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: all k dummies plus an intercept</span>
    <p>The dummy trap makes XᵀX singular (rank 3 of 4) and coefficients arbitrary. Drop one level, and remember the coefficients are differences from that reference.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: inverting XᵀX</span>
    <p>Use <code>lstsq</code>, <code>solve</code> or <code>LinearRegression</code>, never <code>inv</code>. With near-duplicate columns (size and rooms: determinant 24 out of 385), consider ridge.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: confidence interval instead of prediction interval</span>
    <p>For "what will this one flat sell for", use the prediction interval (±9.0 lakh), not the CI of the mean (±3.8).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: extrapolating</span>
    <p>The line prices a 4,000 sq ft villa (x = 40) at −16 + 280 = 264 lakh, from data on 600–1,600 sq ft, and it already under-prices the biggest flat we have (F: +4). The model only knows the range it saw.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: skipping the residual plot</span>
    <p>R² = 0.990 and yet the residuals run +2, 0, −1, −2, −3, +4: a curve. Plot residuals vs fitted values every time (<a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: "significant" = "important" or "causal"</span>
    <p>A p-value says the estimate is unlikely to be exactly 0 by luck under the assumptions. It says nothing about size, business value, or causation.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet.</b> Time to compress the whole note into one page you can revise from.</div>

  <h2 id="lr-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: six houses (size in hundreds of sq ft, bedrooms, locality, price in lakh ₹): A (6, 1, Old town, 28), B (8, 2, Suburb, 40), C (10, 2, Metro, 53), D (12, 3, Old town, 66), E (14, 3, Suburb, 79), F (16, 4, Metro, 100).</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>Answer on our houses</th><th>Weakness → next</th></tr>
    <tr><td>Model y = Xw + ε</td><td>how to predict a number?</td><td>price = b + w·size + noise</td><td>which b, w?</td></tr>
    <tr><td>Residuals, SSE</td><td>how to score a line?</td><td>guess −10 + 6.5x: SSE 53</td><td>infinitely many lines</td></tr>
    <tr><td>Least squares</td><td>best line?</td><td>w = 490/70 = 7, b = −16, SSE 34</td><td>one feature only</td></tr>
    <tr><td>Normal equation</td><td>many features?</td><td>size 6.21, rooms 2.92, b −14.58</td><td>why is it right?</td></tr>
    <tr><td>Geometry, BLUE, MLE</td><td>why this answer?</td><td>Xᵀe = 0; log L −13.72</td><td>needs a big solve</td></tr>
    <tr><td>Gradient descent</td><td>without a solve?</td><td>→ 61 and 7 on centred size</td><td>what do weights mean?</td></tr>
    <tr><td>Interpretation</td><td>what is 7?</td><td>+7 lakh / 100 sq ft; 7.0 = 6.21 + 2.92 × 0.271</td><td>good overall?</td></tr>
    <tr><td>R², RMSE</td><td>how good?</td><td>0.990; 2.38 lakh</td><td>luck with 6 houses?</td></tr>
    <tr><td>SE, t, p, CI</td><td>how sure?</td><td>se 0.348, t 20.1, [6.03, 7.97]</td><td>categories?</td></tr>
    <tr><td>Dummies</td><td>text columns?</td><td>Old town −29.5, Suburb −17 (vs Metro)</td><td>range for one house?</td></tr>
    <tr><td>Prediction interval</td><td>one new house?</td><td>1,300 sq ft: 75, PI [66.0, 84.0]</td><td>doing it in code</td></tr>
    <tr><td>sklearn, from scratch</td><td>in practice?</td><td>matches to 1e-12</td><td>are the assumptions true? → Diagnostics</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>Model</td><td>ŷ = b + Σⱼ wⱼxⱼ = Xw</td><td>X has a leading 1s column; w = [b, w₁, …]</td></tr>
    <tr><td>Residual, SSE</td><td>eᵢ = yᵢ − ŷᵢ; SSE = Σeᵢ²</td><td>i runs over the n rows</td></tr>
    <tr><td>One-feature OLS</td><td>w = S_xy/S_xx; b = ȳ − w·x̄</td><td>S_xy = Σ(x − x̄)(y − ȳ); S_xx = Σ(x − x̄)²</td></tr>
    <tr><td>Normal equation</td><td>XᵀXw = Xᵀy → w = (XᵀX)⁻¹Xᵀy</td><td>needs full column rank</td></tr>
    <tr><td>Hat matrix, leverage</td><td>H = X(XᵀX)⁻¹Xᵀ; hᵢ = 1/n + (xᵢ − x̄)²/S_xx</td><td>ŷ = Hy; Σhᵢ = p</td></tr>
    <tr><td>Gradient descent</td><td>w ← w − η·(2/n)Xᵀ(Xw − y)</td><td>η learning rate</td></tr>
    <tr><td>Omitted variable</td><td>short slope = w₁ + w₂·δ, δ = S₁₂/S₁₁</td><td>δ = slope of x₂ on x₁</td></tr>
    <tr><td>Fit</td><td>R² = 1 − SSE/SST; adj R² = 1 − (1 − R²)(n − 1)/(n − p); RMSE = √(SSE/n)</td><td>SST = Σ(y − ȳ)²; p = parameters incl. intercept</td></tr>
    <tr><td>Noise, SE</td><td>s² = SSE/(n − p); Cov(ŵ) = s²(XᵀX)⁻¹; se(w) = s/√S_xx</td><td>n − p = residual degrees of freedom</td></tr>
    <tr><td>Tests</td><td>t = ŵ/se; CI = ŵ ± t₁₋α/₂,ₙ₋ₚ·se; F = (SSR/(p − 1))/(SSE/(n − p))</td><td>one feature: F = t²</td></tr>
    <tr><td>Likelihood</td><td>log L = −(n/2)(log 2π + log(SSE/n) + 1); AIC = −2 log L + 2p; BIC = −2 log L + p ln n</td><td>Gaussian errors</td></tr>
    <tr><td>Intervals at x₀</td><td>se_mean = s√(1/n + (x₀ − x̄)²/S_xx); se_pred = s√(1 + 1/n + (x₀ − x̄)²/S_xx)</td><td>interval = ŷ₀ ± t·se</td></tr>
  </table>
  <h3>The running example's numbers</h3>
  <table class="tbl">
    <tr><th>Quantity</th><th>Value</th><th>Quantity</th><th>Value</th></tr>
    <tr><td>x̄, ȳ</td><td>11, 61</td><td>S_xy, S_xx, SST</td><td>490, 70, 3464</td></tr>
    <tr><td>line</td><td>ŷ = −16 + 7x</td><td>residuals</td><td>+2, 0, −1, −2, −3, +4</td></tr>
    <tr><td>SSE, SSR</td><td>34, 3430</td><td>R², adj R², RMSE, MAE</td><td>0.990, 0.988, 2.38, 2.0</td></tr>
    <tr><td>XᵀX, Xᵀy, det</td><td>[[6, 66], [66, 796]], [366, 4516], 420</td><td>size + rooms</td><td>−14.58 + 6.21·size + 2.92·rooms</td></tr>
    <tr><td>s², s</td><td>8.5, 2.92</td><td>se(w), se(b)</td><td>0.348, 4.01</td></tr>
    <tr><td>t(w), CI(w)</td><td>20.1, [6.03, 7.97]</td><td>F, log L, AIC</td><td>403.5, −13.72, 31.4</td></tr>
    <tr><td>dummies (ref Metro)</td><td>76.5, −29.5, −17</td><td>PI at 13</td><td>75 [66.0, 84.0]; CI [71.2, 78.8]</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Use OLS</b><p>A numeric target, roughly straight-line effects, a need to explain each coefficient or quote uncertainty, or a baseline before anything fancier.</p><small>Then check the residuals</small></div>
    <div><b>Avoid / extend</b><p>Curved effects (add x², splines), many or correlated columns (ridge, lasso), outliers (robust loss), complex interactions (trees, boosting).</p><small>The three sibling notes</small></div>
    <div><b>statsmodels vs sklearn</b><p>statsmodels for SEs, p-values, intervals and formulas; sklearn for pipelines, CV and deployment.</p><small>Same coefficients</small></div>
    <div><b>Closed form vs GD</b><p>Normal equation / SVD for data in memory; gradient descent for streaming data or other losses, with scaled features.</p><small>200 vs 20,000 steps here</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>High R² is not a straight-line proof; coefficient size is not importance; coefficients change when correlated columns enter or leave; the intercept outside the data means nothing; never use all k dummies with an intercept; never invert XᵀX; quote a prediction interval for single cases; never extrapolate; p-values are not effect sizes or causes.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Points (1, 2), (2, 4), (3, 5): slope and intercept?</td><td>S_xy = 3, S_xx = 2 → w = 1.5, b = 11/3 − 3 = 0.667</td></tr>
    <tr><td>SSE = 34, SST = 3464, n = 6, p = 2: R² and s²?</td><td>0.990 and 34/4 = 8.5</td></tr>
    <tr><td>Size alone 7.0; with rooms 6.21 and 2.92; δ = 19/70. Check the link.</td><td>6.21 + 2.92 × 0.271 = 7.0 (omitted-variable formula)</td></tr>
    <tr><td>Why is the prediction interval wider than the CI of the mean?</td><td>It adds the new case's own noise: the extra 1 under the square root</td></tr>
    <tr><td>A city with 4 levels plus an intercept: how many dummy columns?</td><td>3 (k − 1); 4 would make XᵀX singular</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: Questions &amp; answers.</b> Test yourself out loud before moving on to <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a>.</div>

  <h2 id="lr-qa"><span class="num">17</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you explain each idea without the page in front of you, and say why each one needs the one before it?</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the least-squares slope and intercept for one feature.</summary><div class="qa-body">SSE = Σ(yᵢ − wxᵢ − b)². ∂/∂b = −2Σ(yᵢ − wxᵢ − b) = 0 gives b = ȳ − wx̄. ∂/∂w = −2Σxᵢ(yᵢ − wxᵢ − b) = 0; substituting b and using Σ(xᵢ − x̄) = 0 gives w = Σ(xᵢ − x̄)(yᵢ − ȳ)/Σ(xᵢ − x̄)² = S_xy/S_xx = cov(x, y)/var(x). The second derivatives are positive, so it is a minimum. Houses: 490/70 = 7, b = 61 − 77 = −16.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Fit a line by hand to (1, 2), (2, 4), (3, 5).</summary><div class="qa-body">x̄ = 2, ȳ = 11/3. dx = −1, 0, 1; dy = −5/3, 1/3, 4/3. S_xy = 5/3 + 0 + 4/3 = 3, S_xx = 2, so w = 1.5 and b = 11/3 − 3 = 2/3 ≈ 0.667. Residuals: 2 − 2.167 = −0.167, 4 − 3.667 = 0.333, 5 − 5.167 = −0.167; they sum to 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the normal equation. When is the solution unique?</summary><div class="qa-body">SSE = ‖y − Xw‖² = yᵀy − 2wᵀXᵀy + wᵀXᵀXw; gradient −2Xᵀy + 2XᵀXw = 0 gives XᵀXw = Xᵀy, so w = (XᵀX)⁻¹Xᵀy. It is unique when X has full column rank (no column is a combination of others), which makes XᵀX invertible and the loss strictly convex. Duplicated columns or all k dummies with an intercept break this.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the geometry of OLS.</summary><div class="qa-body">ŷ = Xw lies in the column space of X; OLS picks the point closest to y, the orthogonal projection ŷ = Hy with H = X(XᵀX)⁻¹Xᵀ. The residual is perpendicular to every column (Xᵀe = 0), which is the normal equation. Pythagoras gives SST = SSR + SSE when there is an intercept: 3464 = 3430 + 34.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Normal equation or gradient descent: which and when?</summary><div class="qa-body">Closed form (via SVD/solve) is exact with no tuning, cost O(nd² + d³): best up to thousands of features and data in memory. Gradient descent costs O(nd) per pass, streams data, works for any differentiable loss, but needs a learning rate, iterations and scaled features (centred size: 200 steps; raw size: 20,000 and a 12× smaller step). sklearn: LinearRegression vs SGDRegressor.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Size is worth 7.0 alone but 6.21 when bedrooms are added. Explain.</summary><div class="qa-body">Coefficients are partial effects, holding the other columns fixed. Size and bedrooms are correlated (0.968). Alone, size absorbs bedrooms' effect: simple slope = w₁ + w₂·δ = 6.208 + 2.917 × (19/70) = 7.0, where δ is the slope of bedrooms on size. This is omitted-variable bias.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How are the standard errors in a regression summary computed?</summary><div class="qa-body">s² = SSE/(n − p) estimates the noise variance (dividing by n − p because p parameters were fitted). Cov(ŵ) = s²(XᵀX)⁻¹, and the standard errors are the square roots of its diagonal. One feature: se(w) = s/√S_xx. On the houses: s² = 34/4 = 8.5, (XᵀX)⁻¹ diagonal 1.8952 and 0.01429, se = 4.01 and 0.348.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do t, P&gt;|t| and the confidence interval in the coefficient table mean?</summary><div class="qa-body">t = coefficient / standard error: how many SEs from zero. P&gt;|t| is the probability of a t at least that extreme if the true coefficient were 0 (t-distribution, n − p df). The 95% CI is coef ± t₀.₉₇₅ × se, the range of true values compatible with the data. Slope 7, se 0.348, t 20.1, p 0.00004, CI [6.03, 7.97].</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>R² vs adjusted R²: why both?</summary><div class="qa-body">R² = 1 − SSE/SST never decreases when features are added. Adjusted R² = 1 − (1 − R²)(n − 1)/(n − p) charges for each parameter, so it can fall when a useless feature is added. Neither replaces a held-out test score.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you include a categorical feature with 3 levels? What is the dummy trap?</summary><div class="qa-body">Create k − 1 = 2 indicator columns; the dropped level is the reference and each coefficient is the mean difference from it (Metro 76.5, Old town −29.5, Suburb −17). Including all k dummies plus an intercept makes the dummies sum to the intercept column: perfect multicollinearity, singular XᵀX, infinitely many solutions with identical predictions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Confidence interval vs prediction interval?</summary><div class="qa-body">The CI covers the mean response at x₀ (uncertainty in the line: s√(1/n + (x₀ − x̄)²/S_xx)). The PI covers a single new observation, adding the noise term: s√(1 + 1/n + …). The PI is always wider and does not shrink to zero with more data. At 1,300 sq ft: CI [71.2, 78.8], PI [66.0, 84.0].</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is OLS the same as maximum likelihood?</summary><div class="qa-body">If yᵢ = xᵢᵀw + εᵢ with εᵢ ~ N(0, σ²) independent, the log-likelihood is −(n/2)log(2πσ²) − SSE/(2σ²). For any σ², it is maximised by minimising SSE. That is why statsmodels can print a log-likelihood, AIC and BIC for OLS (−13.72, 31.4, 31.0 on the houses).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does Gauss–Markov say and not say?</summary><div class="qa-body">With a correct linear model, zero-mean, equal-variance, uncorrelated errors, OLS is the Best Linear Unbiased Estimator (lowest variance among linear unbiased estimators). It does not need normality, and it does not say OLS has the lowest total error: biased methods like ridge can beat it on test error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why do the standard errors need the residuals, and what breaks if the residuals have a pattern?</summary><div class="qa-body">The noise level σ² is unknown, so it is estimated from the residuals: s² = SSE/(n − p). Every SE, t, p, CI and PI is built on s². If the residuals have a pattern (our +2, 0, −1, −2, −3, +4 curve), s² mixes real noise with a wrong shape, and the "uncertainty" numbers describe a misspecified model. That is why diagnostics come next.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip the column of 1s?</summary><div class="qa-body">The line is forced through the origin (b = 0). The residuals no longer sum to zero, SST = SSR + SSE fails, so R² can be misleading (sklearn and statsmodels then use different R² definitions), and every slope is distorted to compensate. On the houses, a line through the origin has slope Σxy/Σx² = 4516/796 = 5.67 instead of 7.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does gradient descent need scaled features when the normal equation does not?</summary><div class="qa-body">The normal equation solves the bowl's bottom directly, whatever its shape. GD walks downhill with one step size for all directions; if x is large and uncentred, the bowl is a long, narrow valley (eigenvalues of XᵀX differ by 1,500×), so a step small enough for the steep direction crawls along the flat one. Centring made b and w independent and cut 20,000 steps to 200.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does logistic regression reuse this note?</summary><div class="qa-body">It keeps the weighted sum z = Xw but passes it through a sigmoid to get a probability, and replaces the Gaussian likelihood (squared loss) with a Bernoulli likelihood (log-loss). There is no closed form, so it is fitted iteratively, like section 06. Coefficients become changes in log-odds. See Logistic Regression.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what do the three sibling notes fix, on the six houses?</summary><div class="qa-body">Assumptions &amp; Diagnostics: whether the SEs, p-values and intervals can be trusted (the residual smile, VIF 16 for size and rooms, leverage of A and F). Polynomial &amp; Basis Functions: the straight-line limit, by adding size² while staying linear in the weights (SSE 34 → 9.9). Ridge, Lasso &amp; Elastic Net: unstable weights from correlated columns, by adding a penalty: (XᵀX + λI)⁻¹Xᵀy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>LinearRegression().fit([[1],[2],[3]], [2,4,6]).coef_</code></summary><div class="qa-body"><code>array([2.])</code> with intercept ≈ 0: the points lie exactly on y = 2x, so every residual is 0 and R² = 1.</div></details>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a>.</b> Every SE, p-value and interval in this note assumed independent, equal-variance, normal errors around a correct straight line. The residuals +2, 0, −1, −2, −3, +4 already hint that the line is the wrong shape. The next note checks each assumption on the same six houses.</div>
</main>
`
});
