// ml/ml_regression.js — Regression
Object.assign(TOPIC_CONTENT, {
  "ml_regression": `<main>
  <h1>Regression</h1>
  <p class="lead">Regression predicts a number: marks from study hours, a flat's rent from its size, tomorrow's electricity demand. This note covers the best-fit line (OLS), its one-line formula, how to check the line with residual plots, and how ridge, lasso and elastic net handle correlated or useless features. Logistic regression and neural network layers reuse all of these ideas.</p>

  <h2 id="mr-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Regression</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">OLS</div>
        <ul>
          <li><b>Model</b> — ŷ = w₀ + w₁x₁ + … + w_dx_d = Xw</li>
          <li><b>Loss</b> — minimise Σ(y − ŷ)², the sum of squared residuals</li>
          <li><b>Residual</b> — y − ŷ; vertical gap from point to line</li>
          <li><b>Why squared</b> — smooth, one closed-form minimum, punishes big misses</li>
          <li><b>R²</b> — share of variance explained; 1 − SS_res/SS_tot</li>
          <li>💡 A stick tied to every point by rubber bands; it settles where total pull is least</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Normal equation</div>
        <ul>
          <li><b>w = (XᵀX)⁻¹Xᵀy</b> — set gradient to zero, solve</li>
          <li><b>Geometry</b> — ŷ is the projection of y onto the span of X; residuals ⟂ every column</li>
          <li><b>Cost</b> — O(nd²) + O(d³); fine for d ≲ 10k</li>
          <li><b>Big d / streaming</b> — gradient descent instead</li>
          <li>⚠ Singular XᵀX with duplicate features; sklearn uses SVD (lstsq), never inv()</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Assumptions (LINE)</div>
        <ul>
          <li><b>L</b>inearity — violated → biased coefficients; curve in residual plot</li>
          <li><b>I</b>ndependence — violated (time series) → SEs too small; Durbin–Watson ≈ 2 is good</li>
          <li><b>N</b>ormal errors — only for p-values/CIs; matters least</li>
          <li><b>E</b>qual variance — fan shape; Breusch–Pagan; fix with log(y) or WLS</li>
          <li><b>Multicollinearity</b> — VIF &gt; 10; unstable signs; fix with ridge or drop</li>
          <li>⚠ High R² ≠ correct model: the curved case still had R² 0.956</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Ridge (L2)</div>
        <ul>
          <li><b>Loss</b> — RSS + α·Σw²</li>
          <li><b>Closed form</b> — (XᵀX + αI)⁻¹Xᵀy; always invertible</li>
          <li><b>Effect</b> — shrinks all, zeros none; splits weight among correlated twins</li>
          <li>💡 Pocket money spread over all features</li>
          <li>Diabetes: s1/s2 (corr 0.9) went −37.7/+22.7 → −11.3/+1.8</li>
          <li>⚠ Scale features first; penalty is unit-dependent</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Lasso (L1) &amp; Elastic Net</div>
        <ul>
          <li><b>Lasso</b> — RSS + α·Σ|w|; drives weights to exactly 0 → feature selection</li>
          <li><b>Why zeros</b> — diamond constraint has corners on the axes; 💡 fixed fee vs % tax</li>
          <li>⚠ Correlated twins: keeps one arbitrarily (2.9, 0.0); unstable selection</li>
          <li><b>Elastic Net</b> — α·[r·L1 + (1−r)·L2/2]; sparse <em>and</em> keeps groups</li>
          <li><b>Payoff</b> — 200 noise columns: OLS R² −0.26, Ridge 0.37, Lasso 0.49 (6 kept)</li>
          <li>Tune α with RidgeCV / LassoCV / ElasticNetCV, never by eye</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Polynomial regression</div>
        <ul>
          <li><b>Idea</b> — add x², x³, x₁x₂ then fit a linear model; still linear in w</li>
          <li><b>Overfit</b> — degree 15: train RMSE 0.12, test 0.55 (degree 3: 0.33)</li>
          <li><b>Explosion</b> — 10 inputs → 65 / 285 / 3002 features at degree 2 / 3 / 5</li>
          <li><b>Fix</b> — low degree + Ridge (deg 15 + Ridge: test 0.37), or use trees</li>
          <li>💡 Degree 15 = mugging last year's paper word by word</li>
          <li>⚠ Wild at the edges: never extrapolate a high-degree fit</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mr-ols"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">OLS: the best-fit line</span><span class="rm-sub">Residuals and squared loss</span></div></div>
      <div class="rm-item rm-done" data-target="mr-normal"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Normal Equation</span><span class="rm-sub">One line, one projection</span></div></div>
      <div class="rm-item rm-done" data-target="mr-diag"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Assumptions &amp; Diagnostics</span><span class="rm-sub">Reading residual plots</span></div></div>
      <div class="rm-item rm-done" data-target="mr-reg"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Ridge, Lasso, Elastic Net</span><span class="rm-sub">Shrinkage with real numbers</span></div></div>
      <div class="rm-item rm-done" data-target="mr-l1"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Why L1 Gives Zeros</span><span class="rm-sub">Diamond vs circle</span></div></div>
      <div class="rm-item rm-done" data-target="mr-poly"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Polynomial Regression</span><span class="rm-sub">Curves and overfitting</span></div></div>
      <div class="rm-item rm-done" data-target="mr-build"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Hands-on</span><span class="rm-sub">When regularisation pays</span></div></div>
      <div class="rm-item rm-done" data-target="mr-qa"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="mr-ols"><span class="num">01</span>OLS: the Best-Fit Line</h2>
  <p>Six students tell you their study hours and marks. You want one straight line to predict marks for a new student. Many lines are possible. OLS picks the one with the smallest total error.</p>
  <figure class="viz"><svg viewBox="0 0 520 250" width="520">
<line x1="50" y1="225" x2="505" y2="225" stroke="currentColor"/><line x1="50" y1="5" x2="50" y2="225" stroke="currentColor"/>
<text x="40" y="211" text-anchor="end" class="tm" font-size="11">50</text><text x="40" y="131" text-anchor="end" class="tm" font-size="11">60</text><text x="40" y="51" text-anchor="end" class="tm" font-size="11">70</text>
<text x="95" y="242" text-anchor="middle" class="tm" font-size="11">1</text><text x="165" y="242" text-anchor="middle" class="tm" font-size="11">2</text><text x="235" y="242" text-anchor="middle" class="tm" font-size="11">3</text><text x="305" y="242" text-anchor="middle" class="tm" font-size="11">4</text><text x="375" y="242" text-anchor="middle" class="tm" font-size="11">5</text><text x="445" y="242" text-anchor="middle" class="tm" font-size="11">6</text>
<line x1="60" y1="211" x2="480" y2="11" class="sb" stroke-width="2"/>
<line x1="95" y1="191" x2="95" y2="194" class="sr" stroke-width="2" stroke-dasharray="3 2"/>
<line x1="165" y1="167" x2="165" y2="161" class="sr" stroke-width="2" stroke-dasharray="3 2"/>
<line x1="235" y1="119" x2="235" y2="128" class="sr" stroke-width="2" stroke-dasharray="3 2"/>
<line x1="305" y1="111" x2="305" y2="94" class="sr" stroke-width="2" stroke-dasharray="3 2"/>
<line x1="375" y1="47" x2="375" y2="61" class="sr" stroke-width="2" stroke-dasharray="3 2"/>
<line x1="445" y1="31" x2="445" y2="28" class="sr" stroke-width="2" stroke-dasharray="3 2"/>
<circle cx="95" cy="191" r="4.5" class="ft st"/><circle cx="165" cy="167" r="4.5" class="ft st"/><circle cx="235" cy="119" r="4.5" class="ft st"/><circle cx="305" cy="111" r="4.5" class="ft st"/><circle cx="375" cy="47" r="4.5" class="ft st"/><circle cx="445" cy="31" r="4.5" class="ft st"/>
<text x="70" y="25" class="tb" font-size="13">ŷ = 47.4 + 4.17·hours</text>
<text x="318" y="108" class="tr" font-size="12">residual −2.09</text>
<text x="500" y="218" text-anchor="end" class="tm" font-size="11">hours studied</text>
<text x="58" y="12" class="tm" font-size="11">score</text>
</svg><figcaption>OLS picks the line that makes the sum of the squared red gaps as small as possible.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Ordinary least squares (OLS)</strong> fits ŷ = w₀ + w₁x₁ + … + w_dx_d by minimising <code>Σ(yᵢ − ŷᵢ)²</code>. Squaring makes the loss smooth, gives one minimum, and punishes large misses more than small ones.</p>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Tie each point to a long stick with a rubber band. The stick settles where the bands pull least in total. One far-away point stretches its band a lot and pulls the stick hard. That is why OLS is sensitive to outliers.</p>
  </div>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression
X = np.array([[1],[2],[3],[4],[5],[6]]); y = np.array([52,55,61,62,70,72])
m = LinearRegression().fit(X, y)
print(f"slope {m.coef_[0]:.3f}  intercept {m.intercept_:.3f}")
res = y - m.predict(X)
print("residuals:", res.round(2), " sum:", round(res.sum(), 10))
print("R2:", round(m.score(X, y), 3))</div>
  <div class="fx" data-lang="text">slope 4.171  intercept 47.400
residuals: [ 0.43 -0.74  1.09 -2.09  1.74 -0.43]  sum: 0.0
R2: 0.97</div>
  <p>Each extra hour adds about 4.2 marks. A student who studies 0 hours is predicted 47.4. The residuals add up to exactly 0 whenever the model has an intercept.</p>

  <h2 id="mr-normal"><span class="num">02</span>The Normal Equation</h2>
  <p>The normal equation gives the best weights in one step, with no trial and error. It comes from one idea: at the lowest point of the loss, the slope is zero.</p>
  <div class="flow"><span>Loss ‖y − Xw‖²</span><span>Gradient −2Xᵀ(y − Xw)</span><span>Set to 0: XᵀXw = Xᵀy</span><span>w = (XᵀX)⁻¹Xᵀy</span></div>
  <div class="callout intu"><span class="label">Key formula</span>
    <p><strong>w = (XᵀX)⁻¹Xᵀy</strong>. X has a leading column of 1s for the intercept.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 440 200" width="440">
<defs><marker id="mr-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<path d="M30 150 L250 175 L410 130 L190 105 Z" class="fs" stroke="currentColor"/>
<text x="30" y="194" class="tm" font-size="12">plane = span of X's columns</text>
<line x1="120" y1="140" x2="250" y2="30" stroke="currentColor" stroke-width="2" marker-end="url(#mr-ah)"/>
<text x="258" y="28" font-size="13">y</text>
<line x1="120" y1="140" x2="250" y2="135" class="sb" stroke-width="2" marker-end="url(#mr-ah)"/>
<text x="256" y="150" class="tb" font-size="13">ŷ = Xw</text>
<line x1="250" y1="35" x2="250" y2="130" class="sr" stroke-width="2" stroke-dasharray="4 3"/>
<text x="258" y="88" class="tr" font-size="12">residual y − ŷ ⟂ plane</text>
<path d="M250 122 h-8 v9" fill="none" stroke="currentColor"/>
</svg><figcaption>ŷ is the shadow of y on the space your features can reach; the residual sticks straight out of it.</figcaption></figure>
  <p>Because residuals are perpendicular to every feature column (<code>Xᵀ(y − ŷ) = 0</code>), they are uncorrelated with every feature and with ŷ by construction.</p>
  <div class="fx" data-lang="py">Xb = np.c_[np.ones(len(X)), X]                 # add the 1s column
w = np.linalg.solve(Xb.T @ Xb, Xb.T @ y)       # solve, don't invert
print("normal eq:", w.round(3))</div>
  <div class="fx" data-lang="text">normal eq: [47.4    4.171]</div>
  <table class="tbl">
    <tr><th>Situation</th><th>Use</th><th>Why</th></tr>
    <tr><td>d up to ~10k features</td><td>Closed form (SVD / <code>lstsq</code>)</td><td>O(nd² + d³), exact, no learning rate</td></tr>
    <tr><td>Huge d or data won't fit in memory</td><td>(Mini-batch) gradient descent, <code>SGDRegressor</code></td><td>O(nd) per pass, streams</td></tr>
    <tr><td>Duplicate / perfectly collinear features</td><td>Ridge or drop one</td><td>XᵀX is singular; (XᵀX + αI) is not</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>np.linalg.inv(X.T @ X)</code> silently returns garbage when XᵀX is nearly singular. Use <code>np.linalg.lstsq</code> (SVD) or <code>solve</code>; sklearn's <code>LinearRegression</code> already does.</p>
  </div>

  <h2 id="mr-diag"><span class="num">03</span>Assumptions &amp; Diagnostics</h2>
  <p>OLS gives correct answers and correct p-values only if some conditions hold. The easy check is a <strong>residual plot</strong>: errors (y − ŷ) on the y-axis, predictions on the x-axis. A good model leaves only random noise behind.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A doctor does not stop at one number on a blood report. R² is that one number. The residual plot is the full report: it shows what kind of problem is there.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 570 150" width="570">
<line x1="10" y1="75" x2="130" y2="75" stroke="currentColor" stroke-dasharray="3 3"/><line x1="150" y1="75" x2="270" y2="75" stroke="currentColor" stroke-dasharray="3 3"/><line x1="290" y1="75" x2="410" y2="75" stroke="currentColor" stroke-dasharray="3 3"/><line x1="430" y1="75" x2="550" y2="75" stroke="currentColor" stroke-dasharray="3 3"/>
<path d="M114 77h0M101 78h0M71 61h0M50 67h0M105 74h0M19 74h0M108 63h0M70 116h0M119 62h0M68 68h0M87 87h0M114 106h0M75 93h0M42 71h0M17 72h0M20 91h0M98 83h0M121 62h0M12 79h0M79 61h0M104 69h0M125 73h0M65 79h0M81 87h0M21 67h0M56 95h0M60 57h0M41 83h0M73 68h0M80 72h0M25 65h0M120 76h0M16 85h0M13 68h0M128 53h0M94 71h0M39 83h0M46 95h0M25 81h0M122 79h0M57 64h0M74 70h0M75 83h0M122 83h0M57 64h0M51 56h0M44 56h0M30 77h0M98 89h0M84 61h0M88 87h0M12 78h0M73 85h0M117 95h0M13 67h0M54 92h0M116 70h0M117 78h0M81 86h0M122 62h0" class="sb" stroke-width="4" stroke-linecap="round"/>
<path d="M251 83h0M262 49h0M200 98h0M261 49h0M265 51h0M166 59h0M267 50h0M230 85h0M260 60h0M224 94h0M201 109h0M177 70h0M170 75h0M238 84h0M183 80h0M262 50h0M203 93h0M228 92h0M194 100h0M184 93h0M238 85h0M238 77h0M150 42h0M262 54h0M213 100h0M201 93h0M225 97h0M203 97h0M219 96h0M159 54h0M249 77h0M257 66h0M160 50h0M186 90h0M173 76h0M177 81h0M231 81h0M216 100h0M221 95h0M172 66h0M194 87h0M263 57h0M182 79h0M151 45h0M256 66h0M213 101h0M158 46h0M165 58h0M255 56h0M226 87h0M181 79h0M246 72h0M231 76h0M215 98h0M179 79h0M245 86h0M152 45h0M270 35h0M157 50h0M237 95h0" class="sb" stroke-width="4" stroke-linecap="round"/>
<path d="M402 64h0M307 66h0M401 83h0M359 78h0M308 79h0M388 63h0M312 76h0M298 77h0M394 70h0M397 67h0M322 76h0M359 73h0M408 102h0M402 67h0M328 79h0M294 73h0M297 72h0M351 70h0M378 76h0M299 77h0M295 75h0M322 82h0M322 66h0M402 54h0M348 73h0M376 91h0M317 74h0M300 74h0M368 76h0M301 69h0M390 85h0M334 73h0M389 46h0M331 76h0M388 35h0M405 92h0M406 60h0M368 74h0M353 69h0M345 75h0M404 76h0M358 80h0M319 62h0M353 76h0M378 70h0M397 73h0M291 75h0M295 72h0M389 52h0M378 75h0M296 76h0M310 86h0M391 75h0M402 60h0M371 63h0M383 92h0M355 68h0M341 72h0M321 81h0M300 72h0" class="sb" stroke-width="4" stroke-linecap="round"/>
<path d="M430 69h0M432 72h0M434 79h0M436 82h0M438 72h0M440 59h0M442 64h0M444 52h0M446 67h0M448 58h0M450 74h0M452 72h0M454 94h0M456 103h0M458 79h0M460 61h0M462 71h0M464 65h0M466 64h0M469 64h0M470 74h0M472 73h0M475 60h0M476 81h0M478 83h0M481 76h0M482 98h0M485 104h0M487 107h0M488 95h0M491 92h0M493 70h0M495 87h0M497 86h0M499 84h0M501 71h0M503 83h0M505 77h0M507 73h0M509 72h0M511 81h0M513 75h0M515 70h0M517 73h0M519 81h0M521 68h0M523 64h0M525 62h0M527 59h0M529 47h0M531 66h0M534 70h0M536 65h0M537 69h0M540 52h0M542 77h0M543 83h0M546 90h0M548 84h0M550 68h0" class="sb" stroke-width="4" stroke-linecap="round"/>
<text x="70" y="18" text-anchor="middle" class="tg" font-size="13">healthy</text><text x="210" y="18" text-anchor="middle" class="tr" font-size="13">curve</text><text x="350" y="18" text-anchor="middle" class="tr" font-size="13">fan</text><text x="490" y="18" text-anchor="middle" class="tr" font-size="13">snake</text>
<text x="70" y="140" text-anchor="middle" class="tm" font-size="11">random band</text><text x="210" y="140" text-anchor="middle" class="tm" font-size="11">missing x² term</text><text x="350" y="140" text-anchor="middle" class="tm" font-size="11">variance grows</text><text x="490" y="140" text-anchor="middle" class="tm" font-size="11">residuals vs time</text>
</svg><figcaption>Real residuals (y-axis) vs fitted values from four simulated datasets. Only the first is a model you can trust.</figcaption></figure>
  <table class="tbl">
    <tr><th>Assumption</th><th>If violated</th><th>Check</th><th>Fix</th></tr>
    <tr><td><strong>L</strong>inearity</td><td>Biased coefficients, systematic misses</td><td>Curve in residual plot</td><td>Add x², log, splines; or trees</td></tr>
    <tr><td><strong>I</strong>ndependent errors</td><td>Coefficients fine, SEs too small → fake significance</td><td>Durbin–Watson (≈ 2 good, ≪ 2 bad)</td><td>Lag features, time-series model, Newey–West SEs</td></tr>
    <tr><td><strong>N</strong>ormal errors</td><td>Only p-values / CIs off (small n)</td><td>Q-Q plot</td><td>Usually ignore for large n (CLT)</td></tr>
    <tr><td><strong>E</strong>qual variance</td><td>Unbiased but inefficient; SEs wrong</td><td>Fan shape; Breusch–Pagan p &lt; 0.05</td><td>log(y), weighted least squares, robust SEs</td></tr>
    <tr><td>No multicollinearity</td><td>Coefficients swing, signs flip</td><td>VIF &gt; 10</td><td>Ridge, drop or combine features</td></tr>
  </table>
  <div class="fx" data-lang="py">import statsmodels.api as sm
from statsmodels.stats.stattools import durbin_watson
from statsmodels.stats.diagnostic import het_breuschpagan
from statsmodels.stats.outliers_influence import variance_inflation_factor
rng = np.random.default_rng(0); n = 200
x = rng.uniform(1, 10, n)
e = rng.normal(0, 1, n); ar1 = np.zeros(n)
for t in range(1, n): ar1[t] = 0.9*ar1[t-1] + e[t]          # AR(1) errors
cases = {"good":     3 + 2*x + rng.normal(0, 1, n),
         "curved":   3 + 0.5*x**2 + rng.normal(0, 1, n),
         "fan":      3 + 2*x + rng.normal(0, 0.4*x, n),
         "autocorr": 3 + 2*np.sort(x) + ar1}
for name, y in cases.items():
    xx = np.sort(x) if name == "autocorr" else x
    X = sm.add_constant(xx); fit = sm.OLS(y, X).fit(); r = fit.resid
    curv = np.corrcoef(r, (xx - xx.mean())**2)[0, 1]
    print(f"{name:9s} R2={fit.rsquared:.3f}  DW={durbin_watson(r):.2f}  "
          f"BP p={het_breuschpagan(r, X)[1]:.3f}  corr(res,x^2)={curv:+.2f}")
x1 = rng.normal(size=n); x2 = x1 + rng.normal(0, 0.1, n); x3 = rng.normal(size=n)
Xv = sm.add_constant(np.c_[x1, x2, x3])
print("VIF:", [float(round(variance_inflation_factor(Xv, i), 1)) for i in range(1, 4)])</div>
  <div class="fx" data-lang="text">good      R2=0.968  DW=2.15  BP p=0.505  corr(res,x^2)=+0.05
curved    R2=0.956  DW=1.96  BP p=0.067  corr(res,x^2)=+0.93
fan       R2=0.846  DW=1.94  BP p=0.000  corr(res,x^2)=-0.01
autocorr  R2=0.897  DW=0.33  BP p=0.272  corr(res,x^2)=+0.30
VIF: [90.0, 89.9, 1.0]</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The curved model has R² 0.956 and is still wrong: its residuals correlate 0.93 with x². A high R² never proves the form is right. Always look at the residual plot.</p>
  </div>

  <h2 id="mr-reg"><span class="num">04</span>Ridge, Lasso, Elastic Net</h2>
  <p><strong>Regularisation</strong> adds a penalty for large weights to the OLS loss. Why: with correlated or useless features, OLS weights become huge, flip sign and change with every new sample. The penalty keeps weights small and stable.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>You get fixed pocket money to spend on features. Ridge spreads it a little over every feature. Lasso spends it only on the few that matter most and gives the rest nothing.</p>
  </div>
  <div class="cards">
    <div><b>Ridge (L2)</b><p>RSS + α·Σw². Shrinks every weight smoothly, never to 0.</p><small>Many useful, correlated features</small></div>
    <div><b>Lasso (L1)</b><p>RSS + α·Σ|w|. Pushes weak weights to exactly 0.</p><small>Many useless features; want selection</small></div>
    <div><b>Elastic Net</b><p>Mix of both (<code>l1_ratio</code>: 0 = ridge, 1 = lasso).</p><small>Correlated groups + sparsity</small></div>
  </div>
  <p>α is the strength of the penalty. α → 0 gives plain OLS. α → ∞ makes every weight 0, so the model just predicts the average. In between, you accept a little bias for much less variance.</p>
  <div class="fx" data-lang="py">from sklearn.datasets import load_diabetes
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet
X, y = load_diabetes(return_X_y=True, as_frame=True)          # 442 patients, 10 features
models = {"OLS": LinearRegression(), "Ridge a=10": Ridge(alpha=10),
          "Lasso a=1": Lasso(alpha=1), "ENet a=1 r=.5": ElasticNet(alpha=1, l1_ratio=0.5)}
coefs = {n: make_pipeline(StandardScaler(), m).fit(X, y)[-1].coef_ for n, m in models.items()}
print(pd.DataFrame(coefs, index=X.columns).round(1) + 0.0)</div>
  <table class="tbl out"><caption>Coefficients per 1 SD of each feature (real output)</caption>
    <tr><th>feature</th><th>OLS</th><th>Ridge α=10</th><th>Lasso α=1</th><th>ENet α=1, r=.5</th></tr>
    <tr><td>age</td><td>−0.5</td><td>−0.3</td><td><strong>0.0</strong></td><td>0.6</td></tr>
    <tr><td>sex</td><td>−11.4</td><td>−10.9</td><td>−9.3</td><td>−5.7</td></tr>
    <tr><td>bmi</td><td>24.7</td><td>24.6</td><td>24.8</td><td>18.1</td></tr>
    <tr><td>bp</td><td>15.4</td><td>15.1</td><td>14.1</td><td>11.4</td></tr>
    <tr><td>s1</td><td><strong>−37.7</strong></td><td>−11.3</td><td>−4.8</td><td>−0.2</td></tr>
    <tr><td>s2</td><td><strong>22.7</strong></td><td>1.8</td><td><strong>0.0</strong></td><td>−2.4</td></tr>
    <tr><td>s3</td><td>4.8</td><td>−6.6</td><td>−10.6</td><td>−8.2</td></tr>
    <tr><td>s4</td><td>8.4</td><td>5.6</td><td><strong>0.0</strong></td><td>5.3</td></tr>
    <tr><td>s5</td><td>35.7</td><td>25.3</td><td>24.4</td><td>15.4</td></tr>
    <tr><td>s6</td><td>3.2</td><td>3.5</td><td>2.6</td><td>5.1</td></tr>
    <tr><td><em>5-fold CV R²</em></td><td>0.482</td><td>0.481</td><td>0.482</td><td>0.458</td></tr>
  </table>
  <p>s1 and s2 are two cholesterol readings with correlation 0.9. OLS gives them big opposite weights (−37.7 and +22.7) that cancel each other. Ridge brings them down. Lasso sets s2, age and s4 to 0, and CV R² does not drop.</p>
  <div class="fx" data-lang="text">lasso alpha=0.1  nonzero=9  kept=['age', 'sex', 'bmi', 'bp', 's1', 's2', 's4', 's5', 's6']
lasso alpha=1    nonzero=7  kept=['sex', 'bmi', 'bp', 's1', 's3', 's5', 's6']
lasso alpha=5    nonzero=5  kept=['sex', 'bmi', 'bp', 's3', 's5']
lasso alpha=10   nonzero=4  kept=['bmi', 'bp', 's3', 's5']
lasso alpha=20   nonzero=3  kept=['bmi', 'bp', 's5']</div>
  <h3>Correlated twins: who gets the weight?</h3>
  <div class="fx" data-lang="py">temp_c  = rng.normal(25, 5, 100)
temp_c2 = temp_c + rng.normal(0, 0.05, 100)     # near-duplicate sensor
y = 3*temp_c + rng.normal(0, 3, 100)            # true total effect: 3 per degree
# fit each model on 3 bootstrap resamples, print [w_A, w_B]</div>
  <div class="fx" data-lang="text">model   boot1          boot2          boot3
OLS     [ -3.8,  6.8]  [ -3.7,  6.7]  [ -0.4,  3.4]
Ridge   [  1.5,  1.5]  [  1.6,  1.4]  [  1.6,  1.4]
Lasso   [  2.9,  0.0]  [  3.0,  0.0]  [  2.9,  0.0]
ENet    [  1.5,  1.5]  [  1.5,  1.5]  [  1.4,  1.4]</div>
  <p>OLS gives wild splits with flipping signs. Ridge and Elastic Net share the weight equally. Lasso gives everything to one twin. Which twin wins depends on tiny noise, so on other data it can pick the other one.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Always standardise before ridge or lasso. The penalty treats a weight on "income in rupees" and "age in years" the same way, so units change the answer. Put the scaler inside a <code>Pipeline</code> so CV does not leak.</p>
  </div>

  <h2 id="mr-l1"><span class="num">05</span>Why L1 Gives Zeros</h2>
  <p>Lasso can switch features fully off; ridge cannot. This is why lasso is used for feature selection. The picture shows the reason.</p>
  <figure class="viz"><svg viewBox="0 -8 540 240" width="540">
<line x1="20" y1="120" x2="240" y2="120" stroke="currentColor"/><line x1="130" y1="20" x2="130" y2="210" stroke="currentColor"/>
<text x="236" y="136" class="tm" font-size="12">w₁</text><text x="136" y="206" class="tm" font-size="12">w₂</text>
<path d="M130 70 L180 120 L130 170 L80 120 Z" class="fb sb" fill-opacity="0.35"/>
<ellipse cx="165" cy="40" rx="60" ry="36.9" fill="none" class="sr" stroke-width="2"/>
<ellipse cx="165" cy="40" rx="30" ry="18.5" fill="none" class="sr" stroke-dasharray="3 3"/>
<circle cx="165" cy="40" r="3" class="fr"/><text x="172" y="36" class="tr" font-size="11">OLS ŵ</text>
<circle cx="130" cy="70" r="5" class="fg sg"/><text x="118" y="70" text-anchor="end" class="tg" font-size="12">w₁ = 0 here</text>
<text x="130" y="226" text-anchor="middle" font-size="13">L1: |w₁| + |w₂| ≤ t</text>
<line x1="300" y1="120" x2="520" y2="120" stroke="currentColor"/><line x1="410" y1="20" x2="410" y2="210" stroke="currentColor"/>
<text x="516" y="136" class="tm" font-size="12">w₁</text><text x="416" y="206" class="tm" font-size="12">w₂</text>
<circle cx="410" cy="120" r="50" class="ft st" fill-opacity="0.35"/>
<ellipse cx="445" cy="40" rx="60" ry="35" fill="none" class="sr" stroke-width="2"/>
<ellipse cx="445" cy="40" rx="30" ry="17.5" fill="none" class="sr" stroke-dasharray="3 3"/>
<circle cx="445" cy="40" r="3" class="fr"/><text x="452" y="36" class="tr" font-size="11">OLS ŵ</text>
<circle cx="430" cy="74" r="5" class="fg sg"/><text x="440" y="90" class="tg" font-size="12">both ≠ 0</text>
<text x="410" y="226" text-anchor="middle" font-size="13">L2: w₁² + w₂² ≤ t</text>
</svg><figcaption>Loss contours (red) grow from the OLS solution until they first touch the allowed region. The diamond is usually hit at a corner, where a weight is exactly 0.</figcaption></figure>
  <p>The same idea with gradients: the L2 pull is 2αw. It gets weaker as w gets small, so w never quite reaches 0. The L1 pull is a constant α all the way down. Weak weights get pushed to 0 and stay there.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>L2 is like a percentage tax: small earners pay very little and are never wiped out. L1 is like a fixed fee of ₹500: anyone earning less than ₹500 is left with nothing.</p>
  </div>

  <h2 id="mr-poly"><span class="num">06</span>Polynomial Regression &amp; Overfitting</h2>
  <figure class="viz"><svg viewBox="0 0 540 230" width="540">
<defs><clipPath id="mr-clip"><rect x="20" y="5" width="500" height="200"/></clipPath></defs>
<line x1="30" y1="110" x2="510" y2="110" stroke="currentColor" stroke-dasharray="2 4"/>
<polyline clip-path="url(#mr-clip)" points="30,82 37,83 44,84 51,85 58,86 65,87 72,88 79,89 86,90 93,91 100,93 107,94 113,95 120,96 127,97 134,98 141,99 148,100 155,101 162,102 169,103 176,104 183,105 190,106 197,107 204,109 211,110 218,111 225,112 232,113 239,114 246,115 253,116 260,117 267,118 273,119 280,120 287,121 294,122 301,123 308,124 315,126 322,127 329,128 336,129 343,130 350,131 357,132 364,133 371,134 378,135 385,136 392,137 399,138 406,139 413,140 420,141 427,143 433,144 440,145 447,146 454,147 461,148 468,149 475,150 482,151 489,152 496,153 503,154 510,155" fill="none" class="sb" stroke-width="2"/>
<polyline clip-path="url(#mr-clip)" points="30,109 37,101 44,93 51,87 58,81 65,75 72,71 79,67 86,64 93,61 100,59 107,57 113,56 120,55 127,55 134,56 141,56 148,57 155,59 162,61 169,63 176,65 183,68 190,71 197,75 204,78 211,82 218,86 225,90 232,94 239,98 246,102 253,107 260,111 267,115 273,120 280,124 287,128 294,132 301,136 308,140 315,144 322,147 329,150 336,153 343,156 350,159 357,161 364,162 371,164 378,165 385,166 392,166 399,166 406,165 413,164 420,162 427,160 433,157 440,154 447,150 454,145 461,139 468,133 475,127 482,119 489,111 496,102 503,92 510,81" fill="none" class="sg" stroke-width="2"/>
<polyline clip-path="url(#mr-clip)" points="30,105 37,101 44,96 51,92 58,86 65,81 72,75 79,69 86,63 93,58 100,54 107,50 113,47 120,46 127,45 134,46 141,48 148,51 155,54 162,58 169,63 176,68 183,73 190,77 197,82 204,86 211,90 218,94 225,97 232,100 239,102 246,105 253,108 260,111 267,114 273,118 280,122 287,126 294,131 301,136 308,142 315,147 322,152 329,157 336,161 343,164 350,166 357,167 364,166 371,165 378,163 385,160 392,158 399,156 406,154 413,154 420,154 427,156 433,158 440,160 447,159 454,154 461,143 468,125 475,98 482,64 489,28 496,3 503,10 510,85" fill="none" class="sr" stroke-width="2"/>
<path d="M30 112h0M38 82h0M46 109h0M50 90h0M114 46h0M159 54h0M174 70h0M233 100h0M290 132h0M291 121h0M321 161h0M336 155h0M380 167h0M380 156h0M420 157h0M422 154h0M442 164h0M444 154h0M468 126h0M510 85h0" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
<text x="40" y="226" class="tb" font-size="12">degree 1 (underfit)</text><text x="200" y="226" class="tg" font-size="12">degree 3 (good)</text><text x="340" y="226" class="tr" font-size="12">degree 15 (chases noise)</text>
</svg><figcaption>20 noisy points from a sine wave. Degree 15 bends to hit points, especially at the edges.</figcaption></figure>
  <p>Polynomial regression adds new columns like x², x³ and x₁x₂, then fits a normal linear model. Why: a straight line cannot follow a curve. It is still <em>linear in the weights</em>, so all OLS tools still work.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Degree 15 is a student who memorises last year's question paper word by word. Full marks on that paper, poor marks on a new one. Degree 3 is the student who learnt the concept.</p>
  </div>
  <div class="fx" data-lang="py">from sklearn.preprocessing import PolynomialFeatures
rng = np.random.default_rng(0)
x = np.sort(rng.uniform(0, 1, 20)); x[[0, -1]] = 0, 1
y = np.sin(2*np.pi*x) + rng.normal(0, 0.3, 20)
xt = rng.uniform(0, 1, 1000); yt = np.sin(2*np.pi*xt) + rng.normal(0, 0.3, 1000)
for d in [1, 3, 9, 15]:
    m = make_pipeline(PolynomialFeatures(d), StandardScaler(), LinearRegression()).fit(x[:, None], y)
    ...   # print train / test RMSE
m = make_pipeline(PolynomialFeatures(15), StandardScaler(), Ridge(alpha=0.1)).fit(x[:, None], y)</div>
  <div class="fx" data-lang="text">degree  1         train RMSE 0.53  test RMSE 0.58
degree  3         train RMSE 0.16  test RMSE 0.33
degree  9         train RMSE 0.15  test RMSE 0.34
degree 15         train RMSE 0.12  test RMSE 0.55
degree 15 + Ridge train RMSE 0.25  test RMSE 0.37
features from 10 inputs, degree 2/3/5: [65, 285, 3002]</div>
  <p>Train error keeps falling as the degree rises. Test error falls, then rises again (a U shape). Ridge brings degree 15 back close to degree 3. With 10 inputs, degree 3 already makes 285 columns.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>High-degree polynomials explode outside the training range (and near its edges). Keep degree ≤ 2–3, always regularise, and prefer trees or splines for complex shapes.</p>
  </div>

  <h2 id="mr-build"><span class="num">07</span>Hands-on: When Regularisation Pays</h2>
  <p>Tune α by cross-validation, then add 200 pure-noise columns to see who survives.</p>
  <div class="fx" data-lang="py">from sklearn.model_selection import train_test_split
from sklearn.linear_model import RidgeCV, LassoCV, ElasticNetCV
from sklearn.metrics import r2_score
models = {"OLS": LinearRegression(),
          "RidgeCV": RidgeCV(alphas=np.logspace(-3, 3, 13)),
          "LassoCV": LassoCV(cv=5, random_state=0),
          "ElasticCV": ElasticNetCV(l1_ratio=[.2, .5, .8, 1], cv=5, random_state=0)}
rng = np.random.default_rng(0)
Xn = np.c_[X.values, rng.normal(size=(len(X), 200))]          # 10 real + 200 noise
Xtr, Xte, ytr, yte = train_test_split(Xn, y, test_size=0.25, random_state=42)
for name, m in models.items():
    p = make_pipeline(StandardScaler(), m).fit(Xtr, ytr)
    print(f"{name:10s} test R2 {r2_score(yte, p.predict(Xte)):.3f}  "
          f"nonzero coefs {int((p[-1].coef_ != 0).sum())}/210")</div>
  <div class="fx" data-lang="text">OLS        test R2 -0.258  nonzero coefs 210/210
RidgeCV    test R2 0.366  nonzero coefs 210/210
LassoCV    test R2 0.485  nonzero coefs 6/210
ElasticCV  test R2 0.485  nonzero coefs 6/210</div>
  <p>With only the 10 real features, all four models score test R² ≈ 0.485–0.487. With 210 features and 331 training rows, OLS learns the noise and does worse than predicting the average. Ridge helps. Lasso keeps 6 columns and gets back the original score. ElasticNetCV chose <code>l1_ratio=1</code>, which is pure lasso.</p>

  <h2 id="mr-qa"><span class="num">08</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the normal equation, and when would you not use it?</summary><div class="qa-body">w = (XᵀX)⁻¹Xᵀy, from setting the gradient of the squared loss to zero. Avoid it when d is very large (O(d³) solve), when data doesn't fit in memory (use mini-batch GD), or when XᵀX is singular from perfectly correlated features (use ridge: (XᵀX + αI)⁻¹Xᵀy). In code use an SVD-based solver (<code>lstsq</code>), not an explicit inverse.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why are OLS residuals always uncorrelated with the fitted values?</summary><div class="qa-body">ŷ is the orthogonal projection of y onto the column space of X, so Xᵀ(y − ŷ) = 0. The residual vector is perpendicular to every column and hence to ŷ = Xw. It's a consequence of the fit, not evidence the model is good.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>List the OLS assumptions. Which violation matters most in practice?</summary><div class="qa-body">LINE: linearity, independent errors, normal errors, equal variance (plus no severe multicollinearity). Linearity violations bias the coefficients. Independence violations (time series) leave coefficients unbiased but shrink standard errors, so everything looks significant: check Durbin–Watson. Normality matters least; coefficients stay unbiased and large n makes inference approximately valid.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your residual plot fans out as fitted values grow. What is it and what do you do?</summary><div class="qa-body">Heteroscedasticity. Estimates stay unbiased but standard errors are wrong. Fixes: log-transform a right-skewed target, weighted least squares, or heteroscedasticity-robust (HC) standard errors. Confirm with Breusch–Pagan (p was 0.000 in the fan example).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Ridge vs lasso vs elastic net: how do you choose?</summary><div class="qa-body">Ridge: most features matter, some are correlated, you want stable coefficients. Lasso: you suspect many features are useless and want automatic selection. Elastic net: many correlated features and you still want sparsity; it keeps correlated groups together. Always tune α (and l1_ratio) with CV.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does L1 produce exact zeros but L2 doesn't?</summary><div class="qa-body">Geometrically, the L1 ball is a diamond with corners on the axes; expanding loss contours usually touch it at a corner, where some weights are 0. The L2 ball is round, so the touch point is generic. Via gradients: L1's pull is constant (α) down to zero, L2's pull (2αw) vanishes as w shrinks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two features are 0.99 correlated. What happens to OLS, ridge and lasso coefficients?</summary><div class="qa-body">OLS: unstable, large opposite-signed weights that change with every resample (e.g. [−3.8, 6.8] then [−0.4, 3.4]). Ridge: splits the effect roughly evenly ([1.5, 1.5]). Lasso: gives it all to one ([2.9, 0.0]) and which one is arbitrary. Elastic net behaves like ridge on the pair while still allowing sparsity elsewhere.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must you scale features before ridge or lasso but not for plain OLS?</summary><div class="qa-body">OLS predictions are unchanged by rescaling a feature (its weight just rescales). The penalty, however, sums raw weights, so a feature measured in small units needs a big weight and gets punished more. Standardising puts every weight on the same footing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is polynomial regression a linear model? How many features does degree 3 on 10 inputs create?</summary><div class="qa-body">Yes: it's linear in the weights; only the features are non-linear. PolynomialFeatures(3, include_bias=False) on 10 inputs gives 285 columns (286 with the bias column), so pair it with ridge or prefer trees.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>LinearRegression().fit([[1],[2],[3]], [2,4,6]).coef_</code></summary><div class="qa-body"><code>array([2.])</code> with intercept ≈ 0: the points lie exactly on y = 2x, so every residual is 0 and R² = 1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Training R² is 0.99 and test R² is negative. What happened?</summary><div class="qa-body">Overfitting: too many features (or polynomial terms) for the rows, so the model fits noise. Negative R² means worse than predicting the mean, as with OLS on 210 features / 331 rows (−0.258). Fix with regularisation (lasso recovered 0.485), fewer features, or more data.</div></details>
</main>`
});
