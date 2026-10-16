// notes/mathstats/m_calculus.js — Calculus
Object.assign(TOPIC_CONTENT, {
  "m_calculus": `<main>
  <h1>Calculus</h1>
  <p class="lead">Calculus is the maths of change: how fast something moves, and which way is downhill. Training a model means nudging its weights so the loss goes down, and calculus is what tells you which way and how hard to nudge. This page covers only what ML uses: derivatives, gradients, the chain rule (which <em>is</em> backprop), curvature, and how to check a gradient in numpy. Every idea starts with a picture and small numbers before any formula.</p>

  <h2 id="mca-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Calculus for ML</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Derivative</div>
        <ul>
          <li><b>What</b> — slope at one point: how much the output moves per tiny nudge of the input</li>
          <li><b>f′(x)</b> = lim (f(x+h) − f(x))/h as h → 0</li>
          <li><b>Secant → tangent</b> — x² at 3: h=1 → 7, h=0.1 → 6.1, h→0 → 6</li>
          <li><b>Sign</b> = direction, <b>size</b> = sensitivity, <b>zero</b> = flat (min / max / plateau)</li>
          <li>💡 speedometer: distance 5t² → speed at t=2 is 20 m/s</li>
          <li><b>ML</b> — dLoss/dWeight: which way and how hard to move each weight</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Rules you need</div>
        <ul>
          <li><b>Power</b> — (xⁿ)′ = nxⁿ⁻¹; MSE: ((ŷ−y)²)′ = 2(ŷ−y)</li>
          <li><b>Sum / constant</b> — differentiate each loss term separately (data + λ‖w‖²)</li>
          <li><b>Product</b> — (fg)′ = f′g + fg′ (LSTM gates)</li>
          <li><b>Chain</b> — f(g(x))′ = f′(g(x))·g′(x); rates multiply</li>
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
          <li>💡 petrol: 0.08 L per km × ₹105 per L = ₹8.4 per km</li>
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
          <li><b>Hessian</b> — second derivatives, (n×n) symmetric = curvature (how the slope changes)</li>
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
  <p>A ball rolls down a slope. After t seconds it has gone 5t² metres: 5 m after 1 s, 20 m after 2 s, 45 m after 3 s. It is speeding up. Question: how fast is it going at <em>exactly</em> t = 2?</p>
  <p>Speed is distance ÷ time. But at one instant, no time passes and no distance is covered, so 0 ÷ 0 tells you nothing. The trick is to take a short gap after t = 2, measure the average speed over that gap, then make the gap smaller and smaller.</p>
  <ul>
    <li>Gap of 1 s: from 20 m (t=2) to 45 m (t=3). Average speed = 25 / 1 = <strong>25 m/s</strong>.</li>
    <li>Gap of 0.1 s: 5 × 2.1² = 22.05 m. (22.05 − 20) / 0.1 = <strong>20.5 m/s</strong>.</li>
    <li>Gap of 0.01 s: 5 × 2.01² = 20.2005 m. (20.2005 − 20) / 0.01 = <strong>20.05 m/s</strong>.</li>
  </ul>
  <p>The answers settle towards 20. The speed at exactly t = 2 is 20 m/s. This settled value is the <strong>derivative</strong>: the rate of change at one point. On a graph it is the slope of the curve right there.</p>
  <div class="fx" data-lang="py">dist = lambda t: 5 * t**2          # metres after t seconds
for h in [1, 0.1, 0.01]:
    print(h, round((dist(2 + h) - dist(2)) / h, 4))   # average speed over a short gap</div>
  <div class="fx" data-lang="text">1 25.0
0.1 20.5
0.01 20.05</div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A car's trip meter gives distance; the speedometer gives the derivative of that distance. You never see the speedometer compute "distance over zero seconds"; it reports the limit the short gaps settle to.</p>
  </div>
  <p>The same picture with the simpler curve f(x) = x² at x = 3. The line through two points on the curve (a <strong>secant</strong>) tilts closer and closer to the line that just touches the curve (the <strong>tangent</strong>). The tangent's slope, 6, is the derivative.</p>
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
  <div class="fx" data-lang="py">f = lambda x: x**2
for h in [1, 0.1, 0.001]:
    print(h, round((f(3 + h) - f(3)) / h, 4))   # secant slope -&gt; 6</div>
  <div class="fx" data-lang="text">1 7.0
0.1 6.1
0.001 6.001</div>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>f′(x) = lim (f(x+h) − f(x)) / h</code> as h → 0. Read it piece by piece: <code>f(x+h) − f(x)</code> is "how much the output changed", <code>/ h</code> is "per unit of input change", and <code>lim … h → 0</code> is "make the gap tiny and take the settled value". f′ is read "f prime"; dy/dx means the same thing.</p>
  </div>
  <p><strong>Reading a derivative:</strong></p>
  <ul>
    <li><strong>Sign</strong> = which way f goes. Positive: going up as x grows. Negative: going down.</li>
    <li><strong>Size</strong> = how sensitive. A derivative of 100 means a tiny nudge in x moves f a lot.</li>
    <li><strong>Zero</strong> = flat spot: the bottom of a valley (minimum), top of a hill (maximum), or a plateau.</li>
  </ul>
  <p><strong>Where in ML:</strong> the loss is a function of the weights. dLoss/dWeight tells training which way to move each weight (sign) and how hard (size). A derivative of zero means "you are at the bottom, stop".</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The derivative at x = 3 says nothing about x = 10. It is a <em>local</em> fact, the slope under your feet. That is exactly why gradient descent takes many small steps instead of one big jump.</p>
  </div>

  <h2 id="mca-rules"><span class="num">02</span>Rules You Actually Need</h2>
  <p>Computing a derivative from the limit every time is slow. Luckily a handful of shortcuts cover everything ML needs. The one you will use most is the <strong>power rule</strong>: for x², the slope is 2x (at x = 3 that is 6, matching section 01). For x³ it is 3x². Bring the power down in front, then lower the power by one.</p>
  <table class="tbl">
    <tr><th>Rule</th><th>Formula</th><th>In words</th><th>ML example</th></tr>
    <tr><td>Power</td><td>(xⁿ)′ = n xⁿ⁻¹</td><td>Power comes down, drops by one</td><td>MSE: ((ŷ−y)²)′ = 2(ŷ−y)</td></tr>
    <tr><td>Constant × / sum</td><td>(cf + g)′ = cf′ + g′</td><td>Constants stay; do each term separately</td><td>Loss = data loss + λ‖w‖²: differentiate each part</td></tr>
    <tr><td>Product</td><td>(fg)′ = f′g + fg′</td><td>Change one, hold the other, add both ways</td><td>Gates in LSTMs</td></tr>
    <tr><td>Chain</td><td>f(g(x))′ = f′(g(x)) · g′(x)</td><td>Rates of nested functions multiply</td><td>Every layer of backprop</td></tr>
    <tr><td>Exp / log</td><td>(eˣ)′ = eˣ, (ln x)′ = 1/x</td><td>eˣ is its own slope</td><td>Softmax, cross-entropy</td></tr>
    <tr><td>Sigmoid</td><td>σ′ = σ(1 − σ)</td><td>Slope from the value itself</td><td>Logistic regression</td></tr>
    <tr><td>ReLU</td><td>1 if x &gt; 0 else 0</td><td>Slope 1 on the right, flat on the left</td><td>Most hidden layers</td></tr>
  </table>
  <p>Here <code>ŷ</code> ("y hat") is the model's prediction and <code>y</code> the true answer. <code>σ</code> (sigma) is the <strong>sigmoid</strong>, the S-shaped function 1 / (1 + e⁻ᶻ) that squashes any number into 0 to 1; it turns a score into a probability.</p>
  <p>Trust but verify: the sigmoid rule against the slow limit method from section 01.</p>
  <div class="fx" data-lang="py">import numpy as np
sig = lambda z: 1 / (1 + np.exp(-z))
z, h = 0.5, 1e-5
print(round((sig(z + h) - sig(z - h)) / (2 * h), 6),   # numeric
      round(sig(z) * (1 - sig(z)), 6))                 # rule
print(round(sig(0) * (1 - sig(0)), 3), round(sig(6) * (1 - sig(6)), 4))</div>
  <div class="fx" data-lang="text">0.235004 0.235004
0.25 0.0025</div>
  <div class="callout intu"><span class="label">Why it matters</span>
    <p>Sigmoid's slope is at most 0.25 (at z = 0) and nearly 0 once the input is large (z = 6 → 0.0025): the S-curve has gone flat, called <strong>saturated</strong>. Backprop multiplies one such slope per layer. Multiply a few of those through deep layers and the gradient vanishes to almost nothing. That's why hidden layers use ReLU, whose slope is a solid 1.</p>
  </div>

  <h2 id="mca-grad"><span class="num">03</span>Partial Derivatives &amp; the Gradient</h2>
  <p>A chai stall's daily profit depends on two things: the price of a cup and the number of cups. Raising the price by ₹1 changes profit one way; selling 10 more cups changes it another. A function of two inputs has two slopes, one per input.</p>
  <p>Take f(x, y) = x² + 3y² at the point (1, 1), where f = 1 + 3 = 4.</p>
  <ul>
    <li>Nudge only x to 1.01, keep y = 1: f = 1.0201 + 3 = 4.0201. Change 0.0201 per 0.01 nudge → slope ≈ <strong>2</strong>.</li>
    <li>Nudge only y to 1.01, keep x = 1: f = 1 + 3 × 1.0201 = 4.0603. Change 0.0603 per 0.01 → slope ≈ <strong>6</strong>.</li>
  </ul>
  <div class="fx" data-lang="py">f = lambda x, y: x**2 + 3 * y**2
print(f(1, 1), f(1.01, 1), round((f(1.01, 1) - f(1, 1)) / 0.01, 4))
print(round((f(1, 1.01) - f(1, 1)) / 0.01, 4))</div>
  <div class="fx" data-lang="text">4 4.0201 2.01
6.03</div>
  <p>Each of these "nudge one input, freeze the rest" slopes is a <strong>partial derivative</strong>, written ∂f/∂x (the curly ∂ reminds you other inputs are frozen). The power rule gives them directly: ∂f/∂x = 2x = 2, ∂f/∂y = 6y = 6.</p>
  <p>Stack the partials into a list and you get the <strong>gradient</strong>, written ∇f ("nabla f" or "grad f"): here (2, 6). It is an arrow. Its direction is the steepest way <em>uphill</em> from this point, and its length is how steep that is. Because y's slope is 3× bigger, the arrow leans towards y.</p>
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
  </svg><figcaption>Contour lines of f(x,y) = x² + 3y², like height lines on a trekking map. The gradient points straight across them, uphill; it is steeper in y because of the 3.</figcaption></figure>
  <p>Proof that it is the steepest direction: take a step of the same tiny length in three directions and see how much f changes.</p>
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
  <p>Same step length, three directions: the gradient direction raises f the most, and its opposite lowers it the most. That is the whole idea of <strong>gradient descent</strong>: to make the loss smaller, step against the gradient: <code>w ← w − lr·∇L</code>, where <code>lr</code> is a small step size (the <strong>learning rate</strong>).</p>
  <p>A one-weight run by hand with f(w) = (w − 3)², lr = 0.25, starting at w = 0. Slope = 2(w − 3).</p>
  <div class="fx" data-lang="py">f = lambda w: (w - 3)**2
df = lambda w: 2 * (w - 3)
w = 0.0
for step in range(6):
    print(step, round(w, 4), round(f(w), 4), round(df(w), 4))
    w = w - 0.25 * df(w)</div>
  <div class="fx" data-lang="text">0 0.0 9.0 -6.0
1 1.5 2.25 -3.0
2 2.25 0.5625 -1.5
3 2.625 0.1406 -0.75
4 2.8125 0.0352 -0.375
5 2.9062 0.0088 -0.1875</div>
  <p>Slope −6 means "f goes down as w grows", so w moves right: 0 − 0.25 × (−6) = 1.5. Each step halves the distance to the minimum at 3, and the slope shrinks as the ground flattens.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Standing on a foggy hill, you feel the ground under your feet. The gradient is "the steepest way up from here". It says nothing about where the valley floor is, only the local slope.</p>
  </div>

  <h2 id="mca-chain"><span class="num">04</span>Chain Rule = Backpropagation</h2>
  <p>Your bike uses 0.08 litres of petrol per km. Petrol costs ₹105 per litre. How much does each extra km cost? ₹105 per litre × 0.08 litres per km = <strong>₹8.4 per km</strong>. Cost depends on litres, litres depend on km, and the two rates simply multiply.</p>
  <div class="fx" data-lang="py">km = 100.0
litres = lambda km: 0.08 * km
cost = lambda L: 105 * L
print(cost(litres(km)))
print(105 * 0.08)      # dCost/dkm</div>
  <div class="fx" data-lang="text">840.0
8.4</div>
  <div class="callout def"><span class="label">Chain rule</span>
    <p>If L depends on y and y depends on w, then <code>dL/dw = dL/dy · dy/dw</code>. Rates multiply along the path. With more links in the chain, you multiply more rates.</p>
  </div>
  <p><strong>Why ML needs it:</strong> a neural network is a long chain. The weight w₁ affects z, z affects h, h affects ŷ, ŷ affects the loss L. To know how the loss changes when w₁ changes, multiply every rate along the path. Doing this for every weight, efficiently, is called <strong>backpropagation</strong>.</p>
  <p><strong>Tiny network by hand.</strong> Input x = 2, target y = 1, weights w₁ = 0.5, w₂ = 3, with a ReLU in the middle and squared-error loss.</p>
  <p><em>Forward pass</em> (left to right, compute every value):</p>
  <ul>
    <li>z = w₁ × x = 0.5 × 2 = <strong>1</strong></li>
    <li>h = ReLU(z) = max(0, 1) = <strong>1</strong></li>
    <li>ŷ = w₂ × h = 3 × 1 = <strong>3</strong></li>
    <li>L = (ŷ − y)² = (3 − 1)² = <strong>4</strong></li>
  </ul>
  <p><em>Backward pass</em> (right to left, one local slope at a time, multiplying as you go):</p>
  <ul>
    <li>∂L/∂ŷ = 2(ŷ − y) = 2 × 2 = <strong>4</strong> (power rule)</li>
    <li>∂L/∂w₂ = ∂L/∂ŷ × ∂ŷ/∂w₂ = 4 × h = 4 × 1 = <strong>4</strong> (ŷ = w₂h, so ∂ŷ/∂w₂ = h)</li>
    <li>∂L/∂h = ∂L/∂ŷ × ∂ŷ/∂h = 4 × w₂ = 4 × 3 = <strong>12</strong></li>
    <li>∂L/∂z = ∂L/∂h × ReLU slope = 12 × 1 = <strong>12</strong> (z = 1 &gt; 0, so slope is 1)</li>
    <li>∂L/∂w₁ = ∂L/∂z × ∂z/∂w₁ = 12 × x = 12 × 2 = <strong>24</strong></li>
  </ul>
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
  </svg><figcaption>Forward pass (blue) computes values left to right. Backward pass (red) multiplies local slopes right to left. Each red number reuses the one to its right.</figcaption></figure>
  <p>The same steps in code, plus a numeric check using the tiny-gap method from section 01:</p>
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
  <p>Hand work, chain rule and the numeric check all agree: 4 and 24. Reading them: w₁ matters 6× more than w₂ right now, and both gradients are positive, so gradient descent will <em>reduce</em> both weights to bring ŷ = 3 down towards y = 1.</p>
  <ul>
    <li><strong>Backprop</strong> = chain rule applied right to left, storing each upstream gradient so it is computed once. Cost ≈ 2× a forward pass, whatever the number of weights.</li>
    <li>Forward values (z, h) are needed in the backward pass (∂L/∂w₂ needed h; ∂L/∂w₁ needed x and the sign of z). That's why training uses far more memory than inference: every intermediate value must be kept until the backward pass.</li>
    <li>PyTorch's <code>loss.backward()</code> builds this graph and does exactly these multiplications.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A relay of messengers. The loss tells ŷ "you were 4 units too sensitive". ŷ passes it to h, scaled by its own rate. Each messenger multiplies the message by its local rate and hands it back. Nobody recomputes the whole chain from scratch.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>If z ≤ 0 the ReLU slope is 0, so ∂L/∂z = 12 × 0 = 0 and ∂L/∂w₁ = 0: w₁ never updates. Many such units = "dead ReLUs". Leaky ReLU keeps a small slope (like 0.01) on the left so the chain is never fully cut.</p>
  </div>

  <h2 id="mca-jh"><span class="num">05</span>Jacobian &amp; Hessian</h2>
  <p>So far the function gave back <em>one</em> number (a loss) and we asked how it changes with each input. Two generalisations come up in ML:</p>
  <ul>
    <li>What if the function gives back <em>many</em> numbers? A layer takes 3 inputs and returns 5 outputs. Each output has its own gradient. Stack those gradients as rows and you get a table of slopes: the <strong>Jacobian</strong>.</li>
    <li>What if we ask how the <em>slope itself</em> changes? That is the second derivative, the <strong>curvature</strong>: is the valley narrow and steep, or wide and gentle? For many inputs this is a table too: the <strong>Hessian</strong>.</li>
  </ul>
  <div class="cards">
    <div><b>Gradient</b><p>Scalar out, vector in. One slope per input.</p><small>Shape: (n,)</small></div>
    <div><b>Jacobian J</b><p>Vector out. Row i = gradient of output i.</p><small>Shape: (outputs × inputs)</small></div>
    <div><b>Hessian H</b><p>Second derivatives: how the gradient itself changes.</p><small>Shape: (n × n), symmetric</small></div>
  </div>
  <p><strong>Jacobian by hand.</strong> f(x, y) = (xy, x + y²) at (2, 3). Output 1 = xy has partials (y, x) = (3, 2). Output 2 = x + y² has partials (1, 2y) = (1, 6). Stack: J = [[3, 2], [1, 6]].</p>
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
  <p><strong>Hessian by hand.</strong> For f = x² + 3y², the gradient is (2x, 6y). Differentiate again: ∂/∂x of 2x is 2, ∂/∂y of 6y is 6, and the cross terms are 0. So H = [[2, 0], [0, 6]]. Both curvatures are positive: the surface bends upward in every direction, a bowl. For f = x² − y², H = [[2, 0], [0, −2]]: up along x, down along y, a horse saddle.</p>
  <figure class="viz"><svg viewBox="0 0 470 120" width="470">
    <path d="M20,20 Q70,140 120,20" fill="none" class="sg" stroke-width="2.5"/><text x="20" y="112" class="tg">all λ &gt; 0: minimum</text>
    <path d="M170,90 Q220,-30 270,90" fill="none" class="sr" stroke-width="2.5"/><text x="170" y="112" class="tr">all λ &lt; 0: maximum</text>
    <path d="M320,20 Q370,140 420,20" fill="none" class="sg" stroke-width="2"/><path d="M320,90 Q370,-30 420,90" fill="none" class="sr" stroke-width="2"/><text x="320" y="112">mixed signs: saddle</text>
  </svg><figcaption>Hessian eigenvalues (λ) = curvature along each principal direction. Mixed signs mean "valley one way, ridge the other".</figcaption></figure>
  <p>At a flat point (gradient zero), the Hessian's eigenvalues (see <em>Linear Algebra</em>: the stretch factors along its natural directions) say what kind of flat point it is: all positive → bottom of a bowl, all negative → top of a hill, mixed → saddle.</p>
  <ul>
    <li><strong>Jacobian in ML:</strong> backprop through a vector layer multiplies Jacobians; for z = Wx the Jacobian is simply W. Normalising flows use its determinant.</li>
    <li><strong>Hessian in ML:</strong> the ratio of largest to smallest eigenvalue (<strong>condition number</strong>) says how stretched the valley is, and so how badly gradient descent zig-zags. Here 6/2 = 3, mild. Newton's method uses H⁻¹ to jump straight to the bottom, but for n weights H has n² entries, so deep learning uses first-order methods (gradient only) instead.</li>
  </ul>

  <h2 id="mca-num"><span class="num">06</span>Numerical vs Analytical Gradients</h2>
  <p>You wrote a custom layer and its backward formula by hand. How do you know the formula is right? The tiny-gap method from section 01 is slow but needs no formula, so it makes a perfect referee.</p>
  <table class="tbl">
    <tr><th></th><th>Analytical (formula / autograd)</th><th>Numerical (finite differences)</th></tr>
    <tr><td>Cost</td><td>≈ 1 backward pass</td><td>2 loss evaluations <em>per parameter</em></td></tr>
    <tr><td>Accuracy</td><td>Exact (up to float error)</td><td>Approximate; depends on h</td></tr>
    <tr><td>Use</td><td>Training</td><td>Testing that the analytical one is right</td></tr>
  </table>
  <p>Two ways to pick the gap. <strong>Forward difference</strong> uses f(x+h) − f(x). <strong>Central difference</strong> straddles the point: f(x+h) − f(x−h), divided by 2h. Test on eˣ at x = 1, whose true slope is e ≈ 2.71828.</p>
  <div class="fx" data-lang="py">f, x, true = np.exp, 1.0, np.exp(1.0)
for h in [1e-2, 1e-5, 1e-8, 1e-12]:
    fwd = (f(x + h) - f(x)) / h
    ctr = (f(x + h) - f(x - h)) / (2 * h)
    print(f"h={h:.0e}  forward err={abs(fwd - true):.1e}  central err={abs(ctr - true):.1e}")</div>
  <div class="fx" data-lang="text">h=1e-02  forward err=1.4e-02  central err=4.5e-05
h=1e-05  forward err=1.4e-05  central err=5.9e-11
h=1e-08  forward err=6.6e-09  central err=6.6e-09
h=1e-12  forward err=4.3e-04  central err=2.1e-04</div>
  <p>Central differences are far more accurate (error ∝ h² vs h). Too small an h fails too: at 1e-12, f(x+h) and f(x−h) are almost the same float, and subtracting nearly-equal numbers loses digits. Use h ≈ 1e-5 with float64.</p>
  <h3>Build it: gradient check for logistic regression</h3>
  <p>Logistic regression predicts a probability p = σ(Xw) and uses cross-entropy loss. Its gradient has a known formula. Compare formula vs numeric with a <strong>relative error</strong> (difference divided by sizes, so the answer doesn't depend on units).</p>
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
  <p>The correct formula matches to 11 decimal places. Forgetting to divide by n (a very common bug) gives a relative error of 0.96: the check catches it instantly.</p>
  <div class="callout intu"><span class="label">Reading the number</span>
    <p>Relative error &lt; 1e-7: correct. Around 1e-4: suspicious (check kinks like ReLU at 0, where the slope jumps). &gt; 1e-2: a bug. Run checks in float64, on a few samples, with dropout and other randomness switched off, or the two sides see different functions.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Never train with numerical gradients. A model with 1 million weights needs 2 million loss evaluations per step. Use them only as a one-off test.</p>
  </div>

  <h2 id="mca-qa"><span class="num">07</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Distance after t seconds is 5t². What is the speed at t = 4, and what rule gives it?</summary><div class="qa-body">Power rule: derivative of 5t² is 10t, so 40 m/s at t = 4. (At t = 2 it was 20 m/s, matching the shrinking-gap table in section 01.)</div></details>
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
