// notes/ml/ml_loss_gd.js — Loss Functions & Gradient Descent
Object.assign(TOPIC_CONTENT, {
  "ml_loss_gd": `<main>
  <h1>Loss Functions &amp; Gradient Descent</h1>
  <div class="where"><span>Machine Learning</span><span>Foundations</span><span>Loss Functions &amp; Gradient Descent</span></div>
  <p class="lead">Every model you will train does the same two things: it measures how wrong it is with a <strong>loss function</strong>, and it changes its parameters to make that number smaller, usually with <strong>gradient descent</strong>. This note covers both completely. Squared, absolute, Huber, log-loss (derived from likelihood), hinge and 0-1 loss are each worked by hand and plotted; then gradient descent is derived for linear regression and run by hand for three steps, followed by learning rates, convexity, batch vs stochastic vs mini-batch, feature scaling, momentum and Adam, the closed-form alternative, and a from-scratch implementation that matches scikit-learn to many decimal places. The running example is the Foundations group's <strong>ten flats in Pune</strong>: every loss is computed on their prices, and gradient descent walks, step by step, to the line price = 6 × area + 10 that earlier notes found with a formula.</p>

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
    <li><b>Came from: <a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a></b><span>You saw that a model is judged on new data, that the ten flats are best fitted by a straight line (LOOCV picked degree 1), and that training error can lie. But we never said exactly what "error" is for a given row, why it was <em>squared</em>, or how a model actually changes its parameters to reduce it. Every fit in that note was a black box called <code>.fit()</code> or a calculus formula.</span></li>
    <li><b>This note adds: the objective and the optimiser</b><span>What a loss function is, the six losses you must know (squared, absolute, Huber, log-loss, hinge, 0-1), why each exists (they come from different assumptions about noise), and gradient descent: the algorithm that walks downhill on the average loss. You will run it by hand on the ten flats, break it with a bad learning rate, speed it up with scaling and momentum, and write it from scratch.</span></li>
    <li><b>Leads to: <a class="xref" data-note="ml_regularization">Regularization</a>, then every model</b><span>Regularization adds a penalty to this cost (cost = average loss + λ·penalty) to trade a little bias for less variance, the fix the bias–variance note recommended for the line's variance gap. <a class="xref" data-note="ml_regression">Linear Regression</a> is squared loss, <a class="xref" data-note="ml_classification">Logistic Regression</a> is log-loss, <a class="xref" data-note="ml_svm">SVMs</a> are hinge loss, and <a class="xref" data-note="ml_gbm">Gradient Boosting</a> fits trees to the gradient of any of these losses. The calculus is in <a class="xref" data-note="m_calculus">Calculus</a>; deeper optimiser theory is in <a class="xref" data-note="m_optimization">Optimization</a>.</span></li>
  </ol>

  <h2 id="lg-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its weakness raises the next question. All numbers are on the ten flats (one of them sometimes mistyped).</p>
  <ol class="story">
    <li><b>Loss vs cost vs metric</b><span>Q: how do we turn "how wrong" into one number per row and one number to minimise? → Loss per row, cost = average over rows, metric for reporting. The line's misses −2, 3, 1, … give squared 4.6, absolute 2.0, Huber 1.5. Which loss should it be?</span></li>
    <li><b>Squared loss</b><span>Q: why square the miss? → It is smooth, its best constant is the mean, and it is the likelihood of Gaussian noise. But one typo (flat J's ₹96 lakh typed as 69) multiplies the MSE by 14.5 and drags the mean from 67 to 64.3…</span></li>
    <li><b>Absolute loss</b><span>Q: can we stop one big miss from dominating? → Drop the square: every unit costs the same; the best constant is the median (still 67–68 with the typo). But it has a kink at 0, so gradients do not shrink near the answer…</span></li>
    <li><b>Huber loss</b><span>Q: can we be smooth near zero and robust far away? → Square small misses, go linear past δ: the best constant stays at 67, and the typo pulls a fitted slope only to 5.58 instead of 4.53. But all three compare numbers; what about a yes/no answer?</span></li>
    <li><b>Log-loss (cross-entropy)</b><span>Q: how wrong is a probability? → Minus the log of the probability given to what happened (the Bernoulli likelihood): 0.201 for a fast seller given 0.818, 4.51 for a flat given 0.989 that did not sell fast. Gradient p − y. But it never stops pushing on rows already correct…</span></li>
    <li><b>Hinge loss</b><span>Q: can a row that is safely correct stop mattering? → max(0, 1 − margin): flat A (margin 1.5) costs 0, flats C and F (margin 0.5) cost 0.5. But what we report is accuracy; why not minimise that?</span></li>
    <li><b>0-1 loss and surrogates</b><span>Q: why not minimise the error rate itself? → It is flat (0 on all ten flats, whatever the scale of the score), so it has no gradient. Convex surrogates (log, hinge) do. Now the cost is a function of the parameters…</span></li>
    <li><b>The cost surface</b><span>Q: what does the cost look like as the parameters move? → A bowl: J = 4790.6 at (0, 0), 118.6 for 8 × area, 4.6 at the bottom (6, 10). With thousands of parameters we cannot scan it…</span></li>
    <li><b>Gradient descent</b><span>Q: how do we find the bottom using only the local slope? → θ ← θ − η∇J. Three steps by hand on the flats: J 4790.6 → 3003.0 → 1896.3 → 1203.8, reaching w = 6, b = 10 after about 50 steps. But how big should each step be?</span></li>
    <li><b>The learning rate</b><span>Q: which η? → Below 2/L = 0.121 for the flats; 0.1 converges, 0.125 explodes to 10²⁸. Is "keep going downhill" always safe, or can it get stuck?</span></li>
    <li><b>Convexity</b><span>Q: can downhill steps end at a bad place? → Not for a convex cost: MSE, log-loss, hinge. But every step so far used all rows; with millions of rows that is slow…</span></li>
    <li><b>Batch, stochastic, mini-batch</b><span>Q: can a step use only some rows? → One flat's gradient is a noisy but unbiased estimate (the ten average to (−99, −134)). Cheap noisy steps win early but never settle. Yet even full-batch GD on the raw flats needs 8,549 steps…</span></li>
    <li><b>Feature scaling</b><span>Q: why so slow, and how do we fix it? → An elongated bowl (κ = 1,198 for raw area, 11.8 million for area in sq ft); centring gives 81 steps, standardizing 1. When we cannot rescale the valley away?</span></li>
    <li><b>Momentum and Adam</b><span>Q: can the optimiser adapt its own steps? → Momentum builds speed along the valley (8,549 → 792 steps on the raw flats); Adam scales each parameter's step. For the line, is iterating needed at all?</span></li>
    <li><b>Closed form vs iterative</b><span>Q: when can we solve in one go? → For squared loss: XᵀXθ = Xᵀy gives w = 4950/825 = 6, b = 8250/825 = 10 exactly. Not for log-loss, hinge or networks. Finally: can we build it all ourselves?</span></li>
    <li><b>From scratch</b><span>Q: does our own gradient descent match the library? → Yes: the flats to (6, 10), diabetes to 10⁻¹¹, logistic to 10⁻⁶. Next: the cost minimised so well that it overfits → <a class="xref" data-note="ml_regularization">Regularization</a>.</span></li>
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
          <li>Flats: MSE 4.6 → 66.7 with one typo; MAE 2.0 → 4.3; Huber 1.5 → 3.8</li>
          <li>Typo prices: mean 64.3, median 67.5, Huber (δ = 3) 67</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Classification losses</div>
        <ul>
          <li><b>Log-loss</b> −[y ln p + (1−y) ln(1−p)] — negative Bernoulli log-likelihood</li>
          <li>Gradient w.r.t. score z: <b>p − y</b>; multiclass: softmax + −ln p_true (Baner 0.665 → 0.408)</li>
          <li>Flat K: p = 0.989 "sells fast", did not → 4.51; flat A p = 0.818 right → 0.201</li>
          <li><b>Hinge</b> max(0, 1 − m) — SVM; zero once m ≥ 1</li>
          <li><b>0-1</b> — what we care about; gradient 0 everywhere → use convex surrogates</li>
          <li>⚠ MSE + sigmoid is not convex; gradient vanishes when confidently wrong</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Gradient descent</div>
        <ul>
          <li><b>θ ← θ − η ∇J(θ)</b>; for MSE ∇J = (2/n) Xᵀ(Xθ − y)</li>
          <li>Flats, centred area: ∂J/∂w = 16.5(w − 6), ∂J/∂c = 2(c − 67)</li>
          <li>η = 0.1: (0, 0) → (9.9, 13.4) → (3.465, 24.12) → (7.648, 32.70); J 4790.6 → 1203.8</li>
          <li><b>Learning rate</b>: stable iff η &lt; 2/L (L = 16.5 → 0.121)</li>
          <li>Speed governed by condition number κ = L/μ; <b>convex</b> cost → any minimum is global</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Variants &amp; speed-ups</div>
        <ul>
          <li><b>Batch</b> — all rows per step; smooth, slow per step</li>
          <li><b>SGD</b> — one row; noisy, cheap; needs decaying η; 10 flat gradients average to (−99, −134)</li>
          <li><b>Mini-batch</b> (32–512) — the default; 1 epoch = 313 updates for n = 10,000</li>
          <li><b>Scaling</b> — flats κ 1,198 (raw) → 8.3 (centred) → 1 (standardized); steps 8,549 → 81 → 1</li>
          <li><b>Momentum</b> (8,549 → 792 steps on raw flats), <b>Adam</b> (per-coordinate step size)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Closed form vs iterative</div>
        <ul>
          <li>Normal equation XᵀXθ = Xᵀy; flats: [[985, 95], [95, 10]]θ = [6860, 670] → (6, 10)</li>
          <li>Cost O(nd² + d³) once vs O(nd) per GD step</li>
          <li>Closed form only for squared loss (and ridge); logistic, hinge, NNs need iterations</li>
          <li>From scratch: flats (6, 10); linear coef diff 1.5e-11, logistic 1.1e-6 vs sklearn</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="lg-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="lg-what"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What a Loss Is</span><span class="rm-sub">Loss vs cost vs metric</span></div></div>
      <div class="rm-item rm-done" data-target="lg-sq"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Squared Loss</span><span class="rm-sub">Mean, Gaussian likelihood</span></div></div>
      <div class="rm-item rm-done" data-target="lg-abs"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Absolute Loss</span><span class="rm-sub">Median, robustness</span></div></div>
      <div class="rm-item rm-done" data-target="lg-huber"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Huber Loss</span><span class="rm-sub">The best of both</span></div></div>
      <div class="rm-item rm-done" data-target="lg-log"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Log-Loss / Cross-Entropy</span><span class="rm-sub">Derived from likelihood</span></div></div>
      <div class="rm-item rm-done" data-target="lg-hinge"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Hinge Loss</span><span class="rm-sub">Margins and SVMs</span></div></div>
      <div class="rm-item rm-done" data-target="lg-01"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">0-1 Loss &amp; Surrogates</span><span class="rm-sub">Why we don't minimise accuracy</span></div></div>
      <div class="rm-item rm-done" data-target="lg-cost"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">From Loss to Cost Surface</span><span class="rm-sub">J(w, b) on the ten flats</span></div></div>
      <div class="rm-item rm-done" data-target="lg-gd"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Gradient Descent, Derived</span><span class="rm-sub">3 steps by hand</span></div></div>
      <div class="rm-item rm-done" data-target="lg-lr"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">The Learning Rate</span><span class="rm-sub">Too small, right, too big</span></div></div>
      <div class="rm-item rm-done" data-target="lg-convex"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Convexity</span><span class="rm-sub">When downhill means best</span></div></div>
      <div class="rm-item rm-done" data-target="lg-batch"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Batch, Stochastic, Mini-batch</span><span class="rm-sub">How much data per step</span></div></div>
      <div class="rm-item rm-done" data-target="lg-scale"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Feature Scaling</span><span class="rm-sub">Why GD crawls without it</span></div></div>
      <div class="rm-item rm-done" data-target="lg-adam"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Momentum &amp; Adam</span><span class="rm-sub">Brief, with one step by hand</span></div></div>
      <div class="rm-item rm-done" data-target="lg-closed"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Closed Form vs Iterative</span><span class="rm-sub">The normal equation</span></div></div>
      <div class="rm-item rm-done" data-target="lg-scratch"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">From Scratch</span><span class="rm-sub">Matching sklearn exactly</span></div></div>
      <div class="rm-item rm-done" data-target="lg-connect"><span class="rm-num">17</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="lg-compare"><span class="rm-num">18</span><div class="rm-text"><span class="rm-label">Comparisons</span><span class="rm-sub">Losses and optimisers side by side</span></div></div>
      <div class="rm-item rm-done" data-target="lg-traps"><span class="rm-num">19</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Interview and code traps</span></div></div>
      <div class="rm-item rm-done" data-target="lg-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="lg-qa"><span class="rm-num">20</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="lg-what"><span class="num">01</span>What a Loss Is</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Earlier notes scored the flat-price line by "mean squared error" and fitted it with a formula. But why squared? Is that the only way to say "how wrong", and what exactly is the number a model tries to make small?</p>
  </div>
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
  <h3>Worked by hand: the ten flats, three losses, one typo</h3>
  <p>The line price = 6 × area + 10 misses the ten flats A–J by r = y − ŷ = −2, 3, 1, −2, 3, −2, −3, 1, −1, 2 (₹ lakh). Score those misses three ways. Then suppose a data-entry clerk swapped two digits and flat J's ₹96 lakh was stored as ₹69 lakh: its residual becomes 69 − 94 = −25.</p>
  <table class="tbl">
    <tr><th>Residual size |r|</th><th>flats</th><th>squared r²</th><th>absolute |r|</th><th>Huber (δ = 1)</th></tr>
    <tr><td>1</td><td>C, H, I</td><td>1 each</td><td>1 each</td><td>½·1² = 0.5 each</td></tr>
    <tr><td>2</td><td>A, D, F, J</td><td>4 each</td><td>2 each</td><td>1·(2 − 0.5) = 1.5 each</td></tr>
    <tr><td>3</td><td>B, E, G</td><td>9 each</td><td>3 each</td><td>1·(3 − 0.5) = 2.5 each</td></tr>
    <tr><td colspan="2"><strong>average, clean data (the cost)</strong></td><td><strong>46/10 = 4.6</strong></td><td><strong>20/10 = 2.0</strong></td><td><strong>15/10 = 1.5</strong></td></tr>
    <tr><td>25 (J mistyped)</td><td>J replaces its 2</td><td>625 (was 4)</td><td>25 (was 2)</td><td>1·(25 − 0.5) = 24.5 (was 1.5)</td></tr>
    <tr><td colspan="2"><strong>average, with the typo</strong></td><td><strong>667/10 = 66.7</strong></td><td><strong>43/10 = 4.3</strong></td><td><strong>38/10 = 3.8</strong></td></tr>
  </table>
  <p>Same predictions, three very different verdicts. Under squared loss the single typo makes the cost 14.5 times larger and contributes 625 of the 667 total (94%). Under absolute loss it is 25 of 43 (58%), under Huber 24.5 of 38. The choice of loss decides which mistakes the model will work hardest to avoid.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.metrics import mean_squared_error, mean_absolute_error

area  = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
price = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96], dtype=float)
y_hat = 6 * area + 10                          # the line from "What is ML"

def huber(r, delta=1.0):
    small = np.abs(r) &lt;= delta
    return np.where(small, 0.5 * r**2, delta * (np.abs(r) - 0.5 * delta))

typo = price.copy(); typo[9] = 69               # flat J's price typed as 69 instead of 96
for name, y in [("clean data", price), ("J typed as 69", typo)]:
    r = y - y_hat                              # residuals
    print(f"{name}: residuals {r.astype(int).tolist()}")
    print(f"   squared mean = {(r**2).mean():.2f}   absolute mean = {np.abs(r).mean():.2f}"
          f"   huber(delta=1) mean = {huber(r).mean():.2f}")
    print(f"   sklearn MSE / MAE: {mean_squared_error(y, y_hat):.2f} {mean_absolute_error(y, y_hat):.2f}")</div>
  <div class="fx" data-lang="text">clean data: residuals [-2, 3, 1, -2, 3, -2, -3, 1, -1, 2]
   squared mean = 4.60   absolute mean = 2.00   huber(delta=1) mean = 1.50
   sklearn MSE / MAE: 4.60 2.00
J typed as 69: residuals [-2, 3, 1, -2, 3, -2, -3, 1, -1, -25]
   squared mean = 66.70   absolute mean = 4.30   huber(delta=1) mean = 3.80
   sklearn MSE / MAE: 66.70 4.30</div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>loss function</strong> L(y, ŷ) ≥ 0 measures the cost of predicting ŷ when the truth is y. The <strong>empirical risk</strong> or <strong>cost function</strong> is J(θ) = (1/n) Σᵢ L(yᵢ, f(xᵢ; θ)), optionally plus a penalty Ω(θ). <strong>Training</strong> means finding θ that minimises J. The model's hope is that low J on training rows means low expected loss on new rows (<a class="xref" data-note="ml_core">generalization</a>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Optimising one loss and reporting another without noticing. A model trained with squared loss is built to predict the <em>mean</em>; if the business reports median-based or percentage errors, a different loss (absolute, quantile) may serve them better. Pick the loss with the metric in mind.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Squared Loss.</b> Why would anyone square a residual in the first place, when it lets one typo dominate? Squared loss is the default in regression, and there are two deep reasons for it: what it makes the model predict, and what it assumes about the noise.</div>

  <h2 id="lg-sq"><span class="num">02</span>Squared Loss</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Squared loss turned one typo into 94% of the cost. If it is that fragile, why is it the default for every regression in the track? What does squaring make the model aim for, and what does it assume about the world?</p>
  </div>
  <h3>Formula and shape</h3>
  <p>L(y, ŷ) = (y − ŷ)². Averaged over rows it is the <strong>mean squared error</strong>, MSE. It is a smooth bowl: zero at r = 0, growing faster and faster. Its derivative with respect to the prediction is dL/dŷ = −2(y − ŷ) = 2(ŷ − y): the push on a prediction is proportional to how far off it is. Small misses get gentle pushes, big misses get big pushes.</p>
  <h3>What it makes the model predict: the mean</h3>
  <p>Strip a model down to a single constant c (the same price for every flat). Which c minimises the squared loss? Use the ten prices with the typo: 38, 49, 53, 56, 67, 68, 73, 83, 87, 69.</p>
  <p><strong>By calculus</strong>: SSE(c) = Σ (yᵢ − c)². Its derivative is −2 Σ (yᵢ − c). Setting it to zero: Σ yᵢ − n·c = 0, so c = Σ yᵢ / n, the <strong>mean</strong>. Here 643/10 = <strong>64.3</strong>; without the typo it was 670/10 = 67. One mistyped row moved the "typical price" by ₹2.7 lakh.</p>
  <p><strong>By checking</strong>: the same algebra gives SSE(c) = SSE(mean) + n·(c − mean)², so any other constant pays an extra n·(distance)². SSE(64.3) = 2106.1, and SSE(67) = 2106.1 + 10 × 2.7² = 2106.1 + 72.9 = 2179.0. The mean wins under squared loss, even though it is pulled towards the one bad row.</p>
  <div class="fx" data-lang="py">import numpy as np
from scipy.optimize import minimize_scalar

# the ten flat prices, with flat J's 96 mistyped as 69
y = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 69], dtype=float)

def huber(r, delta=3.0):
    return np.where(np.abs(r) &lt;= delta, 0.5 * r**2, delta * (np.abs(r) - 0.5 * delta))

losses = {
    "squared":  lambda c: ((y - c) ** 2).sum(),
    "absolute": lambda c: np.abs(y - c).sum(),
    "huber":    lambda c: huber(y - c).sum(),
}
for c in [64.3, 67, 67.5, 68]:
    print(f"c={c:&lt;5}: " + "  ".join(f"{k}={fn(c):8.2f}" for k, fn in losses.items()))
for k, fn in losses.items():
    best = minimize_scalar(fn, bounds=(30, 100), method="bounded").x
    print(f"best constant under {k:8s} loss: {best:.3f}")
print("mean =", y.mean(), " median =", np.median(y), "  (clean data: mean 67.0, median 67.5)")</div>
  <div class="fx" data-lang="text">c=64.3 : squared= 2106.10  absolute=  122.40  huber=  322.25
c=67   : squared= 2179.00  absolute=  117.00  huber=  313.00
c=67.5 : squared= 2208.50  absolute=  117.00  huber=  313.38
c=68   : squared= 2243.00  absolute=  117.00  huber=  314.50
best constant under squared  loss: 64.300
best constant under absolute loss: 67.187
best constant under huber    loss: 67.000
mean = 64.3  median = 67.5   (clean data: mean 67.0, median 67.5)</div>
  <p>The squared column is the by-hand check (2106.10 at the mean 64.3, 2179.00 at 67). The last lines minimise each loss numerically: squared loss picks the mean 64.3, absolute loss any value between 67 and 68 (section 03 explains why the optimiser returned 67.187), and Huber 67 (section 04). This generalises: a model trained with squared loss tries to predict the <strong>conditional mean</strong> E[y | x].</p>
  <h3>Where it comes from: Gaussian noise and maximum likelihood</h3>
  <p>Assume each price is the model's prediction plus noise from a normal (Gaussian) distribution: y = ŷ + ε, ε ~ N(0, σ²). The probability density of seeing y is</p>
  <p style="text-align:center">p(y | ŷ) = (1 / √(2πσ²)) · exp(−(y − ŷ)² / (2σ²))</p>
  <p><strong>Maximum likelihood</strong> says: choose the parameters that make the observed data most probable. For independent rows the likelihood is the product of densities. Products are awkward, so take the logarithm (it turns products into sums and does not move the maximum), and flip the sign to get something to minimise, the <strong>negative log-likelihood</strong> (NLL):</p>
  <p style="text-align:center">NLL = Σ [ ½ ln(2πσ²) + (yᵢ − ŷᵢ)² / (2σ²) ] = (n/2) ln(2πσ²) + SSE / (2σ²)</p>
  <p>The first term does not depend on the predictions, and 1/(2σ²) is a positive constant. So <strong>minimising NLL is exactly minimising SSE</strong>. Squared loss is the right loss when the noise is Gaussian. By hand on flats D, E, F (prices 56, 67, 68) with σ = 2 (about the flats' typical miss) and a constant prediction c: the mean 63.667 gives SSE = 7.667² + 3.333² + 4.333² = 58.78 + 11.11 + 18.78 = 88.67; one lakh either side gives 88.67 + 3 × 1² = 91.67. So the mean also has the highest likelihood:</p>
  <div class="fx" data-lang="py">import numpy as np
y = np.array([56.0, 67.0, 68.0])               # prices of flats D, E, F
sigma = 2.0                                    # assumed noise std (about the flats' typical miss)
for c in [62 + 2/3, 63 + 2/3, 64 + 2/3]:       # candidate constant predictions: mean - 1, mean, mean + 1
    lik = np.prod(np.exp(-(y - c) ** 2 / (2 * sigma**2)) / np.sqrt(2 * np.pi * sigma**2))
    nll = -np.log(lik)
    sse = ((y - c) ** 2).sum()
    print(f"c={c:.3f}: likelihood={lik:.2e}  NLL={nll:.3f}  SSE={sse:6.3f}  "
          f"check 1.5*log(2*pi*4) + SSE/8 = {1.5 * np.log(2 * np.pi * 4) + sse / 8:.3f}")</div>
  <div class="fx" data-lang="text">c=62.667: likelihood=8.38e-08  NLL=16.295  SSE=91.667  check 1.5*log(2*pi*4) + SSE/8 = 16.295
c=63.667: likelihood=1.22e-07  NLL=15.920  SSE=88.667  check 1.5*log(2*pi*4) + SSE/8 = 15.920
c=64.667: likelihood=8.38e-08  NLL=16.295  SSE=91.667  check 1.5*log(2*pi*4) + SSE/8 = 16.295</div>
  <p>The likelihood column is tiny (products of densities always are, which is another reason to work with logs), but its ranking matches SSE exactly, and the NLL equals 1.5·ln(2π·4) + SSE/8 as the formula says.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Squared loss</strong>: L(y, ŷ) = (y − ŷ)²; cost MSE = (1/n) Σ (yᵢ − ŷᵢ)². Gradient with respect to ŷ: 2(ŷ − y). Its minimiser over constants is the mean; over functions, the conditional mean E[y | x]. It is the negative log-likelihood (up to constants) under Gaussian noise with constant variance.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Squared loss lets a single outlier dominate: one digit swap pulled the best constant from 67 to 64.3 and multiplied the MSE by 14.5. Typos, sensor glitches and rare extreme customers can bend a whole regression line (section 04 shows it on the flats and on 50 rows).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Absolute Loss.</b> If big misses should not be punished so much harder than small ones, the obvious fix is to drop the square. What does that change?</div>

  <h2 id="lg-abs"><span class="num">03</span>Absolute Loss</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Squaring makes a ₹25 lakh miss cost 625 units, as much as 156 misses of ₹2 lakh. Can we score misses so that one bad row cannot drown out all the others?</p>
  </div>
  <h3>Formula and shape</h3>
  <p>L(y, ŷ) = |y − ŷ|. Averaged: the <strong>mean absolute error</strong>, MAE. It is a V shape: every unit of miss costs the same, whether it is the first unit or the twenty-fifth. The typo's residual of 25 costs 25, not 625.</p>
  <h3>What it makes the model predict: the median</h3>
  <p>For the constant c, the derivative of Σ |yᵢ − c| is (number of yᵢ below c) − (number of yᵢ above c), because each point below pulls the slope up by 1 and each point above pulls it down by 1. Walk c along the sorted typo prices 38, 49, 53, 56, 67, 68, 69, 73, 83, 87:</p>
  <table class="tbl">
    <tr><th>c between</th><th>points below</th><th>points above</th><th>slope</th><th>so…</th></tr>
    <tr><td>56 and 67</td><td>4</td><td>6</td><td>−2</td><td>loss still falling, move right</td></tr>
    <tr><td>67 and 68</td><td>5</td><td>5</td><td><strong>0</strong></td><td>flat: every c here is equally good</td></tr>
    <tr><td>68 and 69</td><td>6</td><td>4</td><td>+2</td><td>loss rising, went too far</td></tr>
  </table>
  <p>With an even number of rows the minimum is a whole interval, from the 5th to the 6th value: any c in [67, 68] gives total absolute loss 117 (the code above printed 117.00 at 67, 67.5 and 68, and the optimiser happened to stop at 67.187). The conventional <strong>median</strong> is the midpoint, 67.5. Without the typo the sorted prices are 38 … 67, 68 … 96: the same middle pair, so the same median. The typo counts as just "one point above or below", however far away it is, so it did not move the answer at all.</p>
  <h3>The catch: a kink at zero</h3>
  <p>The derivative is −sign(y − ŷ): always −1 or +1, undefined exactly at 0. Two consequences. Gradient descent gets the same size push whether the miss is 0.01 or 100, so near the answer it keeps overshooting unless the step size shrinks. And at r = 0 we must use a <strong>subgradient</strong> (any value between −1 and +1; libraries use 0). Solvers for absolute loss therefore often use linear programming instead of plain gradient descent.</p>
  <p>Probability view: absolute loss is the negative log-likelihood when the noise follows a <strong>Laplace</strong> distribution, p(ε) ∝ exp(−|ε|/b), which has heavier tails than a Gaussian. Heavy tails mean big errors are expected now and then, so they are not treated as disasters.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Absolute loss</strong>: L(y, ŷ) = |y − ŷ|; cost MAE. (Sub)gradient with respect to ŷ: −sign(y − ŷ). Minimiser over constants: the median (an interval when n is even); over functions: the conditional median. Generalisation: the <strong>quantile (pinball) loss</strong> with τ ∈ (0, 1) penalises under-prediction by τ·r and over-prediction by (1 − τ)·|r|, and its minimiser is the τ-quantile (used for prediction intervals, see <a class="xref" data-note="ml_ts_ml">ML Forecasting</a>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"MAE is robust, so always use it." It ignores the size of large errors, which is wrong when large errors are genuinely costly (under-pricing a flat by ₹25 lakh is a real loss to a seller, not noise). It also converges slowly with gradient methods. Choose by what a mistake really costs.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Huber Loss.</b> Squared loss is smooth but fragile; absolute loss is robust but kinked. Can one loss be quadratic for small misses and linear for big ones?</div>

  <h2 id="lg-huber"><span class="num">04</span>Huber Loss</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We want the gentle, smooth push of squared loss for ordinary ₹2–3 lakh misses, and the bounded push of absolute loss for a ₹25 lakh typo. Is there a single loss that behaves like each in its own range?</p>
  </div>
  <h3>The formula, in plain words</h3>
  <p>Pick a threshold δ. For a small residual (|r| ≤ δ) use half the square, ½r². For a big residual use a straight line, δ(|r| − ½δ). The ½δ is there so the two pieces meet smoothly at |r| = δ: both give ½δ² and both have slope δ.</p>
  <p>Its derivative is the <strong>clipped residual</strong>: ψ(r) = r when |r| ≤ δ, and ±δ beyond. So an outlier can push on the model, but never harder than δ.</p>
  <h3>Worked by hand: the best constant with δ = 3</h3>
  <p>The best c makes the clipped residuals sum to zero: Σ ψ(yᵢ − c) = 0. Try c = 67 on the typo prices (δ = 3, about one and a half typical misses):</p>
  <table class="tbl">
    <tr><th>y</th><th>r = y − 67</th><th>ψ(r), clipped to ±3</th><th>Huber loss</th></tr>
    <tr><td>38</td><td>−29</td><td>−3</td><td>3·(29 − 1.5) = 82.5</td></tr>
    <tr><td>49</td><td>−18</td><td>−3</td><td>3·(18 − 1.5) = 49.5</td></tr>
    <tr><td>53</td><td>−14</td><td>−3</td><td>37.5</td></tr>
    <tr><td>56</td><td>−11</td><td>−3</td><td>28.5</td></tr>
    <tr><td>67</td><td>0</td><td>0</td><td>0</td></tr>
    <tr><td>68</td><td>1</td><td>1</td><td>½·1² = 0.5</td></tr>
    <tr><td>73</td><td>6</td><td>3</td><td>13.5</td></tr>
    <tr><td>83</td><td>16</td><td>3</td><td>43.5</td></tr>
    <tr><td>87</td><td>20</td><td>3</td><td>55.5</td></tr>
    <tr><td>69 (typo)</td><td>2</td><td>2</td><td>½·2² = 2</td></tr>
    <tr><td colspan="2"><strong>sum</strong></td><td><strong>−12 + 0 + 1 + 9 + 2 = 0</strong> ✓</td><td><strong>313.0</strong></td></tr>
  </table>
  <p>The clipped pushes balance at c = 67, matching the numerical answer from section 02 (313.00 at c = 67). No row, however far, pushes harder than 3. Huber sits between the median interval [67, 68] and the mean 64.3, and here lands right next to the median because one row is badly wrong.</p>
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
  <h3>On a real fit: the flats line with the typo</h3>
  <p>Fit price on area three ways: squared loss on clean data, squared loss with flat J mistyped, and Huber loss with the typo:</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression, HuberRegressor

area  = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14], dtype=float).reshape(-1, 1)
price = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96], dtype=float)
typo = price.copy(); typo[9] = 69                # flat J mistyped

for name, y, model in [("squared loss, clean data", price, LinearRegression()),
                       ("squared loss, with typo ", typo, LinearRegression()),
                       ("Huber loss,   with typo ", typo, HuberRegressor(epsilon=1.35))]:
    m = model.fit(area, y)
    print(f"{name}: price = {m.coef_[0]:.3f} x area + {m.intercept_:.3f}"
          f"   prediction for a 950 sq ft flat: {m.predict([[9.5]])[0]:.2f}")</div>
  <div class="fx" data-lang="text">squared loss, clean data: price = 6.000 x area + 10.000   prediction for a 950 sq ft flat: 67.00
squared loss, with typo : price = 4.527 x area + 21.291   prediction for a 950 sq ft flat: 64.30
Huber loss,   with typo : price = 5.579 x area + 13.174   prediction for a 950 sq ft flat: 66.17</div>
  <p>One bad row out of ten flattened the least-squares slope from 6.00 to 4.53 (₹1.5 lakh less per 100 sq ft) and lifted the intercept from 10 to 21.3; a 950 sq ft flat is now priced at 64.30 instead of 67. Huber's slope 5.58 recovers most of the damage, because the typo can push only with force δ. It does not recover all of it: J is the largest flat, at the end of the line, where any row has the most leverage (<a class="xref" data-note="ml_splits">Train/Val/Test &amp; CV</a>, section 09). In <code>HuberRegressor</code>, <code>epsilon</code> plays the role of δ but in units of an estimated noise scale; 1.35 is the classic choice that keeps 95% of the efficiency of least squares when the noise really is Gaussian.</p>
  <h3>The same idea at scale: 50 rows with three typos</h3>
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
  <p>Three bad rows out of 50 dragged the OLS slope from 2.06 (the fit without the typos) to 1.72 and the intercept from 0.64 to 4.94. With more ordinary rows to outvote the typos, Huber's slope is within 0.011 of the clean fit and its intercept within 0.13.</p>
  <table class="tbl">
    <tr><th></th><th>Squared</th><th>Absolute</th><th>Huber</th></tr>
    <tr><td>Best constant (typo prices)</td><td>mean (64.3)</td><td>median (any of 67–68)</td><td>between (67 at δ = 3)</td></tr>
    <tr><td>Gradient</td><td>2(ŷ − y): grows with the miss</td><td>±1: same for all misses</td><td>clipped: grows, then capped at δ</td></tr>
    <tr><td>Smooth at 0?</td><td>yes</td><td>no (kink)</td><td>yes</td></tr>
    <tr><td>Outliers</td><td>dominate (slope 6 → 4.53)</td><td>ignored in size</td><td>limited influence (slope 5.58)</td></tr>
    <tr><td>Noise model</td><td>Gaussian</td><td>Laplace</td><td>Gaussian centre, heavy tails</td></tr>
    <tr><td>sklearn</td><td><code>LinearRegression</code>, <code>loss="squared_error"</code></td><td><code>QuantileRegressor(quantile=0.5)</code>, <code>"absolute_error"</code></td><td><code>HuberRegressor</code>, <code>loss="huber"</code></td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Huber loss</strong> with threshold δ &gt; 0: L<sub>δ</sub>(r) = ½r² if |r| ≤ δ, else δ(|r| − ½δ). Its derivative ψ(r) = clip(r, −δ, δ) is continuous. As δ → ∞ it becomes (half) squared loss; as δ → 0 it behaves like δ·|r|, i.e. absolute loss.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Choosing δ in raw units without looking at the data's scale. δ = 1 means "a miss of ₹1 lakh" if prices are in lakh (most flats would count as outliers) and "a miss of ₹1" if they are in rupees (nothing would). Set δ relative to the noise level, as <code>HuberRegressor</code> does, or tune it.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Log-Loss.</b> All three losses compare two numbers. The portal also predicts "will this flat sell within 30 days?", a yes/no answer given as a probability. What is the loss for "I said 99% it sells fast, and it did not"?</div>

  <h2 id="lg-log"><span class="num">05</span>Log-Loss / Cross-Entropy</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>For a yes/no answer the model outputs a probability, say 0.818 that flat A sells within 30 days. "Residual" makes little sense for a probability. How wrong is a probability, and how should confident mistakes be punished?</p>
  </div>
  <h3>Derived from the likelihood</h3>
  <p>A binary classifier outputs p = P(y = 1 | x). If the truth is y ∈ {0, 1}, the probability the model gave to what actually happened is p when y = 1 and 1 − p when y = 0. One formula covers both cases (the Bernoulli distribution):</p>
  <p style="text-align:center">P(y | p) = p<sup>y</sup> · (1 − p)<sup>1 − y</sup></p>
  <p>(Check: y = 1 gives p¹·(1−p)⁰ = p; y = 0 gives p⁰·(1−p)¹ = 1 − p.) Exactly as for squared loss, maximum likelihood over independent rows means maximising the product, i.e. minimising the negative log of it:</p>
  <p style="text-align:center">NLL = −Σᵢ [ yᵢ ln pᵢ + (1 − yᵢ) ln(1 − pᵢ) ]</p>
  <p>Divide by n and you have <strong>log-loss</strong>, also called <strong>binary cross-entropy</strong>. In words: <em>minus the log of the probability you gave to the right answer</em>.</p>
  <h3>Worked by hand on the flats</h3>
  <p>In <a class="xref" data-note="ml_intro">What is Machine Learning</a> the flats that sold within 30 days (A, D, F, G) were exactly the ones aged 9 years or more. A simple probabilistic model: score z = 0.5 × (age − 9), probability p = σ(z) = 1/(1 + e<sup>−z</sup>). Score three of our flats and one new flat K, 18 years old, which did <em>not</em> sell fast:</p>
  <table class="tbl">
    <tr><th>flat</th><th>age</th><th>y</th><th>z</th><th>p = P(fast)</th><th>probability given to the truth</th><th>log-loss = −ln(that)</th><th>squared (p − y)²</th></tr>
    <tr><td>A</td><td>12</td><td>1</td><td>1.5</td><td>0.818</td><td>0.818</td><td>0.201</td><td>0.033</td></tr>
    <tr><td>C</td><td>8</td><td>0</td><td>−0.5</td><td>0.378</td><td>0.622</td><td>0.474</td><td>0.143</td></tr>
    <tr><td>F</td><td>10</td><td>1</td><td>0.5</td><td>0.622</td><td>0.622</td><td>0.474</td><td>0.143</td></tr>
    <tr><td>K</td><td>18</td><td>0</td><td>4.5</td><td>0.989</td><td>0.011</td><td>4.511</td><td>0.978</td></tr>
    <tr><td colspan="6"><strong>mean</strong></td><td><strong>1.415</strong></td><td><strong>0.324</strong> (Brier score)</td></tr>
  </table>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.metrics import log_loss

sigmoid = lambda z: 1 / (1 + np.exp(-z))
# "sold within 30 days?" scored by a simple model: z = 0.5 x (age - 9), p = sigmoid(z)
age = np.array([12, 8, 10, 18])                # flats A, C, F and a new flat K
y   = np.array([1, 0, 1, 0])                   # truth: K (18 years) did NOT sell fast
p = sigmoid(0.5 * (age - 9))
print("p = P(sells fast):", p.round(3))

per_row = -(y * np.log(p) + (1 - y) * np.log(1 - p))
print("per-row log loss:", per_row.round(3))
print("mean log loss   :", per_row.mean().round(4), " sklearn:", round(log_loss(y, p), 4))
print("per-row squared :", ((p - y) ** 2).round(4), " Brier =", ((p - y) ** 2).mean().round(4))
print("gradient w.r.t. the score z, p - y:", (p - y).round(3))</div>
  <div class="fx" data-lang="text">p = P(sells fast): [0.818 0.378 0.622 0.989]
per-row log loss: [0.201 0.474 0.474 4.511]
mean log loss   : 1.4152  sklearn: 1.4152
per-row squared : [0.0333 0.1425 0.1425 0.9781]  Brier = 0.3241
gradient w.r.t. the score z, p - y: [-0.182  0.378 -0.378  0.989]</div>
  <p>Look at flat K. Being 98.9% sure of the wrong answer costs 4.51, more than three times the other three rows together (1.15). As p for the true class goes to 0, −ln p goes to infinity. Log-loss punishes <em>confident</em> mistakes brutally, which forces the model to produce honest probabilities. The squared version (the Brier score) caps that row at 0.98. A useful reference: always predicting 0.5 gives log-loss ln 2 = 0.693; anything above that on balanced data is worse than a coin.</p>
  <h3>The gradient: p − y</h3>
  <p>In logistic regression (<a class="xref" data-note="ml_classification">Logistic Regression</a>) the model computes a score z = w·x + b and turns it into a probability with the sigmoid p = σ(z). Differentiate the loss with respect to z, step by step:</p>
  <ol>
    <li>The sigmoid has the neat derivative dσ/dz = σ(z)(1 − σ(z)) = p(1 − p).</li>
    <li>dL/dz = −[ y·(1/p)·p(1 − p) + (1 − y)·(−1/(1 − p))·p(1 − p) ] = −[ y(1 − p) − (1 − y)p ].</li>
    <li>Expand: −[ y − yp − p + yp ] = −[y − p] = <strong>p − y</strong>.</li>
  </ol>
  <p>So ∂L/∂w = (p − y)·x and ∂L/∂b = p − y: "prediction minus truth, times the input", the same shape as the squared-loss gradient for linear regression. On the flats: flat A pushes its score up by 0.182 (p − y = −0.182), flat K pushes down hard, by 0.989. That is why the from-scratch code in section 16 looks almost identical for both models.</p>
  <h3>Multiclass: softmax and cross-entropy</h3>
  <p>With K classes the model outputs K scores z₁…z<sub>K</sub>, and <strong>softmax</strong> turns them into probabilities: pₖ = e<sup>zₖ</sup> / Σⱼ e<sup>zⱼ</sup>. The loss is still −ln(probability of the true class). By hand for a model guessing a flat's locality from its listing, with scores (Baner 2, Kothrud 1, Hadapsar 0): e² = 7.389, e¹ = 2.718, e⁰ = 1, sum 11.107, so p = (0.665, 0.245, 0.090). If the flat is really in Baner, the loss is −ln 0.665 = 0.408. The gradient with respect to the scores is again p − (one-hot truth) = (0.665 − 1, 0.245, 0.090).</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.metrics import log_loss

z = np.array([2.0, 1.0, 0.0])                  # raw scores for Baner, Kothrud, Hadapsar
p = np.exp(z) / np.exp(z).sum()                # softmax
print("softmax probs:", p.round(3), " sum =", p.sum())
true = 0                                       # the flat is really in Baner
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
  <div class="bridge"><b>What this still can't tell us → next: Hinge Loss.</b> Log-loss keeps pushing even on flats that are already classified correctly with a good margin (flat A still costs 0.201). A different idea: stop caring about a row once it is "safely" on the right side. That is the hinge.</div>

  <h2 id="lg-hinge"><span class="num">06</span>Hinge Loss</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Flat A is 12 years old and sold fast; the model already scores it confidently on the right side. Log-loss still charges it 0.201 and keeps nudging the weights for it. Can a loss ignore rows that are safely correct and spend all its effort on the doubtful ones?</p>
  </div>
  <h3>Margins</h3>
  <p>For hinge loss the classes are coded y ∈ {−1, +1}, and the model outputs a raw score f(x) (not a probability). The <strong>margin</strong> m = y·f(x) combines both: positive when the score has the right sign, negative when wrong, and its size says how confidently.</p>
  <p style="text-align:center"><strong>hinge(m) = max(0, 1 − m)</strong></p>
  <p>Zero loss once a row is correct with margin at least 1. A linear penalty for anything less, including rows that are correct but too close to the boundary (0 &lt; m &lt; 1).</p>
  <h3>Worked by hand on the flats</h3>
  <p>Same score f = 0.5 × (age − 9), labels +1 = sold fast, −1 = did not:</p>
  <table class="tbl">
    <tr><th>flat</th><th>y</th><th>score f</th><th>margin m = y·f</th><th>0-1 loss</th><th>hinge max(0, 1 − m)</th></tr>
    <tr><td>A</td><td>+1</td><td>1.5</td><td>1.5</td><td>0</td><td>0</td></tr>
    <tr><td>F</td><td>+1</td><td>0.5</td><td>0.5</td><td>0 (right, but close)</td><td>0.5</td></tr>
    <tr><td>C</td><td>−1</td><td>−0.5</td><td>0.5</td><td>0 (right, but close)</td><td>0.5</td></tr>
    <tr><td>K</td><td>−1</td><td>4.5</td><td>−4.5</td><td>1 (wrong)</td><td>5.5</td></tr>
    <tr><td colspan="4"><strong>mean</strong></td><td><strong>0.25</strong></td><td><strong>1.625</strong></td></tr>
  </table>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.metrics import hinge_loss, zero_one_loss

# "sold within 30 days?" coded as +1 / -1, raw score f = 0.5 x (age - 9)
age = np.array([12, 10, 8, 18])                # flats A, F, C and the new flat K
y   = np.array([+1, +1, -1, -1])               # K did not sell fast
f = 0.5 * (age - 9)
m = y * f                                      # margin: positive = correct side
print("scores       :", f)
print("margins      :", m)
print("0-1 loss     :", (m &lt;= 0).astype(int), " mean =", (m &lt;= 0).mean())
print("hinge loss   :", np.maximum(0, 1 - m), " mean =", np.maximum(0, 1 - m).mean())
print("log loss (ln):", np.log1p(np.exp(-m)).round(3), " mean =", np.log1p(np.exp(-m)).mean().round(3))
print("sklearn hinge:", hinge_loss(y, f), " sklearn 0-1:", zero_one_loss(y, np.sign(f)))

print("\\n margin   0-1   hinge  log2-loss  squared")
for mm in [-2, -1, 0, 0.5, 1, 2]:
    print(f"{mm:7} {int(mm &lt;= 0):5d} {max(0, 1 - mm):7.2f} {np.log2(1 + np.exp(-mm)):9.3f} {(1 - mm) ** 2:8.2f}")</div>
  <div class="fx" data-lang="text">scores       : [ 1.5  0.5 -0.5  4.5]
margins      : [ 1.5  0.5  0.5 -4.5]
0-1 loss     : [0 0 0 1]  mean = 0.25
hinge loss   : [0.  0.5 0.5 5.5]  mean = 1.625
log loss (ln): [0.201 0.474 0.474 4.511]  mean = 1.415
sklearn hinge: 1.625  sklearn 0-1: 0.25

 margin   0-1   hinge  log2-loss  squared
     -2     1    3.00     3.069     9.00
     -1     1    2.00     1.895     4.00
      0     1    1.00     1.000     1.00
    0.5     0    0.50     0.684     0.25
      1     0    0.00     0.452     0.00
      2     0    0.00     0.183     1.00</div>
  <p>The first part matches the hand table and sklearn's <code>hinge_loss</code> and <code>zero_one_loss</code>. Note the "log loss (ln)" line: written with margins, log(1 + e<sup>−m</sup>) gives 0.201, 0.474, 0.474, 4.511, exactly the per-row log-loss of section 05; it is the same loss, just in ±1 notation. The second part tabulates all the classification losses against the margin; the next section uses it.</p>
  <h3>Why the hinge matters: support vectors</h3>
  <p>Rows with m ≥ 1 have zero loss <em>and zero gradient</em>: they do not influence the fit at all. Flat A is out of the picture; only F, C and K matter. Those are the <strong>support vectors</strong>, and minimising hinge loss plus an L2 penalty on w is exactly the soft-margin <a class="xref" data-note="ml_svm">Support Vector Machine</a>. The gradient (strictly a subgradient, because of the corner at m = 1) with respect to w is −y·x for rows with m &lt; 1 and 0 otherwise.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Hinge loss</strong>: L(y, f) = max(0, 1 − y·f) with y ∈ {−1, +1}. It is convex, piecewise linear, an upper bound on the 0-1 loss, and gives sparse solutions (only margin violators matter). It does not produce probabilities.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Feeding 0/1 labels into a hinge formula. With y = 0 the margin y·f is always 0 and every row has loss 1. Libraries convert labels internally; your own code must use −1/+1. Also, SVM scores are not probabilities; <code>SVC(probability=True)</code> fits an extra calibration step (see <a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: 0-1 Loss and Surrogates.</b> All these classification losses are stand-ins. What the portal reports is accuracy, i.e. the 0-1 loss (one mistake in four on A, F, C, K). Why don't we minimise that directly?</div>

  <h2 id="lg-01"><span class="num">07</span>0-1 Loss and Surrogate Losses</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Log-loss and hinge are proxies. The number on the portal's dashboard is "how many flats did we classify wrongly". If that is what we care about, why train on anything else?</p>
  </div>
  <h3>The loss we actually care about</h3>
  <p>0-1 loss is 1 for a wrong class and 0 for a right one: L = 𝟙[m ≤ 0]. Its average is the error rate, 1 − accuracy. It is the honest measure of a classifier. So why train with anything else?</p>
  <ul>
    <li><strong>No useful gradient.</strong> Change w slightly and the predicted classes usually do not change: the loss is flat (gradient 0) almost everywhere, and jumps at the boundary (gradient undefined). Gradient descent has nothing to follow.</li>
    <li><strong>Hard to optimise exactly.</strong> Finding the linear classifier with the fewest training mistakes is NP-hard in general when no perfect separator exists.</li>
    <li><strong>No notion of "almost right".</strong> A row at margin 0.01 and a row at margin 10 count the same, so the model has no incentive to move rows away from the boundary.</li>
  </ul>
  <h3>On all ten flats</h3>
  <p>The score 0.5 × (age − 9) classifies all ten flats correctly. What does each loss say, and what happens if we simply double the score (a "more confident" model with the same decisions)?</p>
  <div class="fx" data-lang="py">import numpy as np
# the same score rule on all ten flats: z = 0.5 x (age - 9); 0-1 loss vs the surrogates
age  = np.array([12, 3, 8, 15, 5, 10, 20, 2, 7, 4])
sold = np.array([1, 0, 0, 1, 0, 1, 1, 0, 0, 0])
z = 0.5 * (age - 9)
m = np.where(sold == 1, 1, -1) * z            # margins with +1/-1 labels
p = 1 / (1 + np.exp(-z))
print("margins       :", m)
print("0-1 loss      :", (m &lt;= 0).mean())
print("hinge loss    :", np.maximum(0, 1 - m).mean(), " (rows still inside the margin:", int((m &lt; 1).sum()), ")")
print("log loss      :", (-(sold * np.log(p) + (1 - sold) * np.log(1 - p))).mean().round(4))
print("doubling the scores: 0-1", (2 * m &lt;= 0).mean(), " hinge", np.maximum(0, 1 - 2 * m).mean(),
      " log loss", np.log1p(np.exp(-2 * m)).mean().round(4))</div>
  <div class="fx" data-lang="text">margins       : [1.5 3.  0.5 3.  2.  0.5 5.5 3.5 1.  2.5]
0-1 loss      : 0.0
hinge loss    : 0.1  (rows still inside the margin: 2 )
log loss      : 0.18
doubling the scores: 0-1 0.0  hinge 0.0  log loss 0.0833</div>
  <p>0-1 loss is 0 and stays 0 when the score is doubled: it cannot tell the two models apart, so it gives an optimiser nothing to work with. Hinge loss is 0.1, contributed by C and F (margin 0.5 each), and drops to 0 once the scores are doubled; then it, too, stops caring. Log-loss keeps falling (0.18 → 0.083) every time the scores are scaled up. On perfectly separable data like this, plain log-loss would push the weights towards infinity; that is one reason logistic regression is always fitted with a penalty (<a class="xref" data-note="ml_regularization">Regularization</a>).</p>
  <h3>Surrogates: convex upper bounds</h3>
  <p>The fix is to minimise a smooth or convex <strong>surrogate</strong> that lies on or above the 0-1 loss and goes down as the margin goes up. Tabulated against the margin (from section 06's run):</p>
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
  <p>With base-2 logs, log-loss in margin form is log₂(1 + e<sup>−m</sup>), which equals 1 at m = 0 and stays above the step, so it is an upper bound on the error rate. Note the squared column: at m = 2 the loss is 1, as large as a wrong answer at m = 0. Squared loss on ±1 labels punishes being "too correct" (flat G, margin 5.5, would cost 20.25), one more reason it is a poor classification loss.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Each surrogate is a modelling choice. Log-loss gives calibrated probabilities and never fully ignores a row. Hinge ignores well-classified rows and gives sparse "support vector" solutions but no probabilities. Exponential loss e<sup>−m</sup> (used by <a class="xref" data-note="ml_adaboost">AdaBoost</a>) punishes negative margins even harder and is very sensitive to label noise. All are <strong>classification-calibrated</strong>: with enough data, minimising them also minimises the 0-1 error.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>0-1 loss</strong>: L(y, ŷ) = 𝟙[y ≠ ŷ] (or 𝟙[y·f ≤ 0]). A <strong>surrogate loss</strong> φ(m) is a tractable (usually convex, differentiable or sub-differentiable) function used in place of the 0-1 loss during training, with φ(m) ≥ 𝟙[m ≤ 0] and φ decreasing in m.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Early-stopping or tuning on log-loss and then being surprised that accuracy did not move, or the reverse. The two can disagree: doubling the flats' scores lowered log-loss from 0.18 to 0.083 without changing a single predicted class. Track the metric you report as well as the loss you train on.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: From Loss to Cost Surface.</b> We have the losses. Now the model has parameters (w, b), and the average loss over the ten flats is a function of them, a landscape. To find the lowest point we need to see that landscape.</div>

  <h2 id="lg-cost"><span class="num">08</span>From Loss to Cost Surface</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A loss scores one prediction; training changes the parameters. How does the average loss over the ten flats change as the slope w and intercept b move, and what shape is that landscape?</p>
  </div>
  <h3>The cost as a function of the parameters</h3>
  <p>The data is fixed during training; the parameters move. So we read the cost J as a function of the parameters. For a line ŷ = w·x + b with squared loss:</p>
  <p style="text-align:center">J(w, b) = (1/n) Σᵢ (w·xᵢ + b − yᵢ)²</p>
  <h3>By hand: the height of the landscape at a few spots</h3>
  <p>Most of these were met in <a class="xref" data-note="ml_intro">What is Machine Learning</a>; now they are points on one surface:</p>
  <table class="tbl">
    <tr><th>(w, b)</th><th>meaning</th><th>J = MSE on the ten flats</th></tr>
    <tr><td>(0, 0)</td><td>predict ₹0 for every flat</td><td>mean of y² = 47906/10 = <strong>4790.6</strong></td></tr>
    <tr><td>(8, 0)</td><td>the broker's rule</td><td>1186/10 = <strong>118.6</strong></td></tr>
    <tr><td>(7, 0)</td><td>the learned rate</td><td>131/10 = <strong>13.1</strong></td></tr>
    <tr><td>(6.5, 5)</td><td>a line with an intercept</td><td>67.25/10 = <strong>6.725</strong></td></tr>
    <tr><td>(6, 10)</td><td>least squares</td><td>46/10 = <strong>4.6</strong></td></tr>
  </table>
  <h3>A cleaner coordinate: centred area</h3>
  <p>Measure area from its average: u = x − 9.5, so u runs −4.5 … 4.5 and Σu = 0. Write the line as ŷ = w·u + c, where c is the predicted price of an average-sized (950 sq ft) flat; the usual intercept is b = c − 9.5w. Because Σu = 0, the cost splits into separate pieces for w and c. With Σu² = 82.5, Σuy = 495, Σy = 670 and the leftover misses (4.6) at the bottom:</p>
  <p style="text-align:center"><strong>J(w, c) = 4.6 + 8.25·(w − 6)² + (c − 67)²</strong></p>
  <p>A bowl whose bottom is at w = 6, c = 67 (i.e. b = 67 − 57 = 10), with height 4.6. It is 8.25 times steeper in w than in c: one lakh per 100 sq ft of slope error costs as much as ₹2.9 lakh of level error.</p>
  <div class="fx" data-lang="py">import numpy as np
x = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14], dtype=float)       # area of flats A..J
y = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96], dtype=float)  # price

def cost(w, b):                                # J(w, b) = mean squared error of y_hat = w*x + b
    return ((w * x + b - y) ** 2).mean()

for w, b in [(0, 0), (8, 0), (7, 0), (6.5, 5), (6, 10)]:
    print(f"J(w={w}, b={b}) = {cost(w, b):9.3f}")

# centred area u = x - 9.5: y_hat = w*u + c, where c = price of an average-sized flat
u = x - x.mean()
print("sum u =", u.sum(), "  sum u^2 =", (u**2).sum(), "  sum u*y =", (u * y).sum(), "  sum y =", y.sum())
for w, c in [(6, 67), (9.9, 13.4), (0, 0)]:
    J = ((w * u + c - y) ** 2).mean()
    print(f"J(w={w}, c={c}) = {J:9.2f}   formula 4.6 + 8.25(w-6)^2 + (c-67)^2 = {4.6 + 8.25*(w-6)**2 + (c-67)**2:9.2f}")</div>
  <div class="fx" data-lang="text">J(w=0, b=0) =  4790.600
J(w=8, b=0) =   118.600
J(w=7, b=0) =    13.100
J(w=6.5, b=5) =     6.725
J(w=6, b=10) =     4.600
sum u = 0.0   sum u^2 = 82.5   sum u*y = 495.0   sum y = 670.0
J(w=6, c=67) =      4.60   formula 4.6 + 8.25(w-6)^2 + (c-67)^2 =      4.60
J(w=9.9, c=13.4) =   3003.04   formula 4.6 + 8.25(w-6)^2 + (c-67)^2 =   3003.04
J(w=0, c=0) =   4790.60   formula 4.6 + 8.25(w-6)^2 + (c-67)^2 =   4790.60</div>
  <p>The first five lines are the hand table. The centred formula reproduces the direct computation at three points, including (0, 0), the same 4790.6 in either coordinate. No (w, b) does better than 4.6 because the ten flats are not on one line. The cost is a quadratic in the parameters, so the landscape is a bowl; its contour lines (points of equal cost) are ellipses, drawn in the next section's figure.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>cost function</strong> (objective, empirical risk) J(θ) = (1/n) Σᵢ L(yᵢ, f(xᵢ; θ)) + λΩ(θ) maps a parameter vector θ to a single number. <strong>Training</strong> solves θ* = argmin<sub>θ</sub> J(θ). The <strong>gradient</strong> ∇J(θ) is the vector of partial derivatives ∂J/∂θⱼ; it points in the direction of steepest increase of J.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Gradient Descent.</b> With two parameters we could scan a grid, or even read the bottom off the formula. A real model has thousands or millions of parameters; scanning is impossible. We need a way to find the bottom of the bowl using only local information: the slope where we stand.</div>

  <h2 id="lg-gd"><span class="num">09</span>Gradient Descent, Derived for Linear Regression</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know the bowl's shape for two parameters. For a model whose bowl we cannot draw or solve, how do we get from a starting guess to the bottom using only the slope at the point where we stand?</p>
  </div>
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
  <p>In plain words: the slope with respect to b is twice the average error (if predictions are too high on average, lower b). The slope with respect to w is twice the average of error × input (if the big flats are over-predicted, lower w). With many features stacked in a matrix X (one row per example, a column of 1s for b), both lines become one: <strong>∇J = (2/n)·Xᵀ(Xθ − y)</strong>.</p>
  <p>For the flats in centred form (ŷ = w·u + c) the sums simplify, because Σu = 0, Σu² = 82.5 and Σuy = 495: ∂J/∂w = (2/10)(82.5w − 495) = <strong>16.5(w − 6)</strong> and ∂J/∂c = (2/10)(10c − 670) = <strong>2(c − 67)</strong>. Each gradient is "steepness × distance from the bottom".</p>
  <h3>Three steps by hand (η = 0.1, start at w = c = 0)</h3>
  <p><strong>Step 1.</strong> At (0, 0): ∂J/∂w = 16.5 × (0 − 6) = −99, ∂J/∂c = 2 × (0 − 67) = −134. New w = 0 − 0.1 × (−99) = <strong>9.9</strong>, c = 0 − 0.1 × (−134) = <strong>13.4</strong>. J = 4.6 + 8.25 × 3.9² + 53.6² = 4.6 + 125.48 + 2872.96 = <strong>3003.04</strong> (down from 4790.6).</p>
  <p><strong>Step 2.</strong> ∂J/∂w = 16.5 × 3.9 = 64.35 (positive: step 1 overshot the slope), ∂J/∂c = 2 × (13.4 − 67) = −107.2. w = 9.9 − 6.435 = <strong>3.465</strong>, c = 13.4 + 10.72 = <strong>24.12</strong>. J = 4.6 + 8.25 × 2.535² + 42.88² = 4.6 + 53.02 + 1838.69 = <strong>1896.31</strong>.</p>
  <p><strong>Step 3.</strong> ∂J/∂w = 16.5 × (−2.535) = −41.83, ∂J/∂c = 2 × (−42.88) = −85.76. w = 3.465 + 4.183 = <strong>7.648</strong>, c = 24.12 + 8.576 = <strong>32.70</strong>, J = 4.6 + 22.40 + 1176.76 = <strong>1203.76</strong>.</p>
  <p>Two different behaviours already show. The slope w jumps across its target 6 every step (0 → 9.9 → 3.47 → 7.65): its distance from 6 is multiplied by 1 − 0.1 × 16.5 = −0.65 each step, a shrinking zig-zag. The level c crawls up (0 → 13.4 → 24.1 → 32.7): its distance from 67 is multiplied by 1 − 0.1 × 2 = 0.8, a slow steady approach.</p>
  <div class="fx" data-lang="py">import numpy as np
x = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14], dtype=float)       # area of flats A..J
y = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96], dtype=float)  # price
u = x - x.mean()                               # centred area (x - 9.5)
w, c, lr = 0.0, 0.0, 0.1                       # start at zero, learning rate 0.1
n = len(x)
for step in range(1, 101):
    err = (w * u + c) - y                      # prediction minus truth
    dw = 2 / n * (err * u).sum()               # dJ/dw
    dc = 2 / n * err.sum()                     # dJ/dc
    w, c = w - lr * dw, c - lr * dc            # move against the gradient
    if step &lt;= 3 or step in (10, 25, 50, 100):
        J = (((w * u + c) - y) ** 2).mean()
        print(f"step {step:3d}: grad=({round(dw, 3) + 0:8.3f}, {round(dc, 3) + 0:8.3f})  w={w:.4f}  c={c:8.4f}  J={J:9.3f}")
print("back to the original intercept: b = c - 9.5 w =", round(c - 9.5 * w, 4))</div>
  <div class="fx" data-lang="text">step   1: grad=( -99.000, -134.000)  w=9.9000  c= 13.4000  J= 3003.042
step   2: grad=(  64.350, -107.200)  w=3.4650  c= 24.1200  J= 1896.311
step   3: grad=( -41.827,  -85.760)  w=7.6478  c= 32.6960  J= 1203.764
step  10: grad=(   2.050,  -17.985)  w=5.9192  c= 59.8059  J=   56.408
step  25: grad=(  -0.003,   -0.633)  w=6.0001  c= 66.7469  J=    4.664
step  50: grad=(   0.000,   -0.002)  w=6.0000  c= 66.9990  J=    4.600
step 100: grad=(   0.000,    0.000)  w=6.0000  c= 67.0000  J=    4.600
back to the original intercept: b = c - 9.5 w = 10.0</div>
  <p>The first three lines are the hand computation. By step 10 the slope has essentially arrived (5.92) while the level is still at 59.8; by step 25 J is 4.664, within 1.4% of the minimum; by step 50 both are exact: w = 6, c = 67, and b = c − 9.5w = 10, the same line the formula gave in earlier notes.</p>
  <figure class="viz"><svg viewBox="0 0 680 330" width="680">
<line x1="55" y1="260" x2="315" y2="260" stroke="currentColor" opacity="0.5"/>
<line x1="55" y1="30" x2="55" y2="260" stroke="currentColor" opacity="0.5"/>
<text x="73.6" y="274" text-anchor="middle" class="tm" font-size="10.5">0</text>
<line x1="73.6" y1="260" x2="73.6" y2="263" stroke="currentColor" opacity="0.5"/>
<text x="110.7" y="274" text-anchor="middle" class="tm" font-size="10.5">2</text>
<line x1="110.7" y1="260" x2="110.7" y2="263" stroke="currentColor" opacity="0.5"/>
<text x="147.9" y="274" text-anchor="middle" class="tm" font-size="10.5">4</text>
<line x1="147.9" y1="260" x2="147.9" y2="263" stroke="currentColor" opacity="0.5"/>
<text x="185" y="274" text-anchor="middle" class="tm" font-size="10.5">6</text>
<line x1="185" y1="260" x2="185" y2="263" stroke="currentColor" opacity="0.5"/>
<text x="222.1" y="274" text-anchor="middle" class="tm" font-size="10.5">8</text>
<line x1="222.1" y1="260" x2="222.1" y2="263" stroke="currentColor" opacity="0.5"/>
<text x="259.3" y="274" text-anchor="middle" class="tm" font-size="10.5">10</text>
<line x1="259.3" y1="260" x2="259.3" y2="263" stroke="currentColor" opacity="0.5"/>
<text x="296.4" y="274" text-anchor="middle" class="tm" font-size="10.5">12</text>
<line x1="296.4" y1="260" x2="296.4" y2="263" stroke="currentColor" opacity="0.5"/>
<text x="50" y="250" text-anchor="end" class="tm" font-size="10.5">0</text>
<line x1="52" y1="246.5" x2="55" y2="246.5" stroke="currentColor" opacity="0.5"/>
<text x="50" y="195.9" text-anchor="end" class="tm" font-size="10.5">20</text>
<line x1="52" y1="192.4" x2="55" y2="192.4" stroke="currentColor" opacity="0.5"/>
<text x="50" y="141.7" text-anchor="end" class="tm" font-size="10.5">40</text>
<line x1="52" y1="138.2" x2="55" y2="138.2" stroke="currentColor" opacity="0.5"/>
<text x="50" y="87.6" text-anchor="end" class="tm" font-size="10.5">60</text>
<line x1="52" y1="84.1" x2="55" y2="84.1" stroke="currentColor" opacity="0.5"/>
<text x="50" y="33.5" text-anchor="end" class="tm" font-size="10.5">80</text>
<line x1="52" y1="30" x2="55" y2="30" stroke="currentColor" opacity="0.5"/>
<polyline points="205.4,65.2 205.4,64.7 205.3,64.3 205.2,63.8 205,63.4 204.7,62.9 204.4,62.5 204.1,62.1 203.6,61.7 203.2,61.3 202.7,60.9 202.1,60.5 201.5,60.1 200.8,59.8 200.1,59.4 199.4,59.1 198.6,58.8 197.7,58.5 196.9,58.2 196,58 195.1,57.7 194.1,57.5 193.1,57.3 192.1,57.2 191.1,57 190.1,56.9 189,56.8 188,56.7 186.9,56.7 185.8,56.6 184.7,56.6 183.7,56.6 182.6,56.7 181.5,56.7 180.5,56.8 179.4,56.9 178.4,57.1 177.4,57.2 176.4,57.4 175.4,57.6 174.5,57.8 173.6,58.1 172.7,58.3 171.8,58.6 171,58.9 170.3,59.2 169.5,59.6 168.8,59.9 168.2,60.3 167.6,60.7 167.1,61.1 166.6,61.5 166.1,61.9 165.7,62.3 165.4,62.7 165.1,63.2 164.9,63.6 164.7,64.1 164.6,64.5 164.6,65 164.6,65.4 164.6,65.9 164.7,66.3 164.9,66.7 165.1,67.2 165.4,67.6 165.7,68.1 166.1,68.5 166.6,68.9 167.1,69.3 167.6,69.7 168.2,70.1 168.8,70.4 169.5,70.8 170.3,71.1 171,71.4 171.8,71.7 172.7,72 173.6,72.3 174.5,72.5 175.4,72.7 176.4,72.9 177.4,73.1 178.4,73.3 179.4,73.4 180.5,73.5 181.5,73.6 182.6,73.7 183.7,73.7 184.7,73.7 185.8,73.7 186.9,73.7 188,73.6 189,73.6 190.1,73.5 191.1,73.3 192.1,73.2 193.1,73 194.1,72.8 195.1,72.6 196,72.4 196.9,72.1 197.7,71.9 198.6,71.6 199.4,71.3 200.1,70.9 200.8,70.6 201.5,70.2 202.1,69.9 202.7,69.5 203.2,69.1 203.6,68.7 204.1,68.3 204.4,67.8 204.7,67.4 205,67 205.2,66.5 205.3,66.1 205.4,65.6 205.4,65.2" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="249.7,65.2 249.6,63.7 249.3,62.3 248.8,60.9 248.2,59.5 247.4,58.1 246.4,56.7 245.3,55.4 244,54.1 242.5,52.8 240.9,51.5 239.1,50.3 237.1,49.2 235,48 232.8,46.9 230.4,45.9 227.9,44.9 225.3,44 222.6,43.2 219.8,42.4 216.8,41.6 213.8,41 210.7,40.4 207.6,39.8 204.3,39.4 201,39 197.7,38.6 194.4,38.4 191,38.2 187.6,38.1 184.1,38.1 180.7,38.2 177.3,38.3 174,38.5 170.6,38.8 167.3,39.2 164,39.6 160.8,40.1 157.7,40.6 154.7,41.3 151.7,42 148.8,42.8 146,43.6 143.4,44.5 140.8,45.4 138.4,46.4 136.1,47.5 133.9,48.6 131.9,49.7 130,50.9 128.3,52.2 126.7,53.4 125.3,54.7 124.1,56.1 123,57.4 122.2,58.8 121.4,60.2 120.9,61.6 120.5,63 120.4,64.5 120.4,65.9 120.5,67.3 120.9,68.7 121.4,70.1 122.2,71.5 123,72.9 124.1,74.3 125.3,75.6 126.7,76.9 128.3,78.2 130,79.4 131.9,80.6 133.9,81.8 136.1,82.9 138.4,83.9 140.8,84.9 143.4,85.9 146,86.8 148.8,87.6 151.7,88.4 154.7,89.1 157.7,89.7 160.8,90.3 164,90.8 167.3,91.2 170.6,91.6 174,91.8 177.3,92 180.7,92.2 184.1,92.2 187.6,92.2 191,92.1 194.4,92 197.7,91.7 201,91.4 204.3,91 207.6,90.5 210.7,90 213.8,89.4 216.8,88.7 219.8,88 222.6,87.2 225.3,86.3 227.9,85.4 230.4,84.4 232.8,83.4 235,82.3 237.1,81.2 239.1,80 240.9,78.8 242.5,77.6 244,76.3 245.3,75 246.4,73.6 247.4,72.2 248.2,70.8 248.8,69.4 249.3,68 249.6,66.6 249.7,65.2" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="314.3,65.2 314.1,62.3 313.6,59.5 312.7,56.6 311.4,53.8 309.8,51.1 307.9,48.3 305.6,45.6 302.9,43 300,40.4 296.7,37.9 293.1,35.5 289.2,33.1 285,30.9" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="82.8,32 78.8,34.3 75.1,36.7 71.6,39.2 68.5,41.7 65.7,44.3 63.2,47 61.1,49.7 59.3,52.4 57.9,55.2 56.8,58.1 56.1,60.9 55.7,63.7 55.7,66.6 56.1,69.5 56.8,72.3 57.9,75.1 59.3,77.9 61.1,80.7 63.2,83.4 65.7,86.1 68.5,88.7 71.6,91.2 75.1,93.7 78.8,96.1 82.8,98.4 87.2,100.6 91.8,102.7 96.6,104.7 101.7,106.6 107.1,108.4 112.6,110 118.4,111.6 124.3,113 130.4,114.2 136.7,115.4 143.1,116.4 149.6,117.2 156.2,117.9 162.9,118.5 169.7,118.9 176.5,119.2 183.3,119.3 190.1,119.3 196.9,119.1 203.7,118.7 210.4,118.2 217.1,117.6 223.7,116.8 230.1,115.9 236.5,114.8 242.6,113.6 248.7,112.3 254.5,110.8 260.2,109.2 265.6,107.5 270.8,105.6 275.8,103.7 280.6,101.6 285,99.5 289.2,97.2 293.1,94.9 296.7,92.4 300,89.9 302.9,87.4 305.6,84.7 307.9,82 309.8,79.3 311.4,76.5 312.7,73.7 313.6,70.9 314.1,68 314.3,65.2" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="61.8,133.5 70.6,136.1 79.7,138.5 89.1,140.7 98.7,142.8 108.6,144.6 118.7,146.1 129,147.5 139.5,148.6 150.1,149.5 160.8,150.1 171.5,150.6 182.3,150.7 193.1,150.7 203.9,150.4 214.6,149.8 225.2,149.1 235.7,148.1 246.1,146.8 256.3,145.4 266.4,143.7 276.1,141.8 285.7,139.7 294.9,137.3 303.9,134.8 312.5,132.1" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="63,174.9 77,177.4 91.3,179.7 105.9,181.6 120.7,183.2 135.6,184.4 150.7,185.3 165.9,185.9 181.2,186.2 196.4,186.1 211.7,185.7 226.8,184.9 241.9,183.8 256.8,182.4 271.4,180.7 285.9,178.6 300,176.2 313.9,173.5" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="61,216.6 80.3,219.1 99.9,221.2 119.7,222.9 139.7,224.1 159.8,224.9 180,225.2 200.1,225.1 220.3,224.6 240.3,223.6 260.2,222.1 279.9,220.3 299.4,217.9" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="59.9,249.2 83.3,251.7 106.9,253.7 130.8,255.2 154.8,256.1 179,256.5 203.1,256.4 227.2,255.7 251.2,254.5 274.9,252.8 298.5,250.5" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="73.6,246.5 183.9,224.7 185,205.6 185,188.7 185,173.9 185,160.9 185,149.4 185,139.3 185,130.4 185,122.6 185,115.7 185,109.6 185,104.3 185,99.6 185,95.5 185,91.8 185,88.6 185,85.8 185,83.3 185,81.2 185,79.2 185,77.6 185,76.1 185,74.8 185,73.6 185,72.6" fill="none" class="st" stroke-width="1.5"/>
<circle cx="73.6" cy="246.5" r="2.2" class="tg"/>
<circle cx="183.9" cy="224.7" r="2.2" class="tg"/>
<circle cx="185" cy="205.6" r="2.2" class="tg"/>
<circle cx="185" cy="188.7" r="2.2" class="tg"/>
<circle cx="185" cy="173.9" r="2.2" class="tg"/>
<circle cx="185" cy="160.9" r="2.2" class="tg"/>
<circle cx="185" cy="149.4" r="2.2" class="tg"/>
<circle cx="185" cy="139.3" r="2.2" class="tg"/>
<circle cx="185" cy="130.4" r="2.2" class="tg"/>
<circle cx="185" cy="122.6" r="2.2" class="tg"/>
<circle cx="185" cy="115.7" r="2.2" class="tg"/>
<circle cx="185" cy="109.6" r="2.2" class="tg"/>
<circle cx="185" cy="104.3" r="2.2" class="tg"/>
<circle cx="185" cy="99.6" r="2.2" class="tg"/>
<circle cx="185" cy="95.5" r="2.2" class="tg"/>
<circle cx="185" cy="91.8" r="2.2" class="tg"/>
<circle cx="185" cy="88.6" r="2.2" class="tg"/>
<circle cx="185" cy="85.8" r="2.2" class="tg"/>
<circle cx="185" cy="83.3" r="2.2" class="tg"/>
<circle cx="185" cy="81.2" r="2.2" class="tg"/>
<circle cx="185" cy="79.2" r="2.2" class="tg"/>
<circle cx="185" cy="77.6" r="2.2" class="tg"/>
<circle cx="185" cy="76.1" r="2.2" class="tg"/>
<circle cx="185" cy="74.8" r="2.2" class="tg"/>
<circle cx="185" cy="73.6" r="2.2" class="tg"/>
<circle cx="185" cy="72.6" r="2.2" class="tg"/>
<polyline points="73.6,246.5 257.4,210.2 137.9,181.2 215.6,158 165.1,139.4 197.9,124.6 176.6,112.7 190.5,103.2 181.4,95.6 187.3,89.5 183.5,84.6 186,80.7 184.4,77.6 185.4,75.1 184.7,73.1 185.2,71.6 184.9,70.3 185.1,69.3 185,68.4 185,67.8 185,67.3 185,66.8 185,66.5 185,66.2 185,66 185,65.9" fill="none" class="sb" stroke-width="2.0"/>
<circle cx="73.6" cy="246.5" r="2.6" class="tb"/>
<circle cx="257.4" cy="210.2" r="2.6" class="tb"/>
<circle cx="137.9" cy="181.2" r="2.6" class="tb"/>
<circle cx="215.6" cy="158" r="2.6" class="tb"/>
<circle cx="165.1" cy="139.4" r="2.6" class="tb"/>
<circle cx="197.9" cy="124.6" r="2.6" class="tb"/>
<circle cx="176.6" cy="112.7" r="2.6" class="tb"/>
<circle cx="190.5" cy="103.2" r="2.6" class="tb"/>
<circle cx="181.4" cy="95.6" r="2.6" class="tb"/>
<circle cx="187.3" cy="89.5" r="2.6" class="tb"/>
<circle cx="183.5" cy="84.6" r="2.6" class="tb"/>
<circle cx="186" cy="80.7" r="2.6" class="tb"/>
<circle cx="184.4" cy="77.6" r="2.6" class="tb"/>
<circle cx="185.4" cy="75.1" r="2.6" class="tb"/>
<circle cx="184.7" cy="73.1" r="2.6" class="tb"/>
<circle cx="185.2" cy="71.6" r="2.6" class="tb"/>
<circle cx="184.9" cy="70.3" r="2.6" class="tb"/>
<circle cx="185.1" cy="69.3" r="2.6" class="tb"/>
<circle cx="185" cy="68.4" r="2.6" class="tb"/>
<circle cx="185" cy="67.8" r="2.6" class="tb"/>
<circle cx="185" cy="67.3" r="2.6" class="tb"/>
<circle cx="185" cy="66.8" r="2.6" class="tb"/>
<circle cx="185" cy="66.5" r="2.6" class="tb"/>
<circle cx="185" cy="66.2" r="2.6" class="tb"/>
<circle cx="185" cy="66" r="2.6" class="tb"/>
<circle cx="185" cy="65.9" r="2.6" class="tb"/>
<text x="185" y="290" text-anchor="middle" class="tm" font-size="11">w (₹ lakh per 100 sq ft)</text>
<text x="25" y="145" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 25 145)">c (price at 950 sq ft)</text>
<text x="185" y="22" text-anchor="middle" font-size="12.5" font-weight="700">batch GD: η = 0.1 vs η = 0.06</text>
<line x1="385" y1="260" x2="645" y2="260" stroke="currentColor" opacity="0.5"/>
<line x1="385" y1="30" x2="385" y2="260" stroke="currentColor" opacity="0.5"/>
<text x="403.6" y="274" text-anchor="middle" class="tm" font-size="10.5">0</text>
<line x1="403.6" y1="260" x2="403.6" y2="263" stroke="currentColor" opacity="0.5"/>
<text x="440.7" y="274" text-anchor="middle" class="tm" font-size="10.5">2</text>
<line x1="440.7" y1="260" x2="440.7" y2="263" stroke="currentColor" opacity="0.5"/>
<text x="477.9" y="274" text-anchor="middle" class="tm" font-size="10.5">4</text>
<line x1="477.9" y1="260" x2="477.9" y2="263" stroke="currentColor" opacity="0.5"/>
<text x="515" y="274" text-anchor="middle" class="tm" font-size="10.5">6</text>
<line x1="515" y1="260" x2="515" y2="263" stroke="currentColor" opacity="0.5"/>
<text x="552.1" y="274" text-anchor="middle" class="tm" font-size="10.5">8</text>
<line x1="552.1" y1="260" x2="552.1" y2="263" stroke="currentColor" opacity="0.5"/>
<text x="589.3" y="274" text-anchor="middle" class="tm" font-size="10.5">10</text>
<line x1="589.3" y1="260" x2="589.3" y2="263" stroke="currentColor" opacity="0.5"/>
<text x="626.4" y="274" text-anchor="middle" class="tm" font-size="10.5">12</text>
<line x1="626.4" y1="260" x2="626.4" y2="263" stroke="currentColor" opacity="0.5"/>
<text x="380" y="250" text-anchor="end" class="tm" font-size="10.5">0</text>
<line x1="382" y1="246.5" x2="385" y2="246.5" stroke="currentColor" opacity="0.5"/>
<text x="380" y="195.9" text-anchor="end" class="tm" font-size="10.5">20</text>
<line x1="382" y1="192.4" x2="385" y2="192.4" stroke="currentColor" opacity="0.5"/>
<text x="380" y="141.7" text-anchor="end" class="tm" font-size="10.5">40</text>
<line x1="382" y1="138.2" x2="385" y2="138.2" stroke="currentColor" opacity="0.5"/>
<text x="380" y="87.6" text-anchor="end" class="tm" font-size="10.5">60</text>
<line x1="382" y1="84.1" x2="385" y2="84.1" stroke="currentColor" opacity="0.5"/>
<text x="380" y="33.5" text-anchor="end" class="tm" font-size="10.5">80</text>
<line x1="382" y1="30" x2="385" y2="30" stroke="currentColor" opacity="0.5"/>
<polyline points="535.4,65.2 535.4,64.7 535.3,64.3 535.2,63.8 535,63.4 534.7,62.9 534.4,62.5 534.1,62.1 533.6,61.7 533.2,61.3 532.7,60.9 532.1,60.5 531.5,60.1 530.8,59.8 530.1,59.4 529.4,59.1 528.6,58.8 527.7,58.5 526.9,58.2 526,58 525.1,57.7 524.1,57.5 523.1,57.3 522.1,57.2 521.1,57 520.1,56.9 519,56.8 518,56.7 516.9,56.7 515.8,56.6 514.7,56.6 513.7,56.6 512.6,56.7 511.5,56.7 510.5,56.8 509.4,56.9 508.4,57.1 507.4,57.2 506.4,57.4 505.4,57.6 504.5,57.8 503.6,58.1 502.7,58.3 501.8,58.6 501,58.9 500.3,59.2 499.5,59.6 498.8,59.9 498.2,60.3 497.6,60.7 497.1,61.1 496.6,61.5 496.1,61.9 495.7,62.3 495.4,62.7 495.1,63.2 494.9,63.6 494.7,64.1 494.6,64.5 494.6,65 494.6,65.4 494.6,65.9 494.7,66.3 494.9,66.7 495.1,67.2 495.4,67.6 495.7,68.1 496.1,68.5 496.6,68.9 497.1,69.3 497.6,69.7 498.2,70.1 498.8,70.4 499.5,70.8 500.3,71.1 501,71.4 501.8,71.7 502.7,72 503.6,72.3 504.5,72.5 505.4,72.7 506.4,72.9 507.4,73.1 508.4,73.3 509.4,73.4 510.5,73.5 511.5,73.6 512.6,73.7 513.7,73.7 514.7,73.7 515.8,73.7 516.9,73.7 518,73.6 519,73.6 520.1,73.5 521.1,73.3 522.1,73.2 523.1,73 524.1,72.8 525.1,72.6 526,72.4 526.9,72.1 527.7,71.9 528.6,71.6 529.4,71.3 530.1,70.9 530.8,70.6 531.5,70.2 532.1,69.9 532.7,69.5 533.2,69.1 533.6,68.7 534.1,68.3 534.4,67.8 534.7,67.4 535,67 535.2,66.5 535.3,66.1 535.4,65.6 535.4,65.2" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="579.7,65.2 579.6,63.7 579.3,62.3 578.8,60.9 578.2,59.5 577.4,58.1 576.4,56.7 575.3,55.4 574,54.1 572.5,52.8 570.9,51.5 569.1,50.3 567.1,49.2 565,48 562.8,46.9 560.4,45.9 557.9,44.9 555.3,44 552.6,43.2 549.8,42.4 546.8,41.6 543.8,41 540.7,40.4 537.6,39.8 534.3,39.4 531,39 527.7,38.6 524.4,38.4 521,38.2 517.6,38.1 514.1,38.1 510.7,38.2 507.3,38.3 504,38.5 500.6,38.8 497.3,39.2 494,39.6 490.8,40.1 487.7,40.6 484.7,41.3 481.7,42 478.8,42.8 476,43.6 473.4,44.5 470.8,45.4 468.4,46.4 466.1,47.5 463.9,48.6 461.9,49.7 460,50.9 458.3,52.2 456.7,53.4 455.3,54.7 454.1,56.1 453,57.4 452.2,58.8 451.4,60.2 450.9,61.6 450.5,63 450.4,64.5 450.4,65.9 450.5,67.3 450.9,68.7 451.4,70.1 452.2,71.5 453,72.9 454.1,74.3 455.3,75.6 456.7,76.9 458.3,78.2 460,79.4 461.9,80.6 463.9,81.8 466.1,82.9 468.4,83.9 470.8,84.9 473.4,85.9 476,86.8 478.8,87.6 481.7,88.4 484.7,89.1 487.7,89.7 490.8,90.3 494,90.8 497.3,91.2 500.6,91.6 504,91.8 507.3,92 510.7,92.2 514.1,92.2 517.6,92.2 521,92.1 524.4,92 527.7,91.7 531,91.4 534.3,91 537.6,90.5 540.7,90 543.8,89.4 546.8,88.7 549.8,88 552.6,87.2 555.3,86.3 557.9,85.4 560.4,84.4 562.8,83.4 565,82.3 567.1,81.2 569.1,80 570.9,78.8 572.5,77.6 574,76.3 575.3,75 576.4,73.6 577.4,72.2 578.2,70.8 578.8,69.4 579.3,68 579.6,66.6 579.7,65.2" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="644.3,65.2 644.1,62.3 643.6,59.5 642.7,56.6 641.4,53.8 639.8,51.1 637.9,48.3 635.6,45.6 632.9,43 630,40.4 626.7,37.9 623.1,35.5 619.2,33.1 615,30.9" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="412.8,32 408.8,34.3 405.1,36.7 401.6,39.2 398.5,41.7 395.7,44.3 393.2,47 391.1,49.7 389.3,52.4 387.9,55.2 386.8,58.1 386.1,60.9 385.7,63.7 385.7,66.6 386.1,69.5 386.8,72.3 387.9,75.1 389.3,77.9 391.1,80.7 393.2,83.4 395.7,86.1 398.5,88.7 401.6,91.2 405.1,93.7 408.8,96.1 412.8,98.4 417.2,100.6 421.8,102.7 426.6,104.7 431.7,106.6 437.1,108.4 442.6,110 448.4,111.6 454.3,113 460.4,114.2 466.7,115.4 473.1,116.4 479.6,117.2 486.2,117.9 492.9,118.5 499.7,118.9 506.5,119.2 513.3,119.3 520.1,119.3 526.9,119.1 533.7,118.7 540.4,118.2 547.1,117.6 553.7,116.8 560.1,115.9 566.5,114.8 572.6,113.6 578.7,112.3 584.5,110.8 590.2,109.2 595.6,107.5 600.8,105.6 605.8,103.7 610.6,101.6 615,99.5 619.2,97.2 623.1,94.9 626.7,92.4 630,89.9 632.9,87.4 635.6,84.7 637.9,82 639.8,79.3 641.4,76.5 642.7,73.7 643.6,70.9 644.1,68 644.3,65.2" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="391.8,133.5 400.6,136.1 409.7,138.5 419.1,140.7 428.7,142.8 438.6,144.6 448.7,146.1 459,147.5 469.5,148.6 480.1,149.5 490.8,150.1 501.5,150.6 512.3,150.7 523.1,150.7 533.9,150.4 544.6,149.8 555.2,149.1 565.7,148.1 576.1,146.8 586.3,145.4 596.4,143.7 606.1,141.8 615.7,139.7 624.9,137.3 633.9,134.8 642.5,132.1" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="393,174.9 407,177.4 421.3,179.7 435.9,181.6 450.7,183.2 465.6,184.4 480.7,185.3 495.9,185.9 511.2,186.2 526.4,186.1 541.7,185.7 556.8,184.9 571.9,183.8 586.8,182.4 601.4,180.7 615.9,178.6 630,176.2 643.9,173.5" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="391,216.6 410.3,219.1 429.9,221.2 449.7,222.9 469.7,224.1 489.8,224.9 510,225.2 530.1,225.1 550.3,224.6 570.3,223.6 590.2,222.1 609.9,220.3 629.4,217.9" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="389.9,249.2 413.3,251.7 436.9,253.7 460.8,255.2 484.8,256.1 509,256.5 533.1,256.4 557.2,255.7 581.2,254.5 604.9,252.8 628.5,250.5" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>
<polyline points="403.6,246.5 448.8,244.6 464.1,243.1 468.9,241.7 446.6,240.4 433.9,239.2 405.4,238.2" fill="none" class="sr" stroke-width="1.1"/>
<polyline points="391.7,234 407.2,232.5 467.3,230.5 471.8,229.2 485.4,227.9 531.8,226.4 553.4,225.1 565.2,224 569.3,222.8 573.4,221.6 603.9,220.6 577.8,219.1 600.7,218.1 611.1,217.1 559.3,215.4 546.6,214.2 571.6,213.2 575.4,212.1 530.7,210.6 550.2,209.5 568.6,208.4 590.4,207.5 554.1,206 514.3,204.7 540.7,203.6 503.6,202.4 507.3,201.3 476.2,200.3 459.2,199.3 455.4,198.2 451.7,197.1 448,196.1 427.8,195.4 411.1,194.9 394.8,194.2" fill="none" class="sr" stroke-width="1.1"/>
<polyline points="396,192.6 399.6,191.6 411.4,190.4 399.1,189.7 410.7,188.6 433.3,187.3 425.1,186.5 421.7,185.5 467.9,184 494.8,182.9 528.5,181.8 519.1,180.9 527.9,180 555.5,179.1 563.5,178.4 580,177.7 587.4,176.9 599.5,176.2 589.3,175.2 602.6,174.7 571.4,173.4 574.2,172.6 586.3,171.9 599.3,171.4 601.9,170.6 592.1,169.6 582.6,168.7 579.4,167.8 576.2,166.9 587.5,166.2 599.3,165.7 562.1,164.5 580.4,163.9 582.8,163.2 573.9,162.4 580.2,161.7 582.6,161 565.7,160.1 557.4,159.3 568.6,158.6 570.9,157.9 573.2,157.3 565,156.5 575.4,155.9 567.3,155.1 559.4,154.3 571.6,153.8 556.3,152.9 541.8,152.1 552.7,151.4 558.5,150.9 531.6,150 509.3,149.3 502.9,148.7 519.6,148 517.1,147.2 528.7,146.6 522.2,145.9 510.3,145.2 521.9,144.6 536,144 514.5,143.3 496.6,142.7 502.6,142.1 497,141.6 498.9,141 484.4,140.4 501.3,139.7 499.1,139 514.3,138.4 524.8,137.8 534.6,137.2 523.4,136.5 533.1,136 514,135.4 515.8,134.8 513.7,134.2 532.3,133.6 515.9,132.9 533.8,132.4 515.5,131.8 520.3,131.3 522,130.8 533.4,130.3 523.1,129.7 539.1,129.2 543.3,128.8 552.2,128.4 534.9,127.7 542.8,127.3 555,126.9 534.6,126.2 529.7,125.7 533.7,125.3 518.8,124.7 520.3,124.3 524.4,123.9 532.3,123.4 545.2,123 543.4,122.5 541.5,121.9 539.7,121.4 550.9,121 535.1,120.4 533.3,119.8 518.2,119.3 516.5,118.8 530.8,118.4 534.3,118 530,117.6 541.9,117.3 545,116.9 554.3,116.6 536.5,116.1 534.9,115.6 542.1,115.3 548,114.9 546.3,114.5 544.7,114 543.1,113.5 544.2,113.2 535.8,112.7 541.6,112.4 527,111.9 525.5,111.4 518.2,111 524.7,110.6 530.8,110.3 536.6,109.9 545.5,109.7 552.9,109.4 539.1,108.8 526.8,108.3 515.8,107.9 522,107.5 532.7,107.2 541.5,106.9 543.8,106.7 550.7,106.4 554.6,106.3 539.4,105.8 527.6,105.3 533.6,105 522.1,104.7 532,104.3 537.4,104.1 544.7,103.9 541.4,103.6 529.9,103.1 530.7,102.8 538.8,102.6 535.8,102.3 540.3,102.1 537.3,101.8 541.6,101.6 534.9,101.2 533.7,100.8 530.8,100.6 524.8,100.2 530.1,100 534.8,99.8 524.6,99.4 532.8,99.1 539.7,98.9 533.4,98.5 532.3,98.2 533,98 534.7,97.8 533.5,97.5 524,97.1 531.7,96.8 533.4,96.7 523.9,96.4 528.5,96.2 532.5,95.9 523.3,95.6 525,95.4 525.7,95.2 517.8,95 526.1,94.7 529.9,94.5 527.7,94.2 519.8,94 513.2,93.8 517.6,93.5 510.4,93.2 511,93 516.2,92.8 524.2,92.6 519.6,92.3 513.5,92.1 512.5,91.8 517.4,91.6 518.8,91.5 513.1,91.3 514.6,91.1 512.9,91 509.1,90.7 508.2,90.5 513.2,90.3 521,90 514.1,89.7 514.6,89.6 518.4,89.4 514.5,89.1 510.9,88.9 507.4,88.7 504.2,88.5 509.2,88.3 506,88.1 502.9,88 498.2,87.8 493.9,87.6 498.4,87.3 495.8,87.2 501.4,86.9 501.9,86.8 506.8,86.6 507.3,86.5 510.9,86.2 514.9,86.1 511.1,86 511.5,85.8 510.7,85.6 507.7,85.4 507,85.2 506.2,85 505.5,84.8 509.7,84.6 513.4,84.4 514.3,84.4 517.4,84.2 523,84 523.8,83.9 522.5,83.8 518,83.7 518.4,83.5 515.3,83.4 515.7,83.3 512.4,83.2 515.6,83 521.3,82.8 515.7,82.6 518.5,82.5 517.8,82.3 514.4,82.2 520,82 524.7,81.9 520.4,81.7 520.7,81.6 522.7,81.5 525,81.4 524.3,81.2 525.9,81.1 527.4,81.1 521.6,80.8 518,80.7 513.1,80.5 512.4,80.4 508.1,80.3 506.8,80.2 504.8,80.1 505.6,80 505.8,80 503.9,79.8 510.7,79.6 513.2,79.5 513.8,79.4 518.8,79.3 520.9,79.1 516.1,78.9 513.9,78.9 516.1,78.8 515.5,78.6 513.4,78.5 512.9,78.4 512.2,78.3 511.7,78.1 511.1,78 510.6,77.9 510,77.7 509.4,77.6 514.7,77.4 515.1,77.4 517.1,77.3 515.1,77.2 514.6,77.1 518.9,77 516.8,76.9 516.9,76.8 518.5,76.8 518.7,76.7 520,76.7 515.8,76.5 515.9,76.5 516.2,76.4 515.7,76.4 515.8,76.3 519.8,76.2 521.4,76.1 520.9,76.1 518.6,76 514.6,75.8 512.8,75.7 514.5,75.6 512.7,75.5 514.4,75.5 512.6,75.4 512.9,75.3 513,75.3 517.2,75.2 517.3,75.1 520.7,75 523.6,74.9 524.8,74.9 524.8,74.9 525.2,74.8 527.2,74.8 524.9,74.6 525,74.6 520.7,74.4 516.8,74.3 516.8,74.3 515.6,74.2 517.2,74.1 518.2,74.1 514.6,73.9 514.7,73.9 514.4,73.9 515.6,73.9 519,73.8 519.1,73.7 519.2,73.7 520.5,73.6 520.6,73.6 521.8,73.5 518,73.4 519.3,73.3 519.4,73.3 520.7,73.2 520.7,73.2 520.4,73.2 518.9,73.1 519,73.1 521.6,73 519.9,73 520,72.9 519.5,72.8 518.3,72.8 518.3,72.7 519.6,72.7 520.7,72.6 523,72.5 523,72.5 523.1,72.5" fill="none" class="sr" stroke-width="1.1"/>
<polyline points="403.6,246.5 587.4,210.2 467.9,181.2 545.6,158 495.1,139.4 527.9,124.6 506.6,112.7 520.5,103.2 511.4,95.6 517.3,89.5 513.5,84.6 516,80.7 514.4,77.6 515.4,75.1 514.7,73.1 515.2,71.6 514.9,70.3 515.1,69.3 515,68.4 515,67.8 515,67.3 515,66.8 515,66.5 515,66.2 515,66 515,65.9" fill="none" class="sb" stroke-width="2.0"/>
<circle cx="403.6" cy="246.5" r="2.6" class="tb"/>
<circle cx="587.4" cy="210.2" r="2.6" class="tb"/>
<circle cx="467.9" cy="181.2" r="2.6" class="tb"/>
<circle cx="545.6" cy="158" r="2.6" class="tb"/>
<circle cx="495.1" cy="139.4" r="2.6" class="tb"/>
<circle cx="527.9" cy="124.6" r="2.6" class="tb"/>
<circle cx="506.6" cy="112.7" r="2.6" class="tb"/>
<circle cx="520.5" cy="103.2" r="2.6" class="tb"/>
<circle cx="511.4" cy="95.6" r="2.6" class="tb"/>
<circle cx="517.3" cy="89.5" r="2.6" class="tb"/>
<circle cx="513.5" cy="84.6" r="2.6" class="tb"/>
<circle cx="516" cy="80.7" r="2.6" class="tb"/>
<circle cx="514.4" cy="77.6" r="2.6" class="tb"/>
<circle cx="515.4" cy="75.1" r="2.6" class="tb"/>
<circle cx="514.7" cy="73.1" r="2.6" class="tb"/>
<circle cx="515.2" cy="71.6" r="2.6" class="tb"/>
<circle cx="514.9" cy="70.3" r="2.6" class="tb"/>
<circle cx="515.1" cy="69.3" r="2.6" class="tb"/>
<circle cx="515" cy="68.4" r="2.6" class="tb"/>
<circle cx="515" cy="67.8" r="2.6" class="tb"/>
<circle cx="515" cy="67.3" r="2.6" class="tb"/>
<circle cx="515" cy="66.8" r="2.6" class="tb"/>
<circle cx="515" cy="66.5" r="2.6" class="tb"/>
<circle cx="515" cy="66.2" r="2.6" class="tb"/>
<circle cx="515" cy="66" r="2.6" class="tb"/>
<circle cx="515" cy="65.9" r="2.6" class="tb"/>
<text x="515" y="290" text-anchor="middle" class="tm" font-size="11">w (₹ lakh per 100 sq ft)</text>
<text x="355" y="145" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 355 145)">c (price at 950 sq ft)</text>
<text x="515" y="22" text-anchor="middle" font-size="12.5" font-weight="700">SGD (one flat per step), η = 0.004</text>
<text x="40" y="305" class="tb" font-size="11">blue η = 0.1: zig-zags in w</text><text x="40" y="320" class="tm" font-size="11">teal η = 0.06: smooth, slower</text><text x="370" y="305" class="tr" font-size="11">red: 400 one-flat steps: noisy,</text><text x="370" y="320" class="tm" font-size="11">slow, never settling exactly at ×</text><text x="185" y="69.2" text-anchor="middle" font-weight="700">×</text><text x="515" y="69.2" text-anchor="middle" font-weight="700">×</text>
</svg><figcaption>Contours of J(w, c) for the ten flats; the ellipses are 8.25 times steeper in w than in c. Left: η = 0.1 (blue) zig-zags across the steep w direction while sliding up in c; η = 0.06 (teal) moves smoothly but more slowly. Right: stochastic updates on one flat at a time (section 12).</figcaption></figure>
  <div class="flow"><span>Start θ (zeros or random)</span><span>Predict, compute errors</span><span>Gradient ∇J = (2/n)Xᵀ(Xθ − y)</span><span>θ ← θ − η∇J</span><span>Repeat until ∇J ≈ 0 or J stops falling</span></div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Gradient descent</strong>: given a differentiable cost J, a start θ₀ and a learning rate η &gt; 0, iterate θ<sub>t+1</sub> = θ<sub>t</sub> − η∇J(θ<sub>t</sub>). For linear regression with MSE, ∇J(θ) = (2/n)Xᵀ(Xθ − y). Stopping rules: a maximum number of iterations, a tolerance on the change in J or on ‖∇J‖, or early stopping on a validation set.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Mixing up the sign or the error definition. With e = ŷ − y the update is θ − η·(2/n)Xᵀe. Writing e = y − ŷ and keeping the minus sign makes you walk <em>uphill</em> and the cost explodes. When in doubt, check that J goes down after the first step (4790.6 → 3003.0 here).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The Learning Rate.</b> We picked η = 0.1 and it worked, with a zig-zag. Why that value? What happens with 0.01 or 0.125, and how can we know the safe range before trying?</div>

  <h2 id="lg-lr"><span class="num">10</span>The Learning Rate</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>With η = 0.1 the slope overshot every step and the level crawled. A bigger η might speed up the level but make the zig-zag worse; a smaller one might calm the zig-zag but crawl even more. Is there a rule for the safe range and the best value?</p>
  </div>
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
  <p>For MSE the curvature is the Hessian matrix H = (2/n)XᵀX. For the flats with columns (u, 1): XᵀX = [[Σu², Σu], [Σu, n]] = [[82.5, 0], [0, 10]], so H = (2/10)·XᵀX has eigenvalues (the curvatures along the bowl's two main axes) <strong>L = 16.5</strong> (the slope direction) and <strong>μ = 2</strong> (the level direction). They are the "16.5" and "2" in the gradients of section 09.</p>
  <ul>
    <li>Stability is decided by the steepest direction: η &lt; 2/L = 2/16.5 = <strong>0.121</strong>.</li>
    <li>Each direction shrinks by (1 − ηλ) per step. With η = 0.1: slope 1 − 1.65 = −0.65 (zig-zag), level 1 − 0.2 = 0.8. With η = 1/L = 0.0606: slope 0 (the slope is exact after one step), level 0.879 (slower).</li>
    <li>The ratio κ = L/μ = 8.25 is the <strong>condition number</strong>. Large κ means a long, thin valley and slow gradient descent; section 13 shows the raw (uncentred) flats have κ = 1,198.</li>
  </ul>
  <div class="fx" data-lang="py">import numpy as np
x = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14], dtype=float)
y = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96], dtype=float)
X = np.c_[x - x.mean(), np.ones(10)]             # columns: centred area u, and 1s (for c)
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

J_best = 4.6                                     # cost at the exact solution (w = 6, c = 67)
print("\\nextra cost J - J_best after t steps")
print("    lr        t=1        t=5       t=20      t=100      t=500")
for lr in [0.01, 0.06, 0.1, 0.12, 0.125]:
    print(f"{lr:6}" + "".join(f"{abs(J - J_best):11.2e}" for J in run(lr, 500)))</div>
  <div class="fx" data-lang="text">X^T X = [[82.5, 0.0], [0.0, 10.0]]  Hessian eigenvalues = [ 2.  16.5]
largest stable learning rate 2/L = 0.1212

extra cost J - J_best after t steps
    lr        t=1        t=5       t=20      t=100      t=500
  0.01   4.52e+03   3.72e+03   2.00e+03   7.90e+01   7.55e-06
  0.06   3.48e+03   1.25e+03   2.70e+01   3.54e-08   2.66e-15
   0.1   3.00e+03   4.86e+02   5.97e-01   0.00e+00   0.00e+00
  0.12   2.88e+03   5.31e+02   1.32e+02   5.22e+00   5.00e-07
 0.125   2.86e+03   7.97e+02   3.36e+03   5.48e+07   6.33e+28</div>
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
<text x="65" y="180.5" text-anchor="end" class="tm" font-size="10.5">1e-8</text>
<line x1="67" y1="177" x2="70" y2="177" stroke="currentColor" opacity="0.5"/>
<text x="65" y="142.5" text-anchor="end" class="tm" font-size="10.5">1e-4</text>
<line x1="67" y1="139" x2="70" y2="139" stroke="currentColor" opacity="0.5"/>
<text x="65" y="104.5" text-anchor="end" class="tm" font-size="10.5">1</text>
<line x1="67" y1="101" x2="70" y2="101" stroke="currentColor" opacity="0.5"/>
<text x="65" y="66.5" text-anchor="end" class="tm" font-size="10.5">1e4</text>
<line x1="67" y1="63" x2="70" y2="63" stroke="currentColor" opacity="0.5"/>
<text x="65" y="28.5" text-anchor="end" class="tm" font-size="10.5">1e8</text>
<line x1="67" y1="25" x2="70" y2="25" stroke="currentColor" opacity="0.5"/>
<polyline points="70,66.3 73.4,66.5 76.7,66.7 80.1,66.9 83.4,67.1 86.8,67.3 90.1,67.4 93.5,67.6 96.8,67.8 100.2,68 103.6,68.1 106.9,68.3 110.3,68.5 113.6,68.6 117,68.8 120.3,69 123.7,69.1 127,69.3 130.4,69.5 133.8,69.6 137.1,69.8 140.5,70 143.8,70.1 147.2,70.3 150.5,70.5 153.9,70.6 157.2,70.8 160.6,71 164,71.1 167.3,71.3 170.7,71.5 174,71.6 177.4,71.8 180.7,72 184.1,72.1 187.4,72.3 190.8,72.5 194.2,72.6 197.5,72.8 200.9,73 204.2,73.1 207.6,73.3 210.9,73.5 214.3,73.6 217.7,73.8 221,74 224.4,74.1 227.7,74.3 231.1,74.5 234.4,74.6 237.8,74.8 241.1,75 244.5,75.1 247.9,75.3 251.2,75.5 254.6,75.6 257.9,75.8 261.3,76 264.6,76.1 268,76.3 271.3,76.5 274.7,76.6 278.1,76.8 281.4,77 284.8,77.1 288.1,77.3 291.5,77.5 294.8,77.6 298.2,77.8 301.5,78 304.9,78.1 308.3,78.3 311.6,78.5 315,78.6 318.3,78.8 321.7,79 325,79.1 328.4,79.3 331.7,79.5 335.1,79.6 338.5,79.8 341.8,80 345.2,80.1 348.5,80.3 351.9,80.5 355.2,80.6 358.6,80.8 361.9,81 365.3,81.1 368.7,81.3 372,81.5 375.4,81.6 378.7,81.8 382.1,82 385.4,82.1 388.8,82.3 392.1,82.5 395.5,82.6 398.9,82.8 402.2,83 405.6,83.1 408.9,83.3 412.3,83.5 415.6,83.6 419,83.8 422.3,84 425.7,84.1 429.1,84.3 432.4,84.5 435.8,84.6 439.1,84.8 442.5,85 445.8,85.1 449.2,85.3 452.6,85.5 455.9,85.6 459.3,85.8 462.6,86 466,86.1 469.3,86.3 472.7,86.5 476,86.6 479.4,86.8 482.8,87 486.1,87.1 489.5,87.3 492.8,87.5 496.2,87.6 499.5,87.8 502.9,88 506.2,88.1 509.6,88.3 513,88.5 516.3,88.6 519.7,88.8 523,89 526.4,89.1 529.7,89.3 533.1,89.5 536.4,89.6 539.8,89.8 543.2,90 546.5,90.1 549.9,90.3 553.2,90.5 556.6,90.6 559.9,90.8 563.3,91 566.6,91.1 570,91.3" fill="none" class="st" stroke-width="2"/>
<text x="320" y="176" class="tm" font-size="11.5">teal: η = 0.01 (too small: slow)</text>
<polyline points="70,68 73.4,69.9 76.7,71.8 80.1,73.6 83.4,75.5 86.8,77.3 90.1,79.2 93.5,81 96.8,82.9 100.2,84.7 103.6,86.6 106.9,88.4 110.3,90.2 113.6,92.1 117,93.9 120.3,95.8 123.7,97.6 127,99.4 130.4,101.3 133.8,103.1 137.1,105 140.5,106.8 143.8,108.7 147.2,110.5 150.5,112.3 153.9,114.2 157.2,116 160.6,117.9 164,119.7 167.3,121.5 170.7,123.4 174,125.2 177.4,127.1 180.7,128.9 184.1,130.7 187.4,132.6 190.8,134.4 194.2,136.3 197.5,138.1 200.9,140 204.2,141.8 207.6,143.6 210.9,145.5 214.3,147.3 217.7,149.2 221,151 224.4,152.8 227.7,154.7 231.1,156.5 234.4,158.4 237.8,160.2 241.1,162.1 244.5,163.9 247.9,165.7 251.2,167.6 254.6,169.4 257.9,171.3 261.3,173.1 264.6,174.9 268,176.8 271.3,178.6 274.7,180.5 278.1,182.3 281.4,184.1 284.8,186 288.1,187.8 291.5,189.7 294.8,191.5 298.2,193.4 301.5,195.2 304.9,197 308.3,198.9 311.6,200.7 315,202.6 318.3,204.4 321.7,206.2 325,208.1 328.4,209.9 331.7,211.8 335.1,213.6 338.5,215 341.8,215 345.2,215 348.5,215 351.9,215 355.2,215 358.6,215 361.9,215 365.3,215 368.7,215 372,215 375.4,215 378.7,215 382.1,215 385.4,215 388.8,215 392.1,215 395.5,215 398.9,215 402.2,215 405.6,215 408.9,215 412.3,215 415.6,215 419,215 422.3,215 425.7,215 429.1,215 432.4,215 435.8,215 439.1,215 442.5,215 445.8,215 449.2,215 452.6,215 455.9,215 459.3,215 462.6,215 466,215 469.3,215 472.7,215 476,215 479.4,215 482.8,215 486.1,215 489.5,215 492.8,215 496.2,215 499.5,215 502.9,215 506.2,215 509.6,215 513,215 516.3,215 519.7,215 523,215 526.4,215 529.7,215 533.1,215 536.4,215 539.8,215 543.2,215 546.5,215 549.9,215 553.2,215 556.6,215 559.9,215 563.3,215 566.6,215 570,215" fill="none" class="sb" stroke-width="2"/>
<text x="320" y="192" class="tb" font-size="11.5">blue: η = 0.1 (fastest here)</text>
<polyline points="70,68.1 73.4,70.1 76.7,72 80.1,73.7 83.4,75.1 86.8,76.3 90.1,77.2 93.5,77.9 96.8,78.4 100.2,78.8 103.6,79.1 106.9,79.4 110.3,79.6 113.6,79.8 117,80 120.3,80.2 123.7,80.3 127,80.5 130.4,80.7 133.8,80.8 137.1,81 140.5,81.2 143.8,81.3 147.2,81.5 150.5,81.7 153.9,81.8 157.2,82 160.6,82.2 164,82.3 167.3,82.5 170.7,82.7 174,82.8 177.4,83 180.7,83.2 184.1,83.3 187.4,83.5 190.8,83.7 194.2,83.8 197.5,84 200.9,84.2 204.2,84.3 207.6,84.5 210.9,84.7 214.3,84.8 217.7,85 221,85.2 224.4,85.3 227.7,85.5 231.1,85.7 234.4,85.8 237.8,86 241.1,86.2 244.5,86.3 247.9,86.5 251.2,86.7 254.6,86.8 257.9,87 261.3,87.2 264.6,87.3 268,87.5 271.3,87.7 274.7,87.8 278.1,88 281.4,88.2 284.8,88.3 288.1,88.5 291.5,88.7 294.8,88.8 298.2,89 301.5,89.2 304.9,89.3 308.3,89.5 311.6,89.7 315,89.8 318.3,90 321.7,90.2 325,90.3 328.4,90.5 331.7,90.7 335.1,90.8 338.5,91 341.8,91.2 345.2,91.3 348.5,91.5 351.9,91.7 355.2,91.8 358.6,92 361.9,92.2 365.3,92.3 368.7,92.5 372,92.7 375.4,92.8 378.7,93 382.1,93.2 385.4,93.3 388.8,93.5 392.1,93.7 395.5,93.8 398.9,94 402.2,94.2 405.6,94.3 408.9,94.5 412.3,94.7 415.6,94.8 419,95 422.3,95.2 425.7,95.3 429.1,95.5 432.4,95.7 435.8,95.8 439.1,96 442.5,96.2 445.8,96.3 449.2,96.5 452.6,96.7 455.9,96.8 459.3,97 462.6,97.2 466,97.3 469.3,97.5 472.7,97.7 476,97.8 479.4,98 482.8,98.2 486.1,98.3 489.5,98.5 492.8,98.7 496.2,98.8 499.5,99 502.9,99.2 506.2,99.3 509.6,99.5 513,99.7 516.3,99.8 519.7,100 523,100.2 526.4,100.3 529.7,100.5 533.1,100.7 536.4,100.8 539.8,101 543.2,101.2 546.5,101.3 549.9,101.5 553.2,101.7 556.6,101.8 559.9,102 563.3,102.2 566.6,102.3 570,102.5" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="5 3"/>
<text x="320" y="160" class="tm" font-size="11.5">dashed: η = 0.12 (zig-zag, slow)</text>
<polyline points="70,68.2 73.4,70.1 76.7,71.7 80.1,72.8 83.4,73.4 86.8,73.6 90.1,73.6 93.5,73.3 96.8,72.9 100.2,72.4 103.6,72 106.9,71.5 110.3,71 113.6,70.5 117,70 120.3,69.5 123.7,69 127,68.5 130.4,68 133.8,67.5 137.1,67 140.5,66.5 143.8,66 147.2,65.5 150.5,65 153.9,64.5 157.2,64 160.6,63.5 164,63 167.3,62.5 170.7,62 174,61.5 177.4,61 180.7,60.5 184.1,60 187.4,59.5 190.8,59 194.2,58.5 197.5,58 200.9,57.5 204.2,57 207.6,56.5 210.9,56 214.3,55.5 217.7,55 221,54.5 224.4,54 227.7,53.5 231.1,53 234.4,52.5 237.8,52 241.1,51.5 244.5,51 247.9,50.5 251.2,50 254.6,49.5 257.9,49 261.3,48.5 264.6,48 268,47.5 271.3,47 274.7,46.5 278.1,46 281.4,45.5 284.8,45 288.1,44.5 291.5,44 294.8,43.5 298.2,43 301.5,42.5 304.9,42 308.3,41.5 311.6,41 315,40.5 318.3,40 321.7,39.5 325,39 328.4,38.5 331.7,38 335.1,37.5 338.5,37 341.8,36.5 345.2,36 348.5,35.5 351.9,35 355.2,34.5 358.6,34 361.9,33.5 365.3,33 368.7,32.5 372,32 375.4,31.5 378.7,31 382.1,30.5 385.4,30 388.8,29.5 392.1,29 395.5,28.5 398.9,28 402.2,27.5 405.6,27 408.9,26.5 412.3,26 415.6,25.5 419,25 422.3,25 425.7,25 429.1,25 432.4,25 435.8,25 439.1,25 442.5,25 445.8,25 449.2,25 452.6,25 455.9,25 459.3,25 462.6,25 466,25 469.3,25 472.7,25 476,25 479.4,25 482.8,25 486.1,25 489.5,25 492.8,25 496.2,25 499.5,25 502.9,25 506.2,25 509.6,25 513,25 516.3,25 519.7,25 523,25 526.4,25 529.7,25 533.1,25 536.4,25 539.8,25 543.2,25 546.5,25 549.9,25 553.2,25 556.6,25 559.9,25 563.3,25 566.6,25 570,25" fill="none" class="sr" stroke-width="2"/>
<text x="320" y="144" class="tr" font-size="11.5">red: η = 0.125 red: η = 0.125 (&gt; 2/L = 0.121: diverges)gt; 2/L = 0.121, diverges</text>
<text x="320" y="245" text-anchor="middle" class="tm" font-size="11">step</text>
<text x="18" y="120" text-anchor="middle" class="tm" font-size="11" transform="rotate(-90 18 120)">J − J_best (log)</text>
</svg><figcaption>Extra cost above the minimum (log scale) for four learning rates on the ten flats. 0.125 is above the 2/L limit and explodes. 0.01 is safe but crawls. 0.12 is just inside the limit: the slope direction shrinks by only |1 − 0.12 × 16.5| = 0.98 per step, so it zig-zags for a long time. 0.1 balances the two directions and wins.</figcaption></figure>
  <p>Read the table row by row. η = 0.01: still 2,000 above the minimum after 20 steps. η = 0.06 (= 1/L): fixes the slope at once but the level shrinks only by 0.879 per step. η = 0.1: exact to machine precision by step 100. η = 0.12: legal but slow, because the steep direction now barely shrinks. η = 0.125: the cost multiplies at every step, reaching 10²⁸ by step 500.</p>
  <h3>Learning-rate schedules (brief)</h3>
  <p>In practice η is often reduced during training: step decay (halve η every k epochs), exponential decay, 1/t decay (sklearn's <code>"invscaling"</code>), or cosine annealing, sometimes after a short warm-up. Large steps early cover distance; small steps late settle into the minimum. For stochastic methods a decaying η is needed for exact convergence (section 12). Details in <a class="xref" data-note="m_optimization">Optimization</a>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>For a quadratic cost (or near a minimum of a smooth cost) with Hessian eigenvalues between μ and L, gradient descent with fixed η converges if and only if 0 &lt; η &lt; 2/L; the error along each eigen-direction shrinks by |1 − ηλ| per step, so the slowest direction contracts by about 1 − ημ, giving roughly κ = L/μ steps per factor of e improvement when η ≈ 1/L.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reading a rising loss as "the model is too simple". If the training loss goes <em>up</em> or turns into <code>nan</code>, the learning rate is almost always too large (or the features are unscaled, which makes L huge). Divide η by 10 and try again before touching anything else.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Convexity.</b> Our bowl had exactly one bottom, so "keep going downhill" was guaranteed to find it. Is that always true? When can gradient descent get stuck somewhere that is not the best?</div>

  <h2 id="lg-convex"><span class="num">11</span>Convexity</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Gradient descent only sees the local slope. On the flats' bowl that was enough, but a landscape with several valleys could trap it in a worse one. Which costs guarantee that the bottom we reach is the best one?</p>
  </div>
  <h3>Plain meaning</h3>
  <p>A function is <strong>convex</strong> if it is bowl-shaped everywhere: the straight line (chord) between any two points on the curve lies on or above the curve. A convex function has no false valleys, so <em>any</em> point where the gradient is zero is the global minimum. Gradient descent with a sensible learning rate cannot get trapped.</p>
  <h3>Checking by hand</h3>
  <p>Take the flats' cost along the slope direction with c fixed at 67: J(w) = 4.6 + 8.25(w − 6)². At w = 4 and w = 8, J = 4.6 + 33 = 37.6 both. The chord's midpoint is at w = 6 with height 37.6. The curve at w = 6 is 4.6 ≤ 37.6 ✓. A quicker test for smooth functions: the second derivative is ≥ 0 everywhere (here J'' = 16.5). In many dimensions: the Hessian matrix is positive semi-definite (all eigenvalues ≥ 0).</p>
  <ul>
    <li><strong>MSE for linear regression</strong>: Hessian (2/n)XᵀX, whose eigenvalues are always ≥ 0 (16.5 and 2 for the centred flats). Convex. If two features are perfectly collinear one eigenvalue is 0: still convex, but the minimum is a whole line of equally good solutions (area in sq ft and in sq m together would do this).</li>
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
    <p>"Convex means fast." Convexity guarantees you reach the right place, not how quickly. The flats' convex bowl still needed about 50 steps with the best η; the raw, uncentred version (section 13) needs 8,549.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Batch vs Stochastic vs Mini-batch.</b> Every step so far used all ten flats to compute the gradient. With 10 million rows that is 10 million calculations for one small step. Could we step after looking at only some of them?</div>

  <h2 id="lg-batch"><span class="num">12</span>Batch vs Stochastic vs Mini-batch</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each gradient step averaged the errors of all ten flats. The portal has lakhs of past sales. Must every single step read all of them, or is a rough direction from a few rows good enough?</p>
  </div>
  <h3>The idea</h3>
  <p>The full gradient is an <em>average</em> of per-row gradients. An average can be estimated from a sample. So instead of all n rows, use a random handful each step: much cheaper per step, slightly noisy in direction.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Deciding which way the crowd is moving at a railway station. Batch: interview all 10,000 passengers before taking one step. SGD: ask one random passenger and step. Mini-batch: ask 32 people. Asking 32 is nearly as reliable as asking 10,000, and you take 300 steps in the time batch takes one.</p>
  </div>
  <h3>By hand: one stochastic step on the flats</h3>
  <p>At the start (w = c = 0) every error is eᵢ = −yᵢ, so flat i's own gradient is (2eᵢuᵢ, 2eᵢ). For flat J (u = 4.5, y = 96): (2 × (−96) × 4.5, 2 × (−96)) = (−864, −192). One SGD step with η = 0.01 on flat J alone: w = 0 + 0.01 × 864 = <strong>8.64</strong>, c = 0 + 0.01 × 192 = <strong>1.92</strong>. A different flat would point somewhere else; flat A (u = −4.5, y = 38) says (+342, −76), "make the slope smaller". But on average they agree with the full gradient:</p>
  <div class="fx" data-lang="py">import numpy as np
x = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14], dtype=float)
y = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96], dtype=float)
u = x - x.mean()                                  # centred area, as in section 09
w, c = 0.0, 0.0
err = w * u + c - y                               # all errors at the start: -y
per_row = np.c_[2 * err * u, 2 * err]             # each flat's own gradient (dw, dc)
print("per-flat gradients (dw, dc):")
for name, g in zip("ABCDEFGHIJ", per_row):
    print(f"   {name}: ({g[0]:7.1f}, {g[1]:6.1f})")
print("average of the 10 =", per_row.mean(axis=0),
      "  full-batch gradient =", [float(2 / 10 * (err * u).sum()), float(2 / 10 * err.sum())])
lr = 0.01
g = per_row[9]                                    # SGD: one random flat, say J
print("one SGD step on flat J with lr = 0.01 -&gt;  w =", w - lr * g[0], " c =", c - lr * g[1])</div>
  <div class="fx" data-lang="text">per-flat gradients (dw, dc):
   A: (  342.0,  -76.0)
   B: (  343.0,  -98.0)
   C: (  265.0, -106.0)
   D: (  168.0, -112.0)
   E: (   67.0, -134.0)
   F: (  -68.0, -136.0)
   G: ( -219.0, -146.0)
   H: ( -415.0, -166.0)
   I: ( -609.0, -174.0)
   J: ( -864.0, -192.0)
average of the 10 = [ -99. -134.]   full-batch gradient = [-99.0, -134.0]
one SGD step on flat J with lr = 0.01 -&gt;  w = 8.64  c = 1.92</div>
  <p>The ten per-flat gradients disagree wildly (from +343 to −864 in w), but their average is exactly the full-batch gradient (−99, −134) of section 09. A random row's gradient is an <strong>unbiased</strong> but noisy estimate of the true gradient. The right panel of the contour figure in section 09 shows 400 such single-flat steps: a ragged path that heads the right way but never settles exactly at the bottom.</p>
  <h3>The three variants at scale: 10,000 rows</h3>
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
    <li><strong>But</strong> with a constant learning rate the stochastic versions never settle: SGD's MSE wanders (1.033 → 1.040 → 1.038) and its weights are visibly off (2.937 vs 2.998). The noise in each step keeps kicking it around the bottom. A decaying learning rate fixes this.</li>
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
    <tr><td>Gradient noise</td><td>none</td><td>high (flats: −864 to +343)</td><td>medium, shrinks like 1/√b</td></tr>
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
    <p>Not shuffling. If the rows are sorted (by date, by area, by class), consecutive mini-batches are not random samples: the model chases the small flats, then the big ones. Shuffle every epoch (the code does <code>r.permutation(n)</code>). Also: when you change the batch size, retune the learning rate; larger batches usually allow a larger η.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Feature Scaling and Convergence.</b> We quietly centred the area before running gradient descent. What actually happens if we use the raw area (5 … 14), or area in square feet (500 … 1,400)?</div>

  <h2 id="lg-scale"><span class="num">13</span>Feature Scaling and Convergence</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Section 09 measured area from its average "to keep the arithmetic clean". Was that only cosmetic? Gradient descent on the raw area, or on area in square feet, solves the same problem; does it take the same number of steps?</p>
  </div>
  <h3>Why scale changes the shape of the bowl</h3>
  <p>For MSE, the curvature along feature j is about 2·(average of xⱼ²). The intercept's curvature is 2. With centred area (average u² = 8.25) the two curvatures are 16.5 and 2: ratio 8.25. With raw area (average x² = 98.5, and x is tangled with the intercept because it is never near 0) the ratio becomes about 1,200. With area in square feet, x² is 10,000 times larger again. The bowl turns into a canyon: extremely steep across one direction, almost flat along another.</p>
  <p>The learning rate must stay below 2/L for the steep direction, so along the flat direction each step moves almost nothing. Gradient descent zig-zags across the canyon and crawls along it.</p>
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
  <h3>Measured on the ten flats</h3>
  <p>Gradient descent with its best safe step (η = 1/L), counting steps until the cost is within one part per million of the exact minimum 4.6, for four versions of the same feature:</p>
  <div class="fx" data-lang="py">import numpy as np
x = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14], dtype=float)       # area, 100 sq ft
y = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96], dtype=float)

def gd_steps(feature, max_steps=100_000, tol=1e-6):
    Xb = np.c_[feature, np.ones(len(y))]
    H = 2 / len(y) * Xb.T @ Xb
    eig = np.linalg.eigvalsh(H)
    lr = 1 / eig.max()                                    # the best safe step for this bowl
    best = np.linalg.lstsq(Xb, y, rcond=None)[0]
    J_best = ((Xb @ best - y) ** 2).mean()
    theta = np.zeros(2)
    for t in range(1, max_steps + 1):
        theta -= lr * 2 / len(y) * Xb.T @ (Xb @ theta - y)
        if ((Xb @ theta - y) ** 2).mean() - J_best &lt; tol * J_best:
            return t, eig.max() / eig.min(), lr
    return f"&gt;{max_steps}", eig.max() / eig.min(), lr

for name, f in [("raw area (5..14)", x), ("area in sq ft (500..1400)", 100 * x),
                ("centred (x - 9.5)", x - x.mean()), ("standardized", (x - x.mean()) / x.std())]:
    steps, kappa, lr = gd_steps(f)
    print(f"{name:26s}: condition number = {kappa:12.1f}   lr = {lr:.2e}   steps to converge = {steps}")</div>
  <div class="fx" data-lang="text">raw area (5..14)          : condition number =       1198.0   lr = 5.03e-03   steps to converge = 8549
area in sq ft (500..1400) : condition number =   11760324.9   lr = 5.08e-07   steps to converge = &gt;100000
centred (x - 9.5)         : condition number =          8.3   lr = 6.06e-02   steps to converge = 81
standardized              : condition number =          1.0   lr = 5.00e-01   steps to converge = 1</div>
  <p>Same ten flats, same line, same answer. Raw area: condition number 1,198 and 8,549 steps. Area in square feet: κ ≈ 11.8 million, not converged in 100,000 steps. Centred: κ = 8.25 (the 16.5 / 2 of section 10) and 81 steps. Standardized (centred and divided by the standard deviation 2.87): κ = 1, a perfectly round bowl, and one step with η = 0.5 lands exactly on the bottom. Only the optimiser's job changed; after converting the weights back, the line is price = 6 × area + 10 every time.</p>
  <h3>The same effect at scale: 500 flats with two features</h3>
  <p>500 flats, price = 0.05·size + 2·rooms + 5 + noise, with size in square feet (standard deviation about 720) and rooms (about 1.2):</p>
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
  <p>The raw condition number is about 29 million; gradient descent does not get close in 100,000 steps. After <code>StandardScaler</code> (each column minus its mean, divided by its standard deviation) κ = 11 and it converges in 82 steps.</p>
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
    <p>Fitting the scaler on the full dataset before splitting. The test rows' mean and spread leak into training. Put the scaler inside a <code>Pipeline</code> so it is fitted on training folds only (<a class="xref" data-note="ml_pipelines">Pipelines &amp; Data Leakage</a>). And remember to scale new data with the <em>training</em> statistics at prediction time (a new flat's area minus the training mean 9.5, not its own).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Momentum and Adam.</b> Scaling helps when the long, thin valley lines up with the feature axes. Valleys can also be tilted (correlated features) or appear in non-convex networks where you cannot rescale them away. Better optimisers adapt the step themselves.</div>

  <h2 id="lg-adam"><span class="num">14</span>Momentum and Adam (Brief)</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>On the raw flats, plain gradient descent needed 8,549 steps because it zig-zags across a canyon and crawls along it. If we cannot or did not rescale, can the optimiser itself learn to take longer strides along the valley and shorter ones across it?</p>
  </div>
  <h3>Momentum: a ball rolling downhill</h3>
  <p>Keep a running "velocity" v that adds up past gradients: v ← β·v + ∇J, then θ ← θ − η·v (β ≈ 0.9). Along the valley floor the gradients keep pointing the same way, so v builds up speed. Across the valley they flip sign every step, so they cancel in v and the zig-zag is damped.</p>
  <p><strong>By hand</strong> on a long bowl J = ½(w₁² + 50·w₂²) from (10, 1), η = 0.02, β = 0.9. Gradient = (w₁, 50·w₂) = (10, 50).</p>
  <ul>
    <li>Plain GD step: (10 − 0.02·10, 1 − 0.02·50) = (9.8, 0.0).</li>
    <li>Momentum step 1: v = (10, 50), same as GD → (9.8, 0.0). Step 2: gradient (9.8, 0); v = 0.9·(10, 50) + (9.8, 0) = (18.8, 45); θ = (9.8 − 0.376, 0 − 0.9) = (9.424, −0.9). In w₁ (the slow direction) it moved 0.376 instead of plain GD's 0.196: almost twice as fast. In w₂ it overshot; later steps damp that.</li>
  </ul>
  <h3>Adam: a separate step size per parameter</h3>
  <p>Adam keeps two running averages per parameter: m (the average gradient, like momentum) and s (the average <em>squared</em> gradient, a measure of that parameter's typical gradient size). It steps by m / √s, so a parameter with huge gradients takes small steps and one with tiny gradients takes bigger ones. Early averages start at 0 and are biased low, so both are divided by (1 − βᵗ).</p>
  <p><strong>By hand</strong>, step 1 from (10, 1), η = 0.5, β₁ = 0.9, β₂ = 0.999: g = (10, 50). m = 0.1·g = (1, 5); s = 0.001·g² = (0.1, 2.5). Bias-corrected: m̂ = m/0.1 = (10, 50), ŝ = s/0.001 = (100, 2,500). Step = 0.5·m̂/√ŝ = 0.5·(10/10, 50/50) = (0.5, 0.5). Both coordinates move by exactly 0.5 even though their gradients differ 5-fold: the step size has been normalised per coordinate.</p>
  <h3>On the raw flats</h3>
  <p>The flats with raw area (κ = 1,198), all three optimisers stopping at one part per million above the minimum:</p>
  <div class="fx" data-lang="py">import numpy as np
x = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14], dtype=float)       # RAW area: kappa = 1198
y = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96], dtype=float)
X = np.c_[x, np.ones(10)]
grad = lambda th: 2 / 10 * X.T @ (X @ th - y)
J = lambda th: ((X @ th - y) ** 2).mean()
L = np.linalg.eigvalsh(2 / 10 * X.T @ X).max()

def steps_to_converge(update, max_steps=50_000):
    th, state = np.zeros(2), {}
    for t in range(1, max_steps + 1):
        th = update(th, state, t)
        if J(th) - 4.6 &lt; 1e-6 * 4.6:
            return t, th
    return None, th

def gd(th, s, t):
    return th - (1 / L) * grad(th)
def momentum(th, s, t, beta=0.9):
    s["v"] = beta * s.get("v", 0) + grad(th)
    return th - (1 / L) * s["v"]
def adam(th, s, t, lr=0.5, b1=0.9, b2=0.999, eps=1e-8):
    g = grad(th)
    s["m"] = b1 * s.get("m", 0) + (1 - b1) * g
    s["s"] = b2 * s.get("s", 0) + (1 - b2) * g**2
    m_hat, s_hat = s["m"] / (1 - b1**t), s["s"] / (1 - b2**t)
    return th - lr * m_hat / (np.sqrt(s_hat) + eps)

for name, fn in [("plain GD", gd), ("momentum", momentum), ("Adam", adam)]:
    t, th = steps_to_converge(fn)
    print(f"{name:9s} on the raw flats: steps = {t}   (w, b) = {th.round(3)}")</div>
  <div class="fx" data-lang="text">plain GD  on the raw flats: steps = 8549   (w, b) = [6.001 9.993]
momentum  on the raw flats: steps = 792   (w, b) = [6.001 9.993]
Adam      on the raw flats: steps = 975   (w, b) = [6.001 9.993]</div>
  <p>Momentum cuts the steps from 8,549 to 792, more than ten times fewer, without touching the data. Adam (η = 0.5) needs 975; both reach the same (6, 10). Standardizing first (one step, section 13) is still the cheapest fix when it is available.</p>
  <h3>The stylised bowl in code</h3>
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
  <div class="bridge"><b>What this still can't tell us → next: Closed Form vs Iterative.</b> For the flats' line the bottom of the bowl can be computed in one go, without any steps; earlier notes did exactly that. When is that better, and why can't we do it for every model?</div>

  <h2 id="lg-closed"><span class="num">15</span>Closed Form vs Iterative</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Gradient descent took 50 to 8,549 steps to reach w = 6, b = 10, which <a class="xref" data-note="ml_intro">What is Machine Learning</a> found with one formula. If a formula exists, why iterate at all, and for which losses does such a formula exist?</p>
  </div>
  <h3>Setting the gradient to zero</h3>
  <p>At the bottom of the bowl the gradient is zero: (2/n)Xᵀ(Xθ − y) = 0, which rearranges to the <strong>normal equation</strong> XᵀXθ = Xᵀy, and (if XᵀX is invertible) θ = (XᵀX)⁻¹Xᵀy.</p>
  <h3>By hand on the ten flats</h3>
  <p>With columns (x, 1): XᵀX = [[Σx², Σx], [Σx, n]] = [[985, 95], [95, 10]] and Xᵀy = [Σxy, Σy] = [6860, 670]. Solve the 2×2 system 985w + 95b = 6860, 95w + 10b = 670. Determinant = 985·10 − 95·95 = 9850 − 9025 = 825.</p>
  <ul>
    <li>w = (10·6860 − 95·670)/825 = (68600 − 63650)/825 = 4950/825 = <strong>6</strong></li>
    <li>b = (985·670 − 95·6860)/825 = (659950 − 651700)/825 = 8250/825 = <strong>10</strong></li>
  </ul>
  <p>The same point gradient descent walked to, and the same as the slope formula Σ(x − x̄)(y − ȳ)/Σ(x − x̄)² = 495/82.5 of the first note (that formula is this 2×2 solve written out).</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression

x = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14], dtype=float)
y = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96], dtype=float)
X = np.c_[x, np.ones(10)]                        # columns: area, 1
XtX, Xty = X.T @ X, X.T @ y
print("X^T X =", XtX.tolist(), "  X^T y =", Xty.tolist())
print("solve(X^T X, X^T y) :", np.linalg.solve(XtX, Xty).round(4))   # [w, b]
print("lstsq (SVD)         :", np.linalg.lstsq(X, y, rcond=None)[0].round(4))
m = LinearRegression().fit(x[:, None], y)
print("sklearn             :", round(m.coef_[0], 4), round(m.intercept_, 4))</div>
  <div class="fx" data-lang="text">X^T X = [[985.0, 95.0], [95.0, 10.0]]   X^T y = [6860.0, 670.0]
solve(X^T X, X^T y) : [ 6. 10.]
lstsq (SVD)         : [ 6. 10.]
sklearn             : 6.0 10.0</div>
  <p><code>np.linalg.solve</code> solves the system without forming an inverse; <code>lstsq</code> uses the SVD and also copes with collinear columns; <code>LinearRegression</code> uses an lstsq-style solver internally. The full derivation and statistics of OLS are in <a class="xref" data-note="ml_regression">Linear Regression</a>.</p>
  <table class="tbl">
    <tr><th></th><th>Closed form (normal equation / SVD)</th><th>Gradient descent family</th></tr>
    <tr><td>Result</td><td>exact (up to rounding)</td><td>approximate; improves with iterations</td></tr>
    <tr><td>Cost</td><td>O(n·d²) to form XᵀX + O(d³) to solve</td><td>O(n·d) per full step × number of steps</td></tr>
    <tr><td>Hyperparameters</td><td>none</td><td>learning rate, iterations, batch size</td></tr>
    <tr><td>Large d (e.g. 100,000 features)</td><td>d³ = 10¹⁵: impractical</td><td>fine</td></tr>
    <tr><td>Data larger than memory / streaming</td><td>hard</td><td>natural (mini-batches)</td></tr>
    <tr><td>Feature scaling needed?</td><td>no (the raw flats solve in one go)</td><td>yes, for speed (8,549 vs 1 step)</td></tr>
    <tr><td>Works for</td><td>squared loss, ridge (XᵀX + λI)</td><td>any differentiable (or sub-differentiable) loss</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Only squared loss with a linear model gives linear equations when the gradient is set to zero. For log-loss the condition Xᵀ(σ(Xθ) − y) = 0 has θ inside a sigmoid; no formula solves it, so logistic regression (the "sold within 30 days" model) is always fitted iteratively (Newton / lbfgs / GD). The same holds for hinge, Huber and every neural network.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Computing <code>np.linalg.inv(X.T @ X) @ X.T @ y</code>. When columns are nearly collinear, XᵀX is nearly singular and the inverse amplifies rounding errors (the condition number of XᵀX is the <em>square</em> of X's). Use <code>solve</code>, <code>lstsq</code>, or add a ridge term.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: From Scratch.</b> We have checked everything on ten flats. The real test of understanding: implement gradient descent for linear and logistic regression and match scikit-learn's answers, on the flats and on real datasets.</div>

  <h2 id="lg-scratch"><span class="num">16</span>From Scratch, Matching scikit-learn</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know every piece: the loss, its gradient, the learning-rate limit, scaling. Can about 20 lines of our own code reproduce what <code>LinearRegression</code> and <code>LogisticRegression</code> return, to many decimal places?</p>
  </div>
  <p>Two classes. <code>LinearRegressionGD</code> standardizes internally (section 13), runs batch gradient descent with the gradient from section 09, then converts the weights back to the original units: if z = (x − μ)/σ and ŷ = w·z + b, then ŷ = (w/σ)·x + (b − Σ wμ/σ). <code>LogisticRegressionGD</code> uses the p − y gradient from section 05, plus sklearn's L2 penalty: sklearn minimises ½‖w‖² + C·Σ log-loss; dividing by C·n gives the same minimiser as mean log-loss + ‖w‖²/(2Cn), whose gradient adds w/(Cn).</p>
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

# 1) the ten flats: GD must land on price = 6 x area + 10
area = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14], dtype=float).reshape(-1, 1)
price = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96], dtype=float)
flats = LinearRegressionGD(lr=0.2, n_iter=200).fit(area, price)
print("flats   : coef", flats.coef_.round(6), " intercept", round(flats.intercept_, 6))

# 2) diabetes (442 patients, 10 features) and breast cancer (569 rows, 30 features)
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
  <div class="fx" data-lang="text">flats   : coef [6.]  intercept 10.0
linear  : max |coef diff| = 1.52e-11  intercept diff = 2.84e-14
          first 3 coefs, mine: [ -10.01 -239.82  519.85]  sklearn: [ -10.01 -239.82  519.85]
logistic: max |coef diff| = 1.13e-06  intercept diff = 2.31e-07
          first 3 coefs, mine: [-0.363 -0.388 -0.351]  sklearn: [-0.363 -0.388 -0.351]</div>
  <p>On the ten flats our gradient descent lands exactly on price = 6 × area + 10 in 200 steps (standardized, so the bowl is round). On the diabetes data (442 patients, 10 features) the gradient-descent coefficients agree with <code>LinearRegression</code>'s exact solution to about 10⁻¹¹. On breast cancer (569 rows, 30 standardized features) the logistic coefficients agree with sklearn's lbfgs solver to about 10⁻⁶. Two choices made that possible: a learning rate under the 2/L limit (0.2 &lt; 0.248 for diabetes), and enough iterations for the shallow directions (diabetes has κ ≈ 470 because several blood-serum features are strongly correlated).</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Declaring "my implementation matches" after 1,000 iterations because the first two decimals agree. With the original settings (η = 0.1, 5,000 iterations) the linear version was still off by 0.15 in one coefficient. Compare the full coefficient vectors, and check the gradient norm, not just the loss.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> Six losses, a cost surface, gradient descent and five ways to speed it up: how are they built from one another, and which answers which question?</div>

  <h2 id="lg-connect"><span class="num">17</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Squared, absolute, Huber, log, hinge, 0-1; cost surface, gradient, learning rate, convexity, SGD, scaling, momentum, Adam, normal equation. A catalogue, or two short chains that every model in the track reuses?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 680 340" width="680">
<defs><marker id="lg-c9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<text x="160" y="16" text-anchor="middle" class="tm" font-size="11" font-weight="700">WHAT TO MINIMISE (the loss)</text>
<text x="520" y="16" text-anchor="middle" class="tm" font-size="11" font-weight="700">HOW TO MINIMISE (the optimiser)</text>
<rect x="10" y="26" width="140" height="40" rx="7" class="fb sb"/><text x="80" y="43" text-anchor="middle" font-size="11" font-weight="700">noise assumption</text><text x="80" y="58" text-anchor="middle" class="tm" font-size="10">likelihood → −log</text>
<line x1="80" y1="66" x2="40" y2="90" stroke="currentColor" marker-end="url(#lg-c9)"/><line x1="80" y1="66" x2="120" y2="90" stroke="currentColor" marker-end="url(#lg-c9)"/><line x1="150" y1="46" x2="228" y2="90" stroke="currentColor" marker-end="url(#lg-c9)"/>
<rect x="5" y="92" width="80" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="45" y="109" text-anchor="middle" font-size="10.5" font-weight="700">squared</text><text x="45" y="124" text-anchor="middle" class="tm" font-size="9.5">Gauss · 4.6</text>
<rect x="90" y="92" width="80" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="130" y="109" text-anchor="middle" font-size="10.5" font-weight="700">absolute</text><text x="130" y="124" text-anchor="middle" class="tm" font-size="9.5">Laplace · 2.0</text>
<rect x="190" y="92" width="110" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="245" y="109" text-anchor="middle" font-size="10.5" font-weight="700">log-loss</text><text x="245" y="124" text-anchor="middle" class="tm" font-size="9.5">Bernoulli · K: 4.51</text>
<line x1="45" y1="132" x2="80" y2="156" stroke="currentColor" marker-end="url(#lg-c9)"/><line x1="130" y1="132" x2="90" y2="156" stroke="currentColor" marker-end="url(#lg-c9)"/>
<rect x="30" y="158" width="110" height="40" rx="6" class="fg sg"/><text x="85" y="175" text-anchor="middle" font-size="10.5" font-weight="700">Huber</text><text x="85" y="190" text-anchor="middle" class="tm" font-size="9.5">clip at δ · slope 5.58</text>
<rect x="190" y="158" width="110" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="245" y="175" text-anchor="middle" font-size="10.5" font-weight="700">hinge</text><text x="245" y="190" text-anchor="middle" class="tm" font-size="9.5">margin ≥ 1 → 0</text>
<line x1="245" y1="132" x2="245" y2="156" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#lg-c9)"/>
<rect x="160" y="222" width="160" height="40" rx="6" class="fr sr"/><text x="240" y="239" text-anchor="middle" font-size="10.5" font-weight="700">0-1 loss (reported)</text><text x="240" y="254" text-anchor="middle" class="tm" font-size="9.5">no gradient → surrogates</text>
<line x1="245" y1="198" x2="243" y2="220" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#lg-c9)"/>
<rect x="20" y="222" width="120" height="40" rx="6" class="fb sb"/><text x="80" y="239" text-anchor="middle" font-size="10.5" font-weight="700">cost J(θ)</text><text x="80" y="254" text-anchor="middle" class="tm" font-size="9.5">mean loss (+ penalty)</text>
<line x1="85" y1="198" x2="82" y2="220" stroke="currentColor" marker-end="url(#lg-c9)"/>
<line x1="140" y1="242" x2="388" y2="60" stroke="currentColor" marker-end="url(#lg-c9)"/>
<rect x="390" y="30" width="270" height="40" rx="6" class="ft st"/><text x="525" y="47" text-anchor="middle" font-size="10.5" font-weight="700">cost surface: a bowl if convex</text><text x="525" y="62" text-anchor="middle" class="tm" font-size="9.5">4.6 + 8.25(w − 6)² + (c − 67)²</text>
<line x1="525" y1="70" x2="460" y2="96" stroke="currentColor" marker-end="url(#lg-c9)"/><line x1="560" y1="70" x2="610" y2="96" stroke="currentColor" marker-end="url(#lg-c9)"/>
<rect x="380" y="98" width="160" height="40" rx="6" class="ft st"/><text x="460" y="115" text-anchor="middle" font-size="10.5" font-weight="700">gradient descent</text><text x="460" y="130" text-anchor="middle" class="tm" font-size="9.5">θ ← θ − η∇J; 4790.6 → 4.6</text>
<rect x="555" y="98" width="115" height="40" rx="6" class="fg sg"/><text x="612" y="115" text-anchor="middle" font-size="10.5" font-weight="700">closed form</text><text x="612" y="130" text-anchor="middle" class="tm" font-size="9.5">squared only: (6, 10)</text>
<line x1="420" y1="138" x2="410" y2="164" stroke="currentColor" marker-end="url(#lg-c9)"/><line x1="500" y1="138" x2="540" y2="164" stroke="currentColor" marker-end="url(#lg-c9)"/>
<rect x="350" y="166" width="125" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="412" y="183" text-anchor="middle" font-size="10.5" font-weight="700">learning rate</text><text x="412" y="198" text-anchor="middle" class="tm" font-size="9.5">η &lt; 2/L = 0.121</text>
<rect x="485" y="166" width="185" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="577" y="183" text-anchor="middle" font-size="10.5" font-weight="700">batch · SGD · mini-batch</text><text x="577" y="198" text-anchor="middle" class="tm" font-size="9.5">rows per step; noise vs cost</text>
<line x1="412" y1="206" x2="440" y2="230" stroke="currentColor" marker-end="url(#lg-c9)"/>
<rect x="350" y="232" width="320" height="40" rx="6" class="fr sr"/><text x="510" y="249" text-anchor="middle" font-size="10.5" font-weight="700">condition number κ sets the speed</text><text x="510" y="264" text-anchor="middle" class="tm" font-size="9.5">raw 1,198 (8,549 steps) · centred 8.3 (81) · standardized 1 (1)</text>
<line x1="440" y1="272" x2="430" y2="296" stroke="currentColor" marker-end="url(#lg-c9)"/><line x1="580" y1="272" x2="590" y2="296" stroke="currentColor" marker-end="url(#lg-c9)"/>
<rect x="350" y="298" width="150" height="34" rx="6" class="fg sg"/><text x="425" y="320" text-anchor="middle" font-size="10.5">fix the data: scaling</text>
<rect x="520" y="298" width="150" height="34" rx="6" class="fg sg"/><text x="595" y="320" text-anchor="middle" font-size="10.5">fix the steps: momentum, Adam</text>
</svg><figcaption>Two chains. Left: an assumption about the noise, through the likelihood, gives a loss (squared, absolute, log); Huber blends the first two; hinge and log are convex stand-ins for the 0-1 loss we report; averaging gives the cost. Right: the cost is a surface; gradient descent walks it (closed form jumps to the bottom for squared loss); the learning rate is capped by the steepest curvature, the condition number sets the speed, and scaling or momentum/Adam fix a bad κ.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the ten flats</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on our flats</th><th>When to use</th></tr>
    <tr><td>Squared loss</td><td>Gaussian likelihood</td><td>how wrong is a number, smoothly?</td><td>MSE 4.6; with the typo 66.7; best constant = mean 64.3</td><td>default regression; big errors are costly</td></tr>
    <tr><td>Absolute loss</td><td>Laplace likelihood</td><td>how wrong, robust to outliers?</td><td>MAE 2.0 → 4.3; median 67–68 unmoved</td><td>outliers, median-based reporting</td></tr>
    <tr><td>Huber loss</td><td>square near 0, linear beyond δ</td><td>smooth and robust?</td><td>1.5 → 3.8; constant 67; slope 5.58 vs OLS 4.53</td><td>regression with occasional bad rows</td></tr>
    <tr><td>Log-loss</td><td>Bernoulli likelihood</td><td>how wrong is a probability?</td><td>A 0.201, K 4.511; gradient p − y</td><td>any probabilistic classifier</td></tr>
    <tr><td>Hinge loss</td><td>margin, max(0, 1 − m)</td><td>ignore safely correct rows?</td><td>A 0, C and F 0.5, K 5.5</td><td>SVMs, sparse support vectors</td></tr>
    <tr><td>0-1 loss</td><td>right/wrong count</td><td>how many mistakes?</td><td>0 on all ten (any scale of score)</td><td>reporting only, never training</td></tr>
    <tr><td>Cost surface</td><td>mean loss over rows</td><td>what does training minimise?</td><td>4790.6 at (0, 0) … 4.6 at (6, 10)</td><td>visualising, reasoning about curvature</td></tr>
    <tr><td>Gradient descent</td><td>chain rule on the cost</td><td>how to go downhill?</td><td>16.5(w − 6), 2(c − 67); J 4790.6 → 1203.8 in 3 steps</td><td>any differentiable cost</td></tr>
    <tr><td>Learning rate</td><td>Hessian eigenvalues</td><td>how big a step?</td><td>2/L = 0.121; 0.1 best; 0.125 diverges</td><td>always; check the first steps</td></tr>
    <tr><td>Convexity</td><td>PSD Hessian</td><td>is the bottom we reach the best?</td><td>eigenvalues 16.5, 2 ≥ 0</td><td>trusting GD's answer</td></tr>
    <tr><td>SGD / mini-batch</td><td>per-row gradients</td><td>can a step use few rows?</td><td>flat J alone: (−864, −192); average (−99, −134)</td><td>large data, deep learning</td></tr>
    <tr><td>Scaling</td><td>condition number</td><td>why is GD slow?</td><td>κ 1,198 → 8.3 → 1; steps 8,549 → 81 → 1</td><td>any GD-trained or penalised model</td></tr>
    <tr><td>Momentum / Adam</td><td>running averages of gradients</td><td>can the optimiser adapt?</td><td>raw flats: 8,549 → 792 (momentum), 975 (Adam)</td><td>ill-conditioned or non-convex problems</td></tr>
    <tr><td>Normal equation</td><td>gradient = 0, linear system</td><td>can we skip iterating?</td><td>4950/825 = 6, 8250/825 = 10</td><td>squared loss (and ridge), moderate d</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>a loss is a noise assumption written as a penalty, the cost is its average, and gradient descent walks the cost downhill at a speed set by the learning rate and the condition number.</strong> On the flats: squared loss assumed Gaussian luck and was wrecked by a typo; absolute and Huber assumed heavier tails and resisted it; and the same bowl took 8,549 steps or one step depending only on how area was scaled.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Comparisons.</b> Side by side, how do the six losses and the ways to minimise a cost compare?</div>

  <h2 id="lg-compare"><span class="num">18</span>Comparisons</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Given a new problem, which loss and which optimiser? What does each loss assume, how does it behave with outliers, and what does each minimiser cost?</p>
  </div>
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
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> Most training failures are not exotic; they are a handful of repeated slips. Which ones, and how do they show up?</div>

  <h2 id="lg-traps"><span class="num">19</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know the right loss and the right optimiser in theory. What are the classic ways training goes wrong in practice, and what did each look like in this note's numbers?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: MSE for classification</span>
    <p>Squared loss on sigmoid outputs is non-convex and has vanishing gradients when confidently wrong (−0.0049 vs −0.998 at z = −6). Use log-loss.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: squared loss with dirty data</span>
    <p>One mistyped price multiplied the flats' MSE by 14.5 and pulled the fitted slope from 6 to 4.53. Clean the data, or use Huber / absolute loss.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: learning rate too large</span>
    <p>Rising or <code>nan</code> loss means η is above 2/L (0.125 &gt; 0.121 on the flats, reaching 10²⁸). Lower it by 10×, and scale the features, before changing the model.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: unscaled features with gradient descent</span>
    <p>The same ten flats took 8,549 steps with raw area, over 100,000 with area in square feet, 1 when standardized. Always scale inputs for GD-based models, using training-set statistics only.</p>
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
    <p>Log-loss can fall while accuracy stays flat (doubling the flats' scores: 0.18 → 0.083, same decisions), and a model trained for MSE can have a poor MAPE. Monitor the metric that matters alongside the loss.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the Revision Sheet, then <a class="xref" data-note="ml_regularization">Regularization</a>.</b> Gradient descent minimises the training cost as well as it can, and with many features that is exactly the problem: it fits the noise too. How do we change the cost so that the minimum is a model that generalises?</div>

  <h2 id="lg-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one page. Running example: ten flats, area x (100 sq ft) → price y (₹ lakh): A (5, 38), B (6, 49), C (7, 53), D (8, 56), E (9, 67), F (10, 68), G (11, 73), H (12, 83), I (13, 87), J (14, 96); best line price = 6x + 10, residuals −2, 3, 1, −2, 3, −2, −3, 1, −1, 2. Typo: J stored as 69. Ages for "sold within 30 days": A 12, C 8, F 10, new flat K 18 (did not sell fast); score z = 0.5(age − 9).</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>Answer on our flats</th><th>Weakness → next</th></tr>
    <tr><td>Loss / cost / metric</td><td>"how wrong" as one number?</td><td>MSE 4.6, MAE 2.0, Huber 1.5</td><td>which loss?</td></tr>
    <tr><td>Squared</td><td>why square?</td><td>mean; Gaussian MLE; typo → 66.7, mean 64.3</td><td>outliers dominate</td></tr>
    <tr><td>Absolute</td><td>robust to one bad row?</td><td>median 67–68 unmoved; MAE 4.3</td><td>kink at 0</td></tr>
    <tr><td>Huber</td><td>smooth and robust?</td><td>constant 67; slope 5.58 vs 4.53</td><td>only for numbers</td></tr>
    <tr><td>Log-loss</td><td>how wrong is a probability?</td><td>A 0.201, K 4.511; p − y</td><td>never stops pushing</td></tr>
    <tr><td>Hinge</td><td>ignore safe rows?</td><td>A 0, C/F 0.5, K 5.5</td><td>we report accuracy</td></tr>
    <tr><td>0-1, surrogates</td><td>why not minimise errors?</td><td>0 at any scale → no gradient</td><td>now the cost surface</td></tr>
    <tr><td>Cost surface</td><td>what is minimised?</td><td>4.6 + 8.25(w − 6)² + (c − 67)²</td><td>can't scan big models</td></tr>
    <tr><td>Gradient descent</td><td>how to go downhill?</td><td>4790.6 → 3003.0 → 1896.3 → 1203.8</td><td>step size?</td></tr>
    <tr><td>Learning rate</td><td>how big a step?</td><td>η &lt; 0.121; 0.1 best</td><td>can it get stuck?</td></tr>
    <tr><td>Convexity</td><td>bottom = best?</td><td>eigenvalues 16.5, 2</td><td>all rows per step is slow</td></tr>
    <tr><td>SGD / mini-batch</td><td>fewer rows per step?</td><td>flat J (−864, −192); mean (−99, −134)</td><td>raw data still slow</td></tr>
    <tr><td>Scaling</td><td>why slow?</td><td>κ 1,198 → 1; 8,549 → 1 step</td><td>can't always rescale</td></tr>
    <tr><td>Momentum / Adam</td><td>adaptive steps?</td><td>8,549 → 792 / 975</td><td>needed at all?</td></tr>
    <tr><td>Normal equation</td><td>skip iterating?</td><td>(6, 10) from a 2×2 solve</td><td>squared loss only</td></tr>
    <tr><td>From scratch</td><td>do we understand it?</td><td>matches sklearn to 10⁻¹¹</td><td>overfitting → regularization</td></tr>
  </table>
  <h3>Definitions</h3>
  <table class="tbl">
    <tr><th>Term</th><th>Meaning</th></tr>
    <tr><td>Loss, cost, metric</td><td>Penalty for one prediction; average loss over the training rows as a function of θ (plus any penalty), which the optimiser minimises; the number reported to the business.</td></tr>
    <tr><td>Residual, margin</td><td>r = y − ŷ for regression; m = y·f(x) with y ∈ {−1, +1} for classification (positive = correct side).</td></tr>
    <tr><td>Maximum likelihood</td><td>Choose parameters that make the data most probable; minimising the negative log-likelihood gives squared loss (Gaussian), absolute (Laplace), log-loss (Bernoulli).</td></tr>
    <tr><td>Surrogate loss</td><td>A convex, differentiable stand-in for the 0-1 loss that lies above it (hinge, log-loss).</td></tr>
    <tr><td>Gradient, learning rate</td><td>Vector of partial derivatives (points uphill); the step size η in θ ← θ − η∇J.</td></tr>
    <tr><td>Hessian, condition number</td><td>Matrix of second derivatives (curvatures); κ = largest / smallest eigenvalue, which sets how slowly GD converges.</td></tr>
    <tr><td>Convex</td><td>Bowl-shaped everywhere (PSD Hessian): every zero-gradient point is a global minimum.</td></tr>
    <tr><td>Batch / SGD / mini-batch; epoch</td><td>All rows / one row / b rows per update; one pass over all rows.</td></tr>
    <tr><td>Momentum, Adam</td><td>Step along a running sum of gradients; additionally divide by the running root-mean-square gradient per parameter.</td></tr>
    <tr><td>Normal equation</td><td>XᵀXθ = Xᵀy, the closed-form minimiser of squared loss for a linear model.</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols and our numbers</th></tr>
    <tr><td>Squared / MSE</td><td>(1/n) Σ (yᵢ − ŷᵢ)²; gradient 2(ŷ − y)</td><td>46/10 = 4.6; typo 667/10 = 66.7</td></tr>
    <tr><td>Absolute / MAE</td><td>(1/n) Σ |yᵢ − ŷᵢ|; gradient sign(ŷ − y)</td><td>20/10 = 2.0; typo 43/10 = 4.3</td></tr>
    <tr><td>Huber</td><td>½r² if |r| ≤ δ, else δ(|r| − ½δ); gradient clip(r, ±δ)</td><td>δ = 1: 15/10 = 1.5; δ = 3 constant: 67</td></tr>
    <tr><td>Gaussian NLL</td><td>(n/2) ln(2πσ²) + SSE/(2σ²)</td><td>D, E, F, σ = 2: 1.5 ln(8π) + 88.67/8 = 15.92</td></tr>
    <tr><td>Off-mean cost</td><td>SSE(c) = SSE(ȳ) + n(c − ȳ)²</td><td>2106.1 + 10 × 2.7² = 2179.0</td></tr>
    <tr><td>Log-loss</td><td>−[y ln p + (1 − y) ln(1 − p)]; ∂/∂z = p − y</td><td>p = σ(z), z score: K: −ln 0.011 = 4.51</td></tr>
    <tr><td>Softmax, cross-entropy</td><td>pₖ = e<sup>zₖ</sup>/Σⱼ e<sup>zⱼ</sup>; −ln p<sub>true</sub></td><td>(2, 1, 0) → 0.665; loss 0.408</td></tr>
    <tr><td>Hinge</td><td>max(0, 1 − y·f)</td><td>margin 0.5 → 0.5; −4.5 → 5.5</td></tr>
    <tr><td>GD update</td><td>θ ← θ − η (2/n) Xᵀ(Xθ − y)</td><td>centred flats: ∂w = 16.5(w − 6), ∂c = 2(c − 67)</td></tr>
    <tr><td>Stability</td><td>0 &lt; η &lt; 2/L; per-direction factor |1 − ηλ|</td><td>L = 16.5 → 0.121; η = 0.1: −0.65 and 0.8</td></tr>
    <tr><td>Adam</td><td>m̂ = m/(1 − β₁ᵗ), ŝ = s/(1 − β₂ᵗ), θ ← θ − η m̂/(√ŝ + ε)</td><td>first step moves every coordinate by η</td></tr>
    <tr><td>Normal equation</td><td>θ = (XᵀX)⁻¹Xᵀy (solve, don't invert)</td><td>[[985, 95], [95, 10]], [6860, 670] → (6, 10)</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Squared loss</b><p>Default for regression when big errors are truly costly and the data is clean; gives the mean and a closed form.</p><small>Avoid with typos or heavy tails</small></div>
    <div><b>Absolute / Huber</b><p>When a few rows are wrong or extreme; Huber when you also want smooth gradients. Set δ relative to the noise.</p><small>Quantile loss for intervals</small></div>
    <div><b>Log-loss vs hinge</b><p>Log-loss when you need probabilities (pricing advice, thresholds); hinge for a max-margin SVM. Never squared loss on a sigmoid.</p><small>Report accuracy, train on a surrogate</small></div>
    <div><b>Which optimiser</b><p>Closed form for OLS/ridge with moderate d; batch GD for small convex problems; mini-batch SGD with momentum or Adam for large data and networks; always scale first.</p><small>Check η &lt; 2/L by watching the first steps</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Squared loss on dirty data; MSE for classification; η above 2/L; unscaled features with GD; trusting training loss; wrong sign or label coding; fixed-η SGD expected to be exact; log(0); summing instead of averaging; assuming a lower loss means a better metric.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Residuals −2, 3, 1, −2, 3, −2, −3, 1, −1, 2: MSE and MAE?</td><td>46/10 = 4.6 and 20/10 = 2.0</td></tr>
    <tr><td>p = 0.989 that a flat sells fast; it did not. Log-loss?</td><td>−ln(0.011) = 4.51</td></tr>
    <tr><td>Centred flats, start (0, 0), η = 0.1: first step?</td><td>gradient (−99, −134) → w = 9.9, c = 13.4</td></tr>
    <tr><td>Hessian eigenvalues 16.5 and 2: largest stable η and κ?</td><td>2/16.5 = 0.121; κ = 8.25</td></tr>
    <tr><td>XᵀX = [[985, 95], [95, 10]], Xᵀy = [6860, 670]: w?</td><td>(10·6860 − 95·670)/825 = 6</td></tr>
  </table>

  <h2 id="lg-qa"><span class="num">20</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a loss function, a cost function and a metric?</summary><div class="qa-body">Loss: the penalty for one prediction, L(y, ŷ). Cost (objective): the average loss over the training set as a function of the parameters, plus any regularization penalty; it is what the optimiser minimises. Metric: the number you report for a dataset (accuracy, RMSE, AUC); it need not be differentiable and may differ from the loss.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does minimising squared error give the mean, and absolute error the median?</summary><div class="qa-body">For a constant c, d/dc Σ(yᵢ − c)² = −2Σ(yᵢ − c) = 0 gives c = mean. For Σ|yᵢ − c| the slope is (#points below c) − (#points above c), which changes sign at the middle value(s), the median. On the flat prices with J mistyped: mean 64.3 (dragged from 67), median interval [67, 68] (unmoved), Huber (δ = 3) 67.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive MSE and log-loss from maximum likelihood.</summary><div class="qa-body">Gaussian noise: −ln Π (1/√(2πσ²)) exp(−(yᵢ − ŷᵢ)²/2σ²) = (n/2)ln(2πσ²) + SSE/(2σ²), so maximising likelihood = minimising SSE. Bernoulli: P(y|p) = pʸ(1 − p)¹⁻ʸ, so −ln of the product is −Σ[yᵢ ln pᵢ + (1 − yᵢ) ln(1 − pᵢ)], the log-loss.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Show that the gradient of log-loss with respect to the logit is p − y.</summary><div class="qa-body">With p = σ(z) and σ' = p(1 − p): dL/dz = −[y(1/p) − (1 − y)/(1 − p)]·p(1 − p) = −[y(1 − p) − (1 − y)p] = p − y. Hence ∂L/∂w = (p − y)x, the same form as linear regression's gradient. Flat K (p = 0.989, y = 0) pushes its score down by 0.989.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why not use MSE for logistic regression?</summary><div class="qa-body">On top of a sigmoid, MSE is non-convex in the weights and its gradient 2(p − y)p(1 − p) vanishes when the model is confidently wrong (−0.0049 vs log-loss −0.998 at z = −6), so learning from the worst mistakes is slow. Log-loss is convex, has gradient p − y, and is a proper scoring rule that rewards calibrated probabilities.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is hinge loss and how does it relate to SVMs and support vectors?</summary><div class="qa-body">max(0, 1 − y·f) with y ∈ {−1, +1}. Rows with margin ≥ 1 (flat A at 1.5) have zero loss and zero gradient, so only rows inside or on the wrong side of the margin (C, F, K) shape the solution: the support vectors. Hinge loss + L2 penalty is the soft-margin linear SVM.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why don't we train classifiers by minimising 0-1 loss directly?</summary><div class="qa-body">It is flat almost everywhere (gradient 0) and discontinuous at the boundary, so gradient methods get no signal (on the ten flats it is 0 whether the score is doubled or not); exact minimisation is NP-hard for linear classifiers in general; and it ignores how close a row is to the boundary. Convex surrogates (log-loss, hinge) upper-bound it, are easy to optimise, and are classification-calibrated.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the gradient descent update for linear regression and do one step on the ten flats (centred area) from (0, 0) with η = 0.1.</summary><div class="qa-body">J = (1/n)Σ(w uᵢ + c − yᵢ)², ∂J/∂w = (2/n)Σeᵢuᵢ, ∂J/∂c = (2/n)Σeᵢ. With Σu = 0, Σu² = 82.5, Σuy = 495, Σy = 670 these are 16.5(w − 6) and 2(c − 67). At (0, 0): (−99, −134), so w = 9.9, c = 13.4 and J falls from 4790.6 to 3003.0. The bottom is (6, 67), i.e. b = 67 − 9.5 × 6 = 10.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you know the largest safe learning rate?</summary><div class="qa-body">For a quadratic cost, GD converges iff η &lt; 2/L, where L is the largest eigenvalue of the Hessian (for MSE, (2/n)XᵀX). For the centred flats L = 16.5, so η must be below 0.121: 0.12 converged slowly with zig-zags, 0.125 diverged to 10²⁸. In practice: try values on a log grid (1, 0.1, 0.01…) and watch the loss.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is convexity and why do we care?</summary><div class="qa-body">A convex function lies below its chords (Hessian positive semi-definite), so every point with zero gradient is a global minimum and GD cannot get stuck in a bad local minimum. MSE for linear models, log-loss for logistic regression, hinge and Huber are convex; neural networks are not. Convexity guarantees the destination, not the speed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compare batch, stochastic and mini-batch gradient descent.</summary><div class="qa-body">Batch: exact gradient, one update per epoch, O(nd) per step. SGD: one row per update, cheap and noisy (one flat's gradient ranged from +343 to −864 in w, though the ten average exactly to the full gradient), needs a decaying η to converge exactly. Mini-batch: b rows (32–512), noise shrinking like 1/√b, vectorises well; the default for large data and deep learning. On 10,000 rows, one epoch of mini-batch reached MSE 1.032 while one batch step was at 19.8.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does feature scaling speed up gradient descent?</summary><div class="qa-body">Features on very different scales (or far from zero) make the cost bowl long and thin (high condition number κ = L/μ). The step size is limited by the steep direction (η &lt; 2/L), so progress along the flat direction is tiny and GD zig-zags. On the flats: raw area κ = 1,198 and 8,549 steps; area in sq ft κ ≈ 11.8 million and no convergence in 100,000; centred 81 steps; standardized 1.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain momentum and Adam in two sentences each.</summary><div class="qa-body">Momentum keeps a running sum of past gradients and steps along it, which accelerates consistent directions and cancels oscillating ones (8,549 → 792 steps on the raw flats). Adam combines momentum with a per-parameter running average of squared gradients, stepping by m̂/√ŝ so every parameter moves on a similar scale; bias correction fixes the zero initialisation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Normal equation or gradient descent: when do you use which?</summary><div class="qa-body">Normal equation (via solve/SVD): exact, no tuning, O(nd² + d³), best for squared loss with up to a few thousand features that fit in memory (the flats: a 2×2 solve gives (6, 10)). Gradient descent: O(nd) per step, needed for huge d, streaming data, and any loss without a closed form (logistic, hinge, neural networks).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the choice of loss matter more than the choice of optimiser for the typo problem?</summary><div class="qa-body">The optimiser only finds the minimum of the cost you give it. With squared loss every optimiser (formula, GD, SGD) lands on the same damaged line, slope 4.53. Only changing the loss (Huber: 5.58; absolute) changes where the minimum is. Optimisers decide speed; losses decide the answer.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip feature scaling, and which later notes depend on it?</summary><div class="qa-body">Gradient descent still converges but can take thousands of times longer (8,549 vs 1 step on the flats), and penalised models change their answer, because the penalty treats a coefficient on "sq ft" and one on "rooms" as comparable (<a class="xref" data-note="ml_regularization">Regularization</a>). Distance-based models (kNN, SVM, k-means) break for a different reason. <a class="xref" data-note="ml_features">Feature Engineering</a> covers the scalers, and <a class="xref" data-note="ml_pipelines">Pipelines</a> makes sure they are fitted on training data only.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how do loss gradients appear in gradient boosting and regularization?</summary><div class="qa-body">Gradient boosting fits each new tree to the negative gradient of the loss at the current predictions: y − ŷ for squared loss, y − p for log-loss, sign(y − ŷ) for absolute loss, so changing the loss changes what each tree learns (<a class="xref" data-note="ml_gbm">Gradient Boosting</a>). Regularization adds λ·penalty to the cost; for L2 the gradient gains 2λw, which shrinks weights every step and makes the cost strongly convex (<a class="xref" data-note="ml_regularization">Regularization</a>).</div></details>
</main>
`
});
