// notes/mathstats/m_optimization.js — Optimization
Object.assign(TOPIC_CONTENT, {
  "m_optimization": `<main>
  <h1>Optimization</h1>
  <div class="where"><span>Mathematics &amp; Statistics</span><span>Math for ML</span><span>Optimization</span></div>
  <p class="lead">Optimization is the search for the best setting of something. In ML, "something" is the model's weights and "best" means lowest loss. This note turns the gradient from <a class="xref" data-note="m_calculus">Calculus</a> into working optimizers, each idea answering a question the previous one could not, all on ONE running example: minimising the squared-error loss of the three houses from <a class="xref" data-note="m_linalg">Linear Algebra</a> (sizes 1, 2, 3; rooms 1, 3, 2; prices 2, 4, 6). You will see the loss as a landscape, walk down it with gradient descent, break it with a too-big step, learn why our bowl has one bottom (convexity), use one house at a time (SGD), speed up with momentum and Adam, schedule the step size, reshape the valley with feature scaling, change the objective with regularization, and finish with hard rules on the weights (Lagrange multipliers).</p>

  <h2 id="mop-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 170" width="660">
<defs><marker id="mop-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="130" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="75" y="41" text-anchor="middle" font-size="12">Linear Algebra</text><text x="75" y="58" text-anchor="middle" class="tm" font-size="10">X, XᵀX, w = [2, 0]</text>
<line x1="140" y1="45" x2="168" y2="45" stroke="currentColor" marker-end="url(#mop-a0)"/>
<rect x="170" y="20" width="120" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="230" y="41" text-anchor="middle" font-size="12">Calculus</text><text x="230" y="58" text-anchor="middle" class="tm" font-size="10">gradient, Hessian 27 : 1</text>
<line x1="290" y1="45" x2="318" y2="45" stroke="currentColor" marker-end="url(#mop-a0)"/>
<rect x="320" y="20" width="120" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="380" y="41" text-anchor="middle" font-size="12" font-weight="700">Optimization</text><text x="380" y="59" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<line x1="440" y1="45" x2="468" y2="45" stroke="currentColor" marker-end="url(#mop-a0)"/>
<rect x="470" y="20" width="180" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="560" y="41" text-anchor="middle" font-size="12">ML &amp; deep learning</text><text x="560" y="58" text-anchor="middle" class="tm" font-size="10">training loops, Adam, ridge</text>
<text x="330" y="115" text-anchor="middle" class="tm" font-size="10.5">same three houses: minimise L(w) = mean((Xw − y)²);</text><text x="330" y="131" text-anchor="middle" class="tm" font-size="10.5">bottom at w = (2, 0), a valley 27 times steeper one way than the other</text>
</svg><figcaption>The Math for ML track ends here. Linear algebra gave the objects, calculus the slope and curvature; optimization uses them to walk to the best weights.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="m_calculus">Calculus</a></b><span>We can compute the gradient of any loss (backprop) and its curvature (Hessian). But a gradient only says which way is down here, not how far to step or what to do with a million rows.</span></li>
    <li><b>This note adds: a reliable recipe for walking downhill</b><span>Loss landscapes, gradient descent, learning rate, convexity, SGD and mini-batches, momentum and Adam, schedules, feature scaling, regularization, constraints.</span></li>
    <li><b>Leads to: the ML notes</b><span><a class="xref" data-note="ml_loss_gd">Loss &amp; Gradient Descent</a> and <a class="xref" data-note="ml_core">Core Concepts</a> use these optimizers on real models; <a class="xref" data-note="ml_regression">Linear Regression</a> and <a class="xref" data-note="ml_ridge_lasso">Ridge &amp; Lasso</a> use the same loss and penalty; <a class="xref" data-note="ml_svm">SVMs</a> are a constrained problem solved with Lagrange multipliers; <a class="xref" data-note="dl_foundations">Neural Network Foundations</a> trains with Adam.</span></li>
  </ol>

  <h2 id="mop-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each idea answers the question above it, and its weakness raises the next question. Running example: X = [[1, 1], [2, 3], [3, 2]] ([size, rooms] of houses A, B, C), y = [2, 4, 6]; one-weight loss L(w) = mean((w·size − y)²), two-weight loss L(w₁, w₂) = mean((Xw − y)²).</p>
  <ol class="story">
    <li><b>Loss landscape</b><span>Q: what are we actually searching? → Every weight setting is a place, its loss is the height: L = 18.67, 4.67, 0, 4.67, 18.67 for w = 0…4, a bowl with its bottom at w = 2. But how do we find the bottom without trying every w?</span></li>
    <li><b>Gradient descent</b><span>Q: how do we walk downhill using only the local slope? → w ← w − lr·∇L: 0 → 1.867 → 1.991 → 2. With two weights it zig-zags: (0, 0) → (1.87, 1.73) → (0.49, 0.23) … → (2, 0) in ~100 steps. But how big should each step be?</span></li>
    <li><b>Learning rate</b><span>Q: what step size? → lr = 0.1 converges; lr = 0.25 jumps over the bottom and diverges (4.67, −1.56, 6.74 …). The limit is 2 / curvature = 2 / 9.33 = 0.214. Fine, but does walking downhill always find the <em>best</em> bottom?</span></li>
    <li><b>Convexity</b><span>Q: is the bottom we reach the best one? → Our loss is convex (Hessian eigenvalues 18, 0.67 &gt; 0): from any start GD ends at (2, 0). Neural nets are not: the start decides the valley, and saddles stall. But each step uses every house; what if there are millions?</span></li>
    <li><b>Batch, SGD, mini-batch</b><span>Q: can each step use only part of the data? → One house's gradient (−4, −16 or −36 at w = 0) is a noisy guess of the average −18.67. Mini-batches: many cheap, slightly noisy steps. But noise and the narrow valley still make the path zig-zag…</span></li>
    <li><b>Momentum, RMSProp, Adam</b><span>Q: can steps remember the past and adapt per weight? → Momentum (β = 0.7) cuts our 98 GD steps to 39; Adam scales each weight separately and wins when the stretch is along an axis. But a fixed lr is either fast or precise, not both…</span></li>
    <li><b>Learning-rate schedules</b><span>Q: can the step size change during training? → Big steps early, small late: step decay, cosine, warmup. But why is the valley narrow in the first place?</span></li>
    <li><b>Feature scaling</b><span>Q: can we reshape the landscape itself? → Size in plain sq ft makes the valley 7 million times more stretched (lr limit 2e-7); standardising brings the condition number down to 3. But near-duplicate features still let weights explode…</span></li>
    <li><b>Regularization</b><span>Q: can we change the objective to prefer small, stable weights? → Add λ‖w‖²: on the houses λ = 1 gives (1.46, 0.46) instead of (2, 0); near-copies get ±19 without it, 0.76 each with it. A soft preference. What if a rule must hold exactly?</span></li>
    <li><b>Constraints &amp; Lagrange multipliers</b><span>Q: how do we minimise with a hard rule, like w₁ + w₂ = 1? → At the best allowed point the gradient is parallel to the rule's gradient: w = (1.5, −0.5), loss 4.5, multiplier λ = −9 (the price of the rule). Regularization is the soft version; SVMs use the hard one.</span></li>
  </ol>

  <h2 id="mop-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Optimization</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Loss landscape</div>
        <ul>
          <li><b>Weights = position, loss = height</b>; training walks downhill</li>
          <li><b>Houses, one weight</b> — L = 18.7, 4.7, 0, 4.7, 18.7 for w = 0..4; bowl, bottom w = 2</li>
          <li><b>Two weights</b> — narrow valley along (1, −1), bottom (2, 0)</li>
          <li><b>MSE / MAE / cross-entropy / hinge</b> — differently shaped landscapes</li>
          <li>💡 hiker in fog: feels slope under boots</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Gradient descent &amp; lr</div>
        <ul>
          <li><b>Loop</b> — predict → loss → ∇L → <code>w ← w − lr·∇L</code> → repeat</li>
          <li><b>By hand</b> — w=0, grad −18.67, lr 0.1 → 1.867 → 1.991 → 2</li>
          <li><b>Limit</b> — diverges when lr &gt; 2 / curvature (ours 0.214; two weights 0.111)</li>
          <li><b>lr 0.25</b> — 4.67, −1.56, 6.74, −4.32: diverges</li>
          <li>⚠ <b>Loss → NaN</b> — cut lr 10× first</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Convex vs non-convex</div>
        <ul>
          <li><b>Convex</b> — one bowl; ours (Hessian eig 18, 0.67); linear/logistic reg, SVM</li>
          <li><b>Non-convex</b> — neural nets, k-means; start decides the valley</li>
          <li><b>Saddle</b> — ∇ = 0 but downhill exists; GD stalls then escapes</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Batch vs SGD vs mini-batch</div>
        <ul>
          <li><b>Per-house gradients at w = 0</b> — −4, −16, −36; average −18.67</li>
          <li><b>Mini-batch (32–1024)</b> — default: many updates, little noise, fills GPU</li>
          <li><b>Epoch</b> — one full pass; <b>shuffle every epoch</b></li>
          <li>⚠ <code>torch.optim.SGD</code> = update rule, not batch size 1</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Momentum, RMSProp, Adam</div>
        <ul>
          <li><b>Momentum</b> — v = βv + g; zig-zags cancel; houses: 98 → 39 steps</li>
          <li><b>RMSProp</b> — divide by √(avg g²): per-weight step size</li>
          <li><b>Adam</b> — momentum + RMSProp + bias correction</li>
          <li><b>Axis-aligned valley</b> — GD 249, Momentum 146, Adam 151, RMSProp stalls</li>
          <li><b>Defaults</b> — AdamW lr 1e-3 (3e-4 transformers), β₁ 0.9, β₂ 0.999</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Schedules &amp; scaling</div>
        <ul>
          <li><b>Schedules</b> — step decay, exponential, cosine, warmup, ReduceLROnPlateau</li>
          <li><b>Scaling</b> — houses in sq ft: condition 7e6; standardised: 3</li>
          <li><b>Needs scaling</b> — GD-trained &amp; distance-based models; <b>trees don't</b></li>
          <li>⚠ Fit the scaler on train only</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Regularization &amp; constraints</div>
        <ul>
          <li><b>Objective</b> = data loss + λ‖w‖² → gradient gains 2λw (weight decay)</li>
          <li><b>Houses</b> — λ = 1: w = (1.46, 0.46), train loss 0.19</li>
          <li><b>Lagrange</b> — ∇L = λ∇g at the best point; w₁ + w₂ = 1 → (1.5, −0.5), λ = −9</li>
          <li><b>λ = shadow price</b> — loss change per unit loosening of the rule</li>
          <li>⚠ <b>Adam + L2 ≠ weight decay</b> → use AdamW</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mop-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="mop-land"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Loss Landscapes</span><span class="rm-sub">Weights as a position</span></div></div>
      <div class="rm-item rm-done" data-target="mop-gd"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Gradient Descent</span><span class="rm-sub">By hand, then two weights</span></div></div>
      <div class="rm-item rm-done" data-target="mop-lr"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Learning Rate</span><span class="rm-sub">Too small, right, too big</span></div></div>
      <div class="rm-item rm-done" data-target="mop-cvx"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Convex vs Non-convex</span><span class="rm-sub">One bowl or many valleys</span></div></div>
      <div class="rm-item rm-done" data-target="mop-batch"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Batch, SGD, Mini-batch</span><span class="rm-sub">How much data per step</span></div></div>
      <div class="rm-item rm-done" data-target="mop-adam"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Momentum, RMSProp, Adam</span><span class="rm-sub">Smarter steps</span></div></div>
      <div class="rm-item rm-done" data-target="mop-sched"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">LR Schedules</span><span class="rm-sub">Warm up, then decay</span></div></div>
      <div class="rm-item rm-done" data-target="mop-scale"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Feature Scaling</span><span class="rm-sub">Round bowls are fast</span></div></div>
      <div class="rm-item rm-done" data-target="mop-reg"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Regularization</span><span class="rm-sub">Penalty inside the objective</span></div></div>
      <div class="rm-item rm-done" data-target="mop-lagr"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Constraints &amp; Lagrange</span><span class="rm-sub">Hard rules on the weights</span></div></div>
      <div class="rm-item rm-done" data-target="mop-connect"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One loss, every optimizer</span></div></div>
      <div class="rm-item rm-done" data-target="mop-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="mop-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="mop-land"><span class="num">01</span>Loss Functions as Landscapes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p><a class="xref" data-note="m_calculus">Calculus</a> gave us the slope of the loss at any weight. Before we use it to search, we need a clear picture of <em>what</em> we are searching: all possible weights, and how good each one is.</p>
  </div>
  <p><strong>Plain words:</strong> a <strong>loss</strong> scores how wrong a guess is. Picture every possible weight setting as a spot on a map, with the loss as the height of the ground there. That map is the <strong>loss landscape</strong>, and training means walking to the lowest point.</p>
  <h3>The running example</h3>
  <table class="tbl out"><caption>The running example: three houses</caption>
    <tr><th>House</th><th>Size (1000 sq ft)</th><th>Rooms</th><th>Price (₹ crore)</th></tr>
    <tr><td>A</td><td>1</td><td>1</td><td>2</td></tr>
    <tr><td>B</td><td>2</td><td>3</td><td>4</td></tr>
    <tr><td>C</td><td>3</td><td>2</td><td>6</td></tr>
  </table>
  <p>Model 1 guesses price = w × size, with MSE (mean squared error) loss. <strong>Traced by hand:</strong></p>
  <ul>
    <li>w = 2: guesses 2, 4, 6. Errors 0, 0, 0. Loss <strong>0</strong>.</li>
    <li>w = 1: guesses 1, 2, 3. Errors −1, −2, −3 → squares 1, 4, 9 → mean <strong>4.67</strong>.</li>
    <li>w = 3: errors 1, 2, 3 → same squares → <strong>4.67</strong>.</li>
    <li>w = 0 or 4: errors twice as big → squares 4, 16, 36 → mean <strong>18.67</strong>.</li>
  </ul>
  <p>Model 2 also uses rooms: price = w₁ × size + w₂ × rooms. Now the map has two directions. At (1, 1) the predictions are 2, 5, 5 and the loss is (0 + 1 + 1)/3 = 0.667; at (2, 0) it is 0.</p>
  <div class="fx" data-lang="py">import numpy as np
np.set_printoptions(precision=3, suppress=True)
x = np.array([1., 2., 3.]); y = np.array([2., 4., 6.])   # houses A, B, C: size -&gt; price
X = np.array([[1., 1.], [2., 3.], [3., 2.]])             # [size, rooms]
loss = lambda w: np.mean((w * x - y) ** 2)               # 1 weight: price = w * size
L2 = lambda w: np.mean((X @ w - y) ** 2)                 # 2 weights: size and rooms
for w in [0, 1, 2, 3, 4]:
    print(w, round(loss(w), 3))
for w in [(0, 0), (2, 0), (3, 1), (1, 1), (1.5, 0.5)]:
    print(w, round(L2(np.array(w, float)), 3))</div>
  <div class="fx" data-lang="text">0 18.667
1 4.667
2 0.0
3 4.667
4 18.667
(0, 0) 18.667
(2, 0) 0.0
(3, 1) 18.0
(1, 1) 0.667
(1.5, 0.5) 0.167</div>
  <p>What the code does: <code>loss</code> is the one-weight MSE, <code>L2</code> the two-weight one using the matrix product <code>X @ w</code> (see <a class="xref" data-note="m_linalg">Linear Algebra</a>). Note (3, 1) is far from (2, 0) and scores 18, but (1.5, 0.5), equally far in another direction, scores only 0.167: the landscape is a long, narrow valley.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A hiker in fog on a hilly field. They can't see the valley, only feel the slope under their boots. Every optimizer in this note is a rule for "which way and how far to step next".</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 460 250" width="460">
    <ellipse cx="230" cy="130" rx="150" ry="29" transform="rotate(45 230 130)" fill="none" stroke="currentColor" opacity="0.35"/>
    <ellipse cx="230" cy="130" rx="75" ry="14.4" transform="rotate(45 230 130)" fill="none" stroke="currentColor" opacity="0.55"/>
    <ellipse cx="230" cy="130" rx="34.6" ry="6.7" transform="rotate(45 230 130)" class="fg sg"/>
    <polyline points="190.0,130.0 227.3,95.3 199.8,125.4 224.0,103.5 206.6,123.0 222.4,109.3 211.5,122.0 221.9,113.5 215.1,121.8 221.9,116.6 217.8,122.1 222.4,118.9" fill="none" class="sr" stroke-width="2"/>
    <circle cx="190" cy="130" r="4" class="fr sr"/><text x="110" y="148" class="tr">start (0, 0)</text>
    <circle cx="230" cy="130" r="3" fill="currentColor"/><text x="240" y="150" class="tg">bottom (2, 0)</text>
    <text x="10" y="18" class="tm">contours = equal loss; long along (1, −1), narrow along (1, 1)</text>
    <text x="10" y="240" class="tm">w₁ (size weight) →</text>
  </svg><figcaption>The two-weight landscape of the houses, to scale. The red path is real gradient descent (section 02, lr = 0.1): it bounces across the narrow valley while creeping along it.</figcaption></figure>
  <p>Different tasks use different loss functions, which give differently shaped landscapes:</p>
  <table class="tbl">
    <tr><th>Loss</th><th>Formula</th><th>In words</th><th>Used for</th></tr>
    <tr><td>MSE</td><td>mean((ŷ − y)²)</td><td>Average squared miss; big misses punished hard</td><td>Regression; a smooth bowl (ours)</td></tr>
    <tr><td>MAE</td><td>mean(|ŷ − y|)</td><td>Average size of miss; all misses count equally</td><td>Regression robust to outliers; a kink at 0</td></tr>
    <tr><td>Cross-entropy</td><td>−mean(y log p + (1−y) log(1−p))</td><td>Punish confident wrong probabilities</td><td>Classification</td></tr>
    <tr><td>Hinge</td><td>mean(max(0, 1 − y·score))</td><td>Zero once the right side is reached with a margin</td><td>SVMs</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>An <strong>optimization problem</strong>: find w* = argmin_w L(w), the weights with the lowest loss. Symbols: <code>ŷ</code> prediction, <code>y</code> truth, <code>p</code> a predicted probability. For the houses, L(w₁, w₂) = (1/3) Σᵢ (w₁·sizeᵢ + w₂·roomsᵢ − priceᵢ)², minimum 0 at (2, 0).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The loss you minimise is not always the metric you report. You might train with cross-entropy (smooth, has a gradient) but report accuracy (flat steps, no gradient). Pick a loss that is differentiable and points the same way as the metric you care about.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: gradient descent.</b> We can evaluate any spot on the map. With two weights we could still scan a grid; with a million weights a grid is impossible. How do we walk to the bottom using only the slope under our feet?</div>

  <h2 id="mop-gd"><span class="num">02</span>Gradient Descent</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We know the bowl's bottom is at w = 2 only because we tried values. A computer with millions of weights can't try them all. It can compute the gradient (the slope) at the current spot. How do we turn "slope here" into "the bottom"?</p>
  </div>
  <p><strong>Plain words:</strong> look at the slope, take a small step downhill (against the gradient), and repeat. Steep ground gives big steps; as the ground flattens near the bottom, the steps shrink by themselves.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Walking down a hill blindfolded: feel which way the ground tilts, take a step that way, feel again. You never see the bottom, but you reach it.</p>
  </div>
  <div class="flow"><span>Predict ŷ</span><span>Loss</span><span>Gradient ∇L</span><span>w ← w − lr·∇L</span><span>Repeat</span></div>
  <p><strong>Traced by hand</strong>, one weight, start w = 0, step size lr = 0.1. The slope of the houses' loss is 2 × mean((w·x − y) × x) (see <a class="xref" data-note="m_calculus">Calculus</a>, section 02).</p>
  <ul>
    <li>w = 0: errors −2, −4, −6; times sizes: −2, −8, −18; mean −9.33; times 2 → slope <strong>−18.67</strong>. Negative slope means "loss goes down as w grows", so go right: w = 0 − 0.1 × (−18.67) = <strong>1.867</strong>.</li>
    <li>w = 1.867: slope −1.24 → w = 1.867 + 0.124 = <strong>1.991</strong>.</li>
    <li>w = 1.991: slope −0.08 → <strong>1.999</strong>. The steps shrink as the slope flattens.</li>
  </ul>
  <div class="fx" data-lang="py">w = 0.0; lr = 0.1
for step in range(5):
    grad = 2 * np.mean((w * x - y) * x)
    print(f"step {step}: w={w:.4f} loss={loss(w):.4f} grad={grad:.4f} -&gt; w_new={w - lr*grad:.4f}")
    w = w - lr * grad</div>
  <div class="fx" data-lang="text">step 0: w=0.0000 loss=18.6667 grad=-18.6667 -&gt; w_new=1.8667
step 1: w=1.8667 loss=0.0830 grad=-1.2444 -&gt; w_new=1.9911
step 2: w=1.9911 loss=0.0004 grad=-0.0830 -&gt; w_new=1.9994
step 3: w=1.9994 loss=0.0000 grad=-0.0055 -&gt; w_new=2.0000
step 4: w=2.0000 loss=0.0000 grad=-0.0004 -&gt; w_new=2.0000</div>
  <p><strong>Two weights</strong>, same recipe with the gradient (2/n)Xᵀ(Xw − y), lr = 0.1, from (0, 0). The first gradient is (−18.67, −17.33), so step 1 lands at (1.867, 1.733), well past the valley floor in the steep (1, 1) direction:</p>
  <div class="fx" data-lang="py">grad2 = lambda w: 2 * X.T @ (X @ w - y) / len(y)         # (2/n) X^T (Xw - y)
w = np.array([0., 0.]); lr = 0.1
for step in range(301):
    if step in (0, 1, 2, 5, 20, 100, 300):
        print(f"step {step:3d}  w={w}  loss={L2(w):.5f}")
    w = w - lr * grad2(w)</div>
  <div class="fx" data-lang="text">step   0  w=[0. 0.]  loss=18.66667
step   1  w=[1.867 1.733]  loss=12.10074
step   2  w=[0.489 0.231]  loss=7.87869
step   5  w=[1.619 1.036]  loss=2.26714
step  20  w=[1.737 0.24 ]  loss=0.04460
step 100  w=[1.999 0.001]  loss=0.00000
step 300  w=[2. 0.]  loss=0.00000</div>
  <p>What the code does: <code>grad2</code> is the matrix gradient; each loop pass takes one step. The weights bounce (1.87, 1.73) → (0.49, 0.23) → … across the narrow valley, while drifting along it to (2, 0) in about 100 steps: the red path in section 01's picture.</p>
  <p>The same idea at scale: 100 noisy points from y = 4 + 3x, with a slope w and an intercept b.</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(42)
xs = rng.uniform(0, 2, 100)
ys = 4 + 3 * xs + rng.normal(0, 0.5, 100)      # 100 noisy houses: true w=3, b=4
w, b, lr = 0.0, 0.0, 0.1
for step in range(201):
    yhat = w * xs + b
    L = np.mean((yhat - ys) ** 2)              # MSE
    dw = 2 * np.mean((yhat - ys) * xs)         # dL/dw
    db = 2 * np.mean(yhat - ys)                # dL/db
    w, b = w - lr * dw, b - lr * db            # step downhill
    if step in (0, 1, 2, 5, 10, 50, 200):
        print(f"step {step:3d}  loss {L:7.3f}  w {w:.3f}  b {b:.3f}")</div>
  <div class="fx" data-lang="text">step   0  loss  50.736  w 1.525  b 1.383
step   1  loss  17.273  w 2.401  b 2.192
step   2  loss   6.036  w 2.902  b 2.669
step   5  loss   0.557  w 3.428  b 3.232
step  10  loss   0.317  w 3.485  b 3.429
step  50  loss   0.248  w 3.170  b 3.803
step 200  loss   0.240  w 3.021  b 3.972</div>
  <p>Big early drops (steep slope → big step), then slow polishing. w and b land near the true 3 and 4. The floor ≈ 0.24 is the noise variance (0.5² = 0.25): no weights can fit noise away. (Our three houses have no noise, so their floor is 0.)</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Gradient descent</strong>: w_{t+1} = w_t − lr·∇L(w_t). For linear regression with MSE, ∇L = (2/n)·Xᵀ(Xw − y): <code>Xw − y</code> is the vector of errors, <code>Xᵀ</code> multiplies each error by its features and sums, <code>2/n</code> comes from the square and the mean. <code>lr</code> is the <strong>learning rate</strong> (step size).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Gradient descent stops where the gradient is (near) zero, not where the loss is lowest overall. On our bowl those are the same place; section 04 shows landscapes where they are not.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the learning rate.</b> We picked lr = 0.1 and it worked. Would 0.01 or 0.25 work too? How big can a step safely be?</div>

  <h2 id="mop-lr"><span class="num">03</span>Learning Rate: Too Small, Right, Too Large</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The gradient says which way to go, not how far. Too timid wastes compute; too bold might overshoot. Is there a rule for the step size?</p>
  </div>
  <p><strong>Plain words:</strong> the <strong>learning rate</strong> multiplies the gradient to make the step. Small: slow but safe. Large: each step jumps past the bottom to the other side of the bowl, and if it lands higher than it started, the bounces grow and the loss explodes (<strong>diverges</strong>).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Walking down to a well in the dark. Tiny steps: you get there, but it takes all night. Giant leaps: you jump clean over the well and land higher on the other side, again and again.</p>
  </div>
  <p><strong>Traced:</strong> the one-weight houses with lr = 0.25. From w = 0 the slope is −18.67, so w = 0 + 0.25 × 18.67 = <strong>4.67</strong>, right over the bottom (2) and higher than we started (loss 33.2 vs 18.67). Next the slope points back and the step is again too big: <strong>−1.56</strong>, then 6.74, then −4.32.</p>
  <div class="fx" data-lang="py">w = 0.0; lr = 0.25
for step in range(4):
    grad = 2 * np.mean((w * x - y) * x)
    w = w - lr * grad
    print(step, round(w, 2), round(loss(w), 1))
curv = 2 * np.mean(x ** 2)                     # L''(w) = 28/3
print("curvature", round(curv, 3), " lr limit", round(2 / curv, 3))
for lr in [0.01, 0.1, 0.2, 0.25]:
    w = 0.0
    for _ in range(20):
        w -= lr * 2 * np.mean((w * x - y) * x)
    print(f"lr={lr:&lt;5} w after 20 steps: {w:10.3f}   loss {loss(w):.3g}")</div>
  <div class="fx" data-lang="text">0 4.67 33.2
1 -1.56 59.0
2 6.74 104.9
3 -4.32 186.5
curvature 9.333  lr limit 0.214
lr=0.01  w after 20 steps:      1.718   loss 0.371
lr=0.1   w after 20 steps:      2.000   loss 0
lr=0.2   w after 20 steps:      1.886   loss 0.061
lr=0.25  w after 20 steps:   -628.674   loss 1.86e+06</div>
  <p>What the code does: the first loop reproduces the bounces. The curvature of our loss is L″ = 2·mean(x²) = 28/3 = 9.33 (see <a class="xref" data-note="m_calculus">Calculus</a>, section 05); GD on a bowl diverges once lr &gt; 2 / curvature = <strong>0.214</strong>. The sweep confirms it: 0.01 crawls (1.72 after 20 steps), 0.1 lands exactly, 0.2 is below the limit but oscillates (1.886), 0.25 explodes to −629.</p>
  <figure class="viz"><svg viewBox="0 0 460 210" width="460">
    <line x1="50" y1="175" x2="390" y2="175" stroke="currentColor" opacity="0.4"/><line x1="50" y1="175" x2="50" y2="15" stroke="currentColor" opacity="0.4"/>
    <text x="180" y="200" class="tm">step (0 → 15)</text><text x="6" y="20" class="tm">loss</text>
    <polyline points="50,123 72,127 94,131 116,134 138,138 160,141 182,144 204,146 226,148 248,151 270,153 292,154 314,156 336,158 358,159 380,160" fill="none" class="sb" stroke-width="2.5"/>
    <polyline points="50,123 72,157 94,169 116,173 138,174 160,174 182,175 204,175 226,175 248,175 270,175 292,175 314,175 336,175 358,175 380,175" fill="none" class="sg" stroke-width="2.5"/>
    <polyline points="50,123 72,111 94,98 116,81 138,61 160,36" fill="none" class="sr" stroke-width="2.5"/>
    <text x="168" y="34" class="tr">lr=0.5: diverges</text>
    <text x="300" y="150" class="tb">lr=0.01: crawls</text>
    <text x="300" y="192" class="tg">lr=0.1: fast</text>
  </svg><figcaption>The same idea at scale: real loss curves from the 100-point regression. Same model, same data, only the step size differs.</figcaption></figure>
  <div class="fx" data-lang="py">def run(lr, steps=50):
    w = b = 0.0
    for _ in range(steps):
        yhat = w * xs + b
        w, b = w - lr * 2 * np.mean((yhat - ys) * xs), b - lr * 2 * np.mean(yhat - ys)
    return np.mean((w * xs + b - ys) ** 2)
for lr in [0.001, 0.01, 0.1, 0.3, 0.5]:
    print(f"lr={lr:&lt;5}  loss after 50 steps: {run(lr):.4g}")</div>
  <div class="fx" data-lang="text">lr=0.001  loss after 50 steps: 33.41
lr=0.01   loss after 50 steps: 1.028
lr=0.1    loss after 50 steps: 0.2475
lr=0.3    loss after 50 steps: 0.2397
lr=0.5    loss after 50 steps: 9.182e+05</div>
  <div class="callout def"><span class="label">Definition</span>
    <p>On a quadratic bowl with curvatures (Hessian eigenvalues) λ_max ≥ … ≥ λ_min, gradient descent converges only if <strong>lr &lt; 2 / λ_max</strong>. The fastest single lr is 2 / (λ_max + λ_min). Our one-weight bowl: λ = 9.33 → limit 0.214. Our two-weight valley: λ = 18 and 0.667 → limit 0.111, and lr = 0.1 sits just under it.</p>
  </div>
  <div class="callout trap"><span class="label">In practice</span>
    <p>Sweep on a log scale (1e-4, 3e-4, 1e-3, …) and pick the largest lr whose loss still falls smoothly. A loss that turns to NaN (not a number: the float overflowed) almost always means lr is too high.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: convexity.</b> With a good lr, GD reaches a flat point. On our bowl that was the bottom. But GD only ever goes downhill from where it starts: does it always reach the <em>lowest</em> point?</div>

  <h2 id="mop-cvx"><span class="num">04</span>Convex vs Non-convex</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Gradient descent stops at the first flat spot it rolls into. If the landscape had several valleys, or a flat saddle, would we get the best answer, or just a nearby one?</p>
  </div>
  <p><strong>Plain words:</strong> a landscape with exactly one valley and no bumps is <strong>convex</strong>: walk downhill from anywhere and you reach the single best point. Otherwise it is <strong>non-convex</strong>: the valley you end in depends on where you start, and a shallow valley (<strong>local minimum</strong>) may not be the deepest (<strong>global minimum</strong>).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A marble dropped into a salad bowl always ends at the same centre. Dropped onto an egg tray, it ends in whichever cup it lands above.</p>
  </div>
  <p><strong>Traced on the houses:</strong> the Hessian of our loss is (2/3)XᵀX for every w, with eigenvalues 18 and 0.667. Both positive, everywhere: the surface bends up in every direction at every point, so it is one bowl. Start GD at (0, 0), (5, −5) or (−3, 4): all end at (2, 0).</p>
  <div class="fx" data-lang="py">H = 2 * X.T @ X / len(y)                       # Hessian of the 2-weight loss: same everywhere
print(np.linalg.eigvalsh(H))                   # all &gt; 0  -&gt;  convex: one bowl
for start in [(0, 0), (5, -5), (-3, 4)]:
    w = np.array(start, float)
    for _ in range(2000):
        w = w - 0.1 * grad2(w)
    print(start, "-&gt;", np.round(w, 4))</div>
  <div class="fx" data-lang="text">[ 0.667 18.   ]
(0, 0) -&gt; [2. 0.]
(5, -5) -&gt; [ 2. -0.]
(-3, 4) -&gt; [2. 0.]</div>
  <p>Neural networks are different. A one-weight example with two valleys, f(t) = t⁴ − 3t² + t, and then a saddle f = a² − b²:</p>
  <figure class="viz"><svg viewBox="0 0 420 210" width="420">
    <defs><marker id="mop-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <polyline points="40,45 46,74 52,98 58,119 64,136 70,150 75,161 81,170 87,176 93,179 99,182 105,182 111,181 117,179 123,176 129,172 135,167 140,162 146,157 152,151 158,146 164,140 170,135 176,130 182,125 188,121 194,117 199,114 205,111 211,109 217,108 223,107 229,106 235,107 241,108 247,109 253,111 259,113 264,115 270,118 276,120 282,123 288,126 294,128 300,129 306,130 312,131 318,130 324,128 329,125 335,120 341,113 347,104 353,93 359,79 365,62 371,42 377,18" fill="none" class="sb" stroke-width="2.5"/>
    <circle cx="104" cy="182" r="5" class="fg sg"/><text x="70" y="202" class="tg">global min f=−3.51</text>
    <circle cx="310" cy="131" r="5" class="fr sr"/><text x="270" y="158" class="tr">local min f=−1.07</text>
    <circle cx="229" cy="106" r="4" fill="currentColor"/><text x="180" y="84" class="tm">flat top: ∇=0 too</text>
    <circle cx="44" cy="66" r="4" fill="currentColor"/><text x="52" y="56" font-size="11">start −2</text>
    <circle cx="257" cy="112" r="4" fill="currentColor"/><line x1="262" y1="116" x2="296" y2="126" stroke="currentColor" marker-end="url(#mop-ah2)"/><text x="196" y="142" font-size="11">start 0.5</text>
  </svg><figcaption>f(t) = t⁴ − 3t² + t. Gradient descent rolls into whichever valley it starts above.</figcaption></figure>
  <div class="fx" data-lang="py">f  = lambda t: t**4 - 3 * t**2 + t             # two valleys
df = lambda t: 4 * t**3 - 6 * t + 1
for t0 in [-2.0, 0.5, 2.0]:
    t = t0
    for _ in range(200):
        t -= 0.01 * df(t)
    print(f"start {t0:5}  -&gt;  t={t:.3f}  f={f(t):.3f}")
p = np.array([1.0, 1e-6])                      # saddle f = a^2 - b^2, start almost on the ridge
for step in range(1, 61):
    g = np.array([2 * p[0], -2 * p[1]])
    p = p - 0.1 * g
    if step in (10, 30, 60):
        print(f"step {step:2d}  |grad|={np.linalg.norm(g):.1e}  b={p[1]:.1e}")</div>
  <div class="fx" data-lang="text">start  -2.0  -&gt;  t=-1.301  f=-3.514
start   0.5  -&gt;  t=1.131  f=-1.070
start   2.0  -&gt;  t=1.131  f=-1.070
step 10  |grad|=2.7e-01  b=6.2e-06
step 30  |grad|=3.1e-03  b=2.4e-04
step 60  |grad|=9.4e-02  b=5.6e-02</div>
  <p>Starting at −2 reaches the deep valley; 0.5 and 2 get stuck in the shallow one. On the saddle, GD starting almost on the ridge sees the gradient shrink to 0.003 and stalls, then the tiny b-offset grows and it escapes. Mini-batch noise and momentum help it escape sooner.</p>
  <div class="cards">
    <div><b>Convex</b><p>One bowl: any local min is the global min.</p><small>Our houses; linear / logistic regression, ridge, SVM</small></div>
    <div><b>Non-convex</b><p>Many valleys, ridges and plateaus.</p><small>Neural networks, matrix factorisation, k-means</small></div>
    <div><b>Saddle point</b><p>∇ = 0 but downhill exists in some direction.</p><small>The common trap in high dimensions</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>L is <strong>convex</strong> if the straight line between any two points on its graph never goes below the graph; for smooth L, equivalently, the Hessian has no negative eigenvalues anywhere. Then every local minimum is global. A <strong>saddle point</strong> has ∇L = 0 with Hessian eigenvalues of both signs.</p>
  </div>
  <div class="callout intu"><span class="label">Why deep nets still train</span>
    <p>In millions of dimensions, bad local minima are rare. Most zero-gradient points are saddles, and most local minima have loss close to the global one. Nets are non-convex because of their nonlinearities and because swapping two hidden units gives the same function (many equally good minima).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: batch, SGD and mini-batch.</b> Every step so far used all three houses. With 10 million houses, one exact gradient means reading 10 million rows per step. Can a step use only a few?</div>

  <h2 id="mop-batch"><span class="num">05</span>Batch vs Stochastic vs Mini-batch</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The loss is an average over all rows, so its gradient is an average of per-row gradients. Computing all of them for one small step is wasteful when the data is huge. Is a partial average good enough?</p>
  </div>
  <p><strong>Plain words:</strong> the gradient from a random handful of rows (a <strong>mini-batch</strong>) is a noisy estimate of the full one, but it is cheap, so you can take many more steps. One row per step is <strong>stochastic gradient descent (SGD)</strong>; all rows is <strong>batch GD</strong>. An <strong>epoch</strong> is one full pass over the data.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Judging a restaurant. Batch: read all 1,000 reviews before deciding anything. Stochastic: read one review and immediately change your opinion. Mini-batch: read 32 at a time, a fair picture, updated often.</p>
  </div>
  <p><strong>Traced at w = 0:</strong> each house's own gradient is 2(w·x − y)·x: A → −4, B → −16, C → −36. Their average, −18.67, is the full-batch gradient. Any single house points the right way but with the wrong size. One shuffled SGD epoch with lr = 0.05 takes three steps, one per house:</p>
  <div class="fx" data-lang="py">per_house = 2 * (0.0 * x - y) * x              # gradient from each house alone, at w = 0
print(per_house, per_house.mean())             # full-batch gradient = their average
rng = np.random.default_rng(0)
w = 0.0
for i in rng.permutation(3):                   # one SGD epoch: one house per step, shuffled
    g = 2 * (w * x[i] - y[i]) * x[i]
    w -= 0.05 * g
    print(f"house {'ABC'[i]}  grad {g:7.2f}  -&gt;  w {w:.3f}")</div>
  <div class="fx" data-lang="text">[ -4. -16. -36.] -18.666666666666668
house C  grad  -36.00  -&gt;  w 1.800
house A  grad   -0.40  -&gt;  w 1.820
house B  grad   -1.44  -&gt;  w 1.892</div>
  <p>What the code does: <code>per_house</code> holds the three single-row gradients; their mean is the batch gradient. The loop visits the houses in shuffled order (C, A, B) and steps after each one: after one epoch w = 1.892, three updates instead of one. The same idea at scale, 1000 rows, 5 epochs:</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(42)
xb = rng.uniform(0, 2, 1000)
yb = 4 + 3 * xb + rng.normal(0, 0.5, 1000)
def train(batch, lr=0.05, epochs=5):
    w = b = 0.0; updates = 0
    for _ in range(epochs):
        idx = rng.permutation(len(xb))               # shuffle every epoch
        for s in range(0, len(xb), batch):
            i = idx[s:s + batch]
            err = w * xb[i] + b - yb[i]
            w -= lr * 2 * np.mean(err * xb[i]); b -= lr * 2 * np.mean(err)
            updates += 1
    return updates, np.mean((w * xb + b - yb) ** 2)
for name, bs in [("batch", 1000), ("mini-batch", 32), ("stochastic", 1)]:
    u, L = train(bs)
    print(f"{name:&lt;11} batch={bs:&lt;5} updates={u:&lt;5} loss={L:.3f}")</div>
  <div class="fx" data-lang="text">batch       batch=1000  updates=5     loss=4.817
mini-batch  batch=32    updates=160   loss=0.260
stochastic  batch=1     updates=5000  loss=0.299</div>
  <p>Full batch made only 5 steps and is far from done (loss 4.8). SGD made 5000 but its noise keeps it bouncing above the floor (0.299 vs 0.25). Mini-batch gets both: many steps, little noise, 0.26.</p>
  <table class="tbl">
    <tr><th></th><th>Batch GD</th><th>Stochastic (SGD)</th><th>Mini-batch</th></tr>
    <tr><td>Examples per step</td><td>All n</td><td>1</td><td>32–1024</td></tr>
    <tr><td>Gradient</td><td>Exact, smooth</td><td>Very noisy</td><td>Slightly noisy</td></tr>
    <tr><td>Updates per epoch</td><td>1</td><td>n</td><td>n / batch</td></tr>
    <tr><td>Hardware</td><td>Must fit in memory</td><td>Can't use GPU parallelism</td><td>Fills the GPU well</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>Mini-batch SGD: at step t pick a random batch B of size b, compute g_t = (1/b) Σ_{i∈B} ∇ℓᵢ(w_t) (ℓᵢ = loss of row i), update w_{t+1} = w_t − lr·g_t. g_t is an <strong>unbiased</strong> estimate of the full gradient: right on average, noisy each time; bigger b = less noise.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"SGD" in PyTorch (<code>torch.optim.SGD</code>) means the update rule, not batch size 1; you feed it mini-batches. And shuffle every epoch: rows in a fixed order (all cheap houses first) give biased, cyclic steps.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: momentum, RMSProp and Adam.</b> Each step now is cheap, but plain steps still zig-zag across our narrow valley (section 02) and noise makes it worse. Can a step remember where it was going, and can each weight get its own step size?</div>

  <h2 id="mop-adam"><span class="num">06</span>Momentum, RMSProp, Adam</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Plain GD has two weaknesses. In a narrow valley it bounces from wall to wall instead of running along the floor. And it uses one step size for every weight, even when one direction is steep and another flat. Can smarter steps fix both?</p>
  </div>
  <p><strong>Plain words:</strong> <strong>Momentum</strong> keeps a running total of past gradients and steps along that, so back-and-forth parts cancel and consistent parts build speed. <strong>RMSProp</strong> divides each weight's step by the typical size of its recent gradients, so every weight moves at a similar pace. <strong>Adam</strong> does both, with a correction for the first steps.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A heavy ball rolling down a gully keeps its speed along the floor and barely notices the walls; a ping-pong ball (plain GD) bounces off every wall. RMSProp is a hiker who shortens their stride on steep ground and lengthens it on flat ground.</p>
  </div>
  <p><strong>Traced by hand</strong>, momentum with β = 0.9 on two gradient sequences:</p>
  <div class="fx" data-lang="py">for g in ([1, -1, 1, -1, 1, -1], [1, 1, 1, 1, 1, 1]):   # zig-zag vs consistent gradients
    v = 0
    for gi in g:
        v = 0.9 * v + gi
        print(round(v, 3), end=" ")
    print()</div>
  <div class="fx" data-lang="text">1.0 -0.1 0.91 -0.181 0.837 -0.247 
1.0 1.9 2.71 3.439 4.095 4.686</div>
  <p>Gradients that flip sign (a zig-zag) mostly cancel: v stays small. Gradients that agree add up: 1 → 1.9 → 2.71 → …, heading for 10.</p>
  <p><strong>On the houses</strong> (two weights, start (0, 0), stop when the loss is below 1e-6):</p>
  <div class="fx" data-lang="py">def run(update, steps=2000):
    p, state = np.array([0.0, 0.0]), {}
    for t in range(1, steps + 1):
        p = update(p, grad2(p), state, t)
        if L2(p) &lt; 1e-6:
            return t
    return f"not done, loss={L2(p):.2g}"
def gd(p, g, s, t, lr=0.1):
    return p - lr * g
def momentum(p, g, s, t, lr=0.1, beta=0.7):
    s["v"] = beta * s.get("v", 0) + g
    return p - lr * s["v"]
def rmsprop(p, g, s, t, lr=0.05, beta=0.9, eps=1e-8):
    s["s"] = beta * s.get("s", 0) + (1 - beta) * g**2
    return p - lr * g / (np.sqrt(s["s"]) + eps)
def adam(p, g, s, t, lr=0.3, b1=0.9, b2=0.999, eps=1e-8):
    s["m"] = b1 * s.get("m", 0) + (1 - b1) * g
    s["v"] = b2 * s.get("v", 0) + (1 - b2) * g**2
    m_hat, v_hat = s["m"] / (1 - b1**t), s["v"] / (1 - b2**t)
    return p - lr * m_hat / (np.sqrt(v_hat) + eps)
for name, u in [("GD", gd), ("Momentum", momentum), ("RMSProp", rmsprop), ("Adam", adam)]:
    print(f"{name:&lt;9} steps to loss&lt;1e-6: {run(u)}")
p0 = np.array([0.0, 0.0])
for name, u in [("GD", gd), ("RMSProp", rmsprop), ("Adam", adam)]:
    print(f"{name:&lt;8} first step: {np.round(u(p0, grad2(p0), {}, 1) - p0, 3)}")</div>
  <div class="fx" data-lang="text">GD        steps to loss&lt;1e-6: 98
Momentum  steps to loss&lt;1e-6: 39
RMSProp   steps to loss&lt;1e-6: not done, loss=0.011
Adam      steps to loss&lt;1e-6: 123
GD       first step: [1.867 1.733]
RMSProp  first step: [0.158 0.158]
Adam     first step: [0.3 0.3]</div>
  <p>What the code does: each optimizer is a small function that takes the current point, gradient, a dictionary of remembered state and the step count. Momentum (lr 0.1, β 0.7) cuts GD's 98 steps to 39: the bounces across the valley cancel. Adam needs 123 and RMSProp stalls near the bottom. Why? Our valley is stretched along the <em>diagonal</em> (1, 1); both weights see similar gradient sizes (first step: GD moves both ≈ 1.8; Adam moves both exactly lr = 0.3), so per-weight scaling has nothing to fix, and normalised steps rattle around the bottom.</p>
  <p>When the stretch is along an <em>axis</em> (one weight 50× steeper than the other), per-weight scaling is exactly the right fix:</p>
  <div class="fx" data-lang="py"># a valley stretched along an AXIS: weight 2 is 50x steeper than weight 1
grad_ax = lambda p: np.array([p[0], 50 * p[1]])
f_ax    = lambda p: 0.5 * (p[0]**2 + 50 * p[1]**2)
def run_ax(update, steps=500):
    p, state = np.array([10.0, 1.0]), {}
    for t in range(1, steps + 1):
        p = update(p, grad_ax(p), state, t)
        if f_ax(p) &lt; 1e-6:
            return t
    return f"not done, f={f_ax(p):.2g}"
for name, u in [("GD", lambda p, g, s, t: gd(p, g, s, t, lr=0.035)),
                ("Momentum", lambda p, g, s, t: momentum(p, g, s, t, lr=0.035, beta=0.9)),
                ("RMSProp", lambda p, g, s, t: rmsprop(p, g, s, t, lr=0.1)),
                ("Adam", lambda p, g, s, t: adam(p, g, s, t, lr=0.5))]:
    print(f"{name:&lt;9} steps to f&lt;1e-6: {run_ax(u)}")</div>
  <div class="fx" data-lang="text">GD        steps to f&lt;1e-6: 249
Momentum  steps to f&lt;1e-6: 146
RMSProp   steps to f&lt;1e-6: not done, f=0.064
Adam      steps to f&lt;1e-6: 151</div>
  <p>Here Adam (151) matches momentum (146) and both beat GD (249). RMSProp stalls again: its step stays ≈ lr even near the minimum, so it needs a decaying lr (section 07); Adam's momentum smooths this out.</p>
  <table class="tbl">
    <tr><th>Optimizer</th><th>Update (one line)</th><th>Intuition</th></tr>
    <tr><td>GD</td><td>w −= lr·g</td><td>Step along the slope</td></tr>
    <tr><td>Momentum</td><td>v = βv + g; w −= lr·v</td><td>Heavy ball: zig-zags cancel, consistent directions build speed</td></tr>
    <tr><td>RMSProp</td><td>s = βs + (1−β)g²; w −= lr·g/(√s + ε)</td><td>Per-weight step size: divide by recent gradient size</td></tr>
    <tr><td>Adam</td><td>m = β₁m + (1−β₁)g; v = β₂v + (1−β₂)g²; w −= lr·m̂/(√v̂ + ε)</td><td>Momentum + RMSProp + bias correction (m̂ = m/(1−β₁ᵗ))</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>Symbols: <code>g</code> = current gradient, <code>β</code> = fade factor (how much of the past to keep), <code>ε</code> = tiny number so we never divide by zero, <code>t</code> = step count. <strong>Bias correction</strong>: m and v start at 0, so their early averages are too small; dividing by (1 − βᵗ) scales them up in the first steps.</p>
  </div>
  <div class="callout trap"><span class="label">Defaults that work</span>
    <p>Adam / AdamW with lr = 1e-3 (3e-4 for transformers), β₁ = 0.9, β₂ = 0.999. SGD + momentum 0.9 often generalises slightly better for CNNs but needs more lr tuning. As our houses show, "Adam is always faster" is false: on a small, well-scaled convex problem plain momentum can win.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: learning-rate schedules.</b> Every optimizer still has one fixed lr. Section 03 showed that a big lr is fast but rattles near the bottom (RMSProp just stalled), and a small lr is precise but slow. Can we have both?</div>

  <h2 id="mop-sched"><span class="num">07</span>Learning-Rate Schedules</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A fixed lr is a compromise: fast far from the bottom or precise near it, not both. Can the step size change as training goes on?</p>
  </div>
  <p><strong>Plain words:</strong> a <strong>schedule</strong> is a rule for "lr at step t": big steps early to cover ground, small steps late to settle into the bottom.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Parking a car. Drive fast on the open road, slow down as you enter the lane, inch in the last metre. Nobody parks at highway speed.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 400 190" width="400">
    <line x1="40" y1="150" x2="350" y2="150" stroke="currentColor" opacity="0.4"/><line x1="40" y1="150" x2="40" y2="20" stroke="currentColor" opacity="0.4"/>
    <polyline points="40,30 130,30 130,90 220,90 220,120 310,120 310,135 340,135" fill="none" class="sb" stroke-width="2"/>
    <polyline points="40,150 55,90 70,30 85,31 100,34 115,38 130,44 145,51 160,60 175,69 190,80 205,90 220,100 235,111 250,120 265,129 280,136 295,142 310,146 325,149 340,150" fill="none" class="sr" stroke-width="2.5"/>
    <text x="140" y="26" class="tb">step decay (×0.5 every 30)</text>
    <text x="200" y="70" class="tr">warmup + cosine</text>
    <text x="160" y="175" class="tm">epoch 0 → 100</text><text x="4" y="24" class="tm">lr</text>
  </svg><figcaption>Blue: halve the lr every 30 epochs. Red: ramp up for 10 epochs (warmup), then glide down smoothly to 0 (cosine).</figcaption></figure>
  <div class="fx" data-lang="py">base, T, warm = 0.1, 100, 10
def step_decay(t):  return base * 0.5 ** (t // 30)
def exp_decay(t):   return base * 0.97 ** t
def cosine(t):      return 0.5 * base * (1 + np.cos(np.pi * t / T))
def warm_cos(t):    return base * t / warm if t &lt; warm else 0.5 * base * (1 + np.cos(np.pi * (t - warm) / (T - warm)))
print("t     step    exp     cosine  warmup+cos")
for t in [0, 5, 10, 30, 50, 90, 100]:
    print(f"{t:&lt;5} {step_decay(t):.4f}  {exp_decay(t):.4f}  {cosine(t):.4f}  {warm_cos(t):.4f}")</div>
  <div class="fx" data-lang="text">t     step    exp     cosine  warmup+cos
0     0.1000  0.1000  0.1000  0.0000
5     0.1000  0.0859  0.0994  0.0500
10    0.1000  0.0737  0.0976  0.1000
30    0.0500  0.0401  0.0794  0.0883
50    0.0500  0.0218  0.0500  0.0587
90    0.0125  0.0064  0.0024  0.0030
100   0.0125  0.0048  0.0000  0.0000</div>
  <p><strong>Traced on the houses:</strong> section 03's sweep is a schedule in disguise. lr = 0.2 (just under the limit 0.214) moves fast but was still oscillating at 1.886 after 20 steps; dropping to 0.1 for the last steps would settle it at 2. A schedule automates that drop.</p>
  <ul>
    <li><strong>Step decay</strong>: × 0.5 every 30 epochs. <strong>Exponential</strong>: × 0.97 every epoch. <strong>Cosine</strong>: half a cosine wave from base down to 0.</li>
    <li><strong>Warmup</strong>: start near 0 and ramp up. Adam's early variance estimates rest on very few samples, so full-size first steps can be wild. Standard for transformers.</li>
    <li><strong>ReduceLROnPlateau</strong>: cut lr by 10× when validation loss stops improving. A safe default.</li>
  </ul>
  <div class="callout def"><span class="label">Definition</span>
    <p>Cosine schedule: lr(t) = ½·base·(1 + cos(πt/T)), T = total steps. Linear warmup: lr(t) = base·t/warm for t &lt; warm. Step decay: base·γ^⌊t/k⌋ (γ = 0.5, k = 30 above).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A schedule tuned for 100 epochs is wrong for 300: cosine reaches 0 at T, so changing the run length without changing T either stops learning early or never decays. Tie the schedule to the actual number of steps.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: feature scaling.</b> Momentum, Adam and schedules all work <em>around</em> a narrow valley. Why is the valley narrow in the first place, and can we make it round instead?</div>

  <h2 id="mop-scale"><span class="num">08</span>Why Feature Scaling Speeds Up GD</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The valley's shape comes from the data: its curvatures are the eigenvalues of (2/n)XᵀX. Change the units of a column and the valley changes. Can we choose units that make it round?</p>
  </div>
  <p><strong>Plain words:</strong> a feature with big numbers makes its weight's direction very steep. One lr must then be tiny for that direction and crawls along the others. <strong>Standardising</strong> each column (subtract its mean, divide by its standard deviation) gives every column the same spread, and the bowl becomes nearly round.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two dials on an amplifier: one changes the volume a lot per millimetre, the other barely at all. Turning both by "the same amount" is useless. Re-label the dials so a millimetre means the same on both.</p>
  </div>
  <p><strong>Traced on the houses:</strong> with size in thousands of sq ft, the curvatures are 18 and 0.667 (condition number 27, lr limit 0.111). Write size in plain sq ft (1000, 2000, 3000) and the size column's squares grow a million-fold: curvatures ≈ 9.3 million and 1.29, condition 7.3 million, and the safe lr drops to 2e-7, at which the rooms weight would take millions of steps to move.</p>
  <div class="fx" data-lang="py">Xft = X * np.array([1000., 1.])                # size in plain sq ft
for name, A in [("thousands", X), ("plain sq ft", Xft)]:
    Hh = 2 * A.T @ A / len(y)
    ev = np.linalg.eigvalsh(Hh)
    print(f"{name:12s} curvatures {ev}  condition {ev[-1] / ev[0]:.3g}  lr limit {2 / ev[-1]:.3g}")
Xs = (X - X.mean(0)) / X.std(0)                # standardised (centred, so add an intercept)
Xsb = np.column_stack([np.ones(3), Xs])
print("standardised condition", round(np.linalg.cond(Xsb.T @ Xsb), 2))</div>
  <div class="fx" data-lang="text">thousands    curvatures [ 0.667 18.   ]  condition 27  lr limit 0.111
plain sq ft  curvatures [      1.286 9333341.381]  condition 7.26e+06  lr limit 2.14e-07
standardised condition 3.0</div>
  <p>What the code does: builds the Hessian (2/n)AᵀA for each unit choice and reports its eigenvalues, their ratio and the largest safe lr. Standardising (with an intercept column, since centred features need one) gives condition number 3. The same idea at scale, 200 houses with area 500–3000 sq ft and 1–5 rooms:</p>
  <figure class="viz"><svg viewBox="0 0 540 175" width="540">
    <ellipse cx="140" cy="80" rx="125" ry="22" fill="none" stroke="currentColor" opacity="0.35"/><ellipse cx="140" cy="80" rx="70" ry="12" fill="none" stroke="currentColor" opacity="0.5"/>
    <polyline points="30,62 42,98 58,64 74,96 92,66 108,92 122,70 132,86 140,80" fill="none" class="sr" stroke-width="2"/>
    <text x="40" y="140" class="tr">unscaled: narrow valley, zig-zag</text>
    <circle cx="390" cy="80" r="62" fill="none" stroke="currentColor" opacity="0.35"/><circle cx="390" cy="80" r="32" fill="none" stroke="currentColor" opacity="0.5"/>
    <line x1="345" y1="40" x2="390" y2="80" class="sg" stroke-width="2.5"/><circle cx="390" cy="80" r="3" fill="currentColor"/>
    <text x="290" y="165" class="tg">scaled: round bowl, straight in</text>
  </svg><figcaption>Unscaled features stretch the loss bowl. The gradient points across the valley, not along it, so GD bounces between the walls.</figcaption></figure>
  <div class="fx" data-lang="py">np.seterr(all="ignore")                       # hide overflow warnings
rng = np.random.default_rng(0)
n = 200
area  = rng.uniform(500, 3000, n)              # sq ft: range ~2500
rooms = rng.integers(1, 6, n).astype(float)    # range ~4
yh = 0.1 * area + 20 * rooms + rng.normal(0, 10, n)
Xh = np.column_stack([area, rooms])
def gd_fit(A, t, lr, steps=5000):
    Ab = np.column_stack([np.ones(len(A)), A])
    w = np.zeros(Ab.shape[1])
    best = np.mean((Ab @ np.linalg.lstsq(Ab, t, rcond=None)[0] - t) ** 2)
    for k in range(1, steps + 1):
        w -= lr * 2 * Ab.T @ (Ab @ w - t) / len(t)
        L = np.mean((Ab @ w - t) ** 2)
        if not np.isfinite(L): return "diverged"
        if L &lt; best * 1.01: return k
    return f"not done after {steps}, loss {L:.0f} vs best {best:.0f}"
Xhs = (Xh - Xh.mean(0)) / Xh.std(0)            # standardise
print("raw   lr=1e-7:", gd_fit(Xh, yh, 1e-7))
print("raw   lr=1e-6:", gd_fit(Xh, yh, 1e-6))
print("scaled lr=0.1:", gd_fit(Xhs, yh, 0.1))</div>
  <div class="fx" data-lang="text">raw   lr=1e-7: not done after 5000, loss 1248 vs best 98
raw   lr=1e-6: diverged
scaled lr=0.1: 25</div>
  <p>Raw: lr = 1e-7 is still not done after 5000 steps, and lr = 1e-6 already explodes on the area direction. Scaled: done in 25 steps with lr = 0.1.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>Standardise column j: x′ = (x − meanⱼ) / stdⱼ. <strong>Condition number</strong> of the Hessian = λ_max / λ_min (1 = perfectly round). GD needs roughly condition-number many steps to converge, so scaling attacks the cause, while momentum and Adam treat the symptom.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Fit the scaler on the training set only, then apply it to validation and test; fitting on all data leaks test statistics into training. Tree models don't need scaling (they split on thresholds, and "area &gt; 1200" works at any scale); GD-trained and distance-based models do.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: regularization.</b> Scaling fixes different units. It cannot fix two features that carry the same information (size in two units, or near-copies): the valley floor becomes almost perfectly flat in one direction and the weights can wander to huge values that cancel. Can we change the objective to prefer small, sensible weights?</div>

  <h2 id="mop-reg"><span class="num">09</span>Regularization as Part of the Objective</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>When a direction of the valley is flat, many weight settings fit the training data equally well, including absurd ones with huge opposite weights that break on new data. The loss can't tell them apart. How do we tell the optimizer which of them we prefer?</p>
  </div>
  <p><strong>Plain words:</strong> add a penalty for big weights to the loss. The optimizer then balances "fit the data" against "keep weights small". The penalty is just another term, so gradient descent handles it automatically.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A travel budget. Without one, two employees can make wild expenses that cancel out on paper. A rule "every rupee spent costs you a little" makes everyone choose modest, sensible spending, even if the totals still balance.</p>
  </div>
  <div class="flow"><span>Objective</span><span>= data loss</span><span>+ λ · ‖w‖²</span><span>gradient gains + 2λw</span><span>w shrinks every step</span></div>
  <p><strong>Traced by hand:</strong> with lr = 0.1, λ = 0.05 and no data gradient, each step multiplies w by (1 − 2·lr·λ) = 0.99: a weight of 10 shrinks 9.9, 9.801, 9.703 … That is why L2 regularization is called <strong>weight decay</strong>. On the houses, ridge minimises the sum of squared errors plus the penalty, Σ(Xw − y)² + λ‖w‖², whose minimum solves (XᵀX + λI)w = Xᵀy (see <a class="xref" data-note="m_linalg">Linear Algebra</a>, section 06):</p>
  <div class="fx" data-lang="py">w = 10.0
for _ in range(5):
    w = (1 - 2 * 0.1 * 0.05) * w               # lr = 0.1, lambda = 0.05, no data gradient
    print(round(w, 3), end=" ")
print()
for lam in [0, 0.1, 1, 10]:                    # ridge on the houses: (X^T X + lam I) w = X^T y
    wr = np.linalg.solve(X.T @ X + lam * np.eye(2), X.T @ y)
    print(f"lambda={lam:&lt;4} w={np.round(wr, 3)}  train loss={L2(wr):.3f}")</div>
  <div class="fx" data-lang="text">9.9 9.801 9.703 9.606 9.51 
lambda=0    w=[2. 0.]  train loss=0.000
lambda=0.1  w=[1.905 0.087]  train loss=0.006
lambda=1    w=[1.464 0.464]  train loss=0.190
lambda=10   w=[0.821 0.639]  train loss=1.866</div>
  <p>What the code does: the loop shows the decay factor; the ridge loop solves the penalised normal equations for growing λ. λ = 0 gives (2, 0) with training loss 0. As λ grows, the size weight shrinks and some credit moves to rooms (they overlap), and the training loss rises: λ = 1 gives (1.46, 0.46), loss 0.19. Regularization deliberately accepts a worse fit on training data in exchange for smaller, more stable weights.</p>
  <p>Where it really matters: two features that are near-copies (x2 ≈ x1), the flat-floor case.</p>
  <div class="fx" data-lang="py">from sklearn.linear_model import LinearRegression, Ridge
rng = np.random.default_rng(1)
x1 = rng.normal(size=30)
x2 = x1 + rng.normal(0, 0.01, 30)        # near-copy of x1
Xc = np.column_stack([x1, x2])
yc = 2 * x1 + rng.normal(0, 0.5, 30)
print("OLS  ", np.round(LinearRegression().fit(Xc, yc).coef_, 2))
for a in [0.1, 1, 10]:
    print(f"Ridge a={a:&lt;4}", np.round(Ridge(alpha=a).fit(Xc, yc).coef_, 2))</div>
  <div class="fx" data-lang="text">OLS   [ 19.06 -17.19]
Ridge a=0.1  [1.16 0.73]
Ridge a=1    [0.95 0.9 ]
Ridge a=10   [0.76 0.76]</div>
  <p>Without a penalty (OLS = ordinary least squares), the near-copies get huge opposite weights (+19, −17) that cancel on training data and break on new data. Ridge (L2) splits the true effect (≈ 2) between them.</p>
  <table class="tbl">
    <tr><th>Penalty</th><th>Term</th><th>Effect</th></tr>
    <tr><td>L2 (ridge)</td><td>λΣw²</td><td>Shrinks all weights smoothly; adds λ to every curvature, so the bowl is rounder and never flat</td></tr>
    <tr><td>L1 (lasso)</td><td>λΣ|w|</td><td>Drives some weights to exactly 0 (feature selection)</td></tr>
    <tr><td>Elastic net</td><td>both</td><td>Sparse but stable with correlated features</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>Regularized objective: J(w) = L(w) + λ·R(w), with R(w) = ‖w‖² (L2) or ‖w‖₁ (L1); λ ≥ 0 sets the strength. For L2, ∇J = ∇L + 2λw and the update is w ← (1 − 2·lr·λ)w − lr·∇L. For linear regression with squared error Σ(Xw − y)² + λ‖w‖², the minimum solves (XᵀX + λI)w = Xᵀy.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>With Adam, adding λ‖w‖² to the loss is <em>not</em> the same as weight decay: the 2λw gets divided by √v like everything else, so weights with large gradients are barely regularised. AdamW decays weights directly, which is why AdamW is the default.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: constraints and Lagrange multipliers.</b> A penalty is a soft preference: big weights are discouraged but allowed. Sometimes a rule must hold exactly: weights that sum to 1 (portfolio shares, mixture weights), a budget, or an SVM's "every point on the right side of the margin". How do we minimise under a hard rule?</div>

  <h2 id="mop-lagr"><span class="num">10</span>Constraints &amp; Lagrange Multipliers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Gradient descent finds the bottom of the whole landscape. With a hard rule, only the points on a line (or surface) are allowed, and the best allowed point is usually <em>not</em> where the gradient is zero. What condition marks it instead?</p>
  </div>
  <p><strong>Plain words:</strong> walk along the allowed line. At the best allowed point, moving along the line can't lower the loss any more, so the loss's gradient has no component along the line: it points straight across it, parallel to the rule's own gradient. "Parallel" means one is a multiple of the other; that multiple is the <strong>Lagrange multiplier</strong> λ. It also measures how much the loss would improve if the rule were loosened a little: a "shadow price".</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A hiker who must stay on a trail around a valley. The lowest point of the trail is where the trail runs level, i.e. exactly along a contour line. There, "straight downhill" points directly off the trail, at right angles to it.</p>
  </div>
  <p><strong>Traced on the houses.</strong> Suppose a rule says the two weights must add up to 1: w₁ + w₂ = 1. The unconstrained best (2, 0) adds up to 2, so it is not allowed.</p>
  <ol>
    <li><strong>Gradient of the loss</strong> (Calculus, section 03): ∇L = (2/3)·(14w₁ + 13w₂ − 28, 13w₁ + 14w₂ − 26). <strong>Gradient of the rule</strong> g(w) = w₁ + w₂: (1, 1).</li>
    <li><strong>Parallel condition</strong> ∇L = λ·(1, 1): both components of ∇L are equal: 14w₁ + 13w₂ − 28 = 13w₁ + 14w₂ − 26 → w₁ − w₂ = 2.</li>
    <li><strong>With the rule</strong> w₁ + w₂ = 1: w₁ = <strong>1.5</strong>, w₂ = <strong>−0.5</strong>.</li>
    <li><strong>Multiplier</strong>: (2/3)(14×1.5 + 13×(−0.5) − 28) = (2/3)(−13.5) = <strong>λ = −9</strong>. Loss there: predictions 1, 1.5, 3.5, errors −1, −2.5, −2.5, loss (1 + 6.25 + 6.25)/3 = <strong>4.5</strong>.</li>
    <li><strong>Shadow price</strong>: allowing w₁ + w₂ = 1.01 should change the loss by about λ × 0.01 = −0.09: loosening the rule toward the free optimum (sum 2) helps by about 9 per unit.</li>
  </ol>
  <div class="fx" data-lang="py">Hm = 2 * X.T @ X / len(y); bm = 2 * X.T @ y / len(y)   # grad2(w) = Hm w - bm
a = np.array([1., 1.])                                  # constraint: w1 + w2 = c
def constrained(c):        # solve  grad2(w) = lam * a  and  a.w = c  (3 equations, 3 unknowns)
    K = np.block([[Hm, -a[:, None]], [a[None, :], np.zeros((1, 1))]])
    sol = np.linalg.solve(K, np.concatenate([bm, [c]]))
    return sol[:2], sol[2]
w_c, lam = constrained(1.0)
print(w_c, round(lam, 3), round(L2(w_c), 4), grad2(w_c))
w_c2, _ = constrained(1.01)                             # loosen the rule a little
print(round((L2(w_c2) - L2(w_c)) / 0.01, 3))            # loss change per unit of c ~ lam
from scipy.optimize import minimize
r = minimize(L2, x0=[0., 0.], constraints=[{"type": "eq", "fun": lambda w: w[0] + w[1] - 1}])
print(np.round(r.x, 4), round(r.fun, 4))</div>
  <div class="fx" data-lang="text">[ 1.5 -0.5] -9.0 4.5 [-9. -9.]
-8.955
[ 1.5 -0.5] 4.5</div>
  <p>What the code does: <code>constrained(c)</code> solves the three linear equations "∇L = λ·a" and "a·w = c" together (a 3 × 3 system, because our loss is quadratic). It returns (1.5, −0.5), λ = −9, loss 4.5, and ∇L = (−9, −9), visibly parallel to (1, 1). Loosening c by 0.01 changes the loss at a rate −8.96 ≈ λ. scipy's general constrained solver (<code>minimize</code> with an equality constraint) finds the same point.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>Minimise L(w) subject to g(w) = c. Form the <strong>Lagrangian</strong> ℒ(w, λ) = L(w) − λ(g(w) − c) and set all its partials to zero: ∇L(w) = λ∇g(w) and g(w) = c. λ is the multiplier; at the optimum, d(min loss)/dc = λ. Inequality rules (g(w) ≤ c) give the <strong>KKT conditions</strong>: same idea, plus λ ≥ 0-type signs and "λ = 0 unless the rule is tight".</p>
  </div>
  <ul>
    <li><strong>Ridge as a constraint:</strong> "minimise L subject to ‖w‖² ≤ t" has the same solutions as "minimise L + λ‖w‖²" for a matching λ: the penalty strength of section 09 <em>is</em> a Lagrange multiplier. L1's constraint region is a diamond with corners on the axes, which is why lasso lands on exact zeros.</li>
    <li><strong>SVMs</strong> (see <a class="xref" data-note="ml_svm">Support Vector Machines</a>): "widest margin subject to every point on the correct side" is solved through its Lagrangian; the points with non-zero multipliers are the <strong>support vectors</strong>.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Do not just run gradient descent and "fix up" the weights afterwards (e.g. rescale them to sum to 1): that gives (1, 0) here, loss 4.67, worse than the true constrained best 4.5. Either solve the Lagrange conditions, use a constrained solver, or project back onto the rule after every step (projected gradient descent).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: how it all connects.</b> We have ten ideas for one loss. How do they fit together, and which do you reach for when?</div>

  <h2 id="mop-connect"><span class="num">11</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Landscape, GD, learning rate, convexity, SGD, momentum, Adam, schedules, scaling, regularization, constraints: a bag of tricks, or answers to a few underlying questions?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 720 300" width="720">
<defs><marker id="mop-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="130" height="46" rx="7" class="fb sb"/><text x="75" y="39" text-anchor="middle" font-size="11.5" font-weight="700">landscape L(w)</text><text x="75" y="56" text-anchor="middle" class="tm" font-size="10">bowl, min (2, 0)</text>
<line x1="140" y1="43" x2="158" y2="43" stroke="currentColor" marker-end="url(#mop-a9)"/>
<rect x="160" y="20" width="130" height="46" rx="7" class="fb sb"/><text x="225" y="39" text-anchor="middle" font-size="11.5" font-weight="700">gradient descent</text><text x="225" y="56" text-anchor="middle" class="tm" font-size="10">0 → 1.867 → 2</text>
<line x1="290" y1="43" x2="308" y2="43" stroke="currentColor" marker-end="url(#mop-a9)"/>
<rect x="310" y="20" width="130" height="46" rx="7" class="fb sb"/><text x="375" y="39" text-anchor="middle" font-size="11.5" font-weight="700">learning rate</text><text x="375" y="56" text-anchor="middle" class="tm" font-size="10">&lt; 2/curv = 0.214</text>
<line x1="440" y1="43" x2="458" y2="43" stroke="currentColor" marker-end="url(#mop-a9)"/>
<rect x="460" y="20" width="120" height="46" rx="7" class="fb sb"/><text x="520" y="39" text-anchor="middle" font-size="11.5" font-weight="700">schedules</text><text x="520" y="56" text-anchor="middle" class="tm" font-size="10">lr changes with t</text>
<text x="10" y="92" font-size="11" class="tr" font-weight="700">WHERE does it end?</text>
<rect x="10" y="100" width="130" height="46" rx="7" class="fr sr"/><text x="75" y="119" text-anchor="middle" font-size="11.5" font-weight="700">convexity</text><text x="75" y="136" text-anchor="middle" class="tm" font-size="10">eig 18, 0.67 &gt; 0</text>
<text x="160" y="92" font-size="11" class="tg" font-weight="700">HOW MUCH data per step?</text>
<rect x="160" y="100" width="130" height="46" rx="7" class="fg sg"/><text x="225" y="119" text-anchor="middle" font-size="11.5" font-weight="700">SGD / mini-batch</text><text x="225" y="136" text-anchor="middle" class="tm" font-size="10">−4, −16, −36 → −18.67</text>
<text x="310" y="92" font-size="11" class="tb" font-weight="700">the narrow valley (27 : 1)</text>
<rect x="310" y="100" width="130" height="46" rx="7" class="ft st"/><text x="375" y="119" text-anchor="middle" font-size="11.5" font-weight="700">momentum / Adam</text><text x="375" y="136" text-anchor="middle" class="tm" font-size="10">98 → 39 steps</text>
<line x1="375" y1="146" x2="375" y2="172" stroke="currentColor" marker-end="url(#mop-a9)"/>
<rect x="310" y="174" width="130" height="46" rx="7" class="ft st"/><text x="375" y="193" text-anchor="middle" font-size="11.5" font-weight="700">feature scaling</text><text x="375" y="210" text-anchor="middle" class="tm" font-size="10">cond 7e6 → 3</text>
<line x1="440" y1="197" x2="458" y2="197" stroke="currentColor" marker-end="url(#mop-a9)"/>
<text x="460" y="92" font-size="11" class="tm" font-weight="700">WHAT do we minimise?</text>
<rect x="460" y="174" width="120" height="46" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="520" y="193" text-anchor="middle" font-size="11.5" font-weight="700">regularization</text><text x="520" y="210" text-anchor="middle" class="tm" font-size="10">λ=1: (1.46, 0.46)</text>
<line x1="580" y1="197" x2="598" y2="197" stroke="currentColor" marker-end="url(#mop-a9)"/>
<rect x="600" y="174" width="112" height="46" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="656" y="193" text-anchor="middle" font-size="11" font-weight="700">constraints</text><text x="656" y="210" text-anchor="middle" class="tm" font-size="10">(1.5, −0.5), λ = −9</text>
<line x1="520" y1="146" x2="520" y2="172" stroke="currentColor" stroke-dasharray="4 3"/>
<rect x="460" y="100" width="120" height="46" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="520" y="119" text-anchor="middle" font-size="11.5" font-weight="700">loss choice</text><text x="520" y="136" text-anchor="middle" class="tm" font-size="10">MSE, CE, hinge</text>
<text x="10" y="262" font-size="11" class="tm">Top row: how big a step. Middle row: four separate questions.</text>
<text x="10" y="280" font-size="11" class="tm">The valley's shape (Hessian eigenvalues from Linear Algebra and Calculus) drives lr limits, momentum, Adam and scaling.</text>
</svg><figcaption>Every idea answers one of four questions: how big a step (lr, schedules), where we end up (convexity), how much data per step (SGD), what exactly we minimise (loss, regularization, constraints). The narrow-valley problem has three answers: smarter steps (momentum, Adam), a better-shaped landscape (scaling) and a rounder objective (L2).</figcaption></figure>
  <table class="tbl"><caption>Every concept on the same three houses</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>On the running example</th><th>Use when</th></tr>
    <tr><td>Loss landscape</td><td>loss as a function of weights</td><td>what are we searching?</td><td>L = 18.67, 4.67, 0 at w = 0, 1, 2; 2-D valley to (2, 0)</td><td>always: pick a loss that matches the task</td></tr>
    <tr><td>Gradient descent</td><td>gradient (Calculus)</td><td>how do we walk downhill?</td><td>0 → 1.867 → 1.991 → 2; 2-D in ~100 steps</td><td>any differentiable loss</td></tr>
    <tr><td>Learning rate</td><td>curvature (Hessian)</td><td>how big a step?</td><td>limit 2/9.33 = 0.214; 0.25 diverges</td><td>always tune; log sweep</td></tr>
    <tr><td>Convexity</td><td>Hessian eigenvalues ≥ 0 everywhere</td><td>is the bottom we reach the best?</td><td>eig 18, 0.67: every start → (2, 0)</td><td>to know if the start matters</td></tr>
    <tr><td>SGD / mini-batch</td><td>average of per-row gradients</td><td>how much data per step?</td><td>−4, −16, −36 → mean −18.67; 1 epoch → w = 1.89</td><td>large data (mini-batch is default)</td></tr>
    <tr><td>Momentum</td><td>running sum of gradients</td><td>how to stop zig-zagging?</td><td>98 → 39 steps</td><td>narrow valleys, noisy gradients</td></tr>
    <tr><td>RMSProp / Adam</td><td>per-weight gradient size (+ momentum)</td><td>a step size per weight?</td><td>Adam 123 (diagonal valley); 151 vs GD 249 (axis valley)</td><td>deep nets, very different weight scales</td></tr>
    <tr><td>Schedules</td><td>lr as a function of t</td><td>fast early, precise late?</td><td>lr 0.2 oscillates at 1.886; dropping it settles at 2</td><td>long training runs</td></tr>
    <tr><td>Feature scaling</td><td>standardised columns → rounder XᵀX</td><td>can we reshape the valley?</td><td>cond 27 → 7.3e6 in sq ft; 3 standardised</td><td>GD-trained and distance models</td></tr>
    <tr><td>Regularization</td><td>loss + λ‖w‖²</td><td>which of many good fits do we prefer?</td><td>λ = 1 → (1.46, 0.46), loss 0.19</td><td>collinear features, overfitting</td></tr>
    <tr><td>Lagrange multipliers</td><td>∇L = λ∇g plus the rule</td><td>best point under a hard rule?</td><td>w₁ + w₂ = 1 → (1.5, −0.5), loss 4.5, λ = −9</td><td>exact rules; SVMs; theory of ridge/lasso</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>optimization is "step against the gradient", and every other idea is about the shape of the valley you are stepping in.</strong> The curvature caps the learning rate; positive curvature everywhere (convexity) guarantees one answer; a stretched valley (our 27 : 1, from the eigenvalues of XᵀX) causes zig-zags that momentum and Adam damp, scaling removes, and L2 regularization rounds off; constraints change which part of the valley you are allowed to stand in. Linear algebra describes the valley, calculus measures it, optimization crosses it.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the revision sheet.</b> Everything above, condensed to one page.</div>

  <h2 id="mop-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: X = [[1, 1], [2, 3], [3, 2]] ([size in 1000 sq ft, rooms] of houses A, B, C), prices y = [2, 4, 6]. One weight: L(w) = mean((w·size − y)²) = (14/3)(w − 2)², slope (28/3)(w − 2), curvature 9.33. Two weights: L = mean((Xw − y)²), minimum (2, 0), Hessian (2/3)XᵀX with eigenvalues 18 and 0.667.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On our houses</th><th>Weakness → next</th></tr>
    <tr><td>Loss landscape</td><td>what are we searching?</td><td>18.67, 4.67, 0, 4.67, 18.67 for w = 0…4</td><td>can't scan millions of weights → GD</td></tr>
    <tr><td>Gradient descent</td><td>how to walk downhill?</td><td>0 → 1.867 → 1.991 → 2 (lr 0.1)</td><td>step size? → lr</td></tr>
    <tr><td>Learning rate</td><td>how big a step?</td><td>limit 0.214; 0.25 → 4.67, −1.56, 6.74</td><td>best bottom? → convexity</td></tr>
    <tr><td>Convexity</td><td>does downhill find the best?</td><td>eig 18, 0.67 &gt; 0 → always (2, 0)</td><td>too much data per step → SGD</td></tr>
    <tr><td>SGD / mini-batch</td><td>part of the data per step?</td><td>per-house −4, −16, −36; mean −18.67</td><td>still zig-zags → momentum/Adam</td></tr>
    <tr><td>Momentum, Adam</td><td>smarter steps?</td><td>GD 98, momentum 39, Adam 123 steps</td><td>fixed lr → schedules</td></tr>
    <tr><td>Schedules</td><td>change lr over time?</td><td>lr 0.2 stuck oscillating at 1.886</td><td>why narrow? → scaling</td></tr>
    <tr><td>Feature scaling</td><td>reshape the valley?</td><td>cond 27; sq ft 7.3e6; standardised 3</td><td>duplicates still flat → regularization</td></tr>
    <tr><td>Regularization</td><td>prefer small weights?</td><td>λ = 1 → (1.46, 0.46), loss 0.19</td><td>soft only → constraints</td></tr>
    <tr><td>Lagrange</td><td>best point under a hard rule?</td><td>w₁ + w₂ = 1 → (1.5, −0.5), loss 4.5, λ = −9</td><td>→ <a class="xref" data-note="ml_loss_gd">Loss &amp; GD</a>, <a class="xref" data-note="ml_svm">SVM</a></td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>MSE and its gradient</td><td>L = (1/n)‖Xw − y‖²; ∇L = (2/n)Xᵀ(Xw − y)</td><td>X data (n × d), w weights, y targets</td></tr>
    <tr><td>Gradient descent</td><td>w ← w − lr·∇L</td><td>lr = learning rate</td></tr>
    <tr><td>Stability limit</td><td>lr &lt; 2 / λ_max(H)</td><td>H = Hessian = (2/n)XᵀX for MSE</td></tr>
    <tr><td>Mini-batch gradient</td><td>g = (1/b)Σ_{i∈B} ∇ℓᵢ</td><td>B random batch of size b; unbiased</td></tr>
    <tr><td>Momentum</td><td>v = βv + g; w −= lr·v</td><td>β fade factor (0.9 typical)</td></tr>
    <tr><td>RMSProp</td><td>s = βs + (1−β)g²; w −= lr·g/(√s + ε)</td><td>ε avoids divide-by-zero</td></tr>
    <tr><td>Adam</td><td>m = β₁m + (1−β₁)g; v = β₂v + (1−β₂)g²; m̂ = m/(1−β₁ᵗ), v̂ = v/(1−β₂ᵗ); w −= lr·m̂/(√v̂ + ε)</td><td>β₁ 0.9, β₂ 0.999, t = step</td></tr>
    <tr><td>Cosine schedule, warmup</td><td>½·base·(1 + cos(πt/T)); base·t/warm</td><td>T total steps</td></tr>
    <tr><td>Standardise; condition number</td><td>(x − mean)/std; λ_max/λ_min</td><td>1 = round bowl</td></tr>
    <tr><td>L2 regularization, ridge</td><td>J = L + λ‖w‖²; w ← (1 − 2·lr·λ)w − lr∇L; (XᵀX + λI)w = Xᵀy</td><td>λ penalty strength</td></tr>
    <tr><td>Lagrange</td><td>ℒ = L − λ(g − c); ∇L = λ∇g, g = c</td><td>λ multiplier = d(min loss)/dc</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Plain GD / closed form</b><p>Use on small convex problems; closed form when d is small.</p><small>Avoid full batch on huge data</small></div>
    <div><b>Mini-batch SGD + momentum</b><p>Use as the workhorse; CNNs often generalise well with it.</p><small>Needs lr tuning and a schedule</small></div>
    <div><b>Adam / AdamW</b><p>Use for deep nets and transformers, weights on very different scales.</p><small>Not always fastest on small, well-scaled problems</small></div>
    <div><b>Schedules, warmup</b><p>Use on long runs; warmup with Adam on transformers.</p><small>Retune T when the run length changes</small></div>
    <div><b>Feature scaling</b><p>Use for any GD-trained or distance-based model.</p><small>Trees don't need it; fit the scaler on train only</small></div>
    <div><b>L2 / L1 / constraints</b><p>L2 for stability with correlated features, L1 for sparsity, constraints for exact rules.</p><small>Use AdamW, not Adam + L2</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>lr too high (loss → NaN); stepping along +∇L; assuming the first minimum is the best on a non-convex loss; not shuffling each epoch; reading <code>torch.optim.SGD</code> as batch size 1; "Adam is always faster"; a schedule that doesn't match the run length; unscaled features; fitting the scaler on all data; Adam + L2 instead of AdamW; fixing up weights after training instead of solving the constrained problem.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>L(w) = (w − 3)², w = 0, lr = 0.25. Next w?</td><td>Slope −6 → w = 0 + 0.25 × 6 = 1.5</td></tr>
    <tr><td>Curvature 9.33. Largest safe lr?</td><td>2 / 9.33 ≈ 0.214</td></tr>
    <tr><td>Momentum β = 0.9, gradients 1, 1, 1. v after three steps?</td><td>1 → 1.9 → 2.71</td></tr>
    <tr><td>Ridge on the houses, λ from 0 to 1: does the training loss go up or down?</td><td>Up, 0 → 0.19; weights shrink to (1.46, 0.46)</td></tr>
    <tr><td>Constraint w₁ + w₂ = c has multiplier λ = −9 at c = 1. Loss change if c = 1.1?</td><td>≈ −9 × 0.1 = −0.9 (it falls)</td></tr>
  </table>

  <h2 id="mop-qa"><span class="num">12</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you run each optimizer on the three houses in your head and explain why each one exists, out loud, without notes?</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Houses: sizes 1, 2, 3, prices 2, 4, 6, model y = wx. At w = 0 the gradient of MSE is −18.67. With lr = 0.1, what is the next w, and why does it move right?</summary><div class="qa-body">w = 0 − 0.1 × (−18.67) = 1.867. The gradient is negative, meaning loss falls as w increases, so stepping against the gradient means increasing w. The minimum is at w = 2.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write one gradient-descent step for linear regression with MSE.</summary><div class="qa-body"><code>err = X @ w - y; w -= lr * 2 * X.T @ err / n</code>. The gradient of mean((Xw − y)²) is (2/n)Xᵀ(Xw − y).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your training loss becomes NaN after a few iterations. What do you check first?</summary><div class="qa-body">Learning rate too high (cut it 10×). Then: unscaled features, log(0) or division by zero in the loss, exploding gradients (add gradient clipping), and bad input values (NaN or inf in data).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is mini-batch gradient descent the default?</summary><div class="qa-body">Full batch gives one update per epoch and needs all data in memory. Pure SGD can't use GPU parallelism and is very noisy. Mini-batches give many updates per epoch, vectorise well, and add a little noise that helps escape saddles.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a saddle point and why does it matter more than local minima in deep learning?</summary><div class="qa-body">A point where the gradient is zero but the surface curves up in some directions and down in others. In high dimensions, zero-gradient points are overwhelmingly saddles. GD slows to a crawl near them; noise and momentum help it slide off.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is logistic regression's loss convex? A neural network's?</summary><div class="qa-body">Logistic regression with cross-entropy: yes, so GD finds the global minimum. A neural network: no. Hidden-layer nonlinearities and weight symmetries (swap two hidden units, same function) create many minima.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain momentum with an analogy.</summary><div class="qa-body">A heavy ball rolling downhill. It keeps a running sum of past gradients, so steps that flip sign (zig-zag across a valley) cancel, and steps that agree (along the valley) add up and accelerate. With β = 0.9, six agreeing gradients of 1 build v up to 4.7, heading for 10. On our houses it cut GD's 98 steps to 39.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does Adam do that SGD with momentum doesn't? Why bias correction?</summary><div class="qa-body">It also tracks the mean squared gradient per weight and divides by its square root, giving every weight its own step size. m and v start at 0, so early averages are biased toward 0; dividing by (1−βᵗ) fixes that in the first steps.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Adam vs AdamW?</summary><div class="qa-body">Adam with L2 adds λw to the gradient, which then gets divided by √v, so heavily-updated weights are barely regularised. AdamW applies decay separately: <code>w −= lr·λ·w</code>. It generalises better and is the standard for transformers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use learning-rate warmup?</summary><div class="qa-body">Early on, weights are random and Adam's variance estimates rest on very few samples, so full-size steps can be wild and destabilise training. Ramping lr up over the first few hundred or thousand steps avoids that.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does feature scaling speed up gradient descent? Does a random forest need it?</summary><div class="qa-body">Features on different scales stretch the loss bowl into a narrow valley (high condition number: our houses go from 27 to 7.3 million when size is in plain sq ft). One lr can't suit both directions: GD zig-zags or diverges. Standardising makes the bowl round. Trees split on thresholds, which don't depend on scale, so they don't need it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does L2 regularization show up in the gradient update?</summary><div class="qa-body">Loss + λ‖w‖² adds 2λw to the gradient, so <code>w ← w − lr(∇L + 2λw) = (1 − 2·lr·λ)w − lr∇L</code>. Every step multiplies the weights by slightly less than 1: weight decay.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Training loss falls but stays on a plateau well above zero. Three things to try.</summary><div class="qa-body">(1) Decay the lr or use a schedule, to settle into the minimum. (2) Check the floor is not just noise (irreducible error, like 0.25 in the 100-point regression). (3) If the model is underfitting: more capacity, better features, less regularization.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: where does the learning-rate limit come from, and what does linear algebra have to do with it?</summary><div class="qa-body">On a quadratic bowl, each GD step multiplies the distance to the bottom along each Hessian eigenvector by (1 − lr·λᵢ). If |1 − lr·λ| &gt; 1 that distance grows: divergence, so lr &lt; 2/λ_max. For MSE the Hessian is (2/n)XᵀX, so the limit comes straight from the eigenvalues of XᵀX (27 and 1 for the houses, giving curvatures 18 and 0.667 and the limit 0.111).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: momentum, Adam, feature scaling and L2 all "help with narrow valleys". How do they differ?</summary><div class="qa-body">Momentum and Adam change the steps (damp the bounces; give each weight its own scale) but leave the valley as it is. Scaling changes the coordinates so the valley itself becomes round. L2 changes the objective, adding λ to every curvature, which lifts a flat floor (from duplicate features) and lowers the condition number. Scaling fixes units; L2 fixes redundancy; optimizers cope with whatever is left.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip convexity and assume GD found the best answer?</summary><div class="qa-body">On a convex loss (our houses, linear/logistic regression) nothing: any start gives (2, 0). On a non-convex loss the result depends on the start: t⁴ − 3t² + t ends at −1.07 or −3.51 depending on where GD began, and a stalled loss may just be a saddle. That's why neural nets use random restarts, noise (SGD) and momentum, and why you never compare two nets trained from one seed each as if the result were unique.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why is ridge's λ "the same kind of thing" as a Lagrange multiplier?</summary><div class="qa-body">Minimising L subject to ‖w‖² ≤ t has the Lagrangian L + λ(‖w‖² − t). Its stationarity condition, ∇L + 2λw = 0, is exactly the condition for minimising L + λ‖w‖². So every penalty strength λ corresponds to a budget t on the weights; the multiplier measures how much the loss would drop if the budget were loosened.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why did we need calculus at all if linear algebra solved the houses in one line?</summary><div class="qa-body">The normal equations work only for a linear model with squared error and a manageable number of features (cost O(d³)). Neural nets, cross-entropy, constraints and huge d have no such formula. The gradient (Calculus) plus a stepping rule (this note) works for any differentiable loss; on the houses it reaches the same (2, 0) the formula gave.</div></details>
  <div class="bridge"><b>What this still can't tell us → next: the ML notes.</b> We can now minimise any differentiable loss. Which loss, which model, and how to tell whether the weights we found generalise to new houses, are the questions of <a class="xref" data-note="ml_loss_gd">Loss &amp; Gradient Descent</a>, <a class="xref" data-note="ml_regression">Linear Regression</a>, <a class="xref" data-note="ml_ridge_lasso">Ridge &amp; Lasso</a> and <a class="xref" data-note="ml_pca">PCA</a>.</div>
</main>
`
});
