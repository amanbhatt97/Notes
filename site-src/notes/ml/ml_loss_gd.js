// notes/ml/ml_loss_gd.js — Loss Functions & Gradient Descent
Object.assign(TOPIC_CONTENT, {
  "ml_loss_gd": `<main>
  <h1>Loss Functions &amp; Gradient Descent</h1>
  <div class="where"><span>Machine Learning</span><span>Foundations</span><span>Loss Functions &amp; Gradient Descent</span></div>
  <p class="lead">Every model you will ever train does the same two things. First it measures how wrong it currently is, using a <strong>loss function</strong>, and then it adjusts its own numbers (its parameters) to make that wrongness smaller, most often with an algorithm called <strong>gradient descent</strong>. The choice of loss decides what the model is trying to get right and which mistakes it fears most; the optimiser decides how quickly and reliably it gets there. Interviewers love this topic because every later model (linear and logistic regression, SVMs, gradient boosting, neural networks) is just "a particular loss, minimised a particular way". Our running example is the same ten flats in Pune used in the earlier Foundations notes: area (in hundreds of square feet) and price (in ₹ lakh), with the best straight line price = 6 × area + 10, plus a yes/no question, "did the flat sell within 30 days?". We will score that line with different losses, then watch gradient descent walk, step by step, to the very same line.</p>

  <h2 id="lg-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Loss &amp; Gradient Descent</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Loss, cost, metric</div>
        <ul>
          <li><b>Loss</b>: wrongness of one prediction</li>
          <li><b>Cost</b>: average loss over training rows (+ penalty); what is minimised</li>
          <li><b>Metric</b>: what you report; need not be differentiable</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Which loss</div>
        <ul>
          <li><b>Squared</b> → mean, Gaussian noise, outlier-sensitive</li>
          <li><b>Absolute</b> → median, robust, kink at 0; <b>Huber</b> = both</li>
          <li><b>Log-loss</b> → probabilities, gradient p − y</li>
          <li><b>Hinge</b> → margins, SVM; <b>0-1</b> → report only</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Gradient descent</div>
        <ul>
          <li>θ ← θ − η∇J; stable only if η &lt; 2/L</li>
          <li>Convex cost → any bottom is the global one</li>
          <li>Batch / SGD / mini-batch: rows per step</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Speed</div>
        <ul>
          <li>Condition number κ sets the speed; scaling fixes it</li>
          <li>Momentum and Adam adapt the step</li>
          <li>Squared loss also has a closed form (normal equation)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="lg-what"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What a Loss Function Is</span><span class="rm-sub">loss, cost and metric on the ten flats</span></div></div>
      <div class="rm-item rm-done" data-target="lg-sq"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Squared Loss</span><span class="rm-sub">why we square, and what it costs</span></div></div>
      <div class="rm-item rm-done" data-target="lg-robust"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Absolute and Huber Loss</span><span class="rm-sub">staying calm about one bad row</span></div></div>
      <div class="rm-item rm-done" data-target="lg-log"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Log-Loss (Cross-Entropy)</span><span class="rm-sub">how wrong is a probability</span></div></div>
      <div class="rm-item rm-done" data-target="lg-hinge"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Hinge Loss and the 0-1 Loss</span><span class="rm-sub">margins, and why we don't train on accuracy</span></div></div>
      <div class="rm-item rm-done" data-target="lg-cost"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">The Cost Surface and Convexity</span><span class="rm-sub">the landscape training has to search</span></div></div>
      <div class="rm-item rm-done" data-target="lg-gd"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Gradient Descent</span><span class="rm-sub">walking downhill, three steps by hand</span></div></div>
      <div class="rm-item rm-done" data-target="lg-lr"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">The Learning Rate</span><span class="rm-sub">too small, just right, too big</span></div></div>
      <div class="rm-item rm-done" data-target="lg-batch"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Batch, Stochastic and Mini-batch</span><span class="rm-sub">how many rows per step</span></div></div>
      <div class="rm-item rm-done" data-target="lg-scale"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Feature Scaling, Momentum and Adam</span><span class="rm-sub">why GD crawls and how to speed it up</span></div></div>
      <div class="rm-item rm-done" data-target="lg-closed"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Closed Form vs Gradient Descent</span><span class="rm-sub">the normal equation, and GD from scratch</span></div></div>
      <div class="rm-item rm-done" data-target="lg-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">wrong loss, wrong step size, wrong sign</span></div></div>
      <div class="rm-item rm-done" data-target="lg-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, formulas, comparison tables</span></div></div>
      <div class="rm-item rm-done" data-target="lg-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the questions interviewers ask on losses and optimisers</span></div></div>
    </div>
  </div>

  <h2 id="lg-what"><span class="num">01</span>What a Loss Function Is</h2>
  <p>To learn anything, a model must be able to answer the question "how wrong am I right now?" with a single number, and that number must go down when the model gets better. Without such a number there is nothing to improve and no way to tell a good set of parameters from a bad one. A <strong>loss function</strong> is that number for one prediction: it takes the true answer y and the model's prediction ŷ (read "y-hat") and returns a penalty that is zero when the prediction is perfect and grows as the prediction gets worse.</p>
  <p>Think of a board exam. The loss is the marks you lose on one question. What you actually try to reduce while preparing is the total, or average, marks lost over the whole paper; in machine learning that average is called the <strong>cost function</strong> (also the <strong>objective</strong>), and it is the one number the training algorithm minimises. Finally there is the result the college admissions office looks at, perhaps just "pass" or "fail". That is the <strong>metric</strong>: the number you report to the business. It must match the business goal, but unlike the cost it does not need to be smooth or easy to optimise. People often say "loss" for all three, and the difference matters in two places later: the cost can contain an extra penalty that is not a loss on any row (that is <a class="xref" data-note="ml_regularization">Regularization</a>), and the metric you report may be one you cannot optimise directly (accuracy, section 05).</p>
  <p>Different examiners cut marks differently for the same mistake. One cuts heavily for a big blunder and barely notices small slips; another cuts the same amount per unit of error however big it is. Losses differ in exactly this way, and that choice decides which mistakes the model works hardest to avoid. Let us see it on the ten flats. The line price = 6 × area + 10 misses each flat by a <strong>residual</strong> r = y − ŷ (true price minus predicted price). We score those misses three ways: by squaring them, by taking their size (absolute value), and by Huber's rule, which squares small misses and counts big ones linearly (section 03 explains it). Then we imagine a data-entry clerk swapped two digits so that flat J's ₹96 lakh was stored as ₹69 lakh.</p>
  <div class="fx" data-lang="py">import numpy as np

area  = np.array([5, 6, 7, 8, 9, 10, 11, 12, 13, 14], dtype=float)   # flats A..J, in 100 sq ft
price = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 96], dtype=float)  # in ₹ lakh
y_hat = 6 * area + 10                                  # the line from the earlier notes

def huber(r, delta=1.0):
    return np.where(np.abs(r) &lt;= delta, 0.5 * r**2, delta * (np.abs(r) - 0.5 * delta))

typo = price.copy(); typo[9] = 69                      # flat J's 96 typed as 69
for name, y in [("clean data", price), ("J typed as 69", typo)]:
    r = y - y_hat                                      # residuals
    print(f"{name}: residuals {r.astype(int).tolist()}")
    print(f"   squared {np.mean(r**2):.2f}   absolute {np.mean(np.abs(r)):.2f}   huber {huber(r).mean():.2f}")</div>
  <div class="fx" data-lang="text">clean data: residuals [-2, 3, 1, -2, 3, -2, -3, 1, -1, 2]
   squared 4.60   absolute 2.00   huber 1.50
J typed as 69: residuals [-2, 3, 1, -2, 3, -2, -3, 1, -1, -25]
   squared 66.70   absolute 4.30   huber 3.80</div>
  <p>On clean data the three costs are 4.6, 2.0 and 1.5. Now look at the typo row. J's residual became −25. Under squared loss that single row contributes 625 of the total 667, so the cost jumps 14.5 times, from 4.6 to 66.7. Under absolute loss the same row contributes 25 out of 43, and under Huber 24.5 out of 38. Same predictions, same data, three very different verdicts on how bad things are. The rest of this part of the note explains where each loss comes from and when to use it.</p>

  <h2 id="lg-sq"><span class="num">02</span>Squared Loss</h2>
  <p>Squared loss is L(y, ŷ) = (y − ŷ)², and its average over the rows is the familiar <strong>mean squared error</strong> (MSE). It is the default for regression, and the typo has just shown its weakness, so it is fair to ask why everyone uses it. There are two good reasons: what it makes the model predict, and what it assumes about the world.</p>
  <p>First, what it makes the model predict. Strip a model down to its simplest possible form: one constant c, the same predicted price for every flat. Which c gives the smallest total squared loss? The total is Σ(yᵢ − c)². Its derivative with respect to c is −2Σ(yᵢ − c); setting that to zero gives Σyᵢ = n·c, so c = Σyᵢ / n, which is the <strong>mean</strong>. With the typo the prices add up to 643, so the best constant is 64.3; with clean data it was 67. One mistyped row moved the "typical price" by ₹2.7 lakh. More generally, a model trained with squared loss tries to predict the <strong>conditional mean</strong>, the average y for a given x. The block below finds the best constant for all three losses on the typo prices numerically, so you can compare:</p>
  <div class="fx" data-lang="py">import numpy as np
from scipy.optimize import minimize_scalar

y = np.array([38, 49, 53, 56, 67, 68, 73, 83, 87, 69], dtype=float)  # prices, J mistyped

def huber(r, delta=3.0):
    return np.where(np.abs(r) &lt;= delta, 0.5 * r**2, delta * (np.abs(r) - 0.5 * delta))

losses = {"squared":  lambda c: ((y - c) ** 2).sum(),
          "absolute": lambda c: np.abs(y - c).sum(),
          "huber":    lambda c: huber(y - c).sum()}
for k, fn in losses.items():
    best = minimize_scalar(fn, bounds=(30, 100), method="bounded").x
    print(f"best constant under {k:8s} loss: {best:.2f}")
print("mean =", y.mean(), "  median =", np.median(y))</div>
  <div class="fx" data-lang="text">best constant under squared  loss: 64.30
best constant under absolute loss: 67.19
best constant under huber    loss: 67.00
mean = 64.3   median = 67.5</div>
  <p>Squared loss picks the mean, 64.3. The other two land at about 67 (section 03 explains why), much less disturbed by the typo.</p>
  <p>Second, what it assumes. Suppose each flat's price is the model's prediction plus some random luck, and that luck follows a bell-shaped <strong>normal (Gaussian) distribution</strong>: small misses common, big misses rare, symmetric around zero. A standard way to fit a model is <strong>maximum likelihood</strong>: choose the parameters that make the observed data most probable. The Gaussian density of seeing y when the model says ŷ is proportional to exp(−(y − ŷ)² / 2σ²), where σ is the typical size of the noise. For independent rows we multiply these densities; taking the logarithm turns the product into a sum, and flipping the sign gives something to minimise, the <strong>negative log-likelihood</strong>:</p>
  <p style="text-align:center">−log likelihood = constant + (1 / 2σ²) · Σ(yᵢ − ŷᵢ)²</p>
  <p>The constant and the factor 1/2σ² do not depend on the predictions, so minimising the negative log-likelihood is exactly minimising the sum of squared errors. In plain words: <em>squared loss is the right loss when the noise is Gaussian</em>. This is also why a single huge miss is treated as a catastrophe: under a bell curve, a miss of 25 when typical misses are 2 is almost impossible, so the model bends itself to explain it. The derivative of squared loss with respect to the prediction is 2(ŷ − y), which means the push on each prediction is proportional to how far off it is. Small misses get gentle pushes, big misses get big pushes, and the typo gets the biggest push of all.</p>
  <p>So squared loss is smooth, has a simple gradient, gives the mean, and (section 11) even has a closed-form solution for linear models. Its weakness is that it trusts the data completely, including the rows that are wrong.</p>

  <h2 id="lg-robust"><span class="num">03</span>Absolute and Huber Loss</h2>
  <p>If one bad row should not be allowed to dominate, the obvious fix is to stop squaring. <strong>Absolute loss</strong> is L(y, ŷ) = |y − ŷ|, and its average is the <strong>mean absolute error</strong> (MAE). Every unit of miss now costs the same, whether it is the first unit or the twenty-fifth, so the typo's residual of 25 costs 25, not 625.</p>
  <p>What does absolute loss make a model predict? Go back to the single constant c. The slope of Σ|yᵢ − c| with respect to c is simply (number of prices below c) − (number of prices above c), because each price below pulls the slope up by 1 and each price above pulls it down by 1. The loss stops falling exactly when as many prices lie above c as below it, which is the definition of the <strong>median</strong>. On the ten typo prices, sorted 38, 49, 53, 56, 67, 68, 69, 73, 83, 87, any c between the 5th and 6th values (67 and 68) has five prices on each side, so every c in that interval is equally good (the optimiser above happened to stop at 67.19; the conventional median is the midpoint, 67.5). The typo counts only as "one price on one side", no matter how far away it is, so it did not move the answer at all. A model trained with absolute loss predicts the <strong>conditional median</strong>. In the likelihood view, absolute loss corresponds to noise with a <strong>Laplace distribution</strong>, which has heavier tails than a Gaussian: big errors are expected now and then, so they are not treated as disasters.</p>
  <p>The price of this robustness is a sharp corner. The derivative of |r| is −1 or +1 and is undefined at r = 0. That causes two practical problems. Gradient descent gets the same size push whether a miss is 0.01 or 100, so near the answer it keeps overshooting unless the step size shrinks. And at exactly zero we must use a <strong>subgradient</strong> (any value between −1 and +1). This is why absolute-loss regression is often solved by linear programming rather than plain gradient descent.</p>
  <p><strong>Huber loss</strong> takes the best of both. Pick a threshold δ (delta). For small residuals, |r| ≤ δ, use half the square, ½r², which is smooth near zero. For big residuals use a straight line, δ(|r| − ½δ), which grows only linearly. The −½δ is there so the two pieces meet smoothly at |r| = δ. The easiest way to understand Huber is through its derivative: it equals the residual r when |r| ≤ δ and is clipped to ±δ beyond that. In other words, every row is allowed to push on the model, but no row can push harder than δ. Think of a committee where each member votes in proportion to how strongly they feel, but nobody is allowed more than δ votes, so one shouting member cannot outvote everyone else. With δ = 3 on the typo prices, the best constant is the c where the clipped residuals sum to zero; at c = 67 the four cheap flats each push −3, the three expensive ones each +3, and flats E, F and J push 0, +1 and +2, which balance exactly. That is the 67.00 printed earlier.</p>
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
  <p>The figure shows the three shapes against the residual. The red squared curve is gentle near zero but explodes for big misses. The blue absolute loss is a V with a sharp corner at zero. The green Huber curve copies the square near zero and becomes a straight line further out. Now the real test: fit the price line itself on the typo data with squared loss and with Huber loss.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression, HuberRegressor

X = area.reshape(-1, 1)
typo = price.copy(); typo[9] = 69                      # flat J mistyped
for name, y, model in [("squared, clean data", price, LinearRegression()),
                       ("squared, with typo ", typo, LinearRegression()),
                       ("Huber,   with typo ", typo, HuberRegressor(epsilon=1.35))]:
    m = model.fit(X, y)
    print(f"{name}: price = {m.coef_[0]:.3f} x area + {m.intercept_:.3f}")</div>
  <div class="fx" data-lang="text">squared, clean data: price = 6.000 x area + 10.000
squared, with typo : price = 4.527 x area + 21.291
Huber,   with typo : price = 5.579 x area + 13.174</div>
  <p>One bad row out of ten flattened the least-squares slope from 6.00 to 4.53 and lifted the intercept from 10 to 21.3. Huber's slope of 5.58 recovers most of the damage, because the typo can push only with a capped force. It does not recover all of it, because J is the largest flat, sitting at the end of the line where any row has the most leverage over the slope. In <code>HuberRegressor</code>, the <code>epsilon</code> parameter plays the role of δ, measured in units of an estimated noise scale; 1.35 is the classic default, chosen so that Huber loses only about 5% of the efficiency of least squares when the noise really is Gaussian.</p>
  <p>When to use which: squared loss when the data are clean and big errors are genuinely costly (under-pricing a flat by ₹25 lakh is a real loss to a seller, not noise to be ignored); absolute loss when you want the median or the data contain wild values; Huber when you want robustness and smooth gradients together. A close relative of absolute loss, the <strong>quantile (pinball) loss</strong>, penalises under- and over-prediction unequally and makes the model predict any chosen percentile, which is how prediction intervals are built (<a class="xref" data-note="ml_ts_ml">ML Forecasting</a>). For all of these, choose δ or the loss with the data's units in mind: δ = 1 means "a ₹1 lakh miss" if prices are in lakh but "a ₹1 miss" if they are in rupees.</p>

  <h2 id="lg-log"><span class="num">04</span>Log-Loss (Cross-Entropy)</h2>
  <p>So far every loss compared two numbers. Many problems are yes/no questions instead: will this flat sell within 30 days? A classifier for such a question usually outputs a <strong>probability</strong> p, its belief that the answer is "yes". A residual makes little sense for a probability, so we need a different way to say how wrong a probability is, and we especially want to punish a model that is confidently wrong.</p>
  <p>The answer again comes from likelihood. If the truth is y = 1 ("yes") the model gave probability p to what actually happened; if y = 0 it gave 1 − p. One formula covers both cases: P(y | p) = pʸ(1 − p)¹⁻ʸ (check: y = 1 gives p, y = 0 gives 1 − p). Taking minus the log of this over all rows, exactly as we did for squared loss, gives the <strong>log-loss</strong>, also called <strong>binary cross-entropy</strong>:</p>
  <p style="text-align:center"><strong>L(y, p) = −[ y·ln p + (1 − y)·ln(1 − p) ]</strong></p>
  <p>In words: <em>log-loss is minus the log of the probability you gave to the right answer</em>. Give the truth a probability of 1 and the loss is 0; give it 0.5 and the loss is ln 2 = 0.693 (a coin flip); give it 0.01 and the loss is 4.6; give it 0 and the loss is infinite.</p>
  <p>In <a class="xref" data-note="ml_intro">What is Machine Learning</a> the flats that sold within 30 days were exactly the ones aged 9 years or more. A simple probabilistic model turns age into a score z = 0.5 × (age − 9) and the score into a probability with the <strong>sigmoid</strong> function p = 1/(1 + e⁻ᶻ), which squashes any number into the range 0 to 1. Let us score flats A (12 years, sold fast), C (8 years, did not), F (10 years, sold fast), and a new flat K, 18 years old, which surprisingly did not sell fast.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.metrics import log_loss

sigmoid = lambda z: 1 / (1 + np.exp(-z))
age = np.array([12, 8, 10, 18])                        # flats A, C, F and a new flat K
y   = np.array([1, 0, 1, 0])                           # 1 = sold within 30 days
p = sigmoid(0.5 * (age - 9))                           # the model's P(sells fast)
per_row = -(y * np.log(p) + (1 - y) * np.log(1 - p))
print("p          :", p.round(3))
print("log-loss   :", per_row.round(3), " mean", per_row.mean().round(3),
      " sklearn", round(log_loss(y, p), 3))
print("squared    :", ((p - y) ** 2).round(3))
print("p - y      :", (p - y).round(3))</div>
  <div class="fx" data-lang="text">p          : [0.818 0.378 0.622 0.989]
log-loss   : [0.201 0.474 0.474 4.511]  mean 1.415  sklearn 1.415
squared    : [0.033 0.143 0.143 0.978]
p - y      : [-0.182  0.378 -0.378  0.989]</div>
  <p>Flat A got p = 0.818 for the outcome that happened and costs only 0.201. Flats C and F were right but unsure (0.622 for the truth) and cost 0.474 each. Flat K is the interesting one: the model was 98.9% sure it would sell fast, it did not, and that single row costs 4.511, more than the other three rows together. Squared error on the same probabilities (the line "squared", known as the <strong>Brier score</strong>) caps that row at 0.978. Log-loss punishes confident mistakes brutally, and that is precisely what forces a model trained on it to produce honest, well-calibrated probabilities. Statisticians call it a <strong>proper scoring rule</strong>: on average, the best thing a model can report is its true belief.</p>
  <p>The gradient of log-loss is remarkably simple. In logistic regression the model computes z = w·x + b and then p = σ(z). The sigmoid has the neat derivative σ'(z) = p(1 − p). Applying the chain rule, dL/dz = −[y/p − (1 − y)/(1 − p)]·p(1 − p) = −[y(1 − p) − (1 − y)p] = <strong>p − y</strong>. So the gradient with respect to each weight is (p − y)·x: "prediction minus truth, times the input", exactly the same shape as the squared-loss gradient for linear regression. The last line of the output shows it: flat A nudges its score up a little (−0.182), flat K pushes its score down hard (0.989). That is why the from-scratch code for linear and logistic regression in section 11 looks almost identical.</p>
  <p>With more than two classes, the model outputs one score per class and the <strong>softmax</strong> function turns them into probabilities that add up to 1: pₖ = e^zₖ / Σⱼ e^zⱼ. The loss is still minus the log of the probability of the true class (<strong>categorical cross-entropy</strong>). By hand: scores (2, 1, 0) for the localities Baner, Kothrud and Hadapsar give e² = 7.389, e¹ = 2.718, e⁰ = 1, total 11.107, so p = (0.665, 0.245, 0.090); if the flat really is in Baner the loss is −ln 0.665 = 0.408, and the gradient with respect to the scores is again p minus the one-hot truth, (−0.335, 0.245, 0.090).</p>
  <p>Why not simply use squared loss on the probability? Because the sigmoid flattens out at both ends. By the chain rule the gradient of (σ(z) − y)² is 2(p − y)·p(1 − p), and the extra factor p(1 − p) is tiny whenever p is near 0 or 1, including when the model is confidently <em>wrong</em>. Compare the two for a row whose true class is 1:</p>
  <div class="fx" data-lang="py">import numpy as np
sigmoid = lambda z: 1 / (1 + np.exp(-z))

print("    z      p   log-loss  its slope   sq.loss  its slope")
for z in [-6, -4, -2, 0, 2, 4]:                        # the score of a row whose true class is 1
    p = sigmoid(z)
    print(f"{z:5d} {p:6.3f} {-np.log(p):9.3f} {p - 1:10.3f} {(p - 1)**2:9.3f} {2*(p - 1)*p*(1 - p):10.4f}")</div>
  <div class="fx" data-lang="text">    z      p   log-loss  its slope   sq.loss  its slope
   -6  0.002     6.002     -0.998     0.995    -0.0049
   -4  0.018     4.018     -0.982     0.964    -0.0347
   -2  0.119     2.127     -0.881     0.776    -0.1850
    0  0.500     0.693     -0.500     0.250    -0.2500
    2  0.881     0.127     -0.119     0.014    -0.0250
    4  0.982     0.018     -0.018     0.000    -0.0006</div>
  <p>At z = −6 the model says p = 0.002 for a row that is really class 1, the worst possible situation. Log-loss pushes back with slope −0.998, nearly its maximum. Squared loss pushes with −0.0049, two hundred times weaker, so the model barely learns from its worst mistakes. Squared loss through a sigmoid is also not convex (section 06), so gradient descent can stall on its flat plateau. For classification, use log-loss. In code, prefer the "with logits" versions of the loss (for example <code>BCEWithLogitsLoss</code> in PyTorch) that combine the sigmoid and the log in one numerically safe formula, because a probability of exactly 0 or 1 makes ln blow up.</p>

  <h2 id="lg-hinge"><span class="num">05</span>Hinge Loss and the 0-1 Loss</h2>
  <p>Log-loss never stops pushing. Flat A is 12 years old, sold fast, and the model already scores it confidently on the right side, yet it still costs 0.201 and still nudges the weights. A different philosophy says: once a row is safely correct, stop caring about it and spend all the effort on the doubtful ones. That philosophy is the hinge loss used by support vector machines.</p>
  <p>For hinge loss the classes are coded −1 and +1 instead of 0 and 1, and the model outputs a raw score f(x), not a probability. The key quantity is the <strong>margin</strong> m = y·f(x). It is positive when the score has the right sign and negative when it is wrong, and its size says how confidently. The hinge loss is</p>
  <p style="text-align:center"><strong>hinge(m) = max(0, 1 − m)</strong></p>
  <p>It is zero once a row is correct with a margin of at least 1, and grows linearly for anything less, including rows that are correct but too close to the boundary (margins between 0 and 1). The picture to keep in mind is a football goal line with a safety zone in front of it: a defender standing well beyond the zone is fine and gets no instructions; anyone inside the zone, or on the wrong side of the line, is told to move. Using the same score 0.5 × (age − 9):</p>
  <div class="fx" data-lang="py">import numpy as np

age = np.array([12, 10, 8, 18])                        # flats A, F, C and K
y   = np.array([+1, +1, -1, -1])                       # +1 = sold fast, -1 = did not
m = y * 0.5 * (age - 9)                                # margin = label x score
print("margins   :", m)
print("0-1 loss  :", (m &lt;= 0).astype(int))
print("hinge     :", np.maximum(0, 1 - m))
print("log-loss  :", np.log1p(np.exp(-m)).round(3))

# all ten flats, then the same model with every score doubled
age10 = np.array([12, 3, 8, 15, 5, 10, 20, 2, 7, 4])
sold  = np.array([1, 0, 0, 1, 0, 1, 1, 0, 0, 0])
m10 = np.where(sold == 1, 1, -1) * 0.5 * (age10 - 9)
for k in [1, 2]:
    mk = k * m10
    print(f"scores x{k}: 0-1 {np.mean(mk &lt;= 0):.1f}   hinge {np.maximum(0, 1 - mk).mean():.2f}"
          f"   log-loss {np.log1p(np.exp(-mk)).mean():.3f}")</div>
  <div class="fx" data-lang="text">margins   : [ 1.5  0.5  0.5 -4.5]
0-1 loss  : [0 0 0 1]
hinge     : [0.  0.5 0.5 5.5]
log-loss  : [0.201 0.474 0.474 4.511]
scores x1: 0-1 0.0   hinge 0.10   log-loss 0.180
scores x2: 0-1 0.0   hinge 0.00   log-loss 0.083</div>
  <p>Flat A has margin 1.5, so its hinge loss is 0 and, just as importantly, its gradient is 0: it has no influence on the fit at all. Flats F and C are correct but inside the margin (0.5), so they cost 0.5 each. Flat K is on the wrong side (margin −4.5) and costs 5.5. Only F, C and K shape the solution; these rows are called <strong>support vectors</strong>, and minimising the hinge loss plus a penalty on the weight size is exactly the soft-margin <a class="xref" data-note="ml_svm">Support Vector Machine</a>. Notice also that the log-loss line, written in margin form as ln(1 + e⁻ᵐ), gives exactly the numbers of section 04: it is the same loss in ±1 notation. Hinge loss does not produce probabilities; an SVM's scores need an extra calibration step if you want them (<a class="xref" data-note="ml_calibration">Thresholds &amp; Calibration</a>).</p>
  <p>All these classification losses are stand-ins for the thing the dashboard actually reports: the fraction of flats classified wrongly. That is the <strong>0-1 loss</strong>: 1 for a wrong class, 0 for a right one, and its average is 1 − accuracy. If it is what we care about, why not train on it directly? The last two lines of the output answer that. On all ten flats the score rule makes no mistakes, so the 0-1 loss is 0, and doubling every score (a "more confident" model with identical decisions) leaves it at 0. Change the weights slightly and the predicted classes usually do not change at all, so the 0-1 loss is flat almost everywhere, with sudden jumps at the decision boundary: its gradient is either zero or undefined, and gradient descent has nothing to follow. Finding the linear classifier with the fewest mistakes is in fact NP-hard in general. The 0-1 loss also has no idea of "almost right": a margin of 0.01 and a margin of 10 count the same.</p>
  <p>So we train on a <strong>surrogate loss</strong>: a convex, smooth (or nearly smooth) function that lies on or above the 0-1 loss and goes down as the margin goes up. The hinge loss fell from 0.10 to 0 when the scores were doubled, because C and F left the margin zone; the log-loss kept falling (0.180 → 0.083) and would keep falling forever on data this cleanly separable, which is one reason logistic regression is always fitted with a penalty (<a class="xref" data-note="ml_regularization">Regularization</a>).</p>
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
  <p>The figure plots every classification loss against the margin. The black step is the 0-1 loss we really want. The red hinge and the blue log-loss (drawn in base 2 so that it passes through 1 at m = 0) are convex upper bounds of it that keep decreasing as the margin grows. The teal squared loss (1 − m)² is the odd one out: it rises again for very confident correct answers, punishing a margin of 2 as much as a wrong answer at margin 0, one more reason it is a poor classification loss. A useful fact for interviews: these surrogates are <strong>classification-calibrated</strong>, meaning that with enough data, minimising them also minimises the error rate. AdaBoost's exponential loss e⁻ᵐ is another surrogate, even harsher on negative margins and therefore sensitive to mislabelled rows (<a class="xref" data-note="ml_adaboost">AdaBoost</a>).</p>

  <h2 id="lg-cost"><span class="num">06</span>The Cost Surface and Convexity</h2>
  <p>A loss scores one prediction. Training, however, does not change predictions directly; it changes the parameters, and the predictions follow. During training the data are fixed and the parameters move, so it helps to read the cost as a function of the parameters. For a line ŷ = w·x + b with squared loss on the ten flats:</p>
  <p style="text-align:center">J(w, b) = (1/n) Σ (w·xᵢ + b − yᵢ)²</p>
  <p>Every pair (w, b) is a point on a map, and J is the height of the ground at that point. Training means finding the lowest point of this landscape. Let us measure the height at a few places, all of them lines met in earlier notes (from here on, <code>area</code> and <code>price</code> are the ten flats' arrays from the first code block):</p>
  <div class="fx" data-lang="py">import numpy as np

def J(w, b):                                           # mean squared error of the line w*x + b
    return np.mean((w * area + b - price) ** 2)

for w, b in [(0, 0), (8, 0), (7, 0), (6.5, 5), (6, 10)]:
    print(f"J(w={w}, b={b}) = {J(w, b):8.2f}")
u = area - area.mean()                                 # centred area
print("sum u =", u.sum(), " sum u^2 =", (u**2).sum(), " sum u*y =", (u * price).sum())</div>
  <div class="fx" data-lang="text">J(w=0, b=0) =  4790.60
J(w=8, b=0) =   118.60
J(w=7, b=0) =    13.10
J(w=6.5, b=5) =     6.72
J(w=6, b=10) =     4.60
sum u = 0.0  sum u^2 = 82.5  sum u*y = 495.0</div>
  <p>Predicting ₹0 for every flat, (0, 0), costs 4790.6. The broker's rule "₹8 lakh per 100 sq ft" costs 118.6; the line through the origin with slope 7 costs 13.1; adding an intercept helps further; and the least-squares line (6, 10) costs 4.6, the lowest possible, because the ten flats do not lie exactly on any line.</p>
  <p>The algebra becomes much cleaner if we measure area from its average, u = x − 9.5, and write the line as ŷ = w·u + c, where c is simply the predicted price of an average-sized (950 sq ft) flat (the usual intercept is b = c − 9.5w). Because the centred areas add up to zero, the cost separates into one piece for w and one for c. Using the three sums printed above, Σu² = 82.5, Σuy = 495 and Σy = 670, it works out to</p>
  <p style="text-align:center"><strong>J(w, c) = 4.6 + 8.25·(w − 6)² + (c − 67)²</strong></p>
  <p>This is a bowl. Its lowest point is at w = 6, c = 67 (so b = 67 − 57 = 10), at height 4.6, and it is 8.25 times steeper in the w direction than in the c direction. Its contour lines (points of equal cost) are ellipses, which you will see in the next section's figure.</p>
  <p>The bowl shape is not an accident of these ten flats; it is a property called convexity, and it is what makes training trustworthy. A function is <strong>convex</strong> if the straight line (chord) between any two points on its graph never dips below the graph. Check it on the slope direction: at w = 4 and w = 8 the cost is 4.6 + 8.25 × 4 = 37.6; the chord between them sits at height 37.6 above w = 6, while the curve there is only 4.6. For a smooth function, convexity is the same as having a second derivative that is never negative (here it is 16.5 everywhere); with many parameters, the matrix of second derivatives (the <strong>Hessian</strong>) must have no negative eigenvalues. The reason we care: a convex function has no false valleys. Any point where the slope is zero is the global minimum, so an algorithm that only ever walks downhill cannot get trapped somewhere worse.</p>
  <p>Which costs are convex? MSE for linear regression always is. Log-loss for logistic regression is (its second derivative with respect to the score is p(1 − p) &gt; 0). Hinge, absolute and Huber losses are convex too, though not all are smooth. Squared loss through a sigmoid is not, and neither is any neural network: multiplying layers together creates many valleys and <strong>saddle points</strong> (places where the ground goes up in one direction and down in another, so the slope is zero without being a minimum). Gradient descent still works well in practice for networks, but without the guarantee (<a class="xref" data-note="dl_foundations">Neural Network Foundations</a>). Two warnings. Convexity guarantees the destination, not the speed: this same bowl takes 8,549 steps when area is not centred (section 10). And if two features are exact copies (area in sq ft and in sq m), one Hessian eigenvalue is zero: the cost is still convex, but its bottom is a flat trough of equally good solutions, a problem <a class="xref" data-note="ml_regularization">Regularization</a> fixes.</p>

  <h2 id="lg-gd"><span class="num">07</span>Gradient Descent</h2>
  <p>With two parameters we could scan the whole map, or read the bottom off the formula. A real model has thousands or millions of parameters, and its landscape cannot be drawn or scanned. We need a way to reach the bottom using only local information: the slope of the ground where we stand.</p>
  <p>Imagine you are on a hillside near Munnar in thick fog and need to reach the valley floor. You cannot see the valley, but you can feel which way the ground slopes under your feet. So you take a step in the steepest downhill direction, feel the slope again, take another step, and repeat until the ground is flat. That is <strong>gradient descent</strong>. The <strong>gradient</strong> ∇J is the vector of slopes of the cost with respect to each parameter, and it points in the direction of steepest <em>increase</em>. So we step the opposite way:</p>
  <p style="text-align:center"><strong>θ ← θ − η · ∇J(θ)</strong></p>
  <p>Here θ (theta) stands for all the parameters together and η (eta) is the <strong>learning rate</strong>, the size of each step. We repeat until the gradient is nearly zero, which happens only at the bottom.</p>
  <p>For the flat-price line we need two slopes. Write the error of row i as eᵢ = (w·xᵢ + b) − yᵢ, so J = (1/n)Σeᵢ². By the chain rule (<a class="xref" data-note="m_calculus">Calculus</a>) the derivative of e² is 2e times the derivative of e, and e changes by xᵢ when w changes by 1 and by 1 when b changes by 1. Therefore ∂J/∂w = (2/n)Σeᵢxᵢ and ∂J/∂b = (2/n)Σeᵢ. Read them in plain words: the slope with respect to b is twice the average error (if predictions are too high on average, lower b), and the slope with respect to w is twice the average of error × input (if the big flats are over-predicted, lower w). With many features stacked in a matrix X, both become one line, ∇J = (2/n)·Xᵀ(Xθ − y). In the centred form the sums simplify to ∂J/∂w = <strong>16.5(w − 6)</strong> and ∂J/∂c = <strong>2(c − 67)</strong>: each slope is "steepness × distance from the bottom".</p>
  <p>Let us take three steps by hand, starting from w = c = 0 with η = 0.1. Step 1: the slopes are 16.5 × (0 − 6) = −99 and 2 × (0 − 67) = −134, so w becomes 0 − 0.1 × (−99) = 9.9 and c becomes 13.4; the cost falls from 4790.6 to 4.6 + 8.25 × 3.9² + 53.6² = 3003.0. Step 2: the slope in w is now 16.5 × 3.9 = +64.35 (positive, because step 1 overshot), and in c it is −107.2; w drops to 3.465 and c rises to 24.12, cost 1896.3. Step 3: w = 7.648, c = 32.70, cost 1203.8. The code continues the same loop for 100 steps:</p>
  <div class="fx" data-lang="py">import numpy as np

u = area - area.mean()                                 # centred area, x - 9.5
w, c, lr, n = 0.0, 0.0, 0.1, len(u)
for step in range(1, 101):
    err = (w * u + c) - price                          # prediction minus truth
    dw = 2 / n * (err * u).sum()                       # dJ/dw
    dc = 2 / n * err.sum()                             # dJ/dc
    w, c = w - lr * dw, c - lr * dc                    # step against the gradient
    if step &lt;= 3 or step in (10, 25, 50, 100):
        J = np.mean(((w * u + c) - price) ** 2)
        dw, dc = round(dw, 3) + 0.0, round(dc, 3) + 0.0     # (+0.0 avoids printing -0.000)
        print(f"step {step:3d}: grad=({dw:8.3f}, {dc:8.3f})  w={w:.4f}  c={c:8.4f}  J={J:8.3f}")
print("intercept b = c - 9.5 w =", round(c - 9.5 * w, 4))</div>
  <div class="fx" data-lang="text">step   1: grad=( -99.000, -134.000)  w=9.9000  c= 13.4000  J=3003.042
step   2: grad=(  64.350, -107.200)  w=3.4650  c= 24.1200  J=1896.311
step   3: grad=( -41.827,  -85.760)  w=7.6478  c= 32.6960  J=1203.764
step  10: grad=(   2.050,  -17.985)  w=5.9192  c= 59.8059  J=  56.408
step  25: grad=(  -0.003,   -0.633)  w=6.0001  c= 66.7469  J=   4.664
step  50: grad=(   0.000,   -0.002)  w=6.0000  c= 66.9990  J=   4.600
step 100: grad=(   0.000,    0.000)  w=6.0000  c= 67.0000  J=   4.600
intercept b = c - 9.5 w = 10.0</div>
  <p>The first three lines match the hand calculation. Two different behaviours are already visible. The slope w jumps back and forth across its target 6 (0 → 9.9 → 3.47 → 7.65): each step multiplies its distance from 6 by 1 − 0.1 × 16.5 = −0.65, a shrinking zig-zag. The level c crawls steadily upward (0 → 13.4 → 24.1 → 32.7): each step multiplies its distance from 67 by 1 − 0.1 × 2 = 0.8. By step 10 the slope has essentially arrived (5.92) while c is still at 59.8; by step 50 both are exact, w = 6 and c = 67, which is b = 10, the same line the formula gave in earlier notes.</p>
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
</svg><figcaption>Contours of J(w, c) for the ten flats; the ellipses are 8.25 times steeper in w than in c. Left: η = 0.1 (blue) zig-zags across the steep w direction while sliding up in c; η = 0.06 (teal) moves smoothly but more slowly. Right: stochastic updates on one flat at a time (section 09).</figcaption></figure>
  <p>The left panel draws this walk on the contour map. The ellipses are stretched because the bowl is 8.25 times steeper in w than in c. With η = 0.1 (blue) the path zig-zags across the steep direction while sliding along the gentle one; with η = 0.06 (teal) it moves smoothly but more slowly. The right panel previews section 09: the ragged red path of updates that each use only one flat. One practical check is worth making a habit: after the first step, the cost must go down. If you define the error the other way round (y − ŷ) but keep the minus sign in the update, you walk uphill and the cost explodes, a mistake shown in Common Mistakes.</p>

  <h2 id="lg-lr"><span class="num">08</span>The Learning Rate</h2>
  <p>We picked η = 0.1 and it worked, with a zig-zag. A bigger η might speed up the slow c direction but make the zig-zag worse; a smaller one might calm the zig-zag but crawl even more. Is there a rule? There is, and it is easiest to see with one parameter. Take J(w) = w². Its gradient is 2w, so one step gives w ← w − η·2w = (1 − 2η)·w: every step multiplies w by the same factor. Starting from w = 1, η = 0.1 gives 1, 0.8, 0.64, 0.512 (smooth, steady); η = 0.5 gives 1, 0, 0 (straight to the bottom in one step); η = 0.9 gives 1, −0.8, 0.64 (zig-zag, but shrinking); η = 1 gives 1, −1, 1 (bouncing forever); η = 1.1 gives 1, −1.2, 1.44 (exploding). Convergence needs |1 − 2η| &lt; 1. The 2 here is the curvature (second derivative) of J, so the general rule is: <strong>η must be less than 2 divided by the curvature</strong>, and η = 1/curvature is the single best choice.</p>
  <p>With several parameters there is a curvature for each main direction of the bowl: the eigenvalues of the Hessian, which for MSE is (2/n)XᵀX. For the centred flats they are <strong>L = 16.5</strong> along w and <strong>μ = 2</strong> along c, the same 16.5 and 2 that appeared in the gradients. Each direction is multiplied by (1 − ηλ) per step. The steepest direction decides stability, so we need η &lt; 2/L = 2/16.5 = 0.121. The flattest direction decides speed: with η just below the limit, it shrinks only by 1 − ημ per step. The ratio κ = L/μ is called the <strong>condition number</strong>; a large κ means a long, thin valley where gradient descent must take tiny steps to stay stable across the valley and therefore crawls along it. For the centred flats κ = 8.25.</p>
  <div class="fx" data-lang="py">import numpy as np

X = np.c_[area - area.mean(), np.ones(10)]             # columns: centred area, 1
H = 2 / 10 * X.T @ X                                   # Hessian (curvature) of the MSE
print("Hessian eigenvalues:", np.linalg.eigvalsh(H), "  2/L =", round(2 / np.linalg.eigvalsh(H).max(), 4))

def extra_cost(lr, steps):
    theta, out = np.zeros(2), []
    for t in range(1, steps + 1):
        theta -= lr * 2 / 10 * X.T @ (X @ theta - price)
        if t in (1, 5, 20, 100, 500):
            out.append(np.mean((X @ theta - price) ** 2) - 4.6)
    return out

print("    lr      t=1      t=5     t=20    t=100    t=500   (cost above the minimum)")
for lr in [0.01, 0.06, 0.1, 0.12, 0.125]:
    print(f"{lr:6}" + "".join(f"{abs(e):9.1e}" for e in extra_cost(lr, 500)))</div>
  <div class="fx" data-lang="text">Hessian eigenvalues: [ 2.  16.5]   2/L = 0.1212
    lr      t=1      t=5     t=20    t=100    t=500   (cost above the minimum)
  0.01  4.5e+03  3.7e+03  2.0e+03  7.9e+01  7.6e-06
  0.06  3.5e+03  1.3e+03  2.7e+01  3.5e-08  2.7e-15
   0.1  3.0e+03  4.9e+02  6.0e-01  0.0e+00  0.0e+00
  0.12  2.9e+03  5.3e+02  1.3e+02  5.2e+00  5.0e-07
 0.125  2.9e+03  8.0e+02  3.4e+03  5.5e+07  6.3e+28</div>
  <p>Read the table row by row; each number is how far the cost still is above its minimum of 4.6. With η = 0.01 it is still 2,000 above after 20 steps: safe but painfully slow. With η = 0.06 (that is 1/L) the slope is fixed in one step but the level direction shrinks only by 0.879 per step. With η = 0.1 the two directions are balanced and the cost is exact by step 100. With η = 0.12 the run is legal but slow, because the steep direction now shrinks by only |1 − 0.12 × 16.5| = 0.98 per step and keeps zig-zagging. With η = 0.125, just above the 2/L limit, the cost grows at every step and reaches 10²⁸ by step 500.</p>
  <p>In real work you never compute the Hessian; you try learning rates on a log scale (1, 0.1, 0.01, 0.001) and watch the training loss. If the loss rises or turns into <code>nan</code>, the learning rate is too large (or the features are unscaled, which makes L huge), and the first fix is to divide η by 10. It is also common to change η during training with a <strong>learning-rate schedule</strong>: large steps early to cover distance, smaller steps later to settle into the minimum, for example halving η every few epochs, 1/t decay, or cosine decay after a short warm-up (<a class="xref" data-note="m_optimization">Optimization</a>).</p>

  <h2 id="lg-batch"><span class="num">09</span>Batch, Stochastic and Mini-batch Gradient Descent</h2>
  <p>Every step so far averaged the errors of all ten flats. A property portal has lakhs of past sales, and a neural network may train on millions of images. If every single small step must read every row, training becomes painfully slow. The way out comes from noticing that the full gradient is just an <em>average</em> of per-row gradients, and an average can be estimated from a sample.</p>
  <p>Picture deciding which way a crowd is moving at a busy railway station. You could interview all 10,000 passengers before taking one step (batch gradient descent). You could ask one random passenger and step (stochastic gradient descent). Or you could ask 32 people (mini-batch). Asking 32 is nearly as reliable as asking 10,000, and you get to take about 300 steps in the time the full survey allows one. On the flats at the starting point w = c = 0, each flat's own gradient points in a different direction:</p>
  <div class="fx" data-lang="py">import numpy as np

u = area - area.mean()
err = 0 * u + 0 - price                                # errors at the start (w = c = 0)
per_flat = np.c_[2 * err * u, 2 * err]                 # each flat's own gradient (dw, dc)
for half in (slice(0, 5), slice(5, 10)):
    print("   ".join(f"{n}: ({g[0]:4.0f}, {g[1]:4.0f})" for n, g in zip("ABCDEFGHIJ"[half], per_flat[half])))
print("average of the ten:", per_flat.mean(axis=0))</div>
  <div class="fx" data-lang="text">A: ( 342,  -76)   B: ( 343,  -98)   C: ( 265, -106)   D: ( 168, -112)   E: (  67, -134)
F: ( -68, -136)   G: (-219, -146)   H: (-415, -166)   I: (-609, -174)   J: (-864, -192)
average of the ten: [ -99. -134.]</div>
  <p>The ten per-flat gradients disagree wildly: flat A says "make the slope smaller" (+342), flat J says "make it much bigger" (−864). Yet their average is exactly the full-batch gradient (−99, −134) from section 07. A random row's gradient is therefore an <strong>unbiased</strong> but noisy estimate of the true gradient: right on average, wrong in any single draw. One stochastic step on flat J alone with η = 0.01 would move (w, c) from (0, 0) to (8.64, 1.92). The red path in the right panel of the section 07 figure shows 400 such one-flat steps: it heads the right way but never settles exactly at the bottom.</p>
  <p>So there are three variants. <strong>Batch gradient descent</strong> uses all n rows per update. <strong>Stochastic gradient descent (SGD)</strong> uses one random row. <strong>Mini-batch gradient descent</strong> uses a small random batch of b rows, typically 32 to 512, and is what people usually mean by "SGD" in deep learning. One <strong>epoch</strong> is one full pass over the data; with 10,000 rows, batch GD makes 1 update per epoch, mini-batches of 32 make ⌈10,000/32⌉ = 313, and SGD makes 10,000. Here they are on a synthetic problem with 10,000 rows and three features, shuffled every epoch:</p>
  <div class="fx" data-lang="py">import numpy as np

rng = np.random.default_rng(0)
n = 10_000
X = np.c_[rng.normal(size=(n, 3)), np.ones(n)]         # 3 features + a column of 1s
y = X @ np.array([3.0, -2.0, 0.5, 4.0]) + rng.normal(0, 1.0, n)

def train(batch_size, lr, epochs=20):
    r = np.random.default_rng(1)
    theta, updates = np.zeros(4), 0
    for epoch in range(1, epochs + 1):
        order = r.permutation(n)                       # shuffle every epoch
        for start in range(0, n, batch_size):
            idx = order[start:start + batch_size]
            theta -= lr * 2 / len(idx) * X[idx].T @ (X[idx] @ theta - y[idx])
            updates += 1
        if epoch in (1, 20):
            print(f"   epoch {epoch:2d}: {updates:6d} updates, MSE {np.mean((X @ theta - y) ** 2):.4f}")
    return theta

for name, bs, lr in [("batch (all rows)", n, 0.1), ("mini-batch of 32", 32, 0.01), ("SGD, one row", 1, 0.001)]:
    print(name); theta = train(bs, lr)
print("exact least squares MSE:", round(np.mean((X @ np.linalg.lstsq(X, y, rcond=None)[0] - y) ** 2), 4))</div>
  <div class="fx" data-lang="text">batch (all rows)
   epoch  1:      1 updates, MSE 19.7733
   epoch 20:     20 updates, MSE 1.0357
mini-batch of 32
   epoch  1:    313 updates, MSE 1.0323
   epoch 20:   6260 updates, MSE 1.0331
SGD, one row
   epoch  1:  10000 updates, MSE 1.0334
   epoch 20: 200000 updates, MSE 1.0384
exact least squares MSE: 1.032</div>
  <p>After one epoch, which is the same amount of arithmetic for all three, batch GD has made a single step and is still at MSE 19.8, while mini-batch and SGD are already at about 1.03, the noise level of the data (the exact least-squares answer has MSE 1.032). Many cheap, noisy steps beat one exact step. But look at epoch 20: with a constant learning rate the stochastic versions never quite settle. SGD has actually got slightly worse (1.0384), because the noise in each step keeps kicking it around the bottom. That is why SGD needs a decaying learning rate to converge exactly, and why mini-batches, whose noise shrinks like 1/√b, are the usual compromise. They also suit modern hardware, which processes a batch of rows in parallel as one matrix multiplication.</p>
  <p>Two more points come up in interviews. The noise of SGD is not only a cost: in non-convex problems it helps the optimiser escape saddle points and sharp minima, and it is thought to act as a mild regularizer. And the data must be <strong>shuffled</strong>: if rows are sorted by date, area or class, consecutive batches are not random samples, and the model chases the small flats, then the big ones. In scikit-learn, <code>SGDRegressor</code> and <code>SGDClassifier</code> implement this with a decaying schedule, and the loss is a single argument: <code>loss="hinge"</code> gives a linear SVM, <code>loss="log_loss"</code> a logistic regression, <code>loss="huber"</code> a robust regression. One optimiser, many models.</p>

  <h2 id="lg-scale"><span class="num">10</span>Feature Scaling, Momentum and Adam</h2>
  <p>In section 07 we quietly measured area from its average "to keep the arithmetic clean". That was not only cosmetic. For MSE, the curvature along each feature is roughly twice the average of that feature squared, and the intercept's curvature is 2. With centred area the two curvatures are 16.5 and 2. With raw area (5 to 14, never near zero) the slope and the intercept become tangled together and the ratio of curvatures jumps to about 1,200. Record area in square feet instead (500 to 1,400) and the numbers squared are 10,000 times larger again. The bowl turns into a canyon: extremely steep across one direction, almost flat along another. Because the learning rate must stay below 2/L for the steep direction, each step along the flat direction moves almost nothing. Let us count steps to convergence, using the best safe learning rate each time, for four versions of the same feature:</p>
  <div class="fx" data-lang="py">import numpy as np

def gd_steps(feature, max_steps=100_000):
    X = np.c_[feature, np.ones(10)]
    eig = np.linalg.eigvalsh(2 / 10 * X.T @ X)
    lr = 1 / eig.max()                                 # the best safe step for this bowl
    theta = np.zeros(2)
    for t in range(1, max_steps + 1):
        theta -= lr * 2 / 10 * X.T @ (X @ theta - price)
        if np.mean((X @ theta - price) ** 2) &lt; 4.6 * (1 + 1e-6):
            return t, eig.max() / eig.min()
    return f"&gt;{max_steps}", eig.max() / eig.min()

for name, f in [("raw area (5..14)", area), ("area in sq ft", 100 * area),
                ("centred (x - 9.5)", area - 9.5), ("standardized", (area - 9.5) / area.std())]:
    steps, kappa = gd_steps(f)
    print(f"{name:18s}: condition number {kappa:12.1f}   steps {steps}")</div>
  <div class="fx" data-lang="text">raw area (5..14)  : condition number       1198.0   steps 8549
area in sq ft     : condition number   11760324.9   steps &gt;100000
centred (x - 9.5) : condition number          8.3   steps 81
standardized      : condition number          1.0   steps 1</div>
  <p>Same ten flats, same line, same final answer, wildly different effort. Raw area has condition number 1,198 and needs 8,549 steps. Area in square feet has κ ≈ 11.8 million and does not converge in 100,000 steps. Centring brings κ down to 8.25 and the step count to 81. <strong>Standardization</strong>, subtracting the mean and dividing by the standard deviation, gives κ = 1, a perfectly round bowl, where one step with η = 0.5 lands exactly on the bottom. Only the optimiser's job changed; after converting the weight back to the original units the line is price = 6 × area + 10 every time.</p>
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
  <p>The figure shows why. On the left, an elongated bowl forces a small step size and the path zig-zags across the narrow direction while creeping along the long one. On the right, after standardization, the bowl is nearly round and gradient descent heads almost straight for the centre. This is why every model trained by gradient descent (linear and logistic regression with SGD, neural networks) needs scaled inputs, using statistics computed on the training rows only. Models solved in closed form, and tree models, do not care (<a class="xref" data-note="ml_features">Feature Engineering</a> covers the scalers).</p>
  <p>Sometimes the valley cannot be rescaled away: it may be tilted (because features are correlated) or it may appear deep inside a neural network. Then we let the optimiser adapt. <strong>Momentum</strong> treats the parameters like a heavy ball rolling downhill. It keeps a running "velocity" v that adds up past gradients, v ← β·v + ∇J, and steps along it, θ ← θ − η·v, with β around 0.9. Along the valley floor the gradients keep pointing the same way, so the velocity builds up speed. Across the valley they flip sign every step, so they cancel inside v and the zig-zag is damped. <strong>Adam</strong> goes one step further. It keeps two running averages per parameter: m, the average gradient (like momentum), and s, the average <em>squared</em> gradient, a measure of how big that parameter's gradients usually are. It steps by m/√s, so a parameter with huge gradients takes small steps and one with tiny gradients takes larger ones. Because both averages start at zero they are biased low for the first few steps, and Adam divides them by (1 − βᵗ) to correct for that. By hand on the first step: with gradient g, m = 0.1g and s = 0.001g², and after correction m̂ = g and ŝ = g², so the step is η·g/|g| = η for <em>every</em> parameter, however different their gradients are. Here are all three on the raw-area flats, the badly conditioned case:</p>
  <div class="fx" data-lang="py">import numpy as np

X = np.c_[area, np.ones(10)]                           # RAW area: a long, thin valley
grad = lambda th: 2 / 10 * X.T @ (X @ th - price)
L = np.linalg.eigvalsh(2 / 10 * X.T @ X).max()

def run(update):
    th, s = np.zeros(2), {}
    for t in range(1, 50_001):
        th = update(th, s, t)
        if np.mean((X @ th - price) ** 2) &lt; 4.6 * (1 + 1e-6):
            return t, th

def gd(th, s, t):
    return th - grad(th) / L
def momentum(th, s, t, beta=0.9):
    s["v"] = beta * s.get("v", 0) + grad(th)           # running sum of past gradients
    return th - s["v"] / L
def adam(th, s, t, lr=0.5, b1=0.9, b2=0.999):
    g = grad(th)
    s["m"] = b1 * s.get("m", 0) + (1 - b1) * g         # average gradient
    s["s"] = b2 * s.get("s", 0) + (1 - b2) * g**2      # average squared gradient
    m_hat, s_hat = s["m"] / (1 - b1**t), s["s"] / (1 - b2**t)
    return th - lr * m_hat / (np.sqrt(s_hat) + 1e-8)

for name, fn in [("plain GD", gd), ("momentum", momentum), ("Adam", adam)]:
    t, th = run(fn)
    print(f"{name:9s}: {t:5d} steps   (w, b) = {th.round(3)}")</div>
  <div class="fx" data-lang="text">plain GD :  8549 steps   (w, b) = [6.001 9.993]
momentum :   792 steps   (w, b) = [6.001 9.993]
Adam     :   975 steps   (w, b) = [6.001 9.993]</div>
  <p>Momentum cuts the work from 8,549 steps to 792, more than ten times fewer, without touching the data. Adam needs 975. All three reach the same line. Standardizing first (one step) is still the cheapest fix when it is available. Adam's real strength is in deep networks with millions of parameters whose gradient sizes differ by orders of magnitude, where no single learning rate suits them all; its default η = 0.001 works reasonably across many problems, which is why it is the deep-learning default. For classic convex models like logistic regression, scikit-learn uses specialised solvers (lbfgs, coordinate descent) that beat both. RMSProp, Nesterov momentum and AdamW are covered in <a class="xref" data-note="m_optimization">Optimization</a>.</p>

  <h2 id="lg-closed"><span class="num">11</span>Closed Form vs Gradient Descent</h2>
  <p>Gradient descent took anywhere from 1 to 8,549 steps to reach w = 6, b = 10, yet <a class="xref" data-note="ml_intro">What is Machine Learning</a> found that line with a single formula. If a formula exists, why iterate at all? Because the formula exists only for squared loss with a linear model.</p>
  <p>At the bottom of the bowl the gradient is zero: (2/n)Xᵀ(Xθ − y) = 0. Rearranged, that is a set of linear equations called the <strong>normal equation</strong>, XᵀXθ = Xᵀy, which can be solved in one go. For the flats, with columns (area, 1), XᵀX = [[985, 95], [95, 10]] and Xᵀy = [6860, 670]. Solving the 2 × 2 system 985w + 95b = 6860 and 95w + 10b = 670 by hand: the determinant is 985 × 10 − 95 × 95 = 825, so w = (10 × 6860 − 95 × 670)/825 = 4950/825 = 6 and b = (985 × 670 − 95 × 6860)/825 = 8250/825 = 10.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.linear_model import LinearRegression

X = np.c_[area, np.ones(10)]                           # columns: area, 1
print("X^T X =", (X.T @ X).tolist(), "  X^T y =", (X.T @ price).tolist())
print("solve(X^T X, X^T y):", np.linalg.solve(X.T @ X, X.T @ price))
m = LinearRegression().fit(area.reshape(-1, 1), price)
print("sklearn            :", m.coef_[0].round(4), round(m.intercept_, 4))</div>
  <div class="fx" data-lang="text">X^T X = [[985.0, 95.0], [95.0, 10.0]]   X^T y = [6860.0, 670.0]
solve(X^T X, X^T y): [ 6. 10.]
sklearn            : 6.0 10.0</div>
  <p>The same point gradient descent walked to, and the same answer <code>LinearRegression</code> gives (it uses a least-squares solver of this kind internally). In code, solve the system with <code>np.linalg.solve</code> or <code>np.linalg.lstsq</code>; never compute <code>inv(X.T @ X)</code>, because when columns are nearly collinear the inverse amplifies rounding errors. Why not always use the formula? Forming XᵀX costs about n·d² operations and solving it about d³, so with 100,000 features d³ is 10¹⁵: impractical. Gradient descent costs about n·d per step, works with data that does not fit in memory (mini-batches), and works for <em>any</em> differentiable loss. That last point is decisive: for log-loss, setting the gradient to zero gives Xᵀ(σ(Xθ) − y) = 0, with θ trapped inside a sigmoid, and no formula solves it. Logistic regression, hinge-loss SVMs, Huber regression and every neural network must be fitted iteratively.</p>
  <p>To prove that we understand every piece, here is gradient descent written from scratch for both models, checked against scikit-learn. The linear version standardizes internally (section 10) and converts the weights back to original units at the end. The logistic version uses the p − y gradient from section 04 plus the small L2 penalty that sklearn's <code>LogisticRegression</code> adds by default, so that both minimise exactly the same cost.</p>
  <div class="fx" data-lang="py">import numpy as np
from sklearn.datasets import load_diabetes, load_breast_cancer
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression, LogisticRegression

def linear_gd(X, y, lr=0.2, n_iter=20000):
    mu, sd = X.mean(0), X.std(0)
    Z = (X - mu) / sd                                  # standardize: a round bowl
    w, b = np.zeros(X.shape[1]), 0.0
    for _ in range(n_iter):
        err = Z @ w + b - y
        w -= lr * 2 / len(y) * Z.T @ err
        b -= lr * 2 / len(y) * err.sum()
    return w / sd, b - (mu / sd) @ w                   # back to original units

def logistic_gd(X, y, C=1.0, lr=0.5, n_iter=50000):    # same objective as sklearn's C
    w, b, n = np.zeros(X.shape[1]), 0.0, len(y)
    for _ in range(n_iter):
        p = 1 / (1 + np.exp(-(X @ w + b)))
        w -= lr * (X.T @ (p - y) / n + w / (C * n))    # gradient p - y, plus the L2 penalty
        b -= lr * (p - y).mean()
    return w, b

X, y = load_diabetes(return_X_y=True)                  # 442 patients, 10 features
w, b = linear_gd(X, y)
print("linear  : max |coef difference| vs LinearRegression =", f"{np.abs(w - LinearRegression().fit(X, y).coef_).max():.1e}")
Xc, yc = load_breast_cancer(return_X_y=True)           # 569 tumours, 30 features
Xc = StandardScaler().fit_transform(Xc)
w, b = logistic_gd(Xc, yc)
ref = LogisticRegression(C=1.0, tol=1e-10, max_iter=10_000).fit(Xc, yc)
print("logistic: max |coef difference| vs LogisticRegression =", f"{np.abs(w - ref.coef_[0]).max():.1e}")</div>
  <div class="fx" data-lang="text">linear  : max |coef difference| vs LinearRegression = 1.5e-11
logistic: max |coef difference| vs LogisticRegression = 1.1e-06</div>
  <p>On the diabetes data (442 patients, 10 features) our coefficients agree with <code>LinearRegression</code>'s exact solution to about 10⁻¹¹, and on breast cancer (569 rows, 30 features) the logistic coefficients agree with sklearn's lbfgs solver to about 10⁻⁶. Two choices made that possible: a learning rate below the 2/L limit, and enough iterations for the flattest directions (diabetes has a condition number near 470 because several blood-serum features are strongly correlated). When you check your own implementation, compare the whole coefficient vector, not just the first two decimals of the loss.</p>

  <h2 id="lg-traps"><span class="num">12</span>Common Mistakes</h2>
  <p>The most common mistake with gradient descent is a sign error. The update θ ← θ − η·(2/n)Xᵀe is correct when the error is defined as e = ŷ − y. If you define it as y − ŷ and keep the minus sign, every step goes uphill:</p>
  <div class="fx" data-lang="py">import numpy as np

u = area - area.mean()
for label, sign in [("e = y_hat - y (correct)", 1), ("e = y - y_hat (wrong)  ", -1)]:
    w, c = 0.0, 0.0
    for step in range(3):
        e = sign * ((w * u + c) - price)
        w, c = w - 0.1 * 2 / 10 * (e * u).sum(), c - 0.1 * 2 / 10 * e.sum()
    print(f"{label}: cost after 3 steps = {np.mean((w * u + c - price) ** 2):10.1f}   (start 4790.6)")</div>
  <div class="fx" data-lang="text">e = y_hat - y (correct): cost after 3 steps =     1203.8   (start 4790.6)
e = y - y_hat (wrong)  : cost after 3 steps =   116265.2   (start 4790.6)</div>
  <p>With the correct sign the cost falls from 4790.6 to 1203.8 in three steps, exactly as in section 07; with the wrong sign it rises to 116,265. The habit that catches this, and many other bugs, is to print the cost after the first step and check that it went down. The same check catches a learning rate that is too big: a rising or <code>nan</code> loss means η is above 2/L (0.125 against a limit of 0.121 on the flats sent the cost to 10²⁸), and the first fix is to divide η by 10 and scale the features, before changing the model. A related slip is summing the losses instead of averaging them: the gradient is then n times bigger, so a learning rate that worked on 100 rows explodes on 100,000.</p>
  <p>The second family of mistakes is choosing the wrong loss. Squared loss on a sigmoid output for classification gives almost no gradient when the model is confidently wrong (−0.0049 against log-loss's −0.998 at z = −6) and is not convex; use log-loss. Squared loss on dirty data lets one typo drag the slope from 6 to 4.53; clean the data or use Huber or absolute loss. Hinge loss with 0/1 labels instead of −1/+1 makes every margin zero and every loss 1. And log-loss with probabilities of exactly 0 or 1 is infinite; clip the probabilities or use a "with logits" loss.</p>
  <p>Finally, do not confuse the loss with the goal. Gradient descent minimises the <em>training</em> cost, and a lower training loss can simply mean overfitting (<a class="xref" data-note="ml_core">Bias, Variance &amp; Generalization</a>), so watch a validation curve. The training loss and the reported metric can also disagree: doubling the flats' scores lowered log-loss from 0.180 to 0.083 without changing a single predicted class. Expecting SGD with a fixed learning rate to give exact answers is a similar misunderstanding: it hovers around the minimum (MSE 1.038 against the exact 1.032) unless the learning rate decays. And forgetting to scale features for any gradient-trained model turns 1 step into 8,549.</p>

  <h2 id="lg-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Key definitions</h3>
  <ul>
    <li><b>Loss</b> L(y, ŷ): penalty for one prediction. <b>Cost / objective</b> J(θ): average loss over training rows (plus any penalty), minimised by training. <b>Metric</b>: what is reported; need not be differentiable.</li>
    <li><b>Residual</b> r = y − ŷ (regression). <b>Margin</b> m = y·f(x) with y ∈ {−1, +1} (classification; positive = correct).</li>
    <li><b>Maximum likelihood</b>: minimising −log likelihood gives squared loss (Gaussian noise), absolute loss (Laplace noise), log-loss (Bernoulli).</li>
    <li><b>Surrogate loss</b>: a convex stand-in above the 0-1 loss (hinge, log-loss) that has usable gradients.</li>
    <li><b>Gradient</b>: vector of partial derivatives, points uphill. <b>Learning rate</b> η: step size.</li>
    <li><b>Hessian</b>: matrix of second derivatives (curvatures). <b>Condition number</b> κ = largest / smallest eigenvalue: high κ = long thin valley = slow GD.</li>
    <li><b>Convex</b>: bowl-shaped everywhere (Hessian has no negative eigenvalues), so any zero-gradient point is the global minimum.</li>
    <li><b>Epoch</b>: one pass over all training rows.</li>
  </ul>
  <h3>The losses</h3>
  <table class="tbl">
    <tr><th>Loss</th><th>Formula</th><th>Gradient</th><th>Predicts / assumes</th><th>Outliers</th><th>Used by</th></tr>
    <tr><td>Squared</td><td>(y − ŷ)²</td><td>2(ŷ − y)</td><td>mean; Gaussian noise</td><td>dominate</td><td>OLS, ridge, GBM default</td></tr>
    <tr><td>Absolute</td><td>|y − ŷ|</td><td>sign(ŷ − y), kink at 0</td><td>median; Laplace noise</td><td>robust</td><td>quantile regression</td></tr>
    <tr><td>Huber</td><td>½r² if |r| ≤ δ, else δ(|r| − ½δ)</td><td>r clipped to ±δ</td><td>between mean and median</td><td>robust</td><td>HuberRegressor</td></tr>
    <tr><td>Log-loss</td><td>−[y ln p + (1 − y) ln(1 − p)]</td><td>p − y (w.r.t. score)</td><td>calibrated probabilities</td><td>confident errors huge</td><td>logistic regression, NNs, GBM</td></tr>
    <tr><td>Hinge</td><td>max(0, 1 − y·f)</td><td>−y if margin &lt; 1, else 0</td><td>a margin; no probabilities</td><td>moderate</td><td>SVM</td></tr>
    <tr><td>0-1</td><td>1 if wrong, else 0</td><td>0 or undefined</td><td>the error rate</td><td>–</td><td>evaluation only</td></tr>
  </table>
  <h3>Optimisers</h3>
  <table class="tbl">
    <tr><th>Method</th><th>Update</th><th>Good for</th></tr>
    <tr><td>Closed form</td><td>solve XᵀXθ = Xᵀy</td><td>squared loss (and ridge), moderate number of features</td></tr>
    <tr><td>Batch GD</td><td>θ ← θ − η∇J on all rows</td><td>small, smooth, convex problems</td></tr>
    <tr><td>SGD / mini-batch</td><td>same, on 1 or b random rows</td><td>large data; decaying η for exact convergence</td></tr>
    <tr><td>Momentum</td><td>v ← βv + g; θ ← θ − ηv</td><td>zig-zagging valleys</td></tr>
    <tr><td>Adam</td><td>θ ← θ − η·m̂/(√ŝ + ε)</td><td>deep learning default (η = 0.001, β₁ = 0.9, β₂ = 0.999)</td></tr>
    <tr><td>Newton / lbfgs</td><td>uses curvature too</td><td>logistic regression in sklearn</td></tr>
  </table>
  <h3>Key formulas and numbers</h3>
  <div class="fx" data-lang="py"># gradient descent for linear regression with MSE
grad = 2 / n * X.T @ (X @ theta - y)        # e = y_hat - y
theta = theta - lr * grad                   # stable only if lr &lt; 2 / L

# log-loss gradient with respect to the score z = Xw + b
p = 1 / (1 + np.exp(-(X @ w + b)))
grad_w = X.T @ (p - y) / n

# Adam, per parameter
m = b1 * m + (1 - b1) * g;  s = b2 * s + (1 - b2) * g**2
theta -= lr * (m / (1 - b1**t)) / (np.sqrt(s / (1 - b2**t)) + eps)</div>
  <ul>
    <li>Flats: MSE 4.6 → 66.7 with one typo; MAE 2.0 → 4.3; slope 6 → 4.53 (OLS) vs 5.58 (Huber).</li>
    <li>Centred flats: J = 4.6 + 8.25(w − 6)² + (c − 67)²; Hessian eigenvalues 16.5 and 2; η &lt; 0.121.</li>
    <li>Scaling: κ 1,198 (raw) → 8.25 (centred) → 1 (standardized); steps 8,549 → 81 → 1.</li>
  </ul>
  <h3>Gotchas</h3>
  <ul>
    <li>MSE for classification: non-convex, vanishing gradient when confidently wrong. Use log-loss.</li>
    <li>Rising or <code>nan</code> loss: η too big or features unscaled.</li>
    <li>Wrong sign or wrong label coding (hinge needs −1/+1, log-loss 0/1): check that the first step lowers the cost.</li>
    <li>Fixed-η SGD never settles exactly; shuffle every epoch.</li>
    <li>Convex means the right destination, not a fast trip.</li>
    <li>Low training loss is not a good model; low loss is not a good metric.</li>
  </ul>

  <h2 id="lg-qa"><span class="num">13</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a loss function, a cost function and a metric?</summary><div class="qa-body">A loss scores one prediction. The cost (objective) is the average loss over the training set, as a function of the parameters, plus any regularization penalty; it is what the optimiser minimises. A metric is the number reported for a dataset, such as accuracy or RMSE; it should match the business goal but need not be differentiable, and it can differ from the loss used for training.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does minimising squared error give the mean, and absolute error the median?</summary><div class="qa-body">For a constant c, the derivative of Σ(yᵢ − c)² is −2Σ(yᵢ − c), which is zero when c is the mean. The slope of Σ|yᵢ − c| is (number of points below c) − (number above c), which is zero at the middle value, the median. That is why squared loss is pulled by outliers (one typo moved the flats' mean from 67 to 64.3) while absolute loss is not (median stayed at 67–68).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive MSE and log-loss from maximum likelihood.</summary><div class="qa-body">With Gaussian noise, −log of the product of densities is a constant plus Σ(yᵢ − ŷᵢ)²/(2σ²), so maximising likelihood is minimising squared error. For a yes/no label with P(y | p) = pʸ(1 − p)¹⁻ʸ, −log of the product over rows is −Σ[yᵢ ln pᵢ + (1 − yᵢ) ln(1 − pᵢ)], which is the log-loss.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When would you use MAE or Huber loss instead of MSE?</summary><div class="qa-body">When the data contain outliers or occasional bad rows that should not dominate the fit, or when you care about the median rather than the mean. Huber is quadratic for small residuals (smooth gradients) and linear for large ones (bounded influence), so it is robust and still easy to optimise. If large errors are genuinely costly, MSE is the right choice because it punishes them most.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Show that the gradient of log-loss with respect to the logit is p − y.</summary><div class="qa-body">With p = σ(z) and σ'(z) = p(1 − p): dL/dz = −[y/p − (1 − y)/(1 − p)]·p(1 − p) = −[y(1 − p) − (1 − y)p] = p − y. So the gradient with respect to the weights is (p − y)·x, the same form as linear regression's gradient.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why not use MSE as the loss for logistic regression?</summary><div class="qa-body">Through a sigmoid, MSE is non-convex in the weights, and its gradient 2(p − y)p(1 − p) almost vanishes when the model is confidently wrong (about −0.005 at z = −6 against −0.998 for log-loss), so the model learns slowly from its worst mistakes. Log-loss is convex, has the simple gradient p − y, and rewards calibrated probabilities.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is hinge loss, and what are support vectors?</summary><div class="qa-body">Hinge loss is max(0, 1 − y·f(x)) with labels −1/+1. Rows with margin at least 1 have zero loss and zero gradient, so they do not affect the solution; only rows inside the margin or misclassified matter, and those are the support vectors. Hinge loss plus an L2 penalty on the weights is the soft-margin linear SVM.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why don't we train classifiers by minimising the 0-1 loss directly?</summary><div class="qa-body">It is flat almost everywhere and jumps at the boundary, so its gradient is zero or undefined and gradient methods get no signal; exact minimisation is NP-hard in general; and it ignores how close a row is to the boundary. We minimise convex surrogates such as log-loss or hinge, which lie above it and, with enough data, also minimise the error rate.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain gradient descent and write its update rule.</summary><div class="qa-body">Start from some parameters, compute the gradient of the cost (the direction of steepest increase), and step the opposite way: θ ← θ − η∇J(θ). Repeat until the gradient is near zero or the cost stops falling. For linear regression with MSE, ∇J = (2/n)Xᵀ(Xθ − y).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens if the learning rate is too small or too large? How do you choose it?</summary><div class="qa-body">Too small: convergence is very slow. Too large: the steps overshoot, the cost oscillates or diverges (often to nan). For a quadratic cost, GD converges only if η &lt; 2/L, where L is the largest Hessian eigenvalue. In practice, try values on a log scale, watch the training loss, and often decay η during training.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is convexity and why does it matter for optimisation?</summary><div class="qa-body">A convex function lies below its chords; equivalently its Hessian has no negative eigenvalues. Then every point with zero gradient is a global minimum, so gradient descent cannot get stuck in a worse local minimum. Linear regression with MSE, logistic regression, SVMs and Huber regression are convex; neural networks are not. Convexity guarantees where you end up, not how fast.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compare batch, stochastic and mini-batch gradient descent.</summary><div class="qa-body">Batch uses all rows per update: exact gradient, smooth convergence, expensive steps. SGD uses one row: cheap, noisy steps that need a decaying learning rate to settle. Mini-batch uses 32–512 rows: less noise than SGD, vectorises well on GPUs, and is the standard choice for large data and deep learning. A random row's gradient is an unbiased estimate of the full gradient.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does feature scaling speed up gradient descent?</summary><div class="qa-body">Features on very different scales make the cost surface a long, narrow valley (high condition number). The learning rate must be small enough for the steep direction, so progress along the flat direction is tiny and the path zig-zags. Standardizing makes the bowl rounder; on the flats it cut the steps from 8,549 to 1. Tree models and closed-form solutions do not need it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain momentum and Adam.</summary><div class="qa-body">Momentum keeps a running sum of past gradients and steps along it, which speeds up movement in consistent directions and cancels oscillations. Adam combines momentum with a per-parameter running average of squared gradients and divides by its square root, so every parameter moves on a similar scale; it also corrects the bias from initialising both averages at zero. Adam is the default for deep learning.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Normal equation or gradient descent: when do you use which?</summary><div class="qa-body">The normal equation solves XᵀXθ = Xᵀy exactly, needs no learning rate, and costs about nd² + d³, so it suits squared loss with up to a few thousand features. Gradient descent costs about nd per step, handles huge feature counts and streaming data, and works for any differentiable loss, so it is required for logistic regression, SVMs and neural networks, which have no closed form.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your training loss suddenly becomes nan. What do you check?</summary><div class="qa-body">First the learning rate (too large makes the updates explode) and feature scaling. Then numerical issues: log of 0 in log-loss (clip probabilities or use a with-logits loss), division by zero, overflow in exp, and nan or infinite values in the input data. Check that the cost falls after the first step.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>If your data has outliers, does changing the optimiser help?</summary><div class="qa-body">No. The optimiser only decides how fast you reach the minimum of the cost; the loss decides where that minimum is. With squared loss, every optimiser lands on the same outlier-damaged line (slope 4.53 on the flats). Only changing the loss (Huber: 5.58) or cleaning the data changes the answer.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do loss gradients appear in gradient boosting?</summary><div class="qa-body">Gradient boosting fits each new tree to the negative gradient of the loss at the current predictions: the residual y − ŷ for squared loss, y − p for log-loss, the sign of the residual for absolute loss. So changing the loss changes what each tree is trained to correct. This is gradient descent performed in the space of functions rather than parameters (<a class="xref" data-note="ml_gbm">Gradient Boosting</a>).</div></details>
</main>
`
});
