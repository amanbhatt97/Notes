// notes/ml/ml_reg_diag.js — Assumptions & Diagnostics
Object.assign(TOPIC_CONTENT, {
  "ml_reg_diag": `<main>
  <h1>Assumptions &amp; Diagnostics</h1>
  <div class="where"><span>Machine Learning</span><span>Regression</span><span>Assumptions &amp; Diagnostics</span></div>
  <p class="lead">Least squares always returns a line, even when a line is the wrong model, and statsmodels always prints standard errors and p-values, even when they are badly wrong. Diagnostics are the checks that tell you whether those numbers deserve trust. This matters in real work because a confident but wrong interval leads to wrong prices, wrong business decisions and "significant" effects that do not exist, and nothing in the output warns you. We will go through the classic assumptions behind linear regression one at a time, and for each ask what breaks when it fails, how to detect it (with every test computed by hand) and how to fix it; then we will look at single points that control the fit, and at the one problem no residual plot can show. The running example is the same six flats as in <a class="xref" data-note="ml_regression">Linear Regression</a>, whose fitted line price = −16 + 7 × size left the residuals +2, 0, −1, −2, −3, +4.</p>

  <h2 id="rd-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Assumptions &amp; Diagnostics</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The assumptions</div>
        <ul>
          <li>Linearity (and nothing important left out): only these bias the coefficients</li>
          <li>Independence, equal variance, normality: break SEs, p-values, intervals</li>
          <li>No perfect multicollinearity: otherwise no unique answer</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Detect</div>
        <ul>
          <li>Residuals vs fitted: curve (linearity), fan (variance)</li>
          <li>RESET, Durbin–Watson, Breusch–Pagan, Q-Q plot, VIF</li>
          <li>Leverage, studentised residuals, Cook's distance</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Fix</div>
        <ul>
          <li>Curve → x², log, splines, interactions; fix shape first</li>
          <li>Fan → HC3 robust SEs, WLS, log y; correlated rows → HAC, cluster, GLS</li>
          <li>Collinearity → drop, combine, centre, ridge</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The six flats</div>
        <ul>
          <li>Residual smile; adding size² clears RESET and Breusch–Pagan</li>
          <li>Size and bedrooms: VIF 16; F: Cook's D 2.17</li>
          <li>Omitting bedrooms: 6.21 becomes 7.0</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="rd-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Diagnose</span><span class="rm-sub">the assumptions and what each one buys</span></div></div>
      <div class="rm-item rm-done" data-target="rd-resid"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Residuals and Leverage</span><span class="rm-sub">the raw material of every check</span></div></div>
      <div class="rm-item rm-done" data-target="rd-lin"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Linearity</span><span class="rm-sub">is a straight line the right shape?</span></div></div>
      <div class="rm-item rm-done" data-target="rd-ind"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Independence of Errors</span><span class="rm-sub">Durbin–Watson and correlated rows</span></div></div>
      <div class="rm-item rm-done" data-target="rd-het"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Equal Variance</span><span class="rm-sub">Breusch–Pagan, robust SEs, WLS</span></div></div>
      <div class="rm-item rm-done" data-target="rd-norm"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Normality of Errors</span><span class="rm-sub">Q-Q plots and what really breaks</span></div></div>
      <div class="rm-item rm-done" data-target="rd-mc"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Multicollinearity</span><span class="rm-sub">VIF and twin columns</span></div></div>
      <div class="rm-item rm-done" data-target="rd-infl"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Outliers, Leverage and Influence</span><span class="rm-sub">Cook's distance and robust regression</span></div></div>
      <div class="rm-item rm-done" data-target="rd-endo"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Omitted Variables and Endogeneity</span><span class="rm-sub">the bias no plot can show</span></div></div>
      <div class="rm-item rm-done" data-target="rd-flow"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">A Full Diagnostic Workflow</span><span class="rm-sub">every check, one fix, re-check</span></div></div>
      <div class="rm-item rm-done" data-target="rd-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">wrong beliefs about the assumptions</span></div></div>
      <div class="rm-item rm-done" data-target="rd-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">tests, formulas and fixes at a glance</span></div></div>
      <div class="rm-item rm-done" data-target="rd-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask on diagnostics</span></div></div>
    </div>
  </div>

  <h2 id="rd-why"><span class="num">01</span>Why Diagnose</h2>
  <p><a class="xref" data-note="ml_regression">Linear Regression</a> ended with confident numbers for the six flats: slope 7 lakh per 100 sq ft, p = 0.00004, 95% confidence interval [6.03, 7.97], and a price range of 66 to 84 lakh for a new 1,300 sq ft flat. The dealer will set asking prices from these. But every one of them came from formulas that quietly assumed things about the errors ε, the part of each price the line cannot explain. If prices actually bend upward for big flats, or the market was rising month by month while the flats were sold, the true uncertainty could be much larger and the line could be systematically wrong for the biggest flats. The output looks exactly the same either way.</p>
  <p>Think of a fitted model as a photo of a patient. R² = 0.990 says the patient looks healthy. Diagnostics are the X-ray and the blood test: most of the time they confirm the photo, and sometimes they reveal a fracture you could never have seen from outside. <strong>Regression diagnostics</strong> are checks on the residuals and on the table of features X that test whether the assumptions behind least-squares inference hold, and whether a few rows control the whole fit.</p>
  <p>The model is y = Xw + ε, and the classic assumptions are about X and ε. They are often remembered as LINE plus one: <strong>L</strong>inearity, <strong>I</strong>ndependence, <strong>N</strong>ormality, <strong>E</strong>qual variance, plus no perfect multicollinearity.</p>
  <table class="tbl">
    <tr><th>Assumption</th><th>In plain words</th><th>If it fails</th><th>Coefficients biased?</th></tr>
    <tr><td>Linearity (and exogeneity)</td><td>the average of y really is a weighted sum of these columns, and nothing left out is correlated with them</td><td>systematic errors; wrong coefficients and predictions</td><td>yes</td></tr>
    <tr><td>Independence</td><td>one row's error says nothing about another's</td><td>SEs too small, p-values too small</td><td>no</td></tr>
    <tr><td>Equal variance</td><td>errors have the same spread for every row</td><td>SEs wrong; OLS no longer the most precise</td><td>no</td></tr>
    <tr><td>Normality</td><td>errors follow a bell curve</td><td>small-sample tests slightly off; prediction intervals the wrong shape</td><td>no</td></tr>
    <tr><td>No perfect multicollinearity</td><td>no column is an exact combination of others</td><td>no unique answer (if perfect); huge SEs (if nearly)</td><td>no, but unstable</td></tr>
  </table>
  <p>The last column is the most important thing on this page. Only a wrong shape or a missing variable makes the coefficients themselves wrong. The other failures leave the coefficients fine on average but make the statements about uncertainty (standard errors, p-values, intervals) wrong. That is why which checks matter depends on your goal. If you only want accurate predictions, linearity matters most, and normality, equal variance and multicollinearity barely matter. If you want to say "size matters, by this much, with this confidence", all of them matter. If you want a price range for one flat, equal variance and normality matter because they set the width and shape of the interval. And if you want to claim that adding a bedroom <em>causes</em> a price rise, the missing-variable problem of section 09 dominates everything.</p>
  <p>One common misunderstanding is worth clearing up immediately: the normality assumption is about the errors, not about x or y. A very skewed feature like income is perfectly fine, and the six prices 28 to 100 do not need to look like a bell curve. What should look roughly normal are the residuals.</p>

  <h2 id="rd-resid"><span class="num">02</span>Residuals and Leverage</h2>
  <p>The true errors are invisible, because we never know the true line. All we can look at are the residuals eᵢ = yᵢ − ŷᵢ from our fitted line, which are our estimates of the errors. Every diagnostic in this note is built from them. But there is a subtlety: the six residuals are not equally trustworthy, even if the true errors all have the same spread. The line is fitted to the same points it is judged on, so it bends toward each point, and it bends toward points with unusual x values most of all.</p>
  <p>Picture a ruler balanced on a pencil at its middle. Press near the pencil and the ruler hardly tilts; press at the end and it swings. A least-squares line pivots around the point of averages in the same way, so flats at the extreme sizes can pull it toward themselves much more than flats in the middle. This pulling power is called <strong>leverage</strong>, written hᵢ, and it is the i-th diagonal entry of the hat matrix from <a class="xref" data-note="ml_regression">Linear Regression</a>. For one feature it has a simple formula: hᵢ = 1/n + (xᵢ − x̄)²/S_xx. For our flats, n = 6, x̄ = 11 and S_xx = 70, so the end flats A and F get 1/6 + 25/70 = 0.524, B and E get 0.295, and the middle flats C and D only 0.181. Leverages always add up to the number of parameters p (here 2), so the average is p/n = 0.333. Notice that leverage depends only on x, not on the price.</p>
  <p>Because the line leans toward high-leverage points, their residuals are squeezed: if the errors all have variance σ², a residual has variance σ²(1 − hᵢ), smaller for high-leverage rows. So raw residuals cannot be compared directly. Two corrected versions fix this. The <strong>standardised residual</strong> divides each residual by its own standard deviation, rᵢ = eᵢ/(s√(1 − hᵢ)), where s = √(34/4) = 2.92 is the estimated noise from the fit. For F, 4/(2.92 × √0.476) = 1.99. The <strong>studentised residual</strong> goes one step further: it re-estimates s without row i, so that an outlier cannot hide by inflating the noise estimate. statsmodels computes all of them at once:</p>
  <div class="fx" data-lang="py">import numpy as np
import statsmodels.api as sm
x = np.array([6, 8, 10, 12, 14, 16], dtype=float)        # size, hundreds of sq ft (flats A-F)
y = np.array([28, 40, 53, 66, 79, 100], dtype=float)     # price, lakh rupees
fit = sm.OLS(y, sm.add_constant(x)).fit()                # price = -16 + 7 * size
infl = fit.get_influence()
print("residual e     :", fit.resid.round(3) + 0.0)
print("leverage h     :", infl.hat_matrix_diag.round(3), " sum =", round(infl.hat_matrix_diag.sum(), 3))
print("standardised r :", infl.resid_studentized_internal.round(3) + 0.0)
print("studentised t  :", infl.resid_studentized_external.round(3) + 0.0)</div>
  <div class="fx" data-lang="text">residual e     : [ 2.  0. -1. -2. -3.  4.]
leverage h     : [0.524 0.295 0.181 0.181 0.295 0.524]  sum = 2.0
standardised r : [ 0.994  0.    -0.379 -0.758 -1.226  1.988]
studentised t  : [ 0.992  0.    -0.334 -0.709 -1.343 15.875]</div>
  <p>The leverages and standardised residuals match the hand values. Look at F's studentised residual: 15.9. Why so huge, when its raw residual is just 4? Without F, flats A to E lie almost exactly on a line (price = −10.8 + 6.4 × size, with residuals of at most 0.4 lakh), and that line predicts 91.6 for F, which actually sold for 100. Measured against that tiny noise, F is wildly off. As a rough rule, a studentised residual beyond ±2 (or ±3 in large datasets) flags an outlier. F's raw residual of +4 looked ordinary; only the corrected version shows how unusual it is. That is why diagnostics use studentised residuals and leverage together.</p>
  <p>The most useful single picture is a plot of residuals against fitted values. If the model is right, it should look like a shapeless horizontal band around zero. Each kind of failure leaves its own fingerprint:</p>
<figure class="viz"><svg viewBox="0 0 570 150" width="570">
<line x1="10" y1="75" x2="130" y2="75" stroke="currentColor" stroke-dasharray="3 3"/><line x1="150" y1="75" x2="270" y2="75" stroke="currentColor" stroke-dasharray="3 3"/><line x1="290" y1="75" x2="410" y2="75" stroke="currentColor" stroke-dasharray="3 3"/><line x1="430" y1="75" x2="550" y2="75" stroke="currentColor" stroke-dasharray="3 3"/>
<path d="M114 77h0M101 78h0M71 61h0M50 67h0M105 74h0M19 74h0M108 63h0M70 116h0M119 62h0M68 68h0M87 87h0M114 106h0M75 93h0M42 71h0M17 72h0M20 91h0M98 83h0M121 62h0M12 79h0M79 61h0M104 69h0M125 73h0M65 79h0M81 87h0M21 67h0M56 95h0M60 57h0M41 83h0M73 68h0M80 72h0M25 65h0M120 76h0M16 85h0M13 68h0M128 53h0M94 71h0M39 83h0M46 95h0M25 81h0M122 79h0M57 64h0M74 70h0M75 83h0M122 83h0M57 64h0M51 56h0M44 56h0M30 77h0M98 89h0M84 61h0M88 87h0M12 78h0M73 85h0M117 95h0M13 67h0M54 92h0M116 70h0M117 78h0M81 86h0M122 62h0" class="sb" stroke-width="4" stroke-linecap="round"/>
<path d="M251 83h0M262 49h0M200 98h0M261 49h0M265 51h0M166 59h0M267 50h0M230 85h0M260 60h0M224 94h0M201 109h0M177 70h0M170 75h0M238 84h0M183 80h0M262 50h0M203 93h0M228 92h0M194 100h0M184 93h0M238 85h0M238 77h0M150 42h0M262 54h0M213 100h0M201 93h0M225 97h0M203 97h0M219 96h0M159 54h0M249 77h0M257 66h0M160 50h0M186 90h0M173 76h0M177 81h0M231 81h0M216 100h0M221 95h0M172 66h0M194 87h0M263 57h0M182 79h0M151 45h0M256 66h0M213 101h0M158 46h0M165 58h0M255 56h0M226 87h0M181 79h0M246 72h0M231 76h0M215 98h0M179 79h0M245 86h0M152 45h0M270 35h0M157 50h0M237 95h0" class="sb" stroke-width="4" stroke-linecap="round"/>
<path d="M402 64h0M307 66h0M401 83h0M359 78h0M308 79h0M388 63h0M312 76h0M298 77h0M394 70h0M397 67h0M322 76h0M359 73h0M408 102h0M402 67h0M328 79h0M294 73h0M297 72h0M351 70h0M378 76h0M299 77h0M295 75h0M322 82h0M322 66h0M402 54h0M348 73h0M376 91h0M317 74h0M300 74h0M368 76h0M301 69h0M390 85h0M334 73h0M389 46h0M331 76h0M388 35h0M405 92h0M406 60h0M368 74h0M353 69h0M345 75h0M404 76h0M358 80h0M319 62h0M353 76h0M378 70h0M397 73h0M291 75h0M295 72h0M389 52h0M378 75h0M296 76h0M310 86h0M391 75h0M402 60h0M371 63h0M383 92h0M355 68h0M341 72h0M321 81h0M300 72h0" class="sb" stroke-width="4" stroke-linecap="round"/>
<path d="M430 69h0M432 72h0M434 79h0M436 82h0M438 72h0M440 59h0M442 64h0M444 52h0M446 67h0M448 58h0M450 74h0M452 72h0M454 94h0M456 103h0M458 79h0M460 61h0M462 71h0M464 65h0M466 64h0M469 64h0M470 74h0M472 73h0M475 60h0M476 81h0M478 83h0M481 76h0M482 98h0M485 104h0M487 107h0M488 95h0M491 92h0M493 70h0M495 87h0M497 86h0M499 84h0M501 71h0M503 83h0M505 77h0M507 73h0M509 72h0M511 81h0M513 75h0M515 70h0M517 73h0M519 81h0M521 68h0M523 64h0M525 62h0M527 59h0M529 47h0M531 66h0M534 70h0M536 65h0M537 69h0M540 52h0M542 77h0M543 83h0M546 90h0M548 84h0M550 68h0" class="sb" stroke-width="4" stroke-linecap="round"/>
<text x="70" y="18" text-anchor="middle" class="tg" font-size="13">healthy</text><text x="210" y="18" text-anchor="middle" class="tr" font-size="13">curve</text><text x="350" y="18" text-anchor="middle" class="tr" font-size="13">fan</text><text x="490" y="18" text-anchor="middle" class="tr" font-size="13">snake</text>
<text x="70" y="140" text-anchor="middle" class="tm" font-size="11">random band</text><text x="210" y="140" text-anchor="middle" class="tm" font-size="11">missing x² → §03</text><text x="350" y="140" text-anchor="middle" class="tm" font-size="11">variance grows → §05</text><text x="490" y="140" text-anchor="middle" class="tm" font-size="11">resid vs time → §04</text>
</svg><figcaption>Residuals (y-axis) against fitted values (or time, last panel) from four simulated datasets of a few hundred rows (the same idea at scale). Only the first leaves nothing to explain. Six flats are too few to look like any of these clearly; section 03 plots them.</figcaption></figure>
  <p>The first panel is healthy: a random band with no structure. The second bends in a curve, which means a missing x² or some other wrong shape (section 03). The third fans out, which means the noise grows with the prediction (section 05). The fourth plots residuals in time order and shows a slow snake, where neighbouring residuals look alike, which means the errors are not independent (section 04). Three other standard plots complete the set: a normal Q-Q plot for the shape of the errors (section 06), a scale-location plot of √|r| against fitted values for variance, and a residuals-versus-leverage plot for influential points (section 08). Six flats are too few to show any of these shapes clearly, so each section uses the flats for hand calculations and a simulated dataset to show the effect at scale.</p>

  <h2 id="rd-lin"><span class="num">03</span>Linearity</h2>
  <p>Linearity is the assumption that the average of y really is a weighted sum of the columns we gave the model. It comes first because it is the only one of the LINE assumptions whose failure biases the coefficients and the predictions. If the true price curve bends but we fit a straight line, the line over-predicts in some ranges and under-predicts in others, its slope describes an "average slope" that is true nowhere, and the residuals are not centred on zero at each size, which also spoils the standard errors.</p>
  <p>Now look at our residuals in order of size: +2, 0, −1, −2, −3, +4. Positive at both ends, negative in the middle. That is a smile, and random noise would not line up so neatly. The line under-prices the smallest and the largest flats and over-prices the middle ones, which is exactly what happens when the true price curve bends upward, so that each extra 100 sq ft adds a bit more than the last.</p>
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
</svg><figcaption>Residuals of the six flats. Red: from price = −16 + 7·size, with a dashed curve through them showing the smile. Blue: from the model with a size² column added, scattered around 0 without a shape.</figcaption></figure>
  <p>The red points are the residuals of the straight line, with a dashed curve through them showing the smile. The cure, developed fully in <a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a>, is to give the model a squared-size column. With centred size z = size − 11 and columns 1, z and z², the blue residuals scatter around zero with no pattern. Is the improvement more than luck? Two models where one contains the other can be compared with an <strong>extra-sum-of-squares F-test</strong>: F = [(SSE_line − SSE_quad)/1] / [SSE_quad/(n − 3)], the drop in error per extra parameter divided by the remaining error per degree of freedom. A related general-purpose test is <strong>Ramsey's RESET</strong>: if the model is right, powers of the fitted values such as ŷ² should add nothing, so RESET refits with ŷ² added and F-tests its coefficient. With a single feature, ŷ² is just a combination of 1, x and x², so on our flats RESET is exactly the size² test.</p>
  <div class="fx" data-lang="py">z = x - x.mean()                                          # centred size: -5 ... 5
quad = sm.OLS(y, sm.add_constant(np.c_[z, z ** 2])).fit() # add a squared-size column
print("line residuals:", fit.resid.round(2) + 0.0, " SSE", round(fit.ssr, 2))
print("with size^2   :", quad.resid.round(2) + 0.0, " SSE", round(quad.ssr, 2))
F = (fit.ssr - quad.ssr) / (quad.ssr / (6 - 3))           # extra-sum-of-squares F test
print(f"F = {F:.2f}  p = {stats.f.sf(F, 1, 3):.4f}   RESET p = {linear_reset(fit, power=2, use_f=True).pvalue:.4f}")

rng = np.random.default_rng(0)                            # the same idea with 200 rows
xb = rng.uniform(1, 10, 200); yb = 3 + 0.5 * xb ** 2 + rng.normal(0, 1, 200)
for name, X in [("straight line", sm.add_constant(xb)), ("line + x^2", sm.add_constant(np.c_[xb, xb ** 2]))]:
    f = sm.OLS(yb, X).fit()
    print(f"{name:13s} R2 = {f.rsquared:.3f}  RESET p = {linear_reset(f, power=2, use_f=True).pvalue:.4f}")</div>
  <div class="fx" data-lang="text">line residuals: [ 2.  0. -1. -2. -3.  4.]  SSE 34.0
with size^2   : [-0.68  0.54  1.14  0.14 -2.46  1.32]  SSE 9.89
F = 7.31  p = 0.0735   RESET p = 0.0735
straight line R2 = 0.954  RESET p = 0.0000
line + x^2    R2 = 0.996  RESET p = 0.1532</div>
  <p>Adding size² cuts SSE from 34 to 9.89, and F = (34 − 9.89)/(9.89/3) = 7.31 with p = 0.074; RESET gives the identical p. With only six flats this is suggestive rather than conclusive, while R² = 0.990 looked superb all along. The bottom two lines show the same idea at scale: 200 points from a true curve y = 3 + 0.5x². The straight line still has R² = 0.954, but now RESET's p-value is 0.0000; with x² added, RESET finds nothing more to explain (p = 0.15). Small samples can only hint; large samples decide. A high R² never proves the shape is right.</p>
  <p>In multiple regression, a curve in the residuals-versus-fitted plot says something is wrong but not which feature is to blame. Plot the residuals against each feature separately, or use a partial residual plot (wⱼxⱼ + e against xⱼ, <code>sm.graphics.plot_ccpr</code>): if one cloud bends, that feature needs a transform. A different kind of non-linearity is an <strong>interaction</strong>, where each feature is linear but the effect of one depends on another. If Metro flats gained 9 lakh per 100 sq ft and Old town flats only 6, one shared slope would be wrong for both; the fix is a product column such as size × is_Metro (in a formula, <code>price ~ size * C(locality)</code>).</p>
  <p>The fixes follow the shape. A U-shape or smile calls for x² or a spline. A curve that rises fast and then flattens (diminishing returns) calls for log x or √x. Growth that multiplies rather than adds calls for log y, as section 10 shows. A slope that differs by group calls for interactions. A complex unknown shape calls for splines, GAMs, or tree models such as <a class="xref" data-note="ml_gbm">Gradient Boosting</a>.</p>

  <h2 id="rd-ind"><span class="num">04</span>Independence of Errors</h2>
  <p>The standard-error formula assumes every row brings fresh, independent information. Data collected over time, space or groups often does not. If the market was drifting up while our six flats were sold from January to June, consecutive sales would miss the line in the same direction. Asking 100 different people for their opinion gives you 100 opinions; asking one person 100 times gives you one opinion repeated. Correlated errors are partly "the same person asked again", but the classic formula counts every row as new. The result is standard errors that are too small, t-statistics too large and p-values too small: you find "significant" effects that are really just drift. The coefficients themselves stay unbiased. This failure is called <strong>autocorrelation</strong> (or serial correlation) when rows are ordered in time, and it also appears in spatial data (flats on the same street) and grouped data (students in the same school, repeated visits by the same patient).</p>
  <p>The classic check for ordered data is the <strong>Durbin–Watson statistic</strong>, which compares each residual with the one before it: DW = Σ(eₜ − eₜ₋₁)² / Σeₜ². If neighbours are independent, the squared differences average about twice the variance, so DW ≈ 2. If neighbours are similar (positive autocorrelation, the common case) the differences are small and DW moves toward 0; if they alternate in sign, DW moves toward 4. A reading between about 1.5 and 2.5 is usually considered fine. By hand, with the flats in order of sale: the differences are 0 − 2 = −2, then −1, −1, −1, and 4 − (−3) = 7, whose squares sum to 4 + 1 + 1 + 1 + 49 = 56, and Σe² = 34.</p>
  <div class="fx" data-lang="py">e = fit.resid                                             # flats A-F, in the order they were sold
print("e_t - e_t-1:", np.diff(e) + 0.0, " sum of squares:", round((np.diff(e) ** 2).sum(), 2), " sum e^2:", round((e ** 2).sum(), 2))
print("Durbin-Watson =", round(durbin_watson(e), 3))</div>
  <div class="fx" data-lang="text">e_t - e_t-1: [-2. -1. -1. -1.  7.]  sum of squares: 56.0  sum e^2: 34.0
Durbin-Watson = 1.647</div>
  <p>DW = 56/34 = 1.65, inside the healthy band, and the same 1.647 printed in the statsmodels summary in <a class="xref" data-note="ml_regression">Linear Regression</a>. Notice where most of the 56 came from: the single jump from E (−3) to F (+4). B to E drift down together, which is the smile again: in our table the sale order is also the size order, so a missing curve looks like a run of same-sign residuals. A "snake" in residuals over time is often missing trend, seasonality or curvature rather than true error correlation. Durbin–Watson only looks at neighbours one step apart; for longer patterns use the Breusch–Godfrey or Ljung–Box tests and the residual autocorrelation plot (<a class="xref" data-note="ml_arima">ARIMA</a>).</p>
  <p>Six flats cannot show the damage, so here is the same idea at scale. We simulate 1,000 datasets of 100 weeks. The feature drifts slowly, like weekly ad spend, the true slope is zero, and the errors are also correlated week to week. A correct 5% test should call the slope "significant" in only 5% of datasets. We compare three ways of computing the standard error: the classic one, <strong>HAC</strong> (Newey–West) standard errors, which add the covariances between nearby residuals into the formula, and <strong>GLSAR</strong>, a form of generalised least squares that estimates how strongly each error carries over to the next and fits the model to the differenced data:</p>
  <div class="fx" data-lang="py">def ar1(n, rho, rng):                       # each value keeps rho of the previous one
    z = np.zeros(n); eps = rng.normal(size=n)
    for t in range(1, n):
        z[t] = rho * z[t - 1] + eps[t]
    return z
rng = np.random.default_rng(1)
rej = {"classic": 0, "HAC": 0, "GLSAR": 0}; dws = []
for _ in range(1000):
    xt = ar1(100, 0.8, rng)                 # a slowly drifting feature (weekly ad spend)
    yt = 5 + 0 * xt + ar1(100, 0.8, rng)    # TRUE slope is 0; errors are autocorrelated
    X = sm.add_constant(xt)
    f = sm.OLS(yt, X).fit()
    rej["classic"] += f.pvalues[1] &lt; 0.05
    rej["HAC"] += sm.OLS(yt, X).fit(cov_type="HAC", cov_kwds={"maxlags": 8}).pvalues[1] &lt; 0.05
    rej["GLSAR"] += sm.GLSAR(yt, X, rho=1).iterative_fit(maxiter=5).pvalues[1] &lt; 0.05
    dws.append(durbin_watson(f.resid))
for k, v in rej.items():
    print(f"false 'significant' slopes, {k:7s}: {v / 1000:.1%}")
print(f"typical Durbin-Watson: {np.median(dws):.2f}")</div>
  <div class="fx" data-lang="text">false 'significant' slopes, classic: 34.4%
false 'significant' slopes, HAC    : 18.5%
false 'significant' slopes, GLSAR  : 5.3%
typical Durbin-Watson: 0.50</div>
  <p>The classic standard errors declare a non-existent effect significant in 34.4% of datasets, seven times the promised 5%. HAC cuts that to 18.5%, better but not enough with strong correlation and 100 rows. GLSAR, which models the dependence directly, restores the honest 5.3%. The typical Durbin–Watson of 0.50 would have warned us. So the fixes are: model the dependence (GLS, regression with ARIMA errors, or add lagged values, trend and seasonal terms); or correct the standard errors (HAC for time order, cluster-robust standard errors with <code>cov_type="cluster"</code> for groups such as flats in the same building); and for prediction, always validate with time-ordered splits, never shuffled K-fold (<a class="xref" data-note="ml_splits">Splits &amp; CV</a>).</p>

  <h2 id="rd-het"><span class="num">05</span>Equal Variance</h2>
  <p>Independent errors can still have different sizes. The assumption that every row's error has the same spread is called <strong>homoscedasticity</strong> (Greek for "same scatter"), and its failure is <strong>heteroscedasticity</strong>. It is very common: errors usually grow with the size of the thing being predicted, whether that is incomes, prices, counts or times. Imagine a weighing scale that is accurate to ±10 g for a mango and ±2 kg for a watermelon. Averaging all readings with equal trust treats the watermelon readings as if they were as precise as the mango ones. Least squares does exactly that. The coefficients stay unbiased, but three things go wrong: the classic standard errors, which use one pooled noise estimate, are wrong (usually too small); OLS stops being the most precise estimator, because noisy rows get as much say as precise ones; and prediction intervals become too wide for small predictions and too narrow for large ones.</p>
  <p>Our flats' squared residuals are 4, 0, 1, 4, 9, 16: the biggest at the big end. Is the noise growing with size? The <strong>Breusch–Pagan test</strong> turns the question into a regression. If the variance is constant, the squared residuals should not be predictable from the features, so we regress e² on the features and see whether that "auxiliary" regression explains anything. By hand: the mean of e² is 34/6 = 5.667, and Σ(x − 11)·e² = −20 + 0 − 1 + 4 + 27 + 80 = 90, so the slope of e² on size is 90/70 = 1.29: squared misses grow with size. The auxiliary R² is (90²/70) divided by Σ(e² − 5.667)² = 115.7/177.3 = 0.653. The test statistic is LM = n × R² = 6 × 0.653 = 3.92. Under constant variance it follows a χ² distribution with one degree of freedom per feature, whose 5% cut-off is 3.84, so we just barely reject.</p>
  <div class="fx" data-lang="py">X1 = sm.add_constant(x)
e2 = fit.resid ** 2
aux = sm.OLS(e2, X1).fit()                                # auxiliary regression: e^2 ~ size
print("e^2:", e2.round(3) + 0.0, f"  aux slope {aux.params[1]:.4f}  aux R2 {aux.rsquared:.4f}  LM = n*R2 = {6 * aux.rsquared:.3f}")
lm, lm_p, _, _ = het_breuschpagan(fit.resid, X1)
print(f"Breusch-Pagan LM = {lm:.3f}  p = {lm_p:.4f}")
lm_q, p_q, _, _ = het_breuschpagan(quad.resid, sm.add_constant(np.c_[z, z ** 2]))
print(f"after adding size^2: LM = {lm_q:.3f}  p = {p_q:.4f}")</div>
  <div class="fx" data-lang="text">e^2: [ 4.  0.  1.  4.  9. 16.]   aux slope 1.2857  aux R2 0.6525  LM = n*R2 = 3.915
Breusch-Pagan LM = 3.915  p = 0.0479
after adding size^2: LM = 1.695  p = 0.4285</div>
  <p>statsmodels gives the same 3.915 and p = 0.048. Now read the last line, which is the real lesson of this section. After adding size², the fix for the smile from section 03, the Breusch–Pagan p-value becomes 0.43: no evidence of unequal variance at all. The large squared residuals at the big end were never noise growing with size; they were the curve the straight line could not follow. Tests for one assumption are fooled by failures of another, so always fix the shape first and test the variance afterwards. (The White test is a variant that also includes squares and products of the features in the auxiliary regression, so it catches curved variance patterns.)</p>
  <p>Suppose the spread really did grow. There are three fixes. The first and most common keeps the OLS coefficients but estimates their uncertainty without assuming one common σ². These are <strong>robust</strong> or <strong>sandwich</strong> standard errors, named after the shape of their formula, (XᵀX)⁻¹[Σeᵢ²xᵢxᵢᵀ](XᵀX)⁻¹, where each row contributes its own squared residual instead of the pooled s². With one feature the slope's variance is simply Σ(xᵢ − x̄)²eᵢ²/S_xx². By hand: 25·4 + 9·0 + 1·1 + 1·4 + 9·9 + 25·16 = 586, divided by 70² = 4900 gives 0.1196, whose square root is 0.346. That is the original version, HC0. Later versions inflate it for small samples, and <strong>HC3</strong>, which divides each squared residual by (1 − hᵢ)², is the usual recommendation. The second fix is <strong>weighted least squares</strong> (WLS): give each row a weight inversely proportional to its error variance, so that noisy rows count less. If the noise standard deviation grew in proportion to size, the variance would grow like size², and the weights would be 1/size². The third fix is to transform y: when the spread grows in proportion to the level (a typical error of 10%), modelling log y turns multiplicative noise into additive, constant-variance noise.</p>
  <div class="fx" data-lang="py">X1 = sm.add_constant(x)
d = x - x.mean()
hc0 = np.sqrt((d ** 2 * fit.resid ** 2).sum() / (d @ d) ** 2)        # White's sandwich, by hand
print(f"slope se: classic {fit.bse[1]:.4f}   HC0 by hand {hc0:.4f}   statsmodels HC0 {fit.get_robustcov_results('HC0').bse[1]:.4f}")
rob = sm.OLS(y, X1).fit(cov_type="HC3")
print(f"HC3 se {rob.bse[1]:.4f}   coefficients unchanged: {rob.params}")
wls = sm.WLS(y, X1, weights=1 / x ** 2).fit()                       # if noise SD grew like size
print(f"WLS: coefficients {wls.params.round(3)}  slope se {wls.bse[1]:.4f}")</div>
  <div class="fx" data-lang="text">slope se: classic 0.3485   HC0 by hand 0.3458   statsmodels HC0 0.3458
HC3 se 0.6963   coefficients unchanged: [-16.   7.]
WLS: coefficients [-13.142   6.727]  slope se 0.2723</div>
  <p>The hand HC0 matches statsmodels. HC3 is twice the classic value, 0.70 against 0.35, because the two biggest squared residuals sit at the high-leverage ends A and F, and HC3 divides exactly those by (1 − 0.524)² = 0.227. The coefficients are unchanged: robust standard errors change only the uncertainty. WLS with weights 1/size² gives a different line, −13.14 + 6.73 × size, because the small flats, assumed precise, now pull harder. WLS is the most precise estimator when the weights are right; with wrong weights it can mislead, so it is often combined with robust standard errors.</p>
  <p>Does any of this matter in practice? Here we simulate 2,000 datasets of 100 rows with a true slope of 2 and noise whose standard deviation grows like x² (a strong fan), and count how often each method's "95%" confidence interval actually contains the true slope:</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(2)
cover = {"classic": 0, "HC3": 0, "WLS": 0}
for _ in range(2000):
    xs = rng.uniform(1, 10, 100)
    ys = 1 + 2.0 * xs + rng.normal(0, 0.3 * xs ** 2)            # noise SD grows like x^2
    X = sm.add_constant(xs)
    for name, f in [("classic", sm.OLS(ys, X).fit()), ("HC3", sm.OLS(ys, X).fit(cov_type="HC3")),
                    ("WLS", sm.WLS(ys, X, weights=1 / xs ** 4).fit())]:
        lo, hi = f.conf_int()[1]
        cover[name] += lo &lt;= 2.0 &lt;= hi
for k, v in cover.items():
    print(f"'95%' CI covers the true slope: {k:7s} {v / 2000:.1%}")</div>
  <div class="fx" data-lang="text">'95%' CI covers the true slope: classic 88.6%
'95%' CI covers the true slope: HC3     94.3%
'95%' CI covers the true slope: WLS     94.3%</div>
  <p>The classic interval covers the truth only 88.6% of the time: it is too narrow and overconfident. HC3 and correctly weighted WLS (weights 1/x⁴, because the variance grows like (x²)²) both reach 94.3%, essentially the promised 95%. In practice, when in doubt, report HC3 standard errors.</p>

  <h2 id="rd-norm"><span class="num">06</span>Normality of Errors</h2>
  <p>The exact t and F distributions behind p-values and intervals assume the errors follow a normal (bell-shaped) distribution. This is the assumption that matters least, for a good reason. A coefficient estimate is a weighted average of many errors, and by the central limit theorem averages become nearly normal as n grows, whatever the shape of the individual errors. So tests on coefficients are robust to non-normal errors in moderate samples. What large n does <em>not</em> fix is the prediction interval, because it is about one single new error. If that error is skewed, a symmetric ± interval is simply the wrong shape.</p>
  <p>The standard check is a <strong>Q-Q plot</strong> (quantile-quantile plot). It places each sorted residual against where it "should" be if the residuals were normal. For n points, the expected position of the i-th smallest is the normal quantile at probability (i − 0.5)/n. If the points fall on a straight line, the residuals look normal. An S-shape (low end below the line, high end above) means heavy tails, with more extreme errors than a bell curve allows; a curve bending upward at both ends means right skew; one or two points far off at an end are outliers to investigate in section 08. For our six flats, the probabilities are 0.083, 0.25, …, 0.917, and the sorted residuals divided by s are compared with the matching normal quantiles:</p>
  <div class="fx" data-lang="py">r = np.sort(fit.resid)                                  # residuals, sorted
q = stats.norm.ppf((np.arange(1, 7) - 0.5) / 6)         # where they "should" be if normal
print("normal quantile:", q.round(3) + 0.0)
print("residual / s   :", (r / s).round(3) + 0.0)
print("Shapiro-Wilk p :", round(stats.shapiro(fit.resid).pvalue, 3))</div>
  <div class="fx" data-lang="text">normal quantile: [-1.383 -0.674 -0.21   0.21   0.674  1.383]
residual / s   : [-1.029 -0.686 -0.343  0.     0.686  1.372]
Shapiro-Wilk p : 0.817</div>
  <p>The two rows track each other closely, with a slight lean to the right from F's +4, and the Shapiro–Wilk test gives p = 0.82. But with six points no test could reject normality; small samples have almost no power, while very large samples reject tiny, harmless departures. Read the plot and treat the tests as secondary.</p>
  <p>To see what non-normal errors actually break, we simulate errors from a skewed exponential distribution (shifted to mean zero) with 10 and with 200 rows, and check two things: how often the 95% slope interval contains the true slope, and how often a new observation falls below or above its 95% prediction interval (each should be 2.5%):</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(3)
for n_obs in [10, 200]:
    ci_ok = below = above = 0
    for _ in range(2000):
        xs = rng.uniform(0, 10, n_obs)
        ys = 1 + 2 * xs + rng.exponential(2, n_obs) - 2           # skewed errors with mean 0
        f = sm.OLS(ys, sm.add_constant(xs)).fit()
        lo, hi = f.conf_int()[1]; ci_ok += lo &lt;= 2 &lt;= hi
        b, w = f.params; t = stats.t.ppf(0.975, n_obs - 2)
        se = np.sqrt(f.scale * (1 + 1 / n_obs + (5 - xs.mean()) ** 2 / ((xs - xs.mean()) ** 2).sum()))
        y_new = 1 + 2 * 5 + rng.exponential(2) - 2                # one new case at x = 5
        below += y_new &lt; b + 5 * w - t * se; above += y_new &gt; b + 5 * w + t * se
    print(f"n={n_obs:3d}  slope CI coverage {ci_ok / 2000:.1%}   new case below PI {below / 2000:.1%}, above PI {above / 2000:.1%}")</div>
  <div class="fx" data-lang="text">n= 10  slope CI coverage 95.0%   new case below PI 0.1%, above PI 7.4%
n=200  slope CI coverage 95.0%   new case below PI 0.0%, above PI 4.8%</div>
  <p>The slope interval covers 95.0% at both sizes: coefficient inference survived skewed errors. The prediction interval did not. New cases almost never fall below it and fall above it 4.8 to 7.4% of the time, because the interval is symmetric and the errors are not, and more data does not help. House prices often have exactly this right skew, which is one reason analysts model log price. The fixes: transform y (log or Box–Cox) when the skew comes from a multiplicative process; check whether the "non-normality" is really one or two outliers or a missing curve; bootstrap the coefficients in small samples; and for intervals on single cases use quantile regression or conformal prediction, which do not assume any shape. One caution: if you log y and then predict y, exp of the predicted log gives the median, not the mean, so multiply by about exp(s²/2) to get the mean.</p>

  <h2 id="rd-mc"><span class="num">07</span>Multicollinearity</h2>
  <p>The previous assumptions were about the errors. This one is about the features. In <a class="xref" data-note="ml_regression">Linear Regression</a>, adding bedrooms moved size's weight from 7.0 to 6.21, because bigger flats nearly always have more bedrooms. When two columns tell almost the same story, the data cannot separate their effects. Think of two people pushing a car together and the car moving 10 metres: you can be sure about the total push, but not about how much each person contributed. That is <strong>multicollinearity</strong>.</p>
  <p>There are two strengths of it. <strong>Perfect</strong> multicollinearity means one column is an exact combination of others, such as all locality dummies plus an intercept, or size in sq ft next to size in 100 sq ft. Then XᵀX cannot be inverted and the coefficients are not defined; the fix is to drop the redundant column. <strong>High</strong> multicollinearity means columns are strongly but not exactly related, like size and bedrooms or two temperature sensors. A unique answer exists, but standard errors inflate, coefficients become unstable (large, with opposite signs, flipping between samples), and "holding the other fixed" asks about flats that never occur in the data, such as a 1,600 sq ft flat with one bedroom. What does not break is R² and the predictions, as long as new data follow the same correlation pattern.</p>
  <p>The standard measure is the <strong>variance inflation factor</strong>. To compute it for feature j, regress xⱼ on all the other features and take that regression's R²ⱼ; then VIFⱼ = 1/(1 − R²ⱼ). It says how many times larger the variance of wⱼ is than it would be if xⱼ were unrelated to the other features, so the standard error is inflated by √VIF. With only two features, R²ⱼ is just their squared correlation. For size and bedrooms the correlation is 19/√(70 × 5.5) = 0.968, so R² = 0.938 and VIF = 1/(1 − 0.938) = 16 for both. Their standard errors are √16 = 4 times what they would be if size and bedrooms were unrelated. Common thresholds are 5 ("look closer") and 10 ("serious").</p>
  <div class="fx" data-lang="py">rooms = np.array([1, 2, 2, 3, 3, 4], dtype=float)                 # bedrooms of flats A-F
r2_aux = sm.OLS(x, sm.add_constant(rooms)).fit().rsquared         # how well rooms explains size
XB = sm.add_constant(np.c_[x, rooms])
print(f"R2(size ~ rooms) = {r2_aux:.4f}  VIF = {1 / (1 - r2_aux):.2f}  statsmodels: {variance_inflation_factor(XB, 1):.2f}")
both = sm.OLS(y, XB).fit()
print("size alone : coef", fit.params[1].round(3), " se", fit.bse[1].round(3))
print("size+rooms : coefs", both.params[1:].round(3), " se", both.bse[1:].round(3), " p", both.pvalues[1:].round(3),
      " joint F-test p", f"{both.f_pvalue:.1e}")
for name, col in [("raw size", x), ("centred size", x - x.mean())]:
    rr = np.corrcoef(col, col ** 2)[0, 1]
    print(f"{name:12s} corr(size, size^2) = {rr:.4f}  VIF = {1 / (1 - rr ** 2):.1f}")</div>
  <div class="fx" data-lang="text">R2(size ~ rooms) = 0.9377  VIF = 16.04  statsmodels: 16.04
size alone : coef 7.0  se 0.348
size+rooms : coefs [6.208 2.917]  se [1.541 5.497]  p [0.027 0.632]  joint F-test p 8.5e-04
raw size     corr(size, size^2) = 0.9913  VIF = 57.7
centred size corr(size, size^2) = -0.0000  VIF = 1.0</div>
  <p>The VIF matches the hand value, and the model lines show the damage. Size alone has a standard error of 0.35. With bedrooms added, size's standard error jumps to 1.54, and bedrooms gets a standard error of 5.50 and p = 0.63, "not significant". Yet the F-test that both slopes are zero has p = 0.0009. Individually unclear, jointly overwhelming: that is the signature of collinearity. Never drop a feature just because its individual p-value is large when it is correlated with another; test the pair together.</p>
  <p>The last two lines show <strong>structural</strong> collinearity, the kind you create yourself. Raw size (6 to 16) and size² (36 to 256) rise together almost perfectly, a correlation of 0.991 and a VIF of 57.7. Centre size first, z = size − 11, and z² is symmetric while z is antisymmetric, so their correlation is exactly 0 and the VIF is 1. The model and its predictions are the same, but the separate coefficients become stable. Always centre before building squares or interaction columns.</p>
  <p>At scale, here are 100 days of ice-cream sales that truly depend on a temperature sensor A (slope 2). A second sensor B is added, first unrelated, then a close copy of A, then a near-perfect copy:</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(4)
temp_a = rng.normal(30, 4, 100)                           # sensor A, deg C
sales = 10 + 2 * temp_a + rng.normal(0, 3, 100)           # sales truly depend on A: slope 2
for label, temp_b in [("B unrelated        ", rng.normal(30, 4, 100)),
                      ("B = A + small noise", temp_a + rng.normal(0, 0.3, 100)),
                      ("B = A + tiny noise ", temp_a + rng.normal(0, 0.05, 100))]:
    X = sm.add_constant(np.c_[temp_a, temp_b])
    f = sm.OLS(sales, X).fit()
    print(f"{label}  VIF {variance_inflation_factor(X, 1):7.1f}   coef A {f.params[1]:5.2f} (se {f.bse[1]:4.2f})"
          f"   coef B {f.params[2]:5.2f} (se {f.bse[2]:4.2f})   R2 {f.rsquared:.3f}")</div>
  <div class="fx" data-lang="text">B unrelated          VIF     1.0   coef A  2.14 (se 0.07)   coef B -0.10 (se 0.07)   R2 0.903
B = A + small noise  VIF   183.4   coef A  2.45 (se 0.97)   coef B -0.32 (se 0.97)   R2 0.901
B = A + tiny noise   VIF  6710.0   coef A  1.99 (se 5.88)   coef B  0.14 (se 5.88)   R2 0.901</div>
  <p>As B becomes a copy of A, the VIF goes 1 → 183 → 6,710 and A's standard error goes 0.07 → 0.97 → 5.88, just as the √VIF rule predicts (0.07 × √6710 ≈ 5.7). The question "how much does temperature raise sales?" becomes unanswerable from the coefficients, yet R² stays at 0.90 throughout: the predictions are fine. The fixes depend on your goal. Drop one of the twins if they measure the same thing; combine several noisy measures into one (an average, a ratio such as sq ft per bedroom); centre before polynomial and interaction terms; use ridge regression to keep all features but stabilise them (<a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a>, which on these flats shares the weight between size and bedrooms), or PCA for many correlated features; collect data where the features vary separately; or, if you only need predictions, do nothing. Be careful that pairwise correlations can all look modest while a VIF is huge, because one feature can be explained by a combination of several others; always compute VIF rather than just the correlation matrix.</p>

  <h2 id="rd-infl"><span class="num">08</span>Outliers, Leverage and Influence</h2>
  <p>So far every problem was spread across all rows. Sometimes a single row decides the whole fit. Three different ideas get mixed up here. An <strong>outlier</strong> is a row whose y is far from what the model predicts, measured by a studentised residual beyond about ±2 or ±3. A <strong>high-leverage</strong> row is one whose x is far from the other x values, measured by hᵢ above about 2p/n. An <strong>influential</strong> row is one whose removal changes the fit a lot. Influence needs both: roughly, influence = how much of an outlier × how much leverage.</p>
  <p>A see-saw makes it clear. A child sitting near the pivot (low leverage) barely moves it, however much they bounce (outlier). An adult sitting quietly at the very end in balance (high leverage, no outlier) changes nothing. An adult at the end who jumps (both) flips the see-saw.</p>
  <p>The standard measure of influence is <strong>Cook's distance</strong>: how much all the fitted values move when row i is deleted, scaled so that values are comparable. It can be computed from quantities we already have: Dᵢ = (rᵢ²/p) × hᵢ/(1 − hᵢ), the squared standardised residual (outlyingness) times a leverage factor. For F: r = 1.988, so r²/2 = 1.976, and h/(1 − h) = 0.524/0.476 = 1.10, giving D = 2.17. For A: 0.494 × 1.10 = 0.54; for E: 0.752 × 0.419 = 0.31; for the middle flats C and D only 0.02 and 0.06. Rules of thumb say D above 4/n (here 0.67) deserves a look and D above 1 is very influential, so F is very influential. But what is F telling us? Not that it is a bad data point. It sits where the upward curve is strongest, so deleting it would hide the curve rather than fix anything.</p>
  <p>To see the three ideas separately, add a seventh sale, G, to the six flats in three different ways. In case A it is an average-size flat (1,100 sq ft) that sold 20 lakh above the line, perhaps for a famous view: an outlier with low leverage. In case B it is a huge 3,000 sq ft flat that sold for exactly what the line predicts, 194 lakh: high leverage, not an outlier. In case C it is the same huge flat sold for only 120 lakh in a distressed sale: high leverage and far off the line. The leverage of a flat at x = 30 is high by hand: the new average size is 96/7 = 13.71, the new S_xx is 1696 − 7 × 13.71² = 379.4, and h = 1/7 + (30 − 13.71)²/379.4 = 0.143 + 0.699 = 0.842, close to the maximum of 1.</p>
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
         "B: huge flat, on the line     ": (30, 194.0),
         "C: huge flat, off the line    ": (30, 120.0)}
for name, (xn, yn) in cases.items():
    xa, ya = np.append(x, xn), np.append(y, yn)            # add a seventh sale, G
    f7 = sm.OLS(ya, sm.add_constant(xa)).fit()
    inf7 = f7.get_influence()
    print(f"{name} slope {f7.params[1]:5.2f}  intercept {f7.params[0]:7.2f} | G: h={inf7.hat_matrix_diag[-1]:.3f}"
          f"  t={inf7.resid_studentized_external[-1]:6.2f}  Cook's D={inf7.cooks_distance[0][-1]:.3f}")</div>
  <div class="fx" data-lang="text">A: price outlier, average size slope  7.00  intercept  -13.14 | G: h=0.143  t=  6.35  Cook's D=0.379
B: huge flat, on the line      slope  7.00  intercept  -16.00 | G: h=0.842  t=  0.00  Cook's D=0.000
C: huge flat, off the line     slope  3.82  intercept   16.99 | G: h=0.842  t=-10.09  Cook's D=12.807</div>
  <p>Case A has a huge studentised residual (6.35) but the minimum possible leverage (1/7), so it only lifts the line: the intercept moves from −16 to −13.14, the slope stays 7, and Cook's D is a modest 0.38. Case B has leverage 0.842 but a residual of zero, so nothing changes at all and D = 0. Case C combines the two: the slope collapses from 7.0 to 3.8 and Cook's D is 12.8, far above every threshold. One distressed sale rewrote the dealer's whole price list. Related measures you will see in the statsmodels <code>summary_frame</code> are DFFITS (how much the row's own prediction changes when it is deleted, in standard-error units) and DFBETAS (how much each coefficient changes).</p>
  <p>What should you do with an influential point? First check the data: a typo (30 instead of 13), a unit error (square metres entered as square feet), or a different population (a distressed or family sale). Fix it, or exclude it with a written reason. Then check the model: maybe the point is telling the truth and the line is wrong, as F says about the curve. If it is genuine and you cannot decide, report the fit with and without it. Or use <strong>robust regression</strong>, which down-weights unusual rows, but understand what each method protects against:</p>
  <div class="fx" data-lang="py">from sklearn.linear_model import HuberRegressor, LinearRegression, RANSACRegressor
xa, ya = np.append(x, 30), np.append(y, 120.0)               # case C: the distressed sale G
Xa = xa.reshape(-1, 1)
print("OLS    slope", round(LinearRegression().fit(Xa, ya).coef_[0], 3))
print("Huber  slope", round(HuberRegressor(epsilon=1.35).fit(Xa, ya).coef_[0], 3))
rlm = sm.RLM(ya, sm.add_constant(xa), M=sm.robust.norms.HuberT()).fit()
print("RLM weights per flat A..G:", rlm.weights.round(2))
ran = RANSACRegressor(random_state=0, residual_threshold=10.0).fit(Xa, ya)
print("RANSAC slope", round(ran.estimator_.coef_[0], 3), " inliers:", ran.inlier_mask_.astype(int))</div>
  <div class="fx" data-lang="text">OLS    slope 3.824
Huber  slope 3.748
RLM weights per flat A..G: [1.   1.   1.   1.   1.   0.81 1.  ]
RANSAC slope 7.0  inliers: [1 1 1 1 1 1 0]</div>
  <p>This result surprises most people. Huber regression, the most popular robust method, does not help: its slope is 3.75, almost the same as OLS. Huber down-weights rows with large residuals, but a high-leverage point pulls the line so close to itself that its residual is not the largest. statsmodels' robust fit shows it plainly: G keeps full weight 1.0 while innocent F is down-weighted to 0.81. Huber protects against outliers in y, not against leverage. RANSAC works differently: it fits lines to many random subsets and keeps the one that most points agree with (within 10 lakh here). It ignores G entirely (inlier flag 0) and recovers the slope of 7.0. Theil–Sen and least trimmed squares are other methods that resist high-leverage points. And never delete points one by one until the fit looks clean: that is data manipulation, your standard errors will be too small, and the model will fail on real data.</p>

  <h2 id="rd-endo"><span class="num">09</span>Omitted Variables and Endogeneity</h2>
  <p>Every check so far looked at residuals or at X. The most damaging failure in practice leaves both looking perfectly healthy: an important variable that is not in the data at all. Suppose the dealer had never recorded bedrooms. The size-only fit passes every check above. Does its slope still mean "the value of 100 more sq ft"?</p>
  <p>Least squares needs the features to be unrelated to the error term; in symbols, E[ε | X] = 0, a property called <strong>exogeneity</strong>. A feature that is correlated with the error is called <strong>endogenous</strong>, and its coefficient is biased in a way that does not shrink with more data. There are three classic causes. An <strong>omitted variable</strong> that affects y and is correlated with a feature: size takes credit for the missing bedrooms; in wage studies, education takes credit for unmeasured ability. <strong>Measurement error</strong> in a feature, such as size estimated by eye, shrinks its coefficient toward zero (attenuation). And <strong>reverse causality</strong>, where y also drives x: areas with more crime get more police, so a naive regression of crime on police can even get the sign wrong.</p>
  <p>For an omitted variable the size of the bias has an exact formula. If the true model is y = β₀ + β₁x₁ + β₂x₂ + ε and we leave x₂ out, the slope we get for x₁ is on average β₁ + β₂·δ, where δ is the slope from regressing x₂ on x₁. The bias β₂·δ is upward when the missing variable raises y and rises with x₁ (or lowers y and falls with x₁), and downward when the signs differ. For the flats, β₁ = 6.208 (size), β₂ = 2.917 (bedrooms) and δ = 19/70 = 0.271 bedrooms per 100 sq ft, so the short slope should be 6.208 + 2.917 × 0.271 = 7.000, the size-only slope exactly. The top of the output checks this, and the rest shows the same thing at a scale where the bias is unmistakable: 5,000 simulated workers whose wages depend on years of education (true effect 1.0 per year) and on an unrecorded "ability", where able people also study longer:</p>
  <div class="fx" data-lang="py">d1, d2 = x - x.mean(), rooms - rooms.mean()
delta = (d1 @ d2) / (d1 @ d1)                               # slope of rooms on size
both = sm.OLS(y, sm.add_constant(np.c_[x, rooms])).fit()
print(f"delta = {delta:.4f}   short slope = {fit.params[1]:.4f}")
print(f"OVB formula: {both.params[1]:.4f} + {both.params[2]:.4f} * {delta:.4f} = {both.params[1] + both.params[2] * delta:.4f}")

rng = np.random.default_rng(5)                              # at scale: 5,000 workers
ability = rng.normal(0, 1, 5000)                            # never recorded
educ = 12 + 2 * ability + rng.normal(0, 2, 5000)            # able people study longer
wage = 5 + 1.0 * educ + 3.0 * ability + rng.normal(0, 2, 5000)   # TRUE effect of a year: 1.0
full = sm.OLS(wage, sm.add_constant(np.c_[educ, ability])).fit()
short = sm.OLS(wage, sm.add_constant(educ)).fit()
print(f"with ability: {full.params[1]:.3f}   ability omitted: {short.params[1]:.3f} (se {short.bse[1]:.3f})")
noisy = sm.OLS(wage, sm.add_constant(np.c_[educ + rng.normal(0, 2, 5000), ability])).fit()
print(f"education measured with noise: {noisy.params[1]:.3f}")</div>
  <div class="fx" data-lang="text">delta = 0.2714   short slope = 7.0000
OVB formula: 6.2083 + 2.9167 * 0.2714 = 7.0000
with ability: 0.997   ability omitted: 1.744 (se 0.015)
education measured with noise: 0.499</div>
  <p>With ability included, education's coefficient is 0.997, essentially the truth. Without it, 1.744, with a tiny standard error of 0.015 that makes it look very precise: it is precisely wrong. The formula predicts 1.0 + 3.0 × 0.25 = 1.75. No residual plot of the short model would show anything odd. The last line shows attenuation: when education is recorded with noise, its coefficient shrinks to 0.499, about half the truth.</p>
  <p>For pure prediction, an omitted variable "only" costs accuracy: the short model still predicts well as long as the relationship between the included and missing features stays the same. The danger is reading the coefficient as an effect you can act on: "send everyone for one more year of education and wages will rise by 1.74" is wrong by 74%. The fixes are each a field of their own: measure and include the confounder (record bedrooms); use panel data with fixed effects, comparing each person or building with itself over time; use instrumental variables, a variable that moves x but affects y only through x; or run a randomised experiment, which makes x independent of everything else (<a class="xref" data-note="st_abtesting">A/B Testing</a>). And adding more controls is not always safer: controlling for something that is itself caused by x can create bias.</p>

  <h2 id="rd-flow"><span class="num">10</span>A Full Diagnostic Workflow</h2>
  <p>We studied each problem alone, but real data has several at once, and fixing one can fix others, as the smile and the "fan" already showed. A good order is: think about the process first (does it add or multiply? is it ordered in time? grouped?), fit, check the shape, then the variance, then dependence, normality, collinearity and influence, fix the most basic problem, and re-check everything. The helper below returns one number per check so that two models can be compared side by side. The example at scale is a delivery app predicting delivery minutes from distance and the number of items in 400 orders. In the simulated truth, time grows multiplicatively (each km adds about 12%) with noise of about ±25%, which is how waiting and traffic delays usually behave.</p>
  <div class="fx" data-lang="py">from statsmodels.stats.stattools import jarque_bera
def diagnose(f, X):
    """One number per check."""
    return {"R2": round(f.rsquared, 3),
            "RESET p": round(float(linear_reset(f, power=2, use_f=True).pvalue), 4),
            "BP p": round(het_breuschpagan(f.resid, X)[1], 4),
            "JB p": round(jarque_bera(f.resid)[1], 4),
            "DW": round(durbin_watson(f.resid), 2),
            "max VIF": round(max(variance_inflation_factor(X, i) for i in range(1, X.shape[1])), 2),
            "max Cook": round(f.get_influence().cooks_distance[0].max(), 3)}
rng = np.random.default_rng(6)
dist = rng.uniform(0.5, 12, 400)                     # km
items = rng.integers(1, 15, 400)                     # items in the order
minutes = np.exp(2.3 + 0.12 * dist + 0.03 * items + rng.normal(0, 0.25, 400))   # multiplicative
Xd = sm.add_constant(np.c_[dist, items])
raw, logm = sm.OLS(minutes, Xd).fit(), sm.OLS(np.log(minutes), Xd).fit()
print(pd.DataFrame({"minutes ~ dist + items": diagnose(raw, Xd),
                    "log(minutes) ~ dist + items": diagnose(logm, Xd),
                    "flats: price ~ size": diagnose(fit, sm.add_constant(x)),
                    "flats: price ~ size + size^2": diagnose(quad, sm.add_constant(np.c_[z, z ** 2]))}).T.to_string())
print("log model: +1 km multiplies time by", round(np.exp(logm.params[1]), 3))</div>
  <div class="fx" data-lang="text">                                 R2  RESET p    BP p    JB p    DW  max VIF  max Cook
minutes ~ dist + items        0.702   0.0000  0.0000  0.0041  2.02      1.0     0.042
log(minutes) ~ dist + items   0.752   0.2349  0.5565  0.1149  2.03      1.0     0.026
flats: price ~ size           0.990   0.0735  0.0479  0.7830  1.65      1.0     2.174
flats: price ~ size + size^2  0.997   0.1535  0.4285  0.6569  2.42      1.0     4.547
log model: +1 km multiplies time by 1.125</div>
  <p>Read the first row, raw minutes. RESET p = 0.0000 (the shape is curved: time grows faster than linearly with distance), Breusch–Pagan p = 0.0000 (the spread grows with the prediction), Jarque–Bera p = 0.004 (the residuals are right-skewed), while Durbin–Watson 2.02, VIF 1.0 and Cook's D 0.04 are all fine. Three failures with one common cause: the process multiplies rather than adds. The fix is to model log(minutes). In the second row, RESET, Breusch–Pagan and Jarque–Bera all become comfortable at once, and the coefficients now read as percentages: e^0.1176 = 1.125, so each extra km adds about 12.5% to the delivery time (truth 12.7%). (Do not compare the two R² values, 0.702 and 0.752, because they measure different targets; compare on one scale on held-out data, as in <a class="xref" data-note="ml_reg_metrics">Regression Metrics</a>.)</p>
  <p>The last two rows run the same workflow on the six flats before and after adding centred size². One fix, the right shape, cleared both the linearity hint (RESET p 0.07 → 0.15) and the variance warning (BP p 0.048 → 0.43). The maximum Cook's D rises to 4.5, because with six rows and three parameters the curve leans heavily on the end flats to decide its curvature. That is a reminder that six flats are thin evidence for any curve, which is why <a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a> judges it with cross-validation.</p>
  <p>As a checklist to keep: plot y against each feature before fitting; after fitting, plot residuals against fitted values and against each feature, and fix the shape first (curve → transform or add terms; fan → log y, WLS or HC3); if rows are ordered or grouped, plot residuals against time and use HAC, cluster-robust errors or model the dependence; check the Q-Q plot, especially if you will quote prediction intervals; compute VIFs if you will interpret coefficients; and look at leverage, studentised residuals and Cook's D, investigating flagged rows and reporting results with and without them.</p>

  <h2 id="rd-traps"><span class="num">11</span>Common Mistakes</h2>
  <p>The most common interview mistake is saying that heteroscedasticity biases the coefficients. It does not. It breaks the standard errors, p-values and intervals, and makes OLS less efficient, but only a wrong shape or an omitted variable biases the coefficients themselves.</p>
  <p>A second is computing Durbin–Watson on rows in the wrong order. The statistic only means something when the rows are in their true time order. Here 200 days of sales contain a slow wave that the straight line misses:</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(7)
t = np.arange(200)
sales = 50 + 0.2 * t + 10 * np.sin(t / 15) + rng.normal(0, 2, 200)   # a slow wave the line misses
f = sm.OLS(sales, sm.add_constant(t)).fit()
print("DW in time order :", round(durbin_watson(f.resid), 2))
print("DW after shuffle :", round(durbin_watson(rng.permutation(f.resid)), 2))</div>
  <div class="fx" data-lang="text">DW in time order : 0.15
DW after shuffle : 1.95</div>
  <p>In time order DW is 0.15, a loud alarm. Shuffle the same residuals and DW becomes 1.95, perfectly "healthy". Shuffling (or a random train/test split of time-ordered data) hides the problem rather than solving it. Conversely, a low DW on data with no natural order, such as rows sorted by y, is meaningless.</p>
  <p>A third is testing the normality of y, or of a feature, instead of the residuals:</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(8)
income = rng.lognormal(3, 0.8, 300)                  # a very skewed feature
spend = 5 + 0.4 * income + rng.normal(0, 3, 300)     # normal errors
f = sm.OLS(spend, sm.add_constant(income)).fit()
print(f"Shapiro p on y        : {stats.shapiro(spend).pvalue:.1e}")
print(f"Shapiro p on residuals: {stats.shapiro(f.resid).pvalue:.3f}")</div>
  <div class="fx" data-lang="text">Shapiro p on y        : 1.6e-16
Shapiro p on residuals: 0.878</div>
  <p>Spending depends on a very skewed income, so spending itself is far from normal (p = 1.6 × 10⁻¹⁶), yet the residuals are perfectly normal (p = 0.88). The model is fine. Only the residuals matter.</p>
  <p>Several mistakes have already appeared in the sections above. Trusting tests over plots: with six rows no test can reject (the smile's p = 0.07), and with 100,000 rows every test rejects trivial departures; plots show the size and kind of problem. Fixing the variance before the shape: the flats' Breusch–Pagan warning vanished once size² was added. Deleting outliers to improve the fit: F is influential because it shows the curve. Assuming Huber regression handles high-leverage points: it does not, use RANSAC or Theil–Sen or fix the data. Dropping a correlated feature because its individual p-value is large: bedrooms had p = 0.63 while size and bedrooms together had p = 0.0009. Comparing R² between a model of y and a model of log y. And believing that clean residuals make a coefficient causal: the education coefficient was 1.74 against a truth of 1.0 with perfect-looking residuals.</p>

  <h2 id="rd-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>Running example: six flats, size 6, 8, 10, 12, 14, 16 (100 sq ft), price 28, 40, 53, 66, 79, 100 (lakh); line −16 + 7 × size; residuals +2, 0, −1, −2, −3, +4; s = 2.92.</p>
  <h3>Assumptions and what breaks</h3>
  <table class="tbl">
    <tr><th>Assumption</th><th>Detect</th><th>Breaks</th><th>Fix</th></tr>
    <tr><td>Linearity / exogeneity</td><td>residuals vs fitted (curve), RESET, partial residual plots</td><td>coefficients and predictions</td><td>x², splines, log, interactions; include confounders</td></tr>
    <tr><td>Independence</td><td>residuals vs time, Durbin–Watson, Breusch–Godfrey</td><td>SEs too small</td><td>HAC, cluster SEs, GLS, lags/trend; time-ordered CV</td></tr>
    <tr><td>Equal variance</td><td>fan in residuals, scale-location, Breusch–Pagan, White</td><td>SEs, intervals, efficiency</td><td>HC3 SEs, WLS, log y</td></tr>
    <tr><td>Normality</td><td>Q-Q plot, Shapiro–Wilk, Jarque–Bera</td><td>small-sample tests; prediction-interval shape</td><td>transform, bootstrap, quantile regression, conformal</td></tr>
    <tr><td>No multicollinearity</td><td>VIF, condition number</td><td>huge SEs, unstable signs</td><td>drop, combine, centre, ridge, PCA</td></tr>
    <tr><td>No dominant rows</td><td>leverage, studentised residuals, Cook's D</td><td>the whole fit</td><td>check data, report both fits, RANSAC / Theil–Sen</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Six flats</th></tr>
    <tr><td>Leverage</td><td>hᵢ = 1/n + (xᵢ − x̄)²/S_xx; Σh = p</td><td>A, F 0.524; C, D 0.181</td></tr>
    <tr><td>Standardised residual</td><td>rᵢ = eᵢ/(s√(1 − hᵢ))</td><td>F: 1.99 (studentised 15.9)</td></tr>
    <tr><td>Durbin–Watson</td><td>Σ(eₜ − eₜ₋₁)²/Σeₜ², ≈ 2 is fine</td><td>56/34 = 1.65</td></tr>
    <tr><td>Breusch–Pagan</td><td>LM = n·R² of e² on features ~ χ²(k)</td><td>6 × 0.653 = 3.92, p 0.048 (0.43 after size²)</td></tr>
    <tr><td>HC0 slope variance</td><td>Σ(xᵢ − x̄)²eᵢ²/S_xx²</td><td>586/4900 → se 0.346; HC3 0.696</td></tr>
    <tr><td>Q-Q position</td><td>normal quantile at (i − 0.5)/n</td><td>±1.383, ±0.674, ±0.210</td></tr>
    <tr><td>VIF</td><td>1/(1 − R²ⱼ); SE × √VIF</td><td>size, bedrooms: 16</td></tr>
    <tr><td>Cook's distance</td><td>(rᵢ²/p)·hᵢ/(1 − hᵢ); look above 4/n, worry above 1</td><td>F: 2.17</td></tr>
    <tr><td>Omitted-variable bias</td><td>short slope = β₁ + β₂·δ</td><td>6.21 + 2.92 × 0.271 = 7.0</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">import statsmodels.api as sm
from statsmodels.stats.diagnostic import linear_reset, het_breuschpagan
from statsmodels.stats.stattools import durbin_watson
from statsmodels.stats.outliers_influence import variance_inflation_factor

fit = sm.OLS(y, X).fit()                         # X includes sm.add_constant
infl = fit.get_influence()                       # hat_matrix_diag, resid_studentized_external, cooks_distance
linear_reset(fit, power=2, use_f=True).pvalue    # shape
het_breuschpagan(fit.resid, X)[1]                # equal variance (p-value)
durbin_watson(fit.resid)                         # independence (rows in time order)
variance_inflation_factor(X, j)                  # collinearity of column j
sm.OLS(y, X).fit(cov_type="HC3")                 # robust SEs; "HAC" / "cluster" for dependence
sm.WLS(y, X, weights=w).fit()                    # weighted least squares</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Only non-linearity and endogeneity bias coefficients.</li>
    <li>Normality is about residuals, not x or y; it matters most for prediction intervals.</li>
    <li>Fix the shape before testing the variance.</li>
    <li>Small samples: tests have no power; large samples: tests reject trivia. Read plots.</li>
    <li>Huber handles y-outliers, not leverage.</li>
    <li>Collinearity hurts coefficients, not predictions; test correlated features jointly.</li>
    <li>Durbin–Watson needs the true row order.</li>
  </ul>

  <h2 id="rd-qa"><span class="num">12</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>List the assumptions of linear regression and say which ones bias the coefficients.</summary><div class="qa-body">Linearity (with exogeneity: nothing omitted that is correlated with the features), independence of errors, equal variance, normality of errors, and no perfect multicollinearity. Only a wrong functional form or endogeneity (omitted variables, measurement error, reverse causality) biases the coefficients. The others leave coefficients unbiased but make standard errors, p-values and intervals wrong, or make the solution non-unique.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which assumptions matter if you only care about prediction accuracy?</summary><div class="qa-body">Mainly linearity, because a wrong shape gives systematically wrong predictions, plus stable relationships between features over time. Independence matters for how you validate (time-ordered splits). Normality, equal variance and multicollinearity barely affect point predictions, though variance and normality still matter if you quote prediction intervals.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is leverage, and why must residual checks account for it?</summary><div class="qa-body">Leverage hᵢ, the diagonal of the hat matrix, measures how far a row's features are from the centre and how strongly it pulls the fit toward itself; for one feature hᵢ = 1/n + (xᵢ − x̄)²/S_xx. A residual's variance is σ²(1 − hᵢ), so high-leverage rows have squeezed residuals that look smaller than they are. Standardised and studentised residuals divide by √(1 − hᵢ) to make residuals comparable.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The residuals are +2, 0, −1, −2, −3, +4 and R² is 0.990. Is the model fine?</summary><div class="qa-body">No. Positive at both ends and negative in the middle is a curved pattern, so the straight line is the wrong shape: it under-predicts at the extremes and over-predicts in the middle. Adding x² cuts SSE from 34 to 9.9. A high R² never proves linearity; look at the residual plot.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the Durbin–Watson statistic measure, and how do you read it?</summary><div class="qa-body">DW = Σ(eₜ − eₜ₋₁)²/Σeₜ² compares each residual with the previous one in time order. About 2 means no lag-1 autocorrelation, toward 0 means positive autocorrelation (neighbours alike), toward 4 means negative. It only makes sense for rows in a meaningful order and only checks lag 1; use Breusch–Godfrey or Ljung–Box for longer lags.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does autocorrelation make p-values too small?</summary><div class="qa-body">Correlated rows carry less independent information than their count suggests, but the classic standard-error formula treats every row as new, so it underestimates the uncertainty. In simulation with a true slope of zero, classic SEs called it significant 34% of the time instead of 5%. Fixes are HAC or cluster-robust SEs, or modelling the dependence with GLS.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk through the Breusch–Pagan test.</summary><div class="qa-body">Fit the model and square the residuals. Regress e² on the features. If the variance is constant, the features should not predict e², so the auxiliary R² should be near zero. The statistic n·R² follows a χ² distribution with one degree of freedom per feature; a small p-value indicates heteroscedasticity. Fix the functional form first, because a missed curve also makes e² depend on x.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does heteroscedasticity bias the OLS coefficients? What are your options?</summary><div class="qa-body">No; the coefficients stay unbiased. The standard errors, p-values and intervals are wrong, and OLS is no longer the most efficient estimator. Options: keep OLS with robust (HC3) standard errors; use weighted least squares if you can model how the variance changes; or transform y (often log) when the spread grows with the level.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are robust (sandwich) standard errors?</summary><div class="qa-body">They estimate the coefficients' variance as (XᵀX)⁻¹[Σeᵢ²xᵢxᵢᵀ](XᵀX)⁻¹, letting each row contribute its own squared residual instead of one pooled σ². They remain valid under any form of heteroscedasticity. HC0 is the original; HC3 divides each eᵢ² by (1 − hᵢ)² and is recommended for small samples. The coefficients are unchanged.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you read a Q-Q plot, and how much does non-normality matter?</summary><div class="qa-body">It plots sorted residuals against normal quantiles at (i − 0.5)/n; a straight line means roughly normal, an S-shape heavy tails, a curve skew, and isolated end points outliers. For coefficients, the central limit theorem makes inference robust in moderate samples. For prediction intervals it matters at any sample size, because a symmetric interval is the wrong shape for skewed errors.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is VIF? Compute it for two features with correlation 0.968.</summary><div class="qa-body">VIFⱼ = 1/(1 − R²ⱼ), where R²ⱼ comes from regressing feature j on all the others; it is how much the variance of wⱼ is inflated by collinearity, and the SE is inflated by √VIF. With two features R² is the squared correlation: 0.968² = 0.938, so VIF = 1/0.062 ≈ 16 and the SE is about 4 times larger. Above 5 to 10 is usually considered a problem.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Multicollinearity: what breaks and what does not?</summary><div class="qa-body">Standard errors inflate, individual coefficients become unstable and can flip sign, and individual p-values look insignificant even when the features are jointly significant. R² and predictions are not affected as long as new data keep the same correlation pattern. Fixes: drop or combine features, centre before polynomial terms, ridge, PCA, or more varied data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Outlier versus high leverage versus influential point?</summary><div class="qa-body">An outlier has an unusual y given its x (large studentised residual). A high-leverage point has unusual x values (large hᵢ). An influential point changes the fit substantially when removed, which usually requires both. A high-leverage point on the line changes nothing; an outlier in the middle only shifts the line a little; a high-leverage point off the line can rotate it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is Cook's distance? Compute it for r = 1.988, h = 0.524, p = 2.</summary><div class="qa-body">It measures how much all fitted values change when a row is deleted: Dᵢ = (rᵢ²/p)·hᵢ/(1 − hᵢ). Here (1.988²/2) × (0.524/0.476) = 1.976 × 1.10 ≈ 2.17. Values above 4/n deserve a look and above 1 are very influential.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why might Huber regression fail to fix an influential point?</summary><div class="qa-body">Huber down-weights rows with large residuals. A high-leverage point drags the line toward itself, so its own residual is not especially large and it keeps full weight, while other points get down-weighted. Huber protects against outliers in y, not leverage. Methods such as RANSAC, Theil–Sen or least trimmed squares resist leverage points.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the direction of omitted-variable bias.</summary><div class="qa-body">If the true model is y = β₀ + β₁x₁ + β₂x₂ + ε and x₂ is omitted, the short regression's slope is on average β₁ + β₂δ, where δ is the slope of x₂ on x₁. The bias β₂δ is positive when β₂ and δ have the same sign and negative otherwise. It is zero only if the omitted variable does not affect y or is uncorrelated with x₁.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is endogeneity, and how can it be addressed?</summary><div class="qa-body">A feature is endogenous when it is correlated with the error term, from omitted variables, measurement error or reverse causality. OLS is then biased, and more data does not fix it; residual plots will not reveal it. Remedies: include the confounder or a proxy, fixed effects with panel data, instrumental variables (2SLS), or randomised experiments.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why should you fix linearity before testing for heteroscedasticity?</summary><div class="qa-body">A missed curve makes the residuals large at some x values and small at others, which looks exactly like variance changing with x. On the flats, Breusch–Pagan gave p = 0.048 for the straight line and p = 0.43 once size² was added. Tests for one assumption are fooled by failures of another, so fix the mean first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Should you remove outliers to improve the fit?</summary><div class="qa-body">Only with a documented reason, such as a data-entry error or a row from a different population. Otherwise the point may be telling you the model is wrong (an influential flat that reveals a curve), and deleting points until the fit looks clean makes standard errors too small and the model fail on new data. Report results with and without, or use an appropriate robust method.</div></details>
</main>
`
});
