// notes/ml/ml_polyreg.js — Polynomial & Basis Functions
Object.assign(TOPIC_CONTENT, {
  "ml_polyreg": `<main>
  <h1>Polynomial Regression &amp; Basis Functions</h1>
  <div class="where"><span>Machine Learning</span><span>Regression</span><span>Polynomial &amp; Basis Functions</span></div>
  <p class="lead">Linear regression can only draw straight lines, yet the world is full of curves: house prices climb faster than floor area, stopping distance grows faster than speed, sales saturate. This note shows the one trick that fixes it without a new algorithm: <em>feed linear regression new columns</em> (size², size³, size·rooms, hinges, splines, bumps) and let it find the weights as before. Every formula is worked by hand on the six houses of the Regression group first (the same table whose straight-line residuals made a smile in Assumptions &amp; Diagnostics), then checked in code: fitting the curve by hand, building polynomial features, watching degree cause overfitting, why powers must be centred, interaction terms, basis functions (steps, hinges, splines, radial bumps), choosing the degree by cross-validation, and taming high degrees with a penalty. A larger sine-wave dataset shows the same ideas at scale.</p>

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
    <li><b>Came from: <a class="xref" data-note="ml_regression">Linear Regression</a> and <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a></b><span>We fitted price = −16 + 7·size to six houses and read its coefficients. The diagnostics note then showed the residuals +2, 0, −1, −2, −3, +4 make a "smile" (positive at both ends, negative in the middle), that adding a squared column cut SSE from 34 to 9.9, and that the largest flat F was the most influential house precisely because it shows the bend. The linearity assumption fails in a systematic way that more data will not fix.</span></li>
    <li><b>This note adds: curves with the same machinery</b><span>Make new columns from the old ones (size², size³, size·rooms, max(0, size − 11), Gaussian bumps, spline pieces) and run ordinary linear regression on them. The model stays linear in its <em>weights</em>, so the normal equation, statsmodels summaries and every diagnostic still apply. You will learn how to build these columns, how many you get, why they must be centred, how degree causes overfitting and how to choose it by cross-validation.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a></b><span>Polynomial columns multiply fast (10 inputs at degree 3 = 285 columns), are strongly correlated with each other (size and size²: 0.991), and let the fit chase noise. The cure is to penalise big weights. The general idea is in <a class="xref" data-note="ml_regularization">Regularization</a>; the bias–variance reason it works is in <a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a>. Trees (<a class="xref" data-note="ml_dtree">Decision Trees</a>) are the other road to curves: they build step-function bases automatically.</span></li>
  </ol>
  <h3>The Regression group as one ladder</h3>
  <table class="tbl">
    <tr><th>Step</th><th>Note</th><th>On the six houses</th><th>Leaves open</th></tr>
    <tr><td>1</td><td><a class="xref" data-note="ml_regression">Linear Regression</a></td><td>price = −16 + 7·size, R² 0.990</td><td>can we trust the SEs?</td></tr>
    <tr><td>2</td><td><a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a></td><td>residual smile; VIF 16 for size and rooms; F most influential</td><td>fit the curve</td></tr>
    <tr><td>3</td><td><strong>Polynomial &amp; Basis Functions</strong> (this)</td><td>price = 58.66 + 7(size − 11) + 0.2009(size − 11)², SSE 9.89; LOOCV picks degree 2</td><td>more, correlated columns → unstable weights</td></tr>
    <tr><td>4</td><td><a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a></td><td>penalised weights; ridge shares size/rooms, lasso drops rooms</td><td>choose α by CV</td></tr>
  </table>
  <p>You should know least squares and the normal equation (<a class="xref" data-note="ml_regression">Linear Regression</a>) and what a train/validation split is (<a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a>). Each is recalled in a line where it is used. The data, recalled: houses A–F with size 6, 8, 10, 12, 14, 16 (hundreds of sq ft), bedrooms 1, 2, 2, 3, 3, 4, localities Old town, Suburb, Metro, Old town, Suburb, Metro, and price 28, 40, 53, 66, 79, 100 lakh.</p>

  <h2 id="pr-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question.</p>
  <ol class="story">
    <li><b>Curvature</b><span>Q: what is wrong with the straight line? → Its residuals +2, 0, −1, −2, −3, +4 form a smile: each extra 100 sq ft adds more for big flats than small ones. How do we fit a curve without new machinery?</span></li>
    <li><b>New columns, same regression</b><span>Q: can linear regression fit a curve? → Yes: add a size² column. By hand: price = 58.66 + 7z + 0.2009z² (z = size − 11), SSE 34 → 9.89. With several inputs, which columns do we add?</span></li>
    <li><b>Polynomial features</b><span>Q: what is the full set of new columns? → Every product of inputs up to degree d: house F (16, 4) → 1, 16, 4, 256, 64, 16; C(k + d, d) − 1 columns. If degree 2 helped, is a higher degree better?</span></li>
    <li><b>Degree vs overfitting</b><span>Q: does more degree mean a better model? → Training SSE falls 34, 9.9, 3.1, 0.19, 0 and degree 5 passes through all six houses, yet it prices an 1,800 sq ft flat at 152 (degree 2: 117.5); at scale the test error is a U. Why do high powers also misbehave numerically?</span></li>
    <li><b>Scaling &amp; collinearity</b><span>Q: why are power columns unstable? → size and size² correlate 0.991 (VIF 57.7); centring makes it exactly 0; raw years³ give cond(XᵀX) 10²². Squares bend one input; what if one input changes another's effect?</span></li>
    <li><b>Interactions</b><span>Q: can the value of size differ by locality? → Add size × metro: 6.4 lakh per 100 sq ft outside Metro, 7.83 in Metro. Are powers and products the only columns we can add?</span></li>
    <li><b>Basis functions</b><span>Q: what other shapes can new columns make? → Bins (34, 59.5, 89.5), a hinge at 1,100 sq ft (slope 5.88 → 8.13), RBF bumps, B-splines; local bases do not explode at the edges. How do we choose degree or knots honestly?</span></li>
    <li><b>Cross-validation</b><span>Q: which degree? → Leave-one-out MSE 18.96, 14.30, 24.38, 17.15 for degrees 1–4 → degree 2; at scale 5-fold CV picks 3. What if we want flexibility and stable weights at once?</span></li>
    <li><b>Regularization</b><span>Q: can we keep many columns but tame them? → Degree 5 + Ridge(0.1): largest weight 2,257 → 11.5, 1,800 sq ft 152 → 121. How penalties work in full → <a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a>.</span></li>
  </ol>

  <h2 id="pr-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Polynomial &amp; Basis Functions</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">1 · The problem &amp; the trick</div>
        <ul>
          <li>Curved truth + straight line → residual <b>smile</b>, SSE 34 on the six houses</li>
          <li><b>Trick</b>: add columns size², size³ … then run plain linear regression</li>
          <li><b>Linear in the weights</b>, not in x → OLS, normal equation, p-values all still work</li>
          <li>Houses: ŷ = 58.66 + 7z + 0.2009z², SSE 9.89 (z = size − 11)</li>
          <li>Slope of a quadratic = b₁ + 2b₂z: 4.99 at 600 sq ft, 9.01 at 1,600</li>
          <li>💡 Same oven, new ingredients: the recipe (OLS) never changes</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">2 · Polynomial features</div>
        <ul>
          <li>(size, rooms) = (16, 4), degree 2 → 1, 16, 4, 256, 64, 16</li>
          <li>Count (no bias) = C(k + d, d) − 1: 10 inputs → 65 (d=2), 285 (d=3), 1,000 (d=4)</li>
          <li><code>PolynomialFeatures(degree, interaction_only, include_bias)</code></li>
          <li>statsmodels: <code>y ~ x + I(x**2)</code>; <code>a*b</code> = a + b + a:b</li>
          <li>⚠ Column explosion → overfitting + slow</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">3 · Degree &amp; overfitting</div>
        <ul>
          <li>n points → degree n − 1 passes through all (houses: degree 5, SSE 0)</li>
          <li>Train error always falls with degree; test error is a <b>U</b></li>
          <li>Sine (at scale): deg 1 test 0.58 · deg 3 test 0.33 · deg 15 test 0.55</li>
          <li>Weights explode (deg 15 max |w| ≈ 4,800) → wild edges (Runge)</li>
          <li>⚠ Extrapolation: houses deg 5 → 152 at 1,800 sq ft; sine deg 15 → −214</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">4 · Scaling &amp; collinearity</div>
        <ul>
          <li>corr(size, size²) = 0.991 for 6..16; <b>0</b> after centring</li>
          <li>Years 2000–2010: x³ ≈ 8·10⁹, cond(XᵀX) ≈ 10²² → numerically broken</li>
          <li>Centre / standardise → cond ≈ 38</li>
          <li>Same curve, different b₀, b₁ (they describe x = 0); predictions identical</li>
          <li>Orthogonal polynomials: 1, z, 3z² − 35 make each weight one division</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">5 · Interactions</div>
        <ul>
          <li>ŷ = b₀ + b₁a + b₂b + b₃·a·b → slope of a = b₁ + b₃·b</li>
          <li>Houses: size slope 6.4 (non-Metro), 7.83 (Metro)</li>
          <li>TV × radio (at scale): CV R² 0.933 → 0.969</li>
          <li><b>Hierarchy</b>: keep a and b when you keep a·b</li>
          <li>Trees find interactions on their own; linear models need them typed in</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">6 · Basis functions</div>
        <ul>
          <li>ŷ = Σ wⱼ φⱼ(x): choose the φ's, OLS finds the w's</li>
          <li><b>Steps</b> (34, 59.5, 89.5) · <b>hinge</b> max(0, size − 11): 5.88 → 8.13 · <b>splines</b></li>
          <li><b>B-splines</b>: local bumps that sum to 1; cubic, 5 knots → 7 columns</li>
          <li><b>RBF</b>: exp(−(x − c)² / 2s²), a bump at each centre c</li>
          <li>Local bases do not explode outside the data; polynomials do</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">7 · Choosing &amp; taming</div>
        <ul>
          <li>Pick degree / knots by <b>cross-validation</b>, never by training error</li>
          <li>Houses LOOCV (PRESS e/(1 − h)): 18.96, <b>14.30</b>, 24.38, 17.15 → degree 2</li>
          <li><b>1-SE rule</b>: simplest model within one standard error of the best</li>
          <li>Grid name: <code>polynomialfeatures__degree</code></li>
          <li>Houses deg 5 + Ridge(0.1): max |w| 2,257 → 11.5</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="pr-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="pr-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">When a Line Is Not Enough</span><span class="rm-sub">The houses' residual smile</span></div></div>
      <div class="rm-item rm-done" data-target="pr-trick"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">New Columns, Same Regression</span><span class="rm-sub">A quadratic fitted by hand</span></div></div>
      <div class="rm-item rm-done" data-target="pr-features"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Polynomial Features</span><span class="rm-sub">Expansion and counting</span></div></div>
      <div class="rm-item rm-done" data-target="pr-overfit"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Degree vs Overfitting</span><span class="rm-sub">The U-curve, edges, extrapolation</span></div></div>
      <div class="rm-item rm-done" data-target="pr-scale"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Scaling &amp; Collinearity</span><span class="rm-sub">Why powers must be centred</span></div></div>
      <div class="rm-item rm-done" data-target="pr-inter"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Interaction Terms</span><span class="rm-sub">When one effect depends on another</span></div></div>
      <div class="rm-item rm-done" data-target="pr-basis"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Basis Functions</span><span class="rm-sub">Steps, hinges, splines, RBF</span></div></div>
      <div class="rm-item rm-done" data-target="pr-cv"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Choosing the Degree by CV</span><span class="rm-sub">LOOCV by hand, fold table, 1-SE rule</span></div></div>
      <div class="rm-item rm-done" data-target="pr-reg"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Taming It with Regularization</span><span class="rm-sub">Ridge and lasso on high degrees</span></div></div>
      <div class="rm-item rm-done" data-target="pr-connect"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One trick, many columns</span></div></div>
      <div class="rm-item rm-done" data-target="pr-compare"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Comparisons</span><span class="rm-sub">Polynomials vs splines vs trees</span></div></div>
      <div class="rm-item rm-done" data-target="pr-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Scaling, leakage, extrapolation</span></div></div>
      <div class="rm-item rm-done" data-target="pr-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="pr-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="pr-need"><span class="num">01</span>When a Straight Line Is Not Enough</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The diagnostics note found that the line price = −16 + 7·size misses the six houses in a pattern. What exactly is the pattern telling us about how price depends on size, and why can no straight line fix it?</p>
  </div>
  <h3>The need</h3>
  <p>Many real relationships bend. A flat's price grows faster than its floor area (big flats are rarer and come with premium features). A car's stopping distance grows faster than its speed (kinetic energy is ½mv²). Ice-cream sales rise with temperature, then drop in a heatwave when people stay indoors. A salary rises quickly in the first years of a career, then flattens.</p>
  <p>Linear regression assumes ŷ = b₀ + b₁x: every extra unit of x adds the <em>same</em> amount b₁ to the prediction, everywhere. For a curve that is false. No tilt of a straight line can follow a bend, so the errors are not random: they have a shape.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Trying to trace a cricket ball's arc with a ruler. However you hold the ruler, it is above the ball in the middle of the flight and below it at both ends. The ruler is not badly placed; it is the wrong tool. You need a flexible curve, and the cheapest flexible curve is a ruler that is allowed to bend in a controlled way.</p>
  </div>
  <h3>The data: six houses</h3>
  <table class="tbl">
    <tr><th>house</th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th><th>F</th></tr>
    <tr><td>size x (hundreds of sq ft)</td><td>6</td><td>8</td><td>10</td><td>12</td><td>14</td><td>16</td></tr>
    <tr><td>price y (lakh ₹)</td><td>28</td><td>40</td><td>53</td><td>66</td><td>79</td><td>100</td></tr>
    <tr><td>step from previous house</td><td>–</td><td>+12</td><td>+13</td><td>+13</td><td>+13</td><td>+21</td></tr>
  </table>
  <p>The last row already hints at the problem: every 200 sq ft adds about 12–13 lakh, except the last step, which adds 21.</p>
  <h3>Worked by hand: the best straight line, recalled</h3>
  <p>From <a class="xref" data-note="ml_regression">Linear Regression</a>: slope = Σ(dx·dy) / Σdx² = 490 / 70 = 7, intercept = 61 − 7 × 11 = −16. The residuals (real minus predicted):</p>
  <table class="tbl out"><caption>The straight line's errors</caption>
    <tr><th>house</th><th>x</th><th>y</th><th>ŷ = −16 + 7x</th><th>residual y − ŷ</th><th>sign</th><th>residual²</th></tr>
    <tr><td>A</td><td>6</td><td>28</td><td>26</td><td>+2</td><td>+</td><td>4</td></tr>
    <tr><td>B</td><td>8</td><td>40</td><td>40</td><td>0</td><td>0</td><td>0</td></tr>
    <tr><td>C</td><td>10</td><td>53</td><td>54</td><td>−1</td><td>−</td><td>1</td></tr>
    <tr><td>D</td><td>12</td><td>66</td><td>68</td><td>−2</td><td>−</td><td>4</td></tr>
    <tr><td>E</td><td>14</td><td>79</td><td>82</td><td>−3</td><td>−</td><td>9</td></tr>
    <tr><td>F</td><td>16</td><td>100</td><td>96</td><td>+4</td><td>+</td><td>16</td></tr>
    <tr><td colspan="6"><strong>SSE (sum of squared errors)</strong></td><td><strong>34</strong></td></tr>
  </table>
  <p>Look at the signs: <strong>+ 0 − − − +</strong>. The line is too low at both ends and too high in the middle. Random errors would have mixed signs in no pattern. A run of signs like this, plotted against x, is the "residual smile", the fingerprint of a missed curve. It also misprices exactly the flats the dealer cares most about: the biggest one sold 4 lakh above the line.</p>
  <div class="fx" data-lang="py">import numpy as np
size = np.array([6, 8, 10, 12, 14, 16.0])       # houses A-F, hundreds of sq ft
price = np.array([28, 40, 53, 66, 79, 100.0])   # lakh rupees
w, b = np.polyfit(size, price, 1)               # the straight line from Linear Regression
res = price - (b + w * size)
print(f"line: price = {b:.1f} + {w:.1f} * size")
print("residuals:", res.round(2) + 0.0, " signs:", "".join("+" if r &gt; 0 else "-" if r &lt; 0 else "0" for r in res))
print(f"SSE {res @ res:.1f}   R2 {1 - res @ res / ((price - price.mean()) @ (price - price.mean())):.4f}")</div>
  <div class="fx" data-lang="text">line: price = -16.0 + 7.0 * size
residuals: [ 2.  0. -1. -2. -3.  4.]  signs: +----+
SSE 34.0   R2 0.9902</div>
  <figure class="viz"><svg viewBox="0 0 520 270" width="520">
<line x1="60" y1="230" x2="500" y2="230" stroke="currentColor"/><line x1="60" y1="20" x2="60" y2="230" stroke="currentColor"/>
<text x="52" y="234" text-anchor="end" class="tm" font-size="11">0</text><text x="52" y="186" text-anchor="end" class="tm" font-size="11">25</text><text x="52" y="139" text-anchor="end" class="tm" font-size="11">50</text><text x="52" y="91" text-anchor="end" class="tm" font-size="11">75</text><text x="52" y="43" text-anchor="end" class="tm" font-size="11">100</text>
<text x="123" y="246" text-anchor="middle" class="tm" font-size="11">6</text><text x="186" y="246" text-anchor="middle" class="tm" font-size="11">8</text><text x="249" y="246" text-anchor="middle" class="tm" font-size="11">10</text><text x="311" y="246" text-anchor="middle" class="tm" font-size="11">12</text><text x="374" y="246" text-anchor="middle" class="tm" font-size="11">14</text><text x="437" y="246" text-anchor="middle" class="tm" font-size="11">16</text>
<text x="280" y="264" text-anchor="middle" class="tm" font-size="11.5">size (hundreds of sq ft)</text><text x="66" y="16" class="tm" font-size="11.5">price (lakh ₹)</text>
<line x1="91" y1="194" x2="469" y2="33" class="sr" stroke-width="2"/>
<polyline points="91,184 107,180 123,175 139,170 154,165 170,160 186,155 201,149 217,143 233,137 249,131 264,125 280,118 296,111 311,104 327,97 343,90 359,82 374,74 390,67 406,58 421,50 437,42 453,33 469,24" fill="none" class="sb" stroke-width="2.2"/>
<circle cx="123" cy="177" r="5" class="ft st"/><circle cx="186" cy="154" r="5" class="ft st"/><circle cx="249" cy="129" r="5" class="ft st"/><circle cx="311" cy="104" r="5" class="ft st"/><circle cx="374" cy="79" r="5" class="ft st"/><circle cx="437" cy="39" r="5" class="ft st"/>
<text x="113" y="170" text-anchor="end" font-size="11">A</text><text x="427" y="34" text-anchor="end" font-size="11">F</text><text x="384" y="92" font-size="11">E</text>
<text x="80" y="40" class="tr" font-size="12.5">line ŷ = −16 + 7x   (SSE 34)</text>
<text x="80" y="58" class="tb" font-size="12.5">curve ŷ = 5.96 + 2.58x + 0.2009x²   (SSE 9.89)</text>
</svg><figcaption>The six houses. The red line is a little too low at A and F and too high at C, D, E. The blue quadratic, found in section 02, bends upward to follow the price climb of the big flats.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p>A relationship is <strong>nonlinear</strong> in x when the change in y caused by a one-unit change in x depends on where you are (it is not a constant b₁). Its sign in a fitted linear model: <strong>residuals with a pattern</strong> against x or against ŷ (a smile, a frown, an S), not a random cloud around zero.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A high R² does not prove the relation is straight. This line has R² = 1 − 34 / 3464 = 0.990, which looks excellent, yet it is systematically wrong at both ends. Always look at the residual plot (<a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: New columns, same linear regression.</b> We need a curve, but we do not want to throw away everything we know about linear regression (least squares, the normal equation, p-values, diagnostics). Is there a way to get curves while keeping all of it?</div>

  <h2 id="pr-trick"><span class="num">02</span>The Trick: New Columns, Same Linear Regression</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The houses need a curve. Do we need a new algorithm with new formulas, or can the least squares we already know produce a curve if we feed it the right table?</p>
  </div>
  <h3>Plain words</h3>
  <p>Linear regression multiplies each <em>column</em> by a weight and adds them up. It does not care what the columns are. So make a new column, size², and put it next to size. The model becomes</p>
  <p style="text-align:center"><strong>ŷ = b₀ + b₁·x + b₂·x²</strong></p>
  <p>As a function of x this is a parabola, a curve. But as a function of the weights b₀, b₁, b₂ it is still "weight × column, added up", exactly the form least squares knows how to solve. Nothing in the fitting changes. Only the table changes: it now has a column whose values are 36, 64, 100, 144, 196, 256.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A tailor who can only cut straight lines can still make a round collar: give him many short straight pieces to join, or a pre-curved piece of cloth. Linear regression is the tailor; x², x³ and friends are pre-curved pieces. He still only decides how much of each piece to use.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Polynomial regression of degree d</strong>: ŷ = b₀ + b₁x + b₂x² + … + b_d x^d, fitted by ordinary least squares on the columns x, x², …, x^d. It is a <strong>linear model</strong> because it is linear in the parameters b: doubling one weight doubles its contribution, and the loss is a bowl in the weights with one minimum. "Linear model" never meant "straight line in x".</p>
  </div>
  <h3>Worked by hand: fitting the quadratic</h3>
  <p>With three columns [1, x, x²], the normal equation (XᵀX)b = Xᵀy is a 3 × 3 system. Here it is, every entry being a sum you can check: Σ1 = 6, Σx = 66, Σx² = 796, Σx³ = 10,296, Σx⁴ = 140,080, Σy = 366, Σxy = 4,516, Σx²y = 59,456.</p>
  <table class="tbl out"><caption>Normal equation with raw columns</caption>
    <tr><th></th><th>b₀</th><th>b₁</th><th>b₂</th><th>= right side</th></tr>
    <tr><td>row 1</td><td>6</td><td>66</td><td>796</td><td>366</td></tr>
    <tr><td>row 2</td><td>66</td><td>796</td><td>10,296</td><td>4,516</td></tr>
    <tr><td>row 3</td><td>796</td><td>10,296</td><td>140,080</td><td>59,456</td></tr>
  </table>
  <p>Solvable by elimination, but painful, and notice how fast the numbers grow (140,080 already, for sizes only up to 16). There is a much neater route that also teaches the most important practical lesson of this note: <strong>centre x first</strong>.</p>
  <p>Let z = x − 11, so z = −5, −3, −1, 1, 3, 5. Then z² = 25, 9, 1, 1, 9, 25, whose average is 35/3. Use the column q = 3z² − 35 = 40, −8, −32, −32, −8, 40 instead of z² (subtracting the average makes it sum to zero; multiplying by 3 keeps it in whole numbers). Now check three facts: Σz = 0, Σq = 0, and Σz·q = −200 + 24 + 32 − 32 − 24 + 200 = 0. The three columns [1, z, q] are <strong>orthogonal</strong>: they do not overlap at all. When columns are orthogonal, XᵀX is diagonal, and each weight can be computed on its own as Σ(column·y) / Σ(column²).</p>
  <table class="tbl out"><caption>Orthogonal columns: each weight is one division</caption>
    <tr><th>column</th><th>values</th><th>Σ column·y</th><th>Σ column²</th><th>weight</th></tr>
    <tr><td>1</td><td>1, 1, 1, 1, 1, 1</td><td>28 + 40 + 53 + 66 + 79 + 100 = 366</td><td>6</td><td><strong>61</strong></td></tr>
    <tr><td>z</td><td>−5, −3, −1, 1, 3, 5</td><td>−140 − 120 − 53 + 66 + 237 + 500 = 490</td><td>70</td><td><strong>7</strong></td></tr>
    <tr><td>q = 3z² − 35</td><td>40, −8, −32, −32, −8, 40</td><td>1120 − 320 − 1696 − 2112 − 632 + 4000 = 360</td><td>5,376</td><td><strong>0.06696</strong></td></tr>
  </table>
  <p>So ŷ = 61 + 7z + 0.06696·(3z² − 35). Notice that the weight on z (7) is exactly the slope of the straight line: adding an orthogonal column did not disturb it. Expand: 0.06696 × 3 = 0.2009 and 0.06696 × 35 = 2.344, so</p>
  <p style="text-align:center"><strong>ŷ = 58.66 + 7z + 0.2009z²</strong>, with z = size − 11.</p>
  <p>Translating back to raw size (put z = x − 11 and multiply out) gives ŷ = 5.96 + 2.58x + 0.2009x²: the same curve, written around x = 0 instead of x = 11.</p>
  <table class="tbl out"><caption>The quadratic's errors</caption>
    <tr><th>house</th><th>z</th><th>y</th><th>ŷ = 58.656 + 7z + 0.2009z²</th><th>residual</th><th>residual²</th></tr>
    <tr><td>A</td><td>−5</td><td>28</td><td>58.656 − 35 + 5.022 = 28.68</td><td>−0.68</td><td>0.46</td></tr>
    <tr><td>B</td><td>−3</td><td>40</td><td>58.656 − 21 + 1.808 = 39.46</td><td>+0.54</td><td>0.29</td></tr>
    <tr><td>C</td><td>−1</td><td>53</td><td>58.656 − 7 + 0.201 = 51.86</td><td>+1.14</td><td>1.31</td></tr>
    <tr><td>D</td><td>1</td><td>66</td><td>58.656 + 7 + 0.201 = 65.86</td><td>+0.14</td><td>0.02</td></tr>
    <tr><td>E</td><td>3</td><td>79</td><td>58.656 + 21 + 1.808 = 81.46</td><td>−2.46</td><td>6.07</td></tr>
    <tr><td>F</td><td>5</td><td>100</td><td>58.656 + 35 + 5.022 = 98.68</td><td>+1.32</td><td>1.75</td></tr>
    <tr><td colspan="5"><strong>SSE</strong></td><td><strong>9.89</strong></td></tr>
  </table>
  <p>SSE drops from 34 to 9.89, and the residual signs are now − + + + − +: no smile. R² = 1 − 9.89 / 3464 = 0.997.</p>
  <h3>Check it in code</h3>
  <p>First the two routes from scratch: the raw normal equation, and the orthogonal centred columns where each weight is a single division. They must agree.</p>
  <div class="fx" data-lang="py"># 1) raw columns [1, size, size^2] and the normal equation (X^T X) w = X^T y
X = np.c_[np.ones(6), size, size**2]
print("X^T X =", (X.T @ X).astype(int).tolist())
print("X^T y =", (X.T @ price).astype(int).tolist())
print("w (raw)     =", np.linalg.solve(X.T @ X, X.T @ price).round(4))

# 2) centred, orthogonal columns [1, z, 3z^2 - 35]: each weight is sum(col*y) / sum(col^2)
z = size - 11; q = 3 * z**2 - 35
for name, col in [("1", np.ones(6)), ("z", z), ("3z^2-35", q)]:
    print(f"col {name:8s} {col.astype(int).tolist()}  sum(col*y)={col @ price:6.0f}  sum(col^2)={col @ col:5.0f}  weight={col @ price / (col @ col):.5f}")</div>
  <div class="fx" data-lang="text">X^T X = [[6, 66, 796], [66, 796, 10296], [796, 10296, 140080]]
X^T y = [366, 4516, 59456]
w (raw)     = [5.9643 2.5804 0.2009]
col 1        [1, 1, 1, 1, 1, 1]  sum(col*y)=   366  sum(col^2)=    6  weight=61.00000
col z        [-5, -3, -1, 1, 3, 5]  sum(col*y)=   490  sum(col^2)=   70  weight=7.00000
col 3z^2-35  [40, -8, -32, -32, -8, 40]  sum(col*y)=   360  sum(col^2)= 5376  weight=0.06696</div>
  <p>Every sum in the hand tables appears. Now the everyday tools: <code>np.polyfit</code> (lists the highest power first), and sklearn's <code>PolynomialFeatures</code> feeding <code>LinearRegression</code>. <code>size[:, None]</code> turns the 1-D array into the one-column table sklearn wants; <code>include_bias=False</code> leaves out the column of 1s because <code>LinearRegression</code> fits its own intercept.</p>
  <div class="fx" data-lang="py">from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression

for deg in [1, 2]:
    c = np.polyfit(size, price, deg)              # least squares, highest power first
    r = price - np.polyval(c, size)               # residuals
    print(f"degree {deg}: coefs {np.round(c, 4)}  residuals {np.round(r, 2) + 0.0}  SSE {np.sum(r**2):.2f}")

X2 = PolynomialFeatures(degree=2, include_bias=False).fit_transform(size[:, None])
m = LinearRegression().fit(X2, price)
print("sklearn: intercept", round(m.intercept_, 4), "weights", m.coef_.round(4))
print("predict 1,800 sq ft (size=18):", m.predict([[18, 324]]).round(2), " line says:", np.polyval(np.polyfit(size, price, 1), 18).round(2))</div>
  <div class="fx" data-lang="text">degree 1: coefs [  7. -16.]  residuals [ 2.  0. -1. -2. -3.  4.]  SSE 34.00
degree 2: coefs [0.2009 2.5804 5.9643]  residuals [-0.68  0.54  1.14  0.14 -2.46  1.32]  SSE 9.89
sklearn: intercept 5.9643 weights [2.5804 0.2009]
predict 1,800 sq ft (size=18): [117.5]  line says: 110.0</div>
  <p>Same residuals and SSE as the hand tables. For an 1,800 sq ft flat, beyond the data, the line says 110 lakh and the curve 117.5 lakh; the curve continues the upward bend the data showed. statsmodels writes the same model with a formula. <code>I(...)</code> means "compute this expression as a column" (without it, <code>**</code> means something else in formula language):</p>
  <div class="fx" data-lang="py">import pandas as pd
import statsmodels.formula.api as smf
houses = pd.DataFrame({"size": size, "price": price})
fit = smf.ols("price ~ size + I(size**2)", data=houses).fit()   # I(...) = "compute this column"
print(fit.params.round(4))
print("R2:", round(fit.rsquared, 4), " p-value of size^2 term:", round(fit.pvalues["I(size ** 2)"], 4))
cfit = smf.ols("price ~ I(size - 11) + I((size - 11)**2)", data=houses).fit()   # centred version
print("centred:", cfit.params.round(4).to_dict())</div>
  <div class="fx" data-lang="text">Intercept       5.9643
size            2.5804
I(size ** 2)    0.2009
dtype: float64
R2: 0.9971  p-value of size^2 term: 0.0735
centred: {'Intercept': 58.6562, 'I(size - 11)': 7.0, 'I((size - 11) ** 2)': 0.2009}</div>
  <p>The p-value 0.0735 for the size² term is the same F-test the diagnostics note ran: with six houses the curvature is suggestive rather than proven. The centred version gives the hand weights (58.66, 7, 0.2009) directly. Every line of the summary you learned in <a class="xref" data-note="ml_regression">Linear Regression</a> (std err, t, confidence interval) applies unchanged, because this <em>is</em> linear regression.</p>
  <h3>Reading the coefficients of a curve</h3>
  <p>In a straight line, b₁ is "the effect of one more unit of x". In ŷ = 58.66 + 7z + 0.2009z² there is no single effect. The slope at a point is the derivative: <strong>dŷ/dz = 7 + 2 × 0.2009z = 7 + 0.402z</strong>.</p>
  <table class="tbl">
    <tr><th>size</th><th>z</th><th>slope 7 + 0.402z</th><th>plain meaning</th></tr>
    <tr><td>600 sq ft</td><td>−5</td><td>4.99</td><td>100 more sq ft adds about 5 lakh to a small flat</td></tr>
    <tr><td>1,100 sq ft</td><td>0</td><td>7.00</td><td>the straight line's slope: the line is right on average, at the centre</td></tr>
    <tr><td>1,600 sq ft</td><td>5</td><td>9.01</td><td>100 more sq ft adds 9 lakh to a big flat</td></tr>
  </table>
  <p>The curve's lowest point is where the slope is 0: z = −7 / 0.402 = −17.4, a size of −640 sq ft. That is nonsense: it is far outside the data, where a parabola has no reason to be right. And the raw-form coefficient b₁ = 2.58 on its own means only "the slope at 0 sq ft", a flat that does not exist. Centring made the coefficients readable: 7 is the slope at the average flat.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Polynomial regression changes the <em>table</em>, not the <em>algorithm</em>. Whatever you can do to columns (scale them, select them, penalise their weights, put them in a pipeline) you can do to x² and x³. This is why the same trick reappears everywhere: interactions, splines, kernels, even the hidden layer of a neural network is "learned columns + a linear model on top".</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Do not read b₁ of a polynomial as "the effect of x". With x² in the model, the effect of x is b₁ + 2b₂x and changes along the range. Report it at meaningful values (the mean, a few typical values), or centre x first so that b₁ becomes "the slope at the average x".</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Polynomial features.</b> One input and one square is easy. The houses also have bedrooms, and "polynomial" then also means squares and products of different columns. How are they built, and how many are there?</div>

  <h2 id="pr-features"><span class="num">03</span>Polynomial Features by Hand</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>With size and bedrooms both in the table, a "degree-2 model" could include size², rooms², and size × rooms. Which columns exactly, and how fast does their number grow with more inputs?</p>
  </div>
  <h3>Two inputs, degree 2: house F</h3>
  <p>Take house F, with size = 16 and rooms = 4. A degree-2 expansion lists every product of the inputs whose powers add up to at most 2:</p>
  <table class="tbl out"><caption>Row (size, rooms) = (16, 4), degree 2</caption>
    <tr><th>term</th><th>total power</th><th>value</th><th>kind</th></tr>
    <tr><td>1</td><td>0</td><td>1</td><td>bias (intercept column)</td></tr>
    <tr><td>size</td><td>1</td><td>16</td><td>original</td></tr>
    <tr><td>rooms</td><td>1</td><td>4</td><td>original</td></tr>
    <tr><td>size²</td><td>2</td><td>256</td><td>square (curvature in size)</td></tr>
    <tr><td>size·rooms</td><td>2</td><td>64</td><td>interaction (size's effect depends on rooms)</td></tr>
    <tr><td>rooms²</td><td>2</td><td>16</td><td>square (curvature in rooms)</td></tr>
  </table>
  <p>For degree 3 add every term of total power 3: size³ = 4,096, size²·rooms = 1,024, size·rooms² = 256, rooms³ = 64. With <code>interaction_only=True</code> only products of <em>different</em> inputs are kept (1, size, rooms, size·rooms), no squares.</p>
  <h3>How many columns?</h3>
  <p>A term is a way to give d "power units" to k inputs plus one dummy slot that absorbs unused power. Counting these ("stars and bars") gives C(k + d, d) terms including the bias, so <strong>C(k + d, d) − 1</strong> without it. By hand for k = 2, d = 2: C(4, 2) − 1 = 6 − 1 = 5 (size, rooms, size², size·rooms, rooms²). For k = 10, d = 3: C(13, 3) − 1 = 286 − 1 = 285.</p>
  <div class="fx" data-lang="py">from math import comb
row = np.array([[16, 4]])                         # house F: size = 16, rooms = 4
for kw in [dict(degree=2), dict(degree=2, interaction_only=True), dict(degree=3, include_bias=False)]:
    pf = PolynomialFeatures(**kw).fit(row)
    print(kw)
    print("  names :", list(pf.get_feature_names_out(["size", "rooms"])))
    print("  values:", pf.transform(row)[0].astype(int).tolist())

print("columns (no bias) for k inputs, degree d = C(k+d, d) - 1:")
for k in [1, 2, 5, 10, 50]:
    print(f"  k={k:&lt;3}", [comb(k + d, d) - 1 for d in (2, 3, 4)])</div>
  <div class="fx" data-lang="text">{'degree': 2}
  names : ['1', 'size', 'rooms', 'size^2', 'size rooms', 'rooms^2']
  values: [1, 16, 4, 256, 64, 16]
{'degree': 2, 'interaction_only': True}
  names : ['1', 'size', 'rooms', 'size rooms']
  values: [1, 16, 4, 64]
{'degree': 3, 'include_bias': False}
  names : ['size', 'rooms', 'size^2', 'size rooms', 'rooms^2', 'size^3', 'size^2 rooms', 'size rooms^2', 'rooms^3']
  values: [16, 4, 256, 64, 16, 4096, 1024, 256, 64]
columns (no bias) for k inputs, degree d = C(k+d, d) - 1:
  k=1   [2, 3, 4]
  k=2   [5, 9, 14]
  k=5   [20, 55, 125]
  k=10  [65, 285, 1000]
  k=50  [1325, 23425, 316250]</div>
  <p><code>get_feature_names_out</code> shows exactly which product each column is, in the same order as the hand table. The count table is the warning: 50 inputs at degree 3 already make 23,425 columns, more than most datasets have rows. Even our two inputs at degree 2 give 5 columns for 6 houses. With as many columns as rows, ordinary least squares can fit the training data perfectly and learns nothing. That is the column explosion, and the reason polynomial features almost always travel with regularization or with a small degree.</p>
  <div class="cards">
    <div><b>degree</b><p>Highest total power. 2 adds squares and pairwise products; 3 adds cubes and three-way products.</p><small>Start at 2; rarely above 3 with many inputs</small></div>
    <div><b>interaction_only</b><p>Keep products of different inputs only (size·rooms), drop size², size³.</p><small>When you believe in interactions but not curvature</small></div>
    <div><b>include_bias</b><p>Adds the column of 1s. Set False when the next model fits its own intercept.</p><small>Duplicate intercepts confuse regularized fits</small></div>
    <div><b>get_feature_names_out</b><p>Names like <code>'size rooms'</code>, <code>'size^2'</code>, so you can read coefficients.</p><small>Pass input names for readable output</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Polynomial features of degree d</strong> for inputs x₁…x_k: all monomials x₁^p₁ · x₂^p₂ ⋯ x_k^p_k with p₁ + … + p_k ≤ d. Their number (with the constant) is C(k + d, d), which grows like k^d / d!.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>One-hot columns (0/1) squared are themselves (0² = 0, 1² = 1), so <code>PolynomialFeatures</code> on locality dummies creates exact duplicate columns and perfect collinearity. Expand only the numeric columns (use a <code>ColumnTransformer</code>, see <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>), or use <code>interaction_only=True</code> for dummies.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Degree vs overfitting.</b> If degree 2 is good, is degree 5 better? More columns always lower the training error. The question is what happens on flats the model has not seen.</div>

  <h2 id="pr-overfit"><span class="num">04</span>Degree vs Overfitting</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Degree 2 cut SSE from 34 to 9.89. Degree 3, 4, 5 will cut it further. At what point does a lower training error stop meaning a better model, and how would we see that?</p>
  </div>
  <h3>By hand: n points can always be hit exactly</h3>
  <p>A polynomial of degree d has d + 1 weights. Asking it to pass through n points gives n equations. With d + 1 = n (degree n − 1) there are as many unknowns as equations, so for distinct x values there is always an exact solution: through any 2 points goes a line, through any 3 a parabola, through any 6 a quintic. Training error 0 is guaranteed, whatever the data, including pure noise.</p>
  <div class="fx" data-lang="py">for d in [1, 2, 3, 4, 5]:
    c = np.polyfit(size - 11, price, d)            # centred size keeps the numbers tame
    sse = np.sum((price - np.polyval(c, size - 11)) ** 2)
    print(f"degree {d}: {d+1} weights, train SSE {sse:7.3f}, predicts size 18 -&gt; {np.polyval(c, 7):7.2f},"
          f" size 4 -&gt; {np.polyval(c, -7):7.2f}, size 15 -&gt; {np.polyval(c, 4):6.2f}")</div>
  <div class="fx" data-lang="text">degree 1: 2 weights, train SSE  34.000, predicts size 18 -&gt;  110.00, size 4 -&gt;   12.00, size 15 -&gt;  89.00
degree 2: 3 weights, train SSE   9.893, predicts size 18 -&gt;  117.50, size 4 -&gt;   19.50, size 15 -&gt;  89.87
degree 3: 4 weights, train SSE   3.087, predicts size 18 -&gt;  125.67, size 4 -&gt;   11.33, size 15 -&gt;  89.19
degree 4: 5 weights, train SSE   0.194, predicts size 18 -&gt;  139.17, size 4 -&gt;   24.83, size 15 -&gt;  88.05
degree 5: 6 weights, train SSE   0.000, predicts size 18 -&gt;  152.00, size 4 -&gt;   12.00, size 15 -&gt;  87.50</div>
  <figure class="viz"><svg viewBox="0 0 520 270" width="520">
<line x1="60" y1="230" x2="500" y2="230" stroke="currentColor"/><line x1="60" y1="20" x2="60" y2="230" stroke="currentColor"/>
<text x="52" y="234" text-anchor="end" class="tm" font-size="11">0</text><text x="52" y="168" text-anchor="end" class="tm" font-size="11">50</text><text x="52" y="103" text-anchor="end" class="tm" font-size="11">100</text><text x="52" y="37" text-anchor="end" class="tm" font-size="11">150</text>
<text x="60" y="246" text-anchor="middle" class="tm" font-size="11">4</text><text x="123" y="246" text-anchor="middle" class="tm" font-size="11">6</text><text x="249" y="246" text-anchor="middle" class="tm" font-size="11">10</text><text x="374" y="246" text-anchor="middle" class="tm" font-size="11">14</text><text x="500" y="246" text-anchor="middle" class="tm" font-size="11">18</text>
<text x="280" y="264" text-anchor="middle" class="tm" font-size="11.5">size (hundreds of sq ft); the data cover 6 to 16</text>
<rect x="123" y="20" width="314" height="210" class="fs" fill-opacity="0.35" stroke="none"/>
<polyline points="60,214 68,212 76,210 84,207 91,205 99,203 107,200 115,198 123,196 131,194 139,191 146,189 154,187 162,184 170,182 178,180 186,178 194,175 201,173 209,171 217,168 225,166 233,164 241,161 249,159 256,157 264,155 272,152 280,150 288,148 296,145 304,143 311,141 319,138 327,136 335,134 343,132 351,129 359,127 366,125 374,122 382,120 390,118 398,115 406,113 414,111 421,109 429,106 437,104 445,102 453,99 461,97 469,95 476,93 484,90 492,88 500,86" fill="none" class="sr" stroke-width="2"/>
<polyline points="60,204 68,203 76,202 84,200 91,199 99,197 107,196 115,194 123,192 131,191 139,189 146,187 154,186 162,184 170,182 178,180 186,178 194,176 201,174 209,172 217,170 225,168 233,166 241,164 249,162 256,160 264,158 272,155 280,153 288,151 296,148 304,146 311,144 319,141 327,139 335,136 343,134 351,131 359,128 366,126 374,123 382,120 390,118 398,115 406,112 414,109 421,106 429,103 437,100 445,98 453,95 461,91 469,88 476,85 484,82 492,79 500,76" fill="none" class="sb" stroke-width="2"/>
<polyline points="60,214 68,211 76,208 84,205 91,202 99,200 107,197 115,195 123,193 131,191 139,189 146,187 154,185 162,183 170,182 178,180 186,178 194,175 201,173 209,171 217,169 225,167 233,165 241,163 249,160 256,158 264,156 272,154 280,152 288,150 296,148 304,145 311,143 319,141 327,139 335,137 343,135 351,133 359,131 366,129 374,126 382,124 390,121 398,118 406,115 414,112 421,108 429,104 437,99 445,93 453,87 461,80 469,73 476,64 484,54 492,43 500,31" fill="none" class="sg" stroke-width="2"/>
<circle cx="123" cy="193" r="5" class="ft st"/><circle cx="186" cy="178" r="5" class="ft st"/><circle cx="249" cy="160" r="5" class="ft st"/><circle cx="311" cy="143" r="5" class="ft st"/><circle cx="374" cy="126" r="5" class="ft st"/><circle cx="437" cy="99" r="5" class="ft st"/>
<text x="80" y="40" class="tr" font-size="11.5">degree 1: 110 at size 18</text><text x="80" y="57" class="tb" font-size="11.5">degree 2: 117.5</text><text x="80" y="74" class="tg" font-size="11.5">degree 5 (SSE 0): 152</text>
</svg><figcaption>Degrees 1, 2 and 5 on the six houses (shaded band = the range of the data). Inside the band they look alike; beyond it, the degree-5 curve that hits every house exactly shoots upward.</figcaption></figure>
  <p>Training SSE falls 34 → 9.9 → 3.1 → 0.19 → 0. Degree 5 passes through all six houses. But compare what each model says outside the data, at 1,800 sq ft: the line 110, the quadratic 117.5, degree 3 125.7, degree 4 139.2, degree 5 152. And at 400 sq ft they disagree from 11 to 25 lakh. Zero training error bought a model that is certain about every house it has seen and erratic about every one it has not. A perfect training fit says nothing about new points; to see that properly we need many test points, so we turn to a larger dataset.</p>
  <h3>The same idea at scale: 20 noisy points from a sine wave</h3>
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
  <p>High-degree polynomials misbehave most at the ends of the data range, where there are no points on one side to hold them down. This is <strong>Runge's phenomenon</strong>: fitting a high-degree polynomial to evenly spaced points makes it oscillate more and more near the edges. Outside the range it is worse: x^15 grows without limit, so the degree-15 model predicts −214 at x = 1.1, where the truth is 0.59. Even degree 3 predicts 2.31 there, because every polynomial heads to ±∞ eventually. The houses showed the same thing in miniature: degree 5 at 1,800 sq ft.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Degree 5 on six houses is the student who memorises last year's question paper word by word: full marks on that paper (training), poor marks on a new paper (test), and complete nonsense on a question from a chapter not in the syllabus (extrapolation).</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Underfitting</strong>: the model is too simple to capture the pattern, so both train and test errors are high (high bias). <strong>Overfitting</strong>: the model is flexible enough to fit noise, so train error is low and test error is high (high variance). Polynomial degree is the textbook capacity knob between them; the full decomposition is in <a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Never trust a polynomial outside the range of x it was trained on, and be suspicious near the edges even inside it. If you must extrapolate (pricing a villa from flats, forecasting, dose levels above those tested), use a model whose shape outside the data is chosen on purpose: a straight line, a spline with linear tails, or domain knowledge.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Scaling and collinearity of powers.</b> The sine pipeline had a <code>StandardScaler</code> after <code>PolynomialFeatures</code>, and the house fits used centred size. Why? What goes wrong if size² and size³ are left as they are?</div>

  <h2 id="pr-scale"><span class="num">05</span>Scaling and Collinearity of Powers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The raw 3×3 normal equation for the houses already had entries of 140,080, and section 02 escaped it by centring. What exactly goes wrong with raw powers, and is centring a convenience or a necessity?</p>
  </div>
  <h3>Problem 1: size and size² are nearly the same column</h3>
  <p>On a positive range, x and x² both go up together, so they are strongly correlated. By hand for the house sizes 6..16: dx = −5, −3, −1, 1, 3, 5. size² = 36, 64, 100, 144, 196, 256 with mean 132.67, so its deviations are −96.67, −68.67, −32.67, 11.33, 63.33, 123.33.</p>
  <table class="tbl out"><caption>corr(size, size²) for the six houses</caption>
    <tr><th>dx</th><th>d(x²)</th><th>dx · d(x²)</th><th>dx²</th><th>d(x²)²</th></tr>
    <tr><td>−5</td><td>−96.67</td><td>483.3</td><td>25</td><td>9,344.4</td></tr>
    <tr><td>−3</td><td>−68.67</td><td>206.0</td><td>9</td><td>4,715.1</td></tr>
    <tr><td>−1</td><td>−32.67</td><td>32.7</td><td>1</td><td>1,067.1</td></tr>
    <tr><td>1</td><td>11.33</td><td>11.3</td><td>1</td><td>128.4</td></tr>
    <tr><td>3</td><td>63.33</td><td>190.0</td><td>9</td><td>4,011.1</td></tr>
    <tr><td>5</td><td>123.33</td><td>616.7</td><td>25</td><td>15,211.1</td></tr>
    <tr><td><strong>sum</strong></td><td></td><td><strong>1,540</strong></td><td><strong>70</strong></td><td><strong>34,477</strong></td></tr>
  </table>
  <p>r = 1,540 / √(70 × 34,477) = 1,540 / 1,553.5 = <strong>0.991</strong>, a VIF of 1/(1 − 0.983) = 57.7. After centring (z = −5..5), z² = 25, 9, 1, 1, 9, 25 is symmetric while z is antisymmetric, so Σ z·(z² − 35/3) = 0 and the correlation is exactly <strong>0</strong>. Centring removed the overlap; that is why the hand fit in section 02 became three separate divisions.</p>
  <p>Why the overlap hurts: when two columns carry almost the same information, least squares cannot tell how to share the effect between them. Many weight combinations fit almost equally well, so the chosen weights swing with small changes in the data and their standard errors blow up. This is multicollinearity (measured with VIF in <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a>), created by us.</p>
  <h3>Problem 2: the numbers become huge</h3>
  <p>The same idea at scale: take x = the year, 2000 to 2010. Then x³ ≈ 8 × 10⁹, while the 1s column is 1. XᵀX contains entries from about 11 to about 10²⁰. A computer stores about 16 significant digits, so when such numbers are combined, the small ones are lost entirely. The <strong>condition number</strong> of XᵀX (largest divided by smallest eigenvalue) measures this: around 10¹⁶ or more means the solution can be pure rounding noise.</p>
  <div class="fx" data-lang="py">from sklearn.preprocessing import PolynomialFeatures, StandardScaler
print("corr(size, size^2), raw size 6..16   :", round(np.corrcoef(size, size**2)[0, 1], 4))
zc = size - size.mean()
print("corr(size, size^2), centred -5..5    :", round(np.corrcoef(zc, zc**2)[0, 1], 4) + 0.0)

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
  <div class="fx" data-lang="text">corr(size, size^2), raw size 6..16   : 0.9913
corr(size, size^2), centred -5..5    : 0.0
raw years      x^3 max 8,120,601,000.0   corr(x, x^3) 1.0000   cond(X^T X) 1.4e+22
centred years  x^3 max          125.0   corr(x, x^3) 0.9216   cond(X^T X) 2.5e+03
standardised   x^3 max            4.0   corr(x, x^3) 0.9216   cond(X^T X) 3.8e+01
raw x     [b0, b1, b2] on 3 resamples: [[110.37, -14.54, 0.48], [117.11, -15.61, 0.52], [94.31, -12.39, 0.41]]
centred x [b0, b1, b2] on 3 resamples: [[0.37, -0.12, 0.48], [-0.83, -0.12, 0.52], [0.99, -0.06, 0.41]]</div>
  <p>The houses: 0.9913 raw, 0 centred, matching the hand table. Raw years: x and x³ have correlation 1.0000 to four decimals and the condition number is 10²², hopeless. Centring alone drops it to 2,500; standardising to 38. The last experiment fits the same quadratic on the same three bootstrap resamples of a 30-point dataset with raw x (range 10–20) and with centred x. The curvature b₂ is identical either way (0.48, 0.52, 0.41), but raw b₀ and b₁ jump around (110 → 117 → 94) because they describe the curve at x = 0, far outside the data, where small changes in curvature move the extrapolated value a lot. With centred x, b₀ and b₁ describe the curve at the middle of the data and are small and steady. The <em>predictions</em> are the same in both versions: only the bookkeeping differs. (The houses showed it too: raw b₁ = 2.58 is the slope at 0 sq ft; centred b₁ = 7 is the slope at 1,100 sq ft.)</p>
  <h3>The fixes</h3>
  <table class="tbl">
    <tr><th>Fix</th><th>What it does</th><th>When</th></tr>
    <tr><td>Centre x before powering</td><td>Removes most of the x / x² overlap; b₁ becomes the slope at the mean</td><td>Always, for interpretation</td></tr>
    <tr><td>Standardise after <code>PolynomialFeatures</code></td><td>Puts x, x², x³ on comparable scales; needed for penalties (ridge/lasso) and gradient descent</td><td>Always in sklearn pipelines</td></tr>
    <tr><td>Scale <em>before</em> too (e.g. <code>StandardScaler</code> → <code>PolynomialFeatures</code> → <code>StandardScaler</code>)</td><td>Keeps raw powers from becoming astronomically large</td><td>Inputs with big values (years, prices)</td></tr>
    <tr><td>Orthogonal polynomials (R's <code>poly()</code>, numpy's <code>Legendre</code>/<code>Chebyshev</code> classes)</td><td>Columns built to be exactly uncorrelated, as z and 3z² − 35 were</td><td>Statistical modelling, high degree</td></tr>
    <tr><td>Use splines instead</td><td>Local pieces never become huge</td><td>Complex shapes (section 07)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Condition number</strong> κ(A) = largest / smallest singular value of A. It bounds how much relative error in the data can be amplified in the solution: you lose about log₁₀ κ digits of accuracy. <strong>Orthogonal polynomials</strong>: polynomial columns constructed so that Σ pᵢ(x)·pⱼ(x) = 0 for i ≠ j over the data, which makes XᵀX diagonal.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Penalties (ridge, lasso) and gradient descent are scale-sensitive. Without standardising, size³ (values up to 4,096) needs only a tiny weight and is barely penalised, while size (values up to 16) is penalised heavily. The penalty then favours whichever power happens to have the biggest numbers, which is meaningless.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Interaction terms.</b> Squares bend one variable. The cross term size·rooms in the expansion does something different: it lets one variable change the effect of another. That deserves its own look.</div>

  <h2 id="pr-inter"><span class="num">06</span>Interaction Terms</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Our models so far give every flat the same value per 100 sq ft (or the same curve), whatever its locality. A Metro buyer might pay more per extra square foot than an Old town buyer. How does a weighted sum let one column change the slope of another?</p>
  </div>
  <h3>The need</h3>
  <p>A main-effects model says price = b₀ + b₁·size + b₂·metro: Metro shifts the whole line up by b₂, but 100 more sq ft adds b₁ everywhere. If Metro buyers value space more, the effect of size <em>depends on</em> locality. That is an interaction.</p>
  <h3>Plain words and the formula</h3>
  <p>Add the product column size·metro: ŷ = b₀ + b₁·size + b₂·metro + b₃·size·metro. Group the size terms: ŷ = b₀ + b₂·metro + <strong>(b₁ + b₃·metro)</strong>·size. The slope of size is no longer a constant: it is b₁ + b₃·metro. If b₃ &gt; 0 the two reinforce each other (synergy); if b₃ &lt; 0 they substitute for each other.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Fertiliser and water. Fertiliser alone on dry soil does little; water alone helps a bit; both together help far more than the sum. The extra from "both together" is the interaction term. A main-effects-only model cannot express "far more than the sum".</p>
  </div>
  <h3>Worked by hand: a different slope for Metro flats</h3>
  <p>Mark the Metro flats with a 0/1 column: C and F are Metro (metro = 1), A, B, D, E are not. With the interaction, the model is just two separate lines, one per group, so we can fit each group alone:</p>
  <table class="tbl out"><caption>Each group's own least-squares line</caption>
    <tr><th>group</th><th>houses (size, price)</th><th>slope</th><th>intercept</th></tr>
    <tr><td>non-Metro (metro = 0)</td><td>A (6, 28), B (8, 40), D (12, 66), E (14, 79)</td><td>x̄ = 10, ȳ = 53.25; S_xy = 4·25.25 + 2·13.25 + 2·12.75 + 4·25.75 = 256, S_xx = 40 → <strong>6.4</strong></td><td>53.25 − 64 = <strong>−10.75</strong></td></tr>
    <tr><td>Metro (metro = 1)</td><td>C (10, 53), F (16, 100)</td><td>(100 − 53)/(16 − 10) = <strong>7.833</strong></td><td>53 − 78.33 = <strong>−25.33</strong></td></tr>
  </table>
  <p>Match them to the formula. Non-Metro: b₀ + b₁·size, so b₀ = −10.75, b₁ = 6.4. Metro: (b₀ + b₂) + (b₁ + b₃)·size, so b₂ = −25.33 + 10.75 = −14.58 and b₃ = 7.833 − 6.4 = <strong>1.433</strong>. Reading: "100 more sq ft adds 6.4 lakh outside Metro and 7.83 lakh in Metro". In a statsmodels formula, <code>size * metro</code> is shorthand for <code>size + metro + size:metro</code> (the colon is the product):</p>
  <div class="fx" data-lang="py">houses = pd.DataFrame({"size":  [6, 8, 10, 12, 14, 16],
                       "metro": [0, 0, 1, 0, 0, 1],               # 1 = Metro locality (houses C and F)
                       "price": [28, 40, 53, 66, 79, 100]})
print(smf.ols("price ~ size + metro", houses).fit().params.round(3).to_dict())
inter = smf.ols("price ~ size * metro", houses).fit()          # a*b = a + b + a:b
print(inter.params.round(3).to_dict())
b0, b1, b2, b3 = inter.params
print(f"slope of size: non-Metro {b1:.3f}, Metro {b1 + b3:.3f}")</div>
  <div class="fx" data-lang="text">{'Intercept': -15.198, 'size': 6.845, 'metro': 2.716}
{'Intercept': -10.75, 'size': 6.4, 'metro': -14.583, 'size:metro': 1.433}
slope of size: non-Metro 6.400, Metro 7.833</div>
  <p>Without the interaction the model gives one shared slope (6.85) and a Metro bump (+2.72) to compensate. With it, the hand answer −10.75, 6.4, −14.58, 1.433 comes out exactly. (With only two Metro flats, their line passes through both exactly and the numbers are fragile; the point is the mechanics.)</p>
  <h3>The same idea at scale: TV × radio advertising</h3>
  <p>An advertiser spends on TV and radio; ads reinforce each other (people who heard the radio spot respond more to the TV ad). Suppose the truth is sales = 10 + 2·TV + 1·radio + 0.5·TV·radio (lakh rupees). The TV slope is 2 + 0.5·radio: 2.0 at radio 0, 3.0 at radio 2, 4.0 at radio 4. Simulate 200 campaigns from that truth (plus noise with standard deviation 2) and fit both models. <code>interaction_only=True</code> adds just the product column.</p>
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
  <p>The main-effects model is forced to give TV one average slope (3.28) and a wrong intercept (3.51 instead of 10). With the product column the weights land near the truth (1.99, 0.98, 0.48, intercept 9.88), cross-validated R² rises from 0.933 to 0.969, and the slope table matches the truth within noise.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>An <strong>interaction</strong> between a and b exists when the effect of a on y depends on the value of b. In a linear model it is the product term b₃·a·b, which makes ∂ŷ/∂a = b₁ + b₃·b. The <strong>hierarchy principle</strong>: if you keep a·b, keep a and b as well, even if their p-values are large; otherwise the meaning of b₃ depends on where zero is for a and b.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>With an interaction in the model, b₂ (metro = −14.58) is the Metro effect <em>only for a 0 sq ft flat</em>, not "the Metro premium". Centre size before multiplying, and b₂ becomes the Metro effect at the average size. Also: with k inputs there are k(k − 1)/2 pairwise products; adding all of them blindly is the column explosion again. Add the ones domain knowledge suggests, or let a penalty (lasso) or a tree model find them.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Basis functions.</b> Powers of x are only one choice of new column, and a poor one at the edges (degree 5 at 1,800 sq ft). What other columns could we feed linear regression, and how do we choose?</div>

  <h2 id="pr-basis"><span class="num">07</span>Basis Functions</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Powers are global: changing one weight changes the curve everywhere, which is why degree 5 went wild beyond the data. Are there columns that bend the fit only where the data asks for it?</p>
  </div>
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
  <p>Cut the x range into intervals and make one 0/1 column per interval: φⱼ(x) = 1 if x falls in bin j, else 0. The fitted weight of a bin is simply the average y of the rows in it, so the model is a staircase. By hand on the houses with bins small (under 900 sq ft), medium (900–1,300), large (over 1,300): small = A, B → (28 + 40)/2 = <strong>34</strong>; medium = C, D → (53 + 66)/2 = <strong>59.5</strong>; large = E, F → (79 + 100)/2 = <strong>89.5</strong>. Simple and robust, but the prediction jumps at bin edges (a 1,290 sq ft flat is worth 30 lakh less than a 1,310 sq ft one) and is flat inside each bin. (A regression tree is a step function whose bins are chosen automatically; see <a class="xref" data-note="ml_dtree">Decision Trees</a>.)</p>
  <h3>Hinges: piecewise linear</h3>
  <p>A hinge (in neural networks called ReLU) at knot c is φ(x) = max(0, x − c): zero to the left of c, a rising line to the right. Adding w·max(0, x − c) to a line changes the slope by w at x = c and nowhere else. For the houses, a hinge at 1,100 sq ft (c = 11) gives the column 0, 0, 0, 1, 3, 5:</p>
  <table class="tbl out"><caption>Hinge at c = 11</caption>
    <tr><th>house</th><th>size</th><th>max(0, size − 11)</th><th>ŷ = −7 + 5.875·size + 2.25·hinge</th><th>y</th></tr>
    <tr><td>A</td><td>6</td><td>0</td><td>−7 + 35.25 = 28.25</td><td>28</td></tr>
    <tr><td>B</td><td>8</td><td>0</td><td>−7 + 47.0 = 40.0</td><td>40</td></tr>
    <tr><td>C</td><td>10</td><td>0</td><td>−7 + 58.75 = 51.75</td><td>53</td></tr>
    <tr><td>D</td><td>12</td><td>1</td><td>−7 + 70.5 + 2.25 = 65.75</td><td>66</td></tr>
    <tr><td>E</td><td>14</td><td>3</td><td>−7 + 82.25 + 6.75 = 82.0</td><td>79</td></tr>
    <tr><td>F</td><td>16</td><td>5</td><td>−7 + 94.0 + 11.25 = 98.25</td><td>100</td></tr>
  </table>
  <p>Least squares (code below) picks slope 5.875 before the knot and 5.875 + 2.25 = 8.125 after it: "small flats gain about 5.9 lakh per 100 sq ft, big ones about 8.1". SSE 13.75, close to the quadratic's 9.89 with the same number of weights, and far more natural for thresholds and saturation (salary flattening, sales hitting market size), which a polynomial would need a high degree to imitate. MARS (multivariate adaptive regression splines) is an algorithm that searches for good hinge knots automatically.</p>
  <h3>Splines: smooth pieces joined at knots</h3>
  <p>A <strong>spline</strong> is a piecewise polynomial: a separate low-degree polynomial on each interval between knots, glued so that the joins are smooth. A cubic spline uses cubic pieces and forces the value, slope and curvature (first and second derivative) to match at every knot, so the eye cannot see the joins. One way to write it is x, x², x³ plus one column max(0, x − c)³ per knot c (the "truncated power basis"): the cube of a hinge starts so gently that it adds curvature without a visible kink. In practice libraries use the numerically nicer <strong>B-spline</strong> basis: a set of local bumps, each non-zero over only 4 neighbouring intervals (for cubic), that add up to exactly 1 at every x.</p>
  <p><strong>By hand: the cubic B-spline row for a 1,300 sq ft flat.</strong> Five evenly spaced knots over the houses' range: 6, 8.5, 11, 13.5, 16. Size 13 lies in the interval [11, 13.5], at the local position u = (13 − 11) / 2.5 = 0.8. On evenly spaced knots, the four bumps that are non-zero there have the standard formulas:</p>
  <table class="tbl out"><caption>Uniform cubic B-spline weights at u = 0.8</caption>
    <tr><th>bump</th><th>formula</th><th>at u = 0.8</th></tr>
    <tr><td>left</td><td>(1 − u)³ / 6</td><td>0.008 / 6 = 0.0013</td></tr>
    <tr><td>centre-left</td><td>(3u³ − 6u² + 4) / 6</td><td>(1.536 − 3.84 + 4) / 6 = 0.2827</td></tr>
    <tr><td>centre-right</td><td>(−3u³ + 3u² + 3u + 1) / 6</td><td>(−1.536 + 1.92 + 2.4 + 1) / 6 = 0.6307</td></tr>
    <tr><td>right</td><td>u³ / 6</td><td>0.512 / 6 = 0.0853</td></tr>
    <tr><td colspan="2"><strong>sum</strong></td><td><strong>1.0000</strong></td></tr>
  </table>
  <p>Only 4 of the 7 columns are non-zero, and they sum to 1 ("partition of unity"). Locality is the key property: a flat at 1,300 sq ft only influences the weights of bumps near 13. A polynomial weight, in contrast, affects the curve everywhere, which is why one point at the edge could swing the whole degree-5 curve. A <strong>natural spline</strong> additionally forces the curve to be a straight line beyond the outer knots, which tames the edges and gives sensible linear extrapolation.</p>
  <h3>Radial basis functions (RBF)</h3>
  <p>An RBF column is a Gaussian bump centred at c with width s: φ(x) = exp(−(x − c)² / (2s²)). It is 1 at x = c and fades to 0 a few widths away. By hand for size 13 with centres 6, 11, 16 and s = 2.5 (so 2s² = 12.5):</p>
  <table class="tbl out"><caption>RBF features of size 13</caption>
    <tr><th>centre c</th><th>(13 − c)²</th><th>÷ 12.5</th><th>exp(−…)</th></tr>
    <tr><td>6</td><td>49</td><td>3.92</td><td>0.0198</td></tr>
    <tr><td>11</td><td>4</td><td>0.32</td><td>0.7261</td></tr>
    <tr><td>16</td><td>9</td><td>0.72</td><td>0.4868</td></tr>
  </table>
  <p>The nearest centre (11) gives the biggest value; the far centre (6) almost nothing. The width s is a smoothness knob: wide bumps give smooth curves, narrow bumps give wiggly ones (and overfit). The <a class="xref" data-note="ml_svm">Support Vector Machines</a> RBF kernel is this same bump, with one centre at every training point. The code checks all four hand tables:</p>
  <div class="fx" data-lang="py">from sklearn.preprocessing import SplineTransformer
# 1) step functions: three size bins, each weight = the bin's mean price
bins = np.digitize(size, [9, 13])                 # 0 = small (6, 8), 1 = medium (10, 12), 2 = large (14, 16)
print("bin of each house:", bins.tolist(), " bin means:", [float(price[bins == k].mean()) for k in range(3)])

# 2) one hinge at size 11: a line whose slope may change at 1,100 sq ft
H = np.c_[size, np.maximum(0, size - 11)]         # columns: size, max(0, size - 11)
mh = LinearRegression().fit(H, price)
rh = price - mh.predict(H)
print("hinge column:", H[:, 1].tolist(), " weights", mh.coef_.round(3), " intercept", round(mh.intercept_, 3),
      f" -&gt; slope {mh.coef_[0]:.3f} below 11, {mh.coef_.sum():.3f} above;  SSE {rh @ rh:.2f}")

# 3) RBF features of size 13, centres 6, 11, 16, width s = 2.5
c, s = np.array([6, 11, 16]), 2.5
print("RBF at size 13:", np.exp(-(13 - c) ** 2 / (2 * s ** 2)).round(4))

# 4) B-spline basis: 5 knots on [6, 16], cubic -&gt; 5 + 3 - 1 = 7 columns
st = SplineTransformer(n_knots=5, degree=3).fit(size[:, None])
print("knots:", st.bsplines_[0].t[3:-3].round(2))
row = st.transform([[13]])[0]
print("cubic B-spline row at size 13:", row.round(4), " sum =", round(row.sum(), 6))</div>
  <div class="fx" data-lang="text">bin of each house: [0, 0, 1, 1, 2, 2]  bin means: [34.0, 59.5, 89.5]
hinge column: [0.0, 0.0, 0.0, 1.0, 3.0, 5.0]  weights [5.875 2.25 ]  intercept -7.0  -&gt; slope 5.875 below 11, 8.125 above;  SSE 13.75
RBF at size 13: [0.0198 0.7261 0.4868]
knots: [ 6.   8.5 11.  13.5 16. ]
cubic B-spline row at size 13: [0.     0.     0.0013 0.2827 0.6307 0.0853 0.    ]  sum = 1.0</div>
  <p>The bin means, the hinge weights (5.875 and 2.25, intercept −7) and the RBF and B-spline rows match the hand tables. <code>SplineTransformer(n_knots=5, degree=3)</code> places its knots evenly between the smallest and largest training size (6 and 16) and makes n_knots + degree − 1 = 7 columns.</p>
  <h3>Head to head at scale: the sine data</h3>
  <p>Six houses cannot rank these bases, so return to the 20 sine points of section 04. Each model is "basis columns, then linear regression" (the RBF model adds a tiny ridge penalty because 8 overlapping bumps are correlated). We also ask each for a prediction <em>outside</em> the data, at x = 1.2 and 1.5. The small <code>RBF</code> class is a custom sklearn transformer (fit stores the centres, transform computes the bumps; see <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a> for custom transformers).</p>
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
  <div class="bridge"><b>What this still can't tell us → next: Choosing the degree by cross-validation.</b> So far we judged degree 2 against degree 5 by eye (and degree 3 on the sine data with a test set, which is cheating: in real work the test set is touched once, at the end). How do we pick the degree honestly?</div>

  <h2 id="pr-cv"><span class="num">08</span>Choosing the Degree by Cross-Validation</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Training error always prefers degree 5 for the houses (SSE 0). We have no spare flats to test on. How do we score each degree on data it was not fitted to, using only the six houses we have?</p>
  </div>
  <h3>Why not training error, and why not the test set</h3>
  <p>Training error always prefers the highest degree (section 04), so it cannot choose. The test set must stay untouched until the final check, or its score stops being an honest estimate. The answer is <strong>cross-validation</strong> on the training data (full treatment in <a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a>): split the training rows into k folds, train on k − 1, measure error on the one left out, rotate, average. Pick the degree with the lowest average validation error. With six rows the natural choice is k = 6: <strong>leave-one-out (LOOCV)</strong>.</p>
  <h3>Leave-one-out by hand, with one shortcut</h3>
  <p>LOOCV refits the model six times, each time without one house, and predicts that house. For least squares there is an exact shortcut that needs only the full fit: the leave-one-out error of row i is the ordinary residual divided by (1 − hᵢ), its leverage (the PRESS residual):</p>
  <p style="text-align:center"><strong>e₍ᵢ₎ = eᵢ / (1 − hᵢ)</strong>, LOOCV MSE = mean of e₍ᵢ₎².</p>
  <p>For the straight line we already know everything from the diagnostics note: residuals 2, 0, −1, −2, −3, 4 and leverages 0.524, 0.295, 0.181, 0.181, 0.295, 0.524.</p>
  <table class="tbl out"><caption>Degree 1: leave-one-out errors by hand</caption>
    <tr><th>house</th><th>e</th><th>1 − h</th><th>e / (1 − h)</th><th>squared</th></tr>
    <tr><td>A</td><td>2</td><td>0.476</td><td>4.20</td><td>17.64</td></tr>
    <tr><td>B</td><td>0</td><td>0.705</td><td>0</td><td>0</td></tr>
    <tr><td>C</td><td>−1</td><td>0.819</td><td>−1.22</td><td>1.49</td></tr>
    <tr><td>D</td><td>−2</td><td>0.819</td><td>−2.44</td><td>5.96</td></tr>
    <tr><td>E</td><td>−3</td><td>0.705</td><td>−4.26</td><td>18.12</td></tr>
    <tr><td>F</td><td>4</td><td>0.476</td><td>8.40</td><td>70.56</td></tr>
    <tr><td colspan="4"><strong>mean = LOOCV MSE</strong></td><td><strong>113.77 / 6 = 18.96</strong></td></tr>
  </table>
  <p>Leaving F out, the line through A–E predicts 91.6 for F, an error of 8.4: that one house dominates. The code repeats this for degrees 1 to 4 (degree 5 cannot be scored: with one house left out it has 6 weights for 5 points, and every leverage is 1).</p>
  <div class="fx" data-lang="py">print("deg  LOOCV residuals e_i/(1-h_i)                    LOOCV MSE   train MSE")
for d in [1, 2, 3, 4]:
    Xd = np.vander(size - 11, d + 1)                       # columns z^d ... z, 1
    H = Xd @ np.linalg.solve(Xd.T @ Xd, Xd.T)              # hat matrix
    e = price - H @ price
    loo = e / (1 - np.diag(H))                             # PRESS residuals: leave-one-out errors
    print(f"{d:3d}  {np.array2string(loo.round(2), separator=', '):46s}  {np.mean(loo ** 2):8.2f}  {np.mean(e ** 2):9.3f}")</div>
  <div class="fx" data-lang="text">deg  LOOCV residuals e_i/(1-h_i)                    LOOCV MSE   train MSE
  1  [ 4.2 ,  0.  , -1.22, -2.44, -4.26,  8.4 ]         18.96      5.667
  2  [-3.8 ,  0.77,  1.82,  0.23, -3.56,  7.4 ]         14.30      1.649
  3  [ 7.4 , -1.96,  0.68,  1.71, -2.62,  8.8 ]         24.38      0.515
  4  [-7. ,  1.4, -0.7,  0.7, -1.4,  7. ]               17.15      0.032</div>
  <p>Training MSE falls with every degree (5.67, 1.65, 0.52, 0.03), but the LOOCV MSE is 18.96, <strong>14.30</strong>, 24.38, 17.15: degree 2 predicts unseen houses best. Degree 3 is worse than the straight line, because left-out end houses (A: 7.4, F: 8.8) force it to extrapolate a cubic. Leave-one-out with six rows is noisy (F alone contributes most of every score), so read it as "a gentle curve is supported; wiggles are not", not as proof.</p>
  <h3>The same idea at scale: a 5-fold table on the sine data</h3>
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
  <p>Degree 3's mean: (0.059 + 0.033 + 0.062 + 0.021 + 0.010) / 5 = 0.185 / 5 = <strong>0.037</strong>, the lowest in the table. Now look at the first fold column: degrees 7, 9 and 10 score 27.9, 9.2 and 56.5 there, while their other folds are fine. That fold holds the right end point x = 1, so the models trained without it must <em>extrapolate</em> to it, and high-degree polynomials explode outside their data. This is the houses' F problem again, and section 04's edge problem showing up inside CV. It also shows why we look at the spread, not just the mean.</p>
  <p><strong>The one-standard-error rule.</strong> CV scores are themselves noisy (only 4 validation points per fold here). A common habit is to choose the <em>simplest</em> model whose mean is within one standard error of the best. The standard error of degree 3's mean is std / √5 = 0.021 / 2.236 = 0.0094, so the bar is 0.037 + 0.009 = 0.046. Degrees 1 and 2 (0.412, 0.649) are far above it, so the rule also picks degree 3. When a higher degree only wins by a hair, the rule prefers the lower one.</p>
  <table class="tbl">
    <tr><th>Step</th><th>What to do</th></tr>
    <tr><td>1</td><td>Put <code>PolynomialFeatures</code> (or <code>SplineTransformer</code>), the scaler and the model in one <code>Pipeline</code></td></tr>
    <tr><td>2</td><td>Grid over degree (and the penalty α if regularising), using step names: <code>polynomialfeatures__degree</code>, <code>ridge__alpha</code></td></tr>
    <tr><td>3</td><td>Score with k-fold CV on the training data (LOOCV for tiny data like the houses); use shuffled folds unless the data has an order (time series: <code>TimeSeriesSplit</code>)</td></tr>
    <tr><td>4</td><td>Pick the best (or 1-SE) setting, refit on all training data, then score once on the test set</td></tr>
  </table>
  <p>The last line of the sine output did step 2 over degree × ridge α jointly: it chose degree 3 with a tiny penalty (α = 0.001), CV MSE 0.039. The double underscore means "parameter of this pipeline step" (step names are the lowercase class names made by <code>make_pipeline</code>).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Model selection by cross-validation</strong>: choose the hyperparameter (degree, number of knots, α) that minimises the average validation error across k folds of the training data. For least squares, <strong>LOOCV</strong> has the closed form mean[(eᵢ/(1 − hᵢ))²]. The CV score of the chosen setting is slightly optimistic (you picked the best of many); for an unbiased estimate use a held-out test set or nested CV.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Running <code>PolynomialFeatures</code> + <code>StandardScaler</code> on all the data first and cross-validating only the regression leaks the validation rows' scale into training. Always cross-validate the whole pipeline. And with time-ordered data, shuffled folds let the model "interpolate the future"; use forward-chaining splits.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Taming high degrees with regularization.</b> CV can pick a small degree. But sometimes you want a flexible model (many columns) <em>and</em> stable weights. The grid search hinted at the tool: a penalty on the weights.</div>

  <h2 id="pr-reg"><span class="num">09</span>Taming High Degrees with Regularization</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Degree 5 hit all six houses by using enormous weights that cancel each other. Instead of throwing columns away, could we keep them and simply forbid the weights from growing so large?</p>
  </div>
  <p>Section 04 showed the symptom of overfitting in the weights: degree 15 on the sine needed weights near 4,800 that cancel each other. Regularization attacks exactly that: it adds a cost for large weights to the least-squares loss, so the fit only uses a big weight if it really pays (the general idea is in <a class="xref" data-note="ml_regularization">Regularization</a>, the models in <a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a>). Ridge charges α·Σw², lasso charges α·Σ|w| and can set weights exactly to 0. First the houses: degree 5 on standardised powers, with and without a ridge penalty.</p>
  <div class="fx" data-lang="py">from sklearn.pipeline import make_pipeline
from sklearn.linear_model import Ridge
for name, reg in [("degree 5, OLS", LinearRegression()), ("degree 5, Ridge(0.1)", Ridge(0.1)), ("degree 5, Ridge(1)", Ridge(1.0))]:
    m = make_pipeline(PolynomialFeatures(5, include_bias=False), StandardScaler(), reg).fit(size[:, None], price)
    r = price - m.predict(size[:, None])
    print(f"{name:21s} train SSE {r @ r:7.3f}  max|w| {np.abs(m[-1].coef_).max():8.2f}  predicts 4 / 18: "
          f"{m.predict([[4]])[0]:7.2f} / {m.predict([[18]])[0]:7.2f}")</div>
  <div class="fx" data-lang="text">degree 5, OLS         train SSE   0.000  max|w|  2256.89  predicts 4 / 18:   12.00 /  152.00
degree 5, Ridge(0.1)  train SSE   9.536  max|w|    11.49  predicts 4 / 18:   20.59 /  121.35
degree 5, Ridge(1)    train SSE  35.879  max|w|     7.35  predicts 4 / 18:   26.09 /  126.40</div>
  <p>Without a penalty, degree 5 needs a weight of 2,257 (on standardised columns) to thread all six houses, and prices an 1,800 sq ft flat at 152. With Ridge(0.1) the largest weight is 11.5, the training SSE is 9.5 (about the quadratic's 9.89), and the 1,800 sq ft prediction is 121, close to the quadratic's 117.5. The penalty found a gentle curve by itself, without us choosing degree 2. Too much penalty (α = 1) starts to flatten the fit (SSE 35.9, worse than the straight line). The same idea at scale, on the sine data at degree 15:</p>
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
    <p>Regularization does not fix extrapolation. A ridge-penalised degree-5 curve is still a polynomial and still heads to ±∞ outside the training range, only more slowly (121 at 1,800 sq ft, and rising faster beyond).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How it all connects.</b> We have used one trick in many forms. How do the pieces fit together, and which one answers which question?</div>

  <h2 id="pr-connect"><span class="num">10</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Powers, centring, interactions, bins, hinges, splines, RBFs, cross-validation, penalties: are these separate techniques, or one idea seen from several sides?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 330" width="680">
<defs><marker id="pr-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="200" height="44" rx="7" class="fr sr"/><text x="110" y="29" text-anchor="middle" font-size="11.5" font-weight="700">residual smile</text><text x="110" y="45" text-anchor="middle" class="tm" font-size="10">+2, 0, −1, −2, −3, +4 (SSE 34)</text>
<line x1="210" y1="32" x2="238" y2="32" stroke="currentColor" marker-end="url(#pr-a9)"/>
<rect x="240" y="10" width="200" height="44" rx="7" class="fb sb" stroke-width="2"/><text x="340" y="29" text-anchor="middle" font-size="11.5" font-weight="700">new columns φ(x), same OLS</text><text x="340" y="45" text-anchor="middle" class="tm" font-size="10">linear in the weights</text>
<line x1="440" y1="32" x2="468" y2="32" stroke="currentColor" marker-end="url(#pr-a9)"/>
<rect x="470" y="10" width="200" height="44" rx="7" class="fb sb"/><text x="570" y="29" text-anchor="middle" font-size="11.5" font-weight="700">quadratic by hand</text><text x="570" y="45" text-anchor="middle" class="tm" font-size="10">58.66 + 7z + 0.2009z², SSE 9.89</text>
<line x1="290" y1="54" x2="90" y2="88" stroke="currentColor" marker-end="url(#pr-a9)"/><line x1="320" y1="54" x2="260" y2="88" stroke="currentColor" marker-end="url(#pr-a9)"/><line x1="360" y1="54" x2="430" y2="88" stroke="currentColor" marker-end="url(#pr-a9)"/><line x1="390" y1="54" x2="590" y2="88" stroke="currentColor" marker-end="url(#pr-a9)"/>
<rect x="10" y="90" width="160" height="44" rx="7" class="ft st"/><text x="90" y="109" text-anchor="middle" font-size="11.5" font-weight="700">powers xᵈ</text><text x="90" y="125" text-anchor="middle" class="tm" font-size="10">C(k+d, d) − 1 columns</text>
<rect x="180" y="90" width="160" height="44" rx="7" class="ft st"/><text x="260" y="109" text-anchor="middle" font-size="11.5" font-weight="700">products a·b</text><text x="260" y="125" text-anchor="middle" class="tm" font-size="10">slope 6.4 vs 7.83 (Metro)</text>
<rect x="350" y="90" width="160" height="44" rx="7" class="ft st"/><text x="430" y="109" text-anchor="middle" font-size="11.5" font-weight="700">local bases</text><text x="430" y="125" text-anchor="middle" class="tm" font-size="10">bins, hinge 5.9 → 8.1</text>
<rect x="520" y="90" width="150" height="44" rx="7" class="ft st"/><text x="595" y="109" text-anchor="middle" font-size="11.5" font-weight="700">splines, RBF</text><text x="595" y="125" text-anchor="middle" class="tm" font-size="10">smooth, local bumps</text>
<line x1="90" y1="134" x2="90" y2="168" stroke="currentColor" marker-end="url(#pr-a9)"/><line x1="90" y1="134" x2="300" y2="168" stroke="currentColor" marker-end="url(#pr-a9)"/>
<rect x="10" y="170" width="200" height="44" rx="7" class="fr sr"/><text x="110" y="189" text-anchor="middle" font-size="11.5" font-weight="700">correlated, huge columns</text><text x="110" y="205" text-anchor="middle" class="tm" font-size="10">corr(size, size²) 0.991</text>
<rect x="230" y="170" width="200" height="44" rx="7" class="fr sr"/><text x="330" y="189" text-anchor="middle" font-size="11.5" font-weight="700">overfitting with degree</text><text x="330" y="205" text-anchor="middle" class="tm" font-size="10">deg 5: SSE 0, 152 at 1,800 sq ft</text>
<line x1="110" y1="214" x2="110" y2="248" stroke="currentColor" marker-end="url(#pr-a9)"/><line x1="300" y1="214" x2="300" y2="248" stroke="currentColor" marker-end="url(#pr-a9)"/><line x1="380" y1="214" x2="520" y2="248" stroke="currentColor" marker-end="url(#pr-a9)"/>
<rect x="10" y="250" width="200" height="44" rx="7" class="fg sg"/><text x="110" y="269" text-anchor="middle" font-size="11.5" font-weight="700">centre / standardise</text><text x="110" y="285" text-anchor="middle" class="tm" font-size="10">corr → 0; cond 10²² → 38</text>
<rect x="230" y="250" width="200" height="44" rx="7" class="fg sg"/><text x="330" y="269" text-anchor="middle" font-size="11.5" font-weight="700">choose degree by CV</text><text x="330" y="285" text-anchor="middle" class="tm" font-size="10">LOOCV 18.96, 14.30, 24.38 → 2</text>
<rect x="450" y="250" width="220" height="44" rx="7" class="fg sg"/><text x="560" y="269" text-anchor="middle" font-size="11.5" font-weight="700">or keep columns + penalty</text><text x="560" y="285" text-anchor="middle" class="tm" font-size="10">Ridge(0.1): max|w| 2,257 → 11.5</text>
<line x1="560" y1="294" x2="560" y2="318" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#pr-a9)"/><text x="470" y="326" class="tm" font-size="10.5">→ Ridge, Lasso &amp; Elastic Net</text>
</svg><figcaption>One trick drives the whole note: when the residuals show a shape, give least squares new columns φ(x) and keep everything else. Powers, products and local bases are three families of columns; their side effects (correlated, huge, too flexible) are cured by centring, by cross-validation, or by a penalty, which leads to the next note.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the same six houses</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers</th><th>Our houses</th><th>Use when</th></tr>
    <tr><td>Residual smile</td><td>line residuals vs x</td><td>is the shape wrong?</td><td>+2, 0, −1, −2, −3, +4</td><td>always check first</td></tr>
    <tr><td>Quadratic term</td><td>new column x², OLS</td><td>can OLS fit a bend?</td><td>58.66 + 7z + 0.2009z²; SSE 9.89</td><td>one gentle bend</td></tr>
    <tr><td>Orthogonal columns</td><td>centring: 1, z, 3z² − 35</td><td>can each weight be found alone?</td><td>61, 7, 360/5376</td><td>hand work; stable fits</td></tr>
    <tr><td>Curve slope</td><td>derivative b₁ + 2b₂z</td><td>what is the effect of x now?</td><td>4.99 → 7.0 → 9.01</td><td>interpreting curves</td></tr>
    <tr><td>Polynomial features</td><td>all monomials ≤ d</td><td>which columns for k inputs?</td><td>F: 1, 16, 4, 256, 64, 16</td><td>few inputs, small d</td></tr>
    <tr><td>Overfitting</td><td>degree vs n</td><td>is lower training error better?</td><td>deg 5: SSE 0, 152 at 18</td><td>always beware</td></tr>
    <tr><td>Centring / scaling</td><td>subtract mean, divide SD</td><td>why are powers unstable?</td><td>corr 0.991 → 0</td><td>always with powers</td></tr>
    <tr><td>Interaction</td><td>product column a·b</td><td>does one input change another's slope?</td><td>6.4 vs 7.83 per 100 sq ft</td><td>domain-motivated pairs</td></tr>
    <tr><td>Bins, hinge</td><td>indicators, max(0, x − c)</td><td>steps, thresholds?</td><td>34, 59.5, 89.5; 5.875 → 8.125</td><td>thresholds, saturation</td></tr>
    <tr><td>Splines, RBF</td><td>local bumps</td><td>smooth, local, tame edges?</td><td>B-spline row at 13: 0.0013, 0.2827, 0.6307, 0.0853</td><td>default for smooth 1-D shapes</td></tr>
    <tr><td>LOOCV</td><td>eᵢ/(1 − hᵢ)</td><td>which degree generalises?</td><td>18.96, 14.30, 24.38, 17.15 → 2</td><td>choosing any capacity knob</td></tr>
    <tr><td>Penalty</td><td>SSE + α·Σw²</td><td>flexible yet stable?</td><td>deg 5 + Ridge(0.1): 121 at 18</td><td>many columns</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>to fit a curve, change the table, not the algorithm; then control the extra flexibility you added.</strong> Every new column type is a choice of shape; every problem it causes (collinearity, explosion at the edges, overfitting) is answered by centring, by cross-validation or by a penalty.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Comparisons.</b> With all the tools on the table: when is a polynomial the right choice at all, compared with splines, trees and other flexible models?</div>

  <h2 id="pr-compare"><span class="num">11</span>Comparisons</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Polynomials, splines, kernels, trees and neural networks can all fit curves. Which one should you reach for in which situation?</p>
  </div>
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
    <tr><td>One or two inputs with a gentle bend, need p-values (the houses)</td><td>Quadratic (centred), maybe one interaction</td></tr>
    <tr><td>Smooth effect of unknown shape, need to explain it</td><td>Natural / B-splines (a GAM)</td></tr>
    <tr><td>A threshold or saturation</td><td>Hinge (piecewise linear) at a known or searched knot</td></tr>
    <tr><td>Known period (day, week, year)</td><td>Fourier terms</td></tr>
    <tr><td>Many inputs, many interactions, tabular data</td><td>Gradient boosting (<a class="xref" data-note="ml_gbm">Gradient Boosting</a>)</td></tr>
    <tr><td>Must extrapolate</td><td>Linear or physically motivated model; never a high-degree polynomial</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: Common mistakes.</b> The classic ways to misuse polynomial and basis features, each seen on our houses or the sine data.</div>

  <h2 id="pr-traps"><span class="num">12</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which errors with curved models come up most in interviews and in production code?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: choosing degree by training error</span>
    <p>Training error falls with every extra degree (houses: SSE 34 → 0 at degree 5; sine: RMSE 0.689 → 0.125). Choose degree, knots or α by cross-validation on training data, then check once on the test set.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: not scaling the powers</span>
    <p>Raw size and size² correlate 0.991; raw years give cond(XᵀX) ≈ 10²² and garbage weights; unscaled powers also make ridge/lasso penalties and gradient descent meaningless. Centre or standardise x, and standardise after <code>PolynomialFeatures</code>, inside a pipeline.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: trusting the curve outside the data</span>
    <p>Degree 5 priced an 1,800 sq ft flat at 152 lakh; degree 15 predicted −214 at x = 1.1 on the sine (truth 0.59); even the sensible quadratic has a nonsense minimum at −640 sq ft. Polynomials are only valid inside the range they were fitted on, and are least reliable at its edges.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reading b₁ as "the effect of x"</span>
    <p>With x² or a·b in the model, the effect of x is b₁ + 2b₂x or b₁ + b₃b. Raw b₁ = 2.58 is the slope at 0 sq ft. Centre the inputs or report the slope at meaningful values (4.99, 7.0, 9.01).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: dropping main effects but keeping the product</span>
    <p>A model with size·metro but without metro forces the Metro gap to be zero at size 0, an assumption almost never intended. Follow the hierarchy principle.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: polynomial-expanding everything</span>
    <p>All numeric and one-hot columns at degree 3 can produce tens of thousands of columns, duplicates (dummy² = dummy) and very slow fits. Expand only the numeric columns you believe bend, add only interactions you can justify, or use a model that finds them (trees, boosting).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting it is still linear regression</span>
    <p>All of linear regression's assumptions still apply to the residuals (independence, constant variance). Polynomial terms fix the shape of the mean, not heteroscedasticity or correlated errors; recheck the diagnostics after adding them (for the houses, BP p went from 0.048 to 0.43).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet.</b> Compress the whole note into one page.</div>

  <h2 id="pr-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: six houses, size (hundreds of sq ft) 6, 8, 10, 12, 14, 16 and price (lakh) 28, 40, 53, 66, 79, 100; bedrooms 1, 2, 2, 3, 3, 4; Metro flats C and F. Straight line −16 + 7·size left residuals +2, 0, −1, −2, −3, +4 (SSE 34).</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>Answer on our houses</th><th>Weakness → next</th></tr>
    <tr><td>Curvature</td><td>what is wrong with the line?</td><td>smile; F +4</td><td>need a curve</td></tr>
    <tr><td>New columns</td><td>curve with OLS?</td><td>58.66 + 7z + 0.2009z², SSE 9.89</td><td>which columns for many inputs?</td></tr>
    <tr><td>Polynomial features</td><td>full column set?</td><td>F → 1, 16, 4, 256, 64, 16</td><td>is more degree better?</td></tr>
    <tr><td>Overfitting</td><td>more degree = better?</td><td>deg 5: SSE 0, 152 at 1,800 sq ft</td><td>numerical trouble</td></tr>
    <tr><td>Scaling</td><td>why unstable?</td><td>corr 0.991 → 0 centred</td><td>effects that depend on each other</td></tr>
    <tr><td>Interactions</td><td>slope by group?</td><td>6.4 vs 7.83 (Metro)</td><td>other column shapes?</td></tr>
    <tr><td>Basis functions</td><td>local shapes?</td><td>bins 34/59.5/89.5; hinge 5.9 → 8.1</td><td>how to choose?</td></tr>
    <tr><td>Cross-validation</td><td>which degree?</td><td>LOOCV 18.96, 14.30, 24.38, 17.15 → 2</td><td>flexibility + stability?</td></tr>
    <tr><td>Regularization</td><td>keep columns, tame weights?</td><td>Ridge(0.1): 2,257 → 11.5; 121 at 18</td><td>→ Ridge, Lasso &amp; Elastic Net</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>Polynomial model</td><td>ŷ = b₀ + b₁x + … + b_d x^d</td><td>linear in the b's; fitted by OLS</td></tr>
    <tr><td>Orthogonal weight</td><td>wⱼ = Σ(colⱼ·y) / Σcolⱼ²</td><td>valid when columns are orthogonal (centred 1, z, 3z² − 35)</td></tr>
    <tr><td>Slope of a quadratic</td><td>dŷ/dx = b₁ + 2b₂x; turning point x = −b₁/(2b₂)</td><td>effect changes along x</td></tr>
    <tr><td>Column count</td><td>C(k + d, d) − 1</td><td>k inputs, degree d, no bias</td></tr>
    <tr><td>Correlation of x, x²</td><td>r = Σdx·d(x²) / √(Σdx² · Σd(x²)²)</td><td>0.991 raw, 0 centred (symmetric x)</td></tr>
    <tr><td>Interaction</td><td>ŷ = b₀ + b₁a + b₂b + b₃ab; ∂ŷ/∂a = b₁ + b₃b</td><td>b₃ = change in a's slope per unit b</td></tr>
    <tr><td>Hinge</td><td>φ(x) = max(0, x − c)</td><td>slope changes by w at knot c</td></tr>
    <tr><td>Cubic B-spline (uniform)</td><td>(1 − u)³/6, (3u³ − 6u² + 4)/6, (−3u³ + 3u² + 3u + 1)/6, u³/6</td><td>u = position inside the knot interval; sum = 1</td></tr>
    <tr><td>RBF</td><td>φ(x) = exp(−(x − c)²/(2s²))</td><td>c centre, s width</td></tr>
    <tr><td>LOOCV for OLS</td><td>mean[(eᵢ/(1 − hᵢ))²]</td><td>hᵢ leverage</td></tr>
    <tr><td>Ridge penalty</td><td>SSE + α·Σwⱼ²</td><td>α chosen by CV; standardise first</td></tr>
  </table>
  <h3>The running example's numbers</h3>
  <table class="tbl">
    <tr><th>Model</th><th>Train SSE</th><th>LOOCV MSE</th><th>Price at 1,800 sq ft</th></tr>
    <tr><td>degree 1</td><td>34</td><td>18.96</td><td>110</td></tr>
    <tr><td>degree 2</td><td>9.89</td><td><strong>14.30</strong></td><td>117.5</td></tr>
    <tr><td>degree 3</td><td>3.09</td><td>24.38</td><td>125.7</td></tr>
    <tr><td>degree 4</td><td>0.19</td><td>17.15</td><td>139.2</td></tr>
    <tr><td>degree 5</td><td>0</td><td>–</td><td>152</td></tr>
    <tr><td>hinge at 11</td><td>13.75</td><td>–</td><td>–</td></tr>
    <tr><td>degree 5 + Ridge(0.1)</td><td>9.54</td><td>–</td><td>121.4</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Use polynomials</b><p>One or two inputs, a gentle bend, a need for p-values; degree 2–3, centred.</p><small>Check with CV</small></div>
    <div><b>Use splines / hinges</b><p>Unknown smooth shapes, thresholds, saturation; anything where edges matter.</p><small>Natural splines extrapolate linearly</small></div>
    <div><b>Use interactions</b><p>When domain knowledge says one input changes another's effect.</p><small>Keep main effects</small></div>
    <div><b>Avoid</b><p>High degrees, many inputs, extrapolation; tabular data with many interactions (use boosting).</p><small>Or add a penalty</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Choosing degree by training error; unscaled powers; trusting curves outside the data; reading raw b₁ as the effect; product terms without main effects; expanding dummies; forgetting to re-run diagnostics; fitting transformers outside CV.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Columns for 10 inputs at degree 3 (no bias)?</td><td>C(13, 3) − 1 = 285</td></tr>
    <tr><td>ŷ = 58.66 + 7z + 0.2009z²: slope at z = 5?</td><td>7 + 2 × 0.2009 × 5 = 9.01</td></tr>
    <tr><td>Residual 4 with leverage 0.524: leave-one-out error?</td><td>4 / 0.476 = 8.4</td></tr>
    <tr><td>Why is degree 5 on six houses useless despite SSE 0?</td><td>6 weights for 6 points always interpolate; it predicts 152 at 1,800 sq ft</td></tr>
    <tr><td>Hinge model −7 + 5.875x + 2.25·max(0, x − 11): slope above 11?</td><td>5.875 + 2.25 = 8.125</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: Questions &amp; answers.</b> Test yourself before moving on to <a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a>.</div>

  <h2 id="pr-qa"><span class="num">13</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you fit, read and choose a curve without the page, and say why each step needs the one before it?</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Polynomial regression fits a curve. Why is it still called a linear model?</summary><div class="qa-body">Because it is linear in the parameters: ŷ = b₀ + b₁x + b₂x² is a weighted sum of fixed columns (1, x, x²). Least squares, the normal equation, standard errors and p-values work unchanged. "Linear" refers to the weights, not to the shape in x.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you notice that you need a polynomial or spline term in the first place?</summary><div class="qa-body">A residual plot (residuals against x or against ŷ) with a pattern, such as a smile: positive at both ends, negative in the middle (+2, 0, −1, −2, −3, +4 on the houses). Domain knowledge (big flats carry a premium) and partial-dependence or binned-average plots also show bends. A high R² alone does not rule out curvature (the line had R² 0.990).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Fit a quadratic to the six houses by hand. What is the trick?</summary><div class="qa-body">Centre: z = size − 11 = −5..5. Use columns 1, z and q = 3z² − 35, which are mutually orthogonal, so each weight is Σ(col·y)/Σcol²: 366/6 = 61, 490/70 = 7, 360/5376 = 0.06696. So ŷ = 61 + 7z + 0.06696(3z² − 35) = 58.66 + 7z + 0.2009z², SSE 9.89.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How many columns does PolynomialFeatures create for 10 inputs at degree 3?</summary><div class="qa-body">C(10 + 3, 3) = 286 including the bias column, so 285 without it. In general C(k + d, d), which grows like k^d / d!. With 50 inputs, degree 3 gives 23,425 columns.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Training error keeps falling as you raise the degree. Why, and what do you do?</summary><div class="qa-body">A higher-degree model contains every lower-degree model (set the extra weights to 0), so its best training error can only be equal or lower; at degree n − 1 it interpolates (houses: degree 5, SSE 0). Choose the degree by cross-validation (houses: LOOCV picks 2; sine: 5-fold picks 3), optionally with the one-standard-error rule.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why should you centre or standardise x before or after creating powers?</summary><div class="qa-body">(1) x and x² are highly correlated on a positive range (0.991 for sizes 6..16), causing multicollinearity and unstable b₀, b₁; centring makes them uncorrelated. (2) Powers of large numbers are huge (years cubed ≈ 10¹⁰), so XᵀX becomes numerically singular (cond ≈ 10²²). (3) Penalties and gradient descent need comparable scales. Predictions do not change, only stability and interpretation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In ŷ = 58.66 + 7z + 0.2009z² (z = size − 11), what is the effect of size, and where is the turning point?</summary><div class="qa-body">The effect is the derivative 7 + 0.402z: 4.99 lakh per 100 sq ft at 600 sq ft, 7.0 at 1,100, 9.01 at 1,600. The turning point is z = −7/0.402 = −17.4 (−640 sq ft). It lies outside the data, so it is an artefact, not a finding.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is an interaction term and how do you interpret its coefficient?</summary><div class="qa-body">A product column a·b. With ŷ = b₀ + b₁a + b₂b + b₃ab, the effect of a is b₁ + b₃b, so b₃ is how much a's slope changes per unit of b. Houses: size slope 6.4 outside Metro, 6.4 + 1.433 = 7.83 in Metro. b₂ alone is the Metro gap at size 0. Keep the main effects (hierarchy principle).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a basis function expansion? Give three examples besides powers.</summary><div class="qa-body">Replacing x by fixed functions φ₁(x)…φ_m(x) and fitting a linear model on them. Examples: step/bin indicators (houses: 34, 59.5, 89.5), hinges max(0, x − c) (slope 5.875 → 8.125 at 1,100 sq ft), cubic B-splines (local bumps that sum to 1), Gaussian RBFs exp(−(x − c)²/2s²), Fourier sin/cos terms for seasonality.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why are splines usually preferred over high-degree polynomials?</summary><div class="qa-body">Splines are local: each piece only affects the curve between nearby knots, so one point cannot swing the whole fit, the columns stay small and well conditioned, and edges are tame (natural splines are linear beyond the boundary knots). High-degree polynomials are global, ill-conditioned and oscillate at the edges (Runge's phenomenon).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a knot do, and how do you choose how many?</summary><div class="qa-body">A knot is where the piecewise formula is allowed to change (a hinge bends there; a spline switches to a new cubic with matching value, slope and curvature). More knots = more flexibility = more variance. Place them at quantiles of x and choose the number by cross-validation, or use many knots with a smoothness penalty.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which model would you trust to extrapolate: degree-3 polynomial, cubic spline, or decision tree?</summary><div class="qa-body">None fully. The polynomial heads to ±∞ (predicted 4.98 and 19.73 for a sine bounded by 1; degree 5 priced 1,800 sq ft at 152). sklearn's spline holds its edge value by default (natural splines continue linearly). A tree is flat beyond its last split. For genuine extrapolation use a model whose behaviour outside the data comes from domain knowledge.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute the leave-one-out error for house F under the straight line, and explain the shortcut.</summary><div class="qa-body">For least squares the leave-one-out residual is eᵢ/(1 − hᵢ). F: e = 4, h = 0.524, so 4/0.476 = 8.4 (the line through A–E predicts 91.6, F sold for 100). Averaging the squared PRESS residuals gives LOOCV MSE without refitting: 18.96 for the line, 14.30 for the quadratic.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does adding x² need the diagnostics note before it and the ridge note after it?</summary><div class="qa-body">Before: the residual smile and the F-test (34 → 9.89, p = 0.07) are what tell you a curve is needed at all; without them you are guessing. After: powers are strongly correlated (0.991) and many of them overfit (degree 5: weights 2,257), which is exactly the unstable-weights problem ridge and lasso solve. Ridge(0.1) on degree 5 gave a quadratic-like fit by itself.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip centring before adding size²?</summary><div class="qa-body">Nothing in the predictions, but almost everything else: size and size² correlate 0.991 (VIF 57.7), so their standard errors inflate and coefficients swing between samples; b₁ becomes the slope at 0 sq ft (2.58) instead of at the average flat (7.0); penalties treat the two columns unequally; and with large raw values XᵀX becomes numerically singular.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how are kernels (SVM) and neural networks related to basis functions?</summary><div class="qa-body">An RBF kernel is an RBF basis with one bump per training point, used implicitly through the kernel trick instead of building the columns. A ReLU hidden layer is a set of hinge basis functions whose knots and directions are learned by gradient descent. Both are "features, then a linear model", like polynomial regression.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You add x² and the p-value of x becomes large. Should you drop x?</summary><div class="qa-body">No. With x² in the model, the coefficient of x is the slope at x = 0, which may be near zero or poorly determined simply because 0 is outside the data; x and x² are also correlated, inflating standard errors. Keep lower-order terms when a higher-order one is in (hierarchy), and centre x to make the coefficients meaningful.</div></details>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a>.</b> Extra columns (powers, products, or simply size next to bedrooms) are often strongly correlated, and least squares then spreads wild, cancelling weights across them. The last note of the group adds a price on large weights and works it by hand on the same six houses.</div>
</main>
`
});
