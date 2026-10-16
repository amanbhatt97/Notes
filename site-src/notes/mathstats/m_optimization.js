// notes/mathstats/m_optimization.js — Optimization
Object.assign(TOPIC_CONTENT, {
  "m_optimization": `<main>
  <h1>Optimization</h1>
  <p class="lead">Optimization is the search for the best setting of something. In ML, "something" is the model's weights and "best" means lowest loss (fewest mistakes). This page turns the gradient from <em>Calculus</em> into working optimizers: plain gradient descent by hand and in numpy, why the step size makes or breaks it, and what Momentum, RMSProp and Adam add. Every optimizer here is run on real small problems with real output.</p>

  <h2 id="mop-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Optimization</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Loss landscape</div>
        <ul>
          <li><b>Weights = position, loss = height</b>; training walks downhill</li>
          <li><b>One-weight demo</b> — y = 2x data: loss(w) = 18.7, 4.7, 0, 4.7, 18.7 for w = 0..4; a bowl with bottom at w = 2</li>
          <li><b>MSE</b> — mean((ŷ−y)²), smooth bowl, regression</li>
          <li><b>MAE</b> — mean|ŷ−y|, outlier-robust, kink at 0</li>
          <li><b>Cross-entropy</b> — −mean(y log p + (1−y) log(1−p)), classification</li>
          <li><b>Hinge</b> — mean(max(0, 1 − y·score)), SVMs</li>
          <li>💡 hiker in fog: feels slope under boots; optimizer = rule for next step</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Gradient descent</div>
        <ul>
          <li><b>Loop</b> — predict → loss → ∇L → <code>w ← w − lr·∇L</code> → repeat</li>
          <li><b>By hand</b> — w=0, grad −18.67, lr 0.1 → w = 1.867; next grad −1.24 → 1.991; converges to 2</li>
          <li><b>Linear-reg MSE grad</b> — <code>(2/n)·Xᵀ(Xw − y)</code></li>
          <li><b>Shape of curve</b> — big early drops (steep), then slow polishing</li>
          <li><b>Floor</b> — irreducible noise variance (σ=0.5 → ~0.25) can't be fitted away</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Learning rate</div>
        <ul>
          <li><b>Too small</b> — correct but tiny steps, wastes compute (lr 0.001 → loss 33)</li>
          <li><b>Too large</b> — overshoots valley, snowballs → NaN (lr 0.5 → 9e5; by hand lr 0.25: w = 4.7, −1.6, 6.7, −4.3)</li>
          <li><b>Limit</b> — diverges when lr &gt; 2 / largest Hessian eigenvalue</li>
          <li><b>Tuning</b> — sweep log scale (1e-4, 3e-4, 1e-3…), take largest that falls smoothly</li>
          <li>⚠ <b>Loss → NaN</b> — cut lr 10×; then check scaling, log(0), exploding grads (clip), bad data</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Batch vs SGD vs mini-batch</div>
        <ul>
          <li><b>Batch GD</b> — all n per step; exact gradient, 1 update/epoch, must fit memory</li>
          <li><b>SGD</b> — 1 example; very noisy, n updates/epoch, no GPU parallelism</li>
          <li><b>Mini-batch (32–1024)</b> — default: many updates, little noise, fills GPU</li>
          <li><b>Epoch</b> — one full pass over the data; <b>shuffle every epoch</b></li>
          <li><b>Noise helps</b> escape saddles</li>
          <li>⚠ <code>torch.optim.SGD</code> = update rule, not batch size 1</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Convex vs non-convex</div>
        <ul>
          <li><b>Convex</b> — one bowl; local min = global min (linear/logistic reg, ridge, SVM)</li>
          <li><b>Non-convex</b> — many valleys (neural nets, matrix factorisation, k-means); start point decides valley</li>
          <li><b>Saddle</b> — ∇ = 0 but downhill exists; GD stalls then escapes</li>
          <li><b>High-dim reality</b> — most zero-grad points are saddles; local minima ≈ global loss</li>
          <li><b>Why NN non-convex</b> — nonlinearities + weight symmetries (swap hidden units)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Momentum, RMSProp, Adam</div>
        <ul>
          <li><b>Momentum</b> — v = βv + g; w −= lr·v; 💡 heavy ball: zig-zags cancel, consistent dirs accelerate</li>
          <li><b>By hand (β=0.9)</b> — grads +1,−1,+1… → v stays ≈ ±0.2; grads +1,+1,+1… → v = 1, 1.9, 2.71, 3.44…</li>
          <li><b>RMSProp</b> — s = βs + (1−β)g²; w −= lr·g/(√s+ε); per-weight step size</li>
          <li><b>Adam</b> — momentum (m) + RMSProp (v) + bias correction m̂ = m/(1−β₁ᵗ)</li>
          <li><b>Bias correction</b> — m, v start at 0 → early averages biased low</li>
          <li><b>Narrow valley test</b> — GD 249 steps, Momentum 146, Adam 151, RMSProp stalls (needs lr decay)</li>
          <li><b>Defaults</b> — Adam/AdamW lr 1e-3 (3e-4 transformers), β₁ 0.9, β₂ 0.999; SGD+0.9 momentum for CNNs</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">LR schedules</div>
        <ul>
          <li><b>Idea</b> — big steps early to cover ground, small late to settle</li>
          <li><b>Step decay</b> — ×0.5 every k epochs; <b>exponential</b> — ×0.97 per step</li>
          <li><b>Cosine</b> — 0.5·base·(1 + cos(πt/T)) → smooth to 0</li>
          <li><b>Warmup</b> — ramp lr up first; Adam's early variance estimates are poor; standard for transformers</li>
          <li><b>ReduceLROnPlateau</b> — cut 10× when val loss stalls; safe default</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Regularization</div>
        <ul>
          <li><b>Objective</b> = data loss + λ‖w‖² → gradient gains 2λw</li>
          <li><b>Weight decay</b> — w ← (1 − 2·lr·λ)w − lr∇L: shrinks weights each step (w=10 → 9.9 → 9.8 …)</li>
          <li><b>L2 ridge</b> — smooth shrink, rounder bowl; <b>L1 lasso</b> — exact zeros; <b>elastic net</b> — both</li>
          <li><b>Collinear demo</b> — OLS gives +19 / −17; ridge splits ≈2 effect evenly</li>
          <li>⚠ <b>Adam + L2 ≠ weight decay</b> (divided by √v) → use <b>AdamW</b> (decoupled decay)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Feature scaling</div>
        <ul>
          <li><b>Unscaled</b> — stretched bowl, high condition number (4e7) → zig-zag or diverge</li>
          <li><b>Standardised</b> — round bowl (cond 1.3) → 25 steps vs not done after 5000</li>
          <li><b>Why</b> — one lr can't suit a steep and a flat direction at once</li>
          <li><b>Needs scaling</b> — GD-trained &amp; distance-based models; <b>trees don't</b> (threshold splits)</li>
          <li>⚠ Fit scaler on train only, apply to val/test (else leakage)</li>
        </ul>
      </div>
    </div>
  </div>


  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mop-land"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Loss Landscapes</span><span class="rm-sub">Weights as a position</span></div></div>
      <div class="rm-item rm-done" data-target="mop-gd"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Gradient Descent</span><span class="rm-sub">By hand, then in numpy</span></div></div>
      <div class="rm-item rm-done" data-target="mop-lr"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Learning Rate</span><span class="rm-sub">Too small, right, too big</span></div></div>
      <div class="rm-item rm-done" data-target="mop-batch"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Batch, SGD, Mini-batch</span><span class="rm-sub">How much data per step</span></div></div>
      <div class="rm-item rm-done" data-target="mop-cvx"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Convex vs Non-convex</span><span class="rm-sub">Local minima, saddles</span></div></div>
      <div class="rm-item rm-done" data-target="mop-adam"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Momentum, RMSProp, Adam</span><span class="rm-sub">Smarter steps</span></div></div>
      <div class="rm-item rm-done" data-target="mop-sched"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">LR Schedules</span><span class="rm-sub">Warm up, then decay</span></div></div>
      <div class="rm-item rm-done" data-target="mop-reg"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Regularization</span><span class="rm-sub">Penalty inside the objective</span></div></div>
      <div class="rm-item rm-done" data-target="mop-scale"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Feature Scaling</span><span class="rm-sub">Round bowls are fast</span></div></div>
      <div class="rm-item rm-done" data-target="mop-qa"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="mop-land"><span class="num">01</span>Loss Functions as Landscapes</h2>
  <p>A tiny dataset: when x = 1, 2, 3 the answer y is 2, 4, 6. You guess the rule is "y = w × x" and must pick the number w. A <strong>loss</strong> is a score for how wrong a guess is. The usual choice for numbers is <strong>MSE</strong> (mean squared error): for each point, take (guess − truth), square it so negatives don't cancel, then average.</p>
  <p>Try a few values of w by hand:</p>
  <ul>
    <li>w = 2: guesses 2, 4, 6. Errors 0, 0, 0. Loss <strong>0</strong>.</li>
    <li>w = 1: guesses 1, 2, 3. Errors −1, −2, −3 → squares 1, 4, 9 → mean <strong>4.67</strong>.</li>
    <li>w = 3: guesses 3, 6, 9. Errors 1, 2, 3 → same squares → <strong>4.67</strong>.</li>
    <li>w = 0 or 4: errors twice as big → squares 4, 16, 36 → mean <strong>18.67</strong>.</li>
  </ul>
  <div class="fx" data-lang="py">import numpy as np
x = np.array([1., 2., 3.]); y = np.array([2., 4., 6.])    # true w = 2
loss = lambda w: np.mean((w * x - y) ** 2)
for w in [0, 1, 2, 3, 4]:
    print(w, round(loss(w), 3))</div>
  <div class="fx" data-lang="text">0 18.667
1 4.667
2 0.0
3 4.667
4 18.667</div>
  <p>Plot loss against w and you get a bowl with its bottom at w = 2. That bowl is the <strong>loss landscape</strong>: every possible weight setting is a position, and the loss is the height there. Training = walking downhill to the bottom. With two weights (a slope w and an intercept b) the landscape is a surface, drawn below as contour rings like a trekking map.</p>
  <figure class="viz"><svg viewBox="0 0 400 210" width="400">
    <defs><marker id="mop-ah1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr"/></marker></defs>
    <ellipse cx="200" cy="105" rx="170" ry="90" fill="none" stroke="currentColor" opacity="0.25"/>
    <ellipse cx="200" cy="105" rx="120" ry="62" fill="none" stroke="currentColor" opacity="0.35"/>
    <ellipse cx="200" cy="105" rx="70" ry="36" fill="none" stroke="currentColor" opacity="0.5"/>
    <ellipse cx="200" cy="105" rx="25" ry="13" class="fg sg"/>
    <polyline points="50,170 110,140 150,122 175,112 190,108 198,106" fill="none" class="sr" stroke-width="2" marker-end="url(#mop-ah1)"/>
    <circle cx="50" cy="170" r="4" class="fr sr"/><text x="20" y="195" class="tr">start: w=0, b=0</text>
    <text x="214" y="132" class="tg">min: w≈3, b≈4</text>
    <text x="6" y="20" class="tm">contours = equal loss</text>
  </svg><figcaption>Each point is one choice of weights (w, b); height (here: contour rings) is the loss. Training walks downhill to the lowest ring.</figcaption></figure>
  <p>Different tasks use different loss functions, which give differently shaped landscapes:</p>
  <table class="tbl">
    <tr><th>Loss</th><th>Formula</th><th>In words</th><th>Used for</th></tr>
    <tr><td>MSE</td><td>mean((ŷ − y)²)</td><td>Average squared miss; big misses punished hard</td><td>Regression; a smooth bowl</td></tr>
    <tr><td>MAE</td><td>mean(|ŷ − y|)</td><td>Average size of miss; all misses count equally</td><td>Regression robust to outliers; a kink at 0</td></tr>
    <tr><td>Cross-entropy</td><td>−mean(y log p + (1−y) log(1−p))</td><td>Punish confident wrong probabilities</td><td>Classification</td></tr>
    <tr><td>Hinge</td><td>mean(max(0, 1 − y·score))</td><td>Zero once the right side is reached with a margin</td><td>SVMs</td></tr>
  </table>
  <p>Symbols: <code>ŷ</code> is the prediction, <code>y</code> the truth, <code>p</code> a predicted probability between 0 and 1.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A hiker in fog on a hilly field. They can't see the valley, only feel the slope under their boots. Every optimizer is a rule for "which way and how far to step next".</p>
  </div>

  <h2 id="mop-gd"><span class="num">02</span>Gradient Descent</h2>
  <p>In the one-weight bowl, how does a computer find w = 2 without trying every value? It uses the slope (see <em>Calculus</em>). At any w, the slope of the loss says which way is uphill. Step the opposite way, by a small amount, and repeat.</p>
  <div class="flow"><span>Predict ŷ</span><span>Loss</span><span>Gradient ∇L</span><span>w ← w − lr·∇L</span><span>Repeat</span></div>
  <p><strong>By hand</strong>, starting at w = 0 with step size lr = 0.1. The slope of MSE for "y = wx" is 2 × mean((wx − y) × x).</p>
  <ul>
    <li>w = 0: errors −2, −4, −6. Times x: −2, −8, −18. Mean −9.33. Times 2 → slope <strong>−18.67</strong>. Negative slope means "loss goes down as w grows", so go right: w = 0 − 0.1 × (−18.67) = <strong>1.867</strong>.</li>
    <li>w = 1.867: slope −1.24 → w = 1.867 + 0.124 = <strong>1.991</strong>.</li>
    <li>w = 1.991: slope −0.08 → <strong>1.999</strong>. Nearly there, and the steps shrink as the slope flattens.</li>
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
  <p>Now a realistic version: 100 noisy points from y = 4 + 3x, two weights (slope w and intercept b), each with its own slope formula.</p>
  <div class="fx" data-lang="py">import numpy as np
rng = np.random.default_rng(42)
x = rng.uniform(0, 2, 100)
y = 4 + 3 * x + rng.normal(0, 0.5, 100)        # true w=3, b=4

w, b, lr = 0.0, 0.0, 0.1
for step in range(201):
    yhat = w * x + b
    loss = np.mean((yhat - y) ** 2)            # MSE
    dw = 2 * np.mean((yhat - y) * x)           # dL/dw
    db = 2 * np.mean(yhat - y)                 # dL/db
    w, b = w - lr * dw, b - lr * db            # step downhill
    if step in (0, 1, 2, 5, 10, 50, 200):
        print(f"step {step:3d}  loss {loss:7.3f}  w {w:.3f}  b {b:.3f}")</div>
  <div class="fx" data-lang="text">step   0  loss  50.736  w 1.525  b 1.383
step   1  loss  17.273  w 2.401  b 2.192
step   2  loss   6.036  w 2.902  b 2.669
step   5  loss   0.557  w 3.428  b 3.232
step  10  loss   0.317  w 3.485  b 3.429
step  50  loss   0.248  w 3.170  b 3.803
step 200  loss   0.240  w 3.021  b 3.972</div>
  <p>Big early drops (steep slope → big gradient → big step), then slow polishing. w and b land near the true 3 and 4. The floor ≈ 0.24 is the noise variance (0.5² = 0.25): the data itself jitters by that much, so no weights can fit it away.</p>
  <div class="callout def"><span class="label">Formula</span>
    <p>For linear regression with MSE, the gradient for all weights at once is <code>(2/n)·Xᵀ(Xw − y)</code>: <code>Xw − y</code> is the vector of errors, <code>Xᵀ</code> multiplies each error by its features and sums, <code>2/n</code> comes from the square and the mean. The update is <code>w ← w − lr·∇L</code>.</p>
  </div>

  <h2 id="mop-lr"><span class="num">03</span>Learning Rate: Too Small, Right, Too Large</h2>
  <p>The <strong>learning rate</strong> (lr) is the step size. Rerun the one-weight bowl with lr = 0.25 instead of 0.1:</p>
  <div class="fx" data-lang="py">w = 0.0; lr = 0.25
for step in range(4):
    grad = 2 * np.mean((w * x - y) * x)
    w = w - lr * grad
    print(step, round(w, 2), round(loss(w), 1))</div>
  <div class="fx" data-lang="text">0 4.67 33.2
1 -1.56 59.0
2 6.74 104.9
3 -4.32 186.5</div>
  <p>The first step jumps from 0 right over the bottom (2) to 4.67. From there the slope points back, but the step is again too big, landing at −1.56. Each bounce is wider than the last. The loss grows instead of shrinking: it <strong>diverges</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Walking down to a well in the dark. Tiny steps: you get there, but it takes all night. Giant leaps: you jump clean over the well and land higher on the other side, again and again.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 460 210" width="460">
    <line x1="50" y1="175" x2="390" y2="175" stroke="currentColor" opacity="0.4"/><line x1="50" y1="175" x2="50" y2="15" stroke="currentColor" opacity="0.4"/>
    <text x="180" y="200" class="tm">step (0 → 15)</text><text x="6" y="20" class="tm">loss</text>
    <polyline points="50,123 72,127 94,131 116,134 138,138 160,141 182,144 204,146 226,148 248,151 270,153 292,154 314,156 336,158 358,159 380,160" fill="none" class="sb" stroke-width="2.5"/>
    <polyline points="50,123 72,157 94,169 116,173 138,174 160,174 182,175 204,175 226,175 248,175 270,175 292,175 314,175 336,175 358,175 380,175" fill="none" class="sg" stroke-width="2.5"/>
    <polyline points="50,123 72,111 94,98 116,81 138,61 160,36" fill="none" class="sr" stroke-width="2.5"/>
    <text x="168" y="34" class="tr">lr=0.5: diverges</text>
    <text x="300" y="150" class="tb">lr=0.01: crawls</text>
    <text x="300" y="192" class="tg">lr=0.1: fast</text>
  </svg><figcaption>Real loss curves from the two-weight regression. Same model, same data, only the step size differs.</figcaption></figure>
  <div class="fx" data-lang="py">def run(lr, steps=50):
    w = b = 0.0
    for _ in range(steps):
        yhat = w * x + b
        w, b = w - lr * 2 * np.mean((yhat - y) * x), b - lr * 2 * np.mean(yhat - y)
    return np.mean((w * x + b - y) ** 2)

for lr in [0.001, 0.01, 0.1, 0.3, 0.5]:
    print(f"lr={lr:&lt;5}  loss after 50 steps: {run(lr):.4g}")</div>
  <div class="fx" data-lang="text">lr=0.001  loss after 50 steps: 33.41
lr=0.01   loss after 50 steps: 1.028
lr=0.1    loss after 50 steps: 0.2475
lr=0.3    loss after 50 steps: 0.2397
lr=0.5    loss after 50 steps: 9.182e+05</div>
  <ul>
    <li><strong>Too small (0.001):</strong> every step is correct but tiny. After 50 steps the loss is still 33. Wasted compute.</li>
    <li><strong>Just right (0.1–0.3):</strong> reaches the noise floor in 50 steps.</li>
    <li><strong>Too large (0.5):</strong> each step overshoots the valley floor to a higher point on the other side, and it snowballs to 900,000.</li>
    <li>The limit is set by the steepest curvature: GD diverges once lr &gt; 2 / (largest Hessian eigenvalue). Steeper bowl → smaller safe step.</li>
  </ul>
  <div class="callout intu"><span class="label">In practice</span>
    <p>Sweep on a log scale (1e-4, 3e-4, 1e-3, …). Pick the largest lr whose loss still falls smoothly. A loss that turns to NaN (not a number: the float overflowed) almost always means lr is too high.</p>
  </div>

  <h2 id="mop-batch"><span class="num">04</span>Batch vs Stochastic vs Mini-batch</h2>
  <p>Our regression used all 100 points to compute each gradient. With 10 million images that is one slow, expensive step. Alternatives: use one random example per step, or a small random handful (a <strong>mini-batch</strong>). The gradient from a handful is a noisy estimate of the full one, but it is cheap, so you can take many more steps.</p>
  <p>Two words: an <strong>epoch</strong> is one full pass over all the data. <strong>Stochastic</strong> means "involving randomness".</p>
  <table class="tbl">
    <tr><th></th><th>Batch GD</th><th>Stochastic (SGD)</th><th>Mini-batch</th></tr>
    <tr><td>Examples per step</td><td>All n</td><td>1</td><td>32–1024</td></tr>
    <tr><td>Gradient</td><td>Exact, smooth</td><td>Very noisy</td><td>Slightly noisy</td></tr>
    <tr><td>Updates per epoch</td><td>1</td><td>n</td><td>n / batch</td></tr>
    <tr><td>Hardware</td><td>Must fit in memory</td><td>Can't use GPU parallelism</td><td>Fills the GPU well</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Judging a restaurant. Batch: read all 1,000 reviews before deciding anything. Stochastic: read one review and immediately change your opinion. Mini-batch: read 32 at a time, a fair picture, updated often.</p>
  </div>
  <div class="fx" data-lang="py">rng = np.random.default_rng(42)
x = rng.uniform(0, 2, 1000)
y = 4 + 3 * x + rng.normal(0, 0.5, 1000)

def train(batch, lr=0.05, epochs=5):
    w = b = 0.0; updates = 0
    for _ in range(epochs):
        idx = rng.permutation(len(x))                # shuffle every epoch
        for s in range(0, len(x), batch):
            i = idx[s:s + batch]
            err = w * x[i] + b - y[i]
            w -= lr * 2 * np.mean(err * x[i]); b -= lr * 2 * np.mean(err)
            updates += 1
    return updates, np.mean((w * x + b - y) ** 2)

for name, bs in [("batch", 1000), ("mini-batch", 32), ("stochastic", 1)]:
    u, L = train(bs)
    print(f"{name:&lt;11} batch={bs:&lt;5} updates={u:&lt;5} loss={L:.3f}")</div>
  <div class="fx" data-lang="text">batch       batch=1000  updates=5     loss=4.817
mini-batch  batch=32    updates=160   loss=0.260
stochastic  batch=1     updates=5000  loss=0.299</div>
  <p>Same 5 passes over the data. Full batch made only 5 steps and is far from done (loss 4.8). SGD made 5000 but its noise keeps it bouncing above the floor (0.299 vs 0.25). Mini-batch gets both: many steps, little noise, loss 0.26.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"SGD" in PyTorch (<code>torch.optim.SGD</code>) means the update rule, not batch size 1. You feed it mini-batches.</p>
  </div>

  <h2 id="mop-cvx"><span class="num">05</span>Convex vs Non-convex</h2>
  <p>The loss bowls so far had one bottom. Walk downhill from anywhere and you reach it. A landscape with exactly one valley and no bumps is called <strong>convex</strong>. Linear and logistic regression have convex losses, which is why they are so reliable.</p>
  <p>Neural networks are different: their landscape has many valleys, some deeper than others. Walking downhill ends in <em>whichever valley you started above</em>, which may not be the deepest. A shallow valley is a <strong>local minimum</strong>; the deepest one is the <strong>global minimum</strong>.</p>
  <figure class="viz"><svg viewBox="0 0 420 210" width="420">
    <defs><marker id="mop-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <polyline points="40,45 46,74 52,98 58,119 64,136 70,150 75,161 81,170 87,176 93,179 99,182 105,182 111,181 117,179 123,176 129,172 135,167 140,162 146,157 152,151 158,146 164,140 170,135 176,130 182,125 188,121 194,117 199,114 205,111 211,109 217,108 223,107 229,106 235,107 241,108 247,109 253,111 259,113 264,115 270,118 276,120 282,123 288,126 294,128 300,129 306,130 312,131 318,130 324,128 329,125 335,120 341,113 347,104 353,93 359,79 365,62 371,42 377,18" fill="none" class="sb" stroke-width="2.5"/>
    <circle cx="104" cy="182" r="5" class="fg sg"/><text x="70" y="202" class="tg">global min f=−3.51</text>
    <circle cx="310" cy="131" r="5" class="fr sr"/><text x="270" y="158" class="tr">local min f=−1.07</text>
    <circle cx="229" cy="106" r="4" fill="currentColor"/><text x="180" y="84" class="tm">flat top: ∇=0 too</text>
    <circle cx="44" cy="66" r="4" fill="currentColor"/><text x="52" y="56" font-size="11">start −2</text>
    <circle cx="257" cy="112" r="4" fill="currentColor"/><line x1="262" y1="116" x2="296" y2="126" stroke="currentColor" marker-end="url(#mop-ah2)"/><text x="196" y="142" font-size="11">start 0.5</text>
  </svg><figcaption>f(x) = x⁴ − 3x² + x. Gradient descent rolls into whichever valley it starts above. Starting at −2 reaches the deep valley; starting at 0.5 or 2 gets stuck in the shallow one.</figcaption></figure>
  <div class="fx" data-lang="py">f  = lambda x: x**4 - 3 * x**2 + x            # two valleys
df = lambda x: 4 * x**3 - 6 * x + 1
for x0 in [-2.0, 0.5, 2.0]:
    x = x0
    for _ in range(200):
        x -= 0.01 * df(x)
    print(f"start {x0:5}  -&gt;  x={x:.3f}  f={f(x):.3f}")</div>
  <div class="fx" data-lang="text">start  -2.0  -&gt;  x=-1.301  f=-3.514
start   0.5  -&gt;  x=1.131  f=-1.070
start   2.0  -&gt;  x=1.131  f=-1.070</div>
  <div class="cards">
    <div><b>Convex</b><p>One bowl: any local min is the global min.</p><small>Linear / logistic regression, ridge, SVM</small></div>
    <div><b>Non-convex</b><p>Many valleys, ridges and plateaus.</p><small>Neural networks, matrix factorisation, k-means</small></div>
    <div><b>Saddle point</b><p>∇ = 0 but downhill exists in some direction.</p><small>The common trap in high dimensions</small></div>
  </div>
  <p>A <strong>saddle point</strong> is shaped like a horse saddle: a valley bottom along one direction, a hill top along another. The slope is zero there, so gradient descent thinks it has arrived, even though a way down exists. Watch GD stall on f = x² − y² when it starts almost exactly on the ridge:</p>
  <div class="fx" data-lang="py">p = np.array([1.0, 1e-6])         # saddle f = x² − y², start almost on the ridge
for step in range(1, 61):
    g = np.array([2 * p[0], -2 * p[1]])
    p = p - 0.1 * g
    if step in (10, 30, 60):
        print(f"step {step:2d}  |grad|={np.linalg.norm(g):.1e}  y={p[1]:.1e}")</div>
  <div class="fx" data-lang="text">step 10  |grad|=2.7e-01  y=6.2e-06
step 30  |grad|=3.1e-03  y=2.4e-04
step 60  |grad|=9.4e-02  y=5.6e-02</div>
  <p>Near the saddle the gradient shrinks to 0.003 and progress stalls, then the tiny y-offset grows and GD escapes down the y direction. Mini-batch noise and momentum help it escape sooner.</p>
  <div class="callout intu"><span class="label">Why deep nets still train</span>
    <p>In millions of dimensions, true bad local minima are rare. Most zero-gradient points are saddles, and most local minima have loss close to the global one. Neural nets are non-convex because of their nonlinearities and because swapping two hidden units gives the same function (so there are many equally good minima).</p>
  </div>

  <h2 id="mop-adam"><span class="num">06</span>Momentum, RMSProp, Adam</h2>
  <p>Plain gradient descent has two weaknesses. In a long narrow valley it zig-zags from wall to wall instead of running along the floor. And it uses the same step size for every weight, even when one direction is steep and another is flat. Three ideas fix this.</p>
  <p><strong>Momentum: remember where you were going.</strong> Instead of stepping along the current gradient alone, keep a running total v of past gradients (with a fade factor β, typically 0.9) and step along that. By hand, with β = 0.9:</p>
  <div class="fx" data-lang="py">g = [1, -1, 1, -1, 1, -1]        # zig-zag gradients
v = 0
for gi in g:
    v = 0.9 * v + gi
    print(round(v, 3), end=" ")
print()
g = [1, 1, 1, 1, 1, 1]           # consistent gradients
v = 0
for gi in g:
    v = 0.9 * v + gi
    print(round(v, 3), end=" ")
print()</div>
  <div class="fx" data-lang="text">1.0 -0.1 0.91 -0.181 0.837 -0.247
1.0 1.9 2.71 3.439 4.095 4.686 </div>
  <p>Gradients that flip sign (zig-zag across a valley) mostly cancel: the running total stays small. Gradients that agree (along the valley floor) add up and speed up: 1 → 1.9 → 2.71 → … towards 10. That is exactly what a heavy ball rolling downhill does.</p>
  <p><strong>RMSProp: a step size per weight.</strong> Keep a running average s of each weight's <em>squared</em> gradient, then divide the step by √s. A weight that always sees big gradients gets smaller steps; one with tiny gradients gets bigger ones. Every weight ends up moving at a similar pace.</p>
  <p><strong>Adam = both.</strong> Momentum's running average (called m) divided by RMSProp's √v, plus a small fix for the first steps (<strong>bias correction</strong>): m and v start at 0, so their early averages are too small; dividing by (1 − βᵗ) scales them up correctly.</p>
  <table class="tbl">
    <tr><th>Optimizer</th><th>Update (one line)</th><th>Intuition</th></tr>
    <tr><td>GD</td><td>w −= lr·g</td><td>Step along the slope</td></tr>
    <tr><td>Momentum</td><td>v = βv + g; w −= lr·v</td><td>Heavy ball: zig-zags cancel, consistent directions build speed</td></tr>
    <tr><td>RMSProp</td><td>s = βs + (1−β)g²; w −= lr·g/(√s + ε)</td><td>Per-weight step size: divide by recent gradient size</td></tr>
    <tr><td>Adam</td><td>m = β₁m + (1−β₁)g; v = β₂v + (1−β₂)g²; w −= lr·m̂/(√v̂ + ε)</td><td>Momentum + RMSProp + bias correction (m̂ = m/(1−β₁ᵗ))</td></tr>
  </table>
  <p>Symbols: <code>g</code> = current gradient, <code>β</code> = fade factor (how much of the past to keep), <code>ε</code> = tiny number so we never divide by zero, <code>t</code> = step count, hats = bias-corrected.</p>
  <p>Test on a long, narrow valley, f = ½(x² + 50y²): 50× steeper in y than in x.</p>
  <div class="fx" data-lang="py">grad = lambda p: np.array([p[0], 50 * p[1]])
f    = lambda p: 0.5 * (p[0]**2 + 50 * p[1]**2)

def run(update, steps=500):
    p, state = np.array([10.0, 1.0]), {}
    for t in range(1, steps + 1):
        p = update(p, grad(p), state, t)
        if f(p) &lt; 1e-6:
            return t
    return f"not done, f={f(p):.2g}"

def sgd(p, g, s, t, lr=0.035):
    return p - lr * g
def momentum(p, g, s, t, lr=0.035, beta=0.9):
    s["v"] = beta * s.get("v", 0) + g
    return p - lr * s["v"]
def rmsprop(p, g, s, t, lr=0.1, beta=0.9, eps=1e-8):
    s["s"] = beta * s.get("s", 0) + (1 - beta) * g**2
    return p - lr * g / (np.sqrt(s["s"]) + eps)
def adam(p, g, s, t, lr=0.5, b1=0.9, b2=0.999, eps=1e-8):
    s["m"] = b1 * s.get("m", 0) + (1 - b1) * g
    s["v"] = b2 * s.get("v", 0) + (1 - b2) * g**2
    m_hat, v_hat = s["m"] / (1 - b1**t), s["v"] / (1 - b2**t)
    return p - lr * m_hat / (np.sqrt(v_hat) + eps)

for name, u in [("GD", sgd), ("Momentum", momentum), ("RMSProp", rmsprop), ("Adam", adam)]:
    print(f"{name:&lt;9} steps to f&lt;1e-6: {run(u)}")

for name, u in [("GD", sgd), ("RMSProp", rmsprop), ("Adam", adam)]:   # first step from (10, 1)
    p0 = np.array([10.0, 1.0])
    print(f"{name:&lt;8} first step: {np.round(u(p0, grad(p0), {}, 1) - p0, 3)}")</div>
  <div class="fx" data-lang="text">GD        steps to f&lt;1e-6: 249
Momentum  steps to f&lt;1e-6: 146
RMSProp   steps to f&lt;1e-6: not done, f=0.064
Adam      steps to f&lt;1e-6: 151
GD       first step: [-0.35 -1.75]
RMSProp  first step: [-0.316 -0.316]
Adam     first step: [-0.5 -0.5]</div>
  <ul>
    <li><strong>GD's first step</strong> moves y by −1.75 from y = 1: it overshoots the narrow axis while barely moving along the long one (x by only −0.35 out of 10). Classic zig-zag.</li>
    <li><strong>Momentum</strong> finishes in 146 steps instead of 249: the zig-zags cancel, the run along x builds speed.</li>
    <li><strong>RMSProp / Adam</strong> take equal-sized steps in x and y: each weight gets its own scale.</li>
    <li><strong>RMSProp stalls:</strong> its step stays ≈ lr even near the minimum, so it rattles around the bottom. It needs a decaying lr. Adam's momentum smooths this out.</li>
  </ul>
  <div class="callout intu"><span class="label">Defaults that work</span>
    <p>Adam / AdamW with lr = 1e-3 (3e-4 for transformers), β₁ = 0.9, β₂ = 0.999. SGD + momentum 0.9 often generalises slightly better for CNNs, but needs more lr tuning.</p>
  </div>

  <h2 id="mop-sched"><span class="num">07</span>Learning-Rate Schedules</h2>
  <p>Section 03 showed one lr can't be both fast and precise. The fix: change it during training. Big steps early to cover ground, small steps late to settle into the bottom. A rule for "lr at step t" is a <strong>schedule</strong>.</p>
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
  <ul>
    <li><strong>Step decay</strong>: multiply by 0.5 every 30 epochs. <strong>Exponential</strong>: multiply by 0.97 every epoch. <strong>Cosine</strong>: follow half a cosine wave from base down to 0, smooth.</li>
    <li><strong>Warmup</strong>: start near 0 and ramp up over the first few epochs. Adam's early variance estimates rest on very few samples, so full-size first steps can be wild. Standard for transformers.</li>
    <li><strong>ReduceLROnPlateau</strong>: cut lr by 10× when validation loss stops improving. A safe default for tabular and CNN work.</li>
  </ul>

  <h2 id="mop-reg"><span class="num">08</span>Regularization as Part of the Objective</h2>
  <p>A model with huge weights is fragile: a small change in the input swings the output wildly, and it usually means the model memorised the training data (overfitting). <strong>Regularization</strong> adds a penalty for big weights to the loss, so the optimizer is pushed towards small weights while still fitting the data.</p>
  <div class="flow"><span>Objective</span><span>= data loss</span><span>+ λ · ‖w‖²</span><span>gradient gains + 2λw</span><span>w shrinks every step</span></div>
  <p>Here <code>λ</code> (lambda) sets how strong the penalty is and <code>‖w‖²</code> is the sum of squared weights. The penalty is just another term in the loss, so GD handles it automatically: its gradient 2λw adds a pull toward 0 on every weight. Each step multiplies w by (1 − 2·lr·λ), slightly less than 1. By hand, with lr = 0.1, λ = 0.05 and no data gradient, a weight of 10 shrinks by 1% per step:</p>
  <div class="fx" data-lang="py">w = 10.0
for _ in range(5):
    w = (1 - 2 * 0.1 * 0.05) * w
    print(round(w, 3), end=" ")
print()</div>
  <div class="fx" data-lang="text">9.9 9.801 9.703 9.606 9.51 </div>
  <p>That steady shrinking is why L2 regularization is also called <strong>weight decay</strong>. Now see what it fixes. Two features that are near-copies of each other (x2 ≈ x1):</p>
  <div class="fx" data-lang="py">from sklearn.linear_model import LinearRegression, Ridge
rng = np.random.default_rng(1)
x1 = rng.normal(size=30)
x2 = x1 + rng.normal(0, 0.01, 30)        # near-copy of x1
X = np.column_stack([x1, x2])
y = 2 * x1 + rng.normal(0, 0.5, 30)

print("OLS  ", np.round(LinearRegression().fit(X, y).coef_, 2))
for a in [0.1, 1, 10]:
    print(f"Ridge a={a:&lt;4}", np.round(Ridge(alpha=a).fit(X, y).coef_, 2))</div>
  <div class="fx" data-lang="text">OLS   [ 19.06 -17.19]
Ridge a=0.1  [1.16 0.73]
Ridge a=1    [0.95 0.9 ]
Ridge a=10   [0.76 0.76]</div>
  <p>Without a penalty (OLS = ordinary least squares), two near-identical features get huge opposite weights (+19, −17) that cancel out on training data and break on new data. Ridge (L2) splits the true effect (≈2) between them. Bigger alpha = stronger shrinking.</p>
  <table class="tbl">
    <tr><th>Penalty</th><th>Term</th><th>Effect</th></tr>
    <tr><td>L2 (ridge)</td><td>λΣw²</td><td>Shrinks all weights smoothly; makes the bowl rounder (more convex)</td></tr>
    <tr><td>L1 (lasso)</td><td>λΣ|w|</td><td>Drives some weights to exactly 0 (feature selection)</td></tr>
    <tr><td>Elastic net</td><td>both</td><td>Sparse but stable with correlated features</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>With Adam, adding λ‖w‖² to the loss is <em>not</em> the same as weight decay: the 2λw gets divided by √v like everything else, so weights with large gradients are barely regularised. AdamW decays weights directly, which is why AdamW is the default.</p>
  </div>

  <h2 id="mop-scale"><span class="num">09</span>Why Feature Scaling Speeds Up GD</h2>
  <p>House prices from area (500–3000 sq ft) and rooms (1–5). The area numbers are about 1000× bigger. In the loss landscape, that makes the area direction 1000× steeper than the rooms direction: a long, thin canyon instead of a round bowl. Section 03 said the safe lr is set by the steepest direction. So the lr must be tiny for area, and then it crawls along rooms.</p>
  <figure class="viz"><svg viewBox="0 0 540 175" width="540">
    <ellipse cx="140" cy="80" rx="125" ry="22" fill="none" stroke="currentColor" opacity="0.35"/><ellipse cx="140" cy="80" rx="70" ry="12" fill="none" stroke="currentColor" opacity="0.5"/>
    <polyline points="30,62 42,98 58,64 74,96 92,66 108,92 122,70 132,86 140,80" fill="none" class="sr" stroke-width="2"/>
    <text x="40" y="140" class="tr">unscaled: narrow valley, zig-zag</text>
    <circle cx="390" cy="80" r="62" fill="none" stroke="currentColor" opacity="0.35"/><circle cx="390" cy="80" r="32" fill="none" stroke="currentColor" opacity="0.5"/>
    <line x1="345" y1="40" x2="390" y2="80" class="sg" stroke-width="2.5"/><circle cx="390" cy="80" r="3" fill="currentColor"/>
    <text x="290" y="165" class="tg">scaled: round bowl, straight in</text>
  </svg><figcaption>Unscaled features stretch the loss bowl. The gradient points across the valley, not along it, so GD bounces between the walls.</figcaption></figure>
  <p><strong>Standardising</strong> a column means: subtract its mean, divide by its standard deviation, so every column has mean 0 and spread 1. Then the bowl is round.</p>
  <div class="fx" data-lang="py">np.seterr(all="ignore")                       # hide overflow warnings
rng = np.random.default_rng(0)
n = 200
area  = rng.uniform(500, 3000, n)              # sq ft: range ~2500
rooms = rng.integers(1, 6, n).astype(float)    # range ~4
y = 0.1 * area + 20 * rooms + rng.normal(0, 10, n)
X = np.column_stack([area, rooms])

def gd(X, y, lr, steps=5000):
    Xb = np.column_stack([np.ones(len(X)), X])
    w = np.zeros(Xb.shape[1])
    best = np.mean((Xb @ np.linalg.lstsq(Xb, y, rcond=None)[0] - y) ** 2)
    for t in range(1, steps + 1):
        w -= lr * 2 * Xb.T @ (Xb @ w - y) / len(y)
        L = np.mean((Xb @ w - y) ** 2)
        if not np.isfinite(L): return "diverged"
        if L &lt; best * 1.01: return t
    return f"not done after {steps}, loss {L:.0f} vs best {best:.0f}"

Xs = (X - X.mean(0)) / X.std(0)                # standardise
print("raw   lr=1e-7:", gd(X, y, 1e-7))
print("raw   lr=1e-6:", gd(X, y, 1e-6))
print("scaled lr=0.1:", gd(Xs, y, 0.1))
H = lambda A: np.linalg.cond(np.column_stack([np.ones(n), A]).T @ np.column_stack([np.ones(n), A]))
print(f"condition number raw={H(X):.1e}  scaled={H(Xs):.1f}")</div>
  <div class="fx" data-lang="text">raw   lr=1e-7: not done after 5000, loss 1248 vs best 98
raw   lr=1e-6: diverged
scaled lr=0.1: 25
condition number raw=4.2e+07  scaled=1.3</div>
  <p>Raw: lr = 1e-7 is still not done after 5000 steps, and lr = 1e-6 already explodes on the area direction. Scaled: done in 25 steps with lr = 0.1. The <strong>condition number</strong> (steepest curvature ÷ flattest curvature; 1 = perfectly round) dropped from 42 million to 1.3.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Fit the scaler on the training set only, then apply it to validation and test. Fitting on all data leaks test statistics into training. Tree models don't need scaling (they split on thresholds, and "area &gt; 1200" works at any scale); GD-trained and distance-based models do.</p>
  </div>

  <h2 id="mop-qa"><span class="num">10</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Data: x = 1, 2, 3 and y = 2, 4, 6, model y = wx. At w = 0 the gradient of MSE is −18.67. With lr = 0.1, what is the next w, and why does it move right?</summary><div class="qa-body">w = 0 − 0.1 × (−18.67) = 1.867. The gradient is negative, meaning loss falls as w increases, so stepping against the gradient means increasing w. The minimum is at w = 2.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write one gradient-descent step for linear regression with MSE.</summary><div class="qa-body"><code>err = X @ w - y; w -= lr * 2 * X.T @ err / n</code>. The gradient of mean((Xw − y)²) is (2/n)Xᵀ(Xw − y).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your training loss becomes NaN after a few iterations. What do you check first?</summary><div class="qa-body">Learning rate too high (cut it 10×). Then: unscaled features, log(0) or division by zero in the loss, exploding gradients (add gradient clipping), and bad input values (NaN or inf in data).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is mini-batch gradient descent the default?</summary><div class="qa-body">Full batch gives one update per epoch and needs all data in memory. Pure SGD can't use GPU parallelism and is very noisy. Mini-batches give many updates per epoch, vectorise well, and add a little noise that helps escape saddles.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a saddle point and why does it matter more than local minima in deep learning?</summary><div class="qa-body">A point where the gradient is zero but the surface curves up in some directions and down in others. In high dimensions, zero-gradient points are overwhelmingly saddles. GD slows to a crawl near them; noise and momentum help it slide off.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Is logistic regression's loss convex? A neural network's?</summary><div class="qa-body">Logistic regression with cross-entropy: yes, so GD finds the global minimum. A neural network: no. Hidden-layer nonlinearities and weight symmetries (swap two hidden units, same function) create many minima.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain momentum with an analogy.</summary><div class="qa-body">A heavy ball rolling downhill. It keeps a running sum of past gradients, so steps that flip sign (zig-zag across a valley) cancel, and steps that agree (along the valley) add up and accelerate. With β = 0.9, six agreeing gradients of 1 build v up to 4.7, heading for 10.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does Adam do that SGD with momentum doesn't? Why bias correction?</summary><div class="qa-body">It also tracks the mean squared gradient per weight and divides by its square root, giving every weight its own step size. m and v start at 0, so early averages are biased toward 0; dividing by (1−βᵗ) fixes that in the first steps.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Adam vs AdamW?</summary><div class="qa-body">Adam with L2 adds λw to the gradient, which then gets divided by √v, so heavily-updated weights are barely regularised. AdamW applies decay separately: <code>w −= lr·λ·w</code>. It generalises better and is the standard for transformers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why use learning-rate warmup?</summary><div class="qa-body">Early on, weights are random and Adam's variance estimates rest on very few samples, so full-size steps can be wild and destabilise training. Ramping lr up over the first few hundred or thousand steps avoids that.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does feature scaling speed up gradient descent? Does a random forest need it?</summary><div class="qa-body">Features on different scales stretch the loss bowl into a narrow valley (high condition number). One lr can't suit both directions: GD zig-zags or diverges. Standardising makes the bowl round. Trees split on thresholds, which don't depend on scale, so they don't need it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does L2 regularization show up in the gradient update?</summary><div class="qa-body">Loss + λ‖w‖² adds 2λw to the gradient, so <code>w ← w − lr(∇L + 2λw) = (1 − 2·lr·λ)w − lr∇L</code>. Every step multiplies the weights by slightly less than 1: weight decay.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Training loss falls but stays on a plateau well above zero. Three things to try.</summary><div class="qa-body">(1) Decay the lr or use a schedule, to settle into the minimum. (2) Check the floor is not just noise (irreducible error, like 0.25 in our regression). (3) If the model is underfitting: more capacity, better features, less regularization.</div></details>
</main>`
});
