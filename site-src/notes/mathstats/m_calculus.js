// notes/mathstats/m_calculus.js — Calculus
Object.assign(TOPIC_CONTENT, {
  "m_calculus": `<main>
  <h1>Calculus</h1>
  <p class="lead">Training a model means nudging weights so the loss goes down. Calculus tells you which way is down and how steep it is. This page covers only what ML uses: derivatives, gradients, the chain rule (which <em>is</em> backprop), curvature, and how to check a gradient in numpy.</p>

  <h2 id="mca-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Calculus for ML</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Derivative</div>
        <ul>
          <li><b>f′(x)</b> = lim (f(x+h) − f(x))/h — slope at a point; change per tiny nudge</li>
          <li><b>Secant → tangent</b> — x² at 3: h=1 → 7, h=0.1 → 6.1, h→0 → 6</li>
          <li><b>Sign</b> = direction, <b>size</b> = sensitivity, <b>zero</b> = flat (min / max / plateau)</li>
          <li><b>ML</b> — dLoss/dWeight: which way and how hard to move each weight</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Rules you need</div>
        <ul>
          <li><b>Power</b> — (xⁿ)′ = nxⁿ⁻¹; MSE: ((ŷ−y)²)′ = 2(ŷ−y)</li>
          <li><b>Sum / constant</b> — differentiate each loss term separately (data + λ‖w‖²)</li>
          <li><b>Product</b> — (fg)′ = f′g + fg′ (LSTM gates)</li>
          <li><b>Chain</b> — f(g(x))′ = f′(g(x))·g′(x)</li>
          <li><b>Exp / log</b> — (eˣ)′ = eˣ, (ln x)′ = 1/x (softmax, cross-entropy)</li>
          <li><b>Sigmoid</b> — σ′ = σ(1−σ), max 0.25 at z=0, ≈0.0025 at z=6</li>
          <li><b>ReLU</b> — slope 1 if x &gt; 0 else 0</li>
          <li>⚠ Saturated sigmoid slopes multiply through layers → vanishing gradients → use ReLU</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Partials &amp; gradient</div>
        <ul>
          <li><b>∂f/∂x</b> — slope along x, all other inputs frozen</li>
          <li><b>∇f</b> — vector of partials; points steepest <em>uphill</em>, length = steepness</li>
          <li><b>Example</b> — f = x² + 3y² at (1,1): ∇f = (2, 6); perpendicular to contours</li>
          <li><b>Gradient descent</b> — step along −∇f: <code>w ← w − lr·∇L</code></li>
          <li>💡 foggy hill: you feel only the local slope, not where the valley is</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Chain rule = backprop</div>
        <ul>
          <li><b>dL/dw = dL/dy · dy/dw</b> — rates multiply along the path</li>
          <li><b>Forward pass</b> — compute + store every intermediate (z, h, ŷ, L)</li>
          <li><b>Backward pass</b> — right to left, reuse upstream gradient; cost ≈ 2× forward</li>
          <li><b>Worked example</b> — x=2, y=1, w₁=0.5, w₂=3 → L=4, ∂L/∂w₂=4, ∂L/∂w₁=24</li>
          <li><b>Memory</b> — stored activations: why training needs far more memory than inference</li>
          <li><b>PyTorch</b> — <code>loss.backward()</code> does exactly this on the graph</li>
          <li>⚠ <b>Dead ReLU</b> — z ≤ 0 → slope 0 → weight never updates; Leaky ReLU fixes</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Jacobian &amp; Hessian</div>
        <ul>
          <li><b>Gradient</b> — scalar out, vector in; shape (n,)</li>
          <li><b>Jacobian</b> — vector out; (outputs × inputs), row i = ∇ of output i</li>
          <li><b>Dense layer z = Wx</b> — Jacobian wrt x is W; backprop: ∂L/∂x = Wᵀ ∂L/∂z</li>
          <li><b>Hessian</b> — second derivatives, (n×n) symmetric = curvature</li>
          <li><b>At ∇ = 0</b> — eigvals all + → min, all − → max, mixed → saddle</li>
          <li><b>Condition number</b> — max/min eigval; big → GD zig-zags in narrow valley</li>
          <li><b>Newton</b> — uses H⁻¹; n² entries + O(n³) solve, likes saddles → deep learning uses SGD/Adam</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Gradient checking</div>
        <ul>
          <li><b>Analytical</b> (formula / autograd) — exact, ≈ 1 backward pass; used for training</li>
          <li><b>Numerical</b> — finite differences, 2 loss evals <em>per parameter</em>; used to test</li>
          <li><b>Central diff</b> — (f(x+h) − f(x−h))/2h, error O(h²) vs forward O(h)</li>
          <li><b>h ≈ 1e-5</b> in float64; too small → rounding error wins</li>
          <li><b>Relative error</b> — ‖a−b‖/(‖a‖+‖b‖): &lt;1e-7 correct, ~1e-4 suspicious (kinks), &gt;1e-2 bug</li>
          <li><b>Setup</b> — float64, tiny batch, dropout/randomness off</li>
          <li><b>Logistic-reg gradient</b> — <code>Xᵀ(σ(Xw) − y)/n</code>; forgetting <code>/n</code> → rel. err 0.96</li>
        </ul>
      </div>
    </div>
  </div>


  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mca-der"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Derivatives</span><span class="rm-sub">Slope at a single point</span></div></div>
      <div class="rm-item rm-done" data-target="mca-rules"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Rules You Need</span><span class="rm-sub">Seven rules cover ML</span></div></div>
      <div class="rm-item rm-done" data-target="mca-grad"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Partials &amp; Gradient</span><span class="rm-sub">Steepest uphill arrow</span></div></div>
      <div class="rm-item rm-done" data-target="mca-chain"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Chain Rule = Backprop</span><span class="rm-sub">A 2-layer net by hand</span></div></div>
      <div class="rm-item rm-done" data-target="mca-jh"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Jacobian &amp; Hessian</span><span class="rm-sub">Many outputs; curvature</span></div></div>
      <div class="rm-item rm-done" data-target="mca-num"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Gradient Checking</span><span class="rm-sub">Numerical vs analytical</span></div></div>
      <div class="rm-item rm-done" data-target="mca-qa"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="mca-der"><span class="num">01</span>Derivatives: Slope at a Point</h2>
  <figure class="viz"><svg viewBox="0 0 400 220" width="400">
    <line x1="40" y1="200" x2="320" y2="200" stroke="currentColor" opacity="0.4"/><line x1="40" y1="200" x2="40" y2="5" stroke="currentColor" opacity="0.4"/>
    <polyline points="40,200 52,199.6 64,198.2 76,196 88,193 100,189 112,184.2 124,178.4 136,171.8 148,164.4 160,156 172,146.8 184,136.6 196,125.6 208,113.8 220,101 232,87.4 244,72.8 256,57.4 268,41.2 280,24 292,6" fill="none" class="sb" stroke-width="2.5"/>
    <line x1="150" y1="178" x2="290" y2="24" class="sr" stroke-width="2"/>
    <line x1="220" y1="101" x2="280" y2="24" stroke="currentColor" stroke-dasharray="4 3"/>
    <circle cx="220" cy="101" r="4" class="fr sr"/><circle cx="280" cy="24" r="3" fill="currentColor"/>
    <text x="226" y="112">x = 3</text>
    <text x="150" y="30" class="tr">tangent: slope 6</text>
    <text x="290" y="40" class="tm">secant h=1: 7</text>
    <text x="250" y="150" class="tb">f(x) = x²</text>
  </svg><figcaption>Shrink the gap h and the secant (dashed) turns into the tangent (red). Its slope is the derivative.</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>f′(x) = lim (f(x+h) − f(x)) / h</code> as h → 0. In words: if I nudge x a tiny bit, how much does f move, per unit of nudge?</p>
  </div>
  <div class="fx" data-lang="py">f = lambda x: x**2
for h in [1, 0.1, 0.001]:
    print(h, round((f(3 + h) - f(3)) / h, 4))   # secant slope -&gt; 6</div>
  <div class="fx" data-lang="text">1 7.0
0.1 6.1
0.001 6.001</div>
  <ul>
    <li><strong>Sign</strong> = which way f goes. <strong>Size</strong> = how sensitive. <strong>Zero</strong> = flat spot (minimum, maximum or plateau).</li>
    <li><strong>Where in ML:</strong> dLoss/dWeight tells training which way to move each weight and how hard.</li>
  </ul>

  <h2 id="mca-rules"><span class="num">02</span>Rules You Actually Need</h2>
  <table class="tbl">
    <tr><th>Rule</th><th>Formula</th><th>ML example</th></tr>
    <tr><td>Power</td><td>(xⁿ)′ = n xⁿ⁻¹</td><td>MSE: ((ŷ−y)²)′ = 2(ŷ−y)</td></tr>
    <tr><td>Constant × / sum</td><td>(cf + g)′ = cf′ + g′</td><td>Loss = data loss + λ‖w‖²: differentiate each part</td></tr>
    <tr><td>Product</td><td>(fg)′ = f′g + fg′</td><td>Gates in LSTMs</td></tr>
    <tr><td>Chain</td><td>f(g(x))′ = f′(g(x)) · g′(x)</td><td>Every layer of backprop</td></tr>
    <tr><td>Exp / log</td><td>(eˣ)′ = eˣ, (ln x)′ = 1/x</td><td>Softmax, cross-entropy</td></tr>
    <tr><td>Sigmoid</td><td>σ′ = σ(1 − σ)</td><td>Logistic regression</td></tr>
    <tr><td>ReLU</td><td>1 if x &gt; 0 else 0</td><td>Most hidden layers</td></tr>
  </table>
  <div class="fx" data-lang="py">import numpy as np
sig = lambda z: 1 / (1 + np.exp(-z))
z, h = 0.5, 1e-5
print(round((sig(z + h) - sig(z - h)) / (2 * h), 6),   # numeric
      round(sig(z) * (1 - sig(z)), 6))                 # rule
print(round(sig(0) * (1 - sig(0)), 3), round(sig(6) * (1 - sig(6)), 4))</div>
  <div class="fx" data-lang="text">0.235004 0.235004
0.25 0.0025</div>
  <div class="callout intu"><span class="label">Why it matters</span>
    <p>Sigmoid's slope is at most 0.25 and nearly 0 once saturated (z=6 → 0.0025). Multiply a few of those through deep layers and the gradient vanishes. That's why hidden layers use ReLU.</p>
  </div>

  <h2 id="mca-grad"><span class="num">03</span>Partial Derivatives &amp; the Gradient</h2>
  <figure class="viz"><svg viewBox="0 0 400 220" width="400">
    <defs><marker id="mca-ah1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr"/></marker>
    <marker id="mca-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tg"/></marker></defs>
    <ellipse cx="160" cy="110" rx="120" ry="69" fill="none" stroke="currentColor" opacity="0.35"/>
    <ellipse cx="160" cy="110" rx="80" ry="46" fill="none" stroke="currentColor" opacity="0.6"/>
    <ellipse cx="160" cy="110" rx="40" ry="23" fill="none" stroke="currentColor" opacity="0.35"/>
    <circle cx="160" cy="110" r="3" fill="currentColor"/><text x="140" y="128" class="tm">min</text>
    <circle cx="200" cy="64" r="4" class="fr sr"/>
    <line x1="200" y1="64" x2="216" y2="18" class="sr" stroke-width="2.5" marker-end="url(#mca-ah1)"/>
    <line x1="200" y1="64" x2="184" y2="110" class="sg" stroke-width="2.5" stroke-dasharray="5 3" marker-end="url(#mca-ah2)"/>
    <text x="222" y="22" class="tr">∇f = (2, 6): uphill</text>
    <text x="205" y="80">(1, 1), f = 4</text>
    <text x="80" y="200" class="tg">−∇f: what gradient descent follows</text>
  </svg><figcaption>Contour lines of f(x,y) = x² + 3y². The gradient points straight across them, uphill; it is steeper in y because of the 3.</figcaption></figure>
  <ul>
    <li><strong>Partial derivative ∂f/∂x</strong>: slope along x while every other variable is frozen.</li>
    <li><strong>Gradient ∇f</strong>: all partials stacked in a vector. It points in the direction of steepest ascent; its length is that steepness.</li>
  </ul>
  <div class="fx" data-lang="py">f    = lambda p: p[0]**2 + 3 * p[1]**2
grad = lambda p: np.array([2 * p[0], 6 * p[1]])
p = np.array([1.0, 1.0]); g = grad(p)
print(f(p), g)
u = g / np.linalg.norm(g)
for name, d in [("along grad", u), ("along x", np.array([1., 0.])), ("against grad", -u)]:
    print(name, round(f(p + 0.01 * d) - f(p), 4))      # step of length 0.01</div>
  <div class="fx" data-lang="text">4.0 [2. 6.]
along grad 0.0635
along x 0.0201
against grad -0.063</div>
  <p>Same step length, three directions: the gradient direction raises f the most, and its opposite lowers it the most.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Standing on a foggy hill, you feel the ground under your feet. The gradient is "the steepest way up from here". It says nothing about where the valley floor is, only the local slope.</p>
  </div>

  <h2 id="mca-chain"><span class="num">04</span>Chain Rule = Backpropagation</h2>
  <div class="callout def"><span class="label">Chain rule</span>
    <p>If L depends on y and y depends on w, then <code>dL/dw = dL/dy · dy/dw</code>. Rates multiply along the path.</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 610 150" width="610">
    <defs><marker id="mca-ah3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g stroke="currentColor" marker-end="url(#mca-ah3)"><line x1="42" y1="60" x2="68" y2="60"/><line x1="128" y1="60" x2="154" y2="60"/><line x1="214" y1="60" x2="240" y2="60"/><line x1="300" y1="60" x2="326" y2="60"/><line x1="386" y1="60" x2="412" y2="60"/><line x1="492" y1="60" x2="518" y2="60"/></g>
    <text x="10" y="64">x</text>
    <rect x="70" y="42" width="56" height="36" rx="6" class="fs" stroke="currentColor"/><text x="80" y="64">× w₁</text>
    <text x="178" y="64">z</text>
    <rect x="242" y="42" width="56" height="36" rx="6" class="fs" stroke="currentColor"/><text x="250" y="64">ReLU</text>
    <rect x="328" y="42" width="56" height="36" rx="6" class="fs" stroke="currentColor"/><text x="338" y="64">× w₂</text>
    <rect x="414" y="42" width="76" height="36" rx="6" class="fs" stroke="currentColor"/><text x="420" y="64">(ŷ−y)²</text>
    <text x="524" y="64">L</text>
    <text x="308" y="54">h</text><text x="394" y="54">ŷ</text>
    <text x="4" y="16" class="tb" font-size="11">forward values:</text>
    <text x="10" y="34" class="tb">2</text><text x="178" y="34" class="tb">1</text><text x="308" y="34" class="tb">1</text><text x="394" y="34" class="tb">3</text><text x="524" y="34" class="tb">4</text>
    <text x="70" y="102" class="tr" font-size="11">∂L/∂w₁=24</text><text x="150" y="122" class="tr" font-size="11">∂L/∂z=12</text><text x="270" y="122" class="tr" font-size="11">∂L/∂h=12</text>
    <text x="330" y="102" class="tr" font-size="11">∂L/∂w₂=4</text><text x="400" y="122" class="tr" font-size="11">∂L/∂ŷ=4</text><text x="520" y="102" class="tr" font-size="11">1</text>
    <text x="4" y="144" class="tr" font-size="11">backward gradients ←</text>
  </svg><figcaption>Forward pass (blue) computes values left to right. Backward pass (red) multiplies local slopes right to left.</figcaption></figure>
  <p>One example: x = 2, target y = 1, weights w₁ = 0.5, w₂ = 3.</p>
  <div class="fx" data-lang="py">x, y = 2.0, 1.0
w1, w2 = 0.5, 3.0
def loss(w1, w2):
    h = max(w1 * x, 0)
    return (w2 * h - y) ** 2

# forward
z = w1 * x; h = max(z, 0); yhat = w2 * h; L = (yhat - y) ** 2
print("forward:", z, h, yhat, L)

# backward: chain rule, right to left, reusing each upstream gradient
dL_dyhat = 2 * (yhat - y)                 # power rule
dL_dw2   = dL_dyhat * h                   # yhat = w2*h
dL_dh    = dL_dyhat * w2
dL_dz    = dL_dh * (1 if z &gt; 0 else 0)    # ReLU slope
dL_dw1   = dL_dz * x                      # z = w1*x
print("backward:", dL_dw2, dL_dw1)

e = 1e-6                                  # check numerically
print("numeric:", round((loss(w1, w2 + e) - loss(w1, w2 - e)) / (2 * e), 4),
                  round((loss(w1 + e, w2) - loss(w1 - e, w2)) / (2 * e), 4))</div>
  <div class="fx" data-lang="text">forward: 1.0 1.0 3.0 4.0
backward: 4.0 24.0
numeric: 4.0 24.0</div>
  <ul>
    <li><strong>Backprop</strong> = chain rule applied right to left, storing each upstream gradient so it is computed once. Cost ≈ 2× a forward pass, whatever the number of weights.</li>
    <li>Forward values (z, h) are needed in the backward pass. That's why training uses far more memory than inference.</li>
    <li>PyTorch's <code>loss.backward()</code> builds this graph and does exactly these multiplications.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>If z ≤ 0 the ReLU slope is 0, so ∂L/∂w₁ = 0 and w₁ never updates. Many such units = "dead ReLUs". Leaky ReLU keeps a small slope.</p>
  </div>

  <h2 id="mca-jh"><span class="num">05</span>Jacobian &amp; Hessian</h2>
  <div class="cards">
    <div><b>Gradient</b><p>Scalar out, vector in. One slope per input.</p><small>Shape: (n,)</small></div>
    <div><b>Jacobian J</b><p>Vector out. Row i = gradient of output i.</p><small>Shape: (outputs × inputs)</small></div>
    <div><b>Hessian H</b><p>Second derivatives: how the gradient itself changes.</p><small>Shape: (n × n), symmetric</small></div>
  </div>
  <div class="fx" data-lang="py">def f(p): return np.array([p[0] * p[1], p[0] + p[1]**2])
def jacobian(f, p, h=1e-6):
    J = np.zeros((len(f(p)), len(p)))
    for j in range(len(p)):
        e = np.zeros(len(p)); e[j] = h
        J[:, j] = (f(p + e) - f(p - e)) / (2 * h)
    return J
print(jacobian(f, np.array([2., 3.])))   # analytic [[y, x], [1, 2y]]

H_bowl   = np.array([[2., 0.], [0., 6.]])     # f = x² + 3y²
H_saddle = np.array([[2., 0.], [0., -2.]])    # f = x² − y²
print(np.linalg.eigvalsh(H_bowl), np.linalg.eigvalsh(H_saddle))</div>
  <div class="fx" data-lang="text">[[3. 2.]
 [1. 6.]]
[2. 6.] [-2.  2.]</div>
  <figure class="viz"><svg viewBox="0 0 470 120" width="470">
    <path d="M20,20 Q70,140 120,20" fill="none" class="sg" stroke-width="2.5"/><text x="20" y="112" class="tg">all λ &gt; 0: minimum</text>
    <path d="M170,90 Q220,-30 270,90" fill="none" class="sr" stroke-width="2.5"/><text x="170" y="112" class="tr">all λ &lt; 0: maximum</text>
    <path d="M320,20 Q370,140 420,20" fill="none" class="sg" stroke-width="2"/><path d="M320,90 Q370,-30 420,90" fill="none" class="sr" stroke-width="2"/><text x="320" y="112">mixed signs: saddle</text>
  </svg><figcaption>Hessian eigenvalues = curvature along each principal direction. Mixed signs mean "valley one way, ridge the other".</figcaption></figure>
  <ul>
    <li><strong>Jacobian in ML:</strong> backprop through a vector layer multiplies Jacobians; normalising flows use its determinant.</li>
    <li><strong>Hessian in ML:</strong> the ratio of largest to smallest eigenvalue (condition number) sets how badly GD zig-zags. Here 6/2 = 3, mild. Newton's method uses H⁻¹, but for n weights H has n² entries, so deep learning uses first-order methods instead.</li>
  </ul>

  <h2 id="mca-num"><span class="num">06</span>Numerical vs Analytical Gradients</h2>
  <table class="tbl">
    <tr><th></th><th>Analytical (formula / autograd)</th><th>Numerical (finite differences)</th></tr>
    <tr><td>Cost</td><td>≈ 1 backward pass</td><td>2 loss evaluations <em>per parameter</em></td></tr>
    <tr><td>Accuracy</td><td>Exact (up to float error)</td><td>Approximate; depends on h</td></tr>
    <tr><td>Use</td><td>Training</td><td>Testing that the analytical one is right</td></tr>
  </table>
  <div class="fx" data-lang="py">f, x, true = np.exp, 1.0, np.exp(1.0)
for h in [1e-2, 1e-5, 1e-8, 1e-12]:
    fwd = (f(x + h) - f(x)) / h
    ctr = (f(x + h) - f(x - h)) / (2 * h)
    print(f"h={h:.0e}  forward err={abs(fwd - true):.1e}  central err={abs(ctr - true):.1e}")</div>
  <div class="fx" data-lang="text">h=1e-02  forward err=1.4e-02  central err=4.5e-05
h=1e-05  forward err=1.4e-05  central err=5.9e-11
h=1e-08  forward err=6.6e-09  central err=6.6e-09
h=1e-12  forward err=4.3e-04  central err=2.1e-04</div>
  <p>Central differences are far more accurate (error ∝ h² vs h). Too small an h fails too: float rounding takes over. Use h ≈ 1e-5 with float64.</p>
  <h3>Build it: gradient check for logistic regression</h3>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
X = rng.normal(size=(50, 3)); y = (rng.random(50) &gt; 0.5).astype(float)
w = rng.normal(size=3)

def loss(w):                               # cross-entropy
    p = sig(X @ w)
    return -np.mean(y * np.log(p) + (1 - y) * np.log(1 - p))
def grad(w):                               # analytic
    return X.T @ (sig(X @ w) - y) / len(y)
def num_grad(w, h=1e-5):                   # central differences
    g = np.zeros_like(w)
    for i in range(len(w)):
        e = np.zeros_like(w); e[i] = h
        g[i] = (loss(w + e) - loss(w - e)) / (2 * h)
    return g
def rel_err(a, b):
    return np.linalg.norm(a - b) / (np.linalg.norm(a) + np.linalg.norm(b))

ga, gn = grad(w), num_grad(w)
print(np.round(ga, 6)); print(np.round(gn, 6))
print(f"relative error: {rel_err(ga, gn):.1e}")
bad = X.T @ (sig(X @ w) - y)               # bug: forgot / len(y)
print(f"buggy relative error: {rel_err(bad, gn):.1e}")</div>
  <div class="fx" data-lang="text">[-0.10364  -0.220886 -0.295992]
[-0.10364  -0.220886 -0.295992]
relative error: 2.1e-11
buggy relative error: 9.6e-01</div>
  <div class="callout intu"><span class="label">Reading the number</span>
    <p>Relative error &lt; 1e-7: correct. Around 1e-4: suspicious (check kinks like ReLU at 0). &gt; 1e-2: a bug. Run checks in float64, on a few samples, with dropout and other randomness switched off.</p>
  </div>

  <h2 id="mca-qa"><span class="num">07</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What does the gradient tell you, and why do we step in its negative direction?</summary><div class="qa-body">It's the vector of partial derivatives; it points where the function rises fastest, and its length is how fast. We minimise loss, so we step the opposite way: <code>w ← w − lr·∇L</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the derivative of the sigmoid.</summary><div class="qa-body">σ = (1+e⁻ᶻ)⁻¹. Chain rule: σ′ = e⁻ᶻ/(1+e⁻ᶻ)² = σ · (e⁻ᶻ/(1+e⁻ᶻ)) = σ(1−σ). Maximum 0.25 at z = 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain backpropagation in two sentences.</summary><div class="qa-body">A forward pass computes and stores every intermediate value. The backward pass applies the chain rule from the loss back to each weight, multiplying local derivatives and reusing upstream gradients, so all gradients cost about one extra forward pass.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In the 2-layer example (x=2, y=1, w₁=0.5, w₂=3, ReLU), what is ∂L/∂w₁ if w₁ = −0.5 instead?</summary><div class="qa-body">0. Then z = −1, ReLU outputs 0 and its slope is 0, so the chain is cut. w₁ gets no update: a dead ReLU for this input.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do sigmoid networks suffer from vanishing gradients?</summary><div class="qa-body">Backprop multiplies one σ′ per layer, and σ′ ≤ 0.25 (≈0 when saturated). Ten layers gives at most 0.25¹⁰ ≈ 1e-6, so early layers barely learn. ReLU (slope 1), careful initialisation, normalisation and residual connections fix it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the Jacobian of a dense layer z = Wx with respect to x?</summary><div class="qa-body">W itself (shape out × in). Backprop multiplies the upstream gradient by it: ∂L/∂x = Wᵀ ∂L/∂z.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the Hessian tell you at a point where the gradient is zero?</summary><div class="qa-body">Its eigenvalues classify the point: all positive → local minimum, all negative → maximum, mixed → saddle. Large spread in magnitudes → long narrow valley, slow for gradient descent.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why don't we use Newton's method to train neural nets?</summary><div class="qa-body">It needs the Hessian: n² entries and an O(n³) solve. With 10⁸ weights that's impossible. It also heads toward saddles as happily as minima. We use first-order methods (SGD, Adam) that only need gradients.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you gradient-check a custom layer, and what h do you use?</summary><div class="qa-body">Compare autograd's gradient with central differences <code>(L(w+h) − L(w−h))/2h</code> for each parameter, using float64, h ≈ 1e-5, a tiny batch and no randomness. Relative error &lt; 1e-7 passes. Too-small h fails from rounding error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is the central difference better than the forward difference?</summary><div class="qa-body">Taylor expansion: the forward difference error is O(h); in the central version the second-order terms cancel, leaving O(h²). Our run: at h = 1e-5, 1.4e-5 vs 5.9e-11.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>f = lambda x: 3*x**2; print((f(2+1e-6) - f(2-1e-6)) / 2e-6)</code> </summary><div class="qa-body"><code>12.000000000789157</code>. The derivative of 3x² is 6x = 12 at x = 2; the tail digits are float rounding error.</div></details>
</main>`
});
