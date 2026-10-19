// notes/ml/ml_ridge_lasso.js — Ridge, Lasso & Elastic Net
Object.assign(TOPIC_CONTENT, {
  "ml_ridge_lasso": `<main>
  <h1>Ridge, Lasso &amp; Elastic Net</h1>
  <div class="where"><span>Machine Learning</span><span>Regression</span><span>Ridge, Lasso &amp; Elastic Net</span></div>
  <p class="lead">Ordinary least squares breaks down when columns are correlated, duplicated, numerous or useless: weights swing wildly, signs flip, and test error explodes. Ridge, lasso and elastic net fix this by adding a price for large weights to the loss. This note works everything by hand on the six houses of the Regression group, whose size and bedrooms are 0.968 correlated (VIF 16): ridge's closed form (XᵀX + λI)⁻¹Xᵀy solved as a 2×2 system and explained through the eigen-directions of the data, exactly why and when lasso sets a weight to zero (soft-thresholding derived in one dimension), coordinate descent traced sweep by sweep, elastic net's mix, how each treats correlated features, why standardisation is required, choosing α by cross-validation and reading coefficient paths. Larger datasets (two temperature sensors, 442 diabetes patients, 200 noise columns) show the same ideas at scale.</p>

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
    <li><b>Came from: <a class="xref" data-note="ml_regression">Linear Regression</a>, <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a>, <a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a> and <a class="xref" data-note="ml_regularization">Regularization</a></b><span>OLS minimises the squared error and nothing else. On the six houses it priced 100 sq ft at 6.21 lakh and a bedroom at 2.92 lakh, but the diagnostics note measured a VIF of 16: size and bedrooms move together (correlation 0.968), so rooms' SE was 5.5 and p = 0.63. The polynomial note added size², size³ … and saw degree 5 need a weight of 2,257 to thread six houses. With correlated or numerous columns OLS gives huge, unstable weights; with more columns than rows it has infinitely many perfect fits. The Regularization note gave the general cure, "add a penalty for complexity"; it left the concrete models for here.</span></li>
    <li><b>This note adds: the three standard penalised linear models, completely</b><span>Ridge (L2 penalty, closed form, shrinks smoothly), lasso (L1 penalty, exact zeros, built-in feature selection), elastic net (a mix that keeps correlated groups together). How each is solved, how each behaves with correlated columns, why you must standardise, how to choose α by cross-validation, and how to read coefficient paths.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_classification">Logistic Regression</a> and beyond</b><span>Logistic regression uses exactly these penalties (sklearn's <code>C</code> = 1/α, <code>penalty='l1'|'l2'|'elasticnet'</code>). L1 is one of the embedded feature-selection methods in <a class="xref" data-note="ml_dimred">Curse of Dimensionality &amp; Feature Selection</a>. The L2 penalty is "weight decay" in neural networks and the margin term in <a class="xref" data-note="ml_svm">Support Vector Machines</a>; XGBoost's <code>reg_lambda</code> / <code>reg_alpha</code> are the same idea on leaf weights.</span></li>
  </ol>
  <h3>The Regression group as one ladder</h3>
  <table class="tbl">
    <tr><th>Step</th><th>Note</th><th>On the six houses</th><th>Leaves open</th></tr>
    <tr><td>1</td><td><a class="xref" data-note="ml_regression">Linear Regression</a></td><td>price = −16 + 7·size; with bedrooms −14.58 + 6.21·size + 2.92·rooms</td><td>can we trust the SEs?</td></tr>
    <tr><td>2</td><td><a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a></td><td>residual smile; VIF 16 for size and rooms; F most influential</td><td>fix the shape; fix the collinearity</td></tr>
    <tr><td>3</td><td><a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a></td><td>58.66 + 7z + 0.2009z²; degree 5 needs weights of 2,257</td><td>tame many, correlated columns</td></tr>
    <tr><td>4</td><td><strong>Ridge, Lasso &amp; Elastic Net</strong> (this)</td><td>ridge λ = 5: size 6.09, rooms 1.74 (stable); lasso α = 2: size 6.83, rooms 0</td><td>→ penalties reappear in classification, trees, nets</td></tr>
  </table>
  <p>You should know the normal equation w = (XᵀX)⁻¹Xᵀy (<a class="xref" data-note="ml_regression">Linear Regression</a>), what a derivative is (<a class="xref" data-note="m_calculus">Calculus</a>), and k-fold cross-validation (<a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a>). Each is recalled where used. The data, recalled: houses A–F with size 6, 8, 10, 12, 14, 16 (hundreds of sq ft), bedrooms 1, 2, 2, 3, 3, 4 and price 28, 40, 53, 66, 79, 100 lakh. Centred: size − 11 = −5, −3, −1, 1, 3, 5; rooms − 2.5 = −1.5, −0.5, −0.5, 0.5, 0.5, 1.5; price − 61 = −33, −21, −8, 5, 18, 39. Their sums of products: S₁₁ = 70, S₁₂ = 19, S₂₂ = 5.5, S₁y = 490, S₂y = 134.</p>

  <h2 id="rl-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question.</p>
  <ol class="story">
    <li><b>Where OLS breaks</b><span>Q: why can't we trust size 6.21 and rooms 2.92? → Size entered twice makes XᵀX singular (det 0); near-twins make it nearly so: leaving one house out moves rooms anywhere from −1.67 to +5.58. We need a rule that prefers small, sensible weights.</span></li>
    <li><b>Ridge (L2)</b><span>Q: how do we get a unique, stable answer? → Minimise SSE + λΣw²: w = (XᵀX + λI)⁻¹Xᵀy. λ = 5 gives size 6.09, rooms 1.74. But how does it decide what to shrink?</span></li>
    <li><b>How ridge shrinks</b><span>Q: which parts of the answer does ridge distrust? → The data's directions: "bigger with more rooms" (eigenvalue 75.2) keeps 94%, "more rooms, same size" (0.32) keeps 6% at λ = 5; effective df 1.0. But no weight ever reaches exactly 0…</span></li>
    <li><b>Lasso (L1)</b><span>Q: can a penalty switch a column fully off? → Charge Σ|w| instead: the diamond's corners sit on the axes. But what exact rule makes a weight 0?</span></li>
    <li><b>Soft-thresholding</b><span>Q: when does lasso kill a weight? → In 1-D, w = S(ρ, α)/s: size alone shrinks 7 → 6.14 → 3.57 and dies once α ≥ ρ = 81.67. With several correlated columns, how is it computed?</span></li>
    <li><b>Coordinate descent</b><span>Q: how do we solve lasso with two or more columns? → Soft-threshold one weight at a time: α = 2 gives [6.83, 0] in one sweep (rooms off); α = 0.1 creeps toward [6.55, 1.64], closing only 6% of the gap per sweep because the twins fight. Lasso keeps one twin; can we keep groups?</span></li>
    <li><b>Elastic net</b><span>Q: zeros and grouping together? → Subtract, then divide: w = S(ρ, αr)/(s + α(1 − r)), size 4.60 at α = 10, r = 0.5. So how do the four models really treat size and rooms?</span></li>
    <li><b>Correlated features</b><span>Q: who gets the credit? → Standardised: OLS [21.2, 2.8] and unstable, ridge [12.5, 9.6] shares, lasso [20.2, 1.7] favours size, elastic net [7.9, 7.3] shares and shrinks. Every fit was standardised first. Why?</span></li>
    <li><b>Standardisation</b><span>Q: do units matter? → Yes: Ridge(70) gives 3.5 lakh per 100 sq ft with size in hundreds of sq ft but 7.0 with size in sq ft. Standardise, inside a pipeline. Then which α?</span></li>
    <li><b>Choosing α</b><span>Q: how strong a penalty? → Cross-validate: on six houses leave-one-out picks small α (0.08 ridge); on diabetes the 1-SE rule keeps 4 of 10 features; with 200 noise columns lasso scores 0.485 where OLS scores −0.26. Can we see every α at once?</span></li>
    <li><b>Coefficient paths</b><span>Q: how does each weight move with α? → Lasso: size enters at α = 23.9, rooms only below 5.4; ridge: both glide together. How is all this used in practice? → sklearn knobs and variants.</span></li>
  </ol>

  <h2 id="rl-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Ridge, Lasso &amp; Elastic Net</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">1 · Why OLS fails</div>
        <ul>
          <li>Size twice → XᵀX = [[70, 70], [70, 70]], det 0, no inverse</li>
          <li>Size &amp; rooms (r 0.968): drop one house → rooms −1.67 … 5.58</li>
          <li>p ≥ n → infinitely many perfect fits; noise columns → test R² −0.26</li>
          <li>💡 Fix: charge a price for big weights; fit must earn every weight</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">2 · Ridge (L2)</div>
        <ul>
          <li>min ||y − Xw||² + λ||w||² → <b>w = (XᵀX + λI)⁻¹Xᵀy</b></li>
          <li>1-D: w = Σxy / (Σx² + λ) — divides, never 0</li>
          <li>Houses: λ = 0, 1, 5, 20 → [6.21, 2.92], [6.36, 2.03], [6.09, 1.74], [5.14, 1.42]</li>
          <li>+λI makes XᵀX invertible (eigenvalues d² → d² + λ)</li>
          <li>Shrinks direction j by d²ⱼ/(d²ⱼ + λ): 0.938 and 0.060 at λ = 5; df 1.0</li>
          <li>Intercept not penalised; Gaussian prior (MAP)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">3 · Lasso (L1)</div>
        <ul>
          <li>sklearn: min (1/2n)||y − Xw||² + α||w||₁; no closed form</li>
          <li>1-D: <b>w = S(ρ, α) / s</b>, S = sign(ρ)·max(|ρ| − α, 0) — subtracts</li>
          <li>Houses: ρ = 81.67, s = 11.67: α = 10 → 6.14, 40 → 3.57, ≥ 81.67 → 0</li>
          <li>Geometry: diamond corners lie on the axes</li>
          <li><b>Coordinate descent</b>: α = 2 → [6.83, 0]; α = 0.1 → [6.55, 1.64]</li>
          <li>Laplace prior (MAP); at most n non-zeros when p &gt; n</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">4 · Elastic Net</div>
        <ul>
          <li>α·r·||w||₁ + α(1 − r)/2·||w||², r = <code>l1_ratio</code></li>
          <li>1-D: w = S(ρ, αr) / (s + α(1 − r)) — subtract, then divide</li>
          <li>Houses: α = 10, r = 0.5 → 4.60 (lasso 6.14)</li>
          <li>Zeros + grouping of correlated features</li>
          <li>r = 1 lasso; r → 0 ridge with Ridge-alpha = n·α (60 ↔ 10)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">5 · Behaviour</div>
        <ul>
          <li><b>Correlated twins</b> (standardised houses): OLS [21.2, 2.8] · ridge [12.5, 9.6] · lasso [20.2, 1.7]</li>
          <li>Identical columns: ridge splits exactly evenly (3.475 each); lasso's split is arbitrary</li>
          <li><b>Standardise first</b>: Ridge(70) → 3.5 per 100 sq ft vs 7.0 with sq ft</li>
          <li>Ridge coefficients can grow first (size 6.21 → 6.36 at λ = 1)</li>
          <li>⚠ Lasso selection ≠ causation; unstable with twins</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">6 · Choosing α &amp; using it</div>
        <ul>
          <li><code>RidgeCV</code> (fast leave-one-out), <code>LassoCV</code>, <code>ElasticNetCV</code> → <code>alpha_</code></li>
          <li>Houses LOO: ridge α 0.08, lasso α 0.14 (six rows support little shrinkage)</li>
          <li>1-SE rule: diabetes 10 → 4 features, same test R² (0.487 → 0.481)</li>
          <li>210 columns (200 noise): OLS −0.258 · Ridge 0.366 · Lasso 0.485 with 6 kept</li>
          <li>Paths: houses size enters at α 23.9, rooms at 5.4</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="rl-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="rl-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Where OLS Breaks</span><span class="rm-sub">Duplicates, twins, too many columns</span></div></div>
      <div class="rm-item rm-done" data-target="rl-ridge"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Ridge Regression</span><span class="rm-sub">Closed form derived and solved by hand</span></div></div>
      <div class="rm-item rm-done" data-target="rl-shrink"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">How Ridge Shrinks</span><span class="rm-sub">Eigen-directions, df, the path</span></div></div>
      <div class="rm-item rm-done" data-target="rl-lasso"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Lasso Regression</span><span class="rm-sub">Objective and geometry</span></div></div>
      <div class="rm-item rm-done" data-target="rl-soft"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Why Lasso Gives Zeros</span><span class="rm-sub">Soft-thresholding in 1-D</span></div></div>
      <div class="rm-item rm-done" data-target="rl-cd"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Coordinate Descent</span><span class="rm-sub">Sweeps by hand</span></div></div>
      <div class="rm-item rm-done" data-target="rl-enet"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Elastic Net</span><span class="rm-sub">Mixing L1 and L2</span></div></div>
      <div class="rm-item rm-done" data-target="rl-corr"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Correlated Features</span><span class="rm-sub">Ridge shares, lasso picks one</span></div></div>
      <div class="rm-item rm-done" data-target="rl-std"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Standardization</span><span class="rm-sub">Why units change the answer</span></div></div>
      <div class="rm-item rm-done" data-target="rl-alpha"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Choosing α</span><span class="rm-sub">RidgeCV, LassoCV, 1-SE rule</span></div></div>
      <div class="rm-item rm-done" data-target="rl-path"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Coefficient Paths</span><span class="rm-sub">Reading the plots</span></div></div>
      <div class="rm-item rm-done" data-target="rl-sklearn"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">sklearn &amp; Variants</span><span class="rm-sub">Every knob, related models</span></div></div>
      <div class="rm-item rm-done" data-target="rl-connect"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One loss, three penalties</span></div></div>
      <div class="rm-item rm-done" data-target="rl-compare"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Comparison</span><span class="rm-sub">OLS vs ridge vs lasso vs ENet</span></div></div>
      <div class="rm-item rm-done" data-target="rl-traps"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Scaling, leakage, over-reading zeros</span></div></div>
      <div class="rm-item rm-done" data-target="rl-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="rl-qa"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="rl-why"><span class="num">01</span>Where Ordinary Least Squares Breaks</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Linear Regression gave the houses price = −14.58 + 6.21·size + 2.92·rooms, and the diagnostics note warned that size and bedrooms are near-twins (VIF 16). How bad is that in practice, and what happens in the extreme case where a column is an exact copy?</p>
  </div>
  <h3>The need</h3>
  <p>OLS picks the weights that make the squared error on the training rows as small as possible, with no other preference. That is fine when the columns carry clearly different information and there are many more rows than columns. Real tables often break those conditions:</p>
  <table class="tbl">
    <tr><th>Situation</th><th>Example</th><th>What OLS does</th></tr>
    <tr><td>Duplicate columns</td><td>floor area from the sale deed and from the municipal record</td><td>XᵀX has no inverse: infinitely many equally good answers</td></tr>
    <tr><td>Highly correlated columns</td><td>size and bedrooms, two temperature sensors, x and x², two cholesterol tests</td><td>large or opposite weights that change with a few new rows</td></tr>
    <tr><td>More columns than rows (p ≥ n)</td><td>genes, text words, polynomial features (degree 5 on six houses)</td><td>fits training data perfectly, predicts badly</td></tr>
    <tr><td>Many useless columns</td><td>a feature store with 200 columns, 10 useful</td><td>gives every noise column a weight, memorises noise</td></tr>
  </table>
  <h3>By hand: a duplicated column</h3>
  <p>Suppose the dealer's sheet has the floor area twice (deed and municipal record), both equal to size. Use the centred size z = −5, −3, −1, 1, 3, 5 for both columns and the centred price. The normal equation needs (XᵀX)⁻¹. Each entry of XᵀX is a sum of products of two columns: Σz·z = 70 for every pair, so XᵀX = [[70, 70], [70, 70]], whose determinant is 70·70 − 70·70 = <strong>0</strong>. A matrix with zero determinant has no inverse. In plain words: w₁ = 7, w₂ = 0 fits exactly as well as w₁ = 0, w₂ = 7, or w₁ = 107, w₂ = −100. The data cannot choose.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet

size = np.array([6, 8, 10, 12, 14, 16.0])        # houses A-F, hundreds of sq ft
rooms = np.array([1, 2, 2, 3, 3, 4.0])           # bedrooms
price = np.array([28, 40, 53, 66, 79, 100.0])    # lakh rupees
z, yc = size - size.mean(), price - price.mean() # centred size and price

X = np.c_[z, z]                                  # size entered twice (deed area and municipal area)
print("X^T X =", (X.T @ X).tolist(), " det =", round(np.linalg.det(X.T @ X), 6) + 0.0, " X^T y =", (X.T @ yc).tolist())
try:
    np.linalg.inv(X.T @ X)
except np.linalg.LinAlgError as e:
    print("inverse fails:", e)
print("OLS via lstsq (the smallest of infinitely many answers):", LinearRegression(fit_intercept=False).fit(X, yc).coef_.round(3))
for lam in [1, 10]:
    w = np.linalg.solve(X.T @ X + lam * np.eye(2), X.T @ yc)
    print(f"ridge lambda={lam}: by formula {w.round(3)}  sklearn {Ridge(alpha=lam, fit_intercept=False).fit(X, yc).coef_.round(3)}  sum {w.sum():.3f}")</div>
  <div class="fx" data-lang="text">X^T X = [[70.0, 70.0], [70.0, 70.0]]  det = 0.0  X^T y = [490.0, 490.0]
inverse fails: Singular matrix
OLS via lstsq (the smallest of infinitely many answers): [3.5 3.5]
ridge lambda=1: by formula [3.475 3.475]  sklearn [3.475 3.475]  sum 6.950
ridge lambda=10: by formula [3.267 3.267]  sklearn [3.267 3.267]  sum 6.533</div>
  <p>The inverse fails exactly as the hand calculation said. <code>LinearRegression</code> does not crash because it uses a least-squares solver that quietly returns the smallest of the infinitely many answers (3.5 each); that hides the problem rather than solving it. Adding λ to the diagonal (the ridge fix, next section) makes the matrix invertible, and the answer is unique and sensible: the two copies share the weight equally. The hand version for λ = 1: XᵀX + I = [[71, 70], [70, 71]], determinant 71² − 70² = 141, inverse (1/141)·[[71, −70], [−70, 71]]; Xᵀy = [490, 490]; so w = (1/141)·[71·490 − 70·490, −70·490 + 71·490] = [490/141, 490/141] = [3.475, 3.475]. The total 6.95 is a little under the true 7: that small shortfall is the bias ridge accepts in exchange for a unique answer.</p>
  <h3>By hand: near-twins are fragile</h3>
  <p>Size and bedrooms are not copies, but nearly: correlation 0.968. The 2×2 system 70w₁ + 19w₂ = 490, 19w₁ + 5.5w₂ = 134 has determinant 24, against 385 if the columns were unrelated. A small determinant means the answer is sensitive to small changes in the data. Test it: refit with one house left out at a time.</p>
  <div class="fx" data-lang="py">X2 = np.c_[size, rooms]
print("all six houses : size, rooms =", LinearRegression().fit(X2, price).coef_.round(2))
for i, h in enumerate("ABCDEF"):                 # refit without one house at a time
    keep = np.arange(6) != i
    print(f"without house {h}: size, rooms =", LinearRegression().fit(X2[keep], price[keep]).coef_.round(2))</div>
  <div class="fx" data-lang="text">all six houses : size, rooms = [6.21 2.92]
without house A: size, rooms = [5.97 5.33]
without house B: size, rooms = [5.57 4.93]
without house C: size, rooms = [6.29 2.58]
without house D: size, rooms = [5.54 5.58]
without house E: size, rooms = [ 7.67 -1.67]
without house F: size, rooms = [ 6.57 -0.67]</div>
  <p>The value of a bedroom swings from −1.67 (without E) to +5.58 (without D), and changes sign. The value of 100 sq ft moves from 5.54 to 7.67. Removing one flat out of six rewrites the price list. Yet every one of these fits predicts the remaining houses well: the data knows "bigger flats with more rooms cost more", but not how to split the credit between the two.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two brothers did a school project together and the teacher must split 20 marks between them. With no other information, "20 and 0", "10 and 10" and "120 and −100" all add up. OLS has no opinion and may pick anything. A penalty on big marks is a rule like "prefer small, even numbers": it picks 10 and 10.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Ill-posed / ill-conditioned least squares</strong>: XᵀX is singular (columns linearly dependent, or p &gt; n) or nearly singular (columns highly correlated). The OLS solution is then not unique, or unique but extremely sensitive to small changes in the data (high variance). <strong>Regularization</strong> adds a penalty that makes the problem well-posed by preferring small weights.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>sklearn and numpy will usually not warn you. A model with a negative bedroom weight, or weights like [−37.7, 22.7] on two near-identical blood tests, runs fine and even scores fine on training data. Look at the coefficients, the condition number or the VIFs (<a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a>) before trusting individual weights.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Ridge regression.</b> We need a precise rule that prefers small weights, and a way to solve it. The simplest such rule charges the squares of the weights.</div>

  <h2 id="rl-ridge"><span class="num">02</span>Ridge Regression (L2)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>OLS has no opinion about how to split credit between size and bedrooms, so tiny data changes flip the split. What precise rule would make the answer unique and stable, and can we still solve it with a formula?</p>
  </div>
  <h3>Plain words</h3>
  <p>Ridge minimises <em>error + λ × (sum of squared weights)</em>. Every weight now has a cost. A weight survives at a large value only if it reduces the squared error by more than it costs. λ (sklearn calls it <code>alpha</code>) sets the exchange rate: λ = 0 is plain OLS, a huge λ pushes every weight toward 0, so the model predicts the average price.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A percentage tax on weights. Big weights pay a lot, small ones a little, and the tax is never more than the weight is worth, so nobody is wiped out entirely. Everyone just gets smaller.</p>
  </div>
  <h3>Deriving the closed form</h3>
  <p>Write the ridge loss in matrix form, with X the (centred) feature table, y the (centred) target, w the weights:</p>
  <p style="text-align:center"><strong>L(w) = (y − Xw)ᵀ(y − Xw) + λ·wᵀw</strong></p>
  <p>Step 1, expand: L = yᵀy − 2wᵀXᵀy + wᵀXᵀXw + λwᵀw. Step 2, take the derivative with respect to w (the same rules as for numbers: the derivative of −2wb is −2b, of w·a·w is 2aw): ∂L/∂w = −2Xᵀy + 2XᵀXw + 2λw. Step 3, set it to zero at the minimum: XᵀXw + λw = Xᵀy, i.e. (XᵀX + λI)w = Xᵀy. Step 4, solve:</p>
  <p style="text-align:center"><strong>ŵ_ridge = (XᵀX + λI)⁻¹ Xᵀy</strong></p>
  <p>Compared with OLS, the only change is "+ λ" on the diagonal of XᵀX. With one feature everything is a number: <strong>w = Σxy / (Σx² + λ)</strong>. For size alone: 490/(70 + λ). The penalty sits in the denominator, so the weight is <em>divided</em> down: it shrinks toward 0 as λ grows but never reaches it. The loss is a sum of a convex bowl and a strictly convex bowl (λ &gt; 0), so there is exactly one minimum.</p>
  <h3>Worked by hand: size and bedrooms</h3>
  <p>Centred size and bedrooms, centred price (raw units: size in hundreds of sq ft, rooms as a count). From the sums recalled above, XᵀX = [[70, 19], [19, 5.5]] and Xᵀy = [490, 134]. For a 2 × 2 matrix [[a, b], [b, d]] the inverse is (1/(ad − b²))·[[d, −b], [−b, a]].</p>
  <table class="tbl out"><caption>Ridge by hand: (XᵀX + λI)⁻¹ Xᵀy with Xᵀy = [490, 134]</caption>
    <tr><th>λ</th><th>XᵀX + λI</th><th>det</th><th>w_size</th><th>w_rooms</th></tr>
    <tr><td>0 (OLS)</td><td>[[70, 19], [19, 5.5]]</td><td>385 − 361 = 24</td><td>(5.5·490 − 19·134)/24 = 149/24 = <strong>6.208</strong></td><td>(70·134 − 19·490)/24 = 70/24 = <strong>2.917</strong></td></tr>
    <tr><td>1</td><td>[[71, 19], [19, 6.5]]</td><td>461.5 − 361 = 100.5</td><td>(3185 − 2546)/100.5 = <strong>6.358</strong></td><td>(9514 − 9310)/100.5 = <strong>2.030</strong></td></tr>
    <tr><td>5</td><td>[[75, 19], [19, 10.5]]</td><td>787.5 − 361 = 426.5</td><td>(5145 − 2546)/426.5 = <strong>6.094</strong></td><td>(10050 − 9310)/426.5 = <strong>1.735</strong></td></tr>
    <tr><td>20</td><td>[[90, 19], [19, 25.5]]</td><td>2295 − 361 = 1934</td><td>(12495 − 2546)/1934 = <strong>5.144</strong></td><td>(12060 − 9310)/1934 = <strong>1.422</strong></td></tr>
  </table>
  <p>Three things to notice. (1) The determinant grows fast (24 → 100.5 → 426.5): adding λ moves the system away from singular, which is exactly why the answers stop swinging. (2) The total size ||w||² falls (47.05 → 44.55 → 40.15 → 28.49) while the training error rises (RSS 31.1 → 31.9 → 44.8 → 183): ridge deliberately fits the training data worse. (3) w_size <em>grew</em> from 6.208 to 6.358 at λ = 1 before shrinking. Ridge shrinks the length of the weight vector, not necessarily every single weight; section 03 explains why.</p>
  <div class="fx" data-lang="py">Xc = np.c_[z, rooms - rooms.mean()]                    # centred size and rooms
A, b = Xc.T @ Xc, Xc.T @ yc
print("X^T X =", A.tolist(), " X^T y =", b.tolist())
for lam in [0, 1, 5, 20, 100]:
    w = np.linalg.solve(A + lam * np.eye(2), b)        # (X^T X + lam I)^-1 X^T y
    sk = Ridge(alpha=lam, fit_intercept=False).fit(Xc, yc).coef_ if lam else w
    print(f"lambda={lam:&lt;4} formula w={w.round(3)}  sklearn w={sk.round(3)}  ||w||^2={w @ w:7.3f}  RSS={np.sum((yc - Xc @ w)**2):8.3f}")

d2, V = np.linalg.eigh(A)                               # eigenvalues d^2 and directions of X^T X
print("eigenvalues of X^T X:", d2.round(3), "  directions (columns):", V.round(4).tolist())
for lam in [0, 5, 20]:
    f = d2 / (d2 + lam)
    print(f"lambda={lam:&lt;3} shrink factors {f.round(4)}  effective df = {f.sum():.3f}")</div>
  <div class="fx" data-lang="text">X^T X = [[70.0, 19.0], [19.0, 5.5]]  X^T y = [490.0, 134.0]
lambda=0    formula w=[6.208 2.917]  sklearn w=[6.208 2.917]  ||w||^2= 47.050  RSS=  31.083
lambda=1    formula w=[6.358 2.03 ]  sklearn w=[6.358 2.03 ]  ||w||^2= 44.547  RSS=  31.930
lambda=5    formula w=[6.094 1.735]  sklearn w=[6.094 1.735]  ||w||^2= 40.145  RSS=  44.824
lambda=20   formula w=[5.144 1.422]  sklearn w=[5.144 1.422]  ||w||^2= 28.485  RSS= 183.069
lambda=100  formula w=[2.797 0.766]  sklearn w=[2.797 0.766]  ||w||^2=  8.409  RSS=1150.021
eigenvalues of X^T X: [ 0.319 75.181]   directions (columns): [[0.2631, -0.9648], [-0.9648, -0.2631]]
lambda=0   shrink factors [1. 1.]  effective df = 2.000
lambda=5   shrink factors [0.06   0.9376]  effective df = 0.998
lambda=20  shrink factors [0.0157 0.7899]  effective df = 0.806</div>
  <p>Formula, hand table and sklearn agree at every λ. (Ignore the last four lines for now; they are section 03.) <code>fit_intercept=False</code> because our data is already centred; sklearn's <code>Ridge</code> minimises exactly ||y − Xw||² + α||w||², so its <code>alpha</code> is our λ.</p>
  <h3>The intercept is not penalised</h3>
  <p>Shrinking the intercept toward 0 would make predictions depend on where zero happens to be (prices in lakh or in rupees, size from 0 or from 600 sq ft). So ridge penalises only the slopes. In practice sklearn centres X and y, solves the ridge problem on the centred data, and then sets b₀ = ȳ − x̄ᵀw. Here is Ridge(5) on the raw, uncentred houses:</p>
  <div class="fx" data-lang="py">m = Ridge(alpha=5).fit(np.c_[size, rooms], price)      # raw, uncentred houses; fit_intercept=True
print("weights", m.coef_.round(3), " intercept", round(m.intercept_, 3),
      " = ybar - xbar.w =", round(price.mean() - np.array([size.mean(), rooms.mean()]) @ m.coef_, 3))
Xb = np.c_[np.ones(6), size, rooms]
naive = np.linalg.solve(Xb.T @ Xb + 5 * np.eye(3), Xb.T @ price)
print("if the intercept were penalised too:", naive.round(3))</div>
  <div class="fx" data-lang="text">weights [6.094 1.735]  intercept -10.369  = ybar - xbar.w = -10.369
if the intercept were penalised too: [-1.04   5.265  1.997]</div>
  <p>The slopes are the hand values [6.094, 1.735], and the intercept is 61 − (11 × 6.094 + 2.5 × 1.735) = 61 − 67.03 − 4.34 = −10.37, exactly ȳ − x̄ᵀw. Penalising the intercept as well (the naive version, adding λ to all three diagonal entries) gives a different, worse model: intercept −1.04 instead of −10.37, size 5.27 instead of 6.09, bedrooms 2.00 instead of 1.74, because the model now prefers a small intercept over a correct fit, and tilts the slopes to make up for it.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Ridge regression</strong> (Hoerl &amp; Kennard, 1970; also Tikhonov regularization): ŵ = argmin ||y − Xw||² + λ||w||₂², with ||w||₂² = Σwⱼ² and the intercept unpenalised. Closed form ŵ = (XᵀX + λI)⁻¹Xᵀy on centred data, unique for any λ &gt; 0 even when XᵀX is singular. Equivalent constrained form: minimise ||y − Xw||² subject to Σwⱼ² ≤ t, where each λ corresponds to some budget t.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>sklearn's estimators do not share one scale for α. <code>Ridge</code> uses ||y − Xw||² + α||w||² (no 1/n). <code>Lasso</code> and <code>ElasticNet</code> use (1/2n)||y − Xw||² + …. So "α = 1" means very different strengths in the two, and changes with n for one but not the other. Never copy an α from one class to another.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How ridge shrinks.</b> We saw ridge shrink, but not <em>how</em>: why did w_size grow first, and which parts of the data does ridge trust less? The answer is in the eigenvectors of XᵀX.</div>

  <h2 id="rl-shrink"><span class="num">03</span>How Ridge Shrinks</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Ridge with λ = 5 cut the bedroom weight from 2.92 to 1.74 but barely touched size (6.21 → 6.09), and at λ = 1 size even rose. What is ridge actually shrinking, if not each weight equally?</p>
  </div>
  <h3>Directions in the data</h3>
  <p>The matrix XᵀX describes how spread out the data is in each direction. Its eigenvectors are the principal directions (the same ones <a class="xref" data-note="ml_pca">PCA</a> finds) and its eigenvalues d² say how much spread there is along each. Adding λI adds λ to every eigenvalue and leaves the directions unchanged. The result: along a direction with spread d², ridge keeps a fraction</p>
  <p style="text-align:center"><strong>shrink factor = d² / (d² + λ)</strong></p>
  <p>of the OLS answer. Directions with lots of spread (d² ≫ λ) keep almost everything. Directions with little spread (d² ≪ λ), where the data says very little and OLS was guessing, are shrunk almost to 0.</p>
  <h3>By hand on the houses</h3>
  <p>Eigenvalues of [[70, 19], [19, 5.5]]: solve det(XᵀX − μI) = (70 − μ)(5.5 − μ) − 361 = μ² − 75.5μ + 24 = 0, so μ = (75.5 ± √(5700.25 − 96))/2 = (75.5 ± 74.86)/2 = <strong>75.18</strong> and <strong>0.319</strong>. The big one's direction is u₁ = (0.965, 0.263): "a bigger flat with proportionally more rooms", the way the six houses actually vary. The small one's is u₂ = (−0.263, 0.965): "more rooms in the same floor area", a combination the six houses barely vary in (B and C both have 2 rooms at different sizes, D and E both 3; that is all the data has).</p>
  <table class="tbl out"><caption>Ridge λ = 5, worked in the eigen-directions</caption>
    <tr><th>direction</th><th>d²</th><th>shrink d²/(d² + 5)</th><th>OLS component uᵀ[6.208, 2.917]</th><th>ridge component</th></tr>
    <tr><td>u₁ = (0.965, 0.263)</td><td>75.18</td><td>75.18 / 80.18 = 0.938</td><td>5.990 + 0.767 = 6.757</td><td>6.757 × 0.938 = 6.335</td></tr>
    <tr><td>u₂ = (−0.263, 0.965)</td><td>0.319</td><td>0.319 / 5.319 = 0.060</td><td>−1.633 + 2.814 = 1.181</td><td>1.181 × 0.060 = 0.071</td></tr>
  </table>
  <p>Back to (w_size, w_rooms): 6.335·(0.965, 0.263) + 0.071·(−0.263, 0.965) = (6.112 − 0.019, 1.667 + 0.068) = <strong>(6.094, 1.735)</strong>, the same answer as the matrix inverse. Now the puzzle is clear. OLS's [6.208, 2.917] has a sizeable component (1.181) along the weak direction u₂, which says "rooms up, size <em>down</em>". That component is the unreliable part (it is what flipped when we dropped one house). Ridge keeps only 6% of it. Removing most of its negative size part lets w_size <em>rise</em> at small λ, while the vector as a whole shrinks.</p>
  <h3>Effective degrees of freedom</h3>
  <p>OLS with p columns uses p degrees of freedom. Ridge uses fewer: <strong>df(λ) = Σⱼ d²ⱼ / (d²ⱼ + λ)</strong>, the sum of the shrink factors. For λ = 5: 0.938 + 0.060 = <strong>0.998</strong>. The two-weight ridge model has the flexibility of about one free weight, which is honest: the six houses only really inform one direction. λ is a smooth dial between p (λ = 0) and 0 (λ → ∞), unlike "drop a column", which jumps by whole numbers. These are the last lines of the code output above (eigenvalues 0.319, 75.181; df 2.000, 0.998, 0.806).</p>
  <h3>The shrinkage path</h3>
  <p>Plotting each weight against λ gives the ridge path: all weights glide smoothly toward 0, never touching it. On the houses: [6.21, 2.92] → [6.36, 2.03] (λ = 1) → [6.09, 1.74] (λ = 5) → [5.14, 1.42] (λ = 20) → [2.80, 0.77] (λ = 100). Section 11 draws paths on standardised data.</p>
  <h3>Why trading bias for variance pays</h3>
  <p>Shrinking adds bias: the λ = 5 weights are not the OLS weights, and if the truth really were [6.21, 2.92] we would be off. But it removes variance: the weak direction u₂, which swung from −1.67 to +5.58 for rooms when one house was dropped, is mostly ignored. Expected test error = bias² + variance + noise (derived in <a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a>). There is always some λ &gt; 0 at which the drop in variance beats the rise in bias squared (a classic result by Hoerl and Kennard), which is why a well-tuned ridge rarely loses to OLS on new data.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Ridge is "OLS that trusts each direction of the data in proportion to how much the data actually varies in it". Correlated columns create a direction with almost no variation (their difference: "more rooms, same size", eigenvalue 0.319). OLS puts large, unstable weight there; ridge nearly ignores it. That is the whole cure for multicollinearity.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>With the SVD X = UDVᵀ, ridge predictions are ŷ = Σⱼ uⱼ · d²ⱼ/(d²ⱼ + λ) · uⱼᵀy: each principal component of y is kept with factor d²ⱼ/(d²ⱼ + λ). <strong>Bayesian view</strong>: ridge is the most likely w (MAP estimate) when each weight has a Normal(0, σ²/λ) prior, i.e. "I believe weights are small and Gaussian" (see <a class="xref" data-note="ml_regularization">Regularization</a>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Ridge never produces exact zeros, so it is not a feature selector. "Ridge shrank this weight to 0.002" means "small", not "removed": the column is still needed at prediction time. If you need fewer columns, you need an L1 penalty.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Lasso.</b> Ridge keeps every column. With 200 columns of which 10 matter, or a bedroom count that adds little once size is known, we would like a model that switches the useless ones fully off. Changing the square to an absolute value does exactly that.</div>

  <h2 id="rl-lasso"><span class="num">04</span>Lasso Regression (L1)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Ridge shrinks the bedroom weight but never to exactly 0, so the model always needs every column. Is there a penalty that can decide "this column is not worth keeping" and remove it completely?</p>
  </div>
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
  <p>The constrained form is "minimise the squared error, but stay inside a budget region". For lasso the region |w₁| + |w₂| ≤ t is a diamond whose corners sit on the axes; for ridge w₁² + w₂² ≤ t it is a circle. The error's contour lines are ellipses around the OLS answer (for size and rooms they are long thin ellipses, stretched along the weak direction u₂). Grow the ellipses until they first touch the region. A circle has no special points, so it is touched somewhere generic, with both weights non-zero. A diamond sticks out at its corners, so the ellipse usually touches a corner first, and at a corner one weight is exactly 0. In higher dimensions the L1 ball has even more corners and edges, so even more weights land on 0.</p>
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
  <div class="bridge"><b>What this still can't tell us → next: Soft-thresholding.</b> "Corners" is a picture. What is the actual rule that sets a weight to exactly 0, and at what α does it happen?</div>

  <h2 id="rl-soft"><span class="num">05</span>Why Lasso Sets Weights to Zero: Soft-Thresholding</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Take the simplest case, price on size alone. As the lasso fee α rises, how exactly does the size weight fall from 7, and at precisely which α does it hit 0?</p>
  </div>
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
  <h3>Worked by hand: price on size</h3>
  <p>Centred sums: Σdx·dy = 490, Σdx² = 70, n = 6. So ρ = 490/6 = 81.667, s = 70/6 = 11.667, and the OLS slope ρ/s = 7.</p>
  <table class="tbl out"><caption>Lasso slope w = max(81.667 − α, 0) / 11.667</caption>
    <tr><th>α</th><th>|ρ| − α</th><th>w</th><th>case</th></tr>
    <tr><td>10</td><td>71.667</td><td>71.667 / 11.667 = <strong>6.143</strong></td><td>w &gt; 0</td></tr>
    <tr><td>40</td><td>41.667</td><td>41.667 / 11.667 = <strong>3.571</strong></td><td>w &gt; 0</td></tr>
    <tr><td>80</td><td>1.667</td><td>1.667 / 11.667 = <strong>0.143</strong></td><td>w &gt; 0</td></tr>
    <tr><td>81.67</td><td>−0.003 → 0</td><td><strong>0</strong></td><td>corner</td></tr>
    <tr><td>90</td><td>−8.333 → 0</td><td><strong>0</strong></td><td>corner</td></tr>
  </table>
  <p>Check α = 90 the long way. Try w &gt; 0: w = (81.667 − 90)/11.667 = −0.71, which is not &gt; 0, contradiction. Try w &lt; 0: w = (81.667 + 90)/11.667 = 14.7, not &lt; 0, contradiction. Only the corner is left, and indeed |ρ| = 81.667 ≤ 90. So w = 0: at this fee, size is not worth including and the model predicts 61 lakh for every flat. The critical value is α = |ρ| = 81.667: above it the weight is dead. (In sklearn's scaling, the largest useful α for a whole dataset is α_max = maxⱼ |xⱼᵀy| / n; above it every weight is 0, and <code>LassoCV</code> starts its grid there.) Notice also that every surviving weight is the OLS weight minus α/s = α/11.667: lasso shifts weights down by a constant, it does not scale them.</p>
  <div class="fx" data-lang="py">def soft_threshold(rho, lam):
    return np.sign(rho) * max(abs(rho) - lam, 0.0)

n = 6
rho, s = (z @ yc) / n, (z @ z) / n                    # (1/n) sum dx*dy  and  (1/n) sum dx^2
print(f"rho = {rho:.3f}  s = {s:.3f}  OLS slope = rho/s = {rho / s:.3f}")
for a in [10, 40, 80, 81.67, 90]:
    hand = soft_threshold(rho, a) / s
    skl = Lasso(alpha=a).fit(size[:, None], price).coef_[0]
    print(f"alpha={a:&lt;6} hand w = S({rho:.3f}, {a}) / {s:.3f} = {hand:.3f}   sklearn {skl:.3f}")</div>
  <div class="fx" data-lang="text">rho = 81.667  s = 11.667  OLS slope = rho/s = 7.000
alpha=10     hand w = S(81.667, 10) / 11.667 = 6.143   sklearn 6.143
alpha=40     hand w = S(81.667, 40) / 11.667 = 3.571   sklearn 3.571
alpha=80     hand w = S(81.667, 80) / 11.667 = 0.143   sklearn 0.143
alpha=81.67  hand w = S(81.667, 81.67) / 11.667 = 0.000   sklearn 0.000
alpha=90     hand w = S(81.667, 90) / 11.667 = 0.000   sklearn 0.000</div>
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
  <div class="bridge"><b>What this still can't tell us → next: Coordinate descent.</b> One weight can be solved by hand. With size and bedrooms together, the two weights interact through their correlation. How does the computer actually find the lasso solution?</div>

  <h2 id="rl-cd"><span class="num">06</span>Coordinate Descent</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The 1-D formula needs "the data's push" ρ on a weight. With two correlated columns, size's push depends on how much bedrooms already explains, and vice versa. How do we untangle them without a closed form?</p>
  </div>
  <h3>The idea</h3>
  <p>We can solve lasso exactly for one weight if the others are held fixed: it is the 1-D problem again, with y replaced by "what the other features have not explained yet". So: cycle through the weights one at a time, solving each 1-D problem exactly, and repeat the sweep until nothing changes. Because the lasso loss is convex and the non-smooth part splits into separate |wⱼ| terms, this simple loop converges to the global minimum. It is what sklearn's <code>Lasso</code> and <code>ElasticNet</code> use.</p>
  <div class="flow"><span>Start w = 0</span><span>For feature j: residual without j</span><span>ρⱼ = (1/n)·xⱼ · residual</span><span>wⱼ = S(ρⱼ, α) / sⱼ</span><span>Next j; repeat sweeps until stable</span></div>
  <h3>Worked by hand: size and bedrooms</h3>
  <p>Centred size (x₁) and bedrooms (x₂), centred price, raw units. s₁ = (1/6)·70 = 11.667 and s₂ = (1/6)·5.5 = 0.917. The push on each weight uses the sums we know: with the other weight fixed, ρ₁ = (490 − 19·w₂)/6 and ρ₂ = (134 − 19·w₁)/6.</p>
  <table class="tbl out"><caption>Coordinate descent for lasso, α = 2</caption>
    <tr><th>step</th><th>ρ = (1/6)·x · residual</th><th>S(ρ, 2)</th><th>new weight</th><th>w after</th></tr>
    <tr><td>sweep 1, w_size</td><td>(490 − 0)/6 = 81.667</td><td>79.667</td><td>79.667 / 11.667 = 6.829</td><td>[6.829, 0]</td></tr>
    <tr><td>sweep 1, w_rooms</td><td>(134 − 19 × 6.829)/6 = 4.257/6 = 0.710</td><td>0 (|0.710| ≤ 2)</td><td>0</td><td>[6.829, 0]</td></tr>
    <tr><td>sweep 2</td><td>same numbers again</td><td></td><td></td><td>converged</td></tr>
  </table>
  <p>Once size has explained what it can, bedrooms' remaining push (0.71) is below the fee, so <strong>bedrooms is switched off</strong> and the model is price = 6.83 per 100 sq ft. Lasso picked one twin. Now a much smaller fee, α = 0.1:</p>
  <table class="tbl out"><caption>Coordinate descent for lasso, α = 0.1</caption>
    <tr><th>step</th><th>ρ</th><th>S(ρ, 0.1)</th><th>new weight</th><th>w after</th></tr>
    <tr><td>sweep 1, w_size</td><td>490/6 = 81.667</td><td>81.567</td><td>6.991</td><td>[6.991, 0]</td></tr>
    <tr><td>sweep 1, w_rooms</td><td>(134 − 19 × 6.991)/6 = 0.194</td><td>0.094</td><td>0.094 / 0.917 = 0.102</td><td>[6.991, 0.102]</td></tr>
    <tr><td>sweep 2, w_size</td><td>(490 − 19 × 0.102)/6 = 81.343</td><td>81.243</td><td>6.964</td><td>[6.964, 0.102]</td></tr>
    <tr><td>sweep 2, w_rooms</td><td>(134 − 19 × 6.964)/6 = 0.282</td><td>0.182</td><td>0.198</td><td>[6.964, 0.198]</td></tr>
    <tr><td>sweep 3, w_size</td><td>81.039</td><td>80.939</td><td>6.938</td><td>[6.938, 0.198]</td></tr>
    <tr><td>sweep 3, w_rooms</td><td>0.364</td><td>0.264</td><td>0.288</td><td>[6.938, 0.288]</td></tr>
  </table>
  <p>The weights creep, and slowly. Find the fixed point directly: at convergence w_size = (81.667 − 3.167w_rooms − 0.1)/11.667 and w_rooms = (22.333 − 3.167w_size − 0.1)/0.917. Substituting one into the other: <strong>w = [6.546, 1.642]</strong>. After three sweeps we are only at [6.938, 0.288]. Each sweep closes just 6% of the remaining gap, because size and bedrooms explain almost the same thing: every time one weight moves, it takes away most of the other's push. The fraction left after each sweep is r² = 361/385 = 0.938, the squared correlation.</p>
  <div class="fx" data-lang="py">def lasso_cd(X, y, alpha, sweeps=200, verbose=0):
    """Minimise (1/2n)||y - Xw||^2 + alpha*||w||_1 by cyclic coordinate descent."""
    n, p = X.shape
    w = np.zeros(p)
    zz = (X ** 2).sum(0) / n                          # (1/n) sum x_j^2 for each column
    for sweep in range(1, sweeps + 1):
        for j in range(p):
            r_j = y - X @ w + X[:, j] * w[j]          # residual ignoring feature j
            rho_j = X[:, j] @ r_j / n                 # how much j could still explain
            w[j] = soft_threshold(rho_j, alpha) / zz[j]
            if sweep &lt;= verbose:
                print(f"  sweep {sweep}, w{j+1}: rho={rho_j:.4f} -&gt; w = {np.round(w, 4)}")
    return w

for a, sw, show in [(2, 200, 2), (0.1, 200, 3)]:
    print(f"alpha = {a}")
    w = lasso_cd(Xc, yc, a, sweeps=sw, verbose=show)
    print(f"  after {sw} sweeps: {w.round(4)}   sklearn: {Lasso(alpha=a, fit_intercept=False, max_iter=100_000, tol=1e-10).fit(Xc, yc).coef_.round(4)}")</div>
  <div class="fx" data-lang="text">alpha = 2
  sweep 1, w1: rho=81.6667 -&gt; w = [6.8286 0.    ]
  sweep 1, w2: rho=0.7095 -&gt; w = [6.8286 0.    ]
  sweep 2, w1: rho=81.6667 -&gt; w = [6.8286 0.    ]
  sweep 2, w2: rho=0.7095 -&gt; w = [6.8286 0.    ]
  after 200 sweeps: [6.8286 0.    ]   sklearn: [6.8286 0.    ]
alpha = 0.1
  sweep 1, w1: rho=81.6667 -&gt; w = [6.9914 0.    ]
  sweep 1, w2: rho=0.1938 -&gt; w = [6.9914 0.1023]
  sweep 2, w1: rho=81.3426 -&gt; w = [6.9637 0.1023]
  sweep 2, w2: rho=0.2818 -&gt; w = [6.9637 0.1983]
  sweep 3, w1: rho=81.0387 -&gt; w = [6.9376 0.1983]
  sweep 3, w2: rho=0.3642 -&gt; w = [6.9376 0.2883]
  after 200 sweeps: [6.5458 1.6417]   sklearn: [6.5458 1.6417]</div>
  <p>Every printed ρ and weight matches the hand tables, and after 200 sweeps both versions reach sklearn's answer. sklearn stops when the <em>duality gap</em> (a certificate of how far from optimal it is) falls below <code>tol</code>, not after a fixed number of sweeps; we set a tight <code>tol</code> so the two agree to four decimals.</p>
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
    <p>With very correlated features, coordinate descent can take many sweeps (each update undoes part of the previous one; 94% of the gap survived each sweep for size and bedrooms) and may stop early with a warning. The answer is then near-optimal in loss but the split between twins can be off. Standardise, increase <code>max_iter</code>, and do not read meaning into the exact split.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Elastic net.</b> Lasso selects, ridge stabilises. What if correlated features should be kept <em>together</em> but useless ones still dropped? Mix the two penalties.</div>

  <h2 id="rl-enet"><span class="num">07</span>Elastic Net</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>At α = 2 lasso dropped bedrooms entirely and gave all the credit to size, an arbitrary choice between twins. Can one penalty produce zeros for useless columns but still share credit among correlated useful ones?</p>
  </div>
  <h3>The objective</h3>
  <p>Elastic net (Zou &amp; Hastie, 2005) adds both penalties. sklearn's form, with r = <code>l1_ratio</code>:</p>
  <p style="text-align:center"><strong>(1/2n)·||y − Xw||² + α·r·||w||₁ + α·(1 − r)/2·||w||²</strong></p>
  <p>α is the total strength; r is the mix. r = 1 is lasso; r = 0 is ridge (on sklearn's 1/(2n) scale); values in between give sparse solutions that also treat correlated features as a group.</p>
  <h3>Deriving the 1-D solution</h3>
  <p>Same setup as lasso. For w &gt; 0 the derivative is −ρ + s·w + αr + α(1 − r)·w = 0, so w = (ρ − αr) / (s + α(1 − r)). The other cases follow as before, giving</p>
  <p style="text-align:center"><strong>w = S(ρ, α·r) / (s + α·(1 − r))</strong></p>
  <p>In words: <em>subtract</em> (the L1 part, which can make it 0), then <em>divide</em> (the L2 part, extra shrinkage). Both behaviours in one line.</p>
  <h3>Worked by hand: price on size again</h3>
  <p>ρ = 81.667, s = 11.667. With α = 10, r = 0.5: subtract αr = 5 → 76.667; divide by s + α(1 − r) = 11.667 + 5 = 16.667 → <strong>4.600</strong>. Pure lasso at the same α gave 6.143, so the L2 part shrank it further. With α = 40, r = 0.5: (81.667 − 20) / (11.667 + 20) = 61.667 / 31.667 = <strong>1.947</strong>. With r almost 0: 81.667 / (11.667 + 10) = <strong>3.769</strong>, a ridge answer. Check: sklearn's <code>Ridge</code> (no 1/n) gives 490 / (70 + λ); 490 / (70 + 60) = 3.769 needs λ = 60 = n·α. That is the scale difference warned about in section 02.</p>
  <div class="fx" data-lang="py">print("alpha  l1_ratio  hand w = S(rho, a*r) / (s + a*(1-r))   sklearn")
for a, r in [(10, 1.0), (10, 0.5), (10, 0.0001), (40, 0.5)]:
    hand = max(rho - a * r, 0) / (s + a * (1 - r))
    skl = ElasticNet(alpha=a, l1_ratio=r, max_iter=100_000).fit(size[:, None], price).coef_[0]
    print(f"{a:&gt;5}  {r:&lt;8}  {hand:.3f}                                {skl:.3f}")
print("Ridge(alpha=60) on size:", Ridge(alpha=60).fit(size[:, None], price).coef_.round(3), " = 490 / (70 + 60) =", round(490 / 130, 3))</div>
  <div class="fx" data-lang="text">alpha  l1_ratio  hand w = S(rho, a*r) / (s + a*(1-r))   sklearn
   10  1.0       6.143                                6.143
   10  0.5       4.600                                4.600
   10  0.0001    3.769                                3.769
   40  0.5       1.947                                1.947
Ridge(alpha=60) on size: [3.769]  = 490 / (70 + 60) = 3.769</div>
  <h3>Why the mix helps</h3>
  <table class="tbl">
    <tr><th>Lasso's weakness</th><th>How the L2 part fixes it</th></tr>
    <tr><td>From a group of correlated features it keeps one, arbitrarily (size kept, bedrooms dropped)</td><td>The squared penalty is cheapest when weight is spread evenly (1² + 1² = 2 &lt; 2² + 0² = 4), so correlated features enter and leave together (the "grouping effect")</td></tr>
    <tr><td>When p &gt; n it can keep at most n features</td><td>Elastic net can keep more than n</td></tr>
    <tr><td>Selection jumps around between bootstrap samples</td><td>The strictly convex L2 part makes the solution unique and more stable</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Elastic net</strong>: ŵ = argmin (1/2n)||y − Xw||² + αr||w||₁ + α(1 − r)/2·||w||₂², 0 ≤ r ≤ 1. Strictly convex for r &lt; 1 (unique solution), sparse for r &gt; 0. Typical grids: r ∈ {0.1, 0.5, 0.7, 0.9, 0.95, 0.99, 1}, with α chosen per r by CV.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>l1_ratio</code> close to 0 makes coordinate descent slow and unreliable; sklearn's documentation says values ≤ 0.01 are not reliable and points to <code>Ridge</code> for pure L2. Also, the elastic net shrinks twice (once per penalty). Zou &amp; Hastie suggested rescaling the weights by (1 + λ₂) to undo the double shrinkage; sklearn returns the un-rescaled ("naive") version, so its kept weights look smaller than lasso's at a similar sparsity.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Correlated features.</b> We have claimed that ridge shares weight between correlated features and lasso picks one. Time to see all four models side by side on size and bedrooms, then at scale.</div>

  <h2 id="rl-corr"><span class="num">08</span>Correlated Features: Ridge Shares, Lasso Picks One</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Size and bedrooms carry overlapping information. Who should get the credit, and how do OLS, ridge, lasso and elastic net each answer when we compare them fairly (on standardised columns) and check how stable each answer is?</p>
  </div>
  <h3>By hand: exact copies</h3>
  <p>Back to the duplicated size column from section 01. <strong>Ridge</strong>: the loss treats w₁ and w₂ symmetrically (swapping them changes nothing) and has a single minimum (strictly convex), so the minimum must have w₁ = w₂. We computed 3.475 each. For any w₁ + w₂ = c the fit is the same, and w₁² + w₂² is smallest when they are equal (3.5² + 3.5² = 24.5 vs 7² + 0² = 49): ridge spreads weight evenly. <strong>Lasso</strong>: for any split with the same sign, |w₁| + |w₂| = |c| is the same (|3.5| + |3.5| = |7| + |0| = 7), so every split is equally good. The solver just returns one of them; cyclic coordinate descent hands everything to whichever copy it updates first.</p>
  <h3>Near-twins: size and bedrooms, side by side</h3>
  <p>Now the four models on the six houses, with both columns standardised (mean 0, SD 1, section 09 explains why), so each weight means "lakh per one standard deviation". To see stability, each model is also refitted six times, leaving one house out each time.</p>
  <div class="fx" data-lang="py">from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
models = {"OLS": LinearRegression(), "Ridge a=1": Ridge(alpha=1), "Lasso a=2": Lasso(alpha=2),
          "ENet a=2 r=.5": ElasticNet(alpha=2, l1_ratio=0.5)}
print("weights per 1 SD of size and rooms (standardised):")
for name, m in models.items():
    rows = [make_pipeline(StandardScaler(), m).fit(X2, price)[-1].coef_]
    for i in range(6):                                  # leave one house out
        keep = np.arange(6) != i
        rows.append(make_pipeline(StandardScaler(), m).fit(X2[keep], price[keep])[-1].coef_)
    rows = np.array(rows)
    print(f"{name:14s} all six {np.array2string(rows[0].round(1), separator=', '):14s}"
          f"  without one house: size {rows[1:, 0].min():5.1f}..{rows[1:, 0].max():5.1f}, rooms {rows[1:, 1].min():5.1f}..{rows[1:, 1].max():5.1f}")</div>
  <div class="fx" data-lang="text">weights per 1 SD of size and rooms (standardised):
OLS            all six [21.2,  2.8]    without one house: size  16.9.. 26.4, rooms  -1.7..  5.7
Ridge a=1      all six [12.5,  9.6]    without one house: size  10.3.. 13.0, rooms   6.1.. 11.0
Lasso a=2      all six [20.2,  1.7]    without one house: size  15.9.. 22.7, rooms   0.0..  4.6
ENet a=2 r=.5  all six [7.9, 7.3]      without one house: size   6.1..  8.6, rooms   5.1..  8.2</div>
  <p>OLS gives size 21.2 and bedrooms 2.8 per SD, but leaving out one house moves bedrooms anywhere from −1.7 to 5.7. <strong>Ridge</strong> (α = 1) shares the credit (12.5 and 9.6: "bigger, roomier flats cost more", split nearly evenly) and the leave-one-out ranges are narrow (size 10.3–13.0). <strong>Lasso</strong> (α = 2) gives most of the credit to size (20.2) and little to bedrooms (1.7); in some leave-one-out fits bedrooms is exactly 0. <strong>Elastic net</strong> shares like ridge (7.9, 7.3) and, at this strong α, shrinks both. Every model's predictions are similar; what changes is the explanation.</p>
  <h3>The same idea at scale: two temperature sensors</h3>
  <p>Sensor B is sensor A plus tiny noise (correlation 0.9999); the target depends on the true temperature with total effect 3 per degree. Each model is refit on three bootstrap resamples of 100 days to see how stable the weights are.</p>
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
  <h3>The same idea on real data: the diabetes dataset</h3>
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
    <p>Correlated features share credit. OLS shares it erratically, ridge shares it evenly, lasso gives it to one, elastic net shares it among a few. None of them can tell you which twin is "the real cause" (is it the floor area or the bedroom count that buyers pay for?): that is a question for domain knowledge or experiments, not for a penalty.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Lasso set bedrooms (or s2) to zero, so it does not matter" is wrong. Bedrooms carries almost the same information as size; lasso only needed one of them. Drop size and lasso would happily use bedrooms. Check selection stability over resamples (stability selection) before claiming a feature is irrelevant.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The standardization requirement.</b> Every comparison above standardised the columns first, while the hand calculations used size in hundreds of sq ft and rooms as a count. Is standardising a habit or a requirement?</div>

  <h2 id="rl-std"><span class="num">09</span>The Standardization Requirement</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>OLS gives the same predictions whether size is in square feet or hundreds of square feet; only the weight's number changes (7 vs 0.07). Is that still true once a penalty charges for the size of that number?</p>
  </div>
  <h3>By hand: units change the penalty</h3>
  <p>Size in hundreds of sq ft has OLS weight 7; the same size in sq ft has weight 0.07. Same information, same predictions. But the penalty sees only the number: ridge charges 7² = 49 in one case and 0.07² = 0.0049 in the other; lasso charges 7 versus 0.07. Purely because of units, the penalty is 10,000 (L2) or 100 (L1) times larger for the hundreds-of-sq-ft version. By hand for ridge with λ = 70, one feature, w = Σxy / (Σx² + λ):</p>
  <ul>
    <li>Size in hundreds of sq ft: Σxy = 490, Σx² = 70 → w = 490 / (70 + 70) = <strong>3.5</strong> lakh per 100 sq ft: halved.</li>
    <li>Size in sq ft: every x is 100 times larger, so Σxy = 49,000 and Σx² = 700,000 → w = 49,000 / 700,070 = 0.069993 per sq ft = <strong>6.999</strong> per 100 sq ft: untouched.</li>
  </ul>
  <p>The same λ, the same data, a completely different model. Lasso (α = 10) does the same, more gently: 6.143 vs 6.991 per 100 sq ft.</p>
  <div class="fx" data-lang="py">for unit, col in [("size in 100 sq ft", size), ("size in sq ft", size * 100)]:
    las = Lasso(alpha=10).fit(col[:, None], price).coef_[0]
    rid = Ridge(alpha=70).fit(col[:, None], price).coef_[0]
    per100 = 1 if unit.endswith("100 sq ft") else 100
    print(f"{unit:18s} lasso(10) w = {las:.5f} -&gt; per 100 sq ft {las * per100:.3f}   ridge(70) w = {rid:.5f} -&gt; per 100 sq ft {rid * per100:.3f}")
std = make_pipeline(StandardScaler(), Lasso(alpha=10))
print("standardised first: per-SD weight", round(std.fit(size[:, None], price)[-1].coef_[0], 3),
      "(sq ft:", round(std.fit(100 * size[:, None], price)[-1].coef_[0], 3), ")")</div>
  <div class="fx" data-lang="text">size in 100 sq ft  lasso(10) w = 6.14286 -&gt; per 100 sq ft 6.143   ridge(70) w = 3.50000 -&gt; per 100 sq ft 3.500
size in sq ft      lasso(10) w = 0.06991 -&gt; per 100 sq ft 6.991   ridge(70) w = 0.06999 -&gt; per 100 sq ft 6.999
standardised first: per-SD weight 13.91 (sq ft: 13.91 )</div>
  <p>With a <code>StandardScaler</code> first, both unit choices give exactly the same model (13.91 lakh per standard deviation of size): standardising puts every column on a common scale (mean 0, standard deviation 1), so the penalty compares like with like. The same idea at scale, with income in lakh vs crore in a 200-person spending model:</p>
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
  <p>In lakh, lasso's income weight is 1.978 (truth 2, barely shrunk). In crore it is 47.844, which is 0.478 per lakh: shrunk by 76%, because the large weight paid a large fee. Standardised, both versions are identical (15.166 per SD).</p>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Standardise for ridge / lasso / elastic net?</td><td>Yes, always (unless all columns already share a meaningful unit)</td></tr>
    <tr><td>Where?</td><td>Inside a <code>Pipeline</code>, so each CV fold computes its own mean and std (no leakage: <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>)</td></tr>
    <tr><td>The target y?</td><td>Not required; the intercept absorbs its mean</td></tr>
    <tr><td>One-hot dummies (locality)?</td><td>Debated: scaling them makes rare categories' weights cheaper to use. Common practice: standardise everything for simplicity, or leave dummies as 0/1 and accept the penalty favours common levels</td></tr>
    <tr><td>Reading coefficients after scaling</td><td>"Effect of one standard deviation"; divide by the column's std to get per-unit effects (13.91 / 3.42 = 4.07 lakh per 100 sq ft)</td></tr>
    <tr><td>Trees, boosting?</td><td>No need; they are scale-free (<a class="xref" data-note="ml_dtree">Decision Trees</a>)</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>A model is <strong>scale-equivariant</strong> if rescaling a column by c just rescales its weight by 1/c and leaves predictions unchanged. OLS is; ridge, lasso and elastic net are not, because their penalties depend on the size of the weights. Standardising (z = (x − mean)/std) restores a fair comparison.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Fitting the scaler on all rows before cross-validation leaks validation-fold information into training and makes the CV score slightly optimistic. Put the scaler and the model in one pipeline and cross-validate the pipeline. sklearn removed the old <code>normalize=True</code> option from these models (version 1.2) and asks you to use a <code>StandardScaler</code> in a pipeline instead.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Choosing α by cross-validation.</b> Everything depends on α, and we have been picking it by hand (1, 2, 5, 10). How do we pick it properly?</div>

  <h2 id="rl-alpha"><span class="num">10</span>Choosing α by Cross-Validation</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>λ = 5 gave stable house weights and α = 2 dropped bedrooms, but those were our choices. Training error always prefers no penalty at all. What objective procedure picks the penalty strength?</p>
  </div>
  <h3>The idea</h3>
  <p>α is a hyperparameter: too small and we are back to OLS's variance, too large and every weight is crushed (bias). The training error always prefers α = 0, so we choose α by cross-validation: try a grid of values (on a log scale, since α can sensibly range over many orders of magnitude), score each with k-fold CV on the training data, keep the best. sklearn has estimators that do this internally and efficiently:</p>
  <table class="tbl">
    <tr><th>Estimator</th><th>How it searches</th><th>After fit</th></tr>
    <tr><td><code>RidgeCV(alphas=...)</code></td><td>Default: exact leave-one-out CV computed in one shot from one decomposition of X (the LOO residual is eᵢ / (1 − hᵢᵢ), where hᵢᵢ is the row's leverage under the ridge hat matrix, the same shortcut the polynomial note used). Or pass <code>cv=5</code></td><td><code>alpha_</code>, <code>best_score_</code></td></tr>
    <tr><td><code>LassoCV(cv=...)</code></td><td>Builds a grid of 100 α's from α_max (all weights 0) down to α_max/1000, fits the whole path per fold with warm starts</td><td><code>alpha_</code>, <code>alphas_</code>, <code>mse_path_</code> (α × folds)</td></tr>
    <tr><td><code>ElasticNetCV(l1_ratio=[...], cv=...)</code></td><td>Same, for each r in the list</td><td><code>alpha_</code>, <code>l1_ratio_</code>, <code>mse_path_</code></td></tr>
    <tr><td><code>LassoLarsIC(criterion='bic')</code></td><td>No CV: picks α by AIC/BIC along the LARS path; fast, assumes n &gt; p</td><td><code>alpha_</code></td></tr>
    <tr><td><code>GridSearchCV(pipe, {'ridge__alpha': ...})</code></td><td>Generic; needed when α must be tuned together with other steps (polynomial degree, etc.)</td><td><code>best_params_</code></td></tr>
  </table>
  <h3>On the six houses</h3>
  <div class="fx" data-lang="py">from sklearn.linear_model import RidgeCV, LassoCV
from sklearn.model_selection import LeaveOneOut
rcv = make_pipeline(StandardScaler(), RidgeCV(alphas=np.logspace(-3, 3, 61))).fit(X2, price)[-1]
print(f"RidgeCV (leave-one-out) alpha_ = {rcv.alpha_:.3f}  weights {rcv.coef_.round(2)}")
lcv = make_pipeline(StandardScaler(), LassoCV(cv=LeaveOneOut(), n_jobs=1)).fit(X2, price)[-1]
print(f"LassoCV (leave-one-out) alpha_ = {lcv.alpha_:.3f}  weights {lcv.coef_.round(2)}")</div>
  <div class="fx" data-lang="text">RidgeCV (leave-one-out) alpha_ = 0.079  weights [18.41  5.43]
LassoCV (leave-one-out) alpha_ = 0.137  weights [21.17  2.69]</div>
  <p>Leave-one-out CV on six houses picks small penalties (ridge α = 0.08, lasso α = 0.14), close to OLS. That is an honest answer: with six rows, CV cannot measure the variance reduction well enough to justify heavy shrinkage, and every left-out end house (A or F) forces an extrapolation that dominates the score. Penalties earn their keep when columns are many relative to rows, which the next two experiments show at scale.</p>
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
  <div class="bridge"><b>What this still can't tell us → next: Coefficient path plots.</b> One α gives one model. A path shows all α's at once and tells you which features are strong, which enter late, and where the twins trade places.</div>

  <h2 id="rl-path"><span class="num">11</span>Coefficient Path Plots</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We have looked at a handful of α values one at a time. What does the whole story look like as α slides from "everything zero" to "plain OLS", and what can that picture tell us that a single fit cannot?</p>
  </div>
  <p>A coefficient path plots every weight (y-axis) against α (x-axis, log scale). By convention α decreases to the right, so the model starts empty (or tiny) on the left and grows to OLS on the right. <code>lasso_path</code> computes the lasso path efficiently; for ridge we simply refit at each α. First the six houses, standardised:</p>
  <div class="fx" data-lang="py">from sklearn.linear_model import lasso_path
Zs = StandardScaler().fit_transform(X2); yc6 = price - price.mean()
print("alpha_max = max|x_j . y| / n =", np.round(np.abs(Zs.T @ yc6) / 6, 3), "-&gt; size enters first")
alphas, coefs, _ = lasso_path(Zs, yc6, alphas=[30, 20, 10, 5.4, 5, 2, 0.5, 0.01])
for a, c in zip(alphas, coefs.T):
    r = Ridge(alpha=a).fit(Zs, yc6).coef_
    print(f"alpha {a:5}: lasso size {c[0]:6.2f} rooms {c[1]:5.2f}   |  ridge size {r[0]:6.2f} rooms {r[1]:5.2f}")</div>
  <div class="fx" data-lang="text">alpha_max = max|x_j . y| / n = [23.91  23.326] -&gt; size enters first
alpha  30.0: lasso size   0.00 rooms  0.00   |  ridge size   3.45 rooms  3.33
alpha  20.0: lasso size   3.91 rooms  0.00   |  ridge size   4.54 rooms  4.37
alpha  10.0: lasso size  13.91 rooms  0.00   |  ridge size   6.67 rooms  6.33
alpha   5.4: lasso size  18.49 rooms  0.02   |  ridge size   8.55 rooms  7.92
alpha   5.0: lasso size  18.69 rooms  0.23   |  ridge size   8.77 rooms  8.09
alpha   2.0: lasso size  20.22 rooms  1.75   |  ridge size  11.06 rooms  9.46
alpha   0.5: lasso size  20.98 rooms  2.51   |  ridge size  14.05 rooms  8.98
alpha  0.01: lasso size  21.23 rooms  2.76   |  ridge size  20.74 rooms  3.24</div>
  <p>By hand, the entry point of each feature is its push with all weights at 0: α_max = |xⱼᵀy|/n = 23.91 for size and 23.33 for bedrooms (they are almost equally correlated with price). Size enters first, at α = 23.91. Once size is in, bedrooms' remaining push is tiny, so it waits until α ≈ 5.4, and even at α = 0.01 lasso's weights (21.2, 2.8) are essentially OLS's. Ridge instead brings both in from the start, almost equal (3.45 and 3.33 at α = 30), and lets them separate only as α falls: at α = 0.01 it is close to OLS too (20.7, 3.2). The same idea at scale, on the 10 diabetes features:</p>
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
    <tr><th>What you see</th><th>What it means</th><th>Houses / diabetes</th></tr>
    <tr><td>Early entry (left)</td><td>Strong, unique signal: worth paying a large fee for</td><td>size (α = 23.9); bmi (43.5) and s5 (41.5)</td></tr>
    <tr><td>Late entry (right)</td><td>Weak or redundant given the others</td><td>bedrooms (5.4); s2 (0.3), age (0.2)</td></tr>
    <tr><td>Two lines diverging in opposite directions near α → 0</td><td>Correlated pair; OLS's split is unstable</td><td>s1 → −37.6, s2 → +22.6</td></tr>
    <tr><td>Sign change along the path</td><td>The effect depends on which other variables are in; do not trust the sign alone</td><td>ridge s1: +1.1 at α = 1000, −37.6 at α = 0.01</td></tr>
    <tr><td>Flat plateau</td><td>That α range does not change the model much; CV score also flat</td><td>lasso α 1–3: 7 features, small changes</td></tr>
  </table>
  <p>The lasso path is <strong>piecewise linear</strong>: between the α's where some feature enters or leaves, every non-zero weight changes linearly in α (which is what LARS exploits; size alone grows by exactly 1 per unit drop in α between 20 and 10: 3.91 → 13.91). A feature can also <em>leave</em> the lasso path after entering, when a correlated feature takes over its role.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Path plots are only comparable across features if the columns were standardised; otherwise a line's height mostly reflects its units. And entry order is a statement about this dataset's correlations, not a ranking of causal importance (size entered before bedrooms by a margin of 23.91 vs 23.33).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: scikit-learn in practice and variants.</b> The concepts are complete. What remains is the practical toolbox: every sklearn parameter, and the related models you will meet.</div>

  <h2 id="rl-sklearn"><span class="num">12</span>scikit-learn in Practice and Variants</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which sklearn knobs matter for these three models, and which related models (adaptive, relaxed and group lasso, kernel ridge, penalised logistic regression) are built from the same pieces?</p>
  </div>
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
    <tr><td>Group lasso</td><td>Penalise groups (e.g. all dummies of one category, or all spline columns of one input) so they enter or leave together</td><td>Categorical features (locality), spline bases</td></tr>
    <tr><td>Best subset / stepwise</td><td>Choose k features by search (hard threshold)</td><td>Small p; lasso is the convex relaxation of best subset</td></tr>
    <tr><td>Principal component regression</td><td>Keep the top principal directions, drop the rest (shrink factor 1 or 0)</td><td>Compare: ridge shrinks directions smoothly (0.938 and 0.060 on the houses)</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>p-values and confidence intervals from ordinary OLS formulas are not valid for ridge or lasso coefficients, and are not valid for an OLS refit on lasso-selected features either (the selection used the same data). If you need inference after selection, use sample splitting (select on one half, fit and test on the other) or dedicated post-selection inference methods.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How it all connects.</b> We have three penalties, two solvers, a scaling rule and a tuning method. How do they hang together?</div>

  <h2 id="rl-connect"><span class="num">13</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Ridge, lasso, elastic net, eigen-directions, soft-thresholding, coordinate descent, standardisation, cross-validation and paths: a toolbox of separate tricks, or one idea with a few consequences?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 360" width="680">
<defs><marker id="rl-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="240" y="8" width="200" height="40" rx="7" class="fb sb"/><text x="340" y="26" text-anchor="middle" font-size="11.5" font-weight="700">OLS loss ||y − Xw||²</text><text x="340" y="41" text-anchor="middle" class="tm" font-size="10">no preference among weights</text>
<line x1="280" y1="48" x2="110" y2="78" stroke="currentColor" marker-end="url(#rl-a9)"/><line x1="340" y1="48" x2="340" y2="78" stroke="currentColor" marker-end="url(#rl-a9)"/><line x1="400" y1="48" x2="570" y2="78" stroke="currentColor" marker-end="url(#rl-a9)"/>
<rect x="10" y="80" width="200" height="40" rx="7" class="fr sr"/><text x="110" y="98" text-anchor="middle" font-size="11" font-weight="700">duplicate column</text><text x="110" y="113" text-anchor="middle" class="tm" font-size="10">[[70, 70], [70, 70]], det 0</text>
<rect x="240" y="80" width="200" height="40" rx="7" class="fr sr"/><text x="340" y="98" text-anchor="middle" font-size="11" font-weight="700">near-twins (r 0.968)</text><text x="340" y="113" text-anchor="middle" class="tm" font-size="10">rooms −1.67 … 5.58 by house</text>
<rect x="470" y="80" width="200" height="40" rx="7" class="fr sr"/><text x="570" y="98" text-anchor="middle" font-size="11" font-weight="700">many / useless columns</text><text x="570" y="113" text-anchor="middle" class="tm" font-size="10">200 noise: test R² −0.26</text>
<line x1="110" y1="120" x2="110" y2="150" stroke="currentColor" marker-end="url(#rl-a9)"/><line x1="340" y1="120" x2="340" y2="150" stroke="currentColor" marker-end="url(#rl-a9)"/><line x1="570" y1="120" x2="570" y2="150" stroke="currentColor" marker-end="url(#rl-a9)"/>
<text x="350" y="142" class="tm" font-size="10">+ a price on weights</text>
<rect x="10" y="152" width="200" height="44" rx="7" class="ft st"/><text x="110" y="171" text-anchor="middle" font-size="11.5" font-weight="700">ridge: + λΣw²</text><text x="110" y="187" text-anchor="middle" class="tm" font-size="10">(XᵀX + λI)⁻¹Xᵀy: [6.09, 1.74]</text>
<rect x="240" y="152" width="200" height="44" rx="7" class="ft st"/><text x="340" y="171" text-anchor="middle" font-size="11.5" font-weight="700">elastic net: both</text><text x="340" y="187" text-anchor="middle" class="tm" font-size="10">S(ρ, αr)/(s + α(1 − r)): 4.60</text>
<rect x="470" y="152" width="200" height="44" rx="7" class="ft st"/><text x="570" y="171" text-anchor="middle" font-size="11.5" font-weight="700">lasso: + αΣ|w|</text><text x="570" y="187" text-anchor="middle" class="tm" font-size="10">S(ρ, α)/s: 6.14; 0 if α ≥ 81.67</text>
<line x1="110" y1="196" x2="110" y2="226" stroke="currentColor" marker-end="url(#rl-a9)"/><line x1="340" y1="196" x2="340" y2="226" stroke="currentColor" marker-end="url(#rl-a9)"/><line x1="570" y1="196" x2="570" y2="226" stroke="currentColor" marker-end="url(#rl-a9)"/>
<rect x="10" y="228" width="200" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="110" y="247" text-anchor="middle" font-size="11" font-weight="700">divides each direction</text><text x="110" y="263" text-anchor="middle" class="tm" font-size="10">keep 0.938 and 0.060; df 1.0</text>
<rect x="240" y="228" width="200" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="340" y="247" text-anchor="middle" font-size="11" font-weight="700">zeros + grouping</text><text x="340" y="263" text-anchor="middle" class="tm" font-size="10">shares size and rooms (7.9, 7.3)</text>
<rect x="470" y="228" width="200" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="570" y="247" text-anchor="middle" font-size="11" font-weight="700">subtracts → exact zeros</text><text x="570" y="263" text-anchor="middle" class="tm" font-size="10">CD: [6.83, 0] at α = 2</text>
<line x1="110" y1="272" x2="200" y2="300" stroke="currentColor" marker-end="url(#rl-a9)"/><line x1="340" y1="272" x2="340" y2="300" stroke="currentColor" marker-end="url(#rl-a9)"/><line x1="570" y1="272" x2="480" y2="300" stroke="currentColor" marker-end="url(#rl-a9)"/>
<rect x="60" y="302" width="180" height="44" rx="7" class="fg sg"/><text x="150" y="321" text-anchor="middle" font-size="11" font-weight="700">standardise first</text><text x="150" y="337" text-anchor="middle" class="tm" font-size="10">Ridge(70): 3.5 vs 7.0</text>
<rect x="250" y="302" width="180" height="44" rx="7" class="fg sg"/><text x="340" y="321" text-anchor="middle" font-size="11" font-weight="700">choose α by CV</text><text x="340" y="337" text-anchor="middle" class="tm" font-size="10">1-SE: 10 → 4 features</text>
<rect x="440" y="302" width="180" height="44" rx="7" class="fg sg"/><text x="530" y="321" text-anchor="middle" font-size="11" font-weight="700">read the path</text><text x="530" y="337" text-anchor="middle" class="tm" font-size="10">size at α 23.9, rooms 5.4</text>
</svg><figcaption>One idea, three penalties. OLS has no preference among weights, so duplicates, near-twins and useless columns break it. Adding a price on weights fixes all three: the squared price divides (ridge), the absolute price subtracts and can reach zero (lasso), the mix does both (elastic net). Because a price on a number depends on its units, standardise; because the price's size is a choice, cross-validate; the path shows every choice at once.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the same six houses</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers</th><th>Our houses</th><th>Use when</th></tr>
    <tr><td>Ill-conditioning</td><td>det(XᵀX), VIF</td><td>why are OLS weights unstable?</td><td>det 24 of 385; rooms −1.67 … 5.58</td><td>diagnosing</td></tr>
    <tr><td>Ridge closed form</td><td>OLS + λI on the diagonal</td><td>unique, stable weights?</td><td>λ = 5: [6.094, 1.735]</td><td>many small effects, collinearity</td></tr>
    <tr><td>Eigen-shrinkage</td><td>d²/(d² + λ)</td><td>what does ridge distrust?</td><td>0.938 (size + rooms), 0.060 (rooms vs size)</td><td>explaining ridge</td></tr>
    <tr><td>Effective df</td><td>Σ d²/(d² + λ)</td><td>how flexible is the model?</td><td>0.998 at λ = 5</td><td>comparing with OLS</td></tr>
    <tr><td>Unpenalised intercept</td><td>b₀ = ȳ − x̄ᵀw</td><td>where does b₀ come from?</td><td>−10.37 at λ = 5</td><td>always</td></tr>
    <tr><td>Soft-threshold</td><td>S(ρ, α)/s</td><td>when is a weight exactly 0?</td><td>size: 6.14 (α 10), 0 once α ≥ 81.67</td><td>reasoning about lasso</td></tr>
    <tr><td>Coordinate descent</td><td>one soft-threshold per weight, repeated</td><td>how to solve lasso?</td><td>α = 2: [6.83, 0]; α = 0.1 → [6.55, 1.64], 6% per sweep</td><td>lasso / ENet fitting</td></tr>
    <tr><td>Elastic net</td><td>subtract then divide</td><td>zeros and grouping?</td><td>4.60 at α = 10, r = 0.5</td><td>correlated useful groups</td></tr>
    <tr><td>Correlated features</td><td>symmetry of the penalty</td><td>who gets credit?</td><td>ridge [12.5, 9.6], lasso [20.2, 1.7]</td><td>interpreting weights</td></tr>
    <tr><td>Standardisation</td><td>z = (x − mean)/sd</td><td>do units matter?</td><td>Ridge(70): 3.5 vs 7.0 per 100 sq ft</td><td>always before a penalty</td></tr>
    <tr><td>CV for α</td><td>LOO / k-fold error per α</td><td>how strong a penalty?</td><td>LOO: ridge 0.08, lasso 0.14</td><td>always</td></tr>
    <tr><td>Path</td><td>solutions over an α grid</td><td>what happens for every α?</td><td>size enters at 23.9, rooms at 5.4</td><td>feature ranking, debugging</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>add a price on the size of the weights, and the model must earn every weight; a squared price shrinks every weight smoothly (ridge), an absolute price can set weights to exactly zero (lasso), and a mix does both (elastic net).</strong> Everything else follows from that price: it needs comparable units (standardise), its size must be chosen honestly (CV), and following it from high to low shows the whole family of models (the path).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Comparison.</b> A single table to decide between OLS, ridge, lasso and elastic net.</div>

  <h2 id="rl-compare"><span class="num">14</span>Comparison</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Faced with a new dataset, which of the four models should you start with, and what will each do differently?</p>
  </div>
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
    <tr><td>Six houses (standardised)</td><td>[21.2, 2.8], unstable</td><td>α 1: [12.5, 9.6]</td><td>α 2: [20.2, 1.7]</td><td>α 2, r 0.5: [7.9, 7.3]</td></tr>
    <tr><td>Diabetes + 200 noise test R²</td><td>−0.258</td><td>0.366</td><td>0.485 (6 kept)</td><td>0.485 (chose r = 1)</td></tr>
  </table>
  <p>Relation to neighbours: <a class="xref" data-note="ml_regularization">Regularization</a> is the general principle (penalties, early stopping, dropout, pruning); <a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a> is the most common reason you suddenly have too many columns; <a class="xref" data-note="ml_dimred">feature selection</a> offers non-penalty alternatives (filters, RFE); <a class="xref" data-note="ml_pca">PCA</a> regression keeps or drops whole directions, where ridge shrinks them smoothly.</p>
  <div class="bridge"><b>What this still can't tell us → next: Common mistakes.</b> The classic ways these models are misused.</div>

  <h2 id="rl-traps"><span class="num">15</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which errors with penalised models show up most in interviews and production code?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: not standardising</span>
    <p>Penalties depend on units: Ridge(70) halved the size weight in hundreds of sq ft and left it untouched in sq ft; income in crore was shrunk 76%, in lakh 1%. Put <code>StandardScaler</code> and the model in one <code>Pipeline</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: scaling outside cross-validation</span>
    <p>Fitting the scaler (or <code>PolynomialFeatures</code> knots, imputers…) on all rows before CV leaks information. Cross-validate the whole pipeline; tune with <code>step__alpha</code> names.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: copying α between estimators</span>
    <p><code>Ridge</code> has no 1/n, <code>Lasso</code>/<code>ElasticNet</code> have 1/(2n), <code>LogisticRegression</code> uses C = 1/α. ElasticNet with r → 0 equals Ridge only at Ridge-α = n·α (60 for α = 10 on six houses).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reading lasso zeros as "irrelevant"</span>
    <p>A zero can mean "useless" or "redundant with a correlated feature that was kept" (bedrooms vs size, s2 vs s1), and noise columns can be kept by chance (132, 140). Treat lasso's selection as a shortlist and check stability across resamples.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: penalising the intercept</span>
    <p>Hand-rolled solutions that add λ to the whole diagonal, including the intercept, give wrong slopes (houses at λ = 5: size 5.27 and bedrooms 2.00 instead of 6.09 and 1.74, intercept −1.04 instead of −10.37). Centre first or exclude the intercept from the penalty.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: ignoring ConvergenceWarning</span>
    <p>Lasso and elastic net on unscaled or highly correlated data converge slowly (size and bedrooms: 94% of the gap left after each sweep); stopped early, the split between twins is wrong (after 3 sweeps [6.94, 0.29] vs the optimum [6.55, 1.64]). Standardise and raise <code>max_iter</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: too narrow an α grid</span>
    <p>If the chosen α is at the edge of the grid, the true optimum is probably outside it. Use a wide log grid (e.g. 10⁻⁴ to 10⁴ for ridge) or let <code>LassoCV</code> build it from α_max.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: OLS p-values on penalised or selected models</span>
    <p>Standard errors from the OLS formula are not valid for ridge/lasso weights or for refits after lasso selection. Use sample splitting or post-selection inference if you need p-values.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet.</b> Compress the whole note into one page.</div>

  <h2 id="rl-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: six houses, size (hundreds of sq ft) 6, 8, 10, 12, 14, 16, bedrooms 1, 2, 2, 3, 3, 4, price (lakh) 28, 40, 53, 66, 79, 100. Centred sums: S₁₁ = 70, S₁₂ = 19, S₂₂ = 5.5, S₁y = 490, S₂y = 134; correlation of size and bedrooms 0.968 (VIF 16).</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>Answer on our houses</th><th>Weakness → next</th></tr>
    <tr><td>OLS breaks</td><td>why distrust 6.21 and 2.92?</td><td>duplicate: det 0; twins: rooms −1.67 … 5.58</td><td>need a preference</td></tr>
    <tr><td>Ridge</td><td>unique, stable weights?</td><td>λ = 5: [6.094, 1.735]</td><td>what does it shrink?</td></tr>
    <tr><td>Eigen-shrinkage</td><td>which parts are distrusted?</td><td>keep 0.938 and 0.060; df 1.0</td><td>never exactly 0</td></tr>
    <tr><td>Lasso</td><td>switch columns off?</td><td>diamond corners</td><td>exact rule?</td></tr>
    <tr><td>Soft-threshold</td><td>when is w = 0?</td><td>S(81.67, α)/11.67: 6.14, 3.57, 0 at α ≥ 81.67</td><td>several features?</td></tr>
    <tr><td>Coordinate descent</td><td>how to solve lasso?</td><td>α 2: [6.83, 0]; α 0.1: [6.55, 1.64]</td><td>picks one twin</td></tr>
    <tr><td>Elastic net</td><td>zeros and grouping?</td><td>4.60 at α 10, r 0.5</td><td>compare all models</td></tr>
    <tr><td>Correlated features</td><td>who gets credit?</td><td>ridge shares, lasso favours size</td><td>units?</td></tr>
    <tr><td>Standardisation</td><td>do units matter?</td><td>3.5 vs 7.0 per 100 sq ft</td><td>which α?</td></tr>
    <tr><td>CV for α</td><td>how strong?</td><td>LOO small α; 1-SE 10 → 4 features</td><td>see all α</td></tr>
    <tr><td>Paths</td><td>every α at once?</td><td>size at 23.9, rooms at 5.4</td><td>practice: sklearn</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>Ridge</td><td>min ||y − Xw||² + λ||w||²; ŵ = (XᵀX + λI)⁻¹Xᵀy; 1-D: Σxy/(Σx² + λ)</td><td>λ = sklearn Ridge alpha; X, y centred</td></tr>
    <tr><td>2×2 inverse</td><td>[[a, b], [b, d]]⁻¹ = (1/(ad − b²))·[[d, −b], [−b, a]]</td><td>for hand work</td></tr>
    <tr><td>Eigen-shrinkage</td><td>keep d²ⱼ/(d²ⱼ + λ) of the OLS component along direction j</td><td>d²ⱼ eigenvalues of XᵀX</td></tr>
    <tr><td>Effective df</td><td>df(λ) = Σⱼ d²ⱼ/(d²ⱼ + λ)</td><td>p at λ = 0, → 0 as λ → ∞</td></tr>
    <tr><td>Intercept</td><td>b₀ = ȳ − x̄ᵀw</td><td>not penalised</td></tr>
    <tr><td>Lasso</td><td>min (1/2n)||y − Xw||² + α||w||₁</td><td>α = sklearn Lasso alpha</td></tr>
    <tr><td>Soft-threshold</td><td>S(ρ, α) = sign(ρ)·max(|ρ| − α, 0); 1-D: w = S(ρ, α)/s</td><td>ρ = (1/n)Σxy, s = (1/n)Σx²</td></tr>
    <tr><td>Coordinate descent</td><td>wⱼ ← S(xⱼᵀrⱼ/n, α) / (xⱼᵀxⱼ/n), rⱼ = y − Σ_{k≠j}xₖwₖ</td><td>cycle until stable</td></tr>
    <tr><td>Elastic net</td><td>(1/2n)||y − Xw||² + αr||w||₁ + α(1 − r)/2·||w||²; 1-D: S(ρ, αr)/(s + α(1 − r))</td><td>r = l1_ratio</td></tr>
    <tr><td>Scale link</td><td>ElasticNet(α, r → 0) = Ridge(n·α)</td><td>n rows</td></tr>
    <tr><td>Lasso α_max</td><td>maxⱼ |xⱼᵀy|/n</td><td>above it every weight is 0</td></tr>
  </table>
  <h3>The running example's numbers</h3>
  <table class="tbl">
    <tr><th>Model</th><th>Weights (size, rooms)</th><th>Note</th></tr>
    <tr><td>OLS, centred raw units</td><td>6.208, 2.917</td><td>det 24; RSS 31.1</td></tr>
    <tr><td>Ridge λ = 1 / 5 / 20</td><td>6.358, 2.030 / 6.094, 1.735 / 5.144, 1.422</td><td>size rises first</td></tr>
    <tr><td>Size twice, ridge λ = 1</td><td>3.475, 3.475</td><td>even split; total 6.95</td></tr>
    <tr><td>Lasso, size only</td><td>α 10: 6.143; α 40: 3.571; α ≥ 81.67: 0</td><td>ρ 81.667, s 11.667</td></tr>
    <tr><td>Lasso CD α = 2 / 0.1</td><td>6.829, 0 / 6.546, 1.642</td><td>r² = 0.938 of the gap left per sweep</td></tr>
    <tr><td>Elastic net α 10, r 0.5 (size only)</td><td>4.600</td><td>Ridge(60) = 3.769</td></tr>
    <tr><td>Standardised: OLS / ridge 1 / lasso 2 / ENet 2</td><td>21.2, 2.8 / 12.5, 9.6 / 20.2, 1.7 / 7.9, 7.3</td><td>per SD</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Ridge</b><p>Many small real effects, multicollinearity, prediction is the goal; you want every column kept but stable.</p><small>RidgeCV, fast leave-one-out</small></div>
    <div><b>Lasso</b><p>A few strong effects among many useless columns; you want a sparse, explainable model.</p><small>LassoCV; check stability</small></div>
    <div><b>Elastic net</b><p>Groups of correlated useful columns, or p ≫ n; when unsure, tune l1_ratio.</p><small>ElasticNetCV</small></div>
    <div><b>Plain OLS</b><p>Few distinct columns, n ≫ p, and you need classical p-values.</p><small>Penalties void OLS p-values</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Not standardising; scaling outside CV; copying α across estimators; reading lasso zeros as irrelevance; penalising the intercept; ignoring convergence warnings; too narrow an α grid; OLS p-values on penalised models.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>XᵀX = [[70, 19], [19, 5.5]], Xᵀy = [490, 134], λ = 5: ridge weights?</td><td>det 426.5 → [(10.5·490 − 19·134)/426.5, (75·134 − 19·490)/426.5] = [6.094, 1.735]</td></tr>
    <tr><td>ρ = 81.667, s = 11.667, α = 40: lasso weight?</td><td>(81.667 − 40)/11.667 = 3.571</td></tr>
    <tr><td>Same, elastic net with r = 0.5?</td><td>(81.667 − 20)/(11.667 + 20) = 1.947</td></tr>
    <tr><td>Eigenvalues 75.18 and 0.319, λ = 5: effective df?</td><td>0.938 + 0.060 = 0.998</td></tr>
    <tr><td>Why does lasso zero bedrooms at α = 2 but ridge never does?</td><td>Lasso subtracts a fixed fee: bedrooms' push after size (0.71) is below 2. Ridge only divides, so a non-zero push always leaves a non-zero weight</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: Questions &amp; answers.</b> Test yourself; then the same penalties continue in <a class="xref" data-note="ml_classification">Logistic Regression</a>.</div>

  <h2 id="rl-qa"><span class="num">16</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you solve each model by hand on the houses and explain why each step needs the one before it?</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the ridge closed-form solution.</summary><div class="qa-body">L(w) = ||y − Xw||² + λ||w||². Gradient: −2Xᵀ(y − Xw) + 2λw. Set to 0: (XᵀX + λI)w = Xᵀy, so w = (XᵀX + λI)⁻¹Xᵀy. With one feature: w = Σxy / (Σx² + λ) (size alone: 490/(70 + λ)). The intercept is excluded from the penalty (centre the data first).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does ridge always have a unique solution, even with duplicate columns or p &gt; n?</summary><div class="qa-body">XᵀX is positive semi-definite with eigenvalues d² ≥ 0. Adding λI makes every eigenvalue d² + λ ≥ λ &gt; 0, so XᵀX + λI is invertible. Equivalently, the loss becomes strictly convex. For size entered twice, [[70, 70], [70, 70]] (det 0) becomes [[71, 70], [70, 71]] (det 141) at λ = 1, giving [3.475, 3.475].</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does lasso produce exact zeros and ridge does not?</summary><div class="qa-body">Algebra: the 1-D lasso solution is S(ρ, α)/s = sign(ρ)·max(|ρ| − α, 0)/s, which is exactly 0 whenever |ρ| ≤ α; ridge is ρ/(s + λ), never 0 unless ρ = 0. Intuition: the L1 pull has constant size α even for tiny weights, the L2 pull 2λw fades near 0. Geometry: the L1 ball has corners on the axes.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Price on size: ρ = 81.667, s = 11.667. What is the lasso slope at α = 10, and at what α does it become 0?</summary><div class="qa-body">(81.667 − 10)/11.667 = 6.143. It becomes 0 once α ≥ |ρ| = 81.667. Above that, both the w &gt; 0 and w &lt; 0 cases contradict themselves and only the corner w = 0 satisfies the optimality condition |ρ| ≤ α.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain coordinate descent for lasso, and why it is slow on size and bedrooms.</summary><div class="qa-body">Start from w = 0. For each feature j in turn, compute the residual without j, ρⱼ = xⱼ·residual/n, and set wⱼ = S(ρⱼ, α)/(xⱼᵀxⱼ/n). Repeat sweeps until the duality gap is below tol. It converges because the loss is convex and the non-smooth part is separable. With correlated columns each update steals the other's push: only 1 − r² = 6% of the gap closes per sweep (α = 0.1: [6.94, 0.29] after 3 sweeps vs the optimum [6.55, 1.64]).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two features are almost identical. What do OLS, ridge, lasso and elastic net do?</summary><div class="qa-body">OLS: unstable, often large opposite weights (sensors [−3.8, 6.8]; houses: bedrooms −1.67 to 5.58 depending on which house is left out). Ridge: splits the effect evenly because Σw² is smallest for an even split (houses [12.5, 9.6] per SD). Lasso: gives (almost) all to one ([20.2, 1.7]; sensors [2.9, 0]); which one is arbitrary. Elastic net: shares like ridge while still able to zero useless features.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must features be standardised for ridge and lasso but not for OLS?</summary><div class="qa-body">OLS is scale-equivariant: rescaling a column rescales its weight and predictions do not change. Penalties depend on weight size, so a column in large units (small weight) is penalised less than the same information in small units (large weight). Ridge(70) on size: 3.5 lakh per 100 sq ft with size in hundreds, 7.0 with size in sq ft. Standardising makes the penalty compare like with like.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you choose α? What is the one-standard-error rule?</summary><div class="qa-body">Cross-validate a log-spaced grid inside a pipeline: RidgeCV (fast leave-one-out), LassoCV / ElasticNetCV (path + k-fold), or GridSearchCV. 1-SE rule: take the largest α whose mean CV error is within one standard error of the minimum. On diabetes it cut 10 features to 4 for a test R² change of 0.487 → 0.481. On six houses LOO picks small α: too few rows to justify heavy shrinkage.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the effective number of degrees of freedom of ridge?</summary><div class="qa-body">df(λ) = Σⱼ d²ⱼ/(d²ⱼ + λ), where d²ⱼ are the eigenvalues of XᵀX. It falls smoothly from p (λ = 0) to 0. On the houses (eigenvalues 75.18 and 0.319) at λ = 5: 0.938 + 0.060 = 0.998, about one free weight.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can a ridge coefficient increase as λ increases? Can it change sign?</summary><div class="qa-body">Yes to both. Ridge shrinks the weight vector along each eigen-direction, not each coordinate. On the houses, w_size went 6.208 → 6.358 (λ = 1) → 6.094 → 5.144, because the distrusted direction "more rooms, same size" carried a negative size part. On diabetes, ridge s1 is +1.1 at α = 1000 and −37.6 at α = 0.01. Only the norm ||w|| is guaranteed to decrease.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose ridge, lasso or elastic net?</summary><div class="qa-body">Ridge: many features each with a small real effect, multicollinearity, prediction is the goal. Lasso: you expect a few strong features among many useless ones and want a sparse, explainable model. Elastic net: like lasso but with groups of correlated useful features, or p ≫ n; when unsure, tune l1_ratio by CV (it picked 1.0 on the noise-column data).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the Bayesian interpretations of ridge and lasso?</summary><div class="qa-body">Both are MAP estimates under a Gaussian likelihood. Ridge: Normal(0, τ²) prior on each weight (λ = σ²/τ²). Lasso: Laplace prior, which has a sharp peak at 0 and puts more mass there, giving exact zeros at the mode. Elastic net: a product of both.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is α in sklearn's Lasso related to C in LogisticRegression and to alpha in Ridge?</summary><div class="qa-body">Lasso/ElasticNet: α multiplies the penalty on a (1/2n)-scaled squared error. Ridge: α multiplies the penalty on the unscaled squared error (ElasticNet with r → 0 equals Ridge with Ridge-α = n·α: α = 10 on six houses ↔ Ridge 60). LogisticRegression: C is the inverse strength, roughly 1/α; larger C = weaker regularization.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is the intercept not penalised, and how does sklearn handle it?</summary><div class="qa-body">Penalising it would make predictions depend on the origin of y and x (lakh vs rupees, size from 0 or from 600 sq ft), which is meaningless. sklearn centres X and y, solves for the slopes, then sets b₀ = ȳ − x̄ᵀw (−10.37 for the houses at λ = 5). Penalising it wrongly pulled the intercept to −1.04 and bent the slopes to 5.27 (size) and 2.00 (bedrooms).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what did the diagnostics note's VIF of 16 predict about this note?</summary><div class="qa-body">VIF = 1/(1 − r²) = 385/24, and 24 is the determinant of the size–rooms system. A large VIF means XᵀX has a tiny eigenvalue (0.319), i.e. a direction the data barely varies in. OLS's weights are unstable along it (bedrooms −1.67 to 5.58); ridge keeps only d²/(d² + λ) = 6% of it at λ = 5, and lasso sets the weaker twin to zero. High VIF is the symptom; the penalty is the treatment.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does this note finish the polynomial note's story?</summary><div class="qa-body">Polynomial features are correlated (size and size²: 0.991) and numerous (degree 5 on six houses fits exactly with a weight of 2,257). Rather than choosing the degree, keep the columns and penalise: Ridge(0.1) on degree 5 gave a gentle, quadratic-like curve (max weight 11.5, 121 lakh at 1,800 sq ft). Standardise the powers first, and choose α by cross-validation, as here.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip the scaler but keep the penalty?</summary><div class="qa-body">The penalty starts favouring whichever columns happen to be measured in large units (small weights are cheap). Size in sq ft would escape ridge entirely while bedrooms (a small count, so a large weight) would be crushed; the selected features and the CV-chosen α then reflect units, not information. Predictions change too, unlike in OLS.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Lasso kept 6 of 210 columns, including 2 pure-noise columns. Why, and what would you do?</summary><div class="qa-body">With 200 noise columns, a couple will correlate with y by chance in the training rows, enough to beat α. Lasso's selection is not consistent when features are many and correlated. Check stability over bootstrap resamples, use the 1-SE α (sparser), or adaptive/relaxed lasso; validate the final features on fresh data.</div></details>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="ml_classification">Logistic Regression</a>.</b> The Regression group is complete: fit (Linear Regression), check (Diagnostics), bend (Polynomial), tame (this note). All four predicted a number. When the target is yes/no, the weighted sum passes through a sigmoid, the squared loss becomes log-loss, and exactly these L1/L2 penalties return as <code>C</code>.</div>
</main>
`
});
