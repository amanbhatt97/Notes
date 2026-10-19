// notes/ml/ml_loss_gd.js — Loss Functions & Gradient Descent
Object.assign(TOPIC_CONTENT, {
  "ml_loss_gd": `<main>
  <h1>Loss Functions &amp; Gradient Descent</h1>
  <div class="where"><span>Machine Learning</span><span>Foundations</span><span>Loss Functions &amp; Gradient Descent</span></div>
  <p class="lead">Every model you will train does the same two things: it measures how wrong it is with a <strong>loss function</strong>, and it changes its parameters to make that number smaller, usually with <strong>gradient descent</strong>. This note covers both completely. Squared, absolute, Huber, log-loss (derived from likelihood), hinge and 0-1 loss are each worked by hand and plotted; then gradient descent is derived for linear regression and run by hand for three steps on three points, followed by learning rates, convexity, batch vs stochastic vs mini-batch, feature scaling, momentum and Adam, the closed-form alternative, and a from-scratch implementation that matches scikit-learn to many decimal places.</p>

  <h2 id="lg-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 230" width="660">
<defs><marker id="lg-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<text x="330" y="16" text-anchor="middle" class="tm" font-size="11">Machine Learning › Foundations</text>
<rect x="15" y="30" width="190" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="110" y="50" text-anchor="middle" font-size="12">Bias, Variance &amp;</text><text x="110" y="65" text-anchor="middle" font-size="12">Generalization</text>
<rect x="235" y="24" width="190" height="56" rx="8" class="fg sg" stroke-width="3"/><text x="330" y="46" text-anchor="middle" font-size="12.5" font-weight="700">Loss Functions &amp;</text><text x="330" y="61" text-anchor="middle" font-size="12.5" font-weight="700">Gradient Descent</text><text x="330" y="74" text-anchor="middle" font-size="10" class="tg">YOU ARE HERE</text>
<rect x="455" y="30" width="190" height="44" rx="8" class="fb sb"/><text x="550" y="57" text-anchor="middle" font-size="12">Regularization</text>
<line x1="205" y1="52" x2="233" y2="52" stroke="currentColor" marker-end="url(#lg-a0)"/><line x1="425" y1="52" x2="453" y2="52" stroke="currentColor" marker-end="url(#lg-a0)"/>
<text x="550" y="92" text-anchor="middle" class="tm" font-size="10.5">cost = loss + λ·penalty</text>
<line x1="330" y1="80" x2="330" y2="112" stroke="currentColor"/><line x1="80" y1="112" x2="580" y2="112" stroke="currentColor"/>
<line x1="80" y1="112" x2="80" y2="132" stroke="currentColor" marker-end="url(#lg-a0)"/><line x1="205" y1="112" x2="205" y2="132" stroke="currentColor" marker-end="url(#lg-a0)"/><line x1="330" y1="112" x2="330" y2="132" stroke="currentColor" marker-end="url(#lg-a0)"/><line x1="455" y1="112" x2="455" y2="132" stroke="currentColor" marker-end="url(#lg-a0)"/><line x1="580" y1="112" x2="580" y2="132" stroke="currentColor" marker-end="url(#lg-a0)"/>
<rect x="20" y="134" width="120" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="80" y="153" text-anchor="middle" font-size="11.5">Linear Regr.</text><text x="80" y="168" text-anchor="middle" class="tm" font-size="10.5">squared loss</text>
<rect x="145" y="134" width="120" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="205" y="153" text-anchor="middle" font-size="11.5">Logistic Regr.</text><text x="205" y="168" text-anchor="middle" class="tm" font-size="10.5">log loss</text>
<rect x="270" y="134" width="120" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="330" y="153" text-anchor="middle" font-size="11.5">SVM</text><text x="330" y="168" text-anchor="middle" class="tm" font-size="10.5">hinge loss</text>
<rect x="395" y="134" width="120" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="455" y="153" text-anchor="middle" font-size="11.5">Gradient Boosting</text><text x="455" y="168" text-anchor="middle" class="tm" font-size="10.5">fits loss gradients</text>
<rect x="520" y="134" width="120" height="44" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="580" y="153" text-anchor="middle" font-size="11.5">Neural Networks</text><text x="580" y="168" text-anchor="middle" class="tm" font-size="10.5">SGD / Adam</text>
<text x="330" y="205" text-anchor="middle" class="tm" font-size="11">Every model below chooses a loss and minimises it; most of them with a version of gradient descent.</text>
<text x="330" y="222" text-anchor="middle" class="tm" font-size="11">The maths behind it lives in Calculus (derivatives) and Optimization (convergence, Adam).</text>
</svg><figcaption>This note sits between "why test error matters" and "how to control complexity". Every later model family is a choice of loss plus a way to minimise it.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a></b><span>You saw that a model is judged on new data, and that training error can lie. But we never said what "error" exactly is for a given row, or how a model actually changes its parameters to reduce it. Every fit in that note was a black box called <code>.fit()</code>.</span></li>
    <li><b>This note adds: the objective and the optimiser</b><span>What a loss function is, the six losses you must know (squared, absolute, Huber, log-loss, hinge, 0-1), why each exists (they come from different assumptions about noise), and gradient descent: the algorithm that walks downhill on the average loss. You will run it by hand, break it with a bad learning rate, speed it up with scaling and momentum, and write it from scratch.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_regularization">Regularization</a>, then every model</b><span>Regularization adds a penalty to this cost (cost = average loss + λ·penalty) to trade a little bias for less variance. <a class="xref" data-note="ml_regression">Linear Regression</a> is squared loss, <a class="xref" data-note="ml_classification">Logistic Regression</a> is log-loss, <a class="xref" data-note="ml_svm">SVMs</a> are hinge loss, and <a class="xref" data-note="ml_gbm">Gradient Boosting</a> fits trees to the gradient of any of these losses. The calculus is in <a class="xref" data-note="m_calculus">Calculus</a>; deeper optimiser theory is in <a class="xref" data-note="m_optimization">Optimization</a>.</span></li>
  </ol>

  <h2 id="lg-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Loss Functions &amp; Gradient Descent</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Loss, cost, metric</div>
        <ul>
          <li><b>Loss</b> L(y, ŷ) — wrongness of ONE prediction</li>
          <li><b>Cost / objective</b> J(θ) — average loss over training rows (+ penalty); what is minimised</li>
          <li><b>Metric</b> — what the business reads (accuracy, RMSE); need not be differentiable</li>
          <li>Residual r = y − ŷ; margin m = y·f(x) with y ∈ {−1, +1}</li>
          <li>💡 Loss = marks lost on one question; cost = total marks lost in the paper</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Regression losses</div>
        <ul>
          <li><b>Squared</b> r² — smooth, gradient −2r; best constant = <b>mean</b>; Gaussian noise MLE; outlier-sensitive</li>
          <li><b>Absolute</b> |r| — gradient −sign(r); best constant = <b>median</b>; Laplace MLE; kink at 0</li>
          <li><b>Huber</b> — ½r² if |r| ≤ δ else δ(|r| − ½δ); gradient = clipped residual</li>
          <li>Worked: r = 0.5, 0, −2, 6 → MSE 10.06, MAE 2.125, Huber 1.78</li>
          <li>[2,3,4,6,21]: mean 7.2, Huber 4.25, median 4</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Classification losses</div>
        <ul>
          <li><b>Log-loss</b> −[y ln p + (1−y) ln(1−p)] — negative Bernoulli log-likelihood</li>
          <li>Gradient w.r.t. score z: <b>p − y</b>; multiclass: softmax + −ln p_true</li>
          <li>p = 0.99 for the wrong class costs 4.6; p = 0.9 right costs 0.105</li>
          <li><b>Hinge</b> max(0, 1 − m) — SVM; zero once m ≥ 1</li>
          <li><b>0-1</b> — what we care about; gradient 0 everywhere → use convex surrogates</li>
          <li>⚠ MSE + sigmoid is not convex; gradient vanishes when confidently wrong</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Gradient descent</div>
        <ul>
          <li><b>θ ← θ − η ∇J(θ)</b>; for MSE ∇J = (2/n) Xᵀ(Xθ − y)</li>
          <li>3 points, η = 0.1: (0, 0) → (1.667, 0.733) → (1.484, 0.653) → (1.504, 0.662); exact (1.5, 0.667)</li>
          <li><b>Learning rate</b>: stable iff η &lt; 2/L (L = largest Hessian eigenvalue = 11.09 → 0.18)</li>
          <li>Speed governed by condition number κ = L/μ</li>
          <li><b>Convex</b> cost → any minimum is global (MSE, log-loss, hinge)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Variants &amp; speed-ups</div>
        <ul>
          <li><b>Batch</b> — all rows per step; smooth, slow per step</li>
          <li><b>SGD</b> — one row; noisy, cheap; needs decaying η</li>
          <li><b>Mini-batch</b> (32–512) — the default; 1 epoch = 313 updates for n = 10,000</li>
          <li><b>Scaling</b> — κ 28.8 million → 11.2; steps &gt;100,000 → 82</li>
          <li><b>Momentum</b> (439 → 153 steps), <b>Adam</b> (per-coordinate step size)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Closed form vs iterative</div>
        <ul>
          <li>Normal equation XᵀXθ = Xᵀy; 3 points: [[14, 6], [6, 3]]θ = [25, 11] → (1.5, 0.667)</li>
          <li>Cost O(nd² + d³) once vs O(nd) per GD step</li>
          <li>Closed form only for squared loss (and ridge); logistic, hinge, NNs need iterations</li>
          <li>From scratch: linear coef diff 1.5e-11, logistic 1.1e-6 vs sklearn</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="lg-what"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What a Loss Is</span><span class="rm-sub">Loss vs cost vs metric</span></div></div>
      <div class="rm-item rm-done" data-target="lg-sq"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Squared Loss</span><span class="rm-sub">Mean, Gaussian likelihood</span></div></div>
      <div class="rm-item rm-done" data-target="lg-abs"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Absolute Loss</span><span class="rm-sub">Median, robustness</span></div></div>
      <div class="rm-item rm-done" data-target="lg-huber"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Huber Loss</span><span class="rm-sub">The best of both</span></div></div>
      <div class="rm-item rm-done" data-target="lg-log"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Log-Loss / Cross-Entropy</span><span class="rm-sub">Derived from likelihood</span></div></div>
      <div class="rm-item rm-done" data-target="lg-hinge"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Hinge Loss</span><span class="rm-sub">Margins and SVMs</span></div></div>
      <div class="rm-item rm-done" data-target="lg-01"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">0-1 Loss &amp; Surrogates</span><span class="rm-sub">Why we don't minimise accuracy</span></div></div>
      <div class="rm-item rm-done" data-target="lg-cost"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">From Loss to Cost Surface</span><span class="rm-sub">J(w, b) by hand</span></div></div>
      <div class="rm-item rm-done" data-target="lg-gd"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Gradient Descent, Derived</span><span class="rm-sub">3 steps on 3 points</span></div></div>
      <div class="rm-item rm-done" data-target="lg-lr"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">The Learning Rate</span><span class="rm-sub">Too small, right, too big</span></div></div>
      <div class="rm-item rm-done" data-target="lg-convex"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Convexity</span><span class="rm-sub">When downhill means best</span></div></div>
      <div class="rm-item rm-done" data-target="lg-batch"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Batch, Stochastic, Mini-batch</span><span class="rm-sub">How much data per step</span></div></div>
      <div class="rm-item rm-done" data-target="lg-scale"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Feature Scaling</span><span class="rm-sub">Why GD crawls without it</span></div></div>
      <div class="rm-item rm-done" data-target="lg-adam"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Momentum &amp; Adam</span><span class="rm-sub">Brief, with one step by hand</span></div></div>
      <div class="rm-item rm-done" data-target="lg-closed"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Closed Form vs Iterative</span><span class="rm-sub">The normal equation</span></div></div>
      <div class="rm-item rm-done" data-target="lg-scratch"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">From Scratch</span><span class="rm-sub">Matching sklearn exactly</span></div></div>
      <div class="rm-item rm-done" data-target="lg-compare"><span class="rm-num">17</span><div class="rm-text"><span class="rm-label">Comparisons</span><span class="rm-sub">Losses and optimisers side by side</span></div></div>
      <div class="rm-item rm-done" data-target="lg-traps"><span class="rm-num">18</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Interview and code traps</span></div></div>
      <div class="rm-item rm-done" data-target="lg-qa"><span class="rm-num">19</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="lg-what"><span class="num">01</span>What a Loss Is</h2>
  <h3>The need</h3>
  <p>To learn, a model must be able to answer "how wrong am I right now?" with a single number, and that number must get smaller when the model gets better. Without it there is nothing to improve. A <strong>loss function</strong> is that number for one prediction: it takes the true answer y and the prediction ŷ and returns a non-negative penalty, 0 when the prediction is perfect.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A board exam. The <strong>loss</strong> is the marks lost on one question. The <strong>cost</strong> is the total (or average) marks lost over the whole paper; that is what you try to reduce while preparing. The <strong>metric</strong> is what the college admission office looks at, maybe just "pass or fail". Different examiners (losses) cut marks differently for the same mistake: one cuts heavily for a big blunder, another cuts the same for every wrong answer.</p>
  </div>
  <h3>Loss vs cost vs metric</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Scope</th><th>Example</th><th>Must be smooth?</th></tr>
    <tr><td><strong>Loss</strong> L(y, ŷ)</td><td>one row</td><td>(y − ŷ)²</td><td>should have a usable gradient</td></tr>
    <tr><td><strong>Cost / objective</strong> J(θ)</td><td>all training rows, as a function of the parameters θ</td><td>(1/n) Σ (yᵢ − ŷᵢ)² + λ Σ w²</td><td>yes, it is what the optimiser minimises</td></tr>
    <tr><td><strong>Metric</strong></td><td>a dataset, for reporting</td><td>accuracy, RMSE, F1, AUC</td><td>no; it only has to match the business goal</td></tr>
  </table>
  <p>People often say "loss" for all three. The distinction matters in two places: the cost can include a penalty that is not a loss on any row (<a class="xref" data-note="ml_regularization">regularization</a>), and the metric you report may be one you cannot optimise directly (accuracy, section 07). Metrics are covered in <a class="xref" data-note="ml_evaluation">Classification Metrics</a> and <a class="xref" data-note="ml_reg_metrics">Regression Metrics</a>.</p>
  <h3>Worked by hand: four predictions, three losses</h3>
  <p>A model predicts four house prices (in ₹ lakh). The <strong>residual</strong> r = y − ŷ is the miss on each row.</p>
  <table class="tbl">
    <tr><th>y</th><th>ŷ</th><th>r = y − ŷ</th><th>squared r²</th><th>absolute |r|</th><th>Huber (δ = 1)</th></tr>
    <tr><td>3</td><td>2.5</td><td>0.5</td><td>0.25</td><td>0.5</td><td>½·0.5² = 0.125</td></tr>
    <tr><td>5</td><td>5</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
    <tr><td>2</td><td>4</td><td>−2</td><td>4</td><td>2</td><td>1·(2 − 0.5) = 1.5</td></tr>
    <tr><td>10</td><td>4</td><td>6</td><td>36</td><td>6</td><td>1·(6 − 0.5) = 5.5</td></tr>
    <tr><td colspan="3"><strong>average (the cost)</strong></td><td><strong>10.06</strong></td><td><strong>2.125</strong></td><td><strong>1.781</strong></td></tr>
  </table>
  <p>Same predictions, three very different verdicts. Under squared loss, the single 6-lakh miss contributes 36 of the 40.25 total (89%). Under absolute loss it is 6 of 8.5 (71%). The choice of loss decides which mistakes the model will work hardest to avoid.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.metrics import mean_squared_error, mean_absolute_error

y     = np.array([3.0, 5.0, 2.0, 10.0])        # true values
y_hat = np.array([2.5, 5.0, 4.0, 4.0])         # model's predictions
r = y - y_hat                                  # residuals

def huber(r, delta=1.0):
    small = np.abs(r) &lt;= delta
    return np.where(small, 0.5 * r**2, delta * (np.abs(r) - 0.5 * delta))

print("residuals      :", r)
print("squared        :", r**2, " mean =", (r**2).mean())
print("absolute       :", np.abs(r), " mean =", np.abs(r).mean())
print("huber (delta=1):", huber(r), " mean =", huber(r).mean())
print("sklearn MSE / MAE:", mean_squared_error(y, y_hat), mean_absolute_error(y, y_hat))</div>
  <div class="fx" data-lang="text">residuals      : [ 0.5  0.  -2.   6. ]
squared        : [ 0.25  0.    4.   36.  ]  mean = 10.0625
absolute       : [0.5 0.  2.  6. ]  mean = 2.125
huber (delta=1): [0.125 0.    1.5   5.5  ]  mean = 1.78125
sklearn MSE / MAE: 10.0625 2.125</div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>loss function</strong> L(y, ŷ) ≥ 0 measures the cost of predicting ŷ when the truth is y. The <strong>empirical risk</strong> or <strong>cost function</strong> is J(θ) = (1/n) Σᵢ L(yᵢ, f(xᵢ; θ)), optionally plus a penalty Ω(θ). <strong>Training</strong> means finding θ that minimises J. The model's hope is that low J on training rows means low expected loss on new rows (<a class="xref" data-note="ml_core">generalization</a>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Optimising one loss and reporting another without noticing. A model trained with squared loss is built to predict the <em>mean</em>; if the business reports median-based or percentage errors, a different loss (absolute, quantile) may serve them better. Pick the loss with the metric in mind.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Why would anyone square a residual in the first place? Squared loss is the default in regression, and there are two deep reasons for it: what it makes the model predict, and what it assumes about the noise.</div>

  <h2 id="lg-sq"><span class="num">02</span>Squared Loss</h2>
  <h3>Formula and shape</h3>
  <p>L(y, ŷ) = (y − ŷ)². Averaged over rows it is the <strong>mean squared error</strong>, MSE. It is a smooth bowl: zero at r = 0, growing faster and faster. Its derivative with respect to the prediction is dL/dŷ = −2(y − ŷ) = 2(ŷ − y): the push on a prediction is proportional to how far off it is. Small misses get gentle pushes, big misses get big pushes.</p>
  <h3>What it makes the model predict: the mean</h3>
  <p>Strip a model down to a single constant c (the same prediction for every row). Which c minimises the squared loss? Take five values y = 2, 3, 4, 6, 21 (one is an outlier).</p>
  <p><strong>By calculus</strong>: SSE(c) = Σ (yᵢ − c)². Its derivative is −2 Σ (yᵢ − c). Setting it to zero: Σ yᵢ − n·c = 0, so c = Σ yᵢ / n, the <strong>mean</strong>. Here (2 + 3 + 4 + 6 + 21)/5 = 36/5 = <strong>7.2</strong>.</p>
  <p><strong>By checking</strong>: SSE(4) = 2² + 1² + 0² + 2² + 17² = 4 + 1 + 0 + 4 + 289 = 298. SSE(7.2) = 5.2² + 4.2² + 3.2² + 1.2² + 13.8² = 27.04 + 17.64 + 10.24 + 1.44 + 190.44 = 246.8. The mean wins under squared loss, even though 4 of the 5 values are at most 6.</p>
  <div class="fx" data-lang="py">import numpy as np
from scipy.optimize import minimize_scalar

y = np.array([2.0, 3.0, 4.0, 6.0, 21.0])       # four normal values and one outlier

def huber(r, delta=1.5):
    return np.where(np.abs(r) &lt;= delta, 0.5 * r**2, delta * (np.abs(r) - 0.5 * delta))

losses = {
    "squared":  lambda c: ((y - c) ** 2).sum(),
    "absolute": lambda c: np.abs(y - c).sum(),
    "huber":    lambda c: huber(y - c).sum(),
}
for c in [4, 4.25, 7.2]:
    print(f"c={c:&lt;4}: " + "  ".join(f"{k}={fn(c):6.2f}" for k, fn in losses.items()))
for k, fn in losses.items():
    best = minimize_scalar(fn, bounds=(0, 25), method="bounded").x
    print(f"best constant under {k:8s} loss: {best:.3f}")
print("mean =", y.mean(), " median =", np.median(y))</div>
  <div class="fx" data-lang="text">c=4   : squared=298.00  absolute= 22.00  huber= 28.62
c=4.25: squared=290.31  absolute= 22.25  huber= 28.56
c=7.2 : squared=246.80  absolute= 27.60  huber= 35.82
best constant under squared  loss: 7.200
best constant under absolute loss: 4.000
best constant under huber    loss: 4.250
mean = 7.2  median = 4.0</div>
  <p>The three rows of loss values are the by-hand checks (squared at c = 4 is 298, at c = 7.2 is 246.8). The last lines minimise each loss numerically: squared loss picks the mean 7.2, absolute loss the median 4, and Huber something in between (sections 03–04). This generalises: a model trained with squared loss tries to predict the <strong>conditional mean</strong> E[y | x].</p>
  <h3>Where it comes from: Gaussian noise and maximum likelihood</h3>
  <p>Assume each answer is the model's prediction plus noise from a normal (Gaussian) distribution: y = ŷ + ε, ε ~ N(0, σ²). The probability density of seeing y is</p>
  <p style="text-align:center">p(y | ŷ) = (1 / √(2πσ²)) · exp(−(y − ŷ)² / (2σ²))</p>
  <p><strong>Maximum likelihood</strong> says: choose the parameters that make the observed data most probable. For independent rows the likelihood is the product of densities. Products are awkward, so take the logarithm (it turns products into sums and does not move the maximum), and flip the sign to get something to minimise, the <strong>negative log-likelihood</strong> (NLL):</p>
  <p style="text-align:center">NLL = Σ [ ½ ln(2πσ²) + (yᵢ − ŷᵢ)² / (2σ²) ] = (n/2) ln(2πσ²) + SSE / (2σ²)</p>
  <p>The first term does not depend on the predictions, and 1/(2σ²) is a positive constant. So <strong>minimising NLL is exactly minimising SSE</strong>. Squared loss is the right loss when the noise is Gaussian. By hand with y = 2, 3, 7, σ = 1 and a constant prediction c: c = 4 gives SSE = 4 + 1 + 9 = 14; c = 3 or 5 gives 17. So c = 4 (the mean) also has the highest likelihood:</p>
  <div class="fx" data-lang="py">import numpy as np
y = np.array([2.0, 3.0, 7.0])                  # three observations
sigma = 1.0
for c in [3.0, 4.0, 5.0]:                      # candidate predictions (a constant model)
    lik = np.prod(np.exp(-(y - c) ** 2 / (2 * sigma**2)) / np.sqrt(2 * np.pi * sigma**2))
    nll = -np.log(lik)
    sse = ((y - c) ** 2).sum()
    print(f"c={c}: likelihood={lik:.2e}  NLL={nll:.3f}  SSE={sse:4.1f}  "
          f"NLL check = 1.5*log(2*pi) + SSE/2 = {1.5 * np.log(2 * np.pi) + sse / 2:.3f}")</div>
  <div class="fx" data-lang="text">c=3.0: likelihood=1.29e-05  NLL=11.257  SSE=17.0  NLL check = 1.5*log(2*pi) + SSE/2 = 11.257
c=4.0: likelihood=5.79e-05  NLL=9.757  SSE=14.0  NLL check = 1.5*log(2*pi) + SSE/2 = 9.757
c=5.0: likelihood=1.29e-05  NLL=11.257  SSE=17.0  NLL check = 1.5*log(2*pi) + SSE/2 = 11.257</div>
  <p>The likelihood column is tiny (products of densities always are, which is another reason to work with logs), but its ranking matches SSE exactly, and the NLL equals 1.5·ln(2π) + SSE/2 as the formula says.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Squared loss</strong>: L(y, ŷ) = (y − ŷ)²; cost MSE = (1/n) Σ (yᵢ − ŷᵢ)². Gradient with respect to ŷ: 2(ŷ − y). Its minimiser over constants is the mean; over functions, the conditional mean E[y | x]. It is the negative log-likelihood (up to constants) under Gaussian noise with constant variance.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Squared loss lets a single outlier dominate: the 21 in our data pulled the best constant from 4 to 7.2, a value that is wrong for every one of the five rows. Typos, sensor glitches and rare extreme customers can bend a whole regression line (section 04 shows this on 50 rows).</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> If big misses should not be punished so much harder than small ones, the obvious fix is to drop the square. What does that change?</div>

  <h2 id="lg-abs"><span class="num">03</span>Absolute Loss</h2>
  <h3>Formula and shape</h3>
  <p>L(y, ŷ) = |y − ŷ|. Averaged: the <strong>mean absolute error</strong>, MAE. It is a V shape: every unit of miss costs the same, whether it is the first unit or the twentieth. A residual of 17 costs 17, not 289.</p>
  <h3>What it makes the model predict: the median</h3>
  <p>For the constant c, the derivative of Σ |yᵢ − c| is (number of yᵢ below c) − (number of yᵢ above c), because each point below pulls the slope up by 1 and each point above pulls it down by 1. Walk c along y = 2, 3, 4, 6, 21:</p>
  <table class="tbl">
    <tr><th>c between</th><th>points below</th><th>points above</th><th>slope</th><th>so…</th></tr>
    <tr><td>3 and 4</td><td>2</td><td>3</td><td>−1</td><td>loss still falling, move right</td></tr>
    <tr><td>4 and 6</td><td>3</td><td>2</td><td>+1</td><td>loss rising, went too far</td></tr>
  </table>
  <p>The slope changes sign at c = 4, the <strong>median</strong> (the middle value). The outlier 21 counts as just "one point above", however far away it is, so it cannot drag the answer. The code above confirmed it: total absolute loss is 22 at c = 4 and 27.6 at c = 7.2.</p>
  <h3>The catch: a kink at zero</h3>
  <p>The derivative is −sign(y − ŷ): always −1 or +1, undefined exactly at 0. Two consequences. Gradient descent gets the same size push whether the miss is 0.01 or 100, so near the answer it keeps overshooting unless the step size shrinks. And at r = 0 we must use a <strong>subgradient</strong> (any value between −1 and +1; libraries use 0). Solvers for absolute loss therefore often use linear programming instead of plain gradient descent.</p>
  <p>Probability view: absolute loss is the negative log-likelihood when the noise follows a <strong>Laplace</strong> distribution, p(ε) ∝ exp(−|ε|/b), which has heavier tails than a Gaussian. Heavy tails mean big errors are expected now and then, so they are not treated as disasters.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Absolute loss</strong>: L(y, ŷ) = |y − ŷ|; cost MAE. (Sub)gradient with respect to ŷ: −sign(y − ŷ). Minimiser over constants: the median; over functions: the conditional median. Generalisation: the <strong>quantile (pinball) loss</strong> with τ ∈ (0, 1) penalises under-prediction by τ·r and over-prediction by (1 − τ)·|r|, and its minimiser is the τ-quantile (used for prediction intervals, see <a class="xref" data-note="ml_ts_ml">ML Forecasting</a>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"MAE is robust, so always use it." It ignores the size of large errors, which is wrong when large errors are genuinely costly (under-stocking a hospital's oxygen supply). It also converges slowly with gradient methods. Choose by what a mistake really costs.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Squared loss is smooth but fragile; absolute loss is robust but kinked. Can one loss be quadratic for small misses and linear for big ones?</div>

  <h2 id="lg-huber"><span class="num">04</span>Huber Loss</h2>
  <h3>The formula, in plain words</h3>
  <p>Pick a threshold δ. For a small residual (|r| ≤ δ) use half the square, ½r². For a big residual use a straight line, δ(|r| − ½δ). The ½δ is there so the two pieces meet smoothly at |r| = δ: both give ½δ² and both have slope δ.</p>
  <p>Its derivative is the <strong>clipped residual</strong>: ψ(r) = r when |r| ≤ δ, and ±δ beyond. So an outlier can push on the model, but never harder than δ.</p>
  <h3>Worked by hand: the best constant with δ = 1.5</h3>
  <p>The best c makes the clipped residuals sum to zero: Σ ψ(yᵢ − c) = 0. Try c = 4.25 on y = 2, 3, 4, 6, 21:</p>
  <table class="tbl">
    <tr><th>y</th><th>r = y − 4.25</th><th>ψ(r), clipped to ±1.5</th><th>Huber loss</th></tr>
    <tr><td>2</td><td>−2.25</td><td>−1.5</td><td>1.5·(2.25 − 0.75) = 2.25</td></tr>
    <tr><td>3</td><td>−1.25</td><td>−1.25</td><td>½·1.25² = 0.781</td></tr>
    <tr><td>4</td><td>−0.25</td><td>−0.25</td><td>½·0.25² = 0.031</td></tr>
    <tr><td>6</td><td>1.75</td><td>1.5</td><td>1.5·(1.75 − 0.75) = 1.5</td></tr>
    <tr><td>21</td><td>16.75</td><td>1.5</td><td>1.5·(16.75 − 0.75) = 24</td></tr>
    <tr><td colspan="2"><strong>sum</strong></td><td><strong>0</strong> ✓</td><td><strong>28.56</strong></td></tr>
  </table>
  <p>The clipped pushes balance at c = 4.25, matching the numerical answer from section 02. The outlier 21 pushes with force 1.5, exactly as hard as the ordinary point 6. Huber lands between the median (4) and the mean (7.2), close to the median because there is a heavy outlier.</p>
  <figure class="viz"><svg viewBox="0 0 620 255" width="620">
<line x1="60" y1="215" x2="580" y2="215" stroke="currentColor" opacity="0.5"/>
<line x1="60" y1="25" x2="60" y2="215" stroke="currentColor" opacity="0.5"/>
<text x="60" y="229" text-anchor="middle" class="tm" font-size="10.5">-3</text>
<line x1="60" y1="215" x2="60" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="146.7" y="229" text-anchor="middle" class="tm" font-size="10.5">-2</text>
<line x1="146.7" y1="215" x2="146.7" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="233.3" y="229" text-anchor="middle" class="tm" font-size="10.5">-1</text>
<line x1="233.3" y1="215" x2="233.3" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="320" y="229" text-anchor="middle" class="tm" font-size="10.5">0</text>
<line x1="320" y1="215" x2="320" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="406.7" y="229" text-anchor="middle" class="tm" font-size="10.5">1</text>
<line x1="406.7" y1="215" x2="406.7" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="493.3" y="229" text-anchor="middle" class="tm" font-size="10.5">2</text>
<line x1="493.3" y1="215" x2="493.3" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="580" y="229" text-anchor="middle" class="tm" font-size="10.5">3</text>
<line x1="580" y1="215" x2="580" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="55" y="218.5" text-anchor="end" class="tm" font-size="10.5">0</text>
<line x1="57" y1="215" x2="60" y2="215" stroke="currentColor" opacity="0.5"/>
<text x="55" y="176.3" text-anchor="end" class="tm" font-size="10.5">2</text>
<line x1="57" y1="172.8" x2="60" y2="172.8" stroke="currentColor" opacity="0.5"/>
<text x="55" y="134.1" text-anchor="end" class="tm" font-size="10.5">4</text>
<line x1="57" y1="130.6" x2="60" y2="130.6" stroke="currentColor" opacity="0.5"/>
<text x="55" y="91.8" text-anchor="end" class="tm" font-size="10.5">6</text>
<line x1="57" y1="88.3" x2="60" y2="88.3" stroke="currentColor" opacity="0.5"/>
<text x="55" y="49.6" text-anchor="end" class="tm" font-size="10.5">8</text>
<line x1="57" y1="46.1" x2="60" y2="46.1" stroke="currentColor" opacity="0.5"/>
<polyline points="60,25 68.7,37.5 77.3,49.5 86,61.1 94.7,72.3 103.3,83.1 112,93.4 120.7,103.3 129.3,112.8 138,121.9 146.7,130.6 155.3,138.8 164,146.6 172.7,154 181.3,161 190,167.5 198.7,173.6 207.3,179.3 216,184.6 224.7,189.5 233.3,193.9 242,197.9 250.7,201.5 259.3,204.7 268,207.4 276.7,209.7 285.3,211.6 294,213.1 302.7,214.2 311.3,214.8 320,215 328.7,214.8 337.3,214.2 346,213.1 354.7,211.6 363.3,209.7 372,207.4 380.7,204.7 389.3,201.5 398,197.9 406.7,193.9 415.3,189.5 424,184.6 432.7,179.3 441.3,173.6 450,167.5 458.7,161 467.3,154 476,146.6 484.7,138.8 493.3,130.6 502,121.9 510.7,112.8 519.3,103.3 528,93.4 536.7,83.1 545.3,72.3 554,61.1 562.7,49.5 571.3,37.5 580,25" fill="none" class="sr" stroke-width="2"/>
<text x="300" y="95" class="tr" font-size="11.5">red: squared r²</text>
<polyline points="60,151.7 68.7,153.8 77.3,155.9 86,158 94.7,160.1 103.3,162.2 112,164.3 120.7,166.4 129.3,168.6 138,170.7 146.7,172.8 155.3,174.9 164,177 172.7,179.1 181.3,181.2 190,183.3 198.7,185.4 207.3,187.6 216,189.7 224.7,191.8 233.3,193.9 242,196 250.7,198.1 259.3,200.2 268,202.3 276.7,204.4 285.3,206.6 294,208.7 302.7,210.8 311.3,212.9 320,215 328.7,212.9 337.3,210.8 346,208.7 354.7,206.6 363.3,204.4 372,202.3 380.7,200.2 389.3,198.1 398,196 406.7,193.9 415.3,191.8 424,189.7 432.7,187.6 441.3,185.4 450,183.3 458.7,181.2 467.3,179.1 476,177 484.7,174.9 493.3,172.8 502,170.7 510.7,168.6 519.3,166.4 528,164.3 536.7,162.2 545.3,160.1 554,158 562.7,155.9 571.3,153.8 580,151.7" fill="none" class="sb" stroke-width="2"/>
<text x="300" y="112" class="tb" font-size="11.5">blue: absolute |r|</text>
<polyline points="60,162.2 68.7,164.3 77.3,166.4 86,168.6 94.7,170.7 103.3,172.8 112,174.9 120.7,177 129.3,179.1 138,181.2 146.7,183.3 155.3,185.4 164,187.6 172.7,189.7 181.3,191.8 190,193.9 198.7,196 207.3,198.1 216,200.2 224.7,202.3 233.3,204.4 242,206.4 250.7,208.2 259.3,209.8 268,211.2 276.7,212.4 285.3,213.3 294,214.1 302.7,214.6 311.3,214.9 320,215 328.7,214.9 337.3,214.6 346,214.1 354.7,213.3 363.3,212.4 372,211.2 380.7,209.8 389.3,208.2 398,206.4 406.7,204.4 415.3,202.3 424,200.2 432.7,198.1 441.3,196 450,193.9 458.7,191.8 467.3,189.7 476,187.6 484.7,185.4 493.3,183.3 502,181.2 510.7,179.1 519.3,177 528,174.9 536.7,172.8 545.3,170.7 554,168.6 562.7,166.4 571.3,164.3 580,162.2" fill="none" class="sg" stroke-width="2" stroke-dasharray="6 3"/>
<text x="300" y="129" class="tg" font-size="11.5">green: Huber, δ = 1</text>
<text x="320" y="245" text-anchor="middle" class="tm" font-size="11">residual r = y − ŷ</text>
<text x="26" y="120" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 26 120)">loss</text>
<text x="130" y="45" class="tm" font-size="11">squared grows fast:</text>
<text x="130" y="60" class="tm" font-size="11">one outlier dominates</text>
</svg><figcaption>The three regression losses against the residual. Squared (red) is gentle near 0 and explodes for big misses. Absolute (blue) is a V with a sharp corner at 0. Huber (green, δ = 1) copies the square near 0 and the straight line far away.</figcaption></figure>
  <h3>On a real fit: a line with three typos</h3>
  <p>50 rows from y = 2x + 1 + noise, then three rows get +35 to +45 added (data-entry errors). Squared loss (ordinary least squares) vs Huber:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression, HuberRegressor

rng = np.random.default_rng(0)
x = rng.uniform(0, 10, 50)
y = 2 * x + 1 + rng.normal(0, 1, 50)           # true line: slope 2, intercept 1
y[[3, 17, 29]] += [40, 35, 45]                 # three corrupted rows (typos)
X = x[:, None]

ols = LinearRegression().fit(X, y)
hub = HuberRegressor(epsilon=1.35).fit(X, y)   # epsilon = delta, in units of the noise scale
print(f"squared loss (OLS): slope={ols.coef_[0]:.3f}  intercept={ols.intercept_:.3f}")
print(f"Huber loss        : slope={hub.coef_[0]:.3f}  intercept={hub.intercept_:.3f}")
clean = np.setdiff1d(np.arange(50), [3, 17, 29])
ref = LinearRegression().fit(X[clean], y[clean])   # what we would get without the typos
print(f"OLS on clean rows : slope={ref.coef_[0]:.3f}  intercept={ref.intercept_:.3f}")</div>
  <div class="fx" data-lang="text">squared loss (OLS): slope=1.715  intercept=4.936
Huber loss        : slope=2.047  intercept=0.765
OLS on clean rows : slope=2.058  intercept=0.639</div>
  <p>Three bad rows out of 50 dragged the OLS slope from 2.06 (the fit without the typos) to 1.72 and the intercept from 0.64 to 4.94. Huber's slope is within 0.011 of the clean fit and its intercept within 0.13, because each typo can push only with force δ. In <code>HuberRegressor</code>, <code>epsilon</code> plays the role of δ but in units of an estimated noise scale; 1.35 is the classic choice that keeps 95% of the efficiency of least squares when the noise really is Gaussian.</p>
  <table class="tbl">
    <tr><th></th><th>Squared</th><th>Absolute</th><th>Huber</th></tr>
    <tr><td>Best constant</td><td>mean (7.2)</td><td>median (4)</td><td>between (4.25 at δ = 1.5)</td></tr>
    <tr><td>Gradient</td><td>2(ŷ − y): grows with the miss</td><td>±1: same for all misses</td><td>clipped: grows, then capped at δ</td></tr>
    <tr><td>Smooth at 0?</td><td>yes</td><td>no (kink)</td><td>yes</td></tr>
    <tr><td>Outliers</td><td>dominate</td><td>ignored in size</td><td>limited influence</td></tr>
    <tr><td>Noise model</td><td>Gaussian</td><td>Laplace</td><td>Gaussian centre, heavy tails</td></tr>
    <tr><td>sklearn</td><td><code>LinearRegression</code>, <code>loss="squared_error"</code></td><td><code>QuantileRegressor(quantile=0.5)</code>, <code>"absolute_error"</code></td><td><code>HuberRegressor</code>, <code>loss="huber"</code></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Huber loss</strong> with threshold δ &gt; 0: L<sub>δ</sub>(r) = ½r² if |r| ≤ δ, else δ(|r| − ½δ). Its derivative ψ(r) = clip(r, −δ, δ) is continuous. As δ → ∞ it becomes (half) squared loss; as δ → 0 it behaves like δ·|r|, i.e. absolute loss.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Choosing δ in raw units without looking at the data's scale. δ = 1 means "a miss of ₹1" for prices in rupees (everything is an outlier) and "a miss of ₹1 crore" for prices in crores (nothing is). Set δ relative to the noise level, as <code>HuberRegressor</code> does, or tune it.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> All three losses compare two numbers. Classification predicts a class, or better, a probability. What is the loss for "I said 90% chance of rain, and it did not rain"?</div>

  <h2 id="lg-log"><span class="num">05</span>Log-Loss / Cross-Entropy</h2>
  <h3>Derived from the likelihood</h3>
  <p>A binary classifier outputs p = P(y = 1 | x). If the truth is y ∈ {0, 1}, the probability the model gave to what actually happened is p when y = 1 and 1 − p when y = 0. One formula covers both cases (the Bernoulli distribution):</p>
  <p style="text-align:center">P(y | p) = p<sup>y</sup> · (1 − p)<sup>1 − y</sup></p>
  <p>(Check: y = 1 gives p¹·(1−p)⁰ = p; y = 0 gives p⁰·(1−p)¹ = 1 − p.) Exactly as for squared loss, maximum likelihood over independent rows means maximising the product, i.e. minimising the negative log of it:</p>
  <p style="text-align:center">NLL = −Σᵢ [ yᵢ ln pᵢ + (1 − yᵢ) ln(1 − pᵢ) ]</p>
  <p>Divide by n and you have <strong>log-loss</strong>, also called <strong>binary cross-entropy</strong>. In words: <em>minus the log of the probability you gave to the right answer</em>.</p>
  <h3>Worked by hand</h3>
  <table class="tbl">
    <tr><th>y</th><th>p = P(1)</th><th>probability given to the truth</th><th>log-loss = −ln(that)</th><th>squared (p − y)²</th></tr>
    <tr><td>1</td><td>0.9</td><td>0.9</td><td>0.105</td><td>0.01</td></tr>
    <tr><td>1</td><td>0.6</td><td>0.6</td><td>0.511</td><td>0.16</td></tr>
    <tr><td>0</td><td>0.2</td><td>0.8</td><td>0.223</td><td>0.04</td></tr>
    <tr><td>0</td><td>0.99</td><td>0.01</td><td>4.605</td><td>0.98</td></tr>
    <tr><td colspan="3"><strong>mean</strong></td><td><strong>1.361</strong></td><td><strong>0.298</strong> (Brier score)</td></tr>
  </table>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.metrics import log_loss

y = np.array([1, 1, 0, 0])                     # true classes
p = np.array([0.9, 0.6, 0.2, 0.99])            # predicted P(class 1)

per_row = -(y * np.log(p) + (1 - y) * np.log(1 - p))
print("per-row log loss:", per_row.round(3))
print("mean log loss   :", per_row.mean().round(4), " sklearn:", round(log_loss(y, p), 4))
print("per-row squared :", ((p - y) ** 2).round(4), " Brier =", ((p - y) ** 2).mean().round(4))</div>
  <div class="fx" data-lang="text">per-row log loss: [0.105 0.511 0.223 4.605]
mean log loss   : 1.3611  sklearn: 1.3611
per-row squared : [0.01   0.16   0.04   0.9801]  Brier = 0.2975</div>
  <p>Look at the last row. Being 99% sure of the wrong class costs 4.6, more than the other three rows together (0.84). As p for the true class goes to 0, −ln p goes to infinity. Log-loss punishes <em>confident</em> mistakes brutally, which forces the model to produce honest probabilities. The squared version (the Brier score) caps that row at 0.98. A useful reference: always predicting 0.5 gives log-loss ln 2 = 0.693; anything above that on balanced data is worse than a coin.</p>
  <h3>The gradient: p − y</h3>
  <p>In logistic regression (<a class="xref" data-note="ml_classification">Logistic Regression</a>) the model computes a score z = w·x + b and turns it into a probability with the sigmoid p = σ(z) = 1/(1 + e<sup>−z</sup>). Differentiate the loss with respect to z, step by step:</p>
  <ol>
    <li>The sigmoid has the neat derivative dσ/dz = σ(z)(1 − σ(z)) = p(1 − p).</li>
    <li>dL/dz = −[ y·(1/p)·p(1 − p) + (1 − y)·(−1/(1 − p))·p(1 − p) ] = −[ y(1 − p) − (1 − y)p ].</li>
    <li>Expand: −[ y − yp − p + yp ] = −[y − p] = <strong>p − y</strong>.</li>
  </ol>
  <p>So ∂L/∂w = (p − y)·x and ∂L/∂b = p − y: "prediction minus truth, times the input", the same shape as the squared-loss gradient for linear regression. That is why the from-scratch code in section 16 looks almost identical for both models.</p>
  <h3>Multiclass: softmax and cross-entropy</h3>
  <p>With K classes the model outputs K scores z₁…z<sub>K</sub>, and <strong>softmax</strong> turns them into probabilities: pₖ = e<sup>zₖ</sup> / Σⱼ e<sup>zⱼ</sup>. The loss is still −ln(probability of the true class). By hand for scores (cat 2, dog 1, bird 0): e² = 7.389, e¹ = 2.718, e⁰ = 1, sum 11.107, so p = (0.665, 0.245, 0.090). If the picture is a cat, the loss is −ln 0.665 = 0.408. The gradient with respect to the scores is again p − (one-hot truth) = (0.665 − 1, 0.245, 0.090).</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.metrics import log_loss

z = np.array([2.0, 1.0, 0.0])                  # raw scores for classes cat, dog, bird
p = np.exp(z) / np.exp(z).sum()                # softmax
print("softmax probs:", p.round(3), " sum =", p.sum())
true = 0                                       # the picture is a cat
print("cross-entropy = -ln p[true] =", round(-np.log(p[true]), 3))
onehot = np.eye(3)[true]
print("gradient w.r.t. scores = p - onehot =", (p - onehot).round(3))
print("sklearn log_loss:", round(log_loss([0], [p], labels=[0, 1, 2]), 3))</div>
  <div class="fx" data-lang="text">softmax probs: [0.665 0.245 0.09 ]  sum = 1.0
cross-entropy = -ln p[true] = 0.408
gradient w.r.t. scores = p - onehot = [-0.335  0.245  0.09 ]
sklearn log_loss: 0.408</div>
  <h3>Why not just use squared loss for classification?</h3>
  <p>Put squared loss on top of the sigmoid: L = (σ(z) − y)². By the chain rule its gradient is 2(p − y)·p(1 − p). The extra factor p(1 − p) is tiny when p is near 0 or 1, including when the model is <em>confidently wrong</em>. Compare the two for a true class 1:</p>
  <div class="fx" data-lang="py">import numpy as np
sigmoid = lambda z: 1 / (1 + np.exp(-z))

y = 1                                          # the true class
print("    z      p    logloss  dLog/dz   sq.loss  dSq/dz")
for z in [-6, -4, -2, 0, 2, 4]:                # z = the model's raw score (logit)
    p = sigmoid(z)
    log_l, log_g = -np.log(p), p - y                    # derivative of log loss w.r.t. z
    sq_l, sq_g = (p - y) ** 2, 2 * (p - y) * p * (1 - p)  # chain rule through the sigmoid
    print(f"{z:5d} {p:6.3f} {log_l:8.3f} {log_g:8.3f} {sq_l:8.3f} {sq_g:8.4f}")

# convexity check: second derivative in z, by finite differences
zs = np.linspace(-6, 4, 11); h = 1e-4
second = lambda L, z: (L(z + h) - 2 * L(z) + L(z - h)) / h**2
log_L = lambda z: -np.log(sigmoid(z)); sq_L = lambda z: (sigmoid(z) - 1) ** 2
print("min 2nd derivative, log loss :", round(min(second(log_L, z) for z in zs), 4))
print("min 2nd derivative, sq. loss :", round(min(second(sq_L, z) for z in zs), 4))</div>
  <div class="fx" data-lang="text">    z      p    logloss  dLog/dz   sq.loss  dSq/dz
   -6  0.002    6.002   -0.998    0.995  -0.0049
   -4  0.018    4.018   -0.982    0.964  -0.0347
   -2  0.119    2.127   -0.881    0.776  -0.1850
    0  0.500    0.693   -0.500    0.250  -0.2500
    2  0.881    0.127   -0.119    0.014  -0.0250
    4  0.982    0.018   -0.018    0.000  -0.0006
min 2nd derivative, log loss : 0.0025
min 2nd derivative, sq. loss : -0.1188</div>
  <p>At z = −6 the model says p = 0.002 for a row that is truly class 1, the worst possible situation. Log-loss pushes with gradient −0.998, nearly the maximum. Squared loss pushes with −0.0049, two hundred times weaker: the model barely learns from its worst mistakes. The last two lines check curvature: log-loss has a positive second derivative everywhere (convex, section 11), while squared loss through a sigmoid has negative curvature in places (not convex), so gradient descent can stall on its flat plateau.</p>
  <figure class="viz"><svg viewBox="0 0 660 235" width="660">
<line x1="55" y1="190" x2="305" y2="190" stroke="currentColor" opacity="0.5"/>
<line x1="55" y1="30" x2="55" y2="190" stroke="currentColor" opacity="0.5"/>
<text x="55" y="204" text-anchor="middle" class="tm" font-size="10.5">-6</text>
<line x1="55" y1="190" x2="55" y2="193" stroke="currentColor" opacity="0.5"/>
<text x="105" y="204" text-anchor="middle" class="tm" font-size="10.5">-4</text>
<line x1="105" y1="190" x2="105" y2="193" stroke="currentColor" opacity="0.5"/>
<text x="155" y="204" text-anchor="middle" class="tm" font-size="10.5">-2</text>
<line x1="155" y1="190" x2="155" y2="193" stroke="currentColor" opacity="0.5"/>
<text x="205" y="204" text-anchor="middle" class="tm" font-size="10.5">0</text>
<line x1="205" y1="190" x2="205" y2="193" stroke="currentColor" opacity="0.5"/>
<text x="255" y="204" text-anchor="middle" class="tm" font-size="10.5">2</text>
<line x1="255" y1="190" x2="255" y2="193" stroke="currentColor" opacity="0.5"/>
<text x="305" y="204" text-anchor="middle" class="tm" font-size="10.5">4</text>
<line x1="305" y1="190" x2="305" y2="193" stroke="currentColor" opacity="0.5"/>
<text x="50" y="193.5" text-anchor="end" class="tm" font-size="10.5">0</text>
<line x1="52" y1="190" x2="55" y2="190" stroke="currentColor" opacity="0.5"/>
<text x="50" y="144.3" text-anchor="end" class="tm" font-size="10.5">2</text>
<line x1="52" y1="140.8" x2="55" y2="140.8" stroke="currentColor" opacity="0.5"/>
<text x="50" y="95" text-anchor="end" class="tm" font-size="10.5">4</text>
<line x1="52" y1="91.5" x2="55" y2="91.5" stroke="currentColor" opacity="0.5"/>
<text x="50" y="45.8" text-anchor="end" class="tm" font-size="10.5">6</text>
<line x1="52" y1="42.3" x2="55" y2="42.3" stroke="currentColor" opacity="0.5"/>
<polyline points="55,42.2 57.5,44.7 60,47.2 62.5,49.6 65,52.1 67.5,54.5 70,57 72.5,59.4 75,61.9 77.5,64.3 80,66.8 82.5,69.2 85,71.6 87.5,74.1 90,76.5 92.5,79 95,81.4 97.5,83.8 100,86.2 102.5,88.7 105,91.1 107.5,93.5 110,95.9 112.5,98.3 115,100.7 117.5,103.1 120,105.5 122.5,107.9 125,110.2 127.5,112.6 130,115 132.5,117.3 135,119.6 137.5,121.9 140,124.2 142.5,126.5 145,128.8 147.5,131 150,133.3 152.5,135.5 155,137.6 157.5,139.8 160,141.9 162.5,144 165,146.1 167.5,148.1 170,150.1 172.5,152.1 175,154 177.5,155.9 180,157.7 182.5,159.4 185,161.2 187.5,162.8 190,164.5 192.5,166 195,167.5 197.5,169 200,170.4 202.5,171.7 205,172.9 207.5,174.1 210,175.3 212.5,176.4 215,177.4 217.5,178.3 220,179.2 222.5,180.1 225,180.9 227.5,181.6 230,182.3 232.5,182.9 235,183.5 237.5,184.1 240,184.6 242.5,185 245,185.5 247.5,185.9 250,186.2 252.5,186.6 255,186.9 257.5,187.2 260,187.4 262.5,187.6 265,187.9 267.5,188.1 270,188.2 272.5,188.4 275,188.5 277.5,188.7 280,188.8 282.5,188.9 285,189 287.5,189.1 290,189.2 292.5,189.3 295,189.3 297.5,189.4 300,189.5 302.5,189.5 305,189.6" fill="none" class="sb" stroke-width="2"/>
<text x="180" y="220" text-anchor="middle" class="tm" font-size="11">score z (true class 1)</text>
<text x="27" y="110" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 27 110)">loss</text>
<text x="180" y="22" text-anchor="middle" font-size="12.5" font-weight="700">log loss −ln σ(z): convex</text>
<line x1="385" y1="190" x2="635" y2="190" stroke="currentColor" opacity="0.5"/>
<line x1="385" y1="30" x2="385" y2="190" stroke="currentColor" opacity="0.5"/>
<text x="385" y="204" text-anchor="middle" class="tm" font-size="10.5">-6</text>
<line x1="385" y1="190" x2="385" y2="193" stroke="currentColor" opacity="0.5"/>
<text x="435" y="204" text-anchor="middle" class="tm" font-size="10.5">-4</text>
<line x1="435" y1="190" x2="435" y2="193" stroke="currentColor" opacity="0.5"/>
<text x="485" y="204" text-anchor="middle" class="tm" font-size="10.5">-2</text>
<line x1="485" y1="190" x2="485" y2="193" stroke="currentColor" opacity="0.5"/>
<text x="535" y="204" text-anchor="middle" class="tm" font-size="10.5">0</text>
<line x1="535" y1="190" x2="535" y2="193" stroke="currentColor" opacity="0.5"/>
<text x="585" y="204" text-anchor="middle" class="tm" font-size="10.5">2</text>
<line x1="585" y1="190" x2="585" y2="193" stroke="currentColor" opacity="0.5"/>
<text x="635" y="204" text-anchor="middle" class="tm" font-size="10.5">4</text>
<line x1="635" y1="190" x2="635" y2="193" stroke="currentColor" opacity="0.5"/>
<text x="380" y="193.5" text-anchor="end" class="tm" font-size="10.5">0</text>
<line x1="382" y1="190" x2="385" y2="190" stroke="currentColor" opacity="0.5"/>
<text x="380" y="120.8" text-anchor="end" class="tm" font-size="10.5">0.5</text>
<line x1="382" y1="117.3" x2="385" y2="117.3" stroke="currentColor" opacity="0.5"/>
<text x="380" y="48" text-anchor="end" class="tm" font-size="10.5">1</text>
<line x1="382" y1="44.5" x2="385" y2="44.5" stroke="currentColor" opacity="0.5"/>
<polyline points="385,45.3 387.5,45.3 390,45.4 392.5,45.5 395,45.6 397.5,45.7 400,45.9 402.5,46 405,46.1 407.5,46.3 410,46.5 412.5,46.7 415,46.9 417.5,47.2 420,47.4 422.5,47.7 425,48.1 427.5,48.4 430,48.8 432.5,49.2 435,49.7 437.5,50.3 440,50.8 442.5,51.5 445,52.2 447.5,52.9 450,53.8 452.5,54.7 455,55.7 457.5,56.8 460,58 462.5,59.3 465,60.7 467.5,62.3 470,64 472.5,65.8 475,67.7 477.5,69.8 480,72.1 482.5,74.6 485,77.2 487.5,79.9 490,82.9 492.5,86 495,89.3 497.5,92.8 500,96.4 502.5,100.2 505,104.1 507.5,108.1 510,112.3 512.5,116.5 515,120.8 517.5,125.1 520,129.4 522.5,133.6 525,137.9 527.5,142 530,146 532.5,149.9 535,153.6 537.5,157.2 540,160.5 542.5,163.7 545,166.6 547.5,169.3 550,171.7 552.5,174 555,176 557.5,177.8 560,179.5 562.5,180.9 565,182.2 567.5,183.3 570,184.3 572.5,185.2 575,185.9 577.5,186.5 580,187.1 582.5,187.5 585,187.9 587.5,188.3 590,188.6 592.5,188.8 595,189 597.5,189.2 600,189.3 602.5,189.4 605,189.5 607.5,189.6 610,189.7 612.5,189.7 615,189.8 617.5,189.8 620,189.8 622.5,189.9 625,189.9 627.5,189.9 630,189.9 632.5,189.9 635,190" fill="none" class="sr" stroke-width="2"/>
<text x="510" y="220" text-anchor="middle" class="tm" font-size="11">score z (true class 1)</text>
<text x="345" y="110" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 345 110)">loss</text>
<text x="510" y="22" text-anchor="middle" font-size="12.5" font-weight="700">squared (1 − σ(z))²: not convex</text>
<text x="392" y="150" class="tr" font-size="11">flat plateau on the left:</text>
<text x="392" y="164" class="tr" font-size="11">tiny gradient when</text>
<text x="392" y="178" class="tr" font-size="11">confidently wrong</text>
</svg><figcaption>For a row whose true class is 1. Left: log-loss keeps a steady slope when the score is badly wrong and is bowl-shaped (convex). Right: squared loss on the sigmoid output flattens out when badly wrong, giving almost no gradient, and is not convex.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Binary log-loss / cross-entropy</strong>: L(y, p) = −[y ln p + (1 − y) ln(1 − p)], y ∈ {0, 1}. <strong>Categorical cross-entropy</strong>: L = −Σₖ yₖ ln pₖ = −ln p<sub>true</sub> with one-hot y and softmax p. Both are negative log-likelihoods; with a sigmoid/softmax output the gradient with respect to the scores is p − y. Log-loss is a <strong>proper scoring rule</strong>: its expected value is minimised by predicting the true probability, so it rewards calibrated outputs.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Computing log(0). A model that outputs exactly 0 or 1 gives infinite loss on a single mistake. Libraries clip p to [ε, 1 − ε], and deep-learning frameworks offer "with logits" versions (<code>BCEWithLogitsLoss</code>) that combine sigmoid and log in one numerically stable formula. Never feed already-sigmoided outputs into a loss that expects logits, or vice versa.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Log-loss keeps pushing even on rows that are already classified correctly with a good margin (its curve never reaches 0). A different idea: stop caring about a row once it is "safely" on the right side. That is the hinge.</div>

  <h2 id="lg-hinge"><span class="num">06</span>Hinge Loss</h2>
  <h3>Margins</h3>
  <p>For hinge loss the classes are coded y ∈ {−1, +1}, and the model outputs a raw score f(x) (not a probability). The <strong>margin</strong> m = y·f(x) combines both: positive when the score has the right sign, negative when wrong, and its size says how confidently.</p>
  <p style="text-align:center"><strong>hinge(m) = max(0, 1 − m)</strong></p>
  <p>Zero loss once a row is correct with margin at least 1. A linear penalty for anything less, including rows that are correct but too close to the boundary (0 &lt; m &lt; 1).</p>
  <h3>Worked by hand</h3>
  <table class="tbl">
    <tr><th>y</th><th>score f</th><th>margin m = y·f</th><th>0-1 loss</th><th>hinge max(0, 1 − m)</th></tr>
    <tr><td>+1</td><td>2.0</td><td>2.0</td><td>0</td><td>0</td></tr>
    <tr><td>+1</td><td>0.5</td><td>0.5</td><td>0 (right, but close)</td><td>0.5</td></tr>
    <tr><td>+1</td><td>−0.3</td><td>−0.3</td><td>1 (wrong)</td><td>1.3</td></tr>
    <tr><td>−1</td><td>−1.5</td><td>1.5</td><td>0</td><td>0</td></tr>
    <tr><td colspan="3"><strong>mean</strong></td><td><strong>0.25</strong></td><td><strong>0.45</strong></td></tr>
  </table>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.metrics import hinge_loss, zero_one_loss

y = np.array([+1, +1, +1, -1])                 # classes coded as +1 / -1
f = np.array([2.0, 0.5, -0.3, -1.5])           # raw scores from a linear model
m = y * f                                      # margin: positive = correct side
print("margins      :", m)
print("0-1 loss     :", (m &lt;= 0).astype(int), " mean =", (m &lt;= 0).mean())
print("hinge loss   :", np.maximum(0, 1 - m), " mean =", np.maximum(0, 1 - m).mean())
print("log loss (ln):", np.log1p(np.exp(-m)).round(3), " mean =", np.log1p(np.exp(-m)).mean().round(3))
print("sklearn hinge:", hinge_loss(y, f), " sklearn 0-1:", zero_one_loss(y, np.sign(f)))

print("\\n margin   0-1   hinge  log2-loss  squared")
for mm in [-2, -1, 0, 0.5, 1, 2]:
    print(f"{mm:7} {int(mm &lt;= 0):5d} {max(0, 1 - mm):7.2f} {np.log2(1 + np.exp(-mm)):9.3f} {(1 - mm) ** 2:8.2f}")</div>
  <div class="fx" data-lang="text">margins      : [ 2.   0.5 -0.3  1.5]
0-1 loss     : [0 0 1 0]  mean = 0.25
hinge loss   : [0.  0.5 1.3 0. ]  mean = 0.45
log loss (ln): [0.127 0.474 0.854 0.201]  mean = 0.414
sklearn hinge: 0.45  sklearn 0-1: 0.25

 margin   0-1   hinge  log2-loss  squared
     -2     1    3.00     3.069     9.00
     -1     1    2.00     1.895     4.00
      0     1    1.00     1.000     1.00
    0.5     0    0.50     0.684     0.25
      1     0    0.00     0.452     0.00
      2     0    0.00     0.183     1.00</div>
  <p>The first part matches the hand table and sklearn's <code>hinge_loss</code> and <code>zero_one_loss</code>. The second part tabulates all the classification losses against the margin; the next section uses it.</p>
  <h3>Why the hinge matters: support vectors</h3>
  <p>Rows with m ≥ 1 have zero loss <em>and zero gradient</em>: they do not influence the fit at all. Only rows on or inside the margin matter. Those are the <strong>support vectors</strong>, and minimising hinge loss plus an L2 penalty on w is exactly the soft-margin <a class="xref" data-note="ml_svm">Support Vector Machine</a>. The gradient (strictly a subgradient, because of the corner at m = 1) with respect to w is −y·x for rows with m &lt; 1 and 0 otherwise.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Hinge loss</strong>: L(y, f) = max(0, 1 − y·f) with y ∈ {−1, +1}. It is convex, piecewise linear, an upper bound on the 0-1 loss, and gives sparse solutions (only margin violators matter). It does not produce probabilities.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Feeding 0/1 labels into a hinge formula. With y = 0 the margin y·f is always 0 and every row has loss 1. Libraries convert labels internally; your own code must use −1/+1. Also, SVM scores are not probabilities; <code>SVC(probability=True)</code> fits an extra calibration step (see <a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>).</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> All these classification losses are stand-ins. What we usually report is accuracy, i.e. the 0-1 loss. Why don't we minimise that directly?</div>

  <h2 id="lg-01"><span class="num">07</span>0-1 Loss and Surrogate Losses</h2>
  <h3>The loss we actually care about</h3>
  <p>0-1 loss is 1 for a wrong class and 0 for a right one: L = 𝟙[m ≤ 0]. Its average is the error rate, 1 − accuracy. It is the honest measure of a classifier. So why train with anything else?</p>
  <ul>
    <li><strong>No useful gradient.</strong> Change w slightly and the predicted classes usually do not change: the loss is flat (gradient 0) almost everywhere, and jumps at the boundary (gradient undefined). Gradient descent has nothing to follow.</li>
    <li><strong>Hard to optimise exactly.</strong> Finding the linear classifier with the fewest training mistakes is NP-hard in general when no perfect separator exists.</li>
    <li><strong>No notion of "almost right".</strong> A row at margin 0.01 and a row at margin 10 count the same, so the model has no incentive to move rows away from the boundary.</li>
  </ul>
  <h3>Surrogates: convex upper bounds</h3>
  <p>The fix is to minimise a smooth or convex <strong>surrogate</strong> that lies on or above the 0-1 loss and goes down as the margin goes up. Tabulated against the margin (from the run above):</p>
  <table class="tbl">
    <tr><th>margin m</th><th>−2</th><th>−1</th><th>0</th><th>0.5</th><th>1</th><th>2</th></tr>
    <tr><td>0-1</td><td>1</td><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td></tr>
    <tr><td>hinge</td><td>3</td><td>2</td><td>1</td><td>0.5</td><td>0</td><td>0</td></tr>
    <tr><td>log-loss (base 2)</td><td>3.069</td><td>1.895</td><td>1</td><td>0.684</td><td>0.452</td><td>0.183</td></tr>
    <tr><td>squared (1 − m)²</td><td>9</td><td>4</td><td>1</td><td>0.25</td><td>0</td><td><strong>1</strong></td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 620 255" width="620">
<line x1="60" y1="215" x2="580" y2="215" stroke="currentColor" opacity="0.5"/>
<line x1="60" y1="25" x2="60" y2="215" stroke="currentColor" opacity="0.5"/>
<text x="60" y="229" text-anchor="middle" class="tm" font-size="10.5">-2</text>
<line x1="60" y1="215" x2="60" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="164" y="229" text-anchor="middle" class="tm" font-size="10.5">-1</text>
<line x1="164" y1="215" x2="164" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="268" y="229" text-anchor="middle" class="tm" font-size="10.5">0</text>
<line x1="268" y1="215" x2="268" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="372" y="229" text-anchor="middle" class="tm" font-size="10.5">1</text>
<line x1="372" y1="215" x2="372" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="476" y="229" text-anchor="middle" class="tm" font-size="10.5">2</text>
<line x1="476" y1="215" x2="476" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="580" y="229" text-anchor="middle" class="tm" font-size="10.5">3</text>
<line x1="580" y1="215" x2="580" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="55" y="218.5" text-anchor="end" class="tm" font-size="10.5">0</text>
<line x1="57" y1="215" x2="60" y2="215" stroke="currentColor" opacity="0.5"/>
<text x="55" y="171" text-anchor="end" class="tm" font-size="10.5">1</text>
<line x1="57" y1="167.5" x2="60" y2="167.5" stroke="currentColor" opacity="0.5"/>
<text x="55" y="123.5" text-anchor="end" class="tm" font-size="10.5">2</text>
<line x1="57" y1="120" x2="60" y2="120" stroke="currentColor" opacity="0.5"/>
<text x="55" y="76" text-anchor="end" class="tm" font-size="10.5">3</text>
<line x1="57" y1="72.5" x2="60" y2="72.5" stroke="currentColor" opacity="0.5"/>
<text x="55" y="28.5" text-anchor="end" class="tm" font-size="10.5">4</text>
<line x1="57" y1="25" x2="60" y2="25" stroke="currentColor" opacity="0.5"/>
<line x1="268" y1="25" x2="268" y2="215" stroke-dasharray="3 3" class="sg"/>
<polyline points="60,167.5 268,167.5 268,215 580,215" fill="none" stroke="currentColor" stroke-width="2.5"/>
<text x="290" y="96" class="tm" font-size="11.5">black: 0-1 loss</text>
<polyline points="60,72.5 65.2,74.9 70.4,77.2 75.6,79.6 80.8,82 86,84.4 91.2,86.8 96.4,89.1 101.6,91.5 106.8,93.9 112,96.2 117.2,98.6 122.4,101 127.6,103.4 132.8,105.8 138,108.1 143.2,110.5 148.4,112.9 153.6,115.2 158.8,117.6 164,120 169.2,122.4 174.4,124.8 179.6,127.1 184.8,129.5 190,131.9 195.2,134.2 200.4,136.6 205.6,139 210.8,141.4 216,143.8 221.2,146.1 226.4,148.5 231.6,150.9 236.8,153.2 242,155.6 247.2,158 252.4,160.4 257.6,162.8 262.8,165.1 268,167.5 273.2,169.9 278.4,172.2 283.6,174.6 288.8,177 294,179.4 299.2,181.8 304.4,184.1 309.6,186.5 314.8,188.9 320,191.2 325.2,193.6 330.4,196 335.6,198.4 340.8,200.8 346,203.1 351.2,205.5 356.4,207.9 361.6,210.3 366.8,212.6 372,215 377.2,215 382.4,215 387.6,215 392.8,215 398,215 403.2,215 408.4,215 413.6,215 418.8,215 424,215 429.2,215 434.4,215 439.6,215 444.8,215 450,215 455.2,215 460.4,215 465.6,215 470.8,215 476,215 481.2,215 486.4,215 491.6,215 496.8,215 502,215 507.2,215 512.4,215 517.6,215 522.8,215 528,215 533.2,215 538.4,215 543.6,215 548.8,215 554,215 559.2,215 564.4,215 569.6,215 574.8,215 580,215" fill="none" class="sr" stroke-width="2"/>
<text x="290" y="45" class="tr" font-size="11.5">red: hinge max(0, 1 − m)</text>
<polyline points="60,69.2 65.2,72.3 70.4,75.2 75.6,78.2 80.8,81.2 86,84.1 91.2,87 96.4,89.9 101.6,92.8 106.8,95.6 112,98.4 117.2,101.2 122.4,104 127.6,106.7 132.8,109.4 138,112.1 143.2,114.7 148.4,117.3 153.6,119.9 158.8,122.5 164,125 169.2,127.5 174.4,129.9 179.6,132.4 184.8,134.7 190,137.1 195.2,139.4 200.4,141.7 205.6,143.9 210.8,146.1 216,148.2 221.2,150.4 226.4,152.4 231.6,154.5 236.8,156.5 242,158.4 247.2,160.3 252.4,162.2 257.6,164 262.8,165.8 268,167.5 273.2,169.2 278.4,170.8 283.6,172.4 288.8,174 294,175.5 299.2,177 304.4,178.4 309.6,179.8 314.8,181.2 320,182.5 325.2,183.8 330.4,185 335.6,186.2 340.8,187.4 346,188.5 351.2,189.6 356.4,190.6 361.6,191.6 366.8,192.6 372,193.5 377.2,194.4 382.4,195.3 387.6,196.1 392.8,197 398,197.7 403.2,198.5 408.4,199.2 413.6,199.9 418.8,200.6 424,201.2 429.2,201.8 434.4,202.4 439.6,203 444.8,203.5 450,204 455.2,204.5 460.4,205 465.6,205.4 470.8,205.9 476,206.3 481.2,206.7 486.4,207.1 491.6,207.4 496.8,207.8 502,208.1 507.2,208.5 512.4,208.8 517.6,209 522.8,209.3 528,209.6 533.2,209.8 538.4,210.1 543.6,210.3 548.8,210.5 554,210.8 559.2,211 564.4,211.1 569.6,211.3 574.8,211.5 580,211.7" fill="none" class="sb" stroke-width="2"/>
<text x="290" y="62" class="tb" font-size="11.5">blue: log loss log₂(1 + e⁻ᵐ)</text>
<polyline points="164,25 169.2,34.4 174.4,43.5 179.6,52.4 184.8,61.1 190,69.5 195.2,77.7 200.4,85.7 205.6,93.4 210.8,100.9 216,108.1 221.2,115.1 226.4,121.9 231.6,128.4 236.8,134.7 242,140.8 247.2,146.6 252.4,152.2 257.6,157.5 262.8,162.6 268,167.5 273.2,172.1 278.4,176.5 283.6,180.7 288.8,184.6 294,188.3 299.2,191.7 304.4,194.9 309.6,197.9 314.8,200.6 320,203.1 325.2,205.4 330.4,207.4 335.6,209.2 340.8,210.7 346,212 351.2,213.1 356.4,213.9 361.6,214.5 366.8,214.9 372,215 377.2,214.9 382.4,214.5 387.6,213.9 392.8,213.1 398,212 403.2,210.7 408.4,209.2 413.6,207.4 418.8,205.4 424,203.1 429.2,200.6 434.4,197.9 439.6,194.9 444.8,191.7 450,188.3 455.2,184.6 460.4,180.7 465.6,176.5 470.8,172.1 476,167.5 481.2,162.6 486.4,157.5 491.6,152.2 496.8,146.6 502,140.8 507.2,134.7 512.4,128.4 517.6,121.9 522.8,115.1 528,108.1 533.2,100.9 538.4,93.4 543.6,85.7 548.8,77.7 554,69.5 559.2,61.1 564.4,52.4 569.6,43.5 574.8,34.4 580,25" fill="none" class="st" stroke-width="2" stroke-dasharray="5 3"/>
<text x="290" y="79" class="tm" font-size="11.5">teal: squared (1 − m)²</text>
<text x="320" y="245" text-anchor="middle" class="tm" font-size="11">margin m = y·f(x)  (y in {−1, +1});  m &gt; 0 means correct</text>
<text x="26" y="120" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 26 120)">loss</text>
</svg><figcaption>Classification losses as a function of the margin. The 0-1 step (black) is what we want; hinge (red) and log-loss (blue, base 2 so it passes through 1 at m = 0) are convex upper bounds that keep falling as the margin grows. Squared loss (teal) wrongly rises again for very confident correct answers.</figcaption></figure>
  <p>With base-2 logs, log-loss in margin form is log₂(1 + e<sup>−m</sup>), which equals 1 at m = 0 and stays above the step, so it is an upper bound on the error rate. (This is the same log-loss as section 05, just written with ±1 labels and a raw score: p = σ(f).) Note the squared column: at m = 2 the loss is 1, as large as a wrong answer at m = 0. Squared loss on ±1 labels punishes being "too correct", one more reason it is a poor classification loss.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Each surrogate is a modelling choice. Log-loss gives calibrated probabilities and never fully ignores a row. Hinge ignores well-classified rows and gives sparse "support vector" solutions but no probabilities. Exponential loss e<sup>−m</sup> (used by <a class="xref" data-note="ml_adaboost">AdaBoost</a>) punishes negative margins even harder and is very sensitive to label noise. All are <strong>classification-calibrated</strong>: with enough data, minimising them also minimises the 0-1 error.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>0-1 loss</strong>: L(y, ŷ) = 𝟙[y ≠ ŷ] (or 𝟙[y·f ≤ 0]). A <strong>surrogate loss</strong> φ(m) is a tractable (usually convex, differentiable or sub-differentiable) function used in place of the 0-1 loss during training, with φ(m) ≥ 𝟙[m ≤ 0] and φ decreasing in m.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Early-stopping or tuning on log-loss and then being surprised that accuracy did not move, or the reverse. The two can disagree: a model can lower log-loss by becoming better calibrated without changing a single predicted class. Track the metric you report as well as the loss you train on.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We have the losses. Now the model has parameters (w, b), and the average loss over the training set is a function of them, a landscape. To find the lowest point we need to see that landscape.</div>

  <h2 id="lg-cost"><span class="num">08</span>From Loss to Cost Surface</h2>
  <h3>The cost as a function of the parameters</h3>
  <p>The data is fixed during training; the parameters move. So we read the cost J as a function of the parameters. For a line ŷ = w·x + b with squared loss:</p>
  <p style="text-align:center">J(w, b) = (1/n) Σᵢ (w·xᵢ + b − yᵢ)²</p>
  <p>We will use three training points through this whole part of the note: (1, 2), (2, 4), (3, 5).</p>
  <h3>By hand: the height of the landscape at a few spots</h3>
  <table class="tbl">
    <tr><th>(w, b)</th><th>predictions at x = 1, 2, 3</th><th>errors ŷ − y</th><th>J = mean of errors²</th></tr>
    <tr><td>(0, 0)</td><td>0, 0, 0</td><td>−2, −4, −5</td><td>(4 + 16 + 25)/3 = <strong>15</strong></td></tr>
    <tr><td>(2, 0)</td><td>2, 4, 6</td><td>0, 0, 1</td><td>1/3 = <strong>0.333</strong></td></tr>
    <tr><td>(1, 1)</td><td>2, 3, 4</td><td>0, −1, −1</td><td>2/3 = <strong>0.667</strong></td></tr>
    <tr><td>(1.5, 0.5)</td><td>2, 3.5, 5</td><td>0, −0.5, 0</td><td>0.25/3 = <strong>0.083</strong></td></tr>
    <tr><td>(1.5, 0.667)</td><td>2.167, 3.667, 5.167</td><td>0.167, −0.333, 0.167</td><td>0.1667/3 = <strong>0.056</strong></td></tr>
  </table>
  <div class="fx" data-lang="py">import numpy as np
x = np.array([1.0, 2.0, 3.0]); y = np.array([2.0, 4.0, 5.0])

def cost(w, b):                                # J(w, b) = mean squared error of y_hat = w*x + b
    return ((w * x + b - y) ** 2).mean()

for w, b in [(0, 0), (2, 0), (1, 1), (1.5, 0.5), (1.5, 2/3)]:
    print(f"J(w={w}, b={b:.3f}) = {cost(w, b):.4f}")</div>
  <div class="fx" data-lang="text">J(w=0, b=0.000) = 15.0000
J(w=2, b=0.000) = 0.3333
J(w=1, b=1.000) = 0.6667
J(w=1.5, b=0.500) = 0.0833
J(w=1.5, b=0.667) = 0.0556</div>
  <p>The last point is the exact least-squares answer (computed in section 15); no (w, b) does better than 0.0556 because the three points are not on one line. The cost is a quadratic in (w, b), so the landscape is a bowl. Its contour lines (points of equal cost) are ellipses, drawn in the next section's figure.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>cost function</strong> (objective, empirical risk) J(θ) = (1/n) Σᵢ L(yᵢ, f(xᵢ; θ)) + λΩ(θ) maps a parameter vector θ to a single number. <strong>Training</strong> solves θ* = argmin<sub>θ</sub> J(θ). The <strong>gradient</strong> ∇J(θ) is the vector of partial derivatives ∂J/∂θⱼ; it points in the direction of steepest increase of J.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> With two parameters we could scan a grid. A real model has thousands or millions of parameters; scanning is impossible. We need a way to find the bottom of the bowl using only local information: the slope where we stand.</div>

  <h2 id="lg-gd"><span class="num">09</span>Gradient Descent, Derived for Linear Regression</h2>
  <h3>The idea</h3>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>You are on a hillside in thick fog near Munnar and need to reach the valley floor. You cannot see the valley, but you can feel the slope under your feet. Take a step in the steepest downhill direction, feel again, step again. The slope is the gradient; the length of your step is the learning rate.</p>
  </div>
  <p>The gradient ∇J points uphill. So the update is: <strong>θ ← θ − η·∇J(θ)</strong>, where η (eta) is the <strong>learning rate</strong>. Repeat until the gradient is (nearly) zero, which happens only at the bottom.</p>
  <h3>The partial derivatives, step by step</h3>
  <p>J(w, b) = (1/n) Σ eᵢ², with error eᵢ = w·xᵢ + b − yᵢ. Use the chain rule (<a class="xref" data-note="m_calculus">Calculus</a>): the derivative of e² is 2e times the derivative of e.</p>
  <ul>
    <li>∂eᵢ/∂w = xᵢ (w is multiplied by xᵢ), and ∂eᵢ/∂b = 1.</li>
    <li>So <strong>∂J/∂w = (2/n) Σ eᵢ·xᵢ</strong> and <strong>∂J/∂b = (2/n) Σ eᵢ</strong>.</li>
  </ul>
  <p>In plain words: the slope with respect to b is twice the average error (if predictions are too high on average, lower b). The slope with respect to w is twice the average of error × input (if the big-x rows are over-predicted, lower w). With many features stacked in a matrix X (one row per example, a column of 1s for b), both lines become one: <strong>∇J = (2/n)·Xᵀ(Xθ − y)</strong>.</p>
  <h3>Three steps by hand (η = 0.1, start at w = b = 0)</h3>
  <p><strong>Step 1.</strong> At (0, 0): predictions 0, 0, 0; errors e = −2, −4, −5.</p>
  <ul>
    <li>∂J/∂w = (2/3)(−2·1 − 4·2 − 5·3) = (2/3)(−25) = −16.667</li>
    <li>∂J/∂b = (2/3)(−2 − 4 − 5) = (2/3)(−11) = −7.333</li>
    <li>w = 0 − 0.1·(−16.667) = <strong>1.6667</strong>, b = 0 − 0.1·(−7.333) = <strong>0.7333</strong></li>
    <li>New predictions 2.4, 4.067, 5.733; errors 0.4, 0.067, 0.733; J = (0.16 + 0.0044 + 0.5378)/3 = <strong>0.234</strong> (down from 15)</li>
  </ul>
  <p><strong>Step 2.</strong> Errors 0.4, 0.0667, 0.7333.</p>
  <ul>
    <li>∂J/∂w = (2/3)(0.4·1 + 0.0667·2 + 0.7333·3) = (2/3)(2.7333) = 1.8222</li>
    <li>∂J/∂b = (2/3)(0.4 + 0.0667 + 0.7333) = (2/3)(1.2) = 0.8</li>
    <li>w = 1.6667 − 0.18222 = <strong>1.4844</strong>, b = 0.7333 − 0.08 = <strong>0.6533</strong>. Step 1 overshot a little; the gradient changed sign and pulled back.</li>
    <li>Predictions 2.138, 3.622, 5.107; errors 0.138, −0.378, 0.107; J = (0.0190 + 0.1427 + 0.0114)/3 = <strong>0.0577</strong></li>
  </ul>
  <p><strong>Step 3.</strong> ∂J/∂w = (2/3)(0.1378 − 0.7556 + 0.32) = −0.1985, ∂J/∂b = (2/3)(−0.1333) = −0.0889. w = 1.4844 + 0.01985 = <strong>1.5043</strong>, b = 0.6533 + 0.00889 = <strong>0.6622</strong>, J = <strong>0.0556</strong>, already equal to the best possible value to 4 decimals.</p>
  <div class="fx" data-lang="py">import numpy as np
x = np.array([1.0, 2.0, 3.0]); y = np.array([2.0, 4.0, 5.0])
w, b, lr = 0.0, 0.0, 0.1                       # start at zero, learning rate 0.1
n = len(x)
for step in range(1, 301):
    err = (w * x + b) - y                      # prediction minus truth
    dw = 2 / n * (err * x).sum()               # dJ/dw
    db = 2 / n * err.sum()                     # dJ/db
    w, b = w - lr * dw, b - lr * db            # move against the gradient
    if step &lt;= 3 or step in (10, 50, 100, 300):
        J = (((w * x + b) - y) ** 2).mean()
        print(f"step {step:3d}: grad=({round(dw, 4) + 0:8.4f}, {round(db, 4) + 0:8.4f})  w={w:.4f}  b={b:.4f}  J={J:.4f}")</div>
  <div class="fx" data-lang="text">step   1: grad=(-16.6667,  -7.3333)  w=1.6667  b=0.7333  J=0.2341
step   2: grad=(  1.8222,   0.8000)  w=1.4844  b=0.6533  J=0.0577
step   3: grad=( -0.1985,  -0.0889)  w=1.5043  b=0.6622  J=0.0556
step  10: grad=(  0.0005,  -0.0011)  w=1.5020  b=0.6622  J=0.0556
step  50: grad=(  0.0002,  -0.0004)  w=1.5007  b=0.6650  J=0.0556
step 100: grad=(  0.0001,  -0.0001)  w=1.5002  b=0.6662  J=0.0556
step 300: grad=(  0.0000,   0.0000)  w=1.5000  b=0.6667  J=0.0556</div>
  <p>The first three lines are the hand computation. After that, J looks stuck at 0.0556, yet w and b keep creeping towards the exact (1.5, 0.6667) for hundreds of steps. The bowl has one steep direction (crossed in the first steps) and one very shallow direction along the valley floor, where the gradient is tiny. Section 10 explains this with numbers.</p>
  <figure class="viz"><svg viewBox="0 0 680 325" width="680">
<line x1="50" y1="260" x2="310" y2="260" stroke="currentColor" opacity="0.5"/>
<line x1="50" y1="30" x2="50" y2="260" stroke="currentColor" opacity="0.5"/>
<text x="78.9" y="274" text-anchor="middle" class="tm" font-size="10.5">0</text>
<line x1="78.9" y1="260" x2="78.9" y2="263" stroke="currentColor" opacity="0.5"/>
<text x="151.1" y="274" text-anchor="middle" class="tm" font-size="10.5">1</text>
<line x1="151.1" y1="260" x2="151.1" y2="263" stroke="currentColor" opacity="0.5"/>
<text x="223.3" y="274" text-anchor="middle" class="tm" font-size="10.5">2</text>
<line x1="223.3" y1="260" x2="223.3" y2="263" stroke="currentColor" opacity="0.5"/>
<text x="295.6" y="274" text-anchor="middle" class="tm" font-size="10.5">3</text>
<line x1="295.6" y1="260" x2="295.6" y2="263" stroke="currentColor" opacity="0.5"/>
<text x="45" y="251.4" text-anchor="end" class="tm" font-size="10.5">-1</text>
<line x1="47" y1="247.9" x2="50" y2="247.9" stroke="currentColor" opacity="0.5"/>
<text x="45" y="190.9" text-anchor="end" class="tm" font-size="10.5">0</text>
<line x1="47" y1="187.4" x2="50" y2="187.4" stroke="currentColor" opacity="0.5"/>
<text x="45" y="130.3" text-anchor="end" class="tm" font-size="10.5">1</text>
<line x1="47" y1="126.8" x2="50" y2="126.8" stroke="currentColor" opacity="0.5"/>
<text x="45" y="69.8" text-anchor="end" class="tm" font-size="10.5">2</text>
<line x1="47" y1="66.3" x2="50" y2="66.3" stroke="currentColor" opacity="0.5"/>
<polyline points="200.5,159.3 199.3,156.6 198,153.8 196.7,151 195.3,148.1 193.8,145.3 192.3,142.5 190.8,139.7 189.2,136.9 187.6,134.2 186.1,131.6 184.5,129.1 183,126.7 181.4,124.4 180,122.3 178.5,120.3 177.1,118.5 175.8,116.8 174.6,115.4 173.4,114.2 172.3,113.1 171.3,112.3 170.4,111.7 169.7,111.4 169,111.2 168.4,111.3 168,111.6 167.7,112.1 167.5,112.9 167.4,113.8 167.5,115 167.7,116.4 168,118 168.4,119.7 169,121.7 169.6,123.7 170.4,126 171.3,128.3 172.3,130.8 173.4,133.4 174.5,136.1 175.8,138.8 177.1,141.6 178.5,144.5 179.9,147.3 181.4,150.2 182.9,153 184.4,155.8 186,158.5 187.6,161.2 189.2,163.7 190.7,166.2 192.2,168.5 193.8,170.7 195.2,172.8 196.6,174.7 198,176.4 199.3,177.9 200.5,179.3 201.6,180.4 202.6,181.3 203.6,182 204.4,182.5 205.1,182.8 205.7,182.8 206.2,182.6 206.6,182.2 206.9,181.6 207,180.7 207,179.6 206.9,178.4 206.6,176.9 206.2,175.2 205.8,173.4 205.2,171.4 204.4,169.2 203.6,166.9 202.7,164.5 201.6,161.9 200.5,159.3" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="219.8,177.1 216.8,170.4 213.7,163.6 210.4,156.7 206.9,149.8 203.4,142.8 199.7,135.9 195.9,129 192.1,122.2 188.3,115.6 184.4,109.2 180.6,103 176.8,97.2 173.1,91.6 169.4,86.4 165.9,81.5 162.5,77.1 159.3,73.1 156.2,69.6 153.4,66.6 150.7,64 148.3,62 146.1,60.6 144.2,59.7 142.6,59.3 141.2,59.5 140.2,60.3 139.4,61.6 138.9,63.4 138.8,65.8 138.9,68.6 139.4,72 140.1,75.9 141.2,80.2 142.5,84.9 144.1,90 146,95.5 148.2,101.3 150.6,107.4 153.2,113.7 156.1,120.3 159.1,127 162.4,133.8 165.8,140.8 169.3,147.7 172.9,154.7 176.6,161.6 180.4,168.4 184.3,175.1 188.1,181.6 192,187.9 195.8,194 199.5,199.7 203.2,205.1 206.8,210.2 210.3,214.8 213.6,219 216.7,222.8 219.7,226 222.4,228.8 225,231.1 227.3,232.8 229.3,234 231.1,234.6 232.6,234.7 233.8,234.2 234.7,233.2 235.3,231.6 235.6,229.5 235.6,226.9 235.3,223.8 234.7,220.2 233.8,216.1 232.6,211.6 231.1,206.6 229.4,201.3 227.3,195.7 225.1,189.7 222.5,183.5 219.8,177.1" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="246.7,201.9 241.3,189.8 235.6,177.4 229.5,164.8 223.2,152.1 216.7,139.3 210,126.7 203.1,114.1 196.1,101.8 189.1,89.7 182.1,78 175.1,66.7 168.2,56 161.4,45.8 154.7,36.3" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="105.6,33.6 108.6,42.9 112,52.9 116,63.5 120.4,74.6 125.2,86.2 130.4,98.2 136,110.4 141.9,122.9 148,135.6 154.5,148.3 161.1,161 167.9,173.7 174.8,186.1 181.8,198.3 188.8,210.2 195.9,221.7 202.8,232.7 209.7,243.2 216.4,253.1" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="267.4,255.9 264.2,246.2 260.5,235.9 256.3,225 251.7,213.7 246.7,201.9" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="290.2,242.1 280.9,221.1 271,199.6 260.5,177.8 249.6,155.8 238.3,133.7 226.6,111.8 214.7,90 202.7,68.6 190.5,47.7" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="79.8,41.7 88.8,62.4 98.4,83.7 108.6,105.3 119.3,127.2 130.5,149.3 142,171.3 153.7,193.2 165.7,214.8 177.8,235.9 190,256.5" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="306.9,197.3 289.1,161.3 270.6,125.3 251.6,89.4 232.2,53.9" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="58.9,78.9 76.4,114.7 94.6,150.7 113.3,186.7 132.5,222.4 152.1,257.6" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="301.4,117.3 275.3,68.2" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="60.3,152.1 86,201.3 112.3,250.2" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="78.9,187.4 283.5,111.9 102.2,178.7 262.8,119.5 120.6,171.9 246.5,125.5 134.9,166.6 233.8,130.2 146.2,162.4 223.8,133.8 155.1,159.1 215.9,136.7 162,156.6" fill="none" class="sr" stroke-width="1.5"/>
<circle cx="78.9" cy="187.4" r="2.5" class="tr"/>
<circle cx="283.5" cy="111.9" r="2.5" class="tr"/>
<circle cx="102.2" cy="178.7" r="2.5" class="tr"/>
<circle cx="262.8" cy="119.5" r="2.5" class="tr"/>
<circle cx="120.6" cy="171.9" r="2.5" class="tr"/>
<circle cx="246.5" cy="125.5" r="2.5" class="tr"/>
<circle cx="134.9" cy="166.6" r="2.5" class="tr"/>
<circle cx="233.8" cy="130.2" r="2.5" class="tr"/>
<circle cx="146.2" cy="162.4" r="2.5" class="tr"/>
<circle cx="223.8" cy="133.8" r="2.5" class="tr"/>
<circle cx="155.1" cy="159.1" r="2.5" class="tr"/>
<circle cx="215.9" cy="136.7" r="2.5" class="tr"/>
<circle cx="162" cy="156.6" r="2.5" class="tr"/>
<polyline points="78.9,187.4 199.3,143 186.1,147.8 187.5,147.3 187.4,147.3 187.4,147.3 187.4,147.3 187.4,147.3 187.4,147.3 187.4,147.3 187.4,147.3 187.4,147.3 187.4,147.3" fill="none" class="sb" stroke-width="2.2"/>
<circle cx="78.9" cy="187.4" r="3" class="tb"/>
<circle cx="199.3" cy="143" r="3" class="tb"/>
<circle cx="186.1" cy="147.8" r="3" class="tb"/>
<circle cx="187.5" cy="147.3" r="3" class="tb"/>
<circle cx="187.4" cy="147.3" r="3" class="tb"/>
<circle cx="187.4" cy="147.3" r="3" class="tb"/>
<circle cx="187.4" cy="147.3" r="3" class="tb"/>
<circle cx="187.4" cy="147.3" r="3" class="tb"/>
<circle cx="187.4" cy="147.3" r="3" class="tb"/>
<circle cx="187.4" cy="147.3" r="3" class="tb"/>
<circle cx="187.4" cy="147.3" r="3" class="tb"/>
<circle cx="187.4" cy="147.3" r="3" class="tb"/>
<circle cx="187.4" cy="147.3" r="3" class="tb"/>
<text x="180" y="290" text-anchor="middle" class="tm" font-size="11">w (slope)</text>
<text x="22" y="145" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 22 145)">b</text>
<text x="180" y="22" text-anchor="middle" font-size="12.5" font-weight="700">batch GD, η = 0.1 vs η = 0.17</text>
<line x1="380" y1="260" x2="640" y2="260" stroke="currentColor" opacity="0.5"/>
<line x1="380" y1="30" x2="380" y2="260" stroke="currentColor" opacity="0.5"/>
<text x="408.9" y="274" text-anchor="middle" class="tm" font-size="10.5">0</text>
<line x1="408.9" y1="260" x2="408.9" y2="263" stroke="currentColor" opacity="0.5"/>
<text x="481.1" y="274" text-anchor="middle" class="tm" font-size="10.5">1</text>
<line x1="481.1" y1="260" x2="481.1" y2="263" stroke="currentColor" opacity="0.5"/>
<text x="553.3" y="274" text-anchor="middle" class="tm" font-size="10.5">2</text>
<line x1="553.3" y1="260" x2="553.3" y2="263" stroke="currentColor" opacity="0.5"/>
<text x="625.6" y="274" text-anchor="middle" class="tm" font-size="10.5">3</text>
<line x1="625.6" y1="260" x2="625.6" y2="263" stroke="currentColor" opacity="0.5"/>
<text x="375" y="251.4" text-anchor="end" class="tm" font-size="10.5">-1</text>
<line x1="377" y1="247.9" x2="380" y2="247.9" stroke="currentColor" opacity="0.5"/>
<text x="375" y="190.9" text-anchor="end" class="tm" font-size="10.5">0</text>
<line x1="377" y1="187.4" x2="380" y2="187.4" stroke="currentColor" opacity="0.5"/>
<text x="375" y="130.3" text-anchor="end" class="tm" font-size="10.5">1</text>
<line x1="377" y1="126.8" x2="380" y2="126.8" stroke="currentColor" opacity="0.5"/>
<text x="375" y="69.8" text-anchor="end" class="tm" font-size="10.5">2</text>
<line x1="377" y1="66.3" x2="380" y2="66.3" stroke="currentColor" opacity="0.5"/>
<polyline points="530.5,159.3 529.3,156.6 528,153.8 526.7,151 525.3,148.1 523.8,145.3 522.3,142.5 520.8,139.7 519.2,136.9 517.6,134.2 516.1,131.6 514.5,129.1 513,126.7 511.4,124.4 510,122.3 508.5,120.3 507.1,118.5 505.8,116.8 504.6,115.4 503.4,114.2 502.3,113.1 501.3,112.3 500.4,111.7 499.7,111.4 499,111.2 498.4,111.3 498,111.6 497.7,112.1 497.5,112.9 497.4,113.8 497.5,115 497.7,116.4 498,118 498.4,119.7 499,121.7 499.6,123.7 500.4,126 501.3,128.3 502.3,130.8 503.4,133.4 504.5,136.1 505.8,138.8 507.1,141.6 508.5,144.5 509.9,147.3 511.4,150.2 512.9,153 514.4,155.8 516,158.5 517.6,161.2 519.2,163.7 520.7,166.2 522.2,168.5 523.8,170.7 525.2,172.8 526.6,174.7 528,176.4 529.3,177.9 530.5,179.3 531.6,180.4 532.6,181.3 533.6,182 534.4,182.5 535.1,182.8 535.7,182.8 536.2,182.6 536.6,182.2 536.9,181.6 537,180.7 537,179.6 536.9,178.4 536.6,176.9 536.2,175.2 535.8,173.4 535.2,171.4 534.4,169.2 533.6,166.9 532.7,164.5 531.6,161.9 530.5,159.3" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="549.8,177.1 546.8,170.4 543.7,163.6 540.4,156.7 536.9,149.8 533.4,142.8 529.7,135.9 525.9,129 522.1,122.2 518.3,115.6 514.4,109.2 510.6,103 506.8,97.2 503.1,91.6 499.4,86.4 495.9,81.5 492.5,77.1 489.3,73.1 486.2,69.6 483.4,66.6 480.7,64 478.3,62 476.1,60.6 474.2,59.7 472.6,59.3 471.2,59.5 470.2,60.3 469.4,61.6 468.9,63.4 468.8,65.8 468.9,68.6 469.4,72 470.1,75.9 471.2,80.2 472.5,84.9 474.1,90 476,95.5 478.2,101.3 480.6,107.4 483.2,113.7 486.1,120.3 489.1,127 492.4,133.8 495.8,140.8 499.3,147.7 502.9,154.7 506.6,161.6 510.4,168.4 514.3,175.1 518.1,181.6 522,187.9 525.8,194 529.5,199.7 533.2,205.1 536.8,210.2 540.3,214.8 543.6,219 546.7,222.8 549.7,226 552.4,228.8 555,231.1 557.3,232.8 559.3,234 561.1,234.6 562.6,234.7 563.8,234.2 564.7,233.2 565.3,231.6 565.6,229.5 565.6,226.9 565.3,223.8 564.7,220.2 563.8,216.1 562.6,211.6 561.1,206.6 559.4,201.3 557.3,195.7 555.1,189.7 552.5,183.5 549.8,177.1" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="576.7,201.9 571.3,189.8 565.6,177.4 559.5,164.8 553.2,152.1 546.7,139.3 540,126.7 533.1,114.1 526.1,101.8 519.1,89.7 512.1,78 505.1,66.7 498.2,56 491.4,45.8 484.7,36.3" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="435.6,33.6 438.6,42.9 442,52.9 446,63.5 450.4,74.6 455.2,86.2 460.4,98.2 466,110.4 471.9,122.9 478,135.6 484.5,148.3 491.1,161 497.9,173.7 504.8,186.1 511.8,198.3 518.8,210.2 525.9,221.7 532.8,232.7 539.7,243.2 546.4,253.1" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="597.4,255.9 594.2,246.2 590.5,235.9 586.3,225 581.7,213.7 576.7,201.9" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="620.2,242.1 610.9,221.1 601,199.6 590.5,177.8 579.6,155.8 568.3,133.7 556.6,111.8 544.7,90 532.7,68.6 520.5,47.7" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="409.8,41.7 418.8,62.4 428.4,83.7 438.6,105.3 449.3,127.2 460.5,149.3 472,171.3 483.7,193.2 495.7,214.8 507.8,235.9 520,256.5" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="636.9,197.3 619.1,161.3 600.6,125.3 581.6,89.4 562.2,53.9" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="388.9,78.9 406.4,114.7 424.6,150.7 443.3,186.7 462.5,222.4 482.1,257.6" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="631.4,117.3 605.3,68.2" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="390.3,152.1 416,201.3 442.3,250.2" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="408.9,187.4 582.2,138.9 545.2,154.4 537.8,157.5 534.6,160.2 532.4,162.1 531,163.3 529.9,164.2 529.3,164.7 528.8,165.1 516.7,168.5 533,161.7 512.9,167.3 531.1,159.7 534.8,158.1 510.1,165 524.9,160.9 533,157.5 534.6,156.8 534.9,156.7 509.2,163.9 511.8,161.7 522.3,158.8 516,160.6 516.8,159.8 529.7,154.5 510.2,159.9 527.3,152.7 524.9,154.8 512.5,158.2 519.9,156.2 515.5,157.4 515.8,157.1 516,156.9 517.6,156.5 517.5,156.6 528.7,151.9 525.9,154.3 523.9,155.9 530.7,153.1 532.1,152.5" fill="none" class="st" stroke-width="1.3"/>
<polyline points="408.9,187.4 529.3,143 516.1,147.8 517.5,147.3 517.4,147.3 517.4,147.3 517.4,147.3 517.4,147.3 517.4,147.3 517.4,147.3 517.4,147.3 517.4,147.3 517.4,147.3" fill="none" class="sb" stroke-width="2.2"/>
<circle cx="408.9" cy="187.4" r="3" class="tb"/>
<circle cx="529.3" cy="143" r="3" class="tb"/>
<circle cx="516.1" cy="147.8" r="3" class="tb"/>
<circle cx="517.5" cy="147.3" r="3" class="tb"/>
<circle cx="517.4" cy="147.3" r="3" class="tb"/>
<circle cx="517.4" cy="147.3" r="3" class="tb"/>
<circle cx="517.4" cy="147.3" r="3" class="tb"/>
<circle cx="517.4" cy="147.3" r="3" class="tb"/>
<circle cx="517.4" cy="147.3" r="3" class="tb"/>
<circle cx="517.4" cy="147.3" r="3" class="tb"/>
<circle cx="517.4" cy="147.3" r="3" class="tb"/>
<circle cx="517.4" cy="147.3" r="3" class="tb"/>
<circle cx="517.4" cy="147.3" r="3" class="tb"/>
<text x="510" y="290" text-anchor="middle" class="tm" font-size="11">w (slope)</text>
<text x="352" y="145" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 352 145)">b</text>
<text x="510" y="22" text-anchor="middle" font-size="12.5" font-weight="700">SGD (one row per step), η = 0.08</text>
<text x="60" y="300" class="tb" font-size="11">blue: η = 0.1 (3 steps to the bottom)</text><text x="60" y="315" class="tr" font-size="11">red: η = 0.17 (zig-zags across the valley)</text><text x="390" y="300" class="tm" font-size="11">teal: 40 single-row steps bounce</text><text x="390" y="315" class="tm" font-size="11">around the bottom, never settling</text><text x="187.2" y="151" text-anchor="middle" font-weight="700">×</text>
</svg><figcaption>Contours of J(w, b) for the three points; the ellipses are long and thin because the bowl is steep in one direction and shallow in the other. Left: η = 0.1 (blue) reaches the bottom in about three steps; η = 0.17 (red) bounces across the valley but still converges. Right: stochastic updates on one row at a time (section 12).</figcaption></figure>
  <div class="flow"><span>Start θ (zeros or random)</span><span>Predict, compute errors</span><span>Gradient ∇J = (2/n)Xᵀ(Xθ − y)</span><span>θ ← θ − η∇J</span><span>Repeat until ∇J ≈ 0 or J stops falling</span></div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Gradient descent</strong>: given a differentiable cost J, a start θ₀ and a learning rate η &gt; 0, iterate θ<sub>t+1</sub> = θ<sub>t</sub> − η∇J(θ<sub>t</sub>). For linear regression with MSE, ∇J(θ) = (2/n)Xᵀ(Xθ − y). Stopping rules: a maximum number of iterations, a tolerance on the change in J or on ‖∇J‖, or early stopping on a validation set.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Mixing up the sign or the error definition. With e = ŷ − y the update is θ − η·(2/n)Xᵀe. Writing e = y − ŷ and keeping the minus sign makes you walk <em>uphill</em> and the cost explodes. When in doubt, check that J goes down after the first step.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We picked η = 0.1 and it worked. Why that value? What happens with 0.01 or 0.19, and how can we know the safe range before trying?</div>

  <h2 id="lg-lr"><span class="num">10</span>The Learning Rate</h2>
  <h3>One parameter first: J(w) = w²</h3>
  <p>The gradient is 2w, so a step is w ← w − η·2w = (1 − 2η)·w. Everything depends on the factor (1 − 2η). Start at w = 1:</p>
  <table class="tbl">
    <tr><th>η</th><th>factor 1 − 2η</th><th>w₀, w₁, w₂, w₃</th><th>behaviour</th></tr>
    <tr><td>0.1</td><td>0.8</td><td>1, 0.8, 0.64, 0.512</td><td>smooth, steady</td></tr>
    <tr><td>0.5</td><td>0</td><td>1, 0, 0, 0</td><td>one step to the minimum</td></tr>
    <tr><td>0.9</td><td>−0.8</td><td>1, −0.8, 0.64, −0.512</td><td>zig-zags across, still shrinks</td></tr>
    <tr><td>1.0</td><td>−1</td><td>1, −1, 1, −1</td><td>bounces forever</td></tr>
    <tr><td>1.1</td><td>−1.2</td><td>1, −1.2, 1.44, −1.728</td><td><strong>diverges</strong></td></tr>
  </table>
  <p>Convergence needs |1 − 2η| &lt; 1, i.e. 0 &lt; η &lt; 1. Here 2 is the curvature J''(w), so the rule is <strong>η &lt; 2 / curvature</strong>, and the fastest choice is η = 1/curvature.</p>
  <h3>Two parameters: the steepest direction sets the limit</h3>
  <p>For MSE the curvature is the Hessian matrix H = (2/n)XᵀX. For our three points, with columns x and 1: XᵀX = [[Σx², Σx], [Σx, n]] = [[14, 6], [6, 3]]. Its eigenvalues (the curvatures along the bowl's two main axes) solve λ² − 17λ + 6 = 0 (trace 17, determinant 14·3 − 6·6 = 6): λ = (17 ± √265)/2 = 16.64 and 0.36. Multiply by 2/3: H has eigenvalues <strong>L = 11.09</strong> (steep direction) and <strong>μ = 0.24</strong> (shallow direction).</p>
  <ul>
    <li>Stability is decided by the steepest direction: η &lt; 2/L = 2/11.09 = <strong>0.180</strong>.</li>
    <li>Speed along the shallow direction is about (1 − ημ) per step. With η = 0.1 that is 0.976: the error along the valley shrinks only 2.4% per step, which is why w and b crept for hundreds of steps.</li>
    <li>The ratio κ = L/μ = 46 is the <strong>condition number</strong>. Large κ means a long, thin valley and slow gradient descent.</li>
  </ul>
  <div class="fx" data-lang="py">import numpy as np
x = np.array([1.0, 2.0, 3.0]); y = np.array([2.0, 4.0, 5.0])
X = np.c_[x, np.ones(3)]                         # columns: x and a column of 1s (for b)
H = 2 / len(x) * X.T @ X                         # Hessian of the MSE (constant for a quadratic)
eig = np.linalg.eigvalsh(H)
print("X^T X =", (X.T @ X).tolist(), " Hessian eigenvalues =", eig.round(3))
print("largest stable learning rate 2/L =", round(2 / eig.max(), 4))

def run(lr, steps):
    theta = np.zeros(2); out = []
    for t in range(1, steps + 1):
        theta -= lr * 2 / len(x) * X.T @ (X @ theta - y)
        if t in (1, 5, 20, 100, 500):
            out.append(((X @ theta - y) ** 2).mean())
    return out

J_best = 1 / 18                                  # cost at the exact solution (w=1.5, b=2/3)
print("\\nextra cost J - J_best after t steps")
print("  lr        t=1        t=5       t=20      t=100      t=500")
for lr in [0.01, 0.1, 0.17, 0.19]:
    print(f"{lr:5}" + "".join(f"{J - J_best:11.2e}" for J in run(lr, 500)))</div>
  <div class="fx" data-lang="text">X^T X = [[14.0, 6.0], [6.0, 3.0]]  Hessian eigenvalues = [ 0.24  11.093]
largest stable learning rate 2/L = 0.1803

extra cost J - J_best after t steps
  lr        t=1        t=5       t=20      t=100      t=500
 0.01   1.18e+01   4.61e+00   1.36e-01   2.89e-06   4.21e-07
  0.1   1.79e-01   3.67e-06   1.77e-06   3.60e-08   1.73e-16
 0.17   1.17e+01   4.44e+00   1.17e-01   1.55e-09   6.94e-18
 0.19   1.83e+01   4.15e+01   8.93e+02   1.14e+10   3.81e+45</div>
  <figure class="viz"><svg viewBox="0 0 620 255" width="620">
<line x1="70" y1="215" x2="570" y2="215" stroke="currentColor" opacity="0.5"/>
<line x1="70" y1="25" x2="70" y2="215" stroke="currentColor" opacity="0.5"/>
<text x="70" y="229" text-anchor="middle" class="tm" font-size="10.5">1</text>
<line x1="70" y1="215" x2="70" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="150.5" y="229" text-anchor="middle" class="tm" font-size="10.5">25</text>
<line x1="150.5" y1="215" x2="150.5" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="234.4" y="229" text-anchor="middle" class="tm" font-size="10.5">50</text>
<line x1="234.4" y1="215" x2="234.4" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="318.3" y="229" text-anchor="middle" class="tm" font-size="10.5">75</text>
<line x1="318.3" y1="215" x2="318.3" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="402.2" y="229" text-anchor="middle" class="tm" font-size="10.5">100</text>
<line x1="402.2" y1="215" x2="402.2" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="486.1" y="229" text-anchor="middle" class="tm" font-size="10.5">125</text>
<line x1="486.1" y1="215" x2="486.1" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="570" y="229" text-anchor="middle" class="tm" font-size="10.5">150</text>
<line x1="570" y1="215" x2="570" y2="218" stroke="currentColor" opacity="0.5"/>
<text x="65" y="218.5" text-anchor="end" class="tm" font-size="10.5">1e-12</text>
<line x1="67" y1="215" x2="70" y2="215" stroke="currentColor" opacity="0.5"/>
<text x="65" y="171" text-anchor="end" class="tm" font-size="10.5">1e-8</text>
<line x1="67" y1="167.5" x2="70" y2="167.5" stroke="currentColor" opacity="0.5"/>
<text x="65" y="123.5" text-anchor="end" class="tm" font-size="10.5">1e-4</text>
<line x1="67" y1="120" x2="70" y2="120" stroke="currentColor" opacity="0.5"/>
<text x="65" y="76" text-anchor="end" class="tm" font-size="10.5">1</text>
<line x1="67" y1="72.5" x2="70" y2="72.5" stroke="currentColor" opacity="0.5"/>
<text x="65" y="28.5" text-anchor="end" class="tm" font-size="10.5">1e4</text>
<line x1="67" y1="25" x2="70" y2="25" stroke="currentColor" opacity="0.5"/>
<polyline points="70,59.8 73.4,61 76.7,62.2 80.1,63.4 83.4,64.6 86.8,65.8 90.1,67 93.5,68.3 96.8,69.5 100.2,70.7 103.6,71.9 106.9,73.1 110.3,74.3 113.6,75.5 117,76.7 120.3,78 123.7,79.2 127,80.4 130.4,81.6 133.8,82.8 137.1,84 140.5,85.2 143.8,86.4 147.2,87.7 150.5,88.9 153.9,90.1 157.2,91.3 160.6,92.5 164,93.7 167.3,94.9 170.7,96.1 174,97.4 177.4,98.6 180.7,99.8 184.1,101 187.4,102.2 190.8,103.4 194.2,104.6 197.5,105.8 200.9,107 204.2,108.3 207.6,109.5 210.9,110.7 214.3,111.9 217.7,113.1 221,114.3 224.4,115.5 227.7,116.7 231.1,117.9 234.4,119 237.8,120.2 241.1,121.4 244.5,122.5 247.9,123.7 251.2,124.8 254.6,125.9 257.9,126.9 261.3,128 264.6,129 268,129.9 271.3,130.8 274.7,131.7 278.1,132.4 281.4,133.2 284.8,133.8 288.1,134.4 291.5,134.9 294.8,135.4 298.2,135.8 301.5,136.1 304.9,136.4 308.3,136.6 311.6,136.8 315,137 318.3,137.2 321.7,137.3 325,137.4 328.4,137.5 331.7,137.6 335.1,137.6 338.5,137.7 341.8,137.7 345.2,137.8 348.5,137.8 351.9,137.9 355.2,137.9 358.6,137.9 361.9,138 365.3,138 368.7,138 372,138 375.4,138.1 378.7,138.1 382.1,138.1 385.4,138.1 388.8,138.2 392.1,138.2 395.5,138.2 398.9,138.3 402.2,138.3 405.6,138.3 408.9,138.3 412.3,138.4 415.6,138.4 419,138.4 422.3,138.4 425.7,138.5 429.1,138.5 432.4,138.5 435.8,138.5 439.1,138.6 442.5,138.6 445.8,138.6 449.2,138.6 452.6,138.7 455.9,138.7 459.3,138.7 462.6,138.7 466,138.7 469.3,138.8 472.7,138.8 476,138.8 479.4,138.8 482.8,138.9 486.1,138.9 489.5,138.9 492.8,138.9 496.2,139 499.5,139 502.9,139 506.2,139 509.6,139.1 513,139.1 516.3,139.1 519.7,139.1 523,139.2 526.4,139.2 529.7,139.2 533.1,139.2 536.4,139.3 539.8,139.3 543.2,139.3 546.5,139.3 549.9,139.4 553.2,139.4 556.6,139.4 559.9,139.4 563.3,139.5 566.6,139.5 570,139.5" fill="none" class="st" stroke-width="2"/>
<text x="300" y="66" class="tm" font-size="11.5">teal: η = 0.01 (too small: slow)</text>
<polyline points="70,81.4 73.4,104.2 76.7,126.3 80.1,136.4 83.4,137 86.8,137.3 90.1,137.6 93.5,137.8 96.8,138.1 100.2,138.3 103.6,138.6 106.9,138.8 110.3,139.1 113.6,139.3 117,139.6 120.3,139.8 123.7,140.1 127,140.3 130.4,140.6 133.8,140.8 137.1,141.1 140.5,141.3 143.8,141.6 147.2,141.8 150.5,142.1 153.9,142.3 157.2,142.6 160.6,142.8 164,143.1 167.3,143.3 170.7,143.6 174,143.8 177.4,144.1 180.7,144.3 184.1,144.6 187.4,144.8 190.8,145.1 194.2,145.3 197.5,145.6 200.9,145.8 204.2,146.1 207.6,146.3 210.9,146.6 214.3,146.8 217.7,147.1 221,147.3 224.4,147.6 227.7,147.8 231.1,148.1 234.4,148.3 237.8,148.6 241.1,148.8 244.5,149.1 247.9,149.3 251.2,149.6 254.6,149.9 257.9,150.1 261.3,150.4 264.6,150.6 268,150.9 271.3,151.1 274.7,151.4 278.1,151.6 281.4,151.9 284.8,152.1 288.1,152.4 291.5,152.6 294.8,152.9 298.2,153.1 301.5,153.4 304.9,153.6 308.3,153.9 311.6,154.1 315,154.4 318.3,154.6 321.7,154.9 325,155.1 328.4,155.4 331.7,155.6 335.1,155.9 338.5,156.1 341.8,156.4 345.2,156.6 348.5,156.9 351.9,157.1 355.2,157.4 358.6,157.6 361.9,157.9 365.3,158.1 368.7,158.4 372,158.6 375.4,158.9 378.7,159.1 382.1,159.4 385.4,159.6 388.8,159.9 392.1,160.1 395.5,160.4 398.9,160.6 402.2,160.9 405.6,161.1 408.9,161.4 412.3,161.6 415.6,161.9 419,162.1 422.3,162.4 425.7,162.7 429.1,162.9 432.4,163.2 435.8,163.4 439.1,163.7 442.5,163.9 445.8,164.2 449.2,164.4 452.6,164.7 455.9,164.9 459.3,165.2 462.6,165.4 466,165.7 469.3,165.9 472.7,166.2 476,166.4 479.4,166.7 482.8,166.9 486.1,167.2 489.5,167.4 492.8,167.7 496.2,167.9 499.5,168.2 502.9,168.4 506.2,168.7 509.6,168.9 513,169.2 516.3,169.4 519.7,169.7 523,169.9 526.4,170.2 529.7,170.4 533.1,170.7 536.4,170.9 539.8,171.2 543.2,171.4 546.5,171.7 549.9,171.9 553.2,172.2 556.6,172.4 559.9,172.7 563.3,172.9 566.6,173.2 570,173.4" fill="none" class="sb" stroke-width="2"/>
<text x="300" y="98" class="tb" font-size="11.5">blue: η = 0.1 (good)</text>
<polyline points="70,59.8 73.4,61.1 76.7,62.3 80.1,63.6 83.4,64.8 86.8,66.1 90.1,67.3 93.5,68.6 96.8,69.8 100.2,71.1 103.6,72.3 106.9,73.6 110.3,74.8 113.6,76.1 117,77.3 120.3,78.6 123.7,79.8 127,81.1 130.4,82.3 133.8,83.6 137.1,84.8 140.5,86.1 143.8,87.3 147.2,88.6 150.5,89.8 153.9,91.1 157.2,92.3 160.6,93.6 164,94.8 167.3,96.1 170.7,97.3 174,98.6 177.4,99.8 180.7,101.1 184.1,102.3 187.4,103.6 190.8,104.8 194.2,106.1 197.5,107.3 200.9,108.6 204.2,109.8 207.6,111.1 210.9,112.3 214.3,113.6 217.7,114.8 221,116.1 224.4,117.3 227.7,118.6 231.1,119.8 234.4,121.1 237.8,122.3 241.1,123.6 244.5,124.8 247.9,126.1 251.2,127.3 254.6,128.6 257.9,129.8 261.3,131.1 264.6,132.3 268,133.6 271.3,134.8 274.7,136.1 278.1,137.3 281.4,138.6 284.8,139.8 288.1,141 291.5,142.3 294.8,143.5 298.2,144.8 301.5,146 304.9,147.2 308.3,148.5 311.6,149.7 315,150.9 318.3,152.1 321.7,153.3 325,154.5 328.4,155.7 331.7,156.9 335.1,158.1 338.5,159.3 341.8,160.4 345.2,161.6 348.5,162.7 351.9,163.8 355.2,164.9 358.6,165.9 361.9,167 365.3,168 368.7,169 372,169.9 375.4,170.9 378.7,171.8 382.1,172.6 385.4,173.4 388.8,174.2 392.1,175 395.5,175.7 398.9,176.4 402.2,177.1 405.6,177.8 408.9,178.4 412.3,179 415.6,179.6 419,180.1 422.3,180.7 425.7,181.2 429.1,181.7 432.4,182.2 435.8,182.7 439.1,183.2 442.5,183.7 445.8,184.2 449.2,184.6 452.6,185.1 455.9,185.6 459.3,186 462.6,186.5 466,186.9 469.3,187.4 472.7,187.8 476,188.2 479.4,188.7 482.8,189.1 486.1,189.6 489.5,190 492.8,190.4 496.2,190.9 499.5,191.3 502.9,191.7 506.2,192.2 509.6,192.6 513,193 516.3,193.5 519.7,193.9 523,194.3 526.4,194.8 529.7,195.2 533.1,195.6 536.4,196 539.8,196.5 543.2,196.9 546.5,197.3 549.9,197.8 553.2,198.2 556.6,198.6 559.9,199.1 563.3,199.5 566.6,199.9 570,200.4" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="5 3"/>
<text x="300" y="82" class="tm" font-size="11.5">dashed: η = 0.17 (zig-zag, converges)</text>
<polyline points="70,57.5 73.4,56.4 76.7,55.4 80.1,54.3 83.4,53.3 86.8,52.2 90.1,51.2 93.5,50.1 96.8,49.1 100.2,48 103.6,47 106.9,45.9 110.3,44.8 113.6,43.8 117,42.7 120.3,41.7 123.7,40.6 127,39.6 130.4,38.5 133.8,37.5 137.1,36.4 140.5,35.4 143.8,34.3 147.2,33.2 150.5,32.2 153.9,31.1 157.2,30.1 160.6,29 164,28 167.3,26.9 170.7,25.9 174,25 177.4,25 180.7,25 184.1,25 187.4,25 190.8,25 194.2,25 197.5,25 200.9,25 204.2,25 207.6,25 210.9,25 214.3,25 217.7,25 221,25 224.4,25 227.7,25 231.1,25 234.4,25 237.8,25 241.1,25 244.5,25 247.9,25 251.2,25 254.6,25 257.9,25 261.3,25 264.6,25 268,25 271.3,25 274.7,25 278.1,25 281.4,25 284.8,25 288.1,25 291.5,25 294.8,25 298.2,25 301.5,25 304.9,25 308.3,25 311.6,25 315,25 318.3,25 321.7,25 325,25 328.4,25 331.7,25 335.1,25 338.5,25 341.8,25 345.2,25 348.5,25 351.9,25 355.2,25 358.6,25 361.9,25 365.3,25 368.7,25 372,25 375.4,25 378.7,25 382.1,25 385.4,25 388.8,25 392.1,25 395.5,25 398.9,25 402.2,25 405.6,25 408.9,25 412.3,25 415.6,25 419,25 422.3,25 425.7,25 429.1,25 432.4,25 435.8,25 439.1,25 442.5,25 445.8,25 449.2,25 452.6,25 455.9,25 459.3,25 462.6,25 466,25 469.3,25 472.7,25 476,25 479.4,25 482.8,25 486.1,25 489.5,25 492.8,25 496.2,25 499.5,25 502.9,25 506.2,25 509.6,25 513,25 516.3,25 519.7,25 523,25 526.4,25 529.7,25 533.1,25 536.4,25 539.8,25 543.2,25 546.5,25 549.9,25 553.2,25 556.6,25 559.9,25 563.3,25 566.6,25 570,25" fill="none" class="sr" stroke-width="2"/>
<text x="300" y="50" class="tr" font-size="11.5">red: η = 0.19 (&gt; 2/L = 0.18: diverges)</text>
<text x="320" y="245" text-anchor="middle" class="tm" font-size="11">step</text>
<text x="18" y="120" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 18 120)">J − J_best (log)</text>
</svg><figcaption>Extra cost above the minimum (log scale) for four learning rates. 0.19 is above the 2/L limit and explodes. 0.01 is safe but crawls. 0.1 drops fast in the steep direction then slides slowly. 0.17 bounces at first but, being larger, also moves faster along the shallow direction and wins in the long run.</figcaption></figure>
  <p>Read the table row by row. η = 0.01: still 4.6 above the minimum after 5 steps. η = 0.1: 3.7×10⁻⁶ after 5. η = 0.17: slow at first (it overshoots back and forth across the steep direction, the red zig-zag in the contour figure), but by step 500 it is the most accurate. η = 0.19: the cost multiplies at every step, reaching 10⁴⁵.</p>
  <h3>Learning-rate schedules (brief)</h3>
  <p>In practice η is often reduced during training: step decay (halve η every k epochs), exponential decay, 1/t decay (sklearn's <code>"invscaling"</code>), or cosine annealing, sometimes after a short warm-up. Large steps early cover distance; small steps late settle into the minimum. For stochastic methods a decaying η is needed for exact convergence (section 12). Details in <a class="xref" data-note="m_optimization">Optimization</a>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>For a quadratic cost (or near a minimum of a smooth cost) with Hessian eigenvalues between μ and L, gradient descent with fixed η converges if and only if 0 &lt; η &lt; 2/L; the error along each eigen-direction shrinks by |1 − ηλ| per step, so the slowest direction contracts by about 1 − ημ, giving roughly κ = L/μ steps per factor of e improvement when η ≈ 1/L.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reading a rising loss as "the model is too simple". If the training loss goes <em>up</em> or turns into <code>nan</code>, the learning rate is almost always too large (or the features are unscaled, which makes L huge). Divide η by 10 and try again before touching anything else.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Our bowl had exactly one bottom, so "keep going downhill" was guaranteed to find it. Is that always true? When can gradient descent get stuck somewhere that is not the best?</div>

  <h2 id="lg-convex"><span class="num">11</span>Convexity</h2>
  <h3>Plain meaning</h3>
  <p>A function is <strong>convex</strong> if it is bowl-shaped everywhere: the straight line (chord) between any two points on the curve lies on or above the curve. A convex function has no false valleys, so <em>any</em> point where the gradient is zero is the global minimum. Gradient descent with a sensible learning rate cannot get trapped.</p>
  <h3>Checking by hand</h3>
  <p>Take J(w) = (w − 3)². At w = 1 and w = 5, J = 4 and 4. The chord's midpoint is at w = 3 with height (4 + 4)/2 = 4. The curve at w = 3 is J(3) = 0 ≤ 4 ✓. A quicker test for smooth functions: the second derivative is ≥ 0 everywhere (here J'' = 2). In many dimensions: the Hessian matrix is positive semi-definite (all eigenvalues ≥ 0).</p>
  <ul>
    <li><strong>MSE for linear regression</strong>: Hessian (2/n)XᵀX, whose eigenvalues are always ≥ 0 (we found 11.09 and 0.24). Convex. If two features are perfectly collinear one eigenvalue is 0: still convex, but the minimum is a whole line of equally good solutions.</li>
    <li><strong>Log-loss for logistic regression</strong>: the second derivative with respect to z is p(1 − p) &gt; 0 (the 0.0025 minimum in section 05's check). Convex.</li>
    <li><strong>Hinge, absolute, Huber</strong>: convex (piecewise linear or quadratic), though not all are smooth.</li>
    <li><strong>Squared loss through a sigmoid</strong>: not convex (negative second derivative −0.119 in section 05).</li>
    <li><strong>Neural networks</strong>: not convex in their weights, whatever the loss, because layers are multiplied together. Many minima and saddle points exist; in practice SGD finds good-enough ones (see <a class="xref" data-note="dl_foundations">Neural Network Foundations</a>).</li>
  </ul>
  <h3>Local minima, plateaus and saddle points</h3>
  <table class="tbl">
    <tr><th>Feature of the landscape</th><th>Gradient there</th><th>Effect on GD</th><th>Possible in a convex cost?</th></tr>
    <tr><td>Global minimum</td><td>0</td><td>the goal</td><td>yes (one value; maybe many θ)</td></tr>
    <tr><td>Local (non-global) minimum</td><td>0</td><td>stuck in a worse solution</td><td>no</td></tr>
    <tr><td>Saddle point (down one way, up another)</td><td>0</td><td>slows down; noise from SGD helps escape</td><td>no</td></tr>
    <tr><td>Plateau</td><td>≈ 0</td><td>very slow progress</td><td>flat regions possible at the minimum only</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>J is <strong>convex</strong> if J(αa + (1 − α)b) ≤ αJ(a) + (1 − α)J(b) for all a, b and α ∈ [0, 1]. For twice-differentiable J this is equivalent to a positive semi-definite Hessian everywhere. <strong>Strictly / strongly convex</strong> (e.g. Hessian eigenvalues ≥ μ &gt; 0) guarantees a unique minimiser and linear convergence of gradient descent. Adding an L2 penalty λ‖w‖² adds 2λ to every Hessian eigenvalue, making a convex cost strongly convex.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Convex means fast." Convexity guarantees you reach the right place, not how quickly. Our convex bowl with κ = 46 still needed hundreds of steps; an unscaled one (section 13) needs millions.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Every step so far used all the training rows to compute the gradient. With 10 million rows that is 10 million calculations for one small step. Could we step after looking at only some of them?</div>

  <h2 id="lg-batch"><span class="num">12</span>Batch vs Stochastic vs Mini-batch</h2>
  <h3>The idea</h3>
  <p>The full gradient is an <em>average</em> of per-row gradients. An average can be estimated from a sample. So instead of all n rows, use a random handful each step: much cheaper per step, slightly noisy in direction.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Deciding which way the crowd is moving at a railway station. Batch: interview all 10,000 passengers before taking one step. SGD: ask one random passenger and step. Mini-batch: ask 32 people. Asking 32 is nearly as reliable as asking 10,000, and you take 300 steps in the time batch takes one.</p>
  </div>
  <h3>By hand: one stochastic step</h3>
  <p>Same three points, start (0, 0), η = 0.08. Pick one row at random, say (3, 5). Its error is 0 − 5 = −5. The one-row gradient (no averaging) is ∂/∂w = 2·(−5)·3 = −30 and ∂/∂b = 2·(−5) = −10. Step: w = 0 + 0.08·30 = <strong>2.4</strong>, b = 0 + 0.08·10 = <strong>0.8</strong>.</p>
  <p>Compare the full-batch gradient at (0, 0): (−16.67, −7.33). The three single-row gradients are (−4, −4) for row (1, 2), (−16, −8) for row (2, 4), and (−30, −10) for row (3, 5). Their average is (−50/3, −22/3) = (−16.67, −7.33) exactly. A random row's gradient is an <strong>unbiased</strong> but noisy estimate of the true gradient.</p>
  <h3>The three variants on 10,000 rows</h3>
  <p>One <strong>epoch</strong> = one pass over all rows. Batch GD makes 1 update per epoch, mini-batch (size 32) makes ⌈10,000/32⌉ = 313, SGD makes 10,000.</p>
  <div class="fx" data-lang="py">import numpy as np

rng = np.random.default_rng(0)
n, d = 10_000, 3
X = rng.normal(size=(n, d))                       # already on similar scales
w_true = np.array([3.0, -2.0, 0.5])
y = X @ w_true + 4.0 + rng.normal(0, 1.0, n)      # intercept 4, noise std 1
Xb = np.c_[X, np.ones(n)]                         # add the 1s column for the intercept

def mse(theta):
    return ((Xb @ theta - y) ** 2).mean()

def train(batch_size, lr, epochs=20, seed=1):
    r = np.random.default_rng(seed)
    theta = np.zeros(d + 1); updates = 0; log = {}
    for epoch in range(1, epochs + 1):
        order = r.permutation(n)                  # shuffle once per epoch
        for start in range(0, n, batch_size):
            idx = order[start:start + batch_size]
            g = 2 / len(idx) * Xb[idx].T @ (Xb[idx] @ theta - y[idx])   # gradient on this batch
            theta -= lr * g
            updates += 1
        if epoch in (1, 5, 20):
            log[epoch] = (mse(theta), updates)
    return theta, log

for name, bs, lr in [("batch GD (all 10,000)", n, 0.1), ("mini-batch (32)", 32, 0.01), ("SGD (1 row)", 1, 0.001)]:
    theta, log = train(bs, lr)
    print(f"{name}, lr={lr}")
    for e, (m, u) in log.items():
        print(f"   after epoch {e:2d}: {u:6d} updates, MSE = {m:.4f}")
    print(f"   final weights {theta.round(3)}")
best = np.linalg.lstsq(Xb, y, rcond=None)[0]
print("exact least squares:", best.round(3), " MSE =", round(mse(best), 4))</div>
  <div class="fx" data-lang="text">batch GD (all 10,000), lr=0.1
   after epoch  1:      1 updates, MSE = 19.7733
   after epoch  5:      5 updates, MSE = 4.1329
   after epoch 20:     20 updates, MSE = 1.0357
   final weights [ 2.966 -1.972  0.479  3.952]
mini-batch (32), lr=0.01
   after epoch  1:    313 updates, MSE = 1.0323
   after epoch  5:   1565 updates, MSE = 1.0346
   after epoch 20:   6260 updates, MSE = 1.0331
   final weights [ 2.981 -1.972  0.474  4.006]
SGD (1 row), lr=0.001
   after epoch  1:  10000 updates, MSE = 1.0334
   after epoch  5:  50000 updates, MSE = 1.0395
   after epoch 20: 200000 updates, MSE = 1.0384
   final weights [ 2.937 -1.955  0.455  4.013]
exact least squares: [ 2.998 -1.997  0.481  3.997]  MSE = 1.032</div>
  <ul>
    <li>After <strong>one epoch</strong> (the same amount of arithmetic), batch GD is at MSE 19.77, while mini-batch and SGD are already at about 1.03, the noise level. Many cheap noisy steps beat one exact step.</li>
    <li><strong>But</strong> with a constant learning rate the stochastic versions never settle: SGD's MSE wanders (1.033 → 1.040 → 1.038) and its weights are visibly off (2.937 vs 2.998). The noise in each step keeps kicking it around the bottom, as in the right panel of the contour figure. A decaying learning rate fixes this.</li>
    <li>Batch GD, given enough epochs, converges smoothly to the exact answer.</li>
  </ul>
  <p>sklearn's <code>SGDRegressor</code> and <code>SGDClassifier</code> implement SGD with a decaying schedule, and the loss is a single argument. Scale first (section 13):</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import SGDRegressor, SGDClassifier, LinearRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(0)
X = rng.normal(size=(10_000, 3))
y = X @ np.array([3.0, -2.0, 0.5]) + 4.0 + rng.normal(0, 1.0, 10_000)

sgd = make_pipeline(StandardScaler(),
                    SGDRegressor(loss="squared_error", penalty=None, learning_rate="invscaling",
                                 eta0=0.01, max_iter=50, tol=1e-6, random_state=0))
sgd.fit(X, y)
reg = sgd[-1]; sc = sgd[0]
print("SGDRegressor coef (original units):", (reg.coef_ / sc.scale_).round(3), " epochs run:", reg.n_iter_)
print("LinearRegression coef             :", LinearRegression().fit(X, y).coef_.round(3))

# the same class of model, different losses: just change one argument
for loss in ["hinge", "log_loss", "modified_huber"]:
    clf = SGDClassifier(loss=loss, random_state=0).fit(X, (y &gt; 4).astype(int))
    print(f"SGDClassifier loss={loss:15s} train accuracy = {clf.score(X, (y &gt; 4).astype(int)):.3f}")</div>
  <div class="fx" data-lang="text">SGDRegressor coef (original units): [ 3.012 -1.992  0.494]  epochs run: 9
LinearRegression coef             : [ 2.998 -1.997  0.481]
SGDClassifier loss=hinge           train accuracy = 0.915
SGDClassifier loss=log_loss        train accuracy = 0.915
SGDClassifier loss=modified_huber  train accuracy = 0.911</div>
  <p><code>loss="hinge"</code> gives a linear SVM, <code>"log_loss"</code> a logistic regression, <code>"modified_huber"</code> a smoothed hinge: one optimiser, many models. The coefficients are divided by the scaler's <code>scale_</code> to compare them with the unscaled <code>LinearRegression</code>.</p>
  <table class="tbl">
    <tr><th></th><th>Batch GD</th><th>Stochastic GD</th><th>Mini-batch GD</th></tr>
    <tr><td>Rows per update</td><td>all n</td><td>1</td><td>b (typically 32–512)</td></tr>
    <tr><td>Cost per update</td><td>O(n·d)</td><td>O(d)</td><td>O(b·d)</td></tr>
    <tr><td>Updates per epoch</td><td>1</td><td>n</td><td>n / b</td></tr>
    <tr><td>Gradient noise</td><td>none</td><td>high</td><td>medium, shrinks like 1/√b</td></tr>
    <tr><td>Converges with fixed η?</td><td>yes (η &lt; 2/L)</td><td>to a noisy region</td><td>to a smaller noisy region</td></tr>
    <tr><td>Hardware</td><td>memory for all rows</td><td>poor vectorisation</td><td>fits GPU / vector units well</td></tr>
    <tr><td>Data streams / huge data</td><td>no</td><td>yes (online learning)</td><td>yes</td></tr>
    <tr><td>Typical use</td><td>small convex problems</td><td>online updates</td><td>default for deep learning and large data</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>The noise of SGD is not only a cost. In non-convex problems it helps escape saddle points and sharp minima, and it is believed to act as a mild regularizer. That is one reason deep learning uses small mini-batches even when larger ones would fit in memory.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Stochastic gradient descent</strong>: at step t sample a mini-batch B<sub>t</sub> and update θ ← θ − η<sub>t</sub>·(1/|B<sub>t</sub>|) Σ<sub>i∈B<sub>t</sub></sub> ∇L<sub>i</sub>(θ). With |B| = 1 it is pure SGD; with |B| = n it is batch GD. For convergence to the exact minimum the step sizes must decay, e.g. Σ η<sub>t</sub> = ∞ and Σ η<sub>t</sub>² &lt; ∞ (η<sub>t</sub> ∝ 1/t satisfies both).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Not shuffling. If the rows are sorted (by date, by class), consecutive mini-batches are not random samples: the model chases one class, then the next. Shuffle every epoch (the code does <code>r.permutation(n)</code>). Also: when you change the batch size, retune the learning rate; larger batches usually allow a larger η.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We kept saying "scale first". The three toy features were already on similar scales. What actually happens to gradient descent when one feature is in thousands and another in single digits?</div>

  <h2 id="lg-scale"><span class="num">13</span>Feature Scaling and Convergence</h2>
  <h3>Why scale changes the shape of the bowl</h3>
  <p>For MSE, the curvature along feature j is about 2·(average of xⱼ²). House size in square feet has a standard deviation of about 720; number of rooms about 1.18. Even ignoring the intercept and correlations, the curvature ratio is (720.49 / 1.18)² = 519,106 / 1.39 ≈ <strong>373,000</strong>. The bowl is a canyon: extremely steep across "size", almost flat along "rooms".</p>
  <p>The learning rate must stay below 2/L for the steep direction (size), so along the flat direction (rooms) each step moves almost nothing. Gradient descent zig-zags across the canyon and crawls along it.</p>
  <figure class="viz"><svg viewBox="0 0 660 215" width="660">
<line x1="40" y1="180" x2="290" y2="180" stroke="currentColor" opacity="0.5"/>
<line x1="40" y1="30" x2="40" y2="180" stroke="currentColor" opacity="0.5"/>
<polyline points="178.2,105 178.1,104.7 178,104.4 177.8,104.2 177.5,103.9 177.1,103.6 176.7,103.4 176.2,103.1 175.6,102.9 174.9,102.7 174.2,102.5 173.4,102.3 172.6,102.1 171.7,102 170.8,101.8 169.9,101.7 168.9,101.6 167.9,101.5 166.8,101.5 165.8,101.5 164.7,101.5 163.7,101.5 162.7,101.5 161.6,101.6 160.6,101.7 159.7,101.8 158.7,101.9 157.8,102 157,102.2 156.2,102.4 155.4,102.6 154.7,102.8 154.1,103 153.5,103.3 153.1,103.5 152.7,103.8 152.3,104 152.1,104.3 151.9,104.6 151.8,104.9 151.8,105.1 151.9,105.4 152.1,105.7 152.3,106 152.7,106.2 153.1,106.5 153.5,106.7 154.1,107 154.7,107.2 155.4,107.4 156.2,107.6 157,107.8 157.8,108 158.7,108.1 159.7,108.2 160.6,108.3 161.6,108.4 162.7,108.5 163.7,108.5 164.7,108.5 165.8,108.5 166.8,108.5 167.9,108.5 168.9,108.4 169.9,108.3 170.8,108.2 171.7,108 172.6,107.9 173.4,107.7 174.2,107.5 174.9,107.3 175.6,107.1 176.2,106.9 176.7,106.6 177.1,106.4 177.5,106.1 177.8,105.8 178,105.6 178.1,105.3 178.2,105" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="197.3,105 197.2,104.3 196.9,103.6 196.4,103 195.7,102.3 194.8,101.6 193.7,101 192.4,100.4 191,99.9 189.4,99.3 187.6,98.8 185.7,98.4 183.7,97.9 181.5,97.6 179.3,97.2 176.9,97 174.5,96.7 172,96.5 169.5,96.4 166.9,96.4 164.4,96.3 161.8,96.4 159.3,96.5 156.8,96.6 154.3,96.8 151.9,97.1 149.6,97.4 147.4,97.7 145.3,98.1 143.3,98.6 141.5,99.1 139.8,99.6 138.3,100.1 136.9,100.7 135.8,101.3 134.8,102 134,102.6 133.4,103.3 133,104 132.8,104.7 132.8,105.3 133,106 133.4,106.7 134,107.4 134.8,108 135.8,108.7 136.9,109.3 138.3,109.9 139.8,110.4 141.5,110.9 143.3,111.4 145.3,111.9 147.4,112.3 149.6,112.6 151.9,112.9 154.3,113.2 156.8,113.4 159.3,113.5 161.8,113.6 164.4,113.7 166.9,113.6 169.5,113.6 172,113.5 174.5,113.3 176.9,113 179.3,112.8 181.5,112.4 183.7,112.1 185.7,111.6 187.6,111.2 189.4,110.7 191,110.1 192.4,109.6 193.7,109 194.8,108.4 195.7,107.7 196.4,107 196.9,106.4 197.2,105.7 197.3,105" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="223.9,105 223.7,103.7 223.2,102.5 222.3,101.3 221,100.1 219.3,98.9 217.3,97.7 215,96.6 212.4,95.6 209.5,94.6 206.3,93.7 202.8,92.9 199.1,92.1 195.1,91.4 191,90.8 186.7,90.3 182.3,89.9 177.8,89.6 173.2,89.3 168.5,89.2 163.8,89.2 159.2,89.3 154.5,89.4 149.9,89.7 145.5,90.1 141.1,90.5 136.9,91.1 132.9,91.7 129.1,92.5 125.5,93.3 122.1,94.2 119,95.1 116.3,96.1 113.8,97.2 111.6,98.3 109.8,99.5 108.3,100.7 107.2,101.9 106.5,103.1 106.1,104.4 106.1,105.6 106.5,106.9 107.2,108.1 108.3,109.3 109.8,110.5 111.6,111.7 113.8,112.8 116.3,113.9 119,114.9 122.1,115.8 125.5,116.7 129.1,117.5 132.9,118.3 136.9,118.9 141.1,119.5 145.5,119.9 149.9,120.3 154.5,120.6 159.2,120.7 163.8,120.8 168.5,120.8 173.2,120.7 177.8,120.4 182.3,120.1 186.7,119.7 191,119.2 195.1,118.6 199.1,117.9 202.8,117.1 206.3,116.3 209.5,115.4 212.4,114.4 215,113.4 217.3,112.3 219.3,111.1 221,109.9 222.3,108.7 223.2,107.5 223.7,106.3 223.9,105" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="258.2,105 257.9,103 257,101 255.5,99.1 253.5,97.2 250.9,95.3 247.8,93.5 244.1,91.8 239.9,90.1 235.3,88.6 230.2,87.1 224.7,85.8 218.9,84.6 212.7,83.5 206.1,82.6 199.4,81.8 192.4,81.1 185.2,80.6 177.9,80.2 170.6,80 163.1,80 155.8,80.1 148.4,80.4 141.2,80.8 134.1,81.4 127.2,82.1 120.6,83 114.2,84 108.2,85.2 102.5,86.5 97.2,87.9 92.3,89.4 87.9,91 84,92.6 80.6,94.4 77.7,96.2 75.4,98.1 73.7,100.1 72.5,102 71.9,104 71.9,106 72.5,108 73.7,109.9 75.4,111.9 77.7,113.8 80.6,115.6 84,117.4 87.9,119 92.3,120.6 97.2,122.1 102.5,123.5 108.2,124.8 114.2,126 120.6,127 127.2,127.9 134.1,128.6 141.2,129.2 148.4,129.6 155.8,129.9 163.1,130 170.6,130 177.9,129.8 185.2,129.4 192.4,128.9 199.4,128.2 206.1,127.4 212.7,126.5 218.9,125.4 224.7,124.2 230.2,122.9 235.3,121.4 239.9,119.9 244.1,118.2 247.8,116.5 250.9,114.7 253.5,112.8 255.5,110.9 257,109 257.9,107 258.2,105" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="286.5,91.3 282,88.8 276.9,86.3 271,84 264.4,81.8 257.2,79.8 249.5,77.9 241.2,76.2 232.4,74.6 223.2,73.3 213.6,72.1 203.7,71.2 193.6,70.5 183.3,70 172.9,69.7 162.4,69.7 151.9,69.8 141.5,70.2 131.3,70.8 121.3,71.6 111.6,72.7 102.2,73.9 93.2,75.4 84.6,77 76.6,78.8 69.1,80.8 62.2,82.9 56,85.1 50.5,87.5 45.6,90 41.6,92.6" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="41.6,117.4 45.6,120 50.5,122.5 56,124.9 62.2,127.1 69.1,129.2 76.6,131.2 84.6,133 93.2,134.6 102.2,136.1 111.6,137.3 121.3,138.4 131.3,139.2 141.5,139.8 151.9,140.2 162.4,140.3 172.9,140.3 183.3,140 193.6,139.5 203.7,138.8 213.6,137.9 223.2,136.7 232.4,135.4 241.2,133.8 249.5,132.1 257.2,130.2 264.4,128.2 271,126 276.9,123.7 282,121.2 286.5,118.7" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="56.7,60 66.4,141 75.3,76.2 83.4,128 90.7,86.6 97.4,119.7 103.5,93.2 109,114.4 114.1,97.5 118.6,111 122.8,100.2 126.6,108.9 130.1,101.9 133.2,107.5 136.1,103 138.7,106.6 141,103.7 143.2,106 145.2,104.2 146.9,105.6 148.6,104.5 150.1,105.4 151.4,104.7 152.6,105.3 153.7,104.8 154.7,105.2" fill="none" class="sr" stroke-width="1.8"/>
<circle cx="56.7" cy="60" r="2.4" class="tr"/>
<circle cx="66.4" cy="141" r="2.4" class="tr"/>
<circle cx="75.3" cy="76.2" r="2.4" class="tr"/>
<circle cx="83.4" cy="128" r="2.4" class="tr"/>
<circle cx="90.7" cy="86.6" r="2.4" class="tr"/>
<circle cx="97.4" cy="119.7" r="2.4" class="tr"/>
<circle cx="103.5" cy="93.2" r="2.4" class="tr"/>
<circle cx="109" cy="114.4" r="2.4" class="tr"/>
<circle cx="114.1" cy="97.5" r="2.4" class="tr"/>
<circle cx="118.6" cy="111" r="2.4" class="tr"/>
<circle cx="122.8" cy="100.2" r="2.4" class="tr"/>
<circle cx="126.6" cy="108.9" r="2.4" class="tr"/>
<circle cx="130.1" cy="101.9" r="2.4" class="tr"/>
<circle cx="133.2" cy="107.5" r="2.4" class="tr"/>
<circle cx="136.1" cy="103" r="2.4" class="tr"/>
<circle cx="138.7" cy="106.6" r="2.4" class="tr"/>
<circle cx="141" cy="103.7" r="2.4" class="tr"/>
<circle cx="143.2" cy="106" r="2.4" class="tr"/>
<circle cx="145.2" cy="104.2" r="2.4" class="tr"/>
<circle cx="146.9" cy="105.6" r="2.4" class="tr"/>
<circle cx="148.6" cy="104.5" r="2.4" class="tr"/>
<circle cx="150.1" cy="105.4" r="2.4" class="tr"/>
<circle cx="151.4" cy="104.7" r="2.4" class="tr"/>
<circle cx="152.6" cy="105.3" r="2.4" class="tr"/>
<circle cx="153.7" cy="104.8" r="2.4" class="tr"/>
<circle cx="154.7" cy="105.2" r="2.4" class="tr"/>
<text x="165" y="22" text-anchor="middle" font-size="12.5" font-weight="700">unscaled: long narrow valley</text>
<line x1="370" y1="180" x2="620" y2="180" stroke="currentColor" opacity="0.5"/>
<line x1="370" y1="30" x2="370" y2="180" stroke="currentColor" opacity="0.5"/>
<polyline points="508.2,105 508.1,103.9 508,102.8 507.8,101.7 507.5,100.7 507.1,99.6 506.7,98.6 506.2,97.7 505.6,96.8 504.9,95.9 504.2,95.1 503.4,94.4 502.6,93.7 501.7,93.1 500.8,92.6 499.9,92.1 498.9,91.7 497.9,91.5 496.8,91.3 495.8,91.2 494.7,91.1 493.7,91.2 492.7,91.4 491.6,91.6 490.6,91.9 489.7,92.3 488.7,92.8 487.8,93.4 487,94 486.2,94.7 485.4,95.5 484.7,96.3 484.1,97.2 483.5,98.1 483.1,99.1 482.7,100.1 482.3,101.2 482.1,102.3 481.9,103.3 481.8,104.4 481.8,105.6 481.9,106.7 482.1,107.7 482.3,108.8 482.7,109.9 483.1,110.9 483.5,111.9 484.1,112.8 484.7,113.7 485.4,114.5 486.2,115.3 487,116 487.8,116.6 488.7,117.2 489.7,117.7 490.6,118.1 491.6,118.4 492.7,118.6 493.7,118.8 494.7,118.9 495.8,118.8 496.8,118.7 497.9,118.5 498.9,118.3 499.9,117.9 500.8,117.4 501.7,116.9 502.6,116.3 503.4,115.6 504.2,114.9 504.9,114.1 505.6,113.2 506.2,112.3 506.7,111.4 507.1,110.4 507.5,109.3 507.8,108.3 508,107.2 508.1,106.1 508.2,105" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="527.3,105 527.2,102.3 526.9,99.6 526.4,97 525.7,94.4 524.8,91.8 523.7,89.4 522.4,87.1 521,84.8 519.4,82.7 517.6,80.7 515.7,78.9 513.7,77.3 511.5,75.8 509.3,74.5 506.9,73.4 504.5,72.5 502,71.8 499.5,71.4 496.9,71.1 494.4,71 491.8,71.2 489.3,71.6 486.8,72.2 484.3,73 481.9,74 479.6,75.1 477.4,76.5 475.3,78.1 473.3,79.8 471.5,81.7 469.8,83.7 468.3,85.9 466.9,88.2 465.8,90.6 464.8,93.1 464,95.7 463.4,98.3 463,101 462.8,103.6 462.8,106.4 463,109 463.4,111.7 464,114.3 464.8,116.9 465.8,119.4 466.9,121.8 468.3,124.1 469.8,126.3 471.5,128.3 473.3,130.2 475.3,131.9 477.4,133.5 479.6,134.9 481.9,136 484.3,137 486.8,137.8 489.3,138.4 491.8,138.8 494.4,139 496.9,138.9 499.5,138.6 502,138.2 504.5,137.5 506.9,136.6 509.3,135.5 511.5,134.2 513.7,132.7 515.7,131.1 517.6,129.3 519.4,127.3 521,125.2 522.4,122.9 523.7,120.6 524.8,118.2 525.7,115.6 526.4,113 526.9,110.4 527.2,107.7 527.3,105" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="553.9,105 553.7,100.1 553.2,95.2 552.3,90.3 551,85.6 549.3,81 547.3,76.5 545,72.2 542.4,68.1 539.5,64.3 536.3,60.7 532.8,57.4 529.1,54.4 525.1,51.7 521,49.4 516.7,47.4 512.3,45.7 507.8,44.5 503.2,43.6 498.5,43.1 493.8,43 489.2,43.3 484.5,44 479.9,45 475.5,46.5 471.1,48.3 466.9,50.5 462.9,53 459.1,55.9 455.5,59 452.1,62.5 449,66.2 446.3,70.2 443.8,74.3 441.6,78.7 439.8,83.3 438.3,88 437.2,92.7 436.5,97.6 436.1,102.5 436.1,107.5 436.5,112.4 437.2,117.3 438.3,122 439.8,126.7 441.6,131.3 443.8,135.7 446.3,139.8 449,143.8 452.1,147.5 455.5,151 459.1,154.1 462.9,157 466.9,159.5 471.1,161.7 475.5,163.5 479.9,165 484.5,166 489.2,166.7 493.8,167 498.5,166.9 503.2,166.4 507.8,165.5 512.3,164.3 516.7,162.6 521,160.6 525.1,158.3 529.1,155.6 532.8,152.6 536.3,149.3 539.5,145.7 542.4,141.9 545,137.8 547.3,133.5 549.3,129 551,124.4 552.3,119.7 553.2,114.8 553.7,109.9 553.9,105" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="588.2,105 587.9,97.2 587,89.5 585.5,81.8 583.5,74.3 580.9,67 577.8,60 574.1,53.2 569.9,46.7 565.3,40.7 560.2,35" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="432.5,32.3 427.2,37.8 422.3,43.6 417.9,49.9 414,56.5 410.6,63.5 407.7,70.6 405.4,78.1 403.7,85.6 402.5,93.3 401.9,101.1 401.9,108.9 402.5,116.7 403.7,124.4 405.4,131.9 407.7,139.4 410.6,146.5 414,153.5 417.9,160.1 422.3,166.4 427.2,172.2 432.5,177.7" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="560.2,175 565.3,169.3 569.9,163.3 574.1,156.8 577.8,150 580.9,143 583.5,135.7 585.5,128.2 587,120.5 587.9,112.8 588.2,105" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="616.5,51.3 612,41.3 606.9,31.7" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="380.5,36.5 375.6,46.3 371.6,56.4" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="371.6,153.6 375.6,163.7 380.5,173.5" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="606.9,178.3 612,168.7 616.5,158.7" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="386.7,60 462.5,101 485.2,104.6 492.1,105 494.1,105 494.7,105 494.9,105" fill="none" class="sr" stroke-width="1.8"/>
<circle cx="386.7" cy="60" r="2.4" class="tr"/>
<circle cx="462.5" cy="101" r="2.4" class="tr"/>
<circle cx="485.2" cy="104.6" r="2.4" class="tr"/>
<circle cx="492.1" cy="105" r="2.4" class="tr"/>
<circle cx="494.1" cy="105" r="2.4" class="tr"/>
<circle cx="494.7" cy="105" r="2.4" class="tr"/>
<circle cx="494.9" cy="105" r="2.4" class="tr"/>
<text x="495" y="22" text-anchor="middle" font-size="12.5" font-weight="700">standardized: round bowl</text>
<text x="165" y="205" text-anchor="middle" class="tm" font-size="11">25 steps: zig-zag, still creeping in</text><text x="495" y="205" text-anchor="middle" class="tm" font-size="11">6 steps, almost straight to the centre</text>
</svg><figcaption>Same algorithm, same number of steps. Left: an elongated bowl (curvatures 1 and 20) forces a small step size and a zig-zag path. Right: after standardization the bowl is nearly round and gradient descent heads almost straight for the centre.</figcaption></figure>
  <h3>Measured</h3>
  <p>500 flats, price = 0.05·size + 2·rooms + 5 + noise. Gradient descent with its best safe step (η = 1/L), raw vs standardized features, counting steps until the cost is within one part per million of the exact minimum:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(0)
n = 500
size = rng.uniform(500, 3000, n)                          # sq ft
rooms = np.clip(np.round(size / 700 + rng.normal(0, 0.7, n)), 1, 5)
price = 0.05 * size + 2.0 * rooms + 5 + rng.normal(0, 5, n)  # lakh rupees

def gd_steps(X, y, max_steps=100_000, tol=1e-6):
    Xb = np.c_[X, np.ones(len(y))]
    H = 2 / len(y) * Xb.T @ Xb
    eig = np.linalg.eigvalsh(H)
    lr = 1 / eig.max()                                    # a safe step for this bowl
    best = np.linalg.lstsq(Xb, y, rcond=None)[0]
    J_best = ((Xb @ best - y) ** 2).mean()
    theta = np.zeros(Xb.shape[1])
    for t in range(1, max_steps + 1):
        theta -= lr * 2 / len(y) * Xb.T @ (Xb @ theta - y)
        if ((Xb @ theta - y) ** 2).mean() - J_best &lt; tol * J_best:
            return t, eig.max() / eig.min()
    return f"&gt;{max_steps}", eig.max() / eig.min()

X_raw = np.c_[size, rooms]
X_std = StandardScaler().fit_transform(X_raw)
print("feature std (raw):", X_raw.std(axis=0).round(2))
for name, X in [("raw features", X_raw), ("standardized", X_std)]:
    steps, kappa = gd_steps(X, price)
    print(f"{name:13s}: condition number = {kappa:12.1f}   steps to converge = {steps}")</div>
  <div class="fx" data-lang="text">feature std (raw): [720.49   1.18]
raw features : condition number =   28833051.0   steps to converge = &gt;100000
standardized : condition number =         11.2   steps to converge = 82</div>
  <p>The raw condition number is about 29 million (larger than our 373,000 because the un-centred size column, mean about 1,750, also couples with the intercept). Gradient descent needs on the order of κ steps per factor of e, so it does not get close in 100,000 steps. After <code>StandardScaler</code> (each column minus its mean, divided by its standard deviation) κ = 11 and it converges in 82 steps. The model is the same; the predictions after converting the weights back are the same; only the optimiser's job changed.</p>
  <table class="tbl">
    <tr><th>Needs scaling for the optimiser</th><th>Does not care</th></tr>
    <tr><td>Anything trained by gradient descent: linear/logistic regression with GD/SGD, neural networks, <code>SGDClassifier</code></td><td>Closed-form OLS (<code>LinearRegression</code>): same predictions either way</td></tr>
    <tr><td>Penalised models (ridge, lasso): the penalty itself depends on scale (<a class="xref" data-note="ml_regularization">Regularization</a>)</td><td>Tree models: splits depend only on order (<a class="xref" data-note="ml_dtree">Decision Trees</a>)</td></tr>
    <tr><td>Distance-based models (kNN, SVM, k-means) for a different reason (distances)</td><td>Naive Bayes</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Standardization</strong>: z = (x − mean) / std per feature, using statistics from the training rows only. For a quadratic cost it reduces the condition number κ = λ<sub>max</sub>/λ<sub>min</sub> of the Hessian, which controls how many gradient steps are needed (≈ κ·ln(1/ε) for accuracy ε with η = 1/L).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Fitting the scaler on the full dataset before splitting. The test rows' mean and spread leak into training. Put the scaler inside a <code>Pipeline</code> so it is fitted on training folds only (<a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>). And remember to scale new data with the <em>training</em> statistics at prediction time.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> Scaling helps when the long, thin valley lines up with the feature axes. Valleys can also be tilted (correlated features) or appear in non-convex networks where you cannot rescale them away. Better optimisers adapt the step themselves.</div>

  <h2 id="lg-adam"><span class="num">14</span>Momentum and Adam (Brief)</h2>
  <h3>Momentum: a ball rolling downhill</h3>
  <p>Keep a running "velocity" v that adds up past gradients: v ← β·v + ∇J, then θ ← θ − η·v (β ≈ 0.9). Along the valley floor the gradients keep pointing the same way, so v builds up speed. Across the valley they flip sign every step, so they cancel in v and the zig-zag is damped.</p>
  <p><strong>By hand</strong> on the long bowl J = ½(w₁² + 50·w₂²) from (10, 1), η = 0.02, β = 0.9. Gradient = (w₁, 50·w₂) = (10, 50).</p>
  <ul>
    <li>Plain GD step: (10 − 0.02·10, 1 − 0.02·50) = (9.8, 0.0).</li>
    <li>Momentum step 1: v = (10, 50), same as GD → (9.8, 0.0). Step 2: gradient (9.8, 0); v = 0.9·(10, 50) + (9.8, 0) = (18.8, 45); θ = (9.8 − 0.376, 0 − 0.9) = (9.424, −0.9). In w₁ (the slow direction) it moved 0.376 instead of plain GD's 0.196: almost twice as fast. In w₂ it overshot; later steps damp that.</li>
  </ul>
  <h3>Adam: a separate step size per parameter</h3>
  <p>Adam keeps two running averages per parameter: m (the average gradient, like momentum) and s (the average <em>squared</em> gradient, a measure of that parameter's typical gradient size). It steps by m / √s, so a parameter with huge gradients takes small steps and one with tiny gradients takes bigger ones. Early averages start at 0 and are biased low, so both are divided by (1 − βᵗ).</p>
  <p><strong>By hand</strong>, step 1 from (10, 1), η = 0.5, β₁ = 0.9, β₂ = 0.999: g = (10, 50). m = 0.1·g = (1, 5); s = 0.001·g² = (0.1, 2.5). Bias-corrected: m̂ = m/0.1 = (10, 50), ŝ = s/0.001 = (100, 2,500). Step = 0.5·m̂/√ŝ = 0.5·(10/10, 50/50) = (0.5, 0.5). Both coordinates move by exactly 0.5 even though their gradients differ 5-fold: the step size has been normalised per coordinate.</p>
  <div class="fx" data-lang="py">import numpy as np
a = np.array([1.0, 50.0])                     # a long, narrow bowl: J = 0.5*(1*w1^2 + 50*w2^2)
J = lambda w: 0.5 * (a * w**2).sum()
grad = lambda w: a * w

def gd(lr=0.02):
    w = np.array([10.0, 1.0])
    for t in range(1, 10_001):
        w = w - lr * grad(w)
        if J(w) &lt; 1e-6: return t, w
    return None, w

def momentum(lr=0.02, beta=0.9):
    w, v = np.array([10.0, 1.0]), np.zeros(2)
    for t in range(1, 10_001):
        v = beta * v + grad(w)                # running sum of past gradients
        w = w - lr * v
        if J(w) &lt; 1e-6: return t, w
    return None, w

def adam(lr=0.5, b1=0.9, b2=0.999, eps=1e-8):
    w, m, s = np.array([10.0, 1.0]), np.zeros(2), np.zeros(2)
    for t in range(1, 10_001):
        g = grad(w)
        m = b1 * m + (1 - b1) * g             # average gradient (direction)
        s = b2 * s + (1 - b2) * g**2          # average squared gradient (scale)
        m_hat, s_hat = m / (1 - b1**t), s / (1 - b2**t)   # bias correction
        w = w - lr * m_hat / (np.sqrt(s_hat) + eps)
        if J(w) &lt; 1e-6: return t, w
    return None, w

for name, fn in [("plain GD", gd), ("momentum", momentum), ("Adam", adam)]:
    t, w = fn()
    print(f"{name:9s}: steps to J &lt; 1e-6 = {t}")</div>
  <div class="fx" data-lang="text">plain GD : steps to J &lt; 1e-6 = 439
momentum : steps to J &lt; 1e-6 = 153
Adam     : steps to J &lt; 1e-6 = 151</div>
  <p>On this bowl (κ = 50) momentum cuts the steps from 439 to 153, and Adam (with a hand-picked η = 0.5) needs 151. Adam's real strength is in deep networks with millions of parameters whose gradient sizes differ by orders of magnitude, where one global η cannot suit them all; its default η = 0.001 works reasonably across many problems. Full treatment, including RMSProp and AdamW, in <a class="xref" data-note="m_optimization">Optimization</a>.</p>
  <table class="tbl">
    <tr><th>Optimizer</th><th>Update (per parameter)</th><th>Fixes</th><th>Typical settings</th></tr>
    <tr><td>GD / SGD</td><td>θ ← θ − η g</td><td>–</td><td>η tuned</td></tr>
    <tr><td>Momentum</td><td>v ← βv + g; θ ← θ − ηv</td><td>zig-zag, slow valleys</td><td>β = 0.9</td></tr>
    <tr><td>Nesterov</td><td>gradient taken at the look-ahead point θ − ηβv</td><td>overshoot of momentum</td><td>β = 0.9</td></tr>
    <tr><td>RMSProp</td><td>s ← ρs + (1 − ρ)g²; θ ← θ − η g/√s</td><td>very different gradient scales</td><td>ρ = 0.9</td></tr>
    <tr><td>Adam</td><td>momentum on g and on g², bias-corrected; θ ← θ − η m̂/(√ŝ + ε)</td><td>both of the above</td><td>η = 0.001, β₁ = 0.9, β₂ = 0.999</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Adam</strong>: mₜ = β₁mₜ₋₁ + (1 − β₁)gₜ, sₜ = β₂sₜ₋₁ + (1 − β₂)gₜ², m̂ₜ = mₜ/(1 − β₁ᵗ), ŝₜ = sₜ/(1 − β₂ᵗ), θₜ = θₜ₋₁ − η·m̂ₜ/(√ŝₜ + ε), all element-wise.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using Adam's default learning rate on a problem where plain GD with a tuned η and scaled features would be faster and more exact, or assuming Adam needs no tuning at all. For classic convex models (linear, logistic) sklearn uses specialised solvers (lbfgs, coordinate descent, liblinear) that beat both.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> For linear regression the bottom of the bowl can be computed in one go, without any steps. When is that better, and why can't we do it for every model?</div>

  <h2 id="lg-closed"><span class="num">15</span>Closed Form vs Iterative</h2>
  <h3>Setting the gradient to zero</h3>
  <p>At the bottom of the bowl the gradient is zero: (2/n)Xᵀ(Xθ − y) = 0, which rearranges to the <strong>normal equation</strong> XᵀXθ = Xᵀy, and (if XᵀX is invertible) θ = (XᵀX)⁻¹Xᵀy.</p>
  <h3>By hand on the three points</h3>
  <p>With columns (x, 1): XᵀX = [[14, 6], [6, 3]] and Xᵀy = [Σxy, Σy] = [1·2 + 2·4 + 3·5, 2 + 4 + 5] = [25, 11]. Solve the 2×2 system 14w + 6b = 25, 6w + 3b = 11. Determinant = 14·3 − 6·6 = 6.</p>
  <ul>
    <li>w = (3·25 − 6·11)/6 = (75 − 66)/6 = <strong>1.5</strong></li>
    <li>b = (14·11 − 6·25)/6 = (154 − 150)/6 = <strong>0.6667</strong></li>
  </ul>
  <p>The same point gradient descent was creeping towards.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression

x = np.array([1.0, 2.0, 3.0]); y = np.array([2.0, 4.0, 5.0])
X = np.c_[x, np.ones(3)]                         # columns: x, 1
XtX, Xty = X.T @ X, X.T @ y
print("X^T X =", XtX.tolist(), "  X^T y =", Xty.tolist())
print("solve(X^T X, X^T y) :", np.linalg.solve(XtX, Xty).round(4))   # [w, b]
print("lstsq (SVD)         :", np.linalg.lstsq(X, y, rcond=None)[0].round(4))
m = LinearRegression().fit(x[:, None], y)
print("sklearn             :", round(m.coef_[0], 4), round(m.intercept_, 4))</div>
  <div class="fx" data-lang="text">X^T X = [[14.0, 6.0], [6.0, 3.0]]   X^T y = [25.0, 11.0]
solve(X^T X, X^T y) : [1.5    0.6667]
lstsq (SVD)         : [1.5    0.6667]
sklearn             : 1.5 0.6667</div>
  <p><code>np.linalg.solve</code> solves the system without forming an inverse; <code>lstsq</code> uses the SVD and also copes with collinear columns; <code>LinearRegression</code> uses an lstsq-style solver internally. The full derivation and statistics of OLS are in <a class="xref" data-note="ml_regression">Linear Regression</a>.</p>
  <table class="tbl">
    <tr><th></th><th>Closed form (normal equation / SVD)</th><th>Gradient descent family</th></tr>
    <tr><td>Result</td><td>exact (up to rounding)</td><td>approximate; improves with iterations</td></tr>
    <tr><td>Cost</td><td>O(n·d²) to form XᵀX + O(d³) to solve</td><td>O(n·d) per full step × number of steps</td></tr>
    <tr><td>Hyperparameters</td><td>none</td><td>learning rate, iterations, batch size</td></tr>
    <tr><td>Large d (e.g. 100,000 features)</td><td>d³ = 10¹⁵: impractical</td><td>fine</td></tr>
    <tr><td>Data larger than memory / streaming</td><td>hard</td><td>natural (mini-batches)</td></tr>
    <tr><td>Feature scaling needed?</td><td>no</td><td>yes, for speed</td></tr>
    <tr><td>Works for</td><td>squared loss, ridge (XᵀX + λI)</td><td>any differentiable (or sub-differentiable) loss</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Only squared loss with a linear model gives linear equations when the gradient is set to zero. For log-loss the condition Xᵀ(σ(Xθ) − y) = 0 has θ inside a sigmoid; no formula solves it, so logistic regression is always fitted iteratively (Newton / lbfgs / GD). The same holds for hinge, Huber and every neural network.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Computing <code>np.linalg.inv(X.T @ X) @ X.T @ y</code>. When columns are nearly collinear, XᵀX is nearly singular and the inverse amplifies rounding errors (the condition number of XᵀX is the <em>square</em> of X's). Use <code>solve</code>, <code>lstsq</code>, or add a ridge term.</p>
  </div>
  <div class="bridge"><b>What's still missing?</b> We have checked everything on toy data. The real test of understanding: implement gradient descent for linear and logistic regression on real datasets and match scikit-learn's answers.</div>

  <h2 id="lg-scratch"><span class="num">16</span>From Scratch, Matching scikit-learn</h2>
  <p>Two classes, about 20 lines each. <code>LinearRegressionGD</code> standardizes internally (section 13), runs batch gradient descent with the gradient from section 09, then converts the weights back to the original units: if z = (x − μ)/σ and ŷ = w·z + b, then ŷ = (w/σ)·x + (b − Σ wμ/σ). <code>LogisticRegressionGD</code> uses the p − y gradient from section 05, plus sklearn's L2 penalty: sklearn minimises ½‖w‖² + C·Σ log-loss; dividing by C·n gives the same minimiser as mean log-loss + ‖w‖²/(2Cn), whose gradient adds w/(Cn).</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_diabetes, load_breast_cancer
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression, LogisticRegression

class LinearRegressionGD:
    """Least squares by batch gradient descent on standardized features."""
    def __init__(self, lr=0.2, n_iter=20000):
        self.lr, self.n_iter = lr, n_iter
    def fit(self, X, y):
        self.mu, self.sd = X.mean(0), X.std(0)
        Z = (X - self.mu) / self.sd                     # scale for fast, stable GD
        n, d = Z.shape
        w, b = np.zeros(d), 0.0
        for _ in range(self.n_iter):
            err = Z @ w + b - y
            w -= self.lr * 2 / n * Z.T @ err            # dJ/dw
            b -= self.lr * 2 / n * err.sum()            # dJ/db
        self.coef_ = w / self.sd                        # back to original units
        self.intercept_ = b - (self.mu / self.sd) @ w
        return self
    def predict(self, X):
        return X @ self.coef_ + self.intercept_

class LogisticRegressionGD:
    """Log loss + L2 penalty, same objective as sklearn's LogisticRegression(C=C)."""
    def __init__(self, C=1.0, lr=0.5, n_iter=50000):
        self.C, self.lr, self.n_iter = C, lr, n_iter
    def fit(self, X, y):
        n, d = X.shape
        w, b = np.zeros(d), 0.0
        for _ in range(self.n_iter):
            p = 1 / (1 + np.exp(-(X @ w + b)))           # predicted probabilities
            g_w = X.T @ (p - y) / n + w / (self.C * n)   # gradient of mean log loss + penalty
            g_b = (p - y).mean()                         # the intercept is not penalised
            w -= self.lr * g_w
            b -= self.lr * g_b
        self.coef_, self.intercept_ = w, b
        return self

X, y = load_diabetes(return_X_y=True)
mine = LinearRegressionGD().fit(X, y)
ref = LinearRegression().fit(X, y)
print("linear  : max |coef diff| =", f"{np.abs(mine.coef_ - ref.coef_).max():.2e}",
      " intercept diff =", f"{abs(mine.intercept_ - ref.intercept_):.2e}")
print("          first 3 coefs, mine:", mine.coef_[:3].round(2), " sklearn:", ref.coef_[:3].round(2))

Xc, yc = load_breast_cancer(return_X_y=True)
Xc = StandardScaler().fit_transform(Xc)
mine = LogisticRegressionGD(C=1.0).fit(Xc, yc)
ref = LogisticRegression(C=1.0, tol=1e-10, max_iter=10_000).fit(Xc, yc)
print("logistic: max |coef diff| =", f"{np.abs(mine.coef_ - ref.coef_[0]).max():.2e}",
      " intercept diff =", f"{abs(mine.intercept_ - ref.intercept_[0]):.2e}")
print("          first 3 coefs, mine:", mine.coef_[:3].round(3), " sklearn:", ref.coef_[0][:3].round(3))</div>
  <div class="fx" data-lang="text">linear  : max |coef diff| = 1.52e-11  intercept diff = 2.84e-14
          first 3 coefs, mine: [ -10.01 -239.82  519.85]  sklearn: [ -10.01 -239.82  519.85]
logistic: max |coef diff| = 1.13e-06  intercept diff = 2.31e-07
          first 3 coefs, mine: [-0.363 -0.388 -0.351]  sklearn: [-0.363 -0.388 -0.351]</div>
  <p>On the diabetes data (442 patients, 10 features) the gradient-descent coefficients agree with <code>LinearRegression</code>'s exact solution to about 10⁻¹¹. On breast cancer (569 rows, 30 standardized features) the logistic coefficients agree with sklearn's lbfgs solver to about 10⁻⁶. Two choices made that possible: a learning rate under the 2/L limit (0.2 &lt; 0.248 for diabetes), and enough iterations for the shallow directions (diabetes has κ ≈ 470 because several blood-serum features are strongly correlated).</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Declaring "my implementation matches" after 1,000 iterations because the first two decimals agree. With the original settings (η = 0.1, 5,000 iterations) the linear version was still off by 0.15 in one coefficient. Compare the full coefficient vectors, and check the gradient norm, not just the loss.</p>
  </div>

  <h2 id="lg-compare"><span class="num">17</span>Comparisons</h2>
  <h3>The losses side by side</h3>
  <table class="tbl">
    <tr><th>Loss</th><th>Formula</th><th>Task</th><th>Gradient (w.r.t. prediction or score)</th><th>Convex</th><th>Smooth</th><th>Robust to outliers</th><th>Predicts / implies</th><th>Used by</th></tr>
    <tr><td>Squared</td><td>(y − ŷ)²</td><td>regression</td><td>2(ŷ − y)</td><td>yes</td><td>yes</td><td>no</td><td>mean; Gaussian noise</td><td>OLS, ridge, GBM default</td></tr>
    <tr><td>Absolute</td><td>|y − ŷ|</td><td>regression</td><td>sign(ŷ − y)</td><td>yes</td><td>no (kink)</td><td>yes</td><td>median; Laplace noise</td><td>quantile regression, GBM option</td></tr>
    <tr><td>Huber</td><td>½r² or δ(|r| − ½δ)</td><td>regression</td><td>clip(ŷ − y, ±δ)</td><td>yes</td><td>yes (C¹)</td><td>yes</td><td>between mean and median</td><td>HuberRegressor, GBM option</td></tr>
    <tr><td>Log-loss</td><td>−[y ln p + (1 − y) ln(1 − p)]</td><td>classification</td><td>p − y (w.r.t. score)</td><td>yes (in the score)</td><td>yes</td><td>no (confident errors huge)</td><td>calibrated probabilities</td><td>logistic regression, NNs, GBM</td></tr>
    <tr><td>Hinge</td><td>max(0, 1 − yf)</td><td>classification</td><td>−y if yf &lt; 1, else 0</td><td>yes</td><td>no (corner)</td><td>more than exponential</td><td>a margin; no probabilities</td><td>SVM, SGDClassifier</td></tr>
    <tr><td>0-1</td><td>𝟙[y ≠ ŷ]</td><td>classification</td><td>0 / undefined</td><td>no</td><td>no</td><td>–</td><td>the error rate</td><td>evaluation only</td></tr>
  </table>
  <h3>Ways to minimise a cost</h3>
  <table class="tbl">
    <tr><th>Method</th><th>Uses</th><th>Per-step cost</th><th>Good for</th></tr>
    <tr><td>Closed form</td><td>linear algebra</td><td>one O(nd² + d³) solve</td><td>OLS, ridge with moderate d</td></tr>
    <tr><td>Batch GD</td><td>gradient</td><td>O(nd)</td><td>small, smooth, convex problems; teaching</td></tr>
    <tr><td>Mini-batch SGD (+ momentum)</td><td>noisy gradient</td><td>O(bd)</td><td>large data, neural networks</td></tr>
    <tr><td>Adam / RMSProp</td><td>noisy gradient + per-parameter scaling</td><td>O(bd)</td><td>deep learning default</td></tr>
    <tr><td>Newton / lbfgs</td><td>gradient + (approximate) curvature</td><td>higher per step, few steps</td><td>logistic regression in sklearn, medium d</td></tr>
    <tr><td>Coordinate descent</td><td>one parameter at a time</td><td>O(n) per coordinate</td><td>lasso / elastic net (<a class="xref" data-note="ml_ridge_lasso">Ridge, Lasso &amp; Elastic Net</a>)</td></tr>
  </table>

  <h2 id="lg-traps"><span class="num">18</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: MSE for classification</span>
    <p>Squared loss on sigmoid outputs is non-convex and has vanishing gradients when confidently wrong (−0.0049 vs −0.998 at z = −6). Use log-loss.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: learning rate too large</span>
    <p>Rising or <code>nan</code> loss means η is above 2/L. Lower it by 10×, and scale the features, before changing the model.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: unscaled features with gradient descent</span>
    <p>κ went from 28.8 million to 11.2 after standardization; steps from over 100,000 to 82. Always scale inputs for GD-based models, using training-set statistics only.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reading training loss as model quality</span>
    <p>Gradient descent minimises <em>training</em> cost. A lower training loss can mean overfitting (<a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a>). Watch a validation curve and use early stopping or regularization.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: sign and label conventions</span>
    <p>Error defined as y − ŷ with the update θ − η·gradient walks uphill. Hinge needs labels −1/+1; log-loss needs 0/1. Check that the first step lowers the cost.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: constant learning rate with SGD and expecting exact answers</span>
    <p>SGD with fixed η hovers around the minimum (MSE 1.038 vs 1.032, weights off in the 2nd decimal). Decay η, increase the batch, or finish with a few full-batch steps.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: log of zero</span>
    <p>Hard 0/1 probabilities make log-loss infinite. Clip probabilities, or use "with logits" loss functions that combine sigmoid/softmax and log stably.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting the averaging factor</span>
    <p>Using the sum of losses instead of the mean multiplies the gradient by n, so a learning rate that worked on 100 rows explodes on 100,000. Use the mean, or rescale η.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: "loss is low, so the metric is good"</span>
    <p>Log-loss can fall while accuracy stays flat, and a model trained for MSE can have a poor MAPE. Monitor the metric that matters alongside the loss.</p>
  </div>

  <h2 id="lg-qa"><span class="num">19</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a loss function, a cost function and a metric?</summary><div class="qa-body">Loss: the penalty for one prediction, L(y, ŷ). Cost (objective): the average loss over the training set as a function of the parameters, plus any regularization penalty; it is what the optimiser minimises. Metric: the number you report for a dataset (accuracy, RMSE, AUC); it need not be differentiable and may differ from the loss.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does minimising squared error give the mean, and absolute error the median?</summary><div class="qa-body">For a constant c, d/dc Σ(yᵢ − c)² = −2Σ(yᵢ − c) = 0 gives c = mean. For Σ|yᵢ − c| the slope is (#points below c) − (#points above c), which changes sign at the middle value, the median. On [2, 3, 4, 6, 21]: mean 7.2, median 4, Huber (δ = 1.5) 4.25.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive MSE and log-loss from maximum likelihood.</summary><div class="qa-body">Gaussian noise: −ln Π (1/√(2πσ²)) exp(−(yᵢ − ŷᵢ)²/2σ²) = (n/2)ln(2πσ²) + SSE/(2σ²), so maximising likelihood = minimising SSE. Bernoulli: P(y|p) = pʸ(1 − p)¹⁻ʸ, so −ln of the product is −Σ[yᵢ ln pᵢ + (1 − yᵢ) ln(1 − pᵢ)], the log-loss.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Show that the gradient of log-loss with respect to the logit is p − y.</summary><div class="qa-body">With p = σ(z) and σ' = p(1 − p): dL/dz = −[y(1/p) − (1 − y)/(1 − p)]·p(1 − p) = −[y(1 − p) − (1 − y)p] = p − y. Hence ∂L/∂w = (p − y)x, the same form as linear regression's gradient.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why not use MSE for logistic regression?</summary><div class="qa-body">On top of a sigmoid, MSE is non-convex in the weights and its gradient 2(p − y)p(1 − p) vanishes when the model is confidently wrong (−0.0049 vs log-loss −0.998 at z = −6), so learning from the worst mistakes is slow. Log-loss is convex, has gradient p − y, and is a proper scoring rule that rewards calibrated probabilities.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is hinge loss and how does it relate to SVMs and support vectors?</summary><div class="qa-body">max(0, 1 − y·f) with y ∈ {−1, +1}. Rows with margin ≥ 1 have zero loss and zero gradient, so only rows inside or on the wrong side of the margin (support vectors) shape the solution. Hinge loss + L2 penalty is the soft-margin linear SVM.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why don't we train classifiers by minimising 0-1 loss directly?</summary><div class="qa-body">It is flat almost everywhere (gradient 0) and discontinuous at the boundary, so gradient methods get no signal; exact minimisation is NP-hard for linear classifiers in general; and it ignores how close a row is to the boundary. Convex surrogates (log-loss, hinge) upper-bound it, are easy to optimise, and are classification-calibrated.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the gradient descent update for linear regression and do one step for points (1,2), (2,4), (3,5) from (0,0) with η = 0.1.</summary><div class="qa-body">J = (1/n)Σ(wxᵢ + b − yᵢ)², ∂J/∂w = (2/n)Σeᵢxᵢ, ∂J/∂b = (2/n)Σeᵢ. Errors −2, −4, −5 give ∂w = (2/3)(−25) = −16.667 and ∂b = (2/3)(−11) = −7.333, so w = 1.667, b = 0.733 and J falls from 15 to 0.234. The exact answer is (1.5, 0.667).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you know the largest safe learning rate?</summary><div class="qa-body">For a quadratic cost, GD converges iff η &lt; 2/L, where L is the largest eigenvalue of the Hessian (for MSE, (2/n)XᵀX). For the three points L = 11.09, so η must be below 0.18: 0.17 converged (with zig-zags), 0.19 diverged to 10⁴⁵. In practice: try values on a log grid (1, 0.1, 0.01…) and watch the loss.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is convexity and why do we care?</summary><div class="qa-body">A convex function lies below its chords (Hessian positive semi-definite), so every point with zero gradient is a global minimum and GD cannot get stuck in a bad local minimum. MSE for linear models, log-loss for logistic regression, hinge and Huber are convex; neural networks are not. Convexity guarantees the destination, not the speed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compare batch, stochastic and mini-batch gradient descent.</summary><div class="qa-body">Batch: exact gradient, one update per epoch, O(nd) per step. SGD: one row per update, cheap and noisy, needs a decaying η to converge exactly. Mini-batch: b rows (32–512), noise shrinking like 1/√b, vectorises well; the default for large data and deep learning. On 10,000 rows, one epoch of mini-batch reached MSE 1.032 while one batch step was at 19.8.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does feature scaling speed up gradient descent?</summary><div class="qa-body">Features on very different scales make the cost bowl long and thin (high condition number κ = L/μ). The step size is limited by the steep direction (η &lt; 2/L), so progress along the flat direction is tiny and GD zig-zags. Standardizing makes the bowl rounder: κ 28.8 million → 11.2, steps &gt;100,000 → 82.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain momentum and Adam in two sentences each.</summary><div class="qa-body">Momentum keeps a running sum of past gradients and steps along it, which accelerates consistent directions and cancels oscillating ones (439 → 153 steps on a κ = 50 bowl). Adam combines momentum with a per-parameter running average of squared gradients, stepping by m̂/√ŝ so every parameter moves on a similar scale; bias correction fixes the zero initialisation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Normal equation or gradient descent: when do you use which?</summary><div class="qa-body">Normal equation (via solve/SVD): exact, no tuning, O(nd² + d³), best for squared loss with up to a few thousand features that fit in memory. Gradient descent: O(nd) per step, needed for huge d, streaming data, and any loss without a closed form (logistic, hinge, neural networks).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how do loss gradients appear in gradient boosting and regularization?</summary><div class="qa-body">Gradient boosting fits each new tree to the negative gradient of the loss at the current predictions: y − ŷ for squared loss, y − p for log-loss, sign(y − ŷ) for absolute loss, so changing the loss changes what each tree learns (<a class="xref" data-note="ml_gbm">Gradient Boosting</a>). Regularization adds λ·penalty to the cost; for L2 the gradient gains 2λw, which shrinks weights every step and makes the cost strongly convex (<a class="xref" data-note="ml_regularization">Regularization</a>).</div></details>
</main>
`
});
