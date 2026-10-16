// notes/dl/dl_foundations.js — NN Foundations
Object.assign(TOPIC_CONTENT, {
  "dl_foundations": `<main>
  <h1>NN Foundations</h1>
  <p class="lead">A neural network is a machine that guesses, checks how wrong it was, and fixes itself a little, millions of times. This note opens that machine: one neuron, the forward pass, the loss, backprop, the optimizer step, and the tricks (regularization, batch norm, good init) that make deep nets train. Every number below is from a real PyTorch run. Builds on Mathematics → Calculus (chain rule) and Mathematics → Optimization (gradient descent).</p>

  <h2 id="df-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">NN Foundations</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Perceptron</div>
        <ul>
          <li><b>Neuron</b> — z = w·x + b, then an activation; 💡 a weighted vote with a pass mark</li>
          <li><b>Perceptron rule</b> — w ← w + α(y − ŷ)x; only works if one straight line can split the data</li>
          <li><b>One straight line</b> — solves AND/OR, never XOR</li>
          <li><b>Fix</b> — hidden layer + non-linearity → MLP solves XOR (4 hidden tanh units)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Forward pass</div>
        <ul>
          <li><b>Per layer</b> — zˡ = Wˡaˡ⁻¹ + bˡ, aˡ = σ(zˡ); a⁰ = x</li>
          <li><b>Shapes</b> — W is (out × in); batch X (B × in) → X Wᵀ (B × out)</li>
          <li>⚠ <b>No activations</b> → W₃W₂W₁ = one matrix; extra layers do nothing</li>
          <li>💡 An assembly line: each station changes the item and passes it on</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Activations</div>
        <ul>
          <li><b>ReLU</b> max(0,z) — slope 1 or 0; default for hidden layers; ⚠ dying ReLU → Leaky/GELU</li>
          <li><b>Sigmoid</b> (0,1) — max slope 0.25; only for yes/no outputs</li>
          <li><b>Tanh</b> (−1,1) — centred on 0, max slope 1; RNN gates</li>
          <li><b>GELU / SiLU</b> — smooth ReLU; Transformers, modern CNNs</li>
          <li><b>Softmax</b> — scores → probabilities that sum to 1; adding a constant changes nothing; output only</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Losses</div>
        <ul>
          <li><b>MSE</b> — regression; mean (ŷ − y)²; big errors hurt most</li>
          <li><b>Cross-entropy</b> — −log p(true class); p=0.9 → 0.105, p=0.01 → 4.6</li>
          <li><b>BCEWithLogits</b> — yes/no or multi-label; sigmoid built in</li>
          <li>⚠ <code>nn.CrossEntropyLoss</code> wants raw logits + integer labels; no softmax before it</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Backprop</div>
        <ul>
          <li><b>What</b> — chain rule run from the loss back to the inputs, reusing each step's result</li>
          <li><b>Local rule</b> — grad_in = grad_out × local slope</li>
          <li><b>Cost</b> — about one extra forward pass (≈2–3× compute), not one pass per weight</li>
          <li>💡 Tracing blame back through a chain of people</li>
          <li><b>Tiny net</b> — L=2.25 → dL/dw₁ = −9; one step at lr 0.05 → L=0.43</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Optimizers</div>
        <ul>
          <li><b>SGD</b> — w −= lr·g; zig-zags in narrow valleys</li>
          <li><b>Momentum</b> — keeps a running average of g; β=0.9; 💡 rolling ball</li>
          <li><b>RMSprop</b> — divide by √(avg g²); each weight gets its own step size</li>
          <li><b>Adam</b> — momentum + RMSprop + bias correction; lr 1e-3, β 0.9/0.999</li>
          <li><b>AdamW</b> — weight decay applied separately; Transformer default</li>
          <li>⚠ Adam is fast; SGD+momentum often does better on new data for CNNs</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Regularization</div>
        <ul>
          <li><b>L2</b> — +λΣw²; shrinks all weights; = weight_decay (SGD)</li>
          <li><b>L1</b> — +λΣ|w|; exact zeros (needs a soft-threshold step)</li>
          <li><b>Dropout p</b> — switch off random units in training, scale the rest by 1/(1−p); off in eval</li>
          <li>💡 Dropout = team where random members are absent each day; all learn to cover</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">BatchNorm</div>
        <ul>
          <li><b>Formula</b> — (z − μ_B)/√(σ²_B+ε), then γ·ẑ + β (learned)</li>
          <li><b>Train</b> — uses batch stats · <b>eval</b> — uses running averages</li>
          <li><b>Why</b> — smoother loss surface, higher lr OK, less init trouble, mild noise</li>
          <li><b>LayerNorm</b> — per sample; Transformers, small batches</li>
          <li>⚠ Batch size 1–4 → noisy stats · forgetting <code>model.eval()</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Gradients &amp; init</div>
        <ul>
          <li><b>Vanishing</b> — many factors &lt; 1 multiplied; sigmoid, 20 layers: 1e-13 at layer 1</li>
          <li><b>Exploding</b> — factors &gt; 1 → NaN; clip with <code>clip_grad_norm_</code></li>
          <li><b>Fixes</b> — ReLU, He/Xavier init, BatchNorm/LayerNorm, residuals, LSTM gates</li>
          <li><b>Xavier</b> Var = 2/(fan_in+fan_out) — tanh/sigmoid</li>
          <li><b>He</b> Var = 2/fan_in — ReLU; keeps signal size steady across depth</li>
          <li>⚠ <b>Zero / constant init</b> — all units stay identical forever</li>
          <li>💡 Photocopy of a photocopy: each copy fades a bit more</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="df-what"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">What a Network Learns</span><span class="rm-sub">Guess, check, fix, repeat</span></div></div>
      <div class="rm-item rm-done" data-target="df-perc"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Perceptron</span><span class="rm-sub">One neuron, one straight line</span></div></div>
      <div class="rm-item rm-done" data-target="df-fwd"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Forward Propagation</span><span class="rm-sub">Numbers flowing through layers</span></div></div>
      <div class="rm-item rm-done" data-target="df-act"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Activation Functions</span><span class="rm-sub">ReLU, sigmoid, tanh, softmax</span></div></div>
      <div class="rm-item rm-done" data-target="df-loss"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Loss Functions</span><span class="rm-sub">MSE and cross-entropy</span></div></div>
      <div class="rm-item rm-done" data-target="df-bp"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Backpropagation</span><span class="rm-sub">Chain rule on a tiny net</span></div></div>
      <div class="rm-item rm-done" data-target="df-opt"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Optimizers</span><span class="rm-sub">SGD, momentum, RMSprop, Adam</span></div></div>
      <div class="rm-item rm-done" data-target="df-reg"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">L1/L2 &amp; Dropout</span><span class="rm-sub">Fighting overfitting</span></div></div>
      <div class="rm-item rm-done" data-target="df-bn"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Batch Normalization</span><span class="rm-sub">Re-centre every layer</span></div></div>
      <div class="rm-item rm-done" data-target="df-vg"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Vanishing &amp; Exploding</span><span class="rm-sub">When gradients die or blow up</span></div></div>
      <div class="rm-item rm-done" data-target="df-init"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Weight Initialization</span><span class="rm-sub">Zero, Xavier, He</span></div></div>
      <div class="rm-item rm-done" data-target="df-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="df-what"><span class="num">01</span>What a Network Learns</h2>
  <p>A kirana shop sells 1 kg of sugar for ₹40, 2 kg for ₹80, 3 kg for ₹120. You are asked: what is the price per kg? You can see it is 40. A computer cannot "see" it. It has to find the number by trial and error.</p>
  <p>That trial and error is what every neural network does, from this toy to ChatGPT. The recipe has three moves, repeated again and again:</p>
  <div class="flow"><span>Guess a number</span><span>Measure how wrong the guess is</span><span>Nudge the number to reduce the wrongness</span><span>Repeat</span></div>
  <p>The number being guessed is called a <strong>weight</strong> (here, the price per kg). The "how wrong" score is called the <strong>loss</strong>. The direction and size of the nudge comes from the <strong>gradient</strong> (the slope: which way does the loss go down?). The nudge size is scaled by the <strong>learning rate</strong>, a small number like 0.05. Below, the weight starts at a wrong guess of 0.5 and the true answer is 2:</p>
  <div class="fx" data-lang="py">import torch
x = torch.tensor([1., 2., 3.]); y = torch.tensor([2., 4., 6.])   # hidden rule: y = 2x
w = torch.tensor(0.5, requires_grad=True)                        # first guess
for step in range(6):
    loss = ((w * x - y) ** 2).mean()      # 1. how wrong is the guess?
    loss.backward()                        # 2. which way should w move, and how much?
    print(f"step {step}: w {w.item():.3f}  loss {loss.item():.3f}  grad {w.grad.item():.3f}")
    with torch.no_grad():
        w -= 0.05 * w.grad                 # 3. nudge w a little the other way
        w.grad.zero_()</div>
  <div class="fx" data-lang="text">step 0: w 0.500  loss 10.500  grad -14.000
step 1: w 1.200  loss 2.987  grad -7.467
step 2: w 1.573  loss 0.850  grad -3.982
step 3: w 1.772  loss 0.242  grad -2.124
step 4: w 1.879  loss 0.069  grad -1.133
step 5: w 1.935  loss 0.020  grad -0.604</div>
  <p>Read the rows. The gradient is negative, which means "the loss goes down if w goes up". So w moves up: 0.5 → 1.2 → 1.57 → … and creeps toward 2. The loss falls from 10.5 to 0.02. Nobody told the program the answer was 2; it found it.</p>
  <p>A real network has millions of such weights instead of one, and the guess passes through many layers instead of one multiplication. But the loop is the same. The rest of this note explains each part of that loop properly: the neuron (02), how a guess is computed (03–04), how wrongness is measured (05), how the nudge direction is found for millions of weights at once (06), smarter ways to nudge (07), and how to stop the network from memorising instead of learning (08–11).</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Learning to bowl at a single stump. First ball: way off to the left. You do not start over; you adjust your arm a little to the right. Next ball: closer. After many balls you hit the stump. Your arm angle is the weight, the distance from the stump is the loss, and "a little to the right" is the gradient step.</p></div>

  <h2 id="df-perc"><span class="num">02</span>The Perceptron</h2>
  <p>A college gives admission if a student scores well enough overall, but it values maths twice as much as English. A student with maths 70 and English 60 gets a total of 2×70 + 1×60 = 200. If the pass mark is 180, the student is admitted. That little rule is a <strong>perceptron</strong>: the first and simplest artificial neuron.</p>
  <p>In words: take each input, multiply it by its importance (its <strong>weight</strong>), add everything up, add a fixed adjustment (the <strong>bias</strong>, which moves the pass mark), and say 1 if the total crosses zero, else 0. That last yes/no step is the <strong>activation</strong>.</p>
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
  </svg><figcaption>Left: inputs × weights, summed with the bias, then a yes/no step. Right: the four XOR points; try drawing one straight line that keeps red and green apart. It cannot be done.</figcaption></figure>
  <p>How does it learn the weights? After each example, if the answer was wrong, move each weight a little toward what would have made it right: <code>w ← w + α(y − ŷ)x</code>. Here y is the correct answer, ŷ is the guess, α is the learning rate. When the guess is right, y − ŷ = 0 and nothing moves.</p>
  <p>Test it on two tiny logic puzzles with two inputs (each 0 or 1). <strong>AND</strong> says 1 only when both inputs are 1. <strong>XOR</strong> says 1 when exactly one input is 1.</p>
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
  <p>AND is learnt perfectly. XOR is wrong even after 100 rounds, and it will never be right. Why: a perceptron can only draw one straight line and call one side "yes". In the picture above, the XOR "yes" points sit on opposite corners, so no single line separates them.</p>
  <p>The fix that started all of deep learning: put a small group of neurons in the middle (a <strong>hidden layer</strong>) and give each a bend (a non-linear activation, here tanh). The hidden neurons each draw their own line; the final neuron combines them. Now XOR is solved:</p>
  <div class="fx" data-lang="py">import torch.nn as nn, torch.nn.functional as F
torch.manual_seed(0)
y = torch.tensor([[0.],[1],[1],[0]])
net = nn.Sequential(nn.Linear(2, 4), nn.Tanh(), nn.Linear(4, 1))
opt = torch.optim.Adam(net.parameters(), lr=0.1)
for step in range(300):
    opt.zero_grad(); loss = F.binary_cross_entropy_with_logits(net(X), y); loss.backward(); opt.step()
print((net(X) &gt; 0).int().flatten().tolist(), round(loss.item(), 4))</div>
  <div class="fx" data-lang="text">[0, 1, 1, 0] 0.0003</div>
  <p>Output [0, 1, 1, 0] is exactly XOR, and the loss is almost zero. A network with at least one hidden layer is called a <strong>multi-layer perceptron (MLP)</strong>.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A neuron is a committee vote. Each input casts a weighted vote, the bias is the chairperson's own leaning, and the activation decides if the motion passes. Hidden layers are small sub-committees whose results feed the final vote. One committee can only say "total above the mark or not"; several sub-committees can express "exactly one of these two".</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Adding more layers <em>without</em> a bend between them does not help at all. Two straight-line rules combined are still one straight-line rule. The next section shows this.</p></div>

  <h2 id="df-fwd"><span class="num">03</span>Forward Propagation</h2>
  <p><strong>Forward propagation</strong> means: put the input numbers in at the left, and let them flow through the layers to the right until a prediction comes out. Each layer does the same three things: multiply by its weights, add its biases, apply the activation. The output of one layer is the input of the next.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A dosa stall: batter → spread on the tawa → add filling → fold. Each station changes the item and passes it on. The output of one station is the input of the next. Nothing goes backwards.</p>
  </div>
  <p>A tiny example you can follow by hand: 2 inputs, a hidden layer of 3 neurons, 1 output. Input x = (1, 2).</p>
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
  </svg><figcaption>Numbers flow left to right. The grey hidden neuron got a negative total (−0.5), so ReLU switched it off to 0; the two green ones stay on. Those three values feed the purple output neuron.</figcaption></figure>
  <p>Check the top hidden neuron by hand. Its weights are (0.5, −0.5) and its bias is 0: z = 0.5×1 + (−0.5)×2 + 0 = −0.5. ReLU (section 04) turns any negative number into 0, so this neuron outputs 0. The middle one: 1.0×1 + 0.5×2 + 0.5 = 2.5, stays 2.5. The code does the same for all three at once, then the output layer:</p>
  <div class="fx" data-lang="py">x  = torch.tensor([1.0, 2.0])
W1 = torch.tensor([[0.5, -0.5], [1.0, 0.5], [-1.0, 1.0]]); b1 = torch.tensor([0., 0.5, 0.])
W2 = torch.tensor([[1.0, -1.0, 0.5]]);                     b2 = torch.tensor([0.2])
z1 = W1 @ x + b1;  a1 = torch.relu(z1);  y_hat = W2 @ a1 + b2
print("z1", z1); print("a1", a1); print("y_hat", y_hat)</div>
  <div class="fx" data-lang="text">z1 tensor([-0.5000,  2.5000,  1.0000])
a1 tensor([0.0000, 2.5000, 1.0000])
y_hat tensor([0.0000, 2.5000, 1.0000])
y_hat tensor([-1.8000])</div>
  <p>Output: 1.0×0 + (−1.0)×2.5 + 0.5×1.0 + 0.2 = −1.8. That is the network's prediction for this input. In training, this prediction is compared with the correct answer to get the loss (section 05).</p>
  <p>The formal version, one layer at a time: <strong>zˡ = Wˡ aˡ⁻¹ + bˡ</strong> and <strong>aˡ = σ(zˡ)</strong>. Here l is the layer number, aˡ⁻¹ is the previous layer's output (a⁰ is the input x), Wˡ is the weight matrix with one row per neuron, bˡ is the bias vector, and σ is the activation. W has shape (neurons out × inputs in): W1 above is 3×2. With a batch of B examples stacked as rows, PyTorch computes X Wᵀ, giving B × out.</p>
  <div class="callout trap"><span class="label">Trap</span><p>Without activations, layers merge into one: W³(W²(W¹x)) = (W³W²W¹)x, a single multiplication. A 100-layer network with no bends is exactly as weak as a 1-layer one. (Checked: <code>(v @ A) @ B</code> equals <code>v @ (A @ B)</code> → <code>True</code>.) The bends are what let depth add power.</p></div>

  <h2 id="df-act"><span class="num">04</span>Activation Functions</h2>
  <p>An <strong>activation</strong> is a simple fixed function applied to each neuron's total z after the multiply-and-add. It is the "bend" that stops layers from collapsing into one (section 03). Three things matter about any activation: what range it outputs, how steep it is (its slope), and whether the slope ever becomes 0. Slope matters because learning signals travel backwards by multiplying slopes (section 06); a slope near 0 kills the signal.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>ReLU is a one-way valve: water (signal) passes if pushed forward, nothing passes if pushed back. Sigmoid is a dimmer switch that gets stuck near fully on or fully off; once stuck, turning the knob further changes almost nothing.</p>
  </div>
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
  </svg><figcaption>Solid blue = the activation's output for inputs from −4 to 4; dashed red = its slope. Sigmoid and tanh go flat at both ends (slope near 0). ReLU's slope is exactly 1 for every positive input and 0 for negatives.</figcaption></figure>
  <p>Feed the same five numbers (−3, −1, 0, 1, 3) through each activation and ask PyTorch for the slope at each point:</p>
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
  <p>What to notice: sigmoid's slope is at most 0.25, and at z = ±3 it is already 0.045. Tanh is better (max slope 1) but also dies at the ends (0.01). ReLU keeps slope 1 for all positive inputs, which is why it became the default. Leaky ReLU keeps a tiny slope (0.01) on the negative side so a neuron is never fully dead. GELU is a smooth version of ReLU used in Transformers.</p>
  <table class="tbl">
    <tr><th>Activation</th><th>Range</th><th>Use it for</th><th>Watch out</th></tr>
    <tr><td><strong>ReLU</strong> max(0, z)</td><td>[0, ∞)</td><td>Default hidden layer (CNNs, MLPs)</td><td>Dying ReLU: a unit stuck at z &lt; 0 gets zero gradient forever</td></tr>
    <tr><td><strong>Leaky ReLU / ELU</strong></td><td>(−∞, ∞)</td><td>When many units die</td><td>One more setting (the slope)</td></tr>
    <tr><td><strong>GELU / SiLU</strong></td><td>≈ (−0.17, ∞)</td><td>Transformers (BERT, GPT), modern CNNs</td><td>Slightly slower</td></tr>
    <tr><td><strong>Sigmoid</strong> 1/(1+e⁻ᶻ)</td><td>(0, 1)</td><td>Yes/no or multi-label output, gates</td><td>Goes flat at the ends; not centred on 0</td></tr>
    <tr><td><strong>Tanh</strong></td><td>(−1, 1)</td><td>RNN/LSTM state</td><td>Still goes flat at the ends</td></tr>
    <tr><td><strong>Softmax</strong></td><td>(0, 1), sums to 1</td><td>Multi-class output only</td><td>Never in hidden layers</td></tr>
  </table>
  <h3>Softmax: scores into probabilities</h3>
  <p>A classifier with 3 classes (cat, dog, cow) ends with 3 raw scores called <strong>logits</strong>, say (2.0, 1.0, 0.1). Raw scores are hard to read: is 2.0 "very sure"? <strong>Softmax</strong> converts them into probabilities that are all positive and add up to 1, so 2.0 becomes "66% cat". The rule: raise e to each score, then divide by the sum: <code>pᵢ = eᶻⁱ / Σⱼ eᶻʲ</code>. Because of the e, bigger scores get a bigger share, and the gap grows fast.</p>
  <div class="fx" data-lang="py">logits = torch.tensor([2.0, 1.0, 0.1])
print(torch.softmax(logits, 0).round(decimals=3), torch.softmax(logits, 0).sum().item())
print(torch.softmax(logits + 100, 0).round(decimals=3))</div>
  <div class="fx" data-lang="text">tensor([0.6590, 0.2420, 0.0990]) 1.0000001192092896
tensor([0.6590, 0.2420, 0.0990])</div>
  <p>Second line: adding 100 to every score changes nothing. Only the gaps between scores matter. Libraries use this to subtract the largest score before taking e, so the numbers never overflow.</p>
  <div class="callout trap"><span class="label">Trap</span><p>Softmax is for the output layer only. Inside the network it would force each layer's neurons to compete and sum to 1, throwing away information. Hidden layers use ReLU-type activations.</p></div>

  <h2 id="df-loss"><span class="num">05</span>Loss Functions</h2>
  <p>In section 01 "how wrong" was the squared gap between guess and truth. That is one choice of <strong>loss function</strong>: a formula that turns a prediction and the correct answer into one number, where 0 means perfect and bigger means worse. Training needs this single number because the gradient (section 06) is "the slope of the loss".</p>
  <p>Which formula to use depends on what the output is:</p>
  <div class="cards">
    <div><b>A number</b><p>Predicting house price, temperature, delivery time. Use <strong>MSE</strong>: mean of (ŷ − y)².</p><small>nn.MSELoss</small></div>
    <div><b>A number, but outliers exist</b><p><strong>MAE</strong> mean |ŷ − y|, or <strong>Huber</strong> (squared near 0, straight further out). Calm with outliers.</p><small>nn.L1Loss, nn.HuberLoss</small></div>
    <div><b>One class out of many</b><p>Cat/dog/cow. Use <strong>cross-entropy</strong>: −log of the probability given to the true class.</p><small>nn.CrossEntropyLoss (takes logits)</small></div>
    <div><b>Yes/no (or many yes/no labels)</b><p>Spam or not; a photo can be "beach" and "sunset". <strong>Binary cross-entropy</strong>: −[y log p + (1−y) log(1−p)].</p><small>nn.BCEWithLogitsLoss</small></div>
  </div>
  <p>MSE by hand: predictions (2.5, 0, 2), truth (3, −0.5, 2). Gaps: −0.5, 0.5, 0. Squared: 0.25, 0.25, 0. Mean: 0.5/3 = 0.1667. Squaring makes a gap of 2 cost four times a gap of 1, so big mistakes dominate.</p>
  <p>Cross-entropy by hand: the model says "cat" with probability 0.659 (from the softmax above) and the truth is cat. Loss = −log(0.659) = 0.417. If the truth had been cow (probability 0.099): −log(0.099) = 2.317. Being confidently wrong costs much more than being a bit unsure.</p>
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
  <p>The last four lines are the whole character of cross-entropy: 90% sure and right costs 0.105; 1% on the right answer costs 4.6, about 44 times more.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Cross-entropy is like negative marking in an entrance exam. A confident wrong answer costs much more than leaving it blank or saying "not sure". So the model learns to be sure only when it has reason to be.</p>
  </div>
  <div class="callout intu"><span class="label">Key insight</span><p>Why cross-entropy and not MSE for classification: with softmax or sigmoid in front, the cross-entropy gradient on the logits is simply <code>p − y</code> (predicted probability minus truth). It is large when the model is badly wrong and never goes flat. MSE through a sigmoid gets multiplied by the sigmoid's slope (≤ 0.25, near 0 at the ends), so a confidently wrong model learns very slowly. Bonus check: a model that knows nothing gives equal probabilities, so its loss is ln(number of classes): ln 3 ≈ 1.10, ln 2 ≈ 0.693. If your step-0 loss is far from that, something is wired wrong.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p><code>nn.CrossEntropyLoss</code> applies log-softmax itself. If you add a softmax layer at the end of your model and then feed it to this loss, the probabilities get squashed twice and training goes badly. Give it raw logits and integer class labels (0, 1, 2…), not one-hot vectors.</p></div>

  <h2 id="df-bp"><span class="num">06</span>Backpropagation</h2>
  <p>In section 01 there was one weight, and the gradient said how to nudge it. A real network has millions of weights. The slow way to find each one's gradient: change it slightly, rerun the whole network, see how the loss moves, repeat for every weight. Millions of forward passes per step. Impossible.</p>
  <p><strong>Backpropagation</strong> gets every gradient in about the cost of one extra pass. The idea: the loss sits at the right end of a chain of simple operations. Walk the chain backwards. At each box, ask "if my output moves by 1, how much does the loss move?" and multiply by "if my input moves by 1, how much does my output move?" (the box's own slope). That product is the answer for the box's input, and it is handed to the previous box. This is the chain rule from calculus, run from right to left.</p>
  <p>A tiny net where every step can be checked by hand: one input x = 2, true answer y = 3, two weights w₁ = 0.5 and w₂ = 1.5, biases 0. Forward: z = w₁x = 1, h = ReLU(z) = 1, ŷ = w₂h = 1.5, loss L = (ŷ − 3)² = 2.25.</p>
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
  </svg><figcaption>Black arrows carry values forward. Red arrows carry gradients back, right to left. Each box multiplies the gradient it receives by its own local slope and passes the result on.</figcaption></figure>
  <p>Walk the red arrows. The symbol ∂L/∂ŷ reads "how much L changes when ŷ changes a little".</p>
  <ul>
    <li>Loss box: L = (ŷ − 3)². Slope with respect to ŷ is 2(ŷ − 3) = 2(1.5 − 3) = <strong>−3</strong>. Negative: raising ŷ would lower the loss.</li>
    <li>Output box: ŷ = w₂h. Its slope with respect to h is w₂ = 1.5, so ∂L/∂h = −3 × 1.5 = <strong>−4.5</strong>. Its slope with respect to w₂ is h = 1, so ∂L/∂w₂ = −3 × 1 = <strong>−3</strong>. That is the first weight's gradient.</li>
    <li>ReLU box: z was positive, so its slope is 1. ∂L/∂z = −4.5 × 1 = <strong>−4.5</strong>.</li>
    <li>First box: z = w₁x. Slope with respect to w₁ is x = 2, so ∂L/∂w₁ = −4.5 × 2 = <strong>−9</strong>. Second weight's gradient.</li>
  </ul>
  <p>Both gradients are negative, so both weights should go up. PyTorch's autograd does exactly this walk and gets the same numbers:</p>
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
  <p>One nudge of size 0.05 × gradient on each weight took the loss from 2.25 to 0.43. Notice how the gradient −3 at the loss box was reused by every box to its left; nothing was recomputed. That reuse is why one backward pass gives every gradient for roughly twice the cost of a forward pass. The price: each box must remember its forward values (z, h) until the backward pass arrives. That memory is why training needs far more RAM than just predicting.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A team loses a cricket match by 20 runs. The captain asks which bowlers gave away extra runs; each bowler asks which overs went wrong; each over asks which balls. Blame flows back, split at each level by how much that part affected the result. A weight's gradient is its share of the blame.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>If ReLU's input z had been negative, its slope would be 0, and every gradient to its left would be 0 too: w₁ would never learn from this example. That is the "dying ReLU" problem from section 04 seen from the backward side.</p></div>

  <h2 id="df-opt"><span class="num">07</span>Optimizers</h2>
  <p>Backprop gives the gradient. The <strong>optimizer</strong> decides what to do with it. The plain rule from section 01, "weight −= learning rate × gradient", is called <strong>SGD</strong> (stochastic gradient descent; "stochastic" because each step uses a random small batch of data, not all of it).</p>
  <p>SGD has a weakness. Picture a loss surface shaped like a long narrow valley: steep walls on two sides, a gently sloping floor leading to the minimum. The gradient mostly points at the steep walls, so SGD bounces from wall to wall and only slowly drifts along the floor. A bigger learning rate makes it bounce harder, not move faster. The plot below is a real run on such a valley, f = ½(x² + 50y²), where y is 50 times steeper than x:</p>
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
  </svg><figcaption>First 30 steps of three optimizers from the same start. The grey ellipses are contour lines of the valley; the green dot is the minimum. Red SGD bounces between the walls and crawls. Blue momentum moves fast but overshoots. Green Adam glides in.</figcaption></figure>
  <p>Two fixes, which Adam combines:</p>
  <p><strong>Momentum</strong>: instead of using today's gradient alone, keep a running average of past gradients (a "velocity") and step along that. When gradients keep flipping sign (wall to wall), they cancel in the average. When they point the same way step after step (along the floor), they add up and the step grows. With β = 0.9, each step keeps 90% of the old velocity and adds the new gradient:</p>
  <div class="fx" data-lang="py">for name, grads in [("zig-zag", [1, -1, 1, -1, 1, -1]), ("steady", [1, 1, 1, 1, 1, 1])]:
    v, vs = 0.0, []
    for g in grads:
        v = 0.9 * v + g
        vs.append(round(v, 2))
    print(f"{name:8s} grads {grads}  velocity {vs}")</div>
  <div class="fx" data-lang="text">zig-zag  grads [1, -1, 1, -1, 1, -1]  velocity [1.0, -0.1, 0.91, -0.18, 0.84, -0.25]
steady   grads [1, 1, 1, 1, 1, 1]  velocity [1.0, 1.9, 2.71, 3.44, 4.1, 4.69]</div>
  <p>Zig-zag gradients give a velocity that stays small; steady ones build up to almost 5× a single gradient. That is the whole trick.</p>
  <p><strong>RMSprop</strong>: give each weight its own step size. Keep a running average of the <em>squared</em> gradient for each weight, and divide the step by its square root. A weight whose gradients are always huge (the steep wall) gets small steps; a weight with tiny gradients (the flat floor) gets its steps boosted. <strong>Adam</strong> = momentum for direction + RMSprop for per-weight step size, plus a small correction for the first few steps when the averages are still warming up.</p>
  <table class="tbl">
    <tr><th>Optimizer</th><th>Update (g = gradient, lr = learning rate)</th><th>Fixes</th></tr>
    <tr><td><strong>SGD</strong></td><td>w −= lr·g</td><td>Baseline; mini-batch noise helps find wide, flat minima</td></tr>
    <tr><td><strong>Momentum</strong></td><td>v = βv + g; w −= lr·v (β = 0.9)</td><td>Zig-zag cancels out; steady direction speeds up</td></tr>
    <tr><td><strong>RMSprop</strong></td><td>s = βs + (1−β)g²; w −= lr·g/(√s + ε)</td><td>Own step per weight: big steps where flat, small where steep</td></tr>
    <tr><td><strong>Adam</strong></td><td>m = β₁m + (1−β₁)g; s = β₂s + (1−β₂)g²; bias-correct; w −= lr·m̂/(√ŝ + ε)</td><td>Momentum + RMSprop; defaults lr 1e-3, β₁ 0.9, β₂ 0.999</td></tr>
    <tr><td><strong>AdamW</strong></td><td>Adam + w −= lr·λ·w applied separately</td><td>Weight decay that actually works with Adam</td></tr>
  </table>
  <p>In the table, v is the velocity, s is the running average of g², m is the running average of g, m̂ and ŝ are the warm-up-corrected versions, ε is a tiny number (1e-8) that stops division by zero, and λ is the weight-decay strength (section 08).</p>
  <table class="tbl out"><caption>Loss after 100 steps (same run as the plot; math in Mathematics → Optimization)</caption><tr><th>SGD lr 0.035</th><th>+ momentum 0.9</th><th>RMSprop lr 0.1</th><th>Adam lr 0.3</th></tr><tr><td>0.0257</td><td>0.00109</td><td>0.000071</td><td>0.000256</td></tr></table>
  <p>SGD's learning rate cannot go above 2/50 = 0.04 here or the steep direction blows up, so it is stuck crawling along the flat one. The adaptive methods give each direction its own step and finish hundreds of times lower.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>Walking downhill in fog. SGD: feel the slope under your feet, take one step, repeat. Momentum: a rolling ball that keeps its speed over small bumps and does not react to every pebble. RMSprop: you remember which directions were steep before and step carefully there, boldly elsewhere. Adam: both.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Adam is not always best. On image CNNs, well-tuned SGD + momentum with a cosine learning-rate schedule often generalises better (does better on new data). Transformers almost always use AdamW. With Adam, prefer AdamW over <code>Adam(weight_decay=…)</code>: the old form mixes the decay into the adaptive scaling and weakens it.</p></div>

  <h2 id="df-reg"><span class="num">08</span>Regularization: L1/L2 &amp; Dropout</h2>
  <p>A student who memorises last year's question paper word for word scores 100 on that paper and fails the real exam. A big network can do the same: with millions of weights it can memorise every training example, including the noise, and then do badly on new data. This is called <strong>overfitting</strong>. <strong>Regularization</strong> is any trick that makes memorising harder, so the network is forced to learn the general pattern instead. It usually costs a little accuracy on training data and gains more on new data.</p>
  <h3>L2 and L1: penalise big weights</h3>
  <p>The idea: add a penalty to the loss for having large weights. The network now has two goals, fit the data and keep weights small, and λ (lambda) sets how much the second goal matters. <strong>L2</strong> adds λ × (sum of squared weights); it shrinks every weight a bit but rarely to exactly zero. In optimizers this is the <code>weight_decay</code> setting. <strong>L1</strong> adds λ × (sum of absolute weights); it pulls with the same force whether a weight is big or small, so useless weights get pushed to exactly 0. That makes L1 a built-in feature selector.</p>
  <p>Example: 8 input features, but only the first 3 actually matter (true weights 3, −2, 1.5; the other 5 are pure noise). Train three ways:</p>
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
  <p>Compare the last five numbers in each row. No regularization leaves small junk values (−0.05, −0.02…). L2 shrinks everything a bit, including the real weights (3.05 → 2.73), but junk stays non-zero. L1 sets all 5 noise weights to exactly 0 and keeps the real ones almost intact. (Plain gradient steps on |w| only shake around 0; the exact zeros come from the soft-threshold step in the code, which is what Lasso solvers do.) Early stopping (stop training when validation loss stops improving) and data augmentation (flip, crop, add noise to training images) are other common regularizers.</p>

  <h3>Dropout</h3>
  <p>In a group project, if one strong student always does the work, the others learn nothing and the group fails when that student is absent. <strong>Dropout</strong> does the same to neurons: at every training step, a random share p of the neurons in a layer is switched off (output set to 0). Which ones changes every step. No neuron can rely on a specific partner always being there, so the network learns several independent ways to reach the answer.</p>
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
  </svg><figcaption>Left: during training the middle hidden neuron (dashed, ×) is switched off this step; next step a different one will be. Right: at test time every neuron is on.</figcaption></figure>
  <div class="fx" data-lang="py">drop = nn.Dropout(p=0.5); x = torch.ones(8)
drop.train(); print("train:", drop(x).tolist())
drop.eval();  print("eval: ", drop(x).tolist())</div>
  <div class="fx" data-lang="text">train: [2.0, 2.0, 0.0, 2.0, 2.0, 0.0, 2.0, 2.0]
eval:  [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]</div>
  <p>Eight inputs of 1.0 went in. In training mode two came out as 0 (dropped) and the rest as 2.0, not 1.0. Why doubled? With half the neurons off, the next layer would receive about half the usual total. Scaling the survivors by 1/(1−p) = 2 keeps the average total the same. This is called <strong>inverted dropout</strong>, and it means test time needs no adjustment: in eval mode everything passes through unchanged.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>An office where random people are on leave each day: everyone learns to cover others' work. On the big day the full team comes. The result behaves like an average of many smaller teams, a cheap ensemble.</p></div>
  <div class="callout trap"><span class="label">Trap</span><p>Dropout must be off when predicting. Forgetting <code>model.eval()</code> gives different answers for the same input every time you call the model. Typical p: 0.1–0.5 for fully connected layers; usually none inside modern CNNs, which rely on BatchNorm instead.</p></div>

  <h2 id="df-bn"><span class="num">09</span>Batch Normalization</h2>
  <p>Two school boards: one marks out of 100, the other out of 500. A score of 90 means very different things. Before comparing students you convert each score to "how far above the board's average, in units of its spread". That conversion is called <strong>standardising</strong>: subtract the mean, divide by the standard deviation (the typical distance from the mean).</p>
  <p>Inside a deep network the same problem appears at every layer. Layer 5's inputs are layer 4's outputs, and as layer 4's weights change during training, the scale and centre of what layer 5 receives keep shifting. Layer 5 is chasing a moving target. <strong>Batch normalization (BN)</strong> standardises each neuron's output over the current mini-batch, so the next layer always sees inputs centred near 0 with spread near 1. Then, so the network is not stuck with that fixed scale, BN multiplies by a learnable γ and adds a learnable β.</p>
  <div class="flow"><span>z (batch)</span><span>− μ_B</span><span>÷ √(σ²_B + ε)</span><span>× γ + β</span><span>activation</span></div>
  <p>μ_B is the batch mean, σ²_B the batch variance (spread squared), ε a tiny number so division never hits zero. Two input columns with very different scales (1–4 and 100–400) come out identical:</p>
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
  <p>Check column 1 by hand: mean of 1, 2, 3, 4 is 2.5; the value 1 is 1.5 below the mean; the spread is 1.118; 1.5/1.118 = 1.342. Column 2 is the same numbers times 100, so it standardises to the same result. The <code>weight</code> and <code>bias</code> parameters are γ and β.</p>
  <p>The <code>running_mean</code> line answers an important question: at test time you may predict for one example at a time, so there is no batch to take a mean over. BN therefore keeps a running average of the means and variances it saw during training (each batch moves it 10% of the way: 0 → 0.25 toward 2.5). In <code>eval()</code> mode these saved averages are used instead of batch statistics, so one sample always gives the same output.</p>
  <ul>
    <li><strong>Why it helps:</strong> a smoother loss surface, so higher learning rates work; much less sensitivity to bad initialization; a little helpful noise from batch-to-batch variation. (The original "internal covariate shift" explanation is debated, but the benefits are real.)</li>
    <li><strong>Placement:</strong> Linear or Conv → BN → ReLU. The layer before BN can drop its bias, since BN's β replaces it.</li>
    <li><strong>LayerNorm</strong> standardises across the features of one example instead of across the batch. It does not depend on batch size, so it is the choice for Transformers, RNNs and tiny batches.</li>
  </ul>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Every layer re-marks its outputs on a common scale ("how far above average") before handing them on, then learns its own preferred scale and offset (γ, β) on top.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span><p>Forgetting <code>model.eval()</code> at validation: BN uses the current batch's statistics and dropout stays on, so metrics are noisy and wrong. With tiny batches (1–4) batch statistics are useless; use LayerNorm or GroupNorm. Dropout right before BN changes its statistics between train and eval; put dropout after BN, or skip it (ResNets use BN without dropout).</p></div>

  <h2 id="df-vg"><span class="num">10</span>Vanishing &amp; Exploding Gradients</h2>
  <p>Section 06 showed the backward rule: each layer multiplies the gradient it receives by its own slope and passes it on. In a 20-layer network the gradient reaching layer 1 is a product of 20 such factors. Multiply 20 numbers that are each a bit below 1 and you get almost nothing: 0.25²⁰ ≈ 1e-12. Multiply 20 numbers a bit above 1 and you get something enormous. The first is the <strong>vanishing gradient</strong> problem: early layers get no learning signal and stay frozen. The second is <strong>exploding gradients</strong>: weights jump wildly and the loss becomes NaN.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A photocopy of a photocopy of a photocopy: after 20 copies the page is nearly blank (vanishing). A mic placed near its own speaker: a small sound feeds back and grows into a loud screech (exploding).</p>
  </div>
  <p>Sigmoid's slope is at most 0.25 (section 04), so a deep sigmoid network is the classic vanishing case. ReLU's slope is 1, so with sensible starting weights the signal survives:</p>
  <figure class="viz"><svg viewBox="0 0 560 160" width="560">
    <text x="10" y="20" class="tm">gradient reaching layer k of a 20-layer net (log scale)</text>
    <g font-size="12"><text x="10" y="55">sigmoid</text><text x="10" y="95">tanh</text><text x="10" y="135">ReLU + He</text></g>
    <rect x="100" y="42" width="19" height="18" class="fr sr"/><text x="126" y="56" class="tr">1.2e-13 at layer 1  (layer 20: 0.36)</text>
    <rect x="100" y="82" width="211" height="18" class="ft st"/><text x="318" y="96">0.027 (layer 20: 0.10)</text>
    <rect x="100" y="122" width="222" height="18" class="fg sg"/><text x="330" y="136">0.11 (layer 20: 0.74)</text>
  </svg><figcaption>Bar length = size of the gradient at layer 1 (log scale, so each equal step is 10×). With sigmoid, layer 1 receives a gradient 10¹³ times smaller than layer 20: it will never learn. ReLU with He init keeps it within one order of magnitude.</figcaption></figure>
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
  <p>The last two lines show the exploding case: starting weights that are too large (std 0.3) give a total gradient of 4 billion. <strong>Gradient clipping</strong> is the standard fix: if the overall gradient length exceeds a limit (here 1.0), shrink the whole gradient so its length is exactly that limit. The direction is kept; only the size is capped.</p>
  <table class="tbl">
    <tr><th>Symptom</th><th>Problem</th><th>Fixes</th></tr>
    <tr><td>Loss goes flat early; early layers' weights barely change</td><td>Vanishing</td><td>ReLU family, He/Xavier init (section 11), BatchNorm/LayerNorm, residual connections (CNN note), LSTM gates (RNN note)</td></tr>
    <tr><td>Loss jumps to inf or NaN</td><td>Exploding</td><td><code>clip_grad_norm_</code>, lower learning rate, proper init</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span><p>Gradient clipping goes <em>after</em> <code>loss.backward()</code> (the gradients must exist) and <em>before</em> <code>optimizer.step()</code> (the step must use the clipped values). With mixed precision, call <code>scaler.unscale_(opt)</code> first, or you clip scaled-up numbers.</p></div>

  <h2 id="df-init"><span class="num">11</span>Weight Initialization</h2>
  <p>Before training, every weight needs a starting value. The previous section showed that the wrong starting size makes the signal fade (std 0.01) or explode (std 0.3) before training even begins. <strong>Initialization</strong> is choosing the starting random values so that the signal stays about the same size as it passes through every layer.</p>
  <div class="callout anlg"><span class="label">Analogy</span><p>A chain of PA speakers down a long hall, each one re-amplifying the previous. Set each volume a bit too low and the far end hears silence; a bit too high and it screeches. Initialization is setting every speaker to exactly "pass it on at the same volume".</p></div>
  <p>Watch the spread (std) of the signal after each of 10 ReLU layers, 512 neurons wide, for four starting schemes:</p>
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
  <p>Only He init holds steady (0.83 → 0.79). Too small shrinks to 1e-9; too big grows to 1e12; Xavier slowly fades with ReLU. The schemes differ only in the variance (spread squared) of the random starting weights, chosen from the number of inputs to the layer (fan_in) and outputs (fan_out):</p>
  <table class="tbl">
    <tr><th>Scheme</th><th>Var(w)</th><th>Pair with</th></tr>
    <tr><td><strong>Zero / constant</strong></td><td>0</td><td>Never for weights (fine for biases)</td></tr>
    <tr><td><strong>Xavier / Glorot</strong></td><td>2 / (fan_in + fan_out)</td><td>tanh, sigmoid</td></tr>
    <tr><td><strong>He / Kaiming</strong></td><td>2 / fan_in</td><td>ReLU family (ReLU zeroes half the signal, so ×2 to make up)</td></tr>
  </table>
  <p><strong>Why not start all weights at zero, or all at the same number?</strong> Every neuron in a layer would then compute the same output, receive the same gradient, and make the same update. They would stay identical copies forever, so a layer of 4 neurons would be no better than 1. After 50 SGD steps from all-0.5 weights:</p>
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
  <p>Four rows, four hidden neurons, all exactly identical. Random init breaks this symmetry from the start.</p>
  <div class="callout trap"><span class="label">Trap</span><p><code>nn.Linear</code>'s default is <em>not</em> He init: it draws from U(±1/√fan_in), variance 1/(3·fan_in) (checked: max |w| for fan_in 256 = 0.0625). Fine for shallow nets; for deep plain ReLU stacks apply <code>nn.init.kaiming_normal_</code> yourself, e.g. with <code>model.apply(init_fn)</code>:</p></div>
  <div class="fx" data-lang="py">def init_weights(m):
    if isinstance(m, nn.Linear):
        nn.init.kaiming_normal_(m.weight, nonlinearity="relu")
        nn.init.zeros_(m.bias)
model = nn.Sequential(nn.Linear(256, 128), nn.ReLU(), nn.Linear(128, 10))
model.apply(init_weights)      # visits every submodule
print(round(model[0].weight.std().item(), 4), round((2 / 256) ** 0.5, 4))</div>
  <div class="fx" data-lang="text">0.0882 0.0884</div>
  <p>The measured weight std (0.0882) matches He's √(2/256) = 0.0884.</p>

  <h2 id="df-qa"><span class="num">12</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>In one line each: what are a weight, a loss, a gradient and a learning rate?</summary><div class="qa-body">Weight: a number the network adjusts to make better guesses. Loss: one number saying how wrong the current guesses are (0 = perfect). Gradient: the slope of the loss with respect to a weight, i.e. which way and how strongly to nudge it. Learning rate: the small multiplier that scales the nudge.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why can't a single perceptron learn XOR, and what fixes it?</summary><div class="qa-body">It draws one straight line (hyperplane); XOR's classes sit on opposite corners, so no line separates them. A hidden layer with a non-linear activation moves the points into a space where a line works, e.g. a 2-4-1 tanh MLP gets [0,1,1,0].</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is backpropagation and why is it efficient?</summary><div class="qa-body">The chain rule run from the loss back to the inputs. Each layer multiplies the incoming gradient by its local slope and passes it on, reusing work. All gradients cost about one extra forward pass, instead of one pass per weight. Price: storing the forward values in memory.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Tiny net: x=2, z=w₁x, h=ReLU(z), ŷ=w₂h, L=(ŷ−3)², w₁=0.5, w₂=1.5. What is ∂L/∂w₁?</summary><div class="qa-body">z=1, h=1, ŷ=1.5. ∂L/∂ŷ = 2(1.5−3) = −3. ∂L/∂h = −3·w₂ = −4.5. ReLU′(1)=1. ∂L/∂w₁ = −4.5·x = <strong>−9</strong>. Negative → increase w₁.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why ReLU over sigmoid in hidden layers?</summary><div class="qa-body">Sigmoid′ ≤ 0.25 and ≈ 0 at both ends; 20 layers multiply it down (layer-1 gradient 1e-13 in our run). ReLU′ = 1 for positive inputs, so gradients pass through without shrinking, and it is cheap. Downside: dying ReLU (fix: Leaky ReLU, GELU, sensible lr, He init).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why cross-entropy rather than MSE for classification?</summary><div class="qa-body">CE with softmax gives logit gradient p − y: large when badly wrong, never flat. MSE through sigmoid gets multiplied by σ′, so a confidently wrong prediction learns slowly. CE is also the maximum-likelihood loss for a class output.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain Adam in two lines. When would you pick SGD instead?</summary><div class="qa-body">Adam keeps an average of gradients (momentum, for direction) and of squared gradients (RMSprop, for a step size per weight), corrected for early steps. SGD + momentum with a schedule often does better on new data for image CNNs when you can tune it; AdamW is the default for Transformers.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>L1 vs L2 regularization: effect on weights?</summary><div class="qa-body">L2 (λΣw²) shrinks all weights in proportion, rarely to zero: smooth, stable. L1 (λΣ|w|) pulls with the same force always, pushing useless weights to exactly 0: built-in feature selection. In our run L1 zeroed all 5 noise weights; L2 kept them small but non-zero.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How does dropout behave at train vs inference time?</summary><div class="qa-body">Train: each unit switched off with prob p; the rest scaled by 1/(1−p) (inverted dropout). Inference (<code>model.eval()</code>): off, no scaling needed. Effect: like an ensemble of smaller nets; units can't depend on each other too much.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does BatchNorm do, and what changes in eval mode?</summary><div class="qa-body">Normalizes each feature over the batch to mean 0, std 1, then applies learnable γ, β. Allows higher lr, less trouble from init, mild regularization. In eval it uses running mean/var saved during training instead of batch stats, so the output doesn't depend on what else is in the batch.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your loss suddenly becomes NaN. What do you check?</summary><div class="qa-body">Exploding gradients (log the grad norm; add <code>clip_grad_norm_</code>), lr too high, bad init, log(0) or divide-by-zero in a custom loss (use <code>BCEWithLogitsLoss</code>/<code>CrossEntropyLoss</code>, add ε), NaNs in the input data, fp16 overflow (use GradScaler or bf16).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why not initialize all weights to zero? Why He for ReLU?</summary><div class="qa-body">Zero/constant weights make all units in a layer identical, with identical gradients, forever. He sets Var = 2/fan_in to make up for ReLU zeroing half the inputs, keeping the signal size steady across depth (0.83 → 0.79 over 10 layers vs 1e-9 with std 0.01).</div></details>
</main>`
});
