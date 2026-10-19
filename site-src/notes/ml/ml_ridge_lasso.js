// notes/ml/ml_ridge_lasso.js — Ridge, Lasso & Elastic Net
Object.assign(TOPIC_CONTENT, {
  "ml_ridge_lasso": `<main>
  <h1>Ridge, Lasso &amp; Elastic Net</h1>
  <div class="where"><span>Machine Learning</span><span>Regression</span><span>Ridge, Lasso &amp; Elastic Net</span></div>
  <p class="lead">Ordinary least squares breaks down when columns are correlated, duplicated, numerous or useless: weights swing wildly, signs flip, and test error explodes. Ridge, lasso and elastic net fix this by adding a price for large weights to the loss. This note derives ridge's closed form (XᵀX + λI)⁻¹Xᵀy and solves it by hand on a 4-row table, shows exactly how and why lasso sets weights to zero (soft-thresholding worked in 1-D, coordinate descent traced sweep by sweep), mixes the two into elastic net, and then covers everything you need in practice: correlated features, standardization, choosing α with RidgeCV / LassoCV, coefficient path plots, and every sklearn knob. Each formula is checked against sklearn.</p>

  <h2 id="rl-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 235" width="640">
<defs><marker id="rl-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="30" y="10" width="170" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="115" y="35" text-anchor="middle" font-size="13">Linear Regression</text>
<rect x="235" y="10" width="170" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="320" y="35" text-anchor="middle" font-size="13">Polynomial &amp; Basis</text>
<rect x="440" y="10" width="170" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="525" y="35" text-anchor="middle" font-size="13">Regularization (idea)</text>
<rect x="215" y="92" width="210" height="54" rx="8" class="fb sb" stroke-width="3"/><text x="320" y="115" text-anchor="middle" font-size="13.5" font-weight="700">Ridge, Lasso &amp; Elastic Net</text><text x="320" y="133" text-anchor="middle" font-size="11" class="tb">YOU ARE HERE</text>
<line x1="115" y1="50" x2="250" y2="90" stroke="currentColor" marker-end="url(#rl-a0)"/><line x1="320" y1="50" x2="320" y2="90" stroke="currentColor" marker-end="url(#rl-a0)"/><line x1="525" y1="50" x2="390" y2="90" stroke="currentColor" marker-end="url(#rl-a0)"/>
<text x="140" y="80" font-size="10.5" class="tm">unstable weights</text><text x="328" y="74" font-size="10.5" class="tm">too many columns</text><text x="450" y="80" font-size="10.5" class="tm">penalty, general</text>
<rect x="30" y="180" width="180" height="40" rx="8" class="fg sg"/><text x="120" y="205" text-anchor="middle" font-size="12.5">Logistic Regression (C)</text>
<rect x="230" y="180" width="180" height="40" rx="8" class="fg sg"/><text x="320" y="205" text-anchor="middle" font-size="12.5">Feature selection (L1)</text>
<rect x="430" y="180" width="180" height="40" rx="8" class="fg sg"/><text x="520" y="205" text-anchor="middle" font-size="12.5">SVM, nets: weight decay</text>
<line x1="270" y1="146" x2="140" y2="178" stroke="currentColor" marker-end="url(#rl-a0)"/><line x1="320" y1="146" x2="320" y2="178" stroke="currentColor" marker-end="url(#rl-a0)"/><line x1="370" y1="146" x2="500" y2="178" stroke="currentColor" marker-end="url(#rl-a0)"/>
</svg><figcaption>Three roads lead here: unstable OLS weights, the column explosion of polynomial features, and the general idea of regularization. The same L1/L2 penalties reappear in logistic regression, feature selection, SVMs and neural networks.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_regression">Linear Regression</a>, <a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a> and <a class="xref" data-note="ml_regularization">Regularization</a></b><span>OLS minimises the squared error and nothing else. With correlated columns (two cholesterol tests, two temperature sensors, x and x²) it gives huge opposite weights that cancel; with more columns than rows it has infinitely many perfect fits; with many useless columns it memorises noise (degree-15 polynomial: weights near 4,800, test RMSE 0.548). The Regularization note gave the general cure, "add a penalty for complexity"; it left the concrete models for here.</span></li>
    <li><b>This note adds: the three standard penalised linear models, completely</b><span>Ridge (L2 penalty, closed form, shrinks smoothly), lasso (L1 penalty, exact zeros, built-in feature selection), elastic net (a mix that keeps correlated groups together). How each is solved, how each behaves with correlated columns, why you must standardise, how to choose α by cross-validation, and how to read coefficient paths.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_classification">Logistic Regression</a> and beyond</b><span>Logistic regression uses exactly these penalties (sklearn's <code>C</code> = 1/α, <code>penalty='l1'|'l2'|'elasticnet'</code>). L1 is one of the embedded feature-selection methods in <a class="xref" data-note="ml_dimred">Curse of Dimensionality &amp; Feature Selection</a>. The L2 penalty is "weight decay" in neural networks and the margin term in <a class="xref" data-note="ml_svm">Support Vector Machines</a>; XGBoost's <code>reg_lambda</code> / <code>reg_alpha</code> are the same idea on leaf weights.</span></li>
  </ol>
  <p>You should know the normal equation b = (XᵀX)⁻¹Xᵀy (<a class="xref" data-note="ml_regression">Linear Regression</a>), what a derivative is (<a class="xref" data-note="m_calculus">Calculus</a>), and k-fold cross-validation (<a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a>). Each is recalled where used.</p>

  <h2 id="rl-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Ridge, Lasso &amp; Elastic Net</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">1 · Why OLS fails</div>
        <ul>
          <li>Duplicate column → XᵀX = [[4,4],[4,4]], det 0, no inverse</li>
          <li>Correlated twins → weights like [−3.8, 6.8] that cancel, flip between resamples</li>
          <li>p ≥ n → infinitely many perfect fits; noise columns → test R² −0.26</li>
          <li>💡 Fix: charge a price for big weights; fit must earn every weight</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">2 · Ridge (L2)</div>
        <ul>
          <li>min ||y − Xw||² + λ||w||² → <b>w = (XᵀX + λI)⁻¹Xᵀy</b></li>
          <li>1-D: w = Σxy / (Σx² + λ) — divides, never 0</li>
          <li>Toy: λ = 0, 1, 2, 4 → [1, 2], [1.09, 1.27], [1, 1], [0.82, 0.73]</li>
          <li>+λI makes XᵀX invertible (eigenvalues d² → d² + λ)</li>
          <li>Shrinks direction j by d²ⱼ/(d²ⱼ + λ); df(λ) = Σ of those</li>
          <li>Intercept not penalised; Gaussian prior (MAP)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">3 · Lasso (L1)</div>
        <ul>
          <li>sklearn: min (1/2n)||y − Xw||² + α||w||₁; no closed form</li>
          <li>1-D: <b>w = S(ρ, α) / s</b>, S = sign(ρ)·max(|ρ| − α, 0) — subtracts</li>
          <li>Zero when |ρ| ≤ α: data's pull weaker than the constant L1 pull</li>
          <li>Geometry: diamond corners lie on the axes</li>
          <li>Solved by <b>coordinate descent</b>: soft-threshold one weight at a time</li>
          <li>Laplace prior (MAP); at most n non-zeros when p &gt; n</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">4 · Elastic Net</div>
        <ul>
          <li>α·r·||w||₁ + α(1 − r)/2·||w||², r = <code>l1_ratio</code></li>
          <li>1-D: w = S(ρ, αr) / (s + α(1 − r)) — subtract, then divide</li>
          <li>Students: α = 5, r = 0.5 → 1.785 (lasso 2.457)</li>
          <li>Zeros + grouping of correlated features</li>
          <li>r = 1 lasso; r → 0 ridge with Ridge-alpha = n·α</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">5 · Behaviour</div>
        <ul>
          <li><b>Correlated twins</b>: ridge [1.5, 1.5] shares · lasso [2.9, 0] picks one · ENet shares</li>
          <li>Identical columns: ridge splits exactly evenly; lasso's split is arbitrary</li>
          <li><b>Standardise first</b>: crore vs lakh changed lasso weight 200 → 47.8</li>
          <li>Ridge coefficients can change sign / grow along the path; lasso path piecewise linear</li>
          <li>⚠ Lasso selection ≠ causation; unstable with twins</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">6 · Choosing α &amp; using it</div>
        <ul>
          <li><code>RidgeCV</code> (fast leave-one-out), <code>LassoCV</code>, <code>ElasticNetCV</code> → <code>alpha_</code></li>
          <li>1-SE rule: diabetes 10 → 4 features, same test R² (0.487 → 0.481)</li>
          <li>210 columns (200 noise): OLS −0.258 · Ridge 0.366 · Lasso 0.485 with 6 kept</li>
          <li>Paths: bmi and s5 enter first (α ≈ 43)</li>
          <li>Scaler inside a <code>Pipeline</code>; α grid on log scale</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="rl-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Where OLS Breaks</span><span class="rm-sub">Duplicates, twins, too many columns</span></div></div>
      <div class="rm-item rm-done" data-target="rl-ridge"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Ridge Regression</span><span class="rm-sub">Closed form derived and solved by hand</span></div></div>
      <div class="rm-item rm-done" data-target="rl-shrink"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">How Ridge Shrinks</span><span class="rm-sub">Eigen-directions, df, the path</span></div></div>
      <div class="rm-item rm-done" data-target="rl-lasso"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Lasso Regression</span><span class="rm-sub">Objective and geometry</span></div></div>
      <div class="rm-item rm-done" data-target="rl-soft"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Why Lasso Gives Zeros</span><span class="rm-sub">Soft-thresholding in 1-D</span></div></div>
      <div class="rm-item rm-done" data-target="rl-cd"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Coordinate Descent</span><span class="rm-sub">Three sweeps by hand</span></div></div>
      <div class="rm-item rm-done" data-target="rl-enet"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Elastic Net</span><span class="rm-sub">Mixing L1 and L2</span></div></div>
      <div class="rm-item rm-done" data-target="rl-corr"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Correlated Features</span><span class="rm-sub">Ridge shares, lasso picks one</span></div></div>
      <div class="rm-item rm-done" data-target="rl-std"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Standardization</span><span class="rm-sub">Why units change the answer</span></div></div>
      <div class="rm-item rm-done" data-target="rl-alpha"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Choosing α</span><span class="rm-sub">RidgeCV, LassoCV, 1-SE rule</span></div></div>
      <div class="rm-item rm-done" data-target="rl-path"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Coefficient Paths</span><span class="rm-sub">Reading the plots</span></div></div>
      <div class="rm-item rm-done" data-target="rl-sklearn"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">sklearn &amp; Variants</span><span class="rm-sub">Every knob, related models</span></div></div>
      <div class="rm-item rm-done" data-target="rl-compare"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Comparison</span><span class="rm-sub">OLS vs ridge vs lasso vs ENet</span></div></div>
      <div class="rm-item rm-done" data-target="rl-traps"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Scaling, leakage, over-reading zeros</span></div></div>
      <div class="rm-item rm-done" data-target="rl-qa"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="rl-why"><span class="num">01</span>Where Ordinary Least Squares Breaks</h2>
  <h3>The need</h3>
  <p>OLS picks the weights that make the squared error on the training rows as small as possible, with no other preference. That is fine when the columns carry clearly different information and there are many more rows than columns. Real tables often break those conditions:</p>
  <table class="tbl">
    <tr><th>Situation</th><th>Example</th><th>What OLS does</th></tr>
    <tr><td>Duplicate columns</td><td>price in rupees and price in thousands</td><td>XᵀX has no inverse: infinitely many equally good answers</td></tr>
    <tr><td>Highly correlated columns</td><td>two temperature sensors, x and x², two cholesterol tests</td><td>huge opposite weights that cancel; they flip with a few new rows</td></tr>
    <tr><td>More columns than rows (p ≥ n)</td><td>genes, text words, polynomial features</td><td>fits training data perfectly, predicts badly</td></tr>
    <tr><td>Many useless columns</td><td>a feature store with 200 columns, 10 useful</td><td>gives every noise column a weight, memorises noise</td></tr>
  </table>
  <h3>By hand: a duplicated column</h3>
  <p>Four rows, x₁ = 1, −1, 1, −1, and a second column that is an exact copy. The truth is y = 2x₁, so y = 2, −2, 2, −2. The normal equation needs (XᵀX)⁻¹. Each entry of XᵀX is a sum of products of two columns: Σx₁x₁ = 1 + 1 + 1 + 1 = 4, Σx₁x₂ = 4, Σx₂x₂ = 4. So XᵀX = [[4, 4], [4, 4]], whose determinant is 4·4 − 4·4 = <strong>0</strong>. A matrix with zero determinant has no inverse. In plain words: w₁ = 2, w₂ = 0 fits perfectly, so does w₁ = 0, w₂ = 2, so does w₁ = 102, w₂ = −100. The data cannot choose.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression, Ridge

x1 = np.array([1, -1, 1, -1.0])
X = np.c_[x1, x1]                       # the same column twice (e.g. price in Rs and in paise/100)
y = 2 * x1                              # truth: y = 2 * x1
print("X^T X =", (X.T @ X).tolist(), " det =", np.linalg.det(X.T @ X))
try:
    np.linalg.inv(X.T @ X)
except np.linalg.LinAlgError as e:
    print("inverse fails:", e)
print("OLS via lstsq (the smallest of infinitely many answers):", LinearRegression(fit_intercept=False).fit(X, y).coef_.round(3))
for lam in [1, 0.1]:
    w = np.linalg.solve(X.T @ X + lam * np.eye(2), X.T @ y)
    print(f"ridge lambda={lam}: by formula {w.round(3)}  sklearn {Ridge(alpha=lam, fit_intercept=False).fit(X, y).coef_.round(3)}")</div>
  <div class="fx" data-lang="text">X^T X = [[4.0, 4.0], [4.0, 4.0]]  det = 0.0
inverse fails: Singular matrix
OLS via lstsq (the smallest of infinitely many answers): [1. 1.]
ridge lambda=1: by formula [0.889 0.889]  sklearn [0.889 0.889]
ridge lambda=0.1: by formula [0.988 0.988]  sklearn [0.988 0.988]</div>
  <p>The inverse fails exactly as the hand calculation said. <code>LinearRegression</code> does not crash because it uses a least-squares solver that quietly returns the smallest of the infinitely many answers; that hides the problem rather than solving it. Adding λ to the diagonal (the ridge fix, next section) makes the matrix invertible, and the answer is unique and sensible: the two copies share the weight equally. The hand version for λ = 1: XᵀX + I = [[5, 4], [4, 5]], determinant 25 − 16 = 9, inverse (1/9)·[[5, −4], [−4, 5]]; Xᵀy = [8, 8]; so w = (1/9)·[40 − 32, −32 + 40] = [0.889, 0.889]. The total 1.78 is a little under the true 2: that small shortfall is the bias ridge accepts in exchange for stability.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two brothers did a school project together and the teacher must split 20 marks between them. With no other information, "20 and 0", "10 and 10" and "120 and −100" all add up. OLS has no opinion and may pick anything. A penalty on big marks is a rule like "prefer small, even numbers": it picks 10 and 10.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Ill-posed / ill-conditioned least squares</strong>: XᵀX is singular (columns linearly dependent, or p &gt; n) or nearly singular (columns highly correlated). The OLS solution is then not unique, or unique but extremely sensitive to small changes in the data (high variance). <strong>Regularization</strong> adds a penalty that makes the problem well-posed by preferring small weights.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>sklearn and numpy will usually not warn you. A model with weights like [−37.7, 22.7] on two near-identical columns runs fine and even scores fine on training data. Look at the coefficients, the condition number or the VIFs (<a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a>) before trusting individual weights.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We need a precise rule that prefers small weights, and a way to solve it. The simplest such rule charges the squares of the weights.</div>

  <h2 id="rl-ridge"><span class="num">02</span>Ridge Regression (L2)</h2>
  <h3>Plain words</h3>
  <p>Ridge minimises <em>error + λ × (sum of squared weights)</em>. Every weight now has a cost. A weight survives at a large value only if it reduces the squared error by more than it costs. λ (sklearn calls it <code>alpha</code>) sets the exchange rate: λ = 0 is plain OLS, a huge λ pushes every weight toward 0, so the model predicts the average.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A percentage tax on weights. Big weights pay a lot, small ones a little, and the tax is never more than the weight is worth, so nobody is wiped out entirely. Everyone just gets smaller.</p>
  </div>
  <h3>Deriving the closed form</h3>
  <p>Write the ridge loss in matrix form, with X the (centred) feature table, y the (centred) target, w the weights:</p>
  <p style="text-align:center"><strong>L(w) = (y − Xw)ᵀ(y − Xw) + λ·wᵀw</strong></p>
  <p>Step 1, expand: L = yᵀy − 2wᵀXᵀy + wᵀXᵀXw + λwᵀw. Step 2, take the derivative with respect to w (the same rules as for numbers: the derivative of −2wb is −2b, of w·a·w is 2aw): ∂L/∂w = −2Xᵀy + 2XᵀXw + 2λw. Step 3, set it to zero at the minimum: XᵀXw + λw = Xᵀy, i.e. (XᵀX + λI)w = Xᵀy. Step 4, solve:</p>
  <p style="text-align:center"><strong>ŵ_ridge = (XᵀX + λI)⁻¹ Xᵀy</strong></p>
  <p>Compared with OLS, the only change is "+ λ" on the diagonal of XᵀX. With one feature everything is a number: <strong>w = Σxy / (Σx² + λ)</strong>. The penalty sits in the denominator, so the weight is <em>divided</em> down: it shrinks toward 0 as λ grows but never reaches it. The loss is a sum of a convex bowl and a strictly convex bowl (λ &gt; 0), so there is exactly one minimum.</p>
  <h3>Worked by hand: a 4-row table</h3>
  <p>Two centred features, centred target. The truth here happens to be y = x₁ + 2x₂ exactly.</p>
  <table class="tbl">
    <tr><th>row</th><th>x₁</th><th>x₂</th><th>y</th></tr>
    <tr><td>1</td><td>1</td><td>1</td><td>3</td></tr>
    <tr><td>2</td><td>−1</td><td>−1</td><td>−3</td></tr>
    <tr><td>3</td><td>1</td><td>0</td><td>1</td></tr>
    <tr><td>4</td><td>−1</td><td>0</td><td>−1</td></tr>
  </table>
  <p>XᵀX: Σx₁² = 4, Σx₁x₂ = 1 + 1 + 0 + 0 = 2, Σx₂² = 2, so XᵀX = [[4, 2], [2, 2]]. Xᵀy: Σx₁y = 3 + 3 + 1 + 1 = 8, Σx₂y = 3 + 3 = 6. For a 2 × 2 matrix [[a, b], [b, d]] the inverse is (1/(ad − b²))·[[d, −b], [−b, a]].</p>
  <table class="tbl out"><caption>Ridge by hand: (XᵀX + λI)⁻¹ Xᵀy with Xᵀy = [8, 6]</caption>
    <tr><th>λ</th><th>XᵀX + λI</th><th>det</th><th>w₁</th><th>w₂</th></tr>
    <tr><td>0 (OLS)</td><td>[[4, 2], [2, 2]]</td><td>8 − 4 = 4</td><td>(2·8 − 2·6)/4 = <strong>1</strong></td><td>(−2·8 + 4·6)/4 = <strong>2</strong></td></tr>
    <tr><td>1</td><td>[[5, 2], [2, 3]]</td><td>15 − 4 = 11</td><td>(3·8 − 2·6)/11 = <strong>1.091</strong></td><td>(−2·8 + 5·6)/11 = <strong>1.273</strong></td></tr>
    <tr><td>2</td><td>[[6, 2], [2, 4]]</td><td>24 − 4 = 20</td><td>(4·8 − 2·6)/20 = <strong>1</strong></td><td>(−2·8 + 6·6)/20 = <strong>1</strong></td></tr>
    <tr><td>4</td><td>[[8, 2], [2, 6]]</td><td>48 − 4 = 44</td><td>(6·8 − 2·6)/44 = <strong>0.818</strong></td><td>(−2·8 + 8·6)/44 = <strong>0.727</strong></td></tr>
  </table>
  <p>Three things to notice. (1) The total size ||w||² falls: 5 → 2.81 → 2 → 1.20. (2) The training error rises: at λ = 2 the residuals are 3 − 2 = 1, −3 + 2 = −1, 1 − 1 = 0, −1 + 1 = 0, so RSS = 2 instead of 0. Ridge deliberately fits the training data worse. (3) w₁ <em>grew</em> from 1 to 1.091 at λ = 1 before shrinking. Ridge shrinks the length of the weight vector, not necessarily every single weight; section 03 explains why.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import Ridge

X = np.array([[1, 1], [-1, -1], [1, 0], [-1, 0.0]])    # 4 rows, 2 centred features
y = np.array([3, -3, 1, -1.0])                          # centred target
A, b = X.T @ X, X.T @ y
print("X^T X =", A.tolist(), " X^T y =", b.tolist())
for lam in [0, 1, 2, 4, 10, 100]:
    w = np.linalg.solve(A + lam * np.eye(2), b)                   # (X^T X + lam I)^-1 X^T y
    sk = Ridge(alpha=lam, fit_intercept=False).fit(X, y).coef_ if lam else w
    print(f"lambda={lam:&lt;4} formula w={w.round(3)}  sklearn w={sk.round(3)}  ||w||^2={w @ w:.3f}  RSS={np.sum((y - X @ w)**2):.3f}")

d2, V = np.linalg.eigh(A)                                # eigenvalues d^2 of X^T X
print("eigenvalues of X^T X:", d2.round(3))
for lam in [0, 2, 10]:
    f = d2 / (d2 + lam)
    print(f"lambda={lam:&lt;3} shrink factors {f.round(3)}  effective df = {f.sum():.3f}")</div>
  <div class="fx" data-lang="text">X^T X = [[4.0, 2.0], [2.0, 2.0]]  X^T y = [8.0, 6.0]
lambda=0    formula w=[1. 2.]  sklearn w=[1. 2.]  ||w||^2=5.000  RSS=0.000
lambda=1    formula w=[1.091 1.273]  sklearn w=[1.091 1.273]  ||w||^2=2.810  RSS=0.826
lambda=2    formula w=[1. 1.]  sklearn w=[1. 1.]  ||w||^2=2.000  RSS=2.000
lambda=4    formula w=[0.818 0.727]  sklearn w=[0.818 0.727]  ||w||^2=1.198  RSS=4.298
lambda=10   formula w=[0.512 0.415]  sklearn w=[0.512 0.415]  ||w||^2=0.434  RSS=9.072
lambda=100  formula w=[0.076 0.057]  sklearn w=[0.076 0.057]  ||w||^2=0.009  RSS=18.146
eigenvalues of X^T X: [0.764 5.236]
lambda=0   shrink factors [1. 1.]  effective df = 2.000
lambda=2   shrink factors [0.276 0.724]  effective df = 1.000
lambda=10  shrink factors [0.071 0.344]  effective df = 0.415</div>
  <p>Formula, hand table and sklearn agree at every λ. (Ignore the last three lines for now; they are section 03.) <code>fit_intercept=False</code> because our data is already centred; sklearn's <code>Ridge</code> minimises exactly ||y − Xw||² + α||w||², so its <code>alpha</code> is our λ.</p>
  <h3>The intercept is not penalised</h3>
  <p>Shrinking the intercept toward 0 would make predictions depend on where zero happens to be (degrees Celsius vs Fahrenheit, rupees vs paise). So ridge penalises only the slopes. In practice sklearn centres X and y, solves the ridge problem on the centred data, and then sets b₀ = ȳ − x̄ᵀw. Here the same toy data is shifted by +5, +20 in the features and +50 in y:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import Ridge
X = np.array([[1, 1], [-1, -1], [1, 0], [-1, 0.0]]); y = np.array([3, -3, 1, -1.0])
Xs, ys = X + [5, 20], y + 50                       # same data, shifted away from 0
m = Ridge(alpha=2).fit(Xs, ys)                     # fit_intercept=True (default)
print("weights", m.coef_.round(3), " intercept", round(m.intercept_, 3),
      " = ybar - xbar.w =", round(ys.mean() - Xs.mean(0) @ m.coef_, 3))
naive = np.linalg.solve(np.c_[np.ones(4), Xs].T @ np.c_[np.ones(4), Xs] + 2 * np.eye(3), np.c_[np.ones(4), Xs].T @ ys)
print("if the intercept were penalised too:", naive.round(3))</div>
  <div class="fx" data-lang="text">weights [1. 1.]  intercept 25.0  = ybar - xbar.w = 25.0
if the intercept were penalised too: [0.118 0.764 2.3  ]</div>
  <p>The slopes are still [1, 1], and the intercept is 50 − (5·1 + 20·1) = 25, exactly ȳ − x̄ᵀw. Penalising the intercept as well (the naive version, adding λ to all three diagonal entries) gives nonsense slopes 0.764 and 2.3, because the model now prefers a small intercept over a correct fit.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Ridge regression</strong> (Hoerl &amp; Kennard, 1970; also Tikhonov regularization): ŵ = argmin ||y − Xw||² + λ||w||₂², with ||w||₂² = Σwⱼ² and the intercept unpenalised. Closed form ŵ = (XᵀX + λI)⁻¹Xᵀy on centred data, unique for any λ &gt; 0 even when XᵀX is singular. Equivalent constrained form: minimise ||y − Xw||² subject to Σwⱼ² ≤ t, where each λ corresponds to some budget t.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>sklearn's estimators do not share one scale for α. <code>Ridge</code> uses ||y − Xw||² + α||w||² (no 1/n). <code>Lasso</code> and <code>ElasticNet</code> use (1/2n)||y − Xw||² + …. So "α = 1" means very different strengths in the two, and changes with n for one but not the other. Never copy an α from one class to another.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We saw ridge shrink, but not <em>how</em>: why did w₁ grow first, and which parts of the data does ridge trust less? The answer is in the eigenvectors of XᵀX.</div>

  <h2 id="rl-shrink"><span class="num">03</span>How Ridge Shrinks</h2>
  <h3>Directions in the data</h3>
  <p>The matrix XᵀX describes how spread out the data is in each direction. Its eigenvectors are the principal directions (the same ones <a class="xref" data-note="ml_pca">PCA</a> finds) and its eigenvalues d² say how much spread there is along each. Adding λI adds λ to every eigenvalue and leaves the directions unchanged. The result: along a direction with spread d², ridge keeps a fraction</p>
  <p style="text-align:center"><strong>shrink factor = d² / (d² + λ)</strong></p>
  <p>of the OLS answer. Directions with lots of spread (d² ≫ λ) keep almost everything. Directions with little spread (d² ≪ λ), where the data says very little and OLS was guessing, are shrunk almost to 0.</p>
  <h3>By hand on the toy</h3>
  <p>Eigenvalues of [[4, 2], [2, 2]]: solve det(XᵀX − μI) = (4 − μ)(2 − μ) − 4 = μ² − 6μ + 4 = 0, so μ = 3 ± √5 = <strong>5.236</strong> and <strong>0.764</strong>. The big one's direction is u₁ = (0.851, 0.526) (mostly x₁, some x₂: "both up together"); the small one's is u₂ = (−0.526, 0.851) ("x₂ up, x₁ down", a combination the four rows barely vary in).</p>
  <table class="tbl out"><caption>Ridge λ = 2, worked in the eigen-directions</caption>
    <tr><th>direction</th><th>d²</th><th>shrink d²/(d² + 2)</th><th>OLS component uᵀ[1, 2]</th><th>ridge component</th></tr>
    <tr><td>u₁ = (0.851, 0.526)</td><td>5.236</td><td>5.236 / 7.236 = 0.724</td><td>0.851 + 1.052 = 1.903</td><td>1.903 × 0.724 = 1.378</td></tr>
    <tr><td>u₂ = (−0.526, 0.851)</td><td>0.764</td><td>0.764 / 2.764 = 0.276</td><td>−0.526 + 1.702 = 1.176</td><td>1.176 × 0.276 = 0.325</td></tr>
  </table>
  <p>Back to (w₁, w₂): 1.378·(0.851, 0.526) + 0.325·(−0.526, 0.851) = (1.173 − 0.171, 0.725 + 0.277) = <strong>(1.00, 1.00)</strong>, the same answer as the matrix inverse. Now the w₁ puzzle is clear: OLS's [1, 2] has a big component along the weak direction u₂, which points to <em>negative</em> x₁. Shrinking that component hard removes some of its negative x₁ part, so w₁ can rise even while the vector as a whole shrinks.</p>
  <h3>Effective degrees of freedom</h3>
  <p>OLS with p columns uses p degrees of freedom. Ridge uses fewer: <strong>df(λ) = Σⱼ d²ⱼ / (d²ⱼ + λ)</strong>, the sum of the shrink factors. For λ = 2: 0.724 + 0.276 = <strong>1.000</strong>. The two-weight ridge model has the flexibility of about one free weight. λ is a smooth dial between p (λ = 0) and 0 (λ → ∞), unlike "drop a column", which jumps by whole numbers. These are the last three lines of the code output above (eigenvalues 0.764, 5.236; df 2.000, 1.000, 0.415).</p>
  <h3>The shrinkage path</h3>
  <p>Plotting each weight against λ gives the ridge path: all weights glide smoothly toward 0, never touching it. On the toy: [1, 2] → [1.09, 1.27] → [1, 1] → [0.82, 0.73] → [0.51, 0.42] (λ = 10) → [0.08, 0.06] (λ = 100). Section 11 draws the path on real data.</p>
  <h3>Why trading bias for variance pays</h3>
  <p>Shrinking adds bias: the λ = 2 weights [1, 1] are not the truth [1, 2]. But it removes variance: the weak direction u₂, which would swing wildly with every new sample, is mostly ignored. Expected test error = bias² + variance + noise (derived in <a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a>). There is always some λ &gt; 0 at which the drop in variance beats the rise in bias squared (a classic result by Hoerl and Kennard), which is why a well-tuned ridge rarely loses to OLS on new data.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Ridge is "OLS that trusts each direction of the data in proportion to how much the data actually varies in it". Correlated columns create a direction with almost no variation (their difference). OLS puts huge, unstable weight there; ridge nearly ignores it. That is the whole cure for multicollinearity.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>With the SVD X = UDVᵀ, ridge predictions are ŷ = Σⱼ uⱼ · d²ⱼ/(d²ⱼ + λ) · uⱼᵀy: each principal component of y is kept with factor d²ⱼ/(d²ⱼ + λ). <strong>Bayesian view</strong>: ridge is the most likely w (MAP estimate) when each weight has a Normal(0, σ²/λ) prior, i.e. "I believe weights are small and Gaussian" (see <a class="xref" data-note="ml_regularization">Regularization</a>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Ridge never produces exact zeros, so it is not a feature selector. "Ridge shrank this weight to 0.002" means "small", not "removed": the column is still needed at prediction time. If you need fewer columns, you need an L1 penalty.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Ridge keeps every column. With 200 columns of which 10 matter, we would like a model that switches the useless ones fully off. Changing the square to an absolute value does exactly that.</div>

  <h2 id="rl-lasso"><span class="num">04</span>Lasso Regression (L1)</h2>
  <h3>The objective</h3>
  <p>Lasso (Tibshirani, 1996: "least absolute shrinkage and selection operator") charges the <em>absolute values</em> of the weights. sklearn writes it as</p>
  <p style="text-align:center"><strong>min over w: (1/2n)·||y − Xw||² + α·Σ|wⱼ|</strong></p>
  <p>The 1/(2n) only rescales α (so the same α means about the same thing whatever the number of rows); the minimiser is the same as for ||y − Xw||² + 2nα·Σ|wⱼ|. The intercept is again not penalised.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A fixed fee instead of a percentage tax. Every feature that wants a non-zero weight must pay the same flat fee α per unit of weight, however small its contribution. Features whose contribution is worth less than the fee drop out completely: they end up with nothing.</p>
  </div>
  <h3>Why there is no closed form</h3>
  <p>For ridge we took the derivative and set it to 0. |w| has no derivative at w = 0: the slope jumps from −1 (left) to +1 (right), a sharp corner. That corner is exactly what makes lasso useful (it is where the weights get stuck at 0), and it is also why there is no one-line formula for several features. In one dimension we can still solve it by hand (next section); for many dimensions we use coordinate descent (section 06) or LARS.</p>
  <h3>The geometry: diamonds have corners</h3>
  <p>The constrained form is "minimise the squared error, but stay inside a budget region". For lasso the region |w₁| + |w₂| ≤ t is a diamond whose corners sit on the axes; for ridge w₁² + w₂² ≤ t it is a circle. The error's contour lines are ellipses around the OLS answer. Grow the ellipses until they first touch the region. A circle has no special points, so it is touched somewhere generic, with both weights non-zero. A diamond sticks out at its corners, so the ellipse usually touches a corner first, and at a corner one weight is exactly 0. In higher dimensions the L1 ball has even more corners and edges, so even more weights land on 0.</p>
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
</svg><figcaption>Error contours (red) grow from the OLS solution until they touch the allowed region. The L1 diamond is usually first touched at a corner, where one weight is exactly 0; the L2 circle at a point where both are non-zero.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Lasso</strong>: ŵ = argmin (1/2n)||y − Xw||² + α||w||₁, with ||w||₁ = Σ|wⱼ|. Convex but not differentiable at wⱼ = 0. Its solutions are <strong>sparse</strong> (many exact zeros), so it does estimation and feature selection at once. When p &gt; n it keeps at most n non-zero weights. Bayesian view: the MAP estimate under a Laplace (double-exponential) prior, which has a sharp peak at 0.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The diamond picture explains <em>that</em> zeros appear but not <em>which</em> weight becomes 0 or at what α. For real reasoning (and interviews) use the 1-D soft-threshold formula in the next section: it gives the exact α at which a weight dies.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> "Corners" is a picture. What is the actual rule that sets a weight to exactly 0, and at what α does it happen?</div>

  <h2 id="rl-soft"><span class="num">05</span>Why Lasso Sets Weights to Zero: Soft-Thresholding</h2>
  <h3>The pull on one weight</h3>
  <p>During fitting, the penalty pulls every weight toward 0. The size of the pull is the slope of the penalty. Ridge's penalty λw² has slope 2λw: proportional to w, so it fades as w gets small. Lasso's penalty α|w| has slope α (for w ≠ 0): the same size however small w is. With α = λ = 1:</p>
  <table class="tbl out"><caption>Penalty pull on a weight</caption>
    <tr><th>current w</th><th>L2 pull 2λw</th><th>L1 pull α</th></tr>
    <tr><td>4</td><td>8</td><td>1</td></tr>
    <tr><td>1</td><td>2</td><td>1</td></tr>
    <tr><td>0.25</td><td>0.5</td><td>1</td></tr>
    <tr><td>0.01</td><td>0.02 (almost nothing)</td><td>1 (still full strength)</td></tr>
  </table>
  <p>Near 0, the ridge pull vanishes, so a weak weight settles at a small non-zero value. The lasso pull stays at full strength all the way down; if the data's push on the weight is weaker than α, nothing can hold the weight up, and it lands on exactly 0.</p>
  <h3>Deriving the 1-D solution</h3>
  <p>One centred feature x and centred target y. Write ρ = (1/n)Σxᵢyᵢ (how strongly x and y move together, "the data's push") and s = (1/n)Σxᵢ² (x's spread). The lasso loss is f(w) = (1/2n)Σ(yᵢ − w·xᵢ)² + α|w|. The smooth part has derivative −ρ + s·w. Now three cases:</p>
  <table class="tbl">
    <tr><th>Case</th><th>Set derivative to 0</th><th>Solution</th><th>Consistent only if</th></tr>
    <tr><td>w &gt; 0 (|w|' = +1)</td><td>−ρ + s·w + α = 0</td><td>w = (ρ − α) / s</td><td>ρ &gt; α</td></tr>
    <tr><td>w &lt; 0 (|w|' = −1)</td><td>−ρ + s·w − α = 0</td><td>w = (ρ + α) / s</td><td>ρ &lt; −α</td></tr>
    <tr><td>w = 0 (corner)</td><td>0 must lie in [−ρ − α, −ρ + α] (the range of slopes at the corner)</td><td>w = 0</td><td>|ρ| ≤ α</td></tr>
  </table>
  <p>All three fit into one formula:</p>
  <p style="text-align:center"><strong>w = S(ρ, α) / s,   where S(ρ, α) = sign(ρ) · max(|ρ| − α, 0)</strong></p>
  <p>S is the <strong>soft-threshold</strong> operator: move ρ toward 0 by α, and stop at 0 if you would cross it. Compare: OLS is w = ρ / s; ridge (in this scaling) is w = ρ / (s + λ), dividing; lasso <em>subtracts</em> α first. Subtracting is what reaches zero.</p>
  <h3>Worked by hand: six students</h3>
  <p>Hours studied x = 1..6, marks y = 52, 55, 61, 62, 70, 72 (the example from <a class="xref" data-note="ml_regression">Linear Regression</a>). Centred sums: Σdx·dy = 73, Σdx² = 17.5, n = 6. So ρ = 73/6 = 12.167, s = 17.5/6 = 2.917, and the OLS slope ρ/s = 4.171.</p>
  <table class="tbl out"><caption>Lasso slope w = max(12.167 − α, 0) / 2.917</caption>
    <tr><th>α</th><th>|ρ| − α</th><th>w</th><th>case</th></tr>
    <tr><td>0.5</td><td>11.667</td><td>11.667 / 2.917 = <strong>4.000</strong></td><td>w &gt; 0</td></tr>
    <tr><td>5</td><td>7.167</td><td>7.167 / 2.917 = <strong>2.457</strong></td><td>w &gt; 0</td></tr>
    <tr><td>10</td><td>2.167</td><td>2.167 / 2.917 = <strong>0.743</strong></td><td>w &gt; 0</td></tr>
    <tr><td>12.17</td><td>−0.003 → 0</td><td><strong>0</strong></td><td>corner</td></tr>
    <tr><td>13</td><td>−0.833 → 0</td><td><strong>0</strong></td><td>corner</td></tr>
  </table>
  <p>Check α = 13 the long way. Try w &gt; 0: w = (12.167 − 13)/2.917 = −0.29, which is not &gt; 0, contradiction. Try w &lt; 0: w = (12.167 + 13)/2.917 = 8.6, not &lt; 0, contradiction. Only the corner is left, and indeed |ρ| = 12.167 ≤ 13. So w = 0: at this fee, hours studied is not worth including. The critical value is α = |ρ| = 12.167: above it the weight is dead. (In sklearn's scaling, the largest useful α for a whole dataset is α_max = maxⱼ |xⱼᵀy| / n; above it every weight is 0, and <code>LassoCV</code> starts its grid there.)</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import Lasso, Ridge

def soft_threshold(rho, lam):
    return np.sign(rho) * max(abs(rho) - lam, 0.0)

x = np.array([1, 2, 3, 4, 5, 6.0]); y = np.array([52, 55, 61, 62, 70, 72.0])   # hours -&gt; marks
n = len(x); dx, dy = x - x.mean(), y - y.mean()
rho, s = (dx @ dy) / n, (dx @ dx) / n                 # (1/n) sum dx*dy  and  (1/n) sum dx^2
print(f"rho = {rho:.3f}  s = {s:.3f}  OLS slope = rho/s = {rho / s:.3f}")
for a in [0.5, 5, 10, 12.17, 13]:
    hand = soft_threshold(rho, a) / s
    skl = Lasso(alpha=a).fit(x[:, None], y).coef_[0]
    print(f"alpha={a:&lt;5}  hand w = S({rho:.3f}, {a}) / {s:.3f} = {hand:.3f}   sklearn {skl:.3f}")</div>
  <div class="fx" data-lang="text">rho = 12.167  s = 2.917  OLS slope = rho/s = 4.171
alpha=0.5    hand w = S(12.167, 0.5) / 2.917 = 4.000   sklearn 4.000
alpha=5      hand w = S(12.167, 5) / 2.917 = 2.457   sklearn 2.457
alpha=10     hand w = S(12.167, 10) / 2.917 = 0.743   sklearn 0.743
alpha=12.17  hand w = S(12.167, 12.17) / 2.917 = 0.000   sklearn 0.000
alpha=13     hand w = S(12.167, 13) / 2.917 = 0.000   sklearn 0.000</div>
  <figure class="viz"><svg viewBox="0 0 560 260" width="560">
<line x1="40" y1="130" x2="520" y2="130" stroke="currentColor"/><line x1="280" y1="15" x2="280" y2="245" stroke="currentColor"/>
<text x="516" y="146" text-anchor="end" class="tm" font-size="11">ρ (data's push, OLS ∝ ρ)</text><text x="288" y="24" class="tm" font-size="11">fitted w</text>
<text x="200" y="146" text-anchor="middle" class="tm" font-size="10.5">−α</text><text x="360" y="146" text-anchor="middle" class="tm" font-size="10.5">+α</text>
<line x1="60" y1="240" x2="500" y2="20" stroke="currentColor" stroke-opacity="0.35" stroke-dasharray="5 4"/>
<line x1="60" y1="185" x2="500" y2="75" class="st" stroke-width="2"/>
<polyline points="60,200 200,130 360,130 500,60" fill="none" class="sb" stroke-width="2.5"/>
<polyline points="60,240 200,170" fill="none" class="sr" stroke-width="2"/><line x1="200" y1="130" x2="360" y2="130" class="sr" stroke-width="2" stroke-dasharray="1 4"/><polyline points="360,90 500,20" fill="none" class="sr" stroke-width="2"/>
<text x="430" y="18" class="tm" font-size="11">OLS w = ρ/s</text>
<text x="70" y="178" class="tm" font-size="11">ridge: divide (never 0)</text>
<text x="380" y="78" class="tb" font-size="11.5">lasso: subtract α, stop at 0</text>
<text x="380" y="40" class="tr" font-size="11">hard threshold: keep or kill</text>
<text x="280" y="122" text-anchor="middle" class="tb" font-size="11">dead zone |ρ| ≤ α → w = 0</text>
</svg><figcaption>Three ways to shrink one weight, as a function of the data's push ρ. OLS (dashed) is a straight line. Ridge (teal) scales it down, never reaching 0. Lasso (blue) is flat at 0 in the dead zone and then runs parallel to OLS, shifted by α (soft threshold). Best-subset selection is a hard threshold (red): unchanged or zero.</figcaption></figure>
  <p>Read the picture as a summary of the whole note: ridge <em>divides</em> every weight by the same factor; lasso <em>subtracts</em> the same amount from every weight's push, which kills weak ones and also biases strong ones down by α/s (the blue line is below the dashed one even for large ρ). That last fact is why lasso's surviving weights are a bit too small, and why variants like the relaxed or adaptive lasso exist (section 12).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Soft-thresholding</strong>: S(z, γ) = sign(z)·max(|z| − γ, 0). The 1-D lasso solution is w = S(ρ, α)/s; with standardised x (s = 1) it is just S(ρ, α). For orthonormal columns (XᵀX = nI) every lasso weight is the soft-thresholded OLS weight, every ridge weight is the OLS weight divided by (1 + λ/n), and best-subset is the hard-thresholded OLS weight.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Lasso shrinks big weights less" is wrong. It subtracts the same α/s from every surviving weight (in the orthonormal case), big or small. Ridge is the one whose absolute shrinkage grows with the weight. What is true: lasso's <em>relative</em> shrinkage is small for big weights.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> One weight can be solved by hand. With many correlated features the weights interact. How does the computer actually find the lasso solution?</div>

  <h2 id="rl-cd"><span class="num">06</span>Coordinate Descent</h2>
  <h3>The idea</h3>
  <p>We can solve lasso exactly for one weight if the others are held fixed: it is the 1-D problem again, with y replaced by "what the other features have not explained yet". So: cycle through the weights one at a time, solving each 1-D problem exactly, and repeat the sweep until nothing changes. Because the lasso loss is convex and the non-smooth part splits into separate |wⱼ| terms, this simple loop converges to the global minimum. It is what sklearn's <code>Lasso</code> and <code>ElasticNet</code> use.</p>
  <div class="flow"><span>Start w = 0</span><span>For feature j: residual without j</span><span>ρⱼ = (1/n)·xⱼ · residual</span><span>wⱼ = S(ρⱼ, α) / sⱼ</span><span>Next j; repeat sweeps until stable</span></div>
  <h3>Worked by hand: three sweeps</h3>
  <p>The 4-row toy from section 02 (x₁ = 1, −1, 1, −1; x₂ = 1, −1, 0, 0; y = 3, −3, 1, −1), with α = 0.5. Here s₁ = (1/4)·Σx₁² = 4/4 = 1 and s₂ = 2/4 = 0.5.</p>
  <table class="tbl out"><caption>Coordinate descent for lasso, α = 0.5</caption>
    <tr><th>step</th><th>residual without this feature</th><th>ρ = (1/4)·x · residual</th><th>S(ρ, 0.5)</th><th>new weight</th><th>w after</th></tr>
    <tr><td>sweep 1, w₁</td><td>y − 0 = [3, −3, 1, −1]</td><td>(3 + 3 + 1 + 1)/4 = 2</td><td>1.5</td><td>1.5 / 1 = 1.5</td><td>[1.5, 0]</td></tr>
    <tr><td>sweep 1, w₂</td><td>y − 1.5x₁ = [1.5, −1.5, −0.5, 0.5]</td><td>(1.5 + 1.5)/4 = 0.75</td><td>0.25</td><td>0.25 / 0.5 = 0.5</td><td>[1.5, 0.5]</td></tr>
    <tr><td>sweep 2, w₁</td><td>y − 0.5x₂ = [2.5, −2.5, 1, −1]</td><td>(2.5 + 2.5 + 1 + 1)/4 = 1.75</td><td>1.25</td><td>1.25</td><td>[1.25, 0.5]</td></tr>
    <tr><td>sweep 2, w₂</td><td>y − 1.25x₁ = [1.75, −1.75, −0.25, 0.25]</td><td>3.5/4 = 0.875</td><td>0.375</td><td>0.75</td><td>[1.25, 0.75]</td></tr>
    <tr><td>sweep 3, w₁</td><td>y − 0.75x₂ = [2.25, −2.25, 1, −1]</td><td>6.5/4 = 1.625</td><td>1.125</td><td>1.125</td><td>[1.125, 0.75]</td></tr>
    <tr><td>sweep 3, w₂</td><td>y − 1.125x₁ = [1.875, −1.875, −0.125, 0.125]</td><td>3.75/4 = 0.9375</td><td>0.4375</td><td>0.875</td><td>[1.125, 0.875]</td></tr>
  </table>
  <p>The weights creep toward a fixed point. Find it directly: at convergence w₁ = (2 − 0.5w₂) − 0.5 = 1.5 − 0.5w₂ and w₂ = ((1.5 − 0.5w₁) − 0.5)/0.5 = 2 − w₁. Substituting: w₁ = 1.5 − 0.5(2 − w₁) = 0.5 + 0.5w₁, so <strong>w₁ = 1, w₂ = 1</strong>. Compare OLS [1, 2]: lasso shrank w₂ by more.</p>
  <p><strong>Raise α to 1.5.</strong> Sweep 1: ρ₁ = 2 → S(2, 1.5) = 0.5 → w₁ = 0.5. Then the residual is y − 0.5x₁ = [2.5, −2.5, 0.5, −0.5], ρ₂ = (2.5 + 2.5)/4 = 1.25, and |1.25| ≤ 1.5, so <strong>w₂ = 0</strong>. Sweep 2 repeats the same numbers: converged at [0.5, 0]. Feature 2 has been switched off.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import Lasso

def soft_threshold(rho, lam):
    return np.sign(rho) * max(abs(rho) - lam, 0.0)

def lasso_cd(X, y, alpha, sweeps=50, verbose=0):
    """Minimise (1/2n)||y - Xw||^2 + alpha*||w||_1 by cyclic coordinate descent."""
    n, p = X.shape
    w = np.zeros(p)
    z = (X ** 2).sum(0) / n                           # (1/n) sum x_j^2 for each column
    for sweep in range(1, sweeps + 1):
        for j in range(p):
            r_j = y - X @ w + X[:, j] * w[j]          # residual ignoring feature j
            rho = X[:, j] @ r_j / n                   # how much j could still explain
            w[j] = soft_threshold(rho, alpha) / z[j]
            if sweep &lt;= verbose:
                print(f"  sweep {sweep}, w{j+1}: rho={rho:.4f} -&gt; w = {np.round(w, 4)}")
    return w

X = np.array([[1, 1], [-1, -1], [1, 0], [-1, 0.0]]); y = np.array([3, -3, 1, -1.0])
for a in [0.5, 1.5]:
    print(f"alpha = {a}")
    w = lasso_cd(X, y, a, verbose=3)
    print(f"  after 50 sweeps: {w.round(4)}   sklearn: {Lasso(alpha=a, fit_intercept=False).fit(X, y).coef_.round(4)}")</div>
  <div class="fx" data-lang="text">alpha = 0.5
  sweep 1, w1: rho=2.0000 -&gt; w = [1.5 0. ]
  sweep 1, w2: rho=0.7500 -&gt; w = [1.5 0.5]
  sweep 2, w1: rho=1.7500 -&gt; w = [1.25 0.5 ]
  sweep 2, w2: rho=0.8750 -&gt; w = [1.25 0.75]
  sweep 3, w1: rho=1.6250 -&gt; w = [1.125 0.75 ]
  sweep 3, w2: rho=0.9375 -&gt; w = [1.125 0.875]
  after 50 sweeps: [1. 1.]   sklearn: [1.0001 0.9999]
alpha = 1.5
  sweep 1, w1: rho=2.0000 -&gt; w = [0.5 0. ]
  sweep 1, w2: rho=1.2500 -&gt; w = [0.5 0. ]
  sweep 2, w1: rho=2.0000 -&gt; w = [0.5 0. ]
  sweep 2, w2: rho=1.2500 -&gt; w = [0.5 0. ]
  sweep 3, w1: rho=2.0000 -&gt; w = [0.5 0. ]
  sweep 3, w2: rho=1.2500 -&gt; w = [0.5 0. ]
  after 50 sweeps: [0.5 0. ]   sklearn: [0.5 0. ]</div>
  <p>Every printed ρ and weight matches the hand table. sklearn's answer [1.0001, 0.9999] differs in the fourth decimal because it stops when the <em>duality gap</em> (a certificate of how far from optimal it is) falls below <code>tol</code>, not after a fixed number of sweeps.</p>
  <h3>Practical details</h3>
  <table class="tbl">
    <tr><th>Detail</th><th>What it means</th></tr>
    <tr><td>Convergence check</td><td>sklearn stops when the duality gap falls below <code>tol</code> (scaled by ||y||²); a <code>ConvergenceWarning</code> means raise <code>max_iter</code>, standardise, or increase α</td></tr>
    <tr><td><code>selection='random'</code></td><td>update features in random order instead of cyclic; often faster with many correlated columns</td></tr>
    <tr><td>Warm starts along a path</td><td>solve for the largest α first (all zeros), then use each solution to start the next smaller α; this is why computing a whole path costs little more than one fit</td></tr>
    <tr><td>Active set</td><td>features at 0 stay at 0 cheaply; most work is on the few non-zero ones</td></tr>
    <tr><td>Alternatives</td><td>LARS (least angle regression) computes the exact piecewise-linear lasso path; proximal gradient (ISTA/FISTA) uses the same soft-threshold step for huge problems; <code>SGDRegressor(penalty='l1')</code> for streaming data</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Cyclic coordinate descent for lasso</strong>: repeat for j = 1..p: rⱼ = y − Σ_{k≠j} xₖwₖ, ρⱼ = xⱼᵀrⱼ / n, wⱼ ← S(ρⱼ, α) / (xⱼᵀxⱼ / n). For elastic net the update is wⱼ ← S(ρⱼ, αr) / (xⱼᵀxⱼ/n + α(1 − r)).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>With very correlated features, coordinate descent can take many sweeps (each update undoes part of the previous one) and may stop early with a warning. The answer is then near-optimal in loss but the split between twins can be off. Standardise, increase <code>max_iter</code>, and do not read meaning into the exact split.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Lasso selects, ridge stabilises. What if correlated features should be kept <em>together</em> but useless ones still dropped? Mix the two penalties.</div>

  <h2 id="rl-enet"><span class="num">07</span>Elastic Net</h2>
  <h3>The objective</h3>
  <p>Elastic net (Zou &amp; Hastie, 2005) adds both penalties. sklearn's form, with r = <code>l1_ratio</code>:</p>
  <p style="text-align:center"><strong>(1/2n)·||y − Xw||² + α·r·||w||₁ + α·(1 − r)/2·||w||²</strong></p>
  <p>α is the total strength; r is the mix. r = 1 is lasso; r = 0 is ridge (on sklearn's 1/(2n) scale); values in between give sparse solutions that also treat correlated features as a group.</p>
  <h3>Deriving the 1-D solution</h3>
  <p>Same setup as lasso. For w &gt; 0 the derivative is −ρ + s·w + αr + α(1 − r)·w = 0, so w = (ρ − αr) / (s + α(1 − r)). The other cases follow as before, giving</p>
  <p style="text-align:center"><strong>w = S(ρ, α·r) / (s + α·(1 − r))</strong></p>
  <p>In words: <em>subtract</em> (the L1 part, which can make it 0), then <em>divide</em> (the L2 part, extra shrinkage). Both behaviours in one line.</p>
  <h3>Worked by hand: the students again</h3>
  <p>ρ = 12.167, s = 2.917. With α = 5, r = 0.5: subtract αr = 2.5 → 9.667; divide by s + α(1 − r) = 2.917 + 2.5 = 5.417 → <strong>1.785</strong>. Pure lasso at the same α gave 2.457, so the L2 part shrank it further. With α = 20, r = 0.5: (12.167 − 10) / (2.917 + 10) = 2.167 / 12.917 = <strong>0.168</strong>. With r almost 0: 12.167 / (2.917 + 5) = <strong>1.537</strong>, the ridge answer. Check: sklearn's <code>Ridge</code> (no 1/n) gives 73 / (17.5 + λ); 73 / (17.5 + 30) = 1.537 needs λ = 30 = n·α. That is the scale difference warned about in section 02.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import ElasticNet

x = np.array([1, 2, 3, 4, 5, 6.0]); y = np.array([52, 55, 61, 62, 70, 72.0])
rho, s = 73 / 6, 17.5 / 6                              # from the lasso example
print("alpha  l1_ratio  hand w = S(rho, a*r) / (s + a*(1-r))   sklearn")
for a, r in [(5, 1.0), (5, 0.5), (5, 0.0001), (20, 0.5)]:
    hand = max(rho - a * r, 0) / (s + a * (1 - r))
    skl = ElasticNet(alpha=a, l1_ratio=r, max_iter=100_000).fit(x[:, None], y).coef_[0]
    print(f"{a:&gt;5}  {r:&lt;8}  {hand:.3f}                                {skl:.3f}")</div>
  <div class="fx" data-lang="text">alpha  l1_ratio  hand w = S(rho, a*r) / (s + a*(1-r))   sklearn
    5  1.0       2.457                                2.457
    5  0.5       1.785                                1.785
    5  0.0001    1.537                                1.537
   20  0.5       0.168                                0.168</div>
  <h3>Why the mix helps</h3>
  <table class="tbl">
    <tr><th>Lasso's weakness</th><th>How the L2 part fixes it</th></tr>
    <tr><td>From a group of correlated features it keeps one, arbitrarily</td><td>The squared penalty is cheapest when weight is spread evenly (1² + 1² = 2 &lt; 2² + 0² = 4), so correlated features enter and leave together (the "grouping effect")</td></tr>
    <tr><td>When p &gt; n it can keep at most n features</td><td>Elastic net can keep more than n</td></tr>
    <tr><td>Selection jumps around between bootstrap samples</td><td>The strictly convex L2 part makes the solution unique and more stable</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Elastic net</strong>: ŵ = argmin (1/2n)||y − Xw||² + αr||w||₁ + α(1 − r)/2·||w||₂², 0 ≤ r ≤ 1. Strictly convex for r &lt; 1 (unique solution), sparse for r &gt; 0. Typical grids: r ∈ {0.1, 0.5, 0.7, 0.9, 0.95, 0.99, 1}, with α chosen per r by CV.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>l1_ratio</code> close to 0 makes coordinate descent slow and unreliable; sklearn's documentation says values ≤ 0.01 are not reliable and points to <code>Ridge</code> for pure L2. Also, the elastic net shrinks twice (once per penalty). Zou &amp; Hastie suggested rescaling the weights by (1 + λ₂) to undo the double shrinkage; sklearn returns the un-rescaled ("naive") version, so its kept weights look smaller than lasso's at a similar sparsity.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We have claimed that ridge shares weight between correlated features and lasso picks one. Time to see it on data, including a real dataset with correlated medical tests.</div>

  <h2 id="rl-corr"><span class="num">08</span>Correlated Features: Ridge Shares, Lasso Picks One</h2>
  <h3>By hand: exact copies</h3>
  <p>Back to the duplicated column from section 01. <strong>Ridge</strong>: the loss treats w₁ and w₂ symmetrically (swapping them changes nothing) and has a single minimum (strictly convex), so the minimum must have w₁ = w₂. We computed 0.889 each. For any w₁ + w₂ = c the fit is the same, and w₁² + w₂² is smallest when they are equal (1² + 1² = 2 vs 2² + 0² = 4): ridge spreads weight evenly. <strong>Lasso</strong>: for any split with the same sign, |w₁| + |w₂| = |c| is the same (|1| + |1| = |2| + |0| = 2), so every split is equally good. The solver just returns one of them; cyclic coordinate descent hands everything to whichever copy it updates first.</p>
  <h3>Near-copies: two temperature sensors</h3>
  <p>Sensor B is sensor A plus tiny noise (correlation 0.9999); the target depends on the true temperature with total effect 3 per degree. Each model is refit on three bootstrap resamples to see how stable the weights are.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet

rng = np.random.default_rng(1)
temp_a = rng.normal(25, 5, 100)                  # sensor A, degrees C
temp_b = temp_a + rng.normal(0, 0.05, 100)       # sensor B: a near-copy of A
yt = 3 * temp_a + rng.normal(0, 3, 100)          # true total effect: 3 per degree
Xt = np.c_[temp_a, temp_b]
print("corr(A, B) =", round(np.corrcoef(temp_a, temp_b)[0, 1], 5))
models = {"OLS": LinearRegression(), "Ridge": Ridge(alpha=10),
          "Lasso": Lasso(alpha=1), "ENet": ElasticNet(alpha=1, l1_ratio=0.5)}
for name, m in models.items():
    row = []
    for b in range(3):                           # 3 bootstrap resamples of the rows
        idx = rng.integers(0, 100, 100)
        w = m.fit(Xt[idx], yt[idx]).coef_
        row.append(f"[{w[0]:5.1f}, {w[1]:5.1f}]")
    print(f"{name:6s}", "  ".join(row))

# same data, only the column ORDER changes
lasso = Lasso(alpha=1, max_iter=100_000)
print("Lasso on [A, B]:", lasso.fit(Xt, yt).coef_.round(2),
      "  Lasso on [B, A]:", lasso.fit(Xt[:, ::-1], yt).coef_.round(2))</div>
  <div class="fx" data-lang="text">corr(A, B) = 0.99993
OLS    [ -3.8,   6.8]  [ -3.7,   6.7]  [ -0.4,   3.4]
Ridge  [  1.5,   1.5]  [  1.6,   1.4]  [  1.6,   1.4]
Lasso  [  2.9,   0.0]  [  3.0,   0.0]  [  2.9,   0.0]
ENet   [  1.5,   1.5]  [  1.5,   1.5]  [  1.4,   1.4]
Lasso on [A, B]: [2.94 0.  ]   Lasso on [B, A]: [0.68 2.25]</div>
  <p>Every pair adds up to about 3, the true total. OLS splits it wildly with a negative weight on one sensor ([−3.8, 6.8]), and the split changes from sample to sample. Ridge and elastic net share it evenly ([1.5, 1.5]) and stably. Lasso gives almost everything to one sensor ([2.9, 0]). The last line shows how fragile that choice is: the same data with the columns listed in the other order gives a different split ([0.68, 2.25] for [B, A]). Near-ties are decided by tiny noise and solver details.</p>
  <h3>On real data: the diabetes dataset</h3>
  <p>442 patients, 10 standardised measurements (age, sex, BMI, blood pressure, six blood tests s1–s6), target = disease progression after a year. s1 and s2 are two cholesterol measures with correlation 0.897.</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from sklearn.datasets import load_diabetes
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import cross_val_score
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet
X, y = load_diabetes(return_X_y=True, as_frame=True)          # 442 patients, 10 features
print("corr(s1, s2) =", round(X.s1.corr(X.s2), 3))
models = {"OLS": LinearRegression(), "Ridge a=10": Ridge(alpha=10),
          "Lasso a=1": Lasso(alpha=1), "ENet a=1 r=.5": ElasticNet(alpha=1, l1_ratio=0.5)}
coefs, cv = {}, {}
for name, m in models.items():
    pipe = make_pipeline(StandardScaler(), m)
    coefs[name] = pipe.fit(X, y)[-1].coef_
    cv[name] = cross_val_score(pipe, X, y, cv=5).mean()
print(pd.DataFrame(coefs, index=X.columns).round(1) + 0.0)
print("5-fold CV R2:", {k: round(float(v), 3) for k, v in cv.items()})</div>
  <div class="fx" data-lang="text">corr(s1, s2) = 0.897
      OLS  Ridge a=10  Lasso a=1  ENet a=1 r=.5
age  -0.5        -0.3        0.0            0.6
sex -11.4       -10.9       -9.3           -5.7
bmi  24.7        24.6       24.8           18.1
bp   15.4        15.1       14.1           11.4
s1  -37.7       -11.3       -4.8           -0.2
s2   22.7         1.8        0.0           -2.4
s3    4.8        -6.6      -10.6           -8.2
s4    8.4         5.6        0.0            5.3
s5   35.7        25.3       24.4           15.4
s6    3.2         3.5        2.6            5.1
5-fold CV R2: {'OLS': 0.482, 'Ridge a=10': 0.481, 'Lasso a=1': 0.482, 'ENet a=1 r=.5': 0.458}</div>
  <p>OLS gives the cholesterol twins large opposite weights (−37.7 and +22.7) that mostly cancel, the classic multicollinearity signature. Ridge pulls them to −11.3 and +1.8. Lasso drops s2 entirely (and age and s4), and elastic net pushes s1 and s2 to small values of the same size. The cross-validated R² barely changes (0.48 for all but the strongly penalised elastic net): the penalties changed the <em>explanation</em> much more than the <em>predictions</em>. Ridge's s3 even changed sign (4.8 → −6.6): with correlated columns, individual OLS signs are not trustworthy.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Correlated features share credit. OLS shares it erratically, ridge shares it evenly, lasso gives it to one, elastic net shares it among a few. None of them can tell you which twin is "the real cause": that is a question for domain knowledge or experiments, not for a penalty.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Lasso set s2 to zero, so s2 does not matter" is wrong. s2 carries almost the same information as s1; lasso only needed one of them. Drop s1 and lasso would happily use s2. Check selection stability over bootstrap resamples (stability selection) before claiming a feature is irrelevant.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Every example so far standardised the columns first. Is that a habit or a requirement?</div>

  <h2 id="rl-std"><span class="num">09</span>The Standardization Requirement</h2>
  <h3>By hand: units change the penalty</h3>
  <p>Say spending rises by 2 thousand rupees per lakh of income. Measure income in lakh and the right weight is 2. Measure the same income in crore (1 crore = 100 lakh) and, to make identical predictions, the weight must be 200. OLS does not care: it simply finds 2 or 200. But the penalty does: ridge charges 2² = 4 in one case and 200² = 40,000 in the other; lasso charges 2 versus 200. Same information, a penalty 100 (L1) or 10,000 (L2) times larger, purely because of units. The penalty would shrink the crore version far more.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import Lasso
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(0)
n = 200
income_lakh = rng.uniform(3, 30, n)                  # yearly income, lakh rupees
age = rng.uniform(22, 60, n)                          # years
spend = 2.0 * income_lakh + 0.5 * age + rng.normal(0, 5, n)   # monthly spend, thousand rupees

for unit, inc in [("income in lakh", income_lakh), ("income in crore", income_lakh / 100)]:
    X = np.c_[inc, age]
    raw = Lasso(alpha=1).fit(X, spend).coef_
    std = make_pipeline(StandardScaler(), Lasso(alpha=1)).fit(X, spend)[-1].coef_
    print(f"{unit:16s} raw lasso w = {raw.round(3)}   standardised lasso w = {std.round(3)}")</div>
  <div class="fx" data-lang="text">income in lakh   raw lasso w = [1.978 0.52 ]   standardised lasso w = [15.166  4.73 ]
income in crore  raw lasso w = [47.844  0.463]   standardised lasso w = [15.166  4.73 ]</div>
  <p>In lakh, lasso's income weight is 1.978 (truth 2, barely shrunk). In crore it is 47.844, which is 0.478 per lakh: shrunk by 76%, because the large weight paid a large fee. With a <code>StandardScaler</code> first, both versions give exactly the same model (15.166 per standard deviation of income): standardising puts every column on a common scale (mean 0, standard deviation 1), so the penalty compares like with like.</p>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Standardise for ridge / lasso / elastic net?</td><td>Yes, always (unless all columns already share a meaningful unit)</td></tr>
    <tr><td>Where?</td><td>Inside a <code>Pipeline</code>, so each CV fold computes its own mean and std (no leakage: <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>)</td></tr>
    <tr><td>The target y?</td><td>Not required; the intercept absorbs its mean</td></tr>
    <tr><td>One-hot dummies?</td><td>Debated: scaling them makes rare categories' weights cheaper to use. Common practice: standardise everything for simplicity, or leave dummies as 0/1 and accept the penalty favours common levels</td></tr>
    <tr><td>Reading coefficients after scaling</td><td>"Effect of one standard deviation"; divide by the column's std to get per-unit effects</td></tr>
    <tr><td>Trees, boosting?</td><td>No need; they are scale-free (<a class="xref" data-note="ml_dtree">Decision Trees</a>)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>A model is <strong>scale-equivariant</strong> if rescaling a column by c just rescales its weight by 1/c and leaves predictions unchanged. OLS is; ridge, lasso and elastic net are not, because their penalties depend on the size of the weights. Standardising (z = (x − mean)/std) restores a fair comparison.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Fitting the scaler on all rows before cross-validation leaks validation-fold information into training and makes the CV score slightly optimistic. Put the scaler and the model in one pipeline and cross-validate the pipeline. sklearn removed the old <code>normalize=True</code> option from these models (version 1.2) and asks you to use a <code>StandardScaler</code> in a pipeline instead.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Everything depends on α, and we have been picking it by hand. How do we pick it properly?</div>

  <h2 id="rl-alpha"><span class="num">10</span>Choosing α by Cross-Validation</h2>
  <h3>The idea</h3>
  <p>α is a hyperparameter: too small and we are back to OLS's variance, too large and every weight is crushed (bias). The training error always prefers α = 0, so we choose α by cross-validation: try a grid of values (on a log scale, since α can sensibly range over many orders of magnitude), score each with k-fold CV on the training data, keep the best. sklearn has three estimators that do this internally and efficiently:</p>
  <table class="tbl">
    <tr><th>Estimator</th><th>How it searches</th><th>After fit</th></tr>
    <tr><td><code>RidgeCV(alphas=...)</code></td><td>Default: exact leave-one-out CV computed in one shot from one decomposition of X (the LOO residual is eᵢ / (1 − hᵢᵢ), where hᵢᵢ is the row's leverage under the ridge hat matrix). Or pass <code>cv=5</code></td><td><code>alpha_</code>, <code>best_score_</code></td></tr>
    <tr><td><code>LassoCV(cv=...)</code></td><td>Builds a grid of 100 α's from α_max (all weights 0) down to α_max/1000, fits the whole path per fold with warm starts</td><td><code>alpha_</code>, <code>alphas_</code>, <code>mse_path_</code> (α × folds)</td></tr>
    <tr><td><code>ElasticNetCV(l1_ratio=[...], cv=...)</code></td><td>Same, for each r in the list</td><td><code>alpha_</code>, <code>l1_ratio_</code>, <code>mse_path_</code></td></tr>
    <tr><td><code>LassoLarsIC(criterion='bic')</code></td><td>No CV: picks α by AIC/BIC along the LARS path; fast, assumes n &gt; p</td><td><code>alpha_</code></td></tr>
    <tr><td><code>GridSearchCV(pipe, {'ridge__alpha': ...})</code></td><td>Generic; needed when α must be tuned together with other steps (polynomial degree, etc.)</td><td><code>best_params_</code></td></tr>
  </table>
  <h3>The one-standard-error rule</h3>
  <p>CV scores are noisy. Often a range of α's score within noise of the best, and the largest of them gives a simpler, sparser model. The rule: compute the mean CV error and its standard error (std across folds / √k) for every α; take the minimum; then choose the <em>largest</em> α whose mean error is at most min + 1 SE.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_diabetes
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split, KFold
from sklearn.linear_model import LinearRegression, RidgeCV, LassoCV, ElasticNetCV, Lasso
from sklearn.metrics import r2_score

X, y = load_diabetes(return_X_y=True, as_frame=True)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.25, random_state=42)
cv = KFold(5, shuffle=True, random_state=0)

models = {
    "OLS":          LinearRegression(),
    "RidgeCV":      RidgeCV(alphas=np.logspace(-3, 3, 25)),                  # efficient leave-one-out
    "LassoCV":      LassoCV(cv=cv, n_jobs=1)          ,
    "ElasticNetCV": ElasticNetCV(l1_ratio=[0.1, 0.5, 0.9, 1.0], cv=cv, n_jobs=1),
}
for name, m in models.items():
    p = make_pipeline(StandardScaler(), m).fit(Xtr, ytr)
    est = p[-1]
    extra = f"alpha_={est.alpha_:.4g}" if hasattr(est, "alpha_") else ""
    if hasattr(est, "l1_ratio_"): extra += f"  l1_ratio_={est.l1_ratio_}"
    print(f"{name:13s} test R2 {r2_score(yte, p.predict(Xte)):.3f}  nonzero {int((est.coef_ != 0).sum()):2d}/10  {extra}")

# the one-standard-error rule on the lasso CV curve
lcv = make_pipeline(StandardScaler(), LassoCV(cv=cv, n_jobs=1)).fit(Xtr, ytr)[-1]
mean, se = lcv.mse_path_.mean(1), lcv.mse_path_.std(1) / np.sqrt(cv.get_n_splits())
best = mean.argmin()
a_1se = lcv.alphas_[mean &lt;= mean[best] + se[best]].max()       # alphas_ run large -&gt; small
p1 = make_pipeline(StandardScaler(), Lasso(alpha=a_1se)).fit(Xtr, ytr)
print(f"min-CV alpha {lcv.alphas_[best]:.3f} (CV MSE {mean[best]:.0f} +/- {se[best]:.0f});"
      f" 1-SE alpha {a_1se:.3f} -&gt; test R2 {r2_score(yte, p1.predict(Xte)):.3f}, nonzero {int((p1[-1].coef_ != 0).sum())}/10")</div>
  <div class="fx" data-lang="text">OLS           test R2 0.485  nonzero 10/10  
RidgeCV       test R2 0.486  nonzero 10/10  alpha_=1.778
LassoCV       test R2 0.487  nonzero 10/10  alpha_=0.1404
ElasticNetCV  test R2 0.489  nonzero 10/10  alpha_=0.09195  l1_ratio_=0.5
min-CV alpha 0.140 (CV MSE 3117 +/- 281); 1-SE alpha 9.237 -&gt; test R2 0.481, nonzero 4/10</div>
  <p>On the 10 clean diabetes features, all four models land at test R² ≈ 0.49: with 331 training rows and 10 reasonable columns, OLS is not in trouble and the CV-chosen α's are small (lasso's 0.14 keeps all 10). The 1-SE rule changes the picture: α = 9.24 keeps only 4 features at test R² 0.481 versus 0.487. Most practitioners would take the 4-feature model: almost the same accuracy, much simpler to explain and to maintain. By hand: the minimum mean CV MSE was 3117 with standard error 281, so any α with CV MSE ≤ 3398 was acceptable, and 9.24 was the largest such α.</p>
  <h3>When regularization really pays: 200 noise columns</h3>
  <p>The clean data hides the benefit. Add 200 columns of pure random numbers to the 10 real ones (a realistic "feature store" situation) and compare on the held-out test set.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression, RidgeCV, LassoCV, ElasticNetCV
from sklearn.metrics import r2_score
X, y = load_diabetes(return_X_y=True)
rng = np.random.default_rng(0)
Xn = np.c_[X, rng.normal(size=(len(X), 200))]                  # 10 real + 200 noise columns
Xtr, Xte, ytr, yte = train_test_split(Xn, y, test_size=0.25, random_state=42)
models = {"OLS": LinearRegression(),
          "RidgeCV": RidgeCV(alphas=np.logspace(-3, 3, 13)),
          "LassoCV": LassoCV(cv=5, random_state=0, n_jobs=1),
          "ElasticNetCV": ElasticNetCV(l1_ratio=[.2, .5, .8, 1], cv=5, random_state=0, n_jobs=1)}
for name, m in models.items():
    p = make_pipeline(StandardScaler(), m).fit(Xtr, ytr)
    print(f"{name:12s} test R2 {r2_score(yte, p.predict(Xte)):6.3f}   nonzero weights {int((p[-1].coef_ != 0).sum()):3d}/210")
print("ElasticNetCV chose l1_ratio =", p[-1].l1_ratio_)
lasso = make_pipeline(StandardScaler(), LassoCV(cv=5, random_state=0, n_jobs=1)).fit(Xtr, ytr)[-1]
print("Lasso kept columns:", np.flatnonzero(lasso.coef_).tolist())</div>
  <div class="fx" data-lang="text">OLS          test R2 -0.258   nonzero weights 210/210
RidgeCV      test R2  0.366   nonzero weights 210/210
LassoCV      test R2  0.485   nonzero weights   6/210
ElasticNetCV test R2  0.485   nonzero weights   6/210
ElasticNetCV chose l1_ratio = 1.0
Lasso kept columns: [2, 3, 6, 8, 132, 140]</div>
  <p>OLS has to fit 210 weights from 331 rows; it memorises noise and scores −0.258 on test, worse than predicting the average. Ridge recovers to 0.366 but still carries 210 non-zero weights. Lasso keeps 6 columns and scores 0.485, as good as the models that only ever saw the 10 real columns. The kept columns 2, 3, 6, 8 are bmi, bp, s3 and s5, the strongest real signals; two noise columns (132 and 140) slipped in by chance. ElasticNetCV chose <code>l1_ratio = 1.0</code>, pure lasso, because sparsity is what this data needs.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Regularization path + CV</strong>: compute the solution for a decreasing sequence α₁ &gt; α₂ &gt; … (warm-started), estimate the CV error at each, and pick α by minimum CV error or by the 1-SE rule. The final model is refit on all training data at the chosen α; its test score is the honest estimate.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Picking α on the test set, or reporting the CV score of the chosen α as the expected performance. The CV score of the best of 100 α's is slightly optimistic; keep a test set (or use nested CV) for the final number. And a grid that ends at its best value (the best α is the first or last one tried) means the grid was too narrow: extend it.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> One α gives one model. A path plot shows all α's at once and tells you which features are strong, which enter late, and where the twins trade places.</div>

  <h2 id="rl-path"><span class="num">11</span>Coefficient Path Plots</h2>
  <p>A coefficient path plots every weight (y-axis) against α (x-axis, log scale). By convention α decreases to the right, so the model starts empty (or tiny) on the left and grows to OLS on the right. <code>lasso_path</code> computes the lasso path efficiently; for ridge we simply refit at each α.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_diabetes
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import lasso_path, Ridge

X, y = load_diabetes(return_X_y=True, as_frame=True)
names = list(X.columns)
Xs = StandardScaler().fit_transform(X); yc = y - y.mean()

alphas, coefs, _ = lasso_path(Xs, yc, alphas=np.logspace(2, -2, 200))   # large -&gt; small alpha
first = [alphas[np.flatnonzero(coefs[j])[0]] if coefs[j].any() else 0 for j in range(10)]
order = sorted(range(10), key=lambda j: -first[j])
print("order features enter the lasso path (alpha at entry):")
print("  " + ", ".join(f"{names[j]} ({first[j]:.1f})" for j in order))
for a in [30, 10, 3, 1, 0.1]:
    k = np.argmin(abs(alphas - a))
    print(f"alpha {a:&gt;4}: nonzero {int((coefs[:, k] != 0).sum()):2d}  " +
          " ".join(f"{names[j]}={coefs[j, k]:.1f}" for j in range(10) if coefs[j, k] != 0))
print("ridge s1, s2 as alpha grows:")
for a in [0.01, 1, 10, 100, 1000, 10000]:
    w = Ridge(alpha=a).fit(Xs, yc).coef_
    print(f"  alpha {a:&gt;7}: s1 {w[4]:7.1f}  s2 {w[5]:6.1f}  bmi {w[2]:5.1f}  ||w|| {np.linalg.norm(w):6.1f}")</div>
  <div class="fx" data-lang="text">order features enter the lasso path (alpha at entry):
  bmi (43.5), s5 (41.5), bp (20.7), s3 (15.0), sex (5.9), s6 (4.1), s1 (3.3), s4 (0.9), s2 (0.3), age (0.2)
alpha   30: nonzero  2  bmi=11.4 s5=8.5
alpha   10: nonzero  4  bmi=22.6 bp=6.9 s3=-3.2 s5=19.6
alpha    3: nonzero  7  sex=-5.9 bmi=24.4 bp=12.3 s1=-0.7 s3=-9.5 s5=21.9 s6=0.8
alpha    1: nonzero  7  sex=-9.4 bmi=24.8 bp=14.1 s1=-4.9 s3=-10.6 s5=24.5 s6=2.6
alpha  0.1: nonzero  9  age=-0.3 sex=-11.2 bmi=24.9 bp=15.2 s1=-26.4 s2=13.7 s4=7.1 s5=31.6 s6=3.2
ridge s1, s2 as alpha grows:
  alpha    0.01: s1   -37.6  s2   22.6  bmi  24.7  ||w||   65.4
  alpha       1: s1   -30.1  s2   16.7  bmi  24.8  ||w||   57.5
  alpha      10: s1   -11.3  s2    1.8  bmi  24.6  ||w||   42.6
  alpha     100: s1    -2.1  s2   -3.7  bmi  21.4  ||w||   34.8
  alpha    1000: s1     1.1  s2    0.0  bmi   9.9  ||w||   17.4
  alpha   10000: s1     0.6  s2    0.4  bmi   1.8  ||w||    3.6</div>
  <figure class="viz"><svg viewBox="0 0 640 275" width="640">
<line x1="60" y1="130" x2="580" y2="130" stroke="currentColor" stroke-opacity="0.5"/><line x1="60" y1="20" x2="60" y2="240" stroke="currentColor"/><line x1="60" y1="240" x2="580" y2="240" stroke="currentColor"/>
<text x="52" y="24" text-anchor="end" class="tm" font-size="11">+40</text><text x="52" y="134" text-anchor="end" class="tm" font-size="11">0</text><text x="52" y="244" text-anchor="end" class="tm" font-size="11">−40</text>
<text x="60" y="256" text-anchor="middle" class="tm" font-size="11">100</text><text x="190" y="256" text-anchor="middle" class="tm" font-size="11">10</text><text x="320" y="256" text-anchor="middle" class="tm" font-size="11">1</text><text x="450" y="256" text-anchor="middle" class="tm" font-size="11">0.1</text><text x="580" y="256" text-anchor="middle" class="tm" font-size="11">0.01</text>
<text x="320" y="271" text-anchor="middle" class="tm" font-size="12">lasso α (log scale, decreasing →)</text>
<polyline points="60,130 69,130 78,130 86,130 95,130 104,130 113,130 122,130 131,130 139,130 148,130 157,130 166,130 175,130 183,130 192,130 201,130 210,130 219,130 227,130 236,130 245,130 254,130 263,130 272,130 280,130 289,130 298,130 307,130 316,130 324,130 333,130 342,130 351,130 360,130 368,130 377,130 386,130 395,130 404,130 413,130 421,130 430,131 439,131 448,131 457,131 465,131 474,131 483,131 492,131 501,131 509,131 518,131 527,131 536,131 545,131 554,131 562,131 571,131 580,131" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-width="1.2"/>
<polyline points="60,130 69,130 78,130 86,130 95,130 104,130 113,130 122,130 131,130 139,130 148,130 157,130 166,130 175,130 183,130 192,130 201,130 210,130 219,131 227,135 236,139 245,142 254,145 263,147 272,149 280,151 289,152 298,153 307,154 316,155 324,156 333,157 342,157 351,158 360,158 368,159 377,159 386,159 395,160 404,160 413,160 421,160 430,160 439,161 448,161 457,161 465,161 474,161 483,161 492,161 501,161 509,161 518,161 527,161 536,161 545,161 554,161 562,161 571,161 580,161" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-width="1.2"/>
<polyline points="60,130 69,130 78,130 86,130 95,130 104,130 113,116 122,105 131,96 139,88 148,82 157,77 166,74 175,71 183,69 192,67 201,66 210,65 219,64 227,63 236,63 245,63 254,63 263,63 272,62 280,62 289,62 298,62 307,62 316,62 324,62 333,62 342,61 351,61 360,61 368,61 377,61 386,61 395,61 404,61 413,61 421,61 430,61 439,62 448,62 457,62 465,62 474,62 483,62 492,62 501,62 509,62 518,62 527,62 536,62 545,62 554,62 562,62 571,62 580,62" fill="none" class="sb" stroke-width="2.2"/>
<polyline points="60,130 69,130 78,130 86,130 95,130 104,130 113,130 122,130 131,130 139,130 148,129 157,124 166,120 175,117 183,113 192,111 201,108 210,106 219,105 227,102 236,100 245,98 254,97 263,96 272,95 280,94 289,93 298,92 307,92 316,91 324,91 333,91 342,90 351,90 360,90 368,89 377,89 386,89 395,89 404,89 413,89 421,88 430,88 439,88 448,88 457,88 465,88 474,88 483,88 492,88 501,88 509,88 518,88 527,88 536,88 545,88 554,88 562,88 571,88 580,88" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-width="1.2"/>
<polyline points="60,130 69,130 78,130 86,130 95,130 104,130 113,130 122,130 131,130 139,130 148,130 157,130 166,130 175,130 183,130 192,130 201,130 210,130 219,130 227,130 236,130 245,130 254,130 263,133 272,135 280,137 289,139 298,141 307,142 316,143 324,144 333,146 342,148 351,150 360,151 368,153 377,154 386,155 395,155 404,165 413,175 421,183 430,191 439,197 448,202 457,204 465,205 474,206 483,209 492,212 501,215 509,218 518,220 527,222 536,224 545,225 554,226 562,228 571,228 580,229" fill="none" class="sr" stroke-width="2.2"/>
<polyline points="60,130 69,130 78,130 86,130 95,130 104,130 113,130 122,130 131,130 139,130 148,130 157,130 166,130 175,130 183,130 192,130 201,130 210,130 219,130 227,130 236,130 245,130 254,130 263,130 272,130 280,130 289,130 298,130 307,130 316,130 324,130 333,130 342,130 351,130 360,130 368,130 377,130 386,130 395,130 404,122 413,114 421,108 430,102 439,97 448,93 457,91 465,90 474,89 483,87 492,84 501,82 509,80 518,78 527,76 536,75 545,74 554,73 562,72 571,72 580,71" fill="none" class="st" stroke-width="2.2"/>
<polyline points="60,130 69,130 78,130 86,130 95,130 104,130 113,130 122,130 131,130 139,130 148,130 157,130 166,130 175,133 183,136 192,139 201,141 210,143 219,146 227,149 236,152 245,154 254,156 263,156 272,157 280,158 289,158 298,158 307,159 316,159 324,159 333,157 342,156 351,154 360,153 368,152 377,151 386,151 395,150 404,146 413,142 421,138 430,135 439,132 448,130 457,130 465,130 474,130 483,129 492,127 501,125 509,124 518,123 527,122 536,121 545,121 554,120 562,120 571,119 580,119" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-width="1.2"/>
<polyline points="60,130 69,130 78,130 86,130 95,130 104,130 113,130 122,130 131,130 139,130 148,130 157,130 166,130 175,130 183,130 192,130 201,130 210,130 219,130 227,130 236,130 245,130 254,130 263,130 272,130 280,130 289,130 298,130 307,130 316,130 324,130 333,127 342,125 351,123 360,121 368,119 377,118 386,117 395,116 404,115 413,114 421,113 430,112 439,111 448,111 457,111 465,111 474,112 483,111 492,111 501,110 509,110 518,109 527,109 536,109 545,108 554,108 562,108 571,108 580,108" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-width="1.2"/>
<polyline points="60,130 69,130 78,130 86,130 95,130 104,130 113,124 122,113 131,104 139,96 148,90 157,85 166,81 175,79 183,77 192,76 201,74 210,73 219,72 227,72 236,71 245,71 254,71 263,69 272,68 280,66 289,65 298,65 307,64 316,63 324,63 333,62 342,62 351,62 360,61 368,61 377,61 386,61 395,61 404,57 413,53 421,50 430,48 439,45 448,43 457,43 465,42 474,42 483,41 492,39 501,38 509,37 518,37 527,36 536,35 545,35 554,34 562,34 571,34 580,33" fill="none" class="sg" stroke-width="2.2"/>
<polyline points="60,130 69,130 78,130 86,130 95,130 104,130 113,130 122,130 131,130 139,130 148,130 157,130 166,130 175,130 183,130 192,130 201,130 210,130 219,130 227,130 236,130 245,129 254,128 263,127 272,126 280,125 289,125 298,124 307,124 316,123 324,123 333,123 342,122 351,122 360,122 368,122 377,122 386,122 395,122 404,122 413,121 421,121 430,121 439,121 448,121 457,121 465,121 474,121 483,121 492,121 501,121 509,121 518,121 527,121 536,121 545,121 554,121 562,121 571,121 580,121" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-width="1.2"/>
<text x="586" y="58" class="tb" font-size="11">bmi</text><text x="586" y="37" class="tg" font-size="11">s5</text><text x="586" y="232" class="tr" font-size="11">s1</text><text x="586" y="82" class="tm" font-size="11">s2</text>
<text x="70" y="36" class="tm" font-size="11">bmi, s5 enter first (α ≈ 43)</text>
<text x="420" y="205" class="tr" font-size="11">s1 dives as s2 enters</text>
</svg><figcaption>Lasso path on the standardised diabetes data. Each line is one coefficient. Every coefficient is exactly 0 until its entry point, then the paths are piecewise linear. The cholesterol twins s1 (red) and s2 (teal) stay small until the very end, then split apart in opposite directions as α → 0 (the OLS solution).</figcaption></figure>
  <figure class="viz"><svg viewBox="0 0 640 275" width="640">
<line x1="60" y1="130" x2="580" y2="130" stroke="currentColor" stroke-opacity="0.5"/><line x1="60" y1="20" x2="60" y2="240" stroke="currentColor"/><line x1="60" y1="240" x2="580" y2="240" stroke="currentColor"/>
<text x="52" y="24" text-anchor="end" class="tm" font-size="11">+40</text><text x="52" y="134" text-anchor="end" class="tm" font-size="11">0</text><text x="52" y="244" text-anchor="end" class="tm" font-size="11">−40</text>
<text x="60" y="256" text-anchor="middle" class="tm" font-size="11">10⁴</text><text x="147" y="256" text-anchor="middle" class="tm" font-size="11">10³</text><text x="233" y="256" text-anchor="middle" class="tm" font-size="11">100</text><text x="320" y="256" text-anchor="middle" class="tm" font-size="11">10</text><text x="407" y="256" text-anchor="middle" class="tm" font-size="11">1</text><text x="493" y="256" text-anchor="middle" class="tm" font-size="11">0.1</text><text x="580" y="256" text-anchor="middle" class="tm" font-size="11">0.01</text>
<text x="320" y="271" text-anchor="middle" class="tm" font-size="12">ridge α (log scale, decreasing →)</text>
<polyline points="60,129 69,128 78,128 86,128 95,127 104,127 113,126 122,126 131,126 139,126 148,126 157,126 166,126 175,126 183,126 192,127 201,127 210,128 219,128 227,129 236,129 245,129 254,130 263,130 272,130 280,130 289,130 298,130 307,131 316,131 324,131 333,131 342,131 351,131 360,131 368,131 377,131 386,131 395,131 404,131 413,131 421,131 430,131 439,131 448,131 457,131 465,131 474,131 483,131 492,131 501,131 509,131 518,131 527,131 536,131 545,131 554,131 562,131 571,131 580,131" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-width="1.2"/>
<polyline points="60,130 69,130 78,130 86,130 95,130 104,131 113,131 122,132 131,132 139,133 148,135 157,136 166,138 175,140 183,142 192,144 201,147 210,149 219,150 227,152 236,154 245,155 254,156 263,157 272,158 280,158 289,159 298,159 307,160 316,160 324,160 333,160 342,161 351,161 360,161 368,161 377,161 386,161 395,161 404,161 413,161 421,161 430,161 439,161 448,161 457,161 465,161 474,161 483,161 492,161 501,161 509,161 518,161 527,161 536,161 545,161 554,161 562,161 571,161 580,161" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-width="1.2"/>
<polyline points="60,125 69,124 78,123 86,121 95,119 104,117 113,115 122,112 131,109 139,106 148,102 157,99 166,95 175,91 183,87 192,84 201,81 210,78 219,75 227,73 236,71 245,69 254,67 263,66 272,65 280,64 289,64 298,63 307,63 316,62 324,62 333,62 342,62 351,62 360,62 368,62 377,62 386,62 395,62 404,62 413,62 421,62 430,62 439,62 448,62 457,62 465,62 474,62 483,62 492,62 501,62 509,62 518,62 527,62 536,62 545,62 554,62 562,62 571,62 580,62" fill="none" class="sb" stroke-width="2.2"/>
<polyline points="60,126 69,126 78,125 86,123 95,122 104,121 113,119 122,117 131,115 139,113 148,111 157,109 166,106 175,104 183,102 192,100 201,98 210,97 219,95 227,94 236,93 245,92 254,91 263,91 272,90 280,90 289,89 298,89 307,89 316,89 324,88 333,88 342,88 351,88 360,88 368,88 377,88 386,88 395,88 404,88 413,88 421,88 430,88 439,88 448,88 457,88 465,88 474,88 483,88 492,88 501,88 509,88 518,88 527,88 536,88 545,88 554,88 562,88 571,88 580,88" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-width="1.2"/>
<polyline points="60,128 69,128 78,128 86,128 95,127 104,127 113,127 122,127 131,127 139,127 148,127 157,128 166,128 175,129 183,130 192,131 201,132 210,133 219,134 227,135 236,136 245,137 254,139 263,141 272,143 280,145 289,148 298,151 307,155 316,159 324,163 333,169 342,174 351,180 360,186 368,191 377,197 386,202 395,207 404,211 413,215 421,218 430,221 439,224 448,225 457,227 465,228 474,229 483,230 492,231 501,231 509,232 518,232 527,233 536,233 545,233 554,233 562,233 571,233 580,233" fill="none" class="sr" stroke-width="2.2"/>
<polyline points="60,129 69,129 78,128 86,128 95,128 104,128 113,128 122,128 131,129 139,129 148,130 157,131 166,132 175,133 183,135 192,136 201,137 210,138 219,139 227,140 236,140 245,140 254,140 263,139 272,138 280,137 289,135 298,133 307,130 316,127 324,123 333,119 342,115 351,110 360,106 368,101 377,97 386,92 395,89 404,85 413,82 421,80 430,77 439,76 448,74 457,73 465,72 474,71 483,70 492,70 501,69 509,69 518,69 527,68 536,68 545,68 554,68 562,68 571,68 580,68" fill="none" class="st" stroke-width="2.2"/>
<polyline points="60,133 69,134 78,135 86,136 95,137 104,138 113,139 122,141 131,142 139,144 148,145 157,147 166,148 175,149 183,151 192,152 201,153 210,153 219,154 227,154 236,155 245,155 254,155 263,155 272,154 280,154 289,153 298,152 307,151 316,149 324,147 333,145 342,143 351,140 360,138 368,135 377,133 386,131 395,128 404,127 413,125 421,123 430,122 439,121 448,120 457,120 465,119 474,119 483,118 492,118 501,118 509,118 518,117 527,117 536,117 545,117 554,117 562,117 571,117 580,117" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-width="1.2"/>
<polyline points="60,127 69,126 78,125 86,124 95,123 104,122 113,121 122,120 131,119 139,118 148,117 157,116 166,115 175,115 183,114 192,114 201,114 210,114 219,114 227,114 236,114 245,114 254,115 263,115 272,115 280,115 289,115 298,115 307,115 316,115 324,114 333,114 342,114 351,113 360,112 368,112 377,111 386,111 395,110 404,109 413,109 421,109 430,108 439,108 448,108 457,108 465,107 474,107 483,107 492,107 501,107 509,107 518,107 527,107 536,107 545,107 554,107 562,107 571,107 580,107" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-width="1.2"/>
<polyline points="60,125 69,124 78,123 86,122 95,120 104,118 113,116 122,114 131,111 139,108 148,106 157,103 166,100 175,97 183,94 192,91 201,88 210,85 219,83 227,80 236,78 245,76 254,74 263,72 272,70 280,69 289,67 298,65 307,63 316,61 324,59 333,57 342,55 351,52 360,50 368,48 377,46 386,44 395,42 404,40 413,39 421,37 430,36 439,36 448,35 457,34 465,34 474,33 483,33 492,33 501,33 509,32 518,32 527,32 536,32 545,32 554,32 562,32 571,32 580,32" fill="none" class="sg" stroke-width="2.2"/>
<polyline points="60,127 69,126 78,126 86,125 95,124 104,123 113,122 122,120 131,119 139,118 148,117 157,116 166,116 175,115 183,115 192,115 201,115 210,116 219,116 227,117 236,117 245,118 254,118 263,119 272,119 280,119 289,120 298,120 307,120 316,120 324,120 333,121 342,121 351,121 360,121 368,121 377,121 386,121 395,121 404,121 413,121 421,121 430,121 439,121 448,121 457,121 465,121 474,121 483,121 492,121 501,121 509,121 518,121 527,121 536,121 545,121 554,121 562,121 571,121 580,121" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-width="1.2"/>
<text x="586" y="58" class="tb" font-size="11">bmi</text><text x="586" y="36" class="tg" font-size="11">s5</text><text x="586" y="236" class="tr" font-size="11">s1</text><text x="586" y="80" class="tm" font-size="11">s2</text>
<text x="70" y="36" class="tm" font-size="11">all non-zero, all tiny</text>
</svg><figcaption>Ridge path on the same data. No coefficient is ever exactly 0; all grow smoothly as α falls. s1 and s2 stay close together until α ≈ 10, then split into the large opposite OLS values.</figcaption></figure>
  <h3>How to read a path</h3>
  <table class="tbl">
    <tr><th>What you see</th><th>What it means</th><th>In the diabetes plots</th></tr>
    <tr><td>Early entry (left)</td><td>Strong, unique signal: worth paying a large fee for</td><td>bmi (enters at α = 43.5) and s5 (41.5)</td></tr>
    <tr><td>Late entry (right)</td><td>Weak or redundant given the others</td><td>s2 (0.3), age (0.2)</td></tr>
    <tr><td>Two lines diverging in opposite directions near α → 0</td><td>Correlated pair; OLS's split is unstable</td><td>s1 → −37.6, s2 → +22.6</td></tr>
    <tr><td>Sign change along the path</td><td>The effect depends on which other variables are in; do not trust the sign alone</td><td>ridge s1: +1.1 at α = 1000, −37.6 at α = 0.01</td></tr>
    <tr><td>Flat plateau</td><td>That α range does not change the model much; CV score also flat</td><td>lasso α 1–3: 7 features, small changes</td></tr>
  </table>
  <p>The lasso path is <strong>piecewise linear</strong>: between the α's where some feature enters or leaves, every non-zero weight changes linearly in α (which is what LARS exploits). A feature can also <em>leave</em> the lasso path after entering, when a correlated feature takes over its role.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Path plots are only comparable across features if the columns were standardised; otherwise a line's height mostly reflects its units. And entry order is a statement about this dataset's correlations, not a ranking of causal importance.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> The concepts are complete. What remains is the practical toolbox: every sklearn parameter, and the related models you will meet.</div>

  <h2 id="rl-sklearn"><span class="num">12</span>scikit-learn in Practice and Variants</h2>
  <h3>The estimators and their key parameters</h3>
  <table class="tbl">
    <tr><th>Parameter</th><th>Ridge</th><th>Lasso / ElasticNet</th><th>Meaning and advice</th></tr>
    <tr><td><code>alpha</code></td><td>λ on ||y − Xw||² (no 1/n)</td><td>α on (1/2n)||y − Xw||²</td><td>Penalty strength; tune on a log grid by CV</td></tr>
    <tr><td><code>l1_ratio</code></td><td>–</td><td>ElasticNet only: r ∈ [0, 1]</td><td>Mix; 1 = lasso</td></tr>
    <tr><td><code>fit_intercept</code></td><td colspan="2">True: centre, do not penalise the intercept</td><td>Leave True unless data is centred</td></tr>
    <tr><td><code>solver</code></td><td>'auto', 'cholesky', 'svd', 'lsqr', 'sparse_cg', 'sag', 'saga', 'lbfgs'</td><td>coordinate descent (fixed)</td><td>Ridge: 'auto' is fine; 'sag'/'saga' for very large n</td></tr>
    <tr><td><code>max_iter</code>, <code>tol</code></td><td>for iterative solvers</td><td>sweeps / duality-gap tolerance</td><td>Raise <code>max_iter</code> on a <code>ConvergenceWarning</code></td></tr>
    <tr><td><code>selection</code></td><td>–</td><td>'cyclic' or 'random'</td><td>'random' can converge faster with correlated features</td></tr>
    <tr><td><code>positive</code></td><td>yes</td><td>yes</td><td>Force all weights ≥ 0 (prices, mixture proportions)</td></tr>
    <tr><td><code>warm_start</code></td><td>–</td><td>yes</td><td>Reuse the previous solution as the start (manual paths)</td></tr>
    <tr><td><code>precompute</code></td><td>–</td><td>use a precomputed XᵀX (Gram matrix)</td><td>Faster when n ≫ p</td></tr>
    <tr><td>Multi-output y</td><td>yes</td><td>yes; <code>MultiTaskLasso</code> selects the same features for all outputs</td><td></td></tr>
  </table>
  <h3>Related models you should recognise</h3>
  <table class="tbl">
    <tr><th>Model</th><th>Idea</th><th>When</th></tr>
    <tr><td><code>LogisticRegression(penalty, C)</code></td><td>Same L1 / L2 / elastic-net penalties on the log-loss; C = 1/α (bigger C = <em>weaker</em> penalty); L2 by default</td><td>Classification: <a class="xref" data-note="ml_classification">Logistic Regression</a></td></tr>
    <tr><td><code>SGDRegressor(penalty='l2'|'l1'|'elasticnet')</code></td><td>Penalised linear model trained by stochastic gradient descent</td><td>Very large or streaming data</td></tr>
    <tr><td>Kernel ridge</td><td>Ridge with the kernel trick: ridge on RBF / polynomial basis functions without building them</td><td>Smooth nonlinear regression, small n</td></tr>
    <tr><td>Adaptive lasso</td><td>Per-feature penalty weights 1/|ŵ_OLS| so strong features are shrunk less</td><td>Better selection consistency</td></tr>
    <tr><td>Relaxed lasso</td><td>Use lasso to choose features, then refit OLS (or a lighter lasso) on them</td><td>Removes lasso's shrinkage bias on kept weights</td></tr>
    <tr><td>Group lasso</td><td>Penalise groups (e.g. all dummies of one category) so they enter or leave together</td><td>Categorical features, spline bases</td></tr>
    <tr><td>Best subset / stepwise</td><td>Choose k features by search (hard threshold)</td><td>Small p; lasso is the convex relaxation of best subset</td></tr>
    <tr><td>Principal component regression</td><td>Keep the top principal directions, drop the rest (shrink factor 1 or 0)</td><td>Compare: ridge shrinks directions smoothly</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>p-values and confidence intervals from ordinary OLS formulas are not valid for ridge or lasso coefficients, and are not valid for an OLS refit on lasso-selected features either (the selection used the same data). If you need inference after selection, use sample splitting (select on one half, fit and test on the other) or dedicated post-selection inference methods.</p>
  </div>

  <h2 id="rl-compare"><span class="num">13</span>Comparison</h2>
  <table class="tbl">
    <tr><th></th><th>OLS</th><th>Ridge (L2)</th><th>Lasso (L1)</th><th>Elastic Net</th></tr>
    <tr><td>Penalty</td><td>none</td><td>λΣw²</td><td>αΣ|w|</td><td>αrΣ|w| + α(1 − r)/2·Σw²</td></tr>
    <tr><td>Solution</td><td>(XᵀX)⁻¹Xᵀy</td><td>(XᵀX + λI)⁻¹Xᵀy</td><td>no closed form; coordinate descent / LARS</td><td>coordinate descent</td></tr>
    <tr><td>1-D formula</td><td>ρ / s</td><td>divide: Σxy / (Σx² + λ)</td><td>subtract: S(ρ, α) / s</td><td>subtract then divide</td></tr>
    <tr><td>Exact zeros</td><td>no</td><td>no</td><td>yes</td><td>yes</td></tr>
    <tr><td>Correlated features</td><td>erratic, opposite signs</td><td>shares evenly</td><td>picks one, arbitrarily</td><td>shares within groups</td></tr>
    <tr><td>Unique solution</td><td>only if XᵀX invertible</td><td>always (λ &gt; 0)</td><td>not always (exact ties)</td><td>always (r &lt; 1)</td></tr>
    <tr><td>p &gt; n</td><td>fails</td><td>works</td><td>keeps ≤ n features</td><td>works, can keep &gt; n</td></tr>
    <tr><td>Needs scaling</td><td>no</td><td>yes</td><td>yes</td><td>yes</td></tr>
    <tr><td>Bias / variance</td><td>unbiased, high variance</td><td>some bias, lower variance</td><td>bias on kept weights, lower variance</td><td>between</td></tr>
    <tr><td>Bayesian prior</td><td>flat</td><td>Gaussian</td><td>Laplace</td><td>mix of the two</td></tr>
    <tr><td>Best when</td><td>few, distinct, informative columns, n ≫ p</td><td>many small effects, multicollinearity</td><td>few strong effects among many useless columns</td><td>groups of correlated useful columns, p ≫ n</td></tr>
    <tr><td>Diabetes + 200 noise test R²</td><td>−0.258</td><td>0.366</td><td>0.485 (6 kept)</td><td>0.485 (chose r = 1)</td></tr>
  </table>
  <p>Relation to neighbours: <a class="xref" data-note="ml_regularization">Regularization</a> is the general principle (penalties, early stopping, dropout, pruning); <a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a> is the most common reason you suddenly have too many columns; <a class="xref" data-note="ml_dimred">feature selection</a> offers non-penalty alternatives (filters, RFE); <a class="xref" data-note="ml_pca">PCA</a> regression keeps or drops whole directions, where ridge shrinks them smoothly.</p>

  <h2 id="rl-traps"><span class="num">14</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: not standardising</span>
    <p>Penalties depend on units: income in crore was shrunk 76%, in lakh 1%. Put <code>StandardScaler</code> and the model in one <code>Pipeline</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: scaling outside cross-validation</span>
    <p>Fitting the scaler (or <code>PolynomialFeatures</code> knots, imputers…) on all rows before CV leaks information. Cross-validate the whole pipeline; tune with <code>step__alpha</code> names.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: copying α between estimators</span>
    <p><code>Ridge</code> has no 1/n, <code>Lasso</code>/<code>ElasticNet</code> have 1/(2n), <code>LogisticRegression</code> uses C = 1/α. ElasticNet with r → 0 equals Ridge only at Ridge-α = n·α.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reading lasso zeros as "irrelevant"</span>
    <p>A zero can mean "useless" or "redundant with a correlated feature that was kept" (s2 vs s1), and noise columns can be kept by chance (132, 140). Treat lasso's selection as a shortlist and check stability across resamples.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: penalising the intercept</span>
    <p>Hand-rolled solutions that add λ to the whole diagonal, including the intercept, give wrong slopes (0.764 and 2.3 instead of 1 and 1). Centre first or exclude the intercept from the penalty.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: ignoring ConvergenceWarning</span>
    <p>Lasso and elastic net on unscaled or highly correlated data may stop before converging; the weights can then be noticeably off (the [B, A] twin fit changed from [2.44, 0.5] to [0.68, 2.25] once it was allowed to converge). Standardise and raise <code>max_iter</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: too narrow an α grid</span>
    <p>If the chosen α is at the edge of the grid, the true optimum is probably outside it. Use a wide log grid (e.g. 10⁻⁴ to 10⁴ for ridge) or let <code>LassoCV</code> build it from α_max.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: OLS p-values on penalised or selected models</span>
    <p>Standard errors from the OLS formula are not valid for ridge/lasso weights or for refits after lasso selection. Use sample splitting or post-selection inference if you need p-values.</p>
  </div>

  <h2 id="rl-qa"><span class="num">15</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the ridge closed-form solution.</summary><div class="qa-body">L(w) = ||y − Xw||² + λ||w||². Gradient: −2Xᵀ(y − Xw) + 2λw. Set to 0: (XᵀX + λI)w = Xᵀy, so w = (XᵀX + λI)⁻¹Xᵀy. With one feature: w = Σxy / (Σx² + λ). The intercept is excluded from the penalty (centre the data first).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does ridge always have a unique solution, even with duplicate columns or p &gt; n?</summary><div class="qa-body">XᵀX is positive semi-definite with eigenvalues d² ≥ 0. Adding λI makes every eigenvalue d² + λ ≥ λ &gt; 0, so XᵀX + λI is invertible. Equivalently, the loss becomes strictly convex. For the duplicated column, [[4, 4], [4, 4]] (det 0) becomes [[5, 4], [4, 5]] (det 9) at λ = 1, giving [0.889, 0.889].</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does lasso produce exact zeros and ridge does not?</summary><div class="qa-body">Algebra: the 1-D lasso solution is S(ρ, α)/s = sign(ρ)·max(|ρ| − α, 0)/s, which is exactly 0 whenever |ρ| ≤ α; ridge is ρ/(s + λ), never 0 unless ρ = 0. Intuition: the L1 pull has constant size α even for tiny weights, the L2 pull 2λw fades near 0. Geometry: the L1 ball has corners on the axes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Six students, ρ = 12.167, s = 2.917. What is the lasso slope at α = 5, and at what α does it become 0?</summary><div class="qa-body">(12.167 − 5)/2.917 = 2.457. It becomes 0 once α ≥ |ρ| = 12.167. Above that, both the w &gt; 0 and w &lt; 0 cases contradict themselves and only the corner w = 0 satisfies the optimality condition |ρ| ≤ α.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain coordinate descent for lasso.</summary><div class="qa-body">Start from w = 0. For each feature j in turn, compute the residual without j, ρⱼ = xⱼ·residual/n, and set wⱼ = S(ρⱼ, α)/(xⱼᵀxⱼ/n). Repeat sweeps until the duality gap is below tol. It converges because the loss is convex and the non-smooth part is separable across coordinates. Warm starts along a decreasing α grid make full paths cheap.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two features are almost identical. What do OLS, ridge, lasso and elastic net do?</summary><div class="qa-body">OLS: unstable, often large opposite weights ([−3.8, 6.8]). Ridge: splits the effect evenly ([1.5, 1.5]) because Σw² is smallest for an even split. Lasso: gives (almost) all to one ([2.9, 0]); which one is arbitrary and can change with column order or resampling. Elastic net: shares like ridge while still able to zero useless features.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must features be standardised for ridge and lasso but not for OLS?</summary><div class="qa-body">OLS is scale-equivariant: rescaling a column rescales its weight and predictions do not change. Penalties depend on weight size, so a column in large units (small weight) is penalised less than the same information in small units (large weight). Income in crore vs lakh: lasso weight shrunk 76% vs 1%. Standardising makes the penalty compare like with like.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you choose α? What is the one-standard-error rule?</summary><div class="qa-body">Cross-validate a log-spaced grid inside a pipeline: RidgeCV (fast leave-one-out), LassoCV / ElasticNetCV (path + k-fold), or GridSearchCV. 1-SE rule: take the largest α whose mean CV error is within one standard error of the minimum. On diabetes it cut 10 features to 4 for a test R² change of 0.487 → 0.481.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the effective number of degrees of freedom of ridge?</summary><div class="qa-body">df(λ) = Σⱼ d²ⱼ/(d²ⱼ + λ), where d²ⱼ are the eigenvalues of XᵀX. It falls smoothly from p (λ = 0) to 0. On the toy (eigenvalues 5.236 and 0.764) at λ = 2: 0.724 + 0.276 = 1.0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can a ridge coefficient increase as λ increases? Can it change sign?</summary><div class="qa-body">Yes to both. Ridge shrinks the weight vector along each eigen-direction, not each coordinate. On the toy, w₁ went 1 → 1.091 (λ = 1) → 1 → 0.818. On diabetes, ridge s1 is +1.1 at α = 1000 and −37.6 at α = 0.01. Only the norm ||w|| is guaranteed to decrease.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose ridge, lasso or elastic net?</summary><div class="qa-body">Ridge: many features each with a small real effect, multicollinearity, prediction is the goal. Lasso: you expect a few strong features among many useless ones and want a sparse, explainable model. Elastic net: like lasso but with groups of correlated useful features, or p ≫ n; when unsure, tune l1_ratio by CV (it picked 1.0 on the noise-column data).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the Bayesian interpretations of ridge and lasso?</summary><div class="qa-body">Both are MAP estimates under a Gaussian likelihood. Ridge: Normal(0, τ²) prior on each weight (λ = σ²/τ²). Lasso: Laplace prior, which has a sharp peak at 0 and puts more mass there, giving exact zeros at the mode. Elastic net: a product of both.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is α in sklearn's Lasso related to C in LogisticRegression and to alpha in Ridge?</summary><div class="qa-body">Lasso/ElasticNet: α multiplies the penalty on a (1/2n)-scaled squared error. Ridge: α multiplies the penalty on the unscaled squared error (ElasticNet with r → 0 equals Ridge with Ridge-α = n·α). LogisticRegression: C is the inverse strength, roughly 1/α; larger C = weaker regularization.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Lasso kept 6 of 210 columns, including 2 pure-noise columns. Why, and what would you do?</summary><div class="qa-body">With 200 noise columns, a couple will correlate with y by chance in the training rows, enough to beat α. Lasso's selection is not consistent when features are many and correlated. Check stability over bootstrap resamples, use the 1-SE α (sparser), or adaptive/relaxed lasso; validate the final features on fresh data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is the intercept not penalised, and how does sklearn handle it?</summary><div class="qa-body">Penalising it would make predictions depend on the origin of y and x (Celsius vs Fahrenheit), which is meaningless. sklearn centres X and y, solves for the slopes, then sets b₀ = ȳ − x̄ᵀw (25 in the shifted toy). Penalising it wrongly gave slopes 0.764 and 2.3 instead of 1 and 1.</div></details>
</main>
`
});
