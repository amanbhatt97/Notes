// notes/ml/ml_regularization.js — Regularization
Object.assign(TOPIC_CONTENT, {
  "ml_regularization": `<main>
  <h1>Regularization</h1>
  <div class="where"><span>Machine Learning</span><span>Foundations</span><span>Regularization</span></div>
  <p class="lead">Regularization means adding a fine for complexity to the loss, so a model with many features (or many parameters) cannot chase the noise in its training rows. This note builds the idea from the overfitting problem: the L2 (ridge) penalty and its shrinkage, the L1 (lasso) penalty and why it sets weights to exactly zero, the diamond-and-circle geometry, Elastic Net, why you must scale first, how to choose λ by cross-validation, regularization paths, the bias–variance effect, and the other forms the same idea takes (C in logistic regression and SVMs, tree pruning, early stopping, dropout, noise and data augmentation). It ends with the Bayesian view, where a penalty is a prior belief. The running example is the Foundations group's <strong>ten flats in Pune</strong>, now with every column the portal records (area, carpet area, bedrooms, age, locality): every formula is first worked by hand on them, then checked in scikit-learn, then shown at scale.</p>

  <h2 id="rg-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 250" width="660">
<defs><marker id="reg-fa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<text x="330" y="18" text-anchor="middle" class="tm" font-size="11">Machine Learning › Foundations</text>
<rect x="20" y="34" width="140" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.45"/>
<text x="90" y="61" text-anchor="middle" font-size="12.5">What is ML</text>
<rect x="180" y="34" width="140" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.45"/>
<text x="250" y="61" text-anchor="middle" font-size="12.5">Splits &amp; CV</text>
<rect x="340" y="34" width="140" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.45"/>
<text x="410" y="61" text-anchor="middle" font-size="12.5">Bias &amp; Variance</text>
<rect x="500" y="34" width="140" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.45"/>
<text x="570" y="61" text-anchor="middle" font-size="12.5">Loss &amp; Grad. Descent</text>
<rect x="500" y="114" width="140" height="44" rx="8" class="fb sb" stroke-width="3"/>
<text x="570" y="134" text-anchor="middle" font-size="12.5" font-weight="700">Regularization</text>
<text x="570" y="150" text-anchor="middle" class="tb" font-size="10.5">YOU ARE HERE</text>
<rect x="340" y="114" width="140" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.45"/>
<text x="410" y="141" text-anchor="middle" font-size="12.5">Feature Engineering</text>
<rect x="180" y="114" width="140" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.45"/>
<text x="250" y="141" text-anchor="middle" font-size="12.5">Pipelines &amp; Leakage</text>
<line x1="160" y1="56" x2="178" y2="56" stroke="currentColor" marker-end="url(#reg-fa)"/>
<line x1="320" y1="56" x2="338" y2="56" stroke="currentColor" marker-end="url(#reg-fa)"/>
<line x1="480" y1="56" x2="498" y2="56" stroke="currentColor" marker-end="url(#reg-fa)"/>
<line x1="570" y1="78" x2="570" y2="112" stroke="currentColor" marker-end="url(#reg-fa)"/>
<line x1="500" y1="136" x2="482" y2="136" stroke="currentColor" marker-end="url(#reg-fa)"/>
<line x1="340" y1="136" x2="322" y2="136" stroke="currentColor" marker-end="url(#reg-fa)"/>
<text x="330" y="186" text-anchor="middle" class="tm" font-size="11">then every model group uses all seven ideas</text>
<rect x="40" y="196" width="130" height="34" rx="7" class="ft st"/><text x="105" y="217" text-anchor="middle" font-size="12">Regression</text>
<rect x="190" y="196" width="130" height="34" rx="7" class="ft st"/><text x="255" y="217" text-anchor="middle" font-size="12">Classification</text>
<rect x="340" y="196" width="130" height="34" rx="7" class="ft st"/><text x="405" y="217" text-anchor="middle" font-size="12">Trees</text>
<rect x="490" y="196" width="130" height="34" rx="7" class="ft st"/><text x="555" y="217" text-anchor="middle" font-size="12">Evaluation</text>
</svg><figcaption>The Foundations group. Regularization sits after loss and gradient descent (it changes the loss) and before feature engineering and pipelines (which decide what the penalised model sees). Every model group below uses it.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a> and <a class="xref" data-note="ml_loss_gd">Loss Functions &amp; Gradient Descent</a></b><span>You saw a model with too much freedom (degree 9 through ten flats, or 20 features for 25 rows) fit the training rows perfectly and fail on new ones: high variance. You also learnt that training means "minimise a loss" and that gradient descent does it faithfully, noise included. What was left open: how do you keep a flexible model but stop it from memorising, without throwing features away by hand?</span></li>
    <li><b>This note adds: a price on complexity</b><span>Change the thing being minimised from "loss" to "loss + λ × size of the weights". One knob, λ, now slides the model smoothly from "fit everything" to "predict the average". On the flats: the slope shrinks 6 → 4.5 → 3 as λ grows, and lasso keeps area, age and Baner while dropping carpet area, bedrooms and Kothrud (LOOCV 6.16 → 2.45). L2 shrinks all weights, L1 switches some off, Elastic Net mixes both, and λ is chosen by cross-validation. The same idea appears as C, ccp_alpha, early stopping, dropout and priors.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_features">Feature Engineering</a>, <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>, <a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a></b><span>A penalty on weight size only makes sense when features are on comparable scales (area in sq ft escapes the penalty, area in 100 sq ft does not), so feature engineering (scaling, encoding) comes next; pipelines then make sure the scaler and the λ search see training rows only. The full model-level treatment of ridge and lasso lives in the Regression group.</span></li>
  </ol>
  <p>You should know what a loss is and how gradient descent moves a weight (<a class="xref" data-note="ml_loss_gd">Loss &amp; GD</a>), what over- and underfitting look like (<a class="xref" data-note="ml_core">Bias &amp; Variance</a>) and what k-fold cross-validation does (<a class="xref" data-note="ml_splits">Train/Val/Test &amp; CV</a>). Each is re-explained in a line where it is used.</p>

  <h2 id="rg-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. The numbers come from the ten flats.</p>
  <ol class="story">
    <li><b>The overfitting problem</b><span>Q: what goes wrong with many, overlapping features? → Built-up and carpet area (correlation 0.9993) get weights 17.6 and −14.5, which jump to 23.4 and −22.1 when one flat is dropped. Weights explode and cancel. How do we keep them calm?</span></li>
    <li><b>The penalty idea</b><span>Q: how do we put a price on big weights? → Minimise loss + λ·Ω(w). For the weights (5.78, 5.09, 2.11), Σw² = 63.77 and Σ|w| = 12.98. Which penalty, and what does it do?</span></li>
    <li><b>L2 / ridge</b><span>Q: what does Σw² do to a weight? → w = Σxy/(Σx² + λ): the flats' slope 495/82.5 = 6 shrinks to 4.5 at λ = 27.5 and 3 at 82.5, and the twins get a stable (4.2, 2.2). But it never reaches zero, so useless columns stay in…</span></li>
    <li><b>L1 / lasso</b><span>Q: can a penalty switch a feature off? → Soft thresholding S(495, λ)/82.5: 4 at λ = 165, exactly 0 from λ = 495. Why zeros here and not with ridge?</span></li>
    <li><b>Geometry</b><span>Q: why does L1 give zeros? → Its budget region is a diamond with corners on the axes; the loss contours hit a corner. But with twins, lasso keeps one arbitrarily…</span></li>
    <li><b>Elastic Net</b><span>Q: can we be sparse and keep correlated groups together? → Mix both: S(495, 165)/(82.5 + 82.5) = 2. Yet the same λ gave 4.5 for area in 100 sq ft and almost nothing in sq ft…</span></li>
    <li><b>Scale first</b><span>Q: why do units change the answer? → The penalty sees weight size: ridge keeps 75% of the slope in 100 sq ft units, 99.997% in sq ft. Standardise. Then how big should λ be?</span></li>
    <li><b>Choosing λ by CV</b><span>Q: which λ? → The one with the best held-out error: with all six columns OLS LOOCV is 6.16, ridge at best 6.05, lasso (α = 0.5) 2.45. How does the model change as λ moves?</span></li>
    <li><b>Regularization paths</b><span>Q: what does every λ give at once? → Lasso path: nothing above α_max = 17.23, then area, then Baner, then age, then Kothrud; carpet and bedrooms never. Why exactly does shrinking help?</span></li>
    <li><b>Bias and variance</b><span>Q: what does λ trade? → Bias up, variance down; best λ* = σ²/β² = 0.11 for the strong area slope (almost no shrinkage) but large for weak effects. Is this only for linear models?</span></li>
    <li><b>Other models</b><span>Q: does the idea carry over? → C = 1/λ in logistic regression: on the flats' perfectly separable age data the weight grows 0.04 → 25.4 as C goes 0.01 → 10,000. Trees prune, boosting shrinks. Can we regularize without a penalty term at all?</span></li>
    <li><b>Early stopping</b><span>Q: can stopping early act as a penalty? → Yes: t steps of gradient descent ≈ ridge with λ ≈ 1/(ηt). And through the data itself?</span></li>
    <li><b>Dropout, noise, augmentation</b><span>Q: can noise in the data regularize? → Jittering every flat's area by ±1 (100 sq ft) gives slope 5.349 = ridge with λ = n·s² = 10 (5.351). What is λ, really?</span></li>
    <li><b>Penalty as a prior</b><span>Q: what does λ mean? → λ = σ²/τ², noise over prior belief; BayesianRidge learns λ = 0.142 on the flats, near the theoretical 0.11. Next: give the penalised model good, fairly scaled inputs → <a class="xref" data-note="ml_features">Feature Engineering</a>.</span></li>
  </ol>

  <h2 id="rg-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Regularization</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">1 · Why and what</div>
        <ul>
          <li><b>Problem</b> — many/overlapping features → weights huge, cancel, fit noise (twin areas: 17.6 and −14.5; 20 features/25 rows: test R² −16.7)</li>
          <li><b>Fix</b> — minimise <b>J(w) = Loss(w) + λ·Ω(w)</b>; λ ≥ 0 sets the price</li>
          <li>λ = 0 → plain least squares · λ → ∞ → all weights 0 (predict the mean, ₹67 lakh)</li>
          <li>Intercept is <b>not</b> penalised</li>
          <li>💡 A fine on spending: buy a big weight only if it earns its cost</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">2 · L2 / ridge</div>
        <ul>
          <li>Ω = Σw² · 1D: <b>w = Σxy / (Σx² + λ)</b> (flats 495/82.5 = 6 → 4.5 at λ = 27.5)</li>
          <li>Shrinks every weight by a factor, <b>never to exactly 0</b></li>
          <li>Gradient form = <b>weight decay</b>: w ← (1 − 2ηλ)w − η∇RSS</li>
          <li>Matrix: (XᵀX + λI)⁻¹Xᵀy; direction with eigenvalue d kept by d/(d + λ) (twins: 99.3% vs 4.0%)</li>
          <li>Correlated twins: <b>shares</b> the weight (4.2, 2.2)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">3 · L1 / lasso &amp; Elastic Net</div>
        <ul>
          <li>Ω = Σ|w| · 1D: <b>w = S(Σxy, λ) / Σx²</b>, S = soft threshold sign(z)·max(|z| − λ, 0)</li>
          <li>Flats: 6 → 4 (λ = 165) → 0 (λ ≥ 495); pull is a constant λ → exact zeros</li>
          <li>Geometry: diamond's corners lie on the axes; circle has none</li>
          <li>Twins: keeps <b>one</b>, arbitrarily · ⚠ unstable selection</li>
          <li><b>Elastic Net</b>: w = S(Σxy, λ₁)/(Σx² + λ₂) → 330/165 = 2; sparse <i>and</i> groups twins</li>
          <li>sklearn: <code>alpha</code> = strength, <code>l1_ratio</code> = mix; loss scaled by 1/(2n)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">4 · Using it right</div>
        <ul>
          <li><b>Scale first</b> — same λ keeps 75% of the slope (100 sq ft) or 99.997% (sq ft)</li>
          <li><b>λ by CV</b> — flats LOOCV: OLS 6.16, ridge 6.05, lasso 2.45; or the <b>1-SE rule</b></li>
          <li>RidgeCV (fast LOO), LassoCV, ElasticNetCV, LogisticRegressionCV</li>
          <li><b>Path</b> — lasso enters one by one from α_max = max|xⱼᵀy|/n (flats: 17.23, area first)</li>
          <li><b>Bias ↑, variance ↓</b>; λ* = σ²/β²; sim: 20.2 → 14.4 → 21.4</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">5 · Same idea, other names</div>
        <ul>
          <li>Logistic / SVM: <b>C = 1/λ</b> (bigger C = weaker penalty) ⚠; flats age weight 0.04 → 25.4</li>
          <li>Trees: <b>pruning</b> R(T) + α|T|, max_depth, min_samples_leaf</li>
          <li>Boosting: learning_rate, reg_lambda, subsample</li>
          <li><b>Early stopping</b> ≈ L2 with λ ≈ 1/(η·t)</li>
          <li><b>Dropout</b> · <b>input noise</b> = ridge with λ = n·s² (flats 5.349 vs 5.351) · <b>augmentation</b></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">6 · Bayesian view (MAP)</div>
        <ul>
          <li>Penalty = −log prior: Gaussian prior → L2, Laplace prior → L1</li>
          <li><b>λ = σ²/τ²</b> (noise variance / prior variance)</li>
          <li>σ = 1, τ = 0.2 → λ = 25 (= best λ in the weak-slope example)</li>
          <li>BayesianRidge learns σ², τ²: flats λ = 0.142; diabetes 14.856</li>
          <li>⚠ Lasso is the posterior <i>mode</i>; the mean is not sparse</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="rg-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="rg-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Regularize</span><span class="rm-sub">Huge, unstable weights</span></div></div>
      <div class="rm-item rm-done" data-target="rg-idea"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Penalty Idea</span><span class="rm-sub">Loss + λ·penalty</span></div></div>
      <div class="rm-item rm-done" data-target="rg-l2"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">L2 (Ridge) by Hand</span><span class="rm-sub">Shrinkage and weight decay</span></div></div>
      <div class="rm-item rm-done" data-target="rg-l1"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">L1 (Lasso) and Sparsity</span><span class="rm-sub">Soft thresholding by hand</span></div></div>
      <div class="rm-item rm-done" data-target="rg-geom"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Diamond vs Circle</span><span class="rm-sub">The geometry of zeros</span></div></div>
      <div class="rm-item rm-done" data-target="rg-enet"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Elastic Net</span><span class="rm-sub">Mixing L1 and L2</span></div></div>
      <div class="rm-item rm-done" data-target="rg-scale"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Scale First</span><span class="rm-sub">Why units change the answer</span></div></div>
      <div class="rm-item rm-done" data-target="rg-cv"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Choosing λ by CV</span><span class="rm-sub">LOO on the flats, 1-SE rule</span></div></div>
      <div class="rm-item rm-done" data-target="rg-path"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Regularization Paths</span><span class="rm-sub">Weights as λ moves</span></div></div>
      <div class="rm-item rm-done" data-target="rg-bv"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Bias &amp; Variance</span><span class="rm-sub">Derived and simulated</span></div></div>
      <div class="rm-item rm-done" data-target="rg-models"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">In Other Models</span><span class="rm-sub">C, pruning, boosting, nets</span></div></div>
      <div class="rm-item rm-done" data-target="rg-early"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Early Stopping</span><span class="rm-sub">Stop before the noise</span></div></div>
      <div class="rm-item rm-done" data-target="rg-noise"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Dropout, Noise, Augmentation</span><span class="rm-sub">Regularizing through data</span></div></div>
      <div class="rm-item rm-done" data-target="rg-bayes"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Penalty as a Prior</span><span class="rm-sub">The MAP view</span></div></div>
      <div class="rm-item rm-done" data-target="rg-connect"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="rg-compare"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">Comparisons</span><span class="rm-sub">L1 vs L2 vs Elastic Net vs others</span></div></div>
      <div class="rm-item rm-done" data-target="rg-traps"><span class="rm-num">17</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Traps in code and interviews</span></div></div>
      <div class="rm-item rm-done" data-target="rg-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="rg-qa"><span class="rm-num">18</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="rg-why"><span class="num">01</span>Why Regularize</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Gradient descent minimises the training loss faithfully, and the bias–variance note showed that "faithfully" includes fitting noise. With one clean column (area) the flats' line was fine. What happens when the portal feeds the model every column it has, several of which say almost the same thing?</p>
  </div>
  <h3>The need</h3>
  <p>Linear regression picks the weights that make the training error as small as possible. That sounds right, but "as small as possible on these rows" is not the same as "good on new rows". When the model has a lot of freedom compared to the amount of data, it can lower the training error by fitting the random noise in those particular rows. The giveaway is the weights: they become very large, often with opposite signs that cancel each other.</p>
  <h3>Worked by hand: two columns that measure the same thing</h3>
  <p>The portal records two areas for each flat: built-up area (5 … 14, in 100 sq ft) and carpet area, the floor you can actually walk on, which is about 80% of it: 4.1, 4.7, 5.6, 6.5, 7.1, 8.0, 8.9, 9.6, 10.3, 11.3. Their correlation is 0.9993: they are near-copies.</p>
  <p>The honest answer is easy to state: price rises about ₹6 lakh per 100 sq ft of built-up area, so any split with w₁ + 0.8·w₂ ≈ 6 predicts well, for example (6, 0) or (3, 3.75). Least squares, fitted on all ten flats, picks (17.61, −14.50): check 17.61 − 0.8 × 14.50 = 6.01 ✓. The predictions are fine, but the weights are absurd: "each 100 sq ft of built-up area adds ₹17.6 lakh, and each 100 sq ft of carpet area <em>removes</em> ₹14.5 lakh". Drop flat J and refit: (23.36, −22.09). Drop flat A: (16.21, −12.84). Nearly identical datasets, very different weights: that is <strong>high variance</strong>.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression, Ridge

area   = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14], dtype=float)        # built-up area, 100 sq ft
carpet = np.array([4.1, 4.7, 5.6, 6.5, 7.1, 8.0, 8.9, 9.6, 10.3, 11.3])    # carpet area: about 0.8 x area
price  = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96], dtype=float)
X = np.c_[area, carpet]
print("correlation of the two columns:", np.corrcoef(area, carpet)[0, 1].round(4))
for left_out in [None, "A", "J", "E"]:                    # refit with one flat removed
    keep = np.ones(10, bool)
    if left_out: keep["ABCDEFGHIJ".index(left_out)] = False
    ols = LinearRegression().fit(X[keep], price[keep]).coef_
    rdg = Ridge(alpha=1).fit(X[keep], price[keep]).coef_
    print(f"without {left_out or '-'}:  OLS w = {ols.round(2)}   ridge(λ=1) w = {rdg.round(2)}")
Xc = X - X.mean(axis=0)
print("eigenvalues of XᵀX (centred):", np.linalg.eigvalsh(Xc.T @ Xc).round(3))</div>
  <div class="fx" data-lang="text">correlation of the two columns: 0.9993
without -:  OLS w = [ 17.61 -14.5 ]   ridge(λ=1) w = [4.19 2.2 ]
without A:  OLS w = [ 16.21 -12.84]   ridge(λ=1) w = [3.9  2.31]
without J:  OLS w = [ 23.36 -22.09]   ridge(λ=1) w = [4.21 1.96]
without E:  OLS w = [ 15.14 -11.4 ]   ridge(λ=1) w = [4.02 2.44]
eigenvalues of XᵀX (centred): [4.20000e-02 1.35407e+02]</div>
  <p>The ridge column (explained in section 03) gives about (4, 2.2) every time: both areas share the credit, stable to which flats are in the data. Why does least squares wobble so much? Because the two columns are nearly the same, there is one direction in weight space, "more built-up, less carpet", that hardly changes the predictions on these rows. The small eigenvalue 0.042 of XᵀX (against 135.4 for the other direction) measures exactly how little it changes them. A direction that costs nothing can be pushed anywhere by noise. Regularization puts a price on moving in it.</p>
  <h3>The same thing at scale: 20 features, 25 rows</h3>
  <p>25 training rows, 20 features, but only the first 3 matter (true weights 3, −2, 1.5). Least squares has 21 numbers to set from 25 rows, so it can bend to the noise.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.metrics import r2_score

rng = np.random.default_rng(0)
n_train, n_test, p = 25, 1000, 20
X = rng.normal(size=(n_train + n_test, p))
true_w = np.zeros(p); true_w[:3] = [3, -2, 1.5]          # only 3 of 20 features matter
y = X @ true_w + rng.normal(0, 2, n_train + n_test)
Xtr, ytr, Xte, yte = X[:n_train], y[:n_train], X[n_train:], y[n_train:]

for name, m in [("OLS", LinearRegression()), ("Ridge λ=10", Ridge(alpha=10))]:
    m.fit(Xtr, ytr)
    print(f"{name:10s} train R2 {r2_score(ytr, m.predict(Xtr)):.3f}  "
          f"test R2 {r2_score(yte, m.predict(Xte)):.3f}  sum|w| {np.abs(m.coef_).sum():5.1f}  "
          f"first 3 w {m.coef_[:3].round(2)}")</div>
  <div class="fx" data-lang="text">OLS        train R2 0.985  test R2 -16.700  sum|w|  72.9  first 3 w [5.47 0.55 6.39]
Ridge λ=10 train R2 0.786  test R2 0.403  sum|w|   9.1  first 3 w [ 1.19 -1.26  0.76]</div>
  <p>Least squares explains 98.5% of the training variance and then scores R² = −16.7 on 1,000 new rows, far worse than predicting the average (R² = 0). Its weights add up to 72.9 in size, against a true total of 6.5. With a penalty (λ = 10), training R² drops to 0.786, test R² rises to 0.403, and the weights are calm. Giving up a little training fit bought a lot of test fit.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A student who memorises last year's answer key scores 100% on last year's paper and fails this year's. A teacher who deducts marks for "overly specific answers" pushes students to learn the general rule. The deduction is the penalty; how strict the teacher is, is λ.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Just drop features until it stops overfitting" is the manual version of this (here: delete carpet area). It is slow, it ignores features that each carry a little signal, and choosing which to drop using the same data is itself a form of overfitting. Regularization does the trimming smoothly, with one knob you can tune honestly.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The Penalty Idea.</b> We need a precise rule for "keep the weights calm" that a training algorithm can minimise.</div>

  <h2 id="rg-idea"><span class="num">02</span>The Penalty Idea</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The twin-area weights (17.6, −14.5) fit the training flats as well as (4, 2.2) do. Least squares has no reason to prefer the calm pair. What extra term in the objective would make it prefer small weights?</p>
  </div>
  <p>Keep the loss, add a second term that grows with the size of the weights, and minimise the sum:</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>J(w) = Loss(w) + λ · Ω(w)</strong>. Loss(w) measures misfit on the training rows (for regression, RSS = Σ(yᵢ − ŷᵢ)²). Ω(w) is the <strong>penalty</strong> (also called regularizer): <strong>L2</strong> Ω = Σⱼ wⱼ², <strong>L1</strong> Ω = Σⱼ |wⱼ|. λ ≥ 0 is the <strong>regularization strength</strong>, a hyperparameter you choose (sklearn calls it <code>alpha</code>). The intercept b is not in Ω.</p>
  </div>
  <p>Read it as a negotiation. The loss wants weights that fit the rows; the penalty wants weights near zero. A weight is allowed to be large only if the drop in loss it buys is bigger than the penalty it costs. The two ends of the dial are easy to reason about:</p>
  <ul>
    <li><strong>λ = 0</strong>: no penalty, plain least squares.</li>
    <li><strong>λ → ∞</strong>: any non-zero weight costs infinitely much, so every w = 0 and the model predicts the intercept, the mean price ₹67 lakh, for every flat.</li>
    <li>In between: a smooth slide from "flexible" to "simple". Section 08 picks the point on that slide.</li>
  </ul>
  <h3>Worked by hand: the two penalties on the flats' weights</h3>
  <p>The bias–variance note fitted price on area plus locality: w = (5.78 per 100 sq ft, 5.09 for Baner, 2.11 for Kothrud).</p>
  <table class="tbl">
    <tr><th></th><th>w₁ = 5.78</th><th>w₂ = 5.09</th><th>w₃ = 2.11</th><th>total</th></tr>
    <tr><td>L2 terms w²</td><td>33.41</td><td>25.91</td><td>4.45</td><td>63.77</td></tr>
    <tr><td>L1 terms |w|</td><td>5.78</td><td>5.09</td><td>2.11</td><td>12.98</td></tr>
  </table>
  <div class="fx" data-lang="py">import numpy as np
w = np.array([5.78, 5.09, 2.11])          # flats model: per 100 sq ft, Baner, Kothrud
for lam in [0, 0.1, 1]:
    l2 = lam * (w ** 2).sum()            # ridge penalty  λ·Σw²
    l1 = lam * np.abs(w).sum()           # lasso penalty  λ·Σ|w|
    print(f"λ={lam:&lt;4} L2 penalty={l2:6.2f}   L1 penalty={l1:5.2f}")</div>
  <div class="fx" data-lang="text">λ=0    L2 penalty=  0.00   L1 penalty= 0.00
λ=0.1  L2 penalty=  6.38   L1 penalty= 1.30
λ=1    L2 penalty= 63.77   L1 penalty=12.98</div>
  <p>Look at the share of the smallest weight, Kothrud's 2.11. In L2 it contributes 4.45 of 63.77 (7%), because squaring makes small numbers tiny; in L1 it contributes 2.11 of 12.98 (16%): every unit of weight costs the same, whether it is the first unit or the sixth. That one difference, "squared" versus "absolute", explains everything that follows: L2 is obsessed with cutting the largest weights, L1 is just as happy to cut a small weight all the way to zero.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Why leave the intercept out? The intercept just sets the average level of the predictions. Penalising it would pull flat prices toward ₹0 for no reason. Penalising slopes pulls the model toward "every flat gets the average price", which is the sensible simple model. sklearn never penalises <code>intercept_</code> in Ridge, Lasso and ElasticNet; it does so by centring X and y before fitting.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Regularization is used <strong>only while training</strong>. When you report the model's error on validation or test rows, you report the plain loss (MSE, log loss), not J. The penalty is a training device, not part of the score.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: L2 (Ridge) by Hand.</b> We have two candidate penalties. What does the squared one actually do to a fitted weight, in numbers?</div>

  <h2 id="rg-l2"><span class="num">03</span>L2 (Ridge) by Hand</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Adding λΣw² to the cost must change the best weight. By how much, as a formula, and is it the same thing as the "weight decay" people mention for neural networks?</p>
  </div>
  <h3>Deriving the 1-feature formula</h3>
  <p>One feature, no intercept (data already centred), rows (xᵢ, yᵢ). Ridge minimises</p>
  <p style="text-align:center"><strong>J(w) = Σ(yᵢ − w·xᵢ)² + λw²</strong></p>
  <p>Step 1: slope of the first term. d/dw of (yᵢ − wxᵢ)² is 2(yᵢ − wxᵢ)·(−xᵢ). Summed: −2Σxᵢyᵢ + 2wΣxᵢ². Step 2: slope of λw² is 2λw. Step 3: set the total slope to 0:</p>
  <p style="text-align:center">−2Σxy + 2wΣx² + 2λw = 0 &nbsp;⇒&nbsp; w(Σx² + λ) = Σxy &nbsp;⇒&nbsp; <strong>w_ridge = Σxy / (Σx² + λ)</strong></p>
  <p>Compare with least squares, w_OLS = Σxy / Σx². Ridge adds λ to the denominator. So w_ridge = w_OLS × Σx² / (Σx² + λ): the least-squares answer multiplied by a <strong>shrinkage factor</strong> between 0 and 1. It can get as small as you like, but a fraction of a non-zero number is never zero.</p>
  <h3>Worked by hand on the ten flats</h3>
  <p>Centre area and price (subtract 9.5 and 67), as the intercept is not penalised. From the first note: Σxy = 495, Σx² = 82.5, and Σy² = 3016. The RSS for any slope is RSS(w) = Σy² − 2wΣxy + w²Σx².</p>
  <table class="tbl">
    <tr><th>λ</th><th>w = 495 / (82.5 + λ)</th><th>shrink factor 82.5/(82.5+λ)</th><th>RSS = 3016 − 990w + 82.5w²</th><th>J = RSS + λw²</th></tr>
    <tr><td>0</td><td>6</td><td>1.000</td><td>46.0</td><td>46.0</td></tr>
    <tr><td>27.5</td><td>4.5</td><td>0.750</td><td>3016 − 4455 + 1670.6 = 231.6</td><td>231.6 + 556.9 = 788.5</td></tr>
    <tr><td>82.5</td><td>3</td><td>0.500</td><td>788.5</td><td>788.5 + 742.5 = 1531.0</td></tr>
    <tr><td>247.5</td><td>1.5</td><td>0.250</td><td>1716.6</td><td>2273.5</td></tr>
  </table>
  <p>Check that ridge really wins its own game at λ = 27.5. The least-squares slope 6 has RSS 46 but a penalty of 27.5 × 36 = 990, so J = 1036. The ridge slope 4.5 has a much worse RSS (231.6) but J = 788.5, lower. Ridge accepts a worse fit because the weight is cheaper. When λ = Σx² = 82.5, the slope is exactly halved.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import Ridge

area  = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14], dtype=float)
price = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96], dtype=float)
x, y = area - area.mean(), price - price.mean()          # centred: the intercept is not penalised
Sxy, Sxx, Syy = (x * y).sum(), (x * x).sum(), (y * y).sum()   # 495, 82.5, 3016
for lam in [0, 27.5, 82.5, 247.5]:
    hand = Sxy / (Sxx + lam)                             # w = Σxy / (Σx² + λ)
    skl = Ridge(alpha=lam).fit(area[:, None], price).coef_[0]
    rss = Syy - 2 * Sxy * hand + Sxx * hand**2
    print(f"λ={lam:&lt;6} hand w={hand:.4f}  sklearn w={skl:.4f}  shrink={Sxx/(Sxx+lam):.3f}  "
          f"RSS={rss:7.2f}  J=RSS+λw²={rss + lam*hand**2:7.2f}")</div>
  <div class="fx" data-lang="text">λ=0      hand w=6.0000  sklearn w=6.0000  shrink=1.000  RSS=  46.00  J=RSS+λw²=  46.00
λ=27.5   hand w=4.5000  sklearn w=4.5000  shrink=0.750  RSS= 231.62  J=RSS+λw²= 788.50
λ=82.5   hand w=3.0000  sklearn w=3.0000  shrink=0.500  RSS= 788.50  J=RSS+λw²=1531.00
λ=247.5  hand w=1.5000  sklearn w=1.5000  shrink=0.250  RSS=1716.62  J=RSS+λw²=2273.50</div>
  <p><code>Ridge(alpha=λ)</code> with an (unpenalised) intercept minimises exactly Σ(y − Xw − b)² + α‖w‖², so it matches the hand formula to every digit. (Of course the flats' slope does not <em>need</em> shrinking; it is a strong, well-measured effect. The point is the mechanism; section 10 shows when shrinking pays.)</p>
  <h3>Weight decay: the same thing seen from gradient descent</h3>
  <p>With gradient descent (step size η), the update is w ← w − η·(slope of J). The slope is ∇RSS + 2λw, so</p>
  <p style="text-align:center"><strong>w ← w − η∇RSS − 2ηλw = (1 − 2ηλ)·w − η∇RSS</strong></p>
  <p>Before taking the usual data step, every weight is multiplied by (1 − 2ηλ), a number just below 1. The weight "decays" a little at every step unless the data keeps pushing it up. That is why neural-network libraries call L2 <strong>weight decay</strong>. By hand with η = 0.004, λ = 27.5 (decay factor 1 − 0.22 = 0.78), starting at w = 0: ∇RSS = −2(495 − 82.5w) = −990, so w = 0.78 × 0 + 0.004 × 990 = 3.96. Step 2: ∇RSS = −2(495 − 326.7) = −336.6, w = 0.78 × 3.96 + 1.3464 = 4.4352.</p>
  <div class="fx" data-lang="py">import numpy as np
x = np.arange(5, 15, dtype=float) - 9.5                  # centred area of the ten flats
y = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96], dtype=float) - 67
lam, eta, w = 27.5, 0.004, 0.0
for step in range(1, 41):
    grad_rss = -2 * (x * (y - w * x)).sum()              # slope of the data loss: -2(495 - 82.5 w)
    w = (1 - 2 * eta * lam) * w - eta * grad_rss         # weight decay form, decay factor 0.78
    if step in (1, 2, 3, 10, 40):
        print(f"step {step:2d}: w = {w:.4f}")
print("closed form:", 495 / (82.5 + lam))</div>
  <div class="fx" data-lang="text">step  1: w = 3.9600
step  2: w = 4.4352
step  3: w = 4.4922
step 10: w = 4.5000
step 40: w = 4.5000
closed form: 4.5</div>
  <p>Gradient descent with the decay term lands on 4.5, the closed-form ridge answer.</p>
  <h3>Many features: shrinking along directions</h3>
  <p>With several features the same derivation in matrix form gives w = (XᵀX + λI)⁻¹Xᵀy: λ is added to every diagonal entry of XᵀX (worked by hand on a 2×2 case in <a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a>). The cleanest way to see what it does: XᵀX has eigen-directions with eigenvalues d (how much the data "pins down" the weights in that direction). Along each direction, least squares keeps 100% of its estimate; ridge keeps <strong>d / (d + λ)</strong>.</p>
  <p>For the twin areas, XᵀX has d = 135.4 (direction "both areas up together", well pinned by the data) and d = 0.042 (direction "built-up up, carpet down", barely pinned). With λ = 1: the first keeps 135.4/136.4 = 99.3%, the second keeps 0.042/1.042 = 4.0%. Ridge almost deletes exactly the unstable direction that noise was exploiting and leaves the well-measured one nearly alone. That is why its answer did not move when a flat was dropped.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Ridge regression (L2, Tikhonov regularization)</strong>: minimise ‖y − Xw‖² + λ‖w‖₂². Closed form ŵ = (XᵀX + λI)⁻¹Xᵀy, which exists for every λ &gt; 0 even when XᵀX is singular (more features than rows, or exact copies). Every weight is shrunk; none becomes exactly 0. Strongly correlated features share the weight.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Ridge does feature selection" is false. It makes weights small, never zero: carpet area keeps 2.2 even though built-up area already says everything. If you need a short list of features, you need L1 (next section) or an explicit selection method (<a class="xref" data-note="ml_dimred">Feature Selection</a>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: L1 (Lasso) and Sparsity.</b> Ridge keeps every column, including carpet area and the 17 useless features of the 20-feature example, just with small weights. Can a penalty switch useless features fully off?</div>

  <h2 id="rg-l1"><span class="num">04</span>L1 (Lasso) and Sparsity</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Ridge made the twin weights calm but kept both. The portal would like a model that says "carpet area adds nothing once you know built-up area" by giving it a weight of exactly zero. Can the absolute-value penalty do that, and why?</p>
  </div>
  <h3>Deriving the 1-feature formula</h3>
  <p>Same centred flats, now with the absolute-value penalty. We use ½RSS (the ½ just makes the slope tidier):</p>
  <p style="text-align:center"><strong>J(w) = ½Σ(yᵢ − w·xᵢ)² + λ|w|</strong></p>
  <p>|w| has a kink at 0: its slope is +1 for w &gt; 0, −1 for w &lt; 0, and at w = 0 it is "anything between −1 and +1" (the <strong>subgradient</strong>). Take the three cases:</p>
  <ul>
    <li><strong>w &gt; 0</strong>: slope = −Σxy + wΣx² + λ = 0 ⇒ w = (Σxy − λ)/Σx². Valid only if this is positive, i.e. Σxy &gt; λ.</li>
    <li><strong>w &lt; 0</strong>: slope = −Σxy + wΣx² − λ = 0 ⇒ w = (Σxy + λ)/Σx². Valid only if Σxy &lt; −λ.</li>
    <li><strong>w = 0</strong>: optimal when the data's push, Σxy, is inside [−λ, λ]: the penalty's kink can absorb it.</li>
  </ul>
  <p>All three cases fit in one line with the <strong>soft-threshold</strong> function S(z, λ) = sign(z)·max(|z| − λ, 0):</p>
  <p style="text-align:center"><strong>w_lasso = S(Σxy, λ) / Σx²</strong></p>
  <p>Ridge <em>divided</em>; lasso <em>subtracts</em> a fixed amount λ from the data's push, and if the push is smaller than λ the answer is exactly 0.</p>
  <h3>Worked by hand on the flats</h3>
  <p>Σxy = 495, Σx² = 82.5.</p>
  <table class="tbl">
    <tr><th>λ</th><th>lasso S(495, λ)/82.5</th><th>ridge 495/(82.5 + λ), for contrast</th></tr>
    <tr><td>0</td><td>495/82.5 = 6</td><td>6</td></tr>
    <tr><td>165</td><td>330/82.5 = 4</td><td>2.0</td></tr>
    <tr><td>330</td><td>165/82.5 = 2</td><td>1.2</td></tr>
    <tr><td>495</td><td>0/82.5 = <strong>0</strong></td><td>0.857</td></tr>
    <tr><td>600</td><td>max(495 − 600, 0) = <strong>0</strong></td><td>0.725</td></tr>
  </table>
  <p>(The two columns use different scalings, ½RSS + λ|w| and RSS + λw², so compare their shapes, not their values: lasso falls in a straight line and hits zero; ridge flattens out and never does.) sklearn's Lasso writes the loss as (1/(2n))·RSS + α‖w‖₁. Multiply our J by 1/n and you see α = λ/n, so λ = 165 is <code>Lasso(alpha=16.5)</code> here:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import Lasso

area  = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14], dtype=float)
price = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96], dtype=float)
n = len(area)
Sxy, Sxx = 495.0, 82.5                                   # centred sums from section 03
soft = lambda z, t: np.sign(z) * max(abs(z) - t, 0)      # soft threshold S(z, t)
for lam in [0, 165, 330, 495, 600]:
    hand = soft(Sxy, lam) / Sxx                          # lasso: ½RSS + λ|w|
    skl = Lasso(alpha=lam / n).fit(area[:, None], price).coef_[0] if lam else hand
    ridge = Sxy / (Sxx + lam)                            # ridge, for contrast
    print(f"λ={lam:&lt;4} lasso hand={hand:.4f} sklearn={skl:.4f}   ridge={ridge:.4f}")</div>
  <div class="fx" data-lang="text">λ=0    lasso hand=6.0000 sklearn=6.0000   ridge=6.0000
λ=165  lasso hand=4.0000 sklearn=4.0000   ridge=2.0000
λ=330  lasso hand=2.0000 sklearn=2.0000   ridge=1.2000
λ=495  lasso hand=0.0000 sklearn=0.0000   ridge=0.8571
λ=600  lasso hand=0.0000 sklearn=0.0000   ridge=0.7253</div>
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
  <h3>Why the zeros: the pull on one weight</h3>
  <p>During training the penalty pulls each weight toward 0. The size of the pull is the slope of the penalty. L2: slope of λw² is 2λw, proportional to w. L1: slope of λ|w| is λ, constant. Take λ = 1:</p>
  <table class="tbl">
    <tr><th>current w</th><th>L2 pull 2λw</th><th>L1 pull λ</th></tr>
    <tr><td>4</td><td>8</td><td>1</td></tr>
    <tr><td>1</td><td>2</td><td>1</td></tr>
    <tr><td>0.25</td><td>0.5</td><td>1</td></tr>
    <tr><td>0.01</td><td>0.02 (almost nothing)</td><td>1 (full strength)</td></tr>
  </table>
  <p>As a weight gets small, the L2 pull fades away, so it settles at some small non-zero value where the data's push balances the weak pull. The L1 pull never fades. If the data's push on a weight is weaker than λ all the way down, nothing can hold the weight up, and it lands on exactly 0 and stays there. A model in which many weights are exactly 0 is called <strong>sparse</strong>, and reading off the non-zero weights is a built-in <strong>feature selection</strong>. On the six-column flats (section 08) that is exactly what happens to carpet area: once built-up area is in, carpet area's remaining push is tiny, and it stays at 0.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>L2 is a percentage tax: earn ₹100, pay ₹10; earn ₹10, pay ₹1. Small earners shrink but survive. L1 is a fixed licence fee of ₹500: any business earning less than ₹500 is better off closing. Lasso closes the weak features.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Lasso (L1, Least Absolute Shrinkage and Selection Operator, Tibshirani 1996)</strong>: minimise ½‖y − Xw‖² + λ‖w‖₁ (sklearn: (1/(2n))‖y − Xw‖² + α‖w‖₁, so α = λ/n). For one feature, or orthonormal features, the solution is soft thresholding S(z, λ). In general there is no closed form; sklearn solves it by <strong>coordinate descent</strong>: repeatedly soft-threshold one weight at a time while holding the others fixed (details in <a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a>). With p &gt; n, lasso keeps at most n non-zero weights.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Lasso's zeros are not proof that a feature is useless. When two features are near-copies, lasso keeps one and zeroes the other, and which one wins can flip with a tiny change in data (built-up area beat carpet area by a push of 17.23 to 17.18, section 09). Treat the selected set as a shortlist, not a scientific finding.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Diamond vs Circle.</b> The pull argument explains zeros for one weight. With several weights at once, is there a picture that shows why L1 lands on axes and L2 does not?</div>

  <h2 id="rg-geom"><span class="num">05</span>The Geometry: Diamond vs Circle</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>For one weight we saw lasso cut to zero and ridge only shrink. With two or more weights competing (built-up vs carpet area), what decides which ones become exactly zero?</p>
  </div>
  <p>There is a second, equivalent way to write each penalty: instead of "add λ × penalty", say "minimise the loss, but the weights must stay inside a budget": Σw² ≤ t for ridge, Σ|w| ≤ t for lasso. For every λ there is a budget t that gives the same answer (a bigger λ means a smaller t). Now draw it for two weights.</p>
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
  <p>How to read it. The axes are the two weights (think built-up and carpet area). The red dot is the least-squares answer, outside the budget. Each red oval is a set of weights with the same RSS; ovals further from the dot have higher RSS. The solution is the first point where a growing oval touches the blue region. The L1 region is a diamond whose corners sit on the axes. A corner sticks out, so a growing oval coming from almost any direction hits a corner first, and at a corner one weight is exactly 0. The L2 region is a round disc with no corners, so the touching point is almost never on an axis. For the twin areas the ovals are extremely long and thin (eigenvalues 135.4 vs 0.042), lying along the direction w₁ + 0.8w₂ = constant; the disc is touched near the middle (both weights shared), the diamond at a corner (one area kept). In more dimensions the L1 ball has even more corners and edges, so sparsity becomes even more likely.</p>
  <h3>Worked by hand: three uncorrelated features</h3>
  <p>When the features are uncorrelated and scaled so that XᵀX = I (orthonormal), the problem splits into one 1-feature problem per weight, and both answers are exact formulas of the least-squares weights z: ridge (with RSS + λΣw²) gives w = z/(1 + λ), lasso (with ½RSS + λΣ|w|) gives w = S(z, λ). Take z = (3, 0.8, −0.3), λ = 1 (think: a strong feature like area, a modest one like locality, a weak one like bedrooms):</p>
  <table class="tbl">
    <tr><th>feature</th><th>least squares z</th><th>ridge z/(1+λ)</th><th>lasso S(z, 1)</th></tr>
    <tr><td>1</td><td>3</td><td>1.5</td><td>3 − 1 = 2</td></tr>
    <tr><td>2</td><td>0.8</td><td>0.4</td><td>|0.8| &lt; 1 → <strong>0</strong></td></tr>
    <tr><td>3</td><td>−0.3</td><td>−0.15</td><td>|−0.3| &lt; 1 → <strong>0</strong></td></tr>
  </table>
  <div class="fx" data-lang="py">import numpy as np
z = np.array([3.0, 0.8, -0.3])                 # OLS weights when features are orthonormal
lam = 1.0
ridge = z / (1 + lam)                                     # RSS + λΣw²
lasso = np.sign(z) * np.maximum(np.abs(z) - lam, 0) + 0.0  # ½RSS + λΣ|w|
print("OLS  ", z); print("ridge", ridge.round(3)); print("lasso", lasso.round(3))</div>
  <div class="fx" data-lang="text">OLS   [ 3.   0.8 -0.3]
ridge [ 1.5   0.4  -0.15]
lasso [2. 0. 0.]</div>
  <p>Two contrasts to remember. Ridge cut the strong weight in half (3 → 1.5), more than lasso did (3 → 2): ridge shrinks big weights proportionally, lasso by a constant. And lasso removed the two weak features, which ridge only shrank.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>There is a third penalty in the textbooks, L0: Ω = number of non-zero weights. With orthonormal features it gives <strong>hard thresholding</strong> (keep z unchanged if |z| is big enough, else 0). It is exactly "best subset selection", which is a combinatorial search (2ᵖ subsets: 64 for the flats' six columns, 10³⁰ for 100 columns). L1 is the closest <em>convex</em> penalty to L0, which is why lasso can be solved fast and still gives zeros. L2 is smooth and convex but gives no zeros.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Elastic Net.</b> Lasso picks one of a group of correlated features arbitrarily; ridge keeps all of them but cannot drop the useless ones. Can we get both behaviours?</div>

  <h2 id="rg-enet"><span class="num">06</span>Elastic Net</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>For the twin areas we want two things at once: zero out truly useless columns (like a noise column), but treat the two areas as a team rather than letting chance pick one. Neither ridge nor lasso alone does both. Can a mix?</p>
  </div>
  <h3>The formula and the 1-feature answer</h3>
  <p>Elastic Net (Zou &amp; Hastie, 2005) simply uses both penalties: J(w) = ½RSS + λ₁Σ|w| + ½λ₂Σw². The same case analysis as for lasso, with the extra λ₂w in the slope, gives</p>
  <p style="text-align:center"><strong>w_enet = S(Σxy, λ₁) / (Σx² + λ₂)</strong></p>
  <p>Read it: the L1 part soft-thresholds the numerator (can give an exact 0), the L2 part enlarges the denominator (extra proportional shrinkage). By hand on the flats with λ₁ = 165, λ₂ = 82.5: S(495, 165) = 330, and 330 / (82.5 + 82.5) = 2.</p>
  <p>sklearn's <code>ElasticNet(alpha, l1_ratio)</code> minimises (1/(2n))RSS + α·r·Σ|w| + ½α(1 − r)Σw², with r = <code>l1_ratio</code>. Multiply by n and match: λ₁ = nαr and λ₂ = nα(1 − r). So α = (λ₁ + λ₂)/n = 247.5/10 = 24.75 and r = λ₁/(λ₁ + λ₂) = 165/247.5 = 0.6667.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import ElasticNet

area  = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14], dtype=float)
price = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96], dtype=float)
n = len(area)
Sxy, Sxx = 495.0, 82.5
lam1, lam2 = 165, 82.5                                # ½RSS + λ1|w| + ½λ2 w²
hand = max(Sxy - lam1, 0) / (Sxx + lam2)
alpha = (lam1 + lam2) / n                             # sklearn: (1/2n)RSS + α·r|w| + ½α(1−r)w²
r = lam1 / (lam1 + lam2)
skl = ElasticNet(alpha=alpha, l1_ratio=r).fit(area[:, None], price).coef_[0]
print(f"hand w = {hand:.4f}   sklearn w = {skl:.4f}   (alpha={alpha}, l1_ratio={r:.4f})")</div>
  <div class="fx" data-lang="text">hand w = 2.0000   sklearn w = 2.0000   (alpha=24.75, l1_ratio=0.6667)</div>
  <p><code>l1_ratio = 1</code> is pure lasso, <code>l1_ratio = 0</code> pure ridge (sklearn recommends using <code>Ridge</code> for that case), anything in between mixes them.</p>
  <h3>The grouping effect at scale: correlated twins</h3>
  <p>Two sensors that read almost the same value (correlation 0.9999), like our two areas but with 100 rows. The target truly depends on temperature with a total effect of 3 per degree. We refit each model on three bootstrap resamples to see which weights are stable.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet

rng = np.random.default_rng(1)
temp_a = rng.normal(25, 5, 100)                  # sensor A
temp_b = temp_a + rng.normal(0, 0.05, 100)       # sensor B: near-copy of A
y = 3 * temp_a + rng.normal(0, 3, 100)           # true total effect 3 per degree
X = np.c_[temp_a, temp_b]
models = {"OLS": LinearRegression(), "Ridge": Ridge(alpha=10),
          "Lasso": Lasso(alpha=1), "ENet": ElasticNet(alpha=1, l1_ratio=0.5)}
for name, m in models.items():
    row = []
    for b in range(3):                           # 3 bootstrap resamples
        idx = rng.integers(0, 100, 100)
        w = m.fit(X[idx], y[idx]).coef_
        row.append(f"[{w[0]:5.2f}, {w[1]:5.2f}]")
    print(f"{name:5s}", "  ".join(row))</div>
  <div class="fx" data-lang="text">OLS   [-3.78,  6.78]  [-3.68,  6.65]  [-0.41,  3.37]
Ridge [ 1.49,  1.52]  [ 1.59,  1.39]  [ 1.62,  1.38]
Lasso [ 2.93,  0.00]  [ 2.97,  0.00]  [ 2.86,  0.00]
ENet  [ 1.47,  1.47]  [ 1.50,  1.45]  [ 1.42,  1.40]</div>
  <p>Each pair sums to about 3, the true effect, but the split differs completely. Least squares swings wildly, with a negative weight on one sensor (−3.78 and 6.78!), just like (17.6, −14.5) for the flats. Ridge and Elastic Net share the effect about evenly, run after run: the <strong>grouping effect</strong>. Lasso gives all of it to one twin. Here sensor A won every time, but which twin wins is decided by tiny noise; on other data it flips.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Elastic Net</strong>: minimise (1/(2n))‖y − Xw‖² + α[r‖w‖₁ + ½(1 − r)‖w‖₂²]. It is sparse (from L1), keeps groups of correlated features together (from L2), stays stable when p ≫ n, and can select more than n features (lasso cannot). Its cost is a second hyperparameter, r, tuned with <code>ElasticNetCV(l1_ratio=[.1, .5, .9, 1])</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>sklearn's <code>alpha</code> and <code>l1_ratio</code> are not the λ₁, λ₂ of textbooks (glmnet in R calls the mix "alpha" and the strength "lambda"!). When you compare numbers across libraries or papers, convert using the formulas above.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Scale First.</b> Every formula so far used area in hundreds of sq ft. Would the same λ do the same thing if area were recorded in square feet?</div>

  <h2 id="rg-scale"><span class="num">07</span>Scale First</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The penalty charges for the size of a weight. But the size of the area weight is 6 if area is in hundreds of sq ft and 0.06 if it is in square feet, for exactly the same model. Does the penalty notice the difference, and is that fair?</p>
  </div>
  <h3>Why units matter, by hand</h3>
  <p>With area in hundreds of sq ft, Σx² = 82.5 (centred) and ridge at λ = 27.5 keeps 82.5/110 = 75% of the slope. Record the same areas in square feet: every x is 100 times bigger, Σx² = 825,000, and the same λ keeps 825,000/825,027.5 = 99.997%. Nothing about the flats changed, only the unit, yet the penalty went from "strong" to "absent". The unpenalised model's predictions are the same in both units (the weight just becomes 100 times smaller); the penalised model's predictions are not: flat J is priced at ₹87.25 lakh in one unit and ₹94.00 lakh in the other.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import Ridge, LinearRegression

area_100 = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14], dtype=float)   # hundreds of sq ft
price = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96], dtype=float)
for unit, x in [("100 sq ft", area_100), ("sq ft", 100 * area_100)]:
    ols = LinearRegression().fit(x[:, None], price)
    rdg = Ridge(alpha=27.5).fit(x[:, None], price)
    print(f"area in {unit:9s}: OLS w = {ols.coef_[0]:.4f}   ridge(27.5) w = {rdg.coef_[0]:.6f}"
          f"   kept {rdg.coef_[0] / ols.coef_[0]:.5f}   ridge price for flat J = {rdg.predict(x[-1:, None])[0]:.2f}")</div>
  <div class="fx" data-lang="text">area in 100 sq ft: OLS w = 6.0000   ridge(27.5) w = 4.500000   kept 0.75000   ridge price for flat J = 87.25
area in sq ft    : OLS w = 0.0600   ridge(27.5) w = 0.059998   kept 0.99997   ridge price for flat J = 94.00</div>
  <p>With several features this becomes unfair: a feature measured in big numbers needs only a tiny weight, pays almost no penalty and escapes; a feature measured in small numbers needs a big weight, gets fined heavily and is shrunk or dropped, whatever its real importance.</p>
  <h3>The same effect with two features</h3>
  <p>200 flats where price depends on area (in square feet, standard deviation 384) and rooms (1 to 5, standard deviation 1.4). Per standard deviation both matter about equally (+19.2 and +21.3 lakh).</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import Lasso
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

rng = np.random.default_rng(0)
n = 200
area = rng.normal(1500, 400, n)                  # square feet: numbers in the thousands
rooms = rng.integers(1, 6, n).astype(float)      # 1 to 5: small numbers
price = 0.05 * area + 15 * rooms + rng.normal(0, 10, n)    # lakh rupees
X = np.c_[area, rooms]
print("std of columns:", X.std(axis=0).round(1),
      " effect of +1 SD:", (np.array([0.05, 15]) * X.std(axis=0)).round(1))
for a in [5, 15, 30]:
    raw = Lasso(alpha=a).fit(X, price)
    print(f"unscaled alpha={a:&lt;2}: w_area={raw.coef_[0]:.3f}  w_rooms={raw.coef_[1]:6.3f}")
sc = make_pipeline(StandardScaler(), Lasso(alpha=5)).fit(X, price)
print("scaled   alpha=5 : per-SD weights", sc[-1].coef_.round(2))</div>
  <div class="fx" data-lang="text">std of columns: [384.5   1.4]  effect of +1 SD: [19.2 21.3]
unscaled alpha=5 : w_area=0.046  w_rooms=12.434
unscaled alpha=15: w_area=0.045  w_rooms= 7.451
unscaled alpha=30: w_area=0.042  w_rooms= 0.000
scaled   alpha=5 : per-SD weights [12.6  15.79]</div>
  <p>Unscaled, the area weight is a tiny number (0.046) that the L1 penalty barely notices, while the rooms weight (12.4) is a big number that gets fined. As alpha grows, rooms is shrunk and finally removed (alpha = 30), though it matters as much as area. The reason is only that area is written in big numbers. After <code>StandardScaler</code> (each column becomes mean 0, standard deviation 1), both weights are "effect per standard deviation" and are shrunk on equal terms (12.6 and 15.79 against true 19.2 and 21.3).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Standardisation before regularization</strong>: replace each feature x by (x − mean)/std computed on the training rows, so that every weight is measured in "change in y per one standard deviation of x" and the penalty treats features equally. Needed for L1, L2, Elastic Net, regularized logistic regression, SVMs and neural-network weight decay. Not needed for tree-based models, whose splits do not depend on units (<a class="xref" data-note="ml_features">Feature Engineering</a> covers the scalers).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Fitting the scaler on all rows and then cross-validating leaks the validation rows' means and stds into training. Put the scaler and the model in one <code>Pipeline</code> so each CV fold scales with its own training rows (<a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>). And one-hot dummy columns (Baner, Kothrud): standardising them is common and fine for ridge; just be aware that a rare category's dummy gets a large scaled value and therefore a different effective penalty than a common one.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Choosing λ by Cross-Validation.</b> With fair units the penalty is meaningful, but we have been picking λ = 27.5 or 165 for convenience. Which λ actually gives the best model?</div>

  <h2 id="rg-cv"><span class="num">08</span>Choosing λ by Cross-Validation</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>λ slides the model from "fit everything" to "always ₹67 lakh". The training error can't choose a point on the slide, because it always prefers λ = 0. Which data does choose it, and how?</p>
  </div>
  <h3>The need</h3>
  <p>λ cannot be learnt by minimising training error: the training error is always lowest at λ = 0 (no penalty means more freedom to fit). λ is a <strong>hyperparameter</strong>, chosen by how well the model does on rows it did not train on. The standard tool is cross-validation (<a class="xref" data-note="ml_splits">Train/Val/Test &amp; CV</a>): for each candidate λ, train on k − 1 folds, score on the held-out fold, average.</p>
  <h3>On the ten flats with every column</h3>
  <p>Give the model all six columns the portal has: area, carpet area, bedrooms, age, and two locality dummies. Six weights from ten flats is a lot of freedom, and three columns (area, carpet area, bedrooms) are strongly correlated. With ten rows, leave-one-out is the natural CV:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import LeaveOneOut, cross_val_score

# the ten flats with every column the portal has
area   = np.arange(5, 15, dtype=float)
carpet = np.array([4.1, 4.7, 5.6, 6.5, 7.1, 8.0, 8.9, 9.6, 10.3, 11.3])
beds   = np.array([1, 1, 2, 2, 2, 3, 3, 3, 3, 4], dtype=float)
age    = np.array([12, 3, 8, 15, 5, 10, 20, 2, 7, 4], dtype=float)
loc    = np.array(list("HBKHBKHBKB"))
X = np.c_[area, carpet, beds, age, loc == "B", loc == "K"].astype(float)
y = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96], dtype=float)
names = ["area", "carpet", "beds", "age", "baner", "kothrud"]

def loo(model):
    return -cross_val_score(model, X, y, cv=LeaveOneOut(), scoring="neg_mean_squared_error").mean()

print(f"OLS, all 6 columns : LOOCV MSE {loo(LinearRegression()):.2f}")
for a in [0.01, 0.1, 1, 10]:
    print(f"ridge alpha={a:&lt;5}: LOOCV MSE {loo(make_pipeline(StandardScaler(), Ridge(alpha=a))):.2f}")
for a in [0.1, 0.3, 0.5, 1]:
    m = make_pipeline(StandardScaler(), Lasso(alpha=a, max_iter=100_000))
    kept = [n for n, c in zip(names, m.fit(X, y)[-1].coef_) if c != 0]
    print(f"lasso alpha={a:&lt;4} : LOOCV MSE {loo(m):.2f}   keeps {kept}")</div>
  <div class="fx" data-lang="text">OLS, all 6 columns : LOOCV MSE 6.16
ridge alpha=0.01 : LOOCV MSE 6.05
ridge alpha=0.1  : LOOCV MSE 6.46
ridge alpha=1    : LOOCV MSE 8.81
ridge alpha=10   : LOOCV MSE 42.37
lasso alpha=0.1  : LOOCV MSE 4.93   keeps ['area', 'age', 'baner', 'kothrud']
lasso alpha=0.3  : LOOCV MSE 3.14   keeps ['area', 'age', 'baner']
lasso alpha=0.5  : LOOCV MSE 2.45   keeps ['area', 'age', 'baner']
lasso alpha=1    : LOOCV MSE 4.87   keeps ['area', 'age', 'baner']</div>
  <p>Plain least squares on all six columns scores LOOCV MSE 6.16. Ridge barely helps (6.05 at a tiny α, then worse): shrinking every weight hurts the strong area effect as much as it calms the twins. Lasso helps a lot: at α = 0.5 it keeps area, age and Baner, drops carpet area, bedrooms and Kothrud, and scores 2.45, less than half the OLS error. The best amount of penalty is in the middle; at α = 1 the useful weights are being shrunk too much (4.87). Which penalty wins depends on the data: here a few columns matter and the rest are redundant, which is lasso's home ground.</p>
  <h3>Worked by hand: leave-one-out on a weak signal</h3>
  <p>Ridge shines when every weight is weakly measured. A tiny example where the relationship is weak: x = (1, 2, 3, 4), y = (2, 3, 3, 2). Σxy = 2 + 6 + 9 + 8 = 25, Σx² = 30. Leave-one-out: drop one row, fit ridge on the other three with w = (Σxy − xᵢyᵢ)/(Σx² − xᵢ² + λ), predict the dropped row, square the error, average over the four rows.</p>
  <p>λ = 0, leaving out row 1 (x = 1, y = 2): w = (25 − 2)/(30 − 1) = 23/29 = 0.793. Prediction 0.793, error (2 − 0.793)² = 1.457. Leaving out row 4 (x = 4, y = 2): w = (25 − 8)/(30 − 16) = 17/14 = 1.214, prediction 4.857, error (2 − 4.857)² = 8.163. The others go the same way:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import RidgeCV

x = np.array([1, 2, 3, 4.]); y = np.array([2, 3, 3, 2.])      # a noisy, weak relationship
for lam in [0, 5, 10, 30]:
    errs = []
    for i in range(4):                               # leave row i out
        keep = np.arange(4) != i
        w = (x[keep] * y[keep]).sum() / ((x[keep] ** 2).sum() + lam)
        errs.append((y[i] - w * x[i]) ** 2)
    print(f"λ={lam:&lt;3} squared errors {np.round(errs, 3)}  LOO MSE {np.mean(errs):.3f}")
cv = RidgeCV(alphas=[1e-9, 5, 10, 30], fit_intercept=False).fit(x[:, None], y)
print("RidgeCV (efficient LOO) picks alpha =", cv.alpha_)</div>
  <div class="fx" data-lang="text">λ=0   squared errors [1.457 2.367 0.51  8.163]  LOO MSE 3.124
λ=5   squared errors [1.752 3.148 1.331 2.493]  LOO MSE 2.181
λ=10  squared errors [1.989 3.781 2.107 0.694]  LOO MSE 2.143
λ=30  squared errors [2.593 5.389 4.239 0.207]  LOO MSE 3.107
RidgeCV (efficient LOO) picks alpha = 10.0</div>
  <p>The penalty helps here: LOO MSE falls from 3.124 (no penalty) to 2.143 at λ = 10, then rises again at λ = 30 (too much shrinkage). Look at row 4: without a penalty, the three remaining points suggest a steep slope and the prediction for x = 4 is far too high (error 8.163); shrinking the slope fixes most of that. <code>RidgeCV</code> with its default (an exact, fast LOO formula for ridge, no refitting needed) picks the same λ = 10.</p>
  <h3>K-fold at scale, and the 1-SE rule</h3>
  <p>150 diabetes patients, 10 real features plus 60 columns of noise. Candidate α values are spaced on a log scale (0.01, 0.1, 1, 10, …), because the useful range of λ spans orders of magnitude. For each, 5-fold CV MSE and its standard error (std of the 5 fold scores / √5):</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_diabetes
from sklearn.linear_model import Ridge
from sklearn.model_selection import cross_val_score, KFold
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_diabetes(return_X_y=True)
rng = np.random.default_rng(0)
X = np.c_[X, rng.normal(size=(len(X), 60))][:150]    # 10 real + 60 noise cols, only 150 rows
y = y[:150]
kf = KFold(5, shuffle=True, random_state=0)
alphas = [0.01, 0.1, 1, 10, 30, 100, 300, 1000]
res = []
for a in alphas:
    s = -cross_val_score(make_pipeline(StandardScaler(), Ridge(alpha=a)), X, y,
                         cv=kf, scoring="neg_mean_squared_error")
    res.append((a, s.mean(), s.std() / np.sqrt(len(s))))
    print(f"alpha {a:&lt;6} CV MSE {s.mean():7.0f}   SE {s.std() / np.sqrt(len(s)):5.0f}")
best = min(res, key=lambda r: r[1])
one_se = max(r[0] for r in res if r[1] &lt;= best[1] + best[2])
print("best alpha:", best[0], " 1-SE alpha:", one_se)</div>
  <div class="fx" data-lang="text">alpha 0.01   CV MSE    7790   SE   601
alpha 0.1    CV MSE    7654   SE   615
alpha 1      CV MSE    7142   SE   569
alpha 10     CV MSE    5374   SE   404
alpha 30     CV MSE    4422   SE   350
alpha 100    CV MSE    3978   SE   312
alpha 300    CV MSE    4224   SE   392
alpha 1000   CV MSE    4845   SE   538
best alpha: 100  1-SE alpha: 300</div>
  <p>The CV error falls from 7790 (almost no penalty: 70 features for 120 training rows per fold) to a minimum of 3978 at α = 100, then rises. The <strong>1-SE rule</strong> (Breiman; also in glmnet as <code>lambda.1se</code>): among all α whose CV error is within one standard error of the best, take the simplest (largest α). By hand: 3978 + 312 = 4290. α = 300 has 4224 ≤ 4290 ✓, α = 1000 has 4845 ✗. So the 1-SE choice is α = 300: a more strongly regularized model whose error is statistically indistinguishable from the best.</p>
  <table class="tbl">
    <tr><th>Tool</th><th>What it searches</th><th>How</th></tr>
    <tr><td><code>RidgeCV(alphas=…)</code></td><td>α</td><td>default: exact efficient LOO (or <code>cv=5</code>)</td></tr>
    <tr><td><code>LassoCV(cv=5)</code></td><td>α (100 values from α_max down)</td><td>k-fold, warm-started along the path</td></tr>
    <tr><td><code>ElasticNetCV(l1_ratio=[…], cv=5)</code></td><td>α and r</td><td>k-fold</td></tr>
    <tr><td><code>LogisticRegressionCV(Cs=10, cv=5)</code></td><td>C = 1/λ</td><td>k-fold</td></tr>
    <tr><td><code>GridSearchCV(pipe, {"model__alpha": …})</code></td><td>anything</td><td>k-fold over a whole pipeline</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The CV score of the chosen λ is optimistically biased (you picked the best of many: lasso's 2.45 is the best of four). Report performance on an untouched test set, or use nested CV, where the λ search runs inside each outer training fold (<a class="xref" data-note="ml_splits">Train/Val/Test &amp; CV</a>). And search on a log grid: a linear grid 1, 2, …, 10 never discovers that the best λ is 300.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Regularization Paths.</b> CV picked one λ. But how does the whole model change as λ moves: which flats' columns enter first, and which never do?</div>

  <h2 id="rg-path"><span class="num">09</span>Regularization Paths</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>At α = 0.5 lasso kept area, age and Baner. Was that a knife-edge choice, or do those three columns stand out across many λ? Seeing every λ at once would show the ranking of the columns.</p>
  </div>
  <h3>What a path is</h3>
  <p>A <strong>regularization path</strong> is the list of fitted weights for every λ from "huge" down to "tiny". Plotting each weight against λ shows the whole family of models at once: which features matter most (they survive the largest λ), which ones are fragile, and where they enter. Lasso's path is piecewise linear, and sklearn computes it efficiently with warm starts (each fit starts from the previous λ's answer).</p>
  <h3>Where the lasso path starts: α_max by hand</h3>
  <p>From the soft-threshold rule, a weight stays at 0 as long as the data's push on it is within the penalty. When all weights are 0, the residual is y itself (after centring), so the push on feature j is xⱼᵀy. In sklearn's scaling (divide by n), every weight is 0 exactly when α ≥ <strong>α_max = maxⱼ |xⱼᵀy| / n</strong>. The feature attaining that maximum (the one most correlated with y) is the first to enter as α drops below α_max. On the standardised flats:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import lasso_path
from sklearn.preprocessing import StandardScaler

area   = np.arange(5, 15, dtype=float)
carpet = np.array([4.1, 4.7, 5.6, 6.5, 7.1, 8.0, 8.9, 9.6, 10.3, 11.3])
beds   = np.array([1, 1, 2, 2, 2, 3, 3, 3, 3, 4], dtype=float)
age    = np.array([12, 3, 8, 15, 5, 10, 20, 2, 7, 4], dtype=float)
loc    = np.array(list("HBKHBKHBKB"))
X = StandardScaler().fit_transform(np.c_[area, carpet, beds, age, loc == "B", loc == "K"].astype(float))
y = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96], dtype=float); y = y - y.mean()
names = np.array(["area", "carpet", "beds", "age", "baner", "kothrud"])
push = np.abs(X.T @ y) / len(y)                       # |x_jᵀ y| / n for every feature
print("data push per feature:", {str(n): round(float(p), 2) for n, p in zip(names, push)})
print("alpha_max by hand:", push.max().round(3), "from", names[push.argmax()])
alphas, coefs, _ = lasso_path(X, y, alphas=[17, 10, 5, 2, 1, 0.5, 0.1, 0.01], max_iter=100_000)
for a, c in zip(alphas, coefs.T):
    print(f"alpha {a:&gt;5}: " + " ".join(f"{v + 0.0:6.2f}" for v in c) + f"   non-zero {names[c != 0].tolist()}")</div>
  <div class="fx" data-lang="text">data push per feature: {'area': 17.23, 'carpet': 17.18, 'beds': 16.15, 'age': 4.79, 'baner': 5.51, 'kothrud': 1.53}
alpha_max by hand: 17.234 from area
alpha  17.0:   0.00   0.00   0.00   0.00   0.00   0.00   non-zero []
alpha  10.0:   7.23   0.00   0.00   0.00   0.00   0.00   non-zero ['area']
alpha   5.0:  12.23   0.00   0.00   0.00   0.00   0.00   non-zero ['area']
alpha   2.0:  15.17   0.00   0.00   0.00   0.28   0.00   non-zero ['area', 'baner']
alpha   1.0:  15.99   0.00   0.00  -0.46   0.75   0.00   non-zero ['area', 'age', 'baner']
alpha   0.5:  16.40   0.00   0.00  -0.73   0.95   0.00   non-zero ['area', 'age', 'baner']
alpha   0.1:  16.63   0.00   0.00  -0.50   1.72   0.43   non-zero ['area', 'age', 'baner', 'kothrud']
alpha  0.01:  16.59   0.00   0.00  -0.01   2.46   0.94   non-zero ['area', 'age', 'baner', 'kothrud']</div>
  <p>α_max = 17.23 comes from area, so above 17.23 the model is empty (every flat priced at ₹67 lakh). Carpet area's push, 17.18, is almost as big, but once area is in, the residual left for carpet area is tiny, so it never enters; the same happens to bedrooms (16.15), which mostly repeats area. Baner enters next (by α = 2), then age (by α = 1, with the expected negative sign: older flats are cheaper), and Kothrud only at small α. The path explains the CV result of section 08: the best α (0.5) sits in the stretch where exactly area, age and Baner are on.</p>
  <h3>At scale: the diabetes lasso path</h3>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_diabetes
from sklearn.linear_model import lasso_path
from sklearn.preprocessing import StandardScaler

data = load_diabetes()
X = StandardScaler().fit_transform(data.data); y = data.target - data.target.mean()
n = len(y)
corr = np.abs(X.T @ y) / n                         # |x_jᵀ y| / n for every feature
print("alpha_max by hand:", corr.max().round(3), "from", data.feature_names[corr.argmax()])
alphas, coefs, _ = lasso_path(X, y, alphas=[40, 30, 20, 10, 5, 2, 1, 0.1])
for a, c in zip(alphas, coefs.T):
    on = [data.feature_names[j] for j in np.flatnonzero(c)]
    print(f"alpha {a:&gt;4}: {len(on):2d} non-zero {on}")</div>
  <div class="fx" data-lang="text">alpha_max by hand: 45.16 from bmi
alpha 40.0:  2 non-zero ['bmi', 's5']
alpha 30.0:  2 non-zero ['bmi', 's5']
alpha 20.0:  3 non-zero ['bmi', 'bp', 's5']
alpha 10.0:  4 non-zero ['bmi', 'bp', 's3', 's5']
alpha  5.0:  5 non-zero ['sex', 'bmi', 'bp', 's3', 's5']
alpha  2.0:  7 non-zero ['sex', 'bmi', 'bp', 's1', 's3', 's5', 's6']
alpha  1.0:  7 non-zero ['sex', 'bmi', 'bp', 's1', 's3', 's5', 's6']
alpha  0.1:  9 non-zero ['age', 'sex', 'bmi', 'bp', 's1', 's2', 's4', 's5', 's6']</div>
  <p>α_max = 45.16 comes from bmi, so for any α above 45.16 the model is empty. Just below it, bmi enters (s5 follows almost at once). Then bp (by α = 20), s3 (by 10), sex (by 5)… and at α = 0.1 nine of ten are in. The order of entry is a ranking of how strongly each feature earns its place, given those already in.</p>
  <h3>The ridge path</h3>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_diabetes
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler

data = load_diabetes()
X = StandardScaler().fit_transform(data.data); y = data.target
show = ["bmi", "s5", "s1", "s2"]
idx = [data.feature_names.index(f) for f in show]
print("alpha   " + "".join(f"{f:&gt;8}" for f in show) + "   ||w||")
for a in [0.01, 1, 10, 100, 1000, 10000]:
    w = Ridge(alpha=a).fit(X, y).coef_
    print(f"{a:&lt;7} " + "".join(f"{w[j]:8.1f}" for j in idx) + f"   {np.linalg.norm(w):5.1f}")</div>
  <div class="fx" data-lang="text">alpha        bmi      s5      s1      s2   ||w||
0.01        24.7    35.7   -37.6    22.6    65.4
1           24.8    32.8   -30.1    16.7    57.5
10          24.6    25.3   -11.3     1.8    42.6
100         21.4    18.7    -2.1    -3.7    34.8
1000         9.9     8.7     1.1     0.0    17.4
10000        1.8     1.7     0.6     0.4     3.6</div>
  <p>Ridge never zeroes anything (s2 shows 0.0 only because of rounding), and the weights move smoothly. Notice the cholesterol pair s1/s2: at α = 0.01 they are −37.6 and +22.6, large and opposite (the twin problem of section 01, like built-up and carpet area). By α = 10 the unstable "s1 minus s2" direction has been squeezed out (−11.3, 1.8), while bmi has hardly moved (24.7 → 24.6). Strong, well-measured features shrink last.</p>
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
  <div class="callout trap"><span class="label">Trap</span>
    <p>Do not read the path from left to right as "time". Every point on it is a separate model trained from scratch at that λ. And a feature entering early is not proof it is causal: with correlated features, one may enter and "use up" the signal its partner would have carried (area used up carpet area's).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Effect on Bias and Variance.</b> Shrinking helped lasso on the six-column flats but would only hurt the single strong area slope. What decides when shrinking pays?</div>

  <h2 id="rg-bv"><span class="num">10</span>Effect on Bias and Variance</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A penalty deliberately makes weights wrong on average (biased). The bias–variance note said that can still lower the total error. For a given weight, how much bias do we add, how much variance do we remove, and where is the best λ?</p>
  </div>
  <h3>Derived for one weight</h3>
  <p>Let the truth be y = βx + ε with noise ε of variance σ². Ridge with one feature: w = Σxy/(Σx² + λ). Substitute y: Σxy = βΣx² + Σxε. So</p>
  <ul>
    <li><strong>Average</strong> of w over many datasets (the noise averages to 0): E[w] = βΣx²/(Σx² + λ). The <strong>bias</strong> is E[w] − β = <strong>−βλ/(Σx² + λ)</strong>: ridge is systematically pulled toward 0, more for bigger λ.</li>
    <li><strong>Variance</strong> of w: only the noise term Σxε varies, with variance σ²Σx². Dividing by (Σx² + λ)²: <strong>Var[w] = σ²Σx²/(Σx² + λ)²</strong>, smaller for bigger λ.</li>
    <li><strong>Error of the weight</strong>: MSE(w) = bias² + variance. Setting its derivative to 0 gives the best λ* = <strong>σ²/β²</strong>: penalise more when the noise is large or the true effect is small.</li>
  </ul>
  <h3>The flats' slope: a strong effect</h3>
  <p>For the flats' area slope, β = 6, noise σ² ≈ 4 and Σx² = 82.5: λ* = 4/36 = 0.11. Almost no shrinkage is worth it, because the effect is 6 and its standard error only √(4/82.5) = 0.22:</p>
  <div class="fx" data-lang="py">import numpy as np
# the flats' slope: strong true effect (beta = 6 per 100 sq ft), noise sigma^2 = 4, centred Sxx = 82.5
beta, sigma2, Sxx = 6.0, 4.0, 82.5
print("best lambda for the slope = sigma^2 / beta^2 =", round(sigma2 / beta**2, 3))
for lam in [0, sigma2 / beta**2, 10, 82.5]:
    bias = -beta * lam / (Sxx + lam) + 0.0
    var = sigma2 * Sxx / (Sxx + lam) ** 2
    print(f"λ={lam:&lt;6.3f} bias={bias:+.4f}  bias²={bias**2:.5f}  var={var:.5f}  MSE(w)={bias**2 + var:.5f}")</div>
  <div class="fx" data-lang="text">best lambda for the slope = sigma^2 / beta^2 = 0.111
λ=0.000  bias=+0.0000  bias²=0.00000  var=0.04848  MSE(w)=0.04848
λ=0.111  bias=-0.0081  bias²=0.00007  var=0.04835  MSE(w)=0.04842
λ=10.000 bias=-0.6486  bias²=0.42075  var=0.03857  MSE(w)=0.45931
λ=82.500 bias=-3.0000  bias²=9.00000  var=0.01212  MSE(w)=9.01212</div>
  <p>The best λ cuts the weight's error only from 0.04848 to 0.04842; λ = 82.5 (halving the slope) adds a bias² of 9. That is why ridge did not help on the flats' strong area effect in section 08.</p>
  <h3>A weak effect: where shrinking pays</h3>
  <p>By hand with x = (1, 2, 3, 4) (Σx² = 30), a weak true slope β = 0.2 and σ = 1. λ = 10: bias = −0.2 × 10/40 = −0.05, bias² = 0.0025; variance = 30/40² = 0.01875; total 0.02125. Without a penalty: bias 0, variance 1/30 = 0.0333. Ridge wins even though it is biased. λ* = 1/0.04 = 25.</p>
  <div class="fx" data-lang="py">import numpy as np
beta, sigma, Sxx = 0.2, 1.0, 30.0              # true slope, noise sd, Σx² (x = 1,2,3,4)
for lam in [0, 10, 25, 50]:
    bias = -beta * lam / (Sxx + lam) + 0.0
    var = sigma**2 * Sxx / (Sxx + lam) ** 2
    print(f"λ={lam:&lt;3} bias={bias:+.4f}  bias²={bias**2:.5f}  var={var:.5f}  MSE(w)={bias**2 + var:.5f}")
# simulate to check
rng = np.random.default_rng(0); x = np.array([1, 2, 3, 4.])
ws = {lam: [] for lam in [0, 25]}
for _ in range(100000):
    y = beta * x + rng.normal(0, sigma, 4)
    for lam in ws: ws[lam].append((x * y).sum() / (Sxx + lam))
for lam, w in ws.items():
    w = np.array(w); print(f"simulated λ={lam}: mean w={w.mean():.4f}  MSE(w)={((w - beta)**2).mean():.5f}")</div>
  <div class="fx" data-lang="text">λ=0   bias=+0.0000  bias²=0.00000  var=0.03333  MSE(w)=0.03333
λ=10  bias=-0.0500  bias²=0.00250  var=0.01875  MSE(w)=0.02125
λ=25  bias=-0.0909  bias²=0.00826  var=0.00992  MSE(w)=0.01818
λ=50  bias=-0.1250  bias²=0.01562  var=0.00469  MSE(w)=0.02031
simulated λ=0: mean w=0.1999  MSE(w)=0.03319
simulated λ=25: mean w=0.1090  MSE(w)=0.01815</div>
  <p>The simulation of 100,000 datasets confirms the formulas: the unbiased estimator averages 0.1999 (≈ β) but has error 0.0332; the ridge estimator averages 0.1090 (biased toward 0) yet has about half the error, 0.01815. λ = 25 is the best of the four, as derived. Weak effects like the flats' age (−0.73 per standardised unit) live in this regime.</p>
  <h3>Simulated for a whole model</h3>
  <p>The same decomposition from <a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a>, now measured for ridge with 15 features, 30 training rows and noise σ² = 9. For each λ we draw 300 fresh training sets, fit, and predict 200 fixed test points.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import Ridge

rng = np.random.default_rng(0)
p, n, sigma = 15, 30, 3.0
true_w = rng.normal(0, 1, p)                       # every feature matters a little
X_test = rng.normal(size=(200, p)); f_test = X_test @ true_w
print("lambda   bias^2  variance  noise  test MSE")
for lam in [0.001, 1, 5, 20, 100, 500]:
    preds = []
    for rep in range(300):                         # 300 fresh training sets
        X = rng.normal(size=(n, p)); y = X @ true_w + rng.normal(0, sigma, n)
        preds.append(Ridge(alpha=lam).fit(X, y).predict(X_test))
    preds = np.array(preds)
    bias2 = ((preds.mean(axis=0) - f_test) ** 2).mean()
    var = preds.var(axis=0).mean()
    print(f"{lam:&lt;8} {bias2:6.2f}  {var:8.2f}  {sigma**2:5.1f}  {bias2 + var + sigma**2:8.2f}")</div>
  <div class="fx" data-lang="text">lambda   bias^2  variance  noise  test MSE
0.001      0.03     11.17    9.0     20.20
1          0.13      8.44    9.0     17.58
5          0.67      4.91    9.0     14.58
20         3.07      2.33    9.0     14.40
100        8.39      0.98    9.0     18.38
500       11.71      0.70    9.0     21.41</div>
  <figure class="viz"><svg viewBox="0 0 640 250" width="640">
<line x1="70" y1="200" x2="570" y2="200" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="70" y1="20" x2="70" y2="200" stroke="currentColor" stroke-opacity="0.5"/>
<line x1="70" y1="132.5" x2="550" y2="132.5" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="556" y="136.5" class="tm" font-size="11">noise σ² = 9</text>
<text x="64" y="204.0" text-anchor="end" class="tm" font-size="10">0</text>
<text x="64" y="129.0" text-anchor="end" class="tm" font-size="10">10</text>
<text x="64" y="54.0" text-anchor="end" class="tm" font-size="10">20</text>
<text x="70" y="216" text-anchor="middle" class="tm" font-size="10.5">0.001</text>
<text x="166" y="216" text-anchor="middle" class="tm" font-size="10.5">1</text>
<text x="262" y="216" text-anchor="middle" class="tm" font-size="10.5">5</text>
<text x="358" y="216" text-anchor="middle" class="tm" font-size="10.5">20</text>
<text x="454" y="216" text-anchor="middle" class="tm" font-size="10.5">100</text>
<text x="550" y="216" text-anchor="middle" class="tm" font-size="10.5">500</text>
<text x="310.0" y="232" text-anchor="middle" class="tm" font-size="11">λ (log-spaced) → stronger penalty</text>
<polyline points="70.0,199.8 166.0,199.0 262.0,195.0 358.0,177.0 454.0,137.1 550.0,112.2" fill="none" class="sr" stroke-width="2.5"/>
<circle cx="70.0" cy="199.8" r="3" class="sr" fill="none"/>
<circle cx="166.0" cy="199.0" r="3" class="sr" fill="none"/>
<circle cx="262.0" cy="195.0" r="3" class="sr" fill="none"/>
<circle cx="358.0" cy="177.0" r="3" class="sr" fill="none"/>
<circle cx="454.0" cy="137.1" r="3" class="sr" fill="none"/>
<circle cx="550.0" cy="112.2" r="3" class="sr" fill="none"/>
<text x="558.0" y="116.2" class="tr" font-size="11.5">bias²</text>
<polyline points="70.0,116.2 166.0,136.7 262.0,163.2 358.0,182.5 454.0,192.7 550.0,194.8" fill="none" class="sb" stroke-width="2.5"/>
<circle cx="70.0" cy="116.2" r="3" class="sb" fill="none"/>
<circle cx="166.0" cy="136.7" r="3" class="sb" fill="none"/>
<circle cx="262.0" cy="163.2" r="3" class="sb" fill="none"/>
<circle cx="358.0" cy="182.5" r="3" class="sb" fill="none"/>
<circle cx="454.0" cy="192.7" r="3" class="sb" fill="none"/>
<circle cx="550.0" cy="194.8" r="3" class="sb" fill="none"/>
<text x="558.0" y="208.8" class="tb" font-size="11.5">variance</text>
<polyline points="70.0,48.5 166.0,68.2 262.0,90.6 358.0,92.0 454.0,62.2 550.0,39.4" fill="none" class="sg" stroke-width="2.5"/>
<circle cx="70.0" cy="48.5" r="3" class="sg" fill="none"/>
<circle cx="166.0" cy="68.2" r="3" class="sg" fill="none"/>
<circle cx="262.0" cy="90.6" r="3" class="sg" fill="none"/>
<circle cx="358.0" cy="92.0" r="3" class="sg" fill="none"/>
<circle cx="454.0" cy="62.2" r="3" class="sg" fill="none"/>
<circle cx="550.0" cy="39.4" r="3" class="sg" fill="none"/>
<text x="558.0" y="43.4" class="tg" font-size="11.5">test MSE</text>
<circle cx="310.0" cy="92.8" r="7" fill="none" class="sg" stroke-width="2"/><text x="310.0" y="80.8" text-anchor="middle" class="tg" font-size="11">best λ ≈ 5–20</text>
</svg><figcaption>Bias², variance and test error of ridge from 300 simulated training sets (numbers from the table above). Raising λ trades variance for bias; total error is lowest in the middle.</figcaption></figure>
  <p>With almost no penalty, bias² is tiny (0.03) but the variance is 11.17: the model changes a lot with each training set. Raising λ trades one for the other. At λ = 5 to 20 the total test error is lowest (14.6, 14.4), about 6 below the unpenalised model. Push λ to 500 and the variance is small but bias² (11.71) dominates: underfitting. The irreducible noise (9) is untouched by any λ.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Regularization reduces <strong>effective model complexity</strong> without changing the model's form. For ridge this can be counted: the effective degrees of freedom are Σ d/(d + λ) over the eigenvalues d of XᵀX: p (all parameters) at λ = 0, falling smoothly to 0 as λ → ∞. For the twin areas at λ = 1: 0.993 + 0.040 ≈ 1.03, so two weights behave like one. λ is a continuous dial on capacity, where "delete a feature" was an on/off switch.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Regularization only helps the variance side. If the model is too simple for the pattern (a straight line through a curve), a penalty makes things worse. Diagnose first: training error high too → reduce λ or add features; training error low but validation high → increase λ.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The Same Idea in Other Models.</b> So far the penalty sat on a linear regression. Classifiers, trees, boosting and networks overfit too. Do they use the same idea, and under which names?</div>

  <h2 id="rg-models"><span class="num">11</span>The Same Idea in Other Models</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The loss-functions note found that on the flats' "sold within 30 days" data, log-loss keeps falling as the age weight grows, without limit, because age separates the classes perfectly. What stops a logistic regression's weights from running off to infinity, and how is the knob named there?</p>
  </div>
  <h3>Logistic regression and SVMs: C = 1/λ</h3>
  <p>Logistic regression minimises log loss (<a class="xref" data-note="ml_classification">Logistic Regression</a>). sklearn adds an L2 penalty <strong>by default</strong> and controls it with <code>C</code>, which multiplies the loss instead of the penalty: minimise ½‖w‖² + C·Σ log-loss. Dividing by C shows it is the same as log loss + (1/(2C))‖w‖², so <strong>C behaves like 1/λ: small C = strong penalty</strong>. SVMs (<a class="xref" data-note="ml_svm">Support Vector Machines</a>) use C the same way. On the flats (standardised age → sold fast):</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LogisticRegression

age  = np.array([12, 3, 8, 15, 5, 10, 20, 2, 7, 4], dtype=float)   # flats A..J
sold = np.array([1, 0, 0, 1, 0, 1, 1, 0, 0, 0])                   # sold within 30 days?
z = ((age - age.mean()) / age.std()).reshape(-1, 1)                # standardised age
for C in [0.01, 0.1, 1, 10, 100, 10_000]:
    m = LogisticRegression(C=C, max_iter=100_000).fit(z, sold)
    p = m.predict_proba(z)[:, 1]
    print(f"C={C:&lt;7} (λ≈{1/C:&lt;6g}) weight {m.coef_[0, 0]:7.2f}   train accuracy {m.score(z, sold):.1f}"
          f"   P(fast) for 10-year flat F {p[5]:.3f}")</div>
  <div class="fx" data-lang="text">C=0.01    (λ≈100   ) weight    0.04   train accuracy 0.6   P(fast) for 10-year flat F 0.402
C=0.1     (λ≈10    ) weight    0.33   train accuracy 0.7   P(fast) for 10-year flat F 0.419
C=1       (λ≈1     ) weight    1.44   train accuracy 0.9   P(fast) for 10-year flat F 0.476
C=10      (λ≈0.1   ) weight    3.71   train accuracy 1.0   P(fast) for 10-year flat F 0.611
C=100     (λ≈0.01  ) weight    8.50   train accuracy 1.0   P(fast) for 10-year flat F 0.811
C=10000   (λ≈0.0001) weight   25.37   train accuracy 1.0   P(fast) for 10-year flat F 0.991</div>
  <p>A strong penalty (C = 0.01) keeps the age weight at 0.04: the model barely uses age and is right on only 6 of 10 flats. As C grows the weight grows: 1.44 at the default C = 1 (9 of 10 right), and at C = 10,000, with almost no penalty, 25.4, which turns a 10-year flat's probability of selling fast into 0.991, an absurdly confident claim from ten flats. Without any penalty the weight would grow forever. At scale, on 569 tumours with 30 features:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_breast_cancer(return_X_y=True)           # 569 tumours, 30 features
for C in [0.001, 0.01, 0.1, 1, 100]:
    l2 = make_pipeline(StandardScaler(), LogisticRegression(C=C, max_iter=5000))
    l1 = make_pipeline(StandardScaler(), LogisticRegression(C=C, l1_ratio=1, solver="liblinear"))
    acc = cross_val_score(l2, X, y, cv=5).mean()
    w2 = l2.fit(X, y)[-1].coef_; w1 = l1.fit(X, y)[-1].coef_
    print(f"C={C:&lt;6} (λ≈{1/C:&lt;7g}) L2: CV acc {acc:.3f}  ||w|| {np.linalg.norm(w2):6.2f}   "
          f"L1: non-zero {int((w1 != 0).sum()):2d}/30")</div>
  <div class="fx" data-lang="text">C=0.001  (λ≈1000   ) L2: CV acc 0.891  ||w||   0.33   L1: non-zero  0/30
C=0.01   (λ≈100    ) L2: CV acc 0.949  ||w||   0.90   L1: non-zero  4/30
C=0.1    (λ≈10     ) L2: CV acc 0.977  ||w||   1.95   L1: non-zero  8/30
C=1      (λ≈1      ) L2: CV acc 0.981  ||w||   3.84   L1: non-zero 17/30
C=100    (λ≈0.01   ) L2: CV acc 0.963  ||w||  21.41   L1: non-zero 29/30</div>
  <p>A very strong penalty (C = 0.001) squeezes the weight vector to length 0.33 and underfits (CV 0.891); C = 1 is best (0.981); a weak penalty (C = 100) lets weights grow to length 21.4 and CV accuracy drops to 0.963. The L1 version shows sparsity at work: 0 of 30 features at C = 0.001, 8 at C = 0.1, 29 at C = 100.</p>
  <h3>Trees, boosting and neural networks</h3>
  <table class="tbl">
    <tr><th>Model</th><th>Its regularizers</th><th>Same "fine for complexity"</th></tr>
    <tr><td>Decision tree (<a class="xref" data-note="ml_dtree">Decision Trees</a>)</td><td><code>max_depth</code>, <code>min_samples_leaf</code>, cost-complexity pruning <code>ccp_alpha</code></td><td>Pruning minimises R(T) + α·|T|: training error + α per leaf. Exactly loss + λ·penalty, with "number of leaves" as Ω</td></tr>
    <tr><td>Random forest (<a class="xref" data-note="ml_rf">Random Forest</a>)</td><td><code>max_features</code>, <code>min_samples_leaf</code>, bootstrap</td><td>Averaging and randomness lower variance</td></tr>
    <tr><td>Gradient boosting (<a class="xref" data-note="ml_gbm">GBM</a>, <a class="xref" data-note="ml_xgboost">XGBoost</a>)</td><td><code>learning_rate</code> (shrinkage), <code>n_estimators</code> + early stopping, <code>subsample</code>, XGBoost's <code>reg_lambda</code>, <code>reg_alpha</code>, <code>gamma</code></td><td>XGBoost leaf weight = −G/(H + λ): the ridge denominator again; γ is a price per leaf</td></tr>
    <tr><td>k-NN (<a class="xref" data-note="ml_knn">K-Nearest Neighbors</a>)</td><td>larger k</td><td>Smoother boundary, less variance</td></tr>
    <tr><td>Neural networks (<a class="xref" data-note="dl_foundations">Deep Learning Foundations</a>)</td><td>weight decay (L2), dropout, early stopping, data augmentation, batch norm (side effect)</td><td>Sections 12–13 below</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Direction of the knob: in <code>Ridge</code>, <code>Lasso</code>, <code>ElasticNet</code>, <code>MLPClassifier</code> a <strong>bigger alpha = stronger</strong> regularization. In <code>LogisticRegression</code>, <code>SVC</code>, <code>LinearSVC</code> a <strong>bigger C = weaker</strong>. Getting this backwards and searching the wrong end of the grid is a classic interview and production mistake.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Early Stopping.</b> Every regularizer so far is a term written into the objective or a limit on the model's structure. Gradient descent itself starts the weights at zero and moves them out step by step. Could simply stopping early act as a penalty?</div>

  <h2 id="rg-early"><span class="num">12</span>Early Stopping</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In the loss-functions note, gradient descent on the flats moved the slope from 0 towards 6 over many steps. If we stopped halfway, we would have a slope smaller than 6, as if ridge had shrunk it. Is "stop early" really the same as "add a penalty", and how would we choose when to stop?</p>
  </div>
  <h3>The idea</h3>
  <p>Train with gradient descent starting from all weights = 0, and watch the error on a validation set after every step. Early on, the weights grow in the directions the data supports strongly (the real signal). Later, they grow in the weakly supported directions, which is where noise lives (the "built-up minus carpet" direction). So the validation error falls, reaches a minimum, then rises. Stop at the minimum and keep those weights. No penalty term is written down, but the number of steps limits how far the weights can travel from 0, which acts like a penalty.</p>
  <div class="fx" data-lang="py">import numpy as np

rng = np.random.default_rng(3)
p = 30
true_w = np.zeros(p); true_w[:3] = [2, -1.5, 1]
def make(n):
    X = rng.normal(size=(n, p)); return X, X @ true_w + rng.normal(0, 1.5, n)
Xtr, ytr = make(40); Xva, yva = make(500)       # 40 training rows for 30 weights: easy to overfit

w, eta = np.zeros(p), 0.01
best = (np.inf, 0)
for t in range(1, 3001):
    grad = -2 * Xtr.T @ (ytr - Xtr @ w) / len(ytr)       # gradient of training MSE
    w -= eta * grad
    val = np.mean((yva - Xva @ w) ** 2)
    if val &lt; best[0]: best = (val, t)
    if t in (1, 10, 50, 100, 200, 500, 1000, 3000):
        tr = np.mean((ytr - Xtr @ w) ** 2)
        print(f"step {t:4d}: train MSE {tr:5.2f}   val MSE {val:5.2f}   ||w|| {np.linalg.norm(w):4.2f}")
print(f"best val MSE {best[0]:.2f} at step {best[1]}")</div>
  <div class="fx" data-lang="text">step    1: train MSE  7.94   val MSE  8.46   ||w|| 0.06
step   10: train MSE  5.29   val MSE  7.06   ||w|| 0.55
step   50: train MSE  1.77   val MSE  5.18   ||w|| 1.68
step  100: train MSE  1.07   val MSE  4.79   ||w|| 2.20
step  200: train MSE  0.80   val MSE  4.44   ||w|| 2.56
step  500: train MSE  0.61   val MSE  4.12   ||w|| 2.95
step 1000: train MSE  0.55   val MSE  4.41   ||w|| 3.25
step 3000: train MSE  0.54   val MSE  4.71   ||w|| 3.45
best val MSE 4.12 at step 471</div>
  <p>40 training rows, 30 weights, 3 real. The training error keeps falling (7.94 → 0.54) as the weight norm keeps growing (0.06 → 3.45). The validation error falls to 4.12 at step 471 and then climbs back to 4.71 by step 3000, when the model has almost reached the unpenalised least-squares fit. Stopping at step 471 gives the regularized model.</p>
  <h3>Why it behaves like L2, by hand</h3>
  <p>For a direction whose eigenvalue (curvature) is d, gradient descent from 0 with step η reaches the fraction 1 − (1 − ηd)ᵗ of the least-squares value after t steps. Ridge keeps d/(d + λ). With η = 0.1, t = 10 and λ ≈ 1/(ηt) = 1: for d = 1, GD reaches 1 − 0.9¹⁰ = 1 − 0.349 = 0.651; ridge keeps 1/2 = 0.5. For d = 0.1, GD reaches 1 − 0.99¹⁰ = 0.096, ridge 0.1/1.1 = 0.091.</p>
  <div class="fx" data-lang="py">import numpy as np
eta, t = 0.1, 10
lam = 1 / (eta * t)                                   # the "equivalent" ridge strength
print(f"eta={eta}, t={t} steps  -&gt;  lambda ≈ 1/(eta·t) = {lam}")
for d in [0.1, 0.5, 1, 2, 5]:                         # curvature (eigenvalue) of a direction
    gd = 1 - (1 - eta * d) ** t                       # share of the OLS weight GD has reached
    ridge = d / (d + lam)                             # share ridge keeps
    print(f"d={d:&lt;4} early-stopped GD keeps {gd:.3f}   ridge keeps {ridge:.3f}")</div>
  <div class="fx" data-lang="text">eta=0.1, t=10 steps  -&gt;  lambda ≈ 1/(eta·t) = 1.0
d=0.1  early-stopped GD keeps 0.096   ridge keeps 0.091
d=0.5  early-stopped GD keeps 0.401   ridge keeps 0.333
d=1    early-stopped GD keeps 0.651   ridge keeps 0.500
d=2    early-stopped GD keeps 0.893   ridge keeps 0.667
d=5    early-stopped GD keeps 0.999   ridge keeps 0.833</div>
  <p>The numbers are not identical, but the pattern is the same: weakly supported directions (small d, like the twins' 0.042 direction) are kept tiny, strongly supported ones (big d) almost fully. Early stopping after t steps is roughly ridge with λ ≈ 1/(η·t): more steps = weaker regularization.</p>
  <div class="cards">
    <div><b>sklearn</b><p><code>SGDRegressor(early_stopping=True)</code>, <code>MLPClassifier(early_stopping=True)</code>, <code>HistGradientBoosting*(early_stopping=True)</code>, <code>GradientBoosting*(n_iter_no_change=…)</code></p><small>Holds out <code>validation_fraction</code> of training rows</small></div>
    <div><b>Patience</b><p>Stop only after the validation score has not improved for k checks, then roll back to the best step</p><small>Validation curves are noisy</small></div>
    <div><b>Cost</b><p>Free: it also saves training time</p><small>Spends some rows on validation</small></div>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The validation set used for early stopping is no longer an unbiased judge: you chose the stopping step on it. Keep a separate test set, or use the CV-chosen number of steps and retrain on all training data.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Dropout, Noise and Data Augmentation.</b> Early stopping regularizes through the training procedure. Can we regularize through the data itself, by making the training rows a little noisier or more varied?</div>

  <h2 id="rg-noise"><span class="num">13</span>Dropout, Noise and Data Augmentation</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A flat's recorded area is never exact: built-up, carpet, rounded to the nearest 50 sq ft. If we train on many slightly jittered copies of each flat, the model cannot rely too heavily on the exact area value. Is that a form of regularization, and is it secretly one of the penalties we already know?</p>
  </div>
  <h3>Input noise is ridge, derived</h3>
  <p>Add independent noise ε (mean 0, variance s²) to every input before fitting. For one row, the expected squared error is E[(y − (x + ε)ᵀw)²] = (y − xᵀw)² − 2(y − xᵀw)·E[εᵀw] + E[(εᵀw)²]. The middle term is 0 (noise has mean 0); the last is s²‖w‖². Summed over n rows:</p>
  <p style="text-align:center"><strong>E[RSS with noisy inputs] = RSS + n·s²·‖w‖²</strong> &nbsp;=&nbsp; ridge with λ = n·s²</p>
  <p>By hand on the flats: n = 10, jitter each centred area by noise of standard deviation s = 1 (100 sq ft), so λ = 10 × 1 = 10, and ridge predicts w = 495/(82.5 + 10) = 5.351.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression, Ridge

rng = np.random.default_rng(0)
x = np.arange(5, 15, dtype=float) - 9.5                 # centred area of the ten flats
y = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96], dtype=float) - 67
n, s, K = 10, 1.0, 20_000                               # noise std 1 (100 sq ft), K noisy copies per flat
x_aug = np.repeat(x, K) + rng.normal(0, s, n * K)
y_aug = np.repeat(y, K)
w_noise = LinearRegression(fit_intercept=False).fit(x_aug[:, None], y_aug).coef_[0]
print("OLS on clean area        :", 495 / 82.5)
print("OLS on noisy area copies :", round(w_noise, 3))
print("ridge λ = n·s² = 10      :", round(495 / (82.5 + n * s**2), 3),
      " sklearn:", Ridge(alpha=10, fit_intercept=False).fit(x[:, None], y).coef_.round(3))</div>
  <div class="fx" data-lang="text">OLS on clean area        : 6.0
OLS on noisy area copies : 5.349
ridge λ = n·s² = 10      : 5.351  sklearn: [5.351]</div>
  <p>Plain least squares on 20,000 jittered copies of each flat gives slope 5.349, the ridge answer 5.351 to two decimals. The model never saw a penalty term; the noise in the inputs taught it not to trust the exact area too much. The same at scale, five features and 2,000 noisy copies of 40 rows:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression, Ridge

rng = np.random.default_rng(0)
n, p, s = 40, 5, 0.5                                  # s = std of the input noise we add
X = rng.normal(size=(n, p)); y = X @ np.array([3, -2, 0, 0, 1.0]) + rng.normal(0, 1, n)
K = 2000                                              # noisy copies of every row
X_aug = np.repeat(X, K, axis=0) + rng.normal(0, s, (n * K, p))
y_aug = np.repeat(y, K)
w_noise = LinearRegression(fit_intercept=False).fit(X_aug, y_aug).coef_
w_ridge = Ridge(alpha=n * s**2, fit_intercept=False).fit(X, y).coef_      # λ = n·s²
w_ols = LinearRegression(fit_intercept=False).fit(X, y).coef_
print("OLS            ", w_ols.round(3))
print("OLS + noisy X  ", w_noise.round(3))
print("ridge λ=n·s²=10", w_ridge.round(3))</div>
  <div class="fx" data-lang="text">OLS             [ 3.356 -1.683 -0.164  0.312  0.978]
OLS + noisy X   [ 2.319 -1.222 -0.264  0.102  0.86 ]
ridge λ=n·s²=10 [ 2.317 -1.23  -0.265  0.103  0.862]</div>
  <h3>Dropout, by hand</h3>
  <p>In neural networks, <strong>dropout</strong> (Srivastava et al., 2014) randomly switches off each unit with probability p during every training step. A layer outputs a = (2, 4, 6, 8). With p = 0.5, one random mask might keep units 1 and 3: (2, 0, 6, 0). Modern "inverted" dropout scales the survivors by 1/(1 − p) = 2 so the expected output is unchanged: (4, 0, 12, 0). At prediction time nothing is dropped.</p>
  <div class="fx" data-lang="py">import numpy as np
rng = np.random.default_rng(0)
a = np.array([2.0, 4.0, 6.0, 8.0])                    # activations of one layer
p = 0.5                                               # drop probability
mask = np.array([1, 0, 1, 0])                         # one random draw (1 = keep)
print("train pass :", a * mask / (1 - p))             # inverted dropout: scale survivors
means = np.mean([a * (rng.random(4) &gt; p) / (1 - p) for _ in range(100000)], axis=0)
print("average over 100k masks:", means.round(2))
print("test pass  :", a)                              # no dropout at inference</div>
  <div class="fx" data-lang="text">train pass : [ 4.  0. 12.  0.]
average over 100k masks: [2.   3.99 5.97 8.  ]
test pass  : [2. 4. 6. 8.]</div>
  <p>Averaged over many masks, the training output equals the test output (2, 4, 6, 8). Why it regularizes: no unit can rely on a particular partner being present, so the network cannot build fragile co-adapted feature detectors; it behaves like an average of many thinned networks (an ensemble, like bagging in <a class="xref" data-note="ml_bagging">Bagging</a>). For a linear model, dropout on the inputs works out (in expectation) to an L2-type penalty in which each weight is scaled by its feature's size Σᵢxᵢⱼ².</p>
  <h3>Data augmentation</h3>
  <p>The general version: create extra training rows by transformations that should not change the label. Images: flips, crops, small rotations, colour jitter. Audio: time shifts, background noise. Text: synonym swaps, back-translation. Tabular data: rarely safe (small noise on numeric columns as above; for class imbalance, SMOTE in <a class="xref" data-note="ml_features">Feature Engineering</a>). Augmentation encodes prior knowledge ("a flipped cat is still a cat") and enlarges the effective training set, which lowers variance. Related tricks: <strong>label smoothing</strong> (train on 0.9/0.1 instead of 1/0, discouraging over-confident logits like the 0.991 above) and <strong>mixup</strong> (train on blends of two examples and their labels).</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Augment only the training rows, after the split, and never with a transform that changes the label (flipping a "6" makes a "9"; flipping a chest X-ray moves the heart). Augmented copies of a validation row inside the training set is leakage (<a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Regularization as a Prior.</b> We now have a dozen ways to regularize and a number λ that CV picks. Is there a way to say what λ <em>means</em>, other than "the value that won"?</div>

  <h2 id="rg-bayes"><span class="num">14</span>Regularization as a Prior (the MAP View)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>CV picks λ by trial. But a penalty that says "big weights are unlikely" sounds like a belief held before seeing data. Can λ be read as a statement about noise and prior belief, and even estimated from the data that way?</p>
  </div>
  <h3>From probability to penalty</h3>
  <p>Least squares is maximum likelihood under Gaussian noise (<a class="xref" data-note="ml_loss_gd">Loss Functions</a>): yᵢ ~ Normal(xᵢᵀw, σ²), so −log likelihood = (1/(2σ²))·RSS + constant. A Bayesian adds a <strong>prior</strong>: a belief about the weights before seeing data (<a class="xref" data-note="st_probability">Probability</a>). Bayes' rule: posterior ∝ likelihood × prior. The <strong>MAP</strong> (maximum a posteriori) estimate is the w with the highest posterior, i.e. the lowest −log likelihood − log prior.</p>
  <ul>
    <li><strong>Gaussian prior</strong> wⱼ ~ Normal(0, τ²): −log prior = (1/(2τ²))Σw² + const. So −log posterior = (1/(2σ²))RSS + (1/(2τ²))Σw². Multiply by 2σ²: <strong>RSS + (σ²/τ²)Σw²</strong>. That is ridge with <strong>λ = σ²/τ²</strong>.</li>
    <li><strong>Laplace prior</strong> p(wⱼ) ∝ exp(−|wⱼ|/b): −log prior = Σ|w|/b. Multiply (1/(2σ²))RSS + Σ|w|/b by σ²: <strong>½RSS + (σ²/b)Σ|w|</strong>. That is lasso with λ = σ²/b. The Laplace density has a sharp peak at 0, the probabilistic version of the diamond's corner.</li>
  </ul>
  <p>By hand: noise σ = 1, and before seeing data we believe the slope is probably within about ±0.4 (τ = 0.2). Then λ = 1/0.04 = 25. This is exactly the best λ derived in section 10 for a true slope of 0.2: when the prior's scale matches the truth, the MAP penalty is the error-minimising one. Reading λ this way makes it interpretable: <strong>strong penalty = noisy data or a tight belief that weights are small</strong>.</p>
  <h3>Learning λ from the data: BayesianRidge</h3>
  <p><code>BayesianRidge</code> treats both σ² and τ² as unknowns and estimates them by maximising the evidence (the marginal likelihood). Its weights must then equal ridge with λ = σ²/τ². On the ten flats (area only):</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import BayesianRidge, Ridge

area  = np.arange(5, 15, dtype=float).reshape(-1, 1)
price = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96], dtype=float)
br = BayesianRidge().fit(area, price)
noise_var, prior_var = 1 / br.alpha_, 1 / br.lambda_          # σ² and τ² it learnt
lam = noise_var / prior_var
print(f"learnt noise σ²={noise_var:.2f}, prior τ²={prior_var:.2f}  -&gt;  λ = σ²/τ² = {lam:.4f}")
print("BayesianRidge slope:", br.coef_.round(4), "  Ridge(alpha=λ) slope:", Ridge(alpha=lam).fit(area, price).coef_.round(4))</div>
  <div class="fx" data-lang="text">learnt noise σ²=5.11, prior τ²=35.94  -&gt;  λ = σ²/τ² = 0.1422
BayesianRidge slope: [5.9897]   Ridge(alpha=λ) slope: [5.9897]</div>
  <p>sklearn stores precisions (1/variance): <code>alpha_</code> = 1/σ², <code>lambda_</code> = 1/τ². It learnt noise σ² = 5.11 (close to the 4.6 of the line's misses) and a prior variance τ² = 35.9 (a slope "of size about 6"), so λ = 0.142, very close to the λ* = σ²/β² = 0.11 of section 10, and the slope barely shrinks (5.99). At scale on diabetes:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_diabetes
from sklearn.linear_model import BayesianRidge, Ridge
from sklearn.preprocessing import StandardScaler

X, y = load_diabetes(return_X_y=True); X = StandardScaler().fit_transform(X)
br = BayesianRidge().fit(X, y)
noise_var, prior_var = 1 / br.alpha_, 1 / br.lambda_          # σ² and τ² it learnt
lam = noise_var / prior_var                                     # λ = σ² / τ²
print(f"learnt noise σ²={noise_var:.0f}, prior τ²={prior_var:.1f}  -&gt;  λ = σ²/τ² = {lam:.3f}")
print("BayesianRidge coef:", br.coef_[:4].round(2))
print("Ridge(alpha=λ)    :", Ridge(alpha=lam).fit(X, y).coef_[:4].round(2))</div>
  <div class="fx" data-lang="text">learnt noise σ²=2932, prior τ²=197.4  -&gt;  λ = σ²/τ² = 14.856
BayesianRidge coef: [ -0.2  -10.77  24.42  14.98]
Ridge(alpha=λ)    : [ -0.2  -10.77  24.42  14.98]</div>
  <p>It learnt σ² = 2932 and τ² = 197.4, so λ = 14.856, and <code>Ridge(alpha=14.856)</code> reproduces its weights. An alternative to CV for choosing λ, cheap and often close.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>MAP view of regularization</strong>: penalised least squares = maximum a posteriori estimation; the penalty is −log(prior). L2 ⇔ Gaussian prior (λ = σ²/τ²), L1 ⇔ Laplace prior (λ = σ²/b), Elastic Net ⇔ a product of both. λ = 0 ⇔ a flat prior (pure maximum likelihood).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Lasso is the posterior <em>mode</em> under a Laplace prior. The full Bayesian answer (the posterior mean) is never exactly sparse, so "lasso = Bayesian feature selection" is not quite right. Sparse Bayesian methods use other priors (spike-and-slab, horseshoe).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> L2, L1, Elastic Net, scaling, CV, paths, bias–variance, C, pruning, early stopping, noise, dropout, priors: how are they built from one another?</div>

  <h2 id="rg-connect"><span class="num">15</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We met fourteen ideas with fourteen names. Which one is the core, which are variations of it, and which are the practical rules that make it work?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 330" width="680">
<defs><marker id="rg-c9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="200" height="44" rx="7" class="fr sr"/><text x="110" y="29" text-anchor="middle" font-size="11.5" font-weight="700">overfitting / high variance</text><text x="110" y="45" text-anchor="middle" class="tm" font-size="10">twin areas: 17.6, −14.5</text>
<line x1="210" y1="32" x2="248" y2="32" stroke="currentColor" marker-end="url(#rg-c9)"/>
<rect x="250" y="10" width="200" height="44" rx="7" class="fb sb"/><text x="350" y="29" text-anchor="middle" font-size="11.5" font-weight="700">J = loss + λ·Ω(w)</text><text x="350" y="45" text-anchor="middle" class="tm" font-size="10">price on complexity</text>
<line x1="450" y1="32" x2="488" y2="32" stroke="currentColor" marker-end="url(#rg-c9)"/>
<rect x="490" y="10" width="180" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="580" y="29" text-anchor="middle" font-size="11.5" font-weight="700">MAP: −log prior</text><text x="580" y="45" text-anchor="middle" class="tm" font-size="10">λ = σ²/τ² (flats 0.142)</text>
<line x1="300" y1="54" x2="110" y2="88" stroke="currentColor" marker-end="url(#rg-c9)"/><line x1="350" y1="54" x2="340" y2="88" stroke="currentColor" marker-end="url(#rg-c9)"/><line x1="400" y1="54" x2="570" y2="88" stroke="currentColor" marker-end="url(#rg-c9)"/>
<rect x="10" y="90" width="200" height="44" rx="7" class="ft st"/><text x="110" y="109" text-anchor="middle" font-size="11.5" font-weight="700">L2 / ridge: Σxy/(Σx² + λ)</text><text x="110" y="125" text-anchor="middle" class="tm" font-size="10">6 → 4.5 → 3; shares twins</text>
<rect x="240" y="90" width="200" height="44" rx="7" class="ft st"/><text x="340" y="109" text-anchor="middle" font-size="11.5" font-weight="700">L1 / lasso: S(Σxy, λ)/Σx²</text><text x="340" y="125" text-anchor="middle" class="tm" font-size="10">6 → 4 → 0; diamond corners</text>
<rect x="470" y="90" width="200" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="570" y="109" text-anchor="middle" font-size="11.5" font-weight="700">implicit forms</text><text x="570" y="125" text-anchor="middle" class="tm" font-size="10">C, pruning, early stop, noise</text>
<line x1="110" y1="134" x2="200" y2="166" stroke="currentColor" marker-end="url(#rg-c9)"/><line x1="340" y1="134" x2="250" y2="166" stroke="currentColor" marker-end="url(#rg-c9)"/>
<rect x="140" y="168" width="170" height="40" rx="7" class="fg sg"/><text x="225" y="186" text-anchor="middle" font-size="11.5" font-weight="700">Elastic Net</text><text x="225" y="201" text-anchor="middle" class="tm" font-size="10">330/165 = 2</text>
<line x1="570" y1="134" x2="570" y2="166" stroke="currentColor" marker-end="url(#rg-c9)"/>
<rect x="470" y="168" width="200" height="40" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="570" y="186" text-anchor="middle" font-size="11" font-weight="700">noise = ridge λ = n·s²</text><text x="570" y="201" text-anchor="middle" class="tm" font-size="10">5.349 vs 5.351</text>
<rect x="10" y="236" width="200" height="44" rx="7" class="fr sr"/><text x="110" y="255" text-anchor="middle" font-size="11.5" font-weight="700">rule 1: scale first</text><text x="110" y="271" text-anchor="middle" class="tm" font-size="10">75% vs 99.997% kept</text>
<rect x="240" y="236" width="200" height="44" rx="7" class="fr sr"/><text x="340" y="255" text-anchor="middle" font-size="11.5" font-weight="700">rule 2: choose λ by CV</text><text x="340" y="271" text-anchor="middle" class="tm" font-size="10">LOOCV 6.16 → 2.45 (lasso)</text>
<rect x="470" y="236" width="200" height="44" rx="7" class="fg sg"/><text x="570" y="255" text-anchor="middle" font-size="11.5" font-weight="700">effect: bias ↑, variance ↓</text><text x="570" y="271" text-anchor="middle" class="tm" font-size="10">λ* = σ²/β² (0.11 for area)</text>
<line x1="225" y1="208" x2="130" y2="234" stroke="currentColor" marker-end="url(#rg-c9)"/><line x1="225" y1="208" x2="330" y2="234" stroke="currentColor" marker-end="url(#rg-c9)"/>
<line x1="440" y1="258" x2="468" y2="258" stroke="currentColor" marker-end="url(#rg-c9)"/>
<text x="340" y="310" text-anchor="middle" class="tm" font-size="10.5">the path (every λ at once) shows which columns survive: area → Baner → age → Kothrud; carpet and bedrooms never</text>
</svg><figcaption>One idea, "loss + λ × size of the weights", drives the note. The shape of the penalty decides the behaviour (L2 shrinks and shares, L1 zeroes, Elastic Net does both); the MAP view says what λ means; implicit forms (C, pruning, early stopping, noise) reach the same place by other routes. Two practical rules (scale first, choose λ by CV) make it work, and the payoff is always the same trade: a little bias for less variance.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the ten flats</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on our flats</th><th>When to use</th></tr>
    <tr><td>Overfitting weights</td><td>least squares with redundant columns</td><td>what goes wrong?</td><td>twins 17.6 / −14.5 → 23.4 / −22.1</td><td>signal that a penalty is needed</td></tr>
    <tr><td>Penalised cost</td><td>loss + λ·Ω</td><td>how to prefer calm weights?</td><td>Σw² 63.77, Σ|w| 12.98</td><td>any overfit model</td></tr>
    <tr><td>Ridge (L2)</td><td>Σw² penalty</td><td>shrink smoothly?</td><td>6 → 4.5 (λ 27.5); twins (4.2, 2.2)</td><td>many small effects, collinearity</td></tr>
    <tr><td>Weight decay</td><td>ridge in gradient form</td><td>how does GD apply it?</td><td>×0.78 per step → 4.5</td><td>neural networks, SGD</td></tr>
    <tr><td>Lasso (L1)</td><td>Σ|w| penalty, soft threshold</td><td>switch features off?</td><td>4 at λ 165, 0 from 495</td><td>few features matter</td></tr>
    <tr><td>Elastic Net</td><td>L1 + L2</td><td>sparse and grouped?</td><td>330/165 = 2</td><td>correlated groups, p ≫ n</td></tr>
    <tr><td>Scaling</td><td>(x − mean)/std</td><td>is the penalty fair?</td><td>75% vs 99.997% kept</td><td>always, before L1/L2</td></tr>
    <tr><td>λ by CV</td><td>held-out error per λ</td><td>how strong?</td><td>OLS 6.16, ridge 6.05, lasso 2.45</td><td>always</td></tr>
    <tr><td>Path</td><td>fits for every λ</td><td>which columns matter?</td><td>α_max 17.23; area, Baner, age, Kothrud</td><td>interpretation, warm starts</td></tr>
    <tr><td>Bias–variance</td><td>E[w], Var[w]</td><td>when does shrinking pay?</td><td>λ* = σ²/β² = 0.11 for area</td><td>weak, noisy effects</td></tr>
    <tr><td>C = 1/λ</td><td>penalised log-loss</td><td>same in classifiers?</td><td>age weight 0.04 → 25.4 as C grows</td><td>logistic, SVM</td></tr>
    <tr><td>Early stopping</td><td>GD from 0, stop at best val</td><td>penalty without a term?</td><td>λ ≈ 1/(ηt)</td><td>GD-trained models, boosting</td></tr>
    <tr><td>Input noise / dropout</td><td>jittered or thinned data</td><td>regularize through data?</td><td>5.349 = ridge λ = 10 (5.351)</td><td>networks, augmentation</td></tr>
    <tr><td>Prior (MAP)</td><td>−log prior</td><td>what does λ mean?</td><td>BayesianRidge λ = 0.142</td><td>interpreting or estimating λ</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>regularization adds a price on weight size to the loss, trading a little bias for less variance; the shape of the price decides whether weights shrink (L2) or vanish (L1), and its size λ must be set on fair units by cross-validation.</strong> On the flats: the strong area slope needs almost no price (λ* = 0.11), the redundant columns need a lasso-sized one, and the right amount cut the honest error from 6.16 to 2.45.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Comparisons.</b> Side by side, how do the three penalties and the implicit regularizers compare?</div>

  <h2 id="rg-compare"><span class="num">16</span>Comparisons</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Faced with a new dataset, which penalty should be the first try, and how do the explicit and implicit regularizers line up?</p>
  </div>
  <h3>The three penalties</h3>
  <table class="tbl">
    <tr><th></th><th>L2 / Ridge</th><th>L1 / Lasso</th><th>Elastic Net</th></tr>
    <tr><td>Penalty Ω</td><td>Σw²</td><td>Σ|w|</td><td>r·Σ|w| + ½(1 − r)·Σw²</td></tr>
    <tr><td>1-feature solution</td><td>Σxy/(Σx² + λ)</td><td>S(Σxy, λ)/Σx²</td><td>S(Σxy, λ₁)/(Σx² + λ₂)</td></tr>
    <tr><td>Pull toward 0</td><td>2λw, fades near 0</td><td>λ, constant</td><td>both</td></tr>
    <tr><td>Exact zeros</td><td>never</td><td>yes (sparse)</td><td>yes</td></tr>
    <tr><td>Correlated features</td><td>shares weight, stable</td><td>keeps one, unstable</td><td>shares and selects groups</td></tr>
    <tr><td>p &gt; n</td><td>fine (unique solution)</td><td>at most n non-zero</td><td>can keep more than n</td></tr>
    <tr><td>Solver</td><td>closed form (XᵀX + λI)⁻¹Xᵀy</td><td>coordinate descent / LARS</td><td>coordinate descent</td></tr>
    <tr><td>Bayesian prior</td><td>Gaussian</td><td>Laplace</td><td>mix</td></tr>
    <tr><td>Flats (6 columns)</td><td>LOOCV 6.05 at best</td><td>2.45, keeps area, age, Baner</td><td>between, keeps the area twins together</td></tr>
    <tr><td>Use when</td><td>many features each matter a little; multicollinearity</td><td>few features matter; want a short list</td><td>many correlated features, some useless</td></tr>
  </table>
  <h3>Explicit vs implicit regularizers</h3>
  <table class="tbl">
    <tr><th>Method</th><th>Where the "fine" lives</th><th>Knob (stronger →)</th><th>Typical models</th></tr>
    <tr><td>L1 / L2 / Elastic Net</td><td>term in the loss</td><td>α ↑ (or C ↓)</td><td>linear, logistic, SVM, nets</td></tr>
    <tr><td>Pruning / depth limits</td><td>model structure</td><td>ccp_alpha ↑, max_depth ↓</td><td>trees</td></tr>
    <tr><td>Shrinkage</td><td>each boosting step</td><td>learning_rate ↓ (with more trees)</td><td>boosting</td></tr>
    <tr><td>Early stopping</td><td>training time</td><td>fewer steps</td><td>GD-trained models, boosting, nets</td></tr>
    <tr><td>Dropout</td><td>random thinning</td><td>p ↑</td><td>neural nets</td></tr>
    <tr><td>Noise / augmentation</td><td>the training data</td><td>more noise / transforms</td><td>nets, any model</td></tr>
    <tr><td>Prior (MAP)</td><td>belief about weights</td><td>τ ↓</td><td>Bayesian models</td></tr>
  </table>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The ideas are simple; the slips in code are not. Which mistakes undo a regularized model most often?</div>

  <h2 id="rg-traps"><span class="num">17</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A penalty is one line of code, which makes it easy to apply wrongly. What are the classic ways it fails silently, and what did each look like on the flats?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: not scaling</span>
    <p>The penalty acts on weight size, which depends on units: the same λ kept 75% of the area slope in 100 sq ft and 99.997% in sq ft, and unscaled lasso dropped "rooms" only because "area" was in square feet. Standardise inside a pipeline for every L1/L2-regularized linear model, SVM and network.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: choosing λ on training error or on the test set</span>
    <p>Training error always prefers λ = 0. The test set must stay untouched. Use CV on the training data (RidgeCV, LassoCV, GridSearchCV), with a log-spaced grid.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: C vs alpha direction</span>
    <p>alpha bigger = stronger (Ridge, Lasso, MLP). C bigger = weaker (LogisticRegression, SVC): the flats' age weight grew from 0.04 to 25.4 as C rose. Remember C = 1/λ.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting the default penalty</span>
    <p>sklearn's <code>LogisticRegression</code> is L2-regularized with C = 1 by default (age weight 1.44, not the "true" unbounded fit). Coefficients you report as "effects" are shrunk, and unscaled inputs make the shrinkage uneven. For unpenalised inference use <code>C=np.inf</code> or statsmodels.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: interpreting lasso's choices as truth</span>
    <p>With correlated features lasso keeps one at random (built-up area beat carpet area by a push of 17.23 to 17.18) and can let noise columns in. Check stability (refit on bootstrap samples), or use Elastic Net.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: expecting regularization to fix underfitting</span>
    <p>It lowers variance and adds bias. If both training and validation errors are high, decrease λ, add features or use a more flexible model. On the strong area slope any real shrinking only hurt.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: penalising the intercept</span>
    <p>Hand-written gradient descent often adds λ·b² by accident, pulling every flat's price toward ₹0. Exclude the bias term (and, in nets, usually batch-norm parameters) from weight decay.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: comparing alpha across libraries</span>
    <p>sklearn scales the loss by 1/(2n) for Lasso/ElasticNet but not for Ridge; glmnet swaps the names alpha and lambda. Convert before comparing numbers.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reporting J as the model's error</span>
    <p>Validation and test error are measured with the plain loss. The penalty is not part of the score.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet, then <a class="xref" data-note="ml_features">Feature Engineering</a>.</b> A penalty is only as fair as the units of the columns, and only as useful as the columns themselves (locality alone cut LOOCV from 7.25 to 1.16). How do we turn raw columns (areas, localities, ages, missing values) into good, fairly scaled inputs?</div>

  <h2 id="rg-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one page. Running example: ten flats, area x (100 sq ft) 5 … 14 → price y (₹ lakh) 38, 49, 53, 56, 67, 68, 73, 83, 87, 96; centred sums Σxy = 495, Σx² = 82.5, Σy² = 3016. Extra columns: carpet area ≈ 0.8 × area (correlation 0.9993), bedrooms, age, locality (Baner, Kothrud, Hadapsar).</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>Answer on our flats</th><th>Weakness → next</th></tr>
    <tr><td>Overfitting weights</td><td>what goes wrong?</td><td>twins 17.6 / −14.5, unstable</td><td>need calm weights</td></tr>
    <tr><td>Penalty idea</td><td>how to price weights?</td><td>J = loss + λΩ; Σw² 63.77</td><td>which penalty?</td></tr>
    <tr><td>Ridge</td><td>shrink smoothly?</td><td>6 → 4.5 → 3; twins (4.2, 2.2)</td><td>never zero</td></tr>
    <tr><td>Lasso</td><td>switch off?</td><td>6 → 4 → 0 (λ ≥ 495)</td><td>why zeros?</td></tr>
    <tr><td>Geometry</td><td>why zeros?</td><td>diamond corners on axes</td><td>arbitrary among twins</td></tr>
    <tr><td>Elastic Net</td><td>sparse + grouped?</td><td>330/165 = 2</td><td>units matter</td></tr>
    <tr><td>Scale first</td><td>fair penalty?</td><td>75% vs 99.997% kept</td><td>how big λ?</td></tr>
    <tr><td>CV for λ</td><td>which λ?</td><td>OLS 6.16, ridge 6.05, lasso 2.45</td><td>whole family?</td></tr>
    <tr><td>Path</td><td>all λ at once</td><td>α_max 17.23; area, Baner, age, Kothrud</td><td>when does shrinking pay?</td></tr>
    <tr><td>Bias–variance</td><td>the trade</td><td>λ* = σ²/β² = 0.11 for area</td><td>other models?</td></tr>
    <tr><td>Other models</td><td>same idea elsewhere?</td><td>C: age weight 0.04 → 25.4</td><td>without a term?</td></tr>
    <tr><td>Early stopping</td><td>stop as a penalty?</td><td>λ ≈ 1/(ηt)</td><td>through data?</td></tr>
    <tr><td>Noise, dropout</td><td>regularize via data?</td><td>5.349 = ridge 5.351</td><td>what is λ?</td></tr>
    <tr><td>Prior</td><td>meaning of λ</td><td>σ²/τ²: 0.142</td><td>fair inputs → features</td></tr>
  </table>
  <h3>Definitions</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td>Regularization</td><td>Adding a penalty on complexity to the training objective (or limiting the model another way) to reduce variance at the cost of some bias.</td></tr>
    <tr><td>λ (alpha), C</td><td>Penalty strength chosen by CV; C = 1/λ in logistic regression and SVMs (bigger C = weaker).</td></tr>
    <tr><td>Ridge / L2</td><td>Penalty Σw²; shrinks every weight proportionally, never to zero; shares weight among correlated features. Also called weight decay.</td></tr>
    <tr><td>Lasso / L1</td><td>Penalty Σ|w|; soft-thresholds, sets weak weights exactly to zero (sparse, built-in feature selection); picks one of correlated twins.</td></tr>
    <tr><td>Elastic Net</td><td>L1 + L2 mix: sparse and keeps correlated groups together.</td></tr>
    <tr><td>Soft threshold</td><td>S(z, λ) = sign(z)·max(|z| − λ, 0).</td></tr>
    <tr><td>Regularization path</td><td>The fitted weights for every λ; lasso's starts empty at α_max = max|xⱼᵀy|/n.</td></tr>
    <tr><td>Effective degrees of freedom</td><td>Σ d/(d + λ) over eigenvalues d of XᵀX: a continuous measure of capacity.</td></tr>
    <tr><td>Early stopping, dropout, augmentation</td><td>Implicit regularizers: stop GD at the best validation step; randomly zero units; train on label-preserving transformed copies.</td></tr>
    <tr><td>MAP</td><td>Maximum a posteriori: penalised fit = likelihood × prior; Gaussian prior ⇔ L2, Laplace ⇔ L1.</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols and our numbers</th></tr>
    <tr><td>Penalised cost</td><td>J(w) = RSS + λΩ(w)</td><td>Ω = Σw² or Σ|w|; intercept not penalised</td></tr>
    <tr><td>Ridge, one feature</td><td>w = Σxy/(Σx² + λ)</td><td>495/(82.5 + 27.5) = 4.5</td></tr>
    <tr><td>Ridge, matrix</td><td>(XᵀX + λI)⁻¹Xᵀy; keeps d/(d + λ) per eigen-direction</td><td>twins λ = 1: 99.3% and 4.0%</td></tr>
    <tr><td>Weight decay</td><td>w ← (1 − 2ηλ)w − η∇RSS</td><td>η = 0.004, λ = 27.5: factor 0.78; 0 → 3.96 → 4.435 → 4.5</td></tr>
    <tr><td>Lasso, one feature</td><td>w = S(Σxy, λ)/Σx² (with ½RSS); sklearn α = λ/n</td><td>S(495, 165)/82.5 = 4</td></tr>
    <tr><td>Elastic Net</td><td>w = S(Σxy, λ₁)/(Σx² + λ₂); α = (λ₁ + λ₂)/n, r = λ₁/(λ₁ + λ₂)</td><td>330/165 = 2; α 24.75, r 0.667</td></tr>
    <tr><td>Lasso start</td><td>α_max = maxⱼ |xⱼᵀy|/n</td><td>17.23 (area)</td></tr>
    <tr><td>Bias, variance</td><td>bias = −βλ/(Σx² + λ); Var = σ²Σx²/(Σx² + λ)²; λ* = σ²/β²</td><td>area: 4/36 = 0.11; weak slope 0.2: 25</td></tr>
    <tr><td>Early stopping</td><td>λ ≈ 1/(η·t)</td><td>η 0.1, t 10 → λ ≈ 1</td></tr>
    <tr><td>Input noise</td><td>E[RSS] = RSS + n s²‖w‖² → λ = n s²</td><td>n 10, s 1 → 10; 495/92.5 = 5.351</td></tr>
    <tr><td>MAP</td><td>λ = σ²/τ² (Gaussian), σ²/b (Laplace)</td><td>σ 1, τ 0.2 → 25; flats learnt 0.142</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Ridge</b><p>Many features each matter a little, or strongly correlated features you want to keep; numerically stabilises XᵀX.</p><small>No feature selection</small></div>
    <div><b>Lasso</b><p>You expect a few columns to matter and want a short list (flats: area, age, Baner).</p><small>Unstable among twins; at most n features</small></div>
    <div><b>Elastic Net</b><p>Correlated groups plus useless columns, or p ≫ n.</p><small>Tune l1_ratio as well as alpha</small></div>
    <div><b>Not a fix for</b><p>Underfitting (both errors high), bad features, or leakage. A strong, well-measured effect needs almost no penalty.</p><small>Diagnose before regularizing</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>No scaling; choosing λ on training or test error; C vs alpha direction; forgetting LogisticRegression's default penalty; reading lasso's zeros as truth; using a penalty for underfitting; penalising the intercept; comparing alphas across libraries; reporting the penalised J as the error.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Σxy = 495, Σx² = 82.5, λ = 82.5: ridge slope?</td><td>495/165 = 3 (halved)</td></tr>
    <tr><td>Same data, lasso (½RSS + λ|w|) with λ = 330?</td><td>(495 − 330)/82.5 = 2</td></tr>
    <tr><td>Smallest λ at which the lasso slope is exactly 0?</td><td>λ = 495 (sklearn α = 49.5)</td></tr>
    <tr><td>LogisticRegression C from 1 to 100: stronger or weaker penalty?</td><td>Weaker (C = 1/λ)</td></tr>
    <tr><td>Area in sq ft instead of 100 sq ft, same λ: what happens to ridge?</td><td>Almost no shrinkage (keeps 99.997%); scale first</td></tr>
  </table>

  <h2 id="rg-qa"><span class="num">18</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is regularization and why does it reduce overfitting?</summary><div class="qa-body">Adding a penalty on model complexity to the training objective: J(w) = loss + λ·Ω(w). The model may only use large weights (or many leaves, or many steps) when they reduce the loss by more than they cost. This removes the freedom to fit noise, lowering variance at the price of a little bias; with λ tuned by CV the total error drops (flats with all six columns: LOOCV 6.16 → 2.45 with lasso; 25 rows, 20 features: test R² from −16.7 to 0.40).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the ridge solution for one feature without intercept, and apply it to the flats at λ = 27.5.</summary><div class="qa-body">J = Σ(y − wx)² + λw². dJ/dw = −2Σx(y − wx) + 2λw = 0 ⇒ w = Σxy/(Σx² + λ). It is the OLS weight times Σx²/(Σx² + λ). Flats (centred): 495/(82.5 + 27.5) = 4.5, i.e. 75% of the OLS slope 6. Matrix form: (XᵀX + λI)⁻¹Xᵀy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does L1 produce exact zeros and L2 does not?</summary><div class="qa-body">Pull: the L2 penalty's slope 2λw fades as w → 0, so weak weights settle at small non-zero values; the L1 slope is a constant λ, so a weight whose data push |Σxy| is below λ is held at exactly 0 (soft thresholding w = S(z, λ)/Σx²; flats: 0 from λ = 495). Geometry: the L1 constraint region is a diamond with corners on the axes, and the loss contours usually touch it at a corner; the L2 disc has no corners.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Two columns, built-up and carpet area, correlate 0.9993. What do OLS, ridge and lasso do with them?</summary><div class="qa-body">OLS gives absurd, unstable, opposite weights (17.6 and −14.5; 23.4 and −22.1 without flat J) because the direction "more of one, less of the other" barely changes predictions (eigenvalue 0.042). Ridge shrinks that direction to 4% and shares the effect stably (about 4.2 and 2.2). Lasso keeps one twin and zeroes the other (area won by a push of 17.23 vs 17.18), which can flip with small data changes. Elastic Net keeps both, shared.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is Elastic Net and when do you prefer it over lasso?</summary><div class="qa-body">The penalty α[r‖w‖₁ + ½(1 − r)‖w‖²]; for one feature w = S(Σxy, λ₁)/(Σx² + λ₂). Prefer it when features are correlated (lasso picks one twin arbitrarily; Elastic Net keeps the group), when p ≫ n (lasso can select at most n), or when lasso's selection is unstable across resamples. Tune r with ElasticNetCV.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must features be standardised before ridge or lasso? Does a random forest need it?</summary><div class="qa-body">The penalty is on weight size, and a weight's size depends on the feature's units: the same λ kept 75% of the flats' slope with area in 100 sq ft and 99.997% in sq ft. A feature in large numbers escapes the penalty; one in small numbers is punished. Standardising makes every weight "effect per SD". Trees split on order, not size, and a forest has no weight penalty, so it does not need scaling.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you choose λ? What is the 1-SE rule?</summary><div class="qa-body">By cross-validation over a log-spaced grid, inside a pipeline, on training data only (RidgeCV/LassoCV/GridSearchCV; LOO for the ten flats). The 1-SE rule picks the largest λ whose CV error is within one standard error of the minimum: a simpler model that is statistically as good (diabetes example: min 3978 ± 312 at α = 100 → 1-SE choice α = 300 with 4224).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Show how ridge trades bias for variance for one weight. Why did ridge barely help the flats' area slope?</summary><div class="qa-body">With y = βx + ε: bias = −βλ/(Σx² + λ); Var[w] = σ²Σx²/(Σx² + λ)²; best λ* = σ²/β². For the flats β = 6, σ² ≈ 4, so λ* = 0.11: a strong, precisely measured effect gains almost nothing from shrinking (MSE 0.04848 → 0.04842). For a weak effect (β = 0.2, σ = 1, Σx² = 30) λ* = 25 halves the error (0.0333 → 0.0182).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a regularization path and where does the lasso path start?</summary><div class="qa-body">The fitted weights as a function of λ from large to small. For lasso (sklearn scaling, standardised X, centred y), all weights are zero for α ≥ α_max = maxⱼ|xⱼᵀy|/n; the feature attaining it enters first, then others one by one (flats: 17.23 from area, then Baner, age, Kothrud; carpet and bedrooms never). Ridge paths shrink smoothly and never hit zero.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In LogisticRegression, does C = 100 mean more or less regularization than C = 0.01?</summary><div class="qa-body">Less. C multiplies the data loss, so it is like 1/λ. On the flats' age → sold-fast data the weight is 0.04 at C = 0.01 and 8.5 at C = 100 (25.4 at C = 10,000). sklearn's logistic regression is L2-regularized with C = 1 by default.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How is early stopping a form of regularization?</summary><div class="qa-body">Gradient descent from w = 0 first grows weights along strongly supported directions and only later along weak, noise-dominated ones. Stopping at the minimum validation error limits how far weights travel. For a direction with curvature d it keeps 1 − (1 − ηd)ᵗ of the OLS value, similar to ridge's d/(d + λ) with λ ≈ 1/(ηt).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Show that adding Gaussian noise to inputs is equivalent to ridge.</summary><div class="qa-body">E[(y − (x + ε)ᵀw)²] = (y − xᵀw)² + s²‖w‖² (the cross term has mean 0). Summing over n rows: RSS + n·s²‖w‖², i.e. ridge with λ = n·s². On the flats, jittering area by s = 1 gave slope 5.349 against ridge (λ = 10) 495/92.5 = 5.351.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the Bayesian interpretation of L2 and L1?</summary><div class="qa-body">Penalised least squares is MAP estimation; the penalty is −log prior. A Gaussian prior N(0, τ²) gives ridge with λ = σ²/τ²; a Laplace prior with scale b gives lasso with λ = σ²/b. Strong regularization = noisy data or a tight prior. BayesianRidge estimates σ² and τ² (flats: 5.11 and 35.9 → λ = 0.142) and reproduces Ridge(α = σ²/τ²).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does regularization need feature engineering and pipelines? What breaks if you skip them?</summary><div class="qa-body">The penalty compares weight sizes, so it is only fair after scaling (otherwise units decide which features survive); one-hot columns like Baner/Kothrud have to exist before lasso can select them; and the scaler and λ search must be fitted inside each CV fold, or validation rows leak into the means and stds. Skip scaling and lasso drops rooms because area is in sq ft; skip the pipeline and the CV score is optimistic. That is the job of <a class="xref" data-note="ml_features">Feature Engineering</a> and <a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does this note change the loss and gradient descent of the previous note?</summary><div class="qa-body">The cost gains a term λΩ(w); for L2 the gradient gains 2λw, giving the weight-decay update w ← (1 − 2ηλ)w − η∇RSS, and every Hessian eigenvalue rises by 2λ, so the bowl becomes strongly convex and better conditioned. The closed form gains λI: (XᵀX + λI)⁻¹Xᵀy. L1 adds a kink, which plain gradient descent handles poorly, so lasso uses coordinate descent with soft thresholding.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does cost-complexity pruning of a decision tree relate to ridge and lasso?</summary><div class="qa-body">Same template: minimise training error + α × complexity. For trees the complexity is the number of leaves |T| (R(T) + α|T|), like an L0 penalty on leaves; α is chosen by CV from the pruning path, just as λ is chosen from the lasso path. XGBoost goes further: an L2 penalty λ on leaf weights (leaf = −G/(H + λ)) and a per-leaf price γ.</div></details>
</main>
`
});
