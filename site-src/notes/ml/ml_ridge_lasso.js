// notes/ml/ml_ridge_lasso.js — Ridge, Lasso & Elastic Net
Object.assign(TOPIC_CONTENT, {
  "ml_ridge_lasso": `<main>
  <h1>Ridge, Lasso &amp; Elastic Net</h1>
  <div class="where"><span>Machine Learning</span><span>Regression</span><span>Ridge, Lasso &amp; Elastic Net</span></div>
  <p class="lead">Ordinary least squares picks the weights that fit the training data best and has no other preference. That works when the columns are few and clearly different, but real tables often contain columns that are duplicated, strongly correlated, far too many, or simply useless, and then least squares produces huge, unstable weights that change sign when a single row is removed. Ridge, lasso and elastic net fix this with one idea: add a price for large weights to the loss, so the model has to earn every weight it uses. Ridge shrinks all weights smoothly, lasso can switch columns off completely, and elastic net mixes the two; these same penalties reappear in logistic regression, SVMs, boosting and neural networks. The running example is the six houses from <a class="xref" data-note="ml_regression">Linear Regression</a>, whose size and bedroom count move almost in step (correlation 0.968), so least squares cannot tell how to split the credit between them. The diabetes dataset and a few simulated tables show the same ideas at a larger scale.</p>

  <h2 id="rl-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Ridge, Lasso &amp; Elastic Net</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why OLS fails</div>
        <ul>
          <li>Duplicate columns: XᵀX has no inverse</li>
          <li>Near-twins: weights swing (bedrooms −1.67 … 5.58)</li>
          <li>Too many / useless columns: memorises noise</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Ridge (L2)</div>
        <ul>
          <li>min ‖y − Xw‖² + λ‖w‖² → w = (XᵀX + λI)⁻¹Xᵀy</li>
          <li><b>Divides</b>: shrinks smoothly, never exactly 0</li>
          <li>Shrinks weak data directions most: d² / (d² + λ)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Lasso (L1) &amp; Elastic Net</div>
        <ul>
          <li>Lasso: (1/2n)‖y − Xw‖² + α‖w‖₁, no closed form</li>
          <li><b>Subtracts</b>: soft-threshold S(ρ, α) → exact zeros</li>
          <li>Solved by coordinate descent</li>
          <li>Elastic net: subtract then divide; keeps correlated groups</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">In practice</div>
        <ul>
          <li>Always standardise, inside a pipeline</li>
          <li>Choose α by cross-validation (RidgeCV, LassoCV); 1-SE rule</li>
          <li>Correlated twins: ridge shares, lasso picks one</li>
          <li>Intercept never penalised; α scales differ between classes</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="rl-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Where Least Squares Breaks</span><span class="rm-sub">duplicates, near-twins, too many columns</span></div></div>
      <div class="rm-item rm-done" data-target="rl-ridge"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Ridge Regression</span><span class="rm-sub">a squared price on weights, solved by formula</span></div></div>
      <div class="rm-item rm-done" data-target="rl-shrink"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">How Ridge Shrinks</span><span class="rm-sub">which parts of the answer it distrusts</span></div></div>
      <div class="rm-item rm-done" data-target="rl-lasso"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Lasso and Exact Zeros</span><span class="rm-sub">an absolute price, and the soft threshold</span></div></div>
      <div class="rm-item rm-done" data-target="rl-cd"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Coordinate Descent</span><span class="rm-sub">how lasso is actually solved</span></div></div>
      <div class="rm-item rm-done" data-target="rl-enet"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Elastic Net</span><span class="rm-sub">mixing the two penalties</span></div></div>
      <div class="rm-item rm-done" data-target="rl-corr"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Correlated Features</span><span class="rm-sub">ridge shares, lasso picks one</span></div></div>
      <div class="rm-item rm-done" data-target="rl-std"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Why Standardisation Is Required</span><span class="rm-sub">units change a penalised model</span></div></div>
      <div class="rm-item rm-done" data-target="rl-alpha"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Choosing α by Cross-Validation</span><span class="rm-sub">RidgeCV, LassoCV, the 1-SE rule</span></div></div>
      <div class="rm-item rm-done" data-target="rl-path"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Coefficient Paths</span><span class="rm-sub">every α at once</span></div></div>
      <div class="rm-item rm-done" data-target="rl-practice"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Choosing a Model in Practice</span><span class="rm-sub">sklearn settings, variants, comparison</span></div></div>
      <div class="rm-item rm-done" data-target="rl-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">scaling, α scales, reading zeros</span></div></div>
      <div class="rm-item rm-done" data-target="rl-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, numbers, comparison</span></div></div>
      <div class="rm-item rm-done" data-target="rl-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask about penalties</span></div></div>
    </div>
  </div>

  <h2 id="rl-why"><span class="num">01</span>Where Least Squares Breaks</h2>
  <p>The six houses from the Regression notes have a size (in hundreds of sq ft: 6, 8, 10, 12, 14, 16), a number of bedrooms (1, 2, 2, 3, 3, 4) and a price in lakh (28, 40, 53, 66, 79, 100). Least squares with both inputs gave price = −14.58 + 6.21·size + 2.92·bedrooms. The trouble is that bigger flats have more bedrooms, so the two columns tell almost the same story, and <a class="xref" data-note="ml_reg_diag">Assumptions &amp; Diagnostics</a> measured a VIF of 16 for them. To see how bad that can get, start with the extreme case: the dealer's spreadsheet holds the floor area twice, once from the sale deed and once from the municipal record, and the two columns are identical.</p>
  <p>Least squares solves the normal equation w = (XᵀX)⁻¹Xᵀy, which needs the inverse of XᵀX. With centred size z = −5, −3, −1, 1, 3, 5 in both columns, every entry of XᵀX is Σz·z = 70, so XᵀX = [[70, 70], [70, 70]]. Its determinant is 70·70 − 70·70 = 0, and a matrix with zero determinant has no inverse. In plain words, w₁ = 7, w₂ = 0 fits the data exactly as well as w₁ = 0, w₂ = 7, or w₁ = 107, w₂ = −100. The data cannot choose.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression, Ridge
size = np.array([6, 8, 10, 12, 14, 16.0])        # houses A-F, hundreds of sq ft
rooms = np.array([1, 2, 2, 3, 3, 4.0])           # bedrooms
price = np.array([28, 40, 53, 66, 79, 100.0])    # lakh rupees
z, yc = size - size.mean(), price - price.mean() # centred size and price
X = np.c_[z, z]                                  # size entered twice
print("X^T X =", (X.T @ X).tolist(), " det =", round(np.linalg.det(X.T @ X), 6) + 0.0)
try:
    np.linalg.inv(X.T @ X)
except np.linalg.LinAlgError as e:
    print("inverse fails:", e)
print("LinearRegression quietly returns:", LinearRegression(fit_intercept=False).fit(X, yc).coef_.round(3))
for lam in [1, 10]:
    w = np.linalg.solve(X.T @ X + lam * np.eye(2), X.T @ yc)     # add lambda to the diagonal
    print(f"with lambda={lam} on the diagonal: w = {w.round(3)}, total {w.sum():.3f}")</div>
  <div class="fx" data-lang="text">X^T X = [[70.0, 70.0], [70.0, 70.0]]  det = 0.0
inverse fails: Singular matrix
LinearRegression quietly returns: [3.5 3.5]
with lambda=1 on the diagonal: w = [3.475 3.475], total 6.950
with lambda=10 on the diagonal: w = [3.267 3.267], total 6.533</div>
  <p>The inverse fails, exactly as the hand calculation said. <code>LinearRegression</code> does not crash, because it uses a solver that quietly returns the smallest of the infinitely many answers (3.5 each); that hides the problem rather than solving it. The last two lines preview the cure. Adding a number λ to the diagonal of XᵀX makes it invertible: with λ = 1 it becomes [[71, 70], [70, 71]], whose determinant is 71² − 70² = 141, and the answer is unique, 3.475 for each copy. The total, 6.95, is slightly below the true 7. That small shortfall is the price we pay for a unique answer.</p>
  <p>Size and bedrooms are not exact copies, but they are close (correlation 0.968), and closeness is enough to cause trouble. The 2 × 2 system has determinant 24, compared with 385 if the columns were unrelated, and a small determinant means the answer is very sensitive to small changes in the data. Let us test that by refitting with one house left out each time:</p>
  <div class="fx" data-lang="py">print("all six houses : size, rooms =", LinearRegression().fit(X2, price).coef_.round(2))
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
  <p>The value of a bedroom swings from −1.67 (without house E) to +5.58 (without house D): removing one flat out of six changes its sign. Yet every one of these fits predicts the remaining houses well. The data clearly says "bigger flats with more bedrooms cost more", but it cannot say how to split the credit between size and bedrooms, so least squares picks a split almost at random. This is called an <strong>ill-conditioned</strong> problem: XᵀX is singular or nearly singular, so the least-squares answer is not unique, or is unique but extremely sensitive to the data (it has high variance).</p>
  <p>Think of two brothers who did a school project together, and a teacher who must split 20 marks between them with no other information. "20 and 0", "10 and 10" and "120 and −100" all add up to 20. Least squares has no opinion and may pick any of them. A rule such as "prefer small, even numbers" picks 10 and 10. That rule is a penalty on large weights, and adding one is called <strong>regularization</strong>. The same breakdown happens whenever columns are duplicated (two measurements of the same thing), highly correlated (x and x², two temperature sensors, two cholesterol tests), more numerous than the rows (genes, words, high-degree polynomial features), or mostly useless (a feature store with 200 columns of which 10 matter). scikit-learn will not warn you in any of these cases, so look at the coefficients and the VIFs before trusting individual weights.</p>

  <h2 id="rl-ridge"><span class="num">02</span>Ridge Regression</h2>
  <p><strong>Ridge regression</strong> minimises the squared error plus λ times the sum of the squared weights:</p>
  <p style="text-align:center"><strong>L(w) = ‖y − Xw‖² + λ·Σwⱼ²</strong></p>
  <p>Every weight now has a cost. A weight can only stay large if it reduces the squared error by more than its cost. λ (lambda, called <code>alpha</code> in scikit-learn) sets the exchange rate between the two: λ = 0 gives plain least squares, and a huge λ pushes every weight toward zero, so the model ends up predicting the average price for every flat. The penalty Σwⱼ² is the squared length of the weight vector, also written ‖w‖₂², which is why ridge is called an <strong>L2 penalty</strong>. Think of it as a percentage tax on weights: big weights pay a lot, small ones a little, so everyone gets smaller but nobody is wiped out completely.</p>
  <p>Ridge has a formula for its answer, and deriving it takes four short steps. Expand the loss: L = yᵀy − 2wᵀXᵀy + wᵀXᵀXw + λwᵀw. Take the derivative with respect to w, using the same rules as for ordinary numbers: ∂L/∂w = −2Xᵀy + 2XᵀXw + 2λw. Set it to zero at the minimum: (XᵀX + λI)w = Xᵀy. Solve:</p>
  <p style="text-align:center"><strong>ŵ = (XᵀX + λI)⁻¹ Xᵀy</strong></p>
  <p>Compared with least squares, the only change is "+ λ" on the diagonal of XᵀX, the same fix we used for the duplicated column. With a single feature everything is just numbers: w = Σxy / (Σx² + λ). The penalty sits in the denominator, so the weight is divided down as λ grows, but it never reaches zero. And because XᵀX + λI is always invertible for λ &gt; 0, ridge always has exactly one answer, even with duplicate columns or more columns than rows.</p>
  <p>Now size and bedrooms together, centred, in their raw units. From the centred sums, XᵀX = [[70, 19], [19, 5.5]] and Xᵀy = [490, 134]. A 2 × 2 matrix [[a, b], [b, d]] has inverse (1 / (ad − b²))·[[d, −b], [−b, a]], so for λ = 5 the matrix is [[75, 19], [19, 10.5]], its determinant is 787.5 − 361 = 426.5, and the weights are w_size = (10.5·490 − 19·134) / 426.5 = 6.094 and w_rooms = (75·134 − 19·490) / 426.5 = 1.735. The code repeats this for several values of λ and compares with scikit-learn:</p>
  <div class="fx" data-lang="py">A, b = Xc.T @ Xc, Xc.T @ yc                             # centred size and rooms, centred price
print("X^T X =", A.tolist(), " X^T y =", b.tolist())
for lam in [0, 1, 5, 20, 100]:
    w = np.linalg.solve(A + lam * np.eye(2), b)        # (X^T X + lambda I)^-1 X^T y
    sk = Ridge(alpha=lam, fit_intercept=False).fit(Xc, yc).coef_
    print(f"lambda={lam:&lt;4} formula {w.round(3)}  sklearn {sk.round(3)}  ||w||^2={w @ w:6.2f}  RSS={np.sum((yc - Xc @ w)**2):7.1f}")</div>
  <div class="fx" data-lang="text">X^T X = [[70.0, 19.0], [19.0, 5.5]]  X^T y = [490.0, 134.0]
lambda=0    formula [6.208 2.917]  sklearn [6.208 2.917]  ||w||^2= 47.05  RSS=   31.1
lambda=1    formula [6.358 2.03 ]  sklearn [6.358 2.03 ]  ||w||^2= 44.55  RSS=   31.9
lambda=5    formula [6.094 1.735]  sklearn [6.094 1.735]  ||w||^2= 40.14  RSS=   44.8
lambda=20   formula [5.144 1.422]  sklearn [5.144 1.422]  ||w||^2= 28.49  RSS=  183.1
lambda=100  formula [2.797 0.766]  sklearn [2.797 0.766]  ||w||^2=  8.41  RSS= 1150.0</div>
  <p>The formula and scikit-learn agree at every λ. Three things are worth noticing. First, the training error (RSS) rises as λ grows, from 31.1 to 44.8 at λ = 5: ridge deliberately fits the training data a little worse, in exchange for weights that do not swing. Second, the total size of the weights ‖w‖² falls steadily. Third, w_size actually <em>rose</em> from 6.208 to 6.358 at λ = 1 before shrinking. Ridge shrinks the weight vector as a whole, not necessarily every single weight; the next section explains why.</p>
  <p>One detail matters in practice: the intercept is never penalised. Shrinking it toward zero would make predictions depend on where zero happens to be, for example whether prices are recorded in lakh or in rupees. So scikit-learn centres X and y, solves the ridge problem on the centred data, and then sets the intercept to b₀ = ȳ − x̄·w:</p>
  <div class="fx" data-lang="py">m = Ridge(alpha=5).fit(X2, price)                      # raw houses, intercept fitted (not penalised)
print("weights", m.coef_.round(3), " intercept", round(m.intercept_, 3),
      " = ybar - xbar.w =", round(price.mean() - X2.mean(0) @ m.coef_, 3))
Xb = np.c_[np.ones(6), size, rooms]
print("if the intercept were penalised too:", np.linalg.solve(Xb.T @ Xb + 5 * np.eye(3), Xb.T @ price).round(3))</div>
  <div class="fx" data-lang="text">weights [6.094 1.735]  intercept -10.369  = ybar - xbar.w = -10.369
if the intercept were penalised too: [-1.04   5.265  1.997]</div>
  <p>On the raw houses, <code>Ridge(alpha=5)</code> returns exactly the hand weights 6.094 and 1.735, and its intercept −10.369 equals ȳ − x̄·w = 61 − (11 × 6.094 + 2.5 × 1.735). If we wrongly add λ to the intercept's diagonal entry as well, the model becomes worse: it pulls the intercept toward zero (−1.04) and tilts the slopes (5.27 and 2.00) to compensate. One more warning before moving on: scikit-learn's <code>Ridge</code> minimises ‖y − Xw‖² + α‖w‖² with no division by n, while <code>Lasso</code> and <code>ElasticNet</code> divide the squared error by 2n. So "α = 1" means very different strengths in different classes, and you must never copy an α from one to another.</p>

  <h2 id="rl-shrink"><span class="num">03</span>How Ridge Shrinks</h2>
  <p>Ridge with λ = 5 cut the bedroom weight from 2.92 to 1.74 but barely touched size (6.21 to 6.09), and at λ = 1 the size weight even rose. To understand this we need to look at the data along its natural directions rather than along the columns.</p>
  <p>Every dataset varies more in some directions than in others. The six houses vary a lot along "a bigger flat with proportionally more bedrooms", because that is how they differ from one another. They hardly vary at all along "more bedrooms in the same floor area": the only information about that comes from B and C both having 2 bedrooms at different sizes, and D and E both having 3. Mathematically these directions are the <strong>eigenvectors</strong> of XᵀX (the same directions PCA finds), and each comes with an <strong>eigenvalue</strong> d² that measures how much the data spreads along it. Adding λI to XᵀX adds λ to every eigenvalue and leaves the directions unchanged. The result is that along a direction with spread d², ridge keeps the fraction</p>
  <p style="text-align:center"><strong>shrink factor = d² / (d² + λ)</strong></p>
  <p>of the least-squares answer. Directions with lots of spread (d² much bigger than λ) keep almost everything. Directions with little spread, where the data says very little and least squares was effectively guessing, are shrunk almost to zero. Think of a judge listening to two witnesses: one saw the event clearly from close up, the other glimpsed it from far away in the dark. A sensible judge does not ignore either, but trusts each in proportion to how much they could actually see. Ridge trusts each direction of the data in proportion to how much the data varies along it.</p>
  <div class="fx" data-lang="py">d2, V = np.linalg.eigh(Xc.T @ Xc)                      # eigenvalues and directions of X^T X
print("eigenvalues:", d2.round(3), " directions (columns):", V.round(3).tolist())
for lam in [0, 5, 20]:
    f = d2 / (d2 + lam)                                # fraction kept along each direction
    print(f"lambda={lam:&lt;3} shrink factors {f.round(3)}  effective df = {f.sum():.3f}")</div>
  <div class="fx" data-lang="text">eigenvalues: [ 0.319 75.181]  directions (columns): [[0.263, -0.965], [-0.965, -0.263]]
lambda=0   shrink factors [1. 1.]  effective df = 2.000
lambda=5   shrink factors [0.06  0.938]  effective df = 0.998
lambda=20  shrink factors [0.016 0.79 ]  effective df = 0.806</div>
  <p>For the houses the two eigenvalues are 75.18 and 0.319. The big one belongs to the direction (0.965, 0.263), "bigger and roomier", and the tiny one to (−0.263, 0.965), "more bedrooms, same size". At λ = 5, ridge keeps 75.18 / 80.18 = 0.938 of the first direction and only 0.319 / 5.319 = 0.060 of the second. Now the puzzle is solved. The least-squares answer [6.208, 2.917] contains a sizeable component along the weak direction, which says "bedrooms up, size down". That component is the unreliable part, the one that flipped when we dropped a house. Ridge removes 94% of it, and since that component carried a negative amount of size, removing it lets w_size rise slightly at small λ even as the whole vector shrinks.</p>
  <p>The sum of the shrink factors is called the <strong>effective degrees of freedom</strong> of the model. Least squares with p columns uses p degrees of freedom; ridge at λ = 5 uses 0.938 + 0.060 = 0.998, about one. That is an honest summary: the six houses really only inform one direction. Unlike dropping a column, which changes the degrees of freedom in whole steps, λ is a smooth dial between p (at λ = 0) and 0 (as λ → ∞).</p>
  <p>Why is it worth accepting a biased answer? The expected error on new data is bias² + variance + noise (see <a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a>). Shrinking adds some bias, because the λ = 5 weights are not the least-squares weights. But it removes a lot of variance, because the weak direction that swung wildly between samples is mostly ignored. A classic result by Hoerl and Kennard shows that there is always some λ &gt; 0 at which the drop in variance outweighs the rise in bias², which is why a well-tuned ridge rarely loses to least squares on new data. Two further facts complete the picture. In Bayesian terms, ridge gives the most probable weights when each weight is believed in advance to follow a normal distribution centred at zero (see <a class="xref" data-note="ml_regularization">Regularization</a>). And ridge never produces exact zeros: a weight of 0.002 is small but the column is still used, so ridge is not a feature selector. For that we need a different penalty.</p>

  <h2 id="rl-lasso"><span class="num">04</span>Lasso and Why It Gives Exact Zeros</h2>
  <p>Ridge keeps every column. With 200 columns of which 10 matter, or a bedroom count that adds little once size is known, we would like a model that switches useless columns fully off. <strong>Lasso</strong> (Least Absolute Shrinkage and Selection Operator) does this by charging the absolute values of the weights instead of their squares. scikit-learn writes it as</p>
  <p style="text-align:center"><strong>(1/2n)·‖y − Xw‖² + α·Σ|wⱼ|</strong></p>
  <p>The 1/(2n) only rescales α so that the same α means roughly the same thing whatever the number of rows. The penalty Σ|wⱼ| is written ‖w‖₁, so lasso is an <strong>L1 penalty</strong>, and the intercept is again not penalised. Think of a fixed fee instead of a percentage tax: every feature that wants a non-zero weight pays the same fee per unit of weight however little it contributes, and features whose contribution is worth less than the fee drop out entirely.</p>
  <p>Lasso has no formula like ridge's. For ridge we took the derivative and set it to zero, but |w| has no derivative at w = 0: its slope jumps from −1 to +1 there, a sharp corner. That corner is exactly what makes lasso useful, because weights get stuck at it, and it is also why there is no one-line solution. A picture helps first. Lasso can equivalently be written as "minimise the squared error while keeping |w₁| + |w₂| within a budget". That allowed region is a diamond whose corners lie on the axes; for ridge, w₁² + w₂² ≤ budget is a circle. The squared error's contour lines are ellipses around the least-squares answer. Grow the ellipses until they first touch the allowed region:</p>
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
  <p>A circle has no special points, so the ellipse touches it somewhere ordinary, where both weights are non-zero. A diamond sticks out at its corners, so the ellipse usually touches a corner first, and at a corner one weight is exactly zero. In more dimensions the L1 region has even more corners and edges, so even more weights land on zero.</p>
  <p>The picture shows that zeros appear, but not when. For that, look at the pull each penalty exerts on a weight during fitting, which is the slope of the penalty. Ridge's penalty λw² has slope 2λw, proportional to w, so the pull fades as the weight gets small: at w = 4 it is 8λ, at w = 0.01 only 0.02λ. A weak weight therefore settles at a small non-zero value. Lasso's penalty α|w| has slope α whatever the size of w, so the pull stays at full strength all the way down. If the data's push on a weight is weaker than α, nothing can hold the weight up, and it lands on exactly zero.</p>
  <p>We can make this exact for one feature. Let ρ = (1/n)Σxᵢyᵢ be how strongly the centred x and y move together (the data's push on the weight) and s = (1/n)Σxᵢ² be x's spread. Least squares gives w = ρ / s. For lasso, the derivative of the smooth part is −ρ + s·w, and we consider three cases. If w &gt; 0 the penalty adds +α, so w = (ρ − α) / s, which is only consistent if ρ &gt; α. If w &lt; 0 it adds −α, so w = (ρ + α) / s, consistent only if ρ &lt; −α. Otherwise, when |ρ| ≤ α, the only consistent answer is the corner, w = 0. All three cases fit into one formula:</p>
  <p style="text-align:center"><strong>w = S(ρ, α) / s, &nbsp; where S(ρ, α) = sign(ρ) · max(|ρ| − α, 0)</strong></p>
  <p>S is called the <strong>soft-threshold</strong> function: move ρ toward zero by α, and stop at zero if you would cross it. Compare the three models in one line each: least squares divides ρ by s; ridge divides by something larger; lasso <em>subtracts</em> α first. Subtracting is what reaches zero.</p>
  <p>For price on size alone, Σdx·dy = 490, Σdx² = 70 and n = 6, so ρ = 81.667 and s = 11.667 (and ρ / s = 7, the least-squares slope). At α = 10 the lasso slope is (81.667 − 10) / 11.667 = 6.143; at α = 40 it is 3.571; and once α reaches 81.667 the slope is exactly zero and the model predicts 61 lakh for every flat.</p>
  <div class="fx" data-lang="py">n = 6
rho, s = (z @ yc) / n, (z @ z) / n                     # the data's push, and x's spread
print(f"rho = {rho:.3f}  s = {s:.3f}  OLS slope rho/s = {rho / s:.3f}")
for a in [10, 40, 80, 81.67, 90]:
    hand = soft_threshold(rho, a) / s
    skl = Lasso(alpha=a).fit(size[:, None], price).coef_[0]
    print(f"alpha={a:&lt;6} hand w = {hand:.3f}   sklearn {skl:.3f}")</div>
  <div class="fx" data-lang="text">rho = 81.667  s = 11.667  OLS slope rho/s = 7.000
alpha=10     hand w = 6.143   sklearn 6.143
alpha=40     hand w = 3.571   sklearn 3.571
alpha=80     hand w = 0.143   sklearn 0.143
alpha=81.67  hand w = 0.000   sklearn 0.000
alpha=90     hand w = 0.000   sklearn 0.000</div>
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
  <p>The hand values and scikit-learn agree. The figure summarises how each method treats one weight as the data's push ρ grows: ridge scales it down, lasso is flat at zero in a "dead zone" and then runs parallel to least squares, shifted down by α. Notice the consequence: every weight that survives lasso is also reduced by the same amount α/s, so lasso's kept weights are biased toward zero. (In the dataset-wide version, the smallest α at which every weight is zero is α_max = maxⱼ |xⱼᵀy| / n, and <code>LassoCV</code> starts its search there.) In Bayesian terms, lasso gives the most probable weights under a Laplace prior, a distribution with a sharp peak at zero.</p>

  <h2 id="rl-cd"><span class="num">05</span>Coordinate Descent</h2>
  <p>One weight can be solved by hand with the soft threshold. With size and bedrooms together, the two weights interact: how much size can still explain depends on what bedrooms already explains, and vice versa. Lasso has no closed-form answer for several features, so scikit-learn uses <strong>coordinate descent</strong>: hold all weights but one fixed, solve that one-weight problem exactly with the soft threshold, move to the next weight, and keep sweeping through the weights until nothing changes. Because the lasso loss is convex (a single bowl) and its corners belong to separate weights, this simple loop reaches the global minimum. Think of tuning a radio with two knobs, one coarse and one fine: you adjust one until the sound is best, then the other, then the first again, until neither adjustment helps.</p>
  <p>For weight j, the push is computed on the residual that the other features have left unexplained: ρⱼ = (1/n)·xⱼ·(y − Σ<sub>k≠j</sub> xₖwₖ), and the update is wⱼ = S(ρⱼ, α) / sⱼ. For the houses, s_size = 70/6 = 11.667 and s_rooms = 5.5/6 = 0.917. With α = 2 and both weights starting at zero, the first update gives size its full push 81.667, so w_size = (81.667 − 2) / 11.667 = 6.829. Then bedrooms' push, after size has explained what it can, is (134 − 19 × 6.829) / 6 = 0.710, which is below the fee of 2, so bedrooms stays at exactly zero. The second sweep repeats the same numbers, so we have converged: lasso picked one of the twins.</p>
  <div class="fx" data-lang="py">def lasso_cd(X, y, alpha, sweeps=200, verbose=0):
    """Minimise (1/2n)||y - Xw||^2 + alpha*||w||_1 by cyclic coordinate descent."""
    n, p = X.shape
    w = np.zeros(p)
    s = (X ** 2).sum(0) / n                           # (1/n) sum x_j^2 for each column
    for sweep in range(1, sweeps + 1):
        for j in range(p):
            r_j = y - X @ w + X[:, j] * w[j]          # residual ignoring feature j
            rho_j = X[:, j] @ r_j / n                 # how much j could still explain
            w[j] = soft_threshold(rho_j, alpha) / s[j]
            if sweep &lt;= verbose:
                print(f"  sweep {sweep}, w{j+1}: rho={rho_j:.3f} -&gt; w = {np.round(w, 3)}")
    return w
for a, show in [(2, 1), (0.1, 3)]:
    print(f"alpha = {a}")
    w = lasso_cd(Xc, yc, a, verbose=show)
    sk = Lasso(alpha=a, fit_intercept=False, max_iter=100_000, tol=1e-10).fit(Xc, yc).coef_
    print(f"  after 200 sweeps: {w.round(3)}   sklearn: {sk.round(3)}")</div>
  <div class="fx" data-lang="text">alpha = 2
  sweep 1, w1: rho=81.667 -&gt; w = [6.829 0.   ]
  sweep 1, w2: rho=0.710 -&gt; w = [6.829 0.   ]
  after 200 sweeps: [6.829 0.   ]   sklearn: [6.829 0.   ]
alpha = 0.1
  sweep 1, w1: rho=81.667 -&gt; w = [6.991 0.   ]
  sweep 1, w2: rho=0.194 -&gt; w = [6.991 0.102]
  sweep 2, w1: rho=81.343 -&gt; w = [6.964 0.102]
  sweep 2, w2: rho=0.282 -&gt; w = [6.964 0.198]
  sweep 3, w1: rho=81.039 -&gt; w = [6.938 0.198]
  sweep 3, w2: rho=0.364 -&gt; w = [6.938 0.288]
  after 200 sweeps: [6.546 1.642]   sklearn: [6.546 1.642]</div>
  <p>With α = 2 the code reproduces the hand numbers and converges in one sweep. With a much smaller fee, α = 0.1, bedrooms enters, but look how slowly the weights creep: after three sweeps they are [6.938, 0.288], while the true answer, reached after 200 sweeps and confirmed by scikit-learn, is [6.546, 1.642]. Each sweep closes only about 6% of the remaining gap, because size and bedrooms explain almost the same thing: every time one weight moves, it takes away most of the other's push. The fraction of the gap left after each sweep is the squared correlation, 0.938.</p>
  <p>This is why coordinate descent can need many sweeps on correlated data and why scikit-learn sometimes prints a <code>ConvergenceWarning</code>. scikit-learn stops when a measure of distance from the optimum (the duality gap) falls below <code>tol</code>, not after a fixed number of sweeps. If you see the warning, standardise the features, raise <code>max_iter</code>, or use a larger α. Two tricks make it fast in practice: <code>selection='random'</code> updates features in random order, which often helps with correlated columns, and <strong>warm starts</strong> solve for the largest α first (where every weight is zero) and use each answer to start the next smaller α, so computing a whole range of α values costs little more than one fit. Other solvers exist too: LARS computes the exact lasso path for every α, and proximal gradient methods use the same soft-threshold step on very large problems.</p>

  <h2 id="rl-enet"><span class="num">06</span>Elastic Net</h2>
  <p>At α = 2 lasso dropped bedrooms and gave all the credit to size. With twins like these, which one survives is close to arbitrary, and lasso has two other limits: when there are more columns than rows it can keep at most n of them, and its selection tends to jump around between samples. <strong>Elastic net</strong> fixes this by adding both penalties. scikit-learn writes it as</p>
  <p style="text-align:center"><strong>(1/2n)·‖y − Xw‖² + α·r·‖w‖₁ + α·(1 − r)/2·‖w‖²</strong></p>
  <p>where α is the total strength and r, called <code>l1_ratio</code>, is the mix: r = 1 is pure lasso, r = 0 is pure ridge, and values in between give models that are sparse but treat correlated features as a group. The squared part is the reason for that grouping: spreading a weight evenly costs less under L2 (1² + 1² = 2) than putting it all on one feature (2² + 0² = 4), so correlated features tend to enter and leave together.</p>
  <p>The one-feature solution follows the same three cases as lasso, and comes out as w = S(ρ, α·r) / (s + α·(1 − r)). In words: subtract first (the L1 part, which can produce zero), then divide (the L2 part, extra shrinkage). For price on size with α = 10 and r = 0.5: subtract 5 from 81.667 to get 76.667, then divide by 11.667 + 5 = 16.667, giving 4.600, smaller than pure lasso's 6.143 at the same α. With α = 40 and r = 0.5: (81.667 − 20) / (11.667 + 20) = 1.947.</p>
  <div class="fx" data-lang="py">rho, s = (z @ yc) / 6, (z @ z) / 6
for a, r in [(10, 1.0), (10, 0.5), (40, 0.5)]:
    hand = max(rho - a * r, 0) / (s + a * (1 - r))     # subtract, then divide
    skl = ElasticNet(alpha=a, l1_ratio=r).fit(size[:, None], price).coef_[0]
    print(f"alpha={a:&lt;3} l1_ratio={r:&lt;4} hand {hand:.3f}   sklearn {skl:.3f}")</div>
  <div class="fx" data-lang="text">alpha=10  l1_ratio=1.0  hand 6.143   sklearn 6.143
alpha=10  l1_ratio=0.5  hand 4.600   sklearn 4.600
alpha=40  l1_ratio=0.5  hand 1.947   sklearn 1.947</div>
  <p>All three hand values match. Elastic net is the usual choice when you expect groups of correlated useful features, or many more columns than rows; a typical search tries l1_ratio values such as 0.1, 0.5, 0.9, 0.95 and 1, with α tuned for each. Very small l1_ratio values (below about 0.01) make the solver slow and unreliable, and for pure L2 you should simply use <code>Ridge</code>.</p>

  <h2 id="rl-corr"><span class="num">07</span>Correlated Features: Ridge Shares, Lasso Picks One</h2>
  <p>We have claimed that ridge shares weight between correlated features and lasso picks one. With exact copies the reason is simple. For ridge, any split w₁ + w₂ = c gives the same fit, and w₁² + w₂² is smallest when the two are equal (3.5² + 3.5² = 24.5 against 7² + 0² = 49), so ridge splits evenly, which is the 3.475 each we saw. For lasso, |w₁| + |w₂| is the same for every split with the same sign (3.5 + 3.5 = 7 + 0), so every split is equally good and the solver just returns one of them.</p>
  <p>Now the four models on the six houses side by side. To compare them fairly both columns are standardised first (section 08 explains why), so each weight means "lakh per one standard deviation". To see how stable each answer is, each model is also refitted six times with one house left out:</p>
  <div class="fx" data-lang="py">models = {"OLS": LinearRegression(), "Ridge a=1": Ridge(alpha=1), "Lasso a=2": Lasso(alpha=2),
          "ENet a=2 r=.5": ElasticNet(alpha=2, l1_ratio=0.5)}
print("weights per 1 SD of size and rooms:")
for name, m in models.items():
    rows = [make_pipeline(StandardScaler(), m).fit(X2, price)[-1].coef_]
    for i in range(6):                                  # leave one house out
        keep = np.arange(6) != i
        rows.append(make_pipeline(StandardScaler(), m).fit(X2[keep], price[keep])[-1].coef_)
    rows = np.array(rows)
    print(f"{name:14s} all six {np.array2string(rows[0].round(1), separator=', '):13s}"
          f" without one house: size {rows[1:, 0].min():4.1f}..{rows[1:, 0].max():4.1f}, rooms {rows[1:, 1].min():4.1f}..{rows[1:, 1].max():4.1f}")</div>
  <div class="fx" data-lang="text">weights per 1 SD of size and rooms:
OLS            all six [21.2,  2.8]  without one house: size 16.9..26.4, rooms -1.7.. 5.7
Ridge a=1      all six [12.5,  9.6]  without one house: size 10.3..13.0, rooms  6.1..11.0
Lasso a=2      all six [20.2,  1.7]  without one house: size 15.9..22.7, rooms  0.0.. 4.6
ENet a=2 r=.5  all six [7.9, 7.3]    without one house: size  6.1.. 8.6, rooms  5.1.. 8.2</div>
  <p>Least squares gives size 21.2 and bedrooms 2.8 per standard deviation, but leaving out one house moves bedrooms anywhere from −1.7 to 5.7. Ridge (α = 1) shares the credit, 12.5 and 9.6, and its leave-one-out ranges are narrow. Lasso (α = 2) gives most of the credit to size (20.2) and little to bedrooms (1.7), and in some leave-one-out fits bedrooms is exactly zero. Elastic net shares like ridge and, at this strong α, shrinks both. The predictions of all four are similar; what changes is the explanation.</p>
  <p>The same pattern is clearer with near-perfect twins. Below, sensor B is a copy of temperature sensor A plus tiny noise (correlation 0.9999), and the target depends on temperature with a true total effect of 3 per degree. Each model is refitted on three bootstrap resamples of 100 days:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet
rng = np.random.default_rng(1)
temp_a = rng.normal(25, 5, 100)                  # sensor A, degrees C
temp_b = temp_a + rng.normal(0, 0.05, 100)       # sensor B: a near-copy of A
y = 3 * temp_a + rng.normal(0, 3, 100)           # true total effect: 3 per degree
X = np.c_[temp_a, temp_b]
models = {"OLS": LinearRegression(), "Ridge": Ridge(alpha=10),
          "Lasso": Lasso(alpha=1), "ENet": ElasticNet(alpha=1, l1_ratio=0.5)}
for name, m in models.items():
    row = []
    for b in range(3):                           # 3 bootstrap resamples of the rows
        idx = rng.integers(0, 100, 100)
        w = m.fit(X[idx], y[idx]).coef_
        row.append(f"[{w[0]:5.1f}, {w[1]:5.1f}]")
    print(f"{name:6s}", "  ".join(row))
lasso = Lasso(alpha=1, max_iter=100_000)
print("Lasso on [A, B]:", lasso.fit(X, y).coef_.round(2), "  on [B, A]:", lasso.fit(X[:, ::-1], y).coef_.round(2))</div>
  <div class="fx" data-lang="text">OLS    [ -3.8,   6.8]  [ -3.7,   6.7]  [ -0.4,   3.4]
Ridge  [  1.5,   1.5]  [  1.6,   1.4]  [  1.6,   1.4]
Lasso  [  2.9,   0.0]  [  3.0,   0.0]  [  2.9,   0.0]
ENet   [  1.5,   1.5]  [  1.5,   1.5]  [  1.4,   1.4]
Lasso on [A, B]: [2.94 0.  ]   on [B, A]: [0.68 2.25]</div>
  <p>Every pair adds up to about 3, the true total. Least squares splits it wildly, with a negative weight on one sensor, and the split changes from sample to sample. Ridge and elastic net share it evenly and stably at about [1.5, 1.5]. Lasso gives almost everything to one sensor. The last line shows how fragile that choice is: the same data with the columns listed in the opposite order gives a different split, because near-ties are decided by tiny noise and solver details.</p>
  <p>On real data the effect looks like this. The diabetes dataset has 442 patients, 10 standardised measurements (age, sex, BMI, blood pressure and six blood tests s1 to s6) and a measure of disease progression after one year. Tests s1 and s2 are two cholesterol measures with correlation 0.897:</p>
  <div class="fx" data-lang="py">import numpy as np, pandas as pd
from sklearn.datasets import load_diabetes
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import cross_val_score
from sklearn.linear_model import LinearRegression, Ridge, Lasso
X, y = load_diabetes(return_X_y=True, as_frame=True)          # 442 patients, 10 features
print("corr(s1, s2) =", round(X.s1.corr(X.s2), 3))
models = {"OLS": LinearRegression(), "Ridge a=10": Ridge(alpha=10), "Lasso a=1": Lasso(alpha=1)}
coefs, cv = {}, {}
for name, m in models.items():
    pipe = make_pipeline(StandardScaler(), m)
    coefs[name] = pipe.fit(X, y)[-1].coef_
    cv[name] = round(float(cross_val_score(pipe, X, y, cv=5).mean()), 3)
print(pd.DataFrame(coefs, index=X.columns).round(1) + 0.0)
print("5-fold CV R2:", cv)</div>
  <div class="fx" data-lang="text">corr(s1, s2) = 0.897
      OLS  Ridge a=10  Lasso a=1
age  -0.5        -0.3        0.0
sex -11.4       -10.9       -9.3
bmi  24.7        24.6       24.8
bp   15.4        15.1       14.1
s1  -37.7       -11.3       -4.8
s2   22.7         1.8        0.0
s3    4.8        -6.6      -10.6
s4    8.4         5.6        0.0
s5   35.7        25.3       24.4
s6    3.2         3.5        2.6
5-fold CV R2: {'OLS': 0.482, 'Ridge a=10': 0.481, 'Lasso a=1': 0.482}</div>
  <p>Least squares gives the cholesterol twins large opposite weights, −37.7 and +22.7, which mostly cancel: the classic signature of multicollinearity. Ridge pulls them to −11.3 and +1.8, and lasso drops s2 (and age and s4) entirely. Yet the cross-validated R² is 0.48 for all three. The penalties changed the explanation much more than the predictions, and ridge even flipped the sign of s3. So with correlated columns, individual least-squares signs are not trustworthy, and a lasso zero does not mean a feature is irrelevant: it may just be redundant with a twin that was kept. Which twin is "the real cause" is a question for domain knowledge or experiments, not for a penalty.</p>

  <h2 id="rl-std"><span class="num">08</span>Why Standardisation Is Required</h2>
  <p>Least squares does not care about units. Measure size in square feet instead of hundreds of square feet and its weight changes from 7 to 0.07, but the predictions are identical. A model with this property is called <strong>scale-equivariant</strong>. Penalised models are not, because the penalty only sees the number: ridge charges 7² = 49 for the first version and 0.07² = 0.0049 for the second, 10,000 times less, purely because of units.</p>
  <p>By hand, with ridge at λ = 70 on size alone, w = Σxy / (Σx² + λ). In hundreds of sq ft, w = 490 / (70 + 70) = 3.5 lakh per 100 sq ft: the weight is halved. In sq ft every x is 100 times larger, so Σxy = 49,000 and Σx² = 700,000, and w = 49,000 / 700,070 = 0.069993 per sq ft, which is 6.999 per 100 sq ft: almost untouched. Same data, same λ, a completely different model. Think of a shop that charges a flat fee per digit on a price tag: the same item would cost far more to label in paise than in rupees, which has nothing to do with the item.</p>
  <div class="fx" data-lang="py">for unit, col, per100 in [("size in 100 sq ft", size, 1), ("size in sq ft", size * 100, 100)]:
    rid = Ridge(alpha=70).fit(col[:, None], price).coef_[0]
    las = Lasso(alpha=10).fit(col[:, None], price).coef_[0]
    print(f"{unit:18s} ridge(70) per 100 sq ft {rid * per100:.3f}   lasso(10) per 100 sq ft {las * per100:.3f}")
std = make_pipeline(StandardScaler(), Ridge(alpha=70))
print("standardised first, per-SD weight:", round(std.fit(size[:, None], price)[-1].coef_[0], 3),
      "(sq ft:", round(std.fit(100 * size[:, None], price)[-1].coef_[0], 3), ")")</div>
  <div class="fx" data-lang="text">size in 100 sq ft  ridge(70) per 100 sq ft 3.500   lasso(10) per 100 sq ft 6.143
size in sq ft      ridge(70) per 100 sq ft 6.999   lasso(10) per 100 sq ft 6.991
standardised first, per-SD weight: 1.888 (sq ft: 1.888 )</div>
  <p>Ridge halves the weight in one unit and leaves it alone in the other, and lasso shows the same effect more gently (6.143 against 6.991). With a <code>StandardScaler</code> first, both unit choices give exactly the same model, 1.888 lakh per standard deviation of size. <strong>Standardising</strong> means rescaling each column to mean 0 and standard deviation 1, so the penalty compares like with like. It is required for ridge, lasso and elastic net (unless all columns already share a meaningful unit), and the scaler must sit inside a pipeline so that each cross-validation fold computes its own means and standard deviations (see <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>). The target y does not need scaling, because the unpenalised intercept absorbs its mean. After standardising, a coefficient means "the effect of one standard deviation"; divide it by the column's standard deviation to get the effect per original unit. Tree models do not need any of this, because they are unaffected by scale.</p>

  <h2 id="rl-alpha"><span class="num">09</span>Choosing α by Cross-Validation</h2>
  <p>So far we picked λ = 5 and α = 2 by hand. α is a <strong>hyperparameter</strong>, a setting chosen before training rather than learned from it. Too small and we are back to least squares' variance; too large and every weight is crushed, which is bias. Training error always prefers α = 0, so it cannot choose. Instead we use cross-validation (see <a class="xref" data-note="ml_splits">Train/Val/Test &amp; Cross-Validation</a>): try a grid of α values spaced on a log scale (because sensible values range over several orders of magnitude), score each with k-fold cross-validation on the training data, and keep the best. scikit-learn has estimators that do this efficiently: <code>RidgeCV</code> computes exact leave-one-out error for every α from a single matrix decomposition, using the same leverage shortcut as in <a class="xref" data-note="ml_polyreg">Polynomial &amp; Basis Functions</a>; <code>LassoCV</code> and <code>ElasticNetCV</code> build a grid of 100 α values from α_max downward and fit the whole path in each fold with warm starts. After fitting, the chosen value is in <code>alpha_</code>. First the six houses:</p>
  <div class="fx" data-lang="py">from sklearn.linear_model import RidgeCV, LassoCV
from sklearn.model_selection import LeaveOneOut
rcv = make_pipeline(StandardScaler(), RidgeCV(alphas=np.logspace(-3, 3, 61))).fit(X2, price)[-1]
print(f"RidgeCV (leave-one-out) alpha_ = {rcv.alpha_:.3f}  weights {rcv.coef_.round(2)}")
lcv = make_pipeline(StandardScaler(), LassoCV(cv=LeaveOneOut())).fit(X2, price)[-1]
print(f"LassoCV (leave-one-out) alpha_ = {lcv.alpha_:.3f}  weights {lcv.coef_.round(2)}")</div>
  <div class="fx" data-lang="text">RidgeCV (leave-one-out) alpha_ = 0.079  weights [18.41  5.43]
LassoCV (leave-one-out) alpha_ = 0.137  weights [21.17  2.69]</div>
  <p>Leave-one-out cross-validation picks small penalties, ridge α = 0.08 and lasso α = 0.14, so both models stay close to least squares. That is an honest answer: with six rows, cross-validation cannot measure the variance reduction well enough to justify heavy shrinkage. Penalties earn their keep when columns are many relative to rows.</p>
  <p>Cross-validation scores are themselves noisy, and often a whole range of α values scores within noise of the best. The <strong>one-standard-error rule</strong> picks the largest α (the simplest model) whose mean cross-validation error is within one standard error of the minimum, where the standard error is the standard deviation across folds divided by √k. On the diabetes data:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_diabetes
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split, KFold
from sklearn.linear_model import LassoCV, Lasso
from sklearn.metrics import r2_score
X, y = load_diabetes(return_X_y=True)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.25, random_state=42)
cv = KFold(5, shuffle=True, random_state=0)
p = make_pipeline(StandardScaler(), LassoCV(cv=cv)).fit(Xtr, ytr)
lcv = p[-1]
mean, se = lcv.mse_path_.mean(1), lcv.mse_path_.std(1) / np.sqrt(5)
best = mean.argmin()
a_1se = lcv.alphas_[mean &lt;= mean[best] + se[best]].max()       # largest alpha within 1 SE
p1 = make_pipeline(StandardScaler(), Lasso(alpha=a_1se)).fit(Xtr, ytr)
print(f"min-CV alpha {lcv.alpha_:.3f}: CV MSE {mean[best]:.0f} +/- {se[best]:.0f}, "
      f"test R2 {r2_score(yte, p.predict(Xte)):.3f}, nonzero {int((lcv.coef_ != 0).sum())}/10")
print(f"1-SE alpha   {a_1se:.3f}: test R2 {r2_score(yte, p1.predict(Xte)):.3f}, nonzero {int((p1[-1].coef_ != 0).sum())}/10")</div>
  <div class="fx" data-lang="text">min-CV alpha 0.140: CV MSE 3117 +/- 281, test R2 0.487, nonzero 10/10
1-SE alpha   9.237: test R2 0.481, nonzero 4/10</div>
  <p>The minimum cross-validation error, 3117 with a standard error of 281, is reached at α = 0.14, which keeps all 10 features and scores test R² 0.487. Any α with error up to 3117 + 281 = 3398 counts as equally good, and the largest such α is 9.24, which keeps only 4 features at test R² 0.481. Most practitioners would take the 4-feature model: almost the same accuracy and much simpler to explain and maintain.</p>
  <p>Ten clean features hide the real benefit of penalties. Add 200 columns of pure random numbers to the 10 real ones, a realistic situation in a large feature store, and compare on a held-out test set:</p>
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
models = {"OLS": LinearRegression(), "RidgeCV": RidgeCV(alphas=np.logspace(-3, 3, 13)),
          "LassoCV": LassoCV(cv=5, random_state=0),
          "ElasticNetCV": ElasticNetCV(l1_ratio=[.2, .5, .8, 1], cv=5, random_state=0)}
for name, m in models.items():
    p = make_pipeline(StandardScaler(), m).fit(Xtr, ytr)
    print(f"{name:12s} test R2 {r2_score(yte, p.predict(Xte)):6.3f}   nonzero weights {int((p[-1].coef_ != 0).sum()):3d}/210")
print("ElasticNetCV chose l1_ratio =", p[-1].l1_ratio_)</div>
  <div class="fx" data-lang="text">OLS          test R2 -0.258   nonzero weights 210/210
RidgeCV      test R2  0.366   nonzero weights 210/210
LassoCV      test R2  0.485   nonzero weights   6/210
ElasticNetCV test R2  0.485   nonzero weights   6/210
ElasticNetCV chose l1_ratio = 1.0</div>
  <p>Least squares has to fit 210 weights from 331 rows. It memorises noise and scores −0.258 on the test set, worse than predicting the average for everyone. Ridge recovers to 0.366 but still carries 210 non-zero weights. Lasso keeps 6 columns and scores 0.485, as good as models that only ever saw the 10 real columns. (Its 6 columns include the strongest real signals, plus a couple of noise columns that correlated with the target by chance.) <code>ElasticNetCV</code> chose l1_ratio = 1.0, pure lasso, because sparsity is what this data needs. Once α is chosen, refit on all the training data and report the test score; the cross-validation score of the best of 100 α values is slightly optimistic. And if the chosen α is at the edge of your grid, extend the grid.</p>

  <h2 id="rl-path"><span class="num">10</span>Coefficient Paths</h2>
  <p>A single α gives a single model. A <strong>coefficient path</strong> shows every weight as α slides from "everything zero" to plain least squares, and it reveals which features are strong, which enter late and where correlated twins trade places. By convention α is on a log scale and decreases from left to right. A feature enters the lasso path at the α equal to its push when all weights are zero, |xⱼᵀy| / n. For the standardised houses:</p>
  <div class="fx" data-lang="py">from sklearn.linear_model import lasso_path
Zs = StandardScaler().fit_transform(X2)
print("entry point |x_j . y| / n =", np.round(np.abs(Zs.T @ yc) / 6, 2))
alphas, coefs, _ = lasso_path(Zs, yc, alphas=[30, 20, 10, 5.4, 2, 0.01])
for a, c in zip(alphas, coefs.T):
    r = Ridge(alpha=a).fit(Zs, yc).coef_
    print(f"alpha {a:5}: lasso size {c[0]:6.2f} rooms {c[1]:5.2f}  |  ridge size {r[0]:6.2f} rooms {r[1]:5.2f}")</div>
  <div class="fx" data-lang="text">entry point |x_j . y| / n = [23.91 23.33]
alpha  30.0: lasso size   0.00 rooms  0.00  |  ridge size   3.45 rooms  3.33
alpha  20.0: lasso size   3.91 rooms  0.00  |  ridge size   4.54 rooms  4.37
alpha  10.0: lasso size  13.91 rooms  0.00  |  ridge size   6.67 rooms  6.33
alpha   5.4: lasso size  18.49 rooms  0.02  |  ridge size   8.55 rooms  7.92
alpha   2.0: lasso size  20.22 rooms  1.75  |  ridge size  11.06 rooms  9.46
alpha  0.01: lasso size  21.23 rooms  2.76  |  ridge size  20.74 rooms  3.24</div>
  <p>Size's push is 23.91 and bedrooms' is 23.33; they are almost equally correlated with price, but size enters first, at α = 23.91. Once size is in, bedrooms' remaining push is tiny, so bedrooms waits until α ≈ 5.4, and only near α = 0 do both weights approach least squares (21.2 and 2.8). Between α = 20 and α = 10, the size weight rises by exactly 10 (3.91 to 13.91): the lasso path is piecewise linear, changing direction only where a feature enters or leaves. Ridge behaves differently: both weights grow together from the start (3.45 and 3.33 at α = 30) and only separate as α becomes small. The same on the 10 diabetes features:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_diabetes
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import lasso_path
X, y = load_diabetes(return_X_y=True, as_frame=True)
names = list(X.columns)
Xs = StandardScaler().fit_transform(X); yc = y - y.mean()
alphas, coefs, _ = lasso_path(Xs, yc, alphas=np.logspace(2, -2, 200))   # large -&gt; small alpha
first = [alphas[np.flatnonzero(coefs[j])[0]] for j in range(10)]
order = sorted(range(10), key=lambda j: -first[j])
print("entry order:", ", ".join(f"{names[j]} ({first[j]:.1f})" for j in order))
for a in [30, 10, 1, 0.1]:
    k = np.argmin(abs(alphas - a))
    print(f"alpha {a:&gt;4}: " + " ".join(f"{names[j]}={coefs[j, k]:.1f}" for j in range(10) if coefs[j, k] != 0))</div>
  <div class="fx" data-lang="text">entry order: bmi (43.5), s5 (41.5), bp (20.7), s3 (15.0), sex (5.9), s6 (4.1), s1 (3.3), s4 (0.9), s2 (0.3), age (0.2)
alpha   30: bmi=11.4 s5=8.5
alpha   10: bmi=22.6 bp=6.9 s3=-3.2 s5=19.6
alpha    1: sex=-9.4 bmi=24.8 bp=14.1 s1=-4.9 s3=-10.6 s5=24.5 s6=2.6
alpha  0.1: age=-0.3 sex=-11.2 bmi=24.9 bp=15.2 s1=-26.4 s2=13.7 s4=7.1 s5=31.6 s6=3.2</div>
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
  <p>BMI and s5 enter first, at α ≈ 43 and 41, so they are the strongest, most independent signals; blood pressure and s3 follow. The cholesterol twins s1 and s2 enter late and stay small until α is tiny, then split apart in opposite directions (−26.4 and +13.7 at α = 0.1), heading for least squares' large opposite values. When reading a path, an early entry means a strong, unique signal; a late entry means weak or redundant given the others; two lines diverging in opposite directions near the right edge mean a correlated pair whose split is unstable; and a sign change along the path means the effect depends on which other variables are in the model. Paths are only comparable across features when the columns were standardised, and entry order describes this dataset's correlations, not causal importance.</p>

  <h2 id="rl-practice"><span class="num">11</span>Choosing a Model in Practice</h2>
  <p>The four models differ in a handful of ways that are worth having in one table:</p>
  <table class="tbl">
    <tr><th></th><th>OLS</th><th>Ridge</th><th>Lasso</th><th>Elastic net</th></tr>
    <tr><td>Penalty</td><td>none</td><td>λΣw²</td><td>αΣ|w|</td><td>both, mixed by l1_ratio</td></tr>
    <tr><td>Solution</td><td>(XᵀX)⁻¹Xᵀy</td><td>(XᵀX + λI)⁻¹Xᵀy</td><td>coordinate descent / LARS</td><td>coordinate descent</td></tr>
    <tr><td>One weight</td><td>ρ / s</td><td>divides</td><td>subtracts (soft threshold)</td><td>subtracts, then divides</td></tr>
    <tr><td>Exact zeros</td><td>no</td><td>no</td><td>yes</td><td>yes</td></tr>
    <tr><td>Correlated twins</td><td>erratic, opposite signs</td><td>shares evenly</td><td>keeps one, arbitrarily</td><td>shares within groups</td></tr>
    <tr><td>More columns than rows</td><td>fails</td><td>works</td><td>keeps at most n</td><td>works, can keep more</td></tr>
    <tr><td>Needs scaling</td><td>no</td><td>yes</td><td>yes</td><td>yes</td></tr>
    <tr><td>Best when</td><td>few distinct columns, n ≫ p, need p-values</td><td>many small real effects, collinearity</td><td>few strong effects among many useless</td><td>groups of correlated useful columns</td></tr>
  </table>
  <p>In scikit-learn the settings that matter are few. <code>alpha</code> is the strength, tuned on a log grid; <code>l1_ratio</code> is elastic net's mix; <code>fit_intercept=True</code> (the default) centres the data and leaves the intercept unpenalised; <code>max_iter</code> and <code>tol</code> control the iterative solvers; <code>positive=True</code> forces all weights to be non-negative, useful for prices or mixture proportions; and Ridge's <code>solver</code> can stay on <code>'auto'</code>. The same penalties appear in other estimators: <code>LogisticRegression</code> uses L1, L2 or elastic net with <code>C</code> = 1/α, so a larger C means a <em>weaker</em> penalty (see <a class="xref" data-note="ml_classification">Logistic Regression</a>); <code>SGDRegressor(penalty=...)</code> applies them to streaming data; and kernel ridge regression is ridge applied to RBF basis functions without building the columns.</p>
  <p>A few variants are worth recognising by name. The <strong>adaptive lasso</strong> gives each feature its own penalty weight (larger for features that looked weak in a first fit), which improves selection. The <strong>relaxed lasso</strong> uses lasso only to choose the features, then refits them with little or no penalty to remove lasso's shrinkage bias. The <strong>group lasso</strong> penalises predefined groups, such as all the dummy columns of one category, so that they enter or leave together. And <strong>principal component regression</strong> keeps or drops whole data directions (shrink factor 1 or 0), whereas ridge shrinks them smoothly. Finally, p-values and confidence intervals from the ordinary least-squares formulas are not valid for penalised coefficients, nor for a least-squares refit on lasso-selected features, because the selection used the same data. If you need inference after selection, select on one half of the data and test on the other.</p>

  <h2 id="rl-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The first mistake is not standardising. Section 08 showed Ridge(70) halving the size weight when size was in hundreds of sq ft and leaving it untouched in sq ft. The penalty then favours whichever columns happen to be measured in large units, and both the selected features and the chosen α reflect units rather than information. The fix is always the same pipeline: <code>make_pipeline(StandardScaler(), Lasso(alpha=...))</code>. A close relative is scaling outside cross-validation: fitting the scaler on all rows before cross-validating leaks the validation rows' statistics into training, so cross-validate the whole pipeline.</p>
  <p>The second is copying α between estimators. Ridge has no 1/n in its loss; Lasso and ElasticNet divide by 2n; LogisticRegression uses C, the inverse. So the same number means different strengths:</p>
  <div class="fx" data-lang="py">X = size[:, None]
print("Ridge(alpha=10)                    :", Ridge(alpha=10).fit(X, price).coef_.round(3))
print("ElasticNet(alpha=10, l1_ratio~0)   :", ElasticNet(alpha=10, l1_ratio=1e-4).fit(X, price).coef_.round(3))
print("Ridge(alpha=60) = Ridge(n * 10)    :", Ridge(alpha=60).fit(X, price).coef_.round(3))</div>
  <div class="fx" data-lang="text">Ridge(alpha=10)                    : [6.125]
ElasticNet(alpha=10, l1_ratio~0)   : [3.769]
Ridge(alpha=60) = Ridge(n * 10)    : [3.769]</div>
  <p>Ridge(10) barely shrinks the size weight (6.125), while an elastic net that is almost pure ridge at α = 10 shrinks it to 3.769, which matches Ridge at α = 60 = n × 10. Always tune α separately for each estimator.</p>
  <p>The third is reading a lasso zero as "irrelevant". A zero can mean useless, or it can mean redundant with a correlated feature that was kept (bedrooms against size, s2 against s1), and with many columns some pure-noise columns get kept by chance. Treat lasso's selection as a shortlist and check how stable it is across bootstrap resamples before claiming anything about a feature.</p>
  <p>The fourth is penalising the intercept in a hand-written solution by adding λ to the whole diagonal. On the houses at λ = 5 that gave slopes 5.27 and 2.00 and intercept −1.04 instead of 6.09, 1.74 and −10.37. Centre the data first or leave the intercept out of the penalty.</p>
  <p>The fifth is ignoring a <code>ConvergenceWarning</code>. Lasso on unscaled or highly correlated data converges slowly (only 6% of the gap closed per sweep for size and bedrooms), and if it stops early the split between twins is wrong. Standardise and raise <code>max_iter</code>. Finally, avoid too narrow an α grid (if the best α is at the edge, extend it) and do not report ordinary p-values for penalised coefficients.</p>

  <h2 id="rl-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Ill-conditioned least squares</b>: XᵀX singular or nearly so (duplicates, correlated columns, p ≥ n) → weights not unique or very unstable.</li>
    <li><b>Regularization</b>: adding a penalty on weight size to the loss so the model must earn every weight.</li>
    <li><b>Ridge (L2)</b>: min ‖y − Xw‖² + λ‖w‖²; shrinks smoothly; never exactly zero.</li>
    <li><b>Lasso (L1)</b>: min (1/2n)‖y − Xw‖² + α‖w‖₁; exact zeros; feature selection.</li>
    <li><b>Elastic net</b>: L1 + L2 mixed by l1_ratio; zeros plus grouping of correlated features.</li>
    <li><b>Soft threshold</b>: S(ρ, α) = sign(ρ)·max(|ρ| − α, 0).</li>
    <li><b>Effective degrees of freedom</b>: Σ d²/(d² + λ); p at λ = 0, → 0 as λ grows.</li>
    <li><b>Coefficient path</b>: every weight plotted against α.</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Model</th><th>General</th><th>One feature (ρ = Σxy/n, s = Σx²/n)</th></tr>
    <tr><td>OLS</td><td>(XᵀX)⁻¹Xᵀy</td><td>ρ / s</td></tr>
    <tr><td>Ridge</td><td>(XᵀX + λI)⁻¹Xᵀy</td><td>Σxy / (Σx² + λ)</td></tr>
    <tr><td>Lasso</td><td>coordinate descent: wⱼ ← S(ρⱼ, α)/sⱼ</td><td>S(ρ, α) / s</td></tr>
    <tr><td>Elastic net</td><td>wⱼ ← S(ρⱼ, αr) / (sⱼ + α(1 − r))</td><td>S(ρ, αr) / (s + α(1 − r))</td></tr>
  </table>
  <p>Ridge keeps d²/(d² + λ) of each eigen-direction. Intercept b₀ = ȳ − x̄·w, never penalised. Lasso α_max = maxⱼ|xⱼᵀy|/n. ElasticNet(α, r → 0) = Ridge(n·α).</p>
  <h3>The six houses</h3>
  <table class="tbl">
    <tr><th>Model</th><th>Weights (size, rooms)</th></tr>
    <tr><td>OLS (centred, raw units)</td><td>6.208, 2.917 (determinant 24)</td></tr>
    <tr><td>Ridge λ = 1 / 5 / 20</td><td>6.358, 2.030 / 6.094, 1.735 / 5.144, 1.422</td></tr>
    <tr><td>Size entered twice, ridge λ = 1</td><td>3.475, 3.475</td></tr>
    <tr><td>Lasso on size only, α = 10 / 40 / ≥ 81.67</td><td>6.143 / 3.571 / 0</td></tr>
    <tr><td>Lasso α = 2 / 0.1</td><td>6.829, 0 / 6.546, 1.642</td></tr>
    <tr><td>Elastic net, size only, α 10, r 0.5</td><td>4.600</td></tr>
    <tr><td>Standardised: OLS / ridge 1 / lasso 2</td><td>21.2, 2.8 / 12.5, 9.6 / 20.2, 1.7</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge, Lasso, ElasticNet, RidgeCV, LassoCV, ElasticNetCV

ridge = make_pipeline(StandardScaler(), RidgeCV(alphas=np.logspace(-3, 3, 25)))
lasso = make_pipeline(StandardScaler(), LassoCV(cv=5))
enet  = make_pipeline(StandardScaler(), ElasticNetCV(l1_ratio=[.1, .5, .9, 1], cv=5))
# after fit: model[-1].alpha_, model[-1].coef_ ; lasso_path(X, y) for paths</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Standardise, inside a pipeline; never scale before cross-validation.</li>
    <li>α means different things in Ridge, Lasso/ElasticNet (1/2n) and LogisticRegression (C = 1/α).</li>
    <li>Ridge never gives zeros; lasso zeros can mean "redundant", not "useless".</li>
    <li>Ridge shrinks the vector, so a single weight can grow or change sign along the path.</li>
    <li>Penalised coefficients have no valid OLS p-values.</li>
  </ul>

  <h2 id="rl-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What problem do ridge and lasso solve?</summary><div class="qa-body">They stop least squares from producing huge, unstable weights when columns are correlated, duplicated, numerous or useless. Adding a penalty on weight size makes the problem well-posed, trades a little bias for a large drop in variance, and usually improves accuracy on new data. Lasso also performs feature selection.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the ridge closed-form solution.</summary><div class="qa-body">L(w) = ‖y − Xw‖² + λ‖w‖². The gradient is −2Xᵀ(y − Xw) + 2λw. Setting it to zero gives (XᵀX + λI)w = Xᵀy, so w = (XᵀX + λI)⁻¹Xᵀy. With one feature it reduces to Σxy / (Σx² + λ). The intercept is excluded from the penalty by centring the data first.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does ridge always have a unique solution, even with duplicate columns or p &gt; n?</summary><div class="qa-body">XᵀX has eigenvalues d² ≥ 0, some of which may be zero. Adding λI makes every eigenvalue at least λ &gt; 0, so XᵀX + λI is invertible, and the loss becomes strictly convex with a single minimum. For a duplicated column, [[70, 70], [70, 70]] (determinant 0) becomes [[71, 70], [70, 71]] at λ = 1, and the weight is split evenly.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does lasso produce exact zeros and ridge does not?</summary><div class="qa-body">Algebraically, the one-feature lasso solution is S(ρ, α)/s, which is exactly zero whenever |ρ| ≤ α, while ridge is ρ/(s + λ), which is zero only if ρ is. Intuitively, the L1 pull has constant size α even for tiny weights, while the L2 pull 2λw fades near zero. Geometrically, the L1 constraint region is a diamond with corners on the axes, and the error contours usually touch it at a corner.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is soft-thresholding?</summary><div class="qa-body">S(ρ, α) = sign(ρ)·max(|ρ| − α, 0): move ρ toward zero by α and stop at zero. It is the exact lasso solution for one feature (divided by the feature's spread s) and the update used by coordinate descent. With orthonormal columns every lasso weight is the soft-thresholded least-squares weight.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is lasso solved, given there is no closed form?</summary><div class="qa-body">Usually by cyclic coordinate descent: for each feature in turn, compute its push on the residual left by the others, ρⱼ, and set wⱼ = S(ρⱼ, α)/sⱼ; repeat until the duality gap is below a tolerance. It converges because the loss is convex and the non-smooth part separates by feature. LARS and proximal gradient methods are alternatives.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two features are almost identical. What do OLS, ridge, lasso and elastic net do?</summary><div class="qa-body">OLS gives unstable, often large opposite weights that change between samples. Ridge splits the effect evenly, because Σw² is smallest for an even split. Lasso gives (almost) all of it to one feature, and which one is essentially arbitrary. Elastic net shares like ridge while still being able to zero out useless features.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must features be standardised for ridge and lasso but not for OLS?</summary><div class="qa-body">OLS is scale-equivariant: rescaling a column rescales its weight and leaves predictions unchanged. A penalty depends on the size of the weights, so a column in large units (with a small weight) is penalised less than the same information in small units. Ridge(70) on the houses halved the size weight in hundreds of sq ft but left it untouched in sq ft. Standardising puts every column on the same footing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you choose α? What is the one-standard-error rule?</summary><div class="qa-body">Cross-validate a log-spaced grid of α inside a pipeline, using RidgeCV, LassoCV, ElasticNetCV or GridSearchCV. The one-standard-error rule picks the largest α whose mean cross-validation error is within one standard error of the minimum, giving a simpler model with almost the same accuracy (on diabetes, 4 features instead of 10 for a test R² change of 0.487 to 0.481).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does ridge actually shrink?</summary><div class="qa-body">It shrinks the least-squares solution along each eigen-direction of XᵀX by the factor d²/(d² + λ). Directions in which the data varies a lot are kept almost entirely; directions with little variation, where OLS was guessing, are shrunk almost to zero. Correlated columns create exactly such a weak direction (their difference), which is why ridge cures multicollinearity.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can a ridge coefficient increase as λ increases?</summary><div class="qa-body">Yes. Ridge guarantees that the length of the weight vector shrinks, not every coordinate. On the houses the size weight went 6.208 → 6.358 at λ = 1 before falling, because the distrusted direction "more bedrooms, same size" carried a negative amount of size. Coefficients can even change sign along the path.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the effective degrees of freedom of ridge?</summary><div class="qa-body">df(λ) = Σⱼ d²ⱼ/(d²ⱼ + λ), the sum of the shrink factors. It falls smoothly from p at λ = 0 to 0 as λ grows. On the houses at λ = 5 it is 0.938 + 0.060 ≈ 1, so the two-weight ridge model has the flexibility of about one free weight.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you choose ridge, lasso or elastic net?</summary><div class="qa-body">Ridge when many features each have a small real effect, or there is strong multicollinearity and prediction is the goal. Lasso when you expect a few strong features among many useless ones and want a sparse, explainable model. Elastic net when there are groups of correlated useful features or many more features than rows; if unsure, tune l1_ratio by cross-validation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the Bayesian interpretations of ridge and lasso?</summary><div class="qa-body">Both are maximum a posteriori estimates under a Gaussian likelihood. Ridge corresponds to a normal prior centred at zero on each weight; lasso corresponds to a Laplace prior, which has a sharp peak at zero and therefore puts the most probable value of weak weights exactly at zero. Elastic net combines both.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is the intercept not penalised?</summary><div class="qa-body">Penalising it would make predictions depend on the origin of the measurements (prices in lakh or rupees, size from 0 or from 600 sq ft), which is meaningless. scikit-learn centres X and y, solves for the slopes, then sets b₀ = ȳ − x̄·w.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is α in Lasso related to C in LogisticRegression and alpha in Ridge?</summary><div class="qa-body">Lasso and ElasticNet multiply the penalty against a (1/2n)-scaled squared error; Ridge multiplies it against the unscaled squared error, so ElasticNet with l1_ratio near 0 at α equals Ridge at n·α. LogisticRegression uses C, roughly the inverse of α: a larger C means a weaker penalty.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Lasso kept 6 of 210 columns, including some pure-noise columns. Why, and what would you do?</summary><div class="qa-body">With 200 noise columns, a few will correlate with the target by chance in the training rows, enough to beat α. Lasso's selection is not reliable when features are many and correlated. Check stability across bootstrap resamples, use the one-standard-error α for a sparser model, consider adaptive or relaxed lasso, and validate the chosen features on fresh data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can you report p-values for lasso coefficients?</summary><div class="qa-body">Not with the ordinary least-squares formulas, and not by refitting OLS on the lasso-selected features with the same data, because the selection step used that data and the resulting p-values are too optimistic. Use sample splitting (select on one half, test on the other) or dedicated post-selection inference methods.</div></details>
</main>
`
});
