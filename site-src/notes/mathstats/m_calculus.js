// notes/mathstats/m_calculus.js — Calculus
Object.assign(TOPIC_CONTENT, {
  "m_calculus": `<main>
  <h1>Calculus</h1>
  <div class="where"><span>Mathematics &amp; Statistics</span><span>Math for ML</span><span>Calculus</span></div>
  <p class="lead">Calculus is the maths of change: how fast something moves, and which way is downhill. Training a model means nudging its weights so the loss goes down, and calculus tells you which way and how hard to nudge. This note covers only what ML uses, each idea as the answer to a question the previous one could not answer, all on ONE running example: the squared-error loss of a model that prices the three houses from <a class="xref" data-note="m_linalg">Linear Algebra</a> (sizes 1, 2, 3; prices 2, 4, 6). You will find the slope of that loss (derivative), compute it with shortcut rules, extend it to two weights (gradient), push it through nested functions (chain rule = backprop), measure the bend (Hessian), decide whether a flat point is a minimum, and check a gradient numerically.</p>

  <h2 id="mca-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 170" width="660">
<defs><marker id="mca-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="130" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="75" y="41" text-anchor="middle" font-size="12">Linear Algebra</text><text x="75" y="58" text-anchor="middle" class="tm" font-size="10">vectors, XᵀX, w = [2, 0]</text>
<line x1="140" y1="45" x2="168" y2="45" stroke="currentColor" marker-end="url(#mca-a0)"/>
<rect x="170" y="20" width="120" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="230" y="41" text-anchor="middle" font-size="12" font-weight="700">Calculus</text><text x="230" y="59" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<line x1="290" y1="45" x2="318" y2="45" stroke="currentColor" marker-end="url(#mca-a0)"/>
<rect x="320" y="20" width="120" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="380" y="41" text-anchor="middle" font-size="12">Optimization</text><text x="380" y="58" text-anchor="middle" class="tm" font-size="10">walk down to the best w</text>
<line x1="440" y1="45" x2="468" y2="45" stroke="currentColor" marker-end="url(#mca-a0)"/>
<rect x="470" y="20" width="180" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="560" y="41" text-anchor="middle" font-size="12">ML &amp; deep learning</text><text x="560" y="58" text-anchor="middle" class="tm" font-size="10">loss + GD, backprop</text>
<text x="330" y="115" text-anchor="middle" class="tm" font-size="10.5">same three houses throughout: size [1, 2, 3] → price [2, 4, 6];</text><text x="330" y="131" text-anchor="middle" class="tm" font-size="10.5">loss L(w) = mean((w·size − price)²), lowest at w = 2</text>
</svg><figcaption>The Math for ML track. Linear algebra gave the objects; calculus measures how the loss changes when they move; optimization uses that to walk downhill.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="m_linalg">Linear Algebra</a></b><span>We wrote the houses as a table X, predicted prices as Xw and solved the normal equations for w = [2, 0] in one shot. That only works for small linear models.</span></li>
    <li><b>This note adds: how fast the error changes when you nudge the weights</b><span>Derivative, rules, gradient, chain rule (backprop), Jacobian, Hessian, the test for a minimum, and gradient checking.</span></li>
    <li><b>Leads to: <a class="xref" data-note="m_optimization">Optimization</a></b><span>A gradient says which way is downhill, but not how far to step, nor how to cope with millions of rows or a narrow valley. Optimization turns the gradient into gradient descent, SGD and Adam. Then <a class="xref" data-note="ml_loss_gd">Loss &amp; Gradient Descent</a> and <a class="xref" data-note="dl_foundations">Neural Network Foundations</a> use backprop on real models.</span></li>
  </ol>

  <h2 id="mca-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each idea answers the question above it, and its weakness raises the next question. Running example: houses A, B, C with size x = [1, 2, 3] (1000 sq ft), rooms [1, 3, 2], price y = [2, 4, 6] (₹ crore). Model: price = w × size. Loss: L(w) = mean((w·x − y)²).</p>
  <ol class="story">
    <li><b>Derivative</b><span>Q: if I nudge the weight, how fast does the loss change? → Shrink the gap and read the settled slope: at w = 1, slopes −4.67, −8.87, −9.29 … settle at <strong>−9.33</strong>. Negative: increase w. But computing a limit every time is slow…</span></li>
    <li><b>Rules (power, sum, chain)</b><span>Q: can I get the slope without limits? → Power and chain rule per house: −2, −8, −18; sum rule: average −9.33. Closed form L′(w) = (28/3)(w − 2). But real models have many weights…</span></li>
    <li><b>Partial derivatives &amp; gradient</b><span>Q: with two weights (size and rooms), which way is downhill? → One slope per weight, others frozen; stack them: ∇L(1, 1) = (−0.67, 0.67), ∇L(0, 0) = (−18.67, −17.33). Steepest uphill; step against it. But a neural net is a function of a function of a function…</span></li>
    <li><b>Chain rule = backprop (and the Jacobian)</b><span>Q: how do I get the slope through nested functions? → Multiply local rates right to left. Tiny net on house B: ∂L/∂w₂ = −2, ∂L/∂w₁ = −12. For a layer, the rates form a table, the Jacobian (for ŷ = Xw it is X). But a slope says nothing about how quickly the slope itself changes…</span></li>
    <li><b>Second derivative &amp; Hessian</b><span>Q: how curved is the loss? → L″ = 9.33 everywhere; with two weights the Hessian (2/3)XᵀX has eigenvalues 18 and 0.67: a valley 27 times steeper one way than the other. Now: is a flat point a bottom?</span></li>
    <li><b>Critical points: is this a minimum?</b><span>Q: the slope is zero, but is it a valley, a hilltop or a saddle? → Gradient 0 at w = (2, 0) (the normal equations again) and all Hessian eigenvalues positive → minimum. But all of this assumed our gradient formulas are right…</span></li>
    <li><b>Gradient checking</b><span>Q: how do I know my gradient code is correct? → Compare with central differences: relative error 3e-12 = correct; forgetting the /n gives 0.5 = bug. Next: turn the gradient into a training loop (<a class="xref" data-note="m_optimization">Optimization</a>).</span></li>
  </ol>

  <h2 id="mca-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Calculus for ML</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Derivative</div>
        <ul>
          <li><b>What</b> — slope at one point: how much the output moves per tiny nudge of the input</li>
          <li><b>f′(x)</b> = lim (f(x+h) − f(x))/h as h → 0</li>
          <li><b>Ours</b> — L at w = 1: h=1 → −4.67, h=0.1 → −8.87, h→0 → −9.33</li>
          <li><b>Sign</b> = direction, <b>size</b> = sensitivity, <b>zero</b> = flat (min / max / plateau)</li>
          <li>💡 speedometer: distance 5t² → speed at t=2 is 20 m/s</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Rules you need</div>
        <ul>
          <li><b>Power</b> — (xⁿ)′ = nxⁿ⁻¹; ((ŷ−y)²)′ = 2(ŷ−y)</li>
          <li><b>Sum / constant</b> — slope of a mean = mean of slopes (−2, −8, −18 → −9.33)</li>
          <li><b>Product</b> — (fg)′ = f′g + fg′</li>
          <li><b>Chain</b> — f(g(x))′ = f′(g(x))·g′(x); rates multiply</li>
          <li><b>Exp / log</b> — (eˣ)′ = eˣ, (ln x)′ = 1/x</li>
          <li><b>Sigmoid</b> — σ′ = σ(1−σ), max 0.25; <b>ReLU</b> — 1 if x &gt; 0 else 0</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Partials &amp; gradient</div>
        <ul>
          <li><b>∂f/∂w₁</b> — slope along w₁, other weights frozen</li>
          <li><b>∇L</b> — vector of partials; steepest <em>uphill</em>, length = steepness</li>
          <li><b>Linear model</b> — ∇L = (2/n)Xᵀ(Xw − y); at (1, 1): (−0.67, 0.67)</li>
          <li><b>Gradient descent</b> — <code>w ← w − lr·∇L</code></li>
          <li>💡 foggy hill: you feel only the local slope</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Chain rule = backprop</div>
        <ul>
          <li><b>dL/dw = dL/dy · dy/dw</b> — rates multiply along the path</li>
          <li>💡 petrol: 0.08 L per km × ₹105 per L = ₹8.4 per km</li>
          <li><b>House B net</b> — x=2, y=4, w₁=0.5, w₂=3 → L=1, ∂L/∂w₂=−2, ∂L/∂w₁=−12</li>
          <li><b>Forward</b> stores values; <b>backward</b> reuses upstream gradients; cost ≈ 2× forward</li>
          <li><b>Jacobian</b> — table of slopes; for ŷ = Xw it is X; ∇L = Jᵀ·∂L/∂ŷ</li>
          <li>⚠ Dead ReLU (slope 0) and saturated sigmoids (≤ 0.25) cut the chain</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Hessian &amp; minima</div>
        <ul>
          <li><b>L″</b> — slope of the slope; ours 9.33 (constant: a parabola)</li>
          <li><b>Hessian</b> — (n×n) symmetric; ours (2/3)XᵀX, eigenvalues 18 and 0.67</li>
          <li><b>At ∇ = 0</b> — eigvals all + → min, all − → max, mixed → saddle</li>
          <li><b>Condition number</b> — 18 / 0.67 = 27 → narrow valley, GD zig-zags</li>
          <li><b>∇L = 0</b> for MSE ⇔ normal equations → w = (2, 0)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Gradient checking</div>
        <ul>
          <li><b>Analytical</b> — exact, ≈ 1 backward pass; used for training</li>
          <li><b>Numerical</b> — 2 loss evals <em>per parameter</em>; used to test</li>
          <li><b>Central diff</b> — (f(x+h) − f(x−h))/2h, error O(h²); h ≈ 1e-5</li>
          <li><b>Relative error</b> — &lt;1e-7 correct, ~1e-4 suspicious, &gt;1e-2 bug</li>
          <li><b>Ours</b> — 3e-12 correct; forgot /n → 0.5</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="mca-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="mca-der"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Derivatives</span><span class="rm-sub">How fast does the loss change?</span></div></div>
      <div class="rm-item rm-done" data-target="mca-rules"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Rules You Need</span><span class="rm-sub">Slopes without limits</span></div></div>
      <div class="rm-item rm-done" data-target="mca-grad"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Partials &amp; Gradient</span><span class="rm-sub">Two weights, steepest uphill</span></div></div>
      <div class="rm-item rm-done" data-target="mca-chain"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Chain Rule = Backprop</span><span class="rm-sub">A tiny net on house B; Jacobian</span></div></div>
      <div class="rm-item rm-done" data-target="mca-jh"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Curvature &amp; Hessian</span><span class="rm-sub">How fast the slope changes</span></div></div>
      <div class="rm-item rm-done" data-target="mca-min"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Is This a Minimum?</span><span class="rm-sub">Critical points, saddles</span></div></div>
      <div class="rm-item rm-done" data-target="mca-num"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Gradient Checking</span><span class="rm-sub">Numerical vs analytical</span></div></div>
      <div class="rm-item rm-done" data-target="mca-connect"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One loss, every derivative</span></div></div>
      <div class="rm-item rm-done" data-target="mca-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="mca-qa"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="mca-der"><span class="num">01</span>Derivatives: How Fast Does the Loss Change?</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In <a class="xref" data-note="m_linalg">Linear Algebra</a> we solved for the best weights in one shot. That trick needs a small, linear model. For a neural network there is no formula to solve. What we <em>can</em> always do is try a weight, measure the loss, and ask: "if I nudge the weight a little, does the loss go up or down, and how fast?"</p>
  </div>
  <h3>The running example</h3>
  <p>The three houses again, using only size for now. The model guesses price = w × size, and the <strong>loss</strong> (how wrong a guess is) is the mean squared error: for each house, (prediction − price)², then the average.</p>
  <table class="tbl out"><caption>The running example: three houses, one weight</caption>
    <tr><th>House</th><th>Size x (1000 sq ft)</th><th>Rooms</th><th>Price y (₹ crore)</th></tr>
    <tr><td>A</td><td>1</td><td>1</td><td>2</td></tr>
    <tr><td>B</td><td>2</td><td>3</td><td>4</td></tr>
    <tr><td>C</td><td>3</td><td>2</td><td>6</td></tr>
  </table>
  <p>By hand at w = 1: predictions 1, 2, 3; errors −1, −2, −3; squares 1, 4, 9; mean 14/3 = <strong>4.667</strong>. At w = 2 every prediction is right: loss <strong>0</strong>. At w = 0 the errors are −2, −4, −6: loss (4 + 16 + 36)/3 = <strong>18.667</strong>.</p>
  <div class="fx" data-lang="py">import numpy as np
np.set_printoptions(precision=3, suppress=True)
x = np.array([1., 2., 3.])     # size of houses A, B, C (1000 sq ft)
y = np.array([2., 4., 6.])     # price (Rs crore)
def L(w):                      # MSE of the 1-weight model: price = w * size
    return np.mean((w * x - y) ** 2)
for w in [0, 1, 2, 3]:
    print(w, round(L(w), 3))</div>
  <div class="fx" data-lang="text">0 18.667
1 4.667
2 0.0
3 4.667</div>
  <p><strong>Plain words:</strong> the derivative is the slope of the loss curve at one point: how many units the loss changes per unit nudge of w. At one exact point no nudge happens, so 0 ÷ 0 says nothing. The trick: take a small gap h, measure the average slope over it, and shrink the gap until the answer settles.</p>
  <p><strong>Traced at w = 1</strong> (where L = 4.667):</p>
  <ul>
    <li>Gap 1: L(2) = 0. Slope (0 − 4.667)/1 = <strong>−4.667</strong>.</li>
    <li>Gap 0.1: L(1.1) = (14/3) × 0.9² = 3.78. Slope (3.78 − 4.667)/0.1 = <strong>−8.867</strong>.</li>
    <li>Gap 0.01: slope <strong>−9.287</strong>; gap 0.001: <strong>−9.329</strong>. The answers settle at <strong>−9.333</strong>.</li>
  </ul>
  <div class="fx" data-lang="py">for h in [1, 0.1, 0.01, 0.001]:
    print(h, round((L(1 + h) - L(1)) / h, 4))   # average slope over a gap of h, starting at w = 1</div>
  <div class="fx" data-lang="text">1 -4.6667
0.1 -8.8667
0.01 -9.2867
0.001 -9.3287</div>
  <p>What the code does: <code>(L(1 + h) - L(1)) / h</code> is "change in loss ÷ change in weight" over a gap h. Smaller h, closer to the true slope at w = 1.</p>
  <figure class="viz"><svg viewBox="0 0 400 230" width="400">
    <line x1="40" y1="200" x2="370" y2="200" stroke="currentColor" opacity="0.4"/><line x1="40" y1="200" x2="40" y2="10" stroke="currentColor" opacity="0.4"/>
    <polyline points="40,20 60,62 80,99 100,130 120,155 140,175 160,189 180,197 200,200 220,197 240,189 260,175 280,155 300,130 320,99 340,62 360,20" fill="none" class="sb" stroke-width="2.5"/>
    <line x1="75" y1="104" x2="165" y2="206" class="sr" stroke-width="2"/>
    <line x1="120" y1="155" x2="200" y2="200" stroke="currentColor" stroke-dasharray="4 3"/>
    <circle cx="120" cy="155" r="4" class="fr sr"/><circle cx="200" cy="200" r="3" fill="currentColor"/>
    <text x="126" y="146">w = 1, L = 4.67</text>
    <text x="60" y="92" class="tr">tangent: slope −9.33</text>
    <text x="205" y="190" class="tm">secant h=1: −4.67</text>
    <text x="270" y="60" class="tb">L(w)</text>
    <text x="194" y="216" class="tm">w = 2</text><text x="34" y="216" class="tm">0</text><text x="354" y="216" class="tm">4</text>
  </svg><figcaption>The loss of the three houses as a function of w: a bowl with its bottom at w = 2. Shrink the gap h and the secant (dashed) turns into the tangent (red). Its slope, −9.33, is the derivative at w = 1.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A car's speedometer. A ball that has rolled 5t² metres after t seconds has average speeds 25, 20.5, 20.05 m/s over gaps of 1, 0.1, 0.01 s after t = 2: its speed at exactly t = 2 is 20 m/s. The speedometer never computes "distance over zero seconds"; it reports the value the short gaps settle to. The derivative of the loss is the speedometer of training.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><code>f′(x) = lim (f(x+h) − f(x)) / h</code> as h → 0. <code>f(x+h) − f(x)</code> is "how much the output changed", <code>/ h</code> is "per unit of input change", and <code>lim … h → 0</code> is "make the gap tiny and take the settled value". f′ is read "f prime"; dL/dw means the same thing.</p>
  </div>
  <p><strong>Reading a derivative</strong> (on our loss):</p>
  <ul>
    <li><strong>Sign</strong> = which way the loss goes. L′(1) = −9.33 &lt; 0: the loss falls as w grows, so increase w.</li>
    <li><strong>Size</strong> = how sensitive. At w = 0 the slope is −18.67: twice as steep, far from the bottom.</li>
    <li><strong>Zero</strong> = flat spot: L′(2) = 0, the bottom of the bowl.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The derivative at w = 1 says nothing about w = 10. It is a <em>local</em> fact, the slope under your feet. That is why gradient descent takes many small steps instead of one big jump.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the rules.</b> Shrinking gaps works, but it is slow and only approximate, and a model with a million weights would need it a million times per step. Is there an exact shortcut for the slope?</div>

  <h2 id="mca-rules"><span class="num">02</span>Rules You Actually Need</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We found L′(1) ≈ −9.33 by shrinking gaps. We want the exact slope at <em>every</em> w, as a formula, without any limits.</p>
  </div>
  <p><strong>Plain words:</strong> a handful of shortcut rules cover everything ML needs. The one you use most is the <strong>power rule</strong>: for w², the slope is 2w; bring the power down in front, lower it by one. The <strong>sum rule</strong> says the slope of a sum (or average) is the sum (or average) of the slopes. The <strong>chain rule</strong> (section 04 in full) says a function inside a function multiplies the slopes.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Times tables. You could add 7 nine times to get 63, but you memorise 7 × 9 once and reuse it forever. Derivative rules are the times tables of change.</p>
  </div>
  <p><strong>Traced on the houses at w = 1.</strong> Each house's squared error is (w·x − y)². Power rule on the outside: 2 × (w·x − y). Chain rule for the inside w·x − y, whose slope in w is x. So each house contributes 2(w·x − y)·x:</p>
  <ul>
    <li>A: 2 × (1 − 2) × 1 = <strong>−2</strong></li>
    <li>B: 2 × (2 − 4) × 2 = <strong>−8</strong></li>
    <li>C: 2 × (3 − 6) × 3 = <strong>−18</strong></li>
    <li>Sum rule: the loss is the average, so its slope is the average: (−2 − 8 − 18)/3 = <strong>−9.333</strong>, exactly what the shrinking gaps settled to.</li>
  </ul>
  <p><strong>The formula for every w.</strong> Expand: L(w) = mean(x²)·w² − 2·mean(xy)·w + mean(y²) = (14/3)w² − (56/3)w + 56/3. Power rule term by term: L′(w) = (28/3)w − 56/3 = <strong>(28/3)(w − 2)</strong>. At w = 0: −18.67; w = 1: −9.33; w = 2: 0; w = 3: +9.33.</p>
  <div class="fx" data-lang="py">w = 1.0
per_house = 2 * (w * x - y) * x      # d/dw of (w*x - y)^2: power rule x chain rule
print(per_house)                     # houses A, B, C
print(round(per_house.mean(), 4))    # sum rule: slope of the mean = mean of the slopes
dL = lambda w: np.mean(2 * (w * x - y) * x)
print(round(dL(0), 3), round(dL(1), 3), round(dL(2), 3), round(dL(3), 3))
print(round(28 / 3 * (1 - 2), 4))    # closed form L'(w) = (28/3)(w - 2) at w = 1</div>
  <div class="fx" data-lang="text">[ -2.  -8. -18.]
-9.3333
-18.667 -9.333 0.0 9.333
-9.3333</div>
  <p>What the code does: <code>2 * (w * x - y) * x</code> applies the power and chain rules to all three houses at once (numpy works element by element). <code>.mean()</code> is the sum rule. <code>dL</code> packages it as a function of w; the last line evaluates the closed form at w = 1.</p>
  <table class="tbl">
    <tr><th>Rule</th><th>Formula</th><th>In words</th><th>ML example</th></tr>
    <tr><td>Power</td><td>(xⁿ)′ = n xⁿ⁻¹</td><td>Power comes down, drops by one</td><td>MSE: ((ŷ−y)²)′ = 2(ŷ−y)</td></tr>
    <tr><td>Constant × / sum</td><td>(cf + g)′ = cf′ + g′</td><td>Constants stay; do each term separately</td><td>Loss = mean over houses; data loss + λ‖w‖²</td></tr>
    <tr><td>Product</td><td>(fg)′ = f′g + fg′</td><td>Change one, hold the other, add both ways</td><td>Gates in LSTMs</td></tr>
    <tr><td>Chain</td><td>f(g(x))′ = f′(g(x)) · g′(x)</td><td>Rates of nested functions multiply</td><td>(w·x − y)² → 2(w·x − y)·x; every layer of backprop</td></tr>
    <tr><td>Exp / log</td><td>(eˣ)′ = eˣ, (ln x)′ = 1/x</td><td>eˣ is its own slope</td><td>Softmax, cross-entropy</td></tr>
    <tr><td>Sigmoid</td><td>σ′ = σ(1 − σ)</td><td>Slope from the value itself</td><td>Logistic regression</td></tr>
    <tr><td>ReLU</td><td>1 if x &gt; 0 else 0</td><td>Slope 1 on the right, flat on the left</td><td>Most hidden layers</td></tr>
  </table>
  <p>Here <code>ŷ</code> ("y hat") is the prediction and <code>y</code> the true answer. <code>σ</code> (sigma) is the <strong>sigmoid</strong>, 1 / (1 + e⁻ᶻ), which squashes any number into 0 to 1 and turns a score into a probability (classification models use it instead of our price model). Trust but verify: the sigmoid rule against the slow method from section 01.</p>
  <div class="fx" data-lang="py">sig = lambda z: 1 / (1 + np.exp(-z))
z, h = 0.5, 1e-5
print(round((sig(z + h) - sig(z - h)) / (2 * h), 6),   # numeric
      round(sig(z) * (1 - sig(z)), 6))                 # rule
print(round(sig(0) * (1 - sig(0)), 3), round(sig(6) * (1 - sig(6)), 4))</div>
  <div class="fx" data-lang="text">0.235004 0.235004
0.25 0.0025</div>
  <div class="callout def"><span class="label">Definition</span>
    <p>For our model, L(w) = (1/n) Σᵢ (w·xᵢ − yᵢ)² and, by the power, chain and sum rules, <code>L′(w) = (2/n) Σᵢ (w·xᵢ − yᵢ)·xᵢ</code>: the average of "error × input". On the houses it equals (28/3)(w − 2).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Sigmoid's slope is at most 0.25 (at z = 0) and nearly 0 once the input is large (z = 6 → 0.0025): the S-curve has gone flat, <strong>saturated</strong>. Backprop multiplies one such slope per layer (section 04), so deep sigmoid networks pass back almost nothing. That's why hidden layers use ReLU, whose slope is a solid 1.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: partial derivatives and the gradient.</b> One weight gives one slope. But our houses also have rooms, and real models have millions of weights. With two weights, "the slope" depends on which way you step. Which way is downhill?</div>

  <h2 id="mca-grad"><span class="num">03</span>Many Weights: Partial Derivatives &amp; the Gradient</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Add the rooms column: price = w₁ × size + w₂ × rooms. The loss now depends on two numbers. A single derivative no longer makes sense: nudging w₁ and nudging w₂ change the loss by different amounts. We need one slope per weight, and a way to combine them into "the way down".</p>
  </div>
  <p><strong>Plain words:</strong> a <strong>partial derivative</strong> is the slope along one weight while every other weight is frozen. Stack all the partials into a list and you get the <strong>gradient</strong>, an arrow that points in the steepest uphill direction; its length says how steep. To go down, step against it.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Standing on a foggy hillside. You can test the slope facing north and facing east separately (the two partials). Together they tell you the steepest way up. You still can't see the valley floor, only the ground under your feet.</p>
  </div>
  <p><strong>Traced at w = (1, 1).</strong> Predictions X·w = [2, 5, 5], errors [0, 1, −1], loss (0 + 1 + 1)/3 = 0.667. Each partial is the average of 2 × error × (that weight's input):</p>
  <ul>
    <li>∂L/∂w₁ (size inputs 1, 2, 3): (2/3)(0×1 + 1×2 + (−1)×3) = (2/3)(−1) = <strong>−0.667</strong></li>
    <li>∂L/∂w₂ (room inputs 1, 3, 2): (2/3)(0×1 + 1×3 + (−1)×2) = (2/3)(+1) = <strong>+0.667</strong></li>
    <li>∇L(1, 1) = (−0.667, +0.667): raise the size weight, lower the room weight. At w = (0, 0) the same recipe gives (−18.67, −17.33).</li>
  </ul>
  <p>In matrix form all partials come at once: <strong>∇L = (2/n)·Xᵀ(Xw − y)</strong>; Xᵀ dots every feature column with the error vector (see <a class="xref" data-note="m_linalg">Linear Algebra</a>, section 05).</p>
  <div class="fx" data-lang="py">X = np.array([[1., 1.], [2., 3.], [3., 2.]])   # [size, rooms] of houses A, B, C
def L2(w):                                     # MSE of price = w1*size + w2*rooms
    return np.mean((X @ w - y) ** 2)
def grad2(w):                                  # all partials at once: (2/n) X^T (Xw - y)
    return 2 * X.T @ (X @ w - y) / len(y)
w = np.array([1., 1.])
e = 1e-6
print(round(L2(w), 4), X @ w - y)
print(round((L2(w + [e, 0]) - L2(w - [e, 0])) / (2 * e), 4),   # nudge w1 only
      round((L2(w + [0, e]) - L2(w - [0, e])) / (2 * e), 4))   # nudge w2 only
print(grad2(w), grad2(np.array([0., 0.])))</div>
  <div class="fx" data-lang="text">0.6667 [ 0.  1. -1.]
-0.6667 0.6667
[-0.667  0.667] [-18.667 -17.333]</div>
  <p>What the code does: <code>L2</code> is the two-weight loss. Adding <code>[e, 0]</code> nudges only w₁ (a partial derivative, measured with a small gap on both sides). <code>grad2</code> is the matrix formula; it matches the nudges and the hand work.</p>
  <figure class="viz"><svg viewBox="0 0 460 250" width="460">
    <defs><marker id="mca-ah1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr"/></marker>
    <marker id="mca-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tg"/></marker></defs>
    <ellipse cx="230" cy="130" rx="150" ry="29" transform="rotate(45 230 130)" fill="none" stroke="currentColor" opacity="0.35"/>
    <ellipse cx="230" cy="130" rx="75" ry="14.4" transform="rotate(45 230 130)" fill="none" stroke="currentColor" opacity="0.55"/>
    <ellipse cx="230" cy="130" rx="34.6" ry="6.7" transform="rotate(45 230 130)" fill="none" stroke="currentColor" opacity="0.35"/>
    <circle cx="230" cy="130" r="3" fill="currentColor"/><text x="240" y="134" class="tm">min w = (2, 0)</text>
    <circle cx="190" cy="130" r="4" class="fr sr"/><text x="120" y="126">start (0, 0)</text>
    <line x1="190" y1="130" x2="161" y2="157" class="sr" stroke-width="2.5" marker-end="url(#mca-ah1)"/>
    <line x1="190" y1="130" x2="219" y2="103" class="sg" stroke-width="2.5" stroke-dasharray="5 3" marker-end="url(#mca-ah2)"/>
    <text x="90" y="176" class="tr">∇L = (−18.7, −17.3): uphill</text>
    <text x="222" y="96" class="tg">−∇L: steepest down</text>
    <text x="10" y="18" class="tm">contours of L(w₁, w₂): long along (1, −1), narrow along (1, 1)</text>
    <text x="10" y="240" class="tm">w₁ (size weight) →</text>
  </svg><figcaption>Contour lines of the two-weight loss, like height lines on a trekking map (drawn to scale). The gradient points straight across them. Notice the steepest-down arrow does <em>not</em> point at the minimum: the valley is long and narrow, a problem for section 05 and for <a class="xref" data-note="m_optimization">Optimization</a>.</figcaption></figure>
  <p>Proof that the gradient is the steepest direction: take a step of the same length (0.01) in three directions from (0, 0) and compare the change in loss.</p>
  <div class="fx" data-lang="py">p = np.array([0., 0.]); g = grad2(p)
u = g / np.linalg.norm(g)                      # unit vector along the gradient
for name, d in [("along grad", u), ("along w1 only", np.array([1., 0.])), ("against grad", -u)]:
    print(f"{name:14s} {L2(p + 0.01 * d) - L2(p):+.4f}")   # step of length 0.01
p_new = p - 0.05 * g                           # one gradient-descent step, lr = 0.05
print(p_new, round(L2(p), 3), "-&gt;", round(L2(p_new), 3))</div>
  <div class="fx" data-lang="text">along grad     +0.2556
along w1 only  -0.1862
against grad   -0.2538
[0.933 0.867] 18.667 -&gt; 0.803</div>
  <p>The gradient direction raises the loss most, its opposite lowers it most, and a step along w₁ alone does less. One step of <strong>gradient descent</strong>, w ← w − lr·∇L with step size (<strong>learning rate</strong>) lr = 0.05, moves (0, 0) to (0.933, 0.867) and cuts the loss from 18.67 to 0.80. Turning that into a full training loop is the job of <a class="xref" data-note="m_optimization">Optimization</a>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>For f(w₁, …, w_d), the partial derivative ∂f/∂wⱼ is the derivative in wⱼ with all other weights held fixed (the curly ∂ reminds you of the freezing). The gradient ∇f = (∂f/∂w₁, …, ∂f/∂w_d) ("nabla f"). It points in the direction of steepest increase, its length is the rate of that increase, and it is perpendicular to the contour lines.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The gradient points uphill. Training minimises loss, so the update is <em>minus</em> the gradient: <code>w ← w − lr·∇L</code>. A sign slip here makes the loss climb every step.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the chain rule.</b> Our model is one simple formula. A neural network is a function inside a function inside a function: size → layer → activation → layer → loss. How do we get the slope of the loss with respect to a weight buried deep inside?</div>

  <h2 id="mca-chain"><span class="num">04</span>Chain Rule = Backpropagation</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Section 02 used the chain rule once, for (w·x − y)². A network has many links: the weight w₁ affects z, z affects h, h affects the prediction, the prediction affects the loss. How do we get ∂L/∂w₁ through all of them, and do it for millions of weights without redoing work?</p>
  </div>
  <p><strong>Plain words:</strong> when one thing depends on another which depends on a third, the rates <em>multiply</em>. To get the slope of the loss for a deep weight, multiply the local slope of every link on the path. <strong>Backpropagation</strong> does this from the loss backwards, reusing each partial product so nothing is computed twice.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Your bike uses 0.08 litres of petrol per km; petrol costs ₹105 per litre. Each extra km costs ₹105 per litre × 0.08 litres per km = ₹8.4. Cost depends on litres, litres on km; the two rates simply multiply.</p>
  </div>
  <div class="fx" data-lang="py">km = 100.0
litres = lambda km: 0.08 * km
cost = lambda L: 105 * L
print(cost(litres(km)))
print(105 * 0.08)      # dCost/dkm = dCost/dlitre * dlitre/dkm</div>
  <div class="fx" data-lang="text">840.0
8.4</div>
  <p><strong>Traced: a tiny network on house B</strong> (size x = 2, price y = 4). Weights w₁ = 0.5 and w₂ = 3, a ReLU in the middle, squared-error loss.</p>
  <p><em>Forward pass</em> (left to right, compute and keep every value):</p>
  <ul>
    <li>z = w₁ × x = 0.5 × 2 = <strong>1</strong></li>
    <li>h = ReLU(z) = max(0, 1) = <strong>1</strong></li>
    <li>ŷ = w₂ × h = 3 × 1 = <strong>3</strong></li>
    <li>L = (ŷ − y)² = (3 − 4)² = <strong>1</strong></li>
  </ul>
  <p><em>Backward pass</em> (right to left, one local slope at a time, multiplying as you go):</p>
  <ul>
    <li>∂L/∂ŷ = 2(ŷ − y) = 2 × (−1) = <strong>−2</strong> (power rule)</li>
    <li>∂L/∂w₂ = ∂L/∂ŷ × h = −2 × 1 = <strong>−2</strong> (ŷ = w₂h, so ∂ŷ/∂w₂ = h)</li>
    <li>∂L/∂h = ∂L/∂ŷ × w₂ = −2 × 3 = <strong>−6</strong></li>
    <li>∂L/∂z = ∂L/∂h × ReLU slope = −6 × 1 = <strong>−6</strong> (z = 1 &gt; 0)</li>
    <li>∂L/∂w₁ = ∂L/∂z × x = −6 × 2 = <strong>−12</strong></li>
  </ul>
  <figure class="viz"><svg viewBox="0 0 610 150" width="610">
    <defs><marker id="mca-ah3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g stroke="currentColor" marker-end="url(#mca-ah3)"><line x1="42" y1="60" x2="68" y2="60"/><line x1="128" y1="60" x2="154" y2="60"/><line x1="214" y1="60" x2="240" y2="60"/><line x1="300" y1="60" x2="326" y2="60"/><line x1="386" y1="60" x2="412" y2="60"/><line x1="492" y1="60" x2="518" y2="60"/></g>
    <text x="10" y="64">x</text>
    <rect x="70" y="42" width="56" height="36" rx="6" class="fs" stroke="currentColor"/><text x="80" y="64">× w₁</text>
    <text x="178" y="64">z</text>
    <rect x="242" y="42" width="56" height="36" rx="6" class="fs" stroke="currentColor"/><text x="250" y="64">ReLU</text>
    <rect x="328" y="42" width="56" height="36" rx="6" class="fs" stroke="currentColor"/><text x="338" y="64">× w₂</text>
    <rect x="414" y="42" width="76" height="36" rx="6" class="fs" stroke="currentColor"/><text x="420" y="64">(ŷ−4)²</text>
    <text x="524" y="64">L</text>
    <text x="308" y="54">h</text><text x="394" y="54">ŷ</text>
    <text x="4" y="16" class="tb" font-size="11">forward values:</text>
    <text x="10" y="34" class="tb">2</text><text x="178" y="34" class="tb">1</text><text x="308" y="34" class="tb">1</text><text x="394" y="34" class="tb">3</text><text x="524" y="34" class="tb">1</text>
    <text x="66" y="102" class="tr" font-size="11">∂L/∂w₁=−12</text><text x="150" y="122" class="tr" font-size="11">∂L/∂z=−6</text><text x="270" y="122" class="tr" font-size="11">∂L/∂h=−6</text>
    <text x="330" y="102" class="tr" font-size="11">∂L/∂w₂=−2</text><text x="400" y="122" class="tr" font-size="11">∂L/∂ŷ=−2</text><text x="520" y="102" class="tr" font-size="11">1</text>
    <text x="4" y="144" class="tr" font-size="11">backward gradients ←</text>
  </svg><figcaption>House B through a tiny net. Forward pass (blue) computes values left to right. Backward pass (red) multiplies local slopes right to left; each red number reuses the one to its right.</figcaption></figure>
  <p>The same steps in code, plus a numeric check with the small-gap method from section 01:</p>
  <div class="fx" data-lang="py">xB, yB = 2.0, 4.0                         # house B: size 2, price 4
w1, w2 = 0.5, 3.0                         # a tiny net: size -&gt; x w1 -&gt; ReLU -&gt; x w2 -&gt; price
def loss_net(w1, w2):
    h = max(w1 * xB, 0)
    return (w2 * h - yB) ** 2

# forward: compute and keep every intermediate value
z = w1 * xB; h = max(z, 0); yhat = w2 * h; Lnet = (yhat - yB) ** 2
print("forward:", z, h, yhat, Lnet)

# backward: chain rule, right to left, reusing each upstream gradient
dL_dyhat = 2 * (yhat - yB)                # power rule
dL_dw2   = dL_dyhat * h                   # yhat = w2*h
dL_dh    = dL_dyhat * w2
dL_dz    = dL_dh * (1 if z &gt; 0 else 0)    # ReLU slope
dL_dw1   = dL_dz * xB                     # z = w1*x
print("backward:", dL_dyhat, dL_dw2, dL_dh, dL_dz, dL_dw1)

e = 1e-6                                  # check numerically
print("numeric:", round((loss_net(w1, w2 + e) - loss_net(w1, w2 - e)) / (2 * e), 4),
                  round((loss_net(w1 + e, w2) - loss_net(w1 - e, w2)) / (2 * e), 4))</div>
  <div class="fx" data-lang="text">forward: 1.0 1.0 3.0 1.0
backward: -2.0 -2.0 -6.0 -6.0 -12.0
numeric: -2.0 -12.0</div>
  <p>What the code does: the forward line stores z, h and ŷ because the backward pass needs them. Each backward line is one link of the chain, multiplying the gradient arriving from the right by a local slope. The numeric check nudges each weight up and down; it agrees: −2 and −12. Both are negative, so gradient descent will <em>increase</em> both weights to lift ŷ = 3 towards the price 4, and w₁ matters 6× more right now.</p>
  <h3>The chain rule for a whole layer: the Jacobian</h3>
  <p>When a step outputs many numbers (a layer, or our three predictions ŷ = Xw), its local slope is a table: row i = how output i changes with each input. That table is the <strong>Jacobian</strong>. For ŷ = Xw, nudging w₁ moves the predictions by the size column and nudging w₂ by the rooms column, so the Jacobian is X itself. The vector chain rule multiplies by its transpose: ∇L = Jᵀ·(∂L/∂ŷ) = Xᵀ·(2/n)(ŷ − y), exactly the gradient formula of section 03.</p>
  <div class="fx" data-lang="py">def jacobian(f, p, h=1e-6):               # column j = how every output moves when input j is nudged
    J = np.zeros((len(f(p)), len(p)))
    for j in range(len(p)):
        d = np.zeros(len(p)); d[j] = h
        J[:, j] = (f(p + d) - f(p - d)) / (2 * h)
    return J
w = np.array([1., 1.])
J = jacobian(lambda w: X @ w, w)          # predictions as a function of the weights
print(J)                                  # = X itself
dL_dyhat = 2 * (X @ w - y) / len(y)       # upstream gradient: one number per house
print(dL_dyhat, J.T @ dL_dyhat)           # vector chain rule = grad2(w)</div>
  <div class="fx" data-lang="text">[[1. 1.]
 [2. 3.]
 [3. 2.]]
[ 0.     0.667 -0.667] [-0.667  0.667]</div>
  <p>What the code does: <code>jacobian</code> nudges each input and records how every output moves (one column per input). For our predictions it returns X. <code>dL_dyhat</code> holds 2(ŷ − y)/n per house; multiplying by Jᵀ gives (−0.667, 0.667), the same gradient as section 03 at w = (1, 1). Backprop through a dense layer z = Wx does exactly this: ∂L/∂x = Wᵀ·∂L/∂z.</p>
  <div class="callout def"><span class="label">Chain rule</span>
    <p>If L depends on y and y depends on w, then <code>dL/dw = dL/dy · dy/dw</code>. With vectors: <code>∇_w L = Jᵀ ∇_y L</code>, where J = ∂y/∂w is the Jacobian (outputs × inputs). <strong>Backpropagation</strong> = the chain rule applied from the loss backwards, storing each upstream gradient so it is computed once. Cost ≈ 2× a forward pass, however many weights there are.</p>
  </div>
  <ul>
    <li>Forward values are needed in the backward pass (∂L/∂w₂ needed h; ∂L/∂w₁ needed x and the sign of z). That's why training uses far more memory than inference: every intermediate value is kept until the backward pass.</li>
    <li>PyTorch's <code>loss.backward()</code> builds this graph and does exactly these multiplications (see <a class="xref" data-note="dl_pytorch">PyTorch</a>).</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>If z ≤ 0 the ReLU slope is 0, so ∂L/∂z = −6 × 0 = 0 and ∂L/∂w₁ = 0: w₁ never updates (a "dead ReLU"; Leaky ReLU keeps a small slope like 0.01). And since rates multiply, ten sigmoid layers pass back at most 0.25¹⁰ ≈ 1e-6 of the gradient: <strong>vanishing gradients</strong> (see <a class="xref" data-note="dl_rnns">RNNs</a>).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: curvature and the Hessian.</b> We can get the slope of any weight. But the slope only says which way is down right here. Will it stay steep, or flatten soon? Is the valley a round bowl or a long narrow canyon? That needs the slope of the slope.</div>

  <h2 id="mca-jh"><span class="num">05</span>Curvature: Second Derivative &amp; Hessian</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Two valleys can have the same slope under your feet: one gently curved, one that bends up sharply a step away. The size of a safe step, and whether a flat point is a bottom, depend on how fast the slope itself changes. The gradient alone can't tell us that.</p>
  </div>
  <p><strong>Plain words:</strong> the <strong>second derivative</strong> is the slope of the slope: how quickly the derivative changes as you move. Positive means the curve bends up (a bowl), negative means it bends down (a hilltop). With many weights, all the "slope of the slope" numbers form a square table, the <strong>Hessian</strong>; its eigenvalues (see <a class="xref" data-note="m_linalg">Linear Algebra</a>, section 07) are the curvatures along its natural directions.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Driving on a road. The slope is how steep it is right now; the curvature is whether it is about to level off or steepen. A wide bowl-shaped valley lets you take big strides; a narrow gorge needs tiny careful steps across it, even if the floor runs gently along it.</p>
  </div>
  <p><strong>Traced on one weight.</strong> L′(w) = (28/3)(w − 2), a straight line with slope 28/3. So L″(w) = <strong>28/3 = 9.333</strong> at every w: the loss is a perfect parabola, equally curved everywhere.</p>
  <p><strong>Traced on two weights.</strong> The gradient is (2/3)(XᵀXw − Xᵀy). Differentiate each component again: the Hessian is <strong>H = (2/3)·XᵀX = (2/3)·[[14, 13], [13, 14]] = [[9.333, 8.667], [8.667, 9.333]]</strong>. Its eigenvectors are those of XᵀX: along (1, 1) the curvature is (2/3)·27 = <strong>18</strong>, along (1, −1) it is (2/3)·1 = <strong>0.667</strong>. Both positive: a bowl. But 27 times more curved one way than the other: a long narrow valley, exactly the contour picture of section 03.</p>
  <div class="fx" data-lang="py">d2 = lambda w, h=1e-4: (L(w + h) - 2 * L(w) + L(w - h)) / h**2   # second difference
print(round(d2(0.0), 3), round(d2(1.0), 3), round(28 / 3, 3))  # same curvature everywhere
H = 2 * X.T @ X / len(y)                  # Hessian of the 2-weight MSE
print(H)
print(jacobian(grad2, np.array([1., 1.]))) # numeric: Jacobian of the gradient
print(np.linalg.eigvalsh(H), round(np.linalg.cond(H), 1))
H_saddle = np.array([[2., 0.], [0., -2.]])    # f = a^2 - b^2
print(np.linalg.eigvalsh(H_saddle))</div>
  <div class="fx" data-lang="text">9.333 9.333 9.333
[[9.333 8.667]
 [8.667 9.333]]
[[9.333 8.667]
 [8.667 9.333]]
[ 0.667 18.   ] 27.0
[-2.  2.]</div>
  <p>What the code does: <code>d2</code> is a second difference, the gap method applied twice; it gives 9.333 at any w. <code>H</code> is the formula; the numeric Jacobian of the gradient (how each partial changes with each weight) agrees. <code>eigvalsh</code> gives the curvatures 0.667 and 18, and <code>cond</code> their ratio 27. The saddle f = a² − b² has curvatures −2 and +2: up one way, down the other.</p>
  <div class="cards">
    <div><b>Gradient</b><p>Scalar out, vector in. One slope per weight.</p><small>Shape (n,); ours (−0.667, 0.667) at (1, 1)</small></div>
    <div><b>Jacobian J</b><p>Vector out. Row i = gradient of output i.</p><small>Shape (outputs × inputs); ours X (3 × 2)</small></div>
    <div><b>Hessian H</b><p>Second derivatives: how the gradient itself changes.</p><small>Shape (n × n), symmetric; ours (2/3)XᵀX</small></div>
  </div>
  <figure class="viz"><svg viewBox="0 0 470 120" width="470">
    <path d="M20,20 Q70,140 120,20" fill="none" class="sg" stroke-width="2.5"/><text x="20" y="112" class="tg">all λ &gt; 0: minimum</text>
    <path d="M170,90 Q220,-30 270,90" fill="none" class="sr" stroke-width="2.5"/><text x="170" y="112" class="tr">all λ &lt; 0: maximum</text>
    <path d="M320,20 Q370,140 420,20" fill="none" class="sg" stroke-width="2"/><path d="M320,90 Q370,-30 420,90" fill="none" class="sr" stroke-width="2"/><text x="320" y="112">mixed signs: saddle</text>
  </svg><figcaption>Hessian eigenvalues (λ) = curvature along each principal direction. Mixed signs mean "valley one way, ridge the other".</figcaption></figure>
  <div class="callout def"><span class="label">Definition</span>
    <p>Second derivative f″(x) = (f′)′(x). Hessian H[i, j] = ∂²L / ∂wᵢ∂wⱼ, symmetric. For MSE on a linear model, H = (2/n)XᵀX, the same for every w. <strong>Condition number</strong> = largest ÷ smallest eigenvalue; ours 18 / 0.667 = 27. Big = stretched valley.</p>
  </div>
  <ul>
    <li><strong>Why ML cares:</strong> gradient descent with step lr diverges along a direction once lr &gt; 2 / (curvature). The steep direction (18) caps lr below 2/18 = 0.11, and then progress along the flat direction (0.667) is slow: zig-zag. On one weight the cap is 2 / 9.33 = 0.214; <a class="xref" data-note="m_optimization">Optimization</a> shows lr = 0.25 blowing up on exactly this loss.</li>
    <li><strong>Newton's method</strong> uses H⁻¹ to jump straight to the bottom (on our parabola, in one step), but for n weights H has n² entries and needs an O(n³) solve, so deep learning uses first-order methods (gradient only).</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span>
    <p>A large gradient does not mean "far from the minimum" and a small one does not mean "close": along the flat direction of a narrow valley the gradient is tiny even when you are far from the bottom. Curvature, not slope alone, decides how far away the minimum is.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: is this a minimum?</b> We know the slope and the bend. Now put them together: where is the slope zero, and is that flat point really the bottom we want, or a hilltop or a saddle?</div>

  <h2 id="mca-min"><span class="num">06</span>Is This a Minimum? Critical Points</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Training stops when the gradient is (nearly) zero. But a zero slope happens at the bottom of a valley, at the top of a hill, and at a saddle. How do we find the flat points, and tell which kind each one is?</p>
  </div>
  <p><strong>Plain words:</strong> a <strong>critical point</strong> is where every partial derivative is zero. To classify it, look at the curvature there: bending up in every direction is a <strong>minimum</strong>, down in every direction a <strong>maximum</strong>, up in some and down in others a <strong>saddle</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A marble on a surface. In a bowl it stays put if nudged (minimum). On a dome any nudge sends it away (maximum). On a horse's saddle it is stable front-to-back but rolls off sideways (saddle point).</p>
  </div>
  <p><strong>Traced, one weight:</strong> set L′(w) = (28/3)(w − 2) = 0 → <strong>w = 2</strong>. L″ = 9.33 &gt; 0, so it is a minimum, with loss 0.</p>
  <p><strong>Traced, two weights:</strong> set ∇L = (2/3)(XᵀXw − Xᵀy) = 0 → <strong>XᵀX w = Xᵀy</strong>. These are exactly the normal equations of <a class="xref" data-note="m_linalg">Linear Algebra</a>, section 06: w = (2, 0). Both Hessian eigenvalues (18 and 0.667) are positive → minimum. "Solve the normal equations" and "find where the gradient is zero" are the same thing.</p>
  <div class="fx" data-lang="py">print(dL(2.0), round(d2(2.0), 3))             # slope 0, curvature &gt; 0: a minimum
w_star = np.linalg.solve(X.T @ X, X.T @ y)    # grad2 = 0  &lt;=&gt;  X^T X w = X^T y
print(w_star, np.round(grad2(w_star), 6) + 0.0, round(L2(w_star), 6))
f_s = lambda p: p[0]**2 - p[1]**2             # a saddle: gradient 0 at (0, 0) too
print(round(f_s(np.array([0.1, 0.])), 4), round(f_s(np.array([0., 0.1])), 4))</div>
  <div class="fx" data-lang="text">0.0 9.333
[2. 0.] [0. 0.] 0.0
0.01 -0.01</div>
  <p>What the code does: checks slope 0 and curvature 9.333 at w = 2; solves the normal equations and confirms the gradient there is (0, 0) and the loss 0. The saddle f = a² − b² is flat at (0, 0), yet a step along a raises it and a step along b lowers it.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>w* is a critical point if ∇L(w*) = 0. <strong>Second-derivative test</strong>: if all eigenvalues of H(w*) are &gt; 0, w* is a local minimum; all &lt; 0, a local maximum; mixed signs, a saddle. A function whose Hessian is positive (semi-)definite everywhere is <strong>convex</strong>: every local minimum is the global one. Our MSE loss is convex, because H = (2/n)XᵀX never changes.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>For neural networks you cannot solve ∇L = 0 by hand (no closed form), and most zero-gradient points in high dimensions are saddles, not bad minima. A loss that stalls may be crawling past a saddle, not finished. <a class="xref" data-note="m_optimization">Optimization</a> shows gradient descent stalling and escaping.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: gradient checking.</b> Everything depends on the gradient formula being right. When you hand-write the backward pass for a new layer, a missing factor (like forgetting to divide by n) silently trains the wrong thing. How do we test a gradient?</div>

  <h2 id="mca-num"><span class="num">07</span>Can I Trust My Gradient? Gradient Checking</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>You wrote a custom layer and its backward formula by hand. A wrong formula doesn't crash; the model just trains badly. How do you know the formula is right?</p>
  </div>
  <p><strong>Plain words:</strong> the small-gap method of section 01 is slow but needs no formula, so it is a perfect referee. Compute the gradient both ways on a few weights and compare.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Checking a calculator's answer for 37 × 48 by rough estimation (40 × 50 = 2000). You would never do all your accounts by estimation, but it catches a wildly wrong result instantly.</p>
  </div>
  <table class="tbl">
    <tr><th></th><th>Analytical (formula / autograd)</th><th>Numerical (finite differences)</th></tr>
    <tr><td>Cost</td><td>≈ 1 backward pass</td><td>2 loss evaluations <em>per parameter</em></td></tr>
    <tr><td>Accuracy</td><td>Exact (up to float error)</td><td>Approximate; depends on h</td></tr>
    <tr><td>Use</td><td>Training</td><td>Testing that the analytical one is right</td></tr>
  </table>
  <p>Two ways to pick the gap. <strong>Forward difference</strong>: (f(x+h) − f(x))/h, as in section 01. <strong>Central difference</strong> straddles the point: (f(x+h) − f(x−h))/2h. Test on eˣ at x = 1, whose true slope is e ≈ 2.71828:</p>
  <div class="fx" data-lang="py">f, x0, true = np.exp, 1.0, np.exp(1.0)
for h in [1e-2, 1e-5, 1e-8, 1e-12]:
    fwd = (f(x0 + h) - f(x0)) / h
    ctr = (f(x0 + h) - f(x0 - h)) / (2 * h)
    print(f"h={h:.0e}  forward err={abs(fwd - true):.1e}  central err={abs(ctr - true):.1e}")</div>
  <div class="fx" data-lang="text">h=1e-02  forward err=1.4e-02  central err=4.5e-05
h=1e-05  forward err=1.4e-05  central err=5.9e-11
h=1e-08  forward err=6.6e-09  central err=6.6e-09
h=1e-12  forward err=4.3e-04  central err=2.1e-04</div>
  <p>Central differences are far more accurate (error ∝ h² vs h). Too small an h fails too: at 1e-12, f(x+h) and f(x−h) are almost the same float, and subtracting nearly-equal numbers loses digits. Use h ≈ 1e-5 with float64.</p>
  <p><strong>Traced on the houses.</strong> Compare <code>grad2</code> from section 03 with central differences at w = (1, 1), using the <strong>relative error</strong> ‖a − b‖ / (‖a‖ + ‖b‖) (difference divided by sizes, so it doesn't depend on units). Then plant the most common bug, forgetting to divide by n:</p>
  <div class="fx" data-lang="py">def num_grad(f, w, h=1e-5):                # central differences, one weight at a time
    g = np.zeros_like(w)
    for i in range(len(w)):
        d = np.zeros_like(w); d[i] = h
        g[i] = (f(w + d) - f(w - d)) / (2 * h)
    return g
def rel_err(a, b):
    return np.linalg.norm(a - b) / (np.linalg.norm(a) + np.linalg.norm(b))
w = np.array([1., 1.])
print(grad2(w), num_grad(L2, w), f"{rel_err(grad2(w), num_grad(L2, w)):.1e}")
bad = 2 * X.T @ (X @ w - y)                # bug: forgot / n
print(bad, f"{rel_err(bad, num_grad(L2, w)):.1e}")</div>
  <div class="fx" data-lang="text">[-0.667  0.667] [-0.667  0.667] 3.3e-12
[-2.  2.] 5.0e-01</div>
  <p>What the code does: <code>num_grad</code> nudges one weight at a time up and down by h. The correct formula agrees to 3e-12. The buggy one is 3× too big, (−2, 2), and the relative error jumps to 0.5. The same check at scale, for logistic regression's cross-entropy gradient on 50 rows:</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
Xl = rng.normal(size=(50, 3)); yl = (rng.random(50) &gt; 0.5).astype(float)
wl = rng.normal(size=3)
def loss_ce(w):                            # cross-entropy
    p = sig(Xl @ w)
    return -np.mean(yl * np.log(p) + (1 - yl) * np.log(1 - p))
def grad_ce(w):                            # analytic
    return Xl.T @ (sig(Xl @ w) - yl) / len(yl)
ga, gn = grad_ce(wl), num_grad(loss_ce, wl)
print(np.round(ga, 6)); print(np.round(gn, 6))
print(f"relative error: {rel_err(ga, gn):.1e}")</div>
  <div class="fx" data-lang="text">[-0.104 -0.221 -0.296]
[-0.104 -0.221 -0.296]
relative error: 2.1e-11</div>
  <div class="callout def"><span class="label">Definition</span>
    <p>Central difference: ∂L/∂wᵢ ≈ (L(w + h·eᵢ) − L(w − h·eᵢ)) / 2h, where eᵢ is 1 in position i and 0 elsewhere. Relative error &lt; 1e-7: correct. Around 1e-4: suspicious (check kinks like ReLU at 0, where the slope jumps). &gt; 1e-2: a bug.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Never train with numerical gradients: a model with 1 million weights needs 2 million loss evaluations per step. Use them as a one-off test, in float64, on a few samples, with dropout and other randomness switched off, or the two sides see different functions.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: how it all connects.</b> We have built seven ideas on one loss. How do they fit together, and what does each contribute to training?</div>

  <h2 id="mca-connect"><span class="num">08</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Derivative, rules, partials, gradient, chain rule, Jacobian, Hessian, critical points, gradient checks: separate topics, or one idea seen from several sides?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 720 290" width="720">
<defs><marker id="mca-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="120" height="46" rx="7" class="fb sb"/><text x="70" y="39" text-anchor="middle" font-size="11.5" font-weight="700">loss L(w)</text><text x="70" y="56" text-anchor="middle" class="tm" font-size="10">L(1) = 4.67</text>
<line x1="130" y1="43" x2="148" y2="43" stroke="currentColor" marker-end="url(#mca-a9)"/>
<rect x="150" y="20" width="130" height="46" rx="7" class="fb sb"/><text x="215" y="39" text-anchor="middle" font-size="11.5" font-weight="700">derivative (limit)</text><text x="215" y="56" text-anchor="middle" class="tm" font-size="10">→ −9.33</text>
<line x1="280" y1="43" x2="298" y2="43" stroke="currentColor" marker-end="url(#mca-a9)"/>
<rect x="300" y="20" width="130" height="46" rx="7" class="fb sb"/><text x="365" y="39" text-anchor="middle" font-size="11.5" font-weight="700">rules</text><text x="365" y="56" text-anchor="middle" class="tm" font-size="10">(28/3)(w − 2)</text>
<line x1="430" y1="43" x2="448" y2="43" stroke="currentColor" marker-end="url(#mca-a9)"/>
<rect x="450" y="20" width="130" height="46" rx="7" class="fg sg"/><text x="515" y="39" text-anchor="middle" font-size="11.5" font-weight="700">gradient (partials)</text><text x="515" y="56" text-anchor="middle" class="tm" font-size="10">(−0.67, 0.67)</text>
<line x1="580" y1="43" x2="598" y2="43" stroke="currentColor" marker-end="url(#mca-a9)"/>
<rect x="600" y="20" width="110" height="46" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="655" y="39" text-anchor="middle" font-size="11">Optimization</text><text x="655" y="56" text-anchor="middle" class="tm" font-size="10">w − lr·∇L</text>
<line x1="365" y1="66" x2="365" y2="110" stroke="currentColor" marker-end="url(#mca-a9)"/>
<rect x="290" y="112" width="150" height="46" rx="7" class="ft st"/><text x="365" y="131" text-anchor="middle" font-size="11.5" font-weight="700">chain rule / Jacobian</text><text x="365" y="148" text-anchor="middle" class="tm" font-size="10">∇L = Xᵀ·2(ŷ − y)/n</text>
<line x1="440" y1="135" x2="510" y2="70" stroke="currentColor" marker-end="url(#mca-a9)"/>
<line x1="290" y1="135" x2="252" y2="135" stroke="currentColor" marker-end="url(#mca-a9)"/>
<rect x="100" y="112" width="150" height="46" rx="7" class="ft st"/><text x="175" y="131" text-anchor="middle" font-size="11.5" font-weight="700">backprop</text><text x="175" y="148" text-anchor="middle" class="tm" font-size="10">house B: −2, −12</text>
<line x1="515" y1="66" x2="515" y2="200" stroke="currentColor" marker-end="url(#mca-a9)"/>
<rect x="450" y="202" width="130" height="46" rx="7" class="fr sr"/><text x="515" y="221" text-anchor="middle" font-size="11.5" font-weight="700">Hessian</text><text x="515" y="238" text-anchor="middle" class="tm" font-size="10">eig 18, 0.67 (27 : 1)</text>
<line x1="450" y1="225" x2="432" y2="225" stroke="currentColor" marker-end="url(#mca-a9)"/>
<rect x="290" y="202" width="140" height="46" rx="7" class="fr sr"/><text x="360" y="221" text-anchor="middle" font-size="11.5" font-weight="700">∇ = 0 + test</text><text x="360" y="238" text-anchor="middle" class="tm" font-size="10">w = (2, 0): minimum</text>
<line x1="290" y1="225" x2="252" y2="225" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#mca-a9)"/>
<rect x="100" y="202" width="150" height="46" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="175" y="221" text-anchor="middle" font-size="11">= normal equations</text><text x="175" y="238" text-anchor="middle" class="tm" font-size="10">(Linear Algebra §06)</text>
<line x1="215" y1="66" x2="215" y2="100" stroke="currentColor" stroke-dasharray="4 3"/><text x="10" y="96" font-size="10.5" class="tm">gap method → gradient check (3e-12)</text>
<text x="590" y="272" font-size="10.5" class="tm">→ lr cap, zig-zag (Optimization)</text>
</svg><figcaption>One loss, seen from every side. The limit defines the derivative; rules make it exact; partials stack into the gradient; the chain rule (with the Jacobian) computes it through any depth; differentiating again gives the Hessian; gradient zero plus positive curvature is a minimum, which for our loss is the normal equations. The gap method returns as the gradient check.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the same three houses</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>On the running example</th><th>Use when</th></tr>
    <tr><td>Loss L(w)</td><td>mean of squared errors</td><td>how wrong is this weight?</td><td>L(0) 18.67, L(1) 4.67, L(2) 0</td><td>always: the thing we minimise</td></tr>
    <tr><td>Derivative</td><td>limit of (L(w+h) − L(w))/h</td><td>how fast does the loss change?</td><td>L′(1) = −9.33</td><td>definition; sanity checks</td></tr>
    <tr><td>Power / sum / chain rules</td><td>shortcuts for the limit</td><td>exact slope at every w?</td><td>per house −2, −8, −18; L′ = (28/3)(w − 2)</td><td>deriving any gradient</td></tr>
    <tr><td>Partial derivative</td><td>derivative with others frozen</td><td>slope along one weight?</td><td>∂L/∂w₁ = −0.67 at (1, 1)</td><td>multi-weight models</td></tr>
    <tr><td>Gradient</td><td>all partials stacked</td><td>which way is steepest?</td><td>(−0.67, 0.67); (−18.67, −17.33) at 0</td><td>every training step</td></tr>
    <tr><td>Chain rule / backprop</td><td>product of local slopes</td><td>slope through nested functions?</td><td>house B net: −2, −12</td><td>any deep model</td></tr>
    <tr><td>Jacobian</td><td>gradients of many outputs, stacked</td><td>local slope of a vector function?</td><td>J = X; ∇L = Jᵀ·∂L/∂ŷ</td><td>backprop through layers</td></tr>
    <tr><td>Second derivative / Hessian</td><td>derivative of the gradient</td><td>how curved; how stretched?</td><td>L″ 9.33; H eig 18, 0.667; cond 27</td><td>step-size limits, Newton, diagnosis</td></tr>
    <tr><td>Critical point test</td><td>∇ = 0 + Hessian eigenvalue signs</td><td>is this flat point a minimum?</td><td>w = (2, 0), eigenvalues &gt; 0 → min</td><td>closed-form fits, understanding saddles</td></tr>
    <tr><td>Gradient check</td><td>central differences + relative error</td><td>is my gradient code right?</td><td>3e-12 correct; 0.5 when /n forgotten</td><td>new layers, custom losses</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>the derivative is "change in loss per nudge", and everything else is bookkeeping for doing that with many weights, through many layers, and twice.</strong> Many weights → stack slopes into a gradient. Many layers → multiply slopes along the chain (backprop, Jacobians). Twice → curvature (Hessian), which tells you whether a flat spot is a bottom and how big a step the valley allows. On our houses the gradient's zero is the normal-equation answer w = (2, 0), and the Hessian's 27 : 1 ratio is the narrow valley that <a class="xref" data-note="m_optimization">Optimization</a> must cross.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the revision sheet.</b> Everything above, condensed to one page.</div>

  <h2 id="mca-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: houses A, B, C with size x = [1, 2, 3], rooms [1, 3, 2], price y = [2, 4, 6]. One-weight model price = w·size, loss L(w) = mean((w·x − y)²) = (14/3)(w − 2)². Two-weight model price = w₁·size + w₂·rooms, X = [[1, 1], [2, 3], [3, 2]].</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On our houses</th><th>Weakness → next</th></tr>
    <tr><td>Derivative</td><td>how fast does the loss change per nudge?</td><td>gaps 1, 0.1, 0.01 → −4.67, −8.87, −9.29 → −9.33 at w = 1</td><td>slow, approximate → rules</td></tr>
    <tr><td>Rules</td><td>exact slope at every w?</td><td>per house −2, −8, −18 → mean −9.33; L′ = (28/3)(w − 2)</td><td>one weight only → gradient</td></tr>
    <tr><td>Partials, gradient</td><td>which way is downhill with many weights?</td><td>∇L(1, 1) = (−0.67, 0.67); ∇L(0, 0) = (−18.67, −17.33)</td><td>nested functions → chain rule</td></tr>
    <tr><td>Chain rule, Jacobian</td><td>slope through layers?</td><td>house B net: L = 1, ∂L/∂w₂ = −2, ∂L/∂w₁ = −12; J of Xw = X</td><td>says nothing about bend → Hessian</td></tr>
    <tr><td>Hessian</td><td>how curved; how stretched?</td><td>L″ = 9.33; H = (2/3)XᵀX, eig 18 &amp; 0.667, cond 27</td><td>is a flat point a bottom? → test</td></tr>
    <tr><td>Critical points</td><td>minimum, maximum or saddle?</td><td>∇ = 0 at (2, 0) = normal equations; eig &gt; 0 → min</td><td>is the formula right? → check</td></tr>
    <tr><td>Gradient check</td><td>is my gradient code correct?</td><td>rel. err 3e-12; forgot /n → 0.5</td><td>→ <a class="xref" data-note="m_optimization">Optimization</a></td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>Derivative</td><td>f′(x) = lim_{h→0} (f(x+h) − f(x))/h</td><td>h = gap; f′ also written df/dx</td></tr>
    <tr><td>Power, sum, chain</td><td>(xⁿ)′ = nxⁿ⁻¹; (f + g)′ = f′ + g′; f(g(x))′ = f′(g(x))·g′(x)</td><td>chain = rates multiply</td></tr>
    <tr><td>Exp, log, sigmoid, ReLU</td><td>(eˣ)′ = eˣ; (ln x)′ = 1/x; σ′ = σ(1 − σ) ≤ 0.25; ReLU′ = 1 if x &gt; 0 else 0</td><td>σ(z) = 1/(1 + e⁻ᶻ)</td></tr>
    <tr><td>MSE slope, one weight</td><td>L′(w) = (2/n)Σ(w·xᵢ − yᵢ)·xᵢ</td><td>average of 2 × error × input</td></tr>
    <tr><td>Gradient, linear model</td><td>∇L = (2/n)Xᵀ(Xw − y)</td><td>X (n × d) data, w weights, y targets</td></tr>
    <tr><td>Vector chain rule</td><td>∇_w L = Jᵀ ∇_ŷ L</td><td>J = ∂ŷ/∂w, (outputs × inputs); for ŷ = Xw, J = X</td></tr>
    <tr><td>Hessian</td><td>H[i, j] = ∂²L/∂wᵢ∂wⱼ; MSE: (2/n)XᵀX</td><td>eigenvalues = curvatures; cond = max/min</td></tr>
    <tr><td>Second-derivative test</td><td>∇L = 0 and eig(H) all &gt; 0 → min</td><td>all &lt; 0 → max; mixed → saddle</td></tr>
    <tr><td>Central difference, relative error</td><td>(f(x+h) − f(x−h))/2h; ‖a − b‖/(‖a‖ + ‖b‖)</td><td>h ≈ 1e-5; &lt; 1e-7 ok, &gt; 1e-2 bug</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Analytic gradient / autograd</b><p>Use for every training step: exact and costs about one backward pass.</p><small>Never replace it with finite differences in training</small></div>
    <div><b>Numerical gradient</b><p>Use once, to test a new layer or loss, in float64 with randomness off.</p><small>Avoid tiny h (rounding) and kinks (ReLU at 0)</small></div>
    <div><b>Closed form (∇ = 0)</b><p>Use when you can solve it: small linear models (normal equations).</p><small>Not possible for neural networks</small></div>
    <div><b>Hessian</b><p>Use to reason about curvature, step limits, saddles; Newton on small problems.</p><small>Too big to form for millions of weights</small></div>
    <div><b>ReLU</b><p>Use in hidden layers: slope 1 keeps the chain alive.</p><small>Watch for dead units (z ≤ 0 always)</small></div>
    <div><b>Sigmoid</b><p>Use at the output for probabilities.</p><small>Avoid stacking in deep hidden layers (vanishing gradients)</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Stepping along +∇L instead of −∇L; treating the derivative as global (it is local); forgetting /n (gradient n× too big); dead ReLUs and saturated sigmoids cutting the chain; reading a small gradient as "nearly at the minimum" in a narrow valley; assuming ∇ = 0 means a minimum (could be a saddle); training with numerical gradients; too-small h in finite differences.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>L(w) = (w − 5)². Slope at w = 2, and which way should w move?</td><td>2(2 − 5) = −6; increase w</td></tr>
    <tr><td>f(a, b) = 3a² + ab. Gradient at (1, 2)?</td><td>(6a + b, a) = (8, 1)</td></tr>
    <tr><td>y = (2w + 1)³. dy/dw at w = 0?</td><td>3(2w + 1)²·2 = 6</td></tr>
    <tr><td>At a zero-gradient point the Hessian eigenvalues are 4 and −1. What is it?</td><td>A saddle</td></tr>
    <tr><td>Gradient check gives relative error 0.5. Verdict?</td><td>A bug (e.g. a missing factor like /n); &gt; 1e-2 is always a bug</td></tr>
  </table>

  <h2 id="mca-qa"><span class="num">09</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you compute each idea on the three houses and explain why it exists, out loud, without notes?</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>For the houses, L(w) = (14/3)(w − 2)². What is the slope at w = 3, and which way should w move?</summary><div class="qa-body">L′(w) = (28/3)(w − 2), so L′(3) = 9.33. Positive: the loss rises as w grows, so decrease w, towards 2.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the gradient tell you, and why do we step in its negative direction?</summary><div class="qa-body">It's the vector of partial derivatives; it points where the function rises fastest, and its length is how fast. We minimise loss, so we step the opposite way: <code>w ← w − lr·∇L</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Derive the derivative of the sigmoid.</summary><div class="qa-body">σ = (1+e⁻ᶻ)⁻¹. Chain rule: σ′ = e⁻ᶻ/(1+e⁻ᶻ)² = σ · (e⁻ᶻ/(1+e⁻ᶻ)) = σ(1−σ). Maximum 0.25 at z = 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain backpropagation in two sentences.</summary><div class="qa-body">A forward pass computes and stores every intermediate value. The backward pass applies the chain rule from the loss back to each weight, multiplying local derivatives and reusing upstream gradients, so all gradients cost about one extra forward pass.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>In the house-B net (x = 2, y = 4, w₁ = 0.5, w₂ = 3, ReLU), what is ∂L/∂w₁ if w₁ = −0.5 instead?</summary><div class="qa-body">0. Then z = −1, ReLU outputs 0 and its slope is 0, so the chain is cut. w₁ gets no update: a dead ReLU for this input.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why do sigmoid networks suffer from vanishing gradients?</summary><div class="qa-body">Backprop multiplies one σ′ per layer, and σ′ ≤ 0.25 (≈0 when saturated). Ten layers gives at most 0.25¹⁰ ≈ 1e-6, so early layers barely learn. ReLU (slope 1), careful initialisation, normalisation and residual connections fix it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the Jacobian of a dense layer z = Wx with respect to x?</summary><div class="qa-body">W itself (shape out × in). Backprop multiplies the upstream gradient by its transpose: ∂L/∂x = Wᵀ ∂L/∂z. For our predictions ŷ = Xw (w as the input), the Jacobian is X.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does the Hessian tell you at a point where the gradient is zero?</summary><div class="qa-body">Its eigenvalues classify the point: all positive → local minimum, all negative → maximum, mixed → saddle. A large spread in magnitudes (our 18 vs 0.667) → long narrow valley, slow for gradient descent.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why don't we use Newton's method to train neural nets?</summary><div class="qa-body">It needs the Hessian: n² entries and an O(n³) solve. With 10⁸ weights that's impossible. It also heads toward saddles as happily as minima. We use first-order methods (SGD, Adam) that only need gradients.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you gradient-check a custom layer, and what h do you use?</summary><div class="qa-body">Compare autograd's gradient with central differences <code>(L(w+h) − L(w−h))/2h</code> for each parameter, using float64, h ≈ 1e-5, a tiny batch and no randomness. Relative error &lt; 1e-7 passes. Too-small h fails from rounding error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is the central difference better than the forward difference?</summary><div class="qa-body">Taylor expansion: the forward difference error is O(h); in the central version the second-order terms cancel, leaving O(h²). Our run: at h = 1e-5, 1.4e-5 vs 5.9e-11.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output? <code>f = lambda x: 3*x**2; print((f(2+1e-6) - f(2-1e-6)) / 2e-6)</code> </summary><div class="qa-body"><code>12.000000000789157</code>. The derivative of 3x² is 6x = 12 at x = 2; the tail digits are float rounding error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why is "set the gradient to zero" the same as the normal equations from Linear Algebra?</summary><div class="qa-body">For MSE on a linear model, ∇L = (2/n)Xᵀ(Xw − y). Setting it to zero gives Xᵀ(Xw − y) = 0, i.e. XᵀXw = Xᵀy. Linear algebra reached the same equation from geometry (the error must be perpendicular to every feature column). On the houses both give w = (2, 0).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does the gradient need the chain rule even for our simple linear model?</summary><div class="qa-body">The loss is a function of the error, and the error is a function of the weights: (w·x − y)². Power rule on the outside gives 2(w·x − y); the inside's slope in w is x; the chain rule multiplies them: 2(w·x − y)·x. In matrix form that same chain is ∇L = Jᵀ·∂L/∂ŷ with J = X. Backprop is this, repeated for every layer.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you ignore curvature and pick one learning rate from the slope alone?</summary><div class="qa-body">Our two-weight loss curves 18 along (1, 1) and 0.667 along (1, −1). A step that is safe in the steep direction (lr below 2/18 ≈ 0.11) crawls in the flat one; a step big enough for the flat one overshoots and diverges in the steep one. The slope can't warn you; the Hessian's eigenvalues (condition number 27) do. That is the problem momentum, Adam and feature scaling attack in Optimization.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: if numerical gradients are so simple and need no formula, why do we need the rules and backprop at all?</summary><div class="qa-body">Cost and accuracy. Numerical gradients need 2 loss evaluations per weight per step (2 million for a 1-million-weight model) and are only approximate. Rules plus backprop give the exact gradient for all weights in about one extra pass. The numerical method survives as the referee in gradient checking.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: the derivative is "local". How does that one fact shape the whole of training?</summary><div class="qa-body">The slope at w = 0 (−18.67) is only valid near 0; far away the slope is different (it is 0 at w = 2 and positive beyond). So you can't jump straight to the answer from one slope: you take a small step, re-measure, and repeat. That loop is gradient descent, and choosing the step size safely needs the curvature.</div></details>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="m_optimization">Optimization</a>.</b> The gradient says which way is down, but not how far to step, how to handle a million houses per step, how to cross the 27 : 1 narrow valley, or what to do when the loss has many valleys. Turning the gradient into a reliable training loop is optimization.</div>
</main>
`
});
