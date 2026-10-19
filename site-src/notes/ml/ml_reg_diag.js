// notes/ml/ml_reg_diag.js — Assumptions & Diagnostics
Object.assign(TOPIC_CONTENT, {
  "ml_reg_diag": `<main>
  <h1>Assumptions &amp; Diagnostics</h1>
  <div class="where"><span>Machine Learning</span><span>Regression</span><span>Assumptions &amp; Diagnostics</span></div>
  <p class="lead">Least squares always returns a line, even when a line is the wrong model, and it always prints standard errors and p-values, even when they are badly wrong. This note covers the five classic assumptions behind linear regression (linearity, independence, equal variance, normal errors, no perfect multicollinearity). For each one it explains what breaks when it fails, how to detect the failure (residual plots, Q-Q plots, Breusch–Pagan, Durbin–Watson and VIF, each computed by hand on a few numbers) and how to fix it (transforms, robust standard errors, weighted least squares, interactions). It then covers unusual points (leverage and Cook's distance by hand), outliers, robust regression, and the one problem no residual plot can show: omitted-variable bias and endogeneity.</p>

  <h2 id="rd-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_regression">Linear Regression</a></b><span>We fitted ŷ = Xw by least squares and read a statsmodels summary: standard errors from s²(XᵀX)⁻¹, t-statistics, p-values, confidence and prediction intervals. Every one of those numbers was derived <em>assuming</em> something about the errors. The open question: how do we know those assumptions hold, and what do we do when they don't?</span></li>
    <li><b>This note adds: a check, a test and a fix for every assumption</b><span>Residuals and leverage as the raw material; residual-vs-fitted, scale-location and Q-Q plots; RESET, Durbin–Watson, Breusch–Pagan, Jarque–Bera and VIF; robust (HC) and HAC standard errors, WLS, transforms; leverage, studentised residuals and Cook's distance; omitted-variable bias.</span></li>
    <li><b>Leads to: the fixes that need their own notes</b><span>A curved residual plot sends you to <a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a>. A large VIF sends you to <a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a>. Autocorrelated residuals send you to <a class="xref" data-note="ml_timeseries">Time Series</a> and <a class="xref" data-note="ml_arima">ARIMA</a>. Judging any model's error size is <a class="xref" data-note="ml_reg_metrics">Regression Metrics</a>.</span></li>
  </ol>
  <figure class="viz"><svg viewBox="0 0 680 250" width="680">
<defs><marker id="rd-fa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="250" y="8" width="180" height="42" rx="8" class="fs" stroke="currentColor"/>
<text x="340" y="27" text-anchor="middle" font-size="13">Linear Regression</text><text x="340" y="42" text-anchor="middle" class="tm" font-size="11">fit + SEs, p-values, intervals</text>
<line x1="340" y1="50" x2="340" y2="78" stroke="currentColor" marker-end="url(#rd-fa)"/>
<rect x="235" y="80" width="210" height="50" rx="8" class="fb sb" stroke-width="3"/>
<text x="340" y="101" text-anchor="middle" font-size="14" font-weight="700">Assumptions &amp; Diagnostics</text><text x="340" y="120" text-anchor="middle" class="tb" font-size="11">YOU ARE HERE: can we trust it?</text>
<line x1="270" y1="130" x2="100" y2="178" stroke="currentColor" marker-end="url(#rd-fa)"/>
<line x1="320" y1="130" x2="265" y2="178" stroke="currentColor" marker-end="url(#rd-fa)"/>
<line x1="360" y1="130" x2="420" y2="178" stroke="currentColor" marker-end="url(#rd-fa)"/>
<line x1="410" y1="130" x2="585" y2="178" stroke="currentColor" marker-end="url(#rd-fa)"/>
<text x="150" y="150" class="tr" font-size="11">curved residuals</text><text x="232" y="168" class="tr" font-size="11">high VIF</text><text x="400" y="168" class="tr" font-size="11">autocorrelation</text><text x="520" y="150" class="tr" font-size="11">error size</text>
<rect x="20" y="180" width="160" height="46" rx="8" class="ft st"/>
<text x="100" y="199" text-anchor="middle" font-size="12.5">Polynomial &amp; Basis</text><text x="100" y="216" text-anchor="middle" class="tm" font-size="11">fix linearity</text>
<rect x="190" y="180" width="150" height="46" rx="8" class="ft st"/>
<text x="265" y="199" text-anchor="middle" font-size="12.5">Ridge / Lasso</text><text x="265" y="216" text-anchor="middle" class="tm" font-size="11">fix collinearity</text>
<rect x="350" y="180" width="150" height="46" rx="8" class="fg sg"/>
<text x="425" y="199" text-anchor="middle" font-size="12.5">Time Series / ARIMA</text><text x="425" y="216" text-anchor="middle" class="tm" font-size="11">model dependence</text>
<rect x="510" y="180" width="150" height="46" rx="8" class="fg sg"/>
<text x="585" y="199" text-anchor="middle" font-size="12.5">Regression Metrics</text><text x="585" y="216" text-anchor="middle" class="tm" font-size="11">score the fit</text>
<text x="340" y="244" text-anchor="middle" class="tm" font-size="11">Blue = this note. Teal = siblings in the Regression group. Green = other groups.</text>
</svg><figcaption>Diagnostics sit between fitting and trusting. Each failed check points to a specific fix, several of which are their own notes.</figcaption></figure>
  <p>You should know the slope formula, the normal equation, the hat matrix H = X(XᵀX)⁻¹Xᵀ and how standard errors come from s²(XᵀX)⁻¹ (all in <a class="xref" data-note="ml_regression">Linear Regression</a>). The running examples reuse that note's Team A (5 employees, salary vs experience: ŷ = 1.4 + 1.4x, residuals 0.2, 0.8, −1.6, 0, 0.6) and Team B (experience and certifications).</p>

  <h2 id="rd-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Assumptions &amp; Diagnostics</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">What the assumptions buy</div>
        <ul>
          <li><b>L</b>inearity + exogeneity → unbiased coefficients</li>
          <li><b>I</b>ndependence + <b>E</b>qual variance → correct SEs (Gauss–Markov: BLUE)</li>
          <li><b>N</b>ormal errors → exact small-n t/F tests and prediction intervals</li>
          <li>No perfect multicollinearity → a unique solution at all</li>
          <li>💡 Fit is the photo; residuals are the X-ray</li>
          <li>⚠ Only linearity/exogeneity bias the weights; the rest break the uncertainty</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Residuals &amp; leverage</div>
        <ul>
          <li>Var(eᵢ) = σ²(1 − hᵢ); hᵢ = 1/n + (xᵢ − x̄)²/S_xx</li>
          <li>Team A: h = 0.6, 0.3, 0.2, 0.3, 0.6 (sum = p = 2)</li>
          <li>Standardised rᵢ = eᵢ / (s√(1 − hᵢ)): P3 = −1.63</li>
          <li>Studentised (leave-one-out s): P3 = −4.0</li>
          <li>Plots: resid vs fitted · scale-location · Q-Q · resid vs leverage</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Linearity &amp; independence</div>
        <ul>
          <li>Curve in resid-vs-fitted: y = x² by a line → +2, −1, −2, −1, +2</li>
          <li>RESET p 0.0000 → add x² → p 0.153</li>
          <li><b>DW</b> = Σ(eₜ − eₜ₋₁)² / Σe²; ≈ 2 good, &lt; 1.5 positive autocorr</li>
          <li>By hand 1.29 / 4.16 = 0.31</li>
          <li>AR(1) sim: false positives 34% (classic) · 18% (HAC) · 5% (GLSAR)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Equal variance &amp; normality</div>
        <ul>
          <li>Fan shape; <b>BP</b>: regress e² on X, LM = n·R² = 8 × 0.648 = 5.18, p 0.023</li>
          <li>Fixes: log y · WLS (w = 1/variance) · <b>HC3</b> robust SEs</li>
          <li>Coverage sim: classic 88.6% vs HC3 94.3%</li>
          <li><b>Q-Q</b>: sorted residuals vs normal quantiles</li>
          <li>Skewed errors: slope CI still 95%; PI misses only on one side</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Multicollinearity</div>
        <ul>
          <li><b>VIF</b>ⱼ = 1/(1 − Rⱼ²); Team B 1/(1 − 0.514) = 2.06</li>
          <li>SE grows by √VIF; R² and predictions do not change</li>
          <li>Sensors: VIF 1 → 183 → 6710; se 0.07 → 0.97 → 5.88</li>
          <li>Centre before x² / interactions (VIF 26.7 → 1)</li>
          <li>Fix: drop/combine, PCA, ridge</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Influence &amp; endogeneity</div>
        <ul>
          <li><b>Cook's D</b> = (r²/p)·h/(1 − h); far-off point: h 0.89, D 13.6</li>
          <li>Outlier ≠ leverage ≠ influence (needs both)</li>
          <li>Huber does not fix leverage (slope 0.21); RANSAC does (1.40)</li>
          <li><b>OVB</b>: short slope = β₁ + β₂δ (1.0 + 3 × 0.25 = 1.75)</li>
          <li>Measurement error in x → attenuation (0.50)</li>
          <li>⚠ No residual plot can reveal OVB</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="rd-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Diagnose?</span><span class="rm-sub">What each assumption buys</span></div></div>
      <div class="rm-item rm-done" data-target="rd-resid"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Residuals &amp; Leverage</span><span class="rm-sub">The raw material, by hand</span></div></div>
      <div class="rm-item rm-done" data-target="rd-lin"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Linearity</span><span class="rm-sub">Curves, RESET, interactions</span></div></div>
      <div class="rm-item rm-done" data-target="rd-ind"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Independence</span><span class="rm-sub">Durbin–Watson, HAC, GLS</span></div></div>
      <div class="rm-item rm-done" data-target="rd-het"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Equal Variance</span><span class="rm-sub">Breusch–Pagan, robust SE, WLS</span></div></div>
      <div class="rm-item rm-done" data-target="rd-norm"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Normality of Errors</span><span class="rm-sub">Q-Q by hand, when it matters</span></div></div>
      <div class="rm-item rm-done" data-target="rd-mc"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Multicollinearity</span><span class="rm-sub">VIF by hand, condition number</span></div></div>
      <div class="rm-item rm-done" data-target="rd-infl"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Outliers, Leverage &amp; Influence</span><span class="rm-sub">Cook's distance by hand</span></div></div>
      <div class="rm-item rm-done" data-target="rd-endo"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Endogeneity &amp; Omitted Variables</span><span class="rm-sub">The invisible bias</span></div></div>
      <div class="rm-item rm-done" data-target="rd-flow"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">A Full Diagnostic Workflow</span><span class="rm-sub">Diagnose, fix, re-check</span></div></div>
      <div class="rm-item rm-done" data-target="rd-table"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Tests &amp; Fixes at a Glance</span><span class="rm-sub">Comparison tables</span></div></div>
      <div class="rm-item rm-done" data-target="rd-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Traps in interviews and code</span></div></div>
      <div class="rm-item rm-done" data-target="rd-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="rd-why"><span class="num">01</span>Why Diagnose?</h2>
  <h3>The need</h3>
  <p>A manager reads your regression output: "experience: coefficient 1.4, p = 0.027, 95% CI [0.30, 2.50]". She will set a salary policy on it. But that p-value was computed by a formula that assumed the errors are independent, equally spread and normal. If the data were 5 months of one person's salary (not independent), or the spread of salaries grows with seniority (not equal), the true uncertainty could be twice as large and the "significant" result could be luck. Nothing in the output warns you. <strong>Diagnostics are how you find out.</strong></p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A fitted model is a photo of a patient: R² says "looks healthy". Diagnostics are the X-ray and blood test. Most of the time they confirm the photo; sometimes they show a fracture you could never see from outside.</p>
  </div>
  <h3>The assumptions, and what each one buys</h3>
  <p>The model is y = Xw + ε. The classic assumptions (often remembered as <strong>LINE</strong> plus one) are about X and ε:</p>
  <table class="tbl">
    <tr><th>Assumption</th><th>Plain words</th><th>If violated, what breaks</th><th>Coefficients biased?</th></tr>
    <tr><td><strong>L</strong>inearity (and exogeneity: E[ε | X] = 0)</td><td>the average of y really is a weighted sum of the columns; nothing left out is correlated with them</td><td>systematic errors; coefficients wrong; predictions wrong in parts of the range</td><td><strong>yes</strong></td></tr>
    <tr><td><strong>I</strong>ndependence of errors</td><td>one row's error tells you nothing about another's</td><td>SEs too small, p-values too small, CIs too narrow</td><td>no</td></tr>
    <tr><td><strong>N</strong>ormality of errors</td><td>errors follow a bell curve</td><td>small-sample t/F tests slightly off; prediction intervals wrong shape</td><td>no</td></tr>
    <tr><td><strong>E</strong>qual variance (homoscedasticity)</td><td>errors have the same spread for every row</td><td>SEs wrong (usually too small); OLS no longer the most efficient</td><td>no</td></tr>
    <tr><td>No perfect multicollinearity</td><td>no column is an exact combination of others</td><td>no unique solution (perfect); huge SEs, unstable signs (high)</td><td>no (but unstable)</td></tr>
  </table>
  <p>Read the last column twice. <strong>Only linearity/exogeneity failures bias the coefficients.</strong> The others leave the coefficients unbiased but make the <em>uncertainty statements</em> wrong. Gauss–Markov (OLS is the Best Linear Unbiased Estimator) needs linearity, exogeneity, independence and equal variance, but not normality. Normality is only needed for exact small-sample tests and for prediction intervals.</p>
  <h3>Which assumptions matter for your goal?</h3>
  <table class="tbl">
    <tr><th>Goal</th><th>Care most about</th><th>Care less about</th></tr>
    <tr><td>Pure prediction (test RMSE)</td><td>linearity (wrong shape = worse predictions), stable relationships over time</td><td>normality, equal variance, multicollinearity (predictions survive it)</td></tr>
    <tr><td>Inference ("does x matter? by how much?")</td><td>all of them: SEs, p-values and CIs depend on each</td><td>–</td></tr>
    <tr><td>Prediction intervals for single cases</td><td>equal variance and normality (the interval's width and shape)</td><td>multicollinearity</td></tr>
    <tr><td>Causal claims ("raising x will raise y")</td><td>exogeneity above all (section 09)</td><td>–</td></tr>
  </table>
  <h3>The workflow</h3>
  <div class="flow"><span>Fit OLS</span><span>Residuals vs fitted (linearity, variance)</span><span>Q-Q plot (normality)</span><span>Residuals vs order/time (independence)</span><span>VIF (collinearity)</span><span>Leverage &amp; Cook's D (influence)</span><span>Fix, refit, re-check</span></div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Regression diagnostics</strong> are checks on the residuals eᵢ = yᵢ − ŷᵢ and on the design matrix X that test whether the assumptions behind OLS inference hold, and whether individual rows control the fit. They use plots (for the shape of a problem) and formal tests (for a yes/no decision).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"The assumption is that X (or y) is normally distributed." No: the normality assumption is about the <em>errors</em> (in practice, the residuals). A skewed feature like income is fine as a feature; a skewed target is often fine too, if the residuals are well-behaved.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Every check is made on residuals. Before using them we need to know one subtle fact: residuals are not all equally variable, even when the true errors are.</div>

  <h2 id="rd-resid"><span class="num">02</span>Residuals &amp; Leverage: the Raw Material</h2>
  <h3>Residuals are not the errors</h3>
  <p>The true errors εᵢ are invisible; residuals are our estimates of them. Because the line is fitted to the same points, it bends toward each point, and it bends toward points with unusual x the most. In matrix terms e = (I − H)y, and if the errors all have variance σ², then <strong>Var(eᵢ) = σ²(1 − hᵢᵢ)</strong>, where hᵢᵢ (written hᵢ) is the i-th diagonal of the hat matrix: the point's <strong>leverage</strong>.</p>
  <h3>Leverage by hand</h3>
  <p>With one feature, hᵢ = 1/n + (xᵢ − x̄)²/S_xx. For Team A: n = 5, x̄ = 3, S_xx = 10.</p>
  <table class="tbl out"><caption>Team A: leverage and three kinds of residual</caption>
    <tr><th>Person</th><th>x</th><th>e</th><th>h = 0.2 + (x−3)²/10</th><th>√(1−h)</th><th>standardised r = e/(s√(1−h))</th><th>studentised t</th></tr>
    <tr><td>P1</td><td>1</td><td>0.2</td><td>0.2 + 0.4 = 0.6</td><td>0.632</td><td>0.2 / 0.693 = 0.289</td><td>0.239</td></tr>
    <tr><td>P2</td><td>2</td><td>0.8</td><td>0.2 + 0.1 = 0.3</td><td>0.837</td><td>0.8 / 0.917 = 0.873</td><td>0.825</td></tr>
    <tr><td>P3</td><td>3</td><td>−1.6</td><td>0.2 + 0 = 0.2</td><td>0.894</td><td>−1.6 / 0.980 = −1.633</td><td>−4.000</td></tr>
    <tr><td>P4</td><td>4</td><td>0</td><td>0.3</td><td>0.837</td><td>0</td><td>0</td></tr>
    <tr><td>P5</td><td>5</td><td>0.6</td><td>0.6</td><td>0.632</td><td>0.6 / 0.693 = 0.866</td><td>0.816</td></tr>
  </table>
  <p>(s = √(SSE/(n − p)) = √(3.6/3) = 1.095.) Leverages always add up to p, the number of parameters (here 0.6 + 0.3 + 0.2 + 0.3 + 0.6 = 2), so the average leverage is p/n. The end points P1 and P5 have the most leverage: the line pivots around the centre, so the ends can move it most.</p>
  <ul>
    <li><strong>Raw residual</strong> e: in y's units; not comparable across points (P1's residual is "squeezed" because the line leans toward it).</li>
    <li><strong>Standardised</strong> (internally studentised) r = e / (s√(1 − h)): divides by the residual's own SD, so every r has variance about 1.</li>
    <li><strong>Externally studentised</strong> t = e / (s₍ᵢ₎√(1 − h)), where s₍ᵢ₎ is s re-estimated <em>without</em> row i, so an outlier cannot hide by inflating s. Shortcut: t = r·√((n − p − 1)/(n − p − r²)). For P3: −1.633 × √(2 / (3 − 2.667)) = −1.633 × √6 = <strong>−4.0</strong>. Under the assumptions it follows a t-distribution with n − p − 1 df; |t| &gt; 2 (or 3 in large data) flags an outlier.</li>
  </ul>
  <div class="fx" data-lang="py">import numpy as np
import statsmodels.api as sm
x = np.array([1, 2, 3, 4, 5], dtype=float)          # experience (years) - Team A from Linear Regression
y = np.array([3, 5, 4, 7, 9], dtype=float)          # salary (lakh)
fit = sm.OLS(y, sm.add_constant(x)).fit()
infl = fit.get_influence()
n, p = 5, 2
h = infl.hat_matrix_diag                            # leverage of each row
s = np.sqrt(fit.ssr / (n - p))
print("residual e      :", fit.resid.round(3) + 0.0)
print("leverage h      :", h.round(3), " sum =", round(h.sum(), 3))
print("standardised r  :", (fit.resid / (s * np.sqrt(1 - h))).round(3) + 0.0)
print("statsmodels same:", infl.resid_studentized_internal.round(3) + 0.0)
print("studentised t   :", infl.resid_studentized_external.round(3) + 0.0)
print("Cook's distance :", infl.cooks_distance[0].round(4) + 0.0)</div>
  <div class="fx" data-lang="text">residual e      : [ 0.2  0.8 -1.6  0.   0.6]
leverage h      : [0.6 0.3 0.2 0.3 0.6]  sum = 2.0
standardised r  : [ 0.289  0.873 -1.633  0.     0.866]
statsmodels same: [ 0.289  0.873 -1.633  0.     0.866]
studentised t   : [ 0.239  0.825 -4.     0.     0.816]
Cook's distance : [0.0625 0.1633 0.3333 0.     0.5625]</div>
  <p><code>get_influence()</code> computes all of these at once. The leverages, standardised and studentised residuals match the hand table; Cook's distance (last line) is built from them in section 08.</p>
  <h3>The four classic diagnostic plots</h3>
  <table class="tbl">
    <tr><th>Plot</th><th>x-axis / y-axis</th><th>Healthy looks like</th><th>Detects</th></tr>
    <tr><td>Residuals vs fitted</td><td>ŷ / e</td><td>shapeless band around 0</td><td>non-linearity (curve), unequal variance (fan)</td></tr>
    <tr><td>Normal Q-Q</td><td>normal quantiles / sorted standardised residuals</td><td>points on the 45° line</td><td>skew, heavy tails, outliers</td></tr>
    <tr><td>Scale-location</td><td>ŷ / √|r|</td><td>flat trend</td><td>unequal variance (rising trend)</td></tr>
    <tr><td>Residuals vs leverage</td><td>h / r, with Cook's D contours</td><td>no points in the top/bottom right corners</td><td>influential points</td></tr>
  </table>
  <p>Add a fifth when rows have an order (time, sequence): <strong>residuals vs time</strong>, for independence. And for multiple regression, <strong>residuals vs each feature</strong> shows <em>which</em> feature has the wrong shape.</p>
  <figure class="viz"><svg viewBox="0 0 570 150" width="570">
<line x1="10" y1="75" x2="130" y2="75" stroke="currentColor" stroke-dasharray="3 3"/><line x1="150" y1="75" x2="270" y2="75" stroke="currentColor" stroke-dasharray="3 3"/><line x1="290" y1="75" x2="410" y2="75" stroke="currentColor" stroke-dasharray="3 3"/><line x1="430" y1="75" x2="550" y2="75" stroke="currentColor" stroke-dasharray="3 3"/>
<path d="M114 77h0M101 78h0M71 61h0M50 67h0M105 74h0M19 74h0M108 63h0M70 116h0M119 62h0M68 68h0M87 87h0M114 106h0M75 93h0M42 71h0M17 72h0M20 91h0M98 83h0M121 62h0M12 79h0M79 61h0M104 69h0M125 73h0M65 79h0M81 87h0M21 67h0M56 95h0M60 57h0M41 83h0M73 68h0M80 72h0M25 65h0M120 76h0M16 85h0M13 68h0M128 53h0M94 71h0M39 83h0M46 95h0M25 81h0M122 79h0M57 64h0M74 70h0M75 83h0M122 83h0M57 64h0M51 56h0M44 56h0M30 77h0M98 89h0M84 61h0M88 87h0M12 78h0M73 85h0M117 95h0M13 67h0M54 92h0M116 70h0M117 78h0M81 86h0M122 62h0" class="sb" stroke-width="4" stroke-linecap="round"/>
<path d="M251 83h0M262 49h0M200 98h0M261 49h0M265 51h0M166 59h0M267 50h0M230 85h0M260 60h0M224 94h0M201 109h0M177 70h0M170 75h0M238 84h0M183 80h0M262 50h0M203 93h0M228 92h0M194 100h0M184 93h0M238 85h0M238 77h0M150 42h0M262 54h0M213 100h0M201 93h0M225 97h0M203 97h0M219 96h0M159 54h0M249 77h0M257 66h0M160 50h0M186 90h0M173 76h0M177 81h0M231 81h0M216 100h0M221 95h0M172 66h0M194 87h0M263 57h0M182 79h0M151 45h0M256 66h0M213 101h0M158 46h0M165 58h0M255 56h0M226 87h0M181 79h0M246 72h0M231 76h0M215 98h0M179 79h0M245 86h0M152 45h0M270 35h0M157 50h0M237 95h0" class="sb" stroke-width="4" stroke-linecap="round"/>
<path d="M402 64h0M307 66h0M401 83h0M359 78h0M308 79h0M388 63h0M312 76h0M298 77h0M394 70h0M397 67h0M322 76h0M359 73h0M408 102h0M402 67h0M328 79h0M294 73h0M297 72h0M351 70h0M378 76h0M299 77h0M295 75h0M322 82h0M322 66h0M402 54h0M348 73h0M376 91h0M317 74h0M300 74h0M368 76h0M301 69h0M390 85h0M334 73h0M389 46h0M331 76h0M388 35h0M405 92h0M406 60h0M368 74h0M353 69h0M345 75h0M404 76h0M358 80h0M319 62h0M353 76h0M378 70h0M397 73h0M291 75h0M295 72h0M389 52h0M378 75h0M296 76h0M310 86h0M391 75h0M402 60h0M371 63h0M383 92h0M355 68h0M341 72h0M321 81h0M300 72h0" class="sb" stroke-width="4" stroke-linecap="round"/>
<path d="M430 69h0M432 72h0M434 79h0M436 82h0M438 72h0M440 59h0M442 64h0M444 52h0M446 67h0M448 58h0M450 74h0M452 72h0M454 94h0M456 103h0M458 79h0M460 61h0M462 71h0M464 65h0M466 64h0M469 64h0M470 74h0M472 73h0M475 60h0M476 81h0M478 83h0M481 76h0M482 98h0M485 104h0M487 107h0M488 95h0M491 92h0M493 70h0M495 87h0M497 86h0M499 84h0M501 71h0M503 83h0M505 77h0M507 73h0M509 72h0M511 81h0M513 75h0M515 70h0M517 73h0M519 81h0M521 68h0M523 64h0M525 62h0M527 59h0M529 47h0M531 66h0M534 70h0M536 65h0M537 69h0M540 52h0M542 77h0M543 83h0M546 90h0M548 84h0M550 68h0" class="sb" stroke-width="4" stroke-linecap="round"/>
<text x="70" y="18" text-anchor="middle" class="tg" font-size="13">healthy</text><text x="210" y="18" text-anchor="middle" class="tr" font-size="13">curve</text><text x="350" y="18" text-anchor="middle" class="tr" font-size="13">fan</text><text x="490" y="18" text-anchor="middle" class="tr" font-size="13">snake</text>
<text x="70" y="140" text-anchor="middle" class="tm" font-size="11">random band</text><text x="210" y="140" text-anchor="middle" class="tm" font-size="11">missing x² → §03</text><text x="350" y="140" text-anchor="middle" class="tm" font-size="11">variance grows → §05</text><text x="490" y="140" text-anchor="middle" class="tm" font-size="11">resid vs time → §04</text>
</svg><figcaption>Residuals (y-axis) against fitted values (or time, last panel) from four simulated datasets. Only the first leaves nothing to explain.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Leverage</strong> hᵢ = [X(XᵀX)⁻¹Xᵀ]ᵢᵢ, between 1/n and 1, with Σhᵢ = p. It depends only on X: how far row i's features are from the centre of the data. <strong>Standardised residual</strong> rᵢ = eᵢ/(s√(1 − hᵢ)); <strong>externally studentised</strong> tᵢ uses s₍ᵢ₎ from the fit without row i.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Looking only at raw residuals hides the most dangerous points. A high-leverage point drags the line toward itself, so its raw residual is small (P1 and P5 have the smallest √(1 − h)). Use studentised residuals and leverage together.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We have the tools. Now the assumptions one at a time, starting with the only one that biases the coefficients: is the relationship really a straight line?</div>

  <h2 id="rd-lin"><span class="num">03</span>Linearity</h2>
  <h3>What breaks if it fails</h3>
  <p>If the true average of y is curved in x but we fit a line, the line is the wrong model. It over-predicts in some ranges and under-predicts in others, coefficients describe an "average slope" that holds nowhere, and the errors are not mean-zero at each x (which also invalidates the SEs). Unlike the other assumptions, this one hurts <strong>predictions</strong> too.</p>
  <h3>Detect by hand: a line through a curve</h3>
  <p>x = 1, 2, 3, 4, 5 and y = x² = 1, 4, 9, 16, 25. With the slope formula: x̄ = 3, ȳ = 11, S_xy = (−2)(−10) + (−1)(−7) + 0 + (1)(5) + (2)(14) = 60, S_xx = 10, so w = 6 and b = 11 − 18 = −7.</p>
  <table class="tbl out"><caption>ŷ = −7 + 6x on y = x²</caption>
    <tr><th>x</th><th>y</th><th>ŷ</th><th>e</th><th>sign</th></tr>
    <tr><td>1</td><td>1</td><td>−1</td><td>+2</td><td>+</td></tr>
    <tr><td>2</td><td>4</td><td>5</td><td>−1</td><td>−</td></tr>
    <tr><td>3</td><td>9</td><td>11</td><td>−2</td><td>−</td></tr>
    <tr><td>4</td><td>16</td><td>17</td><td>−1</td><td>−</td></tr>
    <tr><td>5</td><td>25</td><td>23</td><td>+2</td><td>+</td></tr>
  </table>
  <p>SSE = 4 + 1 + 4 + 1 + 4 = 14, SST = 374, R² = 1 − 14/374 = <strong>0.963</strong>. An excellent-looking R². But the residual signs run + − − − +: a smile. Random noise would not line up like that. The plot says "you are missing a curve".</p>
  <h3>Formal test: Ramsey's RESET</h3>
  <p>Idea: if the model is right, powers of the fitted values (ŷ², ŷ³) should add nothing. RESET refits with ŷ² added and F-tests whether its coefficient is 0. A small p-value says "some non-linear function of the predictors is missing".</p>
  <div class="fx" data-lang="py">from statsmodels.stats.diagnostic import linear_reset
xc = np.array([1, 2, 3, 4, 5], dtype=float); yc = xc ** 2          # a curved truth
line = sm.OLS(yc, sm.add_constant(xc)).fit()
print("line:", line.params.round(3), " R2", round(line.rsquared, 3), " residuals", line.resid.round(2))
quad = sm.OLS(yc, sm.add_constant(np.c_[xc, xc ** 2])).fit()
print("with x^2:", quad.params.round(3) + 0.0, " residuals", quad.resid.round(6) + 0.0)
rng = np.random.default_rng(0)
xb = rng.uniform(1, 10, 200); yb = 3 + 0.5 * xb ** 2 + rng.normal(0, 1, 200)   # bigger curved sample
for name, X in [("straight line", sm.add_constant(xb)), ("line + x^2", sm.add_constant(np.c_[xb, xb ** 2]))]:
    f = sm.OLS(yb, X).fit()
    print(f"{name:13s} R2={f.rsquared:.3f}  RESET p={linear_reset(f, power=2, use_f=True).pvalue:.4f}")</div>
  <div class="fx" data-lang="text">line: [-7.  6.]  R2 0.963  residuals [ 2. -1. -2. -1.  2.]
with x^2: [0. 0. 1.]  residuals [0. 0. 0. 0. 0.]
straight line R2=0.954  RESET p=0.0000
line + x^2    R2=0.996  RESET p=0.1532</div>
  <p>The 5-point line has the hand residuals [2, −1, −2, −1, 2]; adding an x² column fits perfectly (weights 0, 0, 1). On 200 noisy points from y = 3 + 0.5x², the straight line still has R² 0.954, but RESET's p-value is 0.0000. With x² added, RESET finds nothing more (p = 0.153).</p>
  <h3>In multiple regression: which feature is curved?</h3>
  <p>A curve in residuals-vs-fitted says something is wrong, not what. Plot residuals against <strong>each feature</strong>, or use a <strong>component-plus-residual (partial residual) plot</strong>: for feature j plot wⱼxⱼ + e against xⱼ. If the cloud bends, xⱼ needs a transform. statsmodels: <code>sm.graphics.plot_ccpr(fit, "x1")</code>.</p>
  <h3>Interactions: a different kind of non-linearity</h3>
  <p>Sometimes each feature is linear but the effect of one depends on another. Rent rises ₹30 per sq ft in Mumbai but ₹12 per sq ft in Pune: a single "size" slope is wrong for both. Signs: residuals vs size fan in opposite directions for different cities; residuals split by group show different trends. Fix: add the product column size × is_Mumbai (formula <code>rent ~ size * C(city)</code>), which lets the slope differ by group.</p>
  <h3>Fixes</h3>
  <table class="tbl">
    <tr><th>Pattern</th><th>Fix</th></tr>
    <tr><td>U-shape / smile in one feature</td><td>add x² (<a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis</a>), or splines</td></tr>
    <tr><td>Rises fast then flattens (diminishing returns)</td><td>log x or √x</td></tr>
    <tr><td>Exponential growth, multiplicative effects</td><td>log y (section 10)</td></tr>
    <tr><td>Slope differs by group</td><td>interaction terms</td></tr>
    <tr><td>Complex, unknown shape</td><td>splines, GAMs, or trees/boosting (<a class="xref" data-note="ml_gbm">Gradient Boosting</a>)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Linearity</strong>: E[y | x] = xᵀw for some w, i.e. the mean of y is exactly a weighted sum of the given columns. Together with exogeneity, E[ε | X] = 0. Violation = <strong>misspecification</strong> of the functional form.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A high R² never proves linearity (0.963 and 0.954 above). And a residual plot of a perfectly linear model with a strongly skewed feature can look "funnelled" just because most points sit on one side; check the shape, not the density.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Even with the right shape, the standard errors assume every row brings fresh, independent information. Data collected over time rarely does.</div>

  <h2 id="rd-ind"><span class="num">04</span>Independence of Errors</h2>
  <h3>What breaks if it fails</h3>
  <p>When errors are positively correlated (today's miss looks like yesterday's), 100 rows carry much less independent information than 100 fresh draws. The SE formula s²(XᵀX)⁻¹ does not know this, so it reports <strong>SEs that are too small</strong>, t-statistics too large and p-values too small: you find "significant" effects that are just drift. Coefficients stay unbiased (as long as no lagged y is a feature).</p>
  <p>Where it happens: time series (sales by day), spatial data (house prices on the same street), grouped data (students in the same school, repeated measurements of the same patient).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Asking 100 people their opinion gives 100 opinions. Asking one person 100 times gives one opinion repeated. Autocorrelated errors are partly "the same person asked again", and the classic formula counts them all as new.</p>
  </div>
  <h3>Detect: Durbin–Watson by hand</h3>
  <p>The Durbin–Watson statistic compares neighbouring residuals in order:</p>
  <p><strong>DW = Σₜ₌₂ (eₜ − eₜ₋₁)² / Σₜ eₜ²</strong></p>
  <p>If neighbours are independent, (eₜ − eₜ₋₁)² is on average 2σ², so DW ≈ 2. If neighbours are similar (positive autocorrelation), the differences are small and DW is near 0. If they alternate in sign, DW approaches 4. A useful approximation for long series: DW ≈ 2(1 − ρ̂), where ρ̂ is the lag-1 correlation of the residuals.</p>
  <p>Six residuals from a weekly sales model, in time order: 1.0, 0.8, 0.5, −0.3, −0.7, −1.3 (above the line for three weeks, then below).</p>
  <table class="tbl out"><caption>Durbin–Watson by hand</caption>
    <tr><th>t</th><th>eₜ</th><th>eₜ²</th><th>eₜ − eₜ₋₁</th><th>(eₜ − eₜ₋₁)²</th></tr>
    <tr><td>1</td><td>1.0</td><td>1.00</td><td>–</td><td>–</td></tr>
    <tr><td>2</td><td>0.8</td><td>0.64</td><td>−0.2</td><td>0.04</td></tr>
    <tr><td>3</td><td>0.5</td><td>0.25</td><td>−0.3</td><td>0.09</td></tr>
    <tr><td>4</td><td>−0.3</td><td>0.09</td><td>−0.8</td><td>0.64</td></tr>
    <tr><td>5</td><td>−0.7</td><td>0.49</td><td>−0.4</td><td>0.16</td></tr>
    <tr><td>6</td><td>−1.3</td><td>1.69</td><td>−0.6</td><td>0.36</td></tr>
    <tr><td colspan="2"><strong>sums</strong></td><td><strong>4.16</strong></td><td></td><td><strong>1.29</strong></td></tr>
  </table>
  <p>DW = 1.29 / 4.16 = <strong>0.31</strong>: strong positive autocorrelation. (Team A's 2.511 in the Linear Regression summary was the opposite case: its residuals 0.2, 0.8, −1.6, 0, 0.6 jump around.)</p>
  <div class="fx" data-lang="py">e = np.array([1.0, 0.8, 0.5, -0.3, -0.7, -1.3])                    # residuals in time order
from statsmodels.stats.stattools import durbin_watson
print("sum of squared differences:", round(((e[1:] - e[:-1]) ** 2).sum(), 2), " sum e^2:", round((e ** 2).sum(), 2))
print("DW =", round(durbin_watson(e), 3))
print("lag-1 autocorrelation:", round((e[1:] * e[:-1]).sum() / (e ** 2).sum(), 3))</div>
  <div class="fx" data-lang="text">sum of squared differences: 1.29  sum e^2: 4.16
DW = 0.31
lag-1 autocorrelation: 0.522</div>
  <p>The lag-1 autocorrelation is 0.522; 2(1 − 0.522) = 0.96 is far from 0.31 because the approximation needs many rows. Use DW's value, not the shortcut, on short series.</p>
  <table class="tbl">
    <tr><th>DW</th><th>Reading</th></tr>
    <tr><td>≈ 2 (about 1.5 to 2.5)</td><td>no first-order autocorrelation</td></tr>
    <tr><td>&lt; 1.5, toward 0</td><td>positive autocorrelation (the common case)</td></tr>
    <tr><td>&gt; 2.5, toward 4</td><td>negative autocorrelation (over-correction, alternating)</td></tr>
  </table>
  <p>DW only sees lag 1 and only makes sense if rows are in a meaningful order. For several lags use the <strong>Breusch–Godfrey</strong> test (<code>acorr_breusch_godfrey</code>) or <strong>Ljung–Box</strong> on residuals, and plot the residual ACF (<a class="xref" data-note="ml_timeseries">Time Series</a>, <a class="xref" data-note="ml_arima">ARIMA</a>).</p>
  <h3>Demo: how often does autocorrelation fake a discovery?</h3>
  <p>Simulate 1,000 datasets of 100 weeks. The feature drifts slowly (AR(1) with ρ = 0.8, like weekly ad spend), the true slope is <strong>0</strong>, and the errors are also AR(1) with ρ = 0.8. A correct 5% test should call the slope "significant" in 5% of datasets. Compare three ways of computing the SE.</p>
  <div class="fx" data-lang="py">def ar1(n, rho, rng):                       # a series where each value keeps rho of the previous one
    z = np.zeros(n); eps = rng.normal(size=n)
    for t in range(1, n):
        z[t] = rho * z[t - 1] + eps[t]
    return z

rng = np.random.default_rng(1)
n_sims, n_obs = 1000, 100
rej_classic = rej_hac = rej_gls = 0
dws = []
for _ in range(n_sims):
    xt = ar1(n_obs, 0.8, rng)               # a slowly drifting feature (e.g. weekly ad spend)
    yt = 5 + 0 * xt + ar1(n_obs, 0.8, rng)  # TRUE slope is 0; errors are autocorrelated
    X = sm.add_constant(xt)
    f = sm.OLS(yt, X).fit()
    fh = sm.OLS(yt, X).fit(cov_type="HAC", cov_kwds={"maxlags": 8})   # Newey-West SEs
    rej_classic += f.pvalues[1] &lt; 0.05
    rej_hac += fh.pvalues[1] &lt; 0.05
    fg = sm.GLSAR(yt, X, rho=1).iterative_fit(maxiter=5)            # model the AR(1) errors
    rej_gls += fg.pvalues[1] &lt; 0.05
    dws.append(durbin_watson(f.resid))
print(f"false 'significant' slopes, classic SE: {rej_classic / n_sims:.1%}")
print(f"false 'significant' slopes, HAC SE    : {rej_hac / n_sims:.1%}")
print(f"false 'significant' slopes, GLSAR     : {rej_gls / n_sims:.1%}")
print(f"typical Durbin-Watson: {np.median(dws):.2f}")</div>
  <div class="fx" data-lang="text">false 'significant' slopes, classic SE: 34.4%
false 'significant' slopes, HAC SE    : 18.5%
false 'significant' slopes, GLSAR     : 5.3%
typical Durbin-Watson: 0.50</div>
  <p>Classic SEs declare a non-existent effect significant in <strong>34.4%</strong> of datasets, seven times the promised 5%. HAC (Newey–West) SEs, which add the covariances between nearby residuals into the sandwich formula, cut it to 18.5%: better, but with strong autocorrelation and 100 rows still not enough. <strong>GLSAR</strong>, which estimates ρ and fits the model to quasi-differenced data yₜ − ρyₜ₋₁ (feasible generalised least squares), restores 5.3%. Typical DW was 0.50, which would have warned us.</p>
  <h3>Fixes</h3>
  <ul>
    <li><strong>Model the dependence</strong>: GLS / GLSAR, regression with ARIMA errors (<code>SARIMAX</code> with exog), or add lagged y / lagged features / trend and seasonal terms.</li>
    <li><strong>Correct the SEs</strong>: HAC (Newey–West) for time order; <strong>cluster-robust</strong> SEs for groups (<code>cov_type="cluster"</code>).</li>
    <li><strong>For prediction</strong>: validate with time-ordered splits, never random K-fold (<a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a>).</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Independence</strong>: Cov(εᵢ, εⱼ) = 0 for i ≠ j. Its failure in ordered data is <strong>autocorrelation</strong> (serial correlation). <strong>HAC</strong> (heteroscedasticity- and autocorrelation-consistent) SEs estimate Var(ŵ) allowing correlated errors up to a chosen lag.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Shuffling the rows before computing DW makes it look perfect (≈ 2) and hides the problem; DW needs the true order. Conversely, a low DW on data with no natural order (sorted by y, say) is meaningless. And a "snake" in residuals over time is often missing trend or seasonality (a linearity problem in time) rather than pure error correlation.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Independent errors can still have different sizes. Big orders take more variable time to pack than small ones. What does unequal spread do to our SEs?</div>

  <h2 id="rd-het"><span class="num">05</span>Equal Variance (Homoscedasticity)</h2>
  <h3>What breaks if it fails</h3>
  <p><strong>Heteroscedasticity</strong> means the spread of the errors changes across rows, usually growing with the size of the prediction (income, prices, counts, times). Coefficients stay unbiased. But (1) the classic SE formula, which uses one pooled s², is wrong, typically too small for the slope; (2) OLS is no longer the most precise estimator (rows with huge noise get as much say as precise rows); (3) prediction intervals are too wide for small ŷ and too narrow for large ŷ.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A weighing machine that is accurate to ±10 g for a mango and ±2 kg for a watermelon. Averaging all readings with equal trust treats the watermelon guesses as if they were as precise as the mango ones.</p>
  </div>
  <h3>Data: packing time vs items in the order</h3>
  <table class="tbl">
    <tr><th>items</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th></tr>
    <tr><td>minutes</td><td>3.2</td><td>3.6</td><td>5.6</td><td>5.2</td><td>8.0</td><td>6.8</td><td>10.4</td><td>8.4</td></tr>
    <tr><td>residual e</td><td>0</td><td>−0.514</td><td>0.571</td><td>−0.743</td><td>1.143</td><td>−0.971</td><td>1.714</td><td>−1.2</td></tr>
    <tr><td>e²</td><td>0</td><td>0.264</td><td>0.327</td><td>0.552</td><td>1.306</td><td>0.944</td><td>2.939</td><td>1.440</td></tr>
  </table>
  <p>OLS gives ŷ = 2.286 + 0.914·items. The residuals alternate in sign but grow in size: |e| goes 0, 0.5, 0.6, 0.7, 1.1, 1.0, 1.7, 1.2.</p>
  <figure class="viz"><svg viewBox="0 0 470 240" width="470">
<line x1="50" y1="120" x2="450" y2="120" stroke="currentColor" stroke-dasharray="4 3"/><line x1="50" y1="20" x2="50" y2="220" stroke="currentColor"/>
<text x="42" y="124" text-anchor="end" class="tm" font-size="11">0</text><text x="42" y="34" text-anchor="end" class="tm" font-size="11">+2</text><text x="42" y="214" text-anchor="end" class="tm" font-size="11">−2</text>
<line x1="50" y1="30" x2="54" y2="30" stroke="currentColor"/><line x1="50" y1="210" x2="54" y2="210" stroke="currentColor"/>
<path d="M71 116 L423 30 M71 124 L423 210" class="sr" stroke-dasharray="5 4" fill="none"/>
<circle cx="71" cy="120" r="5" class="fb sb"/><circle cx="121" cy="143" r="5" class="fb sb"/><circle cx="172" cy="94" r="5" class="fb sb"/><circle cx="222" cy="153" r="5" class="fb sb"/><circle cx="272" cy="69" r="5" class="fb sb"/><circle cx="322" cy="164" r="5" class="fb sb"/><circle cx="373" cy="43" r="5" class="fb sb"/><circle cx="423" cy="174" r="5" class="fb sb"/>
<text x="250" y="236" text-anchor="middle" class="tm" font-size="11.5">fitted packing time ŷ (3.2 → 9.6 minutes)</text><text x="56" y="16" class="tm" font-size="11.5">residual</text>
<text x="300" y="30" class="tr" font-size="11.5">the fan opens as ŷ grows</text>
</svg><figcaption>Residuals vs fitted values for the 8 orders. The spread widens from left to right: a fan, the signature of heteroscedasticity.</figcaption></figure>
  <h3>Detect: Breusch–Pagan by hand</h3>
  <p>Idea: if the variance is constant, the squared residuals should not be predictable from the features. So regress e² on the features and see whether that regression explains anything.</p>
  <ol>
    <li><strong>Auxiliary regression</strong> e² on items. x̄ = 4.5, S_xx = 42, mean(e²) = 7.771/8 = 0.971. S_x,e² = Σ(x − 4.5)(e² − 0.971) = 13.03. Slope = 13.03/42 = 0.310 minutes² per item: squared misses grow with order size.</li>
    <li><strong>R² of the auxiliary regression</strong> = explained / total = (13.03²/42) / Σ(e² − 0.971)² = 4.042 / 6.238 = <strong>0.648</strong>.</li>
    <li><strong>LM statistic</strong> = n × R²_aux = 8 × 0.648 = <strong>5.18</strong>.</li>
    <li>Under constant variance, LM follows a χ² distribution with (number of features) = 1 degree of freedom, whose 5% critical value is 3.84. 5.18 &gt; 3.84, so reject: <strong>p = 0.023</strong>.</li>
  </ol>
  <div class="fx" data-lang="py">from statsmodels.stats.diagnostic import het_breuschpagan, het_white
items = np.arange(1, 9, dtype=float)                               # items in an order
mins  = np.array([3.2, 3.6, 5.6, 5.2, 8.0, 6.8, 10.4, 8.4])        # packing time, minutes
Xh = sm.add_constant(items)
ols_h = sm.OLS(mins, Xh).fit()
e2 = ols_h.resid ** 2
print("fit:", ols_h.params.round(3), " residuals:", ols_h.resid.round(3) + 0.0)
print("e^2:", e2.round(3))
aux = sm.OLS(e2, Xh).fit()                                         # auxiliary regression e^2 ~ items
print(f"aux R2 = {aux.rsquared:.4f}  LM = n*R2 = {8 * aux.rsquared:.3f}")
lm, lm_p, fstat, f_p = het_breuschpagan(ols_h.resid, Xh)
print(f"Breusch-Pagan LM = {lm:.3f}  p = {lm_p:.4f}")
print(f"White test    LM = {het_white(ols_h.resid, Xh)[0]:.3f}  p = {het_white(ols_h.resid, Xh)[1]:.4f}")</div>
  <div class="fx" data-lang="text">fit: [2.286 0.914]  residuals: [ 0.    -0.514  0.571 -0.743  1.143 -0.971  1.714 -1.2  ]
e^2: [0.    0.264 0.327 0.552 1.306 0.944 2.939 1.44 ]
aux R2 = 0.6479  LM = n*R2 = 5.183
Breusch-Pagan LM = 5.183  p = 0.0228
White test    LM = 5.183  p = 0.0749</div>
  <p>statsmodels' <code>het_breuschpagan</code> gives the same 5.183 (its default is Koenker's version, LM = n·R², which does not need normal errors). The <strong>White test</strong> also includes squares and cross-products of the features in the auxiliary regression, so it catches curved variance patterns but spends more degrees of freedom (here 2 df, p = 0.075: with only 8 rows it cannot quite confirm). <strong>Goldfeld–Quandt</strong> (<code>het_goldfeldquandt</code>) compares the residual variance of the low-x and high-x halves.</p>
  <h3>Fix 1: robust (sandwich) standard errors</h3>
  <p>Keep the OLS coefficients, but estimate their variance without assuming one common σ². The general formula is the "sandwich" Var(ŵ) = (XᵀX)⁻¹ [Σ eᵢ² xᵢxᵢᵀ] (XᵀX)⁻¹. With one feature it reduces to</p>
  <p><strong>Var_HC0(slope) = Σ (xᵢ − x̄)² eᵢ² / S_xx²</strong></p>
  <p>Each row contributes its <em>own</em> squared residual instead of the pooled s². By hand: Σ(xᵢ − 4.5)²eᵢ² = 0 + 1.653 + 0.735 + 0.138 + 0.327 + 2.123 + 18.367 + 17.640 = 40.98; divided by 42² = 1764 gives 0.02323; √ = <strong>0.1524</strong>. The classic SE is √(s²/S_xx) = √((7.771/6)/42) = <strong>0.1756</strong>.</p>
  <table class="tbl">
    <tr><th>Version</th><th>Weight on eᵢ²</th><th>Note</th></tr>
    <tr><td>HC0 (White)</td><td>eᵢ²</td><td>original; too small in small samples</td></tr>
    <tr><td>HC1</td><td>eᵢ² · n/(n − p)</td><td>Stata's "robust"</td></tr>
    <tr><td>HC2</td><td>eᵢ² / (1 − hᵢ)</td><td>undoes the leverage squeeze</td></tr>
    <tr><td>HC3</td><td>eᵢ² / (1 − hᵢ)²</td><td>most conservative; recommended for small n</td></tr>
  </table>
  <div class="fx" data-lang="py">d = items - items.mean(); Sxx = d @ d
e = ols_h.resid
hc0 = np.sqrt((d ** 2 * e ** 2).sum() / Sxx ** 2)                 # White's sandwich, by hand
print(f"slope se: classic {ols_h.bse[1]:.4f}   HC0 by hand {hc0:.4f}   statsmodels HC0 {ols_h.get_robustcov_results('HC0').bse[1]:.4f}")
rob = sm.OLS(mins, Xh).fit(cov_type="HC3")
print(f"HC3 se {rob.bse[1]:.4f}   (coefficients unchanged: {rob.params.round(3)})")
wls = sm.WLS(mins, Xh, weights=1 / items ** 2).fit()              # noise SD grows ~ items -&gt; weight 1/items^2
print(f"WLS: coef {wls.params.round(3)}  slope se {wls.bse[1]:.4f}")</div>
  <div class="fx" data-lang="text">slope se: classic 0.1756   HC0 by hand 0.1524   statsmodels HC0 0.1524
HC3 se 0.2316   (coefficients unchanged: [2.286 0.914])
WLS: coef [2.21  0.929]  slope se 0.1243</div>
  <p>The hand HC0 (0.1524) matches statsmodels. HC3 is larger (0.2316) because the two biggest squared residuals sit at the high-leverage ends (items 7 and 8), and HC3 inflates exactly those. Coefficients are unchanged: robust SEs change only the uncertainty.</p>
  <h3>Fix 2: weighted least squares</h3>
  <p>If you know (or can model) how the variance grows, give each row a weight inversely proportional to its error variance: minimise Σ wᵢ eᵢ² with wᵢ = 1/σᵢ². Noisy rows count less. If the SD grows like items, the variance grows like items², so wᵢ = 1/itemsᵢ². WLS gives coefficients 2.21 and 0.929 with a slope SE of 0.124, smaller than any OLS SE, because it uses the precise small orders more. It is the efficient (BLUE) estimator when the weights are right; with wrong weights, combine WLS with robust SEs.</p>
  <h3>Fix 3: transform y</h3>
  <p>When the spread grows in proportion to the level (a 10% typical error), log y turns multiplicative noise into additive, constant-variance noise, and often straightens curves too. Section 10 shows a full example. Box–Cox finds the best power transform (<a class="xref" data-note="ml_features">Feature Engineering</a>).</p>
  <h3>Demo: do the 95% intervals really cover 95%?</h3>
  <p>2,000 simulated datasets of 100 rows, true slope 2, noise SD = 0.3x² (strong fan). For each, build a 95% CI for the slope three ways and count how often it contains the true 2.</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(2)
n_sims, n_obs, true_w = 2000, 100, 2.0
cover = {"classic": 0, "HC3": 0, "WLS": 0}
for _ in range(n_sims):
    xs = rng.uniform(1, 10, n_obs)
    ys = 1 + true_w * xs + rng.normal(0, 0.3 * xs ** 2)        # noise SD grows with x^2
    X = sm.add_constant(xs)
    for name, f in [("classic", sm.OLS(ys, X).fit()), ("HC3", sm.OLS(ys, X).fit(cov_type="HC3")),
                    ("WLS", sm.WLS(ys, X, weights=1 / xs ** 4).fit())]:
        lo, hi = f.conf_int()[1]
        cover[name] += lo &lt;= true_w &lt;= hi
for k, v in cover.items():
    print(f"95% CI actually covers the true slope: {k:7s} {v / n_sims:.1%}")</div>
  <div class="fx" data-lang="text">95% CI actually covers the true slope: classic 88.6%
95% CI actually covers the true slope: HC3     94.3%
95% CI actually covers the true slope: WLS     94.3%</div>
  <p>The classic "95%" interval covers the truth only <strong>88.6%</strong> of the time: it is too narrow. HC3 robust SEs and correctly weighted WLS (weights 1/x⁴ because variance ∝ (x²)²) both get 94.3%, essentially the promised 95%.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Homoscedasticity</strong>: Var(εᵢ | X) = σ² for all i. <strong>Heteroscedasticity</strong>: Var(εᵢ | X) = σᵢ² varies. <strong>Breusch–Pagan</strong>: LM = n·R² from regressing e² on the features, ~ χ²(k) under H₀. <strong>Robust (HC) SEs</strong>: sandwich estimators valid under any heteroscedasticity. <strong>WLS</strong>: minimise Σeᵢ²/σᵢ².</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Heteroscedasticity does not bias OLS coefficients, so "my coefficients are wrong because of heteroscedasticity" is a wrong answer in interviews. What is wrong is the SEs, p-values and intervals. Also: in large samples BP rejects tiny, harmless variance changes; look at the plot and the size of the effect, and when in doubt just report HC3 SEs.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Equal spread is about the size of the errors. Their <em>shape</em> (bell curve or skewed) is the last LINE assumption, and the one that matters least.</div>

  <h2 id="rd-norm"><span class="num">06</span>Normality of Errors</h2>
  <h3>What breaks if it fails</h3>
  <p>The exact t and F distributions behind p-values and CIs assume normal errors. But thanks to the central limit theorem, coefficient estimates are averages of many errors and become nearly normal anyway as n grows, so coefficient inference is robust to non-normal errors in moderate samples. What does <em>not</em> get fixed by large n is the <strong>prediction interval</strong>: it is about one new error, and if that error is skewed, a symmetric ± interval is the wrong shape.</p>
  <h3>Detect: a Q-Q plot by hand</h3>
  <p>A quantile-quantile plot puts each sorted residual next to where it "should" be if residuals were normal. For n points, the expected position of the i-th smallest is the normal quantile at probability (i − 0.5)/n.</p>
  <table class="tbl out"><caption>Team A residuals, Q-Q coordinates (s = 1.095)</caption>
    <tr><th>rank i</th><th>(i − 0.5)/5</th><th>normal quantile z</th><th>sorted residual</th><th>residual / s</th></tr>
    <tr><td>1</td><td>0.1</td><td>−1.282</td><td>−1.6</td><td>−1.461</td></tr>
    <tr><td>2</td><td>0.3</td><td>−0.524</td><td>0</td><td>0</td></tr>
    <tr><td>3</td><td>0.5</td><td>0</td><td>0.2</td><td>0.183</td></tr>
    <tr><td>4</td><td>0.7</td><td>0.524</td><td>0.6</td><td>0.548</td></tr>
    <tr><td>5</td><td>0.9</td><td>1.282</td><td>0.8</td><td>0.730</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 520 250" width="520">
<line x1="60" y1="130" x2="460" y2="130" stroke="currentColor" stroke-opacity="0.4"/><line x1="260" y1="20" x2="260" y2="235" stroke="currentColor" stroke-opacity="0.4"/>
<line x1="84" y1="226" x2="436" y2="34" stroke="currentColor" stroke-dasharray="5 4"/><text x="430" y="28" class="tm" font-size="11">45° line: perfectly normal</text>
<circle cx="119" cy="218" r="5.5" class="fr sr"/><circle cx="202" cy="130" r="5.5" class="fb sb"/><circle cx="260" cy="119" r="5.5" class="fb sb"/><circle cx="318" cy="97" r="5.5" class="fb sb"/><circle cx="401" cy="86" r="5.5" class="fb sb"/>
<text x="128" y="236" class="tr" font-size="11">P3: −1.46 (lower tail too long)</text>
<text x="410" y="104" class="tb" font-size="11">upper tail short</text>
<text x="460" y="146" text-anchor="end" class="tm" font-size="11">normal quantile z</text><text x="266" y="30" class="tm" font-size="11">residual / s</text>
<text x="119" y="146" text-anchor="middle" class="tm" font-size="10.5">−1.28</text><text x="401" y="146" text-anchor="middle" class="tm" font-size="10.5">1.28</text>
</svg><figcaption>Q-Q plot of Team A's 5 residuals. The points bend away from the line at both ends in the same direction (low point too low, high points not high enough): the signature of left skew. With 5 points, though, this is weak evidence.</figcaption></figure>
  <table class="tbl"><caption>Reading Q-Q shapes</caption>
    <tr><th>Shape</th><th>Means</th></tr>
    <tr><td>points on the line</td><td>roughly normal</td></tr>
    <tr><td>S-shape: low end below, high end above the line</td><td>heavy tails (more extreme errors than normal)</td></tr>
    <tr><td>inverted S</td><td>light tails</td></tr>
    <tr><td>curve bending up at both ends (convex)</td><td>right skew (long upper tail)</td></tr>
    <tr><td>curve bending down at both ends (concave)</td><td>left skew</td></tr>
    <tr><td>one or two points far off at an end</td><td>outliers (check section 08)</td></tr>
  </table>
  <div class="fx" data-lang="py">from scipy import stats
r = np.sort(fit.resid)                                  # Team A residuals, sorted
q = stats.norm.ppf((np.arange(1, 6) - 0.5) / 5)         # theoretical normal quantiles
print("sorted residual :", r.round(2) + 0.0)
print("normal quantile :", q.round(3) + 0.0)
print("residual / s    :", (r / s).round(3) + 0.0)
print("Shapiro-Wilk p  :", round(stats.shapiro(fit.resid).pvalue, 3))
print("skew, kurtosis  :", round(stats.skew(fit.resid), 3), round(stats.kurtosis(fit.resid, fisher=False), 3))</div>
  <div class="fx" data-lang="text">sorted residual : [-1.6  0.   0.2  0.6  0.8]
normal quantile : [-1.282 -0.524  0.     0.524  1.282]
residual / s    : [-1.461  0.     0.183  0.548  0.73 ]
Shapiro-Wilk p  : 0.168
skew, kurtosis  : -1.1 2.737</div>
  <p>The hand coordinates match. The formal tests: Shapiro–Wilk p = 0.168, and Jarque–Bera (from skew −1.1 and kurtosis 2.737, JB = (5/6)(1.21 + 0.017) = 1.02, p = 0.60; see the Linear Regression summary). Neither rejects normality, but with 5 points no test could: small samples have almost no power, large samples reject trivial departures. <strong>Read the plot; treat the tests as secondary.</strong></p>
  <h3>Demo: what non-normal errors actually break</h3>
  <p>Errors drawn from a skewed exponential distribution (shifted to mean 0). For n = 10 and n = 200: how often does the 95% slope CI contain the true slope, and how often does a new observation fall below / above its 95% prediction interval (should be 2.5% each)?</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(3)
for n_obs in [10, 200]:
    ci_ok = pi_lo_miss = pi_hi_miss = 0
    for _ in range(2000):
        xs = rng.uniform(0, 10, n_obs)
        err = rng.exponential(2, n_obs) - 2                 # skewed errors, mean 0
        ys = 1 + 2 * xs + err
        f = sm.OLS(ys, sm.add_constant(xs)).fit()
        lo, hi = f.conf_int()[1]; ci_ok += lo &lt;= 2 &lt;= hi
        pr = f.get_prediction(np.array([[1.0, 5.0]])).summary_frame(alpha=0.05)
        y_new = 1 + 2 * 5 + rng.exponential(2) - 2         # one new case at x = 5
        pi_lo_miss += y_new &lt; pr["obs_ci_lower"].iloc[0]
        pi_hi_miss += y_new &gt; pr["obs_ci_upper"].iloc[0]
    print(f"n={n_obs:3d}  slope CI coverage {ci_ok / 2000:.1%}   PI misses: below {pi_lo_miss / 2000:.1%}, above {pi_hi_miss / 2000:.1%}")</div>
  <div class="fx" data-lang="text">n= 10  slope CI coverage 95.0%   PI misses: below 0.1%, above 7.4%
n=200  slope CI coverage 95.0%   PI misses: below 0.0%, above 4.8%</div>
  <p>The slope CI covers 95.0% at both sizes: coefficient inference survived skewed errors. The prediction interval did not: new cases <em>never</em> fall below it (0.0–0.1%) and fall above it 4.8–7.4% of the time. The interval is symmetric, the errors are not, and more data does not fix that.</p>
  <h3>Fixes</h3>
  <ul>
    <li>Transform y (log, Box–Cox) when the skew comes from a multiplicative process.</li>
    <li>Check whether "non-normality" is really one or two outliers (section 08) or a missing feature/curve (sections 03, 09).</li>
    <li>Bootstrap the coefficients for small samples.</li>
    <li>For intervals on single cases: quantile regression (<code>QuantileRegressor</code>, <code>smf.quantreg</code>) or conformal prediction, which do not assume a shape.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Normality assumption</strong>: εᵢ ~ N(0, σ²). Checked with a <strong>Q-Q plot</strong> of sorted standardised residuals against N(0,1) quantiles at (i − 0.5)/n, and with Shapiro–Wilk, Jarque–Bera (JB = (n/6)(S² + (K − 3)²/4)), or Anderson–Darling tests.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Do not log-transform y only to "make residuals normal" when you care about predicting y itself: predictions exp(log-ŷ) estimate the median, not the mean, and need a correction (multiply by about exp(s²/2)). And never test the normality of y or x instead of the residuals.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> The LINE assumptions are about errors. The last assumption is about the features: what happens when two columns tell the same story?</div>

  <h2 id="rd-mc"><span class="num">07</span>Multicollinearity</h2>
  <h3>Perfect vs high</h3>
  <p><strong>Perfect</strong> multicollinearity means one column is an exact linear combination of others: all k city dummies plus an intercept, "total = part A + part B" with all three included, height in cm and in inches. XᵀX is singular and the coefficients are not defined (the dummy trap in <a class="xref" data-note="ml_regression">Linear Regression</a>: rank 3 of 4). Fix: drop the redundant column.</p>
  <p><strong>High</strong> (imperfect) multicollinearity means columns are strongly but not exactly related: two temperature sensors, size and number of rooms. A unique solution exists, but the data cannot tell the columns' effects apart.</p>
  <h3>What breaks</h3>
  <ul>
    <li>Standard errors inflate, so individually "nothing is significant" while the model as a whole fits well (high R², significant F).</li>
    <li>Coefficients become unstable: large, of opposite signs, flipping between samples.</li>
    <li>Interpretation "holding the other fixed" asks about a situation that never occurs in the data.</li>
    <li><strong>Not broken</strong>: R² and predictions (as long as new data have the same correlation pattern).</li>
  </ul>
  <h3>Detect: VIF by hand</h3>
  <p>The <strong>variance inflation factor</strong> of feature j: regress xⱼ on all the <em>other</em> features, take that R²ⱼ, and compute VIFⱼ = 1/(1 − R²ⱼ). It says by how much the variance of ŵⱼ is inflated compared with a feature uncorrelated with the rest; the SE is inflated by √VIF.</p>
  <p>Team B (experience and certifications): with only one other feature, R²ⱼ is the squared correlation. r = S₁₂/√(S₁₁S₂₂) = 6/√(17.5 × 4) = 6/8.367 = 0.717, so R² = 0.514 and <strong>VIF = 1/(1 − 0.514) = 2.06</strong> for both. Their SEs are √2.06 = 1.44 times what they would be if experience and certifications were unrelated.</p>
  <div class="fx" data-lang="py">from statsmodels.stats.outliers_influence import variance_inflation_factor
exp  = np.array([1, 2, 3, 4, 5, 6], dtype=float)                 # Team B from Linear Regression
cert = np.array([0, 1, 0, 2, 1, 2], dtype=float)
r2_aux = sm.OLS(exp, sm.add_constant(cert)).fit().rsquared       # how well cert explains exp
print(f"R2(exp ~ cert) = {r2_aux:.4f}  VIF = 1/(1-R2) = {1 / (1 - r2_aux):.3f}")
XB = sm.add_constant(np.c_[exp, cert])
print("statsmodels VIF:", [round(float(variance_inflation_factor(XB, i)), 3) for i in (1, 2)])</div>
  <div class="fx" data-lang="text">R2(exp ~ cert) = 0.5143  VIF = 1/(1-R2) = 2.059
statsmodels VIF: [2.059, 2.059]</div>
  <table class="tbl">
    <tr><th>VIF</th><th>R² with other features</th><th>SE multiplied by</th><th>Reading</th></tr>
    <tr><td>1</td><td>0</td><td>1</td><td>no collinearity</td></tr>
    <tr><td>2.06</td><td>0.51</td><td>1.44</td><td>mild (Team B)</td></tr>
    <tr><td>5</td><td>0.80</td><td>2.24</td><td>common "look closer" threshold</td></tr>
    <tr><td>10</td><td>0.90</td><td>3.16</td><td>common "serious" threshold</td></tr>
    <tr><td>100</td><td>0.99</td><td>10</td><td>coefficients nearly meaningless</td></tr>
  </table>
  <h3>Demo: two temperature sensors</h3>
  <p>Ice-cream sales truly depend on sensor A (slope 2). A second sensor B is added: unrelated, then a close copy of A, then a near-perfect copy.</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(4)
n_obs = 100
temp_a = rng.normal(30, 4, n_obs)                         # sensor A, deg C
yv = 10 + 2 * temp_a + rng.normal(0, 3, n_obs)            # sales truly depend on A only: slope 2
print("case                 corr(A,B)     VIF   coef A (se)    coef B (se)    R2   cond")
for label, temp_b in [("B unrelated",         rng.normal(30, 4, n_obs)),
                      ("B = A + small noise", temp_a + rng.normal(0, 0.3, n_obs)),
                      ("B = A + tiny noise",  temp_a + rng.normal(0, 0.05, n_obs))]:
    X = sm.add_constant(np.c_[temp_a, temp_b])
    f = sm.OLS(yv, X).fit()
    Z = (X[:, 1:] - X[:, 1:].mean(0)) / X[:, 1:].std(0)  # standardised features for the condition number
    print(f"{label:20s} {np.corrcoef(temp_a, temp_b)[0, 1]:9.4f} {variance_inflation_factor(X, 1):7.1f}"
          f"  {f.params[1]:5.2f} ({f.bse[1]:4.2f})  {f.params[2]:5.2f} ({f.bse[2]:4.2f})"
          f"  {f.rsquared:.3f} {np.linalg.cond(Z):5.0f}")</div>
  <div class="fx" data-lang="text">case                 corr(A,B)     VIF   coef A (se)    coef B (se)    R2   cond
B unrelated             0.0598     1.0   2.14 (0.07)  -0.10 (0.07)  0.903     1
B = A + small noise     0.9973   183.4   2.45 (0.97)  -0.32 (0.97)  0.901    27
B = A + tiny noise      0.9999  6710.0   1.99 (5.88)   0.14 (5.88)  0.901   164</div>
  <p>As B becomes a copy of A, VIF goes 1 → 183 → 6,710 and A's SE goes 0.07 → 0.97 → 5.88: about 0.07 × √183 = 0.95 and 0.07 × √6710 = 5.7, exactly the √VIF rule. The 95% CI for A's effect goes from about ±0.14 to ±11.7, so "is temperature related to sales?" becomes unanswerable from the coefficients. Meanwhile R² stays at 0.90: predictions are fine. The <strong>condition number</strong> of the standardised feature matrix (ratio of largest to smallest singular value) rises 1 → 27 → 164; above about 30 signals trouble.</p>
  <h3>Structural collinearity: centre before x² and interactions</h3>
  <p>x = 1..5 and x² = 1, 4, 9, 16, 25 have correlation 60/√(10 × 374) = 0.981, so VIF = 1/(1 − 0.963) = 26.7. Centre first: x − 3 = −2, −1, 0, 1, 2 and its square 4, 1, 0, 1, 4 have correlation exactly 0, VIF = 1. Same model, same predictions, stable separate coefficients. The same trick applies to x₁·x₂ interaction columns.</p>
  <h3>Fixes</h3>
  <table class="tbl">
    <tr><th>Fix</th><th>When</th></tr>
    <tr><td>Drop one of the twins</td><td>they measure the same thing (two sensors)</td></tr>
    <tr><td>Combine into one (average, ratio, index)</td><td>several noisy measures of one concept</td></tr>
    <tr><td>Centre before polynomial / interaction terms</td><td>structural collinearity</td></tr>
    <tr><td>Ridge regression</td><td>you want to keep all features and stabilise (<a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a>)</td></tr>
    <tr><td>PCA / PLS</td><td>many correlated features (<a class="xref" data-note="ml_pca">PCA</a>)</td></tr>
    <tr><td>More data, or data where they vary separately</td><td>inference on each effect is the goal</td></tr>
    <tr><td>Do nothing</td><td>you only need predictions, and the correlation will persist</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>VIFⱼ = 1 / (1 − R²ⱼ)</strong>, where R²ⱼ comes from regressing xⱼ on all other features (with intercept). Var(ŵⱼ) = σ² · VIFⱼ / Σ(xᵢⱼ − x̄ⱼ)². <strong>Condition number</strong> κ(X) = σ_max/σ_min of the (standardised) design matrix.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Pairwise correlations can all be modest while VIF is huge, because a feature can be explained by a <em>combination</em> of several others (x₄ ≈ x₁ + x₂ − x₃). Always compute VIF, not just the correlation matrix. And don't compute VIF for the intercept or read it off dummies of a rare category; use the generalised VIF for groups of dummies.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> So far every problem was spread over all rows. Sometimes one single row decides the whole fit.</div>

  <h2 id="rd-infl"><span class="num">08</span>Outliers, Leverage &amp; Influence</h2>
  <h3>Three different things</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Plain meaning</th><th>Measured by</th></tr>
    <tr><td><strong>Outlier</strong></td><td>y is far from what the model predicts</td><td>studentised residual |tᵢ| &gt; 2 or 3</td></tr>
    <tr><td><strong>High leverage</strong></td><td>x is far from the other x's</td><td>hᵢ &gt; 2p/n (or 3p/n)</td></tr>
    <tr><td><strong>Influential</strong></td><td>removing the row changes the fit a lot</td><td>Cook's D, DFFITS, DFBETAS</td></tr>
  </table>
  <p>Influence needs both: <strong>influence ≈ outlyingness × leverage</strong>. An outlier in the middle of the x-range shifts the line up a little; a high-leverage point that sits on the line changes nothing; a high-leverage point <em>off</em> the line can rotate the whole line.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A see-saw. A child sitting near the pivot (low leverage) barely moves it, however much they bounce (outlier). An adult sitting quietly at the very end in balance (leverage, no outlier) changes nothing. An adult at the end who jumps (both) flips it.</p>
  </div>
  <h3>Cook's distance by hand</h3>
  <p>Cook's distance measures how much <em>all</em> fitted values move when row i is deleted, scaled by p·s². It has a closed form in quantities we already have:</p>
  <p><strong>Dᵢ = (rᵢ² / p) · hᵢ / (1 − hᵢ)</strong>: (how much of an outlier)² × (how much leverage).</p>
  <table class="tbl out"><caption>Team A (p = 2)</caption>
    <tr><th>Person</th><th>r</th><th>r²/2</th><th>h</th><th>h/(1 − h)</th><th>Cook's D</th></tr>
    <tr><td>P1</td><td>0.289</td><td>0.0417</td><td>0.6</td><td>1.5</td><td>0.0625</td></tr>
    <tr><td>P2</td><td>0.873</td><td>0.381</td><td>0.3</td><td>0.429</td><td>0.163</td></tr>
    <tr><td>P3</td><td>−1.633</td><td>1.333</td><td>0.2</td><td>0.25</td><td>0.333</td></tr>
    <tr><td>P4</td><td>0</td><td>0</td><td>0.3</td><td>0.429</td><td>0</td></tr>
    <tr><td>P5</td><td>0.866</td><td>0.375</td><td>0.6</td><td>1.5</td><td><strong>0.5625</strong></td></tr>
  </table>
  <p>P3 has the biggest residual, but P5 is the most influential: a moderate residual at a high-leverage position. These match the "Cook's distance" line printed in section 02. Rules of thumb: Dᵢ &gt; 4/n deserves a look, Dᵢ &gt; 1 is very influential. With n = 5, 4/n = 0.8; nobody qualifies.</p>
  <h3>Demo: add one more person, three ways</h3>
  <p>Add a sixth employee to Team A in three different ways and see what happens to the line (base slope 1.4, intercept 1.4).</p>
  <ul>
    <li><strong>A</strong>: x = 3, y = 12 (a 3-year employee paid like a senior): outlier, low leverage.</li>
    <li><strong>B</strong>: x = 12, y = 18.2 (exactly on the line, far out): high leverage, not an outlier.</li>
    <li><strong>C</strong>: x = 12, y = 6 (a 12-year veteran on a junior salary): high leverage and off the line.</li>
  </ul>
  <p>Leverage of the new point at x = 12 by hand: the new x̄ = (15 + 12)/6 = 4.5; S_xx = 3.5² + 2.5² + 1.5² + 0.5² + 0.5² + 7.5² = 12.25 + 6.25 + 2.25 + 0.25 + 0.25 + 56.25 = 77.5; h = 1/6 + 56.25/77.5 = 0.167 + 0.726 = <strong>0.892</strong>. Nearly the maximum of 1: this one point controls its own prediction almost entirely.</p>
  <figure class="viz"><svg viewBox="0 0 500 260" width="500">
<line x1="50" y1="230" x2="480" y2="230" stroke="currentColor"/><line x1="50" y1="20" x2="50" y2="230" stroke="currentColor"/>
<text x="82" y="246" text-anchor="middle" class="tm" font-size="11">1</text><text x="210" y="246" text-anchor="middle" class="tm" font-size="11">5</text><text x="434" y="246" text-anchor="middle" class="tm" font-size="11">12</text>
<text x="42" y="234" text-anchor="end" class="tm" font-size="11">0</text><text x="42" y="129" text-anchor="end" class="tm" font-size="11">10</text><text x="42" y="44" text-anchor="end" class="tm" font-size="11">18</text>
<line x1="50" y1="215" x2="466" y2="24" class="sb" stroke-width="2"/><text x="300" y="80" class="tb" font-size="11">base line (and case B): slope 1.40</text>
<line x1="50" y1="181" x2="466" y2="151" class="sr" stroke-width="2" stroke-dasharray="6 4"/><text x="300" y="140" class="tr" font-size="11">case C line: slope 0.22</text>
<circle cx="82" cy="198" r="5" class="ft st"/><circle cx="114" cy="178" r="5" class="ft st"/><circle cx="146" cy="188" r="5" class="ft st"/><circle cx="178" cy="156" r="5" class="ft st"/><circle cx="210" cy="136" r="5" class="ft st"/>
<circle cx="146" cy="104" r="6" class="fg sg"/><text x="156" y="100" class="tg" font-size="11.5">A: outlier, low leverage</text>
<circle cx="434" cy="39" r="6" class="fb sb"/><text x="426" y="58" text-anchor="end" class="tb" font-size="11.5">B: leverage 0.89, on the line</text>
<circle cx="434" cy="167" r="6" class="fr sr"/><text x="426" y="190" text-anchor="end" class="tr" font-size="11.5">C: leverage 0.89 + off the line → D = 13.6</text>
<text x="265" y="258" text-anchor="middle" class="tm" font-size="11">experience (years)</text>
</svg><figcaption>One extra point, three outcomes. A lifts the line slightly (intercept 1.4 → 2.47, slope unchanged); B changes nothing; C rotates the line from slope 1.40 to 0.22.</figcaption></figure>
  <div class="fx" data-lang="py">cases = {"A: y-outlier at x=3":        (3, 12.0),
         "B: far x, on the line":      (12, 18.2),
         "C: far x, off the line":     (12, 6.0)}
print("base fit (5 people): slope 1.400, intercept 1.400")
for name, (xn, yn) in cases.items():
    xa, ya = np.append(x, xn), np.append(y, yn)
    f6 = sm.OLS(ya, sm.add_constant(xa)).fit()
    inf6 = f6.get_influence()
    print(f"{name:24s} slope {f6.params[1]:6.3f}  intercept {f6.params[0]:6.3f} | new point: "
          f"h={inf6.hat_matrix_diag[-1]:.3f}  t={inf6.resid_studentized_external[-1]:6.2f}  "
          f"Cook's D={inf6.cooks_distance[0][-1]:.3f}")</div>
  <div class="fx" data-lang="text">base fit (5 people): slope 1.400, intercept 1.400
A: y-outlier at x=3      slope  1.400  intercept  2.467 | new point: h=0.167  t=  5.33  Cook's D=0.362
B: far x, on the line    slope  1.400  intercept  1.400 | new point: h=0.892  t=  0.00  Cook's D=0.000
C: far x, off the line   slope  0.219  intercept  4.680 | new point: h=0.892  t= -3.65  Cook's D=13.552</div>
  <p>Case A has a huge studentised residual (5.33) but modest leverage: it only lifts the intercept (to 2.467), Cook's D 0.36. Case B has leverage 0.892 but residual 0: nothing changes, D = 0. Case C combines leverage 0.892 with a large residual: the slope collapses from 1.40 to 0.22 and Cook's D is <strong>13.6</strong>, far above every threshold. One person rewrote the salary policy.</p>
  <div class="fx" data-lang="py">xa, ya = np.append(x, 12), np.append(y, 6.0)               # case C again
fC = sm.OLS(ya, sm.add_constant(xa)).fit()
sf = fC.get_influence().summary_frame()
print(sf[["hat_diag", "student_resid", "cooks_d", "dffits", "dfb_x1"]].round(3).to_string())
print("rules of thumb: h &gt; 2p/n =", round(2 * 2 / 6, 3), "| |t| &gt; 2 | Cook's D &gt; 4/n =", round(4 / 6, 3),
      "| |DFFITS| &gt; 2*sqrt(p/n) =", round(2 * np.sqrt(2 / 6), 3))</div>
  <div class="fx" data-lang="text">   hat_diag  student_resid  cooks_d  dffits  dfb_x1
0     0.325         -1.060    0.262  -0.735   0.513
1     0.247         -0.053    0.001  -0.031   0.017
2     0.196         -0.620    0.055  -0.306   0.118
3     0.170          0.663    0.052   0.300  -0.041
4     0.170          2.302    0.261   1.042   0.144
5     0.892         -3.652   13.552 -10.521  -9.488
rules of thumb: h &gt; 2p/n = 0.667 | |t| &gt; 2 | Cook's D &gt; 4/n = 0.667 | |DFFITS| &gt; 2*sqrt(p/n) = 1.155</div>
  <p>The full influence table for case C. Row 5 (the new point) breaks every rule: leverage 0.892 &gt; 0.667, |studentised residual| 3.65 &gt; 2, Cook's D 13.55 &gt; 0.667, |DFFITS| 10.5 &gt; 1.155. <strong>DFFITS</strong> is the change in the row's own fitted value when it is deleted, in SE units; <strong>DFBETAS</strong> (<code>dfb_x1</code>) is the change in the slope, in SE units: deleting row 5 would move the slope by 9.5 standard errors. Notice also row 4 (x = 5): its studentised residual is 2.30 only because point C dragged the line away from it. Influential points distort the diagnostics of <em>other</em> points too.</p>
  <h3>What to do with an influential point</h3>
  <ol>
    <li><strong>Check the data</strong>: a typo (12 years instead of 1.2), unit error, or a different population (a contractor paid differently)? Fix or exclude with a documented reason.</li>
    <li><strong>Check the model</strong>: maybe the point is telling the truth and the line is wrong (salary flattens after 10 years: a curve, section 03).</li>
    <li><strong>Report both fits</strong> (with and without) if it is genuine and you cannot decide.</li>
    <li><strong>Use robust regression</strong>, understanding what each method protects against (below).</li>
  </ol>
  <div class="fx" data-lang="py">from sklearn.linear_model import HuberRegressor, RANSACRegressor, LinearRegression
Xa = xa.reshape(-1, 1)
print("OLS    slope", round(LinearRegression().fit(Xa, ya).coef_[0], 3))
print("Huber  slope", round(HuberRegressor(epsilon=1.35).fit(Xa, ya).coef_[0], 3))
ran = RANSACRegressor(random_state=0, residual_threshold=2.0).fit(Xa, ya)
print("RANSAC slope", round(ran.estimator_.coef_[0], 3), " inliers:", ran.inlier_mask_.astype(int))
rlm = sm.RLM(ya, sm.add_constant(xa), M=sm.robust.norms.HuberT()).fit()
print("statsmodels RLM (Huber) slope", round(rlm.params[1], 3), " weights:", rlm.weights.round(2))</div>
  <div class="fx" data-lang="text">OLS    slope 0.219
Huber  slope 0.209
RANSAC slope 1.4  inliers: [1 1 1 1 1 0]
statsmodels RLM (Huber) slope 0.216  weights: [1.   1.   1.   1.   0.84 1.  ]</div>
  <p>A surprise worth remembering: <strong>Huber regression does not help here</strong> (slope 0.209, statsmodels RLM 0.216). Huber down-weights rows with large residuals, but a high-leverage point pulls the line so close to itself that its residual is not large: RLM's weights show the new point keeping full weight 1.0, while innocent row 4 is down-weighted to 0.84. Huber protects against outliers in y, not against leverage. <strong>RANSAC</strong> fits lines to random subsets and keeps the one most points agree with; it ignores point C entirely (inlier mask 0) and recovers slope 1.4. Other high-breakdown options: Theil–Sen (<code>TheilSenRegressor</code>), least trimmed squares.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Cook's distance</strong> Dᵢ = Σⱼ(ŷⱼ − ŷⱼ₍ᵢ₎)² / (p·s²) = (rᵢ²/p)·hᵢ/(1 − hᵢ). <strong>DFFITSᵢ</strong> = tᵢ√(hᵢ/(1 − hᵢ)). <strong>DFBETASᵢⱼ</strong> = (ŵⱼ − ŵⱼ₍ᵢ₎)/se₍ᵢ₎(ŵⱼ). Common cut-offs: h &gt; 2p/n, |t| &gt; 2, D &gt; 4/n (or 1), |DFFITS| &gt; 2√(p/n), |DFBETAS| &gt; 2/√n.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>(1) Deleting every point with a big residual until the fit looks clean is data manipulation; your SEs will be too small and the model will fail on real data. (2) Two influential points close together can mask each other: deleting either one alone changes little (low Cook's D for each), deleting both changes everything. (3) "Use a robust regressor" is not one fix: Huber handles y-outliers, not leverage.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Every check so far looks at residuals or X. The most damaging failure in practice leaves both looking perfectly healthy: an important variable that is not in the data at all.</div>

  <h2 id="rd-endo"><span class="num">09</span>Endogeneity &amp; Omitted-Variable Bias (Brief)</h2>
  <h3>The idea</h3>
  <p>OLS needs the features to be uncorrelated with the error term: E[ε | X] = 0 (<strong>exogeneity</strong>). When a feature is correlated with ε it is <strong>endogenous</strong>, and its coefficient is biased, and the bias does <em>not</em> shrink with more data. The three classic causes:</p>
  <table class="tbl">
    <tr><th>Cause</th><th>Example</th><th>Effect on the coefficient</th></tr>
    <tr><td><strong>Omitted variable</strong></td><td>wage ~ education, ability left out (able people study longer and earn more)</td><td>education gets credit for ability</td></tr>
    <tr><td><strong>Measurement error in x</strong></td><td>education self-reported with errors</td><td>shrunk toward 0 (attenuation)</td></tr>
    <tr><td><strong>Reverse causality / simultaneity</strong></td><td>police numbers ~ crime (more crime brings more police)</td><td>any direction, often wrong sign</td></tr>
  </table>
  <h3>The omitted-variable formula, by hand</h3>
  <p>True model y = β₀ + β₁x₁ + β₂x₂ + ε. If we leave x₂ out and regress y on x₁ only, the slope we get on average is</p>
  <p><strong>β₁ (short) = β₁ + β₂ · δ</strong>, where δ is the slope from regressing x₂ on x₁.</p>
  <p>Team B from Linear Regression: β₁ = 1.0 (experience), β₂ = 2.0 (certifications), δ = S₁₂/S₁₁ = 6/17.5 = 0.343. Short slope = 1.0 + 2.0 × 0.343 = <strong>1.686</strong>, exactly what experience-alone gave. The bias (+0.686) has the sign of β₂ × δ:</p>
  <table class="tbl">
    <tr><th></th><th>δ &gt; 0 (x₂ rises with x₁)</th><th>δ &lt; 0</th></tr>
    <tr><td>β₂ &gt; 0</td><td>upward bias</td><td>downward bias</td></tr>
    <tr><td>β₂ &lt; 0</td><td>downward bias</td><td>upward bias</td></tr>
  </table>
  <div class="fx" data-lang="py">rng = np.random.default_rng(5)
n_obs = 5000
ability = rng.normal(0, 1, n_obs)                          # unobserved "ability"
educ = 12 + 2 * ability + rng.normal(0, 2, n_obs)          # able people study longer
wage = 5 + 1.0 * educ + 3.0 * ability + rng.normal(0, 2, n_obs)   # TRUE effect of a year of education: 1.0
full = sm.OLS(wage, sm.add_constant(np.c_[educ, ability])).fit()
short = sm.OLS(wage, sm.add_constant(educ)).fit()
delta = sm.OLS(ability, sm.add_constant(educ)).fit().params[1]    # slope of ability on educ
print(f"with ability   : educ coef {full.params[1]:.3f}")
print(f"ability omitted: educ coef {short.params[1]:.3f}  (se {short.bse[1]:.3f}, looks very precise)")
print(f"OVB formula    : 1.0 + 3.0 * delta = 1.0 + 3.0 * {delta:.3f} = {1 + 3 * delta:.3f}")
educ_noisy = educ + rng.normal(0, 2, n_obs)                # education recorded with error (SD 2)
noisy = sm.OLS(wage, sm.add_constant(np.c_[educ_noisy, ability])).fit()
v = sm.OLS(educ, sm.add_constant(ability)).fit().resid.var()       # educ's own variation, given ability
lam = v / (v + (educ_noisy - educ).var())                          # reliability ratio
print(f"educ measured with error: coef {noisy.params[1]:.3f}   predicted 1.0 * {lam:.3f} = {lam:.3f}")</div>
  <div class="fx" data-lang="text">with ability   : educ coef 0.997
ability omitted: educ coef 1.744  (se 0.015, looks very precise)
OVB formula    : 1.0 + 3.0 * delta = 1.0 + 3.0 * 0.250 = 1.750
educ measured with error: coef 0.499   predicted 1.0 * 0.496 = 0.496</div>
  <p>With ability included, education's coefficient is 0.997 (truth 1.0). Without it, 1.744, and with a tiny SE of 0.015 it looks very precise: <strong>precisely wrong</strong>. The formula predicts 1.0 + 3.0 × 0.250 = 1.750. No residual plot of the short model would show anything odd. When education is recorded with noise (SD 2), its coefficient shrinks to 0.499, as predicted by the reliability ratio λ = Var(true x | other features)/(that + Var(noise)) = 0.496: <strong>attenuation bias</strong>.</p>
  <h3>Fixes (each is a field of its own)</h3>
  <ul>
    <li><strong>Measure and include the confounder</strong> (or a good proxy).</li>
    <li><strong>Fixed effects</strong> with panel data: compare each person with themselves over time, removing everything constant about them.</li>
    <li><strong>Instrumental variables (2SLS)</strong>: find z that moves x but affects y only through x (distance to the nearest college for education). Stage 1: predict x from z; stage 2: regress y on the predicted x.</li>
    <li><strong>Randomised experiments</strong>: randomly assign x, which makes it independent of everything (<a class="xref" data-note="st_abtesting">A/B Testing</a>).</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Endogeneity</strong>: Cov(xⱼ, ε) ≠ 0 for some feature, which makes OLS biased and inconsistent. <strong>Omitted-variable bias</strong> = β₂·δ, nonzero when the omitted variable both affects y (β₂ ≠ 0) and is correlated with the included feature (δ ≠ 0).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>For pure prediction, omitted variables are "only" lost accuracy: the short model still predicts well as long as the relationship between x₁ and x₂ stays the same. The danger is reading the coefficient as an effect you can act on: "send everyone for one more year of education and wages will rise 1.74" is wrong by 74%. Also, adding more controls is not always safer: controlling for a variable caused by x (a mediator or a collider) creates bias.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We have studied each problem alone. Real data has several at once, and fixing one can fix others.</div>

  <h2 id="rd-flow"><span class="num">10</span>A Full Diagnostic Workflow</h2>
  <p>A delivery app models delivery minutes from distance (km) and number of items, for 400 orders. In the simulated truth, time grows multiplicatively (each km adds about 12%) with noise of about ±25%, which is how waiting and traffic delays usually behave. We fit the obvious linear model, run every check, apply one fix, and re-check. The helper <code>diagnose</code> returns one number per check.</p>
  <div class="fx" data-lang="py">import pandas as pd
from statsmodels.stats.stattools import jarque_bera

def diagnose(f, X):
    """One line per check: the numbers behind the four classic plots, plus VIF and Cook's D."""
    infl = f.get_influence()
    return {"R2": round(f.rsquared, 3),
            "RESET p": round(float(linear_reset(f, power=2, use_f=True).pvalue), 4),
            "BP p": round(het_breuschpagan(f.resid, X)[1], 4),
            "JB p": round(jarque_bera(f.resid)[1], 4),
            "DW": round(durbin_watson(f.resid), 2),
            "max VIF": round(max(variance_inflation_factor(X, i) for i in range(1, X.shape[1])), 2),
            "max Cook": round(infl.cooks_distance[0].max(), 3)}

rng = np.random.default_rng(6)
n_obs = 400
dist = rng.uniform(0.5, 12, n_obs)                     # km
items = rng.integers(1, 15, n_obs)                     # items in the order
minutes = np.exp(2.3 + 0.12 * dist + 0.03 * items + rng.normal(0, 0.25, n_obs))   # multiplicative noise
Xd = sm.add_constant(np.c_[dist, items])
raw = sm.OLS(minutes, Xd).fit()
logm = sm.OLS(np.log(minutes), Xd).fit()
print(pd.DataFrame({"minutes ~ dist + items": diagnose(raw, Xd),
                    "log(minutes) ~ dist + items": diagnose(logm, Xd)}).T.to_string())
print("log model coefs:", logm.params.round(4), " -&gt; +1 km multiplies time by", round(np.exp(logm.params[1]), 3))</div>
  <div class="fx" data-lang="text">                                R2  RESET p    BP p    JB p    DW  max VIF  max Cook
minutes ~ dist + items       0.702   0.0000  0.0000  0.0041  2.02      1.0     0.042
log(minutes) ~ dist + items  0.752   0.2349  0.5565  0.1149  2.03      1.0     0.026
log model coefs: [2.3179 0.1176 0.0289]  -&gt; +1 km multiplies time by 1.125</div>
  <p>Reading the first row (raw minutes): <strong>RESET p = 0.0000</strong> (the shape is curved: time grows faster than linearly in distance), <strong>BP p = 0.0000</strong> (the spread grows with the prediction), <strong>JB p = 0.004</strong> (right-skewed residuals), DW 2.02 (orders are independent; fine), max VIF 1.0 (distance and items unrelated; fine), max Cook's D 0.042 (no single order dominates; 4/n = 0.01 flags several mildly, none dramatically). Three failures with one common cause: the process is multiplicative.</p>
  <p>The fix: model log(minutes). Second row: RESET p 0.235, BP p 0.557, JB p 0.115: all three problems disappear at once. The coefficients read as percentages: e^0.1176 = 1.125, so <strong>each extra km adds about 12.5% to delivery time</strong> (truth 12.7%), and each item about 2.9%.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>R² of 0.702 vs 0.752 is not a fair comparison: the two models predict different things (minutes vs log-minutes). To compare, transform the log model's predictions back to minutes (with the smearing correction) and compute RMSE on held-out data in minutes (<a class="xref" data-note="ml_reg_metrics">Regression Metrics</a>).</p>
  </div>
  <h3>A checklist to keep</h3>
  <ol>
    <li>Plot y against each feature before fitting; think about the process (additive? multiplicative? grouped? ordered in time?).</li>
    <li>Fit; plot residuals vs fitted and vs each feature: curve → transform / add terms; fan → log y, WLS or HC3.</li>
    <li>If rows are ordered or grouped: residuals vs time, DW / Breusch–Godfrey; use HAC, cluster-robust SEs or model the dependence.</li>
    <li>Q-Q plot: skew or heavy tails → transform, robust or quantile methods; matters most for prediction intervals.</li>
    <li>VIF: above 5–10 → drop, combine, centre, or ridge (if coefficients matter).</li>
    <li>Leverage, studentised residuals, Cook's D: investigate flagged rows; report with and without.</li>
    <li>Ask what is <em>not</em> in the data that drives both a feature and y (omitted variables).</li>
    <li>After any fix, re-run every check; fixes interact.</li>
  </ol>

  <h2 id="rd-table"><span class="num">11</span>Tests &amp; Fixes at a Glance</h2>
  <table class="tbl"><caption>Every assumption: break, detect, fix</caption>
    <tr><th>Assumption</th><th>Breaks</th><th>Plot</th><th>Test (statsmodels)</th><th>Fixes</th></tr>
    <tr><td>Linearity</td><td>coefficients, predictions</td><td>resid vs fitted / feature, CCPR</td><td>RESET (<code>linear_reset</code>), Harvey–Collier</td><td>x², splines, log, interactions, trees</td></tr>
    <tr><td>Independence</td><td>SEs (too small)</td><td>resid vs time, ACF</td><td>Durbin–Watson, Breusch–Godfrey, Ljung–Box</td><td>HAC / cluster SEs, GLSAR, ARIMA errors, lags</td></tr>
    <tr><td>Equal variance</td><td>SEs, PIs, efficiency</td><td>resid vs fitted (fan), scale-location</td><td>Breusch–Pagan, White, Goldfeld–Quandt</td><td>HC3 SEs, WLS, log y</td></tr>
    <tr><td>Normality</td><td>small-n tests, PIs</td><td>Q-Q</td><td>Shapiro–Wilk, Jarque–Bera, Omnibus</td><td>transform, bootstrap, quantile regression</td></tr>
    <tr><td>No multicollinearity</td><td>SEs, stability (not predictions)</td><td>correlation heatmap</td><td>VIF, condition number</td><td>drop/combine, centre, ridge, PCA</td></tr>
    <tr><td>No dominant points</td><td>everything</td><td>resid vs leverage</td><td>Cook's D, DFFITS, DFBETAS</td><td>check data, robust (RANSAC, Theil–Sen), report both</td></tr>
    <tr><td>Exogeneity</td><td>coefficients (causal reading)</td><td>none</td><td>Hausman (with an instrument)</td><td>add confounders, fixed effects, IV, experiments</td></tr>
  </table>
  <table class="tbl"><caption>Robust standard errors vs WLS vs transforming y</caption>
    <tr><th></th><th>Robust (HC/HAC) SEs</th><th>WLS / GLS</th><th>Transform y</th></tr>
    <tr><td>Changes coefficients?</td><td>no</td><td>yes</td><td>yes (new scale)</td></tr>
    <tr><td>Needs a model of the variance?</td><td>no</td><td>yes</td><td>implicitly</td></tr>
    <tr><td>Efficiency</td><td>OLS (not best)</td><td>best if weights right</td><td>good if the process is multiplicative</td></tr>
    <tr><td>Fixes prediction intervals?</td><td>no</td><td>yes (with right weights)</td><td>yes</td></tr>
    <tr><td>Interpretation</td><td>unchanged</td><td>unchanged</td><td>percentages / elasticities</td></tr>
  </table>
  <table class="tbl"><caption>This note vs its siblings</caption>
    <tr><th>Note</th><th>Role</th><th>Hand-off</th></tr>
    <tr><td><a class="xref" data-note="ml_regression">Linear Regression</a></td><td>fit the model, compute SEs</td><td>gives this note the residuals and the hat matrix</td></tr>
    <tr><td>Assumptions &amp; Diagnostics</td><td>decide whether the fit and its SEs can be trusted</td><td>points to the right fix</td></tr>
    <tr><td><a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis</a></td><td>fix non-linearity</td><td>re-check here after adding terms (centre them: VIF)</td></tr>
    <tr><td><a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a></td><td>fix unstable weights from collinearity</td><td>trades a little bias for stability; classic p-values no longer apply</td></tr>
  </table>

  <h2 id="rd-traps"><span class="num">12</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: "heteroscedasticity biases the coefficients"</span>
    <p>It does not. It breaks SEs, p-values, intervals and efficiency. Only non-linearity and endogeneity bias the coefficients.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: testing normality of y or x</span>
    <p>The assumption is about the errors. Check the residuals' Q-Q plot.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: trusting tests over plots</span>
    <p>With 5 rows no test can reject; with 100,000 rows every test rejects trivial departures. Plots show the size and kind of the problem.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: deleting outliers to improve the fit</span>
    <p>Investigate first; delete only with a documented reason (data error, different population). Otherwise use robust methods or report both fits.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: assuming Huber regression handles leverage</span>
    <p>Case C: Huber slope 0.21, same as OLS. High-leverage points have small residuals by construction. Use RANSAC, Theil–Sen, or fix the data.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: dropping a "non-significant" collinear feature as useless</span>
    <p>With VIF 6,710 the sensor coefficients were insignificant while the model explained 90% of the variance. Test the pair jointly (F-test) or combine them.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: random K-fold on time-ordered data</span>
    <p>Autocorrelated rows leak information between folds; validation scores look much better than reality. Use time-based splits.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: comparing R² across different targets</span>
    <p>R² for y and for log y measure different things (0.702 vs 0.752 above). Compare on one scale, on held-out data.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: "the residuals look fine, so the coefficient is causal"</span>
    <p>Omitted-variable bias leaves residuals looking perfect (education 1.74 vs truth 1.0). Causal claims need design, not diagnostics.</p>
  </div>

  <h2 id="rd-qa"><span class="num">13</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>List the linear regression assumptions and say which ones bias the coefficients.</summary><div class="qa-body">Linearity (with exogeneity E[ε|X] = 0), independence of errors, equal error variance, normality of errors, no perfect multicollinearity. Only failures of linearity/exogeneity bias the coefficients. Dependence and heteroscedasticity break SEs and efficiency; non-normality affects small-sample tests and prediction intervals; perfect collinearity makes the solution non-unique, high collinearity inflates SEs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is leverage? Compute it for x = 1, 2, 3, 4, 5.</summary><div class="qa-body">Leverage hᵢ is the i-th diagonal of the hat matrix: how much yᵢ influences its own fitted value, determined only by how unusual xᵢ is. With one feature hᵢ = 1/n + (xᵢ − x̄)²/S_xx = 0.2 + (x − 3)²/10 → 0.6, 0.3, 0.2, 0.3, 0.6. They sum to p = 2; the average is p/n; flag h &gt; 2p/n.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why standardise or studentise residuals instead of using raw ones?</summary><div class="qa-body">Var(eᵢ) = σ²(1 − hᵢ), so high-leverage points have artificially small raw residuals. Standardised rᵢ = eᵢ/(s√(1 − hᵢ)) puts all residuals on a common scale; externally studentised residuals also re-estimate s without row i so an outlier cannot hide by inflating s (Team A's P3: −1.63 standardised, −4.0 studentised).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute Durbin–Watson for residuals 1.0, 0.8, 0.5, −0.3, −0.7, −1.3 and interpret.</summary><div class="qa-body">Squared successive differences: 0.04 + 0.09 + 0.64 + 0.16 + 0.36 = 1.29. Σe² = 4.16. DW = 0.31, far below 2: strong positive autocorrelation. Classic SEs will be too small; use HAC SEs or model the AR structure (GLSAR / ARIMA errors).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through the Breusch–Pagan test.</summary><div class="qa-body">Fit OLS, square the residuals, regress e² on the features, take that R², compute LM = n·R², compare with χ² with k df. Packing data: R² = 0.648, LM = 8 × 0.648 = 5.18 &gt; 3.84, p = 0.023: heteroscedastic. White's test adds squares and cross-products to the auxiliary regression.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Heteroscedasticity found. What are your options and how do they differ?</summary><div class="qa-body">(1) Robust HC SEs (HC3 for small n): same coefficients, valid inference, no variance model needed. (2) WLS with weights 1/σᵢ²: more efficient and better intervals if the variance model is right. (3) Transform y (log) when the noise is multiplicative; changes interpretation to percentages. In the coverage simulation classic CIs covered 88.6%, HC3 and WLS 94.3%.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you read a Q-Q plot, and how much does non-normality matter?</summary><div class="qa-body">Sorted standardised residuals vs normal quantiles at (i − 0.5)/n. On the line = normal; S-shape = heavy tails; bowed = skew; isolated end points = outliers. Coefficient CIs are robust to non-normal errors in moderate samples (95.0% coverage even at n = 10 in the skewed simulation), but prediction intervals are not: they missed only on one side.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Define VIF and compute it for two features with correlation 0.717.</summary><div class="qa-body">VIFⱼ = 1/(1 − R²ⱼ), R²ⱼ from regressing xⱼ on the other features. With two features R² = r² = 0.514, VIF = 2.06 and SEs are inflated by √2.06 = 1.44. Concern above 5–10. Predictions and R² are unaffected; individual coefficients become unstable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Outlier vs high leverage vs influential?</summary><div class="qa-body">Outlier: unusual y given x (large studentised residual). High leverage: unusual x (large hᵢ). Influential: deleting it changes the fit, which needs both. A far-out point on the line (case B) has leverage 0.89 but Cook's D 0; a far-out point off the line (case C) has D 13.6 and turned the slope from 1.40 to 0.22.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Give the formula for Cook's distance and compute it for r = 0.866, h = 0.6, p = 2.</summary><div class="qa-body">Dᵢ = (rᵢ²/p)·hᵢ/(1 − hᵢ) = (0.75/2) × (0.6/0.4) = 0.375 × 1.5 = 0.5625. It measures how far all fitted values move when row i is deleted, scaled by p·s². Look at points with D &gt; 4/n; D &gt; 1 is very influential.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why didn't Huber regression fix the high-leverage point?</summary><div class="qa-body">Huber down-weights rows by the size of their residual. A high-leverage point pulls the fitted line toward itself, so its own residual stays moderate and it keeps full weight (RLM weight 1.0), while other rows look worse. Leverage needs high-breakdown methods (RANSAC recovered slope 1.4, Theil–Sen, LTS) or a data fix.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the direction of omitted-variable bias.</summary><div class="qa-body">If y = β₀ + β₁x₁ + β₂x₂ + ε and x₂ is omitted, E[β̂₁,short] = β₁ + β₂δ with δ the slope of x₂ on x₁. The sign of the bias is sign(β₂)·sign(δ). Wage example: β₂ = 3 (ability raises wages), δ = 0.25 (able people study longer) → education's slope 1.75 instead of 1.0. More data does not shrink it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: which sibling note do you go to for each failed check?</summary><div class="qa-body">Curved residuals / RESET → Polynomial &amp; Basis Functions (x², splines, interactions). High VIF with coefficients you need to be stable → Ridge, Lasso &amp; Elastic Net. Autocorrelated residuals → Time Series and ARIMA (and time-based CV from the splits note). How big the remaining error is → Regression Metrics.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: where in the statsmodels summary from Linear Regression do these diagnostics appear?</summary><div class="qa-body">Durbin–Watson (2.511 for Team A), Omnibus and Jarque–Bera with Prob, Skew and Kurtosis (normality), Cond. No. (collinearity; a warning is printed when large), and Covariance Type (nonrobust vs HC0–HC3/HAC for heteroscedasticity or autocorrelation). Leverage and Cook's D come from <code>get_influence()</code>; BP, White, RESET from <code>statsmodels.stats.diagnostic</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You only care about prediction accuracy. Which diagnostics still matter?</summary><div class="qa-body">Linearity (wrong shape = worse predictions; check residual plots and compare with a flexible model), influential points (one bad row can tilt everything), and stability over time (autocorrelation and drift; validate with time-ordered splits). Heteroscedasticity and normality matter only if you report prediction intervals; multicollinearity barely matters unless the correlation pattern changes in new data.</div></details>
</main>
`
});
