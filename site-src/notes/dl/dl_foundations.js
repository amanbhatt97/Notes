// notes/dl/dl_foundations.js — NN Foundations
Object.assign(TOPIC_CONTENT, {
  "dl_foundations": `<main>
  <h1>NN Foundations</h1>
  <p class="lead">What happens inside a neural network: one neuron, a forward pass, the loss, backprop, the optimizer step, and the tricks (regularization, batch norm, good init) that make deep nets train. Every number below comes from a real PyTorch run. Builds on Mathematics → Calculus (chain rule) and Mathematics → Optimization (gradient descent).</p>

  <h2 id="df-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">NN Foundations</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Perceptron</div>
        <ul>
          <li><b>Neuron</b> — z = w·x + b, then an activation; 💡 a weighted vote with a threshold</li>
          <li><b>Perceptron rule</b> — w ← w + α(y − ŷ)x; converges only if data is linearly separable</li>
          <li><b>Linear boundary</b> — solves AND/OR, never XOR</li>
          <li><b>Fix</b> — hidden layer + non-linearity → MLP solves XOR (4 hidden tanh units)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Forward pass</div>
        <ul>
          <li><b>Per layer</b> — zˡ = Wˡaˡ⁻¹ + bˡ, aˡ = σ(zˡ); a⁰ = x</li>
          <li><b>Shapes</b> — W is (out × in); batch X (B × in) → X Wᵀ (B × out)</li>
          <li>⚠ <b>No activations</b> → W₃W₂W₁ = one matrix; depth is wasted</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Activations</div>
        <ul>
          <li><b>ReLU</b> max(0,z) — grad 1 or 0; default hidden; ⚠ dying ReLU → Leaky/GELU</li>
          <li><b>Sigmoid</b> (0,1) — max grad 0.25; only binary output</li>
          <li><b>Tanh</b> (−1,1) — zero-centred, max grad 1; RNN gates</li>
          <li><b>GELU / SiLU</b> — smooth ReLU; Transformers / modern CNNs</li>
          <li><b>Softmax</b> — logits → probabilities summing to 1; shift-invariant; output only</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Losses</div>
        <ul>
          <li><b>MSE</b> — regression; mean (ŷ − y)²; punishes big errors</li>
          <li><b>Cross-entropy</b> — −log p(true class); p=0.9 → 0.105, p=0.01 → 4.6</li>
          <li><b>BCEWithLogits</b> — binary/multi-label; sigmoid built in</li>
          <li>⚠ <code>nn.CrossEntropyLoss</code> wants raw logits + int labels; no softmax before it</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Backprop</div>
        <ul>
          <li><b>What</b> — chain rule applied output → input, reusing upstream gradients</li>
          <li><b>Local rule</b> — grad_in = grad_out × local derivative</li>
          <li><b>Cost</b> — ≈ one forward pass (≈2–3× compute), not one pass per weight</li>
          <li>💡 tracing blame back through a chain of decisions</li>
          <li><b>Tiny net</b> — L=2.25 → dL/dw₁ = −9; one step at lr 0.05 → L=0.43</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Optimizers</div>
        <ul>
          <li><b>SGD</b> — w −= lr·g; zig-zags in ravines</li>
          <li><b>Momentum</b> — velocity = running avg of g; β=0.9; 💡 rolling ball</li>
          <li><b>RMSprop</b> — divide by √(avg g²); per-parameter step size</li>
          <li><b>Adam</b> — momentum + RMSprop + bias correction; lr 1e-3, β 0.9/0.999</li>
          <li><b>AdamW</b> — decoupled weight decay; Transformer default</li>
          <li>⚠ Adam fast, SGD+momentum often generalizes better on CNNs</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Regularization</div>
        <ul>
          <li><b>L2</b> — +λΣw²; shrinks all weights; = weight_decay (SGD)</li>
          <li><b>L1</b> — +λΣ|w|; exact zeros (needs proximal/coordinate solver)</li>
          <li><b>Dropout p</b> — zero units in train, scale survivors by 1/(1−p); off in eval</li>
          <li>💡 Dropout = training an ensemble of thinned nets</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">BatchNorm</div>
        <ul>
          <li><b>Formula</b> — (z − μ_B)/√(σ²_B+ε), then γ·ẑ + β (learned)</li>
          <li><b>Train</b> — batch stats; <b>eval</b> — running averages</li>
          <li><b>Why</b> — smoother loss surface, higher lr, less init sensitivity, mild noise</li>
          <li><b>LayerNorm</b> — per-sample; Transformers, small batches</li>
          <li>⚠ Batch size 1–4 → noisy stats; forgetting <code>model.eval()</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Gradients &amp; init</div>
        <ul>
          <li><b>Vanishing</b> — product of many factors &lt; 1; sigmoid 20 layers: 1e-13 at layer 1</li>
          <li><b>Exploding</b> — factors &gt; 1 → NaN; clip with <code>clip_grad_norm_</code></li>
          <li><b>Fixes</b> — ReLU, He/Xavier init, BatchNorm/LayerNorm, residuals, LSTM gates</li>
          <li><b>Xavier</b> Var = 2/(fan_in+fan_out) — tanh/sigmoid</li>
          <li><b>He</b> Var = 2/fan_in — ReLU; keeps activation std flat over depth</li>
          <li>⚠ <b>Zero / constant init</b> — all units identical forever (symmetry)</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="df-perc"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Perceptron</span><span class="rm-sub">One neuron, one straight line</span></div></div>
      <div class="rm-item rm-done" data-target="df-fwd"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Forward Propagation</span><span class="rm-sub">Numbers flowing through layers</span></div></div>
      <div class="rm-item rm-done" data-target="df-act"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Activation Functions</span><span class="rm-sub">ReLU, sigmoid, tanh, softmax</span></div></div>
      <div class="rm-item rm-done" data-target="df-loss"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Loss Functions</span><span class="rm-sub">MSE and cross-entropy</span></div></div>
      <div class="rm-item rm-done" data-target="df-bp"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Backpropagation</span><span class="rm-sub">Chain rule on a tiny net</span></div></div>
      <div class="rm-item rm-done" data-target="df-opt"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Optimizers</span><span class="rm-sub">SGD, momentum, RMSprop, Adam</span></div></div>
      <div class="rm-item rm-done" data-target="df-reg"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">L1/L2 &amp; Dropout</span><span class="rm-sub">Fighting overfitting</span></div></div>
      <div class="rm-item rm-done" data-target="df-bn"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Batch Normalization</span><span class="rm-sub">Re-centre every layer</span></div></div>
      <div class="rm-item rm-done" data-target="df-vg"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Vanishing &amp; Exploding</span><span class="rm-sub">When gradients die or blow up</span></div></div>
      <div class="rm-item rm-done" data-target="df-init"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Weight Initialization</span><span class="rm-sub">Zero, Xavier, He</span></div></div>
      <div class="rm-item rm-done" data-target="df-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="df-perc"><span class="num">01</span>The Perceptron</h2>
  <figure class="viz"><svg viewBox="0 0 600 195" width="600">
    <defs><marker id="df-ah1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <circle cx="30" cy="40" r="16" class="fb sb"/><text x="22" y="45">x₁</text>
    <circle cx="30" cy="125" r="16" class="fb sb"/><text x="22" y="130">x₂</text>
    <line x1="46" y1="45" x2="128" y2="78" stroke="currentColor" marker-end="url(#df-ah1)"/><text x="72" y="52" class="tm">w₁</text>
    <line x1="46" y1="120" x2="128" y2="92" stroke="currentColor" marker-end="url(#df-ah1)"/><text x="72" y="125" class="tm">w₂</text>
    <circle cx="155" cy="85" r="26" class="ft st"/><text x="137" y="82">Σ + b</text><text x="143" y="98" class="tm">= z</text>
    <line x1="181" y1="85" x2="218" y2="85" stroke="currentColor" marker-end="url(#df-ah1)"/>
    <rect x="220" y="65" width="56" height="40" rx="6" class="fv sb"/><text x="230" y="90">step</text>
    <line x1="276" y1="85" x2="306" y2="85" stroke="currentColor" marker-end="url(#df-ah1)"/><text x="310" y="90">ŷ ∈ {0,1}</text>
    <line x1="400" y1="150" x2="540" y2="150" stroke="currentColor" opacity="0.4"/><line x1="410" y1="160" x2="410" y2="20" stroke="currentColor" opacity="0.4"/>
    <circle cx="420" cy="140" r="7" class="fr sr"/><circle cx="520" cy="40" r="7" class="fr sr"/>
    <circle cx="420" cy="40" r="7" class="fg sg"/><circle cx="520" cy="140" r="7" class="fg sg"/>
    <line x1="440" y1="20" x2="540" y2="110" class="sr" stroke-dasharray="4 3"/>
    <text x="380" y="182" class="tm">XOR: no line splits red/green</text>
  </svg><figcaption>A perceptron is a weighted sum plus a threshold: it can only draw one straight line. XOR's corners can't be split by any line.</figcaption></figure>
  <p>The perceptron learns by nudging weights after each mistake: <code>w ← w + α(y − ŷ)x</code>. It fits AND, but never XOR.</p>
  <div class="fx" data-lang="py">import torch
def train_perceptron(X, y, epochs=10, lr=1.0):
    w = torch.zeros(2); b = 0.0
    for _ in range(epochs):
        for xi, yi in zip(X, y):
            pred = 1.0 if (w @ xi + b) &gt;= 0 else 0.0
            w += lr * (yi - pred) * xi          # move only when wrong
            b += lr * (yi - pred)
    return [(1 if (w @ xi + b) &gt;= 0 else 0) for xi in X]

X = torch.tensor([[0.,0],[0,1],[1,0],[1,1]])
print("AND", train_perceptron(X, torch.tensor([0.,0,0,1])))
print("XOR", train_perceptron(X, torch.tensor([0.,1,1,0]), epochs=100))</div>
  <div class="fx" data-lang="text">AND [0, 0, 0, 1]
XOR [1, 1, 0, 0]</div>
  <p>Add one hidden layer with a non-linearity and XOR is solved:</p>
  <div class="fx" data-lang="py">import torch.nn as nn, torch.nn.functional as F
torch.manual_seed(0)
y = torch.tensor([[0.],[1],[1],[0]])
net = nn.Sequential(nn.Linear(2, 4), nn.Tanh(), nn.Linear(4, 1))
opt = torch.optim.Adam(net.parameters(), lr=0.1)
for step in range(300):
    opt.zero_grad(); loss = F.binary_cross_entropy_with_logits(net(X), y); loss.backward(); opt.step()
print((net(X) &gt; 0).int().flatten().tolist(), round(loss.item(), 4))</div>
  <div class="fx" data-lang="text">[0, 1, 1, 0] 0.0003</div>
  <div class="callout anlg"><span class="label">Analogy</span><p>A neuron is a committee vote: each input casts a weighted vote, the bias is the chair's bias, and the activation decides if the motion passes. Hidden layers are sub-committees whose verdicts feed the final vote.</p></div>

  <h2 id="df-fwd"><span class="num">02</span>Forward Propagation</h2>
  <figure class="viz"><svg viewBox="0 0 560 220" width="560">
    <defs><marker id="df-ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g stroke="currentColor" opacity="0.35">
      <line x1="80" y1="75" x2="230" y2="45"/><line x1="80" y1="75" x2="230" y2="110"/><line x1="80" y1="75" x2="230" y2="175"/>
      <line x1="80" y1="145" x2="230" y2="45"/><line x1="80" y1="145" x2="230" y2="110"/><line x1="80" y1="145" x2="230" y2="175"/>
      <line x1="250" y1="45" x2="400" y2="110"/><line x1="250" y1="110" x2="400" y2="110"/><line x1="250" y1="175" x2="400" y2="110"/>
    </g>
    <circle cx="65" cy="75" r="18" class="fb sb"/><text x="58" y="80">1</text>
    <circle cx="65" cy="145" r="18" class="fb sb"/><text x="58" y="150">2</text>
    <circle cx="240" cy="45" r="20" class="fs" stroke="currentColor"/><text x="226" y="50">0.0</text>
    <circle cx="240" cy="110" r="20" class="fg sg"/><text x="226" y="115">2.5</text>
    <circle cx="240" cy="175" r="20" class="fg sg"/><text x="226" y="180">1.0</text>
    <circle cx="415" cy="110" r="22" class="fv sb"/><text x="398" y="115">−1.8</text>
    <text x="268" y="40" class="tm">z=−0.5 → ReLU → 0</text>
    <text x="30" y="210" class="tm">input x</text><text x="185" y="210" class="tm">hidden a¹ = ReLU(W¹x + b¹)</text><text x="380" y="160" class="tm">ŷ = W²a¹ + b²</text>
    <line x1="440" y1="110" x2="480" y2="110" stroke="currentColor" marker-end="url(#df-ah2)"/><text x="486" y="115">loss</text>
  </svg><figcaption>Each layer = matrix multiply, add bias, activation. Grey neuron is "off": its pre-activation was negative.</figcaption></figure>
  <div class="fx" data-lang="py">x  = torch.tensor([1.0, 2.0])
W1 = torch.tensor([[0.5, -0.5], [1.0, 0.5], [-1.0, 1.0]]); b1 = torch.tensor([0., 0.5, 0.])
W2 = torch.tensor([[1.0, -1.0, 0.5]]);                     b2 = torch.tensor([0.2])
z1 = W1 @ x + b1;  a1 = torch.relu(z1);  y_hat = W2 @ a1 + b2
print("z1", z1); print("a1", a1); print("y_hat", y_hat)</div>
  <div class="fx" data-lang="text">z1 tensor([-0.5000,  2.5000,  1.0000])
a1 tensor([0.0000, 2.5000, 1.0000])
y_hat tensor([-1.8000])</div>
  <div class="callout trap"><span class="label">Trap</span><p>Without activations, layers collapse: W³(W²(W¹x)) = (W³W²W¹)x, one linear map. A 100-layer linear net equals a 1-layer one. (Checked: <code>(v @ A) @ B</code> equals <code>v @ (A @ B)</code> → <code>True</code>.)</p></div>

  <h2 id="df-act"><span class="num">03</span>Activation Functions</h2>
  <figure class="viz"><svg viewBox="0 0 580 175" width="580">
    <g><line x1="10" y1="95" x2="170" y2="95" stroke="currentColor" opacity="0.3"/><line x1="90" y1="5" x2="90" y2="140" stroke="currentColor" opacity="0.3"/>
      <path d="M10,94 18,94 26,93 34,93 42,92 50,90 58,88 66,86 74,83 82,79 90,75 98,71 106,67 114,64 122,62 130,60 138,58 146,57 154,57 162,56 170,56" fill="none" class="sb" stroke-width="2.5"/>
      <path d="M10,94 26,93 42,92 50,91 58,89 66,88 74,86 82,85 90,85 98,85 106,86 114,88 122,89 130,91 138,92 154,93 170,94" fill="none" class="sr" stroke-width="1.5" stroke-dasharray="4 3"/>
      <text x="40" y="165">sigmoid</text><text x="100" y="80" class="tr" font-size="11">grad ≤ 0.25</text></g>
    <g transform="translate(195,0)"><line x1="10" y1="95" x2="170" y2="95" stroke="currentColor" opacity="0.3"/><line x1="90" y1="5" x2="90" y2="140" stroke="currentColor" opacity="0.3"/>
      <path d="M10,135 26,135 38,135 46,134 54,133 62,130 70,125 78,116 86,103 90,95 94,87 102,74 110,65 118,60 126,57 134,56 150,55 170,55" fill="none" class="sb" stroke-width="2.5"/>
      <path d="M10,95 30,95 46,93 54,91 62,86 70,78 78,67 86,57 90,55 94,57 102,67 110,78 118,86 126,91 134,93 150,95 170,95" fill="none" class="sr" stroke-width="1.5" stroke-dasharray="4 3"/>
      <text x="55" y="165">tanh</text><text x="104" y="48" class="tr" font-size="11">grad ≤ 1</text></g>
    <g transform="translate(390,0)"><line x1="10" y1="95" x2="170" y2="95" stroke="currentColor" opacity="0.3"/><line x1="90" y1="5" x2="90" y2="140" stroke="currentColor" opacity="0.3"/>
      <path d="M10,95 90,95 134,7" fill="none" class="sb" stroke-width="2.5"/>
      <path d="M10,96 90,96 M90,55 170,55" fill="none" class="sr" stroke-width="1.5" stroke-dasharray="4 3"/>
      <text x="55" y="165">ReLU</text><text x="128" y="70" class="tr" font-size="11">grad 1</text><text x="20" y="112" class="tr" font-size="11">grad 0</text></g>
  </svg><figcaption>Solid = activation, dashed red = its gradient (x from −4 to 4). Sigmoid and tanh gradients die at both ends; ReLU's is 1 for every positive input.</figcaption></figure>
  <div class="fx" data-lang="py">z = torch.tensor([-3., -1., 0., 1., 3.], requires_grad=True)
for name, f in [("sigmoid", torch.sigmoid), ("tanh", torch.tanh), ("relu", torch.relu),
                ("leaky", lambda t: F.leaky_relu(t, 0.01)), ("gelu", F.gelu)]:
    out = f(z); g, = torch.autograd.grad(out.sum(), z)
    print(f"{name:8s} out {[round(v,3) for v in out.tolist()]}  grad {[round(v,3) for v in g.tolist()]}")</div>
  <div class="fx" data-lang="text">sigmoid  out [0.047, 0.269, 0.5, 0.731, 0.953]  grad [0.045, 0.197, 0.25, 0.197, 0.045]
tanh     out [-0.995, -0.762, 0.0, 0.762, 0.995]  grad [0.01, 0.42, 1.0, 0.42, 0.01]
relu     out [0.0, 0.0, 0.0, 1.0, 3.0]  grad [0.0, 0.0, 0.0, 1.0, 1.0]
leaky    out [-0.03, -0.01, 0.0, 1.0, 3.0]  grad [0.01, 0.01, 0.01, 1.0, 1.0]
gelu     out [-0.004, -0.159, 0.0, 0.841, 2.996]  grad [-0.012, -0.083, 0.5, 1.083, 1.012]</div>
  <table class="tbl">
    <tr><th>Activation</th><th>Range</th><th>Use it for</th><th>Watch out</th></tr>
    <tr><td><strong>ReLU</strong></td><td>[0, ∞)</td><td>Default hidden layer (CNNs, MLPs)</td><td>Dying ReLU: unit stuck at z &lt; 0 gets zero gradient forever</td></tr>
    <tr><td><strong>Leaky ReLU / ELU</strong></td><td>(−∞, ∞)</td><td>When many units die</td><td>Extra hyperparameter (slope)</td></tr>
    <tr><td><strong>GELU / SiLU</strong></td><td>≈ (−0.17, ∞)</td><td>Transformers (BERT, GPT), modern CNNs</td><td>Slightly costlier</td></tr>
    <tr><td><strong>Sigmoid</strong></td><td>(0, 1)</td><td>Binary / multi-label output, gates</td><td>Saturates; not zero-centred</td></tr>
    <tr><td><strong>Tanh</strong></td><td>(−1, 1)</td><td>RNN/LSTM state</td><td>Still saturates</td></tr>
    <tr><td><strong>Softmax</strong></td><td>(0, 1), sums to 1</td><td>Multi-class output only</td><td>Never in hidden layers</td></tr>
  </table>
  <p><strong>Softmax</strong> turns logits into probabilities: <code>pᵢ = eᶻⁱ / Σⱼ eᶻʲ</code>. Adding a constant to all logits changes nothing (frameworks subtract the max for stability).</p>
  <div class="fx" data-lang="py">logits = torch.tensor([2.0, 1.0, 0.1])
print(torch.softmax(logits, 0).round(decimals=3), torch.softmax(logits, 0).sum().item())
print(torch.softmax(logits + 100, 0).round(decimals=3))</div>
  <div class="fx" data-lang="text">tensor([0.6590, 0.2420, 0.0990]) 1.0000001192092896
tensor([0.6590, 0.2420, 0.0990])</div>

  <h2 id="df-loss"><span class="num">04</span>Loss Functions</h2>
  <div class="cards">
    <div><b>MSE</b><p>mean (ŷ − y)². Regression. Squares big errors → outlier-sensitive.</p><small>nn.MSELoss</small></div>
    <div><b>MAE / Huber</b><p>mean |ŷ − y|, or quadratic near 0 + linear tails. Robust to outliers.</p><small>nn.L1Loss, nn.HuberLoss</small></div>
    <div><b>Cross-entropy</b><p>−log p(true class). Multi-class. Punishes confident wrong answers hard.</p><small>nn.CrossEntropyLoss (logits)</small></div>
    <div><b>Binary CE</b><p>−[y log p + (1−y) log(1−p)]. Binary or multi-label.</p><small>nn.BCEWithLogitsLoss</small></div>
  </div>
  <div class="fx" data-lang="py">pred, target = torch.tensor([2.5, 0.0, 2.0]), torch.tensor([3.0, -0.5, 2.0])
print("MSE", F.mse_loss(pred, target).item(), "MAE", F.l1_loss(pred, target).item())
logits = torch.tensor([[2.0, 1.0, 0.1]])
print("CE", round(F.cross_entropy(logits, torch.tensor([0])).item(), 4),
      " -log p0 =", round(-torch.log_softmax(logits, 1)[0, 0].item(), 4))
print("CE if true class is 2:", round(F.cross_entropy(logits, torch.tensor([2])).item(), 4))
for p in [0.9, 0.5, 0.1, 0.01]:
    print(f"p_true={p}: CE={-torch.log(torch.tensor(p)).item():.3f}")</div>
  <div class="fx" data-lang="text">MSE 0.1666666716337204 MAE 0.3333333432674408
CE 0.417  -log p0 = 0.417
CE if true class is 2: 2.317
p_true=0.9: CE=0.105
p_true=0.5: CE=0.693
p_true=0.1: CE=2.303
p_true=0.01: CE=4.605</div>
  <div class="callout intu"><span class="label">Key insight</span><p>Why CE, not MSE, for classification: with softmax/sigmoid, the CE gradient w.r.t. logits is simply <code>p − y</code>, so it never saturates. MSE through a sigmoid multiplies by σ′ ≤ 0.25 and learns slowly when confidently wrong. A random 3-class guess gives CE = ln 3 ≈ 1.10, a handy sanity check for step-0 loss.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>nn.CrossEntropyLoss</code> applies log-softmax itself. Feeding it softmax outputs double-squashes and trains badly. Feed raw logits and integer class labels.</p></div>

  <h2 id="df-bp"><span class="num">05</span>Backpropagation</h2>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
    <defs><marker id="df-ah3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker>
    <marker id="df-ah3r" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tr"/></marker></defs>
    <rect x="10" y="60" width="80" height="44" rx="6" class="fb sb"/><text x="22" y="80">w₁x + b₁</text><text x="22" y="97" class="tm">z = 1</text>
    <rect x="140" y="60" width="70" height="44" rx="6" class="ft st"/><text x="152" y="80">ReLU</text><text x="152" y="97" class="tm">h = 1</text>
    <rect x="260" y="60" width="90" height="44" rx="6" class="fb sb"/><text x="270" y="80">w₂h + b₂</text><text x="270" y="97" class="tm">ŷ = 1.5</text>
    <rect x="400" y="60" width="100" height="44" rx="6" class="fv sb"/><text x="410" y="80">(ŷ − 3)²</text><text x="410" y="97" class="tm">L = 2.25</text>
    <line x1="90" y1="72" x2="138" y2="72" stroke="currentColor" marker-end="url(#df-ah3)"/>
    <line x1="210" y1="72" x2="258" y2="72" stroke="currentColor" marker-end="url(#df-ah3)"/>
    <line x1="350" y1="72" x2="398" y2="72" stroke="currentColor" marker-end="url(#df-ah3)"/>
    <line x1="398" y1="94" x2="352" y2="94" class="sr" marker-end="url(#df-ah3r)"/>
    <line x1="258" y1="94" x2="212" y2="94" class="sr" marker-end="url(#df-ah3r)"/>
    <line x1="138" y1="94" x2="92" y2="94" class="sr" marker-end="url(#df-ah3r)"/>
    <text x="400" y="130" class="tr">∂L/∂ŷ = 2(1.5−3) = −3</text>
    <text x="250" y="150" class="tr">∂L/∂h = −3 · w₂ = −4.5</text>
    <text x="250" y="168" class="tr">∂L/∂w₂ = −3 · h = −3</text>
    <text x="10" y="150" class="tr">∂L/∂z = −4.5 · 1 = −4.5</text>
    <text x="10" y="168" class="tr">∂L/∂w₁ = −4.5 · x = −9</text>
    <text x="10" y="35" class="tm">x = 2, y = 3, w₁ = 0.5, b₁ = 0, w₂ = 1.5, b₂ = 0</text>
    <text x="460" y="35" class="tm">forward →</text><text x="510" y="98" class="tr">← backward</text>
  </svg><figcaption>Black arrows carry values forward; red arrows carry gradients back. Each box multiplies the incoming gradient by its own local derivative.</figcaption></figure>
  <p>Backprop is the chain rule (see Mathematics → Calculus) run from the loss backwards, reusing each upstream gradient. Autograd confirms the hand numbers:</p>
  <div class="fx" data-lang="py">x, y = torch.tensor(2.0), torch.tensor(3.0)
w1 = torch.tensor(0.5, requires_grad=True); b1 = torch.tensor(0.0, requires_grad=True)
w2 = torch.tensor(1.5, requires_grad=True); b2 = torch.tensor(0.0, requires_grad=True)
z = w1 * x + b1; h = torch.relu(z); y_hat = w2 * h + b2; L = (y_hat - y) ** 2
L.backward()
print("z", z.item(), "h", h.item(), "y_hat", y_hat.item(), "L", L.item())
print("dL/dw2", w2.grad.item(), "dL/db2", b2.grad.item(), "dL/dw1", w1.grad.item(), "dL/db1", b1.grad.item())
with torch.no_grad():
    for p in (w1, b1, w2, b2): p -= 0.05 * p.grad          # one SGD step
    print("after one step, loss =", ((w2 * torch.relu(w1 * x + b1) + b2 - y) ** 2).item())</div>
  <div class="fx" data-lang="text">z 1.0 h 1.0 y_hat 1.5 L 2.25
dL/dw2 -3.0 dL/db2 -3.0 dL/dw1 -9.0 dL/db1 -4.5
after one step, loss = 0.4306640625</div>
  <p>One backward pass yields every gradient at ~2× forward cost. Each layer needs only the gradient from above plus values saved in the forward pass, which is why training uses far more memory than inference.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A bad quarterly result: the CEO traces blame to the managers' reports, each manager to their analysts' data. Every link gets blame in proportion to how much it influenced the next. The gradient is each weight's share of the blame.</p></div>

  <h2 id="df-opt"><span class="num">06</span>Optimizers</h2>
  <figure class="viz"><svg viewBox="0 0 540 220" width="540">
    <ellipse cx="380" cy="110" rx="60" ry="16" fill="none" stroke="currentColor" opacity="0.25"/>
    <ellipse cx="380" cy="110" rx="170" ry="45" fill="none" stroke="currentColor" opacity="0.25"/>
    <ellipse cx="380" cy="110" rx="340" ry="90" fill="none" stroke="currentColor" opacity="0.25"/>
    <circle cx="380" cy="110" r="4" class="fg sg"/><circle cx="60" cy="35" r="4" stroke="currentColor" fill="none"/>
    <polyline points="60,35 71,166 82,68 92,142 103,86 112,128 122,97 131,120 139,102 148,116 156,106 164,113 171,108 179,112 186,109 192,111 199,109 205,111 211,110 217,110 223,110 229,110 234,110 239,110 244,110 249,110 253,110 258,110 262,110 266,110 270,110" fill="none" class="sr" stroke-width="1.8"/>
    <polyline opacity="0.75" points="60,35 71,166 92,186 121,71 156,36 195,134 237,180 280,99 322,45 362,110 398,169 430,119 458,59 479,95 495,154 506,130 511,73 511,86 506,139 498,136 486,88 471,83 455,126 438,136 421,99 403,85 387,116 372,134 359,108 348,88 339,108" fill="none" class="sb" stroke-width="1.8"/>
    <polyline points="60,35 72,57 84,79 96,100 108,118 120,133 132,142 143,146 155,146 167,143 178,137 189,129 201,121 212,112 222,105 233,98 244,93 254,90 264,89 274,90 283,93 292,97 301,101 310,106 318,111 326,116 333,119 340,121 347,122 354,122 360,121" fill="none" class="sg" stroke-width="2.2"/>
    <text x="40" y="25" class="tm">start</text><text x="372" y="100" class="tg">min</text>
    <text x="20" y="212" class="tr">SGD: zig-zag</text><text x="190" y="212" class="tb">Momentum: overshoots</text><text x="400" y="212" class="tg">Adam: smooth</text>
  </svg><figcaption>Real first 30 steps on a long narrow valley f = ½(x² + 50y²). SGD bounces across the steep wall and crawls along the flat floor.</figcaption></figure>
  <table class="tbl">
    <tr><th>Optimizer</th><th>Update (g = gradient)</th><th>Fixes</th></tr>
    <tr><td><strong>SGD</strong></td><td>w −= lr·g</td><td>Baseline; mini-batch noise helps find flat minima</td></tr>
    <tr><td><strong>Momentum</strong></td><td>v = βv + g; w −= lr·v (β = 0.9)</td><td>Zig-zag cancels, consistent direction accelerates</td></tr>
    <tr><td><strong>RMSprop</strong></td><td>s = βs + (1−β)g²; w −= lr·g/(√s + ε)</td><td>Per-parameter step: big steps in flat directions, small in steep</td></tr>
    <tr><td><strong>Adam</strong></td><td>m = β₁m + (1−β₁)g; s = β₂s + (1−β₂)g²; bias-correct; w −= lr·m̂/(√ŝ + ε)</td><td>Momentum + RMSprop; lr 1e-3, β₁ 0.9, β₂ 0.999</td></tr>
    <tr><td><strong>AdamW</strong></td><td>Adam + w −= lr·λ·w applied separately</td><td>Weight decay that actually works with Adam</td></tr>
  </table>
  <table class="tbl out"><caption>Loss after 100 steps (same run as the plot; math in Mathematics → Optimization)</caption><tr><th>SGD lr 0.035</th><th>+ momentum 0.9</th><th>RMSprop lr 0.1</th><th>Adam lr 0.3</th></tr><tr><td>0.0257</td><td>0.00109</td><td>0.000071</td><td>0.000256</td></tr></table>
  <p>SGD's lr is capped by the steep direction (lr &gt; 2/50 diverges), so it crawls along the flat one. Adaptive methods rescale each direction.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Walking downhill in fog. SGD: feel the slope, step. Momentum: a rolling ball that keeps its speed over bumps. RMSprop: a map of how rough each direction is, so you step carefully where steep. Adam: both.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Adam is not always best. On image CNNs, tuned SGD + momentum + cosine schedule often generalizes better. Transformers use AdamW. With Adam, prefer AdamW over <code>Adam(weight_decay=…)</code>, which folds decay into the adaptive scaling and weakens it.</p></div>

  <h2 id="df-reg"><span class="num">07</span>Regularization: L1/L2 &amp; Dropout</h2>
  <p>Big nets can memorize training data. Regularization limits that, trading a little training fit for better test fit.</p>
  <p><strong>L2</strong> (+λΣw², = <code>weight_decay</code>) shrinks all weights; <strong>L1</strong> (+λΣ|w|) zeroes useless ones. Early stopping and data augmentation also regularize. 8 features, only the first 3 matter (true weights 3, −2, 1.5):</p>
  <div class="fx" data-lang="py">torch.manual_seed(0)
n, d = 200, 8
X = torch.randn(n, d); w_true = torch.zeros(d); w_true[:3] = torch.tensor([3., -2., 1.5])
y = X @ w_true + 0.5 * torch.randn(n)
lr = 0.05
for name in ["none", "L2", "L1"]:
    w = torch.zeros(d, requires_grad=True)
    for _ in range(1000):
        loss = F.mse_loss(X @ w, y)
        if name == "L2": loss = loss + 0.1 * (w ** 2).sum()
        loss.backward()
        with torch.no_grad():
            w -= lr * w.grad; w.grad.zero_()
            if name == "L1":   # proximal step = soft-threshold (what Lasso solvers do)
                w.copy_(torch.sign(w) * torch.clamp(w.abs() - lr * 0.1, min=0))
    print(f"{name:5s}", [round(v, 2) + 0.0 for v in w.tolist()])</div>
  <div class="fx" data-lang="text">none  [3.05, -1.96, 1.47, -0.05, -0.02, 0.0, -0.01, 0.0]
L2    [2.73, -1.77, 1.34, -0.06, -0.03, 0.02, -0.01, 0.01]
L1    [2.99, -1.91, 1.42, 0.0, 0.0, 0.0, 0.0, 0.0]</div>
  <p>L2 shrinks everything a bit; L1 sets the 5 noise weights to exactly 0. (Plain gradient steps on |w| only jitter around 0; exact zeros need the soft-threshold step.)</p>

  <h3>Dropout</h3>
  <figure class="viz"><svg viewBox="0 0 520 150" width="520">
    <g stroke="currentColor" opacity="0.3"><line x1="40" y1="40" x2="130" y2="30"/><line x1="40" y1="40" x2="130" y2="110"/><line x1="40" y1="110" x2="130" y2="30"/><line x1="40" y1="110" x2="130" y2="110"/><line x1="140" y1="30" x2="220" y2="75"/><line x1="140" y1="110" x2="220" y2="75"/></g>
    <circle cx="35" cy="40" r="12" class="fb sb"/><circle cx="35" cy="110" r="12" class="fb sb"/>
    <circle cx="135" cy="30" r="12" class="fg sg"/><circle cx="135" cy="70" r="12" class="fs" stroke="currentColor" stroke-dasharray="3 2"/><circle cx="135" cy="110" r="12" class="fg sg"/>
    <text x="129" y="75" class="tr">×</text><circle cx="225" cy="75" r="12" class="fv sb"/>
    <text x="60" y="145" class="tm">train: random thinned net</text>
    <g transform="translate(280,0)"><g stroke="currentColor" opacity="0.3"><line x1="40" y1="40" x2="130" y2="30"/><line x1="40" y1="40" x2="130" y2="70"/><line x1="40" y1="40" x2="130" y2="110"/><line x1="40" y1="110" x2="130" y2="30"/><line x1="40" y1="110" x2="130" y2="70"/><line x1="40" y1="110" x2="130" y2="110"/><line x1="140" y1="30" x2="220" y2="75"/><line x1="140" y1="70" x2="220" y2="75"/><line x1="140" y1="110" x2="220" y2="75"/></g>
    <circle cx="35" cy="40" r="12" class="fb sb"/><circle cx="35" cy="110" r="12" class="fb sb"/>
    <circle cx="135" cy="30" r="12" class="fg sg"/><circle cx="135" cy="70" r="12" class="fg sg"/><circle cx="135" cy="110" r="12" class="fg sg"/><circle cx="225" cy="75" r="12" class="fv sb"/>
    <text x="80" y="145" class="tm">eval: all units on</text></g>
  </svg><figcaption>No unit can rely on a specific partner, so features become redundant and robust.</figcaption></figure>
  <div class="fx" data-lang="py">drop = nn.Dropout(p=0.5); x = torch.ones(8)
drop.train(); print("train:", drop(x).tolist())
drop.eval();  print("eval: ", drop(x).tolist())</div>
  <div class="fx" data-lang="text">train: [2.0, 2.0, 0.0, 2.0, 2.0, 0.0, 2.0, 2.0]
eval:  [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]</div>
  <p>PyTorch uses <strong>inverted dropout</strong>: survivors are scaled by 1/(1−p) = 2 during training, so eval needs no rescaling and the expected value matches.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A team where random members call in sick each day: everyone learns to cover others' work. At test time the full team shows up, which is like averaging many thinned sub-networks (a cheap ensemble).</p></div>

  <h2 id="df-bn"><span class="num">08</span>Batch Normalization</h2>
  <div class="flow"><span>z (batch)</span><span>− μ_B</span><span>÷ √(σ²_B + ε)</span><span>× γ + β</span><span>activation</span></div>
  <p>Per feature, standardize over the mini-batch, then let the net re-scale with learnable γ (weight) and β (bias). Two columns with wildly different scales come out identical:</p>
  <div class="fx" data-lang="py">bn = nn.BatchNorm1d(2)
xb = torch.tensor([[1., 100.], [2., 200.], [3., 300.], [4., 400.]])
bn.train(); out = bn(xb)
print(out.detach().round(decimals=3))
print("mean", out.mean(0).detach().round(decimals=3), "std", out.std(0, unbiased=False).detach().round(decimals=3))
print("running_mean", bn.running_mean, "running_var", bn.running_var.round(decimals=2))
print("params:", [n for n, _ in bn.named_parameters()], " buffers:", [n for n, _ in bn.named_buffers()])</div>
  <div class="fx" data-lang="text">tensor([[-1.3420, -1.3420],
        [-0.4470, -0.4470],
        [ 0.4470,  0.4470],
        [ 1.3420,  1.3420]])
mean tensor([0., 0.]) std tensor([1., 1.])
running_mean tensor([ 0.2500, 25.0000]) running_var tensor([1.0700e+00, 1.6676e+03])
params: ['weight', 'bias']  buffers: ['running_mean', 'running_var', 'num_batches_tracked']</div>
  <p>Running stats move 10% toward each batch (momentum 0.1): 0 → 0.25 for mean 2.5. In <code>eval()</code> these running averages replace batch stats, so one sample gives a deterministic output.</p>
  <ul>
    <li><strong>Why it helps:</strong> smoother loss surface → higher lr works, less init sensitivity, mild regularizing noise. (The original "internal covariate shift" story is disputed.)</li>
    <li><strong>Placement:</strong> Linear/Conv → BN → ReLU; the preceding layer can drop its bias. <strong>LayerNorm</strong> normalizes per sample instead → Transformers, RNNs, tiny batches.</li>
  </ul>
  <div class="callout trap"><span class="label">Trap</span><p>Forgetting <code>model.eval()</code> at validation: BN uses the current batch's stats and dropout stays on, so metrics are noisy and wrong. With tiny batches (1–4) batch stats are garbage; use LayerNorm or GroupNorm. Dropout right before BN shifts its statistics between train and eval; put dropout after, or skip it (ResNets use BN without dropout).</p></div>

  <h2 id="df-vg"><span class="num">09</span>Vanishing &amp; Exploding Gradients</h2>
  <figure class="viz"><svg viewBox="0 0 560 160" width="560">
    <text x="10" y="20" class="tm">gradient reaching layer k of a 20-layer net (log scale)</text>
    <g font-size="12"><text x="10" y="55">sigmoid</text><text x="10" y="95">tanh</text><text x="10" y="135">ReLU + He</text></g>
    <rect x="100" y="42" width="19" height="18" class="fr sr"/><text x="126" y="56" class="tr">1.2e-13 at layer 1  (layer 20: 0.36)</text>
    <rect x="100" y="82" width="211" height="18" class="ft st"/><text x="318" y="96">0.027 (layer 20: 0.10)</text>
    <rect x="100" y="122" width="222" height="18" class="fg sg"/><text x="330" y="136">0.11 (layer 20: 0.74)</text>
  </svg><figcaption>Backprop multiplies one factor per layer. Factors below 1 (sigmoid′ ≤ 0.25) shrink the signal geometrically; early layers stop learning.</figcaption></figure>
  <div class="fx" data-lang="py">def deep(act, init, depth=20):
    layers = []
    for _ in range(depth):
        lin = nn.Linear(64, 64); init(lin.weight); nn.init.zeros_(lin.bias)
        layers += [lin, act()]
    return nn.Sequential(*layers, nn.Linear(64, 1))
torch.manual_seed(0); x = torch.randn(128, 64)
for name, act, init in [("sigmoid+Xavier", nn.Sigmoid, nn.init.xavier_normal_),
                        ("tanh+Xavier", nn.Tanh, nn.init.xavier_normal_),
                        ("relu+He", nn.ReLU, lambda w: nn.init.kaiming_normal_(w, nonlinearity="relu"))]:
    torch.manual_seed(0); net = deep(act, init)
    net(x).pow(2).mean().backward()
    print(f"{name:15s} layer1 grad={net[0].weight.grad.norm():.2e}  layer20 grad={net[-3].weight.grad.norm():.2e}")

torch.manual_seed(0); net = deep(nn.ReLU, lambda w: nn.init.normal_(w, std=0.3))   # too-large init
net(x).pow(2).mean().backward()
total = nn.utils.clip_grad_norm_(net.parameters(), max_norm=1.0)
print(f"std=0.3 init: grad norm before clip {total:.2e}")
print(f"after clip: {torch.sqrt(sum(p.grad.norm()**2 for p in net.parameters())):.3f}")</div>
  <div class="fx" data-lang="text">sigmoid+Xavier  layer1 grad=1.20e-13  layer20 grad=3.55e-01
tanh+Xavier     layer1 grad=2.75e-02  layer20 grad=1.02e-01
relu+He         layer1 grad=1.12e-01  layer20 grad=7.39e-01
std=0.3 init: grad norm before clip 3.93e+09
after clip: 1.000</div>
  <p><strong>Vanishing</strong> (early layers frozen, loss plateaus) → ReLU-family, He/Xavier init, BatchNorm/LayerNorm, residual connections, LSTM gates. <strong>Exploding</strong> (loss → inf/NaN) → <code>clip_grad_norm_</code> (rescales the whole gradient vector), lower lr, proper init.</p>
  <div class="callout trap"><span class="label">Trap</span><p>Gradient clipping goes <em>after</em> <code>loss.backward()</code> and <em>before</em> <code>optimizer.step()</code>. With mixed precision, unscale first (<code>scaler.unscale_(opt)</code>).</p></div>

  <h2 id="df-init"><span class="num">10</span>Weight Initialization</h2>
  <p>Goal: keep activation variance about the same at every layer, so the signal neither fades nor blows up before training even starts. 10 ReLU layers, 512 wide:</p>
  <div class="fx" data-lang="py">x = torch.randn(1000, 512)
for name, init in [("std=0.01", lambda w: nn.init.normal_(w, std=0.01)),
                   ("std=1.0",  lambda w: nn.init.normal_(w, std=1.0)),
                   ("Xavier",   nn.init.xavier_normal_),
                   ("He",       lambda w: nn.init.kaiming_normal_(w, nonlinearity="relu"))]:
    torch.manual_seed(0); h = x; stds = []
    for i in range(10):
        W = torch.empty(512, 512); init(W); h = torch.relu(h @ W.T); stds.append(h.std().item())
    print(f"{name:9s} layer1={stds[0]:.3g} layer5={stds[4]:.3g} layer10={stds[9]:.3g}")</div>
  <div class="fx" data-lang="text">std=0.01  layer1=0.132 layer5=8.36e-05 layer10=8.73e-09
std=1.0   layer1=13.2 layer5=8.36e+05 layer10=8.73e+11
Xavier    layer1=0.585 layer5=0.141 layer10=0.0248
He        layer1=0.827 layer5=0.798 layer10=0.794</div>
  <table class="tbl">
    <tr><th>Scheme</th><th>Var(w)</th><th>Pair with</th></tr>
    <tr><td><strong>Zero / constant</strong></td><td>0</td><td>Never for weights (fine for biases)</td></tr>
    <tr><td><strong>Xavier / Glorot</strong></td><td>2 / (fan_in + fan_out)</td><td>tanh, sigmoid</td></tr>
    <tr><td><strong>He / Kaiming</strong></td><td>2 / fan_in</td><td>ReLU family (ReLU zeroes half the signal, so ×2)</td></tr>
  </table>
  <p><strong>Why not zeros or a constant:</strong> every unit in a layer computes the same thing, gets the same gradient, and stays identical forever. After 50 SGD steps from all-0.5 weights:</p>
  <div class="fx" data-lang="py">net = nn.Sequential(nn.Linear(3, 4), nn.Tanh(), nn.Linear(4, 1))
for p in net.parameters(): nn.init.constant_(p, 0.5)
opt = torch.optim.SGD(net.parameters(), lr=0.1)
X, y = torch.randn(32, 3), torch.randn(32, 1)
for _ in range(50):
    opt.zero_grad(); F.mse_loss(net(X), y).backward(); opt.step()
print(net[0].weight.data.round(decimals=3))</div>
  <div class="fx" data-lang="text">tensor([[0.4740, 0.4720, 0.4530],
        [0.4740, 0.4720, 0.4530],
        [0.4740, 0.4720, 0.4530],
        [0.4740, 0.4720, 0.4530]])</div>
  <p>Four hidden units, one distinct feature. Random init breaks the symmetry.</p>
  <div class="callout trap"><span class="label">Trap</span><p><code>nn.Linear</code>'s default is <em>not</em> He init: it draws from U(±1/√fan_in), variance 1/(3·fan_in) (checked: max |w| for fan_in 256 = 0.0625). Fine for shallow nets; for deep plain ReLU stacks call <code>nn.init.kaiming_normal_</code> yourself, e.g. via <code>model.apply(init_fn)</code>.</p></div>
  <div class="fx" data-lang="py">def init_weights(m):
    if isinstance(m, nn.Linear):
        nn.init.kaiming_normal_(m.weight, nonlinearity="relu")
        nn.init.zeros_(m.bias)
model = nn.Sequential(nn.Linear(256, 128), nn.ReLU(), nn.Linear(128, 10))
model.apply(init_weights)      # visits every submodule
print(round(model[0].weight.std().item(), 4), round((2 / 256) ** 0.5, 4))</div>
  <div class="fx" data-lang="text">0.0882 0.0884</div>
  <p>Measured weight std matches He's √(2/256).</p>

  <h2 id="df-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't a single perceptron learn XOR, and what fixes it?</summary><div class="qa-body">It draws one straight line (hyperplane); XOR's classes sit on opposite corners, so no line separates them. A hidden layer with a non-linear activation maps inputs into a space where they are separable, e.g. a 2-4-1 tanh MLP gets [0,1,1,0].</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is backpropagation and why is it efficient?</summary><div class="qa-body">The chain rule applied from the loss back to the inputs. Each layer multiplies the incoming gradient by its local derivative and passes it on, reusing work. All gradients cost about one extra forward pass, instead of one pass per weight. Price: storing forward activations.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Tiny net: x=2, z=w₁x, h=ReLU(z), ŷ=w₂h, L=(ŷ−3)², w₁=0.5, w₂=1.5. What is ∂L/∂w₁?</summary><div class="qa-body">z=1, h=1, ŷ=1.5. ∂L/∂ŷ = 2(1.5−3) = −3. ∂L/∂h = −3·w₂ = −4.5. ReLU′(1)=1. ∂L/∂w₁ = −4.5·x = <strong>−9</strong>. Negative → increase w₁.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why ReLU over sigmoid in hidden layers?</summary><div class="qa-body">Sigmoid′ ≤ 0.25 and ≈0 at both tails; 20 layers multiply it down (layer-1 gradient 1e-13 in our run). ReLU′ = 1 for positive inputs, so gradients pass through unshrunk, and it is cheap. Downside: dying ReLU (fix: Leaky ReLU, GELU, sane lr, He init).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why cross-entropy rather than MSE for classification?</summary><div class="qa-body">CE with softmax gives logit gradient p − y: large when confidently wrong, never saturating. MSE through sigmoid multiplies by σ′, so a confidently wrong prediction learns slowly. CE is also the maximum-likelihood loss for a categorical output.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain Adam in two lines. When would you pick SGD instead?</summary><div class="qa-body">Adam keeps an average of gradients (momentum, direction) and of squared gradients (RMSprop, per-parameter step size), bias-corrected for early steps. SGD + momentum with a schedule often generalizes better for image CNNs when you can tune it; AdamW is the default for Transformers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>L1 vs L2 regularization: effect on weights?</summary><div class="qa-body">L2 (λΣw²) shrinks all weights proportionally, rarely to zero: smooth, stable. L1 (λΣ|w|) applies a constant pull, driving irrelevant weights to exactly 0: sparse, built-in feature selection. In our run L1 zeroed all 5 noise weights; L2 kept them small but non-zero.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does dropout behave at train vs inference time?</summary><div class="qa-body">Train: each unit zeroed with prob p; survivors scaled by 1/(1−p) (inverted dropout). Inference (<code>model.eval()</code>): off, no scaling needed. Effect: an implicit ensemble of thinned networks; prevents co-adaptation.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does BatchNorm do, and what changes in eval mode?</summary><div class="qa-body">Normalizes each feature over the batch to mean 0, std 1, then applies learnable γ, β. Allows higher lr, reduces init sensitivity, adds mild regularization. In eval it uses running mean/var collected in training instead of batch stats, so outputs are deterministic and independent of batch composition.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your loss suddenly becomes NaN. What do you check?</summary><div class="qa-body">Exploding gradients (log grad norm; add <code>clip_grad_norm_</code>), too-high lr, bad init, log(0) or division by zero in a custom loss (use <code>BCEWithLogitsLoss</code>/<code>CrossEntropyLoss</code>, add ε), NaNs in the input data, fp16 overflow (use GradScaler or bf16).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why not initialize all weights to zero? Why He for ReLU?</summary><div class="qa-body">Zero/constant weights make units in a layer identical, with identical gradients, forever (symmetry never breaks). He sets Var = 2/fan_in to compensate for ReLU zeroing half the inputs, keeping activation std flat across depth (0.83 → 0.79 over 10 layers vs 1e-9 with std 0.01).</div></details>
  main>`
});
