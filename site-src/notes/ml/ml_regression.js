// notes/ml/ml_regression.js — Linear Regression
Object.assign(TOPIC_CONTENT, {
  "ml_regression": `<main>
  <h1>Linear Regression</h1>
  <div class="where"><span>Machine Learning</span><span>Regression</span><span>Linear Regression</span></div>
  <p class="lead">Linear regression predicts a number (a salary, a rent, a delivery time) as a weighted sum of input columns plus a constant. This note builds it completely: the least-squares line is derived with calculus and solved by hand on 5 employees, extended to many columns with matrices (the normal equation solved by hand as a 2×2 system), reached again by gradient descent, interpreted in plain words, scored with R² and RMSE, read line by line in a statsmodels summary where every number is recomputed by hand, extended to text categories with dummy variables, given prediction intervals, and finally rebuilt from scratch to match scikit-learn to 12 decimal places. It opens the Regression group: every other note in the group checks, bends or tames this one model.</p>

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
</svg><figcaption>The Regression group. Linear regression is the root; the three sibling notes each fix one of its limits (trust, shape, weight size). Green boxes are where its ideas are reused next.</figcaption></figure>
  <h3>How the four Regression notes connect</h3>
  <table class="tbl">
    <tr><th>Note</th><th>Question it answers</th><th>Uses from this note</th></tr>
    <tr><td><strong>Linear Regression</strong> (this)</td><td>How do we fit a weighted sum to numbers, and how sure are we about each weight?</td><td>–</td></tr>
    <tr><td><a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a></td><td>When are the standard errors, p-values and intervals from this note correct? What breaks them, how to detect and fix it?</td><td>residuals, the hat matrix, the summary table</td></tr>
    <tr><td><a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a></td><td>The truth is curved. How do we keep the same machinery but fit curves?</td><td>"linear in the weights", the normal equation</td></tr>
    <tr><td><a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a></td><td>Many or correlated columns make weights explode. How do we shrink them?</td><td>the normal equation (XᵀX + λI)⁻¹Xᵀy, interpretation</td></tr>
  </table>
  <p>Suggested order: this note, then Assumptions &amp; Diagnostics, then Polynomial, then Ridge/Lasso. The maths you need is only "slope of a curve is zero at its lowest point" (<a class="xref" data-note="m_calculus">Calculus</a>) and matrix multiplication (<a class="xref" data-note="m_linalg">Linear Algebra</a>); both are re-explained where used.</p>

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
          <li>5 employees: S_xy = 14, S_xx = 10 → w = 1.4, b = 1.4</li>
          <li>Residuals 0.2, 0.8, −1.6, 0, 0.6 → sum 0, SSE 3.6</li>
          <li>w = r · s_y / s_x; with one feature R² = r²</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Matrices</div>
        <ul>
          <li><b>Normal equation</b> XᵀXw = Xᵀy → w = (XᵀX)⁻¹Xᵀy</li>
          <li>Toy: [[5, 15], [15, 55]] w = [28, 98]; det 50 → w = [1.4, 1.4]</li>
          <li><b>Geometry</b>: ŷ = Hy is the projection of y; Xᵀe = 0</li>
          <li>Two features: exp alone 1.69, holding certs fixed 1.00</li>
          <li>Cost O(nd² + d³); use lstsq/solve, never inv()</li>
          <li><b>GD</b>: w ← w − η·∇MSE; same answer; needs scaled features</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Interpretation</div>
        <ul>
          <li>wⱼ = change in ŷ per +1 unit of xⱼ, <b>holding the others fixed</b></li>
          <li>Units: size per sq ft 0.0196 = per 100 sq ft 1.96</li>
          <li>Standardised coef = per 1 SD (compare importance)</li>
          <li>log(y) model: +1 unit → about 100·w % change</li>
          <li>Dummies: coef = gap vs the reference category</li>
          <li>⚠ Association, not causation</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Inference (statsmodels)</div>
        <ul>
          <li>s² = SSE / (n − p) = 3.6 / 3 = 1.2</li>
          <li>Cov(ŵ) = s²(XᵀX)⁻¹ → se(w) = 0.346, se(b) = 1.149</li>
          <li>t = coef / se = 4.04; p = 0.027 (df 3)</li>
          <li>95% CI = coef ± t₀.₉₇₅·se = [0.30, 2.50]</li>
          <li>F = 16.33 = t²; adj R² 0.793; AIC 16.55</li>
          <li>Prediction interval ⊃ CI of the mean (adds one person's noise)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">In practice</div>
        <ul>
          <li><b>R²</b> = 1 − SSE/SST = 0.845; <b>RMSE</b> = √(SSE/n) = 0.85</li>
          <li><code>LinearRegression</code>: coef_, intercept_, rank_, singular_</li>
          <li>Categories → k − 1 dummies (drop one; else dummy trap, rank 3 of 4)</li>
          <li>Rent demo: numbers only R² 0.672 → + city 0.884</li>
          <li>From scratch = sklearn to 1e-12</li>
          <li>⚠ Score on test data; plot residuals; don't extrapolate</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="lr-problem"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Regression Problem</span><span class="rm-sub">Predicting a number; notation</span></div></div>
      <div class="rm-item rm-done" data-target="lr-line"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Line y = wx + b</span><span class="rm-sub">Slope, intercept, residuals</span></div></div>
      <div class="rm-item rm-done" data-target="lr-ls"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Least Squares Derived</span><span class="rm-sub">Calculus, then 5 points by hand</span></div></div>
      <div class="rm-item rm-done" data-target="lr-matrix"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Matrix Form &amp; Normal Equation</span><span class="rm-sub">2×2 by hand, two features</span></div></div>
      <div class="rm-item rm-done" data-target="lr-geom"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Geometry &amp; Properties</span><span class="rm-sub">Projection, Gauss–Markov, MLE</span></div></div>
      <div class="rm-item rm-done" data-target="lr-gd"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Gradient Descent Alternative</span><span class="rm-sub">Two steps by hand; when to use</span></div></div>
      <div class="rm-item rm-done" data-target="lr-interp"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Interpreting Coefficients</span><span class="rm-sub">Units, holding fixed, logs</span></div></div>
      <div class="rm-item rm-done" data-target="lr-score"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">R² and RMSE</span><span class="rm-sub">How good is the line?</span></div></div>
      <div class="rm-item rm-done" data-target="lr-sm"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">The statsmodels Summary</span><span class="rm-sub">Every line recomputed by hand</span></div></div>
      <div class="rm-item rm-done" data-target="lr-cat"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Categorical Predictors</span><span class="rm-sub">Dummies and the dummy trap</span></div></div>
      <div class="rm-item rm-done" data-target="lr-pi"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Prediction Intervals</span><span class="rm-sub">CI of the mean vs one new case</span></div></div>
      <div class="rm-item rm-done" data-target="lr-sk"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">scikit-learn in Practice</span><span class="rm-sub">LinearRegression end to end</span></div></div>
      <div class="rm-item rm-done" data-target="lr-scratch"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">From Scratch</span><span class="rm-sub">Three solvers matched to sklearn</span></div></div>
      <div class="rm-item rm-done" data-target="lr-when"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Strengths, Limits &amp; Comparisons</span><span class="rm-sub">vs siblings and other models</span></div></div>
      <div class="rm-item rm-done" data-target="lr-traps"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Traps in interviews and code</span></div></div>
      <div class="rm-item rm-done" data-target="lr-qa"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="lr-problem"><span class="num">01</span>The Regression Problem</h2>
  <h3>The need</h3>
  <p>An HR analyst has the salaries of 5 people in one team and their years of experience. A new person with 6 years of experience is about to join. What salary band should HR expect? A food-delivery app wants to promise a delivery time before the rider even starts. A landlord wants to price a flat from its size, distance to the metro and the city. In each case the answer is a <strong>number on a continuous scale</strong>, and we have past examples with the answer known. That is a <strong>regression</strong> problem (the word is historical; Francis Galton used it in the 1880s for children's heights "regressing" toward the average).</p>
  <table class="tbl">
    <tr><th>Task</th><th>Target y (a number)</th><th>Features x</th></tr>
    <tr><td>Salary band</td><td>salary, lakh ₹ per year</td><td>experience, certifications</td></tr>
    <tr><td>Rent pricing</td><td>monthly rent, ₹ thousand</td><td>size, distance to metro, building age, city</td></tr>
    <tr><td>Delivery ETA</td><td>minutes</td><td>distance, time of day, restaurant prep time</td></tr>
    <tr><td>Demand planning</td><td>units sold tomorrow</td><td>price, day of week, promotions</td></tr>
  </table>
  <p>If the target were a category (spam / not spam, which of 3 plans a customer picks) it would be <strong>classification</strong>, covered from <a class="xref" data-note="ml_classification">Logistic Regression</a> onward. Many models do both; linear regression is the simplest model for numbers, and nearly every other model is compared against it as a <strong>baseline</strong>.</p>
  <h3>Notation used in this note</h3>
  <table class="tbl">
    <tr><th>Symbol</th><th>Meaning</th><th>In the 5-employee example</th></tr>
    <tr><td>n</td><td>number of rows (examples)</td><td>5</td></tr>
    <tr><td>d</td><td>number of feature columns</td><td>1 (experience)</td></tr>
    <tr><td>xᵢ, yᵢ</td><td>features and target of row i</td><td>x₃ = 3 years, y₃ = 4 lakh</td></tr>
    <tr><td>ŷᵢ</td><td>the model's prediction for row i ("y-hat")</td><td>ŷ₃ = 5.6</td></tr>
    <tr><td>w, b</td><td>weight (slope) and bias (intercept); together the <strong>parameters</strong></td><td>w = 1.4, b = 1.4</td></tr>
    <tr><td>eᵢ = yᵢ − ŷᵢ</td><td>residual: how far the prediction missed</td><td>e₃ = −1.6</td></tr>
    <tr><td>x̄, ȳ</td><td>averages of x and y</td><td>3 and 5.6</td></tr>
    <tr><td>X</td><td>the n × (d+1) data table with a leading column of 1s</td><td>5 × 2</td></tr>
  </table>
  <h3>The assumed story behind the data</h3>
  <p>Linear regression assumes the world produces data like this: <strong>y = b + w₁x₁ + … + w_dx_d + ε</strong>. The weighted sum is the part of y the features explain; ε (epsilon) is everything else: luck, negotiation skill, columns we did not record. ε is not a mistake of the model; it is noise the model can never predict. Our job is to estimate the unknown true weights from data, and to say how uncertain those estimates are.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A chai stall's daily sales = 200 cups + 15 cups per degree of cold below 20 °C + a random amount (a cricket match nearby, a festival). The "200 + 15 per degree" is the line; the random amount is ε. Looking at a month of data, you try to recover 200 and 15.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Linear regression</strong> models a numeric target as ŷ = b + Σⱼ wⱼxⱼ, a constant plus a weighted sum of features. "Linear" means linear <em>in the parameters</em> w and b: each parameter multiplies something and the results are added. The features themselves may be x², log x or x₁·x₂.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Linear regression can only fit straight lines" is false. ŷ = b + w₁x + w₂x² is still linear regression (linear in w₁, w₂), and it fits a parabola. What it cannot do is something like ŷ = b·e^(wx) where a parameter sits inside a non-linear function. See <a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a>.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We know the shape of the model. Before finding the best weights we should be fluent with what one weight and one intercept actually do to a line, and how to measure a miss.</div>

  <h2 id="lr-line"><span class="num">02</span>The Line y = wx + b</h2>
  <h3>Slope and intercept in plain words</h3>
  <p>With one feature the model is a straight line ŷ = wx + b. The <strong>slope w</strong> says how much ŷ rises when x rises by 1 unit. The <strong>intercept b</strong> is the value of ŷ when x = 0, the height where the line crosses the y-axis.</p>
  <table class="tbl">
    <tr><th>Line</th><th>At x = 0</th><th>At x = 1</th><th>At x = 5</th><th>Reading</th></tr>
    <tr><td>ŷ = 1.4x + 1.4</td><td>1.4</td><td>2.8</td><td>8.4</td><td>starts at 1.4 lakh, +1.4 lakh per year</td></tr>
    <tr><td>ŷ = 2x + 0</td><td>0</td><td>2</td><td>10</td><td>through the origin, steeper</td></tr>
    <tr><td>ŷ = 0x + 5.6</td><td>5.6</td><td>5.6</td><td>5.6</td><td>flat: predicts the average for everyone</td></tr>
    <tr><td>ŷ = −0.5x + 9</td><td>9</td><td>8.5</td><td>6.5</td><td>falls 0.5 per unit</td></tr>
  </table>
  <p>The flat line at ȳ (third row) is the laziest possible model: it ignores x. Every regression model will be measured against it (that is exactly what R² does in section 08).</p>
  <h3>Our data: 5 employees</h3>
  <table class="tbl"><caption>Team A</caption>
    <tr><th>Person</th><th>Experience x (years)</th><th>Salary y (lakh ₹/yr)</th></tr>
    <tr><td>P1</td><td>1</td><td>3</td></tr>
    <tr><td>P2</td><td>2</td><td>5</td></tr>
    <tr><td>P3</td><td>3</td><td>4</td></tr>
    <tr><td>P4</td><td>4</td><td>7</td></tr>
    <tr><td>P5</td><td>5</td><td>9</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 520 270" width="520">
<line x1="60" y1="230" x2="500" y2="230" stroke="currentColor"/><line x1="60" y1="20" x2="60" y2="230" stroke="currentColor"/>
<text x="52" y="234" text-anchor="end" class="tm" font-size="11">0</text><text x="52" y="134" text-anchor="end" class="tm" font-size="11">5</text><text x="52" y="34" text-anchor="end" class="tm" font-size="11">10</text>
<text x="130" y="246" text-anchor="middle" class="tm" font-size="11">1</text><text x="200" y="246" text-anchor="middle" class="tm" font-size="11">2</text><text x="270" y="246" text-anchor="middle" class="tm" font-size="11">3</text><text x="340" y="246" text-anchor="middle" class="tm" font-size="11">4</text><text x="410" y="246" text-anchor="middle" class="tm" font-size="11">5</text><text x="480" y="246" text-anchor="middle" class="tm" font-size="11">6</text>
<text x="280" y="264" text-anchor="middle" class="tm" font-size="11.5">experience (years)</text><text x="66" y="16" class="tm" font-size="11.5">salary (lakh)</text>
<line x1="60" y1="118" x2="480" y2="118" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/><text x="486" y="122" class="tm" font-size="11">ȳ = 5.6</text>
<line x1="60" y1="202" x2="480" y2="34" class="sb" stroke-width="2.2"/>
<line x1="130" y1="170" x2="130" y2="174" class="sr" stroke-width="2.5"/>
<line x1="200" y1="130" x2="200" y2="146" class="sr" stroke-width="2.5"/>
<line x1="270" y1="150" x2="270" y2="118" class="sr" stroke-width="2.5"/>
<line x1="410" y1="50" x2="410" y2="62" class="sr" stroke-width="2.5"/>
<circle cx="130" cy="170" r="5" class="ft st"/><circle cx="200" cy="130" r="5" class="ft st"/><circle cx="270" cy="150" r="5" class="ft st"/><circle cx="340" cy="90" r="5" class="ft st"/><circle cx="410" cy="50" r="5" class="ft st"/>
<text x="210" y="142" class="tr" font-size="11">e₂ = +0.8</text><text x="278" y="140" class="tr" font-size="11">e₃ = −1.6</text>
<text x="300" y="60" class="tb" font-size="12.5">ŷ = 1.4 + 1.4x</text>
<circle cx="270" cy="118" r="4" class="fg sg"/><text x="230" y="110" class="tg" font-size="11">(x̄, ȳ)</text>
</svg><figcaption>The 5 employees, the least-squares line we will derive, and the residuals (red, vertical). The line passes through the point of averages (3, 5.6).</figcaption></figure>
  <h3>Residuals: measuring a miss</h3>
  <p>For any candidate line, each person gets a residual eᵢ = yᵢ − ŷᵢ: positive when the person earns more than the line predicts (point above the line), negative when less. We measure the gap <strong>vertically</strong>, because the job is predicting y from x; errors in y are what we pay for.</p>
  <p>To turn 5 residuals into one score we cannot just add them: +2 and −2 would cancel and a terrible line would look perfect. Two fixes: add absolute values Σ|eᵢ|, or add squares Σeᵢ². Least squares uses squares, for three reasons:</p>
  <ol>
    <li><strong>Smooth</strong>: e² has a derivative everywhere (|e| has a kink at 0), so calculus gives an exact formula.</li>
    <li><strong>One bottom</strong>: the total is a bowl in the weights (convex), so there is exactly one best line (when columns are not duplicates).</li>
    <li><strong>Statistics</strong>: if the noise ε is normally distributed, least squares is the maximum-likelihood estimate (section 05), and it gives the mean of y for each x.</li>
  </ol>
  <p>The cost: a miss of 10 costs 100 while ten misses of 1 cost only 10, so one wild point pulls the line hard. <a class="xref" data-note="ml_loss_gd">Loss Functions</a> compares squared, absolute and Huber loss in detail.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Residual</strong> eᵢ = yᵢ − ŷᵢ. <strong>Sum of squared errors</strong> SSE (also RSS, residual sum of squares) = Σᵢ eᵢ². <strong>Ordinary least squares (OLS)</strong> chooses the parameters that make SSE as small as possible.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Residual (yᵢ − ŷᵢ, observed, from our fitted line) and error (εᵢ, unobservable, from the true line) are different things. Residuals are our <em>estimates</em> of the errors; the diagnostics note studies residuals because errors cannot be seen.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We can score any line. Now we need the rule that finds the line with the smallest SSE, not by trying lines, but with a formula.</div>

  <h2 id="lr-ls"><span class="num">03</span>Least Squares Derived (and Solved by Hand)</h2>
  <h3>The idea: the bottom of a bowl is flat</h3>
  <p>SSE depends on two numbers, w and b. Picture a bowl: each position on the floor is a (w, b) pair, the height is the SSE of that line. At the lowest point the bowl is flat in every direction, so the slope (derivative) with respect to b is 0 and the slope with respect to w is 0. Two equations, two unknowns: solve them.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A marble dropped into a round steel katori rolls and stops at the bottom, where the surface is level. Setting the derivatives to zero is "finding where the floor is level".</p>
  </div>
  <h3>Step 1: the derivative with respect to b</h3>
  <p>SSE(w, b) = Σ (yᵢ − wxᵢ − b)². Differentiate each square with the chain rule (the derivative of u² is 2u · u′, and the derivative of (yᵢ − wxᵢ − b) with respect to b is −1):</p>
  <p>∂SSE/∂b = Σ 2(yᵢ − wxᵢ − b)(−1) = −2 Σ (yᵢ − wxᵢ − b).</p>
  <p>Set it to 0 and divide by −2n: (1/n)Σyᵢ − w(1/n)Σxᵢ − b = 0, that is <strong>b = ȳ − w·x̄</strong>.</p>
  <p>Plain words: the best line always passes through the point of averages (x̄, ȳ). Also, since Σ(yᵢ − ŷᵢ) = 0 at the solution, <strong>the residuals of any OLS fit with an intercept add up to exactly zero</strong>.</p>
  <h3>Step 2: the derivative with respect to w</h3>
  <p>The derivative of (yᵢ − wxᵢ − b) with respect to w is −xᵢ, so ∂SSE/∂w = −2 Σ xᵢ(yᵢ − wxᵢ − b). Set it to 0 and substitute b = ȳ − w x̄:</p>
  <p>Σ xᵢ(yᵢ − ȳ − w(xᵢ − x̄)) = 0 → Σ xᵢ(yᵢ − ȳ) = w Σ xᵢ(xᵢ − x̄).</p>
  <p>Because Σ(xᵢ − x̄) = 0, we may replace the leading xᵢ by (xᵢ − x̄) on both sides without changing the sums (we are only subtracting x̄ · 0). That gives the famous formula:</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Least-squares line, one feature:</strong><br>w = S_xy / S_xx = Σ(xᵢ − x̄)(yᵢ − ȳ) / Σ(xᵢ − x̄)²,  b = ȳ − w·x̄.<br>S_xy measures how x and y move together (it is n times the covariance); S_xx measures how spread out x is (n times the variance). So w = cov(x, y) / var(x).</p>
  </div>
  <p>Is it a minimum, not a maximum? The second derivatives are ∂²SSE/∂b² = 2n &gt; 0 and ∂²SSE/∂w² = 2Σxᵢ² &gt; 0, and the bowl is convex (shown with matrices in section 04), so the flat point is the bottom.</p>
  <h3>Worked by hand on the 5 employees</h3>
  <p>x̄ = (1+2+3+4+5)/5 = 3. ȳ = (3+5+4+7+9)/5 = 28/5 = 5.6.</p>
  <table class="tbl out"><caption>The two sums we need</caption>
    <tr><th>x</th><th>y</th><th>dx = x − 3</th><th>dy = y − 5.6</th><th>dx · dy</th><th>dx²</th></tr>
    <tr><td>1</td><td>3</td><td>−2</td><td>−2.6</td><td>5.2</td><td>4</td></tr>
    <tr><td>2</td><td>5</td><td>−1</td><td>−0.6</td><td>0.6</td><td>1</td></tr>
    <tr><td>3</td><td>4</td><td>0</td><td>−1.6</td><td>0</td><td>0</td></tr>
    <tr><td>4</td><td>7</td><td>1</td><td>1.4</td><td>1.4</td><td>1</td></tr>
    <tr><td>5</td><td>9</td><td>2</td><td>3.4</td><td>6.8</td><td>4</td></tr>
    <tr><td colspan="4"><strong>sums</strong></td><td><strong>S_xy = 14</strong></td><td><strong>S_xx = 10</strong></td></tr>
  </table>
  <p>w = 14 / 10 = <strong>1.4</strong> lakh per year of experience. b = 5.6 − 1.4 × 3 = <strong>1.4</strong> lakh. The line is ŷ = 1.4 + 1.4x.</p>
  <table class="tbl out"><caption>Predictions and residuals</caption>
    <tr><th>x</th><th>y</th><th>ŷ = 1.4 + 1.4x</th><th>e = y − ŷ</th><th>e²</th></tr>
    <tr><td>1</td><td>3</td><td>2.8</td><td>0.2</td><td>0.04</td></tr>
    <tr><td>2</td><td>5</td><td>4.2</td><td>0.8</td><td>0.64</td></tr>
    <tr><td>3</td><td>4</td><td>5.6</td><td>−1.6</td><td>2.56</td></tr>
    <tr><td>4</td><td>7</td><td>7.0</td><td>0</td><td>0</td></tr>
    <tr><td>5</td><td>9</td><td>8.4</td><td>0.6</td><td>0.36</td></tr>
    <tr><td colspan="3"><strong>sums</strong></td><td><strong>0</strong></td><td><strong>SSE = 3.6</strong></td></tr>
  </table>
  <p>The residuals add to 0, as step 1 promised. Is 3.6 really the smallest? The code checks the arithmetic and tries three other lines.</p>
  <div class="fx" data-lang="py">import numpy as np
x = np.array([1, 2, 3, 4, 5], dtype=float)     # years of experience
y = np.array([3, 5, 4, 7, 9], dtype=float)     # salary, lakh per year
dx, dy = x - x.mean(), y - y.mean()
w = (dx * dy).sum() / (dx ** 2).sum()          # slope
b = y.mean() - w * x.mean()                    # intercept
print("x_bar", x.mean(), " y_bar", y.mean())
print("S_xy", (dx * dy).sum(), " S_xx", (dx ** 2).sum())
print(f"slope w = {w:.3f}   intercept b = {b:.3f}")
res = y - (b + w * x)
print("residuals", res.round(2) + 0.0, " sum", round(res.sum(), 10) + 0.0)
print("SSE", round((res ** 2).sum(), 3))
for bb, ww in [(1.4, 1.4), (1.0, 1.5), (2.0, 1.2), (0.0, 1.8)]:
    print(f"line {bb} + {ww}x   SSE = {((y - (bb + ww * x)) ** 2).sum():.2f}")</div>
  <div class="fx" data-lang="text">x_bar 3.0  y_bar 5.6
S_xy 14.0  S_xx 10.0
slope w = 1.400   intercept b = 1.400
residuals [ 0.2  0.8 -1.6  0.   0.6]  sum 0.0
SSE 3.6
line 1.4 + 1.4x   SSE = 3.60
line 1.0 + 1.5x   SSE = 3.75
line 2.0 + 1.2x   SSE = 4.00
line 0.0 + 1.8x   SSE = 5.40</div>
  <p><code>dx</code> and <code>dy</code> are the middle columns of the table; the next two lines are the two formulas. Every other line has a bigger SSE (3.75, 4.00, 5.40). <code>+ 0.0</code> only turns a printed "-0." into "0.".</p>
  <h3>Seeing the bowl</h3>
  <p>Fix b at its best value for each w (b = ȳ − w·x̄) and look at SSE as w changes. Expanding the square gives SSE(w) = 3.6 + S_xx·(w − 1.4)² = 3.6 + 10(w − 1.4)²: a parabola whose bottom is at w = 1.4.</p>
  <div class="fx" data-lang="py"># SSE as a function of the slope, with the intercept always set to y_bar - w*x_bar
for ww in [0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0]:
    bb = y.mean() - ww * x.mean()
    print(f"w={ww:.1f}  b={bb:.1f}  SSE={((y - (bb + ww * x)) ** 2).sum():.2f}")</div>
  <div class="fx" data-lang="text">w=0.8  b=3.2  SSE=7.20
w=1.0  b=2.6  SSE=5.20
w=1.2  b=2.0  SSE=4.00
w=1.4  b=1.4  SSE=3.60
w=1.6  b=0.8  SSE=4.00
w=1.8  b=0.2  SSE=5.20
w=2.0  b=-0.4  SSE=7.20</div>
  <figure class="viz"><svg viewBox="0 0 520 260" width="520">
<line x1="50" y1="220" x2="480" y2="220" stroke="currentColor"/><line x1="50" y1="30" x2="50" y2="220" stroke="currentColor"/>
<text x="42" y="224" text-anchor="end" class="tm" font-size="11">0</text><text x="42" y="130" text-anchor="end" class="tm" font-size="11">5</text><text x="42" y="44" text-anchor="end" class="tm" font-size="11">10</text>
<text x="110" y="236" text-anchor="middle" class="tm" font-size="11">0.8</text><text x="160" y="236" text-anchor="middle" class="tm" font-size="11">1.0</text><text x="210" y="236" text-anchor="middle" class="tm" font-size="11">1.2</text><text x="260" y="236" text-anchor="middle" class="tm" font-size="11">1.4</text><text x="310" y="236" text-anchor="middle" class="tm" font-size="11">1.6</text><text x="360" y="236" text-anchor="middle" class="tm" font-size="11">1.8</text><text x="410" y="236" text-anchor="middle" class="tm" font-size="11">2.0</text>
<text x="265" y="254" text-anchor="middle" class="tm" font-size="11.5">slope w (with b = ȳ − w·x̄)</text><text x="56" y="24" class="tm" font-size="11.5">SSE</text>
<polyline points="60,40 73,54 85,67 98,79 110,90 122,101 135,110 148,119 160,126 172,133 185,139 197,144 210,148 222,151 235,153 248,155 260,155 273,155 285,153 298,151 310,148 322,144 335,139 348,133 360,126 372,119 385,110 398,101 410,90 423,79 435,67 447,54 460,40" fill="none" class="sb" stroke-width="2.5"/>
<circle cx="110" cy="90" r="4" class="ft st"/><circle cx="160" cy="126" r="4" class="ft st"/><circle cx="210" cy="148" r="4" class="ft st"/><circle cx="310" cy="148" r="4" class="ft st"/><circle cx="360" cy="126" r="4" class="ft st"/><circle cx="410" cy="90" r="4" class="ft st"/>
<circle cx="260" cy="155" r="6" class="fg sg"/><text x="260" y="178" text-anchor="middle" class="tg" font-size="12">minimum: w = 1.4, SSE = 3.6</text>
<line x1="80" y1="58" x2="140" y2="122" class="sr" stroke-width="1.5" stroke-dasharray="4 3"/><text x="146" y="70" class="tr" font-size="11">steep slope far away: big gradient</text>
<line x1="225" y1="155" x2="295" y2="155" class="sg" stroke-width="1.5" stroke-dasharray="4 3"/><text x="300" y="196" class="tg" font-size="11">flat at the bottom: derivative = 0</text>
</svg><figcaption>SSE against the slope. A symmetric bowl (parabola), lowest at w = 1.4. Setting the derivative to zero picks out exactly this point; gradient descent (section 06) walks down the same bowl.</figcaption></figure>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>The slope formula S_xy / S_xx is "how much x and y move together, divided by how much x moves on its own". If y tends to be above its average exactly when x is above its average, S_xy is large and positive, so the slope is steep and positive.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Regressing y on x and x on y gives two <em>different</em> lines (the second minimises horizontal gaps). Slope of y on x = S_xy / S_xx = 1.4; slope of x on y = S_xy / S_yy = 14 / 23.2 = 0.603, which is not 1 / 1.4 = 0.714. Decide which variable you are predicting.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Real problems have many features: experience <em>and</em> certifications, size <em>and</em> distance <em>and</em> age. Writing a separate derivative for each weight gets messy fast. Matrices let us write all of them in one line.</div>

  <h2 id="lr-matrix"><span class="num">04</span>Matrix Form &amp; the Normal Equation</h2>
  <h3>All rows at once</h3>
  <p>Stack the rows. Put a column of 1s in front of the features (it multiplies the intercept), and stack all parameters in one vector w = [b, w₁, …, w_d]. Then all n predictions are a single matrix product ŷ = Xw:</p>
  <table class="tbl">
    <tr><th>X (5 × 2)</th><th>w (2 × 1)</th><th>ŷ = Xw</th></tr>
    <tr><td>[1, 1]<br>[1, 2]<br>[1, 3]<br>[1, 4]<br>[1, 5]</td><td>[b]<br>[w]</td><td>b + 1w<br>b + 2w<br>b + 3w<br>b + 4w<br>b + 5w</td></tr>
  </table>
  <p>The loss is the squared length of the residual vector: SSE = ‖y − Xw‖² = (y − Xw)ᵀ(y − Xw).</p>
  <h3>Deriving the normal equation</h3>
  <p>Multiply out: SSE = yᵀy − 2wᵀXᵀy + wᵀXᵀXw. Two matrix-calculus facts (each is the many-variable version of d(ax)/dx = a and d(ax²)/dx = 2ax): the gradient of wᵀa is a, and the gradient of wᵀAw is 2Aw when A is symmetric. So</p>
  <p>∇SSE = −2Xᵀy + 2XᵀXw. Set it to the zero vector:</p>
  <div class="flow"><span>Loss ‖y − Xw‖²</span><span>Gradient −2Xᵀ(y − Xw)</span><span>Set = 0</span><span>XᵀX w = Xᵀy</span><span>w = (XᵀX)⁻¹Xᵀy</span></div>
  <p>The middle equation XᵀXw = Xᵀy is the <strong>normal equation</strong> (one equation per parameter). Its second derivative (Hessian) is 2XᵀX, which is positive semi-definite (vᵀXᵀXv = ‖Xv‖² ≥ 0 for every v), so the loss is a convex bowl and the solution is the minimum. If no column is a combination of the others, XᵀX is invertible and the answer is unique.</p>
  <h3>The 2×2 case by hand</h3>
  <p>XᵀX is a table of sums: [[n, Σx], [Σx, Σx²]]. Xᵀy = [Σy, Σxy]. For our 5 employees: n = 5, Σx = 15, Σx² = 1+4+9+16+25 = 55, Σy = 28, Σxy = 3 + 10 + 12 + 28 + 45 = 98.</p>
  <p>So the normal equation is two ordinary equations:</p>
  <ul>
    <li>5b + 15w = 28</li>
    <li>15b + 55w = 98</li>
  </ul>
  <p><strong>Solve with the 2×2 inverse.</strong> For A = [[a, c], [c, d]], A⁻¹ = (1/(ad − c²))·[[d, −c], [−c, a]]. Here the determinant is 5·55 − 15·15 = 275 − 225 = <strong>50</strong>, so (XᵀX)⁻¹ = (1/50)[[55, −15], [−15, 5]] = [[1.1, −0.3], [−0.3, 0.1]].</p>
  <p>w = (XᵀX)⁻¹Xᵀy: b = 1.1·28 − 0.3·98 = 30.8 − 29.4 = <strong>1.4</strong>; w = −0.3·28 + 0.1·98 = −8.4 + 9.8 = <strong>1.4</strong>. The same line as the one-feature formula, as it must be. Keep the inverse [[1.1, −0.3], [−0.3, 0.1]]: it reappears in section 09 as the source of the standard errors.</p>
  <div class="fx" data-lang="py">X = np.c_[np.ones(5), x]                        # column of 1s (intercept) + experience
XtX, Xty = X.T @ X, X.T @ y
print("X^T X =", XtX.tolist())
print("X^T y =", Xty.tolist())
print("det   =", round(np.linalg.det(XtX), 6))
w_solve = np.linalg.solve(XtX, Xty)             # solves (X^T X) w = X^T y
w_lstsq, *_ = np.linalg.lstsq(X, y, rcond=None) # SVD-based least squares
print("solve :", w_solve.round(4))
print("lstsq :", w_lstsq.round(4))
r = y - X @ w_solve
print("X^T r =", (X.T @ r).round(10) + 0.0, "  (residuals are orthogonal to every column)")</div>
  <div class="fx" data-lang="text">X^T X = [[5.0, 15.0], [15.0, 55.0]]
X^T y = [28.0, 98.0]
det   = 50.0
solve : [1.4 1.4]
lstsq : [1.4 1.4]
X^T r = [0. 0.]   (residuals are orthogonal to every column)</div>
  <p><code>np.c_</code> glues a column of 1s to x. <code>solve</code> solves the linear system directly (no inverse is formed), and <code>lstsq</code> uses the SVD, which also copes with duplicated columns. The last line checks Xᵀe = 0: this is just the normal equation rewritten as Xᵀ(y − Xw) = 0.</p>
  <h3>Multiple regression by hand: two features</h3>
  <p>Team B has 6 people. Besides experience we now know how many professional certifications each holds.</p>
  <table class="tbl"><caption>Team B</caption>
    <tr><th>Person</th><th>exp x₁</th><th>cert x₂</th><th>salary y</th><th>d₁ = x₁ − 3.5</th><th>d₂ = x₂ − 1</th><th>dy = y − 7.5</th></tr>
    <tr><td>Q1</td><td>1</td><td>0</td><td>3</td><td>−2.5</td><td>−1</td><td>−4.5</td></tr>
    <tr><td>Q2</td><td>2</td><td>1</td><td>6.5</td><td>−1.5</td><td>0</td><td>−1</td></tr>
    <tr><td>Q3</td><td>3</td><td>0</td><td>4.5</td><td>−0.5</td><td>−1</td><td>−3</td></tr>
    <tr><td>Q4</td><td>4</td><td>2</td><td>9.5</td><td>0.5</td><td>1</td><td>2</td></tr>
    <tr><td>Q5</td><td>5</td><td>1</td><td>9.5</td><td>1.5</td><td>0</td><td>2</td></tr>
    <tr><td>Q6</td><td>6</td><td>2</td><td>12</td><td>2.5</td><td>1</td><td>4.5</td></tr>
  </table>
  <p>A shortcut that keeps the arithmetic small: <strong>centre</strong> every column (subtract its mean). The intercept then drops out of the system and comes back at the end as b = ȳ − w₁x̄₁ − w₂x̄₂. The centred normal equation is a 2×2 system of sums of products:</p>
  <ul>
    <li>S₁₁ = Σd₁² = 6.25 + 2.25 + 0.25 + 0.25 + 2.25 + 6.25 = <strong>17.5</strong></li>
    <li>S₁₂ = Σd₁d₂ = 2.5 + 0 + 0.5 + 0.5 + 0 + 2.5 = <strong>6</strong></li>
    <li>S₂₂ = Σd₂² = 1 + 0 + 1 + 1 + 0 + 1 = <strong>4</strong></li>
    <li>S₁y = Σd₁·dy = 11.25 + 1.5 + 1.5 + 1 + 3 + 11.25 = <strong>29.5</strong></li>
    <li>S₂y = Σd₂·dy = 4.5 + 0 + 3 + 2 + 0 + 4.5 = <strong>14</strong></li>
  </ul>
  <p>Equations: 17.5w₁ + 6w₂ = 29.5 and 6w₁ + 4w₂ = 14. Determinant 17.5·4 − 6·6 = 70 − 36 = 34. Cramer's rule: w₁ = (29.5·4 − 6·14)/34 = (118 − 84)/34 = <strong>1.0</strong>; w₂ = (17.5·14 − 6·29.5)/34 = (245 − 177)/34 = <strong>2.0</strong>. Intercept b = 7.5 − 1.0·3.5 − 2.0·1 = <strong>2.0</strong>.</p>
  <p>Model: <strong>salary = 2 + 1.0·experience + 2.0·certifications</strong>.</p>
  <div class="fx" data-lang="py">exp  = np.array([1, 2, 3, 4, 5, 6], dtype=float)          # years of experience
cert = np.array([0, 1, 0, 2, 1, 2], dtype=float)          # certifications held
sal  = np.array([3, 6.5, 4.5, 9.5, 9.5, 12])              # salary, lakh per year
d1, d2, dyy = exp - exp.mean(), cert - cert.mean(), sal - sal.mean()
A = np.array([[d1 @ d1, d1 @ d2], [d1 @ d2, d2 @ d2]])    # centred X^T X (2x2)
c = np.array([d1 @ dyy, d2 @ dyy])                        # centred X^T y
print("centred X^T X =", A.tolist(), "  centred X^T y =", c.tolist())
w12 = np.linalg.solve(A, c)
w0 = sal.mean() - w12 @ [exp.mean(), cert.mean()]
print("w_exp, w_cert =", w12.round(4), "  intercept =", round(w0, 4))
X3 = np.c_[np.ones(6), exp, cert]                         # full design matrix with 1s
print("full normal equation:", np.linalg.solve(X3.T @ X3, X3.T @ sal).round(4))
print("experience ALONE slope:", round((d1 @ dyy) / (d1 @ d1), 4))
print("corr(exp, cert) =", round(np.corrcoef(exp, cert)[0, 1], 3))</div>
  <div class="fx" data-lang="text">centred X^T X = [[17.5, 6.0], [6.0, 4.0]]   centred X^T y = [29.5, 14.0]
w_exp, w_cert = [1. 2.]   intercept = 2.0
full normal equation: [2. 1. 2.]
experience ALONE slope: 1.6857
corr(exp, cert) = 0.717</div>
  <p>The centred 2×2 system and the full 3×3 normal equation (with the 1s column) agree. Now the important line: <strong>experience alone</strong> gives a slope of 29.5/17.5 = 1.686, but with certifications in the model it is 1.0. Why? Experienced people in this team also hold more certifications (correlation 0.717). Alone, experience gets credit for both. Section 07 explains the exact formula: 1.686 = 1.0 + 2.0 × (6/17.5).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Normal equation:</strong> XᵀXw = Xᵀy, with solution ŵ = (XᵀX)⁻¹Xᵀy when XᵀX is invertible (X has full column rank). X includes a leading column of 1s, so ŵ[0] is the intercept. Computing it costs about O(nd²) to form XᵀX plus O(d³) to solve.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Never compute <code>np.linalg.inv(X.T @ X) @ X.T @ y</code> in real code. Explicit inverses lose accuracy when columns are nearly duplicates (XᵀX nearly singular). Use <code>np.linalg.lstsq</code> (SVD) or <code>solve</code>; sklearn's <code>LinearRegression</code> already uses an SVD-based least-squares solver.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We have a formula. Why does it work? A picture of what XᵀXw = Xᵀy means, and a few facts about OLS that interviews love (why it is "best", why it equals maximum likelihood).</div>

  <h2 id="lr-geom"><span class="num">05</span>Geometry &amp; Properties of OLS</h2>
  <h3>Projection: the shadow of y</h3>
  <p>Think of y as one arrow in n-dimensional space (one coordinate per row). Every possible prediction Xw is a combination of X's columns, so all of them lie on a flat sheet (the <strong>column space</strong> of X). The closest point on that sheet to y is found by dropping a perpendicular: the shadow. That shadow is ŷ, and the perpendicular is the residual vector e. "Perpendicular to every column" is exactly Xᵀe = 0, the normal equation. (The word "normal" means perpendicular.)</p>
  <figure class="viz"><svg viewBox="0 0 460 210" width="460">
<defs><marker id="lr-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<path d="M30 150 L250 175 L420 130 L200 105 Z" class="fs" stroke="currentColor"/>
<text x="30" y="198" class="tm" font-size="12">sheet = all possible Xw (column space of X)</text>
<line x1="120" y1="140" x2="260" y2="30" stroke="currentColor" stroke-width="2" marker-end="url(#lr-ah)"/>
<text x="266" y="28" font-size="13">y (actual salaries)</text>
<line x1="120" y1="140" x2="260" y2="135" class="sb" stroke-width="2" marker-end="url(#lr-ah)"/>
<text x="266" y="150" class="tb" font-size="13">ŷ = Xŵ = Hy</text>
<line x1="260" y1="35" x2="260" y2="130" class="sr" stroke-width="2" stroke-dasharray="4 3"/>
<text x="268" y="88" class="tr" font-size="12">e = y − ŷ, perpendicular</text>
<path d="M260 122 h-8 v9" fill="none" stroke="currentColor"/>
</svg><figcaption>OLS finds the point of the sheet closest to y. The residual sticks out at a right angle: Xᵀe = 0.</figcaption></figure>
  <p>Substituting ŵ gives ŷ = X(XᵀX)⁻¹Xᵀy = <strong>Hy</strong>. H is the <strong>hat matrix</strong> ("it puts the hat on y"). Its diagonal entries hᵢᵢ, called <strong>leverages</strong>, say how much row i's own y pulls its own prediction; <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a> uses them to find influential points.</p>
  <h3>Facts that follow (all true for every OLS fit with an intercept)</h3>
  <table class="tbl">
    <tr><th>Fact</th><th>Why</th><th>Check on the 5 employees</th></tr>
    <tr><td>Residuals sum to 0</td><td>e ⟂ the 1s column</td><td>0.2 + 0.8 − 1.6 + 0 + 0.6 = 0</td></tr>
    <tr><td>Residuals uncorrelated with each feature</td><td>e ⟂ every column</td><td>Σxe = 0.2 + 1.6 − 4.8 + 0 + 3.0 = 0</td></tr>
    <tr><td>Residuals uncorrelated with ŷ</td><td>ŷ is a combination of columns</td><td>Σŷe = 0.56 + 3.36 − 8.96 + 0 + 5.04 = 0</td></tr>
    <tr><td>Line passes through (x̄, ȳ)</td><td>b = ȳ − wx̄</td><td>1.4 + 1.4·3 = 5.6</td></tr>
    <tr><td>mean(ŷ) = mean(y)</td><td>residuals sum to 0</td><td>(2.8+4.2+5.6+7+8.4)/5 = 5.6</td></tr>
    <tr><td>SST = SSR + SSE</td><td>Pythagoras on the right angle</td><td>23.2 = 19.6 + 3.6</td></tr>
  </table>
  <p>Because these hold by construction, they are <em>not</em> evidence that the model is good. A residual plot of a wrong model still has residuals that average to zero.</p>
  <h3>Why OLS is "best": Gauss–Markov (brief)</h3>
  <p>If the true model is linear, the errors have mean 0, the same variance for every row, and are uncorrelated with each other, then the OLS weights are <strong>BLUE</strong>: the Best (lowest variance) Linear Unbiased Estimator. "Unbiased" means that over many datasets the estimates average to the true weights. "Best" means no other unbiased estimator that is a linear function of y wobbles less. Normality of errors is <em>not</em> needed for this. Which assumptions buy what, and what to do when they fail, is the whole of <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a>.</p>
  <h3>Least squares = maximum likelihood under normal noise (brief)</h3>
  <p>Assume εᵢ ~ Normal(0, σ²). The probability density of seeing yᵢ is (1/√(2πσ²))·exp(−(yᵢ − xᵢᵀw)² / (2σ²)). Multiply over rows and take logs:</p>
  <p>log L(w, σ²) = −(n/2)·log(2πσ²) − (1/(2σ²))·Σ(yᵢ − xᵢᵀw)².</p>
  <p>The only part that depends on w is −SSE/(2σ²). Maximising the likelihood is therefore the same as minimising SSE. The best σ² is SSE/n, and plugging it back gives log L = −(n/2)(log 2π + log(SSE/n) + 1). For our data: −2.5 × (1.8379 + log 0.72 + 1) = −2.5 × 2.5094 = <strong>−6.273</strong>, the "Log-Likelihood" line of the statsmodels summary in section 09. (<a class="xref" data-note="st_probability">Probability</a> covers likelihood.)</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Three views give the same answer: calculus (flat bottom of the SSE bowl), geometry (perpendicular projection), statistics (maximum likelihood with Gaussian noise). Ridge and lasso add a penalty to the first view; logistic regression changes the likelihood in the third.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"BLUE" does not mean "best model". A biased estimator such as ridge can have lower total error (bias² + variance) than OLS, which is why <a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a> often predicts better. Gauss–Markov only ranks <em>unbiased linear</em> estimators.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> The normal equation needs XᵀX in memory and a d × d solve. With millions of rows streaming in, or a model too big for a closed form, we need a way to find the same weights step by step.</div>

  <h2 id="lr-gd"><span class="num">06</span>Gradient Descent: the Iterative Alternative</h2>
  <h3>The idea</h3>
  <p>Instead of jumping to the bottom of the bowl with a formula, start anywhere and repeatedly take a small step downhill. "Downhill" is the negative gradient; the step size is the <strong>learning rate</strong> η. The full theory (learning-rate effects, mini-batches, momentum) is in <a class="xref" data-note="ml_loss_gd">Loss Functions &amp; Gradient Descent</a>; here we apply it to our line.</p>
  <p>Use the mean squared error MSE = SSE / n (dividing by n keeps step sizes independent of dataset size). Its gradients are</p>
  <ul>
    <li>∂MSE/∂b = −(2/n) Σ eᵢ</li>
    <li>∂MSE/∂w = −(2/n) Σ xᵢ eᵢ, where eᵢ = yᵢ − (b + wxᵢ).</li>
  </ul>
  <p>Update: b ← b − η·∂MSE/∂b, w ← w − η·∂MSE/∂w.</p>
  <h3>Two steps by hand (η = 0.05, start b = 0, w = 0)</h3>
  <p><strong>Step 1.</strong> The line predicts 0 for everyone, so the residuals are just y: 3, 5, 4, 7, 9. Σe = 28 and Σxe = 98 (that is Σxy).</p>
  <ul>
    <li>∂b = −(2/5)·28 = −11.2; ∂w = −(2/5)·98 = −39.2</li>
    <li>b = 0 − 0.05·(−11.2) = <strong>0.56</strong>; w = 0 − 0.05·(−39.2) = <strong>1.96</strong></li>
  </ul>
  <p><strong>Step 2.</strong> Predictions 0.56 + 1.96x = 2.52, 4.48, 6.44, 8.40, 10.36. Residuals 0.48, 0.52, −2.44, −1.40, −1.36.</p>
  <table class="tbl out"><caption>Step 2 sums</caption>
    <tr><th>x</th><th>e</th><th>x·e</th></tr>
    <tr><td>1</td><td>0.48</td><td>0.48</td></tr>
    <tr><td>2</td><td>0.52</td><td>1.04</td></tr>
    <tr><td>3</td><td>−2.44</td><td>−7.32</td></tr>
    <tr><td>4</td><td>−1.40</td><td>−5.60</td></tr>
    <tr><td>5</td><td>−1.36</td><td>−6.80</td></tr>
    <tr><td><strong>sum</strong></td><td><strong>−4.20</strong></td><td><strong>−18.20</strong></td></tr>
  </table>
  <ul>
    <li>∂b = −(2/5)(−4.2) = 1.68; ∂w = −(2/5)(−18.2) = 7.28</li>
    <li>b = 0.56 − 0.05·1.68 = <strong>0.476</strong>; w = 1.96 − 0.05·7.28 = <strong>1.596</strong></li>
  </ul>
  <p>Step 1 overshot the slope (1.96 &gt; 1.4) because every prediction was far too low; step 2 pulled it back. The code continues for 2,000 steps.</p>
  <div class="fx" data-lang="py">w, b, lr = 0.0, 0.0, 0.05                     # start from the flat line y = 0
for step in range(1, 2001):
    err = y - (b + w * x)                     # residual for each of the 5 people
    gb = -2 * err.mean()                      # d MSE / d b
    gw = -2 * (err * x).mean()                # d MSE / d w
    b, w = b - lr * gb, w - lr * gw           # step downhill
    if step in (1, 2, 3, 10, 100, 1000, 2000):
        mse = ((y - (b + w * x)) ** 2).mean()
        print(f"step {step:4d}  grad_b={gb:7.3f} grad_w={gw:7.3f}  b={b:.3f} w={w:.3f}  MSE={mse:.3f}")</div>
  <div class="fx" data-lang="text">step    1  grad_b=-11.200 grad_w=-39.200  b=0.560 w=1.960  MSE=2.053
step    2  grad_b=  1.680 grad_w=  7.280  b=0.476 w=1.596  MSE=0.910
step    3  grad_b= -0.672 grad_w= -1.232  b=0.510 w=1.658  MSE=0.867
step   10  grad_b= -0.273 grad_w=  0.076  b=0.607 w=1.620  MSE=0.834
step  100  grad_b= -0.059 grad_w=  0.016  b=1.229 w=1.447  MSE=0.725
step 1000  grad_b= -0.000 grad_w=  0.000  b=1.400 w=1.400  MSE=0.720
step 2000  grad_b= -0.000 grad_w=  0.000  b=1.400 w=1.400  MSE=0.720</div>
  <p>Steps 1 and 2 match the hand table. The slope is found quickly, but the intercept crawls (0.607 at step 10, 1.229 at step 100) because x is not centred: changing b and changing w have tangled effects, and the bowl is a long narrow valley. After about 1,000 steps both reach 1.400, and MSE 0.72 = SSE 3.6 / 5. Centring or standardising x makes the valley round and GD much faster; section 13 shows the effect on a real dataset.</p>
  <h3>Closed form or iterative?</h3>
  <table class="tbl">
    <tr><th></th><th>Normal equation / SVD</th><th>Gradient descent</th></tr>
    <tr><td>Answer</td><td>exact, in one shot</td><td>approximate; improves with iterations</td></tr>
    <tr><td>Cost</td><td>O(nd² + d³)</td><td>O(nd) per pass over the data</td></tr>
    <tr><td>Hyperparameters</td><td>none</td><td>learning rate, iterations (and batch size)</td></tr>
    <tr><td>Feature scaling</td><td>not needed</td><td>needed for speed</td></tr>
    <tr><td>Data bigger than memory / streaming</td><td>hard</td><td>natural (mini-batch, <code>SGDRegressor</code>)</td></tr>
    <tr><td>Generalises to other losses</td><td>only squared loss (and ridge)</td><td>any differentiable loss: logistic, Huber, neural nets</td></tr>
    <tr><td>sklearn</td><td><code>LinearRegression</code></td><td><code>SGDRegressor</code></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Batch gradient descent for linear regression:</strong> repeat w ← w − η·(2/n)·Xᵀ(Xw − y). Because the MSE is convex, any small enough η (below 2 / largest eigenvalue of (2/n)XᵀX) converges to the OLS solution.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Too large a learning rate makes the loss grow every step (try η = 0.2 on this data and w swings to ±∞). Too small and it "converges" to a wrong answer only because you stopped early. Always plot the loss per iteration, and scale the features.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We can find the weights three ways. But what does a weight of 1.0 <em>mean</em>, and why did experience drop from 1.69 to 1.0 when certifications were added?</div>

  <h2 id="lr-interp"><span class="num">07</span>Interpreting Coefficients</h2>
  <h3>The rule</h3>
  <p>A coefficient wⱼ is the change in the prediction when xⱼ increases by one unit <strong>and every other feature in the model stays the same</strong>. Its units are (units of y) per (unit of xⱼ).</p>
  <ul>
    <li>Team A: w = 1.4 → "each extra year of experience is associated with 1.4 lakh more salary".</li>
    <li>Team B: w_exp = 1.0 → "comparing two people with the <em>same number of certifications</em>, one extra year is associated with 1.0 lakh more". w_cert = 2.0 → "same experience, one more certification: 2.0 lakh more".</li>
    <li>The intercept is the prediction when every feature is 0. b = 2.0 means "0 years, 0 certificates: 2 lakh". Often x = 0 is outside the data (a 0 sq ft flat), and the intercept is then just a mathematical anchor, not something to interpret.</li>
  </ul>
  <h3>Why "holding others fixed" changes the number: the omitted-variable formula</h3>
  <p>When x₂ is left out, x₁'s simple slope absorbs part of x₂'s effect:</p>
  <p><strong>simple slope of x₁ = w₁ + w₂ · δ</strong>, where δ = S₁₂ / S₁₁ is the slope from regressing x₂ on x₁ ("how many extra certificates come with one extra year").</p>
  <p>Team B by hand: δ = 6 / 17.5 = 0.343 certificates per year. Simple slope = 1.0 + 2.0 × 0.343 = 1.0 + 0.686 = <strong>1.686</strong>, exactly the "experience ALONE" number the code printed. The extra 0.686 lakh is really the value of the certificates that tend to come with experience. This is <strong>omitted-variable bias</strong>; <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a> covers when it makes coefficients misleading.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Ice-cream sales and drowning deaths rise together. Regress drownings on ice-cream alone and ice-cream gets a positive coefficient. Add temperature and ice-cream's coefficient drops to about zero: "holding temperature fixed", ice-cream has nothing to do with drowning.</p>
  </div>
  <h3>Units change the number, not the model</h3>
  <p>The rent data below has 300 simulated flats. Rent is in ₹ thousand per month, size in sq ft, distance to metro in km, building age in years. (Simulated so we know the truth: rent = 5 + 0.02·size − 1.5·metro − 0.1·age + city effect + noise with SD 3.)</p>
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
    <tr><td>y = b + w·x</td><td>+1 unit of x → +w units of y</td><td>w = 1.4: +1 year → +1.4 lakh</td></tr>
    <tr><td>log y = b + w·x</td><td>+1 unit of x → y multiplied by e^w, about +100·w %</td><td>w = 0.05: e^0.05 = 1.051 → +5.1% salary per year</td></tr>
    <tr><td>y = b + w·log x</td><td>+1% in x → +w/100 units of y</td><td>w = 30: 1% bigger flat → +0.3 thousand rent</td></tr>
    <tr><td>log y = b + w·log x</td><td>+1% in x → about +w % in y (elasticity)</td><td>w = −1.2: price +1% → demand −1.2%</td></tr>
  </table>
  <p>The "about" matters for big w: w = 0.5 in a log-y model means ×e^0.5 = ×1.649, a 64.9% rise, not 50%.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>In ŷ = b + Σwⱼxⱼ, <strong>wⱼ = ∂ŷ/∂xⱼ</strong>: the partial effect of xⱼ with all other included features held constant. A <strong>standardised coefficient</strong> is wⱼ·sd(xⱼ) (or wⱼ·sd(xⱼ)/sd(y)), the effect of a one-SD change.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Coefficients describe association in <em>this</em> data, not cause and effect. "Holding others fixed" may also be impossible: you cannot raise x while holding x² fixed in a polynomial model, or raise "size" while holding "number of rooms" fixed when they move together. And when features are strongly correlated the individual coefficients become unstable (see VIF in <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a>).</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We can read the weights. Is the line any good overall? We need a number for how well it fits.</div>

  <h2 id="lr-score"><span class="num">08</span>R² and RMSE (Brief)</h2>
  <h3>Comparing against the lazy model</h3>
  <p>Split the spread of y into two parts. <strong>SST</strong> (total sum of squares) = Σ(yᵢ − ȳ)² is the SSE of the flat line at ȳ, the lazy model. <strong>SSE</strong> is what our line leaves unexplained. <strong>SSR</strong> = Σ(ŷᵢ − ȳ)² is what the line explains. For OLS with an intercept, SST = SSR + SSE (the right angle of section 05).</p>
  <ul>
    <li>SST = 2.6² + 0.6² + 1.6² + 1.4² + 3.4² = 6.76 + 0.36 + 2.56 + 1.96 + 11.56 = <strong>23.2</strong></li>
    <li>SSE = <strong>3.6</strong> (section 03); SSR = 23.2 − 3.6 = <strong>19.6</strong></li>
    <li><strong>R² = 1 − SSE/SST</strong> = 1 − 3.6/23.2 = <strong>0.845</strong>: the line removes 84.5% of the squared error of always guessing 5.6.</li>
    <li><strong>RMSE</strong> = √(SSE/n) = √0.72 = <strong>0.849</strong> lakh: the typical miss, in salary units.</li>
    <li><strong>MAE</strong> = mean |e| = (0.2 + 0.8 + 1.6 + 0 + 0.6)/5 = <strong>0.64</strong> lakh.</li>
  </ul>
  <p>With one feature, R² equals the squared correlation r², and the slope equals r · s_y / s_x. Here r = S_xy / √(S_xx·S_yy) = 14 / √(10 × 23.2) = 14 / 15.23 = 0.919, r² = 0.845.</p>
  <div class="fx" data-lang="py">from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
pred5 = 1.4 + 1.4 * x
print(f"R2   {r2_score(y, pred5):.4f}")
print(f"RMSE {mean_squared_error(y, pred5) ** 0.5:.4f}   MAE {mean_absolute_error(y, pred5):.2f}")
print(f"corr(x, y) = {np.corrcoef(x, y)[0, 1]:.4f}  squared = {np.corrcoef(x, y)[0, 1] ** 2:.4f}")
print(f"r * sy/sx  = {np.corrcoef(x, y)[0, 1] * y.std() / x.std():.4f}  (the slope)")</div>
  <div class="fx" data-lang="text">R2   0.8448
RMSE 0.8485   MAE 0.64
corr(x, y) = 0.9191  squared = 0.8448
r * sy/sx  = 1.4000  (the slope)</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>R²</strong> (coefficient of determination) = 1 − SSE/SST: 1 is perfect, 0 is no better than the mean, negative (possible on test data) is worse than the mean. <strong>RMSE</strong> = √(Σe²/n), in y's units. <strong>Adjusted R²</strong> = 1 − (1 − R²)(n − 1)/(n − p) penalises extra parameters (p counts the intercept).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Training R² never decreases when you add a feature, even a column of random numbers, because the old solution is still available (set the new weight to 0). Judge models on held-out data (<a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a>), and see <a class="xref" data-note="ml_reg_metrics">Regression Metrics</a> for MAE, MAPE, RMSLE and when each fits the business.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> R² describes the fit. An analyst also wants to know: is the experience effect real or could it be luck with 5 people? How precise is the 1.4? That is what a statsmodels summary answers.</div>

  <h2 id="lr-sm"><span class="num">09</span>The statsmodels Summary, Line by Line</h2>
  <h3>The need</h3>
  <p>sklearn gives coefficients and predictions. Analysts, economists and anyone writing "experience has a significant effect" need <strong>uncertainty</strong>: standard errors, p-values and confidence intervals. statsmodels prints all of it in one table. Here it is for the 5 employees, and then we will rebuild every number by hand.</p>
  <div class="fx" data-lang="py">import warnings
import statsmodels.api as sm
warnings.filterwarnings("ignore")                   # n=5 is too small for the normality tests; silence their warnings
ols = sm.OLS(y, sm.add_constant(x)).fit()             # add_constant = the column of 1s
print(ols.summary(xname=["const", "experience"], yname="salary"))</div>
  <div class="fx" data-lang="text">                            OLS Regression Results                            
==============================================================================
Dep. Variable:                 salary   R-squared:                       0.845
Model:                            OLS   Adj. R-squared:                  0.793
Method:                 Least Squares   F-statistic:                     16.33
Date:                Mon, 19 Oct 2026   Prob (F-statistic):             0.0273
Time:                        11:24:22   Log-Likelihood:                -6.2734
No. Observations:                   5   AIC:                             16.55
Df Residuals:                       3   BIC:                             15.77
Df Model:                           1                                         
Covariance Type:            nonrobust                                         
==============================================================================
                 coef    std err          t      P&gt;|t|      [0.025      0.975]
------------------------------------------------------------------------------
const          1.4000      1.149      1.219      0.310      -2.256       5.056
experience     1.4000      0.346      4.041      0.027       0.298       2.502
==============================================================================
Omnibus:                          nan   Durbin-Watson:                   2.511
Prob(Omnibus):                    nan   Jarque-Bera (JB):                1.023
Skew:                          -1.100   Prob(JB):                        0.600
Kurtosis:                       2.737   Cond. No.                         8.37
==============================================================================

Notes:
[1] Standard Errors assume that the covariance matrix of the errors is correctly specified.</div>
  <h3>The top-left block: the setup</h3>
  <table class="tbl">
    <tr><th>Line</th><th>Value</th><th>Meaning</th></tr>
    <tr><td>Dep. Variable</td><td>salary</td><td>the target y</td></tr>
    <tr><td>Model / Method</td><td>OLS / Least Squares</td><td>ordinary least squares</td></tr>
    <tr><td>No. Observations</td><td>5</td><td>n</td></tr>
    <tr><td>Df Residuals</td><td>3</td><td>n − p = 5 − 2: rows left after estimating 2 parameters. Used for s² and the t-distribution.</td></tr>
    <tr><td>Df Model</td><td>1</td><td>number of features (p − 1, not counting the intercept)</td></tr>
    <tr><td>Covariance Type</td><td>nonrobust</td><td>classic standard errors that assume constant error variance; "HC3" etc. are the robust versions (<a class="xref" data-note="ml_reg_diag">Diagnostics</a>)</td></tr>
  </table>
  <h3>The top-right block: overall fit</h3>
  <p>All from SST = 23.2, SSR = 19.6, SSE = 3.6, n = 5, p = 2.</p>
  <ul>
    <li><strong>R-squared 0.845</strong> = 1 − 3.6/23.2.</li>
    <li><strong>Adj. R-squared 0.793</strong> = 1 − (1 − 0.845)·(5 − 1)/(5 − 2) = 1 − 0.155 × 1.333 = 0.793. Lower than R² because a parameter was spent.</li>
    <li><strong>F-statistic 16.33</strong> = (SSR / Df Model) / (SSE / Df Residuals) = (19.6/1) / (3.6/3) = 19.6 / 1.2 = 16.33. It tests "all slopes are 0" (the model is no better than the mean). With one feature F = t² of the slope: 4.041² = 16.33.</li>
    <li><strong>Prob (F-statistic) 0.0273</strong>: chance of an F this large if every true slope were 0. From the F(1, 3) distribution.</li>
    <li><strong>Log-Likelihood −6.2734</strong>: from section 05, −(n/2)(log 2π + log(SSE/n) + 1).</li>
    <li><strong>AIC 16.55</strong> = −2·logL + 2p = 12.547 + 4. <strong>BIC 15.77</strong> = −2·logL + p·ln n = 12.547 + 2 × 1.609. Lower is better when comparing models on the same y; BIC punishes extra parameters more when n &gt; 7.</li>
  </ul>
  <h3>The coefficient table, by hand</h3>
  <p><strong>1. Estimate the noise.</strong> s² = SSE / (n − p) = 3.6 / 3 = <strong>1.2</strong>, so s = 1.095 lakh. We divide by n − p, not n, because two parameters were fitted to these same 5 points, which makes residuals slightly smaller than the true errors; dividing by 3 corrects that (it makes s² unbiased).</p>
  <p><strong>2. Standard errors.</strong> The covariance matrix of the estimates is Cov(ŵ) = s²(XᵀX)⁻¹. From section 04, (XᵀX)⁻¹ = [[1.1, −0.3], [−0.3, 0.1]], so Cov = 1.2 × that = [[1.32, −0.36], [−0.36, 0.12]]. The square roots of the diagonal are the standard errors:</p>
  <ul>
    <li>se(b) = √1.32 = <strong>1.149</strong> (also = s·√(1/n + x̄²/S_xx) = 1.095·√(0.2 + 0.9))</li>
    <li>se(w) = √0.12 = <strong>0.346</strong> (also = s / √S_xx = 1.095 / √10)</li>
  </ul>
  <p>A standard error is the typical amount the estimate would change if we collected a fresh sample of 5 people. se(w) shrinks with more rows, more spread in x (bigger S_xx) and less noise (smaller s).</p>
  <p><strong>3. t-statistic</strong> = coef / se: t(w) = 1.4 / 0.346 = <strong>4.041</strong>; t(b) = 1.4 / 1.149 = <strong>1.219</strong>. "How many standard errors away from zero is the estimate?"</p>
  <p><strong>4. P&gt;|t|</strong>: if the true coefficient were 0, the chance of a t at least this far from 0, using a t-distribution with 3 degrees of freedom. 0.027 for the slope (below 0.05: "significant at 5%"), 0.310 for the intercept (cannot tell it from 0). See <a class="xref" data-note="st_hypothesis">Hypothesis Testing</a> for what a p-value is and is not.</p>
  <p><strong>5. 95% confidence interval</strong> = coef ± t₀.₉₇₅,₃ × se. With 3 degrees of freedom t₀.₉₇₅ = 3.182 (much wider than the normal 1.96 because n is tiny). Slope: 1.4 ± 3.182 × 0.346 = 1.4 ± 1.102 = <strong>[0.298, 2.502]</strong>. Intercept: 1.4 ± 3.656 = <strong>[−2.256, 5.056]</strong>.</p>
  <div class="fx" data-lang="py">from scipy import stats
n, p = 5, 2                                    # rows, fitted parameters (b and w)
sse = (res ** 2).sum(); sxx = (dx ** 2).sum()
s2 = sse / (n - p)                             # estimated error variance sigma-hat^2
se_w = np.sqrt(s2 / sxx)
se_b = np.sqrt(s2 * (1 / n + x.mean() ** 2 / sxx))
t_w, t_b = 1.4 / se_w, 1.4 / se_b
p_w = 2 * stats.t.sf(abs(t_w), df=n - p)       # two-sided p-value
p_b = 2 * stats.t.sf(abs(t_b), df=n - p)
tcrit = stats.t.ppf(0.975, df=n - p)
print(f"s^2={s2:.3f}  s={np.sqrt(s2):.4f}  t_crit(0.975, df=3)={tcrit:.3f}")
print(f"w: se={se_w:.4f}  t={t_w:.3f}  p={p_w:.4f}  CI=[{1.4 - tcrit*se_w:.3f}, {1.4 + tcrit*se_w:.3f}]")
print(f"b: se={se_b:.4f}  t={t_b:.3f}  p={p_b:.4f}  CI=[{1.4 - tcrit*se_b:.3f}, {1.4 + tcrit*se_b:.3f}]")
sst = (dy ** 2).sum(); ssr = sst - sse
F = (ssr / (p - 1)) / (sse / (n - p))
print(f"SST={sst:.1f} SSR={ssr:.1f} SSE={sse:.1f}  R2={1 - sse/sst:.4f}  adjR2={1 - (1 - (1 - sse/sst)) * (n - 1)/(n - p):.4f}")
print(f"F={F:.3f} (= t_w^2 = {t_w**2:.3f})  Prob(F)={stats.f.sf(F, p - 1, n - p):.4f}")
ll = -n / 2 * (np.log(2 * np.pi) + np.log(sse / n) + 1)
print(f"log-likelihood={ll:.4f}  AIC={-2*ll + 2*p:.3f}  BIC={-2*ll + p*np.log(n):.3f}")</div>
  <div class="fx" data-lang="text">s^2=1.200  s=1.0954  t_crit(0.975, df=3)=3.182
w: se=0.3464  t=4.041  p=0.0273  CI=[0.298, 2.502]
b: se=1.1489  t=1.219  p=0.3101  CI=[-2.256, 5.056]
SST=23.2 SSR=19.6 SSE=3.6  R2=0.8448  adjR2=0.7931
F=16.333 (= t_w^2 = 16.333)  Prob(F)=0.0273
log-likelihood=-6.2734  AIC=16.547  BIC=15.766</div>
  <p>Every number matches the summary. The <code>stats.t</code> calls replace the printed t-table you would use in an exam.</p>
  <h3>The bottom block: residual checks</h3>
  <table class="tbl">
    <tr><th>Line</th><th>Here</th><th>Meaning (details in <a class="xref" data-note="ml_reg_diag">Diagnostics</a>)</th></tr>
    <tr><td>Omnibus / Prob(Omnibus)</td><td>nan</td><td>a normality test of residuals that needs at least 8 rows</td></tr>
    <tr><td>Skew</td><td>−1.100</td><td>asymmetry of residuals (0 for normal); the −1.6 makes a left tail</td></tr>
    <tr><td>Kurtosis</td><td>2.737</td><td>tail heaviness (3 for normal)</td></tr>
    <tr><td>Jarque–Bera / Prob(JB)</td><td>1.023 / 0.600</td><td>JB = (n/6)(skew² + (kurt − 3)²/4) = (5/6)(1.21 + 0.017) = 1.023; p = 0.6, no evidence against normality</td></tr>
    <tr><td>Durbin–Watson</td><td>2.511</td><td>Σ(eₜ − eₜ₋₁)² / Σe² = (0.36 + 5.76 + 2.56 + 0.36)/3.6 = 9.04/3.6; near 2 = no autocorrelation</td></tr>
    <tr><td>Cond. No.</td><td>8.37</td><td>√(largest/smallest eigenvalue of XᵀX) = √(59.16/0.845); large values (&gt; 30 on standardised data, or the summary's warning) flag multicollinearity</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>Under the classic assumptions, <strong>Cov(ŵ) = σ²(XᵀX)⁻¹</strong>, estimated with s² = SSE/(n − p). <strong>se(ŵⱼ)</strong> = √[s²(XᵀX)⁻¹]ⱼⱼ; <strong>t = ŵⱼ / se</strong> follows a t-distribution with n − p degrees of freedom when the true wⱼ = 0 and errors are normal; <strong>CI = ŵⱼ ± t_{1−α/2, n−p} · se</strong>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>These standard errors are only right if the errors are independent with constant variance. A fan-shaped residual plot or time-ordered data can make the p-values far too small. "p = 0.027" also does not mean "97.3% chance the effect is real", and with large n tiny useless effects become "significant". Always read the size of the coefficient and its interval, not just the star.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> All our features have been numbers. City, department, fuel type are text. How does a weighted sum use them?</div>

  <h2 id="lr-cat"><span class="num">10</span>Categorical Predictors &amp; Dummy Variables</h2>
  <h3>The need</h3>
  <p>Rent depends heavily on the city, but "Mumbai" cannot be multiplied by a weight. Coding Delhi = 1, Mumbai = 2, Pune = 3 would force Pune's effect to be exactly "Mumbai's effect plus the same step again", an order and spacing that do not exist. The fix: one 0/1 <strong>dummy</strong> column per category, minus one.</p>
  <h3>By hand: 6 flats, 3 cities</h3>
  <table class="tbl">
    <tr><th>Flat</th><th>City</th><th>Rent</th><th>is_Mumbai</th><th>is_Pune</th></tr>
    <tr><td>1</td><td>Delhi</td><td>20</td><td>0</td><td>0</td></tr>
    <tr><td>2</td><td>Delhi</td><td>22</td><td>0</td><td>0</td></tr>
    <tr><td>3</td><td>Mumbai</td><td>30</td><td>1</td><td>0</td></tr>
    <tr><td>4</td><td>Mumbai</td><td>32</td><td>1</td><td>0</td></tr>
    <tr><td>5</td><td>Pune</td><td>15</td><td>0</td><td>1</td></tr>
    <tr><td>6</td><td>Pune</td><td>17</td><td>0</td><td>1</td></tr>
  </table>
  <p>Model: rent = b + w_M·is_Mumbai + w_P·is_Pune. Delhi (both dummies 0) is the <strong>reference category</strong>. Each city's prediction is one number, so least squares makes it that city's mean:</p>
  <ul>
    <li>Delhi: ŷ = b → b = mean(20, 22) = <strong>21</strong></li>
    <li>Mumbai: ŷ = b + w_M = mean(30, 32) = 31 → w_M = <strong>+10</strong></li>
    <li>Pune: ŷ = b + w_P = mean(15, 17) = 16 → w_P = <strong>−5</strong></li>
  </ul>
  <p>Reading: "a Mumbai flat rents for 10 thousand more than a comparable Delhi flat; Pune for 5 thousand less". Every dummy coefficient is a difference <em>from the reference</em>.</p>
  <div class="fx" data-lang="py">flats = pd.DataFrame({"city": ["Delhi", "Delhi", "Mumbai", "Mumbai", "Pune", "Pune"],
                      "rent": [20, 22, 30, 32, 15, 17]})
print(flats.groupby("city")["rent"].mean())
D = pd.get_dummies(flats["city"], drop_first=True, dtype=float)   # Delhi becomes the reference
print(D.assign(rent=flats["rent"]))
m = LinearRegression().fit(D, flats["rent"])
print("intercept:", round(m.intercept_, 3), " coefs:", {k: round(float(v), 3) for k, v in zip(D.columns, m.coef_)})</div>
  <div class="fx" data-lang="text">city
Delhi     21.0
Mumbai    31.0
Pune      16.0
Name: rent, dtype: float64
   Mumbai  Pune  rent
0     0.0   0.0    20
1     0.0   0.0    22
2     1.0   0.0    30
3     1.0   0.0    32
4     0.0   1.0    15
5     0.0   1.0    17
intercept: 21.0  coefs: {'Mumbai': 10.0, 'Pune': -5.0}</div>
  <p><code>pd.get_dummies(..., drop_first=True)</code> drops the first category alphabetically (Delhi) to make it the reference. The coefficients are the hand values.</p>
  <h3>The dummy-variable trap</h3>
  <p>Why drop one? If we keep all three dummies plus the intercept, is_Delhi + is_Mumbai + is_Pune = 1 on every row, which is exactly the intercept column. One column is a sum of others (perfect multicollinearity), XᵀX has determinant 0, and there are infinitely many equally good weight vectors.</p>
  <div class="fx" data-lang="py">D_all = pd.get_dummies(flats["city"], dtype=float)              # all 3 dummies, no drop
X_trap = np.c_[np.ones(6), D_all]                               # intercept + Delhi + Mumbai + Pune
print("columns: 1, Delhi, Mumbai, Pune -&gt; Delhi+Mumbai+Pune =", D_all.sum(axis=1).tolist())
print("rank of X:", np.linalg.matrix_rank(X_trap), "of", X_trap.shape[1], " det(X^T X):", round(np.linalg.det(X_trap.T @ X_trap), 6) + 0.0)
for shift in [0, 10]:                                           # two DIFFERENT weight vectors ...
    wv = np.array([21 - shift, 0 + shift, 10 + shift, -5 + shift])
    print(f"weights {wv.tolist()}  predictions {(X_trap @ wv).tolist()}")   # ... same predictions</div>
  <div class="fx" data-lang="text">columns: 1, Delhi, Mumbai, Pune -&gt; Delhi+Mumbai+Pune = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
rank of X: 3 of 4  det(X^T X): 0.0
weights [21, 0, 10, -5]  predictions [21.0, 21.0, 31.0, 31.0, 16.0, 16.0]
weights [11, 10, 20, 5]  predictions [21.0, 21.0, 31.0, 31.0, 16.0, 16.0]</div>
  <p>The design matrix has 4 columns but rank 3. Two very different weight vectors, [21, 0, 10, −5] and [11, 10, 20, 5], give identical predictions: you can move any amount between the intercept and all three dummies. Predictions are fine; the coefficients mean nothing. sklearn would silently return one of them, so drop one category (or drop the intercept, or use ridge).</p>
  <h3>With other features: statsmodels formulas</h3>
  <p>In a formula, <code>C(city)</code> creates the dummies and picks a reference automatically. On the 300 simulated flats:</p>
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
    <p><strong>Dummy (one-hot) coding with a reference:</strong> a categorical feature with k levels becomes k − 1 indicator columns. Each coefficient is the difference in mean outcome between that level and the reference level, holding other features fixed. Interactions such as <code>size:C(city)</code> let the slope differ by city (see <a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>(1) The coefficients depend on which level is the reference; change it and every dummy coefficient changes (predictions do not). (2) A category seen only in test data breaks the encoder; use <code>OneHotEncoder(handle_unknown="ignore")</code>. (3) Hundreds of levels (pin codes) make hundreds of columns; consider target encoding (<a class="xref" data-note="ml_features">Feature Engineering</a>) or regularisation.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We can predict a number for a new flat or a new employee. How wide should the band around that number be?</div>

  <h2 id="lr-pi"><span class="num">11</span>Prediction Intervals (Brief)</h2>
  <h3>Two different questions</h3>
  <ol>
    <li><strong>Confidence interval for the mean:</strong> "What is the average salary of <em>all</em> 6-year employees?" Uncertainty comes only from not knowing the true line.</li>
    <li><strong>Prediction interval:</strong> "What will <em>this one</em> new 6-year employee earn?" Uncertainty about the line <em>plus</em> that person's own noise ε.</li>
  </ol>
  <p>Formulas for one feature at a new point x₀:</p>
  <ul>
    <li>se_mean = s · √(1/n + (x₀ − x̄)²/S_xx)</li>
    <li>se_pred = s · √(1 + 1/n + (x₀ − x̄)²/S_xx) (the extra "1" is the new person's noise)</li>
    <li>interval = ŷ₀ ± t_{0.975, n−p} · se</li>
  </ul>
  <p><strong>By hand at x₀ = 6:</strong> ŷ₀ = 1.4 + 1.4 × 6 = 9.8. (x₀ − x̄)²/S_xx = 9/10 = 0.9. se_mean = 1.095·√(0.2 + 0.9) = 1.095 × 1.049 = 1.149. se_pred = 1.095·√(2.1) = 1.095 × 1.449 = 1.587. With t = 3.182: CI = 9.8 ± 3.656 = <strong>[6.14, 13.46]</strong>; PI = 9.8 ± 5.05 = <strong>[4.75, 14.85]</strong>.</p>
  <div class="fx" data-lang="py">x0 = 6.0                                                   # a 6-year employee
yhat0 = 1.4 + 1.4 * x0
s = np.sqrt(s2)
se_mean = s * np.sqrt(1 / n + (x0 - x.mean()) ** 2 / sxx)  # uncertainty of the LINE at x0
se_pred = s * np.sqrt(1 + 1 / n + (x0 - x.mean()) ** 2 / sxx)  # + one person's own noise
print(f"yhat={yhat0:.2f}  se_mean={se_mean:.4f}  se_pred={se_pred:.4f}")
print(f"95% CI for the mean : [{yhat0 - tcrit*se_mean:.3f}, {yhat0 + tcrit*se_mean:.3f}]")
print(f"95% prediction int. : [{yhat0 - tcrit*se_pred:.3f}, {yhat0 + tcrit*se_pred:.3f}]")
frame = ols.get_prediction(np.array([[1.0, x0]])).summary_frame(alpha=0.05)
print(frame.round(3).to_string(index=False))</div>
  <div class="fx" data-lang="text">yhat=9.80  se_mean=1.1489  se_pred=1.5875
95% CI for the mean : [6.144, 13.456]
95% prediction int. : [4.748, 14.852]
 mean  mean_se  mean_ci_lower  mean_ci_upper  obs_ci_lower  obs_ci_upper
  9.8    1.149          6.144         13.456         4.748        14.852</div>
  <p><code>get_prediction</code> returns both: <code>mean_ci_*</code> is the confidence interval, <code>obs_ci_*</code> the prediction interval. With only 5 people, a 6-year hire could plausibly earn anywhere from 4.7 to 14.9 lakh. With 300 flats the line is known precisely (mean_se 0.38), but individual flats still vary:</p>
  <div class="fx" data-lang="py">pf = full.get_prediction(pd.DataFrame({"size": [1000], "metro": [1.0], "age": [10], "city": ["Pune"]}))
print(pf.summary_frame(alpha=0.05).round(2).to_string(index=False))</div>
  <div class="fx" data-lang="text"> mean  mean_se  mean_ci_lower  mean_ci_upper  obs_ci_lower  obs_ci_upper
 19.8     0.38          19.04          20.55         13.94         25.65</div>
  <p>The CI for the average 1000 sq ft Pune flat is narrow (19.0 to 20.6) while the PI for one such flat is wide (13.9 to 25.7). More data shrinks the CI toward 0 width; the PI can never be narrower than about ±1.96 × noise SD (±5.8 here), however much data you collect.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A 95% <strong>prediction interval</strong> is a range that, under the model's assumptions (including normal, constant-variance errors), contains a <em>new observation</em> 95% of the time. It is always wider than the confidence interval for the mean at the same x₀. Both widen as x₀ moves away from x̄.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reporting the confidence interval when the business asked "how much will this flat rent for?" understates the risk badly (±0.8 vs ±5.9 above). Prediction intervals also rely on normal, constant-variance errors far more than coefficient tests do; check with <a class="xref" data-note="ml_reg_diag">Diagnostics</a>, or use quantile regression / conformal prediction when they fail.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> statsmodels is for inference. For a prediction pipeline (train/test split, encoders, deployment) the everyday tool is scikit-learn.</div>

  <h2 id="lr-sk"><span class="num">12</span>scikit-learn in Practice</h2>
  <h3>LinearRegression: what it has</h3>
  <table class="tbl">
    <tr><th>Item</th><th>Meaning</th></tr>
    <tr><td><code>fit_intercept=True</code></td><td>learn b. Set False only if the data are already centred or a column of 1s is in X.</td></tr>
    <tr><td><code>positive=False</code></td><td>True forces every coefficient ≥ 0 (non-negative least squares), e.g. for mixing proportions.</td></tr>
    <tr><td><code>copy_X</code>, <code>n_jobs</code></td><td>memory and parallelism details; results are identical.</td></tr>
    <tr><td><code>coef_</code>, <code>intercept_</code></td><td>the weights and b.</td></tr>
    <tr><td><code>rank_</code>, <code>singular_</code></td><td>rank of X and its singular values: a rank below the number of columns means a redundant column; a tiny last singular value means near-collinearity.</td></tr>
    <tr><td><code>score(X, y)</code></td><td>R² on the given data.</td></tr>
  </table>
  <p>No p-values, no standard errors: sklearn is built for prediction. For inference use statsmodels. For ridge/lasso use <code>Ridge</code>, <code>Lasso</code> (<a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a>); for very large data <code>SGDRegressor</code>.</p>
  <h3>End to end on the rent data</h3>
  <p>The plan: split 75/25 before anything else; fit numbers only; then add the city with a <code>OneHotEncoder(drop="first")</code> inside a <code>ColumnTransformer</code> so the encoder is learnt from the training rows only (<a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>); compare test scores; predict a new flat.</p>
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
  <div class="bridge"><b>What's still missing?</b> Libraries hide the mechanics. Writing the model ourselves and matching sklearn proves we understand every line.</div>

  <h2 id="lr-scratch"><span class="num">13</span>From Scratch, Matching scikit-learn</h2>
  <p>The class below has three solvers. <code>normal</code> solves XᵀXw = Xᵀy (section 04). <code>lstsq</code> uses the SVD. <code>gd</code> runs batch gradient descent (section 06) on standardised features, then converts the weights back to original units: if z = (x − μ)/σ, then w_x = w_z / σ and b = b_z − Σ μⱼ w_xⱼ. The test is sklearn's diabetes data (442 patients, 10 features, target = disease progression after one year).</p>
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
print("sklearn intercept", round(ref.intercept_, 3), " R2", round(ref.score(Xd, yd), 4))</div>
  <div class="fx" data-lang="text">normal intercept 152.133  max |coef - sklearn| = 1.59e-12  R2 0.5177
lstsq  intercept 152.133  max |coef - sklearn| = 1.48e-12  R2 0.5177
gd     intercept 152.133  max |coef - sklearn| = 3.81e-11  R2 0.5177
sklearn intercept 152.133  R2 0.5177</div>
  <p>All three agree with sklearn to about 10⁻¹¹ (floating-point noise). The scaling inside <code>gd</code> is not decoration: in the diabetes data every feature has a standard deviation of about 0.048, so without scaling the gradient steps are tiny. In a run without the two scaling lines, 20,000 steps at η = 0.1 still left coefficients wrong by up to 705 and R² at 0.5145 instead of 0.5177.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>The whole of linear regression fits in about 15 lines: add a 1s column, solve one linear system, and compute R² as 1 − SSE/SST. Everything else in this group (diagnostics, polynomial features, penalties) changes what goes into X or adds one term to the loss.</p>
  </div>

  <h2 id="lr-when"><span class="num">14</span>Strengths, Limits &amp; Comparisons</h2>
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

  <h2 id="lr-traps"><span class="num">15</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: judging by training R²</span>
    <p>Training R² can only go up as columns are added. Report test or cross-validated scores; use adjusted R², AIC or BIC when comparing nested models on the same data.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reading coefficient size as importance</span>
    <p>Size per sq ft was 0.0196 and per 100 sq ft 1.95: same model. Compare standardised coefficients, or better, permutation importance on test data.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting "holding the others fixed"</span>
    <p>Experience was worth 1.69 lakh alone and 1.0 with certifications. A coefficient's meaning depends on which other columns are in the model; adding or dropping a correlated column changes it.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: all k dummies plus an intercept</span>
    <p>The dummy trap makes XᵀX singular (rank 3 of 4) and coefficients arbitrary. Drop one level, and remember the coefficients are differences from that reference.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: inverting XᵀX</span>
    <p>Use <code>lstsq</code>, <code>solve</code> or <code>LinearRegression</code>, never <code>inv</code>. With near-duplicate columns, consider ridge.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: confidence interval instead of prediction interval</span>
    <p>For "what will this one case be", use the prediction interval (±5.9 thousand rent), not the CI of the mean (±0.8).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: extrapolating</span>
    <p>The salary line predicts 29.4 lakh at 20 years from data on 1–5 years. The model only knows the range it saw.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: skipping the residual plot</span>
    <p>A curved truth fit by a line can still have R² above 0.95. Plot residuals vs fitted values every time (<a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: "significant" = "important" or "causal"</span>
    <p>A p-value says the estimate is unlikely to be exactly 0 by luck under the assumptions. It says nothing about size, business value, or causation.</p>
  </div>

  <h2 id="lr-qa"><span class="num">16</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the least-squares slope and intercept for one feature.</summary><div class="qa-body">SSE = Σ(yᵢ − wxᵢ − b)². ∂/∂b = −2Σ(yᵢ − wxᵢ − b) = 0 gives b = ȳ − wx̄. ∂/∂w = −2Σxᵢ(yᵢ − wxᵢ − b) = 0; substituting b and using Σ(xᵢ − x̄) = 0 gives w = Σ(xᵢ − x̄)(yᵢ − ȳ)/Σ(xᵢ − x̄)² = S_xy/S_xx = cov(x, y)/var(x). The second derivatives are positive, so it is a minimum.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Fit a line by hand to (1, 2), (2, 4), (3, 5).</summary><div class="qa-body">x̄ = 2, ȳ = 11/3. dx = −1, 0, 1; dy = −5/3, 1/3, 4/3. S_xy = 5/3 + 0 + 4/3 = 3, S_xx = 2, so w = 1.5 and b = 11/3 − 3 = 2/3 ≈ 0.667. Residuals: 2 − 2.167 = −0.167, 4 − 3.667 = 0.333, 5 − 5.167 = −0.167; they sum to 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the normal equation. When is the solution unique?</summary><div class="qa-body">SSE = ‖y − Xw‖² = yᵀy − 2wᵀXᵀy + wᵀXᵀXw; gradient −2Xᵀy + 2XᵀXw = 0 gives XᵀXw = Xᵀy, so w = (XᵀX)⁻¹Xᵀy. It is unique when X has full column rank (no column is a combination of others), which makes XᵀX invertible and the loss strictly convex. Duplicated columns or all k dummies with an intercept break this.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain the geometry of OLS.</summary><div class="qa-body">ŷ = Xw lies in the column space of X; OLS picks the point closest to y, the orthogonal projection ŷ = Hy with H = X(XᵀX)⁻¹Xᵀ. The residual is perpendicular to every column (Xᵀe = 0), which is the normal equation. Pythagoras gives SST = SSR + SSE when there is an intercept.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Normal equation or gradient descent: which and when?</summary><div class="qa-body">Closed form (via SVD/solve) is exact with no tuning, cost O(nd² + d³): best up to thousands of features and data in memory. Gradient descent costs O(nd) per pass, streams data, works for any differentiable loss, but needs a learning rate, iterations and scaled features. sklearn: LinearRegression vs SGDRegressor.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A coefficient on experience is 1.69 alone but 1.0 when certifications are added. Explain.</summary><div class="qa-body">Coefficients are partial effects, holding the other columns fixed. Experience and certifications are correlated (0.72). Alone, experience absorbs certifications' effect: simple slope = w₁ + w₂·δ = 1.0 + 2.0 × (6/17.5) = 1.686, where δ is the slope of certifications on experience. This is omitted-variable bias.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How are the standard errors in a regression summary computed?</summary><div class="qa-body">s² = SSE/(n − p) estimates the noise variance (dividing by n − p because p parameters were fitted). Cov(ŵ) = s²(XᵀX)⁻¹, and the standard errors are the square roots of its diagonal. One feature: se(w) = s/√S_xx. On the 5 employees: s² = 1.2, (XᵀX)⁻¹ diag = 1.1 and 0.1, se = 1.149 and 0.346.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What do t, P&gt;|t| and the confidence interval in the coefficient table mean?</summary><div class="qa-body">t = coefficient / standard error: how many SEs from zero. P&gt;|t| is the probability of a t at least that extreme if the true coefficient were 0 (t-distribution, n − p df). The 95% CI is coef ± t₀.₉₇₅ × se, the range of true values compatible with the data. Slope 1.4, se 0.346, t 4.04, p 0.027, CI [0.30, 2.50].</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>R² vs adjusted R²: why both?</summary><div class="qa-body">R² = 1 − SSE/SST never decreases when features are added. Adjusted R² = 1 − (1 − R²)(n − 1)/(n − p) charges for each parameter, so it can fall when a useless feature is added. Neither replaces a held-out test score.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you include a categorical feature with 3 levels? What is the dummy trap?</summary><div class="qa-body">Create k − 1 = 2 indicator columns; the dropped level is the reference and each coefficient is the mean difference from it (Delhi 21, Mumbai +10, Pune −5). Including all k dummies plus an intercept makes the dummies sum to the intercept column: perfect multicollinearity, singular XᵀX, infinitely many solutions with identical predictions.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Confidence interval vs prediction interval?</summary><div class="qa-body">The CI covers the mean response at x₀ (uncertainty in the line: s√(1/n + (x₀ − x̄)²/S_xx)). The PI covers a single new observation, adding the noise term: s√(1 + 1/n + …). The PI is always wider and does not shrink to zero with more data. At x₀ = 6: CI [6.14, 13.46], PI [4.75, 14.85].</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is OLS the same as maximum likelihood?</summary><div class="qa-body">If yᵢ = xᵢᵀw + εᵢ with εᵢ ~ N(0, σ²) independent, the log-likelihood is −(n/2)log(2πσ²) − SSE/(2σ²). For any σ², it is maximised by minimising SSE. That is why statsmodels can print a log-likelihood, AIC and BIC for OLS.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does Gauss–Markov say and not say?</summary><div class="qa-body">With a correct linear model, zero-mean, equal-variance, uncorrelated errors, OLS is the Best Linear Unbiased Estimator (lowest variance among linear unbiased estimators). It does not need normality, and it does not say OLS has the lowest total error: biased methods like ridge can beat it on test error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does logistic regression reuse this note?</summary><div class="qa-body">It keeps the weighted sum z = Xw but passes it through a sigmoid to get a probability, and replaces the Gaussian likelihood (squared loss) with a Bernoulli likelihood (log-loss). There is no closed form, so it is fitted iteratively, like section 06. Coefficients become changes in log-odds. See Logistic Regression.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what do the three sibling notes fix?</summary><div class="qa-body">Assumptions &amp; Diagnostics: whether the standard errors, p-values and intervals here can be trusted (residual plots, VIF, Cook's distance). Polynomial &amp; Basis Functions: the straight-line limit, by adding x², splines etc. while staying linear in the weights. Ridge, Lasso &amp; Elastic Net: unstable weights with many or correlated columns, by adding a penalty: (XᵀX + λI)⁻¹Xᵀy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>LinearRegression().fit([[1],[2],[3]], [2,4,6]).coef_</code></summary><div class="qa-body"><code>array([2.])</code> with intercept ≈ 0: the points lie exactly on y = 2x, so every residual is 0 and R² = 1.</div></details>
</main>
`
});
