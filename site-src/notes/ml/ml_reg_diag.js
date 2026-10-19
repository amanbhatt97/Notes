// notes/ml/ml_reg_diag.js — Assumptions & Diagnostics
Object.assign(TOPIC_CONTENT, {
  "ml_reg_diag": `<main>
  <h1>Assumptions &amp; Diagnostics</h1>
  <div class="where"><span>Machine Learning</span><span>Regression</span><span>Assumptions &amp; Diagnostics</span></div>
  <p class="lead">Least squares always returns a line, even when a line is the wrong model, and it always prints standard errors and p-values, even when they are badly wrong. This note covers the five classic assumptions behind linear regression (linearity, independence, equal variance, normal errors, no perfect multicollinearity). For each one it explains what breaks when it fails, how to detect the failure (residual plots, Q-Q plots, Breusch–Pagan, Durbin–Watson and VIF, each computed by hand) and how to fix it (transforms, robust standard errors, weighted least squares, interactions). It then covers unusual points (leverage and Cook's distance by hand), outliers, robust regression, and the one problem no residual plot can show: omitted-variable bias and endogeneity. Every check is run on the same six houses as the rest of the Regression group, whose fitted line price = −16 + 7·size left the residuals +2, 0, −1, −2, −3, +4.</p>

  <h2 id="rd-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_regression">Linear Regression</a></b><span>We fitted price = −16 + 7·size to six houses by least squares and read a statsmodels summary: slope 7, standard error 0.348, p = 0.00004, 95% CI [6.03, 7.97], and a prediction interval of [66, 84] lakh for a 1,300 sq ft flat. Every one of those uncertainty numbers was derived <em>assuming</em> something about the errors. The open question: how do we know those assumptions hold, and what do we do when they don't?</span></li>
    <li><b>This note adds: a check, a test and a fix for every assumption</b><span>Residuals and leverage as the raw material; residual-vs-fitted, scale-location and Q-Q plots; RESET, Durbin–Watson, Breusch–Pagan, Jarque–Bera and VIF; robust (HC) and HAC standard errors, WLS, transforms; leverage, studentised residuals and Cook's distance; omitted-variable bias.</span></li>
    <li><b>Leads to: the fixes that need their own notes</b><span>A curved residual plot (ours) sends you to <a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a>. A large VIF (size and rooms: 16) sends you to <a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a>. Autocorrelated residuals send you to <a class="xref" data-note="ml_timeseries">Time Series</a> and <a class="xref" data-note="ml_arima">ARIMA</a>. Judging any model's error size is <a class="xref" data-note="ml_reg_metrics">Regression Metrics</a>.</span></li>
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
  <h3>The Regression group as one ladder</h3>
  <table class="tbl">
    <tr><th>Step</th><th>Note</th><th>On the six houses</th><th>Leaves open</th></tr>
    <tr><td>1</td><td><a class="xref" data-note="ml_regression">Linear Regression</a></td><td>price = −16 + 7·size, R² 0.990, slope CI [6.03, 7.97]</td><td>are the SEs and intervals trustworthy?</td></tr>
    <tr><td>2</td><td><strong>Assumptions &amp; Diagnostics</strong> (this)</td><td>residual smile (adding size² cuts SSE 34 → 9.9), VIF 16 for size and rooms, house F has Cook's D 2.17</td><td>how do we fit the curve?</td></tr>
    <tr><td>3</td><td><a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a></td><td>price = 58.7 + 7·(size − 11) + 0.2·(size − 11)²</td><td>more, correlated columns → unstable weights</td></tr>
    <tr><td>4</td><td><a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a></td><td>ridge shares weight between size and rooms; lasso drops rooms</td><td>choosing the penalty by CV</td></tr>
  </table>
  <p>You should know the slope formula, the normal equation, the hat matrix H = X(XᵀX)⁻¹Xᵀ and how standard errors come from s²(XᵀX)⁻¹ (all in <a class="xref" data-note="ml_regression">Linear Regression</a>). The data, recalled: houses A–F with size 6, 8, 10, 12, 14, 16 (hundreds of sq ft), bedrooms 1, 2, 2, 3, 3, 4 and price 28, 40, 53, 66, 79, 100 lakh, sold in that order, one a month.</p>

  <h2 id="rd-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each check answers the question above it; what it cannot see raises the next question. All numbers are for the six houses unless marked "at scale".</p>
  <ol class="story">
    <li><b>The assumptions</b><span>Q: when can we trust slope 7 ± 0.97? → When errors are linear-in-mean, independent, equal-spread, normal, and no column is redundant. Only linearity (and exogeneity) bias the slope; the others break its uncertainty. But the true errors are invisible…</span></li>
    <li><b>Residuals &amp; leverage</b><span>Q: what do we inspect instead? → Residuals, but Var(eᵢ) = σ²(1 − hᵢ): the end houses A and F have leverage 0.524, so we standardise: r_F = 1.99, studentised t_F = 15.9. Are the residuals patterned?</span></li>
    <li><b>Linearity</b><span>Q: is a straight line the right shape? → Signs + 0 − − − + make a smile; adding size² cuts SSE from 34 to 9.9 (F = 7.3, p = 0.07 with only six houses; RESET p = 0.0000 at scale). Do neighbouring errors move together?</span></li>
    <li><b>Independence</b><span>Q: does one sale's miss predict the next one's? → Durbin–Watson = 56/34 = 1.65, near 2: no. (At scale, ignoring real autocorrelation gave 34% false discoveries.) Do all errors have the same spread?</span></li>
    <li><b>Equal variance</b><span>Q: is the spread constant? → Breusch–Pagan LM = 6 × 0.653 = 3.92, p = 0.048, but p = 0.43 once size² is in: the "fan" was the curve. If it were real: HC3 SE 0.70 instead of 0.35. Are the errors bell-shaped?</span></li>
    <li><b>Normality</b><span>Q: do errors follow a normal curve? → Q-Q points near the line, Shapiro p = 0.82; it matters mostly for prediction intervals. The errors pass; what about the columns?</span></li>
    <li><b>Multicollinearity</b><span>Q: can the data separate size from bedrooms? → r = 0.968, VIF = 16: se(size) 0.35 → 1.54, rooms p = 0.63, yet the pair is jointly significant (p = 0.0009). Is any single house steering the fit?</span></li>
    <li><b>Outliers, leverage, influence</b><span>Q: does one row control the line? → F: Cook's D 2.17. A huge flat sold cheap (G) gets D 12.8 and turns the slope from 7 to 3.8; Huber does not fix it, RANSAC does. Can something invisible bias even a clean-looking fit?</span></li>
    <li><b>Endogeneity &amp; omitted variables</b><span>Q: what if a missing column drives both x and y? → size alone 7.0 = 6.21 + 2.92 × 0.271 when rooms is omitted; at scale education's 1.74 vs the true 1.0, invisible in residuals. How do we run all checks together?</span></li>
    <li><b>The workflow</b><span>Q: in what order, and do fixes interact? → For the houses one fix (size²) clears RESET, BP and DW together; for delivery times one fix (log y) clears three failures. Next: how to fit that curve properly → <a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a>.</span></li>
  </ol>

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
          <li>Houses: h = 0.524, 0.295, 0.181, 0.181, 0.295, 0.524 (sum = p = 2)</li>
          <li>Standardised rᵢ = eᵢ / (s√(1 − hᵢ)): F = 1.99</li>
          <li>Studentised (leave-one-out s): F = 15.9</li>
          <li>Plots: resid vs fitted · scale-location · Q-Q · resid vs leverage</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Linearity &amp; independence</div>
        <ul>
          <li>Smile in resid-vs-size: +2, 0, −1, −2, −3, +4</li>
          <li>Add size²: SSE 34 → 9.89; F = 7.31, p 0.074 (= RESET)</li>
          <li>At scale: RESET p 0.0000 → add x² → p 0.153</li>
          <li><b>DW</b> = Σ(eₜ − eₜ₋₁)² / Σe² = 56/34 = 1.65 (≈ 2 good)</li>
          <li>AR(1) sim: false positives 34% (classic) · 18% (HAC) · 5% (GLSAR)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Equal variance &amp; normality</div>
        <ul>
          <li><b>BP</b>: regress e² on X, LM = n·R² = 6 × 0.653 = 3.92, p 0.048</li>
          <li>After size²: p 0.43 → the "fan" was the curve</li>
          <li>Fixes: log y · WLS (w = 1/variance) · <b>HC3</b> robust SEs (0.35 → 0.70)</li>
          <li>Coverage sim: classic 88.6% vs HC3 94.3%</li>
          <li><b>Q-Q</b>: sorted residuals vs normal quantiles; Shapiro p 0.82</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Multicollinearity</div>
        <ul>
          <li><b>VIF</b>ⱼ = 1/(1 − Rⱼ²); size vs rooms 1/(1 − 0.938) = 16.0</li>
          <li>SE grows ~√VIF: size 0.35 → 1.54; R² and predictions do not change</li>
          <li>Sensors (at scale): VIF 1 → 183 → 6710; se 0.07 → 0.97 → 5.88</li>
          <li>size vs size²: VIF 57.7 raw → 1.0 centred</li>
          <li>Fix: drop/combine, centre, PCA, ridge</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Influence &amp; endogeneity</div>
        <ul>
          <li><b>Cook's D</b> = (r²/p)·h/(1 − h); F: 1.976 × 1.1 = 2.17</li>
          <li>Outlier ≠ leverage ≠ influence (needs both)</li>
          <li>G (3,000 sq ft, 120 lakh): h 0.84, D 12.8, slope 7 → 3.8</li>
          <li>Huber does not fix leverage (3.75); RANSAC does (7.0)</li>
          <li><b>OVB</b>: short slope = β₁ + β₂δ (6.21 + 2.92 × 0.271 = 7.0)</li>
          <li>⚠ No residual plot can reveal OVB</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="rd-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="rd-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Diagnose?</span><span class="rm-sub">What each assumption buys</span></div></div>
      <div class="rm-item rm-done" data-target="rd-resid"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Residuals &amp; Leverage</span><span class="rm-sub">The raw material, by hand</span></div></div>
      <div class="rm-item rm-done" data-target="rd-lin"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Linearity</span><span class="rm-sub">The smile, F-test, RESET</span></div></div>
      <div class="rm-item rm-done" data-target="rd-ind"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Independence</span><span class="rm-sub">Durbin–Watson, HAC, GLS</span></div></div>
      <div class="rm-item rm-done" data-target="rd-het"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Equal Variance</span><span class="rm-sub">Breusch–Pagan, robust SE, WLS</span></div></div>
      <div class="rm-item rm-done" data-target="rd-norm"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Normality of Errors</span><span class="rm-sub">Q-Q by hand, when it matters</span></div></div>
      <div class="rm-item rm-done" data-target="rd-mc"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Multicollinearity</span><span class="rm-sub">VIF by hand, condition number</span></div></div>
      <div class="rm-item rm-done" data-target="rd-infl"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Outliers, Leverage &amp; Influence</span><span class="rm-sub">Cook's distance by hand</span></div></div>
      <div class="rm-item rm-done" data-target="rd-endo"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Endogeneity &amp; Omitted Variables</span><span class="rm-sub">The invisible bias</span></div></div>
      <div class="rm-item rm-done" data-target="rd-flow"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">A Full Diagnostic Workflow</span><span class="rm-sub">Diagnose, fix, re-check</span></div></div>
      <div class="rm-item rm-done" data-target="rd-connect"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">Every check grows from e and h</span></div></div>
      <div class="rm-item rm-done" data-target="rd-table"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Tests &amp; Fixes at a Glance</span><span class="rm-sub">Comparison tables</span></div></div>
      <div class="rm-item rm-done" data-target="rd-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Traps in interviews and code</span></div></div>
      <div class="rm-item rm-done" data-target="rd-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="rd-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="rd-why"><span class="num">01</span>Why Diagnose?</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Linear Regression ended with confident numbers for the six houses: slope 7, p = 0.00004, CI [6.03, 7.97], PI [66, 84]. All of them came from formulas that assumed things about the errors. Which assumptions, and which numbers break when each one fails?</p>
  </div>
  <h3>The need</h3>
  <p>The dealer will set asking prices from your output: "each extra 100 sq ft adds 7 lakh, 95% CI [6.03, 7.97]". But that interval was computed by a formula that assumed the errors are independent, equally spread and normal around a correct straight line. If prices bend upward for big flats (wrong shape), or the market was rising month by month (not independent), the true uncertainty could be much larger and the line could be systematically wrong for the biggest flats. Nothing in the output warns you. <strong>Diagnostics are how you find out.</strong></p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A fitted model is a photo of a patient: R² = 0.990 says "looks healthy". Diagnostics are the X-ray and blood test. Most of the time they confirm the photo; sometimes they show a fracture you could never see from outside.</p>
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
    <tr><td>Inference ("does size matter? by how much?")</td><td>all of them: SEs, p-values and CIs depend on each</td><td>–</td></tr>
    <tr><td>Prediction intervals for single cases (the family's flat)</td><td>equal variance and normality (the interval's width and shape)</td><td>multicollinearity</td></tr>
    <tr><td>Causal claims ("adding a bedroom will raise the price")</td><td>exogeneity above all (section 09)</td><td>–</td></tr>
  </table>
  <h3>The workflow</h3>
  <div class="flow"><span>Fit OLS</span><span>Residuals vs fitted (linearity, variance)</span><span>Q-Q plot (normality)</span><span>Residuals vs order/time (independence)</span><span>VIF (collinearity)</span><span>Leverage &amp; Cook's D (influence)</span><span>Fix, refit, re-check</span></div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Regression diagnostics</strong> are checks on the residuals eᵢ = yᵢ − ŷᵢ and on the design matrix X that test whether the assumptions behind OLS inference hold, and whether individual rows control the fit. They use plots (for the shape of a problem) and formal tests (for a yes/no decision).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"The assumption is that X (or y) is normally distributed." No: the normality assumption is about the <em>errors</em> (in practice, the residuals). A skewed feature like income is fine as a feature; a skewed target is often fine too, if the residuals are well-behaved.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Residuals &amp; leverage.</b> Every check is made on residuals, because the true errors are invisible. Before using them we need one subtle fact: residuals are not all equally variable, even when the true errors are.</div>

  <h2 id="rd-resid"><span class="num">02</span>Residuals &amp; Leverage: the Raw Material</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We cannot see the errors ε, only the residuals +2, 0, −1, −2, −3, +4. Can we compare these six numbers directly, or does the line treat some houses differently from others?</p>
  </div>
  <h3>Residuals are not the errors</h3>
  <p>The true errors εᵢ are invisible; residuals are our estimates of them. Because the line is fitted to the same points, it bends toward each point, and it bends toward points with unusual x the most. In matrix terms e = (I − H)y, and if the errors all have variance σ², then <strong>Var(eᵢ) = σ²(1 − hᵢᵢ)</strong>, where hᵢᵢ (written hᵢ) is the i-th diagonal of the hat matrix: the point's <strong>leverage</strong>.</p>
  <h3>Leverage by hand</h3>
  <p>With one feature, hᵢ = 1/n + (xᵢ − x̄)²/S_xx. For the houses: n = 6, x̄ = 11, S_xx = 70, and s = √(SSE/(n − p)) = √(34/4) = 2.916.</p>
  <table class="tbl out"><caption>Six houses: leverage and three kinds of residual</caption>
    <tr><th>House</th><th>x</th><th>e</th><th>h = 1/6 + (x−11)²/70</th><th>√(1−h)</th><th>standardised r = e/(s√(1−h))</th><th>studentised t</th></tr>
    <tr><td>A</td><td>6</td><td>2</td><td>0.167 + 0.357 = 0.524</td><td>0.690</td><td>2 / 2.012 = 0.994</td><td>0.992</td></tr>
    <tr><td>B</td><td>8</td><td>0</td><td>0.167 + 0.129 = 0.295</td><td>0.840</td><td>0</td><td>0</td></tr>
    <tr><td>C</td><td>10</td><td>−1</td><td>0.167 + 0.014 = 0.181</td><td>0.905</td><td>−1 / 2.638 = −0.379</td><td>−0.334</td></tr>
    <tr><td>D</td><td>12</td><td>−2</td><td>0.181</td><td>0.905</td><td>−2 / 2.638 = −0.758</td><td>−0.709</td></tr>
    <tr><td>E</td><td>14</td><td>−3</td><td>0.295</td><td>0.840</td><td>−3 / 2.448 = −1.226</td><td>−1.343</td></tr>
    <tr><td>F</td><td>16</td><td>4</td><td>0.524</td><td>0.690</td><td>4 / 2.012 = 1.988</td><td><strong>15.875</strong></td></tr>
  </table>
  <p>Leverages always add up to p, the number of parameters (here 2 × (0.524 + 0.295 + 0.181) = 2), so the average leverage is p/n = 0.333. The end houses A and F have the most leverage: the line pivots around the centre, so the ends can move it most.</p>
  <ul>
    <li><strong>Raw residual</strong> e: in y's units; not comparable across points (F's residual is "squeezed" because the line leans toward it).</li>
    <li><strong>Standardised</strong> (internally studentised) r = e / (s√(1 − h)): divides by the residual's own SD, so every r has variance about 1. F's raw +4 becomes 1.99.</li>
    <li><strong>Externally studentised</strong> t = e / (s₍ᵢ₎√(1 − h)), where s₍ᵢ₎ is s re-estimated <em>without</em> row i, so an outlier cannot hide by inflating s. Shortcut: t = r·√((n − p − 1)/(n − p − r²)). For F: 1.988 × √(3 / (4 − 3.952)) = 1.988 × √62.5 ≈ <strong>15.9</strong> (the shortcut is very sensitive to rounding here; the exact value is 15.875). Why so huge? Without F, houses A–E lie almost exactly on a line (price = −10.8 + 6.4·size, residuals 0.4, −0.4, −0.2, 0, 0.2, s₍F₎ = 0.37), and that line predicts 91.6 for F, which sold for 100. Under the assumptions t follows a t-distribution with n − p − 1 df; |t| &gt; 2 (or 3 in large data) flags an outlier.</li>
  </ul>
  <div class="fx" data-lang="py">import numpy as np
import statsmodels.api as sm
x = np.array([6, 8, 10, 12, 14, 16], dtype=float)        # size, hundreds of sq ft (houses A-F)
y = np.array([28, 40, 53, 66, 79, 100], dtype=float)     # price, lakh rupees
fit = sm.OLS(y, sm.add_constant(x)).fit()                # price = -16 + 7 * size
infl = fit.get_influence()
n, p = 6, 2
h = infl.hat_matrix_diag                                 # leverage of each house
s = np.sqrt(fit.ssr / (n - p))
print("coefficients    :", fit.params.round(3))
print("residual e      :", fit.resid.round(3) + 0.0)
print("leverage h      :", h.round(4), " sum =", round(h.sum(), 3))
print("standardised r  :", (fit.resid / (s * np.sqrt(1 - h))).round(3) + 0.0)
print("statsmodels same:", infl.resid_studentized_internal.round(3) + 0.0)
print("studentised t   :", infl.resid_studentized_external.round(3) + 0.0)
print("Cook's distance :", infl.cooks_distance[0].round(4) + 0.0)</div>
  <div class="fx" data-lang="text">coefficients    : [-16.   7.]
residual e      : [ 2.  0. -1. -2. -3.  4.]
leverage h      : [0.5238 0.2952 0.181  0.181  0.2952 0.5238]  sum = 2.0
standardised r  : [ 0.994  0.    -0.379 -0.758 -1.226  1.988]
statsmodels same: [ 0.994  0.    -0.379 -0.758 -1.226  1.988]
studentised t   : [ 0.992  0.    -0.334 -0.709 -1.343 15.875]
Cook's distance : [0.5435 0.     0.0159 0.0635 0.3147 2.1741]</div>
  <p><code>get_influence()</code> computes all of these at once. The leverages, standardised and studentised residuals match the hand table; Cook's distance (last line) is built from them in section 08, and F's 2.17 is already a warning.</p>
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
</svg><figcaption>Residuals (y-axis) against fitted values (or time, last panel) from four simulated datasets of a few hundred rows (the same idea at scale). Only the first leaves nothing to explain. Six houses are too few to look like any of these clearly; section 03 plots them.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Leverage</strong> hᵢ = [X(XᵀX)⁻¹Xᵀ]ᵢᵢ, between 1/n and 1, with Σhᵢ = p. It depends only on X: how far row i's features are from the centre of the data. <strong>Standardised residual</strong> rᵢ = eᵢ/(s√(1 − hᵢ)); <strong>externally studentised</strong> tᵢ uses s₍ᵢ₎ from the fit without row i.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Looking only at raw residuals hides the most dangerous points. A high-leverage point drags the line toward itself, so its raw residual is small relative to its importance (A and F have the smallest √(1 − h)). F's raw +4 looks like a normal miss; its studentised 15.9 says it is not. Use studentised residuals and leverage together.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Linearity.</b> We have the tools. Now the assumptions one at a time, starting with the only one that biases the coefficients: is the relationship really a straight line?</div>

  <h2 id="rd-lin"><span class="num">03</span>Linearity</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We can now read residuals fairly. The first and most important question: do they form a random band, or a shape? A shape would mean the straight line itself is wrong, which biases the slope and every prediction.</p>
  </div>
  <h3>What breaks if it fails</h3>
  <p>If the true average of y is curved in x but we fit a line, the line is the wrong model. It over-predicts in some ranges and under-predicts in others, coefficients describe an "average slope" that holds nowhere, and the errors are not mean-zero at each x (which also invalidates the SEs). Unlike the other assumptions, this one hurts <strong>predictions</strong> too.</p>
  <h3>Detect by hand: the houses' residual smile</h3>
  <p>Plot the six residuals against size, in order: <strong>+2, 0, −1, −2, −3, +4</strong>. Positive at both ends, negative in the middle: a smile. Random noise would not line up like that. The line under-prices the smallest and the largest flats and over-prices the middle ones, which is what happens when the true price curve bends upward (each extra 100 sq ft adds a bit more than the last).</p>
  <figure class="viz"><svg viewBox="0 0 520 250" width="520">
<line x1="60" y1="130" x2="500" y2="130" stroke="currentColor" stroke-dasharray="4 3"/><line x1="60" y1="30" x2="60" y2="225" stroke="currentColor"/>
<text x="52" y="54" text-anchor="end" class="tm" font-size="11">+4</text><text x="52" y="94" text-anchor="end" class="tm" font-size="11">+2</text><text x="52" y="134" text-anchor="end" class="tm" font-size="11">0</text><text x="52" y="174" text-anchor="end" class="tm" font-size="11">−2</text><text x="52" y="214" text-anchor="end" class="tm" font-size="11">−4</text>
<text x="123" y="242" text-anchor="middle" class="tm" font-size="11">6</text><text x="186" y="242" text-anchor="middle" class="tm" font-size="11">8</text><text x="249" y="242" text-anchor="middle" class="tm" font-size="11">10</text><text x="311" y="242" text-anchor="middle" class="tm" font-size="11">12</text><text x="374" y="242" text-anchor="middle" class="tm" font-size="11">14</text><text x="437" y="242" text-anchor="middle" class="tm" font-size="11">16</text>
<text x="66" y="22" class="tm" font-size="11.5">residual (lakh) against size (hundreds of sq ft)</text>
<polyline points="107,55 123,76 139,96 154,113 170,128 186,141 201,152 217,161 233,168 249,173 264,176 280,177 296,176 311,173 327,168 343,161 359,152 374,141 390,128 406,113 421,96 437,76 453,55" fill="none" class="sr" stroke-width="1.5" stroke-dasharray="5 4"/>
<circle cx="123" cy="90" r="6" class="fr sr"/><circle cx="186" cy="130" r="6" class="fr sr"/><circle cx="249" cy="150" r="6" class="fr sr"/><circle cx="311" cy="170" r="6" class="fr sr"/><circle cx="374" cy="190" r="6" class="fr sr"/><circle cx="437" cy="50" r="6" class="fr sr"/>
<circle cx="123" cy="144" r="5" class="fb sb"/><circle cx="186" cy="119" r="5" class="fb sb"/><circle cx="249" cy="107" r="5" class="fb sb"/><circle cx="311" cy="127" r="5" class="fb sb"/><circle cx="374" cy="179" r="5" class="fb sb"/><circle cx="437" cy="104" r="5" class="fb sb"/>
<text x="133" y="86" class="tr" font-size="11">A +2</text><text x="384" y="200" class="tr" font-size="11">E −3</text><text x="447" y="48" class="tr" font-size="11">F +4</text>
<text x="150" y="40" class="tr" font-size="11.5">red: straight line (SSE 34), a smile</text><text x="150" y="56" class="tb" font-size="11.5">blue: with size² (SSE 9.9), no pattern</text>
</svg><figcaption>Residuals of the six houses. Red: from price = −16 + 7·size, with a dashed curve through them showing the smile. Blue: from the model with a size² column added, scattered around 0 without a shape.</figcaption></figure>
  <p>The cure the next note develops is to give the line a squared column. With centred size z = size − 11 and columns 1, z, z², the residuals become −0.68, 0.54, 1.14, 0.14, −2.46, 1.32 (no pattern) and SSE drops from 34 to 9.89. Is that drop more than luck? The <strong>extra-sum-of-squares F-test</strong> compares the two nested models:</p>
  <p>F = [(SSE_line − SSE_quad) / 1] / [SSE_quad / (n − 3)] = (34 − 9.89) / (9.89 / 3) = 24.11 / 3.30 = <strong>7.31</strong>, on (1, 3) degrees of freedom, p = 0.074.</p>
  <p>With only six houses the evidence is suggestive, not conclusive at 5%. R² of the line is 0.990, which looks superb, yet the shape is wrong in a way that matters most at the edges, exactly where the big flats are.</p>
  <h3>Formal test: Ramsey's RESET</h3>
  <p>Idea: if the model is right, powers of the fitted values (ŷ², ŷ³) should add nothing. RESET refits with ŷ² added and F-tests whether its coefficient is 0. A small p-value says "some non-linear function of the predictors is missing". With a single feature ŷ = −16 + 7x, so ŷ² is just a combination of 1, x and x²: RESET on the houses is exactly the size² F-test above.</p>
  <div class="fx" data-lang="py">from scipy import stats
from statsmodels.stats.diagnostic import linear_reset
z = x - x.mean()                                          # centred size: -5 ... 5
quad = sm.OLS(y, sm.add_constant(np.c_[z, z ** 2])).fit() # add a squared size column
print("line residuals     :", fit.resid.round(2) + 0.0, " SSE", round(fit.ssr, 2))
print("with size^2        :", quad.resid.round(2) + 0.0, " SSE", round(quad.ssr, 2))
F = (fit.ssr - quad.ssr) / (quad.ssr / (6 - 3))           # extra-sum-of-squares F test, df (1, 3)
print(f"F for size^2 = {F:.2f}  p = {stats.f.sf(F, 1, 3):.4f}   (t^2 of the size^2 term: {quad.tvalues[2] ** 2:.2f})")
print(f"RESET on the line (adds yhat^2): p = {linear_reset(fit, power=2, use_f=True).pvalue:.4f}")
rng = np.random.default_rng(0)
xb = rng.uniform(1, 10, 200); yb = 3 + 0.5 * xb ** 2 + rng.normal(0, 1, 200)   # bigger curved sample
for name, X in [("straight line", sm.add_constant(xb)), ("line + x^2", sm.add_constant(np.c_[xb, xb ** 2]))]:
    f = sm.OLS(yb, X).fit()
    print(f"{name:13s} R2={f.rsquared:.3f}  RESET p={linear_reset(f, power=2, use_f=True).pvalue:.4f}")</div>
  <div class="fx" data-lang="text">line residuals     : [ 2.  0. -1. -2. -3.  4.]  SSE 34.0
with size^2        : [-0.68  0.54  1.14  0.14 -2.46  1.32]  SSE 9.89
F for size^2 = 7.31  p = 0.0735   (t^2 of the size^2 term: 7.31)
RESET on the line (adds yhat^2): p = 0.0735
straight line R2=0.954  RESET p=0.0000
line + x^2    R2=0.996  RESET p=0.1532</div>
  <p>The houses: F = 7.31 and RESET p = 0.0735, identical as predicted. The same idea at scale: 200 noisy points from y = 3 + 0.5x². The straight line still has R² 0.954, but now with enough rows RESET's p-value is 0.0000. With x² added, RESET finds nothing more (p = 0.153). Small samples can hint; large samples decide.</p>
  <h3>In multiple regression: which feature is curved?</h3>
  <p>A curve in residuals-vs-fitted says something is wrong, not what. Plot residuals against <strong>each feature</strong>, or use a <strong>component-plus-residual (partial residual) plot</strong>: for feature j plot wⱼxⱼ + e against xⱼ. If the cloud bends, xⱼ needs a transform. statsmodels: <code>sm.graphics.plot_ccpr(fit, "x1")</code>.</p>
  <h3>Interactions: a different kind of non-linearity</h3>
  <p>Sometimes each feature is linear but the effect of one depends on another. A Metro flat might gain 9 lakh per 100 sq ft while an Old town flat gains 6: a single "size" slope is wrong for both. Signs: residuals vs size fan in opposite directions for different localities; residuals split by group show different trends. Fix: add the product column size × is_Metro (formula <code>price ~ size * C(locality)</code>), which lets the slope differ by group.</p>
  <h3>Fixes</h3>
  <table class="tbl">
    <tr><th>Pattern</th><th>Fix</th></tr>
    <tr><td>U-shape / smile in one feature (the houses)</td><td>add x² (<a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis</a>), or splines</td></tr>
    <tr><td>Rises fast then flattens (diminishing returns)</td><td>log x or √x</td></tr>
    <tr><td>Exponential growth, multiplicative effects</td><td>log y (section 10)</td></tr>
    <tr><td>Slope differs by group</td><td>interaction terms</td></tr>
    <tr><td>Complex, unknown shape</td><td>splines, GAMs, or trees/boosting (<a class="xref" data-note="ml_gbm">Gradient Boosting</a>)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Linearity</strong>: E[y | x] = xᵀw for some w, i.e. the mean of y is exactly a weighted sum of the given columns. Together with exogeneity, E[ε | X] = 0. Violation = <strong>misspecification</strong> of the functional form.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A high R² never proves linearity (0.990 for the houses, 0.954 at scale). And a residual plot of a perfectly linear model with a strongly skewed feature can look "funnelled" just because most points sit on one side; check the shape, not the density.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Independence.</b> Even with the right shape, the standard errors assume every row brings fresh, independent information. The houses were sold one a month; data collected over time often does not.</div>

  <h2 id="rd-ind"><span class="num">04</span>Independence of Errors</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The six houses were sold January to June. If the market was drifting up, consecutive sales would miss the line in the same direction, and the six rows would carry less information than six independent ones. How do we check whether one sale's miss predicts the next?</p>
  </div>
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
  <table class="tbl out"><caption>Durbin–Watson by hand, houses in order of sale</caption>
    <tr><th>month t</th><th>house</th><th>eₜ</th><th>eₜ²</th><th>eₜ − eₜ₋₁</th><th>(eₜ − eₜ₋₁)²</th></tr>
    <tr><td>1</td><td>A</td><td>2</td><td>4</td><td>–</td><td>–</td></tr>
    <tr><td>2</td><td>B</td><td>0</td><td>0</td><td>−2</td><td>4</td></tr>
    <tr><td>3</td><td>C</td><td>−1</td><td>1</td><td>−1</td><td>1</td></tr>
    <tr><td>4</td><td>D</td><td>−2</td><td>4</td><td>−1</td><td>1</td></tr>
    <tr><td>5</td><td>E</td><td>−3</td><td>9</td><td>−1</td><td>1</td></tr>
    <tr><td>6</td><td>F</td><td>4</td><td>16</td><td>7</td><td>49</td></tr>
    <tr><td colspan="3"><strong>sums</strong></td><td><strong>34</strong></td><td></td><td><strong>56</strong></td></tr>
  </table>
  <p>DW = 56 / 34 = <strong>1.65</strong>: within the healthy band around 2, the same 1.647 printed in the Linear Regression summary. Notice where most of the 56 comes from: the jump from E (−3) to F (+4). B to E drift down together (differences of only −1), which is the smile again: in our table the sale order is also the size order, so a missing curve looks like a run of same-sign residuals. Had the curve been stronger, DW would have dropped below 1.5 even with no time effect at all.</p>
  <div class="fx" data-lang="py">from statsmodels.stats.stattools import durbin_watson
e = fit.resid                                             # houses A-F, in the order they were sold
print("differences e_t - e_t-1:", np.diff(e).round(2) + 0.0)
print("sum of squared differences:", round((np.diff(e) ** 2).sum(), 2), " sum e^2:", round((e ** 2).sum(), 2))
print("DW =", round(durbin_watson(e), 3))
print("lag-1 autocorrelation:", round((e[1:] * e[:-1]).sum() / (e ** 2).sum(), 3))</div>
  <div class="fx" data-lang="text">differences e_t - e_t-1: [-2. -1. -1. -1.  7.]
sum of squared differences: 56.0  sum e^2: 34.0
DW = 1.647
lag-1 autocorrelation: -0.118</div>
  <p>The lag-1 autocorrelation is −0.118; 2(1 − (−0.118)) = 2.24 is not close to 1.65 because the approximation needs many rows. Use DW's value, not the shortcut, on short series.</p>
  <table class="tbl">
    <tr><th>DW</th><th>Reading</th></tr>
    <tr><td>≈ 2 (about 1.5 to 2.5)</td><td>no first-order autocorrelation (the houses: 1.65)</td></tr>
    <tr><td>&lt; 1.5, toward 0</td><td>positive autocorrelation (the common case)</td></tr>
    <tr><td>&gt; 2.5, toward 4</td><td>negative autocorrelation (over-correction, alternating)</td></tr>
  </table>
  <p>DW only sees lag 1 and only makes sense if rows are in a meaningful order. For several lags use the <strong>Breusch–Godfrey</strong> test (<code>acorr_breusch_godfrey</code>) or <strong>Ljung–Box</strong> on residuals, and plot the residual ACF (<a class="xref" data-note="ml_timeseries">Time Series</a>, <a class="xref" data-note="ml_arima">ARIMA</a>).</p>
  <h3>Demo at scale: how often does autocorrelation fake a discovery?</h3>
  <p>Six houses cannot show the damage, so simulate 1,000 datasets of 100 weeks. The feature drifts slowly (AR(1) with ρ = 0.8, like weekly ad spend), the true slope is <strong>0</strong>, and the errors are also AR(1) with ρ = 0.8. A correct 5% test should call the slope "significant" in 5% of datasets. Compare three ways of computing the SE.</p>
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
    <li><strong>Model the dependence</strong>: GLS / GLSAR, regression with ARIMA errors (<code>SARIMAX</code> with exog), or add lagged y / lagged features / trend and seasonal terms (a "month of sale" column for the houses if the market drifts).</li>
    <li><strong>Correct the SEs</strong>: HAC (Newey–West) for time order; <strong>cluster-robust</strong> SEs for groups (<code>cov_type="cluster"</code>), e.g. flats in the same building.</li>
    <li><strong>For prediction</strong>: validate with time-ordered splits, never random K-fold (<a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a>).</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Independence</strong>: Cov(εᵢ, εⱼ) = 0 for i ≠ j. Its failure in ordered data is <strong>autocorrelation</strong> (serial correlation). <strong>HAC</strong> (heteroscedasticity- and autocorrelation-consistent) SEs estimate Var(ŵ) allowing correlated errors up to a chosen lag.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Shuffling the rows before computing DW makes it look perfect (≈ 2) and hides the problem; DW needs the true order. Conversely, a low DW on data with no natural order (sorted by y, say) is meaningless. And a "snake" in residuals over time is often missing trend, seasonality or curvature (a linearity problem; in our table sale order = size order) rather than pure error correlation.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Equal variance.</b> Independent errors can still have different sizes. Bigger flats might sell with bigger price surprises than small ones. What does unequal spread do to our SEs?</div>

  <h2 id="rd-het"><span class="num">05</span>Equal Variance (Homoscedasticity)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The houses' squared misses are 4, 0, 1, 4, 9, 16: the biggest at the big end. Does the price noise grow with size? If so, one pooled s² is wrong for both small and large flats, and so are the SEs and the family's prediction interval.</p>
  </div>
  <h3>What breaks if it fails</h3>
  <p><strong>Heteroscedasticity</strong> means the spread of the errors changes across rows, usually growing with the size of the prediction (income, prices, counts, times). Coefficients stay unbiased. But (1) the classic SE formula, which uses one pooled s², is wrong, typically too small for the slope; (2) OLS is no longer the most precise estimator (rows with huge noise get as much say as precise rows); (3) prediction intervals are too wide for small ŷ and too narrow for large ŷ.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A weighing machine that is accurate to ±10 g for a mango and ±2 kg for a watermelon. Averaging all readings with equal trust treats the watermelon guesses as if they were as precise as the mango ones.</p>
  </div>
  <h3>Detect: Breusch–Pagan by hand</h3>
  <p>Idea: if the variance is constant, the squared residuals should not be predictable from the features. So regress e² on the features and see whether that regression explains anything.</p>
  <figure class="viz"><svg viewBox="0 0 520 250" width="520">
<line x1="60" y1="220" x2="500" y2="220" stroke="currentColor"/><line x1="60" y1="30" x2="60" y2="220" stroke="currentColor"/>
<text x="52" y="224" text-anchor="end" class="tm" font-size="11">0</text><text x="52" y="174" text-anchor="end" class="tm" font-size="11">5</text><text x="52" y="124" text-anchor="end" class="tm" font-size="11">10</text><text x="52" y="74" text-anchor="end" class="tm" font-size="11">15</text>
<text x="123" y="236" text-anchor="middle" class="tm" font-size="11">6</text><text x="186" y="236" text-anchor="middle" class="tm" font-size="11">8</text><text x="249" y="236" text-anchor="middle" class="tm" font-size="11">10</text><text x="311" y="236" text-anchor="middle" class="tm" font-size="11">12</text><text x="374" y="236" text-anchor="middle" class="tm" font-size="11">14</text><text x="437" y="236" text-anchor="middle" class="tm" font-size="11">16</text>
<text x="56" y="24" text-anchor="end" class="tm" font-size="11.5">e²</text><text x="280" y="250" text-anchor="middle" class="tm" font-size="11">size</text>
<line x1="123" y1="220" x2="123" y2="180" class="sr" stroke-width="10"/><line x1="249" y1="220" x2="249" y2="210" class="sr" stroke-width="10"/><line x1="311" y1="220" x2="311" y2="180" class="sr" stroke-width="10"/><line x1="374" y1="220" x2="374" y2="130" class="sr" stroke-width="10"/><line x1="437" y1="220" x2="437" y2="60" class="sr" stroke-width="10"/>
<line x1="142" y1="220" x2="453" y2="93" class="sb" stroke-width="2" stroke-dasharray="6 4"/>
<text x="123" y="172" text-anchor="middle" font-size="10.5">4</text><text x="186" y="212" text-anchor="middle" font-size="10.5">0</text><text x="249" y="202" text-anchor="middle" font-size="10.5">1</text><text x="311" y="172" text-anchor="middle" font-size="10.5">4</text><text x="374" y="122" text-anchor="middle" font-size="10.5">9</text><text x="437" y="52" text-anchor="middle" font-size="10.5">16</text>
<text x="80" y="44" class="tb" font-size="11.5">auxiliary line: e² ≈ 5.67 + 1.29·(size − 11)</text>
<text x="80" y="62" class="tm" font-size="11">R² = 0.653 → LM = 6 × 0.653 = 3.92</text>
</svg><figcaption>Squared residuals of the six houses against size. They grow toward the big end, so a line through them has a positive slope; Breusch–Pagan asks whether that slope is more than chance.</figcaption></figure>
  <ol>
    <li><strong>Auxiliary regression</strong> e² on size. Mean(e²) = 34/6 = 5.667. S_x,e² = Σ(x − 11)·e² = −20 + 0 − 1 + 4 + 27 + 80 = 90 (the Σ(x − 11) = 0 lets us skip subtracting the mean). Slope = 90/70 = 1.286 lakh² per 100 sq ft: squared misses grow with size.</li>
    <li><strong>R² of the auxiliary regression</strong> = explained / total = (90²/70) / Σ(e² − 5.667)² = 115.71 / 177.33 = <strong>0.653</strong> (the total: Σe⁴ − 6 × 5.667² = 370 − 192.67).</li>
    <li><strong>LM statistic</strong> = n × R²_aux = 6 × 0.653 = <strong>3.92</strong>.</li>
    <li>Under constant variance, LM follows a χ² distribution with (number of features) = 1 degree of freedom, whose 5% critical value is 3.84. 3.92 &gt; 3.84, so (just) reject: <strong>p = 0.048</strong>.</li>
  </ol>
  <div class="fx" data-lang="py">from statsmodels.stats.diagnostic import het_breuschpagan, het_white
X1 = sm.add_constant(x)
e2 = fit.resid ** 2
print("e^2:", e2.round(3) + 0.0, " mean", round(e2.mean(), 3))
aux = sm.OLS(e2, X1).fit()                                       # auxiliary regression e^2 ~ size
print(f"aux slope = {aux.params[1]:.4f}   aux R2 = {aux.rsquared:.4f}  LM = n*R2 = {6 * aux.rsquared:.3f}")
lm, lm_p, fstat, f_p = het_breuschpagan(fit.resid, X1)
print(f"Breusch-Pagan LM = {lm:.3f}  p = {lm_p:.4f}")
print(f"White test    LM = {het_white(fit.resid, X1)[0]:.3f}  p = {het_white(fit.resid, X1)[1]:.4f}")
lm_q, p_q, _, _ = het_breuschpagan(quad.resid, sm.add_constant(np.c_[z, z ** 2]))
print(f"after adding size^2: Breusch-Pagan LM = {lm_q:.3f}  p = {p_q:.4f}")</div>
  <div class="fx" data-lang="text">e^2: [ 4.  0.  1.  4.  9. 16.]  mean 5.667
aux slope = 1.2857   aux R2 = 0.6525  LM = n*R2 = 3.915
Breusch-Pagan LM = 3.915  p = 0.0479
White test    LM = 5.946  p = 0.0512
after adding size^2: Breusch-Pagan LM = 1.695  p = 0.4285</div>
  <p>statsmodels' <code>het_breuschpagan</code> gives the same 3.915 (its default is Koenker's version, LM = n·R², which does not need normal errors). The <strong>White test</strong> also includes squares and cross-products of the features in the auxiliary regression, so it catches curved variance patterns but spends more degrees of freedom (here 2 df, p = 0.051). <strong>Goldfeld–Quandt</strong> (<code>het_goldfeldquandt</code>) compares the residual variance of the low-x and high-x halves.</p>
  <p>Now the last line, which is the real lesson. After adding size² (the fix from section 03), Breusch–Pagan gives LM 1.70, <strong>p = 0.43</strong>: no evidence of unequal variance at all. The large squared residuals at the big end were not noise growing with size; they were the curve the line could not follow. <strong>Fix linearity first, then test the variance.</strong> Tests for one assumption are fooled by failures of another.</p>
  <h3>Fix 1: robust (sandwich) standard errors</h3>
  <p>Suppose the spread really did grow. Keep the OLS coefficients, but estimate their variance without assuming one common σ². The general formula is the "sandwich" Var(ŵ) = (XᵀX)⁻¹ [Σ eᵢ² xᵢxᵢᵀ] (XᵀX)⁻¹. With one feature it reduces to</p>
  <p><strong>Var_HC0(slope) = Σ (xᵢ − x̄)² eᵢ² / S_xx²</strong></p>
  <p>Each row contributes its <em>own</em> squared residual instead of the pooled s². By hand: Σ(xᵢ − 11)²eᵢ² = 25·4 + 9·0 + 1·1 + 1·4 + 9·9 + 25·16 = 100 + 0 + 1 + 4 + 81 + 400 = 586; divided by 70² = 4900 gives 0.1196; √ = <strong>0.3458</strong>. The classic SE is √(s²/S_xx) = √(8.5/70) = <strong>0.3485</strong>.</p>
  <table class="tbl">
    <tr><th>Version</th><th>Weight on eᵢ²</th><th>Note</th></tr>
    <tr><td>HC0 (White)</td><td>eᵢ²</td><td>original; too small in small samples</td></tr>
    <tr><td>HC1</td><td>eᵢ² · n/(n − p)</td><td>Stata's "robust"</td></tr>
    <tr><td>HC2</td><td>eᵢ² / (1 − hᵢ)</td><td>undoes the leverage squeeze</td></tr>
    <tr><td>HC3</td><td>eᵢ² / (1 − hᵢ)²</td><td>most conservative; recommended for small n</td></tr>
  </table>
  <div class="fx" data-lang="py">d = x - x.mean(); Sxx = d @ d
e = fit.resid
hc0 = np.sqrt((d ** 2 * e ** 2).sum() / Sxx ** 2)                 # White's sandwich, by hand
print(f"slope se: classic {fit.bse[1]:.4f}   HC0 by hand {hc0:.4f}   statsmodels HC0 {fit.get_robustcov_results('HC0').bse[1]:.4f}")
rob = sm.OLS(y, X1).fit(cov_type="HC3")
print(f"HC3 se {rob.bse[1]:.4f}   (coefficients unchanged: {rob.params.round(3)})")
wls = sm.WLS(y, X1, weights=1 / x ** 2).fit()                     # if noise SD grew like size: weight 1/size^2
print(f"WLS: coef {wls.params.round(3)}  slope se {wls.bse[1]:.4f}")</div>
  <div class="fx" data-lang="text">slope se: classic 0.3485   HC0 by hand 0.3458   statsmodels HC0 0.3458
HC3 se 0.6963   (coefficients unchanged: [-16.   7.])
WLS: coef [-13.142   6.727]  slope se 0.2723</div>
  <p>The hand HC0 (0.3458) matches statsmodels. HC3 is twice as large (0.696) because the two biggest squared residuals sit at the high-leverage ends (A and F, h = 0.524), and HC3 divides exactly those by (1 − 0.524)² = 0.227, multiplying them by 4.4. Coefficients are unchanged: robust SEs change only the uncertainty. With six rows, HC3 says "the slope's uncertainty could be twice what the classic formula claims".</p>
  <h3>Fix 2: weighted least squares</h3>
  <p>If you know (or can model) how the variance grows, give each row a weight inversely proportional to its error variance: minimise Σ wᵢ eᵢ² with wᵢ = 1/σᵢ². Noisy rows count less. If the price noise SD grew in proportion to size, the variance would grow like size², so wᵢ = 1/sizeᵢ². WLS then gives price = −13.14 + 6.73·size with a slope SE of 0.272: the small flats, assumed precise, pull the line more. It is the efficient (BLUE) estimator when the weights are right; with wrong weights (and here the variance test vanished once the curve was fixed), combine WLS with robust SEs or don't use it.</p>
  <h3>Fix 3: transform y</h3>
  <p>When the spread grows in proportion to the level (a 10% typical error), log y turns multiplicative noise into additive, constant-variance noise, and often straightens curves too. Section 10 shows a full example. Box–Cox finds the best power transform (<a class="xref" data-note="ml_features">Feature Engineering</a>).</p>
  <h3>Demo at scale: do the 95% intervals really cover 95%?</h3>
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
    <p>Heteroscedasticity does not bias OLS coefficients, so "my coefficients are wrong because of heteroscedasticity" is a wrong answer in interviews. What is wrong is the SEs, p-values and intervals. Also: a curve can masquerade as a fan (the houses: p 0.048 → 0.43 after size²), and in large samples BP rejects tiny, harmless variance changes; look at the plot and the size of the effect, and when in doubt just report HC3 SEs.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Normality of errors.</b> Equal spread is about the size of the errors. Their <em>shape</em> (bell curve or skewed) is the last LINE assumption, and the one that matters least.</div>

  <h2 id="rd-norm"><span class="num">06</span>Normality of Errors</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The t-values, p-values and the family's interval [66, 84] all used the normal (or t) distribution. Do the six residuals look like draws from a bell curve, and how much does it matter if they don't?</p>
  </div>
  <h3>What breaks if it fails</h3>
  <p>The exact t and F distributions behind p-values and CIs assume normal errors. But thanks to the central limit theorem, coefficient estimates are averages of many errors and become nearly normal anyway as n grows, so coefficient inference is robust to non-normal errors in moderate samples. What does <em>not</em> get fixed by large n is the <strong>prediction interval</strong>: it is about one new error, and if that error is skewed, a symmetric ± interval is the wrong shape.</p>
  <h3>Detect: a Q-Q plot by hand</h3>
  <p>A quantile-quantile plot puts each sorted residual next to where it "should" be if residuals were normal. For n points, the expected position of the i-th smallest is the normal quantile at probability (i − 0.5)/n.</p>
  <table class="tbl out"><caption>House residuals, Q-Q coordinates (s = 2.916)</caption>
    <tr><th>rank i</th><th>(i − 0.5)/6</th><th>normal quantile z</th><th>sorted residual</th><th>residual / s</th></tr>
    <tr><td>1</td><td>0.083</td><td>−1.383</td><td>−3 (E)</td><td>−1.029</td></tr>
    <tr><td>2</td><td>0.250</td><td>−0.674</td><td>−2 (D)</td><td>−0.686</td></tr>
    <tr><td>3</td><td>0.417</td><td>−0.210</td><td>−1 (C)</td><td>−0.343</td></tr>
    <tr><td>4</td><td>0.583</td><td>0.210</td><td>0 (B)</td><td>0</td></tr>
    <tr><td>5</td><td>0.750</td><td>0.674</td><td>2 (A)</td><td>0.686</td></tr>
    <tr><td>6</td><td>0.917</td><td>1.383</td><td>4 (F)</td><td>1.372</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 520 250" width="520">
<line x1="60" y1="130" x2="460" y2="130" stroke="currentColor" stroke-opacity="0.4"/><line x1="260" y1="20" x2="260" y2="235" stroke="currentColor" stroke-opacity="0.4"/>
<line x1="84" y1="218" x2="436" y2="42" stroke="currentColor" stroke-dasharray="5 4"/><text x="120" y="60" class="tm" font-size="11">dashed 45° line: perfectly normal</text>
<circle cx="108" cy="187" r="5.5" class="fb sb"/><circle cx="186" cy="168" r="5.5" class="fb sb"/><circle cx="237" cy="149" r="5.5" class="fb sb"/><circle cx="283" cy="130" r="5.5" class="fb sb"/><circle cx="334" cy="92" r="5.5" class="fb sb"/><circle cx="412" cy="55" r="5.5" class="fr sr"/>
<text x="70" y="232" class="tb" font-size="11">E: −1.03 (lower tail a little short)</text>
<text x="404" y="74" text-anchor="end" class="tr" font-size="11">F: 1.37</text>
<text x="460" y="122" text-anchor="end" class="tm" font-size="11">normal quantile z</text><text x="252" y="30" text-anchor="end" class="tm" font-size="11">residual / s</text>
<text x="108" y="146" text-anchor="middle" class="tm" font-size="10.5">−1.38</text><text x="412" y="146" text-anchor="middle" class="tm" font-size="10.5">1.38</text>
</svg><figcaption>Q-Q plot of the six house residuals. The points lie close to the line; the lowest (E) sits a little above it and the high end follows it, a mild right lean. With six points this is no evidence against normality.</figcaption></figure>
  <table class="tbl"><caption>Reading Q-Q shapes</caption>
    <tr><th>Shape</th><th>Means</th></tr>
    <tr><td>points on the line</td><td>roughly normal (the houses)</td></tr>
    <tr><td>S-shape: low end below, high end above the line</td><td>heavy tails (more extreme errors than normal)</td></tr>
    <tr><td>inverted S</td><td>light tails</td></tr>
    <tr><td>curve bending up at both ends (convex)</td><td>right skew (long upper tail)</td></tr>
    <tr><td>curve bending down at both ends (concave)</td><td>left skew</td></tr>
    <tr><td>one or two points far off at an end</td><td>outliers (check section 08)</td></tr>
  </table>
  <div class="fx" data-lang="py">r = np.sort(fit.resid)                                  # house residuals, sorted
q = stats.norm.ppf((np.arange(1, 7) - 0.5) / 6)         # theoretical normal quantiles
print("sorted residual :", r.round(2) + 0.0)
print("normal quantile :", q.round(3) + 0.0)
print("residual / s    :", (r / s).round(3) + 0.0)
print("Shapiro-Wilk p  :", round(stats.shapiro(fit.resid).pvalue, 3))
print("skew, kurtosis  :", round(stats.skew(fit.resid), 3), round(stats.kurtosis(fit.resid, fisher=False), 3))</div>
  <div class="fx" data-lang="text">sorted residual : [-3. -2. -1.  0.  2.  4.]
normal quantile : [-1.383 -0.674 -0.21   0.21   0.674  1.383]
residual / s    : [-1.029 -0.686 -0.343  0.     0.686  1.372]
Shapiro-Wilk p  : 0.817
skew, kurtosis  : 0.445 1.92</div>
  <p>The hand coordinates match. The formal tests: Shapiro–Wilk p = 0.817, and Jarque–Bera (from skew 0.445 and kurtosis 1.92, JB = (6/6)(0.198 + (1.92 − 3)²/4) = 0.198 + 0.292 = 0.49, p = 0.78; see the Linear Regression summary). Neither rejects normality, but with 6 points no test could: small samples have almost no power, large samples reject trivial departures. <strong>Read the plot; treat the tests as secondary.</strong></p>
  <h3>Demo at scale: what non-normal errors actually break</h3>
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
  <p>The slope CI covers 95.0% at both sizes: coefficient inference survived skewed errors. The prediction interval did not: new cases <em>never</em> fall below it (0.0–0.1%) and fall above it 4.8–7.4% of the time. The interval is symmetric, the errors are not, and more data does not fix that. House prices often have this right skew (a few flats sell far above the line, few far below), which is one reason analysts model log price.</p>
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
    <p>Do not log-transform y only to "make residuals normal" when you care about predicting y itself: predictions exp(log-ŷ) estimate the median, not the mean, and need a correction (multiply by about exp(s²/2)). And never test the normality of y or x instead of the residuals: the six prices 28 … 100 are not "normal" and do not need to be.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Multicollinearity.</b> The LINE assumptions are about errors. The last assumption is about the features: what happens when two columns, like size and bedrooms, tell the same story?</div>

  <h2 id="rd-mc"><span class="num">07</span>Multicollinearity</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In Linear Regression, adding bedrooms moved size from 7.0 to 6.21, and the 2×2 system had determinant 24 out of a possible 385. Bigger flats nearly always have more bedrooms. Can six houses tell us the separate value of each, and how would we measure the problem?</p>
  </div>
  <h3>Perfect vs high</h3>
  <p><strong>Perfect</strong> multicollinearity means one column is an exact linear combination of others: all k locality dummies plus an intercept, "size in sq ft" next to "size in 100 sq ft", "total = part A + part B" with all three included. XᵀX is singular and the coefficients are not defined (the dummy trap in <a class="xref" data-note="ml_regression">Linear Regression</a>: rank 3 of 4). Fix: drop the redundant column.</p>
  <p><strong>High</strong> (imperfect) multicollinearity means columns are strongly but not exactly related: size and bedrooms, two temperature sensors. A unique solution exists, but the data cannot tell the columns' effects apart.</p>
  <h3>What breaks</h3>
  <ul>
    <li>Standard errors inflate, so individually "nothing is significant" while the model as a whole fits well (high R², significant F).</li>
    <li>Coefficients become unstable: large, of opposite signs, flipping between samples.</li>
    <li>Interpretation "holding the other fixed" asks about a situation that never occurs in the data (a 1,600 sq ft flat with one bedroom).</li>
    <li><strong>Not broken</strong>: R² and predictions (as long as new data have the same correlation pattern).</li>
  </ul>
  <h3>Detect: VIF by hand</h3>
  <p>The <strong>variance inflation factor</strong> of feature j: regress xⱼ on all the <em>other</em> features, take that R²ⱼ, and compute VIFⱼ = 1/(1 − R²ⱼ). It says by how much the variance of ŵⱼ is inflated compared with a feature uncorrelated with the rest; the SE is inflated by √VIF.</p>
  <p>Size and bedrooms: with only one other feature, R²ⱼ is the squared correlation. From Linear Regression's centred sums, r = S₁₂/√(S₁₁S₂₂) = 19/√(70 × 5.5) = 19/19.62 = 0.968, so R² = 361/385 = 0.938 and <strong>VIF = 1/(1 − 0.938) = 385/24 = 16.0</strong> for both. (Notice 24, the determinant of the 2×2 system: VIF is literally "how close to singular".) Their SEs are √16 = 4 times what they would be if size and bedrooms were unrelated.</p>
  <div class="fx" data-lang="py">from statsmodels.stats.outliers_influence import variance_inflation_factor
rooms = np.array([1, 2, 2, 3, 3, 4], dtype=float)                # bedrooms of houses A-F
r2_aux = sm.OLS(x, sm.add_constant(rooms)).fit().rsquared        # how well rooms explains size
print(f"R2(size ~ rooms) = {r2_aux:.4f}  VIF = 1/(1-R2) = {1 / (1 - r2_aux):.3f}")
XB = sm.add_constant(np.c_[x, rooms])
print("statsmodels VIF:", [round(float(variance_inflation_factor(XB, i)), 3) for i in (1, 2)])
both = sm.OLS(y, XB).fit()
print("size alone : coef", round(fit.params[1], 3), " se", round(fit.bse[1], 3))
print("size+rooms : coefs", both.params[1:].round(3), " se", both.bse[1:].round(3), " p", both.pvalues[1:].round(3),
      " R2", round(both.rsquared, 4), " F-test p", f"{both.f_pvalue:.1e}")
for name, col in [("raw size", x), ("centred size", x - x.mean())]:            # structural collinearity
    rr = np.corrcoef(col, col ** 2)[0, 1]
    print(f"{name:12s} corr(size, size^2) = {rr:.4f}  VIF = {1 / (1 - rr ** 2):.1f}")</div>
  <div class="fx" data-lang="text">R2(size ~ rooms) = 0.9377  VIF = 1/(1-R2) = 16.042
statsmodels VIF: [16.042, 16.042]
size alone : coef 7.0  se 0.348
size+rooms : coefs [6.208 2.917]  se [1.541 5.497]  p [0.027 0.632]  R2 0.991  F-test p 8.5e-04
raw size     corr(size, size^2) = 0.9913  VIF = 57.7
centred size corr(size, size^2) = -0.0000  VIF = 1.0</div>
  <p>The VIF matches. The model lines show the damage. Size alone: coefficient 7.0, SE 0.348. With bedrooms: size 6.21 with SE 1.54 (4.4 times larger: √16 = 4 from the VIF, the rest because s² changed), and bedrooms 2.92 with SE 5.50 and <strong>p = 0.63</strong>, "not significant". Yet R² is 0.991 and the F-test that both slopes are 0 has p = 0.0009. Individually unclear, jointly overwhelming: the textbook signature of collinearity. The last two lines show <strong>structural</strong> collinearity: raw size and size² have correlation 0.991 (VIF 57.7); centred size and its square have correlation 0 (VIF 1.0).</p>
  <table class="tbl">
    <tr><th>VIF</th><th>R² with other features</th><th>SE multiplied by</th><th>Reading</th></tr>
    <tr><td>1</td><td>0</td><td>1</td><td>no collinearity</td></tr>
    <tr><td>5</td><td>0.80</td><td>2.24</td><td>common "look closer" threshold</td></tr>
    <tr><td>10</td><td>0.90</td><td>3.16</td><td>common "serious" threshold</td></tr>
    <tr><td>16</td><td>0.938</td><td>4.0</td><td>size and bedrooms</td></tr>
    <tr><td>57.7</td><td>0.983</td><td>7.6</td><td>raw size and size²</td></tr>
    <tr><td>100</td><td>0.99</td><td>10</td><td>coefficients nearly meaningless</td></tr>
  </table>
  <h3>Demo at scale: two temperature sensors</h3>
  <p>Ice-cream sales truly depend on sensor A (slope 2), 100 days. A second sensor B is added: unrelated, then a close copy of A, then a near-perfect copy.</p>
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
  <p>The next note adds size² to fix the smile. Raw size 6 … 16 and size² 36 … 256 rise together almost perfectly (correlation 0.991, VIF 57.7). Centre first: z = size − 11 = −5, −3, −1, 1, 3, 5 and z² = 25, 9, 1, 1, 9, 25 is symmetric while z is antisymmetric, so their correlation is exactly 0, VIF = 1. Same model, same predictions, stable separate coefficients. The same trick applies to x₁·x₂ interaction columns.</p>
  <h3>Fixes</h3>
  <table class="tbl">
    <tr><th>Fix</th><th>When</th></tr>
    <tr><td>Drop one of the twins</td><td>they measure the same thing (two sensors)</td></tr>
    <tr><td>Combine into one (average, ratio, index)</td><td>several noisy measures of one concept (sq ft per bedroom)</td></tr>
    <tr><td>Centre before polynomial / interaction terms</td><td>structural collinearity</td></tr>
    <tr><td>Ridge regression</td><td>you want to keep all features and stabilise (<a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a>: on these houses it shares the weight between size and bedrooms)</td></tr>
    <tr><td>PCA / PLS</td><td>many correlated features (<a class="xref" data-note="ml_pca">PCA</a>)</td></tr>
    <tr><td>More data, or data where they vary separately</td><td>inference on each effect is the goal (big flats with few bedrooms)</td></tr>
    <tr><td>Do nothing</td><td>you only need predictions, and the correlation will persist</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>VIFⱼ = 1 / (1 − R²ⱼ)</strong>, where R²ⱼ comes from regressing xⱼ on all other features (with intercept). Var(ŵⱼ) = σ² · VIFⱼ / Σ(xᵢⱼ − x̄ⱼ)². <strong>Condition number</strong> κ(X) = σ_max/σ_min of the (standardised) design matrix.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Pairwise correlations can all be modest while VIF is huge, because a feature can be explained by a <em>combination</em> of several others (x₄ ≈ x₁ + x₂ − x₃). Always compute VIF, not just the correlation matrix. And don't compute VIF for the intercept or read it off dummies of a rare category; use the generalised VIF for groups of dummies.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Outliers, leverage &amp; influence.</b> So far every problem was spread over all rows. Section 02 already flagged house F (studentised 15.9). Sometimes one single row decides the whole fit.</div>

  <h2 id="rd-infl"><span class="num">08</span>Outliers, Leverage &amp; Influence</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>House F has a huge studentised residual and maximum leverage. If the dealer's next sale is a giant flat at a strange price, could one house rewrite the whole price line? How do we measure "how much does this row move the fit"?</p>
  </div>
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
  <table class="tbl out"><caption>The six houses (p = 2)</caption>
    <tr><th>House</th><th>r</th><th>r²/2</th><th>h</th><th>h/(1 − h)</th><th>Cook's D</th></tr>
    <tr><td>A</td><td>0.994</td><td>0.494</td><td>0.524</td><td>1.100</td><td>0.543</td></tr>
    <tr><td>B</td><td>0</td><td>0</td><td>0.295</td><td>0.419</td><td>0</td></tr>
    <tr><td>C</td><td>−0.379</td><td>0.072</td><td>0.181</td><td>0.221</td><td>0.016</td></tr>
    <tr><td>D</td><td>−0.758</td><td>0.287</td><td>0.181</td><td>0.221</td><td>0.064</td></tr>
    <tr><td>E</td><td>−1.226</td><td>0.752</td><td>0.295</td><td>0.419</td><td>0.315</td></tr>
    <tr><td>F</td><td>1.988</td><td>1.976</td><td>0.524</td><td>1.100</td><td><strong>2.174</strong></td></tr>
  </table>
  <p>These match the "Cook's distance" line printed in section 02. Rules of thumb: Dᵢ &gt; 4/n deserves a look, Dᵢ &gt; 1 is very influential. With n = 6, 4/n = 0.67: A is close (0.54) and <strong>F is very influential (2.17)</strong>. Both are end houses with leverage 0.524, but F also has the biggest standardised residual. What is F telling us? Not that it is a bad data point: it is where the upward curve is strongest. Dropping F would hide the curve, not fix it.</p>
  <h3>Demo: add a seventh house, three ways</h3>
  <p>Now add a seventh sale G to the six houses in three different ways and see what happens to the line (base slope 7, intercept −16).</p>
  <ul>
    <li><strong>A</strong>: 1,100 sq ft (x = 11, the average size), sold for 81 lakh, 20 above the line (a flat with a famous view): outlier, low leverage.</li>
    <li><strong>B</strong>: 3,000 sq ft (x = 30), sold for 194 lakh, exactly on the line: high leverage, not an outlier.</li>
    <li><strong>C</strong>: 3,000 sq ft, sold for only 120 lakh (a distressed sale): high leverage and far off the line.</li>
  </ul>
  <p>Leverage of a new house at x = 30 by hand: the new x̄ = (66 + 30)/7 = 13.71; S_xx = Σx² − 7x̄² = (796 + 900) − 7 × 188.08 = 379.4; (30 − 13.71)² = 265.2; h = 1/7 + 265.2/379.4 = 0.143 + 0.699 = <strong>0.842</strong>. Close to the maximum of 1: this one flat controls its own prediction almost entirely.</p>
  <figure class="viz"><svg viewBox="0 0 500 260" width="500">
<line x1="50" y1="230" x2="480" y2="230" stroke="currentColor"/><line x1="50" y1="15" x2="50" y2="230" stroke="currentColor"/>
<text x="50" y="246" text-anchor="middle" class="tm" font-size="11">0</text><text x="184" y="246" text-anchor="middle" class="tm" font-size="11">10</text><text x="319" y="246" text-anchor="middle" class="tm" font-size="11">20</text><text x="453" y="246" text-anchor="middle" class="tm" font-size="11">30</text>
<text x="42" y="234" text-anchor="end" class="tm" font-size="11">0</text><text x="42" y="129" text-anchor="end" class="tm" font-size="11">100</text><text x="42" y="24" text-anchor="end" class="tm" font-size="11">200</text>
<line x1="81" y1="230" x2="467" y2="19" class="sb" stroke-width="2"/><text x="120" y="62" class="tb" font-size="11">base line (and case B): slope 7.0</text>
<line x1="50" y1="212" x2="467" y2="88" class="sr" stroke-width="2" stroke-dasharray="6 4"/><text x="478" y="80" text-anchor="end" class="tr" font-size="11">case C line: slope 3.8</text>
<circle cx="131" cy="201" r="5" class="ft st"/><circle cx="158" cy="188" r="5" class="ft st"/><circle cx="184" cy="174" r="5" class="ft st"/><circle cx="211" cy="161" r="5" class="ft st"/><circle cx="238" cy="147" r="5" class="ft st"/><circle cx="265" cy="125" r="5" class="ft st"/>
<text x="272" y="122" font-size="10.5">F</text>
<circle cx="198" cy="145" r="6" class="fg sg"/><text x="188" y="104" text-anchor="end" class="tg" font-size="11.5">A: outlier,</text><text x="188" y="119" text-anchor="end" class="tg" font-size="11.5">low leverage</text>
<circle cx="453" cy="26" r="6" class="fb sb"/><text x="440" y="48" text-anchor="end" class="tb" font-size="11.5">B: leverage 0.84, on the line</text>
<circle cx="453" cy="104" r="6" class="fr sr"/><text x="470" y="196" text-anchor="end" class="tr" font-size="11.5">C: leverage 0.84 + off the line → D = 12.8</text>
<text x="265" y="258" text-anchor="middle" class="tm" font-size="11">size (hundreds of sq ft)</text>
</svg><figcaption>One extra sale, three outcomes. A lifts the line slightly (intercept −16 → −13.1, slope unchanged); B changes nothing; C rotates the line from slope 7.0 to 3.8.</figcaption></figure>
  <div class="fx" data-lang="py">cases = {"A: price outlier, average size": (11, 81.0),
         "B: huge flat, on the line":      (30, 194.0),
         "C: huge flat, off the line":     (30, 120.0)}
print("base fit (6 houses): slope 7.000, intercept -16.000")
for name, (xn, yn) in cases.items():
    xa, ya = np.append(x, xn), np.append(y, yn)
    f7 = sm.OLS(ya, sm.add_constant(xa)).fit()
    inf7 = f7.get_influence()
    print(f"{name:31s} slope {f7.params[1]:6.3f}  intercept {f7.params[0]:7.3f} | new house: "
          f"h={inf7.hat_matrix_diag[-1]:.3f}  t={inf7.resid_studentized_external[-1]:6.2f}  "
          f"Cook's D={inf7.cooks_distance[0][-1]:.3f}")</div>
  <div class="fx" data-lang="text">base fit (6 houses): slope 7.000, intercept -16.000
A: price outlier, average size  slope  7.000  intercept -13.143 | new house: h=0.143  t=  6.35  Cook's D=0.379
B: huge flat, on the line       slope  7.000  intercept -16.000 | new house: h=0.842  t=  0.00  Cook's D=0.000
C: huge flat, off the line      slope  3.824  intercept  16.988 | new house: h=0.842  t=-10.09  Cook's D=12.807</div>
  <p>Case A has a huge studentised residual (6.35) but modest leverage (1/7, the minimum possible): it only lifts the intercept (to −13.14), Cook's D 0.38. Case B has leverage 0.842 but residual 0: nothing changes, D = 0. Case C combines leverage 0.842 with a large residual: the slope collapses from 7.0 to 3.8 and Cook's D is <strong>12.8</strong>, far above every threshold. One distressed sale rewrote the dealer's price list.</p>
  <div class="fx" data-lang="py">xa, ya = np.append(x, 30), np.append(y, 120.0)             # case C again: house G
fC = sm.OLS(ya, sm.add_constant(xa)).fit()
sf = fC.get_influence().summary_frame()
sf.index = list("ABCDEFG")
print(sf[["hat_diag", "student_resid", "cooks_d", "dffits", "dfb_x1"]].round(3).to_string())
print("rules of thumb: h &gt; 2p/n =", round(2 * 2 / 7, 3), "| |t| &gt; 2 | Cook's D &gt; 4/n =", round(4 / 7, 3),
      "| |DFFITS| &gt; 2*sqrt(p/n) =", round(2 * np.sqrt(2 / 7), 3))</div>
  <div class="fx" data-lang="text">   hat_diag  student_resid  cooks_d  dffits  dfb_x1
A     0.300         -1.080    0.242  -0.707   0.511
B     0.229         -0.601    0.061  -0.327   0.201
C     0.179         -0.164    0.004  -0.077   0.035
D     0.151          0.228    0.006   0.096  -0.022
E     0.143          0.641    0.039   0.262   0.010
F     0.157          2.598    0.292   1.120   0.332
G     0.842        -10.093   12.807 -23.289 -21.221
rules of thumb: h &gt; 2p/n = 0.571 | |t| &gt; 2 | Cook's D &gt; 4/n = 0.571 | |DFFITS| &gt; 2*sqrt(p/n) = 1.069</div>
  <p>The full influence table for case C. Row G breaks every rule: leverage 0.842 &gt; 0.571, |studentised residual| 10.1 &gt; 2, Cook's D 12.8 &gt; 0.571, |DFFITS| 23.3 &gt; 1.07. <strong>DFFITS</strong> is the change in the row's own fitted value when it is deleted, in SE units; <strong>DFBETAS</strong> (<code>dfb_x1</code>) is the change in the slope, in SE units: deleting G would move the slope by 21 standard errors. Notice also row F: its studentised residual is now 2.60 and its DFFITS 1.12 only because G dragged the line down and away from it. Influential points distort the diagnostics of <em>other</em> points too.</p>
  <h3>What to do with an influential point</h3>
  <ol>
    <li><strong>Check the data</strong>: a typo (30 instead of 13), unit error (sq m entered as sq ft), or a different population (a distressed or family sale)? Fix or exclude with a documented reason.</li>
    <li><strong>Check the model</strong>: maybe the point is telling the truth and the line is wrong (F says prices bend upward: a curve, section 03).</li>
    <li><strong>Report both fits</strong> (with and without) if it is genuine and you cannot decide.</li>
    <li><strong>Use robust regression</strong>, understanding what each method protects against (below).</li>
  </ol>
  <div class="fx" data-lang="py">from sklearn.linear_model import HuberRegressor, RANSACRegressor, LinearRegression
Xa = xa.reshape(-1, 1)
print("OLS    slope", round(LinearRegression().fit(Xa, ya).coef_[0], 3))
print("Huber  slope", round(HuberRegressor(epsilon=1.35).fit(Xa, ya).coef_[0], 3))
ran = RANSACRegressor(random_state=0, residual_threshold=10.0).fit(Xa, ya)
print("RANSAC slope", round(ran.estimator_.coef_[0], 3), " inliers:", ran.inlier_mask_.astype(int))
rlm = sm.RLM(ya, sm.add_constant(xa), M=sm.robust.norms.HuberT()).fit()
print("statsmodels RLM (Huber) slope", round(rlm.params[1], 3), " weights:", rlm.weights.round(2))</div>
  <div class="fx" data-lang="text">OLS    slope 3.824
Huber  slope 3.748
RANSAC slope 7.0  inliers: [1 1 1 1 1 1 0]
statsmodels RLM (Huber) slope 3.798  weights: [1.   1.   1.   1.   1.   0.81 1.  ]</div>
  <p>A surprise worth remembering: <strong>Huber regression does not help here</strong> (slope 3.75, statsmodels RLM 3.80). Huber down-weights rows with large residuals, but a high-leverage point pulls the line so close to itself that its residual is not the largest: RLM's weights show G keeping full weight 1.0, while innocent F is down-weighted to 0.81. Huber protects against outliers in y, not against leverage. <strong>RANSAC</strong> fits lines to random subsets and keeps the one most points agree with (within 10 lakh here); it ignores G entirely (inlier mask 0) and recovers slope 7.0. Other high-breakdown options: Theil–Sen (<code>TheilSenRegressor</code>), least trimmed squares.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Cook's distance</strong> Dᵢ = Σⱼ(ŷⱼ − ŷⱼ₍ᵢ₎)² / (p·s²) = (rᵢ²/p)·hᵢ/(1 − hᵢ). <strong>DFFITSᵢ</strong> = tᵢ√(hᵢ/(1 − hᵢ)). <strong>DFBETASᵢⱼ</strong> = (ŵⱼ − ŵⱼ₍ᵢ₎)/se₍ᵢ₎(ŵⱼ). Common cut-offs: h &gt; 2p/n, |t| &gt; 2, D &gt; 4/n (or 1), |DFFITS| &gt; 2√(p/n), |DFBETAS| &gt; 2/√n.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>(1) Deleting every point with a big residual until the fit looks clean is data manipulation; your SEs will be too small and the model will fail on real data. Deleting F would have hidden the real curve. (2) Two influential points close together can mask each other: deleting either one alone changes little (low Cook's D for each), deleting both changes everything. (3) "Use a robust regressor" is not one fix: Huber handles y-outliers, not leverage.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Endogeneity &amp; omitted variables.</b> Every check so far looks at residuals or X. The most damaging failure in practice leaves both looking perfectly healthy: an important variable that is not in the data at all.</div>

  <h2 id="rd-endo"><span class="num">09</span>Endogeneity &amp; Omitted-Variable Bias (Brief)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Suppose the dealer had never recorded bedrooms. The size-only fit looks clean on every check above. Would its slope still mean "the value of 100 more sq ft"? Can a column we do not have bias a column we do?</p>
  </div>
  <h3>The idea</h3>
  <p>OLS needs the features to be uncorrelated with the error term: E[ε | X] = 0 (<strong>exogeneity</strong>). When a feature is correlated with ε it is <strong>endogenous</strong>, and its coefficient is biased, and the bias does <em>not</em> shrink with more data. The three classic causes:</p>
  <table class="tbl">
    <tr><th>Cause</th><th>Example</th><th>Effect on the coefficient</th></tr>
    <tr><td><strong>Omitted variable</strong></td><td>price ~ size, bedrooms left out (bigger flats have more bedrooms); wage ~ education, ability left out</td><td>size gets credit for bedrooms; education for ability</td></tr>
    <tr><td><strong>Measurement error in x</strong></td><td>size estimated by eye, or education self-reported with errors</td><td>shrunk toward 0 (attenuation)</td></tr>
    <tr><td><strong>Reverse causality / simultaneity</strong></td><td>police numbers ~ crime (more crime brings more police)</td><td>any direction, often wrong sign</td></tr>
  </table>
  <h3>The omitted-variable formula, by hand</h3>
  <p>True model y = β₀ + β₁x₁ + β₂x₂ + ε. If we leave x₂ out and regress y on x₁ only, the slope we get on average is</p>
  <p><strong>β₁ (short) = β₁ + β₂ · δ</strong>, where δ is the slope from regressing x₂ on x₁.</p>
  <p>The houses: with bedrooms, β₁ = 6.208 (size) and β₂ = 2.917 (bedrooms); δ = S₁₂/S₁₁ = 19/70 = 0.271 bedrooms per 100 sq ft. Short slope = 6.208 + 2.917 × 0.271 = 6.208 + 0.792 = <strong>7.000</strong>, exactly the size-only slope. The bias (+0.79 lakh per 100 sq ft) has the sign of β₂ × δ:</p>
  <table class="tbl">
    <tr><th></th><th>δ &gt; 0 (x₂ rises with x₁)</th><th>δ &lt; 0</th></tr>
    <tr><td>β₂ &gt; 0</td><td>upward bias (the houses)</td><td>downward bias</td></tr>
    <tr><td>β₂ &lt; 0</td><td>downward bias</td><td>upward bias</td></tr>
  </table>
  <div class="fx" data-lang="py">d1, d2, dy = x - x.mean(), rooms - rooms.mean(), y - y.mean()
delta = (d1 @ d2) / (d1 @ d1)                               # slope of rooms on size
print(f"S12 = {d1 @ d2:.1f}, S11 = {d1 @ d1:.1f}  -&gt;  delta = {delta:.4f} rooms per 100 sq ft")
print(f"short slope (size alone) = {fit.params[1]:.4f}")
print(f"long model: w_size = {both.params[1]:.4f}, w_rooms = {both.params[2]:.4f}")
print(f"OVB formula: {both.params[1]:.4f} + {both.params[2]:.4f} * {delta:.4f} = {both.params[1] + both.params[2] * delta:.4f}")</div>
  <div class="fx" data-lang="text">S12 = 19.0, S11 = 70.0  -&gt;  delta = 0.2714 rooms per 100 sq ft
short slope (size alone) = 7.0000
long model: w_size = 6.2083, w_rooms = 2.9167
OVB formula: 6.2083 + 2.9167 * 0.2714 = 7.0000</div>
  <p>With six houses and VIF 16 we cannot be sure the "true" size effect is 6.2 rather than 7 (the SE was 1.54). The demo at scale makes the bias unmistakable: 5,000 simulated workers where wages depend on education (true effect 1.0) and unobserved ability.</p>
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
    <li><strong>Measure and include the confounder</strong> (or a good proxy): record bedrooms.</li>
    <li><strong>Fixed effects</strong> with panel data: compare each person (or building) with itself over time, removing everything constant about it.</li>
    <li><strong>Instrumental variables (2SLS)</strong>: find z that moves x but affects y only through x (distance to the nearest college for education). Stage 1: predict x from z; stage 2: regress y on the predicted x.</li>
    <li><strong>Randomised experiments</strong>: randomly assign x, which makes it independent of everything (<a class="xref" data-note="st_abtesting">A/B Testing</a>).</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Endogeneity</strong>: Cov(xⱼ, ε) ≠ 0 for some feature, which makes OLS biased and inconsistent. <strong>Omitted-variable bias</strong> = β₂·δ, nonzero when the omitted variable both affects y (β₂ ≠ 0) and is correlated with the included feature (δ ≠ 0).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>For pure prediction, omitted variables are "only" lost accuracy: the short model still predicts well as long as the relationship between x₁ and x₂ stays the same. The danger is reading the coefficient as an effect you can act on: "send everyone for one more year of education and wages will rise 1.74" is wrong by 74%. Also, adding more controls is not always safer: controlling for a variable caused by x (a mediator or a collider) creates bias.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: A full diagnostic workflow.</b> We have studied each problem alone. Real data has several at once, and fixing one can fix others, as the curve and the "fan" already showed.</div>

  <h2 id="rd-flow"><span class="num">10</span>A Full Diagnostic Workflow</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We have a dozen separate checks. In what order should we run them, and what happens to the others when we fix one problem?</p>
  </div>
  <p>The helper <code>diagnose</code> returns one number per check. First the same idea at scale: a delivery app models delivery minutes from distance (km) and number of items, for 400 orders. In the simulated truth, time grows multiplicatively (each km adds about 12%) with noise of about ±25%, which is how waiting and traffic delays usually behave. We fit the obvious linear model, run every check, apply one fix, and re-check.</p>
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
  <p>Now the same workflow on the six houses, before and after the fix that section 03 pointed to (adding centred size²):</p>
  <div class="fx" data-lang="py">houses_line = sm.add_constant(x)
houses_quad = sm.add_constant(np.c_[z, z ** 2])
print(pd.DataFrame({"houses: price ~ size": diagnose(fit, houses_line),
                    "houses: price ~ size + size^2": diagnose(quad, houses_quad)}).T.to_string())</div>
  <div class="fx" data-lang="text">                                  R2  RESET p    BP p    JB p    DW  max VIF  max Cook
houses: price ~ size           0.990   0.0735  0.0479  0.7830  1.65      1.0     2.174
houses: price ~ size + size^2  0.997   0.1535  0.4285  0.6569  2.42      1.0     4.547</div>
  <p>Before: RESET p 0.07 and BP p 0.048 (both hinting), Cook's D 2.17 for F. After adding size²: RESET p 0.15, BP p 0.43, DW 2.42. One fix (the right shape) cleared the linearity and the variance warnings together. The max Cook's D rises to 4.5, but with six rows and three parameters every end house has very high leverage (the quadratic leans on A and F to decide its curvature), so Cook's D is not comparable across the two models; it is a reminder that six houses are thin evidence for any curve, and the next note uses cross-validation to judge it.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>R² of 0.702 vs 0.752 for the delivery models is not a fair comparison: the two models predict different things (minutes vs log-minutes). To compare, transform the log model's predictions back to minutes (with the smearing correction) and compute RMSE on held-out data in minutes (<a class="xref" data-note="ml_reg_metrics">Regression Metrics</a>).</p>
  </div>
  <h3>A checklist to keep</h3>
  <ol>
    <li>Plot y against each feature before fitting; think about the process (additive? multiplicative? grouped? ordered in time?).</li>
    <li>Fit; plot residuals vs fitted and vs each feature: curve → transform / add terms; fan → log y, WLS or HC3. Fix the shape first.</li>
    <li>If rows are ordered or grouped: residuals vs time, DW / Breusch–Godfrey; use HAC, cluster-robust SEs or model the dependence.</li>
    <li>Q-Q plot: skew or heavy tails → transform, robust or quantile methods; matters most for prediction intervals.</li>
    <li>VIF: above 5–10 → drop, combine, centre, or ridge (if coefficients matter).</li>
    <li>Leverage, studentised residuals, Cook's D: investigate flagged rows; report with and without.</li>
    <li>Ask what is <em>not</em> in the data that drives both a feature and y (omitted variables).</li>
    <li>After any fix, re-run every check; fixes interact.</li>
  </ol>
  <div class="bridge"><b>What this still can't tell us → next: How it all connects.</b> We have a dozen checks. Are they separate tools, or do they grow from the same two quantities?</div>

  <h2 id="rd-connect"><span class="num">11</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Leverage, standardised and studentised residuals, RESET, Durbin–Watson, Breusch–Pagan, HC3, Q-Q, VIF, Cook's D, the omitted-variable formula: a list to memorise, or a few quantities reused again and again?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 360" width="680">
<defs><marker id="rd-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="60" y="10" width="200" height="44" rx="7" class="fb sb"/><text x="160" y="29" text-anchor="middle" font-size="11.5" font-weight="700">residuals e = (I − H)y</text><text x="160" y="45" text-anchor="middle" class="tm" font-size="10">+2, 0, −1, −2, −3, +4</text>
<rect x="420" y="10" width="200" height="44" rx="7" class="fb sb"/><text x="520" y="29" text-anchor="middle" font-size="11.5" font-weight="700">leverage hᵢ = Hᵢᵢ</text><text x="520" y="45" text-anchor="middle" class="tm" font-size="10">0.524 … 0.181; depends on X only</text>
<line x1="260" y1="32" x2="418" y2="32" stroke="currentColor" stroke-dasharray="4 3"/><text x="340" y="26" text-anchor="middle" class="tm" font-size="10">Var(eᵢ) = σ²(1 − hᵢ)</text>
<line x1="160" y1="54" x2="160" y2="88" stroke="currentColor" marker-end="url(#rd-a9)"/><line x1="520" y1="54" x2="380" y2="88" stroke="currentColor" marker-end="url(#rd-a9)"/>
<rect x="230" y="90" width="230" height="40" rx="7" class="ft st"/><text x="345" y="108" text-anchor="middle" font-size="11.5" font-weight="700">standardised / studentised r, t</text><text x="345" y="123" text-anchor="middle" class="tm" font-size="10">F: 1.99 / 15.9</text>
<line x1="160" y1="54" x2="300" y2="88" stroke="currentColor" marker-end="url(#rd-a9)"/>
<rect x="10" y="90" width="200" height="40" rx="7" class="ft st"/><text x="110" y="108" text-anchor="middle" font-size="11.5" font-weight="700">e against x or ŷ</text><text x="110" y="123" text-anchor="middle" class="tm" font-size="10">shape → linearity (RESET)</text>
<rect x="480" y="90" width="190" height="40" rx="7" class="ft st"/><text x="575" y="108" text-anchor="middle" font-size="11.5" font-weight="700">Cook's D = (r²/p)·h/(1−h)</text><text x="575" y="123" text-anchor="middle" class="tm" font-size="10">F: 2.17; G: 12.8</text>
<line x1="460" y1="110" x2="478" y2="110" stroke="currentColor" marker-end="url(#rd-a9)"/>
<line x1="110" y1="130" x2="80" y2="168" stroke="currentColor" marker-end="url(#rd-a9)"/><line x1="110" y1="130" x2="250" y2="168" stroke="currentColor" marker-end="url(#rd-a9)"/><line x1="110" y1="130" x2="420" y2="168" stroke="currentColor" marker-end="url(#rd-a9)"/>
<rect x="10" y="170" width="150" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="85" y="189" text-anchor="middle" font-size="11.5" font-weight="700">e in time order</text><text x="85" y="205" text-anchor="middle" class="tm" font-size="10">DW 56/34 = 1.65</text>
<rect x="175" y="170" width="150" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="250" y="189" text-anchor="middle" font-size="11.5" font-weight="700">e² on X</text><text x="250" y="205" text-anchor="middle" class="tm" font-size="10">BP 6 × 0.653 = 3.92</text>
<rect x="340" y="170" width="150" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="415" y="189" text-anchor="middle" font-size="11.5" font-weight="700">sorted e vs z</text><text x="415" y="205" text-anchor="middle" class="tm" font-size="10">Q-Q; Shapiro p 0.82</text>
<rect x="505" y="170" width="165" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="587" y="189" text-anchor="middle" font-size="11.5" font-weight="700">X only: VIF</text><text x="587" y="205" text-anchor="middle" class="tm" font-size="10">1/(1 − 0.938) = 16</text>
<line x1="85" y1="214" x2="85" y2="248" stroke="currentColor" marker-end="url(#rd-a9)"/><line x1="250" y1="214" x2="250" y2="248" stroke="currentColor" marker-end="url(#rd-a9)"/><line x1="587" y1="214" x2="587" y2="248" stroke="currentColor" marker-end="url(#rd-a9)"/>
<rect x="10" y="250" width="150" height="40" rx="7" class="fg sg"/><text x="85" y="268" text-anchor="middle" font-size="11" font-weight="700">HAC / GLSAR</text><text x="85" y="283" text-anchor="middle" class="tm" font-size="10">dependence</text>
<rect x="175" y="250" width="150" height="40" rx="7" class="fg sg"/><text x="250" y="268" text-anchor="middle" font-size="11" font-weight="700">HC3 / WLS / log y</text><text x="250" y="283" text-anchor="middle" class="tm" font-size="10">0.35 → 0.70</text>
<rect x="505" y="250" width="165" height="40" rx="7" class="fg sg"/><text x="587" y="268" text-anchor="middle" font-size="11" font-weight="700">drop / centre / ridge</text><text x="587" y="283" text-anchor="middle" class="tm" font-size="10">size² VIF 57.7 → 1</text>
<rect x="340" y="250" width="150" height="40" rx="7" class="fg sg"/><text x="415" y="268" text-anchor="middle" font-size="11" font-weight="700">add size² (next note)</text><text x="415" y="283" text-anchor="middle" class="tm" font-size="10">SSE 34 → 9.9</text>
<path d="M190 130 C 300 140, 332 150, 332 190 L 332 238 L 344 250" fill="none" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#rd-a9)"/>
<rect x="120" y="310" width="440" height="40" rx="7" class="fr sr"/><text x="340" y="328" text-anchor="middle" font-size="11.5" font-weight="700">invisible to all of the above: omitted variables</text><text x="340" y="343" text-anchor="middle" font-size="10">short slope = β₁ + β₂δ: 7.0 = 6.21 + 2.92 × 0.271</text>
</svg><figcaption>Two quantities feed almost every check. The residuals e (what the line missed) give the shape, order, spread and distribution checks; the leverage h (how unusual each row's x is, from X alone) rescales them and, combined with them, gives Cook's D. VIF looks at X only. Each check points to its fix (green). Omitted-variable bias leaves no trace in either quantity.</figcaption></figure>
  <table class="tbl"><caption>Every check on the same six houses</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers</th><th>Our houses</th><th>Use when</th></tr>
    <tr><td>Residual e</td><td>y − ŷ</td><td>what did the line miss?</td><td>+2, 0, −1, −2, −3, +4</td><td>always</td></tr>
    <tr><td>Leverage h</td><td>1/n + (x − x̄)²/S_xx (diag of H)</td><td>how unusual is the row's x?</td><td>A, F 0.524; C, D 0.181</td><td>before trusting any residual</td></tr>
    <tr><td>Standardised r</td><td>e / (s√(1 − h))</td><td>residual on a common scale?</td><td>F 1.99</td><td>plots, Cook's D</td></tr>
    <tr><td>Studentised t</td><td>e / (s₍ᵢ₎√(1 − h))</td><td>is this row an outlier?</td><td>F 15.9</td><td>outlier flags</td></tr>
    <tr><td>F-test / RESET</td><td>SSE with and without extra terms</td><td>is the shape wrong?</td><td>F 7.31, p 0.074</td><td>linearity</td></tr>
    <tr><td>Durbin–Watson</td><td>Σ(eₜ − eₜ₋₁)²/Σe²</td><td>do neighbours' errors move together?</td><td>1.65</td><td>ordered rows</td></tr>
    <tr><td>Breusch–Pagan</td><td>n·R² of e² on X</td><td>is the spread constant?</td><td>3.92, p 0.048 → 0.43 after size²</td><td>before quoting SEs/PIs</td></tr>
    <tr><td>HC0 / HC3 SE</td><td>Σ(x − x̄)²e²/S_xx² (÷(1 − h)²)</td><td>SE without equal variance?</td><td>0.346 / 0.696 (classic 0.348)</td><td>any doubt about variance</td></tr>
    <tr><td>Q-Q, Shapiro</td><td>sorted e vs normal quantiles</td><td>bell-shaped errors?</td><td>near the line, p 0.82</td><td>prediction intervals</td></tr>
    <tr><td>VIF</td><td>1/(1 − R²ⱼ) from X only</td><td>can the data separate the columns?</td><td>size–rooms 16; size–size² 57.7 → 1</td><td>interpreting coefficients</td></tr>
    <tr><td>Cook's D</td><td>(r²/p)·h/(1 − h)</td><td>does one row control the fit?</td><td>F 2.17; added G 12.8</td><td>every fit</td></tr>
    <tr><td>OVB formula</td><td>β₁ + β₂δ</td><td>is a missing column biasing us?</td><td>7.0 = 6.21 + 2.92 × 0.271</td><td>causal or "effect" claims</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>diagnostics interrogate the residuals (what the model missed) and the leverages (where the model is fragile) to decide whether the uncertainty numbers of the fit can be believed.</strong> Because many checks read the same residuals, one cause (a missing curve) can trip several alarms at once (the smile, RESET, Breusch–Pagan, F's Cook's D), and one fix can silence them all.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Tests &amp; fixes at a glance.</b> A single table to look up, for each assumption, the plot, the test and the fix.</div>

  <h2 id="rd-table"><span class="num">12</span>Tests &amp; Fixes at a Glance</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In the middle of a real analysis, which plot, which statsmodels test and which fix belong to which assumption, and how do robust SEs, WLS and transforms differ?</p>
  </div>
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
    <tr><td>Changes coefficients?</td><td>no</td><td>yes (houses: 7 → 6.73)</td><td>yes (new scale)</td></tr>
    <tr><td>Needs a model of the variance?</td><td>no</td><td>yes</td><td>implicitly</td></tr>
    <tr><td>Efficiency</td><td>OLS (not best)</td><td>best if weights right</td><td>good if the process is multiplicative</td></tr>
    <tr><td>Fixes prediction intervals?</td><td>no</td><td>yes (with right weights)</td><td>yes</td></tr>
    <tr><td>Interpretation</td><td>unchanged</td><td>unchanged</td><td>percentages / elasticities</td></tr>
  </table>
  <table class="tbl"><caption>This note vs its siblings</caption>
    <tr><th>Note</th><th>Role</th><th>Hand-off</th></tr>
    <tr><td><a class="xref" data-note="ml_regression">Linear Regression</a></td><td>fit the model, compute SEs</td><td>gives this note the residuals and the hat matrix</td></tr>
    <tr><td>Assumptions &amp; Diagnostics</td><td>decide whether the fit and its SEs can be trusted</td><td>points to the right fix</td></tr>
    <tr><td><a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis</a></td><td>fix non-linearity (the houses' smile)</td><td>re-check here after adding terms (centre them: VIF)</td></tr>
    <tr><td><a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a></td><td>fix unstable weights from collinearity (size and rooms)</td><td>trades a little bias for stability; classic p-values no longer apply</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: Common mistakes.</b> The tools are clear; the classic ways to misuse them are worth listing.</div>

  <h2 id="rd-traps"><span class="num">13</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which wrong beliefs about assumptions and diagnostics come up most often in interviews and in real analyses?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: "heteroscedasticity biases the coefficients"</span>
    <p>It does not. It breaks SEs, p-values, intervals and efficiency. Only non-linearity and endogeneity bias the coefficients.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: testing normality of y or x</span>
    <p>The assumption is about the errors. Check the residuals' Q-Q plot.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: trusting tests over plots</span>
    <p>With 6 rows no test can reject reliably (the houses' smile: p = 0.07); with 100,000 rows every test rejects trivial departures. Plots show the size and kind of the problem.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: fixing variance before shape</span>
    <p>The houses' Breusch–Pagan p = 0.048 vanished (p = 0.43) once size² was added. Fix the functional form first, then test the variance.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: deleting outliers to improve the fit</span>
    <p>Investigate first; delete only with a documented reason (data error, different population). House F is influential because it shows the curve; deleting it would hide the truth.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: assuming Huber regression handles leverage</span>
    <p>Case C: Huber slope 3.75, same as OLS (3.82). High-leverage points pull the line to themselves. Use RANSAC, Theil–Sen, or fix the data.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: dropping a "non-significant" collinear feature as useless</span>
    <p>Bedrooms had p = 0.63 alongside size while the pair was jointly significant (p = 0.0009); the sensors at scale had VIF 6,710 and insignificant coefficients while the model explained 90% of the variance. Test the pair jointly (F-test) or combine them.</p>
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
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet.</b> Time to compress the whole note into one page.</div>

  <h2 id="rd-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: six houses sold one a month, size (hundreds of sq ft) 6, 8, 10, 12, 14, 16, bedrooms 1, 2, 2, 3, 3, 4, price (lakh) 28, 40, 53, 66, 79, 100. Fitted line price = −16 + 7·size, residuals +2, 0, −1, −2, −3, +4, s² = 8.5.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>Answer on our houses</th><th>Weakness → next</th></tr>
    <tr><td>Assumptions (LINE + rank)</td><td>when can SEs be trusted?</td><td>only L (+ exogeneity) biases w</td><td>errors invisible</td></tr>
    <tr><td>Residuals &amp; leverage</td><td>what do we inspect?</td><td>h 0.524 at A, F; t_F 15.9</td><td>is there a pattern?</td></tr>
    <tr><td>Linearity</td><td>right shape?</td><td>smile; size² SSE 34 → 9.9, F 7.3, p 0.07</td><td>do errors depend on each other?</td></tr>
    <tr><td>Independence</td><td>neighbours related?</td><td>DW 1.65 (fine)</td><td>equal spread?</td></tr>
    <tr><td>Equal variance</td><td>constant spread?</td><td>BP 3.92, p 0.048 → 0.43 after size²</td><td>bell-shaped?</td></tr>
    <tr><td>Normality</td><td>bell-shaped?</td><td>Q-Q fine, Shapiro p 0.82</td><td>what about the columns?</td></tr>
    <tr><td>Multicollinearity</td><td>columns separable?</td><td>VIF 16; se(size) 0.35 → 1.54; rooms p 0.63</td><td>one row in control?</td></tr>
    <tr><td>Influence</td><td>one row decides?</td><td>F: D 2.17; G: D 12.8, slope 7 → 3.8</td><td>invisible bias?</td></tr>
    <tr><td>Omitted variables</td><td>missing column biasing?</td><td>7.0 = 6.21 + 2.92 × 0.271</td><td>run all together</td></tr>
    <tr><td>Workflow</td><td>order, interactions?</td><td>size² clears RESET, BP together</td><td>fit the curve → Polynomial</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>Residual variance</td><td>Var(eᵢ) = σ²(1 − hᵢ)</td><td>hᵢ = Hᵢᵢ, H = X(XᵀX)⁻¹Xᵀ</td></tr>
    <tr><td>Leverage (one feature)</td><td>hᵢ = 1/n + (xᵢ − x̄)²/S_xx; Σhᵢ = p</td><td>flag h &gt; 2p/n</td></tr>
    <tr><td>Standardised, studentised</td><td>rᵢ = eᵢ/(s√(1 − hᵢ)); tᵢ = rᵢ√((n − p − 1)/(n − p − rᵢ²))</td><td>s from all rows; t uses s without row i</td></tr>
    <tr><td>Nested F (and RESET)</td><td>F = [(SSE_small − SSE_big)/q] / [SSE_big/(n − p_big)]</td><td>q = added columns</td></tr>
    <tr><td>Durbin–Watson</td><td>DW = Σₜ₌₂(eₜ − eₜ₋₁)² / Σeₜ²; ≈ 2(1 − ρ̂)</td><td>≈ 2 fine, → 0 positive, → 4 negative autocorrelation</td></tr>
    <tr><td>Breusch–Pagan</td><td>LM = n·R²(e² ~ X) ~ χ²(k)</td><td>k features</td></tr>
    <tr><td>HC0 SE (one feature)</td><td>√(Σ(xᵢ − x̄)²eᵢ² / S_xx²); HC3 uses eᵢ²/(1 − hᵢ)²</td><td>no common σ² needed</td></tr>
    <tr><td>WLS</td><td>minimise Σwᵢeᵢ², wᵢ = 1/σᵢ²</td><td>needs a variance model</td></tr>
    <tr><td>Q-Q, JB</td><td>sorted r vs Φ⁻¹((i − 0.5)/n); JB = (n/6)(S² + (K − 3)²/4)</td><td>S skew, K kurtosis</td></tr>
    <tr><td>VIF</td><td>VIFⱼ = 1/(1 − R²ⱼ); se ∝ √VIF</td><td>R²ⱼ of xⱼ on the other features</td></tr>
    <tr><td>Cook's D, DFFITS</td><td>D = (r²/p)·h/(1 − h); DFFITS = t√(h/(1 − h))</td><td>D &gt; 4/n look, &gt; 1 serious</td></tr>
    <tr><td>Omitted-variable bias</td><td>β₁,short = β₁ + β₂δ</td><td>δ = slope of x₂ on x₁</td></tr>
  </table>
  <h3>The running example's numbers</h3>
  <table class="tbl">
    <tr><th>House</th><th>e</th><th>h</th><th>r</th><th>t</th><th>Cook's D</th></tr>
    <tr><td>A</td><td>+2</td><td>0.524</td><td>0.99</td><td>0.99</td><td>0.54</td></tr>
    <tr><td>B</td><td>0</td><td>0.295</td><td>0</td><td>0</td><td>0</td></tr>
    <tr><td>C</td><td>−1</td><td>0.181</td><td>−0.38</td><td>−0.33</td><td>0.02</td></tr>
    <tr><td>D</td><td>−2</td><td>0.181</td><td>−0.76</td><td>−0.71</td><td>0.06</td></tr>
    <tr><td>E</td><td>−3</td><td>0.295</td><td>−1.23</td><td>−1.34</td><td>0.31</td></tr>
    <tr><td>F</td><td>+4</td><td>0.524</td><td>1.99</td><td>15.9</td><td>2.17</td></tr>
  </table>
  <p>Also: size² F 7.31 (p 0.074, = RESET); DW 1.65; BP LM 3.92 (p 0.048), 1.70 (p 0.43) after size²; SE classic 0.348, HC0 0.346, HC3 0.696; Shapiro p 0.82; VIF 16.0; with rooms se(size) 1.54, rooms p 0.63, joint p 0.0009; G at 3,000 sq ft: h 0.842, D 12.8, slope 3.82 (Huber 3.75, RANSAC 7.0).</p>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Plots first</b><p>Residuals vs fitted and vs each feature, Q-Q, residuals vs order, residuals vs leverage. They show the kind and size of a problem.</p><small>Tests only confirm</small></div>
    <div><b>Tests second</b><p>RESET, DW / Breusch–Godfrey, BP / White, Shapiro / JB, VIF, Cook's D. Weak with tiny n, over-eager with huge n.</p><small>Read p-values with n in mind</small></div>
    <div><b>Prediction only</b><p>Care about linearity, influential rows and stability over time; normality and VIF matter little.</p><small>Unless you quote intervals</small></div>
    <div><b>Inference / causal</b><p>Every assumption matters, and exogeneity most of all; diagnostics cannot prove it.</p><small>Design, not diagnostics</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Heteroscedasticity does not bias coefficients; test residuals, not y; fix the shape before the variance; never delete rows just for a cleaner fit; Huber does not handle leverage; "insignificant" collinear features may be jointly vital; DW needs the true order; compare R² only on the same target; clean residuals do not prove causation.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>x = 6, 8, …, 16: leverage of the 6?</td><td>1/6 + 25/70 = 0.524</td></tr>
    <tr><td>Residuals 2, 0, −1, −2, −3, 4: Durbin–Watson?</td><td>(4 + 1 + 1 + 1 + 49)/34 = 1.65</td></tr>
    <tr><td>r = 1.988, h = 0.524, p = 2: Cook's D?</td><td>(3.952/2) × 1.10 = 2.17</td></tr>
    <tr><td>Correlation 0.968 between two features: VIF?</td><td>1/(1 − 0.938) ≈ 16</td></tr>
    <tr><td>Which assumption failures bias the coefficients?</td><td>Only linearity and exogeneity (omitted variables, measurement error, reverse causality)</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: Questions &amp; answers.</b> Test yourself before moving on to <a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a>.</div>

  <h2 id="rd-qa"><span class="num">14</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you run each check by hand on six residuals, and explain why each one needs the one before it?</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>List the linear regression assumptions and say which ones bias the coefficients.</summary><div class="qa-body">Linearity (with exogeneity E[ε|X] = 0), independence of errors, equal error variance, normality of errors, no perfect multicollinearity. Only failures of linearity/exogeneity bias the coefficients. Dependence and heteroscedasticity break SEs and efficiency; non-normality affects small-sample tests and prediction intervals; perfect collinearity makes the solution non-unique, high collinearity inflates SEs.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is leverage? Compute it for x = 6, 8, 10, 12, 14, 16.</summary><div class="qa-body">Leverage hᵢ is the i-th diagonal of the hat matrix: how much yᵢ influences its own fitted value, determined only by how unusual xᵢ is. With one feature hᵢ = 1/n + (xᵢ − x̄)²/S_xx = 1/6 + (x − 11)²/70 → 0.524, 0.295, 0.181, 0.181, 0.295, 0.524. They sum to p = 2; the average is p/n; flag h &gt; 2p/n.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why standardise or studentise residuals instead of using raw ones?</summary><div class="qa-body">Var(eᵢ) = σ²(1 − hᵢ), so high-leverage points have artificially small raw residuals. Standardised rᵢ = eᵢ/(s√(1 − hᵢ)) puts all residuals on a common scale; externally studentised residuals also re-estimate s without row i so an outlier cannot hide by inflating s (house F: raw +4, standardised 1.99, studentised 15.9, because A–E alone lie almost on a line).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The residuals are +2, 0, −1, −2, −3, +4 with R² = 0.990. Is the line fine?</summary><div class="qa-body">No: positive at both ends and negative in the middle is a smile, the sign of a missing curve. R² cannot detect shape. Adding size² cuts SSE from 34 to 9.89 (F = 7.31, p = 0.074 with six rows; RESET gives the same). At scale the same pattern gives RESET p = 0.0000.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compute Durbin–Watson for residuals 2, 0, −1, −2, −3, 4 and interpret.</summary><div class="qa-body">Squared successive differences: 4 + 1 + 1 + 1 + 49 = 56. Σe² = 34. DW = 1.65, in the healthy band around 2: no first-order autocorrelation. With strong positive autocorrelation DW falls toward 0 (0.50 in the AR(1) simulation), and classic SEs become far too small.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through the Breusch–Pagan test.</summary><div class="qa-body">Fit OLS, square the residuals, regress e² on the features, take that R², compute LM = n·R², compare with χ² with k df. Houses: e² = 4, 0, 1, 4, 9, 16, aux R² = 0.653, LM = 6 × 0.653 = 3.92 &gt; 3.84, p = 0.048. After adding size², p = 0.43: the apparent fan was the curve. White's test adds squares and cross-products to the auxiliary regression.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Heteroscedasticity found. What are your options and how do they differ?</summary><div class="qa-body">(1) Robust HC SEs (HC3 for small n): same coefficients, valid inference, no variance model needed (houses: 0.348 → 0.696). (2) WLS with weights 1/σᵢ²: more efficient and better intervals if the variance model is right. (3) Transform y (log) when the noise is multiplicative; changes interpretation to percentages. In the coverage simulation classic CIs covered 88.6%, HC3 and WLS 94.3%.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you read a Q-Q plot, and how much does non-normality matter?</summary><div class="qa-body">Sorted standardised residuals vs normal quantiles at (i − 0.5)/n. On the line = normal; S-shape = heavy tails; bowed = skew; isolated end points = outliers. Coefficient CIs are robust to non-normal errors in moderate samples (95.0% coverage even at n = 10 in the skewed simulation), but prediction intervals are not: they missed only on one side.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Define VIF and compute it for size and bedrooms (correlation 0.968).</summary><div class="qa-body">VIFⱼ = 1/(1 − R²ⱼ), R²ⱼ from regressing xⱼ on the other features. With two features R² = r² = 361/385 = 0.938, VIF = 16 and SEs are inflated by √16 = 4 (size: 0.35 alone → 1.54 with bedrooms). Concern above 5–10. Predictions and R² are unaffected; individual coefficients become unstable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Outlier vs high leverage vs influential?</summary><div class="qa-body">Outlier: unusual y given x (large studentised residual). High leverage: unusual x (large hᵢ). Influential: deleting it changes the fit, which needs both. A 3,000 sq ft flat on the line (case B) has leverage 0.84 but Cook's D 0; the same flat sold at 120 lakh (case C) has D 12.8 and turns the slope from 7.0 to 3.8.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Give the formula for Cook's distance and compute it for house F (r = 1.988, h = 0.524, p = 2).</summary><div class="qa-body">Dᵢ = (rᵢ²/p)·hᵢ/(1 − hᵢ) = (3.952/2) × (0.524/0.476) = 1.976 × 1.10 = 2.17. It measures how far all fitted values move when row i is deleted, scaled by p·s². Look at points with D &gt; 4/n; D &gt; 1 is very influential.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why didn't Huber regression fix the high-leverage point?</summary><div class="qa-body">Huber down-weights rows by the size of their residual. A high-leverage point pulls the fitted line toward itself, so its own residual stays moderate and it keeps full weight (RLM weight 1.0 for G), while other rows look worse (F down-weighted to 0.81). Leverage needs high-breakdown methods (RANSAC recovered slope 7.0, Theil–Sen, LTS) or a data fix.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the direction of omitted-variable bias.</summary><div class="qa-body">If y = β₀ + β₁x₁ + β₂x₂ + ε and x₂ is omitted, E[β̂₁,short] = β₁ + β₂δ with δ the slope of x₂ on x₁. The sign of the bias is sign(β₂)·sign(δ). Houses: 6.21 + 2.92 × 0.271 = 7.0 (bedrooms omitted). Wage example: β₂ = 3, δ = 0.25 → education's slope 1.75 instead of 1.0. More data does not shrink it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why must you fix linearity before testing equal variance?</summary><div class="qa-body">Both tests read the same residuals. A missing curve makes residuals large at the ends of the range, which looks like variance growing with x. The houses' Breusch–Pagan p went from 0.048 to 0.43 after adding size². Test the variance on a model with the right shape.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does every residual check need leverage?</summary><div class="qa-body">Because Var(eᵢ) = σ²(1 − hᵢ): residuals at high-leverage rows are squeezed toward zero by the fit itself. Without dividing by √(1 − hᵢ) (standardising), house F's +4 would look like an ordinary miss; with it, and with s re-estimated without F, it is a 15.9 studentised residual and a Cook's D of 2.17. HC2/HC3 robust SEs use the same correction.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: which sibling note do you go to for each failed check?</summary><div class="qa-body">Curved residuals / RESET (the houses' smile) → Polynomial &amp; Basis Functions (x², splines, interactions). High VIF with coefficients you need to be stable (size and bedrooms) → Ridge, Lasso &amp; Elastic Net. Autocorrelated residuals → Time Series and ARIMA (and time-based CV from the splits note). How big the remaining error is → Regression Metrics.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: where in the statsmodels summary from Linear Regression do these diagnostics appear?</summary><div class="qa-body">Durbin–Watson (1.647 for the houses), Omnibus and Jarque–Bera with Prob, Skew and Kurtosis (normality), Cond. No. (collinearity; a warning is printed when large), and Covariance Type (nonrobust vs HC0–HC3/HAC for heteroscedasticity or autocorrelation). Leverage and Cook's D come from <code>get_influence()</code>; BP, White, RESET from <code>statsmodels.stats.diagnostic</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You only care about prediction accuracy. Which diagnostics still matter?</summary><div class="qa-body">Linearity (wrong shape = worse predictions; check residual plots and compare with a flexible model), influential points (one bad row can tilt everything), and stability over time (autocorrelation and drift; validate with time-ordered splits). Heteroscedasticity and normality matter only if you report prediction intervals; multicollinearity barely matters unless the correlation pattern changes in new data.</div></details>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a>.</b> The houses' strongest finding is the smile: the line is the wrong shape, and F is influential because it shows the curve. The next note keeps all of linear regression's machinery and fits that curve with a size² column, then asks how far the idea can go.</div>
</main>
`
});
