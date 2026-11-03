// notes/ml/ml_regularization.js — Regularization
Object.assign(TOPIC_CONTENT, {
  "ml_regularization": `<main>
  <h1>Regularization</h1>
  <div class="where"><span>Machine Learning</span><span>Foundations</span><span>Regularization</span></div>
  <p class="lead">Regularization means adding a fine for complexity to the thing a model minimises, so that a model with many features or many parameters cannot fit the random noise in its training rows. Without it, a flexible model memorises its training data and fails on new data; with it, you can keep all your features and let one knob, λ, decide how cautious the model should be. It is used in almost every real model: ridge and lasso regression, logistic regression (where it is switched on by default), SVMs, gradient boosting and neural networks all have a regularization setting, and interviewers ask about it constantly ("why does L1 give sparse weights?"). Our running example is again the ten flats in Pune from the earlier Foundations notes, now with every column the property portal records: built-up area, carpet area, bedrooms, building age and locality (Baner, Kothrud or Hadapsar). Several of these columns say almost the same thing, which is exactly the situation where regularization earns its keep.</p>

  <h2 id="rg-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Regularization</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">The idea</div>
        <ul>
          <li>Minimise loss + λ × size of the weights</li>
          <li>λ = 0: plain fit; λ huge: predict the average</li>
          <li>Trades a little bias for less variance</li>
          <li>Intercept is never penalised</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">The penalties</div>
        <ul>
          <li><b>L2 / ridge</b> Σw²: shrinks all, never to zero; shares among twins</li>
          <li><b>L1 / lasso</b> Σ|w|: sets weak weights to exactly zero</li>
          <li><b>Elastic Net</b>: both; sparse and keeps groups</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Using it right</div>
        <ul>
          <li>Standardize features first</li>
          <li>Choose λ by cross-validation (log grid, 1-SE rule)</li>
          <li>sklearn: bigger alpha = stronger; bigger C = weaker</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Other forms</div>
        <ul>
          <li>Pruning, max_depth, boosting learning rate</li>
          <li>Early stopping ≈ L2</li>
          <li>Input noise = ridge; dropout; augmentation</li>
          <li>Penalty = prior belief (L2 Gaussian, L1 Laplace)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="rg-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Regularize</span><span class="rm-sub">huge, unstable weights that fit noise</span></div></div>
      <div class="rm-item rm-done" data-target="rg-idea"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Penalty Idea</span><span class="rm-sub">loss + λ × size of the weights</span></div></div>
      <div class="rm-item rm-done" data-target="rg-l2"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Ridge (L2) Regression</span><span class="rm-sub">shrinking every weight, weight decay</span></div></div>
      <div class="rm-item rm-done" data-target="rg-l1"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Lasso (L1) and Sparsity</span><span class="rm-sub">switching weak features off</span></div></div>
      <div class="rm-item rm-done" data-target="rg-geom"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Why L1 Gives Zeros: the Geometry</span><span class="rm-sub">the diamond and the circle</span></div></div>
      <div class="rm-item rm-done" data-target="rg-enet"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Elastic Net</span><span class="rm-sub">mixing L1 and L2</span></div></div>
      <div class="rm-item rm-done" data-target="rg-scale"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Scale Before You Penalise</span><span class="rm-sub">why units change the answer</span></div></div>
      <div class="rm-item rm-done" data-target="rg-cv"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Choosing λ: Cross-Validation and the Path</span><span class="rm-sub">how strong the penalty should be</span></div></div>
      <div class="rm-item rm-done" data-target="rg-bv"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">The Bias–Variance Trade</span><span class="rm-sub">when shrinking pays and when it hurts</span></div></div>
      <div class="rm-item rm-done" data-target="rg-models"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Regularization in Other Models</span><span class="rm-sub">C, pruning, boosting</span></div></div>
      <div class="rm-item rm-done" data-target="rg-implicit"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Regularizing Without a Penalty Term</span><span class="rm-sub">early stopping, noise, dropout, augmentation</span></div></div>
      <div class="rm-item rm-done" data-target="rg-bayes"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">The Penalty as a Prior</span><span class="rm-sub">what λ actually means</span></div></div>
      <div class="rm-item rm-done" data-target="rg-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">scaling, C vs alpha, the intercept</span></div></div>
      <div class="rm-item rm-done" data-target="rg-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, formulas, comparison tables</span></div></div>
      <div class="rm-item rm-done" data-target="rg-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on regularization</span></div></div>
    </div>
  </div>

  <h2 id="rg-why"><span class="num">01</span>Why Regularize</h2>
  <p>Linear regression picks the weights that make the training error as small as possible. That sounds like exactly what we want, but "as small as possible on these particular rows" is not the same as "good on new rows". When a model has a lot of freedom compared with the amount of data, it can lower its training error by fitting the random noise in those rows, and that noise will not be there next time. The <a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a> note called this <strong>high variance</strong>. The tell-tale sign in a linear model is the weights: they become very large, often with opposite signs that cancel each other out.</p>
  <p>The flats show it in miniature. The portal records two areas for every flat: the built-up area (5 to 14, in hundreds of square feet) and the carpet area, the floor you can actually walk on, which is about 80% of it. The two columns are near-copies of each other. The honest answer is simple: price rises by about ₹6 lakh per 100 sq ft of built-up area, so any pair of weights with w₁ + 0.8·w₂ ≈ 6 predicts well, for example (6, 0) or (3, 3.75). Here is what least squares actually picks, first on all ten flats and then with one flat left out each time:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression, Ridge

area   = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14], dtype=float)       # built-up, 100 sq ft
carpet = np.array([4.1, 4.7, 5.6, 6.5, 7.1, 8.0, 8.9, 9.6, 10.3, 11.3])   # about 0.8 x area
price  = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96], dtype=float)
X = np.c_[area, carpet]
print("correlation:", np.corrcoef(area, carpet)[0, 1].round(4))
for left_out in [None, "A", "J", "E"]:                  # refit with one flat removed
    keep = np.array([f != left_out for f in "ABCDEFGHIJ"])
    ols = LinearRegression().fit(X[keep], price[keep]).coef_
    rdg = Ridge(alpha=1).fit(X[keep], price[keep]).coef_
    print(f"without {left_out or '-'}:  OLS w = {ols.round(2)}   ridge w = {rdg.round(2)}")</div>
  <div class="fx" data-lang="text">correlation: 0.9993
without -:  OLS w = [ 17.61 -14.5 ]   ridge w = [4.19 2.2 ]
without A:  OLS w = [ 16.21 -12.84]   ridge w = [3.9  2.31]
without J:  OLS w = [ 23.36 -22.09]   ridge w = [4.21 1.96]
without E:  OLS w = [ 15.14 -11.4 ]   ridge w = [4.02 2.44]</div>
  <p>On all ten flats, least squares chooses (17.61, −14.50). Check: 17.61 − 0.8 × 14.50 = 6.01, so the predictions are fine. But the weights are absurd: "each 100 sq ft of built-up area adds ₹17.6 lakh, and each 100 sq ft of carpet area <em>removes</em> ₹14.5 lakh". Drop flat J and they become (23.36, −22.09); drop flat A and they become (16.21, −12.84). Nearly identical datasets, wildly different weights. The ridge column, which section 03 explains, gives about (4, 2.2) every time: both areas share the credit, and the answer barely depends on which flats are present.</p>
  <p>Why does least squares wobble so much? Because the two columns are nearly the same, there is one direction in weight space, "more built-up, less carpet", that barely changes the predictions on these ten rows. Moving the weights along it costs almost nothing in training error, so tiny bits of noise in the prices can push the weights a long way along it. Regularization puts a price on moving in that direction.</p>
  <p>The same thing happens whenever there are many features compared with rows. Below, 25 training rows have 20 features, of which only the first three really matter; least squares has 21 numbers to set from 25 rows.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.metrics import r2_score

rng = np.random.default_rng(0)
X = rng.normal(size=(1025, 20))
true_w = np.zeros(20); true_w[:3] = [3, -2, 1.5]       # only 3 of 20 features matter
y = X @ true_w + rng.normal(0, 2, 1025)
Xtr, ytr, Xte, yte = X[:25], y[:25], X[25:], y[25:]    # 25 training rows, 1,000 test rows
for name, m in [("OLS       ", LinearRegression()), ("Ridge λ=10", Ridge(alpha=10))]:
    m.fit(Xtr, ytr)
    print(f"{name} train R2 {r2_score(ytr, m.predict(Xtr)):.3f}  test R2 {r2_score(yte, m.predict(Xte)):7.3f}"
          f"  sum|w| {np.abs(m.coef_).sum():5.1f}")</div>
  <div class="fx" data-lang="text">OLS        train R2 0.985  test R2 -16.700  sum|w|  72.9
Ridge λ=10 train R2 0.786  test R2   0.403  sum|w|   9.1</div>
  <p>Least squares explains 98.5% of the training variance and then scores R² = −16.7 on 1,000 new rows, far worse than simply predicting the average every time (R² = 0). Its weights add up to 72.9 in size, against a true total of 6.5. With a penalty (λ = 10), the training fit drops to 0.786 but the test R² rises to 0.403, and the weights are calm. Giving up a little training fit bought a lot of test fit. Think of a student who memorises last year's answer key: 100% on last year's paper, failure on this year's. A teacher who deducts marks for overly specific answers pushes students towards the general rule. That deduction is regularization, and how strict the teacher is, is λ. The alternative, deleting features by hand until the model stops overfitting, is slow, throws away features that each carry a little signal, and is itself a form of overfitting when the same data decide which to drop.</p>

  <h2 id="rg-idea"><span class="num">02</span>The Penalty Idea</h2>
  <p>The twin-area weights (17.6, −14.5) fit the training flats as well as the calm pair (4, 2.2) does, so least squares has no reason to prefer the calm one. To make it prefer small weights, we change what it minimises. Keep the loss, add a second term that grows with the size of the weights, and minimise the sum:</p>
  <p style="text-align:center"><strong>J(w) = Loss(w) + λ · Ω(w)</strong></p>
  <p>The loss measures misfit on the training rows (for regression, the residual sum of squares, RSS = Σ(yᵢ − ŷᵢ)²). Ω(w) is the <strong>penalty</strong> or <strong>regularizer</strong>. The two standard choices are the <strong>L2 penalty</strong>, Ω = Σwⱼ² (the sum of squared weights), and the <strong>L1 penalty</strong>, Ω = Σ|wⱼ| (the sum of their sizes). λ (lambda) is the <strong>regularization strength</strong>, a number you choose; scikit-learn calls it <code>alpha</code>. Regularization is this whole idea: adding a penalty on complexity to the training objective so the model only uses large weights when they buy a big enough drop in the loss.</p>
  <p>Think of it as a negotiation, or as a fine on spending. The loss wants weights that fit the rows; the penalty wants weights near zero. A weight may grow large only if the reduction in loss it buys is bigger than the fine it costs. The two ends of the dial are easy to picture. At λ = 0 there is no fine and we get plain least squares. As λ grows towards infinity any non-zero weight costs too much, every weight goes to 0, and the model predicts the same price for every flat: the average, ₹67 lakh. In between lies a smooth slide from "flexible" to "simple", and section 08 shows how to pick a point on it.</p>
  <p>Notice that the intercept b is left out of Ω. The intercept just sets the average level of the predictions; penalising it would drag every flat's price towards ₹0 for no reason (Common Mistakes shows the damage). Penalising the slopes instead pulls the model towards "every flat gets the average price", which is the sensible simple model. scikit-learn's <code>Ridge</code>, <code>Lasso</code> and <code>ElasticNet</code> never penalise <code>intercept_</code>. Also remember that the penalty is a training device only: when you report a model's error on validation or test data you report the plain loss, not J.</p>
  <p>How do the two penalties differ? Take the weights fitted for the flats in the bias–variance note, w = (5.78 per 100 sq ft, 5.09 for Baner, 2.11 for Kothrud). The L2 penalty is 5.78² + 5.09² + 2.11² = 33.41 + 25.91 + 4.45 = 63.77; the L1 penalty is 5.78 + 5.09 + 2.11 = 12.98. Look at the smallest weight, Kothrud's 2.11. In L2 it contributes only 7% of the total, because squaring makes small numbers tiny; in L1 it contributes 16%, because every unit of weight costs the same whether it is the first unit or the sixth. That one difference, squared versus absolute, explains everything that follows: L2 is most interested in cutting the largest weights, while L1 is just as happy to cut a small weight all the way to zero.</p>

  <h2 id="rg-l2"><span class="num">03</span>Ridge (L2) Regression</h2>
  <p>Linear regression with the L2 penalty is called <strong>ridge regression</strong> (statisticians also say Tikhonov regularization). To see exactly what the penalty does, take one feature and centred data (subtract the averages first, so no intercept is needed). Ridge minimises J(w) = Σ(yᵢ − w·xᵢ)² + λw². The slope of the first term with respect to w is −2Σxy + 2wΣx², the slope of the penalty is 2λw, and setting the total to zero gives</p>
  <p style="text-align:center"><strong>w_ridge = Σxy / (Σx² + λ)</strong></p>
  <p>Compare it with least squares, w_OLS = Σxy / Σx². Ridge simply adds λ to the denominator, so w_ridge = w_OLS × Σx²/(Σx² + λ): the least-squares answer multiplied by a <strong>shrinkage factor</strong> between 0 and 1. That factor can be as small as you like, but a fraction of a non-zero number is never exactly zero, so ridge never removes a feature. On the centred flats, Σxy = 495 and Σx² = 82.5 (computed in the earlier notes), so least squares gives 495/82.5 = 6 (in the code, <code>area</code> and <code>price</code> are the arrays from the first block), and ridge with λ = 27.5 gives 495/110 = 4.5, which keeps 75% of the slope. With λ = 82.5 (equal to Σx²) the slope is exactly halved to 3.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import Ridge

x, y = area - area.mean(), price - price.mean()        # centred: the intercept is not penalised
Sxy, Sxx = (x * y).sum(), (x * x).sum()                # 495 and 82.5
for lam in [0, 27.5, 82.5, 247.5]:
    hand = Sxy / (Sxx + lam)                           # w = Σxy / (Σx² + λ)
    skl = Ridge(alpha=lam).fit(area.reshape(-1, 1), price).coef_[0]
    print(f"λ={lam:&lt;6} hand w={hand:.4f}  sklearn w={skl:.4f}  kept {Sxx / (Sxx + lam):.0%}")</div>
  <div class="fx" data-lang="text">λ=0      hand w=6.0000  sklearn w=6.0000  kept 100%
λ=27.5   hand w=4.5000  sklearn w=4.5000  kept 75%
λ=82.5   hand w=3.0000  sklearn w=3.0000  kept 50%
λ=247.5  hand w=1.5000  sklearn w=1.5000  kept 25%</div>
  <p>The hand formula and <code>Ridge(alpha=λ)</code> agree to every digit, because sklearn's ridge minimises exactly RSS + α·Σw² with an unpenalised intercept. It is worth checking that ridge really wins its own game at λ = 27.5. The least-squares slope 6 has RSS 46 but a penalty of 27.5 × 36 = 990, so J = 1036. The ridge slope 4.5 has a much worse RSS (231.6) but a penalty of only 556.9, so J = 788.5, which is lower. Ridge deliberately accepts a worse fit because the weight is cheaper. (The flats' area slope does not actually <em>need</em> shrinking, because it is a strong, well-measured effect; section 09 shows when shrinking pays.)</p>
  <p>The same penalty looks different, and gets a different name, when the model is trained by gradient descent instead of a formula. The gradient of J is the gradient of the RSS plus 2λw, so one step with learning rate η becomes w ← w − η∇RSS − 2ηλw, which rearranges to</p>
  <p style="text-align:center"><strong>w ← (1 − 2ηλ)·w − η·∇RSS</strong></p>
  <p>Before the usual data step, every weight is multiplied by (1 − 2ηλ), a number just below 1. The weight "decays" a little at every step unless the data keep pushing it back up, which is why neural-network libraries call L2 regularization <strong>weight decay</strong>. With η = 0.004 and λ = 27.5 the decay factor is 0.78. Starting at w = 0, the first step gives 0.78 × 0 + 0.004 × 990 = 3.96, and the walk settles on the ridge answer:</p>
  <div class="fx" data-lang="py">import numpy as np

x, y = area - 9.5, price - 67                          # centred flats
lam, eta, w = 27.5, 0.004, 0.0
for step in range(1, 11):
    grad_rss = -2 * (x * (y - w * x)).sum()            # slope of the data loss
    w = (1 - 2 * eta * lam) * w - eta * grad_rss       # shrink by 0.78, then the data step
    if step in (1, 2, 3, 10):
        print(f"step {step:2d}: w = {w:.4f}")</div>
  <div class="fx" data-lang="text">step  1: w = 3.9600
step  2: w = 4.4352
step  3: w = 4.4922
step 10: w = 4.5000</div>
  <p>With many features the same derivation in matrix form gives w = (XᵀX + λI)⁻¹Xᵀy: λ is added to every diagonal entry of XᵀX. This has a useful side effect: XᵀX + λI can always be inverted, even when there are more features than rows or two columns are exact copies, situations in which plain least squares has no unique answer. The cleanest way to see what ridge does with many features is through the main directions (eigenvectors) of XᵀX. Each direction has an eigenvalue d that measures how firmly the data pin down the weights in that direction. Along each direction least squares keeps 100% of its estimate; ridge keeps <strong>d/(d + λ)</strong>. For the twin areas the direction "both areas up together" has d = 135.4 and is well pinned by the data, while the direction "built-up up, carpet down" has d = 0.042 and is barely pinned at all. With λ = 1, ridge keeps 135.4/136.4 = 99.3% of the first and only 0.042/1.042 = 4% of the second. It almost deletes exactly the unstable direction that noise was exploiting and leaves the well-measured one nearly untouched, which is why its twin weights did not jump about when a flat was dropped. Correlated features end up <em>sharing</em> the weight.</p>

  <h2 id="rg-l1"><span class="num">04</span>Lasso (L1) and Sparsity</h2>
  <p>Ridge calmed the twin weights but kept both, and in the 20-feature example it kept all 17 useless features, just with small weights. Often we would rather have a model that says "carpet area adds nothing once you know built-up area" by giving it a weight of exactly zero. A model in which many weights are exactly zero is called <strong>sparse</strong>, and the L1 penalty produces one. Linear regression with the L1 penalty is the <strong>lasso</strong> (Least Absolute Shrinkage and Selection Operator, Tibshirani 1996).</p>
  <p>Take the same one-feature, centred setting, now minimising J(w) = ½Σ(yᵢ − w·xᵢ)² + λ|w| (the ½ just makes the algebra tidier). The trouble is that |w| has a sharp corner at zero: its slope is +1 for positive w, −1 for negative w, and at w = 0 it can be anything between −1 and +1 (a <strong>subgradient</strong>). Working through the three cases: if w is positive the best value is (Σxy − λ)/Σx², which is only valid if Σxy &gt; λ; if negative, it is (Σxy + λ)/Σx², valid only if Σxy &lt; −λ; and w = 0 is best whenever the data's push Σxy lies between −λ and λ, because the corner of the penalty can absorb it. All three cases fit in one line using the <strong>soft-threshold</strong> function S(z, λ) = sign(z)·max(|z| − λ, 0):</p>
  <p style="text-align:center"><strong>w_lasso = S(Σxy, λ) / Σx²</strong></p>
  <p>Ridge <em>divides</em> the least-squares answer; lasso <em>subtracts</em> a fixed amount λ from the data's push, and if the push is smaller than λ the answer is exactly zero. On the flats: λ = 165 gives (495 − 165)/82.5 = 4; λ = 330 gives 2; λ = 495 gives exactly 0, and so does anything larger. sklearn's <code>Lasso</code> writes the loss as (1/2n)·RSS + α·Σ|w|, so its α equals our λ divided by n = 10:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import Lasso

soft = lambda z, t: np.sign(z) * max(abs(z) - t, 0)    # soft threshold S(z, t)
for lam in [0, 165, 330, 495, 600]:
    hand = soft(495, lam) / 82.5                       # lasso: ½RSS + λ|w|
    skl = Lasso(alpha=lam / 10).fit(area.reshape(-1, 1), price).coef_[0] if lam else hand
    print(f"λ={lam:&lt;4} lasso hand={hand:.3f}  sklearn={skl:.3f}   ridge={495 / (82.5 + lam):.3f}")</div>
  <div class="fx" data-lang="text">λ=0    lasso hand=6.000  sklearn=6.000   ridge=6.000
λ=165  lasso hand=4.000  sklearn=4.000   ridge=2.000
λ=330  lasso hand=2.000  sklearn=2.000   ridge=1.200
λ=495  lasso hand=0.000  sklearn=0.000   ridge=0.857
λ=600  lasso hand=0.000  sklearn=0.000   ridge=0.725</div>
  <p>The lasso slope falls in a straight line and hits zero at λ = 495; the ridge slope flattens out and never gets there (0.725 even at λ = 600). The two columns use slightly different scalings of the loss, so compare their shapes rather than their exact values.</p>
  <figure class="viz"><svg viewBox="0 0 620 250" width="620">
<line x1="40" y1="125" x2="330" y2="125" stroke="currentColor" stroke-opacity="0.5"/><line x1="185" y1="20" x2="185" y2="230" stroke="currentColor" stroke-opacity="0.5"/>
<text x="326" y="141" class="tm" font-size="11">z (least-squares w)</text><text x="191" y="28" class="tm" font-size="11">regularized w</text>
<line x1="65" y1="245" x2="305" y2="5" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.6"/>
<line x1="65" y1="185" x2="305" y2="65" class="sb" stroke-width="2.5"/>
<polyline points="65,215 155,125 215,125 305,35" fill="none" class="sr" stroke-width="2.5"/>
<line x1="155" y1="121" x2="155" y2="129" stroke="currentColor"/><line x1="215" y1="121" x2="215" y2="129" stroke="currentColor"/>
<text x="155" y="146" text-anchor="middle" font-size="10.5">−λ</text><text x="215" y="146" text-anchor="middle" font-size="10.5">+λ</text>
<text x="300" y="20" class="tm" font-size="11">OLS (no penalty)</text>
<text x="308" y="68" class="tb" font-size="11">ridge</text><text x="308" y="40" class="tr" font-size="11">lasso</text>
<text x="185" y="112" text-anchor="middle" class="tr" font-size="10.5">dead zone: w = 0</text>
<text x="360" y="60" font-size="12">Ridge: w = z · d/(d + λ)</text>
<text x="360" y="78" class="tm" font-size="11">a smaller slope through 0;</text>
<text x="360" y="94" class="tm" font-size="11">touches 0 only at z = 0</text>
<text x="360" y="130" font-size="12">Lasso: w = S(z, λ)</text>
<text x="360" y="148" class="tm" font-size="11">flat at 0 for |z| ≤ λ,</text>
<text x="360" y="164" class="tm" font-size="11">then OLS shifted by λ</text>
<text x="360" y="200" font-size="12">Both shrink big weights;</text>
<text x="360" y="218" font-size="12">only lasso zeroes small ones.</text>
</svg><figcaption>How each penalty maps the least-squares weight z to the regularized weight (one feature, or uncorrelated features). Ridge is a straight line of smaller slope; lasso is "soft thresholding": a dead zone around 0 and a constant shift outside it.</figcaption></figure>
  <p>The figure draws the same contrast for any least-squares weight z. Ridge (a straight line of smaller slope through the origin) shrinks every weight by the same proportion and touches zero only when z itself is zero. Lasso has a "dead zone" between −λ and +λ where the weight is exactly zero, and outside it the weight is the least-squares value shifted towards zero by λ.</p>
  <p>Why the zeros, intuitively? During training the penalty pulls each weight towards zero, and the strength of that pull is the slope of the penalty. For L2 the slope of λw² is 2λw, which is proportional to the weight: with λ = 1, a weight of 4 is pulled with force 8, but a weight of 0.01 with force only 0.02. As a weight gets small, the L2 pull fades away, so the weight settles at some small non-zero value where the data's push balances the weak pull. For L1 the slope of λ|w| is a constant λ: a weight of 0.01 is pulled just as hard as a weight of 4. If the data's push on a weight is weaker than λ all the way down, nothing can hold it up, and it lands on exactly zero and stays there. An everyday picture: L2 is a percentage tax, where small earners pay little and survive; L1 is a fixed licence fee of ₹500, where any business earning less than ₹500 is better off closing. Lasso closes the weak features. Reading off which weights are non-zero is therefore a built-in form of <strong>feature selection</strong>.</p>
  <p>Lasso has no closed-form solution with several features; sklearn solves it by <strong>coordinate descent</strong>, which repeatedly soft-thresholds one weight at a time while holding the others fixed (details in <a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a>). Two limitations matter. With more features than rows, lasso keeps at most n non-zero weights. And when two features are near-copies, lasso tends to keep one and zero the other, and which one wins can flip with a tiny change in the data, so treat its selection as a shortlist, not as proof that a feature is useless.</p>

  <h2 id="rg-geom"><span class="num">05</span>Why L1 Gives Zeros: the Geometry</h2>
  <p>The pull argument explains zeros for one weight. With two or more weights competing, such as built-up and carpet area, there is a picture that interviewers expect you to draw. It starts from a second, equivalent way to write each penalty: instead of "add λ × penalty", say "minimise the loss, but the weights must stay inside a budget", Σw² ≤ t for ridge or Σ|w| ≤ t for lasso. For every λ there is a budget t that gives the same answer; a bigger λ means a smaller budget.</p>
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
</svg><figcaption>Loss contours (red ovals) grow from the least-squares point until they first touch the allowed region. The diamond is usually first touched at a corner, where one weight is exactly 0; the circle is touched at a generic point.</figcaption></figure>
  <p>Read the figure like this. The axes are the two weights. The red dot is the least-squares answer, which lies outside the budget. Each red oval is a set of weight pairs with the same RSS, and ovals further from the dot have higher RSS. Imagine the ovals growing outwards from the dot: the solution is the first point where an oval touches the blue allowed region. For L1 the region Σ|w| ≤ t is a diamond whose corners sit exactly on the axes. A corner sticks out, so an oval approaching from almost any direction hits a corner first, and at a corner one of the weights is exactly zero. For L2 the region is a round disc with no corners, so the touching point is almost never on an axis and both weights stay non-zero. In more dimensions the L1 region has even more corners and edges, so sparsity becomes even more likely. For the twin areas the ovals are extremely long and thin, lying along the line w₁ + 0.8w₂ = constant; the disc touches near the middle (both areas share the weight), the diamond at a corner (one area kept).</p>
  <p>The contrast is easiest to see by hand when features are uncorrelated and scaled so that XᵀX is the identity matrix. Then the problem splits into one separate problem per weight: ridge gives w = z/(1 + λ) and lasso gives w = S(z, λ), where z is the least-squares weight. Take z = (3, 0.8, −0.3) and λ = 1, think of a strong feature like area, a modest one like locality and a weak one like bedrooms. Ridge gives (1.5, 0.4, −0.15): everything halved. Lasso gives (2, 0, 0): the strong weight is reduced by 1 and the two weak ones are removed. Two lessons: ridge shrinks big weights more in absolute terms (3 → 1.5) than lasso does (3 → 2), because it shrinks proportionally while lasso subtracts a constant; and only lasso removes features.</p>
  <p>Textbooks mention a third penalty, L0, which simply counts the non-zero weights. It is exactly "best subset selection", a combinatorial search over all 2ᵖ subsets of features (64 for the flats' six columns, about 10³⁰ for 100 columns). L1 is the closest <em>convex</em> penalty to L0, which is why lasso can be solved quickly and still produces zeros. L2 is smooth and convex but produces no zeros.</p>

  <h2 id="rg-enet"><span class="num">06</span>Elastic Net</h2>
  <p>For the twin areas we would like two things at once: drop columns that are truly useless, but treat the two areas as a team instead of letting chance pick one of them. Lasso does the first, ridge does the second, and neither does both. <strong>Elastic Net</strong> (Zou and Hastie, 2005) simply uses both penalties together: J(w) = ½RSS + λ₁Σ|w| + ½λ₂Σw². The same case analysis as for lasso gives, for one feature,</p>
  <p style="text-align:center"><strong>w_enet = S(Σxy, λ₁) / (Σx² + λ₂)</strong></p>
  <p>The L1 part soft-thresholds the numerator (so it can still give an exact zero), and the L2 part enlarges the denominator (extra proportional shrinkage). On the flats with λ₁ = 165 and λ₂ = 82.5: S(495, 165) = 330, divided by 82.5 + 82.5 = 165, gives 2. sklearn's <code>ElasticNet(alpha, l1_ratio)</code> uses an overall strength α and a mix r = <code>l1_ratio</code>; matching the formulas gives α = (λ₁ + λ₂)/n = 24.75 and r = λ₁/(λ₁ + λ₂) = 0.667. An <code>l1_ratio</code> of 1 is pure lasso and 0 is pure ridge.</p>
  <div class="fx" data-lang="py">from sklearn.linear_model import ElasticNet

lam1, lam2 = 165, 82.5                                 # ½RSS + λ1|w| + ½λ2 w²
hand = max(495 - lam1, 0) / (82.5 + lam2)
alpha, r = (lam1 + lam2) / 10, lam1 / (lam1 + lam2)    # sklearn's alpha and l1_ratio
skl = ElasticNet(alpha=alpha, l1_ratio=r).fit(area.reshape(-1, 1), price).coef_[0]
print(f"hand w = {hand:.3f}   sklearn w = {skl:.3f}   (alpha={alpha}, l1_ratio={r:.3f})")</div>
  <div class="fx" data-lang="text">hand w = 2.000   sklearn w = 2.000   (alpha=24.75, l1_ratio=0.667)</div>
  <p>The real reason to use Elastic Net is the <strong>grouping effect</strong> with correlated features. Below, two temperature sensors read almost the same value (like our two areas, but with 100 rows), and the target depends on temperature with a total effect of 3 per degree. Each model is refitted on three bootstrap resamples of the data (rows drawn at random with replacement) to see which weights are stable:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet

rng = np.random.default_rng(1)
temp_a = rng.normal(25, 5, 100)                        # sensor A
temp_b = temp_a + rng.normal(0, 0.05, 100)             # sensor B: a near-copy of A
y = 3 * temp_a + rng.normal(0, 3, 100)                 # true total effect: 3 per degree
X = np.c_[temp_a, temp_b]
for name, m in {"OLS  ": LinearRegression(), "Ridge": Ridge(alpha=10),
                "Lasso": Lasso(alpha=1), "ENet ": ElasticNet(alpha=1, l1_ratio=0.5)}.items():
    fits = []
    for b in range(3):                                 # three bootstrap resamples
        idx = rng.integers(0, 100, 100)
        w = m.fit(X[idx], y[idx]).coef_
        fits.append(f"[{w[0]:5.2f}, {w[1]:5.2f}]")
    print(name, "  ".join(fits))</div>
  <div class="fx" data-lang="text">OLS   [-3.78,  6.78]  [-3.68,  6.65]  [-0.41,  3.37]
Ridge [ 1.49,  1.52]  [ 1.59,  1.39]  [ 1.62,  1.38]
Lasso [ 2.93,  0.00]  [ 2.97,  0.00]  [ 2.86,  0.00]
ENet  [ 1.47,  1.47]  [ 1.50,  1.45]  [ 1.42,  1.40]</div>
  <p>Every pair of weights adds up to about 3, the true effect, but the way it is split differs completely. Least squares swings wildly and even gives one sensor a negative weight (−3.78 and 6.78), just like (17.6, −14.5) for the flats. Ridge and Elastic Net share the effect about evenly, run after run. Lasso gives all of it to sensor A; here A won every time, but which twin wins is decided by tiny noise, and on other data it flips. Elastic Net is therefore the usual choice when you have many correlated features, some of them useless, or more features than rows (it can select more than n features, which lasso cannot). Its cost is a second hyperparameter to tune, which <code>ElasticNetCV(l1_ratio=[0.1, 0.5, 0.9, 1])</code> does for you. One warning when reading papers: R's glmnet uses the name "alpha" for the mix and "lambda" for the strength, the opposite of sklearn.</p>

  <h2 id="rg-scale"><span class="num">07</span>Scale Before You Penalise</h2>
  <p>The penalty charges for the size of a weight. But the size of a weight depends on the units of its feature. The flats' area slope is 6 if area is measured in hundreds of square feet and 0.06 if it is measured in square feet, for exactly the same model. Does the penalty notice? Very much so. With area in hundreds of sq ft, Σx² = 82.5 and ridge at λ = 27.5 keeps 75% of the slope. In square feet every x is 100 times bigger, Σx² = 825,000, and the same λ keeps 825,000/825,027.5 = 99.997%:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import Ridge

for unit, x, ols_w in [("100 sq ft", area, 6.0), ("sq ft    ", 100 * area, 0.06)]:
    rdg = Ridge(alpha=27.5).fit(x.reshape(-1, 1), price)
    print(f"area in {unit}: ridge w = {rdg.coef_[0]:.6f}   share of the OLS slope kept {rdg.coef_[0] / ols_w:.5f}"
          f"   price for flat J = {rdg.predict(x[-1:].reshape(-1, 1))[0]:.2f}")</div>
  <div class="fx" data-lang="text">area in 100 sq ft: ridge w = 4.500000   share of the OLS slope kept 0.75000   price for flat J = 87.25
area in sq ft    : ridge w = 0.059998   share of the OLS slope kept 0.99997   price for flat J = 94.00</div>
  <p>Nothing about the flats changed, only the unit, yet the penalty went from strong to almost absent, and flat J's predicted price moved from ₹87.25 lakh to ₹94.00 lakh. Without a penalty the predictions would be identical in both units; with a penalty they are not. With several features this becomes unfair. A feature measured in big numbers needs only a tiny weight, pays almost no penalty and escapes. A feature measured in small numbers needs a big weight, gets fined heavily and is shrunk or dropped, whatever its real importance. Here are 200 flats whose price depends on area (in square feet) and number of rooms (1 to 5), which matter about equally per standard deviation:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import Lasso
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

rng = np.random.default_rng(0)
area = rng.normal(1500, 400, 200)                      # square feet: numbers in the thousands
rooms = rng.integers(1, 6, 200).astype(float)          # 1 to 5: small numbers
price = 0.05 * area + 15 * rooms + rng.normal(0, 10, 200)
X = np.c_[area, rooms]
print("effect of +1 standard deviation:", (np.array([0.05, 15]) * X.std(axis=0)).round(1))
for a in [5, 15, 30]:
    w = Lasso(alpha=a).fit(X, price).coef_
    print(f"unscaled alpha={a:&lt;2}: w_area={w[0]:.3f}  w_rooms={w[1]:6.3f}")
print("scaled   alpha=5 : per-SD weights", make_pipeline(StandardScaler(), Lasso(alpha=5)).fit(X, price)[-1].coef_.round(2))</div>
  <div class="fx" data-lang="text">effect of +1 standard deviation: [19.2 21.3]
unscaled alpha=5 : w_area=0.046  w_rooms=12.434
unscaled alpha=15: w_area=0.045  w_rooms= 7.451
unscaled alpha=30: w_area=0.042  w_rooms= 0.000
scaled   alpha=5 : per-SD weights [12.6  15.79]</div>
  <p>Unscaled, the area weight is a tiny number (0.046) that the L1 penalty barely notices, while the rooms weight (12.4) is a big number that gets fined. As alpha grows, rooms is shrunk and finally removed at alpha = 30, even though it matters slightly more than area. After <code>StandardScaler</code>, which turns each column into mean 0 and standard deviation 1, both weights mean "effect per standard deviation" and are shrunk on equal terms (12.6 and 15.79).</p>
  <p>So: <strong>standardize every feature before L1, L2 or Elastic Net</strong>, and also before regularized logistic regression, SVMs and neural-network weight decay. Compute the mean and standard deviation on the training rows only, which in practice means putting the scaler and the model together in a <code>Pipeline</code> so that every cross-validation fold scales with its own training rows (<a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>). Tree-based models have no weight penalty and their splits ignore units, so they do not need scaling (<a class="xref" data-note="ml_features">Feature Engineering</a> covers the scalers in detail).</p>

  <h2 id="rg-cv"><span class="num">08</span>Choosing λ: Cross-Validation and the Path</h2>
  <p>So far we picked λ = 27.5 or 165 because the arithmetic was convenient. Which λ actually gives the best model? It cannot be learnt by minimising training error, because the training error is always lowest at λ = 0: no penalty means more freedom to fit. λ is a <strong>hyperparameter</strong>, chosen by how well the model does on rows it did not train on. The standard tool is cross-validation (<a class="xref" data-note="ml_splits">Train/Val/Test &amp; CV</a>): for each candidate λ, train on all folds but one, score on the held-out fold, and average. Because the useful range of λ spans several orders of magnitude, candidates are spaced on a log scale (0.01, 0.1, 1, 10, …).</p>
  <p>Let us give the model all six columns the portal has: area, carpet area, bedrooms, age, and two 0/1 columns for the localities Baner and Kothrud (Hadapsar is the baseline). Six weights from ten flats is a lot of freedom, and three of the columns (area, carpet area, bedrooms) are strongly correlated. With only ten rows, leave-one-out CV is the natural choice:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import LeaveOneOut, cross_val_score

area   = np.arange(5, 15, dtype=float)
carpet = np.array([4.1, 4.7, 5.6, 6.5, 7.1, 8.0, 8.9, 9.6, 10.3, 11.3])
beds   = np.array([1, 1, 2, 2, 2, 3, 3, 3, 3, 4], dtype=float)
age    = np.array([12, 3, 8, 15, 5, 10, 20, 2, 7, 4], dtype=float)
loc    = np.array(list("HBKHBKHBKB"))                  # Hadapsar, Baner, Kothrud
price  = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96], dtype=float)
X6 = np.c_[area, carpet, beds, age, loc == "B", loc == "K"].astype(float)
names = ["area", "carpet", "beds", "age", "baner", "kothrud"]

def loo(model):
    return -cross_val_score(model, X6, price, cv=LeaveOneOut(), scoring="neg_mean_squared_error").mean()

print(f"OLS, all 6 columns: LOOCV MSE {loo(LinearRegression()):.2f}")
for a in [0.01, 0.1, 1, 10]:
    print(f"ridge alpha={a:&lt;5}: LOOCV MSE {loo(make_pipeline(StandardScaler(), Ridge(alpha=a))):.2f}")
for a in [0.1, 0.3, 0.5, 1]:
    m = make_pipeline(StandardScaler(), Lasso(alpha=a, max_iter=100_000))
    kept = [n for n, c in zip(names, m.fit(X6, price)[-1].coef_) if c != 0]
    print(f"lasso alpha={a:&lt;4} : LOOCV MSE {loo(m):.2f}   keeps {kept}")</div>
  <div class="fx" data-lang="text">OLS, all 6 columns: LOOCV MSE 6.16
ridge alpha=0.01 : LOOCV MSE 6.05
ridge alpha=0.1  : LOOCV MSE 6.46
ridge alpha=1    : LOOCV MSE 8.81
ridge alpha=10   : LOOCV MSE 42.37
lasso alpha=0.1  : LOOCV MSE 4.93   keeps ['area', 'age', 'baner', 'kothrud']
lasso alpha=0.3  : LOOCV MSE 3.14   keeps ['area', 'age', 'baner']
lasso alpha=0.5  : LOOCV MSE 2.45   keeps ['area', 'age', 'baner']
lasso alpha=1    : LOOCV MSE 4.87   keeps ['area', 'age', 'baner']</div>
  <p>Plain least squares on all six columns has a leave-one-out error of 6.16. Ridge barely helps (6.05 at a tiny α, then worse), because shrinking every weight hurts the strong area effect as much as it calms the twins. Lasso helps a lot: at α = 0.5 it keeps area, age and Baner, drops carpet area, bedrooms and Kothrud, and scores 2.45, less than half the least-squares error. The best amount of penalty is in the middle; at α = 1 the useful weights are shrunk too much (4.87). Which penalty wins depends on the data: here a few columns matter and the rest are redundant, which is lasso's home ground. When every feature carries a little signal, ridge usually wins.</p>
  <p>The fold scores themselves are noisy, so the λ with the very lowest CV error is not much better than its neighbours. The <strong>1-SE rule</strong> (one standard error rule) takes that into account: among all λ whose CV error is within one standard error of the best, choose the largest, that is, the simplest model. Below, 150 diabetes patients have 10 real features plus 60 columns of pure noise:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_diabetes
from sklearn.linear_model import Ridge
from sklearn.model_selection import cross_val_score, KFold
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_diabetes(return_X_y=True)
rng = np.random.default_rng(0)
X = np.c_[X, rng.normal(size=(len(X), 60))][:150]      # 10 real + 60 noise columns, 150 rows
y = y[:150]
res = []
for a in [0.1, 1, 10, 30, 100, 300, 1000]:
    s = -cross_val_score(make_pipeline(StandardScaler(), Ridge(alpha=a)), X, y,
                         cv=KFold(5, shuffle=True, random_state=0), scoring="neg_mean_squared_error")
    res.append((a, s.mean(), s.std() / np.sqrt(5)))
    print(f"alpha {a:&lt;5} CV MSE {s.mean():6.0f}   standard error {s.std() / np.sqrt(5):4.0f}")
best = min(res, key=lambda r: r[1])
print("best alpha:", best[0], "  1-SE alpha:", max(a for a, m, se in res if m &lt;= best[1] + best[2]))</div>
  <div class="fx" data-lang="text">alpha 0.1   CV MSE   7654   standard error  615
alpha 1     CV MSE   7142   standard error  569
alpha 10    CV MSE   5374   standard error  404
alpha 30    CV MSE   4422   standard error  350
alpha 100   CV MSE   3978   standard error  312
alpha 300   CV MSE   4224   standard error  392
alpha 1000  CV MSE   4845   standard error  538
best alpha: 100   1-SE alpha: 300</div>
  <p>The CV error falls from 7654 at almost no penalty to a minimum of 3978 at α = 100, then rises. By hand: 3978 + 312 = 4290; α = 300 scores 4224, which is within that limit, and α = 1000 scores 4845, which is not. So the 1-SE choice is α = 300: a more strongly regularized model whose error is statistically indistinguishable from the best. sklearn has fast built-in searchers: <code>RidgeCV</code> (which by default uses an exact shortcut for leave-one-out, so no refitting is needed), <code>LassoCV</code>, <code>ElasticNetCV</code>, <code>LogisticRegressionCV</code>, and the general <code>GridSearchCV</code>. Remember that the CV score of the chosen λ is slightly optimistic, because you picked the best of many; report performance on an untouched test set or with nested CV.</p>
  <p>Cross-validation picks one λ. A <strong>regularization path</strong> shows the whole family at once: the fitted weights for every λ from huge down to tiny. For lasso the path has a clear starting point. A weight stays at zero as long as the data's push on it is within the penalty, and when every weight is zero the push on feature j is xⱼᵀy. In sklearn's scaling, every weight is zero exactly when α ≥ <strong>α_max = maxⱼ |xⱼᵀy| / n</strong>, and the feature with that largest push (the one most correlated with y) is the first to switch on as α falls. On the standardized six-column flats from above:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import lasso_path
from sklearn.preprocessing import StandardScaler

X = StandardScaler().fit_transform(X6); y = price - price.mean()
push = np.abs(X.T @ y) / len(y)                        # |x_jᵀ y| / n for every column
print("push:", dict(zip(names, push.round(2).tolist())))
alphas, coefs, _ = lasso_path(X, y, alphas=[17, 10, 2, 1, 0.5, 0.1], max_iter=100_000)
for a, c in zip(alphas, coefs.T):
    print(f"alpha {a:&gt;4}: " + " ".join(f"{v + 0.0:6.2f}" for v in c) + f"   on: {[n for n, v in zip(names, c) if v != 0]}")</div>
  <div class="fx" data-lang="text">push: {'area': 17.23, 'carpet': 17.18, 'beds': 16.15, 'age': 4.79, 'baner': 5.51, 'kothrud': 1.53}
alpha 17.0:   0.00   0.00   0.00   0.00   0.00   0.00   on: []
alpha 10.0:   7.23   0.00   0.00   0.00   0.00   0.00   on: ['area']
alpha  2.0:  15.17   0.00   0.00   0.00   0.28   0.00   on: ['area', 'baner']
alpha  1.0:  15.99   0.00   0.00  -0.46   0.75   0.00   on: ['area', 'age', 'baner']
alpha  0.5:  16.40   0.00   0.00  -0.73   0.95   0.00   on: ['area', 'age', 'baner']
alpha  0.1:  16.63   0.00   0.00  -0.50   1.72   0.43   on: ['area', 'age', 'baner', 'kothrud']</div>
  <p>α_max = 17.23 comes from area, so above 17.23 the model is empty and prices every flat at ₹67 lakh. Carpet area's push, 17.18, is almost as big, but once area is in the model the part of the price left for carpet area to explain is tiny, so it never enters; the same happens to bedrooms (16.15), which mostly repeats area. Baner enters next (by α = 2), then age (by α = 1, with the expected negative sign: older flats are cheaper), and Kothrud only at small α. The path explains the CV result: the best α, 0.5, sits in the stretch where exactly area, age and Baner are switched on. Each point on a path is a separate model fitted at that λ (sklearn computes them quickly by starting each fit from the previous answer, a "warm start"); it is not a story told over time.</p>
  <figure class="viz"><svg viewBox="0 0 660 260" width="660">
<line x1="40" y1="124.1" x2="310" y2="124.1" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="40" y1="30" x2="40" y2="230" stroke="currentColor" stroke-opacity="0.5"/>
<text x="175.0" y="18" text-anchor="middle" font-size="13" font-weight="700">Ridge path</text>
<text x="175.0" y="248" text-anchor="middle" class="tm" font-size="11">λ falls →  (10,000 to 0.1)</text>
<text x="36" y="128.1" text-anchor="end" class="tm" font-size="10">0</text>
<text x="36" y="57.5" text-anchor="end" class="tm" font-size="10">30</text>
<text x="36" y="198.7" text-anchor="end" class="tm" font-size="10">−30</text>
<polyline points="40.0,122.9 43.4,122.7 46.8,122.6 50.3,122.4 53.7,122.2 57.1,122.0 60.5,121.8 63.9,121.6 67.3,121.4 70.8,121.2 74.2,121.0 77.6,120.8 81.0,120.7 84.4,120.6 87.8,120.5 91.3,120.4 94.7,120.3 98.1,120.4 101.5,120.4 104.9,120.5 108.4,120.6 111.8,120.8 115.2,120.9 118.6,121.1 122.0,121.4 125.4,121.6 128.9,121.8 132.3,122.1 135.7,122.3 139.1,122.5 142.5,122.8 145.9,123.0 149.4,123.2 152.8,123.4 156.2,123.5 159.6,123.7 163.0,123.8 166.5,123.9 169.9,124.1 173.3,124.2 176.7,124.3 180.1,124.3 183.5,124.4 187.0,124.5 190.4,124.6 193.8,124.6 197.2,124.7 200.6,124.7 204.1,124.8 207.5,124.8 210.9,124.8 214.3,124.9 217.7,124.9 221.1,124.9 224.6,125.0 228.0,125.0 231.4,125.0 234.8,125.0 238.2,125.0 241.6,125.1 245.1,125.1 248.5,125.1 251.9,125.1 255.3,125.1 258.7,125.1 262.2,125.2 265.6,125.2 269.0,125.2 272.4,125.2 275.8,125.2 279.2,125.2 282.7,125.2 286.1,125.2 289.5,125.2 292.9,125.2 296.3,125.2 299.7,125.2 303.2,125.2 306.6,125.2 310.0,125.2" fill="none" stroke="currentColor" stroke-opacity="0.3" stroke-width="1.2"/>
<polyline points="40.0,124.0 43.4,124.0 46.8,124.0 50.3,124.0 53.7,124.1 57.1,124.2 60.5,124.3 63.9,124.4 67.3,124.6 70.8,124.8 74.2,125.0 77.6,125.4 81.0,125.8 84.4,126.3 87.8,126.8 91.3,127.5 94.7,128.2 98.1,129.0 101.5,129.9 104.9,130.9 108.4,131.9 111.8,133.0 115.2,134.1 118.6,135.2 122.0,136.4 125.4,137.5 128.9,138.6 132.3,139.7 135.7,140.7 139.1,141.7 142.5,142.6 145.9,143.5 149.4,144.3 152.8,145.0 156.2,145.6 159.6,146.2 163.0,146.7 166.5,147.2 169.9,147.6 173.3,148.0 176.7,148.3 180.1,148.6 183.5,148.9 187.0,149.1 190.4,149.3 193.8,149.5 197.2,149.7 200.6,149.8 204.1,149.9 207.5,150.0 210.9,150.1 214.3,150.2 217.7,150.3 221.1,150.4 224.6,150.4 228.0,150.5 231.4,150.5 234.8,150.6 238.2,150.6 241.6,150.7 245.1,150.7 248.5,150.7 251.9,150.8 255.3,150.8 258.7,150.8 262.2,150.8 265.6,150.8 269.0,150.9 272.4,150.9 275.8,150.9 279.2,150.9 282.7,150.9 286.1,150.9 289.5,150.9 292.9,150.9 296.3,150.9 299.7,150.9 303.2,150.9 306.6,150.9 310.0,150.9" fill="none" stroke="currentColor" stroke-opacity="0.3" stroke-width="1.2"/>
<polyline points="40.0,119.9 43.4,119.3 46.8,118.7 50.3,118.0 53.7,117.2 57.1,116.3 60.5,115.3 63.9,114.2 67.3,113.0 70.8,111.8 74.2,110.4 77.6,108.9 81.0,107.4 84.4,105.8 87.8,104.0 91.3,102.2 94.7,100.4 98.1,98.5 101.5,96.5 104.9,94.6 108.4,92.6 111.8,90.6 115.2,88.7 118.6,86.8 122.0,84.9 125.4,83.2 128.9,81.5 132.3,79.9 135.7,78.4 139.1,77.0 142.5,75.7 145.9,74.5 149.4,73.4 152.8,72.4 156.2,71.5 159.6,70.8 163.0,70.1 166.5,69.4 169.9,68.9 173.3,68.4 176.7,68.0 180.1,67.6 183.5,67.3 187.0,67.0 190.4,66.8 193.8,66.6 197.2,66.4 200.6,66.3 204.1,66.2 207.5,66.1 210.9,66.0 214.3,65.9 217.7,65.9 221.1,65.9 224.6,65.8 228.0,65.8 231.4,65.8 234.8,65.8 238.2,65.8 241.6,65.8 245.1,65.8 248.5,65.8 251.9,65.8 255.3,65.8 258.7,65.8 262.2,65.8 265.6,65.9 269.0,65.9 272.4,65.9 275.8,65.9 279.2,65.9 282.7,65.9 286.1,65.9 289.5,65.9 292.9,65.9 296.3,65.9 299.7,65.9 303.2,65.9 306.6,65.9 310.0,65.9" fill="none" class="sb" stroke-width="2"/>
<text x="314" y="69.9" font-size="10.5" class="tb">bmi</text>
<polyline points="40.0,121.0 43.4,120.6 46.8,120.1 50.3,119.6 53.7,119.0 57.1,118.4 60.5,117.7 63.9,116.9 67.3,116.1 70.8,115.2 74.2,114.3 77.6,113.3 81.0,112.3 84.4,111.2 87.8,110.1 91.3,109.0 94.7,107.8 98.1,106.7 101.5,105.5 104.9,104.3 108.4,103.1 111.8,102.0 115.2,100.9 118.6,99.8 122.0,98.8 125.4,97.8 128.9,96.9 132.3,96.0 135.7,95.2 139.1,94.4 142.5,93.7 145.9,93.1 149.4,92.5 152.8,92.0 156.2,91.5 159.6,91.1 163.0,90.7 166.5,90.4 169.9,90.1 173.3,89.9 176.7,89.6 180.1,89.4 183.5,89.3 187.0,89.1 190.4,89.0 193.8,88.8 197.2,88.7 200.6,88.6 204.1,88.6 207.5,88.5 210.9,88.4 214.3,88.3 217.7,88.3 221.1,88.2 224.6,88.2 228.0,88.2 231.4,88.1 234.8,88.1 238.2,88.1 241.6,88.0 245.1,88.0 248.5,88.0 251.9,88.0 255.3,87.9 258.7,87.9 262.2,87.9 265.6,87.9 269.0,87.9 272.4,87.9 275.8,87.9 279.2,87.9 282.7,87.9 286.1,87.9 289.5,87.8 292.9,87.8 296.3,87.8 299.7,87.8 303.2,87.8 306.6,87.8 310.0,87.8" fill="none" class="st" stroke-width="2"/>
<text x="314" y="91.8" font-size="10.5" class="tm">bp</text>
<polyline points="40.0,122.8 43.4,122.7 46.8,122.5 50.3,122.3 53.7,122.2 57.1,122.0 60.5,121.8 63.9,121.7 67.3,121.5 70.8,121.4 74.2,121.3 77.6,121.2 81.0,121.2 84.4,121.2 87.8,121.3 91.3,121.4 94.7,121.6 98.1,121.9 101.5,122.2 104.9,122.5 108.4,122.9 111.8,123.3 115.2,123.7 118.6,124.2 122.0,124.7 125.4,125.2 128.9,125.7 132.3,126.3 135.7,126.8 139.1,127.4 142.5,128.0 145.9,128.6 149.4,129.2 152.8,129.9 156.2,130.7 159.6,131.5 163.0,132.3 166.5,133.3 169.9,134.3 173.3,135.4 176.7,136.7 180.1,138.1 183.5,139.6 187.0,141.3 190.4,143.2 193.8,145.2 197.2,147.4 200.6,149.7 204.1,152.2 207.5,154.9 210.9,157.7 214.3,160.6 217.7,163.6 221.1,166.7 224.6,169.8 228.0,172.9 231.4,176.0 234.8,179.0 238.2,182.0 241.6,184.8 245.1,187.4 248.5,190.0 251.9,192.3 255.3,194.5 258.7,196.5 262.2,198.3 265.6,200.0 269.0,201.5 272.4,202.9 275.8,204.1 279.2,205.1 282.7,206.1 286.1,206.9 289.5,207.7 292.9,208.3 296.3,208.9 299.7,209.4 303.2,209.9 306.6,210.2 310.0,210.6" fill="none" class="sr" stroke-width="2"/>
<text x="314" y="214.6" font-size="10.5" class="tr">s1</text>
<polyline points="40.0,123.1 43.4,123.0 46.8,122.9 50.3,122.8 53.7,122.7 57.1,122.6 60.5,122.5 63.9,122.5 67.3,122.5 70.8,122.5 74.2,122.5 77.6,122.6 81.0,122.8 84.4,123.0 87.8,123.3 91.3,123.7 94.7,124.1 98.1,124.6 101.5,125.2 104.9,125.8 108.4,126.4 111.8,127.1 115.2,127.8 118.6,128.6 122.0,129.2 125.4,129.9 128.9,130.6 132.3,131.1 135.7,131.6 139.1,132.1 142.5,132.5 145.9,132.7 149.4,132.9 152.8,133.0 156.2,132.9 159.6,132.8 163.0,132.5 166.5,132.1 169.9,131.6 173.3,131.0 176.7,130.2 180.1,129.3 183.5,128.2 187.0,127.0 190.4,125.6 193.8,124.1 197.2,122.4 200.6,120.6 204.1,118.7 207.5,116.6 210.9,114.4 214.3,112.1 217.7,109.7 221.1,107.3 224.6,104.8 228.0,102.4 231.4,99.9 234.8,97.5 238.2,95.2 241.6,93.0 245.1,90.9 248.5,88.9 251.9,87.0 255.3,85.3 258.7,83.7 262.2,82.2 265.6,80.9 269.0,79.7 272.4,78.6 275.8,77.7 279.2,76.8 282.7,76.1 286.1,75.4 289.5,74.8 292.9,74.3 296.3,73.8 299.7,73.4 303.2,73.1 306.6,72.8 310.0,72.5" fill="none" stroke="currentColor" stroke-opacity="0.3" stroke-width="1.2"/>
<polyline points="40.0,126.9 43.4,127.2 46.8,127.6 50.3,128.1 53.7,128.6 57.1,129.1 60.5,129.7 63.9,130.3 67.3,131.0 70.8,131.7 74.2,132.4 77.6,133.1 81.0,133.9 84.4,134.7 87.8,135.5 91.3,136.3 94.7,137.2 98.1,137.9 101.5,138.7 104.9,139.5 108.4,140.2 111.8,140.9 115.2,141.5 118.6,142.1 122.0,142.7 125.4,143.2 128.9,143.6 132.3,144.0 135.7,144.4 139.1,144.7 142.5,144.9 145.9,145.1 149.4,145.3 152.8,145.4 156.2,145.4 159.6,145.4 163.0,145.4 166.5,145.3 169.9,145.1 173.3,144.8 176.7,144.5 180.1,144.1 183.5,143.6 187.0,143.1 190.4,142.4 193.8,141.7 197.2,140.9 200.6,139.9 204.1,138.9 207.5,137.9 210.9,136.7 214.3,135.5 217.7,134.2 221.1,132.9 224.6,131.6 228.0,130.2 231.4,128.9 234.8,127.6 238.2,126.3 241.6,125.1 245.1,123.9 248.5,122.8 251.9,121.8 255.3,120.9 258.7,120.0 262.2,119.2 265.6,118.4 269.0,117.8 272.4,117.2 275.8,116.7 279.2,116.2 282.7,115.8 286.1,115.4 289.5,115.1 292.9,114.8 296.3,114.5 299.7,114.3 303.2,114.1 306.6,113.9 310.0,113.8" fill="none" class="sr" stroke-width="2"/>
<text x="314" y="117.8" font-size="10.5" class="tr">s3</text>
<polyline points="40.0,121.2 43.4,120.9 46.8,120.5 50.3,120.0 53.7,119.5 57.1,119.0 60.5,118.5 63.9,117.9 67.3,117.4 70.8,116.8 74.2,116.1 77.6,115.5 81.0,114.9 84.4,114.4 87.8,113.8 91.3,113.3 94.7,112.8 98.1,112.4 101.5,112.0 104.9,111.6 108.4,111.3 111.8,111.1 115.2,110.9 118.6,110.7 122.0,110.6 125.4,110.5 128.9,110.5 132.3,110.5 135.7,110.5 139.1,110.5 142.5,110.5 145.9,110.6 149.4,110.7 152.8,110.8 156.2,110.9 159.6,111.0 163.0,111.1 166.5,111.1 169.9,111.2 173.3,111.3 176.7,111.4 180.1,111.4 183.5,111.4 187.0,111.4 190.4,111.3 193.8,111.3 197.2,111.1 200.6,111.0 204.1,110.8 207.5,110.6 210.9,110.4 214.3,110.1 217.7,109.8 221.1,109.5 224.6,109.2 228.0,108.9 231.4,108.6 234.8,108.2 238.2,107.9 241.6,107.6 245.1,107.3 248.5,107.0 251.9,106.7 255.3,106.5 258.7,106.2 262.2,106.0 265.6,105.8 269.0,105.6 272.4,105.5 275.8,105.3 279.2,105.2 282.7,105.1 286.1,105.0 289.5,104.9 292.9,104.8 296.3,104.8 299.7,104.7 303.2,104.7 306.6,104.6 310.0,104.6" fill="none" stroke="currentColor" stroke-opacity="0.3" stroke-width="1.2"/>
<polyline points="40.0,120.1 43.4,119.6 46.8,119.0 50.3,118.3 53.7,117.6 57.1,116.8 60.5,115.9 63.9,115.0 67.3,113.9 70.8,112.8 74.2,111.6 77.6,110.4 81.0,109.1 84.4,107.7 87.8,106.3 91.3,104.8 94.7,103.3 98.1,101.7 101.5,100.1 104.9,98.6 108.4,96.9 111.8,95.3 115.2,93.7 118.6,92.2 122.0,90.6 125.4,89.1 128.9,87.6 132.3,86.1 135.7,84.8 139.1,83.4 142.5,82.2 145.9,80.9 149.4,79.8 152.8,78.7 156.2,77.6 159.6,76.6 163.0,75.6 166.5,74.6 169.9,73.7 173.3,72.8 176.7,71.9 180.1,70.9 183.5,70.0 187.0,69.1 190.4,68.1 193.8,67.1 197.2,66.0 200.6,65.0 204.1,63.8 207.5,62.7 210.9,61.5 214.3,60.3 217.7,59.1 221.1,57.8 224.6,56.6 228.0,55.4 231.4,54.1 234.8,53.0 238.2,51.8 241.6,50.7 245.1,49.7 248.5,48.7 251.9,47.8 255.3,47.0 258.7,46.2 262.2,45.5 265.6,44.9 269.0,44.3 272.4,43.8 275.8,43.3 279.2,42.9 282.7,42.6 286.1,42.3 289.5,42.0 292.9,41.7 296.3,41.5 299.7,41.3 303.2,41.1 306.6,41.0 310.0,40.9" fill="none" class="sg" stroke-width="2"/>
<text x="314" y="44.9" font-size="10.5" class="tg">s5</text>
<polyline points="40.0,121.5 43.4,121.2 46.8,120.8 50.3,120.4 53.7,119.9 57.1,119.5 60.5,119.0 63.9,118.4 67.3,117.9 70.8,117.3 74.2,116.7 77.6,116.1 81.0,115.5 84.4,114.9 87.8,114.3 91.3,113.8 94.7,113.3 98.1,112.8 101.5,112.4 104.9,112.1 108.4,111.8 111.8,111.7 115.2,111.5 118.6,111.5 122.0,111.5 125.4,111.6 128.9,111.7 132.3,111.9 135.7,112.1 139.1,112.3 142.5,112.6 145.9,112.8 149.4,113.1 152.8,113.4 156.2,113.6 159.6,113.9 163.0,114.1 166.5,114.4 169.9,114.6 173.3,114.8 176.7,114.9 180.1,115.1 183.5,115.3 187.0,115.4 190.4,115.5 193.8,115.6 197.2,115.7 200.6,115.8 204.1,115.9 207.5,115.9 210.9,116.0 214.3,116.1 217.7,116.1 221.1,116.2 224.6,116.2 228.0,116.2 231.4,116.3 234.8,116.3 238.2,116.3 241.6,116.4 245.1,116.4 248.5,116.4 251.9,116.4 255.3,116.4 258.7,116.4 262.2,116.5 265.6,116.5 269.0,116.5 272.4,116.5 275.8,116.5 279.2,116.5 282.7,116.5 286.1,116.5 289.5,116.5 292.9,116.5 296.3,116.5 299.7,116.5 303.2,116.5 306.6,116.5 310.0,116.5" fill="none" stroke="currentColor" stroke-opacity="0.3" stroke-width="1.2"/>
<line x1="360" y1="124.1" x2="630" y2="124.1" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="360" y1="30" x2="360" y2="230" stroke="currentColor" stroke-opacity="0.5"/>
<text x="495.0" y="18" text-anchor="middle" font-size="13" font-weight="700">Lasso path</text>
<text x="495.0" y="248" text-anchor="middle" class="tm" font-size="11">λ falls →  (50 to 0.05)</text>
<text x="356" y="128.1" text-anchor="end" class="tm" font-size="10">0</text>
<text x="356" y="57.5" text-anchor="end" class="tm" font-size="10">30</text>
<text x="356" y="198.7" text-anchor="end" class="tm" font-size="10">−30</text>
<polyline points="360.0,124.1 363.4,124.1 366.8,124.1 370.3,124.1 373.7,124.1 377.1,124.1 380.5,124.1 383.9,124.1 387.3,124.1 390.8,124.1 394.2,124.1 397.6,124.1 401.0,124.1 404.4,124.1 407.8,124.1 411.3,124.1 414.7,124.1 418.1,124.1 421.5,124.1 424.9,124.1 428.4,124.1 431.8,124.1 435.2,124.1 438.6,124.1 442.0,124.1 445.4,124.1 448.9,124.1 452.3,124.1 455.7,124.1 459.1,124.1 462.5,124.1 465.9,124.1 469.4,124.1 472.8,124.1 476.2,124.1 479.6,124.1 483.0,124.1 486.5,124.1 489.9,124.1 493.3,124.1 496.7,124.1 500.1,124.1 503.5,124.1 507.0,124.1 510.4,124.1 513.8,124.1 517.2,124.1 520.6,124.1 524.1,124.1 527.5,124.1 530.9,124.1 534.3,124.1 537.7,124.1 541.1,124.1 544.6,124.1 548.0,124.1 551.4,124.1 554.8,124.1 558.2,124.1 561.6,124.1 565.1,124.1 568.5,124.1 571.9,124.2 575.3,124.3 578.7,124.4 582.2,124.4 585.6,124.5 589.0,124.6 592.4,124.6 595.8,124.7 599.2,124.7 602.7,124.8 606.1,124.8 609.5,124.8 612.9,124.8 616.3,124.9 619.7,124.9 623.2,124.9 626.6,124.9 630.0,125.0" fill="none" stroke="currentColor" stroke-opacity="0.3" stroke-width="1.2"/>
<polyline points="360.0,124.1 363.4,124.1 366.8,124.1 370.3,124.1 373.7,124.1 377.1,124.1 380.5,124.1 383.9,124.1 387.3,124.1 390.8,124.1 394.2,124.1 397.6,124.1 401.0,124.1 404.4,124.1 407.8,124.1 411.3,124.1 414.7,124.1 418.1,124.1 421.5,124.1 424.9,124.1 428.4,124.1 431.8,124.1 435.2,124.1 438.6,124.1 442.0,124.4 445.4,126.6 448.9,128.6 452.3,130.4 455.7,132.1 459.1,133.7 462.5,135.1 465.9,136.5 469.4,137.6 472.8,138.7 476.2,139.6 479.6,140.5 483.0,141.3 486.5,142.1 489.9,142.7 493.3,143.4 496.7,143.9 500.1,144.5 503.5,144.9 507.0,145.4 510.4,145.8 513.8,146.1 517.2,146.5 520.6,146.8 524.1,147.2 527.5,147.5 530.9,147.7 534.3,148.0 537.7,148.2 541.1,148.4 544.6,148.6 548.0,148.7 551.4,148.9 554.8,149.1 558.2,149.2 561.6,149.3 565.1,149.4 568.5,149.5 571.9,149.7 575.3,149.8 578.7,149.9 582.2,150.0 585.6,150.0 589.0,150.1 592.4,150.2 595.8,150.3 599.2,150.3 602.7,150.4 606.1,150.4 609.5,150.5 612.9,150.5 616.3,150.6 619.7,150.6 623.2,150.7 626.6,150.7 630.0,150.7" fill="none" stroke="currentColor" stroke-opacity="0.3" stroke-width="1.2"/>
<polyline points="360.0,124.1 363.4,124.1 366.8,116.9 370.3,111.1 373.7,105.9 377.1,101.1 380.5,96.7 383.9,92.7 387.3,89.0 390.8,85.6 394.2,82.8 397.6,80.6 401.0,78.6 404.4,76.7 407.8,75.2 411.3,74.1 414.7,73.0 418.1,72.1 421.5,71.3 424.9,70.5 428.4,69.8 431.8,69.1 435.2,68.5 438.6,68.0 442.0,67.5 445.4,67.3 448.9,67.2 452.3,67.1 455.7,66.9 459.1,66.9 462.5,66.8 465.9,66.8 469.4,66.7 472.8,66.6 476.2,66.5 479.6,66.4 483.0,66.3 486.5,66.2 489.9,66.1 493.3,66.0 496.7,65.9 500.1,65.9 503.5,65.8 507.0,65.8 510.4,65.7 513.8,65.7 517.2,65.6 520.6,65.6 524.1,65.5 527.5,65.5 530.9,65.4 534.3,65.4 537.7,65.4 541.1,65.3 544.6,65.3 548.0,65.3 551.4,65.2 554.8,65.2 558.2,65.2 561.6,65.2 565.1,65.2 568.5,65.2 571.9,65.3 575.3,65.3 578.7,65.4 582.2,65.4 585.6,65.5 589.0,65.5 592.4,65.5 595.8,65.6 599.2,65.6 602.7,65.6 606.1,65.7 609.5,65.7 612.9,65.7 616.3,65.8 619.7,65.8 623.2,65.8 626.6,65.8 630.0,65.8" fill="none" class="sb" stroke-width="2"/>
<text x="634" y="69.8" font-size="10.5" class="tb">bmi</text>
<polyline points="360.0,124.1 363.4,124.1 366.8,124.1 370.3,124.1 373.7,124.1 377.1,124.1 380.5,124.1 383.9,124.1 387.3,124.1 390.8,124.1 394.2,123.2 397.6,120.8 401.0,118.6 404.4,116.6 407.8,114.8 411.3,113.0 414.7,111.4 418.1,110.0 421.5,108.6 424.9,107.4 428.4,106.3 431.8,105.2 435.2,104.3 438.6,103.4 442.0,102.6 445.4,101.3 448.9,100.2 452.3,99.1 455.7,98.2 459.1,97.3 462.5,96.6 465.9,96.0 469.4,95.4 472.8,94.8 476.2,94.3 479.6,93.8 483.0,93.4 486.5,93.0 489.9,92.7 493.3,92.4 496.7,92.1 500.1,91.8 503.5,91.5 507.0,91.3 510.4,91.1 513.8,90.9 517.2,90.7 520.6,90.5 524.1,90.3 527.5,90.1 530.9,90.0 534.3,89.8 537.7,89.7 541.1,89.6 544.6,89.4 548.0,89.3 551.4,89.2 554.8,89.2 558.2,89.1 561.6,89.0 565.1,88.9 568.5,88.9 571.9,88.8 575.3,88.7 578.7,88.6 582.2,88.6 585.6,88.5 589.0,88.4 592.4,88.4 595.8,88.3 599.2,88.3 602.7,88.3 606.1,88.2 609.5,88.2 612.9,88.2 616.3,88.2 619.7,88.1 623.2,88.1 626.6,88.1 630.0,88.1" fill="none" class="st" stroke-width="2"/>
<text x="634" y="92.1" font-size="10.5" class="tm">bp</text>
<polyline points="360.0,124.1 363.4,124.1 366.8,124.1 370.3,124.1 373.7,124.1 377.1,124.1 380.5,124.1 383.9,124.1 387.3,124.1 390.8,124.1 394.2,124.1 397.6,124.1 401.0,124.1 404.4,124.1 407.8,124.1 411.3,124.1 414.7,124.1 418.1,124.1 421.5,124.1 424.9,124.1 428.4,124.1 431.8,124.1 435.2,124.1 438.6,124.1 442.0,124.1 445.4,124.1 448.9,124.1 452.3,124.1 455.7,124.1 459.1,124.1 462.5,124.1 465.9,124.1 469.4,125.3 472.8,126.6 476.2,127.7 479.6,128.8 483.0,129.8 486.5,130.7 489.9,131.5 493.3,132.2 496.7,132.9 500.1,133.6 503.5,134.2 507.0,134.7 510.4,135.2 513.8,135.6 517.2,136.5 520.6,137.6 524.1,138.7 527.5,139.6 530.9,140.4 534.3,141.2 537.7,141.9 541.1,142.6 544.6,143.2 548.0,143.7 551.4,144.2 554.8,144.7 558.2,145.1 561.6,145.5 565.1,145.9 568.5,150.5 571.9,155.7 575.3,160.4 578.7,164.8 582.2,168.8 585.6,172.5 589.0,175.8 592.4,178.9 595.8,181.8 599.2,184.3 602.7,186.3 606.1,186.9 609.5,187.5 612.9,188.0 616.3,188.4 619.7,188.8 623.2,190.0 626.6,191.9 630.0,193.6" fill="none" class="sr" stroke-width="2"/>
<polyline points="360.0,124.1 363.4,124.1 366.8,124.1 370.3,124.1 373.7,124.1 377.1,124.1 380.5,124.1 383.9,124.1 387.3,124.1 390.8,124.1 394.2,124.1 397.6,124.1 401.0,124.1 404.4,124.1 407.8,124.1 411.3,124.1 414.7,124.1 418.1,124.1 421.5,124.1 424.9,124.1 428.4,124.1 431.8,124.1 435.2,124.1 438.6,124.1 442.0,124.1 445.4,124.1 448.9,124.1 452.3,124.1 455.7,124.1 459.1,124.1 462.5,124.1 465.9,124.1 469.4,124.1 472.8,124.1 476.2,124.1 479.6,124.1 483.0,124.1 486.5,124.1 489.9,124.1 493.3,124.1 496.7,124.1 500.1,124.1 503.5,124.1 507.0,124.1 510.4,124.1 513.8,124.1 517.2,124.1 520.6,124.1 524.1,124.1 527.5,124.1 530.9,124.1 534.3,124.1 537.7,124.1 541.1,124.1 544.6,124.1 548.0,124.1 551.4,124.1 554.8,124.1 558.2,124.1 561.6,124.1 565.1,124.1 568.5,120.5 571.9,116.3 575.3,112.5 578.7,109.1 582.2,105.9 585.6,102.9 589.0,100.3 592.4,97.8 595.8,95.5 599.2,93.5 602.7,91.9 606.1,91.2 609.5,90.7 612.9,90.2 616.3,89.7 619.7,89.2 623.2,88.3 626.6,86.8 630.0,85.5" fill="none" stroke="currentColor" stroke-opacity="0.3" stroke-width="1.2"/>
<polyline points="360.0,124.1 363.4,124.1 366.8,124.1 370.3,124.1 373.7,124.1 377.1,124.1 380.5,124.1 383.9,124.1 387.3,124.1 390.8,124.1 394.2,124.1 397.6,124.1 401.0,124.1 404.4,124.1 407.8,124.6 411.3,126.4 414.7,128.0 418.1,129.5 421.5,130.9 424.9,132.1 428.4,133.3 431.8,134.3 435.2,135.3 438.6,136.2 442.0,137.1 445.4,138.7 448.9,140.2 452.3,141.6 455.7,142.8 459.1,143.9 462.5,145.0 465.9,145.9 469.4,146.4 472.8,146.7 476.2,147.0 479.6,147.3 483.0,147.6 486.5,147.8 489.9,148.0 493.3,148.2 496.7,148.4 500.1,148.6 503.5,148.8 507.0,148.9 510.4,149.0 513.8,149.1 517.2,148.6 520.6,147.7 524.1,146.9 527.5,146.2 530.9,145.5 534.3,144.9 537.7,144.3 541.1,143.8 544.6,143.4 548.0,142.9 551.4,142.5 554.8,142.2 558.2,141.8 561.6,141.5 565.1,141.3 568.5,139.2 571.9,137.1 575.3,135.0 578.7,133.2 582.2,131.5 585.6,129.9 589.0,128.5 592.4,127.2 595.8,126.0 599.2,124.9 602.7,124.1 606.1,124.1 609.5,124.1 612.9,124.1 616.3,124.1 619.7,124.1 623.2,123.7 626.6,122.8 630.0,121.9" fill="none" class="sr" stroke-width="2"/>
<text x="634" y="125.9" font-size="10.5" class="tr">s3</text>
<polyline points="360.0,124.1 363.4,124.1 366.8,124.1 370.3,124.1 373.7,124.1 377.1,124.1 380.5,124.1 383.9,124.1 387.3,124.1 390.8,124.1 394.2,124.1 397.6,124.1 401.0,124.1 404.4,124.1 407.8,124.1 411.3,124.1 414.7,124.1 418.1,124.1 421.5,124.1 424.9,124.1 428.4,124.1 431.8,124.1 435.2,124.1 438.6,124.1 442.0,124.1 445.4,124.1 448.9,124.1 452.3,124.1 455.7,124.1 459.1,124.1 462.5,124.1 465.9,124.1 469.4,124.1 472.8,124.1 476.2,124.1 479.6,124.1 483.0,124.1 486.5,124.1 489.9,124.1 493.3,124.1 496.7,124.1 500.1,124.1 503.5,124.1 507.0,124.1 510.4,124.1 513.8,124.1 517.2,123.2 520.6,121.9 524.1,120.7 527.5,119.6 530.9,118.7 534.3,117.7 537.7,116.9 541.1,116.1 544.6,115.4 548.0,114.8 551.4,114.2 554.8,113.7 558.2,113.2 561.6,112.7 565.1,112.3 568.5,111.7 571.9,111.1 575.3,110.5 578.7,110.0 582.2,109.5 585.6,109.1 589.0,108.7 592.4,108.3 595.8,108.0 599.2,107.7 602.7,107.5 606.1,107.7 609.5,107.9 612.9,108.1 616.3,108.2 619.7,108.4 623.2,108.3 626.6,108.0 630.0,107.7" fill="none" stroke="currentColor" stroke-opacity="0.3" stroke-width="1.2"/>
<polyline points="360.0,124.1 363.4,124.1 366.8,123.6 370.3,117.9 373.7,112.6 377.1,107.8 380.5,103.4 383.9,99.4 387.3,95.7 390.8,92.3 394.2,89.5 397.6,87.3 401.0,85.3 404.4,83.4 407.8,81.9 411.3,80.9 414.7,80.0 418.1,79.1 421.5,78.3 424.9,77.6 428.4,77.0 431.8,76.4 435.2,75.8 438.6,75.3 442.0,74.9 445.4,74.6 448.9,74.3 452.3,74.0 455.7,73.7 459.1,73.6 462.5,73.6 465.9,73.5 469.4,72.8 472.8,72.0 476.2,71.3 479.6,70.7 483.0,70.1 486.5,69.6 489.9,69.1 493.3,68.6 496.7,68.2 500.1,67.8 503.5,67.5 507.0,67.1 510.4,66.9 513.8,66.6 517.2,66.4 520.6,66.2 524.1,66.0 527.5,65.9 530.9,65.7 534.3,65.6 537.7,65.5 541.1,65.4 544.6,65.3 548.0,65.2 551.4,65.1 554.8,65.0 558.2,64.9 561.6,64.9 565.1,64.8 568.5,63.1 571.9,61.2 575.3,59.4 578.7,57.8 582.2,56.3 585.6,55.0 589.0,53.7 592.4,52.6 595.8,51.5 599.2,50.6 602.7,49.8 606.1,49.6 609.5,49.3 612.9,49.1 616.3,48.9 619.7,48.7 623.2,48.3 626.6,47.6 630.0,46.9" fill="none" class="sg" stroke-width="2"/>
<text x="634" y="50.9" font-size="10.5" class="tg">s5</text>
<polyline points="360.0,124.1 363.4,124.1 366.8,124.1 370.3,124.1 373.7,124.1 377.1,124.1 380.5,124.1 383.9,124.1 387.3,124.1 390.8,124.1 394.2,124.1 397.6,124.1 401.0,124.1 404.4,124.1 407.8,124.1 411.3,124.1 414.7,124.1 418.1,124.1 421.5,124.1 424.9,124.1 428.4,124.1 431.8,124.1 435.2,124.1 438.6,124.1 442.0,124.1 445.4,124.1 448.9,124.1 452.3,124.1 455.7,124.1 459.1,123.7 462.5,123.3 465.9,122.8 469.4,122.3 472.8,121.8 476.2,121.3 479.6,120.8 483.0,120.4 486.5,120.1 489.9,119.7 493.3,119.4 496.7,119.1 500.1,118.9 503.5,118.6 507.0,118.4 510.4,118.2 513.8,118.0 517.2,117.9 520.6,117.8 524.1,117.7 527.5,117.6 530.9,117.5 534.3,117.4 537.7,117.3 541.1,117.3 544.6,117.2 548.0,117.1 551.4,117.1 554.8,117.0 558.2,117.0 561.6,116.9 565.1,116.9 568.5,116.9 571.9,116.9 575.3,116.8 578.7,116.8 582.2,116.8 585.6,116.8 589.0,116.7 592.4,116.7 595.8,116.7 599.2,116.7 602.7,116.7 606.1,116.7 609.5,116.7 612.9,116.6 616.3,116.6 619.7,116.6 623.2,116.6 626.6,116.6 630.0,116.6" fill="none" stroke="currentColor" stroke-opacity="0.3" stroke-width="1.2"/>
</svg><figcaption>Coefficient paths on the standardised diabetes data (real fits). Left: ridge weights glide smoothly toward 0 as λ grows and are never exactly 0. Right: lasso weights are exactly 0 until λ drops below their entry point, then switch on one by one: bmi first, then s5, bp, s3. s1 and s2 (the correlated cholesterol pair) enter only near the end, at small λ.</figcaption></figure>
  <p>The figure shows real paths on the diabetes data. The ridge weights on the left glide smoothly towards zero as λ grows and are never exactly zero. The lasso weights on the right are exactly zero until λ drops below their entry point, then switch on one by one: bmi first, then s5, bp and s3, with the correlated cholesterol pair s1 and s2 entering only near the end. The order of entry is a ranking of how strongly each feature earns its place, given those already in.</p>

  <h2 id="rg-bv"><span class="num">09</span>The Bias–Variance Trade</h2>
  <p>A penalty deliberately makes the weights wrong on average: ridge pulls every estimate towards zero, so it is <strong>biased</strong>. Why would a biased estimate ever be better? Because the total error of an estimate is its bias squared plus its variance, and regularization trades one for the other. For one weight this can be worked out exactly. Suppose the truth is y = βx + noise with noise variance σ². Substituting into w = Σxy/(Σx² + λ) gives an average (over many datasets) of βΣx²/(Σx² + λ), so the bias is <strong>−βλ/(Σx² + λ)</strong>, growing with λ. Only the noise makes w vary between datasets, and its variance works out to <strong>σ²Σx²/(Σx² + λ)²</strong>, shrinking with λ. Minimising bias² + variance over λ gives the best strength <strong>λ* = σ²/β²</strong>: penalise more when the noise is large or the true effect is small.</p>
  <p>For the flats' area slope the true effect is strong (β ≈ 6) and the noise small (σ² ≈ 4), so λ* = 4/36 = 0.11: almost no shrinkage is worth it, which is why ridge did not help the strong area effect in the previous section. For a weak effect the story is different. Take x = 1, 2, 3, 4 (so Σx² = 30), a weak true slope β = 0.2 and noise σ = 1, so λ* = 1/0.04 = 25. The formulas, checked against 100,000 simulated datasets:</p>
  <div class="fx" data-lang="py">import numpy as np
beta, sigma, Sxx = 0.2, 1.0, 30.0                      # weak true slope, noise sd, Σx² for x = 1,2,3,4
for lam in [0, 10, 25, 50]:
    bias = -beta * lam / (Sxx + lam) + 0.0
    var = sigma**2 * Sxx / (Sxx + lam) ** 2
    print(f"λ={lam:&lt;3} bias²={bias**2:.4f}  variance={var:.4f}  error of w={bias**2 + var:.4f}")
rng, x = np.random.default_rng(0), np.array([1, 2, 3, 4.])
ys = beta * x + rng.normal(0, sigma, (100_000, 4))     # 100,000 simulated datasets
for lam in [0, 25]:
    w = ys @ x / (Sxx + lam)
    print(f"simulated λ={lam:&lt;2}: average w {w.mean():.4f}   error of w {((w - beta) ** 2).mean():.4f}")</div>
  <div class="fx" data-lang="text">λ=0   bias²=0.0000  variance=0.0333  error of w=0.0333
λ=10  bias²=0.0025  variance=0.0187  error of w=0.0212
λ=25  bias²=0.0083  variance=0.0099  error of w=0.0182
λ=50  bias²=0.0156  variance=0.0047  error of w=0.0203
simulated λ=0 : average w 0.1999   error of w 0.0332
simulated λ=25: average w 0.1090   error of w 0.0182</div>
  <p>Without a penalty the estimate is unbiased (its average over the simulations is 0.1999, essentially the true 0.2) but its error is 0.0332. With λ = 25 the estimate is clearly biased (it averages 0.109, pulled towards zero) yet its error is about half, 0.0182. A biased but steady estimator beats an unbiased but jumpy one. Think of two archers: one whose arrows are centred on the bullseye but scattered all over the target, and one whose arrows are tightly grouped slightly to the left; the second scores more points.</p>
  <p>The same trade shows up for a whole model. Below, ridge with 15 features (each of which matters a little), 30 training rows and noise variance 9 is fitted on 300 fresh training sets for each λ, and its predictions on 200 fixed test points are split into bias² and variance:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import Ridge

rng = np.random.default_rng(0)
p, n, sigma = 15, 30, 3.0
true_w = rng.normal(0, 1, p)                           # every feature matters a little
X_test = rng.normal(size=(200, p)); f_test = X_test @ true_w
print("lambda  bias^2  variance  test MSE (incl. noise 9)")
for lam in [0.001, 1, 5, 20, 100, 500]:
    preds = []
    for rep in range(300):                             # 300 fresh training sets
        X = rng.normal(size=(n, p)); y = X @ true_w + rng.normal(0, sigma, n)
        preds.append(Ridge(alpha=lam).fit(X, y).predict(X_test))
    preds = np.array(preds)
    bias2 = ((preds.mean(axis=0) - f_test) ** 2).mean(); var = preds.var(axis=0).mean()
    print(f"{lam:&lt;7} {bias2:6.2f}  {var:8.2f}  {bias2 + var + sigma**2:8.2f}")</div>
  <div class="fx" data-lang="text">lambda  bias^2  variance  test MSE (incl. noise 9)
0.001     0.03     11.17     20.20
1         0.13      8.44     17.58
5         0.67      4.91     14.58
20        3.07      2.33     14.40
100       8.39      0.98     18.38
500      11.71      0.70     21.41</div>
  <p>With almost no penalty, bias² is tiny (0.03) but the variance is 11.17: the model changes a lot with each training set. Raising λ trades one for the other, and at λ between 5 and 20 the total test error is lowest (about 14.4), roughly 6 below the unpenalised model. Push λ to 500 and the variance is small but bias² (11.71) dominates: the model underfits. The noise (9) is untouched by any λ. Another way to say this is that λ is a continuous dial on <strong>effective model complexity</strong>: for ridge, the effective number of parameters is Σd/(d + λ) over the eigenvalues d of XᵀX, which equals the true number of parameters at λ = 0 and falls smoothly to 0 as λ grows. For the twin areas at λ = 1 it is 0.993 + 0.040 ≈ 1.03, so the two weights behave like one. The practical lesson: regularization only fixes the variance side. If both the training and validation errors are high, the model is too simple, and a penalty will make it worse.</p>

  <h2 id="rg-models"><span class="num">10</span>Regularization in Other Models</h2>
  <p>Linear regression is not the only model that overfits, and the same idea appears everywhere, often under a different name. The most important one to get right is logistic regression. In the loss-functions note we saw that on the flats' "sold within 30 days" data, age separates the classes perfectly, so log-loss keeps falling as the age weight grows, without limit. What stops the weight running off to infinity is a penalty, and scikit-learn's <code>LogisticRegression</code> adds an L2 penalty <strong>by default</strong>. It controls the strength with <code>C</code>, which multiplies the loss instead of the penalty: it minimises ½‖w‖² + C·Σ log-loss. Dividing by C shows this is the same as log-loss + (1/2C)‖w‖², so <strong>C behaves like 1/λ: a small C means a strong penalty</strong>. SVMs use C in the same way (<a class="xref" data-note="ml_svm">Support Vector Machines</a>).</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LogisticRegression

sold = np.array([1, 0, 0, 1, 0, 1, 1, 0, 0, 0])        # sold within 30 days?
z = ((age - age.mean()) / age.std()).reshape(-1, 1)    # standardised age
for C in [0.01, 1, 100, 10_000]:
    m = LogisticRegression(C=C, max_iter=100_000).fit(z, sold)
    print(f"C={C:&lt;6} weight {m.coef_[0, 0]:6.2f}   train accuracy {m.score(z, sold):.1f}"
          f"   P(fast) for 10-year-old flat F {m.predict_proba(z)[5, 1]:.3f}")</div>
  <div class="fx" data-lang="text">C=0.01   weight   0.04   train accuracy 0.6   P(fast) for 10-year-old flat F 0.402
C=1      weight   1.44   train accuracy 0.9   P(fast) for 10-year-old flat F 0.476
C=100    weight   8.50   train accuracy 1.0   P(fast) for 10-year-old flat F 0.811
C=10000  weight  25.37   train accuracy 1.0   P(fast) for 10-year-old flat F 0.991</div>
  <p>With a strong penalty (C = 0.01) the age weight is held at 0.04, so the model barely uses age and is right on only 6 of the 10 flats. At the default C = 1 the weight is 1.44 and 9 of 10 are right. With almost no penalty (C = 10,000) the weight reaches 25.4, which turns a 10-year-old flat's probability of selling fast into 0.991, an absurdly confident claim from ten flats. Getting the direction of this knob backwards is a classic mistake: in <code>Ridge</code>, <code>Lasso</code>, <code>ElasticNet</code> and <code>MLPClassifier</code> a bigger <code>alpha</code> means stronger regularization, while in <code>LogisticRegression</code>, <code>SVC</code> and <code>LinearSVC</code> a bigger <code>C</code> means weaker regularization. You can also ask for an L1 penalty in logistic regression (in recent sklearn versions, <code>l1_ratio=1</code> with the liblinear or saga solver) to get a sparse classifier.</p>
  <p>Tree models are regularized by limiting their structure. A <a class="xref" data-note="ml_dtree">decision tree</a> can be limited with <code>max_depth</code> or <code>min_samples_leaf</code>, or pruned with cost-complexity pruning, which minimises R(T) + α·|T|: training error plus α per leaf. That is exactly "loss + λ × penalty", with the number of leaves as the penalty, and α (<code>ccp_alpha</code>) is chosen by cross-validation from a pruning path just as λ is chosen from a lasso path. <a class="xref" data-note="ml_rf">Random forests</a> reduce variance by averaging many randomised trees. <a class="xref" data-note="ml_gbm">Gradient boosting</a> uses a small <code>learning_rate</code> (shrinkage), <code>subsample</code> and early stopping, and <a class="xref" data-note="ml_xgboost">XGBoost</a> adds explicit penalties: <code>reg_lambda</code> is an L2 penalty on leaf values (a leaf's value is −G/(H + λ), the ridge denominator again), <code>reg_alpha</code> an L1 penalty, and <code>gamma</code> a price per extra leaf. Even <a class="xref" data-note="ml_knn">k-nearest neighbours</a> is regularized by a larger k, which smooths the decision boundary.</p>

  <h2 id="rg-implicit"><span class="num">11</span>Regularizing Without a Penalty Term</h2>
  <p>Every regularizer so far was a term written into the objective or a limit on the model's structure. Several important techniques reach the same effect by other routes, and interviewers like to ask why they count as regularization.</p>
  <p><strong>Early stopping</strong> uses the training procedure itself. Train with gradient descent starting from all weights at zero, and watch the error on a separate validation set after every step. Early on, the weights grow in the directions the data support strongly, which is where the real signal lives. Later they grow in weakly supported directions, which is where the noise lives (like the "built-up minus carpet" direction). So the validation error falls, reaches a minimum, and then rises again; stop at the minimum and keep those weights. Below, 40 training rows are fitted with 30 weights, of which only 3 are real:</p>
  <div class="fx" data-lang="py">import numpy as np

rng = np.random.default_rng(3)
true_w = np.zeros(30); true_w[:3] = [2, -1.5, 1]       # 30 weights, only 3 real
def make(n):
    X = rng.normal(size=(n, 30)); return X, X @ true_w + rng.normal(0, 1.5, n)
Xtr, ytr = make(40); Xva, yva = make(500)              # 40 training rows: easy to overfit
w, best = np.zeros(30), (np.inf, 0)
for t in range(1, 3001):
    w -= 0.01 * -2 * Xtr.T @ (ytr - Xtr @ w) / 40      # one gradient step on training MSE
    val = np.mean((yva - Xva @ w) ** 2)
    if val &lt; best[0]: best = (val, t)
    if t in (10, 100, 500, 3000):
        print(f"step {t:4d}: train MSE {np.mean((ytr - Xtr @ w) ** 2):.2f}   val MSE {val:.2f}   size of w {np.linalg.norm(w):.2f}")
print(f"best validation MSE {best[0]:.2f} at step {best[1]}")</div>
  <div class="fx" data-lang="text">step   10: train MSE 5.29   val MSE 7.06   size of w 0.55
step  100: train MSE 1.07   val MSE 4.79   size of w 2.20
step  500: train MSE 0.61   val MSE 4.12   size of w 2.95
step 3000: train MSE 0.54   val MSE 4.71   size of w 3.45
best validation MSE 4.12 at step 471</div>
  <p>The training error keeps falling (to 0.54) as the size of the weight vector keeps growing (to 3.45). The validation error falls to 4.12 at step 471 and then climbs back to 4.71 by step 3000, by which time the model has almost reached the unpenalised least-squares fit. Stopping at step 471 gives the regularized model. Why is this like L2? For a direction with curvature (eigenvalue) d, gradient descent from zero with step η reaches the fraction 1 − (1 − ηd)ᵗ of the least-squares value after t steps, while ridge keeps d/(d + λ). Both keep strongly supported directions almost fully and weakly supported ones small; for example, with η = 0.1 and t = 10, a direction with d = 0.1 reaches 9.6% under early stopping and 9.1% under ridge with λ = 1. Roughly, early stopping after t steps behaves like ridge with <strong>λ ≈ 1/(η·t)</strong>: more steps means weaker regularization. It is free and saves training time; in sklearn it is <code>early_stopping=True</code> for SGD models, MLPs and histogram gradient boosting, and <code>n_iter_no_change</code> for gradient boosting. Use a "patience" of several checks, because validation curves are noisy, and remember that the validation set used to choose the stopping step is no longer an unbiased judge.</p>
  <p><strong>Adding noise to the inputs</strong> regularizes through the data. A flat's recorded area is never exact anyway; if we train on many slightly jittered copies of each flat, the model cannot rely too heavily on the exact area value. This is not just an analogy; it is exactly ridge. If independent noise with variance s² is added to every input, the expected squared error of one row is (y − xᵀw)² + s²‖w‖² (the cross term averages to zero), so over n rows the expected training loss is RSS + n·s²·‖w‖²: <strong>ridge with λ = n·s²</strong>. On the flats, jittering each centred area by noise with standard deviation 1 (100 sq ft) should be ridge with λ = 10 × 1 = 10, which gives 495/92.5 = 5.351:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression

rng = np.random.default_rng(0)
x, y = area - 9.5, price - 67                          # centred flats
K = 20_000                                             # noisy copies of every flat
x_aug = np.repeat(x, K) + rng.normal(0, 1.0, 10 * K)   # jitter area by sd 1 (100 sq ft)
w = LinearRegression(fit_intercept=False).fit(x_aug.reshape(-1, 1), np.repeat(y, K)).coef_[0]
print("OLS on clean area       :", 495 / 82.5)
print("OLS on jittered copies  :", round(w, 3))
print("ridge with λ = n·s² = 10:", round(495 / (82.5 + 10), 3))</div>
  <div class="fx" data-lang="text">OLS on clean area       : 6.0
OLS on jittered copies  : 5.349
ridge with λ = n·s² = 10: 5.351</div>
  <p>Plain least squares on 20,000 jittered copies of each flat gives a slope of 5.349, the ridge answer to two decimals. The model never saw a penalty term; the noise in the inputs taught it not to trust the exact area too much.</p>
  <p><strong>Dropout</strong> is the neural-network version of this idea (Srivastava et al., 2014). During each training step it randomly switches off each unit of a layer with probability p. If a layer outputs (2, 4, 6, 8) and p = 0.5, one random mask might keep units 1 and 3, giving (2, 0, 6, 0); modern "inverted" dropout then scales the survivors by 1/(1 − p) = 2 to (4, 0, 12, 0) so that the average output over many masks is unchanged. At prediction time nothing is dropped. It regularizes because no unit can rely on a particular partner being present, so the network cannot build fragile, co-adapted feature detectors; it behaves like an average of many thinned networks, an ensemble in the spirit of <a class="xref" data-note="ml_bagging">Bagging</a>.</p>
  <p><strong>Data augmentation</strong> is the general version: create extra training rows by transformations that should not change the label. For images that means flips, crops, small rotations and colour changes; for audio, time shifts and background noise; for text, synonym swaps or back-translation. It encodes prior knowledge ("a flipped cat is still a cat") and enlarges the effective training set, which lowers variance. Two cautions: augment only training rows, after the split, and never with a transform that changes the label (flipping a "6" makes a "9"). Related tricks are <strong>label smoothing</strong> (training on 0.9/0.1 instead of 1/0, which discourages over-confident predictions like the 0.991 above) and <strong>mixup</strong> (training on blends of two examples and their labels).</p>

  <h2 id="rg-bayes"><span class="num">12</span>The Penalty as a Prior</h2>
  <p>Cross-validation picks λ by trial, but it does not say what λ <em>means</em>. A penalty that says "big weights are unlikely" sounds like a belief held before seeing any data, and the Bayesian view makes that exact. In the loss-functions note we saw that least squares is maximum likelihood under Gaussian noise: minus the log-likelihood is RSS/(2σ²) plus a constant. A Bayesian also states a <strong>prior</strong>, a belief about the weights before seeing the data, and combines the two with Bayes' rule: posterior ∝ likelihood × prior. The <strong>MAP</strong> (maximum a posteriori) estimate is the set of weights with the highest posterior, which means the lowest value of (−log likelihood) + (−log prior).</p>
  <p>If the prior says each weight is drawn from a normal distribution centred at zero with variance τ², then −log prior = Σw²/(2τ²) plus a constant. Adding the two and multiplying by 2σ² gives RSS + (σ²/τ²)·Σw²: <strong>ridge, with λ = σ²/τ²</strong>. If instead the prior is a <strong>Laplace distribution</strong>, which has a sharp peak at zero, then −log prior is proportional to Σ|w| and the MAP estimate is the lasso. The sharp peak of the Laplace density is the probabilistic version of the diamond's corner. Read this way, λ is a ratio: <strong>noise variance divided by prior variance</strong>. A strong penalty means either noisy data or a firm belief that the weights are small. By hand: with noise σ = 1 and a belief that a slope is probably within about ±0.4 (τ = 0.2), λ = 1/0.04 = 25, exactly the best λ derived in section 09 for a true slope of 0.2.</p>
  <p>This view also gives another way to choose λ. sklearn's <code>BayesianRidge</code> treats both σ² and τ² as unknowns and estimates them from the data by maximising the evidence (the probability of the data with the weights averaged out). Its weights must then equal ridge with λ = σ²/τ²:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import BayesianRidge, Ridge

X = area.reshape(-1, 1)
br = BayesianRidge().fit(X, price)
noise_var, prior_var = 1 / br.alpha_, 1 / br.lambda_   # sklearn stores precisions
lam = noise_var / prior_var
print(f"learnt σ² = {noise_var:.2f}, τ² = {prior_var:.2f}  -&gt;  λ = σ²/τ² = {lam:.3f}")
print("BayesianRidge slope:", br.coef_.round(4), "  Ridge(alpha=λ) slope:", Ridge(alpha=lam).fit(X, price).coef_.round(4))</div>
  <div class="fx" data-lang="text">learnt σ² = 5.11, τ² = 35.94  -&gt;  λ = σ²/τ² = 0.142
BayesianRidge slope: [5.9897]   Ridge(alpha=λ) slope: [5.9897]</div>
  <p>sklearn stores precisions (one over a variance), so <code>alpha_</code> = 1/σ² and <code>lambda_</code> = 1/τ². On the flats it learnt a noise variance of 5.11 (close to the 4.6 average squared miss of the line) and a prior variance of 35.9 (a slope "of size about 6"), so λ = 0.142, very close to the λ* = 0.11 derived in section 09, and the slope barely shrinks (5.99). <code>Ridge(alpha=0.142)</code> reproduces it exactly. One subtlety for interviews: lasso is the posterior <em>mode</em> under a Laplace prior; the full Bayesian answer (the posterior mean) is never exactly sparse, so "lasso is Bayesian feature selection" is not quite right.</p>

  <h2 id="rg-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>The most damaging mistake is forgetting to scale. The penalty acts on weight size, which depends on units: the same λ kept 75% of the area slope with area in hundreds of square feet and 99.997% in square feet, and unscaled lasso removed "rooms" only because "area" happened to be written in big numbers. Standardize inside a pipeline for every L1- or L2-regularized linear model, SVM and neural network.</p>
  <p>A quieter mistake appears when people write their own penalised fit and accidentally include the intercept in the penalty. The intercept only sets the average level of the predictions, so penalising it drags all predictions towards zero:</p>
  <div class="fx" data-lang="py">import numpy as np

X = np.c_[area, np.ones(10)]                           # columns: area, 1
lam = 82.5
for label, P in [("penalise w only  ", np.diag([1.0, 0.0])), ("penalise w AND b ", np.eye(2))]:
    w, b = np.linalg.solve(X.T @ X + lam * P, X.T @ price)
    print(f"{label}: w = {w:.2f}  b = {b:6.2f}   price of an average 950 sq ft flat = {9.5 * w + b:.1f}")</div>
  <div class="fx" data-lang="text">penalise w only  : w = 3.00  b =  38.50   price of an average 950 sq ft flat = 67.0
penalise w AND b : w = 6.36  b =   0.71   price of an average 950 sq ft flat = 61.2</div>
  <p>Penalising only the slope halves it (6 → 3) but leaves the average flat correctly priced at ₹67 lakh. Penalising the intercept as well squeezes it from 38.5 to 0.71, and the model compensates by tilting the slope, so an average 950 sq ft flat is now priced at ₹61.2 lakh, ₹5.8 lakh too low. Exclude the intercept (and, in neural networks, usually the batch-norm parameters) from the penalty.</p>
  <p>Several mistakes concern λ itself. Choosing λ on training error always gives λ = 0, and choosing it on the test set uses up the test set; use cross-validation on the training data, with a log-spaced grid (a linear grid 1, 2, …, 10 never discovers that the best value is 300). Getting the direction of the knob wrong is common: bigger <code>alpha</code> is stronger in Ridge and Lasso, bigger <code>C</code> is weaker in LogisticRegression and SVC. Comparing alpha values across libraries is risky because sklearn scales the loss by 1/(2n) for Lasso and ElasticNet but not for Ridge, and glmnet swaps the names. And many people forget that <code>LogisticRegression</code> is penalised by default (C = 1), so the coefficients they report as "effects" are shrunk; for unpenalised inference use <code>C=np.inf</code> or statsmodels.</p>
  <p>Finally, two misunderstandings. Lasso's zeros are not proof that a feature is useless: with correlated features it keeps one at random (built-up area beat carpet area by a push of 17.23 to 17.18), so check stability on bootstrap samples or use Elastic Net. And regularization cannot fix underfitting: it lowers variance and adds bias, so if both training and validation errors are high you need a smaller λ, better features or a more flexible model.</p>

  <h2 id="rg-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key definitions</h3>
  <ul>
    <li><b>Regularization</b>: adding a penalty on complexity to the training objective (or limiting the model another way) to reduce variance at the cost of some bias. J(w) = Loss(w) + λ·Ω(w).</li>
    <li><b>λ / alpha</b>: penalty strength, chosen by cross-validation. <b>C</b> = 1/λ in logistic regression and SVMs (bigger C = weaker).</li>
    <li><b>Ridge / L2</b>: Ω = Σw²; shrinks every weight proportionally, never to zero; correlated features share weight. In gradient form: weight decay.</li>
    <li><b>Lasso / L1</b>: Ω = Σ|w|; soft-thresholds, sets weak weights exactly to zero (sparse, built-in feature selection); keeps one of a group of twins.</li>
    <li><b>Elastic Net</b>: L1 + L2 mix; sparse and keeps correlated groups together.</li>
    <li><b>Soft threshold</b>: S(z, λ) = sign(z)·max(|z| − λ, 0).</li>
    <li><b>Regularization path</b>: fitted weights for every λ; lasso's path is empty above α_max = maxⱼ|xⱼᵀy|/n.</li>
    <li><b>Implicit regularizers</b>: early stopping, input noise, dropout, data augmentation, pruning.</li>
    <li><b>MAP view</b>: penalty = −log prior; Gaussian prior ⇔ L2 (λ = σ²/τ²), Laplace prior ⇔ L1.</li>
  </ul>
  <h3>The three penalties</h3>
  <table class="tbl">
    <tr><th></th><th>Ridge (L2)</th><th>Lasso (L1)</th><th>Elastic Net</th></tr>
    <tr><td>Penalty</td><td>Σw²</td><td>Σ|w|</td><td>mix of both</td></tr>
    <tr><td>One-feature solution</td><td>Σxy/(Σx² + λ)</td><td>S(Σxy, λ)/Σx²</td><td>S(Σxy, λ₁)/(Σx² + λ₂)</td></tr>
    <tr><td>Pull towards 0</td><td>2λw, fades near 0</td><td>λ, constant</td><td>both</td></tr>
    <tr><td>Exact zeros</td><td>never</td><td>yes</td><td>yes</td></tr>
    <tr><td>Correlated features</td><td>shares weight, stable</td><td>keeps one, unstable</td><td>shares and selects groups</td></tr>
    <tr><td>More features than rows</td><td>fine</td><td>at most n non-zero</td><td>can keep more than n</td></tr>
    <tr><td>Solver</td><td>closed form (XᵀX + λI)⁻¹Xᵀy</td><td>coordinate descent</td><td>coordinate descent</td></tr>
    <tr><td>Prior</td><td>Gaussian</td><td>Laplace</td><td>mix</td></tr>
    <tr><td>Use when</td><td>many small effects, multicollinearity</td><td>few features matter</td><td>correlated groups, some useless</td></tr>
  </table>
  <h3>Knobs in scikit-learn</h3>
  <table class="tbl">
    <tr><th>Model</th><th>Knob</th><th>Stronger regularization when</th></tr>
    <tr><td>Ridge, Lasso, ElasticNet, MLP</td><td><code>alpha</code> (+ <code>l1_ratio</code>)</td><td>alpha ↑</td></tr>
    <tr><td>LogisticRegression, SVC, LinearSVC</td><td><code>C</code></td><td>C ↓</td></tr>
    <tr><td>Decision tree</td><td><code>ccp_alpha</code>, <code>max_depth</code>, <code>min_samples_leaf</code></td><td>ccp_alpha ↑, depth ↓, leaf size ↑</td></tr>
    <tr><td>Gradient boosting / XGBoost</td><td><code>learning_rate</code>, <code>reg_lambda</code>, <code>reg_alpha</code>, <code>gamma</code>, early stopping</td><td>learning rate ↓, penalties ↑</td></tr>
    <tr><td>Neural nets</td><td>weight decay, dropout p, early stopping</td><td>decay ↑, p ↑, fewer epochs</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import RidgeCV, LassoCV, ElasticNetCV, LogisticRegression

ridge = make_pipeline(StandardScaler(), RidgeCV(alphas=[0.1, 1, 10, 100]))
lasso = make_pipeline(StandardScaler(), LassoCV(cv=5))
enet  = make_pipeline(StandardScaler(), ElasticNetCV(l1_ratio=[0.1, 0.5, 0.9, 1], cv=5))
logit = make_pipeline(StandardScaler(), LogisticRegression(C=1.0))   # L2 by default</div>
  <h3>Key numbers on the flats</h3>
  <ul>
    <li>Twin areas: OLS (17.6, −14.5), unstable; ridge (4.2, 2.2), stable.</li>
    <li>Area slope 6: ridge 4.5 at λ = 27.5, 3 at λ = 82.5; lasso 4 at λ = 165, 0 from λ = 495.</li>
    <li>Six columns, LOOCV: OLS 6.16, ridge 6.05, lasso 2.45 (keeps area, age, Baner).</li>
    <li>Best λ for one weight: σ²/β² (0.11 for the strong area slope).</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>Always scale before penalising; fit the scaler inside the pipeline.</li>
    <li>Never penalise the intercept.</li>
    <li>alpha bigger = stronger; C bigger = weaker.</li>
    <li>LogisticRegression is regularized by default.</li>
    <li>Lasso's choice among correlated features is arbitrary.</li>
    <li>Regularization fixes variance, not bias; report the plain loss, not J.</li>
  </ul>

  <h2 id="rg-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is regularization and why does it reduce overfitting?</summary><div class="qa-body">Regularization adds a penalty on model complexity to the training objective, J(w) = loss + λ·Ω(w), so the model may only use large weights when they reduce the loss by more than they cost. This removes the freedom to fit noise, lowering variance at the price of a little bias. With λ chosen by cross-validation the total error on new data goes down.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between L1 and L2 regularization?</summary><div class="qa-body">L2 (ridge) penalises the sum of squared weights; it shrinks every weight proportionally, never to exactly zero, and spreads weight across correlated features. L1 (lasso) penalises the sum of absolute weights; it can set weights exactly to zero, giving a sparse model and built-in feature selection, but picks one of a group of correlated features arbitrarily.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does L1 produce sparse solutions while L2 does not?</summary><div class="qa-body">The pull of the L2 penalty on a weight is 2λw, which fades as the weight gets small, so weak weights settle at small non-zero values. The pull of L1 is a constant λ, so any weight whose data push is weaker than λ is held at exactly zero (soft thresholding). Geometrically, the L1 constraint region is a diamond with corners on the axes, and the loss contours usually touch it at a corner, where some weights are zero; the L2 disc has no corners.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the ridge solution for one feature.</summary><div class="qa-body">Minimise Σ(y − wx)² + λw². The derivative is −2Σx(y − wx) + 2λw; setting it to zero gives w = Σxy/(Σx² + λ). That is the least-squares weight times Σx²/(Σx² + λ), a shrinkage factor below 1. In matrix form, w = (XᵀX + λI)⁻¹Xᵀy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens to ridge and lasso as λ goes to 0 and to infinity?</summary><div class="qa-body">At λ = 0 both become ordinary least squares. As λ grows, ridge shrinks all weights smoothly towards zero without reaching it, while lasso sets more and more weights exactly to zero; for lasso every weight is zero once λ passes α_max. In both cases, with λ very large the model just predicts the mean of y (the intercept).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do ridge, lasso and Elastic Net handle highly correlated features?</summary><div class="qa-body">Least squares gives large, unstable weights of opposite sign. Ridge shares the effect roughly equally and stably, because it heavily shrinks the poorly determined "difference" direction. Lasso tends to keep one feature and zero the other, and which one wins can flip with small changes in the data. Elastic Net keeps the group together while still allowing zeros, which is why it is preferred for correlated features.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must features be standardized before applying regularization?</summary><div class="qa-body">The penalty acts on weight size, and a weight's size depends on its feature's units. A feature in big numbers needs a tiny weight and escapes the penalty, while one in small numbers is penalised heavily, regardless of real importance. Standardizing puts every weight on the scale "effect per standard deviation" so the penalty treats them fairly. Trees don't need it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you choose λ? What is the 1-SE rule?</summary><div class="qa-body">By cross-validation over a log-spaced grid, inside a pipeline on the training data (RidgeCV, LassoCV, GridSearchCV). The 1-SE rule picks the largest λ whose CV error is within one standard error of the minimum, giving a simpler model that is statistically as good as the best.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is the intercept not regularized?</summary><div class="qa-body">The intercept only sets the average level of the predictions; it is not a source of overfitting. Penalising it would pull all predictions towards zero (on the flats it underpriced the average flat by ₹5.8 lakh). Shrinking the slopes pulls the model towards predicting the mean, which is the sensible simple model.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain how regularization affects bias and variance.</summary><div class="qa-body">It increases bias (weights are pulled towards zero, so they are wrong on average) and decreases variance (weights change less from one training set to another). For a single ridge weight, bias = −βλ/(Σx² + λ) and variance = σ²Σx²/(Σx² + λ)², and the best strength is λ = σ²/β². It helps most when effects are weak and data noisy, and it cannot fix underfitting.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In logistic regression, does C = 100 mean more or less regularization than C = 0.01?</summary><div class="qa-body">Less. C multiplies the data loss, so it acts like 1/λ; a bigger C means a weaker penalty and larger weights. scikit-learn's LogisticRegression uses an L2 penalty with C = 1 by default, which also keeps weights finite on perfectly separable data.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is weight decay, and is it the same as L2 regularization?</summary><div class="qa-body">Weight decay multiplies every weight by a factor slightly below 1 at each gradient step: w ← (1 − 2ηλ)w − η∇loss. For plain gradient descent this is exactly the gradient step on loss + λ‖w‖², so it equals L2 regularization. With adaptive optimisers like Adam the two differ, which is why AdamW applies decay separately from the gradient scaling.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is early stopping a form of regularization?</summary><div class="qa-body">Gradient descent from zero first grows the weights along strongly supported directions and only later along weak, noisy ones. Stopping when validation error is lowest limits how far the weights travel from zero, much like an L2 penalty; roughly, t steps with learning rate η behave like ridge with λ ≈ 1/(ηt).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is dropout and why does it reduce overfitting?</summary><div class="qa-body">Dropout randomly switches off each unit with probability p during every training step (scaling survivors by 1/(1 − p)) and uses the full network at prediction time. No unit can depend on specific partners, so the network learns redundant, robust features, and the result behaves like an average of many thinned networks, an ensemble.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Show that adding Gaussian noise to the inputs is equivalent to ridge regression.</summary><div class="qa-body">For noise ε with variance s², E[(y − (x + ε)ᵀw)²] = (y − xᵀw)² + s²‖w‖², because the cross term averages to zero. Summing over n rows gives RSS + n·s²‖w‖², which is ridge with λ = n·s².</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the Bayesian interpretation of L1 and L2?</summary><div class="qa-body">Penalised least squares is maximum a posteriori estimation, where the penalty is minus the log of a prior on the weights. A Gaussian prior with variance τ² gives ridge with λ = σ²/τ²; a Laplace prior gives lasso. Strong regularization therefore means noisy data or a firm prior belief that weights are small.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does cost-complexity pruning in decision trees relate to regularization?</summary><div class="qa-body">It minimises training error + α × number of leaves, the same "loss + λ × complexity" template with leaf count as the penalty. α is chosen by cross-validation along the pruning path, just as λ is chosen along a lasso path. XGBoost adds an L2 penalty on leaf values and a price γ per leaf.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your lasso model drops a feature that domain experts say matters. What could be going on?</summary><div class="qa-body">Most likely the feature is correlated with another one that lasso kept, so its signal was already "used up"; lasso picks one of a correlated group almost arbitrarily. Other causes: the features were not scaled, so the penalty was unfair, or λ is too large. Check stability with bootstrap refits, use Elastic Net, and verify scaling.</div></details>
</main>
`
});
