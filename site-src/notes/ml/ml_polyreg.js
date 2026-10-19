// notes/ml/ml_polyreg.js — Polynomial & Basis Functions
Object.assign(TOPIC_CONTENT, {
  "ml_polyreg": `<main>
  <h1>Polynomial Regression &amp; Basis Functions</h1>
  <div class="where"><span>Machine Learning</span><span>Regression</span><span>Polynomial &amp; Basis Functions</span></div>
  <p class="lead">Linear regression can only draw straight lines, yet the world is full of curves: stopping distance grows faster than speed, sales saturate, demand peaks in the afternoon. This note shows the one trick that fixes it without a new algorithm: <em>feed linear regression new columns</em> (x², x³, x₁·x₂, hinges, splines, bumps) and let it find the weights as before. Every formula is worked by hand on five braking-test rows first, then checked in code: fitting a curve by hand, building polynomial features, watching degree cause overfitting, why powers must be scaled, interaction terms, splines and radial basis functions, choosing the degree by cross-validation, and why high degrees need ridge or lasso.</p>

  <h2 id="pr-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 230" width="640">
<defs><marker id="pr-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="230" y="10" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="35" text-anchor="middle" font-size="13">Linear Regression</text>
<rect x="20" y="95" width="190" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="115" y="120" text-anchor="middle" font-size="13">Assumptions &amp; Diagnostics</text>
<rect x="225" y="88" width="190" height="54" rx="8" class="fb sb" stroke-width="3"/><text x="320" y="111" text-anchor="middle" font-size="13" font-weight="700">Polynomial &amp; Basis</text><text x="320" y="129" text-anchor="middle" font-size="11" class="tb">YOU ARE HERE</text>
<rect x="225" y="178" width="190" height="40" rx="8" class="fg sg"/><text x="320" y="203" text-anchor="middle" font-size="13">Ridge, Lasso &amp; Elastic Net</text>
<rect x="450" y="95" width="170" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.3"/><text x="535" y="113" text-anchor="middle" font-size="12" class="tm">Bias–Variance,</text><text x="535" y="128" text-anchor="middle" font-size="12" class="tm">Regularization</text>
<line x1="290" y1="50" x2="140" y2="93" stroke="currentColor" marker-end="url(#pr-a0)"/>
<line x1="320" y1="50" x2="320" y2="86" stroke="currentColor" marker-end="url(#pr-a0)"/>
<line x1="140" y1="135" x2="250" y2="150" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#pr-a0)"/>
<text x="120" y="160" font-size="11" class="tm">curved residuals</text>
<line x1="320" y1="142" x2="320" y2="176" stroke="currentColor" marker-end="url(#pr-a0)"/>
<text x="330" y="164" font-size="11" class="tm">too many columns → penalise</text>
<line x1="450" y1="115" x2="417" y2="115" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#pr-a0)"/>
</svg><figcaption>The Regression group. Polynomial and basis features take the straight-line model from Linear Regression and bend it; the column explosion they cause is what Ridge, Lasso and Elastic Net control.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_regression">Linear Regression</a> and <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a></b><span>You can fit ŷ = b₀ + b₁x₁ + … by least squares and read its coefficients. The diagnostics note showed what goes wrong when the true relation is curved: the residual plot makes a "smile" (positive at both ends, negative in the middle), the linearity assumption fails, and the line is wrong in a systematic way that more data will not fix.</span></li>
    <li><b>This note adds: curves with the same machinery</b><span>Make new columns from the old ones (x², x³, x₁·x₂, max(0, x − 3), Gaussian bumps, spline pieces) and run ordinary linear regression on them. The model stays linear in its <em>weights</em>, so the normal equation, statsmodels summaries and every diagnostic still apply. You will learn how to build these columns, how many you get, why they must be scaled, how degree causes overfitting and how to choose it by cross-validation.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a></b><span>Polynomial columns multiply fast (10 inputs at degree 3 = 285 columns), are strongly correlated with each other, and let the fit chase noise. The cure is to penalise big weights. The general idea is in <a class="xref" data-note="ml_regularization">Regularization</a>; the bias–variance reason it works is in <a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a>. Trees (<a class="xref" data-note="ml_dtree">Decision Trees</a>) are the other road to curves: they build step functions automatically.</span></li>
  </ol>
  <p>You should know least squares and the normal equation (<a class="xref" data-note="ml_regression">Linear Regression</a>) and what a train/validation split is (<a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a>). Each is recalled in a line where it is used.</p>

  <h2 id="pr-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Polynomial &amp; Basis Functions</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">1 · The problem &amp; the trick</div>
        <ul>
          <li>Curved truth + straight line → residual <b>smile</b>, SSE 14.4 on 5 braking rows</li>
          <li><b>Trick</b>: add columns x², x³ … then run plain linear regression</li>
          <li><b>Linear in the weights</b>, not in x → OLS, normal equation, p-values all still work</li>
          <li>Braking fit: ŷ = 3.2 − 1.4x + x², SSE 0.4</li>
          <li>Slope of a quadratic = b₁ + 2b₂x (changes with x); turning point x = −b₁ / (2b₂)</li>
          <li>💡 Same oven, new ingredients: the recipe (OLS) never changes</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">2 · Polynomial features</div>
        <ul>
          <li>(a, b), degree 2 → 1, a, b, a², ab, b²</li>
          <li>Count (no bias) = C(k + d, d) − 1: 10 inputs → 65 (d=2), 285 (d=3), 1,000 (d=4)</li>
          <li><code>PolynomialFeatures(degree, interaction_only, include_bias)</code></li>
          <li>statsmodels: <code>y ~ x + I(x**2)</code>; <code>a*b</code> = a + b + a:b</li>
          <li>⚠ Column explosion → overfitting + slow</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">3 · Degree &amp; overfitting</div>
        <ul>
          <li>n points → degree n − 1 passes through all (train error 0)</li>
          <li>Train error always falls with degree; test error is a <b>U</b></li>
          <li>Sine data: deg 1 test 0.58 · deg 3 test 0.33 · deg 15 test 0.55</li>
          <li>Weights explode (deg 15 max |w| ≈ 4,800) → wild wiggles at the edges (Runge)</li>
          <li>⚠ Extrapolation: deg 15 predicts −214 at x = 1.1 (truth 0.59)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">4 · Scaling &amp; collinearity</div>
        <ul>
          <li>corr(x, x²) = 0.981 for x = 1..5; <b>0</b> after centring</li>
          <li>Years 2000–2010: x³ ≈ 8·10⁹, cond(XᵀX) ≈ 10²² → numerically broken</li>
          <li>Centre / standardise → cond ≈ 38</li>
          <li>Same curve, different b₀, b₁ (they describe x = 0); predictions identical</li>
          <li>Orthogonal polynomials make columns uncorrelated (hand trick: z, z² − 2)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">5 · Interactions</div>
        <ul>
          <li>ŷ = b₀ + b₁a + b₂b + b₃·a·b → slope of a = b₁ + b₃·b</li>
          <li>TV × radio: CV R² 0.933 → 0.969; TV slope 1.99 / 2.96 / 3.92 at radio 0 / 2 / 4</li>
          <li>Category × number = a different slope per group</li>
          <li><b>Hierarchy</b>: keep a and b when you keep a·b</li>
          <li>Trees find interactions on their own; linear models need them typed in</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">6 · Basis functions</div>
        <ul>
          <li>ŷ = Σ wⱼ φⱼ(x): choose the φ's, OLS finds the w's</li>
          <li><b>Steps</b> (bins) · <b>hinge</b> max(0, x − c) · <b>splines</b> (pieces joined smoothly at knots)</li>
          <li><b>B-splines</b>: local bumps that sum to 1; cubic, 5 knots → 7 columns</li>
          <li><b>RBF</b>: exp(−(x − c)² / 2s²), a bump at each centre c</li>
          <li>Local bases do not explode outside the data; polynomials do</li>
          <li>Kernels (SVM), GAMs and neural nets are all "learned or many basis functions"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">7 · Choosing &amp; taming</div>
        <ul>
          <li>Pick degree / knots by <b>cross-validation</b>, never by training error</li>
          <li>Sine data 5-fold CV: degree 3 best (MSE 0.037)</li>
          <li><b>1-SE rule</b>: simplest model within one standard error of the best</li>
          <li>Grid name: <code>polynomialfeatures__degree</code></li>
          <li>Deg 15 + Ridge(1e-3): test 0.548 → 0.325; Lasso keeps 4 of 15 powers</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pr-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">When a Line Is Not Enough</span><span class="rm-sub">Curves, residual smiles, by hand</span></div></div>
      <div class="rm-item rm-done" data-target="pr-trick"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">New Columns, Same Regression</span><span class="rm-sub">A quadratic fitted by hand</span></div></div>
      <div class="rm-item rm-done" data-target="pr-features"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Polynomial Features</span><span class="rm-sub">Expansion and counting</span></div></div>
      <div class="rm-item rm-done" data-target="pr-overfit"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Degree vs Overfitting</span><span class="rm-sub">The U-curve, edges, extrapolation</span></div></div>
      <div class="rm-item rm-done" data-target="pr-scale"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Scaling &amp; Collinearity</span><span class="rm-sub">Why powers must be centred</span></div></div>
      <div class="rm-item rm-done" data-target="pr-inter"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Interaction Terms</span><span class="rm-sub">When one effect depends on another</span></div></div>
      <div class="rm-item rm-done" data-target="pr-basis"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Basis Functions</span><span class="rm-sub">Steps, hinges, splines, RBF</span></div></div>
      <div class="rm-item rm-done" data-target="pr-cv"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Choosing the Degree by CV</span><span class="rm-sub">Fold table, 1-SE rule, grid search</span></div></div>
      <div class="rm-item rm-done" data-target="pr-reg"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Taming It with Regularization</span><span class="rm-sub">Ridge and lasso on degree 15</span></div></div>
      <div class="rm-item rm-done" data-target="pr-compare"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Comparisons</span><span class="rm-sub">Polynomials vs splines vs trees</span></div></div>
      <div class="rm-item rm-done" data-target="pr-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Scaling, leakage, extrapolation</span></div></div>
      <div class="rm-item rm-done" data-target="pr-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="pr-need"><span class="num">01</span>When a Straight Line Is Not Enough</h2>
  <h3>The need</h3>
  <p>Many real relationships bend. A car's stopping distance grows faster than its speed (double the speed, roughly four times the braking distance, because kinetic energy is ½mv²). Ice-cream sales rise with temperature, then drop in a heatwave when people stay indoors. A salary rises quickly in the first years of a career, then flattens. Electricity demand in a city peaks in the afternoon and dips at night.</p>
  <p>Linear regression assumes ŷ = b₀ + b₁x: every extra unit of x adds the <em>same</em> amount b₁ to the prediction, everywhere. For a curve that is false. No tilt of a straight line can follow a bend, so the errors are not random: they have a shape.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Trying to trace a cricket ball's arc with a ruler. However you hold the ruler, it is above the ball in the middle of the flight and below it at both ends. The ruler is not badly placed; it is the wrong tool. You need a flexible curve, and the cheapest flexible curve is a ruler that is allowed to bend in a controlled way.</p>
  </div>
  <h3>The data: a toy braking test</h3>
  <p>Five braking tests. x is the speed in tens of km/h (so x = 3 means 30 km/h), y is the stopping distance in metres. Small numbers on purpose, so everything can be done with a pencil.</p>
  <table class="tbl">
    <tr><th>test</th><th>speed (km/h)</th><th>x</th><th>stopping distance y (m)</th></tr>
    <tr><td>1</td><td>10</td><td>1</td><td>3</td></tr>
    <tr><td>2</td><td>20</td><td>2</td><td>4</td></tr>
    <tr><td>3</td><td>30</td><td>3</td><td>8</td></tr>
    <tr><td>4</td><td>40</td><td>4</td><td>14</td></tr>
    <tr><td>5</td><td>50</td><td>5</td><td>21</td></tr>
  </table>
  <h3>Worked by hand: the best straight line</h3>
  <p>Recall from <a class="xref" data-note="ml_regression">Linear Regression</a>: slope = Σ(dx·dy) / Σdx², where dx = x − x̄ and dy = y − ȳ; intercept = ȳ − slope·x̄. Here x̄ = 15/5 = 3 and ȳ = 50/5 = 10.</p>
  <table class="tbl out"><caption>x̄ = 3, ȳ = 10</caption>
    <tr><th>x</th><th>y</th><th>dx</th><th>dy</th><th>dx·dy</th><th>dx²</th></tr>
    <tr><td>1</td><td>3</td><td>−2</td><td>−7</td><td>14</td><td>4</td></tr>
    <tr><td>2</td><td>4</td><td>−1</td><td>−6</td><td>6</td><td>1</td></tr>
    <tr><td>3</td><td>8</td><td>0</td><td>−2</td><td>0</td><td>0</td></tr>
    <tr><td>4</td><td>14</td><td>1</td><td>4</td><td>4</td><td>1</td></tr>
    <tr><td>5</td><td>21</td><td>2</td><td>11</td><td>22</td><td>4</td></tr>
    <tr><td colspan="4"><strong>sum</strong></td><td><strong>46</strong></td><td><strong>10</strong></td></tr>
  </table>
  <p>Slope = 46 / 10 = <strong>4.6</strong> m per 10 km/h. Intercept = 10 − 4.6 × 3 = <strong>−3.8</strong>. So the line is ŷ = −3.8 + 4.6x. Now the residuals (real minus predicted):</p>
  <table class="tbl out"><caption>The straight line's errors</caption>
    <tr><th>x</th><th>y</th><th>ŷ = −3.8 + 4.6x</th><th>residual y − ŷ</th><th>sign</th><th>residual²</th></tr>
    <tr><td>1</td><td>3</td><td>0.8</td><td>+2.2</td><td>+</td><td>4.84</td></tr>
    <tr><td>2</td><td>4</td><td>5.4</td><td>−1.4</td><td>−</td><td>1.96</td></tr>
    <tr><td>3</td><td>8</td><td>10.0</td><td>−2.0</td><td>−</td><td>4.00</td></tr>
    <tr><td>4</td><td>14</td><td>14.6</td><td>−0.6</td><td>−</td><td>0.36</td></tr>
    <tr><td>5</td><td>21</td><td>19.2</td><td>+1.8</td><td>+</td><td>3.24</td></tr>
    <tr><td colspan="5"><strong>SSE (sum of squared errors)</strong></td><td><strong>14.40</strong></td></tr>
  </table>
  <p>Look at the signs: <strong>+ − − − +</strong>. The line is too low at both ends and too high in the middle. Random errors would have mixed signs in no pattern. A run of signs like this, plotted against x, is the "residual smile", the fingerprint of a missed curve. It also gives a silly answer at 10 km/h: the line says 0.8 m, while the car actually needed 3 m.</p>
  <figure class="viz"><svg viewBox="0 0 560 250" width="560">
<line x1="40" y1="220" x2="540" y2="220" stroke="currentColor"/><line x1="40" y1="10" x2="40" y2="220" stroke="currentColor"/>
<text x="32" y="224" text-anchor="end" class="tm" font-size="11">0</text><text x="32" y="144" text-anchor="end" class="tm" font-size="11">10</text><text x="32" y="64" text-anchor="end" class="tm" font-size="11">20</text>
<text x="80" y="236" text-anchor="middle" class="tm" font-size="11">1</text><text x="180" y="236" text-anchor="middle" class="tm" font-size="11">2</text><text x="280" y="236" text-anchor="middle" class="tm" font-size="11">3</text><text x="380" y="236" text-anchor="middle" class="tm" font-size="11">4</text><text x="480" y="236" text-anchor="middle" class="tm" font-size="11">5</text>
<text x="535" y="212" text-anchor="end" class="tm" font-size="11">x = speed / 10 km/h</text>
<line x1="40" y1="228" x2="520" y2="52" class="sr" stroke-width="2"/>
<polyline points="40,198 60,198 80,198 100,196 120,194 140,192 160,189 180,185 200,180 220,175 240,169 260,163 280,156 300,148 320,140 340,131 360,121 380,111 400,100 420,89 440,77 460,64 480,50 500,36 520,22" fill="none" class="sb" stroke-width="2.2"/>
<line x1="80" y1="196" x2="80" y2="214" class="sr" stroke-dasharray="3 2"/><line x1="180" y1="188" x2="180" y2="177" class="sr" stroke-dasharray="3 2"/><line x1="280" y1="156" x2="280" y2="140" class="sr" stroke-dasharray="3 2"/><line x1="380" y1="108" x2="380" y2="103" class="sr" stroke-dasharray="3 2"/><line x1="480" y1="52" x2="480" y2="66" class="sr" stroke-dasharray="3 2"/>
<circle cx="80" cy="196" r="5" class="ft st"/><circle cx="180" cy="188" r="5" class="ft st"/><circle cx="280" cy="156" r="5" class="ft st"/><circle cx="380" cy="108" r="5" class="ft st"/><circle cx="480" cy="52" r="5" class="ft st"/>
<text x="60" y="30" class="tr" font-size="12.5">line ŷ = −3.8 + 4.6x   (SSE 14.4)</text>
<text x="60" y="50" class="tb" font-size="12.5">curve ŷ = 3.2 − 1.4x + x²   (SSE 0.4)</text>
<text x="290" y="135" class="tr" font-size="11">−2.0</text><text x="88" y="212" class="tr" font-size="11">+2.2</text><text x="488" y="64" class="tr" font-size="11">+1.8</text>
</svg><figcaption>The five braking tests. The red line misses in a pattern (above in the middle, below at the ends, dashed gaps). The blue quadratic, found in section 02, passes almost through every point.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p>A relationship is <strong>nonlinear</strong> in x when the change in y caused by a one-unit change in x depends on where you are (it is not a constant b₁). Its sign in a fitted linear model: <strong>residuals with a pattern</strong> against x or against ŷ (a smile, a frown, an S), not a random cloud around zero.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A high R² does not prove the relation is straight. This line has R² = 1 − 14.4 / 226 = 0.94 (Σdy² = 49 + 36 + 4 + 16 + 121 = 226), which looks excellent, yet it is systematically wrong at both ends. Always look at the residual plot (<a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a>).</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We need a curve, but we do not want to throw away everything we know about linear regression (least squares, the normal equation, p-values, diagnostics). Is there a way to get curves while keeping all of it?</div>

  <h2 id="pr-trick"><span class="num">02</span>The Trick: New Columns, Same Linear Regression</h2>
  <h3>Plain words</h3>
  <p>Linear regression multiplies each <em>column</em> by a weight and adds them up. It does not care what the columns are. So make a new column, x², and put it next to x. The model becomes</p>
  <p style="text-align:center"><strong>ŷ = b₀ + b₁·x + b₂·x²</strong></p>
  <p>As a function of x this is a parabola, a curve. But as a function of the weights b₀, b₁, b₂ it is still "weight × column, added up", exactly the form least squares knows how to solve. Nothing in the fitting changes. Only the table changes: it now has a column whose values are 1, 4, 9, 16, 25.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A tailor who can only cut straight lines can still make a round collar: give him many short straight pieces to join, or a pre-curved piece of cloth. Linear regression is the tailor; x², x³ and friends are pre-curved pieces. He still only decides how much of each piece to use.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Polynomial regression of degree d</strong>: ŷ = b₀ + b₁x + b₂x² + … + b_d x^d, fitted by ordinary least squares on the columns x, x², …, x^d. It is a <strong>linear model</strong> because it is linear in the parameters b: doubling one weight doubles its contribution, and the loss is a bowl in the weights with one minimum. "Linear model" never meant "straight line in x".</p>
  </div>
  <h3>Worked by hand: fitting the quadratic</h3>
  <p>With three columns [1, x, x²], the normal equation (XᵀX)b = Xᵀy is a 3 × 3 system. Here it is, every entry being a sum you can check: Σ1 = 5, Σx = 15, Σx² = 55, Σx³ = 225, Σx⁴ = 979, Σy = 50, Σxy = 196, Σx²y = 840.</p>
  <table class="tbl out"><caption>Normal equation with raw columns</caption>
    <tr><th></th><th>b₀</th><th>b₁</th><th>b₂</th><th>= right side</th></tr>
    <tr><td>row 1</td><td>5</td><td>15</td><td>55</td><td>50</td></tr>
    <tr><td>row 2</td><td>15</td><td>55</td><td>225</td><td>196</td></tr>
    <tr><td>row 3</td><td>55</td><td>225</td><td>979</td><td>840</td></tr>
  </table>
  <p>Solvable by elimination, but painful, and notice how fast the numbers grow (979 already, for x only up to 5). There is a much neater route that also teaches the most important practical lesson of this note: <strong>centre x first</strong>.</p>
  <p>Let z = x − 3, so z = −2, −1, 0, 1, 2. Then z² = 4, 1, 0, 1, 4, whose average is 2. Use the column q = z² − 2 = 2, −1, −2, −1, 2 instead of z². Now check three facts: Σz = 0, Σq = 0, and Σz·q = (−4) + 1 + 0 + (−1) + 4 = 0. The three columns [1, z, q] are <strong>orthogonal</strong>: they do not overlap at all. When columns are orthogonal, XᵀX is diagonal, and each weight can be computed on its own as Σ(column·y) / Σ(column²).</p>
  <table class="tbl out"><caption>Orthogonal columns: each weight is one division</caption>
    <tr><th>column</th><th>values</th><th>Σ column·y</th><th>Σ column²</th><th>weight</th></tr>
    <tr><td>1</td><td>1, 1, 1, 1, 1</td><td>3 + 4 + 8 + 14 + 21 = 50</td><td>5</td><td><strong>10</strong></td></tr>
    <tr><td>z</td><td>−2, −1, 0, 1, 2</td><td>−6 − 4 + 0 + 14 + 42 = 46</td><td>10</td><td><strong>4.6</strong></td></tr>
    <tr><td>q = z² − 2</td><td>2, −1, −2, −1, 2</td><td>6 − 4 − 16 − 14 + 42 = 14</td><td>14</td><td><strong>1.0</strong></td></tr>
  </table>
  <p>So ŷ = 10 + 4.6z + 1.0·(z² − 2). Notice that the weight on z (4.6) is exactly the slope of the straight line: adding an orthogonal column did not disturb it. Now translate back to x by putting z = x − 3:</p>
  <p style="text-align:center">ŷ = 10 + 4.6(x − 3) + (x − 3)² − 2 = 10 − 13.8 − 2 + 9 + (4.6 − 6)x + x² = <strong>3.2 − 1.4x + x²</strong></p>
  <table class="tbl out"><caption>The quadratic's errors</caption>
    <tr><th>x</th><th>y</th><th>ŷ = 3.2 − 1.4x + x²</th><th>residual</th><th>residual²</th></tr>
    <tr><td>1</td><td>3</td><td>3.2 − 1.4 + 1 = 2.8</td><td>+0.2</td><td>0.04</td></tr>
    <tr><td>2</td><td>4</td><td>3.2 − 2.8 + 4 = 4.4</td><td>−0.4</td><td>0.16</td></tr>
    <tr><td>3</td><td>8</td><td>3.2 − 4.2 + 9 = 8.0</td><td>0.0</td><td>0.00</td></tr>
    <tr><td>4</td><td>14</td><td>3.2 − 5.6 + 16 = 13.6</td><td>+0.4</td><td>0.16</td></tr>
    <tr><td>5</td><td>21</td><td>3.2 − 7.0 + 25 = 21.2</td><td>−0.2</td><td>0.04</td></tr>
    <tr><td colspan="4"><strong>SSE</strong></td><td><strong>0.40</strong></td></tr>
  </table>
  <p>SSE drops from 14.4 to 0.4, and the residual signs are now + − 0 + −: no pattern. R² = 1 − 0.4 / 226 = 0.998.</p>
  <h3>Check it in code</h3>
  <p>First the two routes from scratch: the raw normal equation, and the orthogonal centred columns where each weight is a single division. They must agree.</p>
  <div class="fx" data-lang="py">import numpy as np
x = np.array([1, 2, 3, 4, 5.0]); y = np.array([3, 4, 8, 14, 21.0])

# 1) raw columns [1, x, x^2] and the normal equation (X^T X) w = X^T y
X = np.c_[np.ones(5), x, x**2]
print("X^T X =", (X.T @ X).astype(int).tolist(), " X^T y =", (X.T @ y).astype(int).tolist())
print("w (raw)     =", np.linalg.solve(X.T @ X, X.T @ y).round(3))

# 2) centred, orthogonal columns [1, z, z^2 - 2]: each weight is sum(col*y) / sum(col^2)
z = x - 3; q = z**2 - 2
for name, col in [("1", np.ones(5)), ("z", z), ("z^2-2", q)]:
    print(f"col {name:6s} {col.astype(int).tolist()}  sum(col*y)={col @ y:5.0f}  sum(col^2)={col @ col:3.0f}  weight={col @ y / (col @ col):.2f}")</div>
  <div class="fx" data-lang="text">X^T X = [[5, 15, 55], [15, 55, 225], [55, 225, 979]]  X^T y = [50, 196, 840]
w (raw)     = [ 3.2 -1.4  1. ]
col 1      [1, 1, 1, 1, 1]  sum(col*y)=   50  sum(col^2)=  5  weight=10.00
col z      [-2, -1, 0, 1, 2]  sum(col*y)=   46  sum(col^2)= 10  weight=4.60
col z^2-2  [2, -1, -2, -1, 2]  sum(col*y)=   14  sum(col^2)= 14  weight=1.00</div>
  <p>Every sum in the hand tables appears. Now the everyday tools: <code>np.polyfit</code> (lists the highest power first), and sklearn's <code>PolynomialFeatures</code> feeding <code>LinearRegression</code>. <code>x[:, None]</code> turns the 1-D array into the one-column table sklearn wants; <code>include_bias=False</code> leaves out the column of 1s because <code>LinearRegression</code> fits its own intercept.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression

x = np.array([1, 2, 3, 4, 5])          # speed in tens of km/h (10 ... 50)
y = np.array([3, 4, 8, 14, 21])        # stopping distance in metres

for deg in [1, 2]:
    c = np.polyfit(x, y, deg)          # least squares, highest power first
    r = y - np.polyval(c, x)           # residuals
    print(f"degree {deg}: coefs {np.round(c, 3)}  residuals {np.round(r, 2) + 0.0}  SSE {np.sum(r**2):.2f}")

X2 = PolynomialFeatures(degree=2, include_bias=False).fit_transform(x[:, None])
m = LinearRegression().fit(X2, y)
print("sklearn: intercept", round(m.intercept_, 3), "weights", m.coef_.round(3))
print("predict 60 km/h (x=6):", m.predict([[6, 36]]).round(2), " line says:", np.polyval(np.polyfit(x, y, 1), 6).round(2))</div>
  <div class="fx" data-lang="text">degree 1: coefs [ 4.6 -3.8]  residuals [ 2.2 -1.4 -2.  -0.6  1.8]  SSE 14.40
degree 2: coefs [ 1.  -1.4  3.2]  residuals [ 0.2 -0.4  0.   0.4 -0.2]  SSE 0.40
sklearn: intercept 3.2 weights [-1.4  1. ]
predict 60 km/h (x=6): [30.8]  line says: 23.8</div>
  <p>Same residuals and SSE as the hand tables. At 60 km/h, beyond the data, the line says 23.8 m and the curve 30.8 m; physics agrees with the curve's direction (distance grows faster than speed). statsmodels writes the same model with a formula. <code>I(...)</code> means "compute this expression as a column" (without it, <code>**</code> means something else in formula language):</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
import statsmodels.formula.api as smf
df = pd.DataFrame({"x": [1, 2, 3, 4, 5], "dist": [3, 4, 8, 14, 21]})
fit = smf.ols("dist ~ x + I(x**2)", data=df).fit()       # I(...) = "compute this column"
print(fit.params.round(3))
print("R2:", round(fit.rsquared, 4), " p-value of x^2 term:", round(fit.pvalues["I(x ** 2)"], 4))</div>
  <div class="fx" data-lang="text">Intercept    3.2
x           -1.4
I(x ** 2)    1.0
dtype: float64
R2: 0.9982  p-value of x^2 term: 0.014</div>
  <p>The p-value 0.014 for the x² term says the curvature is unlikely to be chance, even with five rows. Every line of the summary you learned in <a class="xref" data-note="ml_regression">Linear Regression</a> (std err, t, confidence interval) applies unchanged, because this <em>is</em> linear regression.</p>
  <h3>Reading the coefficients of a curve</h3>
  <p>In a straight line, b₁ is "the effect of one more unit of x". In ŷ = 3.2 − 1.4x + x² there is no single effect. The slope at a point is the derivative: <strong>dŷ/dx = b₁ + 2b₂x = −1.4 + 2x</strong>.</p>
  <table class="tbl">
    <tr><th>speed x</th><th>slope −1.4 + 2x</th><th>plain meaning</th></tr>
    <tr><td>1 (10 km/h)</td><td>0.6</td><td>10 km/h faster adds about 0.6 m</td></tr>
    <tr><td>3 (30 km/h)</td><td>4.6</td><td>adds 4.6 m (the straight line's slope: the line is right on average, at the centre)</td></tr>
    <tr><td>5 (50 km/h)</td><td>8.6</td><td>adds 8.6 m: the same 10 km/h costs 14 times more distance than at 10 km/h</td></tr>
  </table>
  <p>The curve's lowest point is where the slope is 0: x = −b₁ / (2b₂) = 1.4 / 2 = 0.7 (7 km/h), with ŷ = 3.2 − 0.98 + 0.49 = 2.71 m. Below 7 km/h this curve says slower cars need <em>more</em> distance, which is nonsense: it is outside the data, where a parabola has no reason to be right. And b₁ = −1.4 on its own means only "the slope at x = 0", a speed we never tested.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Polynomial regression changes the <em>table</em>, not the <em>algorithm</em>. Whatever you can do to columns (scale them, select them, penalise their weights, put them in a pipeline) you can do to x² and x³. This is why the same trick reappears everywhere: interactions, splines, kernels, even the hidden layer of a neural network is "learned columns + a linear model on top".</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Do not read b₁ of a polynomial as "the effect of x". With x² in the model, the effect of x is b₁ + 2b₂x and changes along the range. Report it at meaningful values (the mean, a few typical values), or centre x first so that b₁ becomes "the slope at the average x".</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> One input and one square is easy. Real tables have many inputs, and "polynomial" then also means squares and products of different columns. How are they built, and how many are there?</div>

  <h2 id="pr-features"><span class="num">03</span>Polynomial Features by Hand</h2>
  <h3>Two inputs, degree 2</h3>
  <p>Take one row with two inputs, a = 2 and b = 3. A degree-2 expansion lists every product of the inputs whose powers add up to at most 2:</p>
  <table class="tbl out"><caption>Row (a, b) = (2, 3), degree 2</caption>
    <tr><th>term</th><th>total power</th><th>value</th><th>kind</th></tr>
    <tr><td>1</td><td>0</td><td>1</td><td>bias (intercept column)</td></tr>
    <tr><td>a</td><td>1</td><td>2</td><td>original</td></tr>
    <tr><td>b</td><td>1</td><td>3</td><td>original</td></tr>
    <tr><td>a²</td><td>2</td><td>4</td><td>square (curvature in a)</td></tr>
    <tr><td>a·b</td><td>2</td><td>6</td><td>interaction (a's effect depends on b)</td></tr>
    <tr><td>b²</td><td>2</td><td>9</td><td>square (curvature in b)</td></tr>
  </table>
  <p>For degree 3 add every term of total power 3: a³ = 8, a²b = 12, ab² = 18, b³ = 27. With <code>interaction_only=True</code> only products of <em>different</em> inputs are kept (1, a, b, ab), no squares.</p>
  <h3>How many columns?</h3>
  <p>A term is a way to give d "power units" to k inputs plus one dummy slot that absorbs unused power. Counting these ("stars and bars") gives C(k + d, d) terms including the bias, so <strong>C(k + d, d) − 1</strong> without it. By hand for k = 2, d = 2: C(4, 2) − 1 = 6 − 1 = 5 (a, b, a², ab, b²). For k = 10, d = 3: C(13, 3) − 1 = 286 − 1 = 285.</p>
  <div class="fx" data-lang="py">import numpy as np
from math import comb
from sklearn.preprocessing import PolynomialFeatures

row = np.array([[2, 3]])                          # one row: a = 2, b = 3
for kw in [dict(degree=2), dict(degree=2, interaction_only=True), dict(degree=3, include_bias=False)]:
    pf = PolynomialFeatures(**kw).fit(row)
    print(kw)
    print("  names :", list(pf.get_feature_names_out(["a", "b"])))
    print("  values:", pf.transform(row)[0].astype(int).tolist())

print("columns (no bias) for k inputs, degree d = C(k+d, d) - 1:")
for k in [1, 2, 5, 10, 50]:
    print(f"  k={k:&lt;3}", [comb(k + d, d) - 1 for d in (2, 3, 4)])</div>
  <div class="fx" data-lang="text">{'degree': 2}
  names : ['1', 'a', 'b', 'a^2', 'a b', 'b^2']
  values: [1, 2, 3, 4, 6, 9]
{'degree': 2, 'interaction_only': True}
  names : ['1', 'a', 'b', 'a b']
  values: [1, 2, 3, 6]
{'degree': 3, 'include_bias': False}
  names : ['a', 'b', 'a^2', 'a b', 'b^2', 'a^3', 'a^2 b', 'a b^2', 'b^3']
  values: [2, 3, 4, 6, 9, 8, 12, 18, 27]
columns (no bias) for k inputs, degree d = C(k+d, d) - 1:
  k=1   [2, 3, 4]
  k=2   [5, 9, 14]
  k=5   [20, 55, 125]
  k=10  [65, 285, 1000]
  k=50  [1325, 23425, 316250]</div>
  <p><code>get_feature_names_out</code> shows exactly which product each column is, in the same order as the hand table. The count table is the warning: 50 inputs at degree 3 already make 23,425 columns, more than most datasets have rows. With more columns than rows, ordinary least squares can fit the training data perfectly and learns nothing. That is the column explosion, and the reason polynomial features almost always travel with regularization or with a small degree.</p>
  <div class="cards">
    <div><b>degree</b><p>Highest total power. 2 adds squares and pairwise products; 3 adds cubes and three-way products.</p><small>Start at 2; rarely above 3 with many inputs</small></div>
    <div><b>interaction_only</b><p>Keep products of different inputs only (ab, abc), drop a², a³.</p><small>When you believe in interactions but not curvature</small></div>
    <div><b>include_bias</b><p>Adds the column of 1s. Set False when the next model fits its own intercept.</p><small>Duplicate intercepts confuse regularized fits</small></div>
    <div><b>get_feature_names_out</b><p>Names like <code>'a b'</code>, <code>'a^2'</code>, so you can read coefficients.</p><small>Pass input names for readable output</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Polynomial features of degree d</strong> for inputs x₁…x_k: all monomials x₁^p₁ · x₂^p₂ ⋯ x_k^p_k with p₁ + … + p_k ≤ d. Their number (with the constant) is C(k + d, d), which grows like k^d / d!.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>One-hot columns (0/1) squared are themselves (0² = 0, 1² = 1), so <code>PolynomialFeatures</code> on dummies creates exact duplicate columns and perfect collinearity. Expand only the numeric columns (use a <code>ColumnTransformer</code>, see <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>), or use <code>interaction_only=True</code> for dummies.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> If degree 2 is good, is degree 10 better? More columns always lower the training error. The question is what happens on rows the model has not seen.</div>

  <h2 id="pr-overfit"><span class="num">04</span>Degree vs Overfitting</h2>
  <h3>By hand: n points can always be hit exactly</h3>
  <p>A polynomial of degree d has d + 1 weights. Asking it to pass through n points gives n equations. With d + 1 = n (degree n − 1) there are as many unknowns as equations, so for distinct x values there is always an exact solution: through any 2 points goes a line, through any 3 a parabola, through any 5 a quartic. Training error 0 is guaranteed, whatever the data, including pure noise.</p>
  <div class="fx" data-lang="py">import numpy as np
x = np.array([1, 2, 3, 4, 5]); y = np.array([3, 4, 8, 14, 21])
for d in [1, 2, 3, 4]:
    c = np.polyfit(x, y, d)
    sse = np.sum((y - np.polyval(c, x)) ** 2)
    print(f"degree {d}: {d+1} weights, train SSE {sse:6.3f}, predicts x=6 -&gt; {np.polyval(c, 6):6.2f}, x=0 -&gt; {np.polyval(c, 0):6.2f}")</div>
  <div class="fx" data-lang="text">degree 1: 2 weights, train SSE 14.400, predicts x=6 -&gt;  23.80, x=0 -&gt;  -3.80
degree 2: 3 weights, train SSE  0.400, predicts x=6 -&gt;  30.80, x=0 -&gt;   3.20
degree 3: 4 weights, train SSE  0.000, predicts x=6 -&gt;  28.00, x=0 -&gt;   6.00
degree 4: 5 weights, train SSE  0.000, predicts x=6 -&gt;  28.00, x=0 -&gt;   6.00</div>
  <p>Our five braking rows happen to lie exactly on a cubic (their third differences are equal: the gaps 1, 4, 6, 7 have gaps 3, 2, 1, whose gaps are −1, −1), so degree 3 already hits every point and degree 4 adds nothing. Training SSE falls 14.4 → 0.4 → 0. But compare what each model says at speed 0: the line −3.8 m, the quadratic 3.2 m, the cubic 6.0 m. Zero training error bought a model that claims a parked car needs 6 m to stop. A perfect training fit says nothing about new points.</p>
  <h3>The real experiment: 20 noisy points from a sine wave</h3>
  <p>The truth is y = sin(2πx) plus noise with standard deviation 0.3. We train on 20 points and measure RMSE (root mean squared error) on 1,000 fresh test points, for degrees 0 to 15. The pipeline scales the polynomial columns (section 05 explains why); "largest |weight|" shows how big the coefficients get.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

rng = np.random.default_rng(0)
x = np.sort(rng.uniform(0, 1, 20)); x[[0, -1]] = 0, 1           # 20 training points
y = np.sin(2 * np.pi * x) + rng.normal(0, 0.3, 20)
xt = rng.uniform(0, 1, 1000); yt = np.sin(2 * np.pi * xt) + rng.normal(0, 0.3, 1000)

def rmse(m, a, b):
    return mean_squared_error(b, m.predict(a[:, None])) ** 0.5

print("deg  train  test   largest |weight|")
for d in [0, 1, 2, 3, 4, 5, 7, 9, 12, 15]:
    m = make_pipeline(PolynomialFeatures(d), StandardScaler(), LinearRegression()).fit(x[:, None], y)
    big = np.abs(m[-1].coef_).max() if d else 0.0
    print(f"{d:3d}  {rmse(m, x, y):.3f}  {rmse(m, xt, yt):.3f}  {big:,.1f}")

print("\\nOutside the data (true sin(2*pi*x) at x=1.1 is", round(np.sin(2 * np.pi * 1.1), 2), ")")
for d in [3, 9, 15]:
    m = make_pipeline(PolynomialFeatures(d), StandardScaler(), LinearRegression()).fit(x[:, None], y)
    print(f"degree {d:2d} predicts {m.predict([[1.1]])[0]:10.2f}")</div>
  <div class="fx" data-lang="text">deg  train  test   largest |weight|
  0  0.689  0.781  0.0
  1  0.534  0.577  0.4
  2  0.529  0.590  0.7
  3  0.158  0.330  10.7
  4  0.155  0.337  13.1
  5  0.155  0.336  12.4
  7  0.150  0.345  553.6
  9  0.150  0.344  565.7
 12  0.139  0.381  2,880.6
 15  0.125  0.548  4,794.4

Outside the data (true sin(2*pi*x) at x=1.1 is 0.59 )
degree  3 predicts       2.31
degree  9 predicts       2.44
degree 15 predicts    -214.35</div>
  <figure class="viz"><svg viewBox="0 0 600 270" width="600">
<line x1="60" y1="230" x2="580" y2="230" stroke="currentColor"/><line x1="60" y1="20" x2="60" y2="230" stroke="currentColor"/>
<text x="52" y="234" text-anchor="end" class="tm" font-size="11">0</text><text x="52" y="184" text-anchor="end" class="tm" font-size="11">0.2</text><text x="52" y="134" text-anchor="end" class="tm" font-size="11">0.4</text><text x="52" y="84" text-anchor="end" class="tm" font-size="11">0.6</text><text x="52" y="34" text-anchor="end" class="tm" font-size="11">0.8</text>
<line x1="60" y1="155" x2="580" y2="155" stroke="currentColor" stroke-opacity="0.25" stroke-dasharray="4 4"/><text x="575" y="168" text-anchor="end" class="tm" font-size="10.5">noise level 0.3</text>
<text x="60" y="246" text-anchor="middle" class="tm" font-size="11">0</text><text x="162" y="246" text-anchor="middle" class="tm" font-size="11">3</text><text x="230" y="246" text-anchor="middle" class="tm" font-size="11">5</text><text x="366" y="246" text-anchor="middle" class="tm" font-size="11">9</text><text x="468" y="246" text-anchor="middle" class="tm" font-size="11">12</text><text x="570" y="246" text-anchor="middle" class="tm" font-size="11">15</text>
<text x="320" y="264" text-anchor="middle" class="tm" font-size="12">polynomial degree</text>
<polyline points="60,58 94,96 128,98 162,190 196,191 230,191 298,192 366,192 468,195 570,199" fill="none" class="sb" stroke-width="2.2"/>
<polyline points="60,35 94,86 128,82 162,148 196,146 230,146 298,144 366,144 468,135 570,93" fill="none" class="sr" stroke-width="2.2"/>
<circle cx="162" cy="148" r="5" class="fg sg"/><text x="170" y="138" class="tg" font-size="12">best test: degree 3 (0.330)</text>
<text x="420" y="210" class="tb" font-size="12">train RMSE keeps falling</text>
<text x="470" y="110" class="tr" font-size="12">test RMSE turns up</text>
<text x="70" y="22" class="tm" font-size="11">underfit (high bias)</text><text x="575" y="60" text-anchor="end" class="tm" font-size="11">overfit (high variance)</text>
</svg><figcaption>Train error (blue) falls with every extra degree. Test error (red) falls until degree 3, stays flat, then rises: the U-shape of overfitting. Below the dashed line (the noise level) a model is fitting noise.</figcaption></figure>
    <figure class="viz"><svg viewBox="0 0 540 230" width="540">
<defs><clipPath id="pr-clip"><rect x="20" y="5" width="500" height="200"/></clipPath></defs>
<line x1="30" y1="110" x2="510" y2="110" stroke="currentColor" stroke-dasharray="2 4"/>
<polyline clip-path="url(#pr-clip)" points="30,82 37,83 44,84 51,85 58,86 65,87 72,88 79,89 86,90 93,91 100,93 107,94 113,95 120,96 127,97 134,98 141,99 148,100 155,101 162,102 169,103 176,104 183,105 190,106 197,107 204,109 211,110 218,111 225,112 232,113 239,114 246,115 253,116 260,117 267,118 273,119 280,120 287,121 294,122 301,123 308,124 315,126 322,127 329,128 336,129 343,130 350,131 357,132 364,133 371,134 378,135 385,136 392,137 399,138 406,139 413,140 420,141 427,143 433,144 440,145 447,146 454,147 461,148 468,149 475,150 482,151 489,152 496,153 503,154 510,155" fill="none" class="sb" stroke-width="2"/>
<polyline clip-path="url(#pr-clip)" points="30,109 37,101 44,93 51,87 58,81 65,75 72,71 79,67 86,64 93,61 100,59 107,57 113,56 120,55 127,55 134,56 141,56 148,57 155,59 162,61 169,63 176,65 183,68 190,71 197,75 204,78 211,82 218,86 225,90 232,94 239,98 246,102 253,107 260,111 267,115 273,120 280,124 287,128 294,132 301,136 308,140 315,144 322,147 329,150 336,153 343,156 350,159 357,161 364,162 371,164 378,165 385,166 392,166 399,166 406,165 413,164 420,162 427,160 433,157 440,154 447,150 454,145 461,139 468,133 475,127 482,119 489,111 496,102 503,92 510,81" fill="none" class="sg" stroke-width="2"/>
<polyline clip-path="url(#pr-clip)" points="30,105 37,101 44,96 51,92 58,86 65,81 72,75 79,69 86,63 93,58 100,54 107,50 113,47 120,46 127,45 134,46 141,48 148,51 155,54 162,58 169,63 176,68 183,73 190,77 197,82 204,86 211,90 218,94 225,97 232,100 239,102 246,105 253,108 260,111 267,114 273,118 280,122 287,126 294,131 301,136 308,142 315,147 322,152 329,157 336,161 343,164 350,166 357,167 364,166 371,165 378,163 385,160 392,158 399,156 406,154 413,154 420,154 427,156 433,158 440,160 447,159 454,154 461,143 468,125 475,98 482,64 489,28 496,3 503,10 510,85" fill="none" class="sr" stroke-width="2"/>
<path d="M30 112h0M38 82h0M46 109h0M50 90h0M114 46h0M159 54h0M174 70h0M233 100h0M290 132h0M291 121h0M321 161h0M336 155h0M380 167h0M380 156h0M420 157h0M422 154h0M442 164h0M444 154h0M468 126h0M510 85h0" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
<text x="40" y="226" class="tb" font-size="12">degree 1 (underfit)</text><text x="200" y="226" class="tg" font-size="12">degree 3 (good)</text><text x="340" y="226" class="tr" font-size="12">degree 15 (chases noise)</text>
</svg><figcaption>20 noisy points from a sine wave. Degree 15 bends to hit points, especially at the edges.</figcaption></figure>
  <p>Read the table in three zones. <strong>Degrees 0–2 underfit</strong>: a sine has two bends, and a parabola has only one, so both train and test errors are high (high bias). <strong>Degrees 3–9 are about right</strong>: test RMSE ≈ 0.33–0.34, close to the noise level 0.3 that no model can beat. <strong>Degrees 12–15 overfit</strong>: train RMSE keeps falling (0.125, below the noise level, which means it is fitting noise), while test RMSE climbs to 0.548, as bad as a straight line. The weights tell the same story: degree 3 needs weights around 11, degree 15 needs weights near 4,800 that almost cancel each other; tiny changes in the data change them a lot.</p>
  <h3>Edges and extrapolation</h3>
  <p>High-degree polynomials misbehave most at the ends of the data range, where there are no points on one side to hold them down. This is <strong>Runge's phenomenon</strong>: fitting a high-degree polynomial to evenly spaced points makes it oscillate more and more near the edges. Outside the range it is worse: x^15 grows without limit, so the degree-15 model predicts −214 at x = 1.1, where the truth is 0.59. Even degree 3 predicts 2.31 there, because every polynomial heads to ±∞ eventually.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Degree 15 is the student who memorises last year's question paper word by word: full marks on that paper (training), poor marks on a new paper (test), and complete nonsense on a question from a chapter not in the syllabus (extrapolation).</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Underfitting</strong>: the model is too simple to capture the pattern, so both train and test errors are high (high bias). <strong>Overfitting</strong>: the model is flexible enough to fit noise, so train error is low and test error is high (high variance). Polynomial degree is the textbook capacity knob between them; the full decomposition is in <a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Never trust a polynomial outside the range of x it was trained on, and be suspicious near the edges even inside it. If you must extrapolate (forecasting, dose levels above those tested), use a model whose shape outside the data is chosen on purpose: a straight line, a spline with linear tails, or domain knowledge.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> The pipeline above had a <code>StandardScaler</code> after <code>PolynomialFeatures</code>. Why? What goes wrong if x² and x³ are left as they are?</div>

  <h2 id="pr-scale"><span class="num">05</span>Scaling and Collinearity of Powers</h2>
  <h3>Problem 1: x and x² are nearly the same column</h3>
  <p>On a positive range, x and x² both go up together, so they are strongly correlated. By hand for x = 1..5: dx = −2, −1, 0, 1, 2. x² = 1, 4, 9, 16, 25 with mean 11, so its deviations are −10, −7, −2, 5, 14.</p>
  <table class="tbl out"><caption>corr(x, x²) for x = 1..5</caption>
    <tr><th>dx</th><th>d(x²)</th><th>dx · d(x²)</th><th>dx²</th><th>d(x²)²</th></tr>
    <tr><td>−2</td><td>−10</td><td>20</td><td>4</td><td>100</td></tr>
    <tr><td>−1</td><td>−7</td><td>7</td><td>1</td><td>49</td></tr>
    <tr><td>0</td><td>−2</td><td>0</td><td>0</td><td>4</td></tr>
    <tr><td>1</td><td>5</td><td>5</td><td>1</td><td>25</td></tr>
    <tr><td>2</td><td>14</td><td>28</td><td>4</td><td>196</td></tr>
    <tr><td><strong>sum</strong></td><td></td><td><strong>60</strong></td><td><strong>10</strong></td><td><strong>374</strong></td></tr>
  </table>
  <p>r = 60 / √(10 × 374) = 60 / 61.16 = <strong>0.981</strong>. After centring (z = −2..2), z² = 4, 1, 0, 1, 4 is symmetric while z is antisymmetric, so Σ z·(z² − 2) = 0 and the correlation is exactly <strong>0</strong>. Centring removed the overlap; that is why the hand fit in section 02 became three separate divisions.</p>
  <p>Why the overlap hurts: when two columns carry almost the same information, least squares cannot tell how to share the effect between them. Many weight combinations fit almost equally well, so the chosen weights swing with small changes in the data and their standard errors blow up. This is multicollinearity (measured with VIF in <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a>), created by us.</p>
  <h3>Problem 2: the numbers become huge</h3>
  <p>Take x = the year, 2000 to 2010. Then x³ ≈ 8 × 10⁹, while the 1s column is 1. XᵀX contains entries from about 11 to about 10²⁰. A computer stores about 16 significant digits, so when such numbers are combined, the small ones are lost entirely. The <strong>condition number</strong> of XᵀX (largest divided by smallest eigenvalue) measures this: around 10¹⁶ or more means the solution can be pure rounding noise.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.preprocessing import PolynomialFeatures, StandardScaler

x = np.array([1, 2, 3, 4, 5.0])
print("corr(x, x^2), raw x = 1..5     :", round(np.corrcoef(x, x**2)[0, 1], 3))
xc = x - x.mean()
print("corr(x, x^2), centred x = -2..2:", round(np.corrcoef(xc, xc**2)[0, 1], 3))

years = np.arange(2000, 2011.0)                    # a raw feature with big values
for name, v in [("raw years", years), ("centred years", years - years.mean()),
                ("standardised", (years - years.mean()) / years.std())]:
    P = PolynomialFeatures(3, include_bias=False).fit_transform(v[:, None])
    print(f"{name:14s} x^3 max {np.abs(P[:, 2]).max():&gt;14,.1f}   corr(x, x^3) {np.corrcoef(P[:, 0], P[:, 2])[0, 1]:.4f}"
          f"   cond(X^T X) {np.linalg.cond(P.T @ P):.1e}")

# what an unstable design does to the weights: refit on bootstrap resamples
rng = np.random.default_rng(3)
xx = rng.uniform(10, 20, 30); yy = 0.5 * (xx - 15) ** 2 + rng.normal(0, 2, 30)
idx = [rng.integers(0, 30, 30) for _ in range(3)]       # the same 3 resamples for both
for name, f in [("raw x", lambda v: v), ("centred x", lambda v: v - 15)]:
    ws = []
    for i in idx:
        ws.append(np.polyfit(f(xx[i]), yy[i], 2)[::-1].round(2))
    print(f"{name:9s} [b0, b1, b2] on 3 resamples:", [w.tolist() for w in ws])</div>
  <div class="fx" data-lang="text">corr(x, x^2), raw x = 1..5     : 0.981
corr(x, x^2), centred x = -2..2: 0.0
raw years      x^3 max 8,120,601,000.0   corr(x, x^3) 1.0000   cond(X^T X) 1.4e+22
centred years  x^3 max          125.0   corr(x, x^3) 0.9216   cond(X^T X) 2.5e+03
standardised   x^3 max            4.0   corr(x, x^3) 0.9216   cond(X^T X) 3.8e+01
raw x     [b0, b1, b2] on 3 resamples: [[110.37, -14.54, 0.48], [117.11, -15.61, 0.52], [94.31, -12.39, 0.41]]
centred x [b0, b1, b2] on 3 resamples: [[0.37, -0.12, 0.48], [-0.83, -0.12, 0.52], [0.99, -0.06, 0.41]]</div>
  <p>Raw years: x and x³ have correlation 1.0000 to four decimals and the condition number is 10²², hopeless. Centring alone drops it to 2,500; standardising to 38. The second experiment fits the same quadratic on the same three resamples with raw x (range 10–20) and with centred x. The curvature b₂ is identical either way (0.48, 0.52, 0.41), but raw b₀ and b₁ jump around (110 → 117 → 94) because they describe the curve at x = 0, far outside the data, where small changes in curvature move the extrapolated value a lot. With centred x, b₀ and b₁ describe the curve at the middle of the data and are small and steady. The <em>predictions</em> are the same in both versions: only the bookkeeping differs.</p>
  <h3>The fixes</h3>
  <table class="tbl">
    <tr><th>Fix</th><th>What it does</th><th>When</th></tr>
    <tr><td>Centre x before powering</td><td>Removes most of the x / x² overlap; b₁ becomes the slope at the mean</td><td>Always, for interpretation</td></tr>
    <tr><td>Standardise after <code>PolynomialFeatures</code></td><td>Puts x, x², x³ on comparable scales; needed for penalties (ridge/lasso) and gradient descent</td><td>Always in sklearn pipelines</td></tr>
    <tr><td>Scale <em>before</em> too (e.g. <code>StandardScaler</code> → <code>PolynomialFeatures</code> → <code>StandardScaler</code>)</td><td>Keeps raw powers from becoming astronomically large</td><td>Inputs with big values (years, prices)</td></tr>
    <tr><td>Orthogonal polynomials (R's <code>poly()</code>, numpy's <code>Legendre</code>/<code>Chebyshev</code> classes)</td><td>Columns built to be exactly uncorrelated, as z and z² − 2 were</td><td>Statistical modelling, high degree</td></tr>
    <tr><td>Use splines instead</td><td>Local pieces never become huge</td><td>Complex shapes (section 07)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Condition number</strong> κ(A) = largest / smallest singular value of A. It bounds how much relative error in the data can be amplified in the solution: you lose about log₁₀ κ digits of accuracy. <strong>Orthogonal polynomials</strong>: polynomial columns constructed so that Σ pᵢ(x)·pⱼ(x) = 0 for i ≠ j over the data, which makes XᵀX diagonal.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Penalties (ridge, lasso) and gradient descent are scale-sensitive. Without standardising, x³ (huge values) needs only a tiny weight and is barely penalised, while x (small values) is penalised heavily. The penalty then favours whichever power happens to have the biggest numbers, which is meaningless.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Squares bend one variable. The cross term a·b in the expansion does something different: it lets one variable change the effect of another. That deserves its own look.</div>

  <h2 id="pr-inter"><span class="num">06</span>Interaction Terms</h2>
  <h3>The need</h3>
  <p>An advertiser spends on TV and radio. A main-effects model says sales = b₀ + b₁·TV + b₂·radio: an extra lakh on TV adds b₁ whatever the radio budget. Marketing teams know better: ads reinforce each other (people who heard the radio spot respond more to the TV ad). The effect of TV <em>depends on</em> radio. That is an interaction.</p>
  <h3>Plain words and the formula</h3>
  <p>Add the product column TV·radio: ŷ = b₀ + b₁·TV + b₂·radio + b₃·TV·radio. Group the TV terms: ŷ = b₀ + b₂·radio + <strong>(b₁ + b₃·radio)</strong>·TV. The slope of TV is no longer a constant: it is b₁ + b₃·radio. If b₃ &gt; 0 the two help each other (synergy); if b₃ &lt; 0 they substitute for each other.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Fertiliser and water. Fertiliser alone on dry soil does little; water alone helps a bit; both together help far more than the sum. The extra from "both together" is the interaction term. A main-effects-only model cannot express "far more than the sum".</p>
  </div>
  <h3>Worked by hand</h3>
  <p>Suppose the truth is sales = 10 + 2·TV + 1·radio + 0.5·TV·radio (lakh rupees). The TV slope is 2 + 0.5·radio:</p>
  <table class="tbl out"><caption>Effect of one more lakh on TV</caption>
    <tr><th>radio budget</th><th>TV slope 2 + 0.5·radio</th><th>sales at TV = 4</th><th>sales at TV = 5</th><th>difference</th></tr>
    <tr><td>0</td><td>2.0</td><td>10 + 8 + 0 + 0 = 18.0</td><td>10 + 10 + 0 + 0 = 20.0</td><td>2.0</td></tr>
    <tr><td>2</td><td>3.0</td><td>10 + 8 + 2 + 4 = 24.0</td><td>10 + 10 + 2 + 5 = 27.0</td><td>3.0</td></tr>
    <tr><td>4</td><td>4.0</td><td>10 + 8 + 4 + 8 = 30.0</td><td>10 + 10 + 4 + 10 = 34.0</td><td>4.0</td></tr>
  </table>
  <p>Now simulate 200 campaigns from that truth (plus noise with standard deviation 2) and fit both models. <code>interaction_only=True</code> adds just the product column.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.model_selection import cross_val_score

rng = np.random.default_rng(7)
n = 200
tv = rng.uniform(0, 10, n)                      # TV spend, lakh rupees
radio = rng.uniform(0, 5, n)                    # radio spend, lakh rupees
sales = 10 + 2 * tv + 1 * radio + 0.5 * tv * radio + rng.normal(0, 2, n)
X = np.c_[tv, radio]

main = LinearRegression()
inter = PolynomialFeatures(degree=2, interaction_only=True, include_bias=False)
Xi = inter.fit_transform(X)                     # columns: tv, radio, tv*radio
for name, A in [("main effects only", X), ("with tv*radio", Xi)]:
    m = LinearRegression().fit(A, sales)
    r2 = cross_val_score(LinearRegression(), A, sales, cv=5).mean()
    print(f"{name:18s} intercept {m.intercept_:5.2f}  weights {m.coef_.round(2)}  CV R2 {r2:.3f}")
m = LinearRegression().fit(Xi, sales)
b0, b_tv, b_r, b_tvr = m.intercept_, *m.coef_
for r in [0, 2, 4]:
    print(f"radio = {r}: one more lakh on TV adds {b_tv + b_tvr * r:.2f} lakh sales")</div>
  <div class="fx" data-lang="text">main effects only  intercept  3.51  weights [3.28 3.35]  CV R2 0.933
with tv*radio      intercept  9.88  weights [1.99 0.98 0.48]  CV R2 0.969
radio = 0: one more lakh on TV adds 1.99 lakh sales
radio = 2: one more lakh on TV adds 2.96 lakh sales
radio = 4: one more lakh on TV adds 3.92 lakh sales</div>
  <p>The main-effects model is forced to give TV one average slope (3.28) and a wrong intercept (3.51 instead of 10). With the product column the weights land near the truth (1.99, 0.98, 0.48, intercept 9.88), cross-validated R² rises from 0.933 to 0.969, and the slope table matches the hand table within noise.</p>
  <h3>Category × number: a different slope per group</h3>
  <p>A 0/1 dummy times a number gives each group its own slope. Six employees: three outside metros earn 4, 6, 8 lakh at 1, 3, 5 years of experience (slope 1, intercept 3), three in metros earn 6, 10, 14 (slope 2, intercept 4). The model salary = b₀ + b₁·exp + b₂·metro + b₃·exp·metro gives, by hand:</p>
  <table class="tbl">
    <tr><th>group</th><th>equation</th><th>so</th></tr>
    <tr><td>non-metro (metro = 0)</td><td>b₀ + b₁·exp</td><td>b₀ = 3, b₁ = 1</td></tr>
    <tr><td>metro (metro = 1)</td><td>(b₀ + b₂) + (b₁ + b₃)·exp</td><td>b₀ + b₂ = 4 → b₂ = 1; b₁ + b₃ = 2 → b₃ = 1</td></tr>
  </table>
  <p>In a statsmodels formula, <code>exp * metro</code> is shorthand for <code>exp + metro + exp:metro</code> (the colon is the product):</p>
  <div class="fx" data-lang="py">import pandas as pd
import statsmodels.formula.api as smf
df = pd.DataFrame({"exp":    [1, 3, 5, 1, 3, 5],            # years of experience
                   "metro":  [0, 0, 0, 1, 1, 1],            # 1 = works in a metro city
                   "salary": [4, 6, 8, 6, 10, 14]})         # lakh per year
print(smf.ols("salary ~ exp + metro", df).fit().params.round(2).to_dict())
print(smf.ols("salary ~ exp * metro", df).fit().params.round(2).to_dict())   # a*b = a + b + a:b</div>
  <div class="fx" data-lang="text">{'Intercept': 1.5, 'exp': 1.5, 'metro': 4.0}
{'Intercept': 3.0, 'exp': 1.0, 'metro': 1.0, 'exp:metro': 1.0}</div>
  <p>Without the interaction the model gives one shared slope (1.5, the average of 1 and 2) and a big metro jump (4.0) to compensate. With it, the hand answer 3, 1, 1, 1 comes out exactly: metro employees start 1 lakh higher <em>and</em> gain 1 lakh more per year.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>An <strong>interaction</strong> between a and b exists when the effect of a on y depends on the value of b. In a linear model it is the product term b₃·a·b, which makes ∂ŷ/∂a = b₁ + b₃·b. The <strong>hierarchy principle</strong>: if you keep a·b, keep a and b as well, even if their p-values are large; otherwise the meaning of b₃ depends on where zero is for a and b.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>With an interaction in the model, b₁ is the effect of TV <em>only when radio = 0</em>, not "the effect of TV". If radio = 0 is far outside the data, b₁ is an extrapolation. Centre both inputs before multiplying, and b₁ becomes the effect of TV at the average radio budget. Also: with k inputs there are k(k − 1)/2 pairwise products; adding all of them blindly is the column explosion again. Add the ones domain knowledge suggests, or let a penalty (lasso) or a tree model find them.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Powers of x are only one choice of new column, and a poor one at the edges. What other columns could we feed linear regression, and how do we choose?</div>

  <h2 id="pr-basis"><span class="num">07</span>Basis Functions</h2>
  <h3>The general idea</h3>
  <p>Every model in this note has the form <strong>ŷ = w₀ + w₁φ₁(x) + w₂φ₂(x) + … + w_mφ_m(x)</strong>. The φ's (phi) are fixed functions chosen before training, called <strong>basis functions</strong>; least squares only picks the weights. Polynomials use φⱼ(x) = xʲ. But nothing forces that choice. The question is which family of shapes, added together, can imitate the curves you expect, without the edge problems of powers.</p>
  <figure class="viz"><svg viewBox="0 0 700 185" width="700">
<line x1="30" y1="150" x2="230" y2="150" stroke="currentColor"/><line x1="250" y1="150" x2="450" y2="150" stroke="currentColor"/><line x1="470" y1="150" x2="670" y2="150" stroke="currentColor"/>
<polyline points="30,150 80,150 230,40" fill="none" class="sb" stroke-width="2"/><polyline points="30,150 130,150 230,77" fill="none" class="sg" stroke-width="2"/><polyline points="30,150 180,150 230,113" fill="none" class="sr" stroke-width="2"/>
<polyline points="250,40 255,42 260,49 265,60 270,72 275,86 280,100 285,112 290,123 295,131 300,137 305,142 310,145 315,147 320,148 325,149 330,150" fill="none" class="sb" stroke-width="2"/>
<polyline points="250,137 255,131 260,123 265,112 270,100 275,86 280,72 285,60 290,49 295,42 300,40 305,42 310,49 315,60 320,72 325,86 330,100 335,112 340,123 345,131 350,137 355,142 360,145 365,147 370,148 375,149 380,150" fill="none" class="sg" stroke-width="2"/>
<polyline points="270,150 275,149 280,148 285,147 290,145 295,142 300,137 305,131 310,123 315,112 320,100 325,86 330,72 335,60 340,49 345,42 350,40 355,42 360,49 365,60 370,72 375,86 380,100 385,112 390,123 395,131 400,137 405,142 410,145 415,147 420,148 425,149 430,150" fill="none" class="sr" stroke-width="2"/>
<polyline points="320,150 325,149 330,148 335,147 340,145 345,142 350,137 355,131 360,123 365,112 370,100 375,86 380,72 385,60 390,49 395,42 400,40 405,42 410,49 415,60 420,72 425,86 430,100 435,112 440,123 445,131 450,137" fill="none" class="st" stroke-width="2"/>
<polyline points="370,150 375,149 380,148 385,147 390,145 395,142 400,137 405,131 410,123 415,112 420,100 425,86 430,72 435,60 440,49 445,42 450,40" fill="none" stroke="currentColor" stroke-opacity="0.5" stroke-width="2"/>
<polyline points="470,132 475,137 480,141 485,144 490,146 495,148 500,149 505,150" fill="none" stroke="currentColor" stroke-opacity="0.5" stroke-width="2"/>
<polyline points="470,77 475,78 480,81 485,85 490,91 495,97 500,104 505,112 510,119 515,126 520,132 525,137 530,141 535,144 540,146 545,148 550,149 555,150" fill="none" class="sb" stroke-width="2"/>
<polyline points="470,132 475,126 480,119 485,112 490,104 495,97 500,91 505,85 510,81 515,78 520,77 525,78 530,81 535,85 540,91 545,97 550,104 555,112 560,119 565,126 570,132 575,137 580,141 585,144 590,146 595,148 600,149 605,150" fill="none" class="sg" stroke-width="2"/>
<polyline points="485,150 490,149 495,148 500,146 505,144 510,141 515,137 520,132 525,126 530,119 535,112 540,104 545,97 550,91 555,85 560,81 565,78 570,77 575,78 580,81 585,85 590,91 595,97 600,104 605,112 610,119 615,126 620,132 625,137 630,141 635,144 640,146 645,148 650,149 655,150" fill="none" class="sr" stroke-width="2"/>
<polyline points="535,150 540,149 545,148 550,146 555,144 560,141 565,137 570,132 575,126 580,119 585,112 590,104 595,97 600,91 605,85 610,81 615,78 620,77 625,78 630,81 635,85 640,91 645,97 650,104 655,112 660,119 665,126 670,132" fill="none" class="st" stroke-width="2"/>
<polyline points="585,150 590,149 595,148 600,146 605,144 610,141 615,137 620,132 625,126 630,119 635,112 640,104 645,97 650,91 655,85 660,81 665,78 670,77" fill="none" stroke="currentColor" stroke-opacity="0.5" stroke-width="2"/>
<polyline points="635,150 640,149 645,148 650,146 655,144 660,141 665,137 670,132" fill="none" stroke="currentColor" stroke-opacity="0.5" stroke-width="2"/>
<text x="130" y="20" text-anchor="middle" font-size="12.5">hinges max(0, x − c)</text><text x="130" y="172" text-anchor="middle" class="tm" font-size="11">knots c = 0.25, 0.5, 0.75</text>
<text x="350" y="20" text-anchor="middle" font-size="12.5">RBF bumps</text><text x="350" y="172" text-anchor="middle" class="tm" font-size="11">centres 0, 0.25, 0.5, 0.75, 1</text>
<text x="570" y="20" text-anchor="middle" font-size="12.5">cubic B-splines</text><text x="570" y="172" text-anchor="middle" class="tm" font-size="11">5 knots → 7 local bumps</text>
</svg><figcaption>Three families of basis functions on x ∈ [0, 1]. Each column of the new table is one of these curves evaluated at the row's x. A fitted model is a weighted sum of the curves.</figcaption></figure>
  <h3>Step functions (bins)</h3>
  <p>Cut the x range into intervals and make one 0/1 column per interval: φⱼ(x) = 1 if x falls in bin j, else 0. The fitted weight of a bin is simply the average y of the rows in it, so the model is a staircase. By hand, with bins [0, ⅓), [⅓, ⅔), [⅔, 1]: x = 0.5 becomes the row (0, 1, 0), x = 0.9 becomes (0, 0, 1). Simple and robust, but the prediction jumps at bin edges and is flat inside each bin. (A regression tree is a step function whose bins are chosen automatically; see <a class="xref" data-note="ml_dtree">Decision Trees</a>.)</p>
  <h3>Hinges: piecewise linear</h3>
  <p>A hinge (in neural networks called ReLU) at knot c is φ(x) = max(0, x − c): zero to the left of c, a rising line to the right. Adding w·max(0, x − c) to a line changes the slope by w at x = c and nowhere else. Example: a quantity rises 1 per unit until x = 3, then stays flat at 3. With columns x and max(0, x − 3):</p>
  <table class="tbl out"><caption>Hinge at c = 3, weights 1 on x and −1 on the hinge</caption>
    <tr><th>x</th><th>max(0, x − 3)</th><th>ŷ = 1·x − 1·hinge</th><th>y</th></tr>
    <tr><td>1</td><td>0</td><td>1</td><td>1</td></tr>
    <tr><td>2</td><td>0</td><td>2</td><td>2</td></tr>
    <tr><td>3</td><td>0</td><td>3</td><td>3</td></tr>
    <tr><td>4</td><td>1</td><td>4 − 1 = 3</td><td>3</td></tr>
    <tr><td>5</td><td>2</td><td>5 − 2 = 3</td><td>3</td></tr>
    <tr><td>6</td><td>3</td><td>6 − 3 = 3</td><td>3</td></tr>
  </table>
  <p>Slope 1 before the knot, 1 + (−1) = 0 after. Saturation (salary flattening, sales hitting market size) is easy to express this way, and a polynomial would need a high degree to imitate the sharp corner. MARS (multivariate adaptive regression splines) is an algorithm that searches for good hinge knots automatically.</p>
  <h3>Splines: smooth pieces joined at knots</h3>
  <p>A <strong>spline</strong> is a piecewise polynomial: a separate low-degree polynomial on each interval between knots, glued so that the joins are smooth. A cubic spline uses cubic pieces and forces the value, slope and curvature (first and second derivative) to match at every knot, so the eye cannot see the joins. One way to write it is x, x², x³ plus one column max(0, x − c)³ per knot c (the "truncated power basis"): the cube of a hinge starts so gently that it adds curvature without a visible kink. In practice libraries use the numerically nicer <strong>B-spline</strong> basis: a set of local bumps, each non-zero over only 4 neighbouring intervals (for cubic), that add up to exactly 1 at every x.</p>
  <p><strong>By hand: the cubic B-spline row at x = 0.3.</strong> Knots at 0, 0.25, 0.5, 0.75, 1. The point 0.3 lies in the interval [0.25, 0.5], at the local position u = (0.3 − 0.25) / 0.25 = 0.2. On evenly spaced knots, the four bumps that are non-zero there have the standard formulas:</p>
  <table class="tbl out"><caption>Uniform cubic B-spline weights at u = 0.2</caption>
    <tr><th>bump</th><th>formula</th><th>at u = 0.2</th></tr>
    <tr><td>left</td><td>(1 − u)³ / 6</td><td>0.512 / 6 = 0.0853</td></tr>
    <tr><td>centre-left</td><td>(3u³ − 6u² + 4) / 6</td><td>(0.024 − 0.24 + 4) / 6 = 0.6307</td></tr>
    <tr><td>centre-right</td><td>(−3u³ + 3u² + 3u + 1) / 6</td><td>(−0.024 + 0.12 + 0.6 + 1) / 6 = 0.2827</td></tr>
    <tr><td>right</td><td>u³ / 6</td><td>0.008 / 6 = 0.0013</td></tr>
    <tr><td colspan="2"><strong>sum</strong></td><td><strong>1.0000</strong></td></tr>
  </table>
  <p>Only 4 of the 7 columns are non-zero, and they sum to 1 ("partition of unity"). Locality is the key property: a data point at x = 0.3 only influences the weights of bumps near 0.3. A polynomial weight, in contrast, affects the curve everywhere, which is why one noisy point at the edge could swing the whole degree-15 curve. A <strong>natural spline</strong> additionally forces the curve to be a straight line beyond the outer knots, which tames the edges and gives sensible linear extrapolation.</p>
  <h3>Radial basis functions (RBF)</h3>
  <p>An RBF column is a Gaussian bump centred at c with width s: φ(x) = exp(−(x − c)² / (2s²)). It is 1 at x = c and fades to 0 a few widths away. By hand at x = 0.3 with centres 0, 0.5, 1 and s = 0.25 (so 2s² = 0.125):</p>
  <table class="tbl out"><caption>RBF features of x = 0.3</caption>
    <tr><th>centre c</th><th>(x − c)²</th><th>÷ 0.125</th><th>exp(−…)</th></tr>
    <tr><td>0</td><td>0.09</td><td>0.72</td><td>0.4868</td></tr>
    <tr><td>0.5</td><td>0.04</td><td>0.32</td><td>0.7261</td></tr>
    <tr><td>1</td><td>0.49</td><td>3.92</td><td>0.0198</td></tr>
  </table>
  <p>The nearest centre (0.5) gives the biggest value; the far centre (1) almost nothing. The width s is a smoothness knob: wide bumps give smooth curves, narrow bumps give wiggly ones (and overfit). The <a class="xref" data-note="ml_svm">Support Vector Machines</a> RBF kernel is this same bump, with one centre at every training point. The code checks all three hand tables:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import SplineTransformer

# 1) one hinge: rises then flattens at x = 3
x = np.arange(1, 7.0); y = np.array([1, 2, 3, 3, 3, 3.0])
H = np.c_[x, np.maximum(0, x - 3)]               # columns: x, max(0, x-3)
m = LinearRegression().fit(H, y)
print("hinge column:", H[:, 1].tolist(), " weights", m.coef_.round(3) + 0.0, " intercept", round(m.intercept_, 3) + 0.0)

# 2) RBF features at x = 0.3, centres 0, 0.5, 1, width s = 0.25
c, s = np.array([0, 0.5, 1]), 0.25
print("RBF at x=0.3:", np.exp(-(0.3 - c) ** 2 / (2 * s ** 2)).round(4))

# 3) B-spline basis: 5 knots on [0, 1], cubic -&gt; 5 + 3 - 1 = 7 columns
st = SplineTransformer(n_knots=5, degree=3).fit(np.linspace(0, 1, 11)[:, None])
row = st.transform([[0.3]])[0]
print("cubic B-spline row at x=0.3:", row.round(4), " sum =", round(row.sum(), 6))</div>
  <div class="fx" data-lang="text">hinge column: [0.0, 0.0, 0.0, 1.0, 2.0, 3.0]  weights [ 1. -1.]  intercept 0.0
RBF at x=0.3: [0.4868 0.7261 0.0198]
cubic B-spline row at x=0.3: [0.     0.0853 0.6307 0.2827 0.0013 0.     0.    ]  sum = 1.0</div>
  <p>Least squares recovers weights 1 and −1 for the hinge exactly, and the RBF and B-spline rows match the hand tables to four decimals. <code>SplineTransformer(n_knots=5, degree=3)</code> makes n_knots + degree − 1 = 7 columns.</p>
  <h3>Head to head on the sine data</h3>
  <p>The same 20 sine points as section 04. Each model is "basis columns, then linear regression" (the RBF model adds a tiny ridge penalty because 8 overlapping bumps are correlated). We also ask each for a prediction <em>outside</em> the data, at x = 1.2 and 1.5. The small <code>RBF</code> class is a custom sklearn transformer (fit stores the centres, transform computes the bumps; see <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a> for custom transformers).</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, SplineTransformer, KBinsDiscretizer, StandardScaler
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.metrics import mean_squared_error

rng = np.random.default_rng(0)                      # the same 20 sine points as before
x = np.sort(rng.uniform(0, 1, 20)); x[[0, -1]] = 0, 1
y = np.sin(2 * np.pi * x) + rng.normal(0, 0.3, 20)
xt = rng.uniform(0, 1, 1000); yt = np.sin(2 * np.pi * xt) + rng.normal(0, 0.3, 1000)

class RBF(BaseEstimator, TransformerMixin):         # Gaussian bumps at evenly spaced centres
    def __init__(self, n_centers=8, width=0.15):
        self.n_centers, self.width = n_centers, width
    def fit(self, X, y=None):
        self.c_ = np.linspace(X.min(), X.max(), self.n_centers); return self
    def transform(self, X):
        return np.exp(-(X - self.c_) ** 2 / (2 * self.width ** 2))

models = {
    "polynomial deg 3":        make_pipeline(PolynomialFeatures(3), StandardScaler(), LinearRegression()),
    "steps (6 bins)":          make_pipeline(KBinsDiscretizer(6, encode="onehot-dense", strategy="uniform"), LinearRegression()),
    "piecewise linear 6 knots": make_pipeline(SplineTransformer(n_knots=6, degree=1), LinearRegression()),
    "cubic spline 6 knots":    make_pipeline(SplineTransformer(n_knots=6, degree=3), LinearRegression()),
    "RBF 8 bumps + ridge":     make_pipeline(RBF(8, 0.15), Ridge(alpha=0.1)),
}
print(f"{'basis':25s} cols  train   test   f(1.2)  f(1.5)   (true: {np.sin(2*np.pi*1.2):.2f}, {np.sin(2*np.pi*1.5):.2f})")
for name, m in models.items():
    m.fit(x[:, None], y)
    ncol = m[:-1].transform(x[:1, None]).shape[1]
    tr = mean_squared_error(y, m.predict(x[:, None])) ** 0.5
    te = mean_squared_error(yt, m.predict(xt[:, None])) ** 0.5
    f12, f15 = m.predict([[1.2], [1.5]])
    print(f"{name:25s} {ncol:4d}  {tr:.3f}  {te:.3f}  {f12:6.2f}  {f15:6.2f}")</div>
  <div class="fx" data-lang="text">basis                     cols  train   test   f(1.2)  f(1.5)   (true: 0.95, 0.00)
polynomial deg 3             4  0.158  0.330    4.98   19.73
steps (6 bins)               6  0.310  0.400   -0.40   -0.40
piecewise linear 6 knots     6  0.157  0.343    0.34    0.34
cubic spline 6 knots         8  0.151  0.339    0.47    0.47
RBF 8 bumps + ridge          8  0.174  0.327    0.40    0.20</div>
  <p>Inside the data range, the polynomial, both splines and the RBF model all reach test RMSE ≈ 0.33–0.34, near the noise floor of 0.3; the 6-bin staircase is worse (0.400) because it is flat inside each bin. Outside the range the difference is dramatic: the cubic polynomial predicts 4.98 and 19.73 (it heads to infinity), while the splines hold their edge value (sklearn's default <code>extrapolation="constant"</code>) and the RBF model fades back toward its intercept as the bumps vanish. None of them knows the sine continues: no basis can extrapolate a pattern it has not seen, but local bases at least fail gracefully.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Basis expansion</strong>: replace x by a vector of fixed functions φ(x) = (φ₁(x), …, φ_m(x)) and fit a linear model ŷ = w₀ + wᵀφ(x). <strong>Global</strong> bases (powers, Fourier sines/cosines) change the whole curve when one weight changes; <strong>local</strong> bases (bins, hinges, B-splines, RBFs) change it only near one place. A <strong>knot</strong> is a point where a piecewise basis is allowed to change its formula.</p>
  </div>
  <div class="cards">
    <div><b>Polynomial</b><p>Global, smooth, few columns for one input. Edges and extrapolation explode.</p><small>Degree 2–3, small ranges</small></div>
    <div><b>Steps / bins</b><p>Local, jumpy, very robust, easy to explain.</p><small>Scorecards, coarse effects</small></div>
    <div><b>Hinges</b><p>Piecewise straight lines; sharp corners at knots.</p><small>Thresholds, saturation; MARS</small></div>
    <div><b>Splines</b><p>Local and smooth; natural splines extrapolate linearly.</p><small>The default for a smooth 1-D effect; GAMs</small></div>
    <div><b>RBF</b><p>Bumps at centres; width = smoothness.</p><small>Kernel methods, smooth interpolation</small></div>
    <div><b>Fourier</b><p>sin(2πkt/P), cos(2πkt/P) for a known period P.</p><small>Seasonality in time series (Prophet uses this)</small></div>
  </div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Basis functions are the bridge to much of modern ML. A <strong>GAM</strong> (generalized additive model) puts a spline basis on each input and adds them up. A <strong>kernel method</strong> (SVM, kernel ridge) uses one RBF bump per training point without ever building the columns (the kernel trick). A <strong>neural network</strong>'s hidden layer is a set of hinges (ReLUs) whose knots and directions are <em>learned</em> instead of fixed. Same idea each time: build useful columns, then a linear model on top.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The number of knots, bins or centres is a capacity knob just like polynomial degree: too many and you overfit. Choose it by cross-validation (next section), or use many knots plus a penalty (penalised splines). And fit the knot positions on the training data only: a <code>SplineTransformer</code> fitted on the full dataset leaks the test range into the features.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We have chosen degree 3 and 6 knots by looking at a test set, which is cheating: in real work the test set is touched once, at the end. How do we pick the degree honestly?</div>

  <h2 id="pr-cv"><span class="num">08</span>Choosing the Degree by Cross-Validation</h2>
  <h3>Why not training error, and why not the test set</h3>
  <p>Training error always prefers the highest degree (section 04), so it cannot choose. The test set must stay untouched until the final check, or its score stops being an honest estimate. The answer is <strong>k-fold cross-validation</strong> on the training data (full treatment in <a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a>): split the training rows into k folds, train on k − 1, measure error on the one left out, rotate, average. Pick the degree with the lowest average validation error.</p>
  <h3>The fold table</h3>
  <p>Five shuffled folds of the 20 sine points (4 points each), degrees 1 to 10. The pipeline is rebuilt inside every fold, so the scaler only ever sees that fold's training rows. sklearn's scorers are "higher is better", so MSE is reported as <code>neg_mean_squared_error</code> and we flip the sign.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.model_selection import KFold, cross_val_score, GridSearchCV

rng = np.random.default_rng(0)                      # the same 20 sine points
x = np.sort(rng.uniform(0, 1, 20)); x[[0, -1]] = 0, 1
y = np.sin(2 * np.pi * x) + rng.normal(0, 0.3, 20)
X = x[:, None]

cv = KFold(5, shuffle=True, random_state=0)
print("deg  fold MSEs (5 folds)                    mean     std")
for d in range(1, 11):
    pipe = make_pipeline(PolynomialFeatures(d), StandardScaler(), LinearRegression())
    mse = -cross_val_score(pipe, X, y, cv=cv, scoring="neg_mean_squared_error")
    print(f"{d:3d}  " + " ".join(f"{v:7.3f}" for v in mse) + f"  {mse.mean():6.3f}  {mse.std():6.3f}")

pipe = make_pipeline(PolynomialFeatures(), StandardScaler(), Ridge())
grid = GridSearchCV(pipe, {"polynomialfeatures__degree": [1, 3, 5, 9, 15],
                           "ridge__alpha": [1e-3, 1e-2, 0.1, 1, 10]},
                    cv=cv, scoring="neg_mean_squared_error", n_jobs=1).fit(X, y)
print("grid best:", grid.best_params_, " CV MSE", round(-grid.best_score_, 3))</div>
  <div class="fx" data-lang="text">deg  fold MSEs (5 folds)                    mean     std
  1    0.822   0.276   0.571   0.127   0.265   0.412   0.251
  2    1.753   0.272   0.695   0.131   0.393   0.649   0.583
  3    0.059   0.033   0.062   0.021   0.010   0.037   0.021
  4    0.226   0.031   0.060   0.040   0.007   0.073   0.078
  5    1.113   0.033   0.060   0.043   0.007   0.251   0.431
  6    0.825   0.033   0.067   0.049   0.017   0.198   0.314
  7   27.862   0.038   0.084   0.052   0.169   5.641  11.111
  8    0.213   0.037   0.337   0.051   0.429   0.213   0.154
  9    9.162   0.038   0.246   0.052   0.306   1.961   3.602
 10   56.455   0.039   0.197   0.053   0.201  11.389  22.533
grid best: {'polynomialfeatures__degree': 3, 'ridge__alpha': 0.001}  CV MSE 0.039</div>
  <h3>Reading it by hand</h3>
  <p>Degree 3's mean: (0.059 + 0.033 + 0.062 + 0.021 + 0.010) / 5 = 0.185 / 5 = <strong>0.037</strong>, the lowest in the table. Now look at the first fold column: degrees 7, 9 and 10 score 27.9, 9.2 and 56.5 there, while their other folds are fine. That fold holds the right end point x = 1, so the models trained without it must <em>extrapolate</em> to it, and high-degree polynomials explode outside their data. This is section 04's edge problem showing up inside CV. It also shows why we look at the spread, not just the mean.</p>
  <p><strong>The one-standard-error rule.</strong> CV scores are themselves noisy (only 4 validation points per fold here). A common habit is to choose the <em>simplest</em> model whose mean is within one standard error of the best. The standard error of degree 3's mean is std / √5 = 0.021 / 2.236 = 0.0094, so the bar is 0.037 + 0.009 = 0.046. Degrees 1 and 2 (0.412, 0.649) are far above it, so the rule also picks degree 3. When a higher degree only wins by a hair, the rule prefers the lower one.</p>
  <table class="tbl">
    <tr><th>Step</th><th>What to do</th></tr>
    <tr><td>1</td><td>Put <code>PolynomialFeatures</code> (or <code>SplineTransformer</code>), the scaler and the model in one <code>Pipeline</code></td></tr>
    <tr><td>2</td><td>Grid over degree (and the penalty α if regularising), using step names: <code>polynomialfeatures__degree</code>, <code>ridge__alpha</code></td></tr>
    <tr><td>3</td><td>Score with k-fold CV on the training data; use shuffled folds unless the data has an order (time series: <code>TimeSeriesSplit</code>)</td></tr>
    <tr><td>4</td><td>Pick the best (or 1-SE) setting, refit on all training data, then score once on the test set</td></tr>
  </table>
  <p>The last line of the output did step 2 over degree × ridge α jointly: it chose degree 3 with a tiny penalty (α = 0.001), CV MSE 0.039. The double underscore means "parameter of this pipeline step" (step names are the lowercase class names made by <code>make_pipeline</code>).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Model selection by cross-validation</strong>: choose the hyperparameter (degree, number of knots, α) that minimises the average validation error across k folds of the training data. The CV score of the chosen setting is slightly optimistic (you picked the best of many); for an unbiased estimate use a held-out test set or nested CV.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Running <code>PolynomialFeatures</code> + <code>StandardScaler</code> on all the data first and cross-validating only the regression leaks the validation rows' scale into training. Always cross-validate the whole pipeline. And with time-ordered data, shuffled folds let the model "interpolate the future"; use forward-chaining splits.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> CV can pick a small degree. But sometimes you want a flexible model (many columns) <em>and</em> stable weights. The grid search hinted at the tool: a penalty on the weights.</div>

  <h2 id="pr-reg"><span class="num">09</span>Taming High Degrees with Regularization</h2>
  <p>Section 04 showed the symptom of overfitting in the weights: degree 15 needed weights near 4,800 that cancel each other. Regularization attacks exactly that: it adds a cost for large weights to the least-squares loss, so the fit only uses a big weight if it really pays (the general idea is in <a class="xref" data-note="ml_regularization">Regularization</a>, the models in <a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a>). Ridge charges α·Σw², lasso charges α·Σ|w| and can set weights exactly to 0.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.metrics import mean_squared_error

rng = np.random.default_rng(0)                      # the same data as before
x = np.sort(rng.uniform(0, 1, 20)); x[[0, -1]] = 0, 1
y = np.sin(2 * np.pi * x) + rng.normal(0, 0.3, 20)
xt = rng.uniform(0, 1, 1000); yt = np.sin(2 * np.pi * xt) + rng.normal(0, 0.3, 1000)

print("degree 15 with          train   test   max|w|   nonzero")
for name, reg in [("no penalty (OLS)", LinearRegression()), ("Ridge alpha=1e-3", Ridge(1e-3)),
                  ("Ridge alpha=0.1", Ridge(0.1)), ("Ridge alpha=10", Ridge(10)),
                  ("Lasso alpha=1e-3", Lasso(1e-3, max_iter=100_000))]:
    m = make_pipeline(PolynomialFeatures(15, include_bias=False), StandardScaler(), reg).fit(x[:, None], y)
    tr = mean_squared_error(y, m.predict(x[:, None])) ** 0.5
    te = mean_squared_error(yt, m.predict(xt[:, None])) ** 0.5
    w = m[-1].coef_
    print(f"{name:22s}  {tr:.3f}  {te:.3f}  {np.abs(w).max():8.2f}  {int((w != 0).sum()):3d}/15")
print("Lasso kept powers:", [f"x^{i+1}" for i in np.flatnonzero(w)], "weights", w[w != 0].round(2))</div>
  <div class="fx" data-lang="text">degree 15 with          train   test   max|w|   nonzero
no penalty (OLS)        0.125  0.548   4794.44   15/15
Ridge alpha=1e-3        0.159  0.325      6.72   15/15
Ridge alpha=0.1         0.250  0.373      1.48   15/15
Ridge alpha=10          0.404  0.522      0.19   15/15
Lasso alpha=1e-3        0.176  0.328      4.91    4/15
Lasso kept powers: ['x^1', 'x^2', 'x^5', 'x^13'] weights [ 2.18 -4.91  2.89 -0.38]</div>
  <p>With a very small ridge penalty (α = 0.001) the largest weight drops from 4,794 to 6.7 and the test RMSE from 0.548 to 0.325, as good as the best plain polynomial. Too much penalty (α = 10) flattens the curve and underfits (test 0.522). Lasso keeps only 4 of the 15 powers (x, x², x⁵, x¹³) and still reaches 0.328: it chose the degree for us, in a way. The scaler matters here: without it, the penalty would treat x and x¹⁵ (values from 0 to 1, so x¹⁵ is tiny) completely differently.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Two ways to control capacity: <strong>fewer columns</strong> (low degree, few knots) or <strong>many columns with small weights</strong> (penalty). The second is often better because it does not have to guess which columns matter, and it is how penalised splines, kernel ridge regression and neural network weight decay all work. Either way, the knob (degree or α) is chosen by cross-validation.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Regularization does not fix extrapolation. A ridge-penalised degree-15 curve is still a polynomial and still heads to ±∞ outside the training range, only more slowly.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> With all the tools on the table: when is a polynomial the right choice at all, compared with splines, trees and other flexible models?</div>

  <h2 id="pr-compare"><span class="num">10</span>Comparisons</h2>
  <h3>Ways to model a curve</h3>
  <table class="tbl">
    <tr><th></th><th>Polynomial</th><th>Splines / GAM</th><th>RBF / kernel</th><th>Decision tree / boosting</th><th>Neural net</th></tr>
    <tr><td>Columns</td><td>fixed powers</td><td>fixed local pieces</td><td>bump per centre / per row</td><td>learned steps</td><td>learned hinges</td></tr>
    <tr><td>Fitting</td><td>OLS (closed form)</td><td>OLS / penalised OLS</td><td>ridge, SVM</td><td>greedy splits</td><td>gradient descent</td></tr>
    <tr><td>Smooth?</td><td>yes</td><td>yes</td><td>yes</td><td>no (steps)</td><td>yes-ish (piecewise linear)</td></tr>
    <tr><td>Edges / extrapolation</td><td>explodes</td><td>controlled (linear tails)</td><td>fades to intercept</td><td>flat</td><td>linear, unpredictable</td></tr>
    <tr><td>Interactions</td><td>products, by hand</td><td>by hand (tensor splines)</td><td>automatic</td><td>automatic</td><td>automatic</td></tr>
    <tr><td>Many inputs</td><td>column explosion</td><td>fine if additive</td><td>slow (n × n kernel)</td><td>excellent</td><td>excellent with lots of data</td></tr>
    <tr><td>Interpretability</td><td>good at low degree</td><td>very good (plot each effect)</td><td>low</td><td>rules / SHAP</td><td>low</td></tr>
    <tr><td>Statistical inference</td><td>full (p-values, CIs)</td><td>full</td><td>limited</td><td>none</td><td>none</td></tr>
  </table>
  <h3>Choosing quickly</h3>
  <table class="tbl">
    <tr><th>Situation</th><th>Reach for</th></tr>
    <tr><td>One or two inputs with a gentle bend, need p-values</td><td>Quadratic (centred), maybe one interaction</td></tr>
    <tr><td>Smooth effect of unknown shape, need to explain it</td><td>Natural / B-splines (a GAM)</td></tr>
    <tr><td>A threshold or saturation</td><td>Hinge (piecewise linear) at a known or searched knot</td></tr>
    <tr><td>Known period (day, week, year)</td><td>Fourier terms</td></tr>
    <tr><td>Many inputs, many interactions, tabular data</td><td>Gradient boosting (<a class="xref" data-note="ml_gbm">Gradient Boosting</a>)</td></tr>
    <tr><td>Must extrapolate</td><td>Linear or physically motivated model; never a high-degree polynomial</td></tr>
  </table>

  <h2 id="pr-traps"><span class="num">11</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: choosing degree by training error</span>
    <p>Training error falls with every extra degree (0.689 → 0.125 on the sine data) and reaches 0 at degree n − 1. Choose degree, knots or α by cross-validation on training data, then check once on the test set.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: not scaling the powers</span>
    <p>Raw years give cond(XᵀX) ≈ 10²² and garbage weights; unscaled powers also make ridge/lasso penalties and gradient descent meaningless. Centre or standardise x, and standardise after <code>PolynomialFeatures</code>, inside a pipeline.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: trusting the curve outside the data</span>
    <p>Degree 15 predicted −214 at x = 1.1 (truth 0.59), and even a sensible quadratic said slower-than-7-km/h cars need more braking distance. Polynomials are only valid inside the range they were fitted on, and are least reliable at its edges.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reading b₁ as "the effect of x"</span>
    <p>With x² or a·b in the model, the effect of x is b₁ + 2b₂x or b₁ + b₃b. b₁ alone is the effect at x = 0 (or b = 0). Centre the inputs or report the slope at meaningful values.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: dropping main effects but keeping the product</span>
    <p>A model with a·b but without a or b forces the effect of a to be zero when b = 0, an assumption almost never intended. Follow the hierarchy principle.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: polynomial-expanding everything</span>
    <p>All numeric and one-hot columns at degree 3 can produce tens of thousands of columns, duplicates (dummy² = dummy) and very slow fits. Expand only the numeric columns you believe bend, add only interactions you can justify, or use a model that finds them (trees, boosting).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting it is still linear regression</span>
    <p>All of linear regression's assumptions still apply to the residuals (independence, constant variance). Polynomial terms fix the shape of the mean, not heteroscedasticity or correlated errors; recheck the diagnostics after adding them.</p>
  </div>

  <h2 id="pr-qa"><span class="num">12</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Polynomial regression fits a curve. Why is it still called a linear model?</summary><div class="qa-body">Because it is linear in the parameters: ŷ = b₀ + b₁x + b₂x² is a weighted sum of fixed columns (1, x, x²). Least squares, the normal equation, standard errors and p-values work unchanged. "Linear" refers to the weights, not to the shape in x.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you notice that you need a polynomial or spline term in the first place?</summary><div class="qa-body">A residual plot (residuals against x or against ŷ) with a pattern, such as a smile: positive at both ends, negative in the middle (+ − − − + on the braking data). Domain knowledge (braking distance grows with speed²) and partial-dependence or binned-average plots also show bends. A high R² alone does not rule out curvature (the line had R² 0.94).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many columns does PolynomialFeatures create for 10 inputs at degree 3?</summary><div class="qa-body">C(10 + 3, 3) = 286 including the bias column, so 285 without it. In general C(k + d, d), which grows like k^d / d!. With 50 inputs, degree 3 gives 23,425 columns.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Training RMSE keeps falling as you raise the degree. Why, and what do you do?</summary><div class="qa-body">A higher-degree model contains every lower-degree model (set the extra weights to 0), so its best training error can only be equal or lower; at degree n − 1 it interpolates. Choose the degree by k-fold cross-validation (optionally with the one-standard-error rule), not by training error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why should you centre or standardise x before or after creating powers?</summary><div class="qa-body">(1) x and x² are highly correlated on a positive range (0.981 for 1..5), causing multicollinearity and unstable b₀, b₁; centring makes them nearly uncorrelated. (2) Powers of large numbers are huge (years cubed ≈ 10¹⁰), so XᵀX becomes numerically singular (cond ≈ 10²²). (3) Penalties and gradient descent need comparable scales. Predictions do not change, only stability and interpretation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In ŷ = 3.2 − 1.4x + x², what is the effect of x, and where is the turning point?</summary><div class="qa-body">The effect is the derivative −1.4 + 2x: 0.6 at x = 1, 4.6 at x = 3, 8.6 at x = 5. The turning point is where it is 0: x = 1.4 / 2 = 0.7, ŷ = 2.71. It lies outside the data (x from 1 to 5), so it is an artefact, not a finding.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is an interaction term and how do you interpret its coefficient?</summary><div class="qa-body">A product column a·b. With ŷ = b₀ + b₁a + b₂b + b₃ab, the effect of a is b₁ + b₃b, so b₃ is how much a's slope changes per unit of b (and vice versa). Example: TV slope 1.99 + 0.48·radio. b₁ alone is a's effect when b = 0. Keep the main effects (hierarchy principle).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a basis function expansion? Give three examples besides powers.</summary><div class="qa-body">Replacing x by fixed functions φ₁(x)…φ_m(x) and fitting a linear model on them. Examples: step/bin indicators, hinges max(0, x − c), cubic B-splines (local bumps that sum to 1), Gaussian RBFs exp(−(x − c)²/2s²), Fourier sin/cos terms for seasonality.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why are splines usually preferred over high-degree polynomials?</summary><div class="qa-body">Splines are local: each piece only affects the curve between nearby knots, so one point cannot swing the whole fit, the columns stay small and well conditioned, and edges are tame (natural splines are linear beyond the boundary knots). High-degree polynomials are global, ill-conditioned and oscillate at the edges (Runge's phenomenon).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a knot do, and how do you choose how many?</summary><div class="qa-body">A knot is where the piecewise formula is allowed to change (a hinge bends there; a spline switches to a new cubic with matching value, slope and curvature). More knots = more flexibility = more variance. Place them at quantiles of x and choose the number by cross-validation, or use many knots with a smoothness penalty.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which model would you trust to extrapolate: degree-3 polynomial, cubic spline, or decision tree?</summary><div class="qa-body">None fully. The polynomial heads to ±∞ (predicted 4.98 and 19.73 for a sine bounded by 1). sklearn's spline holds its edge value by default (natural splines continue linearly). A tree is flat beyond its last split. For genuine extrapolation use a model whose behaviour outside the data comes from domain knowledge.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In a 5-fold CV of polynomial degree, degree 10 has fold MSEs 56.5, 0.04, 0.20, 0.05, 0.20. What is going on?</summary><div class="qa-body">One fold contains an end point of the x range, so the model trained on the other folds must extrapolate to it, and a high-degree polynomial explodes there. The mean (11.4) is dominated by that fold. It is a sign of an unstable, overfitting model; lower degree, splines or a penalty fix it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does polynomial regression connect to ridge and lasso?</summary><div class="qa-body">High degrees create many correlated columns and huge cancelling weights (max |w| ≈ 4,800 at degree 15). Ridge shrinks them (Ridge(0.001): max |w| 6.7, test RMSE 0.548 → 0.325); lasso zeros most powers (kept 4 of 15). The degree can then be generous and α is tuned by CV. Scale the columns first, since penalties are scale-sensitive.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How are kernels (SVM) and neural networks related to basis functions?</summary><div class="qa-body">An RBF kernel is an RBF basis with one bump per training point, used implicitly through the kernel trick instead of building the columns. A ReLU hidden layer is a set of hinge basis functions whose knots and directions are learned by gradient descent. Both are "features, then a linear model", like polynomial regression.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You add x² and the p-value of x becomes large. Should you drop x?</summary><div class="qa-body">No. With x² in the model, the coefficient of x is the slope at x = 0, which may be near zero or poorly determined simply because 0 is outside the data; x and x² are also correlated, inflating standard errors. Keep lower-order terms when a higher-order one is in (hierarchy), and centre x to make the coefficients meaningful.</div></details>
</main>
`
});
